/**
 * App Store creative assets (iOS 27 product page):
 *   header.png          3840 × 1646 (21:9) — Product Page header
 *   search-results.png  3840 × 2560 (3:2)  — Search Results
 * Built from the real app screenshots in store/screenshots/<lang>/.
 * No transparency, no URLs, prices or © (Apple's rules for these slots).
 *
 *   node store/creative.mjs            (needs PUPPETEER_CORE or puppeteer-core)
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER_CORE ?? 'puppeteer-core');
const HERE = dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const COPY = {
  en: { kicker: 'FOR GIRLS IN AZERBAIJAN', title: 'Football,<br>from zero.', sub: 'Lessons with video · Drills · Quizzes', langs: 'Azərbaycan · Русский · English' },
  ru: { kicker: 'ДЛЯ ДЕВУШЕК АЗЕРБАЙДЖАНА', title: 'Футбол<br>с нуля.', sub: 'Уроки с видео · Упражнения · Тесты', langs: 'Azərbaycan · Русский · English' },
};

const img = (lang, f) => `data:image/png;base64,${readFileSync(join(HERE, 'screenshots', lang, f)).toString('base64')}`;
const MARK = `<svg viewBox="0 0 100 100"><defs><clipPath id="v"><polygon points="18,18 37,18 50,56 63,18 82,18 50,82"/></clipPath></defs>
<polygon points="18,18 37,18 50,56 63,18 82,18 50,82" fill="#C2687A"/><g clip-path="url(#v)" stroke="#5D3742" stroke-width="1.4">
${Array.from({ length: 18 }, (_, i) => `<line x1="${i * 8 - 80}" y1="100" x2="${i * 8 + 20}" y2="0"/>`).join('')}</g></svg>`;

function page(lang, w, h, phones, layout) {
  const c = COPY[lang];
  const phoneH = Math.round(h * layout.phoneH);
  const phoneW = Math.round(phoneH * 1320 / 2868);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;background:#0B0E14;overflow:hidden}
  body{position:relative;font-family:-apple-system,"Helvetica Neue",sans-serif;color:#E9ECF2}
  .arcs{position:absolute;right:${-h * 0.25}px;bottom:${-h * 0.35}px;width:${h * 1.2}px;height:${h * 1.2}px}
  .copy{position:absolute;left:${layout.padX}px;top:50%;transform:translateY(-50%);width:${layout.copyW}px}
  .mark{width:${layout.mark}px;height:${layout.mark}px}
  .kicker{font-size:${layout.kick}px;font-weight:700;letter-spacing:.24em;color:#C2687A;margin-top:${layout.mark * 0.45}px}
  h1{font-family:Georgia,serif;font-weight:400;font-size:${layout.title}px;line-height:1.02;letter-spacing:-.03em;margin-top:${layout.kick * 1.2}px}
  .rule{width:${layout.title * 0.9}px;height:${layout.title * 0.06}px;background:#C2687A;margin:${layout.title * 0.32}px 0}
  .sub{font-size:${layout.kick * 1.45}px;color:#9AA5B5;line-height:1.4;max-width:${layout.copyW}px}
  .langs{font-family:Georgia,serif;font-style:italic;font-size:${layout.kick * 1.45}px;color:#C2687A;margin-top:${layout.kick * 0.7}px}
  .phones{position:absolute;right:${layout.padX}px;top:50%;transform:translateY(-50%);display:flex;gap:${layout.gap}px;align-items:center}
  .phone{width:${phoneW}px;height:${phoneH}px;border-radius:${phoneW * 0.13}px;background:#131A24;border:${Math.max(4, phoneW * 0.012)}px solid #232C3A;padding:${phoneW * 0.035}px;overflow:hidden}
  .phone img{width:100%;height:100%;border-radius:${phoneW * 0.1}px;display:block;object-fit:cover;object-position:top}
  .phone.mid{height:${phoneH * 1.06}px;width:${phoneW * 1.06}px}
  </style></head><body>
  <svg class="arcs" viewBox="0 0 1000 1000"><circle cx="500" cy="500" r="320" fill="none" stroke="#1B2432" stroke-width="10"/><circle cx="500" cy="500" r="490" fill="none" stroke="#131A24" stroke-width="10"/></svg>
  <div class="copy"><div class="mark">${MARK}</div><div class="kicker">${c.kicker}</div><h1>${c.title}</h1><div class="rule"></div>
  <div class="sub">${c.sub}</div><div class="langs">${c.langs}</div></div>
  <div class="phones">${phones.map((p, i) => `<div class="phone${phones.length === 3 && i === 1 ? ' mid' : ''}"><img src="${img(lang, p)}"></div>`).join('')}</div>
  </body></html>`;
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
  for (const lang of ['en', 'ru']) {
    const out = join(HERE, 'creative', lang);
    mkdirSync(out, { recursive: true });
    const jobs = [
      { file: 'header.png', w: 3840, h: 1646, phones: ['1-home.png', '2-lesson.png', '3-drill.png'],
        layout: { padX: 260, copyW: 1700, phoneH: 0.84, gap: 70, mark: 150, kick: 46, title: 250 } },
      { file: 'search-results.png', w: 3840, h: 2560, phones: ['2-lesson.png', '1-home.png'],
        layout: { padX: 260, copyW: 1500, phoneH: 0.74, gap: 70, mark: 180, kick: 50, title: 280 } },
    ];
    for (const j of jobs) {
      const p = await browser.newPage();
      await p.setViewport({ width: j.w, height: j.h, deviceScaleFactor: 1 });
      await p.setContent(page(lang, j.w, j.h, j.phones, j.layout), { waitUntil: 'load' });
      await p.screenshot({ path: join(out, j.file), omitBackground: false });
      await p.close();
      console.log(`${lang}/${j.file}`);
    }
  }
} finally {
  await browser.close();
}
