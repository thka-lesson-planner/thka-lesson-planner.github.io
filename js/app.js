/* Copyright (c) 2026 Joaquin Ruby and Athena Gilbertson. All rights reserved. DO NOT REMOVE. */
/* Main button wiring, teacher-feedback fixes (custom standards, costs, age tips, editor, AI limits, week planner) and page start-up. Loads last. */
$("mh").onclick=function(){var k=V.wk,d=$("gd").value==="auto"?0:+$("gd").value,r=$("gs").value==="auto"?ROWS[0]:$("gs").value;openEd(k,newAct(k,d,r,$("idea").value.trim()),true);};
document.addEventListener("dragstart",function(e){var t=e.target.closest&&e.target.closest("[data-act]");if(t&&e.dataTransfer)e.dataTransfer.setData("text/plain",t.dataset.act);});
document.addEventListener("dragover",function(e){if(e.target.closest&&e.target.closest("[data-drop]"))e.preventDefault();});
document.addEventListener("drop",function(e){var t=e.target.closest&&e.target.closest("[data-drop]");if(!t||!e.dataTransfer)return;e.preventDefault();var q=e.dataTransfer.getData("text/plain").split("|");if(q.length===2)moveTo(q[0],q[1],t.dataset.k,+t.dataset.d,t.dataset.r||null);});
$("go").onclick=draft;
function stopAI(){
  if(!AI.busy)return;
  AI.stop=true;
  if(AI.cur){AI.cur.c=true;try{if(AI.cur.fire)AI.cur.fire();}catch(e){}}
  try{if(AI.web&&AI.web.interruptGenerate)AI.web.interruptGenerate();}catch(e){}
  var w=AI.waiters;AI.waiters=[];w.forEach(function(f){try{f();}catch(e){}});
  ["stop","ef-stop","sg-stop","sl-stop"].forEach(function(id){var b=$(id);if(b&&!b.hidden){b.disabled=true;if(b.dataset.t===undefined)b.dataset.t=b.textContent;b.textContent="\u23F9\uFE0F Stopping\u2026";}});
  say("\u23F9\uFE0F Stopping\u2026 one moment.");}
$("stop").onclick=stopAI;
$("eng").onchange=function(){write("tka:engpick",$("eng").value);say("");refresh();};
$("pol").onchange=function(){write("tka:pol",$("pol").value);refresh();};
$("cm").onchange=function(){write("tka:cm",$("cm").value);write("tka:cap","");refresh();};
$("auto").onchange=function(){write("tka:auto",$("auto").checked);};
// Quietly load the AI helper in the background a moment after the page opens, so it is ready when the teacher is.
function autoLoad(){
  if(!$("auto").checked||$("eng").value==="bank"||AI.busy||AI.loading||engReady())return;
  try{var c=navigator.connection;if(c&&c.saveData&&!engCached())return;}catch(x){}
  ensureAI().then(function(r){if(!r.ok&&r.note)$("dlnote").textContent=r.note;else if(r.note)$("dlnote").textContent=r.note;});}
$("setup").onclick=async function(){
  if(AI.busy||AI.loading)return;var b=$("setup");b.disabled=true;
  say("Setting up the AI helper…");
  var r=await ensureAI();b.disabled=false;
  say(r.ok?"The AI helper is ready! Plan it!, Plan the week, Ask AI, and the sign suggestions can use it now."+(r.note?" "+r.note:""):(r.note||"The AI helper couldn’t start."));};
