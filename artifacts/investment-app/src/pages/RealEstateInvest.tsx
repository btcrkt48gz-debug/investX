import React, { useState, useMemo } from 'react';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Info, Check, AlertCircle, Square, ArrowRightLeft } from 'lucide-react';
import { useInvestments, useLiveBalance } from '@/context/InvestmentContext';
import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip } from 'recharts';

// ── Plans ──────────────────────────────────────────────────────────────────────
const PLANS: Record<string, { name: string; dailyRate: number; minInvest: number; maxInvest: number; color: string }> = {
  basic:    { name: 'Basic Plan',    dailyRate: 0.05, minInvest: 50,     maxInvest: 1_000,   color: '#3B82F6' },
  standard: { name: 'Standard Plan', dailyRate: 0.06, minInvest: 1_100,  maxInvest: 10_000,  color: '#8B5CF6' },
  premium:  { name: 'Premium Plan',  dailyRate: 0.07, minInvest: 11_000, maxInvest: 20_000,  color: '#F59E0B' },
  excel:    { name: 'Excel Plus',    dailyRate: 0.10, minInvest: 21_000, maxInvest: 100_000, color: '#EF4444' },
};

// ── Property registry ──────────────────────────────────────────────────────────
const PROPERTIES: Record<string, {
  name: string; price: number; change: number; color: string; emoji: string;
  category: string; yield: string; location: string; mktCap: string; vol: string; desc: string;
}> = {
  EQR:   { name: 'Equity Residential',        price: 68.42,   change: +0.88,  color: '#34d399', emoji: '🏢', category: 'Residential',   yield: '3.8%', location: 'Multi-city, USA',     mktCap: '$25.4B', vol: '$198M', desc: 'Equity Residential is one of the largest publicly traded apartment REITs, owning and operating over 80,000 units in high-density urban markets including Boston, New York, Seattle, and San Francisco. Rising urban rents and limited new supply support sustained NOI growth.' },
  AVB:   { name: 'AvalonBay Communities',     price: 194.56,  change: +2.14,  color: '#34d399', emoji: '🏘️', category: 'Residential',   yield: '3.6%', location: 'East Coast, USA',     mktCap: '$28.1B', vol: '$212M', desc: 'AvalonBay Communities develops, redevelops, and manages luxury apartment communities across 12 states and DC. Its focus on high-barrier-to-entry coastal markets and development pipeline of 17,000+ homes positions it for superior long-term rent growth.' },
  ESS:   { name: 'Essex Property Trust',      price: 248.80,  change: -1.40,  color: '#34d399', emoji: '🏠', category: 'Residential',   yield: '4.0%', location: 'West Coast, USA',     mktCap: '$16.8B', vol: '$142M', desc: 'Essex Property Trust owns and manages 62,000+ apartment homes along the West Coast, concentrated in supply-constrained California and Seattle markets. Tech sector employment drives tenant demand and supports above-average rent growth and occupancy.' },
  MAA:   { name: 'Mid-America Apartment',     price: 134.22,  change: +1.06,  color: '#34d399', emoji: '🏡', category: 'Residential',   yield: '4.3%', location: 'Sun Belt, USA',       mktCap: '$15.6B', vol: '$118M', desc: 'Mid-America Apartment Communities is the leading Sun Belt residential REIT with 102,000+ units across the Southeast and Southwest. Population migration to lower-tax, high-growth metros like Atlanta, Dallas, and Phoenix drives sustained occupancy and rent gains.' },
  CPT:   { name: 'Camden Property Trust',     price: 112.30,  change: +0.74,  color: '#34d399', emoji: '🏗️', category: 'Residential',   yield: '4.1%', location: 'South & West, USA',   mktCap: '$10.8B', vol: '$88M',  desc: 'Camden Property Trust owns and develops apartment communities in high-growth Sunbelt and Mountain West markets. Its development pipeline, disciplined balance sheet, and above-average resident satisfaction scores make it a premium residential REIT.' },
  PLD:   { name: 'Prologis Inc.',             price: 118.44,  change: +2.60,  color: '#60a5fa', emoji: '🏭', category: 'Commercial',    yield: '3.2%', location: 'Global Logistics',    mktCap: '$108B',  vol: '$624M', desc: 'Prologis is the world\'s largest industrial REIT, owning 1.2B sq ft of logistics and distribution facilities across 19 countries. E-commerce-driven demand for last-mile fulfillment and supply chain resilience investments are key structural tailwinds for rent and occupancy growth.' },
  AMT:   { name: 'American Tower Corp.',      price: 192.38,  change: +3.80,  color: '#60a5fa', emoji: '📡', category: 'Commercial',    yield: '3.5%', location: 'Global Towers',       mktCap: '$89.4B', vol: '$512M', desc: 'American Tower is the world\'s largest cell tower REIT with 220,000+ communications sites across 25 countries. The 5G infrastructure buildout is creating a multi-year amendment cycle on existing leases, driving compounding revenue and free cash flow growth.' },
  CCI:   { name: 'Crown Castle Inc.',         price: 98.70,   change: -0.90,  color: '#60a5fa', emoji: '🗼', category: 'Commercial',    yield: '6.2%', location: 'USA Towers',          mktCap: '$41.2B', vol: '$298M', desc: 'Crown Castle is the largest US-only tower REIT, owning 40,000+ cell towers and 115,000 small cell nodes across fiber networks. Its pure-play US focus and small cell strategy position it to benefit disproportionately from domestic 5G densification.' },
  CBRE:  { name: 'CBRE Group',                price: 104.88,  change: +1.92,  color: '#60a5fa', emoji: '🏬', category: 'Commercial',    yield: '2.1%', location: 'Global RE Services',  mktCap: '$33.8B', vol: '$244M', desc: 'CBRE Group is the world\'s largest commercial real estate services firm, providing leasing, property management, investment sales, and valuation services globally. Its advisory, transaction, and REI segments create a diversified, asset-light revenue model.' },
  BXP:   { name: 'Boston Properties',         price: 62.14,   change: -0.62,  color: '#60a5fa', emoji: '🏙️', category: 'Commercial',    yield: '6.8%', location: 'Major US Cities',     mktCap: '$9.4B',  vol: '$76M',  desc: 'Boston Properties is the largest publicly traded developer and owner of Class A office properties in Boston, New York, San Francisco, Seattle, and Los Angeles. Its trophy-quality assets in gateway cities attract blue-chip tenants with long-term leases.' },
  SPG:   { name: 'Simon Property Group',      price: 148.92,  change: +1.44,  color: '#f59e0b', emoji: '🛍️', category: 'Retail',        yield: '5.4%', location: 'Premium Malls, USA',  mktCap: '$48.2B', vol: '$322M', desc: 'Simon Property Group is the largest retail REIT and owner of premium outlet and mall properties in the US and internationally. Its "A" mall portfolio, mixed-use redevelopment strategy, and JCPenney/Brooks Brothers ownership distinguish it from commodity retail REITs.' },
  REG:   { name: 'Regency Centers',           price: 66.08,   change: +0.52,  color: '#f59e0b', emoji: '🏪', category: 'Retail',        yield: '4.5%', location: 'Open-Air Centers',    mktCap: '$12.8B', vol: '$92M',  desc: 'Regency Centers is the premier grocery-anchored shopping center REIT, owning 480+ properties in affluent suburban trade areas. Grocery-anchored retail is among the most defensive real estate formats, with high essential-goods demand and low e-commerce disruption risk.' },
  FRT:   { name: 'Federal Realty Trust',      price: 100.44,  change: +0.88,  color: '#f59e0b', emoji: '🏦', category: 'Retail',        yield: '4.7%', location: 'Mixed-Use, USA',      mktCap: '$8.2B',  vol: '$68M',  desc: 'Federal Realty Trust is the only S&P 500 retail REIT and holds the longest consecutive dividend growth record in the REIT sector. Its mixed-use development strategy in high-income, supply-constrained markets generates above-average long-term total returns.' },
  KIM:   { name: 'Kimco Realty',              price: 20.86,   change: -0.18,  color: '#f59e0b', emoji: '🏩', category: 'Retail',        yield: '4.8%', location: 'Suburban Centers',    mktCap: '$14.4B', vol: '$112M', desc: 'Kimco Realty owns and operates 520+ open-air shopping centers primarily in major metro areas. Its merger with RPT Realty expanded its Sun Belt footprint, and its Suburban Square mixed-use redevelopments unlock significant embedded value in its existing portfolio.' },
  WELL:  { name: 'Welltower Inc.',            price: 112.60,  change: +2.20,  color: '#a78bfa', emoji: '🏥', category: 'Healthcare',    yield: '2.8%', location: 'Senior Housing',      mktCap: '$58.2B', vol: '$388M', desc: 'Welltower is the largest healthcare REIT, owning senior housing, post-acute care, and outpatient medical facilities across the US, Canada, and UK. The aging US population — 10,000 Boomers turning 65 daily — creates a decades-long structural demand tailwind for senior housing.' },
  VTR:   { name: 'Ventas Inc.',               price: 46.72,   change: +0.64,  color: '#a78bfa', emoji: '🏨', category: 'Healthcare',    yield: '4.2%', location: 'Medical Facilities',  mktCap: '$19.8B', vol: '$148M', desc: 'Ventas owns 1,400+ healthcare properties including senior housing communities, medical office buildings, and life science research facilities. Its university-based research campus portfolio offers exceptional growth potential as biotech and pharma R&D spending accelerates.' },
  PEAK:  { name: 'Healthpeak Properties',     price: 18.44,   change: +0.28,  color: '#a78bfa', emoji: '⚕️', category: 'Healthcare',    yield: '6.4%', location: 'Life Science, USA',   mktCap: '$10.4B', vol: '$82M',  desc: 'Healthpeak Properties focuses on life science campuses, medical office buildings, and continuing care retirement communities. Its Labspace portfolio serving biotech and pharma tenants in San Diego, San Francisco, and Boston is among the most sought-after real estate in the US.' },
  DLR:   { name: 'Digital Realty Trust',      price: 148.20,  change: +4.40,  color: '#f87171', emoji: '🖥️', category: 'Industrial',    yield: '3.4%', location: 'Global Data Centers', mktCap: '$42.4B', vol: '$318M', desc: 'Digital Realty Trust is the world\'s largest data center REIT, owning 300+ facilities across 50 metros on 6 continents. The explosive growth of AI, cloud computing, and enterprise digital transformation is driving record leasing demand, pushing vacancy rates to historic lows globally.' },
  EQIX:  { name: 'Equinix Inc.',              price: 762.50,  change: +12.80, color: '#f87171', emoji: '🔌', category: 'Industrial',    yield: '2.2%', location: 'Global Colocation',   mktCap: '$68.8B', vol: '$422M', desc: 'Equinix operates 260+ International Business Exchange data centers in 33 countries, providing carrier-neutral colocation that enables cloud, network, and IT interconnection. Its network effects — 10,000+ customers interconnecting — create a near-impossible-to-replicate competitive moat.' },
  PSA:   { name: 'Public Storage',            price: 296.40,  change: -2.60,  color: '#f87171', emoji: '📦', category: 'Industrial',    yield: '4.5%', location: 'Self-Storage, USA',   mktCap: '$51.8B', vol: '$312M', desc: 'Public Storage is the world\'s largest self-storage REIT with 3,000+ facilities and 200M sq ft of rentable space across the US. Its brand recognition, operational scale, and recession-resistant demand profile — people need storage in both good and bad economic times — make it a defensive compounder.' },
  EXR:   { name: 'Extra Space Storage',       price: 148.80,  change: +1.80,  color: '#f87171', emoji: '🗄️', category: 'Industrial',    yield: '4.8%', location: 'Self-Storage, USA',   mktCap: '$24.6B', vol: '$188M', desc: 'Extra Space Storage is the second-largest US self-storage REIT, owning and managing 3,700+ properties following its transformative merger with Life Storage. Its technology-driven revenue management platform consistently generates sector-leading same-store revenue growth.' },
  GLP:   { name: 'Global Logistic Properties',price: 3.82,    change: +0.06,  color: '#fb923c', emoji: '🌏', category: 'International', yield: '5.2%', location: 'Asia Pacific',        mktCap: '$8.8B',  vol: '$48M',  desc: 'Global Logistic Properties is Asia\'s largest provider of modern logistics facilities with 60M sq m of properties across China, Japan, Australia, and Southeast Asia. The rapid growth of e-commerce across Asia is driving unprecedented demand for Grade-A logistics real estate.' },
  SEGRO: { name: 'SEGRO plc',                 price: 9.14,    change: +0.14,  color: '#fb923c', emoji: '🇪🇺', category: 'International', yield: '3.1%', location: 'Europe Logistics',    mktCap: '$14.2B', vol: '$88M',  desc: 'SEGRO is the UK\'s largest REIT and Europe\'s leading owner-developer of modern industrial and logistics properties. Its strategic urban-edge locations near major European cities capture last-mile delivery demand, with vacancy at record lows across its UK and Continental European portfolio.' },
};

