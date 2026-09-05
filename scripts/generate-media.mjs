// generate-media.mjs
// Generates all local placeholder media for Oddaka Inksters:
//   - public/tattoos/tattoo-NN/01..03.svg  (art-directed line-art stills)
//   - public/artists/*.svg                  (fine-line portrait studies)
//   - public/hero.svg                       (cinematic hero artwork)
//   - public/favicon.svg                    (brand mark)
//   - public/videos/*.mp4                   (encoded placeholder process videos)
//
// Run:  node scripts/generate-media.mjs
//
// The SVGs are real, deterministic generative artwork (sacred-geometry,
// linework and dotwork motifs). The videos are rasterized frames encoded
// with ffmpeg-static so <video> playback genuinely works.

import { mkdirSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { Resvg } from '@resvg/resvg-js'
import ffmpegPathPkg from 'ffmpeg-static'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PUBLIC = join(ROOT, 'public')
const TMP = join(ROOT, '.media-tmp')

const ffmpeg =
  typeof ffmpegPathPkg === 'string' ? ffmpegPathPkg : ffmpegPathPkg?.path || 'ffmpeg'

// ---------------------------------------------------------------- utilities

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function polar(r, t) {
  return [Math.cos(t) * r, Math.sin(t) * r]
}
const p = (r, t, f = 1) => polar(r, t).map((v) => (v * f).toFixed(1))
const path = (d, attrs = {}) => `<path d="${d}" ${attrsToStr(attrs)}/>`
const line = (x1, y1, x2, y2, attrs = {}) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${attrsToStr(attrs)}/>`
const circle = (cx, cy, r, attrs = {}) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" ${attrsToStr(attrs)}/>`
const ellipse = (cx, cy, rx, ry, attrs = {}) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${attrsToStr(attrs)}/>`
const polygon = (pts, attrs = {}) => `<polygon points="${pts}" ${attrsToStr(attrs)}/>`
const rectEl = (x, y, w, h, attrs = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${attrsToStr(attrs)}/>`

function attrsToStr(attrs) {
  return Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ')
}

const BONE = '#e8e3d8'
const BONE_SOFT = 'rgba(232,227,216,0.45)'

function dotRing(r, count, opts = {}, seed = 7) {
  const rnd = mulberry32(seed)
  const out = []
  for (let i = 0; i < count; i++) {
    const t = (i / count) * 2 * Math.PI + rnd() * 0.08
    const [x, y] = polar(r, t)
    out.push(
      circle(x.toFixed(1), y.toFixed(1), (opts.size || 1.6).toFixed(2), {
        fill: opts.fill || BONE,
        opacity: (opts.opacity || 0.8).toFixed(2),
      }),
    )
  }
  return out.join('\n')
}

function grain(n, seed, w, h, light = 1) {
  const rnd = mulberry32(seed)
  const out = []
  for (let i = 0; i < n; i++) {
    out.push(
      circle(
        (rnd() * w).toFixed(1),
        (rnd() * h).toFixed(1),
        (0.3 + rnd() * 1.1).toFixed(2),
        { fill: '#fff', opacity: (0.02 + rnd() * (0.05 * light)).toFixed(3) },
      ),
    )
  }
  return out.join('\n')
}

// ---------------------------------------------------------------- art frame

// Returns a complete SVG document. inner is body markup placed centered.
function artFrame({ defs = '', body, w = 850, h = 1000, accent = BONE, glow = 430, glowY = -40, seed = 11, grainN = 150 }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Oddaka Inksters artwork">
  <defs>
    <radialGradient id="gxGlow" cx="50%" cy="48%" r="60%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.001"/>
      <stop offset="55%" stop-color="${accent}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="gxVig" cx="50%" cy="46%" r="75%">
      <stop offset="58%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#040405" stop-opacity="0.92"/>
    </radialGradient>
    <linearGradient id="gxBg" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#151518"/>
      <stop offset="45%" stop-color="#0d0d10"/>
      <stop offset="100%" stop-color="#08080a"/>
    </linearGradient>
    ${defs}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#gxBg)"/>
  <g transform="translate(${w / 2} ${h / 2})"><rect x="-${w}" y="${-h + 40}" width="${w * 2}" height="${h * 2}" fill="url(#gxGlow)"/></g>
  <g transform="translate(${w / 2} ${h / 2 + (glowY || 0)})">${body}</g>
  <rect width="${w}" height="${h}" fill="url(#gxVig)"/>
  <g opacity="0.9">${grain(grainN, seed, w, h)}</g>
</svg>`
}

// ---------------------------------------------------------------- motifs

// 1 — Ouroboros / fine-line serpent ring
function motifSerpent({ accent = '#79b08c' } = {}) {
  const P = []
  P.push(circle(0, 0, 304, { stroke: BONE, 'stroke-width': 2, fill: 'none' }))
  P.push(circle(0, 0, 282, { stroke: BONE, 'stroke-width': 0.8, opacity: 0.5, fill: 'none' }))
  for (let i = 0; i < 4; i++)
    P.push(
      circle(0, 0, 248 - i * 30, {
        stroke: BONE_SOFT,
        'stroke-width': 0.6,
        fill: 'none',
        opacity: 0.35,
        'stroke-dasharray': '2 8',
      }),
    )
  for (let a = -90; a < 270; a += 6.5) {
    if (a > 60 && a < 120) continue
    const t = (a * Math.PI) / 180
    const [x1, y1] = polar(302, t)
    const [x2, y2] = polar(286, t)
    P.push(line(x1.toFixed(1), y1.toFixed(1), x2.toFixed(1), y2.toFixed(1), { stroke: BONE, 'stroke-width': 0.7, opacity: 0.4 }))
  }
  // ouroboros head at bottom, biting the ring
  const hy = 304
  P.push(
    path(
      `M -34 ${hy - 18} C -48 ${hy - 4}, -46 ${hy + 18}, -22 ${hy + 26} C -6 ${hy + 31}, 12 ${hy + 27}, 21 ${hy + 14} C 28 ${hy + 2}, 25 ${hy - 12}, 12 ${hy - 20} C 2 ${hy - 27}, -14 ${hy - 26}, -34 ${hy - 18} Z`,
      { fill: 'none', stroke: BONE, 'stroke-width': 2.1, 'stroke-linejoin': 'round' },
    ),
  )
  P.push(
    path(`M -22 ${hy + 26} C -28 ${hy + 40}, -34 ${hy + 44}, -40 ${hy + 48}`, {
      stroke: accent, 'stroke-width': 1.5, fill: 'none',
    }),
  )
  P.push(
    path(`M -22 ${hy + 26} C -16 ${hy + 40}, -10 ${hy + 46}, -4 ${hy + 50}`, {
      stroke: accent, 'stroke-width': 1.5, fill: 'none',
    }),
  )
  P.push(circle(6, hy - 30, 3, { fill: accent }))
  for (const t of [0, Math.PI / 2, Math.PI, Math.PI + Math.PI / 2]) {
    if (Math.abs(t - Math.PI / 2) < 0.4) continue
    const [x, y] = polar(322, t)
    P.push(circle(x.toFixed(1), y.toFixed(1), 2, { fill: accent }))
  }
  // corner lotus dots
  for (const [dx, dy] of [[-368, -358], [368, -358], [-368, 366], [368, 366]]) {
    P.push(circle(dx, dy, 1.6, { fill: BONE, opacity: 0.5 }))
  }
  return { defs: '', body: P.join('\n') }
}

// 2 — Feral Crown / geometric fox
function motifFox({ accent = '#9aa7bd' } = {}) {
  const P = []
  for (let i = 0; i < 14; i++) {
    const t = (-152 + i * 11) * (Math.PI / 180)
    const [x1, y1] = polar(120, t)
    const [x2, y2] = polar(212, t)
    P.push(line(x1.toFixed(1), y1.toFixed(1), x2.toFixed(1), y2.toFixed(1), { stroke: BONE, 'stroke-width': 1, opacity: 0.35 }))
  }
  P.push(circle(0, 0, 222, { stroke: BONE, 'stroke-width': 1.7, fill: 'none' }))
  P.push(circle(0, 0, 202, { stroke: BONE, 'stroke-width': 0.6, fill: 'none', opacity: 0.55, 'stroke-dasharray': '2 7' }))
  P.push(dotRing(190, 120, { size: 1.4, opacity: 0.5 }, 21))
  const earL = '0,-104 22,-168 40,-94'
  const earR = '0,-104 -22,-168 -40,-94'
  P.push(polygon(earL, { fill: '#0b0c0f', stroke: BONE, 'stroke-width': 2, 'stroke-linejoin': 'round' }))
  P.push(polygon(earR, { fill: '#0b0c0f', stroke: BONE, 'stroke-width': 2, 'stroke-linejoin': 'round' }))
  P.push(polygon('-40,-94 0,-112 40,-94 32,-58 -32,-58', { fill: '#0b0c0f', stroke: BONE, 'stroke-width': 2, 'stroke-linejoin': 'round' }))
  P.push(polygon('-32,-58 -54,-42 -44,-6 -18,-14', { fill: '#111318', stroke: BONE, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }))
  P.push(polygon('32,-58 54,-42 44,-6 18,-14', { fill: '#111318', stroke: BONE, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }))
  P.push(polygon('-34,-22 34,-22 22,10 0,44 -22,10', { fill: '#060609', stroke: BONE, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }))
  P.push(polygon('-13,44 13,44 0,63', { fill: '#060609', stroke: BONE, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }))
  P.push(polygon('-32,-50 -14,-42 -22,-34 -40,-42', { fill: '#9aa7bd', fillOpacity: 0, stroke: BONE, 'stroke-width': 1.2 }))
  P.push(polygon('32,-50 14,-42 22,-34 40,-42', { fill: '#9aa7bd', fillOpacity: 0, stroke: BONE, 'stroke-width': 1.2 }))
  P.push(circle(-22, -44, 2.4, { fill: '#0b0c0f' }))
  P.push(circle(22, -44, 2.4, { fill: '#0b0c0f' }))
  for (let i = 0; i < 5; i++)
    P.push(
      line(0, 63 + i * 4, -i * 3 - 4, 63 + i * 6, { stroke: BONE, 'stroke-width': 0.7, opacity: 0.4 }),
    )
  for (let i = 0; i < 5; i++)
    P.push(line(0, 63 + i * 4, i * 3 + 4, 63 + i * 6, { stroke: BONE, 'stroke-width': 0.7, opacity: 0.4 }))
  return { defs: '', body: P.join('\n') }
}

// 3 — Sovereign Gaze / macro realism eye
function motifEye({ iris = '#4f7a9e', lidTop = '#1a1b20', lidBottom = '#131417' } = {}) {
  const P = []
  const defs = `
    <linearGradient id="mxLidUp" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#191a1f"/>
      <stop offset="100%" stop-color="#0c0d10"/>
    </linearGradient>
    <linearGradient id="mxLidDown" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0b0e"/>
      <stop offset="100%" stop-color="#1b1c21"/>
    </linearGradient>
    <radialGradient id="mxIris" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${iris}" stop-opacity="0.95"/>
      <stop offset="60%" stop-color="${iris}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#14161b" stop-opacity="0.4"/>
    </radialGradient>`
  P.push(
    path('M -330 -60 C -240 -170, 240 -170, 330 -60 C 330 -60, 300 -250, 0 -270 C -300 -250, -330 -60, -330 -60 Z', {
      fill: 'url(#mxLidUp)', stroke: 'none',
    }),
  )
  P.push(
    path('M -330 -60 L 330 -60 C 330 120, 170 205, 0 180 C -170 205, -330 120, -330 -60 Z', {
      fill: 'url(#mxLidDown)', stroke: 'none',
    }),
  )
  P.push(ellipse(0, 0, 276, 152, { fill: 'url(#mxIris)', stroke: BONE, 'stroke-width': 2.2 }))
  P.push(circle(0, 0, 132, { fill: 'url(#mxIris)', stroke: 'none' }))
  const n = 56
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const [x1, y1] = polar(150, a)
    const [x2, y2] = polar(96, a)
    P.push(
      line(x1.toFixed(1), y1.toFixed(1), x2.toFixed(1), y2.toFixed(1), {
        stroke: i % 2 ? '#d8d4ca' : '#3a3b40',
        'stroke-width': i % 2 ? 1.4 : 0.6,
        opacity: 0.5,
      }),
    )
  }
  P.push(circle(0, 0, 70, { fill: '#0a0b0e', stroke: BONE, 'stroke-width': 1.2 }))
  P.push(circle(0, 0, 54, { fill: '#050507', stroke: '#2c2d33', 'stroke-width': 0.6 }))
  P.push(circle(-18, -16, 12, { fill: '#f2efe9', opacity: 0.92 }))
  P.push(circle(16, 14, 5, { fill: '#f2efe9', opacity: 0.55 }))
  for (let i = 0; i < 30; i++) {
    const y = -60 + i * 9
    const span = 250 + (Math.sin(i * 1.3) * 70)
    P.push(
      path(`M ${-span} ${y} Q ${-span * 0.5} ${y - 30} 0 ${y - 6}`, {
        stroke: '#d8d4ca', 'stroke-width': 0.9, fill: 'none', opacity: 0.35,
      }),
    )
  }
  for (let i = 0; i < 26; i++) {
    const x = -300 + i * 24
    const y0 = 40 + Math.abs(Math.sin(i * 0.9)) * 40
    P.push(path(`M ${x} ${y0} Q ${x * 0.5} ${y0 + 40} ${x * 0.05} ${y0 + 18}`, {
      stroke: '#d8d4ca', 'stroke-width': 0.8, fill: 'none', opacity: 0.3,
    }))
  }
  return { defs, body: P.join('\n') }
}

// petal used by rose / lotus / mandalas
function petalRing(r, count, { len, wid, rot = 0, stroke = BONE, sw = 2.6, fill = 'none', opacity = 1, color = BONE } = {}) {
  const out = []
  for (let i = 0; i < count; i++) {
    const a = (i / count) * 360 + rot
    out.push(`<g transform="rotate(${a.toFixed(1)})"><ellipse cx="0" cy="${-r.toFixed(1)}" rx="${wid.toFixed(1)}" ry="${len.toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/></g>`)
  }
  return out.join('\n')
}

