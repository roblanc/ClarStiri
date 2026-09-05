import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert local files to base64 data URIs for instantaneous offline rendering in Playwright
function getBase64DataUri(filePath, mimeType = 'image/png') {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath).toString('base64');
    return `data:${mimeType};base64,${data}`;
  }
  return '';
}

const logoBase64 = getBase64DataUri(path.join(__dirname, '..', 'public', 'logo_minimal.png'), 'image/png');
const storyImageBase64 = getBase64DataUri(path.join(__dirname, '..', 'social_export', 'story_image.jpg'), 'image/jpeg');

const g4LogoBase64 = getBase64DataUri(path.join(__dirname, '..', 'public', 'logos', 'g4media.png'), 'image/png');
const digiLogoBase64 = getBase64DataUri(path.join(__dirname, '..', 'public', 'logos', 'digi24.png'), 'image/png');
const dcnewsLogoBase64 = getBase64DataUri(path.join(__dirname, '..', 'public', 'logos', 'dcnews.png'), 'image/png');

// Story data
const story = {
  id: 'story-20260904-1scu005',
  kicker: 'SPECTRU & ANALIZĂ MEDIA',
  title: 'Planul de pace al lui Trump.',
  subtitle: 'Cum este reflectată vizita emisarilor la Moscova și Kiev în presa din România?',
  bias: { left: 8, center: 59, right: 33 },
  sourcesCount: 12,
  headlines: {
    left: {
      outlet: 'G4Media.ro',
      logo: g4LogoBase64,
      title: 'Emisarii americani Steve Witkoff și Jared Kushner au ajuns la Moscova.',
      time: 'acum 2 ore'
    },
    center: {
      outlet: 'Digi24.ro',
      logo: digiLogoBase64,
      title: 'Începe turneul diplomatic al emisarilor lui Donald Trump în Moscova și Kiev.',
      time: 'acum 3 ore'
    },
    right: {
      outlet: 'DCNews.ro',
      logo: dcnewsLogoBase64,
      title: 'Planul de pace ajunge la Kremlin. Experții avertizează: «Să nu fim prea optimiști»',
      time: 'acum 4 ore'
    }
  }
};

