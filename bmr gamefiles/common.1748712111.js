((window) => {
	const transitions = {
		'transition': 'transitionend',
		'WebkitTransition': 'webkitTransitionEnd',
		'MozTransition': 'transitionend',
		'OTransition': 'otransitionend'
	};

	const imageByMaterialName = {
		"Crown": "/game/assets/gui/coin.png",
		"Sol Talisman": "/game/assets/items/talisman/talisman_sol.png",
		"Luna Talisman": "/game/assets/items/talisman/talisman_luna.png",
		"Blood Moon Talisman": "/game/assets/items/talisman/talisman_blood_moon.png",
		"Talisman of Eclipsing": "/game/assets/items/talisman/talisman_eclipsing.png",
		"Triple Goddess Talisman": "/game/assets/items/talisman/talisman_triple_goddess.png",
		"Chromatic Dye": "/game/assets/items/dye/dye_chromatic.png",
		"Ornamental Charm": "/game/assets/items/charm/charm_ornamental.png",
		"Cleansing Beads": "/game/assets/items/beads_cleansing.png",
		"Cleansing Soap": "/game/assets/items/cleansing_soap.png",
		"Solstice Talisman": "/game/assets/items/talisman/talisman_solstice.png",
		"Bone Talisman": "/game/assets/items/talisman/talisman_bone.png",
		"Astral Talisman": "/game/assets/items/talisman/talisman_astral.png",
		"Gummy Bone": "/game/assets/items/candy/candy_canine.png",
		"Chocolate Bunny": "/game/assets/items/candy/candy_bunny.png",
		"Lollipop": "/game/assets/items/candy/candy_fox.png",
		"Licorice Candy": "/game/assets/items/candy/candy_cat.png",
		"Candy Cane": "/game/assets/items/candy/candy_cane.png",
		"Holly Charm": "/game/assets/items/charm/charm_holly.png",
		"Enchanted Dust": "/game/assets/items/enchantment_dust.png",
		"Enchanted Shards": "/game/assets/items/enchantment_shards.png",
		"Enchanted Crystal": "/game/assets/items/enchantment_crystal.png",
	};

	let _transitionEnd;
	let _encoder;
	let _mediaScale;
	let _containerScale;

	{
		const elm = document.createElement('div');
		for (let prop in transitions) {
			if (elm.style[prop] !== undefined) {
				_transitionEnd = transitions[prop];
				break;
			}
		}
	}

	window.arrayBufferToJSON = async buffer => (_encoder || (_encoder = new TextDecoder())).decode(pako.inflate(buffer));

	window.getMediaScale = () => _mediaScale || (_mediaScale = window.getContainerScale() * window.devicePixelRatio);

	window.getContainerScale = () => _containerScale || (_containerScale = container.getBoundingClientRect().width / 1280);

	window.clearMediaScale = () => _containerScale = _mediaScale = undefined;

	window.materialToImage = material => imageByMaterialName[material] || null;

	window.transitionEnded = async function transitionEnded(elm) {
		let completed;
		const onCompleted = () => completed = true;
		elm.addEventListener(_transitionEnd, onCompleted);
		await waitWhile(() => !completed && document.body.contains(elm));
		elm.removeEventListener(_transitionEnd, onCompleted);
	}

	const _flagsByReferenceName = {};

	window.OverlySensitive = {
		Breasts: 1,
		Mouth: 2,
		Butt: 4,
		Cock: 8,
		Pussy: 16,
		Clitoris: 32,
		Dildo: 64,
		Cum: 128,
		Pet: 256,
		Pain: 512,
		Humiliation: 1024,
		Tease: 2048,
		FromString: str => _flagsByReferenceName[str] || 0,
	}

	Object.entries(window.OverlySensitive).forEach(([key, flag]) => _flagsByReferenceName[nameToRef(key)] = flag);
})(window);

const defaultLengthUnit = (navigator.language || navigator.userLanguage || '').match(/^en$|^en-(?:us|uk|gb|ca)/i) ? "feet_and_inches" : "centimeter";
const touchSupported = 'ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
const inIframe = window.self !== window.top;

