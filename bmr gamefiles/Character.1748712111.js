
((window) => {
	const Skin = {
		Latex: 0,
		Plush: 1,
		SoftSkin: 85,
		SilkySkin: 170,
		LaceSkin: 255,
		SmoothSkin: 85,
		LatexSkin: 170,
		LatexDoll: 255,
	};

	const Breasts = {
		BreastSize: 0,
		BreastInflation: 1,
		Lactation: 2,
		BreastMilk: 3,
	};

	const Physique = {
		Voluptuous: 0,
		Muscular: 1,
		Slender: 2,
	};

	const Tail = {
		Demonic: 1,
		Wooly: 2,
		Vulpine: 3,
		Bunny: 4,
		Bovine: 5,
		Canine: 6,
		Feline: 7,
		Kitsune: 8,
	};

	const Horns = {
		Demonic: 1,
		Ram: 2,
		Bull: 3,
		BigBull: 4,
	};

	const Legs = {
		Wooly: 2,
		Vulpine: 3,
		Bunny: 4,
		Bovine: 5,
		Canine: 6,
		Feline: 7,
		Kitsune: 8,
		HaveToes: (legs) => {
			switch (legs) {
				case Legs.Wooly:
				case Legs.Bovine:
					return false;
				default:
					return true;
			}
		}
	};

	const Arms = {
		Demonic: 1,
		Wooly: 2,
		Vulpine: 3,
		Bunny: 4,
		Bovine: 5,
		Canine: 6,
		Feline: 7,
		Kitsune: 8,
		Armless: 65,
	};

	const Ears = {
		Wooly: 2,
		Vulpine: 3,
		Bunny: 4,
		Bovine: 5,
		Canine: 6,
		Feline: 7,
		Kitsune: 8,
		Elven: 64,
	};

	const Head = {
		Style: 0,
		EyeColor: 1,
		Ears: 2,
		Horns: 3,
		Tongue: 4,
		Animal: 1,
		Halo: 2,
		DarkHalo: 4,
	};

	const Wings = {
		Demonic: 1,
		Angelic: 2,
		DarkAngelic: 3,
	};

	const Body = {
		Arms: 0,
		Legs: 1,
		Tail: 2,
		Wings: 3,
		Quadruped: 1,
		CowUdder: 2,
		BlowUpDoll: 4,
	};

	const Effect = {
		Size: 1,
		Voice: 2,
		Curse: 3,
		Poison: 4,
		Disease: 5,
		DressCode: 6,
		Obsession: 7,
		Kink: 8,
		Fantasy: 9,
		Background: 10,
	};

	const Disease = {
		Hucow: 1,
		Slime: 2,
	};

	const Curse = {
		Mermaid: 1,
		Seacow: 2,
		Gold: 3,
		Tree: 4,
	};

	const Poison = {
		OverlySensitiveBreasts: 1,
		HeightenedLibido: 2,
		SporadicLactation: 3,
		MushroomSpores: 4,
	};

	const Training = {
		Anal: 0,
		Oral: 1,
	};

	const Voice = {
		Sheep: 1,
		Bovine: 2,
		Bimbo: 3,
		FrenhMaid: 4,
		Nekomimi: 5,
		Canine: 6,
		Feline: 7,
	};

	const Obsession = {
		Cumslut: 1,
		Buttslut: 2,
		Cocksucker: 3,
		Painslut: 4,
	};

	const Fantasy = {
		BreastEnvy: 1,
		HucowEnvy: 2,
		MaidEnvy: 3,
		BimboEnvy: 4,
		SmallPenisHumiliation: 5,
		SmallPersonFantasy: 6,
		BodyPaintFantasy: 7,
	};

	const Kink = {
		ExtremeInsertion: 1,
		Pet: 2,
		Gangbang: 3,
		Exhibitionism: 4,
		Cum: 5,
		Anal: 6,
		Cocksucker: 7,
	};

	const DressCode = {
		ExposedButt: 1,
		ExposedCrotch: 2,
		ExposedChest: 3,
		ShortenedTendons: 4,
		Fetishwear: 5,
	};

	const Genitalia = {
		Penis: 1,
		Vagina: 2,
		DormantPenis: 4,
		DormantVagina: 8,
	};

	const Size = {
		Shrink: 1,
		Enlarge: 2,
	};

	const BreastSize = {
		FlatChested: 0,
		TinyBreasts: 1,
		SmallBreasts: 2,
		Breasts: 3,
		BigBreasts: 4,
		HugeBreasts: 5,
		MassiveBreasts: 6,
		GargantuanBreasts: 7,
		ColossalBreasts: 8,
	};

	const GenitaliaSize = {
		TinyPenis: 1,
		SmallPenis: 2,
		Penis: 3,
		BigPenis: 4,
		HugePenis: 5,
		MassivePenis: 6,
		GargantuanPenis: 7,
		ColossalPenis: 8,
	};

	const formattingInserts = {};
	const empty = [];

	Object.defineProperties(formattingInserts, {
		'name': { get: () => LOCATION.instance.player.name },
		'names': { get: () => LOCATION.instance.player.names },
		'username': { get: () => GAME_MANAGER.instance.username },
		'username_color': { get: () => GAME_MANAGER.instance.settings.usernameColor },
		'height': { get: () => getHeightFromCharacter(LOCATION.instance.player) },
		'inanimate': {
			get: () => {
				const item = (GAME_MANAGER.instance.character || empty).item;
				if (item) {
					const base = item && GAME_MANAGER.instance.GetBaseItem(item);
					const displayName = item && getItemName(Object.assign({}, item, { base }));
					if (displayName) {
						return `[${displayName}]`;
					}
				}
				return undefined;
			}
		}
	});

	CHARACTER = {
		Tough: 1,
		Pure: 2,
		Curious: 3,
		Cunning: 4,
		Sexy: 5,
		MAX_SIZE: 3,
		MIN_SIZE: -3,
		formattingInserts,
		GetId: character => hash(character.token || character.id_token || `_${character.names || `${character.nature || ''} ${character.gender || ''}`.trim()}`),
		GetGreeting: character => character.greeting && (Array.isArray(character.greeting) ? character.greeting[Math.floor(Math.random() * character.greeting.length)] : character.greeting),
		GetFarewell: character => character.farewell && (Array.isArray(character.farewell) ? character.farewell[Math.floor(Math.random() * character.farewell.length)] : character.farewell),
		GetSprite: character => `assets/characters/${character.sprite ? character.sprite + (character.expression ? `_${character.expression}` : '') : `${characterToGender(character)}_${character.nature ? character.nature.toLowerCase() : ''}`}.png`,
		PhysiqueToLabel: (physique, defaultValue) => {
			if (!physique) {
				return defaultValue;
			}
			const [rotation, , magnitude] = RGBToHSV(physique);
			if (magnitude < 1 / 4) {
				return "androgynous";
			}
			if (clamp(rotation % 120, 30, 90) == (rotation % 120)) {
				return clamp(rotation, 30, 90) == rotation ? "curvaceous_lean" : clamp(rotation, 150, 210) == rotation ? "masculine" : "feminine";
			}
			if (Math.abs((rotation % 120) - 60) / 60 * magnitude >= 0.75) {
				return clamp(rotation, 60, 180) == rotation ? "muscular" : clamp(rotation, 180, 300) == rotation ? "slender" : "voluptuous";
			}
			return clamp(rotation, 60, 180) == rotation ? "lean" : clamp(rotation, 180, 300) == rotation ? "slim" : "curvaceous";
		},
		PhysiqueToZone: (physique, defaultValue) => CHARACTER.LabelToZone(CHARACTER.PhysiqueToLabel(physique, defaultValue)),
		PhysiqueClamp: (physique) => {
			physique = physique.slice();
			const max = Math.max(...physique);
			const min = Math.min(...physique);
			min > 0 && physique.forEach((value, i) => physique[i] = value - min);
			max > 255 && physique.forEach((value, i) => physique[i] = value - (max - 255));
			for (let i = 0; i < 3; i++) {
				physique[i] = clamp(physique[i] || 0, 0, 255);
			}
			return physique;
		},
		PhysiqueClampToZone: (physique, zone) => {
			physique = physique.slice();
			for (let i = 0; i < 3; i++) {
				physique[i] = physique[i] || 0;
			}
			switch (zone) {
				case "masculine":
					physique = [0, Math.max(128, physique[1] - physique[0], physique[2]), physique[2]];
					break;
				case "feminine":
					physique = [Math.max(128, physique[0], physique[1], physique[2]), physique[1], physique[2]];
					break;
				default:
					physique = [0, 0, Math.max(0, physique[2] - Math.max(physique[0], physique[1]))];
					break;
			}
			return physique;
		},
		PhysiqueAdd: (physique, rgb) => CHARACTER.PhysiqueClamp(physique.map((value, i) => {
			value += rgb[i];
			return clamp(value, 254, 256) === value ? 255 : clamp(value, 127, 129) === value ? 128 : value;
		})),
		PhysiqueVector: (physique) => {
			const [rotation, , magnitude] = RGBToHSV(physique);
			return { rotation, magnitude };
		},
		SkinToLabel: (skin, defaultValue) => {
			if (!skin) {
				return defaultValue;
			}
			if (skin[Skin.Latex] >= Skin.LatexDoll) {
				return "latex_doll";
			}
			if (skin[Skin.Latex] >= Skin.LatexSkin) {
				return "latex";
			}
			if (skin[Skin.Latex] >= Skin.SmoothSkin) {
				return "smooth";
			}
			if (skin[Skin.Plush] >= Skin.LaceSkin) {
				return "lace";
			}
			if (skin[Skin.Plush] >= Skin.SilkySkin) {
				return "silky";
			}
			if (skin[Skin.Plush] >= Skin.SoftSkin) {
				return "soft";
			}
			return null;
		},
		LabelToZone: label => {
			switch (label) {
				case "slim":
				case "slender":
					return "androgynous";
				case "curvaceous":
				case "voluptuous":
				case "curvaceous_lean":
					return "feminine";
				case "lean":
				case "muscular":
					return "masculine";
				default:
					return label;
			}
		},
		LabelToPhysique: label => {
			switch (label) {
				case "androgynous":
				default:
					return [0, 0, 0];
				case "masculine":
					return [0, 255, 255];
				case "feminine":
					return [255, 0, 255];
				case "voluptuous":
					return [255, 0, 0];
				case "curvaceous":
					return [128, 0, 0];
				case "muscular":
					return [0, 255, 0];
				case "lean":
					return [0, 128, 0];
				case "slender":
					return [0, 0, 255];
				case "slim":
					return [0, 0, 128];
				case "curvaceous_lean":
					return [255, 255, 0];
			}
		},
		HasPenis: (genitalia, defaultValue = false) => typeof genitalia === "number" ? hasFlag(genitalia, Genitalia.Penis, Genitalia.DormantPenis) : defaultValue,
		HasVagina: (genitalia, defaultValue = false) => typeof genitalia === "number" ? hasFlag(genitalia, Genitalia.Vagina, Genitalia.DormantVagina) : defaultValue,
		GetSize: effects => {
			const bytes = effects && effects.find(bytes => bytes[0] == Effect.Size);
			return bytes && clamp(bytes[2] * (bytes[1] == Size.Enlarge ? 1 : -1), CHARACTER.MIN_SIZE, CHARACTER.MAX_SIZE) || 0;
		},
		CalculateSize: (physique, height, size, includeDecimals) => {
			let w;
			const [rotation, , magnitude] = RGBToHSV(physique);
			if (clamp(rotation, 60, 120) == rotation) {
				w = lerp(0.5, (rotation - 60) / 60, magnitude);
			}
			else if (clamp(rotation, 120, 240) == rotation) {
				w = lerp(0.5, 1, magnitude);
			}
			else if (clamp(rotation, 240, 300) == rotation) {
				w = lerp(0.5, lerp(1, 0, (rotation - 240) / 60), magnitude);
			}
			else {
				w = lerp(0.5, 0, magnitude);
			}
			const v = clamp01((height + 1) * 0.5);
			const inches = lerp(lerp(12 * 4 + 5, 12 * 4 + 10, w), lerp(12 * 6 + 5, 12 * 6 + 10, w), v);
			const cm = inches * 2.54 * (size < 0 ? 1 / Math.pow(2, -size) : size + 1);
			return includeDecimals ? cm : Math.round(cm);
		},
		IntToNature: i => {
			switch (i) {
				case CHARACTER.Tough:
					return 'Tough';
				case CHARACTER.Pure:
					return 'Pure';
				case CHARACTER.Curious:
					return 'Curious';
				case CHARACTER.Cunning:
					return 'Cunning';
				case CHARACTER.Sexy:
					return 'Sexy';
				default:
					return null;
			}
		},
	};

	function breastsToSize(breasts) {
		return Math.round(clamp(breasts[0] + Math.round(breasts[1] * 1000) / 1000, 0, BreastSize.ColossalBreasts) * 1000) / 1000
	};

	function isFeminine(physique, breasts) {
		return !isMasculine(physique, breasts);
	}

	function isMasculine(physique, breasts) {
		const label = CHARACTER.PhysiqueToLabel(physique);
		switch (label) {
			case "lean":
			case "muscular":
			case "masculine":
				return true;
			case "curvaceous":
			case "voluptuous":
			case "curvaceous_lean":
			case "feminine":
				return false;
			default:
				return !(Array.isArray(breasts) && breastsToSize(breasts) >= 1);
		}
	}

	CHARACTER.Character = function () {
		const _obj = Object.assign({}, arguments[0]);

		Object.defineProperties(this, {
			'id': { value: CHARACTER.GetId(_obj), writable: false },
			'gender': { value: characterToGender(_obj), writable: false },
			'names': { value: _obj.names, writable: false },
			'displayName': { value: arguments[0].names || "???", writable: false },
			'firstName': { value: _obj.name || _obj.names && _obj.names.split(" ")[0] || "???", writable: false },
			'lastName': { value: _obj.surname || _obj.names && _obj.names.split(" ")[1] || null, writable: false },
			'username': { value: _obj.username, writable: false },
			'nature': { value: _obj.nature, writable: false },
			'token': { value: _obj.token, writable: false },
			'player': { value: _obj.token !== undefined, writable: false },
			'height': { value: _obj.height || 0, writable: false },
			'size': { value: CHARACTER.GetSize(_obj.effects) || 0, writable: false },
			'genitaliaSize': { value: hasFlag(_obj.genitalia, Genitalia.Penis) ? _obj.genitalia_size || GenitaliaSize.Penis : 0, writable: false },
		});

		this.HasSprite = () => _obj.sprite != null;

		this.GetGreeting = () => CHARACTER.GetGreeting(_obj);

		this.GetFarewell = () => CHARACTER.GetFarewell(_obj);

		this.GetSprite = () => CHARACTER.GetSprite(_obj);

		this.toString = () => this.names;

		GUI.instance.PreloadImage(CHARACTER.GetSprite(_obj));
	};

	Object.assign(CHARACTER, { Head, Ears, Body, Breasts, Tail, Wings, Horns, Legs, Arms, Physique, Curse, Poison, Disease, Effect, Voice, Skin, Size, BreastSize, GenitaliaSize, Genitalia, Training, DressCode, Obsession, Kink, Fantasy });

	function characterToQualities(character) {
		const label = CHARACTER.PhysiqueToLabel(character.physique);
		const nsfw = [];
		const obj = {
			head: getHeadImages(character.head, character.head_flags),
			arms: getArmsImages(character.body, character.body_flags, label),
			body: getBodyImages(character.body, character.body_flags),
			butt: getButtImages(character.body && character.body[Body.Tail], label),
			legs: getLegsImages(character.body && character.body[Body.Legs]),
			breasts: getBreastsImages(character.breasts),
		};
		for (let prop in obj) {
			if (Array.isArray(obj[prop])) {
				obj[prop] = obj[prop].map(imageURL => {
					const url = `/game/assets/qualities/${imageURL}`;
					switch (imageURL) {
						case "cow_udder.png":
						case "breasts_massive.png":
						case "breasts_colossal.png":
						case "breasts_gargantuan.png":
							nsfw.push(url);
							break;
					}
					return url;
				});
			}
		}
		obj.nsfw = nsfw.length > 0 ? nsfw : null;
		return obj;
	}

	function getBreastsImages(breasts) {
		const breastSize = breasts && (breasts[0] + breasts[1]);
		if (breastSize >= 1) {
			if (breastSize >= BreastSize.ColossalBreasts) {
				return ["breasts_colossal.png"];
			}
			if (breastSize >= BreastSize.GargantuanBreasts) {
				return ["breasts_gargantuan.png"];
			}
			if (breastSize >= BreastSize.MassiveBreasts) {
				return ["breasts_massive.png"];
			}
			if (breastSize >= BreastSize.HugeBreasts) {
				return ["breasts_huge.png"];
			}
			if (breastSize >= BreastSize.BigBreasts) {
				return ["breasts_big.png"];
			}
			if (breastSize >= BreastSize.Breasts) {
				return ["breasts_medium.png"];
			}
			if (breastSize >= BreastSize.SmallBreasts) {
				return ["breasts_small.png"];
			}
			return ["breasts_tiny.png"];
		}
		return null;
	}

	function getButtImages(tail, physique) {
		const images = [];
		switch (physique) {
			case "slim":
			case "slender":
			case "curvaceous":
			case "curvaceous_lean":
			case "voluptuous":
				images.push(`butt_physique_${physique === "slim" ? "slender" : physique === "curvaceous_lean" ? "curvaceous" : physique}.png`);
				break;
		}
		if (tail > 0) {
			images.push(`tail_${Object.keys(Tail).find(key => Tail[key] === tail).toLowerCase()}.${tail === Tail.Demonic ? "png" : "jpg"}`);
		}
		return images.length > 0 ? images : null;
	}

	function getBodyImages(body, bodyFlags) {
		const images = [];
		hasFlag(bodyFlags, Body.CowUdder) && images.push("cow_udder.png");
		switch (body && body[Body.Wings]) {
			case Wings.Angelic:
				images.push("wings_angel.jpg");
				break;
			case Wings.DarkAngelic:
				images.push("wings_angel_dark.jpg");
				break;
			case Wings.Demonic:
				images.push("wings_demonic.jpg");
				break;
		}
		return images.length > 0 ? images : null;
	}

	function getHeadImages(head, headFlags) {
		const images = [];
		const ears = head && head[Head.Ears];
		const horns = head && head[Head.Horns];
		if (ears >= 64) {
			switch (ears) {
				case Ears.Elven:
					images.push("head_elven_ears.png");
					break;
			}
		}
		if (ears && ears < 64) {
			const hasAnimalHead = hasFlag(headFlags, Head.Animal);
			const arr = ["head", Object.keys(Ears).find(key => Ears[key] === ears).toLowerCase(), !hasAnimalHead && "ears", !hasAnimalHead && compareEarsAndHorns(ears, horns) && (horns === Horns.BigBull ? "horns_big" : 'horns')];
			images.push(`${arr.filter(o => o).join("_")}.jpg`);
		}
		else if (horns) {
			switch (horns) {
				case Horns.BigBull:
				case Horns.Bull:
					images.push(`head_bovine_${horns === Horns.BigBull ? "horns_big" : "horns"}.jpg`);
					break;
				case Horns.Demonic:
				case Horns.Ram:
					images.push(`head_${horns === Horns.Demonic ? "demonic" : "wooly"}_horns.jpg`);
					break;
			}
		}
		if (hasFlag(headFlags, Head.Halo, Head.DarkHalo)) {
			images.push(`halo_${hasFlag(headFlags, Head.DarkHalo) ? "angel_dark" : "angel"}.jpg`);
		}
		return images.length > 0 ? images : null;
	}

	function getLegsImages(legs) {
		if (legs > 0) {
			return [`legs_${Object.keys(Legs).find(key => Legs[key] === legs).toLowerCase()}.jpg`];
		}
		return null;
	}

	function getArmsImages(body, bodyFlags, physique) {
		const images = [];
		const arms = body && body[Body.Arms];
		if (arms > 0) {
			images.push(`${isQuadruped(body, bodyFlags) ? "legs" : "arms"}_${Object.keys(Arms).find(key => Arms[key] === arms).toLowerCase()}.jpg`);
		}
		switch (physique) {
			case "lean":
			case "curvaceous_lean":
			case "muscular":
				images.push(`arms_physique_${physique === "curvaceous_lean" ? "lean" : physique}.jpg`);
				break;
		}
		return images.length > 0 ? images : null;
	}

	function compareEarsAndHorns(ears, horns) {
		switch (ears) {
			case Ears.Wooly:
				return horns === Horns.Ram;
			case Ears.Bovine:
				return horns === Horns.Bull || horns === Horns.BigBull;
			default:
				return false;
		}
	}

	function characterToGender(character) {
		return character.gender !== undefined ? character.gender.toLowerCase() : isMasculine(character.physique, character.breasts) ? "male" : "female";
	}

	function getHeightFromCharacter(character) {
		if (character) {
			const { physique, height, effects } = character;
			return formatSize(CHARACTER.CalculateSize(physique, height, CHARACTER.GetSize(effects)));
		}
		return false;
	}

	function isQuadruped(body, bodyFlags) {
		if (hasFlag(bodyFlags, Body.Quadruped)) {
			const arms = body && body[Body.Arms] || 0;
			return clamp(arms, 2, 8) === arms && Object.values(Arms).indexOf(arms) >= 0;
		}
		return false;
	}

	window.getHeightFromCharacter = getHeightFromCharacter;
	window.characterToQualities = characterToQualities;
	window.characterToGender = characterToGender;
	window.isMasculine = isMasculine;
	window.isFeminine = isFeminine;
	window.isQuadruped = isQuadruped;
	window.breastsToSize = breastsToSize;
})(window);
