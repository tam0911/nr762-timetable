"""Generate opaque icons and iOS startup images, then refresh index.html links.

Run from the repository root:

    python scripts/generate_pwa_assets.py

Requires Pillow and a CJK font (WenQuanYi Micro Hei).
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "icons"
SPLASH_DIR = ROOT / "splash"
INDEX = ROOT / "index.html"
FONT_PATH = "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc"

ORANGE = (255, 90, 9)
ORANGE_DARK = (212, 74, 7)
CREAM = (255, 242, 198)
INK = (57, 57, 57)
WHEEL = (42, 42, 42)
MUTED = (184, 184, 184)

# Portrait CSS pixels and device pixel ratio. Landscape startup images swap
# the pixel size; the media query keeps the portrait device-width/height,
# which is what Safari matches for apple-touch-startup-image.
DEVICES = [
    ("iphone-se", 375, 667, 2),
    ("iphone-plus", 414, 736, 3),
    ("iphone-x", 375, 812, 3),
    ("iphone-xr", 414, 896, 2),
    ("iphone-xs-max", 414, 896, 3),
    ("iphone-12", 390, 844, 3),
    ("iphone-12-max", 428, 926, 3),
    ("iphone-14-pro", 393, 852, 3),
    ("iphone-14-pro-max", 430, 932, 3),
    ("iphone-16-pro", 402, 874, 3),
    ("iphone-air", 420, 912, 3),
    ("iphone-16-pro-max", 440, 956, 3),
    ("ipad", 768, 1024, 2),
    ("ipad-10-2", 810, 1080, 2),
    ("ipad-mini", 744, 1133, 2),
    ("ipad-pro-10-5", 834, 1112, 2),
    ("ipad-10", 820, 1180, 2),
    ("ipad-pro-11", 834, 1194, 2),
    ("ipad-pro-11-m4", 834, 1210, 2),
    ("ipad-pro-12-9", 1024, 1366, 2),
    ("ipad-pro-13", 1032, 1376, 2),
]


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_PATH, size, index=0)


def draw_bus(canvas: Image.Image, box: tuple[float, float, float, float]) -> None:
    draw = ImageDraw.Draw(canvas)
    left, top, right, bottom = box
    width = right - left
    height = bottom - top
    wheel_r = height * 0.155
    wheel_y = bottom - wheel_r * 0.72
    for center in (left + width * 0.28, left + width * 0.76):
        draw.ellipse(
            (center - wheel_r, wheel_y - wheel_r, center + wheel_r, wheel_y + wheel_r),
            fill=WHEEL,
        )
        hub = wheel_r * 0.38
        draw.ellipse(
            (center - hub, wheel_y - hub, center + hub, wheel_y + hub),
            fill=CREAM,
        )

    body_top = top + height * 0.16
    body_bottom = wheel_y + wheel_r * 0.08
    radius = width * 0.1
    draw.rounded_rectangle(
        (left, body_top, right, body_bottom),
        radius=radius,
        fill=CREAM,
    )

    win_top = body_top + height * 0.14
    win_bottom = body_top + (body_bottom - body_top) * 0.46
    gap = width * 0.045
    win_w = (width - gap * 4) / 3
    x = left + gap
    for _ in range(3):
        draw.rounded_rectangle(
            (x, win_top, x + win_w, win_bottom),
            radius=width * 0.035,
            fill=ORANGE_DARK,
        )
        x += win_w + gap

    stripe_top = win_bottom + height * 0.07
    draw.rectangle(
        (left + width * 0.06, stripe_top, right - width * 0.06, stripe_top + height * 0.035),
        fill=ORANGE,
    )
    lamp_r = width * 0.035
    lamp_x = right - width * 0.1
    lamp_y = body_top + (body_bottom - body_top) * 0.72
    draw.ellipse(
        (lamp_x - lamp_r, lamp_y - lamp_r, lamp_x + lamp_r, lamp_y + lamp_r),
        fill=ORANGE,
    )


def render_icon(size: int, inset: float) -> Image.Image:
    image = Image.new("RGB", (size, size), ORANGE)
    margin = size * inset
    side = size - margin * 2
    # Keep the bus a little wider than tall, centered in the safe area.
    bus_w = side * 0.86
    bus_h = bus_w * 0.72
    left = (size - bus_w) / 2
    top = (size - bus_h) / 2
    draw_bus(image, (left, top, left + bus_w, top + bus_h))
    return image


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=True)


def render_splash(width: int, height: int, icon: Image.Image) -> Image.Image:
    image = Image.new("RGB", (width, height), INK)
    short = min(width, height)
    icon_px = max(128, int(short * 0.28))
    radius = int(icon_px * 0.223)
    icon_image = icon.resize((icon_px, icon_px), Image.Resampling.LANCZOS)
    mask = Image.new("L", (icon_px, icon_px), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, icon_px - 1, icon_px - 1), radius=radius, fill=255)

    title = "豫豐花園"
    subtitle = "NR762 · NR762A"
    title_font = font(max(28, int(short * 0.072)))
    sub_font = font(max(18, int(short * 0.04)))
    draw = ImageDraw.Draw(image)
    title_box = draw.textbbox((0, 0), title, font=title_font)
    sub_box = draw.textbbox((0, 0), subtitle, font=sub_font)
    title_h = title_box[3] - title_box[1]
    sub_h = sub_box[3] - sub_box[1]
    gap = int(short * 0.035)
    block_h = icon_px + gap + title_h + int(gap * 0.7) + sub_h
    top = (height - block_h) / 2
    icon_x = (width - icon_px) // 2
    image.paste(icon_image, (icon_x, int(top)), mask)

    title_w = title_box[2] - title_box[0]
    sub_w = sub_box[2] - sub_box[0]
    title_y = top + icon_px + gap - title_box[1]
    sub_y = title_y + title_h + int(gap * 0.7) - sub_box[1]
    draw.text(((width - title_w) / 2, title_y), title, font=title_font, fill=CREAM)
    draw.text(((width - sub_w) / 2, sub_y), subtitle, font=sub_font, fill=MUTED)
    return image


def splash_links() -> str:
    lines = []
    for name, css_w, css_h, dpr in DEVICES:
        for orientation in ("portrait", "landscape"):
            href = f"splash/{name}-{orientation}.png"
            media = (
                f"screen and (device-width: {css_w}px) and (device-height: {css_h}px) "
                f"and (-webkit-device-pixel-ratio: {dpr}) and (orientation: {orientation})"
            )
            lines.append(
                f'  <link rel="apple-touch-startup-image" media="{media}" href="{href}">'
            )
    return "\n".join(lines)


def update_index(links: str) -> None:
    html = INDEX.read_text(encoding="utf-8")
    start = "<!-- splash:start -->"
    end = "<!-- splash:end -->"
    if start not in html or end not in html:
        raise SystemExit("index.html is missing splash markers")
    before, rest = html.split(start, 1)
    _, after = rest.split(end, 1)
    INDEX.write_text(f"{before}{start}\n{links}\n  {end}{after}", encoding="utf-8")


def main() -> None:
    master = render_icon(1024, inset=0.08)
    icons = {
        "apple-touch-icon.png": 180,
        "icon-192.png": 192,
        "icon-512.png": 512,
    }
    for filename, size in icons.items():
        image = master.resize((size, size), Image.Resampling.LANCZOS) if size != 1024 else master
        save_png(image, ICON_DIR / filename)
    save_png(render_icon(512, inset=0.2), ICON_DIR / "icon-maskable-512.png")

    total = 0
    for name, css_w, css_h, dpr in DEVICES:
        for orientation, width, height in (
            ("portrait", css_w * dpr, css_h * dpr),
            ("landscape", css_h * dpr, css_w * dpr),
        ):
            image = render_splash(width, height, master)
            path = SPLASH_DIR / f"{name}-{orientation}.png"
            save_png(image, path)
            if image.size != (width, height):
                raise SystemExit(f"bad size for {path.name}: {image.size}")
            total += path.stat().st_size
    update_index(splash_links())
    print(f"Wrote icons and {len(DEVICES) * 2} startup images ({total / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
