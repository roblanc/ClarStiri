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

  // SLIDE 2: Head-to-Head Headlines
  const slide2 = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      ${commonStyle}
      .slide-container {
        position: relative;
        z-index: 2;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 56px;
        background: #090a0f;
      }
      .top-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .section-heading {
        margin-top: 20px;
        margin-bottom: 20px;
      }
      .section-subtitle {
        font-size: 13px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: #f59e0b;
        margin-bottom: 8px;
      }
      .section-title {
        font-size: 36px;
        font-weight: 900;
        line-height: 1.2;
      }
      .cards-stack {
        display: flex;
        flex-direction: column;
        gap: 20px;
        flex: 1;
        justify-content: center;
      }
      .headline-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 26px;
        padding: 26px 32px;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        backdrop-filter: blur(20px);
        box-shadow: 0 15px 35px rgba(0,0,0,0.4);
      }
      .card-left { border-left: 6px solid #38bdf8; }
      .card-center { border-left: 6px solid #f8fafc; }
      .card-right { border-left: 6px solid #f43f5e; }
      
      .card-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }
      .outlet-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .favicon-img {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        object-fit: cover;
        background: #fff;
        padding: 2px;
      }
      .outlet-badge {
        font-size: 12px;
        font-weight: 900;
        padding: 5px 14px;
        border-radius: 8px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .badge-left { background: rgba(56, 189, 248, 0.2); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.4); }
      .badge-center { background: rgba(255, 255, 255, 0.2); color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.3); }
      .badge-right { background: rgba(244, 63, 94, 0.2); color: #fda4af; border: 1px solid rgba(244, 63, 94, 0.4); }

      .outlet-name {
        font-size: 16px;
        font-weight: 800;
        color: #ffffff;
      }
      .headline-quote {
        font-size: 21px;
        font-weight: 800;
        line-height: 1.35;
        color: #ffffff;
      }
      .bottom-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 100px;
        padding: 16px 32px;
        font-size: 14px;
        font-weight: 700;
        backdrop-filter: blur(20px);
      }
    </style>
  </head>
  <body>
    <div class="slide-container">
      <div class="top-nav">
        <div style="display: flex; gap: 12px;">
          <span style="background: #3b82f6; color:#fff; font-weight:900; font-size:13px; padding:8px 18px; border-radius:100px;">COMPARAȚIE TITLURI</span>
        </div>
        <div style="font-family:'Playfair Display', serif; font-style:italic; font-size:22px; font-weight:800; color:#f0eee6;">thesite.ro</div>
      </div>

      <div class="section-heading">
        <div class="section-subtitle">Perspective media</div>
        <h2 class="section-title">Același eveniment, unghiuri diferite</h2>
      </div>

      <div class="cards-stack">
        <!-- Card 1: Stânga -->
        <div class="headline-card card-left">
          <div class="card-meta">
            <div class="outlet-info">
              ${leftFavicon ? `<img class="favicon-img" src="${leftFavicon}" alt="favicon" />` : ''}
              <span class="outlet-name">${sampleLeft.source?.name || 'Sursă Stânga'}</span>
            </div>
            <span class="outlet-badge badge-left">Stânga</span>
          </div>
          <div class="headline-quote">„${sampleLeft.title}”</div>
        </div>

        <!-- Card 2: Centru -->
        <div class="headline-card card-center">
          <div class="card-meta">
            <div class="outlet-info">
              ${centerFavicon ? `<img class="favicon-img" src="${centerFavicon}" alt="favicon" />` : ''}
              <span class="outlet-name">${sampleCenter.source?.name || 'Sursă Centru'}</span>
            </div>
            <span class="outlet-badge badge-center">Centru</span>
          </div>
          <div class="headline-quote">„${sampleCenter.title}”</div>
        </div>

        <!-- Card 3: Dreapta -->
        <div class="headline-card card-right">
          <div class="card-meta">
            <div class="outlet-info">
              ${rightFavicon ? `<img class="favicon-img" src="${rightFavicon}" alt="favicon" />` : ''}
              <span class="outlet-name">${sampleRight.source?.name || 'Sursă Dreapta'}</span>
            </div>
            <span class="outlet-badge badge-right">Dreapta</span>
          </div>
          <div class="headline-quote">„${sampleRight.title}”</div>
        </div>
      </div>

      <div class="bottom-bar">
        <span style="color: rgba(255,255,255,0.7);">Vezi cum limbajul schimbă nuanța</span>
        <span style="color: #fbbf24; font-weight:900;">Glisează pentru sinteză ➔</span>
      </div>
    </div>
  </body>
  </html>
  `;

  // SLIDE 3: Call to Action & Conclusion
  const slide3 = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      ${commonStyle}
      .slide-container {
        position: relative;
        z-index: 2;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 56px;
        background: #090a0f;
      }
      .top-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .cta-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin: auto 0;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.14);
        border-radius: 36px;
        padding: 52px 44px;
        backdrop-filter: blur(20px);
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      }
      .app-badge {
        background: #10b981;
        color: #000;
        font-weight: 900;
        font-size: 13px;
        padding: 8px 22px;
        border-radius: 100px;
        margin-bottom: 24px;
        letter-spacing: 0.1em;
      }
      .cta-title {
        font-size: 46px;
        font-weight: 900;
        line-height: 1.15;
        letter-spacing: -0.03em;
        margin-bottom: 20px;
      }
      .cta-desc {
        font-size: 20px;
        color: rgba(255,255,255,0.8);
        line-height: 1.5;
        max-width: 780px;
        margin-bottom: 36px;
        font-weight: 500;
      }
      .cta-button {
        background: #f2efe6;
        color: #000;
        font-size: 22px;
        font-weight: 900;
        padding: 20px 48px;
        border-radius: 100px;
        box-shadow: 0 12px 35px rgba(0,0,0,0.6);
        display: inline-flex;
        align-items: center;
        gap: 12px;
        border: 2px solid #ffffff;
      }
      .footer-brand {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 24px;
        border-top: 1px solid rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.6);
        font-size: 14px;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <div class="slide-container">
      <div class="top-nav">
        <div style="font-family:'Playfair Display', serif; font-style:italic; font-size:28px; font-weight:800; color:#f0eee6;">thesite.ro</div>
        <span style="background: rgba(255,255,255,0.12); padding:8px 18px; border-radius:100px; font-size:13px; font-weight:800;">Harta presei românești</span>
      </div>

      <div class="cta-center">
        <div class="app-badge">DECIDE TU CE SĂ CREZI</div>
        <h2 class="cta-title">Ieși din bula de știri.</h2>
        <p class="cta-desc">
          Pe <strong>thesite.ro</strong> grupăm știrile pe subiecte, măsurăm distribuția politică și îți arătăm ce omit publicațiile pe care le citești zilnic.
        </p>

        <div class="cta-button">
          <span>🔗 Link în bio: thesite.ro</span>
        </div>
      </div>

      <div class="footer-brand">
        <span>© thesite.ro — Toate perspectivele la un loc</span>
        <span>Urmărește @thesite.ro</span>
      </div>
    </div>
  </body>
  </html>
  `;

  return { slide1, slide2, slide3 };
}
