import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { execSync } from 'child_process';

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

function getLogoUrl(sourceName = '', sourceId = '') {
  const norm = (sourceName + ' ' + sourceId).toLowerCase();
  if (norm.includes('g4')) return 'https://www.thesite.ro/logos/g4media.png';
  if (norm.includes('hotnews')) return 'https://www.thesite.ro/logos/hotnews.png';
  if (norm.includes('digi')) return 'https://www.thesite.ro/logos/digi24.png';
  if (norm.includes('protv')) return 'https://www.thesite.ro/logos/protv.png';
  if (norm.includes('libertatea')) return 'https://www.thesite.ro/logos/libertatea.png';
  if (norm.includes('adevarul')) return 'https://www.thesite.ro/logos/adevarul.png';
  if (norm.includes('antena')) return 'https://www.thesite.ro/logos/antena3.png';
  if (norm.includes('romaniatv')) return 'https://www.thesite.ro/logos/romaniatv.png';
  if (norm.includes('b1')) return 'https://www.thesite.ro/logos/b1tv.png';
  if (norm.includes('recorder')) return 'https://www.thesite.ro/logos/recorder.png';
  if (norm.includes('agerpres')) return 'https://www.thesite.ro/logos/agerpres.png';
  return '';
}

function getHeadlines(story) {
  const sources = story.sources || [];
  const leftItem = sources.find(s => (s.source?.bias || s.bias || '').includes('left'));
  const centerItem = sources.find(s => {
    const b = (s.source?.bias || s.bias || '').toLowerCase();
    return b.includes('center') || b === '' || (!b.includes('left') && !b.includes('right'));
  });
  const rightItem = sources.find(s => (s.source?.bias || s.bias || '').includes('right'));

  const fallbackLeft = {
    outlet: 'G4Media',
    logo: 'https://www.thesite.ro/logos/g4media.png',
    title: leftItem?.title || story.title
  };
  const fallbackCenter = {
    outlet: 'Digi24',
    logo: 'https://www.thesite.ro/logos/digi24.png',
    title: centerItem?.title || story.title
  };
  const fallbackRight = {
    outlet: 'România TV',
    logo: 'https://www.thesite.ro/logos/romaniatv.png',
    title: rightItem?.title || story.title
  };

  return {
    left: {
      outlet: leftItem?.source?.name || fallbackLeft.outlet,
      logo: getLogoUrl(leftItem?.source?.name, leftItem?.source?.id) || fallbackLeft.logo,
      title: leftItem?.title || fallbackLeft.title
    },
    center: {
      outlet: centerItem?.source?.name || fallbackCenter.outlet,
      logo: getLogoUrl(centerItem?.source?.name, centerItem?.source?.id) || fallbackCenter.logo,
      title: centerItem?.title || fallbackCenter.title
    },
    right: {
      outlet: rightItem?.source?.name || fallbackRight.outlet,
      logo: getLogoUrl(rightItem?.source?.name, rightItem?.source?.id) || fallbackRight.logo,
      title: rightItem?.title || fallbackRight.title
    }
  };
}

