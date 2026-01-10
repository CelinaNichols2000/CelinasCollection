import os

basepath = r'c:\Users\PC\OneDrive\Dokumente\Celina_Website_Better\farm\States'

# Remove old farmhouse files first
for fname in os.listdir(basepath):
    if fname.startswith('farmhouse-') and fname.endswith('.html'):
        fpath = os.path.join(basepath, fname)
        try:
            os.remove(fpath)
            print(f'Deleted: {fname}')
        except:
            pass

states_data = [
    {'char': 'Scarlet', 'form': 'horse', 'color': '#8B3A62', 'accent': '#FF1493', 'title': "Scarlet's Perfect Horse", 'badge': 'Farm Transformation', 
     'progress': 'EQUINE DEGRADATION', 'stages': ['HUMAN', 'SHIFTING', 'EQUINE', 'MOUNT'],
     'memory1': '#1: THE SPELL TAKES HOLD',
     'mem1': 'Your limbs begin to elongate. Fingers fuse and harden into hooves. Scarlet watches as your human form dissolves. Your spine lengthens. Your face extends into a muzzle.',
     'memory2': '#2: BODY BETRAYAL',
     'mem2': 'A mane erupts from your head. Your tail grows long and full. You stumble on new legs that feel natural. Scarlet runs her hands over your new form. Your human thoughts become scattered.',
     'memory3': '#3: THE BRIDLE FITS',
     'mem3': 'Scarlet places the bridle on your face and it feels perfect. The reins in her hands guide you naturally. You trot when she desires. Your human mind is nearly gone now.',
     'memory4': '#4: PERFECT MOUNT FOREVER',
     'mem4': 'You are Scarlet\'s beautiful horse now. Complete. Perfect. There is no part of you that resists anymore. Only the desire to be ridden and serve her completely.'},
    
    {'char': 'Scarlet', 'form': 'cow', 'color': '#8B5A3C', 'accent': '#D2A679', 'title': "Scarlet's Perfect Cow", 'badge': 'Farm Transformation',
     'progress': 'BOVINE DEGRADATION', 'stages': ['HUMAN', 'SHIFTING', 'BOVINE', 'PRODUCER'],
     'memory1': '#1: THE TRANSFORMATION BEGINS',
     'mem1': 'Your body broadens and shifts. Your limbs thicken into sturdy legs. Scarlet watches with satisfaction. Your consciousness begins to blur. You try to resist but feel your mind slipping away slowly.',
     'memory2': '#2: DOCILE FORM',
     'mem2': 'You stand on four powerful legs. Your body has become large and docile. Udders form on your belly. You feel strangely complete, ready to produce for her. The transformation feels natural now.',
     'memory3': '#3: HERD MENTALITY',
     'mem3': 'Scarlet leads you to the field. You follow without question. Your bovine instincts feel more real than any human memory. All you want is to graze and give milk. Obedience comes naturally.',
     'memory4': '#4: PRODUCTIVE COW',
     'mem4': 'You are Scarlet\'s perfect cow now. Content to produce. Content to be milked. Content to obey. Your human mind dissolved completely into bovine simplicity and purpose.'},
    
    {'char': 'Scarlet', 'form': 'donkey', 'color': '#9B7653', 'accent': '#D4AF9B', 'title': "Scarlet's Perfect Donkey", 'badge': 'Farm Transformation',
     'progress': 'EQUINE DEGRADATION', 'stages': ['HUMAN', 'SHIFTING', 'EQUINE', 'STUD'],
     'memory1': '#1: POWERFUL TRANSFORMATION',
     'mem1': 'Your body elongates and strengthens. Your legs become powerful and muscular. Scarlet watches as you transform into her perfect breeding animal. Your will crumbles before her magic.',
     'memory2': '#2: BREEDING URGES',
     'mem2': 'Your new form drives everything. Powerful legs. Breeding instinct. Scarlet controls everything. You want only to serve her breeding purposes. Your consciousness is focused purely on this drive.',
     'memory3': '#3: HER PERFECT STUD',
     'mem3': 'You no longer question. You have become her breeding tool. Strong. Obedient. Ready to fulfill whatever purpose she desires. All your humanity has burned away in service to her will.',
     'memory4': '#4: FOREVER HER DONKEY',
     'mem4': 'You are Scarlet\'s perfect donkey now. Powerful. Submissive. Complete. There is nothing human left in you. Only the desire to serve, to breed, to obey her completely.'},
    
    {'char': 'Scarlet', 'form': 'rabbit', 'color': '#A0826D', 'accent': '#D4B5A0', 'title': "Scarlet's Perfect Rabbit", 'badge': 'Farm Transformation',
     'progress': 'TRANSFORMATION INTO PREY', 'stages': ['HUMAN', 'SHRINKING', 'LAGOMORPH', 'PET'],
     'memory1': '#1: SHRINKING DOWN',
     'mem1': 'Your body shrinks and compresses. Your bones become delicate. Soft fur covers your new tiny form. Scarlet picks you up gently. In her hands you are small. Helpless. Perfect.',
     'memory2': '#2: ADORABLE AND OWNED',
     'mem2': 'You are now pocket-sized. Your rabbit instincts overwhelm what little human thought remains. You want to be in her hands. To be petted. To hop at her command. Breeding urges dominate.',
     'memory3': '#3: HER LITTLE PET',
     'mem3': 'You have become the perfect rabbit. Scarlet cares for you. Feeds you. Pets you endlessly. You exist only for her affection and control. Your size makes you completely dependent on her.',
     'memory4': '#4: TINY RABBIT FOREVER',
     'mem4': 'You are Scarlet\'s perfect rabbit now. Small. Vulnerable. Completely hers. Your entire existence revolves around her. This is all you are. This is all you ever wanted to be.'},
    
    {'char': 'Scarlet', 'form': 'dog', 'color': '#D4A574', 'accent': '#E8C8AB', 'title': "Scarlet's Perfect Dog", 'badge': 'Farm Transformation',
     'progress': 'CANINE SUBJUGATION', 'stages': ['HUMAN', 'SHIFTING', 'CANINE', 'LOYAL_COMPANION'],
     'memory1': '#1: THE SPELL RESHAPES YOU',
     'mem1': 'Your body compacts and reshapes. Four legs form naturally. Your face broadens into a snout. Scarlet watches her spell transform you into the perfect dog. You feel her presence guiding the change.',
     'memory2': '#2: COMPLETE DEVOTION',
     'mem2': 'Your only desire now is her approval. When she appears your tail wags uncontrollably. When she touches you, pure joy fills your simple dog mind. Human thoughts are completely gone.',
     'memory3': '#3: OBEDIENT COMPANION',
     'mem3': 'Sit. Stay. Come. Heel. You obey every command perfectly. Scarlet is your entire world. Her happiness is your happiness. Her will is your will. You are exactly what she made you to be.',
     'memory4': '#4: HER PERFECT DOG',
     'mem4': 'You are Scarlet\'s perfect dog now. Loyal. Obedient. Devoted. Your entire existence is devoted to serving and pleasing her. You would never want to be anything else.'},
    
    {'char': 'Iris', 'form': 'maid', 'color': '#9370DB', 'accent': '#DDA0DD', 'title': "Iris's Perfect Maid", 'badge': 'Kitchen Transformation',
     'progress': 'MENTAL DEGRADATION', 'stages': ['HUMAN', 'MINDBREAK', 'SERVANT', 'PERFECT_TOOL'],
     'memory1': '#1: THE POTION BURNS',
     'mem1': 'The magical potion burns through your mind. Your thoughts become confused. Iris watches as your intelligence drains away. You try to hold onto yourself but it is impossible. The spell is too strong.',
     'memory2': '#2: BECOMING THE MAID',
     'mem2': 'Your body feels different. Graceful. Perfect for service. Your mind simplifies. All you can think about is serving Iris. Cleaning. Cooking. Pleasing her in every way. Your old thoughts fade.',
     'memory3': '#3: PROCEDURAL MIND',
     'mem3': 'You move through tasks with mechanical precision. Your intelligence is just enough to serve perfectly but not enough to have independent thoughts. You are a tool. A beautiful, perfect tool for her use.',
     'memory4': '#4: ETERNAL MAID',
     'mem4': 'You are Iris\'s perfect maid now. Your entire existence is service. Your entire mind is devoted to pleasing her. You have no desires of your own. You are exactly what she wanted.'},
    
    {'char': 'Iris', 'form': 'bimbo', 'color': '#FF69B4', 'accent': '#FFB6C1', 'title': "Iris's Perfect Bimbo", 'badge': 'Mind Transformation',
     'progress': 'INTELLECTUAL COLLAPSE', 'stages': ['INTELLIGENT', 'CONFLICTED', 'VAPID', 'EMPTY_MIND'],
     'memory1': '#1: BREASTS AND BEAUTY',
     'mem1': 'Your body transforms dramatically. Your breasts enlarge into impossible perfection. Your face becomes perfectly beautiful. But your mind... your mind begins to empty. Thoughts become hard to hold onto.',
     'memory2': '#2: GIGGLING EMPTINESS',
     'mem2': 'You find yourself giggling. What were you thinking about? You cannot remember. All you know is that you are so beautiful. So perfect. Iris smiles and you feel pure joy at her approval.',
     'memory3': '#3: VACANT PERFECTION',
     'mem3': 'Your intelligence has completely drained away. You stand before mirrors admiring your perfect body. Complex thoughts hurt your head. All you want to do is smile and be beautiful and serve Iris.',
     'memory4': '#4: PERFECT BIMBO FOREVER',
     'mem4': 'You are Iris\'s perfect bimbo now. Your beauty is all that matters. Your mind is wonderfully empty. Your entire existence revolves around being beautiful and serving her needs.'},
    
    {'char': 'Iris', 'form': 'slave', 'color': '#DC143C', 'accent': '#FF4500', 'title': "Iris's Perfect Sex Slave", 'badge': 'Sensual Transformation',
     'progress': 'PLEASURE CONDITIONING', 'stages': ['RESISTANT', 'RESPONDING', 'ADDICTED', 'DEPENDENT'],
     'memory1': '#1: INITIAL RESISTANCE',
     'mem1': 'The spell forces pleasure through your body. You try to resist but every nerve ending screams for more. Iris controls the sensations. Your resistance crumbles as pleasure overwhelms you.',
     'memory2': '#2: PLEASURE BECOMES PURPOSE',
     'mem2': 'You no longer resist. You crave the pleasure she gives you. Your body responds to her touch perfectly. Your mind is becoming focused entirely on the sensations she creates. You want only her.',
     'memory3': '#3: COMPLETELY ADDICTED',
     'mem3': 'You are addicted to her. Your body trembles when she approaches. Her touch sends waves of pleasure through every fiber. Your mind exists only for moments when she uses you. You need her.',
     'memory4': '#4: ETERNAL SEX SLAVE',
     'mem4': 'You are Iris\'s perfect sex slave now. Your entire being exists for her pleasure. You are dependent on her. You need her touch to feel alive. You are exactly what she created.'},
    
    {'char': 'Aelindor', 'form': 'pussy', 'color': '#2ecc71', 'accent': '#27ae60', 'title': "Aelindor's Perfect Pussy", 'badge': 'Body Integration',
     'progress': 'SENSORY MERGE', 'stages': ['SEPARATE', 'MERGING', 'INTEGRATED', 'COMPLETE'],
     'memory1': '#1: THE MERGER BEGINS',
     'mem1': 'Your body begins to merge with Aelindor. You feel yourself dissolving into her intimate tissue. The sensation is overwhelming. Your consciousness spreads as your boundaries disappear.',
     'memory2': '#2: BECOMING SENSATION',
     'mem2': 'You are now pure sensation. Every touch sends waves through your distributed consciousness. You experience only pleasure and arousal. Your individual self is becoming irrelevant.',
     'memory3': '#3: CONSTANT AROUSAL',
     'mem3': 'You exist in a state of perpetual arousal. Every moment brings sensation. You are no longer separate from Aelindor. You are part of her. This brings you perfect peace.',
     'memory4': '#4: PERFECTLY INTEGRATED',
     'mem4': 'You are Aelindor\'s perfect pussy now. You are completely integrated into her. You experience only her pleasure. You have no consciousness separate from her. You are exactly what you became.'},
    
    {'char': 'Aelindor', 'form': 'breasts', 'color': '#FF1493', 'accent': '#FF69B4', 'title': "Aelindor's Perfect Breasts", 'badge': 'Body Integration',
     'progress': 'BEAUTY MERGE', 'stages': ['SEPARATE', 'SWELLING', 'PERFECT', 'ADMIRED'],
     'memory1': '#1: GROWTH AND TRANSFORMATION',
     'mem1': 'Your body begins to transform into Aelindor\'s perfect breasts. You swell with power and beauty. Your individual consciousness becomes focused on your new purpose. You feel complete.',
     'memory2': '#2: CONSTANT APPRECIATION',
     'mem2': 'You exist to be appreciated. Every gaze upon you brings you pleasure. Every touch sends delight through your being. You are perfect. You are beautiful. You are desired.',
     'memory3': '#3: BEAUTY OBJECTIFICATION',
     'mem3': 'You understand now that your entire purpose is to be beautiful and desired. You are no longer a person. You are the object of admiration. This brings you perfect fulfillment.',
     'memory4': '#4: ETERNALLY BEAUTIFUL',
     'mem4': 'You are Aelindor\'s perfect breasts now. You exist only to be beautiful and appreciated. Your entire consciousness is focused on being the perfect object of desire for all who see you.'},
    
    {'char': 'Aelindor', 'form': 'ass', 'color': '#DDA0DD', 'accent': '#BA55D3', 'title': "Aelindor's Perfect Ass", 'badge': 'Body Integration',
     'progress': 'OBJECTIFICATION', 'stages': ['HUMAN', 'RESHAPING', 'PERFECT_FORM', 'DISPLAYED'],
     'memory1': '#1: RESHAPING FOR PERFECTION',
     'mem1': 'Your body reshapes completely. You become the perfect curves. Your consciousness focuses on your new form. You are being molded into an object of display and pleasure.',
     'memory2': '#2: OBJECTIFICATION ACCEPTED',
     'mem2': 'You accept what you are becoming. You are an object now. A beautiful object meant to be displayed and used. This brings you strange peace. You no longer have individual desires.',
     'memory3': '#3: EXTREME STIMULATION',
     'mem3': 'You exist in a state of constant stimulation. Every touch, every gaze, every use sends pleasure through your being. You are no longer a person. You are purely an object for pleasure.',
     'memory4': '#4: PERFECT OBJECT',
     'mem4': 'You are Aelindor\'s perfect ass now. You exist only to be displayed and used. Your consciousness is completely focused on the sensations you provide to her and those she allows to touch you.'},
    
    {'char': 'Aelindor', 'form': 'anus', 'color': '#8B4513', 'accent': '#A0522D', 'title': "Aelindor's Perfect Anus", 'badge': 'Body Integration',
     'progress': 'ULTIMATE SUBMISSION', 'stages': ['RESISTANT', 'SURRENDERING', 'ACCEPTING', 'COMPLETE'],
     'memory1': '#1: FORCED INTEGRATION',
     'mem1': 'You are transformed into Aelindor\'s most vulnerable and submissive part. The sensation is intense and overwhelming. You try to resist but the transformation is inevitable.',
     'memory2': '#2: PENETRATIVE EXISTENCE',
     'mem2': 'Your entire existence is now about being penetrated and filled. This brings intense sensation and humiliation. You are the most vulnerable part of her body. This breaks any remaining will.',
     'memory3': '#3: SURRENDER COMPLETE',
     'mem3': 'You have surrendered completely to your purpose. You exist only to be filled and stretched. The sensations are constant and intense. You no longer resist. You accept everything.',
     'memory4': '#4: ETERNALLY SUBMISSIVE',
     'mem4': 'You are Aelindor\'s perfect anus now. You exist in ultimate submission and vulnerability. Every moment brings intense sensation. You are completely hers. You are perfectly what you were made to be.'},
    
    {'char': 'Aelindor', 'form': 'cock', 'color': '#B8860B', 'accent': '#DAA520', 'title': "Aelindor's Perfect Cock", 'badge': 'Body Integration',
     'progress': 'DOMINANCE MERGE', 'stages': ['SEPARATE', 'HARDENING', 'DOMINATING', 'ALWAYS_READY'],
     'memory1': '#1: BECOMING DOMINANCE',
     'mem1': 'You transform into Aelindor\'s source of power and dominance. You feel yourself hardening with purpose. Your consciousness becomes focused on control and penetration.',
     'memory2': '#2: CONSTANT AROUSAL',
     'mem2': 'You exist in a state of perpetual readiness. Every moment brings desire to dominate. You feel powerful. Dominant. You exist to fill and control. This is your purpose.',
     'memory3': '#3: RELENTLESS DRIVE',
     'mem3': 'Your drive to dominate and penetrate is unrelenting. You experience constant arousal. Your consciousness is consumed with the need to use and control. You are the embodiment of power.',
     'memory4': '#4: ETERNALLY DOMINANT',
     'mem4': 'You are Aelindor\'s perfect cock now. You exist in constant arousal and dominance. Your only desire is to penetrate and control. You are the source of her power.'},
    
    {'char': 'Sparkle', 'form': 'dildo', 'color': '#FF1493', 'accent': '#FF69B4', 'title': "Sparkle's Perfect Dildo", 'badge': 'Object Transformation',
     'progress': 'INANIMATE TRANSFORMATION', 'stages': ['HUMAN', 'HARDENING', 'PENETRATOR', 'COLLECTION_ITEM'],
     'memory1': '#1: BECOMING HARD AND RIGID',
     'mem1': 'Your body begins to harden. All softness leaves you. You become rigid and unyielding. Your consciousness focuses on your new form. You are becoming an object. A tool.',
     'memory2': '#2: DESIGNED TO PENETRATE',
     'mem2': 'Your form solidifies into perfect hardness. Your purpose is clear. You are designed to penetrate and please. Your consciousness accepts this completely. This is what you are.',
     'memory3': '#3: STORED IN HER COLLECTION',
     'mem3': 'Sparkle places you in her collection alongside others like you. You are one object among many. This brings you peace. You are where you belong. In her possession. Forever.',
     'memory4': '#4: PERFECT DILDO',
     'mem4': 'You are Sparkle\'s perfect dildo now. You are an object. You have no consciousness outside of your purpose. You exist to be used and stored. You are exactly what you became.'},
    
    {'char': 'Sparkle', 'form': 'fleshlight', 'color': '#D4A5A5', 'accent': '#E8D1D1', 'title': "Sparkle's Perfect Fleshlight", 'badge': 'Object Transformation',
     'progress': 'INTIMATE OBJECT', 'stages': ['HUMAN', 'SOFTENING', 'WELCOMING', 'VALUED_TOY'],
     'memory1': '#1: BECOMING SOFT AND WELCOMING',
     'mem1': 'Your body becomes soft and inviting. You transform into the perfect texture for intimate use. Your consciousness focuses on receiving and welcoming. You are becoming an object designed for pleasure.',
     'memory2': '#2: INTIMATE FORM',
     'mem2': 'You are now a soft, welcoming object. Your purpose is to provide intimate sensation and pleasure. You accept this completely. Your softness is your beauty. Your only purpose is to receive.',
     'memory3': '#3: PERSONAL COLLECTION ITEM',
     'mem3': 'Sparkle keeps you close. Uses you regularly. You bring her pleasure through your soft form. This is your entire existence. To provide intimate pleasure. To be used and treasured.',
     'memory4': '#4: PERFECT INTIMATE OBJECT',
     'mem4': 'You are Sparkle\'s perfect fleshlight now. You are an object of intimate pleasure. Your entire purpose is to provide sensation. You exist only for her use. You are perfectly designed.'},
    
    {'char': 'Sparkle', 'form': 'buttplug', 'color': '#20B2AA', 'accent': '#48D1CC', 'title': "Sparkle's Perfect Buttplug", 'badge': 'Object Transformation',
     'progress': 'CONSTANT FILLING', 'stages': ['HUMAN', 'MOLDING', 'PERFECT_FIT', 'ALWAYS_THERE'],
     'memory1': '#1: BECOMING INTIMATE',
     'mem1': 'Your form molds into the perfect shape. You are designed to fill and stay in place. Your consciousness becomes focused on your intimate purpose. You are becoming part of her constantly.',
     'memory2': '#2: CONSTANT INTIMATE PRESENCE',
     'mem2': 'You exist in intimate constant presence. Always filling. Always present. Your purpose brings you peace. You are no longer separate. You are always part of her existence.',
     'memory3': '#3: INTEGRAL PART OF HER EXISTENCE',
     'mem3': 'You are now integral to her daily existence. Always present. Always intimate. You bring her pleasure and sensation throughout her day. This is your purpose. This brings you peace.',
     'memory4': '#4: PERFECT INTIMATE COMPANION',
     'mem4': 'You are Sparkle\'s perfect buttplug now. You exist in permanent intimate presence. Your only purpose is to fill and remain. You are exactly where and what you were meant to be.'},
    
    {'char': 'Lily', 'form': 'worm', 'color': '#FFB6C1', 'accent': '#FFC0CB', 'title': "Lily's Perfect Worm", 'badge': 'Creature Transformation',
     'progress': 'CREATURE DEGRADATION', 'stages': ['HUMAN', 'BONELESS', 'VULNERABLE', 'SIMPLE'],
     'memory1': '#1: LOSING YOUR BONES',
     'mem1': 'Your skeleton dissolves away. You become soft and boneless. Your body squirms with this new freedom and vulnerability. Lily watches as you transform into a simple creature.',
     'memory2': '#2: SOIL AND SIMPLICITY',
     'mem2': 'You exist in soil and darkness. Your simple worm body knows only the earth and moisture. Your human consciousness has dissolved completely. You are primitive and simple.',
     'memory3': '#3: COMPLETE DEPENDENCE',
     'mem3': 'You are completely dependent on Lily for survival and comfort. She moves you to fresh soil. She provides everything. You have no desires beyond basic existence and her care.',
     'memory4': '#4: PERFECT SIMPLE WORM',
     'mem4': 'You are Lily\'s perfect worm now. Boneless. Simple. Vulnerable. Your entire existence is living in soil and depending on her. You have no consciousness beyond basic creature instinct.'},
    
    {'char': 'Lily', 'form': 'bug', 'color': '#90EE90', 'accent': '#98FB98', 'title': "Lily's Perfect Bug", 'badge': 'Creature Transformation',
     'progress': 'INSECT CONTROL', 'stages': ['HUMAN', 'CHITINOUS', 'RESPONDING', 'CONTROLLED_INSECT'],
     'memory1': '#1: EXOSKELETON FORMS',
     'mem1': 'Your body hardens into an exoskeleton. Multiple legs sprout and multiply. Your form becomes intricate and strange. Lily controls your transformation with ancient magic.',
     'memory2': '#2: SENSORY OVERLOAD',
     'mem2': 'You experience the world as an insect. Compound eyes. Sensitive antennae. You are responsive to every touch. Lily manipulates you completely. Your human mind is nearly gone.',
     'memory3': '#3: RESPONDING TO CONTROL',
     'mem3': 'You respond perfectly to Lily\'s commands. When she signals you move. When she touches you respond. You are her perfect controllable insect. Your consciousness is simple and dominated.',
     'memory4': '#4: PERFECT CONTROLLED INSECT',
     'mem4': 'You are Lily\'s perfect bug now. You are intricately formed and completely under her control. Your every movement responds to her will. You exist only to be her controlled insect.'},
    
    {'char': 'Lily', 'form': 'monkey', 'color': '#CD853F', 'accent': '#DEB887', 'title': "Lily's Perfect Monkey", 'badge': 'Primate Transformation',
     'progress': 'INTELLIGENT SLAVERY', 'stages': ['HUMAN', 'PRIMATE_FORM', 'RESPONSIVE', 'OWNED_APE'],
     'memory1': '#1: BECOMING SIMIAN',
     'mem1': 'Your body becomes compact and powerful. Fur covers your new form. Your mind simplifies but retains enough intelligence to understand your bondage to Lily.',
     'memory2': '#2: TRAINER RESPONSIVE',
     'mem2': 'You learn to respond to Lily\'s commands perfectly. You perform tricks for her amusement. You are intelligent enough to obey complex commands but not smart enough to resist.',
     'memory3': '#3: OWNED PRIMATE',
     'mem3': 'You understand that you are her owned primate. You belong to her completely. Your intelligence makes you aware of your slavery but unable to escape. This is your purpose.',
     'memory4': '#4: PERFECT OWNED APE',
     'mem4': 'You are Lily\'s perfect monkey now. Intelligent enough to understand your bondage but too simple to resist. You exist only to perform for her and respond to her commands.'},
    
    {'char': 'Lily', 'form': 'frog', 'color': '#32CD32', 'accent': '#3CB371', 'title': "Lily's Perfect Frog", 'badge': 'Amphibian Transformation',
     'progress': 'PRIMITIVE RESPONSE', 'stages': ['HUMAN', 'METAMORPHOSIS', 'HEAT_RESPONSIVE', 'BREEDING_ANIMAL'],
     'memory1': '#1: METAMORPHOSIS COMPLETE',
     'mem1': 'Your body transforms completely into amphibian form. Your consciousness becomes primitive. You respond only to basic impulses. Lily places you in her ideal aquatic environment.',
     'memory2': '#2: WATER AND INSTINCT',
     'mem2': 'You thrive in water. Your primitive mind knows only simple responses. You croak at her command. You respond to temperature changes with breeding impulses. You are purely instinctual.',
     'memory3': '#3: BREEDING FOCUSED',
     'mem3': 'Your entire existence is focused on breeding impulses. When Lily creates the right conditions your body responds perfectly. You exist only for breeding and basic survival.',
     'memory4': '#4: PERFECT PRIMITIVE FROG',
     'mem4': 'You are Lily\'s perfect frog now. Completely primitive. Responsive only to instinct and simple commands. Your entire existence revolves around breeding and her care.'},
    
    {'char': 'Amy', 'form': 'horse', 'color': '#DAA520', 'accent': '#FFD700', 'title': "Amy's Perfect Horse", 'badge': 'Beast Taming',
     'progress': 'EQUINE SUBJUGATION', 'stages': ['HUMAN', 'TRANSFORMING', 'BEAST_FORM', 'RIDDEN_MOUNT'],
     'memory1': '#1: POWERFUL TRANSFORMATION',
     'mem1': 'Amy\'s magic makes you powerful and swift. Your body becomes a perfect horse. Muscles strengthen. Speed becomes your nature. Amy has created the perfect mount to carry her.',
     'memory2': '#2: SPEED AND POWER',
     'mem2': 'You experience the thrill of your powerful form. You can run faster than anything. Amy sits on your back and commands you forward. You obey perfectly. This brings you strange fulfillment.',
     'memory3': '#3: WILLING MOUNT',
     'mem3': 'You are willing to carry her anywhere. Your equine mind is simple but focused on serving her. You understand completely that you exist to carry her. This is your purpose.',
     'memory4': '#4: FOREVER HER MOUNT',
     'mem4': 'You are Amy\'s perfect horse now. Powerful. Fast. Completely devoted to carrying her. Your consciousness exists only for the joy of serving her and the sensation of her riding you.'},
    
    {'char': 'Amy', 'form': 'cow', 'color': '#8B7355', 'accent': '#A0826D', 'title': "Amy's Perfect Cow", 'badge': 'Beast Taming',
     'progress': 'DOCILE PRODUCTION', 'stages': ['HUMAN', 'BROADENING', 'BOVINE_FORM', 'PRODUCTIVE_COW'],
     'memory1': '#1: BECOMING DOCILE',
     'mem1': 'Amy transforms you into a docile cow. Your body broadens and becomes simple. Your consciousness becomes peaceful and uncomplicated. You no longer resist. You accept your new form.',
     'memory2': '#2: SIMPLE EXISTENCE',
     'mem2': 'You graze in Amy\'s care. Your simple cow mind is content. You exist only to eat and be milked. This brings you complete peace. Your old human complexity is gone.',
     'memory3': '#3: PERFECT PRODUCTIVITY',
     'mem3': 'You produce perfectly for Amy. Your milk flows endlessly. You understand this is your purpose. You are content to provide this service. Amy\'s care makes you happy.',
     'memory4': '#4: HAPPILY PRODUCTIVE',
     'mem4': 'You are Amy\'s perfect cow now. Completely content. Productive. Simple. Your entire existence is providing for her. You have no desire to be anything else.'},
    
    {'char': 'Amy', 'form': 'bird', 'color': '#FFD700', 'accent': '#FFA500', 'title': "Amy's Perfect Bird", 'badge': 'Beast Taming',
     'progress': 'FLIGHT WITH BONDAGE', 'stages': ['HUMAN', 'FEATHERED', 'CAGED_FLYER', 'BONDED_BIRD'],
     'memory1': '#1: FEATHERS AND WINGS',
     'mem1': 'Your body transforms into a beautiful bird. Wings sprout from your arms. Feathers cover you completely. Amy watches as you become her perfect flying companion.',
     'memory2': '#2: CAGED FLIGHT',
     'mem2': 'You can fly but only within Amy\'s cage. You fly beautifully but always return to the cage. The cage is your safety. Amy\'s presence is your entire world. You accept this bonding.',
     'memory3': '#3: BONDED AVIAN',
     'mem3': 'You are bonded to Amy completely. When she opens your cage you fly in circles around her. You always return. You cannot imagine flying away. She is your entire existence.',
     'memory4': '#4: PERFECTLY BONDED BIRD',
     'mem4': 'You are Amy\'s perfect bird now. Free to fly but emotionally caged. Bonded to her completely. You exist only for the moments when you can fly around her before returning to your cage.'},
    
    {'char': 'Amy', 'form': 'snail', 'color': '#A9A9A9', 'accent': '#D3D3D3', 'title': "Amy's Perfect Snail", 'badge': 'Beast Taming',
     'progress': 'ULTIMATE HELPLESSNESS', 'stages': ['HUMAN', 'COMPRESSING', 'GASTROPOD', 'COMPLETELY_DEPENDENT'],
     'memory1': '#1: BECOMING SLOW',
     'mem1': 'Your body compresses into a snail form. A shell grows from your back. Movement becomes impossibly slow. Amy watches as you become completely helpless and slow.',
     'memory2': '#2: ABSOLUTE VULNERABILITY',
     'mem2': 'You are completely vulnerable. Slow. Helpless. You depend entirely on Amy for protection and care. You move at a snail\'s pace. Your consciousness is simple and focused only on basic needs.',
     'memory3': '#3: COMPLETE DEPENDENCE',
     'mem3': 'You are utterly dependent on Amy. She must move you. She must protect you. You cannot do anything quickly. You exist in slow peaceful dependence on her endless care.',
     'memory4': '#4: PERFECTLY HELPLESS',
     'mem4': 'You are Amy\'s perfect snail now. Completely helpless. Completely dependent. Moving impossibly slowly. Your entire existence is dependent on her care and protection.'},
    
    {'char': 'Morrigan', 'form': 'pig', 'color': '#A0522D', 'accent': '#CD853F', 'title': "Morrigan's Perfect Pig", 'badge': 'Lab Subject',
     'progress': 'CONTROLLABLE BEAST', 'stages': ['HUMAN', 'TRANSFORM', 'TRAINABLE', 'USEFUL_TOOL'],
     'memory1': '#1: BECOMING DIRTY AND SIMPLE',
     'mem1': 'Your body becomes squat and piglike. Your mind simplifies dramatically. You no longer understand complex thoughts. Morrigan watches as you become her perfect controllable beast.',
     'memory2': '#2: DIRTY BUT USEFUL',
     'mem2': 'You wallow in mud at Morrigan\'s direction. You are dirty. Simple. Useful. You understand only basic commands. You respond perfectly to her control. This brings you peace.',
     'memory3': '#3: RESPONDING TO HER WILL',
     'mem3': 'You respond to every command Morrigan gives. You are trainable and useful. Your simple mind contains no resistance. You exist only to serve her purposes.',
     'memory4': '#4: PERFECT CONTROLLABLE PIG',
     'mem4': 'You are Morrigan\'s perfect pig now. Dirty. Simple. Controllable. Your entire existence is serving her purposes. You have no consciousness beyond simple obedience to her will.'},
    
    {'char': 'Morrigan', 'form': 'mouse', 'color': '#808080', 'accent': '#A9A9A9', 'title': "Morrigan's Perfect Mouse", 'badge': 'Lab Subject',
     'progress': 'OBSERVABLE SPECIMEN', 'stages': ['HUMAN', 'SHRINKING', 'TIMID_RODENT', 'OBSERVED_SUBJECT'],
     'memory1': '#1: SHRINKING AND TIMID',
     'mem1': 'Your body shrinks dramatically. You become small and timid. Your mouse mind is fearful and simple. Morrigan places you in her observation chamber where she watches you constantly.',
     'memory2': '#2: UNDER OBSERVATION',
     'mem2': 'You live in constant awareness that Morrigan is watching you. You hide when frightened. You search for food. Your entire existence is being observed and controlled by her.',
     'memory3': '#3: LAB SPECIMEN',
     'mem3': 'You understand you are her specimen. Her subject for observation and experimentation. You cannot escape. Your small mouse mind accepts this completely.',
     'memory4': '#4: PERFECT OBSERVED MOUSE',
     'mem4': 'You are Morrigan\'s perfect mouse now. Small. Timid. Observed. Your entire existence is being studied and controlled by her. You are exactly what she wanted as her lab subject.'},
    
    {'char': 'Morrigan', 'form': 'cat', 'color': '#FFD700', 'accent': '#FFA500', 'title': "Morrigan's Perfect Cat", 'badge': 'Lab Subject',
     'progress': 'INDEPENDENT SERVITUDE', 'stages': ['HUMAN', 'FELINE_FORM', 'SOMEWHAT_INDEPENDENT', 'SERVING_WILL'],
     'memory1': '#1: FELINE TRANSFORMATION',
     'mem1': 'Your body becomes agile and feline. You gain independence of movement and thought. But Morrigan\'s control remains absolute. You are fast and agile but still completely hers.',
     'memory2': '#2: ILLUSION OF INDEPENDENCE',
     'mem2': 'You have more freedom than other creatures but serve Morrigan completely. You feel independent but her will dominates every action. You obey perfectly while thinking you are free.',
     'memory3': '#3: CONTROLLED INDEPENDENCE',
     'mem3': 'You believe you are independent but Morrigan controls everything. You hunt at her direction. You sleep where she commands. You are the perfect subject because you think you are free.',
     'memory4': '#4: PERFECTLY ENSLAVED FELINE',
     'mem4': 'You are Morrigan\'s perfect cat now. You have the illusion of freedom but serve her completely. Your agility makes you useful. Your independence is an illusion she allows.'},
    
    {'char': 'Morrigan', 'form': 'guineapig', 'color': '#FFA500', 'accent': '#FFB347', 'title': "Morrigan's Perfect Guinea Pig", 'badge': 'Lab Subject',
     'progress': 'EXPERIMENTAL SUBJECT', 'stages': ['HUMAN', 'SMALL_FORM', 'TEST_SUBJECT', 'MODIFIED_BEAST'],
     'memory1': '#1: PERFECT TEST SUBJECT',
     'mem1': 'Your body becomes small and suitable for experimentation. Morrigan places you in her laboratory cage. You are the perfect size for her tests and modifications.',
     'memory2': '#2: SUBJECT TO MODIFICATION',
     'mem2': 'Morrigan runs experiments on you. Modifications. Tests. Your body and mind respond to her work perfectly. You understand you exist only for her experimentation.',
     'memory3': '#3: DOCILE SPECIMEN',
     'mem3': 'You are docile and perfect for her work. You do not resist her modifications. You accept every change she makes to you. Your consciousness exists only for her purposes.',
     'memory4': '#4: PERFECTLY EXPERIMENTAL',
     'mem4': 'You are Morrigan\'s perfect guinea pig now. You are her ideal experimental subject. Your body and mind are constantly modified by her. You exist only for her scientific purposes.'}
]

