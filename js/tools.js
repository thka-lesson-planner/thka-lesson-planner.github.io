/* Copyright (c) 2026 Joaquin Ruby and Athena Gilbertson. All rights reserved. DO NOT REMOVE. */
/* Backup (export/import), several themes per week, auto-sizing text boxes, printing, and the theme dropdown. */
// ---------- Backup: export and import all planners ----------
function exportAll(){
  var o={app:"treehouse-kids-planner",version:1,exported:new Date().toISOString(),data:{}};
  try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf("tka:")===0&&!/^tka:(gguf|wllm|gpubad|cap)/.test(k))o.data[k]=localStorage.getItem(k);}}catch(e){}
  var blob=new Blob([JSON.stringify(o)],{type:"application/json"}),a=document.createElement("a"),d=new Date();
  a.href=URL.createObjectURL(blob);a.download="treehouse-planners-"+d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")+".json";
  document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);
  write("tka:lastexport",d.toISOString());updateBackupNote();}
function importAll(file){
  if(!file)return;var fr=new FileReader();
  fr.onload=function(){try{var o=JSON.parse(String(fr.result||"{}"));
    if(!o||o.app!=="treehouse-kids-planner"||!o.data||typeof o.data!=="object")throw new Error("bad file");
    var plans=o.data["tka:plans"]?JSON.parse(o.data["tka:plans"]):{},n=Object.keys(plans).length;
    if(!confirm("Import "+n+" saved week"+(n===1?"":"s")+" from this backup? Weeks with the same date will be replaced by the backup. Your other weeks stay."))return;
    Object.keys(plans).forEach(function(k){DB[k]=plans[k];});
    Object.keys(o.data).forEach(function(k){if(k!=="tka:plans"&&/^tka:(focus|bud|pol|auto|cm|eng|stdcfg)$/.test(k)){try{localStorage.setItem(k,o.data[k]);}catch(e){}}});
    try{stdLoad();stdScrub();buildSYSG();}catch(e){}SC.last="";save();render();scanAll();say("Imported "+n+" week"+(n===1?"":"s")+" from your backup.");
  }catch(e){alert("That doesn’t look like a Treehouse planner backup file. Choose the .json file you exported from this planner.");}};
  fr.readAsText(file);}
function updateBackupNote(){var el=$("bk-note");if(!el)return;var l=read("tka:lastexport",""),n=0;Object.keys(DB).forEach(function(k){if(DB[k]&&DB[k].acts)n+=DB[k].acts.length;});
  el.textContent=l?"Last export: "+new Date(l).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+".":(n?"You haven’t exported yet. Do it now so your work is safe.":"");}
document.addEventListener("click",function(e){var t=e.target;if(!t.closest)return;if(t.closest("#bk-ex"))exportAll();else if(t.closest("#bk-im"))$("bk-file").click();});
document.addEventListener("change",function(e){if(e.target.id==="bk-file"){importAll(e.target.files[0]);e.target.value="";}});
// ---------- Several themes in one week ----------
function themesOf(p){return Array.isArray(p.themes)?p.themes.filter(Boolean):(p.theme?[p.theme]:[]);}
function themeStr(p){return themesOf(p).join(" + ");}
function setThemes(p,arr){var u=[];arr.forEach(function(t){t=String(t||"").trim().slice(0,60);if(t&&u.map(function(x){return x.toLowerCase();}).indexOf(t.toLowerCase())<0)u.push(t);});p.themes=u.slice(0,4);p.theme=p.themes[0]||"";}
function hasTheme(p,t){t=String(t||"").toLowerCase();return themesOf(p).some(function(x){return x.toLowerCase()===t;});}
function themeFor(p,cur){var t=themesOf(p);if(!t.length)return cur;return t.some(function(x){return x.toLowerCase()===String(cur||"").toLowerCase();})?cur:t[0];}
function themeChips(p){return themesOf(p).map(function(t,i){return "<span class=\"thc\" style=\"background:"+PAL[i%PAL.length]+"\">"+esc(t)+"<button type=\"button\" class=\"thx noprint\" data-thx=\""+esc(t)+"\" aria-label=\"Remove "+esc(t)+"\">×</button></span>";}).join("");}
function themeRefresh(){var p=plan(V.wk),c=$("th-chips"),i=$("th-in");if(c)c.innerHTML=themeChips(p);
  if(i){i.placeholder=themesOf(p).length?(themesOf(p).length>=4?"Up to 4 themes":"Add another theme"):"Pick or type a theme";i.disabled=themesOf(p).length>=4;}
  if($("th-pop")&&!$("th-pop").hidden)thPanel();}
