((window) => {
	MENU = {
		INVENTORY_TAB_WIDTH: 10,
		INVENTORY_TAB_HEIGHT: 5,
		HEIRLOOM_CONTAINER_HEIGHT: 3,
		STASH_TAB_WIDTH: 10,
		STASH_TAB_HEIGHT: 10,
		REAGENT_TAB_WIDTH: 10,
		REAGENT_TAB_HEIGHT: 4,
		TRADE_TAB_WIDTH: 10,
		TRADE_TAB_HEIGHT: 5,
		COOLDOWN_DURATION: 3000,
		Update,
		CloseAll: () => clearHTML(getMenus()),
		IsAnyOpen: () => getMenus().childElementCount > 0,
	};

	let _dialog;
	let _menus;
	let _menuRemoved;

	let prevChatOpen;

	const positions = ["left", "right"];

	const list = [];

	MENU.Menu = function Menu() {
		const [_elm, _onClose] = arguments;

		let _active = false;

		Object.defineProperties(this, {
			'elm': { value: _elm, writable: false },
			'menu': { get: () => _elm.parentNode ? _elm : null },
			'active': { get: () => _active },
		});

		this.Display = position => display(_elm, position, _onClose);

		this.Close = () => removeMenu(_elm);

		this.Enable = () => _elm.classList.remove("disabled");

		this.Disable = () => _elm.classList.add("disabled");

		this.PlaceItem = () => false;

		this.Toggle = () => !this.Close() && this.Open();

		this.Redraw = () => _elm.parentNode && this.Open();

		this.UpdateActive = () => {
			_active = _elm.parentNode != null;
			return _active;
		};

		list.push(this);
	};

	function display(menu, position, onClose) {
		const menus = getMenus();
		const changed = !menu.parentNode || position && !menu.classList.contains(position);

		if (changed && position) {
			for (const menu of Array.from(menus.getElementsByClassName(position))) {
				removeMenu(menu);
			}
			menu.classList.toggle("right", position === "right");
			menu.classList.toggle("left", position === "left");
		}

		const closeButtons = menu.getElementsByClassName("button close");
		for (let i = 0; i < closeButtons.length; i++) {
			if (closeButtons[i].parentNode == menu) {
				menu.removeChild(closeButtons[i]);
			}
		}

		if (onClose !== false) {
			drawButton(menu, onClose ? onClose : () => removeMenu(menu), "button close");
		}

		if (changed) {
			menus.appendChild(menu);
			if (!SETTINGS.Get("ignore_plugin_alert", !STANDALONE.client)) {
				waitForFrame().then(async () => isHidden(menu) && await GUI.instance.Alert("A plugin seems to be messing with the game", "Close", "Don't show this again", "Please turn off any ad-blockers and other plugins that might make changes to the website and prevent the game from running correctly") === false && SETTINGS.Set("ignore_plugin_alert", 1));
			}
		}
	};

	const removeMenu = menu => {
		if (menu && menu.parentNode) {
			menu.parentNode.removeChild(menu);
			LOCK.GetFirstBaton(removeMenu) && waitForFrame().then(() => _menuRemoved = false).finally(() => LOCK.RemoveBaton(removeMenu));
			return _menuRemoved = true;
		}
		return false;
	}

	function isHidden(elm) {
		if (_menuRemoved) {
			return false;
		}
		const rect = elm.getBoundingClientRect();
		if (rect.height == 0) {
			return true;
		}
		try {
			const obj = window.getComputedStyle(elm);
			const { display, visiblity, opacity } = obj;
			return display === "none" || visiblity && (visiblity === "hidden" || visiblity === "collapse") || opacity !== undefined && parseInt(opacity) === 0 || obj["content-visibility"] === "hidden";
		}
		catch {
			return false;
		}
	}

	function drawTitle(parent, textContent) {
		const title = document.createElement("div");
		title.className = "title";
		textContent && (title.textContent = textContent);
		parent && parent.appendChild(title);
		return title;
	}

	function clearMenuClasses(elm) {
		Array.from(elm.classList).forEach(clss => clss !== "left" && clss !== "right" && elm.classList.remove(clss));
	}

	function drawButton(parent, onClick, ...classes) {
		const button = document.createElement("div");
		button.className = classes.join(" ");
		onClick && (button.onclick = () => !button.classList.contains("inactive") && onClick());
		parent && parent.appendChild(button);
		return button;
	}

	function drawFormattingButton(parent, guide) {
		const btn = drawButton(parent, () => window.open("/formatting.php" + (guide ? `?${guide}=1` : '')), "button formatting");
		btn.ontouchstart = btn.onmouseenter = e => TOOLTIP.instance.Show(e, getString("Open the text formatting guide"));
		return btn;
	}

	function drawToggle(parent, id, title, tooltip) {
		const li = document.createElement("li");
		li.className = "enable";

		const input = document.createElement("input");
		input.type = "checkbox";
		input.id = id;

		const label = document.createElement("label");
		label.htmlFor = input.id;
		label.ontouchstart = label.onmouseenter = (e) => TOOLTIP.instance.Show(e, tooltip);

		const span = document.createElement("span");
		span.textContent = getString(title);

		label.appendChild(span);
		li.appendChild(input);
		li.appendChild(label);
		parent && parent.appendChild(li);
		return input;
	}

	function drawTabLabel(parent, tab) {
		const div = document.createElement("div");
		const span = document.createElement("span");
		div.className = "inactive";
		span.textContent = typeof tab === "string" ? tab : tab.name || (tab.index + 1);
		div.appendChild(span);
		parent && parent.appendChild(div);
		return div;
	}

	function drawDropdown(parent, id, label, tooltip, options) {
		const div = label && document.createElement("div");
		const select = document.createElement("select");
		id && (select.id = id);

		if (div) {
			div.textContent = getString(label);
			div.style.width = "fit-content";
			tooltip && (div.ontouchstart = div.onmouseenter = (e) => TOOLTIP.instance.Show(e, tooltip));
			parent.appendChild(div);
		}

		for (const entry of options) {
			const option = document.createElement("option");
			option.value = nameToRef(entry);
			option.textContent = getString(entry);
			select.appendChild(option);
		}

		parent.appendChild(select);

		return select;
	}

	function drawHeader(parent, title) {
		const header = document.createElement("h3");
		header.textContent = getString(title);
		parent && parent.appendChild(header);
		return header;
	}

	function drawForm(parent) {
		const form = document.createElement("form");
		form.autocomplete = "off"
		form.method = "post";
		form.action = "#";
		form.onsubmit = () => false;
		parent && parent.appendChild(form);
		return form;
	}

	function drawInputField(parent, id, placeholder = null) {
		const input = document.createElement("input");
		input.type = "text";
		input.id = id;
		input.name = id;
		placeholder && (input.placeholder = getString(placeholder));
		parent && parent.appendChild(input);
		return input;
	}

	function Update() {
		let openChat;
		const changed = list.reduce((changed, menu) => {
			if (menu.active != menu.UpdateActive()) {
				if (menu === MENU.Stash) {
					MENU.Inventory.depositButton.classList.toggle("inactive", !menu.active);
				}
				if (menu.active) {
					if (CURSOR.instance.IsMouseOver(menu.elm)) {
						TOOLTIP.instance.Hide();
					}
					if (menu === MENU.Stash || menu === MENU.Trade || menu === MENU.Vendor) {
						prevChatOpen = prevChatOpen || LOCAL_CHAT.Close(GUI.Position.Left);
						openChat = false;
					}
				}
				else {
					if (isDescendant(menu.elm, TOOLTIP.instance.trigger)) {
						TOOLTIP.instance.Hide();
					}
					if (isDescendant(menu.elm, INPUT.instance.trigger)) {
						INPUT.instance.Hide();
					}
					if (menu === MENU.Stash) {
						GAME_MANAGER.instance.Send("Inventory", { stash: { open: false } });
					}
					else if (menu === MENU.Trade) {
						MENU.Trade.CancelTrade();
						if (!MENU.Trade.accepted) {
							MENU.Inventory.Close();
						}
						const inventory = GAME_MANAGER.instance.inventory;
						if (inventory.trade !== undefined) {
							if (!MENU.Trade.accepted || !MENU.Trade.username) {
								const items = unique(inventory.trade).map(itemId => GAME_MANAGER.instance.GetItem(itemId)).filter(item => item);
								if (items.length > 0) {
									let inventoryImage = GAME_MANAGER.instance.GetInventoryImage();
									const containers = MENU.Inventory.GetContainerInfo(inventoryImage);
									let success = !items.some(item => {
										for (const container of containers) {
											const position = MENU.Inventory.FindValidPosition(item, container.positions, container.width, container.height);
											if (burnPosition(item, container.positions, position, container.width, container.height)) {
												return false;
											}
										}
										return true;
									});
									if (!success) {
										inventoryImage = MENU.Trade.inventory;
										success = inventoryImage && GAME_MANAGER.instance.SynchronizeInventoryImage(Object.assign(inventoryImage, { trade: [] }));
									}
									if (success) {
										GAME_MANAGER.instance.UpdateInventory(Object.assign(inventoryImage, { trade: [] }), true);
										CURSOR.instance.ValidateItem();
									}
								}
							}
							delete inventory.trade;
						}
					}
					if (menu === MENU.Stash || menu === MENU.Trade || menu === MENU.Vendor) {
						openChat = openChat !== false;
					}
				}
				return true;
			}
			return changed;
		}, false);
		if (openChat) {
			prevChatOpen && LOCAL_CHAT.player.Show();
			prevChatOpen = false;
		}
		if (changed) {
			const menus = getMenus();
			if (MENU.Crafting.pending) {
				if (!menus.getElementsByClassName("left")[0]) {
					MENU.Crafting.Open();
				}
				if (MENU.Crafting.full && !menus.getElementsByClassName("right")[0]) {
					MENU.Inventory.Open();
				}
			}
			if (MENU.Loot.menu || GAME_MANAGER.instance.loot) {
				if (MENU.Loot.menu) {
					MENU.Loot.UpdatePosition();
				}
				else {
					MENU.Loot.Open();
				}
			}
			for (const position of positions) {
				container.classList.toggle(`menu_${position}`, menus.getElementsByClassName(position).length > 0);
			}
			menus.style.zIndex = menus.getElementsByClassName("menu_large").length > 0 ? 15 : null;
		}
	}

	function getDialog() {
		return _dialog || (_dialog = container && document.getElementById("dialog"));
	}

	function getMenus() {
		return _menus || (_menus = container && document.getElementById("menus"));
	}

	function onMouseDown(e) {
		const dialog = getDialog();
		if (dialog && !isDescendant(dialog, e.target)) {
			if (MENU.Stash.menu || MENU.Trade.menu) {
				prevChatOpen = LOCAL_CHAT.Close(GUI.Position.Left) || prevChatOpen;
			}
		}
		const menus = getMenus();
		if (menus && isDescendant(menus, e.target)) {
			for (let i = menus.childNodes.length - 1; i >= 0; i--) {
				const menu = menus.childNodes[i];
				if (menu === e.target || isDescendant(menu, e.target)) {
					if (menus.lastChild !== menu) {
						for (i++; i < menus.childNodes.length; i++) {
							const list = Array.from(menus.childNodes[i].getElementsByTagName("*")).filter(elm => elm.scrollTop + elm.scrollLeft > 0).map(elm => [elm, elm.scrollTop, elm.scrollLeft]);
							menus.insertBefore(menus.childNodes[i], menu);
							list.forEach(arr => { arr[0].scrollTop = arr[1]; arr[0].scrollLeft = arr[2] });
						}
					}
					break;
				}
			}
		}
	}

	document.addEventListener('mousedown', onMouseDown);
	document.addEventListener('ontouchstart', onMouseDown);

	window.drawForm = drawForm;
	window.drawTitle = drawTitle;
	window.drawButton = drawButton;
	window.drawToggle = drawToggle;
	window.drawHeader = drawHeader;
	window.drawTabLabel = drawTabLabel;
	window.drawDropdown = drawDropdown;
	window.drawInputField = drawInputField;
	window.drawFormattingButton = drawFormattingButton;
	window.clearMenuClasses = clearMenuClasses;
})(window);
