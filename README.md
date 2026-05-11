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
├─ data/needed-uploads.txt     97 media files still needed (drop into uploads/)
├─ uploads/                    where the original media must be restored
├─ scripts/parse_sql.py        text-only SQL extractor (no execution)
├─ scripts/build_site.py       sanitizer + static-site generator
├─ SECURITY_REPORT.md          all suspicious findings
├─ vercel.json                 hosting + security headers config
└─ backup-source/              raw WP backup; ignored by git, never deployed
```

## Run, build, and deploy

The site is **pure static HTML** — no Node, no PHP, no database. The
generated files already live in the repo, so nothing has to be built
before deploying. The commands below are for local preview and (only if
you ever need to regenerate from the SQL dump) for re-running the
sanitizer.

### Install dependencies

Nothing is required for serving. Only the regenerator needs Python deps:

```bash
# Optional — only if you plan to re-run scripts/build_site.py
pip install beautifulsoup4 lxml
```

### Run locally

Any static file server works. Pick one:

```bash
# Python (stdlib only)
python3 -m http.server 8000

# or Node (no install needed)
npx serve .
```

Then open <http://localhost:8000/>.

### Build

No build step. The HTML in the repo *is* the build output. If you have
the original `backup-source/` available and want to regenerate:

```bash
python3 scripts/parse_sql.py      # reads backup-source/*.sql → /tmp/extract/*.json
python3 scripts/build_site.py     # rewrites every page from the parsed data
```

### Push to GitHub

```bash
git add -A
git commit -m "Update site"
git push origin main
```

### Deploy on Vercel

First time:

```bash
npx vercel link        # one-time: connect this folder to a Vercel project
npx vercel --prod      # deploy to production
```

After that, Vercel auto-deploys on every push to `main` once the GitHub
integration is enabled. `vercel.json` already configures clean URLs,
security headers, and redirects for legacy WordPress endpoints.

## Sanitization

The build script keeps an allow-list of safe HTML tags/attributes and
sanitizes every retained post body. See `SECURITY_REPORT.md` for the full
list of stripped tags, blocked URL schemes, and excluded posts.

## Restoring media

The backup tarball does **not** contain `wp-content/uploads/`. The list of
files still needed is in `data/needed-uploads.txt`. Obtain them from your
hosting provider's file backup (Hostinger / cPanel) and copy them into
`uploads/` preserving the same `YYYY/MM/...` folder structure that
WordPress used.
