/**
 * One-off: adds drafted explainer diagrams to drills and lessons that had none.
 * Kept in the repo so the authored data is reviewable in one place; running it
 * again is a no-op for items that already have a diagram.
 *
 * Every diagram is drafted from that item's own steps and takeaways — no new
 * football claims. Content stays `reviewed: false` until a coach signs off.
 * `ru` is left blank on purpose (falls back to az; never machine-translated).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const C = join(dirname(fileURLToPath(import.meta.url)), '..', 'content');
const T = (az, en) => ({ az, ru: '', en });
const WALL = { x: 18, y: 5, w: 64, h: 4, kind: 'wall' };

const DRILLS = {
  'gk-catching-01': {
    view: 'blank',
    zones: [WALL],
    markers: [
      { id: 'gk', x: 50, y: 50, kind: 'keeper', label: 'GK' },
      { id: 'b', x: 50, y: 46, kind: 'ball' },
    ],
    paths: [
      { from: { x: 50, y: 46 }, to: { x: 50, y: 10 }, kind: 'pass' },
      { from: { x: 50, y: 10 }, to: { x: 50, y: 46 }, kind: 'pass' },
    ],
    beats: [
      T('Topu divara at.', 'Throw the ball at the wall.'),
      T('Qayıdan topu sinə hündürlüyündə, W forması ilə tut.', 'Catch the rebound at chest height, hands in a W.'),
    ],
    caption: T('Divardan 3 addım aralı: at, tut, təkrarla.', 'Three steps from the wall: throw, catch, repeat.'),
  },
  'gk-footwork-01': {
    view: 'blank',
    zones: [{ x: 26, y: 22, w: 48, h: 22, kind: 'space' }],
    markers: [{ id: 'gk', x: 50, y: 33, kind: 'keeper', label: 'GK' }],
    paths: [
      { from: 'gk', to: { x: 66, y: 33 }, kind: 'run' },
      { from: 'gk', to: { x: 34, y: 33 }, kind: 'run' },
      { from: 'gk', to: { x: 50, y: 33 }, kind: 'run' },
    ],
    beats: [
      T('Sağa 3 kiçik addım — ayaqlar kəsişmir.', 'Three small steps right — feet never cross.'),
      T('Sola 3 addım, eyni ritmlə.', 'Three steps left, same rhythm.'),
      T('Mərkəzə qayıt. 15 saniyə fasilə.', 'Back to the centre. Rest 15 seconds.'),
    ],
    caption: T('Kiçik, tez addımlar. 8 dəst.', 'Small, quick steps. Eight sets.'),
  },
  'gk-reaction-01': {
    view: 'blank',
    zones: [WALL],
    markers: [
      { id: 'gk', x: 50, y: 34, kind: 'keeper', label: 'GK' },
      { id: 'b', x: 50, y: 30, kind: 'ball' },
    ],
    paths: [
      { from: { x: 50, y: 30 }, to: { x: 56, y: 10 }, kind: 'pass' },
      { from: { x: 56, y: 10 }, to: { x: 66, y: 31 }, kind: 'pass', at: 1 },
      { from: 'gk', to: { x: 63, y: 34 }, kind: 'run', at: 1 },
    ],
    beats: [
      T('Divara 2 addım yaxın dur, topu güclü at.', 'Two steps from the wall, throw it hard.'),
      T('Qayıdan topa reaksiya ver — tuta bilmirsənsə, yolunu kəs.', 'React to the rebound — if you can’t catch it, block it.'),
    ],
    caption: T('20 təkrar, 3 dəst.', '20 reps, 3 sets.'),
  },
  'gk-diving-01': {
    view: 'blank',
    zones: [{ x: 58, y: 18, w: 30, h: 30, kind: 'space' }],
    markers: [{ id: 'gk', x: 46, y: 33, kind: 'keeper', label: 'GK' }],
    paths: [
      { from: 'gk', to: { x: 70, y: 33 }, kind: 'run' },
      { from: 'gk', to: { x: 46, y: 33 }, kind: 'run' },
    ],
    beats: [
      T('Yumşaq səthə yana düş: əvvəl bud, sonra çiyin.', 'Fall sideways onto the soft surface: hip first, then shoulder.'),
      T('Diz üstə qayıt. Hər tərəfə 10 təkrar.', 'Back to your knees. Ten each side.'),
    ],
    caption: T('Yalnız yumşaq səthdə — yataq və ya döşək.', 'Only onto something soft — a bed or a mattress.'),
  },
  'gk-distribution-01': {
    view: 'half',
    markers: [
      { id: 'gk', x: 8, y: 32, kind: 'keeper', label: 'GK' },
      { id: 'p', x: 44, y: 32, kind: 'player' },
      { id: 'b', x: 11, y: 32, kind: 'ball' },
    ],
    paths: [
      { from: { x: 11, y: 32 }, to: { x: 41, y: 33 }, kind: 'pass' },
      { from: { x: 41, y: 33 }, to: { x: 11, y: 31 }, kind: 'pass' },
      { from: { x: 11, y: 31 }, to: { x: 41, y: 31 }, kind: 'pass' },
    ],
    beats: [
      T('Topu yerlə yuvarlayaraq partnyorun ayağına çatdır.', 'Roll it along the ground to your partner’s feet.'),
      T('Partnyor topu geri qaytarır.', 'Your partner sends it back.'),
      T('İndi çiyin üstündən at.', 'Now throw it overarm.'),
    ],
    caption: T('Partnyor 15 addım aralıda. Hər növdən 15 təkrar.', 'Partner 15 steps away. Fifteen of each.'),
  },
  'gk-angles-01': {
    view: 'goal-area',
    markers: [
      { id: 'c1', x: 24, y: 24, kind: 'cone' },
      { id: 'c2', x: 34, y: 34, kind: 'cone' },
      { id: 'c3', x: 50, y: 38, kind: 'cone' },
      { id: 'c4', x: 66, y: 34, kind: 'cone' },
      { id: 'c5', x: 76, y: 24, kind: 'cone' },
      { id: 'gk', x: 50, y: 12, kind: 'keeper', label: 'GK' },
      { id: 's', x: 26, y: 28, kind: 'player' },
      { id: 'b', x: 28.5, y: 26.5, kind: 'ball' },
    ],
    paths: [
      { from: 'gk', to: { x: 43, y: 12 }, kind: 'run' },
      { from: { x: 28.5, y: 26.5 }, to: { x: 44, y: 13 }, kind: 'shot' },
      { from: { x: 44, y: 13 }, to: { x: 50, y: 39 }, kind: 'pass', at: 2 },
      { from: 's', to: { x: 50, y: 42 }, kind: 'run', at: 2 },
      { from: 'gk', to: { x: 50, y: 14 }, kind: 'run', at: 2 },
      { from: { x: 50, y: 39 }, to: { x: 50, y: 15 }, kind: 'shot', at: 3 },
    ],
    beats: [
      T('Zərbədən əvvəl mövqeyini top ilə qapının ortası arasında qur.', 'Before the shot, set yourself between the ball and the middle of the goal.'),
      T('Partnyor vurur — sən artıq yerindəsən.', 'Your partner shoots — you’re already set.'),
      T('Növbəti konus: hər zərbədən əvvəl yenidən düzəl.', 'Next cone: re-set before every shot.'),
      T('Mərkəzdən zərbə — mərkəzdə qal.', 'Shot from the centre — stay central.'),
    ],
    caption: T('5 konus yarımdairədə. 2 dövrə.', 'Five cones in a half-circle. Two rounds.'),
  },
  'field-passing-01': {
    view: 'blank',
    zones: [WALL],
    markers: [
      { id: 'p', x: 50, y: 52, kind: 'player' },
      { id: 'b', x: 50, y: 48, kind: 'ball' },
    ],
    paths: [
      { from: { x: 50, y: 48 }, to: { x: 44, y: 10 }, kind: 'pass' },
      { from: { x: 44, y: 10 }, to: { x: 50, y: 48 }, kind: 'pass' },
      { from: { x: 50, y: 48 }, to: { x: 56, y: 10 }, kind: 'pass' },
      { from: { x: 56, y: 10 }, to: { x: 50, y: 48 }, kind: 'pass' },
    ],
    beats: [
      T('Ayağın içi ilə divara ötür.', 'Pass at the wall with the inside of your foot.'),
      T('Qayıdan topu bir toxunuşla dayandır.', 'Stop the return with one touch.'),
      T('İndi o biri ayaqla.', 'Now with the other foot.'),
      T('Yenə bir toxunuş. 40 təkrar.', 'One touch again. Forty reps.'),
    ],
    caption: T('Divardan 5 addım aralı.', 'Five steps from the wall.'),
  },
  'fitness-agility-01': {
    view: 'blank',
    markers: [
      { id: 'c1', x: 30, y: 30, kind: 'cone' },
      { id: 'c2', x: 40, y: 30, kind: 'cone' },
      { id: 'c3', x: 50, y: 30, kind: 'cone' },
      { id: 'c4', x: 60, y: 30, kind: 'cone' },
      { id: 'c5', x: 70, y: 30, kind: 'cone' },
      { id: 'p', x: 24, y: 40, kind: 'player' },
    ],
    paths: [
      { from: 'p', to: { x: 76, y: 40 }, kind: 'run' },
      { from: 'p', to: { x: 24, y: 40 }, kind: 'run' },
    ],
    beats: [
      T('Konuslar boyunca yan addımlarla keç.', 'Side-step along the cones.'),
      T('Və geri. Hər dövrədən sonra 30 saniyə fasilə.', 'And back. Rest 30 seconds after each round.'),
    ],
    caption: T('5 konus, 2 addım aralı. 6 dövrə.', 'Five cones, two steps apart. Six rounds.'),
  },
  'field-wallvolley-01': {
    view: 'blank',
    zones: [WALL],
    markers: [
      { id: 'p', x: 50, y: 52, kind: 'player' },
      { id: 'b', x: 50, y: 48, kind: 'ball' },
    ],
    paths: [
      { from: { x: 50, y: 48 }, to: { x: 50, y: 40 }, kind: 'pass' },
      { from: { x: 50, y: 40 }, to: { x: 50, y: 10 }, kind: 'shot' },
      { from: { x: 50, y: 10 }, to: { x: 50, y: 48 }, kind: 'pass' },
    ],
    beats: [
      T('Topu özünə at.', 'Toss the ball to yourself.'),
      T('Yerə dəymədən divara vur.', 'Volley it at the wall before it bounces.'),
      T('Qayıdan topu tut və təkrarla.', 'Catch the return and go again.'),
    ],
    caption: T('Hər ayaqla 15 təkrar.', 'Fifteen with each foot.'),
  },
  'group-rondo-01': {
    view: 'blank',
    markers: [
      { id: 'k1', x: 32, y: 14, kind: 'cone' },
      { id: 'k2', x: 68, y: 14, kind: 'cone' },
      { id: 'k3', x: 68, y: 50, kind: 'cone' },
      { id: 'k4', x: 32, y: 50, kind: 'cone' },
      { id: 'a', x: 50, y: 12, kind: 'player' },
      { id: 'r', x: 71, y: 32, kind: 'player' },
      { id: 'l', x: 29, y: 32, kind: 'player' },
      { id: 'd', x: 50, y: 32, kind: 'opponent' },
      { id: 'b', x: 50, y: 16, kind: 'ball' },
    ],
    paths: [
      { from: { x: 50, y: 16 }, to: { x: 67, y: 31 }, kind: 'pass', at: 0 },
      { from: 'd', to: { x: 60, y: 37 }, kind: 'run', at: 0 },
      { from: { x: 67, y: 31 }, to: { x: 50, y: 16 }, kind: 'pass', at: 1 },
      { from: 'd', to: { x: 56, y: 31 }, kind: 'run', at: 1 },
      { from: { x: 50, y: 16 }, to: { x: 33, y: 31 }, kind: 'pass', at: 2 },
      { from: 'd', to: { x: 43, y: 37 }, kind: 'run', at: 2 },
    ],
    beats: [
      T('Ortadakından uzaq tərəfə ötür.', 'Pass away from the player in the middle.'),
      T('O yaxınlaşır — topu geri ver.', 'She closes in — play it back.'),
      T('Boş tərəfə keçir. Topu itirən içəri keçir.', 'Switch to the open side. Lose it and you go in the middle.'),
    ],
    caption: T('4 konusla kvadrat. Üç kənarda, bir içəridə.', 'A square of four cones. Three outside, one inside.'),
  },
};

const LESSONS = {
  'gk-footwork-01': {
    view: 'goal-area',
    markers: [{ id: 'gk', x: 50, y: 14, kind: 'keeper', label: 'GK' }],
    paths: [
      { from: 'gk', to: { x: 60, y: 14 }, kind: 'run' },
      { from: 'gk', to: { x: 42, y: 14 }, kind: 'run' },
    ],
    beats: [
      T('Kiçik, tez addımlar — ayaqlar kəsişmir.', 'Small, quick steps — feet never cross.'),
      T('Böyük addım tarazlığı aparır.', 'A big step costs you your balance.'),
    ],
    caption: T('Yan hərəkət qapı xətti boyunca.', 'Moving sideways along the goal line.'),
  },
  'gk-distribution-01': {
    view: 'half',
    markers: [
      { id: 'gk', x: 8, y: 32, kind: 'keeper', label: 'GK' },
      { id: 'fb', x: 24, y: 10, kind: 'player' },
      { id: 'f', x: 70, y: 32, kind: 'player' },
      { id: 'o', x: 50, y: 30, kind: 'opponent' },
      { id: 'b', x: 11, y: 32, kind: 'ball' },
    ],
    paths: [
      { from: { x: 11, y: 32 }, to: { x: 67, y: 32 }, kind: 'pass', actor: null },
      { from: { x: 11, y: 32 }, to: { x: 22, y: 12 }, kind: 'pass' },
    ],
    beats: [
      T('Uzaq və mərkəzdən: riskli.', 'Long and through the middle: risky.'),
      T('Yaxın və yan tərəfə: təhlükəsiz.', 'Short and wide: safe.'),
    ],
    caption: T('Topu tutan kimi baş qaldır.', 'Head up as soon as you have the ball.'),
  },
  'gk-1v1-01': {
    view: 'goal-area',
    markers: [
      { id: 'gk', x: 50, y: 10, kind: 'keeper', label: 'GK' },
      { id: 's', x: 50, y: 54, kind: 'opponent' },
      { id: 'b', x: 50, y: 50, kind: 'ball' },
    ],
    paths: [
      { from: 's', to: { x: 50, y: 38 }, kind: 'dribble', at: 0 },
      { from: 'gk', to: { x: 50, y: 24 }, kind: 'run', at: 0 },
      { from: { x: 50, y: 35 }, to: { x: 50, y: 26 }, kind: 'shot', at: 1 },
    ],
    beats: [
      T('Erkən çıx — məsafəni qısalt.', 'Come out early — close the distance.'),
      T('Böyük ol, gec yerə düş. Qərarı hücumçu versin.', 'Stay big, go down late. Make the striker decide.'),
    ],
    caption: T('Təkbətək: işin hücumçunu səhvə məcbur etməkdir.', 'One-v-one: your job is to force the mistake.'),
  },
  'pos-centreback-01': {
    view: 'half',
    markers: [
      { id: 'cb1', x: 18, y: 26, kind: 'player', label: 'CB' },
      { id: 'cb2', x: 18, y: 40, kind: 'player', label: 'CB' },
      { id: 's', x: 36, y: 28, kind: 'opponent' },
      { id: 'b', x: 39, y: 28, kind: 'ball' },
    ],
    paths: [
      { from: 'cb1', to: { x: 30, y: 28 }, kind: 'run', at: 0 },
      { from: 'cb2', to: { x: 14, y: 31 }, kind: 'run', at: 0 },
    ],
    beats: [
      T('Biri hücumçuya çıxır, o biri arxanı örtür.', 'One steps out to the attacker; the other covers behind.'),
    ],
    caption: T('Mərkəz müdafiəçiləri cüt işləyir.', 'Centre-backs work in pairs.'),
  },
  'pos-fullback-01': {
    view: 'full',
    markers: [{ id: 'fb', x: 20, y: 9, kind: 'player', label: 'FB' }],
    paths: [
      { from: 'fb', to: { x: 66, y: 8 }, kind: 'run' },
      { from: 'fb', to: { x: 20, y: 9 }, kind: 'run' },
    ],
    beats: [
      T('Yan xətt boyunca hücuma qalx.', 'Up the touchline to attack.'),
      T('Və geri — müdafiəyə.', 'And back to defend.'),
    ],
    caption: T('Ən çox qaçan mövqelərdən biri.', 'One of the positions that runs the most.'),
  },
  'pos-midfielder-01': {
    view: 'full',
    markers: [
      { id: 'cb', x: 24, y: 34, kind: 'player' },
      { id: 'cm', x: 50, y: 36, kind: 'player', label: 'CM' },
      { id: 'o', x: 56, y: 40, kind: 'opponent' },
      { id: 'f', x: 78, y: 20, kind: 'player' },
      { id: 'b', x: 27, y: 34, kind: 'ball' },
    ],
    paths: [
      { from: 'cm', to: { x: 48, y: 25 }, kind: 'run' },
      { from: { x: 27, y: 34 }, to: { x: 46, y: 26 }, kind: 'pass' },
      { from: { x: 46, y: 26 }, to: { x: 75, y: 21 }, kind: 'pass' },
    ],
    beats: [
      T('Topu almazdan əvvəl boş sahəyə keç.', 'Move into space before the ball comes.'),
      T('Topu boş yerdə al.', 'Receive it in space.'),
      T('Sadə ötürmə — çox vaxt ən yaxşısı.', 'The simple pass — usually the best one.'),
    ],
    caption: T('Topsuz hərəkət topla hərəkət qədər vacibdir.', 'Moving without the ball matters as much as with it.'),
  },
  'pos-winger-01': {
    view: 'half',
    markers: [
      { id: 'w', x: 62, y: 8, kind: 'player', label: 'W' },
      { id: 'b', x: 59, y: 8, kind: 'ball' },
      { id: 'd', x: 40, y: 16, kind: 'opponent' },
      { id: 's', x: 30, y: 36, kind: 'player' },
    ],
    paths: [
      { from: 'w', to: { x: 30, y: 8 }, kind: 'dribble', at: 0 },
      { from: 's', to: { x: 18, y: 30 }, kind: 'run', at: 1 },
      { from: { x: 27, y: 8 }, to: { x: 19, y: 29 }, kind: 'pass', at: 1 },
    ],
    beats: [
      T('Enə yayıl — müdafiəni dart.', 'Stay wide — stretch the defence.'),
      T('Baş qaldır və ən yaxşı seçimi tap.', 'Head up — find the best option.'),
    ],
    caption: T('Cinah hücumçusu meydanın enini istifadə edir.', 'The winger uses the width of the pitch.'),
  },
  'pos-striker-01': {
    view: 'half',
    markers: [
      { id: 'gk', x: 6, y: 32, kind: 'keeper', label: 'GK' },
      { id: 'd', x: 20, y: 30, kind: 'opponent' },
      { id: 'st', x: 26, y: 40, kind: 'player', label: 'ST' },
      { id: 'm', x: 52, y: 26, kind: 'player' },
      { id: 'b', x: 49, y: 26, kind: 'ball' },
    ],
    paths: [
      { from: 'st', to: { x: 15, y: 37 }, kind: 'run' },
      { from: { x: 49, y: 26 }, to: { x: 17, y: 36 }, kind: 'pass' },
      { from: { x: 15, y: 35 }, to: { x: 3, y: 27 }, kind: 'shot' },
    ],
    beats: [
      T('Müdafiəçinin kor nöqtəsinə — çiyninin arxasına keç.', 'Drift into the defender’s blind spot, behind her shoulder.'),
      T('Top onun görmədiyi yerə gəlir.', 'The ball arrives where she can’t see you.'),
      T('Qapıçının yerinə bax — sonra vur.', 'Check where the keeper is — then shoot.'),
    ],
    caption: T('Hücumçu qol vəziyyəti yaratmaq üçün hərəkət edir.', 'A striker moves to create the chance.'),
  },
};

const apply = (items, table, label) => {
  let n = 0;
  for (const it of items) {
    const d = table[it.id];
    if (d && !it.diagram) {
      it.diagram = d;
      n++;
    }
  }
  console.log(`${label}: added ${n}`);
};

const drillsPath = join(C, 'drills.json');
const drills = JSON.parse(readFileSync(drillsPath, 'utf8'));
apply(drills, DRILLS, 'drills');
writeFileSync(drillsPath, JSON.stringify(drills, null, 2) + '\n');

for (const f of ['goalkeeper', 'positions']) {
  const p = join(C, 'lessons', `${f}.json`);
  const ls = JSON.parse(readFileSync(p, 'utf8'));
  apply(ls, LESSONS, f);
  writeFileSync(p, JSON.stringify(ls, null, 2) + '\n');
}
