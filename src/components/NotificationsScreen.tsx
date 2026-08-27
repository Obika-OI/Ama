import React, { useEffect } from 'react';
import { ChevronLeft, Bell, CheckCircle2, Info, AlertCircle, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NotificationsScreen = ({ 
  onBack,
  notifications,
  setNotifications
}: { 
  onBack: () => void;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}) => {
  useEffect(() => {
    // Mark all as read when opening notifications screen
    setNotifications(prev => prev.map(n => n.read ? n : { ...n, read: true }));
  }, [setNotifications]);

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-32 space-y-8 bg-background min-h-screen">
      <header className="flex justify-between items-center pt-3 sm:pt-4 pb-2 px-1">
        <button onClick={onBack} className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-800 hover:scale-105 transition-transform cursor-pointer border-none">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-serif font-black text-gray-800">Notifications</h1>
        {notifications.length > 0 ? (
          <button onClick={clearAll} className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer border-none">
            Clear
          </button>
        ) : (
          <div className="w-11" />
        )}
      </header>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div key={notif.id} className={`bg-card p-6 rounded-[32px] shadow-sm border ${notif.read ? 'border-white' : 'border-primary/20 bg-primary/5'} flex justify-between items-center`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm">
                  🔔
                  
    </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{notif.title}</p>
                  <div className="flex items-center gap-2 text-muted mt-1">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{notif.time}</span>
                    
    </div>
                  
    </div>
                
    </div>
              {!notif.read && <div className="w-3 h-3 bg-primary rounded-full" />}
              
    </div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-sm italic mt-10">No notifications.</p>
        )}
        
    </div>
      
    </div>
  );
};

// Zero-Telemetry symmetric obfuscator for data-at-rest encryption demonstration

