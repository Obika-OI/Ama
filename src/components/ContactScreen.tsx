import React, { useState } from 'react';
import { ArrowLeft, Mail, MessageSquare, CheckCircle, HelpCircle, ChevronDown, ChevronUp, Shield, HelpCircle as HelpIcon, CheckCircle2, Clock } from 'lucide-react';
import { useSEO } from '../utils/seo';
import { UniversalFooter } from './UniversalFooter';

interface ContactScreenProps {
  onBack: () => void;
  onNavigateApp: (screen: string) => void;
}

export const ContactScreen: React.FC<ContactScreenProps> = ({ onBack, onNavigateApp }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'support',
    message: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useSEO({
    title: 'Contact Us & Help Desk | Ama Baby Care',
    description: 'Get in touch with the Ama Baby Care team through our secure digital support desk. Browse our offline parenting FAQs, recipe feedback, and help portal.',
    robots: 'index, follow',
    ogType: 'website',
    ogTitle: 'Contact Us & Help Desk | Ama Baby Care',
    ogDescription: 'Have a question about tracking local recipes, managing allergies, or using our secure offline sandbox? Send our support team a message.',
    canonicalUrl: `${window.location.origin}${window.location.pathname}#contact`
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Please provide your name.';
    if (!formData.email.trim()) {
      newErrors.email = 'Please provide an email address so we can reply.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Please write a message.';
    } else if (formData.message.trim().length < 15) {
      newErrors.message = 'Please provide at least 15 characters so we can understand your inquiry.';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Please confirm that you agree to our data privacy guidelines.';
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: 'support',
        message: '',
        agreeToTerms: false
      });
    }, 1200);
  };

  const faqs = [
    {
      q: 'How does Ama support mothers and families on tight budgets?',
      a: 'We recognize that commercial baby food cereals and imported formulas can be very expensive. Ama offers clear, practical instructions on roasting and grinding affordable regional grains like yellow corn, sorghum, millet, and roasted soybeans into a high-protein weaning flour (Tom Brown). These dry grains can be stored in clean glass jars for weeks without refrigeration, and enriched with accessible local additions like ground sesame or crayfish.'
    },
    {
      q: 'Does this application sell my baby’s growth charts or health logs to advertisers?',
      a: 'Never. Ama uses a strict local-first privacy sandbox. Your baby’s weight records, sleep logs, feeding timestamps, and diaper observations are stored securely in your browser storage. We do not sell or broker user records with third-party advertising companies.'
    },
    {
      q: 'How can I safely track food sensitivities and allergies when weaning?',
      a: 'When introducing new solid foods, Ama provides a structured 3-day introduction timeline. You can log each single ingredient alongside observed reactions like skin flushing, itchy spots, stool changes, or fussiness. This helps you identify sensitivities early without unnecessary confusion.'
    },
    {
      q: 'Can I track immunization schedules and daily records offline?',
      a: 'Yes. Ama is designed to function smoothly even when cellular data is intermittent or unavailable. All core tracking features, standard childhood immunization timelines, and care routines run directly in your browser without requiring constant internet access.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 flex flex-col font-sans text-left">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
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

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-12 w-full space-y-12">
        {/* Support Overview */}
        <section className="space-y-4 bg-white rounded-[2.5rem] border border-gray-100 p-6 sm:p-10 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Help & Inquiries</span>
              <h1 className="text-xl sm:text-2xl font-serif font-black text-slate-900">
                Support Desk & User Assistance
              </h1>
            </div>
          </div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Welcome to the Ama support desk. We are here to help parents, caregivers, and health advocates make the most of our infant tracking tools and cultural weaning guides. Whether you want to share a local recipe enhancement, report an issue with offline syncing, or suggest updates to our immunization checklists, our team is eager to assist.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Direct Access & Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-6 sm:p-8 shadow-xs space-y-5">
              <h2 className="text-lg font-serif font-black text-slate-900">Direct Support Channels</h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                We handle inquiries through our digital help desk to ensure each question receives thoughtful and documented attention from our care coordinators.
              </p>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Official Support</span>
                  <a href="mailto:support@amababy.care" className="text-primary hover:underline font-bold text-xs sm:text-sm block">
                    support@amababy.care
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-gray-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Response Time</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm block">Within 24 to 48 hours</span>
                </div>
              </div>
            </div>

            {/* Privacy Promise Card */}
            <div className="p-6 bg-slate-900 rounded-[2rem] text-white text-xs leading-relaxed space-y-2">
              <span className="text-emerald-400 font-bold block uppercase tracking-wider text-[10px]">
                User Privacy Guarantee
              </span>
              <p className="text-slate-300">
                Your contact details are used strictly to reply to your inquiry. We never share, sell, or rent your email address or family notes.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-[2rem] border border-gray-100 p-6 sm:p-8 shadow-xs">
            {isSubmitted ? (
              <div className="py-12 px-4 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto text-3xl">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif font-black text-slate-900">Message Received</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. We have logged your request and our support coordinators will get back to you within 24 to 48 hours.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border-none cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <h2 className="text-lg font-serif font-black text-slate-900">Send Us a Note</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Fill out the form below and we will follow up with you directly.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Amara Obi"
                      className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none transition-colors ${
                        errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-gray-200 focus:border-primary'
                      }`}
                    />
                    {errors.name && <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. amara@example.com"
                      className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none transition-colors ${
                        errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-gray-200 focus:border-primary'
                      }`}
                    />
                    {errors.email && <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Topic / Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-primary"
                  >
                    <option value="support">Technical Help & Offline Sync</option>
                    <option value="recipes">Weaning Recipes & Nutrition Questions</option>
                    <option value="community">Community & Peer Network Inquiries</option>
                    <option value="feedback">Suggestions & App Improvements</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us what you need assistance with..."
                    className={`w-full bg-slate-50 border rounded-xl p-3.5 text-xs font-medium text-slate-800 outline-none transition-colors resize-none ${
                      errors.message ? 'border-rose-400 focus:border-rose-500' : 'border-gray-200 focus:border-primary'
                    }`}
                  />
                  {errors.message && <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="mt-0.5 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-[11px] text-slate-600 leading-snug">
                      I agree to the privacy policy and consent to receiving a reply regarding this inquiry.
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="text-rose-500 text-[10px] font-bold">{errors.agreeToTerms}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-none shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending Message...' : 'Submit Message'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <section className="bg-white rounded-[2.5rem] border border-gray-100 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Frequently Asked Questions</span>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900">Common Questions & Guidance</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 bg-slate-50/60 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left bg-transparent border-none cursor-pointer"
                  >
                    <span className="font-bold text-xs sm:text-sm text-slate-800">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-gray-200 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Universal Footer */}
      <UniversalFooter onNavigate={onNavigateApp} activeScreen="contact" />
    </div>
  );
};
