export interface PostpartumRecipe {
  id: string;
  title: string;
  traditionalName: string;
  category: 'Healing Soup' | 'Lactation Drink' | 'Herbal Tea' | 'Recovery Porridge';
  prepTime: string;
  keyHerbs: string[];
  healingBenefits: string;
  ingredients: string[];
  instructions: string[];
  recommendedTiming: string;
}

export interface VettedCaregiver {
  id: string;
  name: string;
  title: string;
  ageGroup: string;
  location: string;
  languages: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  availability: ('Daily' | 'Weekend' | 'Live-In' | 'Consultation')[];
  dailyRateNGN: number;
  coreServices: string[];
  vettingStatus: {
    identityVerified: boolean;
    backgroundCheckCleared: boolean;
    healthVetting: {
      verifiedHealthStatus: boolean;
      lastScreenedDate: string;
    };
    certifications: string[];
  };
  bio: string;
}

export interface OmugwoShiftState {
  caregiverName: string;
  caregiverRole: string;
  startedAt: string;
  status: 'On Duty' | 'Standby';
  focusNote: string;
  isDelegatedRemWindow: boolean;
  delegationEndsAt: string | null;
  delegatedBy: string;
}

export interface ShiftHandoverNote {
  id: string;
  caregiverName: string;
  caregiverRole: string;
  receivingPerson: string;
  summary: string;
  babyMood: string;
  feedsLoggedSummary: string;
  sleepLoggedSummary: string;
  createdAt: string;
}

export interface NourishmentLogEntry {
  id: string;
  recipeId: string;
  title: string;
  category: string;
  benefits: string;
  loggedAt: string;
  notes: string;
}

export interface WisdomJournalEntry {
  id: string;
  authorName: string;
  authorRelation: string;
  category: 'Milestone' | 'Lullaby / Song' | 'Blessing / Prayer' | 'Cultural Story';
  title: string;
  content: string;
  language: string;
  audioDataUrl?: string;
  durationSec?: number;
  createdAt: string;
}

export interface GenerationalCaptureEntry {
  id: string;
  imageUrl: string;
  caption: string;
  detectedMoment: string;
  caregiverName: string;
  aiConfidence: number;
  createdAt: string;
}

export interface OmugwoBookingEntry {
  id: string;
  caregiverId: string;
  caregiverName: string;
  serviceType: string;
  bookingMode: 'Daily' | 'Weekend' | 'Live-In' | 'Wellness Consultation';
  startDate: string;
  timeSlot: string;
  parentName: string;
  specialRequests: string;
  status: 'Confirmed' | 'Scheduled';
  createdAt: string;
}

