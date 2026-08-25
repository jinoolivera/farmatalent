import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


WIDTH = 1200
HEIGHT = 630
CARD_X = 18
CARD_Y = 14
CARD_WIDTH = WIDTH - (CARD_X * 2)
CARD_HEIGHT = HEIGHT - (CARD_Y * 2)


def load_font(size: int, bold: bool = False, italic: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold and italic:
        candidates.extend([
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf",
            "/usr/share/fonts/dejavu/DejaVuSans-BoldOblique.ttf",
            "/usr/share/fonts/TTF/DejaVuSans-BoldOblique.ttf",
            "C:/Windows/Fonts/arialbi.ttf",
        ])
    elif bold:
        candidates.extend([
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
        ])
    elif italic:
        candidates.extend([
            "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
            "/usr/share/fonts/dejavu/DejaVuSerif-Italic.ttf",
            "/usr/share/fonts/TTF/DejaVuSerif-Italic.ttf",
            "C:/Windows/Fonts/georgiai.ttf",
        ])
    else:
        candidates.extend([
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/TTF/DejaVuSans.ttf",
            "C:/Windows/Fonts/arial.ttf",
        ])

    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)

    return ImageFont.load_default()


def text_size(draw: ImageDraw.ImageDraw, text: str, font) -> tuple[int, int]:
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    return right - left, bottom - top