// 4 — Iron & Bloom / traditional dagger through rose
function motifDaggerRose({ red = '#a33a32', ochre = '#c08a2d' } = {}) {
  const P = []
  P.push(petalRing(132, 8, { len: 128, wid: 40, stroke: '#8c2b25', sw: 2.4, fill: red }))
  P.push(petalRing(92, 7, { len: 96, wid: 34, rot: 22, stroke: '#8c2b25', sw: 2.2, fill: red }))
  P.push(petalRing(52, 6, { len: 66, wid: 26, rot: 10, stroke: '#7c211d', sw: 2, fill: '#b34837' }))
  P.push(circle(0, 4, 24, { fill: ochre, stroke: '#6e4b12', 'stroke-width': 1.6 }))
  P.push(circle(0, 4, 8, { fill: '#2a1200' }))
  // leaves
  for (const side of [-1, 1]) {
    P.push(
      path(`M ${side * 40} ${150} C ${side * 150} ${140}, ${side * 190} ${70}, ${side * 120} ${14} C ${side * 80} ${40}, ${side * 70} ${100}, ${side * 40} ${150} Z`, {
        fill: '#2e4d2c', stroke: '#1f3a1f', 'stroke-width': 2.2,
      }),
    )
    P.push(path(`M ${side * 40} ${150} C ${side * 120} ${95}, ${side * 145} ${52}, ${side * 122} ${20}`, {
      stroke: '#94b96a', 'stroke-width': 1.2, fill: 'none', opacity: 0.8,
    }))
  }
  // dagger blade through the rose
  P.push(
    polygon('-10,-340 10,-340 24,-40 10,-12 -10,-12 -24,-40', {
      fill: '#c9c6bd', stroke: '#1e1d1b', 'stroke-width': 2.4,
    }),
  )
  P.push(line(-10, -340, -10, -12, { stroke: '#8d8a82', 'stroke-width': 1, opacity: 0.8 }))
  P.push(
    polygon('-10,-340 10,-340 10,-330 -10,-330', { fill: '#2e2d2b', stroke: '#1e1d1b', 'stroke-width': 1.6 }),
  )
  P.push(
    polygon('-44,-40 44,-40 34,-30 -34,-30', { fill: '#8a2b25', stroke: '#1e1d1b', 'stroke-width': 2 }),
  )
  P.push(circle(0, -44, 5, { fill: '#8a2b25', stroke: '#1e1d1b', 'stroke-width': 1.4 }))
  // lower tip
  P.push(
    polygon('-9,40 9,40 24,260 2,300 -2,300 -24,260', {
      fill: '#c9c6bd', stroke: '#1e1d1b', 'stroke-width': 2.4, 'stroke-linejoin': 'round',
    }),
  )
  for (let i = 0; i < 4; i++)
    P.push(circle(36 + i * 16, 208 + i * 20, 5 - i * 0.8, { fill: red, opacity: 0.85 }))
  // border dots
  P.push(dotRing(382, 90, { size: 1.2, opacity: 0.4 }, 8))
  return { defs: '', body: P.join('\n') }
}

