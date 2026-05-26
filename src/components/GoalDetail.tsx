import React, { useState, useMemo } from 'react';
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
  Award,
  Share2,
  Trophy,
  Shield,
  Zap,
  Swords,
  Lock,
  Unlock,
  Compass,
  CheckCircle2,
  ChevronRight,
  Map,
  Star,
  Crown,
  Info
} from 'lucide-react';
import { Goal, GoalProgressLog, GoalTask } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { GoalTaskManager } from './GoalTaskManager';

interface GoalDetailProps {
  goal: Goal;
  onClose: () => void;
  onUpdateProgress: (goalId: string, incrementValue: number, note?: string) => void;
  onDeleteLog: (goalId: string, logId: string) => void;
  onEdit: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onShare?: (goal: Goal) => void;
  tasks: GoalTask[];
  onCreateTask: (taskData: { title: string; goalId: string; value: number }) => Promise<void>;
  onToggleTask: (taskId: string) => Promise<void>;
  onEditTask: (taskId: string, updatedData: { title: string; goalId: string; value: number }) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export const GoalDetail: React.FC<GoalDetailProps> = ({
  goal,
  onClose,
  onUpdateProgress,
  onDeleteLog,
  onEdit,
  onDeleteGoal,
  onShare,
  tasks,
  onCreateTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}) => {
  const [logValue, setLogValue] = useState<number>(1);
  const [logNote, setLogNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'quest' | 'roadmap' | 'history'>('quest');

  const percentage = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));

