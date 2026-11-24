// Baut hub-data.js aus dem persönlichen Lern-Dashboard (data.js + spiele.js).
// Aufruf: node tools/build-hub-data.js <data.js> <spiele.js> [YYYY-MM-DD]
// Entfernt alles Persönliche (Noten, Training, Lernplan, Dateipfade).
const fs=require('fs'),vm=require('vm'),path=require('path');
const [dataP,spieleP,today]=process.argv.slice(2);
const TODAY=today||new Date().toISOString().slice(0,10);
const c={console};c.window=c;vm.createContext(c);
vm.runInContext(fs.readFileSync(dataP,'utf8')+';'+fs.readFileSync(spieleP,'utf8')+';this.D=DATA',c);
const D=c.D;
const S={DEU:['Deutsch','#ffb8b0','#c0392b'],ENG:['Englisch','#bcd8ff','#2563eb'],FRA:['Französisch','#dccbff','#7c3aed'],MAT:['Mathematik','#ffcf99','#d9730d'],WR:['Wirtschaft & Recht','#a9dcb3','#1f7a3e'],GP:['Geschichte & Politik','#e6cba8','#8a5a2b'],BIO:['Biologie','#d6f5a6','#5d9c0f'],CP:['Chemie/Physik','#aaeee6','#0f9488'],SOZ:['Soziologie','#fff09a','#b7950b'],PSY:['Psychologie/Philo','#fff09a','#b7950b'],IDPA:['IDPA','#e4e4e4','#666']};
const subjects=Object.fromEntries(Object.entries(S).map(([k,[n,c,i]])=>[k,{name:n,c,ink:i}]));
const base=s=>String(s).split('/').pop().replace(/^…/,'').trim();
const exams=D.exams.filter(e=>e.date>=TODAY).map(e=>({id:e.id,subj:e.subj,date:e.date,time:e.time||null,type:e.type==='Termin'?'Hausaufgabe':e.type,title:e.title.replace(/ ✅.*$/,''),topics:e.topics||[],material:(e.material||[]).map(base).filter(m=>!/Lesestoff im Dashboard|Dashboard/.test(m)),unsure:!!e.unsure}));
// Theorie: welche Lesestoffe zu welcher Prüfung gehören, steht in tools/theory-map.json
const TMAP=JSON.parse(fs.readFileSync(path.join(__dirname,'theory-map.json'),'utf8'));
const theory={};
for(const e of exams){const list=(TMAP[e.id]||[]).map(id=>D.readings[id]).filter(Boolean).map(r=>({title:r.title,source:(r.source||'').replace(/\s*\(von [^)]*\)/,''),html:r.html}));
  if(list.length)theory[e.id]=list}
const games={};for(const e of exams){const g={};for(const k of ['quiz','pairs','decks','cloze','order']){if(D[k]&&D[k][e.id])g[k]=D[k][e.id].filter(Boolean)}if(Object.keys(g).length)games[e.id]=g}
const extra=fs.existsSync(path.join(__dirname,'extra.json'))?JSON.parse(fs.readFileSync(path.join(__dirname,'extra.json'),'utf8')):{};
const HUB=Object.assign({updated:TODAY,subjects,exams,games,theory},extra);
const js='/* BM2 Hustle – Daten (automatisch erzeugt mit tools/build-hub-data.js) */\nwindow.HUB='+JSON.stringify(HUB).replace(/</g,'\\u003c')+';\n';
fs.writeFileSync(path.join(__dirname,'..','hub-data.js'),js);
console.log('hub-data.js:',exams.length,'Termine,',Object.keys(games).length,'mit Übungen,',Object.keys(theory).length,'mit Theorie');
