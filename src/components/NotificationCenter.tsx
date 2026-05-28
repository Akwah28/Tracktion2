import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Calendar, 
  AlertCircle,
  HelpCircle,
  Clock,
  Heart,
  Undo2,
  BookmarkCheck,
  ChevronRight
} from 'lucide-react';
import { Goal, GoalTask, UserProfile } from '../types';

interface NotificationCenterProps {
  profile: UserProfile;
  goals: Goal[];
  tasks: GoalTask[];
  onClose?: () => void;
  onNavigateToQuest?: () => void;
  onNavigateToTargets?: () => void;
}

interface SmartNotification {
  id: string;
  type: 'unfinished_task' | 'upcoming_deadline' | 'streak_recovery' | 'motivational';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  icon: React.ReactNode;
  actionLabel?: string;
  actionType?: 'quest' | 'targets';
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  profile,
  goals,
  tasks,
  onClose,
  onNavigateToQuest,
  onNavigateToTargets
}) => {
  const [clearedIds, setClearedIds] = useState<string[]>([]);

  // Scientific, warm, comforting and non-aggressive motivational messages
  const motivationalQuotes = useMemo(() => [
    {
      title: "Mindful Momentum",
      desc: "Success is the sum of small, science-backed actions, stacked consistency daily."
    },
    {
      title: "Biological Rhythm",
      desc: "Every dynamic check-in shifts your neurological neuropathways towards mastery."
    },
    {
      title: "Compassionate Progress",
      desc: "Missed a step? That is part of the biological feedback loop. Progress, not perfect."
    },
    {
      title: "The Power of Compound Interest",
      desc: "A singular 1% improvement today compounds to a 37x habit growth over a full year."
    },
    {
      title: "Celebrate Traction",
      desc: "Your consistency streak is yours to cherish. Take a moment to appreciate your effort today."
    }
  ], []);

  // Compute smart notifications dynamically on load
  const notifications = useMemo(() => {
    const list: SmartNotification[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Streak Recovery Notification
    const hasTodayCheck = profile.stats.streakHistory.includes(todayStr);
    const activeStreak = profile.stats.globalStreak || 0;

    if (!hasTodayCheck && activeStreak > 0) {
      list.push({
        id: 'streak-recovery-alert',
        type: 'streak_recovery',
        title: 'Safeguard Your Streak!',
        description: `Your active ${activeStreak}-day tracker streak is cooling down. Check off any task or check-in to shield it!`,
        severity: 'high',
        createdAt: 'Just now',
        icon: <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />,
        actionLabel: 'Check tasks',
        actionType: 'quest'
      });
    }

    // 2. Unfinished Tasks Notification
    const unfinishedTasksToday = tasks.filter(t => !t.completed && t.date === todayStr);
    if (unfinishedTasksToday.length > 0) {
      list.push({
        id: 'unfinished-tasks-alert',
        type: 'unfinished_task',
        title: `${unfinishedTasksToday.length} Daily Quests Awaiting`,
        description: `You have ${unfinishedTasksToday.length} active checklist tasks left to conquer for today's routine.`,
        severity: 'medium',
        createdAt: 'Updated',
        icon: <BookmarkCheck className="w-4 h-4 text-indigo-500" />,
        actionLabel: 'Go to Hub',
        actionType: 'quest'
      });
    }

    // 3. Upcoming Deadlines/Checklist reminders
    const unfinishedGoals = goals.filter(g => g.currentValue < g.targetValue);
    unfinishedGoals.forEach(goal => {
      // Create a gentle reminder to check on specific goals
      const progressPercent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
      if (progressPercent < 50) {
        list.push({
          id: `goal-deadline-${goal.id}`,
          type: 'upcoming_deadline',
          title: `Nurture: ${goal.title}`,
          description: `You are at ${progressPercent}% progress for "${goal.title}". Let's make small steps towards your goal today.`,
          severity: 'low',
          createdAt: 'Habit Trail',
          icon: <div className="text-sm">{goal.icon || '🎯'}</div>,
          actionLabel: 'Track Progress',
          actionType: 'targets'
        });
      }
    });

    // 4. Custom Encouraging Motivational messages based on index
    // Use user portrait, name, or streak to select an encouraging motivational message safely
    const quoteIndex = (activeStreak + goals.length) % motivationalQuotes.length;
    const quote = motivationalQuotes[quoteIndex];
    list.push({
      id: 'daily-encouraging-prompt',
      type: 'motivational',
      title: quote.title,
      description: quote.desc,
      severity: 'low',
      createdAt: 'Mindfulness',
      icon: <Heart className="w-4 h-4 text-rose-500 fill-rose-500/10" />
    });

    // Filters out user-cleared notifications
    return list.filter(n => !clearedIds.includes(n.id));
  }, [profile, goals, tasks, clearedIds, motivationalQuotes]);

  const handleClear = (id: string) => {
    setClearedIds(prev => [...prev, id]);
  };

  const handleClearAll = () => {
    setClearedIds(notifications.map(n => n.id));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden text-left">
      {/* Drawer Header */}
      <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between shadow-3xs">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100/60 relative">
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[7.5px] text-white font-extrabold" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">Traction Hub Alerts</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{notifications.length} Unresolved Reminders</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filterable List Feed */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
        
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[340px] text-center p-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-2xl relative shadow-3xs">
              🌿
              <span className="absolute text-xs bottom-0.5 right-0.5 animate-bounce">✨</span>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800">A Peaceful Space</h4>
              <p className="text-[10.5px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                All quiet here. Your focus is aligned, your streaks are safe, and your daily intentions are beautifully clear.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((n) => {
              // Custom borders depending on level
              let borderClass = 'border-slate-100/60 bg-white';
              if (n.severity === 'high') borderClass = 'border-orange-200/50 bg-orange-50/15';
              if (n.severity === 'medium') borderClass = 'border-indigo-150/50 bg-indigo-50/10';

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`frosted-card p-4 rounded-3xl border ${borderClass} shadow-3xs hover:shadow-2xs transition-all relative group`}
                >
                  <button 
                    onClick={() => handleClear(n.id)}
                    className="absolute top-3.5 right-3.5 p-1 rounded-lg hover:bg-slate-100 text-slate-350 hover:text-slate-650 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Dismiss alert"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex gap-3.5">
                    {/* Rounded status category icon */}
                    <div className="h-9 w-9 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-4xs flex-shrink-0">
                      {n.icon}
                    </div>

                    <div className="flex-1 space-y-2 min-w-0">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-widest">{n.createdAt}</span>
                          {n.severity === 'high' && (
                            <span className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <h4 className="text-[11.5px] font-black text-slate-800 tracking-tight mt-0.5">{n.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mt-1 pr-4">{n.description}</p>
                      </div>

                      {/* Interactive dynamic redirection action triggers */}
                      {n.actionLabel && (
                        <button
                          onClick={() => {
                            if (n.actionType === 'quest' && onNavigateToQuest) {
                              onNavigateToQuest();
                            } else if (n.actionType === 'targets' && onNavigateToTargets) {
                              onNavigateToTargets();
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[9.5px] font-black text-indigo-650 hover:text-indigo-805 uppercase tracking-wider transition-colors pt-1 cursor-pointer"
                        >
                          {n.actionLabel} <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Drawer Control Footers */}
      {notifications.length > 0 && (
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between shadow-sm">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Smart Habit Companion activated</p>
          <button
            onClick={handleClearAll}
            className="px-3.5 py-1.5 rounded-xl border border-slate-205/65 hover:bg-slate-50 text-[10px] font-black text-slate-600 hover:text-slate-850 uppercase tracking-widest transition-all cursor-pointer active:scale-95"
          >
            Clear All Alerts
          </button>
        </div>
      )}
    </div>
  );
};
