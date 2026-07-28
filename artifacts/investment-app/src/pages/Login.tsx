import { useState } from 'react';
import { useLocation } from 'wouter';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, X } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';
import { useAuth } from '@/context/AuthContext';
import { initUserDoc } from '@/lib/firestoreDb';
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const G    = '#D4A017';
const NAVY = '#070E1C';

export default function Login() {
  const [, setLocation] = useLocation();
  const { signIn } = useAuth();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!password)     { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      setLocation('/app');
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.');
      } else if (code === 'auth/user-disabled') {
        setError('Account suspended. Contact support.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result   = await signInWithPopup(auth, provider);
      await initUserDoc(result.user.uid, {
        name:  result.user.displayName ?? result.user.email?.split('@')[0] ?? 'User',
        email: result.user.email ?? '',
      });
      setLocation('/app');
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #0A1525 60%, #060C1A 100%)` }}
    >
      {/* Back */}
      <div className="px-4 pt-5">
        <button
          onClick={() => setLocation('/')}
          className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-10">
        <div className="mb-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `linear-gradient(135deg, ${G}, #B8860B)` }}>
            <span className="text-white font-black text-xl">X</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
          <p className="text-white/40 text-sm">Sign in to your InvestX account</p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl px-4 py-3 text-sm font-medium" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-11 py-3.5 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-sm font-bold text-[#070E1C] transition-all active:scale-[0.98] disabled:opacity-60 mt-2"
            style={{ background: `linear-gradient(135deg, ${G}, #B8860B)` }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <SiGoogle size={16} style={{ color: '#4285F4' }} />
          Continue with Google
        </button>

        <p className="text-center text-sm text-white/40 mt-8">
          Don't have an account?{' '}
          <button onClick={() => setLocation('/signup')} className="text-white font-semibold hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
