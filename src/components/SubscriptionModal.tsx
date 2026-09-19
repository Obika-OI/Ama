import React, { useState } from 'react';
import { X, Check, ShieldCheck, Crown, Sparkles, CreditCard, Lock, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type SupportedCurrency = 'NGN' | 'USD' | 'GBP';

export interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (priceId: string, currency?: SupportedCurrency) => void;
  userEmail?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubscribe,
  userEmail = ''
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<SupportedCurrency>('NGN');
  const [showTierComparison, setShowTierComparison] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = (id: string) => {
    setLoadingId(id);
    onSubscribe(id, currency);
  };

  return (
    <AnimatePresence>
      <motion.div 
        id="paystack-subscription-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          id="paystack-subscription-modal-card"
          className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
        >
          <div className="relative p-6 sm:p-8">
            {/* Close Button */}
            <button 
              id="paystack-modal-close-btn"
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer border-none"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Header */}
            <div className="text-center mb-8 max-w-2xl mx-auto pt-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-3 shadow-inner">
                <Crown className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight mb-2">
                Upgrade to Ama Premium
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm font-medium leading-relaxed">
                Unlock acoustic cry analysis, AI-optimized infant nutrition plans, and comprehensive health summary PDF reports with fast, secure checkout via Paystack.
              </p>

              {/* Multi-Currency Switcher & Paystack Badge */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex p-1 bg-gray-100 rounded-2xl border border-gray-200 shadow-inner">
                  <button
                    id="currency-toggle-ngn"
                    type="button"
                    onClick={() => setCurrency('NGN')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                      currency === 'NGN'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 bg-transparent'
                    }`}
                  >
                    ₦ NGN (Naira)
                  </button>
                  <button
                    id="currency-toggle-usd"
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                      currency === 'USD'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 bg-transparent'
                    }`}
                  >
                    $ USD (Dollar)
                  </button>
                  <button
                    id="currency-toggle-gbp"
                    type="button"
                    onClick={() => setCurrency('GBP')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                      currency === 'GBP'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 bg-transparent'
                    }`}
                  >
                    £ GBP (Pound)
                  </button>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Secured by Paystack</span>
                </div>
              </div>
            </div>

            {/* Pricing Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {/* 1. Prepaid 3-Month Pass */}
              <div id="plan-card-prepaid" className="bg-gray-50 border border-gray-200/80 rounded-3xl p-6 relative flex flex-col justify-between hover:border-primary/30 transition-colors">
                <div>
                  <div className="mb-4">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-200/70 px-2.5 py-1 rounded-full">
                      Top-Up Pass
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2">3-Month Access</h3>
                    <p className="text-xs text-gray-500 font-medium">One-time prepaid purchase</p>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-gray-900">
                      {currency === 'NGN' ? '₦9,500' : currency === 'USD' ? '$12' : '£10'}
                    </span>
                    <span className="text-gray-500 text-xs font-medium"> / 3 months</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start text-xs font-medium text-gray-700">
                      <Check className="w-4 h-4 text-primary shrink-0 mr-2 mt-0.5" />
                      <span>3 Months of Full AI Access</span>
                    </li>
                    <li className="flex items-start text-xs font-medium text-gray-700">
                      <Check className="w-4 h-4 text-primary shrink-0 mr-2 mt-0.5" />
                      <span>No auto-debit (Pay once)</span>
                    </li>
                    <li className="flex items-start text-xs font-medium text-gray-700">
                      <Check className="w-4 h-4 text-primary shrink-0 mr-2 mt-0.5" />
                      <span>Cards, Bank Transfer & USSD</span>
                    </li>
                  </ul>
                </div>

                <button 
                  id="paystack-buy-prepaid-btn"
                  onClick={() => handleSubscribe('price_prepaid')}
                  disabled={!!loadingId}
                  className="w-full py-3.5 rounded-2xl font-bold bg-white border-2 border-gray-300 text-gray-800 hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-60 text-xs sm:text-sm shadow-xs"
                >
                  {loadingId === 'price_prepaid' ? 'Connecting Paystack...' : 'Pay with Paystack'}
                </button>
              </div>

              {/* 2. Monthly Pro Subscription */}
              <div id="plan-card-monthly" className="bg-white border-2 border-primary shadow-xl rounded-3xl p-6 relative flex flex-col justify-between transform md:-translate-y-2">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Most Popular</span>
                </div>

                <div>
                  <div className="mb-4 mt-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full">
                      Auto-Renew
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2">Monthly Pro</h3>
                    <p className="text-xs text-gray-500 font-medium">Flexible month-to-month care</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-primary">
                      {currency === 'NGN' ? '₦4,500' : currency === 'USD' ? '$5' : '£4'}
                    </span>
                    <span className="text-gray-500 text-xs font-medium"> / month</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start text-xs font-medium text-gray-700">
                      <Check className="w-4 h-4 text-primary shrink-0 mr-2 mt-0.5" />
                      <span>Unlimited Acoustic Cry Analyses</span>
                    </li>
                    <li className="flex items-start text-xs font-medium text-gray-700">
                      <Check className="w-4 h-4 text-primary shrink-0 mr-2 mt-0.5" />
                      <span>7-Day AI Meal & Grocery Planner</span>
                    </li>
                    <li className="flex items-start text-xs font-medium text-gray-700">
                      <Check className="w-4 h-4 text-primary shrink-0 mr-2 mt-0.5" />
                      <span>Health Summary PDF Export with Graphs</span>
                    </li>
                    <li className="flex items-start text-xs font-medium text-gray-700">
                      <Check className="w-4 h-4 text-primary shrink-0 mr-2 mt-0.5" />
                      <span>Multi-Caregiver Village Sync</span>
                    </li>
                  </ul>
                </div>

                <button 
                  id="paystack-subscribe-monthly-btn"
                  onClick={() => handleSubscribe('price_monthly')}
                  disabled={!!loadingId}
                  className="w-full py-3.5 rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-60 text-xs sm:text-sm shadow-md shadow-primary/20 border-none"
                >
                  {loadingId === 'price_monthly' ? 'Connecting Paystack...' : 'Subscribe with Paystack'}
                </button>
              </div>

              {/* 3. Annual Elite (Offer) */}
              <div id="plan-card-annual" className="bg-gray-900 rounded-3xl p-6 relative flex flex-col justify-between text-white border border-gray-800">
                <div className="absolute -top-3 -right-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-md transform rotate-3">
                  Save 45%
                </div>

                <div>
                  <div className="mb-4">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full border border-white/30">
                      Best Value
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">Annual Elite</h3>
                    <p className="text-xs text-gray-400 font-medium">Billed once a year</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-500 line-through">
                        {currency === 'NGN' ? '₦54,000' : currency === 'USD' ? '$60' : '£48'}
                      </span>
                      <span className="text-3xl sm:text-4xl font-black text-white">
                        {currency === 'NGN' ? '₦29,500' : currency === 'USD' ? '$35' : '£28'}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs font-medium">
                      {currency === 'NGN' ? ' / year (₦2,458/mo)' : currency === 'USD' ? ' / year ($2.91/mo)' : ' / year (£2.33/mo)'}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start text-xs font-medium text-gray-200">
                      <Check className="w-4 h-4 text-primary shrink-0 mr-2 mt-0.5" />
                      <span>All Monthly Pro features included</span>
                    </li>
                    <li className="flex items-start text-xs font-medium text-gray-200">
                      <Check className="w-4 h-4 text-primary shrink-0 mr-2 mt-0.5" />
                      <span>Priority AI processing speed</span>
                    </li>
                    <li className="flex items-start text-xs font-medium text-gray-200">
                      <Check className="w-4 h-4 text-primary shrink-0 mr-2 mt-0.5" />
                      <span>Locked-in discounted annual rate</span>
                    </li>
                  </ul>
                </div>

                <button 
                  id="paystack-subscribe-annual-btn"
                  onClick={() => handleSubscribe('price_annual')}
                  disabled={!!loadingId}
                  className="w-full py-3.5 rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-60 text-xs sm:text-sm border-none font-sans"
                >
                  {loadingId === 'price_annual' ? 'Connecting Paystack...' : 'Subscribe Annually'}
                </button>
              </div>
            </div>

            {/* Free vs Premium Breakdown Accordion / Toggle */}
            <div className="mt-8 bg-gray-50 rounded-3xl p-5 border border-gray-200/80">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowTierComparison(!showTierComparison)}>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-gray-800">What is included in Free vs. Premium?</span>
                </div>
                <span className="text-xs text-primary font-bold">
                  {showTierComparison ? 'Hide Details' : 'View Tier Breakdown'}
                </span>
              </div>

              {showTierComparison && (
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs">
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="font-bold text-gray-900">🆓 Freemium Tier (Free Forever)</span>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">1 Device</span>
                    </div>
                    <ul className="space-y-2 text-[11px] text-gray-600">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span><strong>Core Daily Tracking:</strong> Unlimited breast/bottle feeds, naps, diaper logs.</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span><strong>Growth & Milestones:</strong> Standard percentiles & milestone tracking.</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span><strong>Medication & Vaccines:</strong> Complete immunization timeline & alerts.</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span><strong>Recipes:</strong> View curated meal recipes & add custom recipes.</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span><strong>Single User Access:</strong> 1 device local mode.</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span><strong>Client-Side Encryption:</strong> Zero 3rd-party tracking.</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span><strong>Free Trial AI Queries:</strong> 5 trial queries for general parenting questions.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                      <span className="font-bold text-gray-900">👑 Ama Premium Tiers</span>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">Unlimited</span>
                    </div>
                    <ul className="space-y-2 text-[11px] text-gray-700">
                      <li className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span><strong>Acoustic Cry Analyzer:</strong> AI microphone analysis for hunger, colic & pain.</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span><strong>7-Day AI Meal & Grocery Planner:</strong> Stage-specific weekly nutrition plans.</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span><strong>Health Record PDF Export:</strong> Complete summary graphs & log downloads.</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span><strong>Multi-Device & Village Sync:</strong> Live cloud sync for co-parents & nannies.</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span><strong>Unlimited AI Queries:</strong> Voice & text AI parenting assistant.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Paystack Payment Channels & Footer */}
            <div className="mt-8 text-center border-t border-gray-100 pt-6 space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-4 text-gray-500 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Cards (Visa, Mastercard, Verve)
                </span>
                <span>•</span>
                <span>Bank Transfer</span>
                <span>•</span>
                <span>USSD</span>
                <span>•</span>
                <span>Apple Pay & Mobile Money</span>
              </div>
              <p className="text-[11px] text-gray-400 max-w-xl mx-auto">
                Payments are securely processed by Paystack. Subscriptions can be canceled at any time from your account settings without penalty.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
