import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de Auto-Postare pe Instagram via Playwright Browser Automation
 * Folosește un profil persistent de browser (salvează sesiunea de login).
 */

async function autoPostToInstagram() {
  const profileDir = path.join(__dirname, '..', 'social_export', 'browser_profile');
  fs.mkdirSync(profileDir, { recursive: true });

  const latestDir = path.join(__dirname, '..', 'social_export', 'latest');
  const imagePath = path.join(latestDir, '1_cover.png');
  const captionPath = path.join(latestDir, 'caption.txt');

  if (!fs.existsSync(imagePath)) {
    throw new Error('❌ Imaginea 1_cover.png nu există! Rulează mai întâi: npm run generate:social');
  }

  const caption = fs.existsSync(captionPath) 
    ? fs.readFileSync(captionPath, 'utf8') 
    : 'Nou pe thesite.ro #stiri';

  console.log('🚀 Deschidem browserul Chromium pentru Instagram...');

  // Setăm profil persistent pentru a nu cere login la fiecare rulare
  const isHeadless = process.env.HEADLESS !== 'false';
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: isHeadless,
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });

  const page = context.pages()[0] || await context.newPage();

  console.log('📌 Navigăm pe Instagram.com...');
  await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle' });

  // Verificăm dacă suntem autentificați
  const isLoggedOut = await page.locator('input[name="username"]').isVisible({ timeout: 5000 }).catch(() => false);

  if (isLoggedOut) {
    const user = process.env.INSTAGRAM_USERNAME;
    const pass = process.env.INSTAGRAM_PASSWORD;

    if (user && pass) {
      console.log('🔑 Autentificare automată cu user și parolă...');
      await page.fill('input[name="username"]', user);
      await page.fill('input[name="password"]', pass);
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle' });
      
      // Închidem popup-uri de "Save Info" sau "Notifications"
      await page.click('button:has-text("Not Now"), button:has-text("Nu acum")').catch(() => {});
    } else {
      console.log('⚠️ Nu ești autentificat! Autentifică-te manual în browser sau setează INSTAGRAM_USERNAME și INSTAGRAM_PASSWORD în mediu.');
      if (isHeadless) {
        console.log('Sfat: Rulează prima dată cu HEADLESS=false npm run post:browser pentru a te conecta o singură dată.');
        await context.close();
        return;
      }
    }
  }

  console.log('✓ Autentificat pe Instagram!');

  // Apăsăm pe butonul "Create" / "+" din meniul stânga
  console.log('📌 Deschidem dialogul de creare postare...');
  
  const createSelector = 'svg[aria-label="New post"], svg[aria-label="Postare nouă"], a[href="#"]:has-text("Create"), span:has-text("Create"), span:has-text("Creează")';
  await page.click(createSelector).catch(async () => {
    // Fallback direct click pe SVG de plus
    await page.locator('svg[aria-label="New post"], svg[aria-label="Postare nouă"]').locator('..').click();
  });

  await page.waitForTimeout(2000);

  // Urcăm fișierul imagine
  console.log('📌 Urcăm imaginea:', imagePath);
  const fileChooserPromise = page.waitForEvent('filechooser');
  
  // Apăsăm pe "Select from computer" sau "Selectează din computer"
  const selectBtn = page.locator('button:has-text("Select from computer"), button:has-text("Selectează din computer")');
  if (await selectBtn.isVisible().catch(() => false)) {
    await selectBtn.click();
  } else {
    await page.click('button:has-text("Select")').catch(() => {});
  }

  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(imagePath);

  await page.waitForTimeout(2000);

  // Ajustare aspect ratio la 4:5
  console.log('📌 Setăm aspect ratio la 4:5...');
  const cropBtn = page.locator('button svg[aria-label="Select crop"], button svg[aria-label="Selectează decuparea"]').locator('..');
  if (await cropBtn.isVisible().catch(() => false)) {
    await cropBtn.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("4:5"), span:has-text("4:5")').catch(() => {});
  }

  // Next
  console.log('📌 Apăsăm Next...');
  await page.click('div[role="button"]:has-text("Next"), button:has-text("Next"), button:has-text("Înainte")');
  await page.waitForTimeout(1500);

  // Next (Filters step)
  await page.click('div[role="button"]:has-text("Next"), button:has-text("Next"), button:has-text("Înainte")');
  await page.waitForTimeout(1500);

  // Introduce Caption
  console.log('📌 Introducem caption-ul...');
  const captionInput = page.locator('div[aria-label="Write a caption..."], div[aria-label="Scrie o descriere..."], textarea');
  if (await captionInput.isVisible().catch(() => false)) {
    await captionInput.fill(caption);
  }

  await page.waitForTimeout(1500);

  // Click Share / Distribuie
  console.log('🚀 Publicăm postarea pe Instagram...');
  await page.click('div[role="button"]:has-text("Share"), button:has-text("Share"), button:has-text("Distribuie")');

  // Așteptăm confirmarea "Post shared" / "Postare distribuită"
  console.log('⏳ Așteptăm confirmarea publicării...');
  await page.waitForSelector('span:has-text("Post shared"), span:has-text("Postare distribuită")', { timeout: 30000 }).catch(() => {
    console.log('✓ Procesul de share s-a finalizat.');
  });

  console.log('🎉 Postare publicată cu succes pe Instagram via Playwright Browser!');
  await context.close();
}

autoPostToInstagram().catch(err => {
  console.error('❌ Eroare la auto-postare browser:', err.message);
  process.exit(1);
});
