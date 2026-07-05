(function() {
    const config = window.BLACKJACK_STATE_CONFIG || {};
    const state = JSON.parse(localStorage.getItem("farmState") || "{}");
    let endTime = state.trappedUntil || Date.now();
    let submission = parseInt(localStorage.getItem(`${config.key || "blackjack"}Submission`) || "0", 10);
    let completionApplied = localStorage.getItem(`${config.key || "blackjack"}CompletionApplied`) === "true";

    const timer = document.getElementById("countdownTimer");
    const fill = document.getElementById("meterFill");
    const value = document.getElementById("meterValue");
    const status = document.getElementById("statusText");
    const flash = document.getElementById("flash");
    const flashText = document.getElementById("flashText");
    let penaltyOverlay = null;

    function updateTimer() {
        const remaining = Math.max(0, endTime - Date.now());
        const h = Math.floor(remaining / 3600000).toString().padStart(2, "0");
        const m = Math.floor((remaining % 3600000) / 60000).toString().padStart(2, "0");
        const s = Math.floor((remaining % 60000) / 1000).toString().padStart(2, "0");
        timer.textContent = `${h}:${m}:${s}`;

        if (remaining <= 0) {
            localStorage.removeItem("farmState");
            localStorage.removeItem(`${config.key || "blackjack"}Submission`);
            localStorage.removeItem(`${config.key || "blackjack"}CompletionApplied`);
            window.location.href = "../../farm.html";
        }
    }

    function showFlash(text) {
        flashText.innerHTML = text;
        flash.classList.add("active");
        setTimeout(() => flash.classList.remove("active"), 4300);
    }

    function updateMeter() {
        const percent = Math.min(100, submission);
        fill.style.width = `${percent}%`;
        value.textContent = `${percent}%`;
        localStorage.setItem(`${config.key || "blackjack"}Submission`, String(submission));
    }

    function applyCompletionPenalty() {
        if (completionApplied) return;
        completionApplied = true;
        localStorage.setItem(`${config.key || "blackjack"}CompletionApplied`, "true");

        const current = JSON.parse(localStorage.getItem("farmState") || "{}");
        const baseEnd = Math.max(Date.now(), current.trappedUntil || endTime || Date.now());
        endTime = baseEnd + 24 * 60 * 60 * 1000;
        current.trappedUntil = endTime;
        localStorage.setItem("farmState", JSON.stringify(current));

        runPenaltyAnimation(config.penaltyText || "Vesper smiles as the state locks deeper. You pushed the meter to 100%, so the house adds another full day.");
        updateTimer();
    }

    function resetProgressAndReload() {
        localStorage.removeItem(`${config.key || "blackjack"}Submission`);
        localStorage.removeItem(`${config.key || "blackjack"}CompletionApplied`);
        window.location.reload();
    }

    function getPenaltyMessages() {
        return config.penaltyBursts || [
            "<strong>+24 HOURS</strong><br>HOUSE COLLAR LOCKED",
            "<strong>100% MINDFUCKED</strong><br>NO CLEAN ESCAPE",
            "<strong>VESPER'S PROPERTY</strong><br>ANOTHER DAY ADDED",
            "<strong>DEGENERATED</strong><br>THE STATE SETTLES DEEPER",
            "<strong>TABLE WINNER</strong><br>YOU ARE THE PAYOUT"
        ];
    }

    function runPenaltyAnimation(text) {
        if (!penaltyOverlay) {
            penaltyOverlay = document.createElement("div");
            penaltyOverlay.className = "penalty-overlay";
            penaltyOverlay.innerHTML = `
                <div class="penalty-timer">+24:00:00</div>
                <div class="penalty-subtitle">${text}</div>
                <div class="penalty-burst-layer"></div>
            `;
            document.body.appendChild(penaltyOverlay);
        } else {
            penaltyOverlay.querySelector(".penalty-subtitle").innerHTML = text;
        }

        const layer = penaltyOverlay.querySelector(".penalty-burst-layer");
        const messages = getPenaltyMessages();
        let index = 0;

        penaltyOverlay.classList.add("active");
        layer.innerHTML = "";

        const spawnBurst = () => {
            const burst = document.createElement("div");
            burst.className = "penalty-burst";
            burst.innerHTML = messages[index % messages.length];
            burst.style.left = `${18 + Math.random() * 64}%`;
            burst.style.top = `${12 + Math.random() * 58}%`;
            burst.style.animationDelay = `${Math.random() * 0.18}s`;
            layer.appendChild(burst);
            setTimeout(() => burst.remove(), 3300);
            index += 1;
        };

        spawnBurst();
        const burstTimer = setInterval(spawnBurst, 520);

        setTimeout(() => {
            clearInterval(burstTimer);
            penaltyOverlay.classList.remove("active");
            showFlash(`<strong>+24:00:00 LOCKED</strong><br>${text}<br><br>The state settles back in. Your mind gets just enough room to break all over again.`);
            setTimeout(resetProgressAndReload, 5200);
        }, 9800);
    }

    function doAction(index) {
        const action = config.actions[index];
        if (!action) return;
        submission = Math.min(100, submission + action.gain);
        status.innerHTML = action.status;
        status.classList.remove("pulse-hot");
        void status.offsetWidth;
        status.classList.add("pulse-hot");
        updateMeter();
        if (action.flash) showFlash(action.flash);
        if (submission >= 100) {
            setTimeout(() => {
                if (config.completeText) showFlash(config.completeText);
                setTimeout(applyCompletionPenalty, 900);
            }, 350);
        }
    }

    document.querySelectorAll("[data-action-index]").forEach(button => {
        button.addEventListener("click", () => doAction(parseInt(button.dataset.actionIndex, 10)));
    });

    updateTimer();
    updateMeter();
    setInterval(updateTimer, 1000);
})();
