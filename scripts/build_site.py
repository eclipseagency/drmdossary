#!/usr/bin/env python3
"""Generate a clean static website from the parsed WordPress dump.

Inputs:  /tmp/extract/*.json (already parsed; no SQL is executed)
Outputs: project root files (index.html, blog/, about-us/, ..., uploads/)
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
            tag.unwrap()
            continue

        allowed = ATTR_ALLOW.get(name, GLOBAL_ATTRS)
        for attr in list(tag.attrs.keys()):
            la = attr.lower()
            if la.startswith("on") or la in ("style", "srcset", "sizes", "data-src", "data-srcset"):
                if la == "srcset" and name in ("img", "source"):
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
                    continue
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

        if name == "a" and tag.get("href", "").startswith("http"):
            tag.attrs["rel"] = "noopener noreferrer"
            tag.attrs["target"] = "_blank"

    for t in list(soup.find_all(["p", "div"])):
        if not t.contents and not t.get_text(strip=True):
            t.decompose()

    if drop_first_img:
        first = soup.find("img")
        if first:
            first.decompose()

    body = soup.body
    if body:
        out = "".join(str(c) for c in body.contents)
    else:
        out = str(soup)
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
ARABIC_HOME_ID = 27
ARABIC_PAGES = [29, 31, 33, 35, 37, 382, 384, 386, 2219]
ENGLISH_PAGES = [1614, 1655, 1662, 1667, 1672, 1697, 1715, 1727]
ENGLISH_HOME_ID = 1581

PAGE_SLUG_OVERRIDE = {
    27: "ar",
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

# Map of page id -> service-category metadata (used on home and services index)
SERVICE_PAGES_AR = [
    (386, "/vision-correction-surgeries/", "/uploads/2024/02/vision.png", "جراحات تصحيح النظر"),
    (384, "/treatment-of-cataracts/",      "/uploads/2024/02/lasik.png",   "علاج الماء الأبيض (الساد)"),
    (382, "/corneal-surgeries/",           "/uploads/2024/02/laser.png",   "جراحات القرنية"),
]
SERVICE_PAGES_EN = [
    (1667, "/en/vision-correction-surgeries/", "/uploads/2024/02/vision.png", "Vision Correction Surgeries"),
    (1672, "/en/treatment-of-cataracts/",      "/uploads/2024/02/lasik.png",   "Cataract Treatment"),
    (1662, "/en/corneal-surgeries/",           "/uploads/2024/02/laser.png",   "Corneal Surgeries"),
]

# Curated service descriptions used on cards (concise, professional)
SERVICE_DESC_AR = {
    "/vision-correction-surgeries/": "أحدث تقنيات الليزك والليزر السطحي وزراعة العدسات لتصحيح قصر النظر، طول النظر، والاستجماتيزم بدقة عالية.",
    "/treatment-of-cataracts/": "علاج المياه البيضاء (الساد) بأحدث أنظمة الفاكو واستبدال العدسة لإعادة الرؤية الواضحة بأمان.",
    "/corneal-surgeries/": "علاج القرنية المخروطية وزراعة القرنية وتثبيتها (Cross-Linking) بإشراف استشاري بزمالة من مستشفى الملك خالد التخصصي للعيون.",
}
SERVICE_DESC_EN = {
    "/en/vision-correction-surgeries/": "Advanced LASIK, surface laser (PRK), and implantable contact lens procedures to correct myopia, hyperopia, and astigmatism with precision.",
    "/en/treatment-of-cataracts/": "Modern phacoemulsification and premium lens implantation to restore clear vision safely.",
    "/en/corneal-surgeries/": "Keratoconus management, corneal cross-linking, and corneal transplantation performed by a board-certified consultant with King Khaled Eye Specialist Hospital fellowship training.",
}

TRUST_BADGES_AR = [
    "البورد السعودي في طب وجراحة العيون",
    "زمالة مستشفى الملك خالد التخصصي للعيون",
    "أحدث التقنيات والأجهزة العالمية",
    "رعاية شخصية ومتابعة بعد الجراحة",
]
TRUST_BADGES_EN = [
    "Saudi Board in Ophthalmology",
    "King Khaled Eye Specialist Hospital fellowship",
    "Latest international equipment",
    "Personalised follow-up care",
]

DOCTOR_HEADSHOT = "/uploads/2024/02/DSC08886-1-removebg-preview.png"
HOSPITAL_IMAGE = "/uploads/2024/03/bg.jpg"
LOGO_PRIMARY = "/uploads/2024/02/logo.svg"
LOGO_LIGHT = "/uploads/2024/02/logo-f.svg"
FAVICON = "/uploads/2024/03/cropped-fav-32x32.png"
APPLE_TOUCH = "/uploads/2024/03/cropped-fav-180x180.png"

CONTACT_INFO = {
    "ar": {
        "address_label": "العنوان",
        "address": "الرياض، المملكة العربية السعودية",
        "phone_label": "هاتف للحجز",
        "phone_display": "+966 50 000 0000",
        "phone_tel": "+966500000000",
        "email_label": "البريد الإلكتروني",
        "email": "info@drmdossary.com",
        "hours_label": "ساعات العمل",
        "hours": "السبت - الخميس: 9:00 ص - 9:00 م",
        "book_cta": "احجز موعدك",
        "book_url": "/contact-us/",
    },
    "en": {
        "address_label": "Address",
        "address": "Riyadh, Saudi Arabia",
        "phone_label": "Booking line",
        "phone_display": "+966 50 000 0000",
        "phone_tel": "+966500000000",
        "email_label": "Email",
        "email": "info@drmdossary.com",
        "hours_label": "Hours",
        "hours": "Saturday – Thursday: 9:00 AM – 9:00 PM",
        "book_cta": "Book an appointment",
        "book_url": "/en/contact-us/",
    },
}


# ---------------------------------------------------------------------------
# Content extraction helpers

def text_of(node) -> str:
    return re.sub(r"\s+", " ", node.get_text(" ", strip=True)) if node else ""


def first_paragraph(html_str: str, *, min_len: int = 30) -> str:
    """Return the first meaningful text paragraph from sanitized HTML."""
    if not html_str:
        return ""
    soup = BeautifulSoup(html_str, "lxml")
    for tag in soup.find_all(["p", "div"]):
        t = text_of(tag)
        if len(t) >= min_len:
            return t
    # Fallback: largest text node
    text = text_of(soup)
    return text[:240]


def extract_sections(html_str: str) -> list[dict]:
    """Break sanitized HTML into sections keyed by h2/h3 headings.

    Returns a list of {heading, level, body_html, plain} items, one per
    heading found. The first lead paragraph (before any heading) is added
    as the {heading: None} item if present.
    """
    if not html_str:
        return []
    soup = BeautifulSoup(html_str, "lxml")
    body = soup.body or soup
    sections = []
    current = {"heading": None, "level": 0, "nodes": []}
    for node in list(body.children):
        if getattr(node, "name", None) in ("h1", "h2", "h3", "h4"):
            if current["nodes"] or current["heading"]:
                sections.append(current)
            current = {
                "heading": text_of(node),
                "level": int(node.name[1]),
                "nodes": [],
            }
        else:
            current["nodes"].append(node)
    if current["nodes"] or current["heading"]:
        sections.append(current)

    out = []
    for s in sections:
        body_html = "".join(str(n) for n in s["nodes"]).strip()
        if not body_html and not s["heading"]:
            continue
        plain = text_of(BeautifulSoup(body_html, "lxml"))
        out.append({
            "heading": s["heading"],
            "level": s["level"],
            "body_html": body_html,
            "plain": plain,
        })
    return out


# ---------------------------------------------------------------------------
# Output helpers

def write_file(rel: str, content: str) -> None:
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")


def e(s) -> str:
    """Shorthand for html.escape."""
    return html.escape("" if s is None else str(s))


# ---------------------------------------------------------------------------
# Navigation, header, footer

NAV_AR = [
    ("/", "الرئيسية"),
    ("/about-us/", "من نحن"),
    ("/services/", "الخدمات"),
    ("/blog/", "المقالات"),
    ("/faqs/", "الأسئلة الشائعة"),
    ("/contact-us/", "تواصل معنا"),
]
NAV_EN = [
    ("/en/", "Home"),
    ("/en/about-us/", "About"),
    ("/en/services/", "Services"),
    ("/en/blog/", "Blog"),
    ("/en/faq/", "FAQ"),
    ("/en/contact-us/", "Contact"),
]


def render_header(lang: str, current: str) -> str:
    nav = NAV_AR if lang == "ar" else NAV_EN
    aria_cur = ' aria-current="page"'
    nav_items = "".join(
        '<li><a href="' + h + '"' + (aria_cur if h.rstrip('/') == current.rstrip('/') else '') + '>' + e(t) + '</a></li>'
        for h, t in nav
    )
    lang_link = "/en/" if lang == "ar" else "/"
    lang_label = "English" if lang == "ar" else "العربية"
    home_link = "/" if lang == "ar" else "/en/"
    book_label = "احجز موعد" if lang == "ar" else "Book"
    book_url = "/contact-us/" if lang == "ar" else "/en/contact-us/"
    brand_name = "د. محمد الدوسري" if lang == "ar" else "Dr Mohammad Al Dossary"
    brand_sub = "استشاري طب وجراحة العيون" if lang == "ar" else "Consultant Ophthalmologist"

    return f"""<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="{home_link}">
      <img class="brand-logo" src="{LOGO_PRIMARY}" alt="" width="48" height="48" loading="eager">
      <span class="brand-text">
        <span class="brand-name">{e(brand_name)}</span>
        <span class="brand-sub">{e(brand_sub)}</span>
      </span>
    </a>
    <button class="nav-toggle" aria-controls="primary-menu" aria-expanded="false" aria-label="Toggle navigation">
      <span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span>
    </button>
    <nav class="primary-nav" aria-label="primary">
      <ul id="primary-menu" class="primary-menu">{nav_items}</ul>
    </nav>
    <div class="header-actions">
      <a class="lang-switch" href="{lang_link}" aria-label="Switch language">{lang_label}</a>
      <a class="btn btn-primary header-cta" href="{book_url}">{e(book_label)}</a>
    </div>
  </div>
