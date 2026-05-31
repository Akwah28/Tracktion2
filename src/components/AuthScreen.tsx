import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import firebaseConfig from '../../firebase-applet-config.json';
import { TracktionLogo } from './TracktionLogo';

export default function AuthScreen() {
  const { login, signup, resetPassword, loginWithGoogle } = useAuth();
  
  // Tab states: 'login' | 'signup' | 'forgot_password'
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot_password'>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI status states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMessage('Successfully connected via Google! Welcome to Tracktion.');
    } catch (err: any) {
      console.error(err);
      const code = err?.code;
      const msg = err?.message || '';
      if (code === 'auth/popup-closed-by-user' || msg.includes('auth/popup-closed-by-user')) {
        setError('Google Sign-In popup was closed before completion.');
      } else if (code === 'auth/cancelled-popup-request' || msg.includes('auth/cancelled-popup-request')) {
        setError('Authentication request cancelled.');
      } else {
        setError(err?.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Simple form validations
  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Common checks
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please provide a valid email address');
      return;
    }

    if (activeTab === 'forgot_password') {
      setLoading(true);
      try {
        await resetPassword(email.trim());
        setSuccessMessage('A reset link has been dispatched to your email.');
        // Clean fields
        setEmail('');
      } catch (err: any) {
        console.error(err);
        const code = err?.code;
        const msg = err?.message || '';
        if (code === 'auth/user-not-found' || msg.includes('auth/user-not-found')) {
          setError('No user is registered with this email address.');
        } else if (code === 'auth/operation-not-allowed' || msg.includes('auth/operation-not-allowed')) {
          setError('EMAIL_PASS_DISABLED');
        } else {
          setError(err?.message || 'Failed to dispatch resetting mail.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // Password checks for Auth
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must feature at least 6 characters');
      return;
    }

    if (activeTab === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      setLoading(true);
      try {
        await signup(email.trim(), password);
        setSuccessMessage('Account registered successfully! Prepare for Onboarding.');
      } catch (err: any) {
        console.error(err);
        const code = err?.code;
        const msg = err?.message || '';
        if (code === 'auth/email-already-in-use' || msg.includes('auth/email-already-in-use')) {
          setError('EMAIL_ALREADY_IN_USE');
        } else if (code === 'auth/invalid-email' || msg.includes('auth/invalid-email')) {
          setError('The format of your email address is invalid.');
        } else if (code === 'auth/weak-password' || msg.includes('auth/weak-password')) {
          setError('The password chosen is too weak. Must be at least 6 characters.');
        } else if (code === 'auth/operation-not-allowed' || msg.includes('auth/operation-not-allowed')) {
          setError('EMAIL_PASS_DISABLED');
        } else {
          setError(err?.message || 'Failed to register account.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Login
      setLoading(true);
      try {
        await login(email.trim(), password);
      } catch (err: any) {
        console.error(err);
        const code = err?.code;
        const msg = err?.message || '';
        if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential' || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) {
          setError('Invalid login credentials, please check spelling or password.');
        } else if (code === 'auth/too-many-requests' || msg.includes('auth/too-many-requests')) {
          setError('Too many failed login attempts. This account has been temporarily locked.');
        } else if (code === 'auth/operation-not-allowed' || msg.includes('auth/operation-not-allowed')) {
          setError('EMAIL_PASS_DISABLED');
        } else {
          setError(err?.message || 'Failed to authenticate user.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleTab = (tab: 'login' | 'signup' | 'forgot_password') => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const renderWelcomeHeader = () => {
    let title = 'Welcome back, friend';
    let subtitle = "Take a breath. Let's cultivate your alignment today.";
    if (activeTab === 'signup') {
      title = 'Begin your journey';
      subtitle = 'We are here to help you stay honest, steady, and capable.';
    } else if (activeTab === 'forgot_password') {
      title = 'Restore your space';
      subtitle = 'Get back to alignment and consistency.';
    }

    return (
      <div className="text-center space-y-2 mt-4">
        <div className="relative group flex justify-center">
          <TracktionLogo size={64} className="hover:scale-110 transition-transform duration-300" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 font-semibold">{subtitle}</p>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 overflow-y-auto no-scrollbar relative z-10">
      
      {/* Header Back button for Forgot Password */}
      <div className="h-8 flex items-center justify-start">
        {activeTab === 'forgot_password' && (
          <button 
            type="button"
            onClick={() => toggleTab('login')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-bold transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Sign In
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6 max-w-sm mx-auto w-full">
        {renderWelcomeHeader()}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {error && (
              error === 'EMAIL_PASS_DISABLED' ? (
                <motion.div
                  key="error-box-disabled"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-2xl bg-amber-50/95 border border-amber-300 flex flex-col gap-3 text-xs text-amber-900 font-medium shadow-xs"
                >
                  <div className="flex gap-2.5 items-start">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-xs text-amber-950 uppercase tracking-wider">Email/Password Sign-In Disabled</h4>
                      <p className="mt-1 text-[11px] text-amber-800 leading-snug font-semibold">
                        This Firebase project's Email/Password auth provider is not active yet in the Firebase Console.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-amber-100/60 rounded-xl p-3 space-y-1.5 text-[11px] text-slate-800 border border-amber-200/70">
                    <p className="font-extrabold uppercase tracking-widest text-[9px] text-amber-800">Troubleshooting Steps:</p>
                    <ol className="list-decimal pl-4 space-y-1 text-[11px] font-medium leading-tight text-amber-950">
                      <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline text-indigo-700 font-bold hover:text-indigo-900">Firebase Console</a></li>
                      <li>Select your project <code className="bg-white/70 px-1 rounded text-red-650 font-bold">{firebaseConfig.projectId}</code></li>
                      <li>Access your <b>Authentication</b> panel from the sidebar</li>
                      <li>In the <b>Sign-in method</b> tab, click or edit the <b>Email/Password</b> provider</li>
                      <li>Flip the switch to <b>Enabled</b> and hit <b>Save</b>!</li>
                    </ol>
                  </div>
                </motion.div>
              ) : error === 'EMAIL_ALREADY_IN_USE' ? (
                <motion.div
                  key="error-box-exists"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/50 flex flex-col gap-2.5 text-xs text-rose-700 font-medium shadow-xs"
                >
                  <div className="flex gap-2.5 items-start">
                    <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="leading-snug">This email address is already registered to another account.</p>
                      <button
                        type="button"
                        onClick={() => toggleTab('login')}
                        className="mt-1.5 text-[11px] text-indigo-700 hover:text-indigo-950 font-extrabold flex items-center gap-1 transition-all group"
                      >
                        Sign in with this email instead <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="error-box"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/50 flex gap-2.5 items-start text-xs text-rose-700 font-medium shadow-xs"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <p className="leading-snug">{error}</p>
                </motion.div>
              )
            )}

            {successMessage && (
              <motion.div
                key="success-box"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/50 flex gap-2.5 items-start text-xs text-emerald-700 font-medium shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="leading-snug">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full frosted-input rounded-2xl py-3 pl-11 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            </div>
          </div>

          {/* Password fields - if not forgot tab */}
          {activeTab !== 'forgot_password' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Password</label>
                  {activeTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => toggleTab('forgot_password')}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold tracking-tight transition-all"
                    >
                      Forgot Your Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 characters"
                    className="w-full frosted-input rounded-2xl py-3 pl-11 pr-11 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-all"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {activeTab === 'signup' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat account password"
                      className="w-full frosted-input rounded-2xl py-3 pl-11 pr-11 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mt-4 border border-slate-950 hover:bg-slate-800"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>
                  {activeTab === 'login' ? 'Restore Rhythm' : activeTab === 'signup' ? 'Begin My Path' : 'Send Restorative Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {activeTab !== 'forgot_password' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none">OR CONTINUE WITH</span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/55 font-bold py-3.5 px-6 rounded-2xl shadow-xs transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Google Account</span>
            </button>
          </div>
        )}

        {/* Tab triggers footer */}
        {activeTab !== 'forgot_password' && (
          <div className="text-center pt-2">
            <span className="text-xs text-slate-400 font-semibold">
              {activeTab === 'login' ? "First time here? " : "Returning to your practice? "}
            </span>
            <button
              type="button"
              onClick={() => toggleTab(activeTab === 'login' ? 'signup' : 'login')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-extrabold tracking-tight transition-all"
            >
              {activeTab === 'login' ? 'Create a Free Space' : 'Restore My Session'}
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] text-slate-400 text-center font-bold tracking-tight uppercase select-none">
        Secure Auth Powered by Firebase
      </div>
    </div>
  );
}
