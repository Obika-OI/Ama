export interface Meal {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  image: string;
  stage: 'First Purees' | 'Second Foods' | 'Soft Solids' | 'Finger Foods' | 'Weaning Prep' | 'Purees' | 'Solids' | 'Snacks';
  category?: 'Purees' | 'Solids' | 'Finger Foods' | 'Snacks' | 'Cereals';
  costPerServe?: string;
  nutrients: { label: string; value: string; icon?: string }[];
  ingredients: { name: string; amount: string }[];
  steps: string[];
}

export interface FeedingSession {
  id: string;
  startTime: number;
  duration: number; // in seconds
  type: 'breast' | 'bottle' | 'solids';
  amount?: string;
}

export interface Reminder {
  id: string;
  title: string;
  time?: string; // Specific time like "08:30"
  interval?: number; // Interval in hours like 2
  lastTriggered?: string; // ISO timestamp
  isActive: boolean;
  type: 'meal' | 'medication' | 'hydration';
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  points: number;
  category: 'physical' | 'cognitive' | 'social' | 'sensory';
  isCompleted: boolean;
  icon: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  mealId?: string;
  notes: string;
  ratings?: {
    aesthetics: number;
    taste: number;
    satisfaction: number;
    appetising: number;
    acceptance: number;
  };
  reaction?: string;
  hasAllergy: boolean;
}
