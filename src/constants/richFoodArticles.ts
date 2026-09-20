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
  honey: {
    intro: "Honey is a natural sweet syrup made by bees. While it is healthy for older kids and grown ups, it is extremely dangerous for little babies who are under one year old.",
    benefitsOrRisks: "Honey has tiny, invisible germs called botulism spores. A grown up's body can easily destroy these germs. But a baby's tummy is still too small and weak. If these germs get into a baby's tummy, they can make a poison. This poison can make your baby very weak, make it hard for them to breathe, and can even cause death.",
    howToChooseAndWash: "You do not need to buy or prepare honey for a baby under twelve months old. If you have honey in your house, keep it on a high shelf where a child cannot reach it. Never use honey to sweeten your baby's milk, porridge, or water.",
    safetyChecklist: [
      "Never give raw or cooked honey to a baby under one year old.",
      "Check the labels of bought foods like biscuits or breads to make sure they do not have honey.",
      "Do not put honey on your baby's dummy or pacifier to make them stop crying.",
      "If your baby accidentally eats honey and looks sleepy, weak, or has trouble sucking, take them to a doctor immediately."
    ],
    faqs: [
      {
        q: "Can I use honey if it is baked or cooked in baby food?",
        a: "No. Cooking or baking honey does not kill the dangerous germs. It remains unsafe for your baby until they reach their first birthday."
      },
      {
        q: "What should I do if my baby gets honey by mistake?",
        a: "Watch your baby closely. If your baby gets weak, has a floppy neck, has constipation, or has trouble crying, go to the nearest hospital right away."
      }
    ]
  },
  whole_nuts: {
    intro: "Whole nuts are hard, dry fruits like peanuts, cashews, and almonds. They are packed with protein, but their hard shape makes them one of the biggest choking dangers for babies.",
    benefitsOrRisks: "Because nuts are small and hard, a baby cannot chew them with their gums. If a baby tries to swallow a whole nut, it can easily slide into their breathing pipe instead of their food pipe. This can block their air completely, which makes it impossible for them to breathe.",
    howToChooseAndWash: "Only buy smooth nut powders or smooth nut butter for babies. Never buy whole nuts or chopped nuts for your baby. Store whole nuts in locked cupboards away from children.",
    safetyChecklist: [
      "Never give whole, chopped, or crushed nuts to a baby under five years old.",
      "You can introduce the taste of peanuts early by using smooth peanut butter thinned with water or breast milk.",
      "Always stay close and watch your baby when they try any food that has nut ingredients.",
      "Store nuts high up so older siblings cannot accidentally feed them to the baby."
    ],
    faqs: [
      {
        q: "When can a child safely eat whole nuts?",
        a: "Doctors recommend waiting until your child is four or five years old before giving them whole nuts. By this age, they have back teeth to grind hard foods safely."
      },
      {
        q: "How can I give peanut protein safely to my six month old?",
        a: "Mix a tiny half spoon of smooth peanut butter with two spoons of warm water or breast milk until it is thin and runny. Stir it into their warm baby cereal."
      }
    ]
  },
  popcorn: {
    intro: "Popcorn is a popular snack made from heated corn kernels. It is very dry and light, but it has sharp edges and hard pieces that are highly dangerous for young children.",
    benefitsOrRisks: "Popcorn has hard unpopped kernels and dry skins that can get stuck in a baby's throat. Because it is light and dry, a baby can easily breathe it into their lungs when they gasp or laugh. This can cause severe breathing blockages and lung infections.",
    howToChooseAndWash: "Do not buy or make popcorn for your baby. Instead, choose soft snacks like well boiled sweet potato cubes or soft mashed fruits that melt easily in the baby's mouth.",
    safetyChecklist: [
      "Do not give popcorn to babies or toddlers under four years of age.",
      "Keep popcorn bowls out of reach during family movie nights.",
      "If an older child is eating popcorn, make sure they do not drop pieces on the floor where the baby can crawl and find them.",
      "Choose puffed corn snacks made specifically for babies that dissolve instantly without choking hazards."
    ],
    faqs: [
      {
        q: "Is soft popcorn safe if I cut off the hard kernel pieces?",
        a: "No. Even the soft white part of popcorn can gather into a sticky ball in a baby's small throat and block their breathing. It is best to avoid it completely."
      },
      {
        q: "What are safe alternative finger foods for my ten month old?",
        a: "Try giving your baby soft food like small pieces of banana, well cooked sweet potato, or small cooked peas."
      }
    ]
  },
  hot_dogs: {
    intro: "Hot dogs and sausages are processed meat cylinders. While easy to prepare, their round shape and rubbery texture pose an extreme choking risk for babies.",
    benefitsOrRisks: "A whole hot dog or a round circular slice of hot dog is the exact same size as a baby's windpipe. If it gets stuck, it acts like a cork in a bottle, sealing the airway completely. Processed meats also contain high levels of salt and chemicals that are bad for a baby's small kidneys.",
    howToChooseAndWash: "If you must serve sausages to an older baby, buy low sodium varieties. Always remove the tough outer skin or casing before cooking. Boil thoroughly before cutting.",
    safetyChecklist: [
      "Never cut hot dogs or sausages into round circular discs or coins.",
      "Always peel off the skin and slice the meat lengthwise into thin, long strips like matchsticks.",
      "Serve sausage only to babies who are already good at chewing other soft foods.",
      "Avoid giving high salt foods to babies to protect their delicate kidneys."
    ],
    faqs: [
      {
        q: "Why are round sausage coins so dangerous?",
        a: "Because they are round and firm, they can perfectly block your baby's throat like a plug. Slicing them lengthwise into thin strips makes them safe."
      },
      {
        q: "Are vegetarian sausages safer for babies?",
        a: "Vegetarian sausages can still cause choking if cut into round discs. You must always slice any sausage shape lengthwise into thin strips."
      }
    ]
  },
  cows_milk: {
    intro: "Cow's milk is the milk that comes from cows. While it is good for older toddlers, it should not be given to your baby as their main drink before they are one year old.",
    benefitsOrRisks: "Before twelve months, a baby's stomach cannot digest the heavy proteins and minerals in cow's milk. It can cause tiny bleeding inside their tummy, which can make them lose iron and become weak. Cow's milk also does not have enough iron and nutrients to help a young baby grow properly.",
    howToChooseAndWash: "Always buy pasteurized, full fat whole cow's milk. Do not buy skimmed or low fat milk for young children, as they need the healthy fats for their growing brains.",
    safetyChecklist: [
      "Keep using breast milk or baby formula as your baby's main drink until they are one year old.",
      "You can use small amounts of cow's milk to mix into baby cereal or mashed foods from six months.",
      "Plain full fat yogurt and cheese are safe and healthy to give before twelve months because they are easier to digest.",
      "When your baby turns one, you can start giving them whole cow's milk as a drink."
    ],
    faqs: [
      {
        q: "Why can babies eat yogurt but not drink cow's milk?",
        a: "The way yogurt is made breaks down the heavy milk proteins. This makes it much gentler and easier for your baby's small stomach to digest."
      },
      {
        q: "Can I give my baby skimmed or semi-skimmed milk?",
        a: "No. Babies under two years old need the full fat in whole milk to help their brains and bodies grow strong."
      }
    ]
  },
  salt_sugar: {
    intro: "Added salt and refined sugar are white crystals used to flavor food. While grown ups use them daily, they should be kept out of your baby's food entirely.",
    benefitsOrRisks: "A baby has very small, delicate kidneys that cannot process added salt. Giving them too much salt can make them very sick. Added sugar is also bad because it causes tooth decay and makes your baby only want sweet things, refusing healthy vegetables.",
    howToChooseAndWash: "Prepare your baby's food at home using fresh ingredients without adding any salt or sugar. Use natural herbs like a pinch of cinnamon, garlic, or coriander to make food taste nice without risks.",
    safetyChecklist: [
      "Do not add salt, bouillon cubes, or soy sauce to your baby's pot.",
      "Do not give your baby sugary juices, sodas, or sweets.",
      "Check the labels of bought baby foods and avoid any with added sugar or high sodium.",
      "Keep your baby's meals simple, fresh, and naturally flavored."
    ],
    faqs: [
      {
        q: "How much salt can my baby have in a day?",
        a: "Babies under one year old should have less than one gram of salt per day. This small amount is already naturally present in breast milk and basic foods."
      },
      {
        q: "Can I use honey or brown sugar instead of white sugar?",
        a: "No. Never use honey for babies under one year. Brown sugar, maple syrup, and fruit juices still damage teeth and should be avoided."
      }
    ]
  },
  grapes: {
    intro: "Grapes and cherry tomatoes are juicy, round fruits. They are excellent sources of vitamins, but their round shape is highly dangerous for babies.",
    benefitsOrRisks: "The round, smooth shape of a whole grape matches the exact size of a baby's airway. If swallowed whole, it can get stuck tightly in their throat, blocking all air. The skin can also make it slippery and hard to cough out.",
    howToChooseAndWash: "Pluck grapes from their stems and wash them thoroughly in clean, running water. Always touch each grape to make sure it is not rotten.",
    safetyChecklist: [
      "Never serve whole grapes or whole cherry tomatoes to a baby or toddler.",
      "Always cut grapes lengthwise into four long quarters (top to bottom).",
      "Do not cut grapes horizontally into round wheels, as these are still dangerous.",
      "Always stay with your baby while they eat and make sure they sit up straight."
    ],
    faqs: [
      {
        q: "Is it safe to peel grapes before giving them to my baby?",
        a: "Peeling makes them less slippery, but they are still a choking hazard if served whole. You must always cut them lengthwise into quarters."
      },
      {
        q: "What should I do if my baby chokes on a grape?",
        a: "If your baby cannot make sound or breathe, lay them face down on your arm and give five firm slaps on their back between the shoulder blades. Seek emergency medical help immediately."
      }
    ]
  },
  hard_raw_apples: {
    intro: "Raw apples and raw carrots are crunchy, hard fruits and vegetables. They are full of fiber, but they are too hard for a baby to chew safely with their gums.",
    benefitsOrRisks: "When a baby bites a raw apple or carrot, their front teeth can snap off a hard chunk. Since they do not have back teeth to grind it, they try to swallow it whole. This hard chunk can get stuck in their throat and stop their breathing.",
    howToChooseAndWash: "Peel raw carrots and apples, and wash them well with clean water. Always cook them until they are soft before serving them to your baby.",
    safetyChecklist: [
      "Never give raw chunks of hard apples or carrots to a baby under one year.",
      "Steam or bake apple slices and carrots until they are soft enough to mash easily with your fingers.",
      "You can grate raw apples or carrots finely and mix them into oatmeal or yogurt.",
      "Make sure the cooked pieces are soft and easy for the baby's gums to crush."
    ],
    faqs: [
      {
        q: "Is a raw apple safe if I cut it very small?",
        a: "Small raw chunks are still hard and can easily slide down the throat and cause choking. It is much safer to grate them finely or cook them until soft."
      },
      {
        q: "How can I tell if a cooked carrot is soft enough?",
        a: "Press the cooked carrot piece between your thumb and index finger. If it mashes flat easily, it is perfectly safe for your baby."
      }
    ]
  },
  peanut_butter: {
    intro: "Peanut butter is a thick paste made from ground peanuts. It is full of healthy fats and protein, but its sticky nature requires careful preparation.",
    benefitsOrRisks: "Giving your baby a thick spoonful of peanut butter can be very dangerous. It is extremely sticky and can glue itself to the roof of your baby's mouth and throat, making it very hard for them to swallow or breathe.",
    howToChooseAndWash: "Buy smooth, unsalted peanut butter. Do not buy crunchy peanut butter because it has hard nut pieces that can choke your baby.",
    safetyChecklist: [
      "Never give a spoonful of straight peanut butter to a baby.",
      "Always thin peanut butter with warm water, breast milk, or mix it into a warm fruit puree.",
      "Spread peanut butter very thinly on toast strips instead of leaving thick clumps.",
      "Introduce peanut butter early to help prevent allergies, but always in a safe, thin form."
    ],
    faqs: [
      {
        q: "How do I make peanut butter safe for my six month old?",
        a: "Mix half a teaspoon of smooth peanut butter with two teaspoons of warm water or breast milk. Stir until it is thin and watery, then mix it into warm cereal."
      },
      {
        q: "Can I use crunchy peanut butter?",
        a: "No. Crunchy peanut butter contains tiny hard nut pieces that are a choking danger for babies. Always use 100% smooth peanut butter."
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
