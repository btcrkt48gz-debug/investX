import React, { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, TrendingUp, TrendingDown, Search, ChevronRight } from 'lucide-react';
import { useInvestments } from '@/context/InvestmentContext';

// ── Plan lookup ────────────────────────────────────────────────────────────────
const PLANS: Record<string, { name: string; rate: string }> = {
  basic:    { name: 'Basic Plan',    rate: '5%' },
  standard: { name: 'Standard Plan', rate: '6%' },
  premium:  { name: 'Premium Plan',  rate: '7%' },
  excel:    { name: 'Excel Plus',    rate: '10%' },
};

// ── Real estate data ───────────────────────────────────────────────────────────
const PROPERTIES = [
  // Residential REITs
  { ticker: 'EQR',   name: 'Equity Residential',       price: 68.42,  change: +0.88,  category: 'Residential', color: '#34d399', yield: '3.8%', location: 'Multi-city, USA',     emoji: '🏢' },
  { ticker: 'AVB',   name: 'AvalonBay Communities',    price: 194.56, change: +2.14,  category: 'Residential', color: '#34d399', yield: '3.6%', location: 'East Coast, USA',     emoji: '🏘️' },
  { ticker: 'ESS',   name: 'Essex Property Trust',     price: 248.80, change: -1.40,  category: 'Residential', color: '#34d399', yield: '4.0%', location: 'West Coast, USA',     emoji: '🏠' },
  { ticker: 'MAA',   name: 'Mid-America Apartment',    price: 134.22, change: +1.06,  category: 'Residential', color: '#34d399', yield: '4.3%', location: 'Sun Belt, USA',       emoji: '🏡' },
  { ticker: 'CPT',   name: 'Camden Property Trust',    price: 112.30, change: +0.74,  category: 'Residential', color: '#34d399', yield: '4.1%', location: 'South & West, USA',   emoji: '🏗️' },

  // Commercial REITs
  { ticker: 'PLD',   name: 'Prologis Inc.',            price: 118.44, change: +2.60,  category: 'Commercial',  color: '#60a5fa', yield: '3.2%', location: 'Global Logistics',    emoji: '🏭' },
  { ticker: 'AMT',   name: 'American Tower Corp.',     price: 192.38, change: +3.80,  category: 'Commercial',  color: '#60a5fa', yield: '3.5%', location: 'Global Towers',       emoji: '📡' },
  { ticker: 'CCI',   name: 'Crown Castle Inc.',        price: 98.70,  change: -0.90,  category: 'Commercial',  color: '#60a5fa', yield: '6.2%', location: 'USA Towers',          emoji: '🗼' },
  { ticker: 'CBRE',  name: 'CBRE Group',               price: 104.88, change: +1.92,  category: 'Commercial',  color: '#60a5fa', yield: '2.1%', location: 'Global RE Services',  emoji: '🏬' },
  { ticker: 'BXP',   name: 'Boston Properties',        price: 62.14,  change: -0.62,  category: 'Commercial',  color: '#60a5fa', yield: '6.8%', location: 'Major US Cities',     emoji: '🏙️' },

  // Retail REITs
  { ticker: 'SPG',   name: 'Simon Property Group',     price: 148.92, change: +1.44,  category: 'Retail',      color: '#f59e0b', yield: '5.4%', location: 'Premium Malls, USA',  emoji: '🛍️' },
  { ticker: 'REG',   name: 'Regency Centers',          price: 66.08,  change: +0.52,  category: 'Retail',      color: '#f59e0b', yield: '4.5%', location: 'Open-Air Centers',    emoji: '🏪' },
  { ticker: 'FRT',   name: 'Federal Realty Trust',     price: 100.44, change: +0.88,  category: 'Retail',      color: '#f59e0b', yield: '4.7%', location: 'Mixed-Use, USA',      emoji: '🏦' },
  { ticker: 'KIM',   name: 'Kimco Realty',             price: 20.86,  change: -0.18,  category: 'Retail',      color: '#f59e0b', yield: '4.8%', location: 'Suburban Centers',    emoji: '🏩' },

  // Healthcare REITs
  { ticker: 'WELL',  name: 'Welltower Inc.',           price: 112.60, change: +2.20,  category: 'Healthcare',  color: '#a78bfa', yield: '2.8%', location: 'Senior Housing',      emoji: '🏥' },
  { ticker: 'VTR',   name: 'Ventas Inc.',              price: 46.72,  change: +0.64,  category: 'Healthcare',  color: '#a78bfa', yield: '4.2%', location: 'Medical Facilities',  emoji: '🏨' },
  { ticker: 'PEAK',  name: 'Healthpeak Properties',    price: 18.44,  change: +0.28,  category: 'Healthcare',  color: '#a78bfa', yield: '6.4%', location: 'Life Science, USA',   emoji: '⚕️' },

  // Industrial & Data
  { ticker: 'DLR',   name: 'Digital Realty Trust',     price: 148.20, change: +4.40,  category: 'Industrial',  color: '#f87171', yield: '3.4%', location: 'Global Data Centers', emoji: '🖥️' },
  { ticker: 'EQIX',  name: 'Equinix Inc.',             price: 762.50, change: +12.80, category: 'Industrial',  color: '#f87171', yield: '2.2%', location: 'Global Colocation',   emoji: '🔌' },
  { ticker: 'PSA',   name: 'Public Storage',           price: 296.40, change: -2.60,  category: 'Industrial',  color: '#f87171', yield: '4.5%', location: 'Self-Storage, USA',   emoji: '📦' },
  { ticker: 'EXR',   name: 'Extra Space Storage',      price: 148.80, change: +1.80,  category: 'Industrial',  color: '#f87171', yield: '4.8%', location: 'Self-Storage, USA',   emoji: '🗄️' },

  // International
  { ticker: 'GLP',   name: 'Global Logistic Properties', price: 3.82, change: +0.06, category: 'International', color: '#fb923c', yield: '5.2%', location: 'Asia Pacific',        emoji: '🌏' },
  { ticker: 'SEGRO', name: 'SEGRO plc',                price: 9.14,  change: +0.14,  category: 'International', color: '#fb923c', yield: '3.1%', location: 'Europe Logistics',    emoji: '🇪🇺' },
];

