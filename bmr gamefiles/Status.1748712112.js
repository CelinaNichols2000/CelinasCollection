(() => {
	const OverlySensitive = {
		Breasts: 1,
		Mouth: 2,
		Butt: 4,
		Cock: 8,
		Pussy: 16,
	}

	STATUS = {
		OverlySensitive,
		UpdateDetails: (input) => {
			const details = input || SETTINGS.Get("status_bar_details", "all");
			document.getElementById("status").className = details == "none" ? "" : details == "all" ? "text numbers" : details;
			document.getElementById("status_effects").classList.toggle("text", details === "all" || details === "text");
			STATUS.Resize();
		},
		RedrawEffects: () => _list.forEach(status => status.RedrawEffects()),
		Hide: () => _list.forEach(status => status.Hide()),
		Show: () => _list.forEach(status => status.Show()),
		Update: now => _list.forEach(status => status && status.Update(now)),
		Resize: () => _list.forEach(status => status && status.Resize()),
	};

	Object.defineProperties(STATUS, {
		'player': { get: () => _list[0] },
		'opponent': { get: () => _list[1] },
	});

	const _list = [];

	const emptyBoosts = Object.freeze({});

	function Status() {
		const [_onclick] = arguments;

		const _index = _list.length;

		const _elm = document.getElementById("status").getElementsByTagName("li")[_index];
		const _effectElm = document.getElementById("status_effects").getElementsByTagName("li")[_index];

		const _status = _elm.getElementsByClassName("status")[0];
		const _tokens = _elm.getElementsByClassName("tokens")[0];
		const _radials = _tokens && _tokens.getElementsByClassName("radial");
		const _text = _tokens && Array.from(_tokens.getElementsByClassName("text"));

		const _bars = {};
		const _duration = {};

		const _timers = [];

		for (const label of ["body", "mind", "lust"]) {
			const bar = _elm.getElementsByClassName(label)[0];
			const fill = bar.getElementsByClassName("fill")[0];
			const text = bar.getElementsByClassName("text")[0];
			_bars[label] = { fill, text };
		}

		const _obj = {};
		const _owner = _index === 0 ? {} : null;

		let _displayOwner = false;

		let _tooltip;
		let _tokenTooltip;
		let _effectTooltip;
		let _resize;

		Object.defineProperties(this, {
			'timers': { value: _timers, writable: false },
			'body': { get: () => _obj.body || 0 },
			'mind': { get: () => _obj.mind || 0 },
			'lust': { get: () => _obj.lust || 0 },
			'mindless': { get: () => _obj.lust >= 1 || _obj.mind !== undefined && _obj.mind < 1 },
			'ownerMindless': { get: () => _owner && (_owner.lust >= 1 || _owner.mind !== undefined && _owner.mind < 1) },
			'boosts': { get: () => _obj.boosts || emptyBoosts },
		});

		if (_tokens) {
			const spells = _tokens.getElementsByClassName("spells")[0];
			const actions = _tokens.getElementsByClassName("actions")[0];
			actions.ontouchstart = actions.onmouseenter = (e) => _tokenTooltip = TOOLTIP.instance.ShowActionTokens(e, _displayOwner);
			spells.ontouchstart = spells.onmouseenter = (e) => _tokenTooltip = TOOLTIP.instance.ShowSpellTokens(e, _displayOwner);
			spells.onclick = () => {
				const obj = { position: GUI.Position.Right, target: false, isSelf: true, onlySpellActions: true };
				MENU.Spells.Compare(obj) ? MENU.Spells.Close() : MENU.Spells.Open(obj);
			}
			actions.onclick = () => {
				const obj = { position: GUI.Position.Right, target: false, isSelf: true, onlySpellActions: false };
				MENU.Spells.Compare(obj) ? MENU.Spells.Close() : MENU.Spells.Open(obj);
			}
		}

		const getDisplayObject = () => _displayOwner ? _owner : _obj;

		_status.ontouchstart = _status.onmouseenter = (e) => _tooltip = TOOLTIP.instance.ShowStatus(e, getDisplayObject());
		_status.onclick = _onclick || null;

		this.Show = () => {
			toggleLustVisible(getDisplayObject().lust * 100 >= 1);
			_elm.classList.remove("inactive");
			_effectElm.classList.remove("inactive");
		};

		this.Hide = () => {
			if (_index === 0 && MENU.Inspect.menu && MENU.Inspect.menu.classList.contains("player")) {
				return;
			}
			_elm.classList.add("inactive");
			if (_index === 1) {
				_effectElm.classList.add("inactive");
				clearDurations();
			}
		}

		this.UpdateStatus = function (status, owner) {
			const obj = owner && _owner || _obj;
			const prevLust = obj.lust;
			const prevMindless = this.mindless;

			if (status.lust !== undefined) {
				status.lust = status.lust > 0 ? Math.floor(clamp(status.lust * 100, 1, 100)) / 100 : 0;
			}

			const o = extractProps(status, "body", "mind", "maxBody", "maxMind", "lust", "minLust");
			const changed = Object.keys(o).some(key => (obj[key] !== undefined || key === "lust") && obj[key] !== o[key]);

			Object.assign(obj, o);

			Object.keys(o).length > 0 && this.RedrawStatus();

			changed && this.Show();

			if (status.effects && (!obj.effects || JSON.stringify(status.effects) !== JSON.stringify(obj.effects))) {
				const preventedActions = obj.boosts && obj.boosts.preventedActions || [];

				obj.effects = status.effects.slice().sort((a, b) => (a.active !== false) == (b.active !== false) ? (a.order || 0) - (b.order || 0) : a.active === false ? 1 : -1);

				obj.boosts = calculateBoosts(obj.effects);

				this.RedrawEffects();

				if (preventedActions.length != (obj.boosts.preventedActions ? obj.boosts.preventedActions.length : 0) || (obj.boosts.preventedActions ? obj.boosts.preventedActions.some(action => !preventedActions.includes(action)) : preventedActions.length > 0)) {
					MENU.Spells.Redraw();
				}
			}

			if (_index === 0) {
				if (!_displayOwner) {
					if (obj.lust > prevLust && obj.lust * 100 >= 1) {
						TUTORIAL.TriggerTip(TUTORIAL.Lust);
					}
				}
				if (!owner) {
					container.classList.toggle("blind", _obj.effects && _obj.effects.some(effect => effect.status_name === "Blinded") || false);
				}
			}

			if (this.mindless !== prevMindless) {
				ACTION_BAR.ClearMacroCache("mindless");
			}

			const { bodyPerSecond, mindPerSecond, lustPerSecond } = status;

			statusInterval(obj, bodyPerSecond, mindPerSecond, lustPerSecond);

			return changed;
		}

		const statusInterval = async (obj, bodyPerSecond, mindPerSecond, lustPerSecond) => {
			let timestamp, deltaTime = 0;
			const baton = LOCK.GetBaton(obj);
			if (!bodyPerSecond && !mindPerSecond && !lustPerSecond) {
				return;
			}
			do {
				prevMindless = this.mindless;
				obj.body = clamp(obj.body + bodyPerSecond * deltaTime, 0, obj.maxBody);
				obj.mind = clamp(obj.mind + mindPerSecond * deltaTime, 0, obj.maxMind);
				obj.lust = clamp(obj.lust + lustPerSecond * deltaTime, obj.minLust, 1);
				this.RedrawStatus();
				if (this.mindless !== prevMindless) {
					ACTION_BAR.ClearMacroCache("mindless");
				}
				timestamp = Date.now();
				await waitForFrame();
				deltaTime = (Date.now() - timestamp) / 1000;
				if (bodyPerSecond > 0 && obj.body < obj.maxBody) {
					continue;
				}
				if (mindPerSecond > 0 && obj.mind < obj.maxMind) {
					continue;
				}
				if (lustPerSecond > 0 && obj.lust < 1) {
					continue;
				}
				if (lustPerSecond < 0 && obj.lust > obj.minLust) {
					continue;
				}
				break;
			}
			while (LOCK.HasBaton(obj, baton));
		};

		this.DisplayOwnerStatus = displayOwner => {
			if (_displayOwner != Boolean(displayOwner && _owner)) {
				_displayOwner = !_displayOwner;
				this.RedrawStatus();
				this.RedrawEffects();
			}
		}

		this.RedrawStatus = () => {
			const obj = getDisplayObject();
			const lust = roundChance(clamp(obj.lust || 0, obj.minLust || 0, 1) * 100);

			_bars.body.fill.style.width = `${clamp01((obj.body || 0) / (obj.maxBody || 1)) * 100}%`;
			_bars.mind.fill.style.width = `${clamp01((obj.mind || 0) / (obj.maxMind || 1)) * 100}%`;
			_bars.lust.fill.style.width = `${clamp01(obj.lust || 0) * 100}%`;

			_bars.body.text.textContent = Math.floor(obj.body || 0);
			_bars.mind.text.textContent = Math.floor(obj.mind || 0);
			_bars.lust.text.textContent = lust == 100 ? getString("Max") : lust;

			toggleLustVisible(lust >= 1);

			if (_tooltip) {
				_tooltip.getElementsByClassName("lust")[0].textContent = getText("Lust: {0}", lust >= 100 ? getString("Max") : lust);
				_tooltip.getElementsByClassName("body")[0].textContent = getText("Body: {0}/{1}", Math.floor(obj.body), Math.floor(obj.maxBody));
				_tooltip.getElementsByClassName("mind")[0].textContent = getText("Mind: {0}/{1}", Math.floor(obj.mind), Math.floor(obj.maxMind));
			}
		}

		this.RedrawTokens = () => {
			if (!_tokens) {
				return;
			}
			const actions = GAME_MANAGER.instance.actions;
			const setting = SETTINGS.Get("status_bar_icons", "progress_bars");
			for (let i = 0; i < _radials.length; i++) {
				const radial = _radials[i].getElementsByTagName("div")[0];
				const tokens = Math.max(0, i == 0 ? actions.spells : actions.actions);
				const color = `#${i == 0 ? "6985f2" : "dc702f"}`;
				const maxTokens = Math.max(1, i == 0 ? actions.maxSpells : actions.maxActions);
				switch (setting) {
					case "no_icons":
						break;
					case "static_icons":
						radial.style.background = color;
						break;
					default:
						const ratio = (tokens % 1) * 100;
						const maxRatio = Math.floor(tokens) === Math.floor(maxTokens) ? (maxTokens % 1) * 100 : 100;
						radial.style.background = `conic-gradient(${color} ${ratio}%, rgba(0, 0, 0, 0.5) ${ratio}%, rgba(0, 0, 0, 0.5) ${maxRatio}%, rgba(255, 255, 255, 0.5) 0)`;
						break;
				}
				_tokens.classList.toggle("no_icons", setting === "no_icons");
				_text[i].textContent = SETTINGS.Get("status_bar_max_actions", true) ? `${Math.floor(tokens)}/${Math.floor(maxTokens)}` : Math.floor(tokens);
			}
			if (_tokenTooltip) {
				const actionTokens = _tokenTooltip.getElementsByClassName("actions")[0];
				const spellTokens = _tokenTooltip.getElementsByClassName("spells")[0];
				actionTokens && (actionTokens.textContent = getText("Actions: {0}/{1}", actions.actions.toFixed(2), actions.maxActions.toFixed(2)));
				spellTokens && (spellTokens.textContent = getText("Spells: {0}/{1}", actions.spells.toFixed(2), actions.maxSpells.toFixed(2)));
			}
		}

		this.RedrawEffects = async (paddingUnit) => {
			if (LOCK.IsLocked(this)) {
				return;
			}
			await LOCK.Lock(this);
			try {
				await waitForFrame();

				const targets = (_index === 0 ? [GAME_MANAGER.instance.character, GAME_MANAGER.instance.owner] : [LOCATION.instance.opponent]);
				const targetsCount = targets.reduce((acc, target) => target ? acc + 1 : acc, 0);
				const displayNameplates = _index === 0 ? targetsCount > 1 || SETTINGS.Get("nameplates_display_own", false) : SETTINGS.Get("nameplates_display_opponent", true);

				_timers.length = 0;

				if (isDescendant(_effectElm, TOOLTIP.instance.trigger)) {
					TOOLTIP.instance.Hide();
				}

				clearHTML(_effectElm);

				targets.forEach((_, i) => {
					const obj = i === 0 ? _obj : _owner;
					if (obj && obj.collapsed && !displayNameplates) {
						obj.collapsed = false;
					}
				});

				if (!displayNameplates && (!_obj.effects || _obj.effects.length === 0)) {
					_effectElm.classList.add("inactive");
					clearDurations();
					return;
				}

				paddingUnit = typeof paddingUnit === "number" ? paddingUnit : getPaddingUnit();

				if (_index === 0 || !_elm.classList.contains("inactive")) {
					if (_effectElm.classList.contains("inactive")) {
						_effectElm.classList.remove("inactive");
						clearDurations();
					}
				}

				const containerScale = container.getBoundingClientRect().width / 1280;
				const marginUnit = 5.12 * containerScale;
				const heightUnit = (10.238 + 12.8) * containerScale;

				let offsetY = 0;

				targets.forEach((target, i) => {
					if (!target) {
						return;
					}

					const obj = i === 0 ? _obj : _owner;
					const collapsed = obj.collapsed;

					const effects = !collapsed && obj.effects || [];
					const l = Math.max(1, effects.length);

					const width = clamp(targetsCount > 1 ? 0 : (_effectElm.offsetWidth - marginUnit * (l - 1) * 0.5) / Math.max(1, l), (heightUnit * 3 - marginUnit) / 2 / 2220 * 1900, heightUnit * 2 / 2220 * 1900);
					const height = width / 1900 * 2220;
					const horizontal = width + marginUnit * 0.5;
					const vertical = height + marginUnit;

					const mediaScale = powCeil(height * 0.9225 * window.devicePixelRatio);
					const fontScale = height / (heightUnit * 2);
					const columns = Math.floor((_effectElm.offsetWidth + marginUnit * 0.5 + paddingUnit) / horizontal);

					const countdowns = effects.length > 0 ? GAME_MANAGER.instance.GetCountdowns(target.token) : [];

					if (offsetY > 0 && !collapsed) {
						offsetY += marginUnit * 0.5;
					}

					function drawEffect(i) {
						const elm = document.createElement("div");
						const frame = document.createElement("div");
						const icon = document.createElement("div");

						frame.style.height = `${height}px`;
						frame.style.width = `${width}px`;
						frame.appendChild(icon);
						elm.appendChild(frame);

						const rowWidth = Math.min(l, columns) * horizontal - marginUnit * 0.5;
						const rowIndex = Math.floor(i / columns);

						elm.style.left = _index === 0 ? `${horizontal * (i % columns)}px` : `${horizontal * (i % columns) + Math.max(_effectElm.offsetWidth - rowWidth)}px`;
						elm.style.bottom = `${vertical * rowIndex + offsetY}px`;
						elm.style.fontSize = `${fontScale}em`;

						_effectElm.appendChild(elm);

						return [elm, frame, icon];
					}

					if (effects.length === 0) {
						if (!collapsed) {
							const [elm] = drawEffect(0);
							elm.className = "effect inactive empty";
						}
					}
					else {
						effects.forEach((effect, i) => {
							const [elm, frame, icon] = drawEffect(i);

							elm.className = "effect";
							elm.classList.toggle("inactive", effect.active === false);
							elm.classList.toggle("buff", effect.buff === true);
							elm.classList.toggle("debuff", effect.buff === false);

							const pixelated = effect.nsfw && SETTINGS.Get("sfw", false);
							icon.style.backgroundImage = `url(${formatMediaURL(insertNature(effect.image_url, target.nature), pixelated ? 16 : mediaScale)})`;
							icon.style.imageRendering = pixelated ? "pixelated" : null;

							frame.ontouchstart = frame.onmouseenter = (e) => _effectTooltip = TOOLTIP.instance.ShowStatusEffect(e, effect, _index === 1, countdowns, target.nature);

							if (effect.active !== false && effect.countdown !== undefined) {
								const radial = document.createElement("div");
								radial.className = "radial";
								frame.appendChild(radial);
								const text = (effect.rank > 1) == false && SETTINGS.Get("status_effect_timers", true) && document.createElement("div");
								if (text) {
									text.className = "timer";
									elm.appendChild(text);
								}
								_timers.push({ position: _index, text, radial, countdown: effect.countdown, countdowns });
							}

							if (effect.rank > 1 || effect.max_rank === true) {
								const maxRank = effect.max_rank === true || effect.rank >= effect.max_rank;
								const rank = document.createElement("div");
								rank.className = "rank" + (maxRank ? " max" : '');
								rank.textContent = maxRank ? getString("Max") : convertToRoman(effect.rank);
								elm.appendChild(rank);
							}

							_index === 0 && effect.clickable && (elm.onclick = () => GAME_MANAGER.instance.Send("Status", { statusId: effect.id }));
						});
					}

					const nameplate = displayNameplates && drawNameplate(_effectElm, target, _index === 1 && SETTINGS.Get("nameplates_display_filter", false));
					offsetY += nameplate && collapsed ? 0 : vertical * Math.floor(Math.max(1, effects.length - 1) / columns + 1);
					if (nameplate) {
						nameplate.style.bottom = `${offsetY}px`;
						nameplate.onclick = () => { obj.collapsed = !obj.collapsed; this.RedrawEffects() };
						offsetY += nameplate.offsetHeight + marginUnit;
					}
				})

				for (const prop in _duration) {
					if (!_timers.some(timer => timer.countdown === prop)) {
						_duration[prop] = 0;
					}
				}

				_timers.length > 0 && this.Update();
			}
			finally {
				LOCK.Unlock(this);
			}
		}

		this.Update = now => {
			const time = now || Date.now();
			if (_timers.length > 0) {
				for (const timer of _timers) {
					timer.prevRatio = timer.ratio;
					if (getRemainingTime(timer.countdown, time, timer) && timer.ratio % 100 > 0) {
						const s = Math.max(0, timer.remainingTime / 1000);
						const text = s < 1 ? s.toFixed(1) : s < 60 ? Math.floor(s) : s < 60 * 60 ? `${Math.floor(s / 60)}m` : `${Math.floor(s / 60 / 60)}h`;
						if (timer.prevtext !== text) {
							timer.text.textContent = text;
							timer.prevtext = text;
						}
						timer.ratio !== timer.prevRatio && (timer.radial.style.background = `conic-gradient(#000 ${timer.ratio}%, transparent ${timer.ratio}%`);
						continue;
					}
					timer.text.textContent = '';
					timer.radial.style.background = "transparent";
				}
			}
			if (_effectTooltip) {
				for (const timer of TOOLTIP.instance.timers) {
					timer.elm.textContent = getRemainingTime(timer.countdown, time, timer) && timer.ratio % 100 > 0 ? TOOLTIP.GetStatusRemainingTime(timer.remainingTime / 1000) : '';
				}
			}
			_resize && this.Resize();
		};

		this.Resize = () => {
			const paddingUnit = getPaddingUnit();
			if (_tokens) {
				const mind = _status.getElementsByClassName("mind")[0];
				const body = _status.getElementsByClassName("body")[0];
				const spells = _tokens.getElementsByClassName("spells")[0];
				const actions = _tokens.getElementsByClassName("actions")[0];

				spells.style.left = `${mind.offsetLeft + mind.offsetWidth}px`;
				spells.style.top = `${mind.offsetTop}px`;
				spells.style.height = `${Math.ceil(body.offsetHeight * 2)}px`;

				actions.style.left = `${body.offsetLeft + body.offsetWidth}px`;
				actions.style.top = `${body.offsetTop}px`;
				actions.style.height = `${Math.ceil(body.offsetHeight * 2)}px`;

				for (let i = 0; i < _radials.length; i++) {
					_radials[i].style.width = `${Math.ceil(1.1062 * body.offsetHeight * 2)}px`;
					_radials[i].style.height = `${body.offsetHeight * 2}px`;
				}

				let maxWidth = spells.offsetWidth;

				_resize = maxWidth == 0 || paddingUnit == 0;

				const temp = _text[0].textContent;
				for (let i = 1; i <= 9; i++) {
					_text[0].textContent = SETTINGS.Get("status_bar_max_actions", true) ? `${i}/${i}` : i;
					maxWidth = Math.max(maxWidth, spells.offsetWidth);
					_resize = _resize || spells.offsetWidth == 0;
				}
				_text[0].textContent = temp;

				_effectElm.style.left = `${maxWidth + paddingUnit + mind.parentNode.offsetLeft + mind.offsetLeft + mind.offsetWidth}px`;
			}
			this.RedrawEffects(paddingUnit);
		};

		const clearDurations = () => Object.keys(_duration).forEach(key => _duration[key] = 0);

		const toggleLustVisible = visible => _bars.lust.text.parentNode.classList.toggle("inactive", !visible);

		function getRemainingTime(type, now, timer) {
			const countdown = timer.countdowns && timer.countdowns.find(countdown => countdown.type === type);
			if (countdown) {
				const remainingTime = countdown.timeout - now;
				const duration = _duration[type] || (_duration[type] = getDuration(type, countdown.timeout - now));
				remainingTime > duration && (_duration[type] = remainingTime);
				timer.remainingTime = remainingTime;
				timer.duration = duration;
				timer.ratio = Math.round(clamp01(1 - remainingTime / duration) * 1000) / 10;
				return true;
			}
			return false;
		}

		this.Resize();

		_list[_index] = this;
	};

	function getDuration(countdown, remainingTime) {
		switch (countdown) {
			case "recentlyDefeated":
			case "recentlyTransformed":
			case "toughBuff":
			case "pureBuff":
			case "cunningBuff":
			case "curiousBuff":
			case "sexyBuff":
				return 15 * 60 * 1000;
			case "dazed":
				return 45 * 1000;
			default:
				return remainingTime;
		}
	}

	function drawNameplate(parent, character, showFilter) {
		const nameplate = document.createElement("div");
		nameplate.className = `nameplate ${character.nature || ''}`;
		nameplate.ontouchstart = nameplate.onmouseenter = (e) => TOOLTIP.instance.ShowNameplate(e, character);

		const subdiv = document.createElement("div");

		const characterName = document.createElement("span");
		characterName.className = "character_name";

		if (character.status && character.status.roleplaying) {
			const span = document.createElement("span");
			span.className = "roleplaying";
			characterName.appendChild(span);
			nameplate.classList.add("roleplaying");
		}

		if (character === GAME_MANAGER.instance.character && GAME_MANAGER.instance.IsEquippedInanimate()) {
			const span = document.createElement("span");
			span.className = "equipped";
			characterName.appendChild(span);
			nameplate.classList.add("equipped");
		}

		characterName.appendChild(document.createTextNode(character.names));
		subdiv.appendChild(characterName);

		const username = document.createElement("span");
		username.textContent = character.username;
		username.style.color = character.username_color;
		username.style.display = isAnonymousUsername(character.username) ? "none" : "";
		subdiv.appendChild(username);

		nameplate.appendChild(subdiv);

		if (showFilter && character.filter) {
			toggleFilter(drawFilter(nameplate, character, true, false), character.filter, character.sexuality);
		}

		parent.appendChild(nameplate);
		return nameplate;
	}

	function getPaddingUnit() {
		return parseFloat(window.getComputedStyle(document.getElementById("status")).paddingLeft.split("px")[0]);
	}

	function calculateBoosts(effects) {
		const arr = effects ? effects.reduce((arr, effect) => { arr.push(effect); effect.menuItems && arr.push(...effect.menuItems); return arr; }, []) : [];
		return Object.freeze(arr.map(effect => effect.boosts).filter(o => o).reduce((obj, boosts) => {
			for (let prop in boosts) {
				switch (prop) {
					case "minFumble":
						obj.minFumble = Math.max(obj.minFumble || 0, boosts[prop]);
						break;
					case "preventedActions":
					case "forcedActions":
						obj[prop] = unique((obj[prop] || []).concat(boosts[prop]));
						break;
					case "orgasm":
						obj[prop] = boosts[prop] | (obj[prop] || 0);
						break;
					default:
						obj[prop] = prop.endsWith("Mod") ? boosts[prop] * (obj[prop] || 1) : boosts[prop] + (obj[prop] || 0);
						break;
				}
			}
			return obj;
		}, {}));
	}

	document.addEventListener("DOMContentLoaded", function (e) {
		STATUS.UpdateDetails();
		new Status(() => GAME_MANAGER.instance.owner ? MENU.Inspect.Toggle(GUI.Position.Left, GAME_MANAGER.instance.owner.token) : MENU.Myself.Toggle(GUI.Position.Left));
		new Status(() => MENU.Inspect.Toggle(GUI.Position.Right, LOCATION.instance.opponent ? LOCATION.instance.opponent.token : null));
	});

})();
