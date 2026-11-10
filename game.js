var BG=[
 {c:"#1e63d6",l:1},{c:"#f5c518",l:0},{c:"#1f9d55",l:1},{c:"#d63031",l:1},
 {c:"#ffffff",l:0},{c:"#0d0d0f",l:1},{c:"#7b3fe4",l:1},{c:"#f58220",l:0}
];
var FLAP=["#d63031","#1e63d6","#f5c518","#1f9d55"];
var SAMPLES=["What's your most memorable childhood memory?", "What's one thing that makes you happy?", "If you'd think about one word to describe your opponent, what word would it be?", "Mag VM ng MAMAAAAA", "VM: HOY, Walang kanin buseng? Potanginang haup na yan!", "VM ng deep voice", "VM ng kiki voice", "This or that: Unlimited money or unlimited time?", "ask your partner for your dare/request", "Describe yourself in three words", "Say one truth you've never told to your partner yet", "Childhood photo", "What's your biggest pet peeve?"];
var dares=Array(8).fill(""),used=Array(8).fill(false),flips=0,last=-1,pu,cur=null,opts=[],bonus=false,passed=false;
var $=function(i){return document.getElementById(i)};

/* setup */
var rows=$("rows");
for(var i=0;i<8;i++){(function(i){
  var r=document.createElement("div");r.className="row";
  r.innerHTML='<span class="num">'+(i+1)+'</span><input maxlength="80" placeholder="Dare number '+(i+1)+'"><button class="x" aria-label="Clear dare '+(i+1)+'">✕</button>';
  var inp=r.querySelector("input");
  inp.oninput=function(){dares[i]=inp.value;check()};
  r.querySelector(".x").onclick=function(){inp.value="";dares[i]="";check()};
  rows.appendChild(r);
})(i)}
function inputs(){return rows.querySelectorAll("input")}
function filled(){return dares.filter(function(d){return d.trim()}).length}
function check(){var n=filled();$("start").disabled=n<8;$("left").textContent=n<8?(8-n)+" more to go":"All set, start when ready."}
$("surprise").onclick=function(){
  var empt=[];dares.forEach(function(d,i){if(!d.trim())empt.push(i)});
  if(!empt.length)return;
  var pool=SAMPLES.filter(function(s){return dares.indexOf(s)<0});
  var i=empt[0],s=pool[Math.floor(Math.random()*pool.length)];
  dares[i]=s;inputs()[i].value=s;check();
};
check();

