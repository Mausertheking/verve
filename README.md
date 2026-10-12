# Verve

A mobile app that teaches girls and women in Azerbaijan how to play football —
from zero knowledge to joining a real team.

Azerbaijani-first (`az`), with Russian (`ru`) and English (`en`). Built for a
mid-range Android phone on limited mobile data: **fully offline, no account, no
data collection, no network calls.**

## Try it now

**→ [mausertheking.github.io/verve](https://mausertheking.github.io/verve/)**

Open it on your phone. Nothing to install. This is the real app compiled for
the browser — same code, same content, same screens.

Two things worth knowing before you judge it:

- **It is a preview, not the product.** The real target is a native Android
  app. The browser build exists so people can give feedback without a build
  toolchain.
- **All Azerbaijani copy is placeholder** pending a native-speaker pass, and
  every rule statement is a `TODO` stub, not a claim about the Laws of the Game.

## What works

| Section | Azerbaijani | State |
| --- | --- | --- |
| Learn | Öyrən | Three tracks → lesson, with explainer, diagram, takeaways |
| Train | Məşq | 12 drills, all five filters working, drill detail with explainer |
| Quiz | Test | Goalkeeper quiz scores and explains wrong answers |
| Find a team | Komanda tap | Empty by policy, with a visible empty state |
| Glossary | Lüğət | 19 terms, searchable in all three languages |

Language switches between AZ · RU · EN from the Learn screen and is remembered
on the device. Progress is saved on the device. Tapping a **highlighted term** inside a lesson
opens its glossary entry without losing your place.

The rules and positions quizzes are deliberately locked — their questions get
written after the rule text exists.

## Running it locally

Requires Node 20+.

```bash
git clone https://github.com/Mausertheking/verve.git && cd verve && npm install
```

```bash
npx expo start
```

Scan the QR code with **Expo Go**
([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) ·
[iOS](https://apps.apple.com/app/expo-go/id982107779)) on a phone on the same
Wi-Fi. Press `w` for the browser instead, `a` for an Android emulator.

### Checks

```bash
npm run check
```

Runs TypeScript and the content validator together. The validator enforces the
content rules — no dangling glossary references, no broken inline term markup,
quiz answer keys that match a real option, and rules lessons that stay `TODO`.
Those fail the build. Missing `ru`/`en` translations are warnings only, by
design, so untranslated content never blocks shipping.

## How it is put together

```
app/            Expo Router routes — thin, one screen each
src/
  components/   VideoSlot, PitchDiagram, RichText, controls, ui
  content/      typed loaders + drill filter logic
  i18n/         i18next; UI chrome strings only
  storage/      AsyncStorage progress, anonymous
  theme/        the locked palette, spacing, type scale
content/        the teaching material, as JSON
assets/brand/   the mark, generated from geometry
prototype/      throwaway HTML prototype (see its README)
```

**No backend.** No server, no API, no database, no auth. All content is local
JSON bundled into the app; all progress is local device storage. The app makes
**zero network calls**.

Content strings carry all three languages inline, because a glossary entry *is*
a three-language mapping and splitting it across locale files would mean editing
three files to fix one sentence. `ru` and `en` may be empty and fall back to
Azerbaijani.

## Explainers and motion

Every lesson and drill with a diagram has an **animated explainer** in its 16:9
slot: the diagram plays step by step — players run their lines, the ball
travels, each step is captioned. Tap a segment to replay one step, or switch to
half speed. Nothing autoplays.

Three body-technique lessons (stance, catching, the goalkeeper's role) also
have **rendered motion-graphic videos**, built from the lesson text by
[`explainers/`](explainers/) with HyperFrames:

```bash
node explainers/build.mjs
```

A language is rendered only where the lesson has that text; otherwise the app
falls back to the Azerbaijani video. Never machine-translated.

In-app motion uses Reanimated, lives in `src/motion`, and follows the system
**Reduce Motion** setting everywhere — explainers become step-by-step stills.

## Videos

Videos are filmed separately and dropped into `/assets/videos` as local files
named after their content id (`gk-catching-01.mp4`). Nothing is streamed,
uploaded, or fetched from a URL.

The 16:9 slot is the same box whatever fills it — footage, a rendered
explainer, the animated diagram, or a flat placeholder — so nothing on screen
shifts when footage lands. Register a file in `src/content/videos.ts`.

## Content status

Rules content ships as structured `TODO` stubs. The Laws of the Game are filled
in from the official IFAB text and reviewed by a licensed coach — never
paraphrased from memory. Drafted drill and glossary content carries
`"reviewed": false` until a human signs off. The club list is genuinely empty;
inventing a club or a contact would be worse than showing nothing.

## Brand

A tapered dusty-rose V with a fine diagonal hatch, on the cold near-black.
Generated from geometry — no design-tool source, no raster master. See
[assets/brand/README.md](assets/brand/README.md).

```bash
npm i -D @resvg/resvg-js && node scripts/build-brand.mjs
```

## Privacy

No login, no personal data, no permissions, no analytics, no network. Users are
minors and the app is built accordingly. See [SECURITY.md](SECURITY.md).

## Contributing

Project constraints live in [CLAUDE.md](CLAUDE.md) — read it before changing
anything. The short version: no backend, no network, motion only where it
teaches, no purple, no glow, no secrets, no invented football facts.