// 5 — Tide Walker / koi
function motifKoi({ red = '#c14b30', teal = '#3f7a76' } = {}) {
  const P = []
  const defs = `
    <linearGradient id="kxBody" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e6dfce"/>
      <stop offset="45%" stop-color="#d9d0bb"/>
      <stop offset="100%" stop-color="#ede7d6"/>
    </linearGradient>`
  // water background
  for (let i = 0; i < 6; i++) {
    const y = -300 + i * 108
    P.push(
      path(`M -460 ${y} C -360 ${y - 26}, -260 ${y + 26}, -160 ${y} C -60 ${y - 26}, 40 ${y + 26}, 140 ${y} C 240 ${y - 26} 340 ${y + 26} 460 ${y}`, {
        stroke: teal, 'stroke-width': 1.1, fill: 'none', opacity: 0.22,
      }),
    )
  }
  P.push(circle(-330, -200, 9, { stroke: teal, 'stroke-width': 1, fill: 'none', opacity: 0.35 }))
  P.push(circle(-300, -176, 5, { stroke: teal, 'stroke-width': 1, fill: 'none', opacity: 0.3 }))
  P.push(circle(330, 250, 12, { stroke: teal, 'stroke-width': 1, fill: 'none', opacity: 0.3 }))
  P.push(circle(362, 282, 6, { stroke: teal, 'stroke-width': 1, fill: 'none', opacity: 0.25 }))
  // koi body (swimming right)
  const headX = 150
  P.push(
    path(
      `M ${headX} 0 C ${headX + 16} -120, 30 -190, -170 -40 C -210 -4, -232 0, -234 12 C -236 24, -218 26, -185 40 C 20 190, ${headX + 20} ${headX / 1.3}, ${headX} 0 Z`,
      { fill: 'url(#kxBody)', stroke: '#8d846c', 'stroke-width': 1.8 },
    ),
  )
  // tail fins
  P.push(
    path('M -200 -14 C -260 -90, -300 -92, -330 -34 C -296 -20, -266 8, -238 22 C -224 6, -212 -2, -200 -14 Z', {
      fill: '#d7cdb4', stroke: '#8d846c', 'stroke-width': 1.5,
    }),
  )
  P.push(
    path('M -200 22 C -260 96, -302 96, -330 40 C -294 26, -264 -4, -234 -18 C -222 -2, -210 8, -200 22 Z', {
      fill: '#cbc0a4', stroke: '#8d846c', 'stroke-width': 1.5,
    }),
  )
  // dorsal + pec fins
  P.push(
    path('M 30 -120 C 60 -150, 96 -140, 108 -108 C 84 -104, 52 -104, 30 -120 Z', {
      fill: '#c9bfa4', stroke: '#8d846c', 'stroke-width': 1.4,
    }),
  )
  // red markings
  P.push(ellipse(60, -58, 40, 30, { fill: red, opacity: 0.88, transform: 'rotate(-14)' }))
  P.push(ellipse(-30, -30, 34, 26, { fill: red, opacity: 0.92 }))
  P.push(ellipse(-110, 20, 40, 30, { fill: red, opacity: 0.85, transform: 'rotate(10)' }))
  // head
  P.push(circle(headX - 6, -10, 42, { fill: '#e8e1cf', stroke: '#8d846c', 'stroke-width': 1.6 }))
  P.push(path(`M ${headX + 30} -6 C ${headX + 46} 10, ${headX + 40} 30, ${headX + 20} 34`, { stroke: '#6d6757', 'stroke-width': 1.2, fill: 'none' }))
  P.push(circle(headX - 34, -16, 3, { fill: '#141414' }))
  P.push(circle(headX - 6, 26, 4, { fill: '#141414' }))
  // scales
  for (let row = 1; row <= 6; row++) {
    for (let col = 0; col < 8; col++) {
      const x = -60 - col * 26 + row * 8
      const y = -52 + row * 22
      P.push(path(`M ${x} ${y} A 11 9 0 0 1 ${x + 20} ${y}`, { stroke: '#a89e83', 'stroke-width': 0.9, fill: 'none', opacity: 0.6 }))
    }
  }
  return { defs, body: P.join('\n') }
}

// 6 — Idle Line / one-line portrait
function motifOneLine() {
  const P = []
  P.push(
    path(
      'M -30 -300 C 110 -312, 190 -240, 176 -156 C 168 -126, 150 -118, 128 -122 L 112 -128 C 96 -138, 78 -132, 74 -118 C 70 -104, 56 -96, 44 -100 L 28 -106 C 16 -104, 6 -94, 4 -82 L -4 -70 C -8 -60, -2 -48, 10 -52 L 26 -58 C 30 -48, 22 -34, 8 -28 C -2 -26, -8 -16, -4 -6 C 0 6, 10 18, 26 26 C 42 34, 56 48, 62 68 C 66 82, 64 98, 54 108 L 36 122 C 22 130, 12 138, 6 150 C 8 164, 20 172, 38 174 L 66 178 C 96 186, 118 198, 128 222 C 120 244, 100 258, 70 262 L -6 268 C -66 272, -120 258, -160 228 C -196 200, -210 168, -196 136 C -184 108, -158 92, -122 90 L -84 92 C -60 94, -44 84, -40 66 C -36 48, -42 30, -60 22 L -96 12 C -128 4, -150 -8, -164 -26 C -176 -44, -178 -60, -172 -74',
      {
        fill: 'none', stroke: BONE, 'stroke-width': 3.2, 'stroke-linecap': 'round',
        transform: 'scale(0.94)',
      },
    ),
  )
  // accent dots
  P.push(circle(-190, -150, 2.6, { fill: '#79b08c' }))
  P.push(circle(-206, -172, 1.5, { fill: '#79b08c', opacity: 0.7 }))
  P.push(circle(186, 80, 2.2, { fill: '#79b08c', opacity: 0.6 }))
  return { defs: '', body: P.join('\n') }
}

// 7 — cover-up: crude old anchor (before)
function motifCoverBefore() {
  const P = []
  P.push(circle(0, 60, 118, { fill: '#08080a', stroke: '#241f1b', 'stroke-width': 7 }))
  P.push(path('M -44 -40 C -56 -118, -30 -196, 12 -210 C 66 -226, 96 -150, 78 -70 C 66 -12, 48 22, 40 54', {
    fill: 'none', stroke: '#23201d', 'stroke-width': 12, 'stroke-linecap': 'round',
  }))
  P.push(path('M -104 -118 C -56 -146, 74 -148, 116 -110', { fill: 'none', stroke: '#23201d', 'stroke-width': 14, 'stroke-linecap': 'round' }))
  P.push(path('M -44 -40 C -40 26, -6 84, 18 140 C 26 158, 24 172, 12 178 C -4 186, -20 182, -30 170 C -44 152, -52 118, -46 84', {
    fill: '#171616', stroke: '#0d0c0c', 'stroke-width': 3,
  }))
  P.push(circle(12, 178, 34, { fill: 'none', stroke: '#23201d', 'stroke-width': 11 }))
  for (const [x, y, r] of [[-64, -40, 16], [-90, 90, 20], [78, -34, 15], [60, 120, 18], [-28, -140, 12]]) {
    P.push(circle(x, y, r, { fill: '#1c1916', opacity: 0.8 }))
  }
  for (let i = 0; i < 12; i++) {
    P.push(path(`M ${-160 + Math.round(Math.random() * 320)} ${-190 + Math.round(Math.random() * 420)} C ${-140 + Math.round(Math.random() * 280)} ${-170 + Math.round(Math.random() * 380)}, ${-150 + Math.round(Math.random() * 300)} ${-180 + Math.round(Math.random() * 400)}, ${-140 + Math.round(Math.random() * 280)} ${-160 + Math.round(Math.random() * 360)}`, {
      stroke: '#221e1a', 'stroke-width': 2.4, fill: 'none', opacity: 0.7,
    }))
  }
  return { defs: '', body: P.join('\n') }
}

