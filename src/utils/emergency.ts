import { GlobalLocation, POPULAR_GLOBAL_LOCATIONS } from '../components/GlobalLocationPickerModal';

export interface EmergencyInfo {
  number: string;
  label: string;
  country: string;
  city: string;
  pediatricQuery: string;
  notes?: string;
}

const COUNTRY_EMERGENCY_MAP: Record<string, { number: string; notes?: string }> = {
  'nigeria': { number: '112', notes: 'National Emergency Toll-Free (Ambulance, Police, Fire)' },
  'united kingdom': { number: '999', notes: 'Emergency (NHS non-emergency: 111)' },
  'uk': { number: '999', notes: 'Emergency (NHS non-emergency: 111)' },
  'united states': { number: '911', notes: 'Emergency Services (Crisis: 988)' },
  'usa': { number: '911', notes: 'Emergency Services (Crisis: 988)' },
  'canada': { number: '911', notes: 'Emergency Services (Crisis: 988)' },
  'ghana': { number: '112', notes: 'National Emergency Services (Ambulance: 193)' },
  'kenya': { number: '999', notes: 'Emergency Services (Toll-free: 112)' },
  'south africa': { number: '112', notes: 'Cellular Emergency (Police: 10111)' },
  'australia': { number: '000', notes: 'Triple Zero Emergency' },
  'france': { number: '112', notes: 'European Emergency (SAMU Pediatric: 15)' },
  'germany': { number: '112', notes: 'European Emergency & Ambulance' },
  'india': { number: '112', notes: 'National Emergency (Ambulance: 102)' },
  'egypt': { number: '123', notes: 'Ambulance Emergency (Police: 122)' },
  'jamaica': { number: '110', notes: 'Ambulance / Fire (Police: 119)' },
  'brazil': { number: '192', notes: 'SAMU Medical Emergency' },
  'uganda': { number: '112', notes: 'Emergency Toll-Free (Police/Ambulance)' },
  'cameroon': { number: '112', notes: 'Emergency Toll-Free' },
  'united arab emirates': { number: '998', notes: 'National Ambulance (Police: 999)' },
  'uae': { number: '998', notes: 'National Ambulance (Police: 999)' },
  'japan': { number: '119', notes: 'Ambulance & Fire Emergency' }
};

export const getEmergencyInfoForLocation = (location?: GlobalLocation | null): EmergencyInfo => {
  let activeLoc = location;
  if (!activeLoc && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('ama_global_location');
      if (saved) {
        activeLoc = JSON.parse(saved);
      }
    } catch {}
  }

  if (!activeLoc) {
    activeLoc = POPULAR_GLOBAL_LOCATIONS[0]; // Port Harcourt, Nigeria
  }

  const countryLower = (activeLoc.country || '').toLowerCase().trim();
  const matched = COUNTRY_EMERGENCY_MAP[countryLower] || { number: '112', notes: 'International Emergency' };
  const cityName = activeLoc.name ? activeLoc.name.split(',')[0].trim() : 'Local';

  return {
    number: matched.number,
    label: `Call Emergency (${matched.number})`,
    country: activeLoc.country || 'Local Area',
    city: cityName,
    pediatricQuery: `children hospital pediatric emergency ${cityName} ${activeLoc.country || ''}`.trim(),
    notes: matched.notes
  };
};