// ── Category accent colours ────────────────────────────────────────────────────
const CAT_COLOR: Record<string, string> = {
  Residential:  '#34d399',
  Commercial:   '#60a5fa',
  Retail:       '#f59e0b',
  Healthcare:   '#a78bfa',
  Industrial:   '#f87171',
  International:'#fb923c',
};

// ── Chart ──────────────────────────────────────────────────────────────────────
const RANGES = ['1D', '1W', '1M', '1Y', 'All'] as const;
type Range = typeof RANGES[number];

function seedRng(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function makeChartData(ticker: string, range: Range, price: number, up: boolean) {
  const pts        = { '1D': 48, '1W': 56, '1M': 60, '1Y': 52, 'All': 60 }[range];
  const volatility = { '1D': 0.005, '1W': 0.009, '1M': 0.015, '1Y': 0.025, 'All': 0.035 }[range];
  const seed = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + RANGES.indexOf(range) * 997;
  const rng  = seedRng(seed);
  const data: { i: number; v: number }[] = [];
  let v = price * (0.90 + rng() * 0.08);
  for (let i = 0; i < pts; i++) {
    v += (rng() - (up ? 0.47 : 0.53)) * price * volatility;
    v  = Math.max(v, price * 0.6);
    data.push({ i, v: parseFloat(v.toFixed(2)) });
  }
  data[data.length - 1].v = price;
  return data;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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

// ── Page ───────────────────────────────────────────────────────────────────────
export default function RealEstateInvest() {
  const { planId = 'basic', ticker = 'PLD' } = useParams<{ planId: string; ticker: string }>();
  const [, setLocation] = useLocation();
  const { investments, cashBalance, placeInvestment, stopInvestment, transferToCash } = useInvestments();

  const plan      = PLANS[planId]               ?? PLANS.basic;
  const property  = PROPERTIES[ticker.toUpperCase()] ?? PROPERTIES.PLD;
  const tickerUp  = ticker.toUpperCase();
  const up        = property.change >= 0;
  const pctStr    = ((property.change / (property.price - property.change)) * 100).toFixed(2);
  const catColor  = CAT_COLOR[property.category] ?? '#34d399';
  const activeInvEntry = Object.entries(investments).find(
    ([, inv]) => inv.ticker === tickerUp && inv.planId === planId
  );
  const invKey    = activeInvEntry?.[0] ?? '';
  const activeInv = activeInvEntry?.[1];
  const hasActive  = !!activeInv && activeInv.status === 'active';
  const hasStopped = !!activeInv && activeInv.status === 'stopped';

  const [range, setRange]   = useState<Range>('1D');
  const [amount, setAmount] = useState('');
  const [done, setDone]     = useState(false);

  const liveBalance = useLiveBalance(activeInv);
  const chartData   = useMemo(() => makeChartData(tickerUp, range, property.price, up), [ticker, range]);
  const lineColor   = up ? '#22c55e' : '#ef4444';

  const numAmt      = parseFloat(amount) || 0;
  const daily       = numAmt * plan.dailyRate;
  const total3d     = daily * 3;
  const payout      = numAmt + total3d;
  const overMax     = numAmt > plan.maxInvest && numAmt > 0;
  const overBalance = numAmt > cashBalance && numAmt > 0;
  const canInvest   = numAmt >= plan.minInvest && !overMax && !overBalance && !hasActive && !hasStopped;

  // ── Success screen ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <TickerBadge ticker={tickerUp} color={catColor} size={80} rounded="full" />
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Investment Placed!</h2>
        <p className="text-[13px] text-gray-500 mb-1">
          <span className="font-semibold text-gray-800">${fmt(numAmt)}</span> invested in{' '}
          <span className="font-semibold text-gray-800">{property.name}</span> via{' '}
          <span className="font-semibold" style={{ color: plan.color }}>{plan.name}</span>.
        </p>
        <p className="text-[12px] text-gray-400 mb-8">
          Expected payout in 3 days:{' '}
          <span className="font-bold text-green-600">${fmt(payout)}</span>
        </p>
        <button
          onClick={() => setLocation(`/plan/${planId}/realestate`)}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-[14px] font-bold shadow hover:opacity-90 transition-opacity"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setLocation(`/plan/${planId}/realestate`)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={17} /> Back
        </button>
        <div className="text-center">
          <div className="text-[13px] font-extrabold text-gray-900">{tickerUp}</div>
          <div className="text-[10px] text-gray-400">{property.name}</div>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full text-white"
          style={{ backgroundColor: plan.color }}>
          {Math.round(plan.dailyRate * 100)}% daily
        </span>
      </div>

      {/* ── Price row ── */}
      <div className="px-5 pt-4 flex items-center gap-3">
        <TickerBadge ticker={tickerUp} color={catColor} size={44} />
        <div>
          <div className="text-2xl font-extrabold text-gray-900">${fmt(property.price)}</div>
          <div className={`text-[12px] font-bold flex items-center gap-1 ${up ? 'text-green-500' : 'text-red-500'}`}>
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {up ? '+' : ''}{fmt(Math.abs(property.change))} ({up ? '+' : ''}{pctStr}%)
            <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: catColor, backgroundColor: catColor + '18' }}>
              {property.yield} yield
            </span>
          </div>
        </div>
      </div>

      {/* ── Location badge ── */}
      <div className="px-5 mt-1">
        <span className="text-[10px] text-gray-400 font-medium">📍 {property.location}</span>
      </div>

      {/* ── Chart ── */}
      <div className="h-44 w-full mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 0, bottom: 4, left: 0 }}>
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip
              formatter={(v: number) => [`$${fmt(v)}`, tickerUp]}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
              itemStyle={{ color: lineColor }}
            />
            <Line type="monotone" dataKey="v" stroke={lineColor} strokeWidth={2} dot={false}
              activeDot={{ r: 4, fill: lineColor }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Range tabs ── */}
      <div className="flex justify-around px-5 mt-1 mb-4">
        {RANGES.map((r) => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-3 py-1 rounded-full text-[12px] font-bold transition-colors ${
              range === r ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-900'
            }`}>
            {r}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-4 pb-10">

        {/* ── Active / stopped investment panel ── */}
        {activeInv && (
          <div className={`rounded-2xl border p-4 space-y-3 ${
            hasActive ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {hasActive ? 'Active Investment' : 'Investment Stopped'}
            </div>

            <div className="flex items-start gap-3">
              {hasActive && (
                <div className="mt-1.5 shrink-0">
                  <span className="block w-3 h-3 rounded-full bg-red-500"
                    style={{
                      boxShadow: '0 0 0 3px rgba(239,68,68,0.2), 0 0 10px 3px rgba(239,68,68,0.55)',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-gray-500 font-medium mb-0.5">
                  {hasActive ? 'Live Balance' : 'Final Balance'}
                </div>

                {liveBalance !== null ? (() => {
                  const whole    = Math.floor(liveBalance);
                  const decimal  = (liveBalance - whole).toFixed(8).slice(1);
                  const cents    = decimal.slice(0, 3);
                  const subcents = decimal.slice(3);
                  return (
                    <div className="flex items-baseline gap-0">
                      <span className="text-[28px] font-extrabold text-gray-900 leading-none tracking-tight">
                        ${whole.toLocaleString('en-US')}
                      </span>
                      <span className="text-[22px] font-extrabold text-gray-900 leading-none">{cents}</span>
                      <span className="text-[13px] font-bold text-gray-400 leading-none mb-0.5">{subcents}</span>
                    </div>
                  );
                })() : <div className="text-[28px] font-extrabold text-gray-900">—</div>}

                <div className="text-[10px] text-gray-400 mt-1">
                  {hasActive && activeInv.profitPerSec > 0 && (
                    <span className="text-emerald-600 font-semibold">
                      +${(activeInv.profitPerSec).toFixed(8)}/sec
                    </span>
                  )}
                  {hasActive && ' · '}
                  via {PLANS[activeInv.planId]?.name ?? activeInv.planId} · started {activeInv.startDate}
                </div>

                {hasActive && (() => {
                  const elapsed = (Date.now() - activeInv.startTimestamp) / 1000;
                  const pct     = Math.min((elapsed / (3 * 24 * 3600)) * 100, 100);
                  return (
                    <div className="mt-2">
                      <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{pct.toFixed(4)}%</span>
                      </div>
                      <div className="h-1.5 bg-red-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {hasActive && (
              <button
                onClick={() => stopInvestment(invKey)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-extrabold text-red-600 bg-white border border-red-200 hover:bg-red-50 active:scale-[0.98] transition-all"
                style={{ boxShadow: '0 0 14px rgba(239,68,68,0.18)' }}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"
                  style={{ boxShadow: '0 0 6px 2px rgba(239,68,68,0.65)' }} />
                <Square size={12} className="fill-red-500 text-red-500" />
                Stop Investment
              </button>
            )}

            {hasStopped && (
              <button
                onClick={() => transferToCash(invKey)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-extrabold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all"
                style={{ boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }}
              >
                <ArrowRightLeft size={14} />
                Transfer ${fmt(activeInv.stoppedBalance ?? activeInv.amount)} to Cash Balance
              </button>
            )}
          </div>
        )}

        {/* ── Plan info strip ── */}
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3 border"
          style={{ backgroundColor: plan.color + '10', borderColor: plan.color + '30' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-[13px] shrink-0"
            style={{ backgroundColor: plan.color }}>
            {Math.round(plan.dailyRate * 100)}%
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-extrabold text-gray-900">{plan.name}</div>
            <div className="text-[11px] text-gray-500">
              {Math.round(plan.dailyRate * 100)}% daily · 3 days · min ${plan.minInvest.toLocaleString()}
            </div>
          </div>
        </div>

        {/* ── Amount input ── */}
        {!activeInv && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Investment Amount</div>
              <div className="text-[11px] text-gray-400">
                Range: <span className="font-bold text-gray-600">${plan.minInvest.toLocaleString()} – ${plan.maxInvest.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3">
              <span className="text-[18px] font-extrabold text-gray-400">$</span>
              <input
                type="number"
                min={plan.minInvest}
                max={plan.maxInvest}
                placeholder={`${plan.minInvest.toLocaleString()} – ${plan.maxInvest.toLocaleString()}`}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-[20px] font-extrabold text-gray-900 focus:outline-none"
              />
              <span className="text-[11px] text-gray-400 font-semibold">USD</span>
            </div>

            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-blue-500 shrink-0" />
                <span className="text-[12px] text-blue-700 font-semibold">Available Cash Balance</span>
              </div>
              <span className="text-[13px] font-extrabold text-blue-700">${fmt(cashBalance)}</span>
            </div>

            {overMax && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <span className="text-[12px] text-red-600 font-semibold">
                  Exceeds maximum of ${plan.maxInvest.toLocaleString()} for this plan
                </span>
              </div>
            )}
            {overBalance && !overMax && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <span className="text-[12px] text-red-600 font-semibold">Insufficient cash balance</span>
              </div>
            )}
          </div>
        )}

        {/* ── Earnings breakdown ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">3-Day Earnings Breakdown</div>
          {[
            { label: 'Investment',                                        val: numAmt > 0 ? `$${fmt(numAmt)}`      : '—', sub: undefined },
            { label: `Daily Return (${Math.round(plan.dailyRate*100)}%)`, val: numAmt > 0 ? `+$${fmt(daily)}/day` : '—', sub: undefined },
            { label: 'Total Earned (3 days)',                             val: numAmt > 0 ? `+$${fmt(total3d)}`    : '—', sub: `${(plan.dailyRate*3*100).toFixed(0)}% total return` },
          ].map(({ label, val, sub }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <div className="text-[12px] text-gray-500">{label}</div>
                {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
              </div>
              <div className={`text-[13px] font-bold ${val.startsWith('+') ? 'text-green-500' : 'text-gray-900'}`}>{val}</div>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-extrabold text-gray-900">Total Payout</span>
              <span className="text-[16px] font-extrabold text-green-600">
                {numAmt > 0 ? `$${fmt(payout)}` : '—'}
              </span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Returned to Cash Balance after 3 days</div>
          </div>
        </div>

        {/* ── About property ── */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">About {property.name}</div>
          <p className="text-[12px] text-gray-600 leading-relaxed">{property.desc}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Market Cap',  val: property.mktCap },
              { label: 'Daily Volume',val: property.vol },
              { label: 'REIT Yield',  val: property.yield },
              { label: 'Duration',    val: '3 days' },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white rounded-xl px-3 py-2.5 border border-gray-100">
                <div className="text-[10px] text-gray-400 font-semibold">{label}</div>
                <div className="text-[13px] font-extrabold text-gray-900 mt-0.5">{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Invest / blocker button ── */}
        {hasActive ? (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-4">
            <AlertCircle size={15} className="text-orange-500 shrink-0" />
            <span className="text-[12px] text-orange-700 font-semibold leading-snug">
              You have an active investment in {property.name}. Stop it first before placing a new one.
            </span>
          </div>
        ) : hasStopped ? (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-4">
            <AlertCircle size={15} className="text-orange-500 shrink-0" />
            <span className="text-[12px] text-orange-700 font-semibold leading-snug">
              Transfer your stopped balance to Cash Balance before investing again.
            </span>
          </div>
        ) : (
          <button
            disabled={!canInvest}
            onClick={() => {
              if (!canInvest) return;
              placeInvestment({
                ticker: tickerUp,
                planId,
                amount: numAmt,
                dailyRate: plan.dailyRate,
                startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                category: 'Real Estate',
                logo: '/real-estate-hero.jpg',
                name: property.name,
              });
              setDone(true);
            }}
            className="w-full py-4 rounded-2xl text-[15px] font-extrabold tracking-wide transition-all active:scale-[0.98]"
            style={canInvest
              ? { backgroundColor: plan.color, color: '#fff', boxShadow: `0 4px 20px ${plan.color}55` }
              : { backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }
            }
          >
            {canInvest
              ? `Invest $${fmt(numAmt)} in ${tickerUp}`
              : overMax
                ? `Maximum $${plan.maxInvest.toLocaleString()} for this plan`
                : overBalance
                  ? 'Insufficient cash balance'
                  : `Minimum $${plan.minInvest.toLocaleString()} to invest`}
          </button>
        )}

        <div className="flex items-start gap-2 text-[10px] text-gray-400 leading-relaxed">
          <Info size={11} className="shrink-0 mt-0.5" />
          Investment returns are based on the selected plan rate. Past performance does not guarantee future results.
        </div>

      </div>
    </div>
  );
}
