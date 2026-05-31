import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  User, 
  Target, 
  Sparkles, 
  Check, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  LogOut, 
  ChevronRight,
  Upload,
  Trophy,
  Flame,
  Award,
  Volume2,
  VolumeX
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage, auth, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, Goal } from '../types';
import { CATEGORIES } from '../sampleData';
import { ThemeToggle } from './ThemeToggle';
import { playCompletionSound } from '../utils/soundEffects';

interface ProfileSettingsProps {
  profile: UserProfile;
  goals: Goal[];
  onResetApp: () => void;
  onLoadSample: () => void;
}

export default function ProfileSettings({ 
  profile, 
  goals,
  onResetApp,
  onLoadSample 
}: ProfileSettingsProps) {
  // Input fields
  const [name, setName] = useState(profile.name);
  const [preferredCategory, setPreferredCategory] = useState(profile.preferredCategory || 'Productivity');
  const [weeklyGoalCount, setWeeklyGoalCount] = useState(profile.weeklyGoalCount || 3);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [avatarSeed, setAvatarSeed] = useState(profile.avatarSeed);
  const [soundEnabled, setSoundEnabled] = useState(profile.soundEnabled ?? true);

  // States
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Image upload elements
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Stats calculation
  const habitsCount = goals.length;
  const completedHabitsCount = goals.filter(g => g.currentValue >= g.targetValue).length;

  // File type and size constraints
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_SIZE_MB = 2;

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a PNG, JPG, GIF or WEBP image.');
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`File too large. Maximum size allowed is ${MAX_SIZE_MB}MB.`);
      return false;
    }
    setUploadError(null);
    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUploadProcess(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleUploadProcess(file);
    }
  };

  const handleUploadProcess = async (file: File) => {
    if (!validateFile(file)) return;

    // Show instant browser preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setUploadError("You must be logged in to upload assets.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create Firebase Storage reference under users/{uid}/avatar
      const fileExtension = file.name.split('.').pop() || 'png';
      const storageRef = ref(storage, `users/${currentUser.uid}/avatar_${Date.now()}.${fileExtension}`);
      
      // Execute upload
      const snapshot = await uploadBytes(storageRef, file);
      
      // Extract downloadable URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      setAvatarUrl(downloadUrl);
      
      // Update seed placeholder to a camera identifier so they know custom picture is active
      setAvatarSeed('📸');
    } catch (error: any) {
      console.error('Storage upload error:', error);
      setUploadError('Failed to upload image. Falling back to base64 preview.');
      
      // Elegant failover: Fallback safely using base64 preview URL to guarantee user satisfaction
      if (previewUrl) {
        setAvatarUrl(previewUrl);
        setAvatarSeed('📸');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const cleanUploadError = () => setUploadError(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Name length and validation
    if (!name.trim()) {
      setSaveError('Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updatedProfile: UserProfile = {
        ...profile,
        name: name.trim(),
        avatarSeed: avatarSeed,
        avatarUrl: avatarUrl || undefined,
        preferredCategory: preferredCategory,
        weeklyGoalCount: weeklyGoalCount,
        soundEnabled: soundEnabled,
      };

      // Set the updated document structure inside users/{uid}
      await setDoc(doc(db, 'users', currentUser.uid), updatedProfile);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Save profile error:', error);
      try {
        handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
      } catch (err: any) {
        setSaveError('Failed to persist secure database changes.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 space-y-6 max-w-md mx-auto">
      
      {/* Title block */}
      <div className="pb-1">
        <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider block">Identity Manager</span>
        <h2 className="text-xl font-extrabold text-slate-800">Account Profile</h2>
        <p className="text-[11px] text-slate-400 mt-0.5">Edit tracking indicators & visual preferences</p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-5">
        
        {/* Profile picture upload container */}
        <div className="frosted-card p-5 rounded-3xl space-y-4">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Profile Portrait</span>
          
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Visual Avatar frame */}
            <div className="relative group">
              <div className="h-24 w-24 bg-indigo-50 border-4 border-white ring-4 ring-indigo-55/15 rounded-3xl flex items-center justify-center overflow-hidden shadow-md relative">
                {avatarUrl || previewUrl ? (
                  <img 
                    src={avatarUrl || previewUrl || undefined} 
                    alt="User Portrait" 
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">{avatarSeed}</span>
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-slate-900/65 flex items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Upload Trigger overlay circle */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-90 text-white shadow-md transition-all border border-white z-10"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden Input reference */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Drag and Drop Zone overlay */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50/40' 
                  : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
              <p className="text-[10px] font-bold text-slate-600">Drag your portrait here, or <span className="text-indigo-600 hover:underline">browse</span></p>
              <p className="text-[9px] text-slate-450 mt-0.5">Supports PNG, JPG, WEBP up to 2MB</p>
            </div>

            {/* Upload feedback errors */}
            <AnimatePresence>
              {uploadError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl p-3 text-rose-700"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <div className="text-[10px] font-bold leading-tight min-w-0">
                    <p>{uploadError}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={cleanUploadError} 
                    className="ml-auto text-[10px] hover:underline"
                  >
                    Clear
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input parameters card */}
        <div className="frosted-card p-5 rounded-3xl space-y-4">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Identity Fields</span>

          {/* User display name */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-550 font-bold block flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Display Username
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 48))}
              placeholder="e.g. John Doe"
              maxLength={48}
              required
              className="w-full text-xs font-bold leading-none p-3.5 bg-slate-50/50 hover:bg-slate-55 dark:bg-slate-900/50 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
            />
          </div>

          {/* Main category focus selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-550 dark:text-slate-400 font-bold block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Main Habit Theme Focus
            </label>
            <select
              value={preferredCategory}
              onChange={(e) => setPreferredCategory(e.target.value)}
              className="w-full text-xs font-bold leading-none p-3.5 bg-slate-50/50 hover:bg-slate-55 dark:bg-slate-900/50 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 appearance-none cursor-pointer"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.name} value={cat.name} className="dark:bg-slate-900">{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Weekly goals targets */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-550 dark:text-slate-400 font-bold block flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-slate-400" /> Target Habits per Week
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                min={1}
                max={20}
                value={weeklyGoalCount}
                onChange={(e) => setWeeklyGoalCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="w-24 text-xs font-bold leading-none p-3.5 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/50 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 text-center"
              />
              <span className="text-[10px] text-slate-400 font-medium">Currently building <span className="text-slate-700 dark:text-slate-300 font-extrabold">{habitsCount} habits</span> this week</span>
            </div>
          </div>
        </div>

        {/* Visual Theme Selection card */}
        <div className="frosted-card p-5 rounded-3xl space-y-3 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase tracking-wider">Visual Space</h4>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Customize your consistency interface</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Gamification Sound Effects toggler */}
        <div className="frosted-card p-5 rounded-3xl space-y-3 flex items-center justify-between">
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-405" />
              )}
              <span>Gamification Audio</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Sound feedback on completions & streak milestones</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const nextState = !soundEnabled;
              setSoundEnabled(nextState);
              if (nextState) {
                // Play feedback audio trigger
                setTimeout(() => {
                  try { playCompletionSound(); } catch (e) {}
                }, 100);
              }
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              soundEnabled ? 'bg-indigo-600' : 'bg-slate-205 dark:bg-slate-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Action Buttons persistence */}
        <div className="space-y-3">
          {saveError && (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-750 p-3 rounded-2xl text-[10px] font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{saveError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-extrabold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 transition-all shadow-md active:scale-98 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Anchoring changes...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Your practice parameters are updated!</span>
              </>
            ) : (
              <span>Honor My Updates</span>
            )}
          </button>
        </div>

      </form>

      {/* Habits Progress metrics card */}
      <div className="frosted-card p-5 rounded-3xl space-y-3.5">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Completed Tracktion</span>
        
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3.5 rounded-2xl bg-white/45 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/55 shadow-xs">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Completed Routine</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">{completedHabitsCount} / {habitsCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/45 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/55 shadow-xs">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Weekly Performance</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">
              {weeklyGoalCount > 0 ? `${Math.round((habitsCount / weeklyGoalCount) * 100)}%` : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Reset options */}
      <div className="frosted-card p-5 rounded-3xl space-y-3.5">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Traction Diagnostics</h4>
        
        <button
          type="button"
          onClick={onLoadSample}
          className="w-full flex items-center justify-between p-3.5 text-xs text-indigo-700 hover:text-indigo-800 bg-indigo-50/25 active:bg-indigo-50/45 rounded-2xl transition-all border border-indigo-200/50 backdrop-blur-xs cursor-pointer"
        >
          <span className="font-bold flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Reset to Sarah Jenkins Record
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onResetApp}
          className="w-full flex items-center justify-between p-3.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50/20 active:bg-rose-50/40 rounded-2xl transition-all border border-rose-200/25 backdrop-blur-xs cursor-pointer"
        >
          <span className="font-bold flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Reset Application Workspace
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Version branding */}
      <div className="text-center space-y-1 py-4">
        <span className="text-[10px] text-indigo-500 font-extrabold uppercase tracking-widest block">Tracktion App v1.5.0</span>
        <p className="text-[10px] text-slate-400 font-medium">Engineered with secure sub-resource Firestore mapping.</p>
      </div>

    </div>
  );
}
