import React, { useState, useEffect, useRef } from 'react';
import { 
  Store, 
  MapPin, 
  ShoppingCart, 
  Search, 
  Navigation, 
  Clock, 
  Tag, 
  PackageCheck, 
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

const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).google?.maps) {
      resolve();
      return;
    }
    const existingScript = document.getElementById('google-maps-js-sdk');
    if (existingScript) {
      if ((window as any).google?.maps) {
        resolve();
      } else {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', (e) => reject(e));
      }
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-js-sdk';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
};

const MarketPlacesGoogleMap: React.FC<{
  apiKey: string;
  center: { lat: number; lng: number };
  places: LocalMarketPlace[];
  onSelectPlace?: (place: LocalMarketPlace) => void;
}> = ({ apiKey, center, places, onSelectPlace }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!apiKey) return;
    loadGoogleMapsScript(apiKey)
      .then(() => setIsLoaded(true))
      .catch((err) => console.warn('Failed to load Google Maps SDK:', err));
  }, [apiKey]);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapInstanceRef.current) return;
    try {
      const google = (window as any).google;
      if (google && google.maps) {
        mapInstanceRef.current = new google.maps.Map(containerRef.current, {
          center,
          zoom: 12,
          gestureHandling: 'greedy',
          disableDefaultUI: false
        });
      }
    } catch (err) {
      console.warn('Market map instantiation error:', err);
    }
  }, [isLoaded]);

  useEffect(() => {
    if (mapInstanceRef.current && center) {
      try {
        mapInstanceRef.current.panTo(center);
      } catch {}
    }
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).google?.maps) return;
    const google = (window as any).google;

    markersRef.current.forEach(m => {
      try { m.setMap(null); } catch {}
    });
    markersRef.current = [];

    places.forEach(place => {
      try {
        const pinColor = place.category === 'market' ? '#37b1f5' : place.category === 'supermarket' ? '#4f46e5' : '#e11d48';
        const marker = new google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map: mapInstanceRef.current,
          title: place.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: pinColor,
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff'
          }
        });

        marker.addListener('click', () => {
          if (onSelectPlace) onSelectPlace(place);
        });

        markersRef.current.push(marker);
      } catch {}
    });
  }, [places, onSelectPlace]);

  if (!apiKey) {
    const query = encodeURIComponent(`markets in ${center.lat},${center.lng}`);
    return (
      <iframe
        title="Local Markets Map"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        src={`https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${query}&zoom=12`}
      />
    );
  }

  return <div ref={containerRef} className="w-full h-full min-h-[300px]" />;
};

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
        setMarketIntelligence(data.realities);
        if (data.outlets && Array.isArray(data.outlets)) {
          setPlacesList(data.outlets);
        }
      }
    } catch {
      // Fallback defaults if offline
    } finally {
      setIsLoadingRealities(false);
    }
  };

  const filteredPlaces = placesList.filter(p => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.popularStaples?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleLocationPicked = (loc: GlobalLocation) => {
    setCurrentLoc(loc);
    if (onLocationChange) onLocationChange(loc);
  };

  return (
    <div className="bg-white/95 rounded-[36px] p-4 sm:p-6 border border-white shadow-xl space-y-5 text-left relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0 shadow-2xs">
            📍
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                Google Maps Grounding
              </span>
              <span className="text-[9px] font-bold text-gray-600 bg-card px-2 py-0.5 rounded-full border border-white">
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
            className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer border-none transition-all"
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
      <div className="bg-card/40 border border-white rounded-3xl p-4 space-y-2.5 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🌍</span>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900">
              Current Location: <span className="text-primary font-black">{currentLoc.name}</span>
            </h4>
          </div>
          <span className="text-xs font-black text-gray-800 bg-white px-2.5 py-1 rounded-xl border border-white shadow-2xs self-start sm:self-auto">
            Local Currency: {marketIntelligence?.currencySymbol || currentLoc.currency} ({marketIntelligence?.currencyCode || currentLoc.currencyCode || ''})
          </span>
        </div>

        {isLoadingRealities ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 py-1 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            <span>Updating local market intelligence with Google Maps...</span>
          </div>
        ) : marketIntelligence && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="bg-white/90 p-2.5 rounded-2xl border border-white space-y-0.5 shadow-2xs">
              <p className="text-[9px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                <Tag className="w-3 h-3 text-primary" />
                <span>Local Sales Types & MOQ Reality</span>
              </p>
              <p className="text-[11px] text-gray-700 leading-snug">
                {marketIntelligence.moqSalesTypes}
              </p>
            </div>

            <div className="bg-white/90 p-2.5 rounded-2xl border border-white space-y-0.5 shadow-2xs">
              <p className="text-[9px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                <ShoppingCart className="w-3 h-3 text-primary" />
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
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-800 outline-none focus:border-primary shadow-2xs"
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
                  ? 'bg-primary text-white shadow-xs'
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
        <div className="lg:col-span-7 h-72 sm:h-96 rounded-3xl overflow-hidden border border-gray-200 relative shadow-inner">
          <MarketPlacesGoogleMap
            apiKey={apiKey}
            center={{ lat: currentLoc.lat, lng: currentLoc.lng }}
            places={filteredPlaces}
            onSelectPlace={(place) => {
              setSelectedPlace(place);
              if (onSelectPlace) onSelectPlace(place);
            }}
          />
        </div>

        {/* Selected Outlet Local Realities Panel */}
        <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
          {selectedPlace ? (
            <div className="bg-card/40 border-2 border-white rounded-3xl p-4 space-y-3 text-left">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selectedPlace.category === 'market' ? 'bg-primary/10 text-primary border border-primary/20' :
                    selectedPlace.category === 'supermarket' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedPlace.category === 'market' ? '🥬 Open-Air Fresh Market' :
                     selectedPlace.category === 'supermarket' ? '🛒 Modern Supermarket' : '💊 Certified Pharmacy'}
                  </span>
                  <h3 className="text-sm font-serif font-black text-gray-900 mt-1">
                    {selectedPlace.name}
                  </h3>
                  <p className="text-[11px] font-medium text-gray-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-primary shrink-0" />
                    <span>{selectedPlace.address}</span>
                  </p>
                </div>
                <span className="text-xs font-black text-gray-900 bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-white">
                  ⭐ {selectedPlace.rating}
                </span>
              </div>

              {/* Local Reality: MOQ & Sales Type */}
              <div className="bg-white p-3 rounded-2xl border border-white shadow-2xs space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                  <Tag className="w-3 h-3 text-primary" />
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
              <div className="flex justify-between items-center pt-2 border-t border-gray-200/60 text-[10px] text-gray-600">
                <div className="flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{selectedPlace.hours}</span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.name + ' ' + selectedPlace.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-bold flex items-center gap-1 no-underline"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 p-6 rounded-3xl border border-white shadow-xs text-center text-gray-500 text-xs font-medium">
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
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-100'
                }`}
              >
                <div>
                  <p className="text-xs font-bold leading-tight">{place.name}</p>
                  <p className={`text-[10px] font-medium mt-0.5 ${selectedPlace?.id === place.id ? 'text-white/80' : 'text-gray-500'}`}>
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
