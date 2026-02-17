(() => {
	CONTROLS = {
		GetHotkeysByLabel: () => _hotkeysByLabel || (_hotkeysByLabel = Object.freeze(Object.assign({}, _defaultHotkeysByLabel, loadHotkeys()))),
		GetActionBarHotkeys: (actionBarIndex) => _actionBarHotkeys[actionBarIndex] || (_actionBarHotkeys[actionBarIndex] = loadActionbarHotkeys(actionBarIndex)),
		SetHotkeys: obj => {
			const hotkeys = Object.values(obj);
			const hotkeysByLabel = CONTROLS.GetHotkeysByLabel();
			for (let label in hotkeysByLabel) {
				if (hotkeys.includes(hotkeysByLabel[label])) {
					obj[label] = "";
				}
			}
			removeHotkeysFromActionBars(hotkeys);
			SETTINGS.Set("hotkeys", JSON.stringify(Object.assign({}, hotkeysByLabel, obj)));
			clearCache();
			return true;
		},
		SetActionBarHotkeys: (actionBarIndex, hotkeys) => {
			const hotkeysByLabel = CONTROLS.GetHotkeysByLabel();
			let obj;
			const arr = unique(hotkeys.reduce((output, arr) => { Array.isArray(arr) && output.push(...arr); return output }, []));
			for (let label in hotkeysByLabel) {
				if (arr.includes(hotkeysByLabel[label])) {
					(obj || (obj = {}))[label] = "";
				}
			}
			removeHotkeysFromActionBars(arr, actionBarIndex);
			obj && SETTINGS.Set("hotkeys", JSON.stringify(Object.assign({}, hotkeysByLabel, obj)));
			SETTINGS.Set(`hotkeys_action_bar_${actionBarIndex}`, JSON.stringify(hotkeys));
			clearCache();
			ACTION_BAR.Redraw();
			return true;
		},
		InputToHotkey: (e) => {
			const keys = [];
			e.ctrlKey && keys.push("Ctrl");
			e.altKey && keys.push("Alt");
			e.shiftKey && keys.push("Shift");
			keys.push(e.key.toUpperCase());
			return keys.join(" + ");
		},
	};

	const _defaultHotkeysByLabel = Object.freeze({
		'Inventory': "I",
		'Location': "L",
		'Macros': ",",
		'Messages': "M",
		'Myself': "C",
		'Settings': "T",
		'Skills': "K",
		'Social': "O",
		'Spells': "S",
		'Inspect Opponent': "Alt + 1"
	});

	const _defaultActionBarHotkeys = Object.freeze([["1"], ["2"], ["3"], ["4"], ["5"], ["6"], ["7"], ["8"], ["9"], ["0"]]);
	_defaultActionBarHotkeys.forEach(arr => Object.freeze(arr));

	const _actionsByLabel = Object.freeze({
		'Inventory': () => MENU.Inventory.Toggle(),
		'Location': () => MENU.Location.Toggle(),
		'Macros': () => MENU.Macros.Toggle(),
		'Messages': () => MENU.Messages.Toggle(),
		'Myself': () => MENU.Myself.Toggle(),
		'Settings': () => MENU.Settings.Toggle(),
		'Skills': () => MENU.Skills.Toggle(),
		'Social': () => MENU.Social.Toggle(),
		'Spells': () => MENU.Spells.Toggle(),
		'Inspect Opponent': () => LOCATION.instance.opponent && MENU.Inspect.Toggle(GUI.Position.Right, LOCATION.instance.opponent.token),
	});

	const _systemActionsByInput = Object.freeze({
		'ESCAPE': (e) => {
			TOOLTIP.instance.Hide();
			if (!GUI.instance.CloseAlert() && !INPUT.instance.Hide() && !STANDALONE.CloseMenu()) {
				if (CURSOR.instance.usingItem || CURSOR.instance.spell) {
					CURSOR.instance.SetDefault();
				}
				else if (MENU.Loot.menu) {
					MENU.Loot.Close();
				}
				else if (MENU.IsAnyOpen()) {
					MENU.CloseAll();
				}
				else if (!STANDALONE.OpenMenu()) {
					GUI.instance.ExitAlert();
				}
				e.stopImmediatePropagation();
			}
		},
		'ENTER': async (e) => {
			if (!GAME_MANAGER.instance.InScenario()) {
				e.stopImmediatePropagation();
				if (GAME_MANAGER.instance.character) {
					await LOCAL_CHAT.player.Show();
					LOCAL_CHAT.player.input.focus();
				}
			}
		},
	});

	const empty = [];
	const noop = () => { };

	const _isDownByKey = {};
	const _actionBarHotkeys = [];

	let _controls;
	let _hotkeysByLabel;

	let _touchLastActive = false;
	let _touchFrame = false;

	Object.defineProperties(CONTROLS, {
		'touchLastActive': { get: () => _touchLastActive },
	});

	const onTouch = () => {
		_touchFrame = _touchLastActive = true;
		LOCK.GetFirstBaton(onTouch) && waitForFrame().then(() => _touchFrame = false).finally(() => LOCK.RemoveBaton(onTouch));
	};

	const onMouse = () => { _touchLastActive = _touchFrame; };

	document.addEventListener("touchstart", onTouch);
	document.addEventListener("touchend", onTouch);
	document.addEventListener("touchmove", onTouch);

	document.addEventListener("mouseover", onMouse);
	document.addEventListener("mousemove", onMouse);
	document.addEventListener("mousedown", onMouse);
	document.addEventListener("mouseup", onMouse);

	document.addEventListener("contextmenu", e => e.pointerType === "mouse" ? onMouse(e) : onTouch(e));

	document.getElementById("container").addEventListener("click", async e => { const target = e.currentTarget; await waitForFrame(); target.classList.remove("hide_ui") });

	document.addEventListener('keydown', (e) => {
		if (_isDownByKey[e.key]) {
			return;
		}
		_touchLastActive = false;
		_isDownByKey[e.key] = true;
		if (document.activeElement === document.body) {
			const controls = getControls();
			const action = controls[CONTROLS.InputToHotkey(e)];
			action && action(e);
		}
		else if (e.key === "Escape" && document.activeElement) {
			document.activeElement.blur();
		}
		ACTION_BAR.UpdateMods(e);
	});

	document.addEventListener('keyup', (e) => {
		_touchLastActive = false;
		switch (e.key && e.key.toUpperCase()) {
			case "SHIFT":
				CURSOR.instance.usingItem && CURSOR.instance.SetDefault();
				break;
		}
		_isDownByKey[e.key] = false;
		ACTION_BAR.UpdateMods(e);
	});

	function clearCache() {
		_controls = _hotkeysByLabel = null;
		_actionBarHotkeys.length = 0;
	}

	function getControls() {
		if (!_controls) {
			_controls = {};
			for (let i = 0; i < 7; i++) {
				const actionBarIndex = i;
				CONTROLS.GetActionBarHotkeys(i).forEach((arr, buttonIndex) => Array.isArray(arr) && arr.filter(o => o).forEach(hotkey => _controls[hotkey] = (e) => { ACTION_BAR.TriggerButton(e, actionBarIndex, buttonIndex); e.stopImmediatePropagation() }));
			}
			const hotkeysByLabel = CONTROLS.GetHotkeysByLabel();
			for (let label in hotkeysByLabel) {
				const action = _actionsByLabel[label] || noop;
				_controls[hotkeysByLabel[label]] = (e) => { action(); e.stopImmediatePropagation() };
			}
			return Object.assign(_controls, _systemActionsByInput);
		}
		return _controls;
	}

	function loadHotkeys() {
		try {
			const data = SETTINGS.Get("hotkeys");
			const hotkeys = data && JSON.parse(data);
			if (hotkeys && typeof hotkeys === "object") {
				for (let label in hotkeys) {
					hotkeys[label] = hotkeys[label].replace(/([^ ])\+([^ ])/g, '$1 + $2');
				}
			}
			return hotkeys;
		}
		catch { }
		return {};
	}

	function removeHotkeysFromActionBars(hotkeys, skipActionBarIndex = -1) {
		for (let i = 0; i < 6; i++) {
			if (i === skipActionBarIndex) {
				continue;
			}
			let changed = false;
			const arr = CONTROLS.GetActionBarHotkeys(i).slice();
			for (let n = 0; n < arr.length; n++) {
				if (Array.isArray(arr[n]) && arr[n].some(hotkey => hotkeys.includes(hotkey))) {
					arr[n] = arr[n].filter(hotkey => !hotkeys.includes(hotkey));
					changed = true;
				}
			}
			changed && SETTINGS.Set(`hotkeys_action_bar_${i}`, JSON.stringify(arr));
		}
	}

	function loadActionbarHotkeys(actionBarIndex) {
		try {
			const data = SETTINGS.Get(`hotkeys_action_bar_${actionBarIndex}`);
			const hotkeys = data && JSON.parse(data);
			if (Array.isArray(hotkeys)) {
				const arr = hotkeys.map(arr => Array.isArray(arr) ? Object.freeze(unique(arr)) : null);
				arr.length = actionBarIndex === 0 ? 15 : actionBarIndex === 3 ? 24 : 16;
				return Object.freeze(arr);
			}
		}
		catch { }
		return actionBarIndex === 0 ? _defaultActionBarHotkeys : empty;
	}
})();