</header>
"""


def render_footer(lang: str) -> str:
    c = CONTACT_INFO[lang]
    nav = NAV_AR if lang == "ar" else NAV_EN
    links = "".join(f'<li><a href="{h}">{e(t)}</a></li>' for h, t in nav)
    if lang == "ar":
        col_a_title = "د. محمد الدوسري"
        col_a_text = "رعاية شاملة لطب وجراحة العيون تستند إلى أحدث الأبحاث والتقنيات."
        col_b_title = "روابط سريعة"
        col_c_title = "تواصل معنا"
        rights = "جميع الحقوق محفوظة"
        privacy = "سياسة الخصوصية"
        privacy_url = "/privacy-policy/"
    else:
        col_a_title = "Dr Mohammad Al Dossary"
        col_a_text = "Comprehensive ophthalmology care grounded in the latest research and technology."
        col_b_title = "Quick links"
        col_c_title = "Contact"
        rights = "All rights reserved"
        privacy = "Privacy Policy"
        privacy_url = "/privacy-policy/"

    return f"""<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-col footer-brand">
      <div class="footer-logo">
        <img src="{LOGO_LIGHT}" alt="" width="56" height="56">
      </div>
      <h3>{e(col_a_title)}</h3>
      <p>{e(col_a_text)}</p>
    </div>
    <div class="footer-col">
      <h4>{e(col_b_title)}</h4>
      <ul class="footer-links">{links}</ul>
    </div>
    <div class="footer-col">
      <h4>{e(col_c_title)}</h4>
      <ul class="footer-contact">
        <li><span class="footer-label">{e(c['address_label'])}</span><span>{e(c['address'])}</span></li>
        <li><span class="footer-label">{e(c['phone_label'])}</span><a href="tel:{e(c['phone_tel'])}">{e(c['phone_display'])}</a></li>
        <li><span class="footer-label">{e(c['email_label'])}</span><a href="mailto:{e(c['email'])}">{e(c['email'])}</a></li>
        <li><span class="footer-label">{e(c['hours_label'])}</span><span>{e(c['hours'])}</span></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container footer-bottom-inner">
      <p>&copy; <span class="year"></span> {e(col_a_title)} — {e(rights)}.</p>
      <p><a href="{privacy_url}">{e(privacy)}</a></p>
    </div>
  </div>
</footer>"""


def render_layout(*, lang: str, dir_: str, title: str, description: str,
                  canonical: str, body_html: str, current: str = "",
                  body_class: str = "") -> str:
    return f"""<!doctype html>
<html lang="{lang}" dir="{dir_}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(description)}">
<link rel="canonical" href="{e(canonical)}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{e(canonical)}">
<meta property="og:image" content="https://drmdossary.com{DOCTOR_HEADSHOT}">
<meta name="theme-color" content="#0a4d68">
<link rel="icon" href="{FAVICON}" type="image/png">
<link rel="apple-touch-icon" href="{APPLE_TOUCH}">
<link rel="stylesheet" href="/assets/site.css">
<script src="/assets/site.js" defer></script>
</head>
<body class="lang-{lang} {body_class}">
{render_header(lang, current)}
<main id="main">
{body_html}
</main>
{render_footer(lang)}
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Page-template helpers (heroes, sections, CTA bands)

def render_breadcrumbs(items: list[tuple[str, str]], lang: str) -> str:
    """items: [(url, label), ...] — last item is the current page (no link)."""
    sep = "›"
    parts = []
    for i, (url, label) in enumerate(items):
        is_last = i == len(items) - 1
        if is_last:
            parts.append(f'<li class="crumb current" aria-current="page">{e(label)}</li>')
        else:
            parts.append(f'<li class="crumb"><a href="{url}">{e(label)}</a></li>')
    home = "الرئيسية" if lang == "ar" else "Home"
    home_url = "/" if lang == "ar" else "/en/"
    if items and items[0][0] != home_url:
        parts.insert(0, f'<li class="crumb"><a href="{home_url}">{e(home)}</a></li>')
    return (
        '<nav class="breadcrumbs" aria-label="breadcrumb"><div class="container">'
        '<ol>' + (f'<li class="sep" aria-hidden="true">{sep}</li>').join(parts) + '</ol>'
        '</div></nav>'
    )


def render_hero(*, lang: str, eyebrow: str, title: str, lede: str,
                image: str | None = None, ctas: list[tuple[str, str, str]] = ()) -> str:
    """Standard inner-page hero (smaller than the home hero).

    ctas: list of (url, label, variant) where variant in {"primary","ghost"}.
    """
    eyebrow_html = f'<p class="hero-eyebrow">{e(eyebrow)}</p>' if eyebrow else ""
    lede_html = f'<p class="hero-lede">{e(lede)}</p>' if lede else ""
    cta_html = ""
    if ctas:
        cta_html = '<div class="hero-ctas">' + "".join(
            f'<a class="btn btn-{var}" href="{u}">{e(l)}</a>' for u, l, var in ctas
        ) + '</div>'
    aside = ""
    if image:
        aside = f'<aside class="hero-aside"><img src="{image}" alt="" loading="eager" decoding="async"></aside>'
        layout_class = "page-hero has-image"
    else:
        layout_class = "page-hero"
    return f"""<section class="{layout_class}">
  <div class="container hero-inner">
    <div class="hero-text">
      {eyebrow_html}
      <h1 class="hero-title">{e(title)}</h1>
      {lede_html}
      {cta_html}
    </div>
    {aside}
  </div>
</section>"""


def render_cta_band(lang: str) -> str:
    if lang == "ar":
        title = "احجز موعدك مع الدكتور محمد الدوسري"
        sub = "خطوة واحدة تفصلك عن استشارة طبية متخصصة في طب وجراحة العيون."
        cta = "احجز الآن"
        sec_cta = "تواصل معنا"
        url = "/contact-us/"; sec_url = "/contact-us/"
    else:
        title = "Book a consultation with Dr Al Dossary"
        sub = "One step away from a specialised ophthalmology consultation."
        cta = "Book now"
        sec_cta = "Contact us"
        url = "/en/contact-us/"; sec_url = "/en/contact-us/"
    return f"""<section class="cta-band">
  <div class="container cta-inner">
    <div>
      <h2>{e(title)}</h2>
      <p>{e(sub)}</p>
    </div>
    <div class="cta-actions">
      <a class="btn btn-primary" href="{url}">{e(cta)}</a>
      <a class="btn btn-ghost" href="{sec_url}">{e(sec_cta)}</a>
    </div>
  </div>
</section>"""


# ---------------------------------------------------------------------------
# Home page (custom layout)

TESTIMONIAL_IMAGES = [f"/uploads/2024/03/{i}.jpeg" for i in range(1, 12)]


