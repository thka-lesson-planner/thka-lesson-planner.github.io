/* Copyright (c) 2026 Joaquin Ruby and Athena Gilbertson. All rights reserved. DO NOT REMOVE. */
/* The on-device AI helper (Reliable/Fast mode), its answer format, and the Plan it! / Plan the week / Plan the month / wand planners. */
// ---------- AI helper: Reliable mode (CPU), Fast mode (graphics card), or no AI ----------
// Reliable mode: wllama (MIT) runs a small Qwen2.5 model (Apache 2.0) on the processor, so it works on almost any laptop or tablet.
var WLLAMA_BASE="https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.7/esm/";
var CM={
  light:{url:"https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf",mb:491,label:"about 0.5 GB"},
  balanced:{url:"https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf",mb:1120,label:"about 1.1 GB"},
  heavy:{url:"https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/main/Qwen3-4B-Q4_K_M.gguf",mb:2500,label:"about 2.5 GB",nothink:true}};
var CMORDER=["light","balanced","heavy"];
// Fast mode: WebLLM on the graphics card (optional, strong computers only).
var WEBLLM_URL="https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.83/+esm";
var WM={id:"Qwen2.5-1.5B-Instruct-q4f16_1-MLC"};
var AI={busy:false,stop:false,gpu:null,active:null,loading:null,cpu:null,cpuKey:null,wmod:null,web:null,webMod:null,tag:"",cur:null,pending:null,waiters:[],primed:null,lastSec:0};
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
function setProg(p,text){var pg=$("prog");if(p==null)pg.hidden=true;else{pg.hidden=false;pg.value=p;}$("dlnote").textContent=text||"";}
function mbs(n){return Math.round(n/1048576).toLocaleString("en-US");}
function friendly(e){var m=String(e&&e.message?e.message:e||"");
  if(/DXGI|requestDevice|maxCompute|WebGPU|GPUAdapter|device.*(lost|removed)|D3D/i.test(m))return "the graphics driver stopped";
  if(/memory|allocation|RangeError|out of|alloc/i.test(m))return "not enough memory";
  if(/fetch|network|Failed to|load failed|NetworkError|HTTP|status/i.test(m))return "the download was interrupted, so check the internet connection";
  return m.replace(/\s+/g," ").slice(0,120)||"unknown problem";}
function isTablet(){var u=navigator.userAgent||"";return /iPad|Android|Tablet/i.test(u)||(navigator.maxTouchPoints>1&&/Mac/i.test(navigator.platform||""));}
function lowMem(){return !!(navigator.deviceMemory&&navigator.deviceMemory<=4);}
// The AI size is picked automatically from what this device can handle. "Powerful" is only ever chosen by hand (Advanced).
function pickModel(){var cores=navigator.hardwareConcurrency||2;
  if(isTablet()||lowMem()||cores<8||!self.crossOriginIsolated)return "light";
  return "balanced";}
function curModel(){var s=$("cm").value,k=s==="auto"?pickModel():(CM[s]?s:"light"),cap=read("tka:cap","");
  if(cap&&CMORDER.indexOf(cap)>=0&&CMORDER.indexOf(k)>CMORDER.indexOf(cap))k=cap;return k;}
