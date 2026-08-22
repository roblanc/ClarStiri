import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { buildHtmlSlides } from './generate_carousel.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchTopStories() {
  return new Promise((resolve, reject) => {
    https.get('https://www.thesite.ro/api/news?limit=10', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.data || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Helper to send generated post & caption directly to Telegram
async function sendToTelegram(images, caption) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  console.log('📱 Sending post notification to Telegram...');
  // Send primary cover photo
  try {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('caption', caption);
    formData.append('photo', new Blob([fs.readFileSync(images[0])]), 'cover.png');

    await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      body: formData,
    });
    console.log('✓ Post sent to Telegram successfully!');
  } catch (err) {
    console.error('Failed to send Telegram notification:', err.message);
  }
}

async function run() {
  console.log('🚀 Fetching top news stories from thesite.ro...');
  const stories = await fetchTopStories();
  if (!stories || stories.length === 0) {
    console.error('❌ No stories found!');
    return;
  }

  // Pick top story (preferably one with blindspot or high sources count)
  const story = stories.find(s => s.blindspot && s.blindspot !== 'none') || stories[0];
  console.log('📌 Selected Story:', story.title);
  console.log(`   Surse: ${story.sourcesCount || story.sources?.length} | Blindspot: ${story.blindspot || 'none'}`);

  const outDir = path.join(__dirname, '..', 'social_export', 'latest');
  fs.mkdirSync(outDir, { recursive: true });

  const { slide1, slide2, slide3 } = buildHtmlSlides(story);

  console.log('📷 Launching Playwright browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1350 },
    deviceScaleFactor: 2, // Crisp 2x Retina Render
  });
  const page = await context.newPage();

  const slides = [
    { name: '1_cover.png', html: slide1 },
    { name: '2_headlines.png', html: slide2 },
    { name: '3_cta.png', html: slide3 },
  ];

  const generatedImages = [];
  for (const s of slides) {
    await page.setContent(s.html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const savePath = path.join(outDir, s.name);
    await page.screenshot({ path: savePath, type: 'png' });
    generatedImages.push(savePath);
    console.log(`  ✓ Saved ${s.name}`);
  }

  await browser.close();

  // Generate caption
  const left = Math.round(story.bias?.left || 0);
  const center = Math.round(story.bias?.center || 0);
  const right = Math.round(story.bias?.right || 0);
  const totalSources = story.sourcesCount || story.sources?.length || 0;

  const caption = `thesite.ro ${story.title}. Vezi știrea din toate perspectivele pe thesite.ro.

📊 ${totalSources} publicații au acoperit subiectul:
• Stânga: ${left}%${story.blindspot === 'left' ? ' (Punct orb)' : ''}
• Centru: ${center}%
• Dreapta: ${right}%${story.blindspot === 'right' ? ' (Punct orb)' : ''}

👉 Glisează pentru a vedea cum diferă titlurile fiecărei publicații!

#stiri #romania #actualitate #groundnews #media #bias #presaromana #thesite`;

  const captionPath = path.join(outDir, 'caption.txt');
  fs.writeFileSync(captionPath, caption, 'utf8');
  console.log('  ✓ Saved caption.txt');

  console.log('\n--- CAPTION GENERAT ---');
  console.log(caption);
  console.log('------------------------\n');
  console.log(`🎉 Toate fișierele sunt salvate în: ${outDir}`);

  // Send to Telegram if configured
  await sendToTelegram(generatedImages, caption);
}

run().catch(console.error);
