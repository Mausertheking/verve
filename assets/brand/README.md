# Verve — brand assets

The mark is a tapered **V** filled with a fine diagonal hatch, in the accent
rose on the cold near-black. Stacked lockup for the splash screen.

Everything here is **generated from geometry** — there is no Figma file, no
Illustrator source, no raster master. The numbers in
[`scripts/build-brand.mjs`](../../scripts/build-brand.mjs) *are* the logo. Change
a number, rerun, and every size regenerates identically.

## Files

| File | What it is |
| --- | --- |
| `verve-icon.svg` | Full-bleed app icon — dark background baked in |
| `verve-mark.svg` | The V alone, transparent — for in-app use |
| `verve-adaptive-foreground.svg` | Android adaptive foreground, safe-zone geometry |
| `verve-lockup-stacked.svg` | Lockup D — mark above, `VERVE` below |

Generated PNGs land one level up, in `assets/`:

| File | Size | Used by |
| --- | --- | --- |
| `icon.png` | 1024² | `expo.icon` — iOS and the store listing |
| `adaptive-icon.png` | 1024² | `expo.android.adaptiveIcon.foregroundImage` |
| `splash-icon.png` | 1280×584 | `expo-splash-screen` |
| `favicon.png` | 48² | web build |

## Regenerating

The rasterizer is **not** a project dependency — it would be dead weight in the
app bundle for something that runs maybe four times a year. Install it only when
you need it:

```bash
npm i -D @resvg/resvg-js && node scripts/build-brand.mjs
```

Commit the regenerated PNGs. They are build outputs, but Expo reads them at
build time and they are small, so they live in git rather than in a pipeline.

## Decisions worth not re-litigating

**Hatch density is 8 / 1.4** (spacing / stroke width, in the 100-unit space).
This was tuned against rendered output, not guessed. At 6 / 2.2 the lines read
as bold stripes and fight the letterform; at 10 / 1.2 they read as separate
scratches rather than texture. 8 / 1.4 is the density that still reads as grain
at 48 px instead of dissolving into flat pink.

**The hatch colour is `#5D3742`, a solid.** It is what `#0B0E14` at 55% opacity
over `#C2687A` resolves to, precomputed. Nothing depends on alpha compositing —
some Android icon pipelines flatten transparency in ways you cannot predict, and
a logo is the wrong place to find that out.

**The adaptive foreground uses different geometry.** Android crops adaptive
icons to a circle 66% of the canvas and may mask away the outer quarter of every
edge. The full V's top corners sit 45 units from centre, well outside that — so
the adaptive variant is scaled to 0.72 (`V_SAFE` in the build script) to bring
the corners inside. **Do not swap in the full-bleed geometry**; the corners of
the V will be sliced off on most Android launchers.

**The wordmark is Helvetica Neue Medium, letterspaced 18.** It is baked into the
PNG, so it is not a font dependency and does not violate the system-fonts-only
rule — nothing is loaded at runtime. In-app, the same lockup is rendered with
React Native `<Text>` in the platform system font, which is Roboto on Android.
The two are never on screen together, so the small difference in letterform
does not matter.

**No corner radius on `icon.png`.** iOS applies its own mask. Baking a radius in
gives you a rounded square inside a rounded square.

## Rules

- Accent rose `#C2687A` on background `#0B0E14`. The mark does not get
  recoloured, inverted, or placed on a light background.
- Flat fills only — **no gradient, no glow, no drop shadow** on the mark, ever.
  This is the same rule as the rest of the UI and it applies double to a logo.
- Do not rotate, skew, outline, or add a keyline.
- Minimum size for the hatched mark is **32 px**. Below that the texture stops
  resolving and you should use a solid V instead.
- The lockup's proportions are fixed. Scale it as a unit; never move the
  wordmark relative to the mark.
