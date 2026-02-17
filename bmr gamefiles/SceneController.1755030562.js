(() => {
    SCENE = {
        VALIDATION_INTERVAL: 10000,
        Update: (deltaTime, _parallaxEnabled) => _instance && _instance.Update(deltaTime, _parallaxEnabled),
        Resize: () => _instance && _instance.Resize(),
    };

    let _instance;

    Object.defineProperty(SCENE, 'instance', { get: () => _instance || (_instance = new SceneController()) });

    function SceneController() {
        const { Location } = LOCATION;

        const _characters = document.getElementById("characters");
        const _characterHoverCanvas = document.getElementById("character_hover").getElementsByTagName("canvas");
        const _backgroundWrapper = document.getElementById("background_wrapper");

        const _displayedCharacters = [null, null];

        const _characterHoverImages = [];
        const _characterHoverImageData = [];

        let _currentBackground = null;
        let _pendingBackgroundUpdate;

        let _background = _backgroundWrapper.getElementsByTagName("div")[0];
        let _backgroundOffset = 0;
        let _backgroundMouseOffset = 0;
        let _backgroundMouseEnabled = false;
        let _backgroundImage = null;

        let _canvasImage;

        container.addEventListener("mousemove", e => {
            if (_backgroundMouseEnabled && !GUI.instance.alertDisplayed) {
                const rect = container.getBoundingClientRect();
                const x = e.pageX !== undefined ? e.pageX : e.targetTouches[0].pageX;
                const y = e.pageY !== undefined ? e.pageY : e.targetTouches[0].pageY;
                if (y < rect.height * 0.75) {
                    _backgroundMouseOffset = ((x - rect.x) / rect.width) * 2 - 1;
                }
            }
        });

        _backgroundWrapper.addEventListener("click", async () => {
            const title = document.getElementById("location_title");
            if (title && title.getElementsByTagName("span").length >= 2) {
                if (await GUI.instance.Alert("Stop waiting for another player to join and continue to location immediately?", "Stop", "Wait")) {
                    GAME_MANAGER.instance.Send("Location", { location: true });
                }
            }
        });

        this.GetHoverImageData = position => _characterHoverImageData[position];

        this.GetDisplayedCharacter = position => _displayedCharacters[position];

        this.GetCharacterNature = position => (_displayedCharacters[position] || {}).nature;

        this.OnParallaxChanged = enabled => !enabled && _backgroundImage && (_backgroundWrapper.style.transform = "");

        this.SetCharacter = async (character, position, enterOrLeave) => character ? SCENE.instance.ShowCharacter(character, position, enterOrLeave) : SCENE.instance.HideCharacter(position, enterOrLeave, false);

        const setCharacter = async (character, position, enterOrLeave) => character ? showCharacter(character, position, enterOrLeave) : hideCharacter(position, enterOrLeave, false);

        this.ShowCharacter = async (character, position, enter) => {
            await LOCK.Lock(this);
            try {
                return await showCharacter(character, position, enter);
            }
            finally {
                LOCK.Unlock(this);
            }
        }

        const updateItemForm = (elm, item) => {
            const pixelated = item.base.nsfw && SETTINGS.Get("sfw", false);
            _canvasImage = IMAGE_PROCESSING.getWornItemImage(item, 0, item.base.tooltip_always_show_worn !== false && item.base.worn_image_url || item.base.image_url, 256, 0, pixelated);
            GUI.instance.SetItemForm(elm, item.base, _canvasImage, pixelated);
        };

        const backgorundImageToURL = (backgroundImage, scale) => {
            const match = backgroundImage.match(/"([^"]+)\/[0-9]*\/([^"]+)"/);
            if (!match) {
                throw "Failed to find avatar image";
            }
            return `${match[1]}/${powCeil(512 * scale)}/${match[2]}`;
        };

        const showCharacter = async (character, position, enter) => {
            const morph = character.morph;

            position = position >= 0 ? position : character.token !== undefined ? GUI.Position.Left : GUI.Position.Right;

            const prevCharacter = _displayedCharacters[position];
            const elm = _characters.getElementsByTagName("li")[position];

            if (prevCharacter && prevCharacter.id === CHARACTER.GetId(character)) {
                if (characterToGender(prevCharacter) !== characterToGender(character)) {
                    await updateCharacter(character);
                }
                else if (!GAME_MANAGER.instance.InScenario()) {
                    if (character.token === GAME_MANAGER.instance.character.token) {
                        const div = elm.getElementsByTagName("div")[0];
                        const hidden = !div || div.style.visibility == "hidden";
                        const isItem = GAME_MANAGER.instance.character.item != null;
                        if (isItem != hidden) {
                            await updateCharacter(character);
                        }
                    }
                    else if (GAME_MANAGER.instance.owner && character.token === GAME_MANAGER.instance.owner.token) {
                        const item = GAME_MANAGER.instance.character.item;
                        const baseItem = item && GAME_MANAGER.instance.GetBaseItem(item);
                        if (baseItem) {
                            const image = IMAGE_PROCESSING.getWornItemImage(item, 0, baseItem.worn_image_url || baseItem.image_url, 256);
                            if (!elm.getElementsByTagName("canvas")[0] || _canvasImage != image) {
                                updateItemForm(elm, Object.assign({}, item, { base: GAME_MANAGER.instance.GetBaseItem(item) }));
                            }
                        }
                    }
                }
                if (prevCharacter.GetSprite() !== CHARACTER.GetSprite(character)) {
                    await updateCharacterImmediately(character);
                }
                return false;
            }

            if (character.GetSprite !== "function") {
                character = new CHARACTER.Character(character);
            }

            if (prevCharacter) {
                await hideCharacter(position, false, false);
            }

            if (_displayedCharacters[(position + 1) % 2] && _displayedCharacters[(position + 1) % 2].id === character.id) {
                await hideCharacter((position + 1) % 2, false, false);
            }

            _displayedCharacters[position] = character;
            elm.className = `inactive ${characterToGender(character)} ${character.nature ? character.nature.toLowerCase() : ''}`;

            const div = document.createElement("div");
            const sprite = character.GetSprite();

            if (character.HasSprite()) {
                div.style.backgroundImage = `url(${sprite})`;
            }
            else if (character.token === undefined) {
                elm.classList.add("npc");
            }

            clearHTML(elm);
            elm.appendChild(div);

            if (enter) {
                elm.classList.add("enter");
            }

            let hidden;

            if (!GAME_MANAGER.instance.InScenario() && GAME_MANAGER.instance.character.item) {
                hidden = character.token === GAME_MANAGER.instance.character.token;
                if (hidden || GAME_MANAGER.instance.owner && character.token === GAME_MANAGER.instance.owner.token) {
                    const item = GAME_MANAGER.instance.character.item;
                    updateItemForm(elm, Object.assign({}, item, { base: GAME_MANAGER.instance.GetBaseItem(item) }));
                }
            }

            div.style.visibility = hidden ? "hidden" : "";

            await GUI.Reflow();

            try {
                const img = await GUI.instance.PreloadImage(sprite);
                setCharacterHoverImage(img, position);
                if (morph) {
                    let details;
                    const onResize = () => {
                        if (!details) {
                            return;
                        }
                        const animator = new IMAGE_PROCESSING.Animator(points[0], details, [-0.1, 1.1]);
                        try {
                            animator.applyMask = true;
                            animator.antialiasing = SETTINGS.Get("image_filtering", true);
                            animator.DrawFrame(1, canvas, w * getContainerScale(), h * getContainerScale(), getCanvasScale(canvas));
                        }
                        finally {
                            animator.Delete();
                        }
                    };
                    const pixelated = morph.nsfw && SETTINGS.Get("sfw", false);
                    const scale = SETTINGS.Get("settings_morph_scale", true) ? Math.max(2, getMediaScale()) : 1;
                    const containerScale = getContainerScale();
                    const rect = elm.getBoundingClientRect();
                    const w = rect.width / containerScale;
                    const h = rect.height / containerScale;
                    const canvas = drawCanvas(elm, w, h, { resize: onResize });
                    canvas.style.display = "none";
                    const avatarURL = backgorundImageToURL(window.getComputedStyle(div).backgroundImage, scale);
                    const [avatarImage, morphImage] = await Promise.all([
                        loadImage(avatarURL, true),
                        loadImage(IMAGE_PROCESSING.getMorphImage(morph.image, morph.color, 0, 256, scale, pixelated), true),
                        IMAGE_PROCESSING.ready,
                    ]);
                    const points = [IMAGE_PROCESSING.findPoints(avatarImage), IMAGE_PROCESSING.findPoints(morphImage)];
                    if (points[0] && points[1]) {
                        const max = Math.max(points[1].source.width, points[1].source.height);
                        div.style.display = "none";
                        const flipped = position === 0 ? !morph.flipped : morph.flipped;
                        details = Object.assign(points[1], Object.assign({}, morph.details, { scale: (morph.details && morph.details.scale || 1) * 256 * scale / max, flipped }));
                        onResize();
                        revealCanvas(canvas);
                    }
                }
            }
            catch (e) {
                console.error(e);
                div.style.backgroundImage = "";
            }

            elm.classList.remove("inactive");
            await transitionEnded(elm);
            return true;
        };

        this.HideCharacter = async (character, leave, closeChat) => {
            await LOCK.Lock(this);
            try {
                return await hideCharacter(character, leave, closeChat);
            }
            finally {
                LOCK.Unlock(this);
            }
        }

        const hideCharacter = async (character, leave, closeChat) => {
            const position = typeof character === "number" ? character : this.CharacterToPosition(character);

            if (position < 0) {
                return;
            }

            const elm = _characters.getElementsByTagName("li")[position];
            _displayedCharacters[position] = null;
            setCharacterHoverImage(null, position);

            if (closeChat !== false) {
                LOCAL_CHAT.Close(position);
            }

            if (!elm.classList.contains("inactive")) {
                elm.classList.remove("enter");
                if (leave) {
                    elm.classList.add("leave");
                }

                GUI.instance.CloseActionHub(position);

                await GUI.Reflow();

                elm.classList.add("inactive");

                await transitionEnded(elm);

                elm.classList.remove("leave");
            }

            const div = elm.getElementsByTagName("div")[0];
            div && (div.style.display = null);

            const canvas = elm.getElementsByTagName("canvas")[0];
            canvas && canvas.parentNode && canvas.parentNode.removeChild(canvas);
        };

        this.MorphCharacter = async (character, imageURL, morph, color, nsfw, flipped) => {
            await LOCK.Lock(this);
            try {
                const position = this.CharacterToPosition(character);

                if (position < 0) {
                    return;
                }

                let animatorProgress = SETTINGS.Get("image_morphing", true) ? 0 : 1;

                const animatorDuration = getAnimatorDuration();
                const pixelated = nsfw && SETTINGS.Get("sfw", false);
                const scale = SETTINGS.Get("settings_morph_scale", true) ? Math.max(2, getMediaScale()) : 1;
                const elm = _characters.getElementsByTagName("li")[position];
                const div = elm.getElementsByTagName("div")[0];
                const avatarURL = backgorundImageToURL(window.getComputedStyle(div).backgroundImage, scale);
                const obj = GAME_MANAGER.instance.tier < 2 && character && character.username && await GAME_MANAGER.instance.Api("user/getsupporttier.php", { username: character.username });

                const [avatarImage, morphImage] = await Promise.all([
                    loadImage(avatarURL, true),
                    loadImage(IMAGE_PROCESSING.getMorphImage(imageURL, color, obj && obj.success ? obj.tier : 0, 256, scale, pixelated), true),
                    IMAGE_PROCESSING.ready,
                ]);

                const points = [IMAGE_PROCESSING.findPoints(avatarImage), IMAGE_PROCESSING.findPoints(morphImage)];

                if (!(points[0] && points[1])) {
                    return;
                }

                flipped = position === 0 ? !flipped : flipped;

                points[0].scale *= 1;

                const max = Math.max(points[1].source.width, points[1].source.height);
                const animator = new IMAGE_PROCESSING.Animator(points[0], Object.assign(points[1], Object.assign({}, morph, { scale: (morph && morph.scale || 1) * 256 * scale / max, flipped })), [-0.1, 1.1]);
                animator.applyMask = true;
                animator.antialiasing = SETTINGS.Get("image_filtering", true);

                await waitForFrame();

                const onUpdate = deltaTime => {
                    if (animatorProgress < 1) {
                        animatorProgress = clamp01(animatorProgress + deltaTime / animatorDuration);
                        onResize();
                    }
                };

                const onResize = () => animator.DrawFrame(easeInOutBack(animatorProgress), canvas, w * getContainerScale(), h * getContainerScale(), getCanvasScale(canvas));

                const onDelete = () => animator.Delete();

                Array.from(elm.getElementsByTagName("canvas")).forEach(c => c.parentNode.removeChild(c));

                const containerScale = getContainerScale();
                const rect = elm.getBoundingClientRect();
                const w = rect.width / containerScale;
                const h = rect.height / containerScale;

                const canvas = drawCanvas(elm, w, h, { resize: onResize, delete: onDelete, update: onUpdate });

                onResize();

                div.style.display = "none";
            }
            finally {
                LOCK.Unlock(this);
            }
        };

        this.SetLocation = async location => {
            if (!location) {
                return;
            }
            await LOCK.Lock(this);
            try {
                await setLocation(prepareLocation(location));
            }
            finally {
                LOCK.Unlock(this);
            }
        }

        this.UpdateLocationBackground = async location => {
            await waitWhile(() => LOCK.IsLocked(this));
            return location && updateLocationBackground(prepareLocation(location));
        };

        this.UpdateLocation = async (location) => {
            if (!location) {
                return;
            }
            await LOCK.Lock(this);
            try {
                while (location.GetBackgroundURL() !== _currentBackground) {
                    if (location.GetBackgroundVariants().includes(_currentBackground)) {
                        updateLocationBackground(location);
                        break;
                    }
                    else {
                        await setLocation(location);
                    }
                }

                await setCharacter(location.player, GUI.Position.Left, true);

                LOCAL_CHAT.Resume(GUI.Position.Left);

                if (await setCharacter(location.opponent || location.npc, GUI.Position.Right, true)) {
                    if (location.opponent) {
                        STATUS.Show();
                        GUI.instance.OpenLocalChat();
                    }
                    else {
                        STATUS.opponent.Hide();
                        if (location.npc && (!GAME_MANAGER.instance.character.item || GAME_MANAGER.instance.owner)) {
                            VOICE_CHAT.instance.Display(_displayedCharacters[1] && _displayedCharacters[1].GetGreeting(), GUI.Position.Right);
                        }
                    }
                }
            }
            finally {
                LOCK.Unlock(this);
            }
        };

        const prepareLocation = location => location instanceof Location ? location : new Location(location);

        const setLocation = async (location) => {
            const background = location.GetBackgroundURL();

            if (background === _currentBackground) {
                return;
            }

            if (_currentBackground) {
                LOCAL_CHAT.Clear();
                STATUS.Hide();
                GUI.instance.HideDialog();
            }

            await hideCharacter(GUI.Position.Left, true, false);
            await hideCharacter(GUI.Position.Right, false, false);

            await LOCK.Lock(_backgroundWrapper);
            try {
                if (background != _currentBackground) {

                    _backgroundMouseEnabled = false;

                    if (_currentBackground) {
                        let list = _backgroundWrapper.getElementsByTagName("div");
                        for (let i = 0; i < list.length; i++) {
                            list[i].classList.add("inactive");
                        }
                        await wait(GUI.BACKGROUND_TRANSITION_DURATION + 200);
                    }

                    _currentBackground = location.GetBackgroundURL();

                    if (_currentBackground) {
                        _background.style.backgroundImage = `url(${_currentBackground})`;
                        _backgroundImage = await GUI.instance.PreloadImage(_currentBackground);

                        _background.classList.remove("inactive");
                        await wait(GUI.BACKGROUND_TRANSITION_DURATION);

                        const title = document.getElementById("location_title");
                        title && title.parentNode.removeChild(title);
                    }
                    else {
                        _background.style.backgroundImage = null;
                        _backgroundImage = null;
                    }
                    _backgroundMouseEnabled = true;
                }
            }
            finally {
                LOCK.Unlock(_backgroundWrapper);
            }
        };

        const updateLocationBackground = async (location) => {
            if (!_background || _background.classList.contains("inactive") || _pendingBackgroundUpdate) {
                return LOCK.WaitUntilReleased(_backgroundWrapper);
            }
            _pendingBackgroundUpdate = true;
            await LOCK.Lock(_backgroundWrapper);
            try {
                let updated, background;
                do {
                    const div = document.createElement("div");
                    updated = false;

                    while ((background = location.GetBackgroundURL()) !== _currentBackground) {
                        div.style.backgroundImage = `url(${background})`;
                        _currentBackground = background;
                        _backgroundImage = await GUI.instance.PreloadImage(background);
                        updated = true;
                    }

                    if (updated) {
                        const prevBackground = _background;

                        _background = div;
                        _backgroundWrapper.insertBefore(_background, prevBackground);

                        await wait(GUI.BACKGROUND_TRANSITION_DURATION);

                        GUI.instance.UnloadUnusedAssets();

                        _backgroundWrapper.removeChild(prevBackground);
                    }
                    break;
                }
                while (updated);
            }
            finally {
                LOCK.Unlock(_backgroundWrapper);
                _pendingBackgroundUpdate = false;
            }
        };

        this.LeaveLocation = async destination => {
            await LOCK.Lock(this);
            try {
                LOCAL_CHAT.Clear();
                GUI.instance.HideDialog();

                if (_displayedCharacters[0]) {
                    await hideCharacter(GUI.Position.Left, true, false);
                }

                if (_displayedCharacters[1]) {
                    await hideCharacter(GUI.Position.Right, false, false);
                }

                await LOCK.Lock(_backgroundWrapper);
                try {
                    if (_currentBackground) {
                        _backgroundMouseEnabled = false;

                        const list = _backgroundWrapper.getElementsByTagName("div");
                        for (let i = 0; i < list.length; i++) {
                            list[i].classList.add("inactive");
                        }
                        await wait(GUI.BACKGROUND_TRANSITION_DURATION + 200);

                        _background.style.backgroundImage = null;
                        _backgroundImage = null;
                        _currentBackground = null;
                    }

                    if (destination) {
                        const title = document.getElementById("location_title") || document.createElement("div");
                        title.id = "location_title";
                        title.className = "inactive";
                        clearHTML(title);

                        const span = document.createElement("span");
                        span.textContent = LOCATION.LocationNameToTitle(destination);
                        title.appendChild(span);

                        container.prepend(title);

                        await GUI.Reflow();

                        title.classList.remove("inactive");

                        LOCATION.instance.ready && GUI.instance.LocationReady();
                    }
                }
                finally {
                    LOCK.Unlock(_backgroundWrapper);
                }
            }
            finally {
                LOCK.Unlock(this);
            }
        };

        this.AnimateCharacter = async (character, animation) => {
            await LOCK.Lock(this);
            try {
                const position = this.CharacterToPosition(character);

                if (position < 0) {
                    return;
                }

                character = typeof character.GetSprite !== "function" ? new CHARACTER.Character(character) : character;

                const elm = _characters.getElementsByTagName("li")[position];

                elm.classList.remove("flash");
                elm.classList.remove("leave");
                elm.classList.remove("enter");

                await GUI.Reflow();

                switch (animation) {
                    case GUI.Animation.HitFade:
                    case GUI.Animation.HitDrop:
                    case GUI.Animation.HitShrink:
                    case GUI.Animation.Drop:
                    case GUI.Animation.Shrink:
                        _displayedCharacters[position] = null;
                        setCharacterHoverImage(null, position);
                        break;
                }

                switch (animation) {
                    case GUI.Animation.Hit:
                    case GUI.Animation.HitFade:
                    case GUI.Animation.HitDrop:
                    case GUI.Animation.HitShrink:
                        elm.classList.add("flash");
                        if (character.id === CHARACTER.GetId(LOCATION.instance.player)) {
                            _background.classList.remove("flash");
                            await GUI.Reflow();
                            _background.classList.add("flash");
                        }
                        await wait(800);
                        switch (animation) {
                            case GUI.Animation.Hit:
                                return;
                            case GUI.Animation.HitFade:
                                elm.classList.add("fade");
                                break;
                            case GUI.Animation.HitDrop:
                                elm.classList.add("drop");
                                break;
                            case GUI.Animation.HitShrink:
                                elm.classList.add("shrink");
                                break;
                        }
                        break;
                    case GUI.Animation.Drop:
                    case GUI.Animation.Shrink:
                        elm.classList.remove(animation);
                        await GUI.Reflow();
                        elm.classList.add(animation);
                        break;
                    default:
                        return;
                }

                elm.className = "inactive";
            }
            finally {
                LOCK.Unlock(this);
            }
        };

        const updateHoverImageData = position => {
            if (_characterHoverImages[position]) {
                const context = _characterHoverCanvas[position].getContext("2d", { willReadFrequently: true });
                const width = _background.offsetWidth * 0.4;
                const height = _background.offsetHeight * 0.9;
                const hoverImage = _characterHoverImages[position];

                _characterHoverCanvas[position].width = width;
                _characterHoverCanvas[position].height = height;

                const scaledWidth = height / hoverImage.height * hoverImage.width;
                context.drawImage(hoverImage, (width - scaledWidth) / 2, 0, scaledWidth, height);

                _characterHoverImageData[position] = context.getImageData(0, 0, width, height);
            }
            else {
                _characterHoverImageData[position] = null;
            }
        };

        this.Resize = () => {
            for (let i = 0; i < _characterHoverImages.length; i++) {
                updateHoverImageData(i);
            }
        };

        this.Update = (deltaTime, parallaxEnabled) => {
            if (deltaTime > 0) {
                _backgroundOffset = clamp(_backgroundOffset + (_backgroundMouseOffset - _backgroundOffset) * deltaTime / 500, -1, 1);
            }
            if (parallaxEnabled && _backgroundImage) {
                _backgroundWrapper.style.transform = `translateX(${(Math.round(_background.offsetWidth * - 0.02 * _backgroundOffset * 10) / 10)}px)`;
            }
        };

        const updateCharacter = async character => {
            position = this.CharacterToPosition(character);
            await hideCharacter(character, false, false);
            await showCharacter(character, position, false);
        };

        const updateCharacterImmediately = async character => {
            const position = character ? this.CharacterToPosition(character) : -1;
            if (position >= 0) {
                const elm = _characters.getElementsByTagName("li")[position];
                const div = document.createElement("div");
                const sprite = CHARACTER.GetSprite(character);
                div.style.backgroundImage = `url(${sprite})`;
                const img = await GUI.instance.PreloadImage(sprite);
                clearHTML(elm);
                elm.appendChild(div);
                setCharacterHoverImage(img, position);
            }
        };

        const setCharacterHoverImage = (img, position) => {
            _characterHoverImages[position] = img;
            updateHoverImageData(position);
            position == GUI.Position.Left && GUI.instance.Resize();
        }

        this.CharacterToPosition = (character) => {
            if (character) {
                const id = CHARACTER.GetId(character);
                for (let i = 0; i < _displayedCharacters.length; i++) {
                    if (_displayedCharacters[i] && _displayedCharacters[i].id === id) {
                        return i;
                    }
                }
            }
            return -1;
        };
    };

    function getAnimatorDuration() {
        switch (nameToRef(SETTINGS.Get("morph_speed", "normal").toString())) {
            case "normal":
            default:
                return 2000;
            case "slow":
                return 3000;
            case "very_slow":
                return 4000;
            case "fast":
                return 1000;
            case "very_fast":
                return 500;
        }
    }
})();