// ---------- Teacher-feedback fixes (Nov 2026): custom standards, moving activities, costs, age tips, AI limits ----------
// ===== A. Customizable standards (names, colors, keywords, and which standard each planner row counts toward) =====
var STD_DEF=JSON.parse(JSON.stringify(STD)),ROWSTD_DEF=JSON.parse(JSON.stringify(ROWSTD));
var STDKW={SE:"share, friend, together, turn, team, help, feel, kind, cheer, calm, patient",AL:"curious, try again, persist, plan, imagine, explore, choose, focus, pretend",LL:"sing, word, letter, sound, story, rhyme, talk, name, read, write, trace, handwriting, pencil, alphabet",MA:"count, shape, sort, pattern, measure, how many, more, fewer, number, compare",SC:"explore, observe, predict, water, ice, melt, sink, float, mix, discover, clue, magnif, experiment, nature, weather, plant",PH:"jump, hop, run, march, throw, toss, balance, climb, crawl, tiptoe, stomp, dance, cut, trace, scribbl, grip, squeez, pinch, thread",CA:"paint, draw, colour, color, craft, glue, collage, music, drum, sculpt, sing, dance, clay"};
function stdLoad(){
  var c=read("tka:stdcfg",null);if(!c||!c.std||!Object.keys(c.std).length)return;
  Object.keys(STD).forEach(function(k){delete STD[k];});
  Object.keys(c.std).slice(0,20).forEach(function(k){var v=c.std[k];if(v&&v[0])STD[k]=[String(v[0]).slice(0,60),/^#[0-9a-fA-F]{6}$/.test(v[1])?v[1]:"#888888"];});
  if(!Object.keys(STD).length){Object.keys(STD_DEF).forEach(function(k){STD[k]=STD_DEF[k].slice();});}
  if(c.kw)Object.keys(c.kw).forEach(function(k){STDKW[k]=String(c.kw[k]).slice(0,240);});
  var first=Object.keys(STD)[0];
  Object.keys(ROWSTD).forEach(function(r){var k=c.rows&&c.rows[r];ROWSTD[r]=STD[k]?k:(STD[ROWSTD_DEF[r]]?ROWSTD_DEF[r]:first);});}
function stdSave(){write("tka:stdcfg",{std:STD,kw:STDKW,rows:ROWSTD});}
stdLoad();
function stdRe(k){var w=String(STDKW[k]||"").toLowerCase().split(/[,|]/).map(function(x){return x.trim().replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}).filter(function(x){return x.length>1;});return w.length?new RegExp(w.join("|")):null;}
function inferStd(a){var t=(a.title+" "+a.summary+" "+(a.materials||[]).join(" ")+" "+(a.steps||[]).join(" ")).toLowerCase(),out=[];
  Object.keys(STD).forEach(function(k){var r=stdRe(k);if(r&&r.test(t))out.push(k);});return out;}
function stdFor(a){var s=[ROWSTD[a.slot]||Object.keys(STD)[0]];inferStd(a).forEach(function(k){if(s.indexOf(k)<0&&s.length<3)s.push(k);});return s;}
var SYSG0=SYSG,SYS20=SYS2;
function buildSYSG(){var ks=Object.keys(STD),desc=ks.map(function(k){return k+" "+STD[k][0];}).join(", ");
  SYSG=SYSG0.replace(/STANDARDS: two or three codes from [^\n]*\n\([^\n]*\)\n/,"STANDARDS: two or three codes from "+ks.join(", ")+"\n("+desc+". Pick what the activity really teaches.)\n");
  SYSG=SYSG.replace("Rules: match the child's age;","Rules: stay on the teacher's idea; every material must be used in a step; gentle, cheerful and on-topic only, never bones, blood, death, weapons or anything scary or gross; match the child's age;");
  SYSG+="\nSports and games (lacrosse, soccer, hockey, football, baseball, karate and so on): make a gentle preschool version. Use foam or plastic scoops, soft balls, cones, buckets and targets, take turns, and skip tackling, hitting, checking, real sticks or bats, and any contact between children.";
  SYS2=SYS20+"\nStay on the activity's own subject and planner row: do not add counting or math to a literacy activity, or reading to a math one. Every material must be used in a step. Never add anything scary, gross or violent.";}
buildSYSG();
var SDW=null;
function sdRender(){
  var h=SDW.list.map(function(s,i){return "<div class=\"sdrow\"><input type=\"color\" data-i=\""+i+"\" data-f=\"color\" value=\""+esc(s.color)+"\" aria-label=\"Color\"><input type=\"text\" data-i=\""+i+"\" data-f=\"name\" maxlength=\"60\" value=\""+esc(s.name)+"\" aria-label=\"Standard name\"><input type=\"text\" data-i=\""+i+"\" data-f=\"kw\" maxlength=\"240\" value=\""+esc(s.kw)+"\" placeholder=\"keywords, like: count, shape, sort\" aria-label=\"Keywords\"><button type=\"button\" class=\"btn alt sm\" data-del=\""+i+"\" aria-label=\"Delete\">&#10005;</button></div>";}).join("");
  h+="<div class=\"btns\"><button class=\"btn alt sm\" id=\"sd-add\" type=\"button\">+ Add a standard</button></div><h4 style=\"color:var(--leaf);margin:14px 0 4px\">Which standard does each activity type count toward?</h4>"+
    ROWS.map(function(r,i){return "<div class=\"sdrow\"><span style=\"flex:1\">"+esc(r)+"</span><select data-row=\""+i+"\" style=\"width:auto;flex:1\">"+SDW.list.map(function(s){return "<option value=\""+esc(s.k)+"\""+(SDW.rows[r]===s.k?" selected":"")+">"+esc(s.name||"(unnamed)")+"</option>";}).join("")+"</select></div>";}).join("");
  $("sd-body").innerHTML=h;}
function stdOpen(){
  SDW={list:Object.keys(STD).map(function(k){return {k:k,name:STD[k][0],color:STD[k][1],kw:STDKW[k]||""};}),rows:JSON.parse(JSON.stringify(ROWSTD))};
  $("dbody").innerHTML="<div class=\"dlgh\"><h2>&#9881;&#65039; Customize standards</h2></div><div class=\"dlgb\"><p class=\"note\">Rename the standards, change their colors, or add your own, such as a school goal. The keywords tell the planner when to tag an activity with that standard. Separate keywords with commas.</p><div id=\"sd-body\"></div><div id=\"sd-msg\" class=\"note\" aria-live=\"polite\"></div><div class=\"btns\"><button class=\"btn\" id=\"sd-save\" type=\"button\">Save</button><button class=\"btn alt\" id=\"sd-reset\" type=\"button\">Back to Idaho STARS</button><button class=\"btn alt\" id=\"sd-cancel\" type=\"button\">Cancel</button></div></div>";
  sdRender();
  var body=$("sd-body");
  body.oninput=function(e){var t=e.target,i=+t.dataset.i;if(t.dataset.f&&SDW.list[i]){SDW.list[i][t.dataset.f]=t.value;}};
  body.onchange=function(e){var t=e.target;if(t.dataset.row!==undefined){SDW.rows[ROWS[+t.dataset.row]]=t.value;}else if(t.dataset.f==="name")sdRender();};
  body.onclick=function(e){var d=e.target.closest("[data-del]"),a=e.target.closest("#sd-add");
    if(d){if(SDW.list.length<2){$("sd-msg").textContent="Keep at least one standard.";return;}var i=+d.dataset.del,gone=SDW.list.splice(i,1)[0];
      ROWS.forEach(function(r){if(SDW.rows[r]===gone.k)SDW.rows[r]=SDW.list[0].k;});sdRender();}
    else if(a){if(SDW.list.length>=14){$("sd-msg").textContent="That is plenty of standards. Delete one before adding another.";return;}
      var n=1,used={};SDW.list.forEach(function(s){used[s.k]=1;});while(used["C"+n])n++;SDW.list.push({k:"C"+n,name:"",color:"#4A7BB7",kw:""});sdRender();var ins=body.querySelectorAll("input[data-f=name]");if(ins.length)ins[ins.length-1].focus();}};
  $("sd-cancel").onclick=function(){$("dlg").close();};
  $("sd-reset").onclick=function(){if(!confirm("Go back to the Idaho STARS standards? Your custom standards and keywords will be removed. Activities keep working."))return;
    try{localStorage.removeItem("tka:stdcfg");}catch(x){}
    Object.keys(STD).forEach(function(k){delete STD[k];});Object.keys(STD_DEF).forEach(function(k){STD[k]=STD_DEF[k].slice();});
    Object.keys(ROWSTD_DEF).forEach(function(r){ROWSTD[r]=ROWSTD_DEF[r];});
    STDKW={SE:"share, friend, together, turn, team, help, feel, kind, cheer, calm, patient",AL:"curious, try again, persist, plan, imagine, explore, choose, focus, pretend",LL:"sing, word, letter, sound, story, rhyme, talk, name, read, write, trace, handwriting, pencil, alphabet",MA:"count, shape, sort, pattern, measure, how many, more, fewer, number, compare",SC:"explore, observe, predict, water, ice, melt, sink, float, mix, discover, clue, magnif, experiment, nature, weather, plant",PH:"jump, hop, run, march, throw, toss, balance, climb, crawl, tiptoe, stomp, dance, cut, trace, scribbl, grip, squeez, pinch, thread",CA:"paint, draw, colour, color, craft, glue, collage, music, drum, sculpt, sing, dance, clay"};
    stdScrub();buildSYSG();save();$("dlg").close();render();say("Standards are back to Idaho STARS.");};
  $("sd-save").onclick=function(){
    var names={},bad=null;SDW.list.forEach(function(s){var n=String(s.name||"").trim();if(!n)bad="Every standard needs a name.";else if(names[n.toLowerCase()])bad="Two standards are named “"+n+"”. Please make them different.";names[n.toLowerCase()]=1;});
    if(bad){$("sd-msg").textContent=bad;return;}
    Object.keys(STD).forEach(function(k){delete STD[k];});STDKW={};
    SDW.list.forEach(function(s){STD[s.k]=[s.name.trim().slice(0,60),/^#[0-9a-fA-F]{6}$/.test(s.color)?s.color:"#888888"];STDKW[s.k]=String(s.kw||"").trim();});
    var first=SDW.list[0].k;ROWS.forEach(function(r){ROWSTD[r]=STD[SDW.rows[r]]?SDW.rows[r]:first;});
    stdScrub();stdSave();buildSYSG();save();$("dlg").close();render();say("Standards saved. Activities are tagged with your standards from now on.");};
  $("dlg").showModal();}
function stdScrub(){Object.keys(DB).forEach(function(k){var p=DB[k];if(!p||!p.acts)return;p.acts.forEach(function(a){a.std=(a.std||[]).filter(function(s){return STD[s];});if(!a.std.length)a.std=[ROWSTD[a.slot]||Object.keys(STD)[0]];});});}
stdScrub();
var __rStd=renderStd;
renderStd=function(){__rStd();$("view").insertAdjacentHTML("beforeend","<p class=\"noprint\"><button class=\"btn alt\" id=\"std-cfg\" type=\"button\">&#9881;&#65039; Customize standards</button></p>");$("std-cfg").onclick=stdOpen;};

// ===== B. Estimated cost from the materials list (also for hand-typed activities) =====
var PRICE=[[/\b(water|ice|snow|air|sunlight|shadows?|leaves|sticks|rocks?|stones?|pebbles?|dirt|grass|mud|puddles?|your hands?|hands|voices?|bodies|body|music|songs?|story|book|books|pictures?)\b/,0],
 [/\b(blocks?|toys?|toy \w+|figures?|dinosaurs?|animals?|dolls?|puppets?|cars?|trucks?|trays?|bins?|tubs?|buckets?|bowls?|cups?|spoons?|plates?|scissors|table|chairs?|tape measure|timer|bell|drum|instruments?|basket|baskets|mats?|hoops?|cones?|balls?|beanbags?|scarves?|blankets?|pillows?)\b/,0.5],
 [/\b(paper (?:bags?|plates?|cups?|towels?|rolls?)|newspaper|cardboard|boxes?|egg cartons?|tubes?|bottles?|cans?|jars?|lids?|bottle caps?|scrap|scraps|recycled|junk|magazines?)\b/,0.5],
 [/\b(paper|construction paper|cardstock|poster ?board|butcher paper|coloring pages?|worksheets?)\b/,1.5],
 [/\b(crayons?|chalk|pencils?|markers?|colored pencils?|pens?|stamps?|ink)\b/,2],
 [/\b(paint|paints|watercolors?|tempera|finger ?paint|brush|brushes|sponges?|rollers?)\b/,3],
 [/\b(glue|tape|stickers?|stapler|staples|paper clips?|clothespins?|string|yarn|ribbon|twine|rubber bands?|pipe cleaners?|craft sticks?|popsicle sticks?|cotton balls?|cotton swabs?|feathers?|buttons?|beads?|sequins?|googly eyes|pom.?poms?|foam|felt|fabric|tissue paper|streamers?|doilies)\b/,2],
 [/\b(glitter|confetti|food coloring|shaving cream|play ?dough|clay|modeling|slime|oobleck|cornstarch|baking soda|vinegar|flour|salt|sugar|rice|beans|lentils|pasta|oats|cereal|sprinkles|cinnamon|vanilla|cocoa|pudding|gelatin)\b/,2],
 [/\b(sand|kinetic sand|sensory|water beads|bubbles?|bubble solution|balloons?|magnets?|magnifying glass|flashlights?|batteries|thermometer|seeds?|soil|potting|plants?|flowers?|bulbs?|pumpkins?|apples?|fruit|vegetables?|lemons?|oranges?|bananas?|carrots?|potatoes|eggs?|milk|bread|cheese|crackers?|raisins|marshmallows|cookies?|candy)\b/,3],
 [/\b(puzzles?|cards?|flash ?cards?|dice|dominoes|counters?|bingo|game|games|stuffed|costumes?|hats?|capes?|masks?|wigs?|lanterns?|lights?|bells)\b/,3]];
function costOf(mats){var tot=0,n=0;(mats||[]).forEach(function(m){var t=String(m||"").toLowerCase().trim();if(!t)return;n++;var p=null;for(var i=0;i<PRICE.length;i++)if(PRICE[i][0].test(t)){p=PRICE[i][1];break;}tot+=p==null?1:p;});return n?tot:null;}
function costLabel(mats){var t=costOf(mats);if(t==null)return "";if(t<1)return "Under $1";return "About $"+Math.ceil(t);}
function costNum(s){s=String(s||"");if(/under|free|no cost/i.test(s))return 0.5;var m=s.replace(/,/g,"").match(/\$\s?(\d+(?:\.\d+)?)/);return m?parseFloat(m[1]):null;}

// ===== C. Age tips that fit the activity (including handwriting) =====
var TIPK=[
 ["write",/\b(handwrit\w*|trac(?:e|es|ing)|writ(?:e|ing)|pencils?|letter formation|form(?:ing)? letters|print(?:ing)? letters|copy (?:letters|words)|name writing)\b/],
 ["cut",/\b(scissors|cutting|snip\w*)\b/],
 ["art",/\b(paint\w*|draw\w*|crayons?|markers?|collage|glue|gluing|craft\w*|sculpt\w*|clay|play ?dough|stamp\w*|coloring)\b/],
 ["math",/\b(count\w*|number\w*|shapes?|sort\w*|pattern\w*|measur\w*|how many|compar\w*)\b/],
 ["lit",/\b(letters?|sounds?|rhym\w*|alphabet|read\w*|words?|stor(?:y|ies)|book|books|sing\w*|song|songs)\b/],
 ["move",/\b(jump\w*|hop\w*|run\w*|march\w*|balanc\w*|climb\w*|crawl\w*|stomp\w*|throw\w*|toss\w*|dance|dancing|gallop\w*|tiptoe\w*|freeze)\b/],
 ["music",/\b(music|drum\w*|rhythm|instrument\w*|shak\w*|clap\w*)\b/],
 ["sci",/\b(predict\w*|experiment\w*|observe\w*|sink|float|melt\w*|magnif\w*|explor\w*|discover\w*|plant\w*|weather|volcano|mix\w*)\b/],
 ["social",/\b(share|sharing|turns?|friends?|together|partner\w*|kind\w*|feelings?|team)\b/]];
var TIPS={
 write:["Keep it playful: draw big lines and circles in sand, shaving cream or the air with a whole arm, and let them scribble. Real letters come later.","Offer chunky crayons or short chunky pencils and big paper. Scribbles and lines are great handwriting practice. Show a relaxed grip, and don't worry about letter shapes yet.","Start with big movements: trace letters in sand, air or on a tray before paper. Use short chunky pencils, show a pinch grip, and praise effort over neatness.","Give a starting dot and arrow for each letter stroke, use short pencils or crayons, and keep sessions to 5 minutes. Practice big first (air, sand), then small on lined paper.","Use lined paper or boxes, show where each letter starts, and have them trace first, then copy. Check pencil grip kindly, keep it short, and celebrate neat tries."],
 cut:["Skip scissors at this age. Let them tear, squeeze and poke paper or play dough instead. Stay close.","Offer safe child scissors only with an adult beside them, or let them tear paper. Cutting snips along a thick line is plenty.","Start with snipping paper strips, then cutting along a thick line. Show a thumb-up grip and always supervise scissors.","Draw bold lines or curves to cut along, and let them hold the paper with the helper hand. Supervise scissors closely.","Offer shapes with curves and corners to cut, and let them plan their cuts first. Keep scissors in sight of an adult."],
 art:["Use big paper and chunky tools. The mess and exploring matter more than the picture, so use only taste-safe materials and stay close.","Let them choose colors and just explore. Describe what they do rather than judging it. Use big brushes and washable, non-toxic supplies.","Offer choices (two colors, two tools) and talk about what they made. Praise effort and keep steps to two or three.","Add a challenge like a picture of their own idea, and let them tell you the story of it. Encourage trying new tools.","Invite them to plan first and share what they made. Add small details or a title, and let older children help set up and clean up."],
 math:["Count together to 2 or 3 with real objects they can touch. Use big pieces and say each number out loud.","Count to 5 with objects they can hold. Let them touch each one as you count, and keep it playful.","Count to 5 or 10 together, point to each object, and ask \"how many?\" Sort by one thing, like color or size.","Count to 10 and compare groups (more, fewer, same). Let them make simple patterns of two colors.","Count past 10, add or take away a few, and make AB or ABC patterns. Ask them to explain how they know."],
 lit:["Use simple words, point to pictures, and repeat the same words and songs again and again.","Say short rhymes with actions, name pictures, and let them fill in the last word. Repeat favorites.","Emphasize the first sound of a word, sing, and read a short story. Ask what they notice in the pictures.","Play with rhyming and first sounds, ask \"what happens next?\", and let them retell the story in their own words.","Have them find letters and sounds, rhyme, and retell the story with a beginning, middle and end. Add a letter to find or write."],
 move:["Keep movements big and simple, in a clear safe space. Do the move together first, and stay close.","Show each move first, keep it short, and give lots of repeats. Make sure the space is clear and an adult is close.","Add simple rules like freeze or go slow and fast. Take turns and rest between rounds.","Add a challenge, like balancing or a short obstacle path, and let them take turns leading. Check that the space is clear.","Let them invent a move or lead the group. Add a simple sequence of two or three moves to remember."],
 music:["Keep it short, repeat songs, and use simple shakers or clapping. Model the beat for them.","Clap or tap the beat together and sing slowly. Repeat favorite songs and let them move however they like.","Echo simple rhythms, play fast and slow, and take turns being the leader.","Try short patterns to copy (clap, clap, stomp) and let them choose a song. Practice stopping together.","Let them make up a verse or pattern and teach it to friends. Add loud/soft or fast/slow challenges."],
 sci:["Let them touch, pour and look closely. Use real objects, name what they see, and stay close.","Ask one simple question (\"what do you see?\") and let them explore. Use big, safe materials and wait for their ideas.","Ask them to guess what will happen, then try it together. Talk about what they saw, and repeat it a second way.","Let them predict, test and tell what happened. Ask \"why do you think?\" and try changing one thing.","Have them make a prediction, test it, and draw or tell what they found. Encourage new questions."],
 social:["Stay beside them and model sharing and taking turns with simple words. Expect short attention.","Keep groups tiny and have enough of each material. Model words like \"my turn, your turn\".","Practice taking turns with a visual cue, and name feelings out loud. Praise kind moments.","Let them solve small problems together and use words for feelings. Rotate partners and jobs.","Give each child a role and let the group make a plan. Encourage them to explain feelings and fix problems kindly."],
 gen:["Use big, safe pieces, keep it short, and stay close to help.","Give one or two simple steps and plenty of time to explore.","Keep directions to two or three steps and offer one choice.","Add a small challenge or choice and let them explain what they did.","Let them plan, try and explain their thinking, and add a small extra challenge."]};
function actText(a){return [a.title,a.summary].concat(a.materials||[],a.steps||[]).join(" ").toLowerCase();}
function tipKind(t,slot){for(var i=0;i<TIPK.length;i++)if(TIPK[i][1].test(t))return TIPK[i][0];
  var r={"Song & Fingerplays":"music","Story":"lit","Art":"art","Literacy":"lit","Math":"math","Science":"sci","Gross Motor Skill":"move","Music & Movement":"music"}[slot];return r||"gen";}
function ageTipFor(t,age,slot){age=Math.max(1,Math.min(5,+age||3));var k=tipKind(String(t||"").toLowerCase(),slot);return TIPS[k][age-1];}
var TIPTOP={math:/\b(count\w*|number\w*|shapes?|sort\w*|pattern\w*|measur\w*|how many|add\w*|subtract\w*)\b/,lit:/\b(letters?|sounds?|rhym\w*|alphabet|read\w*|spell\w*)\b/,sci:/\b(predict\w*|experiment\w*|observe\w*|sink|float|melt\w*)\b/,write:/\b(handwrit\w*|pencil\w*|trac(?:e|ing))\b/};
function tipFits(tip,text){var ok=true;Object.keys(TIPTOP).forEach(function(k){if(TIPTOP[k].test(String(tip).toLowerCase())&&!TIPTOP[k].test(text))ok=false;});return ok;}
function tipCost(d,age,slot){var tip=String(d.ageTip||"").trim(),cost=String(d.estCost||"").trim();
  if(/\$\s?\d|\bcosts?\b|\bbudget\b/i.test(tip)){if(!cost)cost=tip;tip="";}
  var txt=actText({title:d.title,summary:d.summary,materials:d.materials,steps:d.steps});
  if(tip&&(tip.length<25||!tipFits(tip,txt)))tip="";
  if(!tip)tip=ageTipFor(txt,age,slot||d.slot);
  if(!cost)cost=costLabel(d.materials);
  return {tip:tip,cost:cost};}

function isoOf(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function parseDate(s){var a=String(s||"").split("-");return a.length===3?new Date(+a[0],+a[1]-1,+a[2]):null;}
function mondayOf(d){var m=new Date(d.getFullYear(),d.getMonth(),d.getDate());m.setDate(m.getDate()-((m.getDay()+6)%7));return m;}
function nextWeekday(d){d=new Date(d.getFullYear(),d.getMonth(),d.getDate());while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()+1);return d;}
function gDate(){var d=parseDate($("gdate").value);if(!d||isNaN(d))return null;if(d<today0())d=today0();return nextWeekday(d);}
function gdSay(d){var em=["\uD83C\uDF1E","\uD83C\uDF08","\uD83D\uDC1B","\uD83E\uDD8B","\uD83C\uDF89"][(d.getDay()+6)%7%5],n=Math.round((d-today0())/864e5),
  when=n===0?"that\u2019s today!":n===1?"that\u2019s tomorrow!":n<7?"in "+n+" days":n<14?"next week":"in "+Math.round(n/7)+" weeks";
  return em+" "+d.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})+" \u2014 "+when;}
function gdSet(d,msg){var g=$("gdate");g.value=isoOf(d);$("gdnote").textContent=msg||"";$("gdsay").textContent=gdSay(d);}
function gdInit(){var g=$("gdate"),t=today0();g.min=isoOf(t);
  var nm=nextWeekday(t);nm.setDate(nm.getDate()+((8-nm.getDay())%7||7));
  var q=function(k){var d=k==="today"?t:k==="tom"?new Date(t.getFullYear(),t.getMonth(),t.getDate()+1):nm;return d;};
  Array.prototype.forEach.call($("gdchips").children,function(b){var d=q(b.dataset.q);if(b.dataset.q!=="mon"&&(d.getDay()===0||d.getDay()===6))b.hidden=true;b.onclick=function(){gdSet(d,"");};});
  g.onchange=function(){var d=parseDate(g.value),msg="";if(!d||isNaN(d)){gdSet(nextWeekday(t),"");return;}
    if(d<t){d=t;msg="That day has already passed, so I picked today. ";}var d2=nextWeekday(d);if(+d2!==+d){msg+="School runs Monday to Friday, so I hopped to "+DAYS[(d2.getDay()+6)%7]+". ";d=d2;}
    gdSet(d,msg);};
  gdSet(g.value&&parseDate(g.value)>=t?nextWeekday(parseDate(g.value)):nextWeekday(t),"");}
gdInit();
var __place=place;
place=function(a,m){var d=gDate();if(!d)return __place(a,m);var mo=d.getMonth();try{fixAy(mo);}catch(e){}
  var k=isoOf(mondayOf(d)),p=plan(k);a.day=(d.getDay()+6)%7;a.month=mo;a.theme=themeFor(p,a.theme);p.acts.push(a);V.m=mo;V.wk=k;V.view="plan";save();render();return {k:k,day:a.day,m:mo};};
$("mh").onclick=function(){var d=gDate()||nextWeekday(today0()),k=isoOf(mondayOf(d)),r=$("gs").value==="auto"?ROWS[0]:$("gs").value;V.m=d.getMonth();openEd(k,newAct(k,(d.getDay()+6)%7,r,$("idea").value.trim()),true);};
var __monthPlan=monthPlan;
monthPlan=function(){
  if(AI.busy)return;
  $("dbody").innerHTML="<div class=\"dlgh\"><h2>&#128467;&#65039; Plan the whole month</h2></div><div class=\"dlgb\"><label class=\"f\" for=\"pm-m\">Which month?</label><select id=\"pm-m\">"+ORDER.map(function(m){return "<option value=\""+m+"\""+(m===V.m?" selected":"")+">"+MN[m]+" "+yearOf(m)+"</option>";}).join("")+"</select><p class=\"note\">Fills the school days still ahead in that month. Anything already planned stays.</p><div class=\"btns\"><button class=\"btn\" id=\"pm-go\" type=\"button\">Plan this month</button><button class=\"btn alt\" id=\"pm-x\" type=\"button\">Cancel</button></div></div>";
  $("pm-x").onclick=function(){$("dlg").close();};
  $("pm-go").onclick=function(){var m=$("pm-m").value;$("dlg").close();$("gm").value=m;var rs=function(){$("gm").value="auto";};Promise.resolve(__monthPlan()).then(rs,rs);};
  $("dlg").showModal();};
$("mo").onclick=function(){monthPlan();};
// ===== D. The activity editor: month + week mover, auto standards, auto cost, a reliable Ask AI =====
function wkOptsFor(m,sel){var ws=weeks(m);return ws.map(function(w,i){return "<option value=\""+w+"\""+(w===sel?" selected":"")+">Week "+(i+1)+" • "+fmt(w)+(plan(w).theme?" • "+esc(plan(w).theme):"")+"</option>";}).join("");}
function monthOf(k){if(weeks(V.m).indexOf(k)>=0)return V.m;for(var i=0;i<12;i++)if(weeks(ORDER[i]).indexOf(k)>=0)return ORDER[i];return V.m;}
function tgHtml(){return Object.keys(STD).map(function(k){return "<button type=\"button\" class=\"tg"+(E.a.std.indexOf(k)>=0?" on":"")+"\" data-std=\""+k+"\" style=\"--c:"+STD[k][1]+"\">"+esc(STD[k][0])+"</button>";}).join("");}
function openEd(k,a,isNew){
  E={k:k,a:JSON.parse(JSON.stringify(a)),isNew:isNew,orig:a,costAuto:true,stdLock:!!a.stdLock,dirty:false};var x=E.a,m0=monthOf(k);
  var h="<div class=\"dlgh\"><h2>"+(isNew?"✏️ Add an activity":"📝 Edit activity")+"</h2></div><div class=\"dlgb\">";
  h+=lab("ef-t","Activity name")+"<textarea class=\"auto\" id=\"ef-t\" rows=\"1\" maxlength=\"70\">"+esc(x.title)+"</textarea>";
  h+=lab("ef-s","What the children do")+"<textarea class=\"auto\" id=\"ef-s\" maxlength=\"400\">"+esc(x.summary)+"</textarea>";
  h+=lab("ef-m","Materials (one per line)")+"<textarea class=\"auto\" id=\"ef-m\" maxlength=\"600\">"+esc((x.materials||[]).join("\n"))+"</textarea>";
  h+=lab("ef-p","Steps (one per line)")+"<textarea class=\"auto\" id=\"ef-p\" maxlength=\"1500\">"+esc((x.steps||[]).join("\n"))+"</textarea>";
  h+=lab("ef-i","Age tip (how to adapt it for this age)")+"<textarea class=\"auto\" id=\"ef-i\" rows=\"1\" maxlength=\"300\">"+esc(x.tip)+"</textarea><div class=\"btns\" style=\"margin-top:4px\"><button class=\"btn alt sm\" id=\"ef-tipb\" type=\"button\">&#128161; Suggest an age tip</button></div>";
  h+="<div class=\"row\"><div style=\"flex:1\">"+lab("ef-c","Estimated supply cost")+"<input type=\"text\" id=\"ef-c\" maxlength=\"40\" value=\""+esc(x.cost)+"\"><small class=\"note\" id=\"ef-cn\"></small></div><div style=\"flex:1\">"+lab("ef-a","Class age")+"<select id=\"ef-a\">"+[1,2,3,4,5].map(function(n){return "<option value=\""+n+"\""+(n===x.age?" selected":"")+">"+AGEL[n]+"</option>";}).join("")+"</select></div></div>";
  h+="<h4 style=\"color:var(--leaf);margin:14px 0 0\">Where it lives</h4>"+lab("ef-date","Date")+"<input type=\"date\" id=\"ef-date\" min=\""+isoOf(today0())+"\" value=\""+isoOf(actDate(k,x))+"\"><small class=\"note\" id=\"ef-dn\"></small>"+lab("ef-r","Activity type")+"<select id=\"ef-r\">"+ROWS.map(function(r){return "<option value=\""+esc(r)+"\""+(r===x.slot?" selected":"")+">"+esc(r)+"</option>";}).join("")+"</select>"+lab("","Standards addressed")+"<div id=\"ef-std\">"+tgHtml()+"</div><p class=\"note\" id=\"ef-sn\"></p><div class=\"btns\"><button class=\"btn alt sm\" id=\"ef-retag\" type=\"button\">&#8635; Match standards to my text</button><button class=\"btn alt sm\" id=\"ef-aistd\" type=\"button\">&#10024; Check standards with AI</button><button class=\"btn alt sm\" id=\"ef-stdcfg\" type=\"button\">&#9881;&#65039; Customize standards</button></div>";
  h+="<div id=\"ef-safe\"></div>";h+="<div class=\"aibox\"><strong>✨ Ask the AI</strong><p class=\"note\">Tell the AI what you want for this activity. It rewrites the boxes above, and you decide whether to Save.</p><textarea id=\"ef-ai\" maxlength=\"300\" style=\"min-height:60px\" placeholder=\"Examples: write steps for my idea • make it cheaper • simpler for 2-year-olds • add counting\"></textarea><div class=\"btns\"><button class=\"btn\" id=\"ef-go\" type=\"button\">Ask AI</button><button class=\"btn alt\" id=\"ef-stop\" type=\"button\" hidden>Stop</button></div></div><div id=\"edmsg\" class=\"note\" aria-live=\"polite\"></div>";
  h+="<div class=\"btns\"><button class=\"btn\" id=\"ef-save\" type=\"button\">Save</button><button class=\"btn alt\" id=\"ef-cancel\" type=\"button\">Cancel</button><button class=\"btn alt\" id=\"ef-pr\" type=\"button\">&#128424; Print</button>"+(isNew?"":"<button class=\"btn alt\" id=\"ef-del\" type=\"button\">Delete</button>")+"</div></div>";
  $("dbody").innerHTML=h;efSafeInit();edNotes();
  $("ef-std").onclick=function(e){var b=e.target.closest("[data-std]");if(!b)return;var s=b.dataset.std,i=E.a.std.indexOf(s);if(i>=0)E.a.std.splice(i,1);else E.a.std.push(s);E.stdLock=true;$("ef-std").innerHTML=tgHtml();edNotes();};
  $("ef-r").onchange=function(){setSlot(E.a,$("ef-r").value);$("ef-std").innerHTML=tgHtml();if(!E.stdLock)edRetag();};
  E.d0=isoOf(actDate(k,x));
  $("ef-date").onchange=function(){var v=$("ef-date").value,d=parseDate(v),n=$("ef-dn");if(!d||isNaN(d)){$("ef-date").value=E.d0;return;}
    var msg="";if(v!==E.d0&&d<today0()){d=today0();msg="That date has passed, so I used today. ";}
    var d2=nextWeekday(d);if(+d2!==+d){msg+="School runs Monday to Friday, so I moved it to "+DAYS[(d2.getDay()+6)%7]+". ";d=d2;}
    $("ef-date").value=isoOf(d);n.textContent=msg;E.k=isoOf(mondayOf(d));E.a.day=(d.getDay()+6)%7;E.a.month=d.getMonth();};
  $("ef-c").oninput=function(){E.costAuto=false;edNotes();};
  var live=function(){E.dirty=true;edCollect();if(E.costAuto){var c=costLabel(E.a.materials);if(c)$("ef-c").value=c;}if(!E.stdLock)edRetag(true);};
  ["ef-t","ef-s","ef-m","ef-p"].forEach(function(id){$(id).addEventListener("input",function(){clearTimeout(E.lt);E.lt=setTimeout(live,350);});});
  $("ef-tipb").onclick=function(){edCollect();$("ef-i").value=ageTipFor(actText(E.a),E.a.age,E.a.slot);autoAll();};
  $("ef-retag").onclick=function(){E.stdLock=false;edRetag();};
  $("ef-aistd").onclick=edAIStd;
  $("ef-stdcfg").onclick=function(){$("dlg").close();stdOpen();};
  $("ef-go").onclick=edAI;$("ef-stop").onclick=stopAI;
  $("ef-cancel").onclick=function(){$("dlg").close();};
  $("ef-save").onclick=edSave;
  $("ef-pr").onclick=function(){edCollect();doPrint("act",paHtml(E.k,E.a));};
  if($("ef-del"))$("ef-del").onclick=function(){rmAct(E.orig);save();$("dlg").close();render();};
  $("dlg").showModal();autoAll();}
function edNotes(){var s=$("ef-sn"),c=$("ef-cn");if(s)s.textContent=E.stdLock?"These are your own choices. Press “Match standards to my text” to let the planner choose again.":"Standards update by themselves when you change the text. Tap one to choose your own.";
  if(c)c.textContent=E.costAuto?"Updates automatically from the materials. Type your own price to override.":"Your own price is kept.";}
function edRetag(quiet){edCollect();var s=stdFor(E.a),same=s.length===E.a.std.length&&s.every(function(k){return E.a.std.indexOf(k)>=0;});E.a.std=s;$("ef-std").innerHTML=tgHtml();edNotes();return !same;}
function edCollect(){var x=E.a,g=function(i){return $(i).value;},ln=function(t){return t.split("\n").map(function(l){return l.trim();}).filter(Boolean).slice(0,10);};
  x.title=g("ef-t").replace(/\s+/g," ").trim().slice(0,70);x.summary=g("ef-s").trim();x.materials=ln(g("ef-m"));x.steps=ln(g("ef-p"));x.tip=g("ef-i").replace(/\s+/g," ").trim();x.cost=g("ef-c").trim();x.age=+g("ef-a");x.stdLock=E.stdLock||undefined;}
async function edSave(){
  edCollect();var x=E.a;if(!x.title){$("edmsg").textContent="Please give the activity a name first.";return;}
  if(!(await guardFields(["ef-t","ef-s","ef-m","ef-p","ef-i"])))return;
  edCollect();x=E.a;
  var changed=E.isNew||E.dirty||JSON.stringify([x.title,x.summary,x.materials,x.steps])!==JSON.stringify([E.orig.title,E.orig.summary,E.orig.materials||[],E.orig.steps||[]]);
  if(!E.stdLock&&changed)x.std=stdFor(x);
  if(!x.std.length)x.std=[ROWSTD[x.slot]];
  if(!x.cost||(E.costAuto&&changed)){var c=costLabel(x.materials);if(c)x.cost=c;}
  if(!x.tip)x.tip=ageTipFor(actText(x),x.age,x.slot);
  x.flags=scanText(x);x.sig=actSig(x);x.rev=undefined;
  var bad=x.flags.filter(function(f){return f.lvl==="danger";});
  if(bad.length){if(!(await safeGate(bad)))return;x.rev=x.sig;}
  x.theme=themeFor(plan(E.k),x.theme);
  var d=actDate(E.k,x);x.month=d.getMonth();
  if(!E.isNew){x.pol=true;rmAct(E.orig);}
  plan(E.k).acts.push(x);V.wk=E.k;V.m=monthOf(E.k);save();$("dlg").close();render();}
async function edAIStd(){
  var m=$("edmsg");edCollect();var x=E.a;
  if($("eng").value==="bank"||(!engReady()&&!engCached())){m.textContent="The AI helper isn’t on, so I matched your standards by keywords instead.";E.stdLock=false;edRetag();return;}
  if(AI.busy){m.textContent="The AI is busy with another job. Try again in a moment.";return;}
  AI.busy=true;AI.stop=false;busyUI(true);var b=$("ef-aistd");b.disabled=true;m.textContent="✨ Checking standards with the AI…";
  try{var eng=await untilCancel(ensureAI());if(!eng.ok){m.textContent="The AI isn’t ready, so I matched by keywords instead.";E.stdLock=false;edRetag();return;}
    var ks=Object.keys(STD),list=ks.map(function(k){return k+" = "+STD[k][0];}).join("; ");
    var msgs=[{role:"system",content:"You tag preschool activities with learning standards. Answer only with the line: STANDARDS: code, code (one to three codes, the best matches first). Codes: "+list+"."},{role:"user",content:"Activity: "+x.title+". "+x.summary+" Materials: "+(x.materials||[]).join(", ")+". Steps: "+(x.steps||[]).join(" ")}];
    var txt=await aiGen(msgs,{max:26,temp:0.2,maxSec:45});
    var got=(String(txt).match(/\b[A-Z][A-Z0-9]{0,2}\b/g)||[]).filter(function(k,i,a){return STD[k]&&a.indexOf(k)===i;}).slice(0,3);
    if(AI.stop){m.textContent="⏹️ Cancelled. Standards were not changed.";return;}
    if(!got.length){m.textContent="The AI’s answer wasn’t clear, so I matched by keywords instead.";E.stdLock=false;edRetag();return;}
    E.a.std=got;E.stdLock=true;$("ef-std").innerHTML=tgHtml();edNotes();m.textContent="Standards updated: "+got.map(function(k){return STD[k][0];}).join(", ")+". Change them if you disagree, then press Save.";
  }catch(e){m.textContent="Couldn’t finish: "+(e&&e.message?e.message:e);}
  finally{AI.busy=false;busyUI(false);b.disabled=false;}}
async function edAI(){
  var m=$("edmsg"),show=function(t){m.textContent=t;try{m.scrollIntoView({block:"nearest"});}catch(e){}};
  if(AI.busy){show("The AI is finishing another job. Yours will start the moment it is done…");var w0=Date.now();while(AI.busy&&Date.now()-w0<120000)await sleep(400);
    if(AI.busy){show("The AI is still busy. Wait for it to finish, or press Stop on the page behind this window, then try again.");return;}}
  edCollect();var x=E.a,age=x.age||+$("age").value,cmd=$("ef-ai").value.trim();
  if($("eng").value==="bank"){show("AI help is switched off. Choose Reliable mode in the Make an activity box.");return;}
  if(!engReady()&&!engCached()){show("Set up the AI helper first (the button is in the Make an activity box on the page behind this window).");return;}
  if(!cmd)cmd=(x.summary&&x.steps.length)?"Polish this activity and keep my ideas.":"Fill in whatever is missing and make it fun.";
  var gg=await guardCheck(cmd);cmd=gg.text;$("ef-ai").value=cmd;if(!gg.ok){show("");return;}
  AI.busy=true;AI.stop=false;busyUI(true);$("ef-go").disabled=true;$("go").disabled=$("mo").disabled=true;$("ef-stop").hidden=false;show("✨ Starting… the AI is reading your activity.");
  var before={"ef-t":$("ef-t").value,"ef-s":$("ef-s").value,"ef-m":$("ef-m").value,"ef-p":$("ef-p").value,"ef-i":$("ef-i").value};
  try{
    var eng=await untilCancel(ensureAI());
    if(AI.stop){show("⏹️ Cancelled. Nothing was changed.");return;}
    if(!eng.ok){show(eng.note||"The AI helper isn’t ready yet.");return;}
    AI.tag="Asking the AI";
    var cur={title:x.title,summary:x.summary,materials:x.materials,steps:x.steps,tip:x.tip,cost:x.cost,std:x.std,slot:x.slot,theme:plan(E.k).theme||x.theme||""};
    var d=await rewriteAct(cur,"The teacher's command: "+cmd+". Keep what the teacher wrote unless the command changes it.",age);
    if(AI.stop){show("⏹️ Cancelled. Nothing was changed.");return;}
    if(!d){show(AI.timedOut?"That took longer than a couple of minutes on this computer, so I stopped. Nothing was changed. Try a shorter request, or choose the Light AI size under Advanced.":"The AI’s answer couldn’t be read. Nothing was changed. Try rephrasing your request.");return;}
    var unsafe=scanText({title:d.title,summary:d.summary,materials:d.materials,steps:d.steps,tip:d.ageTip,age:age}).filter(function(f){return f.lvl==="danger";});
    if(unsafe.length&&!/safety|safe/i.test(cmd)){show("The AI’s rewrite had a safety problem ("+unsafe[0].msg+"), so your version was kept. Try rephrasing.");return;}
    var odd=oddWords([d.title,d.summary].concat(d.materials||[],d.steps||[]).join(" "),cmd+" "+x.title+" "+x.summary);
    if(odd){show("The AI added something off-topic (“"+odd+"”), so your version was kept. Try again or rephrase.");return;}
    d.slot=x.slot;var tcs=tipCost(d,age,x.slot),set=function(id,v,n){v=String(v==null?"":v).trim().slice(0,n);if(v)$(id).value=v;},ln=function(a){return (Array.isArray(a)?a:[]).map(function(t){return String(t).trim();}).filter(Boolean).join("\n");};
    set("ef-t",d.title,70);set("ef-s",d.summary,400);set("ef-m",ln(d.materials),600);set("ef-p",ln(d.steps),1500);set("ef-i",tcs.tip,300);
    E.costAuto=true;edCollect();var cl=costLabel(E.a.materials)||tcs.cost;if(cl)$("ef-c").value=cl;
    E.dirty=true;if(!E.stdLock)edRetag();autoAll();
    var names={"ef-t":"the name","ef-s":"the description","ef-m":"the materials","ef-p":"the steps","ef-i":"the age tip"},ch=[];
    Object.keys(names).forEach(function(id){if($(id).value!==before[id]){ch.push(names[id]);$(id).classList.add("flash");setTimeout(function(){var q=$(id);if(q)q.classList.remove("flash");},2500);}});
    show(ch.length?"✅ Done! The AI changed "+ch.join(", ")+" (highlighted above). Read it over, change anything you like, then press Save."+(eng.note?" "+eng.note:""):"The AI came back with almost the same activity. Try a more specific request, like “make the steps simpler”.");
  }catch(e){show("Couldn’t finish: "+(e&&e.message?e.message:e));}
  finally{AI.tag="";AI.busy=false;var gb=$("ef-go");if(gb)gb.disabled=false;busyUI(false);var sb=$("ef-stop");if(sb){sb.hidden=true;sb.disabled=false;if(sb.dataset.t)sb.textContent=sb.dataset.t;}}}

// ===== E. Keep AI drafts on-topic and gentle =====
var ODD_RE=/\b(bones?|skulls?|skeletons?|corpses?|dead|death|dying|blood\w*|bleed\w*|gore|graves?|coffins?|murder\w*|kill\w*|weapons?|stab\w*|torture\w*|vomit\w*|poop|pee|urine|maggots?|rotting|rotten|scary|creepy|spooky|haunted|demons?|devils?|zombies?)\b/i;
function oddWords(text,idea){var m=String(text||"").match(ODD_RE);if(!m)return "";var w=m[0].toLowerCase().replace(/s$/,"");if(new RegExp(w.slice(0,5),"i").test(String(idea||"")))return "";
  if(/^(bone|skeleton|skull)/.test(w)&&/\b(dinosaur|dino|fossil|archaeolog|paleont|body|x-ray|skeleton)\b/i.test(idea||""))return "";return m[0];}
function pruneMaterials(d){var steps=[d.title,d.summary].concat(d.steps||[]).join(" ").toLowerCase(),ws=wordSet(steps,3),keep=[];
  (d.materials||[]).forEach(function(m){var mw=wordSet(m,3),k=Object.keys(mw),use=!k.length;k.forEach(function(w){if(ws[w])use=true;});
    if(!use)k.forEach(function(w){for(var s in ws){if(s.length>=4&&w.length>=4&&(s.indexOf(w)===0||w.indexOf(s)===0)){use=true;break;}}});
    if(use)keep.push(m);});
  if(keep.length>=2||!(d.materials||[]).length)d.materials=keep.length?keep:d.materials;return d;}
var __draftIssues=draftIssues;
draftIssues=function(d,ctx){ctx=ctx||{};if(d&&d.materials)pruneMaterials(d);var why=__draftIssues(d,ctx);
  var odd=oddWords([d.title,d.summary].concat(d.materials||[],d.steps||[]).join(" "),(ctx.idea||"")+" "+(ctx.base||""));
  if(odd)why.push("it mentioned “"+odd+"”, which is off-topic or not gentle enough for preschoolers");
  return why.slice(0,4);};
// ===== F. Never wait forever: time limits, "quick idea" button, and a busy flag that tells the teacher =====
var __say=say;
function aiMaxSec(){if(AI.active==="claude")return 90;var t=AI.tps||0;return t&&t<6?75:100;}
var __aiGen=aiGen;
aiGen=async function(msgs,o){o=o||{};AI.timedOut=false;
  if(AI.deadline&&Date.now()>AI.deadline){AI.timedOut=true;AI.deadHit=true;return "";}
  var timer=setTimeout(function(){AI.timedOut=true;if(AI.cur){AI.cur.c=true;try{if(AI.cur.fire)AI.cur.fire();}catch(e){}}try{if(AI.web&&AI.web.interruptGenerate)AI.web.interruptGenerate();}catch(e){}},(o.maxSec||aiMaxSec())*1000);
  try{return await __aiGen(msgs,o);}finally{clearTimeout(timer);}};
var __busyUI=busyUI;
busyUI=function(b){__busyUI(b);var s=$("skipai");clearTimeout(AI.skT);
  if(b){AI.deadline=Date.now()+270000;AI.deadHit=false;AI.slowHit=false;AI.skip=false;if(s&&$("eng").value!=="bank"){s.hidden=true;AI.skT=setTimeout(function(){if(AI.busy)s.hidden=false;},(AI.active!=="claude"&&AI.tps&&AI.tps<6)?8000:25000);}}
  else if(s)s.hidden=true;};
function skipAI(){if(!AI.busy)return;AI.skip=true;AI.stop=true;if(AI.cur){AI.cur.c=true;try{if(AI.cur.fire)AI.cur.fire();}catch(e){}}try{if(AI.web&&AI.web.interruptGenerate)AI.web.interruptGenerate();}catch(e){}
  var w=AI.waiters;AI.waiters=[];w.forEach(function(f){try{f();}catch(e){}});__say("⚡ Switching to a quick built-in idea…");}

// ===== G. Plan the week: several activities per day (the AI imagines one per day, the bank fills the rest instantly) =====
function pickRowsN(n,use,focus,exclude){exclude=exclude||[];if(n<=0)return [];var g=Math.min(n,Object.keys(GROUPS).length),rows=pickRows(g,use,focus).filter(function(r){return exclude.indexOf(r)<0;});
  var rest=shuf(ROWS.filter(function(r){return rows.indexOf(r)<0&&exclude.indexOf(r)<0;}));while(rows.length<n&&rest.length)rows.push(rest.shift());return rows.slice(0,n);}
async function planWeek(){
  if(AI.busy)return;
  if(!(await guardIdea()))return;
  if(ideaStop($("idea").value.trim(),+$("age").value))return;
  var age=+$("age").value,only=$("gm").value,t0d=today0(),base=nextWeekday(t0d),k=isoOf(mondayOf(base)),p=plan(k),typed=$("idea").value.trim().slice(0,300),per=3;
  var days=[],upcoming=0,startD=(base.getDay()+6)%7;
  for(var d=startD;d<5;d++){upcoming++;var have=p.acts.filter(function(x){return x.day===d;});if(have.length<per)days.push({d:d,have:have.map(function(x){return x.slot;}),need:per-have.length});}
  if(!upcoming){say("That week is already over. Pick a current or future week on the calendar first.");return;}
  if(!days.length){say("Every day from today to Friday already has "+per+" or more activities. Remove or move one to plan more.");return;}
  var idea=typed||themeStr(p)||"";
  if(!idea){say("Type an idea for the week first (like “dinosaurs and counting”), or give this week a theme, and I’ll plan the rest of this week around it.");$("idea").focus();return;}
  V.wk=k;V.m=base.getMonth();AI.speedNote="";AI.busy=true;AI.stop=false;busyUI(true);
  var made=0,aiMade=0,bankMade=0,failed=0,eng={ok:false,note:""},tAI=0,total=days.reduce(function(s,x){return s+x.need;},0),done=0;
  try{
    var ths=themesOf(p),th=ths.length?{t:ths[0]}:(scoreTheme(idea,only)||fbTheme(only)),use={};
    p.acts.forEach(function(x){use[x.slot]=(use[x.slot]||0)+1;});
    var avoid=weekTitles(k),bavoid={};
    if($("eng").value!=="bank"){say(engReady()?"✨ Imagining your week…":"✨ Waking up the AI helper… I’ll start the moment it’s ready.");eng=await untilCancel(ensureAI());}
    for(var i=0;i<days.length&&!AI.stop;i++){
      var dd=days[i].d,dt2=pd(k);dt2.setDate(dt2.getDate()+dd);var dth=ths.length?ths[i%ths.length]:th.t,rows=pickRowsN(days[i].need,use,idea,days[i].have);
      rows.forEach(function(r){use[r]=(use[r]||0)+1;});
      for(var j=0;j<rows.length&&!AI.stop;j++){
        var a=null;done++;
        if(j===0&&eng.ok&&!AI.slowHit&&!AI.deadHit){AI.tag="✨ Imagining "+DAYS[dd]+" ("+done+" of "+total+")";var t0=Date.now();
          var g=await genAct(idea,rows[j],dth,age,avoid,p.acts);tAI+=Date.now()-t0;
          if(AI.stop&&AI.skip){AI.stop=false;AI.skip=false;eng={ok:false,note:"you chose quick ideas"};}
          if(g){a=makeAct(g,idea,age,only,rows[j],dth);aiMade++;}else if(!AI.stop)failed++;}
        if(!a&&!AI.stop){var bd=bankAct(dth,rows[j],age,idea,bavoid);a=toAct(bd,idea,age,only,rows[j]);a.theme=dth;a.bk=true;bankMade++;}
        if(a){a.month=dt2.getMonth();a.day=dd;p.acts.push(a);avoid.push(a.title);made++;save();V.view="plan";render();if(aiMade===1&&j===0&&i<days.length-1&&!a.bk)await speedCheck();}}}
    if(typed&&made)$("idea").value="";
    var wk="the week of "+fmtD(k,0);
    if(AI.stop)noteCancel("Cancelled. "+(made?made+" activit"+(made===1?"y was":"ies were")+" already added to "+wk+" and kept.":"Nothing was added to "+wk+"."));
    else say("Ta-da! "+made+" activit"+(made===1?"y":"ies")+" planned for "+wk+", around “"+idea.slice(0,60)+"”: "+aiMade+" imagined by the AI"+(bankMade?" and "+bankMade+" quick starter ideas from the built-in bank (press the ✨ wand to upgrade them)":"")+"."+(AI.slowHit?" This computer was slow, so the rest used quick ideas.":AI.deadHit?" I stopped the AI after about 4 minutes so you never wait too long; the rest used quick ideas.":"")+(eng.ok||!bankMade?"":" "+whyNot(eng,""))+" Review everything for safety and cost."+(AI.speedNote?" "+AI.speedNote:""));
  }catch(e){say("Added "+made+" activities, then stopped: "+(e&&e.message?e.message:e));}
  finally{AI.tag="";AI.busy=false;busyUI(false);save();render();}}

// ===== H. A running total of supplies for the week, and a Customize-standards button =====
var __rPlan=renderPlan;
renderPlan=function(){__rPlan();var p=plan(V.wk),tot=0,n=0,miss=0;p.acts.forEach(function(a){var c=costNum(a.cost);if(c==null)miss++;else{tot+=c;n++;}});
  var bud=budget(),over=tot>bud;
  $("view").insertAdjacentHTML("beforeend","<p class=\"note noprint\" id=\"wk-cost\">"+(p.acts.length?"Estimated supplies this week: <b>about $"+Math.round(tot)+"</b> of your $"+Math.round(bud)+" budget"+(over?" ⚠️ over budget":"")+(miss?" ("+miss+" activit"+(miss===1?"y has":"ies have")+" no price yet; open it and press Save)":"")+".":"")+" <button class=\"btn alt sm\" id=\"std-cfg2\" type=\"button\">&#9881;&#65039; Customize standards</button></p>");
  $("std-cfg2").onclick=stdOpen;};

// ===== I. Pre-read the start of the prompt (class age + the teacher's idea) while the teacher is still choosing / typing =====
// The AI reuses its "already read" memory for any prompt that starts exactly the same way, so only the last few lines need reading after the button is pressed.
function primeIdea(){
  if(AI.busy||AI.active!=="cpu"||!AI.cpu||typeof SYSG==="undefined")return;
  var age=+$("age").value,idea=$("idea").value.trim(),pre="<|im_start|>system\n"+SYSG+"<|im_end|>\n<|im_start|>user\nClass age: "+AGEL[age]+". "+AGEG[age]+"\n"+(idea.length>=4?"Teacher's idea: \u201C"+idea+"\u201D\n":"");
  if(AI.primedKey===pre)return;AI.primedKey=pre;AI.primeLen=pre.length;
  try{AI.pending=AI.cpu.createCompletion(pre,{nPredict:1,useCache:true,sampling:{temp:0}}).then(function(){},function(){});}catch(e){}}
var PRT=null;function primeSoon(ms){clearTimeout(PRT);PRT=setTimeout(primeIdea,ms||900);}
$("idea").addEventListener("input",function(){primeSoon(900);});
$("age").addEventListener("change",function(){primeSoon(300);});
var __primeCache=primeCache;
primeCache=function(){AI.primedKey="";__primeCache();primeSoon(1200);};

// ===== J. Check the teacher's idea BEFORE any waiting: stop at once if it is unsafe for preschoolers =====
function ideaStop(text,age){
  if(!text)return false;
  var fl=[];try{fl=scanText({title:text,summary:text,materials:[],steps:[text],tip:"",age:age||3}).filter(function(f){return f.lvl==="danger";});}catch(e){}
  if(!fl.length)return false;
  say("I didn\u2019t start this one, so you don\u2019t have to wait: \u201C"+text.slice(0,60)+"\u201D sounds unsafe for preschoolers. "+(fl[0].msg||"")+" Try describing a gentle version, like soft balls and targets with no contact, and press the button again.");
  try{$("idea").focus();}catch(e){}return true;}

$("skipai").onclick=skipAI;
(function init(){
  // Claude is the default once its relay is connected; a teacher's own choice in Advanced always wins.
  var co=$("eng").querySelector("option[value=claude]");if(!relayUrl()){co.disabled=true;co.textContent="Claude AI: not connected to this site yet";}
  var sv=read("tka:engpick",null);if(sv==null)sv=relayUrl()?"claude":read("tka:eng","cpu");
  sv=sv==="browser"?"cpu":sv==="sample"?"bank":sv;if(["claude","cpu","gpu","bank"].indexOf(sv)<0)sv="cpu";if(sv==="claude"&&!relayUrl())sv="cpu";
  $("eng").value=sv;
  var cm=String(read("tka:cm","auto"));$("cm").value=(cm==="auto"||CM[cm])?cm:"auto";
  var pv=String(read("tka:pol","wk"));pv=pv==="999"?"month":pv;$("pol").value=["wk","next","month"].indexOf(pv)>=0?pv:"wk";
  $("auto").checked=read("tka:auto",true)!==false;
  V.wk=defWeek(V.m);refresh();detectGpu();render();scanAll();
  window.addEventListener("online",refresh);window.addEventListener("offline",refresh);
  setTimeout(autoLoad,1500);})();
