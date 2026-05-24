export interface GoalProgressLog {
  id: string;
  date: string; // YYYY-MM-DD
  value: number; // incremental change or absolute setting
  note?: string;
}

export type GoalFrequency = 'daily' | 'weekly' | 'monthly';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string; // e.g. Health, Career, Mind, Finance, Creative
  targetValue: number;
  currentValue: number;
  unit: string; // e.g. "mins", "km", "pages", "glasses"
  frequency: GoalFrequency;
  streak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  createdAt: string; // YYYY-MM-DD
  color: string; // e.g. "emerald", "indigo", "rose", "amber", "violet"
  icon: string; // Lucide icon identifier
  logs: GoalProgressLog[];
}

export interface UserStats {
  globalStreak: number;
  lastActiveDate?: string; // YYYY-MM-DD
  streakHistory: string[]; // List of YYYY-MM-DD dates active
}

export interface UserProfile {
  name: string;
  avatarSeed: string;
  joinedAt: string;
  isOnboarded: boolean;
  stats: UserStats;
}
