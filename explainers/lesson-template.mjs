/**
 * Builds a HyperFrames composition (one static HTML file) for any lesson or
 * drill, from content. Used by build.mjs for every item that has no bespoke
 * composition. All layout and timing is decided here, in Node, so the
 * composition is plain static HTML plus one paused GSAP timeline.
 *
 * Scenes: title → text sections → animated diagram → numbered list(s) → close.
 * Reading time drives every scene's length.
 */

// ---------------------------------------------------------------------------
// Palette (locked — mirrors src/theme)
// ---------------------------------------------------------------------------
const C = {
  bg: '#0b0e14', surface: '#131a24', raised: '#1b2432', border: '#232c3a',
  accent: '#c2687a', on: '#0b0e14', text: '#e9ecf2', text2: '#9aa5b5',
  grass: '#0f141c', line: '#3a4558',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** `[[term|shown]]` → shown */
export const plain = (s) => String(s).replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, '$1');
const words = (s) => plain(s).split(/\s+/).filter(Boolean).length;
/** Seconds a beginner needs to read this, plus breathing room. */
const readTime = (text, min = 4, max = 13) => Math.min(max, Math.max(min, 1.6 + words(text) / 2.4));

// ---------------------------------------------------------------------------
// Diagram → timeline (port of src/components/explainer/timeline.ts)
// ---------------------------------------------------------------------------
const MOVABLE = ['player', 'opponent', 'keeper', 'ball'];
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function buildTimeline(data) {
  const markers = data.markers ?? [];
  const paths = data.paths ?? [];
  const movable = markers.filter((m) => MOVABLE.includes(m.kind));
  const balls = movable.filter((m) => m.kind === 'ball').map((m) => m.id);
  const people = movable.filter((m) => m.kind !== 'ball').map((m) => m.id);
  const pos = new Map(movable.map((m) => [m.id, { x: m.x, y: m.y }]));
  const keys = new Map(movable.map((m) => [m.id, []]));
  const nearest = (ids, to) => {
    let best; let d = Infinity;
    for (const id of ids) { const p = pos.get(id); if (p && dist(p, to) < d) { d = dist(p, to); best = id; } }
    return best;
  };
  const raw = paths.map((p, i) => ({ p, g: p.at ?? i }));
  const order = [...new Set(raw.map((r) => r.g))].sort((a, b) => a - b);
  const groups = order.map((g) => raw.filter((r) => r.g === g).map((r) => r.p));
  const strokes = [];
  groups.forEach((group, g) => {
    const updates = []; const claimed = new Set();
    const resolve = (v) => (typeof v === 'string' ? pos.get(v) ?? markers.find((m) => m.id === v) ?? { x: 50, y: 32 } : v);
    for (const path of group) {
      const a = resolve(path.from); const b = resolve(path.to);
      strokes.push({ g, kind: path.kind, a: { ...a }, b: { ...b } });
      const move = (id, target) => {
        if (!id || claimed.has(id)) return; claimed.add(id);
        const from = pos.get(id); if (!from) return;
        keys.get(id).push({ g, from: { ...from }, to: { ...target } }); updates.push([id, target]);
      };
      if (path.actor === null) { /* drawn only */ }
      else if (path.kind === 'pass' || path.kind === 'shot') move(path.actor ?? nearest(balls, a), b);
      else {
        move(path.actor ?? (typeof path.from === 'string' ? path.from : nearest(people, a)), b);
        if (path.kind === 'dribble') {
          const len = dist(a, b) || 1;
          move(nearest(balls, a), { x: b.x + ((b.x - a.x) / len) * 3, y: b.y + ((b.y - a.y) / len) * 3 });
        }
      }
    }
    for (const [id, p] of updates) pos.set(id, p);
  });
  return { markers, keys, strokes, steps: groups.length };
}

