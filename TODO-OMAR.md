# drmdossary.com — Pending Tasks for Omar

تم نقل الموقع على Vercel لكن لسه شغّال على `drmdossary.vercel.app` بس. عندنا قائمة شغل لازم تتنفذ قبل ما نطلق رسمياً على `drmdossary.com`.

---

## 1. Domain Cutover — `drmdossary.com`

**Currently:** DNS مركون على Namecheap parking (`ns1/ns2.dns-parking.com`, IPs `92.113.x`).

**Action:**
- Add `drmdossary.com` + `www.drmdossary.com` to the Vercel `drmdossary` project (Settings → Domains).
- Update DNS at the registrar (Namecheap):
  - `A` record on apex `@` → `76.76.21.21`
  - `CNAME` record on `www` → `cname.vercel-dns.com`
- Set apex as primary, `www` as 308 redirect to apex (or vice-versa — pick one and stick).
- Wait for SSL provisioning (≤10 min after DNS propagates).

---

## 2. Responsive Fixes

- اختبر كل الصفحات على mobile (375px) + tablet (768px) + desktop (1280px+).
- Fix overflow, broken grids, oversized hero text.
- Ensure tap targets ≥ 44px على mobile.
- اختبر RTL على عرض الموبايل بالذات (الكثير من المشاكل تظهر هنا).

## 3. Image Sizes & Fit

- ضغط كل الصور (WebP / AVIF) — هدف ≤ 200KB لكل صورة hero و ≤ 80KB للـ thumbnails.
- استخدم `<img loading="lazy">` لأي صورة under-the-fold.
- Set explicit `width` + `height` to prevent CLS.
- Use `object-fit: cover` for hero/banner images, `object-fit: contain` for logos/diagrams.
- استبدل أي صور مشوهة (stretched) أو منخفضة الجودة.

## 4. Logo Fix

- اللوغو الحالي محتاج تحسين — تأكد:
  - SVG version (لأي مكان > 64px)
  - Retina-ready raster fallback (2x, 3x) لو لازم
  - Same proportions في header / footer / favicon
- Favicon + apple-touch-icon + OG image كلها من نفس المصدر النظيف.

## 5. Remove Em Dashes (—) from All Content

- في كل صفحات الموقع: استبدل `—` (em dash) بـ `-` (hyphen) أو بفاصلة عربية `،` حسب السياق.
- ابحث بـ regex: `[—–]` واستبدل يدوياً.
- ينطبق على HTML content + meta descriptions + alt text.

## 6. SEO Optimization

- **Per-page `<title>` و `<meta name="description">`** — كل صفحة عندها تايتل + ديسكريبشن فريد، 50–60 char للتايتل، 140–160 char للديسكريبشن.
- **Open Graph + Twitter Cards** على كل صفحة:
  - `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:type`
  - `twitter:card = summary_large_image`
- **Canonical tags** على كل صفحة (`<link rel="canonical" href="...">`).
- **Hreflang** للـ AR/EN versions (شوف نقطة 11).
- **Alt text** على كل صورة، عربي طبيعي وليس keyword stuffing.
- **Heading hierarchy** — `<h1>` واحد فقط لكل صفحة.
- **Internal linking** — كل service page تربط للـ booking page و للـ services الأخرى.
- **Page speed**: Lighthouse target ≥ 90 mobile و desktop.

## 7. Google Rich Snippets (Structured Data)

أضف JSON-LD schema markup على الصفحات المناسبة:

- **`Physician` / `MedicalBusiness`** على homepage:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": "د. محمد الدوسري",
    "medicalSpecialty": "Ophthalmology",
    "address": { "@type": "PostalAddress", "addressLocality": "Riyadh", "addressCountry": "SA" },
    "telephone": "...",
    "url": "https://drmdossary.com"
  }
  ```
- **`MedicalProcedure`** على service pages (Cataract, LASIK, Corneal, etc.).
- **`FAQPage`** على `/faqs`.
- **`BreadcrumbList`** على كل صفحة داخلية.
- **`Article`** على كل blog post.
- **`LocalBusiness`** مع `openingHours`, `geo`, `aggregateRating` (لو متاح).

اختبر كل schema في https://search.google.com/test/rich-results

## 8. Google Search Console

- Verify ownership عبر:
  - DNS TXT record، OR
  - HTML meta tag في `<head>`، OR
  - File upload في root
- Submit `sitemap.xml` بعد ما نتأكد إنه شامل لكل URLs.
- Request indexing لأهم 10 صفحات يدوياً (homepage + services الرئيسية + booking).
- Monitor coverage report لـ 7 أيام بعد launch.

## 9. Sitemap

- تأكد إن `sitemap.xml` يشمل:
  - كل service page
  - كل blog post
  - booking page الجديدة
  - AR + EN versions (مع `<xhtml:link rel="alternate" hreflang="...">`)
- `lastmod` صحيح على كل URL.
- اربط الـ sitemap في `robots.txt`:
  ```
  Sitemap: https://drmdossary.com/sitemap.xml
  ```

## 10. Dedicated Booking Page

- صفحة `/booking` (و `/en/booking`) — مستقلة بصفحة كاملة (مش modal أو section).
- شكلها يطابق الـ mockup في عقد الإدارة الرقمية (3-step: service → date/time → contact).
- Live calendar excluding booked slots.
- WhatsApp + email confirmation.
- Page-level conversion tracking event (Meta Pixel + TikTok Pixel + GA4 `generate_lead`).
- CTA buttons من كل الموقع تروح للـ `/booking`.

## 11. Bilingual AR/EN with Arabic Default

- **Arabic = default** على `drmdossary.com/` (root).
- **English = `/en/`** subpath.
- لكل صفحة AR لازم يكون فيه EN counterpart والعكس.
- Language toggle pill في الـ header/nav.
- `<html lang="ar" dir="rtl">` على AR pages, `<html lang="en" dir="ltr">` على EN.
- Hreflang tags في `<head>` لكل صفحة:
  ```html
  <link rel="alternate" hreflang="ar" href="https://drmdossary.com/path" />
  <link rel="alternate" hreflang="en" href="https://drmdossary.com/en/path" />
  <link rel="alternate" hreflang="x-default" href="https://drmdossary.com/path" />
  ```
- Sitemap يشمل النسختين مع hreflang links.

---

## Priority order for tomorrow

1. **Domain cutover** (نقطة 1) — أول حاجة، لأن كل الـ SEO و Search Console محتاجين الـ apex live.
2. **Responsive + image + logo fixes** (2-4) — visual polish قبل ما نوديه للناس.
3. **Em dashes removal** (5) — سريع، اعمله مع رقم 2.
4. **Booking page** (10) — الـ conversion hub.
5. **Bilingual setup** (11) — structural، ابدأه بعد ما الصفحات تستقر.
6. **SEO + schema + sitemap + Search Console** (6-9) — آخر طبقة قبل launch.

---

أي blocker، اكتب في الجروب.
