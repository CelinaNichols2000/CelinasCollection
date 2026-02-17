((window) => {
    let _menu;

    const _client = tryGetClient();

    STANDALONE = {
        Steam: {},
    };

    Object.defineProperties(STANDALONE, {
        'client': { value: _client, writable: false },
        'steamworks': { value: _client && _client.Steam, writable: false },
    });

    STANDALONE.Steam.GetAuthSessionTicket = async () => _client && _client.Steam && await _client.Steam.GetAuthSessionTicket() || false;

    STANDALONE.Steam.GetSteamId = () => _client && _client.Steam && _client.Steam.GetSteamId() || false;

    STANDALONE.Steam.GetCurrentGameLanguage = () => _client && _client.Steam && _client.Steam.GetCurrentGameLanguage() || false;

    STANDALONE.GetFullscreen = () => _client && _client.GetFullscreen() || false;

    STANDALONE.ToggleFullscreen = (enabled) => _client && _client.ToggleFullscreen(enabled) || false;

    STANDALONE.OpenExternal = (url) => _client && _client.OpenExternal(url) || false;

    STANDALONE.OpenShop = async () => _client && _client.OpenShop() || false;

    STANDALONE.Quit = () => _client && _client.Quit() || false;

    STANDALONE.CloseMenu = () => {
        if (_menu && _menu.parentNode) {
            _menu.parentNode.removeChild(_menu);
            return true;
        }
        return false
    };

    STANDALONE.OpenMenu = () => {
        try {
            GUI.instance.CloseAlert();
            document.activeElement.blur();

            _menu = document.createElement("div");
            _menu.id = "game_menu";

            const buttons = document.createElement("div");
            buttons.className = "buttons";

            const close = () => STANDALONE.CloseMenu();

            drawButton(buttons, "Shop", () => { STANDALONE.OpenShop().then(opened => !opened && (window.open(`/shop.php`))); close() }, "shop");
            drawButton(buttons, "Profile", () => { window.open(`/character/${GAME_MANAGER.instance.character.token}`); close() });
            drawButton(buttons, "Macros", () => { MENU.Macros.Open(); close() });
            drawButton(buttons, "Settings", () => { MENU.Settings.Open(); close() });
            draweSpace(buttons);
            drawButton(buttons, "Exit to Character Selection", () => GUI.instance.ExitAlert());
            _client && drawButton(buttons, "Quit Game", () => GUI.instance.QuitAlert());
            draweSpace(buttons);
            drawButton(buttons, "Return to Game", close);

            _menu.appendChild(buttons);
            container.appendChild(_menu);

            return true;
        }
        catch (e) {
            console.error(e);
        }
        return false;
    }

    function draweSpace(parent) {
        const space = document.createElement("div");
        parent.appendChild(space);
        return space;
    }

    function drawButton(parent, label, onclick, ...classes) {
        const button = document.createElement("div");
        button.className = "button " + classes.join(" ");
        button.textContent = label;
        button.onclick = onclick;
        parent.appendChild(button);
        return button;
    }

    function tryGetClient() {
        try {
            if (/^BattleMagesClient/.test(window.navigator.userAgent)) {
                return nw?.require?.("./src/js/Client.js") || undefined;
            }
        }
        catch { }
        return undefined;
    }

})(window);
