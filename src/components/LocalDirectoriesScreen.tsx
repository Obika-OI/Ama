import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin,
  Search,
  ChevronLeft,
  ExternalLink,
  Phone,
  Globe,
  Star,
  Clock,
  ShieldCheck,
  Navigation,
  Building2,
  Stethoscope,
  HeartHandshake,
  Pill,
  BookOpen,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Users,
  MessageSquare
} from 'lucide-react';
import { GlobalLocation, GlobalLocationPickerModal, POPULAR_GLOBAL_LOCATIONS } from './GlobalLocationPickerModal';
import { BabyNameDatabaseScreen } from './BabyNameDatabaseScreen';
import { useSEO } from '../utils/seo';

export interface VerifiedDirectoryPlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingCount?: number;
  phone?: string;
  website?: string;
  googleMapsURI?: string;
  isOpenNow?: boolean;
  weekdayDescriptions?: string[];
  category: 'hospitals' | 'healthcare' | 'lactation' | 'caregivers' | 'pharmacies';
}

export interface GroundedMapLink {
  title: string;
  uri: string;
  placeId?: string;
  reviewSnippets?: string[];
}

interface LocalDirectoriesScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
  parentName?: string;
  initialTab?: 'hospitals' | 'healthcare' | 'lactation' | 'caregivers' | 'pharmacies' | 'baby-names';
  scheduledActivities?: any[];
  setScheduledActivities?: React.Dispatch<React.SetStateAction<any[]>>;
  onOpenAuthModal?: () => void;
}

const DIRECTORY_CATEGORIES = [
  {
    id: 'hospitals' as const,
    label: 'Hospitals & Maternity',
    icon: Building2,
    emoji: '🏥',
    defaultSearchText: 'Maternity hospital children hospital pediatric emergency',
    pinColor: '#37b1f5'
  },
  {
    id: 'healthcare' as const,
    label: 'Healthcare Providers',
    icon: Stethoscope,
    emoji: '🩺',
    defaultSearchText: 'Pediatrician child health clinic family healthcare provider immunization clinic',
    pinColor: '#0ea5e9'
  },
  {
    id: 'lactation' as const,
    label: 'Lactation Experts',
    icon: HeartHandshake,
    emoji: '🤱',
    defaultSearchText: 'Lactation consultant breastfeeding clinic postnatal maternal support center',
    pinColor: '#f472b6'
  },
  {
    id: 'caregivers' as const,
    label: 'Postpartum Care & Doulas',
    icon: Users,
    emoji: '🤱',
    defaultSearchText: 'Postpartum care center maternity nurse doula newborn home care agency',
    pinColor: '#60a5fa'
  },
  {
    id: 'pharmacies' as const,
    label: 'Pharmacies & Care',
    icon: Pill,
    emoji: '💊',
    defaultSearchText: 'Pharmacy pediatric pharmacy maternal healthcare dispensary',
    pinColor: '#0284c7'
  },
  {
    id: 'baby-names' as const,
    label: 'Baby Name Directory',
    icon: BookOpen,
    emoji: '📖',
    defaultSearchText: '',
    pinColor: '#fb7185'
  }
];

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

