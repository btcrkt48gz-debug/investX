import React, { useState, useMemo } from 'react';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Info, Check, AlertCircle, Square, ArrowRightLeft } from 'lucide-react';
import { useInvestments, useLiveBalance } from '@/context/InvestmentContext';
import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip } from 'recharts';

// ── Plan registry ──────────────────────────────────────────────────────────────
const PLANS: Record<string, { name: string; dailyRate: number; minInvest: number; maxInvest: number; color: string }> = {
  basic:    { name: 'Basic Plan',    dailyRate: 0.05, minInvest: 50,     maxInvest: 1_000,   color: '#3B82F6' },
  standard: { name: 'Standard Plan', dailyRate: 0.06, minInvest: 1_100,  maxInvest: 10_000,  color: '#8B5CF6' },
  premium:  { name: 'Premium Plan',  dailyRate: 0.07, minInvest: 11_000, maxInvest: 20_000,  color: '#F59E0B' },
  excel:    { name: 'Excel Plus',    dailyRate: 0.10, minInvest: 21_000, maxInvest: 100_000, color: '#EF4444' },
};

// ── Stock registry ─────────────────────────────────────────────────────────────
const STOCKS: Record<string, {
  name: string; price: number; change: number; color: string; logo: string;
  sector: string; desc: string; mktCap: string; vol: string;
}> = {
  AAPL:  { name: 'Apple Inc.',             price: 227.52, change: +1.84,  color: '#555555', logo: '/logos/AAPL.png',  sector: 'Technology', desc: 'Apple designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories worldwide. With the App Store, iCloud, and services segment growing rapidly, Apple has built one of the world\'s most loyal customer ecosystems.',  mktCap: '$3.5T', vol: '$68.4B' },
  MSFT:  { name: 'Microsoft Corp.',        price: 415.30, change: +2.10,  color: '#00A4EF', logo: '/logos/MSFT.png',  sector: 'Technology', desc: 'Microsoft develops and supports software, services, devices, and solutions globally, including the Azure cloud platform and Office 365. Azure is among the top 2 cloud providers worldwide, making Microsoft a dominant force in enterprise computing.',         mktCap: '$3.1T', vol: '$24.2B' },
  NVDA:  { name: 'NVIDIA Corp.',           price: 131.38, change: +4.55,  color: '#76B900', logo: '/logos/NVDA.png',  sector: 'Technology', desc: 'NVIDIA designs GPUs for gaming, AI workloads, data centers, and autonomous vehicles. Its CUDA ecosystem and H100/H200 chips are the backbone of modern AI infrastructure, giving NVIDIA near-monopoly status in AI accelerator hardware.',              mktCap: '$3.2T', vol: '$42.1B' },
  GOOGL: { name: 'Alphabet Inc.',          price: 189.74, change: -0.63,  color: '#4285F4', logo: '/logos/GOOGL.png', sector: 'Technology', desc: 'Alphabet is the parent company of Google, the world\'s leading search engine, and operates YouTube, Google Cloud, DeepMind, and Waymo. Advertising revenue and cloud growth make it one of the most profitable businesses on the planet.',           mktCap: '$2.4T', vol: '$31.8B' },
  AMZN:  { name: 'Amazon.com Inc.',        price: 205.60, change: +1.22,  color: '#FF9900', logo: '/logos/AMZN.png',  sector: 'Consumer',   desc: 'Amazon is the world\'s largest e-commerce company and cloud provider. AWS generates the bulk of Amazon\'s operating profit, while its logistics network, Prime membership, and advertising business create multiple durable revenue streams.',           mktCap: '$2.2T', vol: '$28.6B' },
  TSLA:  { name: 'Tesla Inc.',             price: 248.42, change: -2.38,  color: '#CC0000', logo: '/logos/TSLA.png',  sector: 'Automotive', desc: 'Tesla designs and manufactures electric vehicles, energy storage systems, and solar products. As the world\'s leading EV brand, Tesla also generates revenue from its Supercharger network, FSD software, and energy division.',                      mktCap: '$793B',  vol: '$38.4B' },
  META:  { name: 'Meta Platforms',         price: 572.15, change: +3.05,  color: '#0082FB', logo: '/logos/META.png',  sector: 'Technology', desc: 'Meta operates Facebook, Instagram, WhatsApp, and Messenger — reaching over 3 billion people daily. The company is aggressively investing in AI and augmented reality through its Reality Labs division.',                                               mktCap: '$1.5T', vol: '$22.8B' },
  NFLX:  { name: 'Netflix Inc.',           price: 983.45, change: +8.70,  color: '#E50914', logo: '/logos/NFLX.png',  sector: 'Media',      desc: 'Netflix is the world\'s leading streaming entertainment service with 270M+ paid memberships across 190 countries. Its ad-supported tier, live events strategy, and password-sharing crackdown have driven sustained subscriber and revenue growth.',          mktCap: '$425B',  vol: '$7.4B'  },
  JPM:   { name: 'JPMorgan Chase',         price: 245.80, change: +0.95,  color: '#005EB8', logo: '/logos/JPM.png',   sector: 'Finance',    desc: 'JPMorgan Chase is the largest US bank by assets, offering investment banking, retail banking, financial services, and asset management globally. Its diversified business model makes it one of the most resilient financial institutions in the world.',   mktCap: '$715B',  vol: '$11.2B' },
  V:     { name: 'Visa Inc.',              price: 295.32, change: +1.40,  color: '#1A1F71', logo: '/logos/V.png',     sector: 'Finance',    desc: 'Visa operates the world\'s largest retail electronic payments network, processing over 200 billion transactions annually. Its asset-light business model, high margins, and global reach make it one of the most durable companies on the planet.',              mktCap: '$624B',  vol: '$8.9B'  },
  BAC:   { name: 'Bank of America',        price: 44.78,  change: +0.34,  color: '#E31837', logo: '/logos/BAC.png',   sector: 'Finance',    desc: 'Bank of America serves ~67 million consumer and small business clients across the US and internationally with full-service banking, investment, and financial solutions.',                                                                                    mktCap: '$353B',  vol: '$6.4B'  },
  WMT:   { name: 'Walmart Inc.',           price: 98.65,  change: +0.78,  color: '#0071CE', logo: '/logos/WMT.png',   sector: 'Retail',     desc: 'Walmart is the world\'s largest retailer, operating 10,500+ stores across 20 countries. Its growing e-commerce arm, Sam\'s Club membership base, and advertising business are transforming it into a multi-channel consumer powerhouse.',          mktCap: '$795B',  vol: '$5.2B'  },
  DIS:   { name: 'The Walt Disney Co.',    price: 111.20, change: -1.05,  color: '#009CDE', logo: '/logos/DIS.png',   sector: 'Media',      desc: 'Disney operates theme parks, studios (Marvel, Lucasfilm, Pixar), and Disney+ streaming across 180+ countries. Its unrivalled IP portfolio and parks business give it durable competitive advantages across entertainment categories.',              mktCap: '$203B',  vol: '$4.8B'  },
  AMD:   { name: 'Advanced Micro Devices', price: 162.44, change: +5.22,  color: '#ED1C24', logo: '/logos/AMD.png',   sector: 'Technology', desc: 'AMD designs high-performance CPUs and GPUs for PCs, data centers, and gaming. Its EPYC server chips and Instinct GPU lineup position it as a major challenger to Intel and NVIDIA in the AI accelerator market.',                           mktCap: '$263B',  vol: '$9.6B'  },
  INTC:  { name: 'Intel Corp.',            price: 21.30,  change: -0.45,  color: '#0071C5', logo: '/logos/INTC.png',  sector: 'Technology', desc: 'Intel is a leading semiconductor manufacturer producing CPUs for PCs, servers, and mobile devices worldwide. Its foundry strategy aims to recapture manufacturing leadership and capture AI chip demand.',                                     mktCap: '$91B',   vol: '$4.2B'  },
  PYPL:  { name: 'PayPal Holdings',        price: 88.92,  change: +1.68,  color: '#003087', logo: '/logos/PYPL.png',  sector: 'Finance',    desc: 'PayPal is a leading digital payments platform processing $1.5T+ in payment volume annually across 200+ markets, through PayPal, Venmo, and Braintree.',                                                                                                mktCap: '$95B',   vol: '$3.8B'  },
  UBER:  { name: 'Uber Technologies',      price: 82.10,  change: +2.90,  color: '#000000', logo: '/logos/UBER.png',  sector: 'Transport',  desc: 'Uber is the world\'s largest ride-sharing and food delivery platform, operating in 70+ countries. Its Uber Eats, freight, and autonomous vehicle investments are building a multi-vertical mobility platform.',                           mktCap: '$172B',  vol: '$4.1B'  },
  SHOP:  { name: 'Shopify Inc.',           price: 108.55, change: +3.44,  color: '#96BF48', logo: '/logos/SHOP.png',  sector: 'Technology', desc: 'Shopify powers over 2 million businesses worldwide with its e-commerce platform, payments, and merchant services ecosystem. It is the preferred platform for DTC brands scaling from startup to enterprise.',                                  mktCap: '$137B',  vol: '$3.4B'  },
  COIN:  { name: 'Coinbase Global',        price: 265.30, change: -4.10,  color: '#1652F0', logo: '/logos/COIN.png',  sector: 'Finance',    desc: 'Coinbase is the largest regulated US crypto exchange with 110M+ verified users and $330B+ in assets on platform. Its institutional prime brokerage and Base L2 network give it long-term structural advantages.',                            mktCap: '$67B',   vol: '$5.8B'  },
  PLTR:  { name: 'Palantir Technologies',  price: 38.72,  change: +6.88,  color: '#1d1d1b', logo: '/logos/PLTR.png',  sector: 'Technology', desc: 'Palantir builds AI-powered data analytics platforms for government intelligence and enterprise clients globally. Its AIP product and US commercial growth have driven accelerating revenue and margin expansion.',                             mktCap: '$84B',   vol: '$3.2B'  },
  SQ:    { name: 'Block Inc.',             price: 72.45,  change: +1.22,  color: '#3E9D4A', logo: '/logos/SQ.png',    sector: 'Finance',    desc: 'Block (formerly Square) offers payment processing for sellers, Cash App for consumers, and Bitcoin services. Its ecosystem approach creates cross-selling advantages across business and personal finance.',                                   mktCap: '$44B',   vol: '$2.6B'  },
  SPOT:  { name: 'Spotify Technology',     price: 398.20, change: +4.15,  color: '#1DB954', logo: '/logos/SPOT.png',  sector: 'Media',      desc: 'Spotify is the world\'s largest audio streaming service with 602M monthly active users across 180+ markets. Its podcast platform and AI DJ features are driving premium subscriber conversion and engagement.',                               mktCap: '$81B',   vol: '$2.1B'  },
  HOOD:  { name: 'Robinhood Markets',      price: 26.88,  change: +2.34,  color: '#00C805', logo: '/logos/HOOD.png',  sector: 'Finance',    desc: 'Robinhood democratizes finance by offering commission-free investing in stocks, ETFs, crypto, and options. Its Gold subscription tier and retirement accounts are expanding its revenue beyond trading.',                                        mktCap: '$24B',   vol: '$1.8B'  },
  SNOW:  { name: 'Snowflake Inc.',         price: 174.60, change: -1.80,  color: '#29B5E8', logo: '/logos/SNOW.png',  sector: 'Technology', desc: 'Snowflake delivers a cloud-agnostic data platform enabling storage, analytics, and AI workloads across AWS, Azure, and GCP. Its Cortex AI features are expanding its total addressable market significantly.',                       mktCap: '$58B',   vol: '$2.4B'  },
  ABNB:  { name: 'Airbnb Inc.',            price: 148.90, change: +0.92,  color: '#FF5A5F', logo: '/logos/ABNB.png',  sector: 'Travel',     desc: 'Airbnb operates the world\'s largest home-sharing marketplace with 7M+ listings across 220 countries and regions. Its Experiences product and co-host network are opening new supply and demand channels.',                                 mktCap: '$95B',   vol: '$2.2B'  },
  CRM:   { name: 'Salesforce Inc.',        price: 298.44, change: +2.55,  color: '#00A1E0', logo: '/logos/CRM.png',   sector: 'Technology', desc: 'Salesforce is the world\'s #1 CRM platform, helping businesses manage customer relationships through AI-powered tools. Its Agentforce AI platform is driving the next wave of enterprise software adoption.',                                mktCap: '$288B',  vol: '$3.6B'  },
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
  const volatility = { '1D': 0.006, '1W': 0.012, '1M': 0.02, '1Y': 0.035, 'All': 0.045 }[range];
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

// ── Logo ───────────────────────────────────────────────────────────────────────
function StockLogo({ logo, ticker, color, size = 44 }: { logo: string; ticker: string; color: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) return (
    <div className="rounded-xl flex items-center justify-center font-extrabold text-white shrink-0"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.28 }}>
      {ticker.slice(0, 4)}
    </div>
  );
  return <img src={logo} alt={ticker} onError={() => setFailed(true)}
    className="rounded-xl object-contain bg-white border border-gray-100 shrink-0"
    style={{ width: size, height: size }} />;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function StocksInvest() {
  const { planId = 'basic', ticker = 'AAPL' } = useParams<{ planId: string; ticker: string }>();
  const [, setLocation] = useLocation();
  const { investments, cashBalance, placeInvestment, stopInvestment, transferToCash } = useInvestments();

  const plan      = PLANS[planId]              ?? PLANS.basic;
  const stock     = STOCKS[ticker.toUpperCase()] ?? STOCKS.AAPL;
  const tickerUp  = ticker.toUpperCase();
  const up        = stock.change >= 0;
  const pctStr    = ((stock.change / (stock.price - stock.change)) * 100).toFixed(2);
  const activeInvEntry = Object.entries(investments).find(
    ([, inv]) => inv.ticker === tickerUp && inv.planId === planId
  );
  const invKey    = activeInvEntry?.[0] ?? '';
  const activeInv = activeInvEntry?.[1];
  const hasActive = !!activeInv && activeInv.status === 'active';
  const hasStopped = !!activeInv && activeInv.status === 'stopped';

  const [range, setRange]   = useState<Range>('1D');
  const [amount, setAmount] = useState('');
  const [done, setDone]     = useState(false);

  const liveBalance = useLiveBalance(activeInv);
  const chartData   = useMemo(() => makeChartData(tickerUp, range, stock.price, up), [ticker, range]);
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
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
          style={{ backgroundColor: plan.color + '20' }}>
          <Check size={36} style={{ color: plan.color }} />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Investment Placed!</h2>
        <p className="text-[13px] text-gray-500 mb-1">
          <span className="font-semibold text-gray-800">${fmt(numAmt)}</span> invested in{' '}
          <span className="font-semibold text-gray-800">{tickerUp}</span> via{' '}
          <span className="font-semibold" style={{ color: plan.color }}>{plan.name}</span>.
        </p>
        <p className="text-[12px] text-gray-400 mb-8">
          Expected payout in 3 days:{' '}
          <span className="font-bold text-green-600">${fmt(payout)}</span>
        </p>
        <button
          onClick={() => setLocation(`/plan/${planId}/stocks`)}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-[14px] font-bold shadow hover:opacity-90 transition-opacity"
        >
          Back to Stocks List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setLocation(`/plan/${planId}/stocks`)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={17} /> Back
        </button>
        <div className="text-center">
          <div className="text-[13px] font-extrabold text-gray-900">{tickerUp}</div>
          <div className="text-[10px] text-gray-400">{stock.name}</div>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full text-white"
          style={{ backgroundColor: plan.color }}>
          {Math.round(plan.dailyRate * 100)}% daily
        </span>
      </div>

      {/* ── Price row ── */}
      <div className="px-5 pt-4 flex items-center gap-3">
        <StockLogo logo={stock.logo} ticker={tickerUp} color={stock.color} size={44} />
        <div>
          <div className="text-2xl font-extrabold text-gray-900">${fmt(stock.price)}</div>
          <div className={`text-[12px] font-bold flex items-center gap-1 ${up ? 'text-green-500' : 'text-red-500'}`}>
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {up ? '+' : ''}{fmt(Math.abs(stock.change))} ({up ? '+' : ''}{pctStr}%)
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
            { label: 'Investment',                                        val: numAmt > 0 ? `$${fmt(numAmt)}`        : '—', sub: undefined },
            { label: `Daily Return (${Math.round(plan.dailyRate*100)}%)`, val: numAmt > 0 ? `+$${fmt(daily)}/day`   : '—', sub: undefined },
            { label: 'Total Earned (3 days)',                             val: numAmt > 0 ? `+$${fmt(total3d)}`      : '—', sub: `${(plan.dailyRate*3*100).toFixed(0)}% total return` },
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

        {/* ── About stock ── */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">About {tickerUp}</div>
          <p className="text-[12px] text-gray-600 leading-relaxed">{stock.desc}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Market Cap', val: stock.mktCap },
              { label: '24h Volume', val: stock.vol },
              { label: 'Sector',     val: stock.sector },
              { label: 'Duration',   val: '3 days' },
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
              You have an active investment in {tickerUp}. Stop it first before placing a new one.
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
                category: 'Stocks',
                logo: stock.logo,
                name: stock.name,
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