/* game */
function sample(a,n){var b=a.slice(),o=[];while(n--&&b.length){o.push(b.splice(Math.floor(Math.random()*b.length),1)[0])}return o}
function rem(){var r=[];used.forEach(function(u,i){if(!u)r.push(i)});return r}
function setBg(i){
  document.body.style.background=BG[i].c;
  document.body.style.setProperty("--bgc",BG[i].c);
  document.body.classList.toggle("light",!!BG[i].l);
  document.body.classList.toggle("dark",!BG[i].l);
}
function newBg(){var i;do{i=Math.floor(Math.random()*BG.length)}while(i===last);last=i;setBg(i)}
function drawPaper(){
  var P=[["0,0 200,0 100,100",70,35,130,35,"top",50,28],["200,0 200,200 100,100",165,70,165,130,"right",72,50],["200,200 0,200 100,100",130,165,70,165,"bottom",50,72],["0,200 0,0 100,100",35,130,35,70,"left",28,50]];
  var n=0,h='<div class="toy"><div class="in"><svg viewBox="0 0 200 200"><rect width="200" height="200" fill="#fffdf7"/><path d="M0 0L200 200M200 0L0 200" stroke="#d6cfbb" stroke-width="2"/><ellipse cx="100" cy="100" rx="24" ry="16" fill="#4a3a2c"/><circle cx="100" cy="46" r="13" fill="#d63031"/><circle cx="154" cy="100" r="13" fill="#1e63d6"/><circle cx="100" cy="154" r="13" fill="#f5c518"/><circle cx="46" cy="100" r="13" fill="#1f9d55"/></svg></div>';
  P.forEach(function(p,k){
    var col=FLAP[k];h+='<div class="fl f'+p[5]+'"><svg viewBox="0 0 200 200">';
    h+='<polygon points="'+p[0]+'" fill="'+col+'" stroke="rgba(255,255,255,.85)" stroke-width="2" stroke-linejoin="round"/></svg>';
    for(var j=0;j<2;j++){var i=n++;h+='<span class="n j'+j+(used[i]?' used':'')+(j!==shown?' hid':'')+'" data-n="'+i+'" style="left:'+p[6]+'%;top:'+p[7]+'%">'+(i+1)+'<svg class="rg" viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" pathLength="100"/></svg></span>'}
    h+='</div>';
  });
  h+='</div>';
  $("paper").innerHTML=h;
}
function ui(){
  drawPaper();
  $("count").textContent=flips===0?"No flips yet":"Flips: "+flips;
  $("hint").textContent=flips<3?"Tap the paper once per flip your friend calls. Each flip shows a different set of numbers: hold a visible one to reveal its dare. 3 or more flips earns a free Swap.":"Free Swap unlocked: hold a number, then swap it for the other number on its flap.";
  var n="";for(var i=0;i<8;i++)n+='<span class="chip'+(used[i]?" off":"")+'">'+(i+1)+'</span>';
  $("nums").innerHTML=n;
  $("pu").innerHTML='<span class="chip">⏭ Skip ×'+pu.skip+'</span><span class="chip">🎯 Pass ×'+pu.pass+'</span><span class="chip">🔄 Swap ×'+pu.deal+'</span>';
}
function begin(){
  used=Array(8).fill(false);flips=0;last=-1;pu={skip:1,pass:1,deal:1};shown=0;want=0;
  $("setup").classList.add("hide");$("game").classList.remove("hide");
  newBg();ui();
}
$("start").onclick=function(){dares=dares.map(function(d){return d.trim()});begin()};

/* sound (made in the browser, no audio file needed) */
var AC=null,NB=null,muted=false;
function ac(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){}}
function burst(at,dur,f0,f1,g){
  var t=AC.currentTime+at,s=AC.createBufferSource(),f=AC.createBiquadFilter(),v=AC.createGain();
  s.buffer=NB;f.type="bandpass";f.Q.value=.9;
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);
  v.gain.setValueAtTime(.0001,t);v.gain.exponentialRampToValueAtTime(g,t+.012);v.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(f);f.connect(v);v.connect(AC.destination);s.start(t,Math.random()*.4,dur+.05);
}
function noise(){
  if(muted||!AC)return false;
  if(!NB){NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);var d=NB.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(.25+.75*Math.pow(Math.random(),3))}
  return true;
}
function sfx(){try{if(!noise())return;burst(0,.24,1500,3800,.5);burst(.3,.17,3500,1800,.4);burst(.36,.035,5200,5200,.55)}catch(e){}}
function unfold(){try{if(!noise())return;burst(0,.32,1200,3200,.45);burst(.22,.12,3000,2000,.3)}catch(e){}}
$("snd").onclick=function(){muted=!muted;this.textContent=muted?"🔇":"🔊"};

