// Repository social preview cards (GitHub "Social preview"), one per integration.
// 2560 × 1280 PNG drawn on a 1280 × 640 grid in oscout/scout's card style: an eyebrow, then the
// co-brand lockup (Scout mark × host mark, same size, no wordmark), the shared tagline ("Organized
// collaboration between all your agents, in <host>.") and three points on the left; on the right, a crop of the host's own dark illustration around its entry.
// Text and crops live in manifest.json under "social".
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

// One promise for every integration; only the platform changes.
const TAGLINE = ["Organized collaboration between", "all your agents,"];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// The host's mark at lockup size. Herdr's ram is a corner-cut glyph made to sit in a pane's
// corner, so here it gets a tile whose corner takes the cut, as in its illustration.
function hostMark(key, x, y, size) {
  const tk = { ...t, ns: `${key}-lockup` };
  if (key !== "herdr") return brand(tk, tk.ns, key, x, y, size);
  const r = size * 0.22, inset = size * 0.9;
  return `<clipPath id="${tk.ns}-tile"><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r}"/></clipPath>
<g clip-path="url(#${tk.ns}-tile)">${brand(tk, tk.ns, key, x + size - inset, y + size - inset, inset)}</g>
<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r}" fill="none" stroke="${INK}" stroke-opacity="0.46" stroke-width="2"/>`;
}

function card(key, social) {
  const art = svg(key, "dark");
  const inner = art.slice(art.indexOf(">", art.indexOf("<svg")) + 1, art.lastIndexOf("</svg>"))
    .replace(/<title[^>]*>[^<]*<\/title>/, "")
    .replace(/<desc[^>]*>[^<]*<\/desc>/, "")
    .replace(/<rect width="1600" height="500" fill="[^"]+"\/>/, "");
  const [cx, cy] = social.crop;

  const grid = [];
  for (let x = 128; x < 1280; x += 128) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="640" stroke="${INK}" stroke-opacity="0.035"/>`);
  for (let y = 128; y < 640; y += 128) grid.push(`<line x1="0" y1="${y}" x2="1280" y2="${y}" stroke="${INK}" stroke-opacity="0.035"/>`);

  // The lockup: Scout × host, both marks at one optical size, no wordmark.
  const MARK = 224, TOP = 118, LEFT = 80;
  const s = MARK / 244; // the Scout glyph's stroked bounds are 214 × 244, from (5, -4)
  const scoutRight = LEFT + 214 * s;
  const xc = scoutRight + 54, yc = TOP + MARK / 2, xr = 17;
  const hostX = xc + 54;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="1280" viewBox="0 0 1280 640">
<rect width="1280" height="640" fill="${BG}"/>
${grid.join("")}
<text x="74" y="82" font-family="${FONT}" font-weight="700" font-size="18" letter-spacing="3.6" fill="${ROUTE}">OSCOUT / ${esc(social.name.toUpperCase())}</text>
<g transform="translate(${(LEFT - 5 * s).toFixed(2)} ${(TOP + 4 * s).toFixed(2)}) scale(${s.toFixed(5)})">
  <path d="M103.01 13.21 Q112 8 120.99 13.21 L198.01 57.79 Q207 63 207 73.39 L207 162.61 Q207 173 198.01 178.21 L120.99 222.79 Q112 228 103.01 222.79 L25.99 178.21 Q17 173 17 162.61 L17 73.39 Q17 63 25.99 57.79 Z" fill="none" stroke="${INK}" stroke-width="24" stroke-linejoin="round"/>
  <path d="M112 70 154 94v48l-42 24-42-24V94Z" fill="${INK}"/>
</g>
<path d="M${xc - xr} ${yc - xr} L${xc + xr} ${yc + xr} M${xc + xr} ${yc - xr} L${xc - xr} ${yc + xr}" stroke="${SAGE}" stroke-width="5" stroke-linecap="round"/>
${hostMark(key, hostX, TOP, MARK)}
<text font-family="${FONT}" font-weight="700" font-size="30" fill="${INK}" fill-opacity="0.94"><tspan x="82" y="430">${esc(TAGLINE[0])}</tspan><tspan x="82" y="472">${esc(`${TAGLINE[1]} ${social.preposition ?? "in"} ${social.name}.`)}</tspan></text>
<text x="83" y="536" font-family="${FONT}" font-weight="700" font-size="17" letter-spacing="2.4" fill="${SAGE}">${esc(social.points.join(" · "))}</text>
<svg x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.w}" height="${PANEL.h}" viewBox="${cx} ${cy} ${CROP_W} ${CROP_H}" overflow="hidden">${inner}</svg>
</svg>`;
}

for (const entry of manifest) {
  if (!entry.social) continue;
  const out = join(OUT, `${entry.key}-scout-social.png`);
  await sharp(Buffer.from(card(entry.key, entry.social))).png({ compressionLevel: 9 }).toFile(out);
}
console.log("ok");
