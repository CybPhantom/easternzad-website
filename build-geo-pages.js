/**
 * Generates geo/*.html landing pages for local SEO — run: node build-geo-pages.js
 */
var fs = require('fs');
var path = require('path');

var ROOT = __dirname;
var GEO_DIR = path.join(ROOT, 'geo');

var REGIONS = [
  {
    slug: 'eastern-province',
    ar: 'المنطقة الشرقية', en: 'Eastern Province',
    titleAr: 'توزيع مبرّد ومجمّد في المنطقة الشرقية | الدمام والقطيف — زاد الشرقية',
    titleEn: 'Refrigerated distribution Eastern Province | Dammam & Qatif — Eastern Zad',
    descAr: 'توزيع مبرّد في الدمام والخبر والظهران والقطيف والجبيل. مقر زاد الشرقية في أم الساهك — معتمد SFDA، أسطول 50+ شاحنة.',
    descEn: 'Chilled & frozen distribution in Dammam, Khobar, Dhahran, Qatif & Jubail. HQ in Umm Al Sahk — SFDA licensed fleet.',
    citiesAr: 'الدمام، الخبر، الظهران، القطيف، الجبيل، الأحساء، حفر الباطن',
    citiesEn: 'Dammam, Khobar, Dhahran, Qatif, Jubail, Al-Ahsa, Hofuf',
    kwAr: 'توزيع مبرّد الدمام, نقل مجمد القطيف, سلسلة تبريد الخبر, شركة توزيع غذائي الظهران',
    bodyAr: 'زاد الشرقية للتجارة — مقرها في أم الساهك بمحافظة القطيف — تقدّم خدمات التوزيع المبرّد والمجمّد في كامل المنطقة الشرقية. نغطي الدمام والخبر والظهران والجبيل والأحساء بأسطول مبرّد حديث ومعتمد من هيئة الغذاء والدواء (SFDA).',
    bodyEn: 'Eastern Zad Trading, headquartered in Umm Al Sahk, Qatif, provides chilled and frozen distribution across the Eastern Province including Dammam, Khobar, Dhahran, Jubail, and Al-Ahsa with an SFDA-licensed refrigerated fleet.',
    lat: 26.5644, lng: 49.9983, hq: true, priority: 0.95
  },
  {
    slug: 'riyadh', ar: 'الرياض', en: 'Riyadh',
    titleAr: 'توزيع مبرّد في الرياض | نقل مجمد وسلسلة تبريد — زاد الشرقية',
    titleEn: 'Refrigerated distribution Riyadh | Cold chain KSA — Eastern Zad',
    descAr: 'خدمات توزيع مبرّد ومجمّد في الرياض وضواحيها — توريد للمطاعم والسوبرماركت والفنادق بجداول يومية.',
    descEn: 'Chilled & frozen distribution in Riyadh and suburbs — daily supply to restaurants, supermarkets & hotels.',
    citiesAr: 'الرياض، الخرج، الدوادمي، المزاحمية',
    citiesEn: 'Riyadh, Al-Kharj, Dawadmi, Muzahimiyah',
    kwAr: 'توزيع مبرّد الرياض, نقل مجمد الرياض, لوجستيات غذائية العاصمة',
    bodyAr: 'فرع توزيع زاد الشرقية في الرياض يخدم آلاف نقاط البيع في العاصمة وضواحيها. نوفر نقل مبرّد من -25°C إلى -40°C مع مستودعات معتمدة ISO 22000.',
    bodyEn: 'Eastern Zad\'s Riyadh distribution branch serves thousands of outlets across the capital with refrigerated transport from -25°C to -40°C and ISO 22000 certified storage.',
    lat: 24.7136, lng: 46.6753, hq: false, priority: 0.9
  },
  {
    slug: 'jeddah', ar: 'جدة', en: 'Jeddah',
    titleAr: 'توزيع مبرّد في جدة | نقل مجمد المنطقة الغربية — زاد الشرقية',
    titleEn: 'Refrigerated distribution Jeddah | Western region cold chain',
    descAr: 'توزيع غذائي مبرّد في جدة ومكة والمنطقة الغربية — نقل بين المناطق بدرجات حرارة محكومة.',
    descEn: 'Chilled food distribution in Jeddah and western Saudi Arabia — inter-regional transport with controlled temperatures.',
    citiesAr: 'جدة، مكة المكرمة، رابغ، الليث',
    citiesEn: 'Jeddah, Makkah, Rabigh, Al-Lith',
    kwAr: 'توزيع مبرّد جدة, نقل مجمد مكة, سلسلة تبريد الساحل الغربي',
    bodyAr: 'نغطي جدة والمنطقة الغربية بخدمات التوزيع المبرّد والمجمّد للمنتجات الغذائية. شاحناتنا مجهّزة بأنظمة تبريد متطورة وتقارير حرارة لكل شحنة.',
    bodyEn: 'We cover Jeddah and the western region with chilled and frozen food distribution. Our trucks feature advanced cooling systems and temperature reports per shipment.',
    lat: 21.4858, lng: 39.1925, hq: false, priority: 0.9
  },
  {
    slug: 'madinah', ar: 'المدينة المنورة', en: 'Madinah',
    titleAr: 'توزيع مبرّد في المدينة المنورة — زاد الشرقية للتجارة',
    titleEn: 'Refrigerated distribution Madinah — Eastern Zad Trading',
    descAr: 'توزيع وتخزين بارد في المدينة المنورة — خدمة المطاعم والفنادق ونقاط البيع.',
    descEn: 'Chilled distribution and cold storage in Madinah — serving restaurants, hotels & retail.',
    citiesAr: 'المدينة المنورة، ينبع (فرع)، بدر، العلا',
    citiesEn: 'Madinah, Yanbu branch, Badr, Al-Ula',
    kwAr: 'توزيع مبرّد المدينة, نقل مجمد المدينة المنورة',
    bodyAr: 'خدمات توزيع مبرّد في المدينة المنورة والمناطق المحيطة — من المستودع إلى نقطة البيع بمعايير HACCP و SFDA.',
    bodyEn: 'Refrigerated distribution in Madinah and surrounding areas — warehouse to point of sale with HACCP and SFDA standards.',
    lat: 24.5247, lng: 39.5692, hq: false, priority: 0.85
  },
  {
    slug: 'yanbu', ar: 'ينبع', en: 'Yanbu',
    titleAr: 'توزيع مبرّد في ينبع | المنطقة الصناعية — زاد الشرقية',
    titleEn: 'Refrigerated distribution Yanbu | Industrial zone — Eastern Zad',
    descAr: 'تغطية ينبع والمنطقة الصناعية — توصيل مبرّد للمؤسسات الغذائية والتجارية.',
    descEn: 'Yanbu and industrial zone coverage — chilled delivery for food & commercial establishments.',
    citiesAr: 'ينبع البحر، ينبع الصناعية',
    citiesEn: 'Yanbu Al-Bahr, Yanbu Industrial City',
    kwAr: 'توزيع مبرّد ينبع, نقل مجمد ينبع الصناعية',
    bodyAr: 'فرع ينبع يخدم المنطقة الصناعية والمدينة بأسطول مبرّد متخصص في توريد المواد الغذائية للمصانع والمطاعم.',
    bodyEn: 'Our Yanbu branch serves the industrial city with a specialized refrigerated fleet for food supply to factories and restaurants.',
    lat: 24.0895, lng: 38.0618, hq: false, priority: 0.8
  },
  {
    slug: 'hail', ar: 'حائل', en: 'Hail',
    titleAr: 'توزيع مبرّد في حائل — زاد الشرقية للتجارة',
    titleEn: 'Refrigerated distribution Hail — Eastern Zad Trading',
    descAr: 'شبكة توزيع مبرّد في حائل — نقل من وإلى المنطقة بأسطول مجهّز.',
    descEn: 'Refrigerated distribution network in Hail — equipped fleet for regional transport.',
    citiesAr: 'حائل، بقعاء، الشملي',
    citiesEn: 'Hail, Baqaa, Ash-Shamli',
    kwAr: 'توزيع مبرّد حائل, نقل مجمد حائل',
    bodyAr: 'نربط حائل بشبكتنا الوطنية للتوزيع المبرّد — توصيل سريع للمنتجات المجمدة والمبرّدة لنقاط البيع المحلية.',
    bodyEn: 'We connect Hail to our national cold chain network — fast delivery of frozen and chilled products to local outlets.',
    lat: 27.5114, lng: 41.6901, hq: false, priority: 0.8
  },
  {
    slug: 'qassim', ar: 'القصيم', en: 'Qassim',
    titleAr: 'توزيع مبرّد في القصيم | بريدة وعنيزة — زاد الشرقية',
    titleEn: 'Refrigerated distribution Qassim | Buraidah — Eastern Zad',
    descAr: 'توزيع منتجات مبرّدة ومجمّدة في بريدة وعنيزة ومدن القصيم.',
    descEn: 'Chilled & frozen products in Buraidah, Unayzah & Qassim cities.',
    citiesAr: 'بريدة، عنيزة، الرس، المذنب',
    citiesEn: 'Buraidah, Unayzah, Ar-Rass, Al-Mithnab',
    kwAr: 'توزيع مبرّد بريدة, نقل مجمد القصيم, توزيع غذائي عنيزة',
    bodyAr: 'تغطية شاملة للقصيم عبر موزعين محليين وأسطول نقل مبرّد — شراكات مع تجار الجملة والتجزئة.',
    bodyEn: 'Comprehensive Qassim coverage via local distributors and refrigerated transport — partnerships with wholesale and retail traders.',
    lat: 26.326, lng: 43.975, hq: false, priority: 0.8
  },
  {
    slug: 'jazan', ar: 'جازان', en: 'Jazan',
    titleAr: 'توزيع مبرّد في جازان — زاد الشرقية للتجارة',
    titleEn: 'Refrigerated distribution Jazan — Eastern Zad Trading',
    descAr: 'تغطية جنوبية للمنتجات الغذائية — دعم المنتجين المحليين في جازان.',
    descEn: 'Southern food distribution — supporting local producers in Jazan.',
    citiesAr: 'جازان، صبيا، أبو عريش، فيفا',
    citiesEn: 'Jazan, Sabya, Abu Arish, Fayfa',
    kwAr: 'توزيع مبرّد جازان, نقل مجمد جنوب السعودية',
    bodyAr: 'شبكتنا في جازان تدعم المنتجين المحليين والوكلاء الإقليميين لنقل المنتجات المبرّدة بأمان إلى أسواق جديدة.',
    bodyEn: 'Our Jazan network supports local producers and regional agents to safely transport chilled products to new markets.',
    lat: 16.8894, lng: 42.5611, hq: false, priority: 0.8
  },
  {
    slug: 'asir', ar: 'عسير', en: 'Asir',
    titleAr: 'توزيع مبرّد في عسير | أبها وخميس مشيط — زاد الشرقية',
    titleEn: 'Refrigerated distribution Asir | Abha — Eastern Zad Trading',
    descAr: 'توزيع مبرّد في أبها وخميس مشيط — شراكات مع تجار الجملة والتجزئة.',
    descEn: 'Chilled distribution in Abha & Khamis Mushait — wholesale & retail partnerships.',
    citiesAr: 'أبها، خميس مشيط، بيشة، النماص',
    citiesEn: 'Abha, Khamis Mushait, Bisha, An-Namas',
    kwAr: 'توزيع مبرّد أبها, نقل مجمد عسير, لوجستيات غذائية خميس مشيط',
    bodyAr: 'نخدم منطقة عسير بتوزيع يومي للمنتجات المبرّدة والمجمّدة — من الآيس كريم إلى اللحوم المجمدة بدرجات حرارة محكومة.',
    bodyEn: 'We serve Asir with daily distribution of chilled and frozen products — from ice cream to frozen meat at controlled temperatures.',
    lat: 18.2164, lng: 42.5053, hq: false, priority: 0.8
  }
];

