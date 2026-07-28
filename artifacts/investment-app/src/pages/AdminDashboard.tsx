import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  Search, Users, DollarSign, TrendingUp, UserCheck, LogOut,
  ChevronRight, RefreshCw, CreditCard, Clock, CheckCircle2, XCircle,
} from 'lucide-react';
import { getAdminKey, clearAdminKey } from './AdminLogin';
import {
  getAllUsers, getAllGiftCards, updateGiftCard, creditUser,
  type UserProfile, type GiftCardSubmission,
} from '@/lib/firestoreDb';

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function timeAgo(ts: number | string) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

type Tab = 'users' | 'giftcards';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>('users');

  const [users, setUsers]     = useState<UserProfile[]>([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [giftCards, setGiftCards]     = useState<GiftCardSubmission[]>([]);
  const [gcLoading, setGcLoading]     = useState(false);
  const [gcError, setGcError]         = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const adminKey = getAdminKey();

  const fetchUsers = useCallback(async () => {
    if (!adminKey) { setLocation('/admin'); return; }
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data.sort((a, b) => b.createdAt - a.createdAt));
    } catch {
      setError('Could not load users.');
    } finally {
      setLoading(false);
    }
  }, [adminKey, setLocation]);

  const fetchGiftCards = useCallback(async () => {
    if (!adminKey) { setLocation('/admin'); return; }
    setGcLoading(true);
    setGcError('');
    try {
      const data = await getAllGiftCards();
      setGiftCards(data);
    } catch {
      setGcError('Could not load gift card submissions.');
    } finally {
      setGcLoading(false);
    }
  }, [adminKey, setLocation]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { if (tab === 'giftcards') fetchGiftCards(); }, [tab, fetchGiftCards]);

  async function reviewGiftCard(id: string, status: 'approved' | 'rejected') {
    setReviewingId(id);
    try {
      const sub = giftCards.find(g => g.id === id);
      if (!sub) return;
      await updateGiftCard(id, { status, reviewedAt: new Date().toISOString() });
      if (status === 'approved') {
        await creditUser(sub.uid, sub.amount, `Gift card approved: ${sub.cardLabel} ($${sub.amount})`);
      }
      await fetchGiftCards();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setReviewingId(null);
    }
  }

  const filtered = users.filter(u =>
    `${u.name} ${u.email} ${u.investxtag ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalBalance   = users.reduce((s, u) => s + (u.cashBalance ?? 0) + (u.investedAmount ?? 0), 0);
  const activeCount    = users.filter(u => u.status === 'active').length;
  const weekAgo        = Date.now() - 7 * 86400000;
  const newThisWeek    = users.filter(u => u.createdAt > weekAgo).length;
  const pendingGcCount = giftCards.filter(g => g.status === 'pending').length;

  function handleLogout() { clearAdminKey(); setLocation('/admin'); }

  const statusBadge = (s: GiftCardSubmission['status']) => {
    if (s === 'pending')  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending</span>;
    if (s === 'approved') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Approved</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Rejected</span>;
  };

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col">
      {/* Header */}
      <nav className="bg-[#1a2744] h-14 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/investx-logo.jpeg" alt="InvestX" className="w-8 h-8 rounded-lg object-cover" />
          <span className="text-white font-bold text-sm">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { if (tab === 'users') fetchUsers(); else fetchGiftCards(); }}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <RefreshCw size={16} className="text-white/70" />
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-xs font-medium">
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </nav>

      <div className="flex-1 px-4 pt-5 pb-10 max-w-2xl mx-auto w-full">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Total Users',   value: users.length.toString(),  Icon: Users,      color: '#1a2744' },
            { label: 'Total Balance', value: `$${fmt(totalBalance)}`,  Icon: DollarSign, color: '#059669' },
            { label: 'Active Users',  value: activeCount.toString(),   Icon: UserCheck,  color: '#2563eb' },
            { label: 'New This Week', value: newThisWeek.toString(),   Icon: TrendingUp, color: '#d97706' },
          ].map(({ label, value, Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm px-4 py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${color}18` }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl shadow-sm p-1 mb-4">
          <button
            onClick={() => setTab('users')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
              tab === 'users' ? 'bg-[#1a2744] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={14} />
            Users
          </button>
          <button
            onClick={() => setTab('giftcards')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all relative ${
              tab === 'giftcards' ? 'bg-[#1a2744] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard size={14} />
            Gift Cards
            {pendingGcCount > 0 && tab !== 'giftcards' && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingGcCount}
              </span>
            )}
          </button>
        </div>

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <>
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email or InvestX tag…"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white shadow-sm outline-none border border-gray-100 focus:border-[#1a2744]/30"
              />
            </div>

            {error ? (
              <div className="bg-red-50 rounded-2xl px-4 py-5 text-center text-sm text-red-600">{error}</div>
            ) : loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 rounded-full border-2 border-[#1a2744] border-t-transparent animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm px-4 py-10 text-center text-sm text-gray-400">
                {search ? 'No users match your search.' : 'No users registered yet.'}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
                {filtered.map(user => {
                  const initials = user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
                  return (
                    <button
                      key={user.uid}
                      onClick={() => setLocation(`/admin/users/${user.uid}`)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#1a2744] flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">{initials || '?'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                          {user.status === 'suspended' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 shrink-0">Suspended</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {user.investxtag && (
                            <span className="text-[11px] text-[#1a2744] font-semibold">@{user.investxtag}</span>
                          )}
                          <span className="text-[11px] text-gray-400">·</span>
                          <span className="text-[11px] font-semibold text-green-700">
                            ${fmt((user.cashBalance ?? 0) + (user.investedAmount ?? 0))}
                          </span>
                          {(user.investedAmount ?? 0) > 0 && (
                            <>
                              <span className="text-[10px] text-gray-300">|</span>
                              <span className="text-[10px] text-gray-400">${fmt(user.cashBalance)} cash</span>
                              <span className="text-[10px] text-blue-500 font-semibold">${fmt(user.investedAmount!)} invested</span>
                            </>
                          )}
                          <span className="text-[11px] text-gray-400">·</span>
                          <span className="text-[11px] text-gray-400">{timeAgo(user.createdAt)}</span>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-gray-300 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── GIFT CARDS TAB ── */}
        {tab === 'giftcards' && (
          <>
            {gcError ? (
              <div className="bg-red-50 rounded-2xl px-4 py-5 text-center text-sm text-red-600">{gcError}</div>
            ) : gcLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 rounded-full border-2 border-[#1a2744] border-t-transparent animate-spin" />
              </div>
            ) : giftCards.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm px-4 py-12 text-center">
                <CreditCard size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No gift card submissions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {giftCards.map(gc => (
                  <div key={gc.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-[13px] font-bold text-gray-900">{gc.cardLabel}</span>
                          {statusBadge(gc.status)}
                        </div>
                        <p className="text-[12px] text-gray-500">
                          <span className="font-semibold text-[#1a2744]">@{gc.userTag || gc.userName}</span>
                          {' · '}submitted {timeAgo(gc.submittedAt)}
                        </p>
                        {gc.code && (
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">Code: {gc.code}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-extrabold text-green-700">${fmt(gc.amount)}</p>
                      </div>
                    </div>

                    {gc.images.length > 0 && (
                      <div className="px-4 pb-3 flex gap-2">
                        {gc.images.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setLightboxImg(img)}
                            className="relative flex-1 max-w-[160px] group"
                          >
                            <img
                              src={img}
                              alt={idx === 0 ? 'Gift Card' : 'Receipt'}
                              className="w-full h-28 object-cover rounded-xl border border-gray-100 group-hover:opacity-90 transition-opacity"
                            />
                            <span className="absolute bottom-2 left-2 text-[9px] font-bold text-white bg-black/50 rounded-full px-1.5 py-0.5">
                              {idx === 0 ? 'Card' : 'Receipt'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {gc.status === 'pending' && (
                      <div className="px-4 pb-4 flex gap-2">
                        <button
                          disabled={reviewingId === gc.id}
                          onClick={() => reviewGiftCard(gc.id!, 'approved')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 text-white text-[13px] font-bold hover:bg-green-700 disabled:opacity-60 transition-colors"
                        >
                          <CheckCircle2 size={15} />
                          Approve & Credit
                        </button>
                        <button
                          disabled={reviewingId === gc.id}
                          onClick={() => reviewGiftCard(gc.id!, 'rejected')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-[13px] font-bold hover:bg-red-100 disabled:opacity-60 transition-colors border border-red-200"
                        >
                          <XCircle size={15} />
                          Reject
                        </button>
                      </div>
                    )}

                    {gc.status !== 'pending' && gc.reviewedAt && (
                      <div className="px-4 pb-3 flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Clock size={11} />
                        Reviewed {timeAgo(gc.reviewedAt)}
                        {gc.status === 'approved' && (
                          <span className="ml-1 text-green-600 font-semibold">· ${fmt(gc.amount)} credited</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt="Gift card"
            className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
