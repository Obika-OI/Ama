import React, { useState, useEffect } from 'react';
import { 
  Shield, ShieldAlert, ShieldCheck, Clock, Plus, CheckCircle2, 
  AlertTriangle, History, Trash2, ChevronDown, ChevronUp, Lock, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Reminder, PRNDoseLog } from '../types';
import { evaluatePRNSafety, playSynthesizedChime } from '../utils/scheduleEngine';

interface PRNSafetyCardProps {
  reminder: Reminder;
  onLogDose: (reminderId: string, log: PRNDoseLog) => void;
  onDeleteLog?: (reminderId: string, logId: string) => void;
  compact?: boolean;
}

export const PRNSafetyCard: React.FC<PRNSafetyCardProps> = ({
  reminder,
  onLogDose,
  onDeleteLog,
  compact = false
}) => {
  const [now, setNow] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);
  const [logNotes, setLogNotes] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);
  const [customDosage, setCustomDosage] = useState(reminder.dosage || reminder.prnConfig?.dosage || '1 dose');

  // Real-time ticking clock for exact countdown calculation
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const safety = evaluatePRNSafety(reminder.prnConfig, now);

  const handleQuickLog = () => {
    const newLog: PRNDoseLog = {
      id: `dose-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      dosage: customDosage || '1 dose',
      notes: logNotes.trim() || undefined,
      loggedBy: 'Parent'
    };

    onLogDose(reminder.id, newLog);
    playSynthesizedChime('success');
    setShowLogModal(false);
    setLogNotes('');
  };

  if (compact) {
    return (
      <div className="p-3 rounded-2xl border transition-all bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {safety.isSafe ? (
              <ShieldCheck className="w-4 h-4 text-primary" />
            ) : (
              <Lock className="w-4 h-4 text-primary animate-pulse" />
            )}
            <span className="text-xs font-bold text-gray-800">
              {safety.isSafe ? 'Safe to Take Now' : `Safety Lock: ${safety.remainingFormatted}`}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-gray-500">
            {safety.dosesInLast24h} / {safety.maxDoses} in 24h
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-3xl border shadow-sm transition-all relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-primary/5 border-primary/20">
      {/* Top Banner Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs bg-primary text-white">
            {safety.isSafe ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5 animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-serif font-black text-sm text-gray-900 flex items-center gap-1.5">
              <span>{reminder.title}</span>
              {safety.isSafe ? (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Ready
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Safety Locked
                </span>
              )}
            </h3>
            <p className="text-[11px] text-gray-500">
              {reminder.prnConfig?.instructions || `Minimum ${safety.minIntervalHours}h interval • Max ${safety.maxDoses} doses/24h`}
            </p>
          </div>
        </div>

        {/* 24h Meter Badge */}
        <div className="text-right">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
            24h Window
          </span>
          <span className="text-xs font-mono font-black text-gray-800">
            {safety.dosesInLast24h} of {safety.maxDoses} Doses
          </span>
        </div>
      </div>

      {/* Safety Countdown / Status Panel */}
      {!safety.isSafe ? (
        <div className="bg-white/80 p-4 rounded-2xl border border-primary/20 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-gray-700">
                {safety.lockReason === 'max_doses' ? '24h Limit Reached' : 'Interval Lock Active'}
              </span>
            </div>
            <span className="font-mono font-black text-base text-primary tracking-wider">
              {safety.remainingFormatted}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-1000"
              style={{ width: `${safety.percentRemaining}%` }}
            />
          </div>

          <p className="text-[11px] text-gray-500 flex items-center justify-between">
            <span>Next safe administration:</span>
            <span className="font-bold text-gray-800">
              {safety.nextSafeTime
                ? safety.nextSafeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Pending'}
            </span>
          </p>
        </div>
      ) : (
        <div className="bg-primary/5 p-3.5 rounded-2xl border border-primary/20 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-gray-800">
              Safe to administer dosage ({reminder.dosage || '1 dose'})
            </span>
          </div>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {safety.maxDoses - safety.dosesInLast24h} remaining
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowLogModal(true)}
          className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-sm ${
            safety.isSafe
              ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
              : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{safety.isSafe ? 'Log Dose Now' : 'Override & Log Dose'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="py-3 px-3.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs border border-gray-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="View Dose History"
        >
          <History className="w-4 h-4 text-gray-500" />
          <span>History ({reminder.prnConfig?.doseLogs?.length || 0})</span>
          {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Dose History Accordion */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200/60 space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Past Administration History
              </span>
              <span className="text-[10px] text-gray-500">
                Sorted most recent first
              </span>
            </div>

            {reminder.prnConfig?.doseLogs && reminder.prnConfig.doseLogs.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {[...reminder.prnConfig.doseLogs]
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((log) => {
                    const logDate = new Date(log.timestamp);
                    const isWithin24h = (now.getTime() - logDate.getTime()) <= 24 * 3600 * 1000;
                    return (
                      <div
                        key={log.id}
                        className="bg-white p-2.5 rounded-xl border border-gray-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-800">{log.dosage}</span>
                            {isWithin24h && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                                Active in 24h
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500">
                            {logDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                            {logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {log.notes ? ` • "${log.notes}"` : ''}
                          </span>
                        </div>

                        {onDeleteLog && (
                          <button
                            type="button"
                            onClick={() => onDeleteLog(reminder.id, log.id)}
                            className="p-1 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors cursor-pointer border-none"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic py-2 text-center">
                No previous doses logged yet.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Dose Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900">Log Dose Intake</h3>
                </div>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center cursor-pointer border-none"
                >
                  ✕
                </button>
              </div>

              {!safety.isSafe && (
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-start gap-2 text-xs text-gray-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                  <div>
                    <span className="font-bold block">Safety Alert:</span>
                    Minimum interval has not elapsed yet ({safety.remainingFormatted} remaining). Ensure healthcare provider guidance before administering early.
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Dosage Amount
                </label>
                <input
                  type="text"
                  value={customDosage}
                  onChange={e => setCustomDosage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm font-semibold"
                  placeholder="e.g. 2.5 ml"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Symptom / Reason Note (Optional)
                </label>
                <input
                  type="text"
                  value={logNotes}
                  onChange={e => setLogNotes(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm font-medium"
                  placeholder="e.g. Fever 38.6°C or sore gums"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 font-bold text-xs uppercase cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleQuickLog}
                  className="flex-1 py-3 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase shadow-md shadow-primary/20 cursor-pointer border-none"
                >
                  Confirm & Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
