import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Build-time sitemap of the site's fixed pages -> public/sitemap-pages.xml.
 *
 * /sitemap.xml itself is served by api/sitemap.ts as a sitemap index pointing here and at the
 * live story sitemap (/sitemap-stories.xml). This file must NOT be written as
 * public/sitemap.xml: on Vercel a static file wins over the rewrite, which is how the
 * dynamic story URLs used to be hidden from crawlers.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://thesite.ro';
const OUTPUT_FILE = 'sitemap-pages.xml';

// Only canonical, indexable routes (no redirects such as /barometru, no search results).
const STATIC_ROUTES = [
  '',
  '/tribuni',
  '/surse',
  '/metodologie',
  '/despre',
  '/contact',
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

function readRepoFile(relativePath) {
  const fullPath = path.join(__dirname, '..', relativePath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : '';
}

function extractVoiceSlugs() {
  const content = readRepoFile('src/data/publicFigures.ts');
  const matches = [...content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
  return Array.from(new Set(matches));
}

/** /surse/:id only renders for sources that are in the feed list AND have a documented profile. */
function extractSourceProfileIds() {
  const sourceIds = new Set(
    [...readRepoFile('shared/newsSources.ts').matchAll(/\{\s*id:\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
  );
  const profiles = readRepoFile('src/data/sourceProfiles.ts');
  // Profile entries live in PROFILE_TEXTS (SOURCE_PROFILES is built from it); keep the old name as a fallback.
  const markers = ['const PROFILE_TEXTS', 'export const SOURCE_PROFILES'];
  const start = markers.map((m) => profiles.indexOf(m)).find((i) => i !== -1) ?? -1;
  if (start === -1) return [];
  const block = profiles.slice(start, profiles.indexOf('\n};', start));
  const profileIds = [...block.matchAll(/^\s{4}id:\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]);
  return Array.from(new Set(profileIds.filter((id) => sourceIds.has(id))));
}

function routeChangefreq(route) {
  if (route === '') return 'hourly';
  if (route.startsWith('/categorie/')) return 'hourly';
  if (route.startsWith('/voce/') || route === '/tribuni') return 'daily';
  return 'weekly';
}

function routePriority(route) {
  if (route === '') return '1.0';
  if (route.startsWith('/categorie/') || route === '/tribuni') return '0.9';
  if (route.startsWith('/voce/')) return '0.8';
  if (route.startsWith('/surse/')) return '0.6';
  return '0.7';
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
    ...extractSourceProfileIds().map((id) => `/surse/${id}`),
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
</urlset>
`;

  fs.writeFileSync(path.join(publicDir, OUTPUT_FILE), xml);
  console.log(`Sitemap generated at public/${OUTPUT_FILE} (${uniqueRoutes.length} URLs)`);
}

generateSitemap();
