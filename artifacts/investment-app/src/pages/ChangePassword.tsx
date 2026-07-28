import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';

export default function ChangePassword() {
  const [, setLocation] = useLocation();
  const { firebaseUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState(false);
  const [loading, setLoading]                 = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!currentPassword) { setError('Enter your current password.'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!firebaseUser?.email) { setError('Not logged in.'); return; }

    setLoading(true);
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      // Then update password
      await updatePassword(firebaseUser, newPassword);
      setSuccess(true);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Current password is incorrect.');
      } else if (code === 'auth/weak-password') {
        setError('New password is too weak. Use at least 6 characters.');
      } else {
        setError('Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col">
      <div className="px-4 pt-5 pb-2 flex items-center gap-3">
        <button onClick={() => setLocation('/profile')} className="p-1.5 -ml-1.5 hover:bg-black/10 rounded-full transition-colors">
          <ArrowLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Change Password</h1>
      </div>

      {success ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center">Password updated!</h2>
          <p className="text-sm text-gray-500 text-center">Your password has been changed successfully.</p>
          <button
            onClick={() => setLocation('/profile')}
            className="mt-4 w-full max-w-xs py-3.5 rounded-2xl bg-[#1a2744] text-white font-semibold text-sm"
          >
            Back to Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-5 pt-6 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {/* Current Password */}
            <div className="px-4 py-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full text-sm text-gray-900 placeholder-gray-400 bg-gray-50 rounded-xl px-4 py-3 pr-11 outline-none focus:ring-2 focus:ring-[#1a2744]/20 border border-gray-100"
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="px-4 py-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full text-sm text-gray-900 placeholder-gray-400 bg-gray-50 rounded-xl px-4 py-3 pr-11 outline-none focus:ring-2 focus:ring-[#1a2744]/20 border border-gray-100"
                />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="px-4 py-4">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full text-sm text-gray-900 placeholder-gray-400 bg-gray-50 rounded-xl px-4 py-3 pr-11 outline-none focus:ring-2 focus:ring-[#1a2744]/20 border border-gray-100"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center px-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#1a2744] text-white font-semibold text-sm disabled:opacity-60 mt-2"
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}
