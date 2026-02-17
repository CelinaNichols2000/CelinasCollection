((window) => {
	const ServerCode = {
		LoginFailed: 4000,
		LoginFromAnotherLocation: 4002,
		MovingServer: 4003,
		CharacterNotFound: 4010,
		CharacterOnline: 4011,
		LoadingGameDataFailed: 4020,
		ReconnectTimedOut: 4022,
		TemporaryItemTimeout: 4030,
		PromptRefresh: 4040,
		PromptChangeUsername: 4041,
	}

	const Redraw = {
		DesireActions: 1,
		InanimateActions: 4,
		ActionBars: 4,
		Macros: 8,
		Spells: 16,
		Inventory: 32,
		Crafting: 64,
		Stash: 128,
		Trade: 256,
	}

	const PropertyID = Object.freeze({
		Token: 0,
		Username: 0,
		Character: 1,
		IsTyping: 2,
		ServerCode: 0,
	});

	GAME_MANAGER = {
		ServerCode,
		PropertyID,
		DEV_ENV: window.location.host.indexOf("test.") === 0,
	};

	GAME_MANAGER.API_HOST = `https://${GAME_MANAGER.DEV_ENV ? "test." : ''}battlemageserotica.com`;
	GAME_MANAGER.WEB_SOCKET = `wss://battlemages-app-${GAME_MANAGER.DEV_ENV ? "test-d5842a0e8f06" : "live-27f368751fc2"}.herokuapp.com`;
	GAME_MANAGER.HTTPS = `https://battlemages-app-${GAME_MANAGER.DEV_ENV ? "test-d5842a0e8f06" : "live-27f368751fc2"}.herokuapp.com`;

	const DEBUG_LOG_ENABLED = GAME_MANAGER.DEV_ENV;

	let _instance;

	Object.defineProperty(GAME_MANAGER, 'instance', { get: () => _instance || (_instance = new GameManager()) });

	const noop = () => { };
	const empty = [];

	const ws = Symbol("ws");
	const ready = Symbol("ready");

	function GameManager() {
		const _loadSymbol = document.getElementById("load_symbol");

		let _guiBaton;
		let _guiKey = {};

		let _knownUsernames;

		const _messageKey = {};
		const _messageIds = [];

		const _colorsByUsername = {};
		const _friends = [{}, {}, {}, {}];

		let _remembered = false;
		let _session = null;
		let _idToken = null;
		let _ws = null;

		let _recentCharacters = Object.freeze([]);
		let _characterNotes = Object.freeze([]);
		let _ignoredUsers = {};

		let _scenario = false;
		let _recentlyDefeated = false;

		let _discoveredLocations = [];

		let _nextId = 0;
		let _nextTempId = 0;

		let _tier = 0;
		let _email;

		const _spells = {};
		const _skills = {};
		const _filter = {};
		const _settings = { character: {} };
		const _actions = {};
		const _tempItems = {};
		const _callbacks = new Map();

		const _spellsById = new Map();
		const _spellVariantsById = new Map();

		const _countdownsByIdToken = {};
		const _publicItemCache = new Map();
		const _materialCache = new Map();
		const _itemCount = new Map();

		let _roleplayScenario = null;

		let _items = {};
		let _baseItems = {};
		let _enchantments = {};

		let _owner = null;
		let _character = null;

		let _equipment = { items: [], worn: [] };
		let _inventory = { held: null, crafting: null, loot: null, tab: [], heirlooms: [] };

		let _abilities;
		let _chastity;
		let _spellsCache;
		let _wornItemsCache;
		let _wornBaseItemsCache;
		let _baseItemCache;
		let _stashItemIds;
		let _hindered;
		let _retrained;

		let _relog;
		let _readyResolve;
		let _ready = createReadyPromise();

		Object.defineProperties(this, {
			'spells': { value: _spells, writable: false },
			'skills': { value: _skills, writable: false },
			'actions': { value: _actions, writable: false },
			'filter': { value: _filter, writable: false },
			'settings': { value: _settings, writable: false },
			'ready': { get: () => _ready },
			'email': { get: () => _email || null },
			'abilities': { get: () => _abilities || [] },
			'username': { get: () => getSession().username },
			'session': { get: () => getSession() },
			'owner': { get: () => _owner },
			'inanimate': { get: () => _character && Boolean(_character.item) },
			'character': { get: () => _character },
			'remembered': { get: () => _remembered },
			'tier': { get: () => _tier },
			'inventory': { get: () => _inventory },
			'heldItem': { get: () => _inventory.held },
			'loot': { get: () => _inventory.loot && _items[_inventory.loot] && _inventory.loot || null },
			'equipment': { get: () => _equipment },
			'friends': { get: () => _friends.map(friend => Object.assign({}, friend)) },
			'ignoredUsers': { get: () => _ignoredUsers ? Object.assign({}, _ignoredUsers) : {} },
			'roleplayScenario': { get: () => _roleplayScenario || { title: '', description: '' } },
			'recentCharacters': { get: () => _recentCharacters },
			'characterNotes': { get: () => _characterNotes },
			'discoveredLocations': { get: () => _discoveredLocations },
			'explored': { get: () => isCountdownActive(_character.token, "explored") },
			'recentlyDefeated': { get: () => isCountdownActive(_character.token, "recentlyDefeated") },
			'chastity': { get: () => _chastity !== undefined ? _chastity : (_chastity = getWornBaseItems().reduce((chastity, baseItem) => chastity | (baseItem.chastity > 0 ? baseItem.chastity : 0), 0)) },
		});

		if (GAME_MANAGER.DEV_ENV) {
			container.classList.add("dev");
		}
		else {
			container.oncontextmenu = (e) => {
				if (e) {
					const x = e.pageX !== undefined ? e.pageX : e.targetTouches[0].pageX;
					const y = e.pageY !== undefined ? e.pageY : e.targetTouches[0].pageY;
					let elm = document.elementFromPoint(x, y);
					if (elm) {
						if (elm.tagName === "INPUT") {
							return;
						}
						while (elm) {
							if (elm.contentEditable === "true") {
								return;
							}
							elm = elm.parentNode;
						}
						return !e.preventDefault();
					}
				}
			};
		}

		const getSession = () => {
			if (!_session) {
				let data = sessionStorage.getItem("session");
				if (!data) {
					data = localStorage.getItem("session");
					_remembered = true;
				}
				try {
					_session = data ? JSON.parse(data) : {};
				}
				catch (e) { }
				_session = _session || {};
			}
			return _session;
		};

		const webSocketFunctions = [
			function onopen() {
				this.send(JSON.stringify(Object.assign({}, getSession(), { id_token: _idToken, relog: _relog, origin_timestamp: getOriginTime(), device_id: getDeviceId() })));
			},
			function onclose(e) {
				console.error(e);
				switch (e.code) {
					case ServerCode.LoginFromAnotherLocation:
					case ServerCode.LoadingGameDataFailed:
					case ServerCode.CharacterNotFound:
					case ServerCode.CharacterOnline:
						displayError(e);
						break;
					case ServerCode.PromptRefresh:
						window.location.reload(true);
						break;
					case ServerCode.PromptChangeUsername:
						displaySymbol(false);
						INPUT.instance.ShowAsChangeUsername(getSession().username || '', (username, prevUsername) => {
							username !== false && (_remembered || isAnonymousUsername(prevUsername) ? localStorage : sessionStorage).setItem("session", JSON.stringify(Object.assign(_session, { username })));
							window.location.reload(true);
						});
						break;
					default:
						GAME_MANAGER.instance.Connect().catch(() => displayError(e))
						break;
				}
			},
		].reduce((obj, func) => { obj[func.name] = func; return obj }, {});

		this.Connect = async idToken => {
			if (LOCK.IsLocked(this)) {
				return LOCK.WaitUntilReleased(this);
			}
			if (getSession().username == null) {
				return gotoCharacterSelection();
			}
			_idToken = idToken || _idToken;
			_relog = _ws != null;
			if (_relog) {
				if (LOCK.BatonExists(_readyResolve)) {
					LOCK.RemoveBaton(_readyResolve);
				}
				else {
					_ready = createReadyPromise();
				}
			}
			const baton = displaySymbol(true);
			await LOCK.Lock(this);
			try {
				let error, waitInterval;
				do {
					error = null;
					waitInterval = 0;
					const timeout = Date.now() + 20 * 1000;
					do {
						try {
							if (_ws && _ws.readyState !== 3) {
								_ws.close();
							}
							_ws = Object.assign(GAME_MANAGER[ws] = new WebSocket(GAME_MANAGER.WEB_SOCKET), webSocketFunctions, { binaryType: "arraybuffer" });
							await Promise.race([waitForSeconds(30), waitUntil(() => _ws.readyState === 3 || _ws.onmessage === onMessage), new Promise((resolve, reject) => {
								_ws.error = (e) => {
									console.error(e);
									reject(e);
								}
								_ws.onmessage = async e => {
									try {
										const obj = JSON.parse(e.data instanceof ArrayBuffer ? await arrayBufferToJSON(e.data) : e.data)
										if (!obj.success) {
											return;
										}
										_ws.onmessage = onMessage;
										_ws.error = noop;
										_guiBaton = LOCK.GetBaton(this);
										if (_relog) {
											_callbacks.clear();
											const countdowns = Object.assign({}, obj.countdowns, obj.location && obj.location.countdowns);
											for (let idToken in _countdownsByIdToken) {
												const missing = [];
												const arr = _countdownsByIdToken[idToken];
												if (countdowns[idToken] !== undefined) {
													for (let i = arr.length - 1; i >= 0; i--) {
														if (countdowns[idToken][arr[i].type] === undefined) {
															missing.push(arr[i]);
															arr.splice(i, 1);
														}
													}
												}
												else {
													missing.push(...arr);
													arr.length = 0;
												}
												missing.forEach(countdown => COUNTDOWN.Set(idToken, countdown.type, 0));
											}
											LOCATION.instance.AbortNextLocation();
											_guiKey = {};
											processData(obj);
										}
										else {
											Object.assign(_actions, obj.tokens);
											STATUS.player.RedrawTokens();
											_tier = obj.tier || 0;
											_email = obj.email;
											_confirmed = Boolean(obj.confirmed);
											MENU.Inventory.UpdateTier(_tier, _confirmed);
											MENU.Settings.UpdateTier(_tier);
											_character = obj.character || obj.location.character;
											if (_session.username !== _character.username && compareUsernames(_session.username, _character.username)) {
												(_remembered ? localStorage : sessionStorage).setItem("session", JSON.stringify(_session, { username: _character.username }));
											}
											processData(obj);
											MENU.Skills.Redraw();
											MENU.Myself.Redraw();
											window.onmessage = (e) => {
												const segments = e.data && e.data.split(":");
												switch (segments && segments[0]) {
													case "inspect":
														MENU.Inspect.Open(GUI.Position.Left, segments[2], segments[1]);
														break;
													case "message":
														MENU.Messages.Open(segments[1]);
														break;
													case "friend":
														GAME_MANAGER.instance.AddFriend(segments[1], false, segments[2]);
														MENU.Social.Open();
														break;
													case "ignore":
														GAME_MANAGER.instance.IgnoreUser(segments[1]);
														MENU.Social.OpenIgnored();
														break;
												}
											};
										}
										resolve();
									}
									catch (e) {
										console.error(e);
										reject(e);
									}
								}
							})]);
							if (_ws.onmessage == onMessage) {
								LOCK.Unlock(this);
								_readyResolve(true);
								return;
							}
						}
						catch (e) {
							error = e;
						}
						await waitForSeconds(1);
					} while (document.hasFocus() && timeout < Date.now());
					if (document.hasFocus()) {
						break;
					}
					waitInterval = waitInterval >= 60 ? Math.max(320, waitInterval * 3) : Math.max(60, waitInterval + 20);
					await Promise.race([waitUntil(() => document.hasFocus()), waitForSeconds(60)]);
				}
				while (true);
				if (error) {
					throw error;
				}
			}
			finally {
				LOCK.HasBaton(_loadSymbol, baton) && displaySymbol(false);
			}
		};

		async function onMessage(e) {
			await LOCK.Lock(_messageKey)
			try {
				processData(JSON.parse(e.data instanceof ArrayBuffer ? await arrayBufferToJSON(e.data) : e.data));
			}
			catch (e) {
				console.error(e);
				GUI.instance.DisplayMessage(e.message);
			}
			finally {
				LOCK.Unlock(_messageKey);
			}
		}

		function processData() {
			const [obj] = arguments;
			const id = obj.id;

			let redraw = 0;

			if (Array.isArray(obj)) {
				DEBUG_LOG_ENABLED && console.log(JSON.parse(JSON.stringify(obj)));
				switch (obj.length) {
					case 3:
						if (_owner && compareUsernames(obj[PropertyID.Username], _owner.username)) {
							LOCAL_CHAT.SetTypingIndicator(obj[PropertyID.IsTyping], GUI.Position.Left);
						}
						else if (!_scenario && LOCATION.instance.opponent && compareUsernames(obj[PropertyID.Username], LOCATION.instance.opponent.username)) {
							LOCAL_CHAT.SetTypingIndicator(obj[PropertyID.IsTyping], GUI.Position.Right);
						}
						break;
					case 2:
						const character = _character.token === obj[PropertyID.Token] ? _character : LOCATION.instance.opponent && LOCATION.instance.opponent.token === obj[PropertyID.Token] ? LOCATION.instance.opponent : _owner && _owner.token === obj[PropertyID.Token] ? _owner : null;
						if (character) {
							const firstPerson = character === _character || character === _owner;
							const data = obj[PropertyID.Character];
							if (Array.isArray(data)) {
								const [body, bodyPerSecond, maxBody, mind, mindPerSecond, maxMin, lust, lustPerSecond, minLust, actions, actionsPerSecond, maxActions, spells, spellsPerSecond, maxSpells, actionConversion, plugSize, gagSize, dildoSize] = data;
								const status = { body, bodyPerSecond, maxBody, mind, mindPerSecond, maxMin, lust, lustPerSecond, minLust };
								if (firstPerson) {
									MENU.Skills.UpdateDeltas(plugSize, gagSize, dildoSize);
									if (STATUS.player.UpdateStatus(status, character === _owner)) {
										MENU.Myself.menu && STATUS.player.Show();
									}
								} else {
									STATUS.opponent.UpdateStatus(status);
								}
								if (data.length > 9 && character === _character) {
									tokensInterval(actions, actionsPerSecond, maxActions, spells, spellsPerSecond, maxSpells, actionConversion);
								}
								break;
							}
							if (data.status !== undefined) {
								if (firstPerson) {
									if (STATUS.player.UpdateStatus(data.status, character === _owner)) {
										MENU.Myself.menu && STATUS.player.Show();
									}
									if (!_scenario && data.status.hit) {
										SCENE.instance.AnimateCharacter(LOCATION.instance.player, GUI.Animation.Hit);
										NOTIFICATION.CombatMessage();
									}
									if (character === _character) {
										_character.status = data.status;
									}
								} else {
									STATUS.opponent.UpdateStatus(data.status);
									if (!_scenario && data.status.hit) {
										SCENE.instance.AnimateCharacter(LOCATION.instance.opponent, GUI.Animation.Hit);
									}
								}
								redraw |= Redraw.DesireActions | Redraw.InanimateActions;
							}
							if (data.tokens !== undefined && character === _character) {
								updateTokens(data.tokens);
							}
							if (data.actions !== undefined) {
								LOCATION.instance.SetPublicActions(obj[PropertyID.Token], data.actions);
							}
							if (data.countdowns !== undefined) {
								updateCountdown(character.token, data.countdowns[0], data.countdowns[1]);
							}
							if (data.stats !== undefined) {
								character.stats = Object.assign(character.stats || {}, data.stats);
								redraw |= Redraw.Spells;
							}
							if (data.filter !== undefined || data.desires !== undefined || data.sexuality !== undefined || data.character !== undefined) {
								data.filter !== undefined && (character.filter = data.filter);
								data.sexuality !== undefined && (character.sexuality = data.sexuality);
								if (data.desires !== undefined) {
									updateDesires(character, data.desires);
									redraw |= Redraw.Spells;
								}
								if (data.character !== undefined) {
									Object.assign(character, data.character, { token: character.token });
									LOCATION.instance.Sync({ [firstPerson ? "character" : "opponent"]: data.character });
								}
								character === _character && MENU.Myself.Redraw();
								clearItemCache();
								STATUS.RedrawEffects();
								redraw |= Redraw.DesireActions | Redraw.InanimateActions;
							}
						}
						break;
					case 1:
						switch (obj[PropertyID.ServerCode]) {
							case ServerCode.MovingServer:
								LOCK.RemoveBaton(_readyResolve);
								_ready = createReadyPromise();
								const baton = LOCK.GetBaton(_readyResolve);
								waitForSeconds(10).then(() => LOCK.HasBaton(_readyResolve, baton) && _ws.close(ServerCode.ReconnectTimedOut));
								break;
						}
						break;
				}
				return doRedraw(redraw);
			}

			if (obj.message !== undefined) {
				console.log(obj.message);
				GUI.instance.DisplayMessage(obj.message);
			}
			else if (DEBUG_LOG_ENABLED) {
				console.log(JSON.parse(JSON.stringify(obj)));
			}

			if (obj.inventory !== undefined) {
				let itemIds;

				if (obj.inventory.baseItems !== undefined) {
					_baseItems = obj.inventory.baseItems;
				}

				if (obj.inventory.equipment !== undefined) {
					_equipment = obj.inventory.equipment;
					clearEquipmentCache();
				}

				if (obj.inventory.enchantments !== undefined) {
					_enchantments = obj.inventory.enchantments || {};
				}

				if (obj.inventory.stash !== undefined) {
					if (obj.inventory.stash === false) {
						MENU.Stash.Close();
					}
					else {
						_inventory.stash = obj.inventory.stash;
					}
					clearItemCache();
				}
				else if (_inventory.stash && itemIds) {
					for (const tab of _inventory.stash) {
						tab.positions = tab.positions.map(itemId => itemIds.includes(itemId) ? itemId : 0);
					}
					clearItemCache();
				}

				if (obj.inventory.items !== undefined) {
					_items = obj.inventory.items;
					itemIds = getItemIds();
					clearItemCache();
					clearEquipmentCache();
					redraw |= Redraw.Spells | Redraw.ActionBars;
					TUTORIAL.Redraw();
					ACTION.ClearItemActions(itemIds);
					ACTION_BAR.ValidateItem(itemIds);
				}

				if (obj.inventory.itemActions !== undefined) {
					ACTION.UpdateItemActions(obj.inventory.itemActions);
				}

				_inventory.tab = obj.inventory.tab !== undefined ? obj.inventory.tab : itemIds ? _inventory.tab.map(id => itemIds.includes(id) ? id : 0) : _inventory.tab;
				_inventory.heirlooms = obj.inventory.heirlooms !== undefined ? obj.inventory.heirlooms : itemIds ? _inventory.heirlooms.map(id => itemIds.includes(id) ? id : 0) : _inventory.heirlooms;

				if (obj.inventory.loot !== undefined) {
					_inventory.loot = obj.inventory.loot;
					if (obj.inventory.loot) {
						MENU.Inventory.Open();
						MENU.Loot.Open();
						TUTORIAL.Redraw();
					}
					else {
						MENU.Loot.Close();
					}
				}

				if (obj.inventory.crafting !== undefined) {
					_inventory.crafting = obj.inventory.crafting;
					redraw |= Redraw.Crafting;
				}
				else if (_inventory.crafting && itemIds && !itemIds.includes(_inventory.crafting)) {
					_inventory.crafting = 0;
				}

				const heldItem = obj.inventory.held && GAME_MANAGER.instance.GetItem(obj.inventory.held);
				if (heldItem) {
					_inventory.held = obj.inventory.held;
					CURSOR.instance.SetItem(heldItem);
					MENU.Myself.ClearSlotByItem(_inventory.held);
					MENU.Inventory.Open();
				}
				else {
					if (_inventory.held && itemIds && !itemIds.includes(_inventory.held)) {
						_inventory.held = 0;
					}
					if (obj.inventory.held !== undefined) {
						CURSOR.instance.updating = false;
					}
					CURSOR.instance.ValidateItem();
				}

				if (obj.inventory.tradeTabs !== undefined) {
					if (obj.inventory.tradeTabs.success !== undefined) {
						MENU.Trade.Close(obj.inventory.tradeTabs.success);
						TEXT_LOG.instance.TradeFinished(obj.inventory.tradeTabs.success);
					}
					else {
						if (!obj.inventory.tradeTabs) {
							MENU.Trade.Close(false);
							TEXT_LOG.instance.TradeFinished(false, true, obj.inventory.interrupted);
						}
						else if (obj.inventory.tradeTabs.some(tab => tab.sell || tab.salvage)) {
							MENU.Trade.Open(obj.inventory.tradeTabs);
						}
						else {
							const playerTab = obj.inventory.tradeTabs.find(tab => tab.username);
							if (playerTab) {
								if (MENU.Trade.menu && compareUsernames(MENU.Trade.username, playerTab.username)) {
									MENU.Trade.Update(playerTab);
								}
								else {
									MENU.Trade.Open(obj.inventory.tradeTabs);
								}
							}
							else {
								MENU.Vendor.Open(obj.inventory.tradeTabs);
							}
						}
					}
				}
				else {
					redraw |= Redraw.Trade;
				}

				redraw |= Redraw.ActionBars | Redraw.Spells | Redraw.Inventory | Redraw.Crafting | Redraw.Stash;
			}

			if (obj.scenario !== undefined) {
				_scenario = obj.scenario;

				if (_scenario) {
					LOCAL_CHAT.Clear();
					COUNTDOWN.Clear();
					MENU.Location.Close();
					STATUS.Hide();
					GUI.instance.CloseActionHubs();
					LOCATION.instance.AbortNextLocation();
					clearRealTimeCountdowns();
				}
				else {
					TUTORIAL.TriggerTip(TUTORIAL.Travel, TUTORIAL.YourCharacter);
					GUI.instance.HideDialog();
					GUI.instance.HideCrafting();
					SCENE.instance.UpdateLocation(LOCATION.instance);
				}

				TUTORIAL.RedrawSexualitySelection();
			}

			if (obj.social !== undefined) {
				if (obj.social.roleplayScenario !== undefined) {
					_roleplayScenario = obj.social.roleplayScenario;
					if (MENU.Social.menu && MENU.Social.menu.classList.contains("scenario_creation")) {
						MENU.Social.ShowRoleplayScenarios();
					}
				}
				obj.social.scenarios !== undefined && MENU.Social.AddRoleplayScenarios(obj.social.scenarios, obj.social.id);
				obj.social.broadcasting !== undefined && GUI.instance.SetRoleplayBroadcasting(obj.social.broadcasting);
				obj.social.pendingRevisions !== undefined && GUI.instance.SetPendingRevisions(obj.social.pendingRevisions);
				obj.social.details && MENU.Social.ShowRoleplayScenarioDetails(obj.social);
			}

			if (obj.notification !== undefined) {
				switch (NOTIFICATION.Type[obj.notification.type]) {
					case NOTIFICATION.Type.Online:
						NOTIFICATION.FriendOnline(obj.notification);
						break;
					case NOTIFICATION.Type.FriendRequest:
						NOTIFICATION.FriendRequest(obj.notification);
						break;
					case NOTIFICATION.Type.Trade:
						NOTIFICATION.Trade(obj.notification);
						TEXT_LOG.instance.Invitation(obj.notification);
						break;
					case NOTIFICATION.Type.Meetup:
					case NOTIFICATION.Type.Move:
						NOTIFICATION.Meetup(obj.notification);
						TEXT_LOG.instance.Invitation(obj.notification);
						break;
					case NOTIFICATION.Type.ItemSold:
						NOTIFICATION.ItemSold(obj.notification);
						TEXT_LOG.instance.ItemSold(obj.notification);
						break;
				}
			}

			if (obj.discovery !== undefined && !_scenario) {
				GUI.instance.Acquired(obj.discovery.label, obj.discovery.category);
			}

			if (obj.spells !== undefined) {
				if (obj.spells.triggerCooldown !== undefined) {
					obj.spells.triggerCooldown && triggerCooldown();
					delete obj.spells.triggerCooldown;
				}
				if (obj.spells.choiceActions !== undefined) {
					ACTION_BAR.SetChoiceActions(obj.spells.choiceActions.actions);
					switch (obj.spells.choiceActions.type) {
						case 4:
							TUTORIAL.TriggerTip(TUTORIAL.Commanded);
						case 3:
							TUTORIAL.TriggerTip(TUTORIAL.TakingTurns);
							break;
					}
					delete obj.spells.choiceActions;
				}
				if (hasAnyKey(obj.spells)) {
					for (let ref in obj.spells) {
						if (obj.spells[ref]) {
							_spells[ref] = obj.spells[ref];
						}
						else if (_spells[ref] !== undefined) {
							delete _spells[ref];
						}
					}
					_spellsById.clear();
					_spellVariantsById.clear();
					Object.values(_spells).forEach(spell => {
						_spellsById.set(spell.id, spell);
						if (spell.variants) {
							for (const variant of Object.values(spell.variants)) {
								_spellVariantsById.set(variant.id, variant);
								variant.prefix = spell.spell_name;
							}
						}
					});
					_spellsCache = null;
					redraw |= Redraw.ActionBars | Redraw.Macros | Redraw.Spells;
					TUTORIAL.Redraw();
				}
			}

			if (obj.skills !== undefined) {
				if (Array.isArray(obj.skills)) {
					_skills[obj.skills[0]] = obj.skills[1];
				}
				else {
					Object.keys(_skills).forEach(key => delete _skills[key]);
					for (let skill in obj.skills) {
						_skills[skill] = obj.skills[skill];
					}
				}
				MENU.Skills.Redraw();
				TUTORIAL.Redraw();
			}

			if (obj.abilities !== undefined) {
				_abilities = obj.abilities;
			}

			if (obj.menu !== undefined) {
				if (obj.menu.crafting === null) {
					MENU.Crafting.Close();
				}
				else if (obj.menu.crafting) {
					MENU.Crafting.Open(obj.menu.crafting.item !== undefined ? obj.menu.crafting : Object.assign(obj.menu.crafting, { item: _inventory.crafting || null }));
				}

				obj.menu.inspect && MENU.Inspect.Update(obj.menu.inspect);
				obj.menu.myself && MENU.Myself.Update(obj.menu.myself);

				switch (obj.menu.refresh) {
					case "yourself":
						MENU.Myself.Redraw();
						break;
					case "inspect":
						MENU.Inspect.Redraw(obj.menu.token);
						break;
				}
			}

			if (obj.locations) {
				if (obj.locations.discovered !== undefined) {
					_discoveredLocations = obj.locations.discovered;
				}
				MENU.Location.Redraw();
			}

			if (obj.owner !== undefined || obj.character && obj.character.item !== undefined) {
				obj.location = Object.assign(obj.location || {}, { character: obj.location && obj.location.character || {} });
				if (obj.character && obj.character.item !== undefined) {
					if (!obj.character.item || obj.character.item.character && obj.character.item.character.id_token === _character.token) {
						Object.assign(_character, { item: obj.character.item });
					}
					clearItemCache();
					redraw |= Redraw.InanimateActions;
				}
				if (obj.owner !== undefined) {
					if (obj.owner && obj.owner.status) {
						STATUS.player.UpdateStatus(obj.owner.status, true);
					}
					if (obj.owner && _owner) {
						if (_owner.token !== obj.owner.token) {
							obj.location.opponent = Object.assign(obj.location.opponent || {}, _owner);
						}
					}
					else {
						obj.location.opponent = obj.location.opponent || null;
					}
					_owner = obj.owner;
					STATUS.player.DisplayOwnerStatus(_owner);
					ACTION_BAR.ClearMacroCache("@owner", "@mouseover");
					redraw |= Redraw.InanimateActions;
				}
				Object.assign(obj.location.character, _owner || _character);
			}

			if (obj.location !== undefined) {
				if (obj.location.readyCheck !== undefined) {
					COUNTDOWN.readyCheck.Redraw(obj.location.readyCheck);
					delete obj.location.readyCheck;
				}
				if (obj.location.countdowns !== undefined) {
					obj.countdowns = Object.assign(obj.countdowns || {}, obj.location.countdowns);
					delete obj.location.countdowns;
				}
				if (obj.location.opponent && obj.location.opponent.status !== undefined) {
					STATUS.opponent.UpdateStatus(obj.location.opponent.status);
				}
				if (obj.location.id && _inventory.stash !== undefined) {
					getStashItemIds().forEach(itemId => removeItem(itemId));
					delete _inventory.stash;
					MENU.Stash.Close();
				}
				if (hasAnyKey(obj.location)) {
					LOCATION.instance.Sync(obj.location);
				}
			}

			if (obj.tokens != undefined) {
				updateTokens(obj.tokens);
			}

			if (obj.character !== undefined) {
				if (obj.character.status !== undefined) {
					STATUS.player.UpdateStatus(obj.character.status);
					_character.status = obj.character.status;
				}
				if (obj.character.desires !== undefined) {
					updateDesires(_character, obj.character.desires);
					redraw |= Redraw.Spells;
				}
				MENU.Myself.menu && STATUS.player.Show();
				redraw |= Redraw.DesireActions;
			}

			if (obj.friends || obj.ignored || obj.recentCharacters || obj.characterNotes) {
				if (obj.friends !== undefined) {
					_knownUsernames = null;
					for (let i = 0; i < obj.friends.length; i++) {
						if (!obj.friends[i]) {
							continue;
						}
						for (let username in obj.friends[i]) {
							const friendInfo = obj.friends[i][username];
							let friend = removeFriend(username);
							if (friendInfo) {
								_friends[i][username] = Object.assign(friend || (friend = {}), friendInfo);
								if (friendInfo.first_name && !friendInfo.last_name && friend.last_name !== undefined) {
									delete friend.last_name;
								}
								if (friend.username_color === undefined) {
									friend.username_color = _colorsByUsername[username];
								}
								else if (friend.username_color !== undefined) {
									_colorsByUsername[username] = friend.username_color;
									for (const recentCharacter of _recentCharacters.filter(c => compareUsernames(c.username, username))) {
										recentCharacter.username_color = friend.username_color;
									}
									for (let prop in _ignoredUsers) {
										if (compareUsernames(prop, username)) {
											_ignoredUsers[prop].username_color = friend.username_color;
											break;
										}
									}
								}
								i === 2 && (friend.last_online = Math.floor(friend.last_online || Date.now() / 1000));
							}
						}
					}
				}

				if (obj.ignored !== undefined) {
					for (let prop in obj.ignored) {
						if (obj.ignored[prop]) {
							_ignoredUsers[prop] = Object.assign(_ignoredUsers[prop] || {}, obj.ignored[prop]);
						}
						else if (_ignoredUsers[prop] !== undefined) {
							delete _ignoredUsers[prop];
						}
					}
				}

				if (obj.recentCharacters !== undefined) {
					_recentCharacters = Object.freeze(obj.recentCharacters.slice());
				}

				if (obj.characterNotes !== undefined) {
					_characterNotes = obj.characterNotes.slice();
				}

				GUI.instance.SetFriendRequests(Object.keys(_friends[1]).length);
				GUI.instance.SetOnlineFriends(Object.keys(_friends[3]).length);
				MENU.Social.Redraw();
			}

			if (obj.countdowns !== undefined) {
				for (let idToken in obj.countdowns) {
					for (let type in obj.countdowns[idToken]) {
						const countdown = obj.countdowns[idToken][type];
						updateCountdown(idToken, type, countdown && typeof countdown === "object" ? countdown.remainingTime : countdown);
					}
				}
			}

			if (obj.settings !== undefined) {
				if (obj.settings.character !== undefined) {
					Object.assign(_settings.character, obj.settings.character);
					MENU.Settings.UpdateRoleplaying(null, _settings.character.roleplayingEnabled);
					MENU.Settings.UpdateFilter(null, _settings.character.filterEnabled);
					MENU.Settings.UpdateSoloMode(null, _settings.character.soloEnabled);
					MENU.Settings.UpdateSexuality(null, _settings.character.sexualityEnabled);
				}
				if (obj.settings.roleplaying !== undefined) {
					MENU.Settings.UpdateRoleplaying(_settings.roleplaying = obj.settings.roleplaying);
					_character.status = Object.assign(_character.status || {}, { roleplaying: obj.settings.roleplaying });
					STATUS.player.RedrawEffects();
				}
				if (obj.settings.usernameColor !== undefined) {
					_character.username_color = _settings.usernameColor = obj.settings.usernameColor;
					MENU.Settings.UpdateUsernameColor(_settings.usernameColor);
					STATUS.player.RedrawEffects();
				}
				obj.settings.solo !== undefined && MENU.Settings.UpdateSoloMode(_settings.solo = obj.settings.solo);
				obj.settings.autoWear !== undefined && MENU.Settings.UpdateAutoWear(_settings.autoWear = obj.settings.autoWear);
				obj.settings.showTips !== undefined && MENU.Settings.UpdateShowTips(_settings.showTips = obj.settings.showTips);
				obj.settings.allowedMessages !== undefined && MENU.Settings.UpdateAllowedMessages(_settings.allowedMessages = obj.settings.allowedMessages);
				obj.settings.tips !== undefined && TUTORIAL.SetUserData(obj.settings.tips, _settings.showTips);
				obj.settings.actionBars !== undefined && ACTION_BAR.SetSpells(obj.settings.actionBars, obj.settings.macros);
				if (obj.settings.sexuality !== undefined || obj.settings.filter !== undefined) {
					obj.settings.filter !== undefined && MENU.Settings.UpdateFilter(_character.filter = Object.assign(_filter, obj.settings.filter));
					if (obj.settings.sexuality !== undefined) {
						MENU.Settings.UpdateSexuality(_character.sexuality = (_settings.sexuality = obj.settings.sexuality) || 0);
						INPUT.instance.UpdateSexuality(_settings.sexuality);
						TUTORIAL.RedrawSexualitySelection();
					}
					redraw |= Redraw.DesireActions;
				}
			}

			if (obj.chat !== undefined) {
				if (obj.chat.unreadMessages !== undefined) {
					GUI.instance.SetUnreadMessages(obj.chat.unreadMessages);
				}
				if (obj.chat.message !== undefined) {
					const message = obj.chat.message;
					const menu = MENU.Messages.menu;
					if (!compareUsernames(message.sender.username, GAME_MANAGER.instance.username)) {
						if (!document.hasFocus() || !menu || !menu.parentNode || !menu.classList.contains("new") || !compareUsernames(message.sender.username, MENU.Messages.receiver)) {
							NOTIFICATION.PrivateMessage(message);
						}
						TUTORIAL.TriggerTip(TUTORIAL.Messages);
					}
					menu && menu.parentNode && MENU.Messages.AppendMessage(message);
				}
				else if (Array.isArray(obj.chat.history)) {
					obj.chat.history.forEach(arr => appendChatMessage(arr[1], arr[0]));
					waitForFrame().then(preparePendingItemLinks);
				}
				else {
					appendChatMessage(obj.chat, obj.chat.message_id);
				}
				function appendChatMessage(chat, messageId) {
					if (messageId) {
						if (_messageIds.includes(messageId)) {
							return;
						}
						_messageIds.unshift(messageId);
						if (_messageIds.length > 200) {
							_messageIds.length = 100;
						}
					}
					if (chat.local && chat.local.message !== undefined) {
						TEXT_LOG.instance.LocalChatMessage(chat.local, getSession().username, _owner);
					}
					else if (chat.combat !== undefined) {
						TEXT_LOG.instance.CombatMessage(chat.combat);
					}
					else if (chat.emote !== undefined) {
						TEXT_LOG.instance.EmoteMessage(chat.emote);
					}
					else if (chat.voice !== undefined) {
						TEXT_LOG.instance.VoiceChatMessage(chat.voice);
					}
					else if (chat.desire !== undefined) {
						TEXT_LOG.instance.DesireIncreased(chat.desire);
					}
				}
			}

			if (obj.gui !== undefined) {
				onGUI(obj.gui, obj.callbackId);
			}

			if (id) {
				const callback = _callbacks.get(id);
				callback && callback(Object.assign(obj));
			}

			doRedraw(redraw);
		};

		function doRedraw(redraw) {
			if ((redraw & Redraw.DesireActions) !== 0) {
				ACTION_BAR.RedrawDesireActions();
			}
			if ((redraw & Redraw.InanimateActions) !== 0) {
				ACTION_BAR.RedrawInanimateActions();
			}
			if ((redraw & Redraw.ActionBars) !== 0) {
				ACTION_BAR.Redraw(redraw & Redraw.Macros !== 0);
			}
			if ((redraw & Redraw.Spells) !== 0) {
				MENU.Spells.Redraw();
			}
			if ((redraw & Redraw.Inventory) !== 0) {
				MENU.Inventory.Redraw();
			}
			if ((redraw & Redraw.Crafting) !== 0) {
				MENU.Crafting.Redraw();
			}
			if ((redraw & Redraw.Stash) !== 0) {
				MENU.Stash.Redraw();
			}
			if ((redraw & Redraw.Trade) !== 0) {
				MENU.Trade.Redraw();
			}
		}

		function updateDesires(character, desires) {
			if (character === _character && Object.keys(desires).some(k => character.desires[k] !== undefined && desires[k].value > character.desires[k].value)) {
				TUTORIAL.TriggerTip(TUTORIAL.Desires);
			}
			character.desires = desires;
			ACTION_BAR.ClearMacroCache("mouth", "cock", "pussy", "butt", "cum", "breasts", "bondage", "pet");
		}

		const onGUI = async (gui, callbackId) => {
			const baton = _guiBaton;
			await LOCK.Lock(_guiKey);
			let response;
			try {
				if (!LOCK.HasBaton(this, baton)) {
					return;
				}
				response = await GUI.instance[gui.action].apply(null, gui.params);
			}
			catch (e) {
				console.log(gui);
				console.error(e);
			}
			finally {
				LOCK.Unlock(_guiKey);
			}
			LOCK.HasBaton(this, baton) && next(response, callbackId);
		};

		const updateTokens = (tokens) => {
			const changed = Object.keys(tokens).some(key => Math.floor(_actions[key]) !== Math.floor(tokens[key])) ? 2 : Object.keys(tokens).some(key => _actions[key] !== tokens[key]) ? 1 : 0;
			if (changed >= 1) {
				Object.assign(_actions, tokens);
				STATUS.player.RedrawTokens();
				STATUS.player.Show();
				changed >= 2 && MENU.Spells.Redraw();
			}
		};

		const next = async (response, callbackId) => await _ready && _ws.send(JSON.stringify({ action: "Scenario", response, callbackId }));

		this.IsIgnored = username => _ignoredUsers[username.toLowerCase()] !== undefined;

		this.OpponentIgnored = () => LOCATION.instance.opponent && LOCATION.instance.opponent.username.toLowerCase() in _ignoredUsers;

		this.IgnoreOpponent = async ignored => LOCATION.instance.opponent ? this.IgnoreUser(LOCATION.instance.opponent.username, ignored) : null;

		this.OwnerIgnored = () => _owner && _owner.username.toLowerCase() in _ignoredUsers;

		this.IgnoreOwner = async ignored => _owner ? this.IgnoreUser(_owner.username, ignored) : null;

		this.UnignoreUser = async username => this.IgnoreUser(username, false);

		this.IgnoreUser = async (username, ignored = true) => this.WaitFor("Ignore", { user: username, ignored });

		this.AvoidUser = async username => this.WaitFor("Ignore", { user: username, avoid: true });

		this.RemoveFriend = async username => this.AddFriend(username, true);

		this.AddFriend = async (username, removed = false, friendToken = null) => this.WaitFor("Friend", { user: username, removed, token: friendToken });

		this.AcceptFriend = async username => this.WaitFor("Friend", { user: username, accepted: true });

		this.AddCharacterNote = async (character, note) => {
			const { id_token } = character;
			const result = await GAME_MANAGER.instance.WaitFor("Friend", { token: id_token, note });
			if (result.success) {
				const current = _characterNotes.find(c => c.id_token === id_token);
				if (current) {
					current.note = note;
				}
				else {
					const { first_name, last_name, username, username_color } = character;
					_characterNotes.push({ id_token, first_name, last_name, username, username_color, note });
				}
				MENU.Social.Redraw();
				return true;
			}
			return false;
		}

		this.RemoveCharacterNote = async token => {
			const result = await this.WaitFor("Friend", { token, note: false });
			if (result.success) {
				for (let i = 0; i < _characterNotes.length; i++) {
					if (_characterNotes[i].id_token === token) {
						_characterNotes.splice(i, 1);
						MENU.Social.Redraw();
						break;
					}
				}
			}
		}

		this.Invite = (username, request = false) => this.Send("Invite", { user: username, request });

		this.InvitationResponse = (username, request, accepted) => this.Send("Invite", { user: username, request, accepted, response: true });

		this.GetKnownUsernames = () => _knownUsernames || (_knownUsernames = unique(_friends.map(friend => Object.getOwnPropertyNames(friend)).concat(_recentCharacters.concat(_characterNotes).map(c => c.username)).reduce((arr, value) => arr.concat(value), [])));

		this.DiscardItem = async (itemId, message, acceptLabel, cancelLabel) => {
			if (await GUI.instance.Alert(message || "Are you sure you want to throw away this item?", acceptLabel || "Throw Away", cancelLabel)) {
				const closeLoot = _inventory.loot === itemId;
				this.Send("Item", { discard: true, itemId });
				replaceItemIdInInventory(itemId);
				removeItem(itemId);
				clearItemCache();
				closeLoot && MENU.Loot.Close(false);
				refreshInventory();
				ACTION_BAR.ValidateItem(getItemIds());
				return true;
			}
			return false;
		};

		const getItemsInInventory = () => {
			const stashItemIds = getStashItemIds();
			return Object.values(_items).filter(item => item && !stashItemIds.includes(item.id));
		};

		this.CountItems = (baseId, variantColor) => {
			const key = variantColor ? `${baseId}_${variantColor}` : baseId;
			let count = _itemCount.get(key);
			if (count === undefined) {
				if (variantColor) {
					const isDefaultColor = (_baseItems[baseId] || empty).default_color === variantColor;
					count = getItemsInInventory().reduce((acc, item) => acc + (item.base === baseId && (item.variant_color === variantColor || !item.variant_color && isDefaultColor) ? item.stack || 1 : 0), 0)
				}
				else {
					count = getItemsInInventory().reduce((acc, item) => acc + (item.base === baseId ? item.stack || 1 : 0), 0)
				}
				_itemCount.set(key, count);
			}
			return count;
		};

		this.FindItemStack = (baseId, variantColor) => {
			let filteredItems = getItemsInInventory().filter(item => item.base === baseId);
			variantColor && (filteredItems = filteredItems.filter(item => item.variant_color === variantColor || !item.variant_color && (_baseItems[item.base] || empty).default_color === variantColor));
			return filteredItems.length > 0 ? this.GetItem(filteredItems.sort((a, b) => a.stack - b.stack)[0].id) : null;
		};

		this.HasMaterial = (material, quantity = 1) => this.HasMaterials({ [material]: quantity });

		this.HasMaterials = materials => {
			if (materials) {
				const items = getItemsInInventory();
				for (let prop in materials) {
					const materialBase = _baseItems[prop] || Object.values(_baseItems).find(baseItem => baseItem.item_name === prop);
					if (!materialBase) {
						return false;
					}
					let count = _materialCache.get(prop);
					count === undefined && _materialCache.set(prop, count = items.reduce((acc, item) => acc + (item.base === materialBase.id ? item.stack || 1 : 0), 0));
					if (Math.max(1, materials[prop] || 0) > count) {
						return false;
					}
				}
			}
			return true;
		};

		this.SetSexualityFlag = (flag, enabled) => {
			const obj = { sexuality: enabled ? flag : -flag };
			this.Send("Settings", _settings.character.sexualityEnabled ? { character: obj } : obj);
		};

		this.GetItemIdBySlot = slot => _equipment.items[typeof slot === "number" ? slot : MENU.Inventory.equipmentSlots.indexOf(slot)] || null;

		this.IsWorn = itemId => itemId && _equipment.worn[_equipment.items.indexOf(itemId)] == true;

		this.IsEquipped = itemId => itemId && (_equipment.items.includes(itemId) || _character.item && _character.item.id === itemId && GAME_MANAGER.instance.IsEquippedInanimate());

		this.GetEquippedSlot = itemId => itemId ? _equipment.items.indexOf(itemId) : -1;

		this.WearingStrapOn = () => getWornBaseItems().some(baseItem => baseItem.group === Group.StrapOn);

		this.WearingPlug = () => getWornBaseItems().some(baseItem => baseItem.group === Group.Plugs);

		this.WearingGag = () => getWornBaseItems().some(baseItem => baseItem.group === Group.Gags);

		this.Restrained = () => {
			if (hasFlag(_character.body_flags, CHARACTER.Body.Quadruped) || _character.body && _character.body[0] === CHARACTER.Arms.Armless || isBlowUpDoll()) {
				return true;
			}
			if (_retrained === undefined) {
				for (let i = 4; i < 8; i++) {
					if (groupEquippedInSlot(i, Group.Cuffs)) {
						return _retrained = true;
					}
				}
				_retrained = false;
			}
			return _retrained;
		}

		this.Hindered = () => {
			if (isBlowUpDoll()) {
				return true;
			}
			if (_hindered === undefined) {
				for (let i = 0; i < 4; i++) {
					if (groupEquippedInSlot(i, Group.Cuffs)) {
						return _hindered = true;
					}
				}
				_hindered = false;
			}
			return _hindered;
		}

		const isBlowUpDoll = () => _character.skin && _character.skin[CHARACTER.Skin.Latex] >= CHARACTER.Skin.LatexDoll && hasFlag(_character.body_flags, CHARACTER.Body.BlowUpDoll);

		const getWornItems = () => _wornItemsCache || (_wornItemsCache = _equipment.items.filter((itemId, i) => itemId && _equipment.worn[i]).map(itemId => _items[itemId]));

		const getWornBaseItems = () => _wornBaseItemsCache || (_wornBaseItemsCache = getWornItems().map(item => this.GetBaseItem(item.base)));

		const clearEquipmentCache = () => _wornBaseItemsCache = _wornItemsCache = _chastity = _hindered = _retrained = undefined;

		this.HasSpell = (spellId, variant) => {
			if (variant) {
				const spell = _spellsById.get(spellId);
				return spell && spell.variants && (spell.variants[variant] !== undefined || Object.values(spell.variants).some(variant => variant.id === variant));
			}
			return _spellsById.has(spellId);
		}

		this.GetSpellByName = (fullyQualifiedName) => {
			if (!_spellsCache) {
				_spellsCache = {};
				for (const spell of _spellsById.values()) {
					_spellsCache[getSpellFullyQualifiedName(spell)] = spell;
				}
				for (const spell of _spellVariantsById.values()) {
					_spellsCache[getSpellFullyQualifiedName(spell)] = spell;
				}
			}
			return _spellsCache[fullyQualifiedName] || ACTION.GetActionByName(fullyQualifiedName) || null;
		}

		this.GetSpell = (spellId, variant) => {
			const spell = _spellsById.get(spellId);
			if (variant) {
				return spell && spell.variants && (spell.variants[variant] || Object.values(spell.variants).find(variant => variant.id === variant)) || null;
			}
			return spell || null;
		}

		this.HasSpellVariant = variantId => _spellVariantsById.get(variantId);

		this.GetSpellVariant = variantId => _spellVariantsById.get(variantId);

		this.EquipItem = async (itemId, slot, reverseWear) => {
			const item = this.GetItem(itemId);
			if (item && item.base.type === "equipment") {
				CURSOR.instance.updating = true;
				{
					await this.WaitFor("Item", { equip: true, itemId, slot, reverseWear });
				}
				CURSOR.instance.updating = false;
			}
		}

		this.UnequipItem = async (itemId, moveToInventory) => {
			CURSOR.instance.updating = true;
			{
				await this.WaitFor("Item", { equip: false, itemId, moveToInventory });
			}
			CURSOR.instance.updating = false;
		}

		const getItem = itemId => typeof itemId === "string" ? _tempItems[itemId] : _items[itemId] || (_character && _character.item && _character.item.id === itemId ? _character.item : null);

		this.GetItem = itemId => {
			let output = _publicItemCache.get(itemId);
			if (output) {
				return output;
			}
			try {
				const item = getItem(itemId);
				const base = item && this.GetBaseItem(item);
				return output = base ? Object.assign({}, item, { base, stack: Math.max(1, item.stack || 0) }) : null;
			}
			finally {
				_publicItemCache.set(itemId, output);
				LOCK.GetFirstBaton(_publicItemCache) && waitForFrame().then(() => _publicItemCache.clear()).finally(() => LOCK.RemoveBaton(_publicItemCache));
			}
		};

		const hasItem = this.HasItem = (itemId, includeStash = true) => Boolean(getItem(itemId) && (includeStash || !getStashItemIds().includes(itemId)));

		const getItemIds = this.GetItemIds = () => unique(Object.values(_items).map(item => item && item.id));

		this.SynchronizeInventoryImage = (inventoryImage) => {
			const itemIds = getItemIds();
			let foundItemIds = [];
			for (let prop in inventoryImage) {
				if (Array.isArray(inventoryImage[prop])) {
					if (prop === "stash") {
						const missingIds = [];
						inventoryImage.stash.forEach(tab => tab && missingIds.push(...unique(tab.positions).filter(itemId => !this.HasItem(itemId))));
						for (const itemId of missingIds) {
							inventoryImage.stash.forEach(tab => tab && replaceItemId(tab.positions, itemId));
						}
						inventoryImage.stash.forEach(tab => tab && foundItemIds.push(...tab.positions));
					}
					else {
						const missingIds = unique(inventoryImage[prop]).filter(itemId => !this.HasItem(itemId));
						for (const itemId of missingIds) {
							replaceItemId(inventoryImage[prop], itemId);
						}
						foundItemIds.push(...inventoryImage[prop]);
					}
				}
				else if (inventoryImage[prop]) {
					foundItemIds.push(inventoryImage[prop]);
					if (!hasItem(inventoryImage[prop])) {
						inventoryImage[prop] = null;
					}
				}
			}
			foundItemIds = unique(foundItemIds);
			const items = itemIds.filter(itemId => !foundItemIds.includes(itemId) && !this.IsEquipped(itemId)).map(itemId => this.GetItem(itemId)).filter(item => item);
			if (items.length > 0) {
				items.sort((a, b) => b.base.width * b.base.height - a.base.width * a.base.height);
				const containers = MENU.Inventory.GetContainerInfo(inventoryImage);
				const success = items.every(item => {
					for (const container of containers) {
						const position = MENU.Inventory.FindValidPosition(item, container.positions, container.width, container.height);
						if (burnPosition(item, container.positions, position, container.width, container.height)) {
							return true;
						}
					}
					return false;
				});
				if (!success) {
					window.location.reload(true);
					return false;
				}
			}
			return true;
		}

		this.GetBaseItem = item => {
			if (item && typeof item === "object") {
				const baseItem = _baseItems[item.base];
				if (baseItem && baseItem.variants) {
					const nature = item.character && item.character.nature;
					if (baseItem.stack_sizes || item.flags || nature) {
						const enabledVariants = Object.keys(baseItem.flags).filter(flag => hasFlag(item.flags, baseItem.flags[flag])).map(flag => flag.toLowerCase());
						if (nature) {
							enabledVariants.unshift(nature.toLowerCase());
						}
						if (baseItem.stack_sizes) {
							for (let variant in baseItem.stack_sizes) {
								if (item.stack >= baseItem.stack_sizes[variant]) {
									enabledVariants.push(variant.toLowerCase());
								}
							}
						}
						if (enabledVariants.length > 0) {
							const obj = Object.assign({}, baseItem, { variants: undefined });
							for (let variant in baseItem.variants) {
								if (enabledVariants.includes(variant)) {
									Object.assign(obj, baseItem.variants[variant]);
								}
							}
							return obj;
						}
					}
				}
				return baseItem || null;
			}
			return _baseItems[item] || (_baseItemCache || (_baseItemCache = Object.values(_baseItems).reduce((obj, baseItem) => { obj[baseItem.item_name] = baseItem; return obj }, {})))[item];
		}

		this.IsEquippedInanimate = () => _character && _character.item && _owner && Array.isArray(_owner.equipment) && _owner.equipment.some(item => item && item.character && item.character.id_token === _character.token);

		this.IsUntradeable = (baseId, attributes) => (this.GetBaseItem(baseId) || empty).untradeable === true || Attribute.IsUntradeable(attributes);

		this.IsTradeLimited = (baseId, attributes) => {
			const baseItem = this.GetBaseItem(baseId);
			baseItem && (baseItem.tradeLimited || baseItem.untradeable) || Attribute.IsTradeLimited(attributes);
		}

		this.UnstackItem = async (itemId, stack) => {
			const stackItem = getItem(itemId);
			if (stackItem) {
				createTemporaryItem(Object.assign({}, stackItem, { id: undefined, stack }), { itemId, stack }, "held");
				stackItem.stack -= stack;
				refreshInventory();
			}
		}

		this.BuyItem = (tabId, item, container, position = -1, stack = 1, stackId = 0) => {
			const price = item && item.price;
			if (!price || Object.keys(price).length == 0) {
				return false;
			}
			const currency = {};
			const stackByItemId = {};
			const stashItemIds = getStashItemIds();
			const items = Object.values(_items).filter(item => !stashItemIds.includes(item.id) && _baseItems[item.base]);
			for (let prop in price) {
				let count = Math.max(1, price[prop] || 0) * stack;
				const countByItemId = {};
				for (const item of items.filter(item => _baseItems[item.base].item_name == prop)) {
					countByItemId[item.id] = Math.max(1, item.stack);
				}
				while (count > 0 && Object.keys(countByItemId).length > 0) {
					const minStack = Math.min(...Object.values(countByItemId));
					for (let itemId in countByItemId) {
						const stack = countByItemId[itemId];
						if (stack > minStack) {
							continue;
						}
						const take = Math.min(stack, count);
						currency[itemId] = take;
						stackByItemId[itemId] = stack - take;
						count -= take;
						if (count == 0) {
							break;
						}
						delete countByItemId[itemId];
					}
				}
				if (count > 0) {
					GUI.instance.DisplayMessage("Unable to buy item");
					return false;
				}
			}
			for (let itemId in stackByItemId) {
				if (stackByItemId[itemId] === 0) {
					replaceItemIdInInventory(_inventory, itemId);
					removeItem(itemId);
				}
				else {
					_items[itemId].stack = stackByItemId[itemId];
				}
			}
			const obj = { tabId, itemId: item.id, stack, stackId, currency };
			if (stackId) {
				const stackItem = getItem(stackId);
				if (!stackItem) {
					return false;
				}
				stackItem.stack += stack || 1;
				MENU.Inventory.Open();
				Promise.race([this.WaitFor("Item", obj), waitForSeconds(20)]).then(result => {
					if (!result || !result.success) {
						_ws.close(ServerCode.TemporaryItemTimeout, `Failed to fulfill item promise${!result ? " within 20 seconds" : ''}.`);
					}
				});
			}
			else {
				item = Object.assign({}, item, { base: item.base.id, id: undefined, stack: stack || 1 });
				delete item.price;
				createTemporaryItem(item, obj, container, position).then(() => TUTORIAL.Redraw());
				MENU.Inventory.Open();
			}
			return true;
		}

		this.AcceptVendorOffer = (itemIds, salvage) => {
			let obj, success = true;
			const unsellableItemIds = [];
			const containers = MENU.Inventory.GetContainerInfo();
			const offers = MENU.Trade.CalculateOffer(itemIds, unsellableItemIds);
			itemIds.forEach(itemId => replaceItemIdInInventory(_inventory, itemId));
			for (let i = 0; i < unsellableItemIds.length && success; i++) {
				const item = this.GetItem(unsellableItemIds[i]);
				success = containers.some(container => {
					if (burnPosition(item, container.positions, MENU.Inventory.FindValidPosition(item, container.positions, container.width, container.height), container.width, container.height)) {
						return true;
					}
					return false;
				});
			}
			if (success && offers.length > 0) {
				const stacks = [];
				itemIds = itemIds.filter(itemId => !unsellableItemIds.includes(itemId));
				itemIds.forEach(itemId => removeItem(itemId));
				for (const offer of offers.slice().reverse()) {
					if (Math.max(offer.base.stack || 0, 1) > 1) {
						for (const container of containers) {
							const itemIds = unique(container.positions);
							if (itemIds.length > 0) {
								let i = 100;
								do {
									const stackId = itemIds.find(itemId => {
										const stackItem = this.GetItem(itemId);
										return stackItem && itemsAreSimilar(stackItem, offer) && (getItem(itemId) || empty).stack < offer.base.stack;
									});
									const stackItem = stackId && getItem(stackId);
									if (!stackItem) {
										break;
									}
									const stack = stackItem.stack + offer.stack;
									stackItem.stack = Math.min(offer.base.stack, stack);
									offer.stack = Math.max(0, stack - stackItem.stack);
									stacks.push(stackItem);
									if (i-- === 0) {
										break;
									}
								} while (offer.stack > 0);
							}
							if (offer.stack <= 0) {
								offers.splice(offers.indexOf(offer), 1);
								break;
							}
						}
					}
				}
				obj = { itemIds, stacks: stacks.length > 0 ? unique(stacks).map(stack => [stack.id, stack.stack]) : undefined, offers: [] };
				for (const item of offers) {
					const id = String.fromCharCode(_nextTempId++ % 256);
					item.id = id;
					success = containers.some(container => burnPosition(item, container.positions, MENU.Inventory.FindValidPosition(item, container.positions, container.width, container.height), container.width, container.height));
					if (!success) {
						break;
					}
					_tempItems[id] = Object.assign(item, { base: item.base.id });
					obj.offers.push([id, item.base, item.stack]);
				}
			}
			if (success) {
				MENU.Inventory.Open();
				if (obj) {
					Promise.race([
						this.WaitFor("Item", Object.assign(obj, { inventory: { tab: _inventory.tab, heirlooms: _inventory.heirlooms }, salvage: salvage == true })),
						waitForSeconds(20),
					]).then(result => {
						if (!result || !result.success) {
							return _ws.close(ServerCode.TemporaryItemTimeout, `Failed to fulfill item promise${!result ? " within 20 seconds" : ''}.`);
						}
						for (let tempId in result.itemIds) {
							const itemId = result.itemIds[tempId];
							const item = offers.find(item => item.id == tempId);
							item.id = itemId;
							if (_items[item.id] === undefined) {
								_items[item.id] = item;
							}
							replaceItemIdInInventory(_inventory, tempId, itemId);
						}
						CURSOR.instance.ValidateItem();
						MENU.Inventory.Redraw();
						MENU.Stash.Redraw();
					});
				}
				else {
					this.UpdateInventory(this.GetInventoryImage(), true, true);
				}
			}
			else {
				window.location.reload(true);
			}
		}

		const createTemporaryItem = async (item, obj, container, position) => {
			const id = String.fromCharCode(_nextTempId++ % 256);
			_tempItems[id] = Object.assign(item, { id });
			switch (container) {
				case "held":
					_inventory.held = id;
					CURSOR.instance.SetItem(this.GetItem(item.id));
					break;
				case "tab":
				case "heirlooms":
					_inventory[container][position] = id;
					break;
				default:
					console.error("Invalid container", container);
					return;
			}
			const result = await Promise.race([
				this.WaitFor("Item", Object.assign(obj, { position: { container, position }, byte: id })),
				waitForSeconds(20),
			]);
			if (!result || !result.success) {
				return _ws.close(1000, `Failed to fulfill item promise${!result ? " within 20 seconds" : ''}.`);
			}
			if (result.itemId) {
				item.id = result.itemId;
				if (_items[item.id] === undefined) {
					_items[item.id] = item;
				}
				if (result.character !== undefined) {
					item.character = result.character;
					_items[item.id].character = result.character;
				}
				if (item.enchantments !== undefined) {
					if (_enchantments[item.id] === undefined) {
						_enchantments[item.id] = item.enchantments;
					}
					delete item.enchantments;
				}
			}
			clearItemCache();
			replaceItemIdInInventory(_inventory, id, item.id);
			CURSOR.instance.ValidateItem();
			refreshInventory();
			ACTION_BAR.ReplaceItemId(id, item.id);
		};

		this.StackItems = (from, to, remainder) => {
			const fromItem = getItem(from);
			const toItem = getItem(to);
			toItem.stack = Math.max(1, toItem.stack) + Math.max(1, fromItem && fromItem.stack || 0) - remainder;
			if (fromItem) {
				fromItem.stack = remainder;
			}
			if (!fromItem || fromItem.stack <= 0) {
				replaceItemIdInInventory(_inventory, from);
				removeItem(from);
			}
			this.Send("Inventory", { stacks: [[from, to]] });
			_publicItemCache.delete(from);
			_publicItemCache.delete(to);
			refreshInventory();
		};

		this.UpdateInventory = (inventoryImage, flushAll = false, forceSend = false) => {
			const obj = {};

			const stacks = inventoryImage.stacks && inventoryImage.stacks.length > 0 ? inventoryImage.stacks : null;;

			if (inventoryImage.stacks !== undefined) {
				delete inventoryImage.stacks;
			}

			for (let prop in inventoryImage) {
				if (Array.isArray(_inventory[prop])) {
					let tab;

					if (prop === "stash") {
						const tabIndex = SETTINGS.Get("stash_tab_index", 0);
						tab = _inventory.stash && (_inventory.stash.find(tab => tab.index == tabIndex) || _inventory.stash[0]);
						if (!tab) {
							continue;
						}
					}

					let positions = tab ? tab.positions : _inventory[prop];
					let changed = flushAll;

					if (!changed) {
						const maxSize = Math.max(positions.length, inventoryImage[prop].length);
						for (let i = 0; i < maxSize && !changed; i++) {
							changed = positions.length < i && inventoryImage[prop][i] || positions[i] != inventoryImage[prop][i];
						}
					}

					if (changed) {
						positions = inventoryImage[prop].slice();
						while (positions.length > 0 && !positions[positions.length - 1]) {
							positions.pop();
						}
						if (tab) {
							tab.positions = positions;
							obj.stash = [{ positions, index: tab.index }];
						}
						else {
							_inventory[prop] = positions.map(position => position || 0);
							obj[prop] = positions;
						}
					}
				}
				else if (flushAll || _inventory[prop] != inventoryImage[prop]) {
					_inventory[prop] = inventoryImage[prop] || 0;
					obj[prop] = _inventory[prop];
				}
			}

			const changed = Object.keys(obj).length > 0;

			if (stacks) {
				for (const arr of stacks) {
					const from = arr[0];
					const fromItem = getItem(from);
					const baseItem = fromItem && this.GetBaseItem(fromItem.base);
					if (baseItem) {
						let remainder = fromItem.stack;
						for (let i = 1; i < arr.length; i++) {
							const toItem = getItem(arr[i]);
							const combined = toItem.stack + remainder;
							toItem.stack = Math.min(baseItem.stack, combined);
							remainder = Math.max(0, combined - toItem.stack);
						}
						fromItem.stack = remainder;
					}
					if (!fromItem || fromItem.stack <= 0) {
						replaceItemIdInInventory(_inventory, from);
						removeItem(from);
					}
				}
				MENU.Inventory.Redraw();
				MENU.Stash.Redraw();
			}
			else if (changed) {
				MENU.Inventory.Redraw();
				if (obj.stash !== undefined) {
					MENU.Stash.Redraw();
				}
				if (obj.loot !== undefined) {
					MENU.Loot.Redraw();
				}
				clearItemCache();
			}

			if (obj.crafting !== undefined) {
				const item = obj.crafting ? this.GetItem(obj.crafting) : null;
				MENU.Crafting.SetItem(item);
			}
			else if (stacks) {
				MENU.Crafting.Redraw();
			}

			if (obj.trade !== undefined) {
				MENU.Trade.Redraw();
				delete obj.trade;
			}

			if (changed && (!GUI.instance.tradeTab || forceSend)) {
				this.Send("Inventory", Object.assign({ inventory: obj }, stacks && { stacks }));
			}
			else if (stacks) {
				this.Send("Inventory", { stacks });
			}
		}

		this.HoldItem = (itemId) => {
			const image = this.ClearInventoryImage(this.GetInventoryImage(), itemId);
			image.held = itemId;
			this.UpdateInventory(image);
		};

		this.GetInventoryImage = () => {
			const image = Object.assign({}, _inventory);
			for (let prop in image) {
				if (Array.isArray(image[prop])) {
					if (prop == "stash") {
						const tabIndex = SETTINGS.Get("stash_tab_index", 0);
						const tab = image.stash && (image.stash.find(tab => tab.index == tabIndex) || image.stash[0]);
						if (tab && tab.positions) {
							image.stash = tab.positions.slice();
							if (tab.removeOnly) {
								image.stash.removeOnly = true;
							}
						}
					}
					else {
						image[prop] = image[prop].slice();
					}
				}
			}
			return image;
		};

		this.ClearInventoryImage = (image, itemId) => {
			for (let prop in image) {
				if (Array.isArray(image[prop])) {
					replaceItemId(image[prop], itemId, 0);
				}
				else if (image[prop] == itemId) {
					image[prop] = 0;
				}
			}
			return image;
		};

		this.GetLoot = () => _inventory.loot && this.GetItem(_inventory.loot);

		this.GetCraftingBench = () => _inventory.crafting && this.GetItem(_inventory.crafting);

		this.WearItem = (itemId, wear = true) => this.IsWorn(itemId) != wear && this.Send("Item", { wear, itemId });

		this.GetEnchantments = itemId => _enchantments[itemId] || [];

		this.ListedItem = itemId => _inventory.stash && _inventory.stash.some(tab => Object.keys(tab.prices).map(itemId => parseInt(itemId)).includes(itemId));

		this.CastSpell = async (spellId, selfcast, value, option, materialsRequired, variant = null) => {
			const spell = !this.IsDazed() && _spellsById.get(spellId);
			if (spell) {
				if (!spell.tags.includes("Crafting") && !triggerGlobalCooldown()) {
					return;
				}
				const result = await this.WaitFor("Spell", { spellId, selfcast: Boolean(selfcast), value, option, variant, materialsRequired });
				result.resetCooldown && resetCooldown();
				return !result.resetCooldown;
			}
			return false;
		}

		this.PerformDesireAction = async desireActionId => performSpellAction({ desireActionId });

		this.PerformItemAction = async (itemActionId, itemId, selfcast, option) => performSpellAction({ itemActionId, itemId, option, selfcast: Boolean(selfcast) });

		this.PerformInanimateAction = async inanimateActionId => performSpellAction({ inanimateActionId });

		const performSpellAction = async (obj) => {
			if (!triggerGlobalCooldown()) {
				return;
			}
			const result = await this.WaitFor("Spell", obj);
			result.resetCooldown && resetCooldown();
			return !result.resetCooldown;
		};

		const triggerGlobalCooldown = () => {
			if (!_scenario) {
				const timestamp = MENU.Spells.TriggerGlobalCooldown();
				if (!timestamp) {
					return false;
				}
				ACTION_BAR.TriggerGlobalCooldown(timestamp);
			}
			return true;
		};

		const triggerCooldown = () => {
			const timestamp = MENU.Spells.TriggerGlobalCooldown(true);
			ACTION_BAR.TriggerGlobalCooldown(timestamp);
		}

		const resetCooldown = () => {
			MENU.Spells.ResetGlobalCooldown();
			ACTION_BAR.ResetGlobalCooldown();
		};

		this.GetSkillLevel = skill => {
			const details = _skills[skill];
			return details && details.level || 0;
		};

		this.InScenario = () => _scenario;

		this.MinutesSinceDefeated = () => {
			const millis = _recentlyDefeated && _recentlyDefeated - Date.now();
			return millis > 0 ? millis / 60000 : 0;
		};

		this.IsDazed = idToken => isCountdownActive(idToken || _character && _character.token, "dazed");

		const isCountdownActive = (token, type) => (_countdownsByIdToken[token] || empty).some(countdown => countdown.type === type && countdown.timeout > Date.now());

		this.ClearCountdowns = idToken => {
			const arr = _countdownsByIdToken[idToken];
			if (arr && arr.length > 0) {
				arr.length = 0;
			}
			COUNTDOWN.ClearByIdToken(idToken);
		};

		this.GetCountdowns = idToken => idToken ? _countdownsByIdToken[idToken] || (_countdownsByIdToken[idToken] = []) : [];

		this.Explore = (action) => {
			const e = action && action.event;
			if (e) {
				const { altKey, ctrlKey, shiftKey } = e;
				const type = e.constructor && e.constructor.name || undefined;
				GAME_MANAGER.instance.Send("Explore", { search: action.label === "Search", altKey, ctrlKey, shiftKey, type, timestamp: Math.floor(e.timeStamp || 0) });
			}
		};

		this.Send = async (action, obj) => await _ready && send(typeof action === "string" ? Object.assign(obj, { action }) : obj || action);

		this.WaitFor = async (action, obj) => {
			if (await _ready) {
				const id = ++_nextId;
				send(Object.assign(obj, { action, id }));
				return new Promise(resolve => _callbacks.set(id, result => { _callbacks.delete(id); resolve(result) }));
			}
		};

		function send(obj) {
			const message = JSON.stringify(obj);
			DEBUG_LOG_ENABLED && console.log(message);
			return _ws.send(message.length > 500 ? pako.deflate(message) : message);
		}

		this.Api = (url, params = null, symbol = false) => this.Request(`${GAME_MANAGER.API_HOST}/api/${url}`, params, symbol);

		this.Request = async (url, params = null, symbol = false) => {
			const baton = symbol && displaySymbol(true);
			try {
				const body = Object.assign(params || {}, getSession());
				const response = await fetch(url, { method: "POST", headers: { "Content-type": "application/x-www-form-urlencoded" }, body: Object.keys(body).map(key => `${key}=${body[key]}`).join("&") });
				if (!response.ok) {
					throw new Error(await response.text());
				}
				const result = await response.json();
				DEBUG_LOG_ENABLED && console.log(result);
				result.message && console.log(result.message);
				return result;
			}
			catch (e) {
				DEBUG_LOG_ENABLED && console.error(e);
				throw e;
			}
			finally {
				symbol && LOCK.HasBaton(_loadSymbol, baton) && displaySymbol(false);
			}
		};

		const groupEquippedInSlot = (slot, group) => {
			const item = _equipment.worn[slot] && _equipment.items[slot] && _items[_equipment.items[slot]];
			const baseItem = item && this.GetBaseItem(item.base);
			return baseItem && baseItem.group === group;
		};

		function clearItemCache() {
			_baseItemCache = _stashItemIds = null;
			_itemCount.clear();
			_materialCache.clear();
			_publicItemCache.clear();
			LOCK.RemoveBaton(_publicItemCache);
			ACTION.ClearInanimateActionsCache();
			LOCK.GetFirstBaton(clearItemCache) && waitForFrame().then(() => {
				MENU.Spells.Redraw();
				MENU.Crafting.Redraw();
				ACTION_BAR.Redraw(true);
			}).finally(() => LOCK.RemoveBaton(clearItemCache));
		}

		function displaySymbol(display) {
			_loadSymbol.classList.toggle("visible", display || false);
			return LOCK.GetBaton(_loadSymbol);
		}

		function refreshInventory() {
			MENU.Inventory.Redraw();
			MENU.Stash.Redraw();
			MENU.Trade.Redraw();
			MENU.Crafting.Redraw();
		}

		function removeItem(itemId) {
			if (_tempItems[itemId] !== undefined) {
				delete _tempItems[itemId];
			}
			if (_items[itemId] !== undefined) {
				delete _items[itemId];
			}
		}

		function removeFriend(username) {
			let friend;
			_friends.forEach((obj, i) => {
				if (obj[username] !== undefined) {
					friend = obj[username];
					if (i === 3 && friend.last_online !== undefined) {
						delete friend.last_online;
					}
					delete obj[username];
				}
			});
			return friend;
		}

		function getStashItemIds() {
			if (!_stashItemIds) {
				if (_inventory.stash) {
					const itemIds = [];
					for (const tab of _inventory.stash.filter(o => o)) {
						itemIds.push(...tab.positions);
					}
					_stashItemIds = unique(itemIds);
				}
				else {
					_stashItemIds = [];
				}
			}
			return _stashItemIds;
		}

		function clearRealTimeCountdowns() {
			for (const countdowns of Object.values(_countdownsByIdToken)) {
				for (let i = 0; i < countdowns.length; i++) {
					switch (countdowns[i].type) {
						case "dazed":
						case "leave":
						case "inflation":
							countdowns.splice(i, 1);
							break;
					}
				}
			}
		}

		function createReadyPromise() {
			return GAME_MANAGER[ready] = new Promise(resolve => _readyResolve = resolve);
		}

		async function tokensInterval(actions, actionsPerSecond, maxActions, spells, spellsPerSecond, maxSpells, actionConversion) {
			let timestamp, deltaTime = 0;
			const baton = LOCK.GetBaton(_actions);
			updateTokens({ actions, maxActions, spells, maxSpells });
			if (!actionsPerSecond && !spellsPerSecond && !actionConversion) {
				return;
			}
			do {
				actions = Math.max(0, _actions.actions + deltaTime * actionsPerSecond);
				spells = clamp(_actions.spells + deltaTime * spellsPerSecond + Math.max(0, actions - _actions.maxActions) * actionConversion, 0, _actions.maxSpells);
				actions = Math.min(actions, _actions.maxActions);
				updateTokens({ actions, spells });
				timestamp = Date.now();
				await waitForFrame();
				deltaTime = (Date.now() - timestamp) / 1000;
				if (actionsPerSecond > 0 && _actions.actions < _actions.maxActions) {
					continue;
				}
				if (spellsPerSecond > 0 && _actions.spells < _actions.maxSpells) {
					continue;
				}
				if (actionsPerSecond > 0 && actionConversion > 0 && _actions.spells < _actions.maxSpells) {
					continue;
				}
				break;
			}
			while (LOCK.HasBaton(_actions, baton));
		}

		function updateCountdown(idToken, type, remainingTime) {
			const arr = _countdownsByIdToken[idToken] || (_countdownsByIdToken[idToken] = []);
			if (remainingTime > 0) {
				let countdown = arr.find(countdown => countdown.type === type);
				if (!countdown) {
					countdown = { type };
					arr.push(countdown);
				}
				countdown.timeout = Date.now() + remainingTime;
				if (idToken === _character.token) {
					switch (type) {
						case "recentlyDefeated":
							TUTORIAL.TriggerTip(TUTORIAL.Defeated);
							break;
						case "recentlyTransformed":
							TUTORIAL.TriggerTip(TUTORIAL.Transformed);
							break;
					}
				}
			}
			else {
				for (let i = arr.length - 1; i >= 0; i--) {
					if (arr[i].type === type) {
						arr.splice(i, 1);
					}
				}
			}
			!_scenario && COUNTDOWN.Set(idToken, type, remainingTime);
			ACTION_BAR.Redraw();
		}
	};

	function replaceItemIdInInventory(inventory, prevItemId, itemId = null) {
		for (let prop in inventory) {
			if (Array.isArray(inventory[prop])) {
				if (prop === "stash") {
					inventory.stash.forEach(tab => tab && replaceItemId(tab.positions, prevItemId, itemId));
				}
				else {
					replaceItemId(inventory[prop], prevItemId, itemId);
				}
			}
			else if (inventory[prop] === prevItemId) {
				inventory[prop] = itemId;
			}
		}
	}

	function replaceItemId(positions, prevItemId, itemId) {
		let index = positions.indexOf(prevItemId);
		if (index >= 0) {
			do {
				positions[index] = itemId;
			}
			while ((index = positions.indexOf(prevItemId, index)) >= 0);
		}
	}

	function getOriginTime() {
		return Math.round(performance && performance.timeOrigin || Date.now() - (new Event("change")).timeStamp);
	}

	function getDeviceId() {
		const key = '_deviceId';
		let deviceId = localStorage.getItem(key);
		if (!deviceId && crypto && typeof crypto.randomUUID === "function") {
			localStorage.setItem(key, deviceId = crypto.randomUUID());
		}
		return deviceId || undefined;
	}

	function gotoCharacterSelection() {
		window.location.href = inIframe ? '/game/launcher.php' : '/';
	}

	async function displayError(e) {
		if (await GUI.instance.Alert(`${e.code}: ${e.reason ? e.reason : "Unexpected error."}`, "Exit", "Reload")) {
			gotoCharacterSelection();
		}
		else {
			window.location.reload(true);
		}
	}

	window.gotoCharacterSelection = gotoCharacterSelection;
})(window);
