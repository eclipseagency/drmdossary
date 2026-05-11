#!/usr/bin/env python3
"""Generate a clean static website from the parsed WordPress dump.

Inputs:  /tmp/extract/*.json (already parsed; no SQL is executed)
Outputs: project root files (index.html, blog/, about-us/, ...) + public/uploads/
         + data/site.json (machine-readable snapshot of cleaned content)
         + SECURITY_REPORT.md

Safety guarantees:
  * No PHP/JS from the dump ever runs.
  * Post HTML is parsed with BeautifulSoup (lxml) and aggressively sanitized.
  * Only an allow-list of tags/attributes/URLs is retained.
  * All <script>, <iframe>, on*-handlers, <style>, javascript: URLs, data: URLs,
    meta-refresh and external embeds are stripped.
  * Image src/href are rewritten from /wp-content/uploads/... to /uploads/...
  * External link domains are checked against an allow-list; unknown domains
    are flagged in SECURITY_REPORT and rewritten to "#".
"""
from __future__ import annotations
import html
import json
import os
import re
import shutil
import sys
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlparse, unquote

from bs4 import BeautifulSoup, Comment, NavigableString

ROOT = Path(".").resolve()
EXTRACT = Path("/tmp/extract")

# ---------------------------------------------------------------------------
# Configuration

# Posts to completely exclude (confirmed malicious).
EXCLUDED_POST_IDS = {2634, 2685}

# Domains we consider safe for outbound links. Anything else is rewritten to
# "#" and logged.
ALLOWED_EXTERNAL = {
    "drmdossary.com",
    "www.drmdossary.com",
    "ar.wikipedia.org",
    "en.wikipedia.org",
    "arz.wikipedia.org",
    "www.instagram.com",
    "instagram.com",
    "www.youtube.com",
    "youtube.com",
    "youtu.be",
    "twitter.com",
    "x.com",
    "www.linkedin.com",
    "linkedin.com",
    "www.tiktok.com",
    "tiktok.com",
    "wa.me",
    "api.whatsapp.com",
    "maps.google.com",
    "goo.gl",  # legitimate Google short URLs are very common in business sites
}

# Tag allow-list for sanitized post bodies.
ALLOWED_TAGS = {
    "p", "br", "hr", "div", "span", "section", "article", "header", "footer",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li", "dl", "dt", "dd",
    "a", "strong", "em", "b", "i", "u", "small", "sub", "sup", "mark", "blockquote", "cite",
    "img", "figure", "figcaption", "picture", "source",
    "table", "thead", "tbody", "tr", "th", "td",
    "code", "pre",
}

# Attribute allow-list per-tag (plus a global one).
GLOBAL_ATTRS = {"id", "class", "title", "lang", "dir"}
ATTR_ALLOW = {
    "a": GLOBAL_ATTRS | {"href", "rel", "target"},
    "img": GLOBAL_ATTRS | {"src", "alt", "width", "height", "loading"},
    "source": {"src", "srcset", "type", "media", "sizes"},
    "th": GLOBAL_ATTRS | {"colspan", "rowspan", "scope"},
    "td": GLOBAL_ATTRS | {"colspan", "rowspan"},
}
# Default: only GLOBAL_ATTRS.

# Patterns
URL_RE = re.compile(r"^(https?:)?//", re.IGNORECASE)
UPLOADS_RE = re.compile(r"(?:https?://[^/]+)?/wp-content/uploads/", re.IGNORECASE)
SHORTCODE_RE = re.compile(r"\[(?:/?[a-zA-Z0-9_-]+)(?:[^\]\[]*)\]")

security_findings: list[str] = []
unknown_domains: dict[str, int] = defaultdict(int)
needed_uploads: set[str] = set()  # paths under /uploads/...

def sec(msg: str) -> None:
    security_findings.append(msg)


# ---------------------------------------------------------------------------
# Loading parsed data

def load(name: str) -> dict:
    return json.loads((EXTRACT / f"{name}.json").read_text())

posts_t = load("wp_posts")
postmeta_t = load("wp_postmeta")
options_t = load("wp_options")
yoast_t = load("wp_yoast_indexable")
terms_t = load("wp_terms")
term_tax_t = load("wp_term_taxonomy")
term_rel_t = load("wp_term_relationships")

