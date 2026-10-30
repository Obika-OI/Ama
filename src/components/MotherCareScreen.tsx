import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Utensils, 
  Activity, 
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  Info,
  Droplet,
  Brain,
  Zap,
  AlertTriangle,
  Stethoscope,
  Smile,
  ShieldAlert,
  HelpCircle,
  Wind,
  PhoneCall,
  Moon,
  Loader2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useSEO } from '../utils/seo';
import { EPDSTool } from './EPDSTool';

interface MotherCareScreenProps {
  onBack: () => void;
  parentName?: string;
}

export interface WellnessPostpartumRecipe {
  id: string;
  title: string;
  category: string;
  healthBenefit: string;
  keyNutrients: string[];
  ingredients: string[];
  instructions: string[];
  recommendedTiming: string;
}

const GLOBAL_WELLNESS_RECIPES: WellnessPostpartumRecipe[] = [
  {
    id: 'restorative_broth',
    title: 'High-Collagen Restorative Bone & Vegetable Broth',
    category: 'Tissue Repair & Hydration',
    healthBenefit: 'Rich in glycine, proline, and electrolytes to accelerate perineal and cesarean tissue remodeling while providing fluid volume for blood plasma restoration.',
    keyNutrients: ['Collagen & Glycine', 'Bioavailable Zinc', 'Sodium & Potassium Electrolytes'],
    ingredients: [
      '1 kg grass-fed marrow bones or rich vegetable stock base',
      '2 carrots, sliced thickly',
      '2 stalks celery, chopped',
      '1 large onion, quartered',
      '3 cloves crushed garlic & 1 inch fresh sliced ginger',
      '1 tbsp apple cider vinegar (extracts bone minerals)',
      '1 tsp sea salt & fresh parsley sprigs'
    ],
    instructions: [
      'Roast bones in an oven at 200°C (400°F) for 25 minutes for deep flavor.',
      'Place roasted bones or vegetables into a large stock pot or slow cooker with vinegar and cold filtered water.',
      'Bring to a gentle rolling boil, skim off foam, then lower to a very low simmer for 6 to 12 hours.',
      'Add fresh carrots, celery, garlic, and ginger during the final 2 hours of simmering.',
      'Strain through a fine sieve, season with sea salt, and sip warm in mugs throughout the day.'
    ],
    recommendedTiming: 'Days 1 through 40 postpartum; ideal warm morning and bedtime drink.'
  },
  {
    id: 'iron_rich_stew',
    title: 'Iron-Rich Spinach, Sweet Potato & Red Lentil Stew',
    category: 'Anemia Recovery & Cellular Energy',
    healthBenefit: 'Combines bioavailable plant iron and folate with vitamin C-rich tomatoes and sweet potatoes to enhance non-heme iron absorption and combat postpartum fatigue.',
    keyNutrients: ['Non-Heme Iron', 'Folate (Vitamin B9)', 'Dietary Fiber', 'Beta-Carotene'],
    ingredients: [
      '1 cup dry red split lentils, rinsed',
      '1 large sweet potato, diced small',
      '3 cups fresh baby spinach or chopped dark leafy greens',
      '1 can crushed plum tomatoes (vitamin C catalyst)',
      '1 medium yellow onion & 2 cloves minced garlic',
      '1 tsp cumin, 1/2 tsp turmeric, and 1/2 tsp mild sweet paprika',
      '3 cups low-sodium vegetable or chicken broth'
    ],
    instructions: [
      'Sauté onion and garlic in olive oil in a deep pot over medium heat until fragrant and translucent.',
      'Add cumin, turmeric, sweet paprika, and diced sweet potato, stirring for 2 minutes.',
      'Pour in rinsed red lentils, crushed tomatoes, and warm broth. Bring to a gentle boil.',
      'Reduce heat to low, cover, and simmer for 20 minutes until sweet potatoes and lentils are tender.',
      'Stir in fresh spinach in batches until wilted. Squeeze fresh lemon juice over the bowl right before serving to maximize iron bioavailability.'
    ],
    recommendedTiming: 'Weeks 1 to 12 postpartum; excellent midday lunch for sustained stamina.'
  },
  {
    id: 'golden_oat_porridge',
    title: 'Galactagogue Golden Oat, Seed & Cinnamon Porridge',
    category: 'Lactation & Endocrine Support',
    healthBenefit: 'Whole rolled oats contain beta-glucan fiber, iron, and plant saponins naturally associated with stimulating prolactin secretion and maintaining steady blood glucose.',
    keyNutrients: ['Beta-Glucan Soluble Fiber', 'Alpha-Linolenic Acid (Omega-3)', 'Magnesium & B-Vitamins'],
    ingredients: [
      '1 cup rolled oats (certified gluten-free if sensitive)',
      '2 cups warm water or unsweetened almond/oat milk',
      '1 tbsp ground flaxseeds & 1 tbsp chia seeds',
      '1/2 tsp ground turmeric & 1/4 tsp Ceylon cinnamon',
      '1 pinch freshly ground black pepper (enhances turmeric absorption)',
      '1 tbsp pure maple syrup or date syrup',
      '1 tbsp almond butter or crushed walnuts for healthy fats'
    ],
    instructions: [
      'Combine oats, ground flaxseed, turmeric, cinnamon, black pepper, and liquid in a small saucepan.',
      'Simmer gently over low-medium heat for 5 to 7 minutes, stirring continuously until thick and creamy.',
      'Remove from heat and stir in chia seeds, allowing them to swell for 2 minutes.',
      'Top with almond butter, a drizzle of pure maple syrup, and sliced banana or warm berries.'
    ],
    recommendedTiming: 'Daily breakfast throughout breastfeeding and postpartum recovery.'
  },
  {
    id: 'anti_inflammatory_soup',
    title: 'Warming Anti-Inflammatory Ginger & Turmeric Broth Bowl',
    category: 'Uterine Healing & Digestion',
    healthBenefit: 'Active gingerols and curcumin promote gentle digestive motility, reduce systemic inflammatory markers, and ease postpartum intestinal sluggishness.',
    keyNutrients: ['Curcuminoids', 'Gingerols', 'Lean Protein', 'Potassium'],
    ingredients: [
      '300g boneless chicken breast or firm tofu, cubed',
      '2 tbsp freshly grated ginger root',
      '1 tbsp freshly grated or powdered turmeric',
      '4 cups clear chicken or vegetable broth',
      '1 cup sliced button or shiitake mushrooms',
      '1 cup chopped bok choy or tender local greens',
      '1 tsp toasted sesame oil & sliced scallions for garnish'
    ],
    instructions: [
      'Warm sesame oil in a medium saucepan and briefly sauté fresh ginger and turmeric for 60 seconds.',
      'Pour in broth and bring to a gentle simmer.',
      'Add cubed chicken breast or tofu and mushrooms; simmer gently for 8 to 10 minutes until chicken is cooked through.',
      'Add bok choy during the final 2 minutes so greens retain vibrant chlorophyll and crispness.',
      'Ladle into a bowl and garnish with fresh scallions. Serve piping hot.'
    ],
    recommendedTiming: 'Weeks 1 through 8; especially beneficial following delivery for gentle digestive recovery.'
  },
  {
    id: 'cellular_hydration_infusion',
    title: 'Cellular Electrolyte & Galactagogue Herbal Infusion',
    category: 'Breast Milk Volume & Fluid Balance',
    healthBenefit: 'Provides isotonic electrolytes without refined sugar spikes to support maternal milk synthesis, which demands an additional 700 to 1,000 mL of fluids daily.',
    keyNutrients: ['Electrolyte Potassium & Sodium', 'Magnesium Citrate', 'Trace Minerals'],
    ingredients: [
      '500 ml pure unsweetened coconut water',
      '500 ml cold filtered water or warm nettle/fennel herbal tea',
      'Fresh juice of 1 whole orange and 1/2 lime',
      '1/8 tsp Himalayan pink salt or sea salt',
      '1 tsp raw honey or pure agave (optional)'
    ],
    instructions: [
      'Brew nettle or fennel tea and allow to cool to room temperature (or use cold filtered water).',
      'In a 1-liter glass pitcher or water bottle, combine coconut water, herbal infusion, fresh orange juice, and lime juice.',
      'Add the pinch of pink salt and whisk thoroughly until dissolved.',
      'Keep chilled in the refrigerator or sip at room temperature throughout nursing sessions.'
    ],
    recommendedTiming: 'Sip steadily throughout the day alongside meals, targeting 3+ liters of total fluid intake.'
  }
];

