import { useState } from 'react';
import { useLocation } from 'wouter';
import { Lock, Eye, EyeOff, ShieldCheck, Mail } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdmin } from '@/lib/firestoreDb';

const NAVY = '#070E1C';
const GOLD = '#D4A017';

export function getAdminKey(): string | null {
  return sessionStorage.getItem('investx_admin_key');
}
export function setAdminKey(key: string) {
  sessionStorage.setItem('investx_admin_key', key);
}
export function clearAdminKey() {
  sessionStorage.removeItem('investx_admin_key');
}

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail]     = useState('');
  const [secret, setSecret]   = useState('');
  const [show, setShow]       = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred    = await signInWithEmailAndPassword(auth, email.trim(), secret);
      const adminOk = await isAdmin(cred.user.uid);
      if (!adminOk) {
        await auth.signOut();
        setError('This account does not have admin access.');
        return;
      }
      setAdminKey(cred.user.uid);
      setLocation('/admin/dashboard');
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #0A1525 60%, #060C1A 100%)` }}>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-white/40 text-sm mt-1">InvestX Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit}
          className="rounded-3xl p-6 space-y-4"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(20px)' }}>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={show ? 'text' : 'password'}
                value={secret}
                onChange={e => setSecret(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-60"
            style={{ background: GOLD, color: NAVY }}>
            {loading ? 'Verifying…' : 'Enter Admin Panel'}
          </button>
        </form>

        <p className="text-center text-xs text-white/20 mt-6 px-4 leading-relaxed">
          To grant admin access, add the user's Firebase UID to the <code className="text-white/40">admins</code> collection in Firestore.
        </p>
      </div>
    </div>
  );
}
