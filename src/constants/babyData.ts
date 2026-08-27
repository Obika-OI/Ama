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
    name: 'Honey',
    color: 'red',
    warning: '⚠️ INFANT BOTULISM RISK: Never give honey to a baby under 12 months.',
    prep6m: '❌ Avoid completely. High risk of infant botulism.',
    prep10m: '❌ Avoid completely. High risk of infant botulism.',
    prep12m: '✅ Safe to introduce in small amounts.'
  },
  {
    id: 'grapes',
    name: 'Whole Grapes',
    color: 'amber',
    warning: '⚠️ CHOKING HAZARD: Whole round grapes can block airway.',
    prep6m: '❌ Avoid whole grapes. Serve as smooth purees.',
    prep10m: '⚠️ Cut lengthwise into quarters or thin slivers.',
    prep12m: '✅ Quarter lengthwise.'
  }
];

export const DEFAULT_VACCINE_SCHEDULE = [
  { id: 'v1', name: 'BCG (Tuberculosis)', disease: 'Protects against severe Tuberculosis', icon: '🛡️', age: 'Birth', status: 'Completed', date: '2026-01-15', sideEffects: 'Slight redness at site', category: 'Essential Childhood' },
  { id: 'v2', name: 'Hepatitis B (HepB 0)', disease: 'Protects against Hepatitis B liver infection', icon: '💉', age: 'Birth', status: 'Completed', date: '2026-01-15', sideEffects: 'None', category: 'Essential Childhood' },
  { id: 'v3', name: 'Oral Polio Vaccine (OPV 0)', disease: 'Protects against Poliovirus paralysis', icon: '💊', age: 'Birth', status: 'Completed', date: '2026-01-15', sideEffects: 'None', category: 'Essential Childhood' },
  { id: 'v4', name: 'Pentavalent 1 (DTaP + HepB + Hib)', disease: '5-in-1 vaccine against Diphtheria, Tetanus, Pertussis, Hep B, Hib', icon: '🛡️', age: '6 Weeks', status: 'Completed', date: '2026-02-28', sideEffects: 'Mild fever', category: 'Primary Series' },
  { id: 'v5', name: 'Pneumococcal Conjugate (PCV13) - Dose 1', disease: 'Protects against Pneumonia and Meningitis', icon: '🫁', age: '6 Weeks', status: 'Completed', date: '2026-02-28', sideEffects: 'Fussiness', category: 'Primary Series' },
  { id: 'v6', name: 'Rotavirus Vaccine (RV) - Dose 1', disease: 'Protects against severe diarrhea and dehydration', icon: '💧', age: '6 Weeks', status: 'Completed', date: '2026-02-28', sideEffects: 'Mild loose stool', category: 'Primary Series' },
  { id: 'v7', name: 'Inactivated Polio Vaccine (IPV 1)', disease: 'Injectable Polio protection', icon: '💉', age: '6 Weeks', status: 'Completed', date: '2026-02-28', sideEffects: 'Soreness at thigh', category: 'Primary Series' },
  { id: 'v8', name: 'Pentavalent 2 (DTaP + HepB + Hib)', disease: 'Second dose for Diphtheria, Tetanus, Pertussis, Hep B, Hib', icon: '🛡️', age: '10 Weeks', status: 'Completed', date: '2026-03-28', sideEffects: 'Slight fever', category: 'Primary Series' },
  { id: 'v9', name: 'Pneumococcal Conjugate (PCV13) - Dose 2', disease: 'Second dose against pneumococcal infections', icon: '🫁', age: '10 Weeks', status: 'Completed', date: '2026-03-28', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v10', name: 'Rotavirus Vaccine (RV) - Dose 2', disease: 'Second dose for Rotavirus gastroenteritis', icon: '💧', age: '10 Weeks', status: 'Completed', date: '2026-03-28', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v11', name: 'Oral Polio Vaccine (OPV 2)', disease: 'Second oral Polio drop', icon: '💊', age: '10 Weeks', status: 'Completed', date: '2026-03-28', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v12', name: 'Pentavalent 3 (DTaP + HepB + Hib)', disease: 'Third primary dose', icon: '🛡️', age: '6 Months', status: 'Scheduled', date: '2026-07-20', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v13', name: 'Pneumococcal Conjugate (PCV13) - Dose 3', disease: 'Third dose against pneumococcal infections', icon: '🫁', age: '6 Months', status: 'Scheduled', date: '2026-07-20', sideEffects: 'None', category: 'Primary Series' },
  { id: 'v14', name: 'Influenza (Annual Flu Shot)', disease: 'Annual seasonal flu protection for infants 6m+', icon: '🩺', age: '6 Months', status: 'Scheduled', date: '2026-07-20', sideEffects: 'None', category: 'Seasonal Protection' },
  { id: 'v15', name: 'Measles & Rubella (MR) - Dose 1', disease: 'Protects against Measles rash & Rubella infection', icon: '🦠', age: '9 Months', status: 'Scheduled', date: '2026-10-12', sideEffects: 'None', category: 'Essential Childhood' },
  { id: 'v16', name: 'Yellow Fever Vaccine', disease: 'Single dose protection against Yellow Fever virus', icon: '🦟', age: '9 Months', status: 'Scheduled', date: '2026-10-12', sideEffects: 'None', category: 'Travel & Endemic' },
  { id: 'v17', name: 'MMR (Measles, Mumps, Rubella) - Dose 1', disease: 'Protects against Measles, Mumps, & Rubella', icon: '🦠', age: '12 Months', status: 'Scheduled', date: '2027-01-12', sideEffects: 'None', category: 'Routine Recommended' },
  { id: 'v18', name: 'Varicella (Chickenpox) - Dose 1', disease: 'Protects against Chickenpox virus', icon: '🌸', age: '12 Months', status: 'Scheduled', date: '2027-01-12', sideEffects: 'None', category: 'Routine Recommended' },
  { id: 'v19', name: 'Hepatitis A (HepA) - Dose 1', disease: 'Protects against Hepatitis A liver virus', icon: '💉', age: '12 Months', status: 'Scheduled', date: '2027-01-12', sideEffects: 'None', category: 'Routine Recommended' },
  { id: 'v20', name: 'Meningococcal ACWY', disease: 'Protects against severe meningococcal bacterial meningitis', icon: '🛡️', age: '12 Months', status: 'Scheduled', date: '2027-01-12', sideEffects: 'None', category: 'Routine Recommended' },
  { id: 'v21', name: 'DTaP Booster (Dose 4)', disease: 'Fourth booster dose for Diphtheria, Tetanus, & Pertussis', icon: '🛡️', age: '15 Months', status: 'Scheduled', date: '2027-04-12', sideEffects: 'None', category: 'Booster Shot' },
  { id: 'v22', name: 'Measles & Rubella (MR) Booster', disease: 'Booster dose for long-term Measles & Rubella immunity', icon: '🦠', age: '18 Months', status: 'Scheduled', date: '2027-07-12', sideEffects: 'None', category: 'Booster Shot' },
  { id: 'v23', name: 'Typhoid Conjugate Vaccine (TCV)', disease: 'Single dose protection against Typhoid fever', icon: '💊', age: '24 Months', status: 'Scheduled', date: '2028-01-12', sideEffects: 'None', category: 'Essential Childhood' }
];

export const DEFAULT_WHO_CDC_VACCINE_SCHEDULE = DEFAULT_VACCINE_SCHEDULE;
