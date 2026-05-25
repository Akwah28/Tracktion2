import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Target, 
  TrendingUp, 
  User, 
  Plus, 
  Search, 
  ChevronRight, 
  Check, 
  Sparkles, 
  Calendar,
  Award,
  BookOpen,
  Heart,
  Undo2,
  RefreshCw,
  LogOut,
  Sliders,
  CheckCircle2,
  Filter,
  Share2,
  Trophy
} from 'lucide-react';
import { Goal, UserProfile, GoalFrequency } from './types';
import { CATEGORIES, INITIAL_GOALS } from './sampleData';
import Onboarding from './components/Onboarding';
import CreateGoal from './components/CreateGoal';
import GoalDetail from './components/GoalDetail';
import StatsDashboard from './components/StatsDashboard';
import DynamicIcon from './components/DynamicIcon';
import ShareModal from './components/ShareModal';
import ProfileSettings from './components/ProfileSettings';
import { useAuth } from './context/AuthContext';
import AuthScreen from './components/AuthScreen';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDocFromServer, onSnapshot, setDoc, deleteDoc, collection } from 'firebase/firestore';

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();

  // Load states synced dynamically with Firestore
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isPendingOnboarding, setIsPendingOnboarding] = useState(false);
  const [firestoreOffline, setFirestoreOffline] = useState(false);

  // Navigation states
  const [activeTab, setActiveTab] = useState<'targets' | 'quest' | 'stats' | 'profile'>('targets');
  
  // Selection / Modal states
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Keep selectedGoal in sync with the live goals array
  useEffect(() => {
    if (selectedGoal) {
      const liveGoal = goals.find(g => g.id === selectedGoal.id);
      if (liveGoal) {
        if (JSON.stringify(liveGoal) !== JSON.stringify(selectedGoal)) {
          setSelectedGoal(liveGoal);
        }
      } else {
        setSelectedGoal(null);
      }
    }
  }, [goals, selectedGoal]);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [sharingGoal, setSharingGoal] = useState<Goal | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Progress' | 'Completed'>('All');

  // Trigger celebration banner when a goal gets newly completed
  const [celebrationGoal, setCelebrationGoal] = useState<string | null>(null);

  // Operational error feedback toast
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const triggerError = (error: unknown, op: OperationType, path: string) => {
    try {
      handleFirestoreError(error, op, path);
    } catch (err: any) {
      try {
        const parsed = JSON.parse(err.message);
        let errorMsg = parsed.error || "A secure connection or authorization error occurred.";
        if (errorMsg.includes("permission") || errorMsg.includes("unauthorized") || errorMsg.includes("Missing or insufficient permissions")) {
          errorMsg = "Security Block: You are not authorized to perform this operation.";
        }
        setErrorMessage(errorMsg);
      } catch {
        setErrorMessage("Secure database operation failed.");
      }
    }
  };

  // Auto-dismiss errors after timeout
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Validate Connection to Firestore on initial boot
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setFirestoreOffline(false);
      } catch (error) {
        setFirestoreOffline(true);
        console.warn("Firestore backend currently offline/unreachable. Seamlessly fell back to IndexedDB local cache.");
      }
    }
    testConnection();
  }, []);

  // Sync with Firestore profile & goals when user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setGoals([]);
      setIsPendingOnboarding(false);
      return;
    }

    // Dynamic subscription to UserProfile
    const unsubscribeProfile = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
          setIsPendingOnboarding(false);
        } else {
          setProfile(null);
          setIsPendingOnboarding(true);
        }
      },
      (error) => {
        triggerError(error, OperationType.GET, `users/${user.uid}`);
      }
    );

    // Dynamic subscription to tracker Goals list
    const unsubscribeGoals = onSnapshot(
      collection(db, 'users', user.uid, 'goals'),
      (snapshot) => {
        const list: Goal[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Goal);
        });
        // Sort goals by creation date descending
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setGoals(list);
      },
      (error) => {
        triggerError(error, OperationType.LIST, `users/${user.uid}/goals`);
      }
    );

    return () => {
      unsubscribeProfile();
      unsubscribeGoals();
    };
  }, [user]);

  // Helper date function
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  // Complete onboarding workflow callback
  const handleOnboardingComplete = async (newProfile: UserProfile, initialGoals: Goal[]) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      for (const g of initialGoals) {
        await setDoc(doc(db, 'users', user.uid, 'goals', g.id), g);
      }
      setActiveTab('targets');
      setIsPendingOnboarding(false);
    } catch (error) {
      triggerError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  // Create or Update Goal callback
  const handleSaveGoal = async (goalData: {
    id?: string;
    title: string;
    description: string;
    category: string;
    targetValue: number;
    unit: string;
    frequency: GoalFrequency;
    color: string;
    icon: string;
    deadline?: string;
    priority?: 'low' | 'medium' | 'high';
    difficulty?: 'easy' | 'medium' | 'hard';
  }) => {
    if (!user) return;
    const today = getTodayStr();

    try {
      if (goalData.id) {
        // Editing existing Goal
        const existingGoal = goals.find(g => g.id === goalData.id);
        if (!existingGoal) return;

        const updatedVal = Math.min(existingGoal.currentValue, goalData.targetValue);
        const updatedGoal: Goal = {
          ...existingGoal,
          title: goalData.title,
          description: goalData.description,
          category: goalData.category,
          targetValue: goalData.targetValue,
          currentValue: updatedVal,
          unit: goalData.unit,
          frequency: goalData.frequency,
          color: goalData.color,
          icon: goalData.icon,
          deadline: goalData.deadline || undefined,
          priority: goalData.priority || 'medium',
          difficulty: goalData.difficulty || 'medium',
        };
        await setDoc(doc(db, 'users', user.uid, 'goals', goalData.id), updatedGoal);
      } else {
        // Creating NEW tracked Goal
        const goalId = `goal-${Date.now()}`;
        const newGoal: Goal = {
          id: goalId,
          title: goalData.title,
          description: goalData.description,
          category: goalData.category,
          targetValue: goalData.targetValue,
          currentValue: 0,
          unit: goalData.unit,
          frequency: goalData.frequency,
          streak: 0,
          createdAt: today,
          color: goalData.color,
          icon: goalData.icon,
          logs: [],
          deadline: goalData.deadline || undefined,
          priority: goalData.priority || 'medium',
          difficulty: goalData.difficulty || 'medium',
        };
        await setDoc(doc(db, 'users', user.uid, 'goals', goalId), newGoal);
      }
      setIsCreatingGoal(false);
      setEditingGoal(undefined);
    } catch (error) {
      triggerError(error, OperationType.WRITE, `users/${user.uid}/goals/${goalData.id || 'new'}`);
    }
  };

  // Delete goal
  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'goals', goalId));
      if (selectedGoal?.id === goalId) {
        setSelectedGoal(null);
      }
    } catch (error) {
      triggerError(error, OperationType.DELETE, `users/${user.uid}/goals/${goalId}`);
    }
  };

  // Delete single history log
  const handleDeleteLog = async (goalId: string, logId: string) => {
    if (!user) return;
    const g = goals.find(item => item.id === goalId);
    if (!g) return;

    try {
      const foundLog = g.logs.find(l => l.id === logId);
      if (!foundLog) return;

      const updatedLogs = g.logs.filter(l => l.id !== logId);
      const updatedVal = Math.max(0, g.currentValue - foundLog.value);

      // Recalculate streak if removing the last completed action
      let newStreak = g.streak;
      if (updatedVal < g.targetValue && g.currentValue >= g.targetValue) {
        newStreak = Math.max(0, g.streak - 1);
      }

      const updatedGoal: Goal = {
        ...g,
        logs: updatedLogs,
        currentValue: updatedVal,
        streak: newStreak,
        lastCompletedDate: updatedLogs.length > 0 ? updatedLogs[updatedLogs.length - 1].date : undefined
      };

      await setDoc(doc(db, 'users', user.uid, 'goals', goalId), updatedGoal);

      setTimeout(() => {
        setSelectedGoal(updatedGoal);
      }, 50);
    } catch (error) {
      triggerError(error, OperationType.WRITE, `users/${user.uid}/goals/${goalId}`);
    }
  };

  // Log session progress & compute streak indices
  const handleUpdateProgress = async (goalId: string, increment: number, note?: string) => {
    if (!user || !profile) return;
    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    const g = goals.find(item => item.id === goalId);
    if (!g) return;

    try {
      const prevValue = g.currentValue;
      const nextValue = g.currentValue + increment;
      const reachedCompletion = nextValue >= g.targetValue;
      const wasCompletedBefore = prevValue >= g.targetValue;

      const newLog = {
        id: `log-${Date.now()}`,
        date: today,
        value: increment,
        note
      };

      const updatedLogs = [...g.logs, newLog];

      let updatedStreak = g.streak;
      let finalCompletionDate = g.lastCompletedDate;

      if (reachedCompletion && !wasCompletedBefore) {
        // Goal is completed newly today!
        setCelebrationGoal(g.title);
        setTimeout(() => setCelebrationGoal(null), 3000);

        finalCompletionDate = today;

        if (!g.lastCompletedDate) {
          updatedStreak = 1;
        } else if (g.lastCompletedDate === yesterday) {
          updatedStreak += 1;
        } else if (g.lastCompletedDate === today) {
          // already completed today
        } else {
          updatedStreak = 1;
        }
      }

      const updatedGoal: Goal = {
        ...g,
        currentValue: nextValue,
        logs: updatedLogs,
        streak: updatedStreak,
        lastCompletedDate: finalCompletionDate
      };

      // Update goal in Firestore
      await setDoc(doc(db, 'users', user.uid, 'goals', goalId), updatedGoal);

      setTimeout(() => {
        setSelectedGoal(updatedGoal);
      }, 50);

      // Update global user streak history
      const updatedHistory = Array.from(new Set([...profile.stats.streakHistory, today])).sort();
      
      let contiguousStreak = 0;
      let hasStreakForCheck = true;

      // Verify if today or yesterday are in history
      const hasToday = updatedHistory.includes(today);
      const hasYesterday = updatedHistory.includes(yesterday);

      if (hasToday || hasYesterday) {
        let currentCheckStr = hasToday ? today : yesterday;
        contiguousStreak = 0;
        
        // Loop backward checking sequential daily existence
        const daysToCheck = new Date(currentCheckStr);
        while (hasStreakForCheck) {
          const checkStr = daysToCheck.toISOString().split('T')[0];
          if (updatedHistory.includes(checkStr)) {
            contiguousStreak++;
            daysToCheck.setDate(daysToCheck.getDate() - 1);
          } else {
            hasStreakForCheck = false;
          }
        }
      }

      const updatedProfile: UserProfile = {
        ...profile,
        stats: {
          ...profile.stats,
          globalStreak: contiguousStreak,
          lastActiveDate: today,
          streakHistory: updatedHistory
        }
      };

      // Set user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), updatedProfile);
    } catch (error) {
      triggerError(error, OperationType.WRITE, `users/${user.uid}/goals/${goalId}`);
    }
  };

  // Immediate 1-step completion shortcut on main card list
  const handleQuickComplete = (e: React.MouseEvent, goal: Goal) => {
    e.stopPropagation();
    const needed = Math.max(0, goal.targetValue - goal.currentValue);
    if (needed > 0) {
      handleUpdateProgress(goal.id, needed, 'Quick complete check-in');
    }
  };

  // Reset demo profile setup to sample placeholder data
  const handleLoadSampleData = async () => {
    if (!user) return;
    const demoProfile: UserProfile = {
      name: 'Sarah Jenkins',
      avatarSeed: '🦊',
      joinedAt: getYesterdayStr(),
      isOnboarded: true,
      stats: {
        globalStreak: 3,
        lastActiveDate: getYesterdayStr(),
        streakHistory: [
          getYesterdaysDay(3),
          getYesterdaysDay(2),
          getYesterdaysDay(1)
        ]
      }
    };

    try {
      await setDoc(doc(db, 'users', user.uid), demoProfile);
      
      // Delete existing goals first
      for (const g of goals) {
        await deleteDoc(doc(db, 'users', user.uid, 'goals', g.id));
      }

      // Load presets sample
      for (const g of INITIAL_GOALS) {
        await setDoc(doc(db, 'users', user.uid, 'goals', g.id), g);
      }

      setActiveTab('targets');
      setSelectedGoal(null);
      setIsCreatingGoal(false);
    } catch (error) {
      triggerError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  // Helper code to get dynamic yesterday strings for sample data
  function getYesterdaysDay(daysAgo: number): string {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  }

  const handleResetApp = async () => {
    try {
      await logout();
      setSelectedGoal(null);
      setIsCreatingGoal(false);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };


  // Filter list values
  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      const matchSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (g.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = categoryFilter === 'All' || g.category === categoryFilter;
      
      const matchStatus = statusFilter === 'All' || 
                           (statusFilter === 'Completed' && g.currentValue >= g.targetValue) ||
                           (statusFilter === 'Progress' && g.currentValue < g.targetValue);
      
      return matchSearch && matchCategory && matchStatus;
    });
  }, [goals, searchQuery, categoryFilter, statusFilter]);

  // 1. Show a full-page loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="flex bg-slate-900 justify-center items-center min-h-screen">
        <div className="bg-slate-50/90 w-full max-w-md h-[100dvh] md:h-[840px] md:rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-950 flex flex-col justify-center items-center space-y-4 relative">
          <div className="absolute top-[-10%] left-[-10%] w-[65%] h-[40%] bg-indigo-300/30 rounded-full blur-[80px] pointer-events-none animate-pulse-glow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[75%] h-[45%] bg-blue-300/30 rounded-full blur-[90px] pointer-events-none animate-pulse-glow-alt" />
          
          <div className="relative">
            <div className="h-16 w-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-3xl blur-md opacity-40 animate-pulse" />
              <Flame className="w-8 h-8 text-white relative z-10 animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-700 animate-pulse">Syncing Tracktion Session...</p>
        </div>
      </div>
    );
  }

  // 2. Redirect unauthenticated users to login
  if (!user) {
    return (
      <div className="flex bg-slate-900 justify-center items-center min-h-screen">
        <div className="bg-slate-50/90 w-full max-w-md h-[100dvh] md:h-[840px] md:rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-950 flex flex-col justify-between relative">
          <div className="absolute top-[-10%] left-[-10%] w-[65%] h-[40%] bg-indigo-300/30 rounded-full blur-[80px] pointer-events-none animate-pulse-glow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[75%] h-[45%] bg-blue-300/30 rounded-full blur-[90px] pointer-events-none animate-pulse-glow-alt" />
          
          <AuthScreen />
        </div>
      </div>
    );
  }

  // 3. Render onboarding if user has not completed profile setup
  if (isPendingOnboarding || !profile) {
    return (
      <div className="flex bg-slate-900 justify-center items-center min-h-screen">
        <div className="bg-slate-50/90 w-full max-w-md h-[100dvh] md:h-[840px] md:rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-950 flex flex-col justify-between relative">
          
          <div className="absolute top-[-10%] left-[-10%] w-[65%] h-[40%] bg-indigo-300/30 rounded-full blur-[80px] pointer-events-none animate-pulse-glow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[75%] h-[45%] bg-blue-300/30 rounded-full blur-[90px] pointer-events-none animate-pulse-glow-alt" />
          
          <Onboarding onComplete={handleOnboardingComplete} />
        </div>
      </div>
    );
  }

  // Define Category Class decorators
  const colorBgs: Record<string, string> = {
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
    violet: 'bg-violet-500',
    sky: 'bg-sky-500',
  };

  const textColors: Record<string, string> = {
    emerald: 'text-emerald-700',
    indigo: 'text-indigo-700',
    rose: 'text-rose-700',
    amber: 'text-amber-700',
    violet: 'text-violet-700',
    sky: 'text-sky-700',
  };

  const borderColors: Record<string, string> = {
    emerald: 'border-emerald-150',
    indigo: 'border-indigo-150',
    rose: 'border-rose-150',
    amber: 'border-amber-150',
    violet: 'border-violet-150',
    sky: 'border-sky-150',
  };

  return (
    <div className="flex bg-slate-900 justify-center items-center min-h-screen font-sans">
      {/* Visual device wrapper bounding container */}
      <div className="bg-slate-50/90 w-full max-w-md h-[100dvh] md:h-[840px] md:rounded-[40px] overflow-hidden shadow-2xl relative flex flex-col justify-between border-4 border-slate-950">
        
        {/* Ambient background blur blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[65%] h-[40%] bg-indigo-200/45 rounded-full blur-[80px] pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[75%] h-[45%] bg-blue-200/45 rounded-full blur-[90px] pointer-events-none animate-pulse-glow-alt" />
        
        {/* Real-time celebration overlay popup banner */}
        <AnimatePresence>
          {celebrationGoal && (
            <motion.div
              initial={{ opacity: 0, y: -80 }}
              animate={{ opacity: 1, y: 16 }}
              exit={{ opacity: 0, y: -80 }}
              className="absolute left-4 right-4 z-50 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-2xl shadow-xl p-4 flex items-center gap-3.5 border border-emerald-400"
            >
              <div className="p-2 bg-white/20 rounded-xl relative">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-100 block">Accomplishment!</span>
                <h4 className="text-xs font-bold truncate">"{celebrationGoal}" completed!</h4>
              </div>
              <span className="text-lg">🔥</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-time error feedback toast */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -80 }}
              animate={{ opacity: 1, y: 16 }}
              exit={{ opacity: 0, y: -80 }}
              className="absolute left-4 right-4 z-50 bg-rose-600 text-white rounded-2xl shadow-xl p-4 flex items-center justify-between gap-3.5 border border-rose-500"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-rose-200 block">Database Notification</span>
                  <p className="text-xs font-bold truncate text-white">{errorMessage}</p>
                </div>
              </div>
              <button 
                onClick={() => setErrorMessage(null)} 
                className="py-1 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 hover:text-white transition-all text-[10px] font-extrabold uppercase tracking-wider flex-shrink-0"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic page sheet sliders */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          
          {/* Main targets lists dashboard */}
          {activeTab === 'targets' && (
            <div className="p-5 space-y-6">
              
              {/* Premium Top Navigation header profile bar */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2.5">
                  <div className="h-11 w-11 bg-indigo-100 border-2 border-indigo-200 rounded-2xl flex items-center justify-center text-2xl shadow-xs overflow-hidden">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="User Portrait" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                    ) : (
                      profile.avatarSeed
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Traction State</span>
                      {firestoreOffline && (
                        <span className="inline-flex items-center gap-0.5 text-[8.5px] leading-none px-1.5 py-0.5 bg-amber-50 text-amber-700 font-black rounded-sm border border-amber-200/50 uppercase tracking-widest animate-pulse pointer-events-none">
                          Cached
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-800">
                      Hi, {profile.name}!
                    </h2>
                  </div>
                </div>

                {/* Main collective user global streak */}
                <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-full py-1.5 px-3.5 shadow-xs">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-orange-700">
                    {profile.stats.globalStreak} <span className="text-[10px] font-bold text-orange-600">Streak</span>
                  </span>
                </div>
              </div>

              {/* Habit calendar tracker streak indicator bar */}
              <div className="frosted-card p-4 rounded-3xl space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Active Registry
                  </span>
                  <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50/60 border border-indigo-100 py-0.5 px-2 rounded-full">
                    Last 7 days
                  </span>
                </div>
 
                <div className="grid grid-cols-7 gap-1">
                  {[6, 5, 4, 3, 2, 1, 0].map((daysAgo) => {
                    const dateObj = new Date();
                    dateObj.setDate(dateObj.getDate() - daysAgo);
                    const dateString = dateObj.toISOString().split('T')[0];
                    const dayInitial = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
                    const isCompleted = profile.stats.streakHistory.includes(dateString);
                    const isToday = daysAgo === 0;
 
                    return (
                      <div key={daysAgo} className="flex flex-col items-center gap-1.5">
                        <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-600 font-extrabold' : 'text-slate-400'}`}>
                          {dayInitial}
                        </span>
                        <div 
                          className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-all text-sm ${
                            isCompleted 
                              ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm' 
                              : isToday 
                                ? 'bg-white/60 border-indigo-400 text-slate-400' 
                                : 'bg-white/30 border-white/40 text-slate-400'
                          }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4 font-extrabold" /> : <span className="text-[10px] font-bold">{dateObj.getDate()}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic live goals filters search block */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search your tracked habits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full frosted-input py-3 pl-10 pr-4 text-xs font-semibold placeholder-slate-400 rounded-2xl focus:outline-none shadow-xs transition-all text-slate-700"
                  />
                  <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3.5" />
                </div>

                {/* Sub-Category Filters lists scroll slider */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {['All', ...CATEGORIES.map(c => c.name)].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                        categoryFilter === cat 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                          : 'frosted-button-secondary text-slate-500 hover:text-slate-700 border-white/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Progress completed state toggles */}
                <div className="flex items-center justify-between border-t border-slate-100/50 pt-2.5">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Filter Progress
                  </span>
                  <div className="flex bg-slate-200/30 backdrop-blur-xs p-0.5 rounded-xl border border-white/40">
                    {(['All', 'Progress', 'Completed'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                          statusFilter === status 
                            ? 'bg-white/80 backdrop-blur-xs text-slate-800 shadow-xs' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic filtered goals card registry */}
              <div className="space-y-3 pb-10">
                {filteredGoals.length === 0 ? (
                  <div className="text-center py-10 frosted-card rounded-3xl p-5 space-y-3 shadow-xs">
                    <div className="p-3 bg-indigo-50 rounded-2xl w-fit mx-auto text-indigo-500">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">No matching habits found</h4>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                        Refine your search tags or hit the floating action button below to create a brand new target track!
                      </p>
                    </div>

                    {goals.length === 0 && (
                      <button
                        onClick={handleLoadSampleData}
                        className="mx-auto mt-4 flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold py-2.5 px-4 rounded-xl text-[10px]"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Load Sarah's Sample Records
                      </button>
                    )}
                  </div>
                ) : (
                  filteredGoals.map((g) => {
                    const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
                    const isDone = g.currentValue >= g.targetValue;
                    
                    return (
                      <div
                        key={g.id}
                        onClick={() => {
                          setSelectedGoal(g);
                          setActiveTab('quest');
                        }}
                        className={`frosted-card p-4.5 rounded-3xl hover:border-indigo-300 hover:shadow-sm transition-all duration-300 cursor-pointer relative overflow-hidden group hover:scale-[1.01] ${
                          isDone ? 'ring-2 ring-emerald-500/20 bg-emerald-50/15' : ''
                        }`}
                        id={`goal-card-${g.id}`}
                      >
                        <div className="flex gap-3.5">
                          {/* Visual Left Accent Icon shape */}
                          <div className={`p-3 rounded-2xl border aspect-square h-fit ${
                            g.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            g.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                            g.color === 'rose' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            g.color === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            g.color === 'violet' ? 'bg-violet-50 text-violet-600 border-violet-100' : 
                            'bg-sky-50 text-sky-600 border-sky-100'
                          }`}>
                            <DynamicIcon name={g.icon} size={20} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between pr-4">
                              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block">
                                {g.category}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {g.streak > 0 && (
                                  <span className="text-[9px] font-bold text-orange-600 uppercase flex items-center gap-0.5 bg-orange-50 border border-orange-100 px-1.5 py-0.2 rounded-md">
                                    <Flame className="w-3 h-3 text-orange-500" /> {g.streak}d
                                  </span>
                                )}
                                <span className="text-[9px] font-bold text-slate-400 capitalize bg-slate-50 py-0.2 px-1.5 rounded-md">
                                  {g.frequency}
                                </span>
                              </div>
                            </div>

                            <h3 className="text-sm font-bold text-slate-800 leading-snug mt-0.5 truncate flex items-center gap-1.5">
                              {g.title}
                              {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />}
                            </h3>

                            {/* Progression indicators */}
                            <div className="mt-3 flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    className={`h-full ${colorBgs[g.color] || 'bg-indigo-500'}`} 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                                  />
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <span className="text-[11px] font-extrabold text-slate-700">
                                  {g.currentValue} <span className="text-[9px] text-slate-400 font-normal">/ {g.targetValue} {g.unit}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Share button and Quick checking visual action */}
                          <div className="flex items-center gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSharingGoal(g);
                              }}
                              className="h-8 w-8 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 bg-white transition-all active:scale-90"
                              title="Share progress"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>

                            {!isDone ? (
                              <button
                                onClick={(e) => handleQuickComplete(e, g)}
                                className={`h-8 w-8 rounded-xl border flex items-center justify-center transition-all shadow-xs p-1 ${
                                  g.color === 'emerald' ? 'hover:bg-emerald-50 border-emerald-200 text-emerald-600' :
                                  g.color === 'indigo' ? 'hover:bg-indigo-50 border-indigo-200 text-indigo-600' :
                                  g.color === 'rose' ? 'hover:bg-rose-50 border-rose-200 text-rose-600' :
                                  g.color === 'amber' ? 'hover:bg-amber-50 border-amber-200 text-amber-600' :
                                  g.color === 'violet' ? 'hover:bg-violet-50 border-violet-200 text-violet-600' : 
                                  'hover:bg-sky-50 border-sky-200 text-sky-600'
                                } bg-white font-bold active:scale-90`}
                                title="Quick mark complete"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
                                <Check className="w-4 h-4 font-bold" />
                              </div>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-350 absolute top-[43%] right-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Goal Detail & Quest View screen */}
          {activeTab === 'quest' && (
            <div className="h-full flex flex-col bg-slate-50 relative">
              {selectedGoal ? (
                <div className="flex-1 h-full relative">
                  <GoalDetail
                    goal={selectedGoal}
                    onClose={() => {
                      setSelectedGoal(null);
                      setActiveTab('targets');
                    }}
                    onUpdateProgress={handleUpdateProgress}
                    onDeleteLog={handleDeleteLog}
                    onEdit={(goal) => {
                      setEditingGoal(goal);
                      setIsCreatingGoal(true);
                    }}
                    onDeleteGoal={handleDeleteGoal}
                    onShare={(goal) => setSharingGoal(goal)}
                  />
                </div>
              ) : (
                <div className="p-5 space-y-6 flex-1 overflow-y-auto no-scrollbar">
                  <div className="pb-1 text-left">
                    <span className="text-[10px] text-indigo-605 font-extrabold uppercase tracking-wider block">Quest Chronicles</span>
                    <h2 className="text-xl font-extrabold text-slate-800">Select Active Goal</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Choose a goal to inspect its full progress trail, check-in activity history, and game-rank milestones.</p>
                  </div>

                  {goals.length === 0 ? (
                    <div className="frosted-card p-8 rounded-3xl text-center space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-50/50 text-indigo-500 flex items-center justify-center mx-auto">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">No Active Goals Found</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                          Initialize a new quest pathway to get started on your gamified habit mastery.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingGoal(undefined);
                          setIsCreatingGoal(true);
                        }}
                        className="py-2.5 px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        Create New Goal
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {goals.map((g) => {
                        const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
                        return (
                          <div
                            key={g.id}
                            onClick={() => setSelectedGoal(g)}
                            className="bg-white/70 hover:bg-white border border-slate-100 rounded-3xl p-4.5 transition-all duration-200 cursor-pointer shadow-3xs flex items-center justify-between group active:scale-[0.99] hover:border-indigo-100 relative overflow-hidden text-left"
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              <div className="p-3 rounded-2xl border flex items-center justify-center text-indigo-600 bg-indigo-50/40 border-indigo-100/50">
                                <DynamicIcon name={g.icon} size={20} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-extrabold text-slate-800 truncate">{g.title}</h4>
                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                                  <span className="font-extrabold capitalize text-indigo-550">{g.frequency}</span>
                                  <span>•</span>
                                  <span>{g.currentValue} / {g.targetValue} {g.unit}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                  <div
                                    style={{ width: `${pct}%` }}
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                  />
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 ml-2 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Aggregate analytics and statistics screen charts */}
          {activeTab === 'stats' && (
            <div className="p-5 space-y-6">
              <div className="pb-1">
                <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider block">Intelligence Suite</span>
                <h2 className="text-xl font-extrabold text-slate-800">Consistency Analytics</h2>
              </div>

              <StatsDashboard goals={goals} profile={profile} />
            </div>
          )}

          {/* Account Profile Screen Settings */}
          {activeTab === 'profile' && profile && (
            <ProfileSettings 
              profile={profile} 
              goals={goals} 
              onResetApp={handleResetApp} 
              onLoadSample={handleLoadSampleData} 
            />
          )}

        </div>

        {/* Floating Action Button for Habit Creators list, visible on the Targets tab */}
        {activeTab === 'targets' && (
          <button
            onClick={() => {
              setEditingGoal(undefined);
              setIsCreatingGoal(true);
            }}
            className="absolute bottom-20 right-5 z-20 h-14 w-14 rounded-2xl bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center border border-slate-800 group"
            id="floating-create-goal"
          >
            <Plus className="w-7 h-7 text-white font-extrabold group-hover:rotate-90 transition-transform" />
          </button>
        )}

        {/* Bottom tab bar mobile navigation */}
        <div className="h-[72px] bg-white/45 backdrop-blur-lg border-t border-white/60 flex items-center justify-around px-2 z-10">
          
          <button
            onClick={() => setActiveTab('targets')}
            className={`flex flex-col items-center gap-1 py-1.5 px-4.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'targets' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Target className="w-5 h-5" />
            <span className="text-[9px] font-extrabold uppercase tracking-wide">Targets</span>
          </button>

          <button
            onClick={() => setActiveTab('quest')}
            className={`flex flex-col items-center gap-1 py-1.5 px-4.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'quest' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[9px] font-extrabold uppercase tracking-wide">Goal</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center gap-1 py-1.5 px-4.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'stats' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[9px] font-extrabold uppercase tracking-wide">Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-1.5 px-4.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-extrabold uppercase tracking-wide">Profile</span>
          </button>

        </div>

        {/* 1. Full detailed overlay view sheet fallback */}
        <AnimatePresence>
          {selectedGoal && activeTab !== 'quest' && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute inset-0 bg-slate-50 z-30"
            >
              <GoalDetail
                goal={selectedGoal}
                onClose={() => setSelectedGoal(null)}
                onUpdateProgress={handleUpdateProgress}
                onDeleteLog={handleDeleteLog}
                onEdit={(goal) => {
                  setEditingGoal(goal);
                  setIsCreatingGoal(true);
                }}
                onDeleteGoal={handleDeleteGoal}
                onShare={(goal) => setSharingGoal(goal)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Full Creator / Editor overlay view sheet */}
        <AnimatePresence>
          {isCreatingGoal && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 210 }}
              className="absolute inset-0 bg-slate-50 z-40"
            >
              <CreateGoal
                onSave={handleSaveGoal}
                onCancel={() => {
                  setIsCreatingGoal(false);
                  setEditingGoal(undefined);
                }}
                editingGoal={editingGoal}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Share Menu overlay dialog */}
        <AnimatePresence>
          {sharingGoal && (
            <ShareModal
              goal={sharingGoal}
              onClose={() => setSharingGoal(null)}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
