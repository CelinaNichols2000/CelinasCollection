(() => {
	const tabLabels = ["Campus", "Classes", "Faculty"];

	const classEvents = [
		{
			label: "Transfiguration Class",
			location: "Gym",
			event: "Transfiguration"
		},
		{
			label: "Mind Alteration Class",
			location: "Auditorium",
			event: "MindAlteration"
		},
		{
			label: "Enchantments Class",
			location: "Workshop",
			event: "Enchantment"
		},
		{
			label: "Conjuration Class",
			location: "Workshop",
			event: "Conjuration"
		},
	];

	let _currentTab;

	let _menu;
	Object.defineProperty(MENU, "Location", { get: () => _menu || (_menu = new Location()) });

	function Location() {
		const elm = document.createElement("div");
		elm.id = "menu_locations";

		const table = document.createElement("table");
		const tabParent = document.createElement("div");
		const toggles = document.createElement("ul");
		const avoidEncounters = drawToggle(toggles, "avoid_encounters", "Avoid Encounters", "When enabled, encounters with other players are avoided.<br/>Encounters are always avoided while solo mode is active.");
		const waitForEncounter = drawToggle(toggles, "wait_for_encounter", "Wait for Encounter", "When enabled, will wait indefinitely for an encounter to happen instead of entering the location immediately");

		MENU.Menu.call(this, elm);

		tabParent.className = "tabs";
		const tabs = tabLabels.map(label => {
			const elm = drawTabLabel(tabParent, label);
			elm.onmousedown = () => selectTab(label.toLowerCase());
			return elm;
		});

		elm.appendChild(tabParent);

		{
			const wrapper = document.createElement("div");
			wrapper.appendChild(table);
			wrapper.className = "locations";
			elm.appendChild(wrapper)

			const form = drawForm(elm);

			avoidEncounters.onchange = (e) => {
				if (e.target.parentNode.classList.contains("disabled")) {
					e.target.checked = !e.target.checked;
					return;
				}
				SETTINGS.Set("avoid_encounters", e.target.checked);
				this.UpdateToggles();
			};

			waitForEncounter.onchange = (e) => {
				if (e.target.parentNode.classList.contains("disabled")) {
					e.target.checked = !e.target.checked;
					return;
				}
				SETTINGS.Set("wait_for_encounter", e.target.checked);
				this.UpdateToggles();
			};

			form.appendChild(toggles);
		}

		this.UpdateToggles = () => {
			const solo = isAnonymousUsername(GAME_MANAGER.instance.username) || GAME_MANAGER.instance.settings.solo || false;
			avoidEncounters.checked = solo || SETTINGS.Get("avoid_encounters", false);
			waitForEncounter.checked = SETTINGS.Get("wait_for_encounter", false);
			avoidEncounters.parentNode.classList.toggle("disabled", solo);
			waitForEncounter.parentNode.classList.toggle("disabled", avoidEncounters.checked);
		};

		this.Open = () => {
			let tr;

			const locations = Object.values(GAME_MANAGER.instance.discoveredLocations);

			const facultyTab = tabs[tabLabels.indexOf("Faculty")];
			facultyTab.style.display = locations.some(l => l.type === "faculty") ? "" : "none";

			clearHTML(table);
			clearMenuClasses(elm);

			_currentTab = _currentTab || "campus";
			elm.classList.add(_currentTab);

			tabs.forEach((tab, i) => tab.classList.toggle("inactive", _currentTab !== tabLabels[i].toLocaleLowerCase()));

			for (const toggle of Array.from(elm.getElementsByTagName("input"))) {
				if (_currentTab === "campus") {
					toggle.parentNode.style.opacity = "";
					toggle.parentNode.style.pointerEvents = "";
				}
				else {
					toggle.parentNode.style.opacity = "0.5";
					toggle.parentNode.style.pointerEvents = "none";
				}
			}

			const filteredLocations = _currentTab !== "classes" ? locations.filter(l => l.type === _currentTab) : locations;

			for (let i = 0; i < 6; i++) {
				if (i % 3 == 0) {
					tr = document.createElement("tr");
					table.appendChild(tr);
				}

				const td = document.createElement("td");
				tr.appendChild(td);

				switch (_currentTab) {
					case "classes":
						if (i < classEvents.length) {
							const classEvent = classEvents[i];
							const location = locations.find(l => l.name === classEvent.location);
							if (location) {
								const elm = drawLocationEntry(td, classEvent.label, location);
								elm.classList.add("event");
								elm.onclick = () => {
									GAME_MANAGER.instance.Send("Location", { location: location.name, attendClass: classEvent.event });
									this.Close();
								};
								continue;
							}
						}
						break;
					default:
						if (i < filteredLocations.length) {
							const location = filteredLocations[i];
							const elm = drawLocationEntry(td, location.name, location);
							elm.onclick = () => {
								GAME_MANAGER.instance.Send("Location", { location: location.name, waitForEncounter: waitForEncounter.checked, avoidEncounters: avoidEncounters.checked });
								this.Close();
							};
							continue;
						}
						break;
				}

				drawEmptyEntry(td);
			}

			this.UpdateToggles();
			this.Display("right");
		};

		const selectTab = (tabLabel) => {
			if (_currentTab !== tabLabel) {
				elm.className = `${tabLabel} right`;
				_currentTab = tabLabel;
				this.Open();
			}
		};
	}

	function drawLocationEntry(parent, label, location) {
		const elm = document.createElement("div");
		elm.className = "location";
		elm.style.backgroundImage = `url(${LOCATION.GetBackgroundURL(location, 166.4)})`;
		const div = document.createElement("div");
		div.innerHTML = `<span>${label}</span>`;
		elm.appendChild(div);
		parent.appendChild(elm);
		return elm;
	}

	function drawEmptyEntry(parent) {
		const elm = document.createElement("div");
		elm.className = "location";
		elm.style.border = "none";
		elm.style.background = "#000";
		elm.style.opacity = 0.5;
		parent.appendChild(elm);
		return elm;
	}
})();
