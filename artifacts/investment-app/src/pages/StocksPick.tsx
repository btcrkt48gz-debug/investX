import React, { useState, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, TrendingUp, TrendingDown, Search, ChevronRight } from 'lucide-react';
import { useInvestments } from '@/context/InvestmentContext';

// ── Stocks data ────────────────────────────────────────────────────────────────
const STOCKS = [
  { ticker: 'AAPL',  name: 'Apple Inc.',            price: 227.52, change: +1.84,  sector: 'Technology', logo: '/logos/AAPL.png' },
  { ticker: 'MSFT',  name: 'Microsoft Corp.',        price: 415.30, change: +2.10,  sector: 'Technology', logo: '/logos/MSFT.png' },
  { ticker: 'NVDA',  name: 'NVIDIA Corp.',           price: 131.38, change: +4.55,  sector: 'Technology', logo: '/logos/NVDA.png' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.',          price: 189.74, change: -0.63,  sector: 'Technology', logo: '/logos/GOOGL.png' },
  { ticker: 'AMZN',  name: 'Amazon.com Inc.',        price: 205.60, change: +1.22,  sector: 'Consumer',   logo: '/logos/AMZN.png' },
  { ticker: 'TSLA',  name: 'Tesla Inc.',             price: 248.42, change: -2.38,  sector: 'Automotive', logo: '/logos/TSLA.png' },
  { ticker: 'META',  name: 'Meta Platforms',         price: 572.15, change: +3.05,  sector: 'Technology', logo: '/logos/META.png' },
  { ticker: 'NFLX',  name: 'Netflix Inc.',           price: 983.45, change: +8.70,  sector: 'Media',      logo: '/logos/NFLX.png' },
  { ticker: 'JPM',   name: 'JPMorgan Chase',         price: 245.80, change: +0.95,  sector: 'Finance',    logo: '/logos/JPM.png' },
  { ticker: 'V',     name: 'Visa Inc.',              price: 295.32, change: +1.40,  sector: 'Finance',    logo: '/logos/V.png' },
  { ticker: 'BAC',   name: 'Bank of America',        price: 44.78,  change: +0.34,  sector: 'Finance',    logo: '/logos/BAC.png' },
  { ticker: 'WMT',   name: 'Walmart Inc.',           price: 98.65,  change: +0.78,  sector: 'Retail',     logo: '/logos/WMT.png' },
  { ticker: 'DIS',   name: 'The Walt Disney Co.',    price: 111.20, change: -1.05,  sector: 'Media',      logo: '/logos/DIS.png' },
  { ticker: 'AMD',   name: 'Advanced Micro Devices', price: 162.44, change: +5.22,  sector: 'Technology', logo: '/logos/AMD.png' },
  { ticker: 'INTC',  name: 'Intel Corp.',            price: 21.30,  change: -0.45,  sector: 'Technology', logo: '/logos/INTC.png' },
  { ticker: 'PYPL',  name: 'PayPal Holdings',        price: 88.92,  change: +1.68,  sector: 'Finance',    logo: '/logos/PYPL.png' },
  { ticker: 'UBER',  name: 'Uber Technologies',      price: 82.10,  change: +2.90,  sector: 'Transport',  logo: '/logos/UBER.png' },
  { ticker: 'SHOP',  name: 'Shopify Inc.',           price: 108.55, change: +3.44,  sector: 'Technology', logo: '/logos/SHOP.png' },
  { ticker: 'COIN',  name: 'Coinbase Global',        price: 265.30, change: -4.10,  sector: 'Finance',    logo: '/logos/COIN.png' },
  { ticker: 'PLTR',  name: 'Palantir Technologies',  price: 38.72,  change: +6.88,  sector: 'Technology', logo: '/logos/PLTR.png' },
  { ticker: 'SQ',    name: 'Block Inc.',             price: 72.45,  change: +1.22,  sector: 'Finance',    logo: '/logos/SQ.png' },
  { ticker: 'SPOT',  name: 'Spotify Technology',     price: 398.20, change: +4.15,  sector: 'Media',      logo: '/logos/SPOT.png' },
  { ticker: 'HOOD',  name: 'Robinhood Markets',      price: 26.88,  change: +2.34,  sector: 'Finance',    logo: '/logos/HOOD.png' },
  { ticker: 'SNOW',  name: 'Snowflake Inc.',         price: 174.60, change: -1.80,  sector: 'Technology', logo: '/logos/SNOW.png' },
  { ticker: 'ABNB',  name: 'Airbnb Inc.',            price: 148.90, change: +0.92,  sector: 'Travel',     logo: '/logos/ABNB.png' },
  { ticker: 'CRM',   name: 'Salesforce Inc.',        price: 298.44, change: +2.55,  sector: 'Technology', logo: '/logos/CRM.png' },
];

// ── Plan lookup ────────────────────────────────────────────────────────────────
const PLANS: Record<string, { name: string; rate: string }> = {
  basic:    { name: 'Basic Plan',    rate: '5%' },
  standard: { name: 'Standard Plan', rate: '6%' },
  premium:  { name: 'Premium Plan',  rate: '7%' },
  excel:    { name: 'Excel Plus',    rate: '10%' },
};

// ── Announcements ──────────────────────────────────────────────────────────────
const BASE_ANNOUNCEMENTS = [
  '🔥 NVDA up +4.55% — strong AI demand drives gains',
  '📈 PLTR surges +6.88% on new government contract',
  '💰 NFLX hits new 52-week high at $983.45',
  '⚡ AMD rallies +5.22% following earnings beat',
  '📊 Markets open: S&P 500 up +0.8% in early trading',
  '🌍 Global tech rally continues — MSFT +2.10%',
  '🚀 META climbs +3.05% as ad revenue exceeds forecasts',
];

// Colour per sector
const SECTOR_COLOR: Record<string, string> = {
  Technology: '#6366f1',
  Finance:    '#10b981',
  Consumer:   '#f59e0b',
  Automotive: '#ef4444',
  Media:      '#8b5cf6',
  Retail:     '#06b6d4',
  Transport:  '#f97316',
  Travel:     '#14b8a6',
};

function pct(change: number, price: number) {
  return ((change / (price - change)) * 100).toFixed(2);
}

// ── Logo with fallback ─────────────────────────────────────────────────────────
function StockLogo({ logo, ticker, color, size = 48 }: { logo: string; ticker: string; color: string; size?: number }) {
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

// ── Ticker component ───────────────────────────────────────────────────────────
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

// ── Slideshow strip ────────────────────────────────────────────────────────────
function StockSlideshow() {
  const doubled = [...STOCKS, ...STOCKS];
  return (
    <div className="overflow-hidden py-3">
      <div
        className="flex gap-3 w-max"
        style={{ animation: 'slideshow 18s linear infinite' }}
      >
        {doubled.map((s, i) => {
          const up = s.change >= 0;
          const color = SECTOR_COLOR[s.sector] ?? '#6366f1';
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 shadow-sm shrink-0"
            >
              <StockLogo logo={s.logo} ticker={s.ticker} color={color} size={32} />
              <div>
                <div className="text-[11px] font-extrabold text-gray-900">{s.ticker}</div>
                <div className={`text-[10px] font-bold ${up ? 'text-emerald-500' : 'text-red-500'}`}>
                  {up ? '+' : ''}{s.change} ({up ? '+' : ''}{pct(s.change, s.price)}%)
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
export default function StocksPick() {
  const [, setLocation] = useLocation();
  const params = useParams<{ planId: string }>();
  const planId = params?.planId ?? 'basic';
  const plan = PLANS[planId] ?? PLANS.basic;
  const { investments } = useInvestments();
  const [query, setQuery] = useState('');

  const filtered = STOCKS.filter(
    s =>
      s.ticker.toLowerCase().includes(query.toLowerCase()) ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.sector.toLowerCase().includes(query.toLowerCase()),
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
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Select Stocks</span>
        <div className="w-16" />
      </div>

      {/* ── Announcement ticker ── */}
      <Ticker rate={plan.rate} planName={plan.name} />

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-2xl font-extrabold text-gray-900">Choose Your Stocks</h1>
        <p className="text-sm text-gray-500 mt-1">Select from {STOCKS.length}+ top-performing equities. Earn <span className="font-bold text-indigo-600">{plan.rate} daily</span> on every pick.</p>
      </div>

      {/* ── Live slideshow ── */}
      <div className="px-4">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Live Market</div>
      </div>
      <div className="bg-gray-50 border-y border-gray-100">
        <StockSlideshow />
      </div>

      {/* ── Search ── */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search stocks, sectors…"
            className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ── Stocks grid ── */}
      <div className="px-4 pb-36">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-2">
          {filtered.length} stocks available
        </div>
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(s => {
            const up       = s.change >= 0;
            const color    = SECTOR_COLOR[s.sector] ?? '#6366f1';
            const invKey   = `${planId}:${s.ticker}`;
            const inv      = investments[invKey];
            const isActive = inv?.status === 'active';
            const isStopped = inv?.status === 'stopped';
            return (
              <button
                key={s.ticker}
                onClick={() => setLocation(`/plan/${planId}/stocks/${s.ticker}`)}
                className="flex items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.99] hover:border-gray-300 hover:shadow-sm"
                style={isActive
                  ? { borderColor: '#22c55e', backgroundColor: '#f0fdf4' }
                  : isStopped
                    ? { borderColor: '#f59e0b', backgroundColor: '#fffbeb' }
                    : { borderColor: '#e5e7eb', backgroundColor: '#ffffff' }
                }
              >
                <StockLogo logo={s.logo} ticker={s.ticker} color={color} size={48} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-extrabold text-gray-900">{s.ticker}</span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ color, backgroundColor: color + '18' }}
                    >
                      {s.sector}
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
                  <div className="text-[11px] text-gray-500 truncate">{s.name}</div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-sm font-extrabold text-gray-900">${s.price.toFixed(2)}</span>
                    <span className={`flex items-center gap-0.5 text-[11px] font-bold ${up ? 'text-emerald-500' : 'text-red-500'}`}>
                      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {up ? '+' : ''}{s.change} ({up ? '+' : ''}{pct(s.change, s.price)}%)
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
