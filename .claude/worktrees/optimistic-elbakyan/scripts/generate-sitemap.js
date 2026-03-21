import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://thesite.ro';

const STATIC_ROUTES = [
  '',
  '/metodologie',
  '/despre',
  '/contact'
];

const CATEGORIES = [
  'politica',
  'economie',
  'sanatate',
  'tehnologie',
  'mediu',
  'sport',
  'cultura',
  'international'
];

function generateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Write to public folder
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Add static routes
  STATIC_ROUTES.forEach(route => {
    xml += `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  // Add category routes
  CATEGORIES.forEach(category => {
    xml += `
  <url>
    <loc>${BASE_URL}/categorie/${category}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`;
  });

  // Add Voices section
  xml += `
  <url>
    <loc>${BASE_URL}/voci</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

  // Public Figures (Manual list until we can import TS in JS script easily)
  const VOICES = [
    'dana-budeanu',
    'mircea-badea',
    'victor-ciutacu',
    'ctp',
    'catalin-tolontan',
    'rares-bogdan',
    'lucian-mandruta',
    'moise-guran',
    'andreea-esca',
    'selly'
  ];

  VOICES.forEach(slug => {
    xml += `
  <url>
    <loc>${BASE_URL}/voce/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
}

generateSitemap();