function pageHtml(r) {
  var url = 'https://easternzad.com/geo/' + r.slug + '.html';
  var mapUrl = 'https://maps.google.com/?q=' + r.lat + ',' + r.lng;
  var schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': url + '#webpage',
        url: url,
        name: r.titleAr,
        description: r.descAr,
        inLanguage: 'ar-SA',
        isPartOf: { '@id': 'https://easternzad.com/#website' },
        about: { '@type': 'Place', name: r.ar, geo: { '@type': 'GeoCoordinates', latitude: r.lat, longitude: r.lng } }
      },
      {
        '@type': 'LocalBusiness',
        '@id': url + '#local',
        name: 'زاد الشرقية للتجارة — ' + r.ar,
        alternateName: 'Eastern Zad Trading — ' + r.en,
        url: url,
        telephone: '+966-54-071-2087',
        email: 'info@easternzad.com',
        image: 'https://easternzad.com/assets/logos/easternzad%20logo.png',
        parentOrganization: { '@id': 'https://easternzad.com/#organization' },
        areaServed: { '@type': 'AdministrativeArea', name: r.en, alternateName: r.ar },
        geo: { '@type': 'GeoCoordinates', latitude: r.lat, longitude: r.lng },
        hasMap: mapUrl,
        priceRange: '$$',
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
          opens: '08:00', closes: '17:00'
        }
      },
      {
        '@type': 'Service',
        name: 'توزيع مبرّد في ' + r.ar,
        serviceType: 'Refrigerated food distribution',
        provider: { '@id': url + '#local' },
        areaServed: { '@type': 'City', name: r.en, alternateName: r.ar }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://easternzad.com/' },
          { '@type': 'ListItem', position: 2, name: 'المناطق', item: 'https://easternzad.com/regions.html' },
          { '@type': 'ListItem', position: 3, name: r.ar, item: url }
        ]
      }
    ]
  };

  if (r.hq) {
    schema['@graph'][1].address = {
      '@type': 'PostalAddress',
      streetAddress: 'Umm Al Sahk',
      addressLocality: 'Qatif',
      addressRegion: 'Eastern Province',
      addressCountry: 'SA'
    };
  }

  return '<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' + r.titleAr + '</title>\n<meta name="description" content="' + r.descAr + '">\n<meta name="keywords" content="' + r.kwAr + '">\n<meta name="robots" content="index, follow">\n<meta name="geo.region" content="SA">\n<meta name="geo.placename" content="' + r.ar + ', Saudi Arabia">\n<meta name="geo.position" content="' + r.lat + ';' + r.lng + '">\n<meta name="ICBM" content="' + r.lat + ', ' + r.lng + '">\n<link rel="canonical" href="' + url + '">\n<link rel="alternate" hreflang="ar-SA" href="' + url + '">\n<link rel="alternate" hreflang="en" href="' + url + '?lang=en">\n<meta property="og:title" content="' + r.titleAr + '">\n<meta property="og:description" content="' + r.descAr + '">\n<meta property="og:url" content="' + url + '">\n<meta property="og:image" content="https://easternzad.com/assets/logos/easternzad%20logo.png">\n<meta property="og:locale" content="ar_SA">\n<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>🌾</text></svg>">\n<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous">\n<style>\n:root{--p:#042C53;--pl:#0C447C;--a:#5DCAA5;--g:#5a6472}\n*{box-sizing:border-box;margin:0;padding:0}body{font-family:\'Tajawal\',sans-serif;color:#1a2332;line-height:1.85}\nhtml[dir="ltr"] body{font-family:\'Inter\',sans-serif}a{color:var(--pl);text-decoration:none}\n.nav{background:var(--p);padding:14px 0}.nav .inner{max-width:920px;margin:0 auto;padding:0 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}\n.nav img{height:36px}.nav span{color:#fff;font-weight:700}.nav a{color:rgba(255,255,255,.85);margin-inline-start:14px;font-size:13px}\n.hero{background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;padding:56px 20px;text-align:center}\n.hero h1{font-size:30px;margin-bottom:10px}.hero .cities{opacity:.85;font-size:15px;margin-top:8px}\n.content{max-width:920px;margin:0 auto;padding:40px 20px 48px}\n.body-text{color:var(--g);font-size:16px;margin-bottom:24px}\n.geo-box{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:28px 0}\n.geo-card{background:#f7f9fb;border:1px solid #e2e8f0;border-radius:14px;padding:22px}\n.geo-card h3{font-size:15px;color:var(--p);margin-bottom:8px}\n.geo-card p{font-size:14px;color:var(--g)}\n.map-wrap{border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;margin:24px 0}\n.map-wrap iframe{width:100%;height:280px;border:0;display:block}\n.cta-row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:28px}\n.btn{padding:13px 24px;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;display:inline-flex;align-items:center;gap:8px}\n.btn-p{background:var(--pl);color:#fff}.btn-wa{background:#25D366;color:#fff}.btn-o{background:#fff;color:var(--pl);border:2px solid var(--pl)}\n.siblings{margin-top:40px;padding-top:28px;border-top:1px solid #e2e8f0}\n.siblings h3{font-size:16px;margin-bottom:14px;color:var(--p)}\n.sib-links{display:flex;flex-wrap:wrap;gap:8px}\n.sib-links a{background:#eef2f6;padding:8px 14px;border-radius:99px;font-size:12px;font-weight:600;color:var(--pl)}\n.footer{background:var(--p);color:rgba(255,255,255,.7);text-align:center;padding:22px;font-size:13px}\n.lang-btn{background:rgba(255,255,255,.15);border:none;color:#fff;padding:7px 12px;border-radius:8px;cursor:pointer;font-size:12px}\n.hq-tag{display:inline-block;background:var(--a);color:var(--p);font-size:11px;font-weight:700;padding:4px 12px;border-radius:99px;margin-bottom:10px}\n@media(max-width:640px){.geo-box{grid-template-columns:1fr}.nav a.nav-hide{display:none}}\n</style>\n<script type="application/ld+json">\n' + JSON.stringify(schema, null, 2) + '\n</script>\n</head>\n<body>\n<nav class="nav"><div class="inner">\n  <a href="../index.html"><img src="../assets/logos/easternzad%20logo.png" alt="زاد الشرقية" width="36" height="36"><span id="brand">زاد الشرقية</span></a>\n  <div><a href="../index.html" class="nav-hide" id="l-home">الرئيسية</a><a href="../regions.html" class="nav-hide" id="l-reg">المناطق</a><a href="../contact.html" class="nav-hide" id="l-contact">تواصل</a>\n  <button class="lang-btn" onclick="toggleLang()" id="langBtn">English</button></div>\n</div></nav>\n<section class="hero">\n  ' + (r.hq ? '<span class="hq-tag" id="hq-tag">المقر الرئيسي</span>' : '') + '\n  <h1 id="h1">توزيع مبرّد في ' + r.ar + '</h1>\n  <p class="cities" id="cities">' + r.citiesAr + '</p>\n</section>\n<article class="content">\n  <p class="body-text" id="body">' + r.bodyAr + '</p>\n  <div class="geo-box">\n    <div class="geo-card"><h3 id="gc1t"><i class="fas fa-thermometer-half"></i> درجات الحرارة</h3><p id="gc1d">تبريد من -25°C إلى -40°C — مراقبة مستمرة وتقارير حرارة لكل شحنة</p></div>\n    <div class="geo-card"><h3 id="gc2t"><i class="fas fa-certificate"></i> الاعتمادات</h3><p id="gc2d">SFDA | ISO 22000 | HACCP | GDP — معايير سلامة غذائية عالمية</p></div>\n    <div class="geo-card"><h3 id="gc3t"><i class="fas fa-truck"></i> الأسطول</h3><p id="gc3d">50+ شاحنة مبرّدة — توزيع يومي لأكثر من 5,500 نقطة بيع</p></div>\n    <div class="geo-card"><h3 id="gc4t"><i class="fas fa-map-pin"></i> الإحداثيات</h3><p id="gc4d" dir="ltr">' + r.lat + ', ' + r.lng + '</p></div>\n  </div>\n  <div class="map-wrap"><iframe title="خريطة ' + r.ar + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' + r.lat + ',' + r.lng + '&z=11&output=embed"></iframe></div>\n  <div class="cta-row">\n    <a href="../index.html#quote" class="btn btn-p" id="cta-q"><i class="fas fa-file-alt"></i> <span>عرض سعر</span></a>\n    <a href="https://wa.me/966540712087" class="btn btn-wa" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> <span id="cta-wa">واتساب</span></a>\n    <a href="tel:+966540712087" class="btn btn-o" id="cta-tel"><i class="fas fa-phone"></i> <span>اتصل</span></a>\n  </div>\n  <nav class="siblings" aria-label="مناطق أخرى"><h3 id="sib-title">مناطق التغطية الأخرى</h3><div class="sib-links" id="sib-links"></div></nav>\n</article>\n<footer class="footer" id="ft">© 2026 زاد الشرقية — <a href="../regions.html" style="color:var(--a)" id="ft-link">كل المناطق</a></footer>\n<script>\nvar SLUG=' + JSON.stringify(r.slug) + ';\nvar AR={brand:\'زاد الشرقية\',h1:\'توزيع مبرّد في ' + r.ar + '\',cities:\'' + r.citiesAr + '\',body:\'' + r.bodyAr.replace(/'/g, "\\'") + '\',gc1t:\'درجات الحرارة\',gc1d:\'تبريد من -25°C إلى -40°C — مراقبة مستمرة وتقارير حرارة لكل شحنة\',gc2t:\'الاعتمادات\',gc2d:\'SFDA | ISO 22000 | HACCP | GDP\',gc3t:\'الأسطول\',gc3d:\'50+ شاحنة مبرّدة — 5,500+ نقطة بيع\',gc4t:\'الإحداثيات\',cta_q:\'عرض سعر\',cta_wa:\'واتساب\',cta_tel:\'اتصل\',sib:\'مناطق التغطية الأخرى\',ft:\'© 2026 زاد الشرقية — كل المناطق\',ft_link:\'كل المناطق\',\'l-home\':\'الرئيسية\',\'l-reg\':\'المناطق\',\'l-contact\':\'تواصل\',hq:\'المقر الرئيسي\'};\nvar EN={brand:\'Eastern Zad\',h1:\'Refrigerated distribution in ' + r.en + '\',cities:\'' + r.citiesEn + '\',body:\'' + r.bodyEn.replace(/'/g, "\\'") + '\',gc1t:\'Temperature range\',gc1d:\'-25°C to -40°C — continuous monitoring & reports per shipment\',gc2t:\'Certifications\',gc2d:\'SFDA | ISO 22000 | HACCP | GDP\',gc3t:\'Fleet\',gc3d:\'50+ refrigerated trucks — 5,500+ outlets\',gc4t:\'Coordinates\',cta_q:\'Get a quote\',cta_wa:\'WhatsApp\',cta_tel:\'Call\',sib:\'Other coverage regions\',ft:\'© 2026 Eastern Zad — All regions\',ft_link:\'All regions\',\'l-home\':\'Home\',\'l-reg\':\'Regions\',\'l-contact\':\'Contact\',hq:\'Headquarters\'};\nvar SIB=' + JSON.stringify(REGIONS.map(function(x){ return {slug:x.slug,ar:x.ar,en:x.en}; })) + ';\nvar lang=\'ar\';\nfunction buildSib(){var el=document.getElementById(\'sib-links\');if(!el)return;el.innerHTML=SIB.filter(function(s){return s.slug!==SLUG;}).map(function(s){var n=lang===\'ar\'?s.ar:s.en;return \'<a href="\'+s.slug+\'.html">\'+n+\'</a>\';}).join(\'\');}\nfunction apply(d){Object.keys(d).forEach(function(k){var el=document.getElementById(k);if(!el)return;if(k===\'h1\')el.textContent=d.h1;else if(k===\'body\'||k===\'cities\')el.textContent=d[k];else if(k===\'ft\')el.innerHTML=d.ft.replace(\'كل المناطق\',\'<a href="../regions.html" style="color:var(--a)">\'+d.ft_link+\'</a>\').replace(\'All regions\',\'<a href="../regions.html" style="color:var(--a)">\'+d.ft_link+\'</a>\');else el.textContent=d[k];});var hq=document.getElementById(\'hq-tag\');if(hq&&d.hq)hq.textContent=d.hq;document.querySelector(\'#cta-q span\').textContent=d.cta_q;document.querySelector(\'.btn-wa span\').textContent=d.cta_wa;document.querySelector(\'#cta-tel span\').textContent=d.cta_tel;document.documentElement.lang=lang;document.documentElement.dir=lang===\'ar\'?\'rtl\':\'ltr\';document.getElementById(\'langBtn\').textContent=lang===\'ar\'?\'English\':\'العربية\';buildSib();}\nfunction toggleLang(){lang=lang===\'ar\'?\'en\':\'ar\';apply(lang===\'ar\'?AR:EN);}\nbuildSib();\nif(new URLSearchParams(location.search).get(\'lang\')===\'en\')toggleLang();\n</script>\n</body>\n</html>';
}