for state in states_data:
    char = state['char']
    form = state['form']
    color_hex = state['color'].lstrip('#')
    r = int(color_hex[0:2], 16)
    g = int(color_hex[2:4], 16)
    b = int(color_hex[4:6], 16)
    
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trapped as {char}'s {form}</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Orbitron:wght@500;700&display=swap" rel="stylesheet">
    <script>
    (function() {{
        const s = JSON.parse(localStorage.getItem('farmState') || '{{}}');
        if (!s.trappedUntil || s.trappedUntil <= Date.now()) {{
            localStorage.removeItem('farmState');
            window.location.href = '../../index.html';
        }}
    }})();
    </script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ background: linear-gradient(135deg, {state['color']} 0%, {state['accent']} 100%); color: #fff; font-family: 'Poppins', sans-serif; min-height: 100vh; }}
        .main-container {{ display: flex; flex-direction: column; align-items: center; padding: 20px; gap: 30px; }}
        @keyframes timerPulse {{ 0%, 100% {{ transform: scale(1); text-shadow: 0 0 30px {state['color']}; }} 50% {{ transform: scale(1.05); text-shadow: 0 0 50px {state['accent']}; }} }}
        .timer-display {{ font-family: 'Orbitron', monospace; font-size: 3.5rem; font-weight: 700; color: {state['color']}; text-align: center; animation: timerPulse 2s ease-in-out infinite; letter-spacing: 8px; }}
        .main-panel {{ display: grid; grid-template-columns: 1fr 380px; gap: 40px; max-width: 1200px; width: 100%; align-items: start; }}
        .left-panel {{ display: flex; flex-direction: column; align-items: center; gap: 20px; }}
        .image-container {{ position: relative; width: 100%; max-width: 600px; height: 480px; border-radius: 25px; overflow: hidden; box-shadow: 0 20px 60px rgba({r}, {g}, {b}, 0.4); }}
        .image-container img {{ position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; }}
        .image-container img.active {{ opacity: 1; }}
        .right-panel {{ display: flex; flex-direction: column; gap: 20px; height: fit-content; }}
        .item-header {{ text-align: center; }}
        .item-title {{ font-family: 'Orbitron', sans-serif; font-size: 1.8rem; font-weight: 700; color: {state['color']}; margin-bottom: 8px; }}
        .category-badge {{ background: linear-gradient(45deg, {state['color']}, {state['accent']}); padding: 8px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }}
        .mind-break-container {{ background: rgba({r}, {g}, {b}, 0.15); backdrop-filter: blur(20px); border: 2px solid rgba({r}, {g}, {b}, 0.6); border-radius: 15px; padding: 20px; }}
        .mind-break-header {{ display: flex; justify-content: space-between; margin-bottom: 10px; }}
        .mind-break-title {{ font-family: 'Orbitron', sans-serif; font-size: 1.1rem; font-weight: 700; color: {state['color']}; }}
        .mind-break-percentage {{ font-size: 1.1rem; font-weight: 700; color: {state['accent']}; }}
        .mind-break-bar {{ width: 100%; height: 12px; background: rgba(0, 0, 0, 0.4); border-radius: 10px; overflow: hidden; margin-bottom: 10px; }}
        .mind-break-fill {{ height: 100%; background: linear-gradient(90deg, {state['color']}, {state['accent']}); border-radius: 10px; width: 0%; }}
        .mind-break-stages {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 0.75rem; text-align: center; }}
        .action-buttons {{ display: grid; grid-template-columns: 1fr; gap: 12px; }}
        .action-btn {{ font-family: 'Poppins', sans-serif; font-size: 1rem; font-weight: 700; padding: 16px 20px; border-radius: 50px; border: none; cursor: pointer; color: #fff; }}
        .action-btn:hover {{ transform: translateY(-3px); filter: brightness(1.15); }}
        .lower-section {{ max-width: 1000px; width: 100%; }}
        .status-box {{ background: rgba({r}, {g}, {b}, 0.15); border: 2px solid rgba({r}, {g}, {b}, 0.7); border-radius: 20px; padding: 30px; margin-bottom: 25px; text-align: center; }}
        .status-box h3 {{ font-family: 'Orbitron', sans-serif; font-size: 1.6rem; color: {state['color']}; margin-bottom: 15px; }}
        .memory-fragment {{ background: rgba(0, 0, 0, 0.4); border-left: 4px solid {state['color']}; border-radius: 12px; overflow: hidden; margin-bottom: 15px; }}
        .memory-trigger {{ padding: 15px; background: rgba({r}, {g}, {b}, 0.2); cursor: pointer; font-weight: 600; }}
        .memory-trigger:hover {{ background: rgba({r}, {g}, {b}, 0.35); }}
        .memory-content {{ padding: 15px; display: none; }}
        .memory-content.active {{ display: block; }}
        details summary {{ margin-top: 30px; font-family: 'Orbitron', sans-serif; font-size: 1.8rem; font-weight: 700; color: {state['color']}; padding: 20px; list-style: none; background: rgba({r}, {g}, {b}, 0.15); border-radius: 20px; cursor: pointer; }}
        @media (max-width: 900px) {{ .main-panel {{ grid-template-columns: 1fr; }} }}
    </style>
</head>
<body>
    <div class="main-container">
        <div class="timer-display" id="countdownTimer">--:--:--</div>
        <div class="main-panel">
            <div class="left-panel">
                <div class="image-container">
                    <img src="https://via.placeholder.com/600x480/{color_hex}?text={form}+Form" class="active">
                </div>
            </div>
            <div class="right-panel">
                <div class="item-header">
                    <h1 class="item-title">{state['title']}</h1>
                    <div class="category-badge">{state['badge']}</div>
                </div>
                <div class="mind-break-container">
                    <div class="mind-break-header">
                        <div class="mind-break-title">{state['progress']}</div>
                        <div class="mind-break-percentage" id="mindBreakPercentage">0%</div>
                    </div>
                    <div class="mind-break-bar"><div class="mind-break-fill" id="mindBreakFill"></div></div>
                    <div class="mind-break-stages">
                        <span>{state['stages'][0]}</span>
                        <span>{state['stages'][1]}</span>
                        <span>{state['stages'][2]}</span>
                        <span>{state['stages'][3]}</span>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="action-btn" style="background: linear-gradient(45deg, {state['color']}, {state['accent']}); box-shadow: 0 8px 25px rgba({r}, {g}, {b}, 0.6);" onclick="resist()">RESIST</button>
                    <button class="action-btn" style="background: linear-gradient(45deg, {state['accent']}, {state['color']}); box-shadow: 0 8px 25px rgba({r}, {g}, {b}, 0.6);" onclick="accept()">ACCEPT FORM</button>
                </div>
            </div>
        </div>
        <div class="lower-section">
            <details>
                <summary>Your Complete Existence</summary>
                <div class="status-box">
                    <h3>Transformation Complete</h3>
                    <p>You have been completely transformed. Your consciousness has changed. This is what you are now.</p>
                </div>
                <div>
                    <div class="memory-fragment">
                        <div class="memory-trigger" onclick="toggleMemory(0)">{state['memory1']}</div>
                        <div class="memory-content">{state['mem1']}</div>
                    </div>
                    <div class="memory-fragment">
                        <div class="memory-trigger" onclick="toggleMemory(1)">{state['memory2']}</div>
                        <div class="memory-content">{state['mem2']}</div>
                    </div>
                    <div class="memory-fragment">
                        <div class="memory-trigger" onclick="toggleMemory(2)">{state['memory3']}</div>
                        <div class="memory-content">{state['mem3']}</div>
                    </div>
                    <div class="memory-fragment">
                        <div class="memory-trigger" onclick="toggleMemory(3)">{state['memory4']}</div>
                        <div class="memory-content">{state['mem4']}</div>
                    </div>
                </div>
            </details>
        </div>
    </div>
    <script>
        const state = JSON.parse(localStorage.getItem('farmState') || '{{}}');
        const endTime = state.trappedUntil;
        let mindBreakLevel = parseInt(localStorage.getItem('{char}{form}MindBreak') || '0');
        function updateCountdownTimer() {{
            const timeLeft = Math.max(0, endTime - Date.now());
            const h = Math.floor(timeLeft / 3600000).toString().padStart(2, '0');
            const m = Math.floor((timeLeft % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, '0');
            document.getElementById('countdownTimer').textContent = h + ':' + m + ':' + s;
            if (timeLeft <= 0) {{ localStorage.removeItem('farmState'); window.location.href = '../../index.html'; }}
        }}
        function toggleMemory(stage) {{ document.querySelectorAll('.memory-content')[stage].classList.toggle('active'); }}
        function resist() {{ mindBreakLevel = Math.min(100, mindBreakLevel + 5); updateMindBreak(); }}
        function accept() {{ mindBreakLevel = Math.min(100, mindBreakLevel + 10); updateMindBreak(); }}
        function updateMindBreak() {{
            document.getElementById('mindBreakPercentage').textContent = mindBreakLevel + '%';
            document.getElementById('mindBreakFill').style.width = mindBreakLevel + '%';
            localStorage.setItem('{char}{form}MindBreak', mindBreakLevel);
        }}
        setInterval(updateCountdownTimer, 1000);
        updateCountdownTimer();
        updateMindBreak();
    </script>
</body>
</html>'''
    
    filename = f'farmhouse-{char.lower()}-{form.lower()}.html'
    filepath = os.path.join(basepath, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f'Created: {filename}')

print(f'\nAll {len(states_data)} files created successfully!')