function buildReelHtml(story) {
  const left = Math.round(story.bias?.left || 0);
  const center = Math.round(story.bias?.center || 0);
  const right = Math.round(story.bias?.right || 0);
  const totalSources = story.sourcesCount || story.sources?.length || 0;
  const headlines = getHeadlines(story);
  
  const coverImage = story.image || story.imageUrl || story.sources?.find(s => s.imageUrl)?.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200';

  let dominantBadge = 'ACOPERIRE ECHILIBRATĂ';
  if (story.blindspot === 'left') dominantBadge = 'PUNCT ORBIT STÂNGA';
  else if (story.blindspot === 'right') dominantBadge = 'PUNCT ORBIT DREAPTA';
  else if (left > center && left > right) dominantBadge = 'PRELUAT DE STÂNGA';
  else if (right > center && right > left) dominantBadge = 'PRELUAT DE DREAPTA';

  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<title>Reel 9:16 Video</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,600;1,700;1,800&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1080px;
    height: 1920px;
    background: #000000;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #18181b;
    overflow: hidden;
    position: relative;
  }

  /* Progress Bar */
  .reel-progress {
    position: absolute;
    top: 60px;
    left: 80px;
    right: 80px;
    height: 6px;
    background: rgba(255,255,255,0.25);
    border-radius: 4px;
    overflow: hidden;
    z-index: 100;
  }
  .reel-progress-fill {
    height: 100%;
    background: #3b82f6;
    width: 0%;
  }

  /* Common Scene Wrapper */
  .scene-container {
    position: absolute;
    inset: 0;
    width: 1080px;
    height: 1920px;
    display: none;
    flex-direction: column;
    justify-content: space-between;
  }

  /* ========================================================
     SCENE 1: NEWS COVER WITH REAL IMAGE (Clean & Balanced)
     ======================================================== */
  #scene1 {
    display: flex;
    background: #000000;
  }
  .cover-hero {
    position: relative;
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 60px;
    padding: 250px 80px 420px 80px; /* Safe from top header & bottom caption */
    overflow: hidden;
  }
  .cover-bg-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.85);
  }
  .cover-gradient-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.85) 68%, rgba(0,0,0,0.98) 100%);
  }

  .cover-top-bar {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  .cover-brand {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .cover-brand img {
    width: 52px;
    height: 52px;
    object-fit: contain;
  }
  .cover-brand-text {
    font-family: 'Playfair Display', serif;
    font-size: 40px;
    font-weight: 900;
    font-style: italic;
    color: #ffffff;
    letter-spacing: -0.02em;
  }
  .cover-badges-group {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .cover-badge {
    padding: 10px 20px;
    border-radius: 9999px;
    font-size: 15px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .badge-dark {
    background: rgba(15, 23, 42, 0.85);
    color: #ffffff;
    border: 1px solid rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
  }
  .badge-accent {
    background: #ffffff;
    color: #09090b;
  }

  .cover-main-content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .cover-headline-box {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .cover-kicker {
    font-size: 18px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: #60a5fa;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cover-title {
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    font-size: 48px;
    line-height: 1.22;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #ffffff;
    text-shadow: 0 4px 24px rgba(0,0,0,0.85);
  }

  /* Slim & Minimalist Clean Bias Bar */
  .cover-bias-card {
    display: flex;
    width: 100%;
    height: 110px;
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 15px 35px rgba(0,0,0,0.5);
    border: 1.5px solid rgba(255,255,255,0.25);
  }
  .bias-bar-col {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 12px;
  }
  .col-stanga { background: #1e3a8a; color: #ffffff; }
  .col-centru { background: #f4f4f5; color: #09090b; }
  .col-dreapta { background: #881337; color: #ffffff; }

  .col-pct {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 38px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.03em;
  }
  .col-name {
    font-size: 16px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }

  /* ========================================================
     WHITE DOTTED THEME (Scenes 2 & 3)
     ======================================================== */
  .white-dotted-bg {
    background-color: #fafafa;
    background-image: radial-gradient(#d4d4d8 1.8px, transparent 1.8px);
    background-size: 36px 36px;
    color: #09090b;
    padding: 250px 80px 420px 80px;
  }

  .scene-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 36px;
  }
  .scene-brand {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .scene-brand img {
    width: 52px;
    height: 52px;
    object-fit: contain;
  }
  .scene-brand-text {
    font-family: 'Playfair Display', serif;
    font-size: 40px;
    font-weight: 900;
    font-style: italic;
    color: #09090b;
    letter-spacing: -0.02em;
  }
  .scene-step-tag {
    font-size: 16px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #52525b;
  }

  /* ========================================================
     SCENE 2: 3 ANGLES COMPARISON
     ======================================================== */
  .scene2-title-wrap {
    margin-bottom: 30px;
  }
  .scene2-kicker {
    font-size: 18px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #2563eb;
    margin-bottom: 8px;
  }
  .scene2-h1 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 46px;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: #09090b;
  }
  .scene2-h1 span {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-weight: 900;
    color: #2563eb;
  }

  .headline-card {
    background: #ffffff;
    border: 1.5px solid #e4e4e7;
    border-radius: 26px;
    padding: 24px 30px;
    margin-bottom: 18px;
    box-shadow: 0 10px 25px -8px rgba(0,0,0,0.04);
    position: relative;
    overflow: hidden;
  }
  .card-radial-arc {
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 100%;
    border-radius: 0 26px 26px 0;
    pointer-events: none;
  }
  .arc-left { background: radial-gradient(circle at 100% 50%, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0) 70%); }
  .arc-center { background: radial-gradient(circle at 100% 50%, rgba(113,113,122,0.12) 0%, rgba(113,113,122,0) 70%); }
  .arc-right { background: radial-gradient(circle at 100% 50%, rgba(225,29,72,0.12) 0%, rgba(225,29,72,0) 70%); }

  .card-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .card-outlet-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .card-outlet-logo {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid rgba(0,0,0,0.08);
  }
  .card-outlet-name {
    font-size: 20px;
    font-weight: 800;
    color: #09090b;
    letter-spacing: -0.01em;
  }
  .card-pill-tag {
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    padding: 5px 14px;
    border-radius: 9999px;
  }
  .pill-left { background: #dbeafe; color: #1e40af; }
  .pill-center { background: #e4e4e7; color: #27272a; }
  .pill-right { background: #ffe4e6; color: #9f1239; }

  .card-headline-quote {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 21px;
    line-height: 1.35;
    font-weight: 700;
    color: #18181b;
    letter-spacing: -0.01em;
    border-left: 4px solid #2563eb;
    padding-left: 14px;
  }
  .quote-border-left { border-left-color: #2563eb; }
  .quote-border-center { border-left-color: #71717a; }
  .quote-border-right { border-left-color: #e11d48; }

  /* ========================================================
     SCENE 3: OUTRO / CTA
     ======================================================== */
  .outro-card {
    background: #ffffff;
    border: 2px solid #e4e4e7;
    border-radius: 36px;
    padding: 50px 36px;
    box-shadow: 0 20px 50px -15px rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin: auto 0;
  }
  .outro-kicker {
    font-size: 18px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: #2563eb;
    margin-bottom: 16px;
  }
  .outro-h1 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 52px;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.03em;
    margin-bottom: 20px;
    color: #09090b;
  }
  .outro-h1 span {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-weight: 900;
    color: #2563eb;
  }
  .outro-desc {
    font-size: 22px;
    line-height: 1.45;
    color: #52525b;
    max-width: 700px;
    margin-bottom: 40px;
  }
  .outro-cta-btn {
    background: #09090b;
    color: #ffffff;
    padding: 20px 44px;
    border-radius: 9999px;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 12px 30px rgba(0,0,0,0.18);
  }
  .outro-cta-btn span {
    color: #60a5fa;
  }
</style>
</head>
<body>

  <!-- Progress Bar -->
  <div class="reel-progress">
    <div id="progressBar" class="reel-progress-fill"></div>
  </div>

  <!-- ========================================================
       SCENE 1: NEWS COVER WITH REAL IMAGE (Clean & Balanced)
       ======================================================== -->
  <div id="scene1" class="scene-container">
    <div class="cover-hero">
      <img src="${coverImage}" class="cover-bg-image" alt="">
      <div class="cover-gradient-overlay"></div>

      <div class="cover-top-bar">
        <div class="cover-brand">
          <img src="https://www.thesite.ro/hero-illustration-headphones.webp" alt="thesite.ro">
          <span class="cover-brand-text">thesite.ro</span>
        </div>
        <div class="cover-badges-group">
          <span class="cover-badge badge-dark">${totalSources} SURSE</span>
          <span class="cover-badge badge-accent">${dominantBadge}</span>
        </div>
      </div>

      <div class="cover-main-content">
        <div class="cover-headline-box">
          <div class="cover-kicker">• SPECTRU & ANALIZĂ MEDIATICĂ</div>
          <h1 class="cover-title">${story.title}</h1>
        </div>

        <div class="cover-bias-card">
          <div class="bias-bar-col col-stanga">
            <span class="col-pct">${left}%</span>
            <span class="col-name">Stânga</span>
          </div>
          <div class="bias-bar-col col-centru">
            <span class="col-pct">${center}%</span>
            <span class="col-name">Centru</span>
          </div>
          <div class="bias-bar-col col-dreapta">
            <span class="col-pct">${right}%</span>
            <span class="col-name">Dreapta</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================
       SCENE 2: 3 ANGLES COMPARISON (4.5s - 9.0s)
       ======================================================== -->
  <div id="scene2" class="scene-container white-dotted-bg">
    <div>
      <div class="scene-header">
        <div class="scene-brand">
          <img src="https://www.thesite.ro/hero-illustration-headphones.webp" alt="thesite.ro">
          <span class="scene-brand-text">thesite.ro</span>
        </div>
        <span class="scene-step-tag">PERSPECTIVE MEDIA • 02 / 03</span>
      </div>

      <div class="scene2-title-wrap">
        <div class="scene2-kicker">• COMPARAȚIE TITLURI</div>
        <h1 class="scene2-h1">Același eveniment, <br><span>3 unghiuri diferite</span></h1>
      </div>

      <div class="headline-card">
        <div class="card-radial-arc arc-left"></div>
        <div class="card-header-row">
          <div class="card-outlet-info">
            <img src="${headlines.left.logo}" class="card-outlet-logo" alt="">
            <span class="card-outlet-name">${headlines.left.outlet}</span>
          </div>
          <span class="card-pill-tag pill-left">Stânga</span>
        </div>
        <div class="card-headline-quote quote-border-left">„${headlines.left.title}”</div>
      </div>

      <div class="headline-card">
        <div class="card-radial-arc arc-center"></div>
        <div class="card-header-row">
          <div class="card-outlet-info">
            <img src="${headlines.center.logo}" class="card-outlet-logo" alt="">
            <span class="card-outlet-name">${headlines.center.outlet}</span>
          </div>
          <span class="card-pill-tag pill-center">Centru</span>
        </div>
        <div class="card-headline-quote quote-border-center">„${headlines.center.title}”</div>
      </div>

      <div class="headline-card">
        <div class="card-radial-arc arc-right"></div>
        <div class="card-header-row">
          <div class="card-outlet-info">
            <img src="${headlines.right.logo}" class="card-outlet-logo" alt="">
            <span class="card-outlet-name">${headlines.right.outlet}</span>
          </div>
          <span class="card-pill-tag pill-right">Dreapta</span>
        </div>
        <div class="card-headline-quote quote-border-right">„${headlines.right.title}”</div>
      </div>
    </div>
  </div>

  <!-- ========================================================
       SCENE 3: OUTRO & CTA (9.0s - 12.0s)
       ======================================================== -->
  <div id="scene3" class="scene-container white-dotted-bg">
    <div>
      <div class="scene-header">
        <div class="scene-brand">
          <img src="https://www.thesite.ro/hero-illustration-headphones.webp" alt="thesite.ro">
          <span class="scene-brand-text">thesite.ro</span>
        </div>
        <span class="scene-step-tag">SINTEZĂ • 03 / 03</span>
      </div>
    </div>

    <div class="outro-card">
      <div class="outro-kicker">• PRESA FĂRĂ FILTRE</div>
      <h1 class="outro-h1">Vezi imaginea completă, <span>fără manipulare.</span></h1>
      <p class="outro-desc">Descoperă unghiurile ascunse și bias-ul politic din spatele fiecărei știri din România.</p>
      
      <div class="outro-cta-btn">
        Citește pe <span>thesite.ro</span> ➔
      </div>
    </div>
  </div>

  <script>
    window.setReelProgress = function(t) {
      document.getElementById('progressBar').style.width = (t * 100) + '%';

      const s1 = document.getElementById('scene1');
      const s2 = document.getElementById('scene2');
      const s3 = document.getElementById('scene3');

      if (t < 0.38) {
        s1.style.display = 'flex';
        s2.style.display = 'none';
        s3.style.display = 'none';
      } else if (t < 0.75) {
        s1.style.display = 'none';
        s2.style.display = 'flex';
        s3.style.display = 'none';
      } else {
        s1.style.display = 'none';
        s2.style.display = 'none';
        s3.style.display = 'flex';
      }
    };
  </script>
</body>
</html>`;
}

async function renderReelVideo(story, outputPath) {
  const html = buildReelHtml(story);
  const tempDir = path.join(__dirname, '..', 'social_export', 'temp_frames');
  fs.mkdirSync(tempDir, { recursive: true });

  console.log('🚀 Launching Playwright for Reel 9:16 video generation...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const fps = 30;
  const durationSeconds = 12;
  const totalFrames = fps * durationSeconds;

  console.log(`🎬 Capturing ${totalFrames} frames at ${fps} FPS (1080x1920)...`);
  for (let i = 0; i < totalFrames; i++) {
    const t = i / totalFrames;
    await page.evaluate(progress => window.setReelProgress(progress), t);
    const frameFile = path.join(tempDir, `frame_${String(i).padStart(4, '0')}.png`);
    await page.screenshot({ path: frameFile, type: 'png' });
    if (i % 30 === 0) {
      process.stdout.write(`  Frame ${i}/${totalFrames} (${Math.round(t * 100)}%)\r`);
    }
  }
  console.log(`\n✓ All ${totalFrames} frames captured!`);
  await browser.close();

  // Stitch with FFmpeg
  console.log('🎞️ Encoding MP4 video with FFmpeg...');
  const ffmpegCmd = `ffmpeg -y -framerate ${fps} -i "${tempDir}/frame_%04d.png" -c:v libx264 -preset fast -profile:v high -level:v 4.2 -pix_fmt yuv420p -movflags +faststart "${outputPath}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  // Cleanup temp frames
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log(`\n🎉 Reel MP4 video ready: ${outputPath}`);
}

async function main() {
  console.log('📰 Fetching stories for Reel generation...');
  const stories = await fetchTopStories();
  const story = stories.find(s => s.blindspot && s.blindspot !== 'none') || stories[0];

  console.log('📌 Selected Story for Reel:', story.title);
  const outDir = path.join(__dirname, '..', 'social_export', 'latest');
  fs.mkdirSync(outDir, { recursive: true });
  const videoPath = path.join(outDir, 'reel.mp4');

  await renderReelVideo(story, videoPath);
}

main();
