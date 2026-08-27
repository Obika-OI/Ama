import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, X, Printer, Loader2 } from 'lucide-react';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';

export const StorybookGenerator = ({ diaryEntries, babyName }: { diaryEntries: any[], babyName: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState('');

  const generateStory = async () => {
    if (diaryEntries.length === 0) {
      alert("You need to log some diary entries first!");
      return;
    }
    
    setIsGenerating(true);
    setIsOpen(true);
    
    try {
      const recentLogs = diaryEntries.slice(0, 30).map(e => `Date: ${e.date}, Mood: ${e.mood}, Entry: ${e.notes}`).join('\n');
      
      const prompt = `
        You are an expert children's book author and a warm, empathetic biographer.
        Take the following rough daily diary notes and transform them into a beautifully written, magical narrative storybook summarizing ${babyName}'s recent month.
        Make it sound like a beautiful keepsake story. Use Markdown for formatting (bolding, headers).
        Keep it to about 3-4 paragraphs.
        
        Notes:
        ${recentLogs}
      `;

      const response = await fetch("/api/ai/storybook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ babyName, diaryEntries })
      });
      const data = await response.json();
      setStory(data.story || '');    } catch (error) {
      console.error(error);
      setStory("Failed to generate the story. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    const element = document.getElementById('storybook-content');
    if (!element) return;
    
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
    pdf.save(`${babyName}_Monthly_Storybook.pdf`);
  };

  return (
    <>
      <button 
        onClick={generateStory}
        className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-3xl font-black shadow-lg shadow-purple-500/30 flex items-center justify-between group active:scale-95 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <span className="block text-sm">AI Milestone Biographer</span>
            <span className="block text-[10px] font-bold text-white/80 uppercase tracking-widest">Generate Monthly Storybook</span>
          </div>
        </div>
        <BookOpen className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[32px] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-800">{babyName}'s Monthly Story</h2>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Generated Keepsake</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isGenerating && story && (
                    <button onClick={handlePrint} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600 hover:text-indigo-500 transition-colors">
                      <Printer className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                {isGenerating ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-sm font-bold text-gray-500">Weaving memories into magic...</p>
                  </div>
                ) : (
                  <div id="storybook-content" className="prose prose-indigo max-w-none text-gray-700 bg-white p-4 rounded-xl">
                     <ReactMarkdown>{story}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
