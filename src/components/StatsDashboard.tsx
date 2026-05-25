import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell
} from 'recharts';
import { 
  Award, 
  CheckCircle2, 
  Flame, 
  TrendingUp, 
  Calendar,
  Hourglass,
  Sparkles,
  Zap,
  Target,
  ArrowUpRight,
  Activity,
  Check,
  ChevronRight
} from 'lucide-react';
import { Goal, UserProfile } from '../types';

interface StatsDashboardProps {
  goals: Goal[];
  profile: UserProfile;
}

const COLORS = ['#10b981', '#6366f1', '#ec4899', '#f59e0b', '#8b5cf6', '#0ea5e9'];

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ goals, profile }) => {
  // 1. Calculate overall metrics
  const totalGoalsCount = goals.length;
  
  const completedGoals = useMemo(() => {
    return goals.filter(g => g.currentValue >= g.targetValue);
  }, [goals]);

  const activeGoals = useMemo(() => {
    return goals.filter(g => g.currentValue < g.targetValue);
  }, [goals]);

  const completedGoalsCount = completedGoals.length;
  const activeGoalsCount = activeGoals.length;

  const averageGoalCompletion = useMemo(() => {
    if (goals.length === 0) return 0;
    const totalPercentage = goals.reduce((acc, g) => {
      return acc + Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
    }, 0);
    return Math.round(totalPercentage / goals.length);
  }, [goals]);

  // Productivity level rating label
  const productivityRating = useMemo(() => {
    if (averageGoalCompletion >= 85) return 'Legendary Focus';
    if (averageGoalCompletion >= 65) return 'Optimal Flow';
    if (averageGoalCompletion >= 40) return 'Steady Progress';
    return 'Gaining Momentum';
  }, [averageGoalCompletion]);

  // Total session logs count
  const totalSessionsLogged = useMemo(() => {
    return goals.reduce((acc, g) => acc + g.logs.length, 0);
  }, [goals]);

  // Maximum consecutive habit streak
  const maxGoalStreak = useMemo(() => {
    if (goals.length === 0) return 0;
    return Math.max(...goals.map(g => g.streak));
  }, [goals]);

  // Weekly progress percentage towards profile weekly goal count
  const targetWeeklyHabits = profile.weeklyGoalCount || 3;
  const weeklyTargetProgress = useMemo(() => {
    if (targetWeeklyHabits <= 0) return 0;
    return Math.round((goals.length / targetWeeklyHabits) * 100);
  }, [goals.length, targetWeeklyHabits]);

  // 3. Prepare data for Activity Chart (Past 7 days completions)
  const last7DaysData = useMemo(() => {
    const result = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      
      // Count logs made on this specific date across all goals
      let countLogs = 0;
      goals.forEach(goal => {
        const matchingLogs = goal.logs.filter(log => log.date === dateStr);
        countLogs += matchingLogs.length;
      });

      // Was any goal marked completed on this day
      const isCompletedDay = profile.stats.streakHistory.includes(dateStr);

      result.push({
        dayName,
        dayNum,
        logsCount: countLogs,
        date: dateStr,
        isCompletedDay
      });
    }

    return result;
  }, [goals, profile.stats.streakHistory]);

  return (
    <div className="space-y-6 pb-24">
      
      {/* 1. Main Grid: Modern Card KPI KPI Layout */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* Productivity Percentage */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="frosted-card p-4.5 rounded-3xl flex flex-col justify-between relative overflow-hidden"
        >
          {/* Subtle decoration vector */}
          <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-indigo-50/40 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] text-slate-450 font-extrabold uppercase tracking-widest block">Productivity Rating</span>
            <div className="p-1.5 bg-indigo-55/15 text-indigo-600 rounded-xl">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          
          <div className="mt-5 z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{averageGoalCompletion}</span>
              <span className="text-sm font-bold text-indigo-500">%</span>
            </div>
            
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              <p className="text-[10px] text-indigo-700/85 font-black uppercase tracking-wider">{productivityRating}</p>
            </div>
          </div>
        </motion.div>

        {/* Global Days Active Streak Counter */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="frosted-card p-4.5 rounded-3xl flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-orange-50/40 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] text-slate-450 font-extrabold uppercase tracking-widest block">Consist. Streak</span>
            <div className="p-1.5 bg-orange-55/15 text-orange-600 rounded-xl">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          
          <div className="mt-5 z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{profile.stats.globalStreak}</span>
              <span className="text-xs font-bold text-slate-400">days</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium leading-none">Consecutive verified days</p>
          </div>
        </motion.div>
      </div>

      {/* 2. Secondary Mini Metrics Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-3 gap-2"
      >
        <div className="frosted-card p-3 rounded-2xl text-center flex flex-col items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1" />
          <h5 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Completed</h5>
          <p className="text-base font-extrabold text-slate-850 mt-0.5">{completedGoalsCount}</p>
        </div>
        
        <div className="frosted-card p-3 rounded-2xl text-center flex flex-col items-center justify-center">
          <Activity className="w-4 h-4 text-indigo-500 mb-1" />
          <h5 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active Tasks</h5>
          <p className="text-base font-extrabold text-slate-850 mt-0.5">{activeGoalsCount}</p>
        </div>

        <div className="frosted-card p-3 rounded-2xl text-center flex flex-col items-center justify-center">
          <Zap className="w-4 h-4 text-amber-500 mb-1" />
          <h5 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Actions</h5>
          <p className="text-base font-extrabold text-slate-850 mt-0.5">{totalSessionsLogged}</p>
        </div>
      </motion.div>

      {/* 3. Weekly Tracktion Target Achievement Bar & Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="frosted-card p-5 rounded-3xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-500" /> Weekly Target Load
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Profile commitments achievements progress</p>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg">
            {goals.length} of {targetWeeklyHabits} setup
          </span>
        </div>

        {/* Progress bar structure with full animation control support */}
        <div className="space-y-2">
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, weeklyTargetProgress)}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                weeklyTargetProgress >= 100 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
              }`}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-slate-400">0% Built</span>
            <span className="text-slate-700">{weeklyTargetProgress}% target achieved</span>
            <span className="text-slate-400">100% Target</span>
          </div>
        </div>

        {/* Past 7 calendar dates check-off indicator */}
        <div className="border-t border-slate-50 pt-3">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2.5">Weekly Consistency (Last 7 Days)</span>
          <div className="grid grid-cols-7 gap-1.5">
            {last7DaysData.map((day, ix) => (
              <div key={ix} className="flex flex-col items-center">
                <span className="text-[9px] text-slate-450 font-medium mb-1">{day.dayName}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold border transition-all ${
                  day.isCompletedDay 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-150'
                    : day.logsCount > 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-slate-50 text-slate-400 border-slate-100'
                }`}>
                  {day.isCompletedDay ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : day.logsCount > 0 ? (
                    day.logsCount
                  ) : (
                    day.dayNum
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 4. Active Goals Progress Section (Individual Animated Progress Bars) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-755 uppercase tracking-widest flex items-center gap-1.5">
              <Hourglass className="w-4 h-4 text-slate-450" /> Active Progress Track
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time percentage values of unresolved targets</p>
          </div>
          <span className="text-[9px] text-slate-400 font-bold">{activeGoalsCount} goals active</span>
        </div>

        {activeGoals.length === 0 ? (
          <div className="frosted-card p-6 rounded-3xl text-center space-y-2">
            <Award className="w-8 h-8 text-indigo-400 mx-auto" />
            <p className="text-xs font-extrabold text-slate-800">All routines completed!</p>
            <p className="text-[10px] text-slate-400">Your habit lists are beautifully checked off for the week. Celebrate or construct new habits.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => {
              const p = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
              return (
                <motion.div 
                  key={goal.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="frosted-card p-4 rounded-2xl flex flex-col gap-2.5 relative hover:border-slate-200 transition-all cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg flex-shrink-0" role="img" aria-label="Icon">
                        {goal.icon || '🎯'}
                      </span>
                      <div className="min-w-0">
                        <h5 className="text-[11px] font-extrabold text-slate-800 truncate">{goal.title}</h5>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{goal.category}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-slate-800 font-black">{goal.currentValue}<span className="text-[9px] text-slate-400 font-semibold"> / {goal.targetValue} {goal.unit}</span></span>
                      <span className="text-[9px] text-indigo-600 font-bold block bg-indigo-50 px-1 py-0.5 rounded-md mt-0.5 text-center">{p}%</span>
                    </div>
                  </div>

                  {/* Animated individual custom progress segment */}
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${p}%` }}
                        transition={{ duration: 0.75, ease: 'easeInOut' }}
                        className="h-full rounded-full transition-colors"
                        style={{
                          backgroundColor: 
                            goal.color === 'emerald' ? '#10b981' :
                            goal.color === 'indigo' ? '#6366f1' :
                            goal.color === 'rose' ? '#f43f5e' :
                            goal.color === 'amber' ? '#f59e0b' :
                            goal.color === 'violet' ? '#8b5cf6' : '#0ea5e9'
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Completed Archive Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-755 uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Completed Hall of Fame
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Routines and habits fully checks-tested by active logs</p>
          </div>
          <span className="text-[9px] text-slate-400 font-bold">{completedGoalsCount} archive</span>
        </div>

        {completedGoals.length === 0 ? (
          <p className="text-center text-[10px] text-slate-400 py-3 font-medium">No goals checked off yet. Let's finish active habits!</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {completedGoals.map((goal) => (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="frosted-card p-3.5 rounded-2xl border-emerald-100/50 relative overflow-hidden flex flex-col justify-between"
              >
                {/* Background badge overlay shine */}
                <span className="absolute right-[-10px] bottom-[-10px] text-4xl opacity-10 pointer-events-none select-none">🏆</span>
                
                <div className="flex justify-between items-start gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-lg flex-shrink-0">{goal.icon || '🎉'}</span>
                    <div className="min-w-0">
                      <h5 className="text-[10px] font-extrabold text-slate-800 truncate leading-tight">{goal.title}</h5>
                      <span className="text-[8px] text-emerald-600 font-extrabold uppercase tracking-wide">Achieved</span>
                    </div>
                  </div>
                  <div className="p-1 rounded-sm bg-emerald-50 text-emerald-600">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>

                <div className="mt-3 text-left">
                  <span className="text-[11px] font-black text-slate-800">{goal.targetValue} {goal.unit}</span>
                  <p className="text-[8px] text-slate-400 font-medium">Logged {goal.logs.length} check-ins</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Heat Registry chart section */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="frosted-card p-5 rounded-3xl space-y-4"
      >
        <div>
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-500" /> Weekly Heat Registry
          </h4>
          <p className="text-[10px] text-slate-400 font-medium">Activity check-in events recorded per day</p>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7DaysData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis 
                dataKey="dayName" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                allowDecimals={false}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 8 }}
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '12px', 
                  borderColor: '#e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px'
                }}
              />
              <Bar 
                dataKey="logsCount" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={30}
              >
                {last7DaysData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.logsCount > 0 ? '#6366f1' : '#e2e8f0'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 7. Inspirational Bottom Banner */}
      <div className="p-4 rounded-3xl bg-indigo-50/40 backdrop-blur-md border border-indigo-200/50 flex gap-3 items-start">
        <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0 animate-pulse" />
        <div>
          <h4 className="text-xs font-bold text-indigo-950">Consistency builds Destiny</h4>
          <p className="text-[10px] text-slate-600 leading-relaxed mt-0.5">
            Your aggregate check-in rate is tracking nicely. Consistent small actions are mathematically compound. Keep fuel on your {profile.stats.globalStreak}-day streak!
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
