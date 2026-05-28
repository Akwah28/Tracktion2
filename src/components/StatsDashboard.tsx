import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Legend
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
  ChevronRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Goal, UserProfile, GoalTask } from '../types';
import { CATEGORIES } from '../sampleData';
import { DynamicIcon } from './DynamicIcon';
import { MiniStatSkeleton, DashboardCardSkeleton } from './Skeletons';

import { doc } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';

interface StatsDashboardProps {
  goals: Goal[];
  profile: UserProfile;
  tasks?: GoalTask[];
  loading?: boolean;
}

const COLORS = ['#10b981', '#6366f1', '#ec4899', '#f59e0b', '#8b5cf6', '#0ea5e9'];

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ goals, profile, tasks = [], loading = false }) => {
  const { resolvedTheme } = useTheme();

  if (loading) {
    return (
      <div className="space-y-6 pb-24 text-left">
        {/* KPI Mini Stat Skeletons grid */}
        <div className="grid grid-cols-2 gap-3.5">
          <MiniStatSkeleton />
          <MiniStatSkeleton />
        </div>

        {/* Mini stats cards group */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/45 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/55 shadow-xs h-16 animate-pulse" />
          <div className="p-3.5 rounded-2xl bg-white/45 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/55 shadow-xs h-16 animate-pulse" />
        </div>

        {/* Main Charts Skeletons */}
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
      </div>
    );
  }
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

      // Count tasks completed on this date
      const matchingTasks = tasks.filter(t => t.completed && t.date === dateStr);
      const totalActionsCount = countLogs + matchingTasks.length;

      // Was any goal marked completed on this day
      const isCompletedDay = profile.stats.streakHistory.includes(dateStr);

      result.push({
        dayName,
        dayNum,
        logsCount: countLogs,
        tasksCount: matchingTasks.length,
        totalActions: totalActionsCount,
        date: dateStr,
        isCompletedDay
      });
    }

    return result;
  }, [goals, tasks, profile.stats.streakHistory]);

  // 4. Monthly Growth Tracker (Over preceding 4-week window)
  const monthlyGrowthData = useMemo(() => {
    const today = new Date();
    const result = [];
    
    // Group logs and task completions in 7-day windows spanning back 4 weeks
    for (let w = 3; w >= 0; w--) {
      const startDaysAgo = (w + 1) * 7;
      const endDaysAgo = w * 7;
      
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - startDaysAgo);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() - endDaysAgo);

      // Filter all logs in this range
      let logsInWindow = 0;
      goals.forEach(goal => {
        goal.logs.forEach(log => {
          const logDate = new Date(log.date);
          if (logDate >= startDate && logDate <= endDate) {
            logsInWindow++;
          }
        });
      });

      // Filter tasks in this range
      const tasksInWindow = tasks.filter(t => {
        if (!t.completed) return false;
        const taskDate = new Date(t.date);
        return taskDate >= startDate && taskDate <= endDate;
      }).length;

      result.push({
        weekLabel: `Wk -${w}`,
        checkIns: logsInWindow,
        tasks: tasksInWindow,
        totalActivity: logsInWindow + tasksInWindow
      });
    }
    return result;
  }, [goals, tasks]);

  // 5. Goal Completion Percentages Donut Chart
  const completionPieData = useMemo(() => {
    return [
      { name: 'Completed Trails', value: completedGoalsCount, color: '#10b981' },
      { name: 'Undergoing Trails', value: activeGoalsCount || 1, color: '#6366f1' } // Fallback to 1 to render nicely
    ];
  }, [completedGoalsCount, activeGoalsCount]);

  // 6. Grid representation of consistency heatmap (Last 28 Days)
  const heatmapData = useMemo(() => {
    const list = [];
    const today = new Date();
    
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Calculate activities density
      let logsCount = 0;
      goals.forEach(g => {
        logsCount += g.logs.filter(l => l.date === dateStr).length;
      });
      const tasksCount = tasks.filter(t => t.completed && t.date === dateStr).length;
      const totalActivities = logsCount + tasksCount;

      list.push({
        date: dateStr,
        dayNum: d.getDate(),
        month: d.toLocaleString('en-US', { month: 'short' }),
        count: totalActivities
      });
    }
    return list;
  }, [goals, tasks]);

  // Group streaks and completion rates by goal categories
  const categoryStats = useMemo(() => {
    const categoriesMap: Record<string, {
      goalsCount: number;
      completedGoalsCount: number;
      totalPercent: number;
      bestStreak: number;
      totalLogs: number;
    }> = {};

    // Initialize map using default CATEGORIES array to ensure consistent structure
    CATEGORIES.forEach(cat => {
      categoriesMap[cat.name] = {
        goalsCount: 0,
        completedGoalsCount: 0,
        totalPercent: 0,
        bestStreak: 0,
        totalLogs: 0
      };
    });

    // Aggregate stats from the actual user goals
    goals.forEach(g => {
      const cat = g.category || 'Other';
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = {
          goalsCount: 0,
          completedGoalsCount: 0,
          totalPercent: 0,
          bestStreak: 0,
          totalLogs: 0
        };
      }
      
      const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
      categoriesMap[cat].goalsCount += 1;
      if (pct >= 100) {
        categoriesMap[cat].completedGoalsCount += 1;
      }
      categoriesMap[cat].totalPercent += pct;
      categoriesMap[cat].bestStreak = Math.max(categoriesMap[cat].bestStreak, g.streak);
      categoriesMap[cat].totalLogs += (g.logs || []).length;
    });

    // Map to layout data format
    return Object.entries(categoriesMap).map(([name, stats]) => {
      const catDef = CATEGORIES.find(c => c.name === name) || {
        icon: 'Compass',
        color: 'indigo',
        bgClass: 'bg-indigo-55 text-indigo-600 border-indigo-100',
        textClass: 'text-indigo-700'
      };

      const avgCompletion = stats.goalsCount > 0 
        ? Math.round(stats.totalPercent / stats.goalsCount) 
        : 0;

      return {
        name,
        ...stats,
        avgCompletion,
        icon: catDef.icon,
        color: catDef.color,
        bgClass: catDef.bgClass,
        textClass: catDef.textClass
      };
    }).filter(item => item.goalsCount > 0);
  }, [goals]);

  return (
    <div className="space-y-6 pb-24 text-left">
      
      {/* 1. Main Grid: Modern Card KPI Layout */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* Productivity Percentage */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="frosted-card p-4.5 rounded-3xl flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-indigo-50/40 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] text-slate-450 font-extrabold uppercase tracking-widest block">Average Focus Index</span>
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
            <span className="text-[10px] text-slate-450 font-extrabold uppercase tracking-widest block">Active Day Streak</span>
            <div className="p-1.5 bg-orange-55/15 text-orange-600 rounded-xl">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          
          <div className="mt-5 z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{profile.stats.globalStreak}</span>
              <span className="text-xs font-bold text-slate-400">days</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium leading-none">Consecutive active check-ins</p>
          </div>
        </motion.div>
      </div>

      {/* 2. Secondary Metrics Indicators Row */}
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
          <h5 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active Goals</h5>
          <p className="text-base font-extrabold text-slate-850 mt-0.5">{activeGoalsCount}</p>
        </div>

        <div className="frosted-card p-3 rounded-2xl text-center flex flex-col items-center justify-center">
          <Zap className="w-4 h-4 text-amber-500 mb-1" />
          <h5 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Checks</h5>
          <p className="text-base font-extrabold text-slate-850 mt-0.5">{totalSessionsLogged + tasks.filter(t => t.completed).length}</p>
        </div>
      </motion.div>

      {/* 3. Recharts Core Analytical Visualizers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Module A: Goal Completion Percentages Donut */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="frosted-card p-5 rounded-3xl space-y-4 flex flex-col bg-white/45 dark:bg-slate-900/40"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-widest flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-emerald-500" /> My Daily Alignment
              </h4>
              <p className="text-[10px] text-slate-450 mt-0.5 font-medium">A breakdown of active intentions completed today</p>
            </div>
          </div>

          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {completionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: resolvedTheme === 'dark' ? '#0f172a' : '#ffffff', 
                    borderRadius: '12px', 
                    borderColor: resolvedTheme === 'dark' ? '#1e293b' : '#e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-sans)',
                    color: resolvedTheme === 'dark' ? '#f1f5f9' : '#1e293b'
                  }}
                  itemStyle={{
                    color: resolvedTheme === 'dark' ? '#cbd5e1' : '#475569'
                  }}
                  labelStyle={{
                    color: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Float Absolute Stats inside the hollow hole */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-xl font-black text-slate-800 leading-none">
                {totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0}%
              </span>
              <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">Finished</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-[10px] pt-1 font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Finished ({completedGoalsCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-600">Active ({activeGoalsCount})</span>
            </div>
          </div>
        </motion.div>

        {/* Module B: Weekly Progress Performance Curve */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="frosted-card p-5 rounded-3xl space-y-4 bg-white/45 dark:bg-slate-900/40"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-500" /> Weekly Activity Spark
              </h4>
              <p className="text-[10px] text-slate-450 mt-0.5 font-medium">Aggregated daily habits and task check-ins</p>
            </div>
            <span className="text-[10.5px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">Last 7 Days</span>
          </div>

          <div className="h-44 w-full font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="dayName" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: resolvedTheme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 650 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: resolvedTheme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 650 }}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: resolvedTheme === 'dark' ? '#0f172a' : '#ffffff', 
                    borderRadius: '12px', 
                    borderColor: resolvedTheme === 'dark' ? '#1e293b' : '#e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-sans)',
                    color: resolvedTheme === 'dark' ? '#f1f5f9' : '#1e293b'
                  }}
                  itemStyle={{
                    color: resolvedTheme === 'dark' ? '#cbd5e1' : '#475569'
                  }}
                  labelStyle={{
                    color: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalActions" 
                  name="Completed Actions" 
                  stroke="#6366f1" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorActivity)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Module C: Monthly Growing Trajectory */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="frosted-card p-5 rounded-3xl space-y-4 bg-white/45 dark:bg-slate-900/40"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-350 uppercase tracking-widest flex items-center gap-1.5">
                <Target className="w-4 h-4 text-violet-500" /> Monthly Trajectory Growth
              </h4>
              <p className="text-[10px] text-slate-455 mt-0.5 font-medium">Aggregated weekly progression trends</p>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wide">Growing</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyGrowthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis 
                  dataKey="weekLabel" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: resolvedTheme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 650 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: resolvedTheme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 650 }}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: resolvedTheme === 'dark' ? '#0f172a' : '#ffffff', 
                    borderRadius: '12px', 
                    borderColor: resolvedTheme === 'dark' ? '#1e293b' : '#e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-sans)',
                    color: resolvedTheme === 'dark' ? '#f1f5f9' : '#1e293b'
                  }} 
                  itemStyle={{
                    color: resolvedTheme === 'dark' ? '#cbd5e1' : '#475569'
                  }}
                  labelStyle={{
                    color: resolvedTheme === 'dark' ? '#94a3b8' : '#64748b'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalActivity" 
                  name="Weekly Energy Sum" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                  dot={{ r: 4, fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Module D: Live Consistency Heatmap Map */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="frosted-card p-5 rounded-3xl space-y-4 bg-white flex flex-col justify-between"
        >
          <div>
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-500" /> Calendar of Steady Practice
            </h4>
            <p className="text-[10px] text-slate-450 mt-0.5 font-medium">A visual story of your dedication over the past 28 days</p>
          </div>

          {/* 4x7 grid representing 4 trailing weeks */}
          <div className="grid grid-cols-7 gap-1.5 py-1">
            {heatmapData.map((tile, idx) => {
              // Color scale depending on count
              const intensity = tile.count;
              let bgClass = 'bg-slate-50 border-slate-100/50 hover:bg-slate-100';
              let textClass = 'text-slate-400';

              if (intensity === 1) {
                bgClass = 'bg-indigo-100 hover:bg-indigo-150 border-indigo-200 text-indigo-700';
              } else if (intensity === 2) {
                bgClass = 'bg-indigo-300 hover:bg-indigo-350 border-indigo-300 text-indigo-950';
              } else if (intensity >= 3) {
                bgClass = 'bg-indigo-600 hover:bg-indigo-750 border-indigo-500 text-white shadow-3xs';
              }

              return (
                <div 
                  key={idx}
                  className={`aspect-square rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer select-none group relative ${bgClass}`}
                  title={`${tile.month} ${tile.dayNum}: ${intensity} daily complete events`}
                >
                  <span className="text-[9.5px] font-black">{tile.dayNum}</span>
                  
                  {/* Tooltip detail overlay on mouse hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 bg-slate-900 text-white text-[8px] font-black rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                    {tile.month} {tile.dayNum}: {tile.count} Events
                  </div>
                </div>
              );
            })}
          </div>

          {/* Heat map visual scale indicators */}
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-405 border-t border-slate-50 pt-2.5">
            <span>Fewer Tracks</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-slate-50 border border-slate-150" />
              <span className="w-2.5 h-2.5 rounded bg-indigo-100 border border-indigo-200" />
              <span className="w-2.5 h-2.5 rounded bg-indigo-300 border border-indigo-300" />
              <span className="w-2.5 h-2.5 rounded bg-indigo-600 border border-indigo-500" />
            </div>
            <span>Power Tracker</span>
          </div>
        </motion.div>

      </div>

      {/* 4. Category Mastery Performance Index (Enriched Groupings stats) */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="space-y-4 pt-1"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-500" /> Growth Fields & Shared Streaks
            </h4>
            <p className="text-[10px] text-slate-405 mt-0.5 font-medium">Observe which fields of life you are nurturing with regular dedication</p>
          </div>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100/50 px-2 py-0.5 rounded-full">{categoryStats.length} domains</span>
        </div>

        {categoryStats.length === 0 ? (
          <div className="frosted-card p-6 rounded-3xl text-center space-y-2">
            <Activity className="w-8 h-8 text-indigo-400 mx-auto" />
            <p className="text-xs font-extrabold text-slate-800">Fields of Growth are Unwritten</p>
            <p className="text-[10px] text-slate-400">Once you define and log practices under different categories, your growth fields will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {categoryStats.map((cat) => {
              const bgClass = cat.bgClass || 'bg-slate-50 text-slate-600 border-slate-100';
              
              return (
                <div 
                  key={cat.name} 
                  className="frosted-card p-4.5 rounded-3xl border border-slate-100/65 bg-white shadow-3xs flex flex-col justify-between hover:border-indigo-100 hover:shadow-2xs transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-2 rounded-2xl border flex items-center justify-center ${bgClass}`}>
                        <DynamicIcon name={cat.icon || 'Compass'} size={15} />
                      </div>
                      <div className="min-w-0 text-left">
                        <h4 className="text-xs font-black text-slate-800">{cat.name}</h4>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide block">
                          {cat.goalsCount} {cat.goalsCount === 1 ? 'Goal' : 'Goals'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Compact Mastery Circle Badge */}
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-slate-800 leading-none">{cat.avgCompletion}%</span>
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">Mastery</span>
                    </div>
                  </div>

                  {/* Elegant category progress bar */}
                  <div className="mt-3.5 space-y-1">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.avgCompletion}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: 
                            cat.color === 'emerald' ? '#10b981' :
                            cat.color === 'indigo' ? '#6366f1' :
                            cat.color === 'rose' ? '#f43f5e' :
                            cat.color === 'amber' ? '#f59e0b' :
                            cat.color === 'violet' ? '#8b5cf6' : '#0ea5e9'
                        }}
                      />
                    </div>
                  </div>

                  {/* Split Stat Badges Footer */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-105/60">
                    {/* Streak Info */}
                    <div className="flex items-center gap-1 text-left min-w-0">
                      <div className="p-1 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Flame className="w-3 h-3 text-orange-550 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block leading-none truncate">Streak</span>
                        <span className="text-[10px] font-extrabold text-slate-800 leading-none block mt-1.5 truncate">
                          {cat.bestStreak} <span className="text-[7.5px] text-slate-450 font-normal">days</span>
                        </span>
                      </div>
                    </div>

                    {/* Checkins Count Info */}
                    <div className="flex items-center gap-1 text-left min-w-0">
                      <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-3 h-3 text-indigo-550 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block leading-none truncate font-semibold">Logged</span>
                        <span className="text-[10px] font-extrabold text-slate-800 leading-none block mt-1.5 truncate">
                          {cat.totalLogs} <span className="text-[7.5px] text-slate-450 font-normal">times</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* 5. Active Goals Progress Section (Individual Animated Progress Bars) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-slate-755 uppercase tracking-widest flex items-center gap-1.5">
              <Hourglass className="w-4 h-4 text-slate-450" /> Active Progress Track
            </h4>
            <p className="text-[10px] text-slate-450 mt-0.5">Real-time percentage values of unresolved targets</p>
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
                  className="frosted-card p-4 rounded-2xl flex flex-col gap-2.5 relative hover:border-slate-200 transition-all cursor-default bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg flex-shrink-0" role="img" aria-label="Icon">
                        {goal.icon || '🎯'}
                      </span>
                      <div className="min-w-0 text-left">
                        <h5 className="text-[11px] font-extrabold text-slate-800 truncate">{goal.title}</h5>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{goal.category}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-slate-800 font-black">{goal.currentValue}<span className="text-[9px] text-slate-400 font-semibold"> / {goal.targetValue} {goal.unit}</span></span>
                      <span className="text-[9px] text-indigo-600 font-bold block bg-indigo-50 px-1 py-0.5 rounded-md mt-0.5 text-center">{p}%</span>
                    </div>
                  </div>

                  {/* Animated progress indicator */}
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

      {/* 6. Completed Archive Cards */}
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
          <div className="grid grid-cols-2 gap-3 bg-white p-4.5 rounded-3xl border border-slate-100">
            {completedGoals.map((goal) => (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="frosted-card p-3.5 rounded-2xl border-emerald-150 relative overflow-hidden flex flex-col justify-between h-[105px] bg-emerald-50/10 text-left"
              >
                <span className="absolute right-[-10px] bottom-[-10px] text-4xl opacity-10 pointer-events-none select-none">🏆</span>
                
                <div className="flex justify-between items-start gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-lg flex-shrink-0">{goal.icon || '🎉'}</span>
                    <div className="min-w-0">
                      <h5 className="text-[10px] font-extrabold text-slate-800 truncate leading-tight">{goal.title}</h5>
                      <span className="text-[8px] text-emerald-600 font-extrabold uppercase tracking-wide">Achieved</span>
                    </div>
                  </div>
                  <div className="p-1 rounded-sm bg-emerald-50 text-emerald-600 flex-shrink-0">
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

      {/* 7. Inspirational Bottom Banner */}
      <div className="p-4 rounded-3xl bg-indigo-50/40 backdrop-blur-md border border-indigo-200/50 flex gap-3 items-start text-left">
        <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0 animate-pulse" />
        <div>
          <h4 className="text-xs font-bold text-indigo-950">Consistency is a Quiet Triumph</h4>
          <p className="text-[10px] text-slate-600 leading-relaxed mt-0.5">
            Every small step you record compounds over time. Celebrate showing up today, and honor your {profile.stats.globalStreak}-day momentum.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
