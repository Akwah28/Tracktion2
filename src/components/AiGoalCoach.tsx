import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Plus, 
  Calendar, 
  Trophy, 
  Target, 
  HelpCircle, 
  Save, 
  Edit3, 
  CheckCircle2, 
  BookOpen, 
  Flame, 
  Zap, 
  AlertCircle, 
  ArrowRight,
  ArrowLeft,
  Settings,
  X,
  Smile,
  Info,
  ChevronRight
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Goal, GoalTask, UserProfile } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface AiGoalCoachProps {
  user: any;
  profile: UserProfile | null;
  onGoalCreated: (goal: Goal) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: Date;
}

interface DecomposedPlan {
  normalizedObjective: string;
  description: string;
  category: string;
  targetValue: number;
  unit: string;
  frequency: 'daily' | 'weekly';
  isRecurring: boolean;
  recurringDays: string[];
  color: string;
  icon: string;
  tasks: Array<{
    title: string;
    dayIndex: number;
    value: number;
  }>;
}

export const AiGoalCoach: React.FC<AiGoalCoachProps> = ({ user, profile, onGoalCreated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState('');
  const [decomposedPlan, setDecomposedPlan] = useState<DecomposedPlan | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  // Advanced Interactive customizer inputs
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customCategory, setCustomCategory] = useState('Wellness');
  const [customTargetValue, setCustomTargetValue] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState('mins');
  const [customColor, setCustomColor] = useState('indigo');
  const [customIcon, setCustomIcon] = useState('Target');
  const [customIsRecurring, setCustomIsRecurring] = useState(true);
  const [customRecurringDays, setCustomRecurringDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [customTasks, setCustomTasks] = useState<Array<{ title: string; dayIndex: number; value: number }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Standard preset helper triggers
  const PRESET_PROMPTS = [
    { label: "🧘 Meditate Daily", text: "I want to start meditiatng daily but keep forgetting or getting distracted." },
    { label: "💻 Learn Coding", text: "Learn Python or web development in my spare hours." },
    { label: "📖 Finish Book", text: "Read more books instead of scrolling my phone before sleeping." },
    { label: "🏃 Get in Shape", text: "I need to exercise regularly but I hate boring gym sessions." }
  ];

  // Helper status logs for streaming thoughts effect
  const THINKING_STEPS = [
    "Receiving raw casual thoughts...",
    "Scanning consistency patterns...",
    "Simplifying milestone thresholds...",
    "Normalizing title parameters...",
    "Decomposing into micro-habits...",
    "Structuring S-shape daily checkpoints...",
    "Winding together victory trail!"
  ];

  // Initial welcome message from Coach Tracky
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'coach',
          text: `Hey there, ${profile?.name || 'Achiever'}! 👋 I am Tracky, your AI Goal Coach.\n\nTell me an aspiration you have in natural language. Spill out messy scribbles, casual intentions, or broad goals like "get strong" or "learn python."\n\nI will ask clarifying questions if vague, refine your objective, and decompose it into the smallest possible, high-momentum tasks along a beautifully-crafted 7-day Success Trail!`,
          timestamp: new Date()
        }
      ]);
    }
  }, [profile, messages.length]);

  // Scroll to new chat elements smoothly
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing, analyzingStep]);

  // Synchronize state when a new plan is ready
  useEffect(() => {
    if (decomposedPlan) {
      setCustomTitle(decomposedPlan.normalizedObjective);
      setCustomDescription(decomposedPlan.description);
      setCustomCategory(decomposedPlan.category);
      setCustomTargetValue(decomposedPlan.targetValue);
      setCustomUnit(decomposedPlan.unit);
      setCustomColor(decomposedPlan.color);
      setCustomIcon(decomposedPlan.icon);
      setCustomIsRecurring(decomposedPlan.isRecurring);
      setCustomRecurringDays(decomposedPlan.recurringDays && decomposedPlan.recurringDays.length > 0 ? decomposedPlan.recurringDays : ['Mon', 'Wed', 'Fri']);
      setCustomTasks([...decomposedPlan.tasks]);
    }
  }, [decomposedPlan]);

  // Handle preset bubble triggers
  const handlePresetSelect = (text: string) => {
    setInputMessage(text);
  };

  // Submit actual user prompts and negotiate plans
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAnalyzing) return;

    setErrorText(null);
    const userWords = inputMessage;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userWords,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsAnalyzing(true);

    // Simulate stepping through thoughts for visual delight and reassurance
    let currentStep = 0;
    setAnalyzingStep(THINKING_STEPS[currentStep]);
    const stepTimer = setInterval(() => {
      if (currentStep < THINKING_STEPS.length - 1) {
        currentStep++;
        setAnalyzingStep(THINKING_STEPS[currentStep]);
      }
    }, 750);

    // Prepare message structures
    const chatHistory = messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      text: m.text
    }));

    try {
      const response = await fetch("/api/coach/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userWords,
          history: chatHistory
        })
      });

      clearInterval(stepTimer);

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "An error occurred with the decomposition server.");
      }

      const rawPlan = await response.json();

      if (rawPlan.needsClarification) {
        // Coach replies with follow up clarification question
        setMessages(prev => [...prev, {
          id: `coach-${Date.now()}`,
          sender: 'coach',
          text: rawPlan.followupQuestion || "I need a bit more info. What specific milestones are you hoping to track with this goal?",
          timestamp: new Date()
        }]);
      } else if (rawPlan.goalPlan) {
        // Coach delivers the decomposed success plan schema!
        setDecomposedPlan(rawPlan.goalPlan);
        setMessages(prev => [...prev, {
          id: `coach-${Date.now()}`,
          sender: 'coach',
          text: `🎉 Awesome! I have untangled your messy goal and synthesized a pristine 7-Day Action Plan for you!\n\nTake a look at the live preview below, tweak any parameters or daily steps you wish, and engage your roadmap directly!`,
          timestamp: new Date()
        }]);
      } else {
        throw new Error("Undefinable parsing structure returned from AI Assistant.");
      }
    } catch (err: any) {
      clearInterval(stepTimer);
      setErrorText(err.message || "Something went wrong. Please check your network and make sure keys are active.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Dispatch fully confirmed customized goals + micro task templates to Firestore database records
  const handleSavePlan = async () => {
    if (!user) return;
    setIsSaving(true);
    setErrorText(null);

    try {
      const goalId = `goal-ai-${Date.now()}`;
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Compose the final Goal entity
      const ultimateGoal: Goal = {
        id: goalId,
        title: customTitle.trim(),
        description: customDescription.trim(),
        category: customCategory,
        targetValue: Number(customTargetValue) || 1,
        currentValue: 0,
        unit: customUnit.trim() || 'mins',
        frequency: 'daily',
        streak: 0,
        createdAt: todayStr,
        color: customColor,
        icon: customIcon,
        isRecurring: customIsRecurring,
        recurringDays: customIsRecurring ? customRecurringDays : undefined,
        scheduledDate: customIsRecurring ? undefined : todayStr,
        logs: []
      };

      // 2. Map tasks to specific dates based on day index (Day 1 -> Today, Day 2 -> Tomorrow...)
      const mappedTasks: GoalTask[] = customTasks.map((t, idx) => {
        const offsetDate = new Date();
        offsetDate.setDate(offsetDate.getDate() + t.dayIndex);
        const calcDateStr = offsetDate.toISOString().split('T')[0];

        return {
          id: `task-ai-${Date.now()}-${idx}`,
          goalId: goalId,
          title: t.title.trim(),
          completed: false,
          value: t.value || 1,
          date: calcDateStr,
          createdAt: new Date().toISOString()
        };
      });

      // 3. Write Goal to Firestore
      await setDoc(doc(db, 'users', user.uid, 'goals', goalId), ultimateGoal);

      // 4. Write all 7 helper chronological steps to Firestore
      for (const t of mappedTasks) {
        await setDoc(doc(db, 'users', user.uid, 'tasks', t.id), t);
      }

      setHasSaved(true);
      
      // Delay to show confirmation animation then trigger callback on App.tsx to select the goal
      setTimeout(() => {
        onGoalCreated(ultimateGoal);
      }, 1500);

    } catch (err: any) {
      console.error("Failed to commit final plan to database:", err);
      setErrorText(err.message || "An error occurred writing plan nodes to database.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset the active coach layout to start a new chat
  const handleResetCoach = () => {
    setDecomposedPlan(null);
    setMessages([
      {
        id: 'new-welcome',
        sender: 'coach',
        text: `Welcome back to the drawing board! ✏️ Tell me another goal expression in messy language.\n\nLet's slice it down to size!`,
        timestamp: new Date()
      }
    ]);
    setErrorText(null);
    setHasSaved(false);
  };

  // Active theme coordinates color schemes
  const colorBgs: Record<string, string> = {
    emerald: 'bg-emerald-500 fill-emerald-500 border-emerald-500 hover:bg-emerald-600 text-emerald-600 dark:bg-emerald-600',
    indigo: 'bg-indigo-600 fill-indigo-600 border-indigo-600 hover:bg-indigo-700 text-indigo-600 dark:bg-indigo-700',
    rose: 'bg-rose-500 fill-rose-500 border-rose-500 hover:bg-rose-600 text-rose-600 dark:bg-rose-600',
    amber: 'bg-amber-500 fill-amber-500 border-amber-500 hover:bg-amber-600 text-amber-600 dark:bg-amber-600',
    violet: 'bg-violet-600 fill-violet-600 border-violet-600 hover:bg-violet-700 text-violet-600 dark:bg-violet-700',
    sky: 'bg-sky-500 fill-sky-500 border-sky-500 hover:bg-sky-600 text-sky-600 dark:bg-sky-600'
  };

  const activeColorTheme = colorBgs[customColor] || colorBgs.indigo;

  // Toggle days of the week for recurring plans
  const handleToggleDay = (day: string) => {
    if (customRecurringDays.includes(day)) {
      if (customRecurringDays.length > 1) {
        setCustomRecurringDays(prev => prev.filter(d => d !== day));
      }
    } else {
      setCustomRecurringDays(prev => [...prev, day].sort((a,b) => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.indexOf(a) - days.indexOf(b);
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
      
      {/* Banner introduction with dynamic badge design */}
      <div className="w-full text-left pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center px-1">
        <div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-widest block">Goal Catalyst Engine</span>
          <h2 className="text-xl font-black text-slate-850 dark:text-slate-100 flex items-center gap-1.5 leading-tight">
            <Brain className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span>AI Goal Coach</span>
          </h2>
          <p className="text-[11px] text-slate-400 tracking-wide mt-0.5">Translate casual language goals into bulletproof daily action success pathways</p>
        </div>
        
        {decomposedPlan && (
          <button 
            onClick={handleResetCoach}
            className="flex items-center gap-1 py-1.5 px-3 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl text-[10.5px] font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-200 transition-all cursor-pointer shadow-3xs active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        )}
      </div>

      <div className="w-full flex flex-col gap-6 mt-6 items-stretch select-none">
        <AnimatePresence mode="wait">
          {!decomposedPlan ? (
            
            // CHAT DIALOG WORKSPACE VIEW
            <motion.div 
              key="chat-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full flex flex-col md:flex-row gap-6 min-h-[500px]"
            >
              
              {/* Left Chat Window */}
              <div className="flex-1 frosted-card bg-white/75 dark:bg-slate-930/60 border border-slate-150 dark:border-slate-850 rounded-[32px] flex flex-col overflow-hidden shadow-2xs">
                
                {/* Chat header identity box */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-850/60 bg-gradient-to-r from-indigo-50/20 to-indigo-100/5 dark:from-indigo-950/20 flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-55/10 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-405 border border-indigo-100/40 rounded-full">
                    <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-105">Coach Tracky</h4>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold tracking-widest uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                      <span>Decomposition Online</span>
                    </span>
                  </div>
                </div>

                {/* Dialog Streams */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-h-[420px] min-h-[300px] text-left no-scrollbar">
                  {messages.map((m) => (
                    <div 
                      key={m.id} 
                      className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[85%] rounded-[24px] px-4 py-3 text-xs leading-normal font-medium shadow-4xs ${
                          m.sender === 'user'
                            ? 'bg-slate-900 border border-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:border-slate-200 font-semibold'
                            : 'bg-slate-50 border border-slate-150/70 text-slate-750 dark:bg-slate-900/45 dark:border-slate-800 dark:text-slate-300'
                        } whitespace-pre-line`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}

                  {/* Thinking/loading stream layout */}
                  {isAnalyzing && (
                    <div className="flex justify-start">
                      <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-150/40 dark:border-slate-850 rounded-[24px] p-4 max-w-[80%] flex items-center gap-3">
                        <div className="flex space-x-1.5 items-center justify-center">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[10.5px] font-black text-indigo-605 dark:text-indigo-400 font-handwritten italic tracking-wider">
                          {analyzingStep}
                        </span>
                      </div>
                    </div>
                  )}

                  {errorText && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-655 dark:bg-rose-950/25 dark:border-rose-900 rounded-2xl flex items-start gap-2.5 text-[11px] leading-relaxed">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold block">Decomposition Stalled</span>
                        <span>{errorText}</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Submitting Interface Form */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-900/10 flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="e.g. read 10 pages before sleep, study java daily..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isAnalyzing}
                    maxLength={180}
                    className="flex-1 text-xs leading-none p-3.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-55/20 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isAnalyzing}
                    className="p-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl shadow-3xs hover:bg-slate-850 active:scale-95 transition-all select-none disabled:opacity-35 disabled:scale-100 cursor-pointer flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Right Presets & Tips Bar */}
              <div className="w-full md:w-[260px] flex flex-col justify-between gap-5 text-left">
                <div className="frosted-card p-5 bg-white/70 dark:bg-slate-930/60 border border-slate-150 dark:border-slate-850 rounded-[30px] flex-1">
                  <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-550" />
                    <span>Preset Messy Concepts</span>
                  </h4>
                  <div className="space-y-2 mt-3.5">
                    {PRESET_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePresetSelect(p.text)}
                        className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50/40 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-150/55 dark:border-slate-805 rounded-xl text-[10.5px] font-bold text-slate-700 dark:text-slate-300 text-left cursor-pointer transition-all active:scale-[0.98] block"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] leading-none">{p.label}</span>
                          <ChevronRight className="w-3 h-3 text-slate-405 ml-auto" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="frosted-card p-4.5 bg-indigo-50/15 dark:bg-indigo-950/10 border border-indigo-50/30 dark:border-indigo-900/30 rounded-[30px] space-y-2">
                  <div className="flex items-center gap-2">
                    <Smile className="w-5 h-5 text-indigo-550 dark:text-indigo-400" />
                    <h5 className="text-[11px] font-extrabold text-slate-850 dark:text-slate-205">How to chat?</h5>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Tracky works best when you share casual goals. Feel free to use abbreviations, sloppy spelling, and basic durations, like <span className="text-indigo-605 font-semibold">"code daily at 8pm for 20m"</span>!
                  </p>
                </div>
              </div>

            </motion.div>
          ) : (
            
            // DUAL-COLUMN LIVE DECOMPOSED BLUEPRINT PREVIEW & CUSTOMIZER
            <motion.div
              key="blueprint-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full flex flex-col lg:flex-row gap-6 items-stretch"
            >
              
              {/* Left Column: Interactive Settings Tweak Board */}
              <div className="flex-[5] frosted-card p-5 sm:p-6 bg-white/80 dark:bg-slate-930/80 border border-slate-150 dark:border-slate-850 rounded-[32px] text-left space-y-5">
                
                {/* Board Heading */}
                <div className="pb-3 border-b border-slate-100 dark:border-slate-850/70 flex justify-between items-center">
                  <div>
                    <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                      <Settings className="w-3.5 h-3.5 text-indigo-505" />
                      <span>Blueprint Customizer</span>
                    </span>
                    <h3 className="text-base font-black text-slate-850 dark:text-slate-100 mt-1">Refine Goal Parameters</h3>
                  </div>
                </div>

                {/* Form Fields split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Goal Title */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Objective Title</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      maxLength={40}
                      className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  {/* Category select */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Core Category</label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      {['Wellness', 'Learning', 'Productivity', 'Fitness', 'Work', 'Creative', 'Health', 'Others'].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Daily Target Volume */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Daily Target Volume</label>
                    <input
                      type="number"
                      value={customTargetValue}
                      onChange={(e) => setCustomTargetValue(Math.max(1, Number(e.target.value)))}
                      min={1}
                      className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  {/* Measuring Unit */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Measuring Unit</label>
                    <input
                      type="text"
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      maxLength={12}
                      placeholder="mins, pages, tasks, cups"
                      className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  {/* Skin Palette */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Aesthetic Color Palette</label>
                    <div className="flex gap-2.5 pt-1">
                      {['indigo', 'emerald', 'rose', 'amber', 'violet', 'sky'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setCustomColor(color)}
                          className={`h-7 w-7 rounded-lg border-2 transition-all cursor-pointer ${
                            color === 'indigo' ? 'bg-indigo-500' :
                            color === 'emerald' ? 'bg-emerald-500' :
                            color === 'rose' ? 'bg-rose-500' :
                            color === 'amber' ? 'bg-amber-500' :
                            color === 'violet' ? 'bg-violet-500' : 'bg-sky-500'
                          } ${customColor === color ? 'border-indigo-650 ring-2 ring-indigo-500/15 scale-110' : 'border-transparent'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Shape Icon selection */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Badge Graphic Icon</label>
                    <div className="grid grid-cols-6 gap-2 pt-1">
                      {['Heart', 'Trophy', 'BookOpen', 'Target', 'Calendar', 'Sparkles', 'Flame', 'CheckCircle2', 'Apple', 'Briefcase', 'GraduationCap', 'Code'].map((icName) => (
                        <button
                          key={icName}
                          type="button"
                          onClick={() => setCustomIcon(icName)}
                          className={`p-2 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                            customIcon === icName 
                              ? 'bg-slate-900 border-transparent text-white dark:bg-slate-100 dark:text-slate-900' 
                              : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-900 dark:border-slate-800 hover:text-slate-800'
                          }`}
                        >
                          <DynamicIcon name={icName} size={15} />
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Description Text */}
                <div className="space-y-1">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Motivational description</label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    maxLength={100}
                    rows={2}
                    className="w-full text-xs font-semibold p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Recurrence Setup */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-850/60 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <h5 className="text-[11px] font-black text-slate-755 dark:text-slate-200">Recurring Pattern</h5>
                    <p className="text-[9.5px] text-slate-405 mt-0.5">Toggle weekly frequency days</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={customIsRecurring} 
                        onChange={(e) => setCustomIsRecurring(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-650 peer-checked:bg-indigo-600"></div>
                      <span className="ml-2 text-xs font-bold text-slate-600 dark:text-slate-400 select-none">Weekly Habit</span>
                    </label>
                  </div>
                </div>

                {/* Week Day Labels selector */}
                {customIsRecurring && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-50 dark:border-slate-850/30">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const isActive = customRecurringDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDay(day)}
                          className={`py-1.5 px-3 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${
                            isActive
                              ? `${activeColorTheme} text-white shadow-3xs`
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-500 border border-transparent hover:border-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>

              {/* Right Column: Goal Blueprint Visual Card & Milestone Checklist preview */}
              <div className="flex-[4] flex flex-col gap-6 justify-between text-left">
                
                {/* 7-DAY MILESTONE ROADMAP PREVIEW LIST */}
                <div className="frosted-card p-5 bg-white/70 dark:bg-slate-930/60 border border-slate-150 dark:border-slate-850 rounded-[32px] flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9.5px] text-indigo-650 dark:text-indigo-400 font-extrabold uppercase tracking-widest block mb-4">
                      7-Day Victory Trail Checklist
                    </span>
                    
                    {/* Render exact customTasks list */}
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 no-scrollbar text-xs">
                      {customTasks.map((t, idx) => (
                        <div 
                          key={idx}
                          className="flex gap-3.5 items-center p-2.5 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850"
                        >
                          {/* Circle check for day indicator */}
                          <div className={`h-6 w-6 rounded-full border flex-shrink-0 flex items-center justify-center text-[10px] font-black ${
                            idx === 0 
                              ? 'bg-amber-500 stroke-2 border-white text-white font-extrabold ring-4 ring-amber-500/20' 
                              : 'bg-white dark:bg-slate-950 text-slate-500 border-slate-205 dark:border-slate-800'
                          }`}>
                            {idx === 0 ? <Zap className="w-3.5 h-3.5 text-white fill-white" /> : idx + 1}
                          </div>

                          {/* Editable task title */}
                          <div className="flex-1 text-left min-w-0">
                            {idx === 0 && (
                              <span className="text-[8px] font-black text-amber-600 block leading-tight tracking-widest uppercase mb-0.5">🚀 Achievable First Step</span>
                            )}
                            <input
                              type="text"
                              value={t.title}
                              onChange={(e) => {
                                const list = [...customTasks];
                                list[idx].title = e.target.value;
                                setCustomTasks(list);
                              }}
                              maxLength={50}
                              className="w-full bg-transparent font-semibold text-slate-750 dark:text-slate-150 border-b border-transparent hover:border-slate-100 focus:border-indigo-400 focus:outline-none p-0 inline block"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational Controls Box for saving checklist */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-850/60 mt-4 space-y-3">
                    {errorText && (
                      <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 text-[11px] font-medium rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errorText}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleResetCoach}
                        disabled={isSaving}
                        className="py-3 px-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 text-xs font-bold rounded-2xl cursor-pointer hover:bg-slate-200 hover:text-slate-800 transition-all select-none flex-1 active:scale-95"
                      >
                        Cancel Plan
                      </button>

                      <button
                        type="button"
                        onClick={handleSavePlan}
                        disabled={isSaving || hasSaved || customTitle.trim() === ""}
                        className={`py-3 px-5 text-white text-xs font-black rounded-2xl cursor-pointer transition-all select-none flex-[2] flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-3xs ${activeColorTheme} disabled:opacity-50`}
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Aligning Nodes...</span>
                          </>
                        ) : hasSaved ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Engaged!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Engage 7-Day Plan</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>

                {/* VISUAL CARDS PREVIEW EMBED */}
                <div className={`p-4.5 rounded-[30px] border border-white/40 shadow-xs relative overflow-hidden transition-all duration-300 ${
                  customColor === 'indigo' ? 'bg-indigo-65/30 hover:bg-indigo-65/40 dark:bg-indigo-950/20' :
                  customColor === 'emerald' ? 'bg-emerald-50/20 hover:bg-emerald-50/30 dark:bg-emerald-950/20' :
                  customColor === 'rose' ? 'bg-rose-50/20 hover:bg-rose-50/30 dark:bg-rose-950/20' :
                  customColor === 'amber' ? 'bg-amber-50/20 hover:bg-amber-50/30 dark:bg-amber-950/20' :
                  customColor === 'violet' ? 'bg-violet-65/25 hover:bg-violet-65/35 dark:bg-violet-950/20' :
                  'bg-sky-50/20 hover:bg-sky-50/30 dark:bg-sky-950/20'
                }`}>
                  <div className="flex gap-3.5">
                    {/* Visual Badge Icon design */}
                    <div className={`p-3 rounded-2xl border aspect-square h-fit ${
                      customColor === 'indigo' ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-900/40 dark:text-indigo-400' :
                      customColor === 'emerald' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:border-emerald-900/40 dark:text-emerald-400' :
                      customColor === 'rose' ? 'bg-rose-55 border-rose-100 text-rose-600 dark:bg-rose-950/50 dark:border-rose-900/40 dark:text-rose-400' :
                      customColor === 'amber' ? 'bg-amber-55 border-amber-100 text-amber-600 dark:bg-amber-950/50 dark:border-amber-900/40 dark:text-amber-400' :
                      customColor === 'violet' ? 'bg-violet-50 border-violet-100 text-violet-605 dark:bg-violet-950/50 dark:border-violet-900/40 dark:text-violet-400' :
                      'bg-sky-55 border-sky-100 text-sky-600 dark:bg-sky-950/50 dark:border-sky-900/40 dark:text-sky-450'
                    }`}>
                      <DynamicIcon name={customIcon} className="w-5 h-5 focus:outline-none" />
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <span className={`text-[8.5px] font-extrabold uppercase tracking-widest border px-2 py-0.5 rounded-full ${
                          customColor === 'indigo' ? 'border-indigo-100 text-indigo-650 bg-indigo-50/50 dark:border-indigo-900/30 dark:text-indigo-400 dark:bg-indigo-950/30' :
                          customColor === 'emerald' ? 'border-emerald-100 text-emerald-650 bg-emerald-50/50 dark:border-emerald-900/30 dark:text-emerald-400 dark:bg-emerald-950/30' :
                          customColor === 'rose' ? 'border-rose-100 text-rose-655 bg-rose-50/50 dark:border-rose-900/30 dark:text-rose-400 dark:bg-rose-950/30' :
                          customColor === 'amber' ? 'border-amber-100 text-amber-655 bg-amber-50/50 dark:border-amber-900/30 dark:text-amber-400 dark:bg-amber-950/30' :
                          customColor === 'violet' ? 'border-violet-100 text-violet-750 bg-violet-65/45 dark:border-violet-900/30 dark:text-violet-400 dark:bg-violet-950/30' :
                          'border-sky-100 text-sky-655 bg-sky-50/50 dark:border-sky-900/30 dark:text-sky-400 dark:bg-sky-950/30'
                        }`}>
                          {customCategory}
                        </span>
                        
                        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500">
                          {customIsRecurring ? "Recurring Weekly" : "One-Time Trail"}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-855 dark:text-slate-100 mt-2 truncate leading-snug">
                        {customTitle || "Untitled Coach Plan"}
                      </h4>
                      
                      <p className="text-[10.5px] text-slate-450 dark:text-slate-400 line-clamp-1 mt-0.5 leading-normal">
                        {customDescription || "No personalized description template generated."}
                      </p>

                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-105/10 dark:border-slate-850/40">
                        <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                          Target: <span className="text-slate-750 dark:text-slate-200 font-black">{customTargetValue} {customUnit}</span> / day
                        </span>
                        
                        <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 bg-indigo-50/55 dark:bg-indigo-950/30 px-2 py-0.5 rounded-lg border border-indigo-100/30 dark:border-indigo-900/10">
                          <Zap className="w-3 h-3 fill-indigo-600 dark:fill-indigo-400" />
                          <span>AI Synthesized</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
