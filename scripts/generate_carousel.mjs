import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  const sampleLeft = leftSources[0] || { source: { name: 'Presa de Stânga' }, title: story.title };
  const sampleCenter = centerSources[0] || { source: { name: 'Presa de Centru' }, title: story.title };
  const sampleRight = rightSources[0] || { source: { name: 'Presa de Dreapta' }, title: story.title };

  let blindspotText = '';
  if (blindspot === 'left') {
    blindspotText = `⚠️ Punct Orb: Ignorat de sursele de Stânga (doar ${left}% acoperire)`;
  } else if (blindspot === 'right') {
    blindspotText = `⚠️ Punct Orb: Ignorat de sursele de Dreapta (doar ${right}% acoperire)`;
  }

  const commonStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@1,600;1,700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1350px;
      background: #0f1015;
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
      background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
      background-size: 24px 24px;
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
        background: #f59e0b;
        color: #000;
        font-weight: 800;
        font-size: 13px;
        padding: 6px 16px;
        border-radius: 100px;
        letter-spacing: 0.1em;
      }
      .badge-sources {
        background: rgba(255,255,255,0.15);
        color: #fff;
        font-weight: 700;
        font-size: 13px;
        padding: 6px 16px;
        border-radius: 100px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
      }
      .brand-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(240, 238, 230, 0.95);
        padding: 6px 20px;
        border-radius: 100px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      }
      .brand-name {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-weight: 700;
        color: #111;
        font-size: 20px;
      }
      .hero-card {
        position: relative;
        width: 100%;
        height: 640px;
        border-radius: 28px;
        overflow: hidden;
        margin-top: 24px;
        margin-bottom: 24px;
        border: 1px solid rgba(255,255,255,0.15);
        box-shadow: 0 20px 50px rgba(0,0,0,0.6);
      }
      .hero-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .hero-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 45%, rgba(10,11,15,0.98) 100%);
      }
      .hero-content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 40px;
      }
      .blindspot-alert {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(239, 68, 68, 0.5);
        color: #fca5a5;
        font-size: 13px;
        font-weight: 700;
        padding: 6px 14px;
        border-radius: 8px;
        margin-bottom: 16px;
      }
      .story-title {
        font-size: 38px;
        font-weight: 800;
        line-height: 1.25;
        letter-spacing: -0.02em;
        color: #ffffff;
      }
      .bias-section {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 24px;
        padding: 24px 32px;
        backdrop-filter: blur(20px);
      }
      .bias-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.6);
      }
      .bias-labels {
        display: flex;
        justify-content: space-between;
        font-size: 15px;
        font-weight: 800;
        margin-bottom: 10px;
      }
      .bias-bar {
        display: flex;
        height: 20px;
        border-radius: 100px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.2);
        gap: 3px;
        background: rgba(255,255,255,0.1);
      }
      .bar-left { background: #3b82f6; width: ${left}%; height: 100%; }
      .bar-center { background: #e5e7eb; width: ${center}%; height: 100%; }
      .bar-right { background: #ef4444; width: ${right}%; height: 100%; }
      .swipe-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 18px;
        color: rgba(255,255,255,0.7);
        font-size: 14px;
        font-weight: 600;
      }
      .swipe-badge {
        background: rgba(255,255,255,0.1);
        padding: 6px 16px;
        border-radius: 100px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    </style>
  </head>
  <body>
    <div class="bg-grid"></div>
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
          <span>${totalSources} PUBLICAȚII ANALIZATE</span>
        </div>
        <div class="bias-labels">
          <span style="color: #60a5fa;">Stânga ${left}%</span>
          <span style="color: #f3f4f6;">Centru ${center}%</span>
          <span style="color: #f87171;">Dreapta ${right}%</span>
        </div>
        <div class="bias-bar">
          <div class="bar-left"></div>
          <div class="bar-center"></div>
          <div class="bar-right"></div>
        </div>
        <div class="swipe-footer">
          <span>Analiză automată media</span>
          <div class="swipe-badge">
            <span>Glisează pentru comparație titluri</span>
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
        margin-top: 24px;
        margin-bottom: 24px;
      }
      .section-subtitle {
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: #f59e0b;
        margin-bottom: 8px;
      }
      .section-title {
        font-size: 34px;
        font-weight: 800;
        line-height: 1.2;
      }
      .cards-stack {
        display: flex;
        flex-direction: column;
        gap: 20px;
        flex: 1;
      }
      .headline-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 22px;
        padding: 24px 28px;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .card-left { border-left: 6px solid #3b82f6; }
      .card-center { border-left: 6px solid #e5e7eb; }
      .card-right { border-left: 6px solid #ef4444; }
      
      .card-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .outlet-badge {
        font-size: 13px;
        font-weight: 800;
        padding: 4px 12px;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .badge-left { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
      .badge-center { background: rgba(255, 255, 255, 0.2); color: #f3f4f6; }
      .badge-right { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }

      .outlet-name {
        font-size: 14px;
        font-weight: 700;
        color: rgba(255,255,255,0.8);
      }
      .headline-quote {
        font-size: 20px;
        font-weight: 700;
        line-height: 1.35;
        color: #ffffff;
      }
      .bottom-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 100px;
        padding: 14px 28px;
        font-size: 14px;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="bg-grid"></div>
    <div class="slide-container">
      <div class="top-nav">
        <div style="display: flex; gap: 12px;">
          <span style="background: #3b82f6; color:#fff; font-weight:800; font-size:12px; padding:6px 14px; border-radius:100px;">COMPARAȚIE TITLURI</span>
        </div>
        <div style="font-family:'Playfair Display', serif; font-style:italic; font-size:20px; font-weight:700; color:#e5e7eb;">thesite.ro</div>
      </div>

      <div class="section-heading">
        <div class="section-subtitle">Perspective media</div>
        <h2 class="section-title">Același eveniment, formulări diferite</h2>
      </div>

      <div class="cards-stack">
        <!-- Card 1: Stânga / Centru-Stânga -->
        <div class="headline-card card-left">
          <div class="card-meta">
            <span class="outlet-badge badge-left">Stânga</span>
            <span class="outlet-name">${sampleLeft.source?.name || 'Sursă Stânga'}</span>
          </div>
          <div class="headline-quote">„${sampleLeft.title}”</div>
        </div>

        <!-- Card 2: Centru -->
        <div class="headline-card card-center">
          <div class="card-meta">
            <span class="outlet-badge badge-center">Centru</span>
            <span class="outlet-name">${sampleCenter.source?.name || 'Sursă Centru'}</span>
          </div>
          <div class="headline-quote">„${sampleCenter.title}”</div>
        </div>

        <!-- Card 3: Dreapta / Centru-Dreapta -->
        <div class="headline-card card-right">
          <div class="card-meta">
            <span class="outlet-badge badge-right">Dreapta</span>
            <span class="outlet-name">${sampleRight.source?.name || 'Sursă Dreapta'}</span>
          </div>
          <div class="headline-quote">„${sampleRight.title}”</div>
        </div>
      </div>

      <div class="bottom-bar">
        <span style="color: rgba(255,255,255,0.7);">Vezi cum limbajul schimbă percepția</span>
        <span style="color: #f59e0b; font-weight:800;">Glisează pentru sinteză ➔</span>
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
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 32px;
        padding: 48px 40px;
        backdrop-filter: blur(20px);
      }
      .app-badge {
        background: #10b981;
        color: #000;
        font-weight: 800;
        font-size: 13px;
        padding: 6px 16px;
        border-radius: 100px;
        margin-bottom: 24px;
        letter-spacing: 0.1em;
      }
      .cta-title {
        font-size: 42px;
        font-weight: 900;
        line-height: 1.15;
        letter-spacing: -0.03em;
        margin-bottom: 20px;
      }
      .cta-desc {
        font-size: 20px;
        color: rgba(255,255,255,0.75);
        line-height: 1.5;
        max-width: 780px;
        margin-bottom: 36px;
      }
      .cta-button {
        background: #f0eee6;
        color: #111;
        font-size: 22px;
        font-weight: 800;
        padding: 18px 44px;
        border-radius: 100px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        display: inline-flex;
        align-items: center;
        gap: 12px;
      }
      .feature-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        width: 100%;
        margin-top: 10px;
      }
      .feature-item {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 18px;
        padding: 18px 20px;
        font-size: 15px;
        font-weight: 600;
        color: rgba(255,255,255,0.85);
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .feature-icon {
        color: #f59e0b;
        font-size: 20px;
      }
      .footer-brand {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 24px;
        border-top: 1px solid rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.5);
        font-size: 14px;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="bg-grid"></div>
    <div class="slide-container">
      <div class="top-nav">
        <div style="font-family:'Playfair Display', serif; font-style:italic; font-size:26px; font-weight:700; color:#f0eee6;">thesite.ro</div>
        <span style="background: rgba(255,255,255,0.1); padding:6px 14px; border-radius:100px; font-size:13px; font-weight:700;">Harta presei românești</span>
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

        <div class="feature-list" style="margin-top: 36px;">
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
            <span>Comparație instantanee de titluri</span>
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

export function buildSinglePostHtml(story) {
  const left = Math.round(story.bias?.left || 0);
  const center = Math.round(story.bias?.center || 0);
  const right = Math.round(story.bias?.right || 0);
  const totalSources = story.sourcesCount || story.sources?.length || 0;
  const category = (story.mainCategory || story.category || 'ACTUALITATE').toUpperCase();
  const blindspot = story.blindspot;
  const image = story.image || 'https://picsum.photos/seed/clarstiri/1200/800';

  const leftSources = (story.sources || []).filter(s => (s.source?.bias || s.bias || '').toLowerCase().includes('left'));
  const rightSources = (story.sources || []).filter(s => (s.source?.bias || s.bias || '').toLowerCase().includes('right'));
  const centerSources = (story.sources || []).filter(s => {
    const b = (s.source?.bias || s.bias || '').toLowerCase();
    return b === 'center' || (!b.includes('left') && !b.includes('right'));
  });

  const sampleLeft = leftSources[0] || { source: { name: 'Presa de Stânga' }, title: story.title };
  const sampleRight = rightSources[0] || { source: { name: 'Presa de Dreapta' }, title: story.title };

  let blindspotText = '';
  if (blindspot === 'left') {
    blindspotText = `⚠️ Punct Orb: Ignorat de Stânga (${left}%)`;
  } else if (blindspot === 'right') {
    blindspotText = `⚠️ Punct Orb: Ignorat de Dreapta (${right}%)`;
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@1,600;1,700&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1080px;
        height: 1350px;
        background: #0f1015;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #ffffff;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 50px;
        position: relative;
      }
      .bg-grid {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
        z-index: 1;
      }
      .content-wrap {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: space-between;
      }
      .top-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .badge-cat {
        background: #f59e0b;
        color: #000;
        font-weight: 800;
        font-size: 13px;
        padding: 6px 16px;
        border-radius: 100px;
        letter-spacing: 0.1em;
      }
      .brand-pill {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-weight: 700;
        color: #111;
        font-size: 20px;
        background: rgba(240, 238, 230, 0.95);
        padding: 6px 20px;
        border-radius: 100px;
      }
      .hero-card {
        position: relative;
        width: 100%;
        height: 480px;
        border-radius: 24px;
        overflow: hidden;
        margin-top: 18px;
        margin-bottom: 16px;
        border: 1px solid rgba(255,255,255,0.15);
      }
      .hero-img { width: 100%; height: 100%; object-fit: cover; }
      .hero-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 40%, rgba(10,11,15,0.98) 100%);
      }
      .hero-content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 30px;
      }
      .story-title {
        font-size: 32px;
        font-weight: 800;
        line-height: 1.25;
      }
      .bias-box {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        padding: 20px 24px;
      }
      .bias-bar {
        display: flex;
        height: 16px;
        border-radius: 100px;
        overflow: hidden;
        gap: 3px;
        background: rgba(255,255,255,0.1);
        margin: 10px 0;
      }
      .bar-l { background: #3b82f6; width: ${left}%; }
      .bar-c { background: #e5e7eb; width: ${center}%; }
      .bar-r { background: #ef4444; width: ${right}%; }
      .headlines-mini {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        margin-top: 14px;
      }
      .mini-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 16px;
      }
      .mini-card-l { border-left: 4px solid #3b82f6; }
      .mini-card-r { border-left: 4px solid #ef4444; }
      .mini-meta {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 6px;
        display: flex;
        justify-content: space-between;
      }
      .mini-title {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.35;
        color: rgba(255,255,255,0.9);
      }
      .single-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 14px;
        border-top: 1px solid rgba(255,255,255,0.1);
        font-size: 13px;
        color: rgba(255,255,255,0.6);
      }
    </style>
  </head>
  <body>
    <div class="bg-grid"></div>
    <div class="content-wrap">
      <div class="top-nav">
        <div style="display:flex; gap:10px; align-items:center;">
          <span class="badge-cat">${category}</span>
          <span style="background:rgba(255,255,255,0.15); padding:6px 14px; border-radius:100px; font-size:12px; font-weight:700;">${totalSources} SURSE</span>
        </div>
        <div class="brand-pill">thesite.ro</div>
      </div>

      <div class="hero-card">
        <img class="hero-img" src="${image}" alt="hero" />
        <div class="hero-overlay"></div>
        <div class="hero-content">
          ${blindspotText ? `<div style="background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.4); color:#fca5a5; font-size:12px; font-weight:700; padding:4px 10px; border-radius:6px; margin-bottom:10px; display:inline-block;">${blindspotText}</div>` : ''}
          <h1 class="story-title">${story.title}</h1>
        </div>
      </div>

      <div class="bias-box">
        <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; color:rgba(255,255,255,0.6); letter-spacing:0.1em; text-transform:uppercase;">
          <span>Distribuție Media</span>
          <span>${totalSources} Publicații</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:14px; font-weight:800; margin-top:8px;">
          <span style="color:#60a5fa;">Stânga ${left}%</span>
          <span style="color:#f3f4f6;">Centru ${center}%</span>
          <span style="color:#f87171;">Dreapta ${right}%</span>
        </div>
        <div class="bias-bar">
          <div class="bar-l"></div>
          <div class="bar-c"></div>
          <div class="bar-r"></div>
        </div>
      </div>

      <div class="headlines-mini">
        <div class="mini-card mini-card-l">
          <div class="mini-meta">
            <span style="color:#93c5fd;">Stânga</span>
            <span style="color:rgba(255,255,255,0.6);">${sampleLeft.source?.name || 'Sursă'}</span>
          </div>
          <div class="mini-title">„${sampleLeft.title}”</div>
        </div>
        <div class="mini-card mini-card-r">
          <div class="mini-meta">
            <span style="color:#fca5a5;">Dreapta</span>
            <span style="color:rgba(255,255,255,0.6);">${sampleRight.source?.name || 'Sursă'}</span>
          </div>
          <div class="mini-title">„${sampleRight.title}”</div>
        </div>
      </div>

      <div class="single-footer">
        <span>thesite.ro — Vezi toate perspectivele</span>
        <span style="color:#f59e0b; font-weight:700;">🔗 Link în bio</span>
      </div>
    </div>
  </body>
  </html>
  `;
}