/* flipping and long press */
var shown=0,want=0,hold=null,did=false,sx=0,sy=0;
function flip(){
  flips++;newBg();
  var p=$("paper");p.className=flips%2?"a":"b";ui();sfx();
  want=1-want;var tgt=want;
  setTimeout(function(){shown=tgt;document.querySelectorAll(".n").forEach(function(s){s.classList.toggle("hid",!s.classList.contains("j"+tgt))})},260);
  clearTimeout(flip.t);flip.t=setTimeout(function(){p.className=""},850);
  if(navigator.vibrate)try{navigator.vibrate(20)}catch(e){}
}
function endHold(){clearTimeout(hold);hold=null;var r=document.querySelector(".n.holding");if(r)r.classList.remove("holding")}
$("paper").onpointerdown=function(e){
  ac();did=false;sx=e.clientX;sy=e.clientY;
  var t=e.target.closest&&e.target.closest("[data-n]");
  if(!t||used[+t.dataset.n])return;
  var n=+t.dataset.n;t.classList.add("holding");
  hold=setTimeout(function(){did=true;endHold();if(navigator.vibrate)try{navigator.vibrate(40)}catch(e){}reveal(n)},650);
};
$("paper").onpointermove=function(e){if(hold&&Math.hypot(e.clientX-sx,e.clientY-sy)>12)endHold()};
$("paper").onpointerup=function(){var was=did;endHold();did=false;if(!was)flip()};
$("paper").onpointercancel=endHold;
$("paper").onpointerleave=endHold;
$("paper").oncontextmenu=function(e){e.preventDefault()};
$("paper").onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();flip()}};
$("reset").onclick=function(){
  closeOv();$("game").classList.add("hide");$("setup").classList.remove("hide");
  document.body.style.background="";document.body.style.removeProperty("--bgc");
  document.body.classList.remove("light","dark");last=-1;
};

/* reset the round, keep the dares */
var rt=null;
$("rst").onclick=function(){
  var b=this;
  if(rt){
    clearTimeout(rt);rt=null;b.textContent="↺ Reset";
    closeOv();$("paper").className="";begin();
    return;
  }
  b.textContent="Tap again";
  rt=setTimeout(function(){rt=null;b.textContent="↺ Reset"},2500);
};

/* reveal */
function ov(h){$("card").innerHTML=h;$("ov").classList.remove("hide")}
function closeOv(){$("ov").classList.add("hide")}
function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML}
function reveal(n){bonus=flips>=3;unfold();open(n)}

var swapped=false;
function open(i){
  cur=i;passed=false;swapped=false;card();
}
function card(){
  var others=rem().filter(function(x){return x!==cur}).length;
  ov('<h2>'+(passed?'Passed to your friend 🎯':'Dare #'+(cur+1))+'</h2><div class="dare">'+esc(dares[cur])+'</div>'+
    '<div class="bar"><button class="btn" id="done">✔ Done</button>'+
    (passed?'':'<button class="btn ghost" id="skip"'+((pu.skip&&others)?'':' disabled')+'>⏭ Skip ('+pu.skip+')</button><button class="btn ghost" id="pass"'+(pu.pass?'':' disabled')+'>🎯 Pass ('+pu.pass+')</button><button class="btn ghost" id="swap"'+(((bonus||pu.deal)&&!swapped&&!used[cur^1])?'':' disabled')+'>🔄 Swap #'+((cur^1)+1)+(bonus?' (free)':' ('+pu.deal+')')+'</button>')+'</div>');
  $("done").onclick=function(){used[cur]=true;flips=0;closeOv();newBg();ui();if(!rem().length)finish()};
  if(!passed){
    $("skip").onclick=function(){pu.skip--;cur=sample(rem().filter(function(x){return x!==cur}),1)[0];ui();card()};
    $("pass").onclick=function(){pu.pass--;passed=true;ui();card()};
    $("swap").onclick=function(){if(!bonus)pu.deal--;swapped=true;cur=cur^1;ui();card()};
  }
}
function finish(){
  ov('<h2>All 8 dares done 🎉</h2><div class="dare">What a game!</div><div class="bar"><button class="btn" id="again">🔁 Play again</button><button class="btn ghost" id="new">New dares</button></div>');
  $("again").onclick=function(){closeOv();begin()};
  $("new").onclick=function(){closeOv();dares=Array(8).fill("");inputs().forEach(function(x){x.value=""});check();$("reset").onclick()};
}