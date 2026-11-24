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
// Zusätzliche/korrigierte Termine (z. B. aus OneDrive oder Meldungen): tools/extra-exams.json, gleiche Felder, gleiche id = ersetzt
const XP=path.join(__dirname,'extra-exams.json');
if(fs.existsSync(XP)){for(const x of JSON.parse(fs.readFileSync(XP,'utf8'))){if(x.date<TODAY)continue;const i=exams.findIndex(e=>e.id===x.id);const v=Object.assign({time:null,topics:[],material:[],unsure:false},i>=0?exams[i]:{},x);if(x.remove){if(i>=0)exams.splice(i,1);continue}if(i>=0)exams[i]=v;else exams.push(v)}}
exams.sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
// Theorie: welche Lesestoffe zu welcher Prüfung gehören, steht in tools/theory-map.json
const TMAP=JSON.parse(fs.readFileSync(path.join(__dirname,'theory-map.json'),'utf8'));
const theory={};
for(const e of exams){const list=(TMAP[e.id]||[]).map(id=>D.readings[id]).filter(Boolean).map(r=>({title:r.title,source:(r.source||'').replace(/\s*\(von [^)]*\)/,''),html:r.html}));
  if(list.length)theory[e.id]=list}
const games={};for(const e of exams){const g={};for(const k of ['quiz','pairs','decks','cloze','order']){if(D[k]&&D[k][e.id])g[k]=D[k][e.id].filter(Boolean)}if(Object.keys(g).length)games[e.id]=g}
const extra=fs.existsSync(path.join(__dirname,'extra.json'))?JSON.parse(fs.readFileSync(path.join(__dirname,'extra.json'),'utf8')):{};
const VP=path.join(__dirname,'videos.json');const videos=fs.existsSync(VP)?JSON.parse(fs.readFileSync(VP,'utf8')):{};
const HUB=Object.assign({updated:TODAY,subjects,exams,games,theory,videos},extra);
const js='/* BM2 Hustle – Daten (automatisch erzeugt mit tools/build-hub-data.js) */\nwindow.HUB='+JSON.stringify(HUB).replace(/</g,'\\u003c')+';\n';
fs.writeFileSync(path.join(__dirname,'..','hub-data.js'),js);
console.log('hub-data.js:',exams.length,'Termine,',Object.keys(games).length,'mit Übungen,',Object.keys(theory).length,'mit Theorie');

// ---------- Kalender-Abo: calendar.ics (alle Termine, Erinnerung am Vortag) ----------
const icsEsc=s=>String(s).replace(/\\/g,'\\\\').replace(/;/g,'\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');
const fold=l=>{const out=[];let s=l;while(Buffer.byteLength(s)>74){let n=74;while(Buffer.byteLength(s.slice(0,n))>74)n--;out.push(s.slice(0,n));s=' '+s.slice(n)}out.push(s);return out.join('\r\n')};
const d8=s=>s.replace(/-/g,'');
const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
const addDay=s=>{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10)};
const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//BM2 Hustle//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:BM2 Hustle Prüfungen','X-WR-TIMEZONE:Europe/Zurich','REFRESH-INTERVAL;VALUE=DURATION:PT6H','X-PUBLISHED-TTL:PT6H',
'BEGIN:VTIMEZONE','TZID:Europe/Zurich','BEGIN:DAYLIGHT','TZOFFSETFROM:+0100','TZOFFSETTO:+0200','TZNAME:CEST','DTSTART:19700329T020000','RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU','END:DAYLIGHT','BEGIN:STANDARD','TZOFFSETFROM:+0200','TZOFFSETTO:+0100','TZNAME:CET','DTSTART:19701025T030000','RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU','END:STANDARD','END:VTIMEZONE'];
for(const e of exams){const subj=(subjects[e.subj]||{name:e.subj}).name;const test=e.type!=='Hausaufgabe'&&e.type!=='Abgabe';
  const kind=test?'Prüfung':e.type;
  L.push('BEGIN:VEVENT','UID:'+e.id+'@bm2hustle.github.io','DTSTAMP:'+stamp);
  if(e.time){const[h,m]=e.time.split(':').map(Number);const end=new Date(Date.UTC(2000,0,1,h,m+(test?90:45)));
    L.push('DTSTART;TZID=Europe/Zurich:'+d8(e.date)+'T'+String(h).padStart(2,'0')+String(m).padStart(2,'0')+'00','DTEND;TZID=Europe/Zurich:'+d8(e.date)+'T'+String(end.getUTCHours()).padStart(2,'0')+String(end.getUTCMinutes()).padStart(2,'0')+'00')}
  else L.push('DTSTART;VALUE=DATE:'+d8(e.date),'DTEND;VALUE=DATE:'+d8(addDay(e.date)));
  L.push(fold('SUMMARY:'+icsEsc((test?'📝 ':'🏠 ')+subj+': '+e.title)),fold('DESCRIPTION:'+icsEsc(kind+(e.topics.length?'\nStoff:\n- '+e.topics.join('\n- '):'')+'\n\nLernen: https://bm2hustle.github.io/#fach-'+e.id)),'URL:https://bm2hustle.github.io/#fach-'+e.id);
  if(test)L.push('BEGIN:VALARM','ACTION:DISPLAY',fold('DESCRIPTION:'+icsEsc('Morgen: '+subj+' '+kind)),'TRIGGER:-P1D','END:VALARM');
  L.push('END:VEVENT')}
L.push('END:VCALENDAR');
fs.writeFileSync(path.join(__dirname,'..','calendar.ics'),L.join('\r\n')+'\r\n');
console.log('calendar.ics:',exams.length,'Termine');
