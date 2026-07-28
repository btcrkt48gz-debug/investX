import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserData, updateUserProfile } from '@/lib/firestoreDb';

export default function EditInvestXTag() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [tag, setTag]         = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getUserData(user.uid)
      .then(data => { if (data?.investxtag) setTag(data.investxtag); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  async function handleSave() {
    if (!user) return;
    const trimmed   = tag.trim();
    if (!trimmed)   { setError('Tag cannot be empty.'); return; }
    const formatted = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
    if (!/^@[a-zA-Z0-9_]{3,20}$/.test(formatted)) {
      setError('Tag must be 3–20 characters: letters, numbers, or underscores.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateUserProfile(user.uid, { investxtag: formatted });
      setLocation('/profile/my-profile');
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f7] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#1a4fd6] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col">
      <div className="px-4 pt-5 pb-2 flex items-center gap-3">
        <button onClick={() => setLocation('/profile/my-profile')} className="p-1.5 -ml-1.5 hover:bg-black/10 rounded-full transition-colors">
          <ArrowLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Edit InvestX Tag</h1>
      </div>

      <div className="px-5 pt-8 flex flex-col gap-6">
        <p className="text-sm text-gray-500">
          Your InvestX Tag is your unique handle that others can use to send you money. You can change it at any time.
        </p>

        <div className="bg-white rounded-2xl shadow-sm px-4 py-4 flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">InvestX Tag</label>
          <input
            autoFocus
            value={tag}
            onChange={e => { setTag(e.target.value); setError(''); }}
            placeholder="@yourtag"
            className="text-base font-semibold text-gray-900 outline-none bg-transparent mt-1 w-full"
          />
          <div className="h-px bg-[#1a4fd6]/30 mt-2" />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#1a2744] text-white font-semibold text-sm py-4 rounded-2xl hover:bg-[#1a2744]/90 active:scale-[0.98] transition-all shadow disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