// ── Category colours ───────────────────────────────────────────────────────────
const CAT_COLOR: Record<string, string> = {
  Residential:  '#34d399',
  Commercial:   '#60a5fa',
  Retail:       '#f59e0b',
  Healthcare:   '#a78bfa',
  Industrial:   '#f87171',
  International:'#fb923c',
};

// ── Announcements ──────────────────────────────────────────────────────────────
const BASE_ANNOUNCEMENTS = [
  '🏢 Prologis +2.6% — global logistics demand drives warehouse REITs higher',
  '📡 American Tower beats estimates — 5G expansion fuels tower REIT growth',
  '🏥 Welltower hits 52-week high — senior housing demand surges post-pandemic',
  '🛍️ Simon Property Group raises dividend — premium malls outperform forecasts',
  '🖥️ Digital Realty surges +4.4% — AI data center demand at record levels',
  '🏠 US housing market tightens — residential REITs poised for rent increases',
  '🌏 Asia Pacific logistics boom drives Global Logistic Properties earnings beat',
];

function REITLogo({ size = 44, rounded = 'xl' }: { size?: number; rounded?: 'xl' | 'full' }) {
  const r = rounded === 'full' ? '50%' : '12px';
  return (
    <div style={{ width: size, height: size, borderRadius: r, overflow: 'hidden', flexShrink: 0 }}>
      <img src="/real-estate-hero.jpg" alt="Real Estate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}

function TickerBadge({ ticker, color, size = 48, rounded = 'xl' }: {
  ticker: string; color: string; size?: number; rounded?: 'xl' | 'full';
}) {
  const [failed, setFailed] = useState(false);
  const r = rounded === 'full' ? '50%' : '12px';
  if (failed) {
    return (
      <div style={{ width: size, height: size, borderRadius: r, backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: Math.round(size * 0.26), fontWeight: 800, color: 'white' }}>
        {ticker.slice(0, 3)}
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: r, overflow: 'hidden', flexShrink: 0 }}>
      <img src="/real-estate-hero.jpg" alt={ticker} onError={() => setFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}

function fmt(n: number) {
  if (n >= 100) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toFixed(2);
}

function pctChange(change: number, price: number) {
  return ((change / (price - change)) * 100).toFixed(2);
}

// ── Ticker ─────────────────────────────────────────────────────────────────────
function Ticker({ rate, planName }: { rate: string; planName: string }) {
  const announcements = [...BASE_ANNOUNCEMENTS, `💎 Invest now — ${rate} daily returns with InvestX ${planName}`];
  const text = announcements.join('   ·   ');
  return (
    <div className="bg-gray-900 text-white py-2.5 overflow-hidden relative">
      <div
        className="whitespace-nowrap text-[11px] font-semibold tracking-wide inline-block"
        style={{ animation: 'ticker 34s linear infinite' }}
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
function RealEstateSlideshow() {
  const doubled = [...PROPERTIES, ...PROPERTIES];
  return (
    <div className="overflow-hidden py-3">
      <div
        className="flex gap-3 w-max"
        style={{ animation: 'slideshow 30s linear infinite' }}
      >
        {doubled.map((p, i) => {
          const up = p.change >= 0;
          const color = CAT_COLOR[p.category] ?? '#34d399';
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 shadow-sm shrink-0"
            >
              <TickerBadge ticker={p.ticker} color={color} size={32} />
              <div>
                <div className="text-[11px] font-extrabold text-gray-900">{p.ticker}</div>
                <div className={`text-[10px] font-bold ${up ? 'text-emerald-500' : 'text-red-500'}`}>
                  {up ? '+' : ''}{pctChange(p.change, p.price)}%
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
export default function RealEstatePick() {
  const [, setLocation] = useLocation();
  const params = useParams<{ planId: string }>();
  const planId = params?.planId ?? 'basic';
  const plan = PLANS[planId] ?? PLANS.basic;
  const { investments } = useInvestments();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Residential', 'Commercial', 'Retail', 'Healthcare', 'Industrial', 'International'];

  const filtered = PROPERTIES.filter(p => {
    const matchesQuery =
      p.ticker.toLowerCase().includes(query.toLowerCase()) ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.location.toLowerCase().includes(query.toLowerCase());
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    return matchesQuery && matchesCat;
  });

  const accent = '#34d399';

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
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Select Real Estate</span>
        <div className="w-16" />
      </div>

      {/* ── Announcement ticker ── */}
      <Ticker rate={plan.rate} planName={plan.name} />

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-2xl font-extrabold text-gray-900">Choose Your Properties</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select from {PROPERTIES.length}+ premium REITs & property funds. Earn{' '}
          <span className="font-bold" style={{ color: accent }}>{plan.rate} daily</span> on every pick.
        </p>
      </div>

      {/* ── Live slideshow ── */}
      <div className="px-4">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Live Market</div>
      </div>
      <div className="bg-gray-50 border-y border-gray-100">
        <RealEstateSlideshow />
      </div>

      {/* ── Category filter tabs ── */}
      <div className="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
        {categories.map(cat => {
          const active = cat === activeCategory;
          const catColor = cat === 'All' ? accent : (CAT_COLOR[cat] ?? accent);
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0"
              style={active
                ? { backgroundColor: catColor + '20', color: catColor, border: `1px solid ${catColor}50` }
                : { backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #e5e7eb' }
              }
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── Search ── */}
      <div className="px-4 pt-2 pb-2">
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search properties, REITs, locations…"
            className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ── Property list ── */}
      <div className="px-4 pb-36">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-2">
          {filtered.length} properties available
        </div>
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(p => {
            const up        = p.change >= 0;
            const catColor  = CAT_COLOR[p.category] ?? accent;
            const invKey    = `${planId}:${p.ticker}`;
            const inv       = investments[invKey];
            const isActive  = inv?.status === 'active';
            const isStopped = inv?.status === 'stopped';
            return (
              <button
                key={p.ticker}
                onClick={() => setLocation(`/plan/${planId}/realestate/${p.ticker}`)}
                className="flex items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.99] hover:border-gray-300 hover:shadow-sm"
                style={isActive
                  ? { borderColor: '#22c55e', backgroundColor: '#f0fdf4' }
                  : isStopped
                    ? { borderColor: '#f59e0b', backgroundColor: '#fffbeb' }
                    : { borderColor: '#e5e7eb', backgroundColor: '#ffffff' }
                }
              >
                <TickerBadge ticker={p.ticker} color={catColor} size={48} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-extrabold text-gray-900">{p.ticker}</span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ color: catColor, backgroundColor: catColor + '18' }}
                    >
                      {p.category}
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
                  <div className="text-[11px] text-gray-500 truncate">{p.name}</div>
                  <div className="text-[10px] text-gray-400 truncate mb-1">📍 {p.location}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-gray-900">${fmt(p.price)}</span>
                    <span className={`flex items-center gap-0.5 text-[11px] font-bold ${up ? 'text-emerald-500' : 'text-red-500'}`}>
                      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {up ? '+' : ''}{fmt(Math.abs(p.change))} ({up ? '+' : '-'}{Math.abs(parseFloat(pctChange(p.change, p.price)))}%)
                    </span>
                    <span className="text-[10px] font-bold ml-auto" style={{ color: catColor }}>
                      {p.yield} yield
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
