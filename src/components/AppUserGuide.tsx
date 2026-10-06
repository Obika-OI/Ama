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
  FileText,
  ArrowLeft
} from 'lucide-react';
import { useSEO } from '../utils/seo';

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
    title: 'User Manual & Safety Guide | Ama Baby Care',
    description: 'Learn how to use Ama Baby Care tracking tools, prepare cheap local weaning cereals, and manage infant food allergies offline.',
    robots: 'index, follow',
    ogType: 'article',
    ogTitle: 'User Manual & Safety Guide | Ama Baby Care',
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
      summary: 'Setting up your baby profile is the very first logical step on your parenting tracking journey. This section is designed to help you configure your dashboard with absolute ease and clarity, requiring no complex technical knowledge. To start, you will complete our friendly onboarding process by providing your baby’s name and date of birth, which helps the system customize developmental milestones and schedules. We also ask for your verified adult date of birth to ensure that the workspace is managed securely by an adult parent or guardian. You can easily choose your preferred measurement systems, such as ml or oz for fluids, and kg or lbs for weight. Your active dashboard acts as a central hub, presenting your daily growth quests, medication alerts, and quick tracking buttons in one beautiful, high-fidelity layout. By keeping your profile data isolated on your own device, Ama ensures that starting your baby care journal is completely safe, private, and under your control from day one.',
      steps: [
        'Complete initial onboarding by providing the baby’s name, birth date, and your verified adult date of birth.',
        'Choose your preferred measurement units in settings (ml or oz for fluids, kg or lbs for weight).',
        'Review your dashboard to see daily growth quests, scheduled meal alarms, and quick action logs.'
      ],
      tips: [
        'Update your baby’s age milestone anytime in Settings or Growth Tracker to automatically adjust feeding recommendations.',
        'Complete daily quests to build your streak and earn milestone celebration points.'
      ],
      faqs: [
        {
          question: 'Why do I need to enter my parent birthdate?',
          answer: 'Parent or legal guardian authorization ensures secure, adult-managed child care workspaces.'
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
      summary: 'Identifying infant food sensitivities is a crucial process, but it can be highly stressful and expensive. Our third guide section details how to navigate food sensitivities logically and cautiously without requiring premium diagnostic consultations. Under our solid foods portal, you will find a pre-configured Allergen Matrix covering major infant irritants such as soy, peanuts, dairy, wheat, and eggs. We explain how to employ a cautious three-day exposure protocol, introducing tiny amounts of new local ingredients during daylight hours when you can easily observe your child’s physical reaction. If your baby develops an allergic skin rash, watery stools, or general fussiness, you can immediately record these symptoms in your on-device diary. This systematic, offline logging system helps you pinpoint specific triggers, allowing you to substitute irritating crops with highly nutritious local grains, ensuring your baby’s digestive system and skin stay healthy, calm, and completely protected.',
      steps: [
        'Open the Allergen Matrix under the Feeding tab to view common infant allergens.',
        'Introduce new ingredients individually over 3 consecutive days in tiny quantities.',
        'Record any physical symptoms such as rashes, bloating, or fussiness directly in the log.'
      ],
      tips: [
        'Always introduce new allergens in the morning so you can monitor your baby’s reactions throughout the day.',
        'Once an ingredient is successfully cleared for three days with no symptoms, mark it as Cleared.'
      ]
    },
    {
      id: 'immunization-alerts',
      title: '4. Protecting Immunization Calendars',
      category: 'HEALTH',
      icon: '📅',
      summary: 'Keeping track of immunization dates can get incredibly difficult when you are managing a busy, economically constrained household, but missing vaccine appointments places your baby’s health at risk. Our immunization tracker provides pre-configured checklists that are aligned directly with standardized childhood vaccine calendars. This helps sleep-deprived parents maintain a permanent, easy-to-read record of all crucial health milestones from birth up to twelve months of age. You can set custom, gentle offline reminders that do not consume your mobile data plan or require cellular networks. These notifications ensure you always attend clinic appointments on time, protecting your baby from preventable childhood illnesses. If a baby does experience a post-clinic fever, you can log paracetamol doses in our cautious medicine tracker, which displays a logical countdown before the next dose is safe to administer, preventing accidental double-dosing.',
      steps: [
        'Open the Immunization Scheduler to view pre-loaded vaccination cards and timelines.',
        'Log completion dates and clinic notes as your baby receives their childhood immunizations.',
        'Set gentle offline reminders for upcoming vaccine appointments to stay organized.'
      ],
      tips: [
        'Save clinic nurse recommendations in the offline notes area to reference during later checkups.',
        'Use the medicine countdown timer to track fever remedies cautiously and safely.'
      ]
    },
    {
      id: 'village-rbac',
      title: '5. Sibling Logging & Household Syncing',
      category: 'SECURITY',
      icon: '👥',
      summary: 'Childcare is a collaborative effort, which is why Ama is built to support smooth, secure household coordination across shared family devices. Our fifth guide section details how to manage multiple child profiles (such as twins, siblings, or newborns) and share logs with family helpers or nannies. By navigating to the Village panel in settings, you can generate secure, encrypted sync codes to mirror baby diaries onto another phone. To protect family privacy, our platform employs restricted profiles for secondary users like temporary nannies or caregivers. While in caregiver mode, the user can log active feeding timers, wet diapers, and sleep schedules, but is blocked from browsing your private journal notes, historical logs, or account settings. This cautious, highly logical framework ensures that everyone coordinates with the exact same level of care, while protecting sensitive family histories and maintaining complete data security at all times.',
      steps: [
        'Add multiple child profiles in Settings to log records for siblings or twins separately.',
        'Generate secure, encrypted sync tokens to mirror tracking logs on your partner’s device.',
        'Configure caregiver mode to grant temporary logging access while protecting historical diaries.'
      ],
      tips: [
        'Review active shared connections regularly in the Village panel to manage household access.',
        'Wipe old sync codes easily from settings if a caregiver is no longer assisting your family.'
      ]
    },
    {
      id: 'private-sandbox',
      title: '6. Private Device-Only Database Sandbox',
      category: 'SECURITY',
      icon: '🔒',
      summary: 'Data dignity is a fundamental right, and Ama is designed to guard your family records with absolute security. Unlike typical free parenting applications that track your locations, log your screen clicks, and sell your baby’s growth curves to advertising networks, Ama uses a strict, zero-telemetry local-first sandbox model. This means that all baby names, feeding patterns, sleep durations, and medical records are saved exclusively within your browser’s private database. You do not need to create an online account or register an email address to start tracking, ensuring complete anonymity. We do not transmit logs to remote servers unless you explicitly activate our secure partner backup. You have the sovereign right to download your complete care logs as a structured JSON file, and you can instantly erase your entire database from our settings with a single, cautious button click, leaving zero digital footprints behind.',
      steps: [
        'Verify that your baby logs are stored securely in your local browser sandbox.',
        'Use the data export tool in Settings to download your complete tracking ledger as a structured file.',
        'Tap the database purge button in settings to permanently wipe all local and cloud records.'
      ],
      tips: [
        'Export your care ledger as a printable summary to hand over to community nurses during clinic visits.',
        'Keep the Zero-Tracking option enabled in Settings for maximum privacy protection.'
      ]
    },
    {
      id: 'cry-analyzer-guide',
      title: '7. Acoustic Cry Analyzer & Core Safety Principles',
      category: 'HEALTH',
      icon: '🎙️',
      summary: 'Infant cries are a biological language, but deciphering what your baby needs during exhausting nights can be challenging. Ama incorporates smart acoustic frequency analysis to support parents. The system processes sound waves using two core principles: Frequency Matching (measuring the pitch, rhythm, and intensity of the sound) and Need Prediction (comparing the audio data against large databases of infant sounds to suggest if the baby is hungry, sleepy, or uncomfortable). To maintain parental peace of mind and safety, it includes essential medical disclaimers: this tool is Not a Medical Device and offers general parenting support rather than precise diagnoses, and Variable Accuracy means background noise can interfere with readings, so parental intuition remains essential.',
      steps: [
        'Open the Cry Analyzer and hold your microphone near the baby in a quiet room for 6 seconds.',
        'Review Frequency Matching metrics including pitch (Hz), rhythm tempo, and intensity (dB).',
        'Check the Need Prediction match and cross-reference with your baby’s recent feeding and diaper logs.',
        'Follow the gentle soothing steps suggested for hunger, tiredness, burping, or tummy comfort.'
      ],
      tips: [
        'Frequency Matching: The software measures the pitch, rhythm, and intensity of the sound.',
        'Need Prediction: It compares the audio data against large databases of infant sounds to suggest if the baby is hungry, sleepy, or uncomfortable.',
        'Warning: Not a Medical Device — These tools offer general parenting support rather than precise medical diagnoses.',
        'Warning: Variable Accuracy — Background noise can interfere with readings, and parental intuition remains essential.'
      ],
      faqs: [
        {
          question: 'Is the Cry Analyzer a substitute for a doctor or pediatrician?',
          answer: 'No. The cry analyzer is not a medical device. It provides supportive acoustic pattern suggestions for everyday parenting routines. If your baby exhibits signs of fever, illness, severe colic, or distress, seek immediate medical care.'
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
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-wider bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🍼</span>
            <span className="font-serif font-black text-gray-900 text-sm tracking-tight">Ama User Manual</span>
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

        {/* Guide Sections Accordion */}
        <div className="space-y-4">
          {filteredSections.map(section => {
            const isExpanded = expandedSectionId === section.id;
            return (
              <div 
                key={section.id} 
                className="bg-white rounded-[2rem] border border-gray-100 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedSectionId(isExpanded ? null : section.id)}
                  className="w-full px-6 sm:px-8 py-5 flex items-center justify-between text-left bg-transparent border-none cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0">{section.icon}</span>
                    <span className="font-serif font-black text-slate-900 text-sm sm:text-base">{section.title}</span>
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />}
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-50"
                    >
                      <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        
                        {/* Summary / 300+ Word Segment */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Detailed Usage & Context</span>
                          <p className="bg-slate-50 p-5 rounded-2xl border border-gray-50 text-slate-700 italic">
                            {section.summary}
                          </p>
                        </div>

                        {/* Steps */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest block">Step-By-Step Workflow</span>
                          <ol className="list-decimal list-inside space-y-2">
                            {section.steps.map((step, idx) => (
                              <li key={idx} className="pl-1">
                                <span className="font-medium text-slate-700">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Tips */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Resourceful & Cautious Tips</span>
                          <ul className="list-disc list-inside space-y-1.5 text-slate-500">
                            {section.tips.map((tip, idx) => (
                              <li key={idx} className="pl-1">{tip}</li>
                            ))}
                          </ul>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </main>


      {/* Footer */}
      
      {/* Comprehensive Public Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-left py-12 px-6 sm:px-10 rounded-t-[36px] w-full mt-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-serif font-black text-base">
              <span>🍼</span>
              <span>Ama Baby Care</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Easy baby care tracking, feeding timers, growth charts, and diaper health notes.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Quick Links</h4>
            <ul className="space-y-1.5 text-[11px] list-none p-0 m-0">
              <li>
                <a href="#landing" onClick={(e) => { e.preventDefault(); onNavigateToScreen('landing'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  Home
                </a>
              </li>
              <li>
                <a href="#blog" onClick={(e) => { e.preventDefault(); onNavigateToScreen('blog'); }} className="text-primary hover:text-white transition-colors cursor-pointer text-left no-underline font-bold block">
                  Blog
                </a>
              </li>
              <li>
                <a href="#user-guide" onClick={(e) => { e.preventDefault(); onNavigateToScreen('user-guide'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  User Manual
                </a>
              </li>
              <li>
                <a href="#safety-guide" onClick={(e) => { e.preventDefault(); onNavigateToScreen('safety-guide'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  Food & Safety Guide
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); onNavigateToScreen('about'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigateToScreen('contact'); }} className="text-teal-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-bold block">
                  Contact Us & Help Desk
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Privacy & Terms</h4>
            <ul className="space-y-1.5 text-[11px] list-none p-0 m-0">
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); onNavigateToScreen('legal-terms'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); onNavigateToScreen('legal-terms'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Health Notice</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Ama Baby app content is for educational, tracking and record-keeping purposes only and does not replace doctor or substitute professional healthcare advice, diagnosis, or treatment. Always follow regional child health guidelines.
            </p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto border-t border-slate-800 mt-6 pt-6 text-center text-[11px] text-slate-500">
          <p>© 2026 Ama Baby Care. All rights reserved. Built for baby care & family privacy.</p>
        </div>
      </footer>


    </div>
  );
};
