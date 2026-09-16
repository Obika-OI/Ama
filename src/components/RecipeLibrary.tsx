import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, Plus, Clock, Star, Heart, Flame, Shield, Info, Edit3, Trash2, MapPin, AlertCircle, PlusCircle } from 'lucide-react';
import { LOCAL_REGIONS_DATABASE } from '../constants/babyData';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_MEALS, THEME } from '../constants';
import { Meal } from '../types';
import { formatCost } from '../utils/helpers';

export const RecipeLibrary = ({ onNavigate, personalRecipes }: { onNavigate: (screen: string, data?: any, autoOpenLog?: boolean) => void; personalRecipes: Meal[] }) => {
  const [userLocation, setUserLocation] = useState(() => localStorage.getItem('userLocation') || 'New York, US');
  const [userCurrency, setUserCurrency] = useState(() => localStorage.getItem('userCurrency') || '$');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Initialize suggestions based on location
  useEffect(() => {
    const matched = LOCAL_REGIONS_DATABASE.find(r => r.name.toLowerCase().includes(userLocation.toLowerCase()));
    if (matched) {
      setLocationSuggestions(matched.suggestions);
    } else {
      setLocationSuggestions(LOCAL_REGIONS_DATABASE[1].suggestions); // fallback New York
    }
  }, [userLocation]);

  const handleLocationSelect = (region: typeof LOCAL_REGIONS_DATABASE[0]) => {
    setUserLocation(region.name);
    setUserCurrency(region.currency);
    localStorage.setItem('userLocation', region.name);
    localStorage.setItem('userCurrency', region.currency);
    setLocationSuggestions(region.suggestions);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const fetchLocationSuggestions = () => {
    setIsLoadingLocation(true);
    setTimeout(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // Find closest region
            let closest = LOCAL_REGIONS_DATABASE[0];
            let minDist = Infinity;
            LOCAL_REGIONS_DATABASE.forEach(r => {
              const d = Math.pow(r.lat - latitude, 2) + Math.pow(r.lng - longitude, 2);
              if (d < minDist) {
                minDist = d;
                closest = r;
              }
            });
            handleLocationSelect(closest);
            setIsLoadingLocation(false);
          },
          (error) => {
            console.warn("Geolocation failed or denied, matching based on search string:", error);
            setIsLoadingLocation(false);
          },
          { timeout: 5000 }
        );
      } else {
        setIsLoadingLocation(false);
      }
    }, 400);
  };

  const allMeals = [...MOCK_MEALS, ...personalRecipes];
  const filteredMeals = activeCategory === 'All' 
    ? allMeals 
    : allMeals.filter(meal => meal.stage.toLowerCase().includes(activeCategory.toLowerCase().replace(/s$/, '')) || (activeCategory === 'Snacks' && meal.stage.toLowerCase().includes('snack')));

  const matchedRegions = searchQuery 
    ? LOCAL_REGIONS_DATABASE.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : LOCAL_REGIONS_DATABASE;

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-32 space-y-8 bg-background min-h-screen">
      <header className="flex justify-between items-center pt-3 sm:pt-4 pb-2 px-1">
        <h1 className="text-2xl font-serif font-black text-gray-800">Recipe Library</h1>
        <button 
          onClick={() => onNavigate('add-recipe')}
          className="w-11 h-11 rounded-full bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center cursor-pointer border-none hover:scale-105 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {/* Manual Location Search & Currency Switcher Card */}
      <div className="bg-white p-5 rounded-[36px] shadow-sm border border-gray-100 space-y-4 text-left">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Configure Location & Local Currency</p>
        <div className="flex gap-2 relative">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search location (e.g. London, Tokyo)..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold outline-none text-gray-700"
            />
            
    </div>
          <button 
            onClick={fetchLocationSuggestions}
            disabled={isLoadingLocation}
            className="px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl flex items-center justify-center gap-1 text-[10px] font-bold uppercase transition-colors border-none cursor-pointer shrink-0"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{isLoadingLocation ? 'Locating...' : 'GPS'}</span>
          </button>

          {showSearchResults && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
              {matchedRegions.length > 0 ? (
                matchedRegions.map(region => (
                  <button
                    key={region.name}
                    onClick={() => handleLocationSelect(region)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-xs font-bold text-gray-700 flex justify-between items-center border-none cursor-pointer"
                  >
                    <span>📍 {region.name}</span>
                    <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-[10px] font-black">{region.currency} ({region.name.split(',')[1].trim()})</span>
                  </button>
                ))
              ) : (
                <p className="p-3 text-xs text-gray-400 italic text-center">No matching locations found.</p>
              )}
              
    </div>
          )}
          
    </div>

        <div className="flex items-center justify-between text-xs font-bold bg-primary/5 p-3.5 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <div>
              <p className="text-gray-800 text-[11px]">Active: <span className="font-extrabold text-primary">{userLocation}</span></p>
              <p className="text-[9px] text-gray-400 font-medium">Standard weaning recipes loaded</p>
              
    </div>
            
    </div>
          <div className="bg-white px-3 py-1.5 rounded-xl text-primary font-black text-xs border border-solid border-primary/10">
            Currency: {userCurrency}
            
    </div>
          
    </div>
        
    </div>

      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {['All', 'Purees', 'Solids', 'Finger Foods', 'Snacks'].map((cat, i) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border border-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
        
    </div>

      <div className="bg-primary/10 p-6 rounded-[40px] space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Local Suggestions</h2>
            
    </div>
          
    </div>
        <div className="space-y-2">
          {locationSuggestions.length > 0 ? (
            locationSuggestions.map((s, i) => (
              <p key={i} className="text-xs text-gray-600 flex items-start gap-2 text-left">
                <span className="text-primary">•</span> <span>{s}</span>
              </p>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic text-left">Tap GPS or search locations above!</p>
          )}
          
    </div>
        
    </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 text-left">Nutritious Favorites</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map(meal => (
            <motion.div 
              key={meal.id}
              onClick={() => onNavigate('recipe-detail', meal)}
              whileTap={{ scale: 0.98 }}
              className="bg-card rounded-[40px] overflow-hidden shadow-xl shadow-card/20 border border-white cursor-pointer group"
            >
              <div className="relative h-56">
                <img src={meal.image} alt={meal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase">
                  {formatCost(meal.costPerServe || '$0.45', userCurrency)} / Serve
                  
    </div>
                
    </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{meal.stage}</p>
                    <h3 className="text-xl font-bold text-gray-800">{meal.title}</h3>
                    
    </div>
                  <div className="flex items-center gap-1 text-muted">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase">{meal.time}</span>
                    
    </div>
                  
    </div>
                <div className="flex gap-2">
                  {meal.nutrients.slice(0, 3).map((n, i) => (
                    <span key={i} className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg flex items-center gap-1">
                      {n.icon} {n.label}
                    </span>
                  ))}
                  
    </div>
                
    </div>
            </motion.div>
          ))}
          
    </div>
        
    </div>
      
    </div>
  );
};

