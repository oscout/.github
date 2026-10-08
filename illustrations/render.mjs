// Scout doc illustrations — "Station + Surface" family (core Scout + eight hosts).
// Deterministic SVG; PNG proofs via sharp (librsvg). No text labels; platform marks are embedded from their source assets.
// Run from the repository root: bun run illustrations:render
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "../assets/illustrations");
const MARKS = join(HERE, "marks");
mkdirSync(OUT, { recursive: true });

const W = 1600, H = 500, CY = 250;

// ── Integration marks: the site's own assets (marks/, provenance in marks/SOURCES.md),
// inlined as nested SVG with the original viewBox so GitHub needs no external fetch.
// Geometry is never redrawn. Only the two monochrome marks take theme ink (herdr's white,
// grok's black face); colour marks keep their colours. IDs are namespaced per output file.
function loadSvgMark(name) {
  const src = readFileSync(join(MARKS, `${name}.svg`), "utf8");
  const open = src.match(/<svg\b[^>]*>/)[0];
  const vb = open.match(/viewBox="([^"]+)"/)[1].split(/[\s,]+/).map(Number);
  const inner = src.slice(src.indexOf(open) + open.length, src.lastIndexOf("</svg>"));
  return { vb, inner };
}
const MARK_SRC = {
  claude: loadSvgMark("claude"),
  codex: loadSvgMark("codex"),
  cursor: loadSvgMark("cursor"),
  pi: loadSvgMark("pi"),
  herdr: loadSvgMark("herdr"),
  grok: loadSvgMark("grok"),
  android: loadSvgMark("android"),
};
const HERMES_PNG = `data:image/png;base64,${readFileSync(join(MARKS, "hermes.png")).toString("base64")}`;

// Place mark `key` centred in a size×size optical box at (x, y) = top-left.
function brand(t, ns, key, x, y, size) {
  if (key === "hermes") {
    const id = `${ns}-hermes-clip`;
    const r = size * 0.22;
    return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r}"/></clipPath>
<image x="${x}" y="${y}" width="${size}" height="${size}" href="${HERMES_PNG}" clip-path="url(#${id})" preserveAspectRatio="xMidYMid slice"/>
<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r}" fill="none" stroke="${t.ink}" stroke-opacity="${T.body}" stroke-width="1.5"/>`;
  }
  const { vb, inner } = MARK_SRC[key];
  let body = inner;
  if (key === "herdr") body = body.replace(/fill="white"/g, `fill="${t.ink}"`);
  if (key === "android") body = body.replace(/<title>[^<]*<\/title>/, "").replace(/<path /, `<path fill="${t.ink}" `);
  if (key === "grok") body = body.replace(/id="eyes"/g, `id="${ns}-grok-eyes"`).replace(/url\(#eyes\)/g, `url(#${ns}-grok-eyes)`).replace(/fill="#000" mask/g, `fill="${t.ink}" mask`);
  const [, , vw, vh] = vb;
  const k = size / Math.max(vw, vh);
  const w = vw * k, h = vh * k;
  return `<svg x="${(x + (size - w) / 2).toFixed(2)}" y="${(y + (size - h) / 2).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" viewBox="${vb.join(" ")}" overflow="visible">${body}</svg>`;
}


// Two themes, one geometry. Ink tiers are opacity steps of one ink.
const THEMES = {
  dark:  { ground: "#101112", ink: "#fff7ea", route: "#94d59a" },
  light: { ground: "#fbfaf7", ink: "#17181a", route: "#3a9a57" },
};

// Stroke ladder (px at 1600w; README display ~0.55x).
const S = { frame: 2, glyph: 2, text: 3, route: 4 };
const T = { body: 0.46, quiet: 0.22, strong: 1 };

function ctx(t) {
  const out = [];
  const bar = (x1, x2, y, o = T.body, w = S.text, c = t.ink) =>
    out.push(`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${c}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round"/>`);
  const path = (d, o = 1, w = S.frame, c = t.ink, extra = "") =>
    out.push(`<path d="${d}" fill="none" stroke="${c}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`);
  const rect = (x, y, w, h, r, o = 1, sw = S.frame) =>
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${t.ink}" stroke-opacity="${o}" stroke-width="${sw}"/>`);
  const dot = (cx, cy, r, o = 1, c = t.ink) =>
    out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" fill-opacity="${o}"/>`);
  const fill = (x, y, w, h, o = 1, c = t.ink, r = 1) =>
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}" fill-opacity="${o}"/>`);
  return { out, bar, path, rect, dot, fill };
}

