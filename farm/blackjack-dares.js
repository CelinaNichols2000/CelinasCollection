const blackjackDares = (() => {
    const favoriteThreshold = 6;
    const fullBookTip = 3;
    const warmups = [
        {
            id: "show-up", name: "Show Up", goal: "Finish 3 hands.", target: 3, chips: 3,
            line: "Three hands already. Damn, you like my attention.",
            matches: () => true
        },
        {
            id: "hold-that", name: "Hold That", goal: "Choose Stand in 2 hands.", target: 2, chips: 3,
            line: "Look at you behaving. That blush is giving you away.",
            matches: hand => hand.action === "stand"
        },
        {
            id: "greedy-hands", name: "Greedy Hands", goal: "Hit without busting in 2 hands.", target: 2, chips: 4,
            line: "You ask for more so damn nicely.",
            matches: hand => hand.hit && hand.total <= 21
        },
        {
            id: "take-two", name: "Take Two", goal: "Win 2 hands.", target: 2, chips: 4,
            line: "Two wins. Lemme see that smug little grin.",
            matches: hand => hand.won
        }
    ];
    const specials = [
        {
            id: "double-dare", name: "Double Dare", goal: "Win a hand after doubling down.", target: 1, chips: 6,
            line: "Twice the bet and you still kept your cool. Hot.",
            matches: hand => hand.won && hand.action === "double"
        },
        {
            id: "natural-trouble", name: "Natural Trouble", goal: "Win with a two-card 21.", target: 1, chips: 7,
            line: "Twenty-one right off the deal? Fuck. That was pretty.",
            matches: hand => hand.won && hand.blackjack
        },
        {
            id: "big-mouth", name: "Big Mouth", goal: "Win 2 hands with 3 or more chips at stake each time.", target: 2, chips: 6,
            line: "You backed up that big mouth. Now I've gotta find something else to tease.",
            matches: hand => hand.won && hand.wager >= 3
        },
        {
            id: "make-her-bust", name: "Make Her Bust", goal: "Win 2 hands when Vesper goes over 21.", target: 2, chips: 5,
            line: "You made me bust twice. Enjoy it. Next hand's mine.",
            matches: hand => hand.won && hand.dealerBust
        }
    ];
    const stamps = [...warmups, ...specials];
    const dayLength = 24 * 60 * 60 * 1000;

    function dayNumber(now = new Date()) {
        return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / dayLength);
    }

    function today(record, now = new Date()) {
        const day = Math.max(dayNumber(now), record?.daily?.day ?? 0);
        const warmup = day % warmups.length;
        const special = (day + Math.floor(day / warmups.length)) % specials.length;
        const progress = record?.daily?.day === day ? record.daily : { day, counts: {}, claimed: [] };
        return { day, progress, dares: [warmups[warmup], specials[special]] };
    }

    function recordHand(record, hand) {
        const { progress, dares } = today(record);
        for (const dare of dares) {
            if (dare.matches(hand)) {
                progress.counts[dare.id] = Math.min(dare.target, (progress.counts[dare.id] || 0) + 1);
            }
        }
        record.daily = progress;
    }

    function claim(record, id) {
        const { progress, dares } = today(record);
        const dare = dares.find(entry => entry.id === id);
        if (!dare || progress.claimed.includes(id) || (progress.counts[id] || 0) < dare.target) return null;

        progress.claimed.push(id);
        record.daily = progress;
        const newStamp = !record.stamps.includes(id);
        if (newStamp) record.stamps.push(id);
        const fullBook = record.stamps.length === stamps.length;
        return {
            dare,
            newStamp,
            promoted: newStamp && record.stamps.length === favoriteThreshold,
            completedBook: newStamp && fullBook,
            tip: fullBook && progress.claimed.length === dares.length ? fullBookTip : 0
        };
    }

    return { favoriteThreshold, stamps, today, recordHand, claim };
})();