const PITCH = {
  full: `<rect x="3" y="3" width="94" height="59"/><line x1="50" y1="3" x2="50" y2="62"/><circle cx="50" cy="32.5" r="9"/>
    <rect x="3" y="17" width="14" height="31"/><rect x="83" y="17" width="14" height="31"/><rect x="3" y="25" width="5" height="15"/><rect x="92" y="25" width="5" height="15"/>`,
  half: `<rect x="3" y="3" width="94" height="59"/><rect x="3" y="15" width="18" height="35"/><rect x="3" y="24" width="7" height="17"/>`,
  'penalty-area': `<rect x="3" y="3" width="94" height="59"/><rect x="18" y="3" width="64" height="34"/><rect x="35" y="3" width="30" height="15"/><circle cx="50" cy="28" r="1.2" fill="${C.line}"/>`,
  'goal-area': `<rect x="30" y="3" width="40" height="4" stroke-width="1.6"/><line x1="3" y1="7" x2="97" y2="7"/><rect x="22" y="7" width="56" height="33"/><rect x="36" y="7" width="28" height="14"/>`,
  blank: '',
};

const STROKE = {
  pass: { c: C.text, dash: '2.6 2', w: 0.8 },
  dribble: { c: C.text, dash: '1.2 1.3', w: 0.8 },
  run: { c: C.accent, dash: '', w: 0.9 },
  shot: { c: C.accent, dash: '', w: 1.3 },
};

function diagramSvg(d, L, pickT) {
  const tl = buildTimeline(d);
  let zones = '';
  (d.zones ?? []).forEach((z, i) => {
    if (z.kind === 'wall') {
      let hatch = '';
      for (let x = z.x - z.h; x < z.x + z.w; x += 1.6) hatch += `<line x1="${x}" y1="${z.y + z.h}" x2="${x + z.h}" y2="${z.y}" stroke="${C.text2}" stroke-width="0.35"/>`;
      zones += `<defs><clipPath id="wz${i}"><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}"/></clipPath></defs><g clip-path="url(#wz${i})">${hatch}</g><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" fill="none" stroke="${C.text2}" stroke-width="0.6"/>`;
    } else {
      zones += `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" fill="${C.accent}" fill-opacity="${z.kind === 'danger' ? 0.22 : 0.16}" stroke="${C.accent}" stroke-width="0.7" ${z.kind === 'space' ? 'stroke-dasharray="2 1.6"' : ''}/>`;
    }
  });
  const lines = (d.lines ?? []).map((l) => `<line x1="${l.x}" y1="3" x2="${l.x}" y2="62" stroke="${C.accent}" stroke-width="0.9" stroke-dasharray="3 2.4"/>${l.label ? `<text x="${l.x + 2}" y="8" font-size="3" fill="${C.accent}" font-family="Helvetica Neue, sans-serif">${esc(pickT(l.label))}</text>` : ''}`).join('');
  const fixtures = tl.markers.filter((m) => !MOVABLE.includes(m.kind)).map((m) => m.kind === 'cone'
    ? `<polygon points="${m.x},${m.y - 3} ${m.x - 2.4},${m.y + 2} ${m.x + 2.4},${m.y + 2}" fill="${C.text2}"/>`
    : `<circle cx="${m.x}" cy="${m.y}" r="3.4" fill="none" stroke="${C.accent}" stroke-width="0.8"/>`).join('');
  const strokes = tl.strokes.map((s, i) => {
    const st = STROKE[s.kind];
    const ang = Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x); const h = s.kind === 'shot' ? 3.2 : 2.6;
    const p1 = `${s.b.x - h * Math.cos(ang - 0.42)},${s.b.y - h * Math.sin(ang - 0.42)}`;
    const p2 = `${s.b.x - h * Math.cos(ang + 0.42)},${s.b.y - h * Math.sin(ang + 0.42)}`;
    return `<line id="st${i}" x1="${s.a.x}" y1="${s.a.y}" x2="${s.a.x}" y2="${s.a.y}" stroke="${st.c}" stroke-width="${st.w}" ${st.dash ? `stroke-dasharray="${st.dash}"` : ''} stroke-linecap="round" opacity="0"/>
      <polygon id="ah${i}" points="${s.b.x},${s.b.y} ${p1} ${p2}" fill="${st.c}" opacity="0"/>`;
  }).join('');
  const movers = tl.markers.filter((m) => MOVABLE.includes(m.kind));
  movers.sort((a, b) => Number(a.kind === 'ball') - Number(b.kind === 'ball'));
  const actors = movers.map((m) => {
    if (m.kind === 'ball') return `<circle id="mk-${m.id}" cx="${m.x}" cy="${m.y}" r="1.9" fill="${C.text}" stroke="${C.grass}" stroke-width="0.5"/>`;
    const fill = m.kind === 'keeper' ? C.text : m.kind === 'opponent' ? C.grass : C.accent;
    const stroke = m.kind === 'opponent' ? C.text2 : fill;
    const label = m.label ? `<text id="lb-${m.id}" x="${m.x}" y="${m.y + 1.2}" font-size="3.2" text-anchor="middle" font-weight="700" fill="${C.on}" font-family="Helvetica Neue, sans-serif">${esc(m.label)}</text>` : '';
    return `<circle id="mk-${m.id}" cx="${m.x}" cy="${m.y}" r="3.6" fill="${fill}" stroke="${stroke}" stroke-width="0.8"/>${label}`;
  }).join('');
  const svg = `<svg viewBox="0 0 100 65" class="pitch"><rect x="0" y="0" width="100" height="65" rx="1.5" fill="${C.grass}"/>
    <g fill="none" stroke="${C.line}" stroke-width="0.6">${PITCH[d.view] ?? ''}</g>${zones}${lines}${fixtures}${strokes}${actors}</svg>`;
  return { svg, tl, movers };
}

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------
const STEP = 2.8;   // seconds per diagram step
const MOVE = 1.6;   // of which moving

