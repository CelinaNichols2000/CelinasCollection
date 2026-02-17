((window) => {
    const COOLDOWN_DURATION = 3000;

    const bulkTypes = ["talisman", "dye", "charm", "material", "component", "scroll"];

    const findItemSlot = /^\s*(\d+)(?:\s+(\d+))?\s*$/;
    const findMetaCommand = /^\s*\#(show(?:tooltip)?)[^\S\r\n]*((?:\[[^\]]*\]\s*)+)?(.+)?$/gm;
    const findLabelParameter = /\(([^\)]+)\)(?:\((\d+)\))?\s*$/;

    const validateMetaCommand = new RegExp(findMetaCommand, "");

    const _fallbackData = [];
    const _macroFallbackData = [];

    const _childElements = new Map();
    const _stackImages = new Map();
    const _macroTooltips = new Map();
    const _macroImagesById = new Map();
    const _conditionsByMacroId = new Map();
    const _macroItemCache = new Map();
    const _macroSpellCache = new Map();

    const _macroIcons = [];
    const _macroIconsById = new Map();

    const _list = [];
    const _spells = [];
    const _macros = [];
    const _radials = [];

    const _actionBars = document.getElementById("action_bars");
    const _floatingActionBars = document.getElementById("floating_action_bars");
    const _actionBarGroups = [_actionBars, _floatingActionBars];

    const _mods = Object.seal({ altKey: false, ctrlKey: false, shiftKey: false });

    const noop = () => { };

    const empty = [];

    let _timestamp = false;
    let _locked = false;
    let _preventClick = false;
    let _readyResolve;

    let _ready = new Promise(resolve => _readyResolve = resolve);

    const SpellType = Object.freeze({
        None: 0,
        Spell: 1,
        SpellOption: 4,
        SpellVariant: 2,
        SpellVariantOption: 7,
        SpellSpecial: 3,
        SelfcastSpell: 5,
        SelfcastSpellOption: 9,
        SelfcastSpellVariant: 6,
        SelfcastSpellVariantOption: 8,
        Item: 10,
        ItemAction: 11,
        ItemActionOption: 14,
        SelfcastItemAction: 12,
        SelfcastItemActionOption: 15,
        InanimateAction: 13,
        BaseItem: 20,
        BaseItemAndColor: 21,
        Macro: 30,
        ActionDesire: 40,
        IsSelfcast: type => {
            switch (type) {
                case SpellType.SelfcastSpell:
                case SpellType.SelfcastSpellOption:
                case SpellType.SelfcastSpellVariant:
                case SpellType.SelfcastSpellVariantOption:
                case SpellType.SelfcastItemAction:
                case SpellType.SelfcastItemActionOption:
                    return true;
                default:
                    return false;
            }
        }
    });

    let _choiceActionBar;

    ACTION_BAR = {
        SpellType,
        COOLDOWN_DURATION,
        Toggle: (index, enable) => {
            const actionBar = _list[index];
            actionBar && actionBar.Toggle(enable);
        },
        SetLayout: (index, size, oversized) => {
            const actionBar = _list[index];
            actionBar && actionBar.SetLayout(size, oversized);
        },
        ReplaceItemId: (prevItemId, itemId) => {
            let spell;
            const barIndice = [];
            for (let i = 0; i < _spells.length; i += 2) {
                switch (_spells[i]) {
                    case SpellType.Item:
                        spell = _spells[i + 1];
                        if (spell && spell.id === prevItemId) {
                            spell.id = itemId;
                            barIndice.push(Math.floor(i / 24));
                        }
                        break;
                }
            }
            unique(barIndice).forEach(barIndex => saveBarData(barIndex));
        },
        EditLayout: async (e, index) => {
            const actionBar = _list[index];
            if (actionBar) {
                await INPUT.instance.ShowAsActionbarLayoutAsync(e, index, actionBar.size, actionBar.oversized, index);
                actionBar.CommitLayout();
            }
        },
        TriggerButton: (e, index, buttonIndex) => {
            const actionBar = _list[index];
            actionBar && actionBar.Button(e, buttonIndex);
        },
        ChoiceActive: () => _choiceActionBar && _choiceActionBar.enabled || false,
        ValidateItem: (itemIds) => _choiceActionBar && _choiceActionBar.ValidateItem(itemIds),
        SetChoiceActions: async actions => {
            await _ready;
            _choiceActionBar.SetActions(actions);
            ACTION_BAR.Redraw(true);
            MENU.Macros.RedrawIcons();
            GUI.instance.UpdateUIPositions();
        },
        DisplayItemOptions: async itemId => {
            await _ready;
            const actions = ACTION.GetItemActions(itemId);
            actions.length > 0 && _choiceActionBar.DisplayOptions(actions);
        },
        DisplaySpellOptions: async (spell, selfcast, onHideOptions) => {
            await _ready;
            const obj = { selfcast: Boolean(selfcast), options: null };
            let filteredOptions = spell.options.map(o => Object.assign({}, spell, o, obj));
            if (spell.item_id) {
                const item = GAME_MANAGER.instance.GetItem(spell.item_id);
                filteredOptions.forEach((o, i) => {
                    o.action_conditions = o.action_conditions || null;
                    if (o.desire) {
                        filteredOptions[i] = ACTION.DesireActionToSpell(o);
                    }
                    else if (o.conditions !== undefined) {
                        delete o.conditions;
                    }
                });
                filteredOptions = item ? filteredOptions.filter(option => MENU.Inventory.CheckActionConditions(item, option)) : [];
            }
            _choiceActionBar.DisplayOptions(filteredOptions, onHideOptions);
        },
        Redraw: (redrawMacros = false) => {
            redrawMacros && clearMacroCache();
            _stackImages.clear();
            _list.forEach(actionBar => actionBar.Redraw());
        },
        RedrawMacros: () => {
            clearMacroCache();
            _list.forEach(actionBar => actionBar.RedrawMacros());
        },
        RedrawDesireActions: () => {
            ACTION_BAR.RedrawMacros();
            _list.forEach(actionBar => actionBar.RedrawDesireActions());
        },
        RedrawInanimateActions: () => {
            ACTION_BAR.RedrawMacros();
            _list.forEach(actionBar => actionBar.RedrawInanimateActions());
        },
        RedrawItemActions: () => {
            ACTION_BAR.RedrawMacros();
            _list.forEach(actionBar => actionBar.RedrawItemActions());
        },
        TriggerGlobalCooldown: timestamp => _timestamp = timestamp,
        ResetGlobalCooldown: () => _timestamp !== false && (_timestamp = 0),
        SetSpells: async (spells, macroData) => {
            await _ready;
            _macros.length = 0;
            _macros.push(...textToMacros(macroData));
            const specialOptions = getSpecialOptions();
            for (let i = 0; i < spells.length; i += 2) {
                const type = spells[i];
                const value = spells[i + 1];
                _spells[i] = type;
                if (loadSpell(i, type, value, specialOptions)) {
                    continue;
                }
                const spellId = Array.isArray(value) ? value[0] : value;
                if (spellId && typeof spellId === "number") {
                    _spells[i + 1] = getFallbackSpell(i / 2, type, spellId, value);
                    continue;
                }
                _spells[i + 1] = 0;
            }
            MENU.Macros.Redraw();
            ACTION_BAR.Redraw();
        },
        Update: now => {
            if (_timestamp !== false) {
                if (_timestamp > now) {
                    const remainingTime = _timestamp - now;
                    const ratio = clamp01(1 - remainingTime / COOLDOWN_DURATION) * 100;
                    const background = `conic-gradient(#000 ${ratio}%, transparent ${ratio}%`;
                    _radials.forEach(radial => radial.style.background = background);
                    return;
                }
                _radials.forEach(radial => radial.style.background = "transparent");
                _timestamp = false;
            }
        },
        Resize: () => _list.forEach(entry => entry.enabled && entry.Redraw()),
        Lock: lock => _locked = Boolean(lock),
        ShowEmpty: (show = true) => _actionBarGroups.forEach(elm => elm.classList.toggle("show_empty", show || false)),
        AlwaysShow: (show = true) => _actionBarGroups.forEach(elm => elm.classList.toggle("always_show", show || false)),
        CreateMacro: () => {
            if (_macros.length < 55) {
                let id = 1;
                while (_macros.some(arr => arr[0] === id)) {
                    id++;
                }
                _macros.push([id]);
                return saveMacroData();
            }
            return false;
        },
        MacroToSpell: macro => {
            const icon = ACTION_BAR.GetMacroIcon(macro[1]);
            const spell = { id: macro[0], icon: macro[1], macro_name: macro[2], nsfw: icon && icon.nsfw, image_url: icon && icon.image_url || undefined, macro: macro[3] };
            !icon && (spell.image_url = getMacroImage(spell));
            return spell;
        },
        GetMacroIconsAsync: async () => await _ready && _macroIcons,
        GetMacroIcon: iconId => iconId && _macroIcons.find(icon => icon.id === iconId) || null,
        MacroIdToIndex: id => {
            for (let i = 0; i < _macros.length; i++) {
                if (_macros[i][0] === id) {
                    return i;
                }
            }
            return -1;
        },
        GetMacro: index => _macros[index] ? _macros[index].slice() : null,
        GetMacroByName: macroName => {
            macroName = macroName && macroName.trim();
            return macroName && _macros.find(arr => arr[2] === macroName);
        },
        SaveMacro: (index, icon, name, input) => {
            if (clamp(index, 0, _macros.length - 1) === index) {
                const arr = _macros[index];
                arr[1] = icon;
                arr[2] = name.trimEnd();
                arr[3] = input.trimEnd();
                const macroId = arr[0];
                _macroTooltips.delete(macroId);
                updateMacroFallbackData(macroId, SpellType.None);
                _list.forEach(actionBar => actionBar.ReloadMacro(macroId));
                return saveMacroData();
            }
            return false;
        },
        DeleteMacro: (index) => {
            if (clamp(index, 0, _macros.length - 1) === index) {
                const macroId = _macros[index][0];
                _macros.splice(index, 1);
                _macroTooltips.delete(macroId);
                updateMacroFallbackData(macroId, SpellType.None);
                _list.forEach(actionBar => actionBar.RemoveMacro(macroId));
                return saveMacroData();
            }
            return false;
        },
        SwapMacros: (a, b) => {
            if (a !== b && clamp(a, 0, _macros.length - 1) === a && clamp(b, 0, _macros.length - 1) === b) {
                const tmp = _macros[a];
                _macros[a] = _macros[b];
                _macros[b] = tmp;
                return saveMacroData();
            }
            return false;
        },
        UpdateMods: e => {
            const { altKey, ctrlKey, shiftKey } = e;
            if (_mods.altKey !== altKey || _mods.ctrlKey !== ctrlKey || _mods.shiftKey != shiftKey) {
                Object.assign(_mods, { altKey, ctrlKey, shiftKey });
                ACTION_BAR.ClearMacroCache("mod");
            }
        },
        ClearMacroCache: (...args) => {
            let changed = false;
            for (const macroId of _conditionsByMacroId.keys()) {
                const conditions = _conditionsByMacroId.get(macroId);
                if (args.some(condition => conditions.includes(condition))) {
                    _macroTooltips.delete(macroId);
                    changed = true;
                }
            }
            if (changed) {
                _macroItemCache.clear();
                _macroSpellCache.clear();
                _list.forEach(actionBar => actionBar.RedrawMacros());
                MENU.Macros.RedrawIcons(); ""
            }
        },
        TriggerMacro: (e, macro) => {
            const defaultChannel = LOCAL_CHAT.player.channel;
            let suppressErrors = false;
            for (let line of macro ? macro.split(/\r?\n/) : empty) {
                let channel = defaultChannel;
                if (validateMetaCommand.test(line)) {
                    continue;
                }
                if ((line = line.trim()).charAt() === "#") {
                    suppressErrors = suppressErrors || /^#suppresserrors(\s|$)/.test(line);
                    continue;
                }
                if (!(line = line && insertProperties(line).trim())) {
                    continue;
                }
                const command = findCommand(line);
                if (command) {
                    switch (command[0]) {
                        case "say":
                        case "s":
                        case "ooc":
                        case "o":
                        case "emote":
                        case "em":
                        case "me":
                        case "e":
                            channel = command[0].charAt() === "s" ? LOCAL_CHAT.Channel.Say : command[0].charAt() === "o" ? LOCAL_CHAT.Channel.OOC : LOCAL_CHAT.Channel.Emote;
                            line = line.substr(command[0].length + 1).trim();
                            break;
                        case "cast":
                            const conditions = validateCommand(e, command[0], command[1]);
                            if (conditions === false) {
                                continue;
                            }
                            return runCommand(e, command, suppressErrors);
                        default:
                            runCommand(e, command, suppressErrors);
                            continue;
                    }
                }
                GAME_MANAGER.instance.Send("LocalChat", { message: line, channel });
            }
        },
        ValidateUseBaseItem: validateUseBaseItem,
        MacroLabelToSpell: macroLabelToSpell,
        MacroLabelToItem: macroLabelToItem,
    };

    Object.defineProperties(ACTION_BAR, {
        'macros': { get: () => _macros.map(arr => arr.slice()) },
        'macrosCount': { get: () => _macros.length },
        'macroIcons': { get: () => Object.isFrozen(_macroIcons) ? _macroIcons : null },
        'choiceActionBar': { get: () => _choiceActionBar },
    });

    function ActionBar() {
        const [elm, width, height] = arguments;
        const buttons = [];
        const actionBarIndex = _list.length;
        elm.classList.add("action_bar");

        let _size = 1;
        let _oversized = false;
        let _enabled = false;

        _list.push(this);

        {
            const size = width * height;
            switch (actionBarIndex) {
                case 0:
                case 2:
                case 4:
                    const a = actionBarIndex === 0 ? 5 : 8;
                    const b = actionBarIndex === 0 ? a * 2 : a;
                    for (let i = 0; i < size; i++) {
                        buttons[b - Math.floor(i / a) * a + i % a] = drawActionBarButton(elm, _childElements);
                    }
                    break;
                default:
                    for (let i = 0; i < size; i++) {
                        buttons[i] = drawActionBarButton(elm, _childElements);
                    }
                    break;
            }
        }

        buttons.forEach((button, i) => {
            const ondrag = () => holdSpell(i);
            const onShowTooltip = e => showTooltip(e, ...getSpell(i, true));
            const onmouseup = () => CURSOR.instance.spell ? placeSpell(i, CURSOR.instance.spell) : CURSOR.instance.item && placeItem(i, CURSOR.instance.item);
            const onclick = (e) => {
                const spell = CURSOR.instance.spell;
                if (spell) {
                    placeSpell(i, spell);
                }
                else if (!CURSOR.instance.locked) {
                    this.Button(e, i, CONTROLS.touchLastActive);
                }
            };
            prepareButton(button.firstChild, onclick, onmouseup, ondrag, onShowTooltip);
        });

        Object.defineProperties(this, {
            'elm': { value: elm, writable: false },
            'width': { value: width, writable: false },
            'height': { value: height, writable: false },
            'size': { get: () => _size },
            'enabled': { get: () => _enabled },
            'oversized': { get: () => _oversized },
        });

        this.SetLayout = (size = 1, oversized = false) => {
            _oversized = actionBarIndex > 2 && oversized || false;
            _size = clamp(size, 1, actionBarIndex === 0 ? 3 : 2);
            (clamp(actionBarIndex, 3, 5) === actionBarIndex ? elm.parentNode : elm).classList.toggle("oversized", _oversized);
            _enabled && this.Redraw();
        };

        this.CommitLayout = () => {
            SETTINGS.Set(`action_bar_size_${actionBarIndex}`, _size);
            actionBarIndex > 2 && SETTINGS.Set(`action_bar_oversized_${actionBarIndex}`, _oversized);
        };

        this.Toggle = (enable, redraw = true) => {
            _enabled = enable;
            (clamp(actionBarIndex, 3, 5) === actionBarIndex ? elm.parentNode : elm).style.display = _enabled ? "" : "none";
            _enabled && redraw && this.Redraw();
        };

        this.Button = (e, buttonIndex, touch = false) => {
            let item;
            const [type, spell] = getSpell(buttonIndex, true);
            if (!spell) {
                return;
            }
            if (typeof e.button === "number" && DROPDOWN.instance.trigger === e.target) {
                return DROPDOWN.instance.Close();
            }
            if (spell.disabled) {
                return;
            }
            switch (type) {
                case SpellType.Item:
                case SpellType.BaseItem:
                case SpellType.BaseItemAndColor:
                    if (type === SpellType.Item) {
                        if (typeof e.button === "number" && GAME_MANAGER.instance.HasItem(spell.id, false)) {
                            item = GAME_MANAGER.instance.GetItem(spell.id);
                            const slot = GAME_MANAGER.instance.GetEquippedSlot(item.id);
                            if (slot >= 0) {
                                return showEquippedItemOptions(e, slot, item, touch);
                            }
                        }
                    }
                    else {
                        item = GAME_MANAGER.instance.FindItemStack(spell.id, spell.variant_color);
                    }
                    if (item) {
                        const actions = getItemActions(item, false, true);
                        if (typeof e.button === "number") {
                            if (actions.length === 1 && actions[0].label === "Use" && !item.base.product_id) {
                                actions[0].onclick(e);
                            }
                            else if (actions.length > 0) {
                                DROPDOWN.instance.Open(e, actions);
                            }
                        }
                        else {
                            const action = actions && actions.find(action => action.label === "Use");
                            action && action.onclick();
                        }
                    }
                    break;
                case SpellType.Macro:
                    return ACTION_BAR.TriggerMacro(e, spell.macro);
                default:
                    return waitForFrame().then(() => MENU.Spells.CastSpell(e, spell, typeToTarget(type)));
            }
        };

        this.Redraw = () => {
            if (_enabled) {
                const a = buttons.length / (actionBarIndex === 0 ? 3 : 2);
                for (let i = 0; i < buttons.length; i++) {
                    const display = i / a < _size;
                    buttons[i].style.display = display ? "" : "none";
                    if (!display) {
                        continue;
                    }
                    const [type, spell] = getSpell(i, true);
                    if (spell && spell.disabled) {
                        const spellIndex = toSpellIndex(actionBarIndex, i);
                        loadSpell(spellIndex * 2, type, spell);
                    }
                    updateButtonIcon(i);
                }
            }
        };

        this.RedrawDesireActions = () => _enabled && redrawButtonsByType(SpellType.ActionDesire);

        this.RedrawItemActions = () => _enabled && redrawButtonsByType(SpellType.ItemAction, SpellType.SelfcastItemAction, SpellType.ItemActionOption, SpellType.SelfcastItemActionOption);

        this.RedrawInanimateActions = () => _enabled && redrawButtonsByType(SpellType.InanimateAction);

        const redrawButtonsByType = (...spellTypes) => {
            const a = buttons.length / (actionBarIndex === 0 ? 3 : 2);
            for (let i = 0; i < buttons.length && i / a < _size; i++) {
                const [type, spell] = getSpell(i, true);
                if (spell && spellTypes.includes(type)) {
                    spell.disabled && loadSpell(toSpellIndex(actionBarIndex, i) * 2, type, spell);
                    updateButtonIcon(i);
                }
            }
        };

        this.RedrawMacros = () => {
            if (_enabled) {
                const a = buttons.length / (actionBarIndex === 0 ? 3 : 2);
                for (let i = 0; i < buttons.length && i / a < _size; i++) {
                    if (_spells[toSpellIndex(actionBarIndex, i) * 2] === SpellType.Macro) {
                        updateButtonIcon(i);
                    }
                }
            }
        };

        this.ReloadMacro = macroId => {
            for (let i = 0; i < buttons.length; i++) {
                const [type, spell] = getSpell(i, true);
                if (type === SpellType.Macro && spell && spell.id === macroId) {
                    loadSpell(toSpellIndex(actionBarIndex, i) * 2, type, spell);
                    updateButtonIcon(i);
                }
            }
        }

        this.RemoveMacro = macroId => {
            for (let i = 0; i < buttons.length; i++) {
                const [type, spell] = getSpell(i, true);
                if (type === SpellType.Macro && spell && spell.id === macroId) {
                    clearSpell(i);
                    updateButtonIcon(i);
                }
            }
        }

        function holdSpell(buttonIndex) {
            const spell = !CURSOR.instance.locked && !_locked && getSpell(buttonIndex);
            if (spell) {
                CURSOR.instance.SetSpell(spell);
                clearSpell(buttonIndex);
                updateButtonIcon(buttonIndex);
            }
        }

        function getSpell(buttonIndex, returnType = false) {
            const spellIndex = toSpellIndex(actionBarIndex, buttonIndex);
            const type = _spells[spellIndex * 2];
            const spell = type && _spells[spellIndex * 2 + 1];
            return returnType ? [type, spell] : spell;
        }

        function clearSpell(buttonIndex) {
            const spellIndex = toSpellIndex(actionBarIndex, buttonIndex);
            _spells[spellIndex * 2] = SpellType.None;
            _spells[spellIndex * 2 + 1] = 0;
            onButtonChanged(spellIndex);
        }

        function placeSpell(buttonIndex, spell) {
            _preventClick = true;
            const [prevType, prevSpell] = getSpell(buttonIndex, true);
            const spellIndex = toSpellIndex(actionBarIndex, buttonIndex);
            const type = _spells[spellIndex * 2] = spellToType(spell);
            _spells[spellIndex * 2 + 1] = spell;
            CURSOR.instance.SetSpell(prevSpell && !(prevType === type && getSpellId(prevType, prevSpell) === getSpellId(type, spell)) ? prevSpell : null);
            updateButtonIcon(buttonIndex);
            onButtonChanged(spellIndex, type, spell);
        }

        function placeItem(buttonIndex, item) {
            if (item && item.base) {
                const spell = validateUseBaseItem(item.base) ? Object.assign({}, item.base, { variant_color: item.variant_color }) : item;
                const spellIndex = toSpellIndex(actionBarIndex, buttonIndex);
                const type = _spells[spellIndex * 2] = spellToType(spell);
                _spells[spellIndex * 2 + 1] = spell || 0;
                updateButtonIcon(buttonIndex);
                onButtonChanged(spellIndex, type, spell);
            }
        }

        const onButtonChanged = (spellIndex, type, spell) => {
            saveBarData(Math.floor(spellIndex / 12));
            updateFallbackData(spellIndex, type, spell);
        };

        function updateButtonIcon(buttonIndex) {
            const button = buttons[buttonIndex];
            const [icon, stack, label, radial] = _childElements.get(button) || [];
            const [type, spell] = getSpell(buttonIndex, true);
            const size = (actionBarIndex > 2 && _oversized ? (actionBarIndex === 3 ? 2.203287718 : 1.863112951) : 1) * 46.08 * 0.9225;
            const onSpellChanged = spell => {
                const spellIndex = toSpellIndex(actionBarIndex, buttonIndex);
                updateFallbackData(spellIndex, type, _spells[spellIndex * 2 + 1] = spell);
            };
            updateActionBarButton(type, spell, button, icon, stack, radial, size, onSpellChanged);
            const hotkeys = CONTROLS.GetActionBarHotkeys(actionBarIndex)[buttonIndex];
            label.textContent = hotkeys && hotkeys[0] ? removeWhiteSpace(hotkeys[0]) : '';
            if (stack.textContent.length === 0 && spell && spell.macro_name && SETTINGS.Get("action_bar_macro_names", true)) {
                stack.textContent = spell.macro_name;
                stack.classList.add("macro");
            }
        }
    }

    function ChoiceActionBar() {
        const [elm, width, height] = arguments;
        const buttons = [];
        const actionBarIndex = _list.length;
        elm.classList.add("action_bar");

        const closeButton = {
            id: 0,
            tags: [],
            action_name: "Close",
            image_url: "/game/assets/spells/missing.png",
            draggable: false,
            action_cost: 0,
        }

        const _childElements = new Map();
        const _options = [];
        const _actions = [];
        const _actionsOverrides = [];

        let _active;
        let _actionCache;
        let _onHideOptions;

        _list.push(this);

        Object.defineProperties(this, {
            'elm': { value: elm, writable: false },
            'width': { value: width, writable: false },
            'height': { value: height, writable: false },
            'size': { value: height, writable: 1 },
            'oversized': { value: height, writable: false },
            'enabled': { get: () => buttons.length > 0 },
            'actions': { get: () => _actionCache || (_actionCache = deepFreeze(deepClone(_actions.filter(o => o)))) },
        });

        this.SetLayout = noop;

        this.CommitLayout = noop;

        this.Toggle = noop;

        this.RedrawMacros = noop;

        this.RemoveMacro = noop;

        this.ReloadMacro = noop;

        this.Button = (e, buttonIndex) => {
            const spell = _active && getSpell(buttonIndex);
            if (spell === closeButton) {
                hideOptions(true);
            }
            else if (spell && !spell.disabled) {
                waitForFrame()
                    .then(() => MENU.Spells.CastSpell(e, spell, typeToTarget(spell.type || SpellType.ActionDesire)))
                    .then(hide => hide && hideOptions(false));
            }
        };

        const getDisplayedActions = () => _options.length > 0 ? _options : _actions;

        this.RedrawDesireActions = () => getDisplayedActions().forEach((action, i) => action && action.desire && updateButtonIcon(action, i));

        this.RedrawItemActions = () => getDisplayedActions().forEach((action, i) => action && action.item_id && updateButtonIcon(action, i));

        this.RedrawInanimateActions = () => getDisplayedActions().forEach((action, i) => action && action.tags.includes("Inanimate") && updateButtonIcon(action, i));

        this.Redraw = () => getDisplayedActions().forEach((action, i) => action && updateButtonIcon(action, i));

        this.SetActions = actions => {
            if (_actions.length !== actions.length || !_actions.every(action => actions.some(a => a.id === action.id))) {
                NOTIFICATION.Reaction();
            }
            _actionCache = null;
            _actionsOverrides.length = _actions.length = 0;
            _actionsOverrides.push(...actions);
            _actions.push(...actions.map(action => {
                if (action.desire) {
                    const spell = ACTION.GetDesireActionAsSpell(action.id, false);
                    return spell && Object.assign(spell, action);
                }
                return action;
            }).filter(o => o));
            if (_actions.length > 0) {
                _active = false;
                _options.length = 0;
                const autocastIndex = _actions.findIndex(action => action.autocast);
                autocastIndex >= 0 && _actions.unshift(..._actions.splice(autocastIndex, 1));
                const baton = LOCK.GetBaton(_actions);
                waitForSeconds(0.5).finally(() => LOCK.HasBaton(_actions, baton) && (_active = true));
            }
            redrawButtons();
        }

        this.ValidateItem = (itemIds) => _options.some(option => option && option.item_id && !itemIds.includes(option.item_id)) && hideOptions(false);

        this.DisplayOptions = (options, onHideOptions) => {
            let padding, uneven;
            _active = true;
            _options.length = 0;
            _onHideOptions = onHideOptions;
            options.length > 19 && (options = options.slice(0, 19));
            if (options.length > 9) {
                const rows = [[], []];
                for (const a of options.filter(o => !o.selfcast)) {
                    const b = options.find(b => a.id === b.id && b.selfcast && !rows[1].includes(b));
                    if (b) {
                        rows[0].push(a);
                        rows[1].push(b);
                    }
                }
                options.filter(o => !rows.some(row => row.includes(o))).forEach((option, i) => rows[i % 2].push(option));
                _options.push(...rows[0], ...rows[1], closeButton);
                padding = clamp(Math.floor((20 - _options.length) / 2), 0, 4);
                uneven = _options.length % 2 !== 0;
                uneven && _options.splice(5 + Math.floor((_options.length - 10) / 2), 0, null);
            }
            else {
                _options.push(...options, closeButton);
            }
            elm.style.transform = uneven ? "translate(0.95em)" : '';
            elm.style.padding = padding >= 1 ? `0 calc(1.8em * ${padding * 0.5} + 3px) 0.3em` : '';
            redrawButtons();
            this.Redraw();
            GUI.instance.UpdateUIPositions();
        };

        const hideOptions = (triggerOnHide) => {
            elm.style.transform = elm.style.padding = '';
            _options.length = 0;
            redrawButtons();
            this.Redraw();
            GUI.instance.UpdateUIPositions();
            triggerOnHide && _onHideOptions && _onHideOptions();
        };

        const drawButton = () => {
            const i = buttons.length;
            const button = drawActionBarButton(elm, _childElements);
            buttons.push(button);
            const ondrag = () => getSpell(i) !== closeButton && holdSpell(i);
            const onShowTooltip = e => showTooltip(e, getSpell(i), i);
            const onclick = e => !CURSOR.instance.locked && this.Button(e, i, CONTROLS.touchLastActive);
            prepareButton(button.firstChild, onclick, noop, ondrag, onShowTooltip);
            _radials.push(...Array.from(button.getElementsByClassName("radial")));
        };

        const redrawButtons = () => {
            const actions = getDisplayedActions();
            if (actions.length > 0) {
                while (buttons.length < actions.length) {
                    drawButton();
                }
                for (let i = 0; i < buttons.length; i++) {
                    buttons[i].style.visibility = !actions[i] ? "hidden" : '';
                    buttons[i].classList.toggle("empty", i >= actions.length);
                    buttons[i].classList.toggle("autocast", actions[i] && actions[i].autocast || false);
                    buttons[i].classList.toggle("hide_radial", actions[i] === closeButton);
                }
            }
            else {
                clearHTML(elm);
                buttons.length = 0;
                for (let i = _radials.length - 1; i >= 0; i--) {
                    if (!document.body.contains(_radials[i])) {
                        _radials.splice(i, 1);
                    }
                }
            }
        };

        function holdSpell(buttonIndex) {
            const spell = !CURSOR.instance.locked && !_locked && getSpell(buttonIndex);
            spell && CURSOR.instance.SetSpell(spell);
        }

        const getSpell = buttonIndex => getDisplayedActions()[buttonIndex] || null;

        function showTooltip(e, spell, index) {
            if (spell === closeButton) {
                return TOOLTIP.instance.Show(e, closeButton.action_name);
            }
            const type = spellToType(spell);
            const target = typeToTarget(type);
            if (type === SpellType.ActionDesire) {
                spell = Object.assign(ACTION.GetDesireActionAsSpell(spell.id) || spell, _actionsOverrides[index]);
            }
            return TOOLTIP.instance.ShowSpell(e, spell, target, SpellType.IsSelfcast(type));
        }

        function updateButtonIcon(spell, buttonIndex) {
            const button = buttons[buttonIndex];
            const [icon, , label] = _childElements.get(button) || [];
            updateActionBarButton(spell || getSpell(buttonIndex), button, icon);
            const hotkeys = CONTROLS.GetActionBarHotkeys(actionBarIndex)[buttonIndex];
            label.textContent = hotkeys && hotkeys[0] ? removeWhiteSpace(hotkeys[0]) : '';
        }

        function updateActionBarButton(spell, button, icon) {
            let image, backgroundSize, valid = false;
            const size = 46.08 * 0.9225;
            const scale = powCeil(size * getMediaScale());
            pixelated = spell.nsfw && SETTINGS.Get("sfw", false);

            image = spell.image_url && formatMediaURL(spell.image_url, pixelated ? 16 : scale);
            valid = spell && !spell.disabled;

            icon.classList.remove("item_outline_white");
            button.classList.remove("magical_effect");

            if (!image && (spell.item_id || spell.inanimate)) {
                const item = spell.inanimate ? GAME_MANAGER.instance.character.item && GAME_MANAGER.instance.GetItem(GAME_MANAGER.instance.character.item.id) : GAME_MANAGER.instance.GetItem(spell.item_id);
                if (item) {
                    pixelated = item.base.nsfw && SETTINGS.Get("sfw", false);
                    image = GAME_MANAGER.instance.IsEquipped(item.id) ? IMAGE_PROCESSING.getWornItemImage(item, 0, null, size, scale / size, pixelated) : IMAGE_PROCESSING.getItemImage(item, 0, size, scale / size, pixelated);
                    image && applyItemStyles(button, icon, item);
                }
                backgroundSize = "contain";
            }

            if (image) {
                icon.style.backgroundImage = `url(${image})`;
                icon.style.imageRendering = pixelated ? "pixelated" : "";
                icon.style.backgroundSize = backgroundSize || '';
                loadImage(image).catch(() => compareBackgroundImages(icon, image) && setErrorImage(icon, scale));
            }
            else {
                setErrorImage(icon, scale);
            }

            button.classList.toggle("disabled", !valid);
        }
    }

    function prepareButton(button, onclick, onmouseup, ondrag, onShowTooltip) {
        button.oncontextmenu = e => { e.pointerType === "mouse" ? button.onclick(e) : button.onmousedown(); e.preventDefault() };
        button.onmousedown = async () => await CURSOR.instance.WaitForDragStart() && ondrag();
        button.ontouchstart = e => onShowTooltip(e);
        button.onmouseenter = e => onShowTooltip(e);
        button.onmouseup = e => !_preventClick && onmouseup(e);
        button.onclick = e => !_preventClick && onclick(e);
    };

    const typeToTarget = type => SpellType.IsSelfcast(type) ? GAME_MANAGER.instance.character : LOCATION.instance.opponent || GAME_MANAGER.instance.character;

    function showTooltip(e, type, spell) {
        if (spell) {
            function showDisabledTooltip(spell) {
                const spellname = getSpellFullyQualifiedName(spell) || spell.item_name || spell.base && spell.base.item_name;
                return spellname && TOOLTIP.instance.Show(e, spellname);
            }
            switch (type) {
                case SpellType.Item:
                case SpellType.BaseItem:
                case SpellType.BaseItemAndColor:
                    return spell.disabled ? showDisabledTooltip(spell) : TOOLTIP.instance.ShowItem(e, spellToItem(type, spell));
                case SpellType.Macro:
                    const macroTooltip = getMacroTooltip(spell, "showtooltip");
                    return macroTooltip ? showTooltip(e, spellToType(macroTooltip), macroTooltip) : spell.macro_name.trim() && TOOLTIP.instance.Show(e, spell.macro_name.trim());
                case SpellType.ActionDesire:
                    {
                        const action = ACTION.GetDesireActionAsSpell(spell.id);
                        const target = DESIRE.ActionToTarget(action);
                        return action ? TOOLTIP.instance.ShowSpell(e, action, target, target === GAME_MANAGER.instance.character) : showDisabledTooltip(spell);
                    }
                case SpellType.InanimateAction:
                    {
                        const action = ACTION.GetInanimateActionAsSpell(spell.id);
                        return action ? TOOLTIP.instance.ShowSpell(e, action, typeToTarget(type)) : showDisabledTooltip(spell);
                    }
                default:
                    const target = typeToTarget(type);
                    if (spell.special && spell.type === 1 && spell.form) {
                        const specialActions = LOCATION.instance.GetSpecialActions();
                        return TOOLTIP.instance.ShowInanimateSpell(e, spell, specialActions && specialActions.tier || 0, target, true);
                    }
                    return spell.disabled ? showDisabledTooltip(spell) : TOOLTIP.instance.ShowSpell(e, spell, target, SpellType.IsSelfcast(type));
            }
        }
    }

    function updateActionBarButton(type, spell, button, icon, stack, radial, size, onSpellChanged) {
        let backgroundSize, valid = false;
        clearHTML(stack);
        stack.classList.remove("macro");
        stack.classList.remove("charge");
        icon.classList.remove("item_outline_white");
        button.classList.remove("magical_effect");
        if (spell) {
            let image;
            let pixelated = (spell.nsfw || spell.base && spell.base.nsfw) && SETTINGS.Get("sfw", false);
            const scale = powCeil(size * getMediaScale());
            switch (type) {
                case SpellType.Item:
                case SpellType.BaseItem:
                case SpellType.BaseItemAndColor:
                    const item = spellToItem(type, spell);
                    valid = item.base && item.base.image_url;
                    if (valid) {
                        if (type === SpellType.Item) {
                            const item = GAME_MANAGER.instance.GetItem(spell.id);
                            if (item && (spell.image_url !== item.base.image_url || spell.variant_color !== item.variant_color)) {
                                spell.base = item.base;
                                spell.variant_color = item.variant_color;
                                onSpellChanged && onSpellChanged(spell);
                            }
                        }
                        if (type === SpellType.Item && (item.slot !== undefined || GAME_MANAGER.instance.IsEquipped(item.id))) {
                            image = IMAGE_PROCESSING.getWornItemImage(item, 0, null, size, scale / size, pixelated);
                        }
                        else {
                            image = IMAGE_PROCESSING.getItemImage(item, 0, size, scale / size, pixelated);
                        }
                        if (type === SpellType.Item) {
                            const enchantments = item.enchantments || GAME_MANAGER.instance.GetEnchantments(item.id);
                            image && applyItemStyles(button, icon, item, enchantments);
                            const types = getBaseItemTypes(item.base);
                            if (types.includes("electronic")) {
                                const electronic = enchantments.find(e => e.type === "electronic");
                                const charges = electronic && electronic.charges || 0;
                                stack.textContent = `🗲${charges}`;
                                stack.classList.add("charge");
                                stack.classList.toggle("depleted", !(charges >= 1));
                            }
                            if (GAME_MANAGER.instance.HasItem(item.id, false)) {
                                valid = true;
                            }
                            else {
                                for (const items of [LOCATION.instance.opponent, GAME_MANAGER.instance.owner].map(c => c && c.equipment && (Array.isArray(c.equipment) ? c.equipment : c.equipment.items)).filter(o => o)) {
                                    if (items.some(i => i && i.id === item.id)) {
                                        valid = true;
                                        break;
                                    }
                                }
                            }
                        }
                        else {
                            const count = type === SpellType.BaseItemAndColor ? GAME_MANAGER.instance.CountItems(item.base.id, item.variant_color) : GAME_MANAGER.instance.CountItems(item.base.id);
                            if (item.base.stack_sizes) {
                                let stackImage = _stackImages.get(item.base.id);
                                if (stackImage === undefined) {
                                    const base = GAME_MANAGER.instance.GetBaseItem(Object.assign({}, item, { stack: count, base: item.base.id }));
                                    _stackImages.set(item.base.id, stackImage = base && base.image_url);
                                }
                                if (stackImage && stackImage !== item.base.image_url) {
                                    const base = Object.assign({}, spell, { image_url: stackImage });
                                    onSpellChanged && onSpellChanged(base);
                                    image = IMAGE_PROCESSING.getItemImage({ base }, 0, size, scale / size, pixelated);
                                }
                            }
                            stack.textContent = formatStackCount(count);
                            valid = count >= 1;
                        }
                        icon.classList.toggle("item_outline_white", image && MENU.Inventory.ItemHasOutline(item) || false);
                    }
                    backgroundSize = "contain";
                    valid = valid && !GAME_MANAGER.instance.IsDazed();
                    break;
                case SpellType.Macro:
                    if (spell.icon) {
                        image = spell.image_url && formatMediaURL(spell.image_url, pixelated ? 16 : scale);
                    }
                    else {
                        const iconSpell = getMacroTooltip(spell);
                        try {
                            if (iconSpell) {
                                const onSpellChanged = icon => {
                                    spell.image_url = icon.image_url || icon.base && icon.base.image_url;
                                    updateMacroFallbackData(spell.id, type, icon, spell.image_url);
                                };
                                const type = spellToType(iconSpell);
                                spell.image_url = getMacroImage(spell, type, iconSpell);
                                return updateActionBarButton(type, iconSpell, button, icon, stack, radial, size, onSpellChanged);
                            }
                            else {
                                const fallback = _macroImagesById.has(spell.id) && _macroFallbackData.find(arr => arr[0] === spell.id);
                                if (fallback && fallback[1]) {
                                    return updateActionBarButton(spellToType(fallback[1]), Object.assign({ disabled: true }, fallback[1]), button, icon, stack, radial, size);
                                }
                            }
                        }
                        finally {
                            if (TOOLTIP.instance.trigger === button && TOOLTIP.instance.visible) {
                                const macroTooltip = getMacroTooltip(spell, "showtooltip");
                                macroTooltip && showTooltip(TOOLTIP.instance.event, spellToType(macroTooltip), macroTooltip);
                            }
                        }
                    }
                    valid = true;
                    break;
                case SpellType.ActionDesire:
                case SpellType.InanimateAction:
                case SpellType.ItemAction:
                case SpellType.SelfcastItemAction:
                case SpellType.ItemActionOption:
                case SpellType.SelfcastItemActionOption:
                    {
                        const action = type === SpellType.ActionDesire ? ACTION.GetDesireActionAsSpell(spell.id) : type === SpellType.InanimateAction ? ACTION.GetInanimateActionAsSpell(spell.id) : ACTION.GetItemAction(spell.item_id, spell.id, spell.selfcast);
                        if (action && (action.image_url !== spell.image_url || action.disabled !== spell.disabled)) {
                            spell = Object.assign({}, spell, { image_url: action.image_url, disabled: action.disabled });
                            onSpellChanged && onSpellChanged(spell);
                        }
                        image = spell.image_url && formatMediaURL(spell.image_url, pixelated ? 16 : scale);
                        valid = action && !action.disabled && !GAME_MANAGER.instance.IsDazed();
                        if (!image && (spell.item_id || spell.inanimate)) {
                            const item = spell.inanimate ? GAME_MANAGER.instance.character.item && GAME_MANAGER.instance.GetItem(GAME_MANAGER.instance.character.item.id) : GAME_MANAGER.instance.GetItem(spell.item_id);
                            if (item) {
                                pixelated = item.base.nsfw && SETTINGS.Get("sfw", false);
                                image = GAME_MANAGER.instance.IsEquipped(item.id) ? IMAGE_PROCESSING.getWornItemImage(item, 0, null, size, scale / size, pixelated) : IMAGE_PROCESSING.getItemImage(item, 0, size, scale / size, pixelated);
                                image && applyItemStyles(button, icon, item);
                            }
                            backgroundSize = "contain";
                        }
                    }
                    break;
                default:
                    image = spell.image_url && formatMediaURL(spell.image_url, pixelated ? 16 : scale);
                    if (!image && spell.form) {
                        image = IMAGE_PROCESSING.getWornItemImage(spell.form, 0, null, size, scale / size, pixelated);
                        backgroundSize = "contain";
                    }
                    valid = !GAME_MANAGER.instance.IsDazed();
                    if (valid && type === SpellType.SpellSpecial) {
                        valid = Boolean(LOCATION.instance.opponent);
                    }
                    break;
            }
            radial.style.display = type === SpellType.Item || type === SpellType.BaseItem || type === SpellType.BaseItemAndColor ? "none" : "";
            if (image) {
                icon.style.backgroundImage = `url(${image})`;
                icon.style.imageRendering = pixelated ? "pixelated" : "";
                icon.style.backgroundSize = backgroundSize || '';
                loadImage(image).catch(() => compareBackgroundImages(icon, image) && setErrorImage(icon, scale));
            }
            else {
                setErrorImage(icon, scale);
            }
            button.classList.remove("empty");
            button.classList.toggle("disabled", spell.disabled || !valid);
        }
        else {
            icon.style.backgroundImage = icon.style.imageRendering = icon.style.backgroundSize = "";
            button.classList.add("empty");
            button.classList.remove("disabled");
        }
    }

    function getMacroImage(spell, type, icon) {
        let image;
        icon = icon || spell && getMacroTooltip(spell);
        if (!icon) {
            return spell ? _macroImagesById.get(spell.id) || spell.image_url : undefined;
        }
        type === undefined && (type = spellToType(icon));
        if (type === SpellType.SpellSpecial && icon.form) {
            image = icon.form.base.worn_image_url || icon.form.base.image_url;
        }
        else if (type === SpellType.Item && icon.base.worn_image_url && (icon.slot !== undefined || GAME_MANAGER.instance.IsEquipped(icon.id))) {
            image = icon.base.worn_image_url;
        }
        else if (type === SpellType.ActionDesire) {
            image = insertNature(icon.image_url);
        }
        else {
            image = icon.image_url || icon.base && icon.base.image_url;
        }
        spell && updateMacroFallbackData(spell.id, type, icon, image);
        return image;
    }

    function getMacroTooltip(macro, meta) {
        let arr;
        if (!macro.id) {
            arr = processMacroTooltip(macro);
        }
        else {
            arr = _macroTooltips.get(macro.id);
            arr === undefined && (arr = processMacroTooltip(macro));
        }
        return arr && (meta === undefined || arr[0] === meta) ? arr[1] : null;
    }

    function processMacroTooltip(macro) {
        let arr = null;
        const allConditions = [];
        function addConditions(conditionGroups, conditions) {
            for (const group of conditionGroups) {
                if (Array.isArray(group)) {
                    allConditions.push(...group);
                    if (conditions === group) {
                        break;
                    }
                }
            }
        }
        findMetaCommand.lastIndex = 0;
        while ((match = findMetaCommand.exec(macro.macro)) && !arr) {
            let conditions;
            if (match[2]) {
                const conditionGroups = formatMacroConditions(match[2]);
                conditions = validateCommand(_mods, match[1], conditionGroups);
                addConditions(conditionGroups, conditions);
                if (conditions === false) {
                    continue;
                }
            }
            if (match[3]) {
                const target = findTarget(conditions);
                arr = [match[1], macroLabelToItem(match[3], target) || macroLabelToSpell(match[3], target)];
            }
            else {
                for (let line of macro.macro.substr(findMetaCommand.lastIndex).split(/\r?\n/)) {
                    let tooltip;
                    if (validateMetaCommand.test(line)) {
                        break;
                    }
                    if (line.trim().charAt() === "#") {
                        continue;
                    }
                    line = line && insertProperties(line).trim();
                    const command = line && findCommand(line);
                    if (!command) {
                        continue;
                    }
                    const conditions = validateCommand(_mods, command[0], command[1]);
                    addConditions(command[1], conditions);
                    if (conditions === false) {
                        continue;
                    }
                    const target = findTarget(conditions);
                    switch (command[0]) {
                        case "cast":
                            tooltip = macroLabelToSpell(findParams(command[2], 0)[0], target);
                            break;
                        case "use":
                            tooltip = macroLabelToItem(findParams(command[2], 0)[0], target);
                            break;
                        case "wear":
                        case "remove":
                            const slot = parseInt(command[2]);
                            const itemId = GAME_MANAGER.instance.GetItemIdBySlot(isNaN(slot) ? command[2] && command[2].trim() : slot);
                            tooltip = itemId && GAME_MANAGER.instance.GetItem(itemId);
                            break;
                        default:
                            continue;
                    }
                    tooltip && (arr = [match[1], tooltip]);
                    break;
                }
                break;
            }
        }
        if (macro.id) {
            _macroTooltips.set(macro.id, arr);
            _conditionsByMacroId.set(macro.id, unique(allConditions.map(conditions => Array.isArray(conditions) ? conditions[0] : conditions)));
        }
        return arr;
    }

    function macroLabelToSpell(label, target) {
        if (!(label = label && label.trim())) {
            return null;
        }
        const inputLabel = label;
        let cache = _macroSpellCache.get(target);
        let output = cache ? cache.get(inputLabel) : undefined;
        if (output !== undefined) {
            return output;
        }
        try {
            const match = label.match(findLabelParameter);
            match && (label = label.substr(0, match.index).trim());
            const tag = match && match[1];
            const id = match && Number(match[2] || match[1]);
            const tagAndId = Boolean(match && match[2]);
            if (!tagAndId) {
                if (!tag || (tag === "Reaction" || tag === "Masturbation" || tag === "Inanimate")) {
                    const action = _choiceActionBar && _choiceActionBar.actions.find(action => getSpellFullyQualifiedName(action) === label && (!tag || action.tags.includes(tag))) || null;
                    if (action) {
                        return output = action;
                    }
                    if (!tag || tag === "Inanimate") {
                        const action = ACTION.GetInanimateActions().find(action => getSpellFullyQualifiedName(action) === label);
                        if (action) {
                            return output = action;
                        }
                    }
                }
                const spell = GAME_MANAGER.instance.GetSpellByName(label);
                if (!tag || tag === "Spell") {
                    if (spell) {
                        return output = isPlayer(target) ? Object.assign({ selfcast: true }, spell) : spell;
                    }
                    const specialOption = getSpecialOptions().find(option => option.action_name === label);
                    if (specialOption) {
                        return output = MENU.Spells.SpecialOptionToSpell(specialOption);
                    }
                }
                else if (tag && spell && Array.isArray(spell.options)) {
                    const option = spell.options.find(o => o.option_name === tag);
                    if (option) {
                        return output = Object.assign({}, spell, option, { selfcast: Boolean(isPlayer(target)), options: null });
                    }
                }
            }
            if (id) {
                const selfcast = Boolean(isPlayer(target));
                const actions = ACTION.GetItemActions(id).filter(action => getSpellFullyQualifiedName(action) === label);
                if (actions.length > 0) {
                    if (tagAndId) {
                        for (const action of actions.filter(a => Array.isArray(a.options))) {
                            const option = action.options.find(o => o.option_name === tag);
                            if (option) {
                                return output = Object.assign({}, action, option, { options: null });
                            }
                        }
                    }
                    else {
                        return output = actions.find(action => Boolean(action.selfcast) === selfcast) || actions[0];
                    }
                }
            }
            return null;
        }
        finally {
            !cache && _macroSpellCache.set(target, cache = new Map());
            cache.set(inputLabel, output || null);
        }
    }

    function macroLabelToItem(label, target) {
        if (!label) {
            return null;
        }
        const inputLabel = label;
        let cache = _macroItemCache.get(target);
        let output = cache ? cache.get(inputLabel) : undefined;
        if (output !== undefined) {
            return output;
        }
        try {
            let match = label.match(findItemSlot);
            if (match) {
                let item;
                if (match[2]) {
                    const itemId = MENU.Inventory.CoordsToItemId(parseInt(match[1]), parseInt(match[2]));
                    item = itemId && GAME_MANAGER.instance.GetItem(itemId);
                    return output = item && validateUseBaseItem(item.base) ? Object.assign({}, item.base, { variant_color: item.variant_color }) : item;
                }
                const slot = parseInt(match[1]);
                if (isOpponent(target) || isOwner(target)) {
                    const items = Array.isArray(target.equipment) ? target.equipment : target.equipment && target.equipment.items || [];
                    item = items[slot];
                }
                else if (target === undefined || isPlayer(target)) {
                    const itemId = GAME_MANAGER.instance.GetItemIdBySlot(slot);
                    item = GAME_MANAGER.instance.GetItem(itemId);
                }
                return output = item ? Object.assign({}, item, { slot }) : null;
            }
            match = label.match(findLabelParameter);
            label = match ? label.substr(0, match.index).trim() : label.trim();
            const baseItem = GAME_MANAGER.instance.GetBaseItem(label);
            const tag = match && match[2];
            if (baseItem && !(tag && (tag === "Spell" || tag === "Reaction" || tag === "Masturbation" || tag === "Inanimate"))) {
                if (match || baseItem.default_color) {
                    const id = match && Number(match[2] || match[1]);
                    if (id) {
                        return output = GAME_MANAGER.instance.GetItem(id);
                    }
                    if (baseItem.default_color) {
                        const variant_color = tag || baseItem.default_color;
                        item = GAME_MANAGER.instance.FindItemStack(baseItem.id, variant_color);
                        return output = item && Object.assign({}, baseItem, { variant_color });
                    }
                    return output = null;
                }
                return output = validateUseBaseItem(baseItem) ? baseItem : MENU.Inventory.FindFirstWithBase(baseItem.id);
            }
            return null;
        }
        finally {
            !cache && _macroItemCache.set(target, cache = new Map());
            cache.set(inputLabel, output || null);
        }
    }

    function toSpellIndex(actionBarIndex, buttonIndex) {
        const func = (barSize, offset) => 12 * (offset + Math.floor(buttonIndex / barSize)) + buttonIndex % barSize;
        switch (actionBarIndex) {
            case 0:
                return func(5, 0);
            case 1:
                return func(8, 3);
            case 2:
                return func(8, 5);
            case 3:
                return func(12, 7);
            case 4:
                return func(8, 9);
            case 5:
                return func(8, 11);
            default:
                return -1;
        }
    }

    function getFallbackSpell(spellIndex, type, value) {
        if (type === SpellType.Macro) {
            return 0;
        }
        const id = Array.isArray(value) ? value[0] : value;
        const fallback = { id, value, disabled: true };
        const arr = _fallbackData[spellIndex];
        if (Array.isArray(arr)) {
            const [t, spellId, spell] = arr;
            t === type && spellId === id && Object.assign(fallback, spell);
        }
        switch (type) {
            case SpellType.ActionDesire:
                fallback.desire = true;
                break;
        }
        return fallback;
    }

    function spellToFallbackData(type, spell) {
        if (type) {
            let obj;
            switch (type) {
                case SpellType.BaseItem:
                    obj = { item_name: spell.item_name, image_url: spell.image_url };
                    break;
                case SpellType.BaseItemAndColor:
                    obj = { item_name: spell.item_name, image_url: spell.image_url, variant_color: spell.variant_color, default_color: spell.default_color, color_variants: spell.color_variants };
                    break;
                case SpellType.Spell:
                case SpellType.SpellOption:
                case SpellType.SpellVariantOption:
                case SpellType.SelfcastSpell:
                case SpellType.SelfcastSpellOption:
                case SpellType.SelfcastSpellVariantOption:
                    obj = { spell_name: getSpellFullyQualifiedName(spell), image_url: spell.image_url };
                    break;
                case SpellType.ActionDesire:
                    obj = { action_name: getSpellFullyQualifiedName(spell), image_url: spell.image_url };
                    break;
                case SpellType.SpellVariant:
                case SpellType.SelfcastSpellVariant:
                    obj = { spell_name: getSpellFullyQualifiedName(spell), image_url: spell.image_url, spell_id: spell.spell_id };
                    break;
                case SpellType.Macro:
                    return null;
                case SpellType.Item:
                case SpellType.ItemAction:
                case SpellType.ItemActionOption:
                case SpellType.InanimateAction:
                case SpellType.SelfcastItemAction:
                case SpellType.SelfcastItemActionOption:
                case SpellType.SpellSpecial:
                default:
                    obj = spell;
                    break;
            }
            if (spell.nsfw || spell.base && spell.base.nsfw) {
                obj.nsfw = true;
            }
            return obj;
        }
        return null;
    }

    function updateFallbackData(spellIndex, type, spell) {
        const data = spellToFallbackData(type, spell);
        if (!data) {
            _fallbackData[spellIndex] = null;
            return;
        }
        _fallbackData[spellIndex] = [type, getSpellId(type, spell), data];
        while (_fallbackData.length > 0 && !_fallbackData[_fallbackData.length - 1]) {
            _fallbackData.pop();
        }
        localStorage.setItem("action_bar_fallback_data", String.fromCharCode(...pako.deflate(JSON.stringify(_fallbackData))));
    }

    async function updateMacroFallbackData(macroId, type, spell, imageURL) {
        await _ready;
        if (!type || !spell) {
            for (let i = _macroFallbackData.length - 1; i >= 0; i--) {
                if (_macroFallbackData[i][0] === macroId) {
                    _macroFallbackData.splice(i, 1);
                }
            }
            _macroImagesById.delete(macroId);
        }
        else if (imageURL && _macroImagesById.get(macroId) !== imageURL) {
            _macroImagesById.set(macroId, imageURL);
            const data = macroId && spellToFallbackData(type, spell);
            if (data) {
                let ids = [];
                for (let i = 0; i < _spells.length; i += 2) {
                    if (_spells[i] === SpellType.Macro) {
                        const spell = _spells[i + 1];
                        spell && spell.id !== macroId && ids.push(spell.id);
                    }
                }
                ids = unique(ids);
                for (let i = _macroFallbackData.length - 1; i >= 0; i--) {
                    if (!ids.includes(_macroFallbackData[i][0])) {
                        _macroFallbackData.splice(i, 1);
                    }
                }
                _macroFallbackData.push([macroId, data]);
                localStorage.setItem("macro_fallback_data", String.fromCharCode(...pako.deflate(JSON.stringify(_macroFallbackData))));
            }
        }
    }

    function getSpellId(type, spell) {
        switch (type) {
            case SpellType.None:
                return 0;
            case SpellType.Item:
                return typeof spell.id === "number" && spell.id;
            default:
                return spell.id;
        }
    }

    function saveBarData(barIndex) {
        const bar = _spells.slice(barIndex * 24, (barIndex + 1) * 24);
        for (let i = 0; i < bar.length; i += 2) {
            const spell = bar[i + 1];
            if (!spell || typeof spell === "number") {
                bar[i + 1] = spell;
                continue;
            }
            switch (bar[i]) {
                case SpellType.None:
                    bar[i + 1] = 0;
                    continue;
                case SpellType.Item:
                    bar[i + 1] = typeof spell.id === "number" && spell.id;
                    continue;
                case SpellType.ItemAction:
                case SpellType.SelfcastItemAction:
                    bar[i + 1] = spell.id && [spell.id, spell.item_id];
                    continue;
                case SpellType.ItemActionOption:
                case SpellType.SelfcastItemActionOption:
                    bar[i + 1] = spell.id && [spell.id, spell.item_id, spell.option_id];
                    continue;
                case SpellType.SpellOption:
                case SpellType.SpellVariantOption:
                case SpellType.SelfcastSpellOption:
                case SpellType.SelfcastSpellVariantOption:
                    bar[i + 1] = spell.id && [spell.id, spell.option_id];
                    continue;
                case SpellType.BaseItemAndColor:
                    bar[i + 1] = spell.id && [spell.id, spell.variant_color];
                    continue;
                default:
                    bar[i + 1] = spell.id;
                    continue;
            }
        }
        while (bar.length.length > 0 && !bar[bar.length - 1]) {
            bar.pop();
        }
        for (let i = 0; i < bar.length; i++) {
            bar[i] = bar[i] || 0;
        }
        GAME_MANAGER.instance.Send("Settings", { actionBar: { barIndex, bar } });
    }

    function macrosToText(macros) {
        return macros.map(arr => {
            const id = arr[0] ? arr[0].toString(36) : '';
            const hex = arr[1] ? arr[1].toString(36) : '';
            return `${id}${" ".repeat(2 - id.length)}${hex}${" ".repeat(2 - hex.length)}${arr[2] || ''}${" ".repeat(38 - (arr[2] && arr[2].length || 0))}${arr[3] || ''}${" ".repeat(255 - (arr[3] && arr[3].length || 0))}`;
        }).join("");
    }

    function textToMacros(text) {
        const macros = [];
        if (typeof text === "string") {
            const rowLength = 297;
            for (let i = 0; (i + 1) * rowLength <= text.length; i++) {
                const substr = text.substring(i * rowLength, (i + 1) * rowLength);
                macros.push([
                    parseInt(substr.substring(0, 2), 36) || 0,
                    parseInt(substr.substring(2, 4), 36) || 0,
                    substr.substring(4, 42).trim(),
                    substr.substring(42, 297).trim(),
                ]);
            }
        }
        return macros;
    }

    function saveMacroData() {
        GAME_MANAGER.instance.Send("Settings", { macros: macrosToText(_macros) });
        return true;
    }

    function validateUseBaseItem(itemBase) {
        return itemBase.stack > 1 || itemBase.type === "consumable" || itemBase.type === "currency" || getBaseItemTypes(itemBase).some(type => bulkTypes.includes(type));
    }

    function clearMacroCache() {
        _macroTooltips.clear();
        _macroItemCache.clear();
        _macroSpellCache.clear();
    }

    const formatStackCount = count => count <= 1 ? "" : count < 1000 ? count : count < 10 * 1000 ? `${(Math.floor(count / 100) / 10).toFixed(1)}K` : count < 1000 * 1000 ? `${Math.floor(count / 1000)}K` : "*";

    function applyItemStyles(button, icon, item, enchantments) {
        enchantments = enchantments || GAME_MANAGER.instance.GetEnchantments(item.id);
        const conjured = Attribute.IsConjured(item.attributes);
        const hexed = Attribute.IsHexed(item.attributes);
        if (conjured || hexed || enchantments.some(e => e.tier)) {
            button.classList.add("magical_effect");
            button.classList.toggle("hexed", hexed);
            button.classList.toggle("conjured", conjured);
        }
        icon.classList.toggle("item_outline_white", MENU.Inventory.ItemHasOutline(item) || false);
    }

    function spellToType(spell) {
        if (!spell) {
            return SpellType.None;
        }
        if (spell.spell_id) {
            if (spell.option_id) {
                return spell.selfcast ? SpellType.SelfcastSpellVariantOption : SpellType.SpellVariantOption;
            }
            return spell.selfcast ? SpellType.SelfcastSpellVariant : SpellType.SpellVariant;
        }
        if (spell.special) {
            return SpellType.SpellSpecial;
        }
        if (spell.item_name) {
            return spell.default_color ? SpellType.BaseItemAndColor : SpellType.BaseItem;
        }
        if (spell.item_id) {
            if (spell.option_id) {
                return spell.selfcast ? SpellType.SelfcastItemActionOption : SpellType.ItemActionOption;
            }
            return spell.selfcast ? SpellType.SelfcastItemAction : SpellType.ItemAction;
        }
        if (spell.desire) {
            return SpellType.ActionDesire;
        }
        if (spell.inanimate) {
            return SpellType.InanimateAction;
        }
        if (spell.base) {
            return SpellType.Item;
        }
        if (spell.macro !== undefined) {
            return SpellType.Macro;
        }
        if (spell.option_id) {
            return spell.selfcast ? SpellType.SelfcastSpellOption : SpellType.SpellOption;
        }
        return spell.selfcast ? SpellType.SelfcastSpell : SpellType.Spell;
    }

    function spellToItem(type, spell) {
        switch (type) {
            case SpellType.Item:
            default:
                return spell;
            case SpellType.BaseItem:
                return { base: spell };
            case SpellType.BaseItemAndColor:
                return { base: spell, variant_color: spell && spell.variant_color };
        }
    }

    function setErrorImage(icon, scale) {
        icon.style.backgroundImage = `url(${formatMediaURL("/game/assets/spells/missing.png", scale)})`;
        icon.style.imageRendering = icon.style.backgroundSize = "";
        icon.classList.remove("item");
    }

    function drawActionBarButton(parent, map) {
        const button = document.createElement("div");
        const frame = document.createElement("div");
        const icon = document.createElement("div");
        const stack = document.createElement("span");
        const label = document.createElement("span");
        const radial = document.createElement("span");
        button.className = "action_bar_button";
        icon.className = "icon";
        stack.className = "stack";
        label.className = "label";
        radial.className = "radial";
        map && map.set(button, Object.freeze([icon, stack, label, radial]));
        frame.appendChild(icon);
        frame.appendChild(stack);
        frame.appendChild(label);
        frame.appendChild(radial);
        button.appendChild(frame);
        parent.appendChild(button);
        return button;
    }

    function getSpecialOptions() {
        const specialActions = LOCATION.instance.GetSpecialActions();
        return specialActions && Array.isArray(specialActions.options) && specialActions.options || empty;
    }

    function loadSpell(i, type, value, specialOptions) {
        if (isGenericObject(value)) {
            switch (type) {
                case SpellType.BaseItemAndColor:
                    value = [value.id, value.variant_color];
                    break;
                case SpellType.ItemAction:
                case SpellType.SelfcastItemAction:
                    value = [value.id, value.item_id];
                    break;
                case SpellType.ItemActionOption:
                case SpellType.SelfcastItemActionOption:
                    value = [value.id, value.item_id, value.option_id];
                    break;
                case SpellType.SpellOption:
                case SpellType.SpellVariantOption:
                case SpellType.SelfcastSpellOption:
                case SpellType.SelfcastSpellVariantOption:
                    value = [value.id, value.option_id];
                    break;
                default:
                    value = value.id;
                    break;
            }
        }
        switch (type) {
            case SpellType.None:
                _spells[i + 1] = 0;
                return true;
            case SpellType.Spell:
            case SpellType.SpellVariant:
            case SpellType.SelfcastSpell:
            case SpellType.SelfcastSpellVariant:
                if (value) {
                    const spell = type === SpellType.Spell || type === SpellType.SelfcastSpell ? GAME_MANAGER.instance.GetSpell(value) : GAME_MANAGER.instance.GetSpellVariant(value);
                    if (spell) {
                        const selfcast = type === SpellType.SelfcastSpell || type === SpellType.SelfcastSpellVariant;
                        _spells[i + 1] = selfcast ? Object.assign({}, spell, { selfcast }) : spell;
                        return true;
                    }
                }
                break;
            case SpellType.SpellOption:
            case SpellType.SpellVariantOption:
            case SpellType.SelfcastSpellOption:
            case SpellType.SelfcastSpellVariantOption:
                if (Array.isArray(value)) {
                    const [spellId, optionId] = value;
                    const spell = type === SpellType.SpellOption || type === SpellType.SelfcastSpellOption ? GAME_MANAGER.instance.GetSpell(spellId) : GAME_MANAGER.instance.GetSpellVariant(spellId);
                    if (spell && Array.isArray(spell.options)) {
                        const option = spell.options.find(o => o.option_id === optionId);
                        if (option) {
                            const selfcast = type === SpellType.SelfcastSpellOption || type === SpellType.SelfcastSpellVariantOption;
                            _spells[i + 1] = Object.assign({}, spell, option, { selfcast, options: null });
                            return true;
                        }
                    }
                }
                break;
            case SpellType.Item:
            case SpellType.BaseItem:
                if (value) {
                    const item = type === SpellType.Item ? GAME_MANAGER.instance.GetItem(value) : GAME_MANAGER.instance.GetBaseItem(value);
                    if (item) {
                        _spells[i + 1] = item;
                        return true;
                    }
                }
                break;
            case SpellType.BaseItemAndColor:
                if (Array.isArray(value)) {
                    const [baseId, variant_color] = value;
                    const baseItem = GAME_MANAGER.instance.GetBaseItem(baseId);
                    if (baseItem) {
                        _spells[i + 1] = Object.assign({}, baseItem, { variant_color });
                        return true;
                    }
                }
                break;
            case SpellType.ItemAction:
            case SpellType.ItemActionOption:
            case SpellType.SelfcastItemAction:
            case SpellType.SelfcastItemActionOption:
                if (Array.isArray(value)) {
                    const [spellId, itemId, optionId] = value;
                    const selfcast = type === SpellType.SelfcastItemAction;
                    const action = ACTION.GetItemAction(itemId, spellId, selfcast);
                    if (action) {
                        if (type === SpellType.ItemActionOption || type === SpellType.SelfcastItemActionOption) {
                            if (Array.isArray(action.options)) {
                                const option = action.options.find(o => o.option_id === optionId);
                                if (option) {
                                    const selfcast = type === SpellType.SelfcastItemActionOption;
                                    _spells[i + 1] = Object.assign({}, action, option, { selfcast, options: null });
                                    return true;
                                }
                            }
                        }
                        else {
                            _spells[i + 1] = action;
                            return true;
                        }
                    }
                }
                break;
            case SpellType.SpellSpecial:
                const option = (specialOptions || getSpecialOptions()).find(option => option.id === value);
                if (option) {
                    _spells[i + 1] = MENU.Spells.SpecialOptionToSpell(option);
                    return true;
                }
                break;
            case SpellType.ActionDesire:
                if (value) {
                    const action = ACTION.GetDesireActionAsSpell(value);
                    if (action) {
                        _spells[i + 1] = action;
                        return true;
                    }
                }
                break;
            case SpellType.InanimateAction:
                if (value) {
                    const action = ACTION.GetInanimateActionAsSpell(value);
                    if (action) {
                        _spells[i + 1] = action;
                        return true;
                    }
                }
                break;
            case SpellType.Macro:
                const macro = _macros.find(arr => arr[0] === value);
                if (macro) {
                    _spells[i + 1] = ACTION_BAR.MacroToSpell(macro);
                    return true;
                }
                break;
        }
        return false;
    }

    async function loadCompressedData(key) {
        try {
            const data = localStorage.getItem(key);
            if (typeof data === "string") {
                const arr = [];
                for (let i = 0; i < data.length; i++) {
                    arr.push(data.charCodeAt(i));
                }
                if (typeof data === "string") {
                    return JSON.parse(await arrayBufferToJSON(Array.from(data).reduce((arr, char) => { arr.push(char.charCodeAt()); return arr }, [])));
                }
            }
        }
        catch { }
        return null;
    }

    async function loadFallbackData() {
        const data = await loadCompressedData("action_bar_fallback_data");
        Array.isArray(data) && data.forEach((spell, i) => _fallbackData[i] = spell);
    }

    async function loadMacroFallbackData() {
        const data = await loadCompressedData("macro_fallback_data");
        _macroFallbackData.length = 0;
        if (Array.isArray(data)) {
            for (const entry of data) {
                const [macroId, spell] = entry;
                _macroImagesById.set(macroId, getMacroImage(null, spellToType(spell), spell));
            }
            _macroFallbackData.push(...data);
        }
    }

    async function loadMacroIcons(path) {
        const result = await fetch(path);
        if (result.ok) {
            for (const icon of (await result.json()).filter(icon => typeof icon.id === "number" && icon.id >= 0 && icon.image_url)) {
                icon.image_url = `/game/assets/${icon.image_url}`;
                _macroIcons.push(Object.freeze(icon));
                _macroIconsById.set(icon.id, icon);
            }
            _macroIcons.sort((a, b) => (a.sort_as || a.id) - (b.sort_as || b.id))
        }
        Object.freeze(_macroIcons);
        return true;
    }

    ACTION_BAR.Load = async (resourcePath) => {
        const arr = Array.from(_actionBars.children).concat(Array.from(_floatingActionBars.children));

        new ActionBar(arr[0], 5, 3);
        new ActionBar(arr[1], 2, 8);
        new ActionBar(arr[2], 2, 8);
        new ActionBar(arr[4].firstElementChild, 12, 2);
        new ActionBar(arr[5].firstElementChild, 2, 8);
        new ActionBar(arr[6].firstElementChild, 2, 8);

        _choiceActionBar = new ChoiceActionBar(arr[3]);
        _choiceActionBar.SetActions([]);

        _radials.push(...Array.from(_actionBars.getElementsByClassName("radial")).concat(Array.from(_floatingActionBars.getElementsByClassName("radial"))));

        for (let i = 0; i < _list.length; i++) {
            _list[i].Toggle(SETTINGS.Get(`action_bar_${i}`, i === 0), false);
            _list[i].SetLayout(SETTINGS.Get(`action_bar_size_${i}`, i === 0 ? 2 : 1), SETTINGS.Get(`action_bar_oversized_${i}`, false));
        }

        ACTION_BAR.Lock(SETTINGS.Get("action_bars_locked", false));
        ACTION_BAR.AlwaysShow(SETTINGS.Get("action_bar_alway_shown", false));


        return Promise.all([loadMacroFallbackData(), loadFallbackData(), loadMacroIcons(resourcePath)]).finally(() => _readyResolve(true));
    };

    document.addEventListener('mousedown', () => _preventClick = false);

    window.getMacroTooltip = getMacroTooltip;
    window.drawActionBarButton = drawActionBarButton;
    window.updateActionBarButton = updateActionBarButton;
})(window);
