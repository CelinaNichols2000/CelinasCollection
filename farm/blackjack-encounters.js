const blackjackEncounters = (() => {
    const minute = 60 * 1000;
    const nyxPortrait = ["cock/sample_fe8e96138d921b97ff3f3a4e4797f204.jpg", "Nyx in dark briefs with her midriff bare"];
    const guests = [
        {
            id: "sable", title: "Mei's Anal Plug", location: "Mei's booth", color: "#ff9fbe", minutes: 8, cost: "stack", returnChips: 3,
            entrance: "Mei slides in close",
            intro: "Mei drapes herself over the back of your chair, tails brushing your neck, and sets a lipstick-stained glass right against your knuckles. “Mmm, you've been staring at my tits all night and never once bought me a drink~ That's fine, sweetheart. I'll just help myself to a taste of you instead.” Her claw traces slow down your wrist.",
            portrait: ["website/meikitsune.jpg", "Mei, pressed in close against your side"],
            revealArt: ["buttPlug/ass-ezgif.com-gif-to-webp-converter.webp", "Mei's plug form during the reveal"],
            arrival: "You don't get your hand back. POP. Your body shrinks down hard and fast into a plug, and Mei doesn't waste a second — she yanks her panties aside and shoves you straight up her asshole, balls deep, no warning, no lube, just raw forcing your whole body into a tight ring of muscle that clamps down around you immediately. Your face is smashed right against her inner walls, hot and airless, and the smell hits you first — thick, musky, unmistakably her ass — before the taste follows, bitter and filthy, coating you completely. She grinds down on the chair just to feel you get crushed deeper. “Aww, were you using those? Tough luck, slut. Now get comfortable, you're my butt plug for the rest of the night.”",
            opening: "“Look at you. Shoved balls-deep up my ass and loving it already — I can feel you throbbing in there.”",
            memory: "She keeps you rammed up her asshole the entire night, clenching around you between hands just to feel you squirm, grinding her chair into you whenever she's bored. You're crushed tight against her inner walls, smothered in her smell and taste with every clench, and she laughs every time you twitch, knowing you can't escape a second of it.",
            art: [
                ["buttPlug/4dnlj20yr9de1.gif", "Mei's plug in use", "Getting used"],
                ["buttPlug/R (4).png", "The squirming plug form", "Squirmy plug"]
            ],
            meter: "Spell Set",
            phases: ["Freshly hexed", "Plugged and squirming", "Stamped MEI"],
            complete: "Mei pulls you out just enough to flip you over and admires the fresh pink M burned into your base, smeared with her own ass. “There. Now when you slip out of my asshole mid-clench, everybody at this table knows exactly whose plug to shove back in.”",
            actions: [
                ["Wiggle inside her ass", 10, "You squirm weak and pathetic, crushed in deep. Mei just clenches down harder, smothering you tighter against her walls. “That all you've got? Cute.”"],
                ["Breathe in her scent", 16, "There's no air in there that isn't her. Thick, musky, all ass. You choke on it and she grinds the chair harder, moaning. “Smells good on you, doesn't it?”"],
                ["Try to think your way out", 22, "Your thoughts keep sliding off into nothing but heat, pressure, and her taste filling every inch of you. Mei notices you going glassy and giggles. “There it is. Melting already?”"],
                ["Look for your old seat", 28, "Someone else is already in it, chips stacked high. Mei clenches down hard around you. “That one's taken, pretty thing. So are you — crammed up my ass for the rest of the night.”"]
            ],
            aftermath: "Mei keeps your whole stack and tucks the memory away with a wink. The house slides you three pity chips, and you can still taste exactly where you'd just been."
        },
        {
            id: "rook", title: "Rook's Bathroom Bitch", location: "The back hallway", color: "#8adfff", minutes: 12, cost: 2,
            entrance: "Rook clocks your outfit",
            intro: "Rook blocks the aisle with his whole body, eyes dragging slow and hungry down your outfit. “You wore that to a card table? Cute little slut fit. Shame about that mouth of yours.” He rolls a black chip between thick fingers, close enough that you can smell him. Vesper's watching from the table, close enough to hear every word.",
            choices: [
                { label: "Call him all bark, no bite" },
                { label: "Ask Vesper to check his chip", human: true }
            ],
            escape: "Vesper snatches the black chip right out of Rook's fingers before he can use it. “House chips only, handsome.” It lets out one sharp bark in her palm. Rook's jaw tightens, but you're still standing on two legs, still fully clothed, still safe — for now.",
            arrival: "You tell him he's all bark, no bite. Bad move. He flicks the black chip against the felt before the last word even leaves your lips, and it comes out as a whimpering yelp instead. His hand closes around your wrist like a cuff and he drags you straight down the back hallway into the bathroom, slamming the door. He doesn't ask twice — he bends you over the sink, rips what's left of your 'cute little outfit' down around your knees, and fucks you rough and fast while your body warps underneath him, hips narrowing, spine arching into a tight little curve, a tail pushing out right above where he's buried inside you. By the time he finishes, you're barking around his cock, no safeword, no hands, nothing human left to argue with. He clips a leash to your new collar while you're still shaking. “Go on, bitch. Finish what you were saying.”",
            opening: "“Look at that. The mouth still works, just not for talking anymore. Everybody, meet my new bathroom bitch.”",
            memory: "Rook parades you on the leash past every table in the place, tugging you to heel whenever you slow down. He fucks you again in the supply closet just because he can, and nobody so much as blinks — they've all seen this happen before.",
            art: [
                ["dog/dog^5.jpg", "A sequence showing the change into a dog", "Dog transformation"],
                ["website/haunted-farm-night-stockcake.jpg", "The barn where Rook shows off his latest trick", "The barn"]
            ],
            meter: "Collar Hex",
            phases: ["All bark", "Bent over the sink", "Leashed and used"],
            complete: "Rook pins a blue ribbon to your collar and gives your rear one last proprietary smack. “First place, bitch. Stop glaring. We both know you're gonna wag the second I touch you again.”",
            actions: [
                ["Bark your comeback", 10, "You had a whole cutting sentence ready. What comes out is a needy little yip. Rook laughs and slaps your ass. “Try the long version, slut.”"],
                ["Paw at the tag", 16, "It spins just long enough to read: MOUTHS OFF, FUCKED QUIET. Rook flips it back around for the whole hallway to read."],
                ["Follow the leash", 22, "Your hips sway shamefully with every tug. At the end of the hall he makes you stop and present, just so everyone gets a proper look."],
                ["Fetch a dropped chip", 28, "You nose it right between his boots. He crouches down, grabs your chin, and grins. “Good girl. Knew you'd learn fast.”"]
            ],
            aftermath: "Rook finally unclips the leash, still smirking. “There's your chair. Try keeping all four legs — and your legs together — off it this time.”"
        },
        {
            id: "vesper", title: "The Zoo's Newest Monkey", location: "Primate enclosure", color: "#ffba7c", minutes: 2880, cost: 3,
            entrance: "Vesper hates that laugh",
            afterUnwonHand: {
                intro: "You laugh when Vesper clears the cards. She pauses with her hand on the deck. “You're still laughing? Damn. I can find you an audience.” She raises two fingers.",
                opening: "The new placard reads PLEASE DO NOT ENCOURAGE THE MONKEY. Vesper taps it with her nail. “Yeah, that means you. Quit showing off.”",
                memory: "You can't remember what was so funny at the table. You remember Vesper's grin just fine. Every time somebody presses a hand to the glass, you check if it's hers."
            },
            intro: "Vesper slides your winnings across the felt and you can't help but laugh right in her face, loud and smug. The whole table goes dead quiet. She tilts her head, lips curling into something far too calm. “Cute. You were almost bearable for about three seconds, slut. Let's see how funny you are with a tail.”",
            portrait: ["website/sexydealer.jpg", "Vesper behind the blackjack table"],
            arrival: "She snaps her fingers once and your laugh warps mid-breath into a screech, your spine curling forward as fur races down your arms. You claw at the chair and realize, with rising horror, that your hands aren't hands anymore. Snap again. The chair vanishes entirely — you're swinging naked and mindless off a rope behind thick viewing glass, tail twitching, every thought you ever had scattered to nothing. Vesper taps the little placard outside with one manicured nail. “There. They love loud little show-offs in here.”",
            opening: "The new placard reads ONE GOOD HAND. THAT'S ALL IT TOOK. Vesper presses three of your own chips flat against the glass and mouths, slow and cruel, “Still laughing, baby?”",
            memory: "Visitors press their hands to the glass and you mindlessly slap yours back, dumb and eager for the attention. The keeper tosses in a fruit puzzle and you tear into it like an animal, groping yourself shamelessly in front of a crowd of strangers who just assume that's normal monkey behavior. You don't remember the hand you won. You do remember, somewhere far beneath the fog, exactly what Vesper's smile looked like when she snapped.",
            art: [
                ["monkey/monkey^3.jpg", "Three stages of the monkey transformation", "Monkey transformation"],
                ["monkey/monkey^2.jpg", "The before and after of a second monkey transformation", "Alternate art"],
                ["website/sexydealer.jpg", "Vesper at the blackjack table", "Vesper"]
            ],
            meter: "Zoo Routine",
            phases: ["New arrival", "Crowd favorite", "On the exhibit sign"],
            complete: "The keeper nails up a second sign: PLEASE DO NOT PLAY CARDS WITH THE MONKEY. Vesper snaps a photo and sends it straight to the group chat with a laughing emoji.",
            actions: [
                ["Rattle the viewing glass", 10, "Your palm slaps the glass. A visitor presses theirs up to match, delighted. You wanted a fight. They think you're flirting."],
                ["Climb away from the crowd", 16, "You scramble to the top rope in one desperate swing, bare ass on full display. The whole crowd cheers and points. So much for hiding."],
                ["Work the fruit puzzle", 22, "You crack it open in seconds, groping yourself the whole time without realizing it. The keeper writes CLEVER on the sign. Vesper adds FOR A MONKEY, AND A SLUTTY ONE AT THAT."],
                ["Try to glare at Vesper", 28, "She waits patiently until your screeching tantrum finishes, then claps exactly once, slow and mocking. “There it is. Even uglier now, somehow.”"]
            ],
            aftermath: "Days later, Vesper finally snaps you back into your chair, bare and disoriented. “Two days as a zoo attraction. Still feel like laughing at me, baby?”"
        },
        {
            id: "ivy", title: "Ivy's Lucky Chip", location: "The cash-out tray", color: "#bd9cff", minutes: 6, cost: 1,
            portrait: ["catsuit/sample_e2ba467d6bb1295c8b6c3c63b19c003b.jpg", "Ivy at the blackjack table"],
            entrance: "Ivy asks what you're worth",
            intro: "Ivy drags her eyes over your stack, then over your body, lingering exactly where she shouldn't. “This much for the chips. How much for the mouthy little thing holding them, hm?” She presses a black chip flat into your palm and closes your fingers around it, nails digging in just enough to hurt.",
            arrival: "You try to let it drop. Your fingers flatten and spread instead, enamel racing up your skin in a wave of cold, tingling pleasure that leaves you gasping. Clack. You're nothing but a chip now, one side stamped IVY, the other stamped SPEND ME in dripping gold letters. She flips you face up between two fingers and studies your frozen, horrified little expression. “One chip. Honestly? Generous valuation for a used-up slut.”",
            opening: "One side says IVY. The other says SPEND ME. She slides you face-down into the middle of a thick stack, pressed tight between strangers' winnings. “Nice and snug in there. Try not to come just from all that friction, yeah?”",
            memory: "Every time Ivy places a bet you brace yourself, hoping you're not the chip she slides forward to be fondled by some stranger's grubby hands. She keeps you just below the top on purpose — she knows exactly how much that drives you crazy.",
            art: [
                ["inanimate/0126__by_shapeowl_dlrg80b-pre (1).jpg", "Your form as Ivy's chip", "Chip form"],
                ["inanimate/bafkreid6kzvnncbptgnzrqr2zw7meunzg4qavskngmtenaqdsmaitbowvy.jpg", "Alternate artwork of Ivy's chip transformation", "Transformation"]
            ],
            meter: "House Stamp",
            phases: ["Still warm", "In the stack", "House currency"],
            complete: "Ivy turns you over slowly. The letters on your rim have sunk in deep and permanent. “There. Now you even sound like money when I drop you between my thighs.”",
            actions: [
                ["Rock the stack", 10, "You manage to make the top chip wobble. Ivy settles it with one slow, deliberate nail-stroke right across your face. “That's a lot of effort for one pathetic clack.”"],
                ["Listen to the bets", 16, "Someone asks how much you're worth. Ivy purrs, “One chip, but she used to be a whole lot more fun underneath me.” You hear them laugh."],
                ["Tilt toward the tray", 22, "You almost roll free. She catches you edge-on between two fingers and grinds you slow against her palm. “Aw. Trying to cash yourself out of me? Cute.”"],
                ["Watch your own face get spent", 28, "Ivy lays you face up right beside the wager so everyone gets a long, good look at your ruined, humiliated expression."]
            ],
            aftermath: "Ivy flips you back into your seat, panties soaked, smirking down at you. “Check your pockets, slut. I kept the real chip — and your dignity.”"
        },
        {
            id: "moth", title: "The Deck's New Queen", location: "Emma's card case", color: "#ffb0e5", minutes: 10, cost: 2,
            entrance: "Emma's deck is one card short",
            portrait: ["website/fem.png", "Emma at the blackjack table"],
            intro: "Emma fans out a deck right under your nose, slow and deliberate. An ordinary queen lies face up on the felt, but she offers you a blank card instead, pressing it against your palm. “Touch that one for me. I wanna watch exactly how wet you get when the ink takes hold.” A thumbprint is already smoking, hot, against the paper.",
            choices: [
                { label: "Slide over the queen on the felt", human: true },
                { label: "Tap the blank card" }
            ],
            escape: "The ordinary queen slides smoothly into the empty slot just in time. The deck snaps shut right on Emma's thumb. “Oh, you little shit.” You flex both hands slowly where she can see every finger, safe.",
            arrival: "Your fingertip comes away slick and gold. The ink crawls up your arm like a tongue, pulling you flat from your shoulders down to your toes in one long, unbearably intimate wave that feels like being licked all over at once. Emma pinches your corner between two fingers and slides you snugly into the deck between two strangers' cards. “Gorgeous face. Flat little mouth. Best queen I've had all night, and the moaning was a nice touch.”",
            opening: "You can still see, dimly, out of both painted faces. Emma holds you up high for the whole table. “Look at her. I kept that stupid, desperate little expression on both sides.”",
            memory: "She likes to deal you face up and wait, grinning, for someone at the table to recognize who you used to be. Every shuffle presses you flush against strangers' cards, over and over, a slow and endless grind you can't escape or even complain about.",
            art: [
                ["inanimate/dn15n4e-f517c407-5532-4e51-afee-ba088c43d68c.png", "Your new form as Emma's playing card", "Face"],
                ["inanimate/sealed_shifu_by_sharjeneva_dkjd8zu-414w-2x.jpg", "Alternate artwork of a figure sealed in a card", "Sealed in the card"]
            ],
            meter: "Wet Ink",
            phases: ["Fresh print", "In the deck", "Queen of spades"],
            complete: "The gold ink finally sets. Emma curls one corner of your card teasingly and watches you spring right back into shape. “Perfect. Now I can shuffle you as rough as I like, all night long.”",
            actions: [
                ["Curl away from the felt", 10, "Your corner lifts weakly. Emma presses it flat without even looking, fingers lingering too long. “Stay flat, gorgeous. That's your whole job now.”"],
                ["Peer between the cards", 16, "Your neighbors are a jack and a nine, pressed just as tight against you. The jack wears the same ruined, shocked expression you do."],
                ["Count the shuffles", 22, "You lose count the moment your two painted faces seem to blur together into one long moan. Emma asks, delighted, if you're finally dizzy enough to enjoy it."],
                ["Get dealt face up", 28, "A player squints hard at your face. Emma grins wide. “Yeah. That's exactly who you think it is. She used to talk so much, too.”"]
            ],
            aftermath: "Emma deals you backward right out of the deck, breathless and trembling. It takes you a long, humiliating moment to remember how to even stand."
        },
        {
            id: "finch", title: "Laura's Drinking Glass", location: "On the blackjack table beside Laura", color: "#9de8d4", minutes: 9, cost: 2,
            entrance: "Laura wants her drink",
            portrait: ["website/6ebc3e97962295fe8233f858f68d3ab8.png", "Laura with red horns, gold hoops, and a glossy black top"],
            intro: "Laura slides into the seat next to you, gold hoops swinging under her red horns. She catches you looking at her shiny black top and taps the table with a bar spoon. “Eyes up, sweetheart. Hand me that empty glass.” She nudges it toward you with the spoon, keeping her fingers off the rim.",
            choices: [
                { label: "Pick up the empty glass" },
                { label: "Push it back with the spoon", human: true }
            ],
            escape: "You slide it back with the spoon. The spoon goes clear and chimes against the felt. Laura picks it up with a napkin and gives you a look. “Fine. Keep your hands. I only needed one glass anyway.”",
            arrival: "Your fingers lock around the rim. Your feet spread into a flat base and your little figure hardens around the stem, arms stuck holding the bowl. Laura slips a coaster under you, fills you up, and takes a sip. “There. You wanted to be close. Now you get to stay right here.”",
            opening: "Laura plays her next hand with you on a coaster by her elbow. She picks you up for another sip and catches your face in the glass. “Still glaring? Cute. Hold that while I finish my drink.”",
            memory: "You hear someone compliment her glass. Laura rotates you until they can see your face molded into the stem. “Thanks. Picked it up from the seat beside me.” She takes another sip while they're still looking.",
            art: [
                ["inanimate/glass.jpg", "A drinking glass supported by a figure on its stem", "Your form"],
                ["inanimate/1703884196.nixxie-jenny_zaraglass2023-12-28.jpg", "A figure holding the bowl of a filled champagne glass", "Way more fitting"]
            ],
            meter: "Glass Set",
            phases: ["Fresh glass", "On her coaster", "Laura's usual"],
            complete: "Laura finishes the last sip and sets you right back on her coaster. The base clicks flat. “Perfect. Same again. Put it in this one.” She says it like you've been her glass all night.",
            actions: [
                ["Clink against the coaster", 10, "You manage one little clink. Laura glances down. “Yeah, I know you're empty. Let me finish my damn hand.”"],
                ["Look through your own base", 16, "Everything's upside down from in here. You spot your old chair, already filled by somebody else."],
                ["Try to fog the glass", 22, "A little cloud appears where your face meets the bowl. Laura wipes it off with her thumb. “Nice try. I like seeing you make that face.”"],
                ["Try to lean away", 28, "The stem tips a fraction. Laura straightens you, takes another sip, and sets you down closer. “Where the hell do you think you're going? You're my glass.”"]
            ],
            aftermath: "Laura takes one last sip and taps your coaster. Your hands hit the felt as you unfold into your chair. “Want another round? I know what I'm drinking out of.”"
        },
        {
            id: "nell", title: "Nell's Tip-Jar Frog", location: "The bar's glass tip jar", color: "#b7e983", minutes: 7, cost: 2,
            entrance: "Nell wants to hear you croak",
            intro: "Nell drops a wet copper coin right onto your cards without asking. “You talk a lot for somebody who's never tipped me once.” You try to snap back at her. She's already flipping the coin before you finish the sentence.",
            arrival: "Your chair shoots out from under you as your whole body lurches, skin going slick and green, your toes splitting wet and webbed inside your shoes. Your sharp little comeback comes out as one loud, wet croak instead. Nell scoops you up by the legs and drops you straight into the tip jar, your chips clattering down right on top of you. “There. Everybody finally heard you say something useful.”",
            opening: "Nell holds the jar up to eye level, swirling you around inside it just to watch you scramble. “Go on, gorgeous. Give the next customer that big clever speech you had ready.”",
            memory: "She parks the jar right where sweaty hands set their drinks down, inches from your face. Every time a tip drops in, the whole bar laughs at you scrambling out of the splash, slimy and humiliated.",
            art: [
                ["animal/frog_transformation___commissions_open_by_ladykraken_djlciib-fullview.jpg", "The curse turning a player into a frog", "Frog transformation"],
                ["inanimate/glass.jpg", "The glass on Nell's counter", "The counter"]
            ],
            meter: "Frog Curse",
            phases: ["Fresh croak", "At the bottom", "House tip jar"],
            complete: "Nell sticks a label to the glass: TIPS HERE. The next player leans in and asks, dead serious, if the frog takes card payments.",
            actions: [
                ["Croak at Nell", 10, "Nell presses a finger to her lips, smirking. “Inside voice, slut. You're in glass.”"],
                ["Hop for the rim", 16, "Your webbed feet slap uselessly against the glass. You slide right back down into the coins in full view of the whole bar."],
                ["Shove the chips aside", 22, "One chip is nearly as wide as your whole body. Nell taps it through the glass. “You used to bet those like they mattered.”"],
                ["Stare down the next customer", 28, "The customer drops a copper right on your head. “Good frog.” Nell nearly chokes on her drink laughing."]
            ],
            aftermath: "Nell tips the jar sideways and you spill out human again, naked and gasping, pockets lighter and voice still cracking on every word."
        },
        {
            id: "maris", title: "Maris's Shelf Trophy", location: "The prize cabinet", color: "#f2b9a1", minutes: 11, cost: 3,
            entrance: "Maris measures you up",
            intro: "Maris opens the prize cabinet, studies the empty space inside, then studies your body with the exact same hungry, clinical stare. “Hand on your hip. Yeah, that stupid little pose you keep striking all night, thinking it makes you look confident.” Before you can even move, she presses a brass nameplate flat against the edge of your chair.",
            arrival: "The nameplate clicks against your skin and the lacquer hits you all at once, a thick, suffocating heat pouring over every inch of your body as your feet fuse solid to a stand and your fingers lock helplessly against your hip. Your clothes seal shut under the glossy coat as the cabinet rushes up to swallow you whole. Maris sets you directly under the hottest display light, admiring the finish. “Look at you. All dressed up, dripping, and finally, blessedly quiet.”",
            opening: "The tag reads MARIS'S TROPHY. She leaves the price blank on purpose, so every single player who walks by gets to ask out loud exactly what she'd take for you.",
            memory: "You're posed so you can watch your old chair fill up through the cabinet glass, someone else's chips stacking where yours used to sit. Visitors press their faces close to study the frozen, desperate look on yours, and Maris never tires of narrating exactly how you ended up there.",
            art: [
                ["figurine/on_a_shelf__figurine_tf_tg__by_cliptf_dfrfime-pre.jpg", "A player being reduced to a shelf figurine", "Figurine transformation"],
                ["website/haunted-farm-night-stockcake.jpg", "The barn that holds the prize cabinet", "The barn"]
            ],
            meter: "Lacquer Set",
            phases: ["Fresh coat", "Set on display", "Cabinet trophy"],
            complete: "Maris adds a little gold star to your nameplate and gives the glass one last proud tap. “Best in the whole cabinet. You can stop glaring now, we both know you'd melt the second I touched you.”",
            actions: [
                ["Try to drop the pose", 10, "Your hand stays glued to your hip, lacquer gleaming. Maris nudges your stand with one finger. “Oh, I know. You'd kill to move that hand somewhere else, wouldn't you.”"],
                ["Read the price tag", 16, "Somebody penciled in MAKE AN OFFER, FIGURE'S FLEXIBLE. Maris says that's already more generous than your last bet ever was."],
                ["Glare through the glass", 22, "A visitor leans in close to inspect your frozen eyes. “That desperate little frown is painted on?” Maris grins wide. “Sure. Let's call it that.”"],
                ["Listen to the bidding", 28, "Someone offers three chips for you. Maris laughs. “Barely covers the chair I pulled her off of, honestly.”"]
            ],
            aftermath: "Maris finally peels off the nameplate. Your knees buckle the instant you can bend them again, right in front of everyone who'd just been bidding on you."
        },
        {
            id: "cinder", title: "Cinder's Back-Stall Toilet", location: "The stall at the end of the hall", color: "#b7dfdb", minutes: 9, cost: 2,
            entrance: "Cinder needs a new toilet",
            intro: "Cinder drops a dirty OUT OF ORDER sign on your cards. “That mouth's been running all night. I finally found something useful to do with it.” She flips the sign over. Your seat number is already written on the back.",
            arrival: "Your jaw drops and keeps going. Porcelain spreads from your teeth, rounding your mouth into a bowl while your knees fuse into a squat little base. The next thing you feel is cold tile. Cinder lifts your new seat with the toe of her boot. “Look at you. The stall nobody cleans finally got an upgrade.” She pulls the door wide open.",
            opening: "Cinder crosses out OUT OF ORDER and writes GO AHEAD. Then she dumps the slop from her table into you. “Hold that, sweetheart. The refill's coming.”",
            memory: "There are wet paper towels stuck under your rim. A line forms outside your door. Cinder tells the people waiting exactly which player they're lining up for.",
            art: [
                ["inanimate/tf_tg_toilet_part_2__by_fucktoy695_deslqs0-414w-2x.jpg", "A comic sequence showing a figure becoming a toilet", "Toilet transformation"],
                ["website/haunted-farm-night-stockcake.jpg", "The barn that houses Cinder's back stall", "Outside the stall"]
            ],
            meter: "Plumbing Lock",
            phases: ["Fresh porcelain", "Bolted down", "Back in service"],
            complete: "Your base clicks into the floor. Cinder scratches your name into the cistern and flushes you once for the people watching. “There. Now they know which one to use.”",
            actions: [
                ["Try to close the lid", 10, "You get it halfway. Cinder props it right back up. “Open. You managed it all night at the table.”"],
                ["Rattle the pipes", 16, "All you get is a hollow burp behind the wall. Somebody in line laughs. “Oh, that one's still awake.”"],
                ["Try to spit out the slop", 22, "The bowl bubbles. Cinder waits until you've swallowed it back down before she tips in the rest of her glass."],
                ["Read the writing inside the door", 28, "Someone's added a tally marked TIMES FLUSHED. Cinder puts another mark on it while looking straight at you."]
            ],
            aftermath: "Cinder tears the sign off the door. You come back on the cold tile with your cheek against the floor. “Up you get. I need to mop.”"
        },
        {
            id: "rue", title: "Rue's Leaky Trash Can", location: "The service alley behind the bar", color: "#bfda91", minutes: 10, cost: 2,
            entrance: "Rue needs somewhere to put the trash",
            portrait: ["website/8b7095d624b683c15983541d790d3efd0f8f2ac7.png", "Rue at the blackjack table"],
            intro: "Rue nudges a bent bin lid toward you with a broom handle. There is something wet dripping off the edge. “Catch, gorgeous. Wouldn't want that all over your nice outfit, would we?” She takes another step back.",
            choices: [
                { label: "Catch the lid before it hits you" },
                { label: "Knock it into the bin with the broom", human: true }
            ],
            escape: "The lid clips the broom instead. The wood crumples into a dented little bin and lands on its side. Rue looks down, then back up at you. “Fine. The broom can hold my trash tonight. Keep your hands to yourself next time.”",
            arrival: "The lid clamps onto your fingers. Metal swallows your arms and rounds your ribs into a dented cylinder. Your feet fold into a base that leaks the second Rue pours in a tray of old drinks. She drags you out by the handle. “Fuck, you're loud when you're empty. I'll fix that.”",
            opening: "Rue leaves your lid crooked so people can toss things in without touching you. “You were taking up a seat inside. This is the spot you've earned.”",
            memory: "You can hear the games through the back door. The only player who comes out to see you is holding a dripping bag by the corners.",
            art: [
                ["inanimate/trash_can_tf_by_dastanprince_dg5119y-414w-2x.jpg", "A sketch sequence of a person turning into a trash can", "Trash can transformation"],
                ["inanimate/dgtdyh7-183154c4-57dd-4b4e-8ebd-7b374649fccb.jpg", "Alternate artwork for Rue's trash-can fate", "Finally Useful"]
            ],
            meter: "Scrap Lock",
            phases: ["Dented", "Half full", "Collection only"],
            complete: "Rue ties a fresh bag over the top of you. “There. You used to make a face when anything gross got near you. Good thing I don't need to see it anymore.”",
            actions: [
                ["Bang the lid for help", 10, "Rue hears one metallic clunk and puts a brick on top. “That's enough out of you.”"],
                ["Lean away from the bag", 16, "You tip just far enough for the wet paper to slide under your rim. Rue rights you by the handle. “I said hold it.”"],
                ["Try to roll back inside", 22, "Your base scrapes an inch across the concrete. Someone opens the door, looks straight at you, and comes back with more rubbish."],
                ["See who dumped the last drink", 28, "It's the player in your old seat. They wipe their hands on the outside of you and walk back in before you can make a sound."]
            ],
            aftermath: "Rue lifts the lid. You unfold onto the concrete. She hands you a bag with the bottom leaking. “Might as well take that with you.”"
        },
        {
            id: "kit", title: "Kit's Filthy Door Mat", location: "The muddy threshold outside the barn", color: "#e6b2dd", minutes: 8, cost: 1,
            entrance: "Kit checks the tread on her boots",
            portrait: ["heels/just_part_of_her_boot_by_pocojee_dev81ld-414w-2x.jpg", "Kit seen from below with her boot sole in the foreground"],
            intro: "Kit catches you looking down at her boots. She lifts one heel just high enough for you to see the muck packed in the tread. “You can keep staring. You're about to get a much better look.” She swings a brass WIPE HERE plate off the coat hook. It pulls toward the floor like a magnet.",
            choices: [
                { label: "Grab the plate before she drops it" },
                { label: "Nudge it onto the old mat with your shoe", human: true }
            ],
            escape: "The plate hits the old mat. The mat scoots under Kit's boot and curls up around the heel. She kicks it flat. “All right, clever. Go take your seat before I find a second plate.”",
            arrival: "The plate sticks to your palms and yanks you face down. Your shoulders flatten. Your fingers split into coarse bristles across the doorway. Kit steps straight onto your new face, twists her heel, and grinds half the yard into you. “That's better. Everybody else can get theirs clean now too.”",
            opening: "Your old seat is about ten steps away. Kit tells the next player to wipe both feet before they go claim it.",
            memory: "Every pair of boots leaves a different mark. Kit can tell which ones are hers without even looking. She always gives you two extra scrapes on the way back in.",
            art: [
                ["inanimate/1670690880.witchforhire_doormatas.png", "A figure flattened into a doormat across several panels", "Door mat transformation"],
                ["heels/just_part_of_her_boot_by_pocojee_dev81ld-414w-2x.jpg", "A close-up of Kit's boot sole from your point of view", "Your POV"]
            ],
            meter: "Bristle Lock",
            phases: ["Pressed flat", "Mud packed", "Wipe here"],
            complete: "The words WIPE HERE sink through your bristles. Kit opens the door wide and shouts into the bar. “There. Now even the drunks know what you're good for.”",
            actions: [
                ["Lift a corner of yourself", 10, "You just get it off the floor before Kit pins it under her heel. “Stay flat. I don't feel like tripping over you.”"],
                ["Try to shake the mud loose", 16, "One clump comes free. Kit sees it and scrapes the other boot twice as hard. “Oh, good. You've got room for more.”"],
                ["Look up at the next customer", 22, "They see your eyes in the mat and stop. Kit says, “Yeah, it can see you. Go ahead.” The boot comes down anyway."],
                ["Count the treads across your face", 28, "You lose count at the door rush. Kit points at the darkest print. “That one's mine. Put some effort into remembering it.”"]
            ],
            aftermath: "Kit peels the brass plate up. You come back face down in a perfect outline of mud. She nudges you aside with her boot. “Door's still in use, sweetheart.”"
        },
        {
            id: "luxe", title: "Luxe's Black Lace", location: "The mirror in Luxe's booth", color: "#f1a1bf", minutes: 9, cost: 2,
            entrance: "Luxe catches you staring",
            portrait: ["website/77fef9362509bd31e11af6f9b99e2a4f8587bd08.png", "Luxe at the blackjack table"],
            intro: "Luxe undoes the top button of her jacket while she counts your chips. You forget what number you were on. She catches it right away. “Oh, honey. You were doing so well pretending you were looking at my hands.” She slips a black lace ribbon around your wrist.",
            arrival: "The ribbon tightens. Your arms stretch into thin straps, and your ribs fold into two black lace cups. The clasp clicks before you can reach for it. Luxe holds you up to the mirror and grins. “Damn. You do look better on me.”",
            opening: "Luxe slips you on and leaves the jacket open. “All that staring you did, and now everybody's staring at you. Enjoy it, sweetheart.”",
            memory: "She wears you back to the table and puts your two chips down like nothing happened. You can hear the player opposite her forget what they were saying.",
            art: [
                ["bra/sample_693175a6ac765f5f7f312a1742f174fd.jpg", "Your form as Luxe's bra", "Lace form"],
                ["bra/daqlup6-07581b80-81d0-4239-8f8d-d285c79cfd4c.gif", "Luxe's bra moving as she wears it", "Jiggle"]
            ],
            meter: "Lace Lock",
            phases: ["Fresh lace", "Clasp shut", "Fitted to Luxe"],
            complete: "Luxe checks the fit under the mirror light, then shakes her hair back so the straps show. “Perfect. You can stop pretending this isn't the attention you came for.”",
            actions: [
                ["Pull against the clasp", 10, "The clasp ticks once. Luxe puts a finger over it before it can move again. “Already coming undone? Cute.”"],
                ["Peek out past the jacket", 16, "Luxe catches the lace lifting and opens her jacket another inch. “There. Now everybody gets a good look at you.”"],
                ["Listen for your name", 22, "Someone asks where she got the lace. Luxe tells them your name and lets them wonder why she's smiling."],
                ["Try to slip a strap", 28, "One strap slides off her shoulder. She tugs it back into place without taking her eyes off the dealer. “Stay put, flirt. I'm winning.”"]
            ],
            aftermath: "Luxe undoes the clasp. You drop back into your seat while she's still smiling at the mirror. “There you go. Try counting my chips this time.”"
        },
        {
            id: "mina", title: "Cerya's Kiss-Red Lipstick", location: "Cerya's vanity beside the bar", color: "#ff8eaa", minutes: 7, cost: 2,
            entrance: "Cerya wants a shade that lasts",
            portrait: ["website/cccfa14a8e52d9dcdb8103992f70c51e.jpg", "Cerya"],
            intro: "Cerya sets a silver compact next to your stack and turns her bare lips toward the light. “See anything you'd like to fix, smartass?” A stripe of red keeps creeping across the wax in her open lipstick case. In the compact's reflection, the stripe is still.",
            choices: [
                { label: "Pick up the lipstick case" },
                { label: "Turn the compact toward the wax", human: true }
            ],
            escape: "The compact catches the moving stripe and pins it in place. Cerya clicks the case shut. “Oh, you saw that? Fine. You can keep being the one who blushes.” She takes the compact back with a little wink.",
            arrival: "The case snaps shut around your thumb. Red wax creeps up your arm, pulling you into the tube until there's just enough of you sticking out for Cerya to twist. She paints her lips with one slow swipe and checks the color. “That's the shade your face used to go when I called you pretty.”",
            opening: "Cerya presses a red kiss onto the back of her losing card and sends it around the table. “Careful with that. It's somebody's big moment.”",
            memory: "She reapplies you in front of anybody who asks about the color. Nobody gets to find out why she calls it by your name.",
            art: [
                ["inanimate/lipsticktf.jpg", "Transformation art showing a figure set into a lipstick tube", "Lipstick form"],
                ["inanimate/_event__11___mischa___lipstick_by_luxianne_ddbbfrq-414w-2x-fotor-20241031105931.png", "A close-up of lips and vivid red lipstick", "Cerya's shade"]
            ],
            meter: "Color Set",
            phases: ["Wet wax", "Kiss red", "Cerya's signature"],
            complete: "Cerya signs the mirror in your shade, checks her lips one last time, and caps you. “Good. It takes a lot to make me want to keep using the same one.”",
            actions: [
                ["Lean away from the mirror", 10, "The tube rolls a fraction. Cerya stops it with a nail. “Stay. I wanna see if you get any redder.”"],
                ["Try to twist back down", 16, "You sink into the tube until Cerya twists you straight back up. “There you are. You get shy at the funniest times.”"],
                ["Watch your shade on her glass", 22, "A clean red print stays when Cerya takes a sip. She turns it toward you. “See? You can make an impression when you behave.”"],
                ["Listen to the table gossip", 28, "Someone says the new color suits her. Cerya answers, “I picked it out myself. Took it right off the chair beside me.”"]
            ],
            aftermath: "Cerya twists the tube shut. You land back on your stool and catch the red print on her glass. “Go on. Say you missed me.”"
        },
        {
            id: "nyx", title: "Nyx's Fat Cock", location: "The velvet booth at the back", color: "#edc889", minutes: 10, cost: 3,
            entrance: "Nyx wants a bigger bulge",
            portrait: nyxPortrait,
            revealArt: nyxPortrait,
            intro: "Nyx leans against the table right next to you, bare stomach and dark briefs right at eye level. You look down. She catches it. “Yeah, I saw that. Go on, stare a little longer. See what fucking happens.”",
            choices: [
                { label: "Keep staring at her bulge" },
                { label: "Keep your eyes on your cards", human: true }
            ],
            escape: "You keep your eyes on the hand until the dealer asks if you're hitting or standing. Nyx sighs right into your ear. “Fine. Keep your seat. I saw you peek the first time.”",
            arrival: "One more look. SLUURRRP. Your chair scrapes back empty. You get pulled straight into the bulge you couldn't stop staring at. By the time Nyx straightens her waistband, you're her cock. She looks down and laughs. “Oh, fuck. Look how big you got. Still wanna stare?”",
            opening: "Nyx waits by your empty chair until somebody asks where you went. “Go on, sweetheart. Tell them what you were staring at.” She grins through the silence.",
            memory: "You hear the dealer ask who wants your seat. Nyx pushes it toward the next player with her foot. “Take it. This one won't need it for a while.”",
            art: [
                ["cock/0206a1481577010.kaeaskavi_limactf.jpg", "Illustration of the cock transformation", "Cock transformation"],
                ["cock/9e7dc530ea4978a8a71301a5703cbedc-sample.jpg", "Artwork of your new look after the transformation", "Your new look"]
            ],
            meter: "Body-Part Hex",
            phases: ["Fresh change", "Part of Nyx", "Set in place"],
            complete: "You stop feeling that little tug back toward your chair. Nyx takes one look at where you used to sit and laughs again. “You needed that much help keeping your eyes to yourself? Pathetic.”",
            actions: [
                ["Try to talk back", 10, "You have a whole comeback ready. Nothing comes out. Nyx smiles down at you. “Weird. You had so much to say before.”"],
                ["Try to pull away", 16, "Nyx shifts her weight and you move with her. “Get used to it, sweetheart. That's my body you're trying to walk off with.”"],
                ["Listen for your name", 22, "Nyx says it just loudly enough for you to hear, then asks the dealer to deal to her alone."],
                ["Try to stay by the table", 28, "Nyx turns to leave and you go with her. She glances back at where you sat. “Cute. Still think you get to decide where you sit?”"]
            ],
            aftermath: "Nyx snaps her fingers. Your chair catches you sideways, hands flat on the felt. “Eyes up next time. I already know what you're like.”"
        },
        {
            id: "zara", title: "Zara's New Vagina", location: "The queen's booth behind the table", color: "#f3a9ce", minutes: 10, cost: 3,
            entrance: "Zara says you're getting too close",
            portrait: ["pussy/355959315.jpg", "Zara's opening portrait"],
            intro: "Zara catches you looking her up and down while she's trying to count. “You want my attention that badly? Cute.” She drops a queen face down on your wager. Her initials are moving on the back of the card. Zara keeps her own fingers well clear.",
            choices: [
                { label: "Turn the queen over with another card", human: true },
                { label: "Pull the queen off your stack" }
            ],
            escape: "The queen flips over and steals the little ink drawing off your other card. Zara scoops both up. “Fine. I was after the smart mouth, but I can work with a jack.”",
            arrival: "The initials jump into your palm. The room blinks out as your whole body folds out of shape. When you can think again, Zara is straightening her dress in the booth mirror. You're her vagina now, part of her body. “There. You can stop asking to sit closer.”",
            opening: "Zara walks back to the table and takes your chips with her. Somebody asks if you stepped out. She pulls her chair in. “They're right where I put them.”",
            memory: "You can still hear the game every time she laughs. She says your name only once, to the dealer, who clears the cards from your empty spot.",
            art: [
                ["pussy/09e5b7d99a5cf8d896bf55935bab2173.png", "Artwork of Zara's transformation", "Transformation"],
                ["pussy/38392.gif", "An animated view of your new form", "Your new look"]
            ],
            meter: "Body-Part Hex",
            phases: ["Fresh change", "Part of Zara", "Set in place"],
            complete: "The pull toward your chair goes quiet. Zara catches herself smiling and deals her cards a little closer to her side. “All that attitude, and now I get to do the talking.”",
            actions: [
                ["Try to ask for your chips", 10, "You have the words ready. Zara spends the first chip before you figure out how to make a sound. “Too slow, sweetheart.”"],
                ["Try to pull away from Zara", 16, "She crosses one leg over the other and your whole point of view shifts with her. “Getting the idea yet?”"],
                ["Listen for your empty seat", 22, "The next player asks if the seat's taken. Zara pulls it out for them with her foot. “Go ahead. I've got company.”"],
                ["Wait for her to say your name", 28, "You hear it under her breath when she wins. She makes you wait a beat. “There, you get some credit. The chips are mine.”"]
            ],
            aftermath: "Zara slides the queen away and your hands come back flat against the felt. “Your seat's over there. Ask before you get close to mine again.”"
        },
        {
            id: "remy", title: "Remy's Private Blow-Up Doll", location: "Remy's booth behind the curtain", color: "#ffa4bd", minutes: 8, cost: 2,
            entrance: "Remy likes what she sees",
            portrait: ["cock/9af6e719abe10946e05c03fa21ffca451192bada.jpg", "Remy, the futa demon at the blackjack table"],
            intro: "You stand up to leave. Remy, the futa demon at the end of the table, looks straight at your ass. “Damn. Turn around again.” You glance back. She's already got a spark on her fingertip. “Cute ass. Think I'll keep it.”",
            arrival: "ZAP. Your chair goes over. A seam zips down your side, your hands stiffen into molded vinyl, and you puff up all at once. Remy catches you around the waist before you bounce off the floor. She turns you to face the table. “Look at that. I even got the dumb little look you gave me.”",
            opening: "Remy carries you straight to her booth and props you beside her. Someone asks if the doll's a prize. “It's my sex doll. Get your own.” She pulls the curtain shut.",
            memory: "Your shoes are still under the blackjack table. You hear someone ask if you're coming back for them. Remy sticks her head out. “Do they look like they're walking anywhere?”",
            art: [
                ["blow_doll/victem12.png", "Your inflated doll form after Remy's zap", "Blow-up doll form"],
                ["blow_doll/1613492313.luxianne_lilah.png", "Illustrated stages of the transformation into an inflatable doll", "Transformation"]
            ],
            meter: "Vinyl Set",
            phases: ["Soft vinyl", "Fully inflated", "Remy's private doll"],
            complete: "The last wrinkle in your vinyl pulls flat. Remy checks the valve, hears it click, and grins. “There you go. Cute ass, honest-to-God useless mouth. Exactly what I ordered.”",
            actions: [
                ["Try to talk back", 10, "Your mouth stays stuck in the same rubber pout. Remy grins. “You wanna repeat that? I only heard a little squeak.”"],
                ["Reach for your valve", 16, "Your hand folds halfway and springs straight again. Remy presses the cap flat with her thumb. “Don't you dare go floppy on me.”"],
                ["Try to turn away from her", 22, "You manage to tip sideways. Remy catches you with one hand and props you up facing her again. “I said turn around once. Now hold still.”"],
                ["Listen at the curtain", 28, "Someone outside says your name. Remy sticks her head out. “Yeah, they're with me.” She lets the curtain fall before you can squeak."]
            ],
            aftermath: "Remy pops the valve. You sag into the booth seat, then your hands come back and grab the edge. “Shoes are still under your chair, doll. Go get them.”"
        }
    ];

    const previewKey = "farmBlackjackEncounterPreview";

    function guestOptions() {
        return guests.map(({ id, title }) => ({ id, title }));
    }

    function getGuest(id) {
        return guests.find(guest => guest.id === id);
    }

    function guestForScene(scene) {
        const guest = getGuest(scene?.guest);
        return scene?.unwonHand && guest?.afterUnwonHand ? { ...guest, ...guest.afterUnwonHand } : guest;
    }

    function restore(saved) {
        const { quietHands = saved?.charge ?? 0, lastEscaped = null, fate, scene } = saved || {};
        // Legacy "seen" lists included encounters the player escaped. Only keep confirmed fates.
        const history = Array.isArray(saved?.completed) ? saved.completed : [];
        const completed = [...new Set(history.filter(getGuest))];
        const record = { quietHands, completed, lastEscaped, fate: null, scene: null };

        // Older saves used a single scene object for both offers and timed forms.
        const activeForm = getGuest(fate?.guest || scene?.guest);
        if (activeForm && (fate || scene.stage === "form")) {
            record.fate = fate || { guest: activeForm.id, startedAt: scene.until - activeForm.minutes * minute, until: scene.until, lost: null };
            if (!completed.includes(activeForm.id)) completed.push(activeForm.id);
            return record;
        }
        if (activeForm && ["offer", "approach", "human", "transform"].includes(scene.stage)) {
            record.scene = scene.stage === "offer" ? { guest: scene.guest, stage: "approach" } : scene;
        }
        return record;
    }

    function ambush(record, won) {
        if (record.fate || record.scene) return;
        record.quietHands = Math.min(9, record.quietHands + 1);
        const chance = record.quietHands === 1 ? 0.12 : record.quietHands < 4 ? 0.24 : 0.33;
        if (record.quietHands < 9 && Math.random() >= chance) return;

        if (record.completed.length === guests.length) record.completed = [];
        const remaining = guests.filter(guest => !record.completed.includes(guest.id));
        const alternatives = remaining.filter(guest => guest.id !== record.lastEscaped);
        const pool = alternatives.length ? alternatives : remaining;
        const guest = pool[Math.floor(Math.random() * pool.length)];
        record.quietHands = 0;
        record.lastEscaped = null;
        record.scene = { guest: guest.id, stage: "approach" };
        if (!won && guest.afterUnwonHand) record.scene.unwonHand = true;
    }

    function choicesFor(guest, stage) {
        if (stage === "approach") return guest.choices || [{ label: "See what happens" }];
        if (stage === "transform") return [{ label: "Enter your fate" }];
        return [{ label: "Back to the table" }];
    }

    function advance(save, stage, choiceIndex, now = Date.now()) {
        const record = save.encounters;
        const scene = record.scene;
        if (scene?.stage !== stage) return;
        const guest = getGuest(scene.guest);
        const choice = choicesFor(guest, stage)[choiceIndex];
        if (!choice) return;

        if (stage === "approach") {
            if (choice.human) {
                scene.stage = "human";
            } else {
                scene.stage = "transform";
                scene.lost = guest.cost === "stack" ? save.chips : Math.min(save.chips, guest.cost);
                save.chips -= scene.lost;
                save.wager = Math.min(save.wager, Math.max(1, save.chips));
            }
            return;
        }
        if (stage === "transform") {
            record.fate = { guest: guest.id, startedAt: now, until: now + guest.minutes * minute, lost: scene.lost, unwonHand: scene.unwonHand };
            record.completed.push(guest.id);
        } else {
            record.lastEscaped = guest.id;
        }
        record.scene = null;
    }

    function imageUrl(path) {
        return "https://images.celinascollection.com/" + path.split("/").map(encodeURIComponent).join("/");
    }

    function release(save, now = Date.now()) {
        const fate = save.encounters.fate;
        if (!fate || fate.until > now) return false;
        const guest = getGuest(fate.guest);
        save.chips = (save.chips ?? 12) + (guest.returnChips || 0);
        save.encounters.fate = null;
        save.message = guest.aftermath;
        return true;
    }

    return { previewKey, guestOptions, guestForScene, restore, ambush, choicesFor, advance, imageUrl, release };
})();

