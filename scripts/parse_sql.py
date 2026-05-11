#!/usr/bin/env python3
"""Parse the WordPress dump safely without executing SQL.

We treat the file as pure text. We only read INSERT INTO statements for
selected tables and decode MySQL string literals to plain UTF-8 strings.
No code from the dump is executed.
"""
import json
import re
import sys
from pathlib import Path

SQL = Path("backup-source/u613426641_epnHw_sanitized.sql")
OUT = Path("/tmp/extract")
OUT.mkdir(exist_ok=True)


def unescape_mysql(s: str) -> str:
    """Decode a single MySQL single-quoted literal body (no surrounding quotes)."""
    out = []
    i = 0
    while i < len(s):
        c = s[i]
        if c == "\\" and i + 1 < len(s):
            nxt = s[i + 1]
            mapping = {
                "n": "\n", "t": "\t", "r": "\r", "0": "\x00",
                "\\": "\\", "'": "'", '"': '"', "Z": "\x1a", "b": "\b",
            }
            out.append(mapping.get(nxt, nxt))
            i += 2
        elif c == "'" and i + 1 < len(s) and s[i + 1] == "'":
            out.append("'")
            i += 2
        else:
            out.append(c)
            i += 1
    return "".join(out)


def tokenize_values(text: str):
    """Yield list-of-fields for each tuple in a `VALUES (...),(...);` block.

    `text` should start AFTER the keyword VALUES (the leading whitespace is ok)
    and end at the terminating semicolon.
    """
    i = 0
    n = len(text)
    while i < n:
        while i < n and text[i] in " \t\r\n,":
            i += 1
        if i >= n or text[i] == ";":
            return
        if text[i] != "(":
            return
        i += 1
        fields = []
        while True:
            while i < n and text[i] in " \t\r\n":
                i += 1
            if i >= n:
                return
            if text[i] == "'":
                # string literal
                i += 1
                start = i
                buf = []
                while i < n:
                    ch = text[i]
                    if ch == "\\" and i + 1 < n:
                        buf.append(text[i:i + 2])
                        i += 2
                        continue
                    if ch == "'":
                        if i + 1 < n and text[i + 1] == "'":
                            buf.append("''")
                            i += 2
                            continue
                        break
                    buf.append(ch)
                    i += 1
                raw = "".join(buf)
                fields.append(unescape_mysql(raw))
                i += 1  # past closing quote
            elif text[i:i + 4].upper() == "NULL":
                fields.append(None)
                i += 4
            else:
                # number / unquoted token
                start = i
                while i < n and text[i] not in ",)":
                    i += 1
                tok = text[start:i].strip()
                if tok == "":
                    fields.append(None)
                else:
                    try:
                        if "." in tok:
                            fields.append(float(tok))
                        else:
                            fields.append(int(tok))
                    except ValueError:
                        fields.append(tok)
            while i < n and text[i] in " \t\r\n":
                i += 1
            if i < n and text[i] == ",":
                i += 1
                continue
            if i < n and text[i] == ")":
                i += 1
                yield fields
                break
            return


COLUMN_RE = re.compile(r"INSERT INTO `([^`]+)` \(([^)]+)\) VALUES")


def iter_inserts(path: Path, wanted_tables: set):
    """Yield (table, columns, [row, row, ...]) from the dump for wanted tables."""
    src = path.read_text(encoding="utf-8", errors="replace")
    pos = 0
    while True:
        m = COLUMN_RE.search(src, pos)
        if not m:
            return
        table = m.group(1)
        cols = [c.strip().strip("`") for c in m.group(2).split(",")]
        start = m.end()
        # find terminating semicolon at end of statement; statements end with ");\n"
        # but values may contain ");" inside strings; tokenize until ; outside strings.
        i = start
        n = len(src)
        in_str = False
        while i < n:
            c = src[i]
            if in_str:
                if c == "\\" and i + 1 < n:
                    i += 2
                    continue
                if c == "'":
                    if i + 1 < n and src[i + 1] == "'":
                        i += 2
                        continue
                    in_str = False
                    i += 1
                    continue
                i += 1
                continue
            else:
                if c == "'":
                    in_str = True
                    i += 1
                    continue
                if c == ";":
                    break
                i += 1
        end = i
        pos = end + 1
        if table not in wanted_tables:
            continue
        body = src[start:end]
        rows = list(tokenize_values(body))
        yield table, cols, rows


WANTED = {
    "wp_posts", "wp_postmeta", "wp_terms", "wp_termmeta",
    "wp_term_taxonomy", "wp_term_relationships", "wp_options",
}

result = {}
for table, cols, rows in iter_inserts(SQL, WANTED):
    result.setdefault(table, {"cols": cols, "rows": []})
    result[table]["rows"].extend(rows)

for t, data in result.items():
    print(f"{t}: cols={len(data['cols'])} rows={len(data['rows'])}")
    (OUT / f"{t}.json").write_text(
        json.dumps({"cols": data["cols"], "rows": data["rows"]}, ensure_ascii=False)
    )
