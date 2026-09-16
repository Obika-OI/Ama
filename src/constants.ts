import { Meal } from './types';
import plantainCarrotImg from './assets/images/plantain_carrot_art_1787687383642.jpg';
import tombrownImg from './assets/images/tombrown_cereal_art_1787687398628.jpg';
import honeyBeansImg from './assets/images/honey_beans_art_1787687872754.jpg';
import moimoiImg from './assets/images/moimoi_pudding_art_1787687412932.jpg';
import plantainSticksImg from './assets/images/plantain_sticks_art_1787687885049.jpg';
import yamUguTotsImg from './assets/images/yam_ugu_tots_art_1787687896946.jpg';
import yamUguCloudsImg from './assets/images/yam_ugu_clouds_art_1787687911057.jpg';
import plantainFishImg from './assets/images/plantain_fish_art_1787687922824.jpg';
import sweetpotatoCornImg from './assets/images/sweetpotato_corn_art_1787687933607.jpg';
import avocadoBananaImg from './assets/images/avocado_banana_art_1787687426463.jpg';
import applePearImg from './assets/images/apple_pear_art_1787687947924.jpg';
import oatmealBerryImg from './assets/images/oatmeal_berry_art_1787687441091.jpg';
import salmonSweetpotatoImg from './assets/images/salmon_sweetpotato_art_1787687959871.jpg';
import bananaPancakesImg from './assets/images/banana_pancakes_art_1787687971380.jpg';
import peaMintImg from './assets/images/pea_mint_art_1787687981612.jpg';

