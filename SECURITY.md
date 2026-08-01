# Security & Privacy

This app is built for teenage girls and young women in Azerbaijan. Many users
are minors. The security model is deliberately boring: **the app collects
nothing, sends nothing, and stores nothing that identifies anyone.**

## Data collection: none

- No account, no login, no sign-up.
- No email address, no phone number, no name, no date of birth.
- No location. No camera, microphone, contacts, photo library, or calendar
  access. The app requests **no runtime permissions**; the Expo config
  permissions list is intentionally empty.
- No advertising ID, no device fingerprint, no installation ID.

The only thing written to the device is anonymous progress state: which lesson
IDs have been opened, which quizzes have been passed, and the chosen language.
It never leaves the phone and identifies nobody.

## Network: none

v1 makes **zero network calls**. No API, no backend, no server, no cloud
function, no database server. There is nothing to breach and nothing in transit.

- All lesson, drill, quiz, club and glossary content is local JSON bundled into
  the app.
- All videos are local files bundled into the app. Nothing is streamed,
  uploaded, or fetched from a URL. No YouTube or other embed SDK.
- No remote config, no CDN assets, no downloaded fonts.

If a proposed feature requires a network call, it is out of scope for v1 and
gets discussed before any code is written.

## Third-party code: minimal

- **No analytics.** No Firebase Analytics, Amplitude, Mixpanel, PostHog, or
  equivalent.
- **No crash reporting.** No Sentry, Bugsnag, Crashlytics.
- **No ad SDKs.** No ad networks, no attribution or install-tracking SDKs.
- **No telemetry of any kind**, first- or third-party.

Dependencies are kept to the minimum needed to run the app. Every new dependency
is a deliberate decision, not a convenience.

## Secrets: none

There are **zero secrets in this project**. No API keys, tokens, passwords, or
credentials appear anywhere in source, config, or content files.

This is not just policy, it is a fact about frontend apps: anything shipped in a
mobile bundle can be extracted from the APK by anyone who downloads it. A
"secret" in a React Native app is public. If a feature ever appears to need one,
that is a signal a backend has crept into scope — stop and reconsider, do not
paste a key.

- `.env` and `.env.*` are git-ignored; `.env.example` is committed with
  placeholder values only.
- Signing material (`*.keystore`, `*.jks`, `*.p8`, `*.p12`,
  `*.mobileprovision`, `google-services.json`, `GoogleService-Info.plist`) is
  git-ignored and must never be committed.

## Logging

No user input, file paths, or device details are logged to the console in
production builds. Debug logging is development-only and stripped from release.

## Content safety

- No user-generated content, no comments, no chat, no uploads, no messaging.
  There is no surface for contact between users, and no surface for abuse.
- The "Find a Team" list is a static, human-curated set of public organisational
  contacts. It contains no personal contact details of individuals, and no
  entry is published without verification. Fabricated clubs or contacts are
  never acceptable, even as placeholders.

## Reporting a problem

This is a solo-developer project. If you find a security or privacy issue, open
an issue in the repository describing the problem and how to reproduce it.
Please do not include personal data in the report.
