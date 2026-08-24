import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


WIDTH = 1200
HEIGHT = 630


def load_font(size: int, bold: bool = False, italic: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold and italic:
        candidates.extend([
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf",
            "C:/Windows/Fonts/arialbi.ttf",
        ])
    elif bold:
        candidates.extend([
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
        ])
    elif italic:
        candidates.extend([
            "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
            "C:/Windows/Fonts/georgiai.ttf",
        ])
    else:
        candidates.extend([
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "C:/Windows/Fonts/arial.ttf",
        ])

    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)

    return ImageFont.load_default()


def rounded_rectangle(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width: int = 1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_vertical_gradient(base: Image.Image, box, start_color, end_color):
    x0, y0, x1, y1 = box
    width = max(1, x1 - x0)
    height = max(1, y1 - y0)
    grad = Image.new("RGBA", (width, height))
    px = grad.load()
    for y in range(height):
        t = y / max(1, height - 1)
        color = tuple(int(start_color[i] + (end_color[i] - start_color[i]) * t) for i in range(4))
        for x in range(width):
            px[x, y] = color
    base.alpha_composite(grad, (x0, y0))


def draw_radial_glow(base: Image.Image, center, radius, color):
    glow = Image.new("RGBA", (radius * 2, radius * 2), (0, 0, 0, 0))
    px = glow.load()
    for y in range(radius * 2):
        for x in range(radius * 2):
            dx = x - radius
            dy = y - radius
            distance = math.sqrt(dx * dx + dy * dy)
            if distance > radius:
                continue
            alpha = int(color[3] * (1 - distance / radius) ** 2)
            px[x, y] = (color[0], color[1], color[2], alpha)
    base.alpha_composite(glow, (center[0] - radius, center[1] - radius))


def text_size(draw: ImageDraw.ImageDraw, text: str, font) -> tuple[int, int]:
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    return right - left, bottom - top


def fit_line(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> str:
    text = " ".join(text.split())
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


def draw_logo_circle(base: Image.Image, draw: ImageDraw.ImageDraw, logo_path: str | None, initials: str, x: int, y: int, size: int):
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse((0, 0, size - 1, size - 1), fill=255)

    bg = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    if logo_path and Path(logo_path).exists():
        try:
            logo = Image.open(logo_path).convert("RGBA")
            logo.thumbnail((size - 18, size - 18))
            layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            logo_x = (size - logo.width) // 2
            logo_y = (size - logo.height) // 2
            layer.alpha_composite(logo, (logo_x, logo_y))
            bg.alpha_composite(layer)
        except Exception:
            pass

    base.paste(bg, (x, y), mask)
    outline = ImageDraw.Draw(base)
    outline.ellipse((x, y, x + size - 1, y + size - 1), outline=(255, 255, 255, 90), width=2)

    if not logo_path or not Path(logo_path).exists():
        font = load_font(28, bold=True)
        text_w, text_h = text_size(draw, initials[:2], font)
        draw.text((x + ((size - text_w) // 2), y + ((size - text_h) // 2) - 2), initials[:2], fill=(18, 68, 54, 255), font=font)


def draw_chip(draw: ImageDraw.ImageDraw, x: int, y: int, w: int, h: int, label: str, value: str, accent):
    rounded_rectangle(draw, (x, y, x + w, y + h), 22, (255, 255, 255, 235))
    draw.rounded_rectangle((x + 18, y + 18, x + 34, y + 34), radius=8, fill=accent)

    label_font = load_font(17, bold=True)
    value_font = load_font(22, bold=True)
    draw.text((x + 48, y + 15), label, font=label_font, fill=(71, 85, 105, 255))
    draw.text((x + 22, y + 46), value, font=value_font, fill=(15, 23, 42, 255))


def main():
    if len(sys.argv) != 3:
        print("Usage: render_share_image.py <payload.json> <output.png>", file=sys.stderr)
        sys.exit(1)

    payload_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    payload = json.loads(payload_path.read_text(encoding="utf-8"))

    image = Image.new("RGBA", (WIDTH, HEIGHT), (3, 15, 33, 255))
    draw = ImageDraw.Draw(image)

    draw_vertical_gradient(image, (0, 0, WIDTH, HEIGHT), (4, 20, 43, 255), (7, 37, 74, 255))
    draw_radial_glow(image, (180, 120), 210, (34, 197, 94, 60))
    draw_radial_glow(image, (1090, 92), 180, (56, 189, 248, 52))
    draw_radial_glow(image, (940, 540), 220, (34, 197, 94, 34))

    rounded_rectangle(draw, (40, 40, 1160, 590), 34, (255, 255, 255, 16), outline=(255, 255, 255, 24), width=1)
    rounded_rectangle(draw, (60, 60, 1140, 570), 30, (255, 255, 255, 235))

    draw_vertical_gradient(image, (770, 60, 1140, 570), (16, 185, 129, 255), (17, 94, 89, 255))
    rounded_rectangle(draw, (770, 60, 1140, 570), 30, (0, 0, 0, 0), outline=(255, 255, 255, 28), width=1)

    rounded_rectangle(draw, (98, 98, 248, 136), 19, (220, 252, 231, 255))
    draw.text((122, 109), "VACANTE ACTIVA", font=load_font(16, bold=True), fill=(22, 101, 52, 255))

    draw_logo_circle(
        image,
        draw,
        payload.get("logoFilePath"),
        payload.get("companyInitials", "FT"),
        98,
        160,
        78,
    )

    company_font = load_font(30, bold=True)
    company_lines = payload.get("companyLines") or [payload.get("companyInitials", "FarmaTalent")]
    company_lines = company_lines[:2]
    draw.text((196, 168), "Botica", font=load_font(16, bold=True), fill=(22, 101, 52, 255))
    draw_text_block(draw, company_lines, 196, 194, 34, company_font, (15, 23, 42, 255))

    role_font = load_font(19)
    draw.text((98, 284), payload.get("professionalType", ""), font=role_font, fill=(71, 85, 105, 255))

    title_font = load_font(56, bold=True)
    title_lines = wrap_for_width(
        draw,
        " ".join(payload.get("titleLines") or []),
        title_font,
        620,
        3,
    )
    draw_text_block(draw, title_lines, 98, 318, 62, title_font, (15, 23, 42, 255))

    info_font = load_font(22)
    tagline = payload.get("tagline", "Postula gratis en FarmaTalent")
    tagline_lines = wrap_for_width(draw, tagline, info_font, 620, 2)
    draw_text_block(draw, tagline_lines, 98, 518, 28, info_font, (71, 85, 105, 255))

    rounded_rectangle(draw, (98, 455, 360, 505), 25, (15, 118, 110, 255))
    draw.text((126, 470), "Comparte y postula en FarmaTalent", font=load_font(20, bold=True), fill=(255, 255, 255, 255))

    right_title_font = load_font(16, bold=True)
    right_value_font = load_font(30, bold=True)
    right_small_font = load_font(20)

    draw.text((804, 112), "DETALLES DEL TURNO", font=right_title_font, fill=(209, 250, 229, 255))
    right_company = fit_line(draw, " ".join(company_lines), load_font(34, bold=True), 300)
    draw.text((804, 152), right_company, font=load_font(34, bold=True), fill=(255, 255, 255, 255))

    location_lines = wrap_for_width(draw, payload.get("location", ""), right_small_font, 300, 3)
    rounded_rectangle(draw, (804, 222, 1106, 348), 24, (255, 255, 255, 28))
    draw.text((828, 246), "Ubicacion", font=load_font(18, bold=True), fill=(209, 250, 229, 255))
    draw_text_block(draw, location_lines, 828, 278, 28, right_small_font, (255, 255, 255, 255))

    rounded_rectangle(draw, (804, 372, 946, 472), 24, (255, 255, 255, 28))
    draw.text((828, 395), "Horario", font=load_font(17, bold=True), fill=(209, 250, 229, 255))
    draw.text((828, 425), fit_line(draw, payload.get("schedule", ""), right_value_font, 96), font=right_value_font, fill=(255, 255, 255, 255))

    rounded_rectangle(draw, (964, 372, 1106, 472), 24, (255, 255, 255, 28))
    draw.text((988, 395), "Fecha", font=load_font(17, bold=True), fill=(209, 250, 229, 255))
    draw.text((988, 425), fit_line(draw, payload.get("date", ""), load_font(22, bold=True), 94), font=load_font(22, bold=True), fill=(255, 255, 255, 255))

    rounded_rectangle(draw, (804, 496, 1106, 540), 22, (6, 78, 59, 130))
    draw.text((828, 511), "Encuentra personal de salud por turnos", font=load_font(18, bold=True), fill=(220, 252, 231, 255))

    chip_location = fit_line(draw, payload.get("location", ""), load_font(22, bold=True), 316)
    chip_schedule = fit_line(draw, payload.get("schedule", ""), load_font(22, bold=True), 196)
    chip_date = fit_line(draw, payload.get("date", ""), load_font(22, bold=True), 196)

    draw_chip(draw, 98, 570 - 92, 340, 92, "Ubicacion", chip_location, (16, 185, 129, 255))
    draw_chip(draw, 454, 570 - 92, 220, 92, "Horario", chip_schedule, (59, 130, 246, 255))
    draw_chip(draw, 690, 570 - 92, 220, 92, "Fecha", chip_date, (245, 158, 11, 255))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(output_path, format="PNG")


if __name__ == "__main__":
    main()
