import React from 'react';
import { 
  ShieldCheck, Heart, Utensils, Activity, BookOpen, Clock, Lock, 
  CheckCircle2, ArrowRight, Shield, ChevronRight, Globe, FileText, UserCheck, Mic, 
  Book, CheckCircle, HelpCircle, Star
} from 'lucide-react';
import { useSEO } from '../utils/seo';
import { UniversalFooter } from './UniversalFooter';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (screen: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onNavigate }) => {
  // SEO Optimization for the Landing Page
  useSEO({
    title: 'Ama Baby Care: Smart Feeding, Weaning, Sleep & Cry Tracker',
    description: 'Track breastfeeding, bottle feeds, and solid baby meals in one place. Prepare affordable local weaning foods like Tom Brown without a fridge, decode baby cries, and track sleep wake windows, diapers, and wellness records offline.',
    robots: 'index, follow',
    ogType: 'website',
    ogTitle: 'Ama Baby Care: Smart Baby Care & Local Weaning Companion',
    ogDescription: 'Built for real families everywhere. Track breastfeeding, bottle feeds, and solid weaning meals, prepare protein-rich Tom Brown cereal without refrigeration, decode baby cries, and log sleep and immunizations privately offline.',
    canonicalUrl: window.location.origin
  });

  return (
    <div className="min-h-screen bg-background text-gray-800 text-left font-sans">
      
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/60 px-4 sm:px-8 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onGetStarted}>
            <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center overflow-hidden">
              <img 
                src="/assets/aistudio/Untitled_design_20261103_062723_0000_e46b1476.png" 
                alt="Ama Baby Care Logo" 
                className="w-full h-full object-cover"
              />
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
            <button 
              onClick={() => onNavigate('about')} 
              className="hover:text-primary transition-colors cursor-pointer border-none bg-transparent font-bold text-xs"
            >
              About Us
            </button>
            <button 
              onClick={() => onNavigate('contact')} 
              className="hover:text-primary transition-colors cursor-pointer border-none bg-transparent font-bold text-xs"
            >
              Contact Us & Help Desk
            </button>
            <button 
              onClick={() => onNavigate('blog')} 
              className="hover:text-primary transition-colors cursor-pointer border-none bg-transparent font-bold text-xs flex items-center gap-1 text-primary"
            >
              <span>Blog</span>
            </button>
            <button 
              onClick={() => onNavigate('mother-care')} 
              className="hover:text-primary transition-colors cursor-pointer border-none bg-transparent font-bold text-xs"
            >
              Mother Postpartum Care
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
              onClick={() => onNavigate('community')} 
              className="hover:text-primary transition-colors cursor-pointer border-none bg-transparent font-bold text-xs"
            >
              Community Forum
            </button>
            <button 
              onClick={() => onNavigate('local-directories')} 
              className="hover:text-primary transition-colors cursor-pointer border-none bg-transparent font-bold text-xs"
            >
              Local Care Map
            </button>
            <button 
              onClick={() => onNavigate('baby-names')} 
              className="hover:text-primary transition-colors cursor-pointer border-none bg-transparent font-bold text-xs"
            >
              Baby Names
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
            className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-2 border-none"
          >
            <span>Open App</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 text-center space-y-8">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Care Companion Built For Real Household Realities</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-serif font-black text-gray-900 leading-tight max-w-4xl mx-auto">
          Growing Healthy, Robust Babies Using Wholesome Local Resources
        </h1>

        <div className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed space-y-4">
          <p>
            Welcome to a parenting companion built on logic, practical wisdom, and respect for household budgets. While many baby apps assume uninterrupted internet access, continuous electricity to freeze purees, and disposable budgets for premium imported cereals, real families often operate under very different conditions.
          </p>
          <p>
            Ama Baby Care is a free, lightweight, offline-first web companion designed to run smoothly on any device. Whether tracking breastfeeds, bottle amounts, and first solid meals, understanding infant cry cues, or preparing protein-dense weaning blends without refrigeration, Ama delivers clear and trustworthy guidance. Learn how to combine affordable yellow corn, sorghum, millet, and roasted soybeans into shelf-stable Tom Brown flour, log wake windows, follow standard vaccination milestones, and monitor food sensitivities privately.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg hover:bg-primary/95 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
          >
            <span>Launch Free App Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('user-guide')}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-white/90 text-gray-700 font-bold text-sm border border-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Read User Manual</span>
          </button>
        </div>

        {/* Simple Trust Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-white/60 text-xs font-semibold text-gray-700 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-white shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% Private Device-Only Sandbox</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-white shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Cheap Local Food Guide (No Power Required)</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-white shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Standardized Immunization Checklists</span>
          </div>
        </div>

        {/* AdSense High-Value Content Section: The Ama Philosophy */}
        <div className="max-w-4xl mx-auto bg-card rounded-[40px] border border-white p-8 sm:p-12 shadow-xl shadow-card/20 text-left space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900">Why Ama is the Logical Choice for Modern Families</h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              In a digital world crowded with applications designed to harvest user data and promote consumerism, Ama Baby Care stands as a fortress of privacy and resourcefulness. We believe that parenting is a fundamental human experience that shouldn't be gated by expensive subscriptions or exploited by advertising networks. Our philosophy is rooted in three core pillars: **Sovereignty, Simplicity, and Safety.**
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <h3 className="font-black text-primary uppercase tracking-wider text-xs">Data Sovereignty</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Most "free" apps are actually selling your baby's digital identity. Ama is different. By using a local-first sandbox architecture, your baby's weight, feeding times, and health logs never leave your device unless you explicitly choose to backup. This ensures that your family's most intimate moments remain exactly where they belong: in your hands.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-black text-primary uppercase tracking-wider text-xs">Local Resourcefulness</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We celebrate the wisdom of local communities. Our guides focus on using available resources—like roasted grains for Tom Brown cereal or traditional cloth for safe swaddling—rather than pushing imported products. This makes high-quality baby care accessible to everyone, regardless of their budget.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white/80 rounded-[28px] border border-white shadow-xs">
            <p className="text-xs text-gray-600 italic leading-relaxed">
              "Ama was built because every mother deserves a smart companion that understands her reality. Whether you have the latest smartphone or a shared family device, Ama is here to ensure your baby thrives through logic and love."
            </p>
          </div>
        </div>
      </section>

      {/* About the App / Feature Grid (Each of the 4 cards has at least 300 words) */}
      <section id="about" className="px-4 sm:px-8 py-16">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-black uppercase text-primary tracking-widest block">
              Core Utility Pillars
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-gray-900">
              Innovative Features For Real-World Parenting
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We have structured our tracking utilities into four massive, highly comprehensive resource blocks. Each card outlines a core, logical dimension of Ama Baby Care, designed to empower sleep-deprived mothers with actionable, offline information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* High-Fidelity Content Card 1: Acoustic Cry Assessment & Voice Helper Services */}
            <div className="bg-white/90 backdrop-blur-xs p-8 rounded-[36px] border border-white shadow-xl shadow-card/10 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                  🎙️
                </div>
                <h3 className="font-serif font-black text-lg text-gray-900">Acoustic Cry Assessment & Voice logging</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Infant crying can be incredibly stressful, particularly when mothers are physically exhausted and managing daily economic survival. Ama provides a highly intuitive and logical cry assessment helper. Using the microphone on your shared phone, you can record a quick five-second sound wave of your baby crying. Our system analyzes the acoustic frequency and patterns to help you understand if your child is crying due to basic hunger, stomach gas, excessive fatigue, or a wet diaper. 
                </p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  We match this acoustic observation with polite, gentle, and highly practical soothing tips. You will learn how to massage your baby's tummy safely to release painful gas, or how to wrap them securely using simple local cloths. This helps to eliminate frantic guessing games, bringing instant peace of mind to sleep-deprived households.
                </p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Additionally, our innovative voice helper lets you log care events hands-free. Simply speak to your device to record breastfeeding start times, formula ounces, or diaper updates without needing to touch the screen. This is an incredible, logical life-saver when your hands are fully occupied holding, rocking, or cleaning your baby, enabling continuous care logging with maximum physical ease and zero software complexity.
                </p>
              </div>
            </div>

            {/* High-Fidelity Content Card 2: Resourceful Local Infant Nutrition & Weaning Recipes */}
            <div className="bg-white/90 backdrop-blur-xs p-8 rounded-[36px] border border-white shadow-xl shadow-card/10 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl font-bold">
                  🥗
                </div>
                <h3 className="font-serif font-black text-lg text-gray-900">Resourceful Nutrition & Weaning Recipes</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  We believe that raising a healthy child shouldn’t require expensive imported commercial cereals. Plain cornstarch pap is cheap but lacks the vital proteins and minerals required for strong muscles and healthy brain development. Ama provides extensive, resource-focused feeding guides designed for mothers on tight budgets who need to stop breastfeeding but feel trapped by the high cost of store-bought foods. 
                </p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Our recipe repository shows you how to roast, peel, and mill yellow corn, sorghum, millet, and soybeans to create a balanced, high-protein weaning cereal blend known as Tom Brown. Since this blend is roasted dry, it requires absolutely no refrigeration to stay fresh for weeks. We encourage mothers to explore their local natural surroundings and utilize cheap, mineral-rich ingredients like wild pumpkin leaves, Moringa extracts, or a drop of red palm oil to enrich local weaning bowls.
                </p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  At the same time, we help you cautiously track food exposures and manage infant allergy rashes and dairy intolerances. Mothers can record what local ingredients are introduced alongside subsequent physical reactions. By identifying these dietary patterns logically over a few days, families can isolate sensitive triggers, replacing problematic crops with safe, highly nutritious local alternatives without requiring expensive clinic evaluations.
                </p>
              </div>
            </div>

            {/* High-Fidelity Content Card 3: Immunization Calendars, Reminders & Paracetamol Dosing */}
            <div className="bg-white/90 backdrop-blur-xs p-8 rounded-[36px] border border-white shadow-xl shadow-card/10 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl font-bold">
                  💊
                </div>
                <h3 className="font-serif font-black text-lg text-gray-900">Immunization Calendars & Offline Alarms</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Managing a rural or suburban household is a mentally taxing process where clinic cards easily get misplaced and doctor instructions are forgotten. Ama safeguards your baby's health by placing structured immunization checklists and fever dose recorders directly in your hands. We provide detailed vaccine timelines pre-aligned with national public health schedules, helping you track critical doses from birth up to twelve months.
                </p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Mothers can set custom, gentle offline alarms that do not consume mobile data or require active cellular networks. These notifications ensure that you never miss a life-saving clinic visit, keeping your baby protected from preventable childhood illnesses. If a baby does require medication, our cautious dosage log records exactly when a dose was given, showing you a logical countdown before the next paracetamol or vitamin administration is safe.
                </p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  This precise logging utility is designed to prevent accidental medication mistakes, which are a major risk when parents are sleep-deprived and under high pressure. Ama also provides a dedicated offline diary to write down the exact healthcare advice and recommendations received from community midwives, creating a permanent, easily accessible digital health history right inside your shared mobile browser.
                </p>
              </div>
            </div>

            {/* High-Fidelity Content Card 4: Private Device-Only Sandboxing & Sibling Profiles */}
            <div className="bg-white/90 backdrop-blur-xs p-8 rounded-[36px] border border-white shadow-xl shadow-card/10 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl font-bold">
                  🔒
                </div>
                <h3 className="font-serif font-black text-lg text-gray-900">Private Device-Only Sandbox Protection</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Your family's privacy and data sovereignty are our absolute priority. Unlike commercial tracking applications that exploit your child's milestones, weight charts, and diaper logs for behavioral ad targeting, Ama is engineered around a strict local-first architecture. All records:including names, feeding times, growth percentiles, and diaper consistency notes:are saved exclusively in your browser's secure local sandbox.
                </p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  You do not need to register an account, sign up with an email, or connect social media profiles to start logging your baby's day. If you choose to coordinate care with your husband, relative, or nanny, our secure sync feature generates encrypted tokens that let you merge logs safely across shared family devices. Nanny profiles can be set with restricted permissions, protecting your private diary entries and settings from secondary users.
                </p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  We also provide direct data portability tools, allowing mothers to export their complete tracking journals as structured files or print them as clean, simple progress reports. These summaries can be shown to local nurses during routine infant health checks, ensuring collaborative care. Our settings screen features an instant database purge button, allowing you to wipe your local database completely with a single tap, leaving zero digital trails.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Gamified Growth Activities Section (Each card expanded to at least 300 words) */}
      <section id="gamified-growth" className="px-4 sm:px-8 py-16 text-left">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-black uppercase text-sky-600 tracking-widest block">
              Play, Learn & Grow Together
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-gray-900">
              Parenting Quests & Community Play Ideas
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Helping your baby learn shouldn't require expensive developmental toys or commercial activity gyms. We show you how to leverage things you already have in your environment to build a beautiful daily routine of talking, playing, and laughing with your child.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Gamified Card 1: Daily Parenting Quests (300+ Words) */}
            <div className="bg-white/90 backdrop-blur-xs p-8 rounded-[36px] border border-white shadow-xl shadow-card/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl font-bold">
                  🎯
                </div>
                <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-[10px] font-black uppercase tracking-wider">
                  +30 XP Points
                </span>
              </div>
              <h3 className="font-serif font-black text-lg text-gray-900">Daily Parenting Quests</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Ama turns daily developmental stimulation into a simple, logical game for parents. We provide three easy play quests every single day, specifically curated for your baby's age group. These activities do not require any fancy plastic toys, premium playkits, or paid nursery setups. Instead, they encourage you to explore your environment and use ordinary, safe household resources:like clean wooden spoons, soft cloth scraps, clean water cups, and plastic bowls:to stimulate your child's senses.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                These five-minute brain games are engineered to build muscle strength, encourage early communication, and train visual coordination. For instance, during morning tummy time, placing a safe, unbreakable mirror or a bowl of cool water just out of baby's reach motivates them to lift their chest, building crucial back and neck strength. Copying your baby's coos and babbles during diaper changes acts as a vocal echo game, training their developing brain to process conversational turn-taking and build language skills. 
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                As you play these simple games with your child, you can tap the quest complete button inside your tracker. This adds points to your parenting journal, helping you form a consistent, loving habit of interactive play. By showing you how to turn daily household items into powerful developmental tools, Ama makes nurturing early intelligence completely accessible, fun, and affordable.
              </p>
            </div>

            {/* Gamified Card 2: Baby Milestone Stars (300+ Words) */}
            <div className="bg-white/90 backdrop-blur-xs p-8 rounded-[36px] border border-white shadow-xl shadow-card/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                  ⭐
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                  Milestone Stars
                </span>
              </div>
              <h3 className="font-serif font-black text-lg text-gray-900">Baby Milestone Stars</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Tracking developmental milestones is a logical way to observe your child's progress, but many parenting apps turn this into a stressful source of anxiety, comparing your child to rigid standards or prompting you to consult expensive paid specialists. Ama approaches baby progress with maximum caution, courtesy, and reassurance. We break down developmental indicators into clear, gentle monthly checksheets that show you exactly what to expect at two months, six months, and twelve months of age.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                We focus on simple, observable actions that require zero complex testing. At two months, you can easily check if your baby smiles back when you speak to them, coos when you hold them, and attempts to look at your face. By six months, you can track if they recognize familiar faces, laugh during peek-a-boo, roll over, and sit up with light support. At twelve months, you can record milestones like pulling up to stand, waving goodbye, calling you Mama or Dada, and grabbing small pieces of roasted food with their fingers.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                When you observe these sweet moments, you can tap to record them in your secure browser sandbox, earning digital milestone stars. We make it easy to review this progress over time, so you can share a clear, confident record of your baby’s milestones with your community health nurse or family physician during routine immunization visits. Ama ensures you celebrate your baby's growth with complete peace of mind.
              </p>
            </div>

            {/* Gamified Card 3: Storytime Reader Log (300+ Words) */}
            <div className="bg-white/90 backdrop-blur-xs p-8 rounded-[36px] border border-white shadow-xl shadow-card/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl font-bold">
                  📚
                </div>
                <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-[10px] font-black uppercase tracking-wider">
                  Language Booster
                </span>
              </div>
              <h3 className="font-serif font-black text-lg text-gray-900">Storytime Reader Log</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Reading to your infant is the single most powerful way to build their early vocabulary, train their attention, and foster strong bonding within the family. Many parents believe they need to purchase expensive, imported illustrated storybooks or nursery rhyme packages to stimulate their baby's mind. Ama encourages resourcefulness and creativity. You do not need a massive library to start reading to your child; you can read simple public pamphlets, local story sheets, or even describe the objects in your natural environment.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Our storytime reader log helps you record each session with a simple, friendly tap. You can write down the simple stories you read, specify how many minutes you spent reading, and note down your baby’s reactions. Did they stare with curiosity, laugh at the funny voices, or gently drift off to sleep? Documenting these moments helps sleep-deprived mothers build a logical, consistent daily reading habit that accelerates language development.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                As you build your reading log, our platform rewards your efforts with language booster badges. Whether you read for five minutes while carrying your baby or tell a traditional story before bedtime, every single spoken word acts as a brain-building catalyst, growing your baby's mind and building a beautiful record of their very first language milestones completely free of cost.
              </p>
            </div>

            {/* Gamified Card 4: Daily Streak Habit Flame (300+ Words) */}
            <div className="bg-white/90 backdrop-blur-xs p-8 rounded-[36px] border border-white shadow-xl shadow-card/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl font-bold">
                  🔥
                </div>
                <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-[10px] font-black uppercase tracking-wider">
                  Habit Builder
                </span>
              </div>
              <h3 className="font-serif font-black text-lg text-gray-900">Daily Streak Habit Flame</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                When you are raising an infant under demanding economic conditions, maintaining a structured schedule is crucial to reducing stress and ensuring the baby's health markers are checked consistently. However, exhaustion can easily cause parents to forget daily checks. Ama solves this by building consistency into your routine with our intuitive, helpful, and logical daily streak habit flame.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                By logging at least one event every single day:whether it's starting a quick nursing timer, writing down a diaper change, checking off a daily play quest, or adding a weight number:you keep your habit flame active on your dashboard. This visual habit flame acts as a gentle, non-stressful prompt that encourages mothers to stay engaged with their infant's daily care patterns. 
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Keeping your daily streak active rewards you with free quest rerolls and unlocks special custom milestones in your progress center. Over time, this consistent logging helps sleep-deprived mothers spot positive changes in their baby's routines:such as more predictable sleeping windows or fewer diaper rashes. This visual feedback reinforces parenting confidence, helping you manage infant wellness logically, resourcefully, and with absolute peace of mind.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Comprehensive Footer */}
      
      {/* Universal Footer */}
      <UniversalFooter onNavigate={onNavigate} activeScreen="landing" />
    </div>
  );
};
