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
  kicker: 'ANALIZĂ EDITORIALĂ • SPECTRU MEDIA',
  titlePart1: 'Planul de pace',
  titlePart2: 'la Moscova.',
  subtitle: 'Cum este reflectată misiunea diplomatică a emisarilor SUA în presa din România?',
  bias: { left: 8, center: 59, right: 33 },
  sourcesCount: 12,
  quote: '„Planul este pe masă. Există o șansă reală să ajungem la o înțelegere istorică pentru încheierea războiului.”',
  speaker: 'Donald Trump',
  speakerRole: 'Misiunea oficială Witkoff & Kushner',
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
<title>ClarStiri • Apple News Style Reel</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,600;0,6..72,700;0,6..72,800;1,6..72,600;1,6..72,700&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: 1080px;
    height: 1920px;
    background: #fbfbfd;
    font-family: -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif;
    color: #1d1d1f;
    overflow: hidden;
    position: relative;
    -webkit-font-smoothing: antialiased;
  }

  /* Reel Canvas */
  .apple-screen {
    width: 1080px;
    height: 1920px;
    padding: 80px 72px 80px 72px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #fbfbfd;
    position: relative;
  }

  /* iOS / Apple News Progress Bar */
  .ios-progress-track {
    position: absolute;
    top: 36px;
    left: 72px;
    right: 72px;
    height: 5px;
    background: rgba(0, 0, 0, 0.08);
    border-radius: 9999px;
    overflow: hidden;
    z-index: 100;
  }
  .ios-progress-fill {
    height: 100%;
    width: 0%;
    background: #0071e3;
    border-radius: 9999px;
  }

  /* Apple News Header */
  .apple-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  .apple-brand {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .apple-brand-logo {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }
  .apple-brand-name {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #1d1d1f;
  }
  .apple-brand-badge {
    background: rgba(0, 113, 227, 0.1);
    color: #0071e3;
    font-size: 14px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 6px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .apple-header-meta {
    font-size: 24px;
    font-weight: 600;
    color: #86868b;
    letter-spacing: -0.01em;
  }

  /* Dynamic Scenes */
  .scene-view {
    flex: 1;
    display: none;
    flex-direction: column;
    justify-content: space-between;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .scene-view.active {
    display: flex;
    opacity: 1;
    transform: translateY(0);
  }

  /* ========================================================
     SCENE 1: APPLE NEWS EDITORIAL COVER
     ======================================================== */
  .apple-kicker {
    font-size: 19px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #0071e3;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .apple-kicker-bar {
    width: 14px;
    height: 3px;
    background: #0071e3;
    border-radius: 2px;
  }

  .apple-headline {
    font-family: 'Newsreader', 'Playfair Display', Georgia, serif;
    font-size: 84px;
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.035em;
    color: #1d1d1f;
    margin-bottom: 24px;
  }

  .apple-subhead {
    font-size: 30px;
    font-weight: 400;
    line-height: 1.4;
    color: #515154;
    margin-bottom: 34px;
    letter-spacing: -0.015em;
  }

  .apple-photo-card {
    width: 100%;
    height: 820px;
    border-radius: 36px;
    overflow: hidden;
    position: relative;
    background: #e5e5ea;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  .apple-photo-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1);
    transition: transform 0.1s linear;
  }
  .apple-photo-credit {
    position: absolute;
    bottom: 24px;
    left: 28px;
    right: 28px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 18px;
    padding: 16px 22px;
    font-size: 19px;
    font-weight: 600;
    color: #1d1d1f;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .apple-credit-label {
    color: #86868b;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* Apple Segmented Bias Control */
  .apple-segmented-bar {
    display: flex;
    background: #f2f2f7;
    padding: 6px;
    border-radius: 24px;
    margin-top: 36px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(0, 0, 0, 0.06);
    height: 80px;
  }
  .apple-segment {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: all 0.2s;
  }
  .apple-segment.left {
    background: #0071e3;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 113, 227, 0.25);
    flex: 0.85;
  }
  .apple-segment.center {
    background: #ffffff;
    color: #1d1d1f;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    flex: 1.3;
  }
  .apple-segment.right {
    background: #ff3b30;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(255, 59, 48, 0.25);
    flex: 1;
  }

  .apple-footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 26px;
  }
  .apple-footer-tagline {
    font-size: 24px;
    font-weight: 700;
    color: #1d1d1f;
    letter-spacing: -0.01em;
  }
  .apple-action-circle {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: #1d1d1f;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  /* ========================================================
     SCENE 2: APPLE NEWS SPOTLIGHT (3 HEADLINE WIDGETS)
     ======================================================== */
  .apple-section-header {
    margin-bottom: 36px;
  }
  .apple-section-kicker {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #86868b;
    margin-bottom: 10px;
  }
  .apple-section-title {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 48px;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.025em;
    color: #1d1d1f;
  }

  .apple-cards-stack {
    display: flex;
    flex-direction: column;
    gap: 26px;
    flex: 1;
    justify-content: center;
  }
  .apple-widget-card {
    background: #ffffff;
    border-radius: 30px;
    padding: 36px 38px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    gap: 18px;
    position: relative;
  }
  .apple-widget-card::before {
    content: '';
    position: absolute;
    top: 36px;
    bottom: 36px;
    left: 0;
    width: 6px;
    border-radius: 0 4px 4px 0;
  }
  .apple-widget-card.left-blue::before { background: #0071e3; }
  .apple-widget-card.left-gray::before { background: #86868b; }
  .apple-widget-card.left-red::before { background: #ff3b30; }

  .apple-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .apple-outlet-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .apple-outlet-logo {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }
  .apple-outlet-title {
    font-size: 26px;
    font-weight: 800;
    color: #1d1d1f;
    letter-spacing: -0.01em;
  }
  .apple-pill-tag {
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 6px 16px;
    border-radius: 9999px;
  }
  .apple-pill-tag.blue { background: rgba(0, 113, 227, 0.1); color: #0071e3; }
  .apple-pill-tag.gray { background: #f2f2f7; color: #515154; }
  .apple-pill-tag.red { background: rgba(255, 59, 48, 0.1); color: #ff3b30; }

  .apple-card-quote {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 30px;
    line-height: 1.34;
    font-weight: 600;
    color: #1d1d1f;
    letter-spacing: -0.01em;
  }
  .apple-card-time {
    font-size: 18px;
    font-weight: 500;
    color: #86868b;
  }

  .apple-pill-banner {
    width: 100%;
    height: 84px;
    background: #ffffff;
    border: 1.5px solid rgba(0, 0, 0, 0.08);
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 23px;
    font-weight: 600;
    color: #515154;
    gap: 10px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
    margin-top: 26px;
  }
  .apple-pill-banner b {
    color: #0071e3;
    font-weight: 800;
  }

  .apple-bio-banner {
    width: 100%;
    background: #f2f2f7;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 28px;
    padding: 22px 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 28px;
  }
  .apple-bio-badge {
    background: #0071e3;
    color: #ffffff;
    font-size: 16px;
    font-weight: 800;
    padding: 8px 18px;
    border-radius: 9999px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .apple-bio-text {
    font-size: 24px;
    font-weight: 700;
    color: #1d1d1f;
    letter-spacing: -0.01em;
  }

  /* Scene 3: Quote Canvas */
  .apple-quote-canvas {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px 0;
  }
  .apple-giant-quote {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 140px;
    line-height: 0.6;
    color: #0071e3;
    font-weight: 700;
    margin-bottom: 24px;
  }
  .apple-quote-text {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 60px;
    line-height: 1.22;
    font-style: italic;
    font-weight: 600;
    color: #1d1d1f;
    letter-spacing: -0.025em;
    margin-bottom: 40px;
  }
  .apple-speaker-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .apple-speaker-name {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #1d1d1f;
  }
  .apple-speaker-detail {
    font-size: 21px;
    font-weight: 500;
    color: #86868b;
  }

  /* Scene 4: Outro Wrap */
  .apple-outro-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .apple-mascot-pod {
    width: 160px;
    height: 160px;
    border-radius: 44px;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 28px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
  }
  .apple-mascot-pod img {
    width: 100px;
    height: 100px;
    object-fit: contain;
  }
  .apple-outro-brand {
    font-size: 58px;
    font-weight: 800;
    letter-spacing: -0.035em;
    color: #1d1d1f;
    margin-bottom: 10px;
  }
  .apple-outro-tagline {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #86868b;
    margin-bottom: 40px;
  }
  .apple-outro-h1 {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 56px;
    font-weight: 700;
    line-height: 1.18;
    color: #1d1d1f;
    margin-bottom: 24px;
    letter-spacing: -0.025em;
  }
  .apple-outro-h1 em {
    font-style: italic;
    color: #0071e3;
  }
  .apple-outro-desc {
    font-size: 24px;
    font-weight: 400;
    line-height: 1.45;
    color: #515154;
    max-width: 740px;
    margin-bottom: 46px;
  }
</style>
</head>
<body>

  <div class="apple-screen">

    <!-- Top iOS Progress Bar -->
    <div class="ios-progress-track">
      <div id="progressFill" class="ios-progress-fill"></div>
    </div>

    <!-- Apple News Global Header -->
    <div class="apple-header">
      <div class="apple-brand">
        <img src="${logoBase64}" class="apple-brand-logo" alt="">
        <span class="apple-brand-name">thesite.ro</span>
        <span class="apple-brand-badge">ClarȘtiri</span>
      </div>
      <div class="apple-header-meta">Ediția Zilei • 0:16</div>
    </div>

    <!-- ========================================================
         SCENE 1: EDITORIAL HERO COVER (0 - 4.5s)
         ======================================================== -->
    <div id="scene1" class="scene-view active">
      <div>
        <div class="apple-kicker">
          <span class="apple-kicker-bar"></span> ${story.kicker}
        </div>
        <h1 class="apple-headline">${story.titlePart1}<br>${story.titlePart2}</h1>
        <p class="apple-subhead">${story.subtitle}</p>
      </div>

      <div class="apple-photo-card">
        <img id="heroPhoto" src="${storyImageBase64}" alt="">
        <div class="apple-photo-credit">
          <span>Întâlnirea Vladimir Putin – Steve Witkoff</span>
          <span class="apple-credit-label">Foto: Mediafax / AP</span>
        </div>
      </div>

      <div>
        <div class="apple-segmented-bar">
          <div class="apple-segment left">STÂNGA ${story.bias.left}%</div>
          <div class="apple-segment center">CENTRU ${story.bias.center}%</div>
          <div class="apple-segment right">DREAPTA ${story.bias.right}%</div>
        </div>

        <div class="apple-footer-row">
          <span class="apple-footer-tagline">Toate unghiurile presei românești.</span>
          <div class="apple-action-circle">➔</div>
        </div>
      </div>
    </div>

    <!-- ========================================================
         SCENE 2: SPOTLIGHT PERSPECTIVES (4.5s - 9.0s)
         ======================================================== -->
    <div id="scene2" class="scene-view">
      <div class="apple-section-header">
        <div class="apple-section-kicker">Comparație Editorială</div>
        <h2 class="apple-section-title">Același eveniment,<br>trei unghiuri diferite.</h2>
      </div>

      <div class="apple-cards-stack">
        <!-- Left -->
        <div class="apple-widget-card left-blue">
          <div class="apple-card-header">
            <div class="apple-outlet-row">
              <img src="${story.headlines.left.logo}" class="apple-outlet-logo" alt="">
              <span class="apple-outlet-title">${story.headlines.left.outlet}</span>
            </div>
            <span class="apple-pill-tag blue">STÂNGA</span>
          </div>
          <div class="apple-card-quote">${story.headlines.left.title}</div>
          <div class="apple-card-time">${story.headlines.left.time}</div>
        </div>

        <!-- Center -->
        <div class="apple-widget-card left-gray">
          <div class="apple-card-header">
            <div class="apple-outlet-row">
              <img src="${story.headlines.center.logo}" class="apple-outlet-logo" alt="">
              <span class="apple-outlet-title">${story.headlines.center.outlet}</span>
            </div>
            <span class="apple-pill-tag gray">CENTRU</span>
          </div>
          <div class="apple-card-quote">${story.headlines.center.title}</div>
          <div class="apple-card-time">${story.headlines.center.time}</div>
        </div>

        <!-- Right -->
        <div class="apple-widget-card left-red">
          <div class="apple-card-header">
            <div class="apple-outlet-row">
              <img src="${story.headlines.right.logo}" class="apple-outlet-logo" alt="">
              <span class="apple-outlet-title">${story.headlines.right.outlet}</span>
            </div>
            <span class="apple-pill-tag red">DREAPTA</span>
          </div>
          <div class="apple-card-quote">${story.headlines.right.title}</div>
          <div class="apple-card-time">${story.headlines.right.time}</div>
        </div>
      </div>

      <div class="apple-pill-banner">
        <span>Comparația completă a titlurilor • <b>Link în bio</b></span>
      </div>
    </div>

    <!-- ========================================================
         SCENE 3: KEY TAKEAWAY / QUOTE (9.0s - 13.0s)
         ======================================================== -->
    <div id="scene3" class="scene-view">
      <div class="apple-quote-canvas">
        <div class="apple-giant-quote">“</div>
        <div class="apple-quote-text">${story.quote}</div>
        <div class="apple-speaker-wrap">
          <div class="apple-speaker-name">— ${story.speaker}</div>
          <div class="apple-speaker-detail">${story.speakerRole}</div>
        </div>
      </div>

      <div>
        <div style="font-size: 17px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #86868b; margin-bottom: 18px;">
          DISTRIBUȚIA OPINIILOR ÎN REDACȚIILE DIN ROMÂNIA
        </div>
        <div class="apple-segmented-bar">
          <div class="apple-segment left">STÂNGA ${story.bias.left}%</div>
          <div class="apple-segment center">CENTRU ${story.bias.center}%</div>
          <div class="apple-segment right">DREAPTA ${story.bias.right}%</div>
        </div>
        <div class="apple-footer-row">
          <span class="apple-footer-tagline">Analiză bazată pe 12 publicații.</span>
          <div class="apple-action-circle">➔</div>
        </div>
      </div>
    </div>

    <!-- ========================================================
         SCENE 4: BRANDED OUTRO / CTA (13.0s - 16.0s)
         ======================================================== -->
    <div id="scene4" class="scene-view">
      <div class="apple-outro-wrap">
        <div class="apple-mascot-pod">
          <img src="${logoBase64}" alt="">
        </div>
        <div class="apple-outro-brand">thesite.ro</div>
        <div class="apple-outro-tagline">Știri cu context • România</div>

        <div class="apple-outro-h1">
          Dincolo de titluri.<br>
          <em>Mai aproape de adevăr.</em>
        </div>

        <p class="apple-outro-desc">
          Analizăm presa din România din toate unghiurile ca tu să vezi imaginea completă, fără distorsiuni.
        </p>

        <div class="apple-segmented-bar" style="width: 100%; margin-top: 0;">
          <div class="apple-segment left">STÂNGA</div>
          <div class="apple-segment center">CENTRU</div>
          <div class="apple-segment right">DREAPTA</div>
        </div>

        <div class="apple-bio-banner">
          <span class="apple-bio-badge">Link în bio</span>
          <span class="apple-bio-text">thesite.ro • Toate perspectivele</span>
        </div>
      </div>
    </div>

  </div>

  <script>
    window.setReelProgress = function(t) {
      document.getElementById('progressFill').style.width = (t * 100) + '%';

      // Subtle photo zoom on Scene 1
      const zoom = 1 + (t * 0.06);
      const photo = document.getElementById('heroPhoto');
      if (photo) photo.style.transform = 'scale(' + zoom + ')';

      const s1 = document.getElementById('scene1');
      const s2 = document.getElementById('scene2');
      const s3 = document.getElementById('scene3');
      const s4 = document.getElementById('scene4');

      if (t < 0.28) {
        s1.className = 'scene-view active';
        s2.className = 'scene-view';
        s3.className = 'scene-view';
        s4.className = 'scene-view';
      } else if (t < 0.56) {
        s1.className = 'scene-view';
        s2.className = 'scene-view active';
        s3.className = 'scene-view';
        s4.className = 'scene-view';
      } else if (t < 0.82) {
        s1.className = 'scene-view';
        s2.className = 'scene-view';
        s3.className = 'scene-view active';
        s4.className = 'scene-view';
      } else {
        s1.className = 'scene-view';
        s2.className = 'scene-view';
        s3.className = 'scene-view';
        s4.className = 'scene-view active';
      }
    };

    window.showScene = function(n) {
      [1, 2, 3, 4].forEach(i => {
        const el = document.getElementById('scene' + i);
        if (el) el.className = (i === n) ? 'scene-view active' : 'scene-view';
      });
      document.getElementById('progressFill').style.width = ((n / 4) * 100) + '%';
    };
  </script>
</body>
</html>`;
}

async function renderAppleNewsReel() {
  const html = buildHtml();
  const publicReelsDir = path.join(__dirname, '..', 'public', 'reels');
  const tempFramesDir = path.join(__dirname, '..', 'social_export', 'latest', 'temp_apple_news');
  fs.mkdirSync(publicReelsDir, { recursive: true });
  fs.mkdirSync(tempFramesDir, { recursive: true });

  console.log('🚀 Rendering APPLE NEWS WHITE MODE REEL (4 Scenes, 16s, 24 FPS)...');
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
    const pngPath = path.join(publicReelsDir, `apple_news_scene${s}.png`);
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
  const outputMp4 = path.join(publicReelsDir, 'apple_news_white_reel.mp4');
  console.log(`  🎞️ Encoding ${outputMp4}...`);
  const ffmpegMp4 = `ffmpeg -y -framerate ${fps} -i "${tempFramesDir}/frame_%04d.jpg" -c:v libx264 -preset fast -profile:v high -level:v 4.2 -pix_fmt yuv420p -movflags +faststart "${outputMp4}"`;
  execSync(ffmpegMp4, { stdio: 'ignore' });

  // 4. Encode GIF preview
  const outputGif = path.join(publicReelsDir, 'apple_news_white_reel.gif');
  console.log(`  🎞️ Encoding GIF preview ${outputGif}...`);
  const ffmpegGif = `ffmpeg -y -i "${outputMp4}" -vf "fps=10,scale=360:640:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${outputGif}"`;
  execSync(ffmpegGif, { stdio: 'ignore' });

  // Copy to brain artifacts
  const artifactsDir = '/Users/romica/.gemini/antigravity-ide/brain/4d237397-24b4-481e-91ec-6d0741abd77f/assets';
  fs.copyFileSync(outputMp4, path.join(artifactsDir, 'apple_news_white_reel.mp4'));
  fs.copyFileSync(outputGif, path.join(artifactsDir, 'apple_news_white_reel.gif'));
  for (let s = 1; s <= 4; s++) {
    fs.copyFileSync(path.join(publicReelsDir, `apple_news_scene${s}.png`), path.join(artifactsDir, `apple_news_scene${s}.png`));
  }

  // Cleanup
  fs.rmSync(tempFramesDir, { recursive: true, force: true });
  console.log('\n🎉 APPLE NEWS WHITE REEL GENERATED SUCCESSFULLY!');
  console.log('  MP4:', outputMp4);
  console.log('  GIF:', outputGif);
}

renderAppleNewsReel().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
