(() => {
	DIALOG = {
		DRAG_THRESHOLD: 5,
		ScrollDuration: 20,
		StopDuration: 350,
		ClickThreshold: 200,
		stopCharacters: ",.:?!",
	};

	DIALOG.Dialog = function Dialog() {
		const [_input, _elm, , _start, _onCompleted] = arguments;

		let _speech = arguments[2];

		const _background = document.getElementById("background_wrapper");
		const _textField = _elm.getElementsByClassName("text_field")[0];

		let _timer = null;
		let _letters;
		let _letter;

		let _nextLetter = 0;
		let _x = 0;
		let _y = 0;

		let _mouseEnabled = true;
		let _enabled = false;

		const mouseDown = function (e) {
			_mouseEnabled = true;
			_x = e.pageX !== undefined ? e.pageX : e.targetTouches[0].pageX;
			_y = e.pageY !== undefined ? e.pageY : e.targetTouches[0].pageY;
		};

		const onCompleted = function () {
			document.removeEventListener('keydown', keyDown);
			container.removeEventListener("mousemove", mouseMove);
			container.classList.remove("dialog");

			_background.removeEventListener("mousedown", mouseDown);
			_background.removeEventListener("touchstart", mouseDown);
			_background.removeEventListener("click", () => mouseClick);

			_next = null;
			_elm.classList.remove("complete");
			_onCompleted && _onCompleted();
		};

		const mouseMove = function (e) {
			if (!_mouseEnabled) {
				return;
			}

			const x = e.pageX !== undefined ? e.pageX : e.targetTouches[0].pageX;
			const y = e.pageY !== undefined ? e.pageY : e.targetTouches[0].pageY;

			if (Math.abs(_x - x) > DIALOG.DRAG_THRESHOLD || Math.abs(_y - y) > DIALOG.DRAG_THRESHOLD) {
				_mouseEnabled = false;
			}
		};

		const mouseClick = () => _mouseEnabled && next();

		const keyDown = (e) => {
			switch (e.key) {
				case "Enter":
				case " ":
					next();
					break;
			}
		};

		const next = function () {
			if (!_enabled) {
				return;
			}

			if (_speech) {
				_speech = false;

				for (let i = 0; i < _letters.length; i++) {
					_letters[i].classList.add("v");
				}
				_elm.classList.add("complete");

				clearTimeout(_timer);
				_timer = setTimeout(() => _enabled = true, DIALOG.ClickThreshold);
			}
			else {
				onCompleted();
			}

			_enabled = false;
		};

		const update = function () {
			if (_nextLetter >= _letters.length) {
				return;
			}

			_letter = _letters[_nextLetter];
			_letter.classList.add("v");

			if (++_nextLetter < _letters.length) {
				clearTimeout(_timer);
				_timer = setTimeout(update, DIALOG.stopCharacters.indexOf(_letter.innerHTML) >= 0 ? DIALOG.StopDuration : DIALOG.ScrollDuration);
			}
			else {
				_speech = false;

				if (_onCompleted) {
					_elm.classList.add("complete");
				}
			}
		};

		const segmentSpeech = function (str) {
			if (str) {
				const holder = document.createElement("div");
				holder.innerHTML = str.trim();
				str = "";
				while (holder.firstChild) {
					if (holder.firstChild.wholeText) {
						const words = holder.firstChild.wholeText.split(' ');
						for (let i = 0; i < words.length; i++) {
							words[i] = (`<div><span class="_c">${words[i].split('').join('</span><span class="_c">')}</span></div>`).replace(/\-/g, "-</div><div>");
						}
						str += words.join(' ');
					}
					else {
						holder.firstChild.innerHTML = segmentSpeech(holder.firstChild.innerHTML);
						str += holder.firstChild.outerHTML;
					}
					holder.removeChild(holder.firstChild);
				}
			}
			return str;
		};

		clearHTML(_textField);

		if (_speech) {
			_textField.innerHTML = segmentSpeech(collapseWhitespace(_input || ''));
			_letters = _textField.getElementsByClassName("_c");

			if (_start) {
				if (_start < _letters.length) {
					do {
						_letters[_nextLetter++].classList.add("v");
					} while (_nextLetter < _start);
				}
				else {
					_speech = false;
				}
			}
		}

		_onCompleted && container.classList.add("dialog");

		_elm.classList.remove("chat");
		_textField.style.paddingBottom = null;

		_elm.ontouchstart = _elm.onmousedown = mouseDown;
		_elm.onclick = mouseClick;

		_background.addEventListener("mousedown", mouseDown);
		_background.addEventListener("touchstart", mouseDown);
		_background.addEventListener("click", mouseClick);

		document.addEventListener('keydown', keyDown);

		container.addEventListener("mousemove", mouseMove);

		{
			let clone;

			_textField.style.transform = null;

			if (!_speech) {
				_textField.innerHTML = _input.trim();
				if (_onCompleted) {
					_elm.classList.add("complete");
				}
				clone = _textField;
			}
			else {
				clone = _textField.cloneNode();
				clone.innerHTML = _input.trim();
				_textField.parentNode.appendChild(clone);
			}

			const computed = window.getComputedStyle(_textField.parentNode);
			const padding = (parseFloat(computed.paddingTop.split("px")[0]) || 0) + (parseFloat(computed.paddingBottom.split("px")[0]) || 0);
			const vertical = clone.offsetHeight + padding;

			if (vertical > _textField.parentNode.offsetHeight) {
				_textField.style.transform = `scale(${(_textField.parentNode.offsetHeight - padding) / clone.offsetHeight})`;
			}

			if (clone != _textField && clone.parentNode) {
				clone.parentNode.removeChild(clone);
			}
		}

		(async () => {
			if (_elm.classList.contains("inactive")) {
				_elm.classList.remove("inactive");
				await transitionEnded(_elm);
			}
			_enabled = true;
			_speech && update();
		})();
	};
})();