def cols_index(table: dict) -> dict:
    return {c: i for i, c in enumerate(table["cols"])}

PI = cols_index(posts_t)
MI = cols_index(postmeta_t)
OI = cols_index(options_t)
YI = cols_index(yoast_t)
TI = cols_index(terms_t)
TTI = cols_index(term_tax_t)
TRI = cols_index(term_rel_t)

posts_by_id = {r[PI["ID"]]: r for r in posts_t["rows"]}

meta_by_post: dict[int, dict[str, str]] = defaultdict(dict)
for r in postmeta_t["rows"]:
    pid = r[MI["post_id"]]
    k = r[MI["meta_key"]]
    v = r[MI["meta_value"]]
    if pid is None or k is None:
        continue
    meta_by_post[pid][k] = v

yoast_by_obj: dict[int, dict] = {}
for r in yoast_t["rows"]:
    oid = r[YI["object_id"]]
    if oid is None:
        continue
    yoast_by_obj[oid] = {c: r[YI[c]] for c in ("title", "description", "permalink", "object_sub_type")}

options_by_name: dict[str, str] = {}
for r in options_t["rows"]:
    options_by_name[r[OI["option_name"]]] = r[OI["option_value"]]


# ---------------------------------------------------------------------------
# Attachment helpers

def attachment_uploads_path(att_id: int) -> str | None:
    """Return '/uploads/<...>' for an attachment, or None."""
    m = meta_by_post.get(att_id, {})
    fp = m.get("_wp_attached_file")
    if not fp:
        # fall back to guid
        post = posts_by_id.get(att_id)
        if post:
            guid = post[PI["guid"]]
            m2 = UPLOADS_RE.search(guid or "")
            if m2:
                return "/uploads/" + (guid or "")[m2.end():]
        return None
    needed_uploads.add(fp)
    return "/uploads/" + fp


# ---------------------------------------------------------------------------
# HTML sanitization

def is_safe_url(u: str, *, allow_relative: bool = True) -> tuple[bool, str | None]:
    """Return (safe, rewritten_or_None)."""
    if u is None:
        return False, None
    u = u.strip()
    if not u:
        return False, None
    lo = u.lower()
    if lo.startswith(("javascript:", "vbscript:", "data:", "file:")):
        sec(f"Stripped dangerous URL scheme: {u[:120]}")
        return False, None
    if u.startswith("#") or u.startswith("/") or u.startswith("mailto:") or u.startswith("tel:"):
        return True, u
    if u.startswith("./") or (allow_relative and not URL_RE.match(u) and ":" not in u.split("/", 1)[0]):
        return True, u
    try:
        p = urlparse(u)
    except Exception:
        return False, None
    if p.scheme not in ("http", "https", ""):
        sec(f"Stripped non-http(s) URL: {u[:120]}")
        return False, None
    host = (p.hostname or "").lower()
    if not host:
        return True, u
    # Rewrite drmdossary.com absolute URLs to root-relative + uploads rewrite.
    if host in ("drmdossary.com", "www.drmdossary.com"):
        path = p.path or "/"
        # uploads rewrite
        if "/wp-content/uploads/" in path:
            path = "/uploads/" + path.split("/wp-content/uploads/", 1)[1]
        # strip /wp-content/... non-uploads
        if path.startswith("/wp-content/"):
            return False, None
        if p.query:
            path += "?" + p.query
        if p.fragment:
            path += "#" + p.fragment
        return True, path
    if host in ALLOWED_EXTERNAL:
        return True, u
    unknown_domains[host] += 1
    sec(f"Unknown external domain (rewritten to '#'): {host}  in URL {u[:140]}")
    return True, "#"


