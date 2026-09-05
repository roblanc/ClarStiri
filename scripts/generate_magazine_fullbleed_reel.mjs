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
  kicker: 'PERSPECTIVĂ EDITORIALĂ COMPARATĂ',
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
<title>ClarStiri Full-Bleed Magazine Reel - Instagram Safe Zone</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@700;800;900&display=swap" rel="stylesheet">
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
    transform: scale(1.05);
    filter: brightness(0.88) contrast(110%);
    transition: transform 0.1s linear;
  }

  /* Magazine Multi-Stop Scrim Gradient
     Engineered for Instagram Safe Zone:
     - Top scrim for Reels back button & title (0 - 220px)
     - Clean window for imagery in middle (220px - 750px)
     - Rich dark gradient starting at 800px so content is hyper-legible
     - Solid dark base from 1440px to 1920px so Instagram caption & handle pop cleanly */
  .magazine-scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.72) 0%,
      rgba(0, 0, 0, 0.25) 12%,
      rgba(0, 0, 0, 0.2) 35%,
      rgba(3, 7, 18, 0.78) 55%,
      rgba(3, 7, 18, 0.94) 75%,
      rgba(2, 4, 10, 0.98) 100%
    );
    pointer-events: none;
  }

  .magazine-overlay-texture {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 40%, transparent 50%, rgba(0,0,0,0.55) 100%);
    pointer-events: none;
  }

  /* ========================================================
     INSTAGRAM SAFE ZONE CONTAINER:
     - Top: 150px (under top navigation bar)
     - Left: 64px
     - Right: 180px (COMPLETELY CLEARS the right vertical action column: Like, Comment, Share, Save)
     - Bottom: 490px (COMPLETELY CLEARS Instagram username, caption box, audio ticker & bottom navigation)
     ======================================================== */
  .magazine-layout {
    position: absolute;
    top: 0;
    left: 0;
    width: 1080px;
    height: 1920px;
    padding-top: 150px;
    padding-left: 64px;
    padding-right: 184px;
    padding-bottom: 490px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 10;
  }

  /* Top Progress Bar (Reel timeline) */
  .mag-progress-track {
    position: absolute;
    top: 50px;
    left: 64px;
    right: 64px;
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
    box-shadow: 0 0 8px rgba(255,255,255,0.9);
  }

  /* Magazine Masthead Bar (Inside Safe Zone: Only Logo + thesite.ro) */
  .mag-masthead {
    display: flex;
    align-items: center;
    width: 100%;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.16);
  }
  .masthead-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .masthead-emblem {
    width: 44px;
    height: 44px;
    object-fit: contain;
    filter: invert(1);
  }
  .masthead-wordmark {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 34px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #ffffff;
  }

  /* Scenes Container */
  .mag-scene {
    flex: 1;
    display: none;
    flex-direction: column;
    justify-content: flex-end;
    padding-top: 20px;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .mag-scene.active {
    display: flex;
    opacity: 1;
    transform: translateY(0);
  }

  /* ========================================================
     SCENE 1: COVER (FRAUNCES EDITORIAL)
     ======================================================== */
  .mag-kicker-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #60a5fa;
    margin-bottom: 18px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
  }
  .kicker-rule {
    width: 24px;
    height: 3px;
    background: #60a5fa;
    border-radius: 2px;
  }

  .mag-hero-h1 {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 82px;
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: #ffffff;
    margin-bottom: 20px;
    text-shadow: 0 4px 28px rgba(0, 0, 0, 0.95);
  }
  .mag-hero-h1 em {
    font-style: italic;
    font-weight: 700;
    color: #93c5fd;
  }

  .mag-lead-deck {
    font-size: 26px;
    font-weight: 500;
    line-height: 1.38;
    color: #e2e8f0;
    max-width: 780px;
    margin-bottom: 32px;
    text-shadow: 0 2px 12px rgba(0,0,0,0.8);
  }

  /* Full-Bleed Segmented Bias Bar */
  .mag-bias-segmented {
    display: flex;
    width: 100%;
    height: 74px;
    border-radius: 20px;
    overflow: hidden;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.22);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
  }
  .mag-seg {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 19px;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .mag-seg.left {
    background: rgba(37, 99, 235, 0.9);
    color: #ffffff;
    flex: 0.85;
  }
  .mag-seg.center {
    background: rgba(255, 255, 255, 0.16);
    color: #ffffff;
    border-left: 1px solid rgba(255, 255, 255, 0.16);
    border-right: 1px solid rgba(255, 255, 255, 0.16);
    flex: 1.3;
  }
  .mag-seg.right {
    background: rgba(239, 68, 68, 0.9);
    color: #ffffff;
    flex: 1;
  }

  .mag-footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 22px;
  }
  .mag-footer-text {
    font-size: 22px;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.01em;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
  }
  .mag-circle-indicator {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: #ffffff;
    color: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }

  /* ========================================================
     SCENE 2: THREE HEADLINES SPREAD (FRAUNCES + CARDS)
     ======================================================== */
  .mag-spread-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 46px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.025em;
    color: #ffffff;
    margin-bottom: 24px;
    text-shadow: 0 4px 20px rgba(0,0,0,0.9);
  }
  .mag-spread-title span {
    font-style: italic;
    color: #93c5fd;
  }

  .mag-cards-stack {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-bottom: 24px;
  }
  .mag-card-glass {
    background: rgba(12, 18, 32, 0.88);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 22px;
    padding: 24px 28px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: relative;
  }
  .mag-card-glass.accent-blue {
    border-left: 6px solid #3b82f6;
  }
  .mag-card-glass.accent-gray {
    border-left: 6px solid #94a3b8;
  }
  .mag-card-glass.accent-red {
    border-left: 6px solid #ef4444;
  }

  .mcard-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .mcard-outlet-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .mcard-logo {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .mcard-name {
    font-size: 22px;
    font-weight: 800;
    color: #ffffff;
  }
  .mcard-tag {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 9999px;
  }
  .tag-blue { background: rgba(59, 130, 246, 0.25); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); }
  .tag-gray { background: rgba(255, 255, 255, 0.12); color: #e2e8f0; border: 1px solid rgba(255, 255, 255, 0.2); }
  .tag-red { background: rgba(239, 68, 68, 0.25); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); }

  .mcard-quote {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 24px;
    line-height: 1.32;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: -0.01em;
  }
  .mcard-meta {
    font-size: 16px;
    font-weight: 600;
    color: #94a3b8;
  }

  .mag-social-banner {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 9999px;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 20px;
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
    padding: 16px 0;
  }
  .mag-pull-mark {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 140px;
    line-height: 0.6;
    color: #60a5fa;
    font-weight: 900;
    margin-bottom: 20px;
    text-shadow: 0 0 36px rgba(96, 165, 250, 0.5);
  }
  .mag-pull-text {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 52px;
    line-height: 1.22;
    font-style: italic;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.025em;
    margin-bottom: 28px;
    text-shadow: 0 4px 24px rgba(0,0,0,0.9);
  }
  .mag-speaker-title {
    font-family: 'Syne', sans-serif;
    font-size: 24px;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #ffffff;
    margin-bottom: 6px;
  }
  .mag-speaker-sub {
    font-size: 20px;
    font-weight: 600;
    color: #cbd5e1;
    letter-spacing: 0.02em;
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
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    box-shadow: 0 0 44px rgba(96, 165, 250, 0.25);
    backdrop-filter: blur(16px);
  }
  .mag-seal-emblem img {
    width: 88px;
    height: 88px;
    object-fit: contain;
    filter: invert(1);
  }
  .mag-outro-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 56px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #ffffff;
    margin-bottom: 8px;
  }
  .mag-outro-subtitle {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 32px;
  }
  .mag-outro-slogan {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 50px;
    font-weight: 800;
    line-height: 1.18;
    color: #ffffff;
    margin-bottom: 20px;
  }
  .mag-outro-slogan em {
    font-style: italic;
    color: #93c5fd;
  }
  .mag-outro-desc {
    font-size: 22px;
    font-weight: 500;
    line-height: 1.45;
    color: #cbd5e1;
    max-width: 680px;
    margin-bottom: 32px;
  }
  /* Clean Text-Only CTA (No Capsule Container) */
  .mag-bio-clean {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding-top: 14px;
  }
  .mag-bio-clean-tag {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #60a5fa;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
  }
  .mag-bio-clean-sep {
    color: rgba(255, 255, 255, 0.35);
    font-size: 20px;
  }
  .mag-bio-clean-label {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.01em;
    text-shadow: 0 2px 10px rgba(0,0,0,0.8);
  }

  /* ========================================================
     REALISTIC INSTAGRAM REEL UI SIMULATION OVERLAY
     ======================================================== */
  .ig-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 100;
    display: none; /* toggled via JS/CSS */
  }
  .ig-overlay.active {
    display: block;
  }

  /* Instagram Top Bar */
  .ig-top-bar {
    position: absolute;
    top: 60px;
    left: 48px;
    right: 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .ig-top-left {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 32px;
    font-weight: 700;
  }
  .ig-camera-icon {
    width: 38px;
    height: 38px;
  }

  /* Instagram Right Action Rail */
  .ig-action-rail {
    position: absolute;
    right: 28px;
    bottom: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 36px;
  }
  .ig-action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .ig-action-icon {
    width: 44px;
    height: 44px;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6));
  }
  .ig-action-count {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    text-shadow: 0 2px 6px rgba(0,0,0,0.8);
  }
  .ig-audio-disc {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    border: 2px solid #ffffff;
    background: #1e293b;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.6);
  }

  /* Instagram Bottom Caption Area */
  .ig-bottom-content {
    position: absolute;
    left: 48px;
    right: 170px;
    bottom: 120px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .ig-user-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .ig-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #2563eb;
    border: 2px solid #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 22px;
  }
  .ig-username {
    font-size: 26px;
    font-weight: 800;
    color: #ffffff;
    text-shadow: 0 2px 6px rgba(0,0,0,0.8);
  }
  .ig-follow-btn {
    border: 1px solid rgba(255, 255, 255, 0.6);
    background: transparent;
    color: #ffffff;
    font-size: 18px;
    font-weight: 700;
    padding: 6px 18px;
    border-radius: 10px;
  }
  .ig-caption {
    font-size: 22px;
    line-height: 1.4;
    color: #ffffff;
    text-shadow: 0 2px 8px rgba(0,0,0,0.9);
  }
  .ig-caption span {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 600;
  }
  .ig-audio-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 0 2px 6px rgba(0,0,0,0.8);
  }

  /* Instagram Bottom Navigation Bar */
  .ig-bottom-bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 90px;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0 20px;
  }
  .ig-nav-icon {
    width: 36px;
    height: 36px;
    opacity: 0.9;
  }

  /* Safe Zone Guide Boundary Overlay (for debug / inspection) */
  .safe-zone-guide {
    position: absolute;
    top: 150px;
    left: 64px;
    right: 184px;
    bottom: 490px;
    border: 2px dashed rgba(59, 130, 246, 0.4);
    pointer-events: none;
    border-radius: 16px;
    display: none;
  }
  .safe-zone-guide.active {
    display: block;
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

    <!-- Magazine Masthead (Clean: Only Logo + thesite.ro) -->
    <div class="mag-masthead">
      <div class="masthead-left">
        <img src="${logoBase64}" class="masthead-emblem" alt="">
        <span class="masthead-wordmark">thesite.ro</span>
      </div>
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
        <div style="font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8; margin-bottom: 16px; text-shadow: 0 2px 8px rgba(0,0,0,0.8);">
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

        <div class="mag-bias-segmented" style="width: 100%; margin-top: 0; margin-bottom: 24px;">
          <div class="mag-seg left">STÂNGA</div>
          <div class="mag-seg center">CENTRU</div>
          <div class="mag-seg right">DREAPTA</div>
        </div>

        <div class="mag-bio-clean">
          <span class="mag-bio-clean-tag">Link în bio</span>
          <span class="mag-bio-clean-sep">•</span>
          <span class="mag-bio-clean-label">thesite.ro • Toate perspectivele</span>
        </div>
      </div>
    </div>

  </div>

  <!-- Safe Zone Visual Guide -->
  <div id="safeGuide" class="safe-zone-guide"></div>

  <!-- Instagram Reel UI Overlay Simulation -->
  <div id="igOverlay" class="ig-overlay">
    <!-- Top Bar -->
    <div class="ig-top-bar">
      <div class="ig-top-left">
        <span>‹</span>
        <span>Reels</span>
      </div>
      <svg class="ig-camera-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
      </svg>
    </div>

    <!-- Right Action Rail -->
    <div class="ig-action-rail">
      <!-- Like -->
      <div class="ig-action-item">
        <svg class="ig-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span class="ig-action-count">18.4K</span>
      </div>

      <!-- Comment -->
      <div class="ig-action-item">
        <svg class="ig-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="ig-action-count">421</span>
      </div>

      <!-- Share -->
      <div class="ig-action-item">
        <svg class="ig-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        <span class="ig-action-count">2.1K</span>
      </div>

      <!-- Save -->
      <div class="ig-action-item">
        <svg class="ig-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>

      <!-- More -->
      <div class="ig-action-item">
        <svg class="ig-action-icon" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="2"></circle>
          <circle cx="19" cy="12" r="2"></circle>
          <circle cx="5" cy="12" r="2"></circle>
        </svg>
      </div>

      <!-- Music Disc -->
      <div class="ig-audio-disc">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
      </div>
    </div>

    <!-- Bottom Caption Area -->
    <div class="ig-bottom-content">
      <div class="ig-user-row">
        <div class="ig-avatar">C</div>
        <span class="ig-username">thesite.ro</span>
        <button class="ig-follow-btn">Urmărește</button>
      </div>

      <div class="ig-caption">
        Planul de pace ajunge la Moscova. Emisarii lui Donald Trump au sosit pentru negocieri... <span>mai mult</span>
      </div>

      <div class="ig-audio-row">
        <span>🎵</span>
        <span>Sunet original • thesite.ro - Dosarul Zilei</span>
      </div>
    </div>

    <!-- Bottom Navigation Bar -->
    <div class="ig-bottom-bar">
      <!-- Home -->
      <svg class="ig-nav-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
      <!-- Search -->
      <svg class="ig-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <!-- Reels Active -->
      <svg class="ig-nav-icon" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <polygon points="10 8 16 12 10 16 10 8" fill="#ffffff"></polygon>
      </svg>
      <!-- Heart -->
      <svg class="ig-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <!-- Profile -->
      <div style="width: 32px; height: 32px; border-radius: 50%; background: #ffffff; border: 1px solid #ffffff;"></div>
    </div>
  </div>

  <script>
    window.setReelProgress = function(t) {
      document.getElementById('progressFill').style.width = (t * 100) + '%';

      // Cinematic slow Ken Burns zoom
      const zoom = 1.05 + (t * 0.08);
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

    window.toggleInstagramOverlay = function(show) {
      const el = document.getElementById('igOverlay');
      if (el) {
        el.className = show ? 'ig-overlay active' : 'ig-overlay';
      }
    };

    window.toggleSafeGuide = function(show) {
      const el = document.getElementById('safeGuide');
      if (el) {
        el.className = show ? 'safe-zone-guide active' : 'safe-zone-guide';
      }
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

  console.log('🚀 Rendering FULL-BLEED MAGAZINE REEL with Fraunces & Instagram Safe Zone...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // 1. Capture 4 clean production scene slides (No IG overlay)
  console.log('  📸 Capturing 4 Clean Production Slides...');
  for (let s = 1; s <= 4; s++) {
    await page.evaluate(num => {
      window.showScene(num);
      window.toggleInstagramOverlay(false);
      window.toggleSafeGuide(false);
    }, s);
    await page.waitForTimeout(100);
    const pngPath = path.join(publicReelsDir, `magazine_fullbleed_scene${s}.png`);
    await page.screenshot({ path: pngPath, type: 'png' });
    console.log(`    ✓ Clean Scene ${s}: ${pngPath}`);
  }

  // 2. Capture 4 SIMULATED INSTAGRAM REEL SLIDES (With Instagram Overlay)
  console.log('  📱 Capturing 4 Simulated Instagram Reel Slides with UI Overlay...');
  for (let s = 1; s <= 4; s++) {
    await page.evaluate(num => {
      window.showScene(num);
      window.toggleInstagramOverlay(true);
      window.toggleSafeGuide(false);
    }, s);
    await page.waitForTimeout(100);
    const igPngPath = path.join(publicReelsDir, `magazine_fullbleed_ig_simulated_scene${s}.png`);
    await page.screenshot({ path: igPngPath, type: 'png' });
    console.log(`    ✓ Simulated IG Scene ${s}: ${igPngPath}`);
  }

  // 3. Capture video frames for MP4 (Clean, no IG overlay)
  await page.evaluate(() => {
    window.toggleInstagramOverlay(false);
    window.toggleSafeGuide(false);
  });

  const fps = 24;
  const duration = 16;
  const totalFrames = fps * duration;

  console.log(`  🎬 Capturing ${totalFrames} frames for clean MP4...`);
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

  // 4. Encode MP4
  const outputMp4 = path.join(publicReelsDir, 'magazine_fullbleed_reel.mp4');
  console.log(`  🎞️ Encoding ${outputMp4}...`);
  const ffmpegMp4 = `ffmpeg -y -framerate ${fps} -i "${tempFramesDir}/frame_%04d.jpg" -c:v libx264 -preset fast -profile:v high -level:v 4.2 -pix_fmt yuv420p -movflags +faststart "${outputMp4}"`;
  execSync(ffmpegMp4, { stdio: 'ignore' });

  // 5. Encode GIF preview
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
    fs.copyFileSync(path.join(publicReelsDir, `magazine_fullbleed_ig_simulated_scene${s}.png`), path.join(artifactsDir, `magazine_fullbleed_ig_simulated_scene${s}.png`));
  }

  // Cleanup
  fs.rmSync(tempFramesDir, { recursive: true, force: true });
  console.log('\n🎉 FULL-BLEED MAGAZINE REEL GENERATED SUCCESSFULLY!');
  console.log('  MP4:', outputMp4);
  console.log('  GIF:', outputGif);
  console.log('  Simulated IG Slides: magazine_fullbleed_ig_simulated_scene[1-4].png');
}

renderFullBleedMagazineReel().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
