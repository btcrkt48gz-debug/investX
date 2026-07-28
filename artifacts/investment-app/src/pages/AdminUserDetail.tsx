import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import {
  ArrowLeft, User, Mail, Phone, Calendar, Hash, DollarSign,
  Plus, Minus, Key, Trash2, CheckCircle, XCircle, Save, Eye, EyeOff,
  ArrowUpRight, ArrowDownLeft, Clock, AlertCircle, RefreshCw,
} from 'lucide-react';
import { getAdminKey } from './AdminLogin';
import {
  getUserData, getTransactions, creditUser, debitUser,
  updateUserProfile, adminDeleteUser, updateTransaction,
  type UserProfile, type StoredTransaction,
} from '@/lib/firestoreDb';

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(ts: number | string) {
  try {
    return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return String(ts); }
}

function txLabel(t: StoredTransaction): string {
  switch (t.type) {
    case 'credit':     return 'Admin Credit';
    case 'debit':      return 'Admin Debit';
    case 'deposit':    return 'Deposit';
    case 'withdraw':
    case 'withdrawal': return `Withdrawal${t.method ? ` · ${t.method}` : ''}`;
    case 'invest':
    case 'investment': return `Investment${t.ticker ? ` · ${t.ticker}` : ''}`;
    case 'cashout':    return `Cashout${t.ticker ? ` · ${t.ticker}` : ''}`;
    case 'transfer':   return `Transfer${t.destination ? ` · ${t.destination}` : ''}`;
    default:           return t.type;
  }
}

function isCredit(t: StoredTransaction) {
  return ['credit', 'deposit', 'cashout'].includes(t.type);
}
function isWithdrawType(t: StoredTransaction) {
  return t.type === 'withdraw' || t.type === 'withdrawal';
}

type Tab = 'overview' | 'edit' | 'balance' | 'transactions' | 'password';

