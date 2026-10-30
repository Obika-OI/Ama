import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  AlertCircle, 
  Heart, 
  Moon, 
  Thermometer, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Phone,
  Droplet,
  Flame,
  Wind
} from 'lucide-react';
import { useSEO } from '../utils/seo';

interface SafetyGuideScreenProps {
  onBack: () => void;
}

export const SafetyGuideScreen: React.FC<SafetyGuideScreenProps> = ({ onBack }) => {
  useSEO({
    title: 'Infant Safety Guide & Emergency First Aid | Ama Baby Care',
    description: 'Critical safety guidelines for infant choking, fever management, safe sleep (SIDS prevention), and household hazards for new parents.',
    canonicalUrl: 'https://amababycare.com/#safety-guide'
  });

  const safetySections = [
    {
      id: 'choking',
      title: 'Choking & Airway Safety',
      icon: <Wind className="w-6 h-6 text-rose-600" />,
      color: 'bg-rose-50',
      border: 'border-rose-100',
      content: `Infant choking is a leading cause of accidental injury. Understanding the difference between gagging (a normal part of weaning) and true choking is essential. 
      \n• **Gagging:** Baby makes noise, coughs, and turns red. Stay calm and let them work the food out. 
      \n• **Choking:** Baby is silent, turns blue/pale, and cannot breathe. This is an emergency. 
      \n• **Prevention:** Always cut small, round foods (like grapes or cherry tomatoes) lengthwise. Avoid whole nuts, popcorn, or hard candies until age 4. Always supervise baby during meals.`,
      action: 'Learn the Heimlich Maneuver for Infants'
    },
    {
      id: 'fever',
      title: 'Fever & Temperature Control',
      icon: <Thermometer className="w-6 h-6 text-amber-600" />,
      color: 'bg-amber-50',
      border: 'border-amber-100',
      content: `A fever is usually a sign that the body is fighting an infection. For infants under 3 months, any fever over 38°C (100.4°F) requires immediate medical attention. 
      \n• **Management:** Keep baby hydrated with breast milk or formula. Use lightweight clothing. 
      \n• **Medication:** Never give Aspirin to infants. Use Paracetamol or Ibuprofen (if over 6 months) only as directed by a healthcare provider. 
      \n• **Red Flags:** Seizures (Febrile convulsions), lethargy, or a rash that doesn't disappear when pressed.`,
      action: 'Check Dosage Guide'
    },
    {
      id: 'sleep',
      title: 'Safe Sleep & SIDS Prevention',
      icon: <Moon className="w-6 h-6 text-indigo-600" />,
      color: 'bg-indigo-50',
      border: 'border-indigo-100',
      content: `Sudden Infant Death Syndrome (SIDS) risk can be significantly reduced by following safe sleep protocols. 
      \n• **Back to Sleep:** Always place baby on their back to sleep, for every sleep. 
      \n• **Clear Crib:** Use a firm, flat sleep surface. Keep the crib free of blankets, pillows, bumpers, or soft toys. 
      \n• **Room Sharing:** It is recommended to share a room (but not a bed) with your baby for at least the first 6 months. 
      \n• **Temperature:** Avoid overheating baby. A sleep sack is safer than a loose blanket.`,
      action: 'View Safe Sleep Checklist'
    },
    {
      id: 'household',
      title: 'Household & Environment Safety',
      icon: <ShieldAlert className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50',
      border: 'border-emerald-100',
      content: `As baby starts to crawl, your home environment needs a safety audit. 
      \n• **Small Parts:** Any object that fits through a toilet paper roll is a choking hazard. 
      \n• **Chemicals:** Keep detergents, medicines, and cleaning supplies in high, locked cabinets. 
      \n• **Water Safety:** Never leave an infant alone in a bath, even for a second. An infant can drown in as little as 2 inches of water. 
      \n• **Burns:** Keep hot drinks away from edges of tables. Check bath water temperature with your elbow.`,
      action: 'Home Safety Checklist'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-wider bg-transparent border-none cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h1 className="font-serif font-black text-gray-900 text-lg sm:text-xl tracking-tight">Infant Safety Hub</h1>
          </div>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-left">
        <section className="bg-rose-600 text-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-rose-900/10 relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Emergency Awareness</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black">Safety First, Always.</h2>
            <p className="text-sm opacity-90 leading-relaxed max-w-xl">
              This guide provides critical safety information to help you protect your child. While this app supports your parenting journey, always trust your intuition and seek immediate professional medical help in an emergency.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a href="tel:911" className="bg-white text-rose-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 no-underline shadow-sm hover:scale-105 transition-transform">
                <Phone className="w-3.5 h-3.5" /> Call Emergency (911)
              </a>
              <button className="bg-rose-500 text-white border border-rose-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-400 transition-colors">
                Find Nearest Hospital
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
        </section>

        <div className="grid grid-cols-1 gap-6">
          {safetySections.map((section) => (
            <motion.section 
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 sm:p-8 rounded-[2rem] border ${section.border} ${section.color} space-y-4`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  {section.icon}
                </div>
                <h3 className="text-xl font-serif font-black text-slate-900">{section.title}</h3>
              </div>
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">
                  {section.content}
                </p>
                <button className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-800 hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                  {section.action}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.section>
          ))}
        </div>

        <section className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-black text-slate-900">Legal Medical Disclaimer</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            The information in the Ama Safety Hub is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Always seek the advice of your pediatrician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read in this app.
          </p>
        </section>
      </main>
    </div>
  );
};