// Canonical Scout glyph (design/brand-kit/assets/scout-glyph-ink.svg), small: a station, not a hero.
const MARK_H = 84;
function mark(t, cx = 150, cy = CY) {
  const s = MARK_H / 244;
  const tx = cx - 112 * s, ty = cy - 118 * s;
  return `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(5)})">
  <path d="M103.01 13.21 Q112 8 120.99 13.21 L198.01 57.79 Q207 63 207 73.39 L207 162.61 Q207 173 198.01 178.21 L120.99 222.79 Q112 228 103.01 222.79 L25.99 178.21 Q17 173 17 162.61 L17 73.39 Q17 63 25.99 57.79 Z" fill="none" stroke="${t.ink}" stroke-width="24" stroke-linejoin="round"/>
  <path d="M112 70 154 94v48l-42 24-42-24V94Z" fill="${t.ink}"/></g>`;
}
const MARK_RIGHT = 150 + (219 - 112) * (MARK_H / 244); // ring's outer right edge

// Route: one emerald gesture from the station to the host's real entry point.
// Grammar: leave at mid-height, at most two radius-20 turns, plug into the entry border.
// No terminal dot, no arrowhead.
function route(t, d) {
  return `<path d="${d}" fill="none" stroke="${t.route}" stroke-width="${S.route}" stroke-linecap="butt" stroke-linejoin="round"/>`;
}

// ── Claude Code: a running terminal transcript, channel message arriving at the prompt.
// Specific truths: no window chrome; ⏺ bullets for turns/tool calls; ⎿ elbow for tool results;
// the bordered prompt box at the bottom is the one framed object.
function claude(t) {
  const c = ctx(t);
  const X = 392; // transcript gutter (bullet column)
  const TX = 418; // text column
  // past user turn: › prompt
  c.path(`M${X - 5} 96 L${X + 3} 104 L${X - 5} 112`, T.body, S.glyph);
  c.bar(TX, 760, 104, T.body);
  // assistant prose
  c.dot(X, 146, 5, T.strong);
  c.bar(TX, 1150, 146, T.body);
  c.bar(TX, 980, 170, T.body);
  // tool call + result
  c.dot(X, 212, 5, T.strong);
  c.bar(TX, 560, 212, T.strong);
  c.bar(576, 800, 212, T.body);
  c.path(`M${TX + 6} 228 V246 H${TX + 22}`, T.quiet, S.glyph);
  c.bar(TX + 36, 860, 246, T.quiet);
  c.bar(TX + 36, 720, 268, T.quiet);
  // assistant closes the turn
  c.dot(X, 306, 5, T.strong);
  c.bar(TX, 1040, 306, T.body);
  // prompt box — the channel message lands here
  const BY = 340, BH = 60, BX = 372, BW = 1460 - 372;
  c.rect(BX, BY, BW, BH, 12, T.strong);
  const my = BY + BH / 2;
  c.path(`M${X + 0} ${my - 8} L${X + 8} ${my} L${X + 0} ${my + 8}`, T.strong, S.glyph);
  c.bar(TX, 772, my, 1, S.text + 0.5, t.route);
  c.fill(784, my - 12, 11, 24, T.strong);
  // footer hint under the box
  c.bar(BX + 22, BX + 150, BY + BH + 24, T.quiet);
  // session mark: top-right of the transcript, flush with the prompt box's right edge
  c.out.push(brand(t, t.ns, "claude", BX + BW - 56, 76, 56));
  const r = route(t,
    `M${MARK_RIGHT.toFixed(1)} ${CY} H292 Q312 ${CY} 312 ${CY + 20} V${my - 20} Q312 ${my} 332 ${my} H${BX}`,
    [BX, my, "v"]);
  return c.out.join("\n") + r;
}