function toggleTheme(t){var p=plan(V.wk),cur=themesOf(p);
  if(hasTheme(p,t))setThemes(p,cur.filter(function(x){return x.toLowerCase()!==String(t).toLowerCase();}));
  else if(cur.length>=4){say("A week can have up to 4 themes. Remove one to add another.");return;}
  else setThemes(p,cur.concat([t]));
  save();themeRefresh();}
async function addCustomTheme(){var i=$("th-in");if(!i)return;var v=i.value.trim();if(!v)return;
  var r=await guardCheck(v);if(!r.ok){i.value=r.text;i.focus();return;}
  i.value="";toggleTheme(r.text);}
document.addEventListener("keydown",function(e){if(e.target&&e.target.id==="th-in"&&e.key==="Enter"){e.preventDefault();addCustomTheme();}});
document.addEventListener("change",function(e){if(e.target&&e.target.id==="th-in")addCustomTheme();});
document.addEventListener("click",function(e){var x=e.target.closest&&e.target.closest("[data-thx]");if(x){toggleTheme(x.dataset.thx);}});
// Private details and unkind wording are caught in the weekly header boxes too
document.addEventListener("change",async function(e){var f=e.target&&e.target.dataset&&e.target.dataset.f;if(!f)return;
  var r=await guardCheck(e.target.value);if(r.text!==e.target.value){e.target.value=r.text;plan(V.wk)[f]=r.text;save();}if(!r.ok)e.target.focus();});
// ---------- Auto-size text boxes ----------
function autosz(el){el.style.height="auto";el.style.height=(el.scrollHeight+4)+"px";}
function autoAll(){Array.prototype.forEach.call(document.querySelectorAll("#dbody textarea.auto"),autosz);}
document.addEventListener("input",function(e){if(e.target.classList&&e.target.classList.contains("auto"))autosz(e.target);});
// ---------- Printing ----------
var PS={SE:"Social & Emotional",AL:"Approaches to Learning",LL:"Language & Literacy",MA:"Mathematics",SC:"Science & Discovery",PH:"Physical Dev. & Health",CA:"Creative Arts"};
function doPrint(kind,html){$("pp").innerHTML=html;document.body.setAttribute("data-print",kind);window.print();}
window.addEventListener("afterprint",function(){document.body.removeAttribute("data-print");$("pp").innerHTML="";});
function pHead(t){return "<div class=\"ph\"><div class=\"pt\">Treehouse Kids Academy</div><div>"+t+"</div></div>";}
function pwHtml(k){var p=plan(k),h=pHead("Weekly Lesson Plan");
  h+="<table class=\"hh\"><tr><td>Classroom: "+esc(p.classroom)+"</td><td>Week of: "+pd(k).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})+"</td></tr><tr><td>Theme: "+esc(themeStr(p))+"</td><td>Character Education: "+esc(p.char)+"</td></tr><tr><td>Bible Lesson: "+esc(p.bible)+"</td><td>Sign Language: "+esc(p.sign)+"</td></tr></table>";
  h+="<table class=\"w8\" style=\"margin-top:6px\"><colgroup><col style=\"width:11%\"><col style=\"width:15%\"><col style=\"width:15%\"><col style=\"width:15%\"><col style=\"width:15%\"><col style=\"width:15%\"><col style=\"width:14%\"></colgroup><tr><th>Activity</th>"+DAYS.map(function(d){return "<th>"+d+"</th>";}).join("")+"<th>Standard Addressed</th></tr>";
  ROWS.forEach(function(r){var used=[];h+="<tr><th>"+esc(r)+"</th>";
    for(var d=0;d<5;d++){var l=p.acts.filter(function(a){return a.slot===r&&a.day===d;});
      l.forEach(function(a){a.std.forEach(function(x){if(used.indexOf(x)<0)used.push(x);});});
      h+="<td>"+l.map(function(a){return "<span class=\"t\">"+esc(a.title)+"</span>";}).join("")+"</td>";}
    h+="<td style=\"font-size:7pt\">"+used.map(function(x){return esc(PS[x]);}).join(", ")+"</td></tr>";});
  return h+"</table>";}