// 7 — cover-up: celestial mandala (after)
function motifCoverAfter({ navY = '#21314a', bone = '#e8e3d8' } = {}) {
  const P = []
  const defs = `
    <radialGradient id="cDisc" cx="50%" cy="48%" r="55%">
      <stop offset="0%" stop-color="#1d2a3d"/>
      <stop offset="55%" stop-color="#101a28"/>
      <stop offset="100%" stop-color="#070c13"/>
    </radialGradient>`
  P.push(circle(0, 0, 330, { fill: 'url(#cDisc)', stroke: navY, 'stroke-width': 1.6, opacity: 0.9 }))
  P.push(circle(0, 0, 330, { fill: 'none', stroke: 'rgba(232,227,216,0.35)', 'stroke-width': 1 }))
  P.push(dotRing(306, 130, { size: 1.7, opacity: 0.65 }, 31))
  P.push(petalRing(250, 14, { len: 80, wid: 26, rot: 12, stroke: bone, sw: 1.8, fill: 'none', opacity: 0.85 }))
  for (let i = 0; i < 28; i++) {
    const a = ((i / 28) * Math.PI * 2) + 0.11
    const [x1, y1] = polar(270, a)
    const [x2, y2] = polar(204, a)
    P.push(line(x1.toFixed(1), y1.toFixed(1), x2.toFixed(1), y2.toFixed(1), { stroke: bone, 'stroke-width': 1, opacity: 0.4 }))
  }
  P.push(circle(0, 0, 190, { fill: '#0d1520', stroke: bone, 'stroke-width': 1.4 }))
  P.push(petalRing(148, 8, { len: 78, wid: 28, rot: 22, stroke: bone, sw: 1.6, fill: 'none', opacity: 0.9 }))
  P.push(circle(0, 0, 112, { fill: 'none', stroke: bone, 'stroke-width': 1.2 }))
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.26
    const [x1, y1] = polar(108, a)
    const [x2, y2] = polar(56, a)
    P.push(line(x1.toFixed(1), y1.toFixed(1), x2.toFixed(1), y2.toFixed(1), { stroke: bone, 'stroke-width': 1.1, opacity: 0.55 }))
  }
  P.push(circle(0, 0, 48, { fill: '#e8e3d8', stroke: navY, 'stroke-width': 1.4 }))
  P.push(dotRing(40, 12, { size: 2.2, opacity: 0.9 }, 42))
  P.push(circle(0, 0, 14, { fill: '#101a28' }))
  return { defs, body: P.join('\n') }
}

// 8 — Prism Lotus / color geometric lotus
function motifLotus({ a = '#8a6aa8', b = '#a76fae', c = '#b15c94' } = {}) {
  const P = []
  const defs = `
    <linearGradient id="lp0" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c}"/><stop offset="100%" stop-color="${a}"/></linearGradient>
    <linearGradient id="lp1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${b}"/><stop offset="100%" stop-color="${c}"/></linearGradient>
    <linearGradient id="lp2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9d6bb0"/><stop offset="100%" stop-color="${b}"/></linearGradient>`
  const layers = [
    { r: 210, n: 12, l: 130, w: 46, fill: 'url(#lp0)', sw: 1.6 },
    { r: 138, n: 9, l: 96, w: 40, fill: 'url(#lp1)', sw: 1.5 },
    { r: 74, n: 6, l: 62, w: 30, fill: 'url(#lp2)', sw: 1.4 },
  ]
  for (const L of layers) P.push(petalRing(L.r, L.n, { len: L.l, wid: L.w, stroke: 'rgba(232,227,216,0.8)', sw: L.sw, fill: L.fill }))
  P.push(circle(150, -246, 2, { fill: '#fff', opacity: 0.7 }))
  P.push(circle(-150, 250, 2, { fill: '#fff', opacity: 0.6 }))
  for (let i = 0; i < 16; i++) {
    P.push(line(0, 0, p(360, (i / 16) * Math.PI * 2)[0], p(360, (i / 16) * Math.PI * 2)[1], { stroke: 'rgba(255,255,255,0.09)', 'stroke-width': 1 }))
  }
  P.push(circle(0, 0, 18, { fill: '#fff' }))
  P.push(circle(0, 0, 8, { fill: '#241029' }))
  return { defs, body: P.join('\n') }
}

// 9 — Osseous / geometric skull
function motifSkull({ bone = '#e8e3d8' } = {}) {
  const P = []
  P.push(circle(0, -8, 168, { fill: 'none', stroke: bone, 'stroke-width': 2.2 }))
  P.push(circle(0, -8, 150, { fill: 'none', stroke: bone, 'stroke-width': 0.8, opacity: 0.5 }))
  P.push(polygon('-92,-60 -74,-118 -132,-78', { fill: '#0b0c0f', stroke: bone, 'stroke-width': 1.6 }))
  P.push(polygon('92,-60 74,-118 132,-78', { fill: '#0b0c0f', stroke: bone, 'stroke-width': 1.6 }))
  P.push(circle(-66, -30, 40, { fill: '#040406', stroke: bone, 'stroke-width': 1.8 }))
  P.push(circle(66, -30, 40, { fill: '#040406', stroke: bone, 'stroke-width': 1.8 }))
  P.push(path('M -106,26 L -30,74 L 0,50 L 30,74 L 106,26 L 74,96 L 30,108 L 0,88 L -30,108 L -74,96 Z', {
    fill: '#0b0c0f', stroke: bone, 'stroke-width': 1.8, 'stroke-linejoin': 'round',
  }))
  for (let i = 0; i < 7; i++)
    P.push(line(-52 + i * 18, 108, -52 + i * 18, 124, { stroke: bone, 'stroke-width': 1.2, opacity: 0.7 }))
  P.push(path('M -120,34 C -168,90 -132,176 -74,184 C -34,190 -18,160 0,152 C 18,160 34,190 74,184 C 132,176 168,90 120,34', {
    fill: 'none', stroke: bone, 'stroke-width': 2,
  }))
  P.push(line(0, 152, 0, 196, { stroke: bone, 'stroke-width': 1.4, opacity: 0.8 }))
  P.push(path('M -120,34 C -96,70 -48,92 0,94 C 48,92 96,70 120,34', { fill: 'none', stroke: bone, 'stroke-width': 1, opacity: 0.5 }))
  for (let i = 0; i < 4; i++)
    P.push(line(-36 + i * 24, 184, -36 + i * 24, 199, { stroke: bone, 'stroke-width': 1.1, opacity: 0.6 }))
  P.push(path('M 0 -176 L 0 -150', { stroke: bone, 'stroke-width': 1.2, opacity: 0.6 }))
  P.push(line(-34, -168, -10, -154, { stroke: bone, 'stroke-width': 1, opacity: 0.5 }))
  P.push(line(34, -168, 10, -154, { stroke: bone, 'stroke-width': 1, opacity: 0.5 }))
  P.push(dotRing(352, 100, { size: 1.3, opacity: 0.35 }, 17))
  return { defs: '', body: P.join('\n') }
}

