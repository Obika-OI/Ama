import React, { useState } from 'react';
import { X, Mail, Lock, User, ShieldCheck, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  auth,
  googleProvider,
  EmailAuthProvider,
  signInWithPopup,
  linkWithPopup,
  linkWithCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  FirebaseUser
} from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  defaultParentName?: string;
  onAuthSuccess?: (user: FirebaseUser, message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  defaultParentName = '',
  onAuthSuccess
}) => {
  const isAnonymous = !currentUser || currentUser.isAnonymous;
  const [mode, setMode] = useState<'signup' | 'signin' | 'reset'>(isAnonymous ? 'signup' : 'signin');
  const [displayName, setDisplayName] = useState(defaultParentName || currentUser?.displayName || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pendingGoogleFallback, setPendingGoogleFallback] = useState(false);

  if (!isOpen) return null;

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/email-already-in-use' || code === 'auth/credential-already-in-use') {
      return 'An account with this email already exists. Switch to "Sign In" to access your existing backup.';
    }
    if (code === 'auth/invalid-email') {
      return 'Please enter a valid email address.';
    }
    if (code === 'auth/weak-password') {
      return 'Password must be at least 6 characters long.';
    }
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
      return 'Invalid email or password. Please double-check your details or reset your password.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Email/Password sign-in is not enabled yet in Firebase Console. Enable it under Authentication -> Sign-in method -> Email/Password, or use Google Sign-In.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'This domain is not authorized in Firebase Console. Add it under Authentication -> Settings -> Authorized domains.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Sign-in popup was closed before completing. Please try again.';
    }
    return err?.message || 'Authentication failed. Please try again.';
  };

  const handleGoogleAuth = async (forceSignIn = false) => {
    setErrorMsg('');
    setSuccessMsg('');
    setPendingGoogleFallback(false);
    setIsLoading(true);
    try {
      let result;
      if (!forceSignIn && auth.currentUser && auth.currentUser.isAnonymous) {
        result = await linkWithPopup(auth.currentUser, googleProvider);
      } else {
        result = await signInWithPopup(auth, googleProvider);
      }
      const user = result.user;
      setSuccessMsg('Signed in with Google! Your baby care records are now securely linked to your personal account.');
      if (onAuthSuccess) {
        onAuthSuccess(user, 'Google account connected and cloud sync enabled.');
      }
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      if (err?.code === 'auth/credential-already-in-use') {
        setPendingGoogleFallback(true);
        setErrorMsg('This Google account already has a saved Ama Baby backup. Click "Sign In to Existing Google Backup" below to load it.');
      } else {
        setErrorMsg(formatAuthError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (mode === 'reset') {
      setIsLoading(true);
      try {
        await sendPasswordResetEmail(auth, trimmedEmail);
        setSuccessMsg('Password reset link sent! Check your inbox and spam folder.');
      } catch (err: any) {
        setErrorMsg(formatAuthError(err));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      let user: FirebaseUser;
      if (mode === 'signup') {
        if (auth.currentUser && auth.currentUser.isAnonymous) {
          const credential = EmailAuthProvider.credential(trimmedEmail, password);
          const result = await linkWithCredential(auth.currentUser, credential);
          user = result.user;
        } else {
          const result = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          user = result.user;
        }
        if (displayName.trim()) {
          try {
            await updateProfile(user, { displayName: displayName.trim() });
          } catch {}
        }
        try {
          await sendEmailVerification(user);
        } catch {}
        setSuccessMsg('Personal account created! A verification email has been sent, and your data is now synced.');
        if (onAuthSuccess) {
          onAuthSuccess(user, 'Personal email account created and linked.');
        }
      } else {
        const result = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        user = result.user;
        setSuccessMsg('Welcome back! Your cloud care journal is syncing.');
        if (onAuthSuccess) {
          onAuthSuccess(user, 'Signed in with email and password.');
        }
      }
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-[32px] w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-7 relative text-left"
          initial={{ scale: 0.95, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 16 }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer border-none transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="mb-5 pr-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAnonymous ? 'Upgrade Guest Session' : 'Personal Account'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-gray-900">
              {mode === 'signup'
                ? isAnonymous
                  ? 'Personalize Your Account'
                  : 'Create Personal Account'
                : mode === 'signin'
                ? 'Sign In to Ama Baby'
                : 'Reset Your Password'}
            </h2>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {isAnonymous
                ? 'You are currently using a temporary device session. Link an email/password or Google account to keep your baby logs safe across devices, join Community, and sync Village Mode.'
                : 'Sign in with Email/Password or Google to access your encrypted cloud backup and community profile.'}
            </p>
          </div>

          {/* Google Sign-In Button */}
          {mode !== 'reset' && (
            <div className="mb-5 space-y-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleGoogleAuth(false)}
                className="w-full py-3 px-4 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60 shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>{isAnonymous ? 'Link & Continue with Google' : 'Continue with Google'}</span>
              </button>

              {pendingGoogleFallback && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleGoogleAuth(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-xs cursor-pointer border-none"
                >
                  Sign In to Existing Google Backup
                </button>
              )}

              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">or with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </div>
          )}

          {/* Mode Tabs */}
          {mode !== 'reset' && (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-2xl mb-4">
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`py-2 rounded-xl text-xs font-bold border-none cursor-pointer transition-all ${
                  mode === 'signup' ? 'bg-white text-gray-900 shadow-xs' : 'bg-transparent text-gray-600'
                }`}
              >
                {isAnonymous ? 'Upgrade Account' : 'Create Account'}
              </button>
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`py-2 rounded-xl text-xs font-bold border-none cursor-pointer transition-all ${
                  mode === 'signin' ? 'bg-white text-gray-900 shadow-xs' : 'bg-transparent text-gray-600'
                }`}
              >
                Sign In
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1 pl-1">
                  Your Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Amara Okafor"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1 pl-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1 pl-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1 pl-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-md shadow-primary/20 disabled:opacity-60 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Securing Account...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'signup'
                      ? isAnonymous
                        ? 'Save & Personalize Account'
                        : 'Create Account'
                      : mode === 'signin'
                      ? 'Sign In'
                      : 'Send Reset Email'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            {mode === 'signin' ? (
              <button
                type="button"
                onClick={() => { setMode('reset'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs font-bold text-primary hover:underline bg-transparent border-none cursor-pointer"
              >
                Forgot your password?
              </button>
            ) : mode === 'reset' ? (
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs font-bold text-primary hover:underline bg-transparent border-none cursor-pointer"
              >
                Back to Sign In
              </button>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
