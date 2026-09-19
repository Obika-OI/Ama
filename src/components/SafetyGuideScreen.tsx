import React, { useState } from 'react';
import { 
  Shield, Search, ChevronRight, AlertTriangle, CheckCircle2, ArrowLeft,
  Info, Sparkles, BookOpen, Heart, Filter, ThumbsUp, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COMMON_INGREDIENTS } from '../constants/babyData';

export const SafetyGuideScreen = ({
  onBack,
  onNavigate,
  isPremium = false,
  onOpenSubscriptionModal
}: {
  onBack?: () => void;
  onNavigate?: (screen: string) => void;
  isPremium?: boolean;
  onOpenSubscriptionModal?: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [guideFilter, setGuideFilter] = useState<'all' | 'green' | 'amber' | 'red'>('all');
  const [selectedFood, setSelectedFood] = useState<any>(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate('feeding');
    }
  };

  const filteredFoods = COMMON_INGREDIENTS.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (food.category && food.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (food.warning && food.warning.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = guideFilter === 'all' || food.color === guideFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-32 space-y-8 bg-background min-h-screen text-left">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="p-2.5 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 shadow-xs cursor-pointer text-gray-600 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-wider mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Infant Care Safety Standard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-800">
              Baby Food & Ingredient Safety Guide
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Evidence-based nutritional preparation, choking hazard modifications, and allergen introduction by age.
            </p>
          </div>
        </div>
      </header>

      {/* Quick Principles Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-[28px] border border-white shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            🟢
          </div>
          <h3 className="font-bold text-gray-800 text-sm">Safe & Encouraged</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Nutrient-dense single-ingredient whole foods prepared to match your baby's grasp and chewing development.
          </p>
        </div>

        <div className="bg-card p-5 rounded-[28px] border border-white shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg">
            🟡
          </div>
          <h3 className="font-bold text-gray-800 text-sm">Modify Shape & Texture</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Round, firm, or sticky items that require quartering, steaming, mashing, or thinning before serving.
          </p>
        </div>

        <div className="bg-card p-5 rounded-[28px] border border-white shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-lg">
            🔴
          </div>
          <h3 className="font-bold text-gray-800 text-sm">Strict Avoidance &lt;12m</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Honey (botulism danger), whole nuts/popcorn (choking), cow's milk as drink, and added salt/sugar.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-card p-4 sm:p-6 rounded-[32px] border border-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 border border-gray-100 shadow-xs">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input 
              type="text"
              placeholder="Search ingredient (e.g., Avocado, Honey, Eggs, Grapes)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-sm font-medium outline-none text-gray-700"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto py-1">
            {[
              { id: 'all', label: 'All Items', count: COMMON_INGREDIENTS.length },
              { id: 'green', label: 'Safe Foods', count: COMMON_INGREDIENTS.filter(f => f.color === 'green').length },
              { id: 'amber', label: 'Caution / Modify', count: COMMON_INGREDIENTS.filter(f => f.color === 'amber').length },
              { id: 'red', label: 'Avoid <12m', count: COMMON_INGREDIENTS.filter(f => f.color === 'red').length },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setGuideFilter(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                  guideFilter === tab.id
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Ingredient Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.map(food => (
          <motion.div
            key={food.id}
            whileHover={{ y: -2 }}
            onClick={() => setSelectedFood(food)}
            className={`p-5 rounded-[28px] border bg-card shadow-sm cursor-pointer transition-all flex flex-col justify-between gap-4 ${
              selectedFood?.id === food.id ? 'ring-2 ring-primary border-primary' : 'border-white hover:border-primary/20'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{food.icon || '🥑'}</span>
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">{food.name}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      food.color === 'green' ? 'bg-primary/10 text-primary' :
                      food.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {food.category || (food.color === 'green' ? 'Safe First Food' : food.color === 'amber' ? 'Modify Shape' : 'Avoid <12m')}
                    </span>
                  </div>
                </div>
                <span className={`w-3 h-3 rounded-full ${
                  food.color === 'green' ? 'bg-primary' :
                  food.color === 'amber' ? 'bg-amber-400' : 'bg-rose-500'
                }`} />
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {food.warning}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-primary pt-2 border-t border-gray-50">
              <span>View Age Prep Matrix</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Food Detail Card / In-Page Reader */}
      {selectedFood && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 sm:p-8 rounded-[36px] border border-primary/20 shadow-xl shadow-card/30 space-y-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{selectedFood.icon || '🥣'}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-serif font-black text-gray-800">{selectedFood.name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedFood.color === 'green' ? 'bg-primary/10 text-primary' :
                    selectedFood.color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {selectedFood.color === 'green' ? 'Safe' : selectedFood.color === 'amber' ? 'Caution' : 'Avoid < 12m'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{selectedFood.warning}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedFood(null)}
              className="text-xs text-gray-400 hover:text-gray-600 font-bold px-3 py-1.5 rounded-full bg-white border border-gray-100 shadow-xs"
            >
              Close Detail
            </button>
          </div>

          {/* Age-by-Age Preparation Stages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">6 - 9 Months</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">Early Solids</span>
              </div>
              <p className="text-sm font-medium text-gray-700 leading-relaxed">{selectedFood.prep6m}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">9 - 12 Months</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">Finger Foods</span>
              </div>
              <p className="text-sm font-medium text-gray-700 leading-relaxed">{selectedFood.prep10m}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">12+ Months</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">Toddler Diet</span>
              </div>
              <p className="text-sm font-medium text-gray-700 leading-relaxed">{selectedFood.prep12m}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Infant Guidance Disclaimer */}
      <div className="bg-card p-6 rounded-[28px] border border-white text-xs text-gray-500 leading-relaxed space-y-2">
        <div className="flex items-center gap-2 font-bold text-gray-700">
          <Info className="w-4 h-4 text-primary" />
          <span>Evidence-Based Infant Weaning Notice</span>
        </div>
        <p>
          Always supervise your child while eating and ensure they are seated upright in a high chair. Introduce one new single-ingredient food every 2-3 days to monitor for potential allergic reactions. For medical concerns or chronic symptoms, consult a qualified healthcare provider immediately.
        </p>
      </div>
    </div>
  );
};
