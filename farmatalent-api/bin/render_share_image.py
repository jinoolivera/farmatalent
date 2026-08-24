import json
import math
import os
import sys
from io import BytesIO
from pathlib import Path
from typing import List

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


def rounded_rectangle(draw: ImageDraw.ImageDraw, box, radius, fill):
    draw.rounded_rectangle(box, radius=radius, fill=fill)


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


def draw_logo_circle(base: Image.Image, logo_path: str | None, initials: str):
    circle_x, circle_y, circle_size = 76, 74, 86
    mask = Image.new("L", (circle_size, circle_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse((1, 1, circle_size - 1, circle_size - 1), fill=255)

    bg = Image.new("RGBA", (circle_size, circle_size), (248, 250, 252, 32))
    border = ImageDraw.Draw(bg)
    border.ellipse((0, 0, circle_size - 1, circle_size - 1), outline=(255, 255, 255, 60), width=1)

    if logo_path and Path(logo_path).exists():
        try:
            logo = Image.open(logo_path).convert("RGBA")
            logo.thumbnail((circle_size - 10, circle_size - 10))
            layer = Image.new("RGBA", (circle_size, circle_size), (0, 0, 0, 0))
            logo_x = (circle_size - logo.width) // 2
            logo_y = (circle_size - logo.height) // 2
            layer.alpha_composite(logo, (logo_x, logo_y))
            bg.alpha_composite(layer)
        except Exception:
            pass

    base.paste(bg, (circle_x, circle_y), mask)

    if not logo_path or not Path(logo_path).exists():
        draw = ImageDraw.Draw(base)
        font = load_font(28, bold=True)
        draw.text((118, 102), initials[:2], fill=(255, 255, 255, 255), font=font)


def draw_text_lines(draw, lines: List[str], x: int, y: int, step: int, font, fill):
    for index, line in enumerate(lines):
        draw.text((x, y + (index * step)), line, font=font, fill=fill)


def main():
    if len(sys.argv) != 3:
        print("Usage: render_share_image.py <payload.json> <output.png>", file=sys.stderr)
        sys.exit(1)

    payload_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    payload = json.loads(payload_path.read_text(encoding="utf-8"))

    image = Image.new("RGBA", (WIDTH, HEIGHT), (6, 18, 42, 255))
    draw = ImageDraw.Draw(image)

    draw_vertical_gradient(image, (0, 0, WIDTH, HEIGHT), (6, 18, 42, 255), (16, 41, 77, 255))
    draw_radial_glow(image, (180, 580), 250, (34, 197, 94, 70))
    draw_radial_glow(image, (1040, 40), 220, (147, 197, 253, 46))

    rounded_rectangle(draw, (690, 110, 1120, 520), 30, (255, 255, 255, 18))
    draw_vertical_gradient(image, (705, 128, 1105, 502), (26, 139, 87, 255), (15, 81, 50, 255))
    rounded_rectangle(draw, (725, 150, 1085, 290), 22, (6, 18, 42, 72))
    rounded_rectangle(draw, (725, 310, 1085, 398), 20, (255, 255, 255, 20))
    rounded_rectangle(draw, (725, 414, 1085, 474), 18, (255, 255, 255, 26))

    rounded_rectangle(draw, (76, 444, 310, 510), 33, (255, 255, 255, 255))
    draw_logo_circle(image, payload.get("logoFilePath"), payload.get("companyInitials", "FT"))

    font_badge = load_font(14, bold=True)
    font_company = load_font(30, bold=True)
    font_type = load_font(18)
    font_title = load_font(62, bold=True)
    font_tagline = load_font(22)
    font_cta = load_font(24, bold=True)
    font_panel_label = load_font(15, bold=True)
    font_panel_small = load_font(17)
    font_panel_value = load_font(28, bold=True)
    font_footer = load_font(20)

    draw.text((220, 92), "VACANTE ACTIVA", font=font_badge, fill=(126, 226, 168, 255))
    draw_text_lines(draw, payload["companyLines"], 220, 116, 30, font_company, (255, 255, 255, 255))
    draw.text((220, 164), payload["professionalType"], font=font_type, fill=(255, 255, 255, 188))
    draw_text_lines(draw, payload["titleLines"], 76, 210, 72, font_title, (255, 255, 255, 255))
    draw.text((76, 388), payload["tagline"], font=font_tagline, fill=(255, 255, 255, 188))
    draw.text((112, 462), "Postula ahora", font=font_cta, fill=(6, 18, 42, 255))

    draw.text((728, 186), "DETALLE DEL TURNO", font=font_panel_label, fill=(255, 255, 255, 158))
    draw.text((728, 222), "Ubicacion", font=font_type, fill=(255, 255, 255, 255))
    draw.text((728, 255), payload["location"], font=font_panel_value, fill=(255, 255, 255, 255))
    draw.text((728, 346), "Horario", font=font_panel_small, fill=(255, 255, 255, 188))
    draw.text((728, 377), payload["schedule"], font=load_font(30, bold=True), fill=(255, 255, 255, 255))
    draw.text((728, 449), "Fecha", font=font_panel_small, fill=(255, 255, 255, 188))
    draw.text((728, 480), payload["date"], font=load_font(26, bold=True), fill=(255, 255, 255, 255))
    draw.text((76, 580), "FarmaTalent · conecta boticas y profesionales con postulacion rapida", font=font_footer, fill=(255, 255, 255, 142))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(output_path, format="PNG")


if __name__ == "__main__":
    main()
