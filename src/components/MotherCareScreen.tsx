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
  RotateCcw,
  Plus,
  Soup,
  Coffee,
  Sparkles
} from 'lucide-react';
import { useSEO } from '../utils/seo';
import { EPDSTool } from './EPDSTool';
import { db } from '../firebase';
import { collection, doc, setDoc, query, where, onSnapshot } from 'firebase/firestore';

interface MotherCareScreenProps {
  onBack: () => void;
  parentName?: string;
  currentUser?: any;
  omugwoLogs?: any[];
  onAddOmugwoLog?: (log: any) => void;
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

export const MotherCareScreen: React.FC<MotherCareScreenProps> = ({ 
  onBack, 
  parentName = 'Mom',
  currentUser,
  omugwoLogs = [],
  onAddOmugwoLog
}) => {
  const [activeSection, setActiveSection] = useState<'recovery' | 'nutrition' | 'mental' | 'mobility'>('recovery');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  // Guided Postpartum Breathing & Mobility Calibration Routines
  interface BreathingRoutine {
    id: string;
    emoji: string;
    title: string;
    badge: string;
    focusTag: string;
    inhaleSec: number;
    holdSec: number;
    exhaleSec: number;
    description: string;
    step1Title: string;
    step1Detail: string;
    step2Title: string;
    step2Detail: string;
    step3Title: string;
    step3Detail: string;
  }

  const BREATHING_ROUTINES: BreathingRoutine[] = [
    {
      id: 'calming-478',
      emoji: '🌬️',
      title: '4-7-8 Diaphragmatic Postpartum Breathing & Calming',
      badge: 'Relaxation & Grounding Resource',
      focusTag: 'Cortisol Reset',
      inhaleSec: 4,
      holdSec: 7,
      exhaleSec: 8,
      description: 'Restorative nervous-system down-regulation to soothe exhaustion, ease tension, and prepare for sleep.',
      step1Title: 'Inhale gently through nose for 4 seconds:',
      step1Detail: 'Feel your lower ribcage and abdomen naturally expand without tensing shoulders.',
      step2Title: 'Hold breath comfortably for 7 seconds:',
      step2Detail: 'Oxygenates maternal bloodstream and lowers circulating adrenalin and cortisol.',
      step3Title: 'Slow woosh exhale through mouth for 8 seconds:',
      step3Detail: 'Activates parasympathetic vagus nerve response for immediate exhaustion relief.'
    },
    {
      id: 'diaphragmatic-ribcage',
      emoji: '🌬️',
      title: 'Diaphragmatic Ribcage Breathing',
      badge: 'Mobility & Breath Sync',
      focusTag: '360° Rib Expansion',
      inhaleSec: 4,
      holdSec: 2,
      exhaleSec: 6,
      description: 'Sit comfortably upright. Inhale deeply expanding the 360-degree lower ribs and relaxing the pelvic floor. Gently exhale, letting the pelvic floor naturally recoil. Practice 5 minutes daily.',
      step1Title: '360° Ribcage Inhale (4 seconds):',
      step1Detail: 'Breathe wide into the sides and back of your lower ribs while softening the belly and pelvic floor.',
      step2Title: 'Soft Expansion Pause (2 seconds):',
      step2Detail: 'Hold gently at the top of the breath without clenching your jaw, neck, or shoulders.',
      step3Title: 'Gentle Pelvic Recoil Exhale (6 seconds):',
      step3Detail: 'Purse lips softly and exhale slowly, allowing the pelvic floor to lift naturally upward.'
    },
    {
      id: 'transverse-ab',
      emoji: '🧘‍♀️',
      title: 'Transverse Abdominal Engagement',
      badge: 'Deep Core Reconnection',
      focusTag: 'Diastasis Safe',
      inhaleSec: 4,
      holdSec: 2,
      exhaleSec: 6,
      description: 'On a gentle exhale, draw the lower belly slightly inward toward the spine as if zipping a gentle corset. Do not hold your breath. Ideal for safe recovery with diastasis recti.',
      step1Title: 'Relaxed Belly Inhale (4 seconds):',
      step1Detail: 'Let your lower abdomen and pelvic floor completely soften and lengthen as air fills your ribs.',
      step2Title: 'Alignment Check (2 seconds):',
      step2Detail: 'Stack ribs over pelvis and keep your tailbone neutral before engaging deep core muscles.',
      step3Title: 'Corset Zip Exhale (6 seconds):',
      step3Detail: 'Exhale steadily from bottom to top, gently hugging hip bones inward toward midline.'
    },
    {
      id: 'pelvic-tilts',
      emoji: '🦴',
      title: 'Pelvic Tilts & Neutral Spine Alignment',
      badge: 'Postural Reset',
      focusTag: 'Lower Back Relief',
      inhaleSec: 4,
      holdSec: 3,
      exhaleSec: 6,
      description: 'Lie supine with knees bent or stand against a wall. Gently rock the pelvis backward to flatten the lower back on exhale, releasing pregnancy swayback and lumbar compression.',
      step1Title: 'Neutral Arch Inhale (4 seconds):',
      step1Detail: 'Let the pelvis tip slightly forward to feel a small, comfortable natural curve under your lower back.',
      step2Title: 'Pause & Soften Hips (3 seconds):',
      step2Detail: 'Relax glutes and hip flexors while keeping both shoulder blades resting flat.',
      step3Title: 'Imprint Spine Exhale (6 seconds):',
      step3Detail: 'Exhale slowly while tilting pubic bone toward ribs, lengthening the lower back against the mat.'
    },
    {
      id: 'heel-slides',
      emoji: '🦵',
      title: 'Supine Heel Slides & Core Stabilization',
      badge: 'Low-Load Core Control',
      focusTag: 'C-Section & Vaginal Safe',
      inhaleSec: 4,
      holdSec: 2,
      exhaleSec: 5,
      description: 'With knees bent on the floor, slowly slide one heel out during a steady exhale without letting ribs flare or back arch. Builds controlled stability without abdominal coning.',
      step1Title: 'Prepare & Lengthen Inhale (4 seconds):',
      step1Detail: 'Breathe into lower ribs with both feet planted hip-width apart and torso completely relaxed.',
      step2Title: 'Core Anchor Pause (2 seconds):',
      step2Detail: 'Rest hands lightly on hip bones to monitor that the pelvis stays level and still.',
      step3Title: 'Heel Slide Out Exhale (5 seconds):',
      step3Detail: 'Engage lower belly gently and slide one heel out along the floor, then draw it back smoothly.'
    },
    {
      id: 'cat-cow-flow',
      emoji: '🐈',
      title: 'Cat-Cow Thoracic & Pelvic Flow',
      badge: 'Spine & Milk-Flow Mobility',
      focusTag: 'Rib & Spine Mobility',
      inhaleSec: 5,
      holdSec: 2,
      exhaleSec: 6,
      description: 'On hands and knees (with folded towel under wrists/knees if needed), alternate gentle chest opening and rounded spine stretches synchronized to long breath cycles.',
      step1Title: 'Cow Pose Opening Inhale (5 seconds):',
      step1Detail: 'Soften belly downward, lift sternum forward, and spread sit-bones wide to release pelvic tension.',
      step2Title: 'Gentle Crown Lift (2 seconds):',
      step2Detail: 'Hold the open chest position gently without crunching the back of your neck.',
      step3Title: 'Cat Rounding Exhale (6 seconds):',
      step3Detail: 'Press palms softly into mat, tuck tailbone under, and breathe stretch into upper shoulder blades.'
    },
    {
      id: 'glute-bridge',
      emoji: '🌉',
      title: 'Supported Glute Bridge & Pelvic Floor Lift',
      badge: 'Posterior Chain Support',
      focusTag: 'Hip & Pelvic Support',
      inhaleSec: 4,
      holdSec: 3,
      exhaleSec: 6,
      description: 'Press gently through heels to lift hips only a few inches on exhale while squeezing a soft pillow between knees. Supports weakened postpartum glutes and sacroiliac joints.',
      step1Title: 'Grounded Floor Inhale (4 seconds):',
      step1Detail: 'Relax tailbone on the floor and soften thighs and pelvic floor completely.',
      step2Title: 'Top-of-Bridge Hold (3 seconds):',
      step2Detail: 'During the hold or peak lift, keep ribs down in line with hips without overarching.',
      step3Title: 'Lift & Lower Control Exhale (6 seconds):',
      step3Detail: 'Exhale while lifting hips softly via glutes, then lower vertebra by vertebra on next breath.'
    },
    {
      id: 'flat-walking',
      emoji: '🚶‍♀️',
      title: 'Progressive Flat-Surface Walking',
      badge: 'Gradual Endurance',
      focusTag: 'Circulation & Mood',
      inhaleSec: 4,
      holdSec: 1,
      exhaleSec: 5,
      description: 'Begin with 10 minutes of gentle, leisurely strolls on flat ground. Stop immediately if lochia flow increases or changes back to bright red, which indicates excess exertion.',
      step1Title: '4-Step Nasal Inhale (4 seconds):',
      step1Detail: 'Match your inhale smoothly across 4 relaxed footsteps while keeping posture tall and ribcage stacked.',
      step2Title: 'Natural Stride Transition (1 second):',
      step2Detail: 'Keep arms swinging gently by your sides—avoid gripping stroller handles with hunched shoulders.',
      step3Title: '5-Step Steady Exhale (5 seconds):',
      step3Detail: 'Release breath steadily over 5 steps, checking that pelvic pressure feels light and supported.'
    },
    {
      id: 'nursing-ergonomics',
      emoji: '💆‍♀️',
      title: 'Nursing Ergonomics & Upper Back Release',
      badge: 'Neck & Shoulder Decompression',
      focusTag: 'Feeding Posture',
      inhaleSec: 4,
      holdSec: 3,
      exhaleSec: 7,
      description: 'Always bring baby up to the breast/bottle using firm pillows rather than hunching down. Perform gentle chin tucks and shoulder blade squeezes to counteract postural neck strain.',
      step1Title: 'Chest Expansion Inhale (4 seconds):',
      step1Detail: 'Sit tall against chair support and draw shoulders down away from ears while opening collarbones.',
      step2Title: 'Chin Tuck & Blade Squeeze (3 seconds):',
      step2Detail: 'Gently glide chin backward and press shoulder blades lightly together behind your heart.',
      step3Title: 'Long Jaw-Relaxing Exhale (7 seconds):',
      step3Detail: 'Drop tension from temples, jaw, and trapezius muscles during a slow 7-second exhale.'
    }
  ];

  const MOBILITY_CARDS = BREATHING_ROUTINES.filter((r) => r.id !== 'calming-478');
  const breathVisualizerRef = React.useRef<HTMLDivElement | null>(null);
  const [selectedBreathId, setSelectedBreathId] = useState<string>('calming-478');
  const activeRoutine = BREATHING_ROUTINES.find((r) => r.id === selectedBreathId) || BREATHING_ROUTINES[0];

  // Guided Breathing & Diaphragmatic Calming Tool State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(activeRoutine.inhaleSec);
  const [completedCycles, setCompletedCycles] = useState(0);

  React.useEffect(() => {
    if (!breathingActive) return;
    const interval = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev > 1) return prev - 1;
        if (breathingPhase === 'Inhale') {
          if (activeRoutine.holdSec > 0) {
            setBreathingPhase('Hold');
            return activeRoutine.holdSec;
          }
          setBreathingPhase('Exhale');
          return activeRoutine.exhaleSec;
        } else if (breathingPhase === 'Hold') {
          setBreathingPhase('Exhale');
          return activeRoutine.exhaleSec;
        } else {
          setBreathingPhase('Inhale');
          setCompletedCycles((c) => c + 1);
          return activeRoutine.inhaleSec;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [breathingActive, breathingPhase, activeRoutine.inhaleSec, activeRoutine.holdSec, activeRoutine.exhaleSec]);

  const selectBreathingRoutine = (routineId: string, autoStart = true) => {
    const next = BREATHING_ROUTINES.find((r) => r.id === routineId) || BREATHING_ROUTINES[0];
    setSelectedBreathId(next.id);
    setBreathingPhase('Inhale');
    setBreathTimer(next.inhaleSec);
    setCompletedCycles(0);
    setBreathingActive(autoStart);
    if (autoStart) {
      setTimeout(() => {
        breathVisualizerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
    }
  };

  const toggleBreathing = () => {
    if (breathingActive) {
      setBreathingActive(false);
      setBreathingPhase('Inhale');
      setBreathTimer(activeRoutine.inhaleSec);
    } else {
      setBreathingPhase('Inhale');
      setBreathTimer(activeRoutine.inhaleSec);
      setBreathingActive(true);
    }
  };

  // Mom Go To Sleep: 4-Hour Consolidated REM Sleep Window
  const [remSleepEndTime, setRemSleepEndTime] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('ama_maternal_rem_sleep_end');
      if (!saved) return null;
      const diff = new Date(saved).getTime() - Date.now();
      return diff > 0 ? saved : null;
    } catch {
      return null;
    }
  });

  // Nourishment Logging State (omugwo_logs)
  const [isLogNourishmentModalOpen, setIsLogNourishmentModalOpen] = useState(false);
  const [nourishmentTitle, setNourishmentTitle] = useState('');
  const [nourishmentCategory, setNourishmentCategory] = useState('Healing Soup');
  const [nourishmentBenefits, setNourishmentBenefits] = useState('');
  const [nourishmentNotes, setNourishmentNotes] = useState('');
  const [isSavingNourishment, setIsSavingNourishment] = useState(false);
  const [nourishmentSuccessMsg, setNourishmentSuccessMsg] = useState('');
  const [firestoreOmugwoLogs, setFirestoreOmugwoLogs] = useState<any[]>([]);

  React.useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(collection(db, 'omugwo_logs'), where('userId', '==', currentUser.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs: any[] = [];
        snapshot.forEach((d) => docs.push({ id: d.id, ...d.data() }));
        docs.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
        setFirestoreOmugwoLogs(docs);
      },
      (err) => console.warn('Firestore omugwo_logs sync error:', err)
    );
    return () => unsub();
  }, [currentUser?.uid]);

  const combinedOmugwoLogs = React.useMemo(() => {
    const map = new Map<string, any>();
    (omugwoLogs || []).forEach(l => map.set(l.id, l));
    firestoreOmugwoLogs.forEach(l => map.set(l.id, l));
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
    );
  }, [omugwoLogs, firestoreOmugwoLogs]);

  const remainingRemTime = React.useMemo(() => {
    if (!remSleepEndTime) return null;
    const diff = new Date(remSleepEndTime).getTime() - Date.now();
    if (diff <= 0) return null;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs}h ${mins}m remaining`;
  }, [remSleepEndTime]);

  const handleToggleRemSleep = () => {
    if (remainingRemTime) {
      setRemSleepEndTime(null);
      localStorage.removeItem('ama_maternal_rem_sleep_end');
    } else {
      const endsAt = new Date(Date.now() + 4 * 3600 * 1000).toISOString();
      setRemSleepEndTime(endsAt);
      localStorage.setItem('ama_maternal_rem_sleep_end', endsAt);
    }
  };

  const handleSaveNourishmentLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nourishmentTitle.trim()) return;

    setIsSavingNourishment(true);
    const newLogId = `omugwo-log-${Date.now()}`;
    const newLog = {
      id: newLogId,
      userId: currentUser?.uid || 'user',
      title: nourishmentTitle.trim(),
      category: nourishmentCategory,
      benefits: nourishmentBenefits.trim() || 'Postpartum recovery and tissue healing',
      loggedAt: new Date().toISOString(),
      notes: nourishmentNotes.trim()
    };

    // Save to Firestore omugwo_logs collection for the user
    if (currentUser?.uid) {
      try {
        await setDoc(doc(db, 'omugwo_logs', newLogId), newLog);
      } catch (err) {
        console.warn('Failed to save to Firestore omugwo_logs collection:', err);
      }
    }

    if (onAddOmugwoLog) {
      onAddOmugwoLog(newLog);
    }

    setIsSavingNourishment(false);
    setNourishmentSuccessMsg(`Logged "${newLog.title}" to nourishment records!`);
    setTimeout(() => {
      setIsLogNourishmentModalOpen(false);
      setNourishmentSuccessMsg('');
      setNourishmentTitle('');
      setNourishmentBenefits('');
      setNourishmentNotes('');
    }, 1200);
  };

  useSEO({
    title: 'Mother Postpartum Care & Fourth Trimester Recovery | Ama Baby',
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
      desc: 'Keep the surgical site clean and dry. Wear high-waisted breathable cotton underwear. Avoid heavy lifting greater than your baby.',
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
      title: 'Baby Blues vs. Ongoing Strain',
      desc: 'Mild emotional shifts, tears, and fatigue are common in the first 10-14 days as hormones adjust. If sadness, worry, or detachment lasts beyond two weeks, reaching out to a healthcare provider for support is important.'
    },
    {
      title: 'Consolidated Sleep Blocks',
      desc: 'Restorative rest often includes at least one 4-hour block of uninterrupted sleep in a 24-hour cycle. Coordinate with your partner or family circle for one designated bottle or soothing shift.'
    },
    {
      title: 'Worry & Intrusive Thoughts',
      desc: 'Heightened vigilance and unsettling intrusive thoughts can happen after welcoming a baby. Sharing these thoughts with a healthcare provider helps bring reassurance and practical support.'
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

        {/* Wellness Warning Banner */}
        <div className="bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-[32px] border border-sky-200 shadow-xl shadow-card/10 space-y-3">
          <div className="flex items-center gap-2 text-sky-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider">
              When to Contact Your Healthcare Provider
            </h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            The fourth trimester brings major physical changes. Reach out for prompt medical evaluation if you experience any of the following:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700 list-none p-0 m-0">
            {redFlags.map((flag, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-sky-50/60 p-2.5 rounded-2xl border border-sky-100">
                <span className="text-sky-600 font-bold shrink-0">•</span>
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
                    <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 animate-pulse">
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
              onClick={handleToggleRemSleep}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer border-none transition-all flex items-center justify-center gap-2 shadow-md shrink-0 active:scale-95 ${
                remainingRemTime
                  ? 'bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-200'
                  : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
              }`}
            >
              {remainingRemTime ? (
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
              Getting a consolidated 4-hour block of uninterrupted rest helps lower fatigue, supports physical recovery, and nurtures emotional balance during the fourth trimester.
            </p>
            <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-100 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-bold text-sky-950 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {remainingRemTime
                    ? `🛌 Mom is Resting (${remainingRemTime}) • Dedicated 4-Hour Consolidated Rest Active`
                    : "Consolidated Rest Ready • Tap to begin Mom's 4-hour recovery window"}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Maternal Relaxation Resources & Dynamic Guided Breathing Visualizer */}
        <div
          ref={breathVisualizerRef}
          className="bg-gradient-to-br from-sky-50 via-white to-sky-50/60 p-6 sm:p-7 rounded-[36px] border border-sky-100 shadow-xl shadow-card/10 space-y-4 text-left"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/80 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-xl shrink-0 shadow-md shadow-primary/20">
                <Wind className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {activeRoutine.badge}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    {activeRoutine.inhaleSec}-{activeRoutine.holdSec}-{activeRoutine.exhaleSec} Cadence
                  </span>
                  {selectedBreathId !== 'calming-478' && (
                    <button
                      type="button"
                      onClick={() => selectBreathingRoutine('calming-478', false)}
                      className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      Reset to 4-7-8 Calming
                    </button>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-black text-gray-900 mt-1">
                  {activeRoutine.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleBreathing}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer border-none transition-all flex items-center justify-center gap-2 shadow-md shrink-0 active:scale-95 ${
                breathingActive
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-500/20'
                  : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
              }`}
            >
              {breathingActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Breathing</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Start {activeRoutine.inhaleSec}-{activeRoutine.holdSec}-{activeRoutine.exhaleSec} Guided Breath</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Visualizer Circle */}
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-sky-100 shadow-sm text-center">
              <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-1000 ${
                breathingPhase === 'Inhale'
                  ? 'border-primary bg-sky-50 scale-110 shadow-lg shadow-sky-200'
                  : breathingPhase === 'Hold'
                  ? 'border-sky-400 bg-sky-50 scale-105'
                  : 'border-emerald-500 bg-emerald-50 scale-95'
              }`}>
                <span className="text-2xl font-black text-gray-900">{breathTimer}s</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary mt-0.5">
                  {breathingPhase}
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-500 mt-3">
                Completed Cycles: <span className="text-primary font-black">{completedCycles}</span>
              </p>
              <p className="text-[10px] font-bold text-sky-700 mt-1">
                {activeRoutine.focusTag}
              </p>
            </div>

            {/* Dynamic Instruction Steps for Active Routine */}
            <div className="md:col-span-2 space-y-2.5 text-xs text-gray-700 leading-relaxed font-medium">
              <div className={`p-3 rounded-2xl border flex items-start gap-2.5 transition-colors ${
                breathingActive && breathingPhase === 'Inhale' ? 'bg-sky-50 border-primary/40 shadow-xs' : 'bg-white border-sky-100'
              }`}>
                <span className="w-6 h-6 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-gray-900">{activeRoutine.step1Title}</strong> {activeRoutine.step1Detail}
                </div>
              </div>
              <div className={`p-3 rounded-2xl border flex items-start gap-2.5 transition-colors ${
                breathingActive && breathingPhase === 'Hold' ? 'bg-sky-50 border-sky-400 shadow-xs' : 'bg-white border-sky-100'
              }`}>
                <span className="w-6 h-6 rounded-xl bg-sky-500/10 text-sky-700 font-black text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-gray-900">{activeRoutine.step2Title}</strong> {activeRoutine.step2Detail}
                </div>
              </div>
              <div className={`p-3 rounded-2xl border flex items-start gap-2.5 transition-colors ${
                breathingActive && breathingPhase === 'Exhale' ? 'bg-emerald-50 border-emerald-400 shadow-xs' : 'bg-white border-sky-100'
              }`}>
                <span className="w-6 h-6 rounded-xl bg-emerald-500/10 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-gray-900">{activeRoutine.step3Title}</strong> {activeRoutine.step3Detail}
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
            { id: 'mental', label: 'Emotional Check-In', icon: <Brain className="w-4 h-4" /> },
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
                    <span className="text-[10px] font-black uppercase text-primary tracking-wider">Days 1 to 4</span>
                    <h5 className="font-bold text-gray-900">Lochia Rubra</h5>
                    <p className="text-[11px] text-gray-600 leading-snug">
                      Bright or dark red blood with occasional small clots. Moderate to heavy flow similar to a heavy menstrual cycle.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-card/40 border border-white space-y-1">
                    <span className="text-[10px] font-black uppercase text-sky-700 tracking-wider">Days 4 to 10</span>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                      Global Evidence-Based Postpartum Recipes
                    </span>
                    <h3 className="text-xl font-serif font-black text-gray-900">
                      Nourishment for Tissue Repair & Milk Synthesis
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Postpartum dietary needs include approximately 450 to 500 additional daily calories for lactation, coupled with elevated micronutrients.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setNourishmentTitle('Ji Mmiri Oku (Postpartum Yam Pepper Soup)');
                      setNourishmentCategory('Healing Soup');
                      setNourishmentBenefits('Uterine involution, blood cleansing, and lactation stimulation via Uziza & Uda');
                      setIsLogNourishmentModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer border-none shadow-md shrink-0 self-start sm:self-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log Nourishment</span>
                  </button>
                </div>

                {/* Logged Nourishment History (omugwo_logs) */}
                {combinedOmugwoLogs.length > 0 && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <Soup className="w-3.5 h-3.5 text-amber-700" />
                        <span>Recent Maternal Nourishment Logs ({combinedOmugwoLogs.length})</span>
                      </span>
                      <span className="text-[9px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                        Saved in Cloud (omugwo_logs)
                      </span>
                    </div>
                    <div className="divide-y divide-amber-100/80">
                      {combinedOmugwoLogs.slice(0, 5).map((log: any) => (
                        <div key={log.id} className="py-2 flex items-start justify-between gap-2 text-xs">
                          <div>
                            <p className="font-bold text-gray-900">{log.title}</p>
                            <p className="text-[11px] text-gray-600">{log.benefits || log.notes || log.category}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                            {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-black text-gray-900">Gentle Fourth-Trimester Mobility</h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Reconnecting breath and pelvic alignment before resuming full workouts — tap any routine to sync the Breathing Timer above
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 self-start sm:self-center shrink-0">
                  {MOBILITY_CARDS.length} Guided Routines
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {MOBILITY_CARDS.map((card) => {
                  const isSelected = selectedBreathId === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => selectBreathingRoutine(card.id, true)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer space-y-2.5 flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-sky-50/90 border-primary shadow-md ring-2 ring-primary/15'
                          : 'bg-card/40 border-white hover:border-primary/40 hover:bg-sky-50/30 shadow-xs'
                      }`}
                    >
                      <div className="space-y-2 w-full">
                        <div className="flex items-center justify-between gap-2">
                          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-lg shadow-2xs shrink-0">
                            {card.emoji}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-gray-700 border border-gray-200">
                              {card.inhaleSec}-{card.holdSec}-{card.exhaleSec}s Breath
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                            }`}>
                              {isSelected ? 'Active in Timer' : 'Tap to Guide'}
                            </span>
                          </div>
                        </div>
                        <h4 className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">
                          {card.title}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-gray-200/60 w-full flex items-center justify-between text-[10px] font-bold text-primary">
                        <span>{card.focusTag}</span>
                        <span>Load into Breathing Timer →</span>
                      </div>
                    </button>
                  );
                })}
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setNourishmentTitle(selectedRecipe.title);
                          setNourishmentCategory(selectedRecipe.category);
                          setNourishmentBenefits(selectedRecipe.healthBenefit);
                          setSelectedRecipeId(null);
                          setIsLogNourishmentModalOpen(true);
                        }}
                        className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer border-none flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log to Records</span>
                      </button>
                      <button 
                        onClick={() => setSelectedRecipeId(null)}
                        className="bg-primary text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-colors cursor-pointer border-none shadow-sm"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Log Nourishment to Firestore (omugwo_logs) */}
        <AnimatePresence>
          {isLogNourishmentModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[36px] p-6 sm:p-8 max-w-md w-full space-y-4 border border-gray-100 shadow-2xl text-left"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                      Maternal Recovery Intake
                    </span>
                    <h3 className="text-xl font-serif font-black text-gray-900 mt-0.5">
                      Log Nourishment (omugwo_logs)
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsLogNourishmentModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 border-none cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {nourishmentSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold">
                    ✅ {nourishmentSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleSaveNourishmentLog} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Meal / Broth / Tea Name
                    </label>
                    <input
                      type="text"
                      required
                      value={nourishmentTitle}
                      onChange={e => setNourishmentTitle(e.target.value)}
                      placeholder="e.g. Ji Mmiri Oku, Lactation Porridge, Chicken Broth"
                      className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-semibold text-gray-800 outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={nourishmentCategory}
                      onChange={e => setNourishmentCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-semibold text-gray-800 outline-none focus:border-primary"
                    >
                      <option value="Healing Soup">Healing Soup</option>
                      <option value="Lactation Porridge / Pap">Lactation Porridge / Pap</option>
                      <option value="Herbal Recovery Tea">Herbal Recovery Tea</option>
                      <option value="Hydration & Electrolytes">Hydration & Electrolytes</option>
                      <option value="High-Iron Nutrient Meal">High-Iron Nutrient Meal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Health Benefit & Herbs
                    </label>
                    <input
                      type="text"
                      value={nourishmentBenefits}
                      onChange={e => setNourishmentBenefits(e.target.value)}
                      placeholder="e.g. Uterine involution with Uziza and Uda spices"
                      className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Notes or Caregiver Observation (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={nourishmentNotes}
                      onChange={e => setNourishmentNotes(e.target.value)}
                      placeholder="e.g. Mom finished warm bowl with 2 cups of water; appetite improving"
                      className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsLogNourishmentModalOpen(false)}
                      className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold border-none cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingNourishment || !nourishmentTitle.trim()}
                      className="flex-1 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {isSavingNourishment ? 'Saving...' : 'Save to Firestore'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
