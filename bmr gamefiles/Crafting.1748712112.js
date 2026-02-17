(() => {
	const _itemTypes = ["item", "equipment", "turnable", "enchantable"];

	const _componentIds = [228, 239, 241, 240, 236];
	const _catalystIds = [244, 245, 246];
	const _powerSourceIds = [243];

	const batteryEnchantment = { type: "electronic", charges: 100 };

	const _prototypeSelection = [];
	let _prototypeAppearance;

	let _params = {};

	let _scrollTop;
	let _filter;
	let _item;
	let _selection;
	let _callback;
	let _option;
	let _sortedOptions;
	let _showContainer;
	let _itemRequired;
	let _containerEnabled;
	let _cancellable;
	let _currentTab;
	let _optionList;
	let _prototype;

	let _menu;
	Object.defineProperty(MENU, "Crafting", { get: () => _menu || (_menu = new Crafting()) });

	function Crafting() {
		const elm = document.createElement("div");
		elm.id = "menu_crafting";

		Object.defineProperties(this, {
			'pending': { get: () => hasCallback() },
			'containerEnabled': { get: () => _containerEnabled },
			'params': { get: () => Object.assign(_params, { selection: _selection, callback: hasCallback() ? _callback : null, option: _option }) },
		});

		MENU.Menu.call(this, elm, () => {
			if (_cancellable && hasCallback()) {
				_callback({});
				_callback = null;
			}
			this.Close();
		});

		const hasCallback = () => {
			_callback && !GAME_MANAGER.instance.InScenario() && (_callback = null);
			return _callback != null;
		};

		this.PlaceItem = (item) => {
			let changed = false;
			if (MENU.Crafting.containerEnabled) {
				changed = MENU.Inventory.FindValidStack(item, [GAME_MANAGER.instance.inventory.crafting]);
				if (GAME_MANAGER.instance.HasItem(item.id) && !GAME_MANAGER.instance.inventory.crafting) {
					const image = GAME_MANAGER.instance.ClearInventoryImage(GAME_MANAGER.instance.GetInventoryImage(), item.id);
					image.crafting = item.id;
					GAME_MANAGER.instance.UpdateInventory(image);
					return true;
				}
				if (changed) {
					this.Redraw();
				}
			}
			return changed;
		};

		this.Open = (params, allowOpenInventory = true) => {
			let tabLabels;

			const spellIdChanged = !(elm.parentNode && params && _params && _params.spell_id === params.spell_id);

			_params = params ? Object.assign({}, params) : _params;

			if (_params.npc && _params.npc === _params.npc && elm.parentNode) {
				_params.selection = _selection;
				_scrollTop = elm.getElementsByClassName("item_list")[0].scrollTop;
			}

			_currentTab = null;

			const options = _params.options || [];
			let sortedOptions = [];

			if (_params.spellId !== 31) {
				const sortingIndice = options.map(option => option.order || 0).filter((value, index, self) => self.indexOf(value) === index);
				sortingIndice.sort();
				for (const index of sortingIndice) {
					const sortingList = options.filter(option => (option.order || 0) == index);
					sortingList.sort((a, b) => a.label.localeCompare(b.label));
					sortedOptions = sortedOptions.concat(sortingList);
				}
			}

			_item = typeof _params.item === "number" ? GAME_MANAGER.instance.GetItem(_params.item) : _params.item && _params.item.id ? GAME_MANAGER.instance.GetItem(_params.item.id) : _params.item;

			if (spellIdChanged || _params.spellId !== 31) {
				_selection = !_params.tabs ? _params.selection : _params.selection && typeof _params.selection === "object" ? _params.selection : {};
			}

			_callback = _params.callback;
			_option = _params.option;

			_cancellable = _params.cancellable !== false;

			clearHTML(elm);
			clearMenuClasses(elm);

			if (_params.tabs && _params.tabs.length > 0) {
				tabLabels = document.createElement("div");
				tabLabels.className = "tabs";
				_params.tabs.forEach((label, i) => {
					const tab = drawTabLabel(tabLabels, label);
					tab.onmousedown = () => selectTab(tab, label.toLowerCase());
					if (i == 0) {
						tab.classList.remove("inactive");
						elm.className = label.toLowerCase();
						_currentTab = tab;
					}
				});
				elm.appendChild(tabLabels);
			}
			else {
				const div = document.createElement("div");
				div.className = "title";
				div.textContent = _params.title || "";
				elm.appendChild(div);
			}

			elm.classList.toggle("artistry", _params.spellId === 31);

			const div = document.createElement("div");

			const itemList = document.createElement("div");
			const content = document.createElement("div");
			_optionList = document.createElement("table");

			content.className = "content";
			content.appendChild(div);

			itemList.className = "item_list options";
			itemList.appendChild(_optionList);

			const value = _filter ? _filter.input.value : "";
			_filter = new FILTER.Filter(_optionList, "crafting_filter", "Search");

			_itemRequired = _params.spellId == 29 || _params.spellId == 31 || _item && _item.workorder;
			_showContainer = sortedOptions.length === 0 || _itemRequired || sortedOptions.some(option => _itemTypes.includes(option.target));

			displayOptions(sortedOptions, _params.spellId !== 29);

			const footer = document.createElement("div");
			footer.className = "footer";

			form = drawForm(footer);
			form.appendChild(_filter.input);

			if (tabLabels) {
				div.appendChild(tabLabels)
			}

			elm.classList.toggle("has_tabs", tabLabels || _params.spellId === 31 || false);

			if (_params.spellId === 31) {
				if (spellIdChanged) {
					_prototypeAppearance = _prototype = null;
					_prototypeSelection.length = 0;
				}
				drawPrototypeOptions(div, _params.options.filter(option => option.components));
			}

			div.appendChild(itemList);
			div.appendChild(footer);

			elm.appendChild(content);

			_filter.Update(true);
			_filter.input.value = value;
			_filter.input.onchange();

			let button;

			if (options.length != 0) {
				button = document.createElement("div");
				button.className = "craft label_button";

				const span = document.createElement("span");
				span.textContent = getString(_params.buttonLabel || "Apply");

				button.onclick = () => apply();
				button.appendChild(span);
			}

			if (_showContainer) {
				const itemContainer = document.createElement("div");
				itemContainer.className = "item_container";

				const grid = document.createElement("div");
				grid.className = "grid";
				grid.appendChild(itemContainer);

				const div = document.createElement("div");
				div.appendChild(grid);

				const elm = MENU.Inventory.DrawItem(itemContainer, _item);
				if (elm && (_item.workorder || GAME_MANAGER.instance.IsEquipped(_item.id))) {
					elm.onclick = elm.ontouchmove = elm.ontouchstart = elm.onmousedown = null;
					_containerEnabled = false;
				}
				else {
					_containerEnabled = true;
				}

				_containerEnabled = _containerEnabled && _params.spellId !== 29;

				button && div.appendChild(button);
				content.appendChild(div);

				switch (_params.spellId) {
					case 29:
						updateConjurePreview();
						break;
					case 31:
						break;
					default:
						allowOpenInventory && MENU.Inventory.Open();
						break;
				}
			}
			else {
				button && footer.appendChild(button);
				_containerEnabled = false;
			}

			this.Display("left");

			if (_scrollTop) {
				_optionList.parentNode.scrollTop = _scrollTop;
				_scrollTop = 0;
			}
		};

		const selectTab = (tab, label) => {
			if (_currentTab != tab) {
				_filter && _filter.Clear();
				elm.className = `${label} left has_tabs`;
				_currentTab && _currentTab.classList.add("inactive");
				_currentTab = tab;
				tab.classList.remove("inactive");
			}
		};

		this.Redraw = () => {
			if (elm.parentNode) {
				_scrollTop = elm.getElementsByClassName("item_list")[0].scrollTop;
				this.Open(this.params);
			}
		};

		this.SetItem = item => {
			if ((elm.parentNode || MENU.Crafting.pending) && !(_item && _item.workorder)) {
				elm.parentNode && (_scrollTop = elm.getElementsByClassName("item_list")[0].scrollTop);
				this.Open(Object.assign(this.params, { item }));
			}
		};

		const updateConjurePreview = () => {
			if (!elm.parentNode || !_selection || typeof _selection !== "object") {
				return
			}

			if (_params.workorderBase === undefined) {
				_params.workorderBase = _item && _item.base ? _item.base : null;
			}

			if (_selection.appearance !== undefined) {
				const appearance = _sortedOptions[_selection.appearance];
				const { height, width, image_url, worn_image_url } = appearance;
				const color_variants = appearance.color_variants !== undefined ? appearance.color_variants : ["*"];
				_item = Object.assign(_item || {}, { base: { item_name: appearance.label, height, width, image_url, worn_image_url, color_variants } });
			}
			else if (_params.workorderBase) {
				_item = Object.assign(_item || {}, { base: _params.workorderBase });
			}
			else {
				_item = null;
			}

			if (_item) {
				if (_selection.color !== undefined) {
					const color = _sortedOptions[_selection.color];
					_item.variant_color = color.label;
				}
				else if (_item.variant_color !== undefined) {
					delete _item.variant_color;
				}

				if (_selection.accessory !== undefined) {
					const accessory = _sortedOptions[_selection.accessory];
					_item.variant_accessory = nameToRef(accessory.variant);
				}
				else if (_item.variant_accessory !== undefined) {
					delete _item.variant_accessory;
				}
			}

			const itemContainer = getItemContainer();
			if (itemContainer) {
				clearHTML(itemContainer);
				if (_item) {
					const elm = MENU.Inventory.DrawItem(itemContainer, _item);
					elm.onclick = elm.ontouchmove = elm.ontouchstart = elm.onmousedown = null;
				}
			}
		}

		const getItemContainer = () => elm.getElementsByClassName("item_container")[0];

		const apply = () => {
			const itemContainer = getItemContainer();
			if (itemContainer && itemContainer.childNodes.length == 0) {
				_item = null;
			}
			if (_selection && typeof _selection === "object" ? Object.keys(_selection).length === 0 : !Number.isInteger(_selection)) {
				return GUI.instance.DisplayMessage("You must select a option from the list");
			}
			if (Number.isInteger(_selection)) {
				const option = _sortedOptions[_selection];
				if (_itemRequired) {
					if (option.target !== undefined && !_item) {
						return GUI.instance.DisplayMessage("You must place an item in the container for the selected option");
					}
					if (option.target === undefined && _item) {
						return GUI.instance.DisplayMessage("The item container must be empty for this option");
					}
				}
				if (validOption(_option, _showContainer)) {
					if (hasCallback()) {
						_callback({ index: option.index, itemId: _item && !_item.workorder && _item.id || undefined });
						_callback = null;
						if (!_item || _item.workorder) {
							this.Close();
							if (GAME_MANAGER.instance.InScenario()) {
								MENU.Inventory.Close();
							}
						}
					}
					else {
						const obj = { itemId: _item && _item.id || undefined, optionId: option.id, appearance: _prototypeAppearance || undefined };
						if (_params.spellId === 31 && _prototypeSelection.length > 0) {
							obj.materials = _prototypeSelection.map(obj => obj && obj.id).filter(o => o);
						}
						GAME_MANAGER.instance.Send("Crafting", Object.assign(obj, _params.npc ? { npc: true } : { spellId: _params.spellId }));
					}
				}
			}
			else {
				const obj = {};
				for (let prop in _selection) {
					const option = _sortedOptions[_selection[prop]];
					if (!validOption(option, false)) {
						return false;
					}
					switch (prop) {
						case "appearance":
							obj.appearance = option.id;
							break;
						case "accessory":
							obj.accessory = option.variant;
							break;
						case "color":
							obj.color = option.label;
							break;
					}
				}
				if (obj.appearance === undefined) {
					obj.appearance = _item && _item.base && _item.base.id;
					if (!obj.appearance) {
						return GUI.instance.DisplayMessage("You must select an appearance for the conjured item");
					}
				}
				if (hasCallback()) {
					_callback(Object.assign(obj, { itemId: _item && !_item.workorder && _item.id || undefined }));
					_callback = null;
					if (!_item || _item.workorder) {
						this.Close();
						if (GAME_MANAGER.instance.InScenario()) {
							MENU.Inventory.Close();
						}
					}
				}
				else {
					const { username, index, slot } = _params;
					GAME_MANAGER.instance.Send("Crafting", Object.assign(obj, { username, index, slot, spellId: _params.spellId, itemId: _item && _item.id || undefined }));
				}
			}
		};

		function drawPrototypeOptions(parent, prototypeOptions) {
			const list = [];

			const div = document.createElement("div");
			div.className = "prototype_options";

			const updateImage = (parent, imageURL, width, height) => {
				const image = document.createElement("div");
				image.style.backgroundImage = `url(${formatMediaURL(imageURL, powCeil(61 * getMediaScale()))})`;
				image.style.backgroundSize = height > width ? "auto 90%" : Math.max(width, height) == 1 ? "91.27% auto" : "";
				parent.appendChild(image);
			};

			const updateUnknown = () => list[4].classList.toggle("unknown", _prototype && _prototype.known === false || false);

			for (let i = 0; i < 5; i++) {
				const option = document.createElement("div");
				const materials = i < 2 ? _componentIds : i === 2 ? _catalystIds : i === 3 ? _powerSourceIds : null;

				option.oncontextmenu = (e) => { option.onclick(e); e.preventDefault() };

				(i => {
					if (i === 4) {
						option.ontouchstart = option.onmouseenter = (e) => { _prototype && TOOLTIP.instance.ShowCraftingOption(e, _prototype) };
						option.onclick = async (e) => {
							if (_prototype && _prototype.known !== false && _prototype.appearances && _prototype.appearances.length > 0) {
								const appearance = await INPUT.instance.ShowAsAppearanceSelectionAsync(e, _prototype.appearances);
								if (appearance === false) {
									return;
								}
								clearHTML(option);
								_prototypeAppearance = appearance;
								const { image_url, width, height } = _prototype.appearances[appearance];
								updateImage(option, image_url, width, height);
							}
						};
					}
					else {
						option.ontouchstart = option.onmouseenter = (e) => {
							const base = _prototypeSelection[i];
							base && TOOLTIP.instance.ShowItem(e, { base });
						}
						option.onclick = async (e) => {
							const baseItem = await INPUT.instance.ShowAsMaterialSelectionAsync(e, materials);
							if (baseItem === false) {
								return;
							}
							if (_prototypeSelection[i] != baseItem) {
								clearHTML(option);
								clearHTML(list[4]);
								_prototypeAppearance = null;
								_prototypeSelection[i] = baseItem || null;
								_prototype = processCombination(prototypeOptions);
								baseItem && updateImage(option, baseItem.image_url, baseItem.width, baseItem.height);
								_prototype && updateImage(list[4], _prototype.image_url, _prototype.width, _prototype.height);
								updateUnknown();
							}
						};
					}
				})(i);

				div.appendChild(option);

				if (_prototypeSelection[i]) {
					if (GAME_MANAGER.instance.HasMaterial(_prototypeSelection[i].id)) {
						const { image_url, width, height } = _prototypeSelection[i];
						updateImage(option, image_url, width, height);
					}
					else {
						_prototypeSelection[i] = null;
					}
				}

				if (i < 4) {
					const c = document.createElement("div");
					c.textContent = i === 3 ? "=" : "+";
					div.appendChild(c);
				}

				list.push(option);
			}

			_prototype = processCombination(prototypeOptions);
			if (_prototype) {
				const { image_url, width, height } = _prototypeAppearance && _prototype.known !== false && _prototype.appearances && _prototype.appearances.length > 0 ? _prototype.appearances[_prototypeAppearance] : _prototype;
				updateImage(list[4], image_url, width, height);
			}
			updateUnknown();

			parent.appendChild(div);
			return div;
		}

		function processCombination(prototypeOptions) {
			const components = _prototypeSelection.slice(0, 2).filter(o => o).map(c => c.id).sort();
			const options = components.length > 0 ? prototypeOptions.filter(option => option.components && components.length === option.components.length && option.components.every((itemId, i) => components[i] === itemId)) : [];
			let prototype = options.find(o => o.prototype);
			if (prototype) {
				const [, , catalyst, battery] = _prototypeSelection;
				options.splice(options.indexOf(prototype), 1);
				prototype = Object.assign({}, prototype);
				if (catalyst) {
					prototype.menu_items = ["<Random Experimental>"];
					prototype.attributes = Attribute.Prototype | Attribute.Untradeable;
					prototype.disabled = catalyst.id !== 244;
				}
				if (battery) {
					prototype.enchantments = [batteryEnchantment];
				}
				options.sort((a, b) => a.known === b.known ? 0 : a.known === false ? 1 : -1);
				const quality = catalystToQuality(catalyst && catalyst.id);
				for (let i = 0; i < options.length; i++) {
					let enchantments;
					const option = options[i] = Object.assign({}, options[i]);
					if (option.known === false) {
						option.suppressTooltip = option.disabled = true;
					}
					else {
						// consider materials and quality of catalyst
					}
					option.attributes = Attribute.TradeLimited;
					if (battery) {
						option.enchantments = Array.isArray(option.enchantments) ? enchantments = option.enchantments.map(e => Object.assign({}, e, { charges: 100 })) : [batteryEnchantment];
					}
					if (quality) {
						enchantments = enchantments || (option.enchantments = Array.isArray(option.enchantments) ? option.enchantments.slice() : []);
						enchantments.push({ type: "quality", quality });
					}
					option.item = prototypeToItem(option);
					option.label = getItemName(option.item);
				}
				options.unshift(prototype);
			}
			else {
				options.length = 0;
			}
			displayOptions(options, false);
			return prototype || null;
		}

		function displayOptions(options, validateItem) {
			clearHTML(_optionList);
			_sortedOptions = options;
			if (options.length === 0) {
				return;
			}
			const [primary, secondary] = _item && (_item.enchantments || GAME_MANAGER.instance.GetEnchantments(_item.id)).reduce((arr, e) => { arr[e.primary ? 0 : e.secondary ? 1 : 2] = e; return arr }, []) || [];
			options.forEach((option, index) => {
				if (option.variants !== undefined) {
					let obj;
					for (let prop in option.variants) {
						let b = false;
						switch (prop) {
							case "magic":
								b = primary && primary.magic || secondary && secondary.magic;
								break;
							case "occult":
								b = primary && primary.occult || secondary && secondary.occult;
								break;
							case "blessed":
								b = primary && primary.blessed || secondary && secondary.blessed;
								break;
							case "hexed":
								b = _item && Attribute.IsHexed(_item.attributes);
								break;
						}
						if (b) {
							obj = Object.assign(obj || Object.assign({}, option), option.variants[prop]);
							break;
						}
					}
					option = obj || option;
				}

				const tr = document.createElement("tr");
				const label = document.createElement("td");
				label.textContent = option.label;
				tr.appendChild(label);

				const tags = document.createElement("td");
				tags.textContent = option.tags !== undefined ? option.tags.join(",") : "";
				tags.className = "tags";
				tr.appendChild(tags);

				const td = document.createElement("td");

				if (option.materials !== undefined) {
					const imageSize = powCeil(36 * getMediaScale());
					for (let material in option.materials) {
						const span = document.createElement("span");
						span.textContent = `${Math.max(option.materials[material] || 0, option.materials[material])}x`;
						td.appendChild(span);
						const image = materialToImage(material);
						if (image) {
							const div = document.createElement("div");
							div.className = "token";
							div.style.backgroundImage = `url(${formatMediaURL(image, imageSize)})`;
							td.appendChild(div);
						}
					}
				}
				else {
					const div = document.createElement("div");
					div.className = "token";
					td.appendChild(div);
				}

				tr.appendChild(td);

				if (!validOption(option, validateItem)) {
					tr.classList.add("invalid");
				}

				if (option.tab) {
					tr.classList.add(option.tab);
					if (_selection[option.tab] === index) {
						tr.classList.add("selected");
					}
				}
				else if (_selection === index) {
					tr.classList.add("selected");
					_option = option;
				}

				if (option.known === true) {
					tr.classList.add("known");
				}

				if (option.suppressTooltip !== true) {
					tr.ontouchstart = tr.onmouseenter = (e) => _params.spellId === 31 ? TOOLTIP.instance.ShowPrototype(e, option, option.item || prototypeToItem(option)) : TOOLTIP.instance.ShowCraftingOption(e, option, _item, _params.npc);
				}

				tr.onclick = () => {
					if (option.tab) {
						const selected = tr.parentNode.getElementsByClassName(`selected ${option.tab}`)[0];
						if (selected) {
							selected.classList.remove("selected");
						}
						if (_selection[option.tab] === index) {
							tr.classList.remove("selected");
							delete _selection[option.tab];
						}
						else {
							tr.classList.add("selected");
							_selection[option.tab] = index;
						}
						if (_params.spellId === 29) {
							updateConjurePreview();
						}
					}
					else if (_selection !== index) {
						const selected = tr.parentNode.getElementsByClassName("selected")[0];
						if (selected) {
							selected.classList.remove("selected");
						}
						tr.classList.add("selected");
						_selection = index;
						_option = option;
					}
				};

				_optionList.appendChild(tr);
			});
		}
	}

	function catalystToQuality(catalyst) {
		switch (catalyst) {
			case 244:
			default:
				return 0;
			case 245:
				return 1;
			case 246:
				return 2;
		}
	}

	function validOption(option, validateItem) {
		if (option.disabled) {
			return false;
		}
		if (option.materials !== undefined && !GAME_MANAGER.instance.HasMaterials(option.materials)) {
			return false;
		}
		if (option.disable_on_defeated && GAME_MANAGER.instance.recentlyDefeated) {
			return false;
		}
		if (validateItem) {
			if (_item) {
				if (option.usable_on_conjured !== true && Attribute.IsConjured(_item.attributes)) {
					return false;
				}
				if (option.usable_on_unidentified !== true && Attribute.IsUnidentified(_item.attributes)) {
					return false;
				}
				if (option.usable_on_conjured !== true && Attribute.IsConjured(_item.attributes)) {
					return false;
				}
				if (Attribute.IsHexed(_item.attributes)) {
					if (_params.spellId === 22 ? option.usable_on_hexed !== true : option.usable_on_hexed === false) {
						return false;
					}
				}
				if (option.usable_on_hexproof === false && Attribute.IsHexproof(_item.attributes)) {
					return false;
				}
				if (option.spell_id == 22 && option.materials && Object.keys(option.materials).some(material => material == "Sol Talisman")) {
					const enchantments = GAME_MANAGER.instance.GetEnchantments(_item.id).filter(e => e.tier);
					if (enchantments.length > 0 || removeFlag(_item.attributes, Attribute.MagicalProperties) != _item.attributes) {
						return false;
					}
				}
			}
			switch (option.target) {
				case "item":
					return _item != null;
				case "equipment":
					return _item && _item.base.type == "equipment";
				case "turnable":
					return _item && (_item.base.type === "equipment" || _item.base.types.includes("turnable"));
				case "enchantable":
					return _item && (_item.base.type === "equipment" || _item.base.types.includes("enchantable"));
				default:
					return _item == null;
			}
		}
		return true;
	}

	function prototypeToItem(prototype) {
		const base = Object.assign({}, prototype, { item_name: prototype.label, types: ["electronic"], enchantments: undefined });
		return { base, enchantments: prototype.enchantments, attributes: prototype.attributes || 0 };
	}

})();
