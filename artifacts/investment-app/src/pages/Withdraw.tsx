import React, { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft, History, Info, ShieldCheck, ChevronDown, Check, CheckCircle,
} from 'lucide-react';
import { BsBank2 } from 'react-icons/bs';
import { SiBitcoin, SiCashapp } from 'react-icons/si';
import { useInvestments } from '@/context/InvestmentContext';

// ── Grey logo ──────────────────────────────────────────────────────────────────
function GreyLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#1A1A2E" />
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
        fill="white" fontSize="22" fontWeight="800" fontFamily="Arial, sans-serif">G</text>
    </svg>
  );
}

// ── Crypto coins ───────────────────────────────────────────────────────────────
const CRYPTO_COINS = [
  { id: 'btc',  label: 'Bitcoin (BTC)',   icon: <SiBitcoin size={16} className="text-amber-500" />,                        iconBg: 'bg-amber-50'   },
  { id: 'ltc',  label: 'Litecoin (LTC)',  icon: <span className="text-[12px] font-black text-gray-500">Ł</span>,           iconBg: 'bg-gray-100'   },
  { id: 'usdt', label: 'Tether (USDT)',   icon: <span className="text-[11px] font-black text-emerald-600">₮</span>,        iconBg: 'bg-emerald-50' },
  { id: 'usdc', label: 'USD Coin (USDC)', icon: <span className="text-[11px] font-black text-blue-600">$</span>,           iconBg: 'bg-blue-50'    },
  { id: 'bnb',  label: 'BNB',            icon: <span className="text-[11px] font-black text-yellow-500">B</span>,          iconBg: 'bg-yellow-50'  },
  { id: 'trx',  label: 'TRON (TRX)',     icon: <span className="text-[11px] font-black text-red-500">T</span>,             iconBg: 'bg-red-50'     },
];

// ── Methods ────────────────────────────────────────────────────────────────────
const METHODS = [
  { id: 'bank',    label: 'Bank Transfer', icon: <BsBank2 size={19} className="text-blue-700" />,    iconBg: 'bg-blue-50',       limit: '$10.00 – $50,000.00 USD', feeRate: 0,   disabled: false },
  { id: 'crypto',  label: 'Crypto',        icon: <SiBitcoin size={19} className="text-amber-500" />, iconBg: 'bg-amber-50',      limit: '$1.00 – $100,000.00 USD', feeRate: 1,   disabled: false },
  { id: 'cashapp', label: 'CashApp',       icon: <SiCashapp size={19} className="text-[#00D632]" />, iconBg: 'bg-[#e6fdf0]',    limit: '$1.00 – $1,000.00 USD',  feeRate: 0,   disabled: true  },
  { id: 'grey',    label: 'Grey',          icon: <GreyLogo size={19} />,                              iconBg: 'bg-[#1A1A2E]/10', limit: '$1.00 – $5,000.00 USD',  feeRate: 0,   disabled: false },
];

// ── Bank fields ────────────────────────────────────────────────────────────────
const BANK_FIELDS = [
  { id: 'holderName',   label: 'Account Holder Name',    placeholder: 'Full name on account',    type: 'text'   },
  { id: 'bankName',     label: 'Bank Name',               placeholder: 'e.g. Chase, Wells Fargo', type: 'text'   },
  { id: 'accountNo',   label: 'Account Number',          placeholder: '000000000000',             type: 'number' },
  { id: 'routing',     label: 'ACH Routing Number',      placeholder: '9-digit routing number',   type: 'number' },
  { id: 'bankAddress', label: 'Bank Address',             placeholder: 'Branch address',           type: 'text'   },
  { id: 'swift',       label: 'SWIFT / BIC (optional)',  placeholder: 'e.g. CHASUS33',            type: 'text'   },
];

const inputCls = 'w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-[13px] text-primary placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors';

