import { Goal } from './types';

export const CATEGORIES = [
  { name: 'Wellness', icon: 'Heart', color: 'emerald', bgClass: 'bg-emerald-50 text-emerald-600 border-emerald-100', textClass: 'text-emerald-700' },
  { name: 'Learning', icon: 'BookOpen', color: 'indigo', bgClass: 'bg-indigo-50 text-indigo-600 border-indigo-100', textClass: 'text-indigo-700' },
  { name: 'Creative', icon: 'PenTool', color: 'violet', bgClass: 'bg-violet-50 text-violet-600 border-violet-100', textClass: 'text-violet-700' },
  { name: 'Mindfulness', icon: 'Sparkles', color: 'amber', bgClass: 'bg-amber-50 text-amber-600 border-amber-100', textClass: 'text-amber-700' },
  { name: 'Fitness', icon: 'Flame', color: 'rose', bgClass: 'bg-rose-50 text-rose-600 border-rose-100', textClass: 'text-rose-700' },
  { name: 'Productivity', icon: 'CheckCircle', color: 'sky', bgClass: 'bg-sky-50 text-sky-600 border-sky-100', textClass: 'text-sky-700' },
];

// Let's generate a dynamic list of dates in YYYY-MM-DD for current/past days.
const todayStr = new Date().toISOString().split('T')[0];
const getPastDateString = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Daily Meditation',
    description: 'Calm the mind and practice mindful breathing.',
    category: 'Mindfulness',
    targetValue: 15,
    currentValue: 15,
    unit: 'mins',
    frequency: 'daily',
    streak: 6,
    lastCompletedDate: getPastDateString(0), // completed today
    createdAt: getPastDateString(10),
    color: 'amber',
    icon: 'Sparkles',
    logs: [
      { id: 'log-1-1', date: getPastDateString(2), value: 15, note: 'Deep focus session' },
      { id: 'log-1-2', date: getPastDateString(1), value: 15, note: 'Quick morning check' },
      { id: 'log-1-3', date: getPastDateString(0), value: 15, note: 'End-of-day breathing' },
    ],
  },
  {
    id: 'goal-2',
    title: 'Read Books Twice',
    description: 'Read the next chapter of Designing Systems.',
    category: 'Learning',
    targetValue: 20,
    currentValue: 10,
    unit: 'pages',
    frequency: 'daily',
    streak: 3,
    lastCompletedDate: getPastDateString(1), // yesterday
    createdAt: getPastDateString(8),
    color: 'indigo',
    icon: 'BookOpen',
    logs: [
      { id: 'log-2-1', date: getPastDateString(2), value: 20, note: 'Finished chapter 4' },
      { id: 'log-2-2', date: getPastDateString(1), value: 20, note: 'Insightful section' },
    ],
  },
  {
    id: 'goal-3',
    title: 'Morning Jump Run',
    description: 'Maintain steady cardio to improve recovery rate.',
    category: 'Fitness',
    targetValue: 5,
    currentValue: 3,
    unit: 'km',
    frequency: 'daily',
    streak: 0,
    lastCompletedDate: undefined,
    createdAt: getPastDateString(3),
    color: 'rose',
    icon: 'Flame',
    logs: [],
  },
  {
    id: 'goal-4',
    title: 'UI Design Sketching',
    description: 'Experiment with layout designs for Tracktion app.',
    category: 'Creative',
    targetValue: 1,
    currentValue: 1,
    unit: 'session',
    frequency: 'weekly',
    streak: 4,
    lastCompletedDate: getPastDateString(1),
    createdAt: getPastDateString(20),
    color: 'violet',
    icon: 'PenTool',
    logs: [
      { id: 'log-4-1', date: getPastDateString(8), value: 1, note: 'Logo sketches' },
      { id: 'log-4-2', date: getPastDateString(1), value: 1, note: 'Onboarding design' },
    ],
  }
];
