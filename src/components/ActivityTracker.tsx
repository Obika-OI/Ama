import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Plus, Calendar, Clock, ChevronLeft, CheckCircle2, Star, Sparkles, Heart, Activity as ActivityIcon, Droplet, Award, Flame, AlertCircle, Edit3, Trash2, Check, Mic, Search, Crown, Lock, RotateCcw, ShieldCheck } from 'lucide-react';
import { TEETH_LIST } from '../constants/babyData';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_ACTIVITIES, THEME } from '../constants';
import { Activity } from '../types';
import { BabyCryAnalyzer } from './BabyCryAnalyzer';
import { ImmunizationScheduler } from './ImmunizationScheduler';

export const ActivityTracker = ({ 
  loggedMoods, 
  setLoggedMoods,
  scheduledActivities,
  setScheduledActivities,
  vaccineSchedule = [],
  setVaccineSchedule,
  babyName = 'Leo',
  babyAge = '6 Months',
  loggedMeals = [],
  diaperLogs = [],
  onNavigate,
  initialTab = 'sleep',
  isPremium = false,
  setIsSubscriptionModalOpen
}: { 
  loggedMoods: any[]; 
  setLoggedMoods: (moods: any) => void;
  scheduledActivities: any[];
  setScheduledActivities: (acts: any[]) => void;
  vaccineSchedule?: any[];
  setVaccineSchedule?: (schedule: any[]) => void;
  babyName?: string;
  babyAge?: string;
  loggedMeals?: any[];
  diaperLogs?: any[];
  onNavigate?: (screen: string, data?: any) => void;
  initialTab?: 'sleep' | 'care' | 'cry';
  isPremium?: boolean;
  setIsSubscriptionModalOpen?: (open: boolean) => void;
}) => {
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sleepLogs, setSleepLogs] = useState<any[]>(() => {
    const s = localStorage.getItem('sleep_logs');
    return s ? JSON.parse(s) : [];
  });
  const [playingLullaby, setPlayingLullaby] = useState<number | null>(null);
  const [sleepInsight, setSleepInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  useEffect(() => {
    localStorage.setItem('sleep_logs', JSON.stringify(sleepLogs));
  }, [sleepLogs]);

  const generateSleepInsight = async () => {
    if (!isPremium) {
      if (setIsSubscriptionModalOpen) setIsSubscriptionModalOpen(true);
      return;
    }
    setIsGeneratingInsight(true);
    try {
      const response = await fetch("/api/ai/sleep-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ babyName, sleepLogs, loggedMoods })
      });
      const data = await response.json();
      if (data && data.insight) {
        setSleepInsight(data.insight);
      } else {
        setSleepInsight("• **Nap Duration**: Regular nap tracking helps pinpoint wake windows.\n• **Sweet Spot**: Schedule naps 1.5-2 hours post-wake.\n• **Soothing Tip**: Maintain quiet, dim lighting before naps.");
      }
    } catch (e) {
      console.error("AI Insight Error:", e);
      setSleepInsight("• **Nap Duration**: Regular nap tracking helps pinpoint wake windows.\n• **Sweet Spot**: Schedule naps 1.5-2 hours post-wake.\n• **Soothing Tip**: Maintain quiet, dim lighting before naps.");
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const correlationData = useMemo(() => {
    if (!sleepLogs || sleepLogs.length === 0) return [];

    return sleepLogs.slice(0, 8).map((log, idx) => {
      let durationHours = 1.5;
      if (typeof log.duration === 'string') {
        const hrsMatch = log.duration.match(/(\d+)\s*h/);
        const minsMatch = log.duration.match(/(\d+)\s*m/);
        const h = hrsMatch ? parseFloat(hrsMatch[1]) : 0;
        const m = minsMatch ? parseFloat(minsMatch[1]) : 0;
        const total = h + m / 60;
        if (total > 0) durationHours = Math.round(total * 10) / 10;
      }

      let score = 80;
      let moodText = 'Happy 😄';
      if (log.quality === '😴' || log.quality === '🤩') {
        score = 95;
        moodText = 'Restful 😄';
      } else if (log.quality === '😭') {
        score = 35;
        moodText = 'Fussy 😭';
      } else if (log.quality === '😠') {
        score = 50;
        moodText = 'Restless 😠';
      } else if (log.quality === '😐') {
        score = 70;
        moodText = 'Neutral 😐';
      }

      return {
        session: log.start || `Nap ${idx + 1}`,
        sleep: `${durationHours}h`,
        durationHours,
        score,
        mood: moodText,
        quality: log.quality || '😴'
      };
    }).reverse();
  }, [sleepLogs, loggedMoods]);

  const avgSleepDuration = correlationData.length > 0
    ? (correlationData.reduce((sum, item) => sum + item.durationHours, 0) / correlationData.length).toFixed(1)
    : '0';
  const happyNapsCount = correlationData.filter(d => d.score >= 70).length;
  const happyRatio = correlationData.length > 0 ? Math.round((happyNapsCount / correlationData.length) * 100) : 0;

  const lullabies = [
    // 3 Free Base Lullabies
    { id: 1, name: 'Twinkle Twinkle Little Star', duration: '2:15', isPremium: false },
    { id: 2, name: 'Rock-a-bye Baby', duration: '3:00', isPremium: false },
    { id: 3, name: 'Brahms Lullaby (Cradle Song)', duration: '2:45', isPremium: false },

    // 20 New Extra Premium Lullabies (Behind Paystack Paywall)
    { id: 4, name: 'Hush Little Baby (Mockingbird)', duration: '3:20', isPremium: true },
    { id: 5, name: 'Mozart Wiegenlied (Lullaby in F)', duration: '4:10', isPremium: true },
    { id: 6, name: 'Schubert Cradle Song', duration: '3:45', isPremium: true },
    { id: 7, name: 'You Are My Sunshine (Bedtime Chimes)', duration: '3:15', isPremium: true },
    { id: 8, name: 'Sleep, Baby, Sleep (Soft Flute)', duration: '3:50', isPremium: true },
    { id: 9, name: 'Silent Night & Velvet Chimes', duration: '4:30', isPremium: true },
    { id: 10, name: 'Golden Slumbers (Old English Air)', duration: '3:40', isPremium: true },
    { id: 11, name: 'Starry Night Music Box', duration: '4:15', isPremium: true },
    { id: 12, name: 'Moonlight Sonata (Celestial Synth)', duration: '5:00', isPremium: true },
    { id: 13, name: 'Deep Sea Waves & Gentle Harps', duration: '4:45', isPremium: true },
    { id: 14, name: 'Soft Rain & Sleep Box', duration: '5:10', isPremium: true },
    { id: 15, name: 'All the Pretty Little Horses', duration: '3:30', isPremium: true },
    { id: 16, name: 'Sweet Beams & Lavender Chimes', duration: '4:05', isPremium: true },
    { id: 17, name: 'Pachelbel Lullaby Canon', duration: '5:15', isPremium: true },
    { id: 18, name: 'Teddy Bear Dream Symphony', duration: '3:55', isPremium: true },
    { id: 19, name: 'Whispering Pines & Wind Chimes', duration: '4:20', isPremium: true },
    { id: 20, name: 'Over the Rainbow (Melodic Box)', duration: '3:40', isPremium: true },
    { id: 21, name: 'Warm Hearth Fire & Soft Strings', duration: '4:50', isPremium: true },
    { id: 22, name: 'Starlight Serenade', duration: '4:10', isPremium: true },
    { id: 23, name: 'Angel Slumber Meadow', duration: '5:30', isPremium: true }
  ];

  // --- MOVED STATES FOR CARE & GROWTH ---
  const [activeTab, setActiveTab] = useState<'sleep' | 'care' | 'cry'>(initialTab);

  // 1. Outdoor & Sunlight Exposure
  const [sunlightToday, setSunlightToday] = useState<number>(() => parseFloat(localStorage.getItem('sun_today') || '0'));
  const [sunlightGoal] = useState<number>(15);
  const [sunTimerActive, setSunTimerActive] = useState(false);
  const [sunSeconds, setSunSeconds] = useState(0);

  // 2. Bath & Hygiene Routines
  const [hygieneLog, setHygieneLog] = useState<Record<string, string>>(() => JSON.parse(localStorage.getItem('hygiene_log') || '{}'));

  // 3. Teething & Tooth Emergence Map
  const [teethingMap, setTeethingMap] = useState<Record<string, { emerged: boolean; date?: string; symptoms?: string[]; remedies?: string[] }>>(() => JSON.parse(localStorage.getItem('teething_map') || '{}'));
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  const [selectedToothEmerged, setSelectedToothEmerged] = useState(false);
  const [selectedToothDate, setSelectedToothDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedToothSymptoms, setSelectedToothSymptoms] = useState<string[]>([]);
  const [selectedToothRemedies, setSelectedToothRemedies] = useState<string[]>([]);

  // 5. Wake Window Calculator
  const [wwAgeBracket, setWwAgeBracket] = useState<'0-2m' | '3-4m' | '5-6m' | '7-9m' | '10-12m' | '12m+'>('5-6m');
  const [lastWakeTime, setLastWakeTime] = useState('11:30 AM');
  const [calculatedNapWindow, setCalculatedNapWindow] = useState('');

  // 6. Interactive sound machine (AudioContext)
  const [activeSound, setActiveSound] = useState<'none' | 'white' | 'brown' | 'celestial'>('none');
  const [volume, setVolume] = useState(0.5);
  const [soundTimer, setSoundTimer] = useState<string>('off');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const lullabyIntervalRef = useRef<any>(null);

  // Sync to local storage
  useEffect(() => { localStorage.setItem('sun_today', sunlightToday.toString()); }, [sunlightToday]);
  useEffect(() => { localStorage.setItem('hygiene_log', JSON.stringify(hygieneLog)); }, [hygieneLog]);
  useEffect(() => { localStorage.setItem('teething_map', JSON.stringify(teethingMap)); }, [teethingMap]);
  useEffect(() => { localStorage.setItem('vaccine_schedule', JSON.stringify(vaccineSchedule)); }, [vaccineSchedule]);

  // Timers and Handlers
  useEffect(() => {
    let interval: any = null;
    if (sunTimerActive) {
      interval = setInterval(() => {
        setSunSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [sunTimerActive]);

  useEffect(() => {
    const parseTimeToDate = (timeStr: string) => {
      const today = new Date();
      const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
      if (!match) return today;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      today.setHours(hours, minutes, 0, 0);
      return today;
    };

    const wakeTimeDate = parseTimeToDate(lastWakeTime);
    let startMin = 120;
    let endMin = 150;

    switch (wwAgeBracket) {
      case '0-2m': startMin = 45; endMin = 75; break;
      case '3-4m': startMin = 90; endMin = 120; break;
      case '5-6m': startMin = 120; endMin = 150; break;
      case '7-9m': startMin = 150; endMin = 180; break;
      case '10-12m': startMin = 180; endMin = 240; break;
      case '12m+': startMin = 240; endMin = 300; break;
    }

    const startNap = new Date(wakeTimeDate.getTime() + startMin * 60000);
    const endNap = new Date(wakeTimeDate.getTime() + endMin * 60000);

    const formatTimeStr = (d: Date) => {
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    setCalculatedNapWindow(`${formatTimeStr(startNap)} - ${formatTimeStr(endNap)}`);
  }, [wwAgeBracket, lastWakeTime]);

  const saveSunlight = (mins: number) => {
    setSunlightToday(prev => {
      const updated = prev + mins;
      localStorage.setItem('sun_today', updated.toString());
      return updated;
    });
    setSunSeconds(0);
    setSunTimerActive(false);
  };

  const toggleHygiene = (id: string) => {
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const updated = {
      ...hygieneLog,
      [id]: hygieneLog[id] ? '' : todayStr
    };
    setHygieneLog(updated);
    localStorage.setItem('hygiene_log', JSON.stringify(updated));
  };

  const handleToothClick = (id: string) => {
    setSelectedTooth(id);
    const status = teethingMap[id] || { emerged: false, symptoms: [], remedies: [] };
    setSelectedToothEmerged(status.emerged);
    setSelectedToothDate(status.date || new Date().toISOString().split('T')[0]);
    setSelectedToothSymptoms(status.symptoms || []);
    setSelectedToothRemedies(status.remedies || []);
  };

  const saveToothStatus = () => {
    if (!selectedTooth) return;
    const updated = {
      ...teethingMap,
      [selectedTooth]: {
        emerged: selectedToothEmerged,
        date: selectedToothEmerged ? selectedToothDate : undefined,
        symptoms: selectedToothSymptoms,
        remedies: selectedToothRemedies
      }
    };
    setTeethingMap(updated);
    localStorage.setItem('teething_map', JSON.stringify(updated));
    setSelectedTooth(null);
  };


  const stopAllAudio = () => {
    if (noiseSourceRef.current) {
      try { noiseSourceRef.current.stop(); } catch (e) {}
      noiseSourceRef.current = null;
    }
    if (lullabyIntervalRef.current) {
      clearTimeout(lullabyIntervalRef.current);
      clearInterval(lullabyIntervalRef.current);
      lullabyIntervalRef.current = null;
    }
    setActiveSound('none');
  };

  const startNoise = (type: 'white' | 'brown') => {
    stopAllAudio();
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (type === 'white') {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      } else {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      gainNodeRef.current = gain;

      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();

      noiseSourceRef.current = source;
      setActiveSound(type);
    } catch (e) {
      console.error("Web Audio failed:", e);
    }
  };

  const startCelestialSynth = () => {
    stopAllAudio();
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const parentGain = ctx.createGain();
      parentGain.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
      gainNodeRef.current = parentGain;
      parentGain.connect(ctx.destination);

      const pentatonicNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

      lullabyIntervalRef.current = setInterval(() => {
        if (!audioCtxRef.current) return;
        const osc = ctx.createOscillator();
        const chimeGain = ctx.createGain();

        osc.type = 'sine';
        const randomNote = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];
        osc.frequency.setValueAtTime(randomNote * 1.5, ctx.currentTime);

        chimeGain.gain.setValueAtTime(0, ctx.currentTime);
        chimeGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

        osc.connect(chimeGain);
        chimeGain.connect(parentGain);

        osc.start();
        osc.stop(ctx.currentTime + 2.0);
      }, 1200);

      setActiveSound('celestial');
    } catch (e) {
      console.error("Celestial synth failed:", e);
    }
  };

  const NOTE_FREQS: Record<string, number> = {
    'REST': 0,
    'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'Ab5': 830.61, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
    'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51
  };

  const startLullabyMelody = (lullabyId: number) => {
    stopAllAudio();
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const parentGain = ctx.createGain();
      parentGain.gain.setValueAtTime(volume * 0.55, ctx.currentTime);
      gainNodeRef.current = parentGain;
      parentGain.connect(ctx.destination);

      let bpm = 74;
      let score: { note: string; dur: number; bass?: string }[] = [];

      if (lullabyId === 1) {
        // 1. Twinkle Twinkle Little Star (Recognizable Classic)
        bpm = 76;
        score = [
          { note: 'C4', dur: 1, bass: 'C3' }, { note: 'C4', dur: 1 },
          { note: 'G4', dur: 1, bass: 'G3' }, { note: 'G4', dur: 1 },
          { note: 'A4', dur: 1, bass: 'F3' }, { note: 'A4', dur: 1 },
          { note: 'G4', dur: 2, bass: 'C3' },
          { note: 'F4', dur: 1, bass: 'F3' }, { note: 'F4', dur: 1 },
          { note: 'E4', dur: 1, bass: 'C3' }, { note: 'E4', dur: 1 },
          { note: 'D4', dur: 1, bass: 'G3' }, { note: 'D4', dur: 1 },
          { note: 'C4', dur: 2, bass: 'C3' },
          { note: 'G4', dur: 1, bass: 'C3' }, { note: 'G4', dur: 1 },
          { note: 'F4', dur: 1, bass: 'F3' }, { note: 'F4', dur: 1 },
          { note: 'E4', dur: 1, bass: 'C3' }, { note: 'E4', dur: 1 },
          { note: 'D4', dur: 2, bass: 'G3' },
          { note: 'G4', dur: 1, bass: 'C3' }, { note: 'G4', dur: 1 },
          { note: 'F4', dur: 1, bass: 'F3' }, { note: 'F4', dur: 1 },
          { note: 'E4', dur: 1, bass: 'C3' }, { note: 'E4', dur: 1 },
          { note: 'D4', dur: 2, bass: 'G3' },
          { note: 'C4', dur: 1, bass: 'C3' }, { note: 'C4', dur: 1 },
          { note: 'G4', dur: 1, bass: 'G3' }, { note: 'G4', dur: 1 },
          { note: 'A4', dur: 1, bass: 'F3' }, { note: 'A4', dur: 1 },
          { note: 'G4', dur: 2, bass: 'C3' },
          { note: 'F4', dur: 1, bass: 'F3' }, { note: 'F4', dur: 1 },
          { note: 'E4', dur: 1, bass: 'C3' }, { note: 'E4', dur: 1 },
          { note: 'D4', dur: 1, bass: 'G3' }, { note: 'D4', dur: 1 },
          { note: 'C4', dur: 3, bass: 'C3' }
        ];
      } else if (lullabyId === 2) {
        // 2. Rock-a-bye Baby (6/8 Cradle Swing)
        bpm = 60;
        score = [
          { note: 'E4', dur: 1.5, bass: 'C3' }, { note: 'G4', dur: 0.5 }, { note: 'C5', dur: 1 },
          { note: 'B4', dur: 1.5, bass: 'G3' }, { note: 'A4', dur: 1.5 },
          { note: 'G4', dur: 1.5, bass: 'C3' }, { note: 'F4', dur: 1.5 },
          { note: 'E4', dur: 1.5, bass: 'G3' }, { note: 'D4', dur: 1.5 },
          { note: 'E4', dur: 1.5, bass: 'C3' }, { note: 'G4', dur: 0.5 }, { note: 'C5', dur: 1 },
          { note: 'B4', dur: 1.5, bass: 'G3' }, { note: 'A4', dur: 1.5 },
          { note: 'G4', dur: 1.5, bass: 'C3' }, { note: 'D4', dur: 1.5 },
          { note: 'C4', dur: 3, bass: 'C3' }
        ];
      } else if (lullabyId === 3) {
        // 3. Brahms Lullaby (Wiegenlied)
        bpm = 68;
        score = [
          { note: 'E4', dur: 0.75, bass: 'C3' }, { note: 'E4', dur: 0.75 }, { note: 'G4', dur: 1.5 },
          { note: 'E4', dur: 0.75, bass: 'C3' }, { note: 'E4', dur: 0.75 }, { note: 'G4', dur: 1.5 },
          { note: 'E4', dur: 0.5, bass: 'C3' }, { note: 'G4', dur: 0.5 }, { note: 'C5', dur: 1 },
          { note: 'B4', dur: 0.5, bass: 'F3' }, { note: 'A4', dur: 0.75 }, { note: 'A4', dur: 0.75 },
          { note: 'G4', dur: 1.5, bass: 'C3' },
          { note: 'D4', dur: 0.5, bass: 'G3' }, { note: 'E4', dur: 0.5 }, { note: 'F4', dur: 1 },
          { note: 'D4', dur: 0.5, bass: 'G3' }, { note: 'D4', dur: 0.5 }, { note: 'E4', dur: 0.5 }, { note: 'F4', dur: 1 },
          { note: 'D4', dur: 0.5, bass: 'G3' }, { note: 'F4', dur: 0.5 }, { note: 'B4', dur: 1 },
          { note: 'A4', dur: 0.5, bass: 'G3' }, { note: 'G4', dur: 0.5 }, { note: 'B4', dur: 0.5 },
          { note: 'C5', dur: 2.5, bass: 'C3' }
        ];
      } else if (lullabyId === 4) {
        // 4. Hush Little Baby (Mockingbird)
        bpm = 84;
        score = [
          { note: 'G4', dur: 0.5, bass: 'C3' }, { note: 'E4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'E4', dur: 0.5 },
          { note: 'G4', dur: 0.5, bass: 'C3' }, { note: 'G4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 0.5 },
          { note: 'F4', dur: 0.5, bass: 'G3' }, { note: 'D4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'D4', dur: 0.5 },
          { note: 'F4', dur: 0.5, bass: 'G3' }, { note: 'F4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'F4', dur: 0.5 },
          { note: 'E4', dur: 0.5, bass: 'C3' }, { note: 'C4', dur: 0.5 }, { note: 'E4', dur: 0.5 }, { note: 'C4', dur: 0.5 },
          { note: 'D4', dur: 0.5, bass: 'G3' }, { note: 'D4', dur: 0.5 }, { note: 'D4', dur: 0.5 }, { note: 'D4', dur: 0.5 },
          { note: 'C4', dur: 2, bass: 'C3' }
        ];
      } else if (lullabyId === 5) {
        // 5. Mozart Wiegenlied (Schlafe, mein Prinzchen)
        bpm = 66;
        score = [
          { note: 'F4', dur: 1, bass: 'F3' }, { note: 'A4', dur: 0.5 }, { note: 'C5', dur: 1 }, { note: 'A4', dur: 0.5 },
          { note: 'F4', dur: 1, bass: 'F3' }, { note: 'G4', dur: 0.5 }, { note: 'Bb4', dur: 1 }, { note: 'D5', dur: 0.5 },
          { note: 'C5', dur: 0.75, bass: 'C3' }, { note: 'Bb4', dur: 0.5 }, { note: 'G4', dur: 0.75 }, { note: 'A4', dur: 0.5 },
          { note: 'C5', dur: 1.5, bass: 'F3' }, { note: 'F5', dur: 1.5 }
        ];
      } else if (lullabyId === 6) {
        // 6. Schubert Cradle Song
        bpm = 64;
        score = [
          { note: 'G4', dur: 1.5, bass: 'C3' }, { note: 'E4', dur: 0.5 }, { note: 'C4', dur: 1 }, { note: 'D4', dur: 1 },
          { note: 'E4', dur: 1, bass: 'G3' }, { note: 'F4', dur: 1 }, { note: 'G4', dur: 2 },
          { note: 'A4', dur: 1.5, bass: 'F3' }, { note: 'F4', dur: 0.5 }, { note: 'D4', dur: 1 }, { note: 'B3', dur: 1 },
          { note: 'C4', dur: 3, bass: 'C3' }
        ];
      } else if (lullabyId === 7) {
        // 7. You Are My Sunshine (Bedtime Chimes)
        bpm = 78;
        score = [
          { note: 'C4', dur: 0.5, bass: 'C3' }, { note: 'F4', dur: 0.5 }, { note: 'G4', dur: 0.5 },
          { note: 'A4', dur: 1.5, bass: 'F3' }, { note: 'A4', dur: 0.5 }, { note: 'A4', dur: 0.5 },
          { note: 'G4', dur: 0.5, bass: 'C3' }, { note: 'A4', dur: 0.5 }, { note: 'F4', dur: 1.5, bass: 'F3' },
          { note: 'F4', dur: 0.5 }, { note: 'F4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'A4', dur: 0.5 },
          { note: 'Bb4', dur: 1.5, bass: 'Bb3' }, { note: 'D5', dur: 0.5 }, { note: 'D5', dur: 0.5 }, { note: 'C5', dur: 0.5 }, { note: 'Bb4', dur: 0.5 },
          { note: 'A4', dur: 2, bass: 'F3' }
        ];
      } else if (lullabyId === 8) {
        // 8. Sleep, Baby, Sleep
        bpm = 70;
        score = [
          { note: 'G4', dur: 1.5, bass: 'C3' }, { note: 'E4', dur: 1.5 },
          { note: 'G4', dur: 1.5, bass: 'C3' }, { note: 'E4', dur: 1.5 },
          { note: 'A4', dur: 0.75, bass: 'F3' }, { note: 'G4', dur: 0.75 }, { note: 'F4', dur: 0.75 }, { note: 'E4', dur: 0.75 },
          { note: 'D4', dur: 3, bass: 'G3' },
          { note: 'G4', dur: 1.5, bass: 'C3' }, { note: 'E4', dur: 1.5 },
          { note: 'D4', dur: 0.75, bass: 'G3' }, { note: 'E4', dur: 0.75 }, { note: 'D4', dur: 0.75 }, { note: 'E4', dur: 0.75 },
          { note: 'C4', dur: 3, bass: 'C3' }
        ];
      } else if (lullabyId === 9) {
        // 9. Silent Night & Velvet Chimes
        bpm = 60;
        score = [
          { note: 'G4', dur: 1.5, bass: 'C3' }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 1 }, { note: 'E4', dur: 3 },
          { note: 'G4', dur: 1.5, bass: 'C3' }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 1 }, { note: 'E4', dur: 3 },
          { note: 'D5', dur: 2, bass: 'G3' }, { note: 'D5', dur: 1 }, { note: 'B4', dur: 3 },
          { note: 'C5', dur: 2, bass: 'C3' }, { note: 'C5', dur: 1 }, { note: 'G4', dur: 3 }
        ];
      } else if (lullabyId === 10) {
        // 10. Golden Slumbers
        bpm = 66;
        score = [
          { note: 'E4', dur: 0.75, bass: 'C3' }, { note: 'G4', dur: 0.75 }, { note: 'A4', dur: 0.75 }, { note: 'B4', dur: 1.5, bass: 'G3' }, { note: 'C5', dur: 0.75 },
          { note: 'B4', dur: 1, bass: 'G3' }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 0.75 }, { note: 'E4', dur: 1.5, bass: 'C3' }, { note: 'D4', dur: 0.75 },
          { note: 'C4', dur: 0.75, bass: 'F3' }, { note: 'E4', dur: 0.75 }, { note: 'G4', dur: 0.75 }, { note: 'A4', dur: 0.75 }, { note: 'B4', dur: 1.5, bass: 'G3' },
          { note: 'C5', dur: 0.75, bass: 'C3' }, { note: 'B4', dur: 0.75 }, { note: 'A4', dur: 0.75 }, { note: 'G4', dur: 2.5 }
        ];
      } else if (lullabyId === 17) {
        // 17. Pachelbel Lullaby Canon in D
        bpm = 64;
        score = [
          { note: 'D5', dur: 1.5, bass: 'D3' }, { note: 'C#5', dur: 1.5, bass: 'A3' },
          { note: 'B4', dur: 1.5, bass: 'B3' }, { note: 'A4', dur: 1.5, bass: 'F#3' },
          { note: 'G4', dur: 1.5, bass: 'G3' }, { note: 'F#4', dur: 1.5, bass: 'D3' },
          { note: 'G4', dur: 1.5, bass: 'G3' }, { note: 'E4', dur: 1.5, bass: 'A3' }
        ];
      } else if (lullabyId === 20) {
        // 20. Over the Rainbow (Melodic Box)
        bpm = 64;
        score = [
          { note: 'C4', dur: 1.5, bass: 'C3' }, { note: 'C5', dur: 1.5 },
          { note: 'B4', dur: 0.75, bass: 'G3' }, { note: 'G4', dur: 0.75 }, { note: 'A4', dur: 0.75 }, { note: 'B4', dur: 0.75 },
          { note: 'C5', dur: 2.5, bass: 'C3' }, { note: 'C4', dur: 0.75 },
          { note: 'A4', dur: 1.5, bass: 'F3' }, { note: 'F4', dur: 1.5 },
          { note: 'G4', dur: 0.75, bass: 'C3' }, { note: 'E4', dur: 0.75 }, { note: 'F4', dur: 0.75 }, { note: 'G4', dur: 0.75 },
          { note: 'A4', dur: 2.5, bass: 'F3' }
        ];
      } else {
        // African / Global Gentle Slumber Pentatonic Melody (Default)
        bpm = 70;
        score = [
          { note: 'C4', dur: 0.75, bass: 'C3' }, { note: 'E4', dur: 0.75 }, { note: 'G4', dur: 1 }, { note: 'A4', dur: 0.5 },
          { note: 'G4', dur: 0.75, bass: 'C3' }, { note: 'E4', dur: 0.75 }, { note: 'D4', dur: 1.5, bass: 'G3' },
          { note: 'C4', dur: 0.75, bass: 'C3' }, { note: 'D4', dur: 0.75 }, { note: 'E4', dur: 0.75 }, { note: 'G4', dur: 0.75 },
          { note: 'A4', dur: 0.75, bass: 'F3' }, { note: 'G4', dur: 0.75 }, { note: 'E4', dur: 1.5, bass: 'C3' },
          { note: 'D4', dur: 0.75, bass: 'G3' }, { note: 'E4', dur: 0.75 }, { note: 'D4', dur: 0.75 }, { note: 'C4', dur: 2.5, bass: 'C3' }
        ];
      }

      const beatMs = (60 / bpm) * 1000;
      let noteIdx = 0;

      const playNextStep = () => {
        if (!audioCtxRef.current || !gainNodeRef.current) return;
        const currentItem = score[noteIdx % score.length];
        noteIdx++;

        const freq = NOTE_FREQS[currentItem.note] || 0;
        const bassFreq = currentItem.bass ? (NOTE_FREQS[currentItem.bass] || 0) : 0;
        const durSec = (currentItem.dur * beatMs) / 1000;

        const now = ctx.currentTime;

        if (freq > 20) {
          // Primary Music Box Chime
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(freq, now);

          // Shimmer Bell overtone (+1 octave, triangle)
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(freq * 2, now);

          const decayTime = Math.max(1.8, durSec * 2.2);

          gain1.gain.setValueAtTime(0, now);
          gain1.gain.linearRampToValueAtTime(0.20, now + 0.012);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

          gain2.gain.setValueAtTime(0, now);
          gain2.gain.linearRampToValueAtTime(0.05, now + 0.012);
          gain2.gain.exponentialRampToValueAtTime(0.0005, now + decayTime * 0.75);

          osc1.connect(gain1);
          gain1.connect(parentGain);

          osc2.connect(gain2);
          gain2.connect(parentGain);

          osc1.start(now);
          osc1.stop(now + decayTime + 0.1);

          osc2.start(now);
          osc2.stop(now + decayTime + 0.1);
        }

        if (bassFreq > 20) {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = 'sine';
          bassOsc.frequency.setValueAtTime(bassFreq, now);

          const bassDecay = Math.max(2.2, durSec * 2.5);
          bassGain.gain.setValueAtTime(0, now);
          bassGain.gain.linearRampToValueAtTime(0.12, now + 0.03);
          bassGain.gain.exponentialRampToValueAtTime(0.0008, now + bassDecay);

          bassOsc.connect(bassGain);
          bassGain.connect(parentGain);

          bassOsc.start(now);
          bassOsc.stop(now + bassDecay + 0.1);
        }

        const delay = currentItem.dur * beatMs;
        lullabyIntervalRef.current = setTimeout(playNextStep, delay);
      };

      playNextStep();
      setActiveSound('celestial');
    } catch (e) {
      console.error("Lullaby synth failed:", e);
    }
  };

  useEffect(() => {
    if (activeSound === 'none' || soundTimer === 'off') return;
    let min = 5;
    if (soundTimer === '15m') min = 15;
    if (soundTimer === '30m') min = 30;
    if (soundTimer === '60m') min = 60;

    const timeout = setTimeout(() => {
      if (gainNodeRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        gainNodeRef.current.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 3.0);
        setTimeout(() => {
          stopAllAudio();
        }, 3200);
      } else {
        stopAllAudio();
      }
    }, min * 60000);

    return () => clearTimeout(timeout);
  }, [soundTimer, activeSound]);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const factor = activeSound === 'celestial' ? 0.5 : 0.4;
      gainNodeRef.current.gain.setValueAtTime(volume * factor, audioCtxRef.current.currentTime);
    }
  }, [volume, activeSound]);

  useEffect(() => {
    return () => {
      stopAllAudio();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const BABY_MOODS = ['😴', '😭', '😠', '😐', '😄'];
  const currentMood = loggedMoods[loggedMoods.length - 1]?.mood || '😄';

  const todayActivities = scheduledActivities.filter((a: any) => {
    if (!a.date) return true;
    return new Date(a.date).toDateString() === new Date().toDateString();
  });

  // Baby sound monitor states
  const [isListening, setIsListening] = useState(false);
  const [decibels, setDecibels] = useState(0);
  const [monitorAlert, setMonitorAlert] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleBabySoundDetected = () => {
    const now = new Date();
    
    // Check if mood was logged manually in the last 15 seconds
    const lastLog = loggedMoods[loggedMoods.length - 1];
    const isRecent = lastLog && (Date.now() - new Date(lastLog.timestamp).getTime() < 15000);

    if (isActive) {
      // Sleep session is active, automatically trigger "Wake Up"!
      const startTime = new Date(now.getTime() - timer * 1000);
      const startStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const hrs = Math.floor(timer / 3600);
      const mins = Math.floor((timer % 3600) / 60);

      setSleepLogs(prev => [
        { 
          start: startStr, 
          end: endStr, 
          duration: (hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`), 
          quality: '😭', 
          timestamp: now.toISOString() 
        }, 
        ...prev
      ]);
      setIsActive(false);
      setTimer(0);

      // Log crying mood automatically if not already done manually
      if (!isRecent) {
        setLoggedMoods([
          ...loggedMoods,
          { mood: '😭', timestamp: now.toISOString(), source: 'Auto Sound Detection' }
        ]);
      }

      setMonitorAlert("Sound trigger automatically ended the sleep session and logged a fussy mood.");
    } else {
      // Just log mood as restless/crying if not already done manually
      if (!isRecent) {
        setLoggedMoods([
          ...loggedMoods,
          { mood: '😭', timestamp: now.toISOString(), source: 'Auto Sound Detection' }
        ]);
        setMonitorAlert("Baby sound detected! Automatically logged a fussy/crying mood.");
      } else {
        setMonitorAlert("Baby sound detected! Mood was recently logged manually, so skipping auto-log.");
      }
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);

      // Filter out low ambient room hums (<300Hz) and high static hiss (>3500Hz)
      const highpass = audioCtx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 300;

      const lowpass = audioCtx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 3500;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(analyser);

      setIsListening(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let lastTriggerTime = 0;

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setDecibels(Math.round(average));

        // Average level > 40 is a clear sound trigger (clapping, talking, whistling)
        if (average > 40) {
          const now = Date.now();
          if (now - lastTriggerTime > 10000) { // 10 second debounce
            lastTriggerTime = now;
            handleBabySoundDetected();
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.error("Microphone access failed:", err);
      setMonitorAlert("Microphone permission denied. Please allow mic access to use the Baby Sound Monitor.");
    }
  };

  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
    setDecibels(0);
  };

  useEffect(() => {
    // Auto-dismiss monitor alert after 6 seconds
    if (monitorAlert) {
      const timeoutId = setTimeout(() => setMonitorAlert(null), 6000);
      return () => clearTimeout(timeoutId);
    }
  }, [monitorAlert]);

  useEffect(() => {
    // Cleanup audio connections on unmount
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(track => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    if (timer > 60) {
      const now = new Date();
      const startTime = new Date(now.getTime() - timer * 1000);
      const startStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const hrs = Math.floor(timer / 3600);
      const mins = Math.floor((timer % 3600) / 60);
      
      setSleepLogs([{ start: startStr, end: endStr, duration: (hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`), quality: '😴', timestamp: now.toISOString() }, ...sleepLogs]);
    }
    setIsActive(false);
    setTimer(0);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-32 space-y-8 bg-background min-h-screen">
      <header className="flex justify-between items-center pt-3 sm:pt-4 pb-2 px-1">
        <h1 className="text-2xl font-serif font-black text-gray-800">Activity Tracker</h1>
        <div className="w-11 h-11 rounded-full bg-card shadow-sm border border-white flex items-center justify-center">
          <span className="text-2xl">🧸</span>
          
    </div>
      </header>

      {/* Segmented Tab Control */}
      <div className="flex gap-2 bg-gray-50 p-1.5 rounded-full border border-gray-100">
        {[
          { id: 'sleep', label: '💤 Sleep & Mood' },
          { id: 'care', label: '🩺 Care & Moments' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
        
    </div>

      {/* Baby Sound Monitor Notification Banner */}
      <AnimatePresence>
        {monitorAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-[#37b1f5] text-gray-800 p-5 rounded-[32px] flex items-center justify-between shadow-lg border border-white"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl animate-bounce">👶</span>
              <div className="text-left">
                <p className="font-serif font-black text-sm uppercase tracking-wider">Baby Sound Alert</p>
                <p className="text-[11px] font-medium opacity-90">{monitorAlert}</p>
                
    </div>
              
    </div>
            <button 
              onClick={() => setMonitorAlert(null)}
              className="w-8 h-8 rounded-full bg-white/20 text-gray-800 flex items-center justify-center hover:bg-white/30 transition-all font-bold text-xs"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'sleep' ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Baby Sound Monitor Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card p-6 rounded-[48px] shadow-sm border border-white flex flex-col space-y-4 text-left"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif font-black text-gray-800 uppercase tracking-widest text-xs">🎙️ Baby Sound Monitor</h3>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Auto Sleep & Mood Logger</p>
                
    </div>
              <button
                onClick={isListening ? stopListening : startListening}
                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none ${
                  isListening ? 'bg-primary/20 text-primary shadow-md' : 'bg-primary text-white shadow-md shadow-primary/20'
                }`}
              >
                {isListening ? 'Stop Listening' : 'Start Monitor'}
              </button>
            </div>

            <div className="bg-white/60 p-4 rounded-3xl space-y-3 border border-white/50">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-black text-gray-400 uppercase tracking-widest">Status:</span>
                <span className={`font-black uppercase tracking-wider ${isListening ? 'text-primary animate-pulse' : 'text-gray-400'}`}>
                  {isListening ? '🟢 LISTENING ACTIVE' : '⚪ OFFLINE'}
                </span>
              </div>

              {isListening && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-black text-gray-400 uppercase tracking-widest">Mic Amplitude:</span>
                    <span className="font-mono font-bold text-gray-700">{decibels} dB</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${decibels > 40 ? 'bg-primary' : 'bg-primary'}`}
                      animate={{ width: `${Math.min(100, (decibels / 100) * 100)}%` }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    />
                  </div>
                  {decibels > 40 && (
                    <p className="text-[9px] font-black text-primary uppercase tracking-wider animate-pulse">
                      ⚠️ Sound detected! Threshold exceeded.
                    </p>
                  )}
                </div>
              )}

              <p className="text-[10px] text-muted leading-relaxed font-medium">
                Allows the app to automatically detect sounds (crying, fussing). Sound above 40dB triggers auto "Wake Up" for active sleep sessions, or logs a fussy mood if baby is awake.
              </p>
              
    </div>
          </motion.div>

          {/* Log Current Mood */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card p-8 rounded-[48px] shadow-sm border border-white flex flex-col items-center space-y-6"
          >
            <div className="space-y-4 w-full">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Log Current Mood</p>
              <div className="flex justify-center gap-4">
                {BABY_MOODS.map(m => (
                  <button 
                    key={m}
                    onClick={() => setLoggedMoods([...loggedMoods, { mood: m, timestamp: new Date().toISOString() }])}
                    className="text-3xl transition-all cursor-pointer bg-transparent border-none outline-none hover:scale-110 active:scale-95"
                    style={{ opacity: currentMood === m ? 1 : 0.3, filter: currentMood === m ? 'none' : 'grayscale(100%)' }}
                  >
                    {m}
                  </button>
                ))}
                
    </div>
              {loggedMoods.length > 0 && (
                <p className="text-[10px] font-black text-muted uppercase tracking-widest text-center">
                  Last logged: {new Date(loggedMoods[loggedMoods.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              
    </div>
          </motion.div>

          {/* Current Nap (Active Timer) */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card p-10 rounded-[48px] shadow-sm border border-white flex flex-col items-center space-y-6"
          >
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Nap</p>
              <div className="text-6xl font-serif font-black text-gray-800 tabular-nums">
                {formatTime(timer)}
                
    </div>
              
    </div>
            
            {isActive ? (
              <motion.button 
                whileTap={{ scale: 0.9, rotate: -3 }}
                onClick={handleStop}
                className="px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all shadow-lg bg-primary/20 text-primary shadow-primary/10 cursor-pointer border-none"
              >
                Wake Up
              </motion.button>
            ) : (
              <motion.button 
                whileTap={{ scale: 0.9, rotate: 3 }}
                onClick={() => setIsActive(true)}
                className="px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all shadow-lg bg-primary text-white shadow-primary/20 cursor-pointer border-none"
              >
                Start Sleep
              </motion.button>
            )}
          </motion.div>

          {/* Wake Window Calculator */}
          <div className="bg-card rounded-[40px] border border-white shadow-sm p-6 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">⏳</div>
              <div>
                <h3 className="text-sm font-serif font-black text-gray-800">Wake Window Calculator</h3>
                <p className="text-[11px] text-gray-400 font-medium">Maintains age-appropriate bedtime windows</p>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-3xl space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-bold text-gray-400 block mb-1 uppercase">Baby Age</label>
                  <select
                    value={wwAgeBracket}
                    onChange={e => setWwAgeBracket(e.target.value as any)}
                    className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none"
                  >
                    <option value="0-2m">0-2 Months</option>
                    <option value="3-4m">3-4 Months</option>
                    <option value="5-6m">5-6 Months</option>
                    <option value="7-9m">7-9 Months</option>
                    <option value="10-12m">10-12 Months</option>
                    <option value="12m+">12m+ Months</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-bold text-gray-400 block mb-1 uppercase">Last Wake Up</label>
                  <input
                    type="text"
                    value={lastWakeTime}
                    onChange={e => setLastWakeTime(e.target.value)}
                    placeholder="e.g. 11:30 AM"
                    className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-2xl border border-solid border-primary/20 text-center">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mb-1">Recommended Next Nap Window</p>
                <p className="text-xl font-serif font-black text-gray-800">{calculatedNapWindow}</p>
                <p className="text-[9px] text-gray-500 font-medium mt-1">Calculated based on baby sleep science guidelines.</p>
              </div>
            </div>
          </div>

          {/* Procedural Ambient Sound Machine & Lullabies Merged Card */}
          <div className="bg-card rounded-[40px] border border-white shadow-sm p-6 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">🔊</div>
              <div>
                <h3 className="text-sm font-serif font-black text-gray-800">Lullabies & Sound Machine</h3>
                <p className="text-[11px] text-gray-400 font-medium">Soothing audio synthesized directly in browser</p>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-3xl space-y-5">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'white', label: '🌬️ White', desc: 'Rushing' },
                  { id: 'brown', label: '🌊 Brown', desc: 'Deep ocean' },
                  { id: 'celestial', label: '🎵 Bells', desc: 'Celestial' },
                ].map(snd => (
                  <button
                    key={snd.id}
                    onClick={() => {
                      if (activeSound === snd.id) {
                        stopAllAudio();
                      } else if (snd.id === 'celestial') {
                        startCelestialSynth();
                      } else {
                        startNoise(snd.id as any);
                      }
                      setPlayingLullaby(null); // Stop any playing custom melody list
                    }}
                    className={`p-3.5 rounded-2xl flex flex-col items-center justify-center text-center border-none cursor-pointer transition-all ${activeSound === snd.id ? 'bg-primary text-white font-extrabold' : 'bg-white text-gray-600 border border-solid border-gray-100 hover:bg-gray-100/50'}`}
                  >
                    <span className="text-xs font-bold leading-none">{snd.label}</span>
                    <span className="text-[8px] opacity-60 uppercase mt-0.5 font-bold">{snd.desc}</span>
                  </button>
                ))}
              </div>

              {(activeSound !== 'none' || playingLullaby !== null) && (
                <button
                  onClick={() => {
                    stopAllAudio();
                    setPlayingLullaby(null);
                  }}
                  className="w-full bg-primary/20 text-primary py-2 rounded-xl font-black text-[9px] uppercase tracking-widest cursor-pointer border-none"
                >
                  ⏹ Stop All Audio
                </button>
              )}

              {/* Volume Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">
                  <span>Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={e => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Sleep Timer */}
              <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Sleep Timer</p>
                <div className="grid grid-cols-5 gap-1">
                  {['off', '5m', '15m', '30m', '60m'].map(timer => (
                    <button
                      key={timer}
                      onClick={() => setSoundTimer(timer)}
                      className={`py-1.5 rounded-lg text-[9px] font-black uppercase border-none cursor-pointer ${soundTimer === timer ? 'bg-primary/20 text-primary font-black' : 'bg-white text-gray-400 border border-solid border-gray-100'}`}
                    >
                      {timer}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lullabies for Baby Embedded Section */}
              <div className="border-t border-gray-200/50 pt-4 mt-2 space-y-3">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Lullabies for Baby</p>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {lullabies.map((lullaby) => {
                    const isLocked = lullaby.isPremium && !isPremium;
                    return (
                      <div key={lullaby.id} className="flex justify-between items-center p-3 bg-white rounded-2xl border border-solid border-gray-100/50 shadow-xs hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${playingLullaby === lullaby.id ? 'bg-primary text-white' : isLocked ? 'bg-amber-100 text-amber-600 font-bold' : 'bg-primary/10 text-primary'}`}>
                            {isLocked ? '🔒' : '🎵'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-bold text-gray-800 leading-tight truncate">{lullaby.name}</p>
                              {lullaby.isPremium && (
                                <span className="text-[8px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">
                                  PRO
                                </span>
                              )}
                            </div>
                            <p className="text-[8px] font-black text-muted uppercase tracking-widest">{lullaby.duration}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            if (isLocked) {
                              if (setIsSubscriptionModalOpen) setIsSubscriptionModalOpen(true);
                              return;
                            }
                            if (playingLullaby === lullaby.id) {
                              setPlayingLullaby(null);
                              stopAllAudio();
                            } else {
                              setPlayingLullaby(lullaby.id);
                              startLullabyMelody(lullaby.id);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all border-none cursor-pointer flex items-center gap-1 shrink-0 ${
                            isLocked
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                              : playingLullaby === lullaby.id 
                              ? 'bg-primary/20 text-primary font-bold' 
                              : 'bg-primary/10 hover:bg-primary text-primary hover:text-white'
                          }`}
                        >
                          {isLocked ? (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Unlock</span>
                            </>
                          ) : playingLullaby === lullaby.id ? '■ Stop' : '▶ Play'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sleep & Mood correlation charts */}
          <div className="bg-card rounded-[40px] border border-white shadow-sm p-6 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">📊</div>
              <div>
                <h3 className="text-sm font-serif font-black text-gray-800">Sleep & Mood Correlation</h3>
                <p className="text-[11px] text-gray-400 font-medium">Visualizes recorded sleep duration against baby mood</p>
              </div>
            </div>

            {correlationData.length > 0 ? (
              <>
                <div className="bg-gray-50 p-4 rounded-3xl h-44 flex items-center justify-center text-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={correlationData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="sleep" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <RechartsTooltip formatter={(value: any, name: any, props: any) => [`${value}% (${props.payload.mood})`, 'Baby Mood Score']} labelFormatter={(label: any) => `Sleep Duration: ${label}`} />
                      <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} name="Baby Happiness %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                  Data from <span className="font-bold text-gray-700">{correlationData.length} recorded nap sessions</span> shows average sleep of <span className="font-bold text-gray-700">{avgSleepDuration}h</span> with <span className="font-bold text-primary">{happyRatio}%</span> positive post-nap mood.
                </p>
              </>
            ) : (
              <div className="bg-gray-50/70 p-6 rounded-3xl text-center space-y-2 border border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-700">No sleep sessions recorded yet today</p>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  Start the active nap timer or log sleep above. The chart dynamically calculates your baby's sleep duration and post-nap mood correlation from your real logs.
                </p>
              </div>
            )}
          </div>

          {/* AI Sleep Insights */}
          <div className="bg-card rounded-[40px] border border-white shadow-sm p-6 space-y-6 text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl text-primary">✨</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-serif font-black text-gray-800">AI Nap Insights</h3>
                    {isPremium ? (
                      <span className="bg-primary text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" /> PRO
                      </span>
                    ) : (
                      <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Premium Only
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">Predicts optimal sleep windows & circadian patterns</p>
                </div>
              </div>
              {isPremium ? (
                !sleepInsight && !isGeneratingInsight && (
                  <button 
                    onClick={generateSleepInsight}
                    className="px-4 py-2 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-md hover:scale-105 transition-all border-none"
                  >
                    Analyze
                  </button>
                )
              ) : (
                <button 
                  onClick={() => setIsSubscriptionModalOpen?.(true)}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-md hover:scale-105 transition-all flex items-center gap-1 border-none"
                >
                  <Crown className="w-3 h-3" /> Upgrade
                </button>
              )}
            </div>

            {!isPremium ? (
              <div className="bg-primary/5 rounded-3xl p-5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <p className="text-xs font-bold text-gray-800">AI Nap & Circadian Insights is locked to Premium</p>
                  <p className="text-[11px] text-gray-600 font-medium">
                    Analyzes your baby's historical sleep logs and wake windows to forecast sweet-spot nap times.
                  </p>
                </div>
                <button
                  onClick={() => setIsSubscriptionModalOpen?.(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-none shadow-md shrink-0"
                >
                  <Crown className="w-4 h-4" />
                  <span>Unlock AI Insights</span>
                </button>
              </div>
            ) : (
              <>
                {isGeneratingInsight && (
                  <div className="bg-primary/5 rounded-2xl p-6 text-center space-y-3 animate-pulse">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Analyzing past 7 days...</p>
                  </div>
                )}

                {sleepInsight && !isGeneratingInsight && (
                  <div className="bg-primary/5 rounded-3xl p-5 border border-primary/20">
                    <div className="text-[11px] text-gray-800 leading-relaxed space-y-2 whitespace-pre-wrap">
                      {sleepInsight}
                    </div>
                    <button 
                      onClick={generateSleepInsight}
                      className="mt-4 text-[9px] font-black text-primary uppercase tracking-widest hover:text-primary/80 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      ↻ Refresh Insights
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Today's Naps */}
          <div className="space-y-4 text-left">
            <h2 className="text-xl font-serif font-black text-gray-800 px-2">Today's Naps</h2>
            {sleepLogs.length > 0 ? (
              sleepLogs.map((log, i) => (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-card p-6 rounded-[32px] shadow-sm flex justify-between items-center border border-white"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-800">{log.start} - {log.end}</p>
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest">{log.duration} • Logged at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-3xl bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center">
                    {log.quality}
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic px-2">No naps logged yet today.</p>
            )}
          </div>

          {/* Integrated Smart Baby Cry Reason Analyzer */}
          <div className="md:col-span-2 pt-2">
            <BabyCryAnalyzer 
              babyName={babyName}
              babyAge={babyAge}
              loggedMeals={loggedMeals}
              diaperLogs={diaperLogs}
              sleepLogs={sleepLogs}
              onNavigate={onNavigate}
              isPremium={isPremium}
              onOpenSubscriptionModal={() => setIsSubscriptionModalOpen?.(true)}
            />
            
    </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Outdoor & Sunlight Exposure */}
          <div className="bg-card rounded-[40px] border border-white shadow-sm p-6 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">☀️</div>
              <div>
                <h3 className="text-sm font-serif font-black text-gray-800">Outdoor & Sunlight</h3>
                <p className="text-[11px] text-gray-400 font-medium">Perfect for strollers, circadian rhythm & Vitamin D</p>
              </div>
            </div>

            {/* Circular Gauge */}
            <div className="flex flex-col items-center justify-center py-4 relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="50" stroke="#f3f4f6" strokeWidth="10" fill="transparent" />
                <circle cx="64" cy="64" r="50" stroke="var(--color-primary, #ec4899)" strokeWidth="10" fill="transparent"
                  strokeDasharray={314.15}
                  strokeDashoffset={314.15 - (314.15 * Math.min(100, (sunlightToday / sunlightGoal) * 100)) / 100}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-serif font-black text-gray-800">{Math.round(sunlightToday)}</span>
                <span className="text-[10px] text-muted block font-bold">/ {sunlightGoal} min</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-3xl space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                <span>Stroll Timer</span>
                <span className="font-mono text-base">{Math.floor(sunSeconds / 60)}m {(sunSeconds % 60).toString().padStart(2, '0')}s</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSunTimerActive(!sunTimerActive)}
                  className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer border-none transition-all ${sunTimerActive ? 'bg-primary text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}
                >
                  {sunTimerActive ? 'Pause' : 'Start Playtime'}
                </button>
                {sunSeconds > 0 && (
                  <button
                    onClick={() => saveSunlight(sunSeconds / 60)}
                    className="px-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer border-none hover:bg-primary/90"
                  >
                    Save
                  </button>
                )}
                
    </div>
              
    </div>
            
    </div>

          {/* Bath & Hygiene Routines */}
          <div className="bg-card rounded-[40px] border border-white shadow-sm p-6 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-2xl">🧼</div>
              <div>
                <h3 className="text-sm font-serif font-black text-gray-800">Bath & Hygiene Routines</h3>
                <p className="text-[11px] text-gray-400 font-medium">Keep track of baby's hygiene intervals</p>
                
    </div>
              
    </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'bath', label: '🚿 Warm Bath Given', icon: '🛁' },
                { id: 'nails', label: '💅 Nail Clipping Done', icon: '✂️' },
                { id: 'moisturizer', label: '🧴 Skin Moisturizer Applied', icon: '🧴' },
                { id: 'hair', label: '🧼 Hair Wash & Shampoo', icon: '🧼' },
                { id: 'ears', label: '👂 Ear Cleaning', icon: '👂' },
                { id: 'teeth', label: '🪥 Teeth Brushing / Oral Care', icon: '🪥' },
                { id: 'diaper_hygiene', label: '🍑 Bottom Wipe & barrier Cream', icon: '🍑' },
                { id: 'clothes', label: '👕 Fresh Clothes Change', icon: '👕' }
              ].map(item => {
                const loggedDate = hygieneLog[item.id];
                return (
                  <div key={item.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="text-left">
                        <p className="text-xs font-black text-gray-800">{item.label}</p>
                        <p className="text-[9px] text-gray-400 font-medium">{loggedDate ? `Last: ${loggedDate}` : 'Not logged today'}</p>
                        
    </div>
                      
    </div>
                    <button
                      onClick={() => toggleHygiene(item.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${loggedDate ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Immunization Tracker */}
          <ImmunizationScheduler 
            vaccineSchedule={vaccineSchedule} 
            setVaccineSchedule={setVaccineSchedule} 
            onNavigate={onNavigate}
          />

          {/* Teething Map */}
          <div className="bg-card rounded-[40px] border border-white shadow-sm p-6 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">🦷</div>
              <div>
                <h3 className="text-sm font-serif font-black text-gray-800">Teething Map</h3>
                <p className="text-[11px] text-gray-400 font-medium">Interactive Baby Dental Emergence Map</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl space-y-6 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tap on any tooth to edit emergence</p>
              
              <div className="space-y-8">
                {/* Upper Teeth Row */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest">Upper Arch</p>
                  <div className="flex justify-center gap-1.5 flex-wrap">
                    {TEETH_LIST.filter(t => t.row === 'upper').map(t => {
                      const data = teethingMap[t.id];
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleToothClick(t.id)}
                          className={`w-10 h-11 rounded-b-2xl border-none cursor-pointer flex flex-col items-center justify-center text-[10px] font-black transition-all shadow-sm ${data?.emerged ? 'bg-primary text-white font-black' : 'bg-white text-gray-300 border border-solid border-gray-100'}`}
                          title={t.name}
                        >
                          <span>🦷</span>
                          <span className="text-[7px] leading-none uppercase mt-0.5">{t.id.split('_')[1].toUpperCase()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lower Teeth Row */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest">Lower Arch</p>
                  <div className="flex justify-center gap-1.5 flex-wrap">
                    {TEETH_LIST.filter(t => t.row === 'lower').map(t => {
                      const data = teethingMap[t.id];
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleToothClick(t.id)}
                          className={`w-10 h-11 rounded-t-2xl border-none cursor-pointer flex flex-col items-center justify-center text-[10px] font-black transition-all shadow-sm ${data?.emerged ? 'bg-primary text-white font-black' : 'bg-white text-gray-300 border border-solid border-gray-100'}`}
                          title={t.name}
                        >
                          <span className="text-[7px] leading-none uppercase mb-0.5">{t.id.split('_')[1].toUpperCase()}</span>
                          <span>🦷</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Tooth Drawer Panel */}
            <AnimatePresence>
              {selectedTooth && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-gray-50 p-5 rounded-3xl border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-black text-gray-800 uppercase tracking-widest">
                      Configure: {TEETH_LIST.find(t => t.id === selectedTooth)?.name}
                    </p>
                    <button onClick={() => setSelectedTooth(null)} className="text-xs font-bold text-gray-400 bg-none border-none cursor-pointer">Close</button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Has Emerged / Erupted?</span>
                    <button
                      onClick={() => setSelectedToothEmerged(!selectedToothEmerged)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer border-none transition-all ${selectedToothEmerged ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}
                    >
                      {selectedToothEmerged ? 'Emerged' : 'Not yet'}
                    </button>
                  </div>

                  {selectedToothEmerged && (
                    <div>
                      <label className="text-[8px] font-bold text-gray-400 block mb-1 uppercase">Emergence Date</label>
                      <input
                        type="date"
                        value={selectedToothDate}
                        onChange={e => setSelectedToothDate(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-800 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[8px] font-bold text-gray-400 block uppercase">Symptoms Tracked</label>
                    <div className="flex flex-wrap gap-1.5 font-bold">
                      {['Drooling', 'Mild Fever', 'Fussiness', 'Biting'].map(sym => (
                        <button
                          key={sym}
                          onClick={() => setSelectedToothSymptoms(prev => prev.includes(sym) ? prev.filter(x => x !== sym) : [...prev, sym])}
                          className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border-none cursor-pointer ${selectedToothSymptoms.includes(sym) ? 'bg-primary/20 text-primary' : 'bg-white text-gray-400 border border-solid border-gray-100'}`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-bold text-gray-400 block uppercase">Remedies Applied</label>
                    <div className="flex flex-wrap gap-1.5 font-bold">
                      {['Cold Teether', 'Gum Massage', 'Pain Reliever', 'None'].map(rem => (
                        <button
                          key={rem}
                          onClick={() => setSelectedToothRemedies(prev => prev.includes(rem) ? prev.filter(x => x !== rem) : [...prev, rem])}
                          className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border-none cursor-pointer ${selectedToothRemedies.includes(rem) ? 'bg-primary/20 text-primary' : 'bg-white text-gray-400 border border-solid border-gray-100'}`}
                        >
                          {rem}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={saveToothStatus}
                    className="w-full bg-primary text-white py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer border-none hover:bg-primary/95 transition-all"
                  >
                    Save Tooth Emergence Data
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
    </div>

          {/* Daily Scheduled Activities */}
          <div className="space-y-4 text-left">
            <h2 className="text-xl font-serif font-black text-gray-800 px-2">Daily Scheduled Activities</h2>
            <div className="space-y-4">
              {todayActivities.length > 0 ? todayActivities.map((scheduled: any) => {
                const isCompleted = scheduled.completed;
                return (
                  <div key={scheduled.id} className="bg-card p-6 rounded-[32px] border border-white shadow-sm space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm">
                          🧸
                          
    </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{scheduled.title}</p>
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest">{scheduled.time} • {scheduled.duration}</p>
                          
    </div>
                        
    </div>
                      <button 
                        onClick={() => {
                          const updated = scheduledActivities.map(a => a.id === scheduled.id ? { ...a, completed: !a.completed } : a);
                          setScheduledActivities(updated);
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all border-none cursor-pointer ${isCompleted ? 'bg-primary shadow-md shadow-primary/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      
    </div>

                    {/* Energy, Concentration, Attention toggles */}
                    <div className="bg-white/60 p-4 rounded-2xl space-y-3 border border-white/50">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-gray-500">⚡ Energy</span>
                          <span className="font-black text-primary uppercase">{scheduled.energy || 'Low'}</span>
                          
    </div>
                        <div className="flex gap-2">
                          {['Low', 'Medium', 'High'].map(level => (
                            <button
                              key={level}
                              onClick={() => {
                                const updated = scheduledActivities.map(a => a.id === scheduled.id ? { ...a, energy: level } : a);
                                setScheduledActivities(updated);
                              }}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border-none cursor-pointer ${scheduled.energy === level ? 'bg-primary text-white shadow-sm font-bold' : 'bg-white text-gray-400 border border-gray-100/50'}`}
                            >
                              {level === 'Low' ? '🔋 Low' : level === 'Medium' ? '⚡ Med' : '🔥 High'}
                            </button>
                          ))}
                          
    </div>
                        
    </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-gray-500">🧠 Concentration</span>
                          <span className="font-black text-primary uppercase">{scheduled.concentration || 'Medium'}</span>
                          
    </div>
                        <div className="flex gap-2">
                          {['Low', 'Medium', 'High'].map(level => (
                            <button
                              key={level}
                              onClick={() => {
                                const updated = scheduledActivities.map(a => a.id === scheduled.id ? { ...a, concentration: level } : a);
                                setScheduledActivities(updated);
                              }}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border-none cursor-pointer ${scheduled.concentration === level ? 'bg-primary text-white shadow-sm font-bold' : 'bg-white text-gray-400 border border-gray-100/50'}`}
                            >
                              {level === 'Low' ? '☁️ Low' : level === 'Medium' ? '🧩 Med' : '🧠 High'}
                            </button>
                          ))}
                          
    </div>
                        
    </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-gray-500">🎯 Attention</span>
                          <span className="font-black text-primary uppercase">{scheduled.attention || 'Medium'}</span>
                          
    </div>
                        <div className="flex gap-2">
                          {['Low', 'Medium', 'High'].map(level => (
                            <button
                              key={level}
                              onClick={() => {
                                const updated = scheduledActivities.map(a => a.id === scheduled.id ? { ...a, attention: level } : a);
                                setScheduledActivities(updated);
                              }}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border-none cursor-pointer ${scheduled.attention === level ? 'bg-primary text-white shadow-sm font-bold' : 'bg-white text-gray-400 border border-gray-100/50'}`}
                            >
                              {level === 'Low' ? '🪁 Low' : level === 'Medium' ? '🔍 Med' : '🎯 High'}
                            </button>
                          ))}
                          
    </div>
                        
    </div>
                      
    </div>
                    
    </div>
                );
              }) : (
                <p className="text-xs text-gray-500 italic px-2">No planned activities for today.</p>
              )}
              
    </div>
            
    </div>
        </motion.div>
      )}
      
    </div>
  );
};


