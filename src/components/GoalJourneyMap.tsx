import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Flag, 
  Sparkles, 
  Calendar, 
  Heart, 
  Flame, 
  ChevronRight, 
  ChevronLeft,
  Crown,
  Lock,
  MessageSquare,
  Plus,
  Minus,
  CheckCircle2,
  Bookmark,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { Goal } from '../types';

interface GoalJourneyMapProps {
  goal: Goal;
  onUpdateProgress: (goalId: string, increment: number, note?: string, customDate?: string) => void;
}

export const GoalJourneyMap: React.FC<GoalJourneyMapProps> = ({ goal, onUpdateProgress }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [quickLogValue, setQuickLogValue] = useState<number>(1);
  const [quickNote, setQuickNote] = useState<string>('');
  
  // Weekly tracker reference calculation
  // Find Monday of the current week (or default to 7 days relative to today if outside limits)
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const distToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date();
    monday.setDate(today.getDate() + distToMonday);

    return Array.from({ length: 7 }).map((_, idx) => {
      const dateObj = new Date(monday);
      dateObj.setDate(monday.getDate() + idx);
      const dateString = dateObj.toISOString().split('T')[0];
      const weekdayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const dayShort = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const calendarDay = dateObj.getDate();
      
      // Calculate progress on this date
      const progressOnDate = goal.logs
        .filter(l => l.date === dateString)
        .reduce((sum, l) => sum + l.value, 0);
      
      const isCompleted = progressOnDate >= goal.targetValue;

      return {
        index: idx,
        label: `Day ${idx + 1}`,
        dayName: weekdayName,
        dayShort,
        dateString,
        calendarDay,
        progress: progressOnDate,
        isCompleted,
        isToday: new Date().toISOString().split('T')[0] === dateString
      };
    });
  }, [goal.logs, goal.targetValue]);

  // Coordinates matching the hand-drawn winding road exactly
  // Frame Coordinate Viewport: 0 0 380 760
  const pathPoints = useMemo(() => {
    return [
      { id: 'start', x: 190, y: 710, label: 'START' },
      { id: 'day1', x: 250, y: 645, label: 'Day 1', index: 0, rotation: -4, labelX: 300, labelY: 650 },
      { id: 'day2', x: 105, y: 530, label: 'Day 2', index: 1, rotation: 6, labelX: 55, labelY: 535 },
      { id: 'day3', x: 235, y: 462, label: 'Day 3', index: 2, rotation: -3, labelX: 285, labelY: 465 },
      { id: 'day4', x: 275, y: 360, label: 'Day 4', index: 3, rotation: 5, labelX: 320, labelY: 365 },
      { id: 'day5', x: 125, y: 252, label: 'Day 5', index: 4, rotation: -6, labelX: 75, labelY: 255 },
      { id: 'day6', x: 265, y: 152, label: 'Day 6', index: 5, rotation: 4, labelX: 310, labelY: 155 },
      { id: 'day7', x: 190, y: 88, label: 'Day 7', index: 6, rotation: -2, labelX: 235, labelY: 82 },
      { id: 'goal', x: 190, y: 45, label: 'GOAL' }
    ];
  }, []);

  // SVG Bezier trail representing S-shaped curved pathway
  const pathD = "M 190,710 C 192,700 235,680 250,645 C 285,595 115,585 105,530 C 90,475 220,490 235,462 C 255,425 295,395 275,360 C 255,320 140,300 125,252 C 105,195 250,190 265,152 C 280,115 190,115 190,88 C 190,75 190,60 190,45";

  // Active theme coordinates color schemes
  const colorBgs: Record<string, string> = {
    emerald: 'bg-emerald-500 fill-emerald-500 border-emerald-500 hover:bg-emerald-600 text-emerald-605',
    indigo: 'bg-indigo-600 fill-indigo-600 border-indigo-600 hover:bg-indigo-700 text-indigo-605',
    rose: 'bg-rose-500 fill-rose-500 border-rose-500 hover:bg-rose-600 text-rose-605',
    amber: 'bg-amber-500 fill-amber-500 border-amber-500 hover:bg-amber-600 text-amber-605',
    violet: 'bg-violet-600 fill-violet-600 border-violet-600 hover:bg-violet-700 text-violet-605',
    sky: 'bg-sky-500 fill-sky-500 border-sky-500 hover:bg-sky-600 text-sky-605'
  };

  const activeColorTheme = colorBgs[goal.color] || colorBgs.indigo;

  // Render quick progress submission
  const handleQuickLogSubmit = (e: React.FormEvent, dateStr: string) => {
    e.preventDefault();
    if (quickLogValue <= 0) return;
    onUpdateProgress(goal.id, quickLogValue, quickNote.trim() || 'Log via Journey Map', dateStr);
    setQuickNote('');
    // Highlight that day completed if it reached completion or updated!
    const updatedDay = weekDays.find(d => d.dateString === dateStr);
    if (updatedDay) {
      updatedDay.progress += quickLogValue;
      if (updatedDay.progress >= goal.targetValue) {
        updatedDay.isCompleted = true;
      }
    }
  };

  const selectedDayData = selectedDayIndex !== null ? weekDays[selectedDayIndex] : null;

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 max-w-4xl mx-auto items-stretch select-none p-1 md:p-3">
      
      {/* LEFT BLOCK: Center Visual Winding Road Map of Journey */}
      <div className="flex-1 frosted-card p-4 sm:p-6 rounded-[32px] bg-white/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 flex flex-col items-center justify-center relative overflow-hidden min-h-[580px] sm:min-h-[780px]">
        
        {/* Playful sketched decoration elements */}
        <div className="absolute top-8 left-6 text-left pointer-events-none opacity-40 dark:opacity-20 animate-pulse-glow">
          <span className="font-handwritten text-lg text-slate-400 block tracking-wide">"Keep climbing,</span>
          <span className="font-handwritten text-base text-slate-450 block ml-4">one sketch at a time!"</span>
        </div>

        <div className="absolute bottom-10 right-6 text-right pointer-events-none opacity-45 dark:opacity-25 md:block hidden">
          <TrendingUp className="w-8 h-8 text-indigo-400/40 rotate-12 ml-auto" />
          <span className="font-handwritten text-xs text-slate-400 block mt-1">Consistency is the pathway</span>
        </div>

        <div className="absolute top-1/2 left-4 text-left pointer-events-none opacity-20 dark:opacity-10">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-spin text-[8px]" />
        </div>

        {/* Outer Winding Road SVG Wrapper */}
        <div className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-[19/38] scale-[0.98] sm:scale-100">
          <svg 
            viewBox="0 0 380 760" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-full h-full overflow-visible"
          >
            {/* SVG Filters for hand-drawn pencil/ink stroke textures */}
            <defs>
              <filter id="handdrawn" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              
              <linearGradient id="roadGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>

              <linearGradient id="roadGradientDark" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#1e293b" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>

            {/* Background Trace Shadow for visual elevation depth */}
            <path 
              d={pathD} 
              stroke="#64748b" 
              strokeWidth="43" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              opacity="0.12" 
              className="dark:stroke-slate-950"
              transform="translate(1, 4.5)"
            />

            {/* ROAD OUTLINES: Multiple translated thin paths representing hand-drawn sketch pencil scratch margins */}
            <path 
              d={pathD} 
              stroke="#475569" 
              strokeWidth="42.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              opacity="0.8" 
              filter="url(#handdrawn)"
              className="stroke-slate-700 dark:stroke-slate-500"
            />
            <path 
              d={pathD} 
              stroke="#334155" 
              strokeWidth="41.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              opacity="0.4" 
              filter="url(#handdrawn)"
              transform="translate(-0.8, -0.6)"
              className="stroke-slate-600 dark:stroke-slate-400"
            />
            <path 
              d={pathD} 
              stroke="#1e293b" 
              strokeWidth="43" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              opacity="0.3" 
              filter="url(#handdrawn)"
              transform="translate(0.6, 0.8)"
              className="stroke-slate-500 dark:stroke-slate-350"
            />

            {/* ROAD INTERIOR FILL TRACT */}
            <path 
              d={pathD} 
              stroke="url(#roadGradient)" 
              strokeWidth="37" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="block dark:hidden"
            />
            <path 
              d={pathD} 
              stroke="url(#roadGradientDark)" 
              strokeWidth="37" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="hidden dark:block"
            />

            {/* CENTER DASHED LANE - handwritten lane divider */}
            <path 
              d={pathD} 
              stroke="#64748b" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
              strokeDasharray="6, 12" 
              opacity="0.55" 
              className="stroke-slate-400 dark:stroke-slate-500"
              filter="url(#handdrawn)"
            />

            {/* Playful sketched decoration lines running along the border edges */}
            <path
              d="M 230,685 C 235,683 245,670 248,655"
              stroke="#94a3b8"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.4"
              className="dark:stroke-slate-600"
              filter="url(#handdrawn)"
            />
            <path
              d="M 125,550 C 115,550 112,540 110,530"
              stroke="#94a3b8"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.4"
              className="dark:stroke-slate-600"
              filter="url(#handdrawn)"
            />

            {/* Decorative Hand-drawn Checkpoint Label Markers Written directly on paper */}
            {pathPoints.map((pt) => {
              if (pt.id === 'start' || pt.id === 'goal') {
                return (
                  <g key={pt.id}>
                    {/* START/GOAL banner text */}
                    <text
                      x={pt.x}
                      y={pt.y + (pt.id === 'start' ? 32 : -18)}
                      textAnchor="middle"
                      className="font-handwritten text-xl font-bold fill-indigo-650 dark:fill-indigo-400 select-none cursor-pointer tracking-widest uppercase"
                      filter="url(#handdrawn)"
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              }

              // Normal day node
              const dayIdx = pt.index !== undefined ? pt.index : 0;
              const dayInfo = weekDays[dayIdx];
              const isComp = dayInfo?.isCompleted;
              const isToday = dayInfo?.isToday;

              return (
                <g key={pt.id} className="cursor-pointer">
                  {/* Label Day written on map beside marker node */}
                  <text
                    x={pt.labelX}
                    y={pt.labelY}
                    textAnchor="middle"
                    transform={`rotate(${pt.rotation}, ${pt.labelX}, ${pt.labelY})`}
                    className={`font-handwritten text-base font-bold transition-all ${
                      isComp 
                        ? 'fill-emerald-650 dark:fill-emerald-400 scale-[1.05]' 
                        : isToday
                          ? 'fill-indigo-600 dark:fill-indigo-305 font-black scale-102'
                          : 'fill-slate-500 dark:fill-slate-400 hover:fill-slate-800'
                    }`}
                    onClick={() => setSelectedDayIndex(dayIdx)}
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Absolute Button Nodes overlaid on top of coordinates */}
          {pathPoints.map((pt) => {
            if (pt.id === 'start') {
              return (
                <div
                  key={pt.id}
                  style={{ left: `${(pt.x / 380) * 100}%`, top: `${(pt.y / 760) * 100}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 p-2 bg-indigo-50 dark:bg-slate-950 border border-indigo-200 dark:border-slate-800 rounded-2xl flex items-center justify-center shadow-3xs hover:scale-105 active:scale-95 transition-all text-[8.5px] font-extrabold tracking-widest text-indigo-650 focus:outline-none select-none px-3"
                >
                  🚩 START
                </div>
              );
            }

            if (pt.id === 'goal') {
              const totalComps = weekDays.filter(d => d.isCompleted).length;
              const completedAll = totalComps === 7;
              
              return (
                <div
                  key={pt.id}
                  style={{ left: `${(pt.x / 380) * 100}%`, top: `${(pt.y / 760) * 100}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-full flex items-center justify-center transition-all ${
                    completedAll
                      ? 'bg-amber-500 text-white shadow-md animate-bounce ring-4 ring-amber-400/20'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-550 border border-slate-200 dark:border-slate-800'
                  }`}
                  title={completedAll ? "Ultimate Weekly Success!" : "Goal Summit"}
                >
                  <Crown className={`w-5 h-5 ${completedAll ? 'fill-white stroke-amber-500 stroke-[2.5]' : ''}`} />
                </div>
              );
            }

            // Checkpoints Days 1-7 overlay markers
            const dayIdx = pt.index !== undefined ? pt.index : 0;
            const dayInfo = weekDays[dayIdx];
            const isComp = dayInfo?.isCompleted;
            const isToday = dayInfo?.isToday;
            const isSelected = selectedDayIndex === dayIdx;
            
            // Marker outer ring to make it feel handwritten sketch
            return (
              <motion.button
                key={pt.id}
                style={{ left: `${(pt.x / 380) * 100}%`, top: `${(pt.y / 760) * 100}%` }}
                onClick={() => setSelectedDayIndex(dayIdx)}
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer shadow-3xs z-20 ${
                  isComp
                    ? 'bg-emerald-500 border-white text-white dark:border-slate-900 shadow-emerald-250/30'
                    : isToday
                      ? 'bg-indigo-600 border-white text-white dark:border-slate-900 shadow-indigo-250/30 ring-4 ring-indigo-500/20'
                      : isSelected
                        ? 'bg-slate-800 dark:bg-slate-100 border-white text-white dark:text-slate-900'
                        : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                }`}
              >
                {isComp ? (
                  <Check className="w-4 h-4 stroke-[3px]" />
                ) : (
                  <span className="text-[10px] font-black">{dayInfo?.calendarDay}</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* RIGHT BLOCK: Selected Day Details or Summary Trail Panel */}
      <div className="w-full md:w-[320px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {selectedDayData ? (
            <motion.div
              key={`day-${selectedDayData.index}`}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="frosted-card p-5 rounded-[32px] bg-white/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 flex-1 flex flex-col justify-between space-y-5 text-left"
            >
              <div>
                {/* Header detail */}
                <div className="flex justify-between items-start border-b border-slate-100/60 dark:border-slate-800/40 pb-3">
                  <div>
                    <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-widest block">Checkpoint Detail</span>
                    <h4 className="text-sm font-black text-slate-850 dark:text-slate-100 mt-1">{selectedDayData.dayName}</h4>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{selectedDayData.dateString}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedDayIndex(null)}
                    className="text-[10.5px] font-bold text-slate-400 hover:text-slate-600 h-6 w-6 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                {/* Status indicators */}
                <div className="space-y-4 mt-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900 rounded-2xl flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                      selectedDayData.isCompleted
                        ? 'bg-emerald-50 text-emerald-650 border-emerald-100 dark:bg-emerald-950/25 dark:text-emerald-400'
                        : 'bg-indigo-50 text-indigo-750 border-indigo-100 dark:bg-indigo-950/25 dark:text-indigo-400'
                    }`}>
                      {selectedDayData.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                    </div>
                    <div>
                      <h5 className="text-[11px] font-extrabold text-slate-700 dark:text-slate-350">
                        {selectedDayData.isCompleted ? 'Goal Fully Completed' : 'Progress Logged'}
                      </h5>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-450 mt-0.5">
                        {selectedDayData.progress} / {goal.targetValue} <span className="text-[9px] text-slate-400">{goal.unit}</span> ({Math.min(100, Math.round((selectedDayData.progress / goal.targetValue) * 100))}% of today's target)
                      </p>
                    </div>
                  </div>

                  {/* Reflection Journal entry linked to this day */}
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Day Checklist Reflection</span>
                    <div className="bg-slate-50/55 dark:bg-slate-950/20 p-3 rounded-2xl border border-dashed border-slate-100 dark:border-slate-850 text-slate-500 dark:text-slate-400 text-[10.5px] italic leading-normal min-h-[52px]">
                      {goal.logs.filter(l => l.date === selectedDayData.dateString && l.note).length > 0 ? (
                        <div className="space-y-1.5">
                          {goal.logs.filter(l => l.date === selectedDayData.dateString && l.note).map((l, i) => (
                            <span key={i} className="block text-slate-705 dark:text-slate-350 bg-white/50 dark:bg-slate-900/40 py-1 px-2 border border-slate-100/50 dark:border-slate-850 rounded-lg">
                              • "{l.note}" (+{l.value} effort)
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span>No reflections penned for this date checkpoint yet. Write one below!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Day increment check-in logging controls */}
              <form 
                onSubmit={(e) => selectedDayData && handleQuickLogSubmit(e, selectedDayData.dateString)}
                className="pt-4 border-t border-slate-100/60 dark:border-slate-850/60 space-y-3"
              >
                <div className="space-y-2">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Quick Check-in Progress</span>
                  
                  <div className="flex items-center justify-between border border-slate-100/70 dark:border-slate-800 rounded-2xl p-1 bg-slate-50/50 dark:bg-slate-950/20">
                    <button
                      type="button"
                      onClick={() => setQuickLogValue(prev => Math.max(1, prev - 1))}
                      className="p-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 shadow-3xs hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-[12px] text-slate-700 dark:text-slate-200">
                      +{quickLogValue} <span className="text-[10px] text-slate-400 font-medium">{goal.unit}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuickLogValue(prev => prev + 1)}
                      className="p-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 shadow-3xs hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Today felt amazing because..."
                      value={quickNote}
                      onChange={(e) => setQuickNote(e.target.value)}
                      maxLength={70}
                      className="w-full text-[10.5px] font-medium leading-none p-3 bg-slate-50/55 dark:bg-slate-950/25 border border-slate-100 dark:border-slate-850 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-55/20 pl-8.5 pr-2 placeholder-slate-400"
                    />
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-2xl text-[11px] font-extrabold text-white transition-all active:scale-[0.98] select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-3xs ${activeColorTheme}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Log Checkpoint Progress</span>
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="no-selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="frosted-card p-5 rounded-[40px] bg-indigo-50/15 dark:bg-indigo-950/10 border border-indigo-50/30 dark:border-indigo-900/30 flex-1 flex flex-col justify-center text-center space-y-4 shadow-3xs min-h-[220px]"
            >
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-3xl w-fit mx-auto shadow-4xs border border-white dark:border-slate-900">
                <Flag className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-center space-y-1.5">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">Habit Pathway Explorer</h4>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                  Select any day checkpoint along the winding path to log checks, track milestones, or write journaling reflections.
                </p>
              </div>

              {/* Weekly progress summary indicators */}
              <div className="pt-2 border-t border-slate-100/60 dark:border-slate-900/55 space-y-2 text-left">
                <span className="text-[9.5px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-wider block">Weekly Goal Accomplishment</span>
                <div className="flex justify-between items-baseline text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Completed:</span>
                  <span>
                    {weekDays.filter(d => d.isCompleted).length} / 7 <span className="text-[10px] text-slate-400">days</span>
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${(weekDays.filter(d => d.isCompleted).length / 7) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