def render_home(lang: str) -> dict:
    if lang == "ar":
        pid = ARABIC_HOME_ID
        services = SERVICE_PAGES_AR
        descs = SERVICE_DESC_AR
        trust = TRUST_BADGES_AR
        c = CONTACT_INFO["ar"]
        eyebrow = "استشاري طب وجراحة العيون"
        title = "رعاية شاملة لرؤية أوضح وحياة أفضل"
        lede = (
            "خلفية أكاديمية راسخة، البورد السعودي في طب وجراحة العيون، وزمالة "
            "إكلينيكية من مستشفى الملك خالد التخصصي للعيون — رعاية متخصصة "
            "في القرنية، الماء الأبيض، وجراحات تصحيح النظر."
        )
        cta_primary = ("/contact-us/", "احجز موعدك", "primary")
        cta_ghost = ("/services/", "تعرّف على خدماتنا", "ghost")
        services_eyebrow = "تخصصات"
        services_title = "خدماتنا"
        services_lede = "مجموعة شاملة من الخدمات المتخصصة في طب وجراحة العيون بأحدث التقنيات."
        about_eyebrow = "عن الطبيب"
        about_title = "د. محمد الدوسري — استشاري طب وجراحة العيون"
        about_lede = (
            "تلتقي الدقة والعناية لتقديم حلول طبية متطورة في مجال القرنية، "
            "الماء الأبيض، وجراحات تصحيح النظر، مع التزام بالرعاية الشخصية والمتابعة المستمرة."
        )
        about_cta = ("/about-us/", "المزيد عن الطبيب")
        why_title = "لماذا تختار د. الدوسري؟"
        why_lede = "خبرة موثوقة وتقنيات حديثة ورعاية شخصية في كل خطوة من رحلة العلاج."
        why_items = [
            ("🎓", "خبرة معتمدة", "البورد السعودي في طب وجراحة العيون وزمالة إكلينيكية متخصصة في مستشفى الملك خالد التخصصي للعيون."),
            ("🔬", "أحدث التقنيات", "أنظمة ليزر متطورة، الفاكو، وتقنيات تشخيص دقيقة لضمان أفضل النتائج."),
            ("🛡️", "أمان ودقة", "بروتوكولات تشخيصية صارمة وفحوصات قبل العملية لضمان السلامة والنتائج المتميزة."),
            ("💬", "رعاية شخصية", "متابعة مستمرة بعد العملية ورعاية تتمحور حول كل مريض على حدة."),
        ]
        testi_title = "ثقة مرضانا"
        testi_lede = "قصص حقيقية من مرضى استعادوا رؤيتهم وثقتهم بأنفسهم."
        blog_title = "أحدث المقالات"
        blog_lede = "نصائح ومعرفة طبية موثوقة في طب وجراحة العيون."
        blog_view_all = "كل المقالات"
        blog_url = "/blog/"
    else:
        pid = ENGLISH_HOME_ID
        services = SERVICE_PAGES_EN
        descs = SERVICE_DESC_EN
        trust = TRUST_BADGES_EN
        c = CONTACT_INFO["en"]
        eyebrow = "Consultant Ophthalmologist"
        title = "Comprehensive care for clearer vision and a better life"
        lede = (
            "A strong academic foundation, the Saudi Board in Ophthalmology, and a clinical "
            "fellowship from King Khaled Eye Specialist Hospital — specialised care in "
            "corneal, cataract, and vision-correction surgery."
        )
        cta_primary = ("/en/contact-us/", "Book an appointment", "primary")
        cta_ghost = ("/en/services/", "Our services", "ghost")
        services_eyebrow = "Specialties"
        services_title = "Our Services"
        services_lede = "A complete range of specialised ophthalmology services using the latest technology."
        about_eyebrow = "About the Doctor"
        about_title = "Dr Mohammad Al Dossary — Consultant Ophthalmologist"
        about_lede = (
            "Precision and compassion combine to deliver advanced medical solutions for corneal, "
            "cataract, and vision-correction surgery — with a commitment to personalised care and "
            "long-term follow-up."
        )
        about_cta = ("/en/about-us/", "More about the doctor")
        why_title = "Why choose Dr Al Dossary?"
        why_lede = "Trusted expertise, modern technology, and personalised care at every step."
        why_items = [
            ("🎓", "Certified expertise", "Saudi Board in Ophthalmology and clinical fellowship at King Khaled Eye Specialist Hospital."),
            ("🔬", "Modern technology", "Advanced laser platforms, phacoemulsification, and precise diagnostic tools to achieve the best outcomes."),
            ("🛡️", "Safety & precision", "Strict diagnostic protocols and pre-operative work-ups to ensure safety and excellent results."),
            ("💬", "Personalised care", "Continuous post-operative follow-up and care designed around each patient."),
        ]
        testi_title = "Patient stories"
        testi_lede = "Real stories from patients who regained their vision and confidence."
        blog_title = "Latest articles"
        blog_lede = "Trusted medical insight on eye health and surgical care."
        blog_view_all = "All articles"
        blog_url = "/en/blog/"

    seo = seo_for(pid)
    if lang == "ar":
        seo_title_default = "د. محمد الدوسري — استشاري طب وجراحة العيون | الرياض"
    else:
        seo_title_default = "Dr Mohammad Al Dossary — Consultant Ophthalmologist | Riyadh"
    seo_title = seo["title"] or seo_title_default
    # If Yoast title is identical to or already contains the brand, don't append it again.
    if "الدوسري" not in seo_title and "Dossary" not in seo_title:
        seo_title = seo_title + (" | Dr Mohammad Al Dossary" if lang == "en" else " | د. محمد الدوسري")
    seo_desc = seo["description"] or lede

    # Build hero
    badges_html = "".join(f'<li>{e(b)}</li>' for b in trust)
    hero = f"""<section class="home-hero">
  <div class="container home-hero-inner">
    <div class="home-hero-text">
      <p class="hero-eyebrow">{e(eyebrow)}</p>
      <h1 class="home-hero-title">{e(title)}</h1>
      <p class="home-hero-lede">{e(lede)}</p>
      <div class="hero-ctas">
        <a class="btn btn-primary btn-lg" href="{cta_primary[0]}">{e(cta_primary[1])}</a>
        <a class="btn btn-ghost btn-lg" href="{cta_ghost[0]}">{e(cta_ghost[1])}</a>
      </div>
      <ul class="trust-badges">{badges_html}</ul>
    </div>
    <div class="home-hero-aside">
      <div class="doctor-card">
        <img src="{DOCTOR_HEADSHOT}" alt="" loading="eager" decoding="async">
      </div>
    </div>
  </div>
</section>"""

    # About section
    about = f"""<section class="section section-about">
  <div class="container two-col">
    <div class="about-media">
      <img src="/uploads/2024/02/Group-10.png" alt="" loading="lazy">
    </div>
    <div class="about-copy">
      <p class="eyebrow">{e(about_eyebrow)}</p>
      <h2 class="section-title">{e(about_title)}</h2>
      <p class="lede">{e(about_lede)}</p>
      <a class="btn btn-ghost" href="{about_cta[0]}">{e(about_cta[1])}</a>
    </div>
  </div>
</section>"""

    # Services grid
    cards = []
    for sid, url, icon, name in services:
        desc = descs.get(url, "")
        more = "اعرف المزيد" if lang == "ar" else "Learn more"
        cards.append(f"""<a class="service-card" href="{url}">
  <span class="service-icon"><img src="{icon}" alt="" loading="lazy"></span>
  <h3>{e(name)}</h3>
  <p>{e(desc)}</p>
  <span class="service-link">{e(more)} <span aria-hidden="true">→</span></span>
</a>""")
    services_section = f"""<section class="section section-services">
  <div class="container">
    <div class="section-head">
      <p class="eyebrow">{e(services_eyebrow)}</p>
      <h2 class="section-title">{e(services_title)}</h2>
      <p class="section-lede">{e(services_lede)}</p>
    </div>
    <div class="service-grid">{''.join(cards)}</div>
  </div>
</section>"""

    # Why us
    why_cards = []
    for icon, t_, d_ in why_items:
        why_cards.append(f"""<div class="feature-card">
  <div class="feature-icon" aria-hidden="true">{icon}</div>
  <h3>{e(t_)}</h3>
  <p>{e(d_)}</p>
</div>""")
    why = f"""<section class="section section-why">
  <div class="container">
    <div class="section-head center">
      <h2 class="section-title">{e(why_title)}</h2>
      <p class="section-lede">{e(why_lede)}</p>
    </div>
    <div class="feature-grid">{''.join(why_cards)}</div>
  </div>
</section>"""

    # Testimonials — use the patient image cards
    testi_cards = "".join(
        f'<figure class="testi-card"><img src="{img}" alt="" loading="lazy"></figure>'
        for img in TESTIMONIAL_IMAGES
    )
    testi = f"""<section class="section section-testimonials">
  <div class="container">
    <div class="section-head center">
      <h2 class="section-title">{e(testi_title)}</h2>
      <p class="section-lede">{e(testi_lede)}</p>
    </div>
    <div class="testi-marquee">{testi_cards}</div>
  </div>
</section>"""

    # Latest blog posts (top 3 of the matching language)
    lang_posts = [p for p in SITE["posts"] if p["lang"] == lang][:3]
    bcards = []
    for p in lang_posts:
        thumb = (
            f'<img src="{e(p["featured_image"])}" alt="" loading="lazy">'
            if p["featured_image"] else '<div class="thumb-fallback"></div>'
        )
        excerpt = (p["seo_description"] or "")[:140]
        bcards.append(f"""<article class="blog-card">
  <a class="blog-card-link" href="{e(p['url'])}">
    <div class="blog-card-thumb">{thumb}</div>
    <div class="blog-card-body">
      <time datetime="{e(p['date'])}">{e(p['date'][:10])}</time>
      <h3>{e(p['title'])}</h3>
      <p>{e(excerpt)}</p>
    </div>
  </a>
</article>""")
    blog_section = f"""<section class="section section-blog">
  <div class="container">
    <div class="section-head row">
      <div>
        <h2 class="section-title">{e(blog_title)}</h2>
        <p class="section-lede">{e(blog_lede)}</p>
      </div>
      <a class="btn btn-ghost" href="{blog_url}">{e(blog_view_all)} <span aria-hidden="true">→</span></a>
    </div>
    <div class="blog-grid">{''.join(bcards)}</div>
  </div>
</section>"""

    body = hero + about + services_section + why + testi + blog_section + render_cta_band(lang)
    url = "/" if lang == "ar" else "/en/"
    page_html = render_layout(
        lang=lang, dir_="rtl" if lang == "ar" else "ltr",
        title=seo_title, description=seo_desc,
        canonical="https://drmdossary.com" + url,
        body_html=body, current=url, body_class="home",
    )
    write_file("index.html" if lang == "ar" else "en/index.html", page_html)
    return {
        "id": pid, "title": title, "slug": "ar" if lang == "ar" else "en",
        "lang": lang, "url": url, "seo_title": seo_title, "seo_description": seo_desc,
    }


# ---------------------------------------------------------------------------
# Service page renderer (per-surgery detail page)

def render_service_page(pid: int) -> dict | None:
    post = posts_by_id.get(pid)
    if not post:
        return None
    slug_path = PAGE_SLUG_OVERRIDE[pid]
    lang = "en" if slug_path.startswith("en/") else "ar"
    dir_ = "rtl" if lang == "ar" else "ltr"
    current = "/" + slug_path + "/"
    title_raw = post[PI["post_title"]] or slug_path
    seo = seo_for(pid)
    seo_title = seo["title"] or title_raw
    seo_desc = seo["description"] or ""
    body = sanitize_html(post[PI["post_content"]] or "", drop_first_img=True)
    sections = extract_sections(body)
    lede = sections[0]["plain"][:280] if sections else first_paragraph(body)
    # Filter out the section-header-only section if present
    main_sections = [s for s in sections if s["body_html"].strip()]

    # Hero image: use the service icon area; full image as side art
    hero_img = "/uploads/2024/02/Group-12.png"
    if "corneal" in slug_path:
        hero_img = "/uploads/2024/02/laser.png"
    elif "cataract" in slug_path:
        hero_img = "/uploads/2024/02/lasik.png"
    elif "vision-correction" in slug_path:
        hero_img = "/uploads/2024/02/vision.png"

    book_label = "احجز موعد" if lang == "ar" else "Book a consultation"
    contact_url = "/contact-us/" if lang == "ar" else "/en/contact-us/"
    services_label = "كل الخدمات" if lang == "ar" else "All services"
    services_url = "/services/" if lang == "ar" else "/en/services/"

    hero = render_hero(
        lang=lang, eyebrow="خدمة طبية" if lang == "ar" else "Service",
        title=title_raw, lede=lede,
        image=hero_img,
        ctas=[(contact_url, book_label, "primary"), (services_url, services_label, "ghost")],
    )

    crumbs_items = ([("/services/" if lang == "ar" else "/en/services/",
                      "الخدمات" if lang == "ar" else "Services"),
                     (current, title_raw)])
    crumbs = render_breadcrumbs(crumbs_items, lang)

    # Article: stack sections nicely
    article_blocks = []
    if not main_sections:
        article_blocks.append(f'<div class="prose">{body}</div>')
    else:
        for i, s in enumerate(main_sections):
            h = ""
            if s["heading"]:
                h = f'<h2>{e(s["heading"])}</h2>'
            article_blocks.append(f'<section class="content-block">{h}<div class="prose">{s["body_html"]}</div></section>')
    article_html = "".join(article_blocks)

    # Related services
    sib = SERVICE_PAGES_AR if lang == "ar" else SERVICE_PAGES_EN
    sib_filtered = [s for s in sib if s[0] != pid]
    rel_cards = []
    descs = SERVICE_DESC_AR if lang == "ar" else SERVICE_DESC_EN
    for sid, url, icon, name in sib_filtered:
        rel_cards.append(f"""<a class="service-card" href="{url}">
  <span class="service-icon"><img src="{icon}" alt="" loading="lazy"></span>
  <h3>{e(name)}</h3>
  <p>{e(descs.get(url, ''))}</p>
</a>""")
    rel_title = "خدمات ذات صلة" if lang == "ar" else "Related services"
    related = f"""<section class="section section-services light">
  <div class="container">
    <div class="section-head center">
      <h2 class="section-title">{e(rel_title)}</h2>
    </div>
    <div class="service-grid">{''.join(rel_cards)}</div>
  </div>
</section>"""

    main = f"""{hero}
{crumbs}
<section class="section section-article">
  <div class="container container-narrow">
    {article_html}
  </div>
</section>
{related}
{render_cta_band(lang)}"""
    canonical = "https://drmdossary.com" + current
    page_html = render_layout(
        lang=lang, dir_=dir_, title=seo_title, description=seo_desc,
        canonical=canonical, body_html=main, current=current, body_class="page-service",
    )
    write_file(f"{slug_path}/index.html", page_html)
    return {
        "id": pid, "title": title_raw, "slug": slug_path, "lang": lang,
        "url": current, "seo_title": seo_title, "seo_description": seo_desc,
    }


