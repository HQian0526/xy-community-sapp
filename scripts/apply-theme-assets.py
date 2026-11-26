#!/usr/bin/env python3
"""Recolor tab icons and replace hardcoded brand color in business pages."""
from __future__ import annotations

import colorsys
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC_ICON_DIR = ROOT / "static" / "tarbar"
OUT_ICON_DIR = SRC_ICON_DIR / "themes"
SKIP_DIRS = {"uni_modules", "platforms", "unpackage", "node_modules", "scripts"}

THEMES = {
    "teal": (0, 168, 150),
    "orange": (230, 126, 34),
    "apricot": (224, 122, 61),
    "red": (201, 76, 76),
    "blue": (47, 125, 209),
    "coffee": (122, 92, 74),
}
ACTIVE_FILES = [
    "tarbar1-active.png",
    "tarbar2-active.png",
    "tarbar3-active.png",
    "tarbar4-active.png",
]
SRC_RGB = (0 / 255, 168 / 255, 150 / 255)
SRC_H, SRC_S, SRC_V = colorsys.rgb_to_hsv(*SRC_RGB)

ROOT_STYLE_ATTR = ':style="themeCssVars"'


def hue_dist(a: float, b: float) -> float:
    return min(abs(a - b), 1 - abs(a - b))


def recolor_image(src: Path, dest: Path, target: tuple[int, int, int]) -> None:
    from PIL import Image

    img = Image.open(src).convert("RGBA")
    pixels = img.load()
    w, h = img.size
    tr, tg, tb = (c / 255 for c in target)
    tgt_h, tgt_s, tgt_v = colorsys.rgb_to_hsv(tr, tg, tb)
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            hn, sn, vn = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if sn < 0.12 or vn < 0.12:
                continue
            if hue_dist(hn, SRC_H) > 0.14:
                continue
            sat_scale = tgt_s / SRC_S if SRC_S else 1
            nn = colorsys.hsv_to_rgb(tgt_h, min(1.0, sn * sat_scale), vn)
            pixels[x, y] = (
                int(nn[0] * 255),
                int(nn[1] * 255),
                int(nn[2] * 255),
                a,
            )
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest)


def build_icons() -> None:
    for code, rgb in THEMES.items():
        for name in ACTIVE_FILES:
            src = SRC_ICON_DIR / name
            dest = OUT_ICON_DIR / code / name
            recolor_image(src, dest, rgb)


def should_skip(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)


def patch_root_style(text: str) -> str:
    if ROOT_STYLE_ATTR in text or "themeCssVars" in text:
        return text
    match = re.search(r"(<template>\s*)(<view\b)([^>]*)(>)", text, re.S)
    if not match:
        return text
    attrs = match.group(3)
    if re.search(r'(^|\s):style=', attrs):
        attrs = re.sub(
            r':style="([^"]*)"',
            r':style="[themeCssVars, \1]"',
            attrs,
            count=1,
        )
    else:
        attrs = attrs.rstrip() + f' {ROOT_STYLE_ATTR}'
    return text[: match.start()] + match.group(1) + match.group(2) + attrs + match.group(4) + text[match.end() :]


def patch_colors(text: str) -> str:
    text = text.replace("$primary: #00a896;", "$primary: var(--xy-primary, #00a896);")
    text = text.replace("$primary: #00a896", "$primary: var(--xy-primary, #00a896)")

    def repl_attr(match: re.Match) -> str:
        name = match.group(1)
        bind = name if name.startswith(":") else f":{name}"
        camel = bind
        # uni-app accepts :activeColor and :active-color
        return f'{camel}="themePrimary"'

    text = re.sub(
        r'(?<!:)(color|activeColor|active-color|bgColor|bg-color|indicator-active-color|confirmColor)="#00a896"',
        repl_attr,
        text,
    )
    text = text.replace("confirmColor: '#00a896'", "confirmColor: this.themePrimary")
    text = text.replace('confirmColor: "#00a896"', "confirmColor: this.themePrimary")
    text = text.replace("color: '#00a896'", "color: this.themePrimary")
    # remaining hex in styles / objects, keep a fallback inside var()
    text = re.sub(r"(?<!var\(--xy-primary, )#00a896", "var(--xy-primary, #00a896)", text)
    return text


def patch_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    updated = original
    if path.suffix == ".vue":
        updated = patch_root_style(updated)
    updated = patch_colors(updated)
    if updated != original:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def patch_sources() -> list[str]:
    changed = []
    targets = [
        ROOT / "pages" / "mall",
        ROOT / "pages" / "personalCenter",
        ROOT / "pages" / "otherBusiness",
        ROOT / "pages" / "join",
        ROOT / "components" / "bind-phone-popup",
        ROOT / "common" / "style" / "global.scss",
        ROOT / "common" / "share",
    ]
    files: list[Path] = []
    for base in targets:
        if base.is_file():
            files.append(base)
            continue
        if not base.exists():
            continue
        files.extend(path for path in base.rglob("*") if path.is_file())
    for path in files:
        if should_skip(path):
            continue
        if path.suffix not in {".vue", ".js", ".scss"}:
            continue
        if path.name in {"theme.js", "themeMixin.js"}:
            continue
        if patch_file(path):
            changed.append(str(path.relative_to(ROOT)))
    return changed


def main() -> None:
    build_icons()
    changed = patch_sources()
    print(f"icons ok, patched {len(changed)} files")
    for name in changed:
        print(name)


if __name__ == "__main__":
    main()
