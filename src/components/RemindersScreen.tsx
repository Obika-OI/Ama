import React, { useState } from 'react';
import { ChevronLeft, Plus, Bell, Clock, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_REMINDERS, THEME } from '../constants';
import { Reminder } from '../types';

export const RemindersScreen = ({ 
  reminders, 
  setReminders, 
  onBack,
  setNotifications
}: { 
  reminders: any[]; 
  setReminders: (reminders: any[]) => void; 
  onBack: () => void; 
  setNotifications?: React.Dispatch<React.SetStateAction<any[]>>;
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState('Medication');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = () => {
    if (newTitle) {
      setReminders([...reminders, { id: Date.now().toString(), type: newType, time: newTime, title: newTitle, active: true }]);
      if (setNotifications) {
        setNotifications(prev => [
          {
            id: `reminder-add-${Date.now()}`,
            title: `Added "${newTitle}" reminder at ${newTime}`,
            time: 'Just now',
            read: false
          },
          ...prev
        ]);
      }
      setShowAdd(false);
      setNewTitle('');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Medication': return '💊';
      case 'Fluid Intake': return '💧';
      case 'Activity': return '🧸';
      default: return '🔔';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-32 space-y-8 bg-background min-h-screen">
      <header className="flex justify-between items-center pt-3 sm:pt-4 pb-2 px-1">
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-800 hover:scale-105 transition-transform cursor-pointer border-none">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-serif font-black text-gray-800">Reminders</h1>
        <button 
          onClick={() => setShowAdd(true)}
          className="w-11 h-11 rounded-full bg-primary shadow-sm shadow-primary/20 flex items-center justify-center text-white hover:scale-105 transition-transform cursor-pointer border-none"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 rounded-[32px] shadow-xl border border-white space-y-4">
          <h2 className="text-lg font-bold text-gray-800">New Reminder</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Type</label>
              <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" value={newType} onChange={e => setNewType(e.target.value)}>
                <option>Medication</option>
                <option>Fluid Intake</option>
                <option>Activity</option>
                <option>Other</option>
              </select>
              
    </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Title</label>
              <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" placeholder="e.g. Vitamin D Drops" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              
    </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Time</label>
              <input type="time" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" value={newTime.replace(/ [AP]M/, '')} onChange={e => {
                const [h, m] = e.target.value.split(':');
                const hour = parseInt(h);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const formattedHour = hour % 12 || 12;
                setNewTime(`${formattedHour.toString().padStart(2, '0')}:${m} ${ampm}`);
              }} />
              
    </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-3 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">Save</button>
              
    </div>
            
    </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {reminders.length > 0 ? reminders.map(notif => (
          <motion.div key={notif.id} className="bg-card p-6 rounded-[32px] shadow-sm border border-white flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm">
                {getTypeIcon(notif.type)}
                
    </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{notif.title}</p>
                <div className="flex items-center gap-2 text-muted mt-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{notif.time}</span>
                  
    </div>
                
    </div>
              
    </div>
            <button 
              onClick={() => {
                setReminders(reminders.map(r => r.id === notif.id ? { ...r, active: !r.active } : r));
              }}
              className={`w-12 h-6 rounded-full relative transition-colors ${notif.active ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${notif.active ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </motion.div>
        )) : (
          <p className="text-center text-gray-400 text-sm italic mt-10">No reminders set.</p>
        )}
        
    </div>
      
    </div>
  );
};