var MODELN={light:"Light",balanced:"Balanced",heavy:"Powerful"};
function engReady(){var e=$("eng").value;return e==="cpu"?(AI.active==="cpu"&&AI.cpuKey===curModel()&&!!AI.cpu):e==="gpu"?(AI.active==="gpu"&&!!AI.web):false;}
function engCached(){var e=$("eng").value;return e==="cpu"?read("tka:gguf:"+curModel(),false)===true:e==="gpu"?read("tka:wllm:"+WM.id,false)===true:false;}
function refresh(){
  var e=$("eng").value,k=curModel(),ready=engReady(),cached=engCached(),sc=$("pol").value;
  write("tka:eng",e);$("cmrow").hidden=e!=="cpu";$("polrow").hidden=$("pm").hidden=e==="bank";
  $("pm").textContent="\u2728 Make "+(sc==="next"?"next week":sc==="month"?"this month":"this week")+" more imaginative";
  var bad=read("tka:gpubad",false)===true;
  if(e==="bank"){status(true,"\u25CF No AI needed");$("setup").hidden=true;
    $("wnote").textContent="Uses the built-in activity bank only: instant, free, and works on every device.";}
  else if(ready){status(true,"\u25CF AI helper ready");$("setup").hidden=true;
    $("wnote").textContent=e==="cpu"?"Ready! Runs on this device’s processor ("+MODELN[k]+" size). Nothing leaves this device."+(self.crossOriginIsolated?"":" This browser isn’t using all processor cores, so the AI will be slower. Reload the page once; if it stays slow, avoid private windows."):"Ready! Runs on the graphics card. Nothing leaves this device.";}
  else if(AI.loading){status(null,"\u25CF Waking up the AI helper\u2026");$("setup").hidden=true;
    $("wnote").textContent="Getting the AI helper ready in the background. You can keep planning while it loads!";}
  else if(cached){status(true,"\u25CF Saved on this device");$("setup").hidden=true;
    $("wnote").textContent="The AI helper is saved here and wakes up when you need it.";}
  else{status(null,"AI helper not loaded yet");$("setup").hidden=false;
    $("setup").textContent="\u2B07 Set up AI helper ("+(e==="cpu"?CM[k].label:"about 1 GB")+")";
    $("wnote").textContent="The AI helper normally loads itself in the background (one-time download). Press the button if it hasn’t started.";}
  if(e==="gpu"&&bad)$("wnote").textContent="Fast mode had trouble on this computer before. Reliable mode is the safer choice.";
  if(e==="cpu"&&$("cm").value==="heavy")$("wnote").textContent+=" Powerful size is for strong computers (8 GB+ memory); if it can’t start, the app steps down by itself.";
  $("go").textContent="Plan it!";tech();}
function tech(){var el=$("tech");if(!el)return;var mt=null;try{if(AI.cpu&&typeof AI.cpu.isMultithread==="function")mt=AI.cpu.isMultithread();}catch(e){}
  el.innerHTML="Size picked for this device: <b>"+MODELN[curModel()]+($("cm").value==="auto"?" (automatic)":" (chosen by hand)")+"</b><br>Cross-origin isolated (needed for multi-core speed): <b>"+(self.crossOriginIsolated?"yes":"no")+"</b><br>Processor threads reported: <b>"+(navigator.hardwareConcurrency||"unknown")+"</b><br>Memory hint: <b>"+(navigator.deviceMemory?navigator.deviceMemory+" GB":"unknown")+"</b><br>Graphics (WebGPU): <b>"+(AI.gpu===null?"checking":AI.gpu?"available":"not available")+"</b>"+(AI.tps?"<br>AI speed: <b>about "+Math.round(AI.tps)+" tokens per second</b>":"")+(mt===null?"":"<br>Multi-core mode in use: <b>"+(mt?"yes":"no")+"</b>")+(self.crossOriginIsolated?"":"<br>Tip: put coi-serviceworker.js next to this page to unlock multi-core speed.");}
async function detectGpu(){try{AI.gpu=!!(navigator.gpu&&await navigator.gpu.requestAdapter());}catch(e){AI.gpu=false;}
  var o=$("eng").querySelector("option[value=gpu]");
  if(!AI.gpu){o.disabled=true;o.textContent="Fast mode: not available on this device";if($("eng").value==="gpu")$("eng").value="cpu";}
  refresh();}
function switchCpu(){$("eng").value="cpu";write("tka:eng","cpu");}
async function webLoad(){
  if(AI.web)return;
  setProg(0,"Loading the fast AI engine…");
  if(!AI.webMod){try{AI.webMod=await import(WEBLLM_URL);}catch(e){setProg(null,"");throw e;}}
  var list=(AI.webMod.prebuiltAppConfig&&AI.webMod.prebuiltAppConfig.model_list)||[];
  if(!list.some(function(m){return m.model_id===WM.id;}))throw new Error("That model isn’t available in this engine version.");
  AI.web=await AI.webMod.CreateMLCEngine(WM.id,{initProgressCallback:function(p){setProg(Math.round((p&&p.progress||0)*100),(p&&p.text)||"Loading the model");}});
  write("tka:wllm:"+WM.id,true);setProg(null,"");}
