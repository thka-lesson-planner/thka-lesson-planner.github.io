/* Copyright (c) 2026 Joaquin Ruby and Athena Gilbertson. All rights reserved. DO NOT REMOVE. */
/* Treehouse Kids Academy Lesson Planner: data, helpers, rendering, page events, placing activities and the built-in activity bank. */
// ---------- Data ----------
var MN=["January","February","March","April","May","June","July","August","September","October","November","December"];
var ME=["\u26C4","\u2764\uFE0F","\uD83C\uDF08","\uD83E\uDD8B","\uD83C\uDF38","\uD83D\uDC19","\uD83C\uDDFA\uD83C\uDDF8","\uD83E\uDD29","\uD83C\uDF4E","\uD83C\uDF83","\uD83E\uDD83","\uD83C\uDF84"];
var T=[
["Hibernation & Winter Animals","Winter Weather","Mittens & Scarves","Snowman","Snow & Ice","New Year's","Milk Day"],
["Groundhog Day","Community Helpers","100th Day of School","Healthy Habits & Hygiene","Friendship","Valentines","Presidents' Day"],
["Colors of the Rainbow","Dr. Seuss & Friends","St. Patrick's Day","Pets & Animal Care","Weather","Dinosaurs","Transportation","Easter"],
["Earth Day","Spring","Rain & Puddles","Life Cycles","Recycling","Birds","Baby Animals & Insects","Creepy Crawlers"],
["Flowers & Garden","Mother's Day","Outer Space","Pets","Seasons","Fairy Tales","Memorial Day"],
["Summer Fun","Camping & Nature","Ocean & Sea Animals","Construction & Building"],
["America the Beautiful","Superheroes","Jungle & Safari","Zoo Animals"],
["Review"],
["Back to School","Classroom Rules","All About Me & My Favorites","Emotions","Apples","Colors & Shapes"],
["Fall","Leaves","Fire Safety","Pumpkins & Farm","Spiders & Bats","Halloween Fun"],
["Healthy Foods & Body","Thankful & Sharing","Turkeys & Thanksgiving","Five Senses","Harvest","My Family"],
["Gingerbread","Christmas Around the World","Lights & Decorations","Santa & His Elves","Reindeer"]];
var ORDER=[8,9,10,11,0,1,2,3,4,5,6,7];
var ROWS=["Song & Fingerplays","Story","Art","Literacy","Math","Science","Gross Motor Skill","Music & Movement"];
var DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday"];
// Edit names/colors here if Idaho STARS wording changes.
var STD={SE:["Social & Emotional Development","#D9626B"],AL:["Approaches to Learning","#C98A0B"],LL:["Language & Literacy","#3F7FBF"],MA:["Mathematics","#6A5FC1"],SC:["Science & Discovery","#2E9561"],PH:["Physical Development & Health","#D9772B"],CA:["Creative Arts","#C0518F"]};
var ROWSTD={"Song & Fingerplays":"LL","Story":"LL","Art":"CA","Literacy":"LL","Math":"MA","Science":"SC","Gross Motor Skill":"PH","Music & Movement":"CA"};
var AGEL={1:"1 year (toddler)",2:"2 years",3:"3 years",4:"4 years",5:"5 years (pre-K)"};
var AGEG={1:"1-year-olds: sensory play, one-step directions, big safe objects, 5-minute activities, adult hands-on help.",2:"2-year-olds: simple two-step directions, lots of movement and repetition, 5-10 minutes, big chunky items.",3:"3-year-olds: short group activities, simple choices, early counting to 5, scribbling and cutting practice, 10 minutes.",4:"4-year-olds: multi-step directions, counting to 10, letter sounds, simple predictions and sharing ideas, 10-15 minutes.",5:"5-year-olds: kindergarten readiness, letter/number writing, rhyming, patterns, sorting, explaining their thinking, 15-20 minutes."};