/**
 * @param {object} p
 *   p.lang, p.kicker, p.title, p.subtitle,
 *   p.sections: [{ heading?, paras: string[] }],
 *   p.diagram?: { data, label, caption, beats: string[], stepWord },
 *   p.lists: [{ heading, items: string[], mark: 'n' | 'check' }],
 *   p.close: { line?: string, source?: string }
 */
export function compose(p) {
  const pickT = (o) => (o ? o[p.lang] || o.az : '');
  const scenes = [];
  let t = 0;
  const add = (kind, dur, html, extra = {}) => { scenes.push({ kind, start: t, dur, html, ...extra }); t += dur; };

  // 1 — title
  add('title', 4, `<div class="title-inner"><div class="t-title">${esc(p.title)}</div><div class="t-rule"></div>${p.subtitle ? `<div class="t-sub">${esc(p.subtitle)}</div>` : ''}</div>`, { has: { sub: !!p.subtitle } });

  // 2 — text sections (long ones split so every frame stays readable)
  for (const s of p.sections) {
    const chunks = []; let cur = [];
    for (const para of s.paras) {
      const len = cur.reduce((n, x) => n + plain(x).length, 0);
      if (cur.length && len + plain(para).length > 360) { chunks.push(cur); cur = []; }
      cur.push(para);
    }
    if (cur.length) chunks.push(cur);
    chunks.forEach((paras, ci) => {
      const text = paras.map(plain).join(' ');
      const big = text.length < 230;
      add('text', readTime((s.heading ?? '') + ' ' + text), `<div class="text-inner">
        ${s.heading ? `<div class="h">${esc(s.heading)}${chunks.length > 1 ? `<span class="cont"> ${ci + 1}/${chunks.length}</span>` : ''}</div>` : ''}
        ${paras.map((x) => `<p class="${big ? 'big' : ''}">${esc(plain(x))}</p>`).join('')}</div>`, { has: { h: !!s.heading } });
    });
  }

  // 3 — animated diagram
  let diagram = null;
  if (p.diagram) {
    const { svg, tl, movers } = diagramSvg(p.diagram.data, p.lang, pickT);
    const steps = Math.max(1, tl.steps);
    const dur = 1.4 + steps * STEP + 1.6;
    const beats = p.diagram.beats.length ? p.diagram.beats : [p.diagram.caption];
    add('diagram', dur, `<div class="dg-wrap"><div class="dg-svg">${svg}</div>
      <div class="dg-side"><div class="dg-label">${esc(p.diagram.label)}</div>
        <div class="dg-beats">${beats.map((b, i) => `<div class="beat" id="beat${i}"><span class="bn">${i + 1}/${beats.length}</span><span class="bt">${esc(b)}</span></div>`).join('')}</div>
        ${p.diagram.caption ? `<div class="dg-cap" id="dgcap">${esc(p.diagram.caption)}</div>` : ''}</div></div>`,
    { tl, movers, steps, beats: beats.length, has: { cap: !!p.diagram.caption } });
    diagram = scenes[scenes.length - 1];
  }

  // 4 — lists
  for (const list of p.lists) {
    if (!list.items.length) continue;
    const text = list.items.map(plain).join(' ');
    const dur = Math.max(5, 1.4 + list.items.length * 0.9 + words(text) / 2.4);
    add('list', dur, `<div class="list-inner"><div class="h">${esc(list.heading)}</div>
      ${list.items.map((x, i) => `<div class="li"><span class="mk">${list.mark === 'check' ? '✓' : i + 1}</span><span class="lt">${esc(plain(x))}</span></div>`).join('')}</div>`,
    { count: list.items.length });
  }

  // 5 — close
  add('close', 4.2, `<div class="close-inner">${p.close.line ? `<blockquote>${esc(plain(p.close.line))}</blockquote>` : ''}
    ${p.close.source ? `<div class="src">${esc(p.close.source)}</div>` : ''}<div class="brand-big">VERVE</div></div>`,
  { has: { line: !!p.close.line, src: !!p.close.source } });

  const D = Math.round((t + 0.2) * 100) / 100;

  // ---- timeline ops, computed here so the page script is tiny ------------
  const ops = [];
  const o = (sel, at, dur, from, to) => ops.push({ sel, at: +at.toFixed(3), dur, from, to });
  ops.push({ sel: '#progress', at: 0, dur: D - 0.2, from: { scaleX: 0 }, to: { scaleX: 1, ease: 'none' } });
  o('#topbar', 0.1, 0.6, { opacity: 0, y: -16 }, { opacity: 1, y: 0, ease: 'power3.out' });
  scenes.forEach((s, i) => {
    const sel = `#sc${i}`;
    const inner = `${sel} > div`;
    const end = s.start + s.dur;
    if (s.kind === 'title') {
      o(`${sel} .t-title`, s.start + 0.3, 0.8, { opacity: 0, y: 60 }, { opacity: 1, y: 0, ease: 'expo.out' });
      o(`${sel} .t-rule`, s.start + 0.75, 0.6, { scaleX: 0 }, { scaleX: 1, ease: 'power3.inOut' });
      if (s.has.sub) o(`${sel} .t-sub`, s.start + 1.0, 0.6, { opacity: 0, x: -30 }, { opacity: 1, x: 0, ease: 'power2.out' });
    } else if (s.kind === 'text') {
      if (s.has.h) o(`${sel} .h`, s.start + 0.15, 0.6, { opacity: 0, x: -40 }, { opacity: 1, x: 0, ease: 'power3.out' });
      o(`${sel} p`, s.start + 0.35, 0.7, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: 'power2.out', stagger: 0.25 });
    } else if (s.kind === 'list') {
      o(`${sel} .h`, s.start + 0.15, 0.6, { opacity: 0, x: -40 }, { opacity: 1, x: 0, ease: 'power3.out' });
      o(`${sel} .li`, s.start + 0.5, 0.55, { opacity: 0, x: 50 }, { opacity: 1, x: 0, ease: 'power3.out', stagger: 0.9 });
    } else if (s.kind === 'close') {
      if (s.has.line) o(`${sel} blockquote`, s.start + 0.3, 0.8, { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'expo.out' });
      if (s.has.src) o(`${sel} .src`, s.start + 0.9, 0.6, { opacity: 0 }, { opacity: 1 });
      o(`${sel} .brand-big`, s.start + 1.2, 0.7, { opacity: 0, letterSpacing: '0.2em' }, { opacity: 1, letterSpacing: '0.5em', ease: 'power2.out' });
    } else if (s.kind === 'diagram') {
      const base = s.start + 1.4;
      o(`${sel} .dg-svg`, s.start + 0.2, 0.7, { opacity: 0, x: -40 }, { opacity: 1, x: 0, ease: 'power3.out' });
      o(`${sel} .dg-label`, s.start + 0.3, 0.5, { opacity: 0 }, { opacity: 1 });
      // actors
      for (const m of s.movers) {
        for (const k of s.tl.keys.get(m.id)) {
          const at = base + k.g * STEP;
          o(`#mk-${m.id}`, at, MOVE, { attr: { cx: k.from.x, cy: k.from.y } }, { attr: { cx: k.to.x, cy: k.to.y }, ease: 'power2.inOut' });
          if (m.label) o(`#lb-${m.id}`, at, MOVE, { attr: { x: k.from.x, y: k.from.y + 1.2 } }, { attr: { x: k.to.x, y: k.to.y + 1.2 }, ease: 'power2.inOut' });
        }
      }
      // strokes
      s.tl.strokes.forEach((st, i) => {
        const at = base + st.g * STEP;
        o(`#st${i}`, at, MOVE, { opacity: 0, attr: { x2: st.a.x, y2: st.a.y } }, { opacity: 1, attr: { x2: st.b.x, y2: st.b.y }, ease: 'power2.inOut' });
        o(`#ah${i}`, at + MOVE - 0.05, 0.2, { opacity: 0 }, { opacity: 1 });
        o(`#st${i}`, at + STEP, 0.4, { opacity: 1 }, { opacity: 0.45 });
        o(`#ah${i}`, at + STEP, 0.4, { opacity: 1 }, { opacity: 0.45 });
      });
      // beat captions
      for (let i = 0; i < s.beats; i++) {
        const at = base + i * STEP;
        o(`#beat${i}`, at - 0.1, 0.45, { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: 'power3.out' });
        if (i < s.beats - 1) o(`#beat${i}`, at + STEP - 0.3, 0.3, { opacity: 1 }, { opacity: 0.3 });
      }
      if (s.has.cap) o(`${sel} .dg-cap`, base + s.steps * STEP, 0.6, { opacity: 0 }, { opacity: 1 });
    }
    // every scene but the last fades out
    if (i < scenes.length - 1) o(inner, end - 0.4, 0.35, { opacity: 1 }, { opacity: 0, ease: 'power2.in' });
  });

  const sections = scenes.map((s, i) => `<section id="sc${i}" class="clip sc-${s.kind}" data-start="${s.start.toFixed(2)}" data-duration="${s.dur.toFixed(2)}" data-track-index="${i + 1}">${s.html}</section>`).join('\n');

  const html = `<!doctype html>
<html lang="${p.lang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
@font-face { font-family: "Georgia"; src: local("Georgia"); }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1920px; height: 1080px; overflow: hidden; background: ${C.bg}; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden; background: ${C.bg}; color: ${C.text}; font-family: "Helvetica Neue", sans-serif; }
section.clip { position: absolute; inset: 0; }
#ghost { position: absolute; right: -260px; bottom: -300px; width: 980px; height: 980px; }
#ghost svg { width: 100%; height: 100%; display: block; }
#topbar { position: absolute; left: 140px; right: 140px; top: 64px; height: 64px; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid ${C.border}; padding-bottom: 18px; }
.brand { display: flex; align-items: center; gap: 22px; }
.brand svg { width: 48px; height: 48px; display: block; }
.kicker { font-size: 24px; font-weight: 700; letter-spacing: 0.2em; color: ${C.accent}; }
.wordmark { font-size: 22px; font-weight: 700; letter-spacing: 0.42em; color: ${C.text2}; }
#progress-track { position: absolute; left: 140px; right: 140px; bottom: 70px; height: 4px; background: ${C.raised}; }
#progress { width: 100%; height: 100%; background: ${C.accent}; transform-origin: left center; }
.sc-title { display: flex; align-items: center; padding: 0 140px; }
.title-inner { width: 1500px; }
.t-title { font-family: Georgia, serif; font-size: 150px; line-height: 1.05; letter-spacing: -0.03em; }
.t-rule { width: 140px; height: 6px; background: ${C.accent}; margin: 44px 0 38px; transform-origin: left center; }
.t-sub { font-size: 46px; line-height: 1.35; color: ${C.text2}; max-width: 1300px; }
.sc-text, .sc-list { display: flex; align-items: center; padding: 170px 140px 120px; }
.text-inner, .list-inner { width: 1560px; }
.h { font-family: Georgia, serif; font-size: 76px; line-height: 1.12; letter-spacing: -0.02em; margin-bottom: 44px; color: ${C.text}; }
.cont { font-style: italic; font-size: 40px; color: ${C.accent}; }
.sc-text p { font-size: 42px; line-height: 1.45; color: ${C.text}; margin-bottom: 26px; max-width: 1560px; }
.sc-text p.big { font-size: 52px; line-height: 1.4; }
.li { display: flex; gap: 36px; align-items: baseline; padding: 26px 0; border-top: 2px solid ${C.border}; }
.mk { font-family: Georgia, serif; font-size: 66px; line-height: 0.9; color: ${C.accent}; width: 64px; flex: none; }
.lt { font-size: 44px; line-height: 1.32; color: ${C.text}; }
.sc-diagram { padding: 170px 140px 110px; }
.dg-wrap { display: flex; gap: 70px; align-items: center; height: 100%; }
.dg-svg { width: 1060px; height: 689px; flex: none; }
.dg-svg svg { width: 1060px; height: 689px; display: block; }
.dg-side { flex: 1; display: flex; flex-direction: column; gap: 30px; }
.dg-label { font-family: Georgia, serif; font-style: italic; font-size: 36px; color: ${C.text2}; }
.dg-beats { display: flex; flex-direction: column; gap: 22px; }
.beat { display: flex; gap: 22px; align-items: baseline; opacity: 0; }
.bn { font-family: Georgia, serif; font-style: italic; font-size: 30px; color: ${C.accent}; flex: none; }
.bt { font-size: 34px; line-height: 1.32; color: ${C.text}; }
.dg-cap { font-family: Georgia, serif; font-size: 34px; line-height: 1.3; color: ${C.accent}; padding-top: 24px; border-top: 2px solid ${C.border}; opacity: 0; }
.sc-close { display: flex; align-items: center; padding: 0 140px; }
.close-inner { width: 1560px; }
blockquote { font-family: Georgia, serif; font-size: 70px; line-height: 1.24; letter-spacing: -0.015em; padding-left: 52px; border-left: 6px solid ${C.accent}; max-width: 1500px; }
.src { margin-top: 48px; font-size: 30px; font-style: italic; color: ${C.text2}; }
.brand-big { margin-top: 64px; font-size: 34px; font-weight: 700; letter-spacing: 0.5em; color: ${C.accent}; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${D}" data-width="1920" data-height="1080" data-fps="30">
  <div id="frame" style="position:absolute;inset:0">
    <div id="ghost" data-layout-ignore aria-hidden="true"><svg viewBox="0 0 980 980">
      <circle cx="490" cy="490" r="300" fill="none" stroke="${C.raised}" stroke-width="6"/>
      <circle cx="490" cy="490" r="470" fill="none" stroke="${C.surface}" stroke-width="6"/>
      <line x1="0" y1="490" x2="980" y2="490" stroke="${C.surface}" stroke-width="6"/></svg></div>
    <div id="topbar">
      <div class="brand">
        <svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="18,18 37,18 50,56 63,18 82,18 50,82" fill="${C.accent}"/></svg>
        <span class="kicker">${esc(p.kicker)}</span>
      </div>
      <span class="wordmark">VERVE</span>
    </div>
    <div id="progress-track"><div id="progress"></div></div>
  </div>
${sections}
</div>
<script>
  const OPS = ${JSON.stringify(ops)};
  const tl = gsap.timeline({ paused: true });
  // Only the first tween on an element may render its start state up front;
  // later ones wait for the playhead, or they would flash early on seek.
  const seen = new Set();
  for (const op of OPS) {
    const first = !seen.has(op.sel); seen.add(op.sel);
    tl.fromTo(op.sel, op.from, Object.assign({ duration: op.dur, immediateRender: first }, op.to), op.at);
  }
  tl.fromTo('#ghost', { rotation: -8 }, { rotation: 6, duration: ${D}, ease: 'none' }, 0);
  window.__timelines['main'] = tl;
</script>
</body>
</html>
`;
  return { html, duration: D };
}