# ---------------------------------------------------------------------------
# About page

def render_about_page(pid: int) -> dict | None:
    post = posts_by_id.get(pid)
    if not post:
        return None
    slug_path = PAGE_SLUG_OVERRIDE[pid]
    lang = "en" if slug_path.startswith("en/") else "ar"
    dir_ = "rtl" if lang == "ar" else "ltr"
    current = "/" + slug_path + "/"
    title_raw = post[PI["post_title"]] or slug_path
    seo = seo_for(pid)
    seo_title = seo["title"] or title_raw
    seo_desc = seo["description"] or ""
    body = sanitize_html(post[PI["post_content"]] or "", drop_first_img=True)
    sections = extract_sections(body)
    lede = sections[0]["plain"][:300] if sections else first_paragraph(body)
    main_sections = [s for s in sections if s["body_html"].strip()]

    trust = TRUST_BADGES_AR if lang == "ar" else TRUST_BADGES_EN
    contact_url = "/contact-us/" if lang == "ar" else "/en/contact-us/"
    book_label = "احجز موعد" if lang == "ar" else "Book a consultation"

    hero = render_hero(
        lang=lang,
        eyebrow="عن الطبيب" if lang == "ar" else "About",
        title=title_raw, lede=lede,
        image=DOCTOR_HEADSHOT,
        ctas=[(contact_url, book_label, "primary")],
    )
    crumbs = render_breadcrumbs([(current, title_raw)], lang)

    # Compose article
    article_blocks = []
    if not main_sections:
        article_blocks.append(f'<div class="prose">{body}</div>')
    else:
        for s in main_sections:
            h = ""
            if s["heading"]:
                h = f'<h2>{e(s["heading"])}</h2>'
            article_blocks.append(f'<section class="content-block">{h}<div class="prose">{s["body_html"]}</div></section>')

    # Credentials list
    cred_title = "المؤهلات والخبرة" if lang == "ar" else "Credentials & experience"
    cred = "".join(f'<li>{e(t)}</li>' for t in trust)
    credentials_block = f"""<section class="section section-credentials">
  <div class="container">
    <div class="section-head center">
      <h2 class="section-title">{e(cred_title)}</h2>
    </div>
    <ul class="credentials">{cred}</ul>
  </div>
</section>"""

    main = f"""{hero}
{crumbs}
<section class="section section-article">
  <div class="container container-narrow">
    {''.join(article_blocks)}
  </div>
</section>
{credentials_block}
{render_cta_band(lang)}"""
    canonical = "https://drmdossary.com" + current
    page_html = render_layout(
        lang=lang, dir_=dir_, title=seo_title, description=seo_desc,
        canonical=canonical, body_html=main, current=current, body_class="page-about",
    )
    write_file(f"{slug_path}/index.html", page_html)
    return {
        "id": pid, "title": title_raw, "slug": slug_path, "lang": lang,
        "url": current, "seo_title": seo_title, "seo_description": seo_desc,
    }


# ---------------------------------------------------------------------------
# Services index page (lists all services)

def render_services_index(pid: int) -> dict | None:
    post = posts_by_id.get(pid)
    if not post:
        return None
    slug_path = PAGE_SLUG_OVERRIDE[pid]
    lang = "en" if slug_path.startswith("en/") else "ar"
    dir_ = "rtl" if lang == "ar" else "ltr"
    current = "/" + slug_path + "/"
    title_raw = post[PI["post_title"]] or slug_path
    seo = seo_for(pid)
    seo_title = seo["title"] or title_raw
    seo_desc = seo["description"] or ""

    services = SERVICE_PAGES_AR if lang == "ar" else SERVICE_PAGES_EN
    descs = SERVICE_DESC_AR if lang == "ar" else SERVICE_DESC_EN
    lede = (
        "تقدم العيادة مجموعة شاملة من الخدمات المتخصصة في طب وجراحة العيون باستخدام أحدث التقنيات وأكثرها تطورًا."
        if lang == "ar"
        else "A complete range of specialised ophthalmology services using the latest, most advanced technology."
    )
    hero = render_hero(
        lang=lang,
        eyebrow="تخصصاتنا" if lang == "ar" else "Specialties",
        title=title_raw, lede=lede,
        image=None, ctas=[],
    )
    crumbs = render_breadcrumbs([(current, title_raw)], lang)

    more = "اعرف المزيد" if lang == "ar" else "Learn more"
    cards = []
    for sid, url, icon, name in services:
        cards.append(f"""<a class="service-card service-card-lg" href="{url}">
  <span class="service-icon"><img src="{icon}" alt="" loading="lazy"></span>
  <h3>{e(name)}</h3>
  <p>{e(descs.get(url, ''))}</p>
  <span class="service-link">{e(more)} <span aria-hidden="true">→</span></span>
</a>""")
    grid = f'<div class="service-grid">{"".join(cards)}</div>'

    main = f"""{hero}
{crumbs}
<section class="section section-services">
  <div class="container">
    {grid}
  </div>
</section>
{render_cta_band(lang)}"""
    canonical = "https://drmdossary.com" + current
    page_html = render_layout(
        lang=lang, dir_=dir_, title=seo_title, description=seo_desc,
        canonical=canonical, body_html=main, current=current, body_class="page-services-index",
    )
    write_file(f"{slug_path}/index.html", page_html)
    return {
        "id": pid, "title": title_raw, "slug": slug_path, "lang": lang,
        "url": current, "seo_title": seo_title, "seo_description": seo_desc,
    }


# ---------------------------------------------------------------------------
# Contact page

def render_contact_page(pid: int) -> dict | None:
    post = posts_by_id.get(pid)
    if not post:
        return None
    slug_path = PAGE_SLUG_OVERRIDE[pid]
    lang = "en" if slug_path.startswith("en/") else "ar"
    dir_ = "rtl" if lang == "ar" else "ltr"
    current = "/" + slug_path + "/"
    title_raw = post[PI["post_title"]] or slug_path
    seo = seo_for(pid)
    seo_title = seo["title"] or title_raw
    seo_desc = seo["description"] or ""
    c = CONTACT_INFO[lang]

    lede = (
        "تواصل مع فريقنا للحصول على المعلومات أو لحجز موعد. سعداء بخدمتكم."
        if lang == "ar"
        else "Get in touch with our team for information or to book a consultation."
    )
    hero = render_hero(
        lang=lang,
        eyebrow="تواصل" if lang == "ar" else "Get in touch",
        title=title_raw, lede=lede,
        image="/uploads/2024/10/DALL·E-2024-10-10-17.28.24-A-professional-hospital-contact-section.-The-background-displays-a-sleek-modern-hospital-lobby-with-a-reception-desk-clear-signage-and-a-calm-atmos.jpg",
        ctas=[],
    )
    crumbs = render_breadcrumbs([(current, title_raw)], lang)

    # Contact cards
    address_label = c["address_label"]; phone_label = c["phone_label"]
    email_label = c["email_label"]; hours_label = c["hours_label"]
    cards = f"""<section class="section section-contact">
  <div class="container">
    <div class="contact-grid">
      <div class="contact-card">
        <span class="contact-icon" aria-hidden="true">📍</span>
        <h3>{e(address_label)}</h3>
        <p>{e(c['address'])}</p>
      </div>
      <div class="contact-card">
        <span class="contact-icon" aria-hidden="true">📞</span>
        <h3>{e(phone_label)}</h3>
        <p><a href="tel:{e(c['phone_tel'])}">{e(c['phone_display'])}</a></p>
      </div>
      <div class="contact-card">
        <span class="contact-icon" aria-hidden="true">✉️</span>
        <h3>{e(email_label)}</h3>
        <p><a href="mailto:{e(c['email'])}">{e(c['email'])}</a></p>
      </div>
      <div class="contact-card">
        <span class="contact-icon" aria-hidden="true">🕘</span>
        <h3>{e(hours_label)}</h3>
        <p>{e(c['hours'])}</p>
      </div>
    </div>
  </div>
</section>"""

    main = f"""{hero}
{crumbs}
{cards}
{render_cta_band(lang)}"""
    canonical = "https://drmdossary.com" + current
    page_html = render_layout(
        lang=lang, dir_=dir_, title=seo_title, description=seo_desc,
        canonical=canonical, body_html=main, current=current, body_class="page-contact",
    )
    write_file(f"{slug_path}/index.html", page_html)
    return {
        "id": pid, "title": title_raw, "slug": slug_path, "lang": lang,
        "url": current, "seo_title": seo_title, "seo_description": seo_desc,
    }


# ---------------------------------------------------------------------------
# FAQ page