// 10 — Static Bloom / fine-line stem florals
function motifFloral({ accent = '#b58a98' } = {}) {
  const P = []
  P.push(path('M 0 300 C 46 240, -30 150, 14 60 C 40 8, -8 -70, 10 -130 C 22 -170, 10 -200, 6 -230', {
    stroke: BONE, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round',
  }))
  const leaf = (bl, bx, bx2, sy) => {
    const s = bl
    P.push(path(`M 0 ${sy} C ${s * 0.9} ${sy - 6}, ${s * 1.25} ${sy + 10}, ${bx2} ${sy + 24} Z`, { stroke: BONE, 'stroke-width': 1.5, fill: 'none' }))
    P.push(path(`M 0 ${sy} C ${s * 0.7} ${sy + 2}, ${s * 1.05} ${sy + 12}, ${bx} ${sy + 24}`, { stroke: BONE, 'stroke-width': 0.7, fill: 'none', opacity: 0.6 }))
  }
  leaf(90, 92, 96, 40)
  leaf(-84, -80, -86, -8)
  leaf(76, 70, 84, -64)
  // bloom at top
  P.push(petalRing(38, 5, { len: 64, wid: 16, rot: 36, stroke: BONE, sw: 1.4, fill: 'none', opacity: 0.9 }))
  P.push(circle(0, -238, 13, { fill: 'none', stroke: BONE, 'stroke-width': 1.2 }))
  P.push(circle(0, -238, 4, { fill: BONE }))
  P.push(circle(0, -238, 1.6, { fill: '#0b0c0f' }))
  // pollen
  for (const [x, y, r] of [[-40, -258, 1.4], [36, -272, 1.2], [-24, -296, 1.6], [56, 18, 1.3], [-70, -120, 1.4], [84, -118, 1.2]]) {
    P.push(circle(x, y, r, { fill: accent, opacity: 0.75 }))
  }
  return { defs: '', body: P.join('\n') }
}

// 11 — Ledger / custom compass
function motifCompass({ gold = '#b88a3e' } = {}) {
  const P = []
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2
    const [x1, y1] = polar(200, a)
    const [x2, y2] = polar(i % 6 === 0 ? 183 : 191, a)
    P.push(line(x1.toFixed(1), y1.toFixed(1), x2.toFixed(1), y2.toFixed(1), { stroke: BONE, 'stroke-width': i % 6 === 0 ? 1.2 : 0.6, opacity: 0.6 }))
  }
  P.push(circle(0, 0, 200, { fill: 'none', stroke: BONE, 'stroke-width': 1.7 }))
  P.push(circle(0, 0, 176, { fill: 'none', stroke: BONE, 'stroke-width': 0.7, opacity: 0.5, 'stroke-dasharray': '2 6' }))
  const star = (pts, rIn2, rOut2, rot, stroke, col) => {
    const str = []
    for (let i = 0; i < pts; i++) {
      const a1 = rot + (i / pts) * Math.PI * 2
      const a2 = rot + ((i + 0.5) / pts) * Math.PI * 2
      str.push((polar(rOut2, a1).map((v) => v.toFixed(1))).join(','), (polar(rIn2, a2).map((v) => v.toFixed(1))).join(','))
    }
    P.push(polygon(str.join(' '), { fill: '#0b0c0f', stroke, 'stroke-width': 1.2, 'stroke-linejoin': 'round' }))
  }
  star(4, 44, 128, Math.PI / 4, 'rgba(232,227,216,0.8)', '#0b0c0f')
  star(4, 20, 92, 0, 'rgba(232,227,216,0.7)', '#0b0c0f')
  // needle
  P.push(line(0, 150, 0, -210, { stroke: gold, 'stroke-width': 2.6, 'stroke-linecap': 'round' }))
  P.push(polygon('-7,-210 0,-228 7,-210', { fill: gold, stroke: 'none' }))
  P.push(polygon('-5,150 5,150 0,168', { fill: '#e8e3d8', stroke: 'none' }))
  // route
  P.push(path('M -360,180 C -240,60 -160,200 -60,120 C 10,60 80,180 160,40 C 210,-40 300,-40 360,-160', {
    stroke: 'rgba(232,227,216,0.75)', 'stroke-width': 1.6, fill: 'none', 'stroke-dasharray': '8 6',
  }))
  for (const [x, y] of [[-360, 180], [-240, 96], [-60, 120], [160, 40], [360, -160]]) {
    P.push(circle(x, y, 7, { fill: '#0b0c0f', stroke: gold, 'stroke-width': 1.6 }))
    P.push(circle(x, y, 2.2, { fill: gold }))
  }
  // corner ticks
  for (const [dx, dy] of [[-340, -320], [340, -320], [-340, 330], [340, 330]]) {
    P.push(circle(dx, dy, 2, { fill: BONE, opacity: 0.5 }))
  }
  return { defs: '', body: P.join('\n') }
}

// 12 — Cardinal / traditional swallow
function motifSwallow({ navy = '#26324a', amber = '#c08a2d', sky = '#3f5979' } = {}) {
  const P = []
  const defs = `
    <radialGradient id="swBG" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#1a2a42" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="${navy}" stop-opacity="0"/>
    </radialGradient>`
  // upper wing (far)
  P.push(
    path('M -30 -10 C -120 -120, -210 -170, -300 -120 C -250 -70, -200 -20, -60 10 Z', {
      fill: '#1c2740', stroke: BONE, 'stroke-width': 3, 'stroke-linejoin': 'round',
    }),
  )
  // lower wing (near, larger)
  P.push(
    path('M -30 10 C -140 40, -250 60, -340 10 C -280 -10, -160 -30, -40 -8 Z', {
      fill: navy, stroke: BONE, 'stroke-width': 3, 'stroke-linejoin': 'round',
    }),
  )
  // body
  P.push(ellipse(-2, 6, 74, 34, { fill: navy, stroke: BONE, 'stroke-width': 3 }))
  // head
  P.push(circle(62, 2, 26, { fill: navy, stroke: BONE, 'stroke-width': 3 }))
  P.push(circle(74, -1, 4, { fill: '#0a0b0f' }))
  P.push(path('M 40 24 C 54 44, 74 44, 88 30 L 96 40 C 84 56, 50 54, 34 28 Z', { fill: amber, stroke: BONE, 'stroke-width': 2.4 }))
  // tail fork
  P.push(polygon('-70 20 -200 96 -180 26', { fill: navy, stroke: BONE, 'stroke-width': 2.6 }))
  P.push(polygon('-70 -4 -200 -92 -172 -18', { fill: '#1c2740', stroke: BONE, 'stroke-width': 2.6 }))
  // wing feather rows
  for (let i = 0; i < 3; i++)
    P.push(line(-150 - i * 6, 14 - i * 4, -236 - i * 14, 36 - i * 8, { stroke: amber, 'stroke-width': 2, opacity: 0.9 }))
  P.push(line(-160, 30, -246, 52, { stroke: amber, 'stroke-width': 2, opacity: 0.9 }))
  P.push(circle(0, 0, 240, { fill: 'url(#swBG)' }))
  return { defs, body: P.join('\n') }
}

// 13 — Solstice / realism feather
function motifFeather() {
  const P = []
  const shaft = path('M 0 30 C 6 -30, 4 -140, -4 -230', { stroke: '#cfcabe', 'stroke-width': 2.2, fill: 'none' })
  P.push(shaft)
  const rows = []
  for (let i = 0; i < 46; i++) {
    const t = i / 45
    const y = 30 - t * 250
    const width = (Math.sin(t * Math.PI) * 170 + 16)
    const ang = 0.62
    for (let k = 0; k < 4; k++) {
      const off = k * 2.2
      const len = width * (0.96 - k * 0.1)
      rows.push(
        line(
          `lav` ? 0 : 0, y + k * 4,
          (Math.cos(ang) * len * -1).toFixed(1),
          (y + k * 4 - Math.sin(ang) * len).toFixed(1),
          { stroke: i % 3 === 0 ? '#b5b0a2' : '#d6d1c3', 'stroke-width': 0.7, opacity: (0.28 + t * 0.3).toFixed(2) },
        ),
      )
      rows.push(
        line(
          0, y - k * 4,
          (Math.cos(-ang) * len).toFixed(1),
          (y - k * 4 - Math.sin(-ang) * len).toFixed(1),
          { stroke: i % 3 === 0 ? '#b5b0a2' : '#d6d1c3', 'stroke-width': 0.7, opacity: (0.28 + t * 0.3).toFixed(2) },
        ),
      )
    }
  }
  P.push(...rows)
  // tip
  P.push(path('M 0 28 C 14 24, 22 16, 20 10 C 10 6, 4 12, 0 16 Z', { fill: '#d9d4c6', opacity: 0.8 }))
  // fluffy head
  for (let i = 0; i < 10; i++) {
    const t = i * 0.5
    P.push(path(`M ${Math.sin(t) * 26} ${46 + i * 6} C ${Math.sin(t) * 60} ${38 + i * 4}, ${Math.cos(t) * 40} ${30}, ${Math.sin(t) * 44} ${22}`, { stroke: '#cfcabe', 'stroke-width': 0.8, fill: 'none', opacity: 0.5 }))
  }
  return { defs: '', body: P.join('\n') }
}

