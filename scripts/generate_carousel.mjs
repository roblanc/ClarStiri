import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRAND_LOGO_B64 = (() => {
  try {
    const p = path.join(__dirname, '..', 'public', 'hero-illustration-headphones.webp');
    if (fs.existsSync(p)) {
      return `data:image/webp;base64,${fs.readFileSync(p).toString('base64')}`;
    }
  } catch (e) {}
  return null;
})();

const LOGO_MAP = {
  'g4media': 'g4media.png',
  'hotnews': 'hotnews.png',
  'antena 3': 'antena3.png',
  'antena3': 'antena3.png',
  'digi24': 'digi24.png',
  'digi 24': 'digi24.png',
  'libertatea': 'libertatea.png',
  'adevarul': 'adevarul.png',
  'adevărul': 'adevarul.png',
  'protv': 'protv.png',
  'pro tv': 'protv.png',
  'stirileprotv': 'protv.png',
  'romaniatv': 'romaniatv.png',
  'românia tv': 'romaniatv.png',
  'realitatea': 'realitatea.png',
  'spotmedia': 'spotmedia.png',
  'stiripesurse': 'stiripesurse.png',
  'recorder': 'recorder.png',
  'profit': 'profit.png',
  'profit.ro': 'profit.png',
  'zf': 'zf.png',
  'ziarul financiar': 'zf.png',
  'agerpres': 'agerpres.png',
  'b1tv': 'b1tv.png',
  'b1 tv': 'b1tv.png',
  'biziday': 'biziday.png',
  'bursa': 'bursa.png',
  'capital': 'capital.png',
  'cotidianul': 'cotidianul.png',
  'dcnews': 'dcnews.png',
  'europafm': 'europafm.png',
  'europa fm': 'europafm.png',
  'gandul': 'gandul.png',
  'gândul': 'gandul.png',
  'jurnalul': 'jurnalul.png',
  'mediafax': 'mediafax.png',
  'romanialibera': 'romanialibera.png',
  'românia liberă': 'romanialibera.png',
  'ziaruldeiasi': 'ziaruldeiasi.png',
  'aktual24': 'aktual24.png',
};

