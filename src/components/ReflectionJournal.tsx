import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Plus, 
  ChevronRight, 
  Calendar, 
  Check, 
  Loader2, 
  ArrowLeft,
  CalendarDays,
  PenTool,
  Award,
  BookMarked,
  Sliders,
  AlertCircle,
  Shuffle,
  Quote
} from 'lucide-react';
import { JournalEntry, UserProfile } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

interface ReflectionJournalProps {
  user: { uid: string };
  profile: UserProfile;
}

interface MoodOption {
  value: string;
  emoji: string;
  label: string;
  color: string;
  bg: string;
}

const MOODS: MoodOption[] = [
  { value: 'peaceful', emoji: '🌸', label: 'Peaceful', color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40' },
  { value: 'inspired', emoji: '⚡', label: 'Inspired', color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40' },
  { value: 'focused', emoji: '🎯', label: 'Focused', color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/40' },
  { value: 'tired', emoji: '🥱', label: 'Tired', color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/40' },
  { value: 'neutral', emoji: '🍃', label: 'Neutral', color: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-100 dark:border-teal-900/40' },
  { value: 'anxious', emoji: '💭', label: 'Anxious', color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900/40' },
  { value: 'happy', emoji: '😊', label: 'Happy', color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/40' },
];

interface Affirmation {
  text: string;
  source: string;
  category: string;
}

const AFFIRMATIONS: Affirmation[] = [
  { text: "The secret of your future is hidden in your daily routine.", source: "Mike Murdock", category: "Consistency" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", source: "James Clear", category: "Focus" },
  { text: "Action is the foundational key to all success.", source: "Pablo Picasso", category: "Consistency" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", source: "Seneca", category: "Mindset" },
  { text: "Small daily improvements over time lead to stunning results.", source: "Robin Sharma", category: "Growth" },
  { text: "Focus is a muscle, and you are building a masterpiece one rep at a time.", source: "Tracky", category: "Focus" },
  { text: "Patience with yourself is a form of power. Great things compound in silence.", source: "Tracky", category: "Growth" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", source: "Franklin D. Roosevelt", category: "Mindset" },
  { text: "Energy flows where focus goes. Lock onto your intentions.", source: "Tony Robbins", category: "Focus" },
  { text: "Your daily actions are votes for the person you wish to become.", source: "James Clear", category: "Consistency" },
  { text: "Do not wait for perfect conditions. Start where you are, with what you have.", source: "Arthur Ashe", category: "Courage" },
];

const PERSONAL_MESSAGES = [
  (name: string) => `You are doing amazing, ${name}! Take a deep breath and keep your weekly targets in clear focus today.`,
  (name: string) => `Consistency is your superpower, ${name}. Every step you take today is a solid brick on your path.`,
  (name: string) => `Hello, ${name}! Remember to celebrate your microscopic progress. Small steps count just as much as giant leaps.`,
  (name: string) => `Stay steady, ${name}. Your future self is already thanking you for showing up today.`,
  (name: string) => `Take it one task at a time, ${name}. Deep work is calling, and you are fully capable of achieving flow.`,
  (name: string) => `Remember, ${name}: a missed day is just data, not a failure. Tomorrow is a brand new page.`,
  (name: string) => `Unleash your intention today, ${name}. You possess the quiet focus needed to reach your dreams.`
];

const getDailyIndex = (max: number) => {
  const todayStr = new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash += todayStr.charCodeAt(i);
  }
  return hash % max;
};

export const ReflectionJournal: React.FC<ReflectionJournalProps> = ({ user, profile }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'list' | 'editor'>('list');

  // Editor Draft State
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [mood, setMood] = useState<string>('neutral');
  const [productivity, setProductivity] = useState<number>(50);
  const [thoughts, setThoughts] = useState<string>('');
  const [lessons, setLessons] = useState<string>('');
  const [celebrations, setCelebrations] = useState<string>('');
  
  // Autosave tracker states
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Daily Affirmation State
  const [affirmation, setAffirmation] = useState<{
    text: string;
    source: string;
    category: string;
    isPersonalized: boolean;
  } | null>(null);

  const getDayAffirmation = useCallback(() => {
    const totalAffirmations = AFFIRMATIONS.length;
    const totalPersonal = PERSONAL_MESSAGES.length;
    const hash = getDailyIndex(totalAffirmations + totalPersonal);
    
    if (hash < totalAffirmations) {
      const aff = AFFIRMATIONS[hash];
      return {
        text: aff.text,
        source: aff.source,
        category: aff.category,
        isPersonalized: false
      };
    } else {
      const pIdx = hash - totalAffirmations;
      const msgGen = PERSONAL_MESSAGES[pIdx % totalPersonal];
      return {
        text: msgGen(profile.name || 'Achiever'),
        source: 'Tracky Co.',
        category: 'Personalized',
        isPersonalized: true
      };
    }
  }, [profile.name]);

  useEffect(() => {
    setAffirmation(getDayAffirmation());
  }, [profile.name, getDayAffirmation]);

  const rollRandomAffirmation = () => {
    const rollPersonal = Math.random() > 0.45;
    if (rollPersonal) {
      const pIdx = Math.floor(Math.random() * PERSONAL_MESSAGES.length);
      const msgGen = PERSONAL_MESSAGES[pIdx];
      setAffirmation({
        text: msgGen(profile.name || 'Achiever'),
        source: 'Tracky Co.',
        category: 'Personalized',
        isPersonalized: true
      });
    } else {
      const affIdx = Math.floor(Math.random() * AFFIRMATIONS.length);
      const aff = AFFIRMATIONS[affIdx];
      setAffirmation({
        text: aff.text,
        source: aff.source,
        category: aff.category,
        isPersonalized: false
      });
    }
  };

  // Today Date Reference
  const todayStr = new Date().toISOString().split('T')[0];

  // Subscribe to Journal Entries list from Firestore
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const path = `users/${user.uid}/journalEntries`;
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: JournalEntry[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as JournalEntry);
        });
        // Sort past reflections by date descending
        list.sort((a, b) => b.date.localeCompare(a.date));
        setEntries(list);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Handle entering editor to write new reflection or update existing one
  const handleOpenEditor = (entry: JournalEntry | null) => {
    setErrorMessage(null);
    if (entry) {
      setSelectedEntry(entry);
      setMood(entry.mood);
      setProductivity(entry.productivity);
      setThoughts(entry.thoughts);
      setLessons(entry.lessons || '');
      setCelebrations(entry.celebrations || '');
      setSaveStatus('saved');
    } else {
      // Check if they already wrote an entry for today to offer editing instead
      const existingToday = entries.find(e => e.date === todayStr);
      if (existingToday) {
        setSelectedEntry(existingToday);
        setMood(existingToday.mood);
        setProductivity(existingToday.productivity);
        setThoughts(existingToday.thoughts);
        setLessons(existingToday.lessons || '');
        setCelebrations(existingToday.celebrations || '');
        setSaveStatus('saved');
      } else {
        setSelectedEntry(null);
        setMood('neutral');
        setProductivity(50);
        setThoughts('');
        setLessons('');
        setCelebrations('');
        setSaveStatus('idle');
      }
    }
    setActiveView('editor');
  };

  // Helper labels for productivity ratings
  const getProductivityLabel = (val: number) => {
    if (val <= 20) return { label: 'Restorative Pace', text: 'Gentle, introspective rest day.' };
    if (val <= 40) return { label: 'Light Momentum', text: 'Slow but intentional steps.' };
    if (val <= 60) return { label: 'Steady Flow', text: 'In control, keeping clean pace.' };
    if (val <= 80) return { label: 'Deep Work Focus', text: 'Highly efficient output.' };
    return { label: 'Peak Flow State', text: 'Outstanding execution and clarity.' };
  };

  // Manual save handler
  const handleSaveEntry = async () => {
    if (!user) return;
    if (!thoughts.trim()) {
      setErrorMessage('Please type standard thoughts or note how your day felt.');
      return;
    }

    setSaveStatus('saving');
    setErrorMessage(null);

    const entryId = selectedEntry?.id || `jr_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    const finalEntry: JournalEntry = {
      id: entryId,
      date: selectedEntry?.date || todayStr,
      mood,
      productivity: Number(productivity),
      thoughts,
      lessons: lessons.trim() || undefined,
      celebrations: celebrations.trim() || undefined,
      createdAt: selectedEntry?.createdAt || timestamp,
      updatedAt: timestamp
    };

    const path = `users/${user.uid}/journalEntries`;
    try {
      await setDoc(doc(db, path, entryId), finalEntry);
      
      // Update local state and set visual confirmation
      setSelectedEntry(finalEntry);
      setSaveStatus('saved');
      
      // Auto-transition to list view after a sweet confirmation delay
      setTimeout(() => {
        setActiveView('list');
      }, 700);
    } catch (err: any) {
      setSaveStatus('dirty');
      setErrorMessage('Failed to save reflection details. Please review entries.');
      handleFirestoreError(err, OperationType.WRITE, `${path}/${entryId}`);
    }
  };

  // Delete reflection handler
  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    const path = `users/${user.uid}/journalEntries`;
    try {
      await deleteDoc(doc(db, path, entryId));
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }
      setDeleteConfirmId(null);
      setActiveView('list');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${path}/${entryId}`);
    }
  };

  // Mark form dirty on input updates to handle visual signals
  const handleChangeInput = () => {
    if (saveStatus === 'saved' || saveStatus === 'idle') {
      setSaveStatus('dirty');
    }
  };

  // Autosave implementation using debounced trigger whenever user pauses standard typing draft
  useEffect(() => {
    if (activeView !== 'editor' || !thoughts.trim() || saveStatus !== 'dirty') return;

    const delayDebounceFn = setTimeout(() => {
      // Execute discrete standard backgroung auto update
      const autosave = async () => {
        const entryId = selectedEntry?.id || `jr_${Date.now()}`;
        const timestamp = new Date().toISOString();
        
        const partialData: JournalEntry = {
          id: entryId,
          date: selectedEntry?.date || todayStr,
          mood,
          productivity: Number(productivity),
          thoughts,
          lessons: lessons.trim() || undefined,
          celebrations: celebrations.trim() || undefined,
          createdAt: selectedEntry?.createdAt || timestamp,
          updatedAt: timestamp
        };

        const path = `users/${user.uid}/journalEntries`;
        try {
          await setDoc(doc(db, path, entryId), partialData);
          if (!selectedEntry) {
            setSelectedEntry(partialData);
          }
          setSaveStatus('saved');
        } catch {
          // Fail silently on autosave to not disrupt user typing flow
        }
      };
      
      autosave();
    }, 2500); // 2.5 second delay triggers peaceful quiet autosaving

    return () => clearTimeout(delayDebounceFn);
  }, [thoughts, mood, productivity, lessons, celebrations, activeView, selectedEntry, saveStatus, user, todayStr]);

  return (
    <div className="space-y-6 text-left max-w-md mx-auto relative px-1">
      
      <AnimatePresence mode="wait">
        {activeView === 'list' ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Header Area */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-widest block">Mindfulness Space</span>
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <BookOpen className="w-5 h-5 text-indigo-500" /> Reflection Journal
                </h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Pause, calibrate today, and gather personal learning</p>
              </div>

              {/* Add New Reflection button */}
              <button
                id="btn-add-journal-entry"
                onClick={() => handleOpenEditor(null)}
                className="py-2.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-2xl flex items-center gap-1.5 text-xs font-black shadow-sm transition-all select-none active:scale-95 cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Today</span>
              </button>
            </div>

            {/* Daily Affirmation Module */}
            {affirmation && (
              <div className="frosted-card relative overflow-hidden p-5 rounded-[28px] bg-gradient-to-br from-indigo-50/50 via-white/80 to-purple-55/20 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-transparent border border-indigo-100/40 dark:border-indigo-900/30 flex flex-col gap-3 shadow-2xs">
                {/* Top header row */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50/60 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-md flex items-center gap-1 select-none">
                    <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                    <span>{affirmation.category} Spark</span>
                  </span>
                  
                  <button 
                    onClick={rollRandomAffirmation}
                    title="Get a new inspirational spark"
                    type="button"
                    className="p-1 px-1.5 rounded-lg bg-white/70 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-450 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-indigo-400 transition-all select-none cursor-pointer active:scale-90 flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider"
                  >
                    <Shuffle className="w-2.5 h-2.5" />
                    <span>Spark</span>
                  </button>
                </div>

                {/* Body Quote */}
                <div className="relative pl-6 py-0.5">
                  <Quote className="w-5 h-5 text-indigo-100 dark:text-indigo-950 absolute left-0 top-0 transform rotate-180" />
                  <p className="text-xs font-bold text-slate-750 dark:text-slate-200 leading-relaxed font-sans">
                    {affirmation.text}
                  </p>
                </div>

                {/* Footer source */}
                <span className="text-[9px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase self-end font-mono">
                  — {affirmation.source}
                </span>
              </div>
            )}

            {/* List entries */}
            <div className="space-y-3.5">
              {loading ? (
                // Elegant loading skeleton blocks of past entries list to completely prevent physical layout shifts
                <div className="space-y-3.5">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="frosted-card p-4.5 rounded-3xl space-y-3 animate-pulse">
                      <div className="flex justify-between items-center">
                        <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-6 w-14 bg-slate-200 dark:bg-slate-800 rounded-full" />
                      </div>
                      <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3.5 w-11/12 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  ))}
                </div>
              ) : entries.length === 0 ? (
                // Beautiful empty container to match elegant premium layout guidelines
                <div className="text-center py-12 p-6 frosted-card rounded-3xl bg-white/45 dark:bg-slate-900/40 border border-slate-100/50 dark:border-slate-850/50 space-y-4">
                  <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-3xl w-fit mx-auto text-indigo-500">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="max-w-[280px] mx-auto space-y-1.5">
                    <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">Your quiet space waits</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                      "Journaling is the mapping of your personal evolutionary flow." Capture how days feel, write freeform learning, and build strong mindful habits.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenEditor(null)}
                    className="mt-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 font-sans cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                  >
                    Write your first reflection
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5 max-h-[580px] overflow-y-auto no-scrollbar pr-0.5 pb-20">
                  {entries.map((entry) => {
                    const matchedMood = MOODS.find(m => m.value === entry.mood) || MOODS[4];
                    const prodInfo = getProductivityLabel(entry.productivity);
                    
                    return (
                      <div
                        key={entry.id}
                        onClick={() => handleOpenEditor(entry)}
                        className="frosted-card p-4.5 rounded-3xl bg-white/45 dark:bg-slate-900/40 border border-white/50 dark:border-slate-850/40 hover:border-indigo-150 dark:hover:border-indigo-950/50 shadow-xs transition-all duration-200 active:scale-[0.98] cursor-pointer relative overflow-hidden group space-y-3"
                      >
                        {/* Top Metadata */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[10.5px] font-black text-slate-500 dark:text-slate-400">
                              {new Date(entry.date + 'T00:00:00').toLocaleDateString(undefined, { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric',
                                year: entry.date.split('-')[0] !== todayStr.split('-')[0] ? 'numeric' : undefined
                              })}
                            </span>
                            {entry.date === todayStr && (
                              <span className="text-[8.5px] font-extrabold px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-md">TODAY</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Mood Tag */}
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${matchedMood.bg} ${matchedMood.color}`}>
                              <span className="mr-1 inline-block">{matchedMood.emoji}</span>
                              {matchedMood.label}
                            </span>
                          </div>
                        </div>

                        {/* Free thoughts text */}
                        <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-normal line-clamp-3">
                          {entry.thoughts}
                        </p>

                        {/* Prompt-driven extras clues indicators */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {entry.celebrations && (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100/10 text-emerald-600 dark:text-emerald-400 rounded-md flex items-center gap-1">
                              <Award className="w-2.5 h-2.5" /> Celebrated Today
                            </span>
                          )}
                          {entry.lessons && (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-100/10 text-amber-600 dark:text-amber-400 rounded-md flex items-center gap-1">
                              <BookMarked className="w-2.5 h-2.5" /> Core Insight
                            </span>
                          )}
                          {/* Productivity score preview bar */}
                          <div className="flex items-center gap-1.5 ml-auto text-[9.5px] text-slate-400 font-bold">
                            <Sliders className="w-2.5 h-2.5 text-indigo-400" />
                            <span>{entry.productivity}% productivity</span>
                          </div>
                        </div>

                        {/* Interactive edit hover pointer indicator */}
                        <div className="absolute right-3.5 bottom-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="w-4 h-4 text-slate-450 dark:text-slate-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 pb-24"
          >
            {/* Editor Nav Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100/50 dark:border-slate-900/40">
              <button
                onClick={() => setActiveView('list')}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full text-slate-500 dark:text-slate-400 cursor-pointer active:scale-90 transition-transform flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Save status pill */}
                {saveStatus === 'saved' && (
                  <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border border-emerald-100/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    Autosaved
                  </span>
                )}
                {saveStatus === 'saving' && (
                  <span className="text-[9.5px] font-bold text-indigo-500 px-2 py-0.5 rounded-full flex items-center gap-1 bg-indigo-50/50 dark:bg-indigo-950/20">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    Saving...
                  </span>
                )}
                {saveStatus === 'dirty' && (
                  <span className="text-[9.5px] font-bold text-slate-450 dark:text-slate-500 px-2 py-0.5 rounded-full">
                    Drafting Standard...
                  </span>
                )}
                {selectedEntry && (
                  <button
                    id="btn-delete-reflection"
                    onClick={() => setDeleteConfirmId(selectedEntry.id)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-rose-500 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Error Message feedback */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 border border-rose-150 dark:border-rose-950/40 rounded-2xl flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed font-semibold">{errorMessage}</p>
              </div>
            )}

            {/* Main Form Fields */}
            <div className="space-y-5">
              {/* Date Header Indicator */}
              <div className="text-left">
                <span className="text-[9.5px] text-slate-450 dark:text-slate-500 font-extrabold uppercase tracking-widest block">Entry Timeline</span>
                <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">
                  {selectedEntry 
                    ? new Date(selectedEntry.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                    : new Date(todayStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                  }
                </h3>
              </div>

              {/* standard Prompt: "How did today feel?" */}
              <div className="space-y-2 bg-white/40 dark:bg-slate-900/35 border border-slate-100/40 dark:border-slate-850/35 p-4 rounded-3xl">
                <label className="text-[11.5px] font-black text-slate-800 dark:text-slate-100 tracking-wide flex items-center gap-1.5">
                  🎨 How did today feel? <span className="text-rose-450 text-[10px]">*</span>
                </label>
                
                {/* Premium Emotion Mood Selector */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-1.5">
                  {MOODS.map((m) => {
                    const isSelected = mood === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => {
                          setMood(m.value);
                          handleChangeInput();
                        }}
                        className={`py-2 px-1 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all select-none active:scale-95 cursor-pointer max-w-[56px] ${
                          isSelected 
                            ? `${m.bg} ${m.color} ring-2 ring-indigo-500/25 border-indigo-300 scale-[1.03] shadow-xs` 
                            : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span className="text-lg">{m.emoji}</span>
                        <span className="text-[8.5px] font-black tracking-wide text-slate-500 dark:text-slate-400 capitalize truncate w-full px-0.5 text-center">{m.value}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Productivity slider indicator */}
              <div className="space-y-2.5 bg-white/40 dark:bg-slate-900/35 border border-slate-100/40 dark:border-slate-850/35 p-4 rounded-3xl text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[11.5px] font-black text-slate-800 dark:text-slate-100 tracking-wide">
                    ⚡ Day Productivity Gauge?
                  </label>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full">
                    {productivity}%
                  </span>
                </div>

                <div className="pt-2.5 pb-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={productivity}
                    onChange={(e) => {
                      setProductivity(Number(e.target.value));
                      handleChangeInput();
                    }}
                    className="w-full accent-indigo-600 dark:accent-indigo-400 h-1.5 bg-slate-150 dark:bg-slate-800 rounded-full appearance-none cursor-pointer outline-none focus:ring-1 focus:ring-indigo-500/30"
                  />
                </div>

                <div className="p-3 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl space-y-0.5">
                  <h5 className="text-[10px] font-extrabold text-slate-700 dark:text-slate-350">{getProductivityLabel(productivity).label}</h5>
                  <p className="text-[9.5px] text-slate-400 dark:text-slate-500 leading-normal font-medium">{getProductivityLabel(productivity).text}</p>
                </div>
              </div>

              {/* Free thoughts text entry */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11.5px] font-black text-slate-800 dark:text-slate-100 tracking-wide block ml-1">
                  ✎ Freeform Thoughts & Reflection
                </label>
                <textarea
                  placeholder="Today went standard. I noticed my flow is cleanest in the early morning..."
                  value={thoughts}
                  onChange={(e) => {
                    setThoughts(e.target.value);
                    handleChangeInput();
                  }}
                  rows={5}
                  className="w-full text-xs p-4 rounded-3xl border border-slate-150 dark:border-slate-850 bg-white/45 dark:bg-slate-950 font-normal leading-relaxed text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all font-sans"
                />
              </div>

              {/* standard Prompt: "What did you handle well?" */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11.5px] font-black text-slate-850 dark:text-slate-200 tracking-wide block ml-1 flex items-center gap-1.5">
                  ✨ What did you handle well? <span className="text-[9.5px] text-slate-400 font-bold">(Optional)</span>
                </label>
                <textarea
                  placeholder="I handled standard interruptions securely and stayed calm when coding..."
                  value={celebrations}
                  onChange={(e) => {
                    setCelebrations(e.target.value);
                    handleChangeInput();
                  }}
                  rows={2}
                  className="w-full text-xs p-3.5 rounded-2.5xl border border-slate-150 dark:border-slate-850 bg-white/45 dark:bg-slate-950 font-normal leading-relaxed text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all font-sans"
                />
              </div>

              {/* standard Prompt: "What do you want to remember from today?" */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11.5px] font-black text-slate-850 dark:text-slate-200 tracking-wide block ml-1 flex items-center gap-1.5">
                  💡 What do you want to remember from today? <span className="text-[9.5px] text-slate-400 font-bold">(Optional)</span>
                </label>
                <textarea
                  placeholder="Patience with dynamic systems is critical. Always double check schema validations..."
                  value={lessons}
                  onChange={(e) => {
                    setLessons(e.target.value);
                    handleChangeInput();
                  }}
                  rows={2}
                  className="w-full text-xs p-3.5 rounded-2.5xl border border-slate-150 dark:border-slate-850 bg-white/45 dark:bg-slate-950 font-normal leading-relaxed text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all font-sans"
                />
              </div>

              {/* Primary action controls buttons */}
              <div className="pt-2 sticky bottom-0 bg-white/5 bg-gradient-to-t from-white dark:from-slate-950 via-white/80 dark:via-slate-950/80 to-transparent py-4 flex gap-3 h-20 items-center justify-end">
                <button
                  type="button"
                  onClick={() => setActiveView('list')}
                  className="py-3 px-5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl text-xs font-black select-none active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  Close Draft
                </button>
                <button
                  type="button"
                  onClick={handleSaveEntry}
                  disabled={saveStatus === 'saving'}
                  className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-2xl text-xs font-black shadow-md select-none active:scale-95 transition-all duration-150 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : <Check className="w-4 h-4" />}
                  <span>Save Journal</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-slate-900/80 dark:bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-950 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 dark:border-slate-900 text-left"
            >
              <div className="space-y-1.5">
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">Delete Journal Entry?</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  Are you absolutely sure you want to delete this standard reflection? This operation cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 rounded-xl bg-slate-50 dark:bg-slate-900 font-extrabold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteEntry(deleteConfirmId)}
                  className="px-4 py-2.5 text-xs text-white bg-rose-600 hover:bg-rose-700 rounded-xl font-extrabold cursor-pointer transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
