import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  AlertCircle, 
  Moon, 
  Thermometer, 
  ChevronLeft, 
  Info, 
  Phone, 
  Wind, 
  CheckCircle2, 
  Utensils, 
  ArrowRight,
  MapPin,
  Heart,
  Baby,
  Home as HomeIcon,
  Check
} from 'lucide-react';
import { useSEO } from '../utils/seo';
import { UniversalFooter } from './UniversalFooter';
import { getEmergencyInfoForLocation, EmergencyInfo } from '../utils/emergency';

interface SafetyGuideScreenProps {
  onBack: () => void;
  onNavigateApp: (screen: string) => void;
  onConnectMealSafety?: () => void;
}

export const SafetyGuideScreen: React.FC<SafetyGuideScreenProps> = ({ 
  onBack, 
  onNavigateApp,
  onConnectMealSafety 
}) => {
  useSEO({
    title: 'Infant Safety Hub & Emergency Guide | Ama Baby Care',
    description: 'Practical first aid guidelines for infant airway choking, Heimlich maneuver, fever observations, safe sleep, and household babyproofing.',
    canonicalUrl: 'https://amababycare.com/#safety-guide'
  });

  // Location-aware emergency data
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo>(() => getEmergencyInfoForLocation());

  useEffect(() => {
    setEmergencyInfo(getEmergencyInfoForLocation());
  }, []);

  // Safe sleep checklist state (inline interactive checkboxes directly on the page)
  const [sleepChecks, setSleepChecks] = useState<Record<string, boolean>>({
    back: true,
    alone: true,
    firm: true,
    bare: true,
    room: true,
    temp: true
  });

  // Home safety checklist state (inline interactive checkboxes directly on the page)
  const [homeChecks, setHomeChecks] = useState<Record<string, boolean>>({
    chokingTube: true,
    cordsAnchored: true,
    potHandles: true,
    waterSupervised: true,
    medsLocked: true,
    outletCovers: true
  });

  const toggleSleepCheck = (key: string) => {
    setSleepChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleHomeCheck = (key: string) => {
    setHomeChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGoToMealSafety = () => {
    if (onConnectMealSafety) {
      onConnectMealSafety();
    } else {
      onNavigateApp('safety-guide-meal');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-left">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 sm:px-8">
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
            <h1 className="font-serif font-black text-gray-900 text-lg sm:text-xl tracking-tight">
              Infant Safety Hub
            </h1>
          </div>
          <div className="w-12"></div>
        </div>
      </header>

      {/* Main Content: Everything placed directly on the page with NO modal redirects */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10 w-full text-left">
        
        {/* Emergency Alert Banner with Real-Time Location Awareness */}
        <section className="bg-rose-600 text-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-rose-900/10 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Emergency Assistance</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Location: {emergencyInfo.city}, {emergencyInfo.country}</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-black">
              Safety First, Always.
            </h2>
            <p className="text-sm opacity-95 leading-relaxed max-w-2xl font-medium">
              This hub provides practical first aid steps and home safety precautions. In an urgent medical emergency, call your local emergency service or visit your nearest pediatric emergency center immediately.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a 
                href={`tel:${emergencyInfo.number}`}
                className="bg-white text-rose-700 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 no-underline shadow-md hover:bg-rose-50 transition-colors"
              >
                <Phone className="w-4 h-4 text-rose-600" />
                <span>Call Emergency ({emergencyInfo.number})</span>
              </a>
              <button 
                onClick={() => onNavigateApp('local-directories')}
                className="bg-rose-700 hover:bg-rose-800 text-white border border-rose-400 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <MapPin className="w-4 h-4" />
                <span>Find Pediatric Care in {emergencyInfo.city}</span>
              </button>
            </div>

            {emergencyInfo.notes && (
              <p className="text-[11px] text-rose-100 opacity-90">
                Local dispatch service: {emergencyInfo.notes}
              </p>
            )}
          </div>
          <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        </section>

        {/* Dedicated Connection to Meal Log Safety Guide Tab */}
        <section className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white rounded-[2.5rem] p-6 sm:p-8 shadow-lg shadow-teal-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-teal-200">
              <Utensils className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Connected Meal Safety</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-black">
              Meal Log Food & Allergen Safety Guide
            </h3>
            <p className="text-xs sm:text-sm text-teal-50 leading-relaxed font-medium">
              Browse our complete ingredient index with color-coded safety ratings (Safe, Caution, and Avoid under 12 months), safe preparation advice for high-risk foods, and allergen tracking in your daily feeding log.
            </p>
          </div>
          <button
            onClick={handleGoToMealSafety}
            className="px-6 py-3.5 bg-white text-teal-900 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-teal-50 transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer border-none"
          >
            <span>Open Meal Log Safety Guide</span>
            <ArrowRight className="w-4 h-4 text-teal-800" />
          </button>
        </section>

        {/* SECTION 1: Learn the Heimlich Maneuver for Infants (Displayed Directly on Page) */}
        <section id="heimlich-guide" className="bg-white rounded-[2.5rem] border border-rose-100 p-6 sm:p-10 space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs shrink-0">
                <Wind className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
                  Critical Response (For Babies Under 1 Year)
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-black text-gray-900">
                  Infant Choking & Airway Relief
                </h3>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-100 w-fit">
              Essential Action Guide
            </span>
          </div>

          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 text-sm leading-relaxed font-medium">
            <strong>Check the response first:</strong> If your baby is coughing loudly, crying, or making sounds, their airway is not fully blocked. Stay calm and allow them to cough up the food on their own. Only perform the steps below if your baby is <strong>silent, cannot cry or breathe, or turns blue</strong>.
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                  <h4 className="font-black text-gray-900 text-base">Face-Down Forearm Support</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-11">
                  Sit or kneel for stability. Lay the baby face-down along your forearm, resting your arm on your thigh. Hold the baby's jaw gently between your thumb and fingers to support the head. Avoid putting pressure on the neck or soft tissue under the jaw. Ensure the baby's head is kept lower than their chest to allow gravity to assist in dislodging the object.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                  <h4 className="font-black text-gray-900 text-base">5 Firm Back Blows</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-11">
                  Using the heel of your free hand, deliver up to 5 distinct, firm blows between the baby's shoulder blades. Each blow should be a separate, forceful attempt to create enough vibration and pressure to dislodge the obstruction. Stop if the object is expelled or the baby starts to cry or breathe.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                  <h4 className="font-black text-gray-900 text-base">5 Chest Thrusts</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-11">
                  If the object remains, turn the baby face-up on your other forearm, supporting the back of their head with your hand. Keep the head lower than the chest. Place two fingers in the center of the baby's chest, just below the nipple line. Deliver up to 5 quick downward thrusts, compressing the chest about 1.5 inches. Each thrust is a separate attempt to clear the airway.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">4</span>
                  <h4 className="font-black text-gray-900 text-base">Call & Repeat</h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-11">
                  Repeat the cycle of 5 back blows and 5 chest thrusts until the object is coughed up or the baby begins to breathe or cry. If the baby becomes unresponsive (limp/unconscious), call <strong>{emergencyInfo.number}</strong> immediately and begin infant CPR. Continue rescue efforts until professional help arrives.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100 space-y-4">
            <h4 className="font-black text-rose-900 text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              High-Risk Choking Hazards for Infants
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-rose-800">
              <div className="space-y-2">
                <p className="font-bold">Dangerous Food Textures:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Whole grapes, cherry tomatoes, or large berries (always slice lengthwise)</li>
                  <li>Hard chunks of raw vegetables (carrots, celery)</li>
                  <li>Popcorn, whole nuts, and seeds</li>
                  <li>Sticky globs of nut butter (always thin with water or milk)</li>
                  <li>Chunks of meat, cheese, or hot dogs</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-bold">Non-Food Household Risks:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Small toy parts, beads, and game pieces</li>
                  <li>Coins, buttons, and "button" batteries (extremely toxic)</li>
                  <li>Balloons and fragments of plastic wrap</li>
                  <li>Pen caps and small office supplies</li>
                  <li>Cigarette butts and small floor debris</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Infection Control & Illness Monitoring */}
        <section id="fever-guide" className="bg-white rounded-[2.5rem] border border-amber-100 p-6 sm:p-10 space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs shrink-0">
                <Thermometer className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                  Illness Management & Hygiene
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-black text-gray-900">
                  Infection Control & Fever Care
                </h3>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 w-fit">
              Prevention & Monitoring
            </span>
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xl font-black text-gray-900">Comprehensive Infection Control Protocol</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  An infant's immune system is still developing its library of defenses. Proactive infection control is the most effective way to prevent the spread of respiratory viruses (like RSV, Flu, and Colds) and gastrointestinal bacteria. High-fidelity hygiene standards should be maintained by all caregivers and visitors.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-4 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">🧼</div>
                  <h5 className="font-black text-emerald-900 text-base">Advanced Hand Hygiene</h5>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    Wash hands with soap and warm water for 20+ seconds: before preparing any feed (breast, bottle, or solids), after every diaper change, and immediately after entering the home. If soap isn't available, use a 60%+ alcohol-based sanitizer, but prioritize washing to remove physical contaminants. Encourage siblings to wash hands frequently as they are often primary carriers of school-based germs.
                  </p>
                </div>

                <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-4 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">✨</div>
                  <h5 className="font-black text-emerald-900 text-base">Sterilization & Surface Safety</h5>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    Sterilize all bottle parts, pacifiers, and pump components daily for the first 3 months and regularly thereafter. High-touch surfaces like crib rails, play mats, and changing tables should be wiped down with infant-safe disinfectants daily. Toys that are frequently mouthed should be washed in hot soapy water or a dishwasher if permitted by the manufacturer.
                  </p>
                </div>

                <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-4 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">🧤</div>
                  <h5 className="font-black text-emerald-900 text-base">Social Distancing for Infants</h5>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    During peak illness seasons, limit the baby's exposure to crowded indoor spaces. Request that visitors do not kiss the baby's face or hands, as this is a direct route for virus transmission. Politely ask anyone with even minor symptoms (a 'tickle' in the throat or 'slight' sniffle) to postpone their visit until they are 100% recovered.
                  </p>
                </div>

                <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-4 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">♻️</div>
                  <h5 className="font-black text-emerald-900 text-base">Biohazard Waste Management</h5>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    Treat soiled diapers as biohazard waste. Use a sealed diaper pail and wash your hands immediately after disposal. Never reuse a cloth or sponge that was used to clean a diaper area on surfaces where food is prepared. If using cloth diapers, store them in a wet bag and launder separately from other household linens using a sanitizing cycle.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-rose-50 border border-rose-200 rounded-[2.5rem] space-y-4 shadow-sm">
              <h4 className="font-black text-rose-950 text-lg flex items-center gap-2">
                <AlertCircle className="w-6 h-6" />
                The Newborn Fever Protocol (Birth to 3 Months)
              </h4>
              <p className="text-sm text-rose-900 leading-relaxed font-medium">
                In infants under 90 days old, a rectal temperature of <strong>38.0°C (100.4°F)</strong> or higher is considered a medical priority. Because newborns have limited ability to fight serious infections, a fever may be the only sign of a significant underlying illness. Do not give fever-reducing medication before calling your care provider, as it can hide symptoms that the provider needs to see.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div className="space-y-6">
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-gray-100 space-y-4 shadow-xs">
                  <h4 className="font-black text-gray-900 flex items-center gap-3 text-lg">
                    <span className="text-2xl">🌡️</span>
                    Temperature Observation
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    Consistency is key when tracking an illness. Use a dedicated digital thermometer and choose one method (rectal is most accurate for infants) to get comparable readings. Record the time and the exact temperature each time you check. Avoid 'forehead strips' or 'pacifier thermometers' which can give misleadingly low readings during a high fever.
                  </p>
                </div>

                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-gray-100 space-y-4 shadow-xs">
                  <h4 className="font-black text-gray-900 flex items-center gap-3 text-lg">
                    <span className="text-2xl">💧</span>
                    Supportive Illness Care
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    A feverish baby's body uses up fluids more quickly. Offer the breast or bottle more frequently than usual. If your baby is already eating solids, offer water-rich foods like pureed pear or cucumber if they are over 6 months. Maintain a comfortable room temperature (20-22°C) and avoid 'bundling' the baby in heavy blankets, which can trap heat and worsen the fever.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-gray-100 space-y-4 shadow-xs">
                  <h4 className="font-black text-gray-900 flex items-center gap-3 text-lg">
                    <span className="text-2xl">🚫</span>
                    Dangerous Myths & Practices
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    Never use cold water, ice baths, or rubbing alcohol to cool a baby's skin. These cause the blood vessels to shrink and cause shivering, which actually raises the internal body temperature and can cause metabolic shock. Never give Aspirin to a child under 16, as it is linked to a rare but fatal condition called Reye's Syndrome.
                  </p>
                </div>

                <div className="p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100 space-y-4 shadow-md">
                  <h4 className="font-black text-rose-950 flex items-center gap-3 text-lg">
                    <span className="text-2xl">🚨</span>
                    Critical Warning Signs
                  </h4>
                  <p className="text-[11px] text-rose-900 font-black uppercase tracking-[0.15em]">Seek Immediate Emergency Care If:</p>
                  <ul className="text-xs text-rose-800 list-disc pl-5 space-y-2 font-medium">
                    <li>The baby is difficult to wake or is unusually lethargic/limp</li>
                    <li>Breathing is labored (ribs sucking in, rapid panting, or grunting)</li>
                    <li>Signs of dehydration: No wet diaper in 8+ hours, or dry mouth/no tears</li>
                    <li>A purple or red rash that does not fade when you press on it</li>
                    <li>The baby is inconsolable and cries for hours despite comfort measures</li>
                    <li>Your 'parental instinct' tells you something is deeply wrong</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Safe Sleep Standards */}
        <section id="sleep-checklist" className="bg-white rounded-[2.5rem] border border-indigo-100 p-6 sm:p-10 space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs shrink-0">
                <Moon className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                  Every Sleep Session, Day & Night
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-black text-gray-900">
                  Safe Sleep Standards
                </h3>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100 w-fit">
              SIDS Risk Reduction Guide
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Sleep-related infant distress and accidents are significantly reduced by following consistent evidence-based safe sleep practices. For every nap and every night, ensure your baby's sleep environment meets these safety criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { 
                key: 'back', 
                title: 'Always on Back', 
                desc: 'Place your baby on their back for every sleep period—both naps and nighttime. Healthy babies who sleep on their backs are not at increased risk of choking. Once your baby can roll from back to stomach and stomach to back on their own, you can leave them in the position they choose.' 
              },
              { 
                key: 'alone', 
                title: 'Separate Sleep Space', 
                desc: 'The baby should sleep in their own crib, bassinet, or portable play yard in the same room as the parents for at least the first 6 months. Adult beds, couches, and armchairs are extremely dangerous for infant sleep due to the risk of entrapment or suffocation by bedding or another person.' 
              },
              { 
                key: 'firm', 
                title: 'Flat & Firm Surface', 
                desc: 'Use a firm, flat sleep surface (one that does not indent when the baby is lying on it) covered only by a fitted sheet. Products that incline or lean (like rockers or car seats) are unsafe for routine sleep because the baby’s heavy head can slump forward, blocking their airway.' 
              },
              { 
                key: 'bare', 
                title: 'Completely Bare Crib', 
                desc: 'Keep the sleep area free of soft objects, including pillows, blankets, quilts, comforters, sheepskins, bumper pads, or stuffed toys. These items can accidentally cover a baby\'s nose and mouth, leading to suffocation or overheating. No positioners or weighted products should be used.' 
              },
              { 
                key: 'temp', 
                title: 'Thermal Regulation', 
                desc: 'Dress your baby in no more than one layer more than an adult would wear to be comfortable. A wearable blanket (sleep sack) is preferred over loose blankets. Check for signs of overheating like sweating, damp hair, or a hot chest. Keep the room at a comfortable temperature (18-21°C).' 
              },
              { 
                key: 'smoke', 
                title: 'Smoke-Free Environment', 
                desc: 'Keep your home and car 100% smoke-free. Exposure to secondhand smoke significantly increases the risk of SIDS. Ensure that no one smokes anywhere near the baby, and be aware of third-hand smoke (residue on clothes and skin) which can also be harmful.' 
              }
            ].map(item => (
              <div
                key={item.key}
                onClick={() => toggleSleepCheck(item.key)}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-start gap-4 select-none ${
                  sleepChecks[item.key]
                    ? 'bg-indigo-50/70 border-indigo-200 shadow-sm'
                    : 'bg-white border-gray-200 opacity-60'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 shrink-0 ${
                  sleepChecks[item.key] ? 'bg-indigo-600 text-white shadow-sm' : 'border border-gray-300 bg-white'
                }`}>
                  {sleepChecks[item.key] && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black text-gray-900">{item.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: Household Safety & Childproofing */}
        <section id="home-checklist" className="bg-white rounded-[2.5rem] border border-emerald-100 p-6 sm:p-10 space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
                <HomeIcon className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  Comprehensive Childproofing Audit
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-black text-gray-900">
                  Household Safety Hub
                </h3>
              </div>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100 w-fit">
              Room-by-Room Protection
            </span>
          </div>

          <div className="space-y-4 text-sm text-gray-600 leading-relaxed font-medium">
            <p>
              As your baby reaches new milestones like rolling, sitting up, and crawling, the home environment needs to evolve immediately. Perform a "crawl-level" audit of your home periodically—get down on your hands and knees to spot hazards you might miss from a standing height.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { 
                key: 'chokingTube', 
                title: 'Small Object Prevention', 
                desc: 'If an item can fit through a toilet paper roll, it is a significant choking hazard. Regularly scan floors and low surfaces for coins, beads, pen caps, or small toy parts. Be especially vigilant with "button" batteries which can cause fatal internal burns if swallowed.' 
              },
              { 
                key: 'cordsAnchored', 
                title: 'Furniture & Cord Security', 
                desc: 'Heavy furniture (dressers, bookshelves) and televisions must be anchored to the wall using anti-tip straps. Keep all window blind cords, electrical wires, and baby monitor cables at least 3 feet away from the crib and out of reach to prevent entanglement.' 
              },
              { 
                key: 'potHandles', 
                title: 'Kitchen Hazard Control', 
                desc: 'Always turn pot handles toward the back of the stove. Keep hot liquids, sharp knives, and heavy pans away from counter edges. Never hold a baby while cooking or carrying hot food/drinks. Install stove knob covers and latch cupboards containing cleaning agents.' 
              },
              { 
                key: 'waterSupervised', 
                title: 'Water & Bath Vigilance', 
                desc: 'Infants can drown in as little as 2 inches of water. Never leave a baby unattended in a bath, near buckets of water, toilets, or pools, even for a few seconds. Always keep "touch supervision"—meaning you are within arm\'s reach with a hand on the baby during bath time.' 
              },
              { 
                key: 'medsLocked', 
                title: 'Secure Storage for Toxins', 
                desc: 'Store all medications, vitamins, cleaning products, laundry pods, and pesticides in high cabinets secured with child-safe latches. Never refer to medicine as "candy" to encourage a child to take it; always use accurate terminology and dose according to provider instructions.' 
              },
              { 
                key: 'outletCovers', 
                title: 'Electrical & Fall Safety', 
                desc: 'Cover all unused electrical outlets with safety plugs or sliding covers. Install hardware-mounted safety gates at both the top and bottom of stairs. Ensure window screens are secure and consider window guards for upper floors. Keep furniture away from windows.' 
              }
            ].map(item => (
              <div
                key={item.key}
                onClick={() => toggleHomeCheck(item.key)}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-start gap-4 select-none ${
                  homeChecks[item.key]
                    ? 'bg-emerald-50/70 border-emerald-200 shadow-sm'
                    : 'bg-white border-gray-200 opacity-60'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 shrink-0 ${
                  homeChecks[item.key] ? 'bg-emerald-600 text-white shadow-sm' : 'border border-gray-300 bg-white'
                }`}>
                  {homeChecks[item.key] && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black text-gray-900">{item.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Health Information Notice */}
        <section className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-black text-slate-900">Important Health Information Notice</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            This guide is created for educational parenting reference and daily household care. It does not replace individualized guidance from your pediatrician, general practitioner, or local health authority. If you have concerns about your child's breathing, hydration, or illness, always seek direct evaluation from a licensed healthcare provider.
          </p>
        </section>
      </main>

      {/* Universal Footer */}
      <UniversalFooter onNavigate={onNavigateApp} activeScreen="safety-guide" />
    </div>
  );
};
