# CLAUDE.md — Verve

Constraints for every session on this repo. These override defaults and habits.
If a request conflicts with something here, stop and say so instead of drifting.

## What this is

**Verve** — a mobile app that teaches girls and women in Azerbaijan how to play football,
from zero knowledge to joining a real team. Solo developer. Target: working v1
in ~3 weekends, then iterate with real users.

Target user: a 12–20 year old girl in Baku or a region, mid-range Android phone,
limited mobile data. May know nothing about the offside rule. Reads Azerbaijani
first, Russian second, English third.

## Hard architectural rules

**NO BACKEND.** No server, no API, no database server, no cloud function, no
auth system, no hosted anything. All content is local JSON bundled with the app.
All progress is local device storage. If something appears to require a backend,
STOP and ask — do not build one.

**NO NETWORK CALLS AT ALL IN V1.** No fetch, no axios, no WebSocket, no remote
config, no CDN assets, no font downloads, no embeds. The app must be fully
usable in airplane mode on first launch.

**Offline-first is not a feature, it is the whole design.** Anything that would
fail without a connection does not belong in v1.

## Stack (do not swap without a strong argument)

- React Native + Expo, TypeScript (strict)
- Expo Router for navigation
- Content as local JSON in `/content`, bundled with the app
- AsyncStorage for progress (expo-sqlite only if genuinely needed)
- i18next for localization: `az` (default), `ru`, `en`
- react-native-svg for all diagrams
- **expo-video** for video playback (not expo-av — see Resolved decisions)
- Keep dependencies minimal. No paid services.

### Dependency pins that matter

`react-dom` is pinned to an **exact** version matching `react` (no caret).
Expo pins React itself, and a caret lets npm pull a newer `react-dom` whose
peer range demands a React that Expo will not install — the install then fails
with an ERESOLVE that looks like it is about whatever you were adding at the
time. If you see a peer conflict mentioning `react-dom`, check this first.

## V1 scope — build only these five

1. **LEARN** — lessons grouped into tracks: rules (`Oyunun qaydaları`),
   positions (`Mövqelər`), goalkeeper (`Qapıçı`). Each lesson = title, video
   slot, short body text, one diagram, 2–3 key takeaways.
2. **TRAIN** — filterable drill library. Filters: position, equipment, space,
   solo/group, minutes. Each drill = video slot, steps, diagram, "what good
   looks like".
3. **QUIZ** — 5 questions at the end of each track, explanations on wrong
   answers, completion tracked locally.
4. **FIND A TEAM** — static curated list of clubs/academies/school programs that
   accept girls. Searchable by city.
5. **GLOSSARY** — az ↔ ru ↔ en football terms with one-line definitions. Terms
   inside lessons are tappable and open the glossary entry.

Anything not on this list is out of scope for v1.

## Video slots

Videos will be filmed and added later by the developer. Build the space now.

- Reusable `<VideoSlot>` component. Fixed **16:9** area at the top of every
  lesson screen and every drill screen.
- Every Lesson and Drill has an optional `video` field:
  `{ file: string, durationSec: number, caption: { az, ru, en } }`
- Missing `video` or missing file → **flat neutral placeholder** in that exact
  16:9 box: static play icon + localized "Video tezliklə". No shimmer, no
  skeleton, no gradient, no animation.
- **Layout must be byte-identical whether the video exists or not.** Nothing
  shifts when files are dropped in later.
- Videos are local files in `/assets/videos`, named to match the content ID
  (e.g. `gk-catching-01.mp4`). Do NOT stream, upload, fetch from a URL, or add
  YouTube / any embed SDK.
- expo-av, **muted by default**, visible play control, **never autoplay**.
- `/assets/videos/README.md` lists the exact expected filename for every lesson
  and drill. Keep it in sync whenever content is added.

## Diagrams

- **No raster images.** No PNG/JPG pitch diagrams.
- One reusable `<PitchDiagram>` component built on react-native-svg, with props
  for player markers, movement arrows, ball paths and zones.
- Every lesson and drill diagram is **data** passed to that component, stored in
  the content JSON. No bespoke one-off SVG per lesson.

## Visual rules (strict)

- Dark UI, high contrast, single strong accent colour. System fonts only.
  Readable outdoors. Large tap targets. Usable one-handed.
