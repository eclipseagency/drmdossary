# Dr Dossary Website

This repository contains the clean rebuilt version of the Dr Dossary website.

The original website was built with WordPress, and the content/assets are being prepared to be migrated into a clean static website suitable for GitHub and Vercel deployment.

## Project Goal

- Extract clean website content
- Move images and media safely
- Remove WordPress/PHP dependencies
- Prepare the website for deployment on Vercel

## Notes

The old WordPress backup files such as SQL, XML, ZIP, TAR, and WordPress core files should not be uploaded directly to this repository.

Only the cleaned final website files should be committed.

## Deployment

This project is a static site ready for Vercel. After deploying, the site
serves directly from the root: `/` (Arabic) and `/en/` (English).

`vercel.json` adds:
* Permanent redirects from legacy WordPress endpoints (`/wp-admin/*`,
  `/wp-login.php`, `/xmlrpc.php`) to `/`.
* A rewrite from `/wp-content/uploads/:path*` to `/uploads/:path*`.
* Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy,
  Permissions-Policy).

## Project structure

```
/                              clean Arabic site root
├─ index.html                  Arabic home
├─ about-us/, services/, ...   Arabic top-level pages
├─ blog/                       Arabic blog index and posts
├─ en/                         English mirror
├─ assets/site.css, site.js    shared CSS/JS
├─ data/site.json              machine-readable content snapshot
├─ data/needed-uploads.txt     97 media files still needed (drop into public/uploads/)
├─ public/uploads/             where the original media must be restored
├─ scripts/parse_sql.py        text-only SQL extractor (no execution)
├─ scripts/build_site.py       sanitizer + static-site generator
├─ SECURITY_REPORT.md          all suspicious findings
├─ vercel.json                 hosting + security headers config
└─ backup-source/              raw WP backup; ignored by git, never deployed
```

## Rebuilding

```bash
pip install beautifulsoup4 lxml
python3 scripts/parse_sql.py      # writes /tmp/extract/*.json
python3 scripts/build_site.py     # regenerates all static pages
```

The build script keeps an allow-list of safe HTML tags/attributes and
sanitizes every retained post body. See `SECURITY_REPORT.md` for the full
list of stripped tags, blocked URL schemes, and excluded posts.

## Restoring media

The backup tarball does **not** contain `wp-content/uploads/`. The list of
files still needed is in `data/needed-uploads.txt`. Obtain them from your
hosting provider's file backup (Hostinger / cPanel) and copy them into
`public/uploads/` preserving the same `YYYY/MM/...` folder structure that
WordPress used.