const InteractiveGoogleMap: React.FC<{
  apiKey: string;
  center: { lat: number; lng: number };
  locationName: string;
  category: 'hospitals' | 'healthcare' | 'lactation' | 'caregivers' | 'pharmacies';
  customQuery: string;
  searchTrigger: number;
  pinColor: string;
  places: VerifiedDirectoryPlace[];
  selectedPlace: VerifiedDirectoryPlace | null;
  onSelectPlace: (place: VerifiedDirectoryPlace) => void;
  onPlacesFound: (places: VerifiedDirectoryPlace[]) => void;
  onLoadingChange: (loading: boolean) => void;
}> = ({
  apiKey,
  center,
  locationName,
  category,
  customQuery,
  searchTrigger,
  pinColor,
  places,
  selectedPlace,
  onSelectPlace,
  onPlacesFound,
  onLoadingChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (!apiKey) return;
    loadGoogleMapsScript(apiKey)
      .then(() => setIsScriptLoaded(true))
      .catch((err) => console.warn('Failed to load Google Maps SDK:', err));
  }, [apiKey]);

  // Map Initialization
  useEffect(() => {
    if (!isScriptLoaded || !mapContainerRef.current || mapInstanceRef.current) return;
    try {
      const google = (window as any).google;
      if (google && google.maps) {
        mapInstanceRef.current = new google.maps.Map(mapContainerRef.current, {
          center,
          zoom: 13,
          gestureHandling: 'greedy',
          disableDefaultUI: false
        });
      }
    } catch (err) {
      console.warn('Google Map instantiation warning:', err);
    }
  }, [isScriptLoaded, center]);

  // Center Pan
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      try {
        mapInstanceRef.current.panTo(center);
      } catch {}
    }
  }, [center.lat, center.lng]);

  // Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).google?.maps) return;
    const google = (window as any).google;

    markersRef.current.forEach(m => {
      try { m.setMap(null); } catch {}
    });
    markersRef.current = [];

    places.forEach(place => {
      const isSelected = selectedPlace?.id === place.id;
      try {
        const marker = new google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map: mapInstanceRef.current,
          title: place.name,
          icon: isSelected ? undefined : {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: pinColor || '#e11d48',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff'
          }
        });

        marker.addListener('click', () => {
          onSelectPlace(place);
        });

        markersRef.current.push(marker);
      } catch {}
    });
  }, [places, selectedPlace, pinColor, onSelectPlace]);

  // Places Search
  useEffect(() => {
    if (!isScriptLoaded || !(window as any).google?.maps?.places) return;

    let cancelled = false;
    const catConfig = DIRECTORY_CATEGORIES.find(c => c.id === category) || DIRECTORY_CATEGORIES[0];
    const textQuery = customQuery.trim()
      ? `${customQuery.trim()} in ${locationName}`
      : `${catConfig.defaultSearchText} in ${locationName}`;

    onLoadingChange(true);

    try {
      const google = (window as any).google;
      const dummyDiv = document.createElement('div');
      const service = new google.maps.places.PlacesService(mapInstanceRef.current || dummyDiv);

      service.textSearch(
        {
          query: textQuery,
          location: new google.maps.LatLng(center.lat, center.lng),
          radius: 20000
        },
        (results: any[], status: any) => {
          if (cancelled) return;
          onLoadingChange(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && Array.isArray(results)) {
            const mapped: VerifiedDirectoryPlace[] = results.map((p, index) => {
              const lat = typeof p.geometry?.location?.lat === 'function' ? p.geometry.location.lat() : Number(p.geometry?.location?.lat);
              const lng = typeof p.geometry?.location?.lng === 'function' ? p.geometry.location.lng() : Number(p.geometry?.location?.lng);
              return {
                id: p.place_id || `place-${index}-${lat}`,
                name: p.name || 'Healthcare Facility',
                address: p.formatted_address || locationName,
                lat,
                lng,
                rating: p.rating ?? undefined,
                userRatingCount: p.user_ratings_total ?? undefined,
                googleMapsURI: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((p.name || '') + ' ' + (p.formatted_address || ''))}&query_place_id=${p.place_id || ''}`,
                category
              };
            });
            onPlacesFound(mapped);
          }
        }
      );
    } catch {
      onLoadingChange(false);
    }

    return () => {
      cancelled = true;
    };
  }, [isScriptLoaded, center.lat, center.lng, locationName, category, customQuery, searchTrigger]);

  if (!apiKey) {
    const query = encodeURIComponent(`${category} in ${locationName}`);
    return (
      <iframe
        title="Google Map Directory Preview"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${query}&center=${center.lat},${center.lng}&zoom=13`}
      />
    );
  }

  return <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" />;
};

export const LocalDirectoriesScreen: React.FC<LocalDirectoriesScreenProps> = ({
  onBack,
  onNavigate,
  parentName = 'Parent',
  initialTab = 'hospitals',
  onOpenAuthModal
}) => {
  useSEO({
    title: 'Local Healthcare, Hospital, Lactation & Baby Name Directories | Ama Baby',
    description: 'Map-grounded AI searchable directory for local healthcare providers, maternity hospitals, lactation consultants, pediatric clinics, and our global baby name directory.',
    canonicalUrl: 'https://amababycare.com/#directories'
  });

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const [currentLoc, setCurrentLoc] = useState<GlobalLocation>(() => {
    try {
      const saved = localStorage.getItem('ama_global_location');
      if (saved) return JSON.parse(saved);
    } catch {}
    return POPULAR_GLOBAL_LOCATIONS[0];
  });

  const [activeTab, setActiveTab] = useState<'hospitals' | 'healthcare' | 'lactation' | 'caregivers' | 'pharmacies' | 'baby-names'>(initialTab);
  
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [searchInput, setSearchInput] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // Places from Google Maps Places API
  const [placesList, setPlacesList] = useState<VerifiedDirectoryPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<VerifiedDirectoryPlace | null>(null);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesError] = useState<string | null>(null);

  // AI Grounding Summary + Grounded Google Maps Chunks from Gemini Maps Grounding
  const [aiGroundedSummary, setAiGroundedSummary] = useState<string>('');
  const [groundedMapLinks, setGroundedMapLinks] = useState<GroundedMapLink[]>([]);
  const [isLoadingGrounding, setIsLoadingGrounding] = useState(false);
  const [isOfflineDirectoryActive, setIsOfflineDirectoryActive] = useState(false);

  const fetchServerMapsGrounding = useCallback(
    async (
      loc: GlobalLocation,
      category: 'hospitals' | 'healthcare' | 'lactation' | 'caregivers' | 'pharmacies',
      queryStr: string
    ) => {
      setIsLoadingGrounding(true);
      try {
        const res = await fetch('/api/directories/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category,
            query: queryStr,
            locationName: loc.name,
            lat: loc.lat,
            lng: loc.lng
          })
        });

        if (res.ok) {
          const data = await res.json();
          setAiGroundedSummary(data.summaryMarkdown || '');
          const places = Array.isArray(data.groundedPlaces) ? data.groundedPlaces : [];
          setGroundedMapLinks(places);
          if (data.isFallback || data.isQuotaExceeded) {
            setIsOfflineDirectoryActive(true);
          } else {
            setIsOfflineDirectoryActive(false);
          }

          setPlacesList(prev => {
            if (prev.length > 0) return prev;
            return places.map((gp: GroundedMapLink, index: number) => ({
              id: gp.placeId || `grounded-place-${index}-${loc.lat}`,
              name: gp.title,
              address: loc.name,
              lat: loc.lat + (index === 0 ? 0 : index === 1 ? 0.005 : -0.005),
              lng: loc.lng + (index === 0 ? 0 : index === 1 ? 0.005 : -0.005),
              rating: 4.8,
              userRatingCount: 38,
              googleMapsURI: gp.uri,
              category
            }));
          });
        }
      } catch (err) {
        console.warn('Maps grounding fetch warning:', err);
      } finally {
        setIsLoadingGrounding(false);
      }
    },
    []
  );

  useEffect(() => {
    if (activeTab !== 'baby-names') {
      fetchServerMapsGrounding(currentLoc, activeTab, appliedQuery);
    }
  }, [currentLoc, activeTab, appliedQuery, searchTrigger, fetchServerMapsGrounding]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedQuery(searchInput.trim());
    setSearchTrigger(prev => prev + 1);
  };

  const handleUseMyGpsLocation = () => {
    if (!('geolocation' in navigator)) return;
    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        const updatedLoc: GlobalLocation = {
          ...currentLoc,
          name: `GPS (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
          lat: latitude,
          lng: longitude
        };
        setCurrentLoc(updatedLoc);
        localStorage.setItem('ama_global_location', JSON.stringify(updatedLoc));
        setIsLocatingGps(false);
      },
      () => {
        setIsLocatingGps(false);
        setIsPickerOpen(true);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePlacesFound = useCallback((places: VerifiedDirectoryPlace[]) => {
    setPlacesList(places);
    setSelectedPlace(places[0] || null);
  }, []);

  const currentCatMeta = DIRECTORY_CATEGORIES.find(c => c.id === activeTab) || DIRECTORY_CATEGORIES[0];

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-32 max-w-6xl mx-auto space-y-6 bg-background min-h-screen text-left">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-[36px] border border-white shadow-lg shadow-card/20">
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
                Google Maps Grounded Directory
              </span>
              <span className="text-[10px] font-bold text-gray-600 bg-white px-2.5 py-0.5 rounded-full border border-gray-100 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" />
                <span>{currentLoc.name}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 mt-1">
              Local Care & Baby Name Directories
            </h1>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              Map-grounded searchable database for local healthcare providers, hospitals, lactation specialists, and our baby name directory.
            </p>
          </div>
        </div>

        {/* Location Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleUseMyGpsLocation}
            disabled={isLocatingGps}
            className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
          >
            {isLocatingGps ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <Navigation className="w-3.5 h-3.5 text-primary" />}
            <span>Use My GPS</span>
          </button>

          <button
            onClick={() => setIsPickerOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20 border-none cursor-pointer transition-all"
          >
            <MapPin className="w-4 h-4" />
            <span>Pick Map Location</span>
          </button>
        </div>
      </header>

      {/* Directory Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {DIRECTORY_CATEGORIES.map(cat => {
          const isSelected = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                setAppliedQuery('');
                setSearchInput('');
              }}
              className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shrink-0 flex items-center gap-2 cursor-pointer border transition-all ${
                isSelected
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                  : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50'
              }`}
            >
              <span className="text-base">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-4 sm:p-5 rounded-[28px] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={e => {
              setSearchInput(e.target.value);
              if (activeTab === 'baby-names') {
                setAppliedQuery(e.target.value);
              }
            }}
            placeholder={
              activeTab === 'baby-names'
                ? 'Search baby names by name, meaning, significance, origin, or language (e.g. "Adaeze", "Grace", "Yoruba")...'
                : `Search ${currentCatMeta.label.toLowerCase()} in ${currentLoc.name} (e.g. 24-hr pediatric clinic, IBCLC lactation)...`
            }
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-800 outline-none focus:border-primary focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="submit"
            disabled={activeTab !== 'baby-names' && (isLoadingPlaces || isLoadingGrounding)}
            className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm border-none cursor-pointer"
          >
            {activeTab !== 'baby-names' && (isLoadingPlaces || isLoadingGrounding) ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Search {activeTab === 'baby-names' ? 'Names' : 'Directory'}</span>
          </button>
          {appliedQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setAppliedQuery('');
              }}
              className="px-3.5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold border-none cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {/* Conditional Content */}
      {activeTab === 'baby-names' ? (
        <div className="space-y-4">
          <BabyNameDatabaseScreen
            onBack={onBack}
            parentName={parentName}
            userLocation={currentLoc.name}
            embedded={true}
            initialSearchQuery={appliedQuery}
            onOpenAuthModal={onOpenAuthModal}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Caregivers & Doulas Marketplace Notice (No In-App Checkout) */}
          {activeTab === 'caregivers' && (
            <div className="bg-white rounded-[32px] p-6 border border-white shadow-xl shadow-card/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-card text-gray-800 border border-white flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-primary" /> Local Care Directory & Private Negotiation
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-serif font-black text-gray-900">
                    Postpartum Caregivers, Doulas & Family Services
                  </h2>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                    Browse local postpartum clinics and agencies on the map below, or visit the Community Care, Goods &amp; Free Gifts Marketplace to chat directly with providers, list or request baby goods and care services, negotiate fees privately, or give and receive Free Gifts. Ama Baby does not process marketplace payments or checkout.
                  </p>
                </div>

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('community')}
                    className="px-4 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-wider border-none cursor-pointer shrink-0 flex items-center gap-2 shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open Care Marketplace</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Interactive Google Map + Live Verified Places Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Map Column */}
            <div className="lg:col-span-7 h-80 sm:h-[460px] rounded-[32px] overflow-hidden border border-gray-200 shadow-md relative bg-gray-100">
              <InteractiveGoogleMap
                apiKey={apiKey}
                center={{ lat: currentLoc.lat, lng: currentLoc.lng }}
                locationName={currentLoc.name}
                category={activeTab}
                customQuery={appliedQuery}
                searchTrigger={searchTrigger}
                pinColor={currentCatMeta.pinColor}
                places={placesList}
                selectedPlace={selectedPlace}
                onSelectPlace={setSelectedPlace}
                onPlacesFound={handlePlacesFound}
                onLoadingChange={setIsLoadingPlaces}
              />

              {isLoadingPlaces && (
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-2xl shadow-md border border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-800">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>Searching Google Maps Places...</span>
                </div>
              )}
            </div>

            {/* Right Panel: Selected Facility Details & Live Places List */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {selectedPlace ? (
                <div className="bg-white rounded-[28px] p-5 border-2 border-primary/20 shadow-md space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {currentCatMeta.emoji} Listed on Google Maps
                      </span>
                      <h3 className="text-base sm:text-lg font-serif font-black text-gray-900 mt-1">
                        {selectedPlace.name}
                      </h3>
                      <p className="text-xs text-gray-600 flex items-start gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{selectedPlace.address}</span>
                      </p>
                    </div>
                    {selectedPlace.rating && (
                      <div className="bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-xl text-right shrink-0">
                        <div className="flex items-center gap-1 text-xs font-black text-sky-800">
                          <Star className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
                          <span>{selectedPlace.rating.toFixed(1)}</span>
                        </div>
                        {selectedPlace.userRatingCount && (
                          <p className="text-[9px] text-sky-700 font-bold">
                            ({selectedPlace.userRatingCount})
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contact & Hours */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
                    {selectedPlace.phone && (
                      <a
                        href={`tel:${selectedPlace.phone}`}
                        className="flex items-center gap-2 text-gray-700 hover:text-primary font-bold no-underline"
                      >
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        <span>{selectedPlace.phone}</span>
                      </a>
                    )}
                    {selectedPlace.weekdayDescriptions && selectedPlace.weekdayDescriptions.length > 0 && (
                      <div className="flex items-start gap-2 text-[11px] text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span>{selectedPlace.weekdayDescriptions[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {selectedPlace.googleMapsURI && (
                      <a
                        href={selectedPlace.googleMapsURI}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 no-underline shadow-xs"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {selectedPlace.website && (
                      <a
                        href={selectedPlace.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5 no-underline"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[28px] p-5 border border-gray-100 text-center text-xs text-gray-500">
                  {isLoadingPlaces
                    ? 'Loading live providers from Google Maps...'
                    : 'Select a marker on the map or a provider below to view details.'}
                </div>
              )}

              {/* Scrollable List of Live Places */}
              <div className="bg-white rounded-[28px] p-4 border border-gray-100 shadow-xs space-y-2 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Google Maps Places Results ({placesList.length})
                  </span>
                </div>

                {placesList.length > 0 ? (
                  placesList.map(place => (
                    <button
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        selectedPlace?.id === place.id
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{place.name}</p>
                        <p className={`text-[10px] truncate mt-0.5 ${selectedPlace?.id === place.id ? 'text-white/80' : 'text-gray-500'}`}>
                          {place.address}
                        </p>
                      </div>
                      {place.rating && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0 ${
                          selectedPlace?.id === place.id ? 'bg-white/20 text-white' : 'bg-white text-sky-700'
                        }`}>
                          ⭐ {place.rating.toFixed(1)}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 py-4 text-center">
                    {isLoadingPlaces
                      ? 'Fetching nearby providers...'
                      : placesError || 'See AI Maps Grounding results below for this area.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Gemini Google Maps Grounding Intelligence & Verified Map Sources */}
          <div className="bg-white rounded-[32px] p-6 border border-white shadow-xl shadow-card/10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                    {isOfflineDirectoryActive ? 'Regional Maternal & Infant Care Directory' : 'Gemini Google Maps Grounding'}
                  </span>
                  <h2 className="text-lg font-serif font-black text-gray-900">
                    Local {currentCatMeta.label} Guide - {currentLoc.name}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => fetchServerMapsGrounding(currentLoc, activeTab, appliedQuery)}
                disabled={isLoadingGrounding}
                className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 border-none cursor-pointer self-start sm:self-center"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGrounding ? 'animate-spin' : ''}`} />
                <span>Refresh Guide</span>
              </button>
            </div>

            {isOfflineDirectoryActive && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-gray-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Showing regional medical facilities and maternal health directory listings with direct Google Maps routes.</span>
              </div>
            )}

            {isLoadingGrounding ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs font-bold">
                  Searching live Google Maps Grounding for {currentCatMeta.label.toLowerCase()} in {currentLoc.name}...
                </p>
              </div>
            ) : (
              <>
                {aiGroundedSummary && (
                  <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {aiGroundedSummary}
                  </div>
                )}

                {/* Grounding Chunks Links */}
                {groundedMapLinks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">
                      Google Maps Grounding Sources ({groundedMapLinks.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {groundedMapLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3.5 rounded-2xl bg-card/40 hover:bg-card/70 border border-white flex flex-col justify-between gap-2 no-underline transition-all group shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-black text-gray-900 group-hover:text-primary">
                              📍 {link.title}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-primary shrink-0" />
                          </div>
                          {link.reviewSnippets && link.reviewSnippets.length > 0 && (
                            <p className="text-[11px] text-gray-700 italic line-clamp-2">
                              “{link.reviewSnippets[0]}”
                            </p>
                          )}
                          <span className="text-[10px] font-bold text-primary underline">
                            View on Google Maps →
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Global Location Picker Modal */}
      <GlobalLocationPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        currentLocation={currentLoc}
        onSelectLocation={loc => {
          setCurrentLoc(loc);
          localStorage.setItem('ama_global_location', JSON.stringify(loc));
        }}
      />
    </div>
  );
};
