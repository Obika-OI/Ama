import React from 'react';
import { 
  ShieldCheck, Heart, Utensils, Activity, BookOpen, Clock, Lock, 
  CheckCircle2, ArrowRight, Sparkles, Shield, ChevronRight, Globe, FileText, UserCheck, Mic 
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (screen: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onNavigate
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground text-left font-sans">
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onGetStarted}>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-black">
              🍼
            </div>
            <div>
              <span className="font-serif font-black text-xl text-gray-900 tracking-tight block">
                Ama Baby Care
              </span>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block">
                All-In-One Baby App
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-gray-600">
            <a href="#about" className="hover:text-primary transition-colors">About App</a>
            <a href="#features" className="hover:text-primary transition-colors">What It Does</a>
            <button 
              onClick={() => onNavigate('user-guide')} 
              className="hover:text-primary transition-colors cursor-pointer border-none bg-transparent font-bold text-xs"
            >
              User Manual
            </button>
            <button 
              onClick={() => onNavigate('safety-guide')} 
              className="hover:text-primary transition-colors cursor-pointer border-none bg-transparent font-bold text-xs"
            >
              Food & Safety Guide
            </button>
            <button 
              onClick={() => onNavigate('legal-terms')} 
              className="hover:text-primary transition-colors cursor-pointer border-none bg-transparent font-bold text-xs"
            >
              Privacy & Terms
            </button>
          </nav>

          <button
            onClick={onGetStarted}
            className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Open App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Simple, Warm Hero Section */}
      <section className="px-4 sm:px-8 py-12 sm:py-20 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
          <Heart className="w-4 h-4 text-primary" />
          <span>Made for Every Parent & Caregiver</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-black text-gray-900 leading-tight max-w-4xl mx-auto">
          Everything You Need to Take Care of Your Baby in One Easy App
        </h1>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
          Ama Baby Care helps you track feeding times, understand why your baby is crying, keep record of diapers, check growth progress, remember medicines, and prepare safe solid foods.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-3"
          >
            <span>Start Using Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('user-guide')}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm border border-gray-200 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Read User Manual</span>
          </button>
        </div>

        {/* Simple Trust Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-gray-100 text-xs font-medium text-gray-600 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 bg-slate-50 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% Private & Safe</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-slate-50 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Official Health Standards</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-slate-50 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Works for Twins & Siblings</span>
          </div>
        </div>
      </section>

      {/* About the App Section */}
      <section id="about" className="bg-slate-50 border-y border-gray-100 px-4 sm:px-8 py-16">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <span className="text-xs font-black uppercase text-primary tracking-widest">
              About Ama Baby Care
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-gray-900">
              Simple Baby Care Without the Stress
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Parenting is wonderful, but it can get overwhelming. Instead of using different notebooks or separate apps for milk timers, sleep logs, diaper checks, and food recipes, Ama Baby Care gives you one friendly place to track everything clearly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                🎙️
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Cry Helper</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Listen to your baby's cry to quickly see if they are hungry, tired, gassy, or uncomfortable, with simple tips to soothe them.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                🍼
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Feeding & Milk Timers</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Time breastfeeding on left and right sides, write down bottle milk amounts, and track pumping sessions with easy buttons.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
                🥗
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Baby Food & Meal Ideas</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Discover safe first food recipes for 6, 10, and 12 months old, check choking safety tips, and get easy weekly meal plans.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
                💊
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Medicine & Vaccines</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Set reminders for daily drops or vitamins, set safe gaps between fever medicine doses, and track vaccination schedules.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                📈
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Baby Growth Chart</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Save your baby's weight and height to see their progress on standard health charts so you know they are growing well.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-lg">
                🔒
              </div>
              <h3 className="font-bold text-gray-900 text-sm">100% Private & Safe</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your family notes stay on your phone. Nobody else can see your baby's information, and we never sell your data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="px-4 sm:px-8 py-16 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase text-primary tracking-widest">
            What You Can Do in the App
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-black text-gray-900">
            Useful Tools for Every Stage of Baby Care
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <Mic className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Cry Helper</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Record a 5-second sound of your baby crying to see if they need food, sleep, burping, or a diaper change.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <Clock className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Nursing & Bottle Timers</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Start a timer when feeding on the left or right side, or write down formula amounts in ounces or milliliters.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <Utensils className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">First Foods & Meal Ideas</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Learn how to prepare soft foods safely, track new food allergies, and make simple grocery lists.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Poop & Diaper Tracker</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Log wet and dirty diapers easily to make sure your baby is staying hydrated and digesting food well.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <Activity className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Medicine & Immunization</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Keep reminders for daily drops, set safe time limits for fever syrup, and check off vaccine dates.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Growth & Sleep Logs</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Track weight and height on health curves alongside night sleep hours, nap times, and daily milestones.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <UserCheck className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Multiple Children</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Switch easily between profiles for twins or siblings and share notes with family members or babysitters.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Voice Helper</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Speak into your phone to record a feed or diaper change hands-free when your hands are busy holding baby.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <Lock className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Daily Calendar Journal</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Look back at any day on the calendar to see past feeds, naps, medicines, and special memories.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="px-4 sm:px-8 py-12 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-primary/90 via-primary to-primary/90 text-white rounded-[36px] p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-serif font-black">
            Start Taking Care of Your Baby with Ease
          </h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl mx-auto leading-relaxed">
            Join parents who use Ama Baby Care every day for peaceful feedings, organized schedules, and complete confidence.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 rounded-2xl bg-white text-primary font-black text-xs uppercase tracking-widest shadow-lg hover:bg-gray-50 transition-all cursor-pointer border-none inline-flex items-center gap-2"
          >
            <span>Open App Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs">
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
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={onGetStarted} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left p-0 text-slate-400">
                  Open App
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('user-guide')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left p-0 text-slate-400">
                  User Manual
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('safety-guide')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left p-0 text-slate-400">
                  Food & Safety Guide
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Privacy & Terms</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => onNavigate('legal-terms')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left p-0 text-slate-400">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('legal-terms')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left p-0 text-slate-400">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Health Notice</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Ama Baby Care is a helpful recording app and does not replace doctor or healthcare advice.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 py-6 px-4 sm:px-8 text-center text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Ama Baby Care. All rights reserved. Built for baby care & family privacy.</p>
        </div>
      </footer>
    </div>
  );
};
