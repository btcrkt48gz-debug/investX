import React, { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, TrendingUp, TrendingDown, ChevronRight, Search } from 'lucide-react';
import { useInvestments } from '@/context/InvestmentContext';

// ── Plan lookup ────────────────────────────────────────────────────────────────
const PLANS: Record<string, { name: string; rate: string }> = {
  basic:    { name: 'Basic Plan',    rate: '5%' },
  standard: { name: 'Standard Plan', rate: '6%' },
  premium:  { name: 'Premium Plan',  rate: '7%' },
  excel:    { name: 'Excel Plus',    rate: '10%' },
};

// ── Crypto data ───────────────────────────────────────────────────────────────
const CRYPTOS = [
  { ticker: 'BTC',   name: 'Bitcoin',           price: 67420.50, change: +1240.30, logo: '/crypto-logos/BTC.png',  color: '#F7931A' },
  { ticker: 'ETH',   name: 'Ethereum',           price: 3521.80,  change: +88.40,  logo: '/crypto-logos/ETH.png',  color: '#627EEA' },
  { ticker: 'BNB',   name: 'BNB',                price: 598.20,   change: +12.60,  logo: '/crypto-logos/BNB.png',  color: '#F3BA2F' },
  { ticker: 'SOL',   name: 'Solana',             price: 182.45,   change: +9.35,   logo: '/crypto-logos/SOL.png',  color: '#9945FF' },
  { ticker: 'XRP',   name: 'XRP',                price: 0.6240,   change: -0.0120, logo: '/crypto-logos/XRP.png',  color: '#346AA9' },
  { ticker: 'DOGE',  name: 'Dogecoin',           price: 0.1742,   change: +0.0088, logo: '/crypto-logos/DOGE.png', color: '#C2A633' },
  { ticker: 'ADA',   name: 'Cardano',            price: 0.4820,   change: -0.0090, logo: '/crypto-logos/ADA.png',  color: '#0033AD' },
  { ticker: 'AVAX',  name: 'Avalanche',          price: 38.72,    change: +2.14,   logo: '/crypto-logos/AVAX.png', color: '#E84142' },
  { ticker: 'LINK',  name: 'Chainlink',          price: 14.88,    change: +0.52,   logo: '/crypto-logos/LINK.png', color: '#2A5ADA' },
  { ticker: 'MATIC', name: 'Polygon',            price: 0.8940,   change: +0.0340, logo: '/crypto-logos/MATIC.png',color: '#8247E5' },
  { ticker: 'DOT',   name: 'Polkadot',           price: 7.62,     change: -0.18,   logo: '/crypto-logos/DOT.png',  color: '#E6007A' },
  { ticker: 'UNI',   name: 'Uniswap',            price: 10.44,    change: +0.38,   logo: '/crypto-logos/UNI.png',  color: '#FF007A' },
  { ticker: 'LTC',   name: 'Litecoin',           price: 88.30,    change: +1.60,   logo: '/crypto-logos/LTC.png',  color: '#BFBBBB' },
  { ticker: 'SHIB',  name: 'Shiba Inu',          price: 0.0000246,change: +0.0000012, logo: '/crypto-logos/SHIB.png', color: '#E01A28' },
  { ticker: 'TRX',   name: 'TRON',               price: 0.1280,   change: +0.0030, logo: '/crypto-logos/TRX.png',  color: '#EF0027' },
  { ticker: 'NEAR',  name: 'NEAR Protocol',      price: 6.82,     change: +0.44,   logo: '/crypto-logos/NEAR.png', color: '#00C08B' },
  { ticker: 'APT',   name: 'Aptos',              price: 9.14,     change: +0.72,   logo: '/crypto-logos/APT.png',  color: '#00C2FF' },
  { ticker: 'OP',    name: 'Optimism',           price: 2.38,     change: -0.06,   logo: '/crypto-logos/OP.png',   color: '#FF0420' },
  { ticker: 'ARB',   name: 'Arbitrum',           price: 1.12,     change: +0.08,   logo: '/crypto-logos/ARB.png',  color: '#2D374B' },
  { ticker: 'TON',   name: 'Toncoin',            price: 5.64,     change: +0.22,   logo: '/crypto-logos/TON.png',  color: '#0098EA' },
];

// ── Base announcements ────────────────────────────────────────────────────────
const BASE_ANNOUNCEMENTS = [
  '🔥 BTC breaks $67K — institutional demand surges',
  '📈 SOL up +5.1% — Solana ecosystem activity at all-time high',
  '💰 ETH staking yields hit record as network usage climbs',
  '⚡ AVAX rallies +5.8% following DeFi protocol launch',
  '📊 Crypto market cap crosses $2.4T — bull momentum continues',
  '🌍 BNB gains +2.1% as Binance Smart Chain TVL expands',
  '🚀 LINK surges +3.5% on new oracle partnership announcement',
];

