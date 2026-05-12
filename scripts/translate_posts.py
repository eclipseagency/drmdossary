#!/usr/bin/env python3
"""Machine-translate the Arabic blog posts in data/content.json into
English and append them as new entries with lang='en'.

Translation backend: the unofficial Google Translate web endpoint
(no API key). HTML-aware — tags pass through; only text is translated.

The script is idempotent: it skips any post whose EN counterpart
already exists on the same slug.
"""
from __future__ import annotations
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

CONTENT = Path(__file__).resolve().parent.parent / "data" / "content.json"
ENDPOINT = "https://translate.googleapis.com/translate_a/single"
MAX_CHUNK = 4500  # Google's free endpoint truncates around 5000 chars
SRC = "ar"
TGT = "en"


def _http_get_translation(text: str) -> str:
    if not text.strip():
        return text
    params = {
        "client": "gtx",
        "sl": SRC,
        "tl": TGT,
        "dt": "t",
        "q": text,
    }
    url = f"{ENDPOINT}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 drmdossary-translate-script",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read().decode("utf-8"))
    return "".join(seg[0] for seg in data[0] if seg and seg[0])


def translate_chunk(text: str, retries: int = 4) -> str:
    """Translate a single chunk; retry with backoff on transient errors."""
    delay = 1.0
    last_err: Exception | None = None
    for _ in range(retries):
        try:
            out = _http_get_translation(text)
            time.sleep(0.25)
            return out
        except Exception as e:
            last_err = e
            time.sleep(delay)
            delay *= 2
    raise RuntimeError(f"translation failed after {retries} retries: {last_err}")


# Split HTML at safe boundaries (between top-level block tags) so we can
# translate each piece under the chunk limit while keeping every tag
# intact.
BLOCK_RE = re.compile(
    r"(</?(?:p|div|section|article|figure|figcaption|ul|ol|li|h[1-6]|blockquote|table|thead|tbody|tr|td|th|pre)[^>]*>|<br\s*/?>|<hr\s*/?>)",
    re.IGNORECASE,
)


def split_into_chunks(html: str, limit: int = MAX_CHUNK) -> list[str]:
    if not html or len(html) <= limit:
        return [html]
    # Split on block boundaries
    pieces = BLOCK_RE.split(html)
    chunks: list[str] = []
    buf = ""
    for p in pieces:
        if not p:
            continue
        if len(buf) + len(p) > limit and buf:
            chunks.append(buf)
            buf = p
        else:
            buf += p
    if buf:
        chunks.append(buf)
    return chunks


def translate_html(html: str) -> str:
    chunks = split_into_chunks(html)
    return "".join(translate_chunk(c) if c.strip() else c for c in chunks)


def translate_plain(text: str) -> str:
    if not text or not text.strip():
        return text
    return translate_chunk(text)


def english_slug(ar_slug: str) -> str:
    # Keep the same slug for consistency between language versions.
    # Next's [slug] route handles URL-encoded Arabic in URLs.
    return ar_slug


def main():
    data = json.loads(CONTENT.read_text())
    posts: list[dict] = data["posts"]
    ar_posts = [p for p in posts if p.get("lang") == "ar"]
    en_slugs = {p["slug"] for p in posts if p.get("lang") == "en"}
    print(f"Found {len(ar_posts)} Arabic posts, {len(en_slugs)} existing English posts.")

    to_translate = [p for p in ar_posts if p["slug"] not in en_slugs]
    print(f"Translating {len(to_translate)} posts...")

    for i, ar in enumerate(to_translate, 1):
        slug = ar["slug"]
        print(f"[{i}/{len(to_translate)}] {slug[:60]}", flush=True)

        try:
            en_title = translate_plain(ar["title"])
            en_desc = translate_plain(ar.get("seo_description") or "")
            en_seo_title = translate_plain(ar.get("seo_title") or ar["title"])
            en_body = translate_html(ar["body_html"])
        except Exception as e:
            print(f"  FAILED: {e}")
            continue

        en_post = {
            "url": f"/en/blog/{english_slug(slug)}/",
            "slug": english_slug(slug),
            "lang": "en",
            "type": "post",
            "title": en_title,
            "date": ar["date"],
            "featured_image": ar.get("featured_image"),
            "seo_title": en_seo_title,
            "seo_description": en_desc,
            "body_html": en_body,
        }
        posts.append(en_post)

        # Save after every post so we can resume on failure.
        CONTENT.write_text(json.dumps(data, ensure_ascii=False, indent=2))

    print("Done.")


if __name__ == "__main__":
    main()
