/**
 * App Store screenshots from the running web build of the real app.
 * 6.9" iPhone size: 440×956 points at 3× = 1320×2868 px.
 *
 *   npx expo start --web --port 8087     (in another terminal)
 *   node store/screenshots.mjs
 *
 * Output: store/screenshots/<lang>/<n>-<name>.png
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER_CORE ?? 'puppeteer-core');

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL ?? 'http://localhost:8087';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const progressFor = (locale) => JSON.stringify({
  version: 1,
  locale,
  lessonsCompleted: { 'rules-pitch-01': 1, 'rules-offside-01': 1, 'gk-stance-01': 1, 'gk-footwork-01': 1, 'pos-goalkeeper-01': 1 },
  drillsDone: { 'gk-catching-01': 1, 'field-passing-01': 1, 'fitness-agility-01': 1 },
  quizResults: { 'quiz-goalkeeper': { bestScore: 4, total: 5 } },
});

const SHOTS = [
  { name: 'home', path: '/' },
  { name: 'lesson', path: '/lesson/rules-offside-01', video: 'lessons-rules-offside-01' },
  { name: 'drill', path: '/drill/group-rondo-01', video: 'drills-group-rondo-01' },
  { name: 'quiz', path: '/quiz/rules', quiz: 'b' },
  { name: 'team', path: '/teams' },
];

/** Seconds into an explainer where its moving diagram is mid-play (from the generated composition). */
function diagramMoment(work, locale) {
  const f = join(HERE, '..', 'explainers', '.work', `${work}-${locale}`, 'index.html');
  if (!existsSync(f)) return null;
  const m = readFileSync(f, 'utf8').match(/sc-diagram" data-start="([0-9.]+)"/);
  return m ? Number(m[1]) + 5.2 : null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });
try {
  for (const locale of ['en', 'ru', 'az']) {
    const out = join(HERE, 'screenshots', locale);
    mkdirSync(out, { recursive: true });
    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setViewport({ width: 440, height: 956, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await page.goto(BASE, { waitUntil: 'networkidle0' });
    await page.evaluate((p) => localStorage.setItem('verve.progress.v1', p), progressFor(locale));

    for (const [i, shot] of SHOTS.entries()) {
      await page.goto(BASE + shot.path, { waitUntil: 'networkidle0' });
      await sleep(1500);
      if (shot.video) {
        // Pause the lesson's own video on its moving-diagram scene.
        const at = diagramMoment(shot.video, locale);
        await page.evaluate(async (at) => {
          const v = document.querySelector('video');
          if (!v) return;
          if (v.readyState < 1) await new Promise((r) => v.addEventListener('loadedmetadata', r, { once: true }));
          v.currentTime = at ?? Math.max(0, v.duration - 22);
          await new Promise((r) => v.addEventListener('seeked', r, { once: true }));
        }, at);
      }
      if (shot.quiz) {
        await page.evaluate((id) => {
          const opts = [...document.querySelectorAll('[role="button"]')].filter((e) => e.textContent?.trim().length > 3);
          opts['abcd'.indexOf(id)]?.click();
        }, shot.quiz);
      }
      await sleep(900);
      const file = join(out, `${i + 1}-${shot.name}.png`);
      await page.screenshot({ path: file });
      console.log(file.replace(HERE + '/', ''));
    }
    await page.close();
  }
} finally {
  await browser.close();
}