const getIngredientImage = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('plantain') || n.includes('banana')) {
    return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('carrot')) {
    return 'https://images.unsplash.com/photo-1590865507245-51368572167e?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('milk') || n.includes('formula') || n.includes('yogurt') || n.includes('breastmilk')) {
    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('oat') || n.includes('powder') || n.includes('brown') || n.includes('cereal') || n.includes('flour')) {
    return 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('water')) {
    return 'https://images.unsplash.com/photo-1548839140-29a8c1f930c1?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('bean') || n.includes('beans')) {
    return 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('onion')) {
    return 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('oil')) {
    return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('fish') || n.includes('salmon')) {
    return 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('crayfish') || n.includes('shrimp')) {
    return 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('yam') || n.includes('potato') || n.includes('sweet potato')) {
    return 'https://images.unsplash.com/photo-1596003906949-67221c377f6c?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('ugu') || n.includes('leaf') || n.includes('leaves') || n.includes('spinach') || n.includes('mint')) {
    return 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('egg') || n.includes('eggy')) {
    return 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('corn')) {
    return 'https://images.unsplash.com/photo-1551754625-7fc5b94523fd?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('avocado')) {
    return 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('apple')) {
    return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('pear')) {
    return 'https://images.unsplash.com/photo-1514801115160-5807755866ef?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('blueberry') || n.includes('blueberries') || n.includes('berry') || n.includes('berries')) {
    return 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=150&q=80';
  }
  if (n.includes('pea') || n.includes('peas')) {
    return 'https://images.unsplash.com/photo-1587334206596-f00e572097e1?auto=format&fit=crop&w=150&q=80';
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=150&q=80';
};

