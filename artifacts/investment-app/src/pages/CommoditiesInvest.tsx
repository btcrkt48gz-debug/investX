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

// ── Commodity registry ─────────────────────────────────────────────────────────
const COMMODITIES: Record<string, {
  name: string; price: number; change: number; color: string; emoji: string;
  category: string; desc: string; mktCap: string; vol: string; unit: string;
}> = {
  GOLD:   { name: 'Gold',           price: 2328.40,  change: +18.60,  color: '#D4A017', emoji: '🥇', category: 'Metals',      unit: 'per oz',  mktCap: '$14.6T', vol: '$183B', desc: 'Gold is the world\'s premier safe-haven asset and store of value. Central banks hold over 35,000 tonnes, and demand surges during economic uncertainty, dollar weakness, and geopolitical stress. Its finite supply and universal recognition make it the foundation of global wealth preservation.' },
  SILVER: { name: 'Silver',         price: 29.84,    change: +0.44,   color: '#A8A9AD', emoji: '🥈', category: 'Metals',      unit: 'per oz',  mktCap: '$1.7T',  vol: '$21B',  desc: 'Silver serves dual roles as both a precious metal and an industrial commodity. Over 50% of demand comes from industry — solar panels, electronics, and EV batteries — making it a leveraged play on both monetary and clean-energy themes.' },
  PLAT:   { name: 'Platinum',       price: 988.50,   change: -6.20,   color: '#C0C0C0', emoji: '⬜', category: 'Metals',      unit: 'per oz',  mktCap: '$240B',  vol: '$3.1B', desc: 'Platinum is rarer than gold and critical for catalytic converters, hydrogen fuel cells, and jewelry. Over 70% of supply comes from South Africa, creating persistent supply-risk premiums. The hydrogen economy transition is expected to drive long-term industrial demand.' },
  PALL:   { name: 'Palladium',      price: 998.30,   change: +12.80,  color: '#CEC8B2', emoji: '🔘', category: 'Metals',      unit: 'per oz',  mktCap: '$52B',   vol: '$820M', desc: 'Palladium is the dominant metal in gasoline-engine catalytic converters, with Russia and South Africa controlling ~80% of global supply. Tightening emissions standards and chronic supply deficits have historically driven violent price spikes.' },
  COPP:   { name: 'Copper',         price: 4.52,     change: +0.08,   color: '#B87333', emoji: '🟤', category: 'Metals',      unit: 'per lb',  mktCap: '$880B',  vol: '$16B',  desc: 'Copper is the backbone of the modern economy — essential for electrical wiring, motors, EV batteries, and renewable energy infrastructure. Often called "Dr. Copper" for its predictive power over global economic health, demand is expected to double by 2035 driven by electrification.' },
  WTI:    { name: 'Crude Oil (WTI)',price: 82.34,    change: -1.12,   color: '#1a1a2e', emoji: '🛢️', category: 'Energy',      unit: 'per bbl', mktCap: '$3.2T',  vol: '$420B', desc: 'West Texas Intermediate is the US benchmark crude oil grade, priced at Cushing, Oklahoma. WTI drives global energy markets and is sensitive to OPEC+ production decisions, US inventory data, and geopolitical events. It\'s the world\'s most actively traded commodity.' },
  BRENT:  { name: 'Brent Crude',    price: 86.10,    change: -0.88,   color: '#16213e', emoji: '⛽', category: 'Energy',      unit: 'per bbl', mktCap: '$3.4T',  vol: '$390B', desc: 'Brent Crude is the global benchmark for two-thirds of the world\'s oil contracts, priced from North Sea fields. It typically trades at a premium to WTI and is the reference price for OPEC+ supply discussions and international energy contracts.' },
  NATGAS: { name: 'Natural Gas',    price: 2.18,     change: +0.06,   color: '#0f3460', emoji: '🔥', category: 'Energy',      unit: 'per MMBtu', mktCap: '$1.1T', vol: '$38B', desc: 'Natural gas is a primary fuel for electricity generation, heating, and industrial processes. Prices are highly seasonal and sensitive to weather extremes, LNG export demand, and storage levels. The energy transition is driving increased LNG trade to replace coal globally.' },
  HEAT:   { name: 'Heating Oil',    price: 2.64,     change: -0.03,   color: '#533483', emoji: '🌡️', category: 'Energy',      unit: 'per gal', mktCap: '$280B',  vol: '$5.2B', desc: 'Heating oil (No. 2 fuel oil) is refined petroleum used for space heating and industrial purposes. Its price closely tracks crude oil with seasonal spikes during winter months. It is also a benchmark for diesel fuel pricing across transportation markets.' },
  GASO:   { name: 'Gasoline RBOB',  price: 2.55,     change: +0.04,   color: '#e94560', emoji: '⚗️', category: 'Energy',      unit: 'per gal', mktCap: '$310B',  vol: '$7.8B', desc: 'RBOB Gasoline (Reformulated Blendstock for Oxygenate Blending) is the US benchmark gasoline contract traded on NYMEX. Its price is driven by crude oil costs, refinery capacity, seasonal demand patterns, and EPA fuel standards.' },
  CORN:   { name: 'Corn',           price: 441.25,   change: +3.50,   color: '#f5a623', emoji: '🌽', category: 'Agriculture', unit: 'per bu',  mktCap: '$280B',  vol: '$4.4B', desc: 'Corn is the world\'s most produced grain, serving as animal feed, ethanol feedstock, and food ingredient. US, Brazil, and Argentina dominate exports. Prices are highly sensitive to weather patterns across the US Corn Belt and USDA crop reports.' },
  WHEAT:  { name: 'Wheat',          price: 582.00,   change: -8.25,   color: '#c8962e', emoji: '🌾', category: 'Agriculture', unit: 'per bu',  mktCap: '$180B',  vol: '$3.2B', desc: 'Wheat is a global staple food crop traded across hard red winter, soft red winter, and spring varieties. Russia and Ukraine supply ~30% of global exports, making geopolitical events in Eastern Europe a major price driver alongside weather and dollar strength.' },
  SOY:    { name: 'Soybeans',       price: 1142.50,  change: +11.75,  color: '#7cb518', emoji: '🫘', category: 'Agriculture', unit: 'per bu',  mktCap: '$240B',  vol: '$3.8B', desc: 'Soybeans are the world\'s leading oilseed, providing protein meal for livestock and vegetable oil for food and biodiesel. Brazil and the US dominate global supply. Chinese import demand is the single largest price driver in global soy markets.' },
  SUGA:   { name: 'Sugar #11',      price: 18.92,    change: +0.28,   color: '#d4a96a', emoji: '🍬', category: 'Agriculture', unit: 'per lb',  mktCap: '$95B',   vol: '$1.4B', desc: 'Sugar #11 is the benchmark raw cane sugar futures contract traded on ICE. Brazil is the world\'s largest producer and exporter. Prices are driven by Brazilian harvest conditions, ethanol vs. sugar production ratios, Indian policy, and global currency movements.' },
  COFF:   { name: 'Coffee Arabica', price: 204.80,   change: +2.15,   color: '#6f4e37', emoji: '☕', category: 'Agriculture', unit: 'per lb',  mktCap: '$115B',  vol: '$1.8B', desc: 'Arabica coffee is the premium grade traded on ICE, grown at altitude in Colombia, Ethiopia, and Brazil. Its delicate flavor profile commands a price premium over Robusta. Brazilian frost events and Colombian rainfall are the most important near-term price catalysts.' },
  COCO:   { name: 'Cocoa',          price: 9240.00,  change: +180.00, color: '#7b3f00', emoji: '🍫', category: 'Agriculture', unit: 'per ton', mktCap: '$98B',   vol: '$1.1B', desc: 'Cocoa is the raw material for chocolate, with West Africa (Ghana and Côte d\'Ivoire) producing ~70% of global supply. El Niño-driven droughts and Black Pod disease have caused historic supply squeezes, sending prices to multi-decade highs in 2024.' },
  COTT:   { name: 'Cotton',         price: 80.44,    change: -0.62,   color: '#b0a090', emoji: '☁️', category: 'Agriculture', unit: 'per lb',  mktCap: '$48B',   vol: '$680M', desc: 'Cotton is the world\'s most important natural textile fiber, traded as #2 Cotton futures on ICE. US, China, India, and Brazil dominate supply. Prices are sensitive to USDA acreage reports, export sales data, and synthetic fiber competition.' },
  LIVE:   { name: 'Live Cattle',    price: 182.10,   change: +0.95,   color: '#8b4513', emoji: '🐄', category: 'Agriculture', unit: 'per lb',  mktCap: '$62B',   vol: '$850M', desc: 'Live Cattle futures represent the benchmark for US beef prices. A tightening US cattle herd — at its smallest since the 1950s — combined with robust consumer demand has driven cash cattle prices to record highs, creating a multi-year structural bull market.' },
  ALUM:   { name: 'Aluminium',      price: 2418.50,  change: +22.00,  color: '#848789', emoji: '🔩', category: 'Industrial',  unit: 'per ton', mktCap: '$740B',  vol: '$12B',  desc: 'Aluminium is the world\'s most widely used non-ferrous metal, essential for aerospace, automotive, packaging, and construction. Energy-intensive smelting makes aluminium prices highly correlated with electricity costs. China produces ~60% of global supply.' },
  NICK:   { name: 'Nickel',         price: 17840.00, change: -180.00, color: '#72777d', emoji: '🔧', category: 'Industrial',  unit: 'per ton', mktCap: '$420B',  vol: '$6.8B', desc: 'Nickel is essential for stainless steel and lithium-ion battery cathodes, creating dual demand from traditional industry and the EV revolution. Indonesia dominates supply with ~55% of global output, and market volatility spiked dramatically following the 2022 LME short squeeze.' },
  ZINC:   { name: 'Zinc',           price: 2820.00,  change: +34.50,  color: '#9fa8a3', emoji: '⚙️', category: 'Industrial',  unit: 'per ton', mktCap: '$180B',  vol: '$3.2B', desc: 'Zinc is primarily used for galvanizing steel to prevent corrosion, alongside die-casting, brass, and rubber production. Supply is geographically diverse across China, Australia, and Peru. Smelter capacity and mine disruptions are the primary price drivers.' },
  LUMB:   { name: 'Lumber',         price: 548.00,   change: +8.40,   color: '#8b5e3c', emoji: '🪵', category: 'Industrial',  unit: 'per MBF', mktCap: '$35B',   vol: '$480M', desc: 'Lumber (random length softwood) is the benchmark for wood used in housing construction and renovation. US housing starts, mortgage rates, Canadian trade policy, and post-wildfire timber supply are the dominant price drivers for this notoriously volatile commodity.' },
};