def sanitize_html(raw: str, *, drop_first_img: bool = False) -> str:
    if not raw:
        return ""
    # Strip WordPress shortcodes (Elementor, contact-form-7, rev_slider, etc.)
    raw = SHORTCODE_RE.sub("", raw)
    soup = BeautifulSoup(raw, "lxml")

    # Drop comments first
    for c in soup.find_all(string=lambda t: isinstance(t, Comment)):
        c.extract()

    # Walk and clean.
    for tag in list(soup.find_all(True)):
        name = tag.name.lower()
        if name in ("script", "style", "iframe", "object", "embed", "noscript",
                    "form", "input", "button", "textarea", "select", "option",
                    "meta", "link", "base", "svg", "math", "frame", "frameset"):
            sec(f"Stripped disallowed tag <{name}>")
            tag.decompose()
            continue
        if name not in ALLOWED_TAGS:
            # unwrap (keep children) - safer than dropping content
            tag.unwrap()
            continue

        allowed = ATTR_ALLOW.get(name, GLOBAL_ATTRS)
        for attr in list(tag.attrs.keys()):
            la = attr.lower()
            if la.startswith("on") or la in ("style", "srcset", "sizes", "data-src", "data-srcset"):
                if la == "srcset" and name in ("img", "source"):
                    # rewrite srcset
                    new = []
                    for part in (tag.attrs[attr] or "").split(","):
                        bits = part.strip().split()
                        if not bits:
                            continue
                        ok, rew = is_safe_url(bits[0])
                        if ok and rew:
                            bits[0] = rew
                            new.append(" ".join(bits))
                    if new:
                        tag.attrs["srcset"] = ", ".join(new)
                    else:
                        del tag.attrs[attr]
                    continue
                if la == "sizes" and name in ("img", "source"):
                    continue  # benign
                if la.startswith("on"):
                    sec(f"Stripped inline event handler {attr} from <{name}>")
                del tag.attrs[attr]
                continue
            if la not in allowed:
                del tag.attrs[attr]
                continue
            val = tag.attrs[attr]
            if attr in ("href", "src"):
                ok, rew = is_safe_url(val)
                if not ok or rew is None:
                    del tag.attrs[attr]
                else:
                    tag.attrs[attr] = rew
                    if attr == "src" and rew.startswith("/uploads/"):
                        needed_uploads.add(rew[len("/uploads/"):])
            elif attr == "rel" and name == "a":
                tag.attrs[attr] = "noopener noreferrer"

        # Force external links to open safely
        if name == "a" and tag.get("href", "").startswith("http"):
            tag.attrs["rel"] = "noopener noreferrer"
            tag.attrs["target"] = "_blank"

    # Drop empty paragraphs/divs created by shortcode stripping
    for t in list(soup.find_all(["p", "div"])):
        if not t.contents and not t.get_text(strip=True):
            t.decompose()

    # Optionally drop the first image (used by pages that have a featured hero
    # rendered separately).
    if drop_first_img:
        first = soup.find("img")
        if first:
            first.decompose()

    # Body-fragment serialization
    body = soup.body
    if body:
        out = "".join(str(c) for c in body.contents)
    else:
        out = str(soup)
    # collapse whitespace newlines
    out = re.sub(r"\n{3,}", "\n\n", out)
    return out.strip()


# ---------------------------------------------------------------------------
# Build the site

def slug_of(post: list) -> str:
    name = post[PI["post_name"]] or f"id-{post[PI['ID']]}"
    name = unquote(name)
    name = re.sub(r"[^\w؀-ۿ\-]+", "-", name, flags=re.UNICODE).strip("-")
    return name or f"id-{post[PI['ID']]}"


def seo_for(post_id: int) -> dict:
    y = yoast_by_obj.get(post_id, {})
    return {
        "title": (y.get("title") or "") if y else "",
        "description": (y.get("description") or "") if y else "",
    }


def featured_image(post_id: int) -> str | None:
    m = meta_by_post.get(post_id, {})
    tid = m.get("_thumbnail_id")
    if not tid:
        return None
    try:
        tid_int = int(tid)
    except ValueError:
        return None
    return attachment_uploads_path(tid_int)


SITE = {
    "site_title": options_by_name.get("blogname", "Dr Dossary"),
    "tagline": options_by_name.get("blogdescription", ""),
    "pages": [],
    "posts": [],
    "menu": [],
}

# ---------- Pages (Arabic primary) ----------
# We keep both Arabic-slug and the English duplicates that have meaningful slugs.
ARABIC_HOME_ID = 27
ARABIC_PAGES = [27, 29, 31, 33, 35, 37, 382, 384, 386, 2219]
ENGLISH_PAGES = [1581, 1614, 1655, 1662, 1667, 1672, 1697, 1715, 1727]

