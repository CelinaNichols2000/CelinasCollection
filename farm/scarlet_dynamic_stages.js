// SCARLET - FULLY DYNAMIC STAGES
// Stage 4 now has dynamic text based on which animal was chosen

{
    stage: 4,
    title: (gs) => {
        const titles = {
            horse: 'Equine Emergence',
            cow: 'Bovine Beginnings',
            donkey: 'Asinine Alteration',
            rabbit: 'Lapine Lowering',
            dog: 'Canine Conversion'
        };
        return titles[gs.animalType] || 'First Changes';
    },
    image: (gs) => {
        const images = {
            horse: 'https://via.placeholder.com/600x300/8B4513/FFFFFF?text=Horse+Transformation',
            cow: 'https://via.placeholder.com/600x300/D2691E/FFFFFF?text=Cow+Transformation',
            donkey: 'https://via.placeholder.com/600x300/A0522D/FFFFFF?text=Donkey+Transformation',
            rabbit: 'https://via.placeholder.com/600x300/C0C0C0/FFFFFF?text=Rabbit+Transformation',
            dog: 'https://via.placeholder.com/600x300/8B7355/FFFFFF?text=Dog+Transformation'
        };
        return images[gs.animalType] || 'https://via.placeholder.com/600x300/7A4557/FFFFFF?text=Body+Shifting';
    },
    text: (gs) => {
        const transformations = {
            horse: `The moment you choose horse, your body EXPLODES with change. Your legs crack and extend, muscles bulging and reforming into powerful equine hindquarters. Your feet fuse and harden, toenails merging and thickening into solid hooves that click against the stable floor.\n\n<span style="color: #8B3A62; font-weight: bold;">"Ah, a horse! How magnificent!"</span> Scarlet circles you, running her crop along your lengthening spine. <span style="color: #8B3A62; font-weight: bold;">"All that power, all that strength—and soon, all that obedience."</span>\n\nYour spine extends painfully, forming the beginning of a tail. Coarse hair sprouts from the base, swishing involuntarily. Your neck begins to thicken with powerful muscles. The scent of hay suddenly smells... appealing. Natural.\n\n<span style="color: #8B3A62; font-weight: bold;">"Feel those instincts awakening? The urge to run, to graze, to submit to the bridle? That's your true nature emerging, my beautiful beast."</span>`,
            
            cow: `The moment you choose cow, a wave of warmth and heaviness floods your body. Your hips widen dramatically, bones creaking and reforming. Your legs thicken and reshape, feet hardening into cloven hooves.\n\n<span style="color: #8B3A62; font-weight: bold;">"A cow! Perfect!"</span> Scarlet laughs with cruel delight. <span style="color: #8B3A62; font-weight: bold;">"Made to be bred, made to be milked, made to be utterly docile."</span>\n\nYour chest begins to swell. If you're female, your breasts expand massively, becoming udders. If you're male, your chest broadens before the same transformation occurs. The weight is overwhelming, pulling you forward onto all fours.\n\nPatches of black and white fur erupt across your skin. A tail sprouts from your tailbone, swishing to swat at imaginary flies.\n\n<span style="color: #8B3A62; font-weight: bold;">"Look at you, already getting heavier, slower. Your thoughts are simplifying too, aren't they? Soon all you'll know is grazing, being milked, and breeding."</span>`,
            
            donkey: `The moment you choose donkey, your ears begin to stretch—longer, longer, comically long. They twitch and swivel, suddenly picking up sounds you never noticed before.\n\n<span style="color: #8B3A62; font-weight: bold;">"A donkey! How delightfully stubborn you must be,"</span> Scarlet says, her crop striking your changing flank with a sharp CRACK. <span style="color: #8B3A62; font-weight: bold;">"But I break the stubborn ones best of all."</span>\n\nYour body compresses and thickens. Your legs shorten and strengthen, hooves forming at the ends. Gray fur erupts across your skin, coarse and thick. Your face pushes forward into a long muzzle.\n\nA strange sensation builds in your throat—and suddenly you BRAY. The sound is loud, obnoxious, completely involuntary. And utterly inhuman.\n\n<span style="color: #8B3A62; font-weight: bold;">"There it is! Your true voice! Keep fighting, little donkey. I enjoy breaking spirits."</span>`,
            
            rabbit: `The moment you choose rabbit, you feel yourself SHRINKING. The world grows massive around you as you dwindle down, down, down. Within moments, you're barely two feet tall and still getting smaller.\n\n<span style="color: #8B3A62; font-weight: bold;">"A rabbit! How precious!"</span> Scarlet kneels down, her face now enormous from your rapidly diminishing perspective. <span style="color: #8B3A62; font-weight: bold;">"So tiny, so vulnerable, so completely at my mercy."</span>\n\nYour legs reform into powerful haunches, built for hopping. Your arms shorten. Soft fur—white, brown, or gray—covers your shrinking body. Your ears stretch upward, long and sensitive.\n\nYour heart is racing. RACING. Fear floods through you in waves—every sound is a potential threat. Your eyes move to the sides of your head, giving you wide peripheral vision.\n\n<span style="color: #8B3A62; font-weight: bold;">"Feel that fear? That's your rabbit instincts. You're prey now, little bunny. Utterly helpless prey."</span>`,
            
            dog: `The moment you choose dog, you drop to all fours involuntarily. Your spine reforms, forcing you into a quadrupedal stance that suddenly feels... right.\n\n<span style="color: #8B3A62; font-weight: bold;">"A dog! Man's best friend,"</span> Scarlet croons, reaching down to scratch behind your already-lengthening ears. <span style="color: #8B3A62; font-weight: bold;">"Or in this case, woman's best pet."</span>\n\nFur erupts across your body—the color and texture shifting based on the breed you're becoming. Your face pushes out into a muzzle, nose darkening and becoming wet. Your teeth sharpen into fangs.\n\nA tail sprouts and begins wagging. You try to stop it but you CAN'T. It wags when you see Scarlet, responding to her presence with eager submission.\n\nYour sense of smell explodes. You can smell EVERYTHING—Scarlet's scent, the other animals, the hay, the leather. It's overwhelming and intoxicating.\n\n<span style="color: #8B3A62; font-weight: bold;">"Good dog. Such a good dog. Already wanting to please me, aren't you?"</span>`
        };
        return transformations[gs.animalType] || 'Your chosen animal form is beginning to manifest...';
    },
    choices: [
        { text: 'Try to fight the changes', next: 5 },
        { text: 'Let the transformation continue', next: 5 }
    ]
}
