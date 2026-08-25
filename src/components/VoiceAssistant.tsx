import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { model } from '../firebase';

interface VoiceAssistantProps {
  onLogMeal: (meal: any) => void;
  onStartTimer: (side: 'left' | 'right') => void;
  onAddNote: (note: string) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onLogMeal, onStartTimer, onAddNote }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  const recognitionRef = useRef<any>(null);

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
        setIsProcessing(true);
        setFeedback(`Heard: "${transcript}"`);
        await processVoiceCommand(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        setFeedback(`Error: ${event.error}`);
        setTimeout(() => setFeedback(''), 3000);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setFeedback('Speech recognition not supported in this browser.');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setFeedback('Listening...');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const processVoiceCommand = async (transcript: string) => {
    try {
      const prompt = `
        You are a voice assistant for a baby care app.
        Parse the user's intent and extract the required information into JSON.
        The JSON should have these fields:
        {
          "action": "log_meal" | "start_timer" | "add_note" | "unknown",
          "details": {
             "amount": number (ounces or ml),
             "unit": "oz" | "ml",
             "type": "bottle" | "breast" | "solid",
             "side": "left" | "right",
             "note": string
          },
          "message": string (A friendly confirmation message)
        }
        
        Examples: 
        "Log a 4 ounce bottle" -> {"action": "log_meal", "details": {"amount": 4, "unit": "oz", "type": "bottle"}, "message": "Logged 4 oz bottle."}
        "Start the left breast timer" -> {"action": "start_timer", "details": {"side": "left"}, "message": "Started left breast timer."}
        
        Transcript: "${transcript}"
        Return ONLY valid JSON.
      `;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text() || '';
      const responseText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(responseText);

      setFeedback(parsed.message || 'Processed command.');

      if (parsed.action === 'log_meal') {
        onLogMeal(parsed.details);
      } else if (parsed.action === 'start_timer') {
        if (parsed.details.side) {
          onStartTimer(parsed.details.side as 'left' | 'right');
        }
      } else if (parsed.action === 'add_note') {
        onAddNote(parsed.details.note || transcript);
      }

    } catch (error) {
      console.error(error);
      setFeedback("Sorry, I didn't catch that.");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-black/80 backdrop-blur text-white text-xs px-4 py-2 rounded-2xl shadow-lg max-w-[200px]"
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={toggleListening}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-primary text-white hover:bg-primary/90'}`}
      >
        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>
    </div>
  );
};
