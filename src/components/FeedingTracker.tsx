import React, { useState, useEffect, useRef } from 'react';
import { Droplet, Timer, Play, Pause, RotateCcw, Plus, Calendar, Clock, ChevronLeft, AlertCircle, Info, Check, Trash2, Edit3, Heart, PlusCircle, Award, Sparkles, CheckCircle2, Lock, Flame, Dna, Shield, Search, ChevronRight } from 'lucide-react';
import { CircularProgress } from './CircularProgress';
import { motion, AnimatePresence } from 'motion/react';
import { COMMON_INGREDIENTS } from '../constants/babyData';
import { MOCK_MEALS, THEME } from '../constants';
import { Meal } from '../types';

export const FeedingTracker = ({ 
  fluidMl, 
  fluidTarget, 
  onAddFluid, 
  onSetTarget, 
  scheduledMeals, 
  setScheduledMeals,
  onNavigate,
  allergenMatrix,
  setAllergenMatrix,
  loggedMeals,
  userRole = 'admin'
}: { 
  fluidMl: number; 
  fluidTarget: number; 
  onAddFluid: (amount?: number) => void; 
  onSetTarget: (target: number) => void; 
  scheduledMeals: any[]; 
  setScheduledMeals: (meals: any[]) => void;
  onNavigate: (screen: string, data?: any, autoOpenLog?: boolean) => void;
  allergenMatrix: any[];
  setAllergenMatrix: (matrix: any[]) => void;
  loggedMeals: any[];
  userRole?: string;
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'allergen' | 'guide'>('today');
  const [timer, setTimer] = useState(0);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [editTargetValue, setEditTargetValue] = useState(fluidTarget.toString());
  const [isActive, setIsActive] = useState(false);

  // Dedicated breastfeeding Left/Right interactive exclusive timers
  const [leftTimer, setLeftTimer] = useState(0);
  const [rightTimer, setRightTimer] = useState(0);
  const [isLeftActive, setIsLeftActive] = useState(false);
  const [isRightActive, setIsRightActive] = useState(false);

  // Bottle logger state
  const [bottleInput, setBottleInput] = useState('');
  const [bottleType, setBottleType] = useState<'Pumped' | 'Formula'>('Pumped');

  // Local feeding history logs with exact timestamps
  const [feedingLogs, setFeedingLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('local_feeding_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('local_feeding_logs', JSON.stringify(feedingLogs));
  }, [feedingLogs]);

  // Breastfeeding timer effects
  useEffect(() => {
    let interval: any;
    if (isLeftActive) {
      interval = setInterval(() => setLeftTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isLeftActive]);

  useEffect(() => {
    let interval: any;
    if (isRightActive) {
      interval = setInterval(() => setRightTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRightActive]);

  const handleStartLeft = () => {
    setIsLeftActive(true);
    setIsRightActive(false); // Exclusive
  };

  const handleStartRight = () => {
    setIsRightActive(true);
    setIsLeftActive(false); // Exclusive
  };

  const handleSaveNursingSession = () => {
    if (leftTimer === 0 && rightTimer === 0) return;
    const now = new Date();
    const newLog = {
      id: `nursing-${Date.now()}`,
      type: 'Nursing Session',
      leftDuration: leftTimer,
      rightDuration: rightTimer,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: now.toLocaleDateString(),
      exactTime: now.toISOString()
    };
    setFeedingLogs([newLog, ...feedingLogs]);
    
    // Reset timers
    setLeftTimer(0);
    setRightTimer(0);
    setIsLeftActive(false);
    setIsRightActive(false);
  };

  const handleSaveBottleLog = () => {
    const amount = parseInt(bottleInput);
    if (isNaN(amount) || amount <= 0) return;
    const now = new Date();
    const newLog = {
      id: `bottle-${Date.now()}`,
      type: 'Bottle Feed',
      bottleType: bottleType,
      amount: amount,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: now.toLocaleDateString(),
      exactTime: now.toISOString()
    };
    setFeedingLogs([newLog, ...feedingLogs]);
    
    // Add amount to total fluid intake (which updates Progress Indicators)
    onAddFluid(amount);

    // Reset input
    setBottleInput('');
  };

  const handleDeleteFeedingLog = (id: string) => {
    setFeedingLogs(feedingLogs.filter(log => log.id !== id));
  };

  // Allergen states
  const [selectedAllergen, setSelectedAllergen] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editDay, setEditDay] = useState<number>(1);
  const [editNotes, setEditNotes] = useState<string>('');

  // Search in safety guide
  const [searchQuery, setSearchQuery] = useState('');
  const [guideFilter, setGuideFilter] = useState<'all' | 'green' | 'amber' | 'red'>('all');
  const [selectedFood, setSelectedFood] = useState<any | null>(null);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAllergenEmoji = (name: string) => {
    switch (name) {
      case 'Peanuts': return '🥜';
      case 'Egg': return '🥚';
      case 'Tree Nuts': return '🌰';
      case 'Dairy': return '🥛';
      case 'Soy': return '🫘';
      case 'Sesame': return '🌾';
      case 'Wheat': return '🌾';
      case 'Shellfish': return '🍤';
      default: return '🥑';
    }
  };

  const handleOpenAllergenModal = (allergen: any) => {
    setSelectedAllergen(allergen);
    setEditStatus(allergen.status);
    setEditDay(allergen.day || 1);
    setEditNotes(allergen.notes || '');
  };

  const handleSaveAllergen = () => {
    if (!selectedAllergen) return;
    const updated = (allergenMatrix || []).map(item => {
      if (item.id === selectedAllergen.id) {
        return {
          ...item,
          status: editStatus,
          day: editStatus === 'In Progress' ? editDay : (editStatus === 'Cleared' ? 3 : 0),
          notes: editNotes
        };
      }
      return item;
    });
    setAllergenMatrix(updated);
    setSelectedAllergen(null);
  };

  // Sync allergen reaction status from logged meals
  useEffect(() => {
    // If there is any logged meal with an allergy reaction, check if we can mark the suspected allergen
    const reactMeals = loggedMeals.filter(m => m.allergyReaction);
    if (reactMeals.length > 0) {
      let changed = false;
      const updated = (allergenMatrix || []).map(allergen => {
        // Simple search: does any meal title or allergy notes match or mention the allergen?
        const mentions = reactMeals.some(m => {
          const text = `${m.title} ${m.allergyNotes} ${m.notes}`.toLowerCase();
          return text.includes(allergen.name.toLowerCase()) || 
                 (allergen.name === 'Dairy' && (text.includes('milk') || text.includes('cheese') || text.includes('yogurt'))) ||
                 (allergen.name === 'Peanuts' && text.includes('peanut')) ||
                 (allergen.name === 'Egg' && text.includes('egg'));
        });
        if (mentions && allergen.status !== 'Suspected Reaction') {
          changed = true;
          return { ...allergen, status: 'Suspected Reaction', notes: `System correlated with allergic reaction log: ${reactMeals[0].title}.` };
        }
        return allergen;
      });
      if (changed) {
        setAllergenMatrix(updated);
      }
    }
  }, [loggedMeals]);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };
  const todayScheduledMeals = scheduledMeals.filter(m => !m.date || isSameDay(new Date(m.date), new Date()));
  const estimatedCalories = todayScheduledMeals.reduce((acc, m) => {
    const hasEnergy = m.nutrients?.find((n: any) => n.label === 'Energy' || n.label === 'Calories');
    if (hasEnergy?.value === 'High') return acc + 250;
    if (hasEnergy?.value === 'Good') return acc + 150;
    return acc + 100;
  }, 0);

  const estimatedProtein = todayScheduledMeals.reduce((acc, m) => {
    const hasProtein = m.nutrients?.find((n: any) => n.label === 'Protein');
    if (hasProtein?.value === 'High') return acc + 15;
    if (hasProtein?.value === 'Good') return acc + 8;
    if (hasProtein?.value === 'Source') return acc + 4;
    return acc + 2;
  }, 0);

  const estimatedVitamins = (() => {
    const vits = new Set<string>();
    todayScheduledMeals.forEach(m => {
      (m.nutrients || []).forEach((n: any) => {
        if (n.label && (n.label.toLowerCase().includes('vit') || n.label.toLowerCase().includes('iron') || n.label.toLowerCase().includes('calc') || n.label.toLowerCase().includes('zinc') || n.label.toLowerCase().includes('folate') || n.label.toLowerCase().includes('fiber'))) {
          vits.add(n.label);
        }
      });
      if (m.meal?.nutrients) {
        m.meal.nutrients.forEach((n: any) => {
          if (n.label && (n.label.toLowerCase().includes('vit') || n.label.toLowerCase().includes('iron') || n.label.toLowerCase().includes('calc') || n.label.toLowerCase().includes('zinc') || n.label.toLowerCase().includes('folate') || n.label.toLowerCase().includes('fiber'))) {
            vits.add(n.label);
          }
        });
      }
    });
    if (todayScheduledMeals.length > 0 && vits.size === 0) {
      vits.add('Vit A');
      vits.add('Vit C');
      vits.add('Iron');
      if (todayScheduledMeals.length > 1) vits.add('Vit D');
      if (todayScheduledMeals.length > 2) vits.add('Calcium');
    }
    return Array.from(vits);
  })();

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-32 space-y-8 bg-background min-h-screen">
      <header className="flex justify-between items-center pt-3 sm:pt-4 pb-2 px-1">
        <h1 className="text-2xl font-serif font-black text-gray-800">Feeding Tracker</h1>
        <div className="w-11 h-11 rounded-full bg-card shadow-sm border border-white flex items-center justify-center">
          <Timer className="w-5 h-5 text-gray-500" />
          
    </div>
      </header>

      {/* Segmented Sub-tabs */}
      <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-[24px] flex w-full border border-white/20 shadow-sm">
        <button 
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all cursor-pointer ${
            activeTab === 'today' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Plan
        </button>
        <button 
          onClick={() => setActiveTab('allergen')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all cursor-pointer ${
            activeTab === 'allergen' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Allergens
        </button>
        <button 
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all cursor-pointer ${
            activeTab === 'guide' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Safety Guide
        </button>
        
    </div>

      <AnimatePresence mode="wait">
        {activeTab === 'today' && (
          <motion.div 
            key="today-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Breastfeeding & Bottle Feed Tracking Hub */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Exclusive Nursing Timers Card */}
              <div className="bg-card p-6 rounded-[40px] shadow-sm border border-white space-y-6 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-2xl">🤱</div>
                  <div>
                    <h3 className="text-sm font-serif font-black text-gray-800">Breastfeeding Timers</h3>
                    <p className="text-[11px] text-gray-400 font-medium">Exclusive Left & Right session timers</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-3xl">
                  {/* Left Breast Timer */}
                  <div className="flex flex-col items-center p-3 bg-white rounded-2xl border border-solid border-gray-100/50 space-y-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Left Breast</span>
                    <span className="text-3xl font-mono font-bold text-gray-800 leading-none">{formatTime(leftTimer)}</span>
                    <button
                      onClick={() => {
                        if (isLeftActive) {
                          setIsLeftActive(false);
                        } else {
                          handleStartLeft();
                        }
                      }}
                      className={`w-full py-2 rounded-xl text-[9px] font-black uppercase border-none cursor-pointer tracking-wider text-center transition-all ${isLeftActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                    >
                      {isLeftActive ? 'Pause' : 'Start'}
                    </button>
                    
                  </div>

                  {/* Right Breast Timer */}
                  <div className="flex flex-col items-center p-3 bg-white rounded-2xl border border-solid border-gray-100/50 space-y-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Right Breast</span>
                    <span className="text-3xl font-mono font-bold text-gray-800 leading-none">{formatTime(rightTimer)}</span>
                    <button
                      onClick={() => {
                        if (isRightActive) {
                          setIsRightActive(false);
                        } else {
                          handleStartRight();
                        }
                      }}
                      className={`w-full py-2 rounded-xl text-[9px] font-black uppercase border-none cursor-pointer tracking-wider text-center transition-all ${isRightActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                    >
                      {isRightActive ? 'Pause' : 'Start'}
                    </button>
                    
                  </div>
                  
                </div>

                {(leftTimer > 0 || rightTimer > 0) && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNursingSession}
                      className="flex-1 bg-primary text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer border-none shadow-md shadow-primary/10"
                    >
                      ✓ Save Session
                    </button>
                    <button
                      onClick={() => {
                        setLeftTimer(0);
                        setRightTimer(0);
                        setIsLeftActive(false);
                        setIsRightActive(false);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-500 px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer border-none"
                    >
                      Reset
                    </button>
                    
                  </div>
                )}
                
              </div>

              {/* Fast Bottle Logger Card */}
              <div className="bg-card p-6 rounded-[40px] shadow-sm border border-white space-y-5 text-left flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl">🍼</div>
                    <div>
                      <h3 className="text-sm font-serif font-black text-gray-800">Bottle Logger</h3>
                      <p className="text-[11px] text-gray-400 font-medium">Log formula or pumped breastmilk</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-gray-50 p-4 rounded-3xl">
                    {/* Bottle Type Selector */}
                    <div className="flex gap-1 bg-white p-1 rounded-xl border border-solid border-gray-100">
                      {(['Pumped', 'Formula'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setBottleType(type)}
                          className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border-none cursor-pointer transition-all ${bottleType === type ? 'bg-primary text-white' : 'bg-transparent text-gray-400'}`}
                        >
                          {type === 'Pumped' ? '🥛 Pumped' : '🧪 Formula'}
                        </button>
                      ))}
                    </div>

                    {/* Bottle Amount Input */}
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="e.g. 120"
                        value={bottleInput}
                        onChange={e => setBottleInput(e.target.value)}
                        className="w-full bg-white border border-solid border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-primary pr-12 text-left"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">ml</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveBottleLog}
                  disabled={!bottleInput || parseInt(bottleInput) <= 0}
                  className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-100 disabled:text-gray-400 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer border-none shadow-md shadow-primary/10 transition-all"
                >
                  Log Feed (+ Fluid intake)
                </button>
                
    </div>
              
    </div>

            {/* Recent Local Feeds history list */}
            {userRole === 'nanny' ? (
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Today's Active Feeds (Shift View)</h4>
                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-primary/20">
                    <Lock className="w-2.5 h-2.5" /> Nanny Mode
                  </span>
                  
    </div>
                {feedingLogs.filter(log => log.date === new Date().toLocaleDateString() || log.date === new Date().toISOString().split('T')[0]).length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {feedingLogs
                      .filter(log => log.date === new Date().toLocaleDateString() || log.date === new Date().toISOString().split('T')[0])
                      .map(log => (
                        <div key={log.id} className="bg-card p-4 rounded-2xl border border-solid border-gray-100 shadow-xs flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${log.type === 'Bottle Feed' ? 'bg-primary/10 text-primary' : 'bg-pink-50 text-gray-700'}`}>
                              {log.type === 'Bottle Feed' ? '🍼' : '🤱'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-800">
                                {log.type === 'Bottle Feed' 
                                  ? `${log.bottleType} Feed • ${log.amount} ml` 
                                  : `Breastfeed • L: ${Math.round(log.leftDuration / 60)}m, R: ${Math.round(log.rightDuration / 60)}m`
                                }
                              </p>
                              <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">{log.timestamp} • Today</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteFeedingLog(log.id)}
                            className="w-7 h-7 rounded-full bg-gray-50 hover:bg-pink-50 text-gray-400 hover:text-gray-700 flex items-center justify-center border-none cursor-pointer transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 text-center">
                    <p className="text-xs text-gray-500 font-medium">No feeding sessions logged for today's shift yet.</p>
                  </div>
                )}
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-2 text-[10px] text-gray-800">
                  <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Previous days' historical feeding archives are shielded in caregiver mode.</span>
                </div>
              </div>
            ) : feedingLogs.length > 0 && (
              <div className="space-y-3 text-left">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Recent Feeding History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {feedingLogs.map(log => (
                    <div key={log.id} className="bg-card p-4 rounded-2xl border border-solid border-gray-100 shadow-xs flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${log.type === 'Bottle Feed' ? 'bg-primary/10 text-primary' : 'bg-pink-50 text-gray-700'}`}>
                          {log.type === 'Bottle Feed' ? '🍼' : '🤱'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">
                            {log.type === 'Bottle Feed' 
                              ? `${log.bottleType} Feed • ${log.amount} ml` 
                              : `Breastfeed • L: ${Math.round(log.leftDuration / 60)}m, R: ${Math.round(log.rightDuration / 60)}m`
                            }
                          </p>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">{log.timestamp} • {log.date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteFeedingLog(log.id)}
                        className="w-7 h-7 rounded-full bg-gray-50 hover:bg-pink-50 text-gray-400 hover:text-gray-700 flex items-center justify-center border-none cursor-pointer transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-serif font-black text-gray-800">Fluid Intake</h2>
                {!isEditingTarget ? (
                  <button 
                    onClick={() => {
                      setEditTargetValue(fluidTarget.toString());
                      setIsEditingTarget(true);
                    }}
                    className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full cursor-pointer hover:bg-primary/20"
                  >
                    {fluidTarget} ml Target
                  </button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <input 
                      type="number" 
                      value={editTargetValue} 
                      onChange={e => setEditTargetValue(e.target.value)} 
                      className="w-16 bg-gray-50 rounded-lg px-2 py-1 text-xs font-bold text-center border-none"
                      autoFocus
                    />
                    <button 
                      onClick={() => {
                        const val = parseInt(editTargetValue);
                        if (!isNaN(val) && val > 0) onSetTarget(val);
                        setIsEditingTarget(false);
                      }}
                      className="text-[10px] font-black text-gray-800 bg-primary px-2 py-1 rounded-lg uppercase tracking-widest"
                    >
                      Save
                    </button>
                    
    </div>
                )}
                
    </div>
              <div className="bg-card p-10 rounded-[56px] shadow-xl shadow-gray-100/50 border border-gray-50 space-y-10 flex flex-col items-center">
                <div className="relative flex flex-col items-center justify-center space-y-4">
                  <div className="relative flex items-center justify-center">
                    <CircularProgress progress={(fluidMl / fluidTarget) * 100} size={200} strokeWidth={16} color={THEME.primary} />
                    <div className="absolute flex items-center justify-center">
                      <div className="text-5xl">💧</div>
                      
    </div>
                    
    </div>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-serif font-black text-gray-800">{Math.round((fluidMl / fluidTarget) * 100)}%</span>
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest">{fluidMl} ml / {fluidTarget} ml</span>
                    
    </div>
                  
    </div>
                
                <button 
                  onClick={() => onAddFluid?.(50)}
                  className="w-full bg-primary text-white py-5 rounded-[32px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add 50ml Water
                </button>
                
    </div>
              
    </div>

            {/* Daily Nutrition Estimator Card */}
            <div className="bg-card p-6 rounded-[36px] border border-white shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥗</span>
                  <div>
                    <h3 className="text-sm font-serif font-black text-gray-800">Daily Nutrition Estimator</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estimated intake from today's meals & vitamins</p>
                    
    </div>
                  
    </div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full">
                  {todayScheduledMeals.length} Meals
                </span>
                
    </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-primary/5 p-3.5 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-1.5 text-primary mb-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Calories</span>
                  </div>
                  <p className="text-lg font-serif font-black text-gray-800">{estimatedCalories} <span className="text-[10px] font-sans font-bold text-gray-400">kcal</span></p>
                  <p className="text-[9px] text-gray-400 mt-0.5">Est. Energy</p>
                </div>

                <div className="bg-primary/5 p-3.5 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-1.5 text-primary mb-1">
                    <Dna className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Protein</span>
                  </div>
                  <p className="text-lg font-serif font-black text-gray-800">{estimatedProtein} <span className="text-[10px] font-sans font-bold text-gray-400">g</span></p>
                  <p className="text-[9px] text-gray-400 mt-0.5">Growth & muscle</p>
                </div>

                <div className="bg-primary/5 p-3.5 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-1.5 text-primary mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Vitamins</span>
                  </div>
                  <p className="text-lg font-serif font-black text-gray-800">
                    {estimatedVitamins.length > 0 ? `${estimatedVitamins.length} types` : '0 types'}
                  </p>
                  <p className="text-[9px] text-gray-400 mt-0.5 truncate">
                    {estimatedVitamins.length > 0 ? estimatedVitamins.slice(0, 3).join(', ') : 'Vit A, C, D & Minerals'}
                  </p>
                </div>

                <div className="bg-primary/5 p-3.5 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-1.5 text-primary mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Variety</span>
                  </div>
                  <p className="text-lg font-serif font-black text-gray-800">{new Set(todayScheduledMeals.map(m => m.meal?.title || m.title)).size} <span className="text-[10px] font-sans font-bold text-gray-400">foods</span></p>
                  <p className="text-[9px] text-gray-400 mt-0.5">Diverse palate</p>
                </div>
              </div>
              
    </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-lg font-bold text-gray-800">Daily Menu</h2>
                <button 
                  onClick={() => onNavigate('journal', { tab: 'weekly' })}
                  className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
                >
                  + Schedule Meal
                </button>
                
    </div>
              <div className="space-y-3">
                {scheduledMeals.filter(m => !m.date || new Date(m.date).toDateString() === new Date().toDateString()).length > 0 ? scheduledMeals.filter(m => !m.date || new Date(m.date).toDateString() === new Date().toDateString()).map(scheduled => (
                  <div key={scheduled.id} className="bg-card p-4 rounded-2xl shadow-sm border border-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center text-2xl">
                        {scheduled.type === 'Breakfast' ? '🥣' : scheduled.type === 'Lunch' ? '🍲' : '🍽️'}
                        
    </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{scheduled.type} • {scheduled.time}</p>
                        <p className="text-sm font-bold text-gray-800">{scheduled.meal?.title || scheduled.title}</p>
                        
    </div>
                      
    </div>
                    <button 
                      onClick={() => {
                        const isCompleting = !scheduled.completed;
                        const updated = scheduledMeals.map(m => m.id === scheduled.id ? { ...m, completed: !m.completed } : m);
                        setScheduledMeals(updated);
                        if (isCompleting) {
                          onNavigate('recipe-detail', scheduled.meal, true);
                        }
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border-none ${scheduled.completed ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    
    </div>
                )) : (
                  <p className="text-xs text-gray-500 italic px-2">No meals scheduled for today.</p>
                )}
                
    </div>
              
    </div>
          </motion.div>
        )}

        {activeTab === 'allergen' && (
          <motion.div 
            key="allergen-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-card p-6 rounded-[36px] border border-white shadow-xl shadow-card/10 space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <h3 className="font-serif font-black text-gray-800 text-lg">Allergen Clearance Matrix</h3>
                  <p className="text-xs text-muted leading-relaxed font-medium">
                    Follow safe guidelines to introduce high-risk allergens individually. Log 3 full days of exposure with no symptoms to mark as Cleared.
                  </p>
                  
    </div>
                
    </div>
              
    </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {(allergenMatrix || []).map(allergen => {
                const statusColors = {
                  'Not Introduced': 'bg-white text-gray-500 border-gray-100',
                  'In Progress': 'bg-primary/5 text-primary border-primary/20',
                  'Cleared': 'bg-primary/10 text-primary border-primary/30',
                  'Suspected Reaction': 'bg-pink-50 text-gray-800 border-pink-200'
                }[allergen.status as string] || 'bg-white';

                return (
                  <button 
                    key={allergen.id}
                    onClick={() => handleOpenAllergenModal(allergen)}
                    className={`p-5 rounded-[32px] border text-left space-y-3 shadow-md shadow-gray-100/30 flex flex-col justify-between min-h-[140px] cursor-pointer hover:scale-[1.02] transition-transform ${statusColors}`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-3xl">{getAllergenEmoji(allergen.name)}</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                        allergen.status === 'Cleared' ? 'bg-primary/10 text-primary' :
                        allergen.status === 'In Progress' ? 'bg-primary/15 text-primary' :
                        allergen.status === 'Suspected Reaction' ? 'bg-pink-100 text-gray-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {allergen.status === 'In Progress' ? `Day ${allergen.day}/3` : allergen.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-800 text-sm leading-none">{allergen.name}</h4>
                      <p className="text-[9px] font-medium text-gray-400 line-clamp-1">{allergen.notes || 'No notes yet'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'guide' && (
          <motion.div 
            key="guide-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative bg-white rounded-2xl border border-gray-100 shadow-inner p-1 flex items-center">
                <Search className="w-5 h-5 text-gray-400 ml-3" />
                <input 
                  type="text" 
                  placeholder="Search single ingredients..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none p-2.5 text-sm font-medium outline-none text-gray-700"
                />
              </div>

              {/* Segmented traffic-light filters */}
              <div className="flex gap-1.5 overflow-x-auto py-1">
                <button 
                  onClick={() => setGuideFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                    guideFilter === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-gray-100'
                  }`}
                >
                  All
                </button>
                <button 
                  onClick={() => setGuideFilter('green')}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                    guideFilter === 'green' ? 'bg-primary text-white' : 'bg-primary/5 text-primary border border-primary/20'
                  }`}
                >
                  Safe
                </button>
                <button 
                  onClick={() => setGuideFilter('amber')}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                    guideFilter === 'amber' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  Caution
                </button>
                <button 
                  onClick={() => setGuideFilter('red')}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                    guideFilter === 'red' ? 'bg-pink-500 text-white' : 'bg-pink-50 text-gray-700 border border-pink-100'
                  }`}
                >
                  Avoid &lt; 12m
                </button>
              </div>
            </div>

            {/* Ingredients Index List */}
            <div className="space-y-3">
              {COMMON_INGREDIENTS.filter(food => {
                const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesFilter = guideFilter === 'all' || food.color === guideFilter;
                return matchesSearch && matchesFilter;
              }).map(food => (
                <button 
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className="w-full bg-card p-5 rounded-[28px] border border-white hover:border-primary/20 shadow-sm hover:scale-[1.01] transition-transform text-left flex justify-between items-center cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        food.color === 'green' ? 'bg-primary' :
                        food.color === 'amber' ? 'bg-gray-400' : 'bg-pink-400'
                      }`} />
                      <h4 className="font-bold text-gray-800 text-sm">{food.name}</h4>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium line-clamp-1 pr-6">{food.warning}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Allergen edit Modal */}
      <AnimatePresence>
        {selectedAllergen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-6 relative max-h-[85vh] overflow-y-auto"
            >
              <header className="text-center space-y-2">
                <span className="text-5xl">{getAllergenEmoji(selectedAllergen.name)}</span>
                <h3 className="text-xl font-serif font-black text-gray-800">Introduce {selectedAllergen.name}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Allergen Integration</p>
              </header>

              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Introduction Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Not Introduced', 'In Progress', 'Cleared', 'Suspected Reaction'].map(status => (
                      <button 
                        key={status}
                        onClick={() => setEditStatus(status)}
                        className={`py-2.5 px-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                          editStatus === status 
                            ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20' 
                            : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {editStatus === 'In Progress' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Exposure Day Count</label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map(day => (
                        <button 
                          key={day}
                          onClick={() => setEditDay(day)}
                          className={`flex-1 py-3 rounded-2xl font-bold text-xs cursor-pointer transition-all ${
                            editDay === day ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          Day {day} / 3
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Introduce Observations / Notes</label>
                  <textarea 
                    value={editNotes} 
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="Log any small details, mild skin rashes, stool abnormalities or successful cleared days..."
                    className="w-full bg-gray-50 rounded-2xl p-3 text-xs font-medium border-none outline-none h-20 text-gray-700"
                  />
                </div>

                {/* Display linked allergic reaction meals */}
                {loggedMeals.filter(m => m.allergyReaction).length > 0 && (
                  <div className="bg-pink-50 p-3 rounded-2xl border border-pink-100 space-y-2">
                    <p className="text-[9px] font-black text-gray-800 uppercase tracking-widest">Suspected Reaction Log History</p>
                    <div className="space-y-1.5 max-h-20 overflow-y-auto">
                      {loggedMeals.filter(m => m.allergyReaction).map((m, idx) => (
                        <div key={idx} className="text-[10px] font-bold text-gray-700 bg-white/50 p-1.5 rounded border border-pink-100 flex justify-between">
                          <span>{m.title}</span>
                          <span>{m.logTime || m.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setSelectedAllergen(null)} 
                  className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveAllergen} 
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 cursor-pointer"
                >
                  Save Status
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Food detailed guideline Modal */}
      <AnimatePresence>
        {selectedFood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-6 relative max-h-[85vh] overflow-y-auto"
            >
              <header className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    selectedFood.color === 'green' ? 'bg-primary/10 text-primary' :
                    selectedFood.color === 'amber' ? 'bg-gray-100 text-gray-700' : 'bg-pink-100 text-gray-800'
                  }`}>
                    {selectedFood.color === 'green' ? 'Safe to Serve' :
                     selectedFood.color === 'amber' ? 'Prepare with Caution' : 'Avoid Under 12m'}
                  </span>
                  <h3 className="text-2xl font-serif font-black text-gray-800">{selectedFood.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedFood(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-black text-sm flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </header>

              {/* Warnings Callout block */}
              <div className={`p-4 rounded-3xl text-xs font-semibold leading-relaxed border ${
                selectedFood.color === 'red' ? 'bg-pink-50 text-gray-800 border-pink-100' :
                selectedFood.color === 'amber' ? 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-primary/5 text-primary border-primary/10'
              }`}>
                {selectedFood.warning}
              </div>

              {/* Age-by-Age Preparation Matrix */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Age-by-Age Safety Guidelines</h4>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-2xl space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">👶 6 Months Old (Purees & Soft BLW)</p>
                    <p className="text-xs font-medium text-gray-700 leading-relaxed">{selectedFood.prep6m}</p>
                    
    </div>
                  <div className="bg-gray-50 p-4 rounded-2xl space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">🧎 10 Months Old (Finger Food Bites)</p>
                    <p className="text-xs font-medium text-gray-700 leading-relaxed">{selectedFood.prep10m}</p>
                    
    </div>
                  <div className="bg-gray-50 p-4 rounded-2xl space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">🚶 12+ Months Old (Normal Serving)</p>
                    <p className="text-xs font-medium text-gray-700 leading-relaxed">{selectedFood.prep12m}</p>
                    
    </div>
                  
    </div>
                
    </div>

              <button 
                onClick={() => setSelectedFood(null)}
                className="w-full py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer text-center"
              >
                Got It, Thanks!
              </button>
            </motion.div>
            
    </div>
        )}
      </AnimatePresence>
      
    </div>
  );
};