const romanMatrix = [
	[1000, 'M'],
	[900, 'CM'],
	[500, 'D'],
	[400, 'CD'],
	[100, 'C'],
	[90, 'XC'],
	[50, 'L'],
	[40, 'XL'],
	[10, 'X'],
	[9, 'IX'],
	[5, 'V'],
	[4, 'IV'],
	[1, 'I']
];

const Group = {
	None: 0,
	Rings: 1,
	Necklace: 2,
	Shirts: 3,
	TShirts: 4,
	Legwear: 6,
	Socks: 8,
	Gags: 9,
	Glasses: 10,
	Ties: 11,
	Vests: 12,
	Belts: 13,
	Cuffs: 14,
	Skirt: 15,
	Plugs: 16,
	Bodysuit: 18,
	Top: 19,
	Chastity: 20,
	StrapOn: 21,
};

const Chastity = {
	Penis: 1,
	Vagina: 2,
	Ass: 4,
	StrapOn: 8,
	IsPenisAvailable: chastity => !chastity || (chastity & Chastity.Penis) === 0,
	IsVaginaAvailable: chastity => !chastity || (chastity & (Chastity.Vagina | Chastity.StrapOn)) === 0,
	IsAssAvailable: chastity => !chastity || (chastity & Chastity.Ass) === 0,
};

const Attribute = {
	None: 0,
	Unidentified: 1,
	Conjured: 2,
	Hexed: 4,
	Temporary: 8,
	Unknown: 16,
	Amber: 32,
	Hexproof: 64,
	Prototype: 128,
	Untradeable: 256,
	TradeLimited: 512,
	IsUnidentified: attribute => attribute && (attribute & Attribute.Unidentified) === Attribute.Unidentified,
	IsConjured: attribute => attribute && hasFlag(attribute, Attribute.Conjured, Attribute.Temporary),
	IsHexed: attribute => attribute && (attribute & (Attribute.Hexed | Attribute.Amber)) === Attribute.Hexed,
	IsTemporary: attribute => attribute && (attribute & Attribute.Temporary) === Attribute.Temporary,
	IsHexproof: attribute => attribute && (attribute & Attribute.Hexproof) === Attribute.Hexproof,
	IsConjuredHexed: attribute => attribute && hasFlag(attribute, Attribute.Conjured | Attribute.Hexed),
	IsUnknownHexed: attribute => attribute && (attribute & Attribute.Unknown) === Attribute.Unknown && Attribute.IsHexed(attribute),
	IsPrototype: attribute => attribute && (attribute & Attribute.Prototype) === Attribute.Prototype,
	IsUntradeable: attribute => attribute && (attribute & (Attribute.Untradeable | Attribute.Prototype)) !== 0 || false,
	IsTradeLimited: attribute => attribute && (attribute & (Attribute.Untradeable | Attribute.Prototype | Attribute.TradeLimited)) !== 0 || false,
	HasAmber: attribute => attribute && (attribute & Attribute.Amber) === Attribute.Amber,
};

const Sexuality = Object.freeze({
	None: 0,
	FM: 1,
	FF: 2,
	MM: 4,
	FM_FeminineWithPhallus: 8,
	FM_MasculineWithVagina: 16,
	FF_PhallusOnVagina: 32,
	FF_PhallusOnPhallus: 64,
	MM_PhallusOnVagina: 128,
	MM_VaginaOnVagina: 256,
	Sanitize: sexuality => {
		if (sexuality >= 1) {
			if (!hasFlag(sexuality, Sexuality.FM)) {
				sexuality &= ~(Sexuality.FM_FeminineWithPhallus | Sexuality.FM_MasculineWithVagina);
			}
			if (!hasFlag(sexuality, Sexuality.FF)) {
				sexuality &= ~(Sexuality.FF_PhallusOnVagina | Sexuality.FF_PhallusOnPhallus);
			}
			if (!hasFlag(sexuality, Sexuality.MM)) {
				sexuality &= ~(Sexuality.MM_PhallusOnVagina | Sexuality.MM_VaginaOnVagina);
			}
			return sexuality;
		}
		return 0;
	},
	AllowFeminineWithPenis: (...sexuality) => sexuality.every(sexuality => hasFlag(sexuality, Sexuality.FM | Sexuality.FM_FeminineWithPhallus, Sexuality.FF | Sexuality.FF_PhallusOnVagina, Sexuality.FF | Sexuality.FF_PhallusOnPhallus)),
	AllowMasculineWithVagina: (...sexuality) => sexuality.every(sexuality => hasFlag(sexuality, Sexuality.FM | Sexuality.FM_MasculineWithVagina, Sexuality.MM | Sexuality.MM_PhallusOnVagina, Sexuality.MM | Sexuality.MM_VaginaOnVagina)),
});

