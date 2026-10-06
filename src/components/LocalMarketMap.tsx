import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { 
  Store, 
  MapPin, 
  ShoppingCart, 
  Search, 
  Navigation, 
  Clock, 
  Tag, 
  PackageCheck, 
  Sparkles, 
  Info, 
  ExternalLink,
  ChevronRight,
  Filter,
  Globe,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { GlobalLocation, GlobalLocationPickerModal } from './GlobalLocationPickerModal';

export interface LocalMarketPlace {
  id: string;
  name: string;
  category: 'market' | 'supermarket' | 'pharmacy' | 'baby_store';
  address: string;
  lat: number;
  lng: number;
  rating: number;
  priceLevel: string;
  moqSalesType: string;
  popularStaples: string[];
  hours: string;
  region?: string;
  notes: string;
}

interface LocalMarketMapProps {
  location?: GlobalLocation;
  selectedLocationName?: string;
  onSelectPlace?: (place: any) => void;
  onLocationChange?: (loc: GlobalLocation) => void;
  onClose?: () => void;
}

export const LocalMarketMap: React.FC<LocalMarketMapProps> = ({
  location,
  selectedLocationName = 'Port Harcourt, Nigeria',
  onSelectPlace,
  onLocationChange,
  onClose
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [currentLoc, setCurrentLoc] = useState<GlobalLocation>(() => {
    if (location) return location;
    const saved = localStorage.getItem('ama_global_location');
    return saved ? JSON.parse(saved) : {
      name: selectedLocationName || 'Port Harcourt, Nigeria',
      lat: 4.8156,
      lng: 7.0498,
      country: 'Nigeria',
      currency: '₦',
      currencyCode: 'NGN'
    };
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<LocalMarketPlace | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLoadingRealities, setIsLoadingRealities] = useState(false);
  const [placesList, setPlacesList] = useState<LocalMarketPlace[]>([]);
  const [marketIntelligence, setMarketIntelligence] = useState<any>(null);

  // Sync if prop changes
  useEffect(() => {
    if (location) {
      setCurrentLoc(location);
    }
  }, [location]);

  // Fetch dynamic location realities & outlets when currentLoc changes
  useEffect(() => {
    fetchLocationRealities(currentLoc);
  }, [currentLoc]);

  const fetchLocationRealities = async (loc: GlobalLocation) => {
    setIsLoadingRealities(true);
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
        setMarketIntelligence(data);
        if (data.outlets && Array.isArray(data.outlets) && data.outlets.length > 0) {
          setPlacesList(data.outlets);
          setSelectedPlace(data.outlets[0]);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch location realities:", err);
    } finally {
      setIsLoadingRealities(false);
    }
  };

  const filteredPlaces = placesList.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.popularStaples?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.address && p.address.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleLocationPicked = (loc: GlobalLocation) => {
    setCurrentLoc(loc);
    if (onLocationChange) onLocationChange(loc);
  };

  return (
    <div className="bg-white rounded-[36px] p-4 sm:p-6 border border-gray-100 shadow-xl space-y-5 text-left relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0 shadow-2xs">
            📍
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                Google Maps Grounding
              </span>
              <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Global Location Awareness
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-black text-gray-900 mt-0.5">
              Local Markets, Supermarkets & Pricing Realities
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPickerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer border-none transition-all"
          >
            <span>🗺️</span>
            <span>Change Location ({currentLoc.name.split(',')[0]})</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center border-none cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Global Location Reality Context Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-4 space-y-2.5 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🌍</span>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900">
              Current Location: <span className="text-emerald-800 font-black">{currentLoc.name}</span>
            </h4>
          </div>
          <span className="text-xs font-black text-emerald-800 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 self-start sm:self-auto">
            Local Currency: {marketIntelligence?.currencySymbol || currentLoc.currency} ({marketIntelligence?.currencyCode || currentLoc.currencyCode || ''})
          </span>
        </div>

        {isLoadingRealities ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 py-1 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>Updating local market intelligence with Google Maps...</span>
          </div>
        ) : marketIntelligence && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="bg-white/90 p-2.5 rounded-2xl border border-emerald-100 space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-600" />
                <span>Local Sales Types & MOQ Reality</span>
              </p>
              <p className="text-[11px] text-gray-700 leading-snug">
                {marketIntelligence.moqSalesTypes}
              </p>
            </div>

            <div className="bg-white/90 p-2.5 rounded-2xl border border-emerald-100 space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <ShoppingCart className="w-3 h-3 text-emerald-600" />
                <span>Market Overview</span>
              </p>
              <p className="text-[11px] text-gray-700 leading-snug">
                {marketIntelligence.marketOverview}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search markets, supermarkets, staples in ${currentLoc.name.split(',')[0]}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-800 outline-none focus:border-emerald-500 shadow-2xs"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Outlets', icon: Store },
            { id: 'market', label: '🥬 Fresh Local Markets', icon: ShoppingCart },
            { id: 'supermarket', label: '🛒 Supermarkets', icon: Store },
            { id: 'pharmacy', label: '💊 Pharmacies & Health', icon: PackageCheck },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all border-none cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Map + Local Outlet List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map View Container */}
        <div className="lg:col-span-7 h-72 sm:h-96 rounded-3xl overflow-hidden border border-gray-200 relative shadow-inner">
          <APIProvider apiKey={apiKey}>
            <Map
              mapId="DEMO_MAP_ID"
              defaultCenter={{ lat: currentLoc.lat, lng: currentLoc.lng }}
              center={{ lat: currentLoc.lat, lng: currentLoc.lng }}
              defaultZoom={12}
              gestureHandling={'greedy'}
              disableDefaultUI={false}
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              className="w-full h-full"
            >
              {filteredPlaces.map((place) => (
                <AdvancedMarker
                  key={place.id}
                  position={{ lat: place.lat, lng: place.lng }}
                  onClick={() => {
                    setSelectedPlace(place);
                    if (onSelectPlace) onSelectPlace(place);
                  }}
                >
                  <Pin 
                    background={
                      place.category === 'market' ? '#10b981' : 
                      place.category === 'supermarket' ? '#3b82f6' : '#ec4899'
                    } 
                    borderColor="#ffffff" 
                    glyphColor="#ffffff" 
                  />
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        </div>

        {/* Selected Outlet Local Realities Panel */}
        <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
          {selectedPlace ? (
            <div className="bg-emerald-50/60 border-2 border-emerald-200/80 rounded-3xl p-4 space-y-3 text-left">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selectedPlace.category === 'market' ? 'bg-emerald-100 text-emerald-800' :
                    selectedPlace.category === 'supermarket' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                  }`}>
                    {selectedPlace.category === 'market' ? '🥬 Open-Air Fresh Market' :
                     selectedPlace.category === 'supermarket' ? '🛒 Modern Supermarket' : '💊 Certified Pharmacy'}
                  </span>
                  <h3 className="text-sm font-serif font-black text-gray-900 mt-1">
                    {selectedPlace.name}
                  </h3>
                  <p className="text-[11px] font-medium text-gray-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{selectedPlace.address}</span>
                  </p>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-emerald-100">
                  ⭐ {selectedPlace.rating}
                </span>
              </div>

              {/* Local Reality: MOQ & Sales Type */}
              <div className="bg-white p-3 rounded-2xl border border-emerald-100 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-600" />
                  <span>MOQ & Local Sales Type</span>
                </p>
                <p className="text-xs font-bold text-gray-800">{selectedPlace.moqSalesType}</p>
                <p className="text-[10px] text-gray-500">{selectedPlace.notes}</p>
              </div>

              {/* Popular Local Weaning Staples */}
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                  Popular Fresh Staples Available
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedPlace.popularStaples?.map((item, idx) => (
                    <span key={idx} className="text-[10px] font-semibold bg-white text-gray-800 px-2 py-0.5 rounded-lg border border-gray-200">
                      • {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hours & Direct Link */}
              <div className="flex justify-between items-center pt-2 border-t border-emerald-200/60 text-[10px] text-gray-600">
                <div className="flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{selectedPlace.hours}</span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.name + ' ' + selectedPlace.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 no-underline"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 text-center text-gray-500 text-xs font-medium">
              Click a marker on the map to inspect local price realities and sales types.
            </div>
          )}

          {/* Quick List Selector */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Nearby Outlets</p>
            {filteredPlaces.map((place) => (
              <button
                key={place.id}
                onClick={() => {
                  setSelectedPlace(place);
                  if (onSelectPlace) onSelectPlace(place);
                }}
                className={`w-full p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                  selectedPlace?.id === place.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-100'
                }`}
              >
                <div>
                  <p className="text-xs font-bold leading-tight">{place.name}</p>
                  <p className={`text-[10px] font-medium mt-0.5 ${selectedPlace?.id === place.id ? 'text-emerald-100' : 'text-gray-500'}`}>
                    {place.priceLevel} • {place.moqSalesType?.split(',')[0]}
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedPlace?.id === place.id ? 'text-white' : 'text-gray-400'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Global Location Picker Modal */}
      <GlobalLocationPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        currentLocation={currentLoc}
        onSelectLocation={handleLocationPicked}
      />
    </div>
  );
};
