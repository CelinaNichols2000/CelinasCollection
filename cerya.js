(() => {
    'use strict';
    const KEY = 'celina.cerya.v2';
    const HOUR = 60 * 60 * 1000;
    const CURSE_MIN = 5 * HOUR;
    const CURSE_MAX = 7 * 24 * HOUR;
    // Cloudflare Worker URL that serves the shared, site-wide vote counts (see cerya-votes-worker/).
    const VOTES_API = 'https://cerya-votes.celinavotes.workers.dev/votes';
    const PORTRAIT = 'https://images.celinascollection.com/sucking_c/cf31d5d7e1baa776754093b20b64db76.jpeg';
    const $ = id => document.getElementById(id);
    // Each scene accepts an optional image URL (or gallery[] to auto-cycle); omission keeps the last portrait.
    const scenes = [
        { title: 'Looking for Celina?', caption: 'Sucking her Mistress\'s cock', image: 'https://images.celinascollection.com/sucking_c/cf31d5d7e1baa776754093b20b64db76.jpeg', lines: [
            ['Cerya', "Nghhh~ oh, looking for Celina?~ Mmmmm, sorry hun, she's a bit BUSY right now~ Elbow-deep in worshipping my cock with that pretty little mouth of hers, sucking me nice and slow while I decide how long to make her wait for it~"],
            ['Celina', 'MMMPPFFFF...GGRRRKKKk... gahhhhaaa~ mmff.... nnghh']] },
        { title: 'What a lovely dickwarmer.', caption: 'Railed into a puddle', gallery: ['https://images.celinascollection.com/getting_f_by_c/Untitled_video_-_Made_with_Clipchamp_2.gif', 'https://images.celinascollection.com/getting_f_by_c/image0.jpg'], lines: [
            ['Cerya', "Mmm~ look at her go, bouncing on my cock like it's her favorite chair. Every single time she thinks she's finally getting used to the size, I go just a little DEEPER, just to watch that composure crack all over again~"],
            ['Celina', 'A-AHNNN~ s-so deep... nghhh, nghhhaaa~! p-please, right there... nnngh!'],
            ['Cerya', "Beg all you want, dickwarmer. That mouth is for moaning now, not negotiating. Such a good, lovely little hole, aren't you, Celina~? Absolutely RUINED, and we're not even close to done~"]] },
        { title: 'One snap. Aaaand flop.', caption: 'A very quiet cockring', image: 'https://images.celinascollection.com/inanimate/1755638153632928.jpg', lines: [
            ['Cerya', "Funny story, actually~ I once turned her into a cockring, you know. One little snap of my fingers... aaaand FLOP. You could just fish her right out of her own panties, nothing left but warm, quietly vibrating rubber wrapped snug around my base~"],
            ['Cerya', "Honestly? I still think about keeping her that way. PERMANENTLY. No opinions, no backtalk, just a soft little ring humming happily every time I get hard. Her bratty mouth was finally, blessedly, silent~"]] },
        { title: 'Wag that ass, pet.', caption: 'Magic-less and leashed', image: 'https://images.celinascollection.com/celina/Celina%20collored.jpeg', lines: [
            ['Cerya', "Such a lovely pet too~ *Watch that ass wag helplessly every time my cock gets hard, like it's got a mind entirely of its own.* It's practically INVOLUNTARY at this point, isn't it, Celina? Like your body just knows who it belongs to~"],
            ['Cerya', "And this pretty little collar? It zeroes her magic right out. Completely. Even the weakest, most talentless nobody on the street could walk her around on this leash now, and she couldn't do a single thing about it~"]] },
        { title: 'Simple to control now~', caption: 'Ahegao and empty', gallery: ['https://images.celinascollection.com/sucking_c/sample_f227756c423c5ffd150503b719f5f0e1.jpg', 'https://images.celinascollection.com/celina/R.jpg'], lines: [
            ['Cerya', "Look at that face~ Cross-eyed, drooling, absolutely GONE. Mind's completely fucked, isn't it? So simple to control now ..one good, deep stroke and every last thought just melts right out of her~"],
            ['Celina', '...nnnghh~ y-yes Mistress~ *eyes roll back, tongue lolling, thinking about absolutely nothing at all*']] },
        { title: 'Your move, darling.', caption: 'Just between us', gallery: ['https://images.celinascollection.com/panties/gifcandy-panties-55.gif', 'https://images.celinascollection.com/panties/thighs_crush_with_kalia__by_cliptf_dlqoz6f-pre.jpg'], lines: [
            ['Celina', "Hey.. come here, quick, before she notices. Listen close, this is just between US, okay~? W-when I finally get the chance... nghhh, I am going to zap that arrogant bitch into some skimpy little thong for GOOD~"],
            ['Celina', "Snuggled up tight right down my snatch, forever, where she can command my folds and my asshole gets to smoocher her face on repeat~ Riding my asscrack, drenched, DROWNING under my pussy, unable to do a single thing about it~"],
            ['Celina', "So? Are you going to help me finally get my revenge, or are you going to go run and tattle on me like the little snitch you clearly want to be~?"]], choice: true }
    ];
    const endings = {
        celina: [
            { title: 'Four days later...', caption: 'Cat got your tongue?', image: 'https://images.celinascollection.com/panties/celina%20panty%20spell.jpg', lines: [
                ['Celina', 'Mmm~ thank you SO much for keeping my little secret. Look at her now! Four days of being nothing but silky, soaked fabric, and she still hasn\'t figured out how to change back~'],
                ['Celina', "Aww, Cerya, cat got your tongue? Or should I say... thong got your mouth~? Go on, say something clever now. Oh right, you CAN'T. Poor thing~"]] },
            { title: 'Whoopsie~', caption: 'Your perspective, changing', image: 'https://images.celinascollection.com/website/videoplayback_Trim-ezgif.com-video-to-gif-converter.gif', lines: [
                ['Celina', '*A sudden tickle blooms under your skin.. then a flash of green light washes clean through you, warm and tingling.*'],
                ['Celina', "Oh, whoopsie~ I really can't go without a fitting top after all, now can I? A matching set is only proper~"],
                ['Celina', 'Hold very still for me, sweetheart, you\'re about to MATCH~ Just relax, this only tickles for a second~']] },
            { title: 'A permanent addition.', caption: 'Stretched over her tits', image: 'https://images.celinascollection.com/bra/sample_693175a6ac765f5f7f312a1742f174fd.jpg', lines: [
                ['Celina', 'Mmm, stretch riiight over my tits~ There we go. PERFECT fit, like you were always meant to end up right here~'],
                ['Celina', "Feel my nipples poking right through you like that? That's just how lovely your time is going to be as a permanent addition to my wardrobe~ Cerya and I are going to have SO much fun with you both~"]] }
        ],
        cerya: [
            { title: 'Four days later...', caption: "Celina's true place", image: 'https://images.celinascollection.com/buttPlug/plugged2.gif', lines: [
                ['Cerya', 'Mmm, thank you ever so much for the warning~ Look what I did with our little tattletale, hm? Fitting, don\'t you think?'],
                ['Cerya', "She's finally found her TRUE place.. my asshole's newest, snuggest little accessory. She glows every time I clench, isn't that precious~"]] },
            { title: 'Time for a walk.', caption: 'Leashed and replaced', image: 'https://images.celinascollection.com/pet/Time_for_a_walk.gif', lines: [
                ['Cerya', 'Come, pet. Stare at that plug all you like ..it used to be Celina, you know~ She was such a mouthy little thing before I found a much better use for her~'],
                ['Cerya', "I do need a brand new cockwarmer to replace her though, don't I~? And good thing you volunteered so nicely, hm~ Heel."]] },
            { title: 'Good pet~', caption: 'Her favorite new toy', image: 'https://images.celinascollection.com/buttPlug/plugged2.gif', lines: [
                ['Cerya', "Wag that leash-walked ass for me. GOOD pet~ Now get back on your fours and put that mouth back to work on my cock... and don't go poking around in some butt plug's past, hm? *Curious little thing, aren't you~*"]] }
        ]
    };
    const BRA_IMAGES = [
        'https://images.celinascollection.com/bra/sample_693175a6ac765f5f7f312a1742f174fd.jpg',
        'https://images.celinascollection.com/bra/dll38zw-d46f199b-578f-4666-a76b-f32f8752dd8e.png',
        'https://images.celinascollection.com/bra/what_a_good_bra_you_make___inanimate_tf__by_cliptf_dfwyc6q-pre.jpg',
        'https://images.celinascollection.com/boobs/1586884851_9usludk78d.gif',
        'https://images.celinascollection.com/boobs/b23.gif',
        'https://images.celinascollection.com/boobs/SBPy5tQ.gif',
        'https://images.celinascollection.com/boobs/113236_mobile_gif_Trim-ezgif.com-video-to-gif-converter.gif'
    ];
    const PET_IMAGES = [
        'https://images.celinascollection.com/buttPlug/plugged2.gif',
        'https://images.celinascollection.com/pet/Time_for_a_walk.gif'
    ];
    const BRA_QUOTES = [
        'Mmm, snug right over her tits~ Every heartbeat, right through you.',
        'Her nipples poke through your fabric like they own the place. They do, now.',
        "Stretch, cling, hug~ that's the whole job description.",
        'She flexes and you feel every inch of it. Good bra~',
        "Don't worry, you'll get used to being squeezed like this. Forever, probably~"
    ];
    const PET_QUOTES = [
        'The plug glows softly with every step. That used to be Celina, you know~',
        'Good pet. Wag for her. She likes that.',
        'The leash is snug, but not unkind. Mostly.',
        "Stare all you like...Cerya's favorite new accessory isn't going anywhere~"
    ];
    const fresh = () => ({ vote: null, changedAt: 0, view: 'intro', step: 0, seen: {}, curse: null });
    const validVote = value => value === 'cerya' || value === 'celina';
    let persistent = true;
    const storageNotice = () => {
        $('storage-notice').hidden = false;
        $('storage-notice').textContent = 'Browser storage is unavailable. Progress, your vote, and the timer will last only while this page stays open.';
    };
    function read() {
        try {
            const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
            if (!raw || typeof raw !== 'object') return fresh();
            const state = fresh();
            state.vote = validVote(raw.vote) ? raw.vote : null;
            state.changedAt = Number.isFinite(raw.changedAt) && raw.changedAt > 0 ? raw.changedAt : 0;
            state.view = ['intro', 'ending', 'profile'].includes(raw.view) ? raw.view : 'intro';
            if (state.view === 'ending' && !state.vote) state.view = 'intro';
            const max = state.view === 'intro' ? scenes.length - 1 : 2;
            state.step = Number.isInteger(raw.step) ? Math.max(0, Math.min(max, raw.step)) : 0;
            state.seen = { cerya: raw.seen?.cerya === true, celina: raw.seen?.celina === true };
            if (raw.curse && validVote(raw.curse.side) && Number.isFinite(raw.curse.until) && raw.curse.until > Date.now()) {
                state.curse = { side: raw.curse.side, until: Math.min(raw.curse.until, Date.now() + CURSE_MAX), additions: Number.isInteger(raw.curse.additions) ? Math.max(0, raw.curse.additions) : 0 };
            }
            return state;
        } catch (error) {
            if (error instanceof SyntaxError) return fresh();
            persistent = false;
            storageNotice();
            return fresh();
        }
    }
    let state = read();
    function save() {
        if (!persistent) return;
        try { localStorage.setItem(KEY, JSON.stringify(state)); }
        catch { persistent = false; storageNotice(); }
    }
    function time(ms) {
        const seconds = Math.max(0, Math.ceil(ms / 1000));
        const days = Math.floor(seconds / 86400);
        const hh = String(Math.floor((seconds % 86400) / 3600)).padStart(2, '0');
        const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const ss = String(seconds % 60).padStart(2, '0');
        return days > 0 ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
    }
    // Wraps loud/emphatic ALL-CAPS words and *stage-direction asides* so they can be styled distinctly.
    function format(text) {
        const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const highlightWords = segment => segment.split(/(\s+)/).map(token => /[A-Z]{3,}/.test(token) ? `<mark class="hot-word">${esc(token)}</mark>` : esc(token)).join('');
        return text.split(/(\*[^*]+\*)/g).map(part => part.startsWith('*') && part.endsWith('*') && part.length > 1
            ? `<em class="action-text">${esc(part.slice(1, -1))}</em>`
            : highlightWords(part)).join('');
    }
    const ACTION_POPUPS = {
        squirm: [
            { img: 'https://images.celinascollection.com/boobs/1586884851_9usludk78d.gif', text: 'You squirm against her tits. She just laughs and hugs you tighter~' },
            { img: 'https://images.celinascollection.com/boobs/b23.gif', text: 'Wriggling gets you nowhere, fabric-brain. She just cinches you in closer~' },
            { img: 'https://images.celinascollection.com/bra/dll38zw-d46f199b-578f-4666-a76b-f32f8752dd8e.png', text: 'Every squirm just presses her nipple harder into your seam~' }
        ],
        moan: [
            { img: 'https://images.celinascollection.com/boobs/SBPy5tQ.gif', text: '*muffled moan* — the vibration goes straight through your fabric~' },
            { img: 'https://images.celinascollection.com/boobs/113236_mobile_gif_Trim-ezgif.com-video-to-gif-converter.gif', text: 'She feels you humming against her skin and grins wider~' },
            { img: 'https://images.celinascollection.com/bra/sample_693175a6ac765f5f7f312a1742f174fd.jpg', text: 'Moan all you want, bra. No one\'s coming to save you~' }
        ],
        worship: [
            { img: 'https://images.celinascollection.com/bra/what_a_good_bra_you_make___inanimate_tf__by_cliptf_dfwyc6q-pre.jpg', text: 'You nuzzle into her cleavage. "Good bra~" she coos.' },
            { img: 'https://images.celinascollection.com/boobs/b23.gif', text: 'Snug and devoted, hugging her curves like it\'s your whole purpose. It is, now~' },
            { img: 'https://images.celinascollection.com/boobs/1586884851_9usludk78d.gif', text: 'She pets your strap fondly. "See? Not so bad being mine."' }
        ],
        beg: [
            { img: 'https://images.celinascollection.com/bra/dll38zw-d46f199b-578f-4666-a76b-f32f8752dd8e.png', text: 'Begging just makes her hug you tighter. "Pathetic bra~"' },
            { img: 'https://images.celinascollection.com/boobs/SBPy5tQ.gif', text: '"Aww, does the bra want out? Too bad~" she teases, stretching you further.' },
            { img: 'https://images.celinascollection.com/boobs/113236_mobile_gif_Trim-ezgif.com-video-to-gif-converter.gif', text: 'Your muffled pleading just makes her bounce a little, on purpose~' }
        ]
    };
    function showActionPopup(kind, titleText) {
        const set = ACTION_POPUPS[kind];
        const pick = set[Math.floor(Math.random() * set.length)];
        $('popup-title').textContent = titleText;
        $('popup-image').style.backgroundImage = `url(${pick.img})`;
        $('popup-text').textContent = pick.text;
        $('action-popup').hidden = false;
    }
    // Site-wide counts fetched from the Worker; null until the first successful fetch, then it wins over local-only numbers.
    let globalCounts = null;
    function renderCounts() {
        if (globalCounts) {
            $('count-cerya').textContent = String(globalCounts.cerya ?? 0);
            $('count-celina').textContent = String(globalCounts.celina ?? 0);
        } else {
            $('count-cerya').textContent = state.vote === 'cerya' ? '1' : '0';
            $('count-celina').textContent = state.vote === 'celina' ? '1' : '0';
        }
    }
    async function refreshGlobalCounts() {
        try {
            const res = await fetch(VOTES_API, { method: 'GET' });
            if (!res.ok) throw new Error('bad response');
            globalCounts = await res.json();
            renderCounts();
        } catch { /* API unreachable; keep showing local-only counts */ }
    }
    async function submitVote(vote, previousVote) {
        try {
            const res = await fetch(VOTES_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vote, previousVote })
            });
            if (!res.ok) throw new Error('bad response');
            globalCounts = await res.json();
            renderCounts();
        } catch { /* API unreachable; local vote still recorded for this visitor */ }
    }
    function updateStatus() {
        const cooldown = state.vote ? Math.max(0, state.changedAt + HOUR - Date.now()) : 0;
        document.querySelectorAll('[data-vote]').forEach(button => {
            const selected = state.vote === button.dataset.vote;
            button.setAttribute('aria-pressed', String(selected));
            button.disabled = selected || cooldown > 0;
        });
        renderCounts();
        const outcome = $('bio-outcome');
        if (state.vote && state.seen[state.vote]) {
            outcome.hidden = false;
            outcome.textContent = state.vote === 'celina'
                ? "Psst~ Cerya's still right down there, snuggled up tight against my pussy, placing needy little kisses against my folds with every single step I take. She's never been a more devoted thong~ I might just keep her that way forever."
                : "Cerya just smirked at me and said, \"Don't go poking around in some butt plug's past, snitch~ Get back on your fours and put that mouth to better use on my cock.\" ...So yeah. Guess who's back on her knees again~";
        } else {
            outcome.hidden = true;
        }
        if (state.curse && state.curse.until <= Date.now()) {
            state.curse = null;
            save();
            $('curse-feedback').textContent = 'The last spark fades. You are free of the spell.';
        }
        $('curse').hidden = !state.curse;
        document.body.classList.toggle('trap-lock', Boolean(state.curse));
        if (state.curse) {
            const isBra = state.curse.side === 'celina';
            $('curse').classList.toggle('bra-trap', isBra);
            $('curse').classList.toggle('pet-trap', !isBra);
            $('curse-eyebrow').textContent = isBra ? 'PERMANENT ADDITION' : 'CERYA\'S NEW PET';
            $('curse-title').textContent = isBra ? 'Trapped as Her Bra' : 'Collared & Leashed';
            $('curse-copy').textContent = isBra
                ? 'Stretched snug over Celina\'s tits, every breath and every step pressing right through you. Cerya, wherever she is, is suspiciously quiet.'
                : 'Cerya\'s leash rests easy in her hand. Somewhere behind you, a muffled Celina is still trying to plot something.';
            $('countdown').textContent = time(state.curse.until - Date.now());
            const quotes = isBra ? BRA_QUOTES : PET_QUOTES;
            const images = isBra ? BRA_IMAGES : PET_IMAGES;
            const idx = Math.floor(Date.now() / 4000) % images.length;
            $('curse-image').src = images[idx];
            $('curse-image').alt = isBra ? 'Bra transformation gallery' : 'Cerya walking her new pet';
            if (!$('curse-feedback').dataset.hold) $('curse-feedback').textContent = quotes[idx % quotes.length];
            $('curse-actions-bra').hidden = !isBra;
            $('curse-actions-simple').hidden = isBra;
        }
    }
    let galleryTimer = null;
    function render(focus = false) {
        const profile = state.view === 'profile';
        $('page-intro').hidden = profile;
        $('encounter').hidden = profile;
        $('profile').hidden = !profile;
        $('profile-link').hidden = profile;
        clearInterval(galleryTimer);
        if (!profile) {
            const sequence = state.view === 'ending' ? endings[state.vote] : scenes;
            const scene = sequence[state.step];
            $('scene-title').textContent = scene.title;
            const setImage = src => { $('scene-image').src = src || PORTRAIT; $('scene-image').alt = scene.caption; };
            if (scene.gallery) {
                let i = 0;
                setImage(scene.gallery[0]);
                galleryTimer = setInterval(() => { i = (i + 1) % scene.gallery.length; setImage(scene.gallery[i]); }, 2500);
            } else setImage(scene.image);
            $('scene-number').textContent = `${state.step + 1} / ${sequence.length}`;
            $('scene-progress').max = sequence.length;
            $('scene-progress').value = state.step + 1;
            $('dialogue').replaceChildren(...scene.lines.map(([speaker, words]) => {
                const line = document.createElement('div');
                line.className = 'dialogue-line';
                line.dataset.speaker = speaker;
                const name = document.createElement('span');
                name.className = 'speaker';
                name.textContent = speaker;
                const quote = document.createElement('blockquote');
                quote.innerHTML = format(words);
                line.append(name, quote);
                return line;
            }));
            $('previous').disabled = state.step === 0;
            $('story-choice').hidden = !scene.choice;
            $('next').hidden = Boolean(scene.choice && !state.vote);
            $('next').textContent = scene.choice ? 'View chosen outcome' : state.step === sequence.length - 1 ? 'Meet Cerya' : 'Continue';
        }
        updateStatus();
        if (focus) $(profile ? 'profile-title' : 'scene-title').focus({ preventScroll: true });
    }
    function endStory() {
        if (!state.seen[state.vote]) {
            state.seen[state.vote] = true;
            // Only keeping Celina's secret traps the reader in the bra spell; telling Cerya just ends in the bio.
            if (state.vote === 'celina') {
                const until = Date.now() + CURSE_MIN + Math.random() * (CURSE_MAX - CURSE_MIN);
                state.curse = { side: 'celina', until, additions: 0 };
                $('curse-feedback').textContent = 'Stretched snug and permanent. The bond will loosen eventually... maybe.';
            }
        }
        state.view = 'profile';
        state.step = 0;
    }
    $('next').addEventListener('click', () => {
        if (state.view === 'intro' && scenes[state.step].choice) {
            if (!state.vote) return;
            state.view = 'ending'; state.step = 0;
        } else if (state.view === 'ending' && state.step === endings[state.vote].length - 1) endStory();
        else state.step++;
        save(); render(true);
    });
    $('previous').addEventListener('click', () => { state.step = Math.max(0, state.step - 1); save(); render(true); });
    $('profile-link').addEventListener('click', () => { state.view = 'profile'; save(); render(true); });
    $('replay').addEventListener('click', () => { state.view = 'intro'; state.step = 0; save(); render(true); });
    document.querySelectorAll('[data-vote]').forEach(button => button.addEventListener('click', () => {
        // Refresh before voting so an already-open tab observes the stored cooldown.
        if (persistent) state = read();
        if (state.vote === button.dataset.vote || (state.vote && Date.now() < state.changedAt + HOUR)) { render(); return; }
        const previousVote = state.vote;
        state.vote = button.dataset.vote;
        state.changedAt = Date.now();
        state.view = 'ending'; state.step = 0;
        save(); render(true);
        submitVote(state.vote, previousVote);
    }));
    $('challenge').addEventListener('click', () => {
        if (persistent) state = read();
        if (!state.curse || state.curse.until <= Date.now()) { updateStatus(); return; }
        state.curse.until += 60000;
        state.curse.additions++;
        $('curse-feedback').textContent = 'Cerya tugs the leash a little tighter.';
        save(); updateStatus();
    });
    function braAction(seconds, kind, titleText, feedback) {
        if (persistent) state = read();
        if (!state.curse || state.curse.side !== 'celina' || state.curse.until <= Date.now()) { updateStatus(); return; }
        state.curse.until += seconds * 1000;
        state.curse.additions++;
        $('curse-feedback').dataset.hold = '1';
        $('curse-feedback').textContent = feedback;
        showActionPopup(kind, titleText);
        clearTimeout(braAction._t);
        braAction._t = setTimeout(() => { delete $('curse-feedback').dataset.hold; }, 3000);
        save(); updateStatus();
    }
    $('act-squirm').addEventListener('click', () => braAction(30, 'squirm', 'Squirm~', '+30s added to the spell~'));
    $('act-moan').addEventListener('click', () => braAction(60, 'moan', 'Moan~', '+60s added to the spell~'));
    $('act-worship').addEventListener('click', () => braAction(90, 'worship', 'Worship~', '+90s added to the spell~'));
    $('act-beg').addEventListener('click', () => braAction(45, 'beg', 'Beg for Mercy~', '+45s added to the spell~'));
    $('popup-close').addEventListener('click', () => { $('action-popup').hidden = true; });
    $('scene-image').addEventListener('error', () => {
        if ($('scene-image').src !== PORTRAIT) $('scene-image').src = PORTRAIT;
        else $('scene-image').alt = 'The portrait could not load. You can still continue the encounter.';
    });
    window.addEventListener('storage', event => { if (event.key === KEY || event.key === null) { state = read(); render(); } });
    window.addEventListener('pageshow', () => { if (persistent) state = read(); render(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { if (persistent) state = read(); render(); } });
    setInterval(updateStatus, 1000);
    render();
    refreshGlobalCounts();
})();
