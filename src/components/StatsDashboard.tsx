import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  Award, 
  CheckCircle2, 
  Flame, 
  PieChartIcon, 
  TrendingUp, 
  Calendar,
  Hourglass,
  Sparkles,
  Zap
} from 'lucide-react';
import { Goal, UserProfile } from '../types';
import { CATEGORIES } from '../sampleData';

interface StatsDashboardProps {
  goals: Goal[];
  profile: UserProfile;
}

const COLORS = ['#10b981', '#6366f1', '#ec4899', '#f59e0b', '#8b5cf6', '#0ea5e9'];

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ goals, profile }) => {
  // 1. Calculate overall metrics
  const totalGoalsCount = goals.length;
  
  const completedGoalsCount = useMemo(() => {
    return goals.filter(g => g.currentValue >= g.targetValue).length;
  }, [goals]);

  const completionRate = useMemo(() => {
    if (totalGoalsCount === 0) return 0;
    return Math.round((completedGoalsCount / totalGoalsCount) * 100);
  }, [totalGoalsCount, completedGoalsCount]);

  // Total session logs count
  const totalSessionsLogged = useMemo(() => {
    return goals.reduce((acc, g) => acc + g.logs.length, 0);
  }, [goals]);

  // Maximum streak among all current goals
  const maxGoalStreak = useMemo(() => {
    if (goals.length === 0) return 0;
    return Math.max(...goals.map(g => g.streak));
  }, [goals]);

  // 2. Prepare data for Category Distribution chart
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    goals.forEach(g => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }));
  }, [goals]);

  // 3. Prepare data for Activity Chart (Past 7 days completions)
  const last7DaysData = useMemo(() => {
    const result = [];
    const today = new Date();
    
    // Create map of last 7 dates
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Count logs made on this specific date across all goals
      let countLogs = 0;
      goals.forEach(goal => {
        const matchingLogs = goal.logs.filter(log => log.date === dateStr);
        countLogs += matchingLogs.length;
      });

      result.push({
        dayName,
        logsCount: countLogs,
        date: dateStr
      });
    }

    return result;
  }, [goals]);

  // Average completion rate of all goals combined
  const averageGoalCompletion = useMemo(() => {
    if (goals.length === 0) return 0;
    const totalPercentage = goals.reduce((acc, g) => {
      return acc + Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
    }, 0);
    return Math.round(totalPercentage / goals.length);
  }, [goals]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Summary Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Main Metric: Completion Rate */}
        <div className="frosted-card p-4 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Avg Completion</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-800">{averageGoalCompletion}%</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Accumulated across all active goals</p>
          </div>
        </div>

        {/* Global Days Active Streak */}
        <div className="frosted-card p-4 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Global Streak</span>
            <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-800">{profile.stats.globalStreak}d</p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">Active verification streak</p>
          </div>
        </div>
      </div>

      {/* Grid: Secondary metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="frosted-card p-3 rounded-2xl text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <h5 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Finished</h5>
          <p className="text-base font-extrabold text-slate-800 mt-0.5">{completedGoalsCount}</p>
        </div>
        <div className="frosted-card p-3 rounded-2xl text-center">
          <Zap className="w-4 h-4 text-violet-500 mx-auto mb-1" />
          <h5 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Best Habit</h5>
          <p className="text-base font-extrabold text-slate-800 mt-0.5">{maxGoalStreak}d</p>
        </div>
        <div className="frosted-card p-3 rounded-2xl text-center">
          <Hourglass className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <h5 className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Checkins</h5>
          <p className="text-base font-extrabold text-slate-800 mt-0.5">{totalSessionsLogged}</p>
        </div>
      </div>

      {/* Activity Bar Chart (Past 7 Days Logs) */}
      <div className="frosted-card p-5 rounded-3xl space-y-4">
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
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Pie Chart */}
      <div className="frosted-card p-5 rounded-3xl space-y-4">
        <div>
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
            <PieChartIcon className="w-4 h-4 text-indigo-500" /> Goal Categories Allocation
          </h4>
          <p className="text-[10px] text-slate-400 font-medium">Structural distribution of active tracking habits</p>
        </div>

        {categoryData.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">Create habits to map structural goals.</p>
        ) : (
          <div className="flex flex-col items-center">
            <div className="h-40 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '12px', 
                      borderColor: '#e2e8f0',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Inner core metric indicator */}
              <div className="absolute inset-x-0 mx-auto w-fit text-center translate-y-[-50%] top-[50%] pointer-events-none">
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Total</span>
                <span className="text-lg font-extrabold text-slate-800">{totalGoalsCount}</span>
              </div>
            </div>

            {/* Custom Legend grids */}
            <div className="grid grid-cols-2 gap-2.5 w-full pt-2">
              {categoryData.map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-[10px] text-slate-500 font-semibold truncate">
                    {entry.name}: <span className="text-slate-800 font-extrabold">{entry.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Inspirational Bottom Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/40 backdrop-blur-md border border-indigo-200/50 flex gap-3 items-start">
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