// ---------- Helpers ----------
function $(i){return document.getElementById(i);}
function pad(n){return String(n).padStart(2,"0");}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];});}
function read(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function iso(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
function pd(s){var a=s.split("-");return new Date(+a[0],+a[1]-1,+a[2]);}
function fmt(s){return pd(s).toLocaleDateString("en-US",{month:"short",day:"numeric"});}
function cap(s){s=s.trim();return s.charAt(0).toUpperCase()+s.slice(1);}
var DB=read("tka:plans",{});
function save(){write("tka:plans",DB);if(window.scheduleScan)scheduleScan();}
function plan(k){if(!DB[k])DB[k]={theme:"",classroom:"",char:"",bible:"",sign:"",acts:[]};return DB[k];}
var NOW=new Date();
var V={ay:NOW.getMonth()>=8?NOW.getFullYear():NOW.getFullYear()-1,m:NOW.getMonth(),wk:null,view:"plan"};
function yearOf(m){return m>=8?V.ay:V.ay+1;}
function weeks(m){var y=yearOf(m),d=new Date(y,m,1),w=d.getDay(),out=[],end=new Date(y,m+1,0);
  d.setDate(d.getDate()+(w===0?1:w===6?2:1-w));
  while(d<=end){out.push(iso(d));d.setDate(d.getDate()+7);}return out;}
function actDate(k,a){var d=pd(k);d.setDate(d.getDate()+a.day);return d;}
function monthActs(m){var out=[];weeks(m).forEach(function(k){plan(k).acts.forEach(function(a){var d=actDate(k,a);if(d.getMonth()===m&&d.getFullYear()===yearOf(m))out.push({k:k,a:a,d:d});});});return out;}
function defWeek(m){var ws=weeks(m),t=iso(NOW),k=ws[0];ws.forEach(function(w){if(w<=t)k=w;});return k;}
function chips(keys){return keys.map(function(k){return "<span class=\"chip\" style=\"background:"+STD[k][1]+"\">"+esc(STD[k][0])+"</span>";}).join("");}
function pill(k,a){var c=STD[a.std[0]]?STD[a.std[0]][1]:"#888";var fl=flagLvl(a);return "<button class=\"pill"+(fl?" fl-"+fl.charAt(0):"")+"\" draggable=\"true\" data-act=\""+esc(k)+"|"+esc(a.id)+"\" style=\"border-color:"+c+";background:"+c+"22\""+(fl?" title=\""+esc(flagTip(a))+"\"":"")+">"+(fl?"⚠️ ":"")+esc(a.title)+"</button>";}

// ---------- Rendering ----------
function renderMonths(){
  $("yl").textContent=V.ay+"\u2013"+String(V.ay+1).slice(2)+" school year";
  $("months").innerHTML=ORDER.map(function(m){var n=monthActs(m).length;
    return "<button class=\"mo"+(m===V.m?" on":"")+"\" role=\"tab\" aria-selected=\""+(m===V.m)+"\" data-m=\""+m+"\">"+ME[m]+" "+MN[m].slice(0,3)+(n?"<span class=\"n\">"+n+"</span>":"")+"</button>";}).join("");
}
function renderPlan(){
  var ws=weeks(V.m);if(ws.indexOf(V.wk)<0)V.wk=defWeek(V.m);
  var k=V.wk,p=plan(k),h="<div class=\"wks noprint\">"+ws.map(function(w,i){return "<button class=\"wk"+(w===k?" on":"")+"\" data-wk=\""+w+"\">Week "+(i+1)+"<small>"+fmt(w)+"</small></button>";}).join("")+"</div>";
  h+="<div class=\"sheet\">";
  h+="<div class=\"hd\">"+
    "<label>Classroom: <input type=\"text\" data-f=\"classroom\" maxlength=\"60\" value=\""+esc(p.classroom)+"\"></label>"+
    "<label>Week of: <input type=\"text\" readonly value=\""+pd(k).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})+"\"></label>"+
    "<div class=\"hdc\"><b>Themes:</b> <span class=\"cb\"><span id=\"th-chips\">"+themeChips(p)+"</span><input type=\"text\" id=\"th-in\" autocomplete=\"off\" maxlength=\"60\" placeholder=\""+(themesOf(p).length?"Add another theme":"Pick or type a theme")+"\"><button type=\"button\" class=\"cbb noprint\" id=\"th-btn\" aria-label=\"Choose themes\">▾</button><div class=\"cbp\" id=\"th-pop\" hidden></div></span></div>"+
    "<label>Character Education: <input type=\"text\" data-f=\"char\" maxlength=\"80\" value=\""+esc(p.char)+"\"></label>"+
    "<label>Bible Lesson: <input type=\"text\" data-f=\"bible\" maxlength=\"80\" value=\""+esc(p.bible)+"\"></label>"+
    "<label>Sign Language: <input type=\"text\" data-f=\"sign\" maxlength=\"80\" value=\""+esc(p.sign)+"\"></label></div>"+
    themeNote(p);
  h+="<div class=\"tw\"><table class=\"pl\"><tr><th>Activity</th>"+DAYS.map(function(d){return "<th>"+d+"</th>";}).join("")+"<th>Standard Addressed</th></tr>";
  ROWS.forEach(function(r){
    var acts=p.acts.filter(function(a){return a.slot===r;}),used={};
    h+="<tr><th class=\"r\">"+esc(r)+"</th>";
    for(var d=0;d<5;d++){var dt=pd(k);dt.setDate(dt.getDate()+d);
      h+="<td"+(dt.getMonth()!==V.m?" class=\"off\"":"")+" data-drop=\"1\" data-k=\""+k+"\" data-d=\""+d+"\" data-r=\""+esc(r)+"\">"+acts.filter(function(a){return a.day===d;}).map(function(a){a.std.forEach(function(s){used[s]=1;});return pill(k,a);}).join("")+"<button type=\"button\" class=\"addc noprint\" data-add=\""+k+"|"+d+"|"+esc(r)+"\" aria-label=\"Add activity\">+</button></td>";}
    h+="<td>"+chips(Object.keys(used))+"</td></tr>";
  });
  $("view").innerHTML=h+"</table></div></div>";
}
function renderCal(){
  var y=yearOf(V.m),h="<div class=\"cal\">"+DAYS.map(function(d){return "<div class=\"dh\">"+d.slice(0,3)+"</div>";}).join("");
  weeks(V.m).forEach(function(k){for(var d=0;d<5;d++){var dt=pd(k);dt.setDate(dt.getDate()+d);
    if(dt.getMonth()!==V.m){h+="<div class=\"cd blank\"></div>";continue;}
    var items=plan(k).acts.filter(function(a){return a.day===d;});
    h+="<div class=\"cd"+(iso(dt)===iso(NOW)?" today":"")+"\" data-drop=\"1\" data-k=\""+k+"\" data-d=\""+d+"\"><b>"+dt.getDate()+"</b>"+items.map(function(a){return pill(k,a);}).join("")+"<button type=\"button\" class=\"addc\" data-add=\""+k+"|"+d+"|\" aria-label=\"Add activity\">+</button></div>";}});
  $("view").innerHTML=h+"</div>";
}
function renderStd(){
  var all=monthActs(V.m),cov=0,h="";
  Object.keys(STD).forEach(function(s){
    var l=all.filter(function(x){return x.a.std.indexOf(s)>=0;});if(l.length)cov++;
    h+="<div class=\"sc\" style=\"border-color:"+STD[s][1]+"\"><h3 style=\"color:"+STD[s][1]+"\">"+esc(STD[s][0])+" ("+l.length+")</h3>"+
      (l.length?"<ul>"+l.map(function(x){return "<li><a href=\"#\" data-act=\""+esc(x.k+"|"+x.a.id)+"\">"+esc(x.a.title)+"</a> <span class=\"note\">"+x.d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})+"</span></li>";}).join("")+"</ul>":"<div class=\"gap\">Nothing planned yet. Try an activity for this area!</div>")+"</div>";});
  $("view").innerHTML="<p><strong>"+cov+" of "+Object.keys(STD).length+"</strong> learning areas covered in "+MN[V.m]+".</p><div class=\"scards\">"+h+"</div>";
}
function render(){
  renderMonths();
  Array.prototype.forEach.call(document.querySelectorAll(".tab"),function(b){b.classList.toggle("on",b.dataset.v===V.view);});
  if(V.view==="plan")renderPlan();else if(V.view==="cal")renderCal();else renderStd();
  $("clr").hidden=V.view!=="plan";if(window.updateSafeBar){updateSafeBar();updateBackupNote();}
}
var E=null;
function lab(i,t){return "<label class=\"f\""+(i?" for=\""+i+"\"":"")+">"+t+"</label>";}
function wkOpts(sel){var all=weeks(V.m),ws=all.slice();if(ws.indexOf(sel)<0)ws.unshift(sel);
  return ws.map(function(w){var i=all.indexOf(w);return "<option value=\""+w+"\""+(w===sel?" selected":"")+">"+(i>=0?"Week "+(i+1)+" \u2022 ":"")+fmt(w)+(plan(w).theme?" \u2022 "+esc(plan(w).theme):"")+"</option>";}).join("");}
function dayHtml(){return DAYS.map(function(d,i){return "<button type=\"button\" class=\"tg"+(E.a.day===i?" on":"")+"\" data-day=\""+i+"\" style=\"--c:#4FA36B\">"+d+"</button>";}).join("");}
function setSlot(a,r){var o=ROWSTD[a.slot],n=ROWSTD[r];a.std=[n].concat((a.std||[]).filter(function(s){return s!==o&&s!==n;})).slice(0,3);a.slot=r;}
function rmAct(a){Object.keys(DB).forEach(function(k){if(DB[k])DB[k].acts=DB[k].acts.filter(function(x){return x!==a;});});}
function newAct(k,d,r,t){r=ROWS.indexOf(r)>=0?r:ROWS[0];return {id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),title:(t||"").slice(0,70),slot:r,theme:plan(k).theme||"",month:V.m,std:[ROWSTD[r]],age:+$("age").value,summary:"",steps:[],materials:[],tip:"",cost:"",day:d>=0&&d<5?d:0};}
function showAct(ref){var s=ref.split("|"),a=plan(s[0]).acts.filter(function(x){return x.id===s[1];})[0];if(a)openEd(s[0],a,false);}
function moveTo(k,id,nk,nd,nr){var p=plan(k),a=p.acts.filter(function(x){return x.id===id;})[0];if(!a)return;
  p.acts=p.acts.filter(function(x){return x!==a;});a.day=nd;if(nr&&nr!==a.slot)setSlot(a,nr);
  a.theme=themeFor(plan(nk),a.theme);plan(nk).acts.push(a);V.wk=nk;save();render();}