def fit_line(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> str:
    text = " ".join((text or "").split())
    if not text:
        return ""

    if text_size(draw, text, font)[0] <= max_width:
        return text

    words = text.split(" ")
    while words:
        candidate = " ".join(words).rstrip(" .,:;")
        trimmed = f"{candidate}..."
        if text_size(draw, trimmed, font)[0] <= max_width:
            return trimmed
        words.pop()

    return "..."


def wrap_for_width(draw: ImageDraw.ImageDraw, text: str, font, max_width: int, max_lines: int):
    words = [word for word in " ".join((text or "").split()).split(" ") if word]
    if not words:
        return [""]

    lines = []
    current = ""
    index = 0

    while index < len(words):
        word = words[index]
        candidate = word if not current else f"{current} {word}"
        if text_size(draw, candidate, font)[0] <= max_width:
            current = candidate
            index += 1
            continue

        if current:
            lines.append(current)
            current = ""
            if len(lines) == max_lines - 1:
                remainder = " ".join(words[index:])
                lines.append(fit_line(draw, remainder, font, max_width))
                return lines
            continue

        lines.append(fit_line(draw, word, font, max_width))
        index += 1
        if len(lines) == max_lines:
            return lines

    if current:
        lines.append(current)

    return lines[:max_lines]


def draw_text_block(draw: ImageDraw.ImageDraw, lines, x: int, y: int, line_height: int, font, fill):
    for index, line in enumerate(lines):
        draw.text((x, y + (index * line_height)), line, font=font, fill=fill)


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def open_cover_image(path: str | None, width: int, height: int, focal_x: float = 0.58, focal_y: float = 0.43) -> Image.Image:
    if path and Path(path).exists():
        source = Image.open(path).convert("RGBA")
    else:
        source = Image.new("RGBA", (width, height), (10, 22, 40, 255))
        gradient_draw = ImageDraw.Draw(source)
        gradient_draw.rectangle((0, 0, width, height), fill=(10, 22, 40, 255))
        return source

    source_ratio = source.width / source.height
    target_ratio = width / height

    if source_ratio > target_ratio:
        crop_height = source.height
        crop_width = int(crop_height * target_ratio)
        max_left = source.width - crop_width
        left = int(max_left * focal_x)
        top = 0
    else:
        crop_width = source.width
        crop_height = int(crop_width / target_ratio)
        max_top = source.height - crop_height
        left = 0
        top = int(max_top * focal_y)

    left = max(0, min(left, source.width - crop_width))
    top = max(0, min(top, source.height - crop_height))
    crop = source.crop((left, top, left + crop_width, top + crop_height))

    return crop.resize((width, height), Image.Resampling.LANCZOS)


def draw_vertical_gradient(base: Image.Image, box, start_color, end_color):
    x0, y0, x1, y1 = box
    width = max(1, x1 - x0)
    height = max(1, y1 - y0)
    gradient = Image.new("RGBA", (width, height))
    pixels = gradient.load()
    for y in range(height):
        t = y / max(1, height - 1)
        color = tuple(int(start_color[i] + (end_color[i] - start_color[i]) * t) for i in range(4))
        for x in range(width):
            pixels[x, y] = color
    base.alpha_composite(gradient, (x0, y0))


def draw_horizontal_gradient(base: Image.Image, box, start_color, end_color):
    x0, y0, x1, y1 = box
    width = max(1, x1 - x0)
    height = max(1, y1 - y0)
    gradient = Image.new("RGBA", (width, height))
    pixels = gradient.load()
    for x in range(width):
        t = x / max(1, width - 1)
        color = tuple(int(start_color[i] + (end_color[i] - start_color[i]) * t) for i in range(4))
        for y in range(height):
            pixels[x, y] = color
    base.alpha_composite(gradient, (x0, y0))


def draw_radial_glow(base: Image.Image, center, radius, color):
    glow = Image.new("RGBA", (radius * 2, radius * 2), (0, 0, 0, 0))
    pixels = glow.load()
    for y in range(radius * 2):
        for x in range(radius * 2):
            dx = x - radius
            dy = y - radius
            distance = math.sqrt(dx * dx + dy * dy)
            if distance > radius:
                continue
            alpha = int(color[3] * (1 - distance / radius) ** 2)
            pixels[x, y] = (color[0], color[1], color[2], alpha)
    base.alpha_composite(glow, (center[0] - radius, center[1] - radius))


def draw_logo_circle(base: Image.Image, draw: ImageDraw.ImageDraw, logo_path: str | None, initials: str, x: int, y: int, size: int):
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse((0, 0, size - 1, size - 1), fill=255)

    badge = Image.new("RGBA", (size, size), (255, 255, 255, 248))
    if logo_path and Path(logo_path).exists():
        try:
            logo = Image.open(logo_path).convert("RGBA")
            logo.thumbnail((size - 16, size - 16))
            layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            logo_x = (size - logo.width) // 2
            logo_y = (size - logo.height) // 2
            layer.alpha_composite(logo, (logo_x, logo_y))
            badge.alpha_composite(layer)
        except Exception:
            pass

    base.paste(badge, (x, y), mask)
    ImageDraw.Draw(base).ellipse((x, y, x + size - 1, y + size - 1), outline=(255, 255, 255, 96), width=1)

    if not logo_path or not Path(logo_path).exists():
        font = load_font(28, bold=True)
        text = initials[:2] or "FT"
        text_w, text_h = text_size(draw, text, font)
        draw.text((x + ((size - text_w) // 2), y + ((size - text_h) // 2) - 2), text, font=font, fill=(95, 160, 130, 255))


def draw_pin_icon(draw: ImageDraw.ImageDraw, x: int, y: int, color):
    draw.ellipse((x + 3, y, x + 11, y + 8), outline=color, width=2)
    draw.line((x + 7, y + 8, x + 7, y + 15), fill=color, width=2)
    draw.polygon([(x + 7, y + 18), (x + 4, y + 12), (x + 10, y + 12)], fill=color)


def draw_clock_icon(draw: ImageDraw.ImageDraw, x: int, y: int, color):
    draw.ellipse((x + 1, y + 1, x + 15, y + 15), outline=color, width=2)
    draw.line((x + 8, y + 8, x + 8, y + 4), fill=color, width=2)
    draw.line((x + 8, y + 8, x + 12, y + 10), fill=color, width=2)


def draw_calendar_icon(draw: ImageDraw.ImageDraw, x: int, y: int, color):
    draw.rounded_rectangle((x + 1, y + 3, x + 15, y + 16), radius=3, outline=color, width=2)
    draw.line((x + 1, y + 7, x + 15, y + 7), fill=color, width=2)
    draw.line((x + 5, y, x + 5, y + 5), fill=color, width=2)
    draw.line((x + 11, y, x + 11, y + 5), fill=color, width=2)


def draw_arrow_icon(draw: ImageDraw.ImageDraw, x: int, y: int, color):
    draw.line((x, y + 8, x + 16, y + 8), fill=color, width=2)
    draw.line((x + 10, y + 2, x + 16, y + 8), fill=color, width=2)
    draw.line((x + 10, y + 14, x + 16, y + 8), fill=color, width=2)


def draw_chip(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, font, icon: str):
    width, height = text_size(draw, text, font)
    padding_left = 16
    padding_right = 18
    icon_width = 18
    gap = 10
    pill_height = 42
    pill_width = width + padding_left + padding_right + icon_width + gap
    draw.rounded_rectangle(
        (x, y, x + pill_width, y + pill_height),
        radius=21,
        fill=(255, 255, 255, 18),
        outline=(255, 255, 255, 36),
        width=1,
    )
    icon_x = x + padding_left
    icon_y = y + 11
    icon_color = (255, 255, 255, 230)
    if icon == "pin":
        draw_pin_icon(draw, icon_x, icon_y, icon_color)
    elif icon == "clock":
        draw_clock_icon(draw, icon_x, icon_y + 1, icon_color)
    else:
        draw_calendar_icon(draw, icon_x, icon_y + 1, icon_color)

    draw.text((icon_x + icon_width + gap, y + 11), text, font=font, fill=(255, 255, 255, 255))
    return pill_width


def draw_brand_mark(base: Image.Image, x: int, y: int, size: int, logo_path: str | None):
    if logo_path and Path(logo_path).exists():
        try:
            logo = Image.open(logo_path).convert("RGBA")
            logo.thumbnail((size, size), Image.Resampling.LANCZOS)
            layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            layer.alpha_composite(logo, ((size - logo.width) // 2, (size - logo.height) // 2))
            base.alpha_composite(layer, (x, y))
            return
        except Exception:
            pass

    fallback = ImageDraw.Draw(base)
    fallback.rounded_rectangle((x, y, x + size, y + size), radius=10, fill=(30, 68, 128, 255))
    fallback.line((x + 12, y + size - 12, x + size // 2, y + size // 2, x + size - 12, y + 12), fill=(255, 255, 255, 255), width=4)
    fallback.ellipse((x + 7, y + size - 19, x + 19, y + size - 7), fill=(242, 109, 125, 255))
    fallback.ellipse((x + size - 19, y + 7, x + size - 7, y + 19), fill=(91, 176, 122, 255))


def main():
    if len(sys.argv) != 3:
        print("Usage: render_share_image.py <payload.json> <output.png>", file=sys.stderr)
        sys.exit(1)

    payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    output_path = Path(sys.argv[2])

    canvas = Image.new("RGBA", (WIDTH, HEIGHT), (6, 18, 42, 255))
    card = open_cover_image(payload.get("backgroundFilePath"), CARD_WIDTH, CARD_HEIGHT)

    draw_vertical_gradient(card, (0, 0, CARD_WIDTH, CARD_HEIGHT), (6, 18, 42, 82), (6, 18, 42, 136))
    draw_horizontal_gradient(card, (0, 0, CARD_WIDTH, CARD_HEIGHT), (6, 18, 42, 106), (6, 18, 42, 18))
    draw_radial_glow(card, (180, 480), 220, (6, 18, 42, 52))
    draw_radial_glow(card, (1020, 80), 180, (255, 255, 255, 24))

    card_mask = rounded_mask((CARD_WIDTH, CARD_HEIGHT), 14)
    canvas.paste(card, (CARD_X, CARD_Y), card_mask)

    draw = ImageDraw.Draw(canvas)

    inner_x = CARD_X + 52
    inner_y = CARD_Y + 44
    logo_size = 56

    draw_logo_circle(
        canvas,
        draw,
        payload.get("logoFilePath"),
        payload.get("companyInitials", "FT"),
        inner_x,
        inner_y,
        logo_size,
    )

    company_x = inner_x + logo_size + 18
    company_name = fit_line(draw, payload.get("companyName", "FarmaTalent"), load_font(22, bold=True), 420)
    company_meta = fit_line(draw, payload.get("companyMeta", "BOTICA · LIMA"), load_font(10, bold=True), 420)
    draw.text((company_x, inner_y + 6), company_name, font=load_font(22, bold=True), fill=(255, 255, 255, 255))
    draw.text((company_x, inner_y + 34), company_meta, font=load_font(10, bold=True), fill=(255, 255, 255, 154))

    badge_font = load_font(12, bold=True)
    badge_text = fit_line(draw, payload.get("badgeText", "TURNO ACTIVO"), badge_font, 190)
    badge_w, _ = text_size(draw, badge_text, badge_font)
    badge_box = (CARD_X + CARD_WIDTH - 220, inner_y + 4, CARD_X + CARD_WIDTH - 32, inner_y + 42)
    draw.rounded_rectangle(badge_box, radius=19, fill=(242, 109, 125, 255))
    draw.text((badge_box[0] + ((badge_box[2] - badge_box[0] - badge_w) // 2), badge_box[1] + 11), badge_text, font=badge_font, fill=(59, 9, 18, 255))

    label_y = CARD_Y + 362
    draw.text((inner_x, label_y), "REQUERIMIENTO DE PERSONAL", font=load_font(12, bold=True), fill=(126, 226, 168, 255))

    main_font = load_font(52, bold=True)
    headline_main = fit_line(draw, payload.get("headlineMain", "Buscamos talento"), main_font, 860)
    draw.text((inner_x, label_y + 38), headline_main, font=main_font, fill=(255, 255, 255, 255))

    accent_font = load_font(28, italic=True)
    accent_lines = wrap_for_width(draw, payload.get("headlineAccent", "para tu siguiente turno"), accent_font, 820, 2)
    draw_text_block(draw, accent_lines, inner_x, label_y + 98, 32, accent_font, (181, 217, 196, 255))

    chip_font = load_font(15, bold=False)
    chip_y = CARD_Y + 506
    chip_x = inner_x
    chips = [
        ("pin", f"{payload.get('locationShort', payload.get('location', 'Ubicacion por confirmar'))}"),
        ("clock", f"{payload.get('schedule', 'Horario por confirmar')}"),
        ("calendar", f"{payload.get('date', 'Fecha por confirmar')}"),
    ]
    for chip_icon, chip_text in chips:
        chip_x += draw_chip(draw, chip_x, chip_y, chip_text, chip_font, chip_icon) + 14

    cta_box = (inner_x, CARD_Y + 550, inner_x + 248, CARD_Y + 596)
    draw.rounded_rectangle(cta_box, radius=31, fill=(255, 255, 255, 255))
    draw.text((cta_box[0] + 32, cta_box[1] + 12), "Postula ahora", font=load_font(18, bold=True), fill=(15, 23, 42, 255))
    draw_arrow_icon(draw, cta_box[0] + 186, cta_box[1] + 11, (15, 23, 42, 255))

    footer_x = cta_box[2] + 28
    footer_y = cta_box[1] - 4
    draw.text((footer_x, footer_y), "PUBLICADO EN", font=load_font(11, bold=True), fill=(255, 255, 255, 108))
    brand_y = footer_y + 16
    draw_brand_mark(canvas, footer_x + 130, brand_y, 24, payload.get("farmatalentLogoFilePath"))
    draw.text((footer_x + 162, brand_y + 2), "FarmaTalent", font=load_font(16, bold=True), fill=(255, 255, 255, 255))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    flattened = Image.alpha_composite(Image.new("RGBA", canvas.size, (6, 18, 42, 255)), canvas)
    flattened.convert("RGB").save(output_path, format="PNG")


if __name__ == "__main__":
    main()
