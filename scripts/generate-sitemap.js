import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://thesite.ro';

const STATIC_ROUTES = [
  '',
  '/metodologie',
  '/despre',
  '/contact',
  '/surse',
  '/barometru',
];

const CATEGORIES = [
  'politica',
  'economie',
  'sanatate',
  'tehnologie',
  'mediu',
  'sport',
  'cultura',
  'international',
];

function extractVoiceSlugs() {
  const figuresPath = path.join(__dirname, '../src/data/publicFigures.ts');
  if (!fs.existsSync(figuresPath)) return [];

  const content = fs.readFileSync(figuresPath, 'utf8');
  const matches = [...content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
  return Array.from(new Set(matches));
}

function routeChangefreq(route) {
  if (route === '') return 'daily';
  if (route.startsWith('/categorie/')) return 'hourly';
  if (route.startsWith('/voce/')) return 'daily';
  if (route === '/barometru') return 'daily';
  return 'weekly';
}

function routePriority(route) {
  if (route === '') return '1.0';
  if (route.startsWith('/categorie/')) return '0.9';
  if (route.startsWith('/voce/')) return '0.8';
  if (route === '/barometru') return '0.9';
  return '0.8';
}

function generateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];
  const publicDir = path.join(__dirname, '../public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  const routes = [
    ...STATIC_ROUTES,
    ...CATEGORIES.map((category) => `/categorie/${category}`),
    ...extractVoiceSlugs().map((slug) => `/voce/${slug}`),
  ];

  const uniqueRoutes = Array.from(new Set(routes));

  const urlEntries = uniqueRoutes
    .map((route) => `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${routeChangefreq(route)}</changefreq>
    <priority>${routePriority(route)}</priority>
  </url>`)
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  console.log('Sitemap generated successfully at public/sitemap.xml');
}

generateSitemap();
