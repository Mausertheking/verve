# Verve explainers — frame spec

Brand truth for every rendered explainer. Mirrors the app's locked palette
(`src/theme/index.ts`) and CLAUDE.md visual rules. Copied into each project.

## Palette (locked)

| Role | Hex |
| --- | --- |
| background | `#0B0E14` |
| surface (ghost type, panels) | `#131A24` |
| raised surface | `#1B2432` |
| hairlines, pitch lines | `#232C3A` |
| accent — dusty rose | `#C2687A` |
| text on accent | `#0B0E14` (never white) |
| primary text | `#E9ECF2` |
| secondary text | `#9AA5B5` |

## Hard rules

- **No gradients, no glow, no shadows, no purple.** Depth comes from flat
  surface steps and hairlines. Ghost type uses the flat surface colour, not
  transparency glow.
- One accent. Accent is for focal marks: numerals, markers, the progress rule.
- Editorial structure: spaced-capital kicker top-left, serif headline, numbered
  points, hairline rules, a progress rule along the bottom.

## Type

- Serif (headlines, numerals, quotes): **Georgia** — the app's system serif.
- Sans (labels, body): **Helvetica Neue** → resolves to embedded Inter.
- Video sizes: headline 120–160px, body 40–48px, labels 22–26px.

## Motion

- Motion teaches: figures move between real positions; markers appear in the
  order the takeaways are read. Nothing loops for decoration except a slow
  drift on the ghost numeral.
- Entrances 0.4–0.7s, `power3.out` / `expo.out`; figure moves 1.2–1.6s
  `power2.inOut`. Reading time ≥ 2.6s per takeaway.

## Text

All on-screen text comes from `/content` via composition variables
(`build.mjs` writes them). Never type copy into the HTML that is not in
content — the HTML defaults are the Azerbaijani source strings.
