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

export default function AuthScreen() {
  const { login, signup, resetPassword } = useAuth();
  
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
    let title = 'Welcome to Tracktion';
    let subtitle = 'Sustain streaks, elevate habits';
    if (activeTab === 'signup') {
      title = 'Shape your Identity';
      subtitle = 'Join to log your accomplishments';
    } else if (activeTab === 'forgot_password') {
      title = 'Retrieve Password';
      subtitle = 'Recover your streak dashboard';
    }

    return (
      <div className="text-center space-y-2 mt-4">
        <div className="h-14 w-14 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto relative group">
          <div className="absolute inset-0 bg-indigo-500 rounded-3xl blur-md opacity-40 group-hover:opacity-60 transition-all duration-300" />
          <Flame className="w-8 h-8 text-white relative z-10 animate-pulse-glow" />
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
                  {activeTab === 'login' ? 'Authenticate' : activeTab === 'signup' ? 'Create Account' : 'Dispatch Email'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Tab triggers footer */}
        {activeTab !== 'forgot_password' && (
          <div className="text-center pt-2">
            <span className="text-xs text-slate-400 font-semibold">
              {activeTab === 'login' ? "New around here? " : "Already tracking habits? "}
            </span>
            <button
              type="button"
              onClick={() => toggleTab(activeTab === 'login' ? 'signup' : 'login')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-extrabold tracking-tight transition-all"
            >
              {activeTab === 'login' ? 'Sign Up Free' : 'Sign In'}
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
