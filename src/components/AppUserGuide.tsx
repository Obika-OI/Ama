import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  HelpCircle, 
  Sparkles, 
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
  FileText
} from 'lucide-react';

interface AppUserGuideProps {
  onClose?: () => void;
  onNavigateToScreen?: (screen: string) => void;
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

export const AppUserGuide: React.FC<AppUserGuideProps> = ({ onClose, onNavigateToScreen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>('getting-started');

  const guideSections: GuideSection[] = [
    {
      id: 'getting-started',
      title: '1. Getting Started & Baby Profile',
      category: 'BASICS',
      icon: '👶',
      summary: 'Set up your baby profile, verify parent/guardian adult access, and personalize the dashboard.',
      steps: [
        'Complete initial onboarding by providing the baby’s name, birth date / developmental age, and your verified adult date of birth.',
        'Choose your preferred measurement units (ml or oz for fluids, kg or lbs for weight).',
        'Your dashboard provides daily growth quest activities, hydration progress, scheduled meal alarms, and quick action cards.'
      ],
      tips: [
        'Update your baby’s age milestone anytime in Settings or Growth Tracker to automatically adjust feeding recommendations.',
        'Complete daily quests to build your streak and earn milestone celebration points.'
      ],
      faqs: [
        {
          question: 'Why do I need to enter my parent birthdate?',
          answer: 'Parent or legal guardian authorization ensures secure, adult-managed child care workspaces (18+).'
        }
      ]
    },
    {
      id: 'feeding-nutrition',
      title: '2. Feeding & Hydration Tracker',
      category: 'FEEDING',
      icon: '🍼',
      summary: 'Log breastfeeds with dual-side timers, record bottle feeding volumes, track solid meals, and analyze stool with AI.',
      steps: [
        'Tap "Meal Log" on the navigation bar to access fluid intake and solid food logs.',
        'Use the Left/Right Nursing Timer for breastfeeding sessions, or quickly tap the +50ml button to log hydration.',
        'When introducing a new solid food, record acceptance, taste, appetite, and any suspected reactions.',
        'Use the Smart Diaper Analyzer camera tool to photograph stool and automatically evaluate it against the Bristol Stool Scale.'
      ],
      tips: [
        'Set daily fluid goals to ensure baby stays adequately hydrated throughout weather changes.',
        'Flag suspected food reactions immediately to cross-reference them with the Allergen Matrix.'
      ]
    },
    {
      id: 'ai-meal-planner',
      title: '3. AI Weekly Meal Planner & Regional Grocery Generator',
      category: 'AI_TOOLS',
      icon: '🥗',
      summary: 'Generate age-optimized 7-day meal plans addressing nutritional gaps (Iron, Vitamin D, Healthy Fats) and create localized grocery shopping lists with exact currency pricing.',
      steps: [
        'Navigate to Journal -> Weekly Planner or tap the AI Meal Planner button on the Dashboard.',
        'Select your location/region (e.g. Lagos/Port Harcourt Nigeria, London UK, New York US, Paris France, Toronto, etc.) and currency (₦, $, £, €, etc.).',
        'Review the AI-generated 7-day schedule (Breakfast, Lunch, Dinner, Snack) tailored to your baby’s stage (puree, soft solids, finger foods).',
        'Tap "Apply Plan to Weekly Grid" to populate your weekly calendar, and tap "Sync to Grocery Checklist" to create a checkable aisle-by-aisle shopping list.'
      ],
      tips: [
        'The AI specifically reviews your recent logs and allergen cleared items to introduce varied iron-rich and calcium-dense foods safely.',
        'Check off ingredients in the grocery list as you shop to track your localized budget subtotal.'
      ]
    },
    {
      id: 'baby-cry-analyzer',
      title: '4. AI Baby Cry Analyzer & Audio Processor',
      category: 'AI_TOOLS',
      icon: '🎙️',
      summary: 'Listen to baby cries with an active acoustic audio processor, cross-referencing acoustic frequencies with recent sleep/feed logs to predict cause (Hungry, Tired, Pain, Gas).',
      steps: [
        'Tap the "Smart Cry Analyzer" button on the Dashboard or in the Activity section.',
        'Allow microphone permissions and hold your phone near the baby for 4-8 seconds while they cry.',
        'The acoustic engine analyzes pitch, frequency, and pause patterns (Dunstan Baby Language acoustic reflex indicators: "Neh", "Owh", "Eh", "Eairh").',
        'The system cross-references the audio with the time elapsed since the baby’s last feeding, nap, and diaper change.',
        'View the suggested comfort reason, confidence score, and immediate soothing step-by-step guidance.'
      ],
      tips: [
        'If background noise is loud, move closer to the baby or use the test audio cry samples to understand typical sound profiles.',
        'Tap the action shortcut on the result card (e.g. "Start Nursing Timer" or "Play Lullaby") for quick soothing.'
      ]
    },
    {
      id: 'sleep-activity',
      title: '5. Sleep Tracker, Wake Windows & Sound Machine',
      category: 'CARE',
      icon: '🌙',
      summary: 'Calculate optimal nap sweet-spots, monitor wake windows, log sunlight exposure, and play soothing white/brown noise.',
      steps: [
        'Open the Activity Tracker to view the Wake Window Calculator tailored to your baby’s age bracket (e.g., 5-6 months: 2 - 2.5 hours).',
        'Start the outdoor stroller timer to ensure baby receives healthy circadian sunlight exposure for natural melatonin production.',
        'Turn on the built-in AudioContext sound machine with calibrated White Noise, Brown Noise, or Celestial lullabies.'
      ],
      tips: [
        'Log wake-up times accurately so the app can alert you when the optimal nap window approaches before baby becomes overtired.'
      ]
    },
    {
      id: 'allergens-health',
      title: '6. Allergen Matrix, Teething Map & Vaccines',
      category: 'HEALTH',
      icon: '🛡️',
      summary: 'Safely introduce major allergens over 3-day protocols, record tooth emergence, and track immunization milestones.',
      steps: [
        'Under Feeding -> Allergen Matrix, track the introduction of common allergens (Peanuts, Eggs, Dairy, Soy, Tree Nuts, Sesame, Wheat, Shellfish).',
        'Use the 3-day exposure protocol with low doses before marking an allergen as "Cleared".',
        'In the Teething Emergence Map, tap on individual teeth in the upper and lower arch to log emergence dates, drooling, or biting symptoms.',
        'Track vaccination milestones and record post-shot side effects (e.g. mild fever, sleepiness).'
      ],
      tips: [
        'Always introduce new allergens one at a time during morning hours so you can monitor your baby throughout the day.'
      ]
    },
    {
      id: 'the-village-rbac',
      title: '7. The Village & Role-Based Permissions (Nanny Mode)',
      category: 'SECURITY',
      icon: '👥',
      summary: 'Collaborate with family and caregivers while enforcing privacy boundaries. Nannies have full active shift tracking but cannot browse historical archives.',
      steps: [
        'Switch roles in Settings -> Village Role Switcher: Admin (Parent), Family Member, or Nanny / Caregiver.',
        'Admin Role: Full access to all data, account settings, cloud backups, decrypter tools, and user management.',
        'Family Member Role: Full access to care logs, photo memories, diary entries, and reporting.',
        'Nanny Role: Granted full access to today’s active logging, feeding timers, diaper changes, and scheduled items. Access to previous days’ historical logs, family diary stories, and account settings is restricted for family privacy.'
      ],
      tips: [
        'When leaving your baby with a nanny, switch to Nanny mode or share the shift link so they can log feeds and diapers seamlessly without viewing private family history.'
      ]
    },
    {
      id: 'privacy-security',
      title: '8. Privacy, Security & Data Protection',
      category: 'SECURITY',
      icon: '🔒',
      summary: 'Learn about our zero-telemetry local sandboxing, symmetric encryption, immutable audit ledger, and complete data purge capabilities.',
      steps: [
        'All logs are stored locally by default with offline-first support.',
        'Optional cloud sync encrypts your baby’s data payload with symmetric cryptographic obfuscation before saving.',
        'Every sensitive action is logged to the immutable Security Audit Ledger viewable in Settings.',
        'You have the privacy right to download your audit records or permanently delete all cloud and local data.'
      ],
      tips: [
        'Keep "Zero Third-Party Tracking" enabled in Settings for maximum privacy protection.'
      ]
    }
  ];

  const categories = [
    { id: 'ALL', label: 'All Topics', icon: '📚' },
    { id: 'BASICS', label: 'Basics & Setup', icon: '👶' },
    { id: 'AI_TOOLS', label: 'AI Features', icon: '✨' },
    { id: 'FEEDING', label: 'Feeding & Nutrition', icon: '🍼' },
    { id: 'CARE', label: 'Sleep & Care', icon: '🌙' },
    { id: 'HEALTH', label: 'Health & Allergens', icon: '🛡️' },
    { id: 'SECURITY', label: 'Privacy & Roles', icon: '🔒' }
  ];

  const filteredSections = guideSections.filter(sec => {
    const matchesCategory = selectedCategory === 'ALL' || sec.category === selectedCategory;
    const matchesSearch = 
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.steps.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sec.tips.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Search and Category Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides (e.g., cry analysis, meal plan, nanny mode, allergens)..."
            className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200/80 hover:bg-gray-50'
              }`}
            >
              <span>{cat.icon} {cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Guide Cards Accordion */}
      <div className="space-y-3">
        {filteredSections.length > 0 ? (
          filteredSections.map(sec => {
            const isExpanded = expandedSectionId === sec.id;
            return (
              <motion.div
                key={sec.id}
                layout
                className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                  isExpanded ? 'border-primary/40 shadow-md ring-1 ring-primary/10' : 'border-gray-100 shadow-xs hover:border-gray-200'
                }`}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer border-none bg-transparent gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                      {sec.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-black text-gray-800">
                        {sec.title}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium line-clamp-1 mt-0.5">
                        {sec.summary}
                      </p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform shrink-0 ${
                    isExpanded ? 'bg-primary text-white rotate-180' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 sm:px-5 pb-5 pt-1 space-y-4 border-t border-gray-50 text-xs"
                    >
                      <p className="text-gray-600 leading-relaxed">
                        {sec.summary}
                      </p>

                      {/* Step by Step Breakdown */}
                      <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Step-by-Step Instructions
                        </p>
                        <ol className="space-y-1.5 list-decimal pl-4 text-gray-700 leading-relaxed font-medium">
                          {sec.steps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      {/* Pro Tips */}
                      {sec.tips.length > 0 && (
                        <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-100/80 space-y-1.5">
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pro Caregiver Tips</span>
                          </p>
                          <ul className="space-y-1 list-disc pl-4 text-amber-900/90 text-xs">
                            {sec.tips.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* FAQs if present */}
                      {sec.faqs && sec.faqs.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Frequently Asked Questions
                          </p>
                          {sec.faqs.map((faq, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                              <p className="font-bold text-gray-800 text-xs">Q: {faq.question}</p>
                              <p className="text-gray-600 text-xs leading-relaxed">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 text-gray-400 space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto text-gray-300" />
            <p className="text-xs font-bold text-gray-600">No guides matching "{searchQuery}"</p>
            <p className="text-[10px]">Try searching for "cry", "meal", "sleep", "nanny", or "allergens".</p>
          </div>
        )}
      </div>

      {/* Quick Help Footer Card */}
      <div className="bg-primary/5 border border-primary/10 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
            💬
          </div>
          <div>
            <h5 className="font-serif font-black text-gray-800 text-sm">Need Additional Help?</h5>
            <p className="text-xs text-gray-500 font-medium">
              Ama is designed with expert babycare guidance principles for happy, healthy families.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-white px-3 py-1.5 rounded-full border border-primary/20 shrink-0">
          Support v1.0 Active
        </span>
      </div>
    </div>
  );
};
