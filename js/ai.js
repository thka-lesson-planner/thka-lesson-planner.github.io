/* Copyright (c) 2026 Joaquin Ruby and Athena Gilbertson. All rights reserved. DO NOT REMOVE. */
/* The Claude AI helper (through the planner's relay), its answer format, and the Plan it! / Plan the week / Plan the month / wand planners. */
// ---------- AI helper: Claude (by Anthropic) through the planner's own relay, or no AI ----------
// The page never holds the API key. It sends prompts to the relay (worker/ folder), which adds the key
// on the server and streams Claude's answer back. Set the relay's address in js/config.js.
var AI={busy:false,stop:false,active:null,loading:null,tag:"",cur:null,waiters:[],lastSec:0};
var SYS2="You are a warm, creative early-childhood teacher at Treehouse Kids Academy in Idaho. You rewrite classroom activities so they are cute, memorable, safe and cheap. Keep everything SHORT.\n"+
"Answer in EXACTLY this format, one label per line, with nothing else:\n"+
"TITLE: cute title, 6 words or fewer\nSUMMARY: one short sentence\nMATERIALS: item; item; item\nSTEPS: step | step | step\nAGE TIP: one short sentence on adapting for younger or older children, never about money\nCOST: like About $3\nSTANDARDS: two or three codes from LL, MA, SC, PH, CA, SE, AL\n"+
"(LL language/literacy, MA math, SC science, PH physical, CA creative arts, SE social-emotional, AL approaches to learning. Pick what the activity really teaches.)\n"+
"Rules: match the child's age; cheap household or recycled items only; exactly 3 short steps of under 15 words each; under age 3 no small parts or choking hazards; no children's names.\n"+
"SAFETY: an adult is always with the children. Never include fire or heat, sharp tools, chemicals or cleaners, jumping or climbing from heights, deep water, bags or strings near faces, or children eating grapes, nuts, popcorn, hard candy or hot dogs. Use only safe, taste-safe or pretend materials.";
function say(t){var m=$("msg");m.textContent=t;m.classList.toggle("cancelled",String(t).indexOf("\u23F9")===0);var e=$("edmsg");if(e)e.textContent=t;var f=$("sg-msg");if(f)f.textContent=t;}
// Cancel feedback: a highlighted "Cancelled" message that stays until the next message
function noteCancel(t){say("\u23F9\uFE0F "+t);}
// Wait for a promise, but give up right away if the teacher presses Stop (the work carries on quietly in the background)
function untilCancel(p){return new Promise(function(res){var done=false,w=function(){if(!done){done=true;res({ok:false,cancelled:true,note:""});}};AI.waiters.push(w);
  p.then(function(v){if(!done){done=true;res(v);}},function(){if(!done){done=true;res({ok:false,note:""});}});});}
function status(ok,t){var s=$("st");s.className="st"+(ok===true?" ok":ok===false?" no":"");s.textContent=t;}
function budget(){var b=parseFloat($("bud").value);return b>0?b:45;}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
function friendly(e){var m=String(e&&e.message?e.message:e||"");
  if(/Failed to fetch|NetworkError|Load failed|network|ERR_/i.test(m))return navigator.onLine===false?"this device is offline":"the AI service couldn’t be reached, so check the internet connection";
  return m.replace(/\s+/g," ").slice(0,160)||"unknown problem";}
