import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Trash2, 
  Edit3, 
  Plus, 
  X, 
  Sparkles, 
  AlertCircle, 
  Calendar,
  Goal as GoalIcon,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { Goal, GoalTask } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { TaskItemSkeleton } from './Skeletons';

interface GoalTaskManagerProps {
  goals: Goal[];
  tasks: GoalTask[];
  onCreateTask: (taskData: { title: string; goalId: string; value: number }) => Promise<void>;
  onToggleTask: (taskId: string) => Promise<void>;
  onEditTask: (taskId: string, updatedData: { title: string; goalId: string; value: number }) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  filterByGoalId?: string; // Optional: Only show tasks for a specific goal
  loading?: boolean;
}

export const GoalTaskManager: React.FC<GoalTaskManagerProps> = ({
  goals,
  tasks,
  onCreateTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  filterByGoalId,
  loading = false
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState(filterByGoalId || '');
  const [value, setValue] = useState(1);

  // Editing states
  const [editTitle, setEditTitle] = useState('');
  const [editGoalId, setEditGoalId] = useState('');
  const [editValue, setEditValue] = useState(1);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterByGoalId) {
      return task.goalId === filterByGoalId;
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedGoalId) return;

    await onCreateTask({
      title: title.trim(),
      goalId: selectedGoalId,
      value: value
    });

    setTitle('');
    setValue(1);
    setIsAdding(false);
  };

  const startEdit = (task: GoalTask) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditGoalId(task.goalId);
    setEditValue(task.value);
  };

  const handleSaveEdit = async (taskId: string) => {
    if (!editTitle.trim() || !editGoalId) return;
    await onEditTask(taskId, {
      title: editTitle.trim(),
      goalId: editGoalId,
      value: editValue
    });
    setEditingTaskId(null);
  };

  const getGoalInfo = (goalId: string) => {
    return goals.find(g => g.id === goalId);
  };

  return (
    <div className="space-y-4 text-left">
      {/* Task Controller Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <ListTodo className="w-4 h-4 text-indigo-500" /> Daily Quest Checklist
          </h4>
          <p className="text-[10px] text-slate-400 font-medium">
            Discrete daily tasks linked directly to your core master goals.
          </p>
        </div>
        
        {!isAdding && goals.length > 0 && (
          <button
            onClick={() => {
              setIsAdding(true);
              if (filterByGoalId) {
                setSelectedGoalId(filterByGoalId);
              } else if (goals.length > 0 && !selectedGoalId) {
                setSelectedGoalId(goals[0].id);
              }
            }}
            className="flex items-center gap-1 text-[10px] font-extrabold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </button>
        )}
      </div>

      {/* Add Task Panel */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-indigo-100 rounded-3xl p-4 shadow-3xs overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Commit to a Daily Action
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">What is the action step?</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Write 500 words, do a rapid 5-min stretch..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-bold leading-none p-3 border border-slate-100 bg-slate-50/40 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Link to Goal */}
                {!filterByGoalId && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Connect to Intention</label>
                    <select
                      value={selectedGoalId}
                      onChange={(e) => setSelectedGoalId(e.target.value)}
                      className="w-full text-xs font-bold leading-none p-3 border border-slate-100 bg-white rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                    >
                      {goals.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Impact value */}
                <div className={filterByGoalId ? "col-span-2 space-y-1" : "space-y-1"}>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                    Completion Power (+{value} {getGoalInfo(filterByGoalId || selectedGoalId)?.unit || 'XP'})
                  </label>
                  <div className="flex items-center border border-slate-100 rounded-xl bg-slate-50/30 overflow-hidden h-[38px] px-2 justify-between">
                    <button
                      type="button"
                      onClick={() => setValue(prev => Math.max(1, prev - 1))}
                      className="h-7 w-7 rounded-lg hover:bg-slate-100 border border-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer active:scale-95"
                    >
                      -
                    </button>
                    <span className="text-xs font-extrabold text-slate-800">{value}</span>
                    <button
                      type="button"
                      onClick={() => setValue(prev => prev + 1)}
                      className="h-7 w-7 rounded-lg hover:bg-slate-100 border border-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-[0.98] transition-all"
              >
                Integrate Task Into My Day
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No active goals state */}
      {goals.length === 0 && (
        <div className="p-5 border border-amber-100/60 bg-amber-50/15 rounded-3xl text-center space-y-1">
          <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
          <h5 className="text-xs font-extrabold text-slate-700">Create Your First Practice</h5>
          <p className="text-[9.5px] text-slate-405">
            To begin your daily checklist, first declare at least one primary area of growth in your goals tab.
          </p>
        </div>
      )}

      {/* Checklist tasks container */}
      <div className="space-y-2.5 max-h-[350px] overflow-y-auto no-scrollbar">
        {loading ? (
          <>
            <TaskItemSkeleton />
            <TaskItemSkeleton />
            <TaskItemSkeleton />
          </>
        ) : filteredTasks.length === 0 ? (
          <div className="p-7 border border-dashed border-slate-200 rounded-3xl text-center space-y-1 text-slate-400">
            <CheckCircle2 className="w-5 h-5 mx-auto text-slate-300" />
            <h5 className="text-[11px] font-extrabold text-slate-500">Your Checklist is Clear</h5>
            <p className="text-[9px] text-slate-400">
              Divide your larger intentions into small, actionable steps to build momentum today.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isEditing = editingTaskId === task.id;
            const goal = getGoalInfo(task.goalId);
            const isDone = task.completed;

            if (!goal) return null;

            // Visual theme mapping
            const colorMap: Record<string, string> = {
              emerald: 'text-emerald-500 fill-emerald-500/10 hover:bg-emerald-50 border-emerald-200 bg-emerald-50/20 text-emerald-700',
              indigo: 'text-indigo-500 fill-indigo-500/10 hover:bg-indigo-50 border-indigo-200 bg-indigo-50/20 text-indigo-700',
              rose: 'text-rose-500 fill-rose-500/10 hover:bg-rose-50 border-rose-200 bg-rose-50/20 text-rose-700',
              amber: 'text-amber-500 fill-amber-500/10 hover:bg-amber-50 border-amber-200 bg-amber-50/20 text-amber-700',
              violet: 'text-violet-500 fill-violet-500/10 hover:bg-violet-50 border-violet-200 bg-violet-50/20 text-violet-700',
              sky: 'text-sky-500 fill-sky-500/10 hover:bg-sky-50 border-sky-200 bg-sky-50/20 text-sky-700',
            };
            const themeClasses = colorMap[goal.color] || colorMap.indigo;

            return (
              <div
                key={task.id}
                className={`group border border-slate-100 bg-white rounded-2xl p-3.5 transition-all shadow-3xs flex flex-col justify-center ${
                  isDone ? 'bg-slate-50/40 opacity-80' : 'hover:border-indigo-100 hover:shadow-2xs'
                }`}
              >
                {isEditing ? (
                  /* Inline Edit Form */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                      <span className="text-[9px] font-black text-slate-505 uppercase tracking-wider">Modify Checklist Task</span>
                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-wide block">Task Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-xs font-bold leading-none p-2.5 border border-slate-100 bg-slate-50/50 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {!filterByGoalId && (
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-wide block">Goal Pathway</label>
                          <select
                            value={editGoalId}
                            onChange={(e) => setEditGoalId(e.target.value)}
                            className="w-full text-xs font-bold leading-none p-2.5 border border-slate-100 bg-white rounded-xl text-slate-800"
                          >
                            {goals.map(g => (
                              <option key={g.id} value={g.id}>
                                {g.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className={filterByGoalId ? "col-span-2 space-y-1" : "space-y-1"}>
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-wide block">Impact (+{editValue})</label>
                        <div className="flex items-center border border-slate-100 rounded-xl bg-slate-50/30 overflow-hidden h-[34px] px-2 justify-between">
                          <button
                            type="button"
                            onClick={() => setEditValue(prev => Math.max(1, prev - 1))}
                            className="h-6 w-6 rounded-lg hover:bg-slate-100 border text-slate-600 flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-extrabold text-slate-800">{editValue}</span>
                          <button
                            type="button"
                            onClick={() => setEditValue(prev => prev + 1)}
                            className="h-6 w-6 rounded-lg hover:bg-slate-100 border text-slate-600 flex items-center justify-center font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSaveEdit(task.id)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl cursor-pointer"
                    >
                      Save Task Settings
                    </button>
                  </div>
                ) : (
                  /* Standard Checklist Row */
                  <div className="flex items-center justify-between gap-3 relative">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Circle Checkbox */}
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className={`h-6 w-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                          isDone 
                            ? 'bg-indigo-600 border-indigo-650 text-white shadow-3xs scale-98' 
                            : 'border-slate-200 hover:border-indigo-400 bg-white'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      {/* Info & Title */}
                      <div className="min-w-0 flex-1">
                        <span 
                          className={`text-xs font-bold block truncate leading-tight transition-all ${
                            isDone ? 'text-slate-400 line-through font-semibold' : 'text-slate-700'
                          }`}
                        >
                          {task.title}
                        </span>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {/* Match Goal Flag */}
                          {!filterByGoalId && (
                            <span 
                              className={`inline-flex items-center gap-1 text-[8px] leading-none px-1.5 py-0.5 rounded-md font-extrabold uppercase border ${
                                goal.color === 'emerald' ? 'bg-emerald-50/40 text-emerald-800 border-emerald-100' :
                                goal.color === 'rose' ? 'bg-rose-50/40 text-rose-800 border-rose-100' :
                                goal.color === 'amber' ? 'bg-amber-50/40 text-amber-800 border-amber-100' :
                                goal.color === 'violet' ? 'bg-violet-50/40 text-violet-800 border-violet-100' :
                                goal.color === 'sky' ? 'bg-sky-50/40 text-sky-800 border-sky-100' :
                                'bg-indigo-50/40 text-indigo-800'
                              } max-w-[130px] truncate`}
                            >
                              <DynamicIcon name={goal.icon} size={8.5} /> {goal.title}
                            </span>
                          )}

                          {/* Incremental Booster indicator pill */}
                          <span 
                            className={`inline-flex items-center gap-0.5 text-[8.5px] leading-none px-1.5 py-0.5 rounded-md font-black border ${
                              isDone 
                                ? 'bg-slate-100 border-slate-200 text-slate-400' 
                                : 'bg-indigo-50/40 border-indigo-100 text-indigo-650'
                            }`}
                          >
                            +{task.value} {goal.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Panel Actions (Edit, Delete) */}
                    <div className="flex items-center gap-1.5 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(task)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all cursor-pointer"
                        title="Edit Task Settings"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
