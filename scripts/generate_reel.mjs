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

function getBase64DataUri(filePath, mimeType = 'image/png') {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath).toString('base64');
    return `data:${mimeType};base64,${data}`;
  }
  return '';
}

const logoBase64 = getBase64DataUri(path.join(__dirname, '..', 'public', 'logo_minimal.png'), 'image/png');

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
  if (norm.includes('dcnews')) return 'https://www.thesite.ro/logos/dcnews.png';
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
    outlet: 'G4Media.ro',
    logo: 'https://www.thesite.ro/logos/g4media.png',
    title: leftItem?.title || story.title
  };
  const fallbackCenter = {
    outlet: 'Digi24.ro',
    logo: 'https://www.thesite.ro/logos/digi24.png',
    title: centerItem?.title || story.title
  };
  const fallbackRight = {
    outlet: 'DCNews.ro',
    logo: 'https://www.thesite.ro/logos/dcnews.png',
    title: rightItem?.title || story.title
  };

  return {
    left: {
      outlet: leftItem?.source?.name || fallbackLeft.outlet,
      logo: getLogoUrl(leftItem?.source?.name, leftItem?.source?.id) || fallbackLeft.logo,
      title: leftItem?.title || fallbackLeft.title,
      time: 'perspectivă stânga'
    },
    center: {
      outlet: centerItem?.source?.name || fallbackCenter.outlet,
      logo: getLogoUrl(centerItem?.source?.name, centerItem?.source?.id) || fallbackCenter.logo,
      title: centerItem?.title || fallbackCenter.title,
      time: 'perspectivă centru'
    },
    right: {
      outlet: rightItem?.source?.name || fallbackRight.outlet,
      logo: getLogoUrl(rightItem?.source?.name, rightItem?.source?.id) || fallbackRight.logo,
      title: rightItem?.title || fallbackRight.title,
      time: 'perspectivă dreapta'
    }
  };
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildReelHtml(story) {
  const left = Math.round(story.bias?.left || 0);
  const center = Math.round(story.bias?.center || 0);
  const right = Math.round(story.bias?.right || 0);
  const totalSources = story.sourcesCount || story.sources?.length || 0;
  const headlines = getHeadlines(story);

  const coverImage = story.image || story.imageUrl || story.sources?.find(s => s.imageUrl)?.imageUrl || 'https://www.thesite.ro/hero-illustration-headphones.webp';

  // Title split into hero and sub
  let titleHero = (story.title || '').trim();
  let titleSub = '';
  const splitDelimiters = [': ', ' - ', ' — ', ' | '];
  for (const delim of splitDelimiters) {
    if (titleHero.includes(delim)) {
      const parts = titleHero.split(delim);
      titleHero = parts[0].trim();
      titleSub = parts.slice(1).join(delim).trim();
      break;
    }
  }
  if (!titleSub && titleHero.length > 50) {
    const words = titleHero.split(' ');
    const mid = Math.ceil(words.length / 2);
    titleHero = words.slice(0, mid).join(' ');
    titleSub = words.slice(mid).join(' ');
  }

  const titleLength = (story.title || '').length;
  const heroFontSize = titleLength > 120 ? '44px' : titleLength > 80 ? '48px' : '52px';

  const kicker = (story.category ? `${story.category.toUpperCase()} • ` : '') + 'PERSPECTIVĂ EDITORIALĂ COMPARATĂ';
  let leadText = story.summary || story.description || 'Cum este reflectat acest subiect în principalele redacții din presa românească?';
  if (leadText.length > 120) {
    leadText = leadText.slice(0, 115).trim() + '...';
  }

  let quoteText = story.quote || story.keyQuote;
  if (!quoteText) {
    if (story.summary && story.summary.length > 30) {
      quoteText = `„${story.summary.slice(0, 140).trim()}...”`;
    } else {
      quoteText = `„${story.title}”`;
    }
  } else if (!quoteText.startsWith('„') && !quoteText.startsWith('"')) {
    quoteText = `„${quoteText}”`;
  }

  const speaker = story.speaker || 'ANALIZĂ DE PRESĂ';
  const speakerRole = story.speakerRole || `Monitorizare pe ${totalSources || 12} redacții naționale • thesite.ro`;

  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<title>ClarStiri Full-Bleed Magazine Reel</title>
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

  /* Photo Section in Upper Half - completely dedicated, zero text overlap */
  .fullbleed-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 1080px;
    height: 860px;
    background: #000000;
    overflow: hidden;
    z-index: 1;
  }

  .photo-center-stage {
    position: absolute;
    inset: 0;
    width: 1080px;
    height: 860px;
    overflow: hidden;
  }

  .fullbleed-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 20%;
    transform: scale(1.05);
    filter: brightness(0.96) contrast(105%);
    transition: transform 0.1s linear;
  }

  /* Deep Atmospheric Black Fades Top & Bottom of photo */
  .black-fade-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 240px;
    background: linear-gradient(
      180deg,
      #000000 0%,
      rgba(0, 0, 0, 0.75) 45%,
      transparent 100%
    );
    pointer-events: none;
    z-index: 2;
  }

  .black-fade-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 320px;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(0, 0, 0, 0.35) 30%,
      rgba(0, 0, 0, 0.85) 70%,
      #000000 100%
    );
    pointer-events: none;
    z-index: 2;
  }

  /* Instagram Reel Safe Zone Layout */
  .magazine-layout {
    position: absolute;
    top: 0;
    left: 0;
    width: 1080px;
    height: 1920px;
    padding-top: 140px;
    padding-left: 64px;
    padding-right: 184px;
    padding-bottom: 490px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 10;
  }

  /* Top Progress Bar */
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

  /* Masthead (Logo + thesite.ro) */
  .mag-masthead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-bottom: 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.16);
    position: relative;
    z-index: 20;
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
    display: none !important;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .mag-scene.active {
    display: flex !important;
    opacity: 1;
    transform: translateY(0);
  }

  /* SCENE 1: COVER - Text strictly in lower half below photo */
  #scene1.active {
    display: flex !important;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    text-align: left;
    height: 100%;
    padding-top: 660px; /* leaves upper 840px strictly for photo */
  }
  .mag-kicker-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #60a5fa;
    margin-bottom: 14px;
  }
  .kicker-rule {
    width: 24px;
    height: 3px;
    background: #60a5fa;
    border-radius: 2px;
  }

  .mag-hero-h1 {
    font-family: 'Fraunces', Georgia, serif;
    font-size: ${heroFontSize};
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.025em;
    color: #ffffff;
    margin-bottom: 16px;
    text-align: left;
  }
  .mag-hero-h1 em {
    font-style: italic;
    font-weight: 700;
    color: #93c5fd;
  }

  .mag-lead-deck {
    font-size: 22px;
    font-weight: 500;
    line-height: 1.35;
    color: #cbd5e1;
    max-width: 820px;
    margin-bottom: 24px;
    text-align: left;
  }

  /* Segmented Bias Bar */
  .mag-bias-segmented {
    display: flex;
    width: 100%;
    height: 64px;
    border-radius: 18px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
  .mag-seg {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .mag-seg.left {
    background: rgba(37, 99, 235, 0.95);
    color: #ffffff;
    flex: ${Math.max(left, 15)};
  }
  .mag-seg.center {
    background: rgba(255, 255, 255, 0.16);
    color: #ffffff;
    border-left: 1px solid rgba(255, 255, 255, 0.16);
    border-right: 1px solid rgba(255, 255, 255, 0.16);
    flex: ${Math.max(center, 15)};
  }
  .mag-seg.right {
    background: rgba(239, 68, 68, 0.95);
    color: #ffffff;
    flex: ${Math.max(right, 15)};
  }

  .mag-footer-row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    margin-top: 18px;
  }
  .mag-footer-text {
    font-size: 20px;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.01em;
  }
  .mag-circle-indicator {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #ffffff;
    color: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.5);
  }

  /* SCENE 2: THREE HEADLINES - Pure dark editorial, zero photo underneath */
  #scene2.active {
    display: flex !important;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 30px;
    height: 100%;
  }
  .mag-spread-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 48px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.025em;
    color: #ffffff;
    margin-bottom: 24px;
    text-align: left;
  }
  .mag-spread-title span {
    font-style: italic;
    color: #93c5fd;
  }

  .mag-cards-stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }
  .mag-card-glass {
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 20px;
    padding: 22px 26px;
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
    background: #ffffff;
  }
  .mcard-name {
    font-size: 24px;
    font-weight: 800;
    color: #ffffff;
  }
  .mcard-tag {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 9999px;
  }
  .tag-blue { background: rgba(59, 130, 246, 0.25); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); }
  .tag-gray { background: rgba(255, 255, 255, 0.12); color: #e2e8f0; border: 1px solid rgba(255, 255, 255, 0.2); }
  .tag-red { background: rgba(239, 68, 68, 0.25); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); }

  .mcard-quote {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 26px;
    line-height: 1.3;
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
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 9999px;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
  }
  .mag-social-banner b {
    color: #60a5fa;
  }

  /* SCENE 3: PULL-QUOTE */
  #scene3.active {
    display: flex !important;
    flex-direction: column;
    justify-content: space-between;
    padding-top: 40px;
    height: 100%;
  }
  .mag-quote-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 16px 0;
  }
  .mag-pull-mark {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 130px;
    line-height: 0.6;
    color: #60a5fa;
    font-weight: 900;
    margin-bottom: 24px;
    text-shadow: 0 0 36px rgba(96, 165, 250, 0.5);
  }
  .mag-pull-text {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 46px;
    line-height: 1.25;
    font-style: italic;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.025em;
    margin-bottom: 28px;
  }
  .mag-speaker-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #ffffff;
    margin-bottom: 6px;
  }
  .mag-speaker-sub {
    font-size: 18px;
    font-weight: 600;
    color: #cbd5e1;
    letter-spacing: 0.02em;
  }

  /* SCENE 4: OUTRO */
  #scene4.active {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding-top: 40px;
    height: 100%;
  }
  .mag-outro-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
  }
  .mag-outro-logo-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  .mag-outro-logo-img {
    width: 110px;
    height: 110px;
    object-fit: contain;
    filter: invert(1) drop-shadow(0 6px 26px rgba(96, 165, 250, 0.45));
  }
  .mag-outro-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 52px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #ffffff;
    margin-bottom: 6px;
  }
  .mag-outro-subtitle {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 28px;
  }
  .mag-outro-slogan {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 46px;
    font-weight: 800;
    line-height: 1.18;
    color: #ffffff;
    margin-bottom: 18px;
  }
  .mag-outro-slogan em {
    font-style: italic;
    color: #93c5fd;
  }
  .mag-outro-desc {
    font-size: 20px;
    font-weight: 500;
    line-height: 1.45;
    color: #cbd5e1;
    max-width: 680px;
    margin-bottom: 28px;
  }
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
  }
  .mag-bio-clean-sep {
    color: rgba(255, 255, 255, 0.35);
    font-size: 20px;
  }
  .mag-bio-clean-label {
    font-size: 22px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.01em;
  }
