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
    title: 'Privacy Policy & Terms of Service – Ama Baby Care',
    description: 'Read the privacy policy, user agreements, and legal compliance standards of Ama Baby Care app. We prioritize family safety and child data privacy.',
    robots: 'index, follow',
    ogType: 'article',
    ogTitle: 'Privacy Policy & Terms of Service – Ama Baby Care Companion',
    ogDescription: 'COPPA-compliant, GDPR-friendly privacy policies and safety disclaimers for Ama Baby Care App. Built to protect baby tracking logs.',
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
              Transparent, COPPA & GDPR-compliant terms designed to protect family data and child privacy.
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-200 pb-2">
        {[
          { id: 'privacy', label: 'Privacy Policy', icon: Lock },
          { id: 'terms', label: 'Terms of Use', icon: Scale },
          { id: 'disclaimer', label: 'Medical & Care Disclaimer', icon: Shield },
          { id: 'compliance', label: 'COPPA & Data Sovereignty', icon: Globe },
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
              <h2 className="text-xl font-serif font-black text-gray-900 mb-2">1. Privacy Policy & Data Protection</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">Last Updated: October 2026</p>
              <p>
                Ama Care Baby Companion is built upon a strict "Zero Third-Party Tracking" architecture. We respect your family's privacy and treat infant data with the utmost discretion and care.
              </p>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Data We Collect & Store
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                <li><strong>Baby Profile Information:</strong> Baby name, date of birth, age stages, and gender for developmental milestone tailoring.</li>
                <li><strong>Care & Health Logs:</strong> Feeding logs (breastfeeding, bottle, solids), diaper changes, sleep logs, hydration, and teeth growth records.</li>
                <li><strong>Local Storage First:</strong> Records are stored locally on your device in secure browser storage and only synced when explicitly authenticated with Google Cloud Firebase.</li>
              </ul>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Third-Party Analytics & Advertising
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We never sell, rent, or trade your child's data to third-party data brokers. Contextual advertising via Google AdSense adheres strictly to Google's Families Policy and COPPA standards, ensuring non-personalized, family-safe advertisements only.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-black text-gray-900 mb-2">2. Terms of Service & User Agreement</h2>
              <p>
                By using Ama Care Baby Companion, you agree to these Terms. If you are using this service on behalf of a household or childcare organization, you represent that you have parental consent or full authorization.
              </p>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Permitted Use & Role-Based Access</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Ama provides role-based access for Parents (Admin), Family Members, and Nannies/Caregivers. Caregiver profiles are restricted from accessing private parent diary entries and financial/subscription configurations.
              </p>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Subscriptions & Premium Upgrades</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Core daily journaling, feeding logging, calendar scheduling, vaccination trackers, and safety guides are free. Premium AI features (AI Storybook Milestone Biographer, AI 7-Day Solid Meal & Grocery Planner) are billed transparently via Paystack.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'disclaimer' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-black text-gray-900 mb-2">3. Medical & Child Care Disclaimer</h2>
              <p className="text-xs text-gray-600">
                Ama Care is a parenting support companion and record-keeping tool. It does NOT constitute medical advice, diagnosis, or clinical treatment.
              </p>
            </div>

            <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl text-rose-900 space-y-2 text-xs">
              <p className="font-bold">⚠️ Emergency Medical Protocol:</p>
              <p>
                If your baby experiences acute respiratory distress, severe allergic reactions (anaphylaxis, facial swelling, hives), prolonged high fever, or severe lethargy, immediately call emergency medical services or proceed to the nearest emergency hospital department.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-black text-gray-900 mb-2">4. COPPA & GDPR-K Compliance</h2>
              <p>
                Under the Children's Online Privacy Protection Act (COPPA) and General Data Protection Regulation (GDPR), we enforce stringent guardrails around infant records.
              </p>
            </div>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100 text-xs text-gray-600">
              <p><strong>Right to Erasure:</strong> Parents can delete all baby logs and reset local data at any time from the Settings menu.</p>
              <p><strong>Data Portability:</strong> Parents may export their permanent ledger and daily audit history as structured JSON or printable reports.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
