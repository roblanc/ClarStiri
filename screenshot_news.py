#!/usr/bin/env python3
"""
screenshot_news.py — Capture a thesite.ro news card as a 1080x1350 Instagram portrait.

Usage:
    python screenshot_news.py <story-url>
    python screenshot_news.py https://www.thesite.ro/stire/story-20260318-62s6kx?s=...

The script finds the matching article card on the homepage and screenshots it.
Output saved to ./screenshots/
"""

import asyncio
import sys
import re
from pathlib import Path
from datetime import datetime
from PIL import Image
import io

from playwright.async_api import async_playwright

OUTPUT_W = 1080
OUTPUT_H = 1350
SCALE = 2  # retina render
SCREENSHOTS_DIR = Path(__file__).parent / "screenshots"

HOMEPAGE = "https://www.thesite.ro"
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)


def extract_story_id(url: str):
    """Pull story ID like 'story-20260318-62s6kx' from a thesite.ro URL."""
    m = re.search(r"(story-[a-z0-9-]+)", url)
    return m.group(1) if m else None


def resize_to_instagram(img_bytes: bytes) -> bytes:
    """Scale card to fill 1080px wide, pad to 1350px tall with white background."""
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

    # Scale to exactly OUTPUT_W wide, preserving aspect ratio
    scale = OUTPUT_W / img.width
    new_h = int(img.height * scale)
    img = img.resize((OUTPUT_W, new_h), Image.LANCZOS)

    # Paste onto white 1080x1350 canvas, vertically centered
    canvas = Image.new("RGB", (OUTPUT_W, OUTPUT_H), (255, 255, 255))
    y = max(0, (OUTPUT_H - new_h) // 2)
    # If card is taller than canvas, crop from top
    src_y = max(0, (new_h - OUTPUT_H) // 2)
    region = img.crop((0, src_y, OUTPUT_W, src_y + min(new_h, OUTPUT_H)))
    canvas.paste(region, (0, y if new_h <= OUTPUT_H else 0))

    out = io.BytesIO()
    canvas.save(out, format="PNG", optimize=True)
    return out.getvalue()


async def capture(url: str):
    SCREENSHOTS_DIR.mkdir(exist_ok=True)
    story_id = extract_story_id(url)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 800, "height": 1200},
            device_scale_factor=SCALE,
            user_agent=USER_AGENT,
        )
        page = await context.new_page()

        print(f"Loading homepage...")
        await page.goto(HOMEPAGE, wait_until="load", timeout=60000)
        await asyncio.sleep(2)

        # Find the right card — scroll down to load more if needed
        if story_id:
            print(f"Looking for card: {story_id}")
            card = page.locator(f"a[href*='{story_id}'] article").first
            found = False
            for attempt in range(8):
                count = await page.locator(f"a[href*='{story_id}']").count()
                if count > 0:
                    found = True
                    break
                print(f"  Not visible yet, scrolling... (attempt {attempt + 1}/8)")
                await page.evaluate("window.scrollBy(0, 1200)")
                await asyncio.sleep(1.5)
            if not found:
                print("Story not found on homepage. It may have been archived.")
                await browser.close()
                sys.exit(1)
        else:
            print("No story ID found — capturing first card on homepage.")
            card = page.locator("a[href*='/stire/'] article").first

        # Scroll card into view
        await card.scroll_into_view_if_needed()
        await asyncio.sleep(0.5)

        img_bytes = await card.screenshot()

        # Resize to IG format
        ig_bytes = resize_to_instagram(img_bytes)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        slug = story_id or "card"
        filename = SCREENSHOTS_DIR / f"{slug}_{timestamp}.png"
        filename.write_bytes(ig_bytes)

        await browser.close()
        print(f"✓ Saved: {filename}")
        return filename


def main():
    if len(sys.argv) < 2:
        print("Usage: python screenshot_news.py <story-url>")
        print("Example: python screenshot_news.py 'https://www.thesite.ro/stire/story-20260318-62s6kx?s=...'")
        sys.exit(1)

    asyncio.run(capture(sys.argv[1]))


if __name__ == "__main__":
    main()
