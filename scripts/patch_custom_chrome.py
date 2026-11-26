#!/usr/bin/env python3
"""Add custom navigationStyle and xy-navbar to business pages."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES_JSON = ROOT / "pages.json"
PAGES_DIR = ROOT / "pages"

BUSINESS_PATHS = [
    "pages/mall/index",
    "pages/otherBusiness/index",
    "pages/personalCenter/index",
    "pages/personalCenter/personInfo/index",
    "pages/personalCenter/identity/index",
    "pages/personalCenter/personAgreement/index",
    "pages/personalCenter/share/index",
    "pages/personalCenter/businessInfo/index",
    "pages/personalCenter/businessAgreement/index",
    "pages/personalCenter/contactService/index",
    "pages/personalCenter/blacklist/index",
    "pages/personalCenter/customerlist/index",
    "pages/personalCenter/customerRecharge/index",
    "pages/personalCenter/otherBusinessSetting/index",
    "pages/personalCenter/otherBusinessSetting/form/index",
    "pages/personalCenter/businessStatus/index",
    "pages/personalCenter/storeProfile/index",
    "pages/personalCenter/contract/index",
    "pages/personalCenter/contract/detail",
    "pages/personalCenter/finance/index",
    "pages/personalCenter/monthlyReport/index",
    "pages/personalCenter/storeOrder/index",
    "pages/personalCenter/pending/index",
    "pages/personalCenter/verify/index",
    "pages/personalCenter/cancel/index",
    "pages/personalCenter/complete/index",
    "pages/personalCenter/finished/index",
    "pages/personalCenter/transfer/index",
    "pages/personalCenter/transferAgreement/index",
    "pages/mall/checkout/index",
    "pages/mall/productDetail/index",
    "pages/mall/cart/index",
    "pages/mall/detail",
    "pages/mall/coupon/index",
    "pages/personalCenter/recharge/index",
    "pages/personalCenter/storeRecharge/index",
    "pages/join/index",
    "pages/join/apply/index",
]


def inject_pages_json() -> None:
    text = PAGES_JSON.read_text(encoding="utf-8")
    changed = False
    for path in BUSINESS_PATHS:
        token = f'"path": "{path if not path.startswith("pages/join/") else path.split("/", 2)[-1]}"'
        # join subpackage uses short path
        if path.startswith("pages/join/"):
            short = path[len("pages/join/") :]
            needle = f'"path": "{short}"'
        else:
            needle = f'"path": "{path}"'
        idx = 0
        while True:
            hit = text.find(needle, idx)
            if hit < 0:
                break
            style_at = text.find('"style"', hit, hit + 180)
            brace = text.find("{", style_at) if style_at > 0 else -1
            if brace > 0:
                window = text[brace : brace + 220]
                if '"navigationStyle"' not in window:
                    text = text[: brace + 1] + '\n\t\t\t\t"navigationStyle": "custom",' + text[brace + 1 :]
                    changed = True
                    idx = brace + 40
                    continue
            idx = hit + len(needle)
    if changed:
        PAGES_JSON.write_text(text, encoding="utf-8")
        print("updated pages.json")
    else:
        print("pages.json already patched or no match")


def vue_path(route: str) -> Path:
    p = ROOT / f"{route}.vue"
    if p.exists():
        return p
    return ROOT / f"{route}/index.vue"


def insert_navbar(path: Path, extra: str = "") -> bool:
    text = path.read_text(encoding="utf-8")
    if "<xy-navbar" in text:
        return False
    start = text.find("<template>")
    if start < 0:
        return False
    body = text[start:]
    view_at = body.find("<view")
    if view_at < 0:
        return False
    gt = body.find(">", view_at)
    if gt < 0:
        return False
    abs_gt = start + gt
    indent = "\n\t\t"
    snippet = f"{indent}<xy-navbar{extra} />"
    path.write_text(text[: abs_gt + 1] + snippet + text[abs_gt + 1 :], encoding="utf-8")
    return True


def inject_navbars() -> None:
    extras = {
        "pages/personalCenter/pending/index": ' :title="navTitle"',
        "pages/personalCenter/otherBusinessSetting/form/index": ' :title="navTitle"',
    }
    count = 0
    for route in BUSINESS_PATHS:
        file = vue_path(route)
        if not file.exists():
            print("missing", route)
            continue
        extra = extras.get(route, "")
        if insert_navbar(file, extra):
            count += 1
            print("navbar", file.relative_to(ROOT))
    print(f"inserted {count} navbars")


if __name__ == "__main__":
    inject_pages_json()
    inject_navbars()
