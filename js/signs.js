/* Copyright (c) 2026 Joaquin Ruby and Athena Gilbertson. All rights reserved. DO NOT REMOVE. */
/* Sign language: the sign lesson maker and the Sign Language page. */
// ---------- Sign lesson maker: a checked library first, AI drafts only for signs the library lacks ----------
var SIGNX=[
["Hello","Greetings & Manners","Touch your flat hand's fingertips to your forehead near the temple like a salute, then move the hand out and away."],
["Goodbye","Greetings & Manners","Hold up an open hand and fold the fingers down and up a few times, like a wave."],
["Yes","Greetings & Manners","Make a fist and nod it up and down, like a head nodding."],
["No","Greetings & Manners","Tap your index and middle fingers against your thumb, like a beak closing."],
["Good","Greetings & Manners","Touch your flat fingertips to your lips, then move the hand down and land it palm-up on your other hand."],
["Bad","Greetings & Manners","Touch your flat fingertips to your lips, then flip the hand over and move it down and away, palm down."],
["Stop","Greetings & Manners","Chop the edge of one flat hand down into your other flat palm."],
["Wait","Greetings & Manners","Hold both open hands out with palms up and wiggle your fingers."],
["Again","Greetings & Manners","Curve one hand with the palm up, then arc it over and tap its fingertips into your other flat palm."],
["Excuse me","Greetings & Manners","Brush the fingertips of one hand across the palm of your other hand a couple of times."],
["I love you","Greetings & Manners","Hold up your thumb, index finger, and pinky at the same time, with your middle and ring fingers folded down."],
["Good morning","Greetings & Manners","Sign GOOD (fingertips from your lips down to your other hand), then MORNING (rest one arm across your body and raise your other hand up from the elbow like a rising sun)."],
["Good night","Greetings & Manners","Sign GOOD (fingertips from your lips down to your other hand), then NIGHT (rest one arm flat in front of you and drape your bent other hand over it like the sun going down)."],
["Please help me","Greetings & Manners","Sign PLEASE (flat hand circling on your chest), then HELP (fist with thumb up resting on your flat palm, lift both up), then point to yourself."],
["Sit","Classroom","Rest the two fingers (index and middle) of one hand on the two fingers of your other hand, like sitting on a bench."],
["Stand","Classroom","Make a V with two fingers of one hand, like legs, and stand them on your other flat palm."],
["Listen","Classroom","Cup your hand behind your ear."],
["Look","Classroom","Make a V with two fingers pointing at your eyes, then move the V forward."],
["Quiet","Classroom","Cross your flat hands at your mouth and move them down and apart, or hold a finger to your lips."],
["Teacher","Classroom","Hold your flattened hands near your forehead and move them forward (TEACH), then move both flat hands down along your sides (PERSON)."],
["School","Classroom","Clap your flat hands together twice, one hand landing on the other."],
["Bathroom","Classroom","Make a T (fist with thumb between index and middle finger) and shake it side to side."],
["Share","Classroom","Rest the edge of one flat hand on the index-finger side of your other flat hand and slide it back and forth."],
["Clean","Classroom","Wipe one flat hand across the palm of your other flat hand."],
["Wash hands","Classroom","Rub your two fists together (WASH), then slide one flat hand over the back of the other (HANDS)."],
["Come","Actions","Point both index fingers forward, then swing them back toward your body, like a beckoning wave."],
["Go","Actions","Point both index fingers toward each other, then swing them out to point forward."],
["Walk","Actions","Hold both flat hands palms down and move them forward one after the other, like taking steps."],
["Jump","Actions","Make a V with two fingers of one hand and hop them up off your other flat palm."],
["Sleep","Actions","Hold an open hand in front of your face, close it into a bunch as you move it down, and close your eyes."],
["Hungry","Feelings","Curve your hand into a C and slide it down your chest from the throat to the stomach."],
["Tired","Feelings","Rest the fingertips of both bent hands on your chest and let them droop down."],
["Hot","Actions","Hold a claw hand at your mouth and twist it forward and down, like pulling something hot away."],
["Cold","Actions","Make two fists and shiver them in front of you, with your shoulders hunched."],
["Big","Actions","Hold both L hands (thumb and index finger out) near each other and move them wide apart."],
["Little","Actions","Face your flat hands toward each other, close together, and bring them a bit closer."],
["Up","Actions","Point your index finger up and move it up."],
["Down","Actions","Point your index finger down and move it down."],
["Red","Colors","Brush your index finger downward across your lips."],
["Blue","Colors","Make a B hand (flat hand, thumb folded in) and shake it a little."],
["Yellow","Colors","Make a Y hand (thumb and pinky out) and shake it a little."],
["Green","Colors","Make a G hand (index finger and thumb pointing sideways, parallel) and shake it a little."],
["Purple","Colors","Make a P hand (like a K pointing down) and shake it a little."],
["Orange","Colors","Hold a fist at your mouth and squeeze and open it, like squeezing an orange."],
["Pink","Colors","Brush the middle finger of a P hand down across your lips."],
["Black","Colors","Draw your index finger across your forehead, from one side to the other."],
["White","Colors","Rest your fingertips on your chest, then pull the hand outward while gathering the fingertips together."],
["Brown","Colors","Make a B hand on your cheek and slide it down."],
["Bird","Play & Animals","Make a small beak with your thumb and index finger near your mouth and open and close it."],
["Fish","Play & Animals","Hold one flat hand sideways in front of you and wiggle it forward, like a fish swimming."],
["Cow","Play & Animals","Touch your thumb to your temple, with the index finger and pinky pointing up like horns, and twist."],
["Pig","Play & Animals","Rest the back of your flat hand under your chin and flap the fingers down a few times."],
["Duck","Play & Animals","Open and close your index finger, middle finger, and thumb together at your mouth like a duck's bill."],
["Cookie","Food & Drink","Twist a C hand on your other flat palm, like pressing a cookie cutter."],
["Banana","Food & Drink","Hold up one index finger like a banana and peel it with the fingers of your other hand."],
["Baby","Family & Friends","Cradle your arms and rock them side to side, like holding a baby."],
["Rain","Play & Animals","Hold both open hands up and wiggle the fingers as you move them down, like raindrops."],
["Sun","Play & Animals","Make a C hand near your eye or temple and move it up and out a little, like sunshine."],
["Snow","Play & Animals","Hold both hands up with fingers spread and flutter them down, like falling snowflakes."],
["Morning","Greetings & Manners","Rest one arm across your body, palm in, and raise your other hand up from the elbow like the sun rising."],
["Night","Greetings & Manners","Rest one arm flat in front of you and drape the other bent hand over it like the sun setting."],
["1","Numbers","Hold up your index finger."],["2","Numbers","Hold up your index and middle fingers."],["3","Numbers","Hold up your thumb, index, and middle fingers."],["4","Numbers","Hold up four fingers with your thumb tucked into your palm."],["5","Numbers","Hold up your whole hand with fingers spread."],
["6","Numbers","Touch your thumb to your pinky and hold up the other three fingers."],["7","Numbers","Touch your thumb to your ring finger and hold up the other three fingers."],["8","Numbers","Touch your thumb to your middle finger and hold up the other three fingers."],["9","Numbers","Touch your thumb to your index finger and hold up the other three fingers."],["10","Numbers","Hold up a fist with your thumb up and shake it a little."],
["A","Letters","Make a fist with your thumb resting along the side of your index finger. Palm faces out."],
["B","Letters","Hold your fingers straight up and together, with your thumb folded across your palm. Palm faces out."],
["C","Letters","Curve your fingers and thumb into the shape of the letter C."],
["D","Letters","Point your index finger up and curve your other fingers to touch your thumb, making a small circle."],
["E","Letters","Curl your fingertips down so they touch the thumb tucked underneath."],
["F","Letters","Touch your thumb and index finger in a circle and hold the other three fingers up and spread."],
["G","Letters","Point your index finger and thumb sideways, parallel to each other, like a small pinch in the air."],
["H","Letters","Point your index and middle fingers sideways together, with your thumb tucked."],
["I","Letters","Make a fist and hold up your pinky."],
["J","Letters","Hold up your pinky (like I) and draw a J in the air, curving down and back."],
["K","Letters","Hold up your index and middle fingers in a V, and rest your thumb on the base of the middle finger."],
["L","Letters","Point your index finger up and your thumb out, making an L."],
["M","Letters","Fold three fingers (index, middle, ring) down over your tucked thumb."],
["N","Letters","Fold two fingers (index and middle) down over your tucked thumb."],
["O","Letters","Touch all your fingertips to your thumb, making a round O."],
["P","Letters","Make a K (index and middle fingers out, thumb between) and point it down."],
["Q","Letters","Make a G (index finger and thumb pointing) and point it down."],
["R","Letters","Cross your index and middle fingers."],
["S","Letters","Make a fist with your thumb folded across the front of your fingers."],
["T","Letters","Make a fist and tuck your thumb between your index and middle fingers."],
["U","Letters","Hold your index and middle fingers straight up, touching each other."],
["V","Letters","Hold your index and middle fingers up and spread apart, like a peace sign."],
["W","Letters","Hold your index, middle, and ring fingers up and spread."],
["X","Letters","Make a fist and bend your index finger into a hook."],
["Y","Letters","Stick out your thumb and pinky, with the other fingers folded."],
["Z","Letters","Point your index finger and draw a Z in the air."]];
var _SA=null;function SIGNALLf(){return _SA||(_SA=SIGNS.concat(SIGNX));}
var SYN={thanks:"Thank you","thank you":"Thank you","thank-you":"Thank you",bye:"Goodbye","bye-bye":"Goodbye",goodbye:"Goodbye",finished:"All done",done:"All done","all done":"All done",angry:"Mad",mommy:"Mom",mama:"Mom",mother:"Mom",daddy:"Dad",papa:"Dad",father:"Dad",toilet:"Bathroom",restroom:"Bathroom",hi:"Hello",hey:"Hello",ily:"I love you","i love you":"I love you",sleepy:"Tired",hungry:"Hungry",doggy:"Dog",puppy:"Dog",kitty:"Cat",kitten:"Cat",quiet:"Quiet",shh:"Quiet","good morning":"Good morning","good night":"Good night","please help me":"Please help me","wash hands":"Wash hands","wash your hands":"Wash hands",handwashing:"Wash hands",pretty:"Good",sit:"Sit",stand:"Stand",cookies:"Cookie",bananas:"Banana",apples:"Apple",books:"Book",friends:"Friend",big:"Big",little:"Little",small:"Little",tiny:"Little",rainy:"Rain",sunny:"Sun",snowy:"Snow",sleep:"Sleep"};
var SCATREQ=[[/\b(colou?rs?|rainbow)\b/,"Colors"],[/\b(letters?|alphabet|abc|fingerspell\w*|spell)\b/,"Letters"],[/\b(numbers?|counting|count)\b/,"Numbers"],[/\b(feelings?|emotions?|moods?)\b/,"Feelings"],[/\b(animals?|pets?|farm)\b/,"__animals"],[/\b(family|families|people)\b/,"Family & Friends"],[/\b(food|foods|snack|snacks|mealtime|lunch)\b/,"Food & Drink"],[/\b(manners?|polite|greetings?)\b/,"Greetings & Manners"],[/\b(classroom|school|routines?|circle time)\b/,"Classroom"],[/\b(actions?|verbs?|movement|moving)\b/,"Actions"],[/\b(weather|seasons?)\b/,"__weather"]];
var ANIMALS=["Dog","Cat","Bird","Fish","Cow","Pig","Duck"],WEATHER=["Rain","Sun","Snow","Hot","Cold"];
function slugify(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
function sigFind(name){var n=String(name||"").trim().toLowerCase();if(!n)return null;var k=SYN[n]?SYN[n].toLowerCase():n;
  for(var i=0;i<SIGNALLf().length;i++)if(SIGNALLf()[i][0].toLowerCase()===k)return SIGNALLf()[i];return null;}
function parseSignAsk(q){
  var items=[],seen={},low=q.toLowerCase();
  var push=function(e,label){var key=(e?e[0]:label).toLowerCase();if(seen[key])return;seen[key]=1;items.push({name:e?e[0]:label,e:e});};
  // quoted phrases and comma/and lists
  var parts=[],qm=q.match(/[“"']([^“”"']{2,60})[”"']/g)||[];qm.forEach(function(x){parts.push(x.replace(/[“”"']/g,"").trim());});
  var rest=q.replace(/[“"']([^“”"']{2,60})[”"']/g," ");
  // whole-ask category words
  SCATREQ.forEach(function(c){if(c[0].test(low)){
    var list=c[1]==="__animals"?ANIMALS.map(sigFind):c[1]==="__weather"?WEATHER.map(sigFind):SIGNALLf().filter(function(x){return x[1]===c[1];});
    if(c[1]==="Letters"&&!/\b(alphabet|abc|all letters|every letter)\b/.test(low)){/* specific letters handled below */}
    else if(c[1]==="Numbers"&&/\b(?:number|numbers) \d/.test(low)){}
    else list.slice(0,c[1]==="Letters"?26:8).forEach(function(e){push(e);});}});
  // single letters: "letter B", "letters A, B and C"
  var lm=low.match(/\bletters? ([a-z](?:(?:\s*(?:,|and|&)\s*|\s+)[a-z])*)\b/);
  if(lm)lm[1].split(/\s*(?:,|and|&)\s*|\s+/).forEach(function(l){var e=sigFind(l.toUpperCase());if(e&&e[1]==="Letters")push(e);});
  var nm=low.match(/\bnumbers? (\d{1,2}(?:\s*(?:,|and|&|-|to)\s*\d{1,2})*)\b/);
  if(nm){var ds=nm[1].split(/\D+/).filter(Boolean).map(Number);if(/\bto\b|-/.test(nm[1])&&ds.length===2){for(var n=ds[0];n<=ds[1]&&n<=10;n++)push(sigFind(String(n)));}else ds.forEach(function(n){push(sigFind(String(n)));});}
  parts.forEach(function(p){var e=sigFind(p);if(e)push(e);else push(null,p);});
  // words and short phrases separated by commas / "and" / "plus"
  rest.split(/\s*(?:,|;|\band\b|&|\bplus\b|\bthen\b|\n)\s*/i).forEach(function(seg){var raw0=sigFind(seg.replace(/[.!?]+$/,"").trim());if(raw0&&raw0[1]!=="Letters"&&raw0[1]!=="Numbers"){push(raw0);return;}seg=seg.replace(/\b(teach|show|how to sign|sign language|sign|signs|lesson|lessons|for|the|a|an|my|our|class|kids|children|toddlers|preschoolers|year[- ]olds?|\d+[- ]year[- ]olds?|about|on|to|me|please teach|can you|want|would like|i)\b/gi," ").replace(/\s+/g," ").trim();
    if(!seg||seg.length<2)return;
    var e=sigFind(seg);if(e){push(e);return;}
    var words=seg.split(" "),got=false;
    if(words.length>1){words.forEach(function(w){var f=sigFind(w);if(f&&f[1]!=="Letters"&&f[1]!=="Numbers"){push(f);got=true;}});}
    if(!got&&!(SCATREQ.some(function(c){return c[0].test(seg.toLowerCase());})||/^(letters?|numbers?)\b/i.test(seg))&&!seen[seg.toLowerCase()]&&seg.split(" ").length<=5&&!/^\d+$/.test(seg))push(null,seg);});
  return items.slice(0,26);}
var SL={q:"",res:null,busy:false};
var GAMES=[["Sign & Freeze","Play music. When it stops, call out a sign and everyone freezes while making it. Then start the music again."],["Mystery Hands","Make a sign behind your back, then reveal it slowly. Children shout what they think it is, then copy it."],["Simon Says, Sign Edition","Say “Simon says show me ...” and name a sign. Children make it. Mix in a few without “Simon says” for giggles."],["Sign Song","Sing a familiar song and swap one word for a sign each time it comes around, like a sign-along."],["Treasure Trail","Hide a picture or toy for each word around the room. When a child finds one, the whole class makes that sign together."]];
function ageSignTip(age,hasLetters){
  var t=age<=2?"Sign slowly while saying the word, and celebrate any attempt. Little hands make approximations, and that is perfect.":age===3?"Teach no more than 3 signs in a sitting, and repeat them during routines like snack and cleanup.":"Let children teach a friend a sign, and ask them to use it in a sentence or story.";
  if(hasLetters)t+=" For letters, teach one or two at a time and trace the shape in the air first.";return t;}
function signLinkRow(name,isLetterOrNum){if(isLetterOrNum)return "";var s=slugify(name);
  return "<div class=\"sll\"><a href=\"https://www.signasl.org/sign/"+s+"\" target=\"_blank\" rel=\"noopener noreferrer\">See it signed (SignASL) ↗</a> <a href=\"https://www.signingsavvy.com/search/"+s+"\" target=\"_blank\" rel=\"noopener noreferrer\">Signing Savvy ↗</a></div>";}
var SIGN_SITES="<ul class=\"sll2\"><li><a href=\"https://www.lifeprint.com/\" target=\"_blank\" rel=\"noopener noreferrer\">Lifeprint (ASL University)</a>: free ASL lessons and dictionary</li><li><a href=\"https://www.handspeak.com/\" target=\"_blank\" rel=\"noopener noreferrer\">Handspeak</a>: ASL dictionary with video</li><li><a href=\"https://www.signasl.org/\" target=\"_blank\" rel=\"noopener noreferrer\">SignASL</a> and <a href=\"https://www.signingsavvy.com/\" target=\"_blank\" rel=\"noopener noreferrer\">Signing Savvy</a>: look up any word</li><li><a href=\"https://www.nidcd.nih.gov/health/american-sign-language\" target=\"_blank\" rel=\"noopener noreferrer\">NIDCD: American Sign Language</a> (U.S. National Institutes of Health)</li><li><a href=\"https://www.nad.org/\" target=\"_blank\" rel=\"noopener noreferrer\">National Association of the Deaf</a></li></ul>";
function buildLesson(items,age,q){
  var lib=items.filter(function(i){return i.e&&!i.ai;}),ai=items.filter(function(i){return i.ai;}),miss=items.filter(function(i){return !i.e&&!i.ai;});
  var hasL=items.some(function(i){return i.e&&i.e[1]==="Letters";}),g=GAMES[(q.length+items.length)%GAMES.length];
  var title="Sign lesson: "+q.replace(/\s+/g," ").slice(0,48),signs=[];
  var card=function(w,how,isAI,link){return "<div class=\"sgc\"><b>"+esc(w)+"</b>"+(isAI?" <span class=\"aitag\">AI draft, double-check it</span>":"")+"<p>"+esc(how)+"</p>"+link+"</div>";};
  var h="<div class=\"lesson\"><h3>"+esc(title)+"</h3><p class=\"note\">About 10 minutes • "+esc(AGEL[age])+" • "+items.length+" sign"+(items.length===1?"":"s")+"</p>";
  h+="<h4>Before class</h4><p>Practice each sign yourself first. Watch a video of each one at the links below, because the movement is hard to learn from words alone.</p>";
  h+="<h4>Warm-up (2 minutes)</h4><p>Wave hello with the sign HELLO and tell the children they are learning a new way to talk with their hands.</p><h4>Teach the signs</h4><div class=\"sgs\">";
  lib.forEach(function(i){var iz=i.e[1]==="Letters"||i.e[1]==="Numbers";h+=card((i.e[1]==="Letters"?"Letter ":i.e[1]==="Numbers"?"Number ":"")+i.e[0],i.e[2],false,signLinkRow(i.e[0],iz));signs.push({w:(i.e[1]==="Letters"?"Letter ":"")+i.e[0],how:i.e[2]});});
  ai.forEach(function(i){h+=card(i.name,i.how,true,signLinkRow(i.name,false));signs.push({w:i.name,how:i.how});});
  h+="</div>";
  if(miss.length)h+="<p class=\"note\">Not in my library yet: <b>"+miss.map(function(i){return esc(i.name);}).join(", ")+"</b>. Look them up with the links below"+(miss.length?":":"")+" "+miss.map(function(i){var s=slugify(i.name);return "<a href=\"https://www.signasl.org/sign/"+s+"\" target=\"_blank\" rel=\"noopener noreferrer\">"+esc(i.name)+" ↗</a>";}).join(" • ")+"</p>";
  h+="<h4>Practice game: "+esc(g[0])+"</h4><p>"+esc(g[1])+"</p><h4>Wrap-up</h4><p>Sign each word one more time together, then use the signs through the day (circle time, snack, cleanup).</p><h4>Teaching tip for this age</h4><p>"+esc(ageSignTip(age,hasL))+"</p>";
  h+="<div class=\"sfp caution\"><b>Please double-check.</b> Signs can vary a little by region and family. The descriptions here are short written guides, so confirm each sign with a video from a trusted ASL source, ideally with a Deaf educator.</div><h4>Check the signs and learn more</h4>"+SIGN_SITES+"</div>";
  var pr="<h1>"+esc(title)+"</h1><p>"+esc(AGEL[age])+"</p><h3>Signs</h3><ul>"+signs.map(function(s){return "<li><b>"+esc(s.w)+"</b>: "+esc(s.how)+"</li>";}).join("")+"</ul><h3>Practice game: "+esc(g[0])+"</h3><p>"+esc(g[1])+"</p><h3>Teaching tip</h3><p>"+esc(ageSignTip(age,hasL))+"</p><p style=\"font-size:9pt\">Check each sign against a trusted ASL source such as Lifeprint, Handspeak, or the NIDCD page before teaching.</p>";
  return {html:h,print:pr,signs:signs};}
function signLessonCard(){
  var h="<section class=\"card\"><h2>🎓 Ask for a sign lesson</h2><p class=\"note\">Type what you want to teach: words, letters, or phrases. Try “colors”, “please, thank you, and the letter B”, or “good morning”. Common signs come from a built-in library, so lessons appear instantly.</p>";
  h+="<textarea id=\"sl-q\" maxlength=\"200\" style=\"min-height:64px\" placeholder=\"What should we learn to sign?\">"+esc(SL.q)+"</textarea><div class=\"btns\"><button class=\"btn\" id=\"sl-go\" type=\"button\">Make my lesson</button><button class=\"btn alt\" id=\"sl-stop\" type=\"button\" hidden>Stop</button></div><div id=\"sl-msg\" class=\"msg\" aria-live=\"polite\"></div>";
  if(SL.res)h+=SL.res.html+"<div class=\"btns\"><button class=\"btn alt\" id=\"sl-add\" type=\"button\">Add these to this week’s signs</button><button class=\"btn alt\" id=\"sl-print\" type=\"button\">&#128424; Print this lesson</button></div>";
  return h+"</section>";}
async function signLesson(){
  if(SL.busy)return;SL.busy=true;
  var msg=function(t){var m=$("sl-msg");if(m)m.textContent=t;};
  try{
    var q=String(($("sl-q")&&$("sl-q").value)||SL.q||"").trim();SL.q=q;
    if(!q){msg("Type what you would like to teach first, like “colors” or “please and thank you”.");return;}
    var gr=await guardCheck(q);if(gr.text!==q){q=gr.text;SL.q=q;if($("sl-q"))$("sl-q").value=q;}if(!gr.ok){if($("sl-q"))$("sl-q").focus();return;}
    var age=+$("age").value,items=parseSignAsk(q);
    if(!items.length){msg("I couldn’t find a word, letter, or phrase in that. Try something like “the letters A and B” or “happy, sad, mad”.");return;}
    var unk=items.filter(function(i){return !i.e;}).slice(0,3),note="";
    if(unk.length&&$("eng").value!=="bank"){
      msg("✨ Checking the signs that aren’t in my library…");AI.busy=true;AI.stop=false;busyUI(true);var slb=$("sl-stop");if(slb){slb.hidden=false;slb.disabled=false;}
      try{var eng=await untilCancel(ensureAI());
        if(AI.stop)note="\u23F9\uFE0F Cancelled the AI lookup, so here is the lesson with the links only. ";
        else if(eng.ok){AI.tag="✨ Looking up signs";
          var msgs=[{role:"system",content:"You are an early-childhood teacher who knows basic American Sign Language (ASL). Only describe standard ASL signs you are confident about, in plain short words (handshape, where, movement). If you are not sure about a word, write UNSURE for it. Reply with one line per request, exactly: SIGN: word | how to make it. For a phrase, list the signs in order."},
            {role:"user",content:"Describe how to sign: "+unk.map(function(i){return i.name;}).join("; ")}];
          var txt=await aiGen(msgs,{max:300,temp:0.2,onText:function(){msg("✨ Looking up signs…");}});
          String(txt).split(/\r?\n/).forEach(function(line){var m=line.match(/SIGN\s*:\s*([^|]+)\|\s*(.+)$/i);if(!m)return;
            var how=m[2].replace(/[*_`]/g,"").trim().slice(0,260),w=m[1].replace(/[*_`"]/g,"").trim().toLowerCase();
            if(/unsure|not sure|unknown/i.test(how))return;
            unk.forEach(function(i){if(!i.ai&&(w===i.name.toLowerCase()||w.indexOf(i.name.toLowerCase())>=0||i.name.toLowerCase().indexOf(w)>=0)){i.ai=true;i.how=how;}});});}
        else note=eng.note||"";}
      finally{AI.tag="";AI.busy=false;busyUI(false);var slb2=$("sl-stop");if(slb2){slb2.hidden=true;slb2.disabled=false;if(slb2.dataset.t)slb2.textContent=slb2.dataset.t;}}}
    SL.res=buildLesson(items,age,q);renderSign();
    var m2=$("sl-msg");if(m2)m2.textContent="Here’s your lesson! "+(items.some(function(i){return !i.e&&!i.ai;})?"A few signs weren’t in my library, so use the links to look them up. ":"")+note;
  }catch(e){msg("Couldn’t make that lesson: "+(e&&e.message?e.message:e));}
  finally{SL.busy=false;}}
function slAddAll(){if(!SL.res)return;SL.res.signs.forEach(function(s){addSign(s.w,s.how);});renderSign();var m=$("sl-msg");if(m)m.textContent="Added to this week’s signs (and the Sign Language box on the weekly planner).";}
function slPrint(){if(SL.res)doPrint("act",SL.res.print);}
document.addEventListener("input",function(e){if(e.target&&e.target.id==="sl-q")SL.q=e.target.value;});
// ---------- Sign language page ----------
var SIGNS=[["Please","Classroom","Flat hand on your chest, rubbed in a circle."],["Thank you","Classroom","Flat fingertips touch your chin, then move forward and down toward the person."],["More","Classroom","Bring the bunched fingertips of both hands together and tap them twice."],["All done","Classroom","Hold both hands up with palms facing you, then flip them outward."],["Help","Classroom","Make a thumbs-up fist, rest it on your other flat palm, and lift both hands together."],["Sorry","Classroom","Make a fist and rub it in a circle on your chest."],
["Friend","Family & Friends","Hook your index fingers together, then switch which hand is on top."],["Family","Family & Friends","Make F hands (thumb and index finger touching), start with thumbs together, and circle outward until the pinkies meet."],["Mom","Family & Friends","Open hand with the thumb tapping your chin."],["Dad","Family & Friends","Open hand with the thumb tapping your forehead."],
["Love","Feelings","Cross both fists over your heart, like a hug."],["Happy","Feelings","Brush flat hands upward on your chest a few times, with a smile."],["Sad","Feelings","Hold open hands in front of your face and drag them down, with a sad face."],["Mad","Feelings","Curl your fingers like claws in front of your face and pull them in, with an angry face."],
["Eat","Food & Drink","Bunch your fingertips together and tap them to your mouth."],["Drink","Food & Drink","Shape your hand like you are holding a cup and tip it toward your mouth."],["Water","Food & Drink","Make a W (three fingers up) and tap it on your chin."],["Milk","Food & Drink","Open and close your fist, like milking a cow."],["Apple","Food & Drink","Twist the knuckle of your bent index finger against your cheek."],
["Play","Play & Animals","Make Y hands (thumb and pinky out) and shake them."],["Book","Play & Animals","Put your palms together, then open them like a book."],["Dog","Play & Animals","Pat your thigh, then snap your fingers, like calling a dog."],["Cat","Play & Animals","Pinch your fingers at your cheek and pull outward, like whiskers."]];
var SCAT=["All","Classroom","Feelings","Food & Drink","Family & Friends","Play & Animals"];
var SG={cat:"All",q:"",sug:[]};
function signCard(w,how,btn){return "<div class=\"sgc\"><b>"+esc(w)+"</b><p>"+esc(how||"Ask your teacher team or an ASL resource for how to make this sign.")+"</p>"+btn+"</div>";}
function addSign(w,how){var p=plan(V.wk);if(!Array.isArray(p.signs))p.signs=[];w=String(w||"").trim().slice(0,30);if(!w)return;
  if(!p.signs.some(function(x){return x.w.toLowerCase()===w.toLowerCase();}))p.signs.push({w:w,how:String(how||"").trim().slice(0,200)});
  p.sign=p.signs.map(function(x){return x.w;}).join(", ");save();}
function renderLib(){var q=SG.q.toLowerCase(),h="";
  SIGNS.forEach(function(x,i){if((SG.cat==="All"||x[1]===SG.cat)&&(!q||(x[0]+" "+x[2]).toLowerCase().indexOf(q)>=0))h+=signCard(x[0],x[2],"<button class=\"btn sm\" data-sgl=\""+i+"\" type=\"button\">Add to week</button>");});
  $("sg-lib").innerHTML=h||"<p class=\"note\">No signs match.</p>";}
function renderSign(){
  var k=V.wk,p=plan(k),ws=weeks(V.m);if(!Array.isArray(p.signs))p.signs=[];
  var h="<section class=\"card\"><h2>\uD83E\uDD1F Sign Language Corner</h2><p class=\"note\">Plan each week\u2019s signs and learn new ones. These are short written descriptions; check them against a trusted ASL source such as Lifeprint or Signing Savvy before teaching.</p><div class=\"row\"><select id=\"sg-m\" aria-label=\"Month\">"+ORDER.map(function(m){return "<option value=\""+m+"\""+(m===V.m?" selected":"")+">"+ME[m]+" "+MN[m]+"</option>";}).join("")+"</select><select id=\"sg-w\" aria-label=\"Week\">"+ws.map(function(w,i){return "<option value=\""+w+"\""+(w===k?" selected":"")+">Week "+(i+1)+" \u2022 "+fmt(w)+"</option>";}).join("")+"</select></div></section>";
  h+=signLessonCard();
  h+="<section class=\"card\"><h2>Signs for this week</h2><p class=\"note\">Theme: <b>"+esc(themeStr(p)||"(none picked yet)")+"</b>. Added signs also fill the Sign Language box on the weekly planner.</p><div class=\"sgs\">"+(p.signs.length?p.signs.map(function(x,i){return signCard(x.w,x.how,"<button class=\"btn alt sm\" data-sgx=\""+i+"\" type=\"button\">Remove</button>");}).join(""):"<p class=\"note\">No signs yet. Add some below.</p>")+"</div>";
  h+="<div class=\"row\" style=\"margin-top:12px\"><input type=\"text\" id=\"sg-cw\" placeholder=\"Word\" maxlength=\"30\" style=\"width:150px\"><input type=\"text\" id=\"sg-ch\" placeholder=\"How to sign it (optional)\" maxlength=\"200\" style=\"flex:1;min-width:200px\"><button class=\"btn sm\" id=\"sg-ca\" type=\"button\">Add sign</button></div>";
  h+="<details style=\"margin-top:10px\"><summary><b>Daily practice ideas</b></summary><ul><li>Monday: show each sign slowly while saying the word.</li><li>Tuesday: use the signs during circle time and songs.</li><li>Wednesday: play a signing game like Simon Says.</li><li>Thursday: let children teach a sign to a friend.</li><li>Friday: review all the signs and celebrate!</li></ul></details></section>";
  h+="<section class=\"card\"><h2>\u2728 Ask the AI for signs</h2><p class=\"note\">Suggests simple signs for this week\u2019s theme and the class age ("+AGEL[$("age").value]+", set on the planner page). Double-check every suggestion.</p><div class=\"btns\"><button class=\"btn\" id=\"sg-go\" type=\"button\">Suggest signs</button><button class=\"btn alt\" id=\"sg-stop\" type=\"button\" hidden>Stop</button></div><div id=\"sg-msg\" class=\"note\" aria-live=\"polite\"></div><div class=\"sgs\">"+SG.sug.map(function(x,i){return signCard(x.w,x.how,"<button class=\"btn sm\" data-sgs=\""+i+"\" type=\"button\">Add to week</button>");}).join("")+"</div></section>";
  h+="<section class=\"card\"><h2>Sign library</h2><div class=\"row\"><select id=\"sg-c\" aria-label=\"Category\">"+SCAT.map(function(c){return "<option"+(c===SG.cat?" selected":"")+">"+esc(c)+"</option>";}).join("")+"</select><input type=\"text\" id=\"sg-q\" placeholder=\"Search signs\" maxlength=\"40\" style=\"flex:1;min-width:160px\" value=\""+esc(SG.q)+"\"></div><div class=\"sgs\" id=\"sg-lib\" style=\"margin-top:10px\"></div></section>";
  $("pg-sign").innerHTML=h;renderLib();}
function libSuggest(p,n){var have=(p.signs||[]).map(function(x){return x.w.toLowerCase();});
  return shuf(SIGNS.filter(function(x){return have.indexOf(x[0].toLowerCase())<0;})).slice(0,n).map(function(x){return {w:x[0],how:x[2]};});}
async function signAI(){
  if(AI.busy)return;var m=$("sg-msg");
  var p=plan(V.wk),age=+$("age").value,th=themeStr(p)||(p.acts[0]&&p.acts[0].theme)||(MN[V.m]+" classroom");
  var fallback=function(why){SG.sug=libSuggest(p,4);renderSign();$("sg-msg").textContent=why+" Here are ideas from the built-in library instead."; };
  if($("eng").value==="bank"){fallback("AI help is switched off.");return;}
  if(!engReady()&&!engCached()){fallback("The AI helper isn’t set up yet.");return;}
  AI.busy=true;AI.stop=false;busyUI(true);$("sg-go").disabled=true;$("sg-stop").hidden=false;
  try{
    var eng=await untilCancel(ensureAI());
    if(AI.stop){$("sg-msg").textContent="\u23F9\uFE0F Cancelled. Nothing was added.";return;}
    if(!eng.ok){fallback(eng.note);return;}
    AI.tag="Finding signs";
    var have=(p.signs||[]).map(function(x){return x.w;}).join(", ")||"none";
    var msgs=[{role:"system",content:"You are an early-childhood teacher who knows basic American Sign Language (ASL). Only suggest common, standard ASL signs you are confident about, and describe each in plain, short words a teacher can follow. Answer with exactly four lines in this format and nothing else:\nSIGN: word | how to make the sign"},
      {role:"user",content:"Today is "+todayStr()+". Suggest four simple ASL signs for the weekly theme “"+th+"” for "+AGEL[age]+". Signs already planned (do not repeat): "+have+"."}];
    var t0=Date.now(),txt=await aiGen(msgs,{max:300,temp:0.5,onText:function(t){say("Finding signs… "+Math.round((Date.now()-t0)/1000)+"s");}});
    if(AI.stop){$("sg-msg").textContent="\u23F9\uFE0F Cancelled. Nothing was added.";return;}
    var out=[];String(txt).split(/\r?\n/).forEach(function(line){var mm=line.match(/SIGN\s*:\s*([^|]+)\|\s*(.+)$/i);
      if(mm){var w=mm[1].replace(/[*_`"]/g,"").trim().slice(0,30),h=mm[2].replace(/[*_`]/g,"").trim().slice(0,200);if(w&&h&&out.length<5)out.push({w:w,how:h});}});
    if(!out.length){fallback("The AI’s answer couldn’t be read.");return;}
    SG.sug=out;renderSign();$("sg-msg").textContent="Here are some ideas. Check each one, then add the ones you like."+(eng.note?" "+eng.note:"");
  }catch(e){fallback("Couldn’t finish ("+(e&&e.message?e.message:e)+").");}
  finally{AI.tag="";AI.busy=false;busyUI(false);var g=$("sg-go");if(g)g.disabled=false;var st=$("sg-stop");if(st){st.hidden=true;st.disabled=false;if(st.dataset.t)st.textContent=st.dataset.t;}}}
function setPg(pg){V.pg=pg;$("pg-plan").hidden=pg!=="plan";$("pg-sign").hidden=pg!=="sign";
  Array.prototype.forEach.call(document.querySelectorAll(".navb"),function(b){b.classList.toggle("on",b.dataset.pg===pg);});
  if(pg==="sign")renderSign();else render();}
document.addEventListener("click",function(e){
  var t=e.target,pop=$("th-pop");
  if(pop&&!t.closest(".cb"))pop.hidden=true;
  var b=t.closest("[data-th]");if(b){toggleTheme(b.dataset.th);return;}
  if(t.closest("#th-btn")){thPanel();pop.hidden=false;$("th-in").focus();return;}
  var u=t.closest("[data-use]");if(u){setThemes(plan(V.wk),themesOf(plan(V.wk)).concat([u.dataset.use]));save();render();return;}
  var g=t.closest("[data-pg]");if(g){setPg(g.dataset.pg);return;}
  if(!t.closest("#pg-sign"))return;
  var x=t.closest("[data-sgx]"),sa=t.closest("[data-sgs]"),sl=t.closest("[data-sgl]");
  if(x){var p=plan(V.wk);p.signs.splice(+x.dataset.sgx,1);p.sign=p.signs.map(function(y){return y.w;}).join(", ");save();renderSign();}
  else if(sa){var q=SG.sug[+sa.dataset.sgs];if(q){addSign(q.w,q.how);SG.sug.splice(+sa.dataset.sgs,1);renderSign();}}
  else if(sl){var r=SIGNS[+sl.dataset.sgl];addSign(r[0],r[2]);renderSign();}
  else if(t.closest("#sg-ca")){(async function(){if(!(await guardFields(["sg-cw","sg-ch"])))return;addSign($("sg-cw").value,$("sg-ch").value);renderSign();})();}
  else if(t.closest("#sl-stop"))stopAI();else if(t.closest("#sl-go"))signLesson();else if(t.closest("#sl-add"))slAddAll();else if(t.closest("#sl-print"))slPrint();
  else if(t.closest("#sg-go"))signAI();
  else if(t.closest("#sg-stop"))stopAI();
});
document.addEventListener("change",function(e){var id=e.target.id;
  if(id==="sg-m"){V.m=+e.target.value;V.wk=defWeek(V.m);renderSign();}
  else if(id==="sg-w"){V.wk=e.target.value;renderSign();}
  else if(id==="sg-c"){SG.cat=e.target.value;renderLib();}});
document.addEventListener("input",function(e){if(e.target.id==="sg-q"){SG.q=e.target.value;renderLib();}});