// 14 — Minutiae / micro geometry
function motifMinutiae({ accent = '#b9c0cc' } = {}) {
  const P = []
  P.push(circle(-120, -70, 24, { fill: 'none', stroke: BONE, 'stroke-width': 1.4 }))
  P.push(circle(-120, -70, 4, { fill: BONE }))
  P.push(path('M -20 -20 A 26 26 0 0 1 26 -6', { fill: 'none', stroke: BONE, 'stroke-width': 1.6 }))
  P.push(line(-6, 22, 34, 34, { stroke: BONE, 'stroke-width': 1.6 }))
  P.push(polygon('-74 96 -44 148 -116 140', { fill: 'none', stroke: BONE, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }))
  P.push(circle(-74, 116, 2.2, { fill: accent }))
  P.push(circle(120, -120, 2, { fill: BONE, opacity: 0.7 }))
  P.push(circle(128, -150, 1.4, { fill: BONE, opacity: 0.5 }))
  P.push(circle(90, 140, 1.8, { fill: BONE, opacity: 0.6 }))
  return { defs: '', body: P.join('\n') }
}

// 15 — Rekindled / flame mandala with the one break
function motifFlame({ ember = '#b3541e' } = {}) {
  const P = []
  const flame = (scale, flip) => {
    const s = scale
    return path(
      `M ${0} ${-14 * s} C ${34 * s} ${-10 * s}, ${52 * s} ${30 * s}, ${20 * s} ${72 * s} C ${-2 * s} ${100 * s}, ${-10 * s} ${126 * s}, ${-4 * s} ${158 * s} C ${14 * s} ${118 * s}, ${10 * s} ${92 * s}, ${22 * s} ${70 * s} C ${38 * s} ${40 * s}, ${10 * s} ${4 * s}, ${0 * s} ${-14 * s} Z`,
      { fill: '#0b0d10', stroke: BONE, 'stroke-width': 1.6, transform: flip ? `scale(-1,1)` : '', 'stroke-linejoin': 'round' },
    )
  }
  const main = (ang, scale = 1) => P.push(`<g transform="rotate(${ang}) translate(0 -76)">${flame(scale, false)}</g>`)
  for (let i = 0; i < 8; i++) {
    if (i === 5) continue
    main((i / 8) * 360, i % 2 ? 0.9 : 1.06)
  }
  // the break — replaced by a fragment + dot
  P.push(`<g transform="rotate(225) translate(0 -40) scale(0.5)">${flame(1, false)}</g>`)
  P.push(circle(0, 0, 4, { fill: ember }))
  P.push(circle(-54.3, 71.4, 7, { fill: 'none', stroke: ember, 'stroke-width': 1.4 }))
  P.push(dotRing(252, 200, { size: 1.4, opacity: 0.5 }, 51))
  P.push(circle(0, 0, 232, { fill: 'none', stroke: BONE, 'stroke-width': 1.1, opacity: 0.7 }))
  P.push(circle(0, 0, 30, { fill: '#0b0d10', stroke: BONE, 'stroke-width': 1.6 }))
  P.push(circle(0, 0, 6, { fill: ember }))
  return { defs: '', body: P.join('\n') }
}

// 16 — Petrichor / waves and a bird
function motifWaves({ teal = '#2f6b68' } = {}) {
  const P = []
  const defs = `
    <mask id="wFade" maskUnits="userSpaceOnUse" x="-430" y="-400" width="860" height="800">
      <rect x="-430" y="-400" width="860" height="800" fill="#000"/>
      <linearGradient id="wfG" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#fff"/>
        <stop offset="18%" stop-color="#fff" stop-opacity="0"/>
        <stop offset="82%" stop-color="#fff" stop-opacity="0"/>
        <stop offset="100%" stop-color="#fff"/>
      </linearGradient>
      <rect x="-430" y="-400" width="860" height="800" fill="url(#wfG)"/>
    </mask>`
  for (let k = 0; k < 6; k++) {
    const y = -120 + k * 74
    const amp = 30 + (6 - k) * 9
    P.push(
      path(`M -460 ${y} C -330 ${y - amp}, -230 ${y + amp}, -100 ${y} C 20 ${y - amp}, 130 ${y + amp}, 260 ${y} C 380 ${y - amp}, 500 ${y + amp}, 620 ${y}`, {
        stroke: BONE, 'stroke-width': (2.1 - k * 0.24).toFixed(2), fill: 'none', opacity: (0.95 - k * 0.1).toFixed(2), 'stroke-linecap': 'round',
      }),
    )
  }
  P.push(circle(330, -170, 34, { fill: 'none', stroke: BONE, 'stroke-width': 1.1, opacity: 0.55 }))
  P.push(circle(330, -170, 6, { fill: BONE, opacity: 0.7 }))
  // bird carved between the waves
  P.push(
    path(`M -6 -40 C 40 -96, 96 -104, 140 -82 C 96 -72, 58 -50, 34 -20 C 20 -6, 6 -4, -6 -40 Z`, {
      fill: BONE, stroke: 'none',
    }),
  )
  P.push(
    path(`M -6 -40 C -40 -98, -92 -112, -142 -92 C -96 -80, -54 -56, -30 -22 C -16 -8, -4 -4, -6 -40 Z`, {
      fill: '#c9c5ba', stroke: 'none',
    }),
  )
  P.push(path('M -6 -40 L 6 2 L -6 34', { stroke: '#84847e', 'stroke-width': 1, fill: 'none', opacity: 0.6 }))
  P.push(dotRing(340, 90, { size: 1.2, opacity: 0.35 }, 71))
  return { defs, body: P.join('\n') }
}

// 17 — Vessel / geometric stag
function motifStag({ bone = '#e8e3d8' } = {}) {
  const P = []
  P.push(dotRing(296, 130, { size: 1.3, opacity: 0.4 }, 12))
  P.push(circle(0, 30, 300, { fill: 'none', stroke: 'rgba(232,227,216,0.25)', 'stroke-width': 1 }))
  // facet base
  const F0 = '#151519'
  const F1 = '#1b1b21'
  const F2 = '#23232a'
  // antlers
  const ant = (s, mainA) => {
    P.push(path(`M ${s * 30} -70 L ${s * 96} -210`, { stroke: bone, 'stroke-width': 3, fill: 'none' }))
    P.push(path(`M ${s * 58} -128 L ${s * 128} -170`, { stroke: bone, 'stroke-width': 2.4, fill: 'none' }))
    P.push(path(`M ${s * 96} -210 L ${s * 148} -268`, { stroke: bone, 'stroke-width': 2.2, fill: 'none' }))
    P.push(path(`M ${s * 96} -210 L ${s * 60} -268`, { stroke: bone, 'stroke-width': 2.2, fill: 'none' }))
    P.push(circle(s * 148, -268, 3, { fill: bone }))
    P.push(circle(s * 60, -268, 3, { fill: bone }))
  }
  ant(-1)
  ant(1)
  // ears
  P.push(polygon('-54 -62 -120 -108 -88 -20', { fill: F1, stroke: bone, 'stroke-width': 1.8 }))
  P.push(polygon('54 -62 120 -108 88 -20', { fill: F1, stroke: bone, 'stroke-width': 1.8 }))
  // face facets
  P.push(polygon('0 -140 -78 -64 0 -44', { fill: F0, stroke: bone, 'stroke-width': 1.6 }))
  P.push(polygon('0 -140 78 -64 0 -44', { fill: F1, stroke: bone, 'stroke-width': 1.6 }))
  P.push(polygon('-78 -64 -46 -4 -34 86 0 40 0 -44', { fill: F1, stroke: bone, 'stroke-width': 1.6 }))
  P.push(polygon('78 -64 46 -4 34 86 0 40 0 -44', { fill: F2, stroke: bone, 'stroke-width': 1.6 }))
  P.push(polygon('0 -44 0 40 -34 86 0 128', { fill: F2, stroke: bone, 'stroke-width': 1.6 }))
  P.push(polygon('0 -44 0 40 34 86 0 128', { fill: F1, stroke: bone, 'stroke-width': 1.6 }))
  // eyes as dark facets
  P.push(polygon('-40 -34 -60 -18 -44 6 -26 -10', { fill: '#060608', stroke: bone, 'stroke-width': 1.2 }))
  P.push(polygon('40 -34 60 -18 44 6 26 -10', { fill: '#060608', stroke: bone, 'stroke-width': 1.2 }))
  // muzzle
  P.push(polygon('-22 96 22 96 0 152', { fill: '#0c0d11', stroke: bone, 'stroke-width': 1.6 }))
  P.push(polygon('-22 96 0 128 22 96', { fill: '#0b0c10', stroke: bone, 'stroke-width': 1.2, opacity: 0.8 }))
  P.push(circle(0, 152, 8, { fill: '#060608', stroke: bone, 'stroke-width': 1.2 }))
  // neck
  P.push(path('M -34 100 L -96 190 L 96 190 L 34 100', { fill: '#17171c', stroke: bone, 'stroke-width': 1.8 }))
  P.push(line(-96, 190, -62, 168, { stroke: bone, 'stroke-width': 1, opacity: 0.5 }))
  P.push(line(96, 190, 62, 168, { stroke: bone, 'stroke-width': 1, opacity: 0.5 }))
  for (const t of [0, 0.5, 1]) {
    const [x1, y1] = polar(340, t * Math.PI)
    const [x2, y2] = polar(396, t * Math.PI)
    P.push(line(x1.toFixed(1), y1.toFixed(1), x2.toFixed(1), y2.toFixed(1), { stroke: bone, 'stroke-width': 0.8, opacity: 0.35 }))
  }
  return { defs: '', body: P.join('\n') }
}

