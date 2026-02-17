(() => {
	const DESIRE_IMAGE_URL = "/game/assets/effects/addiction.png";

	TOOLTIP = {
		Stat: {
			Strength: 1,
			Dexterity: 2,
			Intelligence: 3,
			Willpower: 4,
			Action: 5,
			Spell: 6,
			Body: 7,
			Mind: 8,
			Hit: 9,
			Evasion: 10,
			Penetration: 11,
			Resistance: 12,
		},
		Tag: {
			Absorption: 13,
			Animal: 14,
			Anthro: 15,
			Inanimate: 16,
			Monster: 17,
			Sissification: 18,
			Transgender: 19,
		},
		Spell: {
			Expand: 22,
			Collapse: 21,
		},
		Sexuality: {
			FM: 100,
			FF: 101,
			MM: 102,
			FM_FeminineWithPhallus: 103,
			FM_MasculineWithVagina: 104,
			FF_PhallusOnVagina: 105,
			FF_PhallusOnPhallus: 106,
			MM_PhallusOnVagina: 107,
			MM_VaginaOnVagina: 108,
		},
	};

	TOOLTIP.Update = () => _instance && _instance.Update();

	let _instance;

	Object.defineProperty(TOOLTIP, 'instance', { get: () => _instance || (_instance = new Tooltip()) });

	const EPSILON = 2.220446049250313e-16;

	const findGlitterColor = /^(.*)_glitter$/;
	const findColorParts = /^([^_]*)_(.*)$/;

	TOOLTIP.GetStatusRemainingTime = s => {
		s = Math.max(0, Math.floor(s));
		if (s < 60) {
			return getText(`{0} second${s != 1 ? 's' : ''} remaining`, s);
		}
		if (s < 60 * 60) {
			const m = Math.floor(s / 60);
			return getText(`{0} minute${m > 1 ? 's' : ''} remaining`, m);
		}
		const h = Math.floor(s / 60 / 60);
		return getText(`{0} hour${h > 1 ? 's' : ''} remaining`, h);
	}

	TOOLTIP.CalculateStats = obj => {
		const stats = {};
		if (obj && obj.stats) {
			const { strength, dexterity, intelligence, willpower } = obj.stats;
			if (strength) {
				stats.action = { total: Math.max(strength / 3 + obj.stats.action + EPSILON, 0).toFixed(2), base: (strength / 3).toFixed(2), bonus: obj.stats.action.toFixed(2) };
				stats.body = { total: Math.floor(Math.max(strength * 50 + obj.stats.body, 1)), base: Math.floor(strength * 50), bonus: Math.floor(obj.stats.body) };
				stats.strength = { total: strength.toFixed(2) };
			}
			if (dexterity) {
				stats.evasion = { total: Math.max(dexterity + obj.stats.evasion, 0).toFixed(2), base: dexterity.toFixed(2), bonus: obj.stats.evasion.toFixed(2) };
				stats.hit = { total: Math.max(dexterity + obj.stats.hit, 0).toFixed(2), base: dexterity.toFixed(2), bonus: obj.stats.hit.toFixed(2) };
				stats.dexterity = { total: dexterity.toFixed(2) };
			}
			if (intelligence) {
				stats.spell = { total: Math.max(intelligence / 3 + obj.stats.spell + EPSILON, 1).toFixed(2), base: (intelligence / 3).toFixed(2), bonus: obj.stats.spell.toFixed(2) };
				stats.mind = { total: Math.floor(Math.max(intelligence * 50 + obj.stats.mind, 1)), base: Math.floor(intelligence * 50), bonus: Math.floor(obj.stats.mind) };
				stats.intelligence = { total: intelligence.toFixed(2) };
			}
			if (willpower) {
				stats.resistance = { total: Math.max(willpower + obj.stats.resistance, 0).toFixed(2), base: willpower.toFixed(2), bonus: obj.stats.resistance.toFixed(2) };
				stats.penetration = { total: Math.max(willpower + obj.stats.penetration, 0).toFixed(2), base: willpower.toFixed(2), bonus: obj.stats.penetration.toFixed(2) };
				stats.willpower = { total: willpower.toFixed(2) };
			}
		}
		return stats;
	}

	TOOLTIP.GetContent = tooltip => {
		switch (tooltip) {
			case TOOLTIP.Stat.Strength:
				return getString("Strength is a measurement of your physical constitution and is the basis for the number of actions you can perform. For every one point you gain 50 Max Body and for every third point you gain 1 Max Action");
			case TOOLTIP.Stat.Action:
				return getString("You regain uncapped Max Actions as Actions each minute, in increments. Increases in Max Actions affect damage dealt with spells adversely");
			case TOOLTIP.Stat.Body:
				return getString("You are defeated when your Body reaches zero");
			case TOOLTIP.Stat.Dexterity:
				return getString("Dexterity is a measurement of your agility and physical prowess. Having more dexterity improves your ability to land and avoid hits and powerful attacks");
			case TOOLTIP.Stat.Hit:
				return getString("Damage dealt with attacks is increased by your Hit - target's Evasion &times; 10%");
			case TOOLTIP.Stat.Evasion:
				return getString("Damage taken from attacks is reduced by your Evasion - attacker's Hit &times; 10%");
			case TOOLTIP.Stat.Intelligence:
				return getString("Intelligence is a measurement of your mental constitution and is the basis for the number of spells you can cast. For every one point you gain 50 Max Mind and and for every third point you gain 1 Max Spell");
			case TOOLTIP.Stat.Spell:
				return getString("You regain a ninth of uncapped Max Spells as Spell actions each time you perform a non-spell attack");
			case TOOLTIP.Stat.Mind:
				return getString("Blocked damage is taken from your Mind before your Body and chance to block is 100 - your Lust (%). While your Mind is zero or your Lust is max, you are mindless and unable to block. While you are able to block, you are unaffected by mental ailments, have a 50% chance to suppress mental changes, and ignore changes from non-spell attacks");
			case TOOLTIP.Stat.Willpower:
				return getString("Willpower is a measurement of your strength of character and mental prowess. Having more willpower makes it easier for you to force your will on others while resisting theirs in turn");
			case TOOLTIP.Stat.Penetration:
				return getString("Damage dealt with spells is increased by your Penetration - target's Resistance &times; 10%");
			case TOOLTIP.Stat.Resistance:
				return getString("Damage taken from spells is reduced by your Resistance - caster's Penetration &times; 10%");
			case TOOLTIP.Spell.Expand:
				return getString("Click to show spell variants");
			case TOOLTIP.Spell.Collapse:
				return getString("Click to hide spell variants");
			case TOOLTIP.Tag.Absorption:
				return getString("Enables content where people are absorbed into someone else's body.<br/>This tag is required for the possibility of becoming someone else's breasts, vagina, or penis, among other things.");
			case TOOLTIP.Tag.Animal:
				return getString("Enables content where people turn into animals.<br/>This tag is required for the possibility of turning into an animal and gaining particularly animalistic traits, such as becoming quadruped.");
			case TOOLTIP.Tag.Anthro:
				return getString("Enables content where people become anthropomorphic.<br/>This tag is required for the possibility of faces to become animal-like.");
			case TOOLTIP.Tag.Inanimate:
				return getString("Enables content where people turn into inanimate objects.<br/>This tag is required for the possibility of turning into clothes, furniture, sex toys, and other items.");
			case TOOLTIP.Tag.Monster:
				return getString("Enables content where people become monster girls or boys.<br/>This tag enables some animal traits and is required for the possibility of gaining most traits associated with mythical and otherworldly creatures.");
			case TOOLTIP.Tag.Sissification:
				return getString("Enables content where men are made to look womanly.<br/>This tag is required for male characters to grow breasts.");
			case TOOLTIP.Tag.Transgender:
				return getString("Enables content where men turn into women and vice versa.<br/>When paired with sissification, gender transformations will usually happen more gradually.");
			case TOOLTIP.Sexuality.FM:
				return getString("Enables sexual content between masculine and feminine characters");
			case TOOLTIP.Sexuality.FM_FeminineWithPhallus:
				return getString("Whether you want to experience sexual content between masculine characters and feminine characters with a penis or strap-on");
			case TOOLTIP.Sexuality.FM_MasculineWithVagina:
				return getString("Whether you want to experience sexual content between feminine characters and masculine characters with a vagina");
			case TOOLTIP.Sexuality.FF:
				return getString("Enables sexual content between feminine characters");
			case TOOLTIP.Sexuality.FF_PhallusOnVagina:
				return getString("Whether you want to experience sexual content between feminine characters, where one has a vagina and another has a penis or strap-on");
			case TOOLTIP.Sexuality.FF_PhallusOnPhallus:
				return getString("Whether you want to experience sexual content between feminine characters with a penis or strap-on");
			case TOOLTIP.Sexuality.MM:
				return getString("Enables sexual content between masculine characters");
			case TOOLTIP.Sexuality.MM_PhallusOnVagina:
				return getString("Whether you want to experience sexual content between masculine characters, where one has a vagina and another has a penis or strap-on");
			case TOOLTIP.Sexuality.MM_VaginaOnVagina:
				return getString("Whether you want to experience sexual content between masculine characters with a vagina");
			default:
				return null;
		}
	};

	TOOLTIP.GetItemContent = (item, tier, equipped, showHints = true) => {
		let description;

		const wrapper = document.createElement("div");
		wrapper.className = "item_tooltip";

		const enchantments = item.enchantments || GAME_MANAGER.instance.GetEnchantments(item.id);

		if (SETTINGS.Get("item_image_tooltip", true)) {
			const div = document.createElement("div");
			const using_worn = item.base.worn_image_url && (equipped || item.base.tooltip_always_show_worn !== false);
			const pixelated = item.base.nsfw && SETTINGS.Get("sfw", false);
			const image = using_worn ? IMAGE_PROCESSING.getWornItemImage(item, tier, null, 200, 0, pixelated) : IMAGE_PROCESSING.getItemImage(item, tier, 200, 0, pixelated);

			div.style.backgroundImage = `url(${image})`;
			div.style.backgroundSize = using_worn ? "contain" : null;
			div.style.imageRendering = pixelated ? "pixelated" : null;
			div.className = "item_image " + (!using_worn ? `item_${item.base.width}x${item.base.height}` : item.base.tooltip_worn_square === true ? "item_2x2" : "item_2x3");

			loadImage(image).catch(() => {
				div.style.backgroundImage = `url(${formatMediaURL("/game/assets/spells/missing.png", powCeil(256 * getMediaScale()))})`;
				div.style.imageRendering = null;
				div.classList.remove("item_outline_white");
			});

			div.classList.toggle("item_outline_white", MENU.Inventory.ItemHasOutline(item, tier));

			const conjured = Attribute.IsConjured(item.attributes);
			const hexed = Attribute.IsHexed(item.attributes);

			if (conjured || hexed || enchantments.some(e => e.tier)) {
				const magicalEffect = document.createElement("div");
				const square = using_worn ? item.base.tooltip_worn_square === true : item.base.width == item.base.height || item.base.height <= 2 && item.base.width <= 2;
				magicalEffect.className = `magical_effect${hexed ? " hexed" : ''}${conjured ? " conjured" : ''}${square ? " square" : ''}`;
				magicalEffect.appendChild(div);
				wrapper.appendChild(magicalEffect);
			}
			else {
				wrapper.appendChild(div);
			}
		}

		const div = document.createElement("div");
		div.className = "item_details";
		wrapper.appendChild(div);

		const itemName = document.createElement("div");
		itemName.className = "item_name";
		div.appendChild(itemName);

		const variant_color = item.variant_color || item.base.default_color;

		if (variant_color) {
			const subdiv = document.createElement("div");
			subdiv.className = "color_variant";
			subdiv.textContent = getString(variant_color);

			const colorRef = nameToRef(variant_color);
			const glitter = colorRef.match(findGlitterColor);
			const color = glitter ? glitter[1] : colorRef;
			if (glitter) {
				subdiv.classList.add("glitter");
			}
			switch (color) {
				case "black":
				case "navy":
				case "blue":
				case "indigo":
				case "dark_blue":
				case "dark_red":
				case "dark_green":
					if (glitter) {
						subdiv.classList.add(color);
					}
					subdiv.classList.add("black");
					subdiv.style.color = color.replace("_", "");
					break;
				case "amethyst":
					subdiv.classList.add("black");
					subdiv.classList.add(color);
					break;
				case "vermilion":
				case "metallic":
				case "silver":
				case "gold":
				case "cream":
				case "invisible":
				case "sapphire":
				case "mustard":
				case "sunset":
				case "carrot":
				case "rust":
				case "amaranth":
				case "indian_red":
				case "cow_pattern":
				case "marble":
				case "tie_dye":
				case "camouflage":
				case "rainbow":
				case "astral":
				case "galaxy":
				case "northern_light":
					subdiv.classList.add(color);
					break;
				case "rainbow_dust":
				case "blue_camouflage":
				case "snow_camouflage":
				case "desert_camouflage":
				case "dirt_camouflage":
				case "ice_tie_dye":
				case "bleach_tie_dye":
					const parts = color.match(findColorParts);
					if (parts) {
						subdiv.classList.add(parts[1]);
						subdiv.classList.add(parts[2]);
					}
					break;
				default:
					if (glitter) {
						subdiv.classList.add(color);
					}
					subdiv.style.color = color.replace("_", "");
					break;
			}

			div.appendChild(subdiv);
		}

		const types = getBaseItemTypes(item.base);
		const displayTypes = MENU.Inventory.displayTypes.filter(type => types.includes(type));

		if (displayTypes.length > 0) {
			const subdiv = document.createElement("div");
			subdiv.className = "item_type";
			subdiv.textContent = displayTypes.map(type => firstToUpperCase(type)).join(", ");
			div.appendChild(subdiv);
		}

		if (item.base.stack && item.base.stack > 1) {
			const stack = document.createElement("div");
			stack.className = "stack";
			stack.textContent = item.base.stack;
			div.appendChild(stack);
		}

		const hints = item.base.hints !== undefined ? item.base.hints.slice() : [];
		const ul = document.createElement("ul");

		if (Attribute.IsUnidentified(item.attributes)) {
			const li = document.createElement("li");
			li.textContent = getString("Unidentified");
			li.className = "hex";
			ul.appendChild(li);
		}

		if (types.includes("electronic")) {
			const electronic = enchantments.find(e => e.type === "electronic");
			const charges = electronic && electronic.charges || 0;
			const charge = document.createElement("div");
			charge.className = "charge" + (charges >= 100 ? " max" : charges == 0 ? " depleted" : '');
			charge.innerHTML = `<em>🗲 Charge: </em><span>${charges}</span>`;
			div.appendChild(charge);
		}

		if (enchantments.some(e => e.actions && e.actions.length > 0)) {
			const actions = enchantments.reduce((arr, e) => { e.actions && e.actions.length > 0 && arr.push(...e.actions); return arr }, []);
			const menuItems = [];
			for (const action of actions.filter((action, i) => actions.findIndex(a => a.id === action.id) === i)) {
				const actioName = getSpellFullyQualifiedName(action);
				switch (action.on_trigger) {
					case 1:
						menuItems.push(getText("Triggers [{0}] when worn", actioName));
						continue;
				}
				if (action.tags && action.tags.includes("Attack")) {
					menuItems.push(getText("Grants [{0}] Attack", actioName));
				}
				else {
					menuItems.push(getText("Grants [{0}] Action", actioName));
				}
			}
			for (const entry of menuItems) {
				const li = document.createElement("li");
				li.innerHTML = entry;
				ul.appendChild(li);
			}
		}

		if (Attribute.IsUnknownHexed(item.attributes)) {
			const random = new Random(item.id);
			const glyphs = "AEGNOcdeghkinxus";
			for (let i = 0; i < 2; i++) {
				const li = document.createElement("li");
				let g = glyphs;
				let str = "";
				do {
					const c = g[Math.floor(random.NextNumber() * g.length)];
					str += c;
					g = g.replace(c, "");
				}
				while (str.length < 8);
				li.innerHTML = `<span class="type">${getText("{0} modifier", `${getString("Unknown")} ${getString("Hexed").toLowerCase()}`)}<br/></span>${str}`;
				li.className = "hex unknown";
				ul.appendChild(li);
			}
		}
		else {
			const filteredEnchantments = enchantments.filter(e => e && e.mods);
			filteredEnchantments.sort((a, b) => a.primary == b.primary ? 0 : a.primary ? -1 : 1);
			for (const enchantment of filteredEnchantments) {
				for (let mod in enchantment.mods) {
					const li = document.createElement("li");
					let content = enchantment.mods[mod] >= 0 ? "+" : '';
					if (enchantment.mods[mod] < 0) {
						li.className = "hex";
					}
					const range = enchantment.range && enchantment.range[mod];
					switch (mod) {
						case "body":
						case "mind":
							content += `${enchantment.mods[mod]}${range ? `<span class="range">${range[0]} — ${range[1]}</span>` : ''} ${firstToUpperCase(mod)}`;
							break;
						default:
							content += `${enchantment.mods[mod].toFixed(2)}${range ? `<span class="range">${range[0].toFixed(2)} — ${range[1].toFixed(2)}</span>` : ''} ${firstToUpperCase(mod)}`;
							break;
					}
					const modTypes = unique([enchantment.primary ? getString("Primary") : enchantment.secondary && getString("Secondary"), enchantment.mods[mod] < 0 ? getString("Hexed") : enchantment.magic ? getString("Magic") : enchantment.occult ? getString("Occult") : enchantment.blessed && getString("Blessed")]);
					li.innerHTML = `<span class="type">${firstToUpperCase(getText("{0} modifier", modTypes.join(" ")).toLowerCase().trim())}<br/></span>${content}`;
					ul.appendChild(li);
				}
			}
		}

		if (Attribute.IsHexproof(item.attributes)) {
			const li = document.createElement("li");
			li.textContent = getString("Hexproof");
			hints.push("Hexproof protects the item against hexes and conjured effects");
			ul.appendChild(li);
		}

		if (Attribute.HasAmber(item.attributes)) {
			const li = document.createElement("li");
			li.textContent = getString("Nymph's Tear");
			hints.push("Nymph's Tear causes a hexed item to act as a non-hexed item");
			ul.appendChild(li);
		}

		if (item.base.menu_items !== undefined) {
			for (const menuItem of item.base.menu_items) {
				const li = document.createElement("li");
				li.textContent = trimPunctuations(menuItem);
				ul.appendChild(li);
			}
		}

		if (isTradeLimited(item)) {
			const untradeable = isUntradeable(item);
			const li = document.createElement("li");
			li.innerHTML = `<span>${untradeable ? "Cannot be traded" : "Can be traded once"}</span>`;
			li.className = "trade_padlock";
			li.classList.toggle("open", !untradeable);
			ul.appendChild(li);
		}

		ul.childElementCount > 0 && div.appendChild(ul);

		itemName.textContent = getItemName(item, enchantments, types);

		const accessoryReference = item.variant_accessory && nameToRef(item.variant_accessory);

		if (accessoryReference) {
			const accessoryNoun = item.variant_accessory.replace(/_/g, " ").toLowerCase();
			switch (accessoryReference) {
				case "cross":
				case "heart":
				case "bat":
				case "yin_yang":
				case "triquetra":
					description = getText("This item has a {0} symbol", accessoryNoun);
					break;
				case "ankh":
				case "ouroboros":
					description = getText("This item has an {0} symbol", accessoryNoun);
					break;
				case "skull":
				case "calavera_skull":
				case "pentacle":
				case "moon":
				case "sun":
				case "snake":
					description = getText("This item has a {0} mark", accessoryNoun);
					break;
				case "heavy_chains":
				case "fine_chains":
				case "cone_studs":
				case "pyramid_studs":
				case "star_studs":
				case "spikes":
				case "ribbons":
				case "holly":
				case "lace":
					description = getText("This item has been decorated with {0}", accessoryNoun);
					break;
				case "key":
				case "padlock":
				case "cowbell":
				case "bell":
				case "belt":
				case "zipper":
				case "dreamcatcher":
					description = getText("This item has a {0} attached", accessoryNoun);
					break;
			}
		}

		if (description) {
			const subdiv = document.createElement("div");
			subdiv.className = "accessory_variant";
			subdiv.textContent = description;
			div.appendChild(subdiv);
		}

		if (item.character && item.character.name) {
			const character = document.createElement("div");
			character.className = `player_turned ${item.character.nature.toLowerCase()}`;
			let span = document.createElement("span");
			span.textContent = item.character.name;
			character.appendChild(span);
			if (item.character.id_token == undefined) {
				character.classList.add("retired");
			}
			if (item.character.permanent) {
				span = document.createElement("span");
				span.className = "lock";
				character.appendChild(span);
			}
			if (item.character.sealed && item.character.id_token !== undefined) {
				span = document.createElement("span");
				span.textContent = ` (${getString("Sealed")})`;
				character.appendChild(span);
			}
			div.appendChild(character);
		}

		if (!item.workorder) {
			if (item.base.actions !== undefined && item.base.actions.Use !== undefined) {
				switch (item.base.actions.Use.target) {
					case "item":
						hints.push("Use this on an item to apply its effects");
						break;
					case "equipment":
						hints.push("Use this on an equipment item to apply its effects");
						break;
				}
			}

			switch (item.base.type) {
				case "consumable":
					hints.push("Drag onto your character to use");
					break;
				case "equipment":
					if (!equipped) {
						hints.push("Drag onto character or equipment slot to equip");
					}
					break;
				default:
					const material = types.includes("material");
					const component = types.includes("component");
					if (material || component) {
						if ((item.base.type === "material" || item.base.type === "component") && material && component) {
							hints.push("Used for crafting elecronic devices and in spellcasting");
						}
						else if (item.base.type === "material") {
							hints.push("This item is used for spellcasting");
						}
						else if (item.base.type === "component") {
							hints.push("Used for crafting elecronic devices");
						}
					}
					break;
			}

			if (Attribute.IsConjured(item.attributes)) {
				hints.push(Attribute.IsTemporary(item.attributes) ? "This item will disappear when unequipped" : "This item is concealing another item");
			}
		}

		if (item.base.description !== undefined) {
			const description = document.createElement("div");
			description.className = "description";
			description.textContent = item.base.description;
			div.appendChild(description);
		}

		if (showHints !== false) {
			if (Attribute.IsPrototype(item.attributes)) {
				hints.push("Test prototypes to discover new inventions");
			}
			for (const entry of hints) {
				const hint = document.createElement("div");
				hint.className = "hint";
				hint.textContent = getString(entry);
				div.appendChild(hint);
			}
		}

		if (item.price !== undefined) {
			const price = typeof item.price === "number" ? { Crown: item.price } : item.price;
			const imageSize = powCeil(36 * getMediaScale());
			const cost = document.createElement("div");
			cost.className = "cost";
			for (let material in price) {
				const span = document.createElement("span");
				span.textContent = `${commaSeparatedThousands(Math.max(price[material] || 0, price[material]))}${material != "Crown" ? "x " : ''}`;
				cost.appendChild(span);
				const image = materialToImage(material);
				if (image) {
					const div = document.createElement("div");
					div.className = "token" + (material == "Crown" ? " coin" : '');
					div.style.backgroundImage = `url(${formatMediaURL(image, imageSize)})`;
					cost.appendChild(div);
					if (material != "Crown") {
						const span = document.createElement("span");
						span.textContent = ` ${material}`;
						cost.appendChild(span);
					}
				}
				else {
					span.textContent += material;
				}
			}
			if (typeof item.price !== "number" && !GAME_MANAGER.instance.HasMaterials(price)) {
				cost.classList.add("invalid");
			}
			div.appendChild(cost);
		}

		return wrapper;
	};

	function Tooltip() {
		const _tooltip = document.getElementById("tooltip");

		let _timers = Object.freeze([]);

		let _prevActive;
		let _touchCount;
		let _trigger;
		let _event;

		const { Head, Body, Legs, Arms, Wings, Tail, Horns, Ears, Skin, BreastSize, Genitalia, GenitaliaSize } = CHARACTER;

		_tooltip.classList.toggle("item_details", SETTINGS.Get("item_details_tooltip", false));

		document.addEventListener('keydown', updateDetails);
		document.addEventListener('keyup', updateDetails);

		document.addEventListener("mouseup", () => _prevActive && this.Hide());
		document.addEventListener("ontouch", update);
		document.addEventListener("mousedown", update);

		function updateDetails(e) {
			_tooltip.classList.toggle("ctrl", e.ctrlKey);
		}

		function update() {
			_prevActive = !_tooltip.classList.contains("inactive");
		}

		Object.defineProperties(this, {
			'trigger': { get: () => _trigger },
			'event': { get: () => _event },
			'timers': { get: () => _timers },
			'visible': { get: () => !_tooltip.classList.contains("inactive") },
		});

		this.ShowStatus = (e, obj) => {
			const div = document.createElement("div");
			const lustValue = roundChance(clamp01(obj.lust || 0) * 100);

			const lust = document.createElement("div");
			lust.className = "lust";
			lust.textContent = getText("Lust: {0}", lustValue == 100 ? getString("Max") : lustValue);
			div.appendChild(lust);

			const mind = document.createElement("div");
			mind.className = "mind";
			mind.textContent = getText("Mind: {0}/{1}", Math.floor(obj.mind || 0), Math.floor(obj.maxMind || 1));
			div.appendChild(mind);

			const body = document.createElement("div");
			body.className = "body";
			body.textContent = getText("Body: {0}/{1}", Math.floor(obj.body || 0), Math.floor(obj.maxBody || 1));
			div.appendChild(body);

			return this.Show(e, div);
		};

		this.ShowActionTokens = (e, inanimate) => {
			const { actions, maxActions } = GAME_MANAGER.instance.actions;
			const div = document.createElement("div");

			const subdiv = document.createElement("div");
			subdiv.className = "actions";
			subdiv.textContent = getText("Actions: {0}/{1}", actions.toFixed(2), maxActions.toFixed(2));
			div.appendChild(subdiv);

			const hint = document.createElement("div");
			hint.className = "hint";
			hint.innerHTML = getString("Used for performing actions");
			div.appendChild(hint);

			return this.Show(e, div);
		};

		this.ShowSpellTokens = (e, inanimate) => {
			const { spells, maxSpells } = GAME_MANAGER.instance.actions;
			const div = document.createElement("div");

			const subdiv = document.createElement("div");
			subdiv.className = "spells";
			subdiv.textContent = getText("Spells: {0}/{1}", spells.toFixed(2), maxSpells.toFixed(2));
			div.appendChild(subdiv);

			const hint = document.createElement("div");
			hint.className = "hint";
			hint.innerHTML = getString("Used for casting spells");
			div.appendChild(hint);

			return this.Show(e, div);
		};

		this.ShowNameplate = (e, obj) => {
			const div = document.createElement("div");
			const subdiv = document.createElement("div");
			subdiv.className = "names";

			const list = [document.createElement("span"), document.createElement("span"), document.createElement("span")];
			list.forEach(span => subdiv.appendChild(span));
			div.appendChild(subdiv);

			list[1].textContent = obj.names;
			list[2].textContent = obj.username;
			list[2].style.color = obj.username_color;
			list[2].style.display = isAnonymousUsername(obj.username) ? "none" : "";

			const tags = document.createElement("div");
			tags.className = "tags";

			if (e.target.classList.contains("roleplaying")) {
				const roleplaying = document.createElement("span");
				roleplaying.className = "roleplaying";
				tags.appendChild(roleplaying);
			}

			if (e.target.classList.contains("equipped")) {
				const equipped = document.createElement("span");
				equipped.className = "equipped";
				tags.appendChild(equipped);
			}

			div.appendChild(tags);

			toggleFilter(drawFilter(div, obj), obj.filter, obj.sexuality);

			drawDesireSummary(div, obj, { displayHorizontalRule: false, interactive: false });

			return this.Show(e, div, "nameplate", obj.nature);
		};

		this.GetSpellContent = (spell, target, showSelfcast) => {
			const content = document.createElement("div");
			content.className = "spell_details";

			showSelfcast = showSelfcast && target;

			target = target || GAME_MANAGER.instance.character;

			const spellName = document.createElement("div");
			spellName.className = "title";
			spellName.textContent = getSpellFullyQualifiedName(spell);

			const tags = spell.tags && document.createElement("div");
			if (tags) {
				tags.className = "tags";
				tags.textContent = spell.tags.join(", ");
				content.classList.toggle("body", spell.tags.includes("Body"));
				content.classList.toggle("mind", spell.tags.includes("Mind"));
				content.classList.toggle("special", spell.tags.includes("Special"));
			}

			const lust = spell.tags.includes("Lust");
			const damage = MENU.Spells.GetSpellDamage(spell, GAME_MANAGER.instance.character, target, showSelfcast);
			const hearts = spell.desires && DESIRE.GetActionHearts(spell, target);

			const conditions = typeof spell.conditions === "string" && document.createElement("div");

			if (conditions) {
				conditions.className = "conditions";
				conditions.textContent = getText(spell.disabled ? "Disabled because {0}" : "Active because {0}", spell.conditions);
			}

			const autocast = spell.autocast && document.createElement("div");
			if (autocast) {
				autocast.className = "autocast";
				autocast.textContent = "Chosen when time runs out";
			}

			const wrapper = spell.image_url && document.createElement("div");
			if (wrapper) {
				wrapper.className = "effect_tooltip";

				const img = SETTINGS.Get("spell_image_tooltip", true) && document.createElement("div");

				if (img) {
					const pixelated = spell.nsfw && SETTINGS.Get("sfw", false);
					img.style.backgroundImage = `url(${formatMediaURL(insertNature(spell.image_url, target.nature), pixelated ? 16 : powCeil(154 * getMediaScale()))})`;
					img.style.imageRendering = pixelated ? "pixelated" : null;
					wrapper.appendChild(img);
				}

				const details = document.createElement("div");
				details.className = "effect_details";
				wrapper.appendChild(details);

				details.appendChild(spellName);
				tags && details.appendChild(tags);
				damage && details.appendChild(damage);
				hearts && details.appendChild(hearts);
				conditions && details.appendChild(conditions);
				autocast && details.appendChild(autocast);

				content.appendChild(wrapper);
			}
			else {
				content.appendChild(spellName);
				tags && content.appendChild(tags);
				damage && content.appendChild(damage);
				hearts && content.appendChild(hearts);
				conditions && content.appendChild(conditions);
				autocast && content.appendChild(autocast);
			}

			content.classList.toggle("lust", lust);

			const desc = document.createElement("div");
			desc.textContent = appendPunctuation(spell.description !== undefined ? spell.description : spell.short_desc || '');
			content.appendChild(desc);

			const menuItems = [];
			const hints = [];

			if (spell.menu_items !== undefined) {
				menuItems.push(...spell.menu_items.filter(o => o));
			}

			if (spell.lust_conversion > 0) {
				menuItems.push({ label: getText("{0}% of damage converted to Lust ÷ target's Max Body", Math.floor(clamp01(spell.lust_conversion) * 100)) });
			}

			if (menuItems.length > 0) {
				const ul = document.createElement("ul");
				for (const menuItem of menuItems) {
					const li = document.createElement("li");
					if (typeof menuItem === "object") {
						li.textContent = menuItem.label;
						li.className = menuItem.type || "";
					}
					else {
						li.textContent = trimPunctuations(menuItem);
					}
					ul.appendChild(li);
				}
				content.appendChild(ul);
			}

			if (spell.materials !== undefined) {
				const mats = document.createElement("div");
				mats.className = "materials";

				const materials = [];
				for (let prop in spell.materials) {
					materials.push(spell.materials[prop] > 1 ? `${spell.materials[prop]}x ${prop}` : prop);
				}

				mats.textContent = `${getString(materials.length > 1 ? "Materials" : "Material")}: ${materials.join(", ")}`;

				if (!GAME_MANAGER.instance.HasMaterials(spell.materials)) {
					mats.classList.add("missing");
				}

				content.appendChild(mats);
			}

			if (spell.hints !== undefined) {
				hints.push(...spell.hints);
			}

			if (hints.length > 0) {
				const div = document.createElement("div")
				hints.forEach((hint, i) => {
					const elm = document.createElement("div");
					elm.className = "hint";
					elm.textContent = getString(hint);
					div.appendChild(elm);
					hints[i] = elm;
				});
				content.appendChild(div);
			}

			function onAfterShow() {
				!wordWrapping(desc) && (desc.style.textAlign = "center");
				hints.forEach(hint => !wordWrapping(hint) && (hint.style.textAlign = "center"));
			}

			return [content, onAfterShow];
		};

		this.ShowSpell = (e, spell, target, showSelfcast) => this.Show(e, ...this.GetSpellContent(spell, target, showSelfcast));

		this.ShowUniqueAbility = (e, ability, inspect, disabled) => {
			const content = document.createElement("div");

			const wrapper = document.createElement("div");
			wrapper.className = "effect_tooltip" + (disabled ? " inactive" : '');

			const img = document.createElement("div");

			const pixelated = ability.nsfw && SETTINGS.Get("sfw", false);
			img.style.backgroundImage = `url(${formatMediaURL(ability.image_url, pixelated ? 16 : powCeil(154 * getMediaScale()))})`;
			img.style.imageRendering = pixelated ? "pixelated" : null;
			wrapper.appendChild(img);

			const details = document.createElement("div");
			details.className = "effect_details";
			wrapper.appendChild(details);

			const abilityName = document.createElement("div");
			abilityName.textContent = ability.ability_name;
			details.appendChild(abilityName);

			const tags = document.createElement("div");
			tags.textContent = unique([disabled && "Disabled"]).join(", ");
			details.appendChild(tags);

			const description = document.createElement("div");
			description.innerHTML = insertTextColor(inspect && ability.inspect || ability.description) || '';
			details.appendChild(description);

			const arr = [description];

			if (ability.flavor_text !== undefined) {
				const flavor = document.createElement("div");
				flavor.className = "flavor_text";
				flavor.innerHTML = ability.flavor_text;
				details.appendChild(flavor);
				arr.push(flavor);
			}

			content.appendChild(wrapper);

			return this.Show(e, content, () => {
				arr.forEach(elm => !wordWrapping(elm) && (elm.style.textAlign = "center"));
				img.offsetHeight < details.offsetHeight && (wrapper.style.alignItems = "flex-start");
			});
		};

		this.ShowDesire = (e, desire, valid, value, max, suppressed, inspect, nature, actionLabels) => {
			suppressed = suppressed && value < max;

			const content = document.createElement("div");

			if (desire.description !== undefined) {
				const description = document.createElement("div");
				description.innerHTML = trimPunctuations(insertTextColor(inspect && desire.inspect || desire.description) || '');
				content.appendChild(description);
			}

			if (actionLabels.length > 0) {
				const table = document.createElement("table");
				table.className = "desire_actions";
				for (const label of actionLabels) {
					const tr = document.createElement("tr");
					tr.innerHTML = `<td>${heartsToHTML(label.points)}</td><td>${label.label}</td>`;
					table.appendChild(tr);
				}
				content.appendChild(table);
			}

			let items = desire.menu_items ? desire.menu_items.slice() : [];

			if (typeof valid === "number") {
				const item = { points: 0, image_url: desire.suppress_image_url || DESIRE_IMAGE_URL, description: DESIRE.InvalidToDescription(valid, inspect) };
				items.unshift(item);
			}

			if (suppressed) {
				const item = { points: 1, suppressed: true, image_url: desire.suppress_image_url || DESIRE_IMAGE_URL, description: `${desire.desire_name} Desire is being suppressed, which prevents it from increasing` };
				items.unshift(item);
			}

			if (desire.lust) {
				items.unshift(
					{ points: 1, lust: true, image_url: DESIRE_IMAGE_URL, description: `${desire.desire_name} Desire is capped at {1} or more while [Lust] >= 25%` },
					{ points: 2, lust: true, image_url: DESIRE_IMAGE_URL, description: `${desire.desire_name} Desire can be increased to {2} while [Lust] >= 50%` },
					{ points: 3, lust: true, image_url: DESIRE_IMAGE_URL, description: `${desire.desire_name} Desire can be increased to {3} while [Lust] >= 75%` },
					{ points: 4, lust: true, image_url: DESIRE_IMAGE_URL, description: `${desire.desire_name} Desire can be increased to {4} while [Lust] >= 100%` },
				);
			}

			items = items.filter(item => item.points <= max);

			if (items.length > 0) {
				const ul = document.createElement("ul");
				ul.className = "desire_effects";
				for (const item of items) {
					const li = document.createElement("li");
					const img = document.createElement("div");
					const pixelated = item.nsfw && SETTINGS.Get("sfw", false);
					img.style.backgroundImage = `url(${formatMediaURL(insertNature(item.image_url || effect.image_url, nature), pixelated ? 16 : powCeil(32 * getMediaScale()))})`;
					img.style.imageRendering = pixelated ? "pixelated" : null;
					li.appendChild(img);
					li.appendChild(document.createTextNode(" "));
					const description = document.createElement("span");
					description.innerHTML = trimPunctuations(insertTextColor(applyInserts(inspect && item.inspect || item.description) || ''));
					li.appendChild(description);
					li.classList.toggle("lust", item.lust || false);
					li.classList.toggle("suppressed", item.suppressed || false);
					ul.appendChild(li);
				}
				content.appendChild(ul);
			}

			function applyInserts(text) {
				return text.replace(/\{([\d])\}/g, (_, prop) => heartsToHTML(parseInt(prop)));
			}

			function heartsToHTML(i) {
				i = clamp(i, 1, 4);
				const arr = [];
				for (; i > 0; i--) {
					arr.push("<span class=\"heart\"></span>");
				}
				return arr.join("&nbsp;");
			}

			return this.Show(e, content, "desire");
		};

		this.ShowSkill = (e, skill) => {
			const skillName = document.createElement("div");
			const description = document.createElement("div");
			const menuItems = document.createElement("table");
			const div = document.createElement("div");

			skillName.textContent = skill.skill_name;
			description.textContent = appendPunctuation(skill.description);

			for (let prop in skill.menu_items) {
				const tr = document.createElement("tr");
				let td = document.createElement("td");
				td.textContent = prop;
				tr.appendChild(td);

				td = document.createElement("td");
				td.innerHTML = "&nbsp:&nbsp";
				tr.appendChild(td);

				td = document.createElement("td");
				td.textContent = trimPunctuations(skill.menu_items[prop]);
				tr.appendChild(td);

				menuItems.appendChild(tr);
			}

			div.className = "skill_details";

			div.appendChild(skillName);
			div.appendChild(description);
			div.appendChild(menuItems);

			return this.Show(e, div);
		};

		this.ShowStatusEffect = (e, effect, inspect, countdowns, nature) => {
			const content = document.createElement("div");
			const foundTimers = [];
			const arr = [];

			_timers = [];

			const wrapper = document.createElement("div");
			wrapper.className = "effect_tooltip" + (effect.active === false ? " inactive" : '');

			const img = SETTINGS.Get("status_image_tooltip", true) && document.createElement("div");

			if (img) {
				const pixelated = effect.nsfw && SETTINGS.Get("sfw", false);
				img.style.backgroundImage = `url(${formatMediaURL(insertNature(effect.image_url, nature), pixelated ? 16 : powCeil(154 * getMediaScale()))})`;
				img.style.imageRendering = pixelated ? "pixelated" : null;
				wrapper.appendChild(img);
			}

			const details = document.createElement("div");
			details.className = "effect_details";
			wrapper.appendChild(details);

			const statusName = document.createElement("div");
			statusName.textContent = effect.status_name;
			details.appendChild(statusName);

			const tags = document.createElement("div");
			tags.textContent = unique([effect.magic && "Magic", effect.active === false && "Inactive"]).join(", ");
			details.appendChild(tags);

			if (effect.description !== undefined) {
				const description = document.createElement("div");
				description.innerHTML = trimPunctuations(insertTextColor(inspect && effect.inspect || effect.description) || '');
				arr.push(description);
				details.appendChild(description);
			}

			content.appendChild(wrapper);

			if (effect.countdown && !foundTimers.includes(effect.countdown)) {
				const timer = drawStatusTimer(content, effect.countdown, countdowns);
				timer && effect.active === false && timer.classList.add("inactive");
			}

			if (effect.menuItems !== undefined) {
				const ul = document.createElement("ul");
				ul.className = "effects";
				for (const item of unique(effect.menuItems.filter(item => item.active !== false).concat(effect.menuItems))) {
					const li = document.createElement("li");
					const wrapper = document.createElement("div");
					const img = document.createElement("div");
					const pixelated = item.nsfw && SETTINGS.Get("sfw", false);
					img.style.backgroundImage = `url(${formatMediaURL(insertNature(item.image_url || effect.image_url, nature), pixelated ? 16 : powCeil(32 * getMediaScale()))})`;
					img.style.imageRendering = pixelated ? "pixelated" : null;
					if (item.rank > 1 || item.max_rank === true) {
						const maxRank = item.max_rank === true || item.rank === item.max_rank;
						const rank = document.createElement("div");
						rank.className = "rank" + (maxRank ? " max" : '');
						rank.textContent = ` ${maxRank ? getString("Max") : convertToRoman(item.rank)}`;
						img.appendChild(rank);
					}
					wrapper.appendChild(img);
					const label = document.createElement("span");
					label.textContent = item.label;
					wrapper.appendChild(label);
					li.appendChild(wrapper);
					const description = document.createElement("div");
					description.innerHTML = trimPunctuations(insertTextColor(inspect && item.inspect || item.description) || '');
					li.appendChild(description);
					arr.push(description);
					if (item.countdown && drawStatusTimer(li, item.countdown, countdowns)) {
						foundTimers.push(item.countdown);
					}
					li.classList.toggle("inactive", effect.active === false || item.active === false);
					ul.appendChild(li);
				}
				content.appendChild(ul);
			}

			Object.freeze(_timers);

			return this.Show(e, content, () => {
				arr.forEach(elm => !wordWrapping(elm) && (elm.style.textAlign = "center"));
				img && img.offsetHeight < details.offsetHeight && (wrapper.style.alignItems = "flex-start");
			});
		};

		this.ShowItem = (e, item, tier) => {
			const equipped = isDescendant(MENU.Inspect.menu, e.target) || isDescendant(MENU.Myself.menu, e.target);
			const accessoryReference = item.variant_accessory && nameToRef(item.variant_accessory);
			return this.Show(e, TOOLTIP.GetItemContent(item, tier, equipped), accessoryReference ? "accessory" : null, accessoryReference);
		};

		this.ShowInanimateSpell = (e, spell, tier, target, appendSpellDetails) => {
			let content;
			const item = spell.form;
			const accessoryReference = item.variant_accessory && nameToRef(item.variant_accessory);
			const itemContent = TOOLTIP.GetItemContent(item, tier, false, false);
			const [spellContent, onAfterShow] = appendSpellDetails && this.GetSpellContent(spell, target) || [];
			if (spellContent) {
				content = document.createElement("div");
				content.appendChild(itemContent);
				content.appendChild(spellContent);
			}
			return this.Show(e, content || itemContent, accessoryReference ? "accessory" : null, accessoryReference, onAfterShow);
		};

		this.ShowEquipmentSlot = (e, tier, character, item, slot, inspect, chastity, qualities) => {
			const content = document.createElement("div");
			const classes = [];
			if (item) {
				const equipped = isDescendant(MENU.Inspect.menu, e.target) || isDescendant(MENU.Myself.menu, e.target);
				const accessoryReference = item.variant_accessory && nameToRef(item.variant_accessory);
				accessoryReference && classes.push("accessory", accessoryReference);
				content.appendChild(TOOLTIP.GetItemContent(item, tier, equipped));
			}
			else {
				content.innerHTML = `<div class="equipment_slot"><div>Equipment</div><div>${slotToTooltip(slot)}</div></div>`;
			}
			if (character) {
				let skin;
				const div = document.createElement("div");
				div.className = "trait_desc";
				const label = CHARACTER.PhysiqueToLabel(character.physique);
				if (character.skin && character.skin.some(byte => byte >= 85)) {
					const max = Math.max(...character.skin);
					if (character.skin[Skin.Latex] == max) {
						if (character.skin[Skin.Latex] >= Skin.LatexDoll) {
							skin = hasFlag(character.body_flags, Body.BlowUpDoll) ? "BlowUpDoll" : "LatexDoll";
						}
						else if (character.skin[Skin.Latex] >= Skin.LatexSkin) {
							skin = "LatexSkin";
						}
						else if (character.skin[Skin.Latex] >= Skin.SmoothSkin) {
							skin = "SmoothSkin";
						}
					}
					else if (character.skin[Skin.Plush] == max) {
						if (character.skin[Skin.Plush] >= Skin.LaceSkin) {
							skin = "LaceSkin";
						}
						else if (character.skin[Skin.Plush] >= Skin.SilkySkin) {
							skin = "SilkySkin";
						}
						else if (character.skin[Skin.Plush] >= Skin.SoftSkin) {
							skin = "SoftSkin";
						}
					}
				}
				let images;
				switch (slot) {
					case "shirt":
						const size = CHARACTER.CalculateSize(character.physique || [0, 0, 0], character.height || 0, character.size !== undefined ? character.size : CHARACTER.GetSize(character.effects) || 0);
						div.innerHTML = getBodyDescription(inspect, size, character.body, character.body_flags, label, skin);
						images = qualities && qualities.body;
						break;
					case "head":
						div.innerHTML = getHeadDescription(inspect, character.head, character.head_flags, skin, label);
						images = qualities && qualities.head;
						break;
					case "gloves":
						div.innerHTML = getArmsDescription(inspect, character.body && character.body[Body.Arms], isQuadruped(character.body, character.body_flags), skin, label);
						images = qualities && qualities.arms;
						break;
					case "shoes":
						div.innerHTML = getLegsDescription(inspect, character.body && character.body[Body.Legs], isQuadruped(character.body, character.body_flags), skin, label);
						images = qualities && qualities.legs;
						break;
					case "pants":
						div.innerHTML = getButtDescription(inspect, character.body && character.body[Body.Tail], chastity, skin, label);
						images = qualities && qualities.butt;
						break;
					case "underpants":
						div.innerHTML = getGenitaliaDescription(inspect, character.genitalia, character.genitalia_size || GenitaliaSize.Penis, chastity);
						break;
					case "undershirt":
						div.innerHTML = getChestDescription(inspect, skin, label);
						break;
					case "bra":
						div.innerHTML = getBreastsDescription(inspect, character.breasts);
						images = qualities && qualities.breasts;
						break;
				}
				const list = Array.from(div.getElementsByTagName("div"));
				content.appendChild(div);
				if (Array.isArray(images) && images.length > 0) {
					const nsfw = SETTINGS.Get("sfw", false) && qualities && qualities.nsfw;
					const div = document.createElement("div");
					div.className = "qualities";
					for (const imageURL of images) {
						const subdiv = document.createElement("div");
						const pixelated = nsfw && nsfw.includes(imageURL);
						subdiv.style.backgroundImage = `url(${formatMediaURL(imageURL, pixelated ? 16 : powCeil(154 * getMediaScale()))})`;
						subdiv.style.imageRendering = pixelated ? "pixelated" : null;
						div.appendChild(subdiv);
					}
					content.appendChild(div);
				}
				return this.Show(e, content, ...classes, () => list.forEach(elm => !wordWrapping(elm) && (elm.style.textAlign = "center")));
			}
			return this.Show(e, content, ...classes);
		};

		this.ShowPrototype = (e, prototype, item) => this.Show(e, TOOLTIP.GetItemContent(item, 0, false, true), prototype.known === false && "unknown");

		this.ShowCraftingOption = (e, option, item, npc) => {
			const sprite = option.worn_image_url || option.image_url;
			const div = document.createElement("div");

			const wrapper = document.createElement("div");
			wrapper.className = "crafting_option_details";
			wrapper.appendChild(div);

			if (sprite) {
				const div = document.createElement("div");
				const pixelated = option.nsfw && SETTINGS.Get("sfw", false);
				const image = (item ? IMAGE_PROCESSING.getWornItemImage(item, 0, sprite, 256, 0, pixelated) : sprite);

				div.style.backgroundImage = `url(${image})`;
				div.style.backgroundSize = option.worn_image_url ? "contain" : null;
				div.style.imageRendering = pixelated ? "pixelated" : null;
				div.className = "item_image " + (option.worn_image_url ? "item_2x3" : `item_${option.width}x${option.height}`);

				loadImage(image).catch(() => {
					div.style.backgroundImage = `url(${formatMediaURL("/game/assets/spells/missing.png", powCeil(256 * getMediaScale()))})`;
					div.style.imageRendering = null;
				});

				wrapper.prepend(div);
			}

			if (option.description !== undefined) {
				const desc = document.createElement("div");
				desc.textContent = option.description;
				div.appendChild(desc);
			}

			if (option.materials !== undefined) {
				const materials = Object.keys(option.materials).map(key => option.materials[key] > 1 ? `${option.materials[key]}x ${key}` : key);

				const mats = document.createElement("div");
				mats.className = "materials";
				mats.textContent = `${getString(npc ? "Cost" : materials.length > 1 ? "Materials" : "Material")}: `;
				mats.textContent += materials.join(", ");

				if (!GAME_MANAGER.instance.HasMaterials(option.materials)) {
					mats.classList.add("missing");
				}

				div.appendChild(mats);
			}

			if (option.known === true) {
				const known = document.createElement("div");
				known.textContent = getString("Already known");
				known.className = "known";
				div.appendChild(known);
			}
			else if (option.known === undefined) {
				if (option.disable_on_defeated && GAME_MANAGER.instance.recentlyDefeated) {
					const minutes = GAME_MANAGER.instance.MinutesSinceDefeated();
					if (minutes > 0) {
						const warning = document.createElement("div");
						warning.textContent = getText(minutes >= 2 ? "Cannot be used for 1 more minute." : "Cannot be used for {0} more minutes.", Math.floor(minutes));
						warning.className = "warning";
						div.appendChild(warning);
					}
				}
			}


			if (sprite || wrapper.textContent.trim().length > 0) {
				return this.Show(e, wrapper, option.known === false && "unknown");
			}
		};

		this.ShowFilterTag = (e, tag, enabled) => {
			const div = document.createElement("div");
			div.className = "filter";

			const subdiv = document.createElement("div");
			subdiv.textContent = getString(tag);
			subdiv.classList.toggle("enabled", enabled || false);

			div.appendChild(subdiv);

			const hint = document.createElement("div");
			hint.innerHTML = removeBreakRows(TOOLTIP.GetContent(TOOLTIP.Tag[tag]));
			hint.className = "hint";
			div.appendChild(hint);

			return this.Show(e, div);
		};

		this.ShowSexualityTag = (e, tag, sexuality) => {
			const div = document.createElement("div");
			div.className = "filter sexuality";

			const hint = document.createElement("div");
			hint.className = "hint";

			const list = [document.createElement("div"), document.createElement("div"), document.createElement("div")];

			switch (tag) {
				case Sexuality.FM:
					list[0].textContent = getString("Feminine + Masculine");
					list[1].textContent = getString("Feminine w. phallus");
					list[2].textContent = getString("Masculine w. vagina");
					list[1].classList.toggle("enabled", hasFlag(sexuality, Sexuality.FM | Sexuality.FM_FeminineWithPhallus));
					list[2].classList.toggle("enabled", hasFlag(sexuality, Sexuality.FM | Sexuality.FM_MasculineWithVagina));
					hint.innerHTML = removeBreakRows(TOOLTIP.GetContent(TOOLTIP.Sexuality.FM));
					break;
				case Sexuality.FF:
					list[0].textContent = getString("Feminine + Feminine");
					list[1].textContent = getString("Phallus on vagina");
					list[2].textContent = getString("Phallus on Phallus");
					list[1].classList.toggle("enabled", hasFlag(sexuality, Sexuality.FF | Sexuality.FF_PhallusOnVagina));
					list[2].classList.toggle("enabled", hasFlag(sexuality, Sexuality.FF | Sexuality.FF_PhallusOnPhallus));
					hint.innerHTML = removeBreakRows(TOOLTIP.GetContent(TOOLTIP.Sexuality.FF));
					break;
				case Sexuality.MM:
					list[0].textContent = getString("Masculine + Masculine");
					list[1].textContent = getString("Phallus on vagina");
					list[2].textContent = getString("Vagina on vagina");
					list[1].classList.toggle("enabled", hasFlag(sexuality, Sexuality.MM | Sexuality.MM_PhallusOnVagina));
					list[2].classList.toggle("enabled", hasFlag(sexuality, Sexuality.MM | Sexuality.MM_VaginaOnVagina));
					hint.innerHTML = removeBreakRows(TOOLTIP.GetContent(TOOLTIP.Sexuality.MM));
					break;
			}

			list[0].classList.toggle("enabled", hasFlag(sexuality, tag));

			list.forEach(elm => div.appendChild(elm));

			div.appendChild(hint);

			return this.Show(e, div);
		};

		this.Show = (e, content, ...classNames) => {
			if (!content || CURSOR.instance.heldItem || INPUT.instance.Exclusive() && !isDescendant(INPUT.instance.elm, e.target)) {
				return;
			}

			if (!_trigger || _trigger != e.target || _tooltip.classList.contains("inactive")) {
				_touchCount = 0;
			}

			LOCK.GetBaton(_tooltip);

			clearHTML(_tooltip);

			_tooltip.className = "tooltip inactive";

			const onAfterShow = typeof classNames[classNames.length - 1] === "function" && classNames.pop();

			classNames.map(className => className && className.toString()).forEach(className => className && _tooltip.classList.add(className));

			if (typeof content === "string") {
				const div = document.createElement("div");
				div.innerHTML = content;
				_tooltip.appendChild(div);
				content = div;
			}
			else {
				_tooltip.appendChild(content);
			}

			_event = e;

			if (_trigger) {
				_trigger.removeEventListener("click", this.Hide);
				_trigger.removeEventListener("mouseleave", this.Hide);
				_trigger.removeEventListener("touchend", cancelClick);
			}

			_trigger = e.target;
			_trigger.addEventListener("click", this.Hide);
			_trigger.addEventListener("mouseleave", this.Hide);
			_trigger.addEventListener("touchend", cancelClick);

			_tooltip.style.top = _tooltip.style.left = "0";
			_tooltip.style.bottom = _tooltip.style.right = "";
			_tooltip.style.transform = null;
			_tooltip.classList.remove("inactive");

			moveToNext(_trigger, _tooltip);

			onAfterShow && onAfterShow(content);

			return content;
		};

		const cancelClick = (e) => { _touchCount++ == 0 && e.cancelable !== false && e.preventDefault() };

		const moveToNext = (elm, tooltip) => {
			const containerRect = container.getBoundingClientRect();
			const rect = elm.getBoundingClientRect();
			const origin = [];

			if (rect.left > (containerRect.left + containerRect.right) / 2) {
				tooltip.style.left = "";
				tooltip.style.right = `${containerRect.width - (rect.left - containerRect.left)}px`;
				origin[0] = "right";
			}
			else {
				tooltip.style.right = "";
				tooltip.style.left = `${rect.right - containerRect.left}px`;
				origin[0] = "left";
			}

			const verticalCenter = rect.top + rect.height / 2 - containerRect.top;
			if (verticalCenter - tooltip.offsetHeight / 2 < 0) {
				if (tooltip.offsetHeight <= container.offsetHeight || isDescendant(container, elm) || verticalCenter - (tooltip.offsetHeight / 2) * container.offsetHeight / tooltip.offsetHeight < 0) {
					origin[1] = "top";
				}
				else {
					tooltip.style.top = `${verticalCenter - tooltip.offsetHeight / 2}px`;
					origin[1] = "center";
				}
			}
			else if (isDescendant(container, elm)) {
				if (verticalCenter + tooltip.offsetHeight / 2 > containerRect.height) {
					tooltip.style.top = "";
					tooltip.style.bottom = "0";
					origin[1] = verticalCenter + (tooltip.offsetHeight / 2) * container.offsetHeight / tooltip.offsetHeight > containerRect.height ? "bottom" : "center";
				}
				else {
					tooltip.style.top = `${verticalCenter - tooltip.offsetHeight / 2}px`;
					origin[1] = "center";
				}
			}
			else {
				tooltip.style.top = "";
				tooltip.style.bottom = `${Math.max(containerRect.height - window.innerHeight, containerRect.height - (verticalCenter + tooltip.offsetHeight / 2))}px`;
				origin[1] = verticalCenter + (tooltip.offsetHeight / 2) * container.offsetHeight / tooltip.offsetHeight > window.innerHeight ? "bottom" : "center";
			}

			if (tooltip.offsetHeight > container.offsetHeight) {
				tooltip.style.transform = `scale(${container.offsetHeight / tooltip.offsetHeight})`;
				tooltip.style.transformOrigin = origin.join(" ");
			}
		};

		this.Hide = async () => {
			const baton = LOCK.GetBaton(_tooltip);
			await waitForFrame();
			LOCK.HasBaton(_tooltip, baton) && _tooltip.classList.add("inactive");
		};

		this.IsActive = () => _prevActive;

		function getBodyDescription(inspect, height, body, bodyFlags, physique, skin) {
			const wings = body && body[Body.Wings] > 0 && Object.keys(Wings).find(key => Wings[key] === body[Body.Wings]);
			const inches = Math.round(height / 2.54);
			const units = [inches < 12 ? `${inches % 12}"` : `${Math.floor(inches / 12)}'${inches % 12}"`];
			const centimeters = `${height} cm`;
			SETTINGS.Get("length_unit", defaultLengthUnit) !== "centimeter" ? units.push(centimeters) : units.unshift(centimeters);
			return formatTraits("Body", [
				getText(`${inspect ? "They" : "You"} are {0} ({1}) tall with a ${nicifyPropertyName(physique)} body`, ...units),
				skin && getString(`${inspect ? "They" : "You"} have ${nicifyPropertyName(skin)}`),
				hasFlag(bodyFlags, Body.CowUdder) && getString(`${inspect ? "They" : "You"} have a Cow Udder`),
				wings && getString(`${inspect ? "They" : "You"} have ${nicifyPropertyName(wings)} wings`),
			]);
		}

		function getHeadDescription(inspect, head, headFlags, skin, physique) {
			const arr = [];
			const ears = head && head[Head.Ears];
			const horns = head && head[Head.Horns];
			const hasAnimalHead = ears && ears < 64 && hasFlag(headFlags, Head.Animal);
			const hasHalo = hasFlag(headFlags, Head.Halo, Head.DarkHalo);
			const headers = ["Head"];
			if (ears) {
				let prop = Object.keys(Ears).find(key => Ears[key] === ears);
				if (prop) {
					prop = nicifyPropertyName(skin === "BlowUpDoll" ? `${prop} ${skin}` : prop);
					arr.push(getString(`${inspect ? "They" : "You"} have ${hasAnimalHead ? `a ${prop} head` : `${prop} ears`}`));
				}
			}
			if (horns) {
				const plural = true;
				headers.push(plural ? "Horns" : "Horn");
				const prop = Object.keys(Horns).find(key => Horns[key] === horns);
				arr.push(prop && getString(`${inspect ? "They" : "You"} have ${nicifyPropertyName(skin === "BlowUpDoll" ? `${prop} ${skin}` : prop)} horns`));
			}
			if (hasHalo) {
				headers.push("Halo");
				arr.push(getString(`${inspect ? "They" : "You"} have a ${hasFlag(headFlags, Head.Halo) ? "Halo" : "Dark Halo"}`));
			}
			if (skin === "BlowUpDoll") {
				arr.unshift(getString(`${inspect ? "They" : "You"} have a ${nicifyPropertyName(skin)} face`));
			}
			else if (!hasAnimalHead) {
				arr.unshift(getString(`${inspect ? "Their" : "Your"} face is ${CHARACTER.LabelToZone(physique)} in appearance`));
			}
			return formatTraits(headers, arr);
		}

		function getArmsDescription(inspect, arms, quadruped, skin, physique) {
			const prop = arms > 0 && Object.keys(Arms).find(key => Arms[key] === arms);
			const noun = quadruped ? "legs" : "arms";
			return formatTraits(["Arms", "Hands"], [
				quadruped ? getString(`${inspect ? "They" : "You"} have ${nicifyPropertyName(skin === "BlowUpDoll" ? `${prop} ${skin}` : prop)} legs for arms`)
					: prop ? getString(`${inspect ? "They" : "You"} have ${nicifyPropertyName(skin === "BlowUpDoll" ? `${prop} ${skin}` : prop)} arms and hands`)
						: skin !== "BlowUpDoll" && getString(`${inspect ? "They" : "You"} have ${nicifyPropertyName(physique)} ${noun}`),
				prop && skin === "LatexDoll" && clamp(arms, 2, 8) === arms && getString(`The ${arms === Arms.Wooly ? "wool" : "fur"} on ${inspect ? "their" : "your"} ${noun} look remarkably synthetic`),
				prop && skin === "LatexSkin" && clamp(arms, 2, 8) === arms && getString(`The ${arms === Arms.Wooly ? "wool" : "fur"} on ${inspect ? "their" : "your"} ${noun} look synthetic`),
				!prop && skin && getString(`${inspect ? "They" : "You"} have ${nicifyPropertyName(skin)} arms and hands`),
			], quadruped, quadruped && ["Legs", "Feet"]);
		}

		function getLegsDescription(inspect, legs, quadruped, skin, physique) {
			const prop = legs > 0 && Object.keys(Legs).find(key => Legs[key] === legs);
			return formatTraits([quadruped ? "Hind Legs" : "Legs", "Feet"], [
				prop ? getString(`${inspect ? "They" : "You"} have ${nicifyPropertyName(skin === "BlowUpDoll" ? `${prop} ${skin}` : prop)} legs and feet`) : skin !== "BlowUpDoll" && getString(`${inspect ? "They" : "You"} have ${nicifyPropertyName(physique)} legs`),
				prop && skin === "LatexDoll" && clamp(legs, 2, 8) === legs && getString(`The ${legs === Legs.Wooly ? "wool" : "fur"} on ${inspect ? "their" : "your"} legs look remarkably synthetic`),
				prop && skin === "LatexSkin" && clamp(legs, 2, 8) === legs && getString(`The ${legs === Legs.Wooly ? "wool" : "fur"} on ${inspect ? "their" : "your"} legs look synthetic`),
				!prop && skin && getString(`${inspect ? "They" : "You"} have ${nicifyPropertyName(skin)} legs and feet`),
			]);
		}

		function getButtDescription(inspect, tail, chastity, skin, physique) {
			const prop = tail > 0 && Object.keys(Tail).find(key => Tail[key] === tail);
			const plural = prop && tail === Tail.Kitsune;
			const headers = ["Butt", hasHips(physique) && "Hips", prop && (plural ? "Tails" : "Tail")];
			return formatTraits(headers, [
				skin !== "BlowUpDoll" && getString(`${inspect ? "They" : "You"} have a ${nicifyPropertyName(physique)} butt`),
				skin && getString(`${inspect ? "They" : "You"} have a ${nicifyPropertyName(skin)} butt`),
				prop && getString(`${inspect ? "They" : "You"} have ${plural ? `${prop} tails` : `a ${prop} tail`}`),
				!Chastity.IsAssAvailable(chastity) && `${inspect ? "Their" : "Your"} ass is in chastity`
			]);
		}

		function getBreastsDescription(inspect, breasts) {
			const breastSize = breasts && Math.floor(breasts[0] + breasts[1]);
			if (breastSize >= 1) {
				const prop = Object.keys(BreastSize).find(key => BreastSize[key] === breastSize) || "ColossalBreasts";
				return formatTraits(["Breasts"], [`${inspect ? "They" : "You"} have ${nicifyPropertyName(prop).toLowerCase()}`]);
			}
			return '';
		}

		function getChestDescription(inspect, skin, physique) {
			const arr = [];
			if (skin !== "BlowUpDoll") {
				switch (physique) {
					case "lean":
					case "curvaceous_lean":
					case "muscular":
						arr.push(`${inspect ? "They" : "You"} have a ${nicifyPropertyName(physique)} torso`);
						break;
				}
			}
			return formatTraits(["Torso"], arr);
		}

		function getGenitaliaDescription(inspect, genitalia, genitaliaSize, chastity) {
			genitaliaSize = clamp(Math.floor(genitaliaSize), GenitaliaSize.TinyPenis, GenitaliaSize.ColossalPenis);
			const hasPenis = hasFlag(genitalia, Genitalia.Penis);
			const hasVagina = hasFlag(genitalia, Genitalia.Vagina);
			const hasGenitals = hasPenis || hasVagina;
			const penis = hasPenis && nicifyPropertyName(Object.keys(GenitaliaSize).find(key => GenitaliaSize[key] === genitaliaSize) || "TinyPenis").toLowerCase();
			const arr = [
				`${inspect ? "They" : "You"} have ${hasPenis && hasVagina ? `a ${penis} and a vagina` : hasPenis ? `a ${penis}` : hasVagina ? "a vagina" : "no genitals"}`,
			];
			if (chastity > 0) {
				if (hasVagina && chastity === Chastity.StrapOn) {
					arr.push(`A strap-on is preventing access to ${inspect ? "their" : "your"} vagina`);
				}
				else {
					const i = (hasPenis && !Chastity.IsPenisAvailable(chastity) ? 1 : 0) + (hasVagina && !Chastity.IsVaginaAvailable(chastity) ? 2 : 0);
					arr.push(i > 0 && `${inspect ? "Their" : "Your"} ${i === 1 ? "penis" : i === 2 ? "vagina" : "penis and vagina"} is in chastity`);
				}
			}
			return formatTraits([hasPenis && "Penis", hasVagina && "Vagina", !hasGenitals && "Genitals"], arr, !hasGenitals);
		}

		function combineTraitHeaders(headers) {
			headers = (Array.isArray(headers) ? headers : [headers]).filter(o => o).map(header => getString(header));
			return headers.length > 2 ? headers.map((header, i) => i < headers.length - 1 ? header : `and ${header}`).join(", ") : headers.join(" & ");
		}

		function slotToTooltip(slot) {
			switch (slot) {
				case "held":
					return getString("Held Item");;
				case "summon":
				case "bag":
					return getString(firstToUpperCase(slot));
				default:
					return `${getString(firstToUpperCase(slot))}, ${getString("Accessory")}`;
			}
		}

		function formatTraits(headers, divs, lineThrough, replacementHeaders) {
			divs = divs.filter(o => o);
			headers = combineTraitHeaders(headers);
			replacementHeaders = replacementHeaders && combineTraitHeaders(replacementHeaders);
			const style = [
				lineThrough && "text-decoration: line-through",
			].filter(o => o);
			replacementHeaders = replacementHeaders ? `<div class="headers">${replacementHeaders}</div>` : '';
			return divs.length > 0 && headers.length > 0 ? `<div class="equipment_slot"><div${style.length > 0 ? ` style="${style.join("; ")}"` : ''}>${headers}</div>${replacementHeaders}<div>${divs.join("</div><div>")}</div></div>` : '';
		}

		function hasHips(physique) {
			switch (physique) {
				case "feminine":
				case "voluptuous":
				case "curvaceous":
					return true;
				default:
					return false;
			}
		}

		function drawStatusTimer(parent, type, countdowns) {
			const countdown = countdowns && countdowns.find(countdown => countdown.type === type);
			if (countdown) {
				const s = (countdown.timeout - Date.now()) / 1000;
				if (s >= 0) {
					const timer = document.createElement("div");
					timer.className = `effect_timer ${type}`;
					timer.textContent = TOOLTIP.GetStatusRemainingTime(s);
					parent.appendChild(timer);
					_timers.push({ elm: timer, countdown: type })
					return timer;
				}
			}
			return false;
		}

		function wordWrapping(elm) {
			const fontSize = parseFloat(window.getComputedStyle(elm).fontSize.split("px")[0]);
			return elm.clientHeight >= Math.floor(fontSize * 2);
		}
	}
})();
