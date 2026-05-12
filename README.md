# Dr Dossary website

Production rebuild of [drmdossary.com](https://drmdossary.com) on Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion. Deployed on Vercel.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14.2 (App Router, React 18) |
| Language | TypeScript |
| Styling | Tailwind CSS 3.4 + a small set of design tokens in `tailwind.config.ts` |
| Motion | Framer Motion 11 (scroll reveals, 3D tilt, page-level animations) |
| Fonts | `next/font` self-hosting **Cairo** (Arabic, RTL) and **Inter** (English, LTR) |
| Images | `next/image` reading from `public/uploads/` |
| Deploy | Vercel (managed Node runtime; SSR for layout, static for content) |

## Project shape

```
app/
├── layout.tsx                          root layout, reads pathname → sets <html lang/dir>
├── globals.css                         tailwind base + design tokens + .prose-medical
├── page.tsx                            Arabic home (/)
├── en/page.tsx                         English home (/en/)
├── about-us/, services/, contact-us/   Arabic pages
├── faqs/, privacy-policy/              Arabic pages
├── corneal-surgeries/, treatment-of-cataracts/, vision-correction-surgeries/
├── blog/page.tsx                       Arabic blog index
├── blog/[slug]/page.tsx                Arabic blog post (statically generated)
├── en/about-us/, en/services/, ...     English mirror
├── sitemap.ts, robots.ts               generated at build
└── not-found.tsx                       bilingual 404

components/
├── Header.tsx                          sticky glass nav with mobile menu (Framer Motion)
├── Footer.tsx                          curved SVG divider, contact column, dot pattern
├── PageHero.tsx                        gradient hero with floating shapes + noise
├── Breadcrumbs.tsx                     simple semantic ol
├── Reveal.tsx                          IntersectionObserver entrance animation
├── TiltCard.tsx                        pointer-driven 3D tilt with glare (RTL-aware)
├── BlogCard.tsx, BlogIndex.tsx, BlogPost.tsx
├── CTABand.tsx                         shared booking CTA band
├── FAQAccordion.tsx                    animated <details>-style accordion
├── ContactPage.tsx                     contact card grid (address / phone / email / hours)
├── ServicePage.tsx, ServicesIndex.tsx  service detail + index
├── InnerPage.tsx                       generic page wrapper for sanitized content
└── home/
    ├── HomeHero.tsx                    doctor portrait card with 3D ring, cursor spotlight
    ├── ServicesBento.tsx               bento grid (feature card + 2 side cards)
    ├── AboutPreview.tsx                3D photo frame + bio teaser
    ├── WhyUs.tsx                       four-card feature grid with custom SVG icons
    ├── Testimonials.tsx                masonry of Google-review screenshots with stagger
    └── BlogPreview.tsx                 latest 3 posts

lib/
├── content.ts                          loads /data/content.json
├── i18n.ts                             nav, hero text, services list, FAQ, contact info
└── utils.ts                            cn() merge helper

middleware.ts                           injects x-pathname header so layout knows the route
next.config.mjs                         trailingSlash: true, redirects for legacy WP paths
public/uploads/                         all restored site media (~640 files, ~36 MB)
data/content.json                       sanitized page + post bodies extracted from the previous static build
scripts/
├── parse_sql.py                        text-only SQL parser (audit trail)
└── extract_content.py                  rebuilds content.json from previously-rendered HTML
```

## Install, run, build

```bash
# install
npm install

# dev server with hot reload
npm run dev          # http://localhost:3000

# production build
npm run build

# serve the production build locally
npm run start

# (rare) re-extract content from the previous static rebuild
python3 scripts/extract_content.py
```

## Deploy

Vercel auto-detects this as a Next.js project. No `vercel.json` is needed — Vercel reads `next.config.mjs` for `redirects()` and `headers()`. Pushing to `main` triggers a production deploy.

## Routing & SEO

- `trailingSlash: true` preserves every previous URL (`/about-us/`, `/blog/<slug>/`, etc.) for SEO continuity.
- Legacy WordPress endpoints redirect to `/`: `/wp-admin/*`, `/wp-login.php`, `/xmlrpc.php`. The `/wp-content/uploads/*` → `/uploads/*` redirect is also preserved.
- `app/sitemap.ts` enumerates every page + post from `data/content.json`.
- `app/robots.ts` allows everything and points to the sitemap.

## RTL / i18n

There's no `[locale]` segment — the URL structure (root vs `/en/`) is the routing primitive. The root `layout.tsx` reads the `x-pathname` header (injected by `middleware.ts`) and sets `<html lang dir>` accordingly. Components consume `lang` as a prop / from `pathname`. Tailwind utilities are paired with logical properties (`ps-*`, `pe-*`, `start-*`, `end-*`) so the same classes flip correctly under `dir="rtl"`.

## Content & media

- All Arabic copy from the previous build is preserved verbatim in `data/content.json` and rendered via the `.prose-medical` Tailwind component class.
- All restored media (Google review screenshots, doctor portrait, service icons, blog featured images, logos) live under `public/uploads/` and are served by Next as static assets with long-immutable cache headers (set in `next.config.mjs`).
- The two malicious posts identified in the original WordPress audit (IDs 2634, 2685) remain excluded.
- See `SECURITY_REPORT.md` for the full audit trail of the original WordPress migration.

## Brand tokens

Defined once in `tailwind.config.ts` (color scale `brand.50…900`, `surface.*`, `ink.*`) and exposed via Tailwind utilities. The brand palette is unchanged from the previous build: teal/navy (`#0a4d68`, `#088395`, `#5DD4D4`) on white / `#f7f9fb`.