function relayUrl(){return typeof CLAUDE_RELAY_URL==="string"&&/^https:\/\//.test(CLAUDE_RELAY_URL)?CLAUDE_RELAY_URL:"";}
function engReady(){return $("eng").value==="claude"&&!!relayUrl();}
function engCached(){return engReady();}
function refresh(){
  var e=$("eng").value,sc=$("pol").value;
  write("tka:eng",e);$("polrow").hidden=$("pm").hidden=e==="bank";
  $("pm").textContent="✨ Make "+(sc==="next"?"next week":sc==="month"?"this month":"this week")+" more imaginative";
  if(e==="bank"){status(true,"● No AI needed");
    $("wnote").textContent="Uses the built-in activity bank only: instant, free, and works on every device.";}
  else if(engReady()){status(true,"● Claude AI ready");
    $("wnote").textContent="Activities are written by Claude, an AI from Anthropic, over the internet. Your idea and the activity text are sent to Claude; your planners stay in this browser.";}
  else{status(false,"● Claude AI not connected");
    $("wnote").textContent="The Claude AI hasn’t been connected to this site yet, so the built-in activity bank is used for now.";}
  $("go").textContent="Plan it!";tech();}
function tech(){var el=$("tech");if(!el)return;
  el.innerHTML="AI model: <b>Claude Opus 5.5</b> (Anthropic), through this site’s relay<br>Relay connected: <b>"+(relayUrl()?"yes":"no")+"</b><br>Internet: <b>"+(navigator.onLine===false?"offline":"online")+"</b>";}
// Returns {ok, note}. Never throws.
function ensureAI(){
  var e=$("eng").value;
  if(e==="bank")return Promise.resolve({ok:false,note:""});
  if(!relayUrl())return Promise.resolve({ok:false,note:"The Claude AI isn’t connected to this site yet. The built-in activity bank still works."});
  if(navigator.onLine===false)return Promise.resolve({ok:false,note:"This device is offline, so Claude can’t be reached. The built-in activity bank still works."});
  return Promise.resolve({ok:true,note:""});}
// Ask Claude through the relay and stream the answer. onText(textSoFar) is called as words arrive (and once a
// second while Claude is thinking), abortIf(textSoFar) can stop a draft early, and Stop / time limits cancel it.
async function aiGen(msgs,o){
  o=o||{};var acc="",sys="",rest=[];
  msgs.forEach(function(m){if(m.role==="system")sys+=(sys?"\n\n":"")+m.content;else rest.push({role:m.role,content:String(m.content)});});
  var ctl=new AbortController(),tok={c:false,fire:function(){try{ctl.abort();}catch(e){}}};AI.cur=tok;
  var tick=setInterval(function(){if(o.onText&&!tok.c){try{o.onText(acc);}catch(e){}}},1000);
  try{
    var res=await fetch(relayUrl(),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system:sys,messages:rest,max:o.max||300}),signal:ctl.signal,cache:"no-store"});
    if(!res.ok){var er="";try{er=(await res.json()).error;}catch(x){}throw new Error(er||"the AI service answered with error "+res.status);}
    var rd=res.body.getReader(),dec=new TextDecoder(),buf="",stop="";
    while(true){
      var r=await rd.read();if(r.done)break;buf+=dec.decode(r.value,{stream:true});
      var nl;while((nl=buf.indexOf("\n"))>=0){var line=buf.slice(0,nl).trim();buf=buf.slice(nl+1);if(!line)continue;
        var ev;try{ev=JSON.parse(line);}catch(x){continue;}
        if(typeof ev.t==="string"){acc+=ev.t;if(o.onText&&!tok.c)o.onText(acc);if(o.abortIf&&o.abortIf(acc))tok.fire();}
        else if(ev.error)throw new Error(ev.error);
        else if(ev.done)stop=String(ev.stop||"");}
      if(tok.c||AI.stop){tok.fire();break;}}
    if(stop==="refusal"){AI.lastWhy="Claude declined to write it";return "";}
    return acc;
  }catch(e){if(tok.c||AI.stop||(e&&e.name==="AbortError"))return acc;throw new Error(friendly(e));}
  finally{clearInterval(tick);if(AI.cur===tok)AI.cur=null;}}
