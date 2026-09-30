import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Rotates social post designs one post at a time, separately for reels and carousels.
// State lives next to posted_stories.json on the posting server.
//   SOCIAL_DESIGN=v2|current  forces a design for a manual/test run without advancing the rotation.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, '..', 'social_export', 'design_rotation.json');

// Carousels stay on the current design (v2 carousel dropped on 30 Sep); reels alternate.
export const DESIGNS_BY_KIND = { reel: ['v2', 'current'], carousel: ['current'] };

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

/** Returns the design for this post and advances the counter for `kind` ('reel' | 'carousel'). */
export function nextDesign(kind) {
  const forced = process.env.SOCIAL_DESIGN;
  const designs = DESIGNS_BY_KIND[kind] || ['current'];
  if (forced && designs.includes(forced)) {
    console.log(`🎨 Design forțat prin SOCIAL_DESIGN: ${forced}`);
    return forced;
  }

  const state = readState();
  const count = Number.isInteger(state[kind]) ? state[kind] : 0;
  const design = designs[count % designs.length];
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify({ ...state, [kind]: count + 1 }, null, 2), 'utf8');
  } catch (e) {
    console.warn('⚠️ Nu am putut salva design_rotation.json:', e.message);
  }
  console.log(`🎨 Design ${kind} #${count + 1}: ${design}`);
  return design;
}