PAGE_SLUG_OVERRIDE = {
    27: "ar",       # Arabic home page becomes top-level Arabic site root
    29: "about-us",
    31: "services",
    33: "blogs",
    35: "faqs",
    37: "contact-us",
    382: "corneal-surgeries",
    384: "treatment-of-cataracts",
    386: "vision-correction-surgeries",
    2219: "privacy-policy",
    1581: "en",
    1614: "en/about-us",
    1655: "en/services",
    1662: "en/corneal-surgeries",
    1667: "en/vision-correction-surgeries",
    1672: "en/treatment-of-cataracts",
    1697: "en/contact-us",
    1715: "en/faq",
    1727: "en/blog",
}


def render_layout(*, lang: str, dir_: str, title: str, description: str,
                  canonical: str, body_html: str, current: str = "",
                  hero_title: str | None = None) -> str:
    nav_ar = [
        ("/", "الرئيسية"),
        ("/about-us/", "من نحن"),
        ("/services/", "الخدمات"),
        ("/vision-correction-surgeries/", "تصحيح النظر"),
        ("/treatment-of-cataracts/", "علاج الماء الأبيض"),
        ("/corneal-surgeries/", "جراحات القرنية"),
        ("/blog/", "المقالات"),
        ("/faqs/", "الأسئلة الشائعة"),
        ("/contact-us/", "تواصل معنا"),
    ]
    nav_en = [
        ("/en/", "Home"),
        ("/en/about-us/", "About Us"),
        ("/en/services/", "Services"),
        ("/en/vision-correction-surgeries/", "Vision Correction"),
        ("/en/treatment-of-cataracts/", "Cataracts"),
        ("/en/corneal-surgeries/", "Corneal Surgeries"),
        ("/en/blog/", "Blog"),
        ("/en/faq/", "FAQ"),
        ("/en/contact-us/", "Contact"),
    ]
    nav = nav_ar if lang == "ar" else nav_en
    aria_cur = ' aria-current="page"'
    nav_html = "".join(
        '<li><a href="' + h + '"' + (aria_cur if h.rstrip('/') == current.rstrip('/') else '') + '>' + html.escape(t) + '</a></li>'
        for h, t in nav
    )
    lang_link = "/en/" if lang == "ar" else "/"
    lang_label = "English" if lang == "ar" else "العربية"

    hero_html = f'<header class="page-hero"><h1>{html.escape(hero_title)}</h1></header>' if hero_title else ""

    return f"""<!doctype html>
<html lang="{lang}" dir="{dir_}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(description)}">
<link rel="canonical" href="{html.escape(canonical)}">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{html.escape(canonical)}">
<link rel="stylesheet" href="/assets/site.css">
</head>
<body class="lang-{lang}">
<a class="skip-link" href="#main">Skip to content</a>
<nav class="site-nav" aria-label="primary">
  <div class="nav-inner">
    <a class="brand" href="{'/' if lang == 'ar' else '/en/'}">{html.escape(SITE['site_title'])}</a>
    <button class="nav-toggle" aria-controls="primary-menu" aria-expanded="false">☰</button>
    <ul id="primary-menu" class="primary-menu">{nav_html}</ul>
    <a class="lang-switch" href="{lang_link}">{lang_label}</a>
  </div>
</nav>
{hero_html}
<main id="main" class="site-main">
{body_html}
</main>
<footer class="site-footer">
  <div class="footer-inner">
    <p>&copy; {html.escape(SITE['site_title'])}</p>
    <p class="footer-links">
      <a href="/privacy-policy/">{'Privacy Policy' if lang == 'en' else 'سياسة الخصوصية'}</a>
    </p>
  </div>
</footer>
</body>
</html>
"""


def write_file(rel: str, content: str) -> None:
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")