function today() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function Withdraw() {
  const [, setLocation] = useLocation();
  const { cashBalance, recordTransaction } = useInvestments();

  const [methodId, setMethodId]   = useState('bank');
  const [amount, setAmount]       = useState('');
  const [bankData, setBankData]   = useState<Record<string, string>>({});
  const [cryptoCoin, setCryptoCoin] = useState('');
  const [cryptoOpen, setCryptoOpen] = useState(false);
  const [walletAddr, setWalletAddr] = useState('');
  const [greyTag, setGreyTag]     = useState('');
  const [success, setSuccess]     = useState(false);

  const method       = METHODS.find((m) => m.id === methodId)!;
  const numAmt       = parseFloat(amount) || 0;
  const fee          = numAmt > 0 && methodId === 'crypto' ? method.feeRate : 0;
  const receivable   = Math.max(0, numAmt - fee);
  const selectedCoin = CRYPTO_COINS.find((c) => c.id === cryptoCoin);
  const overBalance  = numAmt > cashBalance;

  const destinationValid = (() => {
    if (methodId === 'bank') {
      return !!(bankData.holderName?.trim() && bankData.bankName?.trim() && bankData.accountNo?.trim() && bankData.routing?.trim());
    }
    if (methodId === 'crypto') return !!(cryptoCoin && walletAddr.trim());
    if (methodId === 'grey')   return !!greyTag.trim();
    return true;
  })();

  const canSubmit = numAmt > 0 && !overBalance && destinationValid;

  // Build destination string for the transaction record
  function buildDestination(): string {
    if (methodId === 'bank') {
      const holder = bankData.holderName || '';
      const bank   = bankData.bankName   || '';
      const acct   = bankData.accountNo  || '';
      const masked = acct.length > 4 ? `****${acct.slice(-4)}` : acct;
      return [holder, bank, masked].filter(Boolean).join(' · ') || 'Bank Transfer';
    }
    if (methodId === 'crypto') {
      const coin = selectedCoin?.label ?? 'Crypto';
      const addr = walletAddr.length > 8
        ? `${walletAddr.slice(0, 6)}…${walletAddr.slice(-4)}`
        : walletAddr;
      return [coin, addr].filter(Boolean).join(' · ');
    }
    if (methodId === 'grey') return greyTag ? `@${greyTag}` : 'Grey';
    return method.label;
  }

  function handleConfirm() {
    if (!canSubmit) return;
    recordTransaction({
      type: 'withdraw',
      amount: numAmt,
      fee,
      receivable,
      method: method.label,
      destination: buildDestination(),
      date: today(),
    }, -numAmt);
    setSuccess(true);
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center gap-5">
        {/* Pending icon — amber clock */}
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>

        {/* Pending Approval badge */}
        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-[11px] font-bold px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending Approval
        </span>

        <div>
          <h2 className="text-xl font-extrabold text-primary mb-1">Withdrawal Under Review</h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Your withdrawal request of{' '}
            <span className="font-bold text-primary">${receivable.toFixed(2)}</span> via{' '}
            <span className="font-semibold">{method.label}</span> has been received and is awaiting admin approval.
            {fee > 0 && <> A processing fee of <span className="font-bold">${fee.toFixed(2)}</span> applies.</>}
          </p>
          <p className="text-[12px] text-muted-foreground mt-2">
            Destination: <span className="font-semibold text-primary">{buildDestination()}</span>
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-3">{today()}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left max-w-xs w-full">
          <p className="text-[12px] text-amber-800 font-semibold leading-relaxed">
            Your funds are held securely during review. You will be notified once the withdrawal is approved or declined.
          </p>
        </div>

        <button
          onClick={() => setLocation('/app')}
          className="mt-1 bg-primary text-primary-foreground px-8 py-3 rounded-full text-[14px] font-bold shadow hover:opacity-90 transition-opacity"
        >
          Back to Home
        </button>
        <button
          onClick={() => setLocation('/portfolio')}
          className="text-[13px] text-primary font-semibold underline underline-offset-2"
        >
          View in Transaction History
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 shadow-md">
        <button onClick={() => setLocation('/app')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold leading-tight">Withdraw Money</h1>
        </div>
        <button
          onClick={() => setLocation('/portfolio')}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors rounded-full px-3 py-1.5 text-[12px] font-semibold"
        >
          <History size={13} /> History
        </button>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 pb-12 space-y-4">
        <h2 className="text-[15px] font-bold text-center text-primary">Withdraw</h2>

        {/* Available balance hint */}
        <div className="text-center text-[12px] text-muted-foreground">
          Available cash balance: <span className="font-bold text-primary">${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>

        {/* Method selector */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {METHODS.map((m, idx) => {
            const active   = m.id === methodId;
            const disabled = m.disabled;
            return (
              <div key={m.id} className={idx !== 0 ? 'border-t border-border' : ''}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && setMethodId(m.id)}
                  className={`relative w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors
                    ${active ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}
                    ${!disabled && !active ? 'hover:bg-muted/40' : ''}
                    ${disabled ? 'cursor-not-allowed' : ''}`}
                >
                  {disabled && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-sm z-10 flex items-center justify-end pr-4">
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Coming soon</span>
                    </div>
                  )}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-primary' : 'border-muted-foreground/40'}`}>
                    {active && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className={`flex-1 text-[14px] font-semibold ${active ? 'text-primary' : 'text-card-foreground'}`}>{m.label}</span>
                  <div className={`flex items-center gap-1.5 ${m.iconBg} rounded-full px-2.5 py-1`}>
                    {m.icon}
                    <span className={`text-[12px] font-bold ${active ? 'text-primary' : 'text-muted-foreground'}`}>{m.label}</span>
                  </div>
                </button>

                {active && !disabled && (
                  <div className="px-4 pb-4 pt-1 space-y-3 bg-primary/[0.02] border-t border-primary/10">
                    {/* BANK */}
                    {m.id === 'bank' && (
                      <div className="space-y-2.5 pt-1">
                        {BANK_FIELDS.map((f) => (
                          <div key={f.id}>
                            <label className="block text-[11px] font-bold text-muted-foreground mb-1">{f.label}</label>
                            <input
                              type={f.type}
                              placeholder={f.placeholder}
                              value={bankData[f.id] ?? ''}
                              onChange={(e) => setBankData(prev => ({ ...prev, [f.id]: e.target.value }))}
                              className={inputCls}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CRYPTO */}
                    {m.id === 'crypto' && (
                      <div className="space-y-2.5 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-muted-foreground mb-1">Select Coin</label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setCryptoOpen(o => !o)}
                              className="w-full flex items-center justify-between bg-muted border border-border rounded-xl px-3 py-2.5 text-left text-[13px] hover:border-primary/40 transition-colors"
                            >
                              {selectedCoin ? (
                                <span className="flex items-center gap-2 font-semibold text-primary">
                                  <span className={`w-6 h-6 rounded-full ${selectedCoin.iconBg} flex items-center justify-center`}>{selectedCoin.icon}</span>
                                  {selectedCoin.label}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Choose a coin…</span>
                              )}
                              <ChevronDown size={15} className={`text-muted-foreground transition-transform ${cryptoOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {cryptoOpen && (
                              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-xl overflow-hidden">
                                {CRYPTO_COINS.map((coin) => (
                                  <button
                                    key={coin.id}
                                    type="button"
                                    onClick={() => { setCryptoCoin(coin.id); setCryptoOpen(false); setWalletAddr(''); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-semibold text-left hover:bg-primary/5 transition-colors ${cryptoCoin === coin.id ? 'text-primary bg-primary/5' : 'text-gray-800'}`}
                                  >
                                    <span className={`w-6 h-6 rounded-full ${coin.iconBg} flex items-center justify-center shrink-0`}>{coin.icon}</span>
                                    {coin.label}
                                    {cryptoCoin === coin.id && <Check size={13} className="ml-auto text-primary" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {cryptoCoin && (
                          <div>
                            <label className="block text-[11px] font-bold text-muted-foreground mb-1">{selectedCoin?.label} Wallet Address</label>
                            <input
                              type="text"
                              placeholder="Paste wallet address here…"
                              value={walletAddr}
                              onChange={(e) => setWalletAddr(e.target.value)}
                              className={`${inputCls} font-mono text-[12px]`}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* GREY */}
                    {m.id === 'grey' && (
                      <div className="pt-1">
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">Grey Tag</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-muted-foreground">@</span>
                          <input
                            type="text"
                            placeholder="yourtag"
                            value={greyTag}
                            onChange={(e) => setGreyTag(e.target.value.replace('@', ''))}
                            className={`${inputCls} pl-7`}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Enter the recipient's Grey tag for international transfer.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Amount + summary */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <span className="text-[13px] font-semibold text-muted-foreground">Amount</span>
            <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
              <span className="text-[14px] font-bold text-muted-foreground">$</span>
              <input
                type="number"
                min="0"
                placeholder="00.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-28 bg-transparent text-[15px] font-bold text-primary text-right focus:outline-none"
              />
            </div>
          </div>

          {overBalance && numAmt > 0 && (
            <div className="px-4 py-2 bg-red-50 border-b border-red-100">
              <p className="text-[11px] text-red-500 font-semibold">Exceeds available cash balance of ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
            <span className="text-[13px] text-muted-foreground">Limit</span>
            <span className="text-[13px] font-semibold text-card-foreground text-right">{method.limit}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
            <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
              Processing Charge <Info size={12} className="text-muted-foreground/50" />
            </span>
            <span className="text-[13px] font-semibold text-card-foreground">
              {fee > 0 ? `$${fee.toFixed(2)} USD` : '$0.00 USD'}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
            <span className="text-[13px] text-muted-foreground">Receivable</span>
            <span className="text-[13px] font-bold text-primary">${receivable.toFixed(2)} USD</span>
          </div>

          <div className="px-4 py-4">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleConfirm}
              className={`w-full py-3.5 rounded-xl text-[15px] font-bold transition-all
                ${canSubmit
                  ? 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] shadow'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
            >
              Confirm Withdraw
            </button>
          </div>

          <div className="px-4 pb-4 flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
            <ShieldCheck size={13} className="text-green-500 mt-0.5 shrink-0" />
            Safely withdraw your funds using our highly secure process and various withdrawal methods.
          </div>
        </div>
      </main>
    </div>
  );
}