// ── Cursor: editor context. Tabs, gutter numerals, indent guides, a selected range,
// and the agent pane where the message lands carrying that range as a context chip.
function cursor(t) {
  const c = ctx(t);
  const L = 372, R = 1460, TOP = 92, BASE = 128;
  const SPLIT = 1128;
  // tab strip: active tab opens into the editor
  c.path(`M${L} ${BASE} V${TOP + 8} Q${L} ${TOP} ${L + 8} ${TOP} H${L + 188} Q${L + 196} ${TOP} ${L + 196} ${TOP + 8} V${BASE} H${SPLIT}`, T.strong);
  c.bar(L + 24, L + 150, 110, T.strong);
  c.bar(L + 228, L + 330, 110, T.quiet);
  c.bar(L + 370, L + 452, 110, T.quiet);
  // gutter numerals as right-aligned ticks
  const rows = [
    [0, 360], [1, 520], [2, 610], [2, 470], [1, 300],
    [2, 560], [3, 640], [3, 520], [2, 380], [0, 200],
  ];
  const Y0 = 156, DY = 24, CX = 436, IND = 30;
  const sel = new Set([5, 6, 7]);
  rows.forEach(([lvl, len], i) => {
    const y = Y0 + i * DY;
    const nw = i === 9 ? 18 : 12;
    c.bar(L + 26 - nw, L + 26, y, T.quiet, 2.5);
    const x = CX + lvl * IND;
    c.bar(x, x + len * (1 - lvl * 0.06) * 0.9, y, sel.has(i) ? T.strong : T.body);
  });
  // indent guides (structural, the editor's signature)
  const guide = (lvl, from, to) => c.path(`M${CX + lvl * IND - 14} ${Y0 + from * DY - 10} V${Y0 + to * DY + 10}`, T.quiet, 1.5);
  guide(1, 1, 8); guide(2, 2, 3); guide(2, 5, 8); guide(3, 6, 7);
  // selection marker in the gutter
  c.path(`M${L + 44} ${Y0 + 5 * DY - 9} V${Y0 + 7 * DY + 9}`, T.strong, 3);
  // agent pane
  c.path(`M${SPLIT} ${TOP} V${420 - 28}`, T.strong);
  const PX = SPLIT + 30;
  // context chip: the selected range, referenced (mirrors 3 rows)
  c.rect(PX, 152, 148, 40, 8, T.strong);
  c.path(`M${PX + 16} 162 V182`, T.strong, 3);
  c.bar(PX + 30, PX + 120, 166, T.body, 2.5);
  c.bar(PX + 30, PX + 96, 178, T.body, 2.5);
  c.bar(PX, R - 10, 226, T.body);
  c.bar(PX, R - 64, 250, T.body);
  c.bar(PX, R - 130, 274, T.body);
  // agent pane header mark, top-right of the pane
  c.out.push(brand(t, t.ns, "cursor", R - 52, 92, 54));
  // pane input
  const IY = 316, IH = 52;
  c.rect(PX, IY, R - PX, IH, 10, T.strong);
  c.bar(PX + 20, PX + 168, IY + IH / 2, 1, S.text + 0.5, t.route);
  c.fill(PX + 180, IY + IH / 2 - 11, 10, 22, T.strong);
  // route runs as the status-bar rail beneath the editor, then rises into the agent input
  const RY = 420;
  const RX = PX + 92;
  const r = route(t,
    `M${MARK_RIGHT.toFixed(1)} ${CY} H292 Q312 ${CY} 312 ${CY + 20} V${RY - 20} Q312 ${RY} 332 ${RY} H${RX - 20} Q${RX} ${RY} ${RX} ${RY - 20} V${IY + IH}`,
    [RX, IY + IH, "h"]);
  return c.out.join("\n") + r;
}


// Straight route from the station into an entry at mid-height.
const straight = (t, x) => route(t, `M${MARK_RIGHT.toFixed(1)} ${CY} H${x}`);