function getOutletLogo(sourceObj, fallbackUrl) {
  const name = (sourceObj?.source?.name || sourceObj?.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const cleanKey = name.replace(/^(presa de|ziarul|cotidianul|site-ul|stiri)\s+/i, '').replace(/[^a-z0-9]/g, '');
  
  // Search in local logos
  for (const [key, file] of Object.entries(LOGO_MAP)) {
    const normKey = key.replace(/[^a-z0-9]/g, '');
    if (cleanKey.includes(normKey) || normKey.includes(cleanKey)) {
      const logoPath = path.join(__dirname, '..', 'public', 'logos', file);
      if (fs.existsSync(logoPath)) {
        const b64 = fs.readFileSync(logoPath).toString('base64');
        return `data:image/png;base64,${b64}`;
      }
    }
  }

  // Fallback to Google S2 favicons
  const url = sourceObj?.source?.url || sourceObj?.url || fallbackUrl;
  if (url) {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch {}
  }
  return null;
}

function getFaviconUrl(url) {
  try {
    if (!url) return null;
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
  } catch {
    return null;
  }
}

export function buildHtmlSlides(story) {
  const left = Math.round(story.bias?.left || 0);
  const center = Math.round(story.bias?.center || 0);
  const right = Math.round(story.bias?.right || 0);
  const totalSources = story.sourcesCount || story.sources?.length || 0;
  const blindspot = story.blindspot;
  const image = story.image || 'https://picsum.photos/seed/clarstiri/1200/800';

  let dominantBadgeLabel = 'Preluat de Centru';
  if (blindspot === 'left') dominantBadgeLabel = 'Punct Orbit Stânga';
  else if (blindspot === 'right') dominantBadgeLabel = 'Punct Orbit Dreapta';
  else if (left > center && left > right) dominantBadgeLabel = 'Preluat de Stânga';
  else if (right > center && right > left) dominantBadgeLabel = 'Preluat de Dreapta';

  // Group sources by bias
  const leftSources = (story.sources || []).filter(s => {
    const b = (s.source?.bias || s.bias || '').toLowerCase();
    return b.includes('left');
  });
  const centerSources = (story.sources || []).filter(s => {
    const b = (s.source?.bias || s.bias || '').toLowerCase();
    return b === 'center' || b === '' || (!b.includes('left') && !b.includes('right'));
  });
  const rightSources = (story.sources || []).filter(s => {
    const b = (s.source?.bias || s.bias || '').toLowerCase();
    return b.includes('right');
  });

  const sampleLeft = leftSources[0] || { 
    source: { name: 'Presa de Stânga', url: 'https://g4media.ro', bias: 'left' }, 
    title: story.title 
  };
  const sampleCenter = centerSources[0] || { 
    source: { name: 'Presa de Centru', url: 'https://hotnews.ro', bias: 'center' }, 
    title: story.title 
  };
  const sampleRight = rightSources[0] || { 
    source: { name: 'Presa de Dreapta', url: 'https://antena3.ro', bias: 'right' }, 
    title: story.title 
  };

  const leftLogo = getOutletLogo(sampleLeft, 'https://g4media.ro');
  const centerLogo = getOutletLogo(sampleCenter, 'https://hotnews.ro');
  const rightLogo = getOutletLogo(sampleRight, 'https://antena3.ro');
  const rightFavicon = getFaviconUrl(sampleRight.source?.url || sampleRight.url);

  const titleLength = (story.title || '').length;
  const slide1FontSize = titleLength > 150 ? '34px' : titleLength > 110 ? '38px' : titleLength > 75 ? '42px' : '46px';
  const slide1LineHeight = titleLength > 150 ? '1.2' : '1.25';

  const commonStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,600;1,700&family=Playfair+Display:ital,wght@1,600;1,700;1,800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1350px;
      background: #000000;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #ffffff;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }
  `;

  // SLIDE 1: EXACT CLASSIC SITE CARD LAYOUT (Mirroring the site news block)
  const slide1 = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      ${commonStyle}
      .card-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #000;
      }
      .hero-section {
        position: relative;
        flex: 1;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 48px;
        overflow: hidden;
      }
      .hero-bg-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .hero-gradient {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.98) 100%);
      }
      .top-badges-row {
        position: relative;
        z-index: 10;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
      .left-badges {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .badge-sources {
        background: #1e293b;
        color: #ffffff;
        font-weight: 900;
        font-size: 15px;
        padding: 10px 24px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      .badge-time {
        background: rgba(30, 41, 59, 0.9);
        color: #ffffff;
        font-weight: 800;
        font-size: 15px;
        padding: 10px 24px;
      }
      .badge-dominant {
        background: #ffffff;
        color: #000000;
        font-weight: 800;
        font-size: 15px;
        padding: 10px 24px;
      }
      .headline-area {
        position: relative;
        z-index: 10;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .story-title {
        font-size: ${slide1FontSize};
        font-weight: 900;
        line-height: ${slide1LineHeight};
        color: #ffffff;
        letter-spacing: -0.02em;
        text-shadow: 0 4px 16px rgba(0,0,0,0.6);
      }
      .watermark-site {
        font-size: 16px;
        font-weight: 600;
        color: rgba(255,255,255,0.85);
      }
      .floating-bias-bar {
        display: flex;
        width: 100%;
        height: 120px;
        border-radius: 24px;
        overflow: hidden;
        margin-top: 16px;
        box-shadow: 0 15px 35px rgba(0,0,0,0.6);
        border: 1.5px solid rgba(255,255,255,0.25);
      }
      .bias-col {
        flex: 1;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 12px;
      }
      .col-left { background: #1e3a8a; color: #ffffff; }
      .col-center { background: #f4f4f5; color: #09090b; }
      .col-right { background: #881337; color: #ffffff; }
      
      .col-pct {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 40px;
        font-weight: 900;
        letter-spacing: -0.03em;
        line-height: 1;
      }
      .col-label {
        font-size: 16px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    <div class="card-container">
      <div class="hero-section">
        <img src="${image}" class="hero-bg-img" alt="">
        <div class="hero-gradient"></div>

        <div class="top-badges-row">
          <div class="left-badges">
            <span class="badge-sources">${totalSources} SURSE</span>
            <span class="badge-time">acum 1 zi</span>
          </div>
          <span class="badge-dominant">${dominantBadgeLabel}</span>
        </div>

        <div class="headline-area">
          <h1 class="story-title">${story.title}</h1>
          <div class="watermark-site">thesite.ro</div>

          <div class="floating-bias-bar">
            <div class="bias-col col-left">
              <span class="col-pct">${left}%</span>
              <span class="col-label">Stânga</span>
            </div>
            <div class="bias-col col-center">
              <span class="col-pct">${center}%</span>
              <span class="col-label">Centru</span>
            </div>
            <div class="bias-col col-right">
              <span class="col-pct">${right}%</span>
              <span class="col-label">Dreapta</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  const leftName = sampleLeft.source?.name || sampleLeft.name || 'Presa de Stânga';
  const centerName = sampleCenter.source?.name || sampleCenter.name || 'Presa de Centru';
  const rightName = sampleRight.source?.name || sampleRight.name || 'Presa de Dreapta';

  const getInitials = (name) => {
    if (!name) return 'NEWS';
    const clean = name.replace(/^(Presa de|Ziarul|Cotidianul)\s+/i, '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const leftInitials = getInitials(leftName);
  const centerInitials = getInitials(centerName);
  const rightInitials = getInitials(rightName);

  // SLIDE 2: Matching Exact User Mockup
  const slide2 = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      ${commonStyle}
      body {
        background-color: #fafafc;
        background-image: radial-gradient(rgba(0, 0, 0, 0.11) 1.5px, transparent 1.5px);
        background-size: 24px 24px;
        color: #0f172a;
      }
      .slide-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 64px 64px 56px 64px;
      }
      
      /* Top Header */
      .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 24px;
        border-bottom: 1.5px solid rgba(0, 0, 0, 0.06);
      }
      .brand-group {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .brand-logo-img {
        width: 56px;
        height: 56px;
        object-fit: contain;
      }
      .brand-name {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 44px;
        font-weight: 800;
        color: #000000;
        letter-spacing: -0.02em;
      }
      .header-right-meta {
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .step-blue {
        color: #2563eb;
        font-weight: 900;
      }

      /* Title Block */
      .title-block {
        margin-top: 24px;
        margin-bottom: 18px;
      }
      .kicker-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 900;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #2563eb;
        margin-bottom: 14px;
      }
      .kicker-dot {
        width: 9px;
        height: 9px;
        background: #2563eb;
        border-radius: 50%;
      }
      .main-heading {
        font-family: 'Playfair Display', serif;
        font-size: 68px;
        font-weight: 800;
        line-height: 1.08;
        letter-spacing: -0.03em;
        color: #000000;
      }
      .main-heading .blue-italic {
        color: #2563eb;
        font-style: italic;
        display: block;
      }

      /* Cards Stack */
      .cards-stack {
        display: flex;
        flex-direction: column;
        gap: 20px;
        flex: 1;
        justify-content: center;
        margin: 12px 0;
      }

      .perspective-card {
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 24px;
        padding: 28px 34px;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 18px;
        box-shadow: 0 10px 25px -4px rgba(0, 0, 0, 0.03);
      }
      
      .card-bg-rings {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 280px;
        height: 280px;
        pointer-events: none;
        z-index: 1;
      }
      .card-left .card-bg-rings { color: #2563eb; }
      .card-center .card-bg-rings { color: #64748b; }
      .card-right .card-bg-rings { color: #e11d48; }

      .card-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 2;
      }
      .outlet-meta {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .outlet-logo-box {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        object-fit: contain;
        background: #ffffff;
        padding: 4px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      }
      .outlet-avatar-box {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 900;
      }
      .av-left { background: #0c4a6e; color: #7dd3fc; }
      .av-center { background: #e11d48; color: #ffffff; }
      .av-right { background: #000000; color: #facc15; }

      .outlet-title {
        font-size: 22px;
        font-weight: 700;
        color: #000000;
        letter-spacing: -0.01em;
      }

      .bias-label-right {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      .bias-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .color-left { color: #2563eb; }
      .color-left .bias-dot { background: #2563eb; }

      .color-center { color: #000000; }
      .color-center .bias-dot { background: #000000; }

      .color-right { color: #e11d48; }
      .color-right .bias-dot { background: #e11d48; }

      .quote-container {
        display: flex;
        gap: 18px;
        align-items: stretch;
        position: relative;
        z-index: 2;
      }
      .quote-bar {
        width: 5px;
        border-radius: 4px;
        flex-shrink: 0;
      }
      .bar-left { background: #2563eb; }
      .bar-center { background: #000000; }
      .bar-right { background: #e11d48; }

      .quote-text-content {
        font-size: 26px;
        font-weight: 800;
        line-height: 1.34;
        color: #0f172a;
        letter-spacing: -0.015em;
      }

      /* Footer */
      .footer-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 24px;
        border-top: 1.5px solid rgba(0, 0, 0, 0.06);
      }
      .footer-left-link {
        font-size: 15px;
        font-weight: 700;
        color: #3b82f6;
        text-decoration: underline;
        text-underline-offset: 4px;
      }
      .footer-right-action {
        font-size: 16px;
        font-weight: 900;
        color: #000000;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    </style>
  </head>
  <body>
    <div class="slide-wrapper">
      <!-- Top Header -->
      <div class="header-row">
        <div class="brand-group">
          ${BRAND_LOGO_B64 ? `<img class="brand-logo-img" src="${BRAND_LOGO_B64}" alt="thesite.ro" />` : ''}
          <span class="brand-name">thesite.ro</span>
        </div>
        <div class="header-right-meta">
          <span>PERSPECTIVE MEDIA</span>
          <span>•</span>
          <span class="step-blue">02 / 03</span>
        </div>
      </div>

      <!-- Title Block -->
      <div class="title-block">
        <div class="kicker-row">
          <span class="kicker-dot"></span>
          <span>COMPARAȚIE TITLURI</span>
        </div>
        <h1 class="main-heading">
          Același eveniment,
          <span class="blue-italic">3 unghiuri diferite</span>
        </h1>
      </div>

      <!-- Cards Stack -->
      <div class="cards-stack">
        <!-- Stânga -->
        <div class="perspective-card card-left">
          <svg class="card-bg-rings" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="280" cy="280" r="260" fill="currentColor" fill-opacity="0.05" />
            <circle cx="280" cy="280" r="190" fill="currentColor" fill-opacity="0.08" />
            <circle cx="280" cy="280" r="120" fill="currentColor" fill-opacity="0.12" />
          </svg>
          <div class="card-header-row">
            <div class="outlet-meta">
              ${leftLogo ? `<img class="outlet-logo-box" src="${leftLogo}" alt="logo" />` : `<div class="outlet-avatar-box av-left">${leftInitials}</div>`}
              <span class="outlet-title">${leftName}</span>
            </div>
            <div class="bias-label-right color-left">
              <span class="bias-dot"></span> STÂNGA
            </div>
          </div>
          <div class="quote-container">
            <div class="quote-bar bar-left"></div>
            <div class="quote-text-content">
              „${sampleLeft.title}”
            </div>
          </div>
        </div>

        <!-- Centru -->
        <div class="perspective-card card-center">
          <svg class="card-bg-rings" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="280" cy="280" r="260" fill="currentColor" fill-opacity="0.03" />
            <circle cx="280" cy="280" r="190" fill="currentColor" fill-opacity="0.05" />
            <circle cx="280" cy="280" r="120" fill="currentColor" fill-opacity="0.08" />
          </svg>
          <div class="card-header-row">
            <div class="outlet-meta">
              ${centerLogo ? `<img class="outlet-logo-box" src="${centerLogo}" alt="logo" />` : `<div class="outlet-avatar-box av-center">${centerInitials}</div>`}
              <span class="outlet-title">${centerName}</span>
            </div>
            <div class="bias-label-right color-center">
              <span class="bias-dot"></span> CENTRU
            </div>
          </div>
          <div class="quote-container">
            <div class="quote-bar bar-center"></div>
            <div class="quote-text-content">
              „${sampleCenter.title}”
            </div>
          </div>
        </div>

        <!-- Dreapta -->
        <div class="perspective-card card-right">
          <svg class="card-bg-rings" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="280" cy="280" r="260" fill="currentColor" fill-opacity="0.05" />
            <circle cx="280" cy="280" r="190" fill="currentColor" fill-opacity="0.08" />
            <circle cx="280" cy="280" r="120" fill="currentColor" fill-opacity="0.12" />
          </svg>
          <div class="card-header-row">
            <div class="outlet-meta">
              ${rightLogo ? `<img class="outlet-logo-box" src="${rightLogo}" alt="logo" />` : `<div class="outlet-avatar-box av-right">${rightInitials}</div>`}
              <span class="outlet-title">${rightName}</span>
            </div>
            <div class="bias-label-right color-right">
              <span class="bias-dot"></span> DREAPTA
            </div>
          </div>
          <div class="quote-container">
            <div class="quote-bar bar-right"></div>
            <div class="quote-text-content">
              „${sampleRight.title}”
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Row -->
      <div class="footer-row">
        <span class="footer-left-link">Vezi cum limbajul schimbă nuanța</span>
        <span class="footer-right-action">Glisează pentru sinteză ➔</span>
      </div>
    </div>
  </body>
  </html>
  `;

  // SLIDE 3: Matching CTA Design
  const slide3 = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      ${commonStyle}
      body {
        background-color: #fafafc;
        background-image: radial-gradient(rgba(0, 0, 0, 0.11) 1.5px, transparent 1.5px);
        background-size: 24px 24px;
        color: #0f172a;
      }
      .slide-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 64px 64px 56px 64px;
        text-align: center;
      }
      .top-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1.5px solid rgba(0, 0, 0, 0.06);
        padding-bottom: 24px;
      }
      .brand-group {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .brand-logo-img {
        width: 56px;
        height: 56px;
        object-fit: contain;
      }
      .brand-title {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 44px;
        font-weight: 800;
        color: #000000;
        letter-spacing: -0.02em;
      }
      .tagline-minimal {
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .step-blue {
        color: #2563eb;
        font-weight: 900;
      }

      .center-manifesto {
        margin: auto 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 880px;
        margin-left: auto;
        margin-right: auto;
      }
      .kicker-tag {
        font-size: 14px;
        font-weight: 900;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #10b981;
        margin-bottom: 20px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .kicker-tag::before {
        content: '';
        display: inline-block;
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
      }
      .cta-heading {
        font-family: 'Playfair Display', serif;
        font-size: 68px;
        font-weight: 800;
        line-height: 1.08;
        letter-spacing: -0.03em;
        margin-bottom: 24px;
        color: #000000;
      }
      .cta-heading .blue-italic {
        color: #2563eb;
        font-style: italic;
      }
      .cta-description {
        font-size: 26px;
        color: #475569;
        line-height: 1.55;
        margin-bottom: 44px;
        font-weight: 500;
      }
      .cta-description strong {
        color: #000000;
        font-weight: 800;
      }

      .spectrum-preview {
        width: 100%;
        max-width: 680px;
        display: flex;
        height: 58px;
        border-radius: 14px;
        overflow: hidden;
        margin-bottom: 44px;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
      }
      .spec-left { background: #2563eb; color: #ffffff; flex: 1; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900; letter-spacing: 0.1em; }
      .spec-center { background: #000000; color: #ffffff; flex: 1; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900; letter-spacing: 0.1em; }
      .spec-right { background: #e11d48; color: #ffffff; flex: 1; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900; letter-spacing: 0.1em; }

      .action-button {
        background: #000000;
        color: #ffffff;
        font-size: 24px;
        font-weight: 900;
        padding: 24px 58px;
        border-radius: 16px;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
      }

      .bottom-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1.5px solid rgba(0, 0, 0, 0.06);
        padding-top: 24px;
        color: #64748b;
        font-size: 15px;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <div class="slide-wrapper">
      <div class="top-header">
        <div class="brand-group">
          ${BRAND_LOGO_B64 ? `<img class="brand-logo-img" src="${BRAND_LOGO_B64}" alt="thesite.ro" />` : ''}
          <span class="brand-title">thesite.ro</span>
        </div>
        <div class="tagline-minimal">
          <span>Harta presei românești</span>
          <span>•</span>
          <span class="step-blue">03 / 03</span>
        </div>
      </div>

      <div class="center-manifesto">
        <div class="kicker-tag">DECIDE TU CE SĂ CREZI</div>
        <h2 class="cta-heading">
          Ieși din bula <span class="blue-italic">de știri.</span>
        </h2>
        <p class="cta-description">
          Pe <strong>thesite.ro</strong> grupăm știrile pe subiecte, măsurăm distribuția politică și îți arătăm ce omit publicațiile pe care le citești zilnic.
        </p>

        <div class="spectrum-preview">
          <div class="spec-left">STÂNGA</div>
          <div class="spec-center">CENTRU</div>
          <div class="spec-right">DREAPTA</div>
        </div>

        <div class="action-button">
          <span>🔗 Link în bio: thesite.ro</span>
        </div>
      </div>

      <div class="bottom-footer">
        <span>© thesite.ro — Toate perspectivele la un loc</span>
        <span>Urmărește @thesite.ro</span>
      </div>
    </div>
  </body>
  </html>
  `;

  return { slide1, slide2, slide3 };
}
