import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Flame, 
  Trash2, 
  Edit3, 
  Plus, 
  Minus,
  Check, 
  Calendar, 
  Clock, 
  History, 
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';
import { Goal, GoalProgressLog } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface GoalDetailProps {
  goal: Goal;
  onClose: () => void;
  onUpdateProgress: (goalId: string, incrementValue: number, note?: string) => void;
  onDeleteLog: (goalId: string, logId: string) => void;
  onEdit: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const GoalDetail: React.FC<GoalDetailProps> = ({
  goal,
  onClose,
  onUpdateProgress,
  onDeleteLog,
  onEdit,
  onDeleteGoal,
}) => {
  const [logValue, setLogValue] = useState<number>(1);
  const [logNote, setLogNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const percentage = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));

  const handleLoggedProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (logValue <= 0) return;
    onUpdateProgress(goal.id, logValue, logNote.trim() || undefined);
    setLogNote('');
  };

  const isCompletedToday = goal.currentValue >= goal.targetValue;

  const colorClasses: Record<string, { bg: string, text: string, bgLight: string, border: string, progress: string }> = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-700', bgLight: 'bg-emerald-50', border: 'border-emerald-100', progress: 'bg-emerald-500' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-700', bgLight: 'bg-indigo-50', border: 'border-indigo-100', progress: 'bg-indigo-500' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-700', bgLight: 'bg-rose-50', border: 'border-rose-100', progress: 'bg-rose-500' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-700', bgLight: 'bg-amber-50', border: 'border-amber-100', progress: 'bg-amber-500' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-700', bgLight: 'bg-violet-50', border: 'border-violet-100', progress: 'bg-violet-500' },
    sky: { bg: 'bg-sky-500', text: 'text-sky-700', bgLight: 'bg-sky-50', border: 'border-sky-100', progress: 'bg-sky-500' },
  };

  const activeColor = colorClasses[goal.color] || colorClasses.emerald;

  return (
    <div className="flex flex-col h-full bg-transparent relative z-10">
      {/* Header Panel */}
      <div className="flex items-center justify-between px-5 py-4 bg-white/45 backdrop-blur-md border-b border-white/50 sticky top-0 z-10 shadow-xs">
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-slate-150 rounded-full text-slate-400 hover:text-slate-600 transition-all"
          id="btn-close-detail"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Goal Metrics</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(goal)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 transition-all"
            title="Edit goal"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-rose-600 transition-all"
            title="Delete goal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 no-scrollbar">
        {/* Core Info & Streak Highlight */}
        <div className="frosted-card p-5 rounded-3xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-[0.06] ${activeColor.bg}`} />
          
          <div className="flex gap-4">
            <div className={`p-3.5 rounded-2xl border aspect-square h-fit ${activeColor.bgLight} ${activeColor.text} ${activeColor.border}`}>
              <DynamicIcon name={goal.icon} size={24} />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-2">
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize ${activeColor.bgLight} ${activeColor.text} ${activeColor.border}`}>
                  {goal.category}
                </span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md capitalize font-bold">
                  {goal.frequency}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 leading-snug mt-1">{goal.title}</h3>
              {goal.description && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{goal.description}</p>
              )}
            </div>
          </div>

          {/* Numerical progress tracking */}
          <div className="mt-6 border-t border-slate-100/50 pt-5 space-y-4">
            <div>
              <div className="flex justify-between items-baseline mb-2 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Completion Matrix</span>
                <span className="font-bold text-slate-800">
                  {goal.currentValue} <span className="text-slate-400 font-semibold">/ {goal.targetValue} {goal.unit}</span>
                  <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] py-0.5 px-2 rounded-full ml-2 font-bold">
                    {percentage}%
                  </span>
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${activeColor.bg} rounded-full transition-all duration-500`} 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Micro Quick Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-orange-50/20 backdrop-blur-xs border border-orange-200/40 p-3 rounded-2xl">
                <span className="text-[10px] text-orange-600 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" /> Active Streak
                </span>
                <p className="text-xl font-extrabold text-slate-800 mt-1">
                  {goal.streak} <span className="text-xs text-slate-400 font-medium">days</span>
                </p>
              </div>

              <div className="bg-white/40 border border-white/50 p-3 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Total Logs
                </span>
                <p className="text-xl font-extrabold text-slate-800 mt-1">
                  {goal.logs.length} <span className="text-xs text-slate-400 font-medium">sessions</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Check-in / Logger Panel */}
        <div className="frosted-card p-5 rounded-3xl space-y-4">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-500" /> Log Session Progress
          </h4>

          {isCompletedToday ? (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-emerald-500 text-white rounded-full">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-emerald-800">Completed for Today!</h5>
                <p className="text-[10px] text-emerald-600">Great work. Your daily streak has been fortified!</p>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleLoggedProgress} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Logged Increment</label>
                <div className="flex items-center justify-between border border-white/50 rounded-2xl p-1 bg-white/30 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() => setLogValue(prev => Math.max(1, prev - 1))}
                    className="p-2 bg-white/50 hover:bg-white/85 border border-white/70 rounded-xl text-slate-600 active:scale-95 transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-slate-800 text-sm">
                    {logValue} <span className="text-xs text-slate-400 font-medium">{goal.unit}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setLogValue(prev => prev + 1)}
                    className="p-2 bg-white/50 hover:bg-white/85 border border-white/70 rounded-xl text-slate-600 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Log Session Note (optional)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Completed with team, felt awesome"
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  className="w-full frosted-input rounded-2xl py-3 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
                />
                <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-2xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 text-xs"
            >
              <Plus className="w-4 h-4" /> Save Increment Logs
            </button>
          </form>
        </div>

        {/* History timeline logs */}
        <div className="frosted-card p-5 rounded-3xl space-y-4">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-indigo-500" /> Goal History Logs
          </h4>

          {goal.logs.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6 font-medium">No progress records added yet. Complete a session above!</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {[...goal.logs].reverse().map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-white/45 bg-white/30 backdrop-blur-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">
                        Added {log.value} <span className="text-[10px] text-slate-400 font-medium">{goal.unit}</span>
                      </h5>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">{log.date}</p>
                      {log.note && (
                        <p className="text-[10px] text-slate-500 bg-white/65 backdrop-blur-xs border border-white/50 rounded-lg py-1 px-2 mt-1 italic w-fit">
                          "{log.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteLog(goal.id, log.id)}
                    className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-500 transition-all"
                    title="Remove entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete/Cancel modal sheet */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md z-30 flex items-end">
            <motion.div
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              className="frosted-card bg-white/95 backdrop-blur-xl w-full rounded-t-3xl p-6 space-y-4 shadow-2xl border-t border-white/60"
            >
              <h3 className="text-base font-bold text-slate-900">Delete this Tracker?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are about to delete <span className="font-semibold text-slate-800">"{goal.title}"</span>. This will destroy all streak indices, progress charts and history archives permanently.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="py-3 px-4 bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all"
                >
                  Keep Tracker
                </button>
                <button
                  onClick={() => {
                    onDeleteGoal(goal.id);
                    onClose();
                  }}
                  className="py-3 px-4 bg-rose-600 text-white rounded-2xl text-xs font-bold hover:bg-rose-700 transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoalDetail;
