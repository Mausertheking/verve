# Verve — App Store submission kit

Everything App Store Connect asks for, ready to paste. Character limits are
Apple's; every field below fits.

---

## 1. Build and upload (run in Terminal, in the `verve` folder)

```bash
npx eas-cli build --platform ios --profile production
```
First run: it asks to link an EAS project (yes), then for your **Apple ID** —
sign in yourself and let it create the distribution certificate and
provisioning profile (yes to both). The build runs in the cloud (~15–25 min).

```bash
npx eas-cli submit --platform ios --latest
```
Uploads the build to App Store Connect and creates the app record for
`az.verve.app` if it does not exist. After Apple processes it (10–30 min) it
appears under **TestFlight** — install it on your iPhone and test before you
submit for review.

---

## 2. App information

| Field | Value |
| --- | --- |
| Name (≤30) | **Verve: Football from Zero** |
| Primary language | **English (U.K.)** — the default language of the Azerbaijan storefront. Apple does not offer Azerbaijani for store listings. |
| Bundle ID | az.verve.app |
| SKU | verve-ios-001 |
| Primary category | Sports |
| Secondary category | Education |
| Content rights | Does not contain, show, or access third-party content |
| Price | Free |
| Availability | All countries (or at least Azerbaijan, Russia, Türkiye, Georgia, Kazakhstan, UK, US) |
| Copyright | © 2026 Maksud Yusuf |
| Support URL | https://mausertheking.github.io/verve/support/ |
| Marketing URL (optional) | https://mausertheking.github.io/verve/ |
| Privacy Policy URL | https://mausertheking.github.io/verve/privacy/ |

If the name "Verve: Football from Zero" is taken, use **Verve — Girls' Football**.

---

## 3. English (U.K.) listing

**Subtitle (≤30):**
Football from zero, offline

**Promotional text (≤170):**
Learn football from the very first rule: lessons with videos, drills you can do at home, quizzes and a glossary — in Azerbaijani, Russian and English. No internet needed.

**Keywords (≤100, comma-separated, no spaces):**
football,soccer,girls,women,rules,offside,goalkeeper,drills,training,Azerbaijan,futbol,beginner

**Description (≤4000):**

Verve teaches girls and women in Azerbaijan to play football — starting from zero.

Most football apps assume you already know the game. Verve starts before the first rule: what offside really means, what each position does, how a goalkeeper stands, and how to practise at home with just a ball and a wall.

LEARN
• 20 lessons in three tracks: the rules of the game, positions, and goalkeeping
• The rules are written in plain words from the official IFAB Laws of the Game 2026/27 — every rules lesson names the Law it explains
• Every lesson has its own explainer video and a diagram you can play step by step, replay and slow down

TRAIN
• 12 drills you can filter by position, equipment, space, solo or group, and time
• Each drill explains why it matters, the steps, and what doing it well looks like
• Many need only a ball and a wall — or nothing at all

CHECK YOURSELF
• Quizzes for every track, with an explanation for every answer

FIND A TEAM
• Where to look, what to ask a club, what to bring to your first training, and how to stay safe

THREE LANGUAGES, NO INTERNET
• Azerbaijani, Russian and English — switch any time
• Everything, including the videos, is inside the app: it works offline from the first launch
• No account, no ads, no tracking. Verve collects no data at all.

—

Azərbaycanca: Verve qızlara və qadınlara futbolu sıfırdan öyrədir — qaydalar, mövqelər, qapıçılıq, evdə edilə bilən məşqlər, testlər və lüğət. Azərbaycan, rus və ingilis dillərində, internetsiz.

---

## 4. Russian listing (add localization → Russian)

**Name:** Verve: футбол с нуля
**Subtitle:** Футбол для девушек, без сети

**Promotional text:**
Учись футболу с самого первого правила: уроки с видео, упражнения дома, тесты и словарь — на азербайджанском, русском и английском. Интернет не нужен.

**Keywords:**
футбол,девушки,правила,офсайд,вратарь,тренировка,упражнения,Азербайджан,futbol,soccer,новичок

**Description:**

Verve учит девочек и девушек в Азербайджане играть в футбол — с нуля.

Большинство футбольных приложений считают, что ты уже знаешь игру. Verve начинает раньше первого правила: что такое офсайд, что делает каждая позиция, как стоит вратарь и как тренироваться дома, имея только мяч и стену.

УЧИСЬ
• 20 уроков в трёх разделах: правила игры, позиции и игра вратаря
• Правила написаны простыми словами по официальным IFAB Laws of the Game 2026/27 — в каждом уроке указано, какое правило он объясняет
• У каждого урока есть своё видео и схема, которую можно проиграть по шагам, повторить и замедлить

ТРЕНИРУЙСЯ
• 12 упражнений с фильтрами: позиция, инвентарь, место, одна или в группе, время
• Для каждого — зачем оно нужно, шаги и как выглядит правильное выполнение

ПРОВЕРЬ СЕБЯ
• Тесты по каждому разделу с объяснением каждого ответа

НАЙДИ КОМАНДУ
• Где искать, что спросить у клуба, что взять на первую тренировку и как оставаться в безопасности

ТРИ ЯЗЫКА, БЕЗ ИНТЕРНЕТА
• Азербайджанский, русский и английский
• Всё, включая видео, уже внутри приложения
• Без аккаунта, рекламы и отслеживания. Verve не собирает никаких данных.

---

## 5. Screenshots (6.9" iPhone — 1320 × 2868)

Upload in this order. Files are in `store/screenshots/<lang>/`:

1. `1-home.png` — the Learn screen
2. `2-lesson.png` — a rules lesson with its video and the moving diagram
3. `3-drill.png` — a drill with video, "why this drill" and steps
4. `4-quiz.png` — a quiz answer with its explanation
5. `5-team.png` — the "Find a team" guide

English (U.K.) listing → `en/`. Russian listing → `ru/`. The `az/` set is for
your website or social posts (App Store has no Azerbaijani listing).

The app is iPhone-only (`supportsTablet: false`), so no iPad screenshots are needed.

Regenerate after UI changes: start the web preview, then
`node store/screenshots.mjs`.

---

## 6. App Privacy (App Store Connect → App Privacy)

- "Do you or your third-party partners collect data from this app?" → **No, we do not collect data from this app.**
- Result shown on the store: **Data Not Collected**.

## 7. Age rating questionnaire

Answer **None / No** to every question (no violence, no mature themes, no
gambling, no user-generated content, no messaging, no web access, no
advertising). Expected rating: **4+**.

Do **not** choose the Kids Category — it is for ages 11 and under and adds
extra rules; Verve's audience is 12–20.

## 8. Export compliance

Already answered in the build (`ITSAppUsesNonExemptEncryption: false`):
the app uses no encryption.

## 9. App Review information

- Sign-in required: **No**
- Contact: your name, phone and email (only Apple sees these)
- Notes for the reviewer:

> Verve is a fully offline learning app — no account, no network, no data
> collection. All content (20 lessons with videos, 12 drills, quizzes,
> glossary) is bundled. Language can be switched on the Learn screen
> (AZ · RU · EN). Rules lessons are written from the IFAB Laws of the Game
> 2026/27. The ⓘ button on the Learn screen opens About, the in-app privacy
> policy and a progress reset.

## 10. Version release

"Manually release this version" is safest for a first launch — you press the
button when you are ready after approval.
