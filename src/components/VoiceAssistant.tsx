import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Loader2, Sparkles, Send, X, Utensils, Moon, 
  CheckCircle2, Volume2, VolumeX, Crown, AlertCircle, Camera, 
  Image as ImageIcon, Globe, ExternalLink, RefreshCw, Zap, 
  ChevronRight, Compass, Heart, Paperclip, FileText, Video
} from 'lucide-react';
import { OgooAvatar } from './OgooAvatar';

interface VoiceAssistantProps {
  babyName?: string;
  babyAge?: string;
  stage?: string;
  lastFeedStr?: string;
  lastSleepStr?: string;
  lastDiaperStr?: string;
  isPremium?: boolean;
  onOpenSubscriptionModal?: () => void;
  onLogMeal: (meal: any) => void;
  onStartTimer: (side: 'left' | 'right') => void;
  onAddNote: (note: string) => void;
  onLogSleep?: (durationMinutes: number) => void;
  onLogDiaper?: (type: string) => void;
  loggedMeals?: any[];
  observationLogs?: any[];
  loggedMoods?: any[];
  diaperLogs?: any[];
  vaccineSchedule?: any[];
  memories?: any[];
}

interface ReferenceItem {
  title: string;
  uri: string;
  domain: string;
}

export interface AttachedMedia {
  data: string; // base64
  mimeType: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  previewUrl?: string;
  sizeStr?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionTaken?: string;
  isPaywall?: boolean;
  timestamp: string;
  imageUrl?: string;
  attachment?: AttachedMedia;
  researchedWithSearch?: boolean;
  references?: ReferenceItem[];
  searchQueries?: string[];
  proactiveInsight?: string;
}

interface ProactiveCard {
  id: string;
  type: 'feeding' | 'sleep' | 'recipe' | 'diaper';
  title: string;
  description: string;
  actionLabel: string;
  actionPayload: any;
  badge: string;
}

