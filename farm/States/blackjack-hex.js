(() => {
    const isPreview = new URLSearchParams(window.location.search).has("preview");
    const storage = isPreview ? sessionStorage : localStorage;
    const key = isPreview ? blackjackEncounters.previewKey : "farmState";
    const tableKey = "farmBlackjack";
    const returnUrl = isPreview ? "../blackjack.html#encounterDebug" : "../blackjack.html";
    const byId = id => document.getElementById(id);

    function readFate() {
        try {
            const state = JSON.parse(storage.getItem(key));
            return state?.trapSource === "blackjack-hex" ? state : null;
        } catch {
            return null;
        }
    }

    const initial = readFate();
    const guest = blackjackEncounters.guestForScene(initial?.hex);
    if (!guest) {
        window.location.replace(returnUrl);
        return;
    }

    const sameFate = state => state?.hex?.guest === guest.id && state.hex.startedAt === initial.hex.startedAt;
    const timer = byId("fateTimer");
    const actions = byId("fateActions");
    const status = byId("fateStatus");
    const release = byId("fateReturn");
    const releaseNote = byId("releaseNote");
    const meter = byId("fateMeter");
    const complete = byId("fateComplete");
    const art = byId("fateArt");
    const gallery = byId("fateViews");
    let displayedState = initial;

    document.title = guest.title;
    document.body.style.setProperty("--accent", guest.color);
    document.body.style.setProperty("--accent-2", "#eee0f5");
    byId("fateLocation").textContent = isPreview ? `Debug preview · ${guest.location}` : guest.location;
    byId("fateTitle").textContent = guest.title;
    byId("fateArrival").textContent = guest.arrival;
    byId("fateMemory").textContent = guest.memory;
    byId("meterLabel").textContent = guest.meter;
    const lost = initial.hex.lost;
    byId("fateChips").textContent = lost === null
        ? "This hex carried over from your last visit."
        : lost > 0 ? `${lost} ${lost === 1 ? "chip" : "chips"} taken ${isPreview ? "from the test stack" : "at the table"}.` : "Your stack was already empty.";
    if (isPreview) release.textContent = "End preview";

    function showArt(index) {
        const [source, alt] = guest.art[index];
        art.src = blackjackEncounters.imageUrl(source);
        art.alt = alt;
        [...gallery.children].forEach((button, position) => button.setAttribute("aria-pressed", position === index));
    }

    guest.art.forEach(([, label, tab], index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "state-btn";
        button.textContent = tab;
        button.title = label;
        button.addEventListener("click", () => showArt(index));
        gallery.append(button);
    });
    showArt(0);

    function renderTime() {
        const seconds = Math.max(0, Math.ceil((displayedState.trappedUntil - Date.now()) / 1000));
        const days = Math.floor(seconds / 86400);
        const time = [Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
        timer.textContent = (days ? `${days}d ` : "") + time.map(unit => String(unit).padStart(2, "0")).join(":");
        [...actions.children].forEach(button => { button.disabled = !seconds; });
        release.hidden = !isPreview && seconds > 0;
        releaseNote.textContent = isPreview
            ? "You can end the preview at any time."
            : seconds ? "The spell holds until the timer runs out." : "The spell has lifted.";
    }

    function render(state) {
        displayedState = state;
        const { progress = 0, last } = state.hex;
        byId("meterValue").textContent = `${progress}%`;
        meter.setAttribute("aria-valuenow", progress);
        byId("fateFill").style.width = `${progress}%`;
        byId("fatePhase").textContent = guest.phases[progress >= 100 ? 2 : progress >= 35 ? 1 : 0];
        status.textContent = guest.actions[last]?.[2] || guest.opening;
        complete.textContent = progress >= 100 ? guest.complete : "";
        renderTime();
    }

    function act(update) {
        const apply = () => {
            const current = readFate();
            if (!sameFate(current)) {
                window.location.replace(returnUrl);
                return;
            }
            update(current);
        };
        if (!isPreview && navigator.locks) navigator.locks.request(tableKey, apply);
        else apply();
    }

    guest.actions.forEach(([label, gain], index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "state-btn";
        button.textContent = label;
        button.addEventListener("click", () => act(current => {
            if (current.trappedUntil <= Date.now()) {
                render(current);
                return;
            }
            current.hex.last = index;
            current.hex.progress = Math.min(100, (current.hex.progress || 0) + gain);
            storage.setItem(key, JSON.stringify(current));
            render(current);
        }));
        actions.append(button);
    });

    release.addEventListener("click", () => act(current => {
        if (!isPreview) {
            if (current.trappedUntil > Date.now()) return;
            let table;
            try {
                table = JSON.parse(localStorage.getItem(tableKey));
            } catch {
                table = null;
            }
            if (table?.encounters) {
                table.encounters = blackjackEncounters.restore(table.encounters);
                const fate = table.encounters.fate;
                if (fate?.startedAt === current.hex.startedAt && fate.guest === guest.id && blackjackEncounters.release(table)) {
                    localStorage.setItem(tableKey, JSON.stringify(table));
                }
            }
        }
        storage.removeItem(key);
        window.location.replace(returnUrl);
    }));
    window.addEventListener("storage", event => {
        if (event.storageArea !== storage || (event.key !== key && event.key !== null)) return;
        const current = readFate();
        if (sameFate(current)) render(current);
        else window.location.replace(returnUrl);
    });

    render(initial);
    byId("hexFate").hidden = false;
    setInterval(renderTime, 1000);
})();
