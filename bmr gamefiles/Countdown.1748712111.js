(() => {
	const READY_TIMEOUT_SECONDS = 60;
	const PRIORITY_TIMEOUT_SECONDS = 20;
	const ALL_READY_TIMEOUT_SECONDS = 6;

	COUNTDOWN = {
		RADIUS: 40,
		LINE_WIDTH: 5,
		COLOR: "#ff0000",
		Set: (idToken, type, remainingTime) => {
			const targetLabel = idTokenToTargetLabel(idToken);
			if (targetLabel && validateType(type)) {
				const countdown = _list.find(entry => entry.type === type && entry.targetLabel === targetLabel);
				if (countdown) {
					if (remainingTime > 0) {
						countdown.SetRemainingTime(remainingTime);
					}
					else {
						countdown.RemoveSelf();
					}
				}
				else if (remainingTime >= 1000) {
					countdown && countdown.RemoveSelf();
					new Countdown(remainingTime, idToken, targetLabel, type);
					if (type === "leave") {
						const opponent = LOCATION.instance.opponent;
						if (opponent && opponent.token === idToken) {
							NOTIFICATION.Leaving(opponent.names, opponent.username);
						}
					}
				}
			}
		},
		ClearByIdToken: idToken => COUNTDOWN.ClearByTargetLabel(idTokenToTargetLabel(idToken)),
		ClearByTargetLabel: targetLabel => targetLabel && _list.forEach(entry => entry.targetLabel === targetLabel && entry.RemoveSelf()),
		Resize: () => _readyCheck && _readyCheck.Resize(),
		Clear: () => _list.forEach(entry => entry.RemoveSelf()),
		Update: now => {
			_list.forEach(countdown => countdown.Update(now));
			_readyCheck && _readyCheck.Update(now);
		},
	}

	let _parents;
	let _readyCheck;

	const _list = [];

	const timerMap = new Map();

	const getParent = targetLabel => (_parents || (_parents = Array.from(document.getElementById("countdowns").getElementsByTagName("div"))))[targetLabel == "player" ? 0 : 1];

	Object.defineProperty(COUNTDOWN, 'readyCheck', { get: () => _readyCheck || (_readyCheck = new COUNTDOWN.ReadyCheck()) });

	function Countdown(_time) {
		const [, _idToken, _target, _type] = arguments;

		const [_elm, _timer, _bar] = drawCountdown(_idToken, _target, _type);

		_list.push(this);

		let _start = Date.now();
		let _duration;

		switch (_type) {
			case "choosing":
				_start -= PRIORITY_TIMEOUT_SECONDS * 1000 - _time;
				_duration = PRIORITY_TIMEOUT_SECONDS * 1000;
				break;
			default:
				_duration = _time;
				break;
		}

		let _seconds = _duration / 1000;

		Object.defineProperties(this, {
			'type': { value: _type, writable: false },
			'targetLabel': { value: _target, writable: false },
		});

		this.SetRemainingTime = time => {
			const now = Date.now();
			const elapsedTime = now - _start;
			const remainingTime = _duration - elapsedTime;
			if (time !== remainingTime) {
				_start += time - remainingTime;
				_duration = Math.max(time, _duration);
				_seconds = _duration / 1000;
			}
			if ((now - _start) / _duration >= 1) {
				this.RemoveSelf();
			}
		};

		this.Update = now => update(_timer, _bar, _start, _seconds, _duration, now) >= 1 && this.RemoveSelf();

		this.RemoveSelf = () => {
			const index = _list.indexOf(this);
			index >= 0 && _list.splice(index, 1);
			_elm.parentNode && _elm.parentNode.removeChild(_elm);
			timerMap.delete(_timer);
			ACTION_BAR.Redraw();
		};

		this.Update(Date.now());
	}

	COUNTDOWN.ReadyCheck = function () {
		const _elm = document.getElementById("ready_check");
		const _checks = document.getElementsByClassName("checks")[0];
		const _description = document.getElementsByTagName("p")[0];

		const _idToken = GAME_MANAGER.instance.character.token;

		const _checksByIdToken = new Map();

		const [timer, _timerText, label, _bar] = findTimer(_elm) || drawTimer(_elm);

		const _seconds = READY_TIMEOUT_SECONDS;
		const _duration = _seconds * 1000;
		const _timeouts = [];

		let _start = Date.now();
		let _ready = false;
		let _notification = false;

		_elm.ontouchstart = _elm.onmouseenter = () => updateReady(true);
		_elm.onmouseleave = () => updateReady(_ready);
		_elm.onclick = () => GAME_MANAGER.instance.Send("Location", { ready: 1 });

		_description.innerHTML = getString("The battle will begin when all players are ready or time runs out<br/>Leaving will allow your opponent to attack immediately");

		const updateReady = ready => {
			label.textContent = getString(ready ? "Ready" : "Not Ready");
			timer.classList.toggle("tough", _ready);
			timer.classList.toggle("sexy", !_ready);
		};

		this.Resize = () => _checks.style.width = `${_description.offsetWidth}px`;

		this.Redraw = obj => {
			if (!obj) {
				return this.RemoveSelf();
			}
			if (obj.remainingTime !== undefined) {
				const remainingTime = getRemainingTime();
				if (obj.remainingTime !== remainingTime) {
					_start += obj.remainingTime - remainingTime;
					clearNotificationTimers();
					setTimeout(showNotification, Math.max(0, obj.remainingTime - ALL_READY_TIMEOUT_SECONDS * 1000));
					setTimeout(showNotification, Math.max(0, obj.remainingTime));
				}
			}
			if (obj.characters !== undefined) {
				clearHTML(_checks);
				_checksByIdToken.clear();
				for (const idToken in obj.characters) {
					const div = document.createElement("div");
					div.textContent = obj.characters[idToken];
					idToken === _idToken ? _checks.insertBefore(div, _checks.firstChild) : _checks.appendChild(div);
					_checksByIdToken.set(idToken, div);
				}
			}
			if (obj.notReady !== undefined) {
				_ready = !obj.notReady.includes(_idToken);
				for (const idToken of _checksByIdToken.keys()) {
					const elm = _checksByIdToken.get(idToken);
					elm && elm.classList.toggle("ready", !obj.notReady.includes(idToken));
				}
			}
			updateReady(_ready);
			_elm.parentNode.classList.add("ready_check");
			this.Resize();
		};

		this.Update = now => update(_timerText, _bar, _start, _seconds, _duration, now) >= 1 && this.RemoveSelf();

		this.RemoveSelf = () => {
			_readyCheck === this && (_readyCheck = null);
			_elm.parentNode.classList.remove("ready_check");
			clearNotificationTimers();
		};

		const clearNotificationTimers = () => _timeouts.forEach(timeout => timeout && clearTimeout(timeout));

		const getRemainingTime = () => _duration - (Date.now() - _start);

		const showNotification = () => {
			if (!_notification && NOTIFICATION.ReadyCheck()) {
				clearNotificationTimers();
				_notification = true;
			}
		}
	}

	function idTokenToTargetLabel(idToken) {
		if (GAME_MANAGER.instance.character && GAME_MANAGER.instance.character.token === idToken) {
			return "player";
		}
		if (GAME_MANAGER.instance.owner && GAME_MANAGER.instance.owner.token === idToken) {
			return "owner";
		}
		if (LOCATION.instance.opponent && LOCATION.instance.opponent.token === idToken) {
			return "opponent";
		}
		return null;
	}

	function idTokenToNature(idToken) {
		if (GAME_MANAGER.instance.character && GAME_MANAGER.instance.character.token === idToken) {
			return GAME_MANAGER.instance.character.nature;
		}
		if (GAME_MANAGER.instance.owner && GAME_MANAGER.instance.owner.token === idToken) {
			return GAME_MANAGER.instance.owner.nature;
		}
		if (LOCATION.instance.opponent && LOCATION.instance.opponent.token === idToken) {
			return LOCATION.instance.opponent.nature;
		}
	}

	function update(timer, bar, start, seconds, duration, now) {
		progress = (now - start) / duration;
		if (progress < 1) {
			let s = seconds - progress * seconds;
			s = s < 1 ? s.toFixed(1) : Math.floor(s);
			if (s !== timerMap.get(timer)) {
				timer.textContent = s;
				timerMap.set(timer, s);
			}
			bar.style.transform = `translateX(-${progress * 100}%)`;
		}
		return progress;
	}

	function validateType(type) {
		switch (type) {
			case "dazed":
			case "leave":
			case "choosing":
				return true;
			default:
				return false;
		}
	}

	function drawTimer(parent, idToken) {
		const elm = document.createElement("div");
		const label = document.createElement("div");
		const timer = document.createElement("span");
		const timerParent = document.createElement("div");

		const bar = document.createElement("div");
		const barProgress = document.createElement("div");
		const barBackground = document.createElement("div");

		elm.className = "countdown";
		label.className = "label";

		bar.className = "bar";
		barBackground.className = "background";
		barProgress.className = "progress";

		timerParent.className = "timer";
		timerParent.appendChild(timer);

		barBackground.appendChild(barProgress);
		bar.appendChild(barBackground);
		bar.appendChild(label);

		elm.appendChild(bar);
		elm.appendChild(timerParent);

		const nature = idToken && idTokenToNature(idToken);
		nature && elm.classList.add(nature);

		parent.appendChild(elm);

		return [elm, timer, label, barProgress];
	}

	function drawCountdown(idToken, targetLabel, type) {
		let cancellable, labelText;

		const [elm, timer, label, bar] = drawTimer(getParent(targetLabel), idToken);

		switch (type) {
			case "leave":
				labelText = "Leaving";
				cancellable = targetLabel === "player";
				if (cancellable) {
					elm.onclick = () => GAME_MANAGER.instance.Send("Leave", { cancel: true });
				}
				break;
			case "dazed":
				labelText = "Dazed";
				cancellable = false;
				break;
			case "choosing":
				labelText = "Choosing";
				cancellable = false;
				break;
		}

		label.textContent = getString(labelText);

		if (cancellable) {
			elm.ontouchstart = elm.onmouseenter = () => label.textContent = getString("Cancel");
			elm.onmouseleave = () => label.textContent = getString(labelText);
		}
		else {
			elm.style.pointerEvents = "none";
		}

		return [elm, timer, bar];
	}

	function findTimer(parent) {
		const timer = parent.getElementsByClassName("timer")[0];
		if (timer) {
			const bar = timer.parentNode.getElementsByClassName("bar")[0];
			const label = bar && bar.getElementsByClassName("label")[0];
			const barProgress = bar && bar.getElementsByClassName("progress")[0];
			return label && barProgress ? [timer.parentNode, timer, label, barProgress] : null;
		}
		return null;
	}

})();