async function cpuLoad(key){
  var m=CM[key];
  if(AI.cpu&&AI.cpuKey===key)return;
  if(AI.cpu){AI.pending=null;AI.primed=null;try{await AI.cpu.exit();}catch(e){}AI.cpu=null;AI.cpuKey=null;}
  setProg(0,"Loading the AI engine…");
  if(!AI.wmod){try{AI.wmod=await import(WLLAMA_BASE+"index.js");}catch(e){setProg(null,"");throw e;}}
  var paths={"single-thread/wllama.wasm":WLLAMA_BASE+"single-thread/wllama.wasm","multi-thread/wllama.wasm":WLLAMA_BASE+"multi-thread/wllama.wasm"};
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}
  var lastErr=null;
  for(var attempt=0;attempt<3;attempt++){
    var w=null;
    try{
      w=new AI.wmod.Wllama(paths,{parallelDownloads:2,logger:{debug:function(){},log:function(){},warn:function(){},error:function(){}}});
      var cfg={n_ctx:1536,n_batch:512,progressCallback:function(p){
        if(!p||!p.total)return;var pc=Math.round(100*p.loaded/p.total);
        setProg(pc,p.loaded>=p.total?"Starting the AI helper…":"Downloading the AI helper: "+mbs(p.loaded)+" MB of "+mbs(p.total)+" MB. You can keep planning while this downloads.");}};
      if(attempt===2)cfg.n_threads=1;
      else if(self.crossOriginIsolated){var hc=navigator.hardwareConcurrency||4;cfg.n_threads=Math.max(2,Math.min(Math.round(hc*0.75),8));}
      await w.loadModelFromUrl(m.url,cfg);
      AI.cpu=w;AI.cpuKey=key;write("tka:gguf:"+key,true);setProg(null,"");return;
    }catch(e){lastErr=e;try{if(w)await w.exit();}catch(x){}
      if(attempt<2){setProg(null,"Hit a snag ("+friendly(e)+"). Trying again…");await sleep(1500*(attempt+1));}}
  }
  setProg(null,"");throw lastErr;
}
// Returns {ok, note}. Never throws. Falls back from Fast mode to Reliable mode, and from Balanced to Light.
function ensureAI(){
  if(AI.loading)return AI.loading;
  AI.loading=doEnsure();refresh();
  AI.loading=AI.loading.then(function(r){AI.loading=null;refresh();return r;},function(e){AI.loading=null;refresh();return {ok:false,note:"The AI helper couldn’t start ("+friendly(e)+"). The built-in activity bank still works."};});
  return AI.loading;}
