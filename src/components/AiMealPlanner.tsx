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
  Lock
} from 'lucide-react';
import { model } from '../firebase';

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

export const REGIONS_LIST = [
  { id: 'ng-ph', name: 'Port Harcourt, Nigeria', country: 'Nigeria', currency: '₦', rateName: 'NGN' },
  { id: 'ng-lagos', name: 'Lagos, Nigeria', country: 'Nigeria', currency: '₦', rateName: 'NGN' },
  { id: 'us-ny', name: 'New York, USA', country: 'United States', currency: '$', rateName: 'USD' },
  { id: 'uk-lon', name: 'London, United Kingdom', country: 'United Kingdom', currency: '£', rateName: 'GBP' },
  { id: 'eu-fr', name: 'Paris, France', country: 'France', currency: '€', rateName: 'EUR' },
  { id: 'eu-de', name: 'Berlin, Germany', country: 'Germany', currency: '€', rateName: 'EUR' },
  { id: 'ca-to', name: 'Toronto, Canada', country: 'Canada', currency: '$', rateName: 'CAD' },
  { id: 'au-syd', name: 'Sydney, Australia', country: 'Australia', currency: '$', rateName: 'AUD' },
  { id: 'in-mum', name: 'Mumbai, India', country: 'India', currency: '₹', rateName: 'INR' },
  { id: 'jp-tyo', name: 'Tokyo, Japan', country: 'Japan', currency: '¥', rateName: 'JPY' }
];

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
  const [selectedRegion, setSelectedRegion] = useState(REGIONS_LIST[0]);
  const [targetAge, setTargetAge] = useState(babyAge || '6 Months');
  const [dietaryPreference, setDietaryPreference] = useState<'all' | 'vegetarian' | 'dairy_free' | 'egg_free'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [planData, setPlanData] = useState<any>(() => {
    const saved = localStorage.getItem('ama_ai_weekly_meal_plan');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'meals' | 'groceries' | 'nutrition'>('meals');
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
      if (!model) throw new Error("Gemini AI model is not configured.");

      const prompt = `
You are an expert baby nutritionist and feeding specialist.
Create a comprehensive 7-Day Weekly Meal Plan and a Localized Grocery Shopping List tailored for a baby with these specific characteristics:

- Baby Name: ${babyName || 'Baby'}
- Developmental Age: ${targetAge}
- Location / Market Region: ${selectedRegion.name} (${selectedRegion.country})
- Local Currency Symbol: "${selectedRegion.currency}" (${selectedRegion.rateName})
- Dietary Preference: ${dietaryPreference}
- Cleared/Safe Allergens: ${clearedAllergens.length > 0 ? clearedAllergens.join(', ') : 'Standard weaning guidelines'}
- Avoid/Suspected Allergic Foods: ${suspectedAllergens.length > 0 ? suspectedAllergens.join(', ') : 'None flagged yet'}

CRITICAL REQUIREMENTS:
1. OPTIMIZE FOR EXACT AGE & TEXTURE:
   - 6-7 months: Smooth single or two-ingredient purees, soft mashes.
   - 8-9 months: Thicker chunky purees, soft finger foods, soft steamed batons.
   - 10-12+ months: Bite-sized table solids, soft chopped foods, varied family-style textures.
2. NUTRITIONAL GAPS TO TARGET:
   - Emphasize high-iron pairings (lentils, fortified oats, spinach, egg yolks, beans, steamed fish, sweet potato with Vitamin C fruits).
   - Healthy fats & brain-building Omega-3 (avocado, olive oil, ground seeds, fish, nut butters if cleared).
   - Calcium & Vitamin D for dental/bone growth.
3. LOCALIZED GROCERY INGREDIENTS:
   - Use locally authentic, readily available produce in ${selectedRegion.name} (e.g. for Nigeria: sweet potatoes, plantain, crayfish, ugu/fluted pumpkin leaves, tom brown, beans; for Western regions: squash, avocado, oats, pears; for Asia: rice okayu, kabocha, tai fish).
   - Estimate realistic localized prices for pack sizes in "${selectedRegion.currency}".

Return ONLY valid JSON (no surrounding markdown code fences, raw JSON only) matching this exact JSON schema:
{
  "summary": "Short 2-sentence summary of the age-based nutritional strategy and localized ingredient focus.",
  "nutritionalGapsFilled": [
    "High Iron: Paired iron-rich legumes with sweet vitamin-C fruits for optimal absorption.",
    "Healthy Brain Fats: Included localized avocado and healthy oils for neural development.",
    "Gentle Gut Fiber: Soluble fibers to support smooth digestion."
  ],
  "days": [
    {
      "dayName": "Monday",
      "breakfast": {
        "title": "Recipe Title",
        "description": "Short texture & prep note",
        "keyNutrient": "Iron & Vitamin C",
        "texture": "Smooth Puree"
      },
      "lunch": {
        "title": "Recipe Title",
        "description": "Short texture & prep note",
        "keyNutrient": "Protein & Zinc",
        "texture": "Soft Mash"
      },
      "dinner": {
        "title": "Recipe Title",
        "description": "Short texture & prep note",
        "keyNutrient": "Calcium & Healthy Fats",
        "texture": "Smooth Puree"
      },
      "snack": {
        "title": "Recipe Title",
        "description": "Finger food or fruit snack",
        "keyNutrient": "Vitamin A",
        "texture": "Soft Baton"
      }
    }
    // Repeat for Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday (all 7 days)
  ],
  "groceryAisles": [
    {
      "category": "Fresh Produce",
      "items": [
        { "name": "Organic Sweet Potatoes", "quantity": "3 medium", "estCost": 1500, "currency": "${selectedRegion.currency}" }
      ]
    },
    {
      "category": "Proteins & Legumes",
      "items": [
        { "name": "Soft Brown Beans / Lentils", "quantity": "500g pack", "estCost": 1200, "currency": "${selectedRegion.currency}" }
      ]
    },
    {
      "category": "Grains & Cereals",
      "items": [
        { "name": "Rolled Baby Oats", "quantity": "1 box", "estCost": 2000, "currency": "${selectedRegion.currency}" }
      ]
    },
    {
      "category": "Healthy Fats & Dairy",
      "items": [
        { "name": "Ripe Avocados", "quantity": "2 pieces", "estCost": 800, "currency": "${selectedRegion.currency}" }
      ]
    }
  ],
  "totalEstBudget": 5500,
  "currencySymbol": "${selectedRegion.currency}"
}
`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text() || '';
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      setPlanData(parsed);
      localStorage.setItem('ama_ai_weekly_meal_plan', JSON.stringify(parsed));
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
          {/* Region / Currency */}
          <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>Location & Currency</span>
            </label>
            <select
              value={selectedRegion.id}
              onChange={(e) => {
                const found = REGIONS_LIST.find(r => r.id === e.target.value);
                if (found) setSelectedRegion(found);
              }}
              className="w-full bg-white border border-gray-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-primary shadow-2xs"
            >
              {REGIONS_LIST.map(reg => (
                <option key={reg.id} value={reg.id}>
                  {reg.name} ({reg.currency} {reg.rateName})
                </option>
              ))}
            </select>
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

          {/* Tab Selector: Meals Schedule / Grocery Shopping List */}
          <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('meals')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'meals' ? 'bg-white text-primary shadow-xs font-black' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>7-Day Meal Schedule</span>
            </button>
            <button
              onClick={() => setActiveTab('groceries')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'groceries' ? 'bg-white text-primary shadow-xs font-black' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Localized Grocery List ({planData.currencySymbol}{planData.totalEstBudget})</span>
            </button>
          </div>

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
                    {planData.currencySymbol}{planData.totalEstBudget} <span className="text-xs font-sans text-gray-400 font-medium">({selectedRegion.rateName})</span>
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
    </div>
  );
};