FAQ_AR = [
    ("ما هي مؤهلات د. محمد الدوسري؟",
     "<p>د. محمد الدوسري حاصل على البورد السعودي في طب وجراحة العيون، وأكمل زمالة إكلينيكية متخصصة في مستشفى الملك خالد التخصصي للعيون، إحدى أكبر المراكز التخصصية لطب العيون في المنطقة.</p>"),
    ("ما هي الخدمات التي تقدمها العيادة؟",
     "<p>تشمل الخدمات جراحات تصحيح النظر (الليزك، الليزر السطحي، زراعة العدسات)، علاج المياه البيضاء (الساد) بأحدث أنظمة الفاكو، علاج القرنية المخروطية وتثبيتها وزراعتها، والفحص الشامل للعيون.</p>"),
    ("ما هي الإرشادات قبل عملية تصحيح النظر؟",
     "<p>يجب التوقف عن استخدام العدسات اللاصقة قبل الفحص بفترة كافية، وإجراء فحص شامل لقياس مقاسات القرنية والشبكية. ينصح بتجنب وضع المكياج حول العين قبل العملية بيوم على الأقل، وإحضار مرافق يوم الإجراء.</p>"),
    ("هل عملية الليزك آمنة؟",
     "<p>عمليات الليزك من أكثر الإجراءات الجراحية أمانًا عند إجرائها وفق بروتوكولات تشخيصية صارمة. تستخدم العيادة أنظمة ليزر متطورة، ويتم تقييم كل حالة بعناية قبل ترشيحها للجراحة.</p>"),
    ("كم تستغرق فترة التعافي بعد العملية؟",
     "<p>تتفاوت فترة التعافي حسب نوع الجراحة. غالبًا ما يستعيد المرضى رؤية واضحة خلال 24-48 ساعة بعد الليزك، مع متابعة دورية لضمان أفضل النتائج.</p>"),
    ("كيف يمكنني حجز موعد للاستشارة؟",
     '<p>يمكنك حجز موعد عبر صفحة <a href="/contact-us/">تواصل معنا</a> أو الاتصال بنا مباشرة على الأرقام المعتمدة. سيتواصل معك فريقنا لتأكيد الموعد.</p>'),
]

FAQ_EN = [
    ("What are Dr Al Dossary's qualifications?",
     "<p>Dr Mohammad Al Dossary is a Saudi Board-certified ophthalmologist and completed a clinical fellowship at King Khaled Eye Specialist Hospital, one of the leading specialised eye-care centres in the region.</p>"),
    ("Which services do you offer?",
     "<p>Vision-correction surgery (LASIK, surface laser, ICL implantation), cataract surgery using modern phacoemulsification systems, keratoconus management with cross-linking and corneal transplantation, and full diagnostic eye examinations.</p>"),
    ("How should I prepare for vision-correction surgery?",
     "<p>Stop wearing contact lenses well in advance of the diagnostic exam so we can take accurate corneal and retinal measurements. Avoid eye makeup the day before surgery and bring a companion on the day of the procedure.</p>"),
    ("Is LASIK safe?",
     "<p>LASIK is among the safest surgical procedures when performed under strict diagnostic protocols. The clinic uses advanced laser systems and evaluates each case carefully before recommending surgery.</p>"),
    ("How long is the recovery period?",
     "<p>Recovery varies by procedure. Most LASIK patients regain clear vision within 24–48 hours, with scheduled follow-ups to ensure the best long-term outcome.</p>"),
    ("How do I book a consultation?",
     '<p>You can book through the <a href="/en/contact-us/">Contact page</a> or call us directly. Our team will confirm your appointment.</p>'),
]


def render_faq_page(pid: int) -> dict | None:
    post = posts_by_id.get(pid)
    if not post:
        return None
    slug_path = PAGE_SLUG_OVERRIDE[pid]
    lang = "en" if slug_path.startswith("en/") else "ar"
    dir_ = "rtl" if lang == "ar" else "ltr"
    current = "/" + slug_path + "/"
    title_raw = post[PI["post_title"]] or slug_path
    seo = seo_for(pid)
    seo_title = seo["title"] or title_raw
    seo_desc = seo["description"] or ""

    qa = FAQ_AR if lang == "ar" else FAQ_EN

    lede = (
        "إجابات عن أكثر الأسئلة شيوعًا حول الفحوصات والإجراءات الجراحية والرعاية بعد العملية."
        if lang == "ar"
        else "Answers to the most common questions about examinations, surgical procedures, and post-operative care."
    )
    hero = render_hero(
        lang=lang,
        eyebrow="الأسئلة الشائعة" if lang == "ar" else "FAQ",
        title=title_raw, lede=lede,
        image=None, ctas=[],
    )
    crumbs = render_breadcrumbs([(current, title_raw)], lang)

    items = "".join(
        f'<details class="faq-item"><summary>{e(q)}</summary><div class="faq-answer">{ans}</div></details>'
        for q, ans in qa
    )
    main_html = f"""{hero}
{crumbs}
<section class="section section-faq">
  <div class="container container-narrow">
    <div class="faq-list">{items}</div>
  </div>
</section>
{render_cta_band(lang)}"""
    canonical = "https://drmdossary.com" + current
    page_html = render_layout(
        lang=lang, dir_=dir_, title=seo_title, description=seo_desc,
        canonical=canonical, body_html=main_html, current=current, body_class="page-faq",
    )
    write_file(f"{slug_path}/index.html", page_html)
    return {
        "id": pid, "title": title_raw, "slug": slug_path, "lang": lang,
        "url": current, "seo_title": seo_title, "seo_description": seo_desc,
    }


# ---------------------------------------------------------------------------
# Generic page (privacy, blogs landing, etc.)

def render_simple_page(pid: int) -> dict | None:
    post = posts_by_id.get(pid)
    if not post:
        return None
    slug_path = PAGE_SLUG_OVERRIDE[pid]
    lang = "en" if slug_path.startswith("en/") else "ar"
    dir_ = "rtl" if lang == "ar" else "ltr"
    current = "/" + slug_path + "/"
    title_raw = post[PI["post_title"]] or slug_path
    seo = seo_for(pid)
    seo_title = seo["title"] or title_raw
    seo_desc = seo["description"] or ""
    body = sanitize_html(post[PI["post_content"]] or "", drop_first_img=True)

    hero = render_hero(
        lang=lang, eyebrow="", title=title_raw, lede="", image=None, ctas=[],
    )
    crumbs = render_breadcrumbs([(current, title_raw)], lang)
    main_html = f"""{hero}
{crumbs}
<section class="section section-article">
  <div class="container container-narrow">
    <div class="prose">{body}</div>
  </div>
</section>
{render_cta_band(lang)}"""
    canonical = "https://drmdossary.com" + current
    page_html = render_layout(
        lang=lang, dir_=dir_, title=seo_title, description=seo_desc,
        canonical=canonical, body_html=main_html, current=current, body_class="page-simple",
    )
    write_file(f"{slug_path}/index.html", page_html)
    return {
        "id": pid, "title": title_raw, "slug": slug_path, "lang": lang,
        "url": current, "seo_title": seo_title, "seo_description": seo_desc,
    }


# ---------------------------------------------------------------------------
# Page dispatch

PAGE_RENDERERS = {
    29: render_about_page,           # Arabic about
    31: render_services_index,       # Arabic services index
    33: render_simple_page,          # /blogs/ landing (legacy)
    35: render_faq_page,             # Arabic FAQ
    37: render_contact_page,         # Arabic contact
    382: render_service_page,        # corneal
    384: render_service_page,        # cataracts
    386: render_service_page,        # vision correction
    2219: render_simple_page,        # privacy
    1614: render_about_page,         # English about
    1655: render_services_index,     # English services index
    1662: render_service_page,
    1667: render_service_page,
    1672: render_service_page,
    1697: render_contact_page,
    1715: render_faq_page,
    1727: lambda pid: None,          # /en/blog/ is generated by blog index
}


# Home pages
SITE["pages"].append(render_home("ar"))
SITE["pages"].append(render_home("en"))

# Other pages
for pid in ARABIC_PAGES + ENGLISH_PAGES:
    fn = PAGE_RENDERERS.get(pid)
    if fn is None:
        continue
    info = fn(pid)
    if info:
        SITE["pages"].append(info)


# ---------------------------------------------------------------------------
# Blog posts

publish_posts = [
    r for r in posts_t["rows"]
    if r[PI["post_type"]] == "post"
    and r[PI["post_status"]] == "publish"
    and r[PI["ID"]] not in EXCLUDED_POST_IDS
]
publish_posts.sort(key=lambda r: r[PI["post_date"]], reverse=True)

POST_LANG = {}
for r in publish_posts:
    title = r[PI["post_title"]] or ""
    POST_LANG[r[PI["ID"]]] = "ar" if re.search(r"[؀-ۿ]", title) else "en"


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
    raw = r[PI["post_content"]] or ""
    body = sanitize_html(raw, drop_first_img=True)
    feat = featured_image(pid)
    date_iso = r[PI["post_date"]] or ""
    pretty_date = date_iso[:10]
    url = post_url(pid, lang, slug)
    blog_index = "/blog/" if lang == "ar" else "/en/blog/"
    blog_label = "المقالات" if lang == "ar" else "Blog"

    # Reading time estimate
    words = len(re.findall(r"\S+", BeautifulSoup(body, "lxml").get_text(" ")))
    rt = max(1, round(words / 200))
    rt_label = f"{rt} دقائق قراءة" if lang == "ar" else f"{rt} min read"

    feat_html = (
        f'<figure class="post-hero-figure"><img src="{e(feat)}" alt="" loading="eager" decoding="async"></figure>'
        if feat else ""
    )

    hero = f"""<section class="post-hero">
  <div class="container post-hero-inner">
    <p class="post-meta">
      <time datetime="{e(date_iso)}">{e(pretty_date)}</time>
      <span class="meta-sep" aria-hidden="true">·</span>
      <span>{e(rt_label)}</span>
    </p>
    <h1 class="post-title">{e(raw_title)}</h1>
    {feat_html}
  </div>
</section>"""

    crumbs = render_breadcrumbs([(blog_index, blog_label), (url, raw_title)], lang)

    # Article body
    article = f"""<article class="blog-article">
  <div class="container container-narrow">
    <div class="prose">{body}</div>
  </div>
</article>"""

    main = f"""{hero}
{crumbs}
{article}
{render_cta_band(lang)}"""
    canonical = "https://drmdossary.com" + url
    page_html = render_layout(
        lang=lang, dir_=dir_, title=seo_title, description=seo_desc,
        canonical=canonical, body_html=main, current=url, body_class="page-post",
    )
    rel_path = url.lstrip("/") + "index.html"
    write_file(rel_path, page_html)
    return {
        "id": pid, "title": raw_title, "slug": slug, "lang": lang,
        "url": url, "date": date_iso, "seo_title": seo_title,
        "seo_description": seo_desc, "featured_image": feat,
    }


