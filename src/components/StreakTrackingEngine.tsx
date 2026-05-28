import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Award, 
  Calendar, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ChevronRight,
  Info
} from 'lucide-react';
import { UserProfile, Goal } from '../types';

interface StreakTrackingEngineProps {
  profile: UserProfile;
  goals: Goal[];
}

export const StreakTrackingEngine: React.FC<StreakTrackingEngineProps> = ({
  profile,
  goals
}) => {
  const history = useMemo(() => profile.stats.streakHistory || [], [profile.stats.streakHistory]);
  const currentStreak = profile.stats.globalStreak || 0;

  // Let's compute best streak historically!
  // We can calculate this by scanning the sorted history of active days
  const bestHistoricalStreak = useMemo(() => {
    if (history.length === 0) return 0;
    
    // Ensure history is sorted nicely
    const sortedDates = [...history].sort((a, b) => a.localeCompare(b));
    
    let maxStreak = 0;
    let currentSequence = 0;
    let prevDate: Date | null = null;
    
    sortedDates.forEach((dateStr) => {
      const currentDate = new Date(dateStr);
      if (!prevDate) {
        currentSequence = 1;
      } else {
        const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentSequence++;
        } else if (diffDays > 1) {
          maxStreak = Math.max(maxStreak, currentSequence);
          currentSequence = 1;
        }
      }
      prevDate = currentDate;
    });
    
    return Math.max(maxStreak, currentSequence);
  }, [history]);

  // Overall best streak including active goal streaks
  const bestOverallStreak = useMemo(() => {
    const goalStreaks = goals.map(g => g.streak || 0);
    return Math.max(bestHistoricalStreak, currentStreak, ...goalStreaks);
  }, [bestHistoricalStreak, currentStreak, goals]);

  // Define streak milestones
  const milestones = useMemo(() => [
    { 
      id: 'm1', 
      name: 'Ember Spark', 
      days: 3, 
      icon: '🌱', 
      title: 'Initiate Habit', 
      desc: 'Build consistency for 3 biological days.',
      color: 'from-amber-400 to-orange-500',
      badgeBg: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    { 
      id: 'm2', 
      name: 'Consistent Flame', 
      days: 5, 
      icon: '🔥', 
      title: 'Habit Formation', 
      desc: 'Sustain tracking for 5 consecutive days.',
      color: 'from-orange-500 to-red-500',
      badgeBg: 'bg-orange-100 text-orange-700 border-orange-200'
    },
    { 
      id: 'm3', 
      name: 'Supernova Surge', 
      days: 10, 
      icon: '⚡', 
      title: 'Total Unstoppable', 
      desc: 'Complete actions 10 days in a row.',
      color: 'from-indigo-500 to-violet-600',
      badgeBg: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    },
    { 
      id: 'm4', 
      name: 'Legendary Tracker', 
      days: 30, 
      icon: '👑', 
      title: 'Spiritual Ascendant', 
      desc: 'Master the tracktion layout for 30 consecutive days.',
      color: 'from-violet-600 to-rose-600',
      badgeBg: 'bg-violet-100 text-violet-700 border-violet-200'
    }
  ], []);

  // Determine current active milestone target
  const nextMilestone = useMemo(() => {
    return milestones.find(m => currentStreak < m.days) || milestones[milestones.length - 1];
  }, [milestones, currentStreak]);

  const percentToNextMilestone = useMemo(() => {
    if (currentStreak >= nextMilestone.days) return 100;
    // Calculate previous milestone days as base
    const prevMilestoneDays = milestones.filter(m => currentStreak >= m.days).pop()?.days || 0;
    const required = nextMilestone.days - prevMilestoneDays;
    const currentFromBase = currentStreak - prevMilestoneDays;
    return Math.min(100, Math.round((currentFromBase / required) * 100));
  }, [currentStreak, nextMilestone, milestones]);

  // Generate 35 streak history block elements representing past 5 weeks
  const contributionGridData = useMemo(() => {
    const result = [];
    const today = new Date();
    // Start from Sunday 5 weeks ago
    const startOffset = today.getDay() + 28; // past 4 full weeks + current week
    
    for (let i = startOffset; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hasLogged = history.includes(dateStr);
      
      result.push({
        date: dateStr,
        hasLogged,
        dayOfMonth: d.getDate(),
        month: d.toLocaleString('en-US', { month: 'short' })
      });
    }
    return result;
  }, [history]);

  // Hours left until streak expires if not completed today
  const expirationTimerMessage = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = history.includes(today);
    
    if (isCompletedToday) {
      return "Momentum secured. You've completed your daily practice today — stand proud.";
    }

    // Otherwise calculate hours till midnight
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diffMs = midnight.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `Time is of the essence: Your daily focus is called. Secure your momentum in ${diffHrs}h ${diffMins}m with a completed action.`;
  }, [history]);

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Header Details */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" /> My Momentum Sanctum
          </h3>
          <p className="text-[10px] text-slate-400 font-medium">Steward your daily practice, celebrate consistency milestones, and protect your inner fire.</p>
        </div>
        <span className="text-[9px] text-orange-600 bg-orange-50 border border-orange-100 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Best Streak: {bestOverallStreak}d
        </span>
      </div>

      {/* 2. Primary Flame Focus Card */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
        
        {/* Flame Display Widget */}
        <div className="md:col-span-4 frosted-card p-5 rounded-3xl bg-gradient-to-br from-orange-500/5 to-rose-500/5 border border-orange-100/50 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          {/* Animated Background Rings */}
          <div className="absolute -inset-10 bg-radial from-orange-200/20 via-transparent to-transparent opacity-50 blur-xl animate-pulse" />
          
          {/* Animated 3D-feeling Flame Graphic */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              y: [0, -3, 0]
            }}
            transition={{ 
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="h-20 w-20 flex items-center justify-center bg-orange-500/10 border border-orange-500/20 rounded-full text-4xl relative shadow-sm"
          >
            <Flame className="w-12 h-12 text-orange-500 fill-orange-500 filter drop-shadow-[0_4px_12px_rgba(249,115,22,0.4)]" />
            
            {/* Float particle indicators */}
            <span className="absolute text-[8px] top-1 right-2 animate-bounce">✨</span>
            <span className="absolute text-[8px] bottom-2 left-1.5 opacity-80 animate-ping">⚡</span>
          </motion.div>

          <div className="mt-4.5 space-y-1 z-10">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{currentStreak}</h1>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Active Checklist Streak</p>
          </div>

          <div className="w-full mt-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl p-2.5 text-center flex items-center gap-2 justify-center z-10">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-[9.5px] font-extrabold text-slate-700 leading-snug">
              {history.includes(new Date().toISOString().split('T')[0]) 
                ? "Locked in for today!" 
                : "Awaiting today's activation"}
            </span>
          </div>
        </div>

        {/* Milestone Progression Widget */}
        <div className="md:col-span-6 border border-slate-100 bg-white rounded-3xl p-5 flex flex-col justify-between shadow-3xs">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">Next Milestone</span>
              <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${nextMilestone.badgeBg}`}>
                {nextMilestone.icon} {nextMilestone.name}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-800">{nextMilestone.title}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{nextMilestone.desc}</p>
            </div>

            {/* Micro Progression Tracker */}
            <div className="space-y-1.5 pt-1.5">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentToNextMilestone}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between text-[9px] font-black text-slate-405">
                <span>{currentStreak} Completed</span>
                <span>{nextMilestone.days} days target</span>
              </div>
            </div>
          </div>

          {/* Expiration warning banner */}
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-start gap-2.5 text-slate-500">
            <div className="p-1 px-1.5 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center font-bold text-[9px] flex-shrink-0">
              <ClockWarningIcon />
            </div>
            <p className="text-[9.5px] leading-relaxed font-bold text-indigo-705">
              {expirationTimerMessage}
            </p>
          </div>

        </div>
      </div>

      {/* 3. Consistency History contribution pixel style grid map */}
      <div className="border border-slate-100 bg-white rounded-3xl p-5 shadow-3xs space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Historical Check-in Web Array
          </span>
          <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Scroll left / drag to view all</span>
        </div>

        {/* Dynamic Horizontal contribution array */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
          {contributionGridData.map((day, idx) => {
            const isToday = day.date === new Date().toISOString().split('T')[0];
            return (
              <div 
                key={day.date} 
                className="flex flex-col items-center flex-shrink-0 space-y-1 group"
                title={`${day.date}: ${day.hasLogged ? 'Completed Actions' : 'No logged activity'}`}
              >
                {/* Year-day block element */}
                <div 
                  className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all ${
                    day.hasLogged 
                      ? 'bg-orange-500 border-orange-400 text-white font-black scale-102 shadow-3xs' 
                      : isToday
                        ? 'bg-slate-55 border-indigo-400 text-indigo-650 font-bold'
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                  }`}
                >
                  <span className="text-[9px] font-bold">{day.dayOfMonth}</span>
                </div>
                
                {/* Micro Month initials dynamically placed to avoid repetition */}
                { (idx === 0 || day.dayOfMonth === 1) ? (
                  <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    {day.month}
                  </span>
                ) : (
                  <span className="text-[7.5px] font-bold text-slate-300 leading-none">
                    {day.dayOfMonth % 7 === 0 ? '•' : ''}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Milestone Badges list with celebration trigger layout */}
      <div className="space-y-4">
        <h4 className="text-[10px] text-slate-700 font-extrabold uppercase tracking-widest">🏆 Habit Consistency Badges</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {milestones.map((m) => {
            const unlocked = currentStreak >= m.days;
            return (
              <div 
                key={m.id}
                className={`border rounded-3xl p-4 flex items-center justify-between transition-all relative overflow-hidden ${
                  unlocked 
                    ? 'border-indigo-150 bg-indigo-50/15' 
                    : 'border-slate-100 bg-white opacity-70'
                }`}
              >
                {unlocked && (
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-indigo-500 flex-shrink-0" />
                )}

                <div className="flex items-center gap-3.5">
                  <div className={`h-11 w-11 rounded-2xl border flex items-center justify-center text-xl shadow-xs flex-shrink-0 ${
                    unlocked 
                      ? 'bg-white border-indigo-100' 
                      : 'bg-slate-50 border-slate-150 text-slate-400'
                  }`}>
                    {unlocked ? m.icon : <Lock className="w-4 h-4 text-slate-400" />}
                  </div>

                  <div className="text-left">
                    <h5 className="text-xs font-black text-slate-800">{m.name}</h5>
                    <p className="text-[9px] text-slate-400 font-medium">{m.desc}</p>
                    <span className={`inline-block text-[8.5px] font-black uppercase tracking-wider py-0.5 px-2 rounded-md border mt-1.5 ${
                      unlocked 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                        : 'bg-slate-50 border-slate-100 text-slate-405'
                    }`}>
                      {unlocked ? 'Unlocked Status' : `${m.days - currentStreak} days to achieve`}
                    </span>
                  </div>
                </div>

                {unlocked && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-1 px-2 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-[8px]"
                  >
                    🏆 Check
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

// Inline helper Clock Icon
const ClockWarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
