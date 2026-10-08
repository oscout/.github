// Repository social preview cards (GitHub "Social preview"), one per integration.
// 2560 × 1280 PNG drawn on a 1280 × 640 grid, matching oscout/scout's card: eyebrow, the Scout
// mark and wordmark, a tagline and three points on the left; on the right, a crop of the host's
// own dark illustration around its entry. Text and crops live in manifest.json under "social".
// Needs JetBrains Mono installed (librsvg resolves fonts through fontconfig).
// Run from the repository root: bun run social:render
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { svg, brand, THEMES } from "./render.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "../assets/social");
mkdirSync(OUT, { recursive: true });
const manifest = JSON.parse(readFileSync(join(HERE, "manifest.json"), "utf8"));

const t = { ...THEMES.dark };
const BG = t.ground, INK = t.ink, ROUTE = t.route, SAGE = "#8b9289";
const FONT = "JetBrains Mono";
// The art panel and the crop share one aspect so the host drawing is never stretched.
const PANEL = { x: 752, y: 70, w: 474, h: 560 };
const CROP_W = 388, CROP_H = 458;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function card(key, social) {
  const art = svg(key, "dark");
  const inner = art.slice(art.indexOf(">", art.indexOf("<svg")) + 1, art.lastIndexOf("</svg>"))
    .replace(/<title[^>]*>[^<]*<\/title>/, "")
    .replace(/<desc[^>]*>[^<]*<\/desc>/, "")
    .replace(/<rect width="1600" height="500" fill="[^"]+"\/>/, "");
  const [cx, cy] = social.crop;
  // Where the crop leaves the host's mark out, seat it at the panel's top-right, as the illustrations do.
  const overlay = social.markOverlay ? brand({ ...t, ns: `${key}-social` }, `${key}-social`, key, cx + CROP_W - 60, cy + 12, 48) : "";

  const grid = [];
  for (let x = 128; x < 1280; x += 128) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="640" stroke="${INK}" stroke-opacity="0.035"/>`);
  for (let y = 128; y < 640; y += 128) grid.push(`<line x1="0" y1="${y}" x2="1280" y2="${y}" stroke="${INK}" stroke-opacity="0.035"/>`);

  const s = 268 / 244;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="1280" viewBox="0 0 1280 640">
<rect width="1280" height="640" fill="${BG}"/>
${grid.join("")}
<text x="74" y="82" font-family="${FONT}" font-weight="700" font-size="18" letter-spacing="3.6" fill="${ROUTE}">OSCOUT / SCOUT FOR ${esc(social.name.toUpperCase())}</text>
<g transform="translate(${80 - 17 * s} ${146 - 8 * s}) scale(${s})">
  <path d="M103.01 13.21 Q112 8 120.99 13.21 L198.01 57.79 Q207 63 207 73.39 L207 162.61 Q207 173 198.01 178.21 L120.99 222.79 Q112 228 103.01 222.79 L25.99 178.21 Q17 173 17 162.61 L17 73.39 Q17 63 25.99 57.79 Z" fill="none" stroke="${INK}" stroke-width="24" stroke-linejoin="round"/>
  <path d="M112 70 154 94v48l-42 24-42-24V94Z" fill="${INK}"/>
</g>
<text x="356" y="300" font-family="${FONT}" font-weight="700" font-size="104" letter-spacing="14" fill="${INK}">SCOUT</text>
<text x="360" y="356" font-family="${FONT}" font-weight="500" font-size="34" letter-spacing="3" fill="${INK}" fill-opacity="0.62">for ${esc(social.name)}</text>
<text x="82" y="482" font-family="${FONT}" font-weight="700" font-size="30" fill="${INK}" fill-opacity="0.92">${esc(social.tagline)}</text>
<text x="83" y="548" font-family="${FONT}" font-weight="700" font-size="17" letter-spacing="2.4" fill="${SAGE}">${esc(social.points.join(" · "))}</text>
<svg x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.w}" height="${PANEL.h}" viewBox="${cx} ${cy} ${CROP_W} ${CROP_H}" overflow="hidden">${inner}${overlay}</svg>
</svg>`;
}

for (const entry of manifest) {
  if (!entry.social) continue;
  const out = join(OUT, `${entry.key}-scout-social.png`);
  await sharp(Buffer.from(card(entry.key, entry.social))).png({ compressionLevel: 9 }).toFile(out);
}
console.log("ok");
