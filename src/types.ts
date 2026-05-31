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
  deadline?: string; // YYYY-MM-DD
  priority?: 'low' | 'medium' | 'high';
  difficulty?: 'easy' | 'medium' | 'hard';
  isRecurring?: boolean;
  recurringDays?: string[];
  scheduledDate?: string;
}

export interface UserStats {
  globalStreak: number;
  lastActiveDate?: string; // YYYY-MM-DD
  streakHistory: string[]; // List of YYYY-MM-DD dates active
}

export interface UserProfile {
  name: string;
  avatarSeed: string;
  avatarUrl?: string;
  joinedAt: string;
  isOnboarded: boolean;
  stats: UserStats;
  preferredCategory?: string;
  weeklyGoalCount?: number;
  soundEnabled?: boolean;
}

export interface GoalTask {
  id: string;
  goalId: string; // ID of the linked goal
  title: string;
  completed: boolean;
  value: number; // Increment added to goal's currentValue on completion
  date: string; // Associated date (e.g., YYYY-MM-DD)
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: string; // "peaceful" | "inspired" | "focused" | "tired" | "neutral" | "anxious" | "happy"
  productivity: number; // 0-100 percentage or visual scale index
  thoughts: string; // Freeform notes
  lessons?: string; // What was learned or gained
  celebrations?: string; // What was handled well / small celebrations
  createdAt: string;
  updatedAt: string;
}
