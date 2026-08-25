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
  const leftItem = sources.find(s => (s.source?.bias || '').includes('left'));
  const centerItem = sources.find(s => (s.source?.bias || '').includes('center'));
  const rightItem = sources.find(s => (s.source?.bias || '').includes('right'));

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

  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<title>Reel Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=IBM+Plex+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1920px;
    background-color: #fafafa;
    background-image: radial-gradient(#d4d4d8 1.5px, transparent 1.5px);
    background-size: 32px 32px;
    font-family: 'IBM Plex Sans', -apple-system, sans-serif;
    color: #18181b;
    overflow: hidden;
    position: relative;
  }

  /* Header Brand */
  .header {
    position: absolute;
    top: 90px;
    left: 80px;
    right: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 50;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .brand-logo {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }
  .brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 44px;
    font-weight: 900;
    font-style: italic;
    letter-spacing: -0.02em;
    color: #09090b;
  }
  .live-tag {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #ffffff;
    border: 1.5px solid #e4e4e7;
    padding: 10px 22px;
    border-radius: 9999px;
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #09090b;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  }
  .pulse-dot {
    width: 12px;
    height: 12px;
    background: #ef4444;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.3); }
  }

  /* Progress / Timer Bar on top */
  .reel-progress {
    position: absolute;
    top: 40px;
    left: 80px;
    right: 80px;
    height: 6px;
    background: rgba(0,0,0,0.08);
    border-radius: 4px;
    overflow: hidden;
    z-index: 60;
  }
  .reel-progress-fill {
    height: 100%;
    background: #2563eb;
    width: 0%;
  }

  /* Scene Container */
  .scene {
    position: absolute;
    top: 200px;
    left: 80px;
    right: 80px;
    bottom: 120px;
    display: flex;
    flex-col;
    flex-direction: column;
    justify-content: space-between;
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  /* SCENE 1: Hook & Story Topic */
  #scene1 {
    opacity: 1;
    transform: translateY(0);
    z-index: 10;
  }
  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: #2563eb;
    margin-bottom: 24px;
  }
  .story-title {
    font-family: 'Playfair Display', serif;
    font-size: 68px;
    line-height: 1.15;
    font-weight: 900;
    color: #09090b;
    margin-bottom: 40px;
  }

  /* Bias Breakdown Box */
  .bias-box {
    background: #ffffff;
    border: 2px solid #e4e4e7;
    border-radius: 36px;
    padding: 44px;
    box-shadow: 0 20px 40px -15px rgba(0,0,0,0.06);
    margin-bottom: 30px;
  }
  .bias-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
  }
  .bias-label {
    font-size: 24px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #52525b;
  }
  .bias-count {
    font-size: 24px;
    font-weight: 700;
    color: #09090b;
  }
  .bias-bar-track {
    display: flex;
    height: 36px;
    border-radius: 18px;
    overflow: hidden;
    gap: 4px;
    background: #f4f4f5;
    margin-bottom: 36px;
  }
  .bar-seg {
    height: 100%;
    transition: width 1s ease;
  }
  .bar-left { background: #2563eb; }
  .bar-center { background: #71717a; }
  .bar-right { background: #e11d48; }

  .bias-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    text-align: center;
  }
  .stat-card {
    padding: 20px;
    border-radius: 20px;
  }
  .stat-left { background: #eff6ff; color: #1d4ed8; }
  .stat-center { background: #f4f4f5; color: #3f3f46; }
  .stat-right { background: #fff1f2; color: #be123c; }
  .stat-val { font-size: 40px; font-weight: 900; font-family: 'Playfair Display', serif; }
  .stat-name { font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }

  /* SCENE 2: Headlines Comparison */
  #scene2 {
    opacity: 0;
    transform: translateY(40px);
    pointer-events: none;
    z-index: 20;
  }
  .scene-title-row {
    margin-bottom: 30px;
  }
  .scene-h1 {
    font-family: 'Playfair Display', serif;
    font-size: 64px;
    font-weight: 900;
    line-height: 1.1;
  }
  .scene-h1 span {
    font-style: italic;
    color: #2563eb;
  }

  .headline-card {
    background: #ffffff;
    border: 2px solid #e4e4e7;
    border-radius: 32px;
    padding: 36px 40px;
    margin-bottom: 24px;
    box-shadow: 0 12px 30px -10px rgba(0,0,0,0.04);
    position: relative;
    overflow: hidden;
    transform: translateX(0);
    transition: transform 0.4s ease;
  }
  .card-arc-accent {
    position: absolute;
    top: 0;
    right: 0;
    width: 220px;
    height: 100%;
    border-radius: 0 32px 32px 0;
    pointer-events: none;
  }
  .arc-left { background: radial-gradient(circle at 100% 50%, rgba(37,99,235,0.14) 0%, rgba(37,99,235,0) 70%); }
  .arc-center { background: radial-gradient(circle at 100% 50%, rgba(113,113,122,0.14) 0%, rgba(113,113,122,0) 70%); }
  .arc-right { background: radial-gradient(circle at 100% 50%, rgba(225,29,72,0.14) 0%, rgba(225,29,72,0) 70%); }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .card-outlet {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .outlet-logo {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid rgba(0,0,0,0.08);
  }
  .outlet-name {
    font-size: 26px;
    font-weight: 800;
    color: #09090b;
  }
  .card-badge {
    font-size: 16px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 6px 16px;
    border-radius: 9999px;
  }
  .badge-left { background: #dbeafe; color: #1e40af; }
  .badge-center { background: #e4e4e7; color: #27272a; }
  .badge-right { background: #ffe4e6; color: #9f1239; }

  .card-quote {
    font-size: 28px;
    line-height: 1.35;
    font-weight: 700;
    color: #18181b;
    border-left: 5px solid #2563eb;
    padding-left: 20px;
  }
  .quote-left { border-left-color: #2563eb; }
  .quote-center { border-left-color: #71717a; }
  .quote-right { border-left-color: #e11d48; }

  /* SCENE 3: Outro / CTA */
  #scene3 {
    opacity: 0;
    transform: scale(0.95);
    pointer-events: none;
    z-index: 30;
    justify-content: center;
    text-align: center;
  }
  .outro-box {
    background: #ffffff;
    border: 2px solid #e4e4e7;
    border-radius: 44px;
    padding: 60px 48px;
    box-shadow: 0 25px 60px -15px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .outro-kicker {
    font-size: 22px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: #2563eb;
    margin-bottom: 24px;
  }
  .outro-h1 {
    font-family: 'Playfair Display', serif;
    font-size: 72px;
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 28px;
    color: #09090b;
  }
  .outro-h1 span {
    font-style: italic;
    color: #2563eb;
  }
  .outro-sub {
    font-size: 28px;
    line-height: 1.45;
    color: #52525b;
    max-width: 780px;
    margin-bottom: 50px;
  }
  .cta-pill {
    background: #09090b;
    color: #ffffff;
    padding: 24px 50px;
    border-radius: 9999px;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 15px 30px rgba(0,0,0,0.15);
  }
  .cta-pill span {
    color: #60a5fa;
  }

  /* Bottom Footer Indicator */
  .footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 24px;
    border-top: 1.5px solid #e4e4e7;
    font-size: 20px;
    font-weight: 700;
    color: #71717a;
  }
</style>
</head>
<body>

  <!-- Progress Bar -->
  <div class="reel-progress">
    <div id="progressBar" class="reel-progress-fill"></div>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <img src="https://www.thesite.ro/hero-illustration-headphones.webp" class="brand-logo" alt="Logo">
      <span class="brand-name">thesite.ro</span>
    </div>
    <div class="live-tag">
      <div class="pulse-dot"></div>
      <span>Analiză Media</span>
    </div>
  </div>

  <!-- SCENE 1: Hook & Topic -->
  <div id="scene1" class="scene">
    <div>
      <div class="kicker">• PUNCT ORB & SPECTRU MEDIATIC</div>
      <h1 class="story-title">${story.title}</h1>
      
      <div class="bias-box">
        <div class="bias-header">
          <span class="bias-label">Acoperire Publicații</span>
          <span class="bias-count">${totalSources} Surse Verificate</span>
        </div>
        
        <div class="bias-bar-track">
          <div class="bar-seg bar-left" style="width: ${left}%;"></div>
          <div class="bar-seg bar-center" style="width: ${center}%;"></div>
          <div class="bar-seg bar-right" style="width: ${right}%;"></div>
        </div>

        <div class="bias-stats-grid">
          <div class="stat-card stat-left">
            <div class="stat-val">${left}%</div>
            <div class="stat-name">Stânga</div>
          </div>
          <div class="stat-card stat-center">
            <div class="stat-val">${center}%</div>
            <div class="stat-name">Centru</div>
          </div>
          <div class="stat-card stat-right">
            <div class="stat-val">${right}%</div>
            <div class="stat-name">Dreapta</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-row">
      <span>thesite.ro/stiri</span>
      <span>Vezi unghiurile →</span>
    </div>
  </div>

  <!-- SCENE 2: Headlines Comparison -->
  <div id="scene2" class="scene">
    <div>
      <div class="scene-title-row">
        <div class="kicker">• COMPARAȚIE TITLURI</div>
        <h1 class="scene-h1">Același eveniment, <br><span>3 unghiuri diferite</span></h1>
      </div>

      <div class="headline-card">
        <div class="card-arc-accent arc-left"></div>
        <div class="card-top">
          <div class="card-outlet">
            <img src="${headlines.left.logo}" class="outlet-logo" alt="">
            <span class="outlet-name">${headlines.left.outlet}</span>
          </div>
          <span class="card-badge badge-left">Stânga</span>
        </div>
        <div class="card-quote quote-left">„${headlines.left.title}”</div>
      </div>

      <div class="headline-card">
        <div class="card-arc-accent arc-center"></div>
        <div class="card-top">
          <div class="card-outlet">
            <img src="${headlines.center.logo}" class="outlet-logo" alt="">
            <span class="outlet-name">${headlines.center.outlet}</span>
          </div>
          <span class="card-badge badge-center">Centru</span>
        </div>
        <div class="card-quote quote-center">„${headlines.center.title}”</div>
      </div>

      <div class="headline-card">
        <div class="card-arc-accent arc-right"></div>
        <div class="card-top">
          <div class="card-outlet">
            <img src="${headlines.right.logo}" class="outlet-logo" alt="">
            <span class="outlet-name">${headlines.right.outlet}</span>
          </div>
          <span class="card-badge badge-right">Dreapta</span>
        </div>
        <div class="card-quote quote-right">„${headlines.right.title}”</div>
      </div>
    </div>

    <div class="footer-row">
      <span>thesite.ro</span>
      <span>Analiză în timp real →</span>
    </div>
  </div>

  <!-- SCENE 3: Outro / CTA -->
  <div id="scene3" class="scene">
    <div class="outro-box">
      <div class="outro-kicker">• PRESA FĂRĂ FILTRE</div>
      <h1 class="outro-h1">Vezi imaginea completă, <span>fără manipulare.</span></h1>
      <p class="outro-sub">Descoperă unghiurile ascunse și bias-ul politic din spatele fiecărei știri din România.</p>
      
      <div class="cta-pill">
        Citește pe <span>thesite.ro</span> ➔
      </div>
    </div>

    <div class="footer-row" style="margin-top: 40px;">
      <span>Urmărește @thesite.ro</span>
      <span>Salvează pentru mai târziu 🔖</span>
    </div>
  </div>

  <script>
    // Animation controller by normalized time (0.0 to 1.0)
    window.setReelProgress = function(t) {
      document.getElementById('progressBar').style.width = (t * 100) + '%';

      const s1 = document.getElementById('scene1');
      const s2 = document.getElementById('scene2');
      const s3 = document.getElementById('scene3');

      // 0s to 4s: Scene 1 (t: 0 to 0.35)
      // 4s to 8.5s: Scene 2 (t: 0.35 to 0.72)
      // 8.5s to 12s: Scene 3 (t: 0.72 to 1.0)
      if (t < 0.35) {
        s1.style.opacity = '1';
        s1.style.transform = 'translateY(0)';
        s2.style.opacity = '0';
        s2.style.transform = 'translateY(40px)';
        s3.style.opacity = '0';
      } else if (t < 0.72) {
        s1.style.opacity = '0';
        s1.style.transform = 'translateY(-40px)';
        s2.style.opacity = '1';
        s2.style.transform = 'translateY(0)';
        s3.style.opacity = '0';
      } else {
        s1.style.opacity = '0';
        s2.style.opacity = '0';
        s2.style.transform = 'translateY(-40px)';
        s3.style.opacity = '1';
        s3.style.transform = 'scale(1)';
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