// ── Codex: task handed in, review comes back. A task card (the entry) passes,
// through a quiet link, into a diff hunk: − rows quiet, + rows strong, a faint tint step.
function codex(t) {
  const c = ctx(t);
  // task card
  const CX0 = 372, CX1 = 724, CT = 150, CB = 350;
  c.rect(CX0, CT, CX1 - CX0, CB - CT, 12, T.strong);
  c.bar(CX0 + 26, CX0 + 238, 190, 1, S.text + 0.5, t.route);
  c.out.push(brand(t, t.ns, "codex", CX1 - 82, 158, 64)); // icon carries its own margin
  c.bar(CX0 + 26, CX1 - 40, 226, T.body);
  c.bar(CX0 + 26, CX0 + 220, 250, T.body);
  c.path(`M${CX0} 288 H${CX1}`, T.quiet, S.frame);
  c.out.push(`<circle cx="${CX0 + 32}" cy="320" r="7" fill="none" stroke="${t.ink}" stroke-opacity="${T.body}" stroke-width="${S.glyph}"/>`);
  c.bar(CX0 + 52, CX0 + 170, 320, T.quiet);
  // the work passes on: quiet link, card → diff
  c.path(`M${CX1} ${CY} H800`, T.body, S.frame);
  // diff hunk
  const DX0 = 800, DX1 = 1460, DT = 104, DB = 396;
  const rows = ["ctx", "del", "del", "add", "add", "add", "ctx"];
  const RY0 = 202, RDY = 26;
  rows.forEach((k, i) => {
    if (k === "ctx") return;
    const o = k === "add" ? 0.07 : 0.035;
    c.out.push(`<rect x="${DX0 + 1}" y="${RY0 + i * RDY - 13}" width="${DX1 - DX0 - 2}" height="${RDY}" fill="${t.ink}" fill-opacity="${o}"/>`);
  });
  c.rect(DX0, DT, DX1 - DX0, DB - DT, 6, T.strong);
  c.path(`M${DX0} 144 H${DX1}`, T.strong, S.frame);
  c.bar(DX0 + 28, DX0 + 250, 124, T.strong);
  c.bar(DX0 + 270, DX0 + 340, 124, T.quiet);
  c.out.push(`<line x1="${DX0 + 28}" y1="172" x2="${DX1 - 28}" y2="172" stroke="${t.ink}" stroke-opacity="${T.quiet}" stroke-width="2" stroke-dasharray="2 9" stroke-linecap="round"/>`);
  const lens = [430, 380, 300, 470, 520, 340, 260];
  rows.forEach((k, i) => {
    const y = RY0 + i * RDY, gx = DX0 + 34;
    if (k === "del") c.path(`M${gx - 6} ${y} H${gx + 6}`, T.strong, S.glyph);
    if (k === "add") c.path(`M${gx - 6} ${y} H${gx + 6} M${gx} ${y - 6} V${y + 6}`, T.strong, S.glyph);
    c.bar(DX0 + 64, DX0 + 64 + lens[i], y, k === "add" ? T.strong : k === "del" ? T.quiet : T.body);
  });
  return c.out.join("\n") + straight(t, CX0);
}

// ── Herdr: terminal panes. An uneven split grid with shared seams; the route runs along
// a seam and enters one pane, the only pane with a strong border.
function herdr(t) {
  const c = ctx(t);
  const L = 372, R = 1460, TOP = 92, BOT = 408, V1 = 760, V2 = 1150;
  const SEAM = T.body;
  c.rect(L, TOP, R - L, BOT - TOP, 8, SEAM);
  c.path(`M${V1} ${TOP} V${BOT} M${V2} ${TOP} V${BOT} M${L} ${CY} H${V1} M${V1} 196 H${V2} M${V1} 304 H${V2} M${V2} 330 H${R}`, SEAM);
  const rows = (x, ys, lens, o = T.quiet) => ys.forEach((y, i) => c.bar(x, x + lens[i], y, o));
  const prompt = (x, y, o = T.quiet) => c.path(`M${x - 4} ${y - 7} L${x + 3} ${y} L${x - 4} ${y + 7}`, o, S.glyph);
  rows(L + 26, [124, 148, 172, 196], [250, 300, 180, 220], T.quiet);
  prompt(L + 28, 220); c.bar(L + 46, L + 130, 220, T.quiet);
  rows(L + 26, [282, 306], [200, 140]);
  prompt(L + 28, 376); c.bar(L + 46, L + 100, 376, T.quiet);
  rows(V1 + 26, [124, 148], [260, 190]);
  rows(V1 + 26, [336, 360], [210, 280]);
  rows(V2 + 26, [124, 148, 172, 196, 220], [230, 180, 250, 120, 200]);
  prompt(V2 + 28, 368); c.bar(V2 + 46, V2 + 150, 368, T.quiet);
  // the source ram is a corner-cut glyph: seat it in the pane's corner, clipped by the frame
  c.out.push(`<clipPath id="${t.ns}-herdr-corner"><rect x="${V2}" y="330" width="${R - V2}" height="${BOT - 330}" rx="8"/></clipPath>`);
  c.out.push(`<g clip-path="url(#${t.ns}-herdr-corner)">${brand(t, t.ns, "herdr", R - 62, BOT - 62, 62)}</g>`);
  c.rect(L, TOP, R - L, BOT - TOP, 8, SEAM);
  // target pane
  c.rect(V1, 196, V2 - V1, 108, 0, T.strong);
  prompt(V1 + 28, CY, T.strong);
  c.bar(V1 + 50, V1 + 228, CY, 1, S.text + 0.5, t.route);
  c.fill(V1 + 240, CY - 12, 11, 24, T.strong);
  return c.out.join("\n") + straight(t, V1);
}

