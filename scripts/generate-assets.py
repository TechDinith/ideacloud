"""
Generates the static image assets IdeaCloud needs for search and social previews:

  public/og-image.png          1200x630  Open Graph / Twitter card
  public/apple-touch-icon.png  180x180   iOS home screen
  public/favicon-32x32.png     32x32     legacy favicon fallback
  public/icon-192.png          192x192   PWA manifest
  public/icon-512.png          512x512   PWA manifest

Mirrors the Indigo theme gradient from src/index.css. Run with:
    python scripts/generate-assets.py
"""

import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")

BG_TOP = (10, 10, 15)
BG_BOTTOM = (17, 16, 34)
GRADIENT = ((99, 102, 241), (139, 92, 246))
GLOW_A = (99, 102, 241)
GLOW_B = (217, 70, 239)

# Cloud built as a union of circles plus a rounded base, in 0..1 space.
CLOUD_LOBES = [
    (0.495, 0.395, 0.205),
    (0.300, 0.545, 0.140),
    (0.690, 0.530, 0.150),
    (0.830, 0.620, 0.095),
    (0.170, 0.625, 0.090),
]
CLOUD_BASE = (0.080, 0.615, 0.920, 0.800, 0.090)


def vertical_gradient(size, top, bottom):
    w, h = size
    base = Image.new("RGB", (1, h))
    px = base.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        px[0, y] = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
    return base.resize((w, h), Image.BICUBIC)


def diagonal_gradient(size, c1, c2):
    w, h = size
    small = 64
    grad = Image.new("RGB", (small, small))
    px = grad.load()
    for y in range(small):
        for x in range(small):
            t = (x / (small - 1) * 0.65) + (y / (small - 1) * 0.35)
            px[x, y] = tuple(round(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return grad.resize((w, h), Image.BICUBIC)


def add_glow(img, center, radius, color, strength):
    w, h = img.size
    layer = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(layer)
    cx, cy = center
    d.ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        fill=int(255 * strength),
    )
    layer = layer.filter(ImageFilter.GaussianBlur(max(radius * 0.55, 1)))
    tint = Image.new(img.mode, (w, h), color)
    out = img.copy()
    out.paste(tint, (0, 0), layer)
    return out


def cloud_mask(size):
    """Union of the cloud lobes plus a rounded base, antialiased."""
    ss = 4
    big = size * ss
    mask = Image.new("L", (big, big), 0)
    d = ImageDraw.Draw(mask)
    for cx, cy, r in CLOUD_LOBES:
        d.ellipse(
            [(cx - r) * big, (cy - r) * big, (cx + r) * big, (cy + r) * big],
            fill=255,
        )
    x0, y0, x1, y1, br = CLOUD_BASE
    d.rounded_rectangle(
        [x0 * big, y0 * big, x1 * big, y1 * big],
        radius=br * big,
        fill=255,
    )
    return mask.resize((size, size), Image.LANCZOS)


def draw_cloud(size, colors):
    """Render the cloud shape filled with a diagonal two-stop gradient."""
    grad = diagonal_gradient((size, size), colors[0], colors[1]).convert("RGBA")
    grad.putalpha(cloud_mask(size))
    return grad


def font_for(size, bold=False):
    candidates = []
    if bold:
        candidates += [
            "seguisb.ttf", "segoeuib.ttf", "arialbd.ttf", "arial.ttf",
        ]
    else:
        candidates += [
            "segoeui.ttf", "segoeuil.ttf", "arial.ttf", "calibri.ttf",
        ]
    for name in candidates:
        for root in (r"C:\Windows\Fonts", "/usr/share/fonts/truetype/dejavu", "/System/Library/Fonts"):
            path = os.path.join(root, name)
            if os.path.exists(path):
                try:
                    return ImageFont.truetype(path, size)
                except OSError:
                    continue
    try:
        from PIL import ImageFont as IF
        return IF.load_default(size)
    except Exception:
        return ImageFont.load_default()


def text_width(draw, text, font):
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def build_og_image():
    w, h = 1200, 630
    img = vertical_gradient((w, h), BG_TOP, BG_BOTTOM)
    img = add_glow(img, (int(w * 0.16), int(h * 0.18)), int(w * 0.28), GLOW_A, 0.30)
    img = add_glow(img, (int(w * 0.88), int(h * 0.86)), int(w * 0.30), GLOW_B, 0.24)

    cloud_size = 220
    cloud = draw_cloud(cloud_size, GRADIENT)
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    shadow.paste(cloud, ((w - cloud_size) // 2, 92), cloud)
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    img = Image.alpha_composite(img.convert("RGBA"), shadow)
    img.paste(cloud, ((w - cloud_size) // 2, 92), cloud)

    draw = ImageDraw.Draw(img)

    title_font = font_for(92, bold=True)
    tag_font = font_for(32)

    title = "IdeaCloud"
    tw, _ = text_width(draw, title, title_font)
    tx = (w - tw) / 2
    ty = 380

    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).text((tx, ty), title, font=title_font, fill=255)
    grad = diagonal_gradient((w, h), GRADIENT[0], GRADIENT[1])
    img.paste(grad, (0, 0), mask)

    tagline = "Where Ideas Meet Sponsors"
    tw2, _ = text_width(draw, tagline, tag_font)
    draw.text(((w - tw2) / 2, 506), tagline, font=tag_font, fill=(156, 163, 175))

    return img.convert("RGB")


def build_icon(size, with_bg=True):
    if not with_bg:
        return draw_cloud(size, GRADIENT)

    img = vertical_gradient((size, size), BG_TOP, BG_BOTTOM).convert("RGBA")
    img = add_glow(img, (int(size * 0.5), int(size * 0.4)), int(size * 0.5), GLOW_A, 0.28).convert("RGBA")
    cloud_size = int(size * 0.78)
    cloud = draw_cloud(cloud_size, GRADIENT)
    off = (size - cloud_size) // 2
    img.paste(cloud, (off, off), cloud)
    return img.convert("RGB")


def main():
    os.makedirs(PUBLIC, exist_ok=True)

    jobs = [
        ("og-image.png", build_og_image()),
        ("apple-touch-icon.png", build_icon(180)),
        ("favicon-32x32.png", build_icon(32)),
        ("icon-192.png", build_icon(192)),
        ("icon-512.png", build_icon(512)),
    ]

    for name, img in jobs:
        out = os.path.join(PUBLIC, name)
        img.convert("RGB").save(out, "PNG", optimize=True)
        print(f"[assets] {name}  {img.size[0]}x{img.size[1]}  {os.path.getsize(out)} bytes")

    print("[assets] done.")


if __name__ == "__main__":
    main()
