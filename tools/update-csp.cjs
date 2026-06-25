const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

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
      contentEnd: closeStart,
      end: closeEnd + 1
    });
    cursor = closeEnd + 1;
  }
  return elements;
}

for (const file of walk(root).filter((name) => name.endsWith('.html'))) {
  let html = fs.readFileSync(file, 'utf8');

  if (html.includes('id="langBtn"') && html.includes('onclick="toggleLang()"')) {
    html = html.replace(/\s+onclick="toggleLang\(\)"/g, '');
    const scripts = findElements(html, 'script')
      .filter((script) => !script.openingTag.toLowerCase().includes('application/ld+json'));
    const last = scripts.at(-1);
    if (last) {
      html = html.slice(0, last.contentEnd)
        + "\ndocument.getElementById('langBtn').addEventListener('click', toggleLang);\n"
        + html.slice(last.contentEnd);
    }
  }

  const hashes = findElements(html, 'script')
    .map((script) => script.content.replace(/\r\n?/g, '\n'))
    .map((script) => `'sha256-${crypto.createHash('sha256').update(script, 'utf8').digest('base64')}'`);
  const hasFrame = /<iframe\b/i.test(html);
  const scriptPolicy = hashes.length ? `script-src 'self' ${hashes.join(' ')}` : "script-src 'none'";
  const framePolicy = hasFrame
    ? 'frame-src https://maps.google.com https://www.google.com'
    : "frame-src 'none'";
  const policy = [
    "default-src 'self'",
    scriptPolicy,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
    "font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    framePolicy,
    "media-src 'none'",
    "worker-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://wa.me",
    "manifest-src 'self'",
    'upgrade-insecure-requests'
  ].join('; ') + ';';

  const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${policy}">`;
  if (!/<meta\s+http-equiv="Content-Security-Policy"[^>]*>/i.test(html)) {
    throw new Error(`Missing CSP meta tag: ${path.relative(root, file)}`);
  }
  html = html.replace(/<meta\s+http-equiv="Content-Security-Policy"[^>]*>/i, cspMeta);
  fs.writeFileSync(file, html);
}
