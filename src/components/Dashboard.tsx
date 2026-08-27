import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Utensils, BookOpen, Calendar, Plus, Timer, ChevronRight, Star, AlertCircle,
  Droplet, PlusCircle, Search, Clock, ChevronLeft, Heart, MapPin, Trophy, Bell,
  CheckCircle2, Flame, Sparkles, RefreshCw, Award, Shield, Info, Printer, ShoppingBag,
  Trash2, FileText, Edit3, Copy, RotateCcw, ChevronDown, LogOut, QrCode, Wifi, WifiOff,
  Link, X, Settings, Lock, Crown, ShieldAlert, EyeOff, UserCheck, ShieldCheck, FileCode,
  Dna, Activity as ActivityIcon, Users, Check, HelpCircle, Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_MEALS, THEME, MOCK_ACTIVITIES, MOCK_REMINDERS, QUEST_POOL } from '../constants';
import { Meal, Activity, Reminder } from '../types';
import { TEETH_LIST, LOCAL_REGIONS_DATABASE } from '../constants/babyData';
import { formatCost, calculateBabyAge, drawThreeRandomQuests } from '../utils/helpers';
import { CircularProgress } from './CircularProgress';
import { MoodTracker } from './MoodTracker';
import { VoiceAssistant } from './VoiceAssistant';
import { StorybookGenerator } from './StorybookGenerator';
import { DiaperAnalyzer } from './DiaperAnalyzer';
import { MemorySlideshow } from './MemorySlideshow';
import { LegalConsentModal } from './LegalConsentModal';
import { AppUserGuide } from './AppUserGuide';
import { BabyCryAnalyzer } from './BabyCryAnalyzer';
import { FirebaseUser, model } from '../firebase';

