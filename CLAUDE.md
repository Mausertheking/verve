# CLAUDE.md — futbol-az

Constraints for every session on this repo. These override defaults and habits.
If a request conflicts with something here, stop and say so instead of drifting.

## What this is

A mobile app that teaches girls and women in Azerbaijan how to play football,
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
- expo-av for video playback
- Keep dependencies minimal. No paid services.

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
- Serious training tool, **not pink-by-default**.
- **NO purple.** No purple/violet accent, no purple gradients.
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
