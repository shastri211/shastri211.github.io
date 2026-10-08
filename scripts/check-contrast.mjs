// Verifies WCAG AA contrast for every text colour pair in both themes.
// Reads the light-dark() tokens from src/styles/tokens.css, so the check cannot drift
// from the stylesheet.
//
//   node scripts/check-contrast.mjs
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const tokens = {};
for (const m of css.matchAll(
  /--([a-z0-9-]+):\s*light-dark\(\s*(#[0-9a-f]{6})\s*,\s*(#[0-9a-f]{6})\s*\)/gi,
)) {
  tokens[m[1]] = { light: m[2], dark: m[3] };
}

const channel = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, minimum ratio]. 4.5 is AA for body text, 3 for large text and UI.
const pairs = [
  ['ink', 'paper', 4.5],
  ['ink', 'paper-2', 4.5],
  ['ink-2', 'paper', 4.5],
  ['ink-2', 'paper-2', 4.5],
  ['ink-3', 'paper', 4.5],
  ['ink-3', 'paper-2', 4.5],
  ['accent', 'paper', 4.5],
  ['accent', 'paper-2', 4.5],
  ['on-accent', 'accent', 4.5],
];

let failed = 0;
for (const theme of ['light', 'dark']) {
  console.log(`\n${theme}`);
  for (const [fg, bg, min] of pairs) {
    if (!tokens[fg] || !tokens[bg]) throw new Error(`token missing: ${fg} or ${bg}`);
    const value = ratio(tokens[fg][theme], tokens[bg][theme]);
    const ok = value >= min;
    if (!ok) failed++;
    console.log(
      `  ${ok ? 'pass' : 'FAIL'}  ${fg.padEnd(10)} on ${bg.padEnd(8)} ${value.toFixed(2)}  (min ${min})`,
    );
  }
}
if (failed) {
  console.error(`\n${failed} pair(s) below the minimum.`);
  process.exit(1);
}
console.log('\nAll text pairs meet WCAG AA.');
