import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Article data from thesite.ro
const story = {
  kicker: 'SPECTRU & ANALIZĂ MEDIA',
  titlePart1: 'Planul de pace',
  titlePart2: 'la Moscova.',
  subtitle: 'Cum este reflectată trimiterea emisarilor speciali ai lui Donald Trump în presa din România?',
  bias: { left: 8, center: 59, right: 33 },
  headlines: {
    left: {
      outlet: 'G4Media.ro',
      logo: g4LogoBase64,
      title: '„Emisarii americani Steve Witkoff și Jared Kushner au ajuns la Moscova.”',
      time: 'acum 2 ore'
    },
    center: {
      outlet: 'Digi24.ro',
      logo: digiLogoBase64,
      title: '„Începe turneul diplomatic al emisarilor lui Donald Trump în Moscova și Kiev.”',
      time: 'acum 3 ore'
    },
    right: {
      outlet: 'DCNews.ro',
      logo: dcnewsLogoBase64,
      title: '„Planul de pace ajunge la Kremlin. Experții: «Să nu fim prea optimiști»”',
      time: 'acum 4 ore'
    }
  }
};

function buildHtml() {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<title>New Mock Design</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: 1080px;
    height: 1920px;
    background: #ffffff;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #0f172a;
    overflow: hidden;
    position: relative;
    -webkit-font-smoothing: antialiased;
  }

  /* Full Screen 1080x1920 Container (Edge-to-edge as in mockups) */
  .reel-screen {
    position: absolute;
    inset: 0;
    width: 1080px;
    height: 1920px;
    background: #ffffff;
    display: none;
    flex-direction: column;
    justify-content: space-between;
    padding: 100px 72px 100px 72px; /* Clean safe zone padding */
  }
  .reel-screen.active {
    display: flex;
  }

  /* Reel Progress Bar at very top */
  .story-progress {
    position: absolute;
    top: 40px;
    left: 72px;
    right: 72px;
    height: 6px;
    background: #e2e8f0;
    border-radius: 9999px;
    overflow: hidden;
    z-index: 100;
  }
  .story-progress-fill {
    height: 100%;
    width: 0%;
    background: #2563eb;
    border-radius: 9999px;
  }

  /* Universal Mock Header */
  .mock-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 50px;
  }
  .brand-group {
    display: flex;
    align-items: center;
    gap: 18px;
  }
  .brand-logo {
    width: 58px;
    height: 58px;
    object-fit: contain;
  }
  .brand-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 40px;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #000000;
  }
  .timestamp-tag {
    font-size: 30px;
    font-weight: 700;
    color: #71717a;
    letter-spacing: -0.01em;
  }

  /* ========================================================
     DESIGN TYPE 1: EDITORIAL HOOK + BIAS SPECTRUM (Mock 1)
     ======================================================== */
  .mock1-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: space-between;
  }

  .kicker-row {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #2563eb;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .headline-serif {
    font-family: 'Playfair Display', serif;
    font-size: 88px;
    font-weight: 900;
    line-height: 1.06;
    letter-spacing: -0.03em;
    color: #000000;
    margin-bottom: 26px;
  }

  .subhead-sans {
    font-size: 32px;
    font-weight: 500;
    line-height: 1.38;
    color: #334155;
    margin-bottom: 40px;
    max-width: 900px;
  }

  /* Photo box occupying bottom section */
  .mock1-photo-card {
    width: 100%;
    height: 820px;
    border-radius: 40px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 25px 60px -15px rgba(0,0,0,0.18);
  }
  .mock1-photo-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .mock1-photo-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.85) 100%);
  }
  .mock1-photo-caption {
    position: absolute;
    bottom: 30px;
    left: 36px;
    right: 36px;
    color: #ffffff;
    font-size: 24px;
    font-weight: 600;
    line-height: 1.3;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  }

  /* The 3-Segmented Bias Spectrum Bar */
  .bias-spectrum-container {
    margin-top: 36px;
  }
  .bias-spectrum-bar {
    display: flex;
    width: 100%;
    height: 82px;
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0,0,0,0.06);
    border: 2px solid #e2e8f0;
  }
  .bias-segment {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .bias-segment.left {
    background: #2563eb;
    color: #ffffff;
    flex: 0.85;
  }
  .bias-segment.center {
    background: #ffffff;
    color: #0f172a;
    border-left: 2px solid #e2e8f0;
    border-right: 2px solid #e2e8f0;
    flex: 1.3;
  }
  .bias-segment.right {
    background: #ef4444;
    color: #ffffff;
    flex: 1;
  }

  /* Bottom action row */
  .mock-bottom-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 28px;
    padding: 0 4px;
  }
  .bottom-tagline {
    font-size: 26px;
    font-weight: 700;
    color: #1e293b;
  }
  .bottom-circle-arrow {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: #000000;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
  }

  /* ========================================================
     DESIGN TYPE 2: THREE-HEADLINE PERSPECTIVES (Mock 2)
     ======================================================== */
  #screen2 {
    background: #f8fafc;
  }
  .mock2-title {
    font-size: 34px;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #0f172a;
    line-height: 1.25;
    margin-bottom: 46px;
  }

  .headlines-stack {
    display: flex;
    flex-direction: column;
    gap: 32px;
    flex: 1;
  }

  .headline-bubble-card {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 32px;
    padding: 40px 42px;
    box-shadow: 0 12px 35px -8px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    gap: 22px;
    position: relative;
  }
  .headline-bubble-card.stanga {
    border-left: 10px solid #2563eb;
  }
  .headline-bubble-card.centru {
    border-left: 10px solid #94a3b8;
  }
  .headline-bubble-card.dreapta {
    border-left: 10px solid #ef4444;
  }

  .bubble-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .bubble-outlet-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .bubble-outlet-logo {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid #e2e8f0;
  }
  .bubble-outlet-name {
    font-size: 28px;
    font-weight: 800;
    color: #09090b;
  }

  .bias-pill-badge {
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 8px 22px;
    border-radius: 9999px;
  }
  .badge-stanga { background: #dbeafe; color: #1e40af; }
  .badge-centru { background: #f1f5f9; color: #334155; }
  .badge-dreapta { background: #fee2e2; color: #b91c1c; }

  .bubble-quote-text {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    line-height: 1.34;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.01em;
  }

  .bubble-time-ago {
    font-size: 20px;
    font-weight: 600;
    color: #94a3b8;
  }

  .mock2-cta-btn {
    width: 100%;
    height: 96px;
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 800;
    color: #09090b;
    gap: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.04);
    margin-top: 40px;
  }

</style>
</head>
<body>

  <!-- ========================================================
       SCREEN 1: EXACT MOCKUP 1 (EDITORIAL HOOK + BIAS SPECTRUM)
       ======================================================== -->
  <div id="screen1" class="reel-screen active">
    <div class="story-progress">
      <div id="progressFill" class="story-progress-fill"></div>
    </div>

    <!-- Header -->
    <div class="mock-header">
      <div class="brand-group">
        <img src="${logoBase64}" class="brand-logo" alt="">
        <span class="brand-title">thesite.ro</span>
      </div>
      <div class="timestamp-tag">0:16</div>
    </div>

    <!-- Editorial Hook Body -->
    <div class="mock1-content">
      <div>
        <div class="kicker-row">
          • ${story.kicker}
        </div>
        <h1 class="headline-serif">
          ${story.titlePart1}<br>${story.titlePart2}
        </h1>
        <p class="subhead-sans">${story.subtitle}</p>
      </div>

      <!-- Photo Card -->
      <div class="mock1-photo-card">
        <img src="${storyImageBase64}" alt="">
        <div class="mock1-photo-gradient"></div>
        <div class="mock1-photo-caption">Întâlnirea oficială dintre Vladimir Putin și Steve Witkoff la Moscova.</div>
      </div>

      <!-- Bias Spectrum & Footer -->
      <div class="bias-spectrum-container">
        <div class="bias-spectrum-bar">
          <div class="bias-segment left">STÂNGA ${story.bias.left}%</div>
          <div class="bias-segment center">CENTRU ${story.bias.center}%</div>
          <div class="bias-segment right">DREAPTA ${story.bias.right}%</div>
        </div>

        <div class="mock-bottom-action">
          <span class="bottom-tagline">Știri din toate perspectivele.</span>
          <div class="bottom-circle-arrow">➔</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================
       SCREEN 2: EXACT MOCKUP 2 (THREE-HEADLINE COMPARISON)
       ======================================================== -->
  <div id="screen2" class="reel-screen">
    <div class="story-progress">
      <div class="story-progress-fill" style="width: 100%;"></div>
    </div>

    <!-- Header -->
    <div class="mock-header">
      <div class="brand-group">
        <img src="${logoBase64}" class="brand-logo" alt="">
        <span class="brand-title">thesite.ro</span>
      </div>
      <div class="timestamp-tag">0:16</div>
    </div>

    <div class="mock2-title">
      ACELEAȘI EVENIMENTE,<br>3 PERSPECTIVE DIFERITE.
    </div>

    <div class="headlines-stack">
      <!-- Card 1: Stânga -->
      <div class="headline-bubble-card stanga">
        <div class="bubble-top-row">
          <div class="bubble-outlet-info">
            <img src="${story.headlines.left.logo}" class="bubble-outlet-logo" alt="">
            <span class="bubble-outlet-name">${story.headlines.left.outlet}</span>
          </div>
          <span class="bias-pill-badge badge-stanga">STÂNGA</span>
        </div>
        <div class="bubble-quote-text">${story.headlines.left.title}</div>
        <div class="bubble-time-ago">${story.headlines.left.time}</div>
      </div>

      <!-- Card 2: Centru -->
      <div class="headline-bubble-card centru">
        <div class="bubble-top-row">
          <div class="bubble-outlet-info">
            <img src="${story.headlines.center.logo}" class="bubble-outlet-logo" alt="">
            <span class="bubble-outlet-name">${story.headlines.center.outlet}</span>
          </div>
          <span class="bias-pill-badge badge-centru">CENTRU</span>
        </div>
        <div class="bubble-quote-text">${story.headlines.center.title}</div>
        <div class="bubble-time-ago">${story.headlines.center.time}</div>
      </div>

      <!-- Card 3: Dreapta -->
      <div class="headline-bubble-card dreapta">
        <div class="bubble-top-row">
          <div class="bubble-outlet-info">
            <img src="${story.headlines.right.logo}" class="bubble-outlet-logo" alt="">
            <span class="bubble-outlet-name">${story.headlines.right.outlet}</span>
          </div>
          <span class="bias-pill-badge badge-dreapta">DREAPTA</span>
        </div>
        <div class="bubble-quote-text">${story.headlines.right.title}</div>
        <div class="bubble-time-ago">${story.headlines.right.time}</div>
      </div>
    </div>

    <div class="mock2-cta-btn">
      <span>Citește analiza completă</span>
      <span>➔</span>
    </div>
  </div>

  <script>
    window.setReelProgress = function(t) {
      document.getElementById('progressFill').style.width = (t * 100) + '%';
      const s1 = document.getElementById('screen1');
      const s2 = document.getElementById('screen2');

      if (t < 0.50) {
        s1.className = 'reel-screen active';
        s2.className = 'reel-screen';
      } else {
        s1.className = 'reel-screen';
        s2.className = 'reel-screen active';
      }
    };

    window.showScreen = function(num) {
      document.getElementById('screen1').className = (num === 1) ? 'reel-screen active' : 'reel-screen';
      document.getElementById('screen2').className = (num === 2) ? 'reel-screen active' : 'reel-screen';
    };
  </script>
</body>
</html>`;
}

async function render() {
  const html = buildHtml();
  const exportDir = path.join(__dirname, '..', 'social_export', 'latest');
  const tempDir = path.join(exportDir, 'temp_newmock_frames');
  fs.mkdirSync(tempDir, { recursive: true });

  console.log('🚀 Launching Playwright to render exact new mock designs...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(800);

  // 1. Capture exact static slide 1 (Editorial Hook + Bias Spectrum)
  await page.evaluate(() => window.showScreen(1));
  await page.waitForTimeout(200);
  const slide1File = path.join(exportDir, 'design_mock1_editorial_hook.png');
  await page.screenshot({ path: slide1File, type: 'png' });
  console.log('✓ Saved Design Mock 1 (Editorial Hook + Bias Spectrum):', slide1File);

  // 2. Capture exact static slide 2 (Three-Headline Comparison)
  await page.evaluate(() => window.showScreen(2));
  await page.waitForTimeout(200);
  const slide2File = path.join(exportDir, 'design_mock2_three_headlines.png');
  await page.screenshot({ path: slide2File, type: 'png' });
  console.log('✓ Saved Design Mock 2 (Three-Headline Comparison):', slide2File);

  // 3. Render 15-second Reel (24 FPS = 360 frames) transitioning from Mock 1 to Mock 2
  const fps = 24;
  const durationSeconds = 15;
  const totalFrames = fps * durationSeconds;

  console.log(`🎬 Capturing ${totalFrames} frames for 15-second Reel at ${fps} FPS...`);
  for (let i = 0; i < totalFrames; i++) {
    const t = i / totalFrames;
    await page.evaluate(progress => window.setReelProgress(progress), t);
    const frameFile = path.join(tempDir, `frame_${String(i).padStart(4, '0')}.jpg`);
    await page.screenshot({ path: frameFile, type: 'jpeg', quality: 90 });
    if (i % 30 === 0) {
      process.stdout.write(`  Frame ${i}/${totalFrames} (${Math.round(t * 100)}%)\r`);
    }
  }
  console.log(`\n✓ All ${totalFrames} frames captured!`);
  await browser.close();

  // 4. Encode MP4 with FFmpeg
  const videoOutput = path.join(exportDir, 'new_mock_reel.mp4');
  console.log('🎞️ Encoding MP4 video with FFmpeg...');
  const ffmpegCmd = `ffmpeg -y -framerate ${fps} -i "${tempDir}/frame_%04d.jpg" -c:v libx264 -preset fast -profile:v high -level:v 4.2 -pix_fmt yuv420p -movflags +faststart "${videoOutput}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  // 5. Generate high-quality GIF preview
  console.log('🎞️ Generating GIF preview...');
  const gifOutput = path.join(exportDir, 'new_mock_reel.gif');
  const gifCmd = `ffmpeg -y -i "${videoOutput}" -vf "fps=10,scale=360:640:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${gifOutput}"`;
  execSync(gifCmd, { stdio: 'inherit' });

  // Cleanup temp
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('\n🎉 All done!');
  console.log('  Video:', videoOutput);
  console.log('  GIF:', gifOutput);
}

render().catch(err => {
  console.error('❌ Error rendering new mock design:', err);
  process.exit(1);
});