Object.freeze(Object.assign(Chastity, { VaginaAndAss: Chastity.Vagina | Chastity.Ass }))
Object.freeze(Object.assign(Attribute, { MagicalProperties: Attribute.Hexproof | Attribute.Amber }))

function extractProps(obj, ...props) {
	return props.reduce((output, prop) => { prop in obj && (output[prop] = obj[prop]); return output }, {});
}

function modulus(i, m) {
	return (i % m + m) % m;
}

function nicifyPropertyName(prop) {
	return prop && collapseWhitespace(prop.replace(/(^|[a-z_])([A-Z])/g, "$1 $2").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " "));
}

function nameToRef(name) {
	return name.toLowerCase().replace(/\'/g, '').replace(/[\s\-]/g, '_');
}

function commaSeparatedThousands(i) {
	return Math.round(i).toLocaleString().replace(/\./g, ",");
}

function formatMediaURL(url, ...args) {
	args = args.filter(value => value);
	return args.length > 0 ? url.replace(/^(?:(.+)game\/)?assets\/(.+\/)(.+(?:\.jpg|\.png))$/, `$1media/$2${args.join("/")}/$3`) : url;
}

function deepFreeze(obj) {
	for (let prop in obj) {
		const value = obj[prop];
		if (value && typeof value === "object") {
			deepFreeze(value);
		}
	}
	return Object.freeze(obj);
}

function deepSeal(obj) {
	for (let prop in obj) {
		const value = obj[prop];
		if (value && typeof value === "object") {
			deepSeal(value);
		}
	}
	return Object.seal(obj);
}

function deepClone(obj) {
	if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
		if (Array.isArray(obj)) {
			return obj.reduce((arr, value, i) => { arr[i] = deepClone(value); return arr; }, new Array(obj.length));
		}
		return Object.keys(obj).reduce((o, key, i) => { o[key] = deepClone(obj[key]); return o; }, {});
	}
	return obj;
}

function orderKeys(obj) {
	return Object.keys(obj).sort().reduce((ordered, key) => {
		ordered[key] = obj[key];
		return ordered;
	}, {});
}

function compareBackgroundImages(elm, backgroundImage) {
	const match = elm.style.backgroundImage && elm.style.backgroundImage.match(/^url\(["']?([^"']*)["']?\)$/);
	return match && match[1] === backgroundImage;
}

function compareUsernames(a, b) {
	return typeof a === "string" && typeof b === "string" && a.toUpperCase() === b.toUpperCase();
}

function isAnonymousUsername(username) {
	return typeof username === "string" && username.charAt() === "$";
}

function isScrolledToBottom(elm, threshold = 10) {
	return Math.ceil(elm.scrollTop) + threshold >= elm.scrollHeight - elm.offsetHeight;
}

function scrollToBottom(elm) {
	if (elm.offsetHeight < elm.scrollHeight) {
		elm.scrollTop = elm.scrollHeight - elm.offsetHeight;
	}
};

function clearHTML(elm) {
	while (elm.firstChild) {
		elm.removeChild(elm.firstChild);
	}
}

