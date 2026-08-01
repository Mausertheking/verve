/**
 * Regenerates every Verve brand asset from the geometry defined here.
 *
 * The mark is pure geometry — there is no source file in a design tool and no
 * raster master. Change a number here and every icon, every size, regenerates
 * identically.
 *
 * Requires @resvg/resvg-js, which is NOT a project dependency (it would be
 * dead weight in the app bundle). Install it only when regenerating:
 *
 *   npm i -D @resvg/resvg-js && node scripts/build-brand.mjs
 */
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BRAND = join(ROOT, 'assets', 'brand');
const ASSETS = join(ROOT, 'assets');

// ---------------------------------------------------------------------------
// Palette — must match src/theme. Kept literal so this script has no imports.
// ---------------------------------------------------------------------------
const BG = '#0B0E14';
const ACCENT = '#C2687A';
const TEXT_SECONDARY = '#9AA5B5';

/**
 * The hatch lines are #0B0E14 at 55% over #C2687A. That blend is precomputed to
 * a solid colour so nothing depends on alpha compositing — some Android icon
 * pipelines flatten transparency unpredictably.
 */
const HATCH = '#5D3742';

// ---------------------------------------------------------------------------
// Geometry, in a 100x100 space
// ---------------------------------------------------------------------------

/** The V. Tapered, mitred, optically centred. */
const V_FULL = '18,18 37,18 50,56 63,18 82,18 50,82';

/**
 * Android adaptive icons crop to a circle of 66% diameter, and the outer 25%
 * of each edge can be masked away entirely. The full V's top corners sit at 45
 * units from centre — well outside that. This variant is scaled to 0.72 so the
 * corners land inside the safe circle.
 */
const V_SAFE = '27,27 40.6,27 50,54.3 59.4,27 73,27 50,73';

/**
 * Hatch density. 8/1.4 is deliberate: at 6/2.2 the lines read as bold stripes
 * and fight the letterform, at 10/1.2 they read as separate marks rather than
 * texture. This is the density that still reads as grain at 48px.
 */
const HATCH_SPACING = 8;
const HATCH_WIDTH = 1.4;

const hatchDefs = (id) => `
    <pattern id="hatch-${id}" width="${HATCH_SPACING}" height="${HATCH_SPACING}"
             patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
      <line x1="0" y1="0" x2="0" y2="${HATCH_SPACING}"
            stroke="${HATCH}" stroke-width="${HATCH_WIDTH}"/>
    </pattern>`;

/** The mark: an accent V filled with a diagonal hatch. Transparent background. */
const mark = (id, points = V_FULL) => `
  <defs>${hatchDefs(id)}
    <clipPath id="clip-${id}"><polygon points="${points}"/></clipPath>
  </defs>
  <g clip-path="url(#clip-${id})">
    <polygon points="${points}" fill="${ACCENT}"/>
    <rect x="0" y="0" width="100" height="100" fill="url(#hatch-${id})"/>
  </g>`;

const svg = (w, h, body, vb = `0 0 ${w} ${h}`) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}">${body}\n</svg>\n`;

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------
const sources = {
  // Full-bleed app icon. iOS applies its own rounding, so no corner radius here.
  'verve-icon.svg': svg(1024, 1024,
    `<rect width="100" height="100" fill="${BG}"/>${mark('icon')}`, '0 0 100 100'),

  // Mark alone — for in-app use, headers, the About screen.
  'verve-mark.svg': svg(512, 512, mark('mark'), '0 0 100 100'),

  // Android adaptive foreground: transparent, safe-zone geometry.
  'verve-adaptive-foreground.svg': svg(1024, 1024,
    mark('adaptive', V_SAFE), '0 0 100 100'),

  /**
   * Lockup D — stacked, for the splash screen. Box is trimmed tight to the
   * artwork: Expo scales the splash image with resizeMode 'contain', so slack
   * margins here become unpredictable whitespace on device.
   *
   * text-anchor 'middle' at x=320 (true centre) — resvg does not add trailing
   * letter-spacing after the final glyph, so no optical offset is needed.
   */
  'verve-lockup-stacked.svg': svg(640, 292,
    `<g transform="translate(220 0) scale(2)">${mark('lockup')}</g>
     <text x="320" y="260" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial"
           font-weight="500" font-size="62" letter-spacing="18"
           fill="${TEXT_SECONDARY}">VERVE</text>`),
};

// ---------------------------------------------------------------------------
// PNG exports Expo needs
// ---------------------------------------------------------------------------
const exports_ = [
  { src: 'verve-icon.svg', out: join(ASSETS, 'icon.png'), width: 1024 },
  { src: 'verve-adaptive-foreground.svg', out: join(ASSETS, 'adaptive-icon.png'), width: 1024 },
  { src: 'verve-lockup-stacked.svg', out: join(ASSETS, 'splash-icon.png'), width: 1280 },
  { src: 'verve-icon.svg', out: join(ASSETS, 'favicon.png'), width: 48 },
];

mkdirSync(BRAND, { recursive: true });

for (const [name, content] of Object.entries(sources)) {
  writeFileSync(join(BRAND, name), content);
  console.log('svg  ', name);
}

for (const { src, out, width } of exports_) {
  const r = new Resvg(sources[src], {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: true },
    background: 'rgba(0,0,0,0)',
  });
  writeFileSync(out, r.render().asPng());
  console.log('png  ', out.replace(ROOT + '/', ''), `${width}px`);
}

console.log('\nDone.');
