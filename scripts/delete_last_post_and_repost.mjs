import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Incarca .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const LOG_DIR = path.join(__dirname, '..', 'social_export', 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });

async function snap(page, name) {
  try {
    await page.screenshot({ path: path.join(LOG_DIR, name) });
    console.log(`📸 ${name}`);
  } catch {}
}

async function isLoggedIn(page) {
  const url = page.url();
  if (url.includes('/accounts/login') || url.includes('/accounts/emailsignup')) return false;
  const loginInput = await page.locator('input[name="username"], input[name="email"]').first().isVisible({ timeout: 2000 }).catch(() => false);
  if (loginInput) return false;
  const navPresent = await page.locator('svg[aria-label="Home"], svg[aria-label="Acasă"], svg[aria-label="New post"], svg[aria-label="Postare nouă"]').first().isVisible({ timeout: 3000 }).catch(() => false);
  return navPresent;
}

async function handleCookieAndLogin(page, context) {
  const cookieBtn = page.locator('button:has-text("Allow all cookies"), button:has-text("Permite toate cookie-urile"), button:has-text("Decline optional cookies")').first();
  if (await cookieBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('🍪 Acceptăm cookie-urile...');
    await cookieBtn.click();
    await page.waitForTimeout(2000);
  }

  const onetapSave = page.locator('button:has-text("Save info"), button:has-text("Salvați informațiile")').first();
  if (await onetapSave.isVisible({ timeout: 2000 }).catch(() => false)) {
    await onetapSave.click();
    await page.waitForTimeout(3000);
  }

  const continueSaved = page.locator('div[role="button"]:has-text("Continue"), button:has-text("Continue"), div[role="button"]:has-text("Continuă"), button:has-text("Continuă")').first();
  if (await continueSaved.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('📌 Continuăm cu profilul salvat...');
    await continueSaved.click();
    await page.waitForTimeout(3000);
  }

  if (!(await isLoggedIn(page))) {
    const user = process.env.INSTAGRAM_USERNAME;
    const pass = process.env.INSTAGRAM_PASSWORD;
    if (!user || !pass) {
      throw new Error('⚠️ Credențiale lipsă în .env (INSTAGRAM_USERNAME / INSTAGRAM_PASSWORD).');
    }

    console.log(`🔑 Autentificare cu utilizatorul: ${user}...`);
    const userField = page.locator('input[name="username"], input[name="email"]').first();
    const passField = page.locator('input[name="password"], input[name="pass"]').first();

    if (!(await userField.isVisible({ timeout: 4000 }).catch(() => false))) {
      await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);
    }

    if (await userField.isVisible({ timeout: 4000 }).catch(() => false)) {
      await userField.fill(user);
      await passField.fill(pass);
      await snap(page, 'login_filled.png');
      await passField.press('Enter');
      await page.waitForTimeout(8000);
      await snap(page, 'login_after_submit.png');
    }

    for (const t of ['Not Now', 'Nu acum', 'Save info', 'Salvați informațiile', 'Cancel']) {
      await page.locator(`button:has-text("${t}")`).first().click({ timeout: 1500 }).catch(() => {});
    }
  }
}

async function deleteLastPost(page) {
  const username = process.env.INSTAGRAM_USERNAME;
  const profileUrl = username ? `https://www.instagram.com/${username}/` : 'https://www.instagram.com/';
  console.log(`📌 Navigăm către profilul de Instagram: ${profileUrl}...`);
  await page.goto(profileUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await snap(page, 'profile_view.png');

  console.log('📌 Căutăm prima postare din profil...');
  const firstPost = page.locator('article a[href*="/p/"], main a[href*="/p/"]').first();
  if (!(await firstPost.isVisible({ timeout: 8000 }).catch(() => false))) {
    console.log('⚠️ Nu am găsit nicio postare în grid sau profilul este gol.');
    return false;
  }

  await firstPost.click();
  await page.waitForTimeout(3000);
  await snap(page, 'post_opened.png');

  console.log('📌 Apăsăm butonul "More options" (...) al postării...');
  const moreBtn = page.locator('svg[aria-label="More options"], svg[aria-label="Mai multe opțiuni"], div[role="dialog"] button:has(svg[aria-label="More options"])').first();
  if (await moreBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await moreBtn.click();
  } else {
    const headerBtn = page.locator('div[role="dialog"] header button, div[role="dialog"] div[role="button"]:has(svg)').last();
    await headerBtn.click().catch(() => {});
  }

  await page.waitForTimeout(2000);
  await snap(page, 'post_options_dialog.png');

  console.log('🗑️ Căutăm opțiunea Delete / Șterge...');
  const deleteBtn = page.locator('button:has-text("Delete"), button:has-text("Șterge"), div[role="dialog"] button:has-text("Delete"), div[role="dialog"] button:has-text("Șterge")').first();
  if (await deleteBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await deleteBtn.click();
    await page.waitForTimeout(2000);
    await snap(page, 'confirm_delete_dialog.png');

    const confirmBtn = page.locator('button:has-text("Delete"), button:has-text("Șterge")').first();
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click();
      console.log('✓ Postarea duplicată a fost ștearsă cu succes!');
      await page.waitForTimeout(4000);
      await snap(page, 'post_deleted_success.png');
      return true;
    }
  }

  console.log('⚠️ Nu am putut identifica butonul de ștergere.');
  return false;
}

async function main() {
  const profileDir = path.join(__dirname, '..', 'social_export', 'browser_profile');
  fs.mkdirSync(profileDir, { recursive: true });

  const isHeadless = process.env.HEADLESS !== 'false';
  console.log('🚀 Deschidem browserul Chromium...');
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: isHeadless,
    viewport: { width: 1280, height: 900 },
  });

  const page = context.pages()[0] || await context.newPage();

  try {
    console.log('📌 Navigăm pe Instagram.com...');
    await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    await handleCookieAndLogin(page, context);

    // 1. Ștergem postarea duplicată
    await deleteLastPost(page);

    await context.close();

    // 2. Generăm noua postare curată cu designul 1:1 și istoricul actualizat
    console.log('\n🎨 Generăm noua postare cu designul 1:1 actualizat...');
    execSync('npm run generate:social', { stdio: 'inherit' });

    // 3. Postăm noua știre pe Instagram
    console.log('\n🚀 Publicăm noua postare pe Instagram...');
    execSync('node scripts/auto_post_playwright.mjs', { stdio: 'inherit' });

    console.log('\n🎉 Totul a fost finalizat cu succes: postare veche ștearsă + postare nouă publicată!');
  } catch (err) {
    console.error('❌ Eroare:', err.message);
    await snap(page, 'fatal_error.png');
    await context.close();
  }
}

main();