export const MotherCareScreen: React.FC<MotherCareScreenProps> = ({ onBack, parentName = 'Mother' }) => {
  const [activeSection, setActiveSection] = useState<'recovery' | 'nutrition' | 'mental' | 'mobility'>('recovery');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  // 4-7-8 Guided Breathing & Diaphragmatic Calming Tool State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Inhale (4s)');
  const [breathTimer, setBreathTimer] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  React.useEffect(() => {
    if (!breathingActive) return;
    const interval = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev > 1) return prev - 1;
        if (breathingPhase.startsWith('Inhale')) {
          setBreathingPhase('Hold (7s)');
          return 7;
        } else if (breathingPhase.startsWith('Hold')) {
          setBreathingPhase('Exhale (8s)');
          return 8;
        } else {
          setBreathingPhase('Inhale (4s)');
          setCompletedCycles((c) => c + 1);
          return 4;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [breathingActive, breathingPhase]);

  const toggleBreathing = () => {
    if (breathingActive) {
      setBreathingActive(false);
      setBreathingPhase('Inhale (4s)');
      setBreathTimer(4);
    } else {
      setBreathingActive(true);
      setBreathingPhase('Inhale (4s)');
      setBreathTimer(4);
    }
  };

  // Mom Go To Sleep: 4-Hour Consolidated REM Sleep Window Delegation
  const [remSleepEndTime, setRemSleepEndTime] = useState<string | null>(null);
  const [activeShift, setActiveShift] = useState<{ caregiverName: string; caregiverRole: string; focusNote: string } | null>(null);
  const [isDelegationLoading, setIsDelegationLoading] = useState(false);

  React.useEffect(() => {
    fetch('/api/omugwo/state')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.activeShift) setActiveShift(data.activeShift);
        if (data?.remSleepDelegationEndTime) setRemSleepEndTime(data.remSleepDelegationEndTime);
      })
      .catch(() => {});
  }, []);

  const remainingRemTime = React.useMemo(() => {
    if (!remSleepEndTime) return null;
    const diff = new Date(remSleepEndTime).getTime() - Date.now();
    if (diff <= 0) return null;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs}h ${mins}m remaining`;
  }, [remSleepEndTime]);

  const handleToggleRemDelegation = async () => {
    setIsDelegationLoading(true);
    const activate = !remainingRemTime;
    try {
      const res = await fetch('/api/omugwo/shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activateRemSleepDelegation: activate,
          caregiverName: activate ? (activeShift?.caregiverName || 'On-Duty Caregiver') : (parentName || 'Mom'),
          caregiverRole: activate ? 'Grandma' : 'Mom',
          focusNote: activate
            ? '4-Hour Uninterrupted REM Sleep Window for Mom — Baby cry & care alerts routed to On-Duty Caregiver'
            : 'Maternal rest window concluded • Returned to active monitoring'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.activeShift) setActiveShift(data.activeShift);
        setRemSleepEndTime(data.remSleepDelegationEndTime || null);
      }
    } catch (err) {
      console.warn("Failed to toggle REM sleep delegation:", err);
    } finally {
      setIsDelegationLoading(false);
    }
  };

  useSEO({
    title: 'Mother Postpartum Care & Fourth Trimester Recovery | Ama Baby Care',
    description: 'Evidence-based maternal recovery guides, postpartum wound and pelvic floor healing, maternal wellness nutrition, and postpartum mental health resources.',
    canonicalUrl: 'https://amababycare.com/#mother-care'
  });

  const selectedRecipe = GLOBAL_WELLNESS_RECIPES.find(r => r.id === selectedRecipeId);

  const healthMilestones = [
    {
      title: 'Perineal & Wound Healing',
      badge: 'Physical Recovery',
      desc: 'Use a warm peri-wash bottle after every urination. Pat dry gently rather than wiping. Watch for swelling or separation of stitches.',
      icon: <ShieldCheck className="w-5 h-5 text-primary" />
    },
    {
      title: 'Cesarean Incision Vigilance',
      badge: 'Surgical Healing',
      desc: 'Keep the surgical site clean and completely dry. Wear high-waisted breathable cotton underwear. Avoid heavy lifting greater than your baby.',
      icon: <Activity className="w-5 h-5 text-primary" />
    },
    {
      title: 'Lochia Discharge Progression',
      badge: 'Uterine Involution',
      desc: 'Discharge typically transitions from dark red (Rubra, days 1-4) to pinkish-brown (Serosa, days 4-10) to yellowish-white (Alba, weeks 2-6).',
      icon: <Droplet className="w-5 h-5 text-primary" />
    },
    {
      title: 'Pelvic Floor Rehabilitation',
      badge: 'Muscle Tone',
      desc: 'Perform gentle diaphragmatic breathing and gentle Kegel contractions with complete release. Avoid high-impact exercise until 6-8 week clearance.',
      icon: <Wind className="w-5 h-5 text-primary" />
    }
  ];

  const redFlags = [
    'Soaking more than one full maxi pad per hour or passing blood clots larger than a golf ball',
    'Fever above 38.0°C (100.4°F), shaking chills, or foul-smelling vaginal discharge',
    'Severe, unrelenting headache, sudden vision changes (spots/flashes), or right upper rib pain (Postpartum Preeclampsia indicators)',
    'Painful, warm, red, wedge-shaped swelling on one breast accompanied by flu-like chills (Mastitis signs)',
    'Unilateral calf pain, tenderness, or localized leg swelling (Deep Vein Thrombosis warning signs)'
  ];

  const mentalHealthAssessments = [
    {
      title: 'Baby Blues vs. PPD',
      desc: 'Mild emotional volatility, tears, and fatigue are common in the first 10-14 days due to hormonal shifts. If sadness, anxiety, or detachment lasts beyond two weeks, professional screening is essential.'
    },
    {
      title: 'Consolidated Sleep Blocks',
      desc: 'Human brain restoration requires at least one 4-hour block of uninterrupted sleep in a 24-hour cycle. Coordinate with your partner or caregiver for one designated bottle or soothing shift.'
    },
    {
      title: 'Anxiety & Intrusive Thoughts',
      desc: 'Hypervigilance and scary intrusive thoughts can be distressing symptoms of postpartum anxiety (PPA). Discussing these thoughts with a healthcare provider helps disarm fear and initiate support.'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24 text-left font-sans text-gray-800">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/60 px-4 py-4 sm:px-8 flex items-center justify-between shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-primary font-bold text-xs uppercase tracking-wider bg-transparent border-none cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🤱</span>
          <h1 className="font-serif font-black text-gray-900 text-lg sm:text-xl tracking-tight">
            Mother Postpartum Care
          </h1>
        </div>
        <div className="w-12"></div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Hero Card */}
        <section className="bg-card p-6 sm:p-10 rounded-[40px] border border-white shadow-xl shadow-card/20 text-gray-800 relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-primary border border-white">
              <Heart className="w-3.5 h-3.5 text-primary" />
              <span>Evidence-Based Fourth Trimester Recovery</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-gray-900">
              Nurturing You, {parentName}.
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium">
              Maternal healing is a vital biological journey. This dedicated suite provides health-focused guidance on restorative recovery, lochia milestones, pelvic floor restoration, wellness nutrition, and emotional wellness.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 rounded-full -mr-28 -mt-28 blur-3xl pointer-events-none" />
        </section>

        {/* Clinical Red Flags Warning Banner */}
        <div className="bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-[32px] border border-rose-200 shadow-xl shadow-card/10 space-y-3">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider">
              Postpartum Wellness Red Flags – Contact Your Care Provider
            </h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            The fourth trimester carries unique physiological shifts. Seek immediate evaluation if you experience any of the following:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700 list-none p-0 m-0">
            {redFlags.map((flag, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-rose-50/60 p-2.5 rounded-2xl border border-rose-100">
                <span className="text-rose-600 font-bold shrink-0">•</span>
                <span className="leading-snug">{flag}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mom Go To Sleep: 4-Hour Consolidated REM Sleep Window Delegation Card */}
        <div className="bg-white/95 backdrop-blur-xs p-6 sm:p-7 rounded-[36px] border border-sky-100 shadow-xl shadow-card/15 space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl shrink-0 shadow-inner">
                🌙
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    Maternal Rest Recovery
                  </span>
                  {remainingRemTime && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 animate-pulse">
                      Rest Window Active
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-black text-gray-900 mt-0.5">
                  Mom's 4-Hour Consolidated REM Sleep Window
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleRemDelegation}
              disabled={isDelegationLoading}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer border-none transition-all flex items-center justify-center gap-2 shadow-md shrink-0 active:scale-95 ${
                remainingRemTime
                  ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-200'
                  : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
              }`}
            >
              {isDelegationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : remainingRemTime ? (
                <>
                  <Moon className="w-4 h-4" />
                  <span>End Sleep Window / Wake Up</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span>🛌 Mom Go To Sleep (4h)</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2 text-xs text-gray-600 leading-relaxed font-medium">
            <p>
              Evidence in fourth-trimester medicine confirms that consolidated sleep of at least 4 uninterrupted hours is essential to reset cortisol levels, promote perineal and cesarean cellular repair, and protect against postpartum depression (PPD).
            </p>
            <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-100 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-bold text-sky-950 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {remainingRemTime
                    ? `🛌 Mom is Resting (${remainingRemTime}) • Baby cry & monitor alerts are delegated to: ${activeShift?.caregiverName || 'On-Duty Caregiver'}`
                    : `Active On-Duty Alert Receiver: ${activeShift?.caregiverName || 'On-Duty Caregiver / Partner'}`}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Maternal Relaxation Resources & Guided 4-7-8 Breathing Visualizer */}
        <div className="bg-gradient-to-br from-sky-50 via-white to-blue-50/60 p-6 sm:p-7 rounded-[36px] border border-sky-100 shadow-xl shadow-card/10 space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/80 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-xl shrink-0 shadow-md shadow-primary/20">
                <Wind className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Relaxation & Grounding Resource
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-black text-gray-900 mt-0.5">
                  4-7-8 Diaphragmatic Postpartum Breathing & Calming
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleBreathing}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer border-none transition-all flex items-center justify-center gap-2 shadow-md shrink-0 active:scale-95 ${
                breathingActive
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                  : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
              }`}
            >
              {breathingActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Relaxation</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start 4-7-8 Guided Breath</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Visualizer Circle */}
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-sky-100 shadow-sm text-center">
              <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-1000 ${
                breathingPhase.startsWith('Inhale')
                  ? 'border-primary bg-sky-50 scale-110 shadow-lg shadow-sky-200'
                  : breathingPhase.startsWith('Hold')
                  ? 'border-amber-400 bg-amber-50 scale-105'
                  : 'border-emerald-500 bg-emerald-50 scale-95'
              }`}>
                <span className="text-2xl font-black text-gray-900">{breathTimer}s</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary mt-0.5">
                  {breathingPhase.split(' ')[0]}
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-500 mt-3">
                Completed Cycles: <span className="text-primary font-black">{completedCycles}</span>
              </p>
            </div>

            {/* Instruction Steps */}
            <div className="md:col-span-2 space-y-2.5 text-xs text-gray-700 leading-relaxed font-medium">
              <div className="p-3 bg-white rounded-2xl border border-sky-100 flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-gray-900">Inhale gently through nose for 4 seconds:</strong> Feel your lower ribcage and abdomen naturally expand without tensing shoulders.
                </div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-sky-100 flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-xl bg-amber-500/10 text-amber-700 font-black text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-gray-900">Hold breath comfortably for 7 seconds:</strong> Oxygenates maternal bloodstream and lowers circulating adrenalin and cortisol.
                </div>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-sky-100 flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-xl bg-emerald-500/10 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-gray-900">Slow woosh exhale through mouth for 8 seconds:</strong> Activates parasympathetic vagus nerve response for immediate exhaustion relief.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'recovery', label: 'Physical Recovery', icon: <Activity className="w-4 h-4" /> },
            { id: 'nutrition', label: 'Maternal Nutrition', icon: <Utensils className="w-4 h-4" /> },
            { id: 'mental', label: 'Mental Wellness (EPDS)', icon: <Brain className="w-4 h-4" /> },
            { id: 'mobility', label: 'Core & Mobility', icon: <Zap className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer border ${
                activeSection === tab.id 
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                  : 'bg-white/90 text-gray-700 border-white hover:bg-white shadow-xs'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Physical Recovery */}
        <AnimatePresence mode="wait">
          {activeSection === 'recovery' && (
            <motion.div 
              key="recovery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthMilestones.map((item, i) => (
                  <div key={i} className="bg-white/90 backdrop-blur-xs p-6 rounded-[32px] border border-white shadow-xl shadow-card/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        {item.icon}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-card text-gray-800 border border-white">
                        {item.badge}
                      </span>
                    </div>
                    <h4 className="font-serif font-black text-gray-900 text-base">{item.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Lochia Timeline Chart */}
              <div className="bg-white/90 backdrop-blur-xs p-6 sm:p-8 rounded-[36px] border border-white shadow-xl shadow-card/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-black text-gray-900">Normal Lochia Progression Timeline</h3>
                    <p className="text-xs text-gray-500 font-medium">Understanding uterine involution and postpartum bleeding stages</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                  <div className="p-4 rounded-2xl bg-card/40 border border-white space-y-1">
                    <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">Days 1 to 4</span>
                    <h5 className="font-bold text-gray-900">Lochia Rubra</h5>
                    <p className="text-[11px] text-gray-600 leading-snug">
                      Bright or dark red blood with occasional small clots. Moderate to heavy flow similar to a heavy menstrual cycle.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-card/40 border border-white space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Days 4 to 10</span>
                    <h5 className="font-bold text-gray-900">Lochia Serosa</h5>
                    <p className="text-[11px] text-gray-600 leading-snug">
                      Color lightens to pinkish-brown or watery discharge. Flow significantly reduces as placental detachment site epithelializes.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-card/40 border border-white space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Weeks 2 to 6</span>
                    <h5 className="font-bold text-gray-900">Lochia Alba</h5>
                    <p className="text-[11px] text-gray-600 leading-snug">
                      Yellowish-white or cream discharge consisting of leukocytes, mucus, and tissue debris. Gradually tapers off completely.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Maternal Nutrition */}
          {activeSection === 'nutrition' && (
            <motion.div 
              key="nutrition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white/90 backdrop-blur-xs p-6 sm:p-8 rounded-[36px] border border-white shadow-xl shadow-card/10 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                    Global Evidence-Based Postpartum Recipes
                  </span>
                  <h3 className="text-xl font-serif font-black text-gray-900">
                    Nourishment for Tissue Repair & Milk Synthesis
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Postpartum dietary needs include approximately 450–500 additional daily calories for lactation, coupled with elevated micronutrients (iron, zinc, choline, iodine, and omega-3 DHA). Select any recipe below for step-by-step preparation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {GLOBAL_WELLNESS_RECIPES.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => setSelectedRecipeId(recipe.id)}
                      className="p-5 rounded-2xl border border-white bg-white hover:bg-card/30 hover:border-primary/30 text-left transition-all group cursor-pointer shadow-xs flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase text-primary tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
                          {recipe.category}
                        </span>
                        <h4 className="font-serif font-black text-gray-900 group-hover:text-primary transition-colors text-sm mt-1">
                          {recipe.title}
                        </h4>
                        <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                          {recipe.healthBenefit}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] font-bold text-gray-500">
                        <span>{recipe.ingredients.length} Ingredients</span>
                        <span className="text-primary group-hover:translate-x-0.5 transition-transform">View Recipe →</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hydration Reminder Banner */}
              <div className="bg-card p-6 rounded-[32px] border border-white shadow-xl shadow-card/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0">
                    💧
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900">Maternal Hydration Target</h4>
                    <p className="text-xs text-gray-700">Aim for 3.0 to 3.5 liters (12 to 14 glasses) of total fluids daily to prevent headaches and optimize breast milk volume.</p>
                  </div>
                </div>
                <span className="px-4 py-2 rounded-2xl bg-white text-primary text-xs font-black uppercase tracking-wider shrink-0 border border-white shadow-xs">
                  Target: 3.5 L / Day
                </span>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Mental Wellness & EPDS */}
          {activeSection === 'mental' && (
            <motion.div 
              key="mental"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white/90 backdrop-blur-xs p-6 sm:p-8 rounded-[36px] border border-white shadow-xl shadow-card/10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-black text-gray-900">Postpartum Emotional Wellness</h3>
                    <p className="text-xs text-gray-500 font-medium">Understanding perinatal mood adjustments and emotional safety</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {mentalHealthAssessments.map((card, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-card/40 border border-white space-y-2">
                      <h4 className="font-serif font-black text-gray-900 text-sm">{card.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{card.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Interactive EPDS Wellness Tool */}
                <EPDSTool parentName={parentName} />
              </div>
            </motion.div>
          )}

          {/* Tab 4: Gentle Core & Mobility */}
          {activeSection === 'mobility' && (
            <motion.div 
              key="mobility"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/90 backdrop-blur-xs p-6 sm:p-8 rounded-[36px] border border-white shadow-xl shadow-card/10 space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-black text-gray-900">Gentle Fourth-Trimester Mobility</h3>
                  <p className="text-xs text-gray-500 font-medium">Reconnecting breath and pelvic alignment before resuming full workouts</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="p-5 rounded-2xl bg-card/40 border border-white space-y-2">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-lg shadow-2xs">🌬️</div>
                  <h4 className="text-sm font-black text-gray-900">Diaphragmatic Ribcage Breathing</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Sit comfortably upright. Inhale deeply expanding the 360-degree lower ribs and relaxing the pelvic floor. Gently exhale, letting the pelvic floor naturally recoil. Practice 5 minutes daily.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-card/40 border border-white space-y-2">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-lg shadow-2xs">🧘‍♀️</div>
                  <h4 className="text-sm font-black text-gray-900">Transverse Abdominal Engagement</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    On a gentle exhale, draw the lower belly slightly inward toward the spine as if zipping a gentle corset. Do not hold your breath. Ideal for safe recovery with diastasis recti.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-card/40 border border-white space-y-2">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-lg shadow-2xs">🚶‍♀️</div>
                  <h4 className="text-sm font-black text-gray-900">Progressive Flat-Surface Walking</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Begin with 10 minutes of gentle, leisurely strolls on flat ground. Stop immediately if lochia flow increases or changes back to bright red, which indicates excess exertion.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-card/40 border border-white space-y-2">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-lg shadow-2xs">💆‍♀️</div>
                  <h4 className="text-sm font-black text-gray-900">Nursing Ergonomics & Upper Back Release</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Always bring baby up to the breast/bottle using firm pillows rather than hunching down. Perform gentle chin tucks and shoulder blade squeezes to counteract postural neck strain.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recipe Detail Modal */}
        <AnimatePresence>
          {selectedRecipe && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[40px] p-6 sm:p-10 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative border border-white text-left"
              >
                <button 
                  onClick={() => setSelectedRecipeId(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer border-none transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-2.5 py-0.5 rounded-full">
                      {selectedRecipe.category}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 leading-tight">
                      {selectedRecipe.title}
                    </h3>
                  </div>

                  <div className="bg-card/50 p-5 rounded-[28px] border border-white space-y-2">
                    <p className="text-[10px] font-black text-gray-800 uppercase tracking-wider">
                      Postpartum Health Benefit
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                      {selectedRecipe.healthBenefit}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedRecipe.keyNutrients.map((nut, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white border border-white text-gray-700 shadow-2xs">
                          ✓ {nut}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <Utensils className="w-3.5 h-3.5 text-primary" /> Key Ingredients
                      </h4>
                      <ul className="space-y-1.5 list-none p-0 m-0">
                        {selectedRecipe.ingredients.map((ing, i) => (
                          <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-primary" /> Preparation
                      </h4>
                      <ol className="space-y-2 p-0 m-0 list-none">
                        {selectedRecipe.instructions.map((inst, i) => (
                          <li key={i} className="text-xs text-gray-700 leading-relaxed flex items-start gap-2">
                            <span className="font-black text-primary shrink-0">{i+1}.</span>
                            <span>{inst}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] font-bold text-gray-500">
                      Recommended: {selectedRecipe.recommendedTiming}
                    </span>
                    <button 
                      onClick={() => setSelectedRecipeId(null)}
                      className="bg-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-colors cursor-pointer border-none shadow-sm"
                    >
                      Close Recipe
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
