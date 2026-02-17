((window) => {
    CARD = {
    };

    const _scale = 7.5 / 1.229 / 1.28254;

    const empty = [];

    function drawCardEntry(parent, cardDetails) {
        const card = document.createElement("div");
        card.className = "card";

        const div = [document.createElement("div"), document.createElement("div")];
        div.forEach((elm, i) => (i === 0 ? card : div[i - 1]).appendChild(elm));

        const obj = { rotateX: 0, rotateY: 0, scale: 1 };
        const uv = [0, 0];

        let mouseOver = false;

        const onmousemove = e => {
            const rect = card.getBoundingClientRect();
            const x = e.pageX !== undefined ? e.pageX : e.targetTouches[0].pageX;
            const y = e.pageY !== undefined ? e.pageY : e.targetTouches[0].pageY;
            uv[0] = clamp01((x - rect.x) / rect.width) * 2 - 1;
            uv[1] = (clamp01((y - rect.y) / rect.height) * 2 - 1) * 2 / 3;
            mouseOver = true;
        };

        const onmouseleave = e => mouseOver = false;

        card.addEventListener("mousemove", onmousemove);
        card.addEventListener("mouseenter", onmouseenter);
        card.addEventListener("mouseleave", onmouseleave);

        waitForFrame()
            .then(async () => {
                let time, deltaTime = 0;
                do {
                    obj.scale = clamp(obj.scale + ((mouseOver ? 1.035 : 1) - obj.scale) * deltaTime / 100, 1, 1.035);
                    obj.rotateX = clamp(obj.rotateX + ((mouseOver ? _scale * uv[1] : 0) - obj.rotateX) * deltaTime / 200, -_scale, _scale);
                    obj.rotateY = clamp(obj.rotateY + ((mouseOver ? _scale * -uv[0] : 0) - obj.rotateY) * deltaTime / 200, -_scale, _scale);
                    div[0].style.transform = div[1].style.transform = `perspective(1000px) rotateX(${obj.rotateX}deg) rotateY(${obj.rotateY}deg) scale3d(${obj.scale},${obj.scale},${obj.scale})`;
                    time = Date.now();
                    await waitForFrame();
                    deltaTime = Date.now() - time;
                }
                while (document.body.contains(card));
            }).finally(() => {
                card.removeEventListener("mousemove", onmousemove);
                card.removeEventListener("mouseenter", onmouseenter);
                card.removeEventListener("mouseleave", onmouseleave);
            });

        const img = document.createElement("div");
        // img.style.backgroundImage = `url(${formatMediaURL("/game/assets/cards/perfect_pussy_pet.png", powCeil(146.06 * getMediaScale()))})`;
        div[1].appendChild(img);

        parent.appendChild(card);
        return card;
    }

    function drawCardSummary(parent, character) {
        let cards = character.cards || empty;

        const content = document.createElement("div");

        let rows = [document.createElement("div"), document.createElement("div")];
        for (let i = 0; i < 14; i++) {
            const row = rows[Math.floor(i / 7)];
            const wrapper = document.createElement("div");
            const card = cards[i];
            const cardEntry = drawCardEntry(wrapper, card);
            row.appendChild(wrapper);
            cardEntry.onclick = () => console.log("click");
        }

        rows.forEach(row => content.appendChild(row));
        parent.appendChild(content);

        return content;
    }

    window.drawCardSummary = drawCardSummary;
})(window);
