import React, { useState } from 'react';

export const MoodTracker = () => {
  const [mood, setMood] = useState('😊');
  const moods = ['😴', '😢', '😐', '😊', '🤩'];
  
  return (
    <div className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-50 flex flex-col items-center justify-center text-center space-y-3">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mood Tracker</p>
      <div className="flex gap-3">
        {moods.map(m => (
          <button 
            key={m} 
            onClick={() => setMood(m)}
            className={`text-2xl transition-all ${mood === m ? 'scale-125 drop-shadow-md' : 'opacity-30 grayscale hover:opacity-50'}`}
          >
            {m}
          </button>
        ))}
        
    </div>
      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
        {mood === '🤩' ? 'Super Happy' : mood === '😊' ? 'Happy' : mood === '😐' ? 'Neutral' : mood === '😢' ? 'Sad' : 'Sleepy'}
      </p>
      
    </div>
  );
};