// ── pi: minimal, extensible terminal. Almost empty: an editor between two rules,
// two rows of output, and a column of extension slots, one filled.
function pi(t) {
  const c = ctx(t);
  const L = 372, R = 1320;
  c.out.push(brand(t, t.ns, "pi", L, 138, 48));
  c.bar(L + 72, L + 520, 150, T.body);
  c.bar(L + 72, L + 380, 174, T.body);
  c.path(`M${L} 218 H${R} M${L} 282 H${R}`, T.body, S.frame);
  c.bar(L + 26, L + 330, CY, 1, S.text + 0.5, t.route);
  c.fill(L + 342, CY - 12, 11, 24, T.strong);
  c.bar(L, L + 130, 316, T.quiet);
  c.bar(R - 150, R, 316, T.quiet);
  // extension slots
  const SX = 1396, SZ = 34;
  [186, 250, 314].forEach((y, i) => {
    if (i === 1) c.fill(SX, y - SZ / 2, SZ, SZ, T.strong, t.ink, 6);
    else c.rect(SX, y - SZ / 2, SZ, SZ, 6, T.body);
  });
  return c.out.join("\n") + straight(t, L);
}

// ── Hermes: a chat-to-tools bridge (not an execution harness). A chat column, a truss bridge,
// and a rail of tool slots. The route enters the chat only; nothing is drawn running.
function hermes(t) {
  const c = ctx(t);
  const pill = (x0, x1, y, o, inner, innerO = T.body) => {
    c.rect(x0, y - 18, x1 - x0, 36, 18, o);
    if (inner) c.bar(x0 + 22, x0 + 22 + inner, y, innerO);
  };
  pill(560, 760, 122, T.quiet, 130, T.quiet);
  pill(372, 640, 176, T.body, 200);
  c.rect(372, CY - 18, 328, 36, 18, T.strong);
  c.bar(396, 640, CY, 1, S.text + 0.5, t.route);
  pill(452, 692, 324, T.quiet, 0);
  [528, 572, 616].forEach((x) => c.dot(x, 324, 3.5, T.body));
  c.out.push(brand(t, t.ns, "hermes", 708, 298, 52));
  // bridge: two chords and quiet ties, abutments at each end
  c.path(`M700 ${CY} H760`, T.body, S.frame);
  const B0 = 760, B1 = 1100;
  c.path(`M${B0} ${CY - 8} H${B1} M${B0} ${CY + 8} H${B1}`, T.body, S.frame);
  for (let x = B0 + 42.5; x < B1 - 1; x += 42.5) c.path(`M${x} ${CY - 8} V${CY + 8}`, T.quiet, 1.5);
  c.path(`M${B0} ${CY - 18} V${CY + 18} M${B1} ${CY - 18} V${CY + 18}`, T.strong, S.frame);
  // tool rail
  const RX = 1124, TX = 1152, TS = 72;
  c.path(`M${B1} ${CY} H${RX} M${RX} 150 V350`, T.body, S.frame);
  [150, 250, 350].forEach((y, i) => {
    c.path(`M${RX} ${y} H${TX}`, T.body, S.frame);
    c.rect(TX, y - TS / 2, TS, TS, 12, i === 1 ? T.strong : T.body);
    const gx = TX + TS / 2;
    if (i === 0) c.out.push(`<circle cx="${gx}" cy="${y}" r="13" fill="none" stroke="${t.ink}" stroke-opacity="${T.body}" stroke-width="${S.glyph}"/>`);
    if (i === 1) c.path(`M${gx - 14} ${y - 7} H${gx + 14} M${gx - 14} ${y + 7} H${gx + 6}`, T.strong, S.text);
    if (i === 2) c.path(`M${gx - 4} ${y - 16} Q${gx - 12} ${y - 16} ${gx - 12} ${y - 8} V${y - 4} L${gx - 17} ${y} L${gx - 12} ${y + 4} V${y + 8} Q${gx - 12} ${y + 16} ${gx - 4} ${y + 16} M${gx + 4} ${y - 16} Q${gx + 12} ${y - 16} ${gx + 12} ${y - 8} V${y - 4} L${gx + 17} ${y} L${gx + 12} ${y + 4} V${y + 8} Q${gx + 12} ${y + 16} ${gx + 4} ${y + 16}`, T.body, S.glyph);
    c.bar(TX + TS + 26, TX + TS + 26 + [130, 170, 110][i], y, i === 1 ? T.body : T.quiet);
  });
  return c.out.join("\n") + straight(t, 372);
}