export const Dashboard = ({ 
  onNavigate,
  isPremium,
  setIsSubscriptionModalOpen,
  babyName,
  parentName, 
  fluidMl, 
  fluidTarget,
  currentMood, 
  currentFood,
  scheduledMeals,
  scheduledActivities,
  scheduledMeds,
  setScheduledMeals,
  setScheduledActivities,
  setScheduledMeds,
  activities,
  dailyStreak,
  onToggleActivity,
  currentUser,
  onGoogleSignIn,
  onSignOut,
  isSyncing,
  isOnline,
  babyAge,
  setBabyAge,
  vaccineSchedule = [],
  setVaccineSchedule,
  allMeals = [],
  userRole = 'admin',
  setUserRole
}: { 
  onNavigate: (screen: string, data?: any, autoOpenLog?: boolean) => void; 
  isPremium: boolean;
  setIsSubscriptionModalOpen: (open: boolean) => void;
  babyName: string;
  parentName: string;
  fluidMl: number;
  fluidTarget: number;
  currentMood: string;
  currentFood: string;
  scheduledMeals: any[];
  scheduledActivities: any[];
  scheduledMeds: any[];
  setScheduledMeals: (meals: any[]) => void;
  setScheduledActivities: (acts: any[]) => void;
  setScheduledMeds: (meds: any[]) => void;
  activities: Activity[];
  dailyStreak: number;
  onToggleActivity: (id: string) => void;
  currentUser: FirebaseUser | null;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  isSyncing: boolean;
  isOnline: boolean;
  babyAge: string;
  setBabyAge: (age: string) => void;
  vaccineSchedule?: any[];
  setVaccineSchedule?: (schedule: any[]) => void;
  allMeals?: any[];
  userRole?: 'admin' | 'family' | 'nanny';
  setUserRole?: React.Dispatch<React.SetStateAction<'admin' | 'family' | 'nanny'>>;
}) => {
  const fluidProgress = Math.min(100, (fluidMl / fluidTarget) * 100);
  
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const todayMeals = scheduledMeals.filter(m => !m.date || isSameDay(new Date(m.date), new Date()));
  const todayActivities = scheduledActivities.filter(a => !a.date || isSameDay(new Date(a.date), new Date()));
  const todayMeds = scheduledMeds.filter(m => !m.date || isSameDay(new Date(m.date), new Date()));
  const todayVaccines = (vaccineSchedule || []).filter(v => v.date && isSameDay(new Date(v.date), new Date()));

  const [activeModalType, setActiveModalType] = useState<'menu' | 'activities' | 'meds' | 'immunization' | 'schedule' | null>(null);

  // Quick Inline Scheduler State inside Dashboard Modal
  const [scheduleCategory, setScheduleCategory] = useState<'meal' | 'activity' | 'med' | 'vaccine' | 'routine'>('meal');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleTime, setScheduleTime] = useState('08:00 AM');
  const [scheduleDate, setScheduleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [scheduleMealPeriod, setScheduleMealPeriod] = useState('Breakfast');
  const [scheduleActivityDuration, setScheduleActivityDuration] = useState('15m');
  const [scheduleMedDosage, setScheduleMedDosage] = useState('1 dose');
  const [scheduleVaccineAge, setScheduleVaccineAge] = useState('6 Months');
  const [scheduleVaccineStatus, setScheduleVaccineStatus] = useState('Scheduled');
  const [scheduleRoutineCategory, setScheduleRoutineCategory] = useState('Nap Time');
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [scheduleCalMonth, setScheduleCalMonth] = useState(() => new Date().getMonth());
  const [scheduleCalYear, setScheduleCalYear] = useState(() => new Date().getFullYear());

  const firstDayOfSchedMonth = new Date(scheduleCalYear, scheduleCalMonth, 1).getDay();
  const daysInSchedMonth = new Date(scheduleCalYear, scheduleCalMonth + 1, 0).getDate();
  const handlePrevSchedMonth = () => {
    if (scheduleCalMonth === 0) {
      setScheduleCalMonth(11);
      setScheduleCalYear(scheduleCalYear - 1);
    } else {
      setScheduleCalMonth(scheduleCalMonth - 1);
    }
  };
  const handleNextSchedMonth = () => {
    if (scheduleCalMonth === 11) {
      setScheduleCalMonth(0);
      setScheduleCalYear(scheduleCalYear + 1);
    } else {
      setScheduleCalMonth(scheduleCalMonth + 1);
    }
  };

  const handleCreateScheduleItem = () => {
    const selectedD = new Date(scheduleDate + 'T12:00:00');
    const newPlan = { 
      id: Date.now().toString(), 
      time: scheduleTime, 
      completed: false, 
      date: selectedD.toISOString() 
    };

    if (scheduleCategory === 'meal') {
      const targetId = scheduleTitle || (allMeals && allMeals[0] ? allMeals[0].id : '');
      const selectedMealObj = (allMeals || []).find(m => m.id === targetId) || (allMeals && allMeals[0]);
      if (!selectedMealObj) return;
      setScheduledMeals([...scheduledMeals, { ...newPlan, title: selectedMealObj.title, meal: selectedMealObj, type: scheduleMealPeriod }]);
    } else if (scheduleCategory === 'activity') {
      if (!scheduleTitle.trim()) return;
      setScheduledActivities([...scheduledActivities, { ...newPlan, title: scheduleTitle, duration: scheduleActivityDuration }]);
    } else if (scheduleCategory === 'med') {
      if (!scheduleTitle.trim()) return;
      setScheduledMeds([...scheduledMeds, { ...newPlan, title: scheduleTitle, name: scheduleTitle, dosage: scheduleMedDosage }]);
    } else if (scheduleCategory === 'vaccine') {
      const vName = scheduleTitle.trim() || 'DTaP Booster';
      const newV = {
        id: `v-${Date.now()}`,
        name: vName,
        age: scheduleVaccineAge,
        status: scheduleVaccineStatus,
        date: scheduleDate,
        sideEffects: 'None',
        time: scheduleTime
      };
      if (setVaccineSchedule) {
        setVaccineSchedule([...(vaccineSchedule || []), newV]);
      }
    } else if (scheduleCategory === 'routine') {
      const rName = scheduleTitle.trim() || scheduleRoutineCategory;
      setScheduledActivities([...scheduledActivities, { ...newPlan, title: rName, duration: scheduleActivityDuration, isRoutine: true, category: 'Routine' }]);
    }

    setScheduleTitle('');
    setScheduleSuccessMsg('Plan added to calendar successfully!');
    setTimeout(() => {
      setScheduleSuccessMsg('');
      setShowAddForm(false);
    }, 1500);
  };

  const estimatedCalories = todayMeals.reduce((acc, m) => {
    const hasEnergy = m.nutrients?.find((n: any) => n.label === 'Energy' || n.label === 'Calories');
    if (hasEnergy?.value === 'High') return acc + 250;
    if (hasEnergy?.value === 'Good') return acc + 150;
    return acc + 100;
  }, 0);

  const estimatedProtein = todayMeals.reduce((acc, m) => {
    const hasProtein = m.nutrients?.find((n: any) => n.label === 'Protein');
    if (hasProtein?.value === 'High') return acc + 15;
    if (hasProtein?.value === 'Good') return acc + 8;
    if (hasProtein?.value === 'Source') return acc + 4;
    return acc + 2;
  }, 0);

  const currentDateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  // Growth Quests metrics
  const completedCount = activities.filter(a => a.isCompleted).length;
  const totalCount = activities.length;
  const questProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-32 space-y-8 sm:space-y-10 bg-background min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 sm:pt-4 pb-2 px-1 overflow-visible">
        <div className="space-y-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-800 tracking-tight truncate">Hello, {parentName}!</h1>
          {/* User Role Badge (Unclickable & Below User Name) */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border select-none w-fit bg-amber-50 text-amber-800 border-amber-200/80">
            <span className="text-xs">{userRole === 'admin' ? '👑' : userRole === 'family' ? '🏡' : '🧸'}</span>
            <span className="font-bold">{userRole === 'admin' ? 'Parent (Admin)' : userRole === 'family' ? 'Family Circle' : 'Caregiver'}</span>
            
    </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{currentDateStr}</p>
              
    </div>
            {isOnline ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-600 border border-green-200">
                <Wifi className="w-2.5 h-2.5" />
                <span>Sync Active</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200 animate-pulse">
                <WifiOff className="w-2.5 h-2.5" />
                <span>Offline Queue</span>
              </span>
            )}
            
    </div>
          
    </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap pt-1">
          {currentUser && !currentUser.isAnonymous ? (
            <div className="flex items-center gap-2">
              {isSyncing && (
                <span className="text-[9px] font-bold text-primary animate-pulse uppercase tracking-wider mr-1">
                  Syncing...
                </span>
              )}
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || 'User'} 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-md object-cover cursor-pointer hover:opacity-80 active:scale-95 transition-all shrink-0"
                  onClick={onSignOut}
                  title="Signed in with Google. Click to Sign Out."
                />
              ) : (
                <button
                  onClick={onSignOut}
                  className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full text-xs font-bold text-red-500 transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
                  title="Click to Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
              
    </div>
          ) : (
            <div className="flex items-center gap-2">
              {currentUser?.isAnonymous && isSyncing && (
                <span className="text-[9px] font-bold text-gray-400 animate-pulse uppercase tracking-wider mr-1">
                  Saving...
                </span>
              )}
              <button
                onClick={onGoogleSignIn}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-primary to-accent text-white shadow-md hover:shadow-lg rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
                title="Google Backup: Link your anonymous account to Cloud Storage"
              >
                <Shield className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>Cloud Backup</span>
              </button>
              
    </div>
          )}

          <button 
            onClick={() => onNavigate('notifications')}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-md shadow-gray-100/80 flex items-center justify-center relative group active:scale-95 transition-all cursor-pointer border border-white shrink-0"
            title="System Notifications"
          >
            <Bell className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white shadow-xs" />
          </button>

          <button 
            onClick={() => onNavigate('settings')}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-md shadow-gray-100/80 flex items-center justify-center relative group active:scale-95 transition-all cursor-pointer border border-white shrink-0"
            title="Compliance & Settings"
          >
            <Settings className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
          </button>
          
    </div>
      </header>

      {/* Fluid Intake Overview Card */}
      <motion.div 
        whileHover={{ y: -2 }}
        onClick={() => onNavigate('feeding')}
        className="bg-card p-6 sm:p-8 rounded-[40px] shadow-xl shadow-card/20 border border-white flex flex-col sm:flex-row items-center justify-between gap-6 cursor-pointer group relative overflow-hidden text-left"
      >
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <CircularProgress progress={fluidProgress} size={110} strokeWidth={9} color={THEME.primary}>
              <div className="text-3xl">💧</div>
            </CircularProgress>
            
    </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[9px] font-black text-primary uppercase tracking-widest">Daily Hydration Goal: {fluidTarget} ml</p>
              
    </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-800">
              {fluidMl} <span className="text-gray-400 text-base font-sans font-bold">/ {fluidTarget} ml</span>
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              {fluidProgress >= 100 ? '🎉 Daily hydration target achieved!' : `${Math.max(0, fluidTarget - fluidMl)} ml remaining today • Tap to log fluids`}
            </p>
            
    </div>
          
    </div>
      </motion.div>

      <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          onClick={() => onNavigate('sleep')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-card p-6 rounded-[32px] shadow-sm border border-white flex flex-col items-center justify-center cursor-pointer group gap-2"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
            🧸
            
    </div>
          <div className="text-center">
            <p className="text-sm font-black text-gray-800">Activity</p>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest">Tracker</p>
            
    </div>
        </motion.div>

        <motion.div 
          onClick={() => onNavigate('reminders')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-card p-6 rounded-[32px] shadow-sm border border-white flex flex-col items-center justify-center cursor-pointer group gap-2"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
            🔔
            
    </div>
          <div className="text-center">
            <p className="text-sm font-black text-gray-800">Reminders</p>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest">Alarms</p>
            
    </div>
        </motion.div>

        <motion.div 
          onClick={() => onNavigate('recipes')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-card p-6 rounded-[32px] shadow-sm border border-white flex flex-col items-center justify-center cursor-pointer group gap-2"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
            📖
            
    </div>
          <div className="text-center">
            <p className="text-sm font-black text-gray-800">Recipe</p>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest">Library</p>
            
    </div>
        </motion.div>

        <motion.div 
          onClick={() => onNavigate('journal', { tab: 'diary' })}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-card p-6 rounded-[32px] shadow-sm border border-white flex flex-col items-center justify-center cursor-pointer group gap-2"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
            ✍️
            
    </div>
          <div className="text-center">
            <p className="text-sm font-black text-gray-800">Daily</p>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest">Diary</p>
            
    </div>
        </motion.div>
      </section>

      {/* AI Intelligence & AI Suite */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
              
    </div>
            <div>
              <h2 className="text-xl font-serif font-black text-gray-800">AI Suite</h2>
              <p className="text-xs text-gray-400 font-medium">Smart acoustic cry analyzer & localized weekly meal planning</p>
              
    </div>
            
    </div>
          <span className="text-[9px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
            Powered by AI
          </span>
          
    </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Baby Cry Analyzer Card */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => isPremium ? onNavigate('sleep') : setIsSubscriptionModalOpen(true)}
            className="bg-card p-6 rounded-[36px] border border-white shadow-xl shadow-card/15 cursor-pointer group space-y-4 text-left relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🎙️
                
    </div>
              <span className="text-[8px] font-black text-amber-700 bg-amber-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-500/20">
                Acoustic Analysis
              </span>
              
    </div>
            <div className="space-y-1">
              <h3 className="text-base font-serif font-black text-gray-800">Baby Cry Reason Analyzer</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Listens to your baby's cry and correlates audio with time since last feeding & nap to analyze comfort needs.
              </p>
              
    </div>
            <div className="pt-1 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:text-amber-700">
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" /> Start Cry Analysis
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              
    </div>
          </motion.div>

          {/* AI Weekly Meal & Grocery Planner Card */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => isPremium ? onNavigate('ai-meal-planner') : setIsSubscriptionModalOpen(true)}
            className="bg-card p-6 rounded-[36px] border border-white shadow-xl shadow-card/15 cursor-pointer group space-y-4 text-left relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🥗
                
    </div>
              <span className="text-[8px] font-black text-emerald-700 bg-emerald-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-500/20">
                Localized Groceries
              </span>
              
    </div>
            <div className="space-y-1">
              <h3 className="text-base font-serif font-black text-gray-800">AI Weekly Meal & Grocery Plan</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Generates a complete 7-day age-optimized solid food menu that targets nutritional gaps with an automated local grocery checklist.
              </p>
              
    </div>
            <div className="pt-1 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Build 7-Day Plan
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              
    </div>
          </motion.div>
          
    </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 px-2">
          <div>
            <h2 className="text-xl font-serif font-black text-gray-800">Plan for Today</h2>
            <p className="text-xs text-gray-400 font-medium">Daily schedule, meals, activities, medications & vaccines</p>
            
    </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setActiveModalType('schedule');
                setShowAddForm(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border border-primary/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Plan</span>
            </button>
            <button 
              onClick={() => onNavigate('journal', { tab: 'daily' })}
              className="text-[10px] text-gray-500 hover:text-primary font-black uppercase tracking-widest hover:underline cursor-pointer border-none bg-transparent py-1.5 px-2"
            >
              Calendar & Journal →
            </button>
            
    </div>
          
    </div>

        {/* Estimated Nutrition Card - System Card Styling */}
        <motion.div 
          whileHover={{ y: -2 }}
          onClick={() => onNavigate('feeding')}
          className="bg-card p-6 sm:p-7 rounded-[40px] shadow-xl shadow-card/20 border border-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 cursor-pointer group relative overflow-hidden text-left"
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition-transform shrink-0">
              🍎
              
    </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-700 rounded-full border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <p className="text-[9px] font-black uppercase tracking-widest">
                  Daily Intake • {todayMeals.length} Scheduled {todayMeals.length === 1 ? 'Meal' : 'Meals'}
                </p>
                
    </div>
              <h3 className="text-xl font-serif font-black text-gray-800">Estimated Nutrition</h3>
              <p className="text-xs text-gray-500 font-medium">
                {todayMeals.length > 0 ? 'Calculated from planned meals & feedings for today' : 'No meals scheduled yet today • Tap to open feeding tracker'}
              </p>
              
    </div>
            
    </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
            <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-xs text-center min-w-[85px]">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Energy</p>
              <p className="text-base font-black text-amber-600 leading-tight mt-0.5">
                {estimatedCalories} <span className="text-[10px] text-gray-400 font-bold uppercase">kcal</span>
              </p>
              
    </div>
            <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-xs text-center min-w-[85px]">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Protein</p>
              <p className="text-base font-black text-primary leading-tight mt-0.5">
                {estimatedProtein}g <span className="text-[10px] text-gray-400 font-bold uppercase">protein</span>
              </p>
              
    </div>
            <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-xs text-center min-w-[85px]">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Completed</p>
              <p className="text-base font-black text-gray-800 leading-tight mt-0.5">
                {todayMeals.filter(m => m.completed).length} <span className="text-[10px] text-gray-400 font-bold">/ {todayMeals.length}</span>
              </p>
              
    </div>
            
    </div>
        </motion.div>

        {/* 4 Plan for Today Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <motion.div 
            onClick={() => onNavigate('journal', { tab: 'daily', openAddPlan: true, planType: 'meal' })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-card p-5 sm:p-6 rounded-[32px] shadow-sm border border-white flex items-center justify-between cursor-pointer group hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform shrink-0">
                🍽️
                
    </div>
              <div>
                <p className="text-sm font-black text-gray-800">Daily Menu</p>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">
                  {todayMeals.length > 0 ? `${todayMeals.filter(m => m.completed).length}/${todayMeals.length} Done` : '+ Tap to Schedule'}
                </p>
                
    </div>
              
    </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
          </motion.div>

          <motion.div 
            onClick={() => onNavigate('journal', { tab: 'daily', openAddPlan: true, planType: 'activity' })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-card p-5 sm:p-6 rounded-[32px] shadow-sm border border-white flex items-center justify-between cursor-pointer group hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform shrink-0">
                🧸
                
    </div>
              <div>
                <p className="text-sm font-black text-gray-800">Activities Plan</p>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">
                  {todayActivities.length > 0 ? `${todayActivities.filter(a => a.completed).length}/${todayActivities.length} Tracked` : '+ Tap to Schedule'}
                </p>
                
    </div>
              
    </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
          </motion.div>

          <motion.div 
            onClick={() => onNavigate('journal', { tab: 'daily', openAddPlan: true, planType: 'med' })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-card p-5 sm:p-6 rounded-[32px] shadow-sm border border-white flex items-center justify-between cursor-pointer group hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform shrink-0">
                💊
                
    </div>
              <div>
                <p className="text-sm font-black text-gray-800">Medication Plan</p>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">
                  {todayMeds.length > 0 ? `${todayMeds.filter(m => m.completed).length}/${todayMeds.length} Taken` : '+ Tap to Schedule'}
                </p>
                
    </div>
              
    </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
          </motion.div>

          <motion.div 
            onClick={() => onNavigate('journal', { tab: 'daily', openAddPlan: true, planType: 'vaccine' })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-card p-5 sm:p-6 rounded-[32px] shadow-sm border border-white flex items-center justify-between cursor-pointer group hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform shrink-0">
                💉
                
    </div>
              <div>
                <p className="text-sm font-black text-gray-800">Immunization</p>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">
                  {todayVaccines.length > 0 
                    ? `${todayVaccines.filter(v => v.status === 'Completed').length}/${todayVaccines.length} Today`
                    : (vaccineSchedule || []).length > 0
                    ? `${(vaccineSchedule || []).filter(v => v.status === 'Completed').length}/${(vaccineSchedule || []).length} Up to Date`
                    : '+ Tap to Schedule'}
                </p>
                
    </div>
              
    </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
          </motion.div>
          
    </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-xl font-serif font-black text-gray-800">Growth Activities (Daily Quests)</h2>
          <button 
            onClick={() => onNavigate('activities')}
            className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline"
          >
            View Quests
          </button>
          
    </div>

        <div className="bg-card p-8 rounded-[56px] border border-white shadow-xl shadow-card/20 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-3xl shadow-md">🌱</div>
              <div>
                <h3 className="text-lg font-black text-gray-800">Daily Quest Progress</h3>
                <p className="text-[10px] text-muted font-black uppercase tracking-widest">
                  {completedCount} of {totalCount} Quests completed
                </p>
                
    </div>
              
    </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xl font-serif font-black text-primary">{Math.round(questProgress)}%</span>
              {dailyStreak > 0 && (
                <div className="flex items-center gap-0.5 bg-amber-500/15 text-amber-600 px-2 py-0.5 rounded-full animate-pulse border border-amber-500/10">
                  <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span className="text-[8px] font-black uppercase tracking-wider">{dailyStreak}d Streak</span>
                  
    </div>
              )}
              
    </div>
            
    </div>

          <div className="w-full bg-gray-100 rounded-full h-3 p-0.5 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${questProgress}%` }}
              className="bg-accent h-full rounded-full shadow-sm" 
            />
            
    </div>
          
    </div>
      </section>

      {/* Interactive Calendar Scheduling & Checklist Bottom-Sheet Modal */}
      <AnimatePresence>
        {activeModalType && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalType(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-white rounded-t-[48px] p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto z-10 border-t border-white"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto" />
              
              {/* Category Selector Tabs */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                  {[
                    { type: 'menu', label: 'Menu', icon: '🍽️' },
                    { type: 'activities', label: 'Activities', icon: '🧸' },
                    { type: 'meds', label: 'Meds', icon: '💊' },
                    { type: 'immunization', label: 'Vaccines', icon: '💉' },
                    { type: 'schedule', label: '+ Schedule', icon: '📅' }
                  ].map((tab) => (
                    <button
                      key={tab.type}
                      onClick={() => {
                        setActiveModalType(tab.type as any);
                        if (tab.type === 'schedule') {
                          setShowAddForm(true);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                        activeModalType === tab.type 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <span>{tab.icon} {tab.label}</span>
                    </button>
                  ))}
                  
    </div>
                <button 
                  onClick={() => setActiveModalType(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer border-none shrink-0 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
                
    </div>

              {/* Modal Title Banner */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-800">
                    {activeModalType === 'menu' && "Today's Meal Plan"}
                    {activeModalType === 'activities' && "Today's Activities Plan"}
                    {activeModalType === 'meds' && "Today's Medications Plan"}
                    {activeModalType === 'immunization' && "Immunization & Vaccine Schedule"}
                    {activeModalType === 'schedule' && "Schedule Plan for Calendar"}
                  </h2>
                  <p className="text-[10px] text-muted font-black uppercase tracking-widest">
                    {activeModalType === 'schedule' ? 'Add new schedule item to calendar' : 'Track and manage scheduled plans'}
                  </p>
                  
    </div>
                {activeModalType !== 'schedule' && (
                  <button
                    onClick={() => {
                      setScheduleCategory(activeModalType === 'menu' ? 'meal' : activeModalType === 'activities' ? 'activity' : activeModalType === 'meds' ? 'med' : 'vaccine');
                      setShowAddForm(!showAddForm);
                    }}
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all cursor-pointer border border-primary/20"
                  >
                    {showAddForm ? 'Hide Form' : '+ Add Item'}
                  </button>
                )}
                
    </div>

              {/* Schedule Plan Floating Interactive Calendar & Form */}
              {(showAddForm || activeModalType === 'schedule') && (
                <div className="space-y-4">
                  {/* Floating Calendar - Exact Pink, Blue & Gray Theme of Journal Calendar */}
                  <div className="bg-card p-5 sm:p-6 rounded-[36px] shadow-xl shadow-card/20 border border-white space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-primary shadow-xs">
                          <Calendar className="w-4 h-4" />
                          
    </div>
                        <div>
                          <h2 className="text-xs font-black text-gray-800 uppercase tracking-[0.2em]">
                            {new Date(scheduleCalYear, scheduleCalMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </h2>
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Tap a day to set target schedule date</p>
                          
    </div>
                        
    </div>
                      <div className="flex items-center gap-1">
                        <button 
                          type="button"
                          onClick={handlePrevSchedMonth} 
                          className="p-1.5 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-white/60 transition-colors cursor-pointer border-none bg-transparent"
                          title="Previous Month"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={handleNextSchedMonth} 
                          className="p-1.5 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-white/60 transition-colors cursor-pointer border-none bg-transparent"
                          title="Next Month"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        
    </div>
                      
    </div>

                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</div>
                      ))}
                      
    </div>

                    {/* Days Matrix */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
                      {Array.from({ length: firstDayOfSchedMonth }).map((_, i) => <div key={`empty-sched-${i}`} className="w-8 h-8 sm:w-9 sm:h-9 mx-auto" />)}
                      {Array.from({ length: daysInSchedMonth }).map((_, i) => {
                        const date = new Date(scheduleCalYear, scheduleCalMonth, i + 1);
                        const dateISO = `${scheduleCalYear}-${String(scheduleCalMonth + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
                        const isSelected = scheduleDate === dateISO;
                        const isToday = isSameDay(date, new Date());
                        const hasScheduledItems = (
                          scheduledMeals.some(m => m.date && isSameDay(new Date(m.date), date)) ||
                          scheduledActivities.some(a => a.date && isSameDay(new Date(a.date), date)) ||
                          scheduledMeds.some(md => md.date && isSameDay(new Date(md.date), date)) ||
                          (vaccineSchedule || []).some(v => v.date && isSameDay(new Date(v.date), date))
                        );

                        return (
                          <button 
                            key={i}
                            type="button"
                            onClick={() => { 
                              setScheduleDate(dateISO);
                            }}
                            className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer border-none relative ${
                              isSelected ? 'bg-primary text-white shadow-md scale-110 font-black' : 
                              isToday ? 'bg-white/80 text-primary border border-primary/30 font-extrabold' : 'text-gray-600 hover:bg-white/60 bg-transparent'
                            }`}
                          >
                            <span>{i + 1}</span>
                            {hasScheduledItems && (
                              <span className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 ${isSelected ? 'bg-amber-300' : 'bg-primary'}`} />
                            )}
                          </button>
                        );
                      })}
                      
    </div>

                    {/* Selected Date Summary & Quick Jump Chips */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/60">
                      <span className="text-[10px] font-bold text-gray-600">
                        Date: <strong className="text-gray-800 font-black">
                          {new Date(scheduleDate + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </strong>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                            setScheduleDate(todayISO);
                            setScheduleCalMonth(now.getMonth());
                            setScheduleCalYear(now.getFullYear());
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                            scheduleDate === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'bg-white/80 text-gray-700 border-white hover:bg-white'
                          }`}
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            const tomorrowISO = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
                            setScheduleDate(tomorrowISO);
                            setScheduleCalMonth(tomorrow.getMonth());
                            setScheduleCalYear(tomorrow.getFullYear());
                          }}
                          className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer border bg-white/80 text-gray-700 border-white hover:bg-white transition-all"
                        >
                          Tomorrow
                        </button>
                        
    </div>
                      
    </div>
                    
    </div>

                  {/* Inline Schedule New Item Form */}
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-card p-5 rounded-[28px] border border-white shadow-md space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>New Scheduled Item</span>
                      </p>
                      {scheduleSuccessMsg && (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full animate-bounce">
                          ✓ {scheduleSuccessMsg}
                        </span>
                      )}
                      
    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Category</label>
                        <select 
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800"
                          value={scheduleCategory} 
                          onChange={e => setScheduleCategory(e.target.value as any)}
                        >
                          <option value="meal">🍽️ Meal</option>
                          <option value="activity">🧸 Activity & Play</option>
                          <option value="med">💊 Medication</option>
                          <option value="vaccine">💉 Immunization (Vaccine)</option>
                          <option value="routine">✨ Daily Routine / Care</option>
                        </select>
                        
    </div>

                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Selected Date</label>
                        <input 
                          type="date"
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800"
                          value={scheduleDate}
                          onChange={e => {
                            setScheduleDate(e.target.value);
                            if (e.target.value) {
                              const d = new Date(e.target.value + 'T12:00:00');
                              setScheduleCalMonth(d.getMonth());
                              setScheduleCalYear(d.getFullYear());
                            }
                          }}
                        />
                        
    </div>
                      
    </div>

                  {/* Dynamic Category Specific Inputs */}
                  {scheduleCategory === 'meal' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Meal Period</label>
                        <select 
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800"
                          value={scheduleMealPeriod}
                          onChange={e => setScheduleMealPeriod(e.target.value)}
                        >
                          <option>Breakfast</option>
                          <option>Lunch</option>
                          <option>Dinner</option>
                          <option>Snack</option>
                        </select>
                        
    </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Select Recipe</label>
                        <select 
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800"
                          value={scheduleTitle}
                          onChange={e => setScheduleTitle(e.target.value)}
                        >
                          <option value="">Choose a recipe</option>
                          {(allMeals || []).map(m => (
                            <option key={m.id} value={m.id}>{m.title}</option>
                          ))}
                        </select>
                        
    </div>
                      
    </div>
                  )}

                  {scheduleCategory === 'activity' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Activity Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Tummy Time"
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800"
                          value={scheduleTitle}
                          onChange={e => setScheduleTitle(e.target.value)}
                        />
                        
    </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Duration</label>
                        <select 
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800"
                          value={scheduleActivityDuration}
                          onChange={e => setScheduleActivityDuration(e.target.value)}
                        >
                          <option>5m</option>
                          <option>10m</option>
                          <option>15m</option>
                          <option>30m</option>
                          <option>45m</option>
                          <option>1h</option>
                        </select>
                        
    </div>
                      
    </div>
                  )}

                  {scheduleCategory === 'med' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Medication Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Vitamin D3 Drops"
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800"
                          value={scheduleTitle}
                          onChange={e => setScheduleTitle(e.target.value)}
                        />
                        
    </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Dosage</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 1 drop, 5ml"
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800"
                          value={scheduleMedDosage}
                          onChange={e => setScheduleMedDosage(e.target.value)}
                        />
                        
    </div>
                      
    </div>
                  )}

                  {scheduleCategory === 'vaccine' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Vaccine Name</label>
                        <select 
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800"
                          value={scheduleTitle}
                          onChange={e => setScheduleTitle(e.target.value)}
                        >
                          <option value="BCG (Tuberculosis)">BCG (Tuberculosis)</option>
                          <option value="Hepatitis B (HepB)">Hepatitis B (HepB)</option>
                          <option value="Oral Polio Vaccine (OPV)">Oral Polio Vaccine (OPV)</option>
                          <option value="Pentavalent (DTaP + HepB + Hib)">Pentavalent (DTaP + HepB + Hib)</option>
                          <option value="Rotavirus (RV)">Rotavirus (RV)</option>
                          <option value="Pneumococcal (PCV13)">Pneumococcal Conjugate (PCV13)</option>
                          <option value="Inactivated Polio (IPV)">Inactivated Polio (IPV)</option>
                          <option value="Measles & Rubella (MR)">Measles & Rubella (MR)</option>
                          <option value="MMR (Measles, Mumps, Rubella)">MMR (Measles, Mumps, Rubella)</option>
                          <option value="Varicella (Chickenpox)">Varicella (Chickenpox)</option>
                          <option value="Hepatitis A (HepA)">Hepatitis A (HepA)</option>
                          <option value="Yellow Fever Vaccine">Yellow Fever Vaccine</option>
                          <option value="Typhoid Conjugate Vaccine (TCV)">Typhoid Conjugate (TCV)</option>
                          <option value="Meningococcal ACWY">Meningococcal ACWY</option>
                          <option value="Influenza (Flu Shot)">Influenza (Flu Shot)</option>
                        </select>
                        
    </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Milestone Age</label>
                        <select 
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800"
                          value={scheduleVaccineAge}
                          onChange={e => setScheduleVaccineAge(e.target.value)}
                        >
                          <option>Birth</option>
                          <option>2 Months</option>
                          <option>4 Months</option>
                          <option>6 Months</option>
                          <option>9 Months</option>
                          <option>12 Months</option>
                          <option>15 Months</option>
                          <option>18 Months</option>
                          <option>2 Years</option>
                        </select>
                        
    </div>
                      
    </div>
                  )}

                  {scheduleCategory === 'routine' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Routine Category</label>
                        <select 
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800"
                          value={scheduleRoutineCategory}
                          onChange={e => setScheduleRoutineCategory(e.target.value)}
                        >
                          <option>Nap Time</option>
                          <option>Bath Time</option>
                          <option>Diaper & Skin Care</option>
                          <option>Bedtime Wind-Down</option>
                          <option>Outdoor Fresh Air Stroll</option>
                          <option>Tummy Time & Stretches</option>
                        </select>
                        
    </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Target Duration</label>
                        <select 
                          className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800"
                          value={scheduleActivityDuration}
                          onChange={e => setScheduleActivityDuration(e.target.value)}
                        >
                          <option>15m</option>
                          <option>30m</option>
                          <option>45m</option>
                          <option>1h</option>
                          <option>2h</option>
                        </select>
                        
    </div>
                      
    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Time</label>
                      <input 
                        type="time" 
                        className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800"
                        defaultValue="08:00"
                        onChange={e => {
                          const [h, m] = e.target.value.split(':');
                          const hour = parseInt(h);
                          const ampm = hour >= 12 ? 'PM' : 'AM';
                          const formattedHour = hour % 12 || 12;
                          setScheduleTime(`${formattedHour.toString().padStart(2, '0')}:${m} ${ampm}`);
                        }}
                      />
                      
    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={handleCreateScheduleItem}
                        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-primary/20 transition-all cursor-pointer border-none"
                      >
                        + Add to Plan
                      </button>
                      
    </div>
                    
    </div>
                </motion.div>
                  
    </div>
              )}

              {/* Category Items List */}
              <div className="space-y-3">
                {activeModalType === 'menu' && (
                  todayMeals.length > 0 ? (
                    todayMeals.map((scheduled) => (
                      <div key={scheduled.id} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🍲</span>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{scheduled.meal?.title || scheduled.title}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{scheduled.type} • {scheduled.time}</p>
                            
    </div>
                          
    </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              onNavigate('recipe-detail', scheduled.meal || { title: scheduled.title, id: scheduled.id }, true);
                              setActiveModalType(null);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[10px] font-bold text-gray-600 hover:text-primary"
                          >
                            Recipe
                          </button>
                          <button 
                            onClick={() => {
                              const updated = scheduledMeals.map(m => m.id === scheduled.id ? { ...m, completed: !m.completed } : m);
                              setScheduledMeals(updated);
                            }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${scheduled.completed ? 'bg-green-500 text-white shadow-md shadow-green-100' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          
    </div>
                        
    </div>
                    ))
                  ) : (
                    <div 
                      onClick={() => {
                        setScheduleCategory('meal');
                        setShowAddForm(true);
                      }}
                      className="text-center py-6 px-4 bg-gray-50/80 hover:bg-primary/5 rounded-2xl border border-dashed border-gray-200 hover:border-primary/40 transition-all cursor-pointer group"
                    >
                      <p className="text-sm text-gray-600 font-medium group-hover:text-primary transition-colors">No meals scheduled for today yet.</p>
                      <p className="text-[10px] text-primary font-bold mt-1.5 flex items-center justify-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Tap to schedule a meal now
                      </p>
                      
    </div>
                  )
                )}

                {activeModalType === 'activities' && (
                  todayActivities.length > 0 ? (
                    todayActivities.map((scheduled) => {
                      const isCompleted = scheduled.completed;
                      return (
                        <div key={scheduled.id} className="bg-gray-50 p-4 rounded-[28px] border border-gray-100 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">🧸</span>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{scheduled.title}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration: {scheduled.duration} • {scheduled.time}</p>
                                
    </div>
                              
    </div>
                            <button 
                              onClick={() => {
                                const updated = scheduledActivities.map(a => a.id === scheduled.id ? { ...a, completed: !a.completed } : a);
                                setScheduledActivities(updated);
                              }}
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-green-500 text-white shadow-md shadow-green-100' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            
    </div>

                          {/* Interactive tracking metrics */}
                          <div className="bg-white p-3 rounded-2xl space-y-2 border border-gray-100 shadow-inner">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-bold text-gray-500">⚡ Energy</span>
                              <div className="flex gap-1">
                                {['Low', 'Medium', 'High'].map(level => (
                                  <button
                                    key={level}
                                    onClick={() => {
                                      const updated = scheduledActivities.map(a => a.id === scheduled.id ? { ...a, energy: level } : a);
                                      setScheduledActivities(updated);
                                    }}
                                    className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${scheduled.energy === level ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}
                                  >
                                    {level}
                                  </button>
                                ))}
                                
    </div>
                              
    </div>
                            
    </div>
                          
    </div>
                      );
                    })
                  ) : (
                    <div 
                      onClick={() => {
                        setScheduleCategory('activity');
                        setShowAddForm(true);
                      }}
                      className="text-center py-6 px-4 bg-gray-50/80 hover:bg-primary/5 rounded-2xl border border-dashed border-gray-200 hover:border-primary/40 transition-all cursor-pointer group"
                    >
                      <p className="text-sm text-gray-600 font-medium group-hover:text-primary transition-colors">No activities planned for today yet.</p>
                      <p className="text-[10px] text-primary font-bold mt-1.5 flex items-center justify-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Tap to schedule an activity now
                      </p>
                      
    </div>
                  )
                )}

                {activeModalType === 'meds' && (
                  todayMeds.length > 0 ? (
                    todayMeds.map((scheduled) => (
                      <div key={scheduled.id} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💊</span>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{scheduled.name || scheduled.title}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{scheduled.dosage} • {scheduled.time}</p>
                            
    </div>
                          
    </div>
                        <button 
                          onClick={() => {
                            const updated = scheduledMeds.map(m => m.id === scheduled.id ? { ...m, completed: !m.completed } : m);
                            setScheduledMeds(updated);
                          }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${scheduled.completed ? 'bg-green-500 text-white shadow-md shadow-green-100' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        
    </div>
                    ))
                  ) : (
                    <div 
                      onClick={() => {
                        setScheduleCategory('med');
                        setShowAddForm(true);
                      }}
                      className="text-center py-6 px-4 bg-gray-50/80 hover:bg-primary/5 rounded-2xl border border-dashed border-gray-200 hover:border-primary/40 transition-all cursor-pointer group"
                    >
                      <p className="text-sm text-gray-600 font-medium group-hover:text-primary transition-colors">No medications scheduled for today.</p>
                      <p className="text-[10px] text-primary font-bold mt-1.5 flex items-center justify-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Tap to schedule vitamin or medicine
                      </p>
                      
    </div>
                  )
                )}

                {activeModalType === 'immunization' && (
                  <div className="space-y-2.5">
                    {((vaccineSchedule || []).length > 0) ? (
                      (vaccineSchedule || []).map((vac) => (
                        <div key={vac.id} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">💉</span>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{vac.name}</p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Milestone: {vac.age} {vac.date ? `• ${vac.date}` : ''}
                              </p>
                              
    </div>
                            
    </div>
                          <button 
                            onClick={() => {
                              if (setVaccineSchedule) {
                                const newStatus = vac.status === 'Completed' ? 'Scheduled' : 'Completed';
                                const updated = (vaccineSchedule || []).map(v => v.id === vac.id ? { ...v, status: newStatus } : v);
                                setVaccineSchedule(updated);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                              vac.status === 'Completed'
                                ? 'bg-green-500 text-white'
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}
                          >
                            {vac.status === 'Completed' ? '✓ Completed' : 'Mark Done'}
                          </button>
                          
    </div>
                      ))
                    ) : (
                      <div 
                        onClick={() => {
                          setScheduleCategory('vaccine');
                          setShowAddForm(true);
                        }}
                        className="text-center py-6 px-4 bg-gray-50/80 hover:bg-primary/5 rounded-2xl border border-dashed border-gray-200 hover:border-primary/40 transition-all cursor-pointer group"
                      >
                        <p className="text-sm text-gray-600 font-medium group-hover:text-primary transition-colors">No vaccines scheduled.</p>
                        <p className="text-[10px] text-primary font-bold mt-1.5 flex items-center justify-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Tap to schedule a vaccine milestone
                        </p>
                        
    </div>
                    )}
                    
    </div>
                )}

                {activeModalType === 'schedule' && (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Plans for {new Date(scheduleDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {
                          scheduledMeals.filter(m => m.date && isSameDay(new Date(m.date), new Date(scheduleDate + 'T12:00:00'))).length +
                          scheduledActivities.filter(a => a.date && isSameDay(new Date(a.date), new Date(scheduleDate + 'T12:00:00'))).length +
                          scheduledMeds.filter(md => md.date && isSameDay(new Date(md.date), new Date(scheduleDate + 'T12:00:00'))).length +
                          (vaccineSchedule || []).filter(v => v.date && isSameDay(new Date(v.date), new Date(scheduleDate + 'T12:00:00'))).length
                        } Items
                      </span>
                      
    </div>

                    {/* Render scheduled meals for selected date */}
                    {scheduledMeals.filter(m => m.date && isSameDay(new Date(m.date), new Date(scheduleDate + 'T12:00:00'))).map((m) => (
                      <div key={m.id} className="bg-gray-50 p-3.5 rounded-2xl flex items-center justify-between border border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">🍲</span>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{m.meal?.title || m.title}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{m.type || 'Meal'} • {m.time}</p>
                            
    </div>
                          
    </div>
                        <button 
                          onClick={() => {
                            const updated = scheduledMeals.map(item => item.id === m.id ? { ...item, completed: !item.completed } : item);
                            setScheduledMeals(updated);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${m.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        
    </div>
                    ))}

                    {/* Render scheduled activities for selected date */}
                    {scheduledActivities.filter(a => a.date && isSameDay(new Date(a.date), new Date(scheduleDate + 'T12:00:00'))).map((a) => (
                      <div key={a.id} className="bg-gray-50 p-3.5 rounded-2xl flex items-center justify-between border border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">🧸</span>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{a.title}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{a.time} • {a.duration}</p>
                            
    </div>
                          
    </div>
                        <button 
                          onClick={() => {
                            const updated = scheduledActivities.map(item => item.id === a.id ? { ...item, completed: !item.completed } : item);
                            setScheduledActivities(updated);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${a.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        
    </div>
                    ))}

                    {/* Render scheduled meds for selected date */}
                    {scheduledMeds.filter(md => md.date && isSameDay(new Date(md.date), new Date(scheduleDate + 'T12:00:00'))).map((md) => (
                      <div key={md.id} className="bg-gray-50 p-3.5 rounded-2xl flex items-center justify-between border border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">💊</span>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{md.name || md.title}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{md.dosage} • {md.time}</p>
                            
    </div>
                          
    </div>
                        <button 
                          onClick={() => {
                            const updated = scheduledMeds.map(item => item.id === md.id ? { ...item, completed: !item.completed } : item);
                            setScheduledMeds(updated);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${md.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        
    </div>
                    ))}

                    {/* Render scheduled vaccines for selected date */}
                    {(vaccineSchedule || []).filter(v => v.date && isSameDay(new Date(v.date), new Date(scheduleDate + 'T12:00:00'))).map((v) => (
                      <div key={v.id} className="bg-gray-50 p-3.5 rounded-2xl flex items-center justify-between border border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">💉</span>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{v.name}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Milestone: {v.age}</p>
                            
    </div>
                          
    </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${v.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {v.status}
                        </span>
                        
    </div>
                    ))}
                    
    </div>
                )}
                
    </div>

              {/* Navigation Action Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-gray-100">
                <button 
                  onClick={() => {
                    setActiveModalType(null);
                    onNavigate('journal', { tab: 'daily' });
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Open in Full Calendar & Journal →</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  {activeModalType === 'menu' && (
                    <button 
                      onClick={() => {
                        setActiveModalType(null);
                        onNavigate('feeding');
                      }}
                      className="py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer border-none text-center"
                    >
                      🍼 Feeding Tracker →
                    </button>
                  )}
                  {activeModalType === 'activities' && (
                    <button 
                      onClick={() => {
                        setActiveModalType(null);
                        onNavigate('sleep');
                      }}
                      className="py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer border-none text-center"
                    >
                      🧸 Activity Tracker →
                    </button>
                  )}
                  {activeModalType === 'meds' && (
                    <button 
                      onClick={() => {
                        setActiveModalType(null);
                        onNavigate('reminders');
                      }}
                      className="py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer border-none text-center"
                    >
                      🔔 Reminders & Alarms →
                    </button>
                  )}
                  {activeModalType === 'immunization' && (
                    <button 
                      onClick={() => {
                        setActiveModalType(null);
                        onNavigate('sleep');
                      }}
                      className="py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer border-none text-center"
                    >
                      💉 Health & Growth Hub →
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveModalType(null)}
                    className="py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-bold transition-all cursor-pointer border-none text-center col-span-1"
                  >
                    Close
                  </button>
                  
    </div>
                
    </div>
            </motion.div>
            
    </div>
        )}
      </AnimatePresence>
      
    </div>
  );
};


