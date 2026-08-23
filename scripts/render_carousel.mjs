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
    https.get('https://www.thesite.ro/api/news?limit=30', (res) => {
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

const HISTORY_FILE = path.join(__dirname, '..', 'social_export', 'posted_stories.json');

function getPostedHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('⚠️ Nu am putut citi posted_stories.json, pornim cu istoric gol.');
  }
  return [];
}

function recordPostedStory(story) {
  try {
    const history = getPostedHistory();
    history.push({
      id: story.id,
      title: story.title,
      postedAt: new Date().toISOString(),
    });
    // Păstrăm ultimele 300 de postări în istoric
    const trimmed = history.slice(-300);
    fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmed, null, 2), 'utf8');
    console.log(`📝 Știrea a fost salvată în istoricul de postări: [${story.id}] ${story.title}`);
  } catch (e) {
    console.warn('⚠️ Eroare la salvarea în posted_stories.json:', e.message);
  }
}

async function run() {
  console.log('🚀 Fetching top news stories from thesite.ro...');
  const stories = await fetchTopStories();
  if (!stories || stories.length === 0) {
    console.error('❌ No stories found!');
    return;
  }

  const history = getPostedHistory();
  const postedIds = new Set(history.map(h => h.id));
  const postedTitles = new Set(history.map(h => (h.title || '').trim().toLowerCase()));

  // Filtrăm doar știrile nepostate încă
  const unposted = stories.filter(s => {
    if (postedIds.has(s.id)) return false;
    const cleanTitle = (s.title || '').trim().toLowerCase();
    if (postedTitles.has(cleanTitle)) return false;
    return true;
  });

  console.log(`📊 Găsite ${stories.length} știri, dintre care ${unposted.length} nepostate.`);

  // Căutăm cea mai bună știre nepostată:
  // 1. Știri cu blindspot (punct orb) și cel puțin 2-3 surse
  // 2. Știri cu cele mai multe surse și acoperire diversă
  // 3. Dacă toate au fost postate, luăm cea mai recentă din feed
  const candidatePool = unposted.length > 0 ? unposted : stories;

  // Sortăm candidații după relevanță editorială pentru social media
  candidatePool.sort((a, b) => {
    const aBlindspot = (a.blindspot && a.blindspot !== 'none') ? 10 : 0;
    const bBlindspot = (b.blindspot && b.blindspot !== 'none') ? 10 : 0;
    const aSources = (a.sourcesCount || a.sources?.length || 0);
    const bSources = (b.sourcesCount || b.sources?.length || 0);
    return (bBlindspot + bSources) - (aBlindspot + aSources);
  });

  const story = candidatePool[0];
  console.log('📌 Selected Story:', story.title);
  console.log(`   Surse: ${story.sourcesCount || story.sources?.length} | Blindspot: ${story.blindspot || 'none'}`);

  // Salvăm în istoric pentru a preveni postarea duplicată
  recordPostedStory(story);

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
}

run().catch(console.error);