// ── Grok Bot (hosted): a gateway reached through an online local bridge — not Grok CLI.
// Local side: the bridge block. A dashed boundary with a gateway notch; the route stops there.
// Hosted side sits on a faint tint, drawn quiet: the gateway's card stack.
function grok(t) {
  const c = ctx(t);
  const BX = 1060;
  c.out.push(`<rect x="${BX}" y="0" width="${W - BX}" height="${H}" fill="${t.ink}" fill-opacity="0.03"/>`);
  const dash = (y0, y1) => c.out.push(`<line x1="${BX}" y1="${y0}" x2="${BX}" y2="${y1}" stroke="${t.ink}" stroke-opacity="${T.body}" stroke-width="${S.frame}" stroke-dasharray="8 10" stroke-linecap="round"/>`);
  dash(64, 222); dash(278, 436);
  c.path(`M${BX - 14} 226 H${BX + 14} M${BX - 14} 274 H${BX + 14}`, T.strong, S.frame);
  // local bridge block, online
  const L0 = 560, L1 = 820;
  c.rect(L0, 206, L1 - L0, 88, 12, T.strong);
  c.dot(L0 + 28, 234, 5, T.strong);
  c.bar(L0 + 46, L0 + 150, 234, T.body);
  c.bar(L0 + 28, L1 - 30, 264, T.quiet);
  // hosted gateway stack
  c.rect(1172, 112, 280, 196, 12, T.quiet);
  c.rect(1150, 134, 280, 196, 12, T.quiet);
  c.rect(1128, 156, 280, 196, 12, T.body);
  c.out.push(brand(t, t.ns, "grok", 1150, 172, 52));
  c.bar(1222, 1340, 198, T.body);
  c.bar(1154, 1350, 300, T.quiet);
  c.bar(1154, 1250, 324, T.quiet);
  c.path(`M${BX} ${CY} H1128`, T.body, S.frame);
  return c.out.join("\n") +
    straight(t, L0) +
    route(t, `M${L1} ${CY} H${BX}`);
}

// ── Core Scout: Scout is the subject. The same small mark at center, four host silhouettes
// miniaturised around it; two deliveries in flight (emerald), the rest quiet. No mesh.
function scout(t) {
  const c = ctx(t);
  const g = (ox, oy, fn) => { c.out.push(`<g transform="translate(${ox} ${oy})">`); fn(); c.out.push(`</g>`); };
  // Claude mini — entry: prompt box, right edge
  g(260, 70, () => {
    c.dot(8, 12, 4, T.strong); c.bar(24, 210, 12, T.body);
    c.dot(8, 38, 4, T.strong); c.bar(24, 110, 38, T.strong); c.bar(122, 200, 38, T.body);
    c.path(`M28 50 V60 H38`, T.quiet, S.glyph); c.bar(48, 170, 60, T.quiet);
    c.rect(0, 80, 280, 40, 9, T.strong);
    c.path(`M12 94 L18 100 L12 106`, T.strong, S.glyph);
    c.bar(30, 150, 100, 1, S.text + 0.5, t.route);
  });
  // Codex mini — entry: task card, left edge
  g(1060, 70, () => {
    c.rect(0, 22, 108, 76, 9, T.strong);
    c.bar(16, 76, 44, 1, S.text + 0.5, t.route); c.bar(16, 90, 66, T.body); c.bar(16, 60, 80, T.quiet);
    c.path(`M108 60 H136`, T.body, S.frame);
    c.rect(136, 0, 144, 120, 5, T.strong);
    c.path(`M136 22 H280`, T.strong, S.frame);
    c.path(`M146 50 H154`, T.strong, S.glyph); c.bar(164, 230, 50, T.quiet);
    c.path(`M146 72 H154 M150 68 V76`, T.strong, S.glyph); c.bar(164, 262, 72, T.strong);
    c.path(`M146 94 H154 M150 90 V98`, T.strong, S.glyph); c.bar(164, 240, 94, T.strong);
  });
  // Cursor mini — entry: agent input, right edge
  g(260, 310, () => {
    c.path(`M0 22 V6 Q0 0 6 0 H70 Q76 0 76 6 V22 H196`, T.body);
    [[0, 120], [1, 150], [2, 100], [1, 130], [0, 80]].forEach(([l, n], i) => c.bar(14 + l * 16, 14 + l * 16 + n, 42 + i * 17, i === 2 ? T.strong : T.body, 2.5));
    c.path(`M196 0 V120`, T.body);
    c.rect(208, 30, 50, 18, 5, T.body);
    c.rect(208, 86, 72, 26, 7, T.body);
  });
  // Grok mini — entry: local bridge, left edge; boundary + notch, hosted stack beyond
  g(1060, 310, () => {
    c.rect(0, 80, 100, 40, 8, T.body);
    c.dot(16, 100, 3.5, T.body); c.bar(28, 80, 100, T.quiet);
    c.path(`M100 100 H160`, T.body, S.frame);
    c.out.push(`<line x1="160" y1="0" x2="160" y2="82" stroke="${t.ink}" stroke-opacity="${T.body}" stroke-width="${S.frame}" stroke-dasharray="6 8" stroke-linecap="round"/>`);
    c.path(`M152 86 H168 M152 114 H168`, T.body, S.frame);
    c.rect(196, 52, 84, 68, 8, T.quiet);
    c.rect(184, 64, 84, 68, 8, T.quiet);
  });
  c.out.push(brand(t, t.ns, "claude", 206, 64, 36));
  c.out.push(brand(t, t.ns, "codex", 1354, 64, 44));
  c.out.push(brand(t, t.ns, "cursor", 208, 308, 34));
  c.out.push(brand(t, t.ns, "grok", 1356, 384, 32));
  const half = MARK_RIGHT - 150;
  const L = (800 - half).toFixed(1), R = (800 + half).toFixed(1);
  const quiet = (d) => c.path(d, T.quiet, S.text);
  quiet(`M${L} ${CY} H680 Q660 ${CY} 660 ${CY + 20} V389 Q660 409 640 409 H540`);
  quiet(`M${R} ${CY} H920 Q940 ${CY} 940 ${CY + 20} V390 Q940 410 960 410 H1060`);
  return c.out.join("\n") +
    route(t, `M${L} ${CY} H680 Q660 ${CY} 660 ${CY - 20} V190 Q660 170 640 170 H540`) +
    route(t, `M${R} ${CY} H920 Q940 ${CY} 940 ${CY - 20} V150 Q940 130 960 130 H1060`);
}