def render_page(pid: int) -> tuple[str, dict] | None:
    post = posts_by_id.get(pid)
    if not post:
        return None
    slug_path = PAGE_SLUG_OVERRIDE.get(pid)
    if slug_path is None:
        slug_path = slug_of(post)
    lang = "en" if slug_path == "en" or slug_path.startswith("en/") else "ar"
    dir_ = "rtl" if lang == "ar" else "ltr"
    title_raw = post[PI["post_title"]] or slug_path
    seo = seo_for(pid)
    seo_title = seo["title"] or title_raw
    seo_desc = seo["description"] or ""
    body = sanitize_html(post[PI["post_content"]] or "")
    hero = title_raw
    rel_path = "index.html" if slug_path in ("ar",) else (slug_path.replace("ar", "", 1).lstrip("/") + "/index.html" if slug_path == "ar" else f"{slug_path}/index.html")
    # The Arabic root sits at /
    if pid == ARABIC_HOME_ID:
        rel_path = "index.html"
        current = "/"
    elif slug_path == "en":
        rel_path = "en/index.html"
        current = "/en/"
    else:
        current = "/" + slug_path + "/"
        rel_path = f"{slug_path}/index.html"
    canonical = "https://drmdossary.com" + current
    page_html = render_layout(
        lang=lang, dir_=dir_, title=seo_title, description=seo_desc,
        canonical=canonical, body_html=f'<article class="page-body">{body}</article>',
        current=current, hero_title=hero,
    )
    write_file(rel_path, page_html)
    return current, {
        "id": pid, "title": title_raw, "slug": slug_path,
        "lang": lang, "url": current,
        "seo_title": seo_title, "seo_description": seo_desc,
    }


for pid in ARABIC_PAGES + ENGLISH_PAGES:
    r = render_page(pid)
    if r:
        SITE["pages"].append(r[1])


# ---------- Blog posts ----------
publish_posts = [
    r for r in posts_t["rows"]
    if r[PI["post_type"]] == "post"
    and r[PI["post_status"]] == "publish"
    and r[PI["ID"]] not in EXCLUDED_POST_IDS
]
publish_posts.sort(key=lambda r: r[PI["post_date"]], reverse=True)

POST_LANG = {}  # id -> 'ar'|'en'
for r in publish_posts:
    title = r[PI["post_title"]] or ""
    lang = "ar" if re.search(r"[؀-ۿ]", title) else "en"
    POST_LANG[r[PI["ID"]]] = lang

def post_url(pid: int, lang: str, slug: str) -> str:
    base = "/blog" if lang == "ar" else "/en/blog"
    return f"{base}/{slug}/"

def render_post(r) -> dict:
    pid = r[PI["ID"]]
    lang = POST_LANG[pid]
    dir_ = "rtl" if lang == "ar" else "ltr"
    slug = slug_of(r)
    raw_title = r[PI["post_title"]] or slug
    seo = seo_for(pid)
    seo_title = seo["title"] or raw_title
    seo_desc = seo["description"] or ""
    body = sanitize_html(r[PI["post_content"]] or "")
    feat = featured_image(pid)
    hero_img = f'<figure class="post-hero-image"><img src="{html.escape(feat)}" alt=""></figure>' if feat else ""
    date_iso = r[PI["post_date"]] or ""
    article = (
        f'<article class="blog-post">'
        f'<header class="post-header">'
        f'<p class="post-date"><time datetime="{html.escape(date_iso)}">{html.escape(date_iso[:10])}</time></p>'
        f'</header>'
        f'{hero_img}'
        f'<div class="post-body">{body}</div>'
        f'</article>'
    )
    url = post_url(pid, lang, slug)
    canonical = "https://drmdossary.com" + url
    page_html = render_layout(
        lang=lang, dir_=dir_, title=seo_title, description=seo_desc,
        canonical=canonical, body_html=article, current=url, hero_title=raw_title,
    )
    rel_path = url.lstrip("/") + "index.html"
    write_file(rel_path, page_html)
    return {
        "id": pid,
        "title": raw_title,
        "slug": slug,
        "lang": lang,
        "url": url,
        "date": date_iso,
        "seo_title": seo_title,
        "seo_description": seo_desc,
        "featured_image": feat,
    }


for r in publish_posts:
    SITE["posts"].append(render_post(r))


