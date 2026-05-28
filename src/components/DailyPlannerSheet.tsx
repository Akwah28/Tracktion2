import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  Check, 
  Plus, 
  Minus, 
  PenTool, 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  Trash2,
  Clock,
  Target,
  Edit2
} from 'lucide-react';
import { Goal } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface DailyPlannerSheetProps {
  date: Date;
  activeGoals: Goal[];
  onClose: () => void;
  onUpdateGoalProgress: (goalId: string, increment: number, note?: string, customDate?: string) => void;
  onAddNewGoal: (preselectedDate: string) => void;
  onEditGoal: (goal: Goal) => void;
}

export const DailyPlannerSheet: React.FC<DailyPlannerSheetProps> = ({
  date,
  activeGoals,
  onClose,
  onUpdateGoalProgress,
  onAddNewGoal,
  onEditGoal,
}) => {
  const dateStr = date.toISOString().split('T')[0];
  const formattedDateString = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const getDayProgress = (goal: Goal) => {
    return goal.logs
      .filter(l => l.date === dateStr)
      .reduce((sum, l) => sum + l.value, 0);
  };

  const getPercentage = (goal: Goal) => {
    const progress = getDayProgress(goal);
    return Math.min(100, Math.round((progress / goal.targetValue) * 150) / 1.5);
  };

  const getCategoryTheme = (category: string) => {
    const categories: Record<string, { badge: string; border: string; text: string; bg: string }> = {
      Health: { badge: 'bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600', border: 'border-emerald-100', text: 'text-emerald-700', bg: 'emerald' },
      Career: { badge: 'bg-indigo-50 dark:bg-indigo-950/25 text-indigo-600', border: 'border-indigo-100', text: 'text-indigo-700', bg: 'indigo' },
      Mind: { badge: 'bg-violet-50 dark:bg-violet-950/25 text-violet-600', border: 'border-violet-100', text: 'text-violet-700', bg: 'violet' },
      Finance: { badge: 'bg-amber-50 dark:bg-amber-950/25 text-amber-600', border: 'border-amber-100', text: 'text-amber-700', bg: 'amber' },
      Creative: { badge: 'bg-rose-50 dark:bg-rose-950/25 text-rose-600', border: 'border-rose-100', text: 'text-rose-700', bg: 'rose' },
      Wellness: { badge: 'bg-teal-50 dark:bg-teal-950/25 text-teal-600', border: 'border-teal-100', text: 'text-teal-700', bg: 'teal' },
    };
    return categories[category] || categories.Wellness;
  };

  // Color classes mapping matched to App theme
  const colorClasses: Record<string, { bg: string; text: string; progress: string; bgLight: string; border: string }> = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-450', progress: 'bg-emerald-500', bgLight: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-100 dark:border-emerald-950/40' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-450', progress: 'bg-indigo-500', bgLight: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-100 dark:border-indigo-950/40' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-450', progress: 'bg-rose-500', bgLight: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-100 dark:border-rose-950/40' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-450', progress: 'bg-amber-500', bgLight: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-100 dark:border-amber-950/40' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-700 dark:text-violet-450', progress: 'bg-violet-500', bgLight: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-100 dark:border-violet-950/40' },
    sky: { bg: 'bg-sky-500', text: 'text-sky-700 dark:text-sky-450', progress: 'bg-sky-500', bgLight: 'bg-sky-50 dark:bg-sky-950/20', border: 'border-sky-100 dark:border-sky-950/40' },
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-end justify-center z-50 p-0 sm:p-4">
      {/* Background click handler */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative bg-slate-50 dark:bg-slate-950 w-full max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-white/60 dark:border-slate-900/50 flex flex-col max-h-[90vh]"
      >
        {/* Decorative Top Accent line */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-3.5" />

        {/* Head Block */}
        <div className="px-6 pt-4 pb-3 flex items-start justify-between">
          <div className="text-left">
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-widest block">Weekly Planner Actions</span>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-5 h-5 text-indigo-500" /> {formattedDateString}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 dark:text-slate-500 rounded-full transition-transform active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Goal items area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 space-y-4 no-scrollbar">
          {activeGoals.length === 0 ? (
            <div className="py-12 px-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80 text-center space-y-4 bg-white/30 dark:bg-slate-900/20">
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-500 rounded-2xl w-fit mx-auto">
                <Target className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-350">No habits listed</h4>
                <p className="text-[10.5px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-[240px] mx-auto">
                  A peaceful slate ready for daily focus. Tap below to establish or schedule habits for this day.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal) => {
                const colors = colorClasses[goal.color] || colorClasses.emerald;
                const pathProgress = getDayProgress(goal);
                const percent = getPercentage(goal);
                const isCompleted = pathProgress >= goal.targetValue;
                const trackerTheme = getCategoryTheme(goal.category);

                return (
                  <div
                    key={goal.id}
                    className="p-4 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850/50 space-y-3 shadow-3xs"
                  >
                    {/* Goal label details */}
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-2.5 text-left">
                        <div className={`p-2.5 rounded-2xl ${colors.bgLight} ${colors.text}`}>
                          <DynamicIcon name={goal.icon} className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-1">
                            {goal.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${trackerTheme.badge}`}>
                              {goal.category}
                            </span>
                            <span className="text-[9.5px] font-semibold text-slate-400 dark:text-slate-500">
                              {goal.isRecurring ? '🔄 Weekly Recurrence' : '📅 One-Time Goal'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditGoal(goal)}
                          className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-450 dark:text-slate-500 rounded-lg cursor-pointer"
                          title="Edit Goal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Day Progress bar indices */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-500 dark:text-slate-450">
                        <span>Day progress</span>
                        <span>
                          {pathProgress} / {goal.targetValue} <span className="text-[9.5px] text-slate-400">{goal.unit}</span>
                        </span>
                      </div>

                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colors.progress} transition-all duration-300`} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick increment / check controls */}
                    <div className="flex items-center justify-between pt-1">
                      {isCompleted ? (
                        <div className="flex items-center gap-1 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/50 py-1.5 px-3 rounded-2xl">
                          <Check className="w-3.5 h-3.5 stroke-[3px]" />
                          <span>Fully Completed today</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold italic">Keep going!</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        {/* Decrement log button if value logged today exceeds 0 */}
                        {pathProgress > 0 && (
                          <button
                            onClick={() => onUpdateGoalProgress(goal.id, -1, 'Decrement adjustment', dateStr)}
                            className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 rounded-xl transition-transform active:scale-90 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const stepsNeeded = goal.targetValue - pathProgress;
                            const increment = stepsNeeded > 1 ? 1 : stepsNeeded;
                            onUpdateGoalProgress(goal.id, increment, 'Quick logged progress', dateStr);
                          }}
                          className={`py-1.5 px-3.5 rounded-xl text-[10.5px] font-bold flex items-center gap-1 transition-all active:scale-90 cursor-pointer ${
                            isCompleted
                              ? 'bg-slate-100 dark:bg-slate-850 text-slate-450 cursor-not-allowed'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                          disabled={isCompleted}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Log Progress</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Goal to selected Date direct shortcut action */}
          <button
            onClick={() => onAddNewGoal(dateStr)}
            className="w-full mt-2 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-3xl font-extrabold text-xs flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Habit for this date</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
