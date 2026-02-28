import json
import os
import xml.etree.ElementTree as ET
import urllib.request
from datetime import datetime

# Path to the project
BASE_DIR = "/Users/romica/Library/Mobile Documents/com~apple~CloudDocs/01 Projects/GitHub/ClarStiri"
ARCHIVE_DIR = os.path.join(BASE_DIR, "src/data/archives")

def fetch_rss(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def parse_rss(xml_string):
    try:
        root = ET.fromstring(xml_string)
        items = []
        for item in root.findall('.//item'):
            title = item.find('title').text if item.find('title') is not None else ""
            link = item.find('link').text if item.find('link') is not None else ""
            pub_date = item.find('pubDate').text if item.find('pubDate') is not None else ""
            
            if title and link:
                # Basic cleaning
                title = title.replace('<![CDATA[', '').replace(']]>', '').strip()
                items.append({
                    "title": title,
                    "url": link,
                    "date": pub_date
                })
        return items
    except Exception as e:
        print(f"Error parsing XML: {e}")
        return []

# Sources from your project (subset for seeding)
SOURCES = [
    {"id": "digi24", "rss": "https://www.digi24.ro/rss"},
    {"id": "hotnews", "rss": "https://hotnews.ro/feed"},
    {"id": "g4media", "rss": "https://www.g4media.ro/feed"},
    {"id": "mediafax", "rss": "https://www.mediafax.ro/rss"},
    {"id": "agerpres", "rss": "https://www.agerpres.ro/rss/actualitate"},
    {"id": "libertatea", "rss": "https://www.libertatea.ro/feed"},
    {"id": "protv", "rss": "https://stirileprotv.ro/rss"},
    {"id": "adevarul", "rss": "https://adevarul.ro/rss"},
    {"id": "recorder", "rss": "https://recorder.ro/feed"},
    {"id": "observator", "rss": "https://observatornews.ro/rss"},
    {"id": "antena3", "rss": "https://www.antena3.ro/rss"},
    {"id": "romaniatv", "rss": "https://www.romaniatv.net/rss"},
    {"id": "b1tv", "rss": "https://www.b1tv.ro/rss"},
    {"id": "realitatea", "rss": "https://www.realitatea.net/rss"},
    {"id": "ziare-com", "rss": "https://ziare.com/rss/stiri.xml"},
]

def main():
    if not os.path.exists(ARCHIVE_DIR):
        os.makedirs(ARCHIVE_DIR)

    for src in SOURCES:
        print(f"Processing {src['id']}...")
        xml = fetch_rss(src['rss'])
        if xml:
            articles = parse_rss(xml)
            if articles:
                file_path = os.path.join(ARCHIVE_DIR, f"{src['id']}.json")
                
                # Load existing if exists to avoid duplicates
                existing = []
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        existing = json.load(f)
                
                # Combine and deduplicate by URL
                seen_urls = {a['url'] for a in existing}
                new_articles = [a for a in articles if a['url'] not in seen_urls]
                
                combined = existing + new_articles
                # Sort by date (naive string sort usually works for RSS pubDate)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(combined, f, ensure_ascii=False, indent=2)
                print(f"  Added {len(new_articles)} new articles to {src['id']}.json")

if __name__ == "__main__":
    main()