function hubHtml() {
  var links = REGIONS.map(function(r) {
    return '<a href="' + r.slug + '.html">' + r.ar + '</a>';
  }).join('\n      ');
  return '<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>خريطة التغطية الجغرافية | زاد الشرقية — 9 مناطق</title>\n<meta name="description" content="صفحات GEO لكل منطقة: توزيع مبرّد في الدمام، الرياض، جدة، المدينة، ينبع، حائل، القصيم، جازان، عسير.">\n<link rel="canonical" href="https://easternzad.com/geo/">\n<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>🌾</text></svg>">\n<style>body{font-family:Tajawal,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.8}a{display:inline-block;margin:6px;padding:10px 16px;background:#eef2f6;border-radius:99px;color:#0C447C;text-decoration:none;font-weight:600}h1{color:#042C53}</style>\n</head>\n<body>\n<h1>التغطية الجغرافية — زاد الشرقية</h1>\n<p>صفحات مخصّصة لكل منطقة لتحسين الظهور في البحث المحلي:</p>\n<div>\n      ' + links + '\n</div>\n<p><a href="../regions.html">← العودة لصفحة المناطق</a></p>\n</body>\n</html>';
}

if (!fs.existsSync(GEO_DIR)) fs.mkdirSync(GEO_DIR);

REGIONS.forEach(function(r) {
  fs.writeFileSync(path.join(GEO_DIR, r.slug + '.html'), pageHtml(r), 'utf8');
});
fs.writeFileSync(path.join(GEO_DIR, 'index.html'), hubHtml(), 'utf8');

var geoJson = {
  organization: 'Eastern Zad Trading Co.',
  headquarters: { name: 'Umm Al Sahk, Qatif', lat: 26.5644, lng: 49.9983, country: 'SA' },
  regions: REGIONS.map(function(r) {
    return { slug: r.slug, name_ar: r.ar, name_en: r.en, lat: r.lat, lng: r.lng, hq: !!r.hq, url: 'https://easternzad.com/geo/' + r.slug + '.html' };
  })
};
fs.writeFileSync(path.join(ROOT, 'geo.json'), JSON.stringify(geoJson, null, 2), 'utf8');

console.log('Generated ' + REGIONS.length + ' geo pages + geo.json');