  const handleLoggedProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (logValue <= 0) return;
    onUpdateProgress(goal.id, logValue, logNote.trim() || undefined);
    setLogNote('');
  };

  const isCompletedToday = goal.currentValue >= goal.targetValue;

  // Visual theme colors configuration
  const colorClasses: Record<string, { 
    bg: string; 
    text: string; 
    bgLight: string; 
    border: string; 
    progress: string;
    glow: string;
    badgeBg: string;
  }> = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-700', bgLight: 'bg-emerald-50', border: 'border-emerald-150', progress: 'bg-emerald-500', glow: 'shadow-emerald-100', badgeBg: 'bg-emerald-100/40 text-emerald-800' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-700', bgLight: 'bg-indigo-50', border: 'border-indigo-150', progress: 'bg-indigo-500', glow: 'shadow-indigo-100', badgeBg: 'bg-indigo-100/40 text-indigo-800' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-700', bgLight: 'bg-rose-50', border: 'border-rose-150', progress: 'bg-rose-500', glow: 'shadow-rose-100', badgeBg: 'bg-rose-100/40 text-rose-800' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-700', bgLight: 'bg-amber-50', border: 'border-amber-150', progress: 'bg-amber-500', glow: 'shadow-amber-100', badgeBg: 'bg-amber-100/40 text-amber-800' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-700', bgLight: 'bg-violet-50', border: 'border-violet-150', progress: 'bg-violet-500', glow: 'shadow-violet-100', badgeBg: 'bg-violet-100/40 text-violet-800' },
    sky: { bg: 'bg-sky-500', text: 'text-sky-700', bgLight: 'bg-sky-50', border: 'border-sky-150', progress: 'bg-sky-500', glow: 'shadow-sky-100', badgeBg: 'bg-sky-100/40 text-sky-800' },
  };

  const activeColor = colorClasses[goal.color] || colorClasses.emerald;

  // RPG Hero Title based on Category Focus
  const heroicTitle = useMemo(() => {
    const cat = goal.category.toLowerCase();
    if (cat.includes('health') || cat.includes('fitness')) return 'Vitality Druid';
    if (cat.includes('mind') || cat.includes('soul') || cat.includes('spiritual')) return 'Zen Oracle';
    if (cat.includes('creative') || cat.includes('art') || cat.includes('writing')) return 'Artisan Bard';
    if (cat.includes('career') || cat.includes('work') || cat.includes('finance')) return 'Success Warlock';
    if (cat.includes('productivity') || cat.includes('study')) return 'Focus Alchemist';
    return 'Routine Ranger';
  }, [goal.category]);

  // Game Rank Level progression calculations 
  const goalLevel = useMemo(() => {
    if (percentage >= 100) return 6; // Max Level Accomplished
    return Math.floor(percentage / 20) + 1; // Level 1 to 5
  }, [percentage]);

  const levelName = useMemo(() => {
    switch (goalLevel) {
      case 1: return 'Bronze Recruiter';
      case 2: return 'Silver Squire';
      case 3: return 'Gold Vanguard';
      case 4: return 'Platinum Hero';
      case 5: return 'Epic Champion';
      case 6: return 'Max Sovereign Champion';
      default: return 'Squire';
    }
  }, [goalLevel]);

  // XP Progress to Next Rank Out of 100 XP
  const xpProgress = useMemo(() => {
    if (goalLevel === 6) return 100;
    return (percentage % 20) * 5; // e.g. 15% (level 1) becomes 15% out of 20% = 75% XP progress
  }, [percentage, goalLevel]);

  // Active Multiplier based on current consecutive check-in streak
  const streakMultiplier = useMemo(() => {
    if (goal.streak <= 0) return '1.0x';
    if (goal.streak < 3) return '1.1x';
    if (goal.streak < 7) return '1.3x';
    if (goal.streak < 15) return '1.6x';
    return '2.0x Gold Buff';
  }, [goal.streak]);

  // Custom programmed achievements milestones based on current values
  const milestones = useMemo(() => {
    const tVal = goal.targetValue;
    const current = goal.currentValue;
    return [
      {
        id: 'm1',
        title: 'Campfire Ignition',
        reqVal: Math.round(tVal * 0.1),
        percentage: 10,
        unlocked: current >= tVal * 0.1,
        bonusDesc: 'Initiate the flame. Unlocks Uncommon Avatar border.',
        rankBadge: 'Initiate'
      },
      {
        id: 'm2',
        title: 'Habit Foothold',
        reqVal: Math.round(tVal * 0.3),
        percentage: 30,
        unlocked: current >= tVal * 0.3,
        bonusDesc: 'Conquer the steep starting slope. Gains 1.2x streak potential.',
        rankBadge: 'Adept'
      },
      {
        id: 'm3',
        title: 'Solid Horizon',
        reqVal: Math.round(tVal * 0.6),
        percentage: 60,
        unlocked: current >= tVal * 0.6,
        bonusDesc: 'Establish consistency. Custom visual dashboard badge enabled.',
        rankBadge: 'Guardian'
      },
      {
        id: 'm4',
        title: 'Boss Summit Overlord',
        reqVal: Math.round(tVal * 0.85),
        percentage: 85,
        unlocked: current >= tVal * 0.85,
        bonusDesc: 'Epic mastery. Unlock exclusive cosmic custom particle glow.',
        rankBadge: 'Legendary'
      },
      {
        id: 'm5',
        title: 'Sovereign Triumph',
        reqVal: tVal,
        percentage: 100,
        unlocked: current >= tVal,
        bonusDesc: 'Absolute transcendence. Crown of ultimate visual honor award.',
        rankBadge: 'Sovereign'
      }
    ];
  }, [goal.targetValue, goal.currentValue]);

  // Gamified Step-by-Step roadmap details for the quest path success
  const roadmapSteps = useMemo(() => {
    const steps = [
      {
        stepNum: 1,
        title: 'Quest Initialization',
        desc: 'Begin logging actions regularly. Your instant goal is making 3 consecutive entries without zero values.',
        status: goal.logs.length > 0 ? 'completed' : 'active',
        tip: 'Keep increment notes highly expressive so you remember the contextual physical state.'
      },
      {
        stepNum: 2,
        title: 'The Golden Core Baseline',
        desc: `Reach ${milestones[1].reqVal} ${goal.unit} (the 30% mark). This starts setting structural brain circuits.`,
        status: percentage >= 30 ? 'completed' : goal.logs.length > 0 ? 'active' : 'locked',
        tip: 'Stagger increments early in the morning so you avoid late-night fatigue skips.'
      },
      {
        stepNum: 3,
        title: 'Conquer the Dead Mid-Zone',
        desc: `Bridge 30% to the high-horizon 60% peak (${milestones[2].reqVal} ${goal.unit}). Here focus fatigue is typical.`,
        status: percentage >= 60 ? 'completed' : percentage >= 30 ? 'active' : 'locked',
        tip: 'When feeling weak, log micro increment of even 1. No action is too microscopic!'
      },
      {
        stepNum: 4,
        title: 'Final Boss Summit',
        desc: `Charge towards 85%+ (${milestones[3].reqVal} ${goal.unit}). Complete critical checks and lock-in total dominance.`,
        status: percentage >= 85 ? 'completed' : percentage >= 60 ? 'active' : 'locked',
        tip: 'Formulate celebratory milestones. Prepare to export achievements for global display.'
      },
      {
        stepNum: 5,
        title: 'Eternal Sovereign Mastery',
        desc: `Cross the target line of ${goal.targetValue} ${goal.unit}! The quest resets to full archive or continuous multiplier.`,
        status: percentage >= 100 ? 'completed' : percentage >= 85 ? 'active' : 'locked',
        tip: 'Log ultimate milestone notes. You have fully hardened this habit matrix!'
      }
    ];
    return steps;
  }, [goal.targetValue, goal.unit, percentage, milestones, goal.logs.length]);

  return (
    <div className="flex flex-col h-full bg-transparent relative z-10">
      
      {/* 1. Header Sticky panel */}
      <div className="flex items-center justify-between px-5 py-4 bg-white/45 backdrop-blur-md border-b border-white/50 sticky top-0 z-10 shadow-xs">
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-slate-150 rounded-full text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          id="btn-close-detail"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-indigo-500" /> Active Hero Quest
        </span>
        <div className="flex items-center gap-1">
          {onShare && (
            <button
              onClick={() => onShare(goal)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
              title="Share progress card"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(goal)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
            title="Edit Quest Settings"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
            title="Abandon Quest"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Sub-Tabs Navigation for Gamified elements */}
      <div className="bg-slate-50/50 p-1 border-b border-slate-100 grid grid-cols-3 gap-1">
        <button
          onClick={() => setActiveSubTab('quest')}
          className={`py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'quest'
              ? 'bg-indigo-65 text-indigo-600 shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🎮 Quest Hall
        </button>
        <button
          onClick={() => setActiveSubTab('roadmap')}
          className={`py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'roadmap'
              ? 'bg-indigo-65 text-indigo-600 shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🗺️ Success Trail
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-indigo-65 text-indigo-600 shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📜 Archive Ledger
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 no-scrollbar">

        {/* QUEST HALL TAB view */}
        {activeSubTab === 'quest' && (
          <div className="space-y-6">
            
            {/* 3. Hero Quest Information Header & EXP levels */}
            <div className="frosted-card p-5 rounded-3xl relative overflow-hidden shadow-sm">
              <div className={`absolute top-0 right-0 w-36 h-36 rounded-bl-full opacity-[0.06] ${activeColor.bg}`} />
              
              <div className="flex gap-4 items-start">
                <div className={`p-4 rounded-3xl border shadow-sm flex items-center justify-center relative ${activeColor.bgLight} ${activeColor.text} ${activeColor.border} select-none`}>
                  <DynamicIcon name={goal.icon} size={28} />
                  {percentage >= 100 && (
                    <span className="absolute -top-1.5 -right-1.5 p-1 bg-amber-500 text-white rounded-lg shadow-xs border border-white">
                      <Crown className="w-3.5 h-3.5 fill-white" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {heroicTitle}
                    </span>
                    <span className="text-[9px] bg-slate-150 px-2 py-0.5 rounded-md capitalize font-extrabold text-slate-600">
                      {goal.frequency} Quest
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 leading-tight mt-1.5">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{goal.description}</p>
                  )}

                  {/* Deadline & Parameters pills */}
                  {(goal.deadline || goal.priority || goal.difficulty) && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {goal.deadline && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-100 text-slate-500 shadow-2xs" title="Target Deadline">
                          <Calendar className="w-2.5 h-2.5 text-indigo-500" /> Due: {goal.deadline}
                        </span>
                      )}
                      {goal.priority && (
                        <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                          goal.priority === 'high' 
                            ? 'bg-rose-50 text-rose-700 border-rose-100' 
                            : goal.priority === 'medium' 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                            : 'bg-slate-50 text-slate-600 border-slate-100'
                        }`} title="Priority Placement">
                          Priority: {goal.priority}
                        </span>
                      )}
                      {goal.difficulty && (
                        <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                          goal.difficulty === 'hard' 
                            ? 'bg-amber-50 text-amber-700 border-amber-100' 
                            : goal.difficulty === 'medium' 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`} title="Expected Difficulty">
                          Level: {goal.difficulty}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* EXP PROGRESS LEVEL METRIC BAR */}
              <div className="mt-5 pt-4 border-t border-slate-100/60 space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <div className="flex items-center gap-1">
                    <span className="p-1 rounded-md bg-indigo-50 text-indigo-600">
                      <Star className="w-3.5 h-3.5 fill-indigo-500" />
                    </span>
                    <span className="font-extrabold text-slate-800 text-xs">
                      {levelName} <span className="text-indigo-600">Rank {goalLevel}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-extrabold">
                    XP: {xpProgress} / 100 <span className="text-[9px] text-slate-300 font-medium">({percentage}% cumulative)</span>
                  </span>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${activeColor.bg}`}
                  />
                  {/* Subtle milestones checkpoints ticks */}
                  <div className="absolute inset-0 flex justify-between px-1 pointer-events-none select-none">
                    <span className="w-0.5 h-full bg-white/35" />
                    <span className="w-0.5 h-full bg-white/35" />
                    <span className="w-0.5 h-full bg-white/35" />
                    <span className="w-0.5 h-full bg-white/35" />
                    <span className="w-0.5 h-full bg-white/35" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-700 font-extrabold">Quest Target: <span className="text-slate-500 font-medium">{goal.currentValue} / {goal.targetValue} {goal.unit}</span></span>
                  <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md text-[10px]">Multiplier: {streakMultiplier}</span>
                </div>
              </div>

              {/* Sub metrics stats blocks */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="p-3 bg-orange-50/20 rounded-2xl border border-orange-100/50 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-orange-600 font-extrabold uppercase tracking-wider flex items-center gap-1 leading-none">
                      <Flame className="w-3.5 h-3.5 text-orange-500 stroke-[2.5]" /> Active Streak Record
                    </span>
                    <p className="text-lg font-black text-slate-800 tracking-tight mt-1.5">
                      {goal.streak} <span className="text-[10px] text-slate-400 font-medium">days</span>
                    </p>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 leading-tight">Keeps your dynamic multiplier buff burning.</p>
                </div>

                <div className="p-3 bg-indigo-50/20 rounded-2xl border border-indigo-100/50 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-wider flex items-center gap-1 leading-none">
                      <Trophy className="w-3.5 h-3.5 text-indigo-500 stroke-[2]" /> Unlocked Milestones
                    </span>
                    <p className="text-lg font-black text-slate-800 tracking-tight mt-1.5">
                      {milestones.filter(m => m.unlocked).length} <span className="text-[10px] text-slate-440 font-semibold">/ {milestones.length}</span>
                    </p>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 leading-tight">Achievement tiers verified on quest ledger.</p>
                </div>
              </div>
            </div>

            {/* Daily tasks checklist for this specific goal pathway */}
            <div className="frosted-card p-5 rounded-3xl space-y-4">
              <GoalTaskManager
                goals={[goal]}
                tasks={tasks}
                onCreateTask={onCreateTask}
                onToggleTask={onToggleTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                filterByGoalId={goal.id}
              />
            </div>

            {/* Daily increment activity logger */}
            <div className="frosted-card p-5 rounded-3xl space-y-4">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-500" /> Log Quest Checkpoint Action
              </h4>

              {isCompletedToday ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-500 text-white rounded-xl shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-emerald-800">Apex Achievement Unlocked</h5>
                    <p className="text-[10px] text-emerald-600">This daily target is successfully checked-off on databases!</p>
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleLoggedProgress} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Effort Increment</label>
                    <div className="flex items-center justify-between border border-slate-100 rounded-2xl p-1 bg-slate-50/50 hover:bg-slate-50 transition-all">
                      <button
                        type="button"
                        onClick={() => setLogValue(prev => Math.max(1, prev - 1))}
                        className="p-2.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-600 active:scale-95 transition-all cursor-pointer shadow-3xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-extrabold text-slate-800 text-sm">
                        {logValue} <span className="text-xs text-slate-400 font-medium">{goal.unit}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setLogValue(prev => prev + 1)}
                        className="p-2.5 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-600 active:scale-95 transition-all cursor-pointer shadow-3xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Checkpoint Notes / Diary Reflection</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Cleared early morning session, hydrated"
                      value={logNote}
                      onChange={(e) => setLogNote(e.target.value)}
                      maxLength={128}
                      className="w-full text-xs font-bold leading-none p-3.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-100 rounded-2xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 pr-4 pl-10 transition-all placeholder-slate-405"
                    />
                    <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-extrabold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200 fill-indigo-200 animate-pulse" />
                  <span>Execute Action & Gain XP</span>
                </button>
              </form>
            </div>

            {/* Programmed Milestone Unlocks Cards */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Unlocked Badge Milestones</span>
              <div className="space-y-2.5">
                {milestones.map((milestone) => (
                  <div 
                    key={milestone.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between shadow-3xs ${
                      milestone.unlocked 
                        ? 'bg-emerald-50/15 border-emerald-100/70' 
                        : 'bg-slate-50/40 border-slate-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl border flex items-center justify-center ${
                        milestone.unlocked 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        {milestone.unlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <h5 className={`text-xs font-extrabold ${milestone.unlocked ? 'text-slate-800' : 'text-slate-550'}`}>{milestone.title}</h5>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider border leading-none ${
                            milestone.unlocked
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-750'
                              : 'bg-slate-100 border-slate-200 text-slate-450'
                          }`}>
                            {milestone.rankBadge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{milestone.bonusDesc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black block ${milestone.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                        {milestone.reqVal} <span className="text-[9px] font-semibold text-slate-400">{goal.unit}</span>
                      </span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{milestone.percentage}% Target</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )}

        {/* ROADMAP SUCCESS TIMELINE TAB view */}
        {activeSubTab === 'roadmap' && (
          <div className="space-y-6">

            {/* Interactive Timeline map banner */}
            <div className="frosted-card p-5 rounded-3xl relative overflow-hidden bg-gradient-to-br from-indigo-50/40 to-white">
              <div className="absolute top-[-25px] right-[-25px] w-24 h-24 bg-indigo-100/40 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl shadow-3xs flex-shrink-0">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">Success Road Map</h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                    Step-by-step commitment milestones layout to guarantee maximum psychological habit formation and tracking adherence.
                  </p>
                </div>
              </div>
            </div>

            {/* Roadmap steppers trail */}
            <div className="relative pl-5 left-1 space-y-7 border-l-2 border-slate-100">
              {roadmapSteps.map((step) => {
                const isComp = step.status === 'completed';
                const isActive = step.status === 'active';
                const isLock = step.status === 'locked';

                return (
                  <div key={step.stepNum} className="relative text-left">
                    {/* Visual node bullet circle icon */}
                    <div className={`absolute -left-[31px] top-1.5 w-5 h-5 rounded-full border-4 flex items-center justify-center transition-all ${
                      isComp 
                        ? 'bg-emerald-600 border-emerald-100 shadow-sm' 
                        : isActive
                        ? 'bg-indigo-600 border-indigo-150 animate-pulse'
                        : 'bg-slate-200 border-white'
                    }`}>
                      {isComp && <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />}
                    </div>

                    <div className={`frosted-card p-4 rounded-2xl transition-all ${
                      isActive 
                        ? 'border-indigo-200/60 bg-white/70 shadow-sm' 
                        : isLock
                        ? 'opacity-65 bg-slate-50/30'
                        : 'border-emerald-100/45'
                    }`}>
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <span className={`text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-md block w-fit mb-1 border ${
                            isComp
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                              : isActive
                              ? 'bg-indigo-50 border-indigo-100 text-indigo-700 font-extrabold'
                              : 'bg-slate-100 border-slate-100 text-slate-450'
                          }`}>
                            STAGE 0{step.stepNum} {step.status.toUpperCase()}
                          </span>
                          <h5 className="text-[11px] font-extrabold text-slate-800 leading-tight">{step.title}</h5>
                        </div>
                        {isLock ? (
                          <Lock className="w-3.5 h-3.5 text-slate-350" />
                        ) : isComp ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-indigo-500 animate-spin text-[8px]" />
                        )}
                      </div>
                      
                      <p className="text-[10px] text-slate-450 mt-1.5 leading-relaxed">{step.desc}</p>
                      
                      {/* Game tip box */}
                      {!isLock && (
                        <div className="mt-2 text-[9.5px] p-2 bg-slate-50/70 border border-slate-100/55 rounded-xl text-slate-500 font-medium flex gap-1.5 items-start">
                          <Info className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <span><span className="font-extrabold text-slate-655 uppercase block text-[8px] leading-3 mb-0.5">Tactical Quest Tip:</span> {step.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Boss fight final info banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left flex gap-3">
              <Swords className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 animate-bounce" />
              <div>
                <h5 className="text-xs font-extrabold text-amber-950">Daily Final Boss Encounter</h5>
                <p className="text-[10px] text-slate-600 leading-relaxed mt-0.5 font-medium">
                  The ultimate final boss is inertia. Skip days only at the peril of degrading rank statistics. Lock custom logs early to preserve multiplier power!
                </p>
              </div>
            </div>

          </div>
        )}

        {/* LEDGER TIMELINE LOGS LIST view */}
        {activeSubTab === 'history' && (
          <div className="space-y-6">

            {/* Total progress tracking timeline */}
            <div className="grid grid-cols-2 gap-3">
              <div className="frosted-card p-4 rounded-3xl text-left bg-gradient-to-br from-indigo-50/20 to-white shadow-3xs">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block leading-none">Total Unlocked Actions</span>
                <span className="text-2xl font-black mt-2 block text-slate-800 tracking-tight">{goal.logs.length}</span>
                <p className="text-[9px] text-slate-400 mt-1">Actions committed to live ledger databases.</p>
              </div>

              <div className="frosted-card p-4 rounded-3xl text-left bg-gradient-to-br from-emerald-50/20 to-white shadow-3xs">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block leading-none">Target Goal Scale</span>
                <span className="text-2xl font-black mt-2 block text-slate-800 tracking-tight">
                  {goal.targetValue} <span className="text-xs text-slate-400 font-medium">{goal.unit}</span>
                </span>
                <p className="text-[9px] text-slate-440 mt-1">Final threshold target to master the quest.</p>
              </div>
            </div>

            {/* Full Ledger lists with incremental notes */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 text-left">
                <History className="w-4 h-4 text-indigo-500" /> Goal History Logs & reflections
              </h4>

              {goal.logs.length === 0 ? (
                <div className="frosted-card p-8 rounded-3xl text-center space-y-2">
                  <Star className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-400">Ledger is empty. Make your first entry in the Quest Hall!</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                  {[...goal.logs].reverse().map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100/60 bg-white/20 hover:bg-white/40 transition-all text-left"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-xl border flex-shrink-0 mt-0.5 ${
                          log.value > 0 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                          <Sparkles className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-extrabold text-slate-850">
                            Logged +{log.value} <span className="text-[10px] text-slate-400 font-medium">{goal.unit}</span>
                          </h5>
                          <span className="text-[9px] text-slate-400 font-medium block mt-0.5">{log.date}</span>
                          
                          {log.note && (
                            <p className="text-[10px] text-slate-500 bg-white/95 border border-slate-105 rounded-xl py-1 px-2.5 mt-1.5 italic w-fit leading-normal shadow-3xs max-w-[210px] break-words">
                              "{log.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteLog(goal.id, log.id)}
                        className="p-1.5 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all flex-shrink-0"
                        title="Remove checkpoint entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Delete Confirmation Overlay Sheet */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-md z-30 flex items-end">
            <motion.div
              initial={{ y: 220 }}
              animate={{ y: 0 }}
              exit={{ y: 220 }}
              className="frosted-card bg-white/95 backdrop-blur-xl w-full rounded-t-3xl p-6 space-y-4 shadow-2xl border-t border-white/60"
            >
              <h3 className="text-base font-black text-slate-900">Abandon Quest?</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                You are about to abandon <span className="font-extrabold text-slate-800">"{goal.title}"</span>. This will erase your recorded levels, milestones, logs, streak multipliers, and success trail history archive permanently.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="py-3 px-4 bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-205 transition-all text-center cursor-pointer"
                >
                  Save Quest
                </button>
                <button
                  onClick={() => {
                    onDeleteGoal(goal.id);
                    onClose();
                  }}
                  className="py-3 px-4 bg-rose-600 text-white rounded-2xl text-xs font-bold hover:bg-rose-700 transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Abandon Quest
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
