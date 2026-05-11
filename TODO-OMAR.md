# drmdossary.com — Pending Tasks for Omar

Site is deployed to Vercel but still living at `drmdossary.vercel.app`. Here's the punch list to clear before flipping `drmdossary.com` live.

---

## 1. Domain Cutover — `drmdossary.com`

**Currently:** DNS parked at Namecheap nameservers (`ns1/ns2.dns-parking.com`, IPs `92.113.x`).

**Action:**
- Add `drmdossary.com` + `www.drmdossary.com` to the Vercel `drmdossary` project (Settings → Domains).
- Update DNS at the registrar (Namecheap):
  - `A` record on apex `@` → `76.76.21.21`
  - `CNAME` record on `www` → `cname.vercel-dns.com`
- Pick one as primary, set the other to 308 redirect.
- Wait for SSL provisioning (≤10 min after DNS propagates).

---

## 2. Responsive Fixes

- Test every page at mobile (375px), tablet (768px), desktop (1280px+).
- Fix overflow, broken grids, oversized hero text.
- Ensure tap targets ≥ 44px on mobile.
- Pay extra attention to RTL on mobile — most layout bugs surface there.

## 3. Image Sizes & Fit

- Compress all images (WebP / AVIF). Target ≤ 200KB for hero images, ≤ 80KB for thumbnails.
- Add `loading="lazy"` to anything below the fold.
- Set explicit `width` + `height` to prevent CLS.
- Use `object-fit: cover` for hero/banner images, `object-fit: contain` for logos/diagrams.
- Replace any stretched or low-quality images.

## 4. Logo Fix

- Current logo needs cleanup:
  - SVG version (for anything > 64px)
  - Retina-ready raster fallback (2x, 3x) if needed
  - Same proportions in header / footer / favicon
- Favicon + apple-touch-icon + OG image all generated from one clean master.

## 5. Remove Em Dashes (—) from All Content

- Search-and-replace `—` (em dash) with `-` (hyphen) or an Arabic comma `،` depending on context.
- Regex: `[—–]`, replace manually per occurrence.
- Applies to HTML content + meta descriptions + alt text.

## 6. SEO Optimization

- **Per-page `<title>` and `<meta name="description">`** — unique on every page, 50–60 chars for title, 140–160 chars for description.
- **Open Graph + Twitter Cards** on every page:
  - `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:type`
  - `twitter:card = summary_large_image`
- **Canonical tags** on every page (`<link rel="canonical" href="...">`).
- **Hreflang** for AR/EN versions (see #11).
- **Alt text** on every image — natural Arabic, no keyword stuffing.
- **Heading hierarchy** — exactly one `<h1>` per page.
- **Internal linking** — every service page links to the booking page and to related services.
- **Page speed** — Lighthouse ≥ 90 on mobile and desktop.

## 7. Google Rich Snippets (Structured Data)

Add JSON-LD schema markup to the relevant pages:

- **`Physician` / `MedicalBusiness`** on homepage:
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
- **`MedicalProcedure`** on each service page (Cataract, LASIK, Corneal, etc.).
- **`FAQPage`** on `/faqs`.
- **`BreadcrumbList`** on every inner page.
- **`Article`** on each blog post.
- **`LocalBusiness`** with `openingHours`, `geo`, `aggregateRating` if available.

Validate every schema at https://search.google.com/test/rich-results

## 8. Google Search Console

- Verify ownership via:
  - DNS TXT record, OR
  - HTML meta tag in `<head>`, OR
  - File upload in root
- Submit `sitemap.xml` once we confirm it covers everything.
- Manually request indexing for the top 10 pages (homepage + main services + booking).
- Monitor the coverage report for 7 days post-launch.

## 9. Sitemap

- Make sure `sitemap.xml` covers:
  - Every service page
  - Every blog post
  - The new booking page
  - AR + EN versions (with `<xhtml:link rel="alternate" hreflang="...">`)
- `lastmod` accurate on every URL.
- Link sitemap in `robots.txt`:
  ```
  Sitemap: https://drmdossary.com/sitemap.xml
  ```

## 10. Dedicated Booking Page

- Path `/booking` (and `/en/booking`) — a full standalone page, not a modal or section.
- UI should match the mockup in the management contract (3 steps: service → date/time → contact).
- Live calendar excluding booked slots.
- WhatsApp + email confirmation.
- Page-level conversion event firing on submit (Meta Pixel + TikTok Pixel + GA4 `generate_lead`).
- Every CTA across the site routes to `/booking`.

## 11. Bilingual AR/EN with Arabic Default

- **Arabic = default** on `drmdossary.com/` (root).
- **English = `/en/`** subpath.
- Every AR page needs an EN counterpart and vice versa.
- Language toggle pill in the header/nav.
- `<html lang="ar" dir="rtl">` on AR pages, `<html lang="en" dir="ltr">` on EN.
- Hreflang tags in `<head>` on every page:
  ```html
  <link rel="alternate" hreflang="ar" href="https://drmdossary.com/path" />
  <link rel="alternate" hreflang="en" href="https://drmdossary.com/en/path" />
  <link rel="alternate" hreflang="x-default" href="https://drmdossary.com/path" />
  ```
- Sitemap covers both versions with hreflang links.

---

## Priority order

1. **Domain cutover** (#1) — first, because SEO and Search Console all need the apex live.
2. **Responsive + image + logo fixes** (#2-#4) — visual polish before anyone sees it.
3. **Em dashes removal** (#5) — quick, do it alongside #2.
4. **Booking page** (#10) — the conversion hub.
5. **Bilingual setup** (#11) — structural; start once pages are stable.
6. **SEO + schema + sitemap + Search Console** (#6-#9) — final layer before launch.

---

Any blocker, post in the group.
