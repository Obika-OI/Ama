import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Loader2, Sparkles, Send, X, Baby, Utensils, Moon, CheckCircle2, Volume2, VolumeX } from 'lucide-react';

interface VoiceAssistantProps {
  babyName?: string;
  babyAge?: string;
  stage?: string;
  lastFeedStr?: string;
  lastSleepStr?: string;
  lastDiaperStr?: string;
  onLogMeal: (meal: any) => void;
  onStartTimer: (side: 'left' | 'right') => void;
  onAddNote: (note: string) => void;
  onLogSleep?: (durationMinutes: number) => void;
  onLogDiaper?: (type: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionTaken?: string;
  timestamp: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  babyName = 'Leo',
  babyAge = '6 Months',
  stage = 'Purees & Finger Foods',
  lastFeedStr = 'No feed logged today',
  lastSleepStr = 'No sleep logged today',
  lastDiaperStr = 'No diaper logged today',
  onLogMeal,
  onStartTimer,
  onAddNote,
  onLogSleep,
  onLogDiaper
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [talkBackEnabled, setTalkBackEnabled] = useState(true);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hi! I am Ama, your baby care assistant. How is sweet ${babyName} doing today? Ask me about simple recipes, sleep times, or just tell me to save a feeding, nap, or diaper change!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // HTML5 Text to Speech helper
  const speakText = (textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        // Clean markdown and emojis so they aren't spoken weirdly
        const cleanText = textToSpeak
          .replace(/\*\*?/g, '')
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

  // Speak welcome message or any new assistant message
  useEffect(() => {
    if (isOpen && talkBackEnabled) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.sender === 'assistant') {
        let fullSpeech = lastMsg.text;
        if (lastMsg.actionTaken) {
          fullSpeech += `. ${lastMsg.actionTaken}`;
        }
        speakText(fullSpeech);
      }
    }
  }, [messages, isOpen, talkBackEnabled]);

  // Setup speech recognition
  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        setInputText(transcript);
        await handleSendUserMessage(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        setFeedback(`I didn't quite catch that. Try again!`);
        setTimeout(() => setFeedback(''), 3000);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setFeedback('Voice commands are not supported on this phone/browser.');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setFeedback('Listening for your voice...');
      // Stop speech synthesis if speaking so it doesn't hear itself
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const executeTriggeredAction = (actionObj: any) => {
    if (!actionObj || !actionObj.action) return null;
    const { action, details = {} } = actionObj;

    if (action === 'log_meal') {
      onLogMeal(details);
      return `Saved! I logged a ${details.amount || 4} ${details.unit || 'oz'} bottle feed.`;
    } else if (action === 'start_timer') {
      const side = details.side === 'right' ? 'right' : 'left';
      onStartTimer(side);
      return `Saved! I started your ${side} breast feeding timer.`;
    } else if (action === 'add_note') {
      onAddNote(details.note || 'Care note added');
      return `Saved! Added this note to your baby's diary.`;
    } else if (action === 'log_sleep') {
      if (onLogSleep) onLogSleep(details.durationMinutes || 60);
      return `Saved! I logged a ${details.durationMinutes || 60}-minute nap.`;
    } else if (action === 'log_diaper') {
      if (onLogDiaper) onLogDiaper(details.type || 'wet');
      const wetDryLabel = details.type === 'dirty' ? 'poopy' : 'wet';
      return `Saved! Recorded a ${wetDryLabel} diaper change.`;
    }
    return null;
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
          lastDiaperStr
        })
      });

      if (!response.ok) throw new Error('API server error');
      const data = await response.json();

      let actionNote: string | undefined = undefined;
      if (data.actionToTrigger) {
        const actionResult = executeTriggeredAction(data.actionToTrigger);
        if (actionResult) actionNote = actionResult;
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: data.replyText || `Got it! I saved that for ${babyName}.`,
        actionTaken: actionNote,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      // Client-side fallback if server offline using extremely simple and warm language
      const lower = text.toLowerCase();
      let fallbackReply = `Sure, I've noted that down for ${babyName}!`;
      let actionNote: string | undefined = undefined;

      if (lower.includes('feed') || lower.includes('milk') || lower.includes('bottle')) {
        onLogMeal({ amount: 4, unit: 'oz', type: 'bottle' });
        actionNote = `Saved! Logged a 4 oz bottle feed.`;
      } else if (lower.includes('sleep') || lower.includes('nap')) {
        if (onLogSleep) onLogSleep(60);
        actionNote = `Saved! Logged a 60-minute nap.`;
      } else if (lower.includes('diaper') || lower.includes('nappy')) {
        const isPoop = lower.includes('poop') || lower.includes('dirty');
        if (onLogDiaper) onLogDiaper(isPoop ? 'dirty' : 'wet');
        actionNote = `Saved! Logged a ${isPoop ? 'poopy' : 'wet'} diaper change.`;
      } else if (lower.includes('timer')) {
        const side = lower.includes('right') ? 'right' : 'left';
        onStartTimer(side);
        actionNote = `Saved! Started your ${side} breast feeding timer.`;
      }

      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: fallbackReply,
        actionTaken: actionNote,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button matching App color palette */}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900/90 backdrop-blur text-white text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-white/10 max-w-[220px]"
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          id="ama-genai-floating-btn"
          className="relative group bg-primary hover:bg-primary/90 text-white p-3.5 rounded-full shadow-lg shadow-primary/30 flex items-center gap-2.5 cursor-pointer border-2 border-white/80 transition-all animate-bounce"
        >
          <div className="relative">
            <Sparkles className="w-6 h-6 text-amber-200" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <span className="font-serif font-black text-xs tracking-wider uppercase pr-1 hidden sm:inline-block">
            Ama AI Help
          </span>
        </motion.button>
      </div>

      {/* Interactive GenAI Chat Drawer / Modal matching App exact theme & colors */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.96 }}
              className="w-full sm:max-w-lg bg-[#D2E9F9] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] h-[670px] border-2 border-white/80"
            >
              {/* Header with App primary color #37b1f5 */}
              <div className="bg-primary p-4 text-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                    <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-lg leading-tight flex items-center gap-2">
                      Ama AI
                      <span className="bg-white/20 text-white border border-white/30 text-[9px] px-2 py-0.5 rounded-full font-mono font-normal uppercase tracking-wider">
                        Online
                      </span>
                    </h3>
                    <p className="text-[11px] text-white/90 flex items-center gap-1.5 mt-0.5">
                      <Baby className="w-3.5 h-3.5 text-amber-200" />
                      {babyName} ({babyAge}) • {stage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* TalkBack Toggle Icon */}
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
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
                    title={talkBackEnabled ? 'Mute Assistant Voice' : 'Unmute Assistant Voice'}
                  >
                    {talkBackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-white/60" />}
                  </button>

                  <button
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                      }
                      setIsOpen(false);
                    }}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
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
                      Ama is typing a helpful reply...
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

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-primary/10 flex items-center gap-2 font-sans">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-200'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                  title={isListening ? 'Stop listening' : 'Talk to Ama'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-primary" />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendUserMessage()}
                  placeholder={`Tell Ama to log feeds, naps, or ask questions...`}
                  className="flex-1 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-primary focus:bg-white transition-all font-sans text-gray-800"
                />

                <button
                  type="button"
                  onClick={() => handleSendUserMessage()}
                  disabled={!inputText.trim() || isProcessing}
                  className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm shadow-primary/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};


