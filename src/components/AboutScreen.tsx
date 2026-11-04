import React from 'react';
import { ArrowLeft, Heart, Shield, Lock, Award, Users, CheckCircle2, Sparkles, Sprout, ShieldCheck } from 'lucide-react';
import { useSEO } from '../utils/seo';
import { UniversalFooter } from './UniversalFooter';

interface AboutScreenProps {
  onBack: () => void;
  onNavigateApp: (screen: string) => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onBack, onNavigateApp }) => {
  useSEO({
    title: 'About Ama Baby Care | Everyday Parenting & Nutrition Platform',
    description: 'Learn about Ama Baby Care: an offline-first companion helping parents everywhere raise thriving babies using accessible local nutrition, gentle sleep rhythms, and private family journals.',
    robots: 'index, follow',
    ogType: 'website',
    ogTitle: 'About Ama Baby Care | Built for Real Families Everywhere',
    ogDescription: 'Lightweight, offline-capable baby tracking with zero invasive ads, practical weaning guidance, and private family village sync.',
    canonicalUrl: `${window.location.origin}${window.location.pathname}#about`
  });

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 flex flex-col font-sans text-left">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-wider bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <img 
              src="/assets/aistudio/Untitled_design_20261103_062723_0000_e46b1476.png" 
              alt="Ama Baby Care Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="font-serif font-black text-gray-900 text-sm tracking-tight">Ama Baby Care</span>
          </div>
          <div className="w-12"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-gray-100 py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-black uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5" />
            Our Core Mission
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-900 leading-tight">
            Empowering Every Family with Practical, Private Baby Care
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            We build simple, offline-first digital tools that honor local cultures, dietary wisdom, and household budgets.
          </p>
        </div>
      </section>

      {/* Main Content Details */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-12">
        {/* Why Ama Baby Care Was Built */}
        <section className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-gray-100 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Foundational Story</span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900">
                Why We Built Ama Baby Care
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            <p>
              Parenting is one of the most rewarding journeys in life, but modern digital tools often overlook the daily realities of real families. Most baby tracking apps are built with assumptions that every parent has high-speed fiber internet, an expensive flagship phone, and unlimited funds for store-bought imported baby formulas or pre-packaged purees. In many suburban, urban, and rural communities across Africa and worldwide, families manage tight budgets, face frequent power cuts that make refrigerating wet baby foods impractical, and share household phones.
            </p>
            <p>
              When babies transition from breast milk to solid foods around six months, parents frequently face anxiety. Commercial baby food cereals can be prohibitively expensive, yet plain refined starches like white corn pap lack the proteins, iron, and minerals needed for robust physical and cognitive growth. At the same time, parents must navigate sudden food reactions, sleep deprivation, immunization dates, and fever worries with limited access to immediate guidance.
            </p>
            <p>
              Ama Baby Care was created to bridge this gap. We designed a fast, lightweight, and offline-ready web application that loads smoothly on any smartphone or browser. Instead of promoting expensive canned purees, Ama highlights the power of dry, shelf-stable whole grains. We teach parents how to prepare balanced, nutrient-dense weaning flours like Tom Brown using accessible yellow corn, sorghum, millet, and roasted soybeans that safely store in airtight glass jars for weeks without refrigeration.
            </p>
            <p>
              We believe in meeting families where they are: respecting cultural heritage, promoting affordable wholesome nutrition, protecting family privacy, and supporting mothers through maternal recovery and mental well-being.
            </p>
          </div>
        </section>

        {/* Four Committed Pillars */}
        <section className="space-y-6">
          <div className="space-y-1 text-left px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">Core Architectural Pillars</span>
            <h2 className="text-2xl font-serif font-black text-slate-900">Our Pillars of Everyday Support</h2>
            <p className="text-sm text-slate-500">How our platform delivers practical, dignified value to families every single day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pillar 1 */}
            <div className="p-7 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Sprout className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">1. Accessible Weaning & Traditional Nutrition</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Healthy infant growth does not require costly imported boxes. Ama provides clear, step-by-step guides on roasting and combining regional grains like sorghum, millet, and soybeans to create protein-rich weaning flour blends. Roasting halts moisture and natural enzymes, allowing dry storage in clean glass jars for weeks without electricity.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100 text-[11px] font-bold text-teal-800">
                Nutrient-dense • Shelf-stable • Low cost
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-7 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">2. Allergen Observation & Food Tracking</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  When introducing new solid foods, parents need clarity rather than guesswork. Ama includes a 3-day food introduction matrix that lets you log each single ingredient alongside digestive observations and skin changes. Isolating triggers like eggs, soy, or dairy becomes straightforward and calm.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100 text-[11px] font-bold text-sky-800">
                Symptom logging • 3-day rule • Calm tracking
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-7 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">3. Routine Immunizations & Health Milestones</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Keeping up with essential infant immunizations should never depend on mobile reception. Ama provides pre-configured public health vaccination checklists and gentle offline reminders, helping parents stay on schedule with health checkups, vitamin schedules, and developmental milestones.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100 text-[11px] font-bold text-sky-800">
                Offline reminders • Milestone timelines • Clean records
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-7 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">4. Absolute Dignity in Data Privacy</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  We believe personal baby journals must never be monetized. Free commercial tracking apps routinely sell infant milestones, weight trends, and feeding histories to advertising brokers. Ama operates with an isolated local-first sandbox: your records stay on your device and are never sold or shared with third-party marketers.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100 text-[11px] font-bold text-sky-800">
                Local-first • Zero ad telemetry • Private journal
              </div>
            </div>
          </div>
        </section>

        {/* Community & Safety Commitment */}
        <section className="bg-slate-900 text-white p-8 sm:p-10 rounded-[2.5rem] space-y-5">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Integrity Standards
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-black">Our Commitment to Families</h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              We build responsible, community-driven software designed to uplift parents everywhere.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-left pt-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Culturally Attuned:</strong> Nutrition suggestions reflect local staple foods, seasonal crops, and regional preparation practices.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Safety-First Principles:</strong> Clear safety guidance for high-risk choking foods, infant botulism warnings, and safe sleep habits.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Maternal Wellness:</strong> Dedicated postpartum tools including the Edinburgh Postnatal Depression Scale and restorative self-care.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Village Collaboration:</strong> Secure caregiver invite links and QR syncing so partners and grandmas stay coordinated effortlessly.</span>
            </div>
          </div>
        </section>
      </main>

      {/* Universal Footer */}
      <UniversalFooter onNavigate={onNavigateApp} activeScreen="about" />
    </div>
  );
};