function fmt(n: number) {
  if (n < 0.001) return n.toFixed(7);
  if (n < 1) return n.toFixed(4);
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pctChange(change: number, price: number) {
  return ((change / (price - change)) * 100).toFixed(2);
}

// ── Crypto logo with fallback ─────────────────────────────────────────────────
function CryptoLogo({ logo, ticker, color, size = 48 }: { logo: string; ticker: string; color: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="rounded-xl flex items-center justify-center font-extrabold text-white shrink-0"
        style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.28 }}
      >
        {ticker.slice(0, 3)}
      </div>
    );
  }
  return (
    <img
      src={logo}
      alt={ticker}
      onError={() => setFailed(true)}
      className="rounded-xl object-contain bg-white shrink-0 border border-gray-100"
      style={{ width: size, height: size }}
    />
  );
}

// ── Ticker ────────────────────────────────────────────────────────────────────
function Ticker({ rate, planName }: { rate: string; planName: string }) {
  const announcements = [...BASE_ANNOUNCEMENTS, `💎 Invest now — ${rate} daily returns with InvestX ${planName}`];
  const text = announcements.join('   ·   ');
  return (
    <div className="bg-gray-900 text-white py-2.5 overflow-hidden relative">
      <div
        className="whitespace-nowrap text-[11px] font-semibold tracking-wide inline-block"
        style={{ animation: 'ticker 28s linear infinite' }}
      >
        {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
      </div>
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ── Slideshow strip ───────────────────────────────────────────────────────────
function CryptoSlideshow() {
  const doubled = [...CRYPTOS, ...CRYPTOS];
  return (
    <div className="overflow-hidden py-3">
      <div
        className="flex gap-3 w-max"
        style={{ animation: 'slideshow 22s linear infinite' }}
      >
        {doubled.map((c, i) => {
          const up = c.change >= 0;
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 shadow-sm shrink-0"
            >
              <CryptoLogo logo={c.logo} ticker={c.ticker} color={c.color} size={32} />
              <div>
                <div className="text-[11px] font-extrabold text-gray-900">{c.ticker}</div>
                <div className={`text-[10px] font-bold ${up ? 'text-emerald-500' : 'text-red-500'}`}>
                  {up ? '+' : ''}{pctChange(c.change, c.price)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideshow {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CryptoPick() {
  const [, setLocation] = useLocation();
  const params = useParams<{ planId: string }>();
  const planId = params?.planId ?? 'basic';
  const plan = PLANS[planId] ?? PLANS.basic;
  const { investments } = useInvestments();

  const [query, setQuery] = useState('');

  const filtered = CRYPTOS.filter(
    c =>
      c.ticker.toLowerCase().includes(query.toLowerCase()) ||
      c.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setLocation(`/plan/${planId}`)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={17} /> Back
        </button>
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Select Crypto</span>
        <div className="w-16" />
      </div>

      {/* ── Announcement ticker ── */}
      <Ticker rate={plan.rate} planName={plan.name} />

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-2xl font-extrabold text-gray-900">Choose Your Crypto</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select from {CRYPTOS.length}+ top digital assets. Earn{' '}
          <span className="font-bold text-orange-500">{plan.rate} daily</span> on every pick.
        </p>
      </div>

      {/* ── Live slideshow ── */}
      <div className="px-4">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Live Market</div>
      </div>
      <div className="bg-gray-50 border-y border-gray-100">
        <CryptoSlideshow />
      </div>

      {/* ── Search ── */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search coins…"
            className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ── Crypto list ── */}
      <div className="px-4 pb-36">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-2">
          {filtered.length} coins available
        </div>
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(c => {
            const up       = c.change >= 0;
            const invKey   = `${planId}:${c.ticker}`;
            const inv      = investments[invKey];
            const isActive  = inv?.status === 'active';
            const isStopped = inv?.status === 'stopped';
            return (
              <button
                key={c.ticker}
                onClick={() => setLocation(`/plan/${planId}/crypto/${c.ticker}`)}
                className="flex items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.99] hover:border-gray-300 hover:shadow-sm"
                style={isActive
                  ? { borderColor: '#22c55e', backgroundColor: '#f0fdf4' }
                  : isStopped
                    ? { borderColor: '#f59e0b', backgroundColor: '#fffbeb' }
                    : { borderColor: '#e5e7eb', backgroundColor: '#ffffff' }
                }
              >
                <CryptoLogo logo={c.logo} ticker={c.ticker} color={c.color} size={48} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-extrabold text-gray-900">{c.ticker}</span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ color: c.color, backgroundColor: c.color + '18' }}
                    >
                      Crypto
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" style={{ boxShadow: '0 0 4px rgba(34,197,94,0.8)' }} />
                        Active
                      </span>
                    )}
                    {isStopped && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200">
                        Stopped
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">{c.name}</div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-sm font-extrabold text-gray-900">${fmt(c.price)}</span>
                    <span className={`flex items-center gap-0.5 text-[11px] font-bold ${up ? 'text-emerald-500' : 'text-red-500'}`}>
                      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {up ? '+' : ''}{fmt(c.change)} ({up ? '+' : ''}{pctChange(c.change, c.price)}%)
                    </span>
                  </div>
                </div>

                <ChevronRight size={18} className="text-gray-300 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
