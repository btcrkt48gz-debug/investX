import { useState } from 'react';
import { useLocation } from 'wouter';
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock, Check, Phone, Calendar, X } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';
import { useAuth } from '@/context/AuthContext';
import { initUserDoc } from '@/lib/firestoreDb';

const G    = '#D4A017';
const NAVY = '#070E1C';

function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score  = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#ef4444', '#f97316', '#3b82f6', '#22c55e'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : 'rgba(255,255,255,0.12)' }} />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color: colors[score] || 'rgba(255,255,255,0.4)' }}>
        {labels[score]}
      </p>
    </div>
  );
}

export default function Signup() {
  const [, setLocation] = useLocation();
  const { signUp } = useAuth();
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [dob, setDob]             = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed]       = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim())                                                    { setError('Please enter your full name.'); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))     { setError('Please enter a valid email address.'); return; }
    if (password.length < 8)                                             { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPw)                                          { setError('Passwords do not match.'); return; }
    if (!agreed)                                                         { setError('Please agree to the Terms and Privacy Policy.'); return; }
    setLoading(true);
    const fbUser = await signUp(
  email.trim(),
  password,
  name.trim()
);
    // Register with API server (best-effort — falls back to local-only)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, name: name.trim(), email: email.trim(), password, phone: phone.trim(), dob }),
      });
      if (res.ok) {
        const data = await res.json() as { token?: string };
        signIn(user, data.token);
        await initUserDoc(uid, { name: name.trim(), email: email.trim(), phone: phone.trim(), dob });
        setLoading(false);
        setLocation('/app');
        return;
      }
      // Server rejected (e.g. duplicate email) — show error
      const body = await res.json().catch(() => ({})) as { message?: string };
      setError(body.message ?? 'Registration failed. Please try again.');
      setLoading(false);
      return;
    } catch { /* API offline — continue with local-only account */ }
    signIn(user);
    await initUserDoc(uid, { name: name.trim(), email: email.trim(), phone: phone.trim(), dob });
    setLoading(false);
    setLocation('/app');
  }

  // ── Google modal state ──────────────────────────────────────────────────────
  const [googleOpen, setGoogleOpen]   = useState(false);
  const [gName, setGName]             = useState('');
  const [gEmail, setGEmail]           = useState('');
  const [gError, setGError]           = useState('');
  const [gLoading, setGLoading]       = useState(false);

  async function handleGoogleContinue() {
    setGError('');
    if (!gName.trim())                                                  { setGError('Please enter your full name.'); return; }
    if (!gEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gEmail)) { setGError('Please enter a valid email address.'); return; }
    setGLoading(true);
    const uid = `google_${btoa(gEmail.trim()).replace(/=/g, '')}`;
    const user = { uid, displayName: gName.trim(), email: gEmail.trim() };
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, name: gName.trim(), email: gEmail.trim(), password: uid, phone: '', dob: '' }),
      });
      if (res.ok) {
        const data = await res.json() as { token?: string };
        signIn(user, data.token);
        await initUserDoc(uid, { name: gName.trim(), email: gEmail.trim() });
        setGLoading(false);
        setLocation('/app');
        return;
      }
      const body = await res.json().catch(() => ({})) as { message?: string };
      setGError(body.message ?? 'Could not create account. Try a different email.');
      setGLoading(false);
      return;
    } catch { /* API offline */ }
    signIn(user);
    await initUserDoc(uid, { name: gName.trim(), email: gEmail.trim() });
    setGLoading(false);
    setLocation('/app');
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #0A1525 50%, #060C1A 100%)` }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(212,160,23,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,23,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      <div className="relative z-10 px-5 pt-12">
        <button onClick={() => setLocation('/')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-5 py-10">
        <div className="mb-7 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-5 shadow-xl shadow-black/30">
            <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
              <path d="M3 15L9 3l6 12" stroke={NAVY} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Create account</h1>
          <p className="text-white/50 text-sm">Start investing smarter today</p>
        </div>

        <div className="rounded-3xl p-6 w-full max-w-sm mx-auto" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(20px)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Morgan" autoComplete="name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  onFocus={e => { e.target.style.borderColor = G; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  onFocus={e => { e.target.style.borderColor = G; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Phone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 0100" autoComplete="tel"
                    className="w-full pl-10 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                    onFocus={e => { e.target.style.borderColor = G; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Date of Birth</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)} autoComplete="bday"
                    className="w-full pl-10 pr-3 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', colorScheme: 'dark' }}
                    onFocus={e => { e.target.style.borderColor = G; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  onFocus={e => { e.target.style.borderColor = G; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <StrengthBar password={password} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showConfirm ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter password" autoComplete="new-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: confirmPw && password !== confirmPw ? '1px solid rgba(239,68,68,0.6)' : confirmPw && password === confirmPw ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.12)',
                  }}
                  onFocus={e => { if (!confirmPw) e.target.style.borderColor = G; }}
                  onBlur={e => { if (!confirmPw) e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }} />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {confirmPw && password === confirmPw && <Check size={14} className="text-green-400" />}
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-white/40 hover:text-white/70 transition-colors">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <div onClick={() => setAgreed(v => !v)} className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all"
                style={{ background: agreed ? G : 'rgba(255,255,255,0.08)', border: agreed ? `1.5px solid ${G}` : '1.5px solid rgba(255,255,255,0.2)' }}>
                {agreed && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1.5" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className="text-sm text-white/50 leading-snug">
                I agree to the{' '}<span className="font-semibold" style={{ color: G }}>Terms of Service</span>{' '}and{' '}<span className="font-semibold" style={{ color: G }}>Privacy Policy</span>
              </span>
            </label>

            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 mt-1" style={{ background: G, color: NAVY }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-xs text-white/30 font-medium">or sign up with</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <button type="button" onClick={() => { setGoogleOpen(true); setGName(''); setGEmail(''); setGError(''); }}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; }}>
            <SiGoogle size={17} /> Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Already have an account?{' '}
          <button onClick={() => setLocation('/login')} className="font-bold transition-colors" style={{ color: G }}>Sign in</button>
        </p>
      </div>

      {/* ── Google sign-up modal ────────────────────────────────────────────── */}
      {googleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setGoogleOpen(false); }}>
          <div className="w-full max-w-sm rounded-3xl p-6 shadow-2xl" style={{ background: '#fff' }}>
            {/* Google header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <SiGoogle size={20} style={{ color: '#4285F4' }} />
                <span className="text-[15px] font-bold text-gray-800">Sign up with Google</span>
              </div>
              <button onClick={() => setGoogleOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <X size={15} className="text-gray-500" />
              </button>
            </div>

            <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">
              Enter the name and email address associated with your Google account to continue.
            </p>

            {gError && (
              <div className="rounded-xl px-3 py-2.5 text-[12px] font-medium mb-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}>
                {gError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={gName} onChange={e => setGName(e.target.value)}
                    placeholder="Alex Morgan" autoComplete="name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[13px] text-gray-800 placeholder-gray-400 outline-none border border-gray-200 focus:border-blue-400 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={gEmail} onChange={e => setGEmail(e.target.value)}
                    placeholder="you@gmail.com" autoComplete="email"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[13px] text-gray-800 placeholder-gray-400 outline-none border border-gray-200 focus:border-blue-400 transition-colors" />
                </div>
              </div>
            </div>

            <button type="button" disabled={gLoading} onClick={handleGoogleContinue}
              className="w-full mt-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: '#4285F4' }}>
              {gLoading ? 'Creating account…' : 'Continue'}
            </button>

            <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
              By continuing, you agree to InvestX's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
