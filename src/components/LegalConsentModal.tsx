import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, FileText, Lock, CheckCircle2, ChevronRight, X } from 'lucide-react';

interface LegalConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onOpenPrivacyDoc?: () => void;
  onOpenTermsDoc?: () => void;
}

export const LegalConsentModal: React.FC<LegalConsentModalProps> = ({
  isOpen,
  onAccept,
}) => {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [activeDocView, setActiveDocView] = useState<'none' | 'privacy' | 'terms'>('none');

  if (!isOpen && activeDocView === 'none') return null;

  const canProceed = agreedTerms && agreedPrivacy;

  const handleConfirm = () => {
    if (!canProceed) return;
    localStorage.setItem('ama_terms_agreed_v1', new Date().toISOString());
    onAccept();
  };

  return (
    <>
      {/* First-Time User Consent Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/75 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-[36px] sm:rounded-[44px] p-6 sm:p-8 max-w-md w-full border border-gray-100 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto text-left"
          >
            {/* Header Icon & Title */}
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 text-2xl">
                🛡️
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-800">
                  Welcome to Ama
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Your private baby weaning & care journal
                </p>
              </div>
            </div>

            {/* Reassuring Trust Highlights */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong className="text-gray-800 font-bold">100% Private & Ad-Free:</strong> Your baby's meal logs, photos, and milestones are private to your family circle.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong className="text-gray-800 font-bold">Offline & Cloud Sync:</strong> Works offline on your device with optional encrypted multi-device sync.
                </p>
              </div>
            </div>

            {/* Quick Links to Terms & Privacy */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setActiveDocView('terms')}
                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200/60 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-xs font-bold text-gray-800">Terms of Use</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => setActiveDocView('privacy')}
                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200/60 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-xs font-bold text-gray-800">Privacy Policy</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
              </button>
            </div>

            {/* Interactive Consent Checkboxes */}
            <div className="space-y-3 pt-1 border-t border-gray-100">
              <label
                onClick={() => setAgreedTerms(!agreedTerms)}
                className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50/80 hover:bg-gray-100/80 cursor-pointer transition-colors select-none"
              >
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={() => {}}
                  className="w-4 h-4 rounded mt-0.5 text-primary accent-primary cursor-pointer"
                />
                <span className="text-xs text-gray-700 leading-snug">
                  I agree to the{' '}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDocView('terms');
                    }}
                    className="text-primary font-bold underline cursor-pointer"
                  >
                    Terms of Use
                  </span>
                  .
                </span>
              </label>

              <label
                onClick={() => setAgreedPrivacy(!agreedPrivacy)}
                className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50/80 hover:bg-gray-100/80 cursor-pointer transition-colors select-none"
              >
                <input
                  type="checkbox"
                  checked={agreedPrivacy}
                  onChange={() => {}}
                  className="w-4 h-4 rounded mt-0.5 text-primary accent-primary cursor-pointer"
                />
                <span className="text-xs text-gray-700 leading-snug">
                  I agree to the{' '}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDocView('privacy');
                    }}
                    className="text-primary font-bold underline cursor-pointer"
                  >
                    Privacy Policy
                  </span>
                  .
                </span>
              </label>
            </div>

            {/* Continue Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!canProceed}
                onClick={handleConfirm}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg cursor-pointer border-none flex items-center justify-center gap-2 ${
                  canProceed
                    ? 'bg-primary text-white shadow-primary/25 hover:bg-primary/95 hover:scale-[1.01] active:scale-[0.99]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Agree & Get Started</span>
              </button>
              {!canProceed && (
                <p className="text-[10px] text-gray-400 text-center mt-2 font-medium">
                  Please check both boxes to continue.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Full Document Viewer Modal */}
      <AnimatePresence>
        {activeDocView !== 'none' && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] sm:rounded-[44px] p-6 sm:p-8 max-w-2xl w-full border border-gray-100 shadow-2xl space-y-6 relative max-h-[85vh] flex flex-col text-left"
            >
              <div className="flex justify-between items-start shrink-0 pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                    Legal Documentation • Version 1.0
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-black text-gray-800 mt-0.5">
                    {activeDocView === 'privacy' ? 'Ama Privacy Policy' : 'Ama Terms of Use'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDocView('none')}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer border-none transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto pr-2 space-y-5 text-gray-700 text-xs leading-relaxed">
                {activeDocView === 'privacy' ? (
                  <>
                    <section className="space-y-2">
                      <h4 className="font-bold text-gray-900 text-sm">1. Commitment to Privacy</h4>
                      <p>
                        Ama Baby Care ("Ama", "we", "us") is dedicated to protecting the sensitive personal information of infants and caregivers. We operate under strict data minimization principles.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-gray-900 text-sm">2. Zero Third-Party Advertising & Tracking</h4>
                      <p>
                        We do not sell, rent, license, or monetize your baby's data. There are zero third-party advertising SDKs, behavioural trackers, or data broker integrations embedded within the application.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-gray-900 text-sm">3. Data Collection & Local Storage</h4>
                      <p>
                        The application stores information solely to facilitate child care tracking:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600">
                        <li><strong>Child Profile:</strong> Baby name, developmental age, milestones, and tooth emergence.</li>
                        <li><strong>Feeding & Nutrition:</strong> Solid foods introduced, breastfeeding/bottle logs, hydration, and allergen reaction history.</li>
                        <li><strong>Care Logs:</strong> Diaper observations, sleep intervals, and medication schedules.</li>
                        <li><strong>Acoustic Cry Analysis:</strong> Recorded cry audio samples are processed strictly for real-time routine care guidance and are not retained.</li>
                      </ul>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-gray-900 text-sm">4. Data Ownership & Deletion</h4>
                      <p>
                        You retain 100% ownership of all records. You may export your audit log at any time and may trigger a permanent purge of all data via Settings.
                      </p>
                    </section>
                  </>
                ) : (
                  <>
                    <section className="space-y-2">
                      <h4 className="font-bold text-gray-900 text-sm">1. Acceptance of Terms</h4>
                      <p>
                        By creating an account, accessing, or using the Ama Baby Care application, you agree to be bound by these Terms of Use.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-gray-900 text-sm">2. Adult Guardian Eligibility</h4>
                      <p>
                        Child tracking profiles must be operated by an adult parent, guardian, or authorized caregiver.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-gray-900 text-sm">3. Medical Disclaimer</h4>
                      <p>
                        Ama Baby Care, including its AI meal planning and cry acoustic predictor, is designed solely for informational and routine child-care tracking purposes. <strong>Ama is not a medical device and does not provide clinical diagnosis or treatment.</strong> Always consult a qualified doctor regarding any health questions or distress.
                      </p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-bold text-gray-900 text-sm">4. Role-Based Access Control</h4>
                      <p>
                        Workspace owners (Admin) may invite Family Members and Nannies. When Nanny/Caregiver mode is active, privacy restrictions are enforced to safeguard family archives.
                      </p>
                    </section>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveDocView('none')}
                  className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-primary/95 transition-colors cursor-pointer border-none"
                >
                  Close Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