async function doEnsure(){
  var e=$("eng").value,note="";
  if(e==="bank")return {ok:false,note:""};
  if(engReady())return {ok:true,note:""};
  if(e==="gpu"){
    if(AI.gpu===false||read("tka:gpubad",false)===true){switchCpu();note="Fast mode isn’t available on this computer, so Reliable mode was used instead.";}
    else{try{await webLoad();AI.active="gpu";return {ok:true,note:""};}
      catch(err){write("tka:gpubad",true);AI.web=null;AI.active=null;setProg(null,"");switchCpu();note="Fast mode couldn’t start on this computer ("+friendly(err)+"), so I switched to Reliable mode, which works on almost any computer.";}}
  }
  var key=curModel(),first=key,why="";
  while(true){
    try{await cpuLoad(key);AI.active="cpu";setTimeout(benchAndPrime,300);
      var nt=(key!==first)?"The "+MODELN[first]+" size was too big for this device ("+why+"), so the "+MODELN[key]+" size was used.":"";
      return {ok:true,note:(note?note+" ":"")+nt};}
    catch(err){var ix=CMORDER.indexOf(key);
      if(ix>0){if(!why)why=friendly(err);key=CMORDER[ix-1];write("tka:cap",key);continue;}
      return {ok:false,note:(note?note+" ":"")+"The AI helper couldn’t start ("+friendly(err)+"). The built-in activity bank still works."};}}
}
// Generate text with whichever engine is loaded.
async function aiGen(msgs,o){
  o=o||{};var max=o.max||420,temp=o.temp==null?0.7:o.temp,acc="";
  if(AI.active==="gpu"){AI.cur={c:false,fire:null};
    try{var stream=await AI.web.chat.completions.create({messages:msgs,stream:true,temperature:temp,top_p:0.9,max_tokens:max});
      for await(var ch of stream){var t=ch.choices&&ch.choices[0]&&ch.choices[0].delta&&ch.choices[0].delta.content;
        if(t){acc+=t;if(o.onText)o.onText(acc);}if(AI.stop||(AI.cur&&AI.cur.c)){try{AI.web.interruptGenerate();}catch(e){}break;}}
    }catch(err){if(!AI.stop){write("tka:gpubad",true);AI.web=null;AI.active=null;switchCpu();
        throw new Error("Fast mode stopped working ("+friendly(err)+"). Reliable mode is selected now, so just try again.");}}
    return acc;}
  var tok={c:false,fire:null};AI.cur=tok;
  if(AI.pending){var wt=new Promise(function(r){tok.fire=r;}),to=new Promise(function(r){setTimeout(r,25000);});
    try{await Promise.race([AI.pending,wt,to]);}catch(e){}
    if(tok.c||AI.stop){AI.cur=null;return "";}}
  var prompt=msgs.map(function(m){return "<|im_start|>"+m.role+"\n"+m.content+"<|im_end|>\n";}).join("")+"<|im_start|>assistant\n"+(AI.cpuKey&&CM[AI.cpuKey]&&CM[AI.cpuKey].nothink?"<think>\n\n</think>\n\n":"");
  var nTok=0,tFirst=0,cancelP=new Promise(function(r){tok.fire=function(){r("__cancel__");};});
  var job=AI.cpu.createCompletion(prompt,{nPredict:max,useCache:true,sampling:{temp:temp,top_k:40,top_p:0.9,penalty_repeat:1.1},
    onNewToken:function(t,piece,text,opt){acc=text;if(!tFirst)tFirst=Date.now();nTok++;
      var ended=text.indexOf("<|im_end|>")>=0||text.indexOf("<|endoftext|>")>=0;
      if(tok.c||AI.stop||ended||(o.abortIf&&nTok%16===0&&o.abortIf(text))){try{opt.abortSignal();}catch(e){}}
      if(!tok.c&&o.onText)o.onText(text);}});
  AI.pending=job.then(function(){},function(){});
  var res=await Promise.race([job,cancelP]);
  if(res==="__cancel__"){AI.cur=null;return acc;}
  AI.cur=null;
  if(nTok>12&&tFirst){var dt=(Date.now()-tFirst)/1000;if(dt>0.5){var v=nTok/dt;AI.tps=AI.tps?(AI.tps+v)/2:v;}}
  return String(acc||res||"");}
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
// If this device runs the AI slowly, quietly move to the faster Light size (automatic mode only) and remember it.
async function speedCheck(){
  if(AI.active!=="cpu"||!AI.tps||AI.tps>=6||$("cm").value!=="auto"||curModel()==="light")return;
  write("tka:cap","light");AI.tps=0;
  say("\u2728 This device is running the AI slowly, so I\u2019m switching to the faster Light size for the rest\u2026");
  var r=await ensureAI();
  if(r.ok)AI.speedNote="Switched to the faster Light size because this device was running the AI slowly.";
  else{write("tka:cap","");await ensureAI();}}
var MAGIC=["gathering sparkles","whispering to the story fairies","stirring the idea cauldron","asking the imagination owls","sprinkling pixie dust","hunting for a hidden surprise"];
function magic(sec){return MAGIC[Math.floor(sec/5)%MAGIC.length];}
function busyUI(b){$("go").disabled=$("pw").disabled=$("mo").disabled=$("pm").disabled=b;var s=$("stop");if(!s.dataset.t)s.dataset.t=s.textContent;s.hidden=!b;s.disabled=false;s.textContent=s.dataset.t;
  if(!b)setTimeout(primeCache,400);}
