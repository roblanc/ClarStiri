import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de Auto-Postare pe Instagram via Meta Graph API
 * Require Environment Variables:
 * - INSTAGRAM_USER_ID (ID-ul de Instagram Business/Creator)
 * - INSTAGRAM_ACCESS_TOKEN (Token-ul de acces Meta Graph API)
 * - SITE_BASE_URL (ex: https://thesite.ro)
 */

async function makeGraphApiRequest(endpoint, method = 'POST', params = {}) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    throw new Error('INSTAGRAM_ACCESS_TOKEN este lipsă din mediul de rulare!');
  }

  const queryParams = new URLSearchParams({ ...params, access_token: token }).toString();
  const url = `https://graph.facebook.com/v19.0/${endpoint}?${queryParams}`;

  const res = await fetch(url, { method });
  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta Graph API Error: ${data.error.message} (${data.error.code})`);
  }

  return data;
}

// 1. Postare Imagine Single Image Post
export async function publishSingleImagePost(imageUrl, caption) {
  const igUserId = process.env.INSTAGRAM_USER_ID;
  if (!igUserId) throw new Error('INSTAGRAM_USER_ID este lipsă!');

  console.log('📌 Pasul 1: Creare container imagine pe Meta Graph API...');
  const container = await makeGraphApiRequest(`${igUserId}/media`, 'POST', {
    image_url: imageUrl,
    caption: caption,
  });

  console.log(`✓ Container creat cu ID: ${container.id}`);

  // Așteptăm 3 secunde pentru procesarea imaginii pe serverele Meta
  await new Promise(r => setTimeout(r, 3000));

  console.log('📌 Pasul 2: Publicare postare pe Instagram...');
  const result = await makeGraphApiRequest(`${igUserId}/media_publish`, 'POST', {
    creation_id: container.id,
  });

  console.log(`🎉 Postare publicată cu succes pe Instagram! Media ID: ${result.id}`);
  return result;
}

// 2. Postare Carusel (Multi-Image Carousel Post)
export async function publishCarouselPost(imageUrls, caption) {
  const igUserId = process.env.INSTAGRAM_USER_ID;
  if (!igUserId) throw new Error('INSTAGRAM_USER_ID este lipsă!');

  console.log(`📌 Pasul 1: Creare iteme individuale pentru carusel (${imageUrls.length} imagini)...`);
  const itemContainerIds = [];

  for (const imgUrl of imageUrls) {
    const itemContainer = await makeGraphApiRequest(`${igUserId}/media`, 'POST', {
      image_url: imgUrl,
      is_carousel_item: 'true',
    });
    itemContainerIds.push(itemContainer.id);
    console.log(`  ✓ Item container creat: ${itemContainer.id}`);
  }

  // Așteptăm 3 secunde pentru procesare
  await new Promise(r => setTimeout(r, 3000));

  console.log('📌 Pasul 2: Creare container carusel principal...');
  const carouselContainer = await makeGraphApiRequest(`${igUserId}/media`, 'POST', {
    media_type: 'CAROUSEL',
    children: itemContainerIds.join(','),
    caption: caption,
  });

  console.log(`✓ Container carusel creat cu ID: ${carouselContainer.id}`);

  await new Promise(r => setTimeout(r, 3000));

  console.log('📌 Pasul 3: Publicare carusel pe Instagram...');
  const result = await makeGraphApiRequest(`${igUserId}/media_publish`, 'POST', {
    creation_id: carouselContainer.id,
  });

  console.log(`🎉 Carusel publicat cu succes pe Instagram! Media ID: ${result.id}`);
  return result;
}

// CLI Standalone execution
if (process.argv[1] && process.argv[1].endsWith('publish_to_instagram.mjs')) {
  const baseUrl = process.env.SITE_BASE_URL || 'https://thesite.ro';
  const coverUrl = `${baseUrl}/social_preview/1_cover.png`;
  
  const captionPath = path.join(__dirname, '..', 'social_export', 'latest', 'caption.txt');
  const caption = fs.existsSync(captionPath) 
    ? fs.readFileSync(captionPath, 'utf8') 
    : 'Nou pe thesite.ro #stiri #romania';

  publishSingleImagePost(coverUrl, caption).catch(err => {
    console.error('❌ Eroare la publicare Instagram:', err.message);
  });
}
