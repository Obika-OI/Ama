import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Utensils, BookOpen, Calendar, Plus, Timer, ChevronRight, Star, AlertCircle,
  Droplet, PlusCircle, Search, Clock, ChevronLeft, Heart, MapPin, Trophy, Bell,
  CheckCircle2, Flame, Compass, RefreshCw, Award, Shield, Info, Printer, ShoppingBag,
  Trash2, FileText, Edit3, Copy, RotateCcw, ChevronDown, LogOut, QrCode, Wifi, WifiOff,
  Link, X, Settings, Lock, Unlock, Crown, ShieldAlert, EyeOff, UserCheck, ShieldCheck, FileCode,
  Dna, Activity as ActivityIcon, Users, Check, HelpCircle, Mic, MicOff, Video, VideoOff, Volume2, Thermometer, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_MEALS, THEME, MOCK_ACTIVITIES, MOCK_REMINDERS, QUEST_POOL } from '../constants';
import { Meal, Activity, Reminder } from '../types';
import { TEETH_LIST, LOCAL_REGIONS_DATABASE } from '../constants/babyData';
import { formatCost, calculateBabyAge, drawThreeRandomQuests } from '../utils/helpers';
import { CircularProgress } from './CircularProgress';
import { MoodTracker } from './MoodTracker';
import { StorybookGenerator } from './StorybookGenerator';
import { DiaperAnalyzer } from './DiaperAnalyzer';
import { MemorySlideshow } from './MemorySlideshow';
import { LegalConsentModal } from './LegalConsentModal';
import { AppUserGuide } from './AppUserGuide';
import { BabyCryAnalyzer } from './BabyCryAnalyzer';
import { ImmunizationScheduler } from './ImmunizationScheduler';
import { BabyProfileManager } from './BabyProfileManager';
import { BabyProfile } from '../types';
import { FirebaseUser, model } from '../firebase';
import { GlobalLocation, GlobalLocationPickerModal, POPULAR_GLOBAL_LOCATIONS } from './GlobalLocationPickerModal';
import { CaregiverShiftLogger } from './CaregiverShiftLogger';
import { VillageConnectionEntry, VillageRole, extractVillageInviteFromInput } from '../utils/villageSync';

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
  setUserRole,
  babyProfiles = [],
  activeBabyId = '',
  onSelectBaby,
  onAddBaby,
  onUpdateBaby,
  onDeleteBaby,
  loggedMeals = [],
  setLoggedMeals,
  feedingLogs = [],
  setFeedingLogs,
  sleepLogs = [],
  setSleepLogs,
  diaperLogs = [],
  setDiaperLogs,
  setFluidMl,
  observationLogs = [],
  setObservationLogs,
  memories = [],
  setMemories,
  villageConnections = [],
  activeVillageToken = '',
  onSwitchVillage,
  onCreateOwnBabyHub,
  onConnectVillageToken
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
  babyProfiles?: BabyProfile[];
  activeBabyId?: string;
  onSelectBaby?: (babyId: string) => void;
  onAddBaby?: (baby: BabyProfile) => void;
  onUpdateBaby?: (baby: BabyProfile) => void;
  onDeleteBaby?: (babyId: string) => void;
  loggedMeals?: any[];
  setLoggedMeals?: React.Dispatch<React.SetStateAction<any[]>>;
  feedingLogs?: any[];
  setFeedingLogs?: React.Dispatch<React.SetStateAction<any[]>>;
  sleepLogs?: any[];
  setSleepLogs?: React.Dispatch<React.SetStateAction<any[]>>;
  diaperLogs?: any[];
  setDiaperLogs?: React.Dispatch<React.SetStateAction<any[]>>;
  setFluidMl?: React.Dispatch<React.SetStateAction<number>>;
  observationLogs?: any[];
  setObservationLogs?: React.Dispatch<React.SetStateAction<any[]>>;
  memories?: any[];
  setMemories?: React.Dispatch<React.SetStateAction<any[]>>;
  villageConnections?: VillageConnectionEntry[];
  activeVillageToken?: string;
  onSwitchVillage?: (token: string) => void;
  onCreateOwnBabyHub?: (params: { babyName: string; babyDob: string; babyAge: string; avatarEmoji?: string }) => void;
  onConnectVillageToken?: (token: string, role?: VillageRole) => void;
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
  const [currentLocation, setCurrentLocation] = useState<GlobalLocation>(() => {
    const saved = localStorage.getItem('ama_global_location');
    return saved ? JSON.parse(saved) : POPULAR_GLOBAL_LOCATIONS[0];
  });
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Granny Mode (Gender-Neutral, Automatic with Family Circle Access & Full Live Sync)
  const [isElderModeExpanded, setIsElderModeExpanded] = useState<boolean>(userRole === 'family');
  const [elderModeEnabledForRole, setElderModeEnabledForRole] = useState<boolean>(userRole === 'family');
  const [elderVoiceListening, setElderVoiceListening] = useState(false);
  const [elderVoiceInput, setElderVoiceInput] = useState('');
  const [isProcessingElderLog, setIsProcessingElderLog] = useState(false);
  const [elderToast, setElderToast] = useState('');
  const [elderNapStartMs, setElderNapStartMs] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('ama_elder_nap_start');
      const parsed = saved ? parseInt(saved, 10) : NaN;
      return !isNaN(parsed) && parsed > 0 ? parsed : null;
    } catch {
      return null;
    }
  });

  // Multi-Baby & Multi-Role Village Hub Switcher Modal
  const [isVillageSwitcherOpen, setIsVillageSwitcherOpen] = useState(false);
  const [joinVillageInput, setJoinVillageInput] = useState('');
  const [newOwnBabyName, setNewOwnBabyName] = useState('');
  const [newOwnBabyDob, setNewOwnBabyDob] = useState('');
  const [villageModalMsg, setVillageModalMsg] = useState('');

  useEffect(() => {
    if (userRole === 'family') {
      setElderModeEnabledForRole(true);
      setIsElderModeExpanded(true);
    } else {
      setElderModeEnabledForRole(false);
    }
  }, [userRole]);

  const elderDisplayName =
    (currentUser && !currentUser.isAnonymous && (currentUser.displayName || currentUser.email?.split('@')[0])) ||
    parentName ||
    'Granny';

  const showElderFeedback = (msg: string) => {
    setElderToast(msg);
    setTimeout(() => setElderToast(''), 4000);
  };

  const logSyncedFeed = (amountMl = 120, label = 'Bottle Feed (4 oz / 120 ml)') => {
    const now = new Date();
    const newFeed = {
      id: `elder-bottle-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      type: 'Bottle Feed',
      bottleType: 'Milk / Formula',
      title: label,
      amount: amountMl,
      unit: 'ml',
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: now.toLocaleDateString(),
      exactTime: now.toISOString(),
      loggedBy: elderDisplayName
    };
    if (setFeedingLogs) {
      setFeedingLogs(prev => [newFeed, ...(prev || [])]);
    }
    if (setFluidMl) {
      setFluidMl(prev => Math.min((fluidTarget || 1000) + 500, prev + amountMl));
    }
  };

  const logSyncedSleep = (startMs: number, endMs: number, durationMinutes?: number) => {
    const startDate = new Date(startMs);
    const endDate = new Date(endMs);
    const totalMins =
      typeof durationMinutes === 'number' && durationMinutes > 0
        ? Math.round(durationMinutes)
        : Math.max(1, Math.round((endMs - startMs) / 60000));
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const newSleep = {
      id: `elder-sleep-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      start: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      end: endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`,
      quality: '😴',
      timestamp: endDate.toISOString(),
      loggedBy: elderDisplayName
    };
    if (setSleepLogs) {
      setSleepLogs(prev => [newSleep, ...(prev || [])]);
    }
  };

  const logSyncedDiaper = (kind: 'Wet' | 'Dirty' | 'Both' = 'Wet', note?: string) => {
    const now = new Date();
    const newDiaper = {
      id: `elder-diaper-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      date: now.toISOString(),
      type: kind,
      wetIntensity: kind !== 'Dirty' ? 'Medium' : undefined,
      notes: note || `Logged via Granny Mode by ${elderDisplayName}`,
      loggedBy: elderDisplayName
    };
    if (setDiaperLogs) {
      setDiaperLogs(prev => [newDiaper, ...(prev || [])]);
    }
  };

  const logSyncedNote = (title: string, text: string) => {
    const now = new Date();
    const entry = {
      id: `elder-note-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      date: now.toISOString(),
      title,
      mood: '✨ Grateful',
      notes: text,
      category: 'Care Note',
      authorName: elderDisplayName,
      authorRole: userRole,
      isPublic: true,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'diary'
    };
    if (setObservationLogs) {
      setObservationLogs(prev => [entry, ...(prev || [])]);
    }
  };

  const handleElderQuickFeed = () => {
    logSyncedFeed(120, 'Bottle Feed (4 oz / 120 ml)');
    showElderFeedback(`🍼 Feed logged & synced for ${babyName}: 120 ml (4 oz) bottle!`);
  };

  const handleElderQuickNap = () => {
    if (!elderNapStartMs) {
      const nowMs = Date.now();
      setElderNapStartMs(nowMs);
      try {
        localStorage.setItem('ama_elder_nap_start', String(nowMs));
      } catch {}
      const startTimeStr = new Date(nowMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      showElderFeedback(`😴 Nap timer started for ${babyName} at ${startTimeStr}. Tap again when ${babyName} wakes up!`);
    } else {
      const nowMs = Date.now();
      logSyncedSleep(elderNapStartMs, nowMs);
      setElderNapStartMs(null);
      try {
        localStorage.removeItem('ama_elder_nap_start');
      } catch {}
      showElderFeedback(`😴 Nap ended & synced to ${babyName}'s Sleep Tracker!`);
    }
  };

  const handleElderQuickDiaper = () => {
    logSyncedDiaper('Wet');
    showElderFeedback(`🚼 Fresh diaper change logged & synced for ${babyName}!`);
  };

  const processElderTranscript = async (transcriptText: string) => {
    const clean = transcriptText.trim();
    if (!clean) return;
    setIsProcessingElderLog(true);
    try {
      const res = await fetch('/api/omugwo/voice-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: clean,
          babyName,
          caregiverName: elderDisplayName
        })
      });
      if (res.ok) {
        const data = await res.json();
        const p = data?.parsed;
        if (p) {
          if (p.actionType === 'feed_bottle') {
            logSyncedFeed(Number(p.amountMl) || 90, p.title || 'Bottle Feed');
          } else if (p.actionType === 'feed_breast') {
            const now = new Date();
            if (setFeedingLogs) {
              setFeedingLogs(prev => [
                {
                  id: `elder-nursing-${Date.now()}`,
                  type: 'Nursing Session',
                  leftDuration: (Number(p.durationMinutes) || 15) * 30,
                  rightDuration: (Number(p.durationMinutes) || 15) * 30,
                  timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                  date: now.toLocaleDateString(),
                  exactTime: now.toISOString(),
                  loggedBy: elderDisplayName
                },
                ...(prev || [])
              ]);
            }
          } else if (p.actionType === 'sleep') {
            const mins = Number(p.durationMinutes) || 45;
            const endMs = Date.now();
            logSyncedSleep(endMs - mins * 60000, endMs, mins);
          } else if (p.actionType === 'diaper') {
            const dtype = p.diaperType === 'dirty' ? 'Dirty' : p.diaperType === 'both' ? 'Both' : 'Wet';
            logSyncedDiaper(dtype, p.summaryText || clean);
          } else {
            logSyncedNote(p.title || 'Granny Note', p.summaryText || clean);
          }
          setElderVoiceInput('');
          showElderFeedback(`🎙️ ${p.spokenConfirmation || `Logged & synced: "${clean}"`}`);
          return;
        }
      }
    } catch {}
    finally {
      setIsProcessingElderLog(false);
    }

    // Deterministic offline fallback
    const lower = clean.toLowerCase();
    if (lower.includes('sleep') || lower.includes('nap') || lower.includes('asleep')) {
      const minsMatch = lower.match(/(\d+)\s*(?:min|minute)/);
      const mins = minsMatch ? parseInt(minsMatch[1], 10) : 45;
      const endMs = Date.now();
      logSyncedSleep(endMs - mins * 60000, endMs, mins);
      showElderFeedback(`🎙️ Logged & synced ${mins}m sleep for ${babyName}!`);
    } else if (lower.includes('feed') || lower.includes('milk') || lower.includes('bottle') || lower.includes('oz') || lower.includes('ml') || lower.includes('drank')) {
      const ozMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounce)/);
      const mlMatch = lower.match(/(\d+)\s*ml/);
      const ml = mlMatch ? parseInt(mlMatch[1], 10) : ozMatch ? Math.round(parseFloat(ozMatch[1]) * 30) : 90;
      logSyncedFeed(ml, `Bottle Feed (${ml} ml)`);
      showElderFeedback(`🎙️ Logged & synced ${ml} ml feed for ${babyName}!`);
    } else if (lower.includes('diaper') || lower.includes('nappy') || lower.includes('wet') || lower.includes('poop')) {
      const kind = lower.includes('poop') || lower.includes('dirty') ? 'Dirty' : 'Wet';
      logSyncedDiaper(kind, clean);
      showElderFeedback(`🎙️ Logged & synced ${kind.toLowerCase()} diaper change for ${babyName}!`);
    } else {
      logSyncedNote('Granny Note', clean);
      showElderFeedback(`🎙️ Saved care note to ${babyName}'s journal!`);
    }
    setElderVoiceInput('');
  };

  const handleElderVoiceLog = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.onstart = () => setElderVoiceListening(true);
      rec.onend = () => setElderVoiceListening(false);
      rec.onerror = () => {
        setElderVoiceListening(false);
        showElderFeedback('Microphone unavailable — type your log in the quick bar below.');
      };
      rec.onresult = (evt: any) => {
        const transcript = evt.results?.[0]?.[0]?.transcript || '';
        setElderVoiceListening(false);
        if (transcript) {
          setElderVoiceInput(transcript);
          processElderTranscript(transcript);
        }
      };
      rec.start();
    } else {
      showElderFeedback('Voice microphone is not supported in this browser — type your quick log below!');
    }
  };

  // Synced today counts for Granny Mode live visibility
  const elderTodayFeedsCount = (feedingLogs || []).filter((f) => {
    const d = f?.exactTime ? new Date(f.exactTime) : null;
    return d && !isNaN(d.getTime()) && isSameDay(d, new Date());
  }).length;
  const elderTodaySleepsCount = (sleepLogs || []).filter((s) => {
    const d = s?.timestamp ? new Date(s.timestamp) : null;
    return d && !isNaN(d.getTime()) && isSameDay(d, new Date());
  }).length;
  const elderTodayDiapersCount = (diaperLogs || []).filter((d) => {
    const dt = d?.date ? new Date(d.date) : null;
    return dt && !isNaN(dt.getTime()) && isSameDay(dt, new Date());
  }).length;

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
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-800 tracking-tight truncate">
            Hello, {parentName}!
          </h1>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{currentDateStr}</p>
            </div>
            {/* Global Location Pill */}
            <button
              onClick={() => setIsLocationPickerOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-all cursor-pointer"
            >
              <MapPin className="w-2.5 h-2.5 text-sky-600" />
              <span className="truncate max-w-[120px]">{currentLocation.name.split(',')[0]}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap pt-1">
          {onSwitchVillage && (
            <button
              type="button"
              onClick={() => {
                setVillageModalMsg('');
                setIsVillageSwitcherOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full text-xs font-bold text-emerald-900 transition-all cursor-pointer shrink-0 shadow-2xs"
              title="Switch between your children and joined baby villages"
            >
              <span>🏘️</span>
              <span className="max-w-[110px] truncate">{babyName || 'Care Hub'}</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200">
                {userRole === 'admin' ? 'Parent' : userRole === 'family' ? 'Family' : 'Caregiver'}
              </span>
              {villageConnections.length > 1 && (
                <span className="text-[9px] font-black bg-emerald-700 text-white px-1.5 py-0.5 rounded-full">
                  {villageConnections.length}
                </span>
              )}
            </button>
          )}

          {userRole !== 'family' && (
            <button
              type="button"
              onClick={() => {
                setElderModeEnabledForRole(true);
                setIsElderModeExpanded(true);
              }}
              className="px-3 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-full text-[11px] font-bold text-sky-900 transition-all cursor-pointer shrink-0 hidden sm:flex items-center gap-1.5"
              title="Open simplified one-touch Granny Mode"
            >
              <span>🏡</span>
              <span>Granny Mode</span>
            </button>
          )}

          {babyProfiles && babyProfiles.length > 0 && onSelectBaby && onAddBaby && onUpdateBaby && (
            <BabyProfileManager
              babyProfiles={babyProfiles}
              activeBabyId={activeBabyId}
              onSelectBaby={onSelectBaby}
              onAddBaby={onAddBaby}
              onUpdateBaby={onUpdateBaby}
              onDeleteBaby={onDeleteBaby}
              userRole={userRole}
            />
          )}

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
                  className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full text-xs font-bold text-gray-700 hover:text-primary transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
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
                title="Google Backup: Link your guest session to Cloud Storage"
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

      {/* Granny Mode (Gender-Neutral, Automatic with Family Circle Access, Live Synced) */}
      {(elderModeEnabledForRole || isElderModeExpanded) && (
        isElderModeExpanded ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-sky-50/80 p-6 sm:p-8 rounded-[36px] border-2 border-sky-300 shadow-lg shadow-sky-900/5 space-y-5 text-left"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-200/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-200/80 text-sky-900 flex items-center justify-center text-xl shadow-inner shrink-0">
                  🏡
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-sky-200 text-sky-950 font-sans">
                      Granny Mode • Village Access
                    </span>
                    <span className="text-[10px] font-bold text-sky-800">
                      High-Contrast One-Touch Sync
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-900 mt-0.5">
                    Welcome, {elderDisplayName}!
                  </h2>
                  <p className="text-xs text-gray-700">
                    Easy one-touch buttons and voice/text logging synced live with {babyName}&apos;s feeding, sleep, diaper, and journal trackers.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsElderModeExpanded(false);
                    if (userRole !== 'family') setElderModeEnabledForRole(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-100/70 border border-sky-300 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Switch to Standard View
                </button>
              </div>
            </div>

            {/* Live Synced Today Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="px-3.5 py-2.5 rounded-2xl bg-white border border-sky-200/80 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600">🍼 Feeds Today</span>
                <span className="text-sm font-black text-sky-900">{elderTodayFeedsCount}</span>
              </div>
              <div className="px-3.5 py-2.5 rounded-2xl bg-white border border-sky-200/80 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600">😴 Sleeps Today</span>
                <span className="text-sm font-black text-sky-900">{elderTodaySleepsCount}</span>
              </div>
              <div className="px-3.5 py-2.5 rounded-2xl bg-white border border-sky-200/80 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600">🚼 Diapers Today</span>
                <span className="text-sm font-black text-sky-900">{elderTodayDiapersCount}</span>
              </div>
              <div className="px-3.5 py-2.5 rounded-2xl bg-white border border-sky-200/80 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600">💧 Fluid Today</span>
                <span className="text-sm font-black text-sky-900">{fluidMl} ml</span>
              </div>
            </div>

            {elderToast && (
              <div className="p-3.5 rounded-2xl bg-sky-600 text-white text-xs font-black flex items-center gap-2 shadow-md">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{elderToast}</span>
              </div>
            )}

            {/* 4 Large One-Touch Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Feed Button */}
              <button
                type="button"
                onClick={handleElderQuickFeed}
                className="p-5 rounded-3xl bg-white hover:bg-sky-50/50 border-2 border-sky-200 hover:border-sky-400 text-left transition-all active:scale-98 shadow-sm cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🍼</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    +120 ml Sync
                  </span>
                </div>
                <div>
                  <p className="text-base sm:text-lg font-black text-gray-900 group-hover:text-sky-700">
                    Log Milk Feed (4 oz)
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Saves directly to Feeding Tracker &amp; Hydration
                  </p>
                </div>
              </button>

              {/* Nap Button (Start / End live sleep timer synced to SleepTracker) */}
              <button
                type="button"
                onClick={handleElderQuickNap}
                className={`p-5 rounded-3xl text-left transition-all active:scale-98 shadow-sm cursor-pointer flex flex-col justify-between gap-3 group border-2 ${
                  elderNapStartMs
                    ? 'bg-emerald-50 border-emerald-400 hover:bg-emerald-100/70'
                    : 'bg-white hover:bg-sky-50/50 border-sky-200 hover:border-sky-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">😴</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    elderNapStartMs ? 'bg-emerald-600 text-white animate-pulse' : 'bg-sky-100 text-sky-800'
                  }`}>
                    {elderNapStartMs ? 'Nap Active' : 'Start Nap'}
                  </span>
                </div>
                <div>
                  <p className="text-base sm:text-lg font-black text-gray-900 group-hover:text-sky-700">
                    {elderNapStartMs ? `End ${babyName}'s Nap` : `${babyName} is Asleep`}
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {elderNapStartMs
                      ? `Started ${new Date(elderNapStartMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Tap to save sleep log`
                      : 'Tap to start nap timer & sync sleep'}
                  </p>
                </div>
              </button>

              {/* Diaper Button */}
              <button
                type="button"
                onClick={handleElderQuickDiaper}
                className="p-5 rounded-3xl bg-white hover:bg-sky-50/50 border-2 border-sky-200 hover:border-sky-400 text-left transition-all active:scale-98 shadow-sm cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🚼</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    One Touch
                  </span>
                </div>
                <div>
                  <p className="text-base sm:text-lg font-black text-gray-900 group-hover:text-sky-700">
                    Diaper Changed
                  </p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Saves fresh diaper log to Journal &amp; Village
                  </p>
                </div>
              </button>

              {/* Voice-Activated Quick Log */}
              <button
                type="button"
                onClick={handleElderVoiceLog}
                className={`p-5 rounded-3xl text-left transition-all active:scale-98 shadow-sm cursor-pointer flex flex-col justify-between gap-3 border-2 ${
                  elderVoiceListening
                    ? 'bg-sky-600 text-white border-sky-600 animate-pulse'
                    : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🎙️</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    elderVoiceListening ? 'bg-white text-sky-600' : 'bg-sky-400 text-slate-950'
                  }`}>
                    {elderVoiceListening ? 'Listening...' : 'Voice Log'}
                  </span>
                </div>
                <div>
                  <p className="text-base sm:text-lg font-black">
                    {elderVoiceListening ? 'Speak Now...' : 'Tap to Speak Log'}
                  </p>
                  <p className={`text-xs ${elderVoiceListening ? 'text-white/90' : 'text-gray-300'} font-medium mt-0.5`}>
                    Say: &quot;baby slept 45 mins&quot; or &quot;baby drank 3 oz&quot;
                  </p>
                </div>
              </button>
            </div>

            {/* Inline Quick Text / Voice Command Bar (Replaces blocked browser prompt) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                processElderTranscript(elderVoiceInput);
              }}
              className="flex flex-col sm:flex-row gap-2 bg-white p-2.5 rounded-2xl border border-sky-200 shadow-2xs"
            >
              <input
                type="text"
                value={elderVoiceInput}
                onChange={(e) => setElderVoiceInput(e.target.value)}
                placeholder={`Or type a quick care update (e.g. "${babyName} drank 3 oz", "${babyName} slept 40 mins", "dirty diaper")...`}
                className="flex-1 bg-sky-50/40 border border-sky-100 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 placeholder-gray-400 outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={!elderVoiceInput.trim() || isProcessingElderLog}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer disabled:opacity-40 shrink-0"
              >
                {isProcessingElderLog ? 'Logging...' : 'Log & Sync'}
              </button>
            </form>

            {/* Secondary Quick Action Row: Monitor (Settings Locked) + Record Blessing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('monitor')}
                className="p-4 rounded-2xl bg-white hover:bg-gray-50 border border-sky-200 text-gray-900 text-xs font-bold flex items-center justify-between cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <Video className="w-5 h-5 text-sky-600" />
                  <div className="text-left">
                    <p className="font-black text-gray-900">Smart Video Monitor (Settings Locked)</p>
                    <p className="text-[10px] text-gray-500">Safely watch {babyName} without changing camera settings</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('journal', { tab: 'diary' })}
                className="p-4 rounded-2xl bg-white hover:bg-gray-50 border border-sky-200 text-gray-900 text-xs font-bold flex items-center justify-between cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-5 h-5 text-sky-700" />
                  <div className="text-left">
                    <p className="font-black text-gray-900">Record Voice Blessing or Lullaby</p>
                    <p className="text-[10px] text-gray-500">Record traditional prayers or songs for {babyName}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="bg-sky-50/90 px-5 py-3 rounded-2xl border border-sky-200 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="text-lg">🏡</span>
              <div>
                <p className="font-black text-gray-900">Granny Mode • Standard View Active</p>
                <p className="text-[11px] text-gray-600">
                  Today for {babyName}: {elderTodayFeedsCount} feeds • {elderTodaySleepsCount} sleeps • {elderTodayDiapersCount} diapers
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsElderModeExpanded(true)}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold border-none cursor-pointer shrink-0"
            >
              Open Granny Mode
            </button>
          </div>
        )
      )}

      {/* Nanny / Caregiver Shift & Handover Logger (Caregiver role only) */}
      {userRole === 'nanny' && (
        <CaregiverShiftLogger 
          userRole={userRole} 
          caregiverName={parentName} 
          currentUser={currentUser} 
          babyName={babyName} 
        />
      )}

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
              <Compass className="w-4 h-4" />
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
            onClick={() => onNavigate('sleep')}
            className="bg-card p-6 rounded-[36px] border border-white shadow-xl shadow-card/15 cursor-pointer group space-y-4 text-left relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🎙️
              </div>
              <span className="text-[8px] font-black text-primary bg-primary/15 px-2.5 py-1 rounded-full uppercase tracking-wider border border-primary/20">
                Acoustic Analysis
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-serif font-black text-gray-800">Baby Cry Reason Analyzer</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Listens to your baby's cry and correlates audio with time since last feeding & nap to analyze comfort needs.
              </p>
            </div>
            <div className="pt-1 flex items-center gap-1.5 text-xs font-bold text-primary">
              <Mic className="w-3.5 h-3.5" /> 
              <span>Audio Analysis Active</span>
            </div>
          </motion.div>

          {/* AI Weekly Meal & Grocery Planner Card */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigate('ai-meal-planner')}
            className="bg-card p-6 rounded-[36px] border border-white shadow-xl shadow-card/15 cursor-pointer group space-y-4 text-left relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🥗
              </div>
              <span className="text-[8px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-primary/20">
                Localized Groceries
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-serif font-black text-gray-800">AI Weekly Meal & Grocery Plan</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Generates a complete 7-day age-optimized solid food menu that targets nutritional gaps with an automated local grocery checklist.
              </p>
            </div>
            <div className="pt-1 flex items-center justify-between text-xs font-bold text-primary group-hover:text-primary">
              <span className="flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" /> Build 7-Day Plan
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Smart Baby Video Monitor Card */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigate('monitor')}
            className="bg-card p-6 rounded-[36px] border border-white shadow-xl shadow-card/15 cursor-pointer group space-y-4 text-left relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📹
              </div>
              <span className="text-[8px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-primary/20">
                P2P Village Stream
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-serif font-black text-gray-800">Smart Baby Video Monitor</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Stream video and audio directly between village devices over local network or cloud via a private peer-to-peer link.
              </p>
            </div>
            <div className="pt-1 flex items-center justify-between text-xs font-bold text-primary group-hover:text-primary">
              <span className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" /> Launch Village Monitor
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
          
    </div>
      </section>

      {/* Community Support, Local Directories & Global Baby Name Database */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-black text-gray-800">Community, Local Care & Baby Names</h2>
              <p className="text-xs text-gray-400 font-medium">Parent & specialist forum, map-grounded care directories, and global baby name encyclopedia</p>
            </div>
          </div>
          <span className="text-[9px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
            Live Network
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Community Support Card */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigate('community')}
            className="bg-card p-6 rounded-[36px] border border-white shadow-xl shadow-card/15 cursor-pointer group space-y-4 text-left relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  💬
                </div>
                <span className="text-[8px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-primary/20">
                  Forum & Live Chat
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-serif font-black text-gray-800">Community Support</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Connect, chat, ask, and get answers from other parents, lactation consultants, and care specialists across all fields.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-primary">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Join Parent & Specialist Forum
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Local Directories Card */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigate('local-directories')}
            className="bg-card p-6 rounded-[36px] border border-white shadow-xl shadow-card/15 cursor-pointer group space-y-4 text-left relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🏥
                </div>
                <span className="text-[8px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-primary/20">
                  Map Grounded AI
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-serif font-black text-gray-800">Local Directories</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Map-grounded searchable database for local healthcare providers, hospitals, lactation specialists, and baby name directory.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-primary">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Search Local Care Map
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Global Baby Name Database Card */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => onNavigate('baby-names')}
            className="bg-card p-6 rounded-[36px] border border-white shadow-xl shadow-card/15 cursor-pointer group space-y-4 text-left relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🌍
                </div>
                <span className="text-[8px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-primary/20">
                  A-Z & Multi-Filter
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-serif font-black text-gray-800">Global Baby Name Database</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Search names by meaning or significance, contribute a name, or filter by Gender, Origin, Language, Starting/Ending letter, and A-Z.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-primary">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> Explore Baby Names
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
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
              <p className="text-base font-black text-primary leading-tight mt-0.5">
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
            className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline cursor-pointer bg-transparent border-none"
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
                <div className="flex items-center gap-0.5 bg-primary/10 text-primary px-2 py-0.5 rounded-full animate-pulse border border-primary/20">
                  <Flame className="w-3 h-3 fill-primary text-primary" />
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

      {/* Mother Postpartum Care Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-2">
          <div>
            <h2 className="text-xl font-serif font-black text-gray-800">Mother Postpartum Care</h2>
            <p className="text-xs text-gray-400 font-medium">Fourth trimester recovery, rest windows, nutrition & mental wellness</p>
          </div>
          <button 
            onClick={() => onNavigate('mother-care')}
            className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline cursor-pointer bg-transparent border-none"
          >
            Open Suite →
          </button>
        </div>

        <motion.div 
          whileHover={{ y: -2 }}
          onClick={() => onNavigate('mother-care')}
          className="bg-card p-6 sm:p-8 rounded-[40px] shadow-xl shadow-card/20 border border-white flex flex-col sm:flex-row items-center justify-between gap-6 cursor-pointer group relative overflow-hidden text-left"
        >
          <div className="space-y-3 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[9px] font-black text-primary uppercase tracking-widest border border-white">
              <span>🩺</span>
              <span>Wellness Recovery & Fourth Trimester Care</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-gray-800">Nurturing You, {parentName}.</h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
              Evidence-based maternal recovery for the fourth trimester. Track pelvic floor rehabilitation, surgical incision healing, lochia milestones, postpartum mental wellness (EPDS guidance), 4-hour consolidated REM sleep windows, and restorative nutrition for restorative healing.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-wider shadow-sm group-hover:bg-primary/90 transition-all">
                <span>Explore Mother Postpartum Care</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/80 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            🤱
          </div>
        </motion.div>
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
                              <span className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 ${isSelected ? 'bg-white' : 'bg-primary'}`} />
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
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-bounce">
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
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Amount / Serving Note</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 1 drop, 5ml (per doctor label)"
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
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${scheduled.completed ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
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
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
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
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${scheduled.completed ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
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
                  <div className="-mx-4 sm:-mx-6 -mt-2">
                    <ImmunizationScheduler 
                      vaccineSchedule={vaccineSchedule || []} 
                      setVaccineSchedule={setVaccineSchedule}
                      onNavigate={onNavigate}
                    />
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
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${m.completed ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
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
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${a.completed ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
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
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${md.completed ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
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
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${v.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'}`}>
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
      {/* Multi-Baby & Multi-Role Village Hub Switcher Modal */}
      <AnimatePresence>
        {isVillageSwitcherOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 max-w-lg w-full border border-gray-100 shadow-2xl space-y-5 text-left relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl">
                    🏘️
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-gray-900 text-lg leading-tight">
                      My Babies &amp; Connected Villages
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      Switch between your child &amp; babies you help care for
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVillageSwitcherOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {villageModalMsg && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                  {villageModalMsg}
                </div>
              )}

              <div className="space-y-2.5">
                {villageConnections.length === 0 ? (
                  <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    No village hubs connected yet. Add your own child workspace or paste a parent&apos;s village invite link below.
                  </p>
                ) : (
                  villageConnections.map((conn) => {
                    const isActive = conn.villageToken === activeVillageToken;
                    const roleBadge =
                      conn.role === 'admin'
                        ? 'Parent (Admin)'
                        : conn.role === 'family'
                          ? 'Granny / Family Circle'
                          : 'Caregiver / Nanny';
                    return (
                      <button
                        key={conn.villageToken}
                        type="button"
                        onClick={() => {
                          onSwitchVillage?.(conn.villageToken);
                          setIsVillageSwitcherOpen(false);
                        }}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isActive
                            ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                            : 'bg-gray-50/70 border-gray-200 hover:bg-gray-100/70'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-gray-900 truncate">
                              {conn.isOwnChild ? '👶' : '🏘️'} {conn.babyName || 'Baby'}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              conn.role === 'admin'
                                ? 'bg-primary/15 text-primary'
                                : conn.role === 'family'
                                  ? 'bg-sky-100 text-sky-900'
                                  : 'bg-slate-200 text-slate-800'
                            }`}>
                              {roleBadge}
                            </span>
                            {isActive && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 font-mono mt-1 truncate">
                            {conn.babyAge || 'Care Hub'} • {conn.villageToken}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                      </button>
                    );
                  })
                )}
              </div>

              {/* Add Your Own Child Hub */}
              {onCreateOwnBabyHub && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                  <p className="text-xs font-black text-gray-900">
                    + Add My Own Baby Hub (Parent / Admin)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newOwnBabyName}
                      onChange={(e) => setNewOwnBabyName(e.target.value)}
                      placeholder="Your baby's name (e.g. Zuri)"
                      className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:border-primary"
                    />
                    <input
                      type="date"
                      value={newOwnBabyDob}
                      onChange={(e) => setNewOwnBabyDob(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newOwnBabyName.trim()) {
                        setVillageModalMsg('Please enter your baby’s name first.');
                        return;
                      }
                      const calcAge = newOwnBabyDob ? calculateBabyAge(newOwnBabyDob) : 'Newborn';
                      onCreateOwnBabyHub({
                        babyName: newOwnBabyName.trim(),
                        babyDob: newOwnBabyDob,
                        babyAge: calcAge || 'Newborn'
                      });
                      setNewOwnBabyName('');
                      setNewOwnBabyDob('');
                      setIsVillageSwitcherOpen(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer"
                  >
                    Create Own Child Hub
                  </button>
                </div>
              )}

              {/* Join Another Baby's Village */}
              {onConnectVillageToken && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-2.5">
                  <p className="text-xs font-black text-gray-900">
                    + Join Another Baby&apos;s Village
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinVillageInput}
                      onChange={(e) => setJoinVillageInput(e.target.value)}
                      placeholder="Paste invite link or VILLAGE_... token"
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-800 outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const parsed = extractVillageInviteFromInput(joinVillageInput);
                        if (!parsed.villageToken) {
                          setVillageModalMsg('Invalid invite link or token.');
                          return;
                        }
                        onConnectVillageToken(parsed.villageToken, parsed.role || 'family');
                        setJoinVillageInput('');
                        setIsVillageSwitcherOpen(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer shrink-0"
                    >
                      Join
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


