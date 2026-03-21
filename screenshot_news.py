#!/usr/bin/env python3
"""
screenshot_news.py — Capture news cards from ClarStiri as 1080x1350 Instagram portraits.

Usage:
    python screenshot_news.py [optional-story-url-or-id] [--base-url=http://localhost:8080]

The script finds matching article cards on the specified page and screenshots them.
Output saved to ./screenshots/
"""

import asyncio
import sys
import re
import argparse
from pathlib import Path
from datetime import datetime
from PIL import Image, ImageDraw
import io

from playwright.async_api import async_playwright

OUTPUT_W = 1080
OUTPUT_H = 1350
SCALE = 2  # retina render
SCREENSHOTS_DIR = Path(__file__).parent / "screenshots"

# Aesthetics
BG_COLOR = (240, 238, 230)  # Cream #F0EEE6
DOT_COLOR = (0, 0, 0, 20)     # 10% opacity black approx
DOT_SPACING = 24
DOT_RADIUS = 1

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)


def extract_story_id(url: str):
    """Pull story ID like 'story-20260318-62s6kx' or 'demo-home-1' from a URL."""
    if not url:
        return None
    # Match story-xxx or demo-home-x
    m = re.search(r"(story-[a-z0-9-]+|demo-home-\d+)", url)
    return m.group(1) if m else None


def resize_to_instagram(img_bytes: bytes) -> bytes:
    """Scale card to fit 1080px wide with margin, draw dotted cream background."""
    card_img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")

    # Create the canvas with cream background
    canvas = Image.new("RGBA", (OUTPUT_W, OUTPUT_H), BG_COLOR + (255,))
    
    # Draw the dot pattern
    draw = ImageDraw.Draw(canvas)
    for x in range(0, OUTPUT_W, DOT_SPACING):
        for y in range(0, OUTPUT_H, DOT_SPACING):
            draw.ellipse(
                [x - DOT_RADIUS, y - DOT_RADIUS, x + DOT_RADIUS, y + DOT_RADIUS],
                fill=(0, 0, 0, 25) # Subtle dots
            )

    # Scale card to be 90% of the canvas width
    margin = 40
    target_card_w = OUTPUT_W - (margin * 2)
    scale = target_card_w / card_img.width
    new_h = int(card_img.height * scale)
    
    # Resize card (using LANCZOS for quality)
    card_img = card_img.resize((target_card_w, new_h), Image.LANCZOS)

    # Paste onto canvas, vertically centered
    y = max(margin, (OUTPUT_H - new_h) // 2)
    # If card is too tall, we might need a different strategy, but usually it fits
    # Use alpha_composite if we had transparency, but card is usually solid
    # Just paste
    canvas.paste(card_img, (margin, y), card_img)

    # Convert back to RGB for final save
    final_img = canvas.convert("RGB")
    out = io.BytesIO()
    final_img.save(out, format="PNG", optimize=True)
    return out.getvalue()


async def capture(target_url: str = None, base_url: str = "http://localhost:8080", limit: int = 6):
    SCREENSHOTS_DIR.mkdir(exist_ok=True)
    
    story_id = extract_story_id(target_url) if target_url else None
    url_to_load = base_url

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 1600},
            device_scale_factor=SCALE,
            user_agent=USER_AGENT,
        )
        page = await context.new_page()

        print(f"Loading {url_to_load}...")
        await page.goto(url_to_load, wait_until="networkidle", timeout=60000)
        
        # Give React dynamic data a moment to render
        await asyncio.sleep(4)

        if story_id:
            print(f"Looking for specific card: {story_id}")
            selector = f"a[href*='{story_id}'] article"
            found = False
            for attempt in range(10):
                count = await page.locator(selector).count()
                if count > 0:
                    found = True
                    card = page.locator(selector).first
                    break
                print(f"  Not visible yet, scrolling... (attempt {attempt + 1}/10)")
                await page.evaluate("window.scrollBy(0, 800)")
                await asyncio.sleep(1)
            
            if not found:
                print(f"FAILED: Story '{story_id}' not found on page.")
                await browser.close()
                return

            await card.scroll_into_view_if_needed()
            await asyncio.sleep(1) # Wait for hover/shadows to settle
            img_bytes = await card.screenshot()
            ig_bytes = resize_to_instagram(img_bytes)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = SCREENSHOTS_DIR / f"story_{story_id}_{timestamp}.png"
            filename.write_bytes(ig_bytes)
            print(f"✓ Saved: {filename}")

        else:
            print(f"No specific story ID — capturing top {limit} cards from feed.")
            # Target both real and demo cards
            cards_locator = page.locator("a[href*='/stire/'] article, article.group")
            
            count = await cards_locator.count()
            if count == 0:
                print("No cards found. Trying generic 'article'...")
                cards_locator = page.locator("article")
                count = await cards_locator.count()

            actual_limit = min(limit, count)
            print(f"Found {count} cards, capturing {actual_limit}...")

            for i in range(actual_limit):
                card = cards_locator.nth(i)
                await card.scroll_into_view_if_needed()
                await asyncio.sleep(1)
                
                # Try to get the title for the filename
                try:
                    title_text = await card.locator("h3").first.inner_text()
                    title_slug = re.sub(r'[^a-z0-9]', '', title_text.lower())[:20]
                except:
                    title_slug = f"card_{i+1}"

                img_bytes = await card.screenshot()
                ig_bytes = resize_to_instagram(img_bytes)
                
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = SCREENSHOTS_DIR / f"{i+1}_{title_slug}_{timestamp}.png"
                filename.write_bytes(ig_bytes)
                print(f"✓ Saved: {filename}")

        await browser.close()


def main():
    parser = argparse.ArgumentParser(description="Capture ClarStiri cards for Instagram.")
    parser.add_argument("url", nargs="?", help="URL of the story or the homepage")
    parser.add_argument("--base-url", default="http://localhost:8080", help="Root URL (default: http://localhost:8080)")
    parser.add_argument("--limit", type=int, default=6, help="Max cards to capture (default: 6)")
    
    args = parser.parse_args()

    target_url = args.url
    base_url = args.base_url
    
    if target_url and target_url.startswith("http") and not extract_story_id(target_url):
        base_url = target_url
        target_url = None

    asyncio.run(capture(target_url, base_url, args.limit))


if __name__ == "__main__":
    main()