// ---------------------------------------------------------------- portraits

function portrait({ hair = 'long', beard = false, accessory = 'glasses', accent = '#79b08c', seed = 3 } = {}) {
  const P = []
  const defs = `
    <linearGradient id="ptBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#16161a"/>
      <stop offset="100%" stop-color="#0a0a0c"/>
    </linearGradient>`
  // profile bust (facing left)
  P.push(
    path(
      'M 60 -240 C 150 -238, 190 -150, 172 -96 C 160 -60, 150 -52, 128 -58 L 108 -66 C 92 -76, 74 -70, 70 -56 C 66 -42, 52 -34, 40 -40 L 22 -48 C 8 -46, 0 -36, 2 -24 L -8 -12 C 6 -6, 18 -2, 10 8 C 4 16, 10 24, 24 30 C 40 38, 46 52, 38 70 C 32 86, 22 96, 6 104 L -16 116 C -40 128, -60 144, -72 168',
      { fill: 'none', stroke: BONE, 'stroke-width': 2.6, 'stroke-linecap': 'round' },
    ),
  )
  // shoulder line
  P.push(path('M -72 168 C -20 176, 70 186, 150 174 L 176 212 C 80 226, -40 216, -104 214 L -116 196 C -104 186, -90 176, -72 168 Z', {
    fill: '#121216', stroke: BONE, 'stroke-width': 2.2,
  }))
  if (hair === 'long') {
    P.push(path('M 60 -240 C 30 -250, -20 -240, -50 -210 C -84 -178, -96 -140, -92 -100 C -90 -80, -84 -60, -76 -44 C -88 -80, -92 -120, -84 -168 C -76 -212, -44 -244, 60 -240 Z', {
      fill: 'none', stroke: BONE, 'stroke-width': 1.6, opacity: 0.6,
    }))
    for (let i = 0; i < 6; i++) {
      P.push(path(`M 40 ${-228 + i * 8} C -16 ${-200 - i * 6}, -44 ${-140 - i * 4}, -40 ${-60}`, { stroke: 'rgba(232,227,216,0.4)', 'stroke-width': 0.9, fill: 'none', opacity: 0.5 }))
    }
  }
  if (beard) {
    P.push(path('M 38 30 C 18 52, -6 76, -26 96 C -36 68, -24 46, 2 26 C 10 18, 22 14, 34 16 C 40 20, 40 26, 38 30 Z', {
      fill: '#0d0e11', stroke: BONE, 'stroke-width': 1.2, opacity: 0.9,
    }))
  }
  if (accessory === 'glasses') {
    P.push(circle(-6, -64, 26, { fill: 'none', stroke: BONE, 'stroke-width': 1.4 }))
    P.push(line(20, -64, 40, -70, { stroke: BONE, 'stroke-width': 1.2 }))
  }
  if (accessory === 'bandana') {
    P.push(path('M -12 -132 C 26 -150, 82 -146, 120 -120 L 104 -96 C 66 -120, 12 -124, -16 -108 Z', { fill: '#6e5a1f', stroke: BONE, 'stroke-width': 1.8 }))
    P.push(path('M -16 -108 C -44 -94, -60 -78, -64 -58', { stroke: '#6e5a1f', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }))
  }
  if (accessory === 'bun') {
    P.push(circle(44, -236, 26, { fill: 'none', stroke: BONE, 'stroke-width': 1.8 }))
    P.push(circle(44, -236, 10, { fill: 'none', stroke: BONE, 'stroke-width': 1.2, opacity: 0.6 }))
  }
  P.push(circle(172, -300, 6, { fill: accent, opacity: 0.85 }))
  P.push(circle(192, -326, 3, { fill: accent, opacity: 0.55 }))
  P.push(circle(0, 176, 2, { fill: BONE, opacity: 0.5 }))
  P.push(circle(-60, -60, 1.6, { fill: BONE, opacity: 0.4 }))
  return artFrame({ defs, body: P.join('\n'), accent, seed, grainN: 120, glow: 340 })
}

// ---------------------------------------------------------------- hero

