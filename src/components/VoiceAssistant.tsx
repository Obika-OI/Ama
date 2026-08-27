import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Loader2, Sparkles, Send, X, Baby, Utensils, Moon, CheckCircle2, Volume2, VolumeX, Crown, Lock } from 'lucide-react';

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

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionTaken?: string;
  isPaywall?: boolean;
  timestamp: string;
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
  const wakeWordRecRef = useRef<any>(null);
  const isStoppingWakeRef = useRef(false);

  // Free trial AI queries state
  const [aiQueryCount, setAiQueryCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('ama_ai_query_count') || '0', 10);
  });
  
  const remainingQueries = isPremium ? Infinity : Math.max(0, FREE_AI_QUERY_LIMIT - aiQueryCount);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hi! I am Ogoo, your baby care assistant. I can listen in the background for "Hey Ogoo" to instantly help! How is sweet ${babyName} doing today? Ask me about simple recipes, sleep times, or just tell me to save a feeding, nap, or diaper change!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // HTML5 Text to Speech helper (with phonetic pronunciation for Ogoo as "Augur")
  const speakText = (textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        // Replace Ogoo with Augur for accurate phonetic pronunciation by speech engines
        const phoneticText = textToSpeak
          .replace(/\bOgoo\b/gi, 'Augur')
          .replace(/\bOgoo's\b/gi, "Augur's");

        // Clean markdown, em-dashes, and emojis so they aren't spoken weirdly
        const cleanText = phoneticText
          .replace(/\*\*?/g, '')
          .replace(/—|–/g, ' ')
          .replace(/[\#\-\*\_]/g, '')
          .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
          .trim();

        if (cleanText) {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'en-US';
          utterance.rate = 1.0;
          utterance.pitch = 1.1; // Warm and friendly tone
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
  }, [messages, isOpen]);

  // Initial Speech Recognition setup for Assistant Dialog
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback('Listening closely... say your question or command.');
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
  }, [babyName, babyAge, stage, lastFeedStr, lastSleepStr, lastDiaperStr, aiQueryCount, isPremium]);

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
        wakeRec.lang = 'en-US';

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
              // Trigger wakeup!
              setIsOpen(true);
              speakText(`I'm here! What can I do for ${babyName}?`);
              // Extract whatever came after wake word
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
          // Ignore aborted/network errors for continuous wake word
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

  const executeTriggeredAction = (action: any): string => {
    if (!action || !action.type) return '';

    if (action.type === 'log_meal') {
      onLogMeal({
        amount: action.amount || 4,
        unit: action.unit || 'oz',
        type: action.mealType || 'bottle',
        notes: action.notes || 'Logged via Voice Assistant'
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
      return `Saved your note to the journal.`;
    }

    return '';
  };

  const handleSendUserMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Check if this is a direct manual logging intent (Action commands are unlimited and always allowed)
    const lower = text.toLowerCase();
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

    // Check Free Trial Query Limit for general parenting queries / AI assistant questions
    if (!isPremium && !isDirectLoggingIntent && aiQueryCount >= FREE_AI_QUERY_LIMIT) {
      const paywallMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: `🔒 Free Trial AI Limit Reached (${FREE_AI_QUERY_LIMIT}/${FREE_AI_QUERY_LIMIT} queries used).\n\nUpgrade to Ama Premium to unlock unlimited AI parenting questions, voice recognition, acoustic cry analysis, and pediatric PDF exports.`,
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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (talkBackEnabled && data.replyText) {
        speakText(data.replyText);
      }
    } catch (err) {
      console.error(err);
      // Client-side fallback if server offline using extremely simple and warm language
      let fallbackReply = `Hi! I'm here to help you. If you'd like to save a feed, nap, or diaper change, just tell me to "log a feed", "log a nap", or "save diaper change"!`;
      let actionNote: string | undefined = undefined;

      if (lower.includes('feed') || lower.includes('milk') || lower.includes('bottle')) {
        onLogMeal({ amount: 4, unit: 'oz', type: 'bottle' });
        fallbackReply = `Sure, I've noted that down for ${babyName}!`;
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
      } else {
        if (!isPremium) {
          const newCount = aiQueryCount + 1;
          setAiQueryCount(newCount);
          localStorage.setItem('ama_ai_query_count', newCount.toString());
        }
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
            speakText(`Hi! How can I help with ${babyName}?`);
          }
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40 bg-gradient-to-tr from-primary to-primary-light text-white p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white/50 backdrop-blur-md cursor-pointer group"
        title="Open Ogoo Assistant (Voice & Chat)"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          {isWakeListening && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-white rounded-full animate-ping" />
          )}
        </div>
        <span className="text-xs font-black uppercase tracking-wider hidden sm:inline-block pr-1">
          Ask Ogoo
        </span>
      </motion.button>

      {/* Main Voice & Chat Assistant Dialog */}
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
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[85vh] max-h-[640px] border border-primary/20"
            >
              {/* Header */}
              <div className="bg-primary text-white p-4 sm:p-5 flex items-center justify-between shadow-md relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner backdrop-blur-xs">
                    👶
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-base sm:text-lg flex items-center gap-2">
                      Ogoo Assistant
                      {isPremium ? (
                        <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" /> PRO
                        </span>
                      ) : (
                        <span className="bg-white/20 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">
                          {remainingQueries > 0 ? `${remainingQueries} Trial Qs` : 'Trial Limit Reached'}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-sky-100 font-medium">
                      Caring for <strong>{babyName}</strong> ({babyAge})
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

                  {/* Wake Word Enable/Disable Toggle */}
                  <button
                    onClick={() => {
                      const nextState = !backgroundWakeEnabled;
                      setBackgroundWakeEnabled(nextState);
                      if (nextState) {
                        speakText("Voice activation turned on! You can now say Hey Ogoo to wake me up.");
                        setFeedback("Voice activation active! Say 'Hey Ogoo'.");
                        setTimeout(() => setFeedback(''), 4000);
                      } else {
                        speakText("Voice activation turned off.");
                      }
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border-none ${
                      backgroundWakeEnabled ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                    title={backgroundWakeEnabled ? "Disable 'Hey Ogoo' Wake Word" : "Enable 'Hey Ogoo' Wake Word"}
                  >
                    <Mic className={`w-4 h-4 ${backgroundWakeEnabled ? 'animate-pulse' : ''}`} />
                  </button>

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

              {/* Clinical Non-Diagnosis Notice */}
              <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-1.5 flex items-center justify-between text-[10px] text-amber-900">
                <span className="font-semibold">
                  ⚠️ <strong>Notice:</strong> Ogoo AI does not diagnose any medical condition. For health concerns, consult a doctor.
                </span>
              </div>

              {/* Status Bar */}
              <div className="bg-white/70 backdrop-blur px-4 py-2 border-b border-primary/10 flex items-center justify-between text-[11px] text-gray-700 font-medium">
                <span className="truncate flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-primary" />
                  Last Feed: <strong className="text-gray-900">{lastFeedStr}</strong>
                </span>
                <span className="truncate flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  Nap: <strong className="text-gray-900">{lastSleepStr}</strong>
                </span>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#D2E9F9]/40">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[84%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-br-xs'
                          : msg.isPaywall
                          ? 'bg-amber-50 text-amber-950 border border-amber-300 rounded-bl-xs'
                          : 'bg-white text-gray-800 border border-primary/10 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                      
                      {msg.actionTaken && (
                        <div className="mt-2.5 pt-2 border-t border-emerald-100 text-emerald-800 font-semibold text-[11px] flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{msg.actionTaken}</span>
                        </div>
                      )}

                      {msg.isPaywall && onOpenSubscriptionModal && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onOpenSubscriptionModal();
                          }}
                          className="mt-3 w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-xs"
                        >
                          <Crown className="w-3.5 h-3.5 text-white" />
                          <span>Upgrade to Ama Premium</span>
                        </button>
                      )}

                      <span
                        className={`text-[9px] mt-1.5 block text-right font-mono ${
                          msg.sender === 'user' ? 'text-sky-100' : 'text-gray-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-primary/20 rounded-2xl p-3.5 shadow-sm flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      Ogoo is typing a helpful reply...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Simple Quick Buttons */}
              <div className="px-3 py-2.5 bg-white/80 border-t border-primary/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {[
                  `🍲 Yummy recipe for ${babyName}?`,
                  `⏰ How long should a ${babyAge} old baby sleep?`,
                  `🍼 Log a 4 oz bottle feed`,
                  `⏱️ Start left feeding timer`,
                  `💩 Save poopy diaper change`
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (talkBackEnabled) {
                        speakText(`Asking: ${chip}`);
                      }
                      handleSendUserMessage(chip);
                    }}
                    className="shrink-0 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Feedback toast banner */}
              {feedback && (
                <div className="bg-primary/10 border-t border-primary/20 px-4 py-1.5 text-xs text-primary font-bold text-center animate-pulse">
                  {feedback}
                </div>
              )}

              {/* Free Trial Banner if running low or out */}
              {!isPremium && (
                <div className="px-4 py-1.5 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-800 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Free Trial: <strong>{remainingQueries} of {FREE_AI_QUERY_LIMIT}</strong> AI queries remaining
                  </span>
                  {onOpenSubscriptionModal && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onOpenSubscriptionModal();
                      }}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer border-none bg-transparent"
                    >
                      Go Unlimited →
                    </button>
                  )}
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-primary/10 flex items-center gap-2">
                <button
                  id="voice-assistant-mic-toggle-btn"
                  onClick={toggleListening}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer border-none shrink-0 ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Speak to Ogoo'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  id="voice-assistant-text-input"
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendUserMessage();
                  }}
                  placeholder={`Ask Ogoo anything about ${babyName}...`}
                  className="flex-1 bg-gray-50 border border-primary/20 rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-primary font-medium"
                />

                <button
                  id="voice-assistant-send-btn"
                  onClick={() => handleSendUserMessage()}
                  disabled={!inputText.trim() || isProcessing}
                  className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none shrink-0 shadow-md shadow-primary/20"
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