for r in publish_posts:
    SITE["posts"].append(render_post(r))


# ---------------------------------------------------------------------------
# Blog index

def render_blog_index(lang: str) -> None:
    items = [p for p in SITE["posts"] if p["lang"] == lang]
    if lang == "ar":
        title = "المقالات"
        lede = "أحدث المقالات الطبية في طب وجراحة العيون من د. محمد الدوسري."
        url = "/blog/"
        eyebrow = "مدونة"
        read = "قراءة"
    else:
        title = "Blog"
        lede = "Latest medical insight on ophthalmology and eye care from Dr Mohammad Al Dossary."
        url = "/en/blog/"
        eyebrow = "Blog"
        read = "Read"

    cards = []
    for p in items:
        thumb = (
            f'<img src="{e(p["featured_image"])}" alt="" loading="lazy">'
            if p["featured_image"] else '<div class="thumb-fallback"></div>'
        )
        excerpt = e((p["seo_description"] or "")[:180])
        cards.append(f"""<article class="blog-card">
  <a class="blog-card-link" href="{e(p['url'])}">
    <div class="blog-card-thumb">{thumb}</div>
    <div class="blog-card-body">
      <time datetime="{e(p['date'])}">{e(p['date'][:10])}</time>
      <h3>{e(p['title'])}</h3>
      <p>{excerpt}</p>
      <span class="blog-card-link-cta">{e(read)} <span aria-hidden="true">→</span></span>
    </div>
  </a>
</article>""")

    hero = render_hero(
        lang=lang, eyebrow=eyebrow, title=title, lede=lede, image=None, ctas=[],
    )
    crumbs = render_breadcrumbs([(url, title)], lang)
    grid = f'<div class="blog-grid blog-grid-lg">{"".join(cards)}</div>'
    main_html = f"""{hero}
{crumbs}
<section class="section section-blog-index">
  <div class="container">
    {grid}
  </div>
</section>
{render_cta_band(lang)}"""
    canonical = "https://drmdossary.com" + url
    page_html = render_layout(
        lang=lang, dir_="rtl" if lang == "ar" else "ltr",
        title=f"{title} | {SITE['site_title']}", description=lede,
        canonical=canonical, body_html=main_html, current=url, body_class="page-blog-index",
    )
    write_file(url.lstrip("/") + "index.html", page_html)


render_blog_index("ar")
render_blog_index("en")


# ---------------------------------------------------------------------------
# CSS (premium medical design system)

