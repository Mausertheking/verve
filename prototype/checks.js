// Minimal DOM stub so the prototype's script can load in node and be exercised.
const store={};
global.localStorage={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>store[k]=v};
const mk=()=>({innerHTML:'',scrollTop:0,classList:{add(){},remove(){},contains:()=>false},
  addEventListener(){},focus(){},setSelectionRange(){},value:'',dataset:{}});
const nodes={};
global.document={getElementById:id=>nodes[id]||(nodes[id]=mk()),addEventListener(){},};

const src=require('fs').readFileSync(process.env.V || '/tmp/v.js','utf8');
// expose internals for testing
eval(src + `
global._x = {t,tl,richText,drillMatches,filters,DRILLS,LESSONS,GLOSSARY,QUIZZES,TRACKS,CLUBS,
  PitchDiagram,VideoSlot,contentStats,setLocale:v=>{locale=v},getLocale:()=>locale,UI};
`);
const x=global._x;
let fail=0;
const eq=(name,a,b)=>{const ok=JSON.stringify(a)===JSON.stringify(b);
  if(!ok){fail++;console.log('FAIL',name,'\n  got:',JSON.stringify(a),'\n  want:',JSON.stringify(b));}
  else console.log('ok  ',name);};

// --- content integrity ---
const s=x.contentStats();
eq('lessons count',s.lessons,20);
eq('drills count',s.drills,12);
eq('clubs empty (policy)',x.CLUBS.length,0);
eq('nothing marked reviewed',s.reviewed,0);

// every rules lesson is a TODO stub, never invented text
const rules=x.LESSONS.filter(l=>l.trackId==='rules');
eq('all rules lessons are todo',rules.every(l=>l.status==='todo'),true);

// every glossary term has all three languages
eq('glossary trilingual',x.GLOSSARY.every(g=>g.term.az&&g.term.ru&&g.term.en),true);

// every glossary id referenced by a lesson actually exists
const ids=new Set(x.GLOSSARY.map(g=>g.id));
const refs=[...x.LESSONS,...x.DRILLS].flatMap(o=>o.glossaryTermIds||[]);
eq('no dangling glossary refs',refs.filter(r=>!ids.has(r)),[]);

// every [[term|label]] in body/steps resolves
const markup=[];
for(const o of [...x.LESSONS,...x.DRILLS])
  for(const f of ['body','steps','takeaways','whatGoodLooksLike'])
    for(const L of ['az','ru','en'])
      for(const line of ((o[f]||{})[L]||[]))
        for(const m of line.matchAll(/\[\[([a-z0-9-]+)\|/gi)) markup.push(m[1]);
eq('no dangling inline terms',markup.filter(r=>!ids.has(r)),[]);

// quiz answers point at real options and real lessons
const gk=x.QUIZZES.find(q=>q.id==='quiz-goalkeeper');
eq('quiz has 5 questions',gk.questions.length,5);
eq('correct ids valid',gk.questions.every(q=>q.options.some(o=>o.id===q.correctOptionId)),true);
eq('revise lessons exist',gk.questions.every(q=>!q.reviseLessonId||x.LESSONS.some(l=>l.id===q.reviseLessonId)),true);

// --- locale fallback ---
x.setLocale('ru');
eq('ru body falls back to az',x.tl(x.LESSONS.find(l=>l.id==='pos-fullback-01').body)[0].slice(0,14),'Cinah müdafiəç');
eq('ru used when present',x.t(x.TRACKS[0].title),'Правила игры');
x.setLocale('en');
eq('en used when present',x.t(x.TRACKS[0].title),'Rules of the game');
x.setLocale('az');

// --- glossary markup rendering ---
const r=x.richText('əllər [[w-shape|W forması]] yaradır');
eq('markup becomes tappable',/data-term="w-shape"/.test(r)&&/W forması/.test(r),true);
eq('markup leaves no brackets',/\[\[/.test(r),false);

// --- filters ---
const F=x.filters;
const reset=()=>{F.positions.length=0;F.equipment.length=0;F.space.length=0;F.group.length=0;F.time.length=0;};
const count=()=>x.DRILLS.filter(x.drillMatches).length;
reset(); eq('no filters = all drills',count(),12);
reset(); F.space.push('bedroom'); F.equipment.push('none');
eq('bedroom + no equipment',x.DRILLS.filter(x.drillMatches).map(d=>d.id),
   ['gk-stance-drill-01','gk-footwork-01','gk-diving-01']);
reset(); F.positions.push('goalkeeper');
eq('goalkeeper drills',count(),9);  // 7 gk-specific + 2 tagged 'any'
reset(); F.equipment.push('ball'); F.equipment.push('wall');
eq('ball+wall never returns a drill needing cones',
   x.DRILLS.filter(x.drillMatches).every(d=>!d.equipment.includes('cones')),true);
reset(); F.time.push('s');
eq('short drills are all <=8min',x.DRILLS.filter(x.drillMatches).every(d=>d.minutes<=8),true);
reset(); F.space.push('bedroom'); F.equipment.push('partner');
eq('capability semantics: having a partner still shows no-kit bedroom drills',count(),3);
reset(); F.space.push('half-pitch'); F.equipment.push('none');
eq('half pitch with nothing = genuinely empty',count(),0);
reset();

// --- video slot layout contract ---
const withVid=x.LESSONS.find(l=>l.video);
const empty=x.VideoSlot(null), filled=x.VideoSlot(withVid.video);
eq('both states use the same 16:9 container',
   empty.startsWith('<div class="vslot">')&&filled.startsWith('<div class="vslot">'),true);
eq('placeholder shows localized copy',/Video tezliklə/.test(empty),true);

// --- diagram ---
const d=x.PitchDiagram(x.LESSONS.find(l=>l.id==='gk-angles-01').diagram);
eq('diagram renders svg',/<svg viewBox="0 0 100 65"/.test(d),true);
eq('diagram has no raster',/<image|\.png|\.jpg/.test(d),false);

console.log(fail?`\n${fail} FAILED`:'\nall passed');
process.exit(fail?1:0);
