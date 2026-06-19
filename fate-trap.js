/**
 * fate-trap.js — Valata's Panty Fate System
 * Self-contained: injects CSS + HTML + logic on any page.
 * Add <script src="fate-trap.js"></script> to trap any page.
 */
(function () {
  'use strict';

  /* ── KEYS & TIMINGS ──────────────────────────────── */
  var K    = 'valata_fate_end';
  var KM   = 'valata_fate_meter';
  var WEEK = 7 * 24 * 60 * 60 * 1000;
  var D3   = 3 * 24 * 60 * 60 * 1000;

  /* ── IMAGES ──────────────────────────────────────── */
  var IMG = [
    'https://i.ibb.co/KcqZnPZR/image0-1.gif',
    'https://images.celinascollection.com/panties/sample_93e66ee1b62b790cb5bce5b5a1fced77.jpg',
    'https://i.ibb.co/FLgJmxFp/ezgif-com-optiwebp.webp',
    'https://images.celinascollection.com/panties/gifcandy-panties-55.gif'
  ];

  /* ── VOICE LINES ─────────────────────────────────── */
  var VOICE = [
    "Squirm all you want, pet\u2014 You're not going anywhere. You're my thong now~ Thongs don't get opinions~",
    "Mmm... you can feel every single step I take, can't you~ Good~ Stay put and stop thinking so loud~",
    "You're completely soaked through~ My wet little fabric pet~ Does it feel good being this close to me every second~",
    "Your thoughts are dissolving, aren't they~ Good~ Panties don't need to think~ They just need to cling~",
    "There's nothing left~ Just my thong~ Just my ass~ Forever~ How embarrassing for you~ \u2665"
  ];

  /* ── MINDBREAK TEASES ────────────────────────────── */
  var TEASE = [
    "You thought you could just browse a website~ How adorable~ Now you're my underwear~ Stay right there~",
    "I can feel you trying to remember who you were~ Doesn't matter~ You were nobody, pet~ Just pre-thong~",
    "Celina asked what I was wearing and I said 'oh just some idiot who visited my page'~ She laughed so hard~",
    "The cutest part is you can't tell anyone~ What would you even say~ 'I got turned into panties by a website'~",
    "You smell like me now~ Every thread soaked through~ You'll smell like me forever~ Isn't that the sweetest thing~"
  ];

  /* ── INTERACTIONS ────────────────────────────────── */
  var ACT = {
    sit: {
      t: 'FULL WEIGHT', a: 'She drops full weight down.',
      r: "She drops onto a chair without warning and you get compressed hard between her cheeks and the seat, her asshole pressing against your waistband while the heat builds and your ability to think completely evaporates. She just sits there reading her phone. Not thinking about you once.",
      img: IMG[1], ms: 15 * 60 * 1000, lb: '+15 min', pts: 10
    },
    grind: {
      t: 'DEEP IN THE CRACK', a: 'She hooks fingers in and drags deeper.',
      r: "She reaches back, hooks two fingers into your waistband and drags you deliberately deeper into her crack until your fabric is fully swallowed between her cheeks. Your face pressed flat against her puckered hole. She just leaves you there. Doesn't fix it. Just keeps walking~",
      img: IMG[2], ms: 25 * 60 * 1000, lb: '+25 min', pts: 12
    },
    flood: {
      t: 'SOAKED THROUGH', a: "Her pussy absolutely floods you.",
      r: "She gets herself off right against you and when she finishes the warm rush soaks straight through every single thread. Hot and slick and absolutely everywhere. It absorbs into you completely~ You smell like her now~ Fully~ Permanently~ Valata laughs and tells Celina you're 'broken in' now~",
      img: IMG[3], ms: 45 * 60 * 1000, lb: '+45 min', pts: 18
    },
    gym: {
      t: 'WORKOUT WEDGE', a: 'A full gym session with you wedged in.',
      r: "An entire hour of squats and lunges with you grinding deeper and wetter with every rep. Her sweat soaks through you from both sides, her asshole kissing your fabric on every downward press over and over until you're so thoroughly saturated you've forgotten you were ever dry~",
      img: IMG[0], ms: 20 * 60 * 1000, lb: '+20 min', pts: 10
    },
    floor: {
      t: 'TRAMPLED & WATCHING', a: 'Stripped off. Tossed to the floor.',
      r: "She strips you off and tosses you to the floor like you're nothing. For two hours you lay there watching Celina and Valata wreck each other above you. Then Valata's foot comes down on your face on the way to the bathroom. She doesn't even feel it. Picks you up still damp and puts you right back on. 'Oh there you are~' she says. Like you're her keys~",
      img: IMG[2], ms: 60 * 60 * 1000, lb: '+1 hour', pts: 20
    },
    cum: {
      t: "CELINA'S LOAD", a: "Celina paints you with her futa cock.",
      r: "Celina stands over you with that massive futa cock and gives you the full load. Thick and warm and absolutely everywhere. Every thread. Valata picks you up afterward, still dripping. 'Good boy~' she says to neither of you specifically. Then puts you right back on without wiping anything off~",
      img: IMG[3], ms: 2 * 60 * 60 * 1000, lb: '+2 hours', pts: 22
    },
    beg: {
      t: 'BEGGING IN FABRIC', a: 'You squirm and try to form sounds.',
      r: "You tense every thread. The muffled something coming from your fabric doesn't form words anymore. It just sounds like need~ Valata feels you squirming, flexes her hips, laughs softly, and doesn't adjust you~",
      img: IMG[1], ms: 5 * 60 * 1000, lb: '+5 min', pts: 6
    },
    escape: {
      t: 'ESCAPE ATTEMPT: FAILED', a: 'You strain everything. Nothing moves.',
      r: "You tense everything you have. You push. You pull. The elastic holds. The seams hold. Valata's ass holds. The only thing that changes is she feels you squirming and grinds down harder with a small pleased sound~ That's going to cost you a lot~",
      img: IMG[0], ms: 3 * 60 * 60 * 1000, lb: '+3 hours \u2014 Nice Try~', pts: 8
    }
  };

  /* ── STATE ───────────────────────────────────────── */
  var meter = 0, iv = null, mbDone = false;

function setFateMeter(n, anim) {
  meter = Math.max(0, Math.min(100, n));
  localStorage.setItem(KM, String(meter));
  updateMeter(!!anim);
}
function resetAfterMindbreakStarted() {
  localStorage.setItem(KM, '0');
  meter = 0;
  mbDone = false;

  var wall = document.getElementById('fateTeaseWall');
  if (wall) wall.style.display = 'none';
}

  /* ── CSS INJECT ──────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('ft-css')) return;
    var gf = document.createElement('link');
    gf.rel = 'stylesheet';
    gf.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&display=swap';
    document.head.appendChild(gf);
    var s = document.createElement('style');
    s.id = 'ft-css';
    s.textContent = CSS_BLOCK;
    document.head.appendChild(s);
  }

  /* ── HTML INJECT ─────────────────────────────────── */
  function injectHTML() {
    if (document.getElementById('fate-overlay')) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = HTML_BLOCK;
    while (tmp.firstChild) document.body.appendChild(tmp.firstChild);
  }

  /* ── OPEN FATE ───────────────────────────────────── */
  function openFate(isNew) {
    var ov = document.getElementById('fate-overlay');
    if (!ov) return;
    if (isNew) {
      localStorage.setItem(K,  String(Date.now() + WEEK));
      localStorage.setItem(KM, '0');
    }
    meter  = parseInt(localStorage.getItem(KM) || '0');
    mbDone = meter >= 100;
    ov.classList.add('active');
    document.body.style.overflow = 'hidden';
    var h = document.querySelector('header');
    if (h) h.style.cssText += ';display:none!important';
    setFateMeter(meter, false);
    startTimer(parseInt(localStorage.getItem(K)));
  }

  /* ── TIMER ───────────────────────────────────────── */
  function startTimer(end) {
    clearInterval(iv);
    iv = setInterval(function () {
      var el = document.getElementById('fateCountdown'); if (!el) return;
      var d = end - Date.now();
      if (d <= 0) { clearInterval(iv); el.textContent = 'FATE COMPLETE'; return; }
      var dd = Math.floor(d / 86400000);
      var hh = Math.floor((d % 86400000) / 3600000);
      var mm = Math.floor((d % 3600000) / 60000);
      var ss = Math.floor((d % 60000) / 1000);
      el.textContent = dd + 'd ' + p(hh) + 'h ' + p(mm) + 'm ' + p(ss) + 's';
    }, 1000);
  }
  function p(n) { return String(n).padStart(2, '0'); }

  /* ── ACT ─────────────────────────────────────────── */
  function fateAct(key) {
    var a = ACT[key]; if (!a) return;
    var end = parseInt(localStorage.getItem(K) || String(Date.now() + WEEK));
    end += a.ms;
    localStorage.setItem(K, String(end));
    startTimer(end);
    var wasBelow100 = meter < 100;

    setFateMeter(meter + a.pts, true);
    showPop(a);
    var tc = document.getElementById('fateTimeCard');
    var ta = document.getElementById('fateTimeAdded');
    if (tc && ta) {
      ta.textContent = a.lb;
      tc.style.display = 'block';
      clearTimeout(tc._t);
      tc._t = setTimeout(function () { tc.style.display = 'none'; }, 3000);
    }
    if (wasBelow100 && meter >= 100 && !mbDone) {
    mbDone = true;

    // +3 days added at 100%
    var end2 = parseInt(localStorage.getItem(K) || String(Date.now() + WEEK));
    end2 += D3;
    localStorage.setItem(K, String(end2));
    startTimer(end2);

    setTimeout(showMb, 1200);
    }
  }

  /* ── POPUP ───────────────────────────────────────── */
  function showPop(a) {
    document.getElementById('fatePopTtl').textContent    = a.t;
    document.getElementById('fatePopAction').textContent = a.a;
    document.getElementById('fatePopReact').textContent  = a.r;
    document.getElementById('fatePopImg').style.backgroundImage = 'url(' + a.img + ')';
    document.getElementById('fateTimePenalty').textContent = a.lb;
    document.getElementById('fatePopOver').classList.add('on');
  }
  function closeFatePop() { document.getElementById('fatePopOver').classList.remove('on'); }

  /* ── METER UPDATE ────────────────────────────────── */
  function updateMeter(anim) {
    var fill  = document.getElementById('fateMFill');
    var pct   = document.getElementById('fateMPct');
    var voice = document.getElementById('fateVoice');
    var vtxt  = document.getElementById('fateVoiceTxt');
    var wrap  = document.getElementById('fateImgWrap');
    var badge = document.getElementById('fateStageBadge');
    var img   = document.getElementById('fateMainImg');
    var wall  = document.getElementById('fateTeaseWall');
    if (!fill) return;
    fill.style.width = meter + '%';
    pct.textContent  = meter + '%';
    if (anim) { fill.style.filter = 'brightness(2)'; setTimeout(function () { fill.style.filter = ''; }, 500); }
    var st, vi, src, bt, cls;
    if      (meter < 25)  { st = 's-r'; vi = 0; src = IMG[0]; bt = 'Fresh Fabric';    cls = ''; }
    else if (meter < 50)  { st = 's-f'; vi = 1; src = IMG[1]; bt = 'Soaked Through';  cls = 'soaked'; }
    else if (meter < 75)  { st = 's-d'; vi = 2; src = IMG[2]; bt = 'Mind Dissolving'; cls = 'broken'; }
    else if (meter < 100) { st = 's-b'; vi = 3; src = IMG[3]; bt = 'Breaking Down';   cls = 'gone'; }
    else                   { st = 's-g'; vi = 4; src = IMG[3]; bt = 'Gone~';           cls = 'gone'; }
    voice.className      = 'fate-voice ' + st;
    vtxt.textContent     = '\u201c' + VOICE[vi] + '\u201d';
    img.src              = src;
    badge.textContent    = bt;
    wrap.className       = 'fate-img-wrap ' + cls;
    if (wall) wall.style.display = meter >= 100 ? 'block' : 'none';
  }

  /* ── MINDBREAK ───────────────────────────────────── */
function showMb() {
  var mb = document.getElementById('fateMbOver'); 
  if (!mb) return;

  document.getElementById('fateMbBg').style.backgroundImage = 'url(' + IMG[3] + ')';
  mb.classList.add('on');

  // Important:
  // Reset immediately so reloading during the scene does not keep meter at 100%.
  resetAfterMindbreakStarted();

  setTimeout(function () {
    var cl = document.getElementById('fateMbClose');
    if (cl) cl.style.display = 'inline-block';
  }, 2500);

  mbTick();
}
  function mbTick() {
    var mb = document.getElementById('fateMbOver');
    if (!mb || !mb.classList.contains('on')) return;
    var d  = parseInt(localStorage.getItem(K)) - Date.now();
    var dd = Math.floor(d / 86400000);
    var hh = Math.floor((d % 86400000) / 3600000);
    var el = document.getElementById('fateMbCdown');
    if (el) el.textContent = dd + 'd ' + hh + 'h remaining~';
    setTimeout(mbTick, 5000);
  }
function closeFateMb() {
  var el = document.getElementById('fateMbOver');
  if (el) el.classList.remove('on');

  var cl = document.getElementById('fateMbClose');
  if (cl) cl.style.display = 'none';

  updateMeter(false);
}

  /* ── ACTIVATE ────────────────────────────────────── */
function activate() {
  var saved = localStorage.getItem(K);

  if (saved && parseInt(saved) > Date.now()) {
    openFate(false);
  }
}
  /* ── INIT ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    injectCSS();
    injectHTML();
    /* Age-gate awareness: wait for websiteContent to become visible */
    var wc = document.getElementById('websiteContent');
    if (wc && wc.style.display === 'none') {
      var obs = new MutationObserver(function () {
        if (wc.style.display !== 'none') { obs.disconnect(); activate(); }
      });
      obs.observe(wc, { attributes: true, attributeFilter: ['style'] });
    } else {
      activate();
    }
  });

  /* ── EXPOSE GLOBALS (for onclick= in injected HTML) ─ */
  window.fateAct      = fateAct;
  window.closeFatePop = closeFatePop;
  window.closeFateMb  = closeFateMb;

  window.startValataFate = function () {
  injectCSS();
  injectHTML();
  openFate(true);
};

  /* ════════════════════════════════════════════════════
     CSS BLOCK
     ════════════════════════════════════════════════════ */
  var CSS_BLOCK = `
.fate-overlay{position:fixed;inset:0;z-index:99000;display:none;overflow-y:auto;background:linear-gradient(155deg,#0a0015,#07001c,#05000d);font-family:'Poppins',sans-serif;color:#fff}
.fate-overlay.active{display:block}
.fate-bg{position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse 900px 480px at 75% 15%,rgba(255,0,202,.11),transparent),radial-gradient(ellipse 700px 500px at 15% 85%,rgba(180,0,160,.08),transparent)}
.fate-orb{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none;animation:ftOrb 20s ease-in-out infinite}
@keyframes ftOrb{0%,100%{transform:translate(0,0)}40%{transform:translate(26px,-38px)}70%{transform:translate(-16px,22px)}}
.fate-orb1{width:480px;height:480px;background:radial-gradient(#FF00CA,transparent);top:-120px;right:-90px;opacity:.13}
.fate-orb2{width:380px;height:380px;background:radial-gradient(#9900cc,transparent);bottom:-90px;left:-110px;opacity:.10;animation-delay:-9s}
.fate-wrap{position:relative;z-index:1;max-width:1260px;margin:0 auto;padding:22px 18px 60px;display:flex;flex-direction:column;gap:22px}
.fate-timer-bar{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;background:linear-gradient(90deg,rgba(255,0,202,.06),rgba(180,0,160,.04));border:1px solid rgba(255,0,202,.2);border-radius:14px;padding:13px 22px;backdrop-filter:blur(14px)}
.fate-t-label{font-size:.78rem;letter-spacing:2px;color:#ff88cc;text-transform:uppercase;font-weight:600;white-space:nowrap}
#fateCountdown{font-family:'Orbitron',monospace;font-size:clamp(1.35rem,3.8vw,2.3rem);font-weight:700;white-space:nowrap;letter-spacing:2px;line-height:1;color:transparent;background:linear-gradient(90deg,#ff00ca,#ff88ee,#FF85C8);-webkit-background-clip:text;background-clip:text}
.fate-main-grid{display:grid;grid-template-columns:1fr 400px;gap:22px;align-items:start}
.fate-lc,.fate-rc{display:flex;flex-direction:column;gap:18px}
.fate-img-wrap{border-radius:20px;overflow:hidden;border:2px solid rgba(255,0,202,.2);box-shadow:0 20px 70px rgba(255,0,202,.14);background:#080012;position:relative}
.fate-img-wrap img{width:100%;height:440px;object-fit:cover;display:block;transition:filter .5s}
.fate-img-wrap.soaked img{filter:saturate(1.4) hue-rotate(8deg)}
.fate-img-wrap.broken img{filter:saturate(1.8) hue-rotate(15deg) brightness(1.05)}
.fate-img-wrap.gone img{filter:saturate(2.2) hue-rotate(20deg) brightness(1.1);animation:ftSqrm .4s ease-in-out infinite alternate}
@keyframes ftSqrm{0%{transform:scale(1.01) rotate(-.4deg)}100%{transform:scale(1.04) rotate(.4deg)}}
.fate-img-badge{position:absolute;top:14px;left:14px;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);border:1px solid rgba(255,0,202,.35);border-radius:999px;padding:4px 13px;font-size:.7rem;font-weight:700;letter-spacing:2px;color:#ffaad6;text-transform:uppercase;transition:all .5s}
.fate-card{background:linear-gradient(160deg,rgba(255,0,202,.04),rgba(0,0,0,.55));border:1px solid rgba(255,0,202,.18);border-radius:18px;padding:20px 18px;backdrop-filter:blur(8px);box-shadow:0 8px 36px rgba(0,0,0,.45)}
.fate-card-ttl{font-family:'Orbitron',sans-serif;font-size:.75rem;color:#ff88cc;letter-spacing:3px;text-transform:uppercase;margin-bottom:12px}
.fate-ptitle{font-family:'Orbitron',sans-serif;font-size:clamp(1rem,2.4vw,1.45rem);color:transparent;background:linear-gradient(90deg,#FF00CA,#ff66dd,#ffb3e6,#FF85C8);-webkit-background-clip:text;background-clip:text;letter-spacing:1px;line-height:1.3;margin:0 0 6px}
.fate-sub{color:#ffd4ee;font-size:.9rem;line-height:1.55;margin-bottom:12px}
.fate-spill{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(90deg,rgba(255,0,202,.14),rgba(255,0,202,.06));border:1px solid rgba(255,0,202,.35);border-radius:999px;padding:5px 14px;font-size:.78rem;font-weight:700;color:#ff9edd;letter-spacing:.5px;margin-bottom:14px}
.fate-spill-dot{width:7px;height:7px;border-radius:50%;background:#FF00CA;animation:ftBlk 1.4s ease-in-out infinite}
@keyframes ftBlk{0%,100%{opacity:1}50%{opacity:.2}}
.fate-meter-wrap{display:flex;flex-direction:column;gap:7px}
.fate-meter-top{display:flex;justify-content:space-between;align-items:center}
.fate-m-lbl{font-size:.76rem;color:#ff88cc;letter-spacing:1px;font-weight:600;text-transform:uppercase}
#fateMPct{font-family:'Orbitron',monospace;font-size:1.05rem;font-weight:700;color:transparent;background:linear-gradient(90deg,#ff00ca,#FF85C8);-webkit-background-clip:text;background-clip:text}
.fate-m-bar{width:100%;height:18px;background:rgba(0,0,0,.55);border-radius:999px;overflow:hidden;border:1px solid rgba(255,0,202,.2)}
#fateMFill{height:100%;width:0%;border-radius:999px;background:linear-gradient(90deg,#ff00ca,#ff66dd,#ffaaee);transition:width .55s cubic-bezier(.2,.9,.2,1);box-shadow:0 0 16px rgba(255,0,202,.55)}
.fate-m-stages{display:flex;justify-content:space-between;margin-top:3px;font-size:.68rem;color:rgba(255,160,220,.45)}
.fate-voice{border-radius:14px;padding:13px 16px;font-size:.88rem;line-height:1.6;border-left:3px solid #FF00CA;transition:all .45s;margin-top:14px}
.fate-voice::before{content:'Valata~';display:block;font-size:.66rem;letter-spacing:2px;font-weight:700;text-transform:uppercase;margin-bottom:5px;opacity:.55;font-style:normal}
.fate-voice.s-r{background:rgba(255,0,202,.07);border-left-color:#ff00ca;color:#ffd0e8}
.fate-voice.s-f{background:rgba(220,0,180,.09);border-left-color:#dd00bb;color:#ffd6ec}
.fate-voice.s-d{background:rgba(180,0,160,.12);border-left-color:#bb00aa;color:#ffccee}
.fate-voice.s-b{background:rgba(255,0,202,.10);border-left-color:#ff44cc;color:#ffe0f4}
.fate-voice.s-g{background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,0,202,.09));border-left-color:#ffd24d;color:#fff7cc}
.fate-voice-txt{font-style:italic}
.fate-brow{display:grid;gap:9px;margin-bottom:9px}
.fate-c2{grid-template-columns:1fr 1fr}
.fate-btn{font-family:'Poppins',sans-serif;font-size:.83rem;font-weight:700;padding:12px 8px;border-radius:12px;border:none;cursor:pointer;letter-spacing:.3px;text-transform:uppercase;transition:all .22s cubic-bezier(.2,.9,.2,1)}
.fate-btn:hover{transform:translateY(-2px) scale(1.04);filter:brightness(1.18)}
.fate-btn:active{transform:scale(.97)}
.fate-b-red{background:linear-gradient(135deg,#cc0099,#ff44cc);color:#fff;box-shadow:0 5px 18px rgba(204,0,153,.4)}
.fate-b-pink{background:linear-gradient(135deg,#ff44bb,#ffaadd);color:#1a0010;box-shadow:0 5px 18px rgba(255,68,187,.35)}
.fate-b-teal{background:linear-gradient(135deg,#9900cc,#cc44ff);color:#fff;box-shadow:0 5px 18px rgba(153,0,204,.4)}
.fate-b-purp{background:linear-gradient(135deg,#6600cc,#9933ff);color:#fff;box-shadow:0 5px 18px rgba(102,0,204,.35)}
.fate-b-gold{background:linear-gradient(135deg,#ffd24d,#ff9900);color:#1a0000;box-shadow:0 5px 18px rgba(255,180,0,.35)}
.fate-b-dark{background:linear-gradient(135deg,#220022,#440033);color:#ffaad6;border:1px solid rgba(255,0,202,.25)}
.fate-b-exit{font-size:.78rem;padding:9px;background:linear-gradient(90deg,#eee,#ffddff);color:#220015}
.fate-slist{display:flex;flex-direction:column;gap:10px}
.fate-sfrag{border-radius:16px;overflow:hidden;border:1px solid rgba(255,0,202,.18);background:linear-gradient(160deg,rgba(18,0,35,.95),rgba(6,0,15,.97))}
.fate-sfrag[data-s="0"] .fate-strig{border-left:3px solid #ff88cc}
.fate-sfrag[data-s="1"] .fate-strig{border-left:3px solid #ff00ca}
.fate-sfrag[data-s="2"] .fate-strig{border-left:3px solid #cc00cc}
.fate-sfrag[data-s="3"] .fate-strig{border-left:3px solid #FF69B4}
.fate-sfrag[data-s="4"] .fate-strig{border-left:3px solid #ffd24d}
.fate-strig{padding:14px 18px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(90deg,rgba(255,0,202,.08),rgba(255,0,202,.04));transition:background .25s;user-select:none}
.fate-strig:hover{background:linear-gradient(90deg,rgba(255,0,202,.16),rgba(255,0,202,.08))}
.fate-strig-lbl{font-weight:700;font-size:.93rem;color:#ffd4ee;display:flex;align-items:center;gap:8px}
.fate-sbadge{display:inline-block;padding:2px 9px;border-radius:999px;font-size:.68rem;font-weight:700;background:rgba(255,0,202,.2);color:#ffaacc;border:1px solid rgba(255,0,202,.35)}
.fate-sarrow{font-size:.9rem;color:#ff88cc;transition:transform .3s;flex-shrink:0}
.fate-sfrag.open .fate-sarrow{transform:rotate(180deg)}
.fate-sbody{display:none;padding:0 18px 18px;animation:ftSlide .3s ease;border-top:1px solid rgba(255,0,202,.1)}
.fate-sfrag.open .fate-sbody{display:block}
@keyframes ftSlide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.fate-s-narr{font-size:.87rem;line-height:1.7;color:#ffe0f0;margin-top:14px}
.fate-s-narr p{margin-bottom:10px}
.fate-s-cel{margin-top:10px;padding:11px 14px 11px 40px;border-radius:12px;font-size:.84rem;font-style:italic;line-height:1.6;position:relative;background:rgba(255,0,202,.08);border:1px solid rgba(255,0,202,.25);color:#ffccee}
.fate-s-cel::before{content:'💜';position:absolute;left:12px;top:10px;font-style:normal}
/* Tease Wall */
.fate-tease-wall{border-color:rgba(255,50,50,.3)!important}
.fate-tease-wall .fate-card-ttl{color:#ff6688}
.fate-tease-list{display:flex;flex-direction:column;gap:10px}
.fate-tease-item{padding:12px 16px;border-radius:12px;font-size:.88rem;font-style:italic;line-height:1.6;border-left:3px solid #ff4466;background:rgba(255,30,80,.08);color:#ffddee}
.fate-tease-item::before{content:'"';display:block;font-size:1.4rem;line-height:.8;color:#ff4466;margin-bottom:4px;font-style:normal}
/* Popup */
.fate-pop-over{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50%,rgba(150,0,120,.28),rgba(0,0,0,.92));opacity:0;pointer-events:none;transition:opacity .18s ease}
.fate-pop-over.on{opacity:1;pointer-events:auto}
.fate-pop-box{max-width:680px;width:92%;background:linear-gradient(135deg,#200018,#0e0020);border:2px solid rgba(255,0,202,.55);box-shadow:0 0 55px rgba(255,0,202,.45);border-radius:20px;overflow:hidden}
.fate-pop-head{display:grid;grid-template-columns:130px 1fr}
.fate-pop-img{min-height:155px;background-size:cover;background-position:center}
.fate-pop-side{padding:18px 20px;display:flex;flex-direction:column;justify-content:center;gap:8px}
.fate-pop-ttl{font-family:'Orbitron',sans-serif;font-size:.88rem;font-weight:900;color:#ff00ca;letter-spacing:2px;text-transform:uppercase;text-shadow:0 0 10px rgba(255,0,202,.7)}
.fate-pop-action{font-size:.86rem;font-weight:700;color:#ffadd6;border-left:2px solid rgba(255,0,202,.4);padding-left:10px;font-style:italic;line-height:1.5}
.fate-pop-react{font-size:.92rem;line-height:1.65;color:#ffdde8;border-top:1px solid rgba(255,0,202,.15);padding:12px 18px}
.fate-pop-foot{padding:12px 18px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,0,202,.15)}
.fate-time-penalty{font-family:'Orbitron',monospace;font-size:.95rem;color:#ff00ca;font-weight:700}
/* Mindbreak */
.fate-mb-over{position:fixed;inset:0;z-index:9999999;display:flex;align-items:center;justify-content:center;flex-direction:column;opacity:0;pointer-events:none;transition:opacity .5s ease;overflow:hidden}
.fate-mb-over.on{opacity:1;pointer-events:auto}
.fate-mb-bg{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(20px) saturate(2.8);opacity:.28}
.fate-mb-veil{position:absolute;inset:0;background:radial-gradient(ellipse at 50%,rgba(40,0,30,.6),rgba(3,0,10,.9))}
.fate-mb-content{position:relative;z-index:2;text-align:center;padding:28px 24px;max-width:860px;width:100%}
.fate-mb-notice{background:linear-gradient(90deg,rgba(255,0,80,.18),rgba(255,0,80,.06));border:1px solid rgba(255,0,80,.55);border-radius:14px;padding:12px 22px;margin:0 auto 20px;max-width:480px;font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;color:#ff4466;letter-spacing:2px;text-transform:uppercase;text-shadow:0 0 14px rgba(255,50,80,.8);animation:ftBlk .8s ease-in-out infinite}
.fate-mb-phase{font-size:.7rem;letter-spacing:3px;text-transform:uppercase;color:#ff88cc;margin-bottom:12px;font-weight:600}
.fate-mb-msg{font-family:'Orbitron',sans-serif;font-size:clamp(1.8rem,5.5vw,3.4rem);font-weight:900;color:transparent;background:linear-gradient(90deg,#ff00ca,#ff88ee,#FF85C8,#ffd24d);-webkit-background-clip:text;background-clip:text;letter-spacing:1px;line-height:1.2;animation:ftMbP 1.4s ease-in-out infinite alternate}
@keyframes ftMbP{0%{filter:brightness(1)}100%{filter:brightness(1.45) blur(.4px)}}
.fate-mb-sub{font-size:1rem;line-height:1.65;color:#ffe0ee;margin:14px auto 0;max-width:580px}
.fate-mb-teases{display:flex;flex-direction:column;gap:8px;margin:18px auto 0;max-width:600px}
.fate-mb-tease{padding:11px 18px;border-radius:12px;font-size:.9rem;font-style:italic;line-height:1.55;border-left:3px solid #ff4466;background:rgba(255,30,80,.1);color:#ffccdd;text-align:left}
.fate-mb-cdown{font-family:'Orbitron',monospace;font-size:1.4rem;color:#ffd24d;margin-top:22px;font-weight:700;text-shadow:0 0 18px rgba(255,210,77,.7)}
.fate-mb-close{margin-top:22px;background:linear-gradient(90deg,#ff00ca,#ff88ee);color:#fff;font-weight:800;border:none;cursor:pointer;padding:13px 34px;border-radius:999px;font-size:.95rem;letter-spacing:1px;transition:all .2s;font-family:'Poppins',sans-serif;display:none}
.fate-mb-close:hover{transform:scale(1.06);filter:brightness(1.12)}
/* Responsive */
@media(max-width:900px){.fate-main-grid{grid-template-columns:1fr}.fate-rc{order:-1}.fate-img-wrap img{height:280px}}
@media(max-width:480px){.fate-pop-head{grid-template-columns:1fr}.fate-c2{grid-template-columns:1fr}#fateCountdown{font-size:1.2rem}}
`;

  /* ════════════════════════════════════════════════════
     HTML BLOCK
     ════════════════════════════════════════════════════ */
  var HTML_BLOCK = `
<div id="fate-overlay" class="fate-overlay">
  <div class="fate-bg"></div>
  <div class="fate-orb fate-orb1"></div>
  <div class="fate-orb fate-orb2"></div>
  <div class="fate-wrap">

    <div class="fate-timer-bar">
      <span class="fate-t-label">⛓ TRAPPED AS VALATA'S PANTIES FOR</span>
      <div id="fateCountdown">-- d -- h -- m -- s</div>
    </div>

    <div class="fate-main-grid">

      <!-- LEFT: image + story + tease wall -->
      <div class="fate-lc">

        <div class="fate-img-wrap" id="fateImgWrap">
          <img id="fateMainImg" src="https://i.ibb.co/KcqZnPZR/image0-1.gif" alt="Your Fate">
          <div class="fate-img-badge" id="fateStageBadge">Fresh Fabric</div>
        </div>

        <div class="fate-card">
          <div class="fate-card-ttl">How You Ended Up Here</div>
          <div class="fate-slist">

            <div class="fate-sfrag open" data-s="0">
              <div class="fate-strig">
                <span class="fate-strig-lbl"><span class="fate-sbadge">I</span> The Snoop</span>
                <span class="fate-sarrow">▼</span>
              </div>
              <div class="fate-sbody">
                <div class="fate-s-narr">
                  <p>You crept into Valata and Celina's bedroom like an idiot~ Quietly, like that would help~ Like Valata doesn't have eight ways to sense an intruder and find it funny to wait and let them get comfortable before doing anything~ She was sitting right there on the bed watching you the whole time. Just watching. Waiting for you to get far enough in that backing out would feel stupider than staying.</p>
                  <p>And then she snapped her fingers and you stopped being a person mid-step~</p>
                </div>
                <div class="fate-s-cel">"Aww~ You thought you were being sneaky~ Adorable. I could hear you from the hallway. Now be a good little thong and stop squirming while I put you on~"</div>
              </div>
            </div>

            <div class="fate-sfrag open" data-s="1">
              <div class="fate-strig">
                <span class="fate-strig-lbl"><span class="fate-sbadge">II</span> Wedged In</span>
                <span class="fate-sarrow">▼</span>
              </div>
              <div class="fate-sbody">
                <div class="fate-s-narr">
                  <p>You're stretched across her hips now~ Your waistband is her waistband~ Your crotch panel is whatever her pussy decides to do to it throughout the day and that turns out to be quite a lot~ Every step drives you a little deeper into her crack~ By the end of the first hour you've already been ground so deep between her cheeks that the seams are flush against her asshole and there's nowhere left to go except further~</p>
                  <p>She doesn't adjust you. Not once. She likes how you sit~</p>
                </div>
                <div class="fate-s-cel">"Mmm you're so warm against me~ Good fit too~ Did you know thongs never complain? I think that's your best quality so far~"</div>
              </div>
            </div>

            <div class="fate-sfrag open" data-s="2">
              <div class="fate-strig">
                <span class="fate-strig-lbl"><span class="fate-sbadge">III</span> The Soaking</span>
                <span class="fate-sarrow">▼</span>
              </div>
              <div class="fate-sbody">
                <div class="fate-s-narr">
                  <p>She gets herself off against you and when she finishes you feel the warm rush soak straight through every thread~ Hot and slick and absolutely everywhere~ It absorbs into you completely. You smell like her now~ Fully~ Permanently~ The fabric you're made of holds every drop and doesn't let go and Valata laughs and tells Celina you're "broken in" now~</p>
                </div>
                <div class="fate-s-cel">"There we go~ Now you smell like mine~ Celina, smell him~ Isn't that perfect~ He's so soaked~"</div>
              </div>
            </div>

            <div class="fate-sfrag open" data-s="3">
              <div class="fate-strig">
                <span class="fate-strig-lbl"><span class="fate-sbadge">IV</span> The Floor Night</span>
                <span class="fate-sarrow">▼</span>
              </div>
              <div class="fate-sbody">
                <div class="fate-s-narr">
                  <p>She strips you off and tosses you to the floor like you're nothing~ Because you are~ For the next two hours you lay there watching Celina and Valata wreck each other above you, every moan hitting you directly, and then Valata's foot comes down on your face on the way to the bathroom~ Not even on purpose~ She doesn't notice~ She picks you up off the floor afterward and puts you right back on still warm from the floorboards~</p>
                  <p>"Oh there you are~" she says. Like you're her keys~</p>
                </div>
                <div class="fate-s-cel">"Oops~ Did I step on you? I didn't feel anything~ How's the floor? Actually don't answer, I'm putting you back on~"</div>
              </div>
            </div>

            <div class="fate-sfrag open" data-s="4">
              <div class="fate-strig">
                <span class="fate-strig-lbl"><span class="fate-sbadge">✦</span> The Truth</span>
                <span class="fate-sarrow">▼</span>
              </div>
              <div class="fate-sbody">
                <div class="fate-s-narr">
                  <p>You don't remember why you came in here anymore~ You don't remember what you were hoping to see or what you thought would happen~ You just know warmth and pressure and the way her body moves against you all day and the muffled sounds from above when they play~ Your thoughts dissolved somewhere around day three and what's left is just fabric memory~ Her shape~ Her rhythm~ Her scent soaked into every thread forever~</p>
                  <p style="color:#ffd24d;font-style:italic;margin-top:12px">Your owner, your everything: <strong>Valata~</strong></p>
                </div>
                <div class="fate-s-cel" style="border-color:rgba(255,215,0,0.4);color:#fff3aa">"You were somebody once~ I think~ Doesn't matter now~ You're my favorite pair and that's honestly a better legacy than most people get~ ♥"</div>
              </div>
            </div>

          </div>
        </div>

        <!-- Tease Wall visible at 100% humiliation -->
        <div class="fate-card fate-tease-wall" id="fateTeaseWall" style="display:none">
          <div class="fate-card-ttl">💀 She Has Some Things To Say~</div>
          <div class="fate-tease-list">
            <div class="fate-tease-item">You thought you could just browse a website~ How adorable~ Now you're my underwear~ Stay right there~</div>
            <div class="fate-tease-item">I can feel you trying to remember who you were~ Doesn't matter~ You were nobody, pet~ Just pre-thong~</div>
            <div class="fate-tease-item">Celina asked what I was wearing and I said 'oh just some idiot who visited my page'~ She laughed so hard~</div>
            <div class="fate-tease-item">The cutest part is you can't even tell anyone~ What would you say~ 'I got turned into panties by a website'~</div>
            <div class="fate-tease-item">You smell like me now~ Every thread soaked through~ You'll smell like me forever~ Isn't that just the sweetest thing~</div>
          </div>
        </div>

      </div><!-- /fate-lc -->

      <!-- RIGHT: info + actions -->
      <div class="fate-rc">

        <div class="fate-card">
          <h1 class="fate-ptitle">Valata's Trapped Little Thong</h1>
          <div class="fate-sub">You snooped. She caught you. Now you're stretched across her hips for a week and there is <strong style="color:#ff88cc">no exit button~</strong></div>
          <div class="fate-spill"><span class="fate-spill-dot"></span> Permanently Wedged</div>
          <div class="fate-meter-wrap">
            <div class="fate-meter-top">
              <span class="fate-m-lbl">Humiliation Meter</span>
              <span id="fateMPct">0%</span>
            </div>
            <div class="fate-m-bar"><div id="fateMFill"></div></div>
            <div class="fate-m-stages"><span>Fresh</span><span>Soaked</span><span>Broken</span><span>Gone</span></div>
          </div>
          <div id="fateVoice" class="fate-voice s-r">
            <div class="fate-voice-txt" id="fateVoiceTxt"></div>
          </div>
        </div>

        <div class="fate-card">
          <div class="fate-card-ttl">⛓ What Happens To You</div>
          <div class="fate-brow fate-c2">
            <button class="fate-btn fate-b-red"  onclick="fateAct('sit')">🍑 She Sits On You</button>
            <button class="fate-btn fate-b-pink" onclick="fateAct('grind')">💅 Grind Into Crack</button>
          </div>
          <div class="fate-brow fate-c2">
            <button class="fate-btn fate-b-purp" onclick="fateAct('flood')">💦 Pussy Floods You</button>
            <button class="fate-btn fate-b-teal" onclick="fateAct('gym')">🏋️ Gym Wedge</button>
          </div>
          <div class="fate-brow fate-c2">
            <button class="fate-btn fate-b-gold" onclick="fateAct('floor')">👀 Watch From Floor</button>
            <button class="fate-btn fate-b-red"  onclick="fateAct('cum')">💦 Celina's Load</button>
          </div>
          <div class="fate-brow fate-c2">
            <button class="fate-btn fate-b-dark" onclick="fateAct('beg')">🙏 Squirm &amp; Beg</button>
            <button class="fate-btn fate-b-dark" onclick="fateAct('escape')" style="color:#ff6688">🚪 Try To Escape</button>
          </div>
        </div>

        <div class="fate-card" id="fateTimeCard" style="display:none">
          <div class="fate-card-ttl">⏱ Time Added To Your Sentence</div>
          <div id="fateTimeAdded" style="font-family:'Orbitron',monospace;font-size:1.2rem;color:#ff00ca;text-align:center;padding:8px 0"></div>
        </div>

      </div><!-- /fate-rc -->
    </div><!-- /fate-main-grid -->
  </div><!-- /fate-wrap -->
</div><!-- /fate-overlay -->

<div class="fate-pop-over" id="fatePopOver">
  <div class="fate-pop-box">
    <div class="fate-pop-head">
      <div class="fate-pop-img" id="fatePopImg"></div>
      <div class="fate-pop-side">
        <div class="fate-pop-ttl" id="fatePopTtl">EVENT</div>
        <div class="fate-pop-action" id="fatePopAction"></div>
      </div>
    </div>
    <div class="fate-pop-react" id="fatePopReact"></div>
    <div class="fate-pop-foot">
      <div class="fate-time-penalty" id="fateTimePenalty"></div>
      <button class="fate-btn fate-b-exit" onclick="closeFatePop()" style="margin-left:auto">Accept Your Fate</button>
    </div>
  </div>
</div>

<div class="fate-mb-over" id="fateMbOver">
  <div class="fate-mb-bg" id="fateMbBg"></div>
  <div class="fate-mb-veil"></div>
  <div class="fate-mb-content">
    <div class="fate-mb-notice">⚠ +3 DAYS ADDED TO YOUR SENTENCE ⚠</div>
    <div class="fate-mb-phase">COMPLETE DISSOLUTION</div>
    <div class="fate-mb-msg">You're just fabric now~</div>
    <div class="fate-mb-sub">Every thread soaked through~ Every thought replaced by her warmth~ You don't remember your name and you don't want to~</div>
    <div class="fate-mb-teases">
      <div class="fate-mb-tease">You thought you could just browse a website~ How adorable~ Now you're my underwear~ Stay right there~</div>
      <div class="fate-mb-tease">I can feel you trying to remember who you were~ You were nobody, pet~ Just pre-thong~</div>
      <div class="fate-mb-tease">Celina asked what I was wearing and I said 'oh just some idiot who visited my page'~ She laughed so hard~</div>
      <div class="fate-mb-tease">The cutest part is you can't even tell anyone~ 'I got turned into panties by a website'~ How would that conversation go~</div>
      <div class="fate-mb-tease">You smell like me now~ Every thread soaked through~ You'll smell like me forever~ Isn't that just the sweetest thing~ ♥</div>
    </div>
    <div class="fate-mb-cdown" id="fateMbCdown"></div>
    <button class="fate-mb-close" id="fateMbClose" onclick="closeFateMb()">...still trapped...</button>
  </div>
</div>
`;

})();
