import React, { useState } from 'react';
import { Shield, ArrowLeft, Lock, FileText, CheckCircle2, ShieldCheck, Scale, Globe } from 'lucide-react';
import { useSEO } from '../utils/seo';

export const LegalTermsScreen = ({
  onBack,
  onNavigate,
  isPremium = false,
  onOpenSubscriptionModal
}: {
  onBack?: () => void;
  onNavigate?: (screen: string) => void;
  isPremium?: boolean;
  onOpenSubscriptionModal?: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'disclaimer' | 'compliance'>('privacy');

  // Dynamic SEO article metadata mapping for Google AdSense compliance
  useSEO({
    title: 'Privacy Policy & Terms of Service - Ama Baby',
    description: 'Read the privacy policy, user agreements, and legal compliance standards of Ama Baby, an all-in-one baby care app. We prioritize family safety and child data privacy.',
    robots: 'index, follow',
    ogType: 'article',
    ogTitle: 'Privacy Policy & Terms of Service - Ama Baby',
    ogDescription: 'Privacy policies, child privacy practices, and informational disclaimers for Ama Baby app. Built to protect baby tracking logs.',
    publishedTime: '2026-09-19T12:00:00Z',
    author: 'Ama Legal Department'
  });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('settings');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-32 space-y-8 bg-background min-h-screen text-left">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="p-2.5 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 shadow-xs cursor-pointer text-gray-600 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Legal & Privacy Standards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-800">
              Privacy Policy & Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Clear, family-first privacy practices and informational terms designed to protect household records.
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-200 pb-2">
        {[
          { id: 'privacy', label: 'Privacy Policy', icon: Lock },
          { id: 'terms', label: 'Terms of Use', icon: Scale },
          { id: 'disclaimer', label: 'Medical Disclaimer', icon: Shield },
          { id: 'compliance', label: 'Child Privacy & Data Control', icon: Globe },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-card text-gray-600 border border-white hover:bg-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Sections */}
      <div className="bg-card p-6 sm:p-10 rounded-[36px] border border-white shadow-sm space-y-8 max-w-4xl text-gray-700 leading-relaxed text-sm">
        {/* Simple Mother-Friendly Promise Alert Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-2">
          <h4 className="font-serif font-black text-gray-900 text-sm flex items-center gap-2">
            <span>🌟</span> Ama's Safe Promise to All Mothers
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            We promise with all our heart to keep your baby's notes safe and completely secret. No one else can see your baby's name, sleep times, milk feeds, or nappy logs. This screen lists our formal rules, but our main goal is to support you, keep your family's details private, and keep your mind at peace.
          </p>
        </div>

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-black text-gray-900 mb-2">1. Privacy Policy & Local-First Storage</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">Last Updated: October 2026</p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Ama Baby operates under a clear family-first privacy approach. Your baby’s developmental details, feeding logs, diaper notes, and physical growth histories belong to your household. Our software employs a local-first storage model designed to keep your saved records on your own device unless you choose to sync them with your family village.
              </p>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Data We Collect & Secure
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Our application is fully functional without requiring any online account creation or email registration. When you track feeds, diaper outputs, sleeping windows, or baby weight, these records are stored exclusively inside your browser's secure local storage. If you choose to use our optional Google Cloud partner sync feature, your files are encrypted before being uploaded to our authenticated database, protected by robust cloud security rules that prevent unauthorized access. We do not track your physical location, we do not employ behavioral tracking cookies, and we do not use third-party analytics software to monitor your screen interactions.
              </p>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                AdSense Standards & Contextual Ads
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                To keep our services free and sustainable, we may display non-personalized contextual advertisements via Google AdSense, aligned with Google’s Families Policy and child privacy principles. We do not pass infant tracking logs, names, ages, or parental profiles to ad networks. Advertisements are selected based on general context to keep the browsing environment family-friendly.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-black text-gray-900 mb-2">2. Terms of Use & User Agreement</h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                By accessing and utilizing Ama Baby, you enter into a voluntary, polite agreement with our team. This companion is designed as a digital logging space and educational utility to help you organize baby feeding timers, vaccine dates, and local weaning recipes. You agree to use our platform responsibly and in accordance with your local regulations. If you share access to your baby's logs with family members, nannies, or caregivers, you represent that you have parental authority and take full responsibility for authorizing their digital interactions with your device’s database sandbox.
              </p>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Child Caregiver Access Limits</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Our system features a role-based permission framework. When you invite a nanny, relative, or caregiver to coordinate on your baby's routine, you can assign them an appropriate role. This prevents secondary users from editing core birthdates, clearing saved history, or accessing private journal entries and account settings. We advise parents to periodically review who has access to their shared baby profiles so coordination remains aligned with parental wishes.
              </p>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Open Access Parenting Utilities</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                All parenting utilities—including breastfeeding timers, vaccine checksheets, local food preparation guides, AI meal planning, acoustic cry analysis, village cloud sync, and offline diaries—are currently open and completely free to use with zero hidden fees or billing traps.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'disclaimer' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-black text-gray-900 mb-2">3. Educational & Safety Disclaimer</h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Ama Baby is an interactive record-keeping utility and educational guide designed to help parents stay organized. We approach infant care with a helpful and highly logical mindset, but we must emphasize that our app does not provide professional medical advice, wellness assessments, or prescriptive healthcare treatment. The information provided on our landing pages, blog articles, safety guides, and user manuals is curated from public health standards, but it should never replace the direct guidance of a qualified human healthcare professional.
              </p>
            </div>

            <div className="bg-sky-50 border border-sky-100 p-6 rounded-2xl text-sky-900 space-y-3 text-xs">
              <p className="font-bold flex items-center gap-2 text-sky-700">
                <span>⚠️</span> Urgent Infant Safety Protocol
              </p>
              <p className="leading-relaxed">
                If your child exhibits serious physical symptoms (such as rapid or labored breathing, continuous high fever, lethargy, blue lips, severe vomiting, dehydration, or an immediate allergic reaction following food exposure), please do not open this application to log the event. Immediately contact your local community health station, emergency services, or proceed directly to the nearest primary healthcare clinic or hospital. Your baby's immediate safety comes first, and digital trackers should only be consulted once the child is in a stable, professionally managed physical condition.
              </p>
              <p className="leading-relaxed">
                When tracking food exposures or testing for common dairy intolerances, always introduce new foods slowly, in tiny amounts, and during daylight hours so you can carefully observe your baby's reaction. Our logs are designed to help you document and analyze these observations logically, but they are not a substitute for professional allergy evaluations or in-person nursing care.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-black text-gray-900 mb-2">4. Child Privacy & Data Control</h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Our platform is designed with child data protection principles in mind. Because our tracking tools record infant feeding schedules and physical growth markers, we prioritize protecting this sensitive information from unnecessary collection. Accounts and child tracking profiles are intended for adult parents and authorized family caregivers.
              </p>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100 text-xs text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-900 text-sm">Deleting Stored Records</p>
              <p>
                We believe you should control your family's saved records. If you decide that you no longer wish to use Ama Baby, open Settings and tap the clear-data option to remove locally saved logs and request deletion of your synced workspace records.
              </p>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100 text-xs text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-900 text-sm">Data Portability and Exports</p>
              <p>
                In alignment with international data portability standards, Ama provides parents with a direct, simple tool to export their entire tracking history. You can download your baby's complete feeding, sleep, and diaper journals as a clean, structured JSON file or format them into a printable, easy-to-read summary page. This allows you to hand over a physical record of your baby's daily schedules and growth milestones to your community nurse or family physician during in-person checkups, fostering a highly collaborative and informed care experience.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Comprehensive Public Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-left py-12 px-6 sm:px-10 rounded-t-[36px] w-full mt-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-0 text-white font-serif font-black text-base">
              <img 
                src="/assets/aistudio/Untitled_design_20261103_062723_0000_e46b1476.png" 
                alt="Ama Baby Logo" 
                className="w-20 h-auto object-contain shrink-0 bg-transparent shadow-none"
              />
              <span>Ama Baby</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Easy all-in-one baby care tracking, feeding timers, growth charts, and diaper health notes.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Quick Links</h4>
            <ul className="space-y-1.5 text-[11px] list-none p-0 m-0">
              <li>
                <a href="#landing" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  Home
                </a>
              </li>
              <li>
                <a href="#blog" onClick={(e) => { e.preventDefault(); onNavigate('blog'); }} className="text-primary hover:text-white transition-colors cursor-pointer text-left no-underline font-bold block">
                  Blog
                </a>
              </li>
              <li>
                <a href="#user-guide" onClick={(e) => { e.preventDefault(); onNavigate('user-guide'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  User Manual
                </a>
              </li>
              <li>
                <a href="#safety-guide" onClick={(e) => { e.preventDefault(); onNavigate('safety-guide'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  Food & Safety Guide
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="text-teal-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-bold block">
                  Contact Us & Help Desk
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Privacy & Terms</h4>
            <ul className="space-y-1.5 text-[11px] list-none p-0 m-0">
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); onNavigate('legal-terms'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); onNavigate('legal-terms'); }} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left no-underline font-medium block">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Health Notice</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Ama Baby app content is for educational, tracking and record-keeping purposes only and does not replace or substitute professional healthcare advice, diagnosis, or treatment. Always follow regional child health guidelines.
            </p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto border-t border-slate-800 mt-6 pt-6 text-center text-[11px] text-slate-500">
          <p>© 2026 Ama Baby. All rights reserved. All-in-one baby care app built for family privacy.</p>
        </div>
      </footer>

    </div>
  );
};
