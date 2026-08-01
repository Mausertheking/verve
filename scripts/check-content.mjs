/**
 * Validates /content against the rules that matter, without a schema library.
 *
 * Errors fail the build. Warnings do not — a missing `ru` or `en` string is
 * expected and falls back to Azerbaijani by design, so it must never block
 * shipping.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const C = join(ROOT, 'content');
const read = (p) => JSON.parse(readFileSync(join(C, p), 'utf8'));

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const tracks = read('tracks.json');
const lessons = readdirSync(join(C, 'lessons')).flatMap((f) => read(`lessons/${f}`));
const drills = read('drills.json');
const quizzes = read('quizzes.json');
const clubs = read('clubs.json');
const glossary = read('glossary.json');

const termIds = new Set(glossary.map((g) => g.id));
const lessonIds = new Set(lessons.map((l) => l.id));

// --- ids are unique -------------------------------------------------------
for (const [name, items] of [
  ['lesson', lessons], ['drill', drills], ['glossary term', glossary], ['club', clubs],
]) {
  const seen = new Set();
  for (const it of items) {
    if (seen.has(it.id)) err(`duplicate ${name} id: ${it.id}`);
    seen.add(it.id);
  }
}

// --- Azerbaijani is required; ru/en may be blank --------------------------
const checkText = (obj, where) => {
  if (!obj) return;
  if (typeof obj.az !== 'string' || obj.az.length === 0) err(`${where}: missing Azerbaijani`);
  for (const L of ['ru', 'en']) {
    const v = obj[L];
    if (v === undefined) err(`${where}: '${L}' key absent (use an empty string, not omission)`);
    else if (v.length === 0) warn(`${where}: no ${L} translation yet`);
  }
};
const checkList = (obj, where) => {
  if (!obj) return;
  if (!Array.isArray(obj.az) || obj.az.length === 0) err(`${where}: missing Azerbaijani`);
  for (const L of ['ru', 'en']) {
    if (obj[L] === undefined) err(`${where}: '${L}' key absent`);
    else if (obj[L].length === 0) warn(`${where}: no ${L} translation yet`);
  }
};

// --- lessons --------------------------------------------------------------
for (const l of lessons) {
  checkText(l.title, `lesson ${l.id} title`);
  checkList(l.body, `lesson ${l.id} body`);
  checkList(l.takeaways, `lesson ${l.id} takeaways`);
  if (!tracks.some((t) => t.id === l.trackId)) err(`lesson ${l.id}: unknown track ${l.trackId}`);
  if (l.reviewed !== false && l.reviewed !== true) err(`lesson ${l.id}: reviewed must be boolean`);
  for (const g of l.glossaryTermIds ?? []) {
    if (!termIds.has(g)) err(`lesson ${l.id}: unknown glossary term '${g}'`);
  }
  // The Laws of the Game are never paraphrased from memory.
  if (l.trackId === 'rules' && l.status !== 'todo') {
    err(`lesson ${l.id}: rules content must stay 'todo' until filled from IFAB and coach-reviewed`);
  }
}

// --- drills ---------------------------------------------------------------
const EQUIP = new Set(['none', 'ball', 'cones', 'wall', 'partner']);
const SPACE = new Set(['bedroom', 'yard', 'half-pitch']);
for (const d of drills) {
  checkText(d.title, `drill ${d.id} title`);
  checkList(d.steps, `drill ${d.id} steps`);
  checkList(d.whatGoodLooksLike, `drill ${d.id} whatGoodLooksLike`);
  if (!SPACE.has(d.space)) err(`drill ${d.id}: bad space '${d.space}'`);
  for (const e of d.equipment) if (!EQUIP.has(e)) err(`drill ${d.id}: bad equipment '${e}'`);
  if (!(d.minutes > 0)) err(`drill ${d.id}: minutes must be positive`);
  for (const g of d.glossaryTermIds ?? []) {
    if (!termIds.has(g)) err(`drill ${d.id}: unknown glossary term '${g}'`);
  }
}

// --- inline [[term|label]] markup resolves ---------------------------------
for (const item of [...lessons, ...drills]) {
  for (const field of ['body', 'steps', 'takeaways', 'whatGoodLooksLike']) {
    for (const L of ['az', 'ru', 'en']) {
      for (const line of item[field]?.[L] ?? []) {
        for (const m of line.matchAll(/\[\[([a-z0-9-]+)\|/gi)) {
          if (!termIds.has(m[1])) err(`${item.id} ${field}.${L}: unknown inline term '${m[1]}'`);
        }
      }
    }
  }
}

// --- quizzes --------------------------------------------------------------
for (const q of quizzes) {
  if (q.questions.length > 0 && q.questions.length !== 5) {
    warn(`quiz ${q.id}: ${q.questions.length} questions (5 is the intended length)`);
  }
  for (const question of q.questions) {
    checkText(question.prompt, `quiz ${q.id} ${question.id} prompt`);
    checkText(question.explanation, `quiz ${q.id} ${question.id} explanation`);
    if (!question.options.some((o) => o.id === question.correctOptionId)) {
      err(`quiz ${q.id} ${question.id}: correctOptionId does not match any option`);
    }
    if (question.reviseLessonId && !lessonIds.has(question.reviseLessonId)) {
      err(`quiz ${q.id} ${question.id}: unknown reviseLessonId`);
    }
  }
}

// --- glossary -------------------------------------------------------------
for (const g of glossary) {
  for (const L of ['az', 'ru', 'en']) {
    if (!g.term?.[L]) err(`glossary ${g.id}: term.${L} is required in all three languages`);
  }
  if (g.seeLessonId && !lessonIds.has(g.seeLessonId)) {
    err(`glossary ${g.id}: unknown seeLessonId '${g.seeLessonId}'`);
  }
}

// --- clubs: never fabricated ----------------------------------------------
for (const c of clubs) {
  if (!c.verifiedOn) err(`club ${c.id}: verifiedOn is required — unverified entries do not ship`);
}

// --- report ---------------------------------------------------------------
const status = (n) => `${n} lessons, ${drills.length} drills, ${glossary.length} terms, ${clubs.length} clubs`;
console.log(status(lessons.length));
console.log(
  `status: ${lessons.filter((l) => l.status === 'todo').length} todo, ` +
  `${lessons.filter((l) => l.status === 'draft').length} draft, ` +
  `${[...lessons, ...drills].filter((x) => x.reviewed).length} reviewed`,
);

if (warnings.length > 0) {
  console.log(`\n${warnings.length} warnings (missing translations are expected):`);
  const shown = warnings.slice(0, 6);
  for (const w of shown) console.log('  ~', w);
  if (warnings.length > shown.length) console.log(`  … and ${warnings.length - shown.length} more`);
}

if (errors.length > 0) {
  console.error(`\n${errors.length} ERRORS:`);
  for (const e of errors) console.error('  ✗', e);
  process.exit(1);
}
console.log('\ncontent OK');
