// Baby Care Data Constants

// 20 Primary Baby Teeth list
export const TEETH_LIST = [
  { id: 'u_ci_l', name: 'Upper Central Incisor (L)', row: 'upper' },
  { id: 'u_ci_r', name: 'Upper Central Incisor (R)', row: 'upper' },
  { id: 'u_li_l', name: 'Upper Lateral Incisor (L)', row: 'upper' },
  { id: 'u_li_r', name: 'Upper Lateral Incisor (R)', row: 'upper' },
  { id: 'u_ca_l', name: 'Upper Canine (L)', row: 'upper' },
  { id: 'u_ca_r', name: 'Upper Canine (R)', row: 'upper' },
  { id: 'u_m1_l', name: 'Upper First Molar (L)', row: 'upper' },
  { id: 'u_m1_r', name: 'Upper First Molar (R)', row: 'upper' },
  { id: 'u_m2_l', name: 'Upper Second Molar (L)', row: 'upper' },
  { id: 'u_m2_r', name: 'Upper Second Molar (R)', row: 'upper' },

  { id: 'l_ci_l', name: 'Lower Central Incisor (L)', row: 'lower' },
  { id: 'l_ci_r', name: 'Lower Central Incisor (R)', row: 'lower' },
  { id: 'l_li_l', name: 'Lower Lateral Incisor (L)', row: 'lower' },
  { id: 'l_li_r', name: 'Lower Lateral Incisor (R)', row: 'lower' },
  { id: 'l_ca_l', name: 'Lower Canine (L)', row: 'lower' },
  { id: 'l_ca_r', name: 'Lower Canine (R)', row: 'lower' },
  { id: 'l_m1_l', name: 'Lower First Molar (L)', row: 'lower' },
  { id: 'l_m1_r', name: 'Lower First Molar (R)', row: 'lower' },
  { id: 'l_m2_l', name: 'Lower Second Molar (L)', row: 'lower' },
  { id: 'l_m2_r', name: 'Lower Second Molar (R)', row: 'lower' },
];

export const LOCAL_REGIONS_DATABASE = [
  {
    name: "Port-Harcourt, Nigeria",
    lat: 4.8156,
    lng: 7.0498,
    currency: "₦",
    suggestions: [
      "🌿 Creamy Plantain and Carrot Mash - Plantains provide natural sweetness and energy.",
      "🥔 Rich Tom Brown Cereal - Nutrient-dense powder made from grains and legumes.",
      "🍎 Soft Bean Puree - Beans are a great source of protein for growing muscles.",
      "🥕 Steamed Fish & Crayfish Moi Moi - A smooth, protein-rich steamed pudding."
    ]
  },
  {
    name: "Lagos, Nigeria",
    lat: 6.5244,
    lng: 3.3792,
    currency: "₦",
    suggestions: [
      "🥣 Tombrown Whole Grain Cereal - A traditional blend of millet, sorghum, and groundnut.",
      "🍲 Plantain & Garden Egg Puree - Rich in dietary fiber and essential minerals.",
      "🥣 Pap (Ogi) enriched with Crayfish - Fermented corn pudding packed with calcium.",
      "🍲 Sweet Potato & Vegetable Stew - Smooth, comforting, and nutrient-packed."
    ]
  },
  {
    name: "London, UK",
    lat: 51.5074,
    lng: -0.1278,
    currency: "£",
    suggestions: [
      "🥣 Organic Porridge Oats with Berries - Warm, fiber-rich whole grain start.",
      "🍲 Steamed Broccoli and Potato Mash - Loaded with vitamin C and folate.",
      "🍎 Roasted Apple and Pear Compote - Naturally sweet and gentle on digestion."
    ]
  },
  {
    name: "New York, USA",
    lat: 40.7128,
    lng: -74.0060,
    currency: "$",
    suggestions: [
      "🥑 Avocado and Banana Puree - Healthy fats for brain development.",
      "🥔 Baked Sweet Potato & Spinach Puree - Rich in Beta-Carotene.",
      "🥣 Oatmeal with Apple Butter - Soluble fiber for infant GI health."
    ]
  }
];

