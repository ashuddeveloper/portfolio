/**
 * Generates every raster brand asset from inline SVG sources:
 *   public/icons/icon-192.png, icon-512.png, maskable-512.png,
 *   app/apple-icon.png, app/favicon.ico, public/og.png
 * Run: npm run icons   (outputs are committed, so this only needs re-running
 * after changing the artwork below).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const mark = (padding = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-padding} ${-padding} ${64 + padding * 2} ${64 + padding * 2}">
  <rect x="${-padding}" y="${-padding}" width="${64 + padding * 2}" height="${64 + padding * 2}" rx="${padding > 0 ? 0 : 14}" fill="#05070f"/>
  <ellipse cx="32" cy="32" rx="23" ry="9.5" fill="none" stroke="#62a4ff" stroke-width="2" opacity="0.9" transform="rotate(-18 32 32)"/>
  <ellipse cx="32" cy="32" rx="15" ry="6" fill="none" stroke="#8f7bff" stroke-width="1.5" opacity="0.65" transform="rotate(-18 32 32)"/>
  <circle cx="32" cy="32" r="6.5" fill="#e9b860"/>
  <circle cx="51" cy="22" r="3" fill="#55d6f5"/>
  <circle cx="14" cy="42" r="2.2" fill="#8f7bff"/>
</svg>`;

const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <radialGradient id="a" cx="18%" cy="6%" r="70%">
      <stop offset="0%" stop-color="#62a4ff" stop-opacity="0.4"/>
      <stop offset="55%" stop-color="#8f7bff" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#05070f" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b" cx="90%" cy="100%" r="72%">
      <stop offset="0%" stop-color="#55d6f5" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#05070f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="c" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e9edf8"/>
      <stop offset="45%" stop-color="#62a4ff"/>
      <stop offset="75%" stop-color="#8f7bff"/>
      <stop offset="100%" stop-color="#55d6f5"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#05070f"/>
  <rect width="1200" height="630" fill="url(#a)"/>
  <rect width="1200" height="630" fill="url(#b)"/>
  <g transform="translate(920,170) rotate(-16)">
    <ellipse rx="200" ry="74" fill="none" stroke="#62a4ff" stroke-opacity="0.5" stroke-width="2.5"/>
    <ellipse rx="132" ry="48" fill="none" stroke="#8f7bff" stroke-opacity="0.45" stroke-width="2"/>
    <ellipse rx="66" ry="24" fill="none" stroke="#55d6f5" stroke-opacity="0.5" stroke-width="2"/>
    <circle r="17" fill="#e9b860"/>
    <circle cx="168" cy="-46" r="7" fill="#62a4ff"/>
    <circle cx="-120" cy="40" r="5.5" fill="#8f7bff"/>
    <circle cx="52" cy="-24" r="4.5" fill="#55d6f5"/>
  </g>
  <text x="92" y="120" font-family="Menlo, Consolas, monospace" font-size="26" fill="#97a1bf" letter-spacing="4"><tspan fill="#62a4ff" font-weight="bold">GET</tspan> /portfolio <tspan fill="#4ade80">→ 200 OK</tspan></text>
  <text x="88" y="305" font-family="Helvetica, Arial, sans-serif" font-size="112" font-weight="800" fill="#e9edf8" letter-spacing="-2">ASHUTOSH</text>
  <text x="88" y="415" font-family="Helvetica, Arial, sans-serif" font-size="112" font-weight="800" fill="url(#c)" letter-spacing="-2">GUPTA</text>
  <text x="92" y="486" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#97a1bf">Senior Software Engineer · Backend (Python) &amp; AI Platforms</text>
  <text x="92" y="556" font-family="Menlo, Consolas, monospace" font-size="24" fill="#5d6785">6+ yrs · 1,000+ enterprise customers · <tspan fill="#e9b860">99.9% uptime</tspan> · Google Cloud</text>
</svg>`;

async function run() {
  await mkdir(path.join(root, "public/icons"), { recursive: true });

  const standard = Buffer.from(mark(0));
  const maskable = Buffer.from(mark(10)); // safe-zone padding for maskable

  await sharp(standard)
    .resize(192, 192)
    .png()
    .toFile(path.join(root, "public/icons/icon-192.png"));
  await sharp(standard)
    .resize(512, 512)
    .png()
    .toFile(path.join(root, "public/icons/icon-512.png"));
  await sharp(maskable)
    .resize(512, 512)
    .png()
    .toFile(path.join(root, "public/icons/maskable-512.png"));
  await sharp(standard).resize(180, 180).png().toFile(path.join(root, "app/apple-icon.png"));

  const png32 = await sharp(standard).resize(32, 32).png().toBuffer();
  const png16 = await sharp(standard).resize(16, 16).png().toBuffer();
  await writeFile(path.join(root, "app/favicon.ico"), await pngToIco([png16, png32]));

  await sharp(Buffer.from(og), { density: 144 }).png().toFile(path.join(root, "public/og.png"));

  console.log("✓ icons, favicon, apple-icon and og.png generated");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