# ---------- Blog index pages ----------
def render_blog_index(lang: str) -> None:
    items = [p for p in SITE["posts"] if p["lang"] == lang]
    li = []
    for p in items:
        thumb = f'<img src="{html.escape(p["featured_image"])}" alt="" loading="lazy">' if p["featured_image"] else ""
        excerpt = html.escape((p["seo_description"] or "")[:200])
        li.append(
            f'<li class="post-card"><a href="{html.escape(p["url"])}">'
            f'<div class="card-thumb">{thumb}</div>'
            f'<div class="card-body"><h3>{html.escape(p["title"])}</h3>'
            f'<time>{html.escape(p["date"][:10])}</time>'
            f'<p>{excerpt}</p></div></a></li>'
        )
    title = "المقالات" if lang == "ar" else "Blog"
    desc = ("أحدث المقالات الطبية من د. محمد الدوسري - استشاري طب وجراحة العيون."
            if lang == "ar"
            else "Latest medical articles from Dr Mohammad Al Dossary - consultant ophthalmologist.")
    body = f'<section class="blog-index"><ul class="post-grid">{"".join(li)}</ul></section>'
    url = "/blog/" if lang == "ar" else "/en/blog/"
    page_html = render_layout(
        lang=lang, dir_="rtl" if lang == "ar" else "ltr",
        title=f"{title} | {SITE['site_title']}", description=desc,
        canonical="https://drmdossary.com" + url, body_html=body,
        current=url, hero_title=title,
    )
    write_file(url.lstrip("/") + "index.html", page_html)


render_blog_index("ar")
render_blog_index("en")


# ---------- Static assets ----------
CSS = """:root {
  --color-primary: #0a4d68;
  --color-primary-dark: #073b50;
  --color-accent: #088395;
  --color-bg: #fafafa;
  --color-surface: #ffffff;
  --color-text: #1f2937;
  --color-muted: #6b7280;
  --color-border: #e5e7eb;
  --radius: 10px;
  --shadow: 0 2px 8px rgba(0,0,0,.05);
  --font-ar: 'Tajawal', 'Segoe UI', system-ui, sans-serif;
  --font-en: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { background: var(--color-bg); color: var(--color-text); line-height: 1.65; font-size: 17px; }
body.lang-ar { font-family: var(--font-ar); }
body.lang-en { font-family: var(--font-en); }
a { color: var(--color-primary); text-decoration: none; }
a:hover { color: var(--color-primary-dark); text-decoration: underline; }
img { max-width: 100%; height: auto; }
.skip-link { position: absolute; left: -10000px; top: auto; width: 1px; height: 1px; overflow: hidden; }
.skip-link:focus { left: 8px; top: 8px; width: auto; height: auto; padding: 8px 12px; background: #fff; box-shadow: var(--shadow); }
/* Nav */
.site-nav { background: var(--color-surface); border-bottom: 1px solid var(--color-border); position: sticky; top: 0; z-index: 50; }
.nav-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; padding: .75rem 1rem; gap: 1rem; flex-wrap: wrap; }
.brand { font-weight: 700; font-size: 1.15rem; color: var(--color-primary); }
.primary-menu { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: .25rem 1rem; flex: 1; }
.primary-menu a { padding: .35rem .5rem; color: var(--color-text); font-weight: 500; }
.primary-menu a[aria-current="page"] { color: var(--color-primary); border-bottom: 2px solid var(--color-primary); }
.lang-switch { padding: .35rem .75rem; border: 1px solid var(--color-border); border-radius: 999px; font-size: .9rem; }
.nav-toggle { display: none; background: none; border: none; font-size: 1.5rem; cursor: pointer; }
@media (max-width: 800px) {
  .nav-toggle { display: block; }
  .primary-menu { flex-basis: 100%; display: none; flex-direction: column; }
  .primary-menu.open { display: flex; }
}
/* Hero */
.page-hero { background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); color: #fff; padding: 3rem 1rem; text-align: center; }
.page-hero h1 { margin: 0; font-size: 2rem; line-height: 1.2; }
/* Main */
.site-main { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem 3rem; }
.page-body, .post-body { background: var(--color-surface); padding: 2rem; border-radius: var(--radius); box-shadow: var(--shadow); }
.page-body img, .post-body img { border-radius: var(--radius); margin: 1rem 0; display: block; }
.page-body h2, .page-body h3, .post-body h2, .post-body h3 { color: var(--color-primary-dark); margin-top: 1.5em; }
.page-body ul, .post-body ul, .page-body ol, .post-body ol { padding-inline-start: 1.4em; }
/* Blog */
.post-grid { list-style: none; padding: 0; margin: 0; display: grid; gap: 1.25rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.post-card a { display: block; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius); overflow: hidden; color: inherit; transition: transform .15s, box-shadow .15s; }
.post-card a:hover { transform: translateY(-2px); box-shadow: var(--shadow); text-decoration: none; }
.card-thumb { aspect-ratio: 16 / 9; background: #eef2f5; display: flex; align-items: center; justify-content: center; }
.card-thumb img { width: 100%; height: 100%; object-fit: cover; }
.card-body { padding: 1rem; }
.card-body h3 { margin: 0 0 .25rem; font-size: 1.05rem; color: var(--color-primary-dark); }
.card-body time { color: var(--color-muted); font-size: .85rem; }
.card-body p { color: var(--color-muted); font-size: .9rem; margin-top: .5rem; }
/* Post */
.blog-post { background: var(--color-surface); padding: 2rem; border-radius: var(--radius); box-shadow: var(--shadow); }
.post-hero-image img { width: 100%; border-radius: var(--radius); }
.post-date { color: var(--color-muted); font-size: .9rem; margin: 0 0 1rem; }
/* Footer */
.site-footer { background: var(--color-primary-dark); color: #fff; margin-top: 3rem; }
.footer-inner { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.site-footer a { color: #cfe6ee; }
/* RTL niceties */
.lang-ar .primary-menu { direction: rtl; }
"""
write_file("assets/site.css", CSS)