// ---------- Labeled-line format (easy for small models) ----------
function toLab(a){return "TITLE: "+(a.title||"")+"\nSUMMARY: "+(a.summary||"")+"\nMATERIALS: "+(a.materials||[]).join("; ")+"\nSTEPS: "+(a.steps||[]).join(" | ")+"\nAGE TIP: "+(a.tip||"")+"\nCOST: "+(a.cost||"")+"\nSTANDARDS: "+(a.std||[]).join(", ");}
function parseLab(txt){
  txt=String(txt||"").replace(/<think>[\s\S]*?<\/think>/g,"").replace(/<\|im_end\|>[\s\S]*$/,"").replace(/<\|endoftext\|>[\s\S]*$/,"").trim();
  var out={},cur=null,re=/^[\s*#>\-]*\**\s*(TITLE|SUMMARY|MATERIALS|STEPS|AGE TIP|COST|STANDARDS)\s*\**\s*:\s*\**\s*(.*)$/i;
  txt.split(/\r?\n/).forEach(function(line){var m=line.match(re);
    if(m){cur=m[1].toUpperCase();out[cur]=m[2]||"";}else if(cur&&line.trim())out[cur]+="\n"+line.trim();});
  var one=function(s,n){return String(s||"").replace(/[*_`]/g,"").replace(/\s+/g," ").trim().replace(/^["“]|["”]$/g,"").slice(0,n);};
  var bullets=function(s){return String(s||"").replace(/^[\s\-•*]+/,"");};
  var mats=String(out.MATERIALS||"").split(/;|\n/).map(function(x){return one(bullets(x),80);}).filter(Boolean);
  if(mats.length===1&&mats[0].indexOf(",")>0)mats=mats[0].split(/,\s*/).map(function(x){return one(x,80);}).filter(Boolean);
  var st=String(out.STEPS||"").split(/\s*\|\s*|\n/).map(function(x){return one(bullets(x).replace(/^\d+[.)]\s*/,""),300);}).filter(Boolean);
  if(st.length===1)st=st[0].split(/\s*\d+[.)]\s+/).map(function(x){return one(x,300);}).filter(Boolean);
  var std=[];(String(out.STANDARDS||"").toUpperCase().match(/\b(SE|AL|LL|MA|SC|PH|CA)\b/g)||[]).forEach(function(k){if(std.indexOf(k)<0)std.push(k);});
  var d={title:one(out.TITLE,70),summary:one(out.SUMMARY,400),materials:mats.slice(0,8),steps:st.slice(0,6),ageTip:one(out["AGE TIP"],300),estCost:one(out.COST,40),standards:std.slice(0,3)};
  return (d.title&&d.steps.length>=2)?d:null;}
function applyAI(a,d,age){var tcs=tipCost(d,age||a.age||3);
  if(d.title)a.title=d.title;if(d.summary)a.summary=d.summary;
  if(d.materials.length)a.materials=d.materials;if(d.steps.length)a.steps=d.steps;
  if(d.ageTip)a.tip=tcs.tip.slice(0,300);if(tcs.cost)a.cost=tcs.cost.slice(0,40);
  if((d.standards||[]).length){var first=ROWSTD[a.slot],s=d.standards.filter(function(k){return STD[k]&&k!==first;});a.std=[first].concat(s).slice(0,3);}
  a.pol=true;}
async function rewriteAct(a,instr,age){
  var msgs=[{role:"system",content:SYS2},{role:"user",content:"Class age: "+AGEL[age]+"\nMonthly theme: "+(a.theme||"none")+"\nPlanner row: "+a.slot+"\nKeep supplies very cheap.\n\nCurrent activity:\n"+toLab({title:a.title,summary:a.summary,materials:a.materials,steps:a.steps,tip:"",cost:"",std:[]})+"\n\nTask: "+instr+"\nWrite the finished activity now in the same format."}];
  var t0=Date.now();
  var txt=await aiGen(msgs,{max:290,temp:0.7,onText:function(t){var sec=Math.round((Date.now()-t0)/1000);say((AI.tag||"\u2728 Working a little magic")+" \u2014 "+magic(sec)+"\u2026 "+sec+"s");}});
  return AI.stop?null:parseLab(txt);}
var MAGIC=["gathering sparkles","whispering to the story fairies","stirring the idea cauldron","asking the imagination owls","sprinkling pixie dust","hunting for a hidden surprise"];
function magic(sec){return MAGIC[Math.floor(sec/5)%MAGIC.length];}
function busyUI(b){$("go").disabled=$("pw").disabled=$("mo").disabled=$("pm").disabled=b;var s=$("stop");if(!s.dataset.t)s.dataset.t=s.textContent;s.hidden=!b;s.disabled=false;s.textContent=s.dataset.t;}
// ---------- Helpers shared by the planners ----------
var GROUPS={LL:["Song & Fingerplays","Story","Literacy"],CA:["Art","Music & Movement"],MA:["Math"],SC:["Science"],PH:["Gross Motor Skill"]};
function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
// A teacher's monthly focus (like "dinosaurs and counting") gently steers which planner rows get used.
var FOCUSW=[[/count|number|math|shape|pattern|measur|sort/,"MA"],[/letter|read|book|stor|rhyme|song|sing|word|alphabet|writ|sound/,"LL"],[/\bart|paint|draw|craft|colou?r|music|danc|instrument|rhythm/,"CA"],[/scien|experiment|nature|weather|explor|discover|plant|animal|bug/,"SC"],[/mov|run|jump|outside|outdoor|active|balance|climb|gross|motor/,"PH"]];
function focusPref(t){t=String(t||"").toLowerCase();var out=[];FOCUSW.forEach(function(f){if(f[0].test(t))out.push(f[1]);});return out;}
function focusRow(g,t){t=String(t||"").toLowerCase();
  if(g==="CA")return /music|danc|instrument|rhythm/.test(t)?"Music & Movement":/\bart|paint|draw|craft|colou?r/.test(t)?"Art":null;
  if(g==="LL")return /song|sing|rhyme|finger/.test(t)?"Song & Fingerplays":/book|stor|read/.test(t)?"Story":/letter|word|alphabet|writ|sound/.test(t)?"Literacy":null;
  return null;}
function pickRows(n,use,focus){
  var pref=focusPref(focus),keys=shuf(Object.keys(GROUPS));
  keys.sort(function(a,b){return (pref.indexOf(b)>=0)-(pref.indexOf(a)>=0);});
  keys=keys.slice(0,n);
  var rows=keys.map(function(g){var fr=focusRow(g,focus);
    if(fr&&GROUPS[g].indexOf(fr)>=0&&Math.random()<0.6)return fr;
    var l=shuf(GROUPS[g]);l.sort(function(a,b){return (use[a]||0)-(use[b]||0);});return l[0];});
  rows.forEach(function(r){use[r]=(use[r]||0)+1;});return shuf(rows);}
// ---------- Imagining activities from the teacher's own words (AI first) ----------
var ROWHINT={"Song & Fingerplays":"a song, chant or fingerplay with motions","Story":"story time with a book or a told story, plus a way for children to join in","Art":"a hands-on art or craft project","Literacy":"a letter, sound, rhyme or word game","Math":"counting, shapes, sorting, patterns or measuring","Science":"a hands-on exploration or simple experiment","Gross Motor Skill":"big body movement and active play","Music & Movement":"music, rhythm and dancing"};
var SYSG="You are a warm, wildly imaginative early-childhood teacher at Treehouse Kids Academy in Idaho. You invent ONE brand-new classroom activity from a teacher's idea. Keep it SHORT.\n"+
"Give it a playful hook (a pretend role, secret mission, mystery or surprise) and use the teacher's own words (the animal, toy or topic) in the title and steps. Never a plain worksheet or generic craft.\n"+
"Answer in EXACTLY this format, one label per line, with nothing else:\n"+
"TITLE: cute title, 6 words or fewer\nSUMMARY: one short sentence\nMATERIALS: item; item; item\nSTEPS: step | step | step\nAGE TIP: one short sentence on adapting for younger or older children, never about money\nCOST: like About $3\nSTANDARDS: two or three codes from LL, MA, SC, PH, CA, SE, AL\n"+
"(LL language/literacy, MA math, SC science, PH physical, CA creative arts, SE social-emotional, AL approaches to learning. Pick what the activity really teaches.)\n"+
"Example for a different idea (puddles). Do not copy it:\n"+
"TITLE: Puddle Detectives\nSUMMARY: Little detectives splash and squeeze to solve the case of the vanished puddle.\nMATERIALS: shallow tray; water; sponges; chalk\nSTEPS: Give each detective a sponge badge and announce a puddle has vanished | Splash the tray and squeeze sponges to rescue the puddle | Chalk a circle where it used to be and cheer for the solved case\nAGE TIP: Let younger children just splash while older ones count their squeezes.\nCOST: About $2\nSTANDARDS: SC, PH, SE\n"+
"Rules: match the child's age; cheap household or recycled items only; exactly 3 short steps of under 15 words each; under age 3 no small parts or choking hazards; no children's names.\n"+
"SAFETY: an adult is always with the children. Never include fire or heat, sharp tools, chemicals or cleaners, jumping or climbing from heights, deep water, bags or strings near faces, or children eating grapes, nuts, popcorn, hard candy or hot dogs. Use only safe, taste-safe or pretend materials.";
// Stops a draft the moment it is clearly going wrong, so no time is wasted finishing a bad one
function earlyWhy(s,age){
  if(s.length>60&&!/TITLE\s*:/i.test(s))return "its answer was not in the right format";
  if(/(\bitem; item|\bcute title\b|\bone short sentence\b|<[a-z]|\[[a-z ]+\])/i.test(s))return "it copied the format instructions instead of writing a real activity";
  var f=scanText({title:"",summary:String(s).replace(/\n/g,". "),materials:[],steps:[],tip:"",age:age}).filter(function(x){return x.lvl==="danger";});
  return f.length?"it is unsafe: "+f[0].msg:"";}
async function genAct(idea,slot,theme,age,avoid,others){
  var base="Class age: "+AGEL[age]+". "+AGEG[age]+"\nTeacher's idea: \u201C"+idea+"\u201D\nMonthly theme: "+(theme||"none")+"\nPlanner row: "+slot+" ("+(ROWHINT[slot]||"a classroom activity")+")\n"+
    (avoid&&avoid.length?"Already planned this week (make something clearly different): "+avoid.join("; ")+"\n":"")+"Invent the activity now in exactly the labeled format.";
  var msgs=[{role:"system",content:SYSG},{role:"user",content:base}],temps=[0.8,0.9];AI.lastWhy="";AI.unsafeHit=false;
  for(var t=0;t<2&&!AI.stop&&!AI.deadHit;t++){
    var t0=Date.now(),retry=t?" (one more try)":"";
    if(t===2)temps[2]=1.0;var txt=await aiGen(msgs,{max:250,temp:temps[t]||1.0,abortIf:function(s){return !!earlyWhy(s,age);},onText:function(s){var sec=Math.round((Date.now()-t0)/1000);say((AI.tag||"\u2728 Imagining")+retry+" \u2014 "+magic(sec)+"\u2026 "+sec+"s");}});
    if(AI.timedOut){AI.slowHit=true;return null;}
    if(AI.stop)return null;
    var ew=earlyWhy(txt,age),d=ew?null:parseLab(txt),why=ew?[ew]:(d?draftIssues(d,{idea:idea,age:age,others:others||[],loose:t>=1}):["its answer was not in the right format"]);
    if(!why.length)return d;
    if(why.some(function(w){return /unsafe/i.test(w);})){AI.rejected=(AI.rejected||0)+1;AI.unsafeHit=true;AI.lastWhy=why.filter(function(w){return /unsafe/i.test(w);})[0].replace(/^it (is|was) /,"").replace(/\.$/,"").slice(0,140);return null;}
    AI.rejected=(AI.rejected||0)+1;AI.lastWhy=why.slice(0,2).join("; ").replace(/^it (is|was) /,"").replace(/\.$/,"").slice(0,140);
    msgs=[msgs[0],{role:"user",content:base+"\nYour last try was rejected because: "+why.join("; ")+". Write a different, safe, specific activity that fixes this."}];}
  return null;}
function safety(a,age){
  var all=(a.title+" "+a.summary+" "+a.materials.join(" ")+" "+a.steps.join(" ")).toLowerCase(),t=a.tip||"";
  if(/taste|snack|smell|milk|apple|fruit|cookie|flour|cinnamon|vanilla|peanut|\bnuts?\b|cereal|pasta/.test(all)&&!/allerg/i.test(t))t+=" Check for allergies before any taste, smell, or food activity.";
  if(age<=2&&/bead|button|marble|coin|popcorn|grape|\bnuts?\b|pom.?pom|rice|beans|confetti|glitter|pebble/.test(all)&&!/choking|swallow/i.test(t))t+=" Use only large pieces that can’t be swallowed, and stay close.";
  a.tip=t.trim().slice(0,300);}
function makeAct(d,text,age,only,slot,theme){
  d.theme=theme;var a=toAct(d,text,age,only,slot);a.theme=theme;a.pol=true;a.ai=true;
  var first=ROWSTD[slot],st=[first].concat((d.standards||[]).filter(function(k){return STD[k]&&k!==first;}));
  if(st.length<2)inferStd(a).forEach(function(k){if(st.indexOf(k)<0&&st.length<3)st.push(k);});
  a.std=st.filter(function(k,i){return st.indexOf(k)===i;}).slice(0,3);
  safety(a,age);addCaveats(a);return a;}
function whyNot(eng,fallback){var n=String(eng&&eng.note||"").replace(/\s*The built-in activity bank still works\.?/,"").trim().replace(/\.$/,"");
  return n?n.charAt(0).toLowerCase()+n.slice(1):fallback;}
function weekTitles(k){return plan(k).acts.map(function(a){return a.title;}).slice(0,8);}
// ---------- Plan it! (one activity, imagined from the teacher's words) ----------
async function draft(){
  if(AI.busy)return;
  var text=$("idea").value.trim();if(!text){say("Type what the kids are doing first \u{1F642}");$("idea").focus();return;}
  if(!(await guardIdea()))return;text=$("idea").value.trim();
  if(ideaStop(text,+$("age").value))return;
  var age=+$("age").value,only=$("gm").value,slotSel=$("gs").value;
  AI.busy=true;AI.stop=false;busyUI(true);
  try{
    var slot=slotSel!=="auto"?slotSel:guessSlot(text),th=scoreTheme(text,only)||fbTheme(only);
    var eng={ok:false,note:""},a=null;
    if($("eng").value!=="bank"){
      say(engReady()?"✨ Imagining your activity…":"✨ Waking up the AI helper… I’ll start the moment it’s ready.");
      var tStart=Date.now();eng=await untilCancel(ensureAI());
      if(eng.ok&&!AI.stop){AI.tag="✨ Imagining your activity";
        var d=await genAct(text,slot,th.t,age,weekTitles(V.wk),plan(V.wk).acts);
        if(d){a=makeAct(d,text,age,only,slot,th.t);a.month=th.m;AI.lastSec=Math.round((Date.now()-tStart)/1000);}}
      if(AI.stop&&AI.skip){AI.stop=false;AI.skip=false;eng={ok:false,note:"you chose a quick idea"};}
      if(AI.stop){noteCancel("Cancelled. Nothing was added."+(AI.loading?" The AI helper keeps getting ready in the background, so it will be quicker next time.":""));return;}}
    var fromAI=!!a;
    if(!a){var bd=bankAct(th.t,slot,age,text,null);a=toAct(bd,text,age,only,slotSel);a.theme=th.t;a.month=th.m;}
    var r=place(a,th.m),wm=(r.m!=null?r.m:th.m),where=MN[wm]+" "+yearOf(wm)+" • "+a.theme+", "+DAYS[r.day]+", "+a.slot;
    if(fromAI){$("idea").value="";say("Ta-da! “"+a.title+"” is in "+where+". Click it to see the steps, and review it for safety."+(eng.note?" "+eng.note:"")+(AI.lastSec?" (Took "+AI.lastSec+" seconds.)":""));}
    else if($("eng").value==="bank")say("Added “"+a.title+"” ("+where+") from the built-in bank. Click it to see the steps.");
    else say("Added “"+a.title+"” ("+where+") from the built-in bank, because "+(eng.ok?"the AI couldn’t make a safe, creative version this time"+(AI.lastWhy?" (its tries were rejected because "+AI.lastWhy+")":"")+"."+(AI.unsafeHit?" Try describing it a little differently.":" Press Plan it! again to retry"):whyNot(eng,"the AI helper isn’t ready yet"))+". You can edit it and use Ask AI.");
  }catch(e){say("Couldn’t finish: "+(e&&e.message?e.message:e));}
  finally{AI.tag="";AI.busy=false;busyUI(false);}}
// ---------- Plan the week (one imagined activity per open day, all from the teacher's words) ----------
// ---------- Plan the whole month: instant bank plan steered by the teacher's focus ----------
function focusKey(m){return yearOf(m)+"-"+m;}
function getFocus(m){return String(read("tka:focus",{})[focusKey(m)]||"");}
function setFocus(m,t){var o=read("tka:focus",{});if(t)o[focusKey(m)]=t;else delete o[focusKey(m)];write("tka:focus",o);}
// ---------- The "make it more imaginative" wand (rewrites starter activities one at a time) ----------
async function polishLoop(list,age,focus){
  var todo=list.filter(function(a){return !a.pol;}),done=0;
  for(var i=0;i<todo.length&&!AI.stop;i++){
    AI.tag="✨ Sprinkling imagination on activity "+(i+1)+" of "+todo.length;
    var nd=await rewriteAct(todo[i],"Reimagine it with a playful hook children will love, such as a pretend role, a secret mission or a surprise. Keep the planner row ("+todo[i].slot+"), the theme, and cheap supplies."+(focus?" The teacher’s focus for this month is “"+focus+"”, so work it in naturally where it fits.":""),age);
    if(nd){var bad=draftIssues(nd,{age:age,loose:true,others:[]}).filter(function(w){return /unsafe|copied|repeats|identical|format|steps/.test(w);});if(bad.length){AI.rejected=(AI.rejected||0)+1;continue;}}
    if(nd){applyAI(todo[i],nd,age);safety(todo[i],age);addCaveats(todo[i]);done++;save();render();}}
  return {done:done,total:todo.length,left:list.filter(function(a){return !a.pol;}).length};}
function polMsg(r,eng){
  if(!r.done&&!AI.stop)return "The magic fizzled this time, so the starter ideas were kept. Press the wand again to retry."+(eng&&eng.note?" "+eng.note:"");
  return (AI.stop?"\u23F9\uFE0F Cancelled. ":"Ta-da! ")+r.done+" activit"+(r.done===1?"y just got":"ies just got")+" a sprinkle of imagination ✨"+(r.left?" "+r.left+" more are still waiting for their turn.":"")+" Peek at them, then check for safety and cost."+(eng&&eng.note?" "+eng.note:"")+(AI.speedNote?" "+AI.speedNote:"");}
function polScope(m){
  var sc=$("pol").value,out=[];
  var add=function(k){plan(k).acts.forEach(function(a){if(a.bk&&!a.pol&&actDate(k,a)>=today0())out.push({a:a,d:actDate(k,a)});});};
  if(sc==="month")monthActs(m).forEach(function(x){if(x.a.bk&&!x.a.pol&&x.d>=today0())out.push({a:x.a,d:x.d});});
  else if(sc==="next"){var n=pd(V.wk);n.setDate(n.getDate()+7);add(iso(n));}
  else add(V.wk);
  return out.sort(function(a,b){return a.d-b.d;}).map(function(x){return x.a;});}
async function monthPlan(){
  if(AI.busy)return;
  if(!(await guardIdea()))return;
  var age=+$("age").value,m=$("gm").value==="auto"?V.m:+$("gm").value;
  fixAy(m);var tot=0;weeks(m).forEach(function(w){for(var q=0;q<5;q++)if(okDay(w,q,m))tot++;});
  if(!tot){say("There are no upcoming school days left in "+MN[m]+".");return;}
  var typed=$("idea").value.trim().slice(0,200),focus=typed||getFocus(m);
  if(!confirm("Plan the "+tot+" remaining school days in "+MN[m]+" "+yearOf(m)+(focus?", focusing on “"+focus+"”":"")+"? It fills in instantly from the built-in activity bank. Existing activities stay."))return;
  if(typed){setFocus(m,typed);$("idea").value="";}
  AI.speedNote="";AI.busy=true;AI.stop=false;busyUI(true);
  var made=[];
  try{
    var ws=weeks(m),use={},avoid={},firstK=null;
    ws.forEach(function(k,i){
      var p=plan(k),days=[];
      for(var d=0;d<5;d++)if(okDay(k,d,m))days.push(d);
      if(!days.length)return;
      var tl=themesOf(p),wt0=tl[0]||T[m][i%T[m].length],rows=pickRows(days.length,use,focus);
      days.forEach(function(d,j){var wt=tl.length?tl[j%tl.length]:wt0,dd=bankAct(wt,rows[j],age,"",avoid),a=toAct(dd,wt,age,String(m),rows[j]);
        a.theme=wt;a.month=m;a.day=d;a.bk=true;
        if(focus)a.summary=(a.summary+" Class focus: “"+focus.slice(0,60)+"”.").slice(0,400);
        p.acts.push(a);made.push(a);});
      if(!firstK)firstK=k;});
    save();V.m=m;V.wk=firstK||V.wk;V.view="plan";render();
    var base="Planned "+made.length+" activities in "+MN[m]+" instantly"+(focus?", leaning toward your focus “"+focus.slice(0,60)+"”":"")+". ";
    if($("eng").value==="bank"){say(base+"Check the By Standard tab for coverage, then click any activity to edit it.");return;}
    var first=made.filter(function(a){return plan(firstK).acts.indexOf(a)>=0;});
    say(base+(engReady()?"Now sprinkling some AI imagination on the first week…":"Waking up the AI helper, then I’ll sprinkle some imagination on the first week…")+" Press Stop any time.");
    var eng=await untilCancel(ensureAI());
    if(!eng.ok){if(AI.stop){noteCancel("Cancelled. "+base+"The AI step was skipped.");return;}say(base+eng.note);return;}
    var r=await polishLoop(first,age,focus);
    var rest=made.filter(function(a){return !a.pol;}).length;
    say(base+polMsg(r,eng)+(rest?" The other weeks stay as starter ideas until you press “Make next week more imaginative”.":""));
  }catch(e){say("Planned "+made.length+" activities, but the AI step stopped: "+(e&&e.message?e.message:e));}
  finally{AI.tag="";AI.busy=false;busyUI(false);save();render();}
}
async function polishMore(){
  if(AI.busy)return;
  if(!(await guardIdea()))return;
  var age=+$("age").value,m=$("gm").value==="auto"?V.m:+$("gm").value,typed=$("idea").value.trim().slice(0,200);
  if(typed)setFocus(m,typed);
  var focus=getFocus(m);
  if($("eng").value==="bank"){say("AI help is switched off. Open Advanced & technical details and choose the AI mode to use the wand.");return;}
  var list=polScope(m);
  if(!list.length){say("Nothing waiting for a sprinkle there ✨ Starter ideas from “Plan the whole month” get picked up here, and anything you or the AI already wrote is left alone.");return;}
  AI.speedNote="";AI.busy=true;AI.stop=false;busyUI(true);
  try{
    say(engReady()?"✨ Sprinkling imagination on "+list.length+" activit"+(list.length===1?"y":"ies")+"…":"✨ Waking up the AI helper… then I’ll sprinkle imagination on "+list.length+" activit"+(list.length===1?"y":"ies")+".");
    var eng=await untilCancel(ensureAI());
    if(!eng.ok){if(AI.stop){noteCancel("Cancelled. Nothing was changed.");return;}say(eng.note);return;}
    var r=await polishLoop(list,age,focus);
    say(polMsg(r,eng));
  }catch(e){say("The AI step stopped: "+(e&&e.message?e.message:e));}
  finally{AI.tag="";AI.busy=false;busyUI(false);save();render();}
}
$("pw").onclick=function(){return planWeek();};
$("mo").onclick=monthPlan;
$("pm").onclick=polishMore;