function buildHtml() {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<title>ClarStiri Mock Reel</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600;1,700;1,800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  html, body {
    width: 1080px;
    height: 1920px;
    background: #0f1115;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #0f172a;
    overflow: hidden;
    position: relative;
    -webkit-font-smoothing: antialiased;
  }

  /* Reel Outer Canvas - Matches the user's phone card mockup */
  .device-screen {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 980px;
    height: 1820px;
    background: #ffffff;
    border-radius: 56px;
    overflow: hidden;
    box-shadow: 0 40px 100px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 54px 50px 50px 50px;
  }

  /* Reel Progress Bar */
  .top-progress-track {
    position: absolute;
    top: 24px;
    left: 60px;
    right: 60px;
    height: 6px;
    background: rgba(0,0,0,0.08);
    border-radius: 9999px;
    overflow: hidden;
    z-index: 100;
  }
  .top-progress-fill {
    height: 100%;
    width: 0%;
    background: #2563eb;
    border-radius: 9999px;
  }

  /* Global Screen Header */
  .screen-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 10px;
    padding-bottom: 24px;
    border-bottom: 1px solid #f1f5f9;
  }
  .brand-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .brand-mascot {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }
  .brand-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 34px;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #09090b;
  }
  .brand-time {
    font-size: 26px;
    font-weight: 700;
    color: #71717a;
    font-variant-numeric: tabular-nums;
  }

  /* SCENE CONTAINER */
  .scene {
    flex: 1;
    display: none;
    flex-direction: column;
    justify-content: space-between;
    padding-top: 36px;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .scene.active {
    display: flex;
    opacity: 1;
    transform: translateY(0);
  }

  /* ========================================================
     LAYOUT 1: EDITORIAL HOOK + BIAS SPECTRUM (SCENE 1)
     ======================================================== */
  .kicker-blue {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #2563eb;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .kicker-dot {
    width: 10px;
    height: 10px;
    background: #2563eb;
    border-radius: 50%;
    display: inline-block;
  }

  .serif-headline {
    font-family: 'Playfair Display', serif;
    font-size: 68px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: #09090b;
    margin-bottom: 20px;
  }

  .subtitle-text {
    font-size: 27px;
    font-weight: 500;
    line-height: 1.35;
    color: #475569;
    margin-bottom: 36px;
  }

  .image-card-container {
    width: 100%;
    height: 720px;
    border-radius: 36px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12);
  }
  .image-card-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .image-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%);
  }

  /* Segmented Bias Bar */
  .bias-bar-wrap {
    display: flex;
    gap: 12px;
    margin-top: 36px;
  }
  .bias-pill {
    flex: 1;
    height: 76px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .bias-pill.left {
    background: #2563eb;
    color: #ffffff;
    flex: 0.8;
  }
  .bias-pill.center {
    background: #f1f5f9;
    color: #1e293b;
    border: 1.5px solid #e2e8f0;
    flex: 1.4;
  }
  .bias-pill.right {
    background: #ef4444;
    color: #ffffff;
    flex: 1;
  }

  /* Footer Row */
  .scene-footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 30px;
    padding-top: 10px;
  }
  .footer-caption {
    font-size: 23px;
    font-weight: 700;
    color: #1e293b;
  }
  .circle-arrow-btn {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: #09090b;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  }

  /* ========================================================
     LAYOUT 2: THREE-HEADLINE PERSPECTIVES (SCENE 2)
     ======================================================== */
  .scene2-title {
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #0f172a;
    margin-bottom: 34px;
  }

  .perspective-cards-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex: 1;
  }
  .perspective-card {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 28px;
    padding: 32px 34px;
    box-shadow: 0 10px 30px -5px rgba(0,0,0,0.04);
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .perspective-card.border-blue {
    border-left: 8px solid #2563eb;
  }
  .perspective-card.border-gray {
    border-left: 8px solid #64748b;
  }
  .perspective-card.border-red {
    border-left: 8px solid #ef4444;
  }

  .pcard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .pcard-outlet {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .pcard-outlet-logo {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid #e2e8f0;
  }
  .pcard-outlet-name {
    font-size: 24px;
    font-weight: 800;
    color: #09090b;
  }
  .pcard-badge {
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 6px 18px;
    border-radius: 9999px;
  }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .badge-gray { background: #f1f5f9; color: #334155; }
  .badge-red { background: #fee2e2; color: #b91c1c; }

  .pcard-quote {
    font-family: 'Playfair Display', serif;
    font-size: 27px;
    line-height: 1.35;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.01em;
  }
  .pcard-time {
    font-size: 18px;
    font-weight: 600;
    color: #94a3b8;
  }

  .full-cta-pill {
    width: 100%;
    height: 84px;
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 800;
    color: #09090b;
    gap: 14px;
    margin-top: 30px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.03);
  }

  /* ========================================================
     LAYOUT 3: DATA-FIRST SPECTRUM (SCENE 3)
     ======================================================== */
  .data-stats-row {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    margin: 60px 0 30px 0;
  }
  .data-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .data-number {
    font-size: 88px;
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1;
    margin-bottom: 12px;
  }
  .data-number.blue { color: #2563eb; }
  .data-number.dark { color: #09090b; }
  .data-number.red { color: #ef4444; }

  .data-label {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-bottom: 18px;
  }
  .data-label.blue { color: #2563eb; }
  .data-label.dark { color: #64748b; }
  .data-label.red { color: #ef4444; }

  .data-bar-track {
    width: 100%;
    height: 14px;
    background: #f1f5f9;
    border-radius: 9999px;
    overflow: hidden;
  }
  .data-bar-fill {
    height: 100%;
    border-radius: 9999px;
  }
  .bar-blue { background: #2563eb; }
  .bar-dark { background: #09090b; }
  .bar-red { background: #ef4444; }

  .data-desc {
    font-size: 24px;
    font-weight: 500;
    line-height: 1.45;
    color: #64748b;
    margin-top: 20px;
  }

  /* ========================================================
     LAYOUT 8: BRANDED OUTRO / CTA (SCENE 4)
     ======================================================== */
  .outro-center-block {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 20px;
  }
  .outro-mascot-circle {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.04);
  }
  .outro-mascot-circle img {
    width: 120px;
    height: 120px;
    object-fit: contain;
  }
  .outro-brand-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 64px;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #09090b;
    margin-bottom: 12px;
  }
  .outro-rule-wrap {
    display: flex;
    align-items: center;
    gap: 20px;
    width: 80%;
    margin-bottom: 48px;
  }
  .outro-rule-line {
    flex: 1;
    height: 1px;
    background: #cbd5e1;
  }
  .outro-rule-text {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #64748b;
  }

  .outro-big-quote {
    font-family: 'Playfair Display', serif;
    font-size: 56px;
    font-weight: 900;
    line-height: 1.15;
    color: #09090b;
    margin-bottom: 24px;
  }
  .outro-big-quote em {
    font-style: italic;
    color: #2563eb;
  }

  .outro-explain {
    font-size: 24px;
    font-weight: 500;
    line-height: 1.4;
    color: #64748b;
    max-width: 700px;
    margin-bottom: 50px;
  }

  .black-cta-btn {
    width: 100%;
    height: 94px;
    background: #09090b;
    color: #ffffff;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 0.02em;
    gap: 16px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.25);
    margin-top: 24px;
  }

</style>
</head>
<body>

  <!-- Phone Mockup Container -->
  <div class="device-screen">
    
    <!-- Top Progress Bar (Reel Scrub) -->
    <div class="top-progress-track">
      <div id="progressFill" class="top-progress-fill"></div>
    </div>

    <!-- Header -->
    <div class="screen-header">
      <div class="brand-left">
        <img src="${logoBase64}" class="brand-mascot" alt="Logo">
        <span class="brand-name">thesite.ro</span>
      </div>
      <div class="brand-time">0:16</div>
    </div>

    <!-- ========================================================
         SCENE 1: EDITORIAL HOOK + BIAS SPECTRUM
         ======================================================== -->
    <div id="scene1" class="scene active">
      <div>
        <div class="kicker-blue">
          <span class="kicker-dot"></span> ${story.kicker}
        </div>
        <h1 class="serif-headline">${story.title}</h1>
        <p class="subtitle-text">${story.subtitle}</p>
      </div>

      <div class="image-card-container">
        <img src="${storyImageBase64}" alt="News Image">
        <div class="image-card-overlay"></div>
      </div>

      <div>
        <div class="bias-bar-wrap">
          <div class="bias-pill left">STÂNGA ${story.bias.left}%</div>
          <div class="bias-pill center">CENTRU ${story.bias.center}%</div>
          <div class="bias-pill right">DREAPTA ${story.bias.right}%</div>
        </div>

        <div class="scene-footer-row">
          <span class="footer-caption">Știri din toate perspectivele.</span>
          <div class="circle-arrow-btn">➔</div>
        </div>
      </div>
    </div>

    <!-- ========================================================
         SCENE 2: THREE-HEADLINE PERSPECTIVES
         ======================================================== -->
    <div id="scene2" class="scene">
      <div class="scene2-title">ACELEAȘI EVENIMENTE, 3 PERSPECTIVE DIFERITE.</div>

      <div class="perspective-cards-stack">
        <!-- Left Card -->
        <div class="perspective-card border-blue">
          <div class="pcard-header">
            <div class="pcard-outlet">
              <img src="${story.headlines.left.logo}" class="pcard-outlet-logo" alt="">
              <span class="pcard-outlet-name">${story.headlines.left.outlet}</span>
            </div>
            <span class="pcard-badge badge-blue">STÂNGA</span>
          </div>
          <div class="pcard-quote">„${story.headlines.left.title}”</div>
          <div class="pcard-time">${story.headlines.left.time}</div>
        </div>

        <!-- Center Card -->
        <div class="perspective-card border-gray">
          <div class="pcard-header">
            <div class="pcard-outlet">
              <img src="${story.headlines.center.logo}" class="pcard-outlet-logo" alt="">
              <span class="pcard-outlet-name">${story.headlines.center.outlet}</span>
            </div>
            <span class="pcard-badge badge-gray">CENTRU</span>
          </div>
          <div class="pcard-quote">„${story.headlines.center.title}”</div>
          <div class="pcard-time">${story.headlines.center.time}</div>
        </div>

        <!-- Right Card -->
        <div class="perspective-card border-red">
          <div class="pcard-header">
            <div class="pcard-outlet">
              <img src="${story.headlines.right.logo}" class="pcard-outlet-logo" alt="">
              <span class="pcard-outlet-name">${story.headlines.right.outlet}</span>
            </div>
            <span class="pcard-badge badge-red">DREAPTA</span>
          </div>
          <div class="pcard-quote">„${story.headlines.right.title}”</div>
          <div class="pcard-time">${story.headlines.right.time}</div>
        </div>
      </div>

      <div class="full-cta-pill">
        <span>Citește analiza completă</span>
        <span>➔</span>
      </div>
    </div>

    <!-- ========================================================
         SCENE 3: DATA-FIRST SPECTRUM CARD
         ======================================================== -->
    <div id="scene3" class="scene">
      <div>
        <div class="kicker-blue">
          <span class="kicker-dot"></span> ANALIZĂ MEDIA
        </div>
        <h1 class="serif-headline">Cum a fost reflectat subiectul în presă?</h1>
        <p class="subtitle-text">Analizăm ${story.sourcesCount} surse din principalele redacții din România.</p>
      </div>

      <div>
        <div class="data-stats-row">
          <div class="data-col">
            <div class="data-number blue" id="numLeft">${story.bias.left}%</div>
            <div class="data-label blue">STÂNGA</div>
            <div class="data-bar-track">
              <div class="data-bar-fill bar-blue" id="barLeft" style="width: ${story.bias.left}%;"></div>
            </div>
          </div>
          <div class="data-col">
            <div class="data-number dark" id="numCenter">${story.bias.center}%</div>
            <div class="data-label dark">CENTRU</div>
            <div class="data-bar-track">
              <div class="data-bar-fill bar-dark" id="barCenter" style="width: ${story.bias.center}%;"></div>
            </div>
          </div>
          <div class="data-col">
            <div class="data-number red" id="numRight">${story.bias.right}%</div>
            <div class="data-label red">DREAPTA</div>
            <div class="data-bar-track">
              <div class="data-bar-fill bar-red" id="barRight" style="width: ${story.bias.right}%;"></div>
            </div>
          </div>
        </div>

        <p class="data-desc">
          Procentajul publicațiilor analizate despre propunerea de pace a emisarilor SUA la Moscova și Kiev.
        </p>
      </div>

      <div class="full-cta-pill">
        <span>Vezi toate detaliile pe thesite.ro</span>
        <span>➔</span>
      </div>
    </div>

    <!-- ========================================================
         SCENE 4: BRANDED OUTRO / CTA
         ======================================================== -->
    <div id="scene4" class="scene">
      <div class="outro-center-block">
        <div class="outro-mascot-circle">
          <img src="${logoBase64}" alt="Logo">
        </div>
        <div class="outro-brand-title">thesite.ro</div>
        
        <div class="outro-rule-wrap">
          <div class="outro-rule-line"></div>
          <span class="outro-rule-text">ȘTIRI DIN TOATE PERSPECTIVELE</span>
          <div class="outro-rule-line"></div>
        </div>

        <div class="outro-big-quote">
          Dincolo de titluri.<br>
          <em>Mai aproape de adevăr.</em>
        </div>

        <p class="outro-explain">
          Analizăm presa din România din toate unghiurile ca tu să vezi imaginea completă.
        </p>

        <div class="bias-bar-wrap" style="width: 100%; margin-top: 0;">
          <div class="bias-pill left">STÂNGA</div>
          <div class="bias-pill center">CENTRU</div>
          <div class="bias-pill right">DREAPTA</div>
        </div>

        <div class="black-cta-btn">
          <span>Citește pe thesite.ro</span>
          <span>➔</span>
        </div>
      </div>
    </div>

  </div>

  <script>
    window.setReelProgress = function(t) {
      document.getElementById('progressFill').style.width = (t * 100) + '%';

      const s1 = document.getElementById('scene1');
      const s2 = document.getElementById('scene2');
      const s3 = document.getElementById('scene3');
      const s4 = document.getElementById('scene4');

      // 4 scenes over 16 seconds
      if (t < 0.28) {
        // Scene 1: 0 - 4.5s
        s1.className = 'scene active';
        s2.className = 'scene';
        s3.className = 'scene';
        s4.className = 'scene';
      } else if (t < 0.56) {
        // Scene 2: 4.5s - 9.0s
        s1.className = 'scene';
        s2.className = 'scene active';
        s3.className = 'scene';
        s4.className = 'scene';
      } else if (t < 0.80) {
        // Scene 3: 9.0s - 12.8s
        s1.className = 'scene';
        s2.className = 'scene';
        s3.className = 'scene active';
        s4.className = 'scene';
      } else {
        // Scene 4: 12.8s - 16.0s
        s1.className = 'scene';
        s2.className = 'scene';
        s3.className = 'scene';
        s4.className = 'scene active';
      }
    };

    window.showScene = function(sceneNumber) {
      [1, 2, 3, 4].forEach(n => {
        const el = document.getElementById('scene' + n);
        if (el) el.className = (n === sceneNumber) ? 'scene active' : 'scene';
      });
      document.getElementById('progressFill').style.width = ((sceneNumber / 4) * 100) + '%';
    };
  </script>
</body>
</html>`;
}

async function renderMockReel() {
  const html = buildHtml();
  const exportDir = path.join(__dirname, '..', 'social_export', 'latest');
  const tempDir = path.join(exportDir, 'temp_mock_frames');
  fs.mkdirSync(tempDir, { recursive: true });

  console.log('🚀 Launching Playwright to render mock reel scenes...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(800);

  // 1. Capture high-res static images for each scene
  console.log('📸 Capturing 4 high-res static scene slides...');
  for (let sceneNum = 1; sceneNum <= 4; sceneNum++) {
    await page.evaluate(n => window.showScene(n), sceneNum);
    await page.waitForTimeout(200);
    const sceneFile = path.join(exportDir, `mock_scene${sceneNum}.png`);
    await page.screenshot({ path: sceneFile, type: 'png' });
    console.log(`  ✓ Saved Scene ${sceneNum}: ${sceneFile}`);
  }

  // 2. Capture animation frames for the 16s video
  const fps = 24;
  const durationSeconds = 16;
  const totalFrames = fps * durationSeconds;

  console.log(`🎬 Capturing ${totalFrames} frames for 16-second Reel at ${fps} FPS...`);
  for (let i = 0; i < totalFrames; i++) {
    const t = i / totalFrames;
    await page.evaluate(progress => window.setReelProgress(progress), t);
    const frameFile = path.join(tempDir, `frame_${String(i).padStart(4, '0')}.jpg`);
    await page.screenshot({ path: frameFile, type: 'jpeg', quality: 90 });
    if (i % 24 === 0) {
      process.stdout.write(`  Frame ${i}/${totalFrames} (${Math.round(t * 100)}%)\r`);
    }
  }
  console.log(`\n✓ All ${totalFrames} frames captured!`);
  await browser.close();

  // 3. Encode video with FFmpeg
  console.log('🎞️ Encoding MP4 video with FFmpeg...');
  const videoOutput = path.join(exportDir, 'mock_reel.mp4');
  const ffmpegCmd = `ffmpeg -y -framerate ${fps} -i "${tempDir}/frame_%04d.jpg" -c:v libx264 -preset fast -profile:v high -level:v 4.2 -pix_fmt yuv420p -movflags +faststart "${videoOutput}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  // 4. Also generate an animated WebP preview (at 360x640 for lightweight preview in IDE & markdown)
  console.log('🎞️ Generating animated WebP preview for markdown display...');
  const webpOutput = path.join(exportDir, 'mock_reel_preview.webp');
  const webpCmd = `ffmpeg -y -i "${videoOutput}" -vf "fps=12,scale=405:720:flags=lanczos" -vcodec libwebp -lossless 0 -compression_level 4 -q:v 70 -loop 0 "${webpOutput}"`;
  execSync(webpCmd, { stdio: 'inherit' });

  // Cleanup temp frames
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log(`\n🎉 Success! Mock Reel generated at: ${videoOutput}`);
  console.log(`🎉 WebP preview generated at: ${webpOutput}`);
}

renderMockReel().catch(err => {
  console.error('❌ Error rendering mock reel:', err);
  process.exit(1);
});