// ── Android: the phone paired to your computer, over the relay. The route passes the
// encrypted relay (a block with a padlock) and reaches a portrait handset (punch-hole camera,
// gesture bar) showing Scout's own screen, where an agent's permission request drops in as a
// heads-up notification with Deny and Allow: the entry.
function android(t) {
  const c = ctx(t);
  // relay block, padlocked: the Noise-encrypted link between computer and phone
  const R0 = 600, R1 = 840;
  c.rect(R0, CY - 40, R1 - R0, 80, 14, T.strong);
  const LX = R0 + 40;
  c.path(`M${LX - 9} ${CY - 4} V${CY - 13} Q${LX - 9} ${CY - 23} ${LX} ${CY - 23} Q${LX + 9} ${CY - 23} ${LX + 9} ${CY - 13} V${CY - 4}`, T.strong, S.glyph);
  c.rect(LX - 14, CY - 4, 28, 22, 4, T.strong, S.glyph);
  c.bar(R0 + 76, R0 + 196, CY - 10, T.body);
  c.bar(R0 + 76, R0 + 150, CY + 12, T.quiet);
  // handset
  const PX0 = 1080, PX1 = 1304, PT = 56, PB = 444;
  c.rect(PX0, PT, PX1 - PX0, PB - PT, 36, T.strong);
  const MID = (PX0 + PX1) / 2;
  c.dot(MID, PT + 22, 5, T.strong); // punch-hole camera
  // masthead: burger, title, host pill
  const MY = PT + 62;
  [MY - 8, MY, MY + 8].forEach((y) => c.bar(PX0 + 24, PX0 + 42, y, T.body, 2.5));
  c.bar(PX0 + 58, PX0 + 108, MY, T.strong);
  c.rect(PX1 - 78, MY - 13, 56, 26, 13, T.body);
  c.dot(PX1 - 63, MY, 4, 1, t.route);
  c.bar(PX1 - 54, PX1 - 34, MY, T.quiet, 2.5);
  c.path(`M${PX0} ${MY + 26} H${PX1}`, T.quiet, S.frame);
  // usage: two rows of ten dots
  [MY + 48, MY + 66].forEach((y, r) => {
    c.bar(PX0 + 24, PX0 + 58, y, T.body, 2.5);
    for (let i = 0; i < 10; i++) c.dot(PX0 + 76 + i * 12, y, 3, i < (r ? 1 : 3) ? T.strong : T.quiet);
  });
  // heads-up permission request: the entry
  const NX0 = PX0 + 14, NX1 = PX1 - 14, NT = 206, NB = 306;
  c.out.push(`<rect x="${NX0}" y="${NT}" width="${NX1 - NX0}" height="${NB - NT}" rx="16" fill="${t.ground}" stroke="${t.ink}" stroke-width="${S.frame}"/>`);
  // the notification's small icon: the Scout glyph, as Android shows an app's own mark
  const gs = 18 / 244, gx = NX0 + 30 - 112 * gs, gy = NT + 26 - 118 * gs;
  c.out.push(`<g transform="translate(${gx.toFixed(2)} ${gy.toFixed(2)}) scale(${gs.toFixed(5)})"><path d="M103.01 13.21 Q112 8 120.99 13.21 L198.01 57.79 Q207 63 207 73.39 L207 162.61 Q207 173 198.01 178.21 L120.99 222.79 Q112 228 103.01 222.79 L25.99 178.21 Q17 173 17 162.61 L17 73.39 Q17 63 25.99 57.79 Z" fill="none" stroke="${t.ink}" stroke-width="28" stroke-linejoin="round"/><path d="M112 70 154 94v48l-42 24-42-24V94Z" fill="${t.ink}"/></g>`);
  c.bar(NX0 + 48, NX0 + 140, NT + 26, T.strong);
  c.bar(NX0 + 20, NX1 - 30, NT + 50, T.body);
  c.bar(NX0 + 24, NX0 + 64, NB - 24, T.body);
  c.bar(NX0 + 96, NX0 + 150, NB - 24, 1, S.text + 0.5, t.route);
  // moving rows beneath
  [336, 362, 388].forEach((y, i) => {
    c.dot(PX0 + 30, y, 4, i === 0 ? T.strong : T.quiet);
    c.bar(PX0 + 46, PX0 + [168, 142, 120][i], y, i === 0 ? T.body : T.quiet);
  });
  c.bar(MID - 34, MID + 34, PB - 18, T.body, 4); // gesture bar
  c.out.push(brand(t, t.ns, "android", PX1 + 36, PT + 4, 56));
  return c.out.join("\n") +
    straight(t, R0) +
    route(t, `M${R1} ${CY} H${PX0}`);
}

