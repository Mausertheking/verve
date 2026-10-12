---
workflow: general-video
flow: automation
storyboard: no
message: "The goalkeeper's basic stance, shown on a moving figure"
destination: embed
aspect: 1920x1080
language: az
length: 21s
---

## Intent

In-app explainer for the Verve lesson `gk-stance-01`, playing muted in the
lesson's 16:9 slot until real footage is filmed. Teaching, not promotion:
a side-view figure settles from upright into the stance while the three
takeaways appear with matching numbered markers on the body.

## Notes

- All copy comes from `content/lessons/goalkeeper.json` via composition
  variables (`../build.mjs`); `en` is rendered too because the lesson has it.
- Verve brand is locked: no gradients, glow, shadows or purple (`frame.md`).
- The user pre-approved the render ("I accept all kinds of edits", away from
  the computer), so the final-preview approval gate is satisfied.
