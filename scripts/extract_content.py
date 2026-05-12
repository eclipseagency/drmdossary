#!/usr/bin/env python3
"""Extract page/post body HTML + metadata from the current static site into
content.json for Next.js consumption.

We read the previously rendered HTML pages (which already have sanitized
content from the original WordPress sanitization pass) and pull out:
  * the inner content of <article class="page-body"> / <article class="blog-post"> / .prose
  * the title from <h1> in the hero
  * SEO title + description from <title> and <meta name="description">
  * featured image for blog posts (from post-hero-figure img)

Output: data/content.json with `pages` and `posts` arrays.
"""
from __future__ import annotations
import json
import re
from pathlib import Path
from urllib.parse import unquote

from bs4 import BeautifulSoup

ROOT = Path(".").resolve()
OUT = ROOT / "data" / "content.json"

# Pages: (url, lang)
PAGES = [
    ("/", "ar"),
    ("/about-us/", "ar"),
    ("/services/", "ar"),
    ("/contact-us/", "ar"),
    ("/faqs/", "ar"),
    ("/blogs/", "ar"),
    ("/corneal-surgeries/", "ar"),
    ("/treatment-of-cataracts/", "ar"),
    ("/vision-correction-surgeries/", "ar"),
    ("/privacy-policy/", "ar"),
    ("/en/", "en"),
    ("/en/about-us/", "en"),
    ("/en/services/", "en"),
    ("/en/contact-us/", "en"),
    ("/en/faq/", "en"),
    ("/en/corneal-surgeries/", "en"),
    ("/en/treatment-of-cataracts/", "en"),
    ("/en/vision-correction-surgeries/", "en"),
]


def html_path(url: str) -> Path:
    return ROOT / (url.lstrip("/").rstrip("/") + "/index.html" if url != "/" else "index.html")


def extract_page(url: str, lang: str) -> dict | None:
    p = html_path(url)
    if not p.exists():
        return None
    soup = BeautifulSoup(p.read_text(encoding="utf-8"), "lxml")
    title_tag = soup.find("title")
    desc_tag = soup.find("meta", attrs={"name": "description"})
    h1 = soup.find("h1")

    # Try to find a content container. Different page types use different wrappers.
    body_node = (
        soup.find("article", class_="page-body")
        or soup.find("article", class_="blog-post")
        or soup.find("section", class_="section-article")
        or soup.find("div", class_="page-body")
    )

    body_html = ""
    if body_node:
        # If it's the article wrapper that includes the post header, grab .prose / .post-body inside.
        prose = body_node.find("div", class_="prose") or body_node.find("div", class_="post-body")
        body_html = str(prose or body_node)

    # For home pages, the body is everything between <main> and </main> minus the hero.
    # We don't actually need the home body — the new home is custom-built — so leave empty.
    page_type = "home" if url in ("/", "/en/") else "page"
    return {
        "url": url,
        "lang": lang,
        "type": page_type,
        "title": (h1.get_text(strip=True) if h1 else (title_tag.get_text(strip=True) if title_tag else "")),
        "seo_title": title_tag.get_text(strip=True) if title_tag else "",
        "seo_description": desc_tag["content"] if desc_tag and desc_tag.has_attr("content") else "",
        "body_html": body_html,
    }


def extract_post(html_file: Path) -> dict | None:
    soup = BeautifulSoup(html_file.read_text(encoding="utf-8"), "lxml")
    title_tag = soup.find("title")
    desc_tag = soup.find("meta", attrs={"name": "description"})

    # Title
    h1 = soup.find("h1", class_="post-title") or soup.find("h1")
    title = h1.get_text(strip=True) if h1 else ""

    # Date
    time_tag = soup.find("time")
    date = time_tag.get("datetime", "") if time_tag else ""

    # Featured image
    fig = soup.find("figure", class_="post-hero-figure")
    feat = None
    if fig:
        img = fig.find("img")
        if img and img.get("src"):
            feat = img["src"]

    # Body
    article = soup.find("article", class_="blog-article")
    prose = (article.find("div", class_="prose") if article else None) or soup.find("div", class_="prose")
    body_html = str(prose) if prose else ""

    # Lang from html attr
    html_root = soup.find("html")
    lang = (html_root.get("lang") if html_root else "ar") or "ar"

    # URL from canonical
    can = soup.find("link", rel="canonical")
    canon_path = ""
    if can and can.get("href"):
        # strip the host part
        canon_path = can["href"].replace("https://drmdossary.com", "").replace("https://www.drmdossary.com", "")
    if not canon_path:
        # derive from file path
        rel = html_file.relative_to(ROOT)
        canon_path = "/" + str(rel.parent).replace("\\", "/") + "/"

    # Slug = last path segment
    slug = canon_path.rstrip("/").split("/")[-1]

    return {
        "url": canon_path,
        "slug": slug,
        "lang": lang,
        "type": "post",
        "title": title,
        "date": date,
        "featured_image": feat,
        "seo_title": title_tag.get_text(strip=True) if title_tag else title,
        "seo_description": desc_tag["content"] if desc_tag and desc_tag.has_attr("content") else "",
        "body_html": body_html,
    }


def collect_posts() -> list[dict]:
    out = []
    for base in ("blog", "en/blog"):
        d = ROOT / base
        if not d.is_dir():
            continue
        for sub in sorted(d.iterdir()):
            if not sub.is_dir():
                continue
            idx = sub / "index.html"
            if not idx.exists():
                continue
            row = extract_post(idx)
            if row:
                out.append(row)
    return out


def main():
    pages = [extract_page(u, l) for (u, l) in PAGES]
    pages = [p for p in pages if p]
    posts = collect_posts()

    # Sort posts by date desc
    posts.sort(key=lambda p: p.get("date") or "", reverse=True)

    # Strip any reference to the legacy /uploads/.gitkeep
    output = {"pages": pages, "posts": posts}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(output, ensure_ascii=False, indent=2))
    print(f"Wrote {OUT}")
    print(f"  pages: {len(pages)}")
    print(f"  posts: {len(posts)}")


if __name__ == "__main__":
    main()
