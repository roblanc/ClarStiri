// Social design v2 ("Spectrum glass"): real story photo, bias-driven mesh gradient, grain,
// Bricolage Grotesque + Instrument Serif + DM Mono, and a bias bar with explicit percentages
// on every cover. Exports the same builders the generators already use:
//   buildReelHtml(story)   -> HTML driven frame-by-frame by window.setReelProgress(t)
//   buildHtmlSlides(story) -> { slide1, slide2, slide3 } for the 3-image carousel
//
// Everything visible must be true about the named outlets: exact bias labels, real RSS
// times, and "no outlet from X" only when the story really has zero sources in that camp.

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap';

const COLORS = { left: '#3D7BFF', center: '#9A9A94', right: '#FF4A3D', amber: '#F0B55B', ink: '#0B0B0F' };

const BIAS_LABELS = {
  left: 'Stânga',
  'center-left': 'Centru-stânga',
  center: 'Centru',
  'center-right': 'Centru-dreapta',
  right: 'Dreapta',
};

const CAMP_OF = { left: 'left', 'center-left': 'left', center: 'center', 'center-right': 'right', right: 'right' };
const CAMP_NAME = { left: 'stânga', center: 'centru', right: 'dreapta' };

const TIME_FMT = new Intl.DateTimeFormat('ro-RO', { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit' });
const DATE_FMT = new Intl.DateTimeFormat('ro-RO', { timeZone: 'Europe/Bucharest', day: '2-digit', month: '2-digit' });

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Same rounding as the captions, so image and caption always agree. */
function biasPercents(story) {
  return {
    left: Math.round(story.bias?.left || 0),
    center: Math.round(story.bias?.center || 0),
    right: Math.round(story.bias?.right || 0),
  };
}

function sourceBias(item) {
  return item?.source?.bias || item?.bias || 'center';
}

function campOf(item) {
  return CAMP_OF[sourceBias(item)] || 'center';
}

function parseTime(pubDate) {
  const t = Date.parse(pubDate || '');
  return Number.isNaN(t) ? NaN : t;
}

/**
 * Candidate photos in order of preference. Some outlets (e.g. antena3.ro) block the posting
 * server's IP, so the <img> walks this list on error instead of relying on a single URL.
 * Videos and small thumbnails (e.g. -150x150) are skipped.
 */
function pickImages(story) {
  const isVideo = url => /\.(mp4|webm|m3u8|mov)(\?|$)/i.test(url || '');
  const isThumb = url => /-(\d{2,3})x(\d{2,3})\.(jpe?g|png|webp)/i.test(url || '');
  const seen = new Set();
  return [story.image, ...(story.sources || []).map(s => s.imageUrl)]
    .filter(url => url && /^https?:\/\//.test(url) && !isVideo(url) && !isThumb(url))
    .filter(url => !seen.has(url) && seen.add(url))
    .slice(0, 10);
}

/** One real headline per camp (earliest published), or null when the camp has no sources. */
function pickHeadlines(story) {
  const sorted = [...(story.sources || [])].sort((a, b) => (parseTime(a.pubDate) || 0) - (parseTime(b.pubDate) || 0));
  const used = new Set();
  const result = {};
  for (const camp of ['left', 'center', 'right']) {
    const inCamp = sorted.filter(s => campOf(s) === camp && s.title);
    const item = inCamp.find(s => !used.has(s.title.trim().toLowerCase())) || inCamp[0];
    if (item) used.add(item.title.trim().toLowerCase());
    result[camp] = item
      ? { outlet: item.source?.name || 'Sursă', label: BIAS_LABELS[sourceBias(item)] || 'Centru', title: item.title }
      : null;
  }
  return result;
}

/** Earliest article per outlet, from the outlets' RSS timestamps. */
function buildTimeline(story) {
  const now = Date.now();
  const firstByOutlet = new Map();
  for (const s of story.sources || []) {
    const t = parseTime(s.pubDate);
    if (Number.isNaN(t) || t > now + 5 * 60_000 || t < now - 14 * 86_400_000) continue;
    const key = s.source?.id || s.source?.name;
    if (!key) continue;
    const prev = firstByOutlet.get(key);
    if (!prev || t < prev.t) firstByOutlet.set(key, { t, outlet: s.source?.name || key, camp: campOf(s) });
  }
  const entries = [...firstByOutlet.values()].sort((a, b) => a.t - b.t);
  const shown = entries.slice(0, 4);
  const rest = entries.slice(4);
  return {
    valid: entries.length >= 3,
    shown: shown.map(e => ({ ...e, time: TIME_FMT.format(e.t) })),
    restCount: rest.length,
    lastTime: rest.length ? TIME_FMT.format(rest[rest.length - 1].t) : '',
  };
}

function storyDate(story) {
  const t = parseTime(story.publishedAt);
  return Number.isNaN(t) ? '' : DATE_FMT.format(t);
}

function headlineSize(title, base) {
  const n = (title || '').length;
  if (n <= 45) return base;
  if (n <= 70) return Math.round(base * 0.84);
  if (n <= 100) return Math.round(base * 0.72);
  return Math.round(base * 0.62);
}

function meshLayer(b, { photo = true, extra = '' } = {}) {
  const a = v => (0.25 + 0.6 * Math.min(v, 100) / 100).toFixed(2);
  return `radial-gradient(70% 40% at 0% 62%, rgba(61,123,255,${a(b.left)}), transparent 70%),
    radial-gradient(75% 44% at 100% 58%, rgba(255,74,61,${a(b.right)}), transparent 70%),
    radial-gradient(90% 36% at 50% 100%, rgba(240,181,91,.32), transparent 70%)${extra}${
      photo ? ',linear-gradient(180deg, rgba(11,11,15,.72) 0%, rgba(11,11,15,0) 14%, rgba(11,11,15,0) 30%, rgba(11,11,15,.88) 56%, #0B0B0F 70%)' : ''
    }`;
}

/**
 * The bias bar, readable at phone size: labelled percentages above a colored bar.
 * Numbers sit outside the bar, so a 2% segment still gets a legible label.
 */
function biasBarHtml(b, scale = 1, { light = false, sources } = {}) {
  const px = v => `${Math.round(v * scale)}px`;
  const ink = light ? COLORS.ink : '#fff';
  const col = (key, name, color) => `
    <div style="display:flex;flex-direction:column;gap:${px(4)}">
      <span style="font:800 ${px(64)}/0.9 'Bricolage Grotesque',sans-serif;letter-spacing:-.04em;color:${light ? ink : color}">${b[key]}%</span>
      <span style="font:500 ${px(22)} 'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:${ink};opacity:.85">
        <span style="display:inline-block;width:${px(14)};height:${px(14)};border-radius:50%;background:${color};margin-right:${px(8)};vertical-align:${px(-1)}"></span>${name}</span>
    </div>`;
  const seg = (v, color) => (v > 0 ? `<div style="width:${v}%;background:${color}"></div>` : '');
  return `
  <div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end">
      ${col('left', 'Stânga', COLORS.left)}${col('center', 'Centru', COLORS.center)}${col('right', 'Dreapta', COLORS.right)}
    </div>
    <div style="display:flex;height:${px(22)};border-radius:${px(12)};overflow:hidden;margin-top:${px(16)};background:rgba(255,255,255,.12)">
      ${seg(b.left, COLORS.left)}${seg(b.center, COLORS.center)}${seg(b.right, COLORS.right)}
    </div>
    ${sources ? `<div style="font:500 ${px(22)} 'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:${ink};opacity:.75;margin-top:${px(12)}">${sources} publicații au relatat</div>` : ''}
  </div>`;
}

function headlineCard(h, camp, scale) {
  const px = v => `${Math.round(v * scale)}px`;
  const color = COLORS[camp];
  if (!h) {
    return `<div style="border:${px(2)} dashed rgba(255,255,255,.28);border-radius:${px(22)};padding:${px(22)} ${px(26)}">
      <div style="font:500 ${px(21)} 'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:${color}">${CAMP_NAME[camp]}</div>
      <div style="font:400 italic ${px(34)}/1.15 'Instrument Serif',serif;margin-top:${px(6)};opacity:.9">Nicio publicație de ${CAMP_NAME[camp]} n-a relatat</div>
    </div>`;
  }
  return `<div class="card" style="border-radius:${px(22)};padding:${px(22)} ${px(26)};border-left:${px(6)} solid ${color}">
    <div style="font:500 ${px(21)} 'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:${color}">${esc(h.label)} · ${esc(h.outlet)}</div>
    <div style="font:700 ${px(34)}/1.22 'Bricolage Grotesque',sans-serif;margin-top:${px(8)};display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(h.title)}</div>
  </div>`;
}

function baseCss(width, height) {
  return `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${width}px;height:${height}px;overflow:hidden;background:${COLORS.ink};color:#fff;font-family:'Bricolage Grotesque',sans-serif;-webkit-font-smoothing:antialiased}
  .frame{position:relative;width:${width}px;height:${height}px;overflow:hidden;background:${COLORS.ink}}
  .abs{position:absolute;inset:0}
  .photo{position:absolute;left:0;right:0;top:0;object-fit:cover;width:100%}
  .grain{position:absolute;inset:0;pointer-events:none;opacity:.2;mix-blend-mode:overlay;background-size:256px 256px}
  .card{background:rgba(20,20,28,.66);border:1px solid rgba(255,255,255,.14)}
  .mono{font-family:'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase}
  .serif{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400}
  .logo{font:800 40px 'Bricolage Grotesque',sans-serif;letter-spacing:-.02em}
  .logo b{color:${COLORS.amber}}`;
}

// Grain is painted once into a canvas at load (cheap per frame, unlike a live SVG filter).
const GRAIN_SCRIPT = `
(function(){
  var c=document.createElement('canvas');c.width=c.height=256;var x=c.getContext('2d');var d=x.createImageData(256,256);
  for(var i=0;i<d.data.length;i+=4){var v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255;}
  x.putImageData(d,0,0);var u=c.toDataURL();
  document.querySelectorAll('.grain').forEach(function(g){g.style.backgroundImage='url('+u+')';});
})();`;

function doc(width, height, body, script = '') {
  return `<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS_HREF}" rel="stylesheet">
<style>${baseCss(width, height)}</style></head>
<body>${body}<script>${GRAIN_SCRIPT}${script}</script></body></html>`;
}

function photoTag(urls, heightPct) {
  if (!urls.length) return '';
  const onerror = "var n=JSON.parse(this.dataset.next||'[]');if(n.length){this.dataset.next=JSON.stringify(n.slice(1));this.src=n[0];}else{this.onerror=null;this.remove();}";
  return `<img class="photo" src="${esc(urls[0])}" data-next="${esc(JSON.stringify(urls.slice(1)))}" style="height:${heightPct}%" onerror="${onerror}" alt="">`;
}

// ---------------------------------------------------------------- Reel (1080x1920)

// Instagram safe area, same margins as the previous reel: 130 top, 440 bottom, 80 sides,
// plus extra room on the right for the like/comment/share column.
const SAFE = { top: 130, bottom: 440, left: 80, right: 150 };

export function buildReelHtml(story) {
  const b = biasPercents(story);
  const total = story.sourcesCount || story.sources?.length || 0;
  const images = pickImages(story);
  const heads = pickHeadlines(story);
  const timeline = buildTimeline(story);
  const date = storyDate(story);
  const blindCamp = story.blindspot === 'left' || story.blindspot === 'right' ? story.blindspot : null;
  const title = story.title || '';

  const header = (right = `${date} · ${total} surse`) => `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span class="logo">thesite<b>.ro</b></span>
      <span class="mono" style="font-size:26px;opacity:.85">${esc(right)}</span>
    </div>`;

  const pad = `padding:${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px`;

  const coverDefault = `
    <div class="abs" style="${pad};display:flex;flex-direction:column">
      ${header()}
      <div style="margin-top:auto">
        <div style="font:800 ${headlineSize(title, 96)}px/0.98 'Bricolage Grotesque';letter-spacing:-.035em;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden">${esc(title)}</div>
        <div class="serif" style="font-size:62px;line-height:1.05;color:${COLORS.amber};margin:14px 0 40px">cum a relatat fiecare tabără</div>
        ${biasBarHtml(b, 1)}
      </div>
    </div>`;

  const blindValue = blindCamp ? b[blindCamp] : 0;
  const coverBlind = blindCamp ? `
    <div class="abs" style="${pad};display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="logo">thesite<b>.ro</b></span>
        <span class="mono" style="font-size:26px;background:${COLORS.ink};color:${COLORS.amber};padding:12px 22px;border-radius:40px">unghi mort</span>
      </div>
      <div class="mono" style="font-size:30px;margin-top:70px;font-weight:500">presa de ${CAMP_NAME[blindCamp]}</div>
      <div style="font:800 380px/0.8 'Bricolage Grotesque';letter-spacing:-.07em;margin-left:-14px;color:#fff">${blindValue}%</div>
      <div class="serif" style="font-size:66px;line-height:1.05;margin-top:14px">din acoperirea acestei știri</div>
      <div style="margin-top:auto">
        <div style="font:700 ${headlineSize(title, 56)}px/1.15 'Bricolage Grotesque';margin-bottom:34px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(title)}</div>
        ${biasBarHtml(b, 1)}
      </div>
    </div>` : '';

  const sceneHeadlines = `
    <div class="abs" style="${pad};display:flex;flex-direction:column">
      ${header('aceeași știre')}
      <div style="font:800 92px/0.95 'Bricolage Grotesque';letter-spacing:-.035em;margin-top:80px">Trei tabere,</div>
      <div class="serif" style="font-size:96px;line-height:1;color:${COLORS.amber}">trei titluri.</div>
      <div style="display:flex;flex-direction:column;gap:22px;margin-top:auto">
        ${headlineCard(heads.left, 'left', 1)}${headlineCard(heads.center, 'center', 1)}${headlineCard(heads.right, 'right', 1)}
      </div>
    </div>`;

  const sceneRace = timeline.valid ? `
    <div class="abs" style="${pad};display:flex;flex-direction:column">
      ${header('cursa știrii')}
      <div style="font:800 110px/0.92 'Bricolage Grotesque';letter-spacing:-.04em;margin-top:80px">Cine a scris</div>
      <div class="serif" style="font-size:124px;line-height:1;color:${COLORS.amber}">primul?</div>
      <div class="card" style="margin-top:auto;border-radius:30px;padding:34px 36px 26px">
        <div style="display:grid;grid-template-columns:150px 1fr;row-gap:26px;align-items:baseline">
          ${timeline.shown.map((e, i) => `
            <span class="mono" style="font-size:36px;color:${i === 0 ? COLORS.amber : '#fff'};opacity:${i === 0 ? 1 : 0.8}">${e.time}</span>
            <span style="font:600 40px 'Bricolage Grotesque'"><span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${COLORS[e.camp]};margin-right:14px;vertical-align:4px"></span>${esc(e.outlet)}${i === 0 ? '<span style="opacity:.6"> · primul</span>' : ''}</span>`).join('')}
        </div>
        ${timeline.restCount ? `<div style="height:1px;background:rgba(255,255,255,.15);margin:28px 0 18px"></div>
        <div style="display:flex;justify-content:space-between;align-items:baseline"><span class="serif" style="font-size:54px">+${timeline.restCount} redacții</span><span class="mono" style="font-size:24px;opacity:.7">până la ${timeline.lastTime}</span></div>` : ''}
        <div class="mono" style="font-size:20px;opacity:.55;margin-top:16px">ore din fluxurile RSS ale publicațiilor</div>
      </div>
    </div>` : '';

  const sceneBias = `
    <div class="abs" style="${pad};display:flex;flex-direction:column">
      ${header('cine a acoperit')}
      <div style="font:800 100px/0.95 'Bricolage Grotesque';letter-spacing:-.035em;margin-top:80px">${total} publicații.</div>
      <div class="serif" style="font-size:100px;line-height:1;color:${COLORS.amber}">o singură știre.</div>
      <div style="margin-top:auto">
        ${biasBarHtml(b, 1.45, { sources: total })}
        <div style="margin-top:56px;background:#fff;color:${COLORS.ink};border-radius:28px;padding:30px 34px;display:flex;justify-content:space-between;align-items:center">
          <span style="font:700 42px 'Bricolage Grotesque'">Toate titlurile pe thesite.ro</span>
          <span class="mono" style="font-size:24px">link în bio →</span>
        </div>
      </div>
    </div>`;

  const scenes = [coverBlind || coverDefault, sceneHeadlines, sceneRace, sceneBias].filter(Boolean);

  const body = `
  <div class="frame">
    <div id="photoWrap" class="abs">${photoTag(images, 64)}</div>
    <div id="mesh" class="abs" style="background:${meshLayer(b, { photo: images.length > 0 })}"></div>
    ${scenes.map((s, i) => `<div class="scene abs" id="scene${i}" style="opacity:${i === 0 ? 1 : 0}">${s}</div>`).join('')}
    <div class="grain"></div>
  </div>`;

  // Every visual change is a pure function of t, because the renderer screenshots frame by
  // frame; CSS transitions would run on wall-clock time between captures and jitter.
  const script = `
  var N=${scenes.length},FADE=0.035;
  function clamp(v){return v<0?0:v>1?1:v}
  window.setReelProgress=function(t){
    var len=1/N;
    for(var i=0;i<N;i++){
      var el=document.getElementById('scene'+i),start=i*len,end=start+len;
      // Crossfade centred on each boundary: outgoing and incoming scenes overlap, no empty frame.
      var fin=i===0?1:clamp((t-start)/FADE+0.5),fout=i===N-1?1:clamp((end-t)/FADE+0.5);
      var o=Math.min(fin,fout);
      el.style.opacity=o;
      el.style.transform='translateY('+((1-fin)*40)+'px)';
    }
    var p=document.getElementById('photoWrap');
    // Dim the photo across the same window in which scene 0 fades out and scene 1 fades in.
    p.style.opacity=1-0.72*clamp((t-len)/FADE+0.5);
  };
  window.setReelProgress(0);`;

  return doc(1080, 1920, body, script);
}

// ------------------------------------------------------------ Carousel (1080x1350)

export function buildHtmlSlides(story) {
  const b = biasPercents(story);
  const total = story.sourcesCount || story.sources?.length || 0;
  const images = pickImages(story);
  const heads = pickHeadlines(story);
  const date = storyDate(story);
  const title = story.title || '';
  const pad = 'padding:72px 76px 76px';

  const top = (left, right) => `
    <div style="display:flex;justify-content:space-between;align-items:center">
      ${left}<span class="mono" style="font-size:26px;opacity:.85">${right}</span>
    </div>`;

  const slide1 = doc(1080, 1350, `
  <div class="frame">
    ${photoTag(images, 66)}
    <div class="abs" style="background:${meshLayer(b, { photo: images.length > 0 })}"></div>
    <div class="abs" style="${pad};display:flex;flex-direction:column">
      ${top('<span class="logo">thesite<b>.ro</b></span>', '1/3')}
      <div style="margin-top:auto">
        <div class="mono" style="font-size:26px;color:${COLORS.amber}">${total} redacții · ${esc(date)}</div>
        <div style="font:800 ${headlineSize(title, 82)}px/1 'Bricolage Grotesque';letter-spacing:-.035em;margin-top:14px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(title)}</div>
        <div class="serif" style="font-size:52px;line-height:1.05;margin:10px 0 36px">cum a relatat fiecare tabără</div>
        ${biasBarHtml(b, 0.9)}
      </div>
    </div>
    <div class="grain"></div>
  </div>`);

  const slide2 = doc(1080, 1350, `
  <div class="frame">
    <div class="abs" style="background:${meshLayer(b, { photo: false })}"></div>
    <div class="abs" style="${pad};display:flex;flex-direction:column">
      ${top('<span class="mono" style="font-size:26px;opacity:.85">aceeași știre, trei tabere</span>', '2/3')}
      <div style="display:flex;flex-direction:column;gap:24px;margin-top:auto;margin-bottom:auto">
        ${headlineCard(heads.left, 'left', 1.05)}${headlineCard(heads.center, 'center', 1.05)}${headlineCard(heads.right, 'right', 1.05)}
      </div>
    </div>
    <div class="grain"></div>
  </div>`);

  const slide3 = doc(1080, 1350, `
  <div class="frame" style="background:${COLORS.amber};color:${COLORS.ink}">
    <div class="abs" style="background:radial-gradient(70% 55% at 100% 0%, rgba(255,74,61,.5), transparent 70%),radial-gradient(70% 55% at 0% 100%, rgba(61,123,255,.4), transparent 70%)"></div>
    <div class="abs" style="${pad};display:flex;flex-direction:column">
      ${top('<span class="mono" style="font-size:26px">cine a acoperit</span>', '3/3')}
      <div style="font:800 96px/0.95 'Bricolage Grotesque';letter-spacing:-.035em;margin-top:60px">${total} publicații.</div>
      <div class="serif" style="font-size:88px;line-height:1">o singură știre.</div>
      <div style="margin-top:auto">
        ${biasBarHtml(b, 1.3, { light: true, sources: total })}
        <div style="margin-top:48px;background:${COLORS.ink};color:#fff;border-radius:26px;padding:28px 32px;display:flex;justify-content:space-between;align-items:center">
          <span style="font:700 40px 'Bricolage Grotesque'">Toate titlurile pe thesite.ro</span>
          <span class="mono" style="font-size:24px;color:${COLORS.amber}">link în bio →</span>
        </div>
      </div>
    </div>
    <div class="grain"></div>
  </div>`);

  return { slide1, slide2, slide3 };
}
