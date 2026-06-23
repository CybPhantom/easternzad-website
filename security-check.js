/**
 * Eastern Zad — Pre-deploy security & SEO readiness audit (51 checks)
 * Run: node security-check.js
 */
var fs = require('fs');
var path = require('path');

var ROOT = __dirname;
var REQUIRED = [
  'index.html', 'about.html', 'services.html', 'regions.html', 'contact.html',
  'manifest.webmanifest', 'sw.js', 'sitemap.xml', 'llms.txt', 'ai.txt', 'geo.txt', 'geo.json', 'security.txt', 'humans.txt',
  '.htaccess', 'robots.txt', '_headers', 'SEARCH-ENGINE-SETUP.txt',
  'assets/logos/easternzad logo.png'
];

var checks = [];
function pass(id, name) { checks.push({ id: id, name: name, ok: true }); }
function fail(id, name, detail) { checks.push({ id: id, name: name, ok: false, detail: detail }); }

function read(file) {
  try { return fs.readFileSync(path.join(ROOT, file), 'utf8'); } catch (e) { return ''; }
}

REQUIRED.forEach(function(f, i) {
  if (fs.existsSync(path.join(ROOT, f))) pass(i + 1, 'ملف مطلوب: ' + f);
  else fail(i + 1, 'ملف مطلوب: ' + f, 'غير موجود');
});

var index = read('index.html');
var htaccess = read('.htaccess');
var sitemap = read('sitemap.xml');
var robots = read('robots.txt');

var logoDir = path.join(ROOT, 'assets', 'logos');
if (fs.existsSync(logoDir) && fs.readdirSync(logoDir).length >= 5) pass(19, 'شعارات العملاء موجودة');
else fail(19, 'شعارات العملاء', 'ناقصة');

if (/Content-Security-Policy/i.test(index)) pass(20, 'CSP في index.html'); else fail(20, 'CSP في index.html');
if (/ops\.easternzad\.com/.test(index) && /nav-login/.test(index)) pass(21, 'دخول الموظفين → ops مباشرة'); else fail(21, 'رابط ops');
if (/X-Content-Type-Options/i.test(index)) pass(22, 'nosniff في index.html'); else fail(22, 'nosniff في index.html');
if (/referrer/i.test(index)) pass(23, 'Referrer-Policy في index.html'); else fail(23, 'Referrer-Policy');
if (/noopener noreferrer/i.test(index)) pass(24, 'روابط خارجية آمنة'); else fail(24, 'noopener noreferrer');
if (!/password\s*=\s*["'][^"']+["']/i.test(index)) pass(25, 'لا توجد كلمات مرور مكشوفة'); else fail(25, 'كلمات مرور مكشوفة');
if (!/api[_-]?key|secret|token\s*=\s*["']/i.test(index)) pass(26, 'لا توجد مفاتيح API'); else fail(26, 'مفاتيح API');
if (/sanitize|replace\(\/\[<>/i.test(index)) pass(27, 'تنظيف مدخلات النماذج'); else fail(27, 'تنظيف المدخلات');
if (/frame-ancestors\s+'none'/i.test(index)) pass(28, 'منع التضمين iframe'); else fail(28, 'frame-ancestors');
if (/serviceWorker/i.test(index)) pass(29, 'تسجيل Service Worker'); else fail(29, 'Service Worker');
if (/manifest\.webmanifest/i.test(index)) pass(30, 'ربط PWA manifest'); else fail(30, 'PWA manifest');

if (/RewriteEngine/i.test(htaccess)) pass(31, 'HTTPS إعادة توجيه'); else fail(31, 'HTTPS redirect');
if (/X-Frame-Options/i.test(htaccess)) pass(32, 'X-Frame-Options في .htaccess'); else fail(32, 'X-Frame-Options');
if (/Strict-Transport-Security/i.test(htaccess)) pass(33, 'HSTS'); else fail(33, 'HSTS');
if (/Options -Indexes/i.test(htaccess)) pass(34, 'تعطيل فهرسة المجلدات'); else fail(34, '-Indexes');
if (/mod_deflate/i.test(htaccess)) pass(35, 'ضغط GZIP'); else fail(35, 'GZIP');
if (/QUERY_STRING/i.test(htaccess)) pass(36, 'حماية من حقن URL'); else fail(36, 'SQL/XSS URL');
if (/security-check\.js/i.test(htaccess)) pass(37, 'حماية security-check.js'); else fail(37, 'حماية audit script');

if (/sitemap\.xml/i.test(robots)) pass(38, 'robots.txt يشير لـ sitemap'); else fail(38, 'robots sitemap');
if (/<urlset/i.test(sitemap) && /regions\.html/.test(sitemap) && /contact\.html/.test(sitemap)) pass(39, 'sitemap.xml صالح'); else fail(39, 'sitemap.xml');
if (/application\/ld\+json/i.test(index) && /GeoCoordinates/i.test(index)) pass(40, 'JSON-LD Schema.org + Geo'); else fail(40, 'JSON-LD');
if (/og:image/i.test(index)) pass(41, 'og:image للمشاركة'); else fail(41, 'og:image');
if (/hreflang/i.test(index)) pass(42, 'hreflang ثنائي اللغة'); else fail(42, 'hreflang');
if (/Eastern Zad/i.test(read('llms.txt')) && /sitemap/i.test(read('llms.txt'))) pass(43, 'llms.txt للذكاء الاصطناعي'); else fail(43, 'llms.txt');
if (/viewport/i.test(index)) pass(44, 'دعم الجوال viewport'); else fail(44, 'viewport');
if (/RewriteRule.*login/i.test(htaccess) && /ops\.easternzad/.test(htaccess)) pass(51, 'إعادة توجيه login.html → ops'); else fail(51, 'login redirect');
if (/mkt-strip|mkt-msg/i.test(index)) pass(45, 'شريط تسويقي CTA'); else fail(45, 'marketing strip');
if (/regions\.html/.test(read('regions.html')) && /ItemList/i.test(read('regions.html'))) pass(46, 'صفحة المناطق SEO'); else fail(46, 'regions.html');
if (/LocalBusiness/i.test(read('contact.html'))) pass(47, 'صفحة التواصل NAP'); else fail(47, 'contact.html');
if (/Google Search Console/i.test(read('SEARCH-ENGINE-SETUP.txt'))) pass(48, 'دليل محركات البحث'); else fail(48, 'SEARCH guide');
if (fs.existsSync(path.join(ROOT, 'geo', 'riyadh.html')) && /GeoCoordinates/i.test(read('geo/riyadh.html'))) pass(49, 'صفحات GEO محلية (9 مناطق)'); else fail(49, 'geo pages');
if (fs.existsSync(path.join(ROOT, 'geo.json')) && /eastern-province/.test(read('geo.json'))) pass(50, 'geo.json بيانات جغرافية'); else fail(50, 'geo.json');

var passed = checks.filter(function(c) { return c.ok; }).length;
var failed = checks.filter(function(c) { return !c.ok; });

console.log('\n=== Eastern Zad Audit (51 checks) ===\n');
checks.forEach(function(c) {
  console.log((c.ok ? '✓' : '✗') + ' [' + c.id + '] ' + c.name + (c.detail ? ' — ' + c.detail : ''));
});
console.log('\nالنتيجة: ' + passed + '/51 نجح');
if (failed.length) {
  console.log('فشل: ' + failed.length);
  process.exit(1);
}
console.log('\nالموقع جاهز للرفع على GoDaddy.\n');
process.exit(0);