const HOSTS = { scout, claude, codex, cursor, herdr, pi, hermes, grok, android };

const A11Y = {
  scout: ["Scout coordinates agents", "The Scout mark at center routes two live deliveries, into a Claude Code prompt and a Codex task, while Cursor and a hosted Grok Bot gateway stay connected and quiet."],
  claude: ["Scout and Claude Code", "A Scout channel message arrives at the Claude Code prompt, below a running transcript of turns, a tool call and its result."],
  codex: ["Scout and Codex", "Scout hands Codex a task card; the work comes back as a reviewed diff with removed and added lines."],
  cursor: ["Scout and Cursor", "Scout delivers into Cursor's agent pane, carrying a selected range from the editor as context."],
  herdr: ["Scout and Herdr", "Scout runs along a seam of Herdr's split terminal panes and lands at the prompt of one pane."],
  pi: ["Scout and pi", "A Scout message lands in pi's minimal terminal editor, beside a column of extension slots with one installed."],
  hermes: ["Scout and Hermes", "Scout delivers a message into a Hermes chat, which bridges to a rail of tools. Hermes connects chat to tools; it is not drawn executing anything."],
  android: ["Scout and Scout for Android", "Scout reaches a paired Android phone through the encrypted relay; an agent's permission request drops over Scout's screen as a heads-up notification with Deny and Allow."],
  grok: ["Scout and the hosted Grok Bot", "Scout reaches the hosted Grok Bot gateway through an online local bridge; the route stops at the hosted boundary, where the gateway takes over."],
};

function svg(host, theme) {
  const id = `${host}-${theme}`;
  const t = { ...THEMES[theme], ns: id };
  const [title, desc] = A11Y[host];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${id}-t ${id}-d">
<title id="${id}-t">${title}</title>
<desc id="${id}-d">${desc}</desc>
<rect width="${W}" height="${H}" fill="${t.ground}"/>
${host === "scout" ? mark(t, 800) : mark(t)}
${HOSTS[host](t)}
</svg>`;
}

for (const host of Object.keys(HOSTS)) {
  for (const theme of Object.keys(THEMES)) {
    const s = svg(host, theme);
    const base = join(OUT, `${host}-scout-${theme}`);
    writeFileSync(`${base}.svg`, s);
    await sharp(Buffer.from(s), { density: 144 }).png().toFile(`${base}@2x.png`);
    await sharp(Buffer.from(s)).png().toFile(`${base}.png`);
  }
}
console.log("ok");