CSS = r""":root {
  --color-primary: #0a4d68;
  --color-primary-dark: #053b53;
  --color-primary-darker: #02283a;
  --color-accent: #088395;
  --color-accent-light: #5DD4D4;
  --color-accent-soft: #e6f4f6;
  --color-bg: #f7f9fb;
  --color-surface: #ffffff;
  --color-surface-2: #f1f5f8;
  --color-text: #0f172a;
  --color-muted: #5a6b7a;
  --color-border: #e4ebf0;
  --color-border-strong: #cdd9e1;
  --color-success: #11885a;

  --radius-sm: 8px;
  --radius: 14px;
  --radius-lg: 22px;
  --shadow-sm: 0 1px 2px rgba(8, 18, 30, 0.04);
  --shadow: 0 4px 14px rgba(8, 18, 30, 0.06);
  --shadow-lg: 0 18px 40px rgba(8, 18, 30, 0.10);

  --font-ar: 'Tajawal', 'Cairo', 'IBM Plex Sans Arabic', 'Segoe UI', 'Tahoma', 'Arial', system-ui, sans-serif;
  --font-en: 'Inter', 'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;

  --container: 1180px;
  --container-narrow: 820px;
}

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.7;
  font-size: 17px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
body.lang-ar { font-family: var(--font-ar); }
body.lang-en { font-family: var(--font-en); }

img, picture, svg, video { max-width: 100%; height: auto; display: block; }
a { color: var(--color-primary); text-decoration: none; transition: color .18s ease, opacity .18s ease; }
a:hover { color: var(--color-primary-dark); }
h1, h2, h3, h4, h5, h6 { color: var(--color-primary-darker); line-height: 1.25; margin: 0 0 .6em; font-weight: 700; letter-spacing: -.01em; }
h1 { font-size: clamp(2rem, 3.6vw, 3.1rem); }
h2 { font-size: clamp(1.55rem, 2.6vw, 2.15rem); }
h3 { font-size: clamp(1.18rem, 1.8vw, 1.4rem); }
p { margin: 0 0 1em; }
ul, ol { padding-inline-start: 1.4em; margin: 0 0 1em; }
li + li { margin-top: .25em; }
hr { border: 0; border-top: 1px solid var(--color-border); margin: 2rem 0; }

.container { max-width: var(--container); margin: 0 auto; padding-inline: clamp(1rem, 4vw, 1.75rem); }
.container-narrow { max-width: var(--container-narrow); }

.skip-link { position: absolute; left: -10000px; top: auto; width: 1px; height: 1px; overflow: hidden; }
.skip-link:focus { left: 12px; top: 12px; width: auto; height: auto; padding: 10px 14px; background: #fff; color: var(--color-primary-dark); box-shadow: var(--shadow); z-index: 100; border-radius: 6px; }

/* ===== Buttons ===== */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: .5rem; padding: .8rem 1.4rem;
  border-radius: 999px; font-weight: 600; font-size: .98rem; line-height: 1;
  text-decoration: none; border: 2px solid transparent;
  transition: transform .15s ease, box-shadow .15s ease, background .15s ease, color .15s ease;
  cursor: pointer; white-space: nowrap;
}
.btn-primary {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 6px 18px rgba(10, 77, 104, 0.30);
}
.btn-primary:hover { background: var(--color-primary-dark); color: #fff; transform: translateY(-1px); box-shadow: 0 10px 22px rgba(10, 77, 104, 0.35); }
.btn-ghost {
  background: transparent; color: var(--color-primary); border-color: var(--color-primary);
}
.btn-ghost:hover { background: var(--color-primary); color: #fff; }
.btn-lg { padding: 1rem 1.75rem; font-size: 1.04rem; }

/* ===== Header ===== */
.site-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,.92);
  backdrop-filter: saturate(160%) blur(12px);
  -webkit-backdrop-filter: saturate(160%) blur(12px);
  border-bottom: 1px solid var(--color-border);
}
.header-inner { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 1.25rem; padding: .85rem 0; }
.brand { display: inline-flex; align-items: center; gap: .75rem; color: var(--color-primary-darker); }
.brand:hover { color: var(--color-primary); }
.brand-logo { width: 44px; height: 44px; border-radius: 50%; background: var(--color-accent-soft); padding: 6px; flex: 0 0 auto; }
.brand-text { display: flex; flex-direction: column; line-height: 1.2; }
.brand-name { font-weight: 800; font-size: 1.05rem; letter-spacing: -.01em; }
.brand-sub { font-size: .78rem; color: var(--color-muted); font-weight: 500; }
.primary-nav { display: flex; justify-content: center; }
.primary-menu {
  list-style: none; margin: 0; padding: 0;
  display: flex; align-items: center; gap: .2rem; flex-wrap: wrap;
}
.primary-menu a {
  display: inline-block; padding: .55rem .85rem;
  color: var(--color-text); font-weight: 500; font-size: .98rem;
  border-radius: 8px; transition: background .15s ease, color .15s ease;
}
.primary-menu a:hover { background: var(--color-accent-soft); color: var(--color-primary); }
.primary-menu a[aria-current="page"] { color: var(--color-primary); background: var(--color-accent-soft); }
.header-actions { display: inline-flex; align-items: center; gap: .6rem; }
.lang-switch {
  padding: .55rem .9rem; border: 1px solid var(--color-border-strong);
  border-radius: 999px; font-size: .88rem; font-weight: 600; color: var(--color-primary);
}
.lang-switch:hover { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.header-cta { padding: .65rem 1.15rem; font-size: .92rem; }
.nav-toggle {
  display: none; background: transparent; border: 1px solid var(--color-border-strong);
  width: 44px; height: 44px; border-radius: 10px; cursor: pointer;
  padding: 0; position: relative;
}
.nav-toggle-bar { display: block; width: 20px; height: 2px; background: var(--color-primary-darker); margin: 4px auto; border-radius: 2px; transition: transform .2s ease, opacity .2s ease; }
.nav-toggle[aria-expanded="true"] .nav-toggle-bar:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.nav-toggle[aria-expanded="true"] .nav-toggle-bar:nth-child(2) { opacity: 0; }
.nav-toggle[aria-expanded="true"] .nav-toggle-bar:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
@media (max-width: 960px) {
  .header-inner { grid-template-columns: auto 1fr auto; }
  .nav-toggle { display: block; order: 3; }
  .header-actions { order: 2; }
  .primary-nav { display: none; order: 4; grid-column: 1 / -1; }
  .primary-nav.open { display: flex; }
  .primary-menu { flex-direction: column; align-items: stretch; gap: .25rem; padding: .75rem 0 1rem; }
  .primary-menu a { padding: .8rem 1rem; border-radius: 10px; }
  .header-cta { display: none; }
}

/* ===== Home hero ===== */
.home-hero {
  background:
    radial-gradient(circle at top right, rgba(8,131,149,0.18), transparent 60%),
    radial-gradient(circle at bottom left, rgba(10,77,104,0.12), transparent 60%),
    linear-gradient(180deg, #f1f7f9 0%, #ffffff 100%);
  padding: clamp(3rem, 8vw, 6rem) 0 clamp(3rem, 8vw, 5rem);
  position: relative; overflow: hidden;
}
.home-hero-inner {
  display: grid; grid-template-columns: 1.05fr .95fr;
  gap: clamp(2rem, 6vw, 4rem); align-items: center;
}
.hero-eyebrow {
  display: inline-block; margin: 0 0 1rem;
  padding: .35rem 1rem; border-radius: 999px;
  background: var(--color-accent-soft); color: var(--color-primary);
  font-size: .85rem; font-weight: 600; letter-spacing: .02em;
}
.home-hero-title { font-size: clamp(2.1rem, 4.5vw, 3.4rem); line-height: 1.15; margin: 0 0 1.25rem; }
.home-hero-lede { font-size: clamp(1.05rem, 1.6vw, 1.18rem); color: var(--color-muted); max-width: 56ch; margin: 0 0 2rem; }
.hero-ctas { display: flex; flex-wrap: wrap; gap: .8rem; margin-bottom: 2rem; }
.trust-badges {
  list-style: none; padding: 0; margin: 0;
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .55rem 1rem;
}
.trust-badges li {
  position: relative; padding-inline-start: 1.5rem;
  font-size: .95rem; color: var(--color-text); font-weight: 500;
}
.trust-badges li::before {
  content: ""; position: absolute; inset-inline-start: 0; top: .35rem;
  width: 1.1rem; height: 1.1rem; border-radius: 50%;
  background: var(--color-accent-soft) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23088395' stroke-width='2.5'><path d='M3.5 8.5l3 3 6-6'/></svg>") center/70% no-repeat;
}
.home-hero-aside { position: relative; display: flex; justify-content: center; }
.doctor-card {
  position: relative;
  width: 100%; max-width: 460px;
  background:
    radial-gradient(circle at top, rgba(8,131,149,0.18), transparent 65%),
    linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
  border-radius: 28px;
  padding: 1.5rem 1.5rem 0;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  aspect-ratio: 4 / 5;
  display: flex; align-items: end; justify-content: center;
}
.doctor-card::before {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 100%, rgba(255,255,255,0.18), transparent 60%);
  pointer-events: none;
}
.doctor-card img {
  position: relative;
  width: 100%; height: 100%; object-fit: contain; object-position: bottom;
  filter: drop-shadow(0 12px 24px rgba(0,0,0,.18));
}

@media (max-width: 900px) {
  .home-hero-inner { grid-template-columns: 1fr; text-align: start; }
  .home-hero-aside { order: -1; }
  .doctor-card { max-width: 320px; aspect-ratio: 1 / 1.1; }
  .trust-badges { grid-template-columns: 1fr; }
}

/* ===== Inner page hero ===== */
.page-hero {
  background:
    linear-gradient(120deg, var(--color-primary-darker) 0%, var(--color-primary) 60%, var(--color-accent) 120%);
  color: #f4fbfc;
  padding: clamp(3rem, 8vw, 5rem) 0 clamp(2.5rem, 6vw, 4rem);
  position: relative; overflow: hidden;
}
.page-hero::before {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(circle at 100% 0%, rgba(255,255,255,.10), transparent 50%),
              radial-gradient(circle at 0% 100%, rgba(255,255,255,.06), transparent 50%);
  pointer-events: none;
}
.hero-inner { position: relative; display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: center; }
.page-hero.has-image .hero-inner { grid-template-columns: 1.1fr .9fr; }
.page-hero .hero-eyebrow {
  background: rgba(255,255,255,.16); color: #f4fbfc;
}
.page-hero h1, .hero-title { color: #fff; font-size: clamp(1.85rem, 3.6vw, 2.8rem); margin: 0 0 1rem; }
.hero-lede { color: rgba(255,255,255,0.88); font-size: clamp(1rem, 1.5vw, 1.13rem); max-width: 60ch; margin: 0 0 1.5rem; }
.page-hero .btn-ghost { color: #fff; border-color: rgba(255,255,255,.6); }
.page-hero .btn-ghost:hover { background: #fff; color: var(--color-primary-darker); }
.hero-aside {
  display: flex; justify-content: center; align-items: center;
}
.hero-aside img {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 360px; width: 100%; object-fit: cover;
  background: rgba(255,255,255,.10); padding: 0;
}
@media (max-width: 800px) {
  .page-hero.has-image .hero-inner { grid-template-columns: 1fr; }
  .hero-aside img { max-height: 260px; }
}

/* ===== Breadcrumbs ===== */
.breadcrumbs { background: transparent; border-bottom: 1px solid var(--color-border); }
.breadcrumbs ol { list-style: none; padding: .9rem 0; margin: 0; display: flex; flex-wrap: wrap; gap: .35rem .55rem; font-size: .92rem; color: var(--color-muted); }
.breadcrumbs .crumb a { color: var(--color-muted); }
.breadcrumbs .crumb a:hover { color: var(--color-primary); }
.breadcrumbs .current { color: var(--color-primary-darker); font-weight: 600; }
.breadcrumbs .sep { color: var(--color-border-strong); }

/* ===== Sections ===== */
.section { padding: clamp(3rem, 7vw, 5rem) 0; }
.section.light { background: var(--color-surface-2); }
.section-head { margin: 0 0 2.5rem; }
.section-head.center { text-align: center; }
.section-head.row { display: flex; align-items: end; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }
.section-title { font-size: clamp(1.6rem, 2.8vw, 2.25rem); margin: 0 0 .55rem; }
.section-lede { color: var(--color-muted); font-size: 1.05rem; margin: 0; max-width: 60ch; }
.section-head.center .section-lede { margin-inline: auto; }
.eyebrow {
  display: inline-block; padding: .3rem .9rem; border-radius: 999px;
  background: var(--color-accent-soft); color: var(--color-primary);
  font-size: .82rem; font-weight: 600; letter-spacing: .02em;
  margin: 0 0 .9rem;
}

/* ===== Two-column ===== */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2rem, 5vw, 3.5rem); align-items: center; }
.two-col img { border-radius: var(--radius-lg); box-shadow: var(--shadow); }
.lede { font-size: 1.1rem; color: var(--color-muted); }
@media (max-width: 800px) {
  .two-col { grid-template-columns: 1fr; }
}

/* ===== Service grid ===== */
.service-grid {
  display: grid; gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
.service-card {
  display: block;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 2rem 1.75rem;
  text-align: start; color: inherit;
  box-shadow: var(--shadow-sm);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
  position: relative;
}
.service-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--color-accent-light); color: inherit; }
.service-card .service-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 72px; height: 72px; border-radius: 18px;
  background: var(--color-accent-soft); margin-bottom: 1.25rem;
}
.service-card .service-icon img { width: 40px; height: 40px; object-fit: contain; }
.service-card h3 { margin: 0 0 .65rem; font-size: 1.25rem; color: var(--color-primary-darker); }
.service-card p { color: var(--color-muted); margin: 0 0 1.25rem; font-size: .98rem; }
.service-card .service-link { display: inline-flex; align-items: center; gap: .35rem; color: var(--color-primary); font-weight: 600; }
.service-card-lg { padding: 2.25rem 2rem; }

/* ===== Feature grid (why-us) ===== */
.feature-grid {
  display: grid; gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.feature-card {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); padding: 1.75rem 1.5rem;
  box-shadow: var(--shadow-sm); text-align: center;
}
.feature-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 60px; height: 60px; border-radius: 50%;
  background: var(--color-accent-soft); color: var(--color-primary);
  font-size: 1.8rem; margin-bottom: 1rem;
}
.feature-card h3 { font-size: 1.08rem; margin: 0 0 .5rem; }
.feature-card p { color: var(--color-muted); margin: 0; font-size: .95rem; }

/* ===== Testimonials marquee ===== */
.section-testimonials { background: var(--color-surface-2); }
.testi-marquee {
  display: grid; gap: 1.25rem;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}
.testi-card {
  margin: 0; background: var(--color-surface);
  border-radius: var(--radius); overflow: hidden;
  box-shadow: var(--shadow-sm); aspect-ratio: 4 / 5;
}
.testi-card img { width: 100%; height: 100%; object-fit: cover; }

/* ===== Blog grid ===== */
.blog-grid {
  display: grid; gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
.blog-grid-lg { gap: 1.75rem; }
.blog-card {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}
.blog-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); border-color: var(--color-accent-light); }
.blog-card-link { display: flex; flex-direction: column; height: 100%; color: inherit; }
.blog-card-link:hover { color: inherit; }
.blog-card-thumb {
  aspect-ratio: 16 / 9; background: var(--color-surface-2);
  overflow: hidden; position: relative;
}
.blog-card-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
.blog-card:hover .blog-card-thumb img { transform: scale(1.04); }
.thumb-fallback {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
}
.blog-card-body { padding: 1.25rem 1.35rem 1.5rem; display: flex; flex-direction: column; gap: .5rem; flex: 1; }
.blog-card-body time { font-size: .82rem; color: var(--color-muted); }
.blog-card-body h3 { font-size: 1.08rem; margin: 0; color: var(--color-primary-darker); line-height: 1.35; }
.blog-card-body p { color: var(--color-muted); margin: 0; font-size: .92rem; line-height: 1.55; }
.blog-card-link-cta { margin-top: auto; color: var(--color-primary); font-weight: 600; font-size: .92rem; padding-top: .35rem; }

/* ===== Blog post (article) ===== */
.post-hero { background: linear-gradient(180deg, var(--color-surface-2) 0%, #fff 100%); padding: clamp(2.5rem, 6vw, 4rem) 0 clamp(1rem, 3vw, 2rem); }
.post-hero-inner { display: block; }
.post-meta { color: var(--color-muted); font-size: .9rem; display: inline-flex; align-items: center; gap: .5rem; margin: 0 0 1rem; }
.meta-sep { color: var(--color-border-strong); }
.post-title { font-size: clamp(1.7rem, 3.5vw, 2.5rem); margin: 0 0 1.5rem; }
.post-hero-figure { margin: 0; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); }
.post-hero-figure img { width: 100%; max-height: 480px; object-fit: cover; }

.blog-article { padding: clamp(2rem, 5vw, 3.5rem) 0; }
.prose {
  color: var(--color-text);
  font-size: 1.05rem; line-height: 1.85;
}
.prose h1, .prose h2, .prose h3, .prose h4 { color: var(--color-primary-darker); margin: 2em 0 .6em; }
.prose h2 { font-size: clamp(1.4rem, 2.4vw, 1.85rem); }
.prose h3 { font-size: clamp(1.18rem, 1.8vw, 1.4rem); }
.prose h4 { font-size: 1.1rem; }
.prose p { margin: 0 0 1.15em; }
.prose img { border-radius: var(--radius); margin: 1.5rem 0; box-shadow: var(--shadow-sm); }
.prose ul, .prose ol { margin: 0 0 1.25em; }
.prose ul li, .prose ol li { margin: .25em 0; padding-inline-start: .15em; }
.prose a { color: var(--color-primary); border-bottom: 1px solid var(--color-accent-light); padding-bottom: 1px; }
.prose a:hover { color: var(--color-primary-dark); border-bottom-color: var(--color-primary-dark); }
.prose blockquote {
  margin: 1.5em 0; padding: 1rem 1.25rem;
  background: var(--color-accent-soft); color: var(--color-primary-darker);
  border-inline-start: 4px solid var(--color-accent); border-radius: var(--radius-sm);
  font-style: italic;
}
.prose hr { border: 0; border-top: 1px solid var(--color-border); margin: 2rem 0; }
.prose figure { margin: 1.5rem 0; }
.prose table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: .96rem; }
.prose th, .prose td { padding: .65rem .85rem; border: 1px solid var(--color-border); text-align: start; }
.prose th { background: var(--color-surface-2); }

/* Article content-block wrappers (service pages) */
.content-block { margin-bottom: 2.25rem; }
.content-block h2 { color: var(--color-primary-darker); margin: 0 0 .8rem; font-size: clamp(1.35rem, 2.2vw, 1.75rem); }
.content-block:not(:first-child) { padding-top: 1.5rem; border-top: 1px solid var(--color-border); }

/* ===== Credentials list ===== */
.credentials {
  display: grid; gap: .75rem 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  list-style: none; padding: 0; margin: 0;
}
.credentials li {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); padding: 1rem 1.25rem;
  position: relative; padding-inline-start: 3rem;
  font-weight: 500;
}
.credentials li::before {
  content: "✓"; position: absolute; inset-inline-start: 1rem; top: 50%; transform: translateY(-50%);
  width: 1.6rem; height: 1.6rem; border-radius: 50%;
  background: var(--color-accent-soft); color: var(--color-primary);
  display: flex; align-items: center; justify-content: center; font-weight: 700;
}

/* ===== Contact ===== */
.contact-grid {
  display: grid; gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.contact-card {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); padding: 1.75rem 1.5rem; text-align: center;
  box-shadow: var(--shadow-sm);
}
.contact-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--color-accent-soft); font-size: 1.6rem; margin-bottom: .85rem;
}
.contact-card h3 { margin: 0 0 .35rem; font-size: 1rem; color: var(--color-primary-darker); }
.contact-card p { margin: 0; color: var(--color-text); font-size: 1rem; }
.contact-card a { color: var(--color-primary-darker); font-weight: 600; }

/* ===== FAQ accordion ===== */
.faq-list { display: flex; flex-direction: column; gap: .75rem; }
.faq-item {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); padding: 0 1.25rem; overflow: hidden;
  transition: box-shadow .2s ease, border-color .2s ease;
}
.faq-item[open] { box-shadow: var(--shadow); border-color: var(--color-accent-light); }
.faq-item > summary {
  list-style: none; cursor: pointer;
  padding: 1.15rem 0; font-weight: 600; color: var(--color-primary-darker);
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
}
.faq-item > summary::-webkit-details-marker { display: none; }
.faq-item > summary::after {
  content: ""; flex: 0 0 auto;
  width: 1.4rem; height: 1.4rem; border-radius: 50%;
  background: var(--color-accent-soft) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23088395' stroke-width='2.5'><path d='M4 6l4 4 4-4'/></svg>") center/65% no-repeat;
  transition: transform .2s ease;
}
.faq-item[open] > summary::after { transform: rotate(180deg); }
.faq-answer { padding: 0 0 1.15rem; color: var(--color-text); line-height: 1.7; }
.faq-answer p:last-child { margin-bottom: 0; }

/* ===== CTA band ===== */
.cta-band {
  background: linear-gradient(135deg, var(--color-primary-darker) 0%, var(--color-primary) 60%, var(--color-accent) 130%);
  color: #fff; padding: clamp(2.5rem, 6vw, 4rem) 0;
}
.cta-inner {
  display: grid; grid-template-columns: 1.2fr auto; gap: 1.5rem; align-items: center;
}
.cta-band h2 { color: #fff; margin: 0 0 .35rem; font-size: clamp(1.4rem, 2.5vw, 1.9rem); }
.cta-band p { color: rgba(255,255,255,.85); margin: 0; }
.cta-actions { display: flex; flex-wrap: wrap; gap: .75rem; }
.cta-band .btn-primary { background: #fff; color: var(--color-primary-darker); box-shadow: 0 6px 18px rgba(0,0,0,.25); }
.cta-band .btn-primary:hover { background: var(--color-accent-soft); color: var(--color-primary-darker); }
.cta-band .btn-ghost { color: #fff; border-color: rgba(255,255,255,.6); }
.cta-band .btn-ghost:hover { background: #fff; color: var(--color-primary-darker); }
@media (max-width: 700px) {
  .cta-inner { grid-template-columns: 1fr; text-align: start; }
}

/* ===== Footer ===== */
.site-footer { background: var(--color-primary-darker); color: rgba(255,255,255,.85); margin-top: 0; }
.footer-grid {
  display: grid; gap: 2.25rem;
  grid-template-columns: 1.4fr 1fr 1.2fr;
  padding: clamp(2.5rem, 6vw, 4rem) 0 2.5rem;
}
.footer-col h3, .footer-col h4 { color: #fff; margin: 0 0 .85rem; }
.footer-col p { color: rgba(255,255,255,.75); margin: 0; line-height: 1.7; }
.footer-logo { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,.10); display: flex; align-items: center; justify-content: center; padding: 8px; margin-bottom: 1rem; }
.footer-logo img { width: 100%; height: 100%; object-fit: contain; }
.footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .55rem; }
.footer-links a { color: rgba(255,255,255,.85); font-size: .96rem; }
.footer-links a:hover { color: var(--color-accent-light); }
.footer-contact { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: .8rem; }
.footer-contact li { display: flex; flex-direction: column; gap: .15rem; font-size: .96rem; }
.footer-contact a { color: #fff; }
.footer-label { color: rgba(255,255,255,.6); font-size: .8rem; text-transform: uppercase; letter-spacing: .05em; }
.footer-bottom { border-top: 1px solid rgba(255,255,255,.10); padding: 1.25rem 0; }
.footer-bottom-inner { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; }
.footer-bottom p { margin: 0; color: rgba(255,255,255,.65); font-size: .88rem; }
.footer-bottom a { color: rgba(255,255,255,.85); }
.footer-bottom a:hover { color: var(--color-accent-light); }
@media (max-width: 800px) {
  .footer-grid { grid-template-columns: 1fr; gap: 1.75rem; }
}

/* ===== RTL adjustments ===== */
.lang-ar .breadcrumbs ol { flex-direction: row-reverse; }
.lang-ar .breadcrumbs ol > * { unicode-bidi: plaintext; }

/* ===== Print-friendly ===== */
@media print {
  .site-header, .site-footer, .cta-band, .breadcrumbs, .nav-toggle { display: none !important; }
  body { background: #fff; color: #000; }
}
"""
write_file("assets/site.css", CSS)


