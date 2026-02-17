((window) => {
	const Position = Object.freeze({
		Left: 0,
		Right: 1
	});

	const Animation = Object.freeze({
		Hit: "hit",
		Drop: "drop",
		Shrink: "shrink",
		HitFade: "hit_fade",
		HitShrink: "hit_shrink",
		HitDrop: "hit_drop",
		Transgender: "transgender",
	});

	const WORDS_PER_MINUTE = 100;
	const ERROR_MESSAGE_DURATION_MILLIS = 5000;
	const BACKGROUND_TRANSITION_DURATION = 1000;

	const _canvasList = [];

	let _mouseOverInanimate;

	GUI = {
		Position,
		Animation,
		WORDS_PER_MINUTE,
		ERROR_MESSAGE_DURATION_MILLIS,
		BACKGROUND_TRANSITION_DURATION,
		GetDurationMillis: text => Math.max(1200, 60000 / WORDS_PER_MINUTE * text.trim().split(/\s+/).length),
		Reflow: async function () { await waitForFrame(); window.scrollX },
	};

	let _instance;
	Object.defineProperty(GUI, 'instance', { get: () => _instance || (_instance = new Gui()) });

	function Gui() {
		const _preloader = document.getElementById("preloader");
		const _characters = document.getElementById("characters");
		const _dialog = document.getElementById("dialog");
		const _menu = document.getElementById("menu");
		const _options = document.getElementById("options");
		const _acquisition = document.getElementById("acquisition");
		const _actions = document.getElementById("actions");
		const _errorMessages = document.getElementById("error_messages");
		const _menus = document.getElementById("menus");
		const _tradeTab = _menus.getElementsByClassName("trade_tab");
		const _leftMenus = _menus.getElementsByClassName("left");
		const _rightMenus = _menus.getElementsByClassName("right");
		const _fullMenus = _menus.getElementsByClassName("full");

		const _preloaded = [];
		const _actionHubs = [];

		let _alert = null;
		let _alertResolve;

		let _isSayCommand = false;
		let _character = null

		let _mouseOverCharacter = -1;
		let _position = -1;
		let _start = 0;
		let _prevTime = 0;

		const _dialogList = _dialog.getElementsByTagName("li");

		let _craftingResolve;
		let _menuCancellable;

		let _parallaxEnabled = SETTINGS.Get("background_parallax", true);

		Object.defineProperties(this, {
			'dialogList': { value: Array.from(_dialogList), writable: false },
			'tradeTab': { get: () => _tradeTab[0] },
			'mouseOverCharacter': { get: () => _mouseOverCharacter },
			'alertDisplayed': { get: () => _alert && _alert.parentNode != null },
			'parallaxEnabled': {
				get: () => _parallaxEnabled,
				set: enabled => {
					_parallaxEnabled = enabled;
					SCENE.instance.OnParallaxChanged(enabled);
				}
			},
		});

		const updateCharacterMouseOver = (e, mouseOver) => {
			const div = e.currentTarget.getElementsByTagName("div")[0];
			div && div.classList.toggle("hover", mouseOver >= 0);
			if (_mouseOverCharacter !== mouseOver) {
				_mouseOverCharacter = mouseOver;
				ACTION_BAR.ClearMacroCache("@mouseover");
			}
		}

		Array.from(_characters.getElementsByTagName("li")).forEach((entry, i) => {
			entry.onmousemove = e => updateCharacterMouseOver(e, !e.defaultPrevented && GUI.instance.MouseOverCharacter(e) ? i : -1);
			entry.onmouseout = e => updateCharacterMouseOver(e, -1);
			entry.onclick = function (e) {
				if (CURSOR.instance.locked) {
					return;
				}

				const div = e.currentTarget.getElementsByTagName("div")[0];

				GUI.instance.CloseActionHubs();

				if (!div.classList.contains("hover")) {
					return this.onmousemove(e);
				}

				if (!GUI.instance.MouseOverCharacter(e)) {
					return;
				}

				const index = Math.min(1, getSiblingIndex(e.currentTarget));
				const dazed = GAME_MANAGER.instance.IsDazed();

				const x = e.pageX !== undefined ? e.pageX : e.targetTouches[0].pageX;
				const y = e.pageY !== undefined ? e.pageY : e.targetTouches[0].pageY;

				if (!_actionHubs[index] || _actionHubs[index].IsClosed()) {
					const { opponent, npc, faculty, explorable, freeVocalCast } = LOCATION.instance;
					const inanimate = Boolean(GAME_MANAGER.instance.character.item);
					if (index === 0) {
						let actions;
						if (inanimate) {
							const ignored = GAME_MANAGER.instance.OwnerIgnored();
							actions = [
								new ACTION.Action("Message", ACTION.Cost.None, () => MENU.Messages.Open(GAME_MANAGER.instance.owner.username)),
								new ACTION.Action("Inspect", ACTION.Cost.None, () => MENU.Inspect.Open(GUI.Position.Left, GAME_MANAGER.instance.owner.token)),
								new ACTION.Action("Profile", ACTION.Cost.None, () => window.open(`/character/${GAME_MANAGER.instance.owner.token}`)),
								new ACTION.Action(ignored ? "Unignore" : "Ignore", ACTION.Cost.None, () => GAME_MANAGER.instance.IgnoreOwner(!ignored)),
							];
						}
						else {
							if (inanimate) {
								return;
							}
							const vocalDisabled = STATUS.player.boosts.preventedActions && STATUS.player.boosts.preventedActions.includes("vocal");
							const vocalSpells = vocalDisabled ? [] : Object.values(GAME_MANAGER.instance.spells).filter(spell => spell.tags.includes("Vocal")).map(spell => spell.id);
							const isVocalSpellsEnabled = vocalSpells.length > 0 ? () => freeVocalCast || GAME_MANAGER.instance.actions.spells >= 1 : false;
							actions = [
								!npc && (!dazed || STATUS.player.mind > 0) &&
								new ACTION.Action("Vocal", ACTION.Cost.None, [
									vocalSpells.length > 0 && new ACTION.Action("Vocal", ACTION.Cost.Spell, [
										vocalSpells.includes(16) && new ACTION.Action("Seduce", ACTION.Cost.Spell, () => GAME_MANAGER.instance.Send("VoiceChat", { command: VOICE_CHAT.Command.Seduce }), isVocalSpellsEnabled),
										vocalSpells.includes(15) && new ACTION.Action("Silence", ACTION.Cost.Spell, () => GAME_MANAGER.instance.Send("VoiceChat", { command: VOICE_CHAT.Command.Silence }), isVocalSpellsEnabled),
										vocalSpells.includes(17) && new ACTION.Action("Intimidate", ACTION.Cost.Spell, () => GAME_MANAGER.instance.Send("VoiceChat", { command: VOICE_CHAT.Command.Intimidate }), isVocalSpellsEnabled),
									]),
									new ACTION.Action("Greet", ACTION.Cost.None, () => GAME_MANAGER.instance.Send("VoiceChat", { command: VOICE_CHAT.Command.Greet })),
									new ACTION.Action("Thank", ACTION.Cost.None, () => GAME_MANAGER.instance.Send("VoiceChat", { command: VOICE_CHAT.Command.Thank })),
									new ACTION.Action("Threaten", ACTION.Cost.None, () => GAME_MANAGER.instance.Send("VoiceChat", { command: VOICE_CHAT.Command.Threaten })),
									new ACTION.Action("Plead", ACTION.Cost.None, () => GAME_MANAGER.instance.Send("VoiceChat", { command: VOICE_CHAT.Command.Plead })),
									new ACTION.Action("Flirt", ACTION.Cost.None, () => GAME_MANAGER.instance.Send("VoiceChat", { command: VOICE_CHAT.Command.Flirt })),
								], !vocalDisabled),
								!dazed && new ACTION.Action("Action", ACTION.Cost.Spell, () => MENU.Spells.Open({ filter: ACTION.Cost.Spell })),
								!dazed && new ACTION.Action("Action", ACTION.Cost.Action, () => MENU.Spells.Open({ filter: ACTION.Cost.Action })),
							];
							if (!dazed && !opponent && explorable) {
								actions.push(new ACTION.Action(!GAME_MANAGER.instance.explored ? "Explore" : "Search", ACTION.Cost.Action, action => GAME_MANAGER.instance.Explore(action)));
							}
							if (opponent && !dazed || npc || faculty) {
								const leaveDisabled = STATUS.player.boosts.preventedActions && STATUS.player.boosts.preventedActions.includes("flee");
								actions.push(new ACTION.Action("Leave", opponent && GAME_MANAGER.instance.IsDazed(opponent.token) || faculty ? ACTION.Cost.None : ACTION.Cost.Action, () => GAME_MANAGER.instance.Send({ action: "Leave" }), !leaveDisabled));
							}
							if (LOCATION.instance.name === "Dormitory") {
								actions.push(new ACTION.Action("Stash", ACTION.Cost.None, () => MENU.Stash.Open(true)));
							}
						}
						_actionHubs[index] = new ACTION_HUB.ActionHub(x, y, SCENE.instance.GetCharacterNature(index), false, actions);
					}
					else if (opponent) {
						const ignored = GAME_MANAGER.instance.OpponentIgnored();
						let actions;
						if (inanimate) {
							actions = [new ACTION.Action("Message", ACTION.Cost.None, () => MENU.Messages.Open(opponent.username))];
						}
						else {
							const specialActions = LOCATION.instance.GetSpecialActions();
							actions = [
								!dazed && new ACTION.Action("Action", ACTION.Cost.Spell, () => MENU.Spells.Open({ target: opponent, filter: ACTION.Cost.Spell })),
								!dazed && new ACTION.Action("Action", ACTION.Cost.Action, () => MENU.Spells.Open({ target: opponent, filter: ACTION.Cost.Action })),
							];
							if (!dazed && specialActions && specialActions.options.length > 0) {
								const sex = specialActions.options.filter(action => action.type === 0);
								const inanimate = specialActions.options.filter(action => action.type === 1);
								actions.push(
									new ACTION.Action("Special", ACTION.Cost.SpecialAction, [
										sex.length > 0 && new ACTION.Action("Sex", ACTION.Cost.SpecialAction, () => MENU.Spells.ShowAsSpecial("Sex", sex, specialActions.tier)),
										inanimate.length > 0 && new ACTION.Action("Transformation", ACTION.Cost.SpecialSpell, () => MENU.Spells.ShowAsSpecial("Transformation", inanimate, specialActions.tier)),
									])
								);
							}
						}
						actions = actions.concat([
							new ACTION.Action("Inspect", ACTION.Cost.None, () => MENU.Inspect.Open(GUI.Position.Right, opponent.token)),
							new ACTION.Action("Profile", ACTION.Cost.None, () => window.open(`/character/${opponent.token}`)),
							!inanimate && new ACTION.Action("Trade", ACTION.Cost.None, () => MENU.Trade.TradeRequest(opponent.username)),
							new ACTION.Action(ignored ? "Unignore" : "Ignore", ACTION.Cost.None, () => GAME_MANAGER.instance.IgnoreOpponent(!ignored)),
						]);
						_actionHubs[index] = new ACTION_HUB.ActionHub(x, y, SCENE.instance.GetCharacterNature(index), true, actions);
					}
					else if (npc) {
						if (inanimate) {
							return;
						}
						const options = npc.options || [];
						const actions = [];
						for (let i = 0; i < options.length; i++) {
							let option = options[i];
							actions.push(new ACTION.Action(option.label, option.cost, () => GAME_MANAGER.instance.Send("Location", { interaction: option.event })));
						}
						_actionHubs[index] = new ACTION_HUB.ActionHub(x, y, npc.nature, true, actions);
					}
					e.target.classList.remove("hover");
				}
				else {
					e.target.classList.add("hover");
				}
			};
		});

		{
			const images = _preloader.getElementsByTagName("img");
			for (let i = 0; i < images.length; i++) {
				_preloaded.push(images[i].src);
			}

			const icons = document.getElementById("notification_icons");
			icons.getElementsByClassName("unread_messages")[0].onclick = () => MENU.Messages.Open();
			icons.getElementsByClassName("pending_revisions")[0].onclick = () => {
				window.open(`/character/${GAME_MANAGER.instance.character.token}`);
				this.SetPendingRevisions(0);
			};
			icons.getElementsByClassName("friend_requests")[0].onclick = () => MENU.Social.OpenFriends();
			icons.getElementsByClassName("online_friends")[0].onclick = () => MENU.Social.OpenFriends();
			icons.getElementsByClassName("roleplay_broadcasting")[0].onclick = () => MENU.Social.OpenScenarioCreation();

			const menuButtons = Array.from(_menu.getElementsByClassName("button"));

			menuButtons.find(b => b.classList.contains("menu")).onclick = (e) => DROPDOWN.instance.Open(e, [
				{ label: "Macros", onclick: () => MENU.Macros.Open() },
				{ label: "Messages", onclick: () => MENU.Messages.Open() },
				{ label: "Profile", onclick: () => window.open(`/character/${GAME_MANAGER.instance.character.token}`) },
				{ label: "Settings", onclick: () => MENU.Settings.Open() },
				{ label: "Skills", onclick: () => MENU.Skills.Open() },
				{ label: "Social", onclick: () => MENU.Social.Open() },
				{ label: "Exit", onclick: () => this.ExitAlert() },
				STANDALONE.client && { label: "Quit", onclick: () => this.QuitAlert() },
			]);

			menuButtons.find(b => b.classList.contains("character")).onclick = () => MENU.Myself.Toggle();
			menuButtons.find(b => b.classList.contains("location")).onclick = () => MENU.Location.Toggle();
			menuButtons.find(b => b.classList.contains("inventory")).onclick = () => MENU.Inventory.Toggle();
			menuButtons.find(b => b.classList.contains("spells")).onclick = () => MENU.Spells.Toggle();
		};

		_dialog.onclick = () => (MENU.Stash.menu || MENU.Trade.menu) && LOCAL_CHAT.player.Show();

		this.CloseActionHubs = (e) => {
			_actionHubs.filter(hub => hub && (e === undefined || !isDescendant(_actions, e.target))).forEach(hub => hub.Close());
			if (_menuCancellable) {
				this.HideMenu();
			}
		}

		this.CloseActionHub = position => _actionHubs[position] && _actionHubs[position].Close();

		container.addEventListener("click", this.CloseActionHubs);

		this.MouseOverCharacter = (e) => {
			let x = e.pageX !== undefined ? e.pageX : e.targetTouches[0].pageX;
			let y = e.pageY !== undefined ? e.pageY : e.targetTouches[0].pageY;

			let child = e.currentTarget;

			if (child.parentNode != _characters) {
				child = document.elementFromPoint(x, y);
				while (child.parentNode && child.parentNode != _characters) {
					child = child.parentNode;
				}
			}

			const index = Math.max(0, getSiblingIndex(child));
			const imageData = SCENE.instance.GetHoverImageData(index);

			if (
				!imageData || GAME_MANAGER.instance.InScenario() ||
				_actionHubs[index] && !(_actionHubs[index].IsClosed() || _actionHubs[index].IsClosing())
			) {
				return false;
			}

			const rect = child.getBoundingClientRect && child.getBoundingClientRect();
			if (rect) {
				y = Math.round(e.pageY - rect.y);
				x = Math.round((e.pageX - rect.x - imageData.width));
				x *= index === 0 ? -1 : 1;
				return imageData.data[(y * imageData.width + x) * 4 + 3] >= 128;
			}
			return false;
		}

		this.Alert = async (title, acceptLabel, cancelLabel = "Cancel", description = null) => new Promise(resolve => {
			title = title && removeTrailingDots(getString(title));
			description = description && removeTrailingDots(getString(description));

			if (!title) {
				return;
			}

			this.CloseAlert();

			document.activeElement.blur();

			_alert = document.createElement("div");
			_alert.id = "alert";
			_alertResolve = resolve;

			const wrapper = document.createElement("div");
			const buttons = document.createElement("div");
			buttons.className = "buttons";

			const div = document.createElement("div");
			div.innerHTML = title;
			wrapper.appendChild(div);

			if (description) {
				const desc = document.createElement("div");
				desc.innerHTML = description;
				desc.className = "description";
				wrapper.appendChild(desc);
			}

			const accept = document.createElement("div");
			accept.textContent = getString(acceptLabel);
			accept.onclick = () => { resolve(true); this.CloseAlert() };

			buttons.appendChild(accept);
			wrapper.appendChild(buttons);

			if (cancelLabel) {
				const cancel = document.createElement("div");
				cancel.textContent = getString(cancelLabel);
				cancel.onclick = () => this.CloseAlert();
				buttons.appendChild(cancel);
			}

			_alert.appendChild(wrapper);
			container.appendChild(_alert);
		});

		this.ExitAlert = async () => await this.Alert("Exit to character selection?", "Exit") && gotoCharacterSelection();

		this.QuitAlert = async () => await this.Alert("Quit game?", "Quit") && STANDALONE.Quit();

		this.CloseAlert = () => {
			try {
				_alertResolve && _alertResolve(false);
				if (_alert && _alert.parentNode) {
					_alert.parentNode.removeChild(_alert);
					return true;
				}
				return false
			}
			finally {
				_alertResolve = _alert = null;
			}
		}

		this.ShowMenu = async (options, cancellable) => {
			const ul = document.createElement("ul");

			_menuCancellable = false;

			clearHTML(_options);

			if (options.length == 0) {
				return;
			}

			ul.className = SCENE.instance.GetCharacterNature(GUI.Position.Left) || "";

			for (const option of options) {
				const li = document.createElement("li");

				if (typeof option === "string") {
					li.textContent = getString(option);
				}
				else {
					li.textContent = getString(option.label);

					if (option.isAction) {
						li.className = option.isSpell ? "spell" : "star";
						ul.classList.add("tokens");
					}

					if (option.isAction && GAME_MANAGER.instance.actions.actions < 1 || option.isSpell && GAME_MANAGER.instance.actions.spells < 1) {
						li.classList.add("disabled");
					}
				}

				ul.appendChild(li);
			}

			_options.appendChild(ul);
			const list = ul.getElementsByTagName("li");

			MENU.CloseAll();

			await GUI.Reflow();

			_options.style.top = `${50 - (ul.offsetHeight / container.offsetHeight) / 2 * 100}%`;

			container.classList.add("choice");
			_options.classList.remove("inactive");

			if (list.length > 0) {
				if (ul.offsetHeight > 0) {
					await transitionEnded(list[list.length - 1]);
				}

				_menuCancellable = cancellable;

				let index = -1;
				const onOptionClicked = async (elm) => index = getSiblingIndex(elm);

				for (const entry of Array.from(list)) {
					entry.onclick = () => onOptionClicked(entry);
				}

				await waitUntil(() => index >= 0 || _options.classList.contains("inactive"));
				await this.HideMenu();

				return index;
			}
		};

		this.HideMenu = async () => {
			if (_options.classList.contains("inactive")) {
				return;
			}
			_options.classList.add("inactive");
			await Promise.race([
				waitUntil(() => window.getComputedStyle(_options).display == "none"),
				transitionEnded(_options),
			]);
			container.classList.remove("choice");
		};

		this.ShowCrafting = async (params, item) => new Promise(resolve => {
			if (_craftingResolve) {
				_craftingResolve();
			}
			_craftingResolve = resolve;
			MENU.Crafting.Open(Object.assign(params, {
				item: item || GAME_MANAGER.instance.GetCraftingBench(), callback: response => {
					resolve(response);
					if (_craftingResolve == resolve) {
						_craftingResolve = null;
					}
				}
			}));
		});

		this.HideCrafting = () => {
			if (MENU.Crafting.menu) {
				const item = GAME_MANAGER.instance.GetCraftingBench();
				item ? MENU.Crafting.Open({ item }) : MENU.Crafting.Close();
			}
			_craftingResolve && _craftingResolve();
		};

		this.PreloadImage = async (source) => {
			const image = await loadImage(source);
			if (_preloaded.indexOf(source) < 0) {
				_preloaded.push(source);
				_preloader.appendChild(image);
			}
			return image;
		};

		this.UnloadUnusedAssets = () => {
			_preloaded.length = 0;
			clearHTML(_preloader);
		}

		this.SetCharacter = async (...args) => SCENE.instance.SetCharacter(...args);

		this.ShowCharacter = async (...args) => SCENE.instance.ShowCharacter(...args);

		this.HideCharacter = async (...args) => SCENE.instance.HideCharacter(...args);

		this.AnimateCharacter = async (...args) => SCENE.instance.AnimateCharacter(...args);

		this.MorphCharacter = async (...args) => SCENE.instance.MorphCharacter(...args);

		this.SetLocation = async (...args) => SCENE.instance.SetLocation(...args);

		this.UpdateLocation = async (...args) => SCENE.instance.UpdateLocation(...args);

		this.UpdateLocationBackground = async (...args) => SCENE.instance.UpdateLocationBackground(...args);

		this.LocationReady = async () => {
			const title = document.getElementById("location_title");
			if (title && title.getElementsByTagName("span").length < 2) {
				const span = document.createElement("span");
				const labels = ["Waiting for encounter", "Click to stop"];
				span.textContent = getString(labels[0]);
				title.appendChild(span);

				let prevOpacity = 0;
				let opacity = 0;
				let direction = 0;
				let prevDirection = 0;
				let i = 0;

				do {
					opacity = getComputedStyle(span).opacity;
					direction = opacity - prevOpacity;
					if (direction > 0 && prevDirection < 0) {
						i = (i + 1) % labels.length;
						span.textContent = getString(labels[i]);
					}
					prevOpacity = opacity;
					prevDirection = direction;
					await waitForFrame();
				}
				while (span && span.parentNode);
			}
		};

		this.SetTextParameters = (isSayCommand, character, position, start) => {
			_isSayCommand = isSayCommand;
			_character = character;
			_position = position;
			_start = start;
		};

		this.ShowText = async (text) => {
			const key = "HideDialog";
			const baton = LOCK.GetBaton(key);

			if (_isSayCommand) {
				let position;

				if (_character && typeof _character.GetSprite !== "function") {
					_character = new CHARACTER.Character(_character);
				}

				if (typeof _position === "number" && _position >= 0) {
					position = _position;
				}
				else if (typeof _character === "number") {
					position = _character;
				}
				else {
					position = SCENE.instance.CharacterToPosition(_character);
				}

				switch (position) {
					case GUI.Position.Left:
					case GUI.Position.Right:
						await this.HideDialog(-1);
						break;
					default:
						await Promise.all([
							this.HideDialog(GUI.Position.Left),
							this.HideDialog(GUI.Position.Right),
						]);
						break;
				}

				if (!LOCK.HasBaton(key, baton)) {
					return;
				}

				const start = _start;
				_start = 0;

				if (!GAME_MANAGER.instance.loot) {
					return new Promise(resolve => new DIALOG.Dialog(text, _dialogList[position + 1], _isSayCommand, start, resolve));
				}
				new DIALOG.Dialog(text, _dialogList[position + 1], _isSayCommand, start);
			}
			else {
				await Promise.all([
					this.HideDialog(GUI.Position.Left),
					this.HideDialog(GUI.Position.Right),
				]);
				if (!LOCK.HasBaton(key, baton)) {
					return;
				}
				if (!GAME_MANAGER.instance.loot) {
					return new Promise(resolve => new DIALOG.Dialog(text, _dialogList[0], false, 0, resolve));
				}
				new DIALOG.Dialog(text, _dialogList[0], false, 0);
			}
		};

		this.HideDialog = (position) => {
			let elm;
			if (position !== undefined) {
				if (!_dialogList[position + 1].classList.contains("inactive")) {
					elm = _dialogList[position + 1];
				}
				_dialogList[position + 1].classList.add("inactive");
			}
			else {
				for (let i = 0; i < _dialogList.length; i++) {
					if (!_dialogList[i].classList.contains("inactive")) {
						elm = _dialogList[i];
					}
					_dialogList[i].classList.add("inactive");
				}
			}
			LOCAL_CHAT.SetTypingIndicator(false, position);
			if (elm) {
				const baton = LOCK.GetBaton(elm);
				transitionEnded(elm).then(() => LOCK.HasBaton(elm, baton) && elm.classList.remove("chat"));
			}
			return elm != null;
		};

		this.OpenLocalChat = async () => Promise.all([LOCAL_CHAT.player.Show(), LOCAL_CHAT.opponent.Show()]);

		this.Acquired = async (label, category) => {
			let text, completed;

			switch (category) {
				case "spell":
					text = getString("You Learned a New Spell");
					break;
				case "skill":
					text = getString("You Learned a New Skill");
					break;
				case "action":
					text = getString("You Gained an Action");
					break;
				case "card":
					text = getString("You Received a New Card");
					break;
				case "location":
					text = getString("You Learned a New Location");
					break;
				case "crafting":
					text = getString("You Learned a New Recipe");
					break;
				default:
					return;
			}

			const elm = document.createElement("div");
			const labelElm = document.createElement("div");

			const bar = document.createElement("div");
			const barProgress = document.createElement("div");
			const barBackground = document.createElement("div");

			labelElm.className = "label";

			bar.className = "bar";
			barBackground.className = "background";
			barProgress.className = "progress";

			barBackground.appendChild(barProgress);
			bar.appendChild(barBackground);
			bar.appendChild(labelElm);

			elm.appendChild(bar);
			elm.className = "inactive";

			category && elm.classList.add(category);

			await LOCK.Lock(_acquisition);
			try {
				clearHTML(_acquisition);
				_acquisition.appendChild(elm);

				await GUI.Reflow();

				elm.classList.remove("inactive");

				labelElm.innerHTML = `<span>${text}</span>${label}`;

				const complete = () => completed = true;
				elm.onclick = complete;
				wait(GUI.GetDurationMillis(`${text} ${label}`) + 2000).then(complete);

				await waitUntil(() => completed);

				elm.classList.add("inactive");
				elm.classList.add("removed");

				await transitionEnded(elm);

				elm.parentNode && elm.parentNode.removeChild(elm);
			}
			finally {
				LOCK.Unlock(_acquisition);
			}
		};

		this.DisplayMessage = async function (message) {
			message = message.trim();

			while (message.endsWith(".")) {
				message = message.substr(0, message.length - 1);
			}

			const div = document.createElement("div");
			const subdiv = document.createElement("div");

			message = getString(message);
			subdiv.textContent = message;

			div.classList.add("inactive");
			div.appendChild(subdiv);
			_errorMessages.appendChild(div);

			await GUI.Reflow();
			div.classList.remove("inactive");

			await wait(Math.max(GUI.GetDurationMillis(message), ERROR_MESSAGE_DURATION_MILLIS));

			div.classList.add("inactive");
			await transitionEnded(div);

			div.parentNode && div.parentNode.removeChild(div);
		}

		this.SetUnreadMessages = (i) => {
			const elm = document.getElementById("notification_icons").getElementsByClassName("unread_messages")[0];
			elm.getElementsByTagName("div")[1].textContent = i;
			elm.classList.toggle("inactive", i == 0);
		};

		this.SetPendingRevisions = (i) => {
			const elm = document.getElementById("notification_icons").getElementsByClassName("pending_revisions")[0];
			elm.getElementsByTagName("div")[1].textContent = i;
			elm.classList.toggle("inactive", i == 0);
		};

		this.SetFriendRequests = (i) => {
			const elm = document.getElementById("notification_icons").getElementsByClassName("friend_requests")[0];
			elm.getElementsByTagName("div")[1].textContent = i;
			elm.classList.toggle("inactive", i == 0);
		};

		this.SetOnlineFriends = (i) => {
			const elm = document.getElementById("notification_icons").getElementsByClassName("online_friends")[0];
			elm.getElementsByTagName("div")[1].textContent = i;
			elm.classList.toggle("inactive", i == 0);
		};

		this.SetRoleplayBroadcasting = (b) => {
			const elm = document.getElementById("notification_icons").getElementsByClassName("roleplay_broadcasting")[0];
			elm.classList.toggle("inactive", !b);
		};

		this.SetItemForm = (elm, baseItem, canvasImage, pixelated) => {
			let imageData, loaded, prevMouseOver = false;

			if (!baseItem) {
				return;
			}

			const baton = LOCK.GetBaton(elm);

			const w = baseItem.width > 1 ? 256 : 128;
			const h = 256;

			const canvas = drawCanvas(elm, w, h, { resize: () => loaded && img.onload() });
			canvas.style.display = "none";
			canvas.className = "inanimate";

			const index = 2;
			const ctx = canvas.getContext('2d', { willReadFrequently: true });
			const img = new Image();

			img.onload = () => {
				const kernel = [-1, -1, 0, -1, 1, -1, -1, 0, 1, 0, -1, 1, 0, 1, 1, 1];
				const thickness = 2;
				const width = canvas.width - thickness * 2;
				const height = canvas.height - thickness * 2;
				const scale = (height / width > img.height / img.width ? width / img.width : height / img.height);
				const x = (canvas.width - img.width * scale) * 0.5;
				const y = thickness;

				ctx.imageSmoothingEnabled = !pixelated;

				for (let i = 0; i < kernel.length; i += 2) {
					ctx.drawImage(img, x + kernel[i] * thickness, y + kernel[i + 1] * thickness, img.width * scale, img.height * scale);
				}

				ctx.globalCompositeOperation = "source-in";
				ctx.fillStyle = "#343434";
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				ctx.globalCompositeOperation = "source-over";
				ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

				imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

				if (LOCK.HasBaton(elm, baton)) {
					revealCanvas(canvas);
					LOCK.RemoveBaton(elm);
				}

				loaded = true;
			}

			img.onerror = () => img.src = formatMediaURL("/game/assets/spells/missing.png", powCeil(256 * getMediaScale()));

			img.src = canvasImage;
			img.crossOrigin = "Anonymous";

			const mouseOver = (e) => {
				if (!imageData || GAME_MANAGER.instance.InScenario()) {
					return;
				}

				const rect = canvas.getBoundingClientRect();
				const scale = getCanvasScale(canvas);

				let x = (e.pageX !== undefined ? e.pageX : e.targetTouches[0].pageX) - rect.x;
				let y = (e.pageY !== undefined ? e.pageY : e.targetTouches[0].pageY) - rect.y;

				x = Math.round(x * scale);
				y = Math.round(y * scale);

				return clamp(x, 0, imageData.width) === x && clamp(y, 0, imageData.height) === y && imageData.data[(y * imageData.width + x) * 4 + 3] >= 128;
			}

			const combat_log = document.getElementById("combat_log");

			combat_log.onmouseleave = canvas.onmouseleave = () => {
				canvas.classList.remove("hover");
				if (prevMouseOver) {
					prevMouseOver = !prevMouseOver;
					TOOLTIP.instance.Hide();
				}
			};
			combat_log.onmousemove = canvas.onmousemove = (e) => {
				if ((!_actionHubs[index] || _actionHubs[index].IsClosed()) && mouseOver(e)) {
					canvas.classList.add("hover");
					if (!prevMouseOver) {
						prevMouseOver = !prevMouseOver;
						const item = GAME_MANAGER.instance.character.item;
						if (item) {
							TOOLTIP.instance.ShowItem(Object.assign({}, e, { target: canvas }), Object.assign({}, item, { base: GAME_MANAGER.instance.GetBaseItem(item) }));
						}
					}
					e.preventDefault();
					return false;
				}
				combat_log.onmouseleave(e);
			};

			_mouseOverInanimate = e => {
				if (document.body.contains(canvas) && mouseOver(e)) {
					canvas.onclick(e);
					return true;
				}
				return false;
			};

			canvas.onclick = (e) => {
				if (!mouseOver(e)) {
					return;
				}
				if (!_actionHubs[index] || _actionHubs[index].IsClosed()) {
					const item = GAME_MANAGER.instance.character.item;
					const x = e.pageX !== undefined ? e.pageX : e.targetTouches[0].pageX;
					const y = e.pageY !== undefined ? e.pageY : e.targetTouches[0].pageY;
					const actions = [
						new ACTION.Action("Action", ACTION.Cost.Spell, () => MENU.Spells.Open({ filter: ACTION.Cost.Spell }), ACTION.HasInanimateActions(true)),
						new ACTION.Action("Action", ACTION.Cost.Action, () => MENU.Spells.Open({ filter: ACTION.Cost.Action }), ACTION.HasInanimateActions(false)),
						!item.character.permanent ? new ACTION.Action("Give In", ACTION.Cost.None, async () => {
							if (await GUI.instance.Alert("Are you sure you want to give in?", "Give In", "Cancel", "You won't be able to turn back and you will be completely at the mercy of your whoever owner")) {
								GAME_MANAGER.instance.Send("Form", { giveIn: true });
							}
						}) : new ACTION.Action("Escape", ACTION.Cost.None, async () => {
							if (await GUI.instance.Alert("Are you sure you want to escape?", "Escape", "Cancel", "You will be dropped from your owner and be completely at the mercy of whoever finds you. You cannot escape until your owner has been offline for 7 days and you leave behind any variants and magical properties")) {
								GAME_MANAGER.instance.Send("Form", { escape: true });
							}
						}, !item.character.sealed),
						new ACTION.Action("Turn Back", ACTION.Cost.None, async () => {
							if (await GUI.instance.Alert("Are you sure you want to turn back?", "Turn Back", "Cancel", "You will return to your room immediately in the form you had before you become inanimate")) {
								GAME_MANAGER.instance.Send("Form", { turnBack: true });
							}
						}, !item.character.permanent),
					];
					_actionHubs[index] = new ACTION_HUB.ActionHub(x, y, GAME_MANAGER.instance.character.nature, false, actions);
					canvas.classList.remove("hover");
				}
				else {
					canvas.classList.add("hover");
				}
				e.preventDefault();
				return false;
			};
		};

		this.MouseOverInanimate = e => _mouseOverInanimate && _mouseOverInanimate(e);

		this.UpdateUIPositions = () => {
			TEXT_LOG.Resize();
			TUTORIAL.Redraw();
		};

		this.Resize = () => {
			SCENE.Resize();
			STATUS.Resize();
			TEXT_LOG.Resize();
			TUTORIAL.Resize();
			COUNTDOWN.Resize();
			LOCAL_CHAT.Resize();
			ACTION_BAR.Resize();
			DYNAMIC_AVATAR.Resize();
			_canvasList.forEach(c => c.resize());
		};

		this.Update = (time) => {
			const deltaTime = time - _prevTime;
			const now = Date.now();

			for (let i = _canvasList.length - 1; i >= 0; i--) {
				if (!document.body.contains(_canvasList[i].canvas)) {
					_canvasList[i].delete && _canvasList[i].delete();
					_canvasList.splice(i, 1);
					continue;
				}
				_canvasList[i].update && _canvasList[i].update(deltaTime);
			}

			if (_options.firstChild) {
				_options.style.top = `${50 - (_options.firstChild.offsetHeight / container.offsetHeight) / 2 * 100}%`;
			}

			_actionHubs[0] && _actionHubs[0].Update(now);
			_actionHubs[1] && _actionHubs[1].Update(now);
			_actionHubs[2] && _actionHubs[2].Update(now);

			DYNAMIC_AVATAR.Update(deltaTime);
			SCENE.Update(deltaTime, _parallaxEnabled);

			VOICE_CHAT.Update(now);
			COUNTDOWN.Update(now);
			ACTION_BAR.Update(now);
			STATUS.Update(now);

			LOCAL_CHAT.Update(time);

			MENU.Update();
			MENU.Spells.Update();
			MENU.Messages.Update();

			if (container.classList.contains("menu_left") && _leftMenus.length == 0) {
				container.classList.remove("menu_left")
			}

			if (container.classList.contains("menu_right") && _rightMenus.length == 0) {
				container.classList.remove("menu_right")
			}

			if (container.classList.contains("menu_full") && _fullMenus.length == 0) {
				container.classList.remove("menu_full")
			}

			_prevTime = time;
		};
	};

	function removeTrailingDots(str) {
		while (str && str.charAt(str.length - 1) === ".") {
			str = str.substr(0, str.length - 1);
		}
		return str;
	}

	function getCanvasScale(canvas) {
		const obj = canvas && _canvasList.find(obj => obj.canvas === canvas);
		return obj ? obj.scale : getMediaScale() / getContainerScale();
	}

	function drawCanvas(parent, w, h, o) {
		const canvas = document.createElement("canvas");

		const resize = () => {
			const containerScale = getContainerScale();
			const mediaScale = getMediaScale();
			canvas.style.width = `${w * containerScale}px`;
			canvas.style.height = `${h * containerScale}px`;
			canvas.width = w * mediaScale;
			canvas.height = h * mediaScale;
			base.resize && base.resize();
			obj.scale = mediaScale / containerScale;
		};

		const base = {};
		const obj = Object.assign({}, o, { canvas, resize, scale: 1 });

		_canvasList.push(obj);

		resize();

		o && o.resize && (base.resize = o.resize);

		parent.appendChild(canvas);

		return canvas;
	}

	function revealCanvas(canvas) {
		if (canvas.parentNode) {
			Array.from(canvas.parentNode.getElementsByTagName("canvas")).forEach(c => c !== canvas && c.parentNode.removeChild(c));
			canvas.style.display = "";
		}
	}

	window.drawCanvas = drawCanvas;
	window.getCanvasScale = getCanvasScale;
	window.revealCanvas = revealCanvas;
})(window);
