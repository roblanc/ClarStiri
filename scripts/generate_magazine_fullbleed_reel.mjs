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
  magazineIssue: 'DOSARUL ZILEI • EDIȚIA #42',
  kicker: 'ANALIZĂ & PERSPECTIVĂ EDITORIALĂ',
  titleHero: 'Planul de pace.',
  titleSub: 'Misiune la Moscova.',
  leadText: 'Cum este reflectată trimiterea emisarilor speciali ai lui Donald Trump în presa din România?',
  bias: { left: 8, center: 59, right: 33 },
  sourcesCount: 12,
  quote: '„Planul este pe masă. Există o șansă reală să ajungem la o înțelegere istorică pentru încheierea războiului.”',
  speaker: 'DONALD TRUMP',
  speakerRole: 'Președinte SUA • Misiunea diplomatică Witkoff & Kushner',
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
<title>ClarStiri Full-Bleed Magazine Reel</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Newsreader:ital,opsz,wght@0,6..72,700;0,6..72,800;1,6..72,700;1,6..72,800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: 1080px;
    height: 1920px;
    background: #000000;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    color: #ffffff;
    overflow: hidden;
    position: relative;
    -webkit-font-smoothing: antialiased;
  }

  /* Full-Bleed Photo Canvas */
  .fullbleed-layer {
    position: absolute;
    inset: 0;
    width: 1080px;
    height: 1920px;
    overflow: hidden;
  }
  .fullbleed-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.04);
    filter: brightness(0.92) contrast(110%);
    transition: transform 0.1s linear;
  }

  /* Magazine Dual Vignette: Dark at top for masthead, deep filmic black gradient at bottom for text */
  .magazine-scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.75) 0%,
      rgba(0, 0, 0, 0.2) 20%,
      rgba(0, 0, 0, 0.3) 45%,
      rgba(0, 0, 0, 0.85) 75%,
      #040507 100%
    );
    pointer-events: none;
  }

  /* Fine magazine grain effect */
  .magazine-overlay-texture {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.5) 100%);
    pointer-events: none;
  }

  /* Safe Area Screen Content */
  .magazine-layout {
    position: relative;
    z-index: 10;
    width: 1080px;
    height: 1920px;
    padding: 80px 72px 80px 72px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* Top Progress Bar (Fine editorial red/gold or system line) */
  .mag-progress-track {
    position: absolute;
    top: 36px;
    left: 72px;
    right: 72px;
    height: 4px;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 9999px;
    overflow: hidden;
    z-index: 50;
  }
  .mag-progress-fill {
    height: 100%;
    width: 0%;
    background: #ffffff;
    border-radius: 9999px;
    box-shadow: 0 0 10px rgba(255,255,255,0.8);
  }

  /* Magazine Masthead Bar */
  .mag-masthead {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  }
  .masthead-left {
    display: flex;
    align-items: center;
    gap: 18px;
  }
  .masthead-emblem {
    width: 52px;
    height: 52px;
    object-fit: contain;
    filter: invert(1);
  }
  .masthead-wordmark {
    font-family: 'Playfair Display', serif;
    font-size: 38px;
    font-weight: 900;
    letter-spacing: -0.01em;
    color: #ffffff;
  }
  .masthead-edition {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.7);
    border-left: 1px solid rgba(255, 255, 255, 0.3);
    padding-left: 16px;
  }
  .masthead-meta {
    font-size: 24px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.75);
    letter-spacing: 0.05em;
  }

  /* Scenes Container */
  .mag-scene {
    flex: 1;
    display: none;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: 20px;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .mag-scene.active {
    display: flex;
    opacity: 1;
    transform: translateY(0);
  }

  /* ========================================================
     SCENE 1: FULL-BLEED MAGAZINE COVER
     ======================================================== */
  .mag-kicker-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #60a5fa;
    margin-bottom: 24px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
  }
  .kicker-rule {
    width: 28px;
    height: 3px;
    background: #60a5fa;
  }

  .mag-hero-h1 {
    font-family: 'Playfair Display', serif;
    font-size: 96px;
    font-weight: 900;
    line-height: 1.02;
    letter-spacing: -0.035em;
    color: #ffffff;
    margin-bottom: 22px;
    text-shadow: 0 4px 30px rgba(0, 0, 0, 0.9);
  }
  .mag-hero-h1 em {
    font-style: italic;
    font-weight: 700;
    color: #93c5fd;
  }

  .mag-lead-deck {
    font-size: 30px;
    font-weight: 500;
    line-height: 1.4;
    color: #e2e8f0;
    max-width: 920px;
    margin-bottom: 40px;
    text-shadow: 0 2px 12px rgba(0,0,0,0.8);
  }

  /* Full-Bleed Segmented Bias Bar */
  .mag-bias-segmented {
    display: flex;
    width: 100%;
    height: 84px;
    border-radius: 24px;
    overflow: hidden;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.22);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  }
  .mag-seg {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 21px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .mag-seg.left {
    background: rgba(37, 99, 235, 0.85);
    color: #ffffff;
    flex: 0.85;
  }
  .mag-seg.center {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
    border-left: 1px solid rgba(255, 255, 255, 0.15);
    border-right: 1px solid rgba(255, 255, 255, 0.15);
    flex: 1.3;
  }
  .mag-seg.right {
    background: rgba(239, 68, 68, 0.85);
    color: #ffffff;
    flex: 1;
  }

  .mag-footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 30px;
    padding-top: 8px;
  }
  .mag-footer-text {
    font-size: 24px;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.01em;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
  }
  .mag-circle-indicator {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: #ffffff;
    color: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }

  /* ========================================================
     SCENE 2: MAGAZINE MULTI-PERSPECTIVE SPREAD
     ======================================================== */
  .mag-spread-title {
    font-family: 'Newsreader', 'Playfair Display', serif;
    font-size: 52px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.025em;
    color: #ffffff;
    margin-bottom: 36px;
    text-shadow: 0 4px 20px rgba(0,0,0,0.9);
  }
  .mag-spread-title span {
    font-style: italic;
    color: #93c5fd;
  }

  .mag-cards-stack {
    display: flex;
    flex-direction: column;
    gap: 28px;
    margin-bottom: 32px;
  }
  .mag-card-glass {
    background: rgba(10, 14, 24, 0.85);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 28px;
    padding: 34px 38px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    gap: 18px;
    position: relative;
  }
  .mag-card-glass.accent-blue {
    border-left: 8px solid #3b82f6;
  }
  .mag-card-glass.accent-gray {
    border-left: 8px solid #94a3b8;
  }
  .mag-card-glass.accent-red {
    border-left: 8px solid #ef4444;
  }

  .mcard-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .mcard-outlet-group {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .mcard-logo {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .mcard-name {
    font-size: 26px;
    font-weight: 800;
    color: #ffffff;
  }
  .mcard-tag {
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 6px 18px;
    border-radius: 9999px;
  }
  .tag-blue { background: rgba(59, 130, 246, 0.25); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); }
  .tag-gray { background: rgba(255, 255, 255, 0.12); color: #e2e8f0; border: 1px solid rgba(255, 255, 255, 0.2); }
  .tag-red { background: rgba(239, 68, 68, 0.25); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); }

  .mcard-quote {
    font-family: 'Playfair Display', serif;
    font-size: 29px;
    line-height: 1.34;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: -0.01em;
  }
  .mcard-meta {
    font-size: 18px;
    font-weight: 600;
    color: #94a3b8;
  }

  .mag-social-banner {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 9999px;
    padding: 20px 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 23px;
    font-weight: 700;
    color: #ffffff;
    backdrop-filter: blur(16px);
  }
  .mag-social-banner b {
    color: #60a5fa;
  }

  /* ========================================================
     SCENE 3: THE EDITORIAL PULL-QUOTE
     ======================================================== */
  .mag-quote-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 30px 0;
  }
  .mag-pull-mark {
    font-family: 'Playfair Display', serif;
    font-size: 180px;
    line-height: 0.6;
    color: #60a5fa;
    font-weight: 900;
    margin-bottom: 24px;
    text-shadow: 0 0 40px rgba(96, 165, 250, 0.5);
  }
  .mag-pull-text {
    font-family: 'Playfair Display', serif;
    font-size: 64px;
    line-height: 1.2;
    font-style: italic;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.025em;
    margin-bottom: 40px;
    text-shadow: 0 4px 24px rgba(0,0,0,0.9);
  }
  .mag-speaker-title {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #ffffff;
    margin-bottom: 8px;
  }
  .mag-speaker-sub {
    font-size: 22px;
    font-weight: 600;
    color: #cbd5e1;
    letter-spacing: 0.04em;
  }

  /* ========================================================
     SCENE 4: BACK COVER & BRAND STATEMENT
     ======================================================== */
  .mag-outro-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .mag-seal-emblem {
    width: 170px;
    height: 170px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
    box-shadow: 0 0 50px rgba(96, 165, 250, 0.25);
    backdrop-filter: blur(16px);
  }
  .mag-seal-emblem img {
    width: 110px;
    height: 110px;
    object-fit: contain;
    filter: invert(1);
  }
  .mag-outro-title {
    font-family: 'Playfair Display', serif;
    font-size: 66px;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #ffffff;
    margin-bottom: 12px;
  }
  .mag-outro-subtitle {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 44px;
  }
  .mag-outro-slogan {
    font-family: 'Playfair Display', serif;
    font-size: 58px;
    font-weight: 900;
    line-height: 1.18;
    color: #ffffff;
    margin-bottom: 26px;
  }
  .mag-outro-slogan em {
    font-style: italic;
    color: #93c5fd;
  }
  .mag-outro-desc {
    font-size: 24px;
    font-weight: 500;
    line-height: 1.45;
    color: #cbd5e1;
    max-width: 760px;
    margin-bottom: 48px;
  }
  .mag-bio-pill {
    width: 100%;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 28px;
    padding: 24px 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    backdrop-filter: blur(20px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  }
  .mag-bio-badge {
    background: #2563eb;
    color: #ffffff;
    font-size: 16px;
    font-weight: 900;
    padding: 8px 18px;
    border-radius: 9999px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .mag-bio-label {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
  }

</style>
</head>
<body>

  <!-- Full-Bleed Edge-to-Edge Image Layer -->
  <div class="fullbleed-layer">
    <img id="bgFull" src="${storyImageBase64}" class="fullbleed-img" alt="">
    <div class="magazine-scrim"></div>
    <div class="magazine-overlay-texture"></div>
  </div>

  <div class="magazine-layout">

    <!-- Editorial Progress Line -->
    <div class="mag-progress-track">
      <div id="progressFill" class="mag-progress-fill"></div>
    </div>

    <!-- Magazine Masthead -->
    <div class="mag-masthead">
      <div class="masthead-left">
        <img src="${logoBase64}" class="masthead-emblem" alt="">
        <span class="masthead-wordmark">thesite.ro</span>
        <span class="masthead-edition">${story.magazineIssue}</span>
      </div>
      <div class="masthead-meta">0:16</div>
    </div>

    <!-- ========================================================
         SCENE 1: FULL-BLEED MAGAZINE COVER (0 - 4.5s)
         ======================================================== -->
    <div id="scene1" class="mag-scene active">
      <div>
        <div class="mag-kicker-pill">
          <span class="kicker-rule"></span> ${story.kicker}
        </div>
        <h1 class="mag-hero-h1">
          ${story.titleHero}<br><em>${story.titleSub}</em>
        </h1>
        <p class="mag-lead-deck">${story.leadText}</p>
      </div>

      <div>
        <div class="mag-bias-segmented">
          <div class="mag-seg left">STÂNGA ${story.bias.left}%</div>
          <div class="mag-seg center">CENTRU ${story.bias.center}%</div>
          <div class="mag-seg right">DREAPTA ${story.bias.right}%</div>
        </div>

        <div class="mag-footer-row">
          <span class="mag-footer-text">Știri din toate perspectivele.</span>
          <div class="mag-circle-indicator">➔</div>
        </div>
      </div>
    </div>

    <!-- ========================================================
         SCENE 2: MAGAZINE MULTI-PERSPECTIVE SPREAD (4.5s - 9.0s)
         ======================================================== -->
    <div id="scene2" class="mag-scene">
      <h2 class="mag-spread-title">
        Același eveniment,<br><span>trei perspective diferite.</span>
      </h2>

      <div class="mag-cards-stack">
        <!-- Left -->
        <div class="mag-card-glass accent-blue">
          <div class="mcard-top">
            <div class="mcard-outlet-group">
              <img src="${story.headlines.left.logo}" class="mcard-logo" alt="">
              <span class="mcard-name">${story.headlines.left.outlet}</span>
            </div>
            <span class="mcard-tag tag-blue">STÂNGA</span>
          </div>
          <div class="mcard-quote">${story.headlines.left.title}</div>
          <div class="mcard-meta">${story.headlines.left.time}</div>
        </div>

        <!-- Center -->
        <div class="mag-card-glass accent-gray">
          <div class="mcard-top">
            <div class="mcard-outlet-group">
              <img src="${story.headlines.center.logo}" class="mcard-logo" alt="">
              <span class="mcard-name">${story.headlines.center.outlet}</span>
            </div>
            <span class="mcard-tag tag-gray">CENTRU</span>
          </div>
          <div class="mcard-quote">${story.headlines.center.title}</div>
          <div class="mcard-meta">${story.headlines.center.time}</div>
        </div>

        <!-- Right -->
        <div class="mag-card-glass accent-red">
          <div class="mcard-top">
            <div class="mcard-outlet-group">
              <img src="${story.headlines.right.logo}" class="mcard-logo" alt="">
              <span class="mcard-name">${story.headlines.right.outlet}</span>
            </div>
            <span class="mcard-tag tag-red">DREAPTA</span>
          </div>
          <div class="mcard-quote">${story.headlines.right.title}</div>
          <div class="mcard-meta">${story.headlines.right.time}</div>
        </div>
      </div>

      <div class="mag-social-banner">
        <span>Comparația completă a titlurilor • <b>Link în bio</b></span>
      </div>
    </div>

    <!-- ========================================================
         SCENE 3: THE EDITORIAL PULL-QUOTE (9.0s - 13.0s)
         ======================================================== -->
    <div id="scene3" class="mag-scene">
      <div class="mag-quote-center">
        <div class="mag-pull-mark">“</div>
        <div class="mag-pull-text">${story.quote}</div>
        <div class="mag-speaker-title">— ${story.speaker}</div>
        <div class="mag-speaker-sub">${story.speakerRole}</div>
      </div>

      <div>
        <div style="font-size: 18px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8; margin-bottom: 20px; text-shadow: 0 2px 8px rgba(0,0,0,0.8);">
          DISTRIBUȚIA OPINIILOR ÎN REDACȚIILE DIN ROMÂNIA
        </div>
        <div class="mag-bias-segmented">
          <div class="mag-seg left">STÂNGA ${story.bias.left}%</div>
          <div class="mag-seg center">CENTRU ${story.bias.center}%</div>
          <div class="mag-seg right">DREAPTA ${story.bias.right}%</div>
        </div>
        <div class="mag-footer-row">
          <span class="mag-footer-text">Analiză pe 12 redacții naționale.</span>
          <div class="mag-circle-indicator">➔</div>
        </div>
      </div>
    </div>

    <!-- ========================================================
         SCENE 4: BACK COVER & BRAND STATEMENT (13.0s - 16.0s)
         ======================================================== -->
    <div id="scene4" class="mag-scene">
      <div class="mag-outro-box">
        <div class="mag-seal-emblem">
          <img src="${logoBase64}" alt="">
        </div>
        <div class="mag-outro-title">thesite.ro</div>
        <div class="mag-outro-subtitle">ȘTIRI CU CONTEXT • ROMÂNIA</div>

        <div class="mag-outro-slogan">
          Dincolo de titluri.<br>
          <em>Mai aproape de adevăr.</em>
        </div>

        <p class="mag-outro-desc">
          Analizăm presa din România din toate unghiurile ca tu să vezi imaginea completă, fără distorsiuni.
        </p>

        <div class="mag-bias-segmented" style="width: 100%; margin-top: 0; margin-bottom: 30px;">
          <div class="mag-seg left">STÂNGA</div>
          <div class="mag-seg center">CENTRU</div>
          <div class="mag-seg right">DREAPTA</div>
        </div>

        <div class="mag-bio-pill">
          <span class="mag-bio-badge">Link în bio</span>
          <span class="mag-bio-label">thesite.ro • Toate perspectivele</span>
        </div>
      </div>
    </div>

  </div>

  <script>
    window.setReelProgress = function(t) {
      document.getElementById('progressFill').style.width = (t * 100) + '%';

      // Cinematic slow Ken Burns zoom
      const zoom = 1.04 + (t * 0.08);
      document.getElementById('bgFull').style.transform = 'scale(' + zoom + ')';

      const s1 = document.getElementById('scene1');
      const s2 = document.getElementById('scene2');
      const s3 = document.getElementById('scene3');
      const s4 = document.getElementById('scene4');

      if (t < 0.28) {
        s1.className = 'mag-scene active';
        s2.className = 'mag-scene';
        s3.className = 'mag-scene';
        s4.className = 'mag-scene';
      } else if (t < 0.56) {
        s1.className = 'mag-scene';
        s2.className = 'mag-scene active';
        s3.className = 'mag-scene';
        s4.className = 'mag-scene';
      } else if (t < 0.82) {
        s1.className = 'mag-scene';
        s2.className = 'mag-scene';
        s3.className = 'mag-scene active';
        s4.className = 'mag-scene';
      } else {
        s1.className = 'mag-scene';
        s2.className = 'mag-scene';
        s3.className = 'mag-scene';
        s4.className = 'mag-scene active';
      }
    };

    window.showScene = function(n) {
      [1, 2, 3, 4].forEach(i => {
        const el = document.getElementById('scene' + i);
        if (el) el.className = (i === n) ? 'mag-scene active' : 'mag-scene';
      });
      document.getElementById('progressFill').style.width = ((n / 4) * 100) + '%';
    };
  </script>
</body>
</html>`;
}

async function renderFullBleedMagazineReel() {
  const html = buildHtml();
  const publicReelsDir = path.join(__dirname, '..', 'public', 'reels');
  const tempFramesDir = path.join(__dirname, '..', 'social_export', 'latest', 'temp_magazine_full');
  fs.mkdirSync(publicReelsDir, { recursive: true });
  fs.mkdirSync(tempFramesDir, { recursive: true });

  console.log('🚀 Rendering FULL-BLEED MAGAZINE REEL (4 Scenes, 16s, 24 FPS)...');
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
    const pngPath = path.join(publicReelsDir, `magazine_fullbleed_scene${s}.png`);
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
  const outputMp4 = path.join(publicReelsDir, 'magazine_fullbleed_reel.mp4');
  console.log(`  🎞️ Encoding ${outputMp4}...`);
  const ffmpegMp4 = `ffmpeg -y -framerate ${fps} -i "${tempFramesDir}/frame_%04d.jpg" -c:v libx264 -preset fast -profile:v high -level:v 4.2 -pix_fmt yuv420p -movflags +faststart "${outputMp4}"`;
  execSync(ffmpegMp4, { stdio: 'ignore' });

  // 4. Encode GIF preview
  const outputGif = path.join(publicReelsDir, 'magazine_fullbleed_reel.gif');
  console.log(`  🎞️ Encoding GIF preview ${outputGif}...`);
  const ffmpegGif = `ffmpeg -y -i "${outputMp4}" -vf "fps=10,scale=360:640:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${outputGif}"`;
  execSync(ffmpegGif, { stdio: 'ignore' });

  // Copy to brain artifacts
  const artifactsDir = '/Users/romica/.gemini/antigravity-ide/brain/4d237397-24b4-481e-91ec-6d0741abd77f/assets';
  fs.copyFileSync(outputMp4, path.join(artifactsDir, 'magazine_fullbleed_reel.mp4'));
  fs.copyFileSync(outputGif, path.join(artifactsDir, 'magazine_fullbleed_reel.gif'));
  for (let s = 1; s <= 4; s++) {
    fs.copyFileSync(path.join(publicReelsDir, `magazine_fullbleed_scene${s}.png`), path.join(artifactsDir, `magazine_fullbleed_scene${s}.png`));
  }

  // Cleanup
  fs.rmSync(tempFramesDir, { recursive: true, force: true });
  console.log('\n🎉 FULL-BLEED MAGAZINE REEL GENERATED SUCCESSFULLY!');
  console.log('  MP4:', outputMp4);
  console.log('  GIF:', outputGif);
}

renderFullBleedMagazineReel().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
