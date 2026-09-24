import React from 'react';
import { 
  ShieldCheck, Heart, Utensils, Activity, BookOpen, Clock, Lock, 
  CheckCircle2, ArrowRight, Sparkles, Shield, ChevronRight, Globe, FileText, UserCheck, Mic,
  Book, CheckCircle, HelpCircle, Star, Sparkle
} from 'lucide-react';
import { useSEO } from '../utils/seo';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (screen: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onNavigate
}) => {
  // SEO optimization for Google AdSense compliance and high-value landing page
  useSEO({
    title: 'Ama Baby Care – Smart Weaning, Cry Analysis & Baby Journal',
    description: 'Track feedings, understand baby cries, find child-safe recipes, track vaccine schedules, and keep a clean infant growth journal easily.',
    robots: 'index, follow',
    ogType: 'article',
    ogTitle: 'Ama Baby Care – Complete Baby Growth Tracker & Weaning Companion',
    ogDescription: 'An all-in-one baby app with breastfeeding timers, AI cry helper, growth charts, diaper tracking, and weaning guides designed for parents.',
    publishedTime: '2026-09-19T12:00:00Z',
    author: 'Ama Baby Care Team'
  });
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
              onClick={() => onNavigate('blog')} 
              className="hover:text-primary transition-colors cursor-pointer border-none bg-transparent font-bold text-xs flex items-center gap-1 text-primary"
            >
              <span>Care Guides & Blog</span>
            </button>
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
                No more wondering why your baby is crying. You can record five seconds of your baby's cry, and our friendly tool will listen to the sound. It helps you understand if your little one is hungry, gassy, tired, or has a wet nappy. We also give you easy, gentle tips to soothe them right away. This stops the guesswork so you can keep your baby calm and happy without feeling worried or stressed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                🍼
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Feeding & Milk Timers</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Keep a clear record of every single feed with simple, friendly buttons. You can start a timer to know exactly how long your baby fed on the left side or the right side. If you use a bottle, you can write down the milk or formula in ounces or milliliters. It also lets you write down your pumping times and amounts. The app remembers everything for you so you can easily see when your baby last ate, even when you are very tired.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
                🥗
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Baby Food & Meal Ideas</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Weaning your baby should be exciting, not scary. Find clean, safe food advice for babies at six months, ten months, and twelve months old. Learn exactly how to wash, peel, boil, and prepare foods so they are soft and safe. We help you check for choking dangers and see how to serve finger foods. You can also track new foods to watch out for allergies, make simple grocery lists, and get easy weekly meal plans.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
                💊
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Medicine & Vaccines</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Keeping your baby healthy is easy when you have a helper. Set friendly, automatic reminders for daily vitamin drops or special medicines. If your baby has a fever, you can log their medicine to see exactly when it is safe to give the next dose. This prevents any dangerous mistakes. You also get a complete checklist of all important vaccine dates from two months up to one year old to keep your baby fully protected.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                📈
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Baby Growth Chart</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Watch your baby grow healthy and strong. Write down your baby's weight, height, and head size during clinic visits. The app automatically puts these numbers on a clean, simple growth curve. You can see how your baby is doing compared to normal, healthy guidelines. This helps you know that your child is growing well and gives you peace of mind to share with your family or doctor.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-lg">
                🔒
              </div>
              <h3 className="font-bold text-gray-900 text-sm">100% Private & Safe</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your family's privacy is our top focus. All your baby's names, growth numbers, photos, and notes are saved directly on your own device. We never sell your personal information or share it with anyone else. It is completely safe and secure. You do not even need to create an account to start using the app; your baby's records stay private, secure, and under your control at all times.
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
            <p className="text-xs text-gray-500 leading-relaxed text-left">
              Use the microphone on your phone to record a quick five-second sound of your baby crying. The app listens to the crying waves and helps you see if your baby is hungry, sleepy, gassy, or needs a fresh nappy. You can easily soothe them using our simple, gentle advice.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <Clock className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Nursing & Bottle Timers</h3>
            <p className="text-xs text-gray-500 leading-relaxed text-left">
              Log breastfeeding with a fast left and right breast timer to keep feeds balanced. If you feed with a bottle, write down the formula or breast milk in milliliters or ounces. Keep a clean record of your pumping amounts so you never have to guess when your baby last ate.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <Utensils className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">First Foods & Meal Ideas</h3>
            <p className="text-xs text-gray-500 leading-relaxed text-left">
              Learn how to prepare baby-safe weaning meals from six months up to one year old. We show you how to wash, peel, boil, and mash foods into very soft purees. Discover how to test for food allergies and explore child-safe finger foods to make weaning fun and completely safe.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Poop & Diaper Tracker</h3>
            <p className="text-xs text-gray-500 leading-relaxed text-left">
              Check and write down if your baby had a wet or dirty nappy with just one quick tap on your phone. Keeping track of wet nappies and poop colors helps you know your baby is hydrated, digesting food correctly, and staying healthy. Share these notes easily with your baby's doctor.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <Activity className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Medicine & Immunization</h3>
            <p className="text-xs text-gray-500 leading-relaxed text-left">
              Never forget another dose of daily vitamin drops or special syrup. Set gentle alarms for medicines and see exactly when it is safe to give the next dose. You also get a complete checklist of all important vaccine dates from two months up to one year old to keep your baby protected.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Growth & Sleep Logs</h3>
            <p className="text-xs text-gray-500 leading-relaxed text-left">
              Keep a record of your baby's night sleep hours and daytime nap schedules to help them form healthy sleeping habits. Log their weight and height during clinic checkups to draw a clean growth line on our easy baby progress charts.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <UserCheck className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Multiple Children</h3>
            <p className="text-xs text-gray-500 leading-relaxed text-left">
              Easily add and switch between profiles for twins, siblings, or newborns. You can share all logs, timers, and medicine details with your husband, family helper, or nanny so everyone can care for your babies with the exact same love.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Voice Helper</h3>
            <p className="text-xs text-gray-500 leading-relaxed text-left">
              Speak directly into your phone to write down feeding times or wet nappies without touching the screen. This is a life-saver when your hands are busy holding, rocking, or feeding your baby.
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-gray-200/80 space-y-3">
            <Lock className="w-6 h-6 text-primary" />
            <h3 className="font-serif font-black text-base text-gray-900">Daily Calendar Journal</h3>
            <p className="text-xs text-gray-500 leading-relaxed text-left">
              Tap on any day in the calendar to look back at your baby's history. You can see past feeds, sleep hours, wet nappies, vaccine dates, and sweet baby photos. This creates a beautiful, private record of your child's first year.
            </p>
          </div>
        </div>
      </section>

      {/* Gamified Growth Activities Section */}
      <section id="gamified-growth" className="bg-gradient-to-b from-indigo-50/50 to-white border-y border-gray-100 px-4 sm:px-8 py-16 text-left">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-black uppercase text-indigo-600 tracking-widest block">
              Play, Learn & Grow Together
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-gray-900">
              Parenting Quests & Fun Brain Games
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Helping your baby learn can be a fun game for both of you! Earn points, collect gold stars, and build a beautiful daily habit of playing, talking, and reading with your child. Our simple games help build your baby's brain, muscles, and words.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gamified Card 1: Daily Parenting Quests */}
            <div className="bg-white p-8 rounded-3xl border border-indigo-100/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                  🎯
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                  +30 XP Points
                </span>
              </div>
              <h3 className="font-serif font-black text-lg text-gray-900">Daily Parenting Quests</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Get three simple, fun play ideas every single day. These are easy games you can play in five or ten minutes using things you already have at home.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">✔</span>
                  <span><strong>Tummy Time Mirror:</strong> Put a baby-safe mirror in front of your baby during tummy time to build neck muscles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">✔</span>
                  <span><strong>Vocal Echo Challenge:</strong> Copy your baby's babbles and wait for them to copy you back to build early speech.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">✔</span>
                  <span><strong>Sensory Touch Game:</strong> Let your baby touch safe textures like soft cloth, smooth wood, and cool water.</span>
                </li>
              </ul>
              <div className="pt-2">
                <p className="text-[10px] text-gray-400 italic">Play the game, tap complete, and watch your parenting points grow!</p>
              </div>
            </div>

            {/* Gamified Card 2: Baby Milestone Stars */}
            <div className="bg-white p-8 rounded-3xl border border-emerald-100/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                  ⭐
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                  +15 XP per Star
                </span>
              </div>
              <h3 className="font-serif font-black text-lg text-gray-900">Baby Milestone Stars</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Check off standard, healthy milestones as your baby grows up. We make it easy to know if your baby is on track for their age with no stressful words.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">★</span>
                  <span><strong>2 Months Old:</strong> Baby smiles back when you talk, coos, and lifts their head during tummy time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">★</span>
                  <span><strong>6 Months Old:</strong> Baby laughs, knows familiar faces, rolls over, and sits up with support.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">★</span>
                  <span><strong>12 Months Old:</strong> Baby pulls up to stand, waves goodbye, calls you Mama or Papa, and plays peek-a-boo.</span>
                </li>
              </ul>
              <div className="pt-2">
                <p className="text-[10px] text-gray-400 italic">Earn shiny digital stars and show your completed milestones to your clinic nurse!</p>
              </div>
            </div>

            {/* Gamified Card 3: Reading & Storytime Log */}
            <div className="bg-white p-8 rounded-3xl border border-amber-100/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
                  📚
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                  Language Booster
                </span>
              </div>
              <h3 className="font-serif font-black text-lg text-gray-900">Storytime Reader Log</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Reading to your baby builds their vocabulary and makes them smart. Write down the simple books you read together to see your baby's progress over time.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">📖</span>
                  <span><strong>Track Books:</strong> Easily log book titles and how many minutes you read.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">📖</span>
                  <span><strong>Baby Reactions:</strong> Record if your baby was attentive, laughing, sleepy, or excited.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">📖</span>
                  <span><strong>Point Milestones:</strong> Get special badges for reading 5 books, 10 books, or reading for 7 days in a row.</span>
                </li>
              </ul>
              <div className="pt-2">
                <p className="text-[10px] text-gray-400 italic">Every word you read helps your baby grow a strong, brilliant mind!</p>
              </div>
            </div>

            {/* Gamified Card 4: Daily Streak Habit Flame */}
            <div className="bg-white p-8 rounded-3xl border border-rose-100/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold">
                  🔥
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider">
                  Habit Builder
                </span>
              </div>
              <h3 className="font-serif font-black text-lg text-gray-900">Daily Streak Habit Flame</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Consistency is key for your child's growth and your own confidence. Keep your daily streak active by logging at least one activity, feed, or diaper check every day.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">✦</span>
                  <span><strong>Streak Counter:</strong> See a warm habit flame on your dashboard that keeps track of your active consecutive days.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">✦</span>
                  <span><strong>Quest Rerolls:</strong> Keep your streak going to earn free quest rerolls and unlock special custom badges.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">✦</span>
                  <span><strong>Stress Free Design:</strong> If you miss a day, your streak will pause gently. This app is here to support you, not stress you.</span>
                </li>
              </ul>
              <div className="pt-2">
                <p className="text-[10px] text-gray-400 italic">A small five-minute play session every day builds a lifelong bond of love!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION: High-Value Educational Content for AdSense & Friendly Mother Guidance */}
      <section id="guides" className="bg-slate-50/80 border-t border-b border-gray-100 px-4 sm:px-8 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Section 1: Why Keep a Daily Baby Journal */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider">
              <Book className="w-3.5 h-3.5" />
              <span>Easy Parenting Guidance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 leading-tight">
              Why Keep a Daily Baby Journal?
            </h2>
            <div className="text-gray-600 space-y-4 text-sm sm:text-base leading-relaxed">
              <p>
                A baby’s body is very small, and they cannot talk to tell us what they need. When you write down simple things every day, like what time your baby drank milk, how long they slept, or if they had a wet nappy, it is like letting your baby tell you their story!
              </p>
              <p>
                Writing things down stops you from guessing and worrying, especially when you are very tired at night. It helps you see patterns so you can easily plan your day, know when to prepare food, and keep your baby happy and smiling.
              </p>
            </div>
          </div>

          {/* Section 2: Benefits of Professional Tracking */}
          <div className="space-y-6 pt-6 border-t border-gray-100">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Healthy Growth Benefits</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 leading-tight">
              The Big Benefits of Tracking Your Baby's Routine
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-2">
                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <span>🍼</span> No More Tired Guesswork
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  You will never have to ask yourself, "Did the baby drink milk two hours ago, or was it three hours ago?" The app holds the memory for you so you can rest.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-2">
                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <span>🏥</span> Easy Talks with Your Nurse or Doctor
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  When you go to the clinic for checkups, the nurse will ask how the baby is eating or how many wet nappies they have. Just open the app and show them the logs. Doctors love this!
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-2">
                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <span>🔍</span> Notice Changes Quickly
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Seeing if your baby is drinking less milk or having fewer wet nappies helps you catch issues like dehydration early before your baby feels sick.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-2">
                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <span>🤝</span> Help Everyone Work Together
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  If your husband, sister, mother-in-law, or a helper is watching the baby, they can see exactly when the baby last fed or slept so everyone gives the same loving care.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Getting Started Tips */}
          <div className="space-y-6 pt-6 border-t border-gray-100">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5" />
              <span>Easy Getting Started Tips</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 leading-tight">
              Simple Tips to Help You Start Today
            </h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Start small with just one log</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Do not worry about tracking everything on day one. Just log one milk feed or one wet diaper to see how quick and easy it is!</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Put a shortcut on your phone home screen</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Save this website address to your phone home screen. It will look just like an app that you can tap with one finger while holding your baby.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Use the alarms for vitamins or medicines</h4>
                  <p className="text-xs text-gray-500 mt-0.5">If your baby needs daily vitamins or special drops, set a friendly alarm in the reminders section so you can keep your mind relaxed.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">4</div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Do not worry about perfection</h4>
                  <p className="text-xs text-gray-500 mt-0.5">If you forget to write down a diaper change or a nap, that is completely okay! Just log what you can. Ama is here to help you, not to give you more work.</p>
                </div>
              </div>
            </div>
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
                <button onClick={() => onNavigate('blog')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left p-0 text-slate-400 font-bold text-primary">
                  Care Guides & Blog
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
              Ama Baby app content is for educational, tracking and record-keeping purposes only and does not replace doctor or substitute professional healthcare advice, diagnosis, or treatment.
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