export const COMMON_INGREDIENTS = [
  {
    id: 'honey',
    name: 'Honey (Raw or Processed)',
    color: 'red',
    icon: '🍯',
    category: 'Strict Avoidance',
    warning: '⚠️ INFANT BOTULISM RISK: Never give honey to infants under 12 months. Clostridium botulinum spores can produce fatal neurotoxins in immature digestive tracts.',
    prep6m: '❌ Strictly prohibited. Do not add to purees, teas, pacifiers, or baked goods.',
    prep10m: '❌ Strictly prohibited until 1st birthday.',
    prep12m: '✅ Safe to introduce pasteurized honey in moderation.'
  },
  {
    id: 'whole_nuts',
    name: 'Whole Tree Nuts & Peanuts',
    color: 'red',
    icon: '🥜',
    category: 'Choking Hazard',
    warning: '⚠️ ASPIRATION & CHOKING HAZARD: Whole or chopped nuts are rigid, round, and can easily lodge in a child\'s airway.',
    prep6m: '❌ Never serve whole or chopped nuts. Thin smooth peanut butter with breast milk or water.',
    prep10m: '❌ Whole nuts forbidden. Serve finely ground nut powder stirred into oatmeal or yogurt.',
    prep12m: '⚠️ Continue avoiding whole hard nuts until age 4-5. Spread thin nut butters on toast.'
  },
  {
    id: 'popcorn',
    name: 'Popcorn & Hard Kernels',
    color: 'red',
    icon: '🍿',
    category: 'Choking Hazard',
    warning: '⚠️ SEVERE CHOKING HAZARD: Unpopped kernels and dry husks easily obstruct bronchial tubes.',
    prep6m: '❌ Strictly avoid. Zero nutritional suitability for infants.',
    prep10m: '❌ Strictly avoid.',
    prep12m: '❌ Health guidance recommends avoiding popcorn until at least 4 years of age.'
  },
  {
    id: 'hot_dogs',
    name: 'Hot Dogs & Sausage Coins',
    color: 'red',
    icon: '🌭',
    category: 'Choking Hazard & High Sodium',
    warning: '⚠️ MAJOR CHOKING SHAPE: Round cylindrical coins match airway diameter and can form an airtight seal.',
    prep6m: '❌ Avoid processed meats due to extreme sodium, nitrates, and choking shape.',
    prep10m: '❌ Avoid whole coins. If serving, peel casing and slice lengthwise into thin matchsticks.',
    prep12m: '⚠️ Always slice lengthwise into thin quarters, never into round circular discs.'
  },
  {
    id: 'cows_milk',
    name: 'Cow\'s Milk (As Main Beverage)',
    color: 'red',
    icon: '🥛',
    category: 'Nutritional Imbalance',
    warning: '⚠️ INTESTINAL & RENAL STRAIN: Large amounts of cow\'s milk under 12m can cause microscopic intestinal bleeding and displace iron-rich breast milk/formula.',
    prep6m: '❌ Do not use as a drink. Small amounts cooked in food or yogurt are acceptable.',
    prep10m: '❌ Breast milk or formula remains primary fluid. Cheese and plain whole-milk yogurt are safe.',
    prep12m: '✅ Introduce whole pasteurized cow\'s milk (max 16-24 oz / 500-700ml per day).'
  },
  {
    id: 'salt_sugar',
    name: 'Added Salt & Refined Sugar',
    color: 'red',
    icon: '🧂',
    category: 'Renal & Metabolic',
    warning: '⚠️ IMMATURE KIDNEYS: Baby kidneys cannot process added sodium (<1g salt/day recommended). Refined sugars promote tooth decay and alter taste preferences.',
    prep6m: '❌ Zero added salt or refined sugar. Season foods with mild herbs and spices (cinnamon, cumin, garlic).',
    prep10m: '❌ Avoid salt shakers, bouillon cubes, soy sauce, and sweetened infant snacks.',
    prep12m: '⚠️ Keep sodium minimal and limit added sugars to support lifelong healthy habits.'
  },
  {
    id: 'grapes',
    name: 'Whole Grapes & Cherry Tomatoes',
    color: 'amber',
    icon: '🍇',
    category: 'Shape Modification Required',
    warning: '⚠️ CHOKING HAZARD: Smooth round shape matches trachea diameter. Must always be sliced correctly.',
    prep6m: '❌ Do not serve whole. Puree completely or steam and smash thoroughly.',
    prep10m: '⚠️ Slice lengthwise into quarters (top to bottom). Never slice horizontally into coins.',
    prep12m: '✅ Continue quartering lengthwise until baby is proficient with molar chewing (age 2+).'
  },
  {
    id: 'hard_raw_apples',
    name: 'Raw Hard Apples & Carrots',
    color: 'amber',
    icon: '🍎',
    category: 'Texture Modification Required',
    warning: '⚠️ HARD TEXTURE HAZARD: Hard raw chunks snap off and can block the windpipe.',
    prep6m: '⚠️ Steam or bake until fork-tender and mash/puree. Never give raw chunks.',
    prep10m: '⚠️ Finely grate raw apple/carrot, or steam into soft bite-sized cubes.',
    prep12m: '✅ Very thin translucent shavings or soft baked wedges.'
  },
  {
    id: 'peanut_butter',
    name: 'Thick Peanut Butter & Nut Pastes',
    color: 'amber',
    icon: '🥜',
    category: 'Sticky Texture Hazard',
    warning: '⚠️ ASPIRATION HAZARD: Thick sticky spoonfuls of peanut butter can stick to the roof of the mouth and larynx.',
    prep6m: '⚠️ Never give straight from a spoon. Thin with warm water, formula, or swirl into oatmeal.',
    prep10m: '⚠️ Spread very thinly onto toast fingers, or mix with fruit puree.',
    prep12m: '✅ Thinly spread on toast, pancakes, or whole grain crackers.'
  },
  {
    id: 'avocado',
    name: 'Fresh Avocado',
    color: 'green',
    icon: '🥑',
    category: 'Nutrient-Dense First Food',
    warning: '✅ SAFE & HIGHLY BENEFICIAL: Packed with brain-boosting DHA healthy fats, folate, and potassium.',
    prep6m: '✅ Mash with fork into smooth cream or serve a large soft wedge with peel partially left on for grip.',
    prep10m: '✅ Cut into small bite-sized soft cubes or roll in hemp seeds/cereal for easier grasping.',
    prep12m: '✅ Serve diced, mashed on toast, or tossed into baby salads and pasta.'
  },
  {
    id: 'banana',
    name: 'Ripe Banana',
    color: 'green',
    icon: '🍌',
    category: 'Gentle Digestion',
    warning: '✅ SAFE & EASY TO DIGEST: Rich in potassium, Vitamin B6, and prebiotics for gut health.',
    prep6m: '✅ Mash with a fork or serve the top half of a peeled banana with grip ridges.',
    prep10m: '✅ Slice lengthwise into halves or quarters, then into bite-sized segments.',
    prep12m: '✅ Whole peeled banana or sliced over oatmeal and pancakes.'
  },
  {
    id: 'sweet_potato',
    name: 'Steamed Sweet Potato',
    color: 'green',
    icon: '🍠',
    category: 'Immune & Vision Health',
    warning: '✅ SAFE & NUTRIENT-PACKED: High in Beta-Carotene (Vitamin A precursor), fiber, and complex carbs.',
    prep6m: '✅ Steam or roast until completely soft, mash with breast milk or water, or serve long soft spears.',
    prep10m: '✅ Soft roasted cubes for pincer grasp practice.',
    prep12m: '✅ Baked sweet potato wedges, cubes, or sweet potato patties.'
  },
  {
    id: 'eggs',
    name: 'Cooked Eggs (Allergen cleared)',
    color: 'green',
    icon: '🥚',
    category: 'Top Allergen & Choline Powerhouse',
    warning: '✅ SAFE WHEN FULLY COOKED: Rich in Choline and iron. Early introduction helps prevent egg allergy.',
    prep6m: '✅ Serve hard-boiled egg mashed with avocado, or well-cooked soft omelette strips.',
    prep10m: '✅ Scrambled egg pieces or hard-boiled egg crumbled for finger feeding.',
    prep12m: '✅ Scrambled, poached, or boiled eggs with whole-grain soldiers.'
  },
  {
    id: 'salmon',
    name: 'Wild Salmon (Deboned & Cooked)',
    color: 'green',
    icon: '🐟',
    category: 'Omega-3 Brain Development',
    warning: '✅ SAFE & OMEGA-RICH: Incredible source of Omega-3 EPA/DHA fatty acids and heme iron. Check meticulously for bones.',
    prep6m: '✅ Poach or bake, inspect thoroughly for tiny bones, and flake finely into puree or soft mash.',
    prep10m: '✅ Soft flaked salmon patties or bite-sized tender chunks.',
    prep12m: '✅ Baked salmon fillet pieces with herbs and lemon.'
  },
  {
    id: 'spinach_greens',
    name: 'Spinach & Dark Leafy Greens',
    color: 'green',
    icon: '🥬',
    category: 'Iron & Micronutrients',
    warning: '✅ SAFE WHEN COOKED: Excellent source of folate, iron, and carotenoids. Raw whole leaves can stick to palate.',
    prep6m: '✅ Steam thoroughly, puree smoothly with sweet potato or pear to maximize iron absorption.',
    prep10m: '✅ Finely chop cooked spinach and fold into scrambled eggs, lentil dahl, or rice.',
    prep12m: '✅ Cooked greens in soups, pasta sauces, and vegetable frittatas.'
  },
  {
    id: 'yogurt_greek',
    name: 'Plain Whole-Milk Greek Yogurt',
    color: 'green',
    icon: '🥣',
    category: 'Probiotics & Calcium',
    warning: '✅ SAFE (UNSWEETENED): Loaded with calcium, gut-friendly active cultures, and protein. Choose pasteurized whole milk.',
    prep6m: '✅ Spoon-feed plain full-fat Greek yogurt, or swirl with unsweetened apple puree.',
    prep10m: '✅ Let baby practice with pre-loaded spoon or dip soft fruit sticks.',
    prep12m: '✅ Serve with crushed berries, chia seeds, and oats.'
  },
  {
    id: 'broccoli',
    name: 'Steamed Broccoli Florets',
    color: 'green',
    icon: '🥦',
    category: 'Fiber & Vitamin C',
    warning: '✅ SAFE BLW FAVORITE: The natural floret stalk serves as an intuitive baby handle for self-feeding.',
    prep6m: '✅ Steam large florets until the stem can be easily squished between thumb and forefinger.',
    prep10m: '✅ Cut steamed florets into smaller bite-sized clusters.',
    prep12m: '✅ Roasted or steamed broccoli with olive oil and a dash of nutritional yeast.'
  },
  {
    id: 'lentils_beans',
    name: 'Lentils & Soft Legumes',
    color: 'green',
    icon: '🫘',
    category: 'Plant Protein & Iron',
    warning: '✅ SAFE WHEN THOROUGHLY COOKED: Great source of zinc, dietary fiber, and plant-based protein.',
    prep6m: '✅ Cook until soft and mash into smooth dahl or bean puree with cumin and olive oil.',
    prep10m: '✅ Soft whole lentils or gently flattened soft black beans / chickpeas.',
    prep12m: '✅ Lentil patties, bean chili, and vegetable bean soups.'
  },
  {
    id: 'mango',
    name: 'Ripe Juicy Mango',
    color: 'green',
    icon: '🥭',
    category: 'Vitamins A & C',
    warning: '✅ SAFE & REFRESHING: Naturally sweet and soothing for teething gums. Slippery texture needs grip aid.',
    prep6m: '✅ Offer the large mango pit with most fruit carved off for gum soothing, or roll spear in baby cereal.',
    prep10m: '✅ Dice into small soft cubes for pincer grasp practice.',
    prep12m: '✅ Mango spears, dices, or blended into fruit smoothies.'
  }
];


