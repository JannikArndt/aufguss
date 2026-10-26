// Draws every icon the app needs from one picture, with no dependencies, so
// the sizes cannot drift apart. Run: node tools/make-icons.mjs
//
// The picture is `ink(x, y)`: a colour (or null for the background) at a
// point in a 0..1 square. Write it as shapes (circles, rounded rects, lines)
// in that square; everything else here is plumbing.
//
// Why PNG: iOS takes `apple-touch-icon` for "Add to Home Screen", Apple
// documents it as PNG, and it wins over the manifest's icons, so an SVG there
// leaves iOS with a screenshot. The manifest gets the same PNGs.
//
// Why full-bleed and opaque: iOS rounds the corners itself; corners drawn
// here would show inside its mask, and transparent pixels are not a
// background anybody chose.
//
// Why a separate maskable icon: Android crops a maskable icon to a circle or
// squircle, keeping the middle 80 %; the picture is shrunk into that zone.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = 'icons'; // listed in sw.js SHELL; index.html and the manifest point here
const BG = [0x17, 0x12, 0x0f]; // --bg, the dark theme's ground
const STEAM = [0xe0, 0x76, 0x3f];
const CREAM = [0xf2, 0xe9, 0xdf];

// A ladle and steam coming off the stones: the old icon.svg (a 512 grid with
// stroked paths), redrawn as capsules along polylines.
const G = 512;
function bezier(p0, p1, p2, p3, n = 24) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([0, 1].map((k) => u ** 3 * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t ** 3 * p3[k]));
  }
  return pts;
}
function steam(x, y) { // c0 28 24 28 24 56, then the mirrored s-curve
  return [...bezier([x, y], [x, y + 28], [x + 24, y + 28], [x + 24, y + 56]),
          ...bezier([x + 24, y + 56], [x + 24, y + 84], [x, y + 84], [x, y + 112])];
}
const arc = []; // the bowl: the lower half of a circle, centre (178,318), r 66
for (let i = 0; i <= 48; i++) { const a = Math.PI * i / 48; arc.push([178 - 66 * Math.cos(a), 318 + 66 * Math.sin(a)]); }
const STROKES = [
  ...[[168, 118], [256, 100], [344, 118]].map(([x, y]) => [steam(x, y), 21, STEAM]),
  [[[112, 318], [244, 318]], 22, CREAM],
  [arc, 22, CREAM],
  [[[238, 306], [398, 218]], 22, CREAM],
];
// Bounding boxes keep the per-point cost down: most points touch no stroke.
for (const s of STROKES) {
  const xs = s[0].map((p) => p[0]), ys = s[0].map((p) => p[1]), m = s[1] / 2 + 1;
  s.push([Math.min(...xs) - m, Math.min(...ys) - m, Math.max(...xs) + m, Math.max(...ys) + m]);
}
function segDist(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function ink(x, y) {
  const px = x * G, py = y * G;
  for (const [pts, w, col, bb] of STROKES.slice().reverse()) { // cream is on top of steam
    if (px < bb[0] || px > bb[2] || py < bb[1] || py > bb[3]) continue;
    for (let i = 1; i < pts.length; i++) if (segDist(px, py, pts[i - 1], pts[i]) <= w / 2) return col;
  }
  return null;
}

const SS = 4; // supersampling: draw 4×4 points per pixel, average them

function render(size, inset) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // PNG filter byte: none
    for (let x = 0; x < size; x++) {
      const acc = [0, 0, 0];
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = (x + (sx + 0.5) / SS) / size;
          const v = (y + (sy + 0.5) / SS) / size;
          // Shrink the picture into the safe zone; the background stays full.
          const c = ink((u - inset) / (1 - 2 * inset), (v - inset) / (1 - 2 * inset)) ?? BG;
          for (let k = 0; k < 3; k++) acc[k] += c[k];
        }
      }
      const o = y * (size * 3 + 1) + 1 + x * 3;
      for (let k = 0; k < 3; k++) raw[o + k] = Math.round(acc[k] / (SS * SS));
    }
  }
  return raw;
}

function crc32(buf) {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, inset) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: RGB, opaque on purpose
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(render(size, inset), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT, { recursive: true });
for (const [name, size, inset] of [
  ['apple-touch-icon.png', 180, 0],
  ['icon-192.png', 192, 0],
  ['icon-512.png', 512, 0],
  ['icon-maskable-512.png', 512, 0.1],
  ['favicon-32.png', 32, 0],
]) {
  writeFileSync(`${OUT}/${name}`, png(size, inset));
  console.log(`${OUT}/${name} ${size}x${size}`);
}
