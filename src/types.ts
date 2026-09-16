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

export type ScheduleType = 'interval' | 'specific_times' | 'weekly' | 'prn';

export interface IntervalSchedule {
  intervalHours: number; // e.g. 2, 4, 6, 8, 12
  anchorTime: string; // e.g. "08:00 AM"
  mode: 'continuous_24h' | 'waking_hours';
  wakingStart?: string; // e.g. "07:00 AM"
  wakingEnd?: string; // e.g. "09:00 PM"
}

export interface SpecificTimesSchedule {
  times: string[]; // e.g. ["08:00 AM", "02:00 PM", "08:00 PM"]
}

export interface WeeklySchedule {
  days: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  times: string[]; // e.g. ["09:00 AM", "06:00 PM"]
}

export interface PRNDoseLog {
  id: string;
  timestamp: string; // ISO string
  dosage: string;
  notes?: string;
  loggedBy?: string;
}

export interface PRNSchedule {
  minIntervalHours: number; // e.g. 4 or 6 hours minimum between doses
  maxDosesPer24h: number; // e.g. 4 maximum doses in rolling 24-hour window
  dosage: string; // e.g. "2.5 ml" or "2 drops"
  instructions?: string; // e.g. "For fever > 38.5°C or teething pain"
  doseLogs: PRNDoseLog[];
}

export interface Reminder {
  id: string;
  title: string;
  type?: string; // 'Medication' | 'Fluid Intake' | 'Activity' | 'Other' or 'meal' | 'medication' | 'hydration'
  category?: 'medication' | 'feeding' | 'hydration' | 'activity' | 'routine' | 'other';
  time?: string; // Legacy or primary anchor time, e.g. "08:00 AM"
  interval?: number; // Legacy interval in hours
  lastTriggered?: string; // ISO timestamp
  active?: boolean;
  isActive?: boolean;
  scheduleType: ScheduleType;
  intervalConfig?: IntervalSchedule;
  specificTimesConfig?: SpecificTimesSchedule;
  weeklyConfig?: WeeklySchedule;
  prnConfig?: PRNSchedule;
  dosage?: string;
  unit?: string;
  instructions?: string;
  notes?: string;
  color?: string;
  createdAt?: string;
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
