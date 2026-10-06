import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, Plus, Clock, Star, Heart, Flame, Shield, Info, Edit3, Trash2, MapPin, AlertCircle, PlusCircle, Globe, Loader2, Sparkles, Utensils, CheckCircle2, ChevronDown, ChevronUp, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_MEALS, THEME } from '../constants';
import { Meal } from '../types';
import { formatCost } from '../utils/helpers';
import { GlobalLocation, GlobalLocationPickerModal, POPULAR_GLOBAL_LOCATIONS } from './GlobalLocationPickerModal';

interface LocalSuggestedRecipe {
  id: string;
  title: string;
  stage: string;
  prepTime: string;
  ingredients: string[];
  instructions: string[];
  whyHealthy: string;
  estCost: string;
}

export const RecipeLibrary = ({ onNavigate, personalRecipes }: { onNavigate: (screen: string, data?: any, autoOpenLog?: boolean) => void; personalRecipes: Meal[] }) => {
  const [globalLoc, setGlobalLoc] = useState<GlobalLocation>(() => {
    const saved = localStorage.getItem('ama_global_location');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return POPULAR_GLOBAL_LOCATIONS[0];
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [worldSearchResults, setWorldSearchResults] = useState<GlobalLocation[]>([]);
  const [isSearchingWorld, setIsSearchingWorld] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [, setLocationSuggestions] = useState<string[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<LocalSuggestedRecipe[]>([]);
  const [, setSelectedRecipeDetail] = useState<LocalSuggestedRecipe | null>(null);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [localSalesInfo, setLocalSalesInfo] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loggedToast, setLoggedToast] = useState('');
  const [speakingRecipeId, setSpeakingRecipeId] = useState<string | null>(null);

  // Audio Speech synthesis for low-literacy parents to listen to cooking steps
  const speakRecipe = (recipe: LocalSuggestedRecipe) => {
    if ('speechSynthesis' in window) {
      if (speakingRecipeId === recipe.id) {
        window.speechSynthesis.cancel();
        setSpeakingRecipeId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const textToRead = `${recipe.title}. Suitable for ${recipe.stage}. Ingredients: ${recipe.ingredients.join(', ')}. Instructions: ${recipe.instructions.join('. ')}. Health benefits: ${recipe.whyHealthy}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setSpeakingRecipeId(recipe.id);
      utterance.onend = () => setSpeakingRecipeId(null);
      utterance.onerror = () => setSpeakingRecipeId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fetch local realities whenever globalLoc changes
  useEffect(() => {
    fetchRealitiesForLocation(globalLoc);
  }, [globalLoc]);

  // Debounced entire world cities search using Google Geocoding API
  useEffect(() => {
    if (!dropdownSearch.trim()) {
      setWorldSearchResults([]);
      return;
    }
    if (dropdownSearch.trim().length < 2) return;

    const delay = setTimeout(async () => {
      setIsSearchingWorld(true);
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(dropdownSearch)}&key=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          const formatted: GlobalLocation[] = data.results.map((r: any) => {
            const addressComp = r.address_components || [];
            let city = '';
            let country = '';
            addressComp.forEach((c: any) => {
              if (c.types.includes('locality') || c.types.includes('administrative_area_level_2')) city = c.long_name;
              if (c.types.includes('country')) country = c.long_name;
            });
            const locName = city ? `${city}, ${country}` : r.formatted_address.split(',').slice(-2).join(', ').trim();
            const lat = r.geometry.location.lat;
            const lng = r.geometry.location.lng;

            return {
              name: locName || r.formatted_address,
              lat,
              lng,
              country: country || 'Global',
              currency: country.toLowerCase().includes('nigeria') ? '₦' : country.toLowerCase().includes('ghana') ? 'GH₵' : country.toLowerCase().includes('kenya') ? 'KSh' : '$',
              currencyCode: country.toLowerCase().includes('nigeria') ? 'NGN' : country.toLowerCase().includes('ghana') ? 'GHS' : country.toLowerCase().includes('kenya') ? 'KES' : 'USD',
              flag: country.toLowerCase().includes('nigeria') ? '🇳🇬' : country.toLowerCase().includes('ghana') ? '🇬🇭' : country.toLowerCase().includes('kenya') ? '🇰🇪' : country.toLowerCase().includes('united kingdom') ? '🇬🇧' : country.toLowerCase().includes('united states') ? '🇺🇸' : '🌍'
            };
          });
          setWorldSearchResults(formatted);
        }
      } catch (err) {
        console.warn("Geocoding world search error:", err);
      } finally {
        setIsSearchingWorld(false);
      }
    }, 450);

    return () => clearTimeout(delay);
  }, [dropdownSearch]);

  const fetchRealitiesForLocation = async (loc: GlobalLocation) => {
    setIsLoadingLocation(true);
    try {
      const res = await fetch('/api/ai/location-realities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: loc.name,
          lat: loc.lat,
          lng: loc.lng,
          country: loc.country
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.suggestedLocalRecipes && Array.isArray(data.suggestedLocalRecipes) && data.suggestedLocalRecipes.length > 0) {
          setSuggestedRecipes(data.suggestedLocalRecipes);
        } else {
          setSuggestedRecipes(getFallbackLocalRecipes(loc));
        }

        if (data.popularWeaningStaples && Array.isArray(data.popularWeaningStaples)) {
          const formatted = data.popularWeaningStaples.map((s: any) => 
            typeof s === 'string' ? `🌱 ${s}` : `🌱 ${s.name} - ${s.localContext || 'Nutrient-dense weaning staple.'}`
          );
          setLocationSuggestions(formatted);
        }
        if (data.moqSalesTypes) {
          setLocalSalesInfo(data.moqSalesTypes);
        }
      } else {
        fallbackSuggestions(loc);
      }
    } catch (e) {
      fallbackSuggestions(loc);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const getFallbackLocalRecipes = (loc: GlobalLocation): LocalSuggestedRecipe[] => {
    const isAfrica = loc.country.toLowerCase().includes('nigeria') || loc.country.toLowerCase().includes('ghana') || loc.country.toLowerCase().includes('kenya') || loc.country.toLowerCase().includes('south africa') || loc.name.toLowerCase().includes('port') || loc.name.toLowerCase().includes('lagos');
    const isUK = loc.country.toLowerCase().includes('united kingdom') || loc.country.toLowerCase().includes('uk') || loc.name.toLowerCase().includes('london');
    const curr = loc.currency || '₦';

    if (isAfrica) {
      return [
        {
          id: 'rec-ng-1',
          title: 'Roasted Tom Brown Energy Porridge',
          stage: 'Purees (6m+)',
          prepTime: '10 mins',
          ingredients: ['2 tbsp Tom Brown flour (millet, sorghum, soybean blend)', '1 cup clean water', '2 tbsp breastmilk or formula'],
          instructions: [
            'Mix Tom Brown flour in 3 tbsp cold water to make a smooth paste.',
            'Bring remaining water to a gentle boil in a small pot.',
            'Whisk in the paste and simmer on low heat for 4-5 minutes until thick and glossy.',
            'Let cool to warm temperature and stir in milk before feeding baby.'
          ],
          whyHealthy: 'High in bioavailable plant protein, iron, and slow-burning energy. Requires zero refrigeration to store powder.',
          estCost: `${curr}250 per bowl`
        },
        {
          id: 'rec-ng-2',
          title: 'Creamy Sweet Potato & Ground Crayfish Puree',
          stage: 'Purees (6m+)',
          prepTime: '15 mins',
          ingredients: ['1 small orange sweet potato', '1 tsp fine ground crayfish', 'Warm water or breastmilk'],
          instructions: [
            'Peel sweet potato, cut into small cubes, and boil/steam until very tender.',
            'Mash smoothly with a fork or clean wooden spoon.',
            'Stir in ground crayfish for natural ocean DHA and savory taste.',
            'Thin with warm water or breastmilk to a velvety consistency.'
          ],
          whyHealthy: 'Rich in beta-carotene (Vitamin A for strong eyesight) and heme iron from local dried crayfish.',
          estCost: `${curr}300 per bowl`
        },
        {
          id: 'rec-ng-3',
          title: 'Steamed Ripe Plantain & Egg Yolk Mash',
          stage: 'Soft Solids (8m+)',
          prepTime: '15 mins',
          ingredients: ['Half ripe yellow plantain', '1 hard-boiled egg yolk', '1 tsp warm water'],
          instructions: [
            'Peel and steam sliced yellow plantain for 10 minutes until golden and soft.',
            'Place plantain and boiled egg yolk in a bowl and mash thoroughly.',
            'Add 1 tsp warm water to create a soft, melt-in-mouth texture.'
          ],
          whyHealthy: 'High in potassium, gut-friendly fiber, and choline for rapid brain development.',
          estCost: `${curr}350 per bowl`
        },
        {
          id: 'rec-ng-4',
          title: 'Tender Steamed Fish & Brown Bean Moi Moi',
          stage: 'Soft Solids (8m+)',
          prepTime: '25 mins',
          ingredients: ['1 cup brown bean paste', '2 tbsp flaked white fish', '1 drop red palm oil'],
          instructions: [
            'Blend soaked peeled brown beans into a smooth batter.',
            'Fold in flaked cooked white fish and a drop of palm oil.',
            'Pour into small heat-safe bowls and steam over boiling water for 20 minutes.'
          ],
          whyHealthy: 'Powerhouse of clean protein, natural Vitamin E, and omega fatty acids.',
          estCost: `${curr}400 per bowl`
        }
      ];
    } else if (isUK) {
      return [
        {
          id: 'rec-uk-1',
          title: 'Warm Porridge Oats with Stewed Pear',
          stage: 'Purees (6m+)',
          prepTime: '10 mins',
          ingredients: ['3 tbsp baby rolled oats', 'Half ripe pear (peeled & chopped)', '100ml warm water or whole milk'],
          instructions: [
            'Simmer chopped pear in 2 tbsp water for 5 minutes until soft, then mash.',
            'Cook rolled oats in milk/water for 4 minutes until creamy.',
            'Swirl the stewed pear into the warm porridge.'
          ],
          whyHealthy: 'Gentle soluble fiber (beta-glucan) that supports smooth digestion and gut immunity.',
          estCost: `${curr}0.65 per bowl`
        },
        {
          id: 'rec-uk-2',
          title: 'Steamed Broccoli, Carrot & Sweet Potato Mash',
          stage: 'Soft Solids (8m+)',
          prepTime: '15 mins',
          ingredients: ['1 small sweet potato', '2 broccoli florets', 'Half carrot'],
          instructions: [
            'Steam all vegetables in a pot steamer for 12 minutes.',
            'Mash with a fork leaving tiny soft textures for chewing practice.',
            'Add a drop of olive oil for essential fats.'
          ],
          whyHealthy: 'Loaded with Vitamin C, folate, and beta-carotene for immune health.',
          estCost: `${curr}0.80 per bowl`
        }
      ];
    } else {
      return [
        {
          id: 'rec-us-1',
          title: 'Silky Avocado & Banana Brain Puree',
          stage: 'Purees (6m+)',
          prepTime: '5 mins',
          ingredients: ['Half ripe avocado', 'Half ripe banana', '2 tbsp breastmilk or formula'],
          instructions: [
            'Scoop avocado flesh and ripe banana into a clean bowl.',
            'Mash with a fork until creamy and lump-free.',
            'Thin with breastmilk or formula to desired texture. No cooking required!'
          ],
          whyHealthy: 'Rich in brain-building monounsaturated fats and potassium.',
          estCost: `${curr}0.95 per bowl`
        },
        {
          id: 'rec-us-2',
          title: 'Baked Sweet Potato & Spinach Puree',
          stage: 'Purees (6m+)',
          prepTime: '15 mins',
          ingredients: ['1 small sweet potato', 'Handful baby spinach', '1 tsp olive oil'],
          instructions: [
            'Steam sweet potato and wilt spinach in the steam for 1 minute.',
            'Mash together with olive oil until smooth.'
          ],
          whyHealthy: 'Abundant non-heme iron and Vitamin A for healthy growth.',
          estCost: `${curr}1.10 per bowl`
        }
      ];
    }
  };

  const fallbackSuggestions = (loc: GlobalLocation) => {
    setSuggestedRecipes(getFallbackLocalRecipes(loc));
    const locLower = loc.name.toLowerCase();
    if (locLower.includes('nigeria') || locLower.includes('port') || locLower.includes('lagos')) {
      setLocationSuggestions([
        "🌿 Creamy Plantain and Carrot Mash - Natural sweetness, gentle energy, and beta-carotene.",
        "🥔 Rich Tom Brown Cereal - High-protein flour blend of roasted millet, sorghum, and soybeans.",
        "🍎 Soft Bean Puree - Plant protein and gentle fiber for infant development.",
        "🥕 Steamed Fish & Crayfish Moi Moi - Brain-boosting DHA and bioavailable iron."
      ]);
      setLocalSalesInfo("Available in open-air markets (mudu / paint bucket measures) & neighborhood retail packs.");
    } else {
      setLocationSuggestions([
        "🥑 Avocado and Banana Puree - Healthy brain-building monounsaturated fats.",
        "🥔 Baked Sweet Potato & Spinach Puree - Rich in Vitamin A and minerals.",
        "🥣 Baby Rolled Oats with Steamed Apple - Soluble gentle fiber for digestive comfort."
      ]);
      setLocalSalesInfo("Local fresh produce markets and grocery stores.");
    }
  };

  const handleSelectLocation = (loc: GlobalLocation) => {
    setGlobalLoc(loc);
    localStorage.setItem('ama_global_location', JSON.stringify(loc));
  };

  const handleInlineGps = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocatingGps(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        
        let foundName = 'My Local Community';
        let country = 'My Location';
        let currency = '$';
        let currencyCode = 'USD';
        let flag = '📍';

        // Check closest popular location to resolve friendly name
        let closest = POPULAR_GLOBAL_LOCATIONS[0];
        let minDist = Infinity;
        POPULAR_GLOBAL_LOCATIONS.forEach(p => {
          const d = Math.pow(p.lat - lat, 2) + Math.pow(p.lng - lng, 2);
          if (d < minDist) {
            minDist = d;
            closest = p;
          }
        });

        if (minDist < 0.2) {
          foundName = closest.name;
          country = closest.country;
          currency = closest.currency;
          currencyCode = closest.currencyCode || 'USD';
          flag = closest.flag || '📍';
        } else {
          try {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
            if (apiKey) {
              const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
              const res = await fetch(url);
              const data = await res.json();
              if (data.results && data.results[0]) {
                const addressComp = data.results[0].address_components || [];
                let city = '';
                let countryName = '';
                addressComp.forEach((c: any) => {
                  if (c.types.includes('locality') || c.types.includes('administrative_area_level_2')) city = c.long_name;
                  if (c.types.includes('country')) countryName = c.long_name;
                });
                foundName = city ? `${city}, ${countryName}` : data.results[0].formatted_address.split(',').slice(-2).join(', ').trim();
                country = countryName || 'Global';
                currency = country.toLowerCase().includes('nigeria') ? '₦' : country.toLowerCase().includes('ghana') ? 'GH₵' : country.toLowerCase().includes('kenya') ? 'KSh' : country.toLowerCase().includes('uk') ? '£' : '$';
                currencyCode = country.toLowerCase().includes('nigeria') ? 'NGN' : country.toLowerCase().includes('ghana') ? 'GHS' : country.toLowerCase().includes('kenya') ? 'KES' : country.toLowerCase().includes('uk') ? 'GBP' : 'USD';
                flag = country.toLowerCase().includes('nigeria') ? '🇳🇬' : country.toLowerCase().includes('ghana') ? '🇬🇭' : country.toLowerCase().includes('kenya') ? '🇰🇪' : country.toLowerCase().includes('uk') ? '🇬🇧' : country.toLowerCase().includes('united states') ? '🇺🇸' : '📍';
              }
            } else {
              foundName = closest.name;
              country = closest.country;
              currency = closest.currency;
              currencyCode = closest.currencyCode || 'USD';
              flag = closest.flag || '📍';
            }
          } catch (err) {
            console.warn("GPS reverse geocoding in inline GPS failed:", err);
            foundName = closest.name;
            country = closest.country;
            currency = closest.currency;
            currencyCode = closest.currencyCode || 'USD';
            flag = closest.flag || '📍';
          }
        }

        const newLoc: GlobalLocation = {
          name: foundName,
          lat,
          lng,
          country,
          currency,
          currencyCode,
          flag
        };
        handleSelectLocation(newLoc);
        setIsLocatingGps(false);
        setIsDropdownOpen(false);
      },
      (err) => {
        setIsLocatingGps(false);
        setGpsError("Please allow GPS access or search using the dropdown.");
      },
      { timeout: 10000 }
    );
  };

  const handleLogLocalRecipe = (recipe: LocalSuggestedRecipe) => {
    onNavigate('meal-tracker', {
      mealName: recipe.title,
      type: 'Solids',
      texture: recipe.stage.includes('Puree') ? 'Smooth Puree' : 'Soft Mash',
      notes: `Cooked using local staples: ${recipe.ingredients.join(', ')}. ${recipe.whyHealthy}`
    }, true);
    setLoggedToast(`✅ Logged "${recipe.title}" into baby's meal journal!`);
    setTimeout(() => setLoggedToast(''), 4000);
  };

  const allMeals = [...MOCK_MEALS, ...personalRecipes];
  const filteredMeals = activeCategory === 'All' 
    ? allMeals 
    : allMeals.filter(meal => meal.stage.toLowerCase().includes(activeCategory.toLowerCase().replace(/s$/, '')) || (activeCategory === 'Snacks' && meal.stage.toLowerCase().includes('snack')));

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 pb-32 space-y-8 bg-background min-h-screen text-left">
      <header className="flex justify-between items-center pt-3 sm:pt-4 pb-2 px-1">
        <div>
          <h1 className="text-2xl font-serif font-black text-gray-800">Recipe Library</h1>
          <p className="text-xs text-gray-500 font-medium">Culturally authentic weaning foods & local ingredients</p>
        </div>
        <button 
          onClick={() => onNavigate('add-recipe')}
          className="w-11 h-11 rounded-full bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center cursor-pointer border-none hover:scale-105 transition-transform"
          title="Add Custom Family Recipe"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {loggedToast && (
        <div className="p-4 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{loggedToast}</span>
        </div>
      )}

      {/* Global Location & Local Market Realities Grounding Card */}
      <div className="bg-white p-5 rounded-[36px] shadow-sm border border-gray-100 space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block">
              Google Maps Grounded • Local Market Realities
            </p>
          </div>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {globalLoc.currency} {globalLoc.currencyCode || ''}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-emerald-50/60 p-4 rounded-3xl border border-emerald-100">
          <div className="flex items-center gap-2 text-left">
            <span className="text-2xl shrink-0">{globalLoc.flag || '📍'}</span>
            <div className="min-w-0">
              <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-800 block">Active Grounded Town:</span>
              <h3 className="text-sm font-serif font-black text-gray-900 truncate">
                {globalLoc.name}
              </h3>
            </div>
          </div>

          {/* Interactive Composite Location Control bar - Completely responsive and non-truncating */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 flex-1 sm:flex-initial relative w-full sm:w-auto">
            {/* Inline search dropdown selector - wider/longer and responsive */}
            <div className="relative flex-1 sm:w-[32rem] min-w-0">
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setDropdownSearch('');
                  setWorldSearchResults([]);
                }}
                className="w-full px-4 py-2.5 bg-white border-2 border-emerald-100 rounded-xl text-xs font-black text-gray-800 flex items-center justify-between shadow-2xs cursor-pointer hover:border-emerald-400 transition-colors"
              >
                <span className="truncate text-left block flex-1 mr-2">{globalLoc.name}</span>
                <ChevronDown className="w-4 h-4 text-emerald-600 shrink-0" />
              </button>

              {/* Inline drop-down search list overlay */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-gray-150 rounded-2xl shadow-xl p-2.5 space-y-2 max-h-72 overflow-y-auto"
                  >
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Type any city, town, or village on Earth..."
                        value={dropdownSearch}
                        onChange={(e) => setDropdownSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 outline-none focus:border-emerald-500"
                        autoFocus
                      />
                    </div>

                    {isSearchingWorld && (
                      <div className="py-2 text-center text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching entire world's database...</span>
                      </div>
                    )}

                    <div className="space-y-0.5">
                      {dropdownSearch.trim().length >= 2 ? (
                        worldSearchResults.length > 0 ? (
                          worldSearchResults.map((preset, idx) => (
                            <button
                              key={`world-${idx}`}
                              type="button"
                              onClick={() => {
                                handleSelectLocation(preset);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full px-2.5 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-emerald-50 rounded-lg flex items-center justify-between transition-colors border-none cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span>{preset.flag || '🌍'}</span>
                                <span className="truncate">{preset.name}</span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">{preset.currencyCode}</span>
                            </button>
                          ))
                        ) : (
                          !isSearchingWorld && (
                            <div className="py-2 text-center text-[10px] text-gray-400 font-bold">
                              No matching world cities found
                            </div>
                          )
                        )
                      ) : (
                        POPULAR_GLOBAL_LOCATIONS.filter(l =>
                          l.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
                          l.country.toLowerCase().includes(dropdownSearch.toLowerCase())
                        ).map((preset, idx) => (
                          <button
                            key={`preset-${idx}`}
                            type="button"
                            onClick={() => {
                              handleSelectLocation(preset);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-2.5 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-emerald-50 rounded-lg flex items-center justify-between transition-colors border-none cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span>{preset.flag || '📍'}</span>
                              <span className="truncate">{preset.name}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">{preset.currencyCode}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Buttons row for GPS and Map modal triggers - side-by-side on mobile, no layout overflow */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Reduced Find This Place (GPS) Button - compact, never cut off */}
              <button
                type="button"
                onClick={handleInlineGps}
                disabled={isLocatingGps}
                className={`px-3 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1 cursor-pointer shadow-2xs border transition-all shrink-0 active:scale-95 ${
                  isLocatingGps 
                    ? 'bg-amber-50 border-amber-300 text-amber-800 animate-pulse'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                }`}
                title="Find My Location Automatically (GPS)"
              >
                {isLocatingGps ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                ) : (
                  <span>🎯</span>
                )}
                <span>{isLocatingGps ? "Locating" : "GPS"}</span>
              </button>

              {/* 🗺️ Map Button with Map icon */}
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="w-10 h-10 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 flex items-center justify-center shadow-2xs cursor-pointer active:scale-95 shrink-0"
                title="Open Interactive Map to Pin Any Location"
              >
                <span className="text-xl">🗺️</span>
              </button>
            </div>
          </div>
        </div>

        {gpsError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs text-amber-950 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}

        {localSalesInfo && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-gray-100 text-[11px] text-gray-600 flex items-start gap-2">
            <span className="text-base">🏷️</span>
            <div>
              <strong className="text-gray-800 block text-[10px] uppercase tracking-wider">Local Sales Units & Packaging:</strong>
              <span>{localSalesInfo}</span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🍲 ACTIONABLE SUGGESTED RECIPES (Made with Locally Available Foods)       */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-emerald-50/80 border-2 border-emerald-200/90 p-5 sm:p-7 rounded-[40px] space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍲</span>
              <h2 className="text-base sm:text-lg font-serif font-black text-gray-900">
                Suggested Recipes for {globalLoc.name.split(',')[0]}
              </h2>
            </div>
            <p className="text-xs text-gray-600">
              Nutritious, affordable baby meals you can cook right now with what is sold in local markets
            </p>
          </div>

          {isLoadingLocation && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-white px-3 py-1 rounded-full border border-emerald-200 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Calibrating local market foods...</span>
            </div>
          )}
        </div>

        {/* Suggested Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestedRecipes.map((recipe) => {
            const isExpanded = expandedRecipeId === recipe.id;
            return (
              <div 
                key={recipe.id}
                className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-all text-left"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                      {recipe.stage}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {recipe.estCost}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-black text-gray-900 leading-snug">
                    {recipe.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Prep: {recipe.prepTime}</span>
                  </div>

                  {/* Ingredients needed */}
                  <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-emerald-600" />
                      <span>Local Ingredients Needed:</span>
                    </p>
                    <ul className="text-xs text-gray-700 space-y-0.5 pl-1">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[11px] text-gray-600 leading-relaxed italic">
                    💡 <strong className="text-gray-700 not-italic font-bold">Why it's healthy:</strong> {recipe.whyHealthy}
                  </p>

                  {/* Expandable Step-by-Step Cooking Guide */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-800">
                        Easy Step-by-Step Method:
                      </p>
                      <ol className="text-xs text-gray-700 space-y-1.5 pl-4 list-decimal">
                        {recipe.instructions.map((step, idx) => (
                          <li key={idx} className="leading-snug">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => speakRecipe(recipe)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      speakingRecipeId === recipe.id
                        ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                    title={speakingRecipeId === recipe.id ? "Stop reading" : "Listen to recipe aloud"}
                  >
                    {speakingRecipeId === recipe.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span className="text-[11px] font-bold hidden sm:inline">{speakingRecipeId === recipe.id ? "Stop" : "Listen"}</span>
                  </button>

                  <button
                    onClick={() => setExpandedRecipeId(isExpanded ? null : recipe.id)}
                    className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-gray-200 flex items-center justify-center gap-1"
                  >
                    <span>{isExpanded ? 'Hide Steps' : 'Cooking Steps'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleLogLocalRecipe(recipe)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none shadow-xs flex items-center justify-center gap-1 active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Log Meal</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {['All', 'Purees', 'Solids', 'Finger Foods', 'Snacks'].map((cat) => (
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

      {/* Global Location Picker Modal */}
      <GlobalLocationPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        currentLocation={globalLoc}
        onSelectLocation={handleSelectLocation}
      />

      {/* Standard Nutritious Favorites Library */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 text-left">Nutritious Favorites Library</h2>
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
                  {formatCost(meal.costPerServe || '$0.45', globalLoc.currency)} / Serve
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{meal.stage}</p>
                    <h3 className="text-xl font-bold text-gray-800">{meal.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-muted">
                    <Clock className="w-3.5 h-3.5" />
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


