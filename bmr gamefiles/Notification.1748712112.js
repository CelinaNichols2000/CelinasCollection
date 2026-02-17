((window) => {
    const INVITE_EXPIRATION = 20 * 1000;
    const MIN_DURATION = 5 * 1000;

    const Type = Object.freeze({
        FriendRequest: 0,
        Online: 1,
        PrivateMessage: 2,
        Meetup: 3,
        Move: 4,
        Trade: 5,
        ItemSold: 6,
    });

    const BrowserNotification = window.Notification;

    const _options = Object.freeze({
        badge: `${window.location.origin}/assets/favicon/favicon.ico`,
        icon: `${window.location.origin}/game/assets/gui/default_icon.png`,
    });

    const _list = [];
    const _pendingNotifications = [];
    const _displayKey = {};

    let _notifications;

    const getNotifications = () => _notifications || (_notifications = document.getElementById("notifications"));

    NOTIFICATION = {
        Type,
        Timeout: 3000,
        WordsPerMinute: 200,
        browserSupport: BrowserNotification !== undefined,
        RemoveAll: async () => {
            _pendingNotifications.length = 0;
            Promise.all(_list.map(n => n.Remove()));
        },
    };

    NOTIFICATION.CombatMessage = message => {
        const title = "Entered combat!";
        TITLE.Message(title);
        if (SETTINGS.Get("browser_notification_on_combat_log", true)) {
            return displayBrowserNotification(getString("Combat log"), { body: message || title });
        }
    };

    NOTIFICATION.Leaving = (characterNames, username) => {
        if (SETTINGS.Get("browser_notification_on_leaving", true)) {
            return displayBrowserNotification(getString("Leaving"), { body: getText("{0} ({1}) started to leave", characterNames, username) });
        }
    };

    NOTIFICATION.ReadyCheck = () => {
        if (SETTINGS.Get("browser_notification_on_ready_check", true)) {
            return displayBrowserNotification(getString("Ready check"), { body: getString("The battle is about to begin!") });
        }
        return false;
    };

    NOTIFICATION.Encounter = (characterNames, username) => {
        TITLE.Message("Entered encounter!");
        if (SETTINGS.Get("browser_notification_on_encounter", true)) {
            return displayBrowserNotification(getString("Entered encounter"), { body: getText("{0} ({1}) has entered the same location as you", characterNames, username) });
        }
    };

    NOTIFICATION.EncounterEnded = (characterNames, username) => {
        if (SETTINGS.Get("browser_notification_on_encounter_ended", true)) {
            return displayBrowserNotification(getString("Encounter ended"), { body: getText("{0} ({1}) has left your location", characterNames, username) });
        }
    };

    NOTIFICATION.StoppedWaiting = () => {
        TITLE.Message("Stopped waiting");
        if (SETTINGS.Get("browser_notification_on_stopped_waiting", true)) {
            return displayBrowserNotification(getString("Stopped waiting"), { body: getString("Waiting for encounter was aborted") });
        }
    };

    NOTIFICATION.Reaction = () => {
        TITLE.Message("Reaction");
        if (SETTINGS.Get("browser_notification_on_stopped_waiting", true)) {
            return displayBrowserNotification(getString("Reaction"), { body: getString("Waiting for you to select a reaction") });
        }
    };

    NOTIFICATION.ItemSold = async params => {
        TITLE.Message("Sold item");
        if (SETTINGS.Get("browser_notification_on_item_sold", true)) {
            const { item, price } = params;
            return displayBrowserNotification(getString("Sold item"), { body: getText(`Your [{0}]${(item.stack > 1 ? `x{2}` : '')} was sold for {1} crowns`, getItemName(item), price, item.stack) });
        }
    };

    NOTIFICATION.ChatMessage = (sender, channel, message) => {
        TITLE.Message("New chat message");
        if (SETTINGS.Get("browser_notification_on_chat_message", true)) {
            if (Array.isArray(message)) {
                let str = "";
                for (const segment of message) {
                    switch (segment.channel) {
                        case LOCAL_CHAT.Channel.OOC:
                            str += `(${segment.text})`;
                            break;
                        case LOCAL_CHAT.Channel.Emote:
                            str += `*${segment.text}*`;
                            break;
                        default:
                            str += segment.text;
                            break;
                    }
                }
                message = str;
            }
            else {
                switch (channel) {
                    case LOCAL_CHAT.Channel.OOC:
                        message = `(${message})`;
                        break;
                    case LOCAL_CHAT.Channel.Emote:
                        message = `*${message}*`;
                        break;
                }
            }
            return displayBrowserNotification(getText("New chat message from {0}", sender), { body: message });
        }
    };

    NOTIFICATION.FriendRequest = async params => {
        const { username, character } = params;
        TITLE.Message("Friend request");
        if (SETTINGS.Get("browser_notification_on_friend_request", true)) {
            if (displayBrowserNotification(getString("Friend Request"), { body: getText("New friend request from {0} ({1})", character, username) }, () => MENU.Social.Open()) !== false) {
                return;
            }
        }
        const onAccept = () => GAME_MANAGER.instance.AcceptFriend(username);
        const onDecline = () => GAME_MANAGER.instance.RemoveFriend(username);
        return new Notification("friend_request", "Friend request", params).ShowAsPrompt(onAccept, onDecline);
    };

    NOTIFICATION.Meetup = async params => {
        const { username, character, location, type, request } = params;
        if (type !== "Move" && SETTINGS.Get("browser_notification_on_meetup", true)) {
            if (request) {
                displayBrowserNotification(getString("Meetup Request"), { body: getText("{0} ({1}) has made a request to join your location", character, username) });
            }
            else {
                displayBrowserNotification(getString("Meetup Invitation"), { body: getText("{0} ({1}) has invited you to join their location", character, username) });
            }
        }
        const title = location ? location : request ? "Meetup Request" : "Meetup Invitation";
        const notification = new Notification("invitation", title, params, INVITE_EXPIRATION);
        const onAccept = () => GAME_MANAGER.instance.InvitationResponse(username, request, true);
        const onDecline = () => GAME_MANAGER.instance.InvitationResponse(username, request, false);
        return type === "Move" ? notification.ShowAsMoveRequest(onAccept, onDecline) : notification.ShowAsPrompt(onAccept, onDecline);
    };

    NOTIFICATION.PrivateMessage = async params => {
        TITLE.Message("New private message");
        const sender = params.sender.username;
        if (SETTINGS.Get("browser_notification_on_private_message", true)) {
            const { message } = params;
            if (displayBrowserNotification(getText("New private message from {0}", sender), { body: message }, () => MENU.Messages.Open(sender)) !== false) {
                return;
            }
        }
        return new Notification("message", "New message", params).ShowAsMessage(() => MENU.Messages.Open(sender));
    };

    NOTIFICATION.FriendOnline = async params => {
        const { username, character } = params;
        TITLE.Message("Friend online");
        if (SETTINGS.Get("browser_notification_on_friend_online", true)) {
            if (displayBrowserNotification("Friend Online", { body: `${character} (${username}) has come online` }, () => MENU.Social.Open()) !== false) {
                return;
            }
        }
        return new Notification("online", "Online", params).Show(() => MENU.Social.Open());
    }

    NOTIFICATION.Trade = async params => {
        const { username, request } = params;
        const onAccept = () => GAME_MANAGER.instance.InvitationResponse(username, request, true);
        const onDecline = () => GAME_MANAGER.instance.InvitationResponse(username, request, false);
        return (new Notification("invitation", "Trade Request", params, INVITE_EXPIRATION)).ShowAsPrompt(onAccept, onDecline);
    }

    function Notification(clss, title, params, duration) {
        let _onclick;

        const elm = document.createElement("div");
        elm.innerHTML = `<div>${getString(title)}</div>`;
        elm.className = clss;
        elm.onclick = e => {
            if (!e.defaultPrevented) {
                _onclick && _onclick();
                close(e);
            }
        }

        const closeButton = document.createElement("div");
        closeButton.className = "close";
        closeButton.onclick = e => close(e);
        elm.appendChild(closeButton);

        Object.defineProperties(this, {
            'elm': { value: elm, writable: false },
            'timestamp': { value: params.timestamp || Date.now(), writable: false },
            'duration': { get: () => duration || Math.max(60 * 1000 / NOTIFICATION.WordsPerMinute * countWords(elm.textContent), MIN_DURATION) },
        });

        const close = e => {
            waitForFrame().then(() => this.RemoveImmediately());
            e.preventDefault();
        };

        this.ShowAsPrompt = (onAccept, onDecline, displayUser = true) => {
            displayUser && drawUser(elm, params);

            elm.onclick = null;

            const div = document.createElement("div");
            div.className = "buttons";
            {
                const accept = document.createElement("span");
                accept.className = "accept";
                accept.onclick = e => {
                    onAccept && onAccept();
                    close(e);
                };
                div.appendChild(accept);

                const decline = document.createElement("span");
                decline.className = "decline";
                decline.onclick = e => {
                    onDecline && onDecline();
                    close(e);
                };
                div.appendChild(decline);
            }
            elm.appendChild(div);

            return displayNotification(this);
        };

        this.ShowAsMoveRequest = (onAccept, onDecline) => {
            const { character, location } = params;

            const content = document.createElement("div");
            content.className = "box";
            elm.appendChild(content);

            const div = document.createElement("div");
            div.textContent = getText("{0} wants to take this encounter to {1}", character.split(" ")[0], location.indexOf("The ") == 0 ? firstToLowerCase(location) : location);
            content.appendChild(div);

            return this.ShowAsPrompt(onAccept, onDecline);
        }

        this.ShowAsMessage = (onclick) => {
            const { username_color } = params.sender;

            const sender = document.createElement("div");
            sender.className = "sender";

            const username = document.createElement("span");
            username.textContent = params.sender.username;
            username.className = "username";
            username_color && (username.style.color = username_color);
            sender.appendChild(username);

            elm.appendChild(sender);

            const message = document.createElement("div");
            message.className = "box";
            message.textContent = params.message.length > 255 ? params.message.substring(0, 255) : params.message;
            elm.appendChild(message);

            _onclick = onclick;

            return displayNotification(this);
        };

        this.Show = (onclick) => {
            drawUser(elm, params);
            _onclick = onclick;
            return displayNotification(this);
        }

        this.Remove = async () => {
            if (elm.parentNode && !elm.classList.contains("inactive") && !isPageHidden()) {
                elm.classList.add("inactive");
                await Promise.race([transitionEnded(elm), waitWhile(() => _list.includes(this))]);
            }
            this.RemoveImmediately();
        };

        this.RemoveImmediately = () => {
            const index = _list.indexOf(removeFromPending(this));
            index >= 0 && _list.splice(index, 1);
            elm.parentNode && elm.parentNode.removeChild(elm);
        };
    }

    const drawUser = (parent, params) => {
        const { username, username_color, character, nature } = params;

        const content = document.createElement("div");
        content.className = "box user";

        const user = document.createElement("div");
        user.className = "username";
        user.textContent = username;
        username_color && (user.style.color = username_color);
        content.appendChild(user);

        const userCharacter = document.createElement("div");
        userCharacter.textContent = character;
        userCharacter.className = `character ${nature}`;
        content.appendChild(userCharacter);
        parent.appendChild(content);

        return content;
    };

    const displayNotification = async (notification) => {
        _pendingNotifications.push(notification);
        const { elm, duration, timestamp } = notification;
        await LOCK.Lock(_displayKey);
        try {
            const endAt = timestamp + duration;
            const notifications = getNotifications();
            if (!notifications.firstChild) {
                const list = GUI.instance.dialogList;
                notifications.style.height = !(list[0].classList.contains("inactive") && list[2].classList.contains("inactive")) ? "calc(75% - 0.25em)" : "";
            }
            notifications.insertBefore(elm, notifications.firstChild);
            elm.classList.add("inactive");
            _list.sort((a, b) => b.elm.offsetTop - a.elm.offsetTop);
            do {
                await waitForFrame();
                if (Date.now() + 1000 >= endAt || !_pendingNotifications.includes(notification)) {
                    notification.Remove();
                    return;
                }
                const position = findPositionFromBottom(notifications, notification);
                if (position !== false) {
                    _list.push(removeFromPending(notification));
                    elm.style.bottom = position;
                    wait(endAt - Date.now()).then(() => notification.Remove());
                    break;
                }
            } while (true);
        }
        finally {
            LOCK.Unlock(_displayKey);
        }
        elm.style.pointerEvents = "none";
        {
            await GUI.Reflow();
            elm.classList.add("removed");
            elm.classList.remove("inactive");
            await transitionEnded(elm);
        }
        elm.style.pointerEvents = "";
    }

    function displayBrowserNotification(title, options, onclick) {
        if (!document.hasFocus() && NOTIFICATION.browserSupport && BrowserNotification.permission === "granted" && SETTINGS.Get("browser_notifications", false)) {
            try {
                const notification = new BrowserNotification(title, Object.assign({}, _options, options));
                notification.onclick = () => {
                    window.focus();
                    onclick && onclick();
                    notification.close();
                };
                return notification;
            }
            catch (e) {
                if (e.name == 'TypeError') {
                    return false;
                }
            }
        }
        return false;
    }

    function removeFromPending(notification) {
        const index = _pendingNotifications.indexOf(notification);
        index >= 0 && _pendingNotifications.splice(index, 1);
        return notification;
    }

    function findPositionFromBottom(parent, notification) {
        const height = notification.elm.offsetHeight;
        if (_list.length == 0 || parent.offsetHeight - _list[0].elm.offsetTop - _list[0].elm.offsetHeight > height) {
            return 0;
        }
        if (_list[_list.length - 1].elm.offsetTop > height) {
            return `${(1 - _list[_list.length - 1].elm.offsetTop / parent.getBoundingClientRect().height) * 100}%`;
        }
        for (let i = 0; i < _list.length - 1; i++) {
            if (_list[i].elm.offsetTop - _list[i + 1].elm.offsetTop - _list[i + 1].elm.offsetHeight > height) {
                return `${(1 - _list[i].elm.offsetTop / parent.getBoundingClientRect().height) * 100}%`;
            }
        }
        return false;
    }

    function countWords(str) {
        return str.trim().split(/\s+/).length;
    }
})(window);
