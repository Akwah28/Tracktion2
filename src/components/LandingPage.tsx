import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Target, 
  Trophy, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  ChevronRight, 
  Check, 
  Smartphone, 
  Compass, 
  Star, 
  Layout, 
  Timer, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { TracktionLogo } from './TracktionLogo';
// @ts-ignore
import tracktionGraphic from '../assets/images/tracktion_hero_graphic_1779872209215.png';

interface LandingPageProps {
  onLaunchApp: () => void;
  onDemoPreview: () => void;
  isLoggedIn?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onDemoPreview, isLoggedIn = false }) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Interactive Simulator/Sandbox States
  const [simulatorCompleted, setSimulatorCompleted] = useState(false);
  const [simulatorTasks, setSimulatorTasks] = useState([
    { id: 1, title: 'Gym Cardio Session', category: 'fitness', color: 'emerald', completed: true },
    { id: 2, title: 'Read 10 Pages of Philosophy', category: 'mindset', color: 'indigo', completed: true },
    { id: 3, title: 'Slay 2 hours of Deep Coding', category: 'career', color: 'amber', completed: false }
  ]);
  const [simulatorStreak, setSimulatorStreak] = useState(14);
  const [showConfetti, setShowConfetti] = useState(false);

  const toggleSimulatorTask = (id: number) => {
    setSimulatorTasks(prev => 
      prev.map(task => {
        if (task.id === id) {
          const newStatus = !task.completed;
          if (newStatus && id === 3) {
            // Fired final task completion
            setSimulatorStreak(p => p + 1);
            setSimulatorCompleted(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          } else if (!newStatus && id === 3) {
            setSimulatorStreak(p => p - 1);
            setSimulatorCompleted(false);
          }
          return { ...task, completed: newStatus };
        }
        return task;
      })
    );
  };

  const completedCount = simulatorTasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / simulatorTasks.length) * 100);

  // Smooth scroll links
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative overflow-x-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background radial gradients for ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-indigo-50/70 via-slate-50 to-transparent pointer-events-none z-0" />
      <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-2/3 left-[-15%] w-[600px] h-[600px] bg-teal-100/20 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Modern Sticky Header */}
      <header className="sticky top-0 z-50 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/40 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <TracktionLogo size={36} className="hover:rotate-6 transition-transform hover:scale-105 duration-200" />
            <span className="text-lg font-black tracking-tight text-slate-900 uppercase">
              Tracktion
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-bold text-slate-600">
            <button onClick={() => scrollToSection('features')} className="hover:text-indigo-600 transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('sandbox')} className="hover:text-indigo-600 transition-colors cursor-pointer">Interactive Demo</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-indigo-600 transition-colors cursor-pointer">Pricing</button>
            <button onClick={() => scrollToSection('testimonials')} className="hover:text-indigo-600 transition-colors cursor-pointer">Testimonials</button>
          </nav>

          {/* Header Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={onDemoPreview}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 active:scale-95 transition-all rounded-xl cursor-pointer"
            >
              Explore Sample Workspace
            </button>
            <button 
              onClick={onLaunchApp}
              className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 active:scale-95 text-xs font-bold transition-all rounded-xl shadow-lg shadow-slate-920/10 hover:shadow-slate-920/15 cursor-pointer flex items-center gap-1.5"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Launch App'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-slate-50 border-b border-slate-200/70 absolute top-16 left-0 right-0 z-40 px-6 py-6 shadow-xl flex flex-col gap-5 text-sm font-bold text-slate-700"
          >
            <button onClick={() => scrollToSection('features')} className="text-left py-1.5 hover:text-indigo-600 transition-colors">Features</button>
            <button onClick={() => scrollToSection('sandbox')} className="text-left py-1.5 hover:text-indigo-600 transition-colors">Interactive Demo</button>
            <button onClick={() => scrollToSection('pricing')} className="text-left py-1.5 hover:text-indigo-600 transition-colors">Pricing</button>
            <button onClick={() => scrollToSection('testimonials')} className="text-left py-1.5 hover:text-indigo-600 transition-colors">Testimonials</button>
            <hr className="border-slate-200/75 my-1" />
            <div className="flex flex-col gap-2.5 pt-1">
              <button 
                onClick={() => { setMobileMenuOpen(false); onDemoPreview(); }}
                className="w-full py-2.5 text-center font-extrabold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Explore Sample Workspace
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onLaunchApp(); }}
                className="w-full py-2.5 text-center text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl font-extrabold shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Launch App'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 md:pt-24 pb-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Hero Content Left */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tagline Pill */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-55/65 border border-indigo-100/60 rounded-full text-[10.5px] font-black uppercase tracking-wider text-indigo-700 shadow-3xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 fill-indigo-100/50" />
              Systemic Habit mechanics for high achievers
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.05]"
            >
              Turn Goals Into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500">
                Unbreakable Quests
              </span>
            </motion.h1>

            {/* Sub-headline outcomed-focused */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-550 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
            >
              Stop passive drifting. Tracktion blends habit mechanics, streak fire algorithms, and actionable questboards to turn your daily 1% achievements into massive physical outcomes.
            </motion.p>

            {/* CTA Controls */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button
                onClick={onLaunchApp}
                className="w-full sm:w-auto px-7 py-4 bg-slate-900 text-white font-extrabold text-sm rounded-2xl hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/10 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg group"
              >
                {isLoggedIn ? 'Access Your Workspace' : 'Claim Your Questboard Now'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              
              <button
                onClick={() => scrollToSection('sandbox')}
                className="w-full sm:w-auto px-7 py-4 bg-white/85 text-slate-700 border border-slate-200/80 font-extrabold text-xs rounded-2xl hover:bg-slate-100 hover:text-slate-900 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
              >
                <Smartphone className="w-4 h-4 text-indigo-550" />
                Play Live Demo Sandbox
              </button>
            </motion.div>

            {/* Simple value propositions list */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200/50 max-w-lg mx-auto lg:mx-0 text-left text-[11px] font-bold text-slate-550"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                No credit card
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                Offline resilient
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                Instant Cloud Sync
              </div>
            </motion.div>
          </div>

          {/* Hero Visual Right (App Graphic & Floating Elements) */}
          <div className="lg:col-span-5 flex justify-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full max-w-[380px] aspect-[4/5]"
            >
              {/* Outer Glow Circles */}
              <div className="absolute inset-x-0 top-10 bottom-10 bg-gradient-to-tr from-indigo-500 to-amber-400 rounded-full blur-[80px] opacity-25 animate-pulse-slow pointer-events-none" />

              {/* Generated SaaS target/quest graphic */}
              <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
                <img 
                  src={tracktionGraphic} 
                  alt="Tracktion Quest Target Design" 
                  className="rounded-3xl shadow-2xl border border-slate-200 max-h-full object-contain transform rotate-1 hover:rotate-0 transition-all duration-500 hover:scale-[1.02]"
                />
              </div>

              {/* Floating micro indicators (Streak multiplier card) */}
              <motion.div
                initial={{ x: 20, y: -20, opacity: 0 }}
                animate={{ x: 0, y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="absolute top-[12%] right-[-5%] z-20 bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-3 text-white flex items-center gap-3 w-40"
              >
                <div className="h-8 w-8 bg-amber-500/10 border border-amber-500/25 rounded-lg flex items-center justify-center">
                  <Flame className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block leading-tight">Streak Mult.</span>
                  <span className="text-xs font-black text-amber-300">18x Combo Active</span>
                </div>
              </motion.div>

              {/* Floating analytics stats bubble */}
              <motion.div
                initial={{ x: -25, y: 25, opacity: 0 }}
                animate={{ x: 0, y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="absolute bottom-[10%] left-[-8%] z-20 bg-white border border-slate-200/80 shadow-xl rounded-2xl p-3.5 flex items-center gap-2.5 w-44"
              >
                <div className="h-9 w-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block leading-tight">Slay Ratio</span>
                  <span className="text-xs font-black text-slate-800">94.8% Consistency</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Trust & Social Proof Logos Band */}
      <section className="bg-slate-100/50 py-8 border-y border-slate-200/40 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-5">
            Empowering high performance builders across modern tech circles
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-sm font-black text-slate-400 select-none">
            <span className="tracking-tighter hover:text-slate-650 transition-colors">Y COMBINATOR</span>
            <span className="tracking-tight hover:text-slate-650 transition-colors">PRODUCT HUNT</span>
            <span className="tracking-wide hover:text-slate-650 transition-colors">INDIE HACKERS</span>
            <span className="tracking-widest hover:text-slate-650 transition-colors">ZEIT</span>
            <span className="tracking-tight hover:text-slate-650 transition-colors">VECTORS INC</span>
          </div>
        </div>
      </section>

      {/* Interactive Sandbox/Demo Simulator */}
      <section id="sandbox" className="py-20 bg-slate-50 relative z-10 border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs text-indigo-600 font-extrabold uppercase tracking-widest">
              Live App Sandbox
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Test Drive the Slaying Mechanics
            </h2>
            <p className="text-sm font-medium text-slate-500 max-w-lg mx-auto leading-relaxed">
              Don’t trust slides. Click on the final career task in our interactive phone preview below to test the streak counter, progress engine, and celebration triggers!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Simulation Interface Description - Left */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 font-extrabold text-xs">1</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Categorized Task Cubes</h4>
                    <p className="text-xs text-slate-500">Assign color-coded categories to structure habits dynamically into Fitness, Mindset, and Career domains.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 font-extrabold text-xs">2</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Responsive Progression Rings</h4>
                    <p className="text-xs text-slate-500">Every checked task dynamically impacts your daily score, giving you visual gratification instantly.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 font-extrabold text-xs">3</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Combustion Streak Multiplier</h4>
                    <p className="text-xs text-slate-500">Checking all tasks on your quest lists heats up the streak multiplier, triggering dopamine rewards.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex gap-3.5 items-start">
                <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-[11.5px] font-black uppercase tracking-wider text-indigo-950 mb-0.5">Want the real app?</h5>
                  <p className="text-xs text-indigo-850 leading-relaxed font-semibold">
                    You can test the actual live cloud workspace immediately with a simulated database profile.
                  </p>
                  <button 
                    onClick={onDemoPreview}
                    className="mt-2 text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    Launch Sarah's workspace <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Live Device Sandbox - Right */}
            <div className="lg:col-span-7 flex justify-center relative">
              {/* Decorative backgrounds */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-indigo-200/20 blur-[90px] rounded-full pointer-events-none" />

              {/* Smartphone mockup layout */}
              <div className="relative w-full max-w-[340px] bg-slate-950 p-3.5 rounded-[44px] shadow-2xl border-4 border-slate-900 overflow-hidden relative z-10" id="sandbox-phone border-slate-900">
                {/* iPhone Camera Notch Pill */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
                  <div className="w-3 h-1 bg-slate-800 rounded-full mr-2" />
                  <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                </div>

                {/* Sub-Screen Layout */}
                <div className="bg-slate-50 rounded-[34px] p-5 pt-8 min-h-[500px] flex flex-col justify-between relative overflow-hidden select-none">
                  {/* Inside background blobs */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/30 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-100/30 rounded-full blur-2xl pointer-events-none" />

                  {/* Top Bar inside Simulator */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-black text-slate-400 block">System Profile</span>
                      <h5 className="text-xs font-black text-slate-800">Workspace Sandbox</h5>
                    </div>

                    <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
                      <Flame className={`w-3.5 h-3.5 text-amber-500 fill-amber-550 ${simulatorCompleted ? 'animate-bounce' : ''}`} />
                      <span className="text-[11px] font-black text-amber-600">{simulatorStreak}d</span>
                    </div>
                  </div>

                  {/* Daily score widget inside Simulator */}
                  <div className="relative z-10 my-4 bg-white/70 backdrop-blur-md rounded-2.5xl p-4 border border-white/80 shadow-3xs text-left">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Daily Quest Board</span>
                      <span className={`text-[10.5px] font-black ${simulatorCompleted ? 'text-indigo-600' : 'text-slate-550'}`}>
                        {progressPercent}% Cleared
                      </span>
                    </div>

                    {/* Progress Bar slider */}
                    <div className="w-full h-3 bg-slate-200/70 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: '66.6%' }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.3 }}
                        className={`h-full bg-gradient-to-r from-indigo-550 to-indigo-600 rounded-full`}
                      />
                    </div>
                    {simulatorCompleted ? (
                      <span className="text-[9.5px] text-emerald-600 font-extrabold block mt-2 animate-pulse">
                        🎉 All Quests Slayed! Streak multipliers amplified!
                      </span>
                    ) : (
                      <span className="text-[9.5px] text-slate-400 font-bold block mt-2">
                        Complete your active Career Quest to slay the day
                      </span>
                    )}
                  </div>

                  {/* Habits list inside Simulator */}
                  <div className="relative z-10 flex-1 space-y-2.5 my-1.5 text-left">
                    {simulatorTasks.map(task => {
                      const isFitness = task.category === 'fitness';
                      const isMindset = task.category === 'mindset';
                      const isCareer = task.color === 'amber';
                      
                      let decoratorBg = 'bg-amber-100 text-amber-700 border-amber-200';
                      if (isFitness) decoratorBg = 'bg-emerald-100 text-emerald-700 border-emerald-250';
                      if (isMindset) decoratorBg = 'bg-indigo-100 text-indigo-700 border-indigo-200';
                      
                      return (
                        <div 
                          key={task.id}
                          onClick={() => toggleSimulatorTask(task.id)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer group select-none active:scale-[0.98] ${
                            task.completed 
                              ? 'bg-slate-100/80 border-slate-200/50 opacity-65' 
                              : isCareer 
                                ? 'bg-amber-50/80 hover:bg-amber-50 border-amber-200/60 shadow-xs ring-2 ring-amber-400/25 animate-pulse'
                                : 'bg-white border-slate-250 hover:border-slate-350 shadow-3xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-sm">
                              {isFitness ? '🏃‍♂️' : isMindset ? '📖' : '👨‍💻'}
                            </span>
                            <div className="min-w-0">
                              <p className={`text-[11px] font-bold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {task.title}
                              </p>
                              <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${decoratorBg}`}>
                                {task.category}
                              </span>
                            </div>
                          </div>

                          <div className={`h-[18px] w-[18px] rounded-md flex items-center justify-center border transition-all ${
                            task.completed 
                              ? 'bg-indigo-600 border-indigo-600 text-white' 
                              : isCareer 
                                ? 'border-amber-400 hover:bg-amber-100'
                                : 'border-slate-300 group-hover:border-slate-400'
                          }`}>
                            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3.5px]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Confetti simulation overlay */}
                  <AnimatePresence>
                    {showConfetti && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-indigo-900/35 backdrop-blur-3xs flex flex-col justify-center items-center text-white"
                      >
                        <div className="p-3.5 bg-slate-900 rounded-2xl flex flex-col items-center gap-1 max-w-[180px] shadow-2xl text-center border border-slate-800">
                          <Sparkles className="w-6 h-6 text-yellow-300 animate-spin-slow" />
                          <h6 className="text-[10px] uppercase font-black tracking-wider text-amber-300">Quest Completed!</h6>
                          <p className="text-[8.5px] font-bold text-slate-200">Daily objectives are 100% full. You slayed the day!</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bottom Tab Menu Inside simulator */}
                  <div className="relative z-10 pt-2 border-t border-slate-200/50 flex justify-around items-center">
                    <div className="h-2 w-2 bg-indigo-600 rounded-full" />
                    <div className="h-1.5 w-1.5 bg-slate-400 rounded-full" />
                    <div className="h-1.5 w-1.5 bg-slate-400 rounded-full" />
                    <div className="h-1.5 w-1.5 bg-slate-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid / Bento Style */}
      <section id="features" className="py-20 bg-slate-100/50 relative z-10 border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs text-indigo-600 font-extrabold uppercase tracking-widest">
              Unrivaled Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Habit engineering, refined.
            </h2>
            <p className="text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
              Ditch the generic checkboxes. Tracktion structures routines like micro-quests to secure unbreakable discipline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left space-y-4">
              <div className="h-11 w-11 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                <Layout className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Custom Target Questboards</h3>
              <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                Organize habits in a neat visual interface. Establish goals for custom themes (Fitness, Career, Finance, Mindset) and watch category tracking ratios stay high.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left space-y-4">
              <div className="h-11 w-11 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                <Flame className="w-5 h-5 fill-amber-100" />
              </div>
              <h3 className="text-base font-black text-slate-900">Combustion Streak Engines</h3>
              <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                Protect your records with visual combustion fire indicators. Logging consistent achievements ramps up multipliers, making consistency highly gamified.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left space-y-4">
              <div className="h-11 w-11 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-teal-600">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Deconstructable Daily Quests</h3>
              <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                Break major targets into bite-sized sub-tasks with assigned difficulty levels (Easy, Medium, Heroic) and track complete tasks directly inside check-ins.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left space-y-4">
              <div className="h-11 w-11 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Historical Intelligence Analytics</h3>
              <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                Observe trends with interactive D3 charts, accomplishment ratios, and weekly completion indices. Make data-driven decisions to adjust habits.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left space-y-4">
              <div className="h-11 w-11 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Offline-First Resiliency</h3>
              <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                Tackle tracking with zero friction. Changes write instantly to offline buffers and sync seamlessly to secure Firestore clusters when connection returns.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left space-y-4">
              <div className="h-11 w-11 bg-violet-50 border border-violet-100 rounded-2xl flex items-center justify-center text-violet-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Real-time Celebration Feeds</h3>
              <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                Slaying goals yields custom, interactive confetti and pop-up accomplishment banners to keep motivation high. Celebrate milestones immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section id="testimonials" className="py-20 bg-slate-50 relative z-10 border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs text-indigo-600 font-extrabold uppercase tracking-widest">
              Success Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Slayed by actual builders.
            </h2>
            <p className="text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
              Discover how extreme performers utilize Tracktion to optimize workflow and compound improvements day in and day out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Testimonial 1 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-7 shadow-3xs flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-[12.5px] font-semibold text-slate-600 leading-relaxed italic">
                  "I've tried every habit tracker on Product Hunt. Tracktion is the only one that actually kept me consistent. The quest system gamifies habits in a way that feels completely organic, not childish."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-black text-indigo-700">🦊</div>
                <div>
                  <h4 className="text-xs font-black text-slate-950">Sarah Jenkins</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Founder, ZenFlow</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-7 shadow-3xs flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-[12.5px] font-semibold text-slate-600 leading-relaxed italic">
                  "The visual dashboard is a game-changer. Looking at my streak combustion is the perfect dopamine hit to get me out of bed and into the deep gym cardio sessions at 5 AM."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-9 w-9 bg-amber-100 rounded-full flex items-center justify-center text-sm font-black text-amber-700">🦁</div>
                <div>
                  <h4 className="text-xs font-black text-slate-950">Marcus Thorne</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sr. Staff Engineer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-7 shadow-3xs flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-[12.5px] font-semibold text-slate-600 leading-relaxed italic">
                  "Decomposing goals into micro-quests is brilliant. I cleared my Physics project code repository check-ins by tackling individual sub-quests, directly inside Tracktion."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-9 w-9 bg-teal-100 rounded-full flex items-center justify-center text-sm font-black text-teal-700">🦉</div>
                <div>
                  <h4 className="text-xs font-black text-slate-950">Linnea Holtz</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Physics Lead Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Interactive */}
      <section id="pricing" className="py-20 bg-slate-100/50 relative z-10 border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs text-indigo-600 font-extrabold uppercase tracking-widest">
              Simple Value
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Invest in your daily compound.
            </h2>
            <p className="text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
              Commit to tracking. Select the perfect tier to ramp up your multipliers and unlock predictive consistency analytical metrics.
            </p>

            {/* Toggler Container */}
            <div className="pt-4 flex items-center justify-center gap-2.5">
              <span className={`text-[11px] uppercase font-black tracking-wider ${billingPeriod === 'monthly' ? 'text-indigo-600' : 'text-slate-450'}`}>Monthly</span>
              <button 
                onClick={() => setBillingPeriod(p => p === 'monthly' ? 'yearly' : 'monthly')}
                className="h-6.5 w-12 bg-slate-350 p-1 rounded-full relative transition-all cursor-pointer flex items-center"
              >
                <div className={`h-[20px] w-[20px] bg-white rounded-full transition-all shadow-xs ${billingPeriod === 'yearly' ? 'translate-x-[20px]' : 'translate-x-0'}`} />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] uppercase font-black tracking-wider ${billingPeriod === 'yearly' ? 'text-indigo-600' : 'text-slate-450'}`}>Yearly</span>
                <span className="bg-amber-100 text-amber-700 text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-amber-200">
                  Save 33%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:shadow-lg transition-all text-left flex flex-col justify-between relative">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Quest Starter</span>
                  <h3 className="text-xl font-black text-slate-900">Apprentice Sandbox</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2">
                    Build habit baselines. Complete control over fundamental checklists with absolute offline capabilities.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-3xl font-black text-slate-900">$0</span>
                  <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Free Forever</span>
                </div>

                <hr className="border-slate-200/50" />

                <ul className="space-y-3.5 text-xs text-slate-600 font-semibold">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4.5 h-4.5 text-indigo-550 flex-shrink-0" />
                    Up to 3 active Questboards
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4.5 h-4.5 text-indigo-550 flex-shrink-0" />
                    Standard Streak Combo tracker
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4.5 h-4.5 text-indigo-550 flex-shrink-0" />
                    Offline local data persistence
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-350 line-through">
                    <X className="w-4.5 h-4.5 text-slate-300 flex-shrink-0" />
                    Deep predictive analytics engine
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-350 line-through">
                    <X className="w-4.5 h-4.5 text-slate-300 flex-shrink-0" />
                    Uncapped targets and infinite tasks
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={onLaunchApp}
                  className="w-full py-3.5 border border-slate-300 hover:border-slate-800 text-slate-800 hover:text-slate-900 bg-white hover:bg-slate-50 text-xs uppercase tracking-widest font-black rounded-2xl transition-all cursor-pointer text-center"
                >
                  {isLoggedIn ? 'Go to Dashboard' : 'Start Slaying Free'}
                </button>
              </div>
            </div>

            {/* Pro Tier (High Conversion) */}
            <div className="bg-white border-2 border-indigo-600 rounded-3xl p-8 hover:shadow-xl transition-all text-left flex flex-col justify-between relative">
              <div className="absolute top-0 right-10 -translate-y-1/2 bg-indigo-600 text-white text-[9px] uppercase font-black tracking-widest px-4 py-1.5 rounded-full shadow-md">
                Highly Recommended
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 block mb-1">Traktion Core Pro</span>
                  <h3 className="text-xl font-black text-slate-900">Tracktion Architect pro</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2">
                    Infinite progression potential. Uncap all target boards, obtain predictive analytics, secure streak freeze buffers.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">${billingPeriod === 'monthly' ? '9' : '6'}</span>
                    <span className="text-[11px] font-bold text-slate-450">/month</span>
                  </div>
                  <span className="text-[10px] uppercase font-black text-indigo-600 block tracking-wider">
                    {billingPeriod === 'yearly' ? 'Billed annually ($72 total)' : 'Billed monthly'}
                  </span>
                </div>

                <hr className="border-slate-200/50" />

                <ul className="space-y-3.5 text-xs text-slate-600 font-semibold font-semibold">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4.5 h-4.5 text-indigo-600 flex-shrink-0 stroke-[2.5px]" />
                    <span className="font-bold">Uncapped Target Questboards</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4.5 h-4.5 text-indigo-600 flex-shrink-0 stroke-[2.5px]" />
                    Infinite nested sub-quests & weights
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4.5 h-4.5 text-indigo-600 flex-shrink-0 stroke-[2.5px]" />
                    3 Streak Freeze shields/month
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4.5 h-4.5 text-indigo-600 flex-shrink-0 stroke-[2.5px]" />
                    Deep predictive analytics and trend diagnostics
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4.5 h-4.5 text-indigo-600 flex-shrink-0 stroke-[2.5px]" />
                    Instant cloud backups & real-time team share links
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={onLaunchApp}
                  className="w-full py-4 text-white bg-indigo-600 hover:bg-slate-900 text-xs uppercase tracking-widest font-black rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-slate-900/15 transition-all cursor-pointer text-center"
                >
                  {isLoggedIn ? 'Go to Dashboard' : 'Elevate Your Routine'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Hero-like Final CTA Section */}
      <section className="relative py-24 px-6 z-10 overflow-hidden">
        {/* Dark Slate CTA Card container */}
        <div className="max-w-5xl mx-auto bg-slate-950 rounded-[44px] p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-550/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block">
              Continuous optimization await.
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Stop planning passively. <br className="hidden sm:inline" />
              Start compounding outcomes.
            </h2>
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-md mx-auto">
              Join thousands of developers, researchers, and creators compounding 1% daily increments. Claim your Questboard today.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={onLaunchApp}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-2.5xl shadow-xl shadow-indigo-600/15 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Launch Tracktion Workspace'}
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={onDemoPreview}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-white border border-slate-850 font-extrabold text-xs rounded-2.5xl active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Inspect Sample Data Workspace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Elegant Footer */}
      <footer className="bg-slate-50 border-t border-slate-200/40 relative z-10 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10 text-left">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TracktionLogo size={32} />
              <span className="text-base font-black tracking-tight text-slate-850 uppercase">Tracktion</span>
            </div>
            <p className="text-[11.5px] font-semibold text-slate-450 leading-relaxed max-w-xs">
              Systems architecture for continuous life compounded progress. Track objectives, analyze trend combustion multipliers, slay targets.
            </p>
          </div>

          <div>
            <h5 className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 mb-4">Product</h5>
            <ul className="space-y-2.5 text-xs text-slate-500 font-bold">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-slate-850 cursor-pointer">Features</button></li>
              <li><button onClick={() => scrollToSection('sandbox')} className="hover:text-slate-850 cursor-pointer">Live Demo</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="hover:text-slate-850 cursor-pointer">Pricing Tiers</button></li>
              <li><button onClick={onDemoPreview} className="hover:text-slate-850 cursor-pointer">Sample Workspace</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 mb-4">Engineering</h5>
            <ul className="space-y-2.5 text-xs text-slate-500 font-bold animate-pulse-slow">
              <li className="flex items-center gap-1.5 text-slate-400"><ShieldCheck className="w-3.5 h-3.5" /> Firestore Secured</li>
              <li className="flex items-center gap-1.5 text-slate-400"><Zap className="w-3.5 h-3.5" /> Offline Sync Layer</li>
              <li className="flex items-center gap-1.5 text-slate-400"><TrendingUp className="w-3.5 h-3.5" /> D3 Tracktion Engine</li>
            </ul>
          </div>

          <div>
            <h5 className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 mb-4">Legal</h5>
            <ul className="space-y-2.5 text-xs text-slate-500 font-bold">
              <li><span className="hover:text-slate-850 cursor-pointer">Security Code</span></li>
              <li><span className="hover:text-slate-850 cursor-pointer">Terms of Quest</span></li>
              <li><span className="hover:text-slate-850 cursor-pointer">Privacy System</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-200/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-bold text-slate-400">
          <p>© 2026 Tracktion Inc. All rights of quests reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-indigo-550 cursor-pointer">Twitter</span>
            <span>•</span>
            <span className="hover:text-indigo-550 cursor-pointer">GitHub</span>
            <span>•</span>
            <span className="hover:text-indigo-550 cursor-pointer">Discord Community</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