JS = r"""(() => {
  const toggle = () => {
    const btn = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.primary-nav');
    if (!btn || !nav) return;
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  document.addEventListener('click', (e) => {
    if (e.target.closest('.nav-toggle')) {
      toggle();
    } else if (!e.target.closest('.primary-nav')) {
      const nav = document.querySelector('.primary-nav.open');
      const btn = document.querySelector('.nav-toggle');
      if (nav) { nav.classList.remove('open'); if (btn) btn.setAttribute('aria-expanded', 'false'); }
    }
  });
  // Close on Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const nav = document.querySelector('.primary-nav.open');
      const btn = document.querySelector('.nav-toggle');
      if (nav) { nav.classList.remove('open'); if (btn) btn.setAttribute('aria-expanded', 'false'); }
    }
  });
  // Set the dynamic year in the footer
  const y = new Date().getFullYear();
  document.querySelectorAll('.year').forEach(n => n.textContent = String(y));
})();
"""
write_file("assets/site.js", JS)


# ---------------------------------------------------------------------------
# robots.txt and sitemap.xml

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


# ---------------------------------------------------------------------------
# vercel.json

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
        },
        {
            "source": "/uploads/(.*)",
            "headers": [
                {"key": "Cache-Control", "value": "public, max-age=2592000, immutable"}
            ]
        },
        {
            "source": "/assets/(.*)",
            "headers": [
                {"key": "Cache-Control", "value": "public, max-age=2592000"}
            ]
        }
    ]
}
write_file("vercel.json", json.dumps(vercel, indent=2))


# uploads/ .gitkeep
write_file("uploads/.gitkeep", "")


# data snapshots
write_file("data/site.json", json.dumps(SITE, ensure_ascii=False, indent=2))
write_file("data/needed-uploads.txt", "\n".join(sorted(needed_uploads)) + "\n")

print("Pages:", len(SITE["pages"]))
print("Posts:", len(SITE["posts"]))
print("Needed uploads:", len(needed_uploads))
print("Unknown domains:", dict(unknown_domains))
print("Findings:", len(security_findings))

Path("/tmp/extract/findings.json").write_text(json.dumps({
    "findings": security_findings,
    "unknown_domains": dict(unknown_domains),
    "needed_uploads_count": len(needed_uploads),
    "excluded_post_ids": list(EXCLUDED_POST_IDS),
}, ensure_ascii=False, indent=2))
