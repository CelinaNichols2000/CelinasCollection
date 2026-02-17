((window) => {
	const Cost = Object.freeze({
		None: 0,
		Action: 1,
		Spell: 2,
		Special: 4,
	});

	Cost.SpecialAction = Cost.Action | Cost.Special;
	Cost.SpecialSpell = Cost.Spell | Cost.Special;

	Object.freeze(Cost);

	const _actionsByName = new Map();
	const _desireActionsById = new Map();

	const _desireActions = [];
	const _desireActionLabels = {};

	const _itemActionsByItemId = {};

	const FailedCondition = {
		None: 0,
		Sexuality: 1,
		Filter: 2,
		MissingPenis: 4,
		MissingVagina: 8,
		MissingBreasts: 16,
		MissingPhallus: 32,
		MissingStrapOn: 64,
		ChastityPenis: 128,
		ChastityVagina: 256,
		ChastityButt: 512,
		Plugged: 1024,
		Gagged: 2048,
		Lactation: 4096,
		MissingClitoris: 8192,
		NotYearningToBeMilked: 16384,
		Hindered: 32768,
		Restrained: 65536,
		Quadruped: 131072,
		Blinded: 262144,
		BreastsTooSmall: 524288,
		MissingToes: 1048576,
		MissingArms: 2097152,
		MissingBalls: 4194304,
	};

	const _lambdaArgs = ["you", "they"];
	const _lambdaCache = new Map();

	const _objectCache = new Map();
	const _functionCache = new Map();

	let _pendingClear;
	let _inanimateActionsCache;

	const empty = [];

	ACTION = {
		Cost,
	};

	let _readyResolve;

	let _ready = new Promise(resolve => _readyResolve = resolve);

	let _characterDesireActions;
	let _opponentDesireActions;
	let _desireActionsCache;

	const lateClearCache = async () => LOCK.GetFirstBaton(_objectCache) && waitForFrame().then(() => { _objectCache.clear(); _functionCache.clear(); }).finally(() => LOCK.RemoveBaton(_objectCache));
	const getCharacterDesireActions = () => _characterDesireActions || (_characterDesireActions = _desireActions.filter(includesSelfcastTags));
	const getOpponentDesireActions = () => _opponentDesireActions || (_opponentDesireActions = _desireActions.filter(action => !includesSelfcastTags(action)));
	const getDesireActions = () => _desireActionsCache || (_desireActionsCache = Array.from(_desireActionsById.values()));
	const includesSelfcastTags = desireAction => desireAction.tags.includes("Masturbation") || desireAction.tags.includes("Suppress") || desireAction.tags.includes("Release");

	let Genitalia, Legs;

	ACTION.Action = function () {
		let _e;
		const [_label, _cost, , _enabled] = arguments;
		const _onclick = Array.isArray(arguments[2]) ? arguments[2].filter(o => o) : arguments[2];
		Object.defineProperties(this, {
			'label': { value: _label, writable: false },
			'cost': { value: _cost, writable: false },
			'enabled': typeof _enabled === "function" ? { get: _enabled } : { value: _enabled !== false, writable: false },
			'onclick': { value: _onclick, writable: false },
			'event': {
				get: () => _e || null,
				set: e => _e = e,
			},
		});
	};

	ACTION.UpdateItemActions = (obj) => {
		Object.assign(_itemActionsByItemId, obj);
		ACTION_BAR.RedrawItemActions();
	};

	ACTION.ClearItemActions = (itemIds) => Array.isArray(itemIds) && Object.keys(_itemActionsByItemId).forEach(itemId => !itemIds.includes(parseInt(itemId)) && (delete _itemActionsByItemId[itemId]));

	ACTION.GetItemActions = item_id => {
		const actions = getItemActions(item_id);
		if (actions.length > 0) {
			const item = GAME_MANAGER.instance.GetItem(item_id);
			const obj = { item_id, base: item.base, conditions: undefined };
			return actions.filter(action => MENU.Inventory.CheckActionConditions(item, action)).map(action => Object.assign({}, action, obj));
		}
		return actions;
	}

	ACTION.GetItemAction = (itemId, spellId, selfcast) => ACTION.GetItemActions(itemId).find(action => action.id === spellId && Boolean(action.selfcast) === selfcast);

	ACTION.HasInanimateActions = (spells) => {
		const item = GAME_MANAGER.instance.character.item;
		const actions = item && Array.isArray(item.inanimate_actions) && item.inanimate_actions;
		return actions && (spells === true ? actions.some(action => action.spell_cost) : spells === false ? actions.some(action => !action.spell_cost) : actions.length > 0);
	}

	ACTION.HasItemActions = itemId => {
		const actions = getItemActions(itemId);
		if (actions.length > 0) {
			const item = GAME_MANAGER.instance.GetItem(itemId);
			return actions.some(action => MENU.Inventory.CheckActionConditions(item, action));
		}
		return false;
	};

	const getItemActions = itemId => {
		const itemActions = _itemActionsByItemId[itemId] || empty;
		const enchantmentActions = GAME_MANAGER.instance.GetEnchantments(itemId).reduce((arr, e) => { e.actions && e.actions.length > 0 && arr.push(...e.actions); return arr }, []);
		return enchantmentActions.length > 0 ? [...itemActions.map(action => enchantmentActions.find(a => a.replace === action.id && Boolean(action.selfcast) === Boolean(a.selfcast)) || action), ...enchantmentActions.filter(action => !action.replace)] : itemActions;
	};

	const clearInanimateActionsCache = ACTION.ClearInanimateActionsCache = () => _inanimateActionsCache = null;

	ACTION.GetInanimateActions = (includeReactions = true) => {
		let output = _inanimateActionsCache;
		if (output) {
			return output;
		}
		try {
			output = [];
			const item = GAME_MANAGER.instance.character.item;
			const actions = item && Array.isArray(item.inanimate_actions) && item.inanimate_actions;
			if (actions && actions.length > 0) {
				const inanimate = true;
				const obj = GAME_MANAGER.instance.IsEquippedInanimate() ? { inanimate, conditions: undefined } : { inanimate, disabled: true, conditions: combineConditions(["you are not worn"]) };
				output.push(...actions.map(action => Object.assign({}, action, obj)));
			}
			includeReactions && output.push(...ACTION_BAR.choiceActionBar.actions.filter(action => action.inanimate));
			return output;
		}
		finally {
			_inanimateActionsCache = output;
			waitForFrame().then(clearInanimateActionsCache);
		}
	}

	ACTION.GetInanimateAction = (id, includeReactions) => ACTION.GetInanimateActions(includeReactions).find(a => a.id === id);

	ACTION.GetInanimateActionAsSpell = (id, includeReactions = true) => {
		const action = ACTION.GetInanimateAction(id, includeReactions);
		if (action) {
			const owner = GAME_MANAGER.instance.owner;
			const character = GAME_MANAGER.instance.character;
			const item = GAME_MANAGER.instance.GetItem(character.item.id);
			const image_url = action.image_url !== undefined ? insertNature(action.image_url, (owner || character).nature) : undefined;
			return Object.assign({}, action, { image_url, base: item.base });
		}
		return null;
	};

	ACTION.GetActionByName = fullyQualifiedName => _actionsByName.get(fullyQualifiedName) || null;

	ACTION.GetDesireAction = id => _desireActionsById.get(id) || null;

	ACTION.GetDesireActionAsync = async id => await _ready && _desireActionsById.get(id) || null;

	ACTION.GetDesireActionLabels = (desire, heartsByDesire, max, target) => {
		const character = window.GAME_MANAGER !== undefined && GAME_MANAGER.instance.character;
		const ref = nameToRef(desire.desire_name);

		target = target || character;

		let filteredActions = _desireActionLabels[ref] || (_desireActionLabels[ref] = Array.from(_desireActionsById.values()).filter(action => action.label && (action.label_for || action.desires)[ref] >= 1));
		filteredActions = filteredActions.filter(action => (!action.nature || character && action.nature === character.nature) && action.desires[ref] <= max);
		filteredActions = filteredActions.filter(action => Object.keys(action.desires).every(ref => heartsByDesire[ref] && heartsByDesire[ref] >= action.desires[ref]));

		if (filteredActions.length > 0) {
			filteredActions = filterActionsBySexuality(character, target, filteredActions);
		}

		filteredActions = filteredActions.filter((action, index) => filteredActions.findIndex(a => a.label === action.label) === index);

		return filteredActions.map(action => Object.assign({ points: action.desires[ref], label: action.label })).sort((a, b) => (a.points - b.points) || a.label.localeCompare(b.label));
	};

	function applyVariants(character, target, action) {
		let obj;
		const objects = getConditionObjects(character, target);
		const you = _functionCache.get(objects[1]) || _functionCache.set(objects[1], conditionFunctions.reduce((o, func) => { o[func.name] = (...args) => func.call(objects[1], ...args) === 0; return o }, {})).get(objects[1]);
		const they = _functionCache.get(objects[0]) || _functionCache.set(objects[0], conditionFunctions.reduce((o, func) => { o[func.name] = (...args) => func.call(objects[0], ...args) === 0; return o }, {})).get(objects[0]);
		const args = [you, they];
		for (const variant of action.variants) {
			if (variant.conditions(...args)) {
				obj = Object.assign(obj || Object.assign({}, action), variant);
			}
		}
		return obj ? Object.assign(obj, { conditions: action.conditions }) : action;
	}

	function getConditionObjects(character, target) {
		const objects = [target, character].map(character => {
			if (character) {
				let output = _objectCache.get(character);
				if (!output) {
					const chastity = getChastity(character);
					_objectCache.set(character, output = Object.assign({}, character, {
						chastity,
						quadruped: isQuadruped(character.body, character.body_flags),
						hindered: isHindered(character),
						blinded: isBlinded(character),
						restrained: isRestrained(character),
						hasPhallus: hasPhallus(character, chastity),
						plugged: isPlugged(character),
						gagged: isGagged(character),
					}));
					lateClearCache();
				}
				return output;
			}
			return empty;
		});
		return objects;
	}

	function getIsSexAllowed(character, target) {
		function isSexAllowed(a, b) {
			const sexuality = b.sexuality;
			if (hasFlag(sexuality, Sexuality.FM, Sexuality.FF, Sexuality.MM)) {
				const masculine = isMasculine(a.physique, a.breasts);
				const feminine = !masculine;

				const hasPenis = genitalia => hasFlag(genitalia, Genitalia.Penis, Genitalia.DormantPenis);
				const hasVagina = genitalia => hasFlag(genitalia, Genitalia.Vagina, Genitalia.DormantVagina);
				const countPhalli = (a, b) => (hasPenis(a.genitalia) ? 1 : 0) + (hasPenis(b.genitalia) ? 2 : 0)

				if (masculine !== isMasculine(b.physique, b.breasts)) {
					if (hasFlag(sexuality, Sexuality.FM)) {
						if (feminine && hasPenis(a.genitalia) && !hasFlag(sexuality, Sexuality.FM_FeminineWithPhallus)) {
							return false;
						}
						if (masculine && hasVagina(a.genitalia) && !hasFlag(sexuality, Sexuality.FM_MasculineWithVagina)) {
							return false;
						}
						return true;
					}
				}
				else if (feminine) {
					if (hasFlag(sexuality, Sexuality.FF)) {
						switch (countPhalli(a, b)) {
							case 3:
								return hasFlag(sexuality, Sexuality.FF_PhallusOnPhallus);
							case 2:
							case 1:
								return hasFlag(sexuality, Sexuality.FF_PhallusOnVagina);
							case 0:
								return true;
						}
					}
				}
				else if (hasFlag(sexuality, Sexuality.MM)) {
					switch (countPhalli(a, b)) {
						case 3:
							return true;
						case 2:
						case 1:
							return hasFlag(sexuality, Sexuality.MM_PhallusOnVagina);
						case 0:
							return hasFlag(sexuality, Sexuality.MM_VaginaOnVagina);
					}
				}
			}
			return false;
		}
		if (character !== target) {
			lateClearCache();
			const _sexAllowedCache = new Map();
			const map = _sexAllowedCache.get(character) || _sexAllowedCache.set(character, new Map()).get(character);
			return map.get(target) || map.set(target, [isSexAllowed(character, target) ? 0 : FailedCondition.Sexuality, 0]).get(target);
		}
		return [0, 0];
	}

	function filterActionsBySexuality(character, target, actions, returnFailedConditions = false) {
		const conditions = [[], []];
		const failedConditions = [0, 0];

		const objects = getConditionObjects(returnFailedConditions && character, target);

		const you = conditionFunctions.reduce((o, func) => { o[func.name] = (...args) => { conditions[1].push(func.name); failedConditions[1] |= func.call(objects[1], ...args); return true }; return o }, {});
		const they = conditionFunctions.reduce((o, func) => { o[func.name] = (...args) => { conditions[0].push(func.name); failedConditions[0] |= func.call(objects[0], ...args); return true }; return o }, {});
		const args = [you, they];

		const { filter, physique, breasts, sexuality } = target;
		const { transgender, sissification } = filter || empty;

		const masculine = isMasculine(physique, breasts) || target.token === character.token && hasFlag(sexuality, Sexuality.FM);
		const feminine = !masculine || target.token === character.token && hasFlag(sexuality, Sexuality.FM);

		const arr = returnFailedConditions && [];

		function validateSexuality(masculine, feminine) {
			if (conditions[0].includes("haveVagina")) {
				if (!(feminine && hasFlag(sexuality, Sexuality.FF, Sexuality.FM | Sexuality.FM_MasculineWithVagina) || masculine && hasFlag(sexuality, Sexuality.MM | Sexuality.MM_PhallusOnVagina, Sexuality.MM | Sexuality.MM_VaginaOnVagina))) {
					return false;
				}
				if (conditions[1].includes("haveVagina")) {
					if (!(hasFlag(sexuality, Sexuality.FM | Sexuality.FM_MasculineWithVagina) || feminine && hasFlag(sexuality, Sexuality.FF) || masculine && hasFlag(sexuality, Sexuality.MM | Sexuality.MM_VaginaOnVagina))) {
						return false;
					}
				}
				if (conditions[1].includes("havePhallus") || conditions[1].includes("havePenis") || conditions[1].includes("haveStrapOn")) {
					if (!(feminine && hasFlag(sexuality, Sexuality.FF | Sexuality.FF_PhallusOnVagina, Sexuality.FM | Sexuality.FM_FeminineWithPhallus | Sexuality.FM_MasculineWithVagina) || masculine && hasFlag(sexuality, Sexuality.FM, Sexuality.MM | Sexuality.MM_PhallusOnVagina))) {
						return false;
					}
				}
			}
			if (conditions[0].includes("havePhallus") || conditions[0].includes("havePenis") || conditions[0].includes("haveStrapOn")) {
				if (!(feminine && hasFlag(sexuality, Sexuality.FM, Sexuality.FF | Sexuality.FF_PhallusOnVagina, Sexuality.FF | Sexuality.FF_PhallusOnPhallus) || masculine && hasFlag(sexuality, Sexuality.MM, Sexuality.FM | Sexuality.FM_FeminineWithPhallus))) {
					return false;
				}
				if (conditions[1].includes("haveVagina")) {
					if (!(feminine && hasFlag(sexuality, Sexuality.FM, Sexuality.FF | Sexuality.FF_PhallusOnVagina) || masculine && hasFlag(sexuality, Sexuality.MM | Sexuality.MM_PhallusOnVagina, Sexuality.FM | Sexuality.FM_FeminineWithPhallus | Sexuality.FM_MasculineWithVagina))) {
						return false;
					}
				}
			}
			return true;
		}

		const sexAllowed = arr && getIsSexAllowed(character, target);

		actions = actions.filter(action => {
			conditions.forEach(arr => arr.length = 0);
			failedConditions.forEach((_, i) => failedConditions[i] = 0);
			typeof action.conditions === "function" && action.conditions(...args);
			if (character !== target && !validateSexuality(transgender || sissification || masculine, transgender || sissification || feminine)) {
				return false;
			}
			if (arr) {
				failedConditions[0] |= validateSexuality(masculine, feminine) ? 0 : FailedCondition.Sexuality;
				if (action.tags.includes("Lust")) {
					failedConditions[0] |= sexAllowed[0];
					failedConditions[1] |= sexAllowed[1];
				}
				arr.push(failedConditions.some(n => n > 0) ? failedConditions.slice() : null);
			}
			return true;
		});

		return returnFailedConditions ? [actions, arr] : actions;
	};

	ACTION.DesireActionToSpell = (action, validateDisabled = true) => {
		const target = DESIRE.ActionToTarget(action);
		const character = GAME_MANAGER.instance.character;
		action = Object.assign({}, action);
		if (typeof action.conditions === "string") {
			action.conditions = parseLambda(_lambdaArgs, action.conditions, _lambdaCache);
		}
		const actions = target && ACTION.GetDesireActions(target, target === character, null, action.id, [action]);
		if (actions && actions[0]) {
			action = actions[0];
			disabled = action.disabled || validateDisabled && !(_desireActions.some(a => a.id === action.id) || ACTION_BAR.choiceActionBar.actions.some(a => a.id === action.id));
		}
		else {
			disabled = true;
		}
		return Object.assign(action, { disabled, image_url: insertNature(action.image_url, (target || character).nature, character.nature) });
	};

	ACTION.GetDesireActionAsSpell = (id, validateDisabled = true) => {
		let disabled, action = _desireActionsById.get(id);
		if (action) {
			const target = DESIRE.ActionToTarget(action);
			const character = GAME_MANAGER.instance.character;
			const actions = target && ACTION.GetDesireActions(target, target === character, null, id, getDesireActions());
			if (actions && actions[0]) {
				action = actions[0];
				disabled = action.disabled || validateDisabled && !(_desireActions.some(a => a.id === action.id) || ACTION_BAR.choiceActionBar.actions.some(a => a.id === action.id));
			}
			else {
				disabled = true;
			}
			return Object.assign({}, action, { disabled, image_url: insertNature(action.image_url, (target || character).nature, character.nature) });
		}
		return null;
	}

	ACTION.GetDesireActions = (target, isSelf, filter, ids, filteredActions) => {
		const character = window.GAME_MANAGER !== undefined && GAME_MANAGER.instance.character;
		const hearts = DESIRE.GetMaxLevels(target);

		filteredActions = filteredActions || (isSelf ? getCharacterDesireActions() : getOpponentDesireActions());

		if (ids) {
			filteredActions = Array.isArray(ids) ? filteredActions.filter(action => ids.includes(action.id)) : filteredActions.filter(action => action.id === ids);
		}

		filteredActions.forEach((action, i) => Array.isArray(action.variants) && (filteredActions[i] = applyVariants(character, target, action)));

		if (filter) {
			filteredActions = filteredActions.filter(action => action.desires && action.desires[filter] !== undefined);
		}

		filteredActions = filteredActions.filter(action => !action.nature || character && action.nature === character.nature);
		filteredActions = filteredActions.filter(action => !action.desires || Object.keys(action.desires).every(ref => action.desires[ref] === 0 ? hearts[ref] !== undefined : action.desires[ref] <= (hearts[ref] || 0)));

		if (filteredActions.length > 0) {
			let failedConditions;
			[filteredActions, failedConditions] = filterActionsBySexuality(character, target, filteredActions, true);
			for (let i = 0; i < filteredActions.length; i++) {
				if (Array.isArray(failedConditions[i])) {
					const arr = [];
					failedConditions[i].forEach((flag, i) => {
						if ((flag & FailedCondition.MissingPenis) === FailedCondition.MissingPenis) {
							arr.push(getString(`${i ? "you" : "they"} don't have a penis`));
						}
						if ((flag & FailedCondition.MissingVagina) === FailedCondition.MissingVagina) {
							arr.push(getString(`${i ? "you" : "they"} don't have a vagina`));
						}
						if ((flag & FailedCondition.MissingBreasts) === FailedCondition.MissingBreasts) {
							arr.push(getString(`${i ? "you" : "they"} don't have breasts`));
						}
						if ((flag & FailedCondition.MissingToes) === FailedCondition.MissingToes) {
							arr.push(getString(`${i ? "you" : "they"} don't have toes`));
						}
						if ((flag & FailedCondition.MissingArms) === FailedCondition.MissingArms) {
							arr.push(getString(`${i ? "you" : "they"} don't have arms`));
						}
						if ((flag & FailedCondition.MissingPhallus) === FailedCondition.MissingPhallus) {
							arr.push(getString(`${i ? "you" : "they"} don't a phallus`));
						}
						if ((flag & FailedCondition.MissingStrapOn) === FailedCondition.MissingStrapOn) {
							arr.push(getString(`${i ? "you" : "they"} are not wearing a strap on`));
						}
						if ((flag & FailedCondition.MissingBalls) === FailedCondition.MissingBalls) {
							arr.push(getString(`${i ? "you" : "they"} don't have a penis with balls`));
						}
						if ((flag & FailedCondition.ChastityPenis) === FailedCondition.ChastityPenis) {
							arr.push(getString(`${i ? "your" : "their"} penis isn't available`));
						}
						if ((flag & FailedCondition.ChastityVagina) === FailedCondition.ChastityVagina) {
							arr.push(getString(`${i ? "your" : "their"} vagina isn't available`));
						}
						if ((flag & FailedCondition.ChastityButt) === FailedCondition.ChastityButt || (flag & FailedCondition.Plugged) === FailedCondition.Plugged) {
							arr.push(getString(`${i ? "your" : "their"} asshole isn't available`));
						}
						if ((flag & FailedCondition.Gagged) === FailedCondition.Gagged) {
							arr.push(getString(`${i ? "your" : "their"} mouth isn't available`));
						}
						if ((flag & FailedCondition.Lactation) === FailedCondition.Lactation) {
							arr.push(getString(`${i ? "you" : "they"} don't produce milk`));
						}
						if ((flag & FailedCondition.Sexuality) === FailedCondition.Sexuality) {
							arr.push(getString(`${i ? "your" : "their"} sexual preferences aren't met`));
						}
						if ((flag & FailedCondition.BreastsTooSmall) === FailedCondition.BreastsTooSmall) {
							arr.push(getString(`${i ? "your" : "their"} breasts are too small`));
						}
					})
					filteredActions[i] = Object.assign({}, filteredActions[i], { disabled: true, conditions: combineConditions(arr) });
				}
			}
		}

		return filteredActions;
	};

	ACTION.Load = async resourcePath => {
		if (Object.isFrozen(_desireActions) || LOCK.IsLocked(_desireActions)) {
			return;
		}
		await LOCK.Lock(_desireActions);
		try {
			({ Legs, Arms, Genitalia } = CHARACTER);
			const result = await fetch(resourcePath);
			if (result.ok) {
				const obj = await result.json();
				if (Array.isArray(obj.desire_actions)) {
					const formatOverlySensitive = overlySensitive => typeof overlySensitive === "string" ? overlySensitive.split(",").reduce((flags, str) => flags | OverlySensitive.FromString(str.trim()), 0) : typeof overlySensitive === "number" ? overlySensitive : 0;
					for (const action of obj.desire_actions.filter(action => action.id >= 1)) {
						if (action.actionbar !== undefined) {
							action.actionbar = Array.isArray(action.actionbar) ? action.actionbar : typeof action.actionbar === "string" ? action.actionbar.split(",").map(str => str.trim()) : [action.actionbar];
						}
						if (Array.isArray(action.description)) {
							action.description = action.description.join(action.description.join(" "));
						}
						if (action.label === "{action_name}") {
							action.label = action.action_name;
						}
						if (action.overly_sensitive !== undefined) {
							action.overly_sensitive = formatOverlySensitive(action.overly_sensitive);
						}
						if (action.conditions !== undefined) {
							action.conditions = parseLambda(_lambdaArgs, action.conditions);
						}
						action.tags = unique(Array.isArray(action.tags) ? action.tags : typeof action.tags === "string" ? action.tags.split(",").map(str => str.trim()) : empty);
						const listedAction = !action.tags.includes("Reaction");
						if (action.actions !== undefined && (typeof action.actions === "string" || Array.isArray(action.actions) && action.actions.length > 0) && !action.tags.includes("Options")) {
							action.tags.push("Options");
						}
						action.tags.sort();
						if (Array.isArray(action.variants)) {
							action.variants.forEach(variant => {
								if (variant.overly_sensitive !== undefined) {
									variant.overly_sensitive = formatOverlySensitive(variant.overly_sensitive);
								}
								variant.action_name && listedAction && _actionsByName.set(getFullyQualifiedName(action, variant), action);
								variant.conditions = parseLambda(_lambdaArgs, variant.conditions);
							});
						}
						if (action.desire_increases !== undefined) {
							action.desire_increases = Array.isArray(action.desire_increases) ? action.desire_increases : typeof action.desire_increases === "string" ? action.desire_increases.split(",").map(str => str.trim()) : empty;
							!action.menu_items && (action.menu_items = []);
							action.menu_items.push(getText("Can increase {0} {1} Desire", action.tags.includes("Masturbation") ? "your" : "their", combineDesires(action.desire_increases)));
						}
						deepFreeze(Object.assign(action, { image_url: action.image_url ? `/game/assets/${action.image_url}` : null, desire: true, action_cost: action.action_cost !== undefined ? action.action_cost : !action.tags.includes("Reaction") ? 1 : 0 }));
						if (listedAction) {
							_desireActions.push(action);
							_actionsByName.set(getFullyQualifiedName(action), action);
						}
						_desireActionsById.set(action.id, action);
					}
				}
				Object.freeze(_desireActions);
			}
			_readyResolve(true);
		}
		finally {
			LOCK.Unlock(_desireActions);
		}
	};

	function combineDesires(desires) {
		desires = desires.map(desire => firstToUpperCase(desire));
		return desires.length > 2 ? desires.map((desire, i) => i < desires.length - 1 ? desire : `and ${desire}`).join(", ") : desires.join(" and ");
	}

	function getChastity(character) {
		return character === GAME_MANAGER.instance.character ? GAME_MANAGER.instance.chastity : character.equipment && (character.equipment.items || character.equipment).reduce((chastity, item) => chastity | (item && item.base && item.base.chastity > 0 ? item.base.chastity : 0), 0);
	}

	function hasPenis(character, chastity) {
		return hasFlag(character.genitalia, Genitalia.Penis) && Chastity.IsPenisAvailable(chastity !== undefined ? chastity : getChastity(character));
	}

	function hasVagina(character, chastity) {
		return hasFlag(character.genitalia, Genitalia.Vagina) && Chastity.IsVaginaAvailable(chastity !== undefined ? chastity : getChastity(character));
	}

	function hasClitoris(character, chastity) {
		return hasVagina(character, chastity) && !hasFlag(character.genitalia, Genitalia.Penis);
	}

	function hasStrapOn(character) {
		return character === GAME_MANAGER.instance.character ? GAME_MANAGER.instance.WearingStrapOn() : character.equipment && (character.equipment.items || character.equipment).some(item => item && item.base && item.base.group === Group.StrapOn);
	}

	function hasPhallus(character, chastity) {
		return hasPenis(character, chastity) || hasStrapOn(character);
	}

	function isPlugged(character) {
		return character === GAME_MANAGER.instance.character ? GAME_MANAGER.instance.WearingPlug() : character.equipment && (character.equipment.items || character.equipment).some(item => item && item.base && item.base.group === Group.Plugs);
	}

	function isGagged(character) {
		return character === GAME_MANAGER.instance.character ? GAME_MANAGER.instance.WearingGag() : character.equipment && (character.equipment.items || character.equipment).some(item => item && item.base && item.base.group === Group.Gags);
	}

	const conditionFunctions = Object.freeze([
		function haveVagina() {
			return !hasFlag(this.genitalia, Genitalia.Vagina) ? FailedCondition.MissingVagina : !Chastity.IsVaginaAvailable(this.chastity) ? FailedCondition.ChastityVagina : 0;
		},
		function haveClitoris() {
			return !hasFlag(this.genitalia, Genitalia.Vagina) || hasFlag(this.genitalia, Genitalia.Penis) ? FailedCondition.MissingClitoris : !Chastity.IsVaginaAvailable(this.chastity) ? FailedCondition.ChastityVagina : 0;
		},
		function havePhallus() {
			return this.hasPhallus ? 0 : hasFlag(this.genitalia, Genitalia.Penis) && !Chastity.IsPenisAvailable(this.chastity) ? FailedCondition.ChastityPenis : FailedCondition.MissingPhallus;
		},
		function havePenis(failOnMissingBalls = false) {
			return !hasFlag(this.genitalia, Genitalia.Penis) ? FailedCondition.MissingPenis : failOnMissingBalls && hasFlag(this.genitalia, Genitalia.Vagina) ? FailedCondition.MissingBalls : !Chastity.IsPenisAvailable(this.chastity) ? FailedCondition.ChastityPenis : 0;
		},
		function haveStrapOn() {
			return this.hasPhallus && !hasFlag(this.genitalia, Genitalia.Penis) ? 0 : FailedCondition.MissingStrapOn;
		},
		function haveAss(failOnPlugged = true) {
			return (failOnPlugged && this.plugged ? FailedCondition.Plugged : 0) | (!Chastity.IsAssAvailable(this.chastity) ? FailedCondition.ChastityButt : 0);
		},
		function haveMouth(failOnGagged = true) {
			return failOnGagged && this.gagged ? FailedCondition.Gagged : 0;
		},
		function haveBreasts(size) {
			return this.breasts && breastsToSize(this.breasts) >= Math.max(size || 0, 1) ? 0 : size > 1 ? FailedCondition.BreastsTooSmall : FailedCondition.MissingBreasts;
		},
		function haveNipples() {
			return this.breasts && breastsToSize(this.breasts) >= 1 ? 0 : FailedCondition.MissingBreasts;
		},
		function maxBreastMilk() {
			return this.breasts && this.breasts[2] >= 1 ? 0 : FailedCondition.Lactation;
		},
		function haveLegs() {
			return this.hindered ? FailedCondition.Hindered : 0;
		},
		function haveFeet() {
			return this.hindered ? FailedCondition.Hindered : 0;
		},
		function haveToes() {
			return !Legs.HaveToes(this.legs) ? FailedCondition.MissingToes : this.hindered ? FailedCondition.Hindered : 0;
		},
		function haveArms() {
			return this.arms === Arms.Armless ? FailedCondition.MissingArms : this.quadruped ? FailedCondition.Quadruped : this.restrained ? FailedCondition.Restrained : 0;
		},
		function haveHands() {
			return this.quadruped ? FailedCondition.Quadruped : this.restrained ? FailedCondition.Restrained : 0;
		},
		function blinded() {
			return !this.blinded ? FailedCondition.Blinded : 0;
		},
		function kneeling() { return 0 },
		function standing() { return 0 },
		function supine() { return 0 },
	]);

	function isBlinded(character) {
		return character.status && Array.isArray(character.status.effects) && character.status.effects.some(effect => effect.status_name === "Blinded");
	}

	function isHindered(character) {
		return character.status && Array.isArray(character.status.effects) && character.status.effects.some(effect => effect.status_name === "Hindered");
	}

	function isRestrained(character) {
		return character.status && Array.isArray(character.status.effects) && character.status.effects.some(effect => effect.status_name === "Restrained");
	}

	window.hasPenis = hasPenis;
	window.hasStrapOn = hasStrapOn;
	window.hasPhallus = hasPhallus;
	window.hasVagina = hasVagina;
	window.hasClitoris = hasClitoris;
	window.isPlugged = isPlugged;
	window.isGagged = isGagged;

	function getFullyQualifiedName(action, variant) {
		const prefix = variant && variant.prefix || action.prefix;
		return `${prefix ? `${prefix}: ` : ''}${variant && variant.action_name || action.action_name}`;
	}
})(window);