- Serious training tool. The accent is a **desaturated dusty rose**, chosen
  deliberately — muted and adult, not a bright candy pink.
- **NO purple.** No purple/violet accent, no purple gradients.

### Palette (locked — every value contrast-checked)

| Token | Hex | Use |
| --- | --- | --- |
| `bg` | `#0B0E14` | app background — near-black, cold blue undertone |
| `surface` | `#131A24` | cards, sheets, filter bars |
| `surfaceRaised` | `#1B2432` | pressed states, selected chips |
| `border` | `#232C3A` | hairlines — surfaces are separated by borders, not shadows |
| `accent` | `#C2687A` | dusty rose. 5.11:1 on `bg`, 4.63:1 on `surface` — AA for body text |
| `accentPressed` | `#A85C6E` | pressed state for accent fills |
| `onAccent` | `#0B0E14` | text/icons **on** an accent fill — 5.56:1. Never white (3.78:1, fails AA) |
| `textPrimary` | `#E9ECF2` | 16.3:1 on `bg` |
| `textSecondary` | `#9AA5B5` | 7.8:1 on `bg` — still AA at small sizes |

Depth comes from borders and flat surface steps only. **No shadows, no glow,
no gradients.**

### Brand

The mark is a tapered **V** filled with a fine diagonal hatch, accent on
background. Stacked lockup (mark above, `VERVE` below) for the splash screen.

Generated from geometry by `scripts/build-brand.mjs` — there is no design-tool
source file. See [`assets/brand/README.md`](assets/brand/README.md) for the
tuned values and the rules. The short version: never recolour, invert, rotate,
or put the mark on a light background; never add a gradient, glow or shadow to
it; 32 px is the minimum size before the hatch stops resolving.

### Resolved decisions

- **Video:** `expo-video`, not `expo-av`. The player is confined to
  `<VideoSlot>` so the dependency is swappable in one file.
- **Translations:** Azerbaijani is required; `ru` and `en` may be empty strings
  and fall back to `az` at render time. Content validation warns on missing
  locales, never fails. Never machine-translate content silently.
- **NO glow.** No neon, bloom, drop-shadow-glow, or box-shadow "glow" anywhere.
  Flat, solid colours only.
- **NO animations of any kind in v1.** No scroll animations, no fade-in or
  slide-in, no parallax, no reveal-on-view, no Reanimated, no Moti, no
  LayoutAnimation, no animated gradients, no shimmer/skeleton loaders, no
  animated page transitions beyond the platform default. **Do not install any
  animation library.** Motion gets added later, by hand.
- Screens render instantly in their final state.

## Accessibility & performance budget

- App bundle **under 25 MB** excluding videos.
- Every screen usable with no network connection.
- Every interactive element has an accessibility label **in the active locale**.
- Text must not clip when Azerbaijani or Russian strings run ~30% longer than
  English. Design for the long string, not the English one.

## Content rules

- **Do NOT invent or paraphrase the Laws of the Game from memory.** Rule content
  ships as clearly marked `TODO` stubs with correct structure. The developer
  fills them from the official IFAB Laws of the Game, reviewed by a licensed
  coach.
- Drill content and glossary entries MAY be drafted, but every content file is
  marked `"reviewed": false` until a human signs off.
- **Do NOT generate fake clubs, fake contacts, or fake statistics.** Empty
  arrays plus a visible empty state.
- Do not copy text from any website into content files.

## Security & privacy (users are minors)

- **Collect no personal data.** No login, no email, no phone number, no
  location, no camera / mic / contacts permissions. The Expo config permissions
  list stays empty.
- The app stores nothing that identifies anyone. Progress data is anonymous
  counters and IDs on-device only.
- **No analytics, no crash reporting, no ad SDKs, no third-party telemetry** of
  any kind.
- **Zero secrets in this project.** No hardcoded API keys, tokens, or passwords
  anywhere in source. If a situation seems to need one, STOP and ask.
- `.env` is git-ignored; `.env.example` holds placeholders only.
- Do not log user input or file paths to console in production builds.

See `SECURITY.md` for the same constraints stated as commitments.

## Working style

- Build **one step at a time**. After each step, state exactly what to run to
  see it working, then **stop**.
- Small commits, clear messages.
- Unsure about a **product** decision → ask.
- Unsure about a **football fact** → leave a `TODO`, never guess.
