import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Search, X, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useInvestments } from '@/context/InvestmentContext';
import { getUserByTag, transferBetweenUsers } from '@/lib/firestoreDb';

interface FoundUser {
  uid: string;
  name: string;
  tag: string;
  initials: string;
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

type Step = 'search' | 'amount';

function today() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Send() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { cashBalance } = useInvestments();

  const [query_, setQuery]    = useState('');
  const [selected, setSelected] = useState<FoundUser | null>(null);
  const [amount, setAmount]   = useState('');
  const [note, setNote]       = useState('');
  const [step, setStep]       = useState<Step>('search');
  const [sent, setSent]       = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<FoundUser | null>(null);
  const [searchError, setSearchError]   = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleQueryChange(val: string) {
    setQuery(val);
    setSearchResult(null);
    setSearchError('');
    if (step === 'amount') { setStep('search'); setSelected(null); }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = val.trim().replace(/^@/, '');
    if (!trimmed) { setSearching(false); return; }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const found = await getUserByTag(trimmed);
        if (!found) {
          setSearchError('No user found with that tag.');
          setSearchResult(null);
        } else if (found.uid === user?.uid) {
          setSearchError("That's your own tag.");
          setSearchResult(null);
        } else {
          setSearchResult({
            uid:      found.uid,
            name:     found.name,
            tag:      `@${found.investxtag?.replace(/^@/, '') ?? trimmed}`,
            initials: getInitials(found.name),
          });
          setSearchError('');
        }
      } catch {
        setSearchError('Search failed. Try again.');
      } finally {
        setSearching(false);
      }
    }, 400);
  }

  function selectUser(u: FoundUser) {
    setSelected(u);
    setQuery(u.tag);
    setStep('amount');
  }

  async function handleSend() {
    if (!selected || !user?.uid) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setSendError('Enter a valid amount.'); return; }
    if (amt > cashBalance)  { setSendError("You don't have enough balance."); return; }

    setSending(true);
    setSendError('');
    try {
      const result = await transferBetweenUsers({
        senderUid:    user.uid,
        recipientTag: selected.tag.replace(/^@/, ''),
        amount:       amt,
        note:         note.trim() || '',
        date:         today(),
      });

      if (!result.success) {
        setSendError(result.error ?? 'Transfer failed.');
        setSending(false);
        return;
      }

      setSent(true);
    } catch {
      setSendError('Transfer failed. Please try again.');
    } finally {
      setSending(false);
    }
  }

  const NAVY = '#070E1C';

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col">
      <div className="px-4 pt-5 pb-2 flex items-center gap-3 bg-white shadow-sm">
        <button onClick={() => setLocation('/app')} className="p-1.5 -ml-1.5 hover:bg-black/10 rounded-full transition-colors">
          <ArrowLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Send Money</h1>
      </div>

      {sent ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Sent!</h2>
          <p className="text-sm text-gray-500 text-center">
            ${parseFloat(amount).toFixed(2)} sent to {selected?.name}.
          </p>
          <button
            onClick={() => { setSent(false); setAmount(''); setNote(''); setQuery(''); setSelected(null); setStep('search'); }}
            className="mt-4 px-6 py-3 rounded-2xl bg-[#1a2744] text-white font-semibold text-sm"
          >
            Send Again
          </button>
          <button onClick={() => setLocation('/app')} className="text-sm text-gray-400 hover:text-gray-600">
            Back to Home
          </button>
        </div>
      ) : (
        <div className="px-4 pt-6 flex flex-col gap-4">
          {/* Balance */}
          <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">Available Balance</span>
            <span className="text-sm font-bold text-gray-900">${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Search */}
          {step === 'search' && (
            <>
              <div className="bg-white rounded-2xl shadow-sm px-4 py-3">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-2">Recipient InvestX Tag</label>
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <input
                    autoFocus
                    value={query_}
                    onChange={e => handleQueryChange(e.target.value)}
                    placeholder="@username"
                    className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
                  />
                  {searching && <Loader2 size={15} className="text-gray-400 animate-spin shrink-0" />}
                  {query_ && !searching && (
                    <button onClick={() => { setQuery(''); setSearchResult(null); setSearchError(''); }} className="text-gray-400">
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {searchError && <p className="text-xs text-red-500 text-center">{searchError}</p>}

              {searchResult && (
                <button
                  onClick={() => selectUser(searchResult)}
                  className="bg-white rounded-2xl shadow-sm px-4 py-3.5 flex items-center gap-3 w-full text-left active:scale-[0.98] transition-transform"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1a2744] flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">{searchResult.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{searchResult.name}</p>
                    <p className="text-xs text-gray-400">{searchResult.tag}</p>
                  </div>
                </button>
              )}
            </>
          )}

          {/* Amount */}
          {step === 'amount' && selected && (
            <>
              <div className="bg-white rounded-2xl shadow-sm px-4 py-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a2744] flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">{selected.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selected.name}</p>
                  <p className="text-xs text-gray-400">{selected.tag}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm px-4 py-4 flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Amount</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-gray-400">$</span>
                  <input
                    autoFocus
                    type="number" min="0"
                    value={amount}
                    onChange={e => { setAmount(e.target.value); setSendError(''); }}
                    placeholder="0.00"
                    className="text-2xl font-bold text-gray-900 outline-none bg-transparent w-full"
                  />
                </div>
                <div className="h-px bg-[#1a4fd6]/20 mt-2" />
              </div>

              <div className="bg-white rounded-2xl shadow-sm px-4 py-4 flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Note (optional)</label>
                <input
                  type="text" value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="What's this for?"
                  className="text-sm text-gray-900 outline-none bg-transparent mt-1 w-full"
                />
              </div>

              {sendError && <p className="text-xs text-red-500 text-center">{sendError}</p>}

              <button
                onClick={handleSend}
                disabled={!amount || parseFloat(amount) <= 0 || sending}
                className="w-full bg-[#1a2744] text-white font-semibold text-sm py-4 rounded-2xl hover:bg-[#1a2744]/90 active:scale-[0.98] transition-all shadow disabled:opacity-40 disabled:pointer-events-none"
              >
                {sending ? 'Sending…' : `Send $${parseFloat(amount || '0').toFixed(2)} to ${selected.name}`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
