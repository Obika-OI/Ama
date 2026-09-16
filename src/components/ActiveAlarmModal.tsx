import React, { useEffect } from 'react';
import { Bell, Clock, CheckCircle2, RotateCcw, X, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Reminder } from '../types';
import { playSynthesizedChime } from '../utils/scheduleEngine';

interface ActiveAlarmModalProps {
  alarm: {
    reminder: Reminder;
    triggerTime: string;
    title: string;
    body: string;
    tag: string;
  } | null;
  onTake: (reminder: Reminder) => void;
  onSnooze: (reminder: Reminder, minutes?: number) => void;
  onDismiss: () => void;
}

export const ActiveAlarmModal: React.FC<ActiveAlarmModalProps> = ({
  alarm,
  onTake,
  onSnooze,
  onDismiss
}) => {
  useEffect(() => {
    if (alarm) {
      playSynthesizedChime('alert');
    }
  }, [alarm]);

  if (!alarm) return null;

  const { reminder, triggerTime, title } = alarm;
  const isMedication = reminder.category === 'medication' || reminder.type?.toLowerCase().includes('med');
  const isPRN = reminder.scheduleType === 'prn';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-2xl border border-white space-y-5 text-center relative overflow-hidden"
      >
        {/* Animated Glow Halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

        {/* Icon & Pulse Animation */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75" />
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 relative">
            <Bell className="w-8 h-8 animate-bounce" />
          </div>
        </div>

        {/* Alarm Details */}
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            Scheduled Alarm • {triggerTime}
          </span>
          <h2 className="text-xl font-serif font-black text-gray-900 pt-1">
            {reminder.title}
          </h2>
          {reminder.dosage && (
            <p className="text-sm font-bold text-gray-600">
              Dosage: <span className="text-primary">{reminder.dosage}</span>
            </p>
          )}
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            {reminder.instructions || 'Time for your scheduled care routine. Keep baby safe and nourished.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => onTake(reminder)}
            className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all cursor-pointer border-none"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Mark Taken / Done</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSnooze(reminder, 10)}
              className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-none"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Snooze 10m</span>
            </button>

            <button
              type="button"
              onClick={onDismiss}
              className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border-none"
            >
              <X className="w-3.5 h-3.5" />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
