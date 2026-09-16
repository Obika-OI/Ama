import React, { useState, useEffect } from 'react';
import { LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Line } from 'recharts';
import { ChevronLeft, Search, Star, Award, Sparkles, CheckCircle2, Flame, Trophy, Activity as ActivityIcon, PlusCircle, X, RefreshCw } from 'lucide-react';
import { QUEST_POOL } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ACTIVITIES, THEME } from '../constants';
import { Activity } from '../types';

export const ActivitiesScreen = ({ 
  onBack,
  growthLogs,
  setGrowthLogs,
  activities,
  setActivities,
  dailyStreak,
  lastStreakDate,
  allTimePoints,
  setAllTimePoints,
  onToggleActivity
}: { 
  onBack: () => void;
  growthLogs: any[];
  setGrowthLogs: (logs: any[]) => void;
  activities: Activity[];
  setActivities: (acts: Activity[]) => void;
  dailyStreak: number;
  lastStreakDate: string;
  allTimePoints: number;
  setAllTimePoints?: React.Dispatch<React.SetStateAction<number>>;
  onToggleActivity: (id: string) => void;
}) => {
  const [timeLeft, setTimeLeft] = useState('24h 00m 00s');
  const [isRerolling, setIsRerolling] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const [isPredictingGrowth, setIsPredictingGrowth] = useState(false);
  const [predictedLogs, setPredictedLogs] = useState<any[]>([]);

  const predictGrowth = async () => {
    if (growthLogs.length === 0) return;
    setIsPredictingGrowth(true);
    try {
      const response = await fetch("/api/ai/growth-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ babyName: "Baby", growthLogs })
      });
      const data = await response.json();
      if (data && data.predictions) {
        setPredictedLogs(data.predictions.map((p: any) => ({ ...p, isPrediction: true })));
      }
    } catch (e) {
      console.error("Growth prediction client error:", e);
    } finally {
      setIsPredictingGrowth(false);
    }
  };

  // Clinical Pediatric Milestone Standard Database
  const PEDIATRIC_MILESTONES = {
    '2 Months': [
      { id: 'm2_1', text: 'Calms down when spoken to or picked up', category: 'Social/Emotional' },
      { id: 'm2_2', text: 'Looks at your face', category: 'Social/Emotional' },
      { id: 'm2_3', text: 'Coos and makes other vocal sounds', category: 'Language' },
      { id: 'm2_4', text: 'Follows things with eyes', category: 'Cognitive' },
      { id: 'm2_5', text: 'Holds head up when on tummy', category: 'Motor' },
    ],
    '4 Months': [
      { id: 'm4_1', text: 'Smiles on their own to get your attention', category: 'Social/Emotional' },
      { id: 'm4_2', text: 'Chuckles / giggles', category: 'Language' },
      { id: 'm4_3', text: 'Holds head steady without support', category: 'Motor' },
      { id: 'm4_4', text: 'Holds a toy when you put it in their hand', category: 'Motor' },
    ],
    '6 Months': [
      { id: 'm6_1', text: 'Knows familiar people', category: 'Social/Emotional' },
      { id: 'm6_2', text: 'Makes squealing/laughing sounds', category: 'Language' },
      { id: 'm6_3', text: 'Rolls from tummy to back', category: 'Motor' },
      { id: 'm6_4', text: 'Pushes up with straight arms on tummy', category: 'Motor' },
    ],
    '9 Months': [
      { id: 'm9_1', text: 'Shy or clingy around strangers', category: 'Social/Emotional' },
      { id: 'm9_2', text: 'Makes lots of different sounds (babbling)', category: 'Language' },
      { id: 'm9_3', text: 'Sits without support', category: 'Motor' },
      { id: 'm9_4', text: 'Looks for things that you hide', category: 'Cognitive' },
    ],
    '12 Months': [
      { id: 'm12_1', text: 'Plays games like peek-a-boo or pat-a-cake', category: 'Social/Emotional' },
      { id: 'm12_2', text: 'Calls parent "mama" or "papa"', category: 'Language' },
      { id: 'm12_3', text: 'Pulls up to stand', category: 'Motor' },
      { id: 'm12_4', text: 'Walks holding onto furniture', category: 'Motor' },
    ]
  };

  const LANGUAGE_QUESTS = [
    { id: 'lq1', name: 'Vocal Echo Challenge', description: 'Imitate baby\'s babbles and wait for them to mimic back to build conversational turn-taking.', points: 25, icon: '🗣️', suggestedMin: 5 },
    { id: 'lq2', name: 'Interactive Storyteller', description: 'Point at characters and name them with dramatic pitch changes to boost auditory engagement.', points: 30, icon: '🎭', suggestedMin: 10 },
    { id: 'lq3', name: 'Vocabulary Touch & Find', description: 'Read a page and ask baby to look at/touch the picture (e.g., "Where is the dog?").', points: 30, icon: '👉', suggestedMin: 10 },
    { id: 'lq4', name: 'Nursery Rhyme Sing-Along', description: 'Sing classic rhymes with physical gestures (e.g., Pat-a-Cake) to foster phonetic awareness.', points: 25, icon: '🎶', suggestedMin: 5 },
    { id: 'lq5', name: 'Object Labeling Quest', description: 'Point to 5 daily items, pronounce names slowly, and encourage baby to look at them.', points: 20, icon: '🔍', suggestedMin: 5 }
  ];

  // Developmental Milestones State
  const [milestoneAge, setMilestoneAge] = useState<'2 Months' | '4 Months' | '6 Months' | '9 Months' | '12 Months'>('2 Months');
  const [checkedMilestones, setCheckedMilestones] = useState<string[]>(() => {
    const saved = localStorage.getItem('pediatric_milestones') || localStorage.getItem('cdc_milestones');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pediatric_milestones', JSON.stringify(checkedMilestones));
  }, [checkedMilestones]);

  const handleToggleMilestone = (id: string, name: string) => {
    const isChecking = !checkedMilestones.includes(id);
    if (isChecking) {
      setCheckedMilestones([...checkedMilestones, id]);
      if (setAllTimePoints) {
        setAllTimePoints((prev: any) => prev + 15);
      }
      alert(`Milestone completed! +15 XP awarded! 🎉`);
    } else {
      setCheckedMilestones(checkedMilestones.filter(mId => mId !== id));
      if (setAllTimePoints) {
        setAllTimePoints((prev: any) => Math.max(0, prev - 15));
      }
    }
  };

  // --- Sub-module States ---
  // 1. Daily Quest Tracker
  const [questTimeToday, setQuestTimeToday] = useState<number>(() => parseFloat(localStorage.getItem('quest_today') || '0'));
  const [questGoal] = useState<number>(20);
  const [qtTimerActive, setQtTimerActive] = useState(false);
  const [qtSeconds, setQtSeconds] = useState(0);
  const [questName, setQuestName] = useState<string>('Sensory Play');
  const [questLogs, setQuestLogs] = useState<any[]>(() => JSON.parse(localStorage.getItem('quest_logs') || '[]'));

  // 2. Reading & Language Exposure
  const [readingLogs, setReadingLogs] = useState<any[]>(() => JSON.parse(localStorage.getItem('reading_logs') || '[]'));
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookMin, setNewBookMin] = useState('10');
  const [newBookReaction, setNewBookReaction] = useState('🤩 Attentive');

  // 3. Growth tracker
  const [newMonth, setNewMonth] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newHead, setNewHead] = useState('');

  // Local Sync Effects
  useEffect(() => { localStorage.setItem('quest_today', questTimeToday.toString()); }, [questTimeToday]);
  useEffect(() => { localStorage.setItem('quest_logs', JSON.stringify(questLogs)); }, [questLogs]);
  useEffect(() => { localStorage.setItem('reading_logs', JSON.stringify(readingLogs)); }, [readingLogs]);

  // General Timer for Quests reset
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
    };
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // Daily Quest Stopwatch logic
  useEffect(() => {
    let interval: any = null;
    if (qtTimerActive) {
      interval = setInterval(() => {
        setQtSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [qtTimerActive]);

  const handleReroll = () => {
    setIsRerolling(true);
    setTimeout(() => {
      const shuffled = [...QUEST_POOL].sort(() => 0.5 - Math.random());
      const newQuests = shuffled.slice(0, 3).map(q => ({
        ...q,
        isCompleted: false
      }));
      setActivities(newQuests);
      setIsRerolling(false);
    }, 600);
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const completeSelectedActivity = () => {
    if (selectedActivity && !selectedActivity.isCompleted) {
      onToggleActivity(selectedActivity.id);
      setSelectedActivity({ ...selectedActivity, isCompleted: true });
    }
  };

  // Save Daily Quest stopwatch run
  const saveDailyQuest = (minutes: number) => {
    setQuestTimeToday(prev => Math.min(120, prev + minutes));
    setQtSeconds(0);
    setQtTimerActive(false);
    
    if (setAllTimePoints) setAllTimePoints((prev: any) => prev + Math.max(10, Math.floor(minutes * 2)));

    const log = {
      name: questName,
      minutes: Math.round(minutes),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    };
    setQuestLogs([log, ...questLogs].slice(0, 5));
  };

  const handleAddReadingLog = () => {
    if (!newBookTitle) {
      alert("Please enter a book title to log your Reading & Language Session!");
      return;
    }
    if (setAllTimePoints) {
      setAllTimePoints((prev: any) => prev + 25);
    }
    const log = {
      title: newBookTitle,
      minutes: parseInt(newBookMin) || 10,
      reaction: newBookReaction,
      date: new Date().toLocaleDateString()
    };
    setReadingLogs([log, ...readingLogs].slice(0, 5));
    setNewBookTitle('');
    alert(`Reading Session logged! +25 XP awarded towards rewards and progression! 📚✨`);
  };

  const handleLogGrowth = () => {
    if (newMonth && newWeight && newHeight) {
      if (setAllTimePoints) setAllTimePoints((prev: any) => prev + 30);
      const log = {
        month: newMonth,
        weight: parseFloat(newWeight),
        height: parseFloat(newHeight),
        head: newHead ? parseFloat(newHead) : undefined
      };
      setGrowthLogs([...growthLogs, log]);
      setNewMonth('');
      setNewWeight('');
      setNewHeight('');
      setNewHead('');
    }
  };

  const level = Math.floor(allTimePoints / 100) + 1;
  const pointsToNextLevel = 100 - (allTimePoints % 100);
  const progress = (allTimePoints % 100);

  const rewards = [
    { id: 'r1', title: 'Bronze Explorer', description: 'Reach 100 pts lifetime', icon: '🌟', unlocked: allTimePoints >= 100 },
    { id: 'r2', title: 'Silver Titan', description: 'Reach 350 pts lifetime', icon: '🚀', unlocked: allTimePoints >= 350 },
    { id: 'r3', title: 'Gold Champion', description: 'Reach 600 pts lifetime', icon: '🏆', unlocked: allTimePoints >= 600 },
    { id: 'r4', title: 'Streak Starter', description: 'Keep a 3-day active streak', icon: '🔥', unlocked: dailyStreak >= 3 },
    { id: 'r5', title: 'Unstoppable Week', description: 'Keep a 7-day active streak', icon: '👑', unlocked: dailyStreak >= 7 },
    { id: 'r6', title: 'Apex Parent Legend', description: 'Unlock all 3 quests today', icon: '💫', unlocked: activities.length > 0 && activities.every(a => a.isCompleted) },
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 bg-[#D2E9F9] z-50 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 pb-32 space-y-8"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-solid border-white/50">
          <button onClick={onBack} className="w-11 h-11 rounded-full bg-white shadow-xs flex items-center justify-center border border-solid border-white cursor-pointer hover:scale-105 transition-transform">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <div className="text-center">
            <h1 className="font-serif text-xl font-black text-gray-800 tracking-wide">Growth Activities</h1>
            <p className="text-[10px] text-[#37b1f5] font-extrabold uppercase tracking-widest">Active & Mindful Play</p>
            
    </div>
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-xs">
            <Trophy className="w-6 h-6" />
          </div>
        </header>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Level Progress & Daily Streak Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#37b1f5] p-6 rounded-[36px] text-white space-y-4 shadow-xl shadow-[#37b1f5]/20 relative overflow-hidden flex flex-col justify-between min-h-[150px] text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl" />
              <div className="space-y-1 relative z-10">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-80">Lifetime Progress</span>
                <h3 className="text-2xl font-serif font-black">Level {level}</h3>
                <p className="text-[10px] font-bold opacity-90">{allTimePoints} total points</p>
                
    </div>
              <div className="space-y-2 relative z-10">
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden shadow-inner border border-solid border-white/10">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="bg-[#ffd700] h-full rounded-full shadow-sm" />
                  
    </div>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-80 text-right">Next Lvl: {pointsToNextLevel} pts</p>
                
    </div>
              
    </div>

            <div className="bg-primary/10 p-6 rounded-[36px] text-gray-800 space-y-4 border border-solid border-primary/20 shadow-xl shadow-primary/10 relative overflow-hidden flex flex-col justify-between min-h-[150px] text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/30 rounded-full -mr-10 -mt-10 blur-xl" />
              <div className="space-y-1 relative z-10">
                <span className="text-[8px] font-black uppercase tracking-widest text-primary">Thriving Streak</span>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-2xl font-serif font-black">{dailyStreak} Days</h3>
                  <Flame className="w-6 h-6 text-primary animate-pulse fill-current drop-shadow-sm" />
                </div>
                <p className="text-[10px] font-bold text-gray-600">{dailyStreak > 0 ? "Doing spectacular!" : "Start today!"}</p>
              </div>
              <div className="relative z-10 text-[8px] font-black uppercase tracking-wider bg-white/80 text-primary py-1.5 px-3 rounded-xl text-center shadow-xs">
                {activities.length > 0 && activities.every(a => a.isCompleted) ? "All Completed! 🎉" : "Goal: 3 Quests"}
              </div>
            </div>
            
    </div>

          {/* Activities List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <div>
                <h2 className="text-lg font-serif font-black text-gray-800 text-left">Daily Quests</h2>
                <p className="text-[10px] text-[#37b1f5] font-bold">Complete quests daily to level up</p>
                
    </div>
              <button 
                onClick={handleReroll} 
                disabled={isRerolling} 
                className="flex items-center gap-1.5 bg-white text-[#37b1f5] hover:bg-gray-50 shadow-xs disabled:opacity-50 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border border-solid border-white/50"
              >
                <RefreshCw className={`w-3 h-3 ${isRerolling ? 'animate-spin' : ''}`} />
                <span>Reroll</span>
              </button>
              
    </div>

            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.map(activity => (
                  <motion.div 
                    key={activity.id} 
                    whileTap={{ scale: 0.98 }} 
                    onClick={() => handleActivityClick(activity)} 
                    className={`p-5 rounded-[32px] border border-solid transition-all flex flex-col gap-3 cursor-pointer text-left shadow-sm ${
                      activity.isCompleted 
                        ? 'bg-primary/10 border-primary/20 opacity-85' 
                        : 'bg-white border-white hover:border-[#37b1f5]/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0 ${activity.isCompleted ? 'bg-primary/20 text-primary' : 'bg-[#D2E9F9]'}`}>
                        {activity.isCompleted ? '✓' : activity.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-gray-800 text-xs leading-tight">{activity.title}</h3>
                          <span className={`text-[9px] font-black uppercase tracking-widest shrink-0 px-2 py-1 rounded-md ${activity.isCompleted ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                            +{activity.points} pts
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium line-clamp-1">{activity.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white/50 backdrop-blur border border-solid border-white p-8 rounded-[36px] text-center shadow-sm">
                  <p className="text-xs font-bold text-[#37b1f5] mb-3">No quests active today.</p>
                  <button onClick={handleReroll} className="px-5 py-3 bg-[#37b1f5] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border-none cursor-pointer shadow-md">Generate Quests</button>
                </div>
              )}
            </div>
            
    </div>

          {/* Daily Quest Tracker */}
          <div className="bg-white rounded-[40px] border border-solid border-white p-6 space-y-6 shadow-sm text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🧸</div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Daily Quest Tracker</h3>
                <p className="text-[10px] text-gray-400">Target: {questGoal} mins daily</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 bg-[#FDFBF7] p-4 rounded-3xl border border-solid border-gray-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Today's Progress</span>
                <span className="text-xl font-serif font-black text-gray-800">{Math.round(questTimeToday)} min</span>
              </div>
              <div className="font-mono text-sm bg-white border border-solid border-gray-100 shadow-xs text-primary px-3 py-1.5 rounded-xl font-bold">
                {Math.floor(qtSeconds / 60)}m {(qtSeconds % 60).toString().padStart(2, '0')}s
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[8px] font-black text-gray-400 block uppercase tracking-widest">Quest Name</label>
              <select
                value={questName}
                onChange={(e) => setQuestName(e.target.value)}
                className="w-full bg-white border border-solid border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-800 focus:outline-none shadow-xs"
              >
                <option>Sensory Play</option>
                <option>Tummy Time</option>
                <option>Nature Walk</option>
                <option>Motor Skills</option>
                <option>Reading</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setQtTimerActive(!qtTimerActive)}
                className="flex-1 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest cursor-pointer border-none transition-all bg-primary hover:bg-primary/90 text-white shadow-md"
              >
                {qtTimerActive ? 'Pause' : 'Start Stopwatch'}
              </button>
              {qtSeconds > 0 && (
                <button
                  onClick={() => saveDailyQuest(qtSeconds / 60)}
                  className="px-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest cursor-pointer border-none transition-all shadow-md"
                >
                  Save
                </button>
              )}
            </div>

            {questLogs.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest pl-2">Recent Quests</p>
                <div className="space-y-2">
                  {questLogs.map((log, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-solid border-primary/20 shadow-xs flex justify-between items-center text-xs font-medium">
                      <div>
                        <p className="font-bold text-gray-800">✅ {log.name}</p>
                        <p className="text-[9px] text-gray-400 mt-1">{log.time} • {log.date}</p>
                      </div>
                      <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-[10px] font-black">{log.minutes}m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>

          {/* Developmental Milestones Checklist Card */}
          <div className="bg-white rounded-[40px] border border-solid border-white p-6 space-y-6 shadow-sm text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🌱</div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Developmental Milestones</h3>
                <p className="text-[10px] text-gray-400">Pediatric-aligned age standards (gamified +15 XP)</p>
              </div>
            </div>

            {/* Age selectors */}
            <div className="flex gap-1 bg-gray-50 p-1 rounded-2xl overflow-x-auto">
              {(['2 Months', '4 Months', '6 Months', '9 Months', '12 Months'] as const).map(age => (
                <button
                  key={age}
                  onClick={() => setMilestoneAge(age)}
                  className={`px-3.5 py-2.5 rounded-xl text-[9px] whitespace-nowrap font-black uppercase tracking-wider border-none cursor-pointer transition-all ${milestoneAge === age ? 'bg-primary text-white' : 'bg-transparent text-gray-500 hover:text-gray-800'}`}
                >
                  {age}
                </button>
              ))}
            </div>

            {/* Pediatric standard milestone items */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {(PEDIATRIC_MILESTONES[milestoneAge] || []).map(m => {
                const isChecked = checkedMilestones.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => handleToggleMilestone(m.id, m.text)}
                    className={`p-3 rounded-2xl border border-solid cursor-pointer transition-all flex items-start gap-3 ${isChecked ? 'bg-primary/5 border-primary/20' : 'bg-white border-gray-100 hover:bg-gray-50/50'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 border-solid flex items-center justify-center transition-colors shrink-0 ${isChecked ? 'bg-primary border-primary text-white text-[9px] font-black' : 'border-gray-200'}`}>
                      {isChecked && '✓'}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-800 leading-tight">{m.text}</p>
                      <span className="text-[8px] font-black uppercase text-primary tracking-wider bg-primary/10 px-1.5 py-0.5 rounded-md">{m.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Book Reading Logger Section */}
          <div className="bg-white rounded-[40px] border border-solid border-white p-6 space-y-6 shadow-sm text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#37b1f5]/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">📚</div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Reading & Language Session</h3>
                <p className="text-[10px] text-gray-400">Build your child's core vocabulary early</p>
                
    </div>
              
    </div>

            {/* Interactive Gamified Language Quests */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-[#37b1f5] uppercase tracking-widest pl-1 block">🏆 Interactive Language Quests</span>
              <div className="grid grid-cols-1 gap-3">
                {LANGUAGE_QUESTS.map(quest => (
                  <div 
                    key={quest.id} 
                    className="p-4 bg-blue-50/40 hover:bg-blue-50 rounded-3xl border border-solid border-blue-100/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-left shadow-2xs"
                  >
                    <div className="flex gap-3 items-start">
                      <span className="text-2xl shrink-0 bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-3xs">{quest.icon}</span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-gray-800 leading-tight">{quest.name}</p>
                          <span className="text-[8px] font-black uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded">+{quest.points} XP</span>
                          
    </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">{quest.description}</p>
                        
    </div>
                      
    </div>
                    <div className="flex gap-2 shrink-0 justify-end">
                      <button
                        onClick={() => {
                          setNewBookTitle(`${quest.icon} ${quest.name}`);
                          setNewBookMin(quest.suggestedMin.toString());
                          setNewBookReaction('🤩 Attentive');
                        }}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-gray-100 border border-solid border-gray-200 text-[8px] font-black uppercase text-gray-600 cursor-pointer transition-all"
                      >
                        Fill Form
                      </button>
                      <button
                        onClick={() => {
                          if (setAllTimePoints) {
                            setAllTimePoints((prev: any) => prev + quest.points);
                          }
                          const log = {
                            title: `${quest.icon} ${quest.name}`,
                            minutes: quest.suggestedMin,
                            reaction: '🤩 Attentive',
                            date: new Date().toLocaleDateString()
                          };
                          setReadingLogs([log, ...readingLogs].slice(0, 5));
                          alert(`Quest Complete! "${quest.name}" logged. +${quest.points} XP awarded towards rewards and progression! 📚🏆✨`);
                        }}
                        className="px-3 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white border-none text-[8px] font-black uppercase tracking-widest cursor-pointer shadow-xs transition-all"
                      >
                        ⚡ Quick Log
                      </button>
                      
    </div>
                    
    </div>
                ))}
                
    </div>
              
    </div>

            <div className="bg-[#D2E9F9]/30 p-5 rounded-3xl space-y-4 border border-solid border-[#D2E9F9]">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Book Title (e.g. Goodnight Moon)"
                  value={newBookTitle}
                  onChange={e => setNewBookTitle(e.target.value)}
                  className="w-full bg-white border border-solid border-white rounded-xl px-4 py-3 text-xs font-bold text-gray-800 focus:outline-none shadow-xs"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[8px] font-black text-[#37b1f5] block mb-1.5 uppercase tracking-wider">Minutes</label>
                    <input
                      type="number"
                      value={newBookMin}
                      onChange={e => setNewBookMin(e.target.value)}
                      className="w-full bg-white border border-solid border-white rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:outline-none shadow-xs"
                    />
                    
    </div>
                  <div>
                    <label className="text-[8px] font-black text-[#37b1f5] block mb-1.5 uppercase tracking-wider">Reaction</label>
                    <select
                      value={newBookReaction}
                      onChange={e => setNewBookReaction(e.target.value)}
                      className="w-full bg-white border border-solid border-white rounded-xl px-2 py-2.5 text-xs font-bold text-gray-800 focus:outline-none shadow-xs"
                    >
                      <option>🤩 Attentive</option>
                      <option>😄 Happy</option>
                      <option>👶 Grabby</option>
                      <option>🥱 Sleepy</option>
                    </select>
                    
    </div>
                  
    </div>
                <button
                  onClick={handleAddReadingLog}
                  className="w-full bg-primary text-white py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-widest cursor-pointer border-none hover:bg-primary-dark transition-all shadow-md mt-2"
                >
                  Log Reading Session
                </button>
                
    </div>
              
    </div>

            {readingLogs.length > 0 && (
              <div className="space-y-3">
                <p className="text-[9px] font-black text-[#37b1f5] uppercase tracking-widest pl-2">Recent Sessions</p>
                <div className="space-y-2">
                  {readingLogs.map((log, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-solid border-[#D2E9F9] shadow-xs flex justify-between items-center text-xs font-medium">
                      <div>
                        <p className="font-bold text-gray-800">📖 {log.title}</p>
                        <p className="text-[9px] text-gray-400 mt-1">Reaction: {log.reaction} • {log.date}</p>
                        
    </div>
                      <span className="bg-[#D2E9F9] text-[#37b1f5] px-3 py-1.5 rounded-xl text-[10px] font-black">{log.minutes}m</span>
                      
    </div>
                  ))}
                  
    </div>
                
    </div>
            )}
            
    </div>

          {/* Growth Tracker & Chart moved to Quests Tab with matching color palette */}
          <div className="bg-white p-6 rounded-[40px] border border-solid border-white shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-gray-800">Baby Growth Curve</h2>
                <p className="text-[10px] text-gray-400">Weight, Height & Head Circumference</p>
              </div>
              <button
                onClick={predictGrowth}
                disabled={isPredictingGrowth || growthLogs.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-primary/20 transition-colors disabled:opacity-50 border border-solid border-primary/20"
              >
                <span>✨</span> {isPredictingGrowth ? 'Predicting...' : 'AI Forecast'}
              </button>
            </div>

            <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 text-[9px] text-gray-500 font-medium">
              ℹ️ <strong>AI Accuracy Disclaimer:</strong> Growth projections and development suggestions are AI-generated models based on reference percentiles. They are not medical assessments or clinical diagnoses. Always verify your baby's growth parameters directly with your pediatrician.
            </div>
            
            <div className="h-52 w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...growthLogs, ...predictedLogs]}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                  <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#FFD6E8" strokeWidth={4} dot={{ r: 5, fill: '#FFD6E8', strokeWidth: 2, stroke: '#fff' }} name="Weight (kg)" />
                  <Line yAxisId="right" type="monotone" dataKey="height" stroke="#37b1f5" strokeWidth={3} dot={{ r: 4, fill: '#37b1f5', strokeWidth: 2, stroke: '#fff' }} name="Height (cm)" />
                  <Line yAxisId="right" type="monotone" dataKey="head" stroke="#64748b" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3, fill: '#64748b' }} name="Head (cm)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Growth Logger inputs */}
            <div className="bg-gray-50/50 p-4 rounded-3xl border border-solid border-gray-100 space-y-3">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Add New Growth Log</span>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[8px] font-black text-gray-400 uppercase block mb-1">Age</label>
                  <input type="text" value={newMonth} onChange={e => setNewMonth(e.target.value)} placeholder="e.g. 7m" className="w-full bg-white border border-solid border-gray-100 rounded-xl px-2.5 py-2 text-xs font-bold text-gray-800 focus:outline-none" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-gray-400 uppercase block mb-1">Wt (kg)</label>
                  <input type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="e.g. 8.2" className="w-full bg-white border border-solid border-gray-100 rounded-xl px-2.5 py-2 text-xs font-bold text-gray-800 focus:outline-none" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-gray-400 uppercase block mb-1">Ht (cm)</label>
                  <input type="number" step="0.5" value={newHeight} onChange={e => setNewHeight(e.target.value)} placeholder="e.g. 68" className="w-full bg-white border border-solid border-gray-100 rounded-xl px-2.5 py-2 text-xs font-bold text-gray-800 focus:outline-none" />
                </div>
                <div>
                  <label className="text-[8px] font-black text-gray-400 uppercase block mb-1">Head (cm)</label>
                  <input type="number" step="0.5" value={newHead} onChange={e => setNewHead(e.target.value)} placeholder="e.g. 43" className="w-full bg-white border border-solid border-gray-100 rounded-xl px-2.5 py-2 text-xs font-bold text-gray-800 focus:outline-none" />
                </div>
              </div>
              <button onClick={handleLogGrowth} className="w-full bg-primary text-white py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-primary-dark shadow-sm transition-all flex items-center justify-center gap-1 border-none cursor-pointer">
                <PlusCircle className="w-4 h-4" /> Save Growth Entry (+30 pts)
              </button>
            </div>
          </div>

          {/* Rewards Drawer */}
          <div className="bg-white rounded-[40px] border border-solid border-white p-6 space-y-5 shadow-sm text-left">
            <div className="px-2">
              <h2 className="text-sm font-bold text-gray-800">Milestone Rewards</h2>
              <p className="text-[10px] text-[#37b1f5] font-bold">Keep achievements unlocked</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {rewards.map(reward => (
                <div 
                  key={reward.id} 
                  className={`p-4 rounded-[28px] flex flex-col items-center text-center space-y-2.5 border border-solid transition-all ${
                    reward.unlocked 
                      ? 'bg-[#FFD6E8] border-pink-200 shadow-md transform -translate-y-1' 
                      : 'bg-gray-50 border-gray-100 opacity-50 grayscale'
                  }`}
                >
                  <div className={`text-3xl ${reward.unlocked ? 'animate-bounce' : ''}`}>{reward.icon}</div>
                  <p className="text-[8px] font-black uppercase tracking-wider text-gray-800 leading-tight line-clamp-2">{reward.title}</p>
                  {reward.unlocked ? (
                    <span className="bg-white text-pink-500 text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-xs">Unlocked</span>
                  ) : (
                    <span className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">Locked</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      {/* Quest Detail Modal */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            onClick={() => setSelectedActivity(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-6 w-full max-w-sm shadow-2xl relative text-left"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedActivity(null)} 
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-none cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-4 bg-[#D2E9F9]">
                {selectedActivity.icon}
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex gap-2 items-center mb-1">
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-primary/10 text-primary rounded-md">
                      +{selectedActivity.points} PTS
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-[#37b1f5]/10 text-[#37b1f5] rounded-md">
                      {selectedActivity.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-black text-gray-800 leading-tight">{selectedActivity.title}</h2>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-3xl border border-solid border-gray-100 space-y-2">
                  <h3 className="text-xs font-bold text-gray-800">Why it's important</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                    {selectedActivity.description}
                  </p>
                </div>
                
                <div className="bg-[#FFD6E8]/30 p-4 rounded-3xl border border-solid border-pink-100 space-y-2">
                  <h3 className="text-xs font-bold text-gray-800">How to perform</h3>
                  <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                    Ensure baby is fed and rested. Start in a quiet environment. Perform the activity for 5-10 minutes. If baby gets fuzzy, pause and try again later. Focus on eye contact and gentle communication throughout.
                  </p>
                </div>
              </div>

              <button
                onClick={completeSelectedActivity}
                disabled={selectedActivity.isCompleted}
                className={`w-full mt-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all border-none ${
                  selectedActivity.isCompleted
                    ? 'bg-primary/20 text-primary'
                    : 'bg-[#37b1f5] text-white hover:bg-blue-500 cursor-pointer'
                }`}
              >
                {selectedActivity.isCompleted ? '✓ Quest Completed' : 'Complete Quest'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        
    </div>
    </motion.div>
  );
};