// ---------- Events ----------
document.addEventListener("click",function(e){
  var t=e.target.closest("[data-m],[data-wk],[data-v],[data-act],[data-add]");if(!t)return;
  if(t.dataset.act){e.preventDefault();showAct(t.dataset.act);return;}
  if(t.dataset.add){var q=t.dataset.add.split("|");openEd(q[0],newAct(q[0],+q[1],q[2]),true);return;}
  if(t.dataset.m!==undefined){V.m=+t.dataset.m;V.wk=defWeek(V.m);}
  if(t.dataset.wk)V.wk=t.dataset.wk;
  if(t.dataset.v)V.view=t.dataset.v;
  render();
});
document.addEventListener("input",function(e){var f=e.target.dataset&&e.target.dataset.f;if(f){plan(V.wk)[f]=e.target.value;save();}});
$("yp").onclick=function(){V.ay--;V.wk=defWeek(V.m);render();};
$("yn").onclick=function(){V.ay++;V.wk=defWeek(V.m);render();};
$("pr").onclick=function(){doPrint("week",pwHtml(V.wk));};
$("pmo").onclick=function(){doPrint("month",pmHtml(V.m));};
$("clr").onclick=function(){if(confirm("Remove every activity and note from this week?")){DB[V.wk]=null;delete DB[V.wk];save();render();}};
$("age").oninput=function(){$("agel").textContent=AGEL[$("age").value];};
$("agel").textContent=AGEL[3];
$("gm").innerHTML="<option value=\"auto\">Auto: match my idea to the best theme</option>"+ORDER.map(function(m){return "<option value=\""+m+"\">"+MN[m]+"</option>";}).join("");
$("gs").innerHTML="<option value=\"auto\">Auto: pick the best row</option>"+ROWS.map(function(r){return "<option>"+esc(r)+"</option>";}).join("");

$("gd").innerHTML="<option value=\"auto\">Auto: spread across the week</option>"+DAYS.map(function(d,i){return "<option value=\""+i+"\">"+d+"</option>";}).join("");
// ---------- Matching & placement ----------
function ms(only){return only==="auto"?ORDER.slice():[+only];}
function themeList(only){var l=[];ms(only).forEach(function(m){T[m].forEach(function(t){l.push({m:m,t:t});});});
  return l.sort(function(a,b){return (b.m===V.m)-(a.m===V.m);});}
function findTheme(s,only){s=(s||"").toLowerCase().trim();if(!s)return null;
  var l=themeList(only),i;
  for(i=0;i<l.length;i++)if(l[i].t.toLowerCase()===s)return l[i];
  for(i=0;i<l.length;i++){var x=l[i].t.toLowerCase();if(x.indexOf(s)>=0||s.indexOf(x)>=0)return l[i];}
  return null;}
function stem(w){return w.replace(/(ies|es|s|ing)$/,"");}
function scoreTheme(text,only){
  var tk=(text.toLowerCase().match(/[a-z']{3,}/g)||[]).map(stem).filter(function(w){return w.length>2;}),best=null,bs=0;
  themeList(only).forEach(function(c){var low=c.t.toLowerCase(),sc=0;tk.forEach(function(w){if(low.indexOf(w)>=0)sc++;});if(sc>bs){bs=sc;best=c;}});
  return best;}
function guessSlot(t){t=t.toLowerCase();
  var m=[[/sing|song|rhyme|fingerplay/,0],[/story|book|read/,1],[/paint|draw|color|craft|glue|collage|sticker|clay|play ?dough/,2],[/letter|alphabet|write|word|sound/,3],[/count|number|shape|sort|pattern|measure|big|small/,4],[/jump|run|hop|climb|throw|ball|balance|obstacle|outside/,6],[/dance|music|instrument|drum|move/,7]];
  for(var i=0;i<m.length;i++)if(m[i][0].test(t))return ROWS[m[i][1]];return "Science";}
function today0(){var d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate());}
function todayStr(){return new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});}
function okDay(k,d,m){var dt=pd(k);dt.setDate(dt.getDate()+d);return dt.getMonth()===m&&dt>=today0();}
function anyOk(k,m){for(var d=0;d<5;d++)if(okDay(k,d,m))return true;return false;}
function schoolAy(m){var t=today0(),cy=t.getMonth()>=8?t.getFullYear():t.getFullYear()-1;for(var ay=cy;ay<cy+3;ay++){if(new Date(m>=8?ay:ay+1,m+1,0)>=t)return ay;}return cy;}
function fixAy(m){if(new Date(yearOf(m),m+1,0)<today0())V.ay=schoolAy(m);}
function fmtD(k,d){var dt=pd(k);dt.setDate(dt.getDate()+d);return dt.toLocaleDateString("en-US",{month:"short",day:"numeric"});}
function place(a,m){
  V.m=m;fixAy(m);var ws=weeks(m),k=null,i;
  if(a.theme){k=ws.filter(function(w){var p=plan(w);return anyOk(w,m)&&(hasTheme(p,a.theme)||p.acts.some(function(x){return x.theme===a.theme;}));})[0];
    if(!k)k=ws.filter(function(w){return !themesOf(plan(w)).length&&!plan(w).acts.length&&anyOk(w,m);})[0];}
  if(!k)k=ws.indexOf(V.wk)>=0?V.wk:ws[0];
  if(!anyOk(k,m))k=ws.filter(function(w){return anyOk(w,m);})[0]||k;
  var p=plan(k),cnt=[0,0,0,0,0],ok=[];
  p.acts.forEach(function(x){if(x.slot===a.slot)cnt[x.day]++;});
  for(i=0;i<5;i++)if(okDay(k,i,m))ok.push(i);
  if(!ok.length)ok=[0,1,2,3,4];
  var best=ok[0];ok.forEach(function(d){if(cnt[d]<cnt[best])best=d;});
  var gd=$("gd").value;if(gd!=="auto"&&ok.indexOf(+gd)>=0)best=+gd;
  a.day=best;p.acts.push(a);V.wk=k;V.view="plan";save();render();
  return {k:k,day:best};}
function toAct(d,text,age,only,slotSel){
  var cl=function(s,n){return String(s==null?"":s).trim().slice(0,n);};
  var slot=slotSel!=="auto"?slotSel:(ROWS.indexOf(d.slot)>=0?d.slot:guessSlot(text));
  var th=findTheme(d.theme,only)||scoreTheme(text,only);
  var std=(Array.isArray(d.standards)?d.standards:[]).filter(function(k){return STD[k];}).filter(function(k,i,a){return a.indexOf(k)===i;}).slice(0,3);
  if(!std.length)std=[ROWSTD[slot]];
  var tc=tipCost(d,age);
  var arr=function(x,n,l){return (Array.isArray(x)?x:[]).map(function(s){return cl(s,l);}).filter(Boolean).slice(0,n);};
  return {id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),title:cl(d.title,70)||cap(text).slice(0,60),slot:slot,theme:th?th.t:"",month:th?th.m:V.m,std:std,age:age,
    summary:cl(d.summary,400),cost:cl(tc.cost,40),steps:arr(d.steps,6,300),materials:arr(d.materials,8,80),tip:cl(tc.tip,300),day:0};}