export const STANDARD_RECIPES: Meal[] = [
  {
    id: 'r1',
    title: 'Sweet Golden Plantain & Carrot Smiles',
    description: 'Plantains provide natural sweetness and energy, while carrots add key vitamins.',
    time: '15m',
    type: 'lunch',
    image: plantainCarrotImg,
    stage: 'Purees',
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
    title: 'Yummy Tom Brown Sunshine Cereal',
    description: 'Tom Brown is a traditional, nutrient-dense powder made from grains and legumes. Great for baby\'s weight gain.',
    time: '10m',
    type: 'breakfast',
    image: tombrownImg,
    stage: 'Purees',
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
    title: 'Happy Honey Bean Hugs',
    description: 'Beans are a great source of protein for growing muscles.',
    time: '40m',
    type: 'lunch',
    image: honeyBeansImg,
    stage: 'Purees',
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
    title: 'Little Sailor\'s Crayfish Moi Moi',
    description: 'A smooth, protein-rich steamed pudding made for easy holding and eating.',
    time: '45m',
    type: 'dinner',
    image: moimoiImg,
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
    title: 'Golden Plantain Peek-a-Boo Sticks',
    description: 'Dodo Alternative - perfectly soft and sweet finger food.',
    time: '15m',
    type: 'snack',
    image: plantainSticksImg,
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
    title: 'Tiny Yam & Ugu Eggy Tots',
    description: 'Nutritious tater tots made with yam, egg, and fresh ugu leaves.',
    time: '30m',
    type: 'dinner',
    image: yamUguTotsImg,
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
    title: 'Dreamy White Yam & Green Ugu Clouds',
    description: 'A smooth, vitamin-packed puree perfect for starting solids.',
    time: '20m',
    type: 'lunch',
    image: yamUguCloudsImg,
    stage: 'Purees',
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
    title: 'Sweet Plantain & Cozy Little Fish Mash',
    description: 'Sweet and savory combo rich in omega-3 and energy.',
    time: '25m',
    type: 'dinner',
    image: plantainFishImg,
    stage: 'Purees',
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
    title: 'Golden Yammy Sweet Potato & Sweet Corn Velvet',
    description: 'Naturally sweet and rich in fiber and vitamins.',
    time: '25m',
    type: 'lunch',
    image: sweetpotatoCornImg,
    stage: 'Purees',
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
  },
  {
    id: 'r10',
    title: 'Avocado Banana Dream Mash',
    description: 'A super-creamy mash packed with healthy monounsaturated fats and potassium.',
    time: '5m',
    type: 'snack',
    image: avocadoBananaImg,
    stage: 'Purees',
    category: 'Purees',
    costPerServe: '$0.50',
    nutrients: [
      { label: 'Healthy Fats', value: 'High', icon: '🥑' },
      { label: 'Potassium', value: 'Good', icon: '🍌' }
    ],
    ingredients: [
      { name: 'Ripe Hass Avocado', amount: '1/2' },
      { name: 'Ripe Banana', amount: '1/2' }
    ],
    steps: [
      'Cut the avocado in half, remove the pit, and scoop out the flesh.',
      'Peel the banana and slice into a clean bowl.',
      'Use a fork to mash both fruits together until completely smooth and velvety. Serve immediately.'
    ]
  },
  {
    id: 'r11',
    title: 'Sweet Apple & Cozy Pear Compote',
    description: 'A warm, soothing stewed fruit combo thinned to perfection.',
    time: '15m',
    type: 'snack',
    image: applePearImg,
    stage: 'Purees',
    category: 'Purees',
    costPerServe: '$0.40',
    nutrients: [
      { label: 'Vitamin C', value: 'Good', icon: '🍎' },
      { label: 'Fiber', value: 'High', icon: '🍐' }
    ],
    ingredients: [
      { name: 'Sweet Red Apple', amount: '1' },
      { name: 'Ripe Pear', amount: '1' },
      { name: 'Water', amount: '1/4 cup' }
    ],
    steps: [
      'Peel, core, and dice the apple and pear.',
      'Place in a saucepan with water and cover.',
      'Simmer over medium-low heat for 10-12 minutes until soft.',
      'Mash with a potato masher or blend smooth.'
    ]
  },
  {
    id: 'r12',
    title: 'Warm Oatmeal & Berry Bliss Porridge',
    description: 'Organic baby oats with a sweet berry swirl for a perfect breakfast.',
    time: '10m',
    type: 'breakfast',
    image: oatmealBerryImg,
    stage: 'Solids',
    category: 'Cereals',
    costPerServe: '$0.60',
    nutrients: [
      { label: 'Iron', value: 'High', icon: '🥣' },
      { label: 'Antioxidants', value: 'Great', icon: '🍓' }
    ],
    ingredients: [
      { name: 'Baby Oats', amount: '1/4 cup' },
      { name: 'Water or Milk', amount: '1/2 cup' },
      { name: 'Mashed Blueberries', amount: '1 tbsp' }
    ],
    steps: [
      'Cook baby oats in milk or water on low heat for 5 minutes, stirring continuously.',
      'Stir in mashed blueberries to create a beautiful purple swirl.',
      'Cool down and serve warm.'
    ]
  },
  {
    id: 'r13',
    title: 'Salmon & Sweet Potato Cozy Bites',
    description: 'Rich in omega-3 fatty acids for brain development and vitamin A for eyesight.',
    time: '25m',
    type: 'dinner',
    image: salmonSweetpotatoImg,
    stage: 'Solids',
    category: 'Solids',
    costPerServe: '$1.20',
    nutrients: [
      { label: 'Omega-3', value: 'Excellent', icon: '🧠' },
      { label: 'Vitamin A', value: 'High', icon: '🍠' }
    ],
    ingredients: [
      { name: 'Salmon Fillet (Skinless)', amount: '50g' },
      { name: 'Sweet Potato', amount: '1/2 cup diced' }
    ],
    steps: [
      'Steam the diced sweet potato until tender (about 12 minutes).',
      'Add salmon on top for the last 6 minutes of steaming.',
      'Ensure salmon is fully cooked, flaky, and bone-free.',
      'Mash both elements together with a fork, leaving a tiny bit of soft texture.'
    ]
  },
  {
    id: 'r14',
    title: 'Adorably Sweet Banana Pancakes',
    description: 'Super fluffy, 3-ingredient finger pancakes perfect for self-feeding.',
    time: '12m',
    type: 'breakfast',
    image: bananaPancakesImg,
    stage: 'Finger Foods',
    category: 'Finger Foods',
    costPerServe: '$0.45',
    nutrients: [
      { label: 'Potassium', value: 'High', icon: '🍌' },
      { label: 'Protein', value: 'Good', icon: '🥚' }
    ],
    ingredients: [
      { name: 'Ripe Banana', amount: '1' },
      { name: 'Egg', amount: '1' },
      { name: 'Baby Oats Flour', amount: '2 tbsp' }
    ],
    steps: [
      'In a bowl, mash the banana completely.',
      'Whisk in the egg and oat flour until a smooth batter forms.',
      'Heat a non-stick skillet over low heat and scoop small silver-dollar pancakes.',
      'Cook for 2-3 minutes per side until lightly golden.'
    ]
  },
  {
    id: 'r15',
    title: 'Sweet Pea & Minty Magic Mash',
    description: 'A vibrant green puree thinned with milk, sweet and delicious.',
    time: '8m',
    type: 'lunch',
    image: peaMintImg,
    stage: 'Purees',
    category: 'Purees',
    costPerServe: '$0.30',
    nutrients: [
      { label: 'Fiber', value: 'Good', icon: '🟢' },
      { label: 'Protein', value: 'Source', icon: '🌱' }
    ],
    ingredients: [
      { name: 'Organic Green Peas', amount: '1/2 cup' },
      { name: 'Fresh Mint Leaf', amount: '1' },
      { name: 'Breastmilk/Formula', amount: '1 tbsp' }
    ],
    steps: [
      'Steam the peas with the mint leaf for 5 minutes.',
      'Discard the mint leaf (retaining the subtle mint aroma).',
      'Blend the peas smooth with breastmilk/formula, sifting if necessary to remove skins.'
    ]
  }
];

