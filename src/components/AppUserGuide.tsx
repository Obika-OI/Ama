import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  HelpCircle, 
  Utensils, 
  Moon, 
  ShieldCheck, 
  Users, 
  Mic, 
  Calendar, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Heart, 
  Activity, 
  Lock, 
  AlertCircle,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { useSEO } from '../utils/seo';
import { UniversalFooter } from './UniversalFooter';

interface AppUserGuideProps {
  onClose?: () => void;
  onNavigateToScreen?: (screen: string) => void;
  isPremium?: boolean;
}

interface GuideSection {
  id: string;
  title: string;
  category: string;
  icon: string;
  summary: string;
  steps: string[];
  tips: string[];
  faqs?: { question: string; answer: string }[];
}

export const AppUserGuide: React.FC<AppUserGuideProps> = ({ onClose, onNavigateToScreen, isPremium = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>('getting-started');

  // SEO mapping to dynamic article page
  useSEO({
    title: 'User Manual & Safety Guide | Ama Baby',
    description: 'Learn how to use Ama Baby all-in-one baby care tracking tools, prepare cheap local weaning cereals, and manage infant food allergies offline.',
    robots: 'index, follow',
    ogType: 'article',
    ogTitle: 'User Manual & Safety Guide | Ama Baby',
    ogDescription: 'Step-by-step instructions on breastfeeding timers, immunization checklists, and offline data sandboxing for resourceful mothers.',
    publishedTime: '2026-10-03T12:00:00Z',
    author: 'Ama Care Team'
  });

  const guideSections: GuideSection[] = [
    {
      id: 'getting-started',
      title: '1. Getting Started & Baby Profile Setup',
      category: 'BASICS',
      icon: '👶',
      summary: 'Setting up your baby profile is the first step on your parenting tracking journey. To start, you will complete onboarding by providing your baby’s name and date of birth, which helps customize developmental milestones and schedules. We also ask for a parent or adult caregiver birth date to help confirm that the workspace is managed by an adult. You can choose your preferred measurement systems, such as ml or oz for fluids, and kg or lbs for weight. Your active dashboard acts as a central hub, presenting daily growth quests, schedule reminders, and quick tracking buttons in one organized layout.',
      steps: [
        'Complete initial onboarding by providing the baby’s name, birth date, and a parent or adult caregiver birth date.',
        'Choose your preferred measurement units in settings (ml or oz for fluids, kg or lbs for weight).',
        'Review your dashboard to see daily growth quests, scheduled meal reminders, and quick action logs.'
      ],
      tips: [
        'Update your baby’s age milestone anytime in Settings or Growth Tracker to automatically adjust feeding recommendations.',
        'Complete daily quests to build your streak and earn milestone celebration points.'
      ],
      faqs: [
        {
          question: 'Why do I need to enter my parent birthdate?',
          answer: 'Parent or adult caregiver confirmation helps ensure child care workspaces are managed by an adult.'
        }
      ]
    },
    {
      id: 'feeding-nutrition',
      title: '2. Breastfeeding & Local Nutrition Log',
      category: 'FEEDING',
      icon: '🍼',
      summary: 'Monitoring feeding schedules shouldn’t require subscription fees or heavy data usage. Ama’s feeding and hydration tracker is engineered to help sleep-deprived mothers log every meal with absolute clarity and resourcefulness. For breastfeeds, we provide simple Left and Right breast timers that run fully offline, helping you coordinate feedings and keep your body comfortable. If you feed with a bottle or cup, you can log exact amounts of water, breast milk, or affordable weaning fluids in seconds. We place a supreme focus on introducing solids safely when your baby reaches six months. Instead of buying expensive commercial jars, our manual guides you on preparing cheap, protein-dense local weaning cereals like Tom Brown using sorghum, millet, and soybeans. You can log each meal, write down how well your baby accepted the food, note their digestive appetite, and immediately flag any itchy skin rashes or digestive changes, which helps you isolate food sensitivities cautiously.',
      steps: [
        'Tap "Meal Log" on the navigation bar to access fluid intake and solid food logs.',
        'Use the Left/Right Nursing Timer for breastfeeding, or quickly tap the +50ml button to log hydration.',
        'When introducing a new solid food, record acceptance, taste, appetite, and any suspected reactions.'
      ],
      tips: [
        'Set daily fluid goals to ensure baby stays adequately hydrated throughout weather changes.',
        'Flag suspected food reactions immediately to cross-reference them with the Allergen Matrix.'
      ]
    },
    {
      id: 'allergens-health',
      title: '3. Allergen Matrix & Skin Rash Tracker',
      category: 'HEALTH',
      icon: '🛡️',
      summary: 'Identifying infant food sensitivities is a vital process that should be calm and methodical. Under our solid foods portal, you will find an Allergen Matrix covering major common foods such as soy, peanuts, dairy, wheat, and eggs. We explain how to employ a cautious three-day exposure protocol, introducing tiny amounts of new local ingredients during daylight hours when you can easily observe your child’s response. If your baby develops skin flushing, loose stools, or fussiness, you can immediately record these observations in your on-device diary. This systematic, offline logging system helps you pinpoint specific triggers, allowing you to substitute foods with gentle, nutritious local grains to keep your baby’s digestion and skin comfortable.',
      steps: [
        'Open the Allergen Matrix under the Feeding tab to view common infant allergens.',
        'Introduce new ingredients individually over 3 consecutive days in tiny quantities.',
        'Record any physical symptoms such as rashes, bloating, or fussiness directly in the log.'
      ],
      tips: [
        'Always introduce new allergens in the morning so you can monitor your baby’s reactions throughout the day.',
        'Once an ingredient has been logged for three days without noted reactions, mark it as 3-Day Log Complete.'
      ]
    },
    {
      id: 'immunization-alerts',
      title: '4. Protecting Immunization Calendars',
      category: 'HEALTH',
      icon: '📅',
      summary: 'Keeping track of immunization dates is essential for your baby’s health. Our immunization tracker provides pre-configured checklists aligned with standard childhood health calendars, helping you maintain a permanent record from birth up to twelve months. You can set gentle offline reminders that do not consume mobile data, ensuring you attend health checkups on time. If your baby experiences post-vaccination fussiness or warmth, you can log temperature readings and hydration observations to share with your healthcare provider.',
      steps: [
        'Open the Immunization Scheduler to view pre-loaded vaccination cards and timelines.',
        'Log completion dates and healthcare notes as your baby receives their childhood immunizations.',
        'Set gentle offline reminders for upcoming vaccine appointments to stay organized.'
      ],
      tips: [
        'Save nurse or doctor recommendations in the offline notes area to reference during later visits.',
        'Monitor temperature observations and keep baby cool and hydrated after immunizations.'
      ]
    },
    {
      id: 'village-rbac',
      title: '5. Sibling Logging, Caregiver Shifts & Household Syncing',
      category: 'SECURITY',
      icon: '👥',
      summary: 'Childcare is a collaborative effort. Ama is built to support smooth, secure household coordination across shared family devices. You can manage multiple child profiles (such as twins, siblings, or newborns) and share logs with family helpers or nannies. By navigating to the Village panel in settings, you can generate secure, encrypted sync tokens or QR codes to mirror baby diaries onto another phone. Caregivers and nannies log their start/end shift times and who they handed baby care over to on their Caregiver Dashboard, while Parents and Family can review the complete Caregiver Shift & Handover History under Activity Tracker → Care & Moments and Baby Journal → Daily.',
      steps: [
        'Add multiple child profiles in Settings to log records for siblings or twins separately.',
        'Generate secure, encrypted sync tokens to mirror tracking logs on your partner’s or caregiver’s device.',
        'Review Nanny/Caregiver Shift & Handover History anytime in Activity Tracker (Care & Moments) or Baby Journal (Daily).'
      ],
      tips: [
        'Review active shared connections regularly in the Village panel to manage household access.',
        'Wipe old sync codes easily from settings if a caregiver is no longer assisting your family.'
      ]
    },
    {
      id: 'private-sandbox',
      title: '6. Local-First Browser Storage',
      category: 'SECURITY',
      icon: '🔒',
      summary: 'Ama is designed around a local-first storage model so your baby names, feeding patterns, sleep durations, and care records are saved locally in your browser storage unless you choose to sync with your family village.',
      steps: [
        'Review how your baby logs are stored locally in your browser storage.',
        'Use the data export tool in Settings to download your care history as a structured file.',
        'Tap the clear-data button in Settings to clear stored local and synced records.'
      ],
      tips: [
        'Export your care ledger as a printable summary to share with your healthcare provider during visits.',
        'Manage local privacy preferences anytime in Settings.'
      ]
    },
    {
      id: 'cry-analyzer-guide',
      title: '7. Acoustic Cry Analyzer & Core Safety Principles',
      category: 'HEALTH',
      icon: '🎙️',
      summary: 'Infant cries are a natural biological communication, but figuring out soothing steps during exhausting nights can be challenging. Ama includes an acoustic pattern helper for educational parenting support: Frequency Matching (measuring pitch, rhythm, and intensity) and Comfort Pattern Match (suggesting soothing ideas for hunger, tiredness, burping, or discomfort). This tool is informational only and does not replace professional medical evaluations.',
      steps: [
        'Open the Cry Analyzer and hold your microphone near the baby in a quiet room for 6 seconds.',
        'Review Frequency Matching metrics including pitch (Hz), rhythm tempo, and intensity (dB).',
        'Check the Comfort Pattern Match and cross-reference with your baby’s recent feeding and diaper logs.',
        'Follow the gentle soothing steps suggested for hunger, tiredness, burping, or tummy comfort.'
      ],
      tips: [
        'Frequency Matching: The software measures the pitch, rhythm, and intensity of the sound.',
        'Comfort Pattern Match: It compares audio features with general soothing categories (such as hunger or burping cues).',
        'Important Notice: Educational Support Only: This tool is not a medical device and provides supportive parenting guidance.',
        'Intuition First: Environmental noise may affect acoustic readings; always prioritize parental instincts and consult healthcare providers for illness.'
      ],
      faqs: [
        {
          question: 'Is the Cry Analyzer a substitute for a doctor or pediatrician?',
          answer: 'No. The cry analyzer is not a medical device. It provides supportive acoustic pattern suggestions for everyday soothing routines. If your baby exhibits signs of fever, illness, severe crying, or distress, seek immediate medical care.'
        },
        {
          question: 'How do I get the most accurate cry reading?',
          answer: 'Minimize background noise such as televisions, loud fans, or street traffic, and ensure your microphone is held within 1 to 2 feet of your baby.'
        }
      ]
    }
  ];

  const filteredSections = guideSections.filter(section => {
    const matchesSearch = section.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          section.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || section.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-2 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-wider bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-0">
            <img 
              src="/assets/aistudio/Untitled_design_20261103_062723_0000_e46b1476.png" 
              alt="Ama Baby Logo" 
              className="w-24 h-auto object-contain shrink-0 bg-transparent shadow-none"
            />
            <span className="font-serif font-black text-gray-900 text-base tracking-tight">Ama Baby User Manual</span>
          </div>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10 w-full text-left">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            Maternal Help & Guide Desk
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-900 tracking-tight">Step-by-Step Instructions</h1>
          <p className="text-slate-500 max-w-2xl text-sm sm:text-base leading-relaxed">
            Read comprehensive, highly logical guidelines on setting up profiles, balancing local weaning meals, tracking food sensitivity rashes, and managing immunization schedules fully offline.
          </p>
        </div>

        {/* Search & Categories */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search user guides, local ingredients, vaccine dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all shadow-xs"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {['ALL', 'BASICS', 'FEEDING', 'HEALTH', 'SECURITY'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all border-none ${
                  selectedCategory === cat 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-white text-slate-500 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Comprehensive Guide Sections (Directly Visible for High-Value AdSense Indexing) */}
        <div className="space-y-6">
          {filteredSections.map(section => (
            <article 
              key={section.id} 
              className="bg-white rounded-[2rem] border border-gray-100 shadow-xs p-6 sm:p-8 space-y-6 text-left"
            >
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <span className="text-3xl shrink-0">{section.icon}</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                    {section.category} Guide
                  </span>
                  <h2 className="font-serif font-black text-slate-900 text-lg sm:text-xl">
                    {section.title}
                  </h2>
                </div>
              </div>

              {/* Summary / Detailed Context */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                  Detailed Usage & Context
                </span>
                <p className="bg-slate-50 p-5 rounded-2xl border border-gray-50 text-slate-700 leading-relaxed text-xs sm:text-sm">
                  {section.summary}
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest block">
                  Step-By-Step Workflow
                </span>
                <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm">
                  {section.steps.map((step, idx) => (
                    <li key={idx} className="pl-1 text-slate-700 font-medium">
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
                  Resourceful & Cautious Tips
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-xs sm:text-sm">
                  {section.tips.map((tip, idx) => (
                    <li key={idx} className="pl-1">{tip}</li>
                  ))}
                </ul>
              </div>

              {/* FAQs if present */}
              {section.faqs && section.faqs.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
                    Frequently Asked Questions
                  </span>
                  <div className="space-y-2">
                    {section.faqs.map((f, i) => (
                      <div key={i} className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-1">
                        <p className="font-bold text-slate-900 text-xs">Q: {f.question}</p>
                        <p className="text-slate-600 text-xs leading-relaxed">A: {f.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </main>


      {/* Footer */}
      
      {/* Universal Footer */}
      <UniversalFooter 
        onNavigate={(screen) => {
          if (onNavigateToScreen) {
            onNavigateToScreen(screen);
          } else if (onClose) {
            onClose();
          }
        }} 
        activeScreen="user-guide" 
      />
    </div>
  );
};
