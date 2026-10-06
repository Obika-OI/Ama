import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { 
  Globe, 
  MapPin, 
  Search, 
  Crosshair, 
  Check, 
  Sparkles, 
  X, 
  Loader2, 
  Tag, 
  ShoppingCart, 
  AlertCircle,
  Building,
  Navigation,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface GlobalLocation {
  name: string;
  lat: number;
  lng: number;
  country: string;
  currency: string;
  currencyCode?: string;
  stateOrRegion?: string;
  flag?: string;
}

export const POPULAR_GLOBAL_LOCATIONS: GlobalLocation[] = [
  // Nigeria
  { name: 'Port Harcourt, Nigeria', lat: 4.8156, lng: 7.0498, country: 'Nigeria', currency: '₦', currencyCode: 'NGN', stateOrRegion: 'Rivers State', flag: '🇳🇬' },
  { name: 'Lagos, Nigeria', lat: 6.5244, lng: 3.3792, country: 'Nigeria', currency: '₦', currencyCode: 'NGN', stateOrRegion: 'Lagos State', flag: '🇳🇬' },
  { name: 'Abuja, Nigeria', lat: 9.0765, lng: 7.3986, country: 'Nigeria', currency: '₦', currencyCode: 'NGN', stateOrRegion: 'FCT', flag: '🇳🇬' },
  { name: 'Kano, Nigeria', lat: 12.0022, lng: 8.5920, country: 'Nigeria', currency: '₦', currencyCode: 'NGN', stateOrRegion: 'Kano State', flag: '🇳🇬' },
  { name: 'Ibadan, Nigeria', lat: 7.3775, lng: 3.9470, country: 'Nigeria', currency: '₦', currencyCode: 'NGN', stateOrRegion: 'Oyo State', flag: '🇳🇬' },
  { name: 'Enugu, Nigeria', lat: 6.4584, lng: 7.5464, country: 'Nigeria', currency: '₦', currencyCode: 'NGN', stateOrRegion: 'Enugu State', flag: '🇳🇬' },
  { name: 'Benin City, Nigeria', lat: 6.3350, lng: 5.6037, country: 'Nigeria', currency: '₦', currencyCode: 'NGN', stateOrRegion: 'Edo State', flag: '🇳🇬' },
  
  // Ghana, Kenya, South Africa, Cameroon, Uganda
  { name: 'Accra, Ghana', lat: 5.6037, lng: -0.1870, country: 'Ghana', currency: 'GH₵', currencyCode: 'GHS', stateOrRegion: 'Greater Accra', flag: '🇬🇭' },
  { name: 'Kumasi, Ghana', lat: 6.6885, lng: -1.6244, country: 'Ghana', currency: 'GH₵', currencyCode: 'GHS', stateOrRegion: 'Ashanti', flag: '🇬🇭' },
  { name: 'Nairobi, Kenya', lat: -1.2921, lng: 36.8219, country: 'Kenya', currency: 'KSh', currencyCode: 'KES', stateOrRegion: 'Nairobi', flag: '🇰🇪' },
  { name: 'Mombasa, Kenya', lat: -4.0435, lng: 39.6682, country: 'Kenya', currency: 'KSh', currencyCode: 'KES', stateOrRegion: 'Coast', flag: '🇰🇪' },
  { name: 'Johannesburg, South Africa', lat: -26.2041, lng: 28.0473, country: 'South Africa', currency: 'R', currencyCode: 'ZAR', stateOrRegion: 'Gauteng', flag: '🇿🇦' },
  { name: 'Cape Town, South Africa', lat: -33.9249, lng: 18.4241, country: 'South Africa', currency: 'R', currencyCode: 'ZAR', stateOrRegion: 'Western Cape', flag: '🇿🇦' },
  { name: 'Douala, Cameroon', lat: 4.0511, lng: 9.7679, country: 'Cameroon', currency: 'FCFA', currencyCode: 'XAF', stateOrRegion: 'Littoral', flag: '🇨🇲' },
  { name: 'Kampala, Uganda', lat: 0.3476, lng: 32.5825, country: 'Uganda', currency: 'USh', currencyCode: 'UGX', stateOrRegion: 'Central', flag: '🇺🇬' },
  { name: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357, country: 'Egypt', currency: 'E£', currencyCode: 'EGP', stateOrRegion: 'Cairo', flag: '🇪🇬' },

  // UK & Europe
  { name: 'London, United Kingdom', lat: 51.5074, lng: -0.1278, country: 'United Kingdom', currency: '£', currencyCode: 'GBP', stateOrRegion: 'Greater London', flag: '🇬🇧' },
  { name: 'Manchester, United Kingdom', lat: 53.4808, lng: -2.2426, country: 'United Kingdom', currency: '£', currencyCode: 'GBP', stateOrRegion: 'Greater Manchester', flag: '🇬🇧' },
  { name: 'Paris, France', lat: 48.8566, lng: 2.3522, country: 'France', currency: '€', currencyCode: 'EUR', stateOrRegion: 'Île-de-France', flag: '🇫🇷' },
  { name: 'Berlin, Germany', lat: 52.5200, lng: 13.4050, country: 'Germany', currency: '€', currencyCode: 'EUR', stateOrRegion: 'Berlin', flag: '🇩🇪' },

  // Americas & Caribbean
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060, country: 'United States', currency: '$', currencyCode: 'USD', stateOrRegion: 'New York', flag: '🇺🇸' },
  { name: 'Houston, Texas, USA', lat: 29.7604, lng: -95.3698, country: 'United States', currency: '$', currencyCode: 'USD', stateOrRegion: 'Texas', flag: '🇺🇸' },
  { name: 'Atlanta, Georgia, USA', lat: 33.7490, lng: -84.3880, country: 'United States', currency: '$', currencyCode: 'USD', stateOrRegion: 'Georgia', flag: '🇺🇸' },
  { name: 'Toronto, Canada', lat: 43.6532, lng: -79.3832, country: 'Canada', currency: 'CA$', currencyCode: 'CAD', stateOrRegion: 'Ontario', flag: '🇨🇦' },
  { name: 'Kingston, Jamaica', lat: 18.0179, lng: -76.8099, country: 'Jamaica', currency: 'J$', currencyCode: 'JMD', stateOrRegion: 'Surrey', flag: '🇯🇲' },
  { name: 'São Paulo, Brazil', lat: -23.5505, lng: -46.6333, country: 'Brazil', currency: 'R$', currencyCode: 'BRL', stateOrRegion: 'São Paulo', flag: '🇧🇷' },

  // Asia & Oceania
  { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, country: 'India', currency: '₹', currencyCode: 'INR', stateOrRegion: 'Maharashtra', flag: '🇮🇳' },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, country: 'United Arab Emirates', currency: 'AED', currencyCode: 'AED', stateOrRegion: 'Dubai', flag: '🇦🇪' },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, country: 'Japan', currency: '¥', currencyCode: 'JPY', stateOrRegion: 'Kanto', flag: '🇯🇵' },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, country: 'Australia', currency: 'A$', currencyCode: 'AUD', stateOrRegion: 'New South Wales', flag: '🇦🇺' }
];

