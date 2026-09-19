import React, { useState } from 'react';
import { Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';


interface DiaperAnalyzerProps {
  onAnalyze: (data: { stoolType: number, poopColor: string, symptoms: string }) => void;
}

export const DiaperAnalyzer: React.FC<DiaperAnalyzerProps> = ({ onAnalyze }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        
        const prompt = `
          You are an infant care AI assistant.
          Analyze this diaper stool image.
          Return ONLY valid JSON with no markdown block formatting.
          Fields needed:
          - stoolType (number 1-7 based on Bristol Stool Scale, where 1 is hard lumps, 4 is normal, 7 is watery)
          - color (string, e.g., "Yellow", "Brown", "Green", "Red", "Black")
          - concerns (string: list any flagged observations like hydration or digestion notes based on general infant care guidelines. If none, say "Normal stool")
        `;

        const response = await fetch("/api/ai/diaper-analyzer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64data, mimeType: file.type })
        });
        const parsed = await response.json();
        onAnalyze({
          stoolType: parsed.stoolType || 4,
          poopColor: parsed.color || 'Yellow',
          symptoms: parsed.concerns || ''
        });
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center relative overflow-hidden text-primary">
        {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          onChange={handleImageCapture}
          disabled={isAnalyzing}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800">Smart Diaper Analyzer</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Snap a photo to auto-fill</p>
      </div>
      {error && <p className="text-xs text-gray-800 font-bold bg-primary/10 px-3 py-1 rounded-xl">{error}</p>}
      <p className="text-[9px] text-gray-500 font-medium leading-tight max-w-xs">
        ⚠️ AI Accuracy Disclaimer: Diaper analysis is powered by AI for convenience only and is not a medical diagnosis. Consult a qualified healthcare provider for any health concerns.
      </p>
    </div>
  );
};
