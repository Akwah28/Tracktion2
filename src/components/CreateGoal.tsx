import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Flame, 
  BookOpen, 
  PenTool, 
  Heart, 
  CheckCircle,
  Eye,
  Plus,
  Minus,
  Check,
  Award,
  Calendar,
  AlertTriangle,
  Gauge
} from 'lucide-react';
import { Goal, GoalFrequency } from '../types';
import { CATEGORIES } from '../sampleData';

interface CreateGoalProps {
  onSave: (goalData: {
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
  }) => void;
  onCancel: () => void;
  editingGoal?: Goal;
}

const COLORS = [
  { name: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-700', bgLight: 'bg-emerald-50' },
  { name: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-700', bgLight: 'bg-indigo-50' },
  { name: 'rose', bg: 'bg-rose-500', text: 'text-rose-700', bgLight: 'bg-rose-50' },
  { name: 'amber', bg: 'bg-amber-500', text: 'text-amber-700', bgLight: 'bg-amber-50' },
  { name: 'violet', bg: 'bg-violet-500', text: 'text-violet-700', bgLight: 'bg-violet-50' },
  { name: 'sky', bg: 'bg-sky-500', text: 'text-sky-700', bgLight: 'bg-sky-50' },
];

const ICONS = [
  { name: 'Flame', component: Flame, label: 'Fitness' },
  { name: 'Heart', component: Heart, label: 'Wellness' },
  { name: 'BookOpen', component: BookOpen, label: 'Knowledge' },
  { name: 'PenTool', component: PenTool, label: 'Creative' },
  { name: 'Sparkles', component: Sparkles, label: 'Mind' },
  { name: 'CheckCircle', component: CheckCircle, label: 'Done' },
];

const PRESET_UNITS = ['mins', 'pages', 'km', 'glasses', 'hours', 'reps', 'times', 'sessions'];

export const CreateGoal: React.FC<CreateGoalProps> = ({ onSave, onCancel, editingGoal }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Wellness');
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState('mins');
  const [frequency, setFrequency] = useState<GoalFrequency>('daily');
  const [color, setColor] = useState('emerald');
  const [icon, setIcon] = useState('Heart');
  const [customUnit, setCustomUnit] = useState('');
  const [showCustomUnit, setShowCustomUnit] = useState(false);

  // New Goal Fields
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Load editing values if present
  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setDescription(editingGoal.description || '');
      setCategory(editingGoal.category);
      setTargetValue(editingGoal.targetValue);
      setUnit(editingGoal.unit);
      setFrequency(editingGoal.frequency);
      setColor(editingGoal.color);
      setIcon(editingGoal.icon);
      setDeadline(editingGoal.deadline || '');
      setPriority(editingGoal.priority || 'medium');
      setDifficulty(editingGoal.difficulty || 'medium');
      
      if (!PRESET_UNITS.includes(editingGoal.unit)) {
        setShowCustomUnit(true);
        setCustomUnit(editingGoal.unit);
      }
    }
  }, [editingGoal]);

  // Sync category selection with suitable color and icon presets
  const handleCategorySelect = (catName: string) => {
    setCategory(catName);
    const catPreset = CATEGORIES.find(c => c.name === catName);
    if (catPreset) {
      setColor(catPreset.color);
      setIcon(catPreset.icon);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalUnit = showCustomUnit ? (customUnit.trim() || 'reps') : unit;

    onSave({
      id: editingGoal?.id,
      title: title.trim(),
      description: description.trim(),
      category,
      targetValue: Number(targetValue),
      unit: finalUnit,
      frequency,
      color,
      icon,
      deadlineUrl: undefined, // ensure no extra mismatch keys
      deadline: deadline || undefined,
      priority,
      difficulty,
    });
  };

  const getTargetIcon = () => {
    const found = ICONS.find(i => i.name === icon);
    return found ? found.component : TargetIconFallback;
  };

  const TargetIconFallback = Heart;
  const ActiveIcon = getTargetIcon();

  return (
    <div className="flex flex-col h-full bg-transparent relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white/45 backdrop-blur-md border-b border-white/50 sticky top-0 z-10 shadow-xs">
        <button 
          onClick={onCancel}
          className="p-1.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
          id="btn-cancel-create"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-slate-800">
          {editingGoal ? 'Edit Goal' : 'Create Goal'}
        </h2>
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || targetValue <= 0}
          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-40"
          id="btn-save-goal"
        >
          Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 no-scrollbar">
        {/* Visual Live Preview Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Live Preview
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full capitalize">
              {frequency} Focus
            </span>
          </div>

          <div className="frosted-card p-5 rounded-3xl relative overflow-hidden">
            {/* Ambient Background decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-[0.06] ${
              color === 'emerald' ? 'bg-emerald-500' :
              color === 'indigo' ? 'bg-indigo-500' :
              color === 'rose' ? 'bg-rose-500' :
              color === 'amber' ? 'bg-amber-500' :
              color === 'violet' ? 'bg-violet-500' : 'bg-sky-500'
            }`} />

            <div className="flex gap-4">
              <div className={`p-3 rounded-2xl border aspect-square h-fit ${
                color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                color === 'indigo' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                color === 'rose' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                color === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                color === 'violet' ? 'bg-violet-50 text-violet-600 border-violet-100' : 'bg-sky-50 text-sky-600 border-sky-100'
              }`}>
                <ActiveIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 border ${
                  color === 'emerald' ? 'bg-emerald-50/70 text-emerald-700 border-emerald-100/70' :
                  color === 'indigo' ? 'bg-indigo-50/70 text-indigo-700 border-indigo-100/70' :
                  color === 'rose' ? 'bg-rose-50/70 text-rose-700 border-rose-100/70' :
                  color === 'amber' ? 'bg-amber-50/70 text-amber-700 border-amber-100/70' :
                  color === 'violet' ? 'bg-violet-50/70 text-violet-700 border-violet-100/70' : 'bg-sky-50/70 text-sky-700 border-sky-100/70'
                }`}>
                  {category}
                </span>

                <h3 className="text-base font-bold text-slate-800 truncate leading-tight">
                  {title.trim() || 'Title of Goal'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  {description.trim() || 'A visual description of your progress.'}
                </p>

                {/* Micro numerical progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">Progress</span>
                    <span className="font-bold text-slate-800">
                      0 <span className="text-[10px] text-slate-400 font-medium">/ {targetValue} {showCustomUnit ? (customUnit || 'reps') : unit}</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-200 w-[15%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goal Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Goal Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read physical book"
              className="w-full frosted-input rounded-2xl py-3 px-4 text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
            />
          </div>

          {/* Goal Description */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Description / Intention
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Expand mental models and sleep better."
              rows={2}
              className="w-full frosted-input rounded-2xl py-3 px-4 text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium resize-none"
            />
          </div>

          {/* Focus Category */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
              Focus Area
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`py-2.5 px-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    category === cat.name
                      ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold shadow-sm'
                      : 'border-white/50 frosted-button-secondary text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <span className="text-xs font-semibold">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Goal target value & units */}
          <div className="frosted-card p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Metrics & Targets</h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Target Value</span>
              <div className="flex items-center gap-1 border border-white/50 rounded-2xl p-1 bg-white/35 backdrop-blur-xs">
                <button
                  type="button"
                  onClick={() => setTargetValue(prev => Math.max(1, prev - 1))}
                  className="p-1.5 bg-white/50 hover:bg-white/85 border border-white/60 rounded-xl text-slate-600 active:scale-95 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min={1}
                  value={targetValue}
                  onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 text-center font-bold bg-transparent border-none focus:outline-none text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setTargetValue(prev => prev + 1)}
                  className="p-1.5 bg-white/50 hover:bg-white/85 border border-white/60 rounded-xl text-slate-600 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Units Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase">Unit of Measure</span>
                <button
                  type="button"
                  onClick={() => setShowCustomUnit(!showCustomUnit)}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  {showCustomUnit ? 'Choose presets' : 'Custom unit'}
                </button>
              </div>

              {showCustomUnit ? (
                <input
                  type="text"
                  placeholder="e.g. chapters, squats, tasks"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="w-full frosted-input rounded-2xl py-2.5 px-4 text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
                />
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_UNITS.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                        unit === u
                          ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700'
                          : 'border-white/50 frosted-button-secondary text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Goal Frequency */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">
              Committed Frequency
            </label>
            <div className="bg-white/30 border border-white/40 backdrop-blur-xs rounded-2xl p-1 grid grid-cols-3 gap-1">
              {(['daily', 'weekly', 'monthly'] as GoalFrequency[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`py-2 text-xs font-bold capitalize rounded-xl transition-all ${
                    frequency === f
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/30'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Target Milestone Specifications */}
          <div className="frosted-card p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Target Details & Milestones
            </h4>

            {/* Target Deadline */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Goal Target Deadline
              </label>
              <input 
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs font-bold leading-none p-3.5 bg-white/45 hover:bg-white/60 focus:bg-white border border-slate-100 rounded-2xl text-slate-800 focus:outline-none transition-all focus:ring-1 focus:ring-indigo-55/20"
              />
            </div>

            {/* Priority level */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-400" /> Focus Priority
              </label>
              <div className="bg-white/20 border border-slate-100/55 rounded-2xl p-1 grid grid-cols-3 gap-1">
                {(['low', 'medium', 'high'] as const).map((p) => {
                  const isSel = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        isSel
                          ? p === 'high' 
                            ? 'bg-rose-600 text-white shadow-sm' 
                            : p === 'medium'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-700 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty rating */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-slate-400" /> Commitment Difficulty
              </label>
              <div className="bg-white/20 border border-slate-100/55 rounded-2xl p-1 grid grid-cols-3 gap-1">
                {(['easy', 'medium', 'hard'] as const).map((d) => {
                  const isSel = difficulty === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        isSel
                          ? d === 'hard' 
                            ? 'bg-amber-600 text-white shadow-sm' 
                            : d === 'medium'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-850 hover:bg-white/40'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stylistic Customize Panel: Color & Icon */}
          <div className="frosted-card p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Aesthetic Pairings</h4>
            
            {/* Color circles */}
            <div>
              <span className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Visual Theme Accent</span>
              <div className="flex items-center gap-3">
                {COLORS.map((c) => {
                  const isSel = color === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.name)}
                      className={`w-7 h-7 rounded-full ${c.bg} relative transition-all active:scale-95 ${
                        isSel ? 'ring-2 ring-offset-2 ring-indigo-500 outline-none scale-110' : 'opacity-85'
                      }`}
                    >
                      {isSel && <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto font-bold" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <span className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Habit Emblem / Icon</span>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map((i) => {
                  const IconComp = i.component;
                  const isSel = icon === i.name;
                  return (
                    <button
                      key={i.name}
                      type="button"
                      onClick={() => setIcon(i.name)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                        isSel
                          ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700'
                          : 'border-white/50 bg-white/20 hover:border-white/70 text-slate-500'
                      }`}
                      title={i.label}
                    >
                      <IconComp className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Persistent save footer button to look highly visual */}
      <div className="p-4 bg-white/45 backdrop-blur-md border-t border-white/60">
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || targetValue <= 0}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Award className="w-5 h-5 text-indigo-400" />
          {editingGoal ? 'Confirm Changes' : 'Create Tracked Goal'}
        </button>
      </div>
    </div>
  );
};

export default CreateGoal;
