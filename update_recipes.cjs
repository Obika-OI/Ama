const fs = require('fs');

const NEW_RECIPES = `[
  {
    id: 'r1',
    title: 'Creamy Plantain and Carrot Mash',
    description: 'Plantains provide natural sweetness and energy, while carrots add key vitamins.',
    time: '15m',
    type: 'lunch',
    image: 'https://picsum.photos/seed/plantain/800/600',
    stage: 'First Purees',
    category: 'Purees',
    costPerServe: '₦200',
    nutrients: [
      { label: 'Energy', value: 'High', icon: '⚡' },
      { label: 'Vit A', value: 'Good', icon: '🥕' }
    ],
    ingredients: [
      { name: 'Ripe Plantain', amount: '1/2' },
      { name: 'Medium Carrot', amount: '1' },
      { name: 'Breastmilk/Yogurt', amount: '1 tbsp' }
    ],
    steps: [
      'Peel and slice the plantain and carrot.',
      'Boil them in a pot of water until very soft (about 15 minutes). Drain the water.',
      'Mash the pieces together with a fork or blend them until smooth. Stir in the breastmilk or yogurt to make it creamy.'
    ]
  },
  {
    id: 'r2',
    title: 'Rich Tom Brown Cereal',
    description: 'Tom Brown is a traditional, nutrient-dense powder made from grains and legumes. Great for baby\\'s weight gain.',
    time: '10m',
    type: 'breakfast',
    image: 'https://picsum.photos/seed/tombrown/800/600',
    stage: 'First Purees',
    category: 'Cereals',
    costPerServe: '₦300',
    nutrients: [
      { label: 'Protein', value: 'High', icon: '💪' },
      { label: 'Weight', value: 'Boost', icon: '📈' }
    ],
    ingredients: [
      { name: 'Tom Brown powder', amount: '2 tbsp' },
      { name: 'Water', amount: '1 cup' },
      { name: 'Breastmilk/Formula', amount: 'As needed' }
    ],
    steps: [
      'Mix the powder with a little cold water in a bowl to form a smooth paste.',
      'Boil a separate cup of water.',
      'Slowly pour the hot water into the paste while stirring constantly to avoid lumps.',
      'Return the pot to the stove for 2-3 minutes on low heat until it thickens. Let it cool, then stir in milk.'
    ]
  },
  {
    id: 'r3',
    title: 'Soft Bean Puree',
    description: 'Beans are a great source of protein for growing muscles.',
    time: '40m',
    type: 'lunch',
    image: 'https://picsum.photos/seed/beans/800/600',
    stage: 'Second Foods',
    category: 'Purees',
    costPerServe: '₦150',
    nutrients: [
      { label: 'Protein', value: 'High', icon: '🌱' },
      { label: 'Iron', value: 'Good', icon: '🩸' }
    ],
    ingredients: [
      { name: 'Peeled honey beans', amount: '1/2 cup' },
      { name: 'Onion', amount: '1/4' },
      { name: 'Palm oil', amount: '1 tsp' }
    ],
    steps: [
      'Soak and peel the beans to remove the hard skin.',
      'Boil them with the chopped onions until they are very soft.',
      'Mash the beans thoroughly.',
      'Add a small teaspoon of palm oil (and a dash of mashed, deboned fish, if your baby is over 8 months).'
    ]
  },
  {
    id: 'r4',
    title: 'Steamed Fish & Crayfish Moi Moi',
    description: 'A smooth, protein-rich steamed pudding made for easy holding and eating.',
    time: '45m',
    type: 'dinner',
    image: 'https://picsum.photos/seed/moimoi/800/600',
    stage: 'Finger Foods',
    category: 'Finger Foods',
    costPerServe: '₦400',
    nutrients: [
      { label: 'Protein', value: 'High', icon: '🐟' },
      { label: 'Omega-3', value: 'Good', icon: '🧠' }
    ],
    ingredients: [
      { name: 'Peeled brown beans', amount: '1 cup' },
      { name: 'Flaked deboned fish', amount: '1/4 cup' },
      { name: 'Ground crayfish', amount: '1 tsp' },
      { name: 'Palm oil', amount: '1 tbsp' }
    ],
    steps: [
      'Blend the peeled beans with a little water into a thick, smooth batter.',
      'Stir in the fish, crayfish, and palm oil.',
      'Pour into small ramekins or uma leaves and steam until firm.',
      'Once cooled, slice the moi moi into long, thick strips that the baby can easily hold.'
    ]
  },
  {
    id: 'r5',
    title: 'Soft-Boiled Ripe Plantain Strips',
    description: 'Dodo Alternative - perfectly soft and sweet finger food.',
    time: '15m',
    type: 'snack',
    image: 'https://picsum.photos/seed/plantainstrips/800/600',
    stage: 'Finger Foods',
    category: 'Finger Foods',
    costPerServe: '₦100',
    nutrients: [
      { label: 'Potassium', value: 'High', icon: '🍌' },
      { label: 'Energy', value: 'Good', icon: '⚡' }
    ],
    ingredients: [
      { name: 'Ripe yellow plantain', amount: '1' }
    ],
    steps: [
      'Instead of deep-frying (which makes edges too tough for young gums), cut the ripe plantain into thick, finger-length batons.',
      'Steam or boil the strips until they are perfectly soft and sweet.',
      'Serve at room temperature for easy self-feeding.'
    ]
  },
  {
    id: 'r6',
    title: 'Baked Yam & Ugu Eggettes',
    description: 'Nutritious tater tots made with yam, egg, and fresh ugu leaves.',
    time: '30m',
    type: 'dinner',
    image: 'https://picsum.photos/seed/yameggets/800/600',
    stage: 'Finger Foods',
    category: 'Finger Foods',
    costPerServe: '₦250',
    nutrients: [
      { label: 'Iron', value: 'High', icon: '🌿' },
      { label: 'Protein', value: 'Good', icon: '🥚' }
    ],
    ingredients: [
      { name: 'Boiled mashed yam', amount: '1 cup' },
      { name: 'Whisked egg', amount: '1' },
      { name: 'Finely chopped ugu leaves', amount: 'Handful' }
    ],
    steps: [
      'Thoroughly mix the mashed yam, chopped ugu, and whisked egg together.',
      'Scoop the mixture and shape it into small, log-shaped tater tots.',
      'Bake at 180°C (350°F) for 15 minutes until set but still soft on the inside. Sizing should mimic an adult pinky finger for safe gripping.'
    ]
  },
  {
    id: 'r7',
    title: 'Creamy White Yam & Ugu Puree',
    description: 'A smooth, vitamin-packed puree perfect for starting solids.',
    time: '20m',
    type: 'lunch',
    image: 'https://picsum.photos/seed/yampuree/800/600',
    stage: 'First Purees',
    category: 'Purees',
    costPerServe: '₦150',
    nutrients: [
      { label: 'Energy', value: 'High', icon: '🥔' },
      { label: 'Iron', value: 'Good', icon: '🌿' }
    ],
    ingredients: [
      { name: 'White yam (peeled and diced)', amount: '1/2 cup' },
      { name: 'Fresh ugu (pumpkin) leaves', amount: 'Handful' },
      { name: 'Red palm oil', amount: '1 tsp' },
      { name: 'Breast milk or formula', amount: 'As needed' }
    ],
    steps: [
      'Boil the yam until fork-tender.',
      'Add the ugu leaves for the last 3 minutes of boiling.',
      'Drain, reserving the cooking liquid.',
      'Blend the yam, ugu, and palm oil together, adding breast milk or formula to achieve a completely smooth texture.'
    ]
  },
  {
    id: 'r8',
    title: 'Ripe Plantain & Fish Puree',
    description: 'Sweet and savory combo rich in omega-3 and energy.',
    time: '25m',
    type: 'dinner',
    image: 'https://picsum.photos/seed/fishpuree/800/600',
    stage: 'Second Foods',
    category: 'Purees',
    costPerServe: '₦350',
    nutrients: [
      { label: 'Omega-3', value: 'High', icon: '🐟' },
      { label: 'Energy', value: 'Good', icon: '⚡' }
    ],
    ingredients: [
      { name: 'Ripe yellow plantain', amount: '1/2' },
      { name: 'Deboned fresh fish', amount: '1 small piece' },
      { name: 'Ground crayfish', amount: 'Pinch' }
    ],
    steps: [
      'Steam the diced plantain and deboned fish together until the plantain is soft and the fish is completely cooked.',
      'Double-check the fish for hidden bones.',
      'Blend both ingredients with the steaming liquid and ground crayfish until creamy.'
    ]
  },
  {
    id: 'r9',
    title: 'Sweet Potato & Fresh Corn Porridge Puree',
    description: 'Naturally sweet and rich in fiber and vitamins.',
    time: '25m',
    type: 'lunch',
    image: 'https://picsum.photos/seed/cornpuree/800/600',
    stage: 'First Purees',
    category: 'Purees',
    costPerServe: '₦180',
    nutrients: [
      { label: 'Vit A', value: 'High', icon: '🍠' },
      { label: 'Fiber', value: 'Good', icon: '🌽' }
    ],
    ingredients: [
      { name: 'Sweet potato', amount: '1/2 cup' },
      { name: 'Fresh sweet corn kernels', amount: '1/4 cup' },
      { name: 'Red palm oil', amount: '1 tsp' }
    ],
    steps: [
      'Boil the sweet potato and corn together until very soft.',
      'Blend the mixture thoroughly, then pass it through a fine sieve to remove any residual tough corn skins.',
      'Stir in the palm oil while warm.'
    ]
  }
]`;

let consts = fs.readFileSync('src/constants.ts', 'utf8');

// Replace MOCK_MEALS with the new recipes. Remove existing ones.
consts = consts.replace(/export const MOCK_MEALS: Meal\[\] = \[[\s\S]*?\];/m, `export const MOCK_MEALS: Meal[] = ${NEW_RECIPES};`);

fs.writeFileSync('src/constants.ts', consts);
console.log('Constants updated.');
