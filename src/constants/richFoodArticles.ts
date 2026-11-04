// Rich SEO-optimized safety articles for infant foods
// Written in extremely simple, easy-to-understand language for mothers and caregivers
// Contains ZERO em dashes and ZERO AI watermarks

export interface FoodArticle {
  intro: string;
  benefitsOrRisks: string;
  howToChooseAndWash: string;
  safetyChecklist: string[];
  faqs: { q: string; a: string }[];
}

export const RICH_FOOD_ARTICLES: Record<string, FoodArticle> = {
  water: {
    intro: "Water is the most basic fluid on Earth, but for a tiny baby, it can actually be quite dangerous if given too early or in the wrong amounts. Many parents feel the need to give water when it is hot outside, but babies under six months old already get all the water they need from breast milk or formula.",
    benefitsOrRisks: "The biggest risk with giving water to a small baby is something called water intoxication. A baby's kidneys are very small and cannot handle extra water. This extra water can thin out the important salts and minerals in their blood. If these salts get too low, it can cause the baby's brain to swell, leading to seizures, or in very bad cases, death. Additionally, giving water fills up their tiny stomachs, making them less hungry for the milk they need to grow strong.",
    howToChooseAndWash: "You do not need to buy special water for babies. If you are using water to mix formula, always use fresh water from the tap that has been boiled and cooled down. Never use bottled water that has high levels of minerals or salts, as these are too hard for a baby's kidneys to process.",
    safetyChecklist: [
      "Wait until your baby is six months old before offering any water to drink.",
      "Only give water during meal times to help your baby learn how to use a cup.",
      "Limit water to no more than two to four ounces (about half a small cup) in a whole day for babies between six and twelve months.",
      "Always use a clean open cup or a straw cup instead of a bottle for water to help with their mouth development.",
      "If it is very hot, offer more frequent breast milk or formula sessions instead of water."
    ],
    faqs: [
      {
        q: "Does my baby need water during a heatwave?",
        a: "No. If your baby is under six months old, just give them more frequent breast milk or formula. These are made of mostly water and have the perfect balance of salts to keep your baby safe and hydrated."
      },
      {
        q: "When can my baby start drinking as much water as they want?",
        a: "After your baby turns one year old, they can start drinking water more freely. Before that, milk should always be their main and most important drink."
      }
    ]
  },
  honey: {
    intro: "Honey is a thick, golden syrup made by honeybees from the nectar of flowers. It has been used for thousands of years as a natural sweetener. However, despite its natural origin, it is one of the most dangerous foods you can give to a baby who has not yet reached their first birthday.",
    benefitsOrRisks: "The primary danger in honey is a type of germ called Clostridium botulinum. These germs live in soil and dust and often find their way into honey. In adults and older children, the digestive system is strong enough to move these germs through the body without any harm. But a baby's digestive system is immature and very sensitive. In a baby's tummy, these germs can grow and produce a powerful poison that attacks the baby's nerves. This condition is called infant botulism. It causes the baby's muscles to become very weak and floppy, makes it difficult for them to swallow, and can stop them from being able to breathe on their own.",
    howToChooseAndWash: "There is no way to wash or clean honey to make it safe for a baby. Even honey that is sold as organic, raw, or high quality still contains these dangerous germs. You should keep all honey containers tightly sealed and stored in a high kitchen cabinet where your children cannot reach them. When you are out at restaurants or visiting friends, always ask if there is honey in the food before letting your baby have a taste.",
    safetyChecklist: [
      "Keep all types of honey (whether raw, processed, or local) away from babies under twelve months old.",
      "Read the ingredient lists on boxes of cereal, bread, and crackers carefully to ensure no honey is hidden inside.",
      "Never follow old advice to put honey on a baby's tongue or pacifier to help them sleep or stop crying.",
      "If you are breastfeeding, it is safe for you to eat honey, as the germs cannot pass through your breast milk to the baby.",
      "Look for warning signs like constipation, a weak cry, or a floppy neck if you think your baby might have eaten honey accidentally."
    ],
    faqs: [
      {
        q: "Is honey safe if it has been boiled or baked in a cake?",
        a: "No. The germs in honey are very tough and can survive the high heat of boiling and baking. Even if the honey is cooked, it can still cause botulism in your baby. Wait until they are one year old before giving them any food made with honey."
      },
      {
        q: "What is the very first sign of botulism I should look for?",
        a: "Constipation (not being able to poo) is usually the first sign. If this is followed by your baby looking very tired, having a weak suck, or acting like a 'rag doll' with no muscle strength, seek emergency medical help immediately."
      }
    ]
  },
  whole_nuts: {
    intro: "Whole nuts are small, hard, and dry fruits like peanuts, walnuts, cashews, and almonds. They are incredibly healthy for adults, providing essential proteins and minerals. However, their physical shape and hardness make them one of the leading causes of choking in young children under the age of five.",
    benefitsOrRisks: "The main danger with whole nuts is their size and rigid texture. A baby or young toddler does not have the back teeth (molars) needed to grind hard nuts into a safe paste. If a baby tries to swallow a whole nut, it can easily get stuck in their airway. Even more dangerous is the risk of aspiration, where a small piece of nut is inhaled into the lungs. This can cause severe lung inflammation and infections that are very hard to treat.",
    howToChooseAndWash: "When shopping for your baby, only choose products that are smooth and creamy, like smooth peanut butter or finely ground nut flours. Never buy whole nuts, chopped nuts, or 'chunky' nut butters for a child who cannot yet chew perfectly. Always store your own snacks in high, locked cabinets to prevent curious toddlers from finding them on the floor or in low drawers.",
    safetyChecklist: [
      "Wait until your child is at least four or five years old before giving them any whole or chopped nuts.",
      "Introduce the taste of peanuts early (from 6 months) using smooth peanut butter thinned with water or breast milk to help prevent allergies.",
      "Always supervise your child when they are eating any food that might contain nut pieces.",
      "If you have older children, teach them that they must never share their nuts or hard snacks with the baby.",
      "Learn the difference between a gag and a choke so you can react quickly if a child has trouble with a hard texture."
    ],
    faqs: [
      {
        q: "Is it safe to give my baby crushed nuts in their porridge?",
        a: "No. Even small crushed pieces are hard and can be breathed into the lungs. It is much safer to use a smooth nut butter that has been thinned out with liquid, or a very fine nut powder that dissolves completely."
      },
      {
        q: "At what age can a child safely grind nuts with their teeth?",
        a: "Most children do not have the coordination and the full set of back molars needed to safely grind hard nuts until they are about four or five years old."
      }
    ]
  },
  popcorn: {
    intro: "Popcorn is a very popular light snack, but it is one of the most hazardous foods for babies and toddlers. While it feels soft and fluffy, the hard unpopped kernels and the thin, sharp hulls (skins) pose a major threat to a baby's small throat and lungs.",
    benefitsOrRisks: "Popcorn is a 'high-risk' choking food because of how it behaves in the mouth. It is light and dry, which makes it very easy for a baby to accidentally inhale a piece into their breathing pipe if they laugh, gasp, or cry while eating. Once inside, the dry hulls can stick to the sensitive lining of the throat or lungs, causing a blockage or a serious infection called aspiration pneumonia. The hard unpopped kernels are also exactly the right size to block a baby's airway completely.",
    howToChooseAndWash: "Do not offer popcorn to your baby or toddler under any circumstances. If you want to give your baby a crunchy snack, choose puffed corn snacks that are specially made for infants. These are designed to dissolve instantly when they touch the baby's saliva, making them much safer than traditional popcorn.",
    safetyChecklist: [
      "Avoid giving popcorn to any child under the age of four.",
      "During family gatherings or movie nights, ensure that bowls of popcorn are kept on high tables out of the baby's reach.",
      "Always check the floor under the couch or high chair to make sure no stray kernels have been dropped by others.",
      "Choose safer alternatives like soft cooked vegetable sticks or soft fruits for snack time.",
      "Be aware that even 'hull-less' popcorn still has hard parts that are unsafe for infants."
    ],
    faqs: [
      {
        q: "Can I give my baby the soft white part of the popcorn if I remove the kernel?",
        a: "No. Even the soft part can clump together in the throat and cause a blockage. It is better to wait until your child is older and has better chewing skills."
      },
      {
        q: "What is a safe 'crunchy' snack for a ten-month-old?",
        a: "Try giving your baby 'teething wafers' or puffed grain snacks that are labeled for their specific age. These are tested to ensure they melt quickly and do not break into hard, sharp pieces."
      }
    ]
  },
  hot_dogs: {
    intro: "Hot dogs and sausages are common household foods, but their shape and texture are extremely dangerous for young children. When cut into round circles, they become a perfect plug that can block a child's breathing tube completely.",
    benefitsOrRisks: "The physical shape of a hot dog is the main problem. A round slice of hot dog is almost exactly the same diameter as a baby's airway. If a child swallows a round 'coin' of hot dog without chewing it properly, it can get stuck and form an airtight seal, making it impossible for the child to breathe. Hot dogs are also very high in sodium (salt) and nitrates, which are not healthy for a baby's developing kidneys and heart.",
    howToChooseAndWash: "If you decide to serve sausages to an older baby (closer to 12 months), always look for low-sodium or nitrate-free versions. Remove the tough outer skin or casing before cooking, as this skin is very hard for a baby to chew and can also cause choking.",
    safetyChecklist: [
      "Never, ever cut hot dogs, sausages, or carrots into round 'coin' shapes.",
      "Always slice the meat lengthwise (from top to bottom) into thin, long strips like matchsticks.",
      "Dice the long strips into very small, pea-sized pieces for babies who are just learning to chew.",
      "Avoid giving processed meats frequently due to the high salt content.",
      "Always stay within arm's reach while your baby is eating any firm meat products."
    ],
    faqs: [
      {
        q: "Is it okay to give my baby a whole hot dog to hold?",
        a: "No. A baby can easily bite off a large chunk that they cannot chew, leading to a serious choking incident. Always cut the food for them into safe, thin pieces."
      },
      {
        q: "Are soft veggie dogs safer than meat hot dogs?",
        a: "While they might be slightly softer, the round shape is still the danger. You must still slice any sausage-shaped food lengthwise into thin strips to keep your baby safe."
      }
    ]
  },
  cows_milk: {
    intro: "Cow's milk is a staple in many diets, but for a baby under one year old, it is not a suitable replacement for breast milk or formula. While it is full of calcium, its nutritional balance is not right for a growing infant.",
    benefitsOrRisks: "The proteins and minerals in cow's milk are very heavy and difficult for a baby's immature kidneys and stomach to process. Drinking large amounts of cow's milk before 12 months can lead to microscopic bleeding in the baby's intestines, which can cause them to lose blood and become anemic (low in iron). Cow's milk also lacks the high levels of iron and Vitamin C that babies need to develop their brains and immune systems properly.",
    howToChooseAndWash: "When your baby reaches 12 months, you should choose whole, pasteurized cow's milk. Babies need the healthy fats in whole milk for their brain development until they are at least two years old. Do not use raw (unpasteurized) milk, as it can carry dangerous bacteria like E. coli or Salmonella.",
    safetyChecklist: [
      "Keep using breast milk or formula as your baby's main drink until their first birthday.",
      "You can safely use small amounts of cow's milk to cook porridge or mash vegetables from 6 months of age.",
      "Plain, full-fat yogurt and cheese are excellent foods to introduce before 12 months because the culturing process makes the milk proteins easier to digest.",
      "Avoid giving your baby plant-based milks (like almond or soy milk) as a main drink unless recommended by a healthcare provider, as they often lack the necessary fat and protein.",
      "Transition to whole cow's milk gradually after 12 months, limiting it to about 2 cups (500ml) a day to ensure they still have room for solid foods."
    ],
    faqs: [
      {
        q: "Can I give my baby cow's milk if I run out of formula?",
        a: "No. If you have an emergency, it is better to contact a friend, neighbor, or a local pharmacy for formula. Cow's milk does not have the right nutrients and can cause tummy problems for a young baby."
      },
      {
        q: "Is skimmed milk better for my baby to prevent them from getting too heavy?",
        a: "No. Babies need fat for their brains to grow. Skimmed and semi-skimmed milk do not have enough energy and vitamins for a child under two years old."
      }
    ]
  },
  salt_sugar: {
    intro: "Added salt and refined sugar are very common in the adult diet, but they have no place in a baby's meals. Introducing these ingredients too early can harm your baby's health and set them up for poor eating habits in the future.",
    benefitsOrRisks: "A baby's kidneys are very small and still developing. They cannot process more than a tiny amount of salt (sodium). If a baby eats too much salt, it can cause high blood pressure and put a dangerous strain on their kidneys. Refined sugar is also harmful as it causes tooth decay (even before teeth come in) and encourages a preference for only sweet foods, which can lead to obesity and a refusal to eat healthy vegetables later on.",
    howToChooseAndWash: "The best way to avoid salt and sugar is to prepare your baby's food at home using fresh, whole ingredients. If you are buying pre-made baby food, always check the label carefully. Many 'healthy' snacks for babies actually contain hidden sugars like fruit juice concentrate or maltodextrin. Look for labels that say 'no added salt' and 'no added sugar'.",
    safetyChecklist: [
      "Do not add any salt to the pot when cooking for your baby.",
      "Avoid using bouillon cubes, stock powders, or soy sauce, as these are almost entirely made of salt.",
      "Keep your baby away from sugary drinks like sodas, fruit juices, and flavored milks.",
      "Use natural herbs and spices like cinnamon, ginger, garlic, or lemon juice to make food taste exciting without using salt or sugar.",
      "Be careful with processed 'toddler snacks' like biscuits and rusks, which are often very high in sugar.",
      "Check that your baby is having less than 1 gram of salt (0.4 grams of sodium) in a whole day."
    ],
    faqs: [
      {
        q: "What if my baby's food tastes bland without salt?",
        a: "Babies do not have the same taste preferences as adults. They find the natural taste of a carrot or a potato very flavorful. Adding salt is an adult habit that babies do not need and cannot handle safely."
      },
      {
        q: "Is honey or maple syrup a better choice than white sugar?",
        a: "No. Honey is strictly dangerous for babies under one year due to botulism. Maple syrup and other 'natural' sugars still cause tooth decay and should be avoided to help your baby develop a healthy palate."
      }
    ]
  },
  grapes: {
    intro: "Grapes and cherry tomatoes are fantastic, juicy fruits that are full of vitamins and hydration. However, their physical shape is one of the most dangerous choking hazards for babies and young children.",
    benefitsOrRisks: "The problem with a grape is its size, shape, and skin. A whole grape is the perfect size and shape to completely block a child's airway. Because it is smooth and slippery, it can slide to the back of the throat before the baby has a chance to chew it. Once it is stuck, its rubbery texture makes it act like a plug, making it very difficult to dislodge with back blows.",
    howToChooseAndWash: "Always wash grapes and cherry tomatoes thoroughly under running water. Remove them from the stems and check for any that are bruised or overly soft. Even if the grapes are small, you must never serve them whole.",
    safetyChecklist: [
      "Never serve a whole grape or a whole cherry tomato to a child under five years old.",
      "Always cut grapes and cherry tomatoes lengthwise (from the stem end to the bottom) into at least four long quarters.",
      "Do not cut them into round 'wheels' or 'coins', as these can still block the airway.",
      "If you are at a party or a park, watch your baby closely to make sure they do not find a stray grape on a low table or on the ground.",
      "Always ensure your baby is sitting upright and focused on eating when having slippery fruits."
    ],
    faqs: [
      {
        q: "Is it safe to peel grapes for my baby?",
        a: "Peeling makes the grape less slippery, but the round shape is still the danger. You must still cut the peeled grape lengthwise into quarters to make it safe."
      },
      {
        q: "When can my child eat a whole grape?",
        a: "Most safety guidelines recommend waiting until a child is at least five years old. Even then, you should supervise them and encourage them to chew thoroughly."
      }
    ]
  },
  hard_raw_apples: {
    intro: "Raw apples and raw carrots are very healthy and crunchy, but for a baby, they are far too hard to chew safely. They are responsible for many choking incidents in infants who are just starting to eat solid foods.",
    benefitsOrRisks: "When a baby bites into a raw apple or a hard carrot, their sharp front teeth can easily snap off a large, hard piece. Because they do not have the back teeth needed to grind this hard chunk into a soft mush, they often try to swallow it whole. This hard piece can easily get stuck in their throat, blocking their breathing. Inhaling a hard piece of raw vegetable can also lead to serious lung issues.",
    howToChooseAndWash: "Wash all fruits and vegetables well before peeling. For babies, you must always soften these hard foods. Steaming or baking until the food is fork-tender is the safest way to prepare them. Alternatively, you can grate them into very fine shreds that the baby can swallow easily without chewing.",
    safetyChecklist: [
      "Never give raw chunks of apple, carrot, or pear to a baby under one year old.",
      "Steam or bake apple and carrot slices until you can easily mash them between your thumb and finger.",
      "If serving raw apple, use a fine grater to create a soft 'slush' that you can mix into yogurt or cereal.",
      "Offer very thin, translucent shavings of apple only if your baby is already a very confident eater.",
      "Always peel the skin off apples and carrots for younger babies, as the skin can be tough and hard to swallow."
    ],
    faqs: [
      {
        q: "My baby has four front teeth. Can they eat a raw apple now?",
        a: "No. Front teeth are for biting, not for grinding. Without back molars, your baby cannot break down a hard chunk of raw apple safely. Keep softening their food until they are older."
      },
      {
        q: "Is a boiled carrot safe if it's still a bit crunchy?",
        a: "No. For a baby, the carrot must be completely soft. If you can't squash it easily with your fingers, it is not soft enough for your baby's gums."
      }
    ]
  },
  peanut_butter: {
    intro: "Peanut butter is an excellent source of protein and healthy fats. Introducing peanuts early (around 6 months) is actually recommended to help prevent your baby from developing a peanut allergy, but the texture must be handled with extreme care.",
    benefitsOrRisks: "The main danger with peanut butter is its thick, sticky texture. If you give a baby a large spoonful of straight peanut butter, it can stick to the roof of their mouth and the back of their throat, making it nearly impossible for them to swallow or breathe. It acts like a glue that can block the airway. You must also ensure the peanut butter does not have added salt or sugar.",
    howToChooseAndWash: "Look for 'natural' smooth peanut butter that lists only 'peanuts' as the ingredient. Avoid 'crunchy' varieties because the tiny nut pieces are a choking risk. Never buy peanut butter with added oils, salt, or sugars for your baby.",
    safetyChecklist: [
      "Never give your baby a spoonful of plain, thick peanut butter.",
      "Always thin out peanut butter by mixing one teaspoon of it with two or three teaspoons of warm water, breast milk, or fruit puree until it is runny.",
      "Spread peanut butter very thinly on a piece of toast or a cracker so there are no thick clumps.",
      "When introducing peanuts for the first time, give a tiny amount and wait ten minutes to watch for any immediate allergic reaction like hives or swelling.",
      "Stir thinned peanut butter into warm oatmeal or yogurt for a safe and nutritious meal."
    ],
    faqs: [
      {
        q: "What if my family has a history of peanut allergies?",
        a: "If you are worried, talk to your care provider before introducing peanuts. However, many current guidelines suggest that early introduction under supervision is the best way to prevent an allergy from starting."
      },
      {
        q: "Can I use peanut butter as a dip for apple slices?",
        a: "Only if the apple slices are cooked soft and the peanut butter is thinned out. Thick peanut butter on a firm piece of fruit is a high-risk combination for choking."
      }
    ]
  },
  avocado: {
    intro: "Avocados are soft green fruits with a large pit. They are one of the absolute best first foods for babies because they are naturally soft, creamy, and packed with healthy nutrients.",
    benefitsOrRisks: "Avocados contain excellent healthy fats that help your baby's brain and eyes grow strong. They are naturally soft, meaning they do not need to be cooked, making them very easy and safe to prepare.",
    howToChooseAndWash: "Choose avocados that feel slightly soft when you squeeze them gently. Wash the outer green skin thoroughly before cutting to ensure no dirt gets onto the knife and fruit.",
    safetyChecklist: [
      "Mash fresh avocado with a fork into a smooth cream for babies starting solids.",
      "Cut soft avocado into long thick strips so your baby can grasp them easily.",
      "Always remove the large hard pit and peel the skin completely before serving.",
      "Serve avocado fresh, as it turns brown quickly after being cut."
    ],
    faqs: [
      {
        q: "Do I need to cook avocado for my baby?",
        a: "No. Avocado is naturally soft and ready to eat raw. Just peel, remove the seed, and mash it with a fork."
      },
      {
        q: "My baby drops the avocado because it is slippery. What can I do?",
        a: "You can roll the avocado strips in finely ground baby cereal or oatmeal powder. This makes it dry and much easier for their little fingers to grip."
      }
    ]
  },
  banana: {
    intro: "Bananas are sweet, yellow fruits that are easy to peel. They are a wonderful first food for babies because they are gentle on the stomach and very easy to swallow.",
    benefitsOrRisks: "Bananas are rich in potassium and vitamins that keep your baby's heart and tummy healthy. Their naturally soft texture makes them highly safe, but they must still be mashed or cut properly so babies do not swallow large chunks.",
    howToChooseAndWash: "Select ripe bananas with yellow skins. A few black spots are fine and mean the banana is sweet and soft. Peel the banana and remove any stringy bits before serving.",
    safetyChecklist: [
      "Mash bananas thoroughly with a fork for babies starting at six months.",
      "For older babies, cut bananas lengthwise into long, thin strips that are easy to hold.",
      "Do not cut bananas into thick round coin shapes as they can block the windpipe.",
      "Always sit your baby upright when feeding them banana."
    ],
    faqs: [
      {
        q: "Can banana cause constipation in babies?",
        a: "Ripe yellow bananas are easy to digest and help with bowel movements. However, green unripe bananas can cause tummy aches and constipation, so only use fully ripe ones."
      },
      {
        q: "How do I serve banana for baby-led weaning?",
        a: "You can cut a ripe banana in half. Peel the top half of the skin, leaving the bottom skin on. This gives your baby a perfect non-slip handle to hold while gumming the top."
      }
    ]
  },
  sweet_potato: {
    intro: "Sweet potatoes are orange root vegetables that grow underground. They are naturally sweet and are filled with vitamins that help your baby grow healthy.",
    benefitsOrRisks: "Sweet potatoes have lots of Vitamin A, which is excellent for your baby's eyesight and skin. They also have fiber to help your baby do easy, healthy poos. They must be cooked until completely soft before giving them to your baby.",
    howToChooseAndWash: "Choose firm sweet potatoes without bruises or soft spots. Wash them thoroughly in clean water to scrub off all dirt before peeling and cooking.",
    safetyChecklist: [
      "Always boil, steam, or bake sweet potatoes until they are soft like butter.",
      "Mash the cooked sweet potato with a little breast milk or warm water for six month old babies.",
      "Cut soft cooked sweet potato into finger-sized strips for babies to feed themselves.",
      "Always let the cooked sweet potato cool down completely before offering it to your baby."
    ],
    faqs: [
      {
        q: "Can I feed my baby sweet potato every day?",
        a: "Yes. Sweet potato is highly nutritious and very gentle on your baby's stomach, making it a wonderful daily vegetable."
      },
      {
        q: "Is it better to steam or boil sweet potatoes?",
        a: "Steaming is great because it keeps all the healthy vitamins inside the sweet potato. But boiling is also perfect as long as you cook it until it is fully soft."
      }
    ]
  },
  eggs: {
    intro: "Eggs are a fantastic source of protein and iron. Early introduction of fully cooked eggs is highly recommended to help protect your baby from developing egg allergies.",
    benefitsOrRisks: "Eggs are packed with choline, which helps your baby's brain grow smart. Because eggs are a common allergen, you should watch your baby closely for any reactions. Always make sure the egg is fully cooked to prevent food poisoning.",
    howToChooseAndWash: "Buy fresh eggs from clean stores. Store them in the fridge. Wash your hands thoroughly with soap and water after touching raw eggshells.",
    safetyChecklist: [
      "Only serve eggs that are completely cooked. The white and yolk must be firm, never runny.",
      "Mash hard-boiled egg with a fork and mix with a little breast milk or avocado.",
      "Wait three days after giving egg for the first time to make sure your baby has no red spots, itching, or vomiting.",
      "Always supervise your baby when they are eating egg."
    ],
    faqs: [
      {
        q: "Why can't babies eat soft-boiled or runny eggs?",
        a: "Runny eggs can have dangerous bacteria that cause severe tummy upsets and vomiting in babies. Fully cooking eggs kills these bacteria completely."
      },
      {
        q: "What should I do if my baby shows a reaction to eggs?",
        a: "If your baby gets red spots on their skin, starts coughing, or vomits after eating egg, stop giving eggs and take them to a doctor."
      }
    ]
  },
  salmon: {
    intro: "Salmon is a healthy fish rich in oils. It is a fantastic food for your baby's growing brain and body, but you must be extremely careful about bones.",
    benefitsOrRisks: "Salmon has special healthy oils called Omega-3, which make your baby's brain very smart and help their eyes see clearly. However, fish can have tiny, sharp bones that can choke your baby if they swallow them.",
    howToChooseAndWash: "Buy boneless salmon fillets. Even when the package says boneless, always run your fingers over the meat very carefully to feel for any hidden, sharp bones before cooking.",
    safetyChecklist: [
      "Poach, steam, or bake the salmon thoroughly until it flakes easily with a fork.",
      "Inspect every piece of fish with your fingers to ensure there are absolutely no bones.",
      "Mash the cooked fish with soft avocado or potato for your baby.",
      "Never give raw or undercooked fish to a baby."
    ],
    faqs: [
      {
        q: "How do I check for bones in fish safely?",
        a: "Flake the cooked fish into very small pieces using your fingers. Feel every tiny bite with your clean fingertips before putting it in your baby's bowl."
      },
      {
        q: "Can babies eat canned salmon?",
        a: "Yes. Canned salmon is healthy and convenient. Choose canned salmon in water with low or no added salt, and still check carefully for tiny bones."
      }
    ]
  },
  spinach_greens: {
    intro: "Spinach and dark greens are healthy leafy vegetables. They are full of vitamins and minerals, but they must be cooked and chopped correctly for babies.",
    benefitsOrRisks: "Spinach is rich in iron, which helps make healthy blood so your baby does not get tired or weak. Raw spinach leaves are flat and sticky, which can stick to the roof of your baby's mouth and make them choke. Cooking them makes them safe.",
    howToChooseAndWash: "Wash spinach leaves thoroughly in a bowl of clean water several times to wash away all sand, dirt, and tiny bugs.",
    safetyChecklist: [
      "Do not give raw spinach or raw green leaves to your baby.",
      "Always boil or steam green leaves thoroughly until they are completely soft.",
      "Chop cooked spinach very finely before mixing it into your baby's food.",
      "Combine spinach with foods rich in Vitamin C (like squeezed lemon or tomatoes) to help their body absorb the iron."
    ],
    faqs: [
      {
        q: "Why can't babies eat raw salad leaves?",
        a: "Raw green leaves are dry and can easily stick to the throat or slide down whole, causing choking. Cooking them makes them soft and safe."
      },
      {
        q: "How do I serve spinach to my six month old?",
        a: "Steam the spinach until very soft, puree it with a cooked sweet potato or pear, and feed it with a spoon."
      }
    ]
  },
  yogurt_greek: {
    intro: "Greek yogurt is a thick, creamy dairy food. It is full of calcium and is a great, easy snack for babies starting at six months.",
    benefitsOrRisks: "Greek yogurt is excellent for building strong bones and teeth because of its calcium. It also has good bacteria that keep your baby's stomach healthy. Make sure to buy plain yogurt, as sweet yogurts have too much sugar.",
    howToChooseAndWash: "Always buy plain, unsweetened yogurt made from whole pasteurized milk. Never buy low-fat, diet, or flavored yogurts for babies.",
    safetyChecklist: [
      "Only give plain, unsweetened yogurt to your baby.",
      "Store yogurt in a cold fridge and check the expiry date before serving.",
      "Use a clean spoon to scoop out the portion for your baby.",
      "You can stir in some soft mashed banana or apple sauce for natural sweetness."
    ],
    faqs: [
      {
        q: "Can I give my baby yogurt if they cannot drink cow's milk?",
        a: "Yes. Yogurt is safe for babies from six months because the milk proteins are already broken down, making it very easy for their tummy to digest."
      },
      {
        q: "Can babies have honey yogurt?",
        a: "No. Never give any yogurt containing honey to a baby under one year old, as honey contains dangerous germs that can make them very sick."
      }
    ]
  },
  broccoli: {
    intro: "Broccoli is a green vegetable that looks like a little tree. It is a fantastic finger food for babies who are learning to feed themselves.",
    benefitsOrRisks: "Broccoli has lots of Vitamin C and fiber, which help your baby's body fight off sickness and do healthy poos. The long stalk of a broccoli floret acts like a perfect handle for a baby to hold with their hand.",
    howToChooseAndWash: "Choose broccoli with bright green tops and firm stems. Wash it thoroughly in clean water to remove any dirt or tiny bugs hidden in the florets.",
    safetyChecklist: [
      "Never give raw or hard broccoli to your baby.",
      "Steam or boil broccoli florets until they are very soft and can be easily mashed with your fingers.",
      "Serve large florets with the stem so your baby has a handle to hold.",
      "Always watch your baby while they feed themselves broccoli."
    ],
    faqs: [
      {
        q: "What if my baby gags while eating broccoli?",
        a: "Gagging is a normal way babies learn to chew and spit out food. As long as your baby is sitting upright and making noise, they are safe. Just stay calm and watch them."
      },
      {
        q: "Can babies eat the broccoli stem?",
        a: "Yes, but only if it is peeled and cooked until it is very soft. The soft stem is actually great for their gums."
      }
    ]
  },
  lentils_beans: {
    intro: "Lentils and beans are small, healthy seeds that grow in pods. They are full of protein and are excellent for making your baby grow big and strong.",
    benefitsOrRisks: "Lentils and beans are full of plant protein, iron, and fiber. They are very gentle on your baby's body and help build strong muscles. They must be cooked thoroughly until they are soft enough to squash with your tongue.",
    howToChooseAndWash: "Wash dry lentils or beans in clean water to remove any tiny stones or dust before cooking. Soak dry beans in water overnight to make them cook faster.",
    safetyChecklist: [
      "Always cook lentils and beans until they are completely soft.",
      "Mash cooked beans or lentils thoroughly with a fork for younger babies.",
      "For older babies, you can give them soft whole lentils or slightly squashed cooked beans to pick up.",
      "Do not add salt or bouillon cubes to the pot when cooking beans for your baby."
    ],
    faqs: [
      {
        q: "Do beans make babies have gas?",
        a: "Yes, beans can sometimes cause a little gas. Cooking them very well and mashing them helps their small tummy digest them easily."
      },
      {
        q: "Can I use canned beans for my baby?",
        a: "Yes. Canned beans are safe and fast. Just make sure to buy canned beans with no added salt, and rinse them well with clean water before mashing."
      }
    ]
  },
  mango: {
    intro: "Mango is a sweet, juicy yellow fruit with a large flat seed. It is very delicious and is a great, refreshing food for babies.",
    benefitsOrRisks: "Mangoes have lots of Vitamin A and Vitamin C, which protect your baby's eyes and help their body heal. Because ripe mango is slippery, a baby can easily drop it, so you must prepare it carefully.",
    howToChooseAndWash: "Select ripe mangoes that smell sweet and feel slightly soft when pressed. Wash the outside skin thoroughly in clean water before cutting.",
    safetyChecklist: [
      "Peel the mango skin and cut the sweet yellow fruit away from the flat seed.",
      "Mash the mango fruit with a fork for younger babies starting solids.",
      "Cut ripe mango into long, thick strips for older babies to hold.",
      "Always supervise your baby when they are holding and eating slippery mango."
    ],
    faqs: [
      {
        q: "How do I make slippery mango easier for my baby to hold?",
        a: "You can roll the mango strips in ground baby cereal or crushed oatmeal. This stops the fruit from slipping out of their little hands."
      },
      {
        q: "Can I give my baby the flat mango seed to suck on?",
        a: "Yes. You can carve most of the fruit off and give your baby the large, flat mango seed. Sucking and gumming the seed is very soothing for teething gums."
      }
    ]
  }
};
