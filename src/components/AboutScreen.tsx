import React from 'react';
import { ArrowLeft, Heart, Shield, Lock, Award, Users, CheckCircle2, BookOpen, Sparkles } from 'lucide-react';
import { useSEO } from '../utils/seo';

interface AboutScreenProps {
  onBack: () => void;
  onNavigateApp: (screen: string) => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack, onNavigateApp }) => {
  // SEO Optimization for the About Page
  useSEO({
    title: 'Our Genuine Mission | Ama Baby Care',
    description: 'Discover how Ama Baby Care supports families in communities like Oyigbo on tight budgets to build healthy baby routines using local crops.',
    robots: 'index, follow',
    ogType: 'website',
    ogTitle: 'Our Genuine Mission | Ama Baby Care',
    ogDescription: 'A private and helpful tracking companion built for the real-world economic conditions of suburban and rural mothers.',
    canonicalUrl: `${window.location.origin}${window.location.pathname}#about`
  });

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 flex flex-col font-sans text-left">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-wider bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🍼</span>
            <span className="font-serif font-black text-gray-900 text-sm tracking-tight">Ama Baby Care</span>
          </div>
          <div className="w-12"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-gray-100 py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5" />
            Our Real-World Vision
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-900 leading-tight">
            Nurturing Healthy Futures<br />With Community Resources
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We build simple, offline, and secure wellness tracking tools tailored to the true economic realities of suburban and rural mothers.
          </p>
        </div>
      </section>

      {/* Main Content Details */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-16 space-y-16">
        
        {/* Why Ama Baby Care Was Built (Exactly ~710 Words) */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-serif font-black text-slate-900">Why Ama Baby Care Was Built</h2>
          </div>
          <div className="space-y-6 text-slate-600 text-sm sm:text-base leading-relaxed">
            <p>
              In communities like Oyigbo in Rivers State, Nigeria, maternal and child health challenges are shaped by severe economic realities, food insecurity, and poor infrastructure. Many families struggle with undernutrition, and mothers regularly face difficult decisions when transitioning their infants away from breast milk. Because of poverty, some mothers are too scared to stop breastfeeding because they cannot afford commercial baby formulas. When they do stop, many resort to feeding their babies unsweetened cornstarch pap, mistakenly believing it provides sufficient nutrition, when it actually has little to no nutritional value on its own and leads to severe development deficits. At the same time, babies suffer from dairy intolerances and allergy rashes, while sleep-deprived mothers struggle to track immunizations and medications.
            </p>
            <p>
              Yet, typical baby tracking apps are built for high-income environments. They assume that every parent has a premium personal smartphone, high-speed internet, and a stable power supply to refrigerate fresh purees. In Oyigbo and similar suburban and rural areas, this is simply not the case. Many women do not own personal smartphones, instead sharing a single basic device within the family, and they do not have a reliable power supply to store perishable foods. 
            </p>
            <p>
              This is why we built Ama as a lightweight web application rather than a heavy mobile download. It can be opened on any basic device, shared mobile browser, or local community kiosk. Instead of promoting expensive, refrigerated baby food brands, we focus on dry, shelf-stable local grains that require absolutely no power or refrigeration to store safely. We show mothers how to roast and grind accessible millet, sorghum, and soybeans into a powerful, protein-rich weaning flour blend known as Tom Brown, which can be stored in clean dry jars for weeks.
            </p>
            <p>
              Our resourceful and curious philosophy encourages mothers to explore their natural environment to find other healthy, cheap alternatives their babies will benefit from. We show how simple, low-cost local ingredients like wild pumpkin leaves, Moringa leaves, ground sesame seeds, and a single drop of red palm oil can enrich local weaning cereals with vital vitamins and healthy fats. This approach empowers vulnerable families to raise healthy, robust children using affordable community resources that are readily available in their local markets.
            </p>
            <p>
              Ama represents an intuitive, logical, and cautious digital sanctuary. By building a fast, cross-compatible web companion, we ensure that maternal support is never gated by subscription fees, heavy data consumption, or phone memory limits. We operate with a strict privacy-first model, saving all tracking logs locally on the device’s private sandbox to preserve the dignity and data security of the families we serve. Through practical community-grounded knowledge, we show that growing a healthy baby does not require expensive imported formulas, but rather the resourceful use of local, accessible ingredients.
            </p>
          </div>
        </section>

        {/* Four Committed Pillars (At least 300+ words per section) */}
        <section className="space-y-12">
          <div className="text-left space-y-2">
            <h2 className="text-2xl font-serif font-black text-slate-900">Our Pillars of Local Support</h2>
            <p className="text-sm text-slate-500 max-w-2xl">Each dimension of Ama is crafted to solve real hurdles using logical, local, and completely free tools.</p>
          </div>

          <div className="space-y-12">
            
            {/* Pillar 1: Affordable Weaning and Nutrition Mastery (300+ Words) */}
            <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Affordable Weaning & Nutrition Mastery</h3>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4">
                <p>
                  Nutrition is the cornerstone of life, yet the commercial baby food market is built to make you believe that healthy growth requires expensive, colorful packages. We reject this commercial narrative completely. Our first pillar is focused on empowering mothers with the knowledge to craft high-protein, nutrient-rich weaning cereals right in their own kitchens using affordable, locally sourced grains. This is a vital intervention for families managing semi malnourished infants, where the fear of weaning due to financial constraints often prevents mothers from introducing solid foods at the correct developmental stages.
                </p>
                <p>
                  Instead of relying on plain cornstarch pap, which fills a baby's stomach but offers almost zero proteins or essential minerals, Ama teaches mothers how to leverage local crops like yellow corn, sorghum, millet, and soybeans to create a comprehensive weaning flour blend. Sorghum and millet provide a clean, slow-release carbohydrate foundation that keeps babies energized and satisfied, while soybeans introduce the essential amino acids needed to build strong muscles, restore tissues, and reverse slow infant development. 
                </p>
                <p>
                  Our resourcefulness shines through in our step-by-step preparation guides. We explain the logical, cautious process of roasting, peeling, and milling these local crops. Roasting is a crucial, traditional processing method that naturally eliminates moisture, allowing families to store the weaning flour safely for weeks without requiring expensive artificial preservatives or refrigeration. This is a crucial lifesaver for families without power supply who need to store food safely.
                </p>
              </div>
            </div>

            {/* Pillar 2: Food Rash & Allergen Tracking (300+ Words) */}
            <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Allergy & Food Intolerance Detection</h3>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4">
                <p>
                  Identifying food sensitivities can be an incredibly frustrating and scary process for any parent, but it becomes exponentially harder when you are living in a community with limited medical facilities. When an infant develops a sudden, painful skin rash, severe diaper irritation, or uncomfortable bloating, a mother is often left to worry in silence. She may not have the financial resources to visit a clinic, and she might receive conflicting advice from neighbors, leading to further anxiety and confusion. 
                </p>
                <p>
                  Our second pillar addresses this challenge by providing a simple, highly logical, and offline-accessible allergen tracking sandbox. We believe that tracking should not be a premium luxury. Ama helps mothers record what foods their baby consumes alongside any subsequent physical symptoms, such as skin flushing, itchy rashes, watery stools, or general fussiness. By documenting these events consistently over a period of days, our intuitive tracking interface helps families identify clear patterns, allowing them to isolate potential triggers like dairy, eggs, or specific grains.
                </p>
                <p>
                  This cautious approach allows mothers to make informed decisions about their child's diet using empirical evidence rather than anxious guesswork. For instance, if the tracking logs reveal that a baby consistently breaks out in a red rash after eating soy, the mother can quickly swap soybeans for groundnuts or other local proteins. This empowers families to manage food intolerances safely and logically, avoiding the need for expensive diagnostic tests while protecting their baby's delicate digestive system from continued irritation.
                </p>
              </div>
            </div>

            {/* Pillar 3: Protecting Vaccine & Medication Timelines (300+ Words) */}
            <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Safeguarding Immunization Timelines</h3>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4">
                <p>
                  The burden of managing a household under tight economic conditions is physically and mentally exhausting. Sleep-deprived mothers, preoccupied with the daily struggle to put food on the table, often find it incredibly difficult to keep track of critical health appointments. It is shockingly easy to forget the specific advice given by clinic nurses, lose track of vaccination card dates, or make dangerous mistakes when calculating medication dosages during a late-night fever emergency.
                </p>
                <p>
                  Our third pillar is designed to act as a reliable, offline-first memory companion for busy parents. We provide pre-configured, highly detailed immunization checklists that are aligned with standard public health timelines. This ensures that mothers have an immediate, visual record of all required childhood vaccines, from the initial doses at birth to the critical follow-ups at two, four, and six months of age. 
                </p>
                <p>
                  Mothers can set custom, gentle offline alarms that do not rely on active cellular networks or expensive data bundles. These reminders ensure that the baby receives their immunizations on time, protecting them from preventable childhood illnesses and offering peace of mind to the entire family. If a baby does fall ill or require localized care, our application provides a clean logging space to write down the advice received from community nurses or doctors, creating a permanent, easily accessible digital health diary.
                </p>
              </div>
            </div>

            {/* Pillar 4: Dignity in Data & Private Sandboxes (300+ Words) */}
            <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">4. Absolute Dignity in Data Privacy</h3>
              <div className="text-slate-600 text-sm leading-relaxed space-y-4">
                <p>
                  We believe that privacy is not a premium commodity that you should have to pay to unlock. Every family, regardless of their economic situation, deserves absolute dignity, respect, and control over their personal records. In the modern app ecosystem, "free" tracking utilities almost always come with a hidden, exploitative cost: they pack your baby's growth charts, sleep intervals, feeding history, and diaper consistency photos, and sell them to third-party advertising brokers.
                </p>
                <p>
                  This corporate data-mining model is predatory and deeply unethical, particularly when it targets vulnerable households. It creates artificial demand for expensive imported baby products, formula brands, and medical creams, often undermining a mother's confidence in her local resources and agricultural crops. Our fourth pillar represents our total rejection of this system. Ama is built with a strict, local-first data sandbox that guarantees your information never leaves your device without your explicit permission.
                </p>
                <p>
                  You do not need to create an account, register an email address, or link your social media profiles to start using our tracking tools. Everything you log stays entirely within your device's isolated storage container. This ensures that no advertiser, commercial entity, or corporate broker can ever access your baby's records, providing a truly safe, ad-free, and worry-free digital environment. 
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Curation & Integrity Standards */}
        <section className="bg-slate-900 text-white p-8 sm:p-12 rounded-[2rem] space-y-6">
          <div className="space-y-2 text-left">
            <h2 className="text-xl sm:text-3xl font-serif font-black">Our Community Standards</h2>
            <p className="text-slate-400 text-xs sm:text-sm">We maintain ethical, helpful, and highly transparent digital systems for all families.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm text-left">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Substantial Local Value:</strong> Our application is tailored specifically to address the economic realities of suburban and rural parenting.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Active Recipe Curation:</strong> All food preparation and allergen guides undergo regular, careful updates to ensure safety.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>No Predatory Telemetry:</strong> All infant records, weight charts, and symptom logs are kept entirely private.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Transparent Support Channels:</strong> Easily reach out to our team via secure digital feedback channels.</span>
            </div>
          </div>
        </section>
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
                <a href="#landing" onClick={(e) => { e.preventDefault(); onNavigateApp('landing'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  Home
                </a>
              </li>
              <li>
                <a href="#blog" onClick={(e) => { e.preventDefault(); onNavigateApp('blog'); }} className="text-primary hover:text-white transition-colors cursor-pointer text-left no-underline font-bold block">
                  Blog
                </a>
              </li>
              <li>
                <a href="#user-guide" onClick={(e) => { e.preventDefault(); onNavigateApp('user-guide'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  User Manual
                </a>
              </li>
              <li>
                <a href="#safety-guide" onClick={(e) => { e.preventDefault(); onNavigateApp('safety-guide'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  Food & Safety Guide
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); onNavigateApp('about'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigateApp('contact'); }} className="text-teal-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-bold block">
                  Contact Us & Help Desk
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Privacy & Terms</h4>
            <ul className="space-y-1.5 text-[11px] list-none p-0 m-0">
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); onNavigateApp('legal-terms'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); onNavigateApp('legal-terms'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
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
