import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, Heart, ShieldCheck, AlertTriangle, PhoneCall, RefreshCw, 
  CheckCircle2, Info, ChevronRight, ChevronLeft, Download, Share2, 
  Sparkles, ExternalLink
} from 'lucide-react';

export interface EPDSQuestion {
  id: number;
  prompt: string;
  options: { label: string; score: number }[];
}

export const EPDS_QUESTIONS: EPDSQuestion[] = [
  {
    id: 1,
    prompt: "In the past 7 days, I have been able to laugh and see the funny side of things:",
    options: [
      { label: "As much as I always could", score: 0 },
      { label: "Not quite so much now", score: 1 },
      { label: "Definitely not so much now", score: 2 },
      { label: "Not at all", score: 3 }
    ]
  },
  {
    id: 2,
    prompt: "In the past 7 days, I have looked forward with enjoyment to things:",
    options: [
      { label: "As much as I ever did", score: 0 },
      { label: "Rather less than I used to", score: 1 },
      { label: "Definitely less than I used to", score: 2 },
      { label: "Hardly at all", score: 3 }
    ]
  },
  {
    id: 3,
    prompt: "In the past 7 days, I have blamed myself unnecessarily when things went wrong:",
    options: [
      { label: "Yes, most of the time", score: 3 },
      { label: "Yes, some of the time", score: 2 },
      { label: "Not very often", score: 1 },
      { label: "No, never", score: 0 }
    ]
  },
  {
    id: 4,
    prompt: "In the past 7 days, I have been anxious or worried for no good reason:",
    options: [
      { label: "No, not at all", score: 0 },
      { label: "Hardly ever", score: 1 },
      { label: "Yes, sometimes", score: 2 },
      { label: "Yes, very often", score: 3 }
    ]
  },
  {
    id: 5,
    prompt: "In the past 7 days, I have felt scared or panicky for no good reason:",
    options: [
      { label: "Yes, quite a lot", score: 3 },
      { label: "Yes, sometimes", score: 2 },
      { label: "No, not much", score: 1 },
      { label: "No, not at all", score: 0 }
    ]
  },
  {
    id: 6,
    prompt: "In the past 7 days, things have been getting on top of me:",
    options: [
      { label: "Yes, most of the time I haven't been able to cope at all", score: 3 },
      { label: "Yes, sometimes I haven't been coping as well as usual", score: 2 },
      { label: "No, most of the time I have coped quite well", score: 1 },
      { label: "No, I have been coping as well as ever", score: 0 }
    ]
  },
  {
    id: 7,
    prompt: "In the past 7 days, I have been so unhappy that I have had difficulty sleeping:",
    options: [
      { label: "Yes, most of the time", score: 3 },
      { label: "Yes, sometimes", score: 2 },
      { label: "Not very often", score: 1 },
      { label: "No, not at all", score: 0 }
    ]
  },
  {
    id: 8,
    prompt: "In the past 7 days, I have felt sad or miserable:",
    options: [
      { label: "Yes, most of the time", score: 3 },
      { label: "Yes, quite often", score: 2 },
      { label: "Not very often", score: 1 },
      { label: "No, not at all", score: 0 }
    ]
  },
  {
    id: 9,
    prompt: "In the past 7 days, I have been so unhappy that I have been crying:",
    options: [
      { label: "Yes, most of the time", score: 3 },
      { label: "Yes, quite often", score: 2 },
      { label: "Only occasionally", score: 1 },
      { label: "No, never", score: 0 }
    ]
  },
  {
    id: 10,
    prompt: "In the past 7 days, the thought of harming myself has occurred to me:",
    options: [
      { label: "Yes, quite often", score: 3 },
      { label: "Sometimes", score: 2 },
      { label: "Hardly ever", score: 1 },
      { label: "Never", score: 0 }
    ]
  }
];