export const RecipeDetail = ({ meal, onBack, onLog, onSchedule, autoOpenLog = false, babyName }: { meal: Meal; onBack: () => void; onLog: (details: any) => void; onSchedule: (meal: Meal) => void; autoOpenLog?: boolean; babyName: string }) => {
  const [showLogModal, setShowLogModal] = useState(autoOpenLog);
  const [mealType, setMealType] = useState('Lunch');
  const [mealTime, setMealTime] = useState('12:30');
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [consistency, setConsistency] = useState('Puree');
  const [newFood, setNewFood] = useState('🥑');
  const FOODS = ['🥑', '🍌', '🥕', '🍎', '🥦', '🍠', '🥭'];
  const [allergyReaction, setAllergyReaction] = useState(false);
  const [allergyNotes, setAllergyNotes] = useState('');
  const [ratings, setRatings] = useState({
    appetising: 0,
    taste: 0,
    acceptance: 0,
    satisfaction: 0
  });

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto"
    >
      <div className="relative h-[450px]">
        <img src={meal.image} alt={meal.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <button className="absolute top-6 right-6 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm">
          <Heart className="w-5 h-5 text-gray-400" />
        </button>
        
    </div>

      <div className="p-8 -mt-20 bg-background rounded-t-[64px] relative space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">{meal.stage}</span>
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
              <Clock className="w-3 h-3 text-muted" />
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{meal.time}</span>
              
    </div>
            
    </div>
          <h1 className="text-4xl font-serif font-black text-gray-800 leading-tight">{meal.title}</h1>
          <p className="text-sm text-muted font-medium leading-relaxed">{meal.description}</p>
          
    </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-50 flex flex-col items-center">
            <span className="text-[10px] text-muted uppercase font-black tracking-tighter mb-1">Cost</span>
            <span className="font-bold text-gray-800">{formatCost(meal.costPerServe || '$0.45', localStorage.getItem('userCurrency') || '$')}</span>
            
    </div>
          <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-50 flex flex-col items-center">
            <span className="text-[10px] text-muted uppercase font-black tracking-tighter mb-1">Prep</span>
            <span className="font-bold text-gray-800">15m</span>
            
    </div>
          <div className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-50 flex flex-col items-center">
            <span className="text-[10px] text-muted uppercase font-black tracking-tighter mb-1">Age</span>
            <span className="font-bold text-gray-800">6m+</span>
            
    </div>
          
    </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Nutrients</h2>
          <div className="grid grid-cols-2 gap-3">
            {meal.nutrients.map((n, i) => (
              <div key={i} className="bg-card p-4 rounded-[24px] shadow-sm border border-white flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">
                  {n.icon || '✨'}
                  
    </div>
                <div>
                  <p className="text-[10px] text-muted font-black uppercase tracking-tighter">{n.label}</p>
                  <p className="text-sm font-bold text-gray-800">{n.value}</p>
                  
    </div>
                
    </div>
            ))}
            
    </div>
          
    </div>

        {meal.ingredients && meal.ingredients.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Ingredients & Matches</h2>
            <div className="grid grid-cols-2 gap-3">
              {meal.ingredients.map((ing, i) => {
                const matchedImage = getIngredientImage(ing.name);
                return (
                  <div key={i} className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                      <img src={matchedImage} alt={ing.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      
    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-800 leading-tight">{ing.name}</p>
                      <p className="text-[10px] text-muted font-medium mt-0.5">{ing.amount}</p>
                      
    </div>
                    
    </div>
                );
              })}
              
    </div>
            
    </div>
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Step-by-Step</h2>
          <div className="space-y-8">
            {meal.steps.map((step, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-primary/20">
                  {i + 1}
                  
    </div>
                <p className="text-sm text-muted font-medium leading-relaxed pt-1">{step}</p>
                
    </div>
            ))}
            
    </div>
          
    </div>

        <div className="pb-32 pt-8 space-y-4">
          <button 
            onClick={() => setShowLogModal(true)}
            className="w-full bg-primary text-white py-5 rounded-[32px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            Log This Meal
          </button>
          <button 
            onClick={() => onSchedule(meal)}
            className="w-full bg-white text-primary py-5 rounded-[32px] font-black uppercase tracking-widest shadow-sm border border-primary/20"
          >
            Schedule Meal
          </button>
          
    </div>
        
    </div>

      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-card rounded-t-[48px] p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto" />
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-serif font-black text-gray-800">Log Meal</h2>
                <p className="text-sm text-muted font-bold uppercase tracking-widest">When did baby have this?</p>
                
    </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setMealType(type)}
                      className={`py-4 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all ${
                        mealType === type ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                  
    </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-6 rounded-[32px] space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</label>
                    <input 
                      type="date" 
                      value={mealDate}
                      onChange={(e) => setMealDate(e.target.value)}
                      className="w-full bg-transparent text-sm font-black text-gray-800 focus:outline-none"
                    />
                    
    </div>
                  <div className="bg-gray-50 p-6 rounded-[32px] space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</label>
                    <input 
                      type="time" 
                      value={mealTime}
                      onChange={(e) => setMealTime(e.target.value)}
                      className="w-full bg-transparent text-sm font-black text-gray-800 focus:outline-none"
                    />
                    
    </div>
                  
    </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Consistency & New Food</p>
                  <div className="flex justify-center gap-4">
                    {['Puree', 'Mashed', 'Chunks', 'Solid'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setConsistency(c)}
                        className={`text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-full transition-all ${consistency === c ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {c}
                      </button>
                    ))}
                    
    </div>
                  <div className="flex justify-center gap-4 overflow-x-auto pb-2 px-2">
                    {FOODS.map(f => (
                      <button 
                        key={f}
                        onClick={() => setNewFood(f)}
                        className={`text-2xl transition-all shrink-0 ${newFood === f ? 'scale-125 drop-shadow-md' : 'opacity-30 grayscale'}`}
                      >
                        {f}
                      </button>
                    ))}
                    
    </div>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { key: 'appetising', label: 'Appetizing', icon: '✨' },
                      { key: 'taste', label: 'Taste', icon: '😋' },
                      { key: 'acceptance', label: 'Acceptance', icon: '👶' },
                      { key: 'satisfaction', label: 'Satisfaction', icon: '💖' }
                    ].map((item) => (
                      <div key={item.key} className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{item.icon}</span>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                          
    </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                              key={star}
                              onClick={() => setRatings(prev => ({ ...prev, [item.key]: star }))}
                              className="focus:outline-none"
                            >
                              <Star 
                                className={`w-4 h-4 ${
                                  (ratings as any)[item.key] >= star ? 'text-accent fill-accent' : 'text-gray-100 fill-gray-100'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-pink-50/80 p-5 rounded-[28px] border border-pink-200">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-pink-500" />
                    <span className="text-xs font-bold text-gray-800">Allergy Reaction?</span>
                  </div>
                  <button 
                    onClick={() => setAllergyReaction(!allergyReaction)}
                    className={`w-12 h-6 rounded-full transition-all relative ${allergyReaction ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${allergyReaction ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {allergyReaction && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2 bg-pink-50/50 p-4 rounded-[24px] border border-pink-200"
                  >
                    <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest block">Describe Reaction (Allergy Log)</label>
                    <input 
                      type="text"
                      value={allergyNotes}
                      onChange={(e) => setAllergyNotes(e.target.value)}
                      placeholder="e.g. Skin rash, mild hives, spit up..."
                      className="w-full bg-white border border-pink-200 rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none"
                    />
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any reactions..."
                    className="w-full bg-gray-50 p-4 rounded-[24px] focus:outline-none text-sm font-medium min-h-[80px] resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  onLog({ 
                    type: mealType, 
                    time: mealTime, 
                    date: mealDate, 
                    ...ratings, 
                    notes, 
                    consistency, 
                    newFood, 
                    allergyReaction, 
                    allergyNotes: allergyReaction ? allergyNotes : '' 
                  });
                  setShowLogModal(false);
                }}
                className="w-full bg-primary text-white py-5 rounded-[32px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                Confirm Log
              </button>
            </motion.div>
            
    </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};



export const AddRecipeScreen = ({ onBack, onSave }: { onBack: () => void; onSave: (recipe: any) => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Purees' | 'Solids' | 'Finger Foods' | 'Snacks'>('Purees');
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState(['']);

  const handleAddIngredient = () => setIngredients([...ingredients, { name: '', amount: '' }]);
  const handleAddStep = () => setSteps([...steps, '']);

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 space-y-8"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center pt-3 sm:pt-4 pb-2 px-1">
          <button onClick={onBack} className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center cursor-pointer border-none hover:scale-105 transition-transform">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="font-serif text-2xl font-black text-gray-800 uppercase tracking-widest">New Recipe</h1>
          <div className="w-11" />
        </header>

        <div className="space-y-8 pb-32">
        <div className="bg-card p-8 rounded-[48px] shadow-sm border border-white space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipe Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Creamy Avocado Puree"
              className="w-full bg-transparent text-2xl font-serif font-black text-gray-800 focus:outline-none placeholder:text-gray-200"
            />
            
    </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about this recipe..."
              className="w-full bg-transparent text-sm font-medium text-muted focus:outline-none placeholder:text-gray-200 min-h-[100px] resize-none"
            />
            
    </div>
          <div className="space-y-3 pt-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Recipe Category</label>
            <div className="flex gap-2 flex-wrap">
              {(['Purees', 'Solids', 'Finger Foods', 'Snacks'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    category === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border border-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
              
    </div>
            
    </div>
          
    </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-gray-800">Ingredients</h2>
            <button onClick={handleAddIngredient} className="text-primary">
              <PlusCircle className="w-6 h-6" />
            </button>
            
    </div>
          <div className="space-y-4">
            {ingredients.map((ing, i) => (
              <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 flex gap-4">
                <input 
                  type="text" 
                  placeholder="Item"
                  value={ing.name}
                  onChange={(e) => {
                    const newIngs = [...ingredients];
                    newIngs[i].name = e.target.value;
                    setIngredients(newIngs);
                  }}
                  className="flex-1 bg-transparent font-bold text-gray-800 focus:outline-none placeholder:text-gray-200"
                />
                <input 
                  type="text" 
                  placeholder="Amt"
                  value={ing.amount}
                  onChange={(e) => {
                    const newIngs = [...ingredients];
                    newIngs[i].amount = e.target.value;
                    setIngredients(newIngs);
                  }}
                  className="w-20 bg-transparent font-bold text-primary text-right focus:outline-none placeholder:text-primary/20"
                />
                
    </div>
            ))}
            
    </div>
          
    </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-gray-800">Steps</h2>
            <button onClick={handleAddStep} className="text-primary">
              <PlusCircle className="w-6 h-6" />
            </button>
            
    </div>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 flex gap-4">
                <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">{i + 1}</span>
                <textarea 
                  placeholder="Instructions..."
                  value={step}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[i] = e.target.value;
                    setSteps(newSteps);
                  }}
                  className="flex-1 bg-transparent font-medium text-gray-800 focus:outline-none min-h-[60px] resize-none placeholder:text-gray-200"
                />
                
    </div>
            ))}
            
    </div>
          
    </div>

        <button 
          onClick={() => {
            if (title) {
              onSave({ title, description, category, prepTime: '15m', ingredients, instructions: steps });
            }
          }}
          className="w-full bg-primary text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
        >
          Save Recipe
        </button>
          
    </div>
        
    </div>
    </motion.div>
  );
};

// --- Main App ---


