// Generates the social card (public/og/default.png) and the touch icon
// (public/apple-touch-icon.png) from HTML, using the site's own fonts.
//
//   node scripts/make-assets.mjs
//
// Needs Chrome or Edge. Set CHROME_PATH if it is not in a standard location.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const work = join(root, '.cache', 'assets');
mkdirSync(work, { recursive: true });
mkdirSync(join(root, 'public', 'og'), { recursive: true });

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) throw new Error('Chrome or Edge not found. Set CHROME_PATH.');

const font = (name) => pathToFileURL(join(root, 'public', 'fonts', name)).href;
const faces = `
@font-face { font-family: 'Newsreader Variable'; font-weight: 200 800; src: url('${font('newsreader-latin-wght-normal.woff2')}') format('woff2'); }
@font-face { font-family: 'IBM Plex Mono'; font-weight: 400; src: url('${font('ibm-plex-mono-latin-400-normal.woff2')}') format('woff2'); }`;

const card = `<!doctype html><meta charset="utf-8"><style>${faces}
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; background: #f4f1ea; color: #1b1a17; }
  body { position: relative; padding: 72px 80px; font-family: 'Newsreader Variable', Georgia, serif; }
  .bar { position: absolute; left: 0; top: 0; bottom: 0; width: 14px; background: #a93a1a; }
  .kicker { font-family: 'IBM Plex Mono', monospace; font-size: 22px; letter-spacing: .08em; text-transform: uppercase; color: #68645a; }
  h1 { margin-top: 56px; font-size: 104px; font-weight: 450; letter-spacing: -0.02em; line-height: 1; }
  p { margin-top: 36px; max-width: 880px; font-size: 44px; line-height: 1.22; color: #4f4c44; }
  .foot { position: absolute; left: 80px; bottom: 64px; font-family: 'IBM Plex Mono', monospace; font-size: 22px; color: #68645a; }
</style><div class="bar"></div>
<div class="kicker">Portfolio, 2026</div>
<h1>Chavi Shastri</h1>
<p>I build the systems around language models, and write down where they break.</p>
<div class="foot">shastri211.github.io</div>`;

const icon = `<!doctype html><meta charset="utf-8"><style>${faces}
  * { margin: 0; } html, body { width: 500px; height: 500px; }
  body { display: grid; place-items: center; background: #a93a1a; color: #f4f1ea;
         font-family: 'Newsreader Variable', Georgia, serif; font-weight: 600; font-size: 250px; letter-spacing: -0.02em; }
</style><body>cs</body>`;

function shoot(name, html, w, h) {
  const src = join(work, `${name}.html`);
  const out = join(work, `${name}.png`);
  writeFileSync(src, html);
  execFileSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${w},${h}`,
      '--virtual-time-budget=3000',
      `--screenshot=${out}`,
      pathToFileURL(src).href,
    ],
    { stdio: 'ignore' },
  );
  return out;
}

const ogPng = shoot('og', card, 1200, 630);
await sharp(ogPng)
  .extract({ left: 0, top: 0, width: 1200, height: 630 })
  .png({ compressionLevel: 9 })
  .toFile(join(root, 'public', 'og', 'default.png'));

const iconPng = shoot('icon', icon, 500, 500);
await sharp(iconPng)
  .extract({ left: 0, top: 0, width: 500, height: 500 })
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toFile(join(root, 'public', 'apple-touch-icon.png'));

console.log('wrote public/og/default.png and public/apple-touch-icon.png');