</style>
</head>
<body>

  <!-- Top Dedicated Photo Layer (Scene 1 only) -->
  <div class="fullbleed-layer">
    <div class="photo-center-stage">
      <img id="bgFull" src="${coverImage}" class="fullbleed-img" alt="" onerror="this.src='https://www.thesite.ro/hero-illustration-headphones.webp'">
    </div>
    <div class="black-fade-top"></div>
    <div class="black-fade-bottom"></div>
  </div>

  <div class="magazine-layout">

    <!-- Progress Line -->
    <div class="mag-progress-track">
      <div id="progressFill" class="mag-progress-fill"></div>
    </div>

    <!-- Magazine Masthead -->
    <div class="mag-masthead">
      <div class="masthead-left">
        ${logoBase64 ? `<img src="${logoBase64}" class="masthead-emblem" alt="">` : ''}
        <span class="masthead-wordmark">thesite.ro</span>
      </div>
    </div>

    <!-- SCENE 1: COVER (0 - 4.5s) -->
    <div id="scene1" class="mag-scene active">
      <div style="display: flex; flex-direction: column; align-items: flex-start; text-align: left; width: 100%;">
        <div class="mag-kicker-pill">
          <span class="kicker-rule"></span> ${escapeHtml(kicker)}
        </div>
        <h1 class="mag-hero-h1">
          ${escapeHtml(titleHero)}${titleSub ? `<br><em>${escapeHtml(titleSub)}</em>` : ''}
        </h1>
        <p class="mag-lead-deck">${escapeHtml(leadText)}</p>
      </div>

      <div style="width: 100%;">
        <div class="mag-bias-segmented">
          <div class="mag-seg left">STÂNGA ${left}%</div>
          <div class="mag-seg center">CENTRU ${center}%</div>
          <div class="mag-seg right">DREAPTA ${right}%</div>
        </div>

        <div class="mag-footer-row">
          <span class="mag-footer-text">Știri din toate perspectivele.</span>
          <div class="mag-circle-indicator">➔</div>
        </div>
      </div>
    </div>

    <!-- SCENE 2: THREE HEADLINES (4.5s - 9.0s) -->
    <div id="scene2" class="mag-scene">
      <h2 class="mag-spread-title">
        Același eveniment,<br><span>trei perspective diferite.</span>
      </h2>

      <div class="mag-cards-stack">
        <!-- Left -->
        <div class="mag-card-glass accent-blue">
          <div class="mcard-top">
            <div class="mcard-outlet-group">
              ${headlines.left.logo ? `<img src="${headlines.left.logo}" class="mcard-logo" alt="">` : ''}
              <span class="mcard-name">${escapeHtml(headlines.left.outlet)}</span>
            </div>
            <span class="mcard-tag tag-blue">STÂNGA</span>
          </div>
          <div class="mcard-quote">„${escapeHtml(headlines.left.title)}”</div>
          <div class="mcard-meta">${escapeHtml(headlines.left.time)}</div>
        </div>

        <!-- Center -->
        <div class="mag-card-glass accent-gray">
          <div class="mcard-top">
            <div class="mcard-outlet-group">
              ${headlines.center.logo ? `<img src="${headlines.center.logo}" class="mcard-logo" alt="">` : ''}
              <span class="mcard-name">${escapeHtml(headlines.center.outlet)}</span>
            </div>
            <span class="mcard-tag tag-gray">CENTRU</span>
          </div>
          <div class="mcard-quote">„${escapeHtml(headlines.center.title)}”</div>
          <div class="mcard-meta">${escapeHtml(headlines.center.time)}</div>
        </div>

        <!-- Right -->
        <div class="mag-card-glass accent-red">
          <div class="mcard-top">
            <div class="mcard-outlet-group">
              ${headlines.right.logo ? `<img src="${headlines.right.logo}" class="mcard-logo" alt="">` : ''}
              <span class="mcard-name">${escapeHtml(headlines.right.outlet)}</span>
            </div>
            <span class="mcard-tag tag-red">DREAPTA</span>
          </div>
          <div class="mcard-quote">„${escapeHtml(headlines.right.title)}”</div>
          <div class="mcard-meta">${escapeHtml(headlines.right.time)}</div>
        </div>
      </div>

      <div class="mag-social-banner">
        <span>Comparația completă a titlurilor • <b>Link în bio</b></span>
      </div>
    </div>

    <!-- SCENE 3: PULL-QUOTE (9.0s - 13.0s) -->
    <div id="scene3" class="mag-scene">
      <div class="mag-quote-center">
        <div class="mag-pull-mark">“</div>
        <div class="mag-pull-text">${escapeHtml(quoteText)}</div>
        <div class="mag-speaker-title">— ${escapeHtml(speaker)}</div>
        <div class="mag-speaker-sub">${escapeHtml(speakerRole)}</div>
      </div>

      <div>
        <div style="font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8; margin-bottom: 14px;">
          DISTRIBUȚIA ÎN REDACȚIILE DIN ROMÂNIA
        </div>
        <div class="mag-bias-segmented">
          <div class="mag-seg left">STÂNGA ${left}%</div>
          <div class="mag-seg center">CENTRU ${center}%</div>
          <div class="mag-seg right">DREAPTA ${right}%</div>
        </div>
        <div class="mag-footer-row">
          <span class="mag-footer-text">Analiză pe ${totalSources || 12} redacții naționale.</span>
          <div class="mag-circle-indicator">➔</div>
        </div>
      </div>
    </div>

    <!-- SCENE 4: BACK COVER (13.0s - 16.0s) -->
    <div id="scene4" class="mag-scene">
      <div class="mag-outro-box">
        <div class="mag-outro-logo-wrap">
          ${logoBase64 ? `<img src="${logoBase64}" class="mag-outro-logo-img" alt="">` : ''}
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

  <script>
    window.setReelProgress = function(t) {
      const pFill = document.getElementById('progressFill');
      if (pFill) pFill.style.width = (t * 100) + '%';

      // Cinematic slow Ken Burns zoom
      const zoom = 1.05 + (t * 0.08);
      const bg = document.getElementById('bgFull');
      if (bg) bg.style.transform = 'scale(' + zoom + ')';

      const bgLayer = document.querySelector('.fullbleed-layer');
      const s1 = document.getElementById('scene1');
      const s2 = document.getElementById('scene2');
      const s3 = document.getElementById('scene3');
      const s4 = document.getElementById('scene4');

      if (t < 0.28) {
        if (bgLayer) { bgLayer.style.display = 'block'; bgLayer.style.opacity = '1'; }
        if (s1) s1.className = 'mag-scene active';
        if (s2) s2.className = 'mag-scene';
        if (s3) s3.className = 'mag-scene';
        if (s4) s4.className = 'mag-scene';
      } else if (t < 0.56) {
        if (bgLayer) { bgLayer.style.display = 'none'; bgLayer.style.opacity = '0'; }
        if (s1) s1.className = 'mag-scene';
        if (s2) s2.className = 'mag-scene active';
        if (s3) s3.className = 'mag-scene';
        if (s4) s4.className = 'mag-scene';
      } else if (t < 0.82) {
        if (bgLayer) { bgLayer.style.display = 'none'; bgLayer.style.opacity = '0'; }
        if (s1) s1.className = 'mag-scene';
        if (s2) s2.className = 'mag-scene';
        if (s3) s3.className = 'mag-scene active';
        if (s4) s4.className = 'mag-scene';
      } else {
        if (bgLayer) { bgLayer.style.display = 'none'; bgLayer.style.opacity = '0'; }
        if (s1) s1.className = 'mag-scene';
        if (s2) s2.className = 'mag-scene';
        if (s3) s3.className = 'mag-scene';
        if (s4) s4.className = 'mag-scene active';
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

  console.log('🚀 Launching Playwright for Full-Bleed Magazine Reel generation...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const fps = 24;
  const durationSeconds = 16;
  const totalFrames = fps * durationSeconds;

  console.log(`🎬 Capturing ${totalFrames} frames at ${fps} FPS (1080x1920, 16s)...`);
  for (let i = 0; i < totalFrames; i++) {
    const t = i / totalFrames;
    await page.evaluate(progress => window.setReelProgress(progress), t);
    const frameFile = path.join(tempDir, `frame_${String(i).padStart(4, '0')}.jpg`);
    await page.screenshot({ path: frameFile, type: 'jpeg', quality: 90 });
    if (i % 48 === 0) {
      process.stdout.write(`  Frame ${i}/${totalFrames} (${Math.round(t * 100)}%)\r`);
    }
  }
  console.log(`\n✓ All ${totalFrames} frames captured!`);
  await browser.close();

  // Stitch with FFmpeg
  console.log('🎞️ Encoding MP4 video with FFmpeg...');
  const ffmpegCmd = `ffmpeg -y -framerate ${fps} -i "${tempDir}/frame_%04d.jpg" -c:v libx264 -preset fast -profile:v high -level:v 4.2 -pix_fmt yuv420p -movflags +faststart "${outputPath}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  // Cleanup temp frames
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log(`\n🎉 Reel MP4 video ready: ${outputPath}`);
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

async function main() {
  console.log('📰 Fetching stories for Reel generation...');
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
  console.log('📌 Selected Story for Reel:', story.title);
  console.log(`   Surse: ${story.sourcesCount || story.sources?.length} | Blindspot: ${story.blindspot || 'none'}`);

  const outDir = path.join(__dirname, '..', 'social_export', 'latest');
  fs.mkdirSync(outDir, { recursive: true });
  const videoPath = path.join(outDir, 'reel.mp4');

  await renderReelVideo(story, videoPath);

  // Generare și salvare caption & story metadata pentru auto_post_reel.mjs
  const left = Math.round(story.bias?.left || 0);
  const center = Math.round(story.bias?.center || 0);
  const right = Math.round(story.bias?.right || 0);
  const totalSources = story.sourcesCount || story.sources?.length || 0;

  const caption = `thesite.ro ${story.title}. Vezi știrea din toate perspectivele pe thesite.ro.

📊 ${totalSources} publicații au acoperit subiectul:
• Stânga: ${left}%${story.blindspot === 'left' ? ' (Punct orb)' : ''}
• Centru: ${center}%
• Dreapta: ${right}%${story.blindspot === 'right' ? ' (Punct orb)' : ''}

🔗 Link în bio pentru comparația completă a titlurilor!

#stiri #romania #actualitate #reels #media #bias #presaromana #thesite`;

  const captionPath = path.join(outDir, 'caption.txt');
  fs.writeFileSync(captionPath, caption, 'utf8');
  console.log('📝 Caption salvat pentru Reel în:', captionPath);

  const storyMetaPath = path.join(outDir, 'story.json');
  fs.writeFileSync(storyMetaPath, JSON.stringify(story, null, 2), 'utf8');
  console.log('📝 Story metadata salvat în:', storyMetaPath);
}

main();
