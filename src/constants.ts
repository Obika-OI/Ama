import { Meal, Activity } from './types';

export const STANDARD_RECIPES: Meal[] = [];

export const THEME = {
  primary: '#37b1f5', // Sky blue (water)
  secondary: '#FFD6E8', // Pastel Pink (card)
  accent: '#ffd700', // Standard Gold (stars)
  background: '#D2E9F9', // Light Blue
  card: '#FFD6E8', // Pastel Pink
  text: '#2D3436',
  muted: '#636E72',
  fontSerif: '"Playfair Display", serif',
};

export const QUEST_POOL: Activity[] = [];

export const DEFAULT_ACTIVITIES = [];

export const DEFAULT_REMINDERS: any[] = [];

// Default Standard Reference Libraries
export const STANDARD_MEALS = STANDARD_RECIPES;
export const DEFAULT_ACTIVITIES_LIST = DEFAULT_ACTIVITIES;
export const DEFAULT_REMINDERS_LIST = DEFAULT_REMINDERS;

// Backward-compatible exports
export const MOCK_MEALS = STANDARD_RECIPES;
export const MOCK_ACTIVITIES = DEFAULT_ACTIVITIES;
export const MOCK_REMINDERS = DEFAULT_REMINDERS;