function escapeHTMLOperators(str) {
	return str.replace(/&(?!(\w+|#\d+);)/g, "&amp;")
		.replace(/ /g, "&#32;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/\ufeff/g, '');
}

function collapseLineBreaks(str) {
	return str.replace(/(?:\r\n|\r|\n)+/g, ' ');
}

function reduceLineBreaks(str) {
	return str.replace(/\n\s*\n\s*\n/g, "\n\n");
}

function collapseWhitespace(str) {
	return str.trim().replace(/(\s+){2,}/g, ' ');
}

function removeBreakRows(str) {
	return str.replace(/\<br\/\>/g, ' ');
}

function removeWhiteSpace(text) {
	return text.trim().replace(/\s/g, '');
}

function parseLambda(args, expression, map) {
	if (map) {
		return map.get(expression) || map.set(expression, parseLambda(args, expression)).get(expression);
	}
	return expression && removeWhiteSpace(expression).startsWith("()=>") ? new Function(...args, `"use strict"; return ${expression.substring(expression.indexOf('>') + 1)}`) : () => false;
}

function clamp(number, min, max) {
	return Math.min(Math.max(number, min), max);
}

function clamp01(number) {
	return Math.min(Math.max(number, 0), 1);
}

function hasAnyKey(obj) {
	for (const prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			return true;
		}
	}
	return false;
}

function powfloor(a) {
	let p = 1;
	while (a >>= 1) {
		p <<= 1;
	}
	return p;
}

function powCeil(n) {
	const pow = 1 << 31 - Math.clz32(n);
	return pow < n ? pow * 2 : pow;
}

function roundChance(chance) {
	return chance < 1 ? Math.ceil(chance) : chance > 99 ? Math.floor(chance) : Math.round(chance);
}

function shuffle(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
	return arr;
}

function getSiblingIndex(node) {
	if (node.parentNode) {
		let i;
		for (i = 0; (node = node.previousSibling); i++);
		return i;
	}
	return -1;
}

function unique(arr) {
	return (Array.isArray(arr) ? arr : Array.from(arr)).filter((value, index, self) => value && self.indexOf(value) === index);
}

function itemsAreSimilar(a, b) {
	return a.base.id == b.base.id && a.variant_color == b.variant_color;
}

function contentToText(elm) {
	let isOnFreshLine = true;
	const parseChildNodesForValueAndLines = (childNodes) => {
		let str = '';
		for (let i = 0; i < childNodes.length; i++) {
			const childNode = childNodes[i];
			if (childNode.nodeName === 'BR') {
				str += '\n';
				isOnFreshLine = true;
				continue;
			}
			if (childNode.nodeName === 'DIV' && isOnFreshLine === false) {
				str += '\n';
			}
			isOnFreshLine = false;
			if (childNode.nodeType === Node.TEXT_NODE) {
				str += childNode.nodeValue;
			}
			str += parseChildNodesForValueAndLines(childNode.childNodes);
		}
		return str;
	}
	return parseChildNodesForValueAndLines(elm.childNodes).replace(/\ufeff/g, '');
}

function firstToUpperCase(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function firstToLowerCase(str) {
	return str.charAt(0).toLowerCase() + str.slice(1);
}

function burnPosition(item, positions, position, width, height) {
	if (position < 0) {
		return false;
	}
	const row = Math.floor(position / width);
	const column = position % width;
	const size = item.base.width * item.base.height;
	const indice = [];
	for (let i = 0; i < size; i++) {
		const index = (Math.min(height - 1, row + Math.floor(i / item.base.width))) * width + Math.min(width - 1, column + (i % item.base.width));
		if (positions[index] || indice.includes(index)) {
			return false;
		}
		indice.push(index);
	}
	indice.forEach(index => positions[index] = item.id);
	return true;
}

function removeEmptyTextNodes(elm) {
	for (const children of [elm].concat(unique(elm.getElementsByTagName("*"))).map(elm => elm.childNodes).filter(o => o)) {
		for (let i = 0; i < children.length; i++) {
			if (children[i].nodeType === Node.TEXT_NODE && children[i].nodeValue.trim().length === 0) {
				children[i].parentNode.removeChild(children[i]);
			}
		}
	}
}

function getTextNodeValues(elm) {
	const arr = [];
	for (const children of [elm].concat(unique(elm.getElementsByTagName("*"))).map(elm => elm.childNodes).filter(o => o)) {
		for (var i = 0; i < children.length; i++) {
			if (children[i].nodeType === Node.TEXT_NODE) {
				arr.push(children[i].nodeValue.trim());
			}
		}
	}
	return unique(arr);
}

function isGenericObject(obj) {
	return obj && obj.constructor === Object;
}

async function wait(millis) {
	return new Promise((resolve) => {
		const timer = setTimeout(() => {
			clearTimeout(timer);
			resolve();
		}, millis);
	});
}

async function waitForSeconds(seconds) {
	return wait(seconds * 1000);
}

async function waitForFrame() {
	return new Promise(resolve => requestAnimationFrame(resolve));
}

async function waitUntil(func) {
	while (!func()) {
		await waitForFrame();
	}
}

async function waitWhile(func) {
	while (func()) {
		await waitForFrame();
	}
}

function imageLoaded(src) {
	const img = new Image();
	img.src = src;
	return img.complete;
}

async function loadImage(src, crossOrigin) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = (e) => reject(e);
		img.src = src;
		crossOrigin && (img.crossOrigin = "Anonymous");
	});
}

function isPageHidden() {
	return document.hidden || document.msHidden || document.webkitHidden || document.mozHidden;
}

function getBaseItemTypes(baseItem) {
	return baseItem.types || [baseItem.type, ...(Array.isArray(baseItem.subtype) ? baseItem.subtype : typeof baseItem.subtype === "string" ? baseItem.subtype.split(",").map(type => type.trim()) : [])];
}

function trimPunctuations(str) {
	while (str.length > 0 && str[str.length - 1] === ".") {
		str = str.substr(0, str.length - 1);
	}
	return str;
}

function appendPunctuation(str) {
	return str.length > 0 && ".!?".includes(str[str.length - 1]) === false ? str + "." : str;
}

function isDescendant(parent, node) {
	return parent && node && parent !== node && parent.contains(node);
}

function easeInOutElastic(x) {
	const c5 = (2 * Math.PI) / 4.5;
	return x === 0
		? 0
		: x === 1
			? 1
			: x < 0.5
				? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
				: (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}

function easeInOutExpo(x) {
	return x === 0
		? 0
		: x === 1
			? 1
			: x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
				: (2 - Math.pow(2, -20 * x + 10)) / 2;
}

function easeInOutBack(x) {
	const c1 = 1.70158;
	const c2 = c1 * 1.525;
	return x < 0.5
		? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
		: (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

function easeOutBounce(x) {
	const n1 = 7.5625;
	const d1 = 2.75;
	if (x < 1 / d1) {
		return n1 * x * x;
	}
	if (x < 2 / d1) {
		return n1 * (x -= 1.5 / d1) * x + 0.75;
	}
	if (x < 2.5 / d1) {
		return n1 * (x -= 2.25 / d1) * x + 0.9375;
	}
	return n1 * (x -= 2.625 / d1) * x + 0.984375;
}

function convertToRoman(num) {
	if (num > 0) {
		for (let i = 0; i < romanMatrix.length; i++) {
			if (num >= romanMatrix[i][0]) {
				return romanMatrix[i][1] + convertToRoman(num - romanMatrix[i][0]);
			}
		}
	}
	return '';
}

function hash(str, seed = 0) {
	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
	h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
	h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

function hasFlag(a, ...flags) {
	return flags.some(b => (a & b) == b);
}

function removeFlag(a, b) {
	return a & (~b);
}

function lerp(a, b, w) {
	return a + (b - a) * w;
}

function findParentWithClass(elm, cls) {
	let parent = elm;
	while (parent = elm.parentNode) {
		if (parent.classList.includes(cls)) {
			return parent;
		}
	}
	return null;
}

function insertTextColor(text) {
	return text ? text.replace(/\[+([^\]]+)\]+/g, (_, prop) => {
		switch (prop.toLowerCase()) {
			case "lust":
			case "max lust":
				return `<span class="lust">[${prop}]</span>`;
			case "sexual":
			case "cum":
			case "oral":
			case "anal":
			case "pussy":
			case "cock":
			case "pet":
			case "bondage":
			case "breasts":
				return `<span class="sexual">[${prop}]</span>`;
			case "athletics":
			case "running":
			case "swimming":
			case "acrobatics":
			case "brawl":
			case "constitution":
				return `<span class="athletics">[${prop}]</span>`;
			case "skill":
			case "performance":
			case "survival":
			case "security":
			case "cooking":
			case "cleaning":
			case "stealth":
				return `<span class="skill">[${prop}]</span>`;
			case "knowledge":
			case "history":
			case "nature":
			case "etiquette":
			case "technology":
			case "medicine":
			case "occult":
			case "fashion":
				return `<span class="knowledge">[${prop}]</span>`;
			case "talent":
			case "empathy":
			case "animal":
			case "animal handling":
			case "expression":
			case "beauty":
			default:
				return `<span>[${prop}]</span>`;
		}
	}) : text;
}

function insertNature(imageURL, nature, playerNature) {
	return imageURL && imageURL.includes("{") ? imageURL.replace(/\{((?:PLAYER_)?NATURE)\}/g, (_, prop) => {
		switch (prop) {
			case "PLAYER_NATURE":
				return (playerNature || nature || "pure").toLowerCase();
			case "NATURE":
				return nature ? nature.toLowerCase() : "pure";
			default:
				return prop;
		}
	}) : imageURL;
}

function unixSecondsToElapsedTimeLabel(timestamp) {
	let i, str;

	const date = new Date(timestamp * 1000);
	const s = Math.floor((Date.now() - date.getTime()) / 1000);

	if (s < 60) {
		i = 0;
		str = "<1 minute";
	}
	else if (s < 60 * 60) {
		i = Math.floor(s / 60);
		str = `${i} minute`;
	}
	else if (s < 60 * 60 * 24) {
		i = Math.floor(s / (60 * 60));
		str = `${i} hour`;
	}
	else if (s < 60 * 60 * 24 * 7) {
		i = Math.floor(s / (60 * 60 * 24));
		str = `${i} day`;
	}
	else if (s < 60 * 60 * 24 * 7 * 4) {
		i = Math.floor(s / (60 * 60 * 24 * 7));
		str = `${i} week`;
	}
	else if (s < 60 * 60 * 24 * 365) {
		i = Math.floor(s / (60 * 60 * 24 * 7 * 4));
		str = `${i} month`;
	}
	else {
		i = Math.floor(s / (60 * 60 * 24 * 365));
		str = `${i} year`;
	}

	return str + (i > 1 ? "s ago" : " ago");
}

function itemToElement(item) {
	const span = document.createElement("span");
	span.className = "linked_item";
	span.textContent = `[${getItemName(item)}]`;
	span.onclick = (e) => TOOLTIP.instance.IsActive() && TOOLTIP.instance.trigger == span ? TOOLTIP.instance.Hide() : TOOLTIP.instance.ShowItem(e, item);
	return span;
}

function getSpellFullyQualifiedName(spell) {
	let spellName = spell.spell_name || spell.action_name;
	if (spell.prefix) {
		spellName = `${spell.prefix}: ${spellName}`;
	}
	if (spell.option_name) {
		spellName = `${spellName} (${spell.option_name})`;
	}
	return spellName;
}

function getItemName(item, enchantments, types) {
	enchantments = enchantments || item.enchantments || GAME_MANAGER.instance.GetEnchantments(item.id) || [];
	const names = [(enchantments.find(e => e.item_name) || item.base).item_name];
	item.base.prefix && names.unshift(item.base.prefix);
	item.base.suffix && names.push(item.base.suffix);
	if (Attribute.IsHexed(item.attributes)) {
		names.unshift("Hexed");
	}
	else {
		switch (Math.min(Number.MAX_VALUE, ...enchantments.filter(e => e.tier).map(e => e.tier))) {
			case 3:
				item.base.item_name.indexOf("Magic") !== 0 && names.unshift("Magic");
				break;
			case 2:
				names.unshift("Occult");
				break;
			case 1:
				names.unshift("Blessed");
				break;
		}
	}
	types = types || getBaseItemTypes(item.base);
	if (types.includes("electronic") && Attribute.IsPrototype(item.attributes)) {
		names.push("Prototype");
	}
	return names.join(" ");
}

function isTradeLimited(item) {
	return item.base.tradeLimited || item.base.untradeable || Attribute.IsTradeLimited(item.attributes);
}

function isUntradeable(item) {
	return item.base.untradeable || Attribute.IsUntradeable(item.attributes);
}

function RGBToHSV(rgb) {
	let r = rgb[0] / 255;
	let g = rgb[1] / 255;
	let b = rgb[2] / 255;
	let max = Math.max(r, g, b);
	let min = Math.min(r, g, b);
	let v = max;
	if (max == min) {
		return [0, 0, v];
	}
	let diff = max - min;
	let h;
	switch (max) {
		case r:
			h = ((g - b) / diff + (g < b ? 6 : 0)) / 6 * 360;
			break;
		case g:
			h = ((b - r) / diff + 2) / 6 * 360;
			break;
		case b:
			h = ((r - g) / diff + 4) / 6 * 360;
			break;
	}
	return [h, diff / max, v];
}
