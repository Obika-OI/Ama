import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Plus, Filter, Heart, Compass, Globe, BookOpen, ChevronLeft,
  CheckCircle2, X, Volume2, User, Tag, ArrowUpDown, RotateCcw, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_GLOBAL_BABY_NAMES, BabyNameEntry } from '../constants/babyNamesData';
import { useSEO } from '../utils/seo';

interface BabyNameDatabaseScreenProps {
  onBack: () => void;
  parentName?: string;
  userLocation?: string;
  embedded?: boolean;
  initialOriginFilter?: string;
  initialSearchQuery?: string;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const MEANING_SIGNIFICANCE_THEMES = [
  'All',
  'Blessing',
  'Gift',
  'Peace',
  'Joy',
  'Light',
  'Strength',
  'Wisdom',
  'Love',
  'Royalty',
  'Faith',
  'Grace',
  'Victory'
];

export const BabyNameDatabaseScreen: React.FC<BabyNameDatabaseScreenProps> = ({
  onBack,
  parentName = 'Parent',
  userLocation = '',
  embedded = false,
  initialOriginFilter = 'All',
  initialSearchQuery = ''
}) => {
  useSEO({
    title: 'Global Baby Name Database - Search & Filter Names by Meaning, Origin & Language | Ama Baby',
    description: 'Explore our global baby name database. Search baby names by name, meaning, or cultural significance, contribute names, or filter by Gender, Origin, Language, Starting With, Ending With, and A-Z.',
    canonicalUrl: 'https://amababycare.com/#baby-names'
  });

  const [namesList, setNamesList] = useState<BabyNameEntry[]>(() => {
    try {
      const cached = localStorage.getItem('ama_global_baby_names_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_GLOBAL_BABY_NAMES;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ama_favorite_baby_names');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [meaningFilter, setMeaningFilter] = useState('');
  const [selectedMeaningTheme, setSelectedMeaningTheme] = useState('All');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Female' | 'Male' | 'Unisex'>('All');
  const [originFilter, setOriginFilter] = useState<string>(initialOriginFilter || 'All');
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  const [startingWithFilter, setStartingWithFilter] = useState<string>('');
  const [endingWithFilter, setEndingWithFilter] = useState<string>('');
  const [activeLetter, setActiveLetter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'az' | 'za' | 'recent' | 'favorites'>('az');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);

  // Add Name Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newSignificance, setNewSignificance] = useState('');
  const [newGender, setNewGender] = useState<'Female' | 'Male' | 'Unisex'>('Unisex');
  const [newOrigin, setNewOrigin] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newPronunciation, setNewPronunciation] = useState('');
  const [contributor, setContributor] = useState(parentName || 'Parent');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [isSubmittingName, setIsSubmittingName] = useState(false);
  const [isEnrichingName, setIsEnrichingName] = useState(false);

  // AI Global Discovery states
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryNotice, setDiscoveryNotice] = useState('');
  const [selectedNameDetail, setSelectedNameDetail] = useState<BabyNameEntry | null>(null);

  // Sync with backend persistent store
  useEffect(() => {
    let mounted = true;
    fetch('/api/baby-names')
      .then(res => res.json())
      .then(data => {
        if (mounted && data?.names && Array.isArray(data.names)) {
          setNamesList(data.names);
          localStorage.setItem('ama_global_baby_names_cache', JSON.stringify(data.names));
        }
      })
      .catch(err => console.warn('Using local baby names cache:', err));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialOriginFilter && initialOriginFilter !== 'All') {
      setOriginFilter(initialOriginFilter);
    }
  }, [initialOriginFilter]);

  useEffect(() => {
    if (typeof initialSearchQuery === 'string') {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('ama_favorite_baby_names', JSON.stringify(updated));
      return updated;
    });
  };

  // Dynamic Origins and Languages available in database
  const availableOrigins = useMemo(() => {
    const set = new Set<string>();
    namesList.forEach(n => {
      if (n.origin) set.add(n.origin.trim());
    });
    return ['All', ...Array.from(set).sort()];
  }, [namesList]);

  const availableLanguages = useMemo(() => {
    const set = new Set<string>();
    namesList.forEach(n => {
      if (n.language) set.add(n.language.trim());
    });
    return ['All', ...Array.from(set).sort()];
  }, [namesList]);

  // Filtered & Sorted Names
  const filteredNames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const mQuery = meaningFilter.trim().toLowerCase();
    const mTheme = selectedMeaningTheme !== 'All' ? selectedMeaningTheme.toLowerCase() : '';
    const startPrefix = startingWithFilter.trim().toLowerCase();
    const endSuffix = endingWithFilter.trim().toLowerCase();

    const filtered = namesList.filter(entry => {
      const nameLower = entry.name.toLowerCase();
      const meaningLower = entry.meaning.toLowerCase();
      const sigLower = (entry.significance || '').toLowerCase();
      const originLower = (entry.origin || '').toLowerCase();
      const langLower = (entry.language || '').toLowerCase();

      // 1. General Search (Name, Meaning, or Significance)
      if (q) {
        const matchesSearch =
          nameLower.includes(q) ||
          meaningLower.includes(q) ||
          sigLower.includes(q) ||
          originLower.includes(q) ||
          langLower.includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Meaning / Significance Filter
      if (mQuery) {
        if (!meaningLower.includes(mQuery) && !sigLower.includes(mQuery)) return false;
      }
      if (mTheme) {
        if (!meaningLower.includes(mTheme) && !sigLower.includes(mTheme)) return false;
      }

      // 3. Gender Filter
      if (genderFilter !== 'All' && entry.gender !== genderFilter) {
        return false;
      }

      // 4. Origin Filter
      if (originFilter !== 'All' && entry.origin.toLowerCase() !== originFilter.toLowerCase()) {
        return false;
      }

      // 5. Language Filter
      if (languageFilter !== 'All' && entry.language.toLowerCase() !== languageFilter.toLowerCase()) {
        return false;
      }

      // 6. Starting With Filter
      if (startPrefix && !nameLower.startsWith(startPrefix)) {
        return false;
      }

      // 7. Ending With Filter
      if (endSuffix && !nameLower.endsWith(endSuffix)) {
        return false;
      }

      // 8. A-Z Alphabetical Bar Filter
      if (activeLetter !== 'All' && !nameLower.startsWith(activeLetter.toLowerCase())) {
        return false;
      }

      // 9. Favorites Filter
      if (sortOrder === 'favorites' && !favorites.includes(entry.id)) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === 'za') {
        return b.name.localeCompare(a.name);
      }
      if (sortOrder === 'recent') {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (tB !== tA) return tB - tA;
      }
      return a.name.localeCompare(b.name);
    });
  }, [
    namesList,
    searchQuery,
    meaningFilter,
    selectedMeaningTheme,
    genderFilter,
    originFilter,
    languageFilter,
    startingWithFilter,
    endingWithFilter,
    activeLetter,
    sortOrder,
    favorites
  ]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setMeaningFilter('');
    setSelectedMeaningTheme('All');
    setGenderFilter('All');
    setOriginFilter('All');
    setLanguageFilter('All');
    setStartingWithFilter('');
    setEndingWithFilter('');
    setActiveLetter('All');
    setSortOrder('az');
    setDiscoveryNotice('');
  };

  const activeFilterCount = [
    Boolean(searchQuery.trim()),
    Boolean(meaningFilter.trim()),
    selectedMeaningTheme !== 'All',
    genderFilter !== 'All',
    originFilter !== 'All',
    languageFilter !== 'All',
    Boolean(startingWithFilter.trim()),
    Boolean(endingWithFilter.trim()),
    activeLetter !== 'All',
    sortOrder === 'favorites'
  ].filter(Boolean).length;

  const handleAutoEnrichName = async () => {
    if (!newName.trim()) {
      setAddError('Enter a baby name first to look up its meaning and origin.');
      return;
    }
    setIsEnrichingName(true);
    setAddError('');
    try {
      const res = await fetch('/api/baby-names/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          origin: newOrigin.trim(),
          language: newLanguage.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.enriched) {
        const e = data.enriched;
        if (e.name) setNewName(e.name);
        if (e.meaning) setNewMeaning(e.meaning);
        if (e.significance) setNewSignificance(e.significance);
        if (e.gender === 'Male' || e.gender === 'Female' || e.gender === 'Unisex') {
          setNewGender(e.gender);
        }
        if (e.origin) setNewOrigin(e.origin);
        if (e.language) setNewLanguage(e.language);
        if (e.pronunciation) setNewPronunciation(e.pronunciation);
      } else {
        setAddError(data.error || 'Could not auto-fill details. Please enter them below.');
      }
    } catch {
      setAddError('Network unavailable. Please fill in the name details directly.');
    } finally {
      setIsEnrichingName(false);
    }
  };

  const handleAddBabyName = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');

    if (!newName.trim() || !newMeaning.trim()) {
      setAddError('Please provide both the baby name and its meaning/significance.');
      return;
    }

    setIsSubmittingName(true);
    try {
      const res = await fetch('/api/baby-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          meaning: newMeaning.trim(),
          significance: newSignificance.trim() || newMeaning.trim(),
          gender: newGender,
          origin: newOrigin.trim() || 'Global',
          language: newLanguage.trim() || 'Universal',
          pronunciation: newPronunciation.trim(),
          contributedBy: contributor.trim() || parentName || 'Parent'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || 'Could not add baby name.');
      } else {
        const updatedList = data.names || [data.entry, ...namesList];
        setNamesList(updatedList);
        localStorage.setItem('ama_global_baby_names_cache', JSON.stringify(updatedList));
        setAddSuccess(`"${data.entry.name}" has been added to the Global Baby Name Database!`);
        setNewName('');
        setNewMeaning('');
        setNewSignificance('');
        setNewOrigin('');
        setNewLanguage('');
        setNewPronunciation('');
        setTimeout(() => {
          setIsAddModalOpen(false);
          setAddSuccess('');
        }, 1200);
      }
    } catch {
      // Offline local fallback persistence
      const fallbackEntry: BabyNameEntry = {
        id: `bn-local-${Date.now()}`,
        name: newName.trim(),
        meaning: newMeaning.trim(),
        significance: newSignificance.trim() || newMeaning.trim(),
        gender: newGender,
        origin: newOrigin.trim() || 'Global',
        language: newLanguage.trim() || 'Universal',
        pronunciation: newPronunciation.trim(),
        contributedBy: contributor.trim() || parentName || 'Parent',
        createdAt: new Date().toISOString()
      };
      const updated = [fallbackEntry, ...namesList];
      setNamesList(updated);
      localStorage.setItem('ama_global_baby_names_cache', JSON.stringify(updated));
      setAddSuccess(`"${fallbackEntry.name}" saved to database!`);
      setTimeout(() => {
        setIsAddModalOpen(false);
        setAddSuccess('');
      }, 1200);
    } finally {
      setIsSubmittingName(false);
    }
  };

  const handleDiscoverMoreNames = async () => {
    setIsDiscovering(true);
    setDiscoveryNotice('');
    try {
      const res = await fetch('/api/baby-names/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          meaning: meaningFilter.trim() || (selectedMeaningTheme !== 'All' ? selectedMeaningTheme : ''),
          gender: genderFilter,
          origin: originFilter,
          language: languageFilter,
          startsWith: startingWithFilter.trim() || (activeLetter !== 'All' ? activeLetter : ''),
          endsWith: endingWithFilter.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.names) {
        setNamesList(data.names);
        localStorage.setItem('ama_global_baby_names_cache', JSON.stringify(data.names));
        const count = Array.isArray(data.discovered) ? data.discovered.length : 0;
        setDiscoveryNotice(
          count > 0
            ? `Added ${count} verified global baby names matching your criteria to the database.`
            : 'All matching names for this query are now displayed below.'
        );
      }
    } catch {
      setDiscoveryNotice('Could not reach global etymology service right now.');
    } finally {
      setIsDiscovering(false);
    }
  };

  const speakPronunciation = (entry: BabyNameEntry) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(entry.name);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={embedded ? 'space-y-6' : 'p-4 sm:p-6 md:p-8 pb-32 max-w-6xl mx-auto space-y-6 bg-background min-h-screen text-left'}>
      {/* Top Header */}
      {!embedded && (
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[36px] border border-white shadow-lg shadow-card/20">
          <div className="flex items-start sm:items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-2xl bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 shadow-xs border border-gray-100 cursor-pointer shrink-0"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Global Baby Name Encyclopedia
                </span>
                <span className="text-[10px] font-bold text-gray-500 bg-white px-2.5 py-0.5 rounded-full border border-gray-100">
                  {namesList.length} Verified Names • A-Z
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-1">
                Global Baby Name Database
              </h1>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                Search names by meaning or significance, contribute a cultural name, or filter by Gender, Origin, Language, Starting/Ending letters & A-Z.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <button
              onClick={() => setSortOrder(sortOrder === 'favorites' ? 'az' : 'favorites')}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                sortOrder === 'favorites'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${sortOrder === 'favorites' ? 'fill-white text-white' : 'text-sky-600'}`} />
              <span>Saved ({favorites.length})</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20 border-none cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add a Name</span>
            </button>
          </div>
        </header>
      )}

      {/* Filter Control Panel */}
      <div className="bg-white rounded-[32px] p-5 sm:p-6 border border-gray-100 shadow-md space-y-5">
        {/* Primary Search Bar + Action Buttons (Rendered only when standalone; parent directory has primary search bar when embedded) */}
        {!embedded ? (
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search baby names by Name, Meaning, Significance, Origin, or Language (e.g. 'Adaeze', 'Grace', 'Peace', 'Yoruba', 'Swahili')..."
                className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-800 outline-none focus:border-primary focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border cursor-pointer transition-all ${
                  showAdvancedFilters
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
              </button>

              <button
                onClick={handleDiscoverMoreNames}
                disabled={isDiscovering}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-95 disabled:opacity-60 cursor-pointer border-none transition-all"
                title="Use AI Etymology Search to discover and add more global names matching your filters"
              >
                {isDiscovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                <span>{isDiscovering ? 'Searching...' : 'AI Global Search'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-primary">
                Global Baby Name Encyclopedia
              </span>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {filteredNames.length} of {namesList.length} Names
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs border-none cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Name</span>
              </button>
              <button
                onClick={handleDiscoverMoreNames}
                disabled={isDiscovering}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs border-none cursor-pointer"
              >
                {isDiscovering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                <span>{isDiscovering ? 'Searching...' : 'AI Discover'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Meaning / Significance Quick Theme Chips */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
            Filter by Meaning / Significance Theme
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {MEANING_SIGNIFICANCE_THEMES.map(theme => (
              <button
                key={theme}
                onClick={() => setSelectedMeaningTheme(theme)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer border transition-all ${
                  selectedMeaningTheme === theme
                    ? 'bg-primary text-white border-primary shadow-2xs'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Dimensional Filter Grid: Meaning, Gender, Origin, Language, Starting With, Ending With, Sort A-Z */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 pt-2 border-t border-gray-100"
            >
              {/* 1. Meaning / Significance keyword */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                  Meaning / Significance
                </label>
                <input
                  type="text"
                  value={meaningFilter}
                  onChange={e => setMeaningFilter(e.target.value)}
                  placeholder="e.g. Crown, Sun, Healer..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-primary"
                />
              </div>

              {/* 2. Gender */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                  Gender
                </label>
                <select
                  value={genderFilter}
                  onChange={e => setGenderFilter(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:border-primary"
                >
                  <option value="All">All Genders</option>
                  <option value="Female">Girl (Female)</option>
                  <option value="Male">Boy (Male)</option>
                  <option value="Unisex">Unisex / Neutral</option>
                </select>
              </div>

              {/* 3. Origin */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                  Origin
                </label>
                <select
                  value={originFilter}
                  onChange={e => setOriginFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:border-primary"
                >
                  {availableOrigins.map(orig => (
                    <option key={orig} value={orig}>
                      {orig === 'All' ? 'All Origins' : orig}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Language */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                  Language
                </label>
                <select
                  value={languageFilter}
                  onChange={e => setLanguageFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:border-primary"
                >
                  {availableLanguages.map(lang => (
                    <option key={lang} value={lang}>
                      {lang === 'All' ? 'All Languages' : lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Starting With */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                  Starting With
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={startingWithFilter}
                  onChange={e => setStartingWithFilter(e.target.value)}
                  placeholder="e.g. A, Ch, Ol..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-primary"
                />
              </div>

              {/* 6. Ending With */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                  Ending With
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={endingWithFilter}
                  onChange={e => setEndingWithFilter(e.target.value)}
                  placeholder="e.g. a, i, el, na..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-primary"
                />
              </div>

              {/* 7. A-Z Sort Order */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                  Order (A-Z)
                </label>
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:border-primary"
                >
                  <option value="az">Alphabetical (A → Z)</option>
                  <option value="za">Reverse (Z → A)</option>
                  <option value="recent">Recently Added</option>
                  <option value="favorites">Saved Favorites Only</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive A-Z Alphabetical Browse Bar */}
        <div className="pt-2 border-t border-gray-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Browse Alphabetically (A-Z)
            </span>
            <span className="text-[11px] font-bold text-gray-600">
              Showing <strong className="text-primary">{filteredNames.length}</strong> {filteredNames.length === 1 ? 'name' : 'names'}
            </span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveLetter('All')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black shrink-0 cursor-pointer border transition-all ${
                activeLetter === 'All'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              All A-Z
            </button>
            {ALPHABET.map(letter => {
              const isSelected = activeLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => setActiveLetter(isSelected ? 'All' : letter)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-black shrink-0 flex items-center justify-center cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-2xs scale-105'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {discoveryNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between">
            <span>✨ {discoveryNotice}</span>
            <button
              onClick={() => setDiscoveryNotice('')}
              className="text-emerald-700 hover:text-emerald-900 bg-transparent border-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Results Grid */}
      {filteredNames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNames.map(entry => {
            const isFav = favorites.includes(entry.id);
            const genderBadgeStyle =
              entry.gender === 'Female'
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : entry.gender === 'Male'
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-purple-50 text-purple-700 border-purple-200';

            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedNameDetail(entry)}
                className="bg-white rounded-[28px] p-5 border border-gray-100 hover:border-primary/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 cursor-pointer group text-left"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-serif font-black text-gray-900 group-hover:text-primary transition-colors">
                          {entry.name}
                        </h3>
                        {entry.pronunciation && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              speakPronunciation(entry);
                            }}
                            className="p-1 rounded-full bg-gray-100 hover:bg-primary/10 text-gray-500 hover:text-primary border-none cursor-pointer transition-colors"
                            title={`Listen: ${entry.pronunciation}`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {entry.pronunciation && (
                        <p className="text-[11px] text-gray-400 font-medium italic">
                          /{entry.pronunciation}/
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${genderBadgeStyle}`}>
                        {entry.gender === 'Female' ? 'Girl' : entry.gender === 'Male' ? 'Boy' : 'Unisex'}
                      </span>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          toggleFavorite(entry.id);
                        }}
                        className="w-8 h-8 rounded-full bg-gray-50 hover:bg-sky-50 flex items-center justify-center border border-gray-100 cursor-pointer transition-all"
                        title={isFav ? 'Remove from Saved Names' : 'Save Name'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-sky-600 text-sky-600' : 'text-gray-400'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Meaning */}
                  <div className="bg-card/50 p-3 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary">
                      Meaning
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 leading-snug">
                      “{entry.meaning}”
                    </p>
                  </div>

                  {/* Cultural Significance */}
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                    {entry.significance}
                  </p>
                </div>

                {/* Footer Metadata: Origin & Language */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      🌍 {entry.origin}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/60">
                      🗣️ {entry.language}
                    </span>
                  </div>
                  {entry.contributedBy && (
                    <span className="text-gray-400 truncate max-w-[120px]" title={`Added by ${entry.contributedBy}`}>
                      By {entry.contributedBy}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] p-8 sm:p-12 text-center border border-gray-100 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl">
            📖
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-serif font-black text-gray-900">
              No local matches for these exact filters yet
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              You can search our global etymology engine to discover authentic names matching your exact filters, or add a name directly to the database.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleDiscoverMoreNames}
              disabled={isDiscovering}
              className="px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md border-none cursor-pointer"
            >
              {isDiscovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
              <span>{isDiscovering ? 'Searching Global Names...' : 'Discover Matching Names with AI'}</span>
            </button>
            <button
              onClick={() => {
                if (searchQuery.trim()) setNewName(searchQuery.trim());
                setIsAddModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-none cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add This Name</span>
            </button>
            <button
              onClick={resetAllFilters}
              className="px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-600 text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Selected Baby Name Detail Modal */}
      <AnimatePresence>
        {selectedNameDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full border border-gray-100 shadow-2xl space-y-5 text-left relative"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-3xl font-serif font-black text-gray-900">
                      {selectedNameDetail.name}
                    </h2>
                    <button
                      onClick={() => speakPronunciation(selectedNameDetail)}
                      className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-none cursor-pointer"
                      title="Listen to pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  {selectedNameDetail.pronunciation && (
                    <p className="text-xs text-gray-500 font-semibold italic mt-0.5">
                      Pronunciation: /{selectedNameDetail.pronunciation}/
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedNameDetail(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary">
                  {selectedNameDetail.gender === 'Female' ? '👧 Girl Name' : selectedNameDetail.gender === 'Male' ? '👦 Boy Name' : '🌟 Unisex Name'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  🌍 Origin: {selectedNameDetail.origin}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
                  🗣️ Language: {selectedNameDetail.language}
                </span>
              </div>

              <div className="bg-card p-4 rounded-2xl border border-white space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Literal Meaning
                </p>
                <p className="text-base font-serif font-black text-gray-900">
                  “{selectedNameDetail.meaning}”
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Cultural & Historical Significance
                </p>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {selectedNameDetail.significance}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => toggleFavorite(selectedNameDetail.id)}
                  className={`flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                    favorites.includes(selectedNameDetail.id)
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(selectedNameDetail.id) ? 'fill-white' : ''}`} />
                  <span>{favorites.includes(selectedNameDetail.id) ? 'Saved in Favorites' : 'Save to Favorites'}</span>
                </button>
                <button
                  onClick={() => setSelectedNameDetail(null)}
                  className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black uppercase tracking-wider border-none cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add a Baby Name Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Community Contribution
                  </span>
                  <h2 className="text-xl font-serif font-black text-gray-900">
                    Add a Baby Name to the Global Database
                  </h2>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center border-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddBabyName} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Baby Name *
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoEnrichName}
                      disabled={isEnrichingName}
                      className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
                    >
                      {isEnrichingName ? <Loader2 className="w-3 h-3 animate-spin" /> : <Compass className="w-3 h-3" />}
                      <span>{isEnrichingName ? 'Looking up etymology...' : 'Auto-Fill Meaning & Origin with AI'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Chimamanda, Tariq, Amani..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                    Literal Meaning *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMeaning}
                    onChange={e => setNewMeaning(e.target.value)}
                    placeholder="e.g. My God will never fail; Gift of Peace..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                    Cultural Significance / Story
                  </label>
                  <textarea
                    rows={3}
                    value={newSignificance}
                    onChange={e => setNewSignificance(e.target.value)}
                    placeholder="Share the cultural tradition, story, or reason parents choose this name..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-gray-800 outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                      Gender *
                    </label>
                    <select
                      value={newGender}
                      onChange={e => setNewGender(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-gray-800 outline-none focus:border-primary"
                    >
                      <option value="Female">Girl (Female)</option>
                      <option value="Male">Boy (Male)</option>
                      <option value="Unisex">Unisex / Neutral</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                      Origin *
                    </label>
                    <input
                      type="text"
                      value={newOrigin}
                      onChange={e => setNewOrigin(e.target.value)}
                      placeholder="e.g. West African, Celtic..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                      Language *
                    </label>
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={e => setNewLanguage(e.target.value)}
                      placeholder="e.g. Igbo, Yoruba, Swahili..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                      Phonetic Pronunciation
                    </label>
                    <input
                      type="text"
                      value={newPronunciation}
                      onChange={e => setNewPronunciation(e.target.value)}
                      placeholder="e.g. ah-MAH-rah"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">
                      Contributed By
                    </label>
                    <input
                      type="text"
                      value={contributor}
                      onChange={e => setContributor(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {addError && (
                  <p className="text-xs font-bold text-sky-600 bg-sky-50 px-3.5 py-2 rounded-xl border border-sky-200">
                    {addError}
                  </p>
                )}

                {addSuccess && (
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                    ✓ {addSuccess}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingName}
                    className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider shadow-md border-none cursor-pointer"
                  >
                    {isSubmittingName ? 'Saving...' : 'Publish Baby Name'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
