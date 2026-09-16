import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, Plus, Bell, Clock, Edit3, Trash2, CheckCircle2, 
  Repeat, Calendar, Shield, Sparkles, Filter, Check, AlertTriangle, 
  ChevronDown, ChevronUp, Sun, Moon, Info, Eye, Droplet, Heart, Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Reminder, ScheduleType, IntervalSchedule, SpecificTimesSchedule, WeeklySchedule, PRNSchedule, PRNDoseLog } from '../types';
import { FlexibleScheduleBuilder } from './FlexibleScheduleBuilder';
import { PRNSafetyCard } from './PRNSafetyCard';
import { 
  getDailyTimesForReminder, getNextUpcomingDose, evaluatePRNSafety, 
  playSynthesizedChime, formatCountdown 
} from '../utils/scheduleEngine';

interface RemindersScreenProps {
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>> | ((reminders: Reminder[]) => void);
  onBack: () => void;
  setNotifications?: React.Dispatch<React.SetStateAction<any[]>>;
}

export const RemindersScreen: React.FC<RemindersScreenProps> = ({
  reminders = [],
  setReminders,
  onBack,
  setNotifications
}) => {
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);

  // Filter tab state: 'all' | 'medication' | 'feeding' | 'prn' | 'routine'
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Expand schedule details for individual cards
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Real-time ticking for next dose badges
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Form states for creating / editing schedule
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'medication' | 'feeding' | 'hydration' | 'activity' | 'routine' | 'other'>('medication');
  const [formScheduleType, setFormScheduleType] = useState<ScheduleType>('interval');
  const [formDosage, setFormDosage] = useState('');
  const [formInstructions, setFormInstructions] = useState('');

  // Interval Config Form State
  const [formIntervalConfig, setFormIntervalConfig] = useState<IntervalSchedule>({
    intervalHours: 4,
    anchorTime: '08:00 AM',
    mode: 'continuous_24h',
    wakingStart: '07:00 AM',
    wakingEnd: '09:00 PM'
  });

  // Specific Times Config Form State
  const [formSpecificTimesConfig, setFormSpecificTimesConfig] = useState<SpecificTimesSchedule>({
    times: ['08:00 AM', '02:00 PM', '08:00 PM']
  });

  // Weekly Config Form State
  const [formWeeklyConfig, setFormWeeklyConfig] = useState<WeeklySchedule>({
    days: [1, 3, 5],
    times: ['09:00 AM', '06:00 PM']
  });

  // PRN Config Form State
  const [formPRNConfig, setFormPRNConfig] = useState<PRNSchedule>({
    minIntervalHours: 4,
    maxDosesPer24h: 4,
    dosage: '2.5 ml',
    instructions: 'Administer as needed for fever or acute pain',
    doseLogs: []
  });

  const resetForm = () => {
    setFormTitle('');
    setFormCategory('medication');
    setFormScheduleType('interval');
    setFormDosage('');
    setFormInstructions('');
    setFormIntervalConfig({
      intervalHours: 4,
      anchorTime: '08:00 AM',
      mode: 'continuous_24h',
      wakingStart: '07:00 AM',
      wakingEnd: '09:00 PM'
    });
    setFormSpecificTimesConfig({
      times: ['08:00 AM', '02:00 PM', '08:00 PM']
    });
    setFormWeeklyConfig({
      days: [1, 3, 5],
      times: ['09:00 AM', '06:00 PM']
    });
    setFormPRNConfig({
      minIntervalHours: 4,
      maxDosesPer24h: 4,
      dosage: '2.5 ml',
      instructions: 'Administer as needed for fever or acute pain',
      doseLogs: []
    });
    setEditingReminderId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (reminder: Reminder) => {
    setEditingReminderId(reminder.id);
    setFormTitle(reminder.title);
    setFormCategory(reminder.category || 'medication');
    setFormScheduleType(reminder.scheduleType || 'interval');
    setFormDosage(reminder.dosage || '');
    setFormInstructions(reminder.instructions || '');

    if (reminder.intervalConfig) {
      setFormIntervalConfig(reminder.intervalConfig);
    } else if (reminder.interval) {
      setFormIntervalConfig({
        intervalHours: reminder.interval,
        anchorTime: reminder.time || '08:00 AM',
        mode: 'continuous_24h'
      });
    }

    if (reminder.specificTimesConfig) {
      setFormSpecificTimesConfig(reminder.specificTimesConfig);
    } else if (reminder.time) {
      setFormSpecificTimesConfig({ times: [reminder.time] });
    }

    if (reminder.weeklyConfig) {
      setFormWeeklyConfig(reminder.weeklyConfig);
    }

    if (reminder.prnConfig) {
      setFormPRNConfig(reminder.prnConfig);
    }

    setShowAddModal(true);
  };

  const handleSaveReminder = () => {
    if (!formTitle.trim()) return;

    let derivedTime = '08:00 AM';
    if (formScheduleType === 'interval') {
      derivedTime = formIntervalConfig.anchorTime || '08:00 AM';
    } else if (formScheduleType === 'specific_times') {
      derivedTime = formSpecificTimesConfig.times?.[0] || '08:00 AM';
    } else if (formScheduleType === 'weekly') {
      derivedTime = formWeeklyConfig.times?.[0] || '08:00 AM';
    }

    const payload: Reminder = {
      id: editingReminderId || `rem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: formTitle.trim(),
      category: formCategory,
      type: formCategory === 'medication' ? 'Medication' : formCategory === 'hydration' ? 'Fluid Intake' : 'Activity',
      scheduleType: formScheduleType,
      time: derivedTime,
      active: true,
      isActive: true,
      dosage: formDosage.trim() || undefined,
      instructions: formInstructions.trim() || undefined,
      intervalConfig: formScheduleType === 'interval' ? formIntervalConfig : undefined,
      specificTimesConfig: formScheduleType === 'specific_times' ? formSpecificTimesConfig : undefined,
      weeklyConfig: formScheduleType === 'weekly' ? formWeeklyConfig : undefined,
      prnConfig: formScheduleType === 'prn' ? formPRNConfig : undefined,
      createdAt: new Date().toISOString()
    };

    if (editingReminderId) {
      const updated = reminders.map(r => r.id === editingReminderId ? { ...r, ...payload, active: r.active !== false } : r);
      setReminders(updated);
      if (setNotifications) {
        setNotifications(prev => [
          {
            id: `notif-edit-${Date.now()}`,
            title: `Updated schedule "${payload.title}"`,
            time: 'Just now',
            read: false
          },
          ...prev
        ]);
      }
    } else {
      const updated = [payload, ...reminders];
      setReminders(updated);
      if (setNotifications) {
        setNotifications(prev => [
          {
            id: `notif-add-${Date.now()}`,
            title: `Added "${payload.title}" schedule (${payload.scheduleType})`,
            time: 'Just now',
            read: false
          },
          ...prev
        ]);
      }
    }

    playSynthesizedChime('success');
    setShowAddModal(false);
    resetForm();
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
  };

  const handleToggleActive = (id: string) => {
    const updated = reminders.map(r => {
      if (r.id === id) {
        const nextActive = !(r.active !== false && r.isActive !== false);
        return { ...r, active: nextActive, isActive: nextActive };
      }
      return r;
    });
    setReminders(updated);
  };

  // PRN Logging handlers
  const handleLogPRNDose = (reminderId: string, log: PRNDoseLog) => {
    const updated = reminders.map(r => {
      if (r.id === reminderId) {
        const currentLogs = r.prnConfig?.doseLogs || [];
        const newPrnConfig: PRNSchedule = {
          minIntervalHours: r.prnConfig?.minIntervalHours || 4,
          maxDosesPer24h: r.prnConfig?.maxDosesPer24h || 4,
          dosage: r.prnConfig?.dosage || r.dosage || '1 dose',
          instructions: r.prnConfig?.instructions,
          doseLogs: [log, ...currentLogs]
        };
        return {
          ...r,
          prnConfig: newPrnConfig,
          lastTriggered: new Date().toISOString()
        };
      }
      return r;
    });
    setReminders(updated);

    if (setNotifications) {
      setNotifications(prev => [
        {
          id: `dose-logged-${Date.now()}`,
          title: `Logged PRN Dose: ${log.dosage}`,
          time: 'Just now',
          read: false
        },
        ...prev
      ]);
    }
  };

  const handleDeletePRNLog = (reminderId: string, logId: string) => {
    const updated = reminders.map(r => {
      if (r.id === reminderId && r.prnConfig) {
        return {
          ...r,
          prnConfig: {
            ...r.prnConfig,
            doseLogs: r.prnConfig.doseLogs.filter(l => l.id !== logId)
          }
        };
      }
      return r;
    });
    setReminders(updated);
  };

  // Quick Action: Take / Log a standard dose for non-PRN reminders
  const handleQuickTakeNonPRN = (reminder: Reminder) => {
    playSynthesizedChime('success');
    if (setNotifications) {
      setNotifications(prev => [
        {
          id: `dose-taken-${Date.now()}`,
          title: `Completed dose for "${reminder.title}"`,
          time: 'Just now',
          read: false
        },
        ...prev
      ]);
    }
  };

  const toggleExpandCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered Reminders List
  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      // Category filter
      if (filterCategory === 'medication' && r.category !== 'medication' && r.type !== 'Medication') return false;
      if (filterCategory === 'feeding' && r.category !== 'feeding' && r.category !== 'hydration' && r.type !== 'Fluid Intake') return false;
      if (filterCategory === 'prn' && r.scheduleType !== 'prn') return false;
      if (filterCategory === 'routine' && r.category !== 'routine' && r.category !== 'activity') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title?.toLowerCase().includes(q);
        const matchDosage = r.dosage?.toLowerCase().includes(q);
        const matchType = r.scheduleType?.toLowerCase().includes(q);
        if (!matchTitle && !matchDosage && !matchType) return false;
      }

      return true;
    });
  }, [reminders, filterCategory, searchQuery]);

  const activeCount = reminders.filter(r => r.active !== false && r.isActive !== false).length;
  const prnCount = reminders.filter(r => r.scheduleType === 'prn').length;

  const getCategoryIcon = (category?: string, type?: string) => {
    if (category === 'medication' || type === 'Medication') return '💊';
    if (category === 'hydration' || type === 'Fluid Intake') return '💧';
    if (category === 'feeding') return '🍼';
    if (category === 'activity') return '🧸';
    if (category === 'routine') return '🌙';
    return '🔔';
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-36 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center pt-2 sm:pt-4 pb-2 px-1">
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-800 hover:scale-105 transition-transform cursor-pointer border-none"
          title="Back to Dashboard"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-serif font-black text-gray-900 tracking-tight">
            Timing Schedules
          </h1>
          <p className="text-xs font-medium text-gray-500">
            Automated intervals, alert times & PRN guardrails
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 rounded-full bg-primary shadow-md shadow-primary/20 flex items-center gap-1.5 text-white font-bold text-xs uppercase tracking-wider hover:scale-105 transition-transform cursor-pointer border-none"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Schedule</span>
          <span className="sm:hidden">Add</span>
        </button>
      </header>

      {/* --- ADD / EDIT SCHEDULE MODAL INLINE --- */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-card p-6 rounded-[32px] shadow-sm border border-white space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {editingReminderId ? 'Edit Reminder' : 'Add New Reminder'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer border-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vitamin D Drops, Amoxicillin"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium outline-none text-gray-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as any)}
                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium outline-none text-gray-700"
                >
                  <option value="medication">Medication</option>
                  <option value="hydration">Hydration / Fluid</option>
                  <option value="feeding">Feeding</option>
                  <option value="activity">Activity</option>
                  <option value="routine">Routine</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* FLEXIBLE SCHEDULE BUILDER SUB-COMPONENT */}
              <div className="pt-2 border-t border-gray-100">
                <FlexibleScheduleBuilder
                  scheduleType={formScheduleType}
                  onChangeScheduleType={setFormScheduleType}
                  intervalConfig={formIntervalConfig}
                  onChangeIntervalConfig={setFormIntervalConfig}
                  specificTimesConfig={formSpecificTimesConfig}
                  onChangeSpecificTimesConfig={setFormSpecificTimesConfig}
                  weeklyConfig={formWeeklyConfig}
                  onChangeWeeklyConfig={setFormWeeklyConfig}
                  prnConfig={formPRNConfig}
                  onChangePRNConfig={setFormPRNConfig}
                  dosage={formDosage}
                  onChangeDosage={setFormDosage}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Instructions / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Give after breastfeeding"
                  value={formInstructions}
                  onChange={e => setFormInstructions(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium outline-none text-gray-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest cursor-pointer border-none"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveReminder}
                  disabled={!formTitle.trim()}
                  className="flex-1 py-3 rounded-full bg-primary disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest shadow-md shadow-primary/20 cursor-pointer border-none"
                >
                  {editingReminderId ? 'Save' : 'Add'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Highlights Banner */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-white/60 shadow-2xs">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
            Active
          </span>
          <span className="text-xl font-serif font-black text-primary">
            {activeCount}
          </span>
          <span className="text-[10px] text-gray-500 block">Schedules on alert</span>
        </div>

        <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-white/60 shadow-2xs">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
            PRN Guardrails
          </span>
          <span className="text-xl font-serif font-black text-primary">
            {prnCount}
          </span>
          <span className="text-[10px] text-gray-500 block">Safety locks active</span>
        </div>

        <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-white/60 shadow-2xs">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
            Background Loop
          </span>
          <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mt-1">
            🟢 Synced
          </span>
          <span className="text-[10px] text-gray-500 block mt-0.5">Push + Local Audio</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Plans', icon: '📋' },
          { id: 'medication', label: 'Medications', icon: '💊' },
          { id: 'feeding', label: 'Feeding & Fluids', icon: '💧' },
          { id: 'prn', label: 'As-Needed (PRN)', icon: '🛡️' },
          { id: 'routine', label: 'Routines', icon: '🧸' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer border ${
              filterCategory === tab.id
                ? 'bg-gray-900 text-white border-gray-900 shadow-xs scale-102'
                : 'bg-white/80 text-gray-600 border-gray-200 hover:bg-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Schedules List */}
      <div className="space-y-4">
        {filteredReminders.length > 0 ? (
          filteredReminders.map(reminder => {
            const isActive = reminder.active !== false && reminder.isActive !== false;
            const isPRN = reminder.scheduleType === 'prn';
            const dailyTimes = getDailyTimesForReminder(reminder, now);
            const nextDose = getNextUpcomingDose(reminder, now);
            const isExpanded = !!expandedCards[reminder.id];

            // If PRN, render the rich PRNSafetyCard with full live countdown & dose logger
            if (isPRN) {
              return (
                <div key={reminder.id} className="relative group">
                  <PRNSafetyCard
                    reminder={reminder}
                    onLogDose={handleLogPRNDose}
                    onDeleteLog={handleDeletePRNLog}
                  />
                  {/* Floating Action Controls */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(reminder)}
                      className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-gray-500 hover:text-gray-800 shadow-2xs transition-colors cursor-pointer border border-gray-200/50"
                      title="Edit Schedule"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="p-1.5 rounded-lg bg-white/80 hover:bg-primary/10 text-gray-400 hover:text-primary shadow-2xs transition-colors cursor-pointer border border-gray-200/50"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-3xl border transition-all shadow-xs ${
                  isActive
                    ? 'bg-white border-white/80 hover:shadow-md'
                    : 'bg-gray-50/70 border-gray-200/60 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl shadow-2xs shrink-0">
                      {getCategoryIcon(reminder.category, reminder.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif font-black text-base text-gray-900">
                          {reminder.title}
                        </h3>
                        {reminder.dosage && (
                          <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            {reminder.dosage}
                          </span>
                        )}
                      </div>

                      {/* Schedule Type Tag & Description */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {reminder.scheduleType === 'interval' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            <Repeat className="w-3 h-3" />
                            <span>
                              Every {reminder.intervalConfig?.intervalHours || reminder.interval || 4}h
                              {reminder.intervalConfig?.mode === 'waking_hours' ? ' (Waking)' : ' (24h)'}
                            </span>
                          </span>
                        )}

                        {reminder.scheduleType === 'specific_times' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span>{reminder.specificTimesConfig?.times?.length || 1} Daily Times</span>
                          </span>
                        )}

                        {reminder.scheduleType === 'weekly' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {reminder.weeklyConfig?.days?.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}
                            </span>
                          </span>
                        )}

                        {/* Next Upcoming Due Pill */}
                        {nextDose && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                            ⏰ {nextDose.label}
                          </span>
                        )}
                      </div>

                      {reminder.instructions && (
                        <p className="text-xs text-gray-500 mt-1.5">
                          {reminder.instructions}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Active Toggle Switch */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(reminder.id)}
                      className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer border-none ${
                        isActive ? 'bg-primary' : 'bg-gray-200'
                      }`}
                      title={isActive ? 'Disable reminder' : 'Enable reminder'}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${
                          isActive ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Daily Times Preview Chips */}
                {dailyTimes.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">
                        Today ({dailyTimes.length}):
                      </span>
                      {dailyTimes.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 font-mono text-[11px] font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickTakeNonPRN(reminder)}
                        className="py-1 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors cursor-pointer border border-primary/20 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Log Dose</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(reminder)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer border-none"
                        title="Edit Schedule"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors cursor-pointer border-none"
                        title="Delete Schedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-16 px-4 bg-white/60 rounded-3xl border border-gray-200/60 space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center text-2xl">
              🔔
            </div>
            <h3 className="font-serif font-black text-lg text-gray-800">
              No schedules found
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Create flexible interval cycles, multiple daily alert times, or PRN safety countdowns.
            </p>
            <button
              onClick={handleOpenAdd}
              className="py-2.5 px-5 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-primary/20 cursor-pointer border-none"
            >
              + Create First Schedule
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