function pmHtml(m){var h=pHead(MN[m]+" "+yearOf(m)+" Activity Calendar"),notes=[];
  h+="<table class=\"cm\"><colgroup><col style=\"width:20%\"><col style=\"width:20%\"><col style=\"width:20%\"><col style=\"width:20%\"><col style=\"width:20%\"></colgroup><tr>"+DAYS.map(function(d){return "<th>"+d+"</th>";}).join("")+"</tr>";
  weeks(m).forEach(function(k){var p=plan(k);if(themesOf(p).length)notes.push("Week of "+fmtD(k,0)+": "+esc(themeStr(p)));h+="<tr>";
    for(var d=0;d<5;d++){var dt=pd(k);dt.setDate(dt.getDate()+d);
      if(dt.getMonth()!==m){h+="<td style=\"background:#EEE\"></td>";continue;}
      h+="<td><b>"+dt.getDate()+"</b>"+p.acts.filter(function(a){return a.day===d;}).map(function(a){return "<span class=\"t\">"+esc(a.title)+"</span>";}).join("")+"</td>";}
    h+="</tr>";});
  return h+"</table>"+(notes.length?"<p style=\"font-size:9pt\"><b>Weekly themes:</b> "+notes.join(" \u2022 ")+"</p>":"");}
function paHtml(k,a){var d=actDate(k,a),h=pHead("Activity Plan");
  h+="<h1>"+esc(a.title||"Untitled activity")+"</h1><p>"+d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})+" \u2022 "+esc(a.slot)+" \u2022 "+AGEL[a.age||3]+(a.theme?" \u2022 Theme: "+esc(a.theme):"")+"</p><p><b>Standards addressed:</b> "+(a.std||[]).map(function(x){return esc(PS[x]);}).join(", ")+"</p>";
  if(a.summary)h+="<h3>What the children do</h3><p>"+esc(a.summary)+"</p>";
  if((a.materials||[]).length)h+="<h3>Materials</h3><ul>"+a.materials.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ul>";
  if((a.steps||[]).length)h+="<h3>Steps</h3><ol>"+a.steps.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ol>";
  if(a.tip)h+="<h3>Age tip</h3><p>"+esc(a.tip)+"</p>";
  if(a.cost)h+="<h3>Estimated supply cost</h3><p>"+esc(a.cost)+"</p>";
  return h;}
// ---------- Theme dropdown (type or pick) ----------
var PAL=["#FFD9D2","#FFF1BF","#DFF3E4","#CDEBF7","#E8DDF7","#FFE3C2"];
function themeNote(p){if(themesOf(p).length)return "";var u=[];p.acts.forEach(function(a){if(a.theme&&u.indexOf(a.theme)<0)u.push(a.theme);});
  return u.length?"<p class=\"note noprint\">Activities this week use "+u.map(function(t){return "<button type=\"button\" class=\"btn alt sm\" data-use=\""+esc(t)+"\">Use \u201C"+esc(t)+"\u201D as the week theme</button>";}).join(" ")+"</p>":"";}
function thPanel(){var inp=$("th-in"),pop=$("th-pop");if(!inp||!pop)return;var q=inp.value.trim().toLowerCase(),i=0;
  var chip=function(m,t){var sel=hasTheme(plan(V.wk),t);return "<button type=\"button\" class=\"cbc"+(sel?" sel":"")+"\" data-th=\""+esc(t)+"\" style=\"background:"+PAL[i++%PAL.length]+"\">"+(sel?"✓ ":"")+ME[m]+" "+esc(t)+"</button>";};
  var cur=T[V.m].filter(function(t){return !q||t.toLowerCase().indexOf(q)>=0;});
  var h="<div class=\"cbh\">"+ME[V.m]+" "+MN[V.m]+" themes</div><div class=\"cbg\">"+(cur.length?cur.map(function(t){return chip(V.m,t);}).join(""):"<span class=\"note\">Nothing in this month matches. Keep typing your own!</span>")+"</div>";
  if(q){var o=[];ORDER.forEach(function(m){if(m!==V.m)T[m].forEach(function(t){if(t.toLowerCase().indexOf(q)>=0)o.push(chip(m,t));});});if(o.length)h+="<div class=\"cbh\">\u2728 From other months</div><div class=\"cbg\">"+o.join("")+"</div>";}
  pop.innerHTML=h;}
document.addEventListener("focusin",function(e){if(e.target.id==="th-in"){thPanel();$("th-pop").hidden=false;}});
document.addEventListener("input",function(e){if(e.target.id==="th-in"){thPanel();$("th-pop").hidden=false;}});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){var p=$("th-pop");if(p)p.hidden=true;}});