// ── Category accent colours ────────────────────────────────────────────────────
const CAT_COLOR: Record<string, string> = {
  Metals:      '#D4A017',
  Energy:      '#ef4444',
  Agriculture: '#22c55e',
  Industrial:  '#6366f1',
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
  const volatility = { '1D': 0.007, '1W': 0.014, '1M': 0.022, '1Y': 0.038, 'All': 0.048 }[range];
  const seed = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + RANGES.indexOf(range) * 997;
  const rng  = seedRng(seed);
  const data: { i: number; v: number }[] = [];
  let v = price * (0.88 + rng() * 0.1);
  for (let i = 0; i < pts; i++) {
    v += (rng() - (up ? 0.47 : 0.53)) * price * volatility;
    v  = Math.max(v, price * 0.5);
    data.push({ i, v: parseFloat(v.toFixed(2)) });
  }
  data[data.length - 1].v = price;
  return data;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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
    <div style={{ width: size, height: size, borderRadius: r, backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: Math.round(size * 0.26), fontWeight: 800, color: 'white' }}>
      {category.slice(0, 3).toUpperCase()}
    </div>
  );
}

function TickerBadge({ ticker, color, size = 48, rounded = 'xl' }: {
  ticker: string; color: string; size?: number; rounded?: 'xl' | 'full';
}) {
  const [failed, setFailed] = useState(false);
  const commodity = COMMODITIES[ticker.toUpperCase()];
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

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CommoditiesInvest() {
  const { planId = 'basic', ticker = 'GOLD' } = useParams<{ planId: string; ticker: string }>();
  const [, setLocation] = useLocation();
  const { investments, cashBalance, placeInvestment, stopInvestment, transferToCash } = useInvestments();

  const plan       = PLANS[planId]               ?? PLANS.basic;
  const commodity  = COMMODITIES[ticker.toUpperCase()] ?? COMMODITIES.GOLD;
  const tickerUp   = ticker.toUpperCase();
  const up         = commodity.change >= 0;
  const pctStr     = ((commodity.change / (commodity.price - commodity.change)) * 100).toFixed(2);
  const catColor   = CAT_COLOR[commodity.category] ?? '#D4A017';
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
  const chartData   = useMemo(() => makeChartData(tickerUp, range, commodity.price, up), [ticker, range]);
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
          <span className="font-semibold text-gray-800">{commodity.name}</span> via{' '}
          <span className="font-semibold" style={{ color: plan.color }}>{plan.name}</span>.
        </p>
        <p className="text-[12px] text-gray-400 mb-8">
          Expected payout in 3 days:{' '}
          <span className="font-bold text-green-600">${fmt(payout)}</span>
        </p>
        <button
          onClick={() => setLocation(`/plan/${planId}/commodities`)}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-[14px] font-bold shadow hover:opacity-90 transition-opacity"
        >
          Back to Commodities
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setLocation(`/plan/${planId}/commodities`)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={17} /> Back
        </button>
        <div className="text-center">
          <div className="text-[13px] font-extrabold text-gray-900">{tickerUp}</div>
          <div className="text-[10px] text-gray-400">{commodity.name}</div>
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
          <div className="text-2xl font-extrabold text-gray-900">${fmt(commodity.price)}</div>
          <div className={`text-[12px] font-bold flex items-center gap-1 ${up ? 'text-green-500' : 'text-red-500'}`}>
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {up ? '+' : ''}{fmt(Math.abs(commodity.change))} ({up ? '+' : ''}{pctStr}%)
            <span className="text-gray-400 font-normal ml-1">{commodity.unit}</span>
          </div>
        </div>
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
            { label: 'Investment',                                        val: numAmt > 0 ? `$${fmt(numAmt)}`       : '—', sub: undefined },
            { label: `Daily Return (${Math.round(plan.dailyRate*100)}%)`, val: numAmt > 0 ? `+$${fmt(daily)}/day`  : '—', sub: undefined },
            { label: 'Total Earned (3 days)',                             val: numAmt > 0 ? `+$${fmt(total3d)}`     : '—', sub: `${(plan.dailyRate*3*100).toFixed(0)}% total return` },
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

        {/* ── About commodity ── */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">About {commodity.name}</div>
          <p className="text-[12px] text-gray-600 leading-relaxed">{commodity.desc}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Market Size', val: commodity.mktCap },
              { label: 'Daily Volume', val: commodity.vol },
              { label: 'Category',    val: commodity.category },
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
              You have an active investment in {commodity.name}. Stop it first before placing a new one.
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
                category: 'Commodities',
                logo: '/commodities-hero.jpg',
                name: commodity.name,
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
              ? `Invest $${fmt(numAmt)} in ${commodity.name}`
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
