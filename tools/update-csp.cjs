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

for (const file of walk(root).filter((name) => name.endsWith('.html'))) {
  let html = fs.readFileSync(file, 'utf8');

  if (html.includes('id="langBtn"') && html.includes('onclick="toggleLang()"')) {
    html = html.replace(/\s+onclick="toggleLang\(\)"/g, '');
    const scripts = [...html.matchAll(/<script(?![^>]*type="application\/ld\+json")[^>]*>[\s\S]*?<\/script>/gi)];
    const last = scripts.at(-1);
    if (last) {
      const closing = last.index + last[0].lastIndexOf('</script>');
      html = html.slice(0, closing)
        + "\ndocument.getElementById('langBtn').addEventListener('click', toggleLang);\n"
        + html.slice(closing);
    }
  }

  const hashes = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].replace(/\r\n?/g, '\n'))
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