export const THEME = {
  primary: '#37b1f5', // Sky blue (water)
  secondary: '#FFD6E8', // Pastel Pink (card)
  accent: '#ffd700', // Standard Gold (stars)
  background: '#D2E9F9', // Light Blue
  card: '#FFD6E8', // Pastel Pink
  text: '#2D3436',
  muted: '#636E72',
  fontSerif: '"Playfair Display", serif',
};

export const QUEST_POOL = [
  {
    id: 'a1',
    title: 'Tummy Time Explorer',
    description: 'Place a mirror or interactive toy in front of baby during tummy time to encourage neck strength.',
    points: 50,
    category: 'physical' as const,
    isCompleted: false,
    icon: '👶'
  },
  {
    id: 'a2',
    title: 'Texture Touch',
    description: 'Let baby touch different textured fabrics (silk, wool, cotton) to stimulate tactile sensory development.',
    points: 30,
    category: 'sensory' as const,
    isCompleted: false,
    icon: '🧤'
  },
  {
    id: 'a3',
    title: 'Peek-a-Boo Surprise',
    description: 'Play a classic game of peek-a-boo with a soft cloth to help baby understand object permanence.',
    points: 40,
    category: 'social' as const,
    isCompleted: false,
    icon: '🙈'
  },
  {
    id: 'a4',
    title: 'Mirror Self-Discovery',
    description: 'Spend time pointing out features in the mirror to improve self-awareness and visual skills.',
    points: 35,
    category: 'social' as const,
    isCompleted: false,
    icon: '🪞'
  },
  {
    id: 'a5',
    title: 'Bath Splash Fun',
    description: 'Gently scoop and splash water with baby during bath time to stimulate water touch sensory.',
    points: 45,
    category: 'sensory' as const,
    isCompleted: false,
    icon: '🛁'
  },
  {
    id: 'a6',
    title: 'Nursery Sing-Along',
    description: 'Sing a rhythmic song like "Row Your Boat" while rocking to stimulate language areas.',
    points: 30,
    category: 'cognitive' as const,
    isCompleted: false,
    icon: '🎵'
  },
  {
    id: 'a7',
    title: 'Rattle Shake Grab',
    description: 'Hold a rattle near baby, encouraging tracking, grabbing, and hand-eye coordination.',
    points: 50,
    category: 'physical' as const,
    isCompleted: false,
    icon: '🪀'
  },
  {
    id: 'a8',
    title: 'High-Contrast Tracking',
    description: 'Move a bold black & white card slowly across baby\'s field of vision to build focus.',
    points: 30,
    category: 'sensory' as const,
    isCompleted: false,
    icon: '🏁'
  },
  {
    id: 'a9',
    title: 'Calming Baby Massage',
    description: 'Give a gentle post-bath leg and arm massage to soothe muscles and build touch-bonds.',
    points: 40,
    category: 'physical' as const,
    isCompleted: false,
    icon: '💆'
  },
  {
    id: 'a10',
    title: 'Nature Stroll Point',
    description: 'Take baby outdoors and describe leaves, birds, wind, and sounds in real time.',
    points: 45,
    category: 'sensory' as const,
    isCompleted: false,
    icon: '🌳'
  },
  {
    id: 'a11',
    title: 'Soft Ball Roll',
    description: 'Roll a soft ball toward baby\'s hands, tracking their gaze and encouraging reaching.',
    points: 35,
    category: 'physical' as const,
    isCompleted: false,
    icon: '⚽'
  },
  {
    id: 'a12',
    title: 'Mimic & Imitate',
    description: 'Make vocalizations and exaggerated facial expressions, encouraging baby to mimic them.',
    points: 40,
    category: 'social' as const,
    isCompleted: false,
    icon: '😜'
  }
];

