#!/usr/bin/env python3
"""
Generate branded 1200x630 Open Graph / social-share cards for blog posts that
lack an explicit `image:` in front matter, and wire that image into front matter.

Design matches the site palette (navy #173d68 -> #0b1a2e, accent #6ea8e6).
Re-runnable: only touches posts without an `image:` and (re)writes the PNGs.

Usage:  python scripts/make_og_images.py
"""
import os
import re
import sys
import glob
from PIL import Image, ImageDraw, ImageFont

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOG_DIR = os.path.join(ROOT, "content", "blogs")
OUT_DIR = os.path.join(ROOT, "static", "images", "blogs", "og")
os.makedirs(OUT_DIR, exist_ok=True)

W, H = 1200, 630
PAD = 90
NAVY_TOP = (23, 61, 104)     # #173d68
NAVY_BOT = (11, 26, 46)      # #0b1a2e
ACCENT = (110, 168, 230)     # #6ea8e6
MUTED = (165, 182, 200)
WHITE = (255, 255, 255)

FONT_BOLD = r"C:\Windows\Fonts\arialbd.ttf"
FONT_REG = r"C:\Windows\Fonts\arial.ttf"


def gradient_bg():
    col = Image.new("RGB", (1, H))
    for y in range(H):
        t = y / (H - 1)
        col.putpixel((0, y), tuple(
            int(NAVY_TOP[i] * (1 - t) + NAVY_BOT[i] * t) for i in range(3)
        ))
    return col.resize((W, H))


def wrap(draw, text, font, max_w):
    lines, cur = [], ""
    for word in text.split():
        test = (cur + " " + word).strip()
        if draw.textlength(test, font=font) <= max_w or not cur:
            cur = test
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def parse_fm(path):
    with open(path, "rb") as fh:
        raw = fh.read()
    text = raw.decode("utf-8")
    m = re.match(r"^---\r?\n(.*?)\r?\n---", text, re.S)
    fm = m.group(1) if m else ""
    tm = re.search(r'^title:\s*"?(.*?)"?\s*$', fm, re.M)
    title = tm.group(1) if tm else os.path.splitext(os.path.basename(path))[0]
    cat = "Writing"
    cm = re.search(r"^categories:\s*\[(.*?)\]", fm, re.M)
    if cm:
        cat = cm.group(1).split(",")[0].strip().strip('"').strip("'") or "Writing"
    return title, cat


def add_image_frontmatter(path, rel):
    with open(path, "rb") as fh:
        raw = fh.read()
    nl = b"\r\n" if b"\r\n" in raw else b"\n"
    text = raw.decode("utf-8")
    lines = text.split(nl.decode())
    out, inserted = [], False
    for ln in lines:
        out.append(ln)
        if not inserted and ln.startswith("title:"):
            out.append('image: "%s"' % rel)
            inserted = True
    with open(path, "wb") as fh:
        fh.write(nl.join(s.encode("utf-8") for s in out))
    return inserted


def render(title, cat, out_path):
    img = gradient_bg()
    d = ImageDraw.Draw(img)
    # left accent spine
    d.rectangle([0, 0, 12, H], fill=ACCENT)
    # eyebrow (category)
    eb = ImageFont.truetype(FONT_BOLD, 28)
    d.text((PAD, 78), cat.upper(), font=eb, fill=ACCENT)
    # accent rule under eyebrow
    d.rectangle([PAD, 124, PAD + 56, 128], fill=ACCENT)
    # title: pick the largest size that fits in <= 4 lines
    max_w = W - 2 * PAD
    title_font = None
    lines = []
    for size in (72, 64, 58, 52, 46, 42):
        f = ImageFont.truetype(FONT_BOLD, size)
        wl = wrap(d, title, f, max_w)
        if len(wl) <= 4:
            title_font, lines, fsize = f, wl, size
            break
    if title_font is None:
        fsize = 42
        title_font = ImageFont.truetype(FONT_BOLD, fsize)
        lines = wrap(d, title, title_font, max_w)[:4]
    lh = int(fsize * 1.18)
    block_h = lh * len(lines)
    y = max(170, (H - block_h) // 2 - 30)
    for ln in lines:
        d.text((PAD, y), ln, font=title_font, fill=WHITE)
        y += lh
    # footer brand line
    fb = ImageFont.truetype(FONT_BOLD, 30)
    fr = ImageFont.truetype(FONT_REG, 30)
    by = H - PAD - 6
    name = "Arda Akgül"
    d.text((PAD, by), name, font=fb, fill=WHITE)
    wname = d.textlength(name, font=fb)
    d.text((PAD + wname, by), "   ·   akgularda.com", font=fr, fill=MUTED)
    img.save(out_path, "PNG", optimize=True)


def main():
    posts = [p for p in glob.glob(os.path.join(BLOG_DIR, "**", "*.md"), recursive=True)
             if os.path.basename(p) != "_index.md"]
    done = 0
    for path in posts:
        with open(path, "rb") as fh:
            head = fh.read().decode("utf-8")
        m = re.search(r'^image:\s*"?(.*?)"?\s*$', head, re.M)
        # Skip posts that already point to a real photo; (re)generate our own cards.
        if m and "/images/blogs/og/" not in m.group(1):
            continue
        need_fm = m is None
        stem = os.path.splitext(os.path.basename(path))[0]
        title, cat = parse_fm(path)
        rel = "/images/blogs/og/%s.png" % stem
        out_path = os.path.join(OUT_DIR, "%s.png" % stem)
        render(title, cat, out_path)
        if need_fm:
            add_image_frontmatter(path, rel)
        print("OG  %-44s <- %s" % (stem + ".png", title[:48]))
        done += 1
    print("Generated %d OG cards into static/images/blogs/og/" % done)


if __name__ == "__main__":
    main()
