# Prototype — throwaway

A single HTML file that behaves like Verve, for testing flow and content shape
before the React Native app exists. **This is not the app and it is not a
foundation.** It gets deleted once the real screens are built.

```bash
open prototype/index.html
```

No server, no build, no network. Works offline. Progress is kept in
`localStorage`, which stands in for AsyncStorage.

## What it is actually for

Two things, both of which are cheaper to get wrong here than in React Native:

1. **The content schema.** The data in `index.html` matches the proposed
   TypeScript types exactly. It is the seed for `/content` — 20 lessons, 12
   drills, 19 glossary terms, one working quiz. When the real app is built, this
   data moves into JSON files roughly unchanged.
2. **The claims.** Layout stability of `VideoSlot`, translation fallback, filter
   behaviour, empty states. Assertions in a plan are cheap; these are measured.

## Developer panel

The ⚙ button, bottom right. Not part of the app.

- **Simulate video files present** — flips every `VideoSlot` to its filled
  state, so you can confirm the 16:9 box does not move when real footage lands.
- **Reset all progress** — clears local storage.
- **Content status** — counts of todo / draft / reviewed, and how many video
  slots are wired.

## Checks

`checks.js` runs the prototype's logic under Node with a stubbed DOM — no
browser needed. It verifies content integrity (no dangling glossary references,
no invented rule text, clubs list empty, nothing marked reviewed), locale
fallback, filter behaviour, and that both `VideoSlot` states use the same
container.

```bash
node -e "const f=require('fs');f.writeFileSync('/tmp/v.js',f.readFileSync('prototype/index.html','utf8').match(/<script>([\s\S]*)<\/script>/)[1])" && cd prototype && node checks.js
```

## Known gaps, deliberately

- Cards have no accessibility labels. The real app needs an
  `accessibilityLabel` on every interactive element, in the active locale — the
  prototype does not model that and should not be used to judge it.
- Screens re-render by replacing `innerHTML`. Fine here, nothing like how the
  RN app should work.
- Russian and English are filled in only where they were needed to test length
  and fallback. Gaps fall back to Azerbaijani, which is the agreed policy.
- All Azerbaijani copy is placeholder pending a native-speaker pass.
