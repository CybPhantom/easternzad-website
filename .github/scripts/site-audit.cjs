const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..', '..');
const errors = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.name === '.git' || entry.name === 'node_modules') return [];
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function findElements(source, tagName) {
  const lower = source.toLowerCase();
  const openToken = `<${tagName}`;
  const closeToken = `</${tagName}`;
  const elements = [];
  let cursor = 0;

  while (cursor < source.length) {
    let openStart = lower.indexOf(openToken, cursor);
    while (openStart !== -1) {
      const next = lower[openStart + openToken.length];
      if (next === '>' || /\s/.test(next)) break;
      openStart = lower.indexOf(openToken, openStart + openToken.length);
    }
    if (openStart === -1) break;
    const openEnd = lower.indexOf('>', openStart + openToken.length);
    if (openEnd === -1) break;

    let closeStart = lower.indexOf(closeToken, openEnd + 1);
    while (closeStart !== -1) {
      const next = lower[closeStart + closeToken.length];
      if (next === '>' || /\s/.test(next)) break;
      closeStart = lower.indexOf(closeToken, closeStart + closeToken.length);
    }
    if (closeStart === -1) break;
    const closeEnd = lower.indexOf('>', closeStart + closeToken.length);
    if (closeEnd === -1) break;

    elements.push({
      openingTag: source.slice(openStart, openEnd + 1),
      content: source.slice(openEnd + 1, closeStart),
      start: openStart,
      end: closeEnd + 1
    });
    cursor = closeEnd + 1;
  }
  return elements;
}

function withoutElements(source, tagNames) {
  const ranges = tagNames
    .flatMap((tagName) => findElements(source, tagName))
    .sort((left, right) => left.start - right.start);
  let output = '';
  let cursor = 0;
  for (const range of ranges) {
    output += source.slice(cursor, range.start);
    cursor = Math.max(cursor, range.end);
  }
  return output + source.slice(cursor);
}

const files = walk(root);
const relative = (file) => path.relative(root, file).replaceAll('\\', '/');
const textFiles = files.filter((file) => !/\.(?:png|jpe?g|webp|gif|ico|woff2?)$/i.test(file));

const forbiddenNames = /(^|\/)(?:\.env(?:\..*)?|.*\.(?:pem|key|pfx|p12|sqlite|sqlite3|db|bak|log))$/i;
for (const file of files) {
  if (forbiddenNames.test(relative(file))) errors.push(`Sensitive or unnecessary file tracked: ${relative(file)}`);
}

const secretPatterns = [
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
  [/\bgh[opusr]_[A-Za-z0-9_]{30,}\b/, 'GitHub token'],
  [/\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/, 'API key']
];
const privateOperationsHost = ['ops', 'easternzad', 'com'].join('.');
for (const file of textFiles) {
  const value = fs.readFileSync(file, 'utf8');
  for (const [pattern, label] of secretPatterns) {
    if (pattern.test(value)) errors.push(`${label} pattern found in ${relative(file)}`);
  }
  if (value.toLowerCase().includes(privateOperationsHost)) {
    errors.push(`Private operations hostname exposed in ${relative(file)}`);
  }
}

for (const file of files.filter((name) => name.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  const scripts = findElements(html, 'script');
  const markup = withoutElements(html, ['script', 'style']);
  const name = relative(file);
  const csp = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i)?.[1] || '';
  if (!csp) errors.push(`Missing CSP: ${name}`);
  if (!/script-src-attr 'none'/.test(csp)) errors.push(`CSP does not block script attributes: ${name}`);
  const scriptSrc = csp.match(/(?:^|;\s*)script-src\s+([^;]+)/)?.[1] || '';
  if (scriptSrc.includes("'unsafe-inline'")) errors.push(`Unsafe inline scripts allowed: ${name}`);
  for (const script of scripts) {
    const normalized = script.content.replace(/\r\n?/g, '\n');
    const hash = `'sha256-${crypto.createHash('sha256').update(normalized, 'utf8').digest('base64')}'`;
    if (!scriptSrc.includes(hash)) errors.push(`CSP hash is stale or missing in ${name}`);
  }
  for (const script of scripts.filter((item) => item.openingTag.toLowerCase().includes('application/ld+json'))) {
    try {
      JSON.parse(script.content);
    } catch {
      errors.push(`Invalid JSON-LD in ${name}`);
    }
  }
  if (!/<meta\s+name="referrer"\s+content="strict-origin-when-cross-origin"/i.test(html)) {
    errors.push(`Missing strict referrer policy: ${name}`);
  }
  if (/\son[a-z]+\s*=/i.test(markup)) errors.push(`Inline event handler found: ${name}`);
  if (/(?:href|src)\s*=\s*["']\s*javascript:/i.test(markup)) errors.push(`javascript: URL found: ${name}`);

  for (const match of markup.matchAll(/<a\b([^>]*\btarget="_blank"[^>]*)>/gi)) {
    if (!/\brel="[^"]*\bnoopener\b[^"]*\bnoreferrer\b[^"]*"/i.test(match[1])) {
      errors.push(`Unsafe target="_blank" link: ${name}`);
    }
  }

  const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  for (const id of new Set(ids.filter((id, index) => ids.indexOf(id) !== index))) {
    errors.push(`Duplicate id "${id}": ${name}`);
  }

  for (const match of markup.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    const url = match[1];
    let candidate = url;
    let baseDir = path.dirname(file);
    if (/^https:\/\/(?:www\.)?easternzad\.com\//i.test(url)) {
      candidate = new URL(url).pathname.replace(/^\//, '');
      baseDir = root;
    } else if (/^(?:https?:|mailto:|tel:|data:|#|\/\/)/i.test(url)) {
      continue;
    }
    const clean = decodeURIComponent(candidate.split('#')[0].split('?')[0]);
    if (!clean) continue;
    const target = path.resolve(baseDir, clean);
    const exists = fs.existsSync(target)
      || fs.existsSync(`${target}.html`)
      || (fs.existsSync(target) && fs.statSync(target).isDirectory() && fs.existsSync(path.join(target, 'index.html')));
    if (!exists) errors.push(`Missing local target "${url}" in ${name}`);
  }
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const url of ['https://easternzad.com/faq.html', 'https://easternzad.com/faq-en.html']) {
  if (!sitemap.includes(url)) errors.push(`Sitemap missing ${url}`);
}
JSON.parse(fs.readFileSync(path.join(root, 'geo.json'), 'utf8'));

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}
console.log(`Site audit passed: ${files.filter((name) => name.endsWith('.html')).length} HTML pages checked.`);