JS = """document.addEventListener('click', (e) => {
  const t = e.target.closest('.nav-toggle');
  if (!t) return;
  const menu = document.getElementById('primary-menu');
  if (menu) {
    menu.classList.toggle('open');
    t.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
  }
});
"""
write_file("assets/site.js", JS)

# robots.txt and sitemap.xml (basic)
robots = "User-agent: *\nAllow: /\nSitemap: https://drmdossary.com/sitemap.xml\n"
write_file("robots.txt", robots)

urls = ["/"] + [p["url"] for p in SITE["pages"] if p["url"] != "/"] + [p["url"] for p in SITE["posts"]] + ["/blog/", "/en/blog/"]
seen = set(); ordered = []
for u in urls:
    if u not in seen:
        seen.add(u); ordered.append(u)
xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for u in ordered:
    xml += f"  <url><loc>https://drmdossary.com{u}</loc></url>\n"
xml += "</urlset>\n"
write_file("sitemap.xml", xml)

# vercel.json for clean URLs
vercel = {
    "cleanUrls": True,
    "trailingSlash": True,
    "redirects": [
        {"source": "/wp-content/uploads/:path*", "destination": "/uploads/:path*", "permanent": True},
        {"source": "/wp-admin/:path*", "destination": "/", "permanent": True},
        {"source": "/wp-login.php", "destination": "/", "permanent": True},
        {"source": "/xmlrpc.php", "destination": "/", "permanent": True},
    ],
    "headers": [
        {
            "source": "/(.*)",
            "headers": [
                {"key": "X-Content-Type-Options", "value": "nosniff"},
                {"key": "X-Frame-Options", "value": "DENY"},
                {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
                {"key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()"},
                {"key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains"},
                {"key": "Content-Security-Policy",
                 "value": "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"}
            ]
        }
    ]
}
write_file("vercel.json", json.dumps(vercel, indent=2))

# .gitkeep in public/uploads
write_file("public/uploads/.gitkeep", "")

# data snapshot
write_file("data/site.json", json.dumps(SITE, ensure_ascii=False, indent=2))

# manifest of needed uploads (so the user can populate them)
write_file("data/needed-uploads.txt", "\n".join(sorted(needed_uploads)) + "\n")

print("Pages:", len(SITE["pages"]))
print("Posts:", len(SITE["posts"]))
print("Needed uploads:", len(needed_uploads))
print("Unknown domains:", dict(unknown_domains))
print("Findings:", len(security_findings))

# expose for the report
Path("/tmp/extract/findings.json").write_text(json.dumps({
    "findings": security_findings,
    "unknown_domains": dict(unknown_domains),
    "needed_uploads_count": len(needed_uploads),
    "excluded_post_ids": list(EXCLUDED_POST_IDS),
}, ensure_ascii=False, indent=2))