const FREE_AI_QUERY_LIMIT = 5;

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  babyName = 'Leo',
  babyAge = '6 Months',
  stage = 'Purees & Finger Foods',
  lastFeedStr = 'No feed logged today',
  lastSleepStr = 'No sleep logged today',
  lastDiaperStr = 'No diaper logged today',
  isPremium = false,
  onOpenSubscriptionModal,
  onLogMeal,
  onStartTimer,
  onAddNote,
  onLogSleep,
  onLogDiaper,
  loggedMeals = [],
  observationLogs = [],
  loggedMoods = [],
  diaperLogs = [],
  vaccineSchedule = [],
  memories = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [talkBackEnabled, setTalkBackEnabled] = useState(true);
  const [backgroundWakeEnabled, setBackgroundWakeEnabled] = useState(true);
  const [isWakeListening, setIsWakeListening] = useState(false);
  const [researchMode, setResearchMode] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<AttachedMedia | null>(null);
  // Legacy alias for compatibility
  const selectedImage = selectedAttachment ? { data: selectedAttachment.data, mimeType: selectedAttachment.mimeType, preview: selectedAttachment.previewUrl || '' } : null;
  const setSelectedImage = (val: any) => setSelectedAttachment(val ? { data: val.data, mimeType: val.mimeType, name: 'photo.jpg', type: 'image', previewUrl: val.preview || val.data } : null);

  const [showProactivePanel, setShowProactivePanel] = useState(true);
  const [proactiveInsights, setProactiveInsights] = useState<ProactiveCard[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const wakeWordRecRef = useRef<any>(null);
  const isStoppingWakeRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Free trial AI queries state
  const [aiQueryCount, setAiQueryCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('ama_ai_query_count') || '0', 10);
  });
  
  const remainingQueries = isPremium ? Infinity : Math.max(0, FREE_AI_QUERY_LIMIT - aiQueryCount);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hi! I am Ogoo, your proactive infant care assistant. I constantly learn from ${babyName}'s routine.\n\nYou can speak or type to me, attach files, videos, or photos (diaper stool, skin rash, puree texture, medicine), or ask for evidence-based parenting guidance!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load Proactive Insights on open
  useEffect(() => {
    if (isOpen) {
      loadProactiveInsights();
    }
  }, [isOpen, babyName, babyAge, stage, lastFeedStr, lastSleepStr]);

  const loadProactiveInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const res = await fetch('/api/ai/ogoo-proactive-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          babyName,
          babyAge,
          stage,
          lastFeedStr,
          lastSleepStr,
          lastDiaperStr,
          loggedMeals,
          diaperLogs,
          vaccineSchedule
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.insights && Array.isArray(data.insights)) {
          setProactiveInsights(data.insights);
        }
      }
    } catch (e) {
      console.error('Failed to load proactive insights:', e);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Helper to retrieve Nigerian female voice profile (en-NG)
  const getNigerianFemaleVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Check for Nigerian English voices (en-NG, en_NG, pcm-NG)
    const ngVoices = voices.filter(v => {
      const lang = (v.lang || '').toLowerCase().replace(/_/g, '-');
      return lang === 'en-ng' || lang.startsWith('en-ng') || lang.startsWith('pcm');
    });

    // Match Nigerian female voices by name/gender tags
    const ngFemale = ngVoices.find(v => {
      const name = v.name.toLowerCase();
      return (
        name.includes('female') ||
        name.includes('woman') ||
        name.includes('girl') ||
        name.includes('ebere') ||
        name.includes('ngozi') ||
        name.includes('chioma') ||
        name.includes('amina') ||
        name.includes('zainab') ||
        name.includes('blessing') ||
        name.includes('folashade') ||
        name.includes('ada') ||
        name.includes('natural') ||
        name.includes('online')
      );
    });

    if (ngFemale) return ngFemale;
    if (ngVoices.length > 0) return ngVoices[0];

    // 2. Check for African regional English female voices (en-GH, en-ZA, en-KE)
    const africanFemale = voices.find(v => {
      const lang = (v.lang || '').toLowerCase().replace(/_/g, '-');
      const name = v.name.toLowerCase();
      const isAfrican = lang.includes('en-gh') || lang.includes('en-za') || lang.includes('en-ke') || lang.includes('en-ng');
      const isFemale = name.includes('female') || name.includes('woman') || name.includes('ayanda') || name.includes('leah');
      return isAfrican && isFemale;
    });
    if (africanFemale) return africanFemale;

    // 3. Fallback to gentle, warm female voice
    const femaleEn = voices.find(v => {
      const lang = (v.lang || '').toLowerCase();
      const name = v.name.toLowerCase();
      return lang.startsWith('en') && (name.includes('female') || name.includes('samantha') || name.includes('victoria') || name.includes('karen') || name.includes('moira') || name.includes('google') || name.includes('natural'));
    });

    return femaleEn || null;
  };

  // HTML5 Text to Speech helper (Configured with Nigerian female voice profile en-NG)
  const speakText = (textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        // Replace Ogoo with Augur for accurate phonetic pronunciation by speech engines
        const phoneticText = textToSpeak
          .replace(/\bOgoo\b/gi, 'Augur')
          .replace(/\bOgoo's\b/gi, "Augur's");

        // Clean markdown, urls, em-dashes, and emojis so speech synthesizer sounds natural
        const cleanText = phoneticText
          .replace(/https?:\/\/\S+/gi, '')
          .replace(/\*\*?/g, '')
          .replace(/—|–/g, ' ')
          .replace(/[\#\-\*\_]/g, '')
          .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
          .trim();

        if (cleanText) {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          // Set Nigerian English locale
          utterance.lang = 'en-NG';
          
          const nigerianVoice = getNigerianFemaleVoice();
          if (nigerianVoice) {
            utterance.voice = nigerianVoice;
          }

          // Warm, steady, rhythmic Nigerian female care cadence
          utterance.rate = 0.98;
          utterance.pitch = 1.08; // Friendly, warm, melodious female tone
          utterance.volume = 1.0;

          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.error('Text to speech failed:', err);
      }
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isProcessing]);

  // Initial Speech Recognition setup for Assistant Dialog
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-NG';

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback('Listening closely (en-NG)... say your question or command.');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setFeedback('');
        handleSendUserMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setFeedback('Could not catch that clearly. Please try again or type.');
        setTimeout(() => setFeedback(''), 3500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [babyName, babyAge, stage, lastFeedStr, lastSleepStr, lastDiaperStr, aiQueryCount, isPremium, selectedImage, researchMode]);

  // Wake-word recognition setup (Always-on 'Hey Ogoo' listener)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition || !backgroundWakeEnabled) {
      if (wakeWordRecRef.current) {
        isStoppingWakeRef.current = true;
        try {
          wakeWordRecRef.current.abort();
        } catch (e) {}
        wakeWordRecRef.current = null;
        setIsWakeListening(false);
      }
      return;
    }

    let isUnmounted = false;
    isStoppingWakeRef.current = false;

    const startWakeWordListener = () => {
      if (isUnmounted || isStoppingWakeRef.current) return;
      try {
        const wakeRec = new SpeechRecognition();
        wakeRec.continuous = true;
        wakeRec.interimResults = true;
        wakeRec.lang = 'en-NG';

        wakeRec.onstart = () => {
          if (!isUnmounted) setIsWakeListening(true);
        };

        wakeRec.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript.toLowerCase();
            if (
              transcript.includes('hey ogoo') ||
              transcript.includes('hey augur') ||
              transcript.includes('hey auger') ||
              transcript.includes('hi ogoo') ||
              transcript.includes('hi augur') ||
              transcript.includes('ok ogoo') ||
              transcript.includes('ok augur') ||
              transcript.includes('ogoo') ||
              transcript.includes('hey ama') ||
              transcript.includes('hi ama') ||
              transcript.includes('ok ama')
            ) {
              setIsOpen(true);
              speakText(`I am right here! How can I help with ${babyName}?`);
              const match = transcript.match(/(?:hey|hi|ok)\s+(?:ogoo|augur|auger|ama|emma)\s*(.*)/i);
              if (match && match[1] && match[1].trim().length > 3) {
                const command = match[1].trim();
                setTimeout(() => {
                  handleSendUserMessage(command);
                }, 500);
              }
              break;
            }
          }
        };

        wakeRec.onerror = (e: any) => {
          if (e.error === 'not-allowed') {
            setIsWakeListening(false);
            setBackgroundWakeEnabled(false);
          }
        };

        wakeRec.onend = () => {
          if (!isUnmounted && !isStoppingWakeRef.current && backgroundWakeEnabled) {
            setTimeout(() => {
              if (!isUnmounted && !isStoppingWakeRef.current && backgroundWakeEnabled) {
                try {
                  wakeRec.start();
                } catch (e) {}
              }
            }, 1000);
          } else {
            setIsWakeListening(false);
          }
        };

        wakeRec.start();
        wakeWordRecRef.current = wakeRec;
      } catch (err) {
        console.error('Failed to start wake listener:', err);
      }
    };

    startWakeWordListener();

    return () => {
      isUnmounted = true;
      isStoppingWakeRef.current = true;
      if (wakeWordRecRef.current) {
        try {
          wakeWordRecRef.current.abort();
        } catch (e) {}
        wakeWordRecRef.current = null;
      }
    };
  }, [backgroundWakeEnabled, babyName]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
        }
      } else {
        setFeedback('Voice recognition is not supported in this browser. You can type below!');
        setTimeout(() => setFeedback(''), 4000);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 25MB for videos and documents)
    if (file.size > 25 * 1024 * 1024) {
      setFeedback('File is larger than 25MB. Please select a smaller file or video.');
      setTimeout(() => setFeedback(''), 4000);
      return;
    }

    const mime = file.type || 'application/octet-stream';
    let fileCategory: 'image' | 'video' | 'audio' | 'document' | 'other' = 'document';
    if (mime.startsWith('image/')) fileCategory = 'image';
    else if (mime.startsWith('video/')) fileCategory = 'video';
    else if (mime.startsWith('audio/')) fileCategory = 'audio';

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedAttachment({
        data: result,
        mimeType: mime,
        name: file.name,
        type: fileCategory,
        previewUrl: fileCategory === 'image' || fileCategory === 'video' ? result : undefined,
        sizeStr: (file.size / (1024 * 1024)).toFixed(1) + 'MB'
      });
      setFeedback(`Attached ${fileCategory.toUpperCase()}: "${file.name}". Ask Ogoo to analyze it!`);
      setTimeout(() => setFeedback(''), 4000);
    };
    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeTriggeredAction = (action: any): string => {
    if (!action || !action.type) return '';

    if (action.type === 'log_meal') {
      onLogMeal({
        amount: action.amount || 4,
        unit: action.unit || 'oz',
        type: action.mealType || 'bottle',
        notes: action.notes || 'Logged via Ogoo AI'
      });
      return `Saved! Logged ${action.amount || 4} ${action.unit || 'oz'} ${action.mealType || 'feeding'}.`;
    }

    if (action.type === 'start_timer') {
      onStartTimer(action.side || 'left');
      return `Started ${action.side || 'left'} breast nursing timer.`;
    }

    if (action.type === 'log_sleep' && onLogSleep) {
      onLogSleep(action.durationMinutes || 60);
      return `Saved! Recorded ${action.durationMinutes || 60} minute nap.`;
    }

    if (action.type === 'log_diaper' && onLogDiaper) {
      onLogDiaper(action.diaperType || 'wet');
      return `Saved! Recorded ${action.diaperType || 'clean'} diaper change.`;
    }

    if (action.type === 'add_note') {
      onAddNote(action.note || 'Note via Ogoo');
      return `Saved note to ${babyName}'s journal.`;
    }

    return '';
  };

  const handleProactiveCardClick = (card: ProactiveCard) => {
    if (card.actionPayload) {
      if (card.actionPayload.query) {
        handleSendUserMessage(card.actionPayload.query);
      } else {
        const actionResult = executeTriggeredAction(card.actionPayload);
        const confirmationMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: `I've proactively taken care of that for you: ${card.title}.\n${actionResult || 'Action completed successfully.'}`,
          actionTaken: actionResult,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, confirmationMsg]);
        if (talkBackEnabled) {
          speakText(`I have logged that for ${babyName}.`);
        }
      }
    }
  };

  const handleSendUserMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    const attachmentPayload = selectedAttachment;

    if ((!text && !attachmentPayload) || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text || (attachmentPayload ? `Please analyze this attached ${attachmentPayload.type} (${attachmentPayload.name}) for me.` : ''),
      imageUrl: attachmentPayload?.previewUrl,
      attachment: attachmentPayload || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedAttachment(null);

    // Check direct manual logging intent
    const lower = (text || '').toLowerCase();
    const isDirectLoggingIntent =
      lower.includes("log ") ||
      lower.includes("save ") ||
      lower.includes("record ") ||
      lower.includes("start ") ||
      lower.includes("timer") ||
      lower.includes("changed diaper") ||
      lower.includes("poop") ||
      lower.includes("pee") ||
      lower.includes("nap");

    // Check Free Trial Query Limit
    if (!isPremium && !isDirectLoggingIntent && aiQueryCount >= FREE_AI_QUERY_LIMIT) {
      const paywallMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: `🔒 Free Trial AI Limit Reached (${FREE_AI_QUERY_LIMIT}/${FREE_AI_QUERY_LIMIT} queries used).\n\nUpgrade to Ama Premium to unlock unlimited Ogoo AI multimodal image analysis, Google Search child health research grounding, and continuous voice recognition.`,
        isPaywall: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, paywallMsg]);
      if (talkBackEnabled) {
        speakText("Free trial query limit reached. Please upgrade to Ama Premium for unlimited AI queries.");
      }
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/ai/genai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          image: attachmentPayload ? { 
            data: attachmentPayload.data, 
            mimeType: attachmentPayload.mimeType, 
            name: attachmentPayload.name,
            type: attachmentPayload.type 
          } : null,
          enableResearch: researchMode,
          babyName,
          babyAge,
          weaningStage: stage,
          lastFeedStr,
          lastSleepStr,
          lastDiaperStr,
          loggedMeals,
          observationLogs,
          loggedMoods,
          diaperLogs,
          vaccineSchedule,
          memories
        })
      });

      if (!response.ok) throw new Error('API server error');
      const data = await response.json();

      let actionNote: string | undefined = undefined;
      if (data.actionToTrigger) {
        const actionResult = executeTriggeredAction(data.actionToTrigger);
        if (actionResult) actionNote = actionResult;
      }

      // Increment AI query count if not premium
      if (!isPremium && !isDirectLoggingIntent) {
        const newCount = aiQueryCount + 1;
        setAiQueryCount(newCount);
        localStorage.setItem('ama_ai_query_count', newCount.toString());
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: data.replyText || `Got it! I saved that for ${babyName}.`,
        actionTaken: actionNote,
        researchedWithSearch: data.researchedWithSearch,
        references: data.references || [],
        searchQueries: data.searchQueries || [],
        proactiveInsight: data.proactiveInsight,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (talkBackEnabled && data.replyText) {
        speakText(data.replyText);
      }
    } catch (err) {
      console.error(err);
      let fallbackReply = `I'm here to support you with ${babyName}! You can ask me about meals, sleep routines, diaper changes, or tell me to log a feed!`;
      let actionNote: string | undefined = undefined;

      if (lower.includes('feed') || lower.includes('milk') || lower.includes('bottle')) {
        onLogMeal({ amount: 4, unit: 'oz', type: 'bottle' });
        fallbackReply = `Logged a 4 oz bottle feeding for ${babyName}.`;
        actionNote = `Saved! Logged a 4 oz bottle feed.`;
      } else if (lower.includes('sleep') || lower.includes('nap')) {
        if (onLogSleep) onLogSleep(60);
        fallbackReply = `Logged nap time for ${babyName}. Sweet dreams!`;
        actionNote = `Saved! Logged a 1-hour nap.`;
      } else if (lower.includes('diaper') || lower.includes('nappy')) {
        if (onLogDiaper) onLogDiaper(lower.includes('poop') ? 'dirty' : 'wet');
        fallbackReply = `Logged clean diaper change for ${babyName}.`;
        actionNote = `Saved! Clean diaper logged.`;
      } else if (lower.includes('timer')) {
        onStartTimer(lower.includes('right') ? 'right' : 'left');
        fallbackReply = `Started nursing timer for ${babyName}.`;
        actionNote = `Timer started.`;
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: fallbackReply,
        actionTaken: actionNote,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (talkBackEnabled) {
        speakText(fallbackReply);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating Activation Button on Mobile / Desktop */}
      <motion.button
        id="voice-assistant-floating-btn"
        onClick={() => {
          setIsOpen(true);
          if (talkBackEnabled) {
            speakText(`Hi! How can I help with ${babyName} today?`);
          }
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40 bg-gradient-to-tr from-primary to-primary-light text-white p-2.5 sm:p-3 rounded-full shadow-2xl flex items-center gap-2.5 border-2 border-white/80 backdrop-blur-md cursor-pointer group hover:shadow-primary/30"
        title="Open Ogoo AI Agent (Multimodal & Research)"
      >
        <OgooAvatar 
          size="sm" 
          hasPulse={isWakeListening} 
          showSparkleBadge={true} 
          showOnlineDot={true}
        />
        <div className="text-left hidden sm:block pr-2">
          <p className="text-[11px] font-black uppercase tracking-wider leading-none text-white flex items-center gap-1">
            Ask Ogoo
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
          </p>
          <p className="text-[9px] text-sky-100 font-medium leading-tight">Proactive AI Agent</p>
        </div>
      </motion.button>

      {/* Main Multimodal & Proactive Assistant Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="voice-assistant-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              id="voice-assistant-card"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="bg-white rounded-[32px] sm:rounded-[36px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[88vh] max-h-[680px] border border-primary/20"
            >
              {/* Header with Ogoo Custom Avatar & Status */}
              <div className="bg-primary text-white p-3.5 sm:p-4 flex items-center justify-between shadow-md relative">
                <div className="flex items-center gap-3">
                  <OgooAvatar 
                    size="md" 
                    isThinking={isProcessing} 
                    showOnlineDot={true} 
                    onClick={() => {
                      const lastAssistantMsg = [...messages].reverse().find(m => m.sender === 'assistant');
                      if (lastAssistantMsg) {
                        speakText(lastAssistantMsg.text);
                      }
                    }}
                  />
                  <div>
                    <h3 className="font-serif font-black text-base sm:text-lg flex items-center gap-2 text-white">
                      Ogoo
                      {isPremium ? (
                        <span className="bg-white/20 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5 text-white" /> PRO
                        </span>
                      ) : (
                        <span className="bg-white/20 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                          {remainingQueries > 0 ? `${remainingQueries} Free Qs` : 'Limit Reached'}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-sky-100 font-medium flex items-center gap-1.5">
                      <span>Caring for <strong>{babyName}</strong> ({babyAge})</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Talk-Back Voice Guidance Toggle */}
                  <button
                    onClick={() => {
                      const nextState = !talkBackEnabled;
                      setTalkBackEnabled(nextState);
                      if (!nextState) {
                        if ('speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                        }
                      } else {
                        speakText("Voice guide turned on!");
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer border-none"
                    title={talkBackEnabled ? 'Mute Assistant Voice' : 'Unmute Assistant Voice'}
                  >
                    {talkBackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-white/60" />}
                  </button>

                  {/* Wake Word Toggle */}
                  <button
                    onClick={() => {
                      const nextState = !backgroundWakeEnabled;
                      setBackgroundWakeEnabled(nextState);
                      if (nextState) {
                        speakText("Voice activation turned on! You can say Hey Ogoo anytime.");
                        setFeedback("Voice activation active! Say 'Hey Ogoo'.");
                        setTimeout(() => setFeedback(''), 4000);
                      } else {
                        speakText("Voice activation turned off.");
                      }
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none ${
                      backgroundWakeEnabled ? 'bg-white text-primary' : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                    title={backgroundWakeEnabled ? "Disable 'Hey Ogoo' Wake Word" : "Enable 'Hey Ogoo' Wake Word"}
                  >
                    <Mic className={`w-4 h-4 ${backgroundWakeEnabled ? 'animate-pulse' : ''}`} />
                  </button>

                  {/* Close Dialog */}
                  <button
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                      }
                      setIsOpen(false);
                    }}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer border-none"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Context Summary & Proactive Insights Banner */}
              <div className="bg-sky-50/70 border-b border-primary/10 px-3.5 py-2 flex items-center justify-between text-[11px] text-gray-700">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                  <span className="shrink-0 flex items-center gap-1 font-medium">
                    <Utensils className="w-3 h-3 text-primary" />
                    Feed: <strong className="text-gray-900">{lastFeedStr}</strong>
                  </span>
                  <span className="shrink-0 flex items-center gap-1 font-medium">
                    <Moon className="w-3 h-3 text-primary" />
                    Sleep: <strong className="text-gray-900">{lastSleepStr}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setShowProactivePanel(prev => !prev)}
                  className="shrink-0 text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent ml-2"
                >
                  <Zap className="w-3 h-3" />
                  {showProactivePanel ? 'Hide Insights' : 'Show Insights'}
                </button>
              </div>

              {/* Proactive Context-Aware Action Cards Carousel */}
              <AnimatePresence>
                {showProactivePanel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gradient-to-r from-sky-50 to-blue-50/50 border-b border-primary/15 p-2.5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary" />
                        Proactive Care Recommendations
                      </span>
                      <button
                        onClick={loadProactiveInsights}
                        disabled={isLoadingInsights}
                        className="text-[10px] text-primary hover:text-primary-dark font-semibold flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${isLoadingInsights ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                      {proactiveInsights.map((card) => (
                        <div
                          key={card.id}
                          className="shrink-0 w-56 bg-white rounded-2xl p-2.5 border border-primary/20 shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded-md uppercase">
                                {card.badge}
                              </span>
                            </div>
                            <p className="font-bold text-xs text-gray-900 leading-tight mb-1">{card.title}</p>
                            <p className="text-[10px] text-gray-600 line-clamp-2 leading-relaxed">{card.description}</p>
                          </div>
                          <button
                            onClick={() => handleProactiveCardClick(card)}
                            className="mt-2 w-full py-1 px-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border-none shadow-2xs"
                          >
                            <span>{card.actionLabel}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#D2E9F9]/30">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'assistant' && (
                      <OgooAvatar 
                        size="sm" 
                        className="mt-1 shrink-0" 
                        onClick={() => speakText(msg.text)}
                        alt="Tap Ogoo to speak this message"
                      />
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-br-xs'
                          : msg.isPaywall
                          ? 'bg-primary/5 text-gray-800 border border-primary/20 rounded-bl-xs'
                          : 'bg-white text-gray-800 border border-primary/10 rounded-bl-xs'
                      }`}
                    >
                      {/* Attached Media/File/Video Preview if User uploaded */}
                      {msg.attachment ? (
                        <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 bg-black/10">
                          {msg.attachment.type === 'image' && (
                            <img
                              src={msg.attachment.previewUrl || msg.imageUrl}
                              alt="Uploaded photo"
                              className="w-full h-auto object-cover max-h-48"
                            />
                          )}
                          {msg.attachment.type === 'video' && (
                            <video
                              src={msg.attachment.previewUrl}
                              controls
                              className="w-full h-auto max-h-48 rounded-xl bg-black"
                            />
                          )}
                          {(msg.attachment.type === 'document' || msg.attachment.type === 'audio' || msg.attachment.type === 'other') && (
                            <div className="p-3 bg-white/20 backdrop-blur-xs flex items-center gap-2 text-xs font-bold text-gray-800">
                              {msg.attachment.type === 'audio' ? <Volume2 className="w-4 h-4 shrink-0" /> : <FileText className="w-4 h-4 shrink-0 text-primary" />}
                              <span className="truncate flex-1">{msg.attachment.name}</span>
                              <span className="text-[10px] opacity-80">{msg.attachment.sizeStr}</span>
                            </div>
                          )}
                        </div>
                      ) : msg.imageUrl ? (
                        <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 max-h-48 bg-black/5">
                          <img
                            src={msg.imageUrl}
                            alt="Uploaded attachment"
                            className="w-full h-auto object-cover max-h-48"
                          />
                        </div>
                      ) : null}

                      {/* Message Text */}
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                      {/* Speak Message Button for Assistant Messages */}
                      {msg.sender === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => speakText(msg.text)}
                          className="mt-2 text-[10px] font-bold text-primary hover:text-primary-dark flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-full transition-colors cursor-pointer border-none w-fit"
                          title="Tap Ogoo to speak this message aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>Tap Ogoo to speak</span>
                        </button>
                      )}
                      
                      {/* Action Taken Badge */}
                      {msg.actionTaken && (
                        <div className="mt-2.5 pt-2 border-t border-primary/20 text-primary font-semibold text-[11px] flex items-center gap-1.5 bg-primary/10 px-2.5 py-1.5 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          <span>{msg.actionTaken}</span>
                        </div>
                      )}

                      {/* Google Search Research Grounding Citations */}
                      {msg.references && msg.references.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100 bg-sky-50/60 -mx-1 px-2.5 py-2 rounded-xl">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary mb-1.5">
                            <Globe className="w-3 h-3 text-primary" />
                            <span>Verified References:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.references.map((ref, i) => (
                              <a
                                key={i}
                                href={ref.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-sky-100/70 border border-primary/20 rounded-lg text-[10px] text-gray-700 font-medium transition-colors no-underline shadow-2xs group"
                                title={ref.uri}
                              >
                                <span className="font-bold text-primary">{ref.domain}</span>
                                <span className="text-gray-500 truncate max-w-[120px]">{ref.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-gray-400 group-hover:text-primary" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Proactive follow-up badge */}
                      {msg.proactiveInsight && (
                        <div className="mt-2 text-[10px] text-gray-600 bg-amber-50 border border-amber-200/60 p-2 rounded-xl flex items-start gap-1.5">
                          <Sparkles className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                          <span><strong>Ogoo Tip:</strong> {msg.proactiveInsight}</span>
                        </div>
                      )}

                      {msg.isPaywall && onOpenSubscriptionModal && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onOpenSubscriptionModal();
                          }}
                          className="mt-3 w-full py-2 px-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-xs"
                        >
                          <Crown className="w-3.5 h-3.5 text-white" />
                          <span>Upgrade to Ama Premium</span>
                        </button>
                      )}

                      <span
                        className={`text-[9px] mt-1.5 block text-right font-mono ${
                          msg.sender === 'user' ? 'text-white/80' : 'text-gray-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex items-start gap-2.5 justify-start">
                    <OgooAvatar size="sm" isThinking={true} />
                    <div className="bg-white border border-primary/20 rounded-2xl p-3.5 shadow-xs flex items-center gap-2.5 text-xs text-gray-700 font-medium">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      Ogoo is analyzing and formulating personalized care advice...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-white/90 border-t border-primary/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {[
                  `🥣 Safe foods for ${babyAge}`,
                  `🍼 Log a 4 oz feeding`,
                  `💤 Start 60m nap timer`,
                  `🌡️ Fever first aid guide`,
                  `🥑 Stage recipe idea`
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (talkBackEnabled) {
                        speakText(`Asking: ${chip}`);
                      }
                      handleSendUserMessage(chip);
                    }}
                    className="shrink-0 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Selected File / Video / Photo Attachment Preview */}
              {selectedAttachment && (
                <div className="px-4 py-2 bg-primary/5 border-t border-primary/15 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {selectedAttachment.type === 'image' && selectedAttachment.previewUrl && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-primary/30 shrink-0">
                        <img src={selectedAttachment.previewUrl} alt="Attachment" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {selectedAttachment.type === 'video' && (
                      <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold">
                        <Video className="w-5 h-5" />
                      </div>
                    )}
                    {(selectedAttachment.type === 'document' || selectedAttachment.type === 'audio' || selectedAttachment.type === 'other') && (
                      <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="truncate">
                      <p className="text-xs text-gray-800 font-bold truncate">{selectedAttachment.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{selectedAttachment.sizeStr || 'Attachment'} • Ready for Ogoo analysis</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAttachment(null)}
                    className="p-1 rounded-full hover:bg-primary/20 text-gray-500 cursor-pointer border-none bg-transparent shrink-0"
                    title="Remove Attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Feedback Toast */}
              {feedback && (
                <div className="bg-primary/10 border-t border-primary/20 px-4 py-1.5 text-xs text-primary font-bold text-center animate-pulse">
                  {feedback}
                </div>
              )}

              {/* Hidden File Input for Multimodal File, Video, & Photo Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,audio/*,application/pdf,text/*,.doc,.docx,.csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Disclaimer */}
              <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100 text-[9px] text-gray-500 text-center leading-tight">
                ⚠️ <strong>Disclaimer:</strong> Ogoo is an AI assistant and provides suggestions for informational purposes only. AI can make mistakes and does not diagnose any medical condition. For health concerns, always consult a certified medical doctor.
              </div>

              {/* Input Area with Multimodal Upload, Voice, & Send */}
              <div className="p-3 bg-white border-t border-primary/10 flex items-center gap-2">
                {/* File / Media Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-all cursor-pointer border-none shrink-0"
                  title="Attach Photo, Video, or Document (Stool photo, skin rash, video of cry/cough, growth chart)"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Voice Mic Toggle */}
                <button
                  id="voice-assistant-mic-toggle-btn"
                  onClick={toggleListening}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer border-none shrink-0 ${
                    isListening
                      ? 'bg-primary text-white animate-pulse shadow-lg shadow-primary/20'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Speak to Ogoo'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Text Input */}
                <input
                  id="voice-assistant-text-input"
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendUserMessage();
                  }}
                  placeholder={selectedImage ? "Ask Ogoo about this photo..." : `Ask Ogoo anything about ${babyName}...`}
                  className="flex-1 bg-gray-50 border border-primary/20 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-primary font-medium"
                />

                {/* Send Button */}
                <button
                  id="voice-assistant-send-btn"
                  onClick={() => handleSendUserMessage()}
                  disabled={(!inputText.trim() && !selectedImage) || isProcessing}
                  className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none shrink-0 shadow-md shadow-primary/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