export const EPDSTool: React.FC<{ parentName?: string }> = ({ parentName = 'Mom' }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewMode, setViewMode] = useState<'stepper' | 'full'>('full');

  const handleSelectOption = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount === EPDS_QUESTIONS.length;

  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const question10Score = answers[10] || 0;
  const hasSelfHarmFlag = question10Score > 0;

  const handleReset = () => {
    setAnswers({});
    setIsCompleted(false);
    setCurrentStep(1);
  };

  // Interpretation tier
  const getInterpretation = () => {
    if (totalScore <= 9) {
      return {
        level: 'Low Risk / Typical Postpartum Fluctuations',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        badge: 'Score 0-9',
        summary: 'Your responses indicate mild or routine emotional changes common in the fourth trimester. Hormone shifts, irregular sleep, and fatigue can cause normal emotional fatigue.',
        recommendation: 'Continue prioritizing restful 4-hour sleep blocks, balanced warm nutrition, and compassionate sharing with your partner and family circle.'
      };
    } else if (totalScore <= 12) {
      return {
        level: 'Borderline / Moderate Distress Symptoms',
        color: 'text-sky-800 bg-sky-50 border-sky-200',
        badge: 'Score 10-12',
        summary: 'Your score indicates presence of noticeable emotional strain, anxiety, or low mood. These symptoms are very common and highly treatable.',
        recommendation: 'We recommend discussing these feelings with your obstetrician, midwife, or primary healthcare provider. Consider screening again in 1 to 2 weeks.'
      };
    } else {
      return {
        level: 'Elevated Postpartum Depression Symptoms',
        color: 'text-sky-800 bg-sky-50 border-sky-200',
        badge: 'Score 13-30',
        summary: 'Your score suggests significant perinatal emotional distress or postpartum depression. Please remember: this is a neurochemical medical condition, NOT a personal flaw or weakness.',
        recommendation: 'Please schedule a compassionate consultation with your doctor, obstetrician, or a mental health professional specializing in maternal health.'
      };
    }
  };

  const interpretation = getInterpretation();

  return (
    <div className="bg-white/95 backdrop-blur-xs p-6 sm:p-8 rounded-[36px] border border-white shadow-xl shadow-card/10 space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-inner">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                Validated Clinical Screening
              </span>
              <span className="text-[10px] font-bold text-gray-400">
                Cox et al., 1987
              </span>
            </div>
            <h3 className="text-xl font-serif font-black text-gray-900 mt-0.5">
              The Edinburgh Postnatal Depression Scale (EPDS)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAllAnswered && (
            <button
              onClick={() => setIsCompleted(true)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider cursor-pointer border-none shadow-md"
            >
              View Full Analysis
            </button>
          )}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer border-none"
            title="Reset Screening"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description & Privacy Notice */}
      <div className="space-y-2 text-xs text-gray-600 leading-relaxed font-medium">
        <p>
          The Edinburgh Postnatal Depression Scale is an internationally recognized 10-item self-report questionnaire used by healthcare providers during postpartum checkups. It evaluates how you have felt in the past 7 days.
        </p>
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>100% Private & Device-Isolated:</strong> Your answers are calculated strictly on your personal device and never uploaded to public servers or shared with advertisers.
          </span>
        </div>
      </div>

      {/* Immediate Critical Safety Alert if Question 10 is Flagged */}
      {hasSelfHarmFlag && (
        <div className="p-5 bg-sky-600 text-white rounded-3xl shadow-lg shadow-sky-600/20 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-white shrink-0" />
            <h4 className="text-sm font-black uppercase tracking-wider">
              Immediate Compassionate Support is Available
            </h4>
          </div>
          <p className="text-xs text-sky-100 leading-relaxed">
            You indicated experiencing thoughts of harming yourself. You are not alone, and there is immediate, confidential, and judgment-free support available right now. Please reach out to someone who can help:
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <a 
              href="tel:988" 
              className="px-4 py-2 bg-white text-sky-700 font-black rounded-xl text-xs uppercase tracking-wider no-underline shadow-sm flex items-center gap-1.5 hover:scale-105 transition-transform"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call / Text 988 (USA & Canada)</span>
            </a>
            <a 
              href="tel:18338526262" 
              className="px-4 py-2 bg-sky-700 text-white border border-sky-400 font-black rounded-xl text-xs uppercase tracking-wider no-underline flex items-center gap-1.5 hover:bg-sky-800 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Maternal Mental Health (1-833-852-6262)</span>
            </a>
            <a 
              href="tel:18009444773" 
              className="px-4 py-2 bg-sky-700 text-white border border-sky-400 font-black rounded-xl text-xs uppercase tracking-wider no-underline flex items-center gap-1.5 hover:bg-sky-800 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>PSI Warmline (1-800-944-4773)</span>
            </a>
            <a 
              href="tel:111" 
              className="px-4 py-2 bg-sky-700 text-white border border-sky-400 font-black rounded-xl text-xs uppercase tracking-wider no-underline flex items-center gap-1.5 hover:bg-sky-800 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>NHS 111 (UK) / 999 Emergency</span>
            </a>
          </div>
        </div>
      )}

      {/* Live Progress Bar & Score Counter */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-gray-100">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
            Questions Answered: {answeredCount} / {EPDS_QUESTIONS.length}
          </span>
          <div className="w-48 sm:w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(answeredCount / EPDS_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
            Current Score
          </span>
          <span className="text-xl font-serif font-black text-gray-900">
            {totalScore} <span className="text-xs text-gray-400 font-sans font-bold">/ 30</span>
          </span>
        </div>
      </div>

      {/* 10 Standardized EPDS Questions */}
      <div className="space-y-5">
        {EPDS_QUESTIONS.map((q) => {
          const selectedScore = answers[q.id];
          const isAnswered = selectedScore !== undefined;

          return (
            <div 
              key={q.id}
              className={`p-5 rounded-2xl border transition-all ${
                isAnswered 
                  ? 'bg-white border-primary/30 shadow-xs' 
                  : 'bg-white/80 border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {q.id}
                </span>
                <h4 className="text-sm font-bold text-gray-800 leading-snug">
                  {q.prompt}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                {q.options.map((opt, idx) => {
                  const isOptSelected = selectedScore === opt.score;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(q.id, opt.score)}
                      className={`p-3 rounded-xl text-xs text-left font-medium transition-all cursor-pointer border flex items-center justify-between gap-2 ${
                        isOptSelected
                          ? 'bg-primary text-white border-primary shadow-sm font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 text-gray-700 border-gray-100'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                        isOptSelected ? 'bg-white/20 text-white' : 'bg-gray-200/60 text-gray-500'
                      }`}>
                        {opt.score} pt{opt.score !== 1 ? 's' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Results & Clinical Interpretation Card */}
      {isAllAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 sm:p-8 rounded-[32px] border ${interpretation.color} space-y-4 shadow-sm`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 border border-current shadow-2xs">
                {interpretation.badge}
              </span>
              <h4 className="text-xl font-serif font-black mt-1">
                {interpretation.level}
              </h4>
            </div>
            <div className="text-3xl font-serif font-black">
              {totalScore} <span className="text-sm font-sans font-medium opacity-70">/ 30</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed opacity-95">
            {interpretation.summary}
          </p>

          <div className="p-4 bg-white/80 rounded-2xl border border-current/20 text-xs leading-relaxed space-y-2">
            <strong className="block text-gray-900 font-bold uppercase tracking-wider text-[10px]">
              Recommended Clinical Next Steps:
            </strong>
            <p className="text-gray-700">
              {interpretation.recommendation}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-current/20">
            <span className="text-[10px] text-gray-500 font-semibold">
              Screening Date: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-white text-gray-800 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-50 shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save for Doctor</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Global Clinical Helplines Directory */}
      <div className="p-6 bg-slate-900 text-white rounded-[32px] space-y-4">
        <div className="flex items-center gap-2 text-teal-300">
          <PhoneCall className="w-5 h-5 shrink-0" />
          <h4 className="text-xs font-black uppercase tracking-widest">
            Perinatal Mental Health Helplines (Free & Confidential)
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          If you or someone you know is feeling overwhelmed, anxious, or down, compassionate professional counselors are available 24 hours a day:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-800 rounded-2xl space-y-1">
            <strong className="text-white block font-bold">National Maternal Mental Health Hotline (USA)</strong>
            <span className="text-teal-400 font-mono font-bold block text-sm">Call/Text 1-833-852-6262</span>
            <p className="text-[11px] text-slate-400">24/7, free, confidential perinatal mental health support in English and Spanish.</p>
          </div>
          <div className="p-3.5 bg-slate-800 rounded-2xl space-y-1">
            <strong className="text-white block font-bold">Postpartum Support International (PSI)</strong>
            <span className="text-teal-400 font-mono font-bold block text-sm">Call/Text 1-800-944-4773</span>
            <p className="text-[11px] text-slate-400">Global peer support, therapist directory, and specialized perinatal groups.</p>
          </div>
          <div className="p-3.5 bg-slate-800 rounded-2xl space-y-1">
            <strong className="text-white block font-bold">988 Suicide & Crisis Lifeline (US & Canada)</strong>
            <span className="text-teal-400 font-mono font-bold block text-sm">Dial 988</span>
            <p className="text-[11px] text-slate-400">24/7 free emotional crisis response and emergency counseling.</p>
          </div>
          <div className="p-3.5 bg-slate-800 rounded-2xl space-y-1">
            <strong className="text-white block font-bold">United Kingdom & Europe Resources</strong>
            <span className="text-teal-400 font-mono font-bold block text-sm">NHS 111 / Emergency 999 or 112</span>
            <p className="text-[11px] text-slate-400">Contact your community midwife, health visitor, or NHS 111 service.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
