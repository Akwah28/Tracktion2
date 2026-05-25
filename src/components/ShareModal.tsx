import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Copy, 
  Check, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Mail, 
  MessageSquare,
  Sparkles,
  Flame,
  Award,
  Link2
} from 'lucide-react';
import { Goal } from '../types';

interface ShareModalProps {
  goal: Goal;
  onClose: () => void;
}

export default function ShareModal({ goal, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareFormat, setShareFormat] = useState<'casual' | 'brag' | 'compact'>('casual');

  // Compute stats
  const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  const isDone = goal.currentValue >= goal.targetValue;
  
  // Custom templates
  const getShareText = () => {
    const inviteLink = window.location.origin;
    const streakEmoji = goal.streak >= 3 ? '🔥'.repeat(Math.min(3, Math.floor(goal.streak / 3))) || '🔥' : '🌱';
    
    switch (shareFormat) {
      case 'brag':
        return `🎯 Consistency is KEY! I've crushed ${pct}% of my "${goal.title}" routine today, keeping my custom ${goal.streak}-day streak alive! ${streakEmoji}\n\n📊 Stats: ${goal.currentValue}/${goal.targetValue} ${goal.unit} (${goal.category})\n🚀 Join me on Tracktion and start building habits scientifically at ${inviteLink}`;
      case 'compact':
        return `📈 Habit Tracked: ${goal.title} (${goal.category}) - ${pct}% done. Streak: ${goal.streak}d!\nJoin: ${inviteLink}`;
      case 'casual':
      default:
        return `🌟 Keeping making tracktion! Checking in on my habit: "${goal.title}" of doing ${goal.targetValue} ${goal.unit}.\n\n🔥 Logged: ${goal.currentValue} today\n⚡️ Multi-day Streak: ${goal.streak} days\n🌱 Start building positive habits at ${inviteLink}`;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const encodedText = encodeURIComponent(getShareText());
  const encodedUrl = encodeURIComponent(window.location.origin);

  // Social URLs
  const socialLinks = [
    {
      name: 'Twitter / X',
      icon: Twitter,
      color: 'bg-black text-white hover:bg-neutral-800',
      url: `https://twitter.com/intent/tweet?text=${encodedText}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-indigo-600 text-white hover:bg-indigo-705',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 text-white hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'bg-emerald-600 text-white hover:bg-emerald-700',
      url: `https://api.whatsapp.com/send?text=${encodedText}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-slate-700 text-white hover:bg-slate-800',
      url: `mailto:?subject=${encodeURIComponent(`My Progress Tracking Update on ${goal.title}`)}&body=${encodedText}`,
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99]" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
        className="w-full max-w-md bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner with absolute decorative background */}
        <div className="relative h-28 bg-gradient-to-tr from-indigo-500 to-indigo-700 p-5 flex flex-col justify-end overflow-hidden">
          <div className="absolute top-2 right-2 z-10">
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-12 -left-8 w-44 h-44 bg-white/5 rounded-full blur-2xl" />

          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-indigo-200 fill-indigo-200/20" />
            <h3 className="font-extrabold text-base tracking-tight leading-none">Share Habit Progress</h3>
          </div>
          <p className="text-[11px] text-indigo-100 mt-1">Spread consistency & inspire your community</p>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-4">
          
          {/* Card preview */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl relative overflow-hidden">
            <div className="absolute top-3 right-3 flex gap-1.5">
              {goal.streak > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 rounded-md px-1.5 py-0.5">
                  <Flame className="w-3 h-3 text-orange-500 fill-orange-500/10 animate-pulse" /> {goal.streak}d
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                goal.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                goal.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                goal.color === 'rose' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                goal.color === 'amber' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                goal.color === 'violet' ? 'bg-violet-50 text-violet-600 border border-violet-100' : 
                'bg-sky-50 text-sky-600 border border-sky-100'
              }`}>
                {goal.category}
              </span>
            </div>

            <h4 className="mt-2 text-sm font-bold text-slate-800 leading-snug">{goal.title}</h4>
            
            {/* Visual Mini Progress */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-medium">Daily Tracktion Completed:</span>
                <span className="font-bold text-slate-800">{pct}% ({goal.currentValue}/{goal.targetValue} {goal.unit})</span>
              </div>
              <div className="h-2 w-full bg-slate-200/60 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${
                    goal.color === 'emerald' ? 'bg-emerald-500' :
                    goal.color === 'indigo' ? 'bg-indigo-500' :
                    goal.color === 'rose' ? 'bg-rose-500' :
                    goal.color === 'amber' ? 'bg-amber-500' :
                    goal.color === 'violet' ? 'bg-violet-500' : 'bg-sky-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                />
              </div>
            </div>

            {/* Quote of consistency */}
            {isDone && (
              <div className="mt-3 flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold py-1 px-2.5 rounded-xl border border-emerald-100">
                <Award className="w-3.5 h-3.5" /> 
                Task absolute limit successfully crushed! Excellent momentum!
              </div>
            )}
          </div>

          {/* Formats Selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Select Share Template Tone</span>
            <div className="grid grid-cols-3 gap-2 bg-slate-100/60 p-1 rounded-xl">
              {(['casual', 'brag', 'compact'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setShareFormat(fmt)}
                  className={`py-1.5 text-[10px] font-extrabold capitalize rounded-lg transition-all ${
                    shareFormat === fmt 
                      ? 'bg-white text-indigo-600 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Sharing Draft Box */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Message Preview</span>
            <div className="relative">
              <textarea 
                readOnly
                value={getShareText()}
                className="w-full text-[11px] font-mono leading-relaxed p-3.5 bg-slate-50 border border-slate-100 rounded-2xl h-24 text-slate-600 resize-none outline-none focus:ring-0"
              />
              <button
                onClick={handleCopy}
                className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-white hover:bg-slate-100 text-indigo-600 border border-slate-100 font-extrabold text-[10px] py-1 px-3.5 rounded-xl shadow-xs transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-indigo-500" />
                    <span>Copy Post</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Network Platforms */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Or Share Directly</span>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border border-transparent shadow-xs active:scale-95 ${link.color}`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer info brand */}
        <div className="bg-slate-50 border-t border-slate-100/50 py-3 px-5 flex items-center justify-between text-[10px] text-slate-400 font-bold tracking-tight">
          <span className="flex items-center gap-1">
            <Link2 className="w-3 h-3 text-slate-350" /> Built with Tracktion Science
          </span>
          <span>Invite Link Included</span>
        </div>
      </motion.div>
    </div>
  );
}