export default function AdminUserDetail() {
  const [, setLocation]    = useLocation();
  const { uid }            = useParams<{ uid: string }>();
  const adminKey           = getAdminKey();

  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [txs, setTxs]           = useState<StoredTransaction[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>('overview');
  const [toast, setToast]       = useState('');

  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', dob: '', investxtag: '', status: 'active' as 'active' | 'suspended' });
  const [creditAmt, setCreditAmt]   = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [creditMode, setCreditMode] = useState<'add' | 'remove'>('add');
  const [newPw, setNewPw]           = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!adminKey) { setLocation('/admin'); return; }
    setLoading(true);
    try {
      const [u, t] = await Promise.all([getUserData(uid), getTransactions(uid)]);
      if (!u) { setLoading(false); return; }
      setUserData(u);
      setTxs(t);
      setEditForm({ name: u.name ?? '', email: u.email ?? '', phone: u.phone ?? '', dob: u.dob ?? '', investxtag: u.investxtag ?? '', status: u.status ?? 'active' });
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [uid, adminKey, setLocation]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function saveEdit() {
    if (!userData) return;
    await updateUserProfile(uid, { name: editForm.name, email: editForm.email, phone: editForm.phone, dob: editForm.dob, investxtag: editForm.investxtag, status: editForm.status });
    setUserData(prev => prev ? { ...prev, ...editForm } : null);
    showToast('Profile updated.');
  }

  async function applyCredit() {
    const amt = parseFloat(creditAmt);
    if (isNaN(amt) || amt <= 0) { showToast('Enter a valid amount.'); return; }
    if (creditMode === 'add') {
      await creditUser(uid, amt, creditNote || 'Admin credit');
    } else {
      await debitUser(uid, amt, creditNote || 'Admin debit');
    }
    setCreditAmt(''); setCreditNote('');
    showToast(`$${fmt(amt)} ${creditMode === 'add' ? 'added' : 'removed'} successfully.`);
    await fetchUser();
  }

  async function updateTxStatus(txId: string, status: 'completed' | 'failed') {
    try {
      const tx = txs.find(t => t.id === txId);
      if (status === 'failed' && tx && isWithdrawType(tx) && tx.status === 'pending') {
        await creditUser(uid, tx.amount, `Withdrawal refunded (failed): ${tx.destination ?? tx.method ?? ''}`);
      }
      await updateTransaction(uid, txId, { status });
      showToast(status === 'completed' ? 'Marked as completed.' : 'Marked as failed — funds refunded.');
      await fetchUser();
    } catch {
      showToast('Failed to update transaction.');
    }
  }

  async function handleDeleteUser() {
    await adminDeleteUser(uid);
    setLocation('/admin/dashboard');
  }

  if (loading) return (
    <div className="min-h-screen bg-[#f0f2f7] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#1a2744] border-t-transparent animate-spin" />
    </div>
  );
  if (!userData) return (
    <div className="min-h-screen bg-[#f0f2f7] flex items-center justify-center">
      <p className="text-gray-400 text-sm">User not found.</p>
    </div>
  );

  const initials            = userData.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
  const pendingWithdrawals  = txs.filter(t => isWithdrawType(t) && t.status === 'pending');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview',     label: 'Overview'     },
    { id: 'edit',         label: 'Edit'         },
    { id: 'balance',      label: 'Balance'      },
    { id: 'transactions', label: `Transactions${pendingWithdrawals.length > 0 ? ` (${pendingWithdrawals.length})` : ''}` },
    { id: 'password',     label: 'Password'     },
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-[#1a2744] text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          {toast}
        </div>
      )}

      <nav className="bg-[#1a2744] h-14 flex items-center px-4 sticky top-0 z-50">
        <button onClick={() => setLocation('/admin/dashboard')} className="p-1.5 hover:bg-white/10 rounded-full transition-colors mr-3">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-sm font-bold text-white flex-1">User Detail</h1>
        <button onClick={fetchUser} className="p-1.5 hover:bg-white/10 rounded-full transition-colors mr-3">
          <RefreshCw size={16} className="text-white/70" />
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors text-xs font-medium"
        >
          <Trash2 size={14} /> Delete
        </button>
      </nav>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-5">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <p className="text-base font-bold text-gray-900 mb-2">Delete Account?</p>
            <p className="text-sm text-gray-500 mb-5">This will permanently remove {userData.name}'s data from Firestore.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm">Cancel</button>
              <button onClick={handleDeleteUser} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 pt-5 pb-12 max-w-2xl mx-auto w-full">
        {/* User card */}
        <div className="bg-[#1a2744] rounded-2xl px-5 py-5 flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-lg">{initials || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base truncate">{userData.name}</p>
            <p className="text-white/50 text-xs truncate">{userData.email}</p>
            {userData.investxtag && <p className="text-[#D4A017] text-xs font-semibold mt-0.5">@{userData.investxtag}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-green-400 font-bold text-base">${fmt((userData.cashBalance ?? 0) + (userData.investedAmount ?? 0))}</p>
            {(userData.investedAmount ?? 0) > 0 && (
              <p className="text-white/40 text-[10px] mt-0.5">
                ${fmt(userData.cashBalance)} cash · ${fmt(userData.investedAmount!)} invested
              </p>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${userData.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {userData.status}
            </span>
          </div>
        </div>

        {pendingWithdrawals.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <p className="text-xs font-semibold text-amber-800">
              {pendingWithdrawals.length} pending withdrawal{pendingWithdrawals.length > 1 ? 's' : ''} awaiting approval
            </p>
            <button onClick={() => setTab('transactions')} className="ml-auto text-[11px] font-bold text-amber-700 underline underline-offset-2 whitespace-nowrap">
              Review
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm mb-4 overflow-x-auto gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 py-2 px-3 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                tab === t.id ? 'bg-[#1a2744] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              } ${t.id === 'transactions' && pendingWithdrawals.length > 0 && tab !== 'transactions' ? 'text-amber-600' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
              {[
                { Icon: User,        label: 'Full Name',     value: userData.name              },
                { Icon: Mail,        label: 'Email',         value: userData.email             },
                { Icon: Hash,        label: 'InvestX Tag',   value: userData.investxtag || '—' },
                { Icon: Phone,       label: 'Phone',         value: userData.phone       || '—' },
                { Icon: Calendar,    label: 'Date of Birth', value: userData.dob         || '—' },
                { Icon: CheckCircle, label: 'Status',        value: userData.status            },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3.5">
                  <Icon size={15} className="text-[#1a2744]/50 shrink-0" />
                  <span className="text-xs text-gray-400 w-28 shrink-0">{label}</span>
                  <span className="text-sm font-semibold text-gray-900 truncate">{value}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
              {[
                { label: 'Joined',       value: fmtDate(userData.createdAt)         },
                { label: 'Transactions', value: txs.length.toString()               },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-sm font-semibold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Edit ── */}
        {tab === 'edit' && (
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
              {([
                { key: 'name',       label: 'Full Name',     type: 'text'  },
                { key: 'email',      label: 'Email',         type: 'email' },
                { key: 'investxtag', label: 'InvestX Tag',   type: 'text'  },
                { key: 'phone',      label: 'Phone',         type: 'tel'   },
                { key: 'dob',        label: 'Date of Birth', type: 'date'  },
              ] as const).map(({ key, label, type }) => (
                <div key={key} className="px-4 py-3.5">
                  <label className="text-xs text-gray-400 block mb-1">{label}</label>
                  <input
                    type={type}
                    value={(editForm as Record<string, string>)[key]}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full text-sm text-gray-900 bg-gray-50 rounded-xl px-3 py-2.5 outline-none border border-gray-100 focus:border-[#1a2744]/30"
                  />
                </div>
              ))}
              <div className="px-4 py-3.5">
                <label className="text-xs text-gray-400 block mb-1">Account Status</label>
                <div className="flex gap-2">
                  {(['active', 'suspended'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setEditForm(f => ({ ...f, status: s }))}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize border transition-all ${editForm.status === s
                        ? s === 'active' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-gray-50 border-gray-100 text-gray-400'
                      }`}
                    >
                      {s === 'active' ? <><CheckCircle size={12} className="inline mr-1" />Active</> : <><XCircle size={12} className="inline mr-1" />Suspended</>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={saveEdit} className="w-full py-3.5 rounded-2xl bg-[#1a2744] text-white font-semibold text-sm flex items-center justify-center gap-2">
              <Save size={15} /> Save Changes
            </button>
          </div>
        )}

        {/* ── Balance ── */}
        {tab === 'balance' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Total Portfolio', value: (userData.cashBalance ?? 0) + (userData.investedAmount ?? 0), color: 'text-gray-900'  },
                { label: 'Cash',            value: userData.cashBalance ?? 0,                                    color: 'text-green-600' },
                { label: 'Invested',        value: userData.investedAmount ?? 0,                                 color: 'text-blue-600'  },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl shadow-sm px-3 py-4 text-center">
                  <p className="text-[10px] text-gray-400 mb-1 leading-tight">{label}</p>
                  <p className={`text-sm font-bold ${color}`}>${fmt(value)}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-sm px-4 py-4 flex flex-col gap-3">
              <div className="flex gap-2">
                {([{ id: 'add', label: 'Add Funds', Icon: Plus }, { id: 'remove', label: 'Remove Funds', Icon: Minus }] as const).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setCreditMode(id)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${creditMode === id
                      ? id === 'add' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-gray-50 border-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon size={12} />{label}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Amount (USD)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number" min="0" step="0.01" value={creditAmt}
                    onChange={e => setCreditAmt(e.target.value)} placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-xl outline-none border border-gray-100 focus:border-[#1a2744]/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Note (optional)</label>
                <input
                  type="text" value={creditNote} onChange={e => setCreditNote(e.target.value)}
                  placeholder="e.g. Welcome bonus, Admin adjustment…"
                  className="w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-xl outline-none border border-gray-100 focus:border-[#1a2744]/30"
                />
              </div>
              <button onClick={applyCredit}
                className={`w-full py-3 rounded-xl font-semibold text-sm ${creditMode === 'add' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
                {creditMode === 'add' ? '+ Add Funds' : '− Remove Funds'}
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">Admin Adjustments</p>
              {txs.filter(t => t.type === 'credit' || t.type === 'debit').length === 0 ? (
                <div className="px-4 py-6 text-center"><p className="text-sm text-gray-400">No admin adjustments yet.</p></div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {txs.filter(t => t.type === 'credit' || t.type === 'debit').slice(0, 30).map(t => (
                    <div key={t.id} className="px-4 py-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${t.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {t.type === 'credit' ? <Plus size={13} className="text-green-600" /> : <Minus size={13} className="text-red-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 capitalize">{t.type}</p>
                        <p className="text-[11px] text-gray-400 truncate">{t.note} · {fmtDate(t.timestamp)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                          {t.type === 'credit' ? '+' : '−'}${fmt(t.amount)}
                        </p>
                        <p className="text-[10px] text-gray-400">${fmt(t.balanceAfter)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Transactions ── */}
        {tab === 'transactions' && (
          <div className="flex flex-col gap-3">
            {pendingWithdrawals.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-widest px-1">Pending Withdrawals — Action Required</p>
                {pendingWithdrawals.map(t => (
                  <div key={t.id} className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{txLabel(t)}</p>
                        {t.destination && <p className="text-[11px] text-gray-500 mt-0.5">{t.destination}</p>}
                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1"><Clock size={9} /> {fmtDate(t.timestamp)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-red-600">−${fmt(t.amount)}</p>
                        {t.fee != null && t.fee > 0 && <p className="text-[10px] text-gray-400">fee ${fmt(t.fee)}</p>}
                        {t.receivable != null && <p className="text-[10px] text-gray-500 font-semibold">net ${fmt(t.receivable)}</p>}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending Approval
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => updateTxStatus(t.id, 'completed')}
                        className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5">
                        <CheckCircle size={13} /> Mark Completed
                      </button>
                      <button onClick={() => updateTxStatus(t.id, 'failed')}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5">
                        <XCircle size={13} /> Mark Failed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">All Transactions ({txs.length})</p>
              {txs.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-400">No transactions yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {txs.map(t => {
                    const credit  = isCredit(t);
                    const isW     = isWithdrawType(t);
                    const pending = t.status === 'pending';
                    const failed  = t.status === 'failed';
                    const completed = t.status === 'completed';
                    return (
                      <div key={t.id} className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${credit ? 'bg-green-100' : 'bg-red-100'}`}>
                            {credit ? <ArrowDownLeft size={13} className="text-green-600" /> : <ArrowUpRight size={13} className="text-red-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-bold text-gray-900">{txLabel(t)}</p>
                              {pending   && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />Pending</span>}
                              {failed    && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">Failed</span>}
                              {completed && !credit && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Completed</span>}
                            </div>
                            {t.destination && <p className="text-[10px] text-gray-400 truncate mt-0.5">{t.destination}</p>}
                            {!t.destination && t.note && <p className="text-[10px] text-gray-400 truncate mt-0.5">{t.note}</p>}
                            {t.category && <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full mt-0.5 inline-block">{t.category}</span>}
                            <p className="text-[10px] text-gray-300 mt-1 flex items-center gap-1"><Clock size={8} /> {fmtDate(t.timestamp)}</p>
                            {isW && pending && (
                              <div className="flex gap-2 mt-2">
                                <button onClick={() => updateTxStatus(t.id, 'completed')} className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors">Complete</button>
                                <button onClick={() => updateTxStatus(t.id, 'failed')} className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">Fail &amp; Refund</button>
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-sm font-bold ${credit ? 'text-green-600' : 'text-red-500'}`}>{credit ? '+' : '−'}${fmt(t.amount)}</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">bal ${fmt(t.balanceAfter)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Password ── */}
        {tab === 'password' && (
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-2xl shadow-sm px-4 py-4 flex flex-col gap-3">
              <p className="text-sm text-gray-500">Set a new password for <strong className="text-gray-900">{userData.name}</strong>. They will need to use this to log in.</p>
              <div>
                <label className="text-xs text-gray-400 block mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} value={newPw}
                    onChange={e => setNewPw(e.target.value)} placeholder="Min. 6 characters"
                    className="w-full pr-10 pl-4 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-xl outline-none border border-gray-100 focus:border-[#1a2744]/30"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <button onClick={() => showToast('Password reset requires Firebase Admin SDK. Use Firebase Console → Authentication → Users → Reset Password.')}
                className="w-full py-3 rounded-xl bg-[#1a2744] text-white font-semibold text-sm flex items-center justify-center gap-2">
                <Key size={14} /> Reset Password
              </button>
              <div className="rounded-xl px-3 py-2.5 bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 leading-relaxed">To reset a password, go to Firebase Console → Authentication → Users → find the user → Reset Password.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
