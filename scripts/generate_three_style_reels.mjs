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

// Story data
const story = {
  kicker: 'SPECTRU & ANALIZĂ MEDIA',
  titlePart1: 'Planul de pace',
  titlePart2: 'la Moscova.',
  subtitle: 'Cum este reflectată trimiterea emisarilor speciali ai lui Donald Trump în presa din România?',
  bias: { left: 8, center: 59, right: 33 },
  quote: '„Planul este pe masă. Există o șansă reală să ajungem la o înțelegere istorică pentru încheierea războiului.”',
  speaker: 'DONALD TRUMP',
  speakerRole: 'PREȘEDINTE SUA • MISIUNEA WITKOFF & KUSHNER',
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
      title: '„Planul de pace ajunge la Kremlin. Experții avertizează: «Să nu fim prea optimiști»”',
      time: 'acum 4 ore'
    }
  }
};

// ==========================================================
// STYLE 1: EDITORIAL HOOK + BIAS SPECTRUM (Mockup 1)
// ==========================================================
function getStyle1Html() {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1080px; height: 1920px; background: #ffffff;
    font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a;
    overflow: hidden; position: relative; -webkit-font-smoothing: antialiased;
  }
  .screen {
    width: 1080px; height: 1920px; padding: 90px 72px 90px 72px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .progress-track {
    position: absolute; top: 36px; left: 72px; right: 72px; height: 6px;
    background: #e2e8f0; border-radius: 9999px; overflow: hidden;
  }
  .progress-fill { height: 100%; width: 0%; background: #2563eb; }
  .header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;
  }
  .brand { display: flex; align-items: center; gap: 18px; }
  .brand-logo { width: 56px; height: 56px; object-fit: contain; }
  .brand-title { font-size: 38px; font-weight: 900; letter-spacing: -0.03em; color: #000; }
  .timestamp { font-size: 30px; font-weight: 700; color: #71717a; }

  .kicker {
    font-size: 22px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase;
    color: #2563eb; margin-bottom: 24px;
  }
  .headline {
    font-family: 'Playfair Display', serif; font-size: 88px; font-weight: 900;
    line-height: 1.06; letter-spacing: -0.03em; color: #000; margin-bottom: 24px;
  }
  .subhead {
    font-size: 32px; font-weight: 500; line-height: 1.38; color: #334155; margin-bottom: 36px;
  }

  .photo-card {
    width: 100%; height: 860px; border-radius: 40px; overflow: hidden; position: relative;
    box-shadow: 0 25px 60px -15px rgba(0,0,0,0.18);
  }
  .photo-card img {
    width: 100%; height: 100%; object-fit: cover;
    transform: scale(1); transition: transform 0.1s linear;
  }
  .photo-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.85) 100%);
  }
  .photo-caption {
    position: absolute; bottom: 32px; left: 36px; right: 36px; color: #fff;
    font-size: 24px; font-weight: 600; line-height: 1.3; text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  }

  .bias-bar {
    display: flex; width: 100%; height: 82px; border-radius: 22px; overflow: hidden;
    margin-top: 36px; border: 2px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.06);
  }
  .bias-seg {
    flex: 1; display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase;
  }
  .bias-seg.left { background: #2563eb; color: #fff; flex: 0.85; }
  .bias-seg.center { background: #fff; color: #0f172a; border-left: 2px solid #e2e8f0; border-right: 2px solid #e2e8f0; flex: 1.3; }
  .bias-seg.right { background: #ef4444; color: #fff; flex: 1; }

  .footer-action {
    display: flex; justify-content: space-between; align-items: center; margin-top: 28px;
  }
  .footer-text { font-size: 26px; font-weight: 700; color: #1e293b; }
  .circle-btn {
    width: 72px; height: 72px; border-radius: 50%; background: #000; color: #fff;
    display: flex; align-items: center; justify-content: center; font-size: 32px;
  }
</style>
</head>
<body>
  <div class="progress-track"><div id="pFill" class="progress-fill"></div></div>
  <div class="screen">
    <div>
      <div class="header">
        <div class="brand">
          <img src="${logoBase64}" class="brand-logo" alt="">
          <span class="brand-title">thesite.ro</span>
        </div>
        <div class="timestamp">0:16</div>
      </div>
      <div class="kicker">• ${story.kicker}</div>
      <h1 class="headline">${story.titlePart1}<br>${story.titlePart2}</h1>
      <p class="subhead">${story.subtitle}</p>
    </div>

    <div class="photo-card">
      <img id="zoomImg" src="${storyImageBase64}" alt="">
      <div class="photo-gradient"></div>
      <div class="photo-caption">Misiunea diplomatică a SUA la Moscova pentru încheierea conflictului.</div>
    </div>

    <div>
      <div class="bias-bar">
        <div class="bias-seg left">STÂNGA ${story.bias.left}%</div>
        <div class="bias-seg center">CENTRU ${story.bias.center}%</div>
        <div class="bias-seg right">DREAPTA ${story.bias.right}%</div>
      </div>
      <div class="footer-action">
        <span class="footer-text">Știri din toate perspectivele.</span>
        <div class="circle-btn">➔</div>
      </div>
    </div>
  </div>

  <script>
    window.setProgress = function(t) {
      document.getElementById('pFill').style.width = (t * 100) + '%';
      const zoom = 1 + (t * 0.08);
      document.getElementById('zoomImg').style.transform = 'scale(' + zoom + ')';
    };
  </script>
</body>
</html>`;
}

// ==========================================================
// STYLE 2: PERSPECTIVE STACK / 3 HEADLINES (Mockup 2)
// ==========================================================
function getStyle2Html() {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1080px; height: 1920px; background: #f8fafc;
    font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a;
    overflow: hidden; position: relative; -webkit-font-smoothing: antialiased;
  }
  .screen {
    width: 1080px; height: 1920px; padding: 90px 72px 90px 72px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .progress-track {
    position: absolute; top: 36px; left: 72px; right: 72px; height: 6px;
    background: #e2e8f0; border-radius: 9999px; overflow: hidden;
  }
  .progress-fill { height: 100%; width: 0%; background: #2563eb; }
  .header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;
  }
  .brand { display: flex; align-items: center; gap: 18px; }
  .brand-logo { width: 56px; height: 56px; object-fit: contain; }
  .brand-title { font-size: 38px; font-weight: 900; letter-spacing: -0.03em; color: #000; }
  .timestamp { font-size: 30px; font-weight: 700; color: #71717a; }

  .section-title {
    font-size: 34px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase;
    color: #0f172a; line-height: 1.25; margin-bottom: 46px;
  }

  .stack { display: flex; flex-direction: column; gap: 34px; flex: 1; justify-content: center; }
  .card {
    background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 32px;
    padding: 42px 44px; box-shadow: 0 12px 35px -8px rgba(0,0,0,0.05);
    display: flex; flex-direction: column; gap: 24px;
    opacity: 0; transform: translateY(20px);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }
  .card.visible { opacity: 1; transform: translateY(0); }
  .card.border-left-blue { border-left: 10px solid #2563eb; }
  .card.border-left-gray { border-left: 10px solid #94a3b8; }
  .card.border-left-red { border-left: 10px solid #ef4444; }

  .card-top { display: flex; justify-content: space-between; align-items: center; }
  .card-outlet { display: flex; align-items: center; gap: 16px; }
  .card-outlet-logo { width: 46px; height: 46px; border-radius: 12px; object-fit: cover; border: 1px solid #e2e8f0; }
  .card-outlet-name { font-size: 28px; font-weight: 800; color: #09090b; }

  .badge {
    font-size: 16px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;
    padding: 8px 22px; border-radius: 9999px;
  }
  .badge.stanga { background: #dbeafe; color: #1e40af; }
  .badge.centru { background: #f1f5f9; color: #334155; }
  .badge.dreapta { background: #fee2e2; color: #b91c1c; }

  .card-quote {
    font-family: 'Playfair Display', serif; font-size: 32px; line-height: 1.34;
    font-weight: 700; color: #0f172a; letter-spacing: -0.01em;
  }
  .card-time { font-size: 20px; font-weight: 600; color: #94a3b8; }

  .bottom-cta-pill {
    width: 100%; height: 96px; background: #ffffff; border: 2px solid #e2e8f0;
    border-radius: 9999px; display: flex; align-items: center; justify-content: center;
    font-size: 28px; font-weight: 800; color: #09090b; gap: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.04); margin-top: 30px;
  }
</style>
</head>
<body>
  <div class="progress-track"><div id="pFill" class="progress-fill"></div></div>
  <div class="screen">
    <div>
      <div class="header">
        <div class="brand">
          <img src="${logoBase64}" class="brand-logo" alt="">
          <span class="brand-title">thesite.ro</span>
        </div>
        <div class="timestamp">0:16</div>
      </div>
      <div class="section-title">
        ACELEAȘI EVENIMENTE,<br>3 PERSPECTIVE DIFERITE.
      </div>
    </div>

    <div class="stack">
      <div id="c1" class="card border-left-blue">
        <div class="card-top">
          <div class="card-outlet">
            <img src="${story.headlines.left.logo}" class="card-outlet-logo" alt="">
            <span class="card-outlet-name">${story.headlines.left.outlet}</span>
          </div>
          <span class="badge stanga">STÂNGA</span>
        </div>
        <div class="card-quote">${story.headlines.left.title}</div>
        <div class="card-time">${story.headlines.left.time}</div>
      </div>

      <div id="c2" class="card border-left-gray">
        <div class="card-top">
          <div class="card-outlet">
            <img src="${story.headlines.center.logo}" class="card-outlet-logo" alt="">
            <span class="card-outlet-name">${story.headlines.center.outlet}</span>
          </div>
          <span class="badge centru">CENTRU</span>
        </div>
        <div class="card-quote">${story.headlines.center.title}</div>
        <div class="card-time">${story.headlines.center.time}</div>
      </div>

      <div id="c3" class="card border-left-red">
        <div class="card-top">
          <div class="card-outlet">
            <img src="${story.headlines.right.logo}" class="card-outlet-logo" alt="">
            <span class="card-outlet-name">${story.headlines.right.outlet}</span>
          </div>
          <span class="badge dreapta">DREAPTA</span>
        </div>
        <div class="card-quote">${story.headlines.right.title}</div>
        <div class="card-time">${story.headlines.right.time}</div>
      </div>
    </div>

    <div class="bottom-cta-pill">
      <span>Citește analiza completă</span>
      <span>➔</span>
    </div>
  </div>

  <script>
    window.setProgress = function(t) {
      document.getElementById('pFill').style.width = (t * 100) + '%';
      if (t >= 0.05) document.getElementById('c1').classList.add('visible');
      if (t >= 0.35) document.getElementById('c2').classList.add('visible');
      if (t >= 0.65) document.getElementById('c3').classList.add('visible');
    };
  </script>
</body>
</html>`;
}

// ==========================================================
// STYLE 3: QUOTE / CINEMATIC DARK MODE (Mockup 4)
// ==========================================================
function getStyle3Html() {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1080px; height: 1920px; background: #0b0d13;
    font-family: 'Plus Jakarta Sans', sans-serif; color: #ffffff;
    overflow: hidden; position: relative; -webkit-font-smoothing: antialiased;
  }
  .bg-photo {
    position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
    opacity: 0.25; filter: grayscale(100%) contrast(120%);
    transform: scale(1.05);
  }
  .bg-vignette {
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 30%, rgba(11,13,19,0.3) 0%, rgba(11,13,19,0.95) 85%);
  }

  .screen {
    position: relative; z-index: 10;
    width: 1080px; height: 1920px; padding: 90px 72px 90px 72px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .progress-track {
    position: absolute; top: 36px; left: 72px; right: 72px; height: 6px;
    background: rgba(255,255,255,0.15); border-radius: 9999px; overflow: hidden;
  }
  .progress-fill { height: 100%; width: 0%; background: #3b82f6; }

  .header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;
  }
  .brand { display: flex; align-items: center; gap: 18px; }
  .brand-logo { width: 56px; height: 56px; object-fit: contain; filter: invert(1); }
  .brand-title { font-size: 38px; font-weight: 900; letter-spacing: -0.03em; color: #ffffff; }
  .timestamp { font-size: 30px; font-weight: 700; color: #94a3b8; }

  .quote-container {
    flex: 1; display: flex; flex-direction: column; justify-content: center;
    padding: 20px 0;
  }
  .giant-quote-mark {
    font-family: 'Playfair Display', serif; font-size: 160px; line-height: 0.7;
    color: #3b82f6; font-weight: 900; margin-bottom: 20px;
  }
  .quote-text {
    font-family: 'Playfair Display', serif; font-size: 64px; line-height: 1.2;
    font-style: italic; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;
    margin-bottom: 40px;
  }
  .speaker-line {
    font-size: 26px; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase;
    color: #ffffff; margin-bottom: 8px;
  }
  .speaker-role {
    font-size: 22px; font-weight: 600; color: #94a3b8; letter-spacing: 0.05em;
  }

  .takeaway-tag {
    font-size: 22px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
    color: #94a3b8; margin-bottom: 24px;
  }

  .bias-bar {
    display: flex; width: 100%; height: 82px; border-radius: 22px; overflow: hidden;
    margin-top: 20px; border: 1.5px solid rgba(255,255,255,0.15);
  }
  .bias-seg {
    flex: 1; display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase;
  }
  .bias-seg.left { background: #2563eb; color: #fff; flex: 0.85; }
  .bias-seg.center { background: rgba(255,255,255,0.15); color: #fff; backdrop-filter: blur(8px); flex: 1.3; }
  .bias-seg.right { background: #ef4444; color: #fff; flex: 1; }

  .footer-action {
    display: flex; justify-content: space-between; align-items: center; margin-top: 28px;
  }
  .footer-text { font-size: 26px; font-weight: 700; color: #e2e8f0; }
  .circle-btn {
    width: 72px; height: 72px; border-radius: 50%; background: #ffffff; color: #000000;
    display: flex; align-items: center; justify-content: center; font-size: 32px;
  }
</style>
</head>
<body>
  <img id="bgImg" src="${storyImageBase64}" class="bg-photo" alt="">
  <div class="bg-vignette"></div>

  <div class="progress-track"><div id="pFill" class="progress-fill"></div></div>

  <div class="screen">
    <div class="header">
      <div class="brand">
        <img src="${logoBase64}" class="brand-logo" alt="">
        <span class="brand-title">thesite.ro</span>
      </div>
      <div class="timestamp">0:16</div>
    </div>

    <div class="quote-container">
      <div class="giant-quote-mark">“</div>
      <div class="quote-text">${story.quote}</div>
      <div class="speaker-line">— ${story.speaker}</div>
      <div class="speaker-role">${story.speakerRole}</div>
    </div>

    <div>
      <div class="takeaway-tag">CUM E PRIVIT ACEST PLAN ÎN PRESA DIN ROMÂNIA?</div>
      <div class="bias-bar">
        <div class="bias-seg left">STÂNGA ${story.bias.left}%</div>
        <div class="bias-seg center">CENTRU ${story.bias.center}%</div>
        <div class="bias-seg right">DREAPTA ${story.bias.right}%</div>
      </div>
      <div class="footer-action">
        <span class="footer-text">Citește povestea pe thesite.ro</span>
        <div class="circle-btn">➔</div>
      </div>
    </div>
  </div>

  <script>
    window.setProgress = function(t) {
      document.getElementById('pFill').style.width = (t * 100) + '%';
      const scale = 1.05 + (t * 0.05);
      document.getElementById('bgImg').style.transform = 'scale(' + scale + ')';
    };
  </script>
</body>
</html>`;
}

async function renderStyleVideo(name, htmlGenerator, outputMp4, outputPng, outputGif) {
  const html = htmlGenerator();
  const tempFramesDir = path.join(__dirname, '..', 'social_export', 'latest', `temp_${name}`);
  fs.mkdirSync(tempFramesDir, { recursive: true });

  console.log(`\n========================================`);
  console.log(`🚀 Rendering ${name.toUpperCase()} (1080x1920, 24 FPS)...`);
  console.log(`========================================`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(600);

  // Capture static image
  await page.evaluate(() => window.setProgress(0.5));
  await page.screenshot({ path: outputPng, type: 'png' });
  console.log(`  ✓ Static PNG: ${outputPng}`);

  // Capture 10s video (240 frames)
  const fps = 24;
  const duration = 10;
  const totalFrames = fps * duration;

  console.log(`  🎬 Capturing ${totalFrames} frames...`);
  for (let i = 0; i < totalFrames; i++) {
    const t = i / totalFrames;
    await page.evaluate(progress => window.setProgress(progress), t);
    const frameFile = path.join(tempFramesDir, `frame_${String(i).padStart(4, '0')}.jpg`);
    await page.screenshot({ path: frameFile, type: 'jpeg', quality: 90 });
    if (i % 48 === 0) {
      process.stdout.write(`    Frame ${i}/${totalFrames} (${Math.round(t * 100)}%)\r`);
    }
  }
  console.log(`\n  ✓ Captured all frames.`);
  await browser.close();

  // Encode MP4
  console.log(`  🎞️ Encoding ${outputMp4}...`);
  const ffmpegMp4 = `ffmpeg -y -framerate ${fps} -i "${tempFramesDir}/frame_%04d.jpg" -c:v libx264 -preset fast -profile:v high -level:v 4.2 -pix_fmt yuv420p -movflags +faststart "${outputMp4}"`;
  execSync(ffmpegMp4, { stdio: 'ignore' });

  // Generate GIF
  console.log(`  🎞️ Encoding GIF preview...`);
  const ffmpegGif = `ffmpeg -y -i "${outputMp4}" -vf "fps=10,scale=360:640:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${outputGif}"`;
  execSync(ffmpegGif, { stdio: 'ignore' });

  // Cleanup
  fs.rmSync(tempFramesDir, { recursive: true, force: true });
  console.log(`  🎉 ${name} Complete!`);
}

async function main() {
  const publicReelsDir = path.join(__dirname, '..', 'public', 'reels');
  const artifactsDir = path.join('/Users/romica/.gemini/antigravity-ide/brain/4d237397-24b4-481e-91ec-6d0741abd77f', 'assets');
  fs.mkdirSync(publicReelsDir, { recursive: true });
  fs.mkdirSync(artifactsDir, { recursive: true });

  const styles = [
    {
      name: 'style1_editorial_hook',
      generator: getStyle1Html,
      mp4: path.join(publicReelsDir, 'reel_style1_editorial_hook.mp4'),
      png: path.join(publicReelsDir, 'style1_editorial_hook.png'),
      gif: path.join(publicReelsDir, 'style1_editorial_hook.gif')
    },
    {
      name: 'style2_perspective_stack',
      generator: getStyle2Html,
      mp4: path.join(publicReelsDir, 'reel_style2_perspective_stack.mp4'),
      png: path.join(publicReelsDir, 'style2_perspective_stack.png'),
      gif: path.join(publicReelsDir, 'style2_perspective_stack.gif')
    },
    {
      name: 'style3_cinematic_dark',
      generator: getStyle3Html,
      mp4: path.join(publicReelsDir, 'reel_style3_cinematic_dark.mp4'),
      png: path.join(publicReelsDir, 'style3_cinematic_dark.png'),
      gif: path.join(publicReelsDir, 'style3_cinematic_dark.gif')
    }
  ];

  for (const s of styles) {
    await renderStyleVideo(s.name, s.generator, s.mp4, s.png, s.gif);
    // Also copy to artifacts
    fs.copyFileSync(s.mp4, path.join(artifactsDir, path.basename(s.mp4)));
    fs.copyFileSync(s.png, path.join(artifactsDir, path.basename(s.png)));
    fs.copyFileSync(s.gif, path.join(artifactsDir, path.basename(s.gif)));
  }

  console.log('\n🚀 ALL 3 REEL MP4 STYLES GENERATED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('❌ Error generating reels:', err);
  process.exit(1);
});
