/**
 * One-shot: lifts the content out of prototype/index.html into /content JSON.
 *
 * The prototype was where the schema got settled, so its data is the source of
 * truth for the initial import — retyping it by hand would only introduce
 * differences. After this has run once, /content is authoritative and the
 * prototype is frozen; do not run this again expecting a merge.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');

const html = readFileSync(join(ROOT, 'prototype', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];

// The prototype touches the DOM at load; stub just enough for it to evaluate.
const noop = () => {};
const el = () => ({
  innerHTML: '', scrollTop: 0, value: '', dataset: {},
  classList: { add: noop, remove: noop, contains: () => false },
  addEventListener: noop, focus: noop, setSelectionRange: noop,
});
const store = {};
const ctx = createContext({
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => (store[k] = v) },
  document: { getElementById: el, querySelector: el, addEventListener: noop },
  console,
});
runInContext(script + '\n;globalThis.__out = {TRACKS,LESSONS,DRILLS,QUIZZES,CLUBS,GLOSSARY};', ctx);
const { TRACKS, LESSONS, DRILLS, QUIZZES, CLUBS, GLOSSARY } = ctx.__out;

/** Every localised field carries all three keys, empty where untranslated. */
const LOCALES = ['az', 'ru', 'en'];
const fillLocales = (v) => {
  if (Array.isArray(v)) return v.map(fillLocales);
  if (v && typeof v === 'object') {
    const keys = Object.keys(v);
    const isLocalised = keys.length > 0 && keys.every((k) => LOCALES.includes(k));
    if (isLocalised) {
      const out = {};
      for (const L of LOCALES) out[L] = v[L] ?? (Array.isArray(v.az) ? [] : '');
      return out;
    }
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fillLocales(x)]));
  }
  return v;
};

const write = (rel, data) => {
  const path = join(CONTENT, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(fillLocales(data), null, 2) + '\n');
  const n = Array.isArray(data) ? data.length : Object.keys(data).length;
  console.log(`  ${rel.padEnd(28)} ${n}`);
};

console.log('writing /content:');
write('tracks.json', TRACKS);
for (const t of TRACKS) {
  write(`lessons/${t.id}.json`, LESSONS.filter((l) => l.trackId === t.id));
}
write('drills.json', DRILLS);
write('quizzes.json', QUIZZES);
write('clubs.json', CLUBS);
write('glossary.json', GLOSSARY);
console.log('\nDone.');
