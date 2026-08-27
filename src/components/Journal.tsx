import React, { useState, useEffect, useRef } from 'react';
import { DiaperAnalyzer } from './DiaperAnalyzer';
import { StorybookGenerator } from './StorybookGenerator';
import { MemorySlideshow } from './MemorySlideshow';
import { Plus, Calendar, Search, Star, Heart, FileText, Printer, Trash2, Edit3, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Sparkles, Award, Shield, Info, Copy, Share2, Crown, ChevronDown, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { MOCK_MEALS, THEME } from '../constants';
import { Meal } from '../types';
import { TEETH_LIST, COMMON_INGREDIENTS, DEFAULT_VACCINE_SCHEDULE } from '../constants/babyData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const Journal = ({  isPremium,
  setIsSubscriptionModalOpen,
 
  onNavigate,
  navData,
  allMeals,
  scheduledMeals, 
  scheduledActivities, 
  scheduledMeds,
  loggedMeals,
  observationLogs,
  setObservationLogs,
  setScheduledMeals,
  setScheduledActivities,
  setScheduledMeds,
  setLoggedMeals,
  weeklyPlan,
  setWeeklyPlan,
  groceryChecked,
  setGroceryChecked,
  diaperLogs,
  setDiaperLogs,
  allergenMatrix,
  babyName,
  setBabyName,
  parentName,
  setParentName,
  growthLogs,
  setGrowthLogs,
  setFluidMl,
  loggedMoods = [],
  setLoggedMoods,
  memories = [],
  setMemories,
  setAllTimePoints,
  setDailyStreak,
  setLastQuestDate,
  setLastStreakDate,
  setActivities,
  fluidMl = 0,
  fluidTarget = 800,
  activities = [],
  dailyStreak = 0,
  vaccineSchedule = [],
  setVaccineSchedule,
  userRole = 'admin',
  setUserRole
}: { 
  isPremium: boolean,
  setIsSubscriptionModalOpen: (open: boolean) => void,
  onNavigate: (screen: string, data?: any, autoOpenLog?: boolean) => void,
  navData?: any,
  allMeals: any[],
  scheduledMeals: any[], 
  scheduledActivities: any[], 
  scheduledMeds: any[],
  loggedMeals: any[],
  observationLogs: any[],
  setObservationLogs: (logs: any[]) => void,
  setScheduledMeals: (meals: any[]) => void,
  setScheduledActivities: (acts: any[]) => void,
  setScheduledMeds: (meds: any[]) => void,
  setLoggedMeals: (meals: any[]) => void,
  weeklyPlan: any,
  setWeeklyPlan: (plan: any) => void,
  groceryChecked: string[],
  setGroceryChecked: (checked: string[]) => void,
  diaperLogs: any[],
  setDiaperLogs: (logs: any[]) => void,
  allergenMatrix: any[],
  babyName: string,
  setBabyName: (name: string) => void,
  parentName?: string,
  setParentName?: (name: string) => void,
  growthLogs: any[],
  setGrowthLogs: (logs: any[]) => void,
  setFluidMl?: (ml: number) => void,
  loggedMoods?: any[],
  setLoggedMoods?: (moods: any[]) => void,
  memories?: any[],
  setMemories?: (memories: any[]) => void,
  setAllTimePoints?: any,
  setDailyStreak?: (streak: number) => void,
  setLastQuestDate?: (date: string) => void,
  setLastStreakDate?: (date: string) => void,
  setActivities?: (acts: any[]) => void,
  fluidMl?: number,
  fluidTarget?: number,
  activities?: any[],
  dailyStreak?: number,
  vaccineSchedule?: any[],
  setVaccineSchedule?: (schedule: any[]) => void,
  userRole?: 'admin' | 'family' | 'nanny',
  setUserRole?: React.Dispatch<React.SetStateAction<'admin' | 'family' | 'nanny'>>
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlanType, setNewPlanType] = useState('meal');
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanTime, setNewPlanTime] = useState('08:00 AM');

  // Tab state: 'daily' | 'diary' | 'weekly'
  const [activeTab, setActiveTab] = useState<'daily' | 'diary' | 'weekly'>('daily');

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const isToday = isSameDay(selectedDate, new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = isSameDay(selectedDate, yesterday);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = isSameDay(selectedDate, tomorrow);

  const selectedDateLabel = isToday 
    ? "Today" 
    : isYesterday 
      ? "Yesterday" 
      : isTomorrow 
        ? "Tomorrow" 
        : selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  // Personal Diary State
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryNotes, setDiaryNotes] = useState('');
  const [diaryMood, setDiaryMood] = useState('✨ Grateful');
  const [diaryCategory, setDiaryCategory] = useState('Parenting Thought');
  const [diarySearchQuery, setDiarySearchQuery] = useState('');
  const [diaryViewMode, setDiaryViewMode] = useState<'selected' | 'all'>('selected');
  const [editingDiaryId, setEditingDiaryId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const DIARY_MOODS = [
    { label: '✨ Grateful', color: 'bg-primary/10 text-primary border-primary/20' },
    { label: '😊 Happy & Calm', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: '💖 Loving Moment', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { label: '☕ Peaceful', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    { label: '🎉 Milestone', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: '😴 Exhausted', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { label: '🌱 Growing Together', color: 'bg-teal-50 text-teal-700 border-teal-200' }
  ];

  const DIARY_CATEGORIES = [
    'Parenting Thought',
    'Baby Memory',
    'Personal Reflection',
    'Milestone',
    'Daily Note'
  ];

  const handleSaveDiaryEntry = () => {
    if (!diaryNotes.trim()) return;

    if (editingDiaryId) {
      setObservationLogs(observationLogs.map(o => o.id === editingDiaryId ? {
        ...o,
        title: diaryTitle.trim() || 'Daily Reflection',
        mood: diaryMood,
        notes: diaryNotes.trim(),
        category: diaryCategory,
        type: 'diary'
      } : o));
      setEditingDiaryId(null);
      setToastMsg('Entry updated successfully! ✨');
    } else {
      const newEntry = {
        id: Date.now().toString(),
        date: selectedDate.toISOString(),
        title: diaryTitle.trim() || 'Daily Reflection',
        mood: diaryMood,
        notes: diaryNotes.trim(),
        category: diaryCategory,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'diary'
      };
      setObservationLogs([newEntry, ...observationLogs]);
      setToastMsg('Diary entry saved! 📖');
    }

    setDiaryTitle('');
    setDiaryNotes('');
    setDiaryMood('✨ Grateful');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDeleteDiaryEntry = (id: string) => {
    setObservationLogs(observationLogs.filter(o => o.id !== id));
    if (editingDiaryId === id) {
      setEditingDiaryId(null);
      setDiaryTitle('');
      setDiaryNotes('');
    }
    setToastMsg('Entry removed');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleEditDiaryEntry = (entry: any) => {
    setEditingDiaryId(entry.id);
    setDiaryTitle(entry.title || '');
    setDiaryNotes(entry.notes || '');
    setDiaryMood(entry.mood || '✨ Grateful');
    setDiaryCategory(entry.category || 'Parenting Thought');
    if (entry.date) {
      setSelectedDate(new Date(entry.date));
    }
    setActiveTab('diary');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMsg('Copied to clipboard! 📋');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const diaryEntries = observationLogs.filter(o => {
    const isDiaryType = o.type === 'diary' || (!o.type && o.notes && !o.symptoms);
    if (!isDiaryType) return false;

    const matchesDate = diaryViewMode === 'all' || isSameDay(new Date(o.date), selectedDate);
    const matchesSearch = !diarySearchQuery.trim() || 
      (o.title && o.title.toLowerCase().includes(diarySearchQuery.toLowerCase())) ||
      (o.notes && o.notes.toLowerCase().includes(diarySearchQuery.toLowerCase())) ||
      (o.mood && o.mood.toLowerCase().includes(diarySearchQuery.toLowerCase())) ||
      (o.category && o.category.toLowerCase().includes(diarySearchQuery.toLowerCase()));

    return matchesDate && matchesSearch;
  });

  const todayDiaryEntries = observationLogs.filter(o => 
    (o.type === 'diary' || (!o.type && o.notes && !o.symptoms)) && isSameDay(new Date(o.date), selectedDate)
  );

  // Dynamic state for dynamic plan types
  const [newMealPeriod, setNewMealPeriod] = useState('Breakfast');
  const [newActivityDuration, setNewActivityDuration] = useState('15m');
  const [newMedDosage, setNewMedDosage] = useState('1 dose');
  const [newVaccineAge, setNewVaccineAge] = useState('6 Months');
  const [newVaccineStatus, setNewVaccineStatus] = useState('Scheduled');
  const [newRoutineCategory, setNewRoutineCategory] = useState('Nap Time');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    if (navData) {
      if (navData.tab) {
        setActiveTab(navData.tab);
      }
      if (navData.openAddPlan) {
        setShowAddPlan(true);
      }
      if (navData.planType) {
        setNewPlanType(navData.planType);
      }
      if (navData.date) {
        setSelectedDate(new Date(navData.date));
      }
    }
  }, [navData]);

  const handleClearAllData = () => {
    setScheduledMeals([]);
    setScheduledActivities([]);
    setScheduledMeds([]);
    setLoggedMeals([]);
    setObservationLogs([]);
    setDiaperLogs([]);
    setWeeklyPlan({});
    setGroceryChecked([]);
    if (setFluidMl) setFluidMl(0);
    if (setLoggedMoods) setLoggedMoods([]);
    if (setAllTimePoints) setAllTimePoints(0);
    if (setDailyStreak) setDailyStreak(0);
    if (setLastQuestDate) setLastQuestDate('');
    if (setLastStreakDate) setLastStreakDate('');
    if (setActivities) setActivities([]);

    localStorage.removeItem('scheduledMeals');
    localStorage.removeItem('scheduledActivities');
    localStorage.removeItem('scheduledMeds');
    localStorage.removeItem('loggedMeals');
    localStorage.removeItem('observationLogs');
    localStorage.removeItem('diaperLogs');
    localStorage.removeItem('weeklyPlan');
    localStorage.removeItem('groceryChecked');
    localStorage.removeItem('fluidMl');
    localStorage.removeItem('loggedMoods');
    localStorage.removeItem('allTimePoints');
    localStorage.removeItem('dailyStreak');
    localStorage.removeItem('lastQuestDate');
    localStorage.removeItem('lastStreakDate');
    localStorage.removeItem('activities');

    setShowConfirmReset(false);
  };
  
  useEffect(() => {
    if (navData && navData.type === 'meal') {
      setShowAddPlan(true);
      setNewPlanType('meal');
      setNewPlanTitle(navData.meal.id);
    }
  }, [navData]);
  
  // Diaper tracker state
  const [showDiaperLogger, setShowDiaperLogger] = useState(false);
  const [diaperType, setDiaperType] = useState<'Wet' | 'Dirty' | 'Both'>('Wet');
  const [wetWeight, setWetWeight] = useState('');
  const [wetIntensity, setWetIntensity] = useState<'Light' | 'Medium' | 'Heavy'>('Medium');
  const [stoolType, setStoolType] = useState<number>(4); // Bristol Stool Type (1-7)
  const [poopColor, setPoopColor] = useState('Yellow');
  const [diaperSymptoms, setDiaperSymptoms] = useState('');
  const [diaperNotes, setDiaperNotes] = useState('');
  const [diaperConsistency, setDiaperConsistency] = useState('Normal');

  // Weekly Planner state
  const [showRecipePicker, setShowRecipePicker] = useState<{ day: string; slot: string } | null>(null);

  // Report state
  const [showReport, setShowReport] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempBabyName, setTempBabyName] = useState(babyName);
  const [tempParentName, setTempParentName] = useState(parentName || '');

  // Decoupled symptoms and notes
  const [obsSymptoms, setObsSymptoms] = useState('');
  const [obsNotes, setObsNotes] = useState('');

  // Expandable log card state
  const [expandedLogIndex, setExpandedLogIndex] = useState<number | null>(null);
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDayItems = () => {
    return [
      ...scheduledMeals
        .filter(m => m.date ? isSameDay(new Date(m.date), selectedDate) : isSameDay(new Date(), selectedDate))
        .map(m => ({ ...m, typeId: 'meal', category: 'Meal', icon: '🍽️', title: m.meal?.title || m.title, subtitle: m.type })),
      ...scheduledActivities
        .filter(a => a.date ? isSameDay(new Date(a.date), selectedDate) : isSameDay(new Date(), selectedDate))
        .map(a => ({ ...a, typeId: 'activity', category: 'Activity', icon: '🧸', title: a.title, subtitle: a.duration })),
      ...scheduledMeds
        .filter(m => m.date ? isSameDay(new Date(m.date), selectedDate) : isSameDay(new Date(), selectedDate))
        .map(m => ({ ...m, typeId: 'med', category: 'Medication', icon: '💊', title: m.name || m.title, subtitle: m.dosage })),
      ...(vaccineSchedule || [])
        .filter(v => v.date && isSameDay(new Date(v.date), selectedDate))
        .map(v => ({
          id: v.id,
          typeId: 'vaccine',
          category: 'Immunization',
          icon: '💉',
          title: v.name,
          subtitle: `${v.age} • ${v.status}`,
          completed: v.status === 'Completed',
          time: '09:00 AM'
        }))
    ].sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
      const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
      return timeA - timeB;
    });
  };

  const dayItems = getDayItems();

  const handleAddPlan = () => {
    const newPlan = { id: Date.now().toString(), time: newPlanTime, completed: false, date: selectedDate.toISOString() };
    if (newPlanType === 'meal') {
      const targetId = newPlanTitle || (allMeals[0] ? allMeals[0].id : '');
      const selectedMealObj = allMeals.find(m => m.id === targetId) || allMeals[0];
      if (!selectedMealObj) return;
      setScheduledMeals([...scheduledMeals, { ...newPlan, title: selectedMealObj.title, meal: selectedMealObj, type: newMealPeriod }]);
    } else if (newPlanType === 'activity') {
      if (!newPlanTitle.trim()) return;
      setScheduledActivities([...scheduledActivities, { ...newPlan, title: newPlanTitle.trim(), duration: newActivityDuration }]);
    } else if (newPlanType === 'med') {
      if (!newPlanTitle.trim()) return;
      setScheduledMeds([...scheduledMeds, { ...newPlan, title: newPlanTitle.trim(), name: newPlanTitle.trim(), dosage: newMedDosage }]);
    } else if (newPlanType === 'vaccine') {
      const vName = newPlanTitle.trim() || 'DTaP Booster';
      const newV = {
        id: `v-${Date.now()}`,
        name: vName,
        age: newVaccineAge,
        status: newVaccineStatus,
        date: selectedDate.toISOString().split('T')[0],
        sideEffects: 'None',
        time: newPlanTime
      };
      if (setVaccineSchedule) {
        setVaccineSchedule([...(vaccineSchedule || []), newV]);
      }
    } else if (newPlanType === 'routine') {
      const rName = newPlanTitle.trim() || newRoutineCategory;
      setScheduledActivities([...scheduledActivities, { ...newPlan, title: rName, duration: newActivityDuration, isRoutine: true, category: 'Routine' }]);
    }
    setShowAddPlan(false);
    setNewPlanTitle('');
  };

  const toggleItemCompletion = (item: any) => {
    if (item.typeId === 'meal') {
      const isCompleting = !item.completed;
      setScheduledMeals(scheduledMeals.map(m => m.id === item.id ? { ...m, completed: !m.completed } : m));
      if (isCompleting) {
        onNavigate('recipe-detail', item.meal || allMeals[0], true);
      }
    } else if (item.typeId === 'activity') {
      setScheduledActivities(scheduledActivities.map(a => a.id === item.id ? { ...a, completed: !a.completed } : a));
    } else if (item.typeId === 'med') {
      setScheduledMeds(scheduledMeds.map(m => m.id === item.id ? { ...m, completed: !m.completed } : m));
    } else if (item.typeId === 'vaccine') {
      if (setVaccineSchedule && vaccineSchedule) {
        setVaccineSchedule(vaccineSchedule.map(v => v.id === item.id ? { ...v, status: v.status === 'Completed' ? 'Scheduled' : 'Completed' } : v));
      }
    }
  };
  
  const saveObservation = () => {
    const newObs = {
      id: Date.now().toString(),
      date: selectedDate.toISOString(),
      symptoms: obsSymptoms,
      notes: obsNotes,
    };
    setObservationLogs([...observationLogs, newObs]);
    setObsSymptoms('');
    setObsNotes('');
  };

  const deleteLoggedMeal = (timestamp: string) => {
    setLoggedMeals(loggedMeals.filter(m => m.timestamp !== timestamp));
    setExpandedLogIndex(null);
  };
  
  const currentObs = observationLogs.find(o => isSameDay(new Date(o.date), selectedDate));
  const todayMeals = loggedMeals.filter(m => m.timestamp && isSameDay(new Date(m.timestamp), selectedDate));

  // --- Bristol Stool Scale Descriptions ---
  const BRISTOL_SCALE = [
    { type: 1, name: 'Separate Hard Lumps', desc: '🧱 Severe constipation. Hard, painful lumps like pebbles.', icon: '🧱', danger: true },
    { type: 2, name: 'Sausage-Shaped, Lumpy', desc: '🥜 Mild constipation. Sausage-like, but lumpy.', icon: '🥜', danger: false },
    { type: 3, name: 'Sausage, Cracked Surface', desc: '🌭 Normal/Healthy. Smooth shape with small cracks.', icon: '🌭', danger: false },
    { type: 4, name: 'Smooth & Soft Sausage', desc: '🍌 Optimal. Soft, smooth, and easily passed.', icon: '🍌', danger: false },
    { type: 5, name: 'Soft Blobs, Clear Edges', desc: '🥞 Lacking Fiber. Slightly soft chunks, easily passed.', icon: '🥞', danger: false },
    { type: 6, name: 'Mushy, Fluffy Pieces', desc: '🥣 Mild Diarrhea. Mushy, fluffy consistency with ragged edges.', icon: '🥣', danger: false },
    { type: 7, name: 'Watery, No Solid Pieces', desc: '💧 Severe Diarrhea. Entirely liquid stool.', icon: '💧', danger: true }
  ];

  // Helper to log diaper
  const handleSaveDiaper = () => {
    const yesterday = new Date(selectedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const recentMealsIn24 = loggedMeals.filter(m => {
      const logD = new Date(m.timestamp);
      return logD >= yesterday && logD <= selectedDate;
    });
    const recentFoodsList = Array.from(new Set(recentMealsIn24.map(m => `${m.newFood || '🥗'} ${m.title}`)));

    const newDiaperLog = {
      id: `diaper-${Date.now()}`,
      date: selectedDate.toISOString(),
      type: diaperType,
      wetWeight: diaperType !== 'Dirty' ? parseFloat(wetWeight || '0') : 0,
      wetIntensity: diaperType !== 'Dirty' ? wetIntensity : undefined,
      stoolType: diaperType !== 'Wet' ? stoolType : undefined,
      poopColor: diaperType !== 'Wet' ? poopColor : undefined,
      poopConsistency: diaperType !== 'Wet' ? diaperConsistency : undefined,
      symptoms: diaperSymptoms,
      notes: diaperNotes,
      recentFoods: recentFoodsList
    };

    setDiaperLogs([...diaperLogs, newDiaperLog]);
    setWetWeight('');
    setDiaperSymptoms('');
    setDiaperNotes('');
    setDiaperConsistency('Normal');
    setShowDiaperLogger(false);
  };

  const handleDeleteDiaper = (id: string) => {
    setDiaperLogs(diaperLogs.filter(d => d.id !== id));
  };

  const dayDiapers = diaperLogs.filter(d => isSameDay(new Date(d.date), selectedDate));

  // --- Weekly Planner Helpers ---
  const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const handleAssignRecipe = (recipeId: string) => {
    if (!showRecipePicker) return;
    const { day, slot } = showRecipePicker;
    const updated = { ...weeklyPlan };
    updated[day] = {
      ...updated[day],
      [slot]: recipeId
    };
    setWeeklyPlan(updated);
    setShowRecipePicker(null);
  };

  const handleClearSlot = (day: string, slot: string) => {
    const updated = { ...weeklyPlan };
    updated[day] = {
      ...updated[day],
      [slot]: null
    };
    setWeeklyPlan(updated);
  };

  const handleResetWeeklyPlanner = () => {
    const resetPlan: any = {};
    WEEK_DAYS.forEach(d => {
      resetPlan[d] = { Breakfast: null, Lunch: null, Dinner: null, Snack: null };
    });
    setWeeklyPlan(resetPlan);
    setGroceryChecked([]);
  };

  // Consolidate Grocery List
  const generateGroceryList = () => {
    const rawList: string[] = [];
    WEEK_DAYS.forEach(day => {
      MEAL_SLOTS.forEach(slot => {
        const recipeId = weeklyPlan[day]?.[slot];
        if (recipeId) {
          const recipe = allMeals.find(m => m.id === recipeId);
          if (recipe && recipe.ingredients) {
            recipe.ingredients.forEach((ing: any) => {
              rawList.push(`${ing.name} (${ing.amount})`);
            });
          }
        }
      });
    });

    const grouped: { [key: string]: { name: string; count: number; amounts: string[] } } = {};
    rawList.forEach(item => {
      const match = item.match(/^(.*?) \((.*?)\)$/);
      if (match) {
        const name = match[1].trim();
        const amount = match[2].trim();
        if (!grouped[name]) {
          grouped[name] = { name, count: 0, amounts: [] };
        }
        grouped[name].count += 1;
        if (!grouped[name].amounts.includes(amount)) {
          grouped[name].amounts.push(amount);
        }
      } else {
        if (!grouped[item]) {
          grouped[item] = { name: item, count: 1, amounts: [] };
        } else {
          grouped[item].count += 1;
        }
      }
    });

    return Object.values(grouped);
  };

  const consolidatedGroceries = generateGroceryList();

  const handleToggleGrocery = (ingName: string) => {
    if (groceryChecked.includes(ingName)) {
      setGroceryChecked(groceryChecked.filter(i => i !== ingName));
    } else {
      setGroceryChecked([...groceryChecked, ingName]);
    }
  };

  // --- Summary Report Stats Calculations ---
  const latestGrowthLog = growthLogs && growthLogs.length > 0 ? growthLogs[growthLogs.length - 1] : null;
  const getLatestWeightPercentile = (w: number) => Math.min(99, Math.max(1, Math.round((w / 8.2) * 50)));
  const getLatestHeightPercentile = (h: number) => Math.min(99, Math.max(1, Math.round((h / 67.5) * 50)));

  const clearedAllergensList = (allergenMatrix || []).filter(a => a.status === 'Cleared');
  const suspectedAllergensList = (allergenMatrix || []).filter(a => a.status === 'Suspected Reaction');
  const reactionMealsList = loggedMeals.filter(m => m.allergyReaction);

  const totalWetDiapers = diaperLogs.filter(d => d.type !== 'Dirty').length;
  const totalDirtyDiapers = diaperLogs.filter(d => d.type !== 'Wet').length;

  const stoolLogs = diaperLogs.filter(d => d.type !== 'Wet' && d.stoolType);
  const avgStoolType = stoolLogs.length > 0 
    ? Math.round(stoolLogs.reduce((acc, curr) => acc + curr.stoolType, 0) / stoolLogs.length) 
    : 4;

  const handleSaveBabyName = () => {
    setBabyName(tempBabyName || 'Baby');
    if (setParentName) setParentName(tempParentName || 'Mom');
    localStorage.setItem('parentName', tempParentName || 'Mom');
    setIsEditingName(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-32 space-y-8 bg-background min-h-screen font-sans">
      <header className="flex justify-between items-center pt-3 sm:pt-4 pb-2 px-1">
        <h1 className="text-2xl font-serif font-black text-gray-800">Journal</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowReport(true)}
            className="flex items-center gap-1.5 bg-primary text-white border-none px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-primary/25 hover:scale-105 active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Report</span>
          </button>
          
    </div>
      </header>

      {/* Clean Slate Confirmation Modal */}
      <AnimatePresence>
        {showConfirmReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-6 max-w-sm w-full border border-solid border-gray-100 shadow-2xl space-y-6 relative text-left"
            >
              <div className="text-center space-y-2">
                <span className="text-4xl">🧹</span>
                <h3 className="text-lg font-serif font-black text-gray-800">Clear All Tracking?</h3>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Are you absolutely sure you want to wipe all logged meals, diaper entries, weekly plans, and fluid intake back to 0%? This action is permanent.
                </p>
                
    </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowConfirmReset(false)} 
                  className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-gray-200 border-none"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleClearAllData} 
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-gray-800 font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 cursor-pointer border-none"
                >
                  Clear All
                </button>
                
    </div>
            </motion.div>
            
    </div>
        )}
      </AnimatePresence>

      {/* Toast Feedback Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/20"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Segmented Daily / Diary / Weekly View selector */}
      <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-[24px] flex w-full border border-white/20 shadow-sm gap-1">
        <button 
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-3 px-2 text-[10px] font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer ${
            activeTab === 'daily' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Daily Logs
        </button>
        <button 
          onClick={() => setActiveTab('diary')}
          className={`flex-1 py-3 px-2 text-[10px] font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'diary' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>{userRole === 'nanny' ? '🔒 Diary (Family)' : !isPremium ? '🔒 Daily Diary' : 'Daily Diary ✍️'}</span>
          {isPremium && userRole !== 'nanny' && todayDiaryEntries.length > 0 && (
            <span className={`w-2 h-2 rounded-full ${activeTab === 'diary' ? 'bg-amber-300' : 'bg-primary'}`} />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-3 px-2 text-[10px] font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === 'weekly' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>{!isPremium ? '🔒 Weekly Menu' : 'Weekly Menu 🛒'}</span>
        </button>
        
    </div>

      <AnimatePresence mode="wait">
        {activeTab === 'daily' && (
          <motion.div 
            key="daily-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >

      <div className="bg-card p-6 rounded-[48px] shadow-xl shadow-card/20 border border-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black text-gray-800 uppercase tracking-[0.2em]">
            {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 text-gray-400 hover:text-gray-800 transition-colors cursor-pointer border-none bg-transparent"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={handleNextMonth} className="p-2 text-gray-400 hover:text-gray-800 transition-colors cursor-pointer border-none bg-transparent"><ChevronRight className="w-5 h-5" /></button>
            
    </div>
          
    </div>
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</div>
          ))}
          
    </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = new Date(currentYear, currentMonth, i + 1);
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const hasDiary = observationLogs.some(o => isSameDay(new Date(o.date), date) && (o.notes || o.title));
            return (
              <button 
                key={i}
                onClick={() => { setSelectedDate(date); }}
                className={`w-10 h-10 mx-auto rounded-xl font-bold text-sm flex flex-col items-center justify-center transition-all cursor-pointer border-none relative ${
                  isSelected ? 'bg-primary text-white shadow-md scale-110' : 
                  isToday ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50 bg-transparent'
                }`}
              >
                <span>{i + 1}</span>
                {hasDiary && (
                  <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${isSelected ? 'bg-amber-300' : 'bg-primary'}`} />
                )}
              </button>
            );
          })}
          
    </div>
        
    </div>
      
      {showAddPlan && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 rounded-[32px] shadow-xl border border-white space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Add Plan for {selectedDate.toLocaleDateString()}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Type</label>
              <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" value={newPlanType} onChange={e => { setNewPlanType(e.target.value); setNewPlanTitle(''); }}>
                <option value="meal">Meal</option>
                <option value="activity">Activity & Play</option>
                <option value="med">Medication</option>
                <option value="vaccine">Immunization / Vaccine</option>
                <option value="routine">Daily Routine / Care</option>
              </select>
              
    </div>

            {/* Meal dynamic fields */}
            {newPlanType === 'meal' && (
              <>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Meal Period</label>
                  <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" value={newMealPeriod} onChange={e => setNewMealPeriod(e.target.value)}>
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snack</option>
                  </select>
                  
    </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Select Meal Recipe</label>
                  <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" value={newPlanTitle} onChange={e => setNewPlanTitle(e.target.value)}>
                    <option value="" disabled>Select a meal</option>
                    {allMeals.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                  
    </div>
              </>
            )}

            {/* Activity dynamic fields */}
            {newPlanType === 'activity' && (
              <>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Activity Name</label>
                  <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium outline-none text-gray-700" placeholder="e.g. Tummy Time" value={newPlanTitle} onChange={e => setNewPlanTitle(e.target.value)} />
                  
    </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Duration</label>
                  <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" value={newActivityDuration} onChange={e => setNewActivityDuration(e.target.value)}>
                    <option>5m</option>
                    <option>10m</option>
                    <option>15m</option>
                    <option>30m</option>
                    <option>45m</option>
                    <option>1h</option>
                  </select>
                  
    </div>
              </>
            )}

            {/* Medication dynamic fields */}
            {newPlanType === 'med' && (
              <>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Medication Name</label>
                  <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium outline-none text-gray-700" placeholder="e.g. Vitamin D" value={newPlanTitle} onChange={e => setNewPlanTitle(e.target.value)} />
                  
    </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Dosage</label>
                  <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium outline-none text-gray-700" placeholder="e.g. 1 drop, 5ml" value={newMedDosage} onChange={e => setNewMedDosage(e.target.value)} />
                  
    </div>
              </>
            )}

            {/* Vaccine dynamic fields */}
            {newPlanType === 'vaccine' && (
              <>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Vaccine Name</label>
                  <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium outline-none text-gray-700" placeholder="e.g. DTaP, MMR, Rotavirus" value={newPlanTitle} onChange={e => setNewPlanTitle(e.target.value)} />
                  
    </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Target Age</label>
                    <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" value={newVaccineAge} onChange={e => setNewVaccineAge(e.target.value)}>
                      <option>Birth</option>
                      <option>2 Months</option>
                      <option>4 Months</option>
                      <option>6 Months</option>
                      <option>9 Months</option>
                      <option>12 Months</option>
                      <option>15 Months</option>
                      <option>18 Months</option>
                    </select>
                    
    </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Status</label>
                    <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" value={newVaccineStatus} onChange={e => setNewVaccineStatus(e.target.value)}>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Upcoming">Upcoming</option>
                    </select>
                    
    </div>
                  
    </div>
              </>
            )}

            {/* Routine dynamic fields */}
            {newPlanType === 'routine' && (
              <>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Routine Type</label>
                  <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium" value={newRoutineCategory} onChange={e => setNewRoutineCategory(e.target.value)}>
                    <option>Nap Time</option>
                    <option>Bath Time</option>
                    <option>Outdoor Walk</option>
                    <option>Bedtime Story</option>
                    <option>Diaper Change Routine</option>
                    <option>Sensory Play</option>
                  </select>
                  
    </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Custom Title / Notes (Optional)</label>
                  <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium outline-none text-gray-700" placeholder="e.g. Afternoon restorative nap" value={newPlanTitle} onChange={e => setNewPlanTitle(e.target.value)} />
                  
    </div>
              </>
            )}

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Time</label>
              <input type="time" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium outline-none text-gray-700" value={newPlanTime.replace(/ [AP]M/, '')} onChange={e => {
                const [h, m] = e.target.value.split(':');
                const hour = parseInt(h);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const formattedHour = hour % 12 || 12;
                setNewPlanTime(`${formattedHour.toString().padStart(2, '0')}:${m} ${ampm}`);
              }} />
              
    </div>

            <div className="flex gap-2">
              <button onClick={() => setShowAddPlan(false)} className="flex-1 py-3 rounded-full bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest cursor-pointer border-none">Close</button>
              <button onClick={handleAddPlan} className="flex-1 py-3 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 cursor-pointer border-none">Add Plan</button>
              
    </div>
            
    </div>
        </motion.div>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-serif font-black text-gray-800 text-left">Planned Checklist</h2>
          <button 
            onClick={() => setShowAddPlan(true)}
            className="px-3.5 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all cursor-pointer border border-primary/20 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Plan</span>
          </button>
          
    </div>
        <div className="bg-card rounded-[48px] shadow-xl shadow-card/20 border border-white p-8 relative overflow-hidden">
          <div className="relative space-y-4">
            {dayItems.length > 0 ? (
              dayItems.map((item, i) => (
                <div key={i} className="flex gap-4 items-center bg-gray-50 p-4 rounded-3xl text-left">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                    {item.icon}
                    
    </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">{item.category} • {item.time}</p>
                    
    </div>
                  <button 
                    onClick={() => toggleItemCompletion(item)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-gray-800 transition-colors cursor-pointer border-none ${item.completed ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </button>
                  
    </div>
              ))
            ) : (
              <div 
                onClick={() => setShowAddPlan(true)}
                className="text-center py-6 px-4 bg-gray-50/80 hover:bg-primary/5 rounded-3xl border border-dashed border-gray-200 hover:border-primary/40 transition-all cursor-pointer group"
              >
                <p className="text-sm text-gray-600 font-medium group-hover:text-primary transition-colors">Nothing planned for this date.</p>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1.5 flex items-center justify-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Tap to schedule a plan for this day
                </p>
                
    </div>
            )}
            
    </div>
          
    </div>
        
    </div>

      {/* List of logged meals for selected day */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif font-black text-gray-800 px-2 text-left">Logged Meals Overview</h2>
        <div className="space-y-4">
          {todayMeals.length > 0 ? (
            todayMeals.map((meal, i) => {
              const isExpanded = expandedLogIndex === i;
              return (
                <div key={i} className="bg-card rounded-[48px] border border-white p-6 sm:p-8 shadow-xl shadow-card/20 space-y-4 text-left">
                  <div 
                    className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center justify-between cursor-pointer shadow-xs hover:border-primary/30 transition-colors"
                    onClick={() => setExpandedLogIndex(isExpanded ? null : i)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">
                        {meal.newFood || '🥣'}
                        
    </div>
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">{meal.logTime} • {meal.logType}</p>
                        <p className="text-sm font-black text-gray-800 mt-1 leading-tight">{meal.title}</p>
                        
    </div>
                      
    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    
    </div>

                  {isExpanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs">
                          <p className="text-[8px] font-black text-primary uppercase tracking-widest">Appetising</p>
                          <div className="flex gap-0.5 mt-1 justify-center">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`w-3 h-3 ${meal.appetising >= star ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                            ))}
                            
    </div>
                          
    </div>
                        <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs">
                          <p className="text-[8px] font-black text-primary uppercase tracking-widest">Acceptance</p>
                          <div className="flex gap-0.5 mt-1 justify-center">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`w-3 h-3 ${meal.acceptance >= star ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                            ))}
                            
    </div>
                          
    </div>
                        <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs">
                          <p className="text-[8px] font-black text-primary uppercase tracking-widest">Satisfaction</p>
                          <div className="flex gap-0.5 mt-1 justify-center">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`w-3 h-3 ${meal.satisfaction >= star ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                            ))}
                            
    </div>
                          
    </div>
                        
    </div>

                      {meal.allergyReaction && (
                        <div className="bg-red-50 p-3 rounded-xl text-red-900 font-bold text-[10px] space-y-1.5 border border-red-200 flex flex-col items-start w-full shadow-xs">
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="font-black text-[9px] uppercase tracking-wider text-red-700">⚠️ ALLERGIC REACTION SUSPECTED</span>
                            
    </div>
                          {meal.allergyNotes && (
                            <p className="text-[10px] text-gray-700 bg-white p-2.5 rounded-xl w-full leading-relaxed border border-red-100 border-solid">
                              {meal.allergyNotes}
                            </p>
                          )}
                          
    </div>
                      )}

                      {meal.notes && (
                        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs">
                          <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-1 leading-none">Feedback / Notes</p>
                          <p className="text-gray-800 font-bold text-[11px] leading-relaxed">"{meal.notes}"</p>
                          
    </div>
                      )}

                      <div className="flex justify-end pt-2">
                        <button 
                          onClick={() => deleteLoggedMeal(meal.timestamp)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-red-500 hover:bg-red-50 border border-gray-200 transition-colors cursor-pointer text-[10px] font-black uppercase tracking-widest shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Log
                        </button>
                        
    </div>
                    </motion.div>
                  )}
                  
    </div>
              );
            })
          ) : (
            <div className="bg-card p-6 rounded-[36px] border border-white text-center py-6 shadow-xl shadow-card/20">
              <p className="text-xs text-gray-600 font-bold italic">No meals logged for this date.</p>
              
    </div>
          )}
          
    </div>
        
    </div>

      {/* Observation Logs / Digestive & Diaper Tracker */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-serif font-black text-gray-800">Diaper Logs & Digestive Tracker</h2>
          <button 
            onClick={() => setShowDiaperLogger(true)}
            className="px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 cursor-pointer border-none font-bold"
          >
            + Log Diaper
          </button>
          
    </div>

        {/* Diaper Logger Modal */}
        <AnimatePresence>
          {showDiaperLogger && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[40px] p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-5 relative max-h-[85vh] overflow-y-auto text-left"
              >
                <header className="text-center space-y-1">
                  <span className="text-4xl">👶</span>
                  <h3 className="text-xl font-serif font-black text-gray-800">Log Diaper Change</h3>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{selectedDate.toLocaleDateString()}</p>
                </header>
                
                <DiaperAnalyzer onAnalyze={({ stoolType, poopColor, symptoms }) => {
                  setDiaperType('Dirty');
                  setStoolType(stoolType);
                  setPoopColor(poopColor);
                  if (symptoms) {
                    alert('AI Analysis Flag: ' + symptoms);
                  }
                }} />

                <div className="space-y-4">
                  {/* Diaper Type Switcher */}
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Diaper Type</label>
                    <div className="bg-gray-100 p-1 rounded-2xl flex">
                      {['Wet', 'Dirty', 'Both'].map(t => (
                        <button 
                          key={t}
                          onClick={() => setDiaperType(t as any)}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all border-none ${
                            diaperType === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 bg-transparent'
                          }`}
                        >
                          {t === 'Wet' ? '💧 Wet' : t === 'Dirty' ? '💩 Dirty' : '🔄 Both'}
                        </button>
                      ))}
                      
    </div>
                    
    </div>

                  {/* Wet specific inputs */}
                  {diaperType !== 'Dirty' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Wetness Intensity</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Light', 'Medium', 'Heavy'].map(intensity => (
                            <button 
                              key={intensity}
                              onClick={() => setWetIntensity(intensity as any)}
                              className={`py-2 rounded-xl font-bold text-[10px] uppercase border cursor-pointer border-solid ${
                                wetIntensity === intensity ? 'bg-primary text-white border-primary shadow-sm' : 'bg-gray-50 text-gray-500 border-transparent'
                              }`}
                            >
                              {intensity === 'Light' ? '💧 Light' : intensity === 'Medium' ? '💧💧 Med' : '💧💧💧 Heavy'}
                            </button>
                          ))}
                          
    </div>
                        
    </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Diaper Weight (g)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 150"
                          value={wetWeight}
                          onChange={e => setWetWeight(e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium outline-none text-gray-700"
                        />
                        
    </div>
                    </motion.div>
                  )}

                  {/* Dirty specific inputs (Bristol Stool Scale!) */}
                  {diaperType !== 'Wet' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Bristol Baby Stool Scale</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {BRISTOL_SCALE.map(scale => (
                            <button 
                              key={scale.type}
                              onClick={() => setStoolType(scale.type)}
                              className={`w-full p-2.5 rounded-2xl border border-solid text-left flex gap-3 items-center transition-all cursor-pointer ${
                                stoolType === scale.type 
                                  ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary' 
                                  : 'bg-gray-50 border-transparent hover:bg-gray-100'
                              }`}
                            >
                              <span className="text-2xl shrink-0">{scale.icon}</span>
                              <div className="space-y-0.5 leading-none">
                                <p className="font-bold text-gray-800 text-[11px]">Type {scale.type} - {scale.name}</p>
                                <p className="text-[9px] text-gray-400 font-medium">{scale.desc}</p>
                                
    </div>
                            </button>
                          ))}
                          
    </div>
                        
    </div>

                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Stool Color</label>
                        <select 
                          value={poopColor}
                          onChange={e => setPoopColor(e.target.value)}
                          className="w-full bg-gray-50 border border-solid border-gray-100 rounded-xl p-3 text-xs font-bold outline-none text-gray-700 cursor-pointer"
                        >
                          <option value="Yellow">🟡 Yellow</option>
                          <option value="Brown">🟤 Brown</option>
                          <option value="Green">🟢 Green</option>
                          <option value="Red/Black">🔴 Alert (Red/Black)</option>
                        </select>
                        
    </div>

                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Stool Consistency</label>
                        <select 
                          value={diaperConsistency}
                          onChange={e => setDiaperConsistency(e.target.value)}
                          className="w-full bg-gray-50 border border-solid border-gray-100 rounded-xl p-3 text-xs font-bold outline-none text-gray-700 cursor-pointer"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Watery">Watery</option>
                          <option value="Hard">Hard</option>
                          <option value="Mucusy">Mucusy</option>
                        </select>
                        
    </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Symptoms (If Any)</label>
                    <input 
                      type="text" 
                      placeholder="Mild rash, gas, fussiness..."
                      value={diaperSymptoms}
                      onChange={e => setDiaperSymptoms(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium outline-none text-gray-700"
                    />
                    
    </div>

                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Notes / Logs</label>
                    <textarea 
                      placeholder="Detail consistency, feeding associations, or caregiver concerns..."
                      value={diaperNotes}
                      onChange={e => setDiaperNotes(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-medium h-16 outline-none text-gray-700"
                    />
                    
    </div>
                  
    </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setShowDiaperLogger(false)} 
                    className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-gray-200 border-none"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveDiaper} 
                    className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 cursor-pointer border-none"
                  >
                    Save Log
                  </button>
                  
    </div>
              </motion.div>
              
    </div>
          )}
        </AnimatePresence>

        {/* Renders logged diaper entries list for selected day */}
        <div className="bg-card rounded-[48px] shadow-xl shadow-card/20 border border-white p-8 space-y-6">
          <div className="space-y-4">
            {dayDiapers.length > 0 ? (
              dayDiapers.map((diaper) => (
                <div key={diaper.id} className="bg-white p-5 rounded-3xl border border-solid border-gray-100 flex justify-between items-start text-left">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{diaper.type === 'Wet' ? '💧' : diaper.type === 'Dirty' ? '💩' : '🔄'}</span>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm leading-none">{diaper.type} Diaper Log</h4>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">
                          {diaper.type !== 'Dirty' && `${diaper.wetIntensity} Wetness (${diaper.wetWeight}g)`}
                          {diaper.type === 'Both' && ' • '}
                          {diaper.type !== 'Wet' && `Bristol Type ${diaper.stoolType}`}
                        </p>
                        
    </div>
                      
    </div>

                    {diaper.type !== 'Wet' && (
                      <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-2xl border border-solid border-gray-100/50">
                        <div>
                          <span className="font-black text-gray-400 uppercase tracking-wider text-[8px] block mb-0.5">Stool Colour</span>
                          <span className="text-gray-800 font-bold text-[10px] flex items-center gap-1.5">
                            <span 
                              className="w-2.5 h-2.5 rounded-full inline-block border border-gray-200/50" 
                              style={{ 
                                backgroundColor: (() => {
                                  const c = (diaper.poopColor || 'yellow').toLowerCase();
                                  if (c.includes('yellow') || c.includes('mustard')) return '#ffd166';
                                  if (c.includes('brown')) return '#a06a42';
                                  if (c.includes('green')) return '#52b788';
                                  if (c.includes('clay') || c.includes('white')) return '#e5e5e5';
                                  if (c.includes('red')) return '#ef476f';
                                  if (c.includes('black')) return '#212529';
                                  return '#ffd166';
                                })() 
                              }} 
                            />
                            {diaper.poopColor || 'Yellow'}
                          </span>
                          
    </div>
                        <div>
                          <span className="font-black text-gray-400 uppercase tracking-wider text-[8px] block mb-0.5">Stool Consistency</span>
                          <span className="text-gray-800 font-bold text-[10px]">{diaper.poopConsistency || 'Normal'}</span>
                          
    </div>
                        
    </div>
                    )}

                    {diaper.recentFoods && diaper.recentFoods.length > 0 && (
                      <div className="text-[10px] font-semibold text-gray-500 bg-gray-50 p-2.5 rounded-xl leading-snug">
                        <span className="font-black text-gray-600 uppercase tracking-wider text-[8px] block mb-0.5">Correlated Foods in Last 24h:</span>
                        {diaper.recentFoods.join(', ')}
                        
    </div>
                    )}

                    {diaper.symptoms && (
                      <p className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg inline-block">
                        ⚠️ Symptom: {diaper.symptoms}
                      </p>
                    )}

                    {diaper.notes && (
                      <p className="text-[11px] text-gray-500 leading-normal font-medium italic">"{diaper.notes}"</p>
                    )}
                    
    </div>
                  <button 
                    onClick={() => handleDeleteDiaper(diaper.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
    </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-gray-400 italic">No diapers logged for {selectedDate.toLocaleDateString()}.</p>
                <button 
                  onClick={() => setShowDiaperLogger(true)}
                  className="text-[10px] text-primary font-black uppercase tracking-widest mt-2 underline cursor-pointer border-none bg-transparent font-bold"
                >
                  Quick Log Now
                </button>
                
    </div>
            )}
            
    </div>
          
    </div>
        
    </div>

      {/* Dynamic Date Reflection & Thoughts Preview Card */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <div className="space-y-0.5">
            <h2 className="text-xl font-serif font-black text-gray-800 text-left">
              {isToday ? "Today's" : isYesterday ? "Yesterday's" : selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} Reflection & Thoughts ✍️
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-left">
              {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            
    </div>
          <button 
            onClick={() => setActiveTab('diary')}
            className="px-3.5 py-1.5 rounded-full bg-white text-primary border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 cursor-pointer shadow-xs font-bold transition-transform active:scale-95"
          >
            Open Diary 📖
          </button>
          
    </div>
        <div className="bg-card rounded-[48px] shadow-xl shadow-card/20 border border-white p-6 sm:p-8 text-left space-y-4">
          {todayDiaryEntries.length > 0 ? (
            <div className="space-y-3">
              {todayDiaryEntries.map(entry => (
                <div key={entry.id} className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {entry.mood || '✨ Grateful'} • {entry.category || 'Thought'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">{entry.timestamp || ''}</span>
                    
    </div>
                  <h4 className="font-serif font-bold text-gray-800 text-sm">{entry.title || 'Daily Reflection'}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-sans">{entry.notes}</p>
                  
    </div>
              ))}
              
    </div>
          ) : (
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 text-center py-5 space-y-3 shadow-xs">
              <p className="text-xs text-gray-500 font-medium">
                No personal thoughts or diary entries written for {isToday ? 'today' : selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}.
              </p>
              <button 
                onClick={() => setActiveTab('diary')}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-full text-xs font-bold shadow-md shadow-primary/20 cursor-pointer border-none uppercase tracking-wider transition-transform active:scale-95"
              >
                ✍️ Write {isToday ? "Today's" : isYesterday ? "Yesterday's" : selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} Story or Thought
              </button>
              
    </div>
          )}
          
    </div>
        
    </div>

      {/* Observation Notes (Caregiver Observations & Notes) */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif font-black text-gray-800 px-2 text-left">Care Notes & Observations</h2>
        <div className="bg-card rounded-[48px] shadow-xl shadow-card/20 border border-white p-8 text-left">
          {currentObs ? (
            <div className="space-y-4">
              {currentObs.symptoms && (
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-solid border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Care Observations</p>
                  <p className="font-medium text-gray-800 text-xs">{currentObs.symptoms}</p>
                  
    </div>
              )}
              {currentObs.notes && (
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-solid border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Caregiver Notes</p>
                  <p className="font-medium text-gray-800 text-xs leading-relaxed">{currentObs.notes}</p>
                  
    </div>
              )}
              {!currentObs.symptoms && !currentObs.notes && (
                <p className="text-xs text-gray-400 italic px-2">No care observations or notes logged for this date.</p>
              )}
              
    </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Observations (If Any)</label>
                <input type="text" className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-medium outline-none text-gray-700" placeholder="Fussiness, teething drool, mood changes..." value={obsSymptoms} onChange={e => setObsSymptoms(e.target.value)} />
                
    </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Caregiver Notes</label>
                <textarea className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs font-medium outline-none text-gray-700 h-20 resize-none" placeholder="Write any extra care details or meal reaction notes here..." value={obsNotes} onChange={e => setObsNotes(e.target.value)} />
                
    </div>
              <button onClick={saveObservation} className="w-full py-4 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 cursor-pointer border-none">Save Care Notes</button>
              
    </div>
          )}
          
    </div>
        
    </div>
          </motion.div>
        )}

        {/* --- PERSONAL DIARY & THOUGHTS TAB --- */}
        {activeTab === 'diary' && !isPremium ? (
          <motion.div
            key="diary-premium-restricted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card p-8 sm:p-10 rounded-[40px] border border-white shadow-xl shadow-card/20 text-center max-w-xl mx-auto space-y-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🔒
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Ama Premium Feature
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-800">
                Daily Diary & AI Storybook
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
                Record your daily parenting reflections, emotional memories, milestones, and generate AI-illustrated keepsake storybooks with Ama Premium.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-gray-100 text-left space-y-2.5 text-xs text-gray-600">
              <p className="font-bold text-gray-800 flex items-center gap-1.5">
                <span>✨</span> <span>What you unlock with Premium:</span>
              </p>
              <ul className="space-y-1.5 pl-5 list-disc text-[11px] text-gray-600">
                <li>Unlimited daily parent journaling, emotional mood tracking & guided prompts</li>
                <li>AI Keepsake Illustrated Storybook generator based on recorded memories</li>
                <li>Searchable history timeline & multimedia photo reflections</li>
              </ul>
            </div>

            <button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/25 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
            >
              <span>👑 Upgrade with Paystack</span>
            </button>
          </motion.div>
        ) : activeTab === 'diary' && userRole === 'nanny' ? (
          <motion.div
            key="diary-nanny-restricted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card p-8 sm:p-10 rounded-[40px] border border-white shadow-xl shadow-card/20 text-center max-w-xl mx-auto space-y-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-amber-100/80 text-amber-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🔒
              
    </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Village Privacy Protection
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-800">
                Family Diary & Biographer Restricted
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Personal family reflections, emotional notes, and AI Keepsake Storybooks are protected and reserved for the primary family circle.
              </p>
              
    </div>

            <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 text-left space-y-2.5 text-xs text-gray-600">
              <p className="font-bold text-gray-800 flex items-center gap-1.5">
                <span>🧸</span>
                <span>Active Caregiver Privileges:</span>
              </p>
              <ul className="space-y-1.5 pl-4 text-[11px] list-disc list-outside text-gray-600">
                <li>Log bottle feeds, breast pumps, and solid meals in <strong>Daily Logs</strong></li>
                <li>Record diaper changes, wetness checks, and diaper photo AI analysis</li>
                <li>Track daily fluid & hydration milestones in real time</li>
                <li>Set alarms and track scheduled medications and nap timers</li>
              </ul>
              
    </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => setActiveTab('daily')}
                className="px-6 py-3.5 bg-primary text-white rounded-full text-xs font-black uppercase tracking-wider shadow-md hover:bg-primary/90 transition-all cursor-pointer border-none"
              >
                Open Daily Logs 🍼
              </button>
              {setUserRole && (
                <button
                  onClick={() => setUserRole('admin')}
                  className="px-5 py-3.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 rounded-full text-xs font-bold transition-all cursor-pointer"
                >
                  Switch to Admin (Parent) 👑
                </button>
              )}
              
    </div>
          </motion.div>
        ) : activeTab === 'diary' && (
          <motion.div
            key="diary-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StorybookGenerator diaryEntries={loggedMoods && loggedMoods.length > 0 ? loggedMoods : observationLogs.filter(o => o.type === 'diary' || o.mood || o.notes)} babyName={babyName} />
              <MemorySlideshow memories={memories} babyName={babyName} onAddMemory={setMemories ? (m) => setMemories([...memories, m]) : undefined} />
              
    </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
            {/* Selected Date Header Banner */}
            <div className="bg-card p-6 sm:p-7 rounded-[36px] border border-white shadow-xl shadow-card/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      Parent & Baby Personal Diary
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-white px-2.5 py-0.5 rounded-full border border-gray-100 shadow-2xs">
                      {selectedDateLabel}
                    </span>
                    
    </div>
                  <h2 className="text-xl font-serif font-black text-gray-800 mt-2">
                    {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h2>
                  
    </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button 
                    onClick={() => {
                      const prev = new Date(selectedDate);
                      prev.setDate(prev.getDate() - 1);
                      setSelectedDate(prev);
                      setCurrentMonth(prev.getMonth());
                      setCurrentYear(prev.getFullYear());
                    }}
                    className="p-2.5 bg-white rounded-xl text-gray-600 hover:text-gray-900 shadow-xs cursor-pointer border border-gray-100 hover:border-gray-200 transition-colors"
                    title="Previous Day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      const now = new Date();
                      setSelectedDate(now);
                      setCurrentMonth(now.getMonth());
                      setCurrentYear(now.getFullYear());
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer border transition-all ${
                      isToday 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    Today
                  </button>
                  <button 
                    onClick={() => {
                      const next = new Date(selectedDate);
                      next.setDate(next.getDate() + 1);
                      setSelectedDate(next);
                      setCurrentMonth(next.getMonth());
                      setCurrentYear(next.getFullYear());
                    }}
                    className="p-2.5 bg-white rounded-xl text-gray-600 hover:text-gray-900 shadow-xs cursor-pointer border border-gray-100 hover:border-gray-200 transition-colors"
                    title="Next Day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  
    </div>
                
    </div>
              
    </div>

            {/* Diary Entry Composer Form */}
            <div className="bg-card p-6 md:p-8 rounded-[40px] shadow-xl shadow-card/15 border border-white space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-serif font-black text-gray-800">
                    {editingDiaryId 
                      ? '✏️ Edit Diary Entry' 
                      : `✍️ Write ${isToday ? "Today's" : isYesterday ? "Yesterday's" : selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} Thought or Reflection`}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    Saving for {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  
    </div>
                {editingDiaryId && (
                  <button 
                    onClick={() => {
                      setEditingDiaryId(null);
                      setDiaryTitle('');
                      setDiaryNotes('');
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 font-bold underline cursor-pointer border-none bg-transparent"
                  >
                    Cancel Edit
                  </button>
                )}
                
    </div>

              {/* Mood Selector Pills */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  {isToday ? "Today's Vibe / Feeling" : `Vibe / Feeling for ${selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIARY_MOODS.map(m => (
                    <button
                      key={m.label}
                      onClick={() => setDiaryMood(m.label)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold cursor-pointer transition-all border ${
                        diaryMood === m.label
                          ? `${m.color} ring-2 ring-primary/40 shadow-xs scale-105`
                          : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                  
    </div>
                
    </div>

              {/* Category Tag Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  Topic Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIARY_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setDiaryCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all border ${
                        diaryCategory === cat
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  
    </div>
                
    </div>

              {/* Optional Entry Title Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  Entry Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Afternoon laugh at the park, First full night of sleep..."
                  value={diaryTitle}
                  onChange={e => setDiaryTitle(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-2xl p-3.5 text-sm font-semibold outline-none text-gray-800 focus:border-primary transition-all shadow-xs"
                />
                
    </div>

              {/* Story / Thoughts Textarea */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  Your Story or Personal Thoughts
                </label>
                <textarea
                  rows={4}
                  placeholder={`Write down your thoughts, memories, highlights, parenting feelings, or story of ${isToday ? 'today' : selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}...`}
                  value={diaryNotes}
                  onChange={e => setDiaryNotes(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm font-medium outline-none text-gray-800 focus:border-primary transition-all resize-y leading-relaxed shadow-xs"
                />
                <p className="text-[10px] text-gray-400 italic">
                  💡 Prompt: {isToday ? "What brought you warmth or peace today? What did you discover about your baby or yourself?" : `What memories or feelings stood out on ${selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}?`}
                </p>
                
    </div>

              {/* Save Button */}
              <button
                onClick={handleSaveDiaryEntry}
                disabled={!diaryNotes.trim()}
                className={`w-full py-4 rounded-full text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border-none ${
                  diaryNotes.trim()
                    ? 'bg-primary hover:bg-primary/90 shadow-primary/25 active:scale-98'
                    : 'bg-gray-300 cursor-not-allowed shadow-none'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{editingDiaryId ? 'Update Diary Entry' : `Save Entry for ${selectedDateLabel}`}</span>
              </button>
              
    </div>

            {/* Diary Entries Feed & History Timeline */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <div>
                  <h3 className="font-serif font-black text-gray-800 text-xl">
                    {diaryViewMode === 'selected' 
                      ? `${selectedDateLabel} Memories & Feed` 
                      : 'All Diary Memories & Feed'}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    {diaryViewMode === 'selected' 
                      ? `Entries recorded for ${selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`
                      : 'Browse complete historical reflections'}
                  </p>
                  
    </div>

                {/* Filter Switcher: Selected Date vs All */}
                <div className="bg-gray-100 p-1 rounded-2xl flex border border-gray-200/50">
                  <button
                    onClick={() => setDiaryViewMode('selected')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all border-none ${
                      diaryViewMode === 'selected' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 bg-transparent'
                    }`}
                  >
                    {selectedDateLabel} ({todayDiaryEntries.length})
                  </button>
                  <button
                    onClick={() => setDiaryViewMode('all')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all border-none ${
                      diaryViewMode === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 bg-transparent'
                    }`}
                  >
                    All Entries ({observationLogs.filter(o => o.type === 'diary' || (!o.type && o.notes && !o.symptoms)).length})
                  </button>
                  
    </div>
                
    </div>

              {/* Search Field */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search diary thoughts, memories, or tags..."
                  value={diarySearchQuery}
                  onChange={e => setDiarySearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-200 text-xs font-semibold text-gray-800 outline-none focus:border-primary shadow-xs"
                />
                {diarySearchQuery && (
                  <button 
                    onClick={() => setDiarySearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold border-none bg-transparent cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                
    </div>

              {/* Entries Timeline List */}
              <div className="space-y-4">
                {diaryEntries.length > 0 ? (
                  diaryEntries.map(entry => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card p-6 rounded-[32px] border border-white shadow-xl shadow-card/15 space-y-4 relative group"
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                              {entry.mood || '✨ Grateful'}
                            </span>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-white text-gray-600 uppercase tracking-wider border border-gray-100">
                              {entry.category || 'Thought'}
                            </span>
                            
    </div>
                          <h4 className="text-base font-serif font-black text-gray-800 pt-1">
                            {entry.title || 'Daily Reflection'}
                          </h4>
                          
    </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          {entry.timestamp && (
                            <p className="text-[10px] font-bold text-gray-400">{entry.timestamp}</p>
                          )}
                          
    </div>
                        
    </div>

                      <div className="bg-white p-4 rounded-2xl border border-gray-100">
                        <p className="text-sm font-sans text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {entry.notes}
                        </p>
                        
    </div>

                      <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                        <button
                          onClick={() => copyToClipboard(`"${entry.title || 'Daily Reflection'}" - ${entry.notes}`)}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditDiaryEntry(entry)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-gray-50 text-gray-700 text-[10px] font-bold cursor-pointer transition-colors border border-gray-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteDiaryEntry(entry.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold cursor-pointer transition-colors border-none"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                          
    </div>
                        
    </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-white p-8 rounded-[36px] border border-dashed border-gray-200 text-center space-y-3">
                    <span className="text-4xl block">📖</span>
                    <h4 className="font-serif font-black text-gray-800 text-base">No Diary Thoughts Found</h4>
                    <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                      {diarySearchQuery 
                        ? `No thoughts matched "${diarySearchQuery}". Try a different term or clear the search.`
                        : diaryViewMode === 'selected'
                        ? `No thoughts logged for ${selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}. Use the form above to record your thoughts for this date!`
                        : `Your diary is empty. Start recording special moments and daily reflections above!`
                      }
                    </p>
                    
    </div>
                )}
                
    </div>
              
    </div>
              
    </div>
          </motion.div>
        )}

        {/* --- WEEKLY PLANNER TAB --- */}
        {activeTab === 'weekly' && !isPremium ? (
          <motion.div
            key="weekly-premium-restricted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card p-8 sm:p-10 rounded-[40px] border border-white shadow-xl shadow-card/20 text-center max-w-xl mx-auto space-y-6"
          >
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🔒
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Ama Premium Feature
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-800">
                7-Day Weekly Solid Menu & Grocery Checklist
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
                Organize full 7-day solid food weaning schedules, balance nutrient variety, and auto-compile organized grocery shopping lists with Ama Premium.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-gray-100 text-left space-y-2.5 text-xs text-gray-600">
              <p className="font-bold text-gray-800 flex items-center gap-1.5">
                <span>🛒</span> <span>What you unlock with Premium:</span>
              </p>
              <ul className="space-y-1.5 pl-5 list-disc text-[11px] text-gray-600">
                <li>Whole-week 7-day solid meal assignment & age-appropriate portion balancing</li>
                <li>Automated localized grocery shopping list with estimated market pricing</li>
                <li>AI 7-Day Solid Meal Planner integration with allergen filters</li>
              </ul>
            </div>

            <button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
            >
              <span>👑 Upgrade with Paystack</span>
            </button>
          </motion.div>
        ) : activeTab === 'weekly' && (
          <motion.div 
            key="weekly-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Weekly Meal Planner */}
            <div className="bg-card p-6 rounded-[48px] shadow-xl shadow-card/15 border border-white space-y-6 text-left">
              <div className="flex justify-between items-center px-2">
                <div>
                  <h3 className="font-serif font-black text-gray-800 text-lg">Weekly Menu</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Plan Whole-Week Solid Foods</p>
                  
    </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => isPremium ? onNavigate('ai-meal-planner') : setIsSubscriptionModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border-none font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Generate Plan</span>
                  </button>
                  <button 
                    onClick={handleResetWeeklyPlanner}
                    className="px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 cursor-pointer transition-colors border-none font-bold"
                  >
                    Reset
                  </button>
                  
    </div>
                
    </div>

              {/* AI Meal Plan CTA Banner */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-primary/10 p-4 rounded-3xl border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white text-emerald-600 flex items-center justify-center text-xl shrink-0 shadow-xs">
                    🥗
                    
    </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">Need an Age-Optimized Solid Food Plan?</p>
                    <p className="text-[10px] text-gray-500 font-medium">Auto-generate 7 days of nutrient-targeted meals + localized grocery list</p>
                    
    </div>
                  
    </div>
                <button
                  onClick={() => isPremium ? onNavigate('ai-meal-planner') : setIsSubscriptionModalOpen(true)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl cursor-pointer border-none transition-transform active:scale-95 whitespace-nowrap self-stretch sm:self-auto"
                >
                  Generate 7-Day Plan →
                </button>
                
    </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {WEEK_DAYS.map(day => (
                  <div key={day} className="bg-white/60 p-4 rounded-3xl border border-solid border-gray-50 space-y-3">
                    <h4 className="font-serif font-black text-gray-800 text-sm border-b border-solid border-gray-100 pb-1">{day}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {MEAL_SLOTS.map(slot => {
                        const recipeId = weeklyPlan[day]?.[slot];
                        const recipe = recipeId ? allMeals.find(m => m.id === recipeId) : null;

                        return (
                          <div key={slot} className="bg-white/80 p-2.5 rounded-2xl border border-solid border-gray-100 flex flex-col justify-between space-y-2 min-h-[90px]">
                            <p className="text-[8px] font-black text-primary uppercase tracking-widest leading-none">{slot}</p>
                            {recipe ? (
                              <div className="flex justify-between items-start gap-1">
                                <span className="text-xs font-bold text-gray-700 leading-tight line-clamp-2">{recipe.title}</span>
                                <button 
                                  onClick={() => handleClearSlot(day, slot)}
                                  className="text-gray-300 hover:text-red-500 font-black text-sm shrink-0 cursor-pointer border-none bg-transparent"
                                >
                                  ✕
                                </button>
                                
    </div>
                            ) : (
                              <button 
                                onClick={() => setShowRecipePicker({ day, slot })}
                                className="w-full border-2 border-dashed border-gray-100 hover:border-primary/30 rounded-xl py-2.5 text-[9px] text-gray-400 font-black uppercase tracking-widest text-center cursor-pointer transition-colors bg-transparent"
                              >
                                + Add
                              </button>
                            )}
                            
    </div>
                        );
                      })}
                      
    </div>
                    
    </div>
                ))}
                
    </div>
              
    </div>

            {/* Automated Grocery Checklist */}
            <div className="bg-card p-6 rounded-[48px] shadow-xl shadow-card/15 border border-white space-y-5 text-left">
              <div className="flex items-center gap-2 px-2">
                <ShoppingBag className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-serif font-black text-gray-800 text-lg leading-tight">Automated Grocery Checklist</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Consolidated Ingredients for Shopping</p>
                  
    </div>
                
    </div>

              <div className="space-y-2">
                {consolidatedGroceries.length > 0 ? (
                  consolidatedGroceries.map((item, idx) => {
                    const isChecked = groceryChecked.includes(item.name);
                    return (
                      <button 
                        key={idx}
                        onClick={() => handleToggleGrocery(item.name)}
                        className={`w-full bg-white p-3.5 rounded-2xl border border-solid text-left flex items-center justify-between cursor-pointer transition-all ${
                          isChecked ? 'bg-green-50/40 border-green-200 opacity-60' : 'bg-white border-gray-100 hover:border-primary/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border border-solid flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 bg-gray-50'
                          }`}>
                            {isChecked && '✓'}
                            
    </div>
                          <span className={`text-xs font-bold text-gray-700 ${isChecked ? 'line-through text-gray-400' : ''}`}>
                            {item.name}
                          </span>
                          
    </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                          {item.count} meals ({item.amounts.join(', ')})
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 bg-white/50 border border-dashed border-gray-100 rounded-3xl">
                    <p className="text-xs text-gray-400 italic">Your grocery checklist is empty.</p>
                    <p className="text-[10px] text-gray-400 font-medium px-6 mt-1">
                      Assign recipes to days in the planner above to automatically parse and compile ingredients here!
                    </p>
                    
    </div>
                )}
                
    </div>
              
    </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recipe selector modal for weekly planner */}
      <AnimatePresence>
        {showRecipePicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-6 max-w-sm w-full border border-solid border-gray-100 shadow-2xl space-y-6 relative max-h-[80vh] overflow-y-auto text-left"
            >
              <header className="text-center space-y-1">
                <h3 className="text-xl font-serif font-black text-gray-800">Choose Recipe</h3>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  For {showRecipePicker.day}'s {showRecipePicker.slot}
                </p>
              </header>

              <div className="space-y-3">
                {allMeals.map(recipe => (
                  <button 
                    key={recipe.id}
                    onClick={() => handleAssignRecipe(recipe.id)}
                    className="w-full p-4 rounded-2xl bg-gray-50 hover:bg-primary/5 hover:border-primary/20 border border-transparent text-left flex gap-3 items-center cursor-pointer transition-all"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm">
                      {recipe.newFood || '🥣'}
                      
    </div>
                    <div className="space-y-0.5 leading-tight">
                      <p className="font-bold text-gray-800 text-xs">{recipe.title}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">{recipe.stage}</p>
                      
    </div>
                  </button>
                ))}
                
    </div>

              <button 
                onClick={() => setShowRecipePicker(null)} 
                className="w-full py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-gray-200 text-center border-none"
              >
                Close
              </button>
            </motion.div>
            
    </div>
        )}
      </AnimatePresence>

      {/* Baby Progress Report Printable Modal Overlay */}
      <AnimatePresence>
        {showReport && (
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-8 space-y-8 flex flex-col md:p-12 print:p-0 print:m-0 print:inset-auto print:static text-left font-sans">
            
            {/* Header / Actions */}
            <div className="flex justify-between items-center print:hidden">
              <button 
                onClick={() => setShowReport(false)} 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest rounded-full transition-colors cursor-pointer border-none"
              >
                ✕ Close Report
              </button>
              <button 
                onClick={async () => {
                  if (!isPremium) {
                    setIsSubscriptionModalOpen(true);
                    return;
                  }
                  const element = document.getElementById('print-report-content');
                  if (!element) return;
                  try {
                    const canvas = await html2canvas(element, { scale: 2 });
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({
                      orientation: 'portrait',
                      unit: 'mm',
                      format: 'a4'
                    });
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save('ama-progress-report.pdf');
                  } catch (e) {
                    console.error("PDF generation failed", e);
                    window.print();
                  }
                }}
                className="flex items-center gap-1.5 bg-primary text-white border-none px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-primary/25"
              >
                <Printer className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
              
    </div>

            {/* Document body container */}
            <div id="print-report-content" className="max-w-2xl mx-auto w-full border border-solid border-gray-100 rounded-3xl p-8 space-y-8 bg-white shadow-xl print:shadow-none print:border-none print:p-0">
              
              {/* Summary Header Card */}
              <div className="border-b-4 border-primary pb-6 space-y-2 flex justify-between items-end">
                <div className="space-y-1">
                  <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Growth & Health Summary</span>
                  <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-serif font-black text-gray-800">
                      Baby's Progress
                    </h2>
                    
    </div>
                  <p className="text-xs text-gray-500 font-medium">Generated on {new Date().toLocaleDateString('default', { dateStyle: 'long' })} • Patient age: {latestGrowthLog ? latestGrowthLog.month : 'Not Set'}</p>
                  
    </div>
                <div className="text-right space-y-1">
                  <p className="text-lg font-serif font-bold text-primary">Ogoo</p>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none">Baby Companion App</p>
                  
    </div>
                
    </div>

              {/* Quick Health Indicators Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-solid border-gray-100 text-center space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Latest Weight</p>
                  <p className="text-xl font-bold text-gray-800 leading-none">
                    {latestGrowthLog ? `${latestGrowthLog.weight} kg` : 'N/A'}
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 leading-none mt-1">
                    {latestGrowthLog ? `${getLatestWeightPercentile(latestGrowthLog.weight)}th percentile` : 'No data logged'}
                  </p>
                  
    </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-solid border-gray-100 text-center space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Latest Height</p>
                  <p className="text-xl font-bold text-gray-800 leading-none">
                    {latestGrowthLog ? `${latestGrowthLog.height} cm` : 'N/A'}
                  </p>
                  <p className="text-[9px] font-bold text-gray-400 leading-none mt-1">
                    {latestGrowthLog ? `${getLatestHeightPercentile(latestGrowthLog.height)}th percentile` : 'No data logged'}
                  </p>
                  
    </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-solid border-gray-100 text-center space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Fluid Intake Today</p>
                  <p className="text-xl font-bold text-gray-800 leading-none">{fluidMl} ml</p>
                  <p className="text-[9px] font-bold text-gray-400 leading-none mt-1">Target: {fluidTarget} ml</p>
                  
    </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-solid border-gray-100 text-center space-y-1">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Growth Quests Completed</p>
                  <p className="text-xl font-bold text-gray-800 leading-none">
                    {activities.length > 0 ? Math.round((activities.filter(a => a.isCompleted).length / activities.length) * 100) : 0}%
                  </p>
                  <p className="text-[9px] font-bold text-green-600 leading-none mt-1">
                    {dailyStreak > 0 ? `${dailyStreak} Day Streak Active` : 'No Active Streak'}
                  </p>
                  
    </div>
                
    </div>

              {/* Solids & Foods Milestone Summary Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest border-l-4 border-primary pl-2 leading-none">Nutritional Milestones</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 p-4 rounded-2xl border border-solid border-gray-100 space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Newly Cleared Allergens</p>
                    {clearedAllergensList.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {clearedAllergensList.map((a, i) => (
                          <span key={i} className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            ✓ {a.name}
                          </span>
                        ))}
                        
    </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic">No allergens cleared yet.</p>
                    )}
                    
    </div>
                  <div className="bg-gray-50/50 p-4 rounded-2xl border border-solid border-gray-100 space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Under-monitoring / Suspected</p>
                    {suspectedAllergensList.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {suspectedAllergensList.map((a, i) => (
                          <span key={i} className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            ⚠️ {a.name}
                          </span>
                        ))}
                        
    </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic">No suspected reaction allergens recorded.</p>
                    )}
                    
    </div>
                  
    </div>

                <div className="bg-gray-50/50 p-4 rounded-2xl border border-solid border-gray-100 space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Introduced Ingredients Log</p>
                  {loggedMeals.length > 0 ? (
                    <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                      Eaten successfully: {Array.from(new Set(loggedMeals.map(m => `${m.newFood || '🥣'} ${m.title}`))).join(', ')}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic font-medium">No solid meals logged yet. Baby is fully on milk/formula plan.</p>
                  )}
                  
    </div>
                
    </div>

              {/* Digestive & Symptoms Tracker Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest border-l-4 border-primary pl-2 leading-none">Digestive & Diaper Tracker</h3>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-solid border-gray-100 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="leading-none space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Wet Diapers</p>
                      <p className="font-bold text-gray-800 text-sm">{totalWetDiapers} Logged</p>
                      
    </div>
                    <div className="leading-none space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Dirty Diapers</p>
                      <p className="font-bold text-gray-800 text-sm">{totalDirtyDiapers} Logged</p>
                      
    </div>
                    <div className="leading-none space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Average Stool Type</p>
                      <p className="font-bold text-gray-800 text-sm">
                        Type {avgStoolType} - {avgStoolType === 4 ? 'Optimal Smooth' : avgStoolType > 4 ? 'Loose' : 'Hard'}
                      </p>
                      
    </div>
                    
    </div>

                  {reactionMealsList.length > 0 && (
                    <div className="bg-red-50 border border-solid border-red-100 p-3 rounded-xl space-y-1">
                      <p className="text-[9px] font-black text-red-800 uppercase tracking-widest">Recent Symptoms/Reactions under doctor audit:</p>
                      <ul className="list-disc pl-4 text-[11px] font-bold text-red-700 space-y-0.5">
                        {reactionMealsList.map((m, idx) => (
                          <li key={idx}>
                            {m.title}: {m.allergyNotes || 'Mild skin rashes reported.'}
                          </li>
                        ))}
                      </ul>
                      
    </div>
                  )}
                  
    </div>
                
    </div>

              {/* Medication History Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest border-l-4 border-primary pl-2 leading-none">Medication & Vaccine History</h3>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-solid border-gray-100 space-y-3">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Medications Logged</p>
                    {scheduledMeds && scheduledMeds.filter(m => m.completed).length > 0 ? (
                      <ul className="list-disc pl-4 text-xs font-bold text-gray-700 space-y-1">
                        {scheduledMeds.filter(m => m.completed).slice(0, 5).map(m => (
                          <li key={m.id}>{m.name || m.title} ({m.dosage}) on {m.date || 'Recent'}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic">No recent medications logged.</p>
                    )}
                    
    </div>
                  
                  <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vaccine Status</p>
                    {vaccineSchedule && vaccineSchedule.length > 0 ? (
                      <ul className="list-disc pl-4 text-xs font-bold text-gray-700 space-y-1">
                        {vaccineSchedule.filter(v => v.status === 'Completed').map(v => (
                          <li key={v.id}>{v.name} (Milestone: {v.age}) - Completed</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic">No vaccines recorded.</p>
                    )}
                    
    </div>
                  
    </div>
                
    </div>

              {/* Notes block for caregiver use */}
              <div className="border-t border-gray-200 pt-6 space-y-3">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Review & Recommendations</p>
                <div className="h-24 w-full border border-dashed border-gray-200 rounded-2xl bg-gray-50/30 p-4">
                  <p className="text-[10px] text-gray-300 italic">Review notes space... (Print to write down or fill manually)</p>
                  
    </div>
                
    </div>

              {/* Footer details */}
              <footer className="text-center text-[10px] text-gray-400 font-medium pt-4 border-t border-gray-100">
                Ama - Smart Weaning Companion App • Secured caregiver PDF report document.
              </footer>
              
    </div>
            
    </div>
        )}
      </AnimatePresence>
      
    </div>
  );
};



