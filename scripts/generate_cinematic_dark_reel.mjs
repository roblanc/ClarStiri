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
  sourcesCount: 12,
  quote: '„Planul este pe masă. Există o șansă reală să ajungem la o înțelegere istorică pentru încheierea războiului.”',
  speaker: 'DONALD TRUMP',
  speakerRole: 'MISIUNEA DIPLOMATICĂ WITKOFF & KUSHNER',
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

function buildHtml() {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<title>ClarStiri Cinematic Dark Reel</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: 1080px;
    height: 1920px;
    background: #080a0f;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #ffffff;
    overflow: hidden;
    position: relative;
    -webkit-font-smoothing: antialiased;
  }

  /* Cinematic Background Elements */
  .ambient-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.22;
    filter: grayscale(100%) contrast(125%);
    transform: scale(1.06);
    transition: transform 0.1s linear;
  }
  .ambient-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 30%, rgba(8,10,15,0.4) 0%, rgba(8,10,15,0.92) 75%, #080a0f 100%);
    pointer-events: none;
  }

  /* Safe Area / Reel Screen */
  .screen-wrap {
    position: relative;
    z-index: 10;
    width: 1080px;
    height: 1920px;
    padding: 84px 72px 84px 72px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* Top Story Progress Bar */
  .progress-track {
    position: absolute;
    top: 36px;
    left: 72px;
    right: 72px;
    height: 6px;
    background: rgba(255,255,255,0.18);
    border-radius: 9999px;
    overflow: hidden;
    z-index: 50;
  }
  .progress-fill {
    height: 100%;
    width: 0%;
    background: #3b82f6;
    border-radius: 9999px;
    box-shadow: 0 0 12px #3b82f6;
  }

  /* Header */
  .top-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 30px;
  }
  .brand-left {
    display: flex;
    align-items: center;
    gap: 18px;
  }
  .brand-logo-img {
    width: 54px;
    height: 54px;
    object-fit: contain;
    filter: invert(1);
  }
  .brand-title-text {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 38px;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #ffffff;
  }
  .step-timestamp {
    font-size: 28px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.05em;
  }

  /* Scenes Container */
  .scene-body {
    flex: 1;
    display: none;
    flex-direction: column;
    justify-content: space-between;
    opacity: 0;
    transform: translateY(14px);
    transition: opacity 0.35s ease, transform 0.35s ease;
  }
  .scene-body.active {
    display: flex;
    opacity: 1;
    transform: translateY(0);
  }

  /* ========================================================
     SCENE 1: EDITORIAL COVER (CINEMATIC DARK)
     ======================================================== */
  .kicker-row {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #60a5fa;
    margin-bottom: 22px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .kicker-dot {
    width: 10px;
    height: 10px;
    background: #3b82f6;
    border-radius: 50%;
    box-shadow: 0 0 10px #3b82f6;
  }

  .serif-title {
    font-family: 'Playfair Display', serif;
    font-size: 88px;
    font-weight: 900;
    line-height: 1.06;
    letter-spacing: -0.03em;
    color: #ffffff;
    margin-bottom: 24px;
  }

  .subtitle-text {
    font-size: 30px;
    font-weight: 500;
    line-height: 1.4;
    color: #cbd5e1;
    margin-bottom: 36px;
    max-width: 900px;
  }

  .photo-frame {
    width: 100%;
    height: 800px;
    border-radius: 36px;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow: 0 30px 60px -10px rgba(0,0,0,0.7);
  }
  .photo-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.95) contrast(105%);
  }
  .photo-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(8,10,15,0) 40%, rgba(8,10,15,0.7) 75%, rgba(8,10,15,0.95) 100%);
  }
  .photo-caption {
    position: absolute;
    bottom: 30px;
    left: 36px;
    right: 36px;
    color: #f1f5f9;
    font-size: 24px;
    font-weight: 600;
    line-height: 1.35;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
  }

  /* Bias Spectrum Bar (Dark Translucent Glass) */
  .dark-bias-bar {
    display: flex;
    width: 100%;
    height: 82px;
    border-radius: 22px;
    overflow: hidden;
    margin-top: 36px;
    border: 1px solid rgba(255,255,255,0.18);
    backdrop-filter: blur(12px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  }
  .bias-cell {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .bias-cell.left { background: #2563eb; color: #ffffff; flex: 0.85; }
  .bias-cell.center { background: rgba(255,255,255,0.12); color: #ffffff; border-left: 1px solid rgba(255,255,255,0.15); border-right: 1px solid rgba(255,255,255,0.15); flex: 1.3; }
  .bias-cell.right { background: #ef4444; color: #ffffff; flex: 1; }

  .bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 28px;
  }
  .bottom-row-text {
    font-size: 26px;
    font-weight: 700;
    color: #e2e8f0;
  }
  .circle-arrow {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: #ffffff;
    color: #080a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    box-shadow: 0 8px 24px rgba(255,255,255,0.15);
  }

  /* ========================================================
     SCENE 2: THREE-HEADLINE PERSPECTIVES (DARK CARDS)
     ======================================================== */
  .scene2-title {
    font-size: 32px;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #ffffff;
    line-height: 1.25;
    margin-bottom: 40px;
  }

  .dark-cards-stack {
    display: flex;
    flex-direction: column;
    gap: 30px;
    flex: 1;
    justify-content: center;
  }
  .dark-card {
    background: rgba(18, 22, 34, 0.85);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 30px;
    padding: 38px 40px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.4);
    backdrop-filter: blur(14px);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .dark-card.border-left-blue { border-left: 10px solid #3b82f6; box-shadow: -8px 0 25px -5px rgba(59,130,246,0.3); }
  .dark-card.border-left-gray { border-left: 10px solid #94a3b8; box-shadow: -8px 0 25px -5px rgba(148,163,184,0.2); }
  .dark-card.border-left-red { border-left: 10px solid #ef4444; box-shadow: -8px 0 25px -5px rgba(239,68,68,0.3); }

  .dcard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .dcard-outlet {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .dcard-logo {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid rgba(255,255,255,0.15);
  }
  .dcard-outlet-name {
    font-size: 26px;
    font-weight: 800;
    color: #ffffff;
  }

  .dcard-tag {
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 6px 20px;
    border-radius: 9999px;
  }
  .dtag-blue { background: rgba(59,130,246,0.2); color: #93c5fd; border: 1px solid rgba(59,130,246,0.4); }
  .dtag-gray { background: rgba(255,255,255,0.1); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.2); }
  .dtag-red { background: rgba(239,68,68,0.2); color: #fca5a5; border: 1px solid rgba(239,68,68,0.4); }

  .dcard-quote {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    line-height: 1.34;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.01em;
  }
  .dcard-time {
    font-size: 19px;
    font-weight: 600;
    color: #94a3b8;
  }

  .dark-pill-banner {
    width: 100%;
    height: 84px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 600;
    color: #94a3b8;
    gap: 10px;
    backdrop-filter: blur(12px);
    margin-top: 26px;
  }
  .dark-pill-banner b {
    color: #3b82f6;
    font-weight: 800;
  }

  .dark-bio-banner {
    width: 100%;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 28px;
    padding: 22px 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 28px;
    backdrop-filter: blur(14px);
  }
  .dark-bio-badge {
    background: #3b82f6;
    color: #ffffff;
    font-size: 16px;
    font-weight: 900;
    padding: 8px 18px;
    border-radius: 9999px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    box-shadow: 0 0 16px rgba(59,130,246,0.4);
  }
  .dark-bio-text {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.01em;
  }

  /* ========================================================
     SCENE 3: CINEMATIC QUOTE (HERO TAKEAWAY)
     ======================================================== */
  .quote-body-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 30px 0;
  }
  .quote-mark {
    font-family: 'Playfair Display', serif;
    font-size: 170px;
    line-height: 0.7;
    color: #3b82f6;
    font-weight: 900;
    margin-bottom: 20px;
    text-shadow: 0 0 40px rgba(59,130,246,0.6);
  }
  .quote-italic {
    font-family: 'Playfair Display', serif;
    font-size: 64px;
    line-height: 1.2;
    font-style: italic;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.02em;
    margin-bottom: 40px;
  }
  .speaker-title {
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #ffffff;
    margin-bottom: 8px;
  }
  .speaker-subtitle {
    font-size: 22px;
    font-weight: 600;
    color: #94a3b8;
    letter-spacing: 0.05em;
  }

  /* ========================================================
     SCENE 4: BRANDED OUTRO / CTA
     ======================================================== */
  .outro-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .outro-mascot-circle {
    width: 170px;
    height: 170px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    border: 2px solid rgba(255,255,255,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
    box-shadow: 0 0 40px rgba(59,130,246,0.2);
  }
  .outro-mascot-circle img {
    width: 110px;
    height: 110px;
    object-fit: contain;
    filter: invert(1);
  }
  .outro-brand-text {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 60px;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: #ffffff;
    margin-bottom: 12px;
  }
  .outro-sub-slogan {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 44px;
  }
  .outro-quote-serif {
    font-family: 'Playfair Display', serif;
    font-size: 54px;
    font-weight: 900;
    line-height: 1.2;
    color: #ffffff;
    margin-bottom: 24px;
  }
  .outro-quote-serif em {
    font-style: italic;
    color: #60a5fa;
  }
  .outro-summary-desc {
    font-size: 24px;
    font-weight: 500;
    line-height: 1.45;
    color: #94a3b8;
    max-width: 740px;
    margin-bottom: 50px;
  }
  .white-cta-btn {
    width: 100%;
    height: 94px;
    background: #ffffff;
    color: #080a0f;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 0.02em;
    gap: 16px;
    box-shadow: 0 15px 40px rgba(255,255,255,0.25);
    margin-top: 24px;
  }

</style>
</head>
<body>

  <!-- Ambient Cinematic Background -->
  <img id="ambientBg" src="${storyImageBase64}" class="ambient-bg" alt="">
  <div class="ambient-vignette"></div>

  <div class="screen-wrap">

    <!-- Top Story Progress Bar -->
    <div class="progress-track">
      <div id="progressFill" class="progress-fill"></div>
    </div>

    <!-- Header -->
    <div class="top-header">
      <div class="brand-left">
        <img src="${logoBase64}" class="brand-logo-img" alt="">
        <span class="brand-title-text">thesite.ro</span>
      </div>
      <div class="step-timestamp">0:16</div>
    </div>

    <!-- ========================================================
         SCENE 1: EDITORIAL HOOK (0 - 4.5s)
         ======================================================== -->
    <div id="scene1" class="scene-body active">
      <div>
        <div class="kicker-row">
          <span class="kicker-dot"></span> ${story.kicker}
        </div>
        <h1 class="serif-title">${story.titlePart1}<br>${story.titlePart2}</h1>
        <p class="subtitle-text">${story.subtitle}</p>
      </div>

      <div class="photo-frame">
        <img id="coverImg" src="${storyImageBase64}" alt="">
        <div class="photo-overlay"></div>
        <div class="photo-caption">Misiunea diplomatică a SUA la Moscova pentru încheierea războiului.</div>
      </div>

      <div>
        <div class="dark-bias-bar">
          <div class="bias-cell left">STÂNGA ${story.bias.left}%</div>
          <div class="bias-cell center">CENTRU ${story.bias.center}%</div>
          <div class="bias-cell right">DREAPTA ${story.bias.right}%</div>
        </div>

        <div class="bottom-row">
          <span class="bottom-row-text">Știri din toate perspectivele.</span>
          <div class="circle-arrow">➔</div>
        </div>
      </div>
    </div>

    <!-- ========================================================
         SCENE 2: THREE HEADLINES COMPARISON (4.5s - 9.0s)
         ======================================================== -->
    <div id="scene2" class="scene-body">
      <div class="scene2-title">
        ACELEAȘI EVENIMENTE,<br>3 PERSPECTIVE DIFERITE.
      </div>

      <div class="dark-cards-stack">
        <!-- Left -->
        <div class="dark-card border-left-blue">
          <div class="dcard-header">
            <div class="dcard-outlet">
              <img src="${story.headlines.left.logo}" class="dcard-logo" alt="">
              <span class="dcard-outlet-name">${story.headlines.left.outlet}</span>
            </div>
            <span class="dcard-tag dtag-blue">STÂNGA</span>
          </div>
          <div class="dcard-quote">${story.headlines.left.title}</div>
          <div class="dcard-time">${story.headlines.left.time}</div>
        </div>

        <!-- Center -->
        <div class="dark-card border-left-gray">
          <div class="dcard-header">
            <div class="dcard-outlet">
              <img src="${story.headlines.center.logo}" class="dcard-logo" alt="">
              <span class="dcard-outlet-name">${story.headlines.center.outlet}</span>
            </div>
            <span class="dcard-tag dtag-gray">CENTRU</span>
          </div>
          <div class="dcard-quote">${story.headlines.center.title}</div>
          <div class="dcard-time">${story.headlines.center.time}</div>
        </div>

        <!-- Right -->
        <div class="dark-card border-left-red">
          <div class="dcard-header">
            <div class="dcard-outlet">
              <img src="${story.headlines.right.logo}" class="dcard-logo" alt="">
              <span class="dcard-outlet-name">${story.headlines.right.outlet}</span>
            </div>
            <span class="dcard-tag dtag-red">DREAPTA</span>
          </div>
          <div class="dcard-quote">${story.headlines.right.title}</div>
          <div class="dcard-time">${story.headlines.right.time}</div>
        </div>
      </div>

      <div class="dark-pill-banner">
        <span>Comparația completă a titlurilor • <b>Link în bio</b></span>
      </div>
    </div>

    <!-- ========================================================
         SCENE 3: HERO QUOTE / KEY TAKEAWAY (9.0s - 13.0s)
         ======================================================== -->
    <div id="scene3" class="scene-body">
      <div class="quote-body-wrap">
        <div class="quote-mark">“</div>
        <div class="quote-italic">${story.quote}</div>
        <div class="speaker-title">— ${story.speaker}</div>
        <div class="speaker-subtitle">${story.speakerRole}</div>
      </div>

      <div>
        <div style="font-size: 22px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8; margin-bottom: 20px;">
          CUM E PRIVIT ACEST PLAN ÎN PRESA DIN ROMÂNIA?
        </div>
        <div class="dark-bias-bar">
          <div class="bias-cell left">STÂNGA ${story.bias.left}%</div>
          <div class="bias-cell center">CENTRU ${story.bias.center}%</div>
          <div class="bias-cell right">DREAPTA ${story.bias.right}%</div>
        </div>
        <div class="bottom-row">
          <span class="bottom-row-text">Citește povestea pe thesite.ro</span>
          <div class="circle-arrow">➔</div>
        </div>
      </div>
    </div>

    <!-- ========================================================
         SCENE 4: BRANDED OUTRO / CTA (13.0s - 16.0s)
         ======================================================== -->
    <div id="scene4" class="scene-body">
      <div class="outro-box">
        <div class="outro-mascot-circle">
          <img src="${logoBase64}" alt="">
        </div>
        <div class="outro-brand-text">thesite.ro</div>
        <div class="outro-sub-slogan">ȘTIRI DIN TOATE PERSPECTIVELE</div>

        <div class="outro-quote-serif">
          Dincolo de titluri.<br>
          <em>Mai aproape de adevăr.</em>
        </div>

        <p class="outro-summary-desc">
          Analizăm presa din România din toate unghiurile ca tu să vezi imaginea completă.
        </p>

        <div class="dark-bias-bar" style="width: 100%; margin-top: 0;">
          <div class="bias-cell left">STÂNGA</div>
          <div class="bias-cell center">CENTRU</div>
          <div class="bias-cell right">DREAPTA</div>
        </div>

        <div class="dark-bio-banner">
          <span class="dark-bio-badge">Link în bio</span>
          <span class="dark-bio-text">thesite.ro • Toate perspectivele</span>
        </div>
      </div>
    </div>

  </div>

  <script>
    window.setReelProgress = function(t) {
      document.getElementById('progressFill').style.width = (t * 100) + '%';

      // Subtle ambient zoom
      const zoom = 1.06 + (t * 0.08);
      document.getElementById('ambientBg').style.transform = 'scale(' + zoom + ')';

      const s1 = document.getElementById('scene1');
      const s2 = document.getElementById('scene2');
      const s3 = document.getElementById('scene3');
      const s4 = document.getElementById('scene4');

      // 4 scenes: 0-0.28, 0.28-0.56, 0.56-0.82, 0.82-1.0
      if (t < 0.28) {
        s1.className = 'scene-body active';
        s2.className = 'scene-body';
        s3.className = 'scene-body';
        s4.className = 'scene-body';
      } else if (t < 0.56) {
        s1.className = 'scene-body';
        s2.className = 'scene-body active';
        s3.className = 'scene-body';
        s4.className = 'scene-body';
      } else if (t < 0.82) {
        s1.className = 'scene-body';
        s2.className = 'scene-body';
        s3.className = 'scene-body active';
        s4.className = 'scene-body';
      } else {
        s1.className = 'scene-body';
        s2.className = 'scene-body';
        s3.className = 'scene-body';
        s4.className = 'scene-body active';
      }
    };

    window.showScene = function(n) {
      [1, 2, 3, 4].forEach(i => {
        const el = document.getElementById('scene' + i);
        if (el) el.className = (i === n) ? 'scene-body active' : 'scene-body';
      });
      document.getElementById('progressFill').style.width = ((n / 4) * 100) + '%';
    };
  </script>
</body>
</html>`;
}

async function renderFullCinematicReel() {
  const html = buildHtml();
  const publicReelsDir = path.join(__dirname, '..', 'public', 'reels');
  const tempFramesDir = path.join(__dirname, '..', 'social_export', 'latest', 'temp_cinematic_full');
  fs.mkdirSync(publicReelsDir, { recursive: true });
  fs.mkdirSync(tempFramesDir, { recursive: true });

  console.log('🚀 Rendering FULL CINEMATIC DARK REEL (4 Scenes, 16s, 24 FPS)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(600);

  // 1. Capture 4 static scene slides
  for (let s = 1; s <= 4; s++) {
    await page.evaluate(num => window.showScene(num), s);
    await page.waitForTimeout(150);
    const pngPath = path.join(publicReelsDir, `cinematic_dark_scene${s}.png`);
    await page.screenshot({ path: pngPath, type: 'png' });
    console.log(`  ✓ Scene ${s} PNG: ${pngPath}`);
  }

  // 2. Capture video frames
  const fps = 24;
  const duration = 16;
  const totalFrames = fps * duration;

  console.log(`  🎬 Capturing ${totalFrames} frames...`);
  for (let i = 0; i < totalFrames; i++) {
    const t = i / totalFrames;
    await page.evaluate(progress => window.setReelProgress(progress), t);
    const frameFile = path.join(tempFramesDir, `frame_${String(i).padStart(4, '0')}.jpg`);
    await page.screenshot({ path: frameFile, type: 'jpeg', quality: 90 });
    if (i % 48 === 0) {
      process.stdout.write(`    Frame ${i}/${totalFrames} (${Math.round(t * 100)}%)\r`);
    }
  }
  console.log(`\n  ✓ All ${totalFrames} frames captured.`);
  await browser.close();

  // 3. Encode MP4
  const outputMp4 = path.join(publicReelsDir, 'cinematic_dark_full_reel.mp4');
  console.log(`  🎞️ Encoding ${outputMp4}...`);
  const ffmpegMp4 = `ffmpeg -y -framerate ${fps} -i "${tempFramesDir}/frame_%04d.jpg" -c:v libx264 -preset fast -profile:v high -level:v 4.2 -pix_fmt yuv420p -movflags +faststart "${outputMp4}"`;
  execSync(ffmpegMp4, { stdio: 'ignore' });

  // 4. Encode GIF preview
  const outputGif = path.join(publicReelsDir, 'cinematic_dark_full_reel.gif');
  console.log(`  🎞️ Encoding GIF preview ${outputGif}...`);
  const ffmpegGif = `ffmpeg -y -i "${outputMp4}" -vf "fps=10,scale=360:640:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${outputGif}"`;
  execSync(ffmpegGif, { stdio: 'ignore' });

  // Copy to brain artifacts
  const artifactsDir = '/Users/romica/.gemini/antigravity-ide/brain/4d237397-24b4-481e-91ec-6d0741abd77f/assets';
  fs.copyFileSync(outputMp4, path.join(artifactsDir, 'cinematic_dark_full_reel.mp4'));
  fs.copyFileSync(outputGif, path.join(artifactsDir, 'cinematic_dark_full_reel.gif'));
  for (let s = 1; s <= 4; s++) {
    fs.copyFileSync(path.join(publicReelsDir, `cinematic_dark_scene${s}.png`), path.join(artifactsDir, `cinematic_dark_scene${s}.png`));
  }

  // Cleanup
  fs.rmSync(tempFramesDir, { recursive: true, force: true });
  console.log('\n🎉 FULL CINEMATIC DARK REEL GENERATED SUCCESSFULLY!');
  console.log('  MP4:', outputMp4);
  console.log('  GIF:', outputGif);
}

renderFullCinematicReel().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