function heroArt() {
  const defs = `
    <radialGradient id="hEye" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#3c5672" stop-opacity="0.6"/><stop offset="100%" stop-color="#0a0b0e" stop-opacity="0"/></radialGradient>
    <linearGradient id="hBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8e3d8" stop-opacity="0.14"/><stop offset="100%" stop-color="#e8e3d8" stop-opacity="0"/></linearGradient>
    <linearGradient id="hBg" x1="0" y1="0" x2="1" y2="0.7"><stop offset="0%" stop-color="#121215"/><stop offset="55%" stop-color="#0b0b0e"/><stop offset="100%" stop-color="#09090b"/></linearGradient>
    <radialGradient id="hVig" cx="50%" cy="45%" r="72%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#040405" stop-opacity="0.95"/></radialGradient>`
  const P = []
  P.push(`<g transform="translate(1180 420) scale(1.28)"><rect x="-500" y="-420" width="1000" height="880" fill="url(#hEye)"/></g>`)
  const eye = motifEye({ iris: '#3f6b8f' })
  P.push(`<g transform="translate(1180 430) scale(1.22)">${eye.body}</g>`)
  P.push(`<rect x="620" y="-420" width="300" height="900" fill="url(#hBeam)" transform="skewX(-14)"/>`)
  // left: concentric arcs + particles
  for (const r of [150, 240, 330, 430, 520]) {
    P.push(circle(120, 300, r, { fill: 'none', stroke: 'rgba(232,227,216,0.28', 'stroke-width': 1 }))
    P.push(circle(120, 300, r + 8, { fill: 'none', stroke: 'rgba(232,227,216,0.1)', 'stroke-width': 0.6, 'stroke-dasharray': '2 10' }))
  }
  P.push(line(-60, 300, 300, 300, { stroke: 'rgba(232,227,216,0.5)', 'stroke-width': 1 }))
  const rnd = mulberry32(9)
  for (let i = 0; i < 46; i++) {
    const x = rnd() * 900
    const y = rnd() * 700 - 100
    P.push(circle(x.toFixed(1), y.toFixed(1), (0.5 + rnd() * 1.6).toFixed(2), { fill: '#e8e3d8', opacity: (0.15 + rnd() * 0.5).toFixed(2) }))
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-label="Oddaka Inksters hero artwork">
  <defs>${defs}</defs>
  <rect width="1600" height="900" fill="url(#hBg)"/>
  ${P.join('\n')}
  <rect width="1600" height="900" fill="url(#hVig)"/>
  <g opacity="0.9">${grain(260, 5, 1600, 900)}</g>
</svg>`
}

// ---------------------------------------------------------------- output

function writeSvg(rel, content) {
  const file = join(PUBLIC, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content, 'utf8')
}

const TATTOO_MOTIFS = {
  'tattoo-01': { fn: motifSerpent, accent: '#79b08c' },
  'tattoo-02': { fn: motifFox, accent: '#9aa7bd' },
  'tattoo-03': { fn: motifEye, accent: '#4f7a9e' },
  'tattoo-04': { fn: motifDaggerRose, accent: '#a33a32' },
  'tattoo-05': { fn: motifKoi, accent: '#c14b30' },
  'tattoo-06': { fn: motifOneLine, accent: '#79b08c' },
  'tattoo-08': { fn: motifLotus, accent: '#8a6aa8' },
  'tattoo-09': { fn: motifSkull, accent: '#b9bcc4' },
  'tattoo-10': { fn: motifFloral, accent: '#b58a98' },
  'tattoo-11': { fn: motifCompass, accent: '#b88a3e' },
  'tattoo-12': { fn: motifSwallow, accent: '#c08a2d' },
  'tattoo-13': { fn: motifFeather, accent: '#a9a294' },
  'tattoo-14': { fn: motifMinutiae, accent: '#b9c0cc' },
  'tattoo-15': { fn: motifFlame, accent: '#b3541e' },
  'tattoo-16': { fn: motifWaves, accent: '#2f6b68' },
  'tattoo-17': { fn: motifStag, accent: '#9b8238' },
}

function variantTransform(v) {
  // 01 full, 02 close crop, 03 offset/colder look
  if (v === 2) return { scale: 1.34, dx: 0, dy: 30, accent: null }
  if (v === 3) return { scale: 1.9, dx: -40, dy: -10, accent: null }
  return { scale: 1, dx: 0, dy: 0, accent: null }
}

function renderTattooTile(id, v) {
  const cfg = TATTOO_MOTIFS[id]
  if (!cfg) return
  const { fn, accent } = cfg
  const { scale, dx, dy, accent: altAccent } = variantTransform(v)
  const art = fn({ accent: altAccent || accent })
  const transform = `translate(${-(scale - 1) * 425}, ${-(scale - 1) * 500 + (dy || 0)}) scale(${scale})`
  const body = `
    <g transform="translate(${dx || 0} 0)"><g transform="${transform}">
    ${art.body}
    </g></g>`
  const svg = artFrame({
    defs: art.defs,
    body,
    accent: altAccent || accent,
    seed: 11 + id.split('-')[1] * 7 + v,
  })
  writeSvg(`tattoos/${id}/${v === 1 ? '01' : v === 2 ? '02' : '03'}.svg`, svg)
}

// ---------------------------------------------------------------- videos

function frameSvg(inner) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200">
  <defs>
    <radialGradient id="vBg" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="#151519"/><stop offset="100%" stop-color="#08080a"/></radialGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#vBg)"/>
  <g transform="translate(600 600)">${inner}</g>
</svg>`
}

function renderFrames(makeSvg, frames, scale = 1200) {
  const dir = TMP
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  for (let i = 0; i < frames; i++) {
    const t = i / frames
    const svg = makeSvg(t)
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: scale } })
    const png = resvg.render().asPng()
    writeFileSync(join(dir, `frame-${String(i).padStart(3, '0')}.png`), png)
  }
}

function encodeVideo(out, fps = 24) {
  mkdirSync(dirname(out), { recursive: true })
  const frames = readdirSync(TMP).filter((f) => f.startsWith('frame-')).sort()
  const first = join(TMP, frames[0])
  const args = [
    '-y',
    '-framerate', String(fps),
    '-i', first.replace(/frame-\d+\.png/, 'frame-%03d.png'),
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    out,
  ]
  const res = spawnSync(ffmpeg, args, { encoding: 'utf8' })
  if (res.status !== 0) {
    console.error('ffmpeg failed:', res.stderr || 'unknown error')
    process.exitCode = 1
  }
}

function videoSerpent(rot) {
  const ring = motifSerpent({ accent: '#79b08c' })
  const r = rot * Math.PI * 2
  return frameSvg(
    `<g transform="rotate(${rot * 360})">${ring.body}</g>` +
    `<g opacity="${0.75 + 0.25 * Math.sin(rot * Math.PI * 2)}"><circle r="432" fill="none" stroke="#79b08c" stroke-width="1" opacity="0.5"/><circle r="416" fill="none" stroke="rgba(232,227,216,0.4)" stroke-width="0.7" stroke-dasharray="2 9"/></g>`,
  )
}

function videoKoi(rot) {
  const koi = motifKoi({ red: '#c14b30', teal: '#3f7a76' })
  const drift = (Math.sin(rot * Math.PI * 2) * 26).toFixed(1)
  return frameSvg(
    `<g transform="translate(${drift} 0) scale(1.18)">${koi.body}</g>` +
    `<g opacity="${(0.7 + 0.3 * Math.sin(rot * Math.PI * 2 + 1)).toFixed(2)}"><circle r="470" fill="none" stroke="#3f7a76" stroke-width="1" opacity="0.3"/></g>`,
  )
}

// ---------------------------------------------------------------- run

console.log('Generating tattoo tiles...')
for (const [id] of Object.entries(TATTOO_MOTIFS)) {
  for (const v of [1, 2, 3]) renderTattooTile(id, v)
}

// cover-up special: before + after + detail variants
const covBefore = motifCoverBefore()
writeSvg('tattoos/tattoo-07/01-before.svg', artFrame({ defs: covBefore.defs, body: covBefore.body, accent: '#7c4a2d', seed: 23 }))
const covAfter = motifCoverAfter()
writeSvg('tattoos/tattoo-07/01.svg', artFrame({ defs: covAfter.defs, body: covAfter.body, accent: '#4a5f88', seed: 33 }))
writeSvg('tattoos/tattoo-07/02.svg', artFrame({ defs: covAfter.defs, body: `<g transform="translate(0 40) scale(1.3)">${covAfter.body}</g>`, accent: '#4a5f88', seed: 34 }))
writeSvg('tattoos/tattoo-07/03.svg', artFrame({ defs: covAfter.defs, body: `<g transform="translate(-60 0) scale(1.8)">${covAfter.body}</g>`, accent: '#4a5f88', seed: 35 }))

console.log('Generating artists...')
const portraits = {
  'arjun': { hair: 'short', beard: true, accessory: 'glasses', accent: '#9aa7bd' },
  'meera': { hair: 'long', beard: false, accessory: 'bun', accent: '#79b08c' },
  'sid': { hair: 'long', beard: true, accessory: 'bandana', accent: '#c08a2d' },
  'rhea': { hair: 'long', beard: false, accessory: 'none', accent: '#b3541e' },
}
for (const [name, opts] of Object.entries(portraits)) {
  writeSvg(`artists/${name}.svg`, portrait(opts))
}

console.log('Generating hero + favicon...')
writeSvg('hero.svg', heroArt())
writeSvg('favicon.svg', `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0a0a0b"/>
  <circle cx="32" cy="32" r="21" fill="none" stroke="#e8e3d8" stroke-width="3" stroke-dasharray="3 4"/>
  <circle cx="32" cy="32" r="3.4" fill="#e8e3d8"/>
  <circle cx="11" cy="32" r="2" fill="#79b08c"/>
  <circle cx="53" cy="32" r="2" fill="#b3541e"/>
</svg>`)

console.log('Rendering videos...')
const videoDefs = [
  { out: join(PUBLIC, 'videos', 'tattoo-01.mp4'), make: videoSerpent, frames: 36 },
  { out: join(PUBLIC, 'videos', 'tattoo-05.mp4'), make: videoKoi, frames: 36 },
]
for (const v of videoDefs) {
  console.log(`  encoding ${v.out.split(/[\\/]/).pop()}...`)
  renderFrames(v.make, v.frames)
  encodeVideo(v.out)
}
rmSync(TMP, { recursive: true, force: true })

console.log('Done.')