#!/usr/bin/env python3
"""
social_export.py — Generează conținut Instagram + TikTok din articolele ClarStiri.

Workflow:
    # Top 5 știri de azi de pe site-ul live
    python social_export.py --top 5

    # URL-uri specifice
    python social_export.py --urls "https://www.thesite.ro/stire/story-20260321-abc123"

    # Dev local
    python social_export.py --top 3 --base-url http://localhost:5173

Output:
    social_export/YYYY-MM-DD/
        1_titlu-scurt/
            instagram.png    (1080×1350)
            tiktok.png       (1080×1920)
            captions.txt
        captions_all.txt     (toate captionurile la un loc)
"""

import asyncio
import sys
import re
import os
import json
import argparse
import textwrap
import urllib.request
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict

try:
    from PIL import Image, ImageDraw, ImageFont
    import io
except ImportError:
    print("EROARE: Instalează dependențele: pip install pillow playwright requests")
    sys.exit(1)

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("EROARE: pip install playwright && playwright install chromium")
    sys.exit(1)


# ─── Constante vizuale ────────────────────────────────────────────────────────

IG_W, IG_H       = 1080, 1350   # Instagram portrait 4:5
TT_W, TT_H       = 1080, 1920   # TikTok 9:16
SCALE            = 2             # retina render
CARD_MARGIN      = 44            # padding stânga-dreapta pe canvas

BG_COLOR         = (240, 238, 230)   # Cream
DOT_COLOR        = (0, 0, 0, 22)
DOT_SPACING      = 24
DOT_RADIUS       = 1

BRAND_TEXT       = "thesite.ro"
BRAND_COLOR      = (30, 30, 30)
BRAND_BG         = (240, 238, 230, 230)

OUTPUT_DIR       = Path(__file__).parent / "social_export"
GROQ_API_URL     = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL       = "llama-3.3-70b-versatile"

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)


# ─── Helpers imagine ──────────────────────────────────────────────────────────

def make_dotted_canvas(w: int, h: int) -> Image.Image:
    canvas = Image.new("RGBA", (w, h), BG_COLOR + (255,))
    draw = ImageDraw.Draw(canvas)
    for x in range(0, w, DOT_SPACING):
        for y in range(0, h, DOT_SPACING):
            draw.ellipse(
                [x - DOT_RADIUS, y - DOT_RADIUS, x + DOT_RADIUS, y + DOT_RADIUS],
                fill=DOT_COLOR,
            )
    return canvas


def get_font(size: int, bold: bool = False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Arial.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


LOGO_PATH = Path(__file__).parent / "public" / "logo_minimal.png"
BRAND_FONT = Path(__file__).parent / "public" / "fonts" / "PlayfairDisplay-Italic.ttf"

# Pill design: cream solid background, dark logo + text, top-right
PILL_BG        = (240, 239, 230, 240)    # Cream, quasi-opac
PILL_TEXT      = (25, 25, 25)            # Negru
PILL_PAD_X     = 24                # padding orizontal
PILL_PAD_Y     = 10                # padding vertical
PILL_GAP       = 12                # spatiu intre logo si text
PILL_MARGIN    = 40                # distanta de la extremitatile imaginii
LOGO_HEIGHT    = 48                # inaltimea setata pentru logo (in pixeli)


def _load_logo_dark(height: int) -> Optional[Image.Image]:
    """Încarcă logo-ul minimal transparent și îl colorează cu PILL_TEXT."""
    if not LOGO_PATH.exists():
        return None
    try:
        logo = Image.open(LOGO_PATH).convert("RGBA")
        scale = height / logo.height
        logo = logo.resize((int(logo.width * scale), height), Image.LANCZOS)
        # Preia canalul alpha original, setand RGB la PILL_TEXT
        r, g, b, a = logo.split()
        r = r.point(lambda p: PILL_TEXT[0])
        g = g.point(lambda p: PILL_TEXT[1])
        b = b.point(lambda p: PILL_TEXT[2])
        return Image.merge("RGBA", (r, g, b, a))
    except Exception:
        return None


def _scale_to_width(card: Image.Image, target_w: int) -> Image.Image:
    scale = target_w / card.width
    new_h = int(card.height * scale)
    return card.resize((target_w, new_h), Image.LANCZOS)


def _add_brand_tag(card: Image.Image) -> Image.Image:
    """Pill top-right: [logo] thesite.ro — pe fundal cream luminos."""
    canvas = card.copy().convert("RGBA")
    draw = ImageDraw.Draw(canvas)
    w, h = canvas.size
    try:
        font = ImageFont.truetype(str(BRAND_FONT), 48)
    except:
        font = get_font(38, bold=True)
    
    bbox = draw.textbbox((0, 0), BRAND_TEXT, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

    logo = _load_logo_dark(LOGO_HEIGHT)
    lw = logo.width if logo else 0

    # Dimensiuni pill
    inner_w = (lw + PILL_GAP if logo else 0) + tw
    pill_w = inner_w + PILL_PAD_X * 2
    pill_h = max(LOGO_HEIGHT, th) + PILL_PAD_Y * 2

    # Poziție top-right
    px = w - pill_w - PILL_MARGIN
    py = PILL_MARGIN

    # Desenează pill pe un layer separat (pentru transparență)
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ov_draw = ImageDraw.Draw(overlay)
    ov_draw.rounded_rectangle(
        [px, py, px + pill_w, py + pill_h],
        radius=pill_h // 2,
        fill=PILL_BG,
    )
    canvas = Image.alpha_composite(canvas, overlay)

    # Logo
    cx = px + PILL_PAD_X
    cy = py + (pill_h - LOGO_HEIGHT) // 2
    if logo:
        canvas.paste(logo, (cx, cy), logo)
        cx += lw + PILL_GAP

    # Text
    draw2 = ImageDraw.Draw(canvas)
    ty = py + (pill_h - th) // 2 - bbox[1]
    draw2.text((cx, ty), BRAND_TEXT, font=font, fill=PILL_TEXT)

    return canvas


def build_instagram(card_bytes: bytes) -> bytes:
    """Scalează cardul la 1080px lățime (aspect ratio nativ)."""
    card = Image.open(io.BytesIO(card_bytes)).convert("RGBA")
    card = _scale_to_width(card, IG_W)
    card = _add_brand_tag(card)
    out = io.BytesIO()
    card.convert("RGB").save(out, format="PNG", optimize=True)
    return out.getvalue()


def build_tiktok(card_bytes: bytes) -> bytes:
    """Scalează cardul la 1080px lățime, centrat pe canvas negru 9:16."""
    card = Image.open(io.BytesIO(card_bytes)).convert("RGBA")
    card = _scale_to_width(card, TT_W)
    # Dacă cardul e mai scurt decât 9:16, adaugă padding negru sus/jos
    if card.height < TT_H:
        canvas = Image.new("RGB", (TT_W, TT_H), (10, 10, 10))
        y_off = (TT_H - card.height) // 2
        canvas.paste(card.convert("RGB"), (0, y_off))
        card = canvas.convert("RGBA")
    else:
        card = card.crop((0, 0, TT_W, TT_H))
    card = _add_brand_tag(card)
    out = io.BytesIO()
    card.convert("RGB").save(out, format="PNG", optimize=True)
    return out.getvalue()


# ─── Caption generation ───────────────────────────────────────────────────────

def load_groq_key() -> Optional[str]:
    key = os.environ.get("GROQ_API_KEY")
    if key:
        return key
    env_path = Path(__file__).parent / ".env.local"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("GROQ_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def call_groq(prompt: str, groq_key: str) -> Optional[str]:
    import urllib.request, json as _json
    body = _json.dumps({
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 400,
    }).encode()
    req = urllib.request.Request(
        GROQ_API_URL,
        data=body,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {groq_key}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = _json.loads(resp.read())
            return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"  ⚠ Groq call failed: {e}")
        return None


def generate_captions(story: dict, groq_key: Optional[str]) -> dict:
    title = story.get("title", "")
    sources_count = story.get("sourcesCount", 0)
    bias = story.get("bias", {})
    category = story.get("mainCategory", "Actualitate")

    left_pct  = bias.get("left", 0)
    center_pct = bias.get("center", 0)
    right_pct = bias.get("right", 0)

    bias_summary_parts = []
    if left_pct > 5:  bias_summary_parts.append(f"Stânga {left_pct}%")
    if center_pct > 5: bias_summary_parts.append(f"Centru {center_pct}%")
    if right_pct > 5:  bias_summary_parts.append(f"Dreapta {right_pct}%")
    bias_summary = " · ".join(bias_summary_parts) if bias_summary_parts else "acoperire neutră"

    if not groq_key:
        # Fallback static captions
        ig = (
            f"🔍 {title}\n\n"
            f"{sources_count} surse acoperă această știre — din perspective diferite.\n"
            f"Distribuție: {bias_summary}\n\n"
            f"Pe thesite.ro vezi aceleași știri din toate unghiurile politice "
            f"ca să decizi tu ce să crezi.\n\n"
            f"🔗 Link în bio\n"
            f"#știri #Romania #presă #bias #actualitate #thesite"
        )
        tt = (
            f"Știi cum îți filtrează presa informația? 👁️\n\n"
            f"Această știre a fost preluată de {sources_count} surse "
            f"cu perspective diferite ({bias_summary}).\n\n"
            f"Caută pe thesite.ro și vezi tu singur 👇\n\n"
            f"#știri #Romania #presăromână #bias #thesite"
        )
        return {"instagram": ig, "tiktok": tt}

    ig_prompt = f"""Ești un social media manager pentru thesite.ro, un site românesc de agregare știri care arată distribuția bias-ului politic (stânga/centru/dreapta) al surselor care acoperă aceeași știre.

Scrie un caption Instagram în română pentru postarea unui screenshot cu această știre:
- Titlu: {title}
- Categorie: {category}
- Surse: {sources_count} publicații
- Distribuție bias: {bias_summary}

Cerințe caption Instagram:
1. Începe cu un emoji relevant și titlul știrii (scurt, 1 propoziție)
2. 2-3 propoziții care explică valoarea: cititorii văd aceeași știre din perspectivele tuturor surselor
3. CTA: "Link în bio → thesite.ro"
4. 5-8 hashtag-uri relevante în română (#știri #Romania #presă #bias #actualitate #thesite)
5. Ton: inteligent, direct, fără clickbait
6. Max 200 cuvinte total

Returnează DOAR captionul, fără explicații."""

    tt_prompt = f"""Ești un social media manager pentru thesite.ro, un site românesc de agregare știri cu detecție de bias politic.

Scrie un caption TikTok în română pentru un video/imagine cu această știre:
- Titlu: {title}
- Surse: {sources_count} publicații
- Distribuție bias: {bias_summary}

Cerințe caption TikTok:
1. Prima linie: hook scurt, provocator sau o întrebare retorică (max 10 cuvinte)
2. 2-3 propoziții scurte, casual, Gen Z-friendly care explică fenomenul bias-ului mediatic
3. CTA: "thesite.ro în bio 👆"
4. 4-6 hashtag-uri (#știri #Romania #pressromana #bias #thesite)
5. Ton: casual, direct, puțin sceptic față de presă — fără a fi conspiraționist
6. Max 150 cuvinte

Returnează DOAR captionul, fără explicații."""

    ig_caption = call_groq(ig_prompt, groq_key)
    tt_caption = call_groq(tt_prompt, groq_key)

    return {
        "instagram": ig_caption or f"🔍 {title}\n{sources_count} surse · {bias_summary}\nthesite.ro #știri #Romania",
        "tiktok": tt_caption or f"De ce vede presa diferit?\n\n{sources_count} surse · {bias_summary}\nthesite.ro în bio 👆\n#știri #Romania",
    }


# ─── Fetch stories from API ───────────────────────────────────────────────────

def fetch_top_stories(base_url: str, limit: int) -> List[Dict]:
    api_url = f"{base_url.rstrip('/')}/api/news?limit={limit}"
    print(f"Fetching stories from {api_url}...")
    try:
        req = urllib.request.Request(api_url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read())
            stories = data.get("data", [])
            print(f"  ✓ {len(stories)} stories fetched.")
            return stories[:limit]
    except Exception as e:
        print(f"  ✗ API fetch failed: {e}")
        return []


def story_url_from_id(story: dict, base_url: str) -> str:
    sid = story.get("id", "")
    title = story.get("title", "")
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower())[:60].strip("-")
    return f"{base_url.rstrip('/')}/stire/{sid}/{slug}"


# ─── Playwright screenshot ────────────────────────────────────────────────────

async def screenshot_story_card(page, story_id: str) -> Optional[bytes]:
    selector = f"article[data-story-id='{story_id}']"
    for attempt in range(20):
        count = await page.locator(selector).count()
        if count > 0:
            card = page.locator(selector).first
            await card.scroll_into_view_if_needed()
            await asyncio.sleep(1.0)
            return await card.screenshot()
        await page.evaluate("window.scrollBy(0, 800)")
        await asyncio.sleep(0.5)
    print(f"  ✗ Card not found after scrolling: {story_id}")
    return None


# ─── Main workflow ────────────────────────────────────────────────────────────

async def run(stories: List[Dict], base_url: str, groq_key: Optional[str], date_str: str):
    out_root = OUTPUT_DIR / date_str
    out_root.mkdir(parents=True, exist_ok=True)

    all_captions = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=SCALE,
            user_agent=USER_AGENT,
        )
        page = await context.new_page()

        print(f"\nLoading {base_url} ...")
        await page.goto(base_url, wait_until="networkidle", timeout=60000)
        await asyncio.sleep(4)

        # Elimină border-radius doar în sesiunea headless — site-ul live rămâne neschimbat
        await page.add_style_tag(content="""
            article[data-story-id],
            article[data-story-id] * { border-radius: 0 !important; }
        """)

        for idx, story in enumerate(stories, 1):
            story_id = story.get("id", f"story-{idx}")
            title = story.get("title", f"Știre {idx}")
            slug = re.sub(r"[^a-z0-9]+", "-", title.lower())[:30].strip("-")
            folder_name = f"{idx:02d}_{slug}"
            story_dir = out_root / folder_name
            story_dir.mkdir(exist_ok=True)

            print(f"\n[{idx}/{len(stories)}] {title[:60]}...")

            # Screenshot card
            card_bytes = await screenshot_story_card(page, story_id)
            if not card_bytes:
                print(f"  ✗ Card not found: {story_id}")
                continue

            # Build images
            ig_bytes = build_instagram(card_bytes)
            tt_bytes = build_tiktok(card_bytes)
            (story_dir / "instagram.png").write_bytes(ig_bytes)
            (story_dir / "tiktok.png").write_bytes(tt_bytes)
            print(f"  ✓ instagram.png + tiktok.png")

            # Generate captions
            captions = generate_captions(story, groq_key)
            caption_txt = (
                f"{'='*60}\n"
                f"TITLU: {title}\n"
                f"URL: {story_url_from_id(story, base_url)}\n"
                f"{'='*60}\n\n"
                f"── INSTAGRAM ──\n{captions['instagram']}\n\n"
                f"── TIKTOK ──\n{captions['tiktok']}\n\n"
            )
            (story_dir / "captions.txt").write_text(caption_txt, encoding="utf-8")
            all_captions.append(caption_txt)
            print(f"  ✓ captions.txt")

        await browser.close()

    # Fișier agregat cu toate captionurile
    all_captions_path = out_root / "captions_all.txt"
    all_captions_path.write_text(
        f"ClarStiri Social Export — {date_str}\n\n" + "\n".join(all_captions),
        encoding="utf-8",
    )
    print(f"\n{'─'*60}")
    print(f"✅ Export complet: {out_root}")
    print(f"   captions_all.txt → toate captionurile la un loc")
    print(f"{'─'*60}\n")


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Generează imagini Instagram + TikTok și caption-uri din ClarStiri.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--top", type=int, default=5,
                        help="Top N știri de pe site (default: 5)")
    parser.add_argument("--urls", nargs="+", metavar="URL",
                        help="URL-uri specifice de știri (înlocuiește --top)")
    parser.add_argument("--base-url", default="https://www.thesite.ro",
                        help="URL-ul site-ului (default: https://www.thesite.ro)")
    parser.add_argument("--no-captions", action="store_true",
                        help="Sari peste generarea caption-urilor (mai rapid)")
    args = parser.parse_args()

    date_str = datetime.now().strftime("%Y-%m-%d")
    groq_key = None if args.no_captions else load_groq_key()
    if groq_key:
        print(f"✓ GROQ_API_KEY găsit — caption-urile vor fi generate cu AI")
    else:
        print("⚠ GROQ_API_KEY negăsit — se folosesc caption-uri statice")

    if args.urls:
        # Construim obiecte story minimale din URL-uri
        stories = []
        for url in args.urls:
            m = re.search(r"(story-[a-z0-9-]+)", url)
            sid = m.group(1) if m else f"story-{len(stories)+1}"
            stories.append({"id": sid, "title": sid, "sourcesCount": 0,
                            "bias": {}, "mainCategory": "Actualitate"})
        base_url = args.base_url
    else:
        stories = fetch_top_stories(args.base_url, args.top)
        base_url = args.base_url
        if not stories:
            print("Nicio știre găsită. Verifică --base-url sau conexiunea.")
            sys.exit(1)

    asyncio.run(run(stories, base_url, groq_key, date_str))


if __name__ == "__main__":
    main()