export const TRADITIONAL_POSTPARTUM_RECIPES: PostpartumRecipe[] = [
  {
    id: 'omugwo-rec-1',
    title: 'Hot Catfish & Yam Pepper Soup',
    traditionalName: 'Ji Mmiri Oku (with Uda & Uziza)',
    category: 'Healing Soup',
    prepTime: '35 mins',
    keyHerbs: ['Uda (Negro Pepper)', 'Uziza Seeds & Leaves', 'Ehuru (Calabash Nutmeg)', 'Scent Leaf (Nchuanwu)'],
    healingBenefits: 'Stimulates uterine involution (helping the womb contract and cleanse lochia naturally), warms the core after delivery, and provides lean omega-3 protein for tissue repair.',
    ingredients: [
      '400g fresh catfish or goat meat, cleaned with lime',
      '4 thick slices of Puna yam, cubed',
      '2 pods Uda (Negro pepper), lightly toasted and crushed',
      '1 tsp ground Uziza seeds & handful of fresh Uziza leaves',
      '2 seeds Ehuru (Calabash nutmeg), roasted and ground',
      '1 handful fresh Scent leaves (Nchuanwu / Efirin), sliced',
      '1 small onion, crayfish, and mild Cameroon pepper to taste'
    ],
    instructions: [
      'Place cubed yam and seasoned fish/meat in a pot with chopped onions and cover with water.',
      'Add crushed Uda pods, ground Ehuru, and Uziza seeds to infuse the broth as it simmers for 20 minutes.',
      'Once the yam softens and thickens the broth slightly, stir in ground crayfish.',
      'Add fresh sliced Uziza and Scent leaves during the final 3 minutes of simmering and serve piping hot.'
    ],
    recommendedTiming: 'Morning & Evening during first 6 weeks postpartum'
  },
  {
    id: 'omugwo-rec-2',
    title: 'Warm Fermented Corn Pap with Tigernut Milk',
    traditionalName: 'Akamu / Ogi & Kunu Aya Galactagogue Bowl',
    category: 'Recovery Porridge',
    prepTime: '10 mins',
    keyHerbs: ['Fermented Yellow Maize / Millet', 'Tigernut (Aya)', 'Dates (Dabino)', 'Fresh Ginger'],
    healingBenefits: 'Rapidly replenishes maternal hydration and boosts breast milk let-down (galactagogue effect) while providing gentle probiotic support for digestion.',
    ingredients: [
      '4 tbsp raw fermented yellow corn or guinea corn pap (Akamu / Ogi)',
      '1 cup warm homemade tigernut milk (or evaporated milk)',
      '2 pitted dates blended for natural iron-rich sweetness',
      'A pinch of grated fresh ginger'
    ],
    instructions: [
      'Dissolve the raw Akamu paste in 3 tablespoons of cool water until completely smooth.',
      'Pour boiling water steadily while stirring briskly until the pap thickens and turns glossy.',
      'Stir in warm tigernut milk and date puree, and drink warm 20 minutes before nursing.'
    ],
    recommendedTiming: 'Early morning or 20 mins before nursing sessions'
  },
  {
    id: 'omugwo-rec-3',
    title: 'Uziza, Utazi & Scent Leaf Postpartum Infusion',
    traditionalName: 'Warm Herbal Womb & Digestion Tea',
    category: 'Herbal Tea',
    prepTime: '12 mins',
    keyHerbs: ['Uziza Leaf', 'Scent Leaf (Nchuanwu)', 'Lemongrass', '1 Clove Uda'],
    healingBenefits: 'Relieves postpartum abdominal gas and cramping, promotes restorative warmth after hot compress massage, and supports gentle digestive motility.',
    ingredients: [
      '5 fresh Scent leaves (Nchuanwu / Efirin), rinsed',
      '3 fresh Uziza leaves',
      '1 stalk fresh lemongrass, bruised',
      '1 half-pod Uda, lightly cracked',
      '500ml clean water & 1 tsp raw honey (optional)'
    ],
    instructions: [
      'Bring water, bruised lemongrass, and cracked Uda to a gentle boil for 5 minutes.',
      'Turn off the heat, add fresh Scent leaves and Uziza leaves, and cover to steep for 5 minutes.',
      'Strain into a warm mug and sip slowly after your warm water bath.'
    ],
    recommendedTiming: 'Mid-afternoon or after warm sitz/body massage'
  },
  {
    id: 'omugwo-rec-4',
    title: 'Rich Palm Nut & Dried Fish Recovery Soup',
    traditionalName: 'Ofe Akwu / Banga Postpartum Stew',
    category: 'Healing Soup',
    prepTime: '45 mins',
    keyHerbs: ['Palm Fruit Concentrate (Vitamin A & E)', 'Ugu (Fluted Pumpkin Leaf)', 'Dry Catfish'],
    healingBenefits: 'Packed with natural Vitamin E, beta-carotene, and iron from Ugu leaves to rebuild maternal hemoglobin levels after childbirth blood loss.',
    ingredients: [
      '2 cups fresh palm nut extract',
      '150g shredded smoked/dried catfish, deboned',
      '2 cups fresh Ugu (fluted pumpkin) leaves, washed and sliced',
      '1 tsp ground Uziza and crayfish',
      '1 small onion, diced'
    ],
    instructions: [
      'Boil the palm fruit extract with diced onions and deboned smoked fish until rich and slightly thickened.',
      'Season with ground crayfish and Uziza for gentle warmth.',
      'Fold in fresh Ugu leaves and simmer for 2 minutes so the iron and folate remain intact.'
    ],
    recommendedTiming: 'Lunch with pounded yam, oat fufu, or boiled plantain'
  },
  {
    id: 'omugwo-rec-5',
    title: 'Moringa, Oat & Fenugreek Lactation Smoothie',
    traditionalName: 'Modern Omugwo Milk-Booster Drink',
    category: 'Lactation Drink',
    prepTime: '8 mins',
    keyHerbs: ['Moringa Oleifera Leaf', 'Rolled Oats (Beta-Glucan)', 'Flaxseed'],
    healingBenefits: 'Combines iron-dense Moringa leaf with oat beta-glucans to support sustained breast milk volume and maternal energy during night feeds.',
    ingredients: [
      '1/2 cup cooked or soaked rolled oats',
      '1 tsp organic Moringa leaf powder',
      '1 ripe banana',
      '1 tbsp ground flaxseed or sesame seeds',
      '1 cup warm almond, soy, or dairy milk'
    ],
    instructions: [
      'Place oats, banana, moringa powder, ground flaxseed, and warm milk into a blender.',
      'Blend for 60 seconds until creamy and smooth, and enjoy immediately.'
    ],
    recommendedTiming: 'Mid-morning snack between nursing windows'
  }
];

export const INITIAL_VETTED_CAREGIVERS: VettedCaregiver[] = [];
