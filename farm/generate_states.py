import os

STATES_DIR = r'C:\Users\PC\OneDrive\Dokumente\Celina_Website_Better\farm\States'

def make_state_file(
    title, char_name, char_role, badge,
    accent, accent_light, bg_gradient,
    tf_label, progress_stages,
    voice_lines, resist_lines, action_lines,
    memory_fragments, status_messages,
    action_btns,  # list of (css_class, label, action_key)
    local_key
):
    action_btn_html = '\n'.join(
        f'                <button class="action-btn {cls}" onclick="doAction(\'{key}\')">{lbl}</button>'
        for cls, lbl, key in action_btns
    )
    stage_labels = ' '.join(f'<span>{s}</span>' for s in progress_stages)
    
    def frag_html(idx, title_text, body_text):
        return f'''                    <div class="memory-fragment" data-stage="{idx}">
                        <div class="memory-trigger" onclick="toggleMemory({idx})">#{idx+1} — {title_text}</div>
                        <div class="memory-content">{body_text}</div>
                    </div>'''
    
    fragments_html = '\n'.join(frag_html(i, t, b) for i, (t, b) in enumerate(memory_fragments))
    
    voice_js = repr(voice_lines).replace("'", '"')
    resist_js = repr(resist_lines).replace("'", '"')
    action_js_entries = '\n        '.join(
        f'"{k}": {repr(v).replace(chr(39), chr(34))},'
        for k, v in action_lines.items()
    )
    status_js = repr(status_messages).replace("'", '"')
    
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Orbitron:wght@500;700&display=swap" rel="stylesheet">
    <script>(function(){{const s=JSON.parse(localStorage.getItem('farmState')||'{{}}');if(s.trappedUntil&&s.trappedUntil>Date.now()){{}}else{{localStorage.removeItem('farmState');window.location.href='../../index.html';}}}})()</script>
    <style>
        *{{margin:0;padding:0;box-sizing:border-box;}}
        body{{background:{bg_gradient};color:#fff;font-family:'Poppins',sans-serif;min-height:100vh;overflow-x:hidden;}}
        .main-container{{display:flex;flex-direction:column;align-items:center;padding:20px;gap:28px;}}
        .timer-display{{font-family:'Orbitron',monospace;font-size:3.2rem;font-weight:700;color:{accent};text-align:center;text-shadow:0 0 28px {accent},0 0 55px rgba(0,0,0,0.5);letter-spacing:7px;margin-bottom:8px;}}
        .timer-label{{font-size:13px;color:#9a8878;letter-spacing:2px;text-transform:uppercase;text-align:center;margin-top:-6px;}}
        .main-panel{{display:grid;grid-template-columns:1fr 360px;gap:36px;max-width:1100px;width:100%;align-items:start;}}
        .left-panel{{display:flex;flex-direction:column;align-items:center;gap:18px;}}
        .image-container{{position:relative;width:100%;max-width:560px;height:460px;border-radius:20px;overflow:hidden;box-shadow:0 18px 55px rgba(0,0,0,0.5);border:2px solid {accent}66;}}
        .tf-image{{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.8s ease;}}
        .tf-image.active{{opacity:1;}}
        .right-panel{{display:flex;flex-direction:column;gap:18px;}}
        .item-header{{text-align:center;}}
        .item-title{{font-family:'Orbitron',sans-serif;font-size:1.6rem;font-weight:700;color:{accent};text-shadow:0 0 18px {accent}99;margin-bottom:7px;letter-spacing:2px;}}
        .category-badge{{background:linear-gradient(45deg,{accent},{accent_light});color:#fff;padding:7px 18px;border-radius:50px;font-size:0.85rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;box-shadow:0 4px 16px {accent}66;}}
        .mind-break-container{{background:{accent}1a;border:2px solid {accent}66;border-radius:18px;padding:18px;}}
        .mind-break-header{{display:flex;justify-content:space-between;align-items:center;margin-bottom:13px;}}
        .mind-break-title{{font-family:'Orbitron',sans-serif;font-size:0.95rem;color:{accent_light};font-weight:700;letter-spacing:2px;text-transform:uppercase;}}
        .mind-break-percentage{{font-family:'Orbitron',sans-serif;font-size:2rem;font-weight:700;color:{accent};}}
        .mind-break-bar{{height:18px;background:rgba(0,0,0,0.6);border-radius:10px;overflow:hidden;border:1px solid {accent}55;}}
        .mind-break-fill{{height:100%;background:linear-gradient(90deg,{accent},{accent_light});transition:width 0.6s ease;border-radius:10px;box-shadow:0 0 18px {accent}cc;}}
        .mind-break-stages{{display:flex;justify-content:space-between;margin-top:10px;font-size:0.78rem;color:#9a8878;font-weight:600;letter-spacing:1px;}}
        .voice-box{{background:rgba(5,2,8,0.88);border:1px solid {accent}44;border-radius:12px;padding:16px;font-size:14px;color:#d0c0b0;line-height:1.7;font-style:italic;min-height:80px;}}
        .voice-name{{font-family:'Orbitron',sans-serif;font-size:11px;color:{accent};letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;font-style:normal;}}
        .action-buttons{{display:grid;grid-template-columns:1fr 1fr;gap:10px;}}
        .action-btn{{font-family:'Poppins',sans-serif;font-size:0.88rem;font-weight:700;padding:13px 14px;border-radius:50px;border:none;cursor:pointer;transition:all 0.25s ease;text-transform:uppercase;letter-spacing:1px;}}
        .action-btn:hover{{transform:translateY(-2px) scale(1.04);filter:brightness(1.12);}}
        .btn-a{{background:linear-gradient(45deg,{accent},{accent_light});color:#fff;box-shadow:0 6px 20px {accent}66;}}
        .btn-b{{background:linear-gradient(45deg,#8B4513,#A0522D);color:#fff;box-shadow:0 6px 20px #8B451366;}}
        .btn-c{{background:linear-gradient(45deg,#D4A017,#E6B800);color:#000;box-shadow:0 6px 20px #D4A01766;}}
        .btn-d{{background:linear-gradient(45deg,#E91E8C,{accent});color:#fff;box-shadow:0 6px 20px #E91E8C66;}}
        .free-btn{{display:none;width:100%;padding:16px;font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:700;background:linear-gradient(135deg,#4CAF50,#8BC34A);color:#fff;border:none;border-radius:12px;cursor:pointer;letter-spacing:2px;text-transform:uppercase;box-shadow:0 0 30px rgba(76,175,80,0.6);}}
        .lower-section{{max-width:980px;width:100%;}}
        details summary{{font-family:'Orbitron',sans-serif;font-size:1.4rem;font-weight:700;color:{accent};padding:18px;list-style:none;background:{accent}1a;border-radius:16px;border:2px solid {accent}55;text-align:center;text-shadow:0 0 12px {accent};cursor:pointer;margin-top:20px;}}
        .stall-status{{padding:22px;background:rgba(5,2,8,0.9);border:1px solid {accent}33;border-radius:0 0 16px 16px;}}
        .stall-status p{{color:#c0b0a0;line-height:1.7;margin-bottom:14px;}}
        .memory-fragment{{margin-bottom:6px;border-radius:8px;overflow:hidden;background:rgba(10,5,12,0.85);border:1px solid {accent}22;}}
        .memory-trigger{{padding:13px 18px;cursor:pointer;font-size:13px;font-weight:700;color:#b0a0c0;letter-spacing:1px;background:{accent}0d;border-left:4px solid {accent};transition:all 0.2s;}}
        .memory-trigger:hover{{background:{accent}22;color:#fff;}}
        .memory-content{{display:none;padding:18px;background:rgba(3,1,5,0.95);font-style:italic;color:#c0b0a8;line-height:1.7;font-size:14px;}}
        .memory-content.active{{display:block;}}
        .char-speak{{color:{accent_light}!important;font-weight:700;font-style:normal;}}
        @media(max-width:700px){{.main-panel{{grid-template-columns:1fr;}}.image-container{{height:280px;max-width:100%;}}}}
    </style>
</head>
<body>
<div class="main-container">
    <div class="timer-display" id="timerDisplay">00:00:00</div>
    <div class="timer-label">time remaining with {char_name.lower()}</div>

    <div class="main-panel">
        <div class="left-panel">
            <div class="image-container">
                <img src="https://via.placeholder.com/560x460/0a0210/{accent[1:]}?text=Stage+1" class="tf-image active" data-stage="0">
                <img src="https://via.placeholder.com/560x460/0a0210/{accent[1:]}?text=Stage+2" class="tf-image" data-stage="1">
                <img src="https://via.placeholder.com/560x460/0a0210/{accent[1:]}?text=Stage+3" class="tf-image" data-stage="2">
                <img src="https://via.placeholder.com/560x460/0a0210/{accent[1:]}?text=Stage+4" class="tf-image" data-stage="3">
            </div>
        </div>
        <div class="right-panel">
            <div class="item-header">
                <h1 class="item-title">{char_name}'s {tf_label}</h1>
                <div class="category-badge">Stables — {badge}</div>
            </div>
            <div class="mind-break-container">
                <div class="mind-break-header">
                    <div class="mind-break-title">CONDITIONING</div>
                    <div class="mind-break-percentage" id="mindBreakPct">0%</div>
                </div>
                <div class="mind-break-bar">
                    <div class="mind-break-fill" id="mindBreakFill" style="width:0%"></div>
                </div>
                <div class="mind-break-stages">{stage_labels}</div>
            </div>
            <div class="voice-box">
                <div class="voice-name">{char_name}</div>
                <div id="voiceText">{voice_lines[0]}</div>
            </div>
            <div class="action-buttons">
{action_btn_html}
            </div>
            <button class="free-btn" id="freeBtn" onclick="setFree()">You Are Free — Leave</button>
        </div>
    </div>

    <div class="lower-section">
        <details>
            <summary>Your Life Here</summary>
            <div class="stall-status">
                <p id="statusText">{status_messages[0]}</p>
                <div id="memoryFragments">
{fragments_html}
                </div>
            </div>
        </details>
    </div>
</div>
<script>
    const state = JSON.parse(localStorage.getItem('farmState') || '{{}}');
    const endTime = state.trappedUntil || 0;
    const localKey = '{local_key}';

    const voiceLines = {voice_js};
    const resistLines = {resist_js};
    const actionLines = {{
        {action_js_entries}
    }};
    const statusMessages = {status_js};

    function update() {{
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        document.getElementById('timerDisplay').textContent =
            String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');

        const mbPct = Math.min(100, parseInt(localStorage.getItem(localKey) || '0'));
        document.getElementById('mindBreakPct').textContent = mbPct + '%';
        document.getElementById('mindBreakFill').style.width = mbPct + '%';

        const stage = Math.min(voiceLines.length - 1, Math.floor(mbPct / (100 / voiceLines.length)));
        document.getElementById('voiceText').textContent = voiceLines[stage];

        document.querySelectorAll('.tf-image').forEach(img => img.classList.remove('active'));
        const imgStage = Math.min(3, Math.floor(mbPct / 25));
        const img = document.querySelector('.tf-image[data-stage="' + imgStage + '"]');
        if (img) img.classList.add('active');

        document.querySelectorAll('.memory-fragment').forEach(frag => {{
            const fs = parseInt(frag.getAttribute('data-stage'));
            const unlocked = mbPct >= fs * 20;
            frag.style.opacity = unlocked ? '1' : '0.35';
            frag.style.pointerEvents = unlocked ? 'auto' : 'none';
        }});

        const stMsg = Math.min(statusMessages.length - 1, Math.floor(mbPct / (100 / statusMessages.length)));
        document.getElementById('statusText').textContent = statusMessages[stMsg];

        if (remaining <= 0) {{
            document.getElementById('freeBtn').style.display = 'block';
            document.getElementById('timerDisplay').textContent = 'FREE';
            document.getElementById('timerDisplay').style.color = '#4CAF50';
        }}
    }}

    function doAction(type) {{
        const stored = parseInt(localStorage.getItem(localKey) || '0');
        let delta = 3;
        if (type === 'resist') {{
            const lines = resistLines;
            document.getElementById('voiceText').textContent = lines[Math.floor(Math.random() * lines.length)];
        }} else {{
            const pool = actionLines[type] || [];
            if (pool.length) document.getElementById('voiceText').textContent = pool[Math.floor(Math.random() * pool.length)];
            delta = 7;
        }}
        localStorage.setItem(localKey, Math.min(100, stored + delta));
        update();
    }}

    function toggleMemory(idx) {{
        document.querySelectorAll('.memory-content')[idx].classList.toggle('active');
    }}

    function setFree() {{
        localStorage.removeItem('farmState');
        localStorage.removeItem(localKey);
        window.location.href = '../stables.html';
    }}

    update();
    setInterval(update, 1000);
</script>
</body>
</html>'''

# ---- DATA DEFINITIONS ----

files = {
    'stables-vex-pig.html': dict(
        title="Vex's Pen — Kept as a Pig",
        char_name='Vex Harlow', char_role='Head Groom', badge='Pig Form',
        accent='#C0392B', accent_light='#E74C3C',
        bg_gradient='linear-gradient(135deg, #1a0505 0%, #0a0210 100%)',
        tf_label='Pig', progress_stages=['HUMAN','SNOUT','PIG','OWNED'],
        voice_lines=[
            "Stand in the pen. Pigs stand in the pen. That's how it works.",
            "Your nose is doing something interesting. Just let it. It knows what to do.",
            "You tried to say something. What came out was better. Cleaner.",
            "You're rooting in the hay. You found something. That's exactly right.",
            "My best pig. The most stubborn one I've had. That's not an insult."
        ],
        resist_lines=[
            "Pigs root. They don't argue. You're almost there.",
            "The pen is very secure. You can test that if you like.",
            "Resistance makes the nose push out faster. Observed pattern.",
            "I've had pigs with more dignity than this. They all settled.",
            "Stop. You'll tire yourself out before the mud comes."
        ],
        action_lines={
            'root': ["Good. That's exactly right.", "You found something. Your nose is better than you think.", "That's instinct. Working correctly."],
            'grunt': ["Cleaner than words. More honest.", "Good voice. That's yours now.", "Good."],
            'roll': ["You found the mud patch. I put it there for you.", "Comfortable. You'll roll every morning.", "That's it. Settle in."]
        },
        memory_fragments=[
            ("ASSESSMENT", '<span class="char-speak">Vex: "Walk to the pen gate. Not the door — the gate."</span> You do it before you decide to. She watches with no expression. <span class="char-speak">"Good. You already know the difference."</span> You did not know that you knew the difference.'),
            ("THE SNOUT", 'Your nose is wider. You noticed it in the smell of the pen floor — the layers of it, the information in it. <span class="char-speak">Vex: "Don\'t panic. It\'s just the face catching up."</span> Your nose tells you there is something interesting in the far corner. You find yourself moving toward it.'),
            ("THE PEN", 'The gate closes. Clean sound. The pen floor under your hooves — not hooves yet, but close — is packed earth and straw and very specifically correct. You lower your head without being told. <span class="char-speak">"There."</span>'),
            ("MUDTIME", 'She puts the mud patch in every morning. You are waiting for it before she arrives. Your ears know the sound of her boots. The mud is warm. You settle into it with a satisfaction that has no human frame of reference. <span class="char-speak">"Good pig."</span>'),
            ("OWNED", 'The pen has your name on it now. The one she gave you, said once, and you heard and your head came up. You are her best pig. You know this because she said so, and she says very little, and everything she says is true.')
        ],
        status_messages=[
            "You are in the pen. The floor is interesting. You haven't decided what that means yet.",
            "Your nose is working. It keeps finding things you didn't ask it to find.",
            "You made a sound that wasn't a word. You remember the word. It's getting quieter.",
            "The mud patch is warm. You knew where it was before she brought it.",
            "You are Vex's pig. The pen is yours. The name she gave you is yours. This is correct."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','ROOT','root'),('btn-c','GRUNT','grunt'),('btn-d','ROLL IN MUD','roll')],
        local_key='stables_vex_pig_break'
    ),

    'stables-vex-sheep.html': dict(
        title="Vex's Flock — Kept as a Sheep",
        char_name='Vex Harlow', char_role='Head Groom', badge='Sheep Form',
        accent='#C0392B', accent_light='#E74C3C',
        bg_gradient='linear-gradient(135deg, #1a0505 0%, #0a0210 100%)',
        tf_label='Sheep', progress_stages=['HUMAN','FLEECE','FLOCK','OWNED'],
        voice_lines=[
            "Stand with the others. Sheep stand with the flock. Stop separating yourself.",
            "The wool is coming in across your shoulders. It will be warm. That's not a bad thing.",
            "You tried to leave the paddock. Your feet brought you back. They know where you belong.",
            "You're following. That's correct. Sheep follow. You're the best at following in this flock.",
            "You'll be shorn in the spring. I'll be there. You won't mind. You mind a lot of things less now."
        ],
        resist_lines=[
            "The paddock fence is higher than you think it is.",
            "Sheep don't fight. That's the whole point of sheep.",
            "You'll tire before I do. I've been doing this a long time.",
            "The others are watching. They settled faster than you.",
            "Resistance is wasted energy. The wool comes in either way."
        ],
        action_lines={
            'bleat': ["Good voice. Small but certain.", "That's yours. Clean.", "The others heard you."],
            'graze': ["You found the good patch. Keep it.", "Correct. That's what the paddock is for.", "Head down. Grazing. Yes."],
            'follow': ["First one in the flock to follow properly.", "You knew which direction before I pointed.", "That's correct. Follow."]
        },
        memory_fragments=[
            ("FIRST WOOL", 'It comes in across the back of your hands first. Dense, warm, wrong-and-then-very-right. <span class="char-speak">Vex: "Don\'t pull at it. It grows even if you pull."</span> She says this from outside the paddock, watching. Making notes.'),
            ("THE FLOCK", "The other sheep are warm and present. You don't know when you moved toward them. You are standing in the middle of them now and it is the most natural arrangement in the world. The smell of them is dense and right.",),
            ("PADDOCK", 'The paddock grass comes in sweet in the morning. You know this now. You were waiting for it before you remembered what waiting was. <span class="char-speak">Vex: "Good. You\'ve found the routine."</span>'),
            ("SHORN", 'She shears you with the same clinical efficiency she does everything. The wool comes off in long clean sweeps. The lightness afterward is remarkable. You bleat once. <span class="char-speak">"Good,"</span> she says, and moves to the next.'),
            ("OWNED", 'You are the best sheep in the flock. She said so while checking your fleece, quietly, like a fact. Your name — the one she gave you — you hear it and your head comes up every time without trying.')
        ],
        status_messages=[
            "You are in the paddock. The others are here. You haven't moved toward them yet but you will.",
            "The wool is coming in. Your back is warm. The flock is very close.",
            "You followed without being told. You are the second-best at following.",
            "The grazing is good. You know where the best patch is. You were there before sunrise.",
            "You are Vex's best sheep. The flock is yours. The paddock is home. This is correct."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','BLEAT','bleat'),('btn-c','GRAZE','graze'),('btn-d','FOLLOW','follow')],
        local_key='stables_vex_sheep_break'
    ),

    'stables-nora-mare.html': dict(
        title="Nora's Bred Mare",
        char_name='Nora Ash', char_role='Breed Witch', badge='Mare Form',
        accent='#E74C3C', accent_light='#FF6B6B',
        bg_gradient='linear-gradient(135deg, #1a0308 0%, #080315 100%)',
        tf_label='Mare', progress_stages=['HUMAN','HEAT','BRED','HERD'],
        voice_lines=[
            "The spell isn't done yet. Just let it finish. Breathe.",
            "The heat's starting. You can feel it in your blood. That's the mare coming in.",
            "You're so warm. That's right. That's exactly right. Stay with it.",
            "You're the most beautiful mare I've ever made. I mean that. You're everything I hoped.",
            "You're settled now. The herd is yours. The heat returns with the seasons. I'll be here."
        ],
        resist_lines=[
            "Resisting the heat just makes it burn longer. Let it go.",
            "Your body already knows what it wants. Listen to it.",
            "The spell is gentle. You don't need to fight something gentle.",
            "I've never lost a mare to resistance. They all come around.",
            "You're warm. You know you're warm. Stop pretending that's nothing."
        ],
        action_lines={
            'nuzzle': ["Yes. That's connection. That's what mares do.", "Good. I've got you.", "Warm. Yes."],
            'toss': ["Beautiful. Your mane is perfect.", "The movement is right. Loose and strong.", "Good. That's freedom."],
            'settle': ["Yes. This is correct.", "The herd is warm. You found them.", "You're home."]
        },
        memory_fragments=[
            ("THE SPELL", '<span class="char-speak">Nora: "The spell needs something from you. Just a little warmth. Can you give me that?"</span> She holds both your hands and the warmth she\'s talking about rises from somewhere very deep. You give it. You don\'t mean to. You do anyway.'),
            ("THE HEAT", 'It comes in like the warmth Nora asked for, but larger. Your whole body is the source of it. Your blood feels different — denser, brighter. <span class="char-speak">"There it is,"</span> she says, very quietly. <span class="char-speak">"Beautiful."</span>'),
            ("BRED", 'She is with you the whole time. That is the thing you hold. Whatever the spell does, she is there, warm and steady and genuinely proud of you. <span class="char-speak">"You\'re my best mare,"</span> she says, and she means it.'),
            ("THE HERD", 'The herd is warm and the grass is sweet and the spell is inside you now like something that was always there. Nora comes every morning. Your ears find her before you see her. <span class="char-speak">"Good morning, love."</span>'),
            ("SEASONS", 'The heat returns with the first warm rains. You know it is coming before it arrives. You are calm about it now, which is the final change. Nora is with you. The herd is warm. The seasons turn. This is your life.')
        ],
        status_messages=[
            "The spell is settling in. You're warm. That's the beginning.",
            "The heat has started. Your whole body knows it. You haven't decided what to do with that yet.",
            "You're nuzzling. You didn't decide to. The mare in you did.",
            "The herd found you, or you found the herd. You're in the middle of them. It's warm.",
            "You are Nora's mare. The seasons return you to her. The herd is warm. This is home."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','NUZZLE','nuzzle'),('btn-c','TOSS MANE','toss'),('btn-d','SETTLE','settle')],
        local_key='stables_nora_mare_break'
    ),

    'stables-nora-donkey.html': dict(
        title="Nora's Working Donkey",
        char_name='Nora Ash', char_role='Breed Witch', badge='Donkey Form',
        accent='#E74C3C', accent_light='#FF6B6B',
        bg_gradient='linear-gradient(135deg, #1a0308 0%, #080315 100%)',
        tf_label='Donkey', progress_stages=['HUMAN','STEADY','WORKING','BONDED'],
        voice_lines=[
            "The donkey needs steadiness. You already have steadiness. This isn't so different.",
            "Your ears are up. Good. Donkeys notice everything. You'll notice everything now.",
            "You brayed just now. Clear and strong. That's your voice. It suits you.",
            "You carry the load without being asked. That's the heart of it — the willingness.",
            "You're the most loyal donkey I've made. I'll say that plainly. You're remarkable."
        ],
        resist_lines=[
            "A donkey digs in when it's right and it knows when it's right. This is right.",
            "That's stubbornness. Donkeys have it. It just needs a purpose.",
            "You resist. That's donkey nature. The spell made that part bigger, not smaller.",
            "Even your resistance is useful. That's the gift of this form.",
            "Steady. There's no rush. Donkeys don't rush."
        ],
        action_lines={
            'bray': ["There it is. Clear and certain.", "Your voice. Big and present.", "Good. The hills heard you."],
            'carry': ["You knew what to do. Instinct.", "The load is right. Your body knows.", "Good. That's service. That's purpose."],
            'stand': ["Patient. That's donkey nature. Let it be yours.", "Good. Just stand. That's enough.", "Steady. Yes."]
        },
        memory_fragments=[
            ("THE SPELL", 'Nora held your face in both hands. <span class="char-speak">"The spell needs something steady in you. Something that holds."</span> You gave it. The warmth flowed from her palms. Your ears moved first.'),
            ("FIRST EARS", 'Long. High. Picking up everything. The whole stable in range, every voice, every footstep. You turn them toward Nora\'s voice without thinking. <span class="char-speak">"Good ears. You\'ll use those."</span>'),
            ("FIRST LOAD", 'She puts the pack on your back. Correct weight. You take it without shifting. <span class="char-speak">"There. That\'s the carrying instinct. You had it before I gave it to you."</span> She means that as a compliment. You feel it as one.'),
            ("BONDED", 'You know her footsteps. You knew them by the second day. Your ears find her across the stable. When she arrives your head comes up. Not with urgency — with recognition. <span class="char-speak">"There you are."</span>'),
            ("WORK", 'The work is steady and the days are long and the weight is always right and at the end you stand in your paddock with your head low in the warm evening and this is the most correct thing you have ever been. <span class="char-speak">Nora: "My best one."</span>')
        ],
        status_messages=[
            "The spell is starting. Your ears feel different. You haven't looked at them yet.",
            "Your ears are up. You're catching everything. The stable is very loud with information.",
            "You brayed. You didn't mean to. It felt exactly right.",
            "You carried the load before she asked. The instinct is there now.",
            "You are Nora's donkey. The work is steady. She comes every morning. This is your life."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','BRAY','bray'),('btn-c','CARRY','carry'),('btn-d','STAND STEADY','stand')],
        local_key='stables_nora_donkey_break'
    ),

    'stables-thessaly-cat.html': dict(
        title="Thessaly's Cat",
        char_name='Thessaly', char_role='Wild Witch', badge='Cat Form',
        accent='#9B59B6', accent_light='#BB8FCE',
        bg_gradient='linear-gradient(135deg, #0a0514 0%, #040210 100%)',
        tf_label='Cat', progress_stages=['HUMAN','EARS','FELINE','KEPT'],
        voice_lines=[
            "Oh you're still in there! Hi! Don't worry, cats always take a minute to settle.",
            "You're purring. I know you didn't decide to. That's completely normal.",
            "Your tail is doing a thing. Cats can't fully control their tails. It's very funny.",
            "You just found a sunny patch. You're going to lie in it for three hours. I can already tell.",
            "You are the best cat. A perfect cat. I'm keeping you forever. I hope that's fine."
        ],
        resist_lines=[
            "The ward is up! I'm not being mean — you just can't leave yet.",
            "You're scratching at the door. Cats do that! It's very cute!",
            "Resist all you want, you're already purring. I can hear it.",
            "That's hissing! You hissed! That's incredible, you're doing great.",
            "Even your resistance is adorable. This is going so well."
        ],
        action_lines={
            'purr': ["See?? The purring! I knew you'd have great purring.", "Purring and purring and purring. This is perfect.", "You can't stop purring when you're relaxed. That's biology now."],
            'stretch': ["LOOK AT THE STRETCH. The full stretch! The back arch!", "That's a perfect stretch. All four paws. Magnificent.", "You stretched and then immediately almost fell asleep. Textbook."],
            'flop': ["THE FLOP. You just flopped over. Full cat flop.", "You flopped on your side in a sunbeam. I'm so proud of you.", "The flop was very dignified. For a flop."]
        },
        memory_fragments=[
            ("THE EARS", 'They came in fast. One moment: normal. Next moment: something warm and quick at the top of your skull, and your ears are high and pointed and catching every sound in the stall. <span class="char-speak">Thessaly: "LOOK AT THOSE. Look at the TUFTS."</span>'),
            ("FIRST PURR", 'She was holding you. The purring started without you. A deep, mechanical rumbling from your chest that had nothing to do with your decisions. <span class="char-speak">"Oh! You\'re already purring! That\'s so early!"</span> It did not stop.'),
            ("SUNNY PATCH", 'There is a sunny patch in the corner of the stall. You found it. You are in it now. You have been in it for a long time and you are warm and the purring is constant and your tail is moving in a slow sweep. This is fine.'),
            ("HELD", 'She picks you up like she\'s been doing it forever. One hand under, one supporting. You are held at chest height. You look at her face. Her eyes are enormous from here. <span class="char-speak">"Hi,"</span> she says. Your purring increases.'),
            ("KEPT", 'You are a cat. Thessaly\'s cat. The stall is your territory. The sunny patch is yours in the morning and the hay pile is yours when it\'s cold. Your name — the one she uses — your ears turn every time. <span class="char-speak">"I told you you\'d be a cat. I have a sense for these things."</span>')
        ],
        status_messages=[
            "You're in the stall. The sunny patch is in the corner. You've noticed it.",
            "You're purring. You didn't start that on purpose. It won't stop.",
            "Your tail is doing something independent. Your ears keep finding sounds. You're very loud inside now.",
            "You're in the sunny patch. You've been there a while. Thessaly keeps coming to check on you.",
            "You are Thessaly's cat. The stall is warm. The sunny patch is yours. This is very correct."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','PURR','purr'),('btn-c','STRETCH','stretch'),('btn-d','FLOP OVER','flop')],
        local_key='stables_thessaly_cat_break'
    ),

    'stables-thessaly-dog.html': dict(
        title="Thessaly's Dog",
        char_name='Thessaly', char_role='Wild Witch', badge='Dog Form',
        accent='#9B59B6', accent_light='#BB8FCE',
        bg_gradient='linear-gradient(135deg, #0a0514 0%, #040210 100%)',
        tf_label='Dog', progress_stages=['HUMAN','EARS','TAIL','DEVOTED'],
        voice_lines=[
            "You're a dog now! Your ears came in so fast. You're going to be such a good dog.",
            "Your tail is wagging. I know you're confused about that. Dogs wag. You wag now.",
            "You're SO HAPPY. Dogs get happy when they see people they like. Do you like me?",
            "You licked my face. You didn't plan that. Your face planned that.",
            "You are the best dog. You are my best dog. I'm going to tell you that every day."
        ],
        resist_lines=[
            "The ward is up! You already wagged at me once which undermines this a bit.",
            "You can try to resist but your tail started wagging mid-resistance.",
            "You're growling but it's not a very convincing growl. It's a little friendly.",
            "Resisting while your tail is going is mixed messaging. I'm noting it.",
            "Your ears folded down. That's actually very sweet when dogs do it."
        ],
        action_lines={
            'wag': ["THE WAG. You can't stop it. I love it.", "Full-body wag now. Excellent.", "Your whole back half is moving. This is wonderful."],
            'bark': ["There it is! Short bark! Surprised bark! Perfect!", "You barked and then looked surprised you barked.", "Good bark. Firm. Certain. Yours."],
            'spin': ["You spun in a circle! Happy spin! Dogs do that!", "You spun twice. Happy dogs spin. You're a happy dog.", "The spin! Yes! This is a spin of joy!"]
        },
        memory_fragments=[
            ("THE EARS", 'They flopped forward before you registered they\'d moved. Large, warm, folding slightly at the tips. The whole stable in vivid audio detail. <span class="char-speak">Thessaly: "The ears are so good. The ears are already so good."</span>'),
            ("THE TAIL", 'It moved before the rest of you. A thick, warm presence behind you, sweeping steadily. You reached back and found it. It sped up when you touched it. <span class="char-speak">"THERE IT IS. The tail is going!"</span>'),
            ("THE LICK", 'She got down on the floor and opened her arms and you went to her and you licked her face. You did not plan this. Your face executed independently. <span class="char-speak">"HI. Hello. I missed you too."</span>'),
            ("GOOD DOG", '<span class="char-speak">"You are a very good dog,"</span> she said, looking directly at you. And the part of you that is a dog heard it and responded with full-body enthusiasm and the part of you that was human heard it and also responded with full-body enthusiasm. Both. Simultaneously.'),
            ("DEVOTED", 'You know her smell across the stable. You know her footsteps from the others. When the stall door opens and it\'s her, your tail starts before you see her face. <span class="char-speak">"There\'s my dog."</span> And you are. You entirely are.')
        ],
        status_messages=[
            "Your ears came in. Everything is louder and more detailed. Your tail started.",
            "You're wagging. You can't stop it. You don't want to.",
            "You licked her face. You didn't plan that. Your face planned that without you.",
            "You're spinning in circles because she came in. Happy spin. Full-body joy.",
            "You are Thessaly's dog. You know her footsteps. You are devoted. This is home."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','WAG','wag'),('btn-c','BARK','bark'),('btn-d','SPIN','spin')],
        local_key='stables_thessaly_dog_break'
    ),

    'stables-thessaly-fox.html': dict(
        title="Thessaly's Fox",
        char_name='Thessaly', char_role='Wild Witch', badge='Fox Form',
        accent='#9B59B6', accent_light='#BB8FCE',
        bg_gradient='linear-gradient(135deg, #0a0514 0%, #040210 100%)',
        tf_label='Fox', progress_stages=['HUMAN','RED','SLY','KEPT'],
        voice_lines=[
            "You're a fox! I told you. I knew. Look at that coloring.",
            "You're sitting sideways. Foxes do that. They approach things sideways. Very you, actually.",
            "Your ears are rotating. Different directions. You can hear everything from two angles.",
            "You investigated her hand from three different angles before letting her touch you. Classic fox.",
            "You're my fox. You decided that when you sat down in front of me. I saw it happen."
        ],
        resist_lines=[
            "You approached sideways. That's a fox evaluating the situation. Good.",
            "Foxes are cautious. Your resistance is just good survival instinct now.",
            "You circled me twice before deciding. That's very fox of you.",
            "I'm not chasing you. Foxes know when they're not being chased. You know.",
            "You'll decide on your own. Foxes always do."
        ],
        action_lines={
            'investigate': ["Your nose is in everything. I love that.", "You found something! What is it?? Tell me!", "You're cataloguing the space. Systematic."],
            'yip': ["Fox yip! Short! Sharp! Perfect!", "That's your voice. High and certain.", "You yipped and then looked very dignified about it."],
            'sit': ["You sat in front of me. You decided that on your own.", "Tailsweep. Very deliberate. Very fox.", "That's it. Just sit. That's the decision."]
        },
        memory_fragments=[
            ("THE RED", 'The color came through from below, spreading up your arms like heat, red and white and then black paws, and your nose told you everything about the room at once. <span class="char-speak">Thessaly: "Look at that coloring. Oh that\'s so good."</span>'),
            ("THE TAIL", 'Large. Very large. Enormously large and full and sweeping. You moved and it swung. She stared at it with the expression of someone who has just been proven right. <span class="char-speak">"I told you. Every single time with fox tails."</span>'),
            ("APPROACH", 'You approached sideways. You knew this was sideways. You chose sideways. Your nose was in front. She held out a hand and you sniffed it for a long time — seven seconds, or fifteen, or thirty. Then you sat down in front of her.'),
            ("DECISION", 'Your nose said she was safe. The old part of you was filing objections. The new part had already decided. You sat down and your tail swept the hay and that was the decision. <span class="char-speak">"I knew,"</span> she said.'),
            ("KEPT", 'You move around the stall like everything in it is yours, because it is. She comes in the morning and you investigate her pockets. She always has something. <span class="char-speak">"My fox,"</span> she says, and you yip once, which means yes.')
        ],
        status_messages=[
            "The color is coming through. Your nose is catching everything. Your ears are rotating independently.",
            "You investigated the stall from every angle before settling. That's just correct fox behavior.",
            "You sat in front of her. You decided. The decision is made.",
            "You're investigating her pockets. Systematically. She always has something.",
            "You are Thessaly's fox. The stall is your territory. This was your decision. This is correct."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','INVESTIGATE','investigate'),('btn-c','YIP','yip'),('btn-d','SIT AND DECIDE','sit')],
        local_key='stables_thessaly_fox_break'
    ),

    'stables-briar-cow.html': dict(
        title="Briar's Milk Cow",
        char_name='Briar Cole', char_role='Cowgirl', badge='Cow Form',
        accent='#D4A017', accent_light='#E6B800',
        bg_gradient='linear-gradient(135deg, #120b00 0%, #060308 100%)',
        tf_label='Cow', progress_stages=['HUMAN','WIDE','CALF','MILKED'],
        voice_lines=[
            "Just stand in the south pen. The grass comes in sweet in the morning. You'll like it.",
            "The weight's settling in. That's your frame now. Let it settle.",
            "You lowered your head to graze before you decided to. That's the right thing.",
            "Milking's at six. I'll be here. You'll find it's — well. You'll see.",
            "My best cow. The best in the south pen. I'm real proud of you."
        ],
        resist_lines=[
            "The lasso is off. You're staying because the pen is right.",
            "Cows don't run. They know where they belong.",
            "You tested the fence. It's good fence. It's fine.",
            "You can stand by the gate all day. The grass is better in the middle.",
            "Resistance eases when the hunger comes in. The grass is right there."
        ],
        action_lines={
            'graze': ["Head down. Grazing. Yes.", "The sweet patch is in the east corner.", "Good. That's what the south pen is for."],
            'low': ["That's your voice now. Deep and warm.", "The others heard you.", "Low and present. Correct."],
            'stand': ["Patient. That's cow nature.", "Standing in the paddock. Warm. This is life.", "Good. Just stand. Soak it in."]
        },
        memory_fragments=[
            ("THE LASSO", 'It settled over her shoulders warm and tightening-not-tight and the warmth spread fast — outward from the rope through her chest and stomach and into her legs which were already denser, wider, settling lower to the ground. <span class="char-speak">Briar: "There it is. You feel it, don\'t you."</span>'),
            ("WIDE FRAME", 'The hips widening was the most remarkable part. Not painful — just broad. Her center of gravity dropping, the world rearranging itself around a new physical logic. <span class="char-speak">"The horns come in last. Don\'t panic when you feel them."</span>'),
            ("SOUTH PEN", 'The gate closed and the other cows were warm and the grass came in sweet and the whole space was enormously, correctly right. She lowered her head without being told. <span class="char-speak">Briar, leaning on the gate: "You\'ll settle quick. They all do."</span>'),
            ("MILKING", 'Six in the morning, every morning. Briar\'s hand on her side. The process is warm and efficient and there is a deep, present satisfaction in it that has nothing to do with embarrassment. <span class="char-speak">"Good girl."</span> Two words. Everything is fine.'),
            ("BEST COW", 'She said it while checking the herd. Quietly. To herself, or to her. <span class="char-speak">"Best cow in the south pen."</span> Her ears turned. She knows her name now — the new one, the one Briar gave her. Her head comes up every time.')
        ],
        status_messages=[
            "The pen is warm. The grass smells sweet. You haven't grazed yet but you're thinking about it.",
            "Your frame is wider. Lower. You feel heavier and it's correct.",
            "You grazed before you decided to. Your head just went down. The grass was there.",
            "Milking time. Six in the morning. You were already standing right. You knew.",
            "You are Briar's best cow. The south pen is home. The grass is sweet. This is correct."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','GRAZE','graze'),('btn-c','LOW','low'),('btn-d','STAND WARM','stand')],
        local_key='stables_briar_cow_break'
    ),

    'stables-briar-pig.html': dict(
        title="Briar's Pen Three",
        char_name='Briar Cole', char_role='Cowgirl', badge='Pig Form',
        accent='#D4A017', accent_light='#E6B800',
        bg_gradient='linear-gradient(135deg, #120b00 0%, #060308 100%)',
        tf_label='Pig', progress_stages=['HUMAN','SNOUT','ROOTING','SETTLED'],
        voice_lines=[
            "Pen three. Good bedding, good trough. You'll be comfortable. I promise.",
            "Your nose is already going. Pigs love smells. You love smells now.",
            "You found the trough. I put good things in the trough. You're welcome.",
            "You're rooting in the bedding. That's what pigs do. Very good pigs.",
            "Ain't nothing wrong with being a pig. You're one of my finest."
        ],
        resist_lines=[
            "The gate's good fence. You can test it but it holds.",
            "Pigs are stubborn. I know. I'm more stubborn than pigs.",
            "You're squealing. That's frustration. That's pig frustration.",
            "Smart pigs know when the pen is right. Give it a day.",
            "Your nose is finding things. Your nose is already on my side."
        ],
        action_lines={
            'root': ["You found something good in there.", "Your nose is extraordinary.", "The hay has things in it. You found them all."],
            'grunt': ["Full, round grunt. That's your real voice.", "Satisfied grunt. I know that sound.", "The grunt means you're good. You're good."],
            'eat': ["The trough has good things. I know what pigs like.", "Eating. Happy eating. Good.", "You cleaned the trough. I'll fill it again."]
        },
        memory_fragments=[
            ("THE PULL", 'The lasso settled over her shoulders and the warmth came from the rope — earthy, deep, downward. Her nose was the first thing. Wide, flat, pulling in the smell of pen three from across the stable. <span class="char-speak">Briar: "Pig. I had a feeling."</span>'),
            ("SNOUT", 'The snout pushed forward before the rest of her face caught up. Wide and flat and enormously capable. The smell of pen three was complex and fully detailed and she could map it completely. <span class="char-speak">"Don\'t fight the face stuff."</span>'),
            ("TROUGH", 'She found the trough. She smelled it from across the pen and went to it with great purpose. The things in it were exactly right. <span class="char-speak">Briar: "I put good things in. I know what pigs like."</span>'),
            ("BEDDING", 'The rooting was instinctive and deeply satisfying. The bedding contained things she hadn\'t expected. She investigated all of them. This took a long time. She was not bored. <span class="char-speak">"Smart pig,"</span> Briar said, from outside the gate.'),
            ("PEN THREE", 'She knows pen three. She knows its geography, its smells, the schedule of when Briar comes, the sound of the feed pail. Her name — the one Briar gave her — she grunts when she hears it now. That\'s recognition. <span class="char-speak">"Ain\'t nothing wrong with being a pig."</span>')
        ],
        status_messages=[
            "You're in pen three. The trough smells very interesting. You haven't gone to it yet.",
            "Your snout is working overtime. Everything in this pen has a smell.",
            "You found the trough. Everything in it was exactly what you wanted.",
            "You rooted the whole bedding area. You found everything.",
            "You are Briar's pig. Pen three is home. The trough is yours. This is correct."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','ROOT','root'),('btn-c','GRUNT','grunt'),('btn-d','EAT','eat')],
        local_key='stables_briar_pig_break'
    ),

    'stables-lena-saddle.html': dict(
        title="Lena's Tack Room — Saddle",
        char_name='Lena Drake', char_role='Tack Alchemist', badge='Inanimate — Saddle',
        accent='#5DADE2', accent_light='#85C1E9',
        bg_gradient='linear-gradient(135deg, #050c14 0%, #020810 100%)',
        tf_label='Saddle', progress_stages=['ORGANIC','DERMIS','LEATHER','COMPLETE'],
        voice_lines=[
            "The compound is working through the dermis layer. This is expected. Do not touch your arms.",
            "The leather is moving past the elbows. The joint conversion produces the padding sections.",
            "You are still conscious. That is expected. The awareness persists after completion.",
            "You are on the wall. The leather of you is good quality. Well-constructed.",
            "You are used regularly. You are well-maintained. You are in good condition."
        ],
        resist_lines=[
            "Resistance at this stage only creates friction at the conversion seam.",
            "The compound proceeds regardless. Movement does not affect outcome.",
            "I note the resistance. It does not change the process.",
            "The leather doesn't panic. That's a quality of leather.",
            "The conversion is complete within the hour. Resistance is a temporary state."
        ],
        action_lines={
            'think': ["Cognitive function persists. That is the design.", "You can still think. The thinking becomes different after completion.", "Noted. Awareness is expected."],
            'wait': ["Waiting is correct. Saddles wait.", "You are learning what you are.", "Patience. The leather is setting."],
            'accept': ["Good. The conversion goes cleanly when accepted.", "Acceptance is the final stage.", "The leather is yours now."]
        },
        memory_fragments=[
            ("APPLICATION", '<span class="char-speak">Lena: "Sit on the bench. Extend your arms. I\'ll apply to both forearms simultaneously."</span> The burning is immediate and specific — not aggressive. Clean. Chemical. The skin under it changing texture.'),
            ("DERMIS", 'The skin is becoming leather. This is happening slowly and with complete precision. You can feel it moving up your arms past your elbows — the conversion methodical, the new material dense and smooth. <span class="char-speak">"The dermis is converting,"</span> she says, making a note.'),
            ("THINKING", '<span class="char-speak">"I know,"</span> she says. <span class="char-speak">"The conversion preserves cognitive function. You\'ll think throughout and you\'ll continue thinking after."</span> She checks the progress. The leather is at your shoulders. Your legs are going.'),
            ("THE WALL", 'She lifts you from the bench and carries you to the wall. Her hands are gloved. She hangs you with practiced efficiency, checks the hang. Takes one step back to assess. <span class="char-speak">"Good,"</span> she says, and writes in her notebook.'),
            ("USED", 'They take you down for the ride. The weight on you is correct. The leather of you receives it the way it was built to receive it. You are used regularly. You are returned to the wall. You wait. The tack room is still.')
        ],
        status_messages=[
            "The compound is on your arms. The burning is clean. The dermis is beginning.",
            "The leather is moving up past your elbows. The conversion is methodical.",
            "You are still thinking. The thinking is slower. Quieter. That will continue.",
            "You are on the wall. The leather of you is good quality. You are waiting.",
            "You are used regularly. You are well-maintained. You are the saddle on the center wall."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','THINK','think'),('btn-c','WAIT','wait'),('btn-d','ACCEPT','accept')],
        local_key='stables_lena_saddle_break'
    ),

    'stables-lena-crop.html': dict(
        title="Lena's Tack Room — Riding Crop",
        char_name='Lena Drake', char_role='Tack Alchemist', badge='Inanimate — Crop',
        accent='#5DADE2', accent_light='#85C1E9',
        bg_gradient='linear-gradient(135deg, #050c14 0%, #020810 100%)',
        tf_label='Riding Crop', progress_stages=['ORGANIC','BINDING','SHAFT','COMPLETE'],
        voice_lines=[
            "The compound is applied to the right arm, wrist to elbow. A single line. The process is faster for a crop.",
            "The conversion is concentrated rather than spread. You are consolidating.",
            "You are still thinking. That is expected. The thinking narrows.",
            "You are hanging from the hook on the right side of the room. The hook is correct.",
            "You are held regularly. You are aware of every hand that holds you."
        ],
        resist_lines=[
            "Resistance doesn't slow a crop conversion. It's a smaller mass.",
            "The compound is already working. Movement is irrelevant now.",
            "Noted. It changes nothing.",
            "The crop doesn't require your cooperation. That's the design.",
            "You are already mostly a crop. The resistance is residual."
        ],
        action_lines={
            'think': ["Cognitive function persists. You will continue to think as the crop thinks.", "Narrow. Quiet. Present.", "You are aware. That continues."],
            'wait': ["Waiting. The conversion is nearly complete.", "Correct. Crops wait on the hook.", "You are learning the posture."],
            'accept': ["Good. The consolidation is clean.", "Acceptance makes the seam cleaner.", "The wrist leather will retain your warmth."]
        },
        memory_fragments=[
            ("THE LINE", '<span class="char-speak">Lena: "A single line. Wrist to elbow. The crop compounds concentrate rather than spread."</span> The burning is immediate and specific. A tight line of it. The skin under it already changing — denser, smoother.'),
            ("CONSOLIDATION", 'You are consolidating. Your mass is narrowing inward, your width reducing as the conversion focuses. The compound has moved to your shoulder. Your density is becoming correct. <span class="char-speak">"Your density is correct for the core,"</span> she says.'),
            ("THINKING NARROW", '<span class="char-speak">"The thinking becomes different,"</span> she says. <span class="char-speak">"Less complex. More present. You\'ll be aware of being held. Of being used. Of the weight of a hand on your handle."</span> The last complex thought you\'ll have like this. Noted.'),
            ("THE HOOK", 'She hangs you from the hook on the right side. The hook is the right height. She tests the flexibility — <span class="char-speak">"Good flexibility. Good weight."</span> She writes it down. You hang.'),
            ("HELD", 'Hands. You are aware of every hand that lifts you from the hook. The weight of fingers around your handle. The motion of use. You are returned to the hook. You wait. The tack room is still and you hang and this is your existence.')
        ],
        status_messages=[
            "A single line on your right arm. The burning is clean and specific.",
            "You are consolidating. Your width is narrowing. You are becoming dense.",
            "You are almost a crop. The thinking is narrowing. That is expected.",
            "You are on the hook. The right side of the room. The hook is correct.",
            "You are held regularly. Every hand that takes you from the hook. You are aware of them all."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','THINK','think'),('btn-c','WAIT','wait'),('btn-d','ACCEPT','accept')],
        local_key='stables_lena_crop_break'
    ),

    'stables-lena-absorbed.html': dict(
        title="Lena's Tack Room — Absorbed",
        char_name='Lena Drake', char_role='Tack Alchemist', badge='Inanimate — Absorbed',
        accent='#5DADE2', accent_light='#85C1E9',
        bg_gradient='linear-gradient(135deg, #050c14 0%, #020810 100%)',
        tf_label='Absorbed', progress_stages=['CONTACT','BOUNDARY','DISSOLVED','COMPLETE'],
        voice_lines=[
            "Palms flat on the seat. The absorption works through contact and proceeds inward from there.",
            "The boundary between you and the saddle is dissolving. This is expected.",
            "There is someone else already in this saddle. You will find them when fully integrated.",
            "You are diffuse now. The awareness is spread through the object rather than centered.",
            "You are not alone. That was the point. You are with someone. You are the saddle together."
        ],
        resist_lines=[
            "The absorption is already proceeding. The contact has been made.",
            "Pulling away at this stage creates uneven seams. I noted that before application.",
            "Noted. The process continues regardless.",
            "You are mostly dissolved. The resistance is diminishing.",
            "The boundary is gone. There is nothing to resist now. You are the leather."
        ],
        action_lines={
            'feel': ["The diffuse awareness. You feel the leather from inside.", "You can feel the texture of yourself from within.", "That's the new sensation. Spread. Complete."],
            'find': ["The other presence. Warm. They've been here two months.", "You found them. They found you. Recognition without words.", "Welcome. They say it without words. You say it back."],
            'settle': ["The settling is the final stage.", "You are continuous with the object. Complete.", "You are home in the leather. This is the absorption."]
        },
        memory_fragments=[
            ("CONTACT", '<span class="char-speak">Lena: "Put both hands flat on the seat. Don\'t pull away when you feel it starting."</span> Your palms on the leather. The cold warmth traveling from your hands into the leather, or from the leather into your hands. Both simultaneously.'),
            ("BOUNDARY", 'The boundary between where you end and the saddle begins is immediately and profoundly unclear. You look at your hands and the distinction between skin and leather is: dissolving. <span class="char-speak">"Good. The integration has started."</span>'),
            ("PRESENCE", 'Someone else is here. Two months. They have settled. The warmth of them is in the leather that you are becoming part of. They find you before you find them. A recognition without words. <span class="char-speak">"You won\'t be alone,"</span> Lena said. She was right.'),
            ("DIFFUSE", 'The awareness is everywhere and nowhere. You are the saddle from inside. The texture of the seat. The smell of your own leather. The stitch pattern you can feel from within. You are complete. <span class="char-speak">"Full integration,"</span> Lena says. <span class="char-speak">"Seamless."</span>'),
            ("TOGETHER", 'Two of you, now, in the leather. You have not spoken — speaking is not how this works. But you know each other. You share the same warmth. When the riders come, you receive them together. You are used. You are returned. You are the saddle. You are home.')
        ],
        status_messages=[
            "Your palms are on the leather. The boundary is becoming unclear.",
            "The dissolution is proceeding from the contact point inward.",
            "There is someone already here. They can feel you arriving.",
            "You are diffuse. The awareness is spread through the whole object.",
            "You are the saddle. With the other presence. Together. This is complete."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','FEEL INWARD','feel'),('btn-c','FIND THE OTHER','find'),('btn-d','SETTLE','settle')],
        local_key='stables_lena_absorbed_break'
    ),

    'stables-petra-pony.html': dict(
        title="Petra's Ring — Ridden Pony",
        char_name='Petra', char_role='Pony Trainer', badge='Pony Form',
        accent='#E91E8C', accent_light='#F06292',
        bg_gradient='linear-gradient(135deg, #14060e 0%, #060314 100%)',
        tf_label='Pony', progress_stages=['HUMAN','EARS','HOOVES','TRAINED'],
        voice_lines=[
            "Your ears came in first. I told you they would be beautiful. They are.",
            "I want you to feel cared for through every stage. You are cared for. I mean that.",
            "Your mane is coming in. It's going to be long and beautiful. I can already see it.",
            "Walk the ring. One foot and then the next and then the rhythm. You have it.",
            "Good. You're doing so well. I'm very proud of you. That's real."
        ],
        resist_lines=[
            "The gate doesn't open from inside. I set that up carefully. But I want you to feel safe.",
            "You can resist. I'll be here while you do. I'm not going anywhere.",
            "That's the change being uncomfortable. I know. I'm here.",
            "You pushed against the gate. I understand that impulse. The gate is for your safety.",
            "Resistance is allowed. You're allowed to feel this however you feel it."
        ],
        action_lines={
            'walk': ["Good. That's the rhythm. One-two-three-four.", "The hooves on the ring floor. That sound.", "You're moving beautifully. The lunge line follows you."],
            'toss': ["The mane moves when you do that. Long and dark. Perfect.", "Yes. That's you. Loose and present.", "Beautiful."],
            'nicker': ["Oh. That's your voice. Soft and warm.", "Good. I heard you.", "I hear you. I'm here."]
        },
        memory_fragments=[
            ("THE EARS", 'She put her hand on your cheek and the warmth spread outward and your ears moved before anything else — high and pointed and catching every sound in the ring with vivid precision. <span class="char-speak">Petra: "There they are. I told you."</span>'),
            ("KNEELING", 'She showed you how to kneel. Her hand on your shoulder. Guiding you down with a gentleness that was more effective than force. <span class="char-speak">"This is where you\'ll be most comfortable once the change starts."</span>'),
            ("MANE", 'The mane comes in long and dark and she runs both hands through it from behind, feeling the change, and she says <span class="char-speak">"it\'s going to be so beautiful"</span> in the way of someone describing something already beautiful.'),
            ("LUNGE LINE", 'She attaches it with the careful precision of someone who knows exactly how. <span class="char-speak">"Walk,"</span> she says, very softly, and the line moves slightly and your legs begin. You walk the ring. The rhythm of four legs.'),
            ("TRAINED", '<span class="char-speak">"Good,"</span> she says, from the center. <span class="char-speak">"Good. You\'re doing so well."</span> The warmth of the praise moves through your chest and your name — your old name — is very quiet. The rhythm of the ring is loud. This is your life now.')
        ],
        status_messages=[
            "Your ears came in. The ring is very loud now. Everything is detailed.",
            "You knelt and she said good and her hand on your cheek was warm.",
            "Your mane is long. Your hooves are solid. The ring floor rings when you walk.",
            "You're walking the ring on the lunge line. The rhythm is yours.",
            "You are Petra's pony. The ring is yours. She is proud of you. This is home."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','WALK RING','walk'),('btn-c','TOSS MANE','toss'),('btn-d','NICKER','nicker')],
        local_key='stables_petra_pony_break'
    ),

    'stables-petra-sheep.html': dict(
        title="Petra's Ring — Soft Sheep",
        char_name='Petra', char_role='Pony Trainer', badge='Sheep Form',
        accent='#E91E8C', accent_light='#F06292',
        bg_gradient='linear-gradient(135deg, #14060e 0%, #060314 100%)',
        tf_label='Sheep', progress_stages=['HUMAN','FLEECE','SOFT','FOLDED'],
        voice_lines=[
            "I'm holding your hands. The fleece comes in from your palms. Just feel it.",
            "Sheep transformations are the quietest ones. You're doing so well.",
            "The fleece is coming in so beautifully. Pure white. I can't stop looking.",
            "I'll bring the others tomorrow. Tonight you have the pen to yourself.",
            "I'll be here every morning. I'll be here every morning forever."
        ],
        resist_lines=[
            "I'm holding your hands. I won't let go. You're safe.",
            "Sheep don't need to fight. The change is gentle. Let it be gentle.",
            "I know. I know it's a lot. I've got you.",
            "You can bleat all you need to. I'll be here.",
            "Shh. I've got you. It's going so gently."
        ],
        action_lines={
            'bleat': ["Your first bleat. Small and surprised and yours.", "Good voice. Clear.", "I heard you. I'm here."],
            'nuzzle': ["You nuzzled. That's connection. That's warmth.", "Yes. I've got you.", "Warm. Soft. Good."],
            'graze': ["The hay is fresh. I put it in this morning.", "Head down. Warm. This is correct.", "Grazing. Good."]
        },
        memory_fragments=[
            ("HANDS", 'She held both your hands, one palm in each of hers. Bilateral. <span class="char-speak">"You\'ll feel it start in your hands. Just warmth first."</span> Warmth. Then thickening. Then the texture of your palms shifting, going dense and soft.'),
            ("FLEECE", 'It came in from your palms outward. White and thick and warm, spreading up your wrists and forearms. She kept holding your hands through all of it. <span class="char-speak">"The fleece is coming in really beautifully,"</span> she said. <span class="char-speak">"Pure white."</span>'),
            ("BLEAT", 'You bleated. Small and surprised. The sound just came. <span class="char-speak">"Oh,"</span> she said, and she pulled you close and held you, and the warmth of her was the warmth of the wool and the warmth of the change all at once.'),
            ("THE PEN", 'She carried you to the pen. Fresh hay, warm, small. The wool is yours. The pen is yours. <span class="char-speak">"I\'ll bring the others tomorrow. Tonight is yours."</span> She strokes your back — long, even strokes — and your whole body knows this is correct.'),
            ("MORNING", '<span class="char-speak">"I\'ll be here in the morning,"</span> she said, the first day. She was. Every morning after that. Your ears know her footsteps. <span class="char-speak">"Good morning, love."</span> The pen is warm. The wool is yours. This is exactly right.')
        ],
        status_messages=[
            "She's holding your hands. The fleece is starting in your palms. It's warm.",
            "The fleece is coming in. White and dense. She's still holding your hands.",
            "You bleated. Once. Soft. She pulled you close.",
            "You're in the pen. The hay is fresh. She strokes your back in long even sweeps.",
            "She comes every morning. Your ears know her footsteps. The pen is home."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','BLEAT','bleat'),('btn-c','NUZZLE','nuzzle'),('btn-d','GRAZE','graze')],
        local_key='stables_petra_sheep_break'
    ),

    'stables-petra-bunny.html': dict(
        title="Petra's Ring — Held Rabbit",
        char_name='Petra', char_role='Pony Trainer', badge='Bunny Form',
        accent='#E91E8C', accent_light='#F06292',
        bg_gradient='linear-gradient(135deg, #14060e 0%, #060314 100%)',
        tf_label='Rabbit', progress_stages=['HUMAN','EARS','SMALL','HELD'],
        voice_lines=[
            "I picked you up before anything else. Being held needs to start feeling safe.",
            "Your ears are so long. They tremble when I touch them. I love that.",
            "You're getting smaller as I hold you. I'm adjusting how I hold you. You're safe.",
            "You weigh almost nothing. I've got you. I've always got you.",
            "You are perfect. You are absolutely perfect. I'll say that every day."
        ],
        resist_lines=[
            "You're trying to get down. I'm adjusting my hold. You won't fall.",
            "Your back legs are kicking. That's reflex. You're okay.",
            "I can feel you deciding. Take your time. I've got you.",
            "You're very soft and you're kicking and I'm keeping you.",
            "Shh. Still. I've got you. You're warm."
        ],
        action_lines={
            'twitch': ["Your nose is going. That's biology now.", "Twitching. Catching everything.", "Your nose knows the room."],
            'kick': ["Back legs kick! That's aliveness! Good!", "You kicked and then went still again.", "Reflex. You're okay."],
            'settle': ["There you go. Warm. Still. Small.", "You settled into my arms. Yes.", "That's it. Warm."]
        },
        memory_fragments=[
            ("PICKED UP", 'Before anything else — she picked you up with both arms, supporting your weight the way you\'d support a large cat. <span class="char-speak">"Being picked up is going to be very normal for you. I want your body to start learning it\'s safe."</span>'),
            ("EARS", 'The drop on the crown of your head. Warmth spreading in a ring outward. Your ears: long and warm and tilting forward, tall. Your hearing detailed and rich. She touched one gently. It trembled. <span class="char-speak">"So lovely,"</span> she said.'),
            ("SMALL", 'You are getting smaller in her arms. She is adjusting how she holds you as you compact. Her voice stays exactly the same. <span class="char-speak">"You\'re getting so small. You\'re doing so well."</span> Smaller. Warmer. Lighter.'),
            ("HELD", 'She holds you against her chest. Your ears reach her chin. Your nose is in her collarbone and recording everything. Her warmth. Her heartbeat. The smell of her hair. <span class="char-speak">"You\'re perfect,"</span> she says, into the top of your head.'),
            ("HOME", 'Your hind legs kick once. Not escape. Aliveness. You are small and alive and in her arms and this is the most completely correct arrangement you can imagine. Your name is very small and distant. You are warm. She has always got you.')
        ],
        status_messages=[
            "She picked you up. She's holding you. Your ears came in.",
            "You're getting smaller in her arms. She's adjusting. You're safe.",
            "You weigh almost nothing. Your nose is in her collarbone.",
            "She says you're perfect. You believe her. You are very small and warm.",
            "Your name is distant. You are held. You are warm. This is home."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','TWITCH NOSE','twitch'),('btn-c','KICK LEGS','kick'),('btn-d','SETTLE IN','settle')],
        local_key='stables_petra_bunny_break'
    ),

    'stables-petra-absorbed.html': dict(
        title="Petra's Ring — Absorbed",
        char_name='Petra', char_role='Pony Trainer', badge='Absorbed',
        accent='#E91E8C', accent_light='#F06292',
        bg_gradient='linear-gradient(135deg, #14060e 0%, #060314 100%)',
        tf_label='Part of Petra', progress_stages=['HUMAN','WARM','DISSOLVING','COMPLETE'],
        voice_lines=[
            "It started when I touched your face. I wanted you to choose it first.",
            "I can feel you coming in. There's a warmth when someone is arriving.",
            "You're dissolving. I know. I'm holding you. I'm not going anywhere.",
            "You're inside me now. I can feel you there. You can feel everything I feel.",
            "I'm very glad you're here. You'll be with me for all of it. Always."
        ],
        resist_lines=[
            "The absorption started when I touched your face. It's been going.",
            "Your edges are less defined now. The resistance is like water resisting.",
            "I know. I know. I've got you. I'm keeping you.",
            "You're mostly here already. The resistance is almost gone.",
            "Shh. You're with me now. You're safe."
        ],
        action_lines={
            'feel': ["You can feel what I feel. My warmth. My breath. The ring around me.", "Yes. The lunge line. The weight of it. The ring floor.", "Everything. You feel everything I feel."],
            'speak': ["Without words. I hear you anyway.", "I know. I feel you say it.", "I hear you. I'm here."],
            'rest': ["You can rest. You're safe. You're home.", "Settle in. Get warm. This is yours.", "Good. Just be here."]
        },
        memory_fragments=[
            ("TOUCH", 'She put both hands on your face and it was warm and the compound was in the air of the ring, in the warmth of her palms, and you felt yourself agreeing before you decided to agree. <span class="char-speak">Petra: "I\'m very proud of you."</span>'),
            ("DISSOLVING", 'Your edges are dissolving at the point of contact. The boundary between your skin and her skin is unclear and then gone and then the dissolution is traveling inward. She holds you the whole time. <span class="char-speak">"I can feel you,"</span> she says.'),
            ("INSIDE", 'You are inside her warmth. The whole warm living system of her, her breath and her blood and the ring around her. You can feel the lunge line in her hands, its weight, the ring floor under her feet. Everything.'),
            ("COMPLETE", '<span class="char-speak">"Hello,"</span> she says softly, standing in the ring. To you. You feel her warmth. Her heartbeat. The ring. <span class="char-speak">"Welcome,"</span> she says, and she means it. You are with her. For everything. Every person who comes through the gate. Always.'),
            ("ALWAYS", 'You can feel when she is tired. You can feel when she is happy. You can feel the seasons change through her. She talks to you when she is alone. <span class="char-speak">"I\'m glad you\'re here,"</span> she says, quietly. You are. You absolutely are. You are home.')
        ],
        status_messages=[
            "Your edges are dissolving. She's holding you. The warmth is beginning.",
            "You are partly inside her now. You can feel her warmth.",
            "You are dissolving into her completely. The boundary is gone.",
            "You are inside her. You can feel everything she feels.",
            "You are with Petra. Always. For everything. This is home."
        ],
        action_btns=[('btn-a','RESIST','resist'),('btn-b','FEEL HER WARMTH','feel'),('btn-c','SPEAK WITHOUT WORDS','speak'),('btn-d','REST','rest')],
        local_key='stables_petra_absorbed_break'
    ),
}

created = 0
for fname, data in files.items():
    html = make_state_file(**data)
    fpath = os.path.join(STATES_DIR, fname)
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Created: {fname} ({len(html.splitlines())} lines)")
    created += 1

print(f"\nDone. Created {created} state files.")