export const DEFAULT_ACTIVITIES = QUEST_POOL.slice(0, 3);

export const DEFAULT_REMINDERS = [
  {
    id: 'r1',
    title: 'Vitamin D & Daily Drops',
    type: 'Medication',
    category: 'medication' as const,
    scheduleType: 'specific_times' as const,
    dosage: '1 dropper (400 IU)',
    time: '08:00 AM',
    active: true,
    isActive: true,
    specificTimesConfig: {
      times: ['08:00 AM', '02:00 PM', '08:00 PM']
    },
    instructions: 'Administer with feeding session for optimal absorption'
  },
  {
    id: 'r2',
    title: 'Hydration & Water Check',
    type: 'Fluid Intake',
    category: 'hydration' as const,
    scheduleType: 'interval' as const,
    dosage: '60-90 ml',
    time: '07:00 AM',
    active: true,
    isActive: true,
    intervalConfig: {
      intervalHours: 3,
      anchorTime: '07:00 AM',
      mode: 'waking_hours' as const,
      wakingStart: '07:00 AM',
      wakingEnd: '09:00 PM'
    },
    instructions: 'Encourage sips between active play and naps'
  },
  {
    id: 'r3',
    title: 'Infant Teething & Fever Relief',
    type: 'Medication',
    category: 'medication' as const,
    scheduleType: 'prn' as const,
    dosage: '2.5 ml (120mg/5ml)',
    active: true,
    isActive: true,
    prnConfig: {
      minIntervalHours: 4,
      maxDosesPer24h: 4,
      dosage: '2.5 ml',
      instructions: 'For high temperature >38.5°C or teething discomfort. Never exceed 4 doses in 24 hours.',
      doseLogs: [
        {
          id: 'log-seed-1',
          timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          dosage: '2.5 ml',
          notes: 'Fever post-teething nap'
        }
      ]
    }
  },
  {
    id: 'r4',
    title: 'Probiotic & Iron Wellness',
    type: 'Medication',
    category: 'medication' as const,
    scheduleType: 'weekly' as const,
    dosage: '5 drops',
    time: '09:00 AM',
    active: true,
    isActive: true,
    weeklyConfig: {
      days: [1, 3, 5], // Mon, Wed, Fri
      times: ['09:00 AM', '06:00 PM']
    },
    instructions: 'Recurring Mon, Wed, Fri gut wellness booster'
  }
];

// Default Standard Reference Libraries
export const STANDARD_MEALS = STANDARD_RECIPES;
export const DEFAULT_ACTIVITIES_LIST = DEFAULT_ACTIVITIES;
export const DEFAULT_REMINDERS_LIST = DEFAULT_REMINDERS;

// Backward-compatible exports
export const MOCK_MEALS = STANDARD_RECIPES;
export const MOCK_ACTIVITIES = DEFAULT_ACTIVITIES;
export const MOCK_REMINDERS = DEFAULT_REMINDERS;