// Measure how fast this computer really is (about 3 seconds, once), and move slow computers to the faster Light size before the first activity
async function benchTps(){var n=0,t0=0;
  try{await AI.cpu.createCompletion("<|im_start|>user\nCount: one, two, three, four, five, six, seven, eight, nine, ten.<|im_end|>\n<|im_start|>assistant\n",{nPredict:18,useCache:false,sampling:{temp:0},
    onNewToken:function(t,p,text,opt){if(!t0)t0=Date.now();n++;if(n>=18){try{opt.abortSignal();}catch(e){}}}});}catch(e){return 0;}
  var dt=(Date.now()-t0)/1000;return (n>6&&dt>0.2)?(n-1)/dt:0;}
async function benchAndPrime(){
  if(AI.benching||AI.active!=="cpu"||!AI.cpu||AI.busy)return;
  var key=AI.cpuKey,saved=+read("tka:tps:"+key,0)||0;AI.benching=true;
  try{
    var tps=saved;
    if(!tps){var bp=benchTps();AI.pending=bp.then(function(){},function(){});tps=await bp;if(tps>0)write("tka:tps:"+key,Math.round(tps*10)/10);}
    if(tps>0)AI.tps=tps;
    if(tps>0&&tps<5&&key!=="light"&&$("cm").value==="auto"&&!AI.busy){
      write("tka:cap","light");AI.tps=0;AI.speedNote="Switched to the faster Light size because this computer runs the AI slowly.";
      AI.benching=false;await ensureAI();
      var dn=$("dlnote");if(dn)dn.textContent="This computer runs the AI slowly (about "+Math.round(tps*10)/10+" words per second), so I switched to the faster Light size so activities take about half a minute. You can pick a bigger size under Advanced & technical details.";
      return;}
    if(tps>0&&tps<5&&key!=="light"){var dn2=$("dlnote");if(dn2)dn2.textContent="This size runs slowly on this computer (about "+Math.round(tps*10)/10+" words per second). Choose Light under Advanced & technical details for faster activities.";}
  }finally{AI.benching=false;}
  primeCache();}
// Warm the AI's memory of the long instructions once, so each activity only has to read the short new part
function primeCache(){if(AI.busy||AI.active!=="cpu"||!AI.cpu||typeof SYSG==="undefined")return;
  var pre="<|im_start|>system\n"+SYSG+"<|im_end|>\n<|im_start|>user\n";
  try{AI.pending=AI.cpu.createCompletion(pre,{nPredict:1,useCache:true,sampling:{temp:0}}).then(function(){},function(){});}catch(e){}}
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
  for(var t=0;t<((AI.tps&&AI.tps<6)?1:(AI.tps&&AI.tps>=8)?3:2)&&!AI.stop&&!AI.deadHit;t++){
    var t0=Date.now(),retry=t?" (one more try)":"";
    if(t===2)temps[2]=1.0;var txt=await aiGen(msgs,{max:((AI.tps&&AI.tps<6)?140:180),temp:temps[t]||1.0,abortIf:function(s){return !!earlyWhy(s,age);},onText:function(s){var sec=Math.round((Date.now()-t0)/1000);say((AI.tag||"\u2728 Imagining")+retry+" \u2014 "+magic(sec)+"\u2026 "+sec+"s");}});
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
    if(fromAI){$("idea").value="";say("Ta-da! “"+a.title+"” is in "+where+". Click it to see the steps, and review it for safety."+(eng.note?" "+eng.note:"")+(AI.lastSec?" (Took "+AI.lastSec+" seconds.)":""));if(AI.lastSec>40)await speedCheck();}
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
    if(nd){applyAI(todo[i],nd,age);safety(todo[i],age);addCaveats(todo[i]);done++;save();render();if(done===1&&i<todo.length-1)await speedCheck();}}
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
