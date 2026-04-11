(async () => {
  let TARGET_TOKEN = "a10d4741ca18995c1f620ec1c06623161835b7e6";
  const gm = GAME_MANAGER.instance;
  const gui = GUI.instance;
  const INSPECT_TIMEOUT_MS = 10000;
  const INSPECT_POLL_MS = 150;

  const KNOWN_PLAYERS = {
    [TARGET_TOKEN]: {
      token: TARGET_TOKEN,
      username: "Sakura",
      names: "Sakura Moone",
      nature: "sexy",
      status: { body: 500, maxBody: 500, mind: 500, maxMind: 500, lust: 0, effects: [] }
    }
  };

  function fixCharacterObject(x) {
    if (!x) return null;
    return typeof x.GetSprite === "function" ? x : new CHARACTER.Character(x);
  }

  function getTargetFromLocation(token) {
    const loc = LOCATION.instance;
    if (!loc) return null;

    if (loc.player && loc.player.token === token) return loc.player;
    if (loc.opponent && loc.opponent.token === token) return loc.opponent;
    const players = loc.players || [];
    for (const p of players) {
      if (p && p.token === token) return p;
    }
    return null;
  }

  async function inspectTarget(token) {
    try {
      if (!MENU?.Inspect?.Open) return null;
      await MENU.Inspect.Open(GUI.Position.Left, token);
    } catch (e) {
      // ignore open errors
    }

    const started = Date.now();
    return new Promise(resolve => {
      const timer = setInterval(() => {
        const c = MENU?.Inspect?.character;
        if (c && c.token === token) {
          clearInterval(timer);
          resolve(fixCharacterObject(c));
        } else if (Date.now() - started > INSPECT_TIMEOUT_MS) {
          clearInterval(timer);
          resolve(null);
        }
      }, INSPECT_POLL_MS);
    });
  }

  async function resolveTargetCharacter(token) {
    const fromLocation = getTargetFromLocation(token);
    if (fromLocation) {
      return fixCharacterObject(fromLocation);
    }

    const inspected = await inspectTarget(token);
    if (inspected) {
      return inspected;
    }

    const known = KNOWN_PLAYERS[token];
    if (known) {
      return fixCharacterObject(known);
    }

    return null;
  }

  const targetCharacter = await resolveTargetCharacter(TARGET_TOKEN);
  if (!targetCharacter) {
    console.error("❌ No target character found for token", TARGET_TOKEN);
    return;
  }

  // keep a local visual state object
  const visual = {
    enabled: true,
    target: targetCharacter,
    currentOwner: null,
    inanimateItem: null,
    originalShowCharacter: SCENE.instance.ShowCharacter.bind(SCENE.instance),
    originalStatusClick: null,
    originalInspectToggle: null,
    observer: null,
    originalCharacter: gm.character,
    originalLocationPlayer: LOCATION.instance?.player,
    originalCharacterState: JSON.parse(JSON.stringify(gm.character || {}))
  };

  const cloneCharacter = (source) => {
    if (!source) return null;
    try {
      return JSON.parse(JSON.stringify(source));
    } catch (err) {
      const obj = {};
      Object.keys(source).forEach(k => obj[k] = source[k]);
      return obj;
    }
  };

  const applyCharacter = (source, dest) => {
    if (!source || !dest) return;
    // remove stale keys not present on source
    Object.keys(dest).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(source, key)) {
        try { delete dest[key]; } catch (e) { }
      }
    });
    // copy source keys
    Object.keys(source).forEach(key => {
      try { dest[key] = source[key]; } catch (e) { }
    });
  };

  const overrideMyCharacter = () => {
    if (!visual.enabled || !visual.target) return;

    if (gm.character) applyCharacter(visual.target, gm.character);

    if (LOCATION.instance) {
      try { LOCATION.instance.player = gm.character; } catch (e) { /* some implementations are read-only */ }
      if (LOCATION.instance.player) applyCharacter(visual.target, LOCATION.instance.player);
    }

    if (MENU?.Myself?.Redraw) try { MENU.Myself.Redraw(); } catch (e) { }
    if (STATUS?.player) {
      try { STATUS.player.RedrawStatus(); STATUS.player.RedrawEffects(); } catch (e) { }
    }
    patchLeftGuiText();
  };

  function installSceneControllerPatch() {
    if (window.__sceneControllerPatched) return;
    const orig = SCENE?.instance?.ShowCharacter ? SCENE.instance.ShowCharacter.bind(SCENE.instance) : null;
    if (!orig) return;

    SCENE.instance.ShowCharacter = async function(character, position, enter) {
      if (visual.enabled && visual.currentOwner && character && character.token === gm.character.token && gm.character.item) {
        console.debug('[FullViewSwap] patched ShowCharacter -> currentOwner', visual.currentOwner.token, 'for player', character.token);
        return orig(visual.currentOwner, position, enter);
      }
      return orig(character, position, enter);
    };

    window.__sceneControllerPatched = true;
  }

  function installOwnerFallbackHook() {
    if (window.__ownerFallbackHooked) return;
    const originalGM = window.GAME_MANAGER;
    const proxyGM = new Proxy(originalGM, {
      get(target, prop) {
        if (prop === 'instance') {
          const realInstance = target.instance;
          return new Proxy(realInstance, {
            get(instanceTarget, instanceProp) {
              if (visual.enabled && visual.target && (instanceProp === 'owner' || instanceProp === 'character')) {
                console.debug('[FullViewSwap] GAME_MANAGER proxying', instanceProp, 'to target', visual.target.token);
                return visual.target;
              }
              return instanceTarget[instanceProp];
            }
          });
        }
        return target[prop];
      }
    });

    try { window.GAME_MANAGER = proxyGM; } catch (e) {
      console.warn('Could not apply GAME_MANAGER proxy', e);
    }

    window.__ownerFallbackHooked = true;
  }

  function installInspectRedirect() {
    try {
      if (MENU?.Inspect) {
        if (!MENU.Inspect._origOpen && MENU.Inspect.Open) {
          MENU.Inspect._origOpen = MENU.Inspect.Open.bind(MENU.Inspect);
          MENU.Inspect.Open = async (position, token, ...args) => {
            const resolvedToken = (visual.enabled && visual.target && token === gm.character?.token) ? TARGET_TOKEN : token;
            console.debug('[FullViewSwap] Inspect.Open PATCHED', { position, incomingToken: token, resolvedToken, redirected: token !== resolvedToken });
            const result = await MENU.Inspect._origOpen(position, resolvedToken, ...args);
            patchLeftGuiText();
            return result;
          };
          console.log('[FullViewSwap] ✓ Patched MENU.Inspect.Open');
        }
        if (!MENU.Inspect._origToggle && MENU.Inspect.Toggle) {
          MENU.Inspect._origToggle = MENU.Inspect.Toggle.bind(MENU.Inspect);
          MENU.Inspect.Toggle = (position, token, ...args) => {
            const resolvedToken = (visual.enabled && visual.target && token === gm.character?.token) ? TARGET_TOKEN : token;
            console.debug('[FullViewSwap] Inspect.Toggle PATCHED', { position, incomingToken: token, resolvedToken, redirected: token !== resolvedToken });
            return MENU.Inspect._origToggle(position, resolvedToken, ...args);
          };
          console.log('[FullViewSwap] ✓ Patched MENU.Inspect.Toggle');
        }
      } else {
        console.warn('[FullViewSwap] ⚠ MENU.Inspect does not exist yet - patches may not apply!');
      }
    } catch (e) {
      console.warn('[FullViewSwap] installInspectRedirect failed', e);
    }

    try {
      if (MENU?.Myself) {
        if (!MENU.Myself._origToggle && MENU.Myself.Toggle) {
          MENU.Myself._origToggle = MENU.Myself.Toggle.bind(MENU.Myself);
          MENU.Myself.Toggle = (position, ...args) => {
            console.debug('[FullViewSwap] Myself.Toggle PATCHED [redirect to target inspect]', { position, targetToken: TARGET_TOKEN });
            if (MENU?.Inspect?.Open) {
              return MENU.Inspect.Open(position, TARGET_TOKEN);
            }
            return MENU.Myself._origToggle(position, ...args);
          };
          console.log('[FullViewSwap] ✓ Patched MENU.Myself.Toggle');
        }
      } else {
        console.warn('[FullViewSwap] ⚠ MENU.Myself does not exist yet - patches may not apply!');
      }
    } catch (e) {
      console.warn('[FullViewSwap] installMyselfRedirect failed', e);
    }
  }

  function makeTransformItem() {
    return {
      id: Math.floor(Math.random() * 10000000),
      stack: 0,
      base: { id: 137, item_name: "Transformed Item", image_url: "https://battlemageserotica.com/game/assets/items/leotard_vinyl.png", type: "equipment", slots: ["shirt"], flags: [], nsfw: false },
      flags: 0,
      character: {
        permanent: true,
        sealed: false,
        name: visual.target.names || visual.target.name || "Target",
        nature: visual.target.nature || "sexy",
        id_token: gm.character.token
      },
      enchantments: [],
      attributes: 0,
      variant_color: "Purple",
      variant_accessory: null
    };
  }

  function enableFullViewSwapMode() {
    visual.currentOwner = visual.target;
    visual.inanimateItem = makeTransformItem();

    if (!gm.character) return;
    gm.character.item = visual.inanimateItem;

    if (visual.currentOwner) {
      if (!Array.isArray(visual.currentOwner.equipment)) {
        visual.currentOwner.equipment = [];
      }
      visual.currentOwner.equipment = visual.currentOwner.equipment.filter(item => !(item?.character?.id_token === gm.character.token));
      visual.currentOwner.equipment.push(visual.inanimateItem);
    }

    if (!visual.enabled) {
      visual.enabled = true;
    }

    installSceneControllerPatch();
    // installOwnerFallbackHook();  // DISABLED: proxy was freezing the game
    installInspectRedirect();

    applyCharacter(visual.target, gm.character);
    if (LOCATION.instance?.player) applyCharacter(visual.target, LOCATION.instance.player);

    if (MENU?.Myself?.Redraw) MENU.Myself.Redraw();
    if (STATUS?.player) {
      STATUS.player.RedrawStatus();
      STATUS.player.RedrawEffects();
    }
    patchLeftGuiText();
  }

  function disableFullViewSwapMode() {
    if (gm.character && gm.character.item && gm.character.item.character?.id_token === gm.character.token) {
      delete gm.character.item;
    }
    if (visual.currentOwner?.equipment) {
      visual.currentOwner.equipment = visual.currentOwner.equipment.filter(item => !(item?.character?.id_token === gm.character.token));
    }
    visual.currentOwner = null;
    visual.inanimateItem = null;
    visual.enabled = false;

    if (MENU?.Myself?.Redraw) MENU.Myself.Redraw();
    if (STATUS?.player) {
      STATUS.player.RedrawStatus();
      STATUS.player.RedrawEffects();
    }
    patchLeftGuiText();
  }

  const restoreMyCharacter = () => {
    if (!visual.originalCharacter) return;
    applyCharacter(visual.originalCharacterState, visual.originalCharacter);
    if (LOCATION.instance) {
      try {
        LOCATION.instance.player = visual.originalLocationPlayer;
      } catch (e) {
        // ignore
      }
      if (LOCATION.instance.player) applyCharacter(visual.originalCharacterState, LOCATION.instance.player);
    }


    if (MENU?.Myself?.Redraw) try { MENU.Myself.Redraw(); } catch (e) { }
    if (STATUS?.player) {
      try { STATUS.player.RedrawStatus(); STATUS.player.RedrawEffects(); } catch (e) { }
    }
    patchLeftGuiText();
  };

  // 3) Rewrite left-side displayed nameplate/effects labels after status redraw
  function patchLeftGuiText() {
    if (!visual.enabled || !visual.target) return;

    // left scene slot hover/title behavior stays scene-driven;
    // here we patch visible nameplate text in the status/effects area
    const leftEffects = document.querySelector("#status_effects li:first-child");
    if (leftEffects) {
      const firstNameplate = leftEffects.querySelector(".nameplate");
      if (firstNameplate) {
        firstNameplate.className = `nameplate ${visual.target.nature || ""}`;
        const charName = firstNameplate.querySelector(".character_name");
        if (charName) {
          charName.textContent = visual.target.names || visual.target.name || "";
        }
        const username = firstNameplate.querySelector("span:not(.character_name)");
        if (username) {
          username.textContent = visual.target.username || "";
          if (visual.target.username_color) {
            username.style.color = visual.target.username_color;
          }
        }
        firstNameplate.onmouseenter = e => TOOLTIP.instance.ShowNameplate(e, visual.target);
        firstNameplate.ontouchstart = e => TOOLTIP.instance.ShowNameplate(e, visual.target);
      }
    }

    // if an inspect menu is open in "player" mode, redirect it to target
    if (MENU?.Inspect?.menu && MENU.Inspect.menu.classList.contains("player")) {
      MENU.Inspect.Open(GUI.Position.Left, TARGET_TOKEN);
    }
  }

  // 4) Watch for redraws because status/effects DOM gets recreated often
  const effectsRoot = document.getElementById("status_effects");
  if (effectsRoot) {
    visual.observer = new MutationObserver(() => patchLeftGuiText());
    visual.observer.observe(effectsRoot, { childList: true, subtree: true });
  }

  // helper API
  window.FullViewSwap = {
    target: visual.target,

    async switchTarget(newToken) {
      console.debug('[FullViewSwap] switchTarget called', { oldToken: TARGET_TOKEN, newToken });
      TARGET_TOKEN = newToken;
      const newTarget = await resolveTargetCharacter(newToken);
      if (!newTarget) {
        console.error('[FullViewSwap] Could not resolve new target token', newToken);
        return false;
      }
      visual.target = newTarget;
      window.FullViewSwap.target = newTarget;
      await this.refresh();
      console.log('[FullViewSwap] ✓ Switched to:', newTarget.names || newTarget.name);
      return true;
    },

    async refresh() {
      console.debug('[FullViewSwap] refresh invoked', { myToken: gm.character?.token, targetToken: TARGET_TOKEN });
      enableFullViewSwapMode();
      STATUS.player.RedrawEffects();
      STATUS.player.RedrawStatus();
      await SCENE.instance.ShowCharacter(gm.character, 0, false);
      patchLeftGuiText();
    },

    async disable() {
      if (visual.observer) {
        visual.observer.disconnect();
        visual.observer = null;
      }

      if (playerStatusElm && visual.originalStatusClick) {
        playerStatusElm.onclick = visual.originalStatusClick;
      }

      SCENE.instance.ShowCharacter = visual.originalShowCharacter;

      disableFullViewSwapMode();
      restoreMyCharacter();
      await SCENE.instance.ShowCharacter(gm.character, 0, false);
      STATUS.player.RedrawEffects();
      STATUS.player.RedrawStatus();

      console.log("✓ FullViewSwap disabled");
    },

    status() {
      return {
        enabled: visual.enabled,
        yourToken: gm.character?.token || null,
        targetToken: visual.target?.token || null,
        targetName: visual.target?.names || null
      };
    },

    getTargetToken() {
      return TARGET_TOKEN;
    }
  };

  // initial redraw - wait for game state to settle
  await new Promise(r => setTimeout(r, 100));
  await FullViewSwap.refresh();

  console.log("✓ FullViewSwap enabled for:", visual.target.names || visual.target.name);
  console.log("Use FullViewSwap.disable() to turn it off.");
})();