interface GlobalLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: GlobalLocation;
  onSelectLocation: (loc: GlobalLocation) => void;
}

export const GlobalLocationPickerModal: React.FC<GlobalLocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [selectedLoc, setSelectedLoc] = useState<GlobalLocation>(currentLocation);
  const [isLocating, setIsLocating] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [, setRealitiesPreview] = useState<any>(null);
  const [, setIsLoadingRealities] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [voiceNotice, setVoiceNotice] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Text-To-Speech helper for low-literacy accessibility
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedLoc(currentLocation);
      fetchRealities(currentLocation);
      // Friendly audio prompt
      speakText(`Location map open. Tap interactive map or use the green GPS button to select your town.`);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen, currentLocation]);

  const fetchRealities = async (loc: GlobalLocation) => {
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
        setRealitiesPreview(data);
      }
    } catch (e) {
      console.warn("Could not fetch location realities preview:", e);
    } finally {
      setIsLoadingRealities(false);
    }
  };

  // Voice Speech Recognition for easy search without typing
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceNotice("Voice search is not supported on this browser.");
      setTimeout(() => setVoiceNotice(''), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListeningVoice(true);
      setVoiceNotice("🎙️ Listening... Say your city or town name");

      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        setIsListeningVoice(false);
        setVoiceNotice(`Heard: "${spokenText}"`);
        setTimeout(() => setVoiceNotice(''), 3500);

        // Try to match with preset
        const matched = POPULAR_GLOBAL_LOCATIONS.find(l => 
          l.name.toLowerCase().includes(spokenText.toLowerCase()) ||
          spokenText.toLowerCase().includes(l.name.toLowerCase().split(',')[0])
        );
        if (matched) {
          setSelectedLoc(matched);
          fetchRealities(matched);
          speakText(`Selected ${matched.name}`);
        } else {
          // Look up geocoding for spoken text
          if (apiKey) {
            fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(spokenText)}&key=${apiKey}`)
              .then(res => res.json())
              .then(data => {
                if (data.results && data.results[0]) {
                  const addressComp = data.results[0].address_components || [];
                  let city = '';
                  let country = '';
                  addressComp.forEach((c: any) => {
                    if (c.types.includes('locality') || c.types.includes('administrative_area_level_2')) city = c.long_name;
                    if (c.types.includes('country')) country = c.long_name;
                  });
                  const locName = city ? `${city}, ${country}` : data.results[0].formatted_address;
                  const newLoc: GlobalLocation = {
                    name: locName,
                    lat: data.results[0].geometry.location.lat,
                    lng: data.results[0].geometry.location.lng,
                    country: country || 'Global',
                    currency: country.toLowerCase().includes('nigeria') ? '₦' : country.toLowerCase().includes('ghana') ? 'GH₵' : country.toLowerCase().includes('kenya') ? 'KSh' : country.toLowerCase().includes('uk') ? '£' : '$',
                    currencyCode: country.toLowerCase().includes('nigeria') ? 'NGN' : country.toLowerCase().includes('ghana') ? 'GHS' : country.toLowerCase().includes('kenya') ? 'KES' : country.toLowerCase().includes('uk') ? 'GBP' : 'USD',
                    flag: country.toLowerCase().includes('nigeria') ? '🇳🇬' : country.toLowerCase().includes('ghana') ? '🇬🇭' : country.toLowerCase().includes('kenya') ? '🇰🇪' : country.toLowerCase().includes('uk') ? '🇬🇧' : country.toLowerCase().includes('united states') ? '🇺🇸' : '📍'
                  };
                  setSelectedLoc(newLoc);
                  fetchRealities(newLoc);
                  speakText(`Found and selected: ${newLoc.name}`);
                }
              })
              .catch(err => console.warn("Voice search geocode error:", err));
          }
        }
      };

      recognition.onerror = () => {
        setIsListeningVoice(false);
        setVoiceNotice("Could not hear clearly. Please tap the map directly.");
        setTimeout(() => setVoiceNotice(''), 4000);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.start();
    } catch (err) {
      setIsListeningVoice(false);
      setVoiceNotice("Microphone permission needed.");
      setTimeout(() => setVoiceNotice(''), 4000);
    }
  };

  // Device GPS automatic location with full reverse geocoding to prevent using coordinate numbers
  const handleDeviceGPS = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        
        let foundName = 'My Local Community';
        let country = 'Global';
        let currency = '$';
        let currencyCode = 'USD';
        let flag = '📍';

        // Check closest popular location or reverse geocode
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
          // Attempt reverse geocoding to NEVER show raw coordinate numbers to users
          try {
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
            }
          } catch (err) {
            console.warn("Reverse geocode in GPS failed:", err);
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
        setSelectedLoc(newLoc);
        await fetchRealities(newLoc);
        setIsLocating(false);
        speakText(`GPS found your town: ${foundName.split(',')[0]}`);
      },
      (err) => {
        setIsLocating(false);
        setGeoError("Please allow GPS access or tap on the map to pin.");
      },
      { timeout: 10000 }
    );
  };

  // Reverse Geocoding with Google Geocoding API or fallback
  const handleMapClick = async (e: any) => {
    const lat = e.detail?.latLng?.lat || e.latLng?.lat?.();
    const lng = e.detail?.latLng?.lng || e.latLng?.lng?.();
    if (!lat || !lng) return;

    const roundedLat = Number(lat.toFixed(4));
    const roundedLng = Number(lng.toFixed(4));

    try {
      if (apiKey) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${roundedLat},${roundedLng}&key=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.results && data.results[0]) {
          const addressComp = data.results[0].address_components || [];
          let city = '';
          let country = '';
          addressComp.forEach((c: any) => {
            if (c.types.includes('locality') || c.types.includes('administrative_area_level_2')) city = c.long_name;
            if (c.types.includes('country')) country = c.long_name;
          });
          const locName = city ? `${city}, ${country}` : data.results[0].formatted_address.split(',').slice(-2).join(', ').trim();
          
          const newLoc: GlobalLocation = {
            name: locName || 'Grounded Market City',
            lat: roundedLat,
            lng: roundedLng,
            country: country || 'Global',
            currency: country.toLowerCase().includes('nigeria') ? '₦' : country.toLowerCase().includes('ghana') ? 'GH₵' : country.toLowerCase().includes('kenya') ? 'KSh' : country.toLowerCase().includes('uk') ? '£' : '$',
            currencyCode: country.toLowerCase().includes('nigeria') ? 'NGN' : country.toLowerCase().includes('ghana') ? 'GHS' : country.toLowerCase().includes('kenya') ? 'KES' : country.toLowerCase().includes('uk') ? 'GBP' : 'USD',
            flag: country.toLowerCase().includes('nigeria') ? '🇳🇬' : country.toLowerCase().includes('ghana') ? '🇬🇭' : country.toLowerCase().includes('kenya') ? '🇰🇪' : country.toLowerCase().includes('uk') ? '🇬🇧' : country.toLowerCase().includes('united states') ? '🇺🇸' : '📍'
          };
          setSelectedLoc(newLoc);
          fetchRealities(newLoc);
          speakText(`Selected ${newLoc.name.split(',')[0]} on the map.`);
          return;
        }
      }
    } catch (err) {
      console.warn("Geocoding lookup:", err);
    }

    const genericLoc: GlobalLocation = {
      name: 'Grounded Market City',
      lat: roundedLat,
      lng: roundedLng,
      country: 'Global Location',
      currency: '$',
      currencyCode: 'USD',
      flag: '📍'
    };
    setSelectedLoc(genericLoc);
    fetchRealities(genericLoc);
  };

  const handleApply = () => {
    onSelectLocation(selectedLoc);
    localStorage.setItem('ama_global_location', JSON.stringify(selectedLoc));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-4xl max-h-[94vh] rounded-[36px] overflow-hidden flex flex-col shadow-2xl border border-gray-100"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-2xl shadow-md border border-white/30">
                🗺️
              </div>
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/30">
                  Easy Location Picker
                </span>
                <h2 className="text-lg sm:text-2xl font-serif font-black text-white mt-0.5">
                  Where Are You Located?
                </h2>
                <p className="text-[11px] text-emerald-100 text-left">
                  Pin your town directly on the map, use 1-Tap GPS, or speak your city name
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center border-none cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            
            {/* Selected Location Banner & Confirm Button - always visible for immediate confirmation */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50/70 border-2 border-emerald-300 rounded-3xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-2xs">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedLoc.flag || '📍'}</span>
                  <div className="text-left">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                      Selected Town / City
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-black text-gray-900">
                      {selectedLoc.name}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-emerald-800 font-bold pl-1 text-left">
                  Local Currency: {selectedLoc.currency} ({selectedLoc.currencyCode || 'Local'})
                </p>
              </div>

              <button
                onClick={handleApply}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 border-none cursor-pointer active:scale-95 transition-all shrink-0"
              >
                <Check className="w-5 h-5" />
                <span>Confirm & Set Location</span>
              </button>
            </div>

            {/* Pure Map Layout with Controls */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Compact 1-Tap GPS Button */}
                <button
                  onClick={handleDeviceGPS}
                  disabled={isLocating}
                  className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/85 border-2 border-emerald-300 text-emerald-950 flex items-center gap-3 shadow-2xs cursor-pointer transition-all active:scale-98 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
                    {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-emerald-900">
                      {isLocating ? "Locating GPS..." : "🎯 1-Tap GPS Locator"}
                    </h3>
                    <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                      Detect your town with zero typing
                    </p>
                  </div>
                </button>

                {/* Voice Search helper */}
                <button
                  onClick={handleVoiceSearch}
                  disabled={isListeningVoice}
                  className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 shadow-2xs cursor-pointer transition-all active:scale-98 text-left ${
                    isListeningVoice 
                      ? 'bg-rose-50 border-rose-400 text-rose-950 animate-pulse'
                      : 'bg-teal-50 hover:bg-teal-100/85 border-teal-300 text-teal-950'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-xs ${
                    isListeningVoice ? 'bg-rose-600 text-white' : 'bg-teal-600 text-white'
                  }`}>
                    {isListeningVoice ? <MicOff className="w-5 h-5 animate-bounce" /> : <Mic className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-black">
                      {isListeningVoice ? "Listening Now..." : "🎙️ Speak City Name"}
                    </h3>
                    <p className="text-[10px] opacity-85 font-medium mt-0.5">
                      Say e.g. "Port Harcourt" or "Nairobi"
                    </p>
                  </div>
                </button>
              </div>

              {voiceNotice && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-2 text-xs text-teal-900 font-bold text-left animate-pulse">
                  <Volume2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{voiceNotice}</span>
                </div>
              )}

              {geoError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs text-amber-900 font-medium text-left">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{geoError}</span>
                </div>
              )}

              {/* Map Card - Large, spacious, and decluttered */}
              <div className="space-y-2 text-left">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <span>🗺️</span> <span>Tap anywhere on map to select place</span>
                </p>
                <div className="h-80 sm:h-[400px] rounded-3xl overflow-hidden border border-gray-250 relative shadow-inner">
                  <APIProvider apiKey={apiKey}>
                    <Map
                      mapId="DEMO_MAP_ID"
                      defaultCenter={{ lat: selectedLoc.lat, lng: selectedLoc.lng }}
                      center={{ lat: selectedLoc.lat, lng: selectedLoc.lng }}
                      defaultZoom={11}
                      gestureHandling={'greedy'}
                      onClick={handleMapClick}
                      internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                      className="w-full h-full"
                    >
                      <AdvancedMarker position={{ lat: selectedLoc.lat, lng: selectedLoc.lng }}>
                        <Pin background="#059669" borderColor="#ffffff" glyphColor="#ffffff" scale={1.2} />
                      </AdvancedMarker>
                    </Map>
                  </APIProvider>

                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-250 shadow-md text-[10px] font-bold text-gray-700 flex items-center gap-1.5 pointer-events-none">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                    <span>Tap world map to place a custom marker pin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
