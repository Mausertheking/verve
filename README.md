# Verve

A mobile app that teaches girls and women in Azerbaijan how to play football —
from zero knowledge to joining a real team.

Azerbaijani-first (`az`), with Russian (`ru`) and English (`en`). Built for a
mid-range Android phone on limited mobile data: **fully offline, no account, no
data collection, no network calls.**

## What's in v1

| Section | Azerbaijani | What it does |
| --- | --- | --- |
| Learn | Öyrən | Short lessons in three tracks: rules, positions, goalkeeper |
| Train | Məşq | Filterable drill library — position, equipment, space, time |
| Quiz | Test | 5 questions per track, explanations on wrong answers |
| Find a team | Komanda tap | Curated clubs and school programs that accept girls |
| Glossary | Lüğət | az ↔ ru ↔ en football terms, tappable inside lessons |

## Stack

React Native + Expo · TypeScript · Expo Router · i18next · react-native-svg ·
expo-av · AsyncStorage

No backend. No server. All content is local JSON bundled with the app; all
progress is local device storage.

## Getting started

Not yet scaffolded — see the build plan. Once the Expo app exists:

```bash
npm install
```

```bash
npx expo start
```

## Videos

Videos are filmed by the developer and dropped into `/assets/videos` as local
files named after their content ID. `assets/videos/README.md` lists every
expected filename. The UI reserves an identical 16:9 slot whether or not the
file exists, so layout never shifts when videos land.

## Content status

Rules content ships as structured `TODO` stubs — the Laws of the Game are filled
in from the official IFAB text and reviewed by a licensed coach, never
paraphrased from memory. Drafted drill and glossary content carries
`"reviewed": false` until a human signs off.

## Brand

A tapered pink V with a fine diagonal hatch, on the cold near-black. Generated
from geometry — no design-tool source, no raster master. See
[assets/brand/README.md](assets/brand/README.md).

```bash
npm i -D @resvg/resvg-js && node scripts/build-brand.mjs
```

## Privacy

No login, no personal data, no permissions, no analytics, no network. See
[SECURITY.md](SECURITY.md).

## Contributing constraints

Project constraints live in [CLAUDE.md](CLAUDE.md) — read it before changing
anything.
