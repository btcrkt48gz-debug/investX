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

// ── Commodities data ───────────────────────────────────────────────────────────
const COMMODITIES = [
  // Precious Metals
  { ticker: 'GOLD',   name: 'Gold',            price: 2328.40, change: +18.60,  category: 'Metals',      color: '#D4A017', emoji: '🥇' },
  { ticker: 'SILVER', name: 'Silver',           price: 29.84,   change: +0.44,   category: 'Metals',      color: '#A8A9AD', emoji: '🥈' },
  { ticker: 'PLAT',   name: 'Platinum',         price: 988.50,  change: -6.20,   category: 'Metals',      color: '#E5E4E2', emoji: '⬜' },
  { ticker: 'PALL',   name: 'Palladium',        price: 998.30,  change: +12.80,  category: 'Metals',      color: '#CEC8B2', emoji: '🔘' },
  { ticker: 'COPP',   name: 'Copper',           price: 4.52,    change: +0.08,   category: 'Metals',      color: '#B87333', emoji: '🟤' },

  // Energy
  { ticker: 'WTI',    name: 'Crude Oil (WTI)',  price: 82.34,   change: -1.12,   category: 'Energy',      color: '#1a1a2e', emoji: '🛢️' },
  { ticker: 'BRENT',  name: 'Brent Crude',      price: 86.10,   change: -0.88,   category: 'Energy',      color: '#16213e', emoji: '⛽' },
  { ticker: 'NATGAS', name: 'Natural Gas',      price: 2.18,    change: +0.06,   category: 'Energy',      color: '#0f3460', emoji: '🔥' },
  { ticker: 'HEAT',   name: 'Heating Oil',      price: 2.64,    change: -0.03,   category: 'Energy',      color: '#533483', emoji: '🌡️' },
  { ticker: 'GASO',   name: 'Gasoline RBOB',    price: 2.55,    change: +0.04,   category: 'Energy',      color: '#e94560', emoji: '⚗️' },

  // Agriculture
  { ticker: 'CORN',   name: 'Corn',             price: 441.25,  change: +3.50,   category: 'Agriculture', color: '#f5a623', emoji: '🌽' },
  { ticker: 'WHEAT',  name: 'Wheat',            price: 582.00,  change: -8.25,   category: 'Agriculture', color: '#c8962e', emoji: '🌾' },
  { ticker: 'SOY',    name: 'Soybeans',         price: 1142.50, change: +11.75,  category: 'Agriculture', color: '#7cb518', emoji: '🫘' },
  { ticker: 'SUGA',   name: 'Sugar #11',        price: 18.92,   change: +0.28,   category: 'Agriculture', color: '#e8d5b7', emoji: '🍬' },
  { ticker: 'COFF',   name: 'Coffee Arabica',   price: 204.80,  change: +2.15,   category: 'Agriculture', color: '#6f4e37', emoji: '☕' },
  { ticker: 'COCO',   name: 'Cocoa',            price: 9240.00, change: +180.00, category: 'Agriculture', color: '#7b3f00', emoji: '🍫' },
  { ticker: 'COTT',   name: 'Cotton',           price: 80.44,   change: -0.62,   category: 'Agriculture', color: '#f0efe6', emoji: '☁️' },
  { ticker: 'LIVE',   name: 'Live Cattle',      price: 182.10,  change: +0.95,   category: 'Agriculture', color: '#8b4513', emoji: '🐄' },

  // Industrial
  { ticker: 'ALUM',   name: 'Aluminium',        price: 2418.50, change: +22.00,  category: 'Industrial',  color: '#848789', emoji: '🔩' },
  { ticker: 'NICK',   name: 'Nickel',           price: 17840.00,change: -180.00, category: 'Industrial',  color: '#72777d', emoji: '🔧' },
  { ticker: 'ZINC',   name: 'Zinc',             price: 2820.00, change: +34.50,  category: 'Industrial',  color: '#9fa8a3', emoji: '⚙️' },
  { ticker: 'LUMB',   name: 'Lumber',           price: 548.00,  change: +8.40,   category: 'Industrial',  color: '#8b5e3c', emoji: '🪵' },
];

// ── Category colours ────────────────────────────────────────────────────────────
const CAT_COLOR: Record<string, string> = {
  Metals:      '#D4A017',
  Energy:      '#ef4444',
  Agriculture: '#22c55e',
  Industrial:  '#6366f1',
};

// ── Announcements ──────────────────────────────────────────────────────────────
const BASE_ANNOUNCEMENTS = [
  '🥇 Gold surges to $2,328 — safe-haven demand at 8-month high',
  '🛢️ WTI Crude dips on supply data — traders eye $80 support',
  '🌽 Corn rallies +3.50 on drought forecasts across the Midwest',
  '☕ Coffee Arabica hits 3-year high as Brazilian harvest disappoints',
  '🥈 Silver breaks resistance — analysts target $32 next quarter',
  '🍫 Cocoa extends record run — supply squeeze from West Africa',
  '⛽ Brent Crude holds above $85 — OPEC+ cuts keep markets tight',
];

