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
  const category = (story.mainCategory || story.category || 'ACTUALITATE').toUpperCase();
  const blindspot = story.blindspot;
  const image = story.image || 'https://picsum.photos/seed/clarstiri/1200/800';

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

  let blindspotText = '';
  if (blindspot === 'left') {
    blindspotText = `⚠️ PUNCT ORB: Ignorat de sursele de Stânga (doar ${left}% acoperire)`;
  } else if (blindspot === 'right') {
    blindspotText = `⚠️ PUNCT ORB: Ignorat de sursele de Dreapta (doar ${right}% acoperire)`;
  }

  const commonStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,600;1,700&family=Playfair+Display:ital,wght@1,600;1,700;1,800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1350px;
      background: #07080c;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #ffffff;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px);
      background-size: 26px 26px;
      pointer-events: none;
      z-index: 1;
      opacity: 0.4;
    }
    .glow-blue {
      position: absolute;
      top: -100px;
      left: -100px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%);
      pointer-events: none;
      z-index: 1;
    }
    .glow-red {
      position: absolute;
      bottom: -100px;
      right: -100px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%);
      pointer-events: none;
      z-index: 1;
    }
  `;

  // SLIDE 1: Cover & Bias Bar
  const slide1 = `
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
      }
      .top-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .tag-group {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .badge-category {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: #000;
        font-weight: 900;
        font-size: 13px;
        padding: 8px 20px;
        border-radius: 100px;
        letter-spacing: 0.1em;
        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.25);
      }
      .badge-sources {
        background: rgba(255,255,255,0.12);
        color: #fff;
        font-weight: 800;
        font-size: 13px;
        padding: 8px 20px;
        border-radius: 100px;
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.2);
      }
      .brand-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(242, 239, 230, 0.95);
        padding: 8px 24px;
        border-radius: 100px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      }
      .brand-name {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-weight: 800;
        color: #000;
        font-size: 22px;
        letter-spacing: -0.02em;
      }
      .hero-card {
        position: relative;
        width: 100%;
        height: 640px;
        border-radius: 32px;
        overflow: hidden;
        margin-top: 24px;
        margin-bottom: 24px;
        border: 1px solid rgba(255,255,255,0.18);
        box-shadow: 0 30px 60px rgba(0,0,0,0.7);
        background: #000;
      }
      .hero-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .hero-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(7,8,12,0.4) 40%, rgba(7,8,12,0.98) 100%);
      }
      .hero-content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 44px;
      }
      .blindspot-alert {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.5);
        color: #fca5a5;
        font-size: 13px;
        font-weight: 800;
        padding: 8px 18px;
        border-radius: 12px;
        margin-bottom: 18px;
        backdrop-filter: blur(10px);
      }
      .story-title {
        font-size: 38px;
        font-weight: 900;
        line-height: 1.25;
        letter-spacing: -0.02em;
        color: #ffffff;
        text-shadow: 0 4px 12px rgba(0,0,0,0.5);
      }
      .bias-section {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 28px;
        padding: 26px 36px;
        backdrop-filter: blur(20px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      }
      .bias-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.6);
      }
      .bias-labels {
        display: flex;
        justify-content: space-between;
        font-size: 16px;
        font-weight: 900;
        margin-bottom: 12px;
      }
      .bias-bar {
        display: flex;
        height: 22px;
        border-radius: 100px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.15);
        gap: 3px;
        background: rgba(255,255,255,0.1);
        padding: 2px;
      }
      .bar-left { background: linear-gradient(90deg, #3b82f6 0%, #38bdf8 100%); width: ${left}%; height: 100%; border-radius: 100px 0 0 100px; }
      .bar-center { background: linear-gradient(90deg, #f1f5f9 0%, #cbd5e1 100%); width: ${center}%; height: 100%; }
      .bar-right { background: linear-gradient(90deg, #f43f5e 0%, #ef4444 100%); width: ${right}%; height: 100%; border-radius: 0 100px 100px 0; }
      .swipe-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 18px;
        color: rgba(255,255,255,0.7);
        font-size: 14px;
        font-weight: 700;
      }
      .swipe-badge {
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.3);
        color: #fbbf24;
        padding: 6px 18px;
        border-radius: 100px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 800;
      }
    </style>
  </head>
  <body>
    <div class="bg-grid"></div>
    <div class="glow-blue"></div>
    <div class="glow-red"></div>
    <div class="slide-container">
      <div class="top-nav">
        <div class="tag-group">
          <span class="badge-category">${category}</span>
          <span class="badge-sources">${totalSources} SURSE</span>
        </div>
        <div class="brand-pill">
          <span class="brand-name">thesite.ro</span>
        </div>
      </div>

      <div class="hero-card">
        <img class="hero-img" src="${image}" alt="hero" />
        <div class="hero-overlay"></div>
        <div class="hero-content">
          ${blindspotText ? `<div class="blindspot-alert">${blindspotText}</div>` : ''}
          <h1 class="story-title">${story.title}</h1>
        </div>
      </div>

      <div class="bias-section">
        <div class="bias-header">
          <span>DISTRIBUȚIE ORIENTARE MEDIA</span>
          <span style="color: #fbbf24;">${totalSources} PUBLICAȚII ANALIZATE</span>
        </div>
        <div class="bias-labels">
          <span style="color: #38bdf8;">Stânga ${left}%</span>
          <span style="color: #f8fafc;">Centru ${center}%</span>
          <span style="color: #f43f5e;">Dreapta ${right}%</span>
        </div>
        <div class="bias-bar">
          <div class="bar-left"></div>
          <div class="bar-center"></div>
          <div class="bar-right"></div>
        </div>
        <div class="swipe-footer">
          <span>Analiză automată a presei românești</span>
          <div class="swipe-badge">
            <span>Glisează pentru titluri</span>
            <span>➔</span>
          </div>
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
    <div class="bg-grid"></div>
    <div class="glow-blue"></div>
    <div class="glow-red"></div>
    <div class="slide-container">
      <div class="top-nav">
        <div style="display: flex; gap: 12px;">
          <span style="background: linear-gradient(135deg, #3b82f6, #06b6d4); color:#fff; font-weight:900; font-size:13px; padding:8px 18px; border-radius:100px;">COMPARAȚIE TITLURI</span>
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
        background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        color: #000;
        font-weight: 900;
        font-size: 13px;
        padding: 8px 22px;
        border-radius: 100px;
        margin-bottom: 24px;
        letter-spacing: 0.1em;
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
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
      .feature-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
        width: 100%;
        margin-top: 10px;
      }
      .feature-item {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 20px 24px;
        font-size: 16px;
        font-weight: 700;
        color: rgba(255,255,255,0.9);
        display: flex;
        align-items: center;
        gap: 12px;
        text-align: left;
      }
      .feature-icon {
        color: #fbbf24;
        font-size: 22px;
        font-weight: 900;
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
    <div class="bg-grid"></div>
    <div class="glow-blue"></div>
    <div class="glow-red"></div>
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

        <div class="feature-list" style="margin-top: 38px;">
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>Peste 35 de publicații</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>Detecție puncte orbe (blindspots)</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>Comparație instantanee titluri</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>Fără algoritmi de polarizare</span>
          </div>
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
