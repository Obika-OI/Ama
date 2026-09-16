import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Image as ImageIcon, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface Memory {
  id: string;
  url: string;
  date: string;
  note: string;
}

export const MemorySlideshow = ({ memories, babyName, onAddMemory }: { memories: Memory[], babyName: string, onAddMemory?: (mem: Memory) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % memories.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isOpen, memories.length]);

  if (!memories) return null;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAddMemory) return;
    
    const note = prompt("Enter a short note or milestone for this memory:");
    if (note === null) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      onAddMemory({
        id: `mem-${Date.now()}`,
        url: reader.result as string,
        date: new Date().toISOString(),
        note: note || "Precious moment"
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 mt-4">
        {memories.length > 0 && (
          <button 
            onClick={() => { setIsOpen(true); setIsPlaying(true); }}
            className="flex-1 bg-gradient-to-br from-pink-400 to-pink-500 text-white p-4 rounded-3xl font-black shadow-lg shadow-pink-400/20 flex items-center justify-between group active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <Play className="w-5 h-5 text-white ml-1" />
              </div>
              <div className="text-left">
                <span className="block text-sm">Year One Doc</span>
                <span className="block text-[10px] font-bold text-white/80 uppercase tracking-widest">Play</span>
              </div>
            </div>
          </button>
        )}
        
        {onAddMemory && (
          <label className="flex-1 bg-white border-2 border-dashed border-pink-200 text-pink-500 p-4 rounded-3xl font-black flex items-center justify-center cursor-pointer hover:bg-pink-50 transition-all">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              <span className="text-sm">Add Memory</span>
            </div>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-black">
            <div className="flex items-center justify-between p-4 sm:p-6 z-10 absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent">
              <div className="text-white">
                <h2 className="text-lg font-black">{babyName}'s Memories</h2>
                <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">{memories.length} captures</p>
              </div>
              <button onClick={() => { setIsOpen(false); setIsPlaying(false); }} className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <img 
                    src={memories[currentIndex]?.url} 
                    alt="Memory" 
                    className="w-full h-full object-cover sm:object-contain"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-center">
                    <p className="text-sm font-black tracking-widest uppercase mb-2 text-pink-300">{new Date(memories[currentIndex]?.date).toLocaleDateString()}</p>
                    <p className="text-lg font-medium">{memories[currentIndex]?.note}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              <button 
                onClick={() => { setIsPlaying(false); setCurrentIndex(prev => (prev - 1 + memories.length) % memories.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button 
                onClick={() => { setIsPlaying(false); setCurrentIndex(prev => (prev + 1) % memories.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