const CAT_LOGO: Record<string, string> = {
  Metals:      '/commodity-logos/metals.svg',
  Energy:      '/commodity-logos/energy.svg',
  Agriculture: '/commodity-logos/agriculture.svg',
  Industrial:  '/commodity-logos/industrial.svg',
};

function CommodityLogo({ category, color, size = 44, rounded = 'xl' }: {
  category: string; color: string; size?: number; rounded?: 'xl' | 'full';
}) {
  const logo = CAT_LOGO[category];
  const r = rounded === 'full' ? '50%' : '12px';
  if (logo) {
    return (
      <div style={{ width: size, height: size, borderRadius: r, overflow: 'hidden', flexShrink: 0, background: '#111' }}>
        <img src={logo} alt={category} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  return (
    <div
      style={{ width: size, height: size, borderRadius: r, backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: Math.round(size * 0.26), fontWeight: 800, color: 'white' }}
    >
      {category.slice(0, 3).toUpperCase()}
    </div>
  );
}

function TickerBadge({ ticker, color, size = 48, rounded = 'xl' }: {
  ticker: string; color: string; size?: number; rounded?: 'xl' | 'full';
}) {
  const [failed, setFailed] = useState(false);
  const commodity = COMMODITIES.find(c => c.ticker === ticker);
  const logo = commodity ? CAT_LOGO[commodity.category] : undefined;
  const r = rounded === 'full' ? '50%' : '12px';
  if (!logo || failed) {
    return (
      <div style={{ width: size, height: size, borderRadius: r, backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: Math.round(size * 0.26), fontWeight: 800, color: 'white' }}>
        {ticker.slice(0, 3)}
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: r, overflow: 'hidden', flexShrink: 0, background: '#111' }}>
      <img src={logo} alt={ticker} onError={() => setFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1000) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n < 10) return n.toFixed(4);
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
        style={{ animation: 'ticker 32s linear infinite' }}
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
function CommoditySlideshow() {
  const doubled = [...COMMODITIES, ...COMMODITIES];
  return (
    <div className="overflow-hidden py-3">
      <div
        className="flex gap-3 w-max"
        style={{ animation: 'slideshow 26s linear infinite' }}
      >
        {doubled.map((c, i) => {
          const up = c.change >= 0;
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 shadow-sm shrink-0"
            >
              <TickerBadge ticker={c.ticker} color={CAT_COLOR[c.category] ?? '#D4A017'} size={32} />
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
export default function CommoditiesPick() {
  const [, setLocation] = useLocation();
  const params = useParams<{ planId: string }>();
  const planId = params?.planId ?? 'basic';
  const plan = PLANS[planId] ?? PLANS.basic;
  const { investments } = useInvestments();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Metals', 'Energy', 'Agriculture', 'Industrial'];

  const filtered = COMMODITIES.filter(c => {
    const matchesQuery =
      c.ticker.toLowerCase().includes(query.toLowerCase()) ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase());
    const matchesCat = activeCategory === 'All' || c.category === activeCategory;
    return matchesQuery && matchesCat;
  });

  const accent = '#eab308';

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
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Select Commodities</span>
        <div className="w-16" />
      </div>

      {/* ── Announcement ticker ── */}
      <Ticker rate={plan.rate} planName={plan.name} />

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-2xl font-extrabold text-gray-900">Choose Your Commodities</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select from {COMMODITIES.length}+ global commodities. Earn{' '}
          <span className="font-bold" style={{ color: accent }}>{plan.rate} daily</span> on every pick.
        </p>
      </div>

      {/* ── Live slideshow ── */}
      <div className="px-4">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Live Market</div>
      </div>
      <div className="bg-gray-50 border-y border-gray-100">
        <CommoditySlideshow />
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
            placeholder="Search commodities…"
            className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ── List ── */}
      <div className="px-4 pb-36">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-2">
          {filtered.length} commodities available
        </div>
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(c => {
            const up        = c.change >= 0;
            const catColor  = CAT_COLOR[c.category] ?? accent;
            const invKey    = `${planId}:${c.ticker}`;
            const inv       = investments[invKey];
            const isActive  = inv?.status === 'active';
            const isStopped = inv?.status === 'stopped';
            return (
              <button
                key={c.ticker}
                onClick={() => setLocation(`/plan/${planId}/commodities/${c.ticker}`)}
                className="flex items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.99] hover:border-gray-300 hover:shadow-sm"
                style={isActive
                  ? { borderColor: '#22c55e', backgroundColor: '#f0fdf4' }
                  : isStopped
                    ? { borderColor: '#f59e0b', backgroundColor: '#fffbeb' }
                    : { borderColor: '#e5e7eb', backgroundColor: '#ffffff' }
                }
              >
                <TickerBadge ticker={c.ticker} color={catColor} size={48} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-extrabold text-gray-900">{c.ticker}</span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ color: catColor, backgroundColor: catColor + '18' }}
                    >
                      {c.category}
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
                      {up ? '+' : ''}{fmt(Math.abs(c.change))} ({up ? '+' : '-'}{Math.abs(parseFloat(pctChange(c.change, c.price)))}%)
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
