import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { chromium } from '/home/brewuser/fb-group-bot/node_modules/playwright/index.mjs';
import { buildHtmlSlides } from './generate_carousel.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchTopStory() {
  return new Promise((resolve, reject) => {
    https.get('https://www.thesite.ro/api/news?limit=1', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.data?.[0]);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Fetching top story from thesite.ro...');
  const story = await fetchTopStory();
  if (!story) {
    console.error('No story found!');
    return;
  }

  console.log('Story found:', story.title);
  const outDir = path.join(__dirname, '..', 'social_export', 'test_groundnews');
  fs.mkdirSync(outDir, { recursive: true });

  const { slide1, slide2, slide3 } = buildHtmlSlides(story);

  console.log('Launching Playwright browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1350 },
    deviceScaleFactor: 2, // Crisp Retina Render
  });
  const page = await context.newPage();

  const slides = [
    { name: '1_cover.png', html: slide1 },
    { name: '2_headlines.png', html: slide2 },
    { name: '3_cta.png', html: slide3 },
  ];

  for (const s of slides) {
    await page.setContent(s.html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const savePath = path.join(outDir, s.name);
    await page.screenshot({ path: savePath, type: 'png' });
    console.log(`✓ Saved ${s.name} (${savePath})`);
  }

  await browser.close();

  // Generate caption
  const left = Math.round(story.bias?.left || 0);
  const center = Math.round(story.bias?.center || 0);
  const right = Math.round(story.bias?.right || 0);
  const totalSources = story.sourcesCount || story.sources?.length || 0;

  const caption = `⚖️ ${story.title}

📊 Cum a relatat presa acest eveniment?
${totalSources} publicații au acoperit subiectul:
• Stânga: ${left}%
• Centru: ${center}%
• Dreapta: ${right}%

👉 Glisează pentru a vedea cum diferă titlurile și framing-ul fiecărei publicații!

🔗 Vezi analiza completă pe thesite.ro (Link în Bio)

#thesite #știri #romania #groundnews #media #bias #actualitate #stirileprotv #digi24 #antena3 #g4media #hotnews`;

  fs.writeFileSync(path.join(outDir, 'caption.txt'), caption, 'utf8');
  console.log('✓ Saved caption.txt');
  console.log('\n--- GENERATED CAPTION ---');
  console.log(caption);
  console.log('-------------------------');
}

run().catch(console.error);
