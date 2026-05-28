import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Flame, 
  BookOpen, 
  PenTool, 
  TrendingUp, 
  Heart,
  ChevronRight,
  Target
} from 'lucide-react';
import { UserProfile, Goal } from '../types';
import { CATEGORIES } from '../sampleData';

interface OnboardingProps {
  onComplete: (profile: UserProfile, initialSelectedGoals: Goal[]) => void;
}

const AVATARS = [
  { emoji: '🦊', label: 'Fox' },
  { emoji: '🐨', label: 'Koala' },
  { emoji: '🐼', label: 'Panda' },
  { emoji: '🐯', label: 'Tiger' },
  { emoji: '🦁', label: 'Lion' },
  { emoji: '🚀', label: 'Rocket' },
  { emoji: '🧠', label: 'Explorer' },
  { emoji: '⚡', label: 'Spark' },
];

const PRESET_GOALS = [
  {
    title: 'Quiet Mindfulness',
    description: 'Pause to breathe. A 10-minute refuge to center your mind.',
    category: 'Mindfulness',
    targetValue: 10,
    unit: 'mins',
    frequency: 'daily',
    color: 'amber',
    icon: 'Sparkles',
  },
  {
    title: 'Daily Hydration',
    description: 'Nourish your body. Fuel your focus and mental energy.',
    category: 'Wellness',
    targetValue: 8,
    unit: 'glasses',
    frequency: 'daily',
    color: 'emerald',
    icon: 'Heart',
  },
  {
    title: 'Nourishing Reading',
    description: 'Feed your intellect. Expand your mind on new horizons.',
    category: 'Learning',
    targetValue: 15,
    unit: 'pages',
    frequency: 'daily',
    color: 'indigo',
    icon: 'BookOpen',
  },
  {
    title: 'Creative Play',
    description: 'Express your ideas. Let your mind explore and design.',
    category: 'Creative',
    targetValue: 20,
    unit: 'mins',
    frequency: 'daily',
    color: 'violet',
    icon: 'PenTool',
  },
  {
    title: 'Vibrant Movement',
    description: 'Honor your physical strength. Breathe deep and build power.',
    category: 'Fitness',
    targetValue: 4,
    unit: 'km',
    frequency: 'daily',
    color: 'rose',
    icon: 'Flame',
  },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦊');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPresets, setSelectedPresets] = useState<number[]>([1, 2, 3]); // default selected presets: Wellness, Learning, Creative

  const toggleCategory = (catName: string) => {
    setSelectedCategories(prev => 
      prev.includes(catName) 
        ? prev.filter(c => c !== catName) 
        : [...prev, catName]
    );
  };

  const togglePreset = (idx: number) => {
    setSelectedPresets(prev => 
      prev.includes(idx) 
        ? prev.filter(i => i !== idx) 
        : [...prev, idx]
    );
  };

  const currentDay = new Date().toISOString().split('T')[0];

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (!name.trim()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      // Create user profile & selected goals
      const profile: UserProfile = {
        name: name.trim(),
        avatarSeed: selectedAvatar,
        joinedAt: currentDay,
        isOnboarded: true,
        stats: {
          globalStreak: 0,
          streakHistory: []
        }
      };

      // Map selected presets into correct Goal models
      const initialGoals: Goal[] = selectedPresets.map((idx, index) => {
        const preset = PRESET_GOALS[idx];
        return {
          id: `goal-init-${index}-${Date.now()}`,
          title: preset.title,
          description: preset.description,
          category: preset.category,
          targetValue: preset.targetValue,
          currentValue: 0, // starts at 0
          unit: preset.unit,
          frequency: preset.frequency as any,
          streak: 0,
          createdAt: currentDay,
          color: preset.color,
          icon: preset.icon,
          logs: []
        };
      });

      onComplete(profile, initialGoals);
    }
  };

  const renderWelcome = () => (
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center justify-between h-full pt-12 pb-6 px-6"
    >
      <div className="flex flex-col items-center">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-indigo-500 rounded-3xl blur-xl opacity-30 animate-pulse-glow" />
          <div className="relative bg-gradient-to-br from-indigo-500 to-violet-600 p-5 rounded-3xl shadow-xl border border-indigo-200">
            <Target className="w-12 h-12 text-white animate-bounce-short" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
          Tracktion
        </h1>
        <p className="text-indigo-600 font-medium text-sm mb-6 uppercase tracking-widest">
          A Practice of Self-Discipline
        </p>

        <p className="text-slate-600 max-w-sm text-base leading-relaxed mb-6">
          Consistency is a quiet, deliberate habit. Build your momentum, focus on daily practices, and honor your inner commitments with elegant design.
        </p>

        {/* Dynamic highlights */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-left">
          <div className="p-3 rounded-2xl frosted-card shadow-sm">
            <Flame className="w-5 h-5 text-orange-500 mb-1" />
            <h4 className="text-xs font-bold text-slate-800">Streak Engine</h4>
            <p className="text-[10px] text-slate-500">Safeguard your momentum</p>
          </div>
          <div className="p-3 rounded-2xl frosted-card shadow-sm">
            <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
            <h4 className="text-xs font-bold text-slate-800">Progress Track</h4>
            <p className="text-[10px] text-slate-500">Celebrate tiny milestones</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs mt-8">
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:bg-slate-800 transition-all duration-200 group active:scale-[0.98]"
        >
          Set Your Intentions
          <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-center text-xs text-slate-400 mt-3 font-medium">Takes less than 1 minute</p>
      </div>
    </motion.div>
  );

  const renderProfileSetup = () => (
    <motion.div
      key="profile"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col justify-between h-full pt-8 pb-6 px-6"
    >
      <div>
        <div className="flex gap-1.5 mb-6">
          <div className="h-1.5 w-1/3 bg-indigo-600 rounded-full" />
          <div className="h-1.5 w-1/3 bg-slate-200 rounded-full" />
          <div className="h-1.5 w-1/3 bg-slate-200 rounded-full" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">Who is embarking on this path?</h2>
        <p className="text-sm text-slate-500 mb-6">Let's personalize your consistency dashboard.</p>

        {/* Form elements */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              What should we call you?
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name or nickname"
              className="w-full frosted-input rounded-2xl py-3.5 px-4 text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Select Your Visual Symbol
            </label>
            <div className="grid grid-cols-4 gap-3 bg-slate-100/30 backdrop-blur-xs p-3 rounded-3xl border border-white/50">
              {AVATARS.map((av) => (
                <button
                  key={av.emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(av.emoji)}
                  className={`flex items-center justify-center text-3xl p-3 h-14 rounded-2xl transition-all ${
                    selectedAvatar === av.emoji
                      ? 'bg-indigo-600 text-white shadow-md scale-105 border border-indigo-400'
                      : 'frosted-button-secondary text-slate-800'
                  }`}
                >
                  {av.emoji}
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">
              Your chosen symbol <span className="font-semibold text-slate-700">{selectedAvatar}</span> will represent you on your daily track.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleNext}
          disabled={!name.trim()}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 group active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Let's Set Focus
          <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );

  const renderCategorySetup = () => (
    <motion.div
      key="categories"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col justify-between h-full pt-8 pb-6 px-6"
    >
      <div>
        <div className="flex gap-1.5 mb-6">
          <div className="h-1.5 w-1/3 bg-indigo-600 rounded-full" />
          <div className="h-1.5 w-1/3 bg-indigo-600 rounded-full" />
          <div className="h-1.5 w-1/3 bg-slate-200 rounded-full" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">Choose Your Pillars of Discipline</h2>
        <p className="text-sm text-slate-500 mb-6">Which areas of your life want to nurture with steady consistency?</p>

        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat.name);
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => toggleCategory(cat.name)}
                className={`relative flex flex-col p-4 text-left rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-50/20'
                    : 'border-white/50 frosted-card hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-xl border w-fit mb-3 ${cat.bgClass}`}>
                  <Flame className="w-5 h-5" /> {/* Keep it simple, just generic look or Lucide icon */}
                </div>
                <h4 className="text-sm font-semibold text-slate-900">{cat.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Focus tracking</p>
                {isSelected && (
                  <span className="absolute top-3 right-3 bg-indigo-600 text-white rounded-full p-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 group active:scale-[0.98]"
        >
          Nurture Foundational Habits
          <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );

  const renderPresetsSetup = () => (
    <motion.div
      key="presets"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col justify-between h-full pt-8 pb-6 px-6"
    >
      <div>
        <div className="flex gap-1.5 mb-6">
          <div className="h-1.5 w-1/3 bg-indigo-600 rounded-full" />
          <div className="h-1.5 w-1/3 bg-indigo-600 rounded-full" />
          <div className="h-1.5 w-1/3 bg-indigo-600 /10 bg-indigo-600 rounded-full" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">Foundational Practices</h2>
        <p className="text-sm text-slate-500 mb-6">Select a few gentle starter practices to kindle your daily momentum.</p>

        <div className="space-y-3">
          {PRESET_GOALS.map((preset, idx) => {
            const isSelected = selectedPresets.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => togglePreset(idx)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/10'
                    : 'border-white/55 frosted-card hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700`}>
                    <Target className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{preset.title}</h4>
                    <span className="inline-block text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-md mt-0.5">
                      {preset.targetValue} {preset.unit} / {preset.frequency}
                    </span>
                  </div>
                </div>

                <div className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${
                  isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-white/60 bg-white/40 fallback-border'
                }`}>
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 hover:opacity-95 active:scale-[0.98]"
        >
          Embrace My Path
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-full bg-transparent overflow-y-auto no-scrollbar relative z-10">
      <AnimatePresence mode="wait">
        {step === 0 && renderWelcome()}
        {step === 1 && renderProfileSetup()}
        {step === 2 && renderCategorySetup()}
        {step === 3 && renderPresetsSetup()}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
