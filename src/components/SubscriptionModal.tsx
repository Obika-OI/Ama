import React from 'react';
import { X, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type SupportedCurrency = 'NGN' | 'USD' | 'GBP';

export interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (priceId: string, currency?: SupportedCurrency, billingEmail?: string) => Promise<void> | void;
  userEmail?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  isOpen, 
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        id="open-access-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          id="open-access-modal-card"
          className="bg-white rounded-[32px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
        >
          <div className="relative p-6 sm:p-8 text-center space-y-5">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer border-none"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-black text-gray-900 tracking-tight">
                All Features Free &amp; Unlocked
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm font-medium leading-relaxed">
                Subscriptions and paywalls are currently disabled. Every tool in Ama Baby is open and available for your family at no cost.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left space-y-2.5 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Feeding, sleep, diaper, growth, and immunization tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>AI Cry Soothing Helper, Meal Planner, and Ogoo Voice Notes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Family Village sharing, Granny Mode, and printable PDF summaries</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-primary">
              <ShieldCheck className="w-4 h-4" />
              <span>No card or billing required</span>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 transition-all cursor-pointer text-xs sm:text-sm border-none shadow-md shadow-primary/20"
            >
              Continue Using Ama Baby
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
