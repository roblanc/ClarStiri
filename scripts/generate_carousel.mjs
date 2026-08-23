import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFaviconUrl(url) {
  try {
    if (!url) return null;
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
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

  const leftFavicon = getFaviconUrl(sampleLeft.source?.url || sampleLeft.url);
  const centerFavicon = getFaviconUrl(sampleCenter.source?.url || sampleCenter.url);
  const rightFavicon = getFaviconUrl(sampleRight.source?.url || sampleRight.url);

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
        gap: 14px;
      }
      .story-title {
        font-size: 46px;
        font-weight: 900;
        line-height: 1.25;
        color: #ffffff;
        letter-spacing: -0.02em;
        text-shadow: 0 4px 16px rgba(0,0,0,0.6);
      }
      .watermark-site {
        font-size: 16px;
        font-weight: 600;
        color: rgba(255,255,255,0.85);
      }
      .bottom-bias-bar {
        display: flex;
        width: 100%;
        height: 210px;
        border-top: 2px solid #000;
      }
      .bias-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 6px;
      }
      .col-left { background: #23497d; color: #ffffff; }
      .col-center { background: #ffffff; color: #1e293b; }
      .col-right { background: #7e2226; color: #ffffff; }
      
      .col-label {
        font-size: 16px;
        font-weight: 900;
        letter-spacing: 0.15em;
        text-transform: uppercase;
      }
      .col-percent {
        font-size: 56px;
        font-weight: 900;
        line-height: 1;
      }
    </style>
  </head>
  <body>
    <div class="card-container">
      <div class="hero-section">
        <img class="hero-bg-img" src="${image}" alt="hero" />
        <div class="hero-gradient"></div>

        <div class="top-badges-row">
          <div class="left-badges">
            <div class="badge-sources">${totalSources} SURSE</div>
            <div class="badge-time">${story.timeAgo || 'acum 20 min'}</div>
          </div>
          <div class="badge-dominant">${dominantBadgeLabel}</div>
        </div>

        <div class="headline-area">
          <h1 class="story-title">${story.title}</h1>
          <div class="watermark-site">thesite.ro</div>
        </div>
      </div>

      <div class="bottom-bias-bar">
        <div class="bias-col col-left">
          <span class="col-label">STÂNGA</span>
          <span class="col-percent">${left}%</span>
        </div>
        <div class="bias-col col-center">
          <span class="col-label">CENTRU</span>
          <span class="col-percent">${center}%</span>
        </div>
        <div class="bias-col col-right">
          <span class="col-label">DREAPTA</span>
          <span class="col-percent">${right}%</span>
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

  // SLIDE 2: Modern Editorial Light (White background with dotted grid)
  const slide2 = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      ${commonStyle}
      body {
        background-color: #fafafc;
        background-image: radial-gradient(rgba(0, 0, 0, 0.14) 1.5px, transparent 1.5px);
        background-size: 24px 24px;
        color: #0f172a;
      }
      .slide-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 60px 56px;
      }
      .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 24px;
        border-bottom: 2px solid rgba(0, 0, 0, 0.06);
      }
      .brand-mark {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .brand-name {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 34px;
        font-weight: 800;
        color: #000000;
        letter-spacing: -0.02em;
      }
      .brand-badge {
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        background: #000000;
        padding: 6px 14px;
        border-radius: 6px;
        color: #ffffff;
      }
      .slide-step {
        font-size: 14px;
        font-weight: 800;
        color: #64748b;
        letter-spacing: 0.05em;
      }
      
      .title-block {
        margin-top: 24px;
        margin-bottom: 20px;
      }
      .category-kicker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: #2563eb;
        margin-bottom: 10px;
      }
      .category-kicker::before {
        content: '';
        display: inline-block;
        width: 8px;
        height: 8px;
        background: #2563eb;
        border-radius: 50%;
      }
      .main-heading {
        font-size: 42px;
        font-weight: 900;
        line-height: 1.15;
        letter-spacing: -0.03em;
        color: #0f172a;
      }

      .cards-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
        flex: 1;
        justify-content: center;
      }

      .perspective-card {
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 18px;
        padding: 28px 32px;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 14px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.03);
      }
      .perspective-card::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 7px;
      }
      .card-left::before { background: #2563eb; }
      .card-center::before { background: #0f172a; }
      .card-right::before { background: #e11d48; }

      .card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .outlet-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .favicon-img {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        object-fit: cover;
        background: #fff;
        padding: 2px;
      }
      .outlet-avatar {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 900;
      }
      .av-left { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
      .av-center { background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; }
      .av-right { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }

      .outlet-name {
        font-size: 18px;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.01em;
      }

      .bias-tag {
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        padding: 6px 14px;
        border-radius: 6px;
      }
      .tag-left { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
      .tag-center { background: #f8fafc; color: #0f172a; border: 1px solid #cbd5e1; }
      .tag-right { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }

      .quote-text {
        font-size: 23px;
        font-weight: 800;
        line-height: 1.35;
        color: #1e293b;
        letter-spacing: -0.01em;
      }

      .footer-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 14px;
        padding: 18px 28px;
        margin-top: 20px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
      }
      .footer-hint {
        font-size: 14px;
        font-weight: 600;
        color: #64748b;
      }
      .footer-action {
        font-size: 14px;
        font-weight: 900;
        color: #000000;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    </style>
  </head>
  <body>
    <div class="slide-wrapper">
      <div class="header-row">
        <div class="brand-mark">
          <span class="brand-name">thesite.ro</span>
          <span class="brand-badge">Perspectivă 360°</span>
        </div>
        <span class="slide-step">02 / 03</span>
      </div>

      <div class="title-block">
        <div class="category-kicker">Comparație Titluri</div>
        <h1 class="main-heading">Același eveniment, 3 unghiuri diferite</h1>
      </div>

      <div class="cards-container">
        <!-- Stânga -->
        <div class="perspective-card card-left">
          <div class="card-top">
            <div class="outlet-wrap">
              ${leftFavicon ? `<img class="favicon-img" src="${leftFavicon}" alt="favicon" />` : `<div class="outlet-avatar av-left">${leftInitials}</div>`}
              <span class="outlet-name">${leftName}</span>
            </div>
            <span class="bias-tag tag-left">Stânga</span>
          </div>
          <div class="quote-text">
            „${sampleLeft.title}”
          </div>
        </div>

        <!-- Centru -->
        <div class="perspective-card card-center">
          <div class="card-top">
            <div class="outlet-wrap">
              ${centerFavicon ? `<img class="favicon-img" src="${centerFavicon}" alt="favicon" />` : `<div class="outlet-avatar av-center">${centerInitials}</div>`}
              <span class="outlet-name">${centerName}</span>
            </div>
            <span class="bias-tag tag-center">Centru</span>
          </div>
          <div class="quote-text">
            „${sampleCenter.title}”
          </div>
        </div>

        <!-- Dreapta -->
        <div class="perspective-card card-right">
          <div class="card-top">
            <div class="outlet-wrap">
              ${rightFavicon ? `<img class="favicon-img" src="${rightFavicon}" alt="favicon" />` : `<div class="outlet-avatar av-right">${rightInitials}</div>`}
              <span class="outlet-name">${rightName}</span>
            </div>
            <span class="bias-tag tag-right">Dreapta</span>
          </div>
          <div class="quote-text">
            „${sampleRight.title}”
          </div>
        </div>
      </div>

      <div class="footer-bar">
        <span class="footer-hint">Vezi cum limbajul schimbă nuanța</span>
        <span class="footer-action">Glisează pentru sinteză ➔</span>
      </div>
    </div>
  </body>
  </html>
  `;

  // SLIDE 3: White Dotted Authority CTA & Outro
  const slide3 = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      ${commonStyle}
      body {
        background-color: #fafafc;
        background-image: radial-gradient(rgba(0, 0, 0, 0.14) 1.5px, transparent 1.5px);
        background-size: 24px 24px;
        color: #0f172a;
      }
      .slide-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 64px 56px;
        text-align: center;
      }
      .top-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid rgba(0, 0, 0, 0.06);
        padding-bottom: 24px;
      }
      .brand-title {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-size: 34px;
        font-weight: 800;
        color: #000000;
      }
      .tagline-badge {
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #000000;
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.12);
        padding: 6px 14px;
        border-radius: 6px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      }

      .main-cta-box {
        margin: auto 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 24px;
        padding: 56px 44px;
        box-shadow: 0 15px 40px -5px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03);
      }
      .pill-kicker {
        background: #10b981;
        color: #ffffff;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        padding: 8px 22px;
        border-radius: 100px;
        margin-bottom: 24px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
      }
      .cta-heading {
        font-size: 50px;
        font-weight: 900;
        line-height: 1.1;
        letter-spacing: -0.03em;
        margin-bottom: 20px;
        color: #0f172a;
      }
      .cta-description {
        font-size: 21px;
        color: #475569;
        line-height: 1.5;
        max-width: 760px;
        margin-bottom: 40px;
        font-weight: 500;
      }
      .cta-description strong {
        color: #0f172a;
        font-weight: 800;
      }

      .spectrum-preview {
        width: 100%;
        max-width: 600px;
        display: flex;
        height: 52px;
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 36px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      }
      .spec-left { background: #2563eb; color: #ffffff; flex: 1; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; letter-spacing: 0.08em; }
      .spec-center { background: #0f172a; color: #ffffff; flex: 1; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; letter-spacing: 0.08em; }
      .spec-right { background: #e11d48; color: #ffffff; flex: 1; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; letter-spacing: 0.08em; }

      .action-button {
        background: #000000;
        color: #ffffff;
        font-size: 20px;
        font-weight: 900;
        padding: 20px 48px;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      }

      .bottom-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 2px solid rgba(0, 0, 0, 0.06);
        padding-top: 24px;
        color: #64748b;
        font-size: 14px;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <div class="slide-wrapper">
      <div class="top-header">
        <span class="brand-title">thesite.ro</span>
        <span class="tagline-badge">Harta presei românești</span>
      </div>

      <div class="main-cta-box">
        <div class="pill-kicker">DECIDE TU CE SĂ CREZI</div>
        <h2 class="cta-heading">Ieși din bula de știri.</h2>
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
