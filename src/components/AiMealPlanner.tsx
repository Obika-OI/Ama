import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Utensils, 
  ShoppingCart, 
  Calendar, 
  Globe, 
  CheckCircle2, 
  DollarSign, 
  Loader2, 
  ChevronRight, 
  ChevronDown, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle, 
  Zap, 
  Info,
  Layers,
  Heart,
  Crown,
  Lock,
  MapPin
} from 'lucide-react';
import { LocalMarketMap } from './LocalMarketMap';

import { GlobalLocation, GlobalLocationPickerModal, POPULAR_GLOBAL_LOCATIONS } from './GlobalLocationPickerModal';

interface AiMealPlannerProps {
  babyAge: string;
  babyName: string;
  allergenMatrix?: any[];
  isPremium?: boolean;
  onOpenSubscriptionModal?: () => void;
  onApplyToWeeklyPlan?: (plan: any) => void;
  onSyncGroceries?: (groceries: any[]) => void;
  onClose?: () => void;
}

export const AiMealPlanner: React.FC<AiMealPlannerProps> = ({
  babyAge,
  babyName,
  allergenMatrix = [],
  isPremium = false,
  onOpenSubscriptionModal,
  onApplyToWeeklyPlan,
  onSyncGroceries,
  onClose
}) => {
  const [selectedRegion, setSelectedRegion] = useState<GlobalLocation>(() => {
    const saved = localStorage.getItem('ama_global_location');
    return saved ? JSON.parse(saved) : POPULAR_GLOBAL_LOCATIONS[0];
  });
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [targetAge, setTargetAge] = useState(babyAge || '6 Months');
  const [dietaryPreference, setDietaryPreference] = useState<'all' | 'vegetarian' | 'dairy_free' | 'egg_free'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [planData, setPlanData] = useState<any>(() => {
    const saved = localStorage.getItem('ama_ai_weekly_meal_plan');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'meals' | 'groceries' | 'markets' | 'nutrition'>('meals');
  const [checkedGroceries, setCheckedGroceries] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const clearedAllergens = allergenMatrix.filter(a => a.status === 'Cleared').map(a => a.name);
  const suspectedAllergens = allergenMatrix.filter(a => a.status === 'Suspected Reaction').map(a => a.name);

  const handleGeneratePlan = async () => {
    if (!isPremium) {
      if (onOpenSubscriptionModal) onOpenSubscriptionModal();
      setErrorMsg('🔒 7-Day AI Meal & Localized Grocery Planner is an Ama Premium feature. Upgrade via Paystack to unlock.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');
    try {
      const response = await fetch("/api/ai/meal-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          babyName: babyName || 'Baby',
          babyAge: targetAge,
          region: selectedRegion.name,
          currency: `${selectedRegion.currency} (${selectedRegion.currencyCode || 'Local Currency'})`,
          dietType: dietaryPreference,
          targetNutrients: ['Iron', 'DHA', 'Zinc', 'Vitamin C'],
          allergenExclusions: suspectedAllergens
        })
      });

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const rawData = await response.json();

      // Normalize server response to match UI component structure
      const normalizedDays = (rawData.days || []).map((d: any) => {
        if (d.breakfast || d.lunch || d.dinner) {
          return d;
        }
        // Map meals array format if present
        const mealsArr = d.meals || [];
        const b = mealsArr.find((m: any) => m.mealType === 'Breakfast' || m.type === 'Breakfast') || mealsArr[0];
        const l = mealsArr.find((m: any) => m.mealType === 'Lunch' || m.type === 'Lunch') || mealsArr[1];
        const dn = mealsArr.find((m: any) => m.mealType === 'Dinner' || m.type === 'Dinner') || mealsArr[2];
        const sn = mealsArr.find((m: any) => m.mealType === 'Snack' || m.type === 'Snack');

        return {
          dayName: d.dayName || 'Day',
          breakfast: b ? { title: b.name || b.title, description: b.notes || b.description || 'Nutrient rich breakfast', keyNutrient: b.ironRich ? 'Iron & Energy' : 'Essential Vitamins', texture: b.texture || 'Smooth Puree' } : null,
          lunch: l ? { title: l.name || l.title, description: l.notes || l.description || 'Balanced lunch', keyNutrient: 'Protein & Zinc', texture: l.texture || 'Soft Mash' } : null,
          dinner: dn ? { title: dn.name || dn.title, description: dn.notes || dn.description || 'Calming evening meal', keyNutrient: 'Healthy Fats & Fiber', texture: dn.texture || 'Smooth Puree' } : null,
          snack: sn ? { title: sn.name || sn.title, description: sn.notes || sn.description || 'Snack', keyNutrient: 'Vitamin C', texture: sn.texture || 'Soft Baton' } : null
        };
      });

      // Normalize grocery Aisles
      let normalizedGroceries = rawData.groceryAisles;
      if (!normalizedGroceries && rawData.groceryList) {
        normalizedGroceries = rawData.groceryList.map((cat: any) => ({
          category: cat.category || 'Grocery Items',
          items: (cat.items || []).map((it: any) => typeof it === 'string' ? { name: it, quantity: '1 pack', estCost: 'Local Market Rate', currency: selectedRegion.currency } : it)
        }));
      }

      const normalizedParsed = {
        summary: rawData.summary || `7-Day solid food plan for ${babyName || 'Baby'} in ${selectedRegion.name}.`,
        nutritionalGapsFilled: rawData.nutritionalGapsFilled || [
          "High Iron: Bioavailable pairings for brain and blood health.",
          "Brain Fats: Localized healthy fats for motor and cognitive development.",
          "Digestive Comfort: Gentle fibers for easy transition to solids."
        ],
        days: normalizedDays,
        groceryAisles: normalizedGroceries || [],
        totalEstBudget: rawData.totalEstBudget || rawData.estimatedWeeklyCost || "Market Rate",
        currencySymbol: rawData.currencySymbol || selectedRegion.currency
      };

      setPlanData(normalizedParsed);
      localStorage.setItem('ama_ai_weekly_meal_plan', JSON.stringify(normalizedParsed));
      setCheckedGroceries([]);
    } catch (err: any) {
      console.error("AI Meal Planning Error:", err);
      setErrorMsg("Failed to generate meal plan. Please check your network and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToGrid = () => {
    if (!planData || !planData.days) return;
    
    // Transform AI days to standard Weekly Plan format
    const transformedPlan: any = {};
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    planData.days.forEach((d: any, idx: number) => {
      const dayName = weekDays[idx] || d.dayName;
      transformedPlan[dayName] = {
        Breakfast: d.breakfast?.title || null,
        Lunch: d.lunch?.title || null,
        Dinner: d.dinner?.title || null,
        Snack: d.snack?.title || null
      };
    });

    if (onApplyToWeeklyPlan) {
      onApplyToWeeklyPlan(transformedPlan);
    }

    setApplySuccess(true);
    setTimeout(() => setApplySuccess(false), 3500);
  };

  const handleCopyGroceries = () => {
    if (!planData?.groceryAisles) return;
    let text = `🛒 ${babyName || 'Baby'}'s Localized Grocery List (${selectedRegion.name})\n`;
    text += `Estimated Total: ${planData.currencySymbol}${planData.totalEstBudget}\n\n`;

    planData.groceryAisles.forEach((aisle: any) => {
      text += `📍 ${aisle.category.toUpperCase()}:\n`;
      aisle.items.forEach((item: any) => {
        text += `  • ${item.name} (${item.quantity}) - ~${item.currency}${item.estCost}\n`;
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const toggleGroceryItem = (itemName: string) => {
    setCheckedGroceries(prev => 
      prev.includes(itemName) ? prev.filter(i => i !== itemName) : [...prev, itemName]
    );
  };

  const currentDay = planData?.days?.[activeDayIndex];

  return (
    <div className="bg-white rounded-[40px] p-5 sm:p-7 border border-gray-100 shadow-xl space-y-6 text-left relative overflow-hidden">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl shadow-2xs shrink-0">
            🥗
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                AI Baby Nutrition
              </span>
              <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Age: {targetAge}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-800 mt-1">
              AI Weekly Meal Planner & Grocery
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPremium ? (
            <span className="bg-primary text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3" /> PRO
            </span>
          ) : (
            <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" /> Premium Only
            </span>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center border-none cursor-pointer self-end sm:self-auto"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Premium Lock Banner if not subscribed */}
      {!isPremium && (
        <div className="bg-primary/5 border-2 border-primary/20 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-gray-800">7-Day AI Meal Planner is a Premium Feature</h4>
                <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">Locked</span>
              </div>
              <p className="text-[11px] text-gray-600 font-medium mt-0.5">
                Generate localized 7-day solid meal menus, allergen filters, and priced grocery market lists.
              </p>
            </div>
          </div>
          {onOpenSubscriptionModal && (
            <button
              onClick={onOpenSubscriptionModal}
              className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer border-none shadow-md shadow-primary/20 shrink-0"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade with Paystack</span>
            </button>
          )}
        </div>
      )}

      {/* Generator Controls Bar */}
      <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Region / Currency Global Picker */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5 flex items-center gap-1.5">
              <span>🗺️</span>
              <span>Global Location & Realities</span>
            </label>
            <button
              type="button"
              onClick={() => setIsLocationPickerOpen(true)}
              className="w-full bg-white hover:bg-emerald-50/50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-gray-800 flex items-center justify-between shadow-2xs cursor-pointer transition-all text-left"
            >
              <div className="truncate pr-2">
                <span className="block truncate">{selectedRegion.name}</span>
                <span className="text-[10px] text-emerald-700 font-bold block">{selectedRegion.currency} {selectedRegion.currencyCode || ''}</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black uppercase shrink-0">
                Change 🗺️
              </span>
            </button>
          </div>

          {/* Baby Age Milestone */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5 flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5 text-primary" />
              <span>Developmental Stage</span>
            </label>
            <select
              value={targetAge}
              onChange={(e) => setTargetAge(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-primary shadow-2xs"
            >
              <option value="6 Months">6 Months (First Purees & Mashes)</option>
              <option value="7-8 Months">7-8 Months (Thick Puree & Soft BLW)</option>
              <option value="9-11 Months">9-11 Months (Finger Foods & Chunks)</option>
              <option value="12+ Months">12+ Months (Table Solids & Family Food)</option>
            </select>
          </div>

          {/* Dietary Focus */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span>Dietary Filter</span>
            </label>
            <select
              value={dietaryPreference}
              onChange={(e: any) => setDietaryPreference(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-primary shadow-2xs"
            >
              <option value="all">Balanced All-Round Diet</option>
              <option value="vegetarian">Plant-Based / Vegetarian</option>
              <option value="dairy_free">Dairy-Free Friendly</option>
              <option value="egg_free">Egg-Free Friendly</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGeneratePlan}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg cursor-pointer border-none flex items-center justify-center gap-2 ${
            isGenerating
              ? 'bg-primary/60 text-white cursor-wait'
              : 'bg-primary hover:bg-primary/95 text-white shadow-primary/25 hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Optimizing Nutrition & Localizing Ingredients...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>{planData ? 'Regenerate Age-Optimized Weekly Plan' : 'Generate Full Weekly Plan with AI'}</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-primary/10 text-gray-800 text-xs font-bold flex items-center gap-2 border border-primary/20">
          <AlertCircle className="w-4 h-4 text-primary shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Plan Data Visualization */}
      {planData && (
        <div className="space-y-6">
          {/* Summary Strategy Callout */}
          <div className="bg-primary/5 border border-primary/15 rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <h4 className="font-serif font-black text-gray-800 text-sm">
                Nutrition Strategy for {selectedRegion.name}
              </h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              {planData.summary}
            </p>

            {planData.nutritionalGapsFilled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-primary/10">
                {planData.nutritionalGapsFilled.map((gap: string, idx: number) => (
                  <div key={idx} className="bg-white/80 p-2.5 rounded-xl border border-primary/10 text-[11px] font-medium text-gray-700">
                    {gap}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tab Selector: Meals Schedule / Grocery Shopping List / Local Markets & Map */}
          <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('meals')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'meals' ? 'bg-white text-primary shadow-xs font-black' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>7-Day Meals</span>
            </button>
            <button
              onClick={() => setActiveTab('groceries')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'groceries' ? 'bg-white text-primary shadow-xs font-black' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Grocery List</span>
            </button>
            <button
              onClick={() => setActiveTab('markets')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'markets' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>📍 Local Markets & Map</span>
            </button>
          </div>

          {/* Tab 3: Local Markets & Map View */}
          {activeTab === 'markets' && (
            <LocalMarketMap location={selectedRegion} onLocationChange={setSelectedRegion} />
          )}

          {/* Tab 1: 7-Day Meals View */}
          {activeTab === 'meals' && (
            <div className="space-y-4">
              {/* Day Pills Selector */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {planData.days?.map((d: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveDayIndex(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border-none cursor-pointer ${
                      activeDayIndex === idx
                        ? 'bg-primary text-white shadow-xs scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {d.dayName}
                  </button>
                ))}
              </div>

              {/* Active Day Meal Cards Grid */}
              {currentDay && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Breakfast */}
                  <div className="bg-primary/5 border border-primary/20 rounded-3xl p-4 sm:p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        🌅 Breakfast
                      </span>
                      <span className="text-[9px] font-bold text-gray-500">
                        {currentDay.breakfast?.texture}
                      </span>
                    </div>
                    <h4 className="text-sm font-serif font-black text-gray-800">
                      {currentDay.breakfast?.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {currentDay.breakfast?.description}
                    </p>
                    <div className="text-[10px] font-bold text-primary pt-1">
                      ⭐ Target: {currentDay.breakfast?.keyNutrient}
                    </div>
                  </div>

                  {/* Lunch */}
                  <div className="bg-primary/5 border border-primary/20 rounded-3xl p-4 sm:p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        ☀️ Lunch
                      </span>
                      <span className="text-[9px] font-bold text-gray-500">
                        {currentDay.lunch?.texture}
                      </span>
                    </div>
                    <h4 className="text-sm font-serif font-black text-gray-800">
                      {currentDay.lunch?.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {currentDay.lunch?.description}
                    </p>
                    <div className="text-[10px] font-bold text-primary pt-1">
                      ⭐ Target: {currentDay.lunch?.keyNutrient}
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className="bg-primary/5 border border-primary/20 rounded-3xl p-4 sm:p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        🌙 Dinner
                      </span>
                      <span className="text-[9px] font-bold text-gray-500">
                        {currentDay.dinner?.texture}
                      </span>
                    </div>
                    <h4 className="text-sm font-serif font-black text-gray-800">
                      {currentDay.dinner?.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {currentDay.dinner?.description}
                    </p>
                    <div className="text-[10px] font-bold text-primary pt-1">
                      ⭐ Target: {currentDay.dinner?.keyNutrient}
                    </div>
                  </div>

                  {/* Snack */}
                  <div className="bg-primary/5 border border-primary/20 rounded-3xl p-4 sm:p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        🍎 Healthy Snack
                      </span>
                      <span className="text-[9px] font-bold text-gray-500">
                        {currentDay.snack?.texture}
                      </span>
                    </div>
                    <h4 className="text-sm font-serif font-black text-gray-800">
                      {currentDay.snack?.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {currentDay.snack?.description}
                    </p>
                    <div className="text-[10px] font-bold text-primary pt-1">
                      ⭐ Target: {currentDay.snack?.keyNutrient}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleApplyToGrid}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{applySuccess ? 'Applied to Weekly Planner!' : 'Apply 7-Day Plan to Journal Grid'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Localized Grocery List */}
          {activeTab === 'groceries' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Estimated Weekly Budget</p>
                  <p className="text-xl font-serif font-black text-primary mt-0.5">
                    {planData.currencySymbol}{planData.totalEstBudget} <span className="text-xs font-sans text-gray-400 font-medium">({selectedRegion.currencyCode || selectedRegion.currency})</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyGroceries}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {copySuccess ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copySuccess ? 'Copied!' : 'Copy List'}</span>
                </button>
              </div>

              <div className="space-y-3">
                {planData.groceryAisles?.map((aisle: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span>{aisle.category}</span>
                    </h4>

                    <div className="space-y-2">
                      {aisle.items?.map((item: any, itemIdx: number) => {
                        const isChecked = checkedGroceries.includes(item.name);
                        return (
                          <div
                            key={itemIdx}
                            onClick={() => toggleGroceryItem(item.name)}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                              isChecked
                                ? 'bg-primary/5 border-primary/20 line-through text-gray-400'
                                : 'bg-gray-50/80 border-gray-100 text-gray-800 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                              />
                              <div>
                                <p className="text-xs font-bold">{item.name}</p>
                                <p className="text-[10px] text-gray-500 font-medium">Quantity: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="text-xs font-black text-primary">
                              ~{item.currency}{item.estCost}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Accuracy Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 text-[10px] text-gray-600 leading-relaxed">
            ℹ️ <strong>AI Accuracy Disclaimer:</strong> Nutritional suggestions, menus, and shopping estimates are generated using AI for educational and planning support. Always introduce new foods one at a time, check textures for choking safety, and consult a qualified healthcare provider or dietitian regarding specific dietary needs and allergies.
          </div>
        </div>
      )}
      {/* Global Location Picker Modal */}
      <GlobalLocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        currentLocation={selectedRegion}
        onSelectLocation={(loc) => {
          setSelectedRegion(loc);
        }}
      />
    </div>
  );
};
