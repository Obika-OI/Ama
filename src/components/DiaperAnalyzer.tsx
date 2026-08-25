import React, { useState } from 'react';
import { Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { model } from '../firebase';

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

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64data,
              mimeType: file.type
            }
          }
        ]);
        
        const rawText = result.response.text() || '';
        const text = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);
        
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
    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center relative overflow-hidden text-blue-500">
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
        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-1">Snap a photo to auto-fill</p>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
