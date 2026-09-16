import React, { useState } from 'react';
import { ShieldCheck, RotateCcw, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sanitizeVaccineSchedule, calculateVaccineScheduleFromDOB } from '../constants/babyData';

interface ImmunizationSchedulerProps {
  vaccineSchedule: any[];
  setVaccineSchedule?: (schedule: any[]) => void;
  onNavigate?: (screen: string, data?: any) => void;
  babyBirthDate?: string;
}

export const ImmunizationScheduler: React.FC<ImmunizationSchedulerProps> = ({
  vaccineSchedule = [],
  setVaccineSchedule,
  onNavigate,
  babyBirthDate = ''
}) => {
  const activeSchedule = sanitizeVaccineSchedule(vaccineSchedule);
  const [vacFilterTab, setVacFilterTab] = useState<string>('All');
  const [editingVaccine, setEditingVaccine] = useState<string | null>(null);
  const [editingVacStatus, setEditingVacStatus] = useState('Scheduled');
  const [editingVacDate, setEditingVacDate] = useState('');
  const [editingVacEffects, setEditingVacEffects] = useState('None');

  const [dobInput, setDobInput] = useState<string>(babyBirthDate || new Date().toISOString().split('T')[0]);
  const [showDobBox, setShowDobBox] = useState<boolean>(false);

  const handleAutoScheduleFromDOB = () => {
    if (!dobInput) return;
    const updated = calculateVaccineScheduleFromDOB(dobInput, activeSchedule);
    if (setVaccineSchedule) setVaccineSchedule(updated);
    setShowDobBox(false);
  };

  const handleClearSchedules = () => {
    const updated = activeSchedule.map(v => v.status === 'Completed' ? v : { ...v, status: 'Unscheduled', date: '' });
    if (setVaccineSchedule) setVaccineSchedule(updated);
  };

  const handleSaveVaccine = () => {
    if (!editingVaccine) return;
    const updated = activeSchedule.map(v => 
      v.id === editingVaccine 
        ? { ...v, status: editingVacStatus, date: editingVacDate, sideEffects: editingVacEffects } 
        : v
    );
    if (setVaccineSchedule) setVaccineSchedule(updated);
    setEditingVaccine(null);
  };

  const completedCount = activeSchedule.filter(v => v.status === 'Completed').length;
  const scheduledCount = activeSchedule.filter(v => v.status === 'Scheduled').length;
  const totalCount = activeSchedule.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-card rounded-[48px] border border-white shadow-xl shadow-card/20 p-6 sm:p-8 space-y-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl shadow-2xs">💉</div>
          <div>
            <h3 className="text-base font-serif font-black text-gray-800">Immunization & Vaccine Tracker</h3>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">Childhood Vaccination Guidelines & Milestones</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDobBox(!showDobBox)}
            className="px-3.5 py-2 rounded-full bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 cursor-pointer border-none"
          >
            <Calendar className="w-3.5 h-3.5" />
            Auto-Schedule from DOB
          </button>
        </div>
      </div>

      {/* Auto-Schedule DOB Drawer */}
      <AnimatePresence>
        {showDobBox && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/5 p-5 rounded-3xl border border-primary/20 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">Auto-Schedule All Immunizations</h4>
              </div>
              <button onClick={() => setShowDobBox(false)} className="text-xs font-bold text-gray-400 border-none bg-transparent cursor-pointer">✕</button>
            </div>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Select your baby's Date of Birth to automatically calculate target dates for all 23 childhood immunization milestones.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center pt-1">
              <div className="flex-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Baby's Date of Birth</label>
                <input 
                  type="date" 
                  value={dobInput} 
                  onChange={e => setDobInput(e.target.value)} 
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-800 outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2 self-end w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleClearSchedules}
                  className="px-3 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl text-xs font-bold uppercase cursor-pointer hover:bg-gray-50"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={handleAutoScheduleFromDOB}
                  className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border-none shadow-xs"
                >
                  Apply Schedule
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeSchedule.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">💉</div>
          <p className="text-sm text-gray-500 font-bold mb-4">No vaccines listed.</p>
        </div>
      ) : (
        <>
          {/* Overall Progress Indicator */}
          <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-xs font-black text-gray-700">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Vaccination Progress
              </span>
              <span className="text-primary font-bold">
                {completedCount} / {totalCount} Up to Date ({progressPercent}%) • {scheduledCount} Scheduled
              </span>
            </div>
            <div className="w-full bg-gray-200/80 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Age Milestone Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px] font-bold">
            {['All', 'Birth', '6 Weeks', '10 Weeks', '6 Months', '9 Months', '12 Months', '15 Months', '18 Months', '24 Months', 'Completed', 'Scheduled', 'Unscheduled'].map(tab => (
              <button
                key={tab}
                onClick={() => setVacFilterTab(tab)}
                className={"px-3 py-1.5 rounded-full whitespace-nowrap transition-all border cursor-pointer font-black text-[9px] uppercase tracking-wider " + (vacFilterTab === tab ? "bg-primary text-white border-primary shadow-2xs" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100")}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[480px] overflow-y-auto pr-1">
            {activeSchedule.filter(v => {
              if (vacFilterTab === 'All') return true;
              if (vacFilterTab === 'Completed') return v.status === 'Completed';
              if (vacFilterTab === 'Scheduled') return v.status === 'Scheduled';
              if (vacFilterTab === 'Unscheduled') return v.status === 'Unscheduled' || !v.status;
              return v.age === vacFilterTab;
            }).map(v => (
              <div key={v.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/30 transition-all shadow-2xs">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-xl shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                    {v.icon || '💉'}
                  </div>
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">{v.age}</span>
                      <span className="text-[8px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-wider">{v.category || 'Essential'}</span>
                    </div>
                    <p className="text-xs font-black text-gray-800 mt-0.5">{v.name}</p>
                    {v.disease && (
                      <p className="text-[10px] text-gray-500 font-medium leading-tight">{v.disease}</p>
                    )}
                    <p className="text-[9px] text-gray-400 font-semibold mt-0.5">
                      Status: <span className={v.status === 'Completed' ? 'text-primary font-bold' : 'text-primary font-bold'}>{v.status || 'Unscheduled'}</span>
                      {v.date ? ' (' + v.date + ')' : ''}
                    </p>
                    {v.sideEffects && v.sideEffects !== 'None' && (
                      <p className="text-[9px] text-gray-700 bg-gray-100 px-2.5 py-1 rounded-xl font-bold inline-block mt-0.5 border border-gray-200">
                        🩺 Side effects logged: {v.sideEffects}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      const newStatus = v.status === 'Completed' ? 'Scheduled' : 'Completed';
                      const newDate = newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : v.date;
                      const updated = activeSchedule.map(item => item.id === v.id ? { ...item, status: newStatus, date: newDate } : item);
                      if (setVaccineSchedule) setVaccineSchedule(updated);
                    }}
                    className={v.status === "Completed" ? "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border-none cursor-pointer flex items-center gap-1 transition-colors bg-primary/20 text-primary hover:bg-primary/30" : "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border-none cursor-pointer flex items-center gap-1 transition-colors bg-primary text-white hover:bg-primary/90 shadow-xs"}
                    title={v.status === 'Completed' ? 'Mark as Scheduled' : 'Mark as Completed'}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {v.status === 'Completed' ? 'Given ✓' : 'Mark Given'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('journal', { tab: 'planner', openAddPlan: true, planType: 'vaccine', vaccineName: v.name, vaccineId: v.id });
                      } else {
                        setEditingVaccine(v.id);
                        setEditingVacStatus(v.status);
                        setEditingVacDate(v.date || '');
                        setEditingVacEffects(v.sideEffects || 'None');
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-[10px] font-black uppercase text-primary border-none cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    🗓️ Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vaccine Edit Drawer */}
          <AnimatePresence>
            {editingVaccine && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-gray-50 p-5 rounded-3xl border border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-black text-gray-800 uppercase tracking-widest">
                    Update Vaccine Record
                  </p>
                  <button onClick={() => setEditingVaccine(null)} className="text-xs font-bold text-gray-400 bg-none border-none cursor-pointer">Cancel</button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[8px] font-bold text-gray-400 block mb-1 uppercase">Status</label>
                    <select value={editingVacStatus} onChange={e => setEditingVacStatus(e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none">
                      <option value="Unscheduled">Unscheduled</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Deferred">Deferred</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[8px] font-bold text-gray-400 block mb-1 uppercase">Target / Given Date</label>
                    <input type="date" value={editingVacDate} onChange={e => setEditingVacDate(e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-[8px] font-bold text-gray-400 block mb-1.5 uppercase">Track Side Effects</label>
                  <div className="flex flex-wrap gap-1.5 font-bold">
                    {['Mild Fever', 'Sleepiness', 'Irritation', 'Redness', 'Soreness at site', 'Fussiness', 'None'].map(eff => (
                      <button
                        key={eff}
                        type="button"
                        onClick={() => setEditingVacEffects(eff)}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border-none cursor-pointer ${editingVacEffects === eff ? 'bg-primary/20 text-primary font-extrabold' : 'bg-white text-gray-400 border border-solid border-gray-100'}`}
                      >
                        {eff}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleSaveVaccine} className="w-full bg-primary text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer border-none hover:bg-primary/95 transition-all">
                  Save Vaccine Record
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};