// ---------- Built-in activity bank (instant, works with no AI) ----------
// Format per theme: plural noun | singular noun | craft title | craft supplies | movement | science title~science idea | science supplies
var BANKRAW={
"Hibernation & Winter Animals":"bears|bear|Sleepy Bear Plate Puppets|paper plates, crayons or brown paint, scrap paper|tiptoe like sleepy bears|Cozy Cave Test~Build a cave from a box and feel which fabric feels warmest for a stuffed animal|a box, fabric scraps, a stuffed animal",
"Winter Weather":"snowflakes|snowflake|Coffee-Filter Snowflakes|coffee filters, washable markers, a spray bottle of water|bundle up and march through pretend snow|Weather Watch~Look out the window and match today's weather to a picture card|paper, crayons, a window",
"Mittens & Scarves":"mittens|mitten|Mitten Match Collage|paper mittens, stickers or fabric scraps, glue|put on pretend mittens and slide across the floor|Warm Hands Test~Feel a cool pack with bare hands, then with a mitten, and talk about the difference|mittens, a cool pack or bowl of cool water",
"Snowman":"snowmen|snowman|Cotton-Ball Snowmen|paper, cotton balls, glue, construction paper scraps|roll and stack like a snowman|Melting Snowman~Put an ice cube in a bowl, predict what will happen, and watch it melt|ice cubes, bowls, paper towels",
"Snow & Ice":"ice cubes|icicle|Salt-and-Glue Ice Art|cardstock, glue, salt, watercolor or food coloring|slip and slide on pretend ice|Ice Rescue~Freeze small toys in ice and find ways to free them with warm water and salt|toys, a tub, ice, warm water, salt",
"New Year's":"noisemakers|noisemaker|Paper-Plate Noisemakers|paper plates, dried beans or rice, strong tape, stickers|count down and jump into the new year|Bubbling Countdown~Watch baking soda and vinegar fizz while counting down from five|baking soda, vinegar, a tray, cups",
"Milk Day":"milk cartons|milk|Milk-Carton Cow Puppets|paper cups or bags, black paper, glue, crayons|stretch and pretend to milk a cow|Swirling Milk~Add a drop of food coloring and dish soap to a shallow dish of milk and watch the colors swirl|milk, food coloring, dish soap, cotton swabs, a shallow dish",
"Groundhog Day":"groundhogs|groundhog|Pop-Up Groundhog Puppets|paper cups, craft sticks, brown paper, markers|pop up and down like a groundhog|Shadow Play~Use a flashlight to make shadows of toys on a wall and see them grow and shrink|a flashlight, toys, a blank wall or sheet",
"Community Helpers":"community helpers|helper|Helper Hat Art|paper strips, tape, markers, stickers|act out what a firefighter, nurse, or mail carrier does|Mystery Helper Bag~Feel tools from different helpers in a bag and guess who uses them|a paper bag, a spoon, a toy stethoscope, dress-up tools",
"100th Day of School":"stickers|hundred|100th-Day Crowns|paper strips, dot stickers or marker dots, tape|do 10 jumps, 10 claps, and 10 hops|Count to 100 Lab~Group items into ten piles of ten and count them together|large buttons or blocks, cups, paper",
"Healthy Habits & Hygiene":"toothbrushes|toothbrush|Soap-Suds Painting|shaving foam or soap, paper, a tray|wash, brush, and scrub in a silly dance|Germ Glitter Wash~Sprinkle glitter on hands to stand for germs, then rinse with plain water and with soap and compare|glitter, water, soap, a bowl, towels",
"Friendship":"friends|friend|Friendship Chain|paper strips, tape or glue, markers|mirror a friend's moves|Sink or Float Teams~Predict with a friend which toys sink or float, then test together|a tub of water, large toys, towels",
"Valentines":"hearts|heart|Heart Collage Cards|red and pink paper, glue, crayons, scissors (adult cuts)|beat like a heart: stomp, clap, and hop|Heartbeat Check~Jump up and down, then feel your heartbeat with a hand on your chest|just our hands",
"Presidents' Day":"flags|president|Paper Top Hats and Flags|paper, crayons, tape, craft sticks|march in a parade|Red + Blue Magic~Mix red and blue paint to see what color it makes|red and blue paint, a plate, paper",
"Colors of the Rainbow":"rainbows|rainbow|Rainbow Streamers|paper strips in rainbow colors, tape, a paper plate|wave rainbow ribbons high and low|Walking Water Rainbow~Put cups of colored water in a row with paper towels between them and watch the colors travel|clear cups, water, food coloring, paper towels",
"Dr. Seuss & Friends":"silly hats|hat|Silly Striped Hats|paper strips, crayons, tape, scrap paper|wiggle and hop like silly storybook creatures|Oobleck Fun~Mix cornstarch and water and explore whether it acts like a solid or a liquid|cornstarch, water, a tray, a spoon",
"St. Patrick's Day":"shamrocks|clover|Clover Stamp Art|green paint, paper, sponges or paper cut-outs|jig and hop like a leprechaun|Green Mix~Mix yellow and blue to make green and describe what happens|yellow and blue paint or colored water, cups",
"Pets & Animal Care":"pets|pet|Paper Pet Masks|paper plates, yarn, crayons, craft sticks|crawl and meow like pets|Pet Care Sort~Sort toy animals by what they need: food, water, a bed, or play|toy pets, bowls, small baskets",
"Weather":"clouds|cloud|Cotton-Ball Cloud Collage|blue paper, cotton balls, glue|spin like wind and stomp like thunder|Rain Cloud in a Jar~Squirt shaving-foam clouds onto a jar of water and drip colored water through them|a clear jar, water, shaving foam, food coloring, a dropper",
"Dinosaurs":"dinosaurs|dinosaur|Paper-Plate Dinosaurs|paper plates, paint or crayons, paper triangles, glue|stomp and roar like dinosaurs|Fossil Dig~Bury toy dinosaurs in a tub of sand or rice and brush them out like a paleontologist|a tub, sand or rice, paintbrushes, toy dinosaurs",
"Transportation":"vehicles|vehicle|Box Cars|small boxes, paper plates for wheels, markers, tape|zoom like cars, planes, and trains|Ramp Races~Roll toy cars down a ramp and compare which goes farthest|a board or cardboard, books, toy cars",
"Easter":"eggs|egg|Paper Egg Mosaics|paper, scrap paper, glue|hop like bunnies|Egg Sort and Shake~Sort and count plastic eggs, then shake them to guess what is inside|plastic eggs, rice (sealed inside), a basket",
"Earth Day":"trees|earth|Earth Day Planet Collage|blue and green paper, glue, scrap paper|tiptoe like a tree growing and sway in the wind|Dirt Detectives~Look through a tray of soil with magnifying glasses for tiny treasures|soil, trays, a magnifying glass or clear cups",
"Spring":"sprouts|seed|Tissue-Paper Blossoms|paper, tissue paper, glue, a green marker|grow like a seed from tiny to tall|Bean in a Bag~Tape a damp paper towel and a bean to a window in a zip bag and check each day for roots|zip bags, paper towels, beans, tape",
"Rain & Puddles":"raindrops|rain|Puddle Splash Painting|blue paint, paper, sponges, cups|splash and jump in pretend puddles|Raindrop Race~Drop water on wax paper and tilt it to watch the drops roll and join|wax paper, water, droppers or spoons",
"Life Cycles":"butterflies|butterfly|Butterfly Life-Cycle Wheel|a paper plate, crayons, a paper clip|wiggle like a caterpillar, then fly like a butterfly|Growing Up Line-Up~Put picture cards of a chick, frog, or butterfly growing in order and tell its story|picture cards, a table",
"Recycling":"bottles|bottle|Recycled Robots|boxes, cardboard tubes, tape, markers|sort and toss pretend recycling into bins|Trash or Treasure Sort~Sort clean items into recycle, reuse, and trash bins|clean paper, plastic bottles, boxes, three bins",
"Birds":"birds|bird|Feather Collage Birds|paper, craft feathers or paper strips, glue|flap and glide like birds|Nest Builders~Gather grass, yarn, and leaves and try to build a nest that holds a toy egg|grass, yarn scraps, leaves, a small bowl, a toy egg",
"Baby Animals & Insects":"baby animals|baby|Handprint Chicks|yellow paint, paper, markers|hop like a bunny and waddle like a duckling|Match the Mama~Match baby animal pictures to their grown-up animals|picture cards or magazine cut-outs",
"Creepy Crawlers":"bugs|bug|Paper-Plate Ladybugs|paper plates, red paint, black paper dots, glue|crawl like caterpillars and buzz like bees|Bug Hunt~Use magnifying glasses outside or look at pictures to find bugs and count their legs|a magnifying glass or paper tube, paper, crayons",
"Flowers & Garden":"flowers|flower|Coffee-Filter Flowers|coffee filters, washable markers, a spray bottle, paper stems|stretch and bloom like a flower|Plant a Seed~Plant a seed in a cup and predict how tall it will grow|cups, soil, seeds, water",
"Mother's Day":"love notes|mom|Special Grown-Up Love Cards|paper, paint, markers|give giant pretend hugs and blow kisses|Smell and Guess~Smell safe kitchen scents like cinnamon or orange peel in covered cups and guess what they are|small covered cups, cinnamon, orange peel",
"Outer Space":"stars|star|Foil Rockets|paper, foil, tape, markers|blast off like a rocket and float like an astronaut|Moon Craters~Drop balls into flour in a pan and look at the craters they make|flour or cornmeal, a pan, balls or rocks",
"Pets":"pets|pet|Pet Portrait Bag Puppets|paper bags, markers, scrap paper|walk, hop, and swim like pets|Fur Feel Box~Feel different textures like fur, feathers, and fabric in a box and match them to pets|a box, fabric scraps, cotton, feathers",
"Seasons":"seasons|season|Four-Season Tree|paper, paint or crayons, cotton balls|spin through the seasons: bloom, sunbathe, rake, and shiver|Season Sort~Sort clothes or clothing pictures by season|clothing or picture cards, hoops or baskets",
"Fairy Tales":"castles|crown|Paper Crowns|paper strips, markers, stickers, tape|tiptoe like a fairy and stomp like a giant|Beanstalk Growth~Predict how tall a bean sprout will grow and measure it with yarn|beans, a paper towel, a zip bag, yarn",
"Memorial Day":"flags|flag|Flag Handprints|red and blue paint, white paper, brushes|march in a quiet parade|Breeze Test~Wave flags and feel the breeze, then see whether paper, cloth, or tissue flutters the most|paper, tissue, cloth strips, craft sticks, tape",
"Summer Fun":"suns|sun|Sun Paper Plate Art|paper plates, yellow paint, paper strips|splash through a pretend sprinkler|Sun and Shade~Put a toy in the sun and one in the shade and feel which is warmer|toys, a sunny spot, a shady spot",
"Camping & Nature":"tents|tent|Paper-Bag Campfires|brown paper bags, red, orange, and yellow tissue paper, glue|hike, climb, and tiptoe as if we are camping|Nature Walk Treasures~Collect leaves, sticks, and rocks (or draw them) and sort them|a paper bag, a clipboard or paper",
"Ocean & Sea Animals":"fish|fish|Sponge-Paint Ocean|paper, blue paint, sponges, crayons|swim like fish and crawl like crabs|Sink or Float~Test which items sink or float in a tub of water|a tub of water, a sponge, a spoon, a rock, a cork",
"Construction & Building":"blocks|bridge|Box Construction Trucks|boxes, paper tubes, tape, markers|dig, scoop, and dump like construction trucks|Strong Tower Test~Build with blocks or cups and test which shape stands the tallest|blocks or paper cups, a ruler or yarn",
"America the Beautiful":"stars|flag|Stars and Stripes Art|red and blue paper strips, white paper, star stickers|march to a parade beat|Firework Colors~Drop food coloring onto a wet coffee filter and watch the colors burst|coffee filters, water, food coloring or markers",
"Superheroes":"superheroes|hero|Hero Capes and Cuffs|paper bags or old T-shirts, markers, tape|fly, leap, and power-pose like superheroes|Magnet Powers~Test which items are magnetic|large magnets, a paper clip, a spoon, a crayon, foil",
"Jungle & Safari":"monkeys|monkey|Paper-Bag Safari Animals|paper bags, markers, paper scraps|swing like monkeys and stomp like elephants|Animal Footprints~Press toy animal feet into play dough and match the tracks|play dough or salt dough, toy animals",
"Zoo Animals":"zoo animals|zoo|Zoo Mask Parade|paper plates, crayons, craft sticks|waddle like penguins and stretch like giraffes|Zoo Sort~Sort toy animals by size, color, or where they live|toy animals, baskets or hoops",
"Review":"favorite things|star|Memory Scrapbook Pages|paper, crayons, stickers|freeze and act out a favorite activity from this year|Our Favorite Experiments~Repeat a favorite experiment from this year and tell what we remember|materials from a past experiment",
"Back to School":"backpacks|backpack|Backpack Crayon Rubbings|paper, crayons with the wrappers peeled, textured items|line up like ducks and walk to the classroom|Classroom Explorers~Find three things in the room that are heavy, light, big, or small and compare them|classroom objects, a basket",
"Classroom Rules":"rule cards|rule|Rule Posters|paper, crayons, stickers|play Stop and Go to practice classroom safety rules|Quiet and Loud Lab~Make quiet and loud sounds with classroom items and compare them|classroom items like blocks, a book, a cup",
"All About Me & My Favorites":"faces|me|Me Self-Portraits|paper, a mirror, crayons, yarn|freeze in a favorite pose|Mirror Detectives~Look in a mirror, notice your eyes and hair, and kindly compare with a friend|a mirror, paper, crayons",
"Emotions":"feeling faces|feeling|Feelings Faces|paper plates, crayons, craft sticks|show happy, sad, mad, and silly with our whole bodies|Calm-Down Jar~Shake a jar of water, glitter, and clear glue and watch the glitter settle like our feelings|a jar with a tight lid, water, clear glue, glitter",
"Apples":"apples|apple|Apple Stamp Painting|apple halves (adult cuts), red and green paint, paper|pick and gather apples like in an orchard|Apple Taste Test~Look at, smell, and (after checking allergies) taste red, green, and yellow apple slices and vote for a favorite|apples, a plate, paper for a vote chart",
"Colors & Shapes":"shapes|shape|Shape Collage Creatures|paper shapes, glue, crayons|walk the lines of big shapes taped on the floor|Color Mixing~Mix red, yellow, and blue paint to make orange, green, and purple|paint, plates, craft sticks, paper",
"Fall":"leaves|leaf|Leaf Rubbing Art|leaves, paper, crayons with the wrappers peeled|rake, jump, and swirl like falling leaves|Leaf Sort~Collect leaves and sort by color, size, or shape|leaves, baskets, paper",
"Leaves":"leaves|leaf|Tissue Leaf Suncatchers|clear contact paper, tissue paper, yarn|dance like leaves in the wind|Leaf Color Change~Press leaf scraps or markers onto a coffee filter and add water drops to watch the colors spread|coffee filters, leaves or markers, water",
"Fire Safety":"firefighters|fire|Firefighter Hats|red paper, tape, stickers|practice stop, drop, and roll on a mat|Hot or Not~Sort pictures of things that are hot from things that are safe to touch|picture cards, two baskets",
"Pumpkins & Farm":"pumpkins|pumpkin|Paper-Plate Pumpkins|paper plates, orange paint, green paper|roll and carry pumpkins across the patch|Pumpkin Investigation~Feel, shake, and measure a pumpkin, then scoop out the insides to explore the seeds|a pumpkin, a spoon, a tray, yarn",
"Spiders & Bats":"spiders|spider|Paper-Plate Spiders|paper plates, black paint, black paper strips|crawl like spiders and fly like bats|Web Wonder~Lay yarn on a tray to make a web and test how much it can hold|yarn, a tray, light toys",
"Halloween Fun":"costumes|ghost|Friendly Ghost Art|white paint, black paper, markers|march in a costume parade|Fizzing Pumpkin~Pour vinegar on baking soda in a cup or small pumpkin and watch it fizz|baking soda, vinegar, a cup or small pumpkin, a tray",
"Healthy Foods & Body":"fruits and veggies|vegetable|Food Plate Collage|paper plates, magazine pictures or paper food cut-outs, glue|exercise like a healthy body: stretch, jump, and run in place|Fruit and Veggie Sort~Sort real or picture produce by color and talk about how it grows|produce or picture cards, baskets",
"Thankful & Sharing":"thank-you notes|thanks|Thankful Tree|paper, a brown paper trunk, paper leaves, crayons|take turns passing a bean bag in a sharing circle|Share the Pile~Share a basket of large items fairly with a friend and count to check it is equal|baskets, large blocks or balls",
"Turkeys & Thanksgiving":"turkeys|turkey|Handprint Turkeys|paint, paper, markers|strut like a turkey|Feather Float~Drop a feather, a paper, and a small rock and watch which falls fastest|a feather, paper, a small rock, a cup",
"Five Senses":"senses|sense|Five-Senses Collage|paper, five different textures, glue|point to the body part for each sense|Mystery Smell Jars~Sniff safe smells like cinnamon, orange, and vanilla in covered containers and guess|covered containers, cinnamon, orange peel, vanilla",
"Harvest":"vegetables|harvest|Fall Vegetable Prints|potatoes or bell peppers (adult cuts), paint, paper|pick, carry, and sort pretend vegetables|Seed Hunt~Open a pumpkin, an apple, and a pepper and compare their seeds|fruits and vegetables, a spoon, a tray (wash hands, check allergies)",
"My Family":"family members|family|Family Portraits|paper, crayons, yarn|march like a family parade|Whose Is It?~Match everyday objects like a spoon, shoes, or a toy to the family member who uses them|household objects, picture cards",
"Gingerbread":"gingerbread cookies|gingerbread|Paper Gingerbread Houses|brown paper, construction paper, glue, stickers|dash and tiptoe like a gingerbread cookie|Salt Dough Science~Mix salt dough, shape cookies, and see how they change after drying (not for eating)|flour, salt, water, a bowl",
"Christmas Around the World":"ornaments|ornament|Paper Ornament Garland|paper, yarn, a hole punch (adult), crayons|dance around the world: waltz, jig, and clap|World Map Look~Find one place on a map or globe and look at one tradition from there|a globe or map, picture cards",
"Lights & Decorations":"lights|light|Paper Chain Lights|paper strips, glue or tape, markers|twinkle like lights: crouch, sparkle fingers, and glow|Light and Shadow~Shine a flashlight through paper, plastic, and foil and compare what passes through|a flashlight, wax paper, tissue, foil, plastic wrap",
"Santa & His Elves":"elves|elf|Elf Hat Collage|paper, cotton balls, glue|hop like elves packing gifts|Gift Weigh-In~Use a balance scale or your hands to compare which wrapped boxes are heavier or lighter|boxes, wrapping paper, a balance or just hands",
"Reindeer":"reindeer|reindeer|Handprint Reindeer|brown paint, paper, markers|prance and gallop like reindeer|Reindeer Tracks~Press toy feet or hands into play dough and compare big and small tracks|play dough, toys"
};
var TUNES=["Twinkle, Twinkle, Little Star","Row, Row, Row Your Boat","Mary Had a Little Lamb","The Wheels on the Bus","If You're Happy and You Know It","Old MacDonald Had a Farm"];
var CNT={1:3,2:3,3:5,4:10,5:15},CNTW={3:"three",5:"five",10:"ten",15:"fifteen"};
function band(age){return age<=2?0:age===3?1:2;}
function lc(s){s=String(s||"");return s.charAt(0).toLowerCase()+s.slice(1);}
function tc(s){return String(s||"").replace(/(^|[\s-])([a-z])/g,function(m,a,b){return a+b.toUpperCase();});}
function fill(s,c){return String(s).replace(/\{(\w+)\}/g,function(m,k){return c[k]!=null?c[k]:m;});}
function bkTheme(name,idea){
  var s=BANKRAW[name];
  if(!s){var w=String(idea||name||"our theme").toLowerCase().replace(/[^a-z0-9' &-]/g,"").trim().slice(0,40)||"our theme";
    return {n:w,o:w.split(" ").pop(),craft:cap(w)+" Collage",cmat:"paper, crayons, glue, scrap paper",move:"move like "+w,scT:"Look Closer",scD:"Look closely at pictures or objects about "+w+" and describe what we notice",smat:"pictures or safe objects about "+w+", a magnifying glass or paper tube",gen:1};}
  var p=s.split("|"),sc=(p[5]||"").split("~");
  return {n:p[0],o:p[1],craft:p[2],cmat:p[3],move:p[4],scT:sc[0],scD:sc[1]||sc[0],smat:p[6]||"",gen:0};}
var BT={
"Song & Fingerplays":[
{t:"The {NT} Song",s:"Children sing a brand-new {o} verse to the tune of “{tune}” and add a motion for each line.",
 st:["Sing “{tune}” together once so everyone knows the tune.","Make up two new lines about {n} and choose a motion for each line (clap, stomp, or wiggle).","Sing the new verse three times, getting softer, louder, or faster each time.","Let a child choose the motion for the last line."],
 m:["Your voices","Optional: a picture of a {o}"],c:"Free",
 tip:["Sing slowly and repeat one short line many times; toddlers can join in with sounds and motions.","Offer two motions to choose from for each line.","Let children suggest the new words and keep the beat with claps."],sd:["LL","CA"]},
{t:"{fwC} Little {NT}",s:"A counting-down fingerplay: {fw} little {n} leave one by one, and children count back up.",
 st:["Hold up {fw} fingers and say: “{fwC} little {n}, ready to play.”","Fold one finger down at a time as the {n} “go away”, hiding your hand behind your back at zero.","Ask “Where did the {n} go?” and bring them back one finger at a time.","Repeat, letting a child be the leader."],
 m:["Your hands"],c:"Free",
 tip:["Use just 2 or 3 fingers and let toddlers wiggle their own fingers.","Count along on fingers, showing one at a time.","Count backward and ask how many are left each time."],sd:["LL","MA"]}],
"Story":[
{t:"{NT} Story Circle",s:"Children listen to a picture book about {t} and talk about what they see and what happens.",
 st:["Pick a picture book about {t} from the library or classroom shelf.","Show the cover and ask: “What do you think this book is about?”",["Read slowly and pause on the pictures so children can point and name what they see.","Read slowly and ask a simple question on each page: “What do you see?”","Read with expression and pause to ask: “What do you think will happen next?”"],["Wave goodbye to the story and name one favorite picture.","End with one question: “What was your favorite part?”","Ask children to retell the beginning, middle, and end in their own words."]],
 m:["A picture book about {t}","A cozy reading spot"],c:"Free",
 tip:["Choose a sturdy board book and let toddlers point to and name pictures.","Let children turn the pages and answer simple what and who questions.","Encourage predictions and ask children to retell the story."],sd:["LL","AL"]},
{t:"Puppet Story Time: {NT}",s:"Children use paper stick puppets of {n} to retell or invent a short story.",
 st:["Draw simple {o} faces on paper and tape them to craft sticks (an adult prepares these for the youngest children).","Show how a puppet “talks” and moves.","Tell a three-sentence story together with a beginning, a middle, and an end.","Let children take turns making their puppets talk and act out the story."],
 m:["Paper","Craft sticks or paper bags","Crayons","Tape"],c:"About $1",
 tip:["Hold a puppet yourself and let toddlers wave and greet it.","Offer two story starters and let children choose.","Have children invent their own short story and act it out for a friend."],sd:["LL","SE"]}],
"Art":[
{t:"{craft}",s:"Children make “{craft}” with simple supplies, practicing fine-motor skills and making their own creative choices.",
 st:["Cover the table and set out the supplies.","Show a finished example, then invite children to make their own version. There is no wrong way!","Help with cutting, and let children color, glue, and decorate.","Display the finished art and let each child tell about theirs."],
 m:["{cmat}"],c:"About $2-4",
 tip:["Use washable, taste-safe materials and let toddlers scribble, dab, and tear instead of cutting.","Pre-cut shapes and let children glue and decorate freely.","Encourage children to plan their design first, and offer safety scissors for cutting practice."],sd:["CA","PH"]},
{t:"Stamp and Splash: {NT}",s:"Children explore color and texture by dabbing and stamping {n} shapes onto paper.",
 st:["Cover the table and pour a little washable paint onto a tray.","Show how to press a sponge, a cut potato, or a hand into the paint and then onto paper.","Let children fill a page with prints and name the colors they used.","Hang the pages to dry and talk about the patterns."],
 m:["Washable paint","Sponges or cut shapes","Paper","A tray"],c:"About $3",
 tip:["Let toddlers use their hands and big sponges, and expect lots of mess.","Offer two colors at a time so mixing is a happy surprise.","Ask children to make a pattern with their prints."],sd:["CA","AL"]}],
"Literacy":[
{t:"Letter Hunt: {L} is for {O}",s:"Children find the first letter of “{o}” around the room and listen for its sound.",
 st:["Write the letter {L} big on paper and show a picture of a {o}.",["Say “{o}” together, then point to the picture and repeat the word.","Say “{o}” slowly and listen for the first sound: /{l}/. Have children say it with you.","Say “{o}”, clap its syllables, and listen for the first sound /{l}/. Name other words that start with {L}."],"Hide paper letter {L}s around the room and let children find them.","Finish by tracing the {L} in the air, in a tray of salt, or with a crayon."],
 m:["Paper and a marker","A picture of a {o}","Optional: a tray of salt or sand"],c:"Free",
 tip:["Focus on hearing and repeating the word; scribbling counts as writing.","Say the sound each time a child finds a letter.","Ask children to write the letter and name another word that starts with it."],sd:["LL","AL"]},
{t:"Picture Word Match: {NT}",s:"Children match pictures of {n} to word cards, building early reading skills.",
 st:["Draw six simple {n} pictures on cards and write the word under each (an adult prepares these).","Lay the picture cards out and mix up the word cards.",["Name each picture together and let children point to the one you say.","Read each word card aloud and let children match it to a picture.","Let children try to read or sound out the word cards before matching."],["Clap and cheer after each match.","Let children place the cards in a pocket chart or on the floor.","Have children write the first letter of one word on a card."]],
 m:["Index cards or paper","Markers"],c:"Free",
 tip:["Use two or three big picture cards and say the word each time.","Use pictures with the words underneath so children can look for the first letter.","Add a blank card so children can draw and label their own picture."],sd:["LL","AL"]}],
"Math":[
{t:"Count the {NT}",s:"Children count and sort paper {n}, practicing one-to-one counting and comparing groups.",
 st:["Make {cnt} paper {n} (or gather toys) and put them in a basket.","Count them together, touching each one: one, two, three…",["Ask “Can you put the {n} in the basket?” and help them drop each one in.","Sort the {n} into two piles by color or size.","Sort the {n} into groups by color or size and count each group."],["Count the {n} back out loud when they come out.","Ask “Which pile has more?” and count to check.","Ask “Which group has more, and how many more?”"]],
 m:["Paper {n} or toys","A basket or bowl","Optional: hoops or trays for sorting"],c:"Free",
 tip:["Count to 3 with big, safe items and let toddlers carry them one by one.","Count to 5 and use words like more and fewer.","Count up to 15 and compare groups, making a simple chart."],sd:["MA","AL"]},
{t:"{NT} Patterns",s:"Children copy and make simple patterns with colored {n}.",
 st:["Cut {n} from two or three colors of paper (an adult can prepare these).",["Line up two matching {n} and say “Same!”","Make a red, blue, red, blue pattern and say it aloud together.","Make a pattern, then ask what comes next. Try a longer pattern like red, red, blue."],"Let children copy your pattern with their own {n}.","Invite children to invent a pattern and teach it to a friend."],
 m:["Colored paper","Child-safe scissors (adult cuts)","Optional: glue and a paper strip"],c:"Free",
 tip:["Focus on matching, which is the first step to patterns.","Try an AB pattern with big, easy-to-grab pieces.","Introduce ABB and ABC patterns and ask children to predict the next piece."],sd:["MA","AL"]}],
"Science":[
{t:"{scT}",s:"Children get hands-on: {scd}.",
 st:["Ask a spark question: “What do you think will happen?”","Set out the materials and show children how to begin. Try it together: {scD}.","Let children try it themselves while you describe what they see, hear, and feel.","Ask “What happened?” and let children tell or draw about it."],
 m:["{smat}"],c:"About $3",
 tip:["Keep it short and sensory, and hold any materials that could be mouthed.","Use simple words like melt, sink, float, or fizz and ask what they notice.","Ask children to predict first, compare to what happened, and draw the results."],sd:["SC","AL"]},
{t:"Mystery Bag: {NT}",s:"Children feel objects in a bag, describe what they feel, and guess what is inside.",
 st:["Put three to five safe items about {t} in an opaque bag.","Invite a child to reach in and describe what they feel: soft, bumpy, smooth, or hard.","Let friends guess, then pull the item out and name it.","Sort the items into groups by how they feel."],
 m:["An opaque bag or pillowcase","Three to five safe items about {t}"],c:"Free",
 tip:["Use one large, easy item at a time and say the words soft and bumpy.","Ask children to use a describing word before guessing.","Ask for two describing words and let children make the next mystery bag."],sd:["SC","LL"]}],
"Gross Motor Skill":[
{t:"Let’s {move}",s:"Children {move} in a playful game of go, freeze, slow motion, and super speed.",
 st:["Clear a safe open space and show the movement.","Call “Go!” and let everyone move, then call “Freeze!”","Try it in super slow motion, then super fast.","Let a child be the leader and choose the next move."],
 m:["An open, safe space"],c:"Free",
 tip:["Model every move and move alongside toddlers; keep the game short.","Add a simple rule such as freezing when the music stops.","Have children lead the game and add counting hops or balance challenges."],sd:["PH","SE"]},
{t:"{NT} Obstacle Course",s:"Children travel through a safe obstacle course with stations themed around {t}.",
 st:["Use tape, pillows, and a low box to set up a path with a few stations.","Name each station after {t}, such as “step over the logs” or “crawl through the cave.”","Show how to move through each station, then let children take turns.","Cheer them on and let them try it again in a different way."],
 m:["Painter's tape","Pillows or cushions","A cardboard box or tunnel"],c:"Free",
 tip:["Keep the course low and flat, and stay beside each child.","Use three simple stations such as crawl, step, and jump.","Add five stations, a tape balance line, and a challenge such as hopping on one foot."],sd:["PH","AL"]}],
"Music & Movement":[
{t:"{NT} Freeze Dance",s:"Children dance like {n} when the music plays and freeze in a pose when it stops.",
 st:["Choose a lively song and show a few dance moves that fit {t}.","Play the music and let children dance like {n}.","Pause the music and call “Freeze!” Hold the pose for a count of three.","Play again with a new rule: dance slow, dance low, or dance tiny."],
 m:["A music player","Optional: scarves or ribbons"],c:"Free",
 tip:["Dance with toddlers and use scarves to make it fun.","Say “freeze” and count to two before restarting.","Let children choose the next dance move or rule."],sd:["CA","PH"]},
{t:"Shake and Play: {NT} Band",s:"Children make simple shakers and play along to a steady beat, loud and quiet.",
 st:["Fill small empty bottles or boxes with rice or dried beans and seal them with strong tape (an adult does this).","Show how to shake to a steady beat while you sing or play music.","Try playing loud, then quiet, then fast, then slow.","Parade around the room like a {n} band."],
 m:["Empty bottles or small boxes","Rice or dried beans","Strong tape"],c:"About $1",
 tip:["Seal shakers very securely and supervise closely; toddlers shake along with an adult.","Let children shake to the beat and stop when you do.","Have children copy a short beat pattern of loud and quiet shakes."],sd:["CA","SE"]}]
};
function bankAct(thn,row,age,idea,avoid){
  var th=bkTheme(thn,idea),b=band(age),list=BT[row]||BT["Science"],idx=[],i;
  for(i=0;i<list.length;i++)if(!avoid||!avoid[row+"|"+thn+"|"+i])idx.push(i);
  if(!idx.length)for(i=0;i<list.length;i++)idx.push(i);
  i=idx[Math.floor(Math.random()*idx.length)];if(avoid)avoid[row+"|"+thn+"|"+i]=1;
  var X=list[i],cnt=CNT[age]||5,fc=Math.min(cnt,10),fwd=CNTW[fc]||String(fc);
  var c={n:th.n,N:cap(th.n),NT:tc(th.n),o:th.o,O:cap(th.o),L:(th.o.charAt(0)||"a").toUpperCase(),l:(th.o.charAt(0)||"a").toLowerCase(),t:thn||"our theme",
    tune:TUNES[Math.floor(Math.random()*TUNES.length)],cnt:cnt,cw:CNTW[cnt]||String(cnt),fw:fwd,fwC:cap(fwd),craft:th.craft,cmat:th.cmat,move:th.move,scT:th.scT,scd:lc(th.scD).replace(/\.$/,""),scD:th.scD.replace(/\.$/,""),smat:th.smat};
  var f=function(s){return fill(s,c);},pick=function(x){return f(Array.isArray(x)?x[b]:x);};
  var mats=[];
  X.m.forEach(function(x){if(x==="{cmat}"||x==="{smat}"){f(x).split(/,\s*/).forEach(function(y){if(y.trim())mats.push(cap(y.trim()));});}else mats.push(f(x));});
  var tip=X.tip[b],all=(mats.join(" ")+" "+th.scD+" "+th.craft).toLowerCase();
  if(/taste|smell|milk|apple|vegetable|fruit|cookie|gingerbread|cinnamon|vanilla|flour/.test(all))tip+=" Check for allergies before any taste, smell, or food activity.";
  if(b===0&&/bead|button|coin|pom-pom|cereal|seed|bean|rice|glitter|googly|bottle cap/.test(all+" "+X.m.join(" ").toLowerCase()))tip+=" For ages 1–2, use large items only and keep small pieces out of reach.";
  if(thn==="Mother's Day")tip+=" Invite children to make it for any special grown-up.";
  var summ=f(X.s);if(idea)summ="Built around your idea: “"+String(idea).slice(0,80)+"”. "+summ;
  return {title:cap(f(X.t)),theme:thn,slot:row,standards:X.sd.slice(),summary:summ,steps:X.st.map(pick),materials:mats.slice(0,8),ageTip:tip,estCost:X.c};}
function fbTheme(only){var m=only==="auto"?V.m:+only,p=plan(V.wk),th=(V.m===m&&themesOf(p)[0])?findTheme(themesOf(p)[0],String(m)):null;
  if(th)return th;var ws=weeks(m),i=Math.max(0,ws.indexOf(V.wk));return {m:m,t:T[m][i%T[m].length]};}