export const DEFAULT_VACCINE_SCHEDULE = [
  { id: 'v1', name: 'BCG (Tuberculosis)', disease: 'Protects against severe Tuberculosis', icon: '🛡️', age: 'Birth', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Essential Childhood' },
  { id: 'v2', name: 'Hepatitis B (HepB 0)', disease: 'Protects against Hepatitis B liver infection', icon: '💉', age: 'Birth', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Essential Childhood' },
  { id: 'v3', name: 'Oral Polio Vaccine (OPV 0)', disease: 'Protects against Poliovirus paralysis', icon: '💊', age: 'Birth', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Essential Childhood' },
  { id: 'v4', name: 'Pentavalent 1 (DTaP + HepB + Hib)', disease: '5-in-1 vaccine against Diphtheria, Tetanus, Pertussis, Hep B, Hib', icon: '🛡️', age: '6 Weeks', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v5', name: 'Pneumococcal Conjugate (PCV13) - Dose 1', disease: 'Protects against Pneumonia and Meningitis', icon: '🫁', age: '6 Weeks', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v6', name: 'Rotavirus Vaccine (RV) - Dose 1', disease: 'Protects against severe diarrhea and dehydration', icon: '💧', age: '6 Weeks', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v7', name: 'Inactivated Polio Vaccine (IPV 1)', disease: 'Injectable Polio protection', icon: '💉', age: '6 Weeks', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v8', name: 'Pentavalent 2 (DTaP + HepB + Hib)', disease: 'Second dose for Diphtheria, Tetanus, Pertussis, Hep B, Hib', icon: '🛡️', age: '10 Weeks', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v9', name: 'Pneumococcal Conjugate (PCV13) - Dose 2', disease: 'Second dose against pneumococcal infections', icon: '🫁', age: '10 Weeks', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v10', name: 'Rotavirus Vaccine (RV) - Dose 2', disease: 'Second dose for Rotavirus gastroenteritis', icon: '💧', age: '10 Weeks', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v11', name: 'Oral Polio Vaccine (OPV 2)', disease: 'Second oral Polio drop', icon: '💊', age: '10 Weeks', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v12', name: 'Pentavalent 3 (DTaP + HepB + Hib)', disease: 'Third primary dose', icon: '🛡️', age: '6 Months', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v13', name: 'Pneumococcal Conjugate (PCV13) - Dose 3', disease: 'Third dose against pneumococcal infections', icon: '🫁', age: '6 Months', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v14', name: 'Influenza (Annual Flu Shot)', disease: 'Annual seasonal flu protection for infants 6m+', icon: '🩺', age: '6 Months', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Seasonal Protection' },
  { id: 'v15', name: 'Measles & Rubella (MR) - Dose 1', disease: 'Protects against Measles rash & Rubella infection', icon: '🦠', age: '9 Months', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Essential Childhood' },
  { id: 'v16', name: 'Yellow Fever Vaccine', disease: 'Single dose protection against Yellow Fever virus', icon: '🦟', age: '9 Months', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Travel & Endemic' },
  { id: 'v17', name: 'MMR (Measles, Mumps, Rubella) - Dose 1', disease: 'Protects against Measles, Mumps, & Rubella', icon: '🦠', age: '12 Months', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Routine Recommended' },
  { id: 'v18', name: 'Varicella (Chickenpox) - Dose 1', disease: 'Protects against Chickenpox virus', icon: '🌸', age: '12 Months', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Routine Recommended' },
  { id: 'v19', name: 'Hepatitis A (HepA) - Dose 1', disease: 'Protects against Hepatitis A liver virus', icon: '💉', age: '12 Months', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Routine Recommended' },
  { id: 'v20', name: 'Meningococcal ACWY', disease: 'Protects against severe meningococcal bacterial meningitis', icon: '🛡️', age: '12 Months', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Routine Recommended' },
  { id: 'v21', name: 'DTaP Booster (Dose 4)', disease: 'Fourth booster dose for Diphtheria, Tetanus, & Pertussis', icon: '🛡️', age: '15 Months', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Booster Shot' },
  { id: 'v22', name: 'Measles & Rubella (MR) Booster', disease: 'Booster dose for long-term Measles & Rubella immunity', icon: '🦠', age: '18 Months', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Booster Shot' },
  { id: 'v23', name: 'Typhoid Conjugate Vaccine (TCV)', disease: 'Single dose protection against Typhoid fever', icon: '💊', age: '24 Months', status: 'Unscheduled', date: '', sideEffects: 'None', category: 'Essential Childhood' }
];

export const DEFAULT_WHO_CDC_VACCINE_SCHEDULE = DEFAULT_VACCINE_SCHEDULE;

export const calculateVaccineScheduleFromDOB = (dobStr: string, currentSchedule: any[]) => {
  const birthDate = new Date(dobStr);
  if (isNaN(birthDate.getTime())) return currentSchedule;

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const addDays = (days: number) => {
    const d = new Date(birthDate);
    d.setDate(d.getDate() + days);
    return formatDate(d);
  };

  const addMonths = (months: number) => {
    const d = new Date(birthDate);
    d.setMonth(d.getMonth() + months);
    return formatDate(d);
  };

  const ageToDateMap: Record<string, string> = {
    'Birth': addDays(0),
    '6 Weeks': addDays(42),
    '10 Weeks': addDays(70),
    '14 Weeks': addDays(98),
    '6 Months': addMonths(6),
    '9 Months': addMonths(9),
    '12 Months': addMonths(12),
    '15 Months': addMonths(15),
    '18 Months': addMonths(18),
    '24 Months': addMonths(24),
  };

  const base = Array.isArray(currentSchedule) && currentSchedule.length > 0 ? currentSchedule : DEFAULT_VACCINE_SCHEDULE;

  return base.map((item: any) => {
    if (item.status === 'Completed') return item;
    const targetDate = ageToDateMap[item.age] || addDays(0);
    return {
      ...item,
      status: 'Scheduled',
      date: targetDate,
    };
  });
};

export const sanitizeVaccineSchedule = (schedule: any[]) => {
  if (!Array.isArray(schedule) || schedule.length === 0) {
    return DEFAULT_VACCINE_SCHEDULE;
  }
  
  const legacyMockDates = [
    '2026-01-15', '2026-02-28', '2026-03-28', '2026-07-20', '2026-10-12', 
    '2027-01-12', '2027-04-12', '2027-07-12', '2028-01-12'
  ];
  const legacyMockEffects = [
    'Slight redness at site', 'Mild fever', 'Fussiness', 'Mild loose stool', 'Soreness at thigh', 'Slight fever'
  ];

  return schedule.map((v: any) => {
    let updated = { ...v };
    if (legacyMockDates.includes(updated.date)) {
      updated.date = '';
    }
    if (legacyMockEffects.includes(updated.sideEffects)) {
      updated.sideEffects = 'None';
    }

    if (updated.status === 'Scheduled' && !updated.date) {
      updated.status = 'Unscheduled';
    }
    if (!updated.status) {
      updated.status = updated.date ? 'Scheduled' : 'Unscheduled';
    }
    return updated;
  });
};
