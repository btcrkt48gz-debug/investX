import React, { useState, useMemo } from 'react';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Info, Check, AlertCircle, Square, ArrowRightLeft } from 'lucide-react';
import { useInvestments, useLiveBalance } from '@/context/InvestmentContext';
import {
  ResponsiveContainer, LineChart, Line, YAxis, Tooltip,
} from 'recharts';

// ── Plan registry ──────────────────────────────────────────────────────────────
const PLANS: Record<string, { name: string; dailyRate: number; minInvest: number; maxInvest: number; color: string }> = {
  basic:    { name: 'Basic Plan',    dailyRate: 0.05, minInvest: 50,    maxInvest: 1_000,   color: '#3B82F6' },
  standard: { name: 'Standard Plan', dailyRate: 0.06, minInvest: 1_100, maxInvest: 10_000,  color: '#8B5CF6' },
  premium:  { name: 'Premium Plan',  dailyRate: 0.07, minInvest: 11_000,maxInvest: 20_000,  color: '#F59E0B' },
  excel:    { name: 'Excel Plus',    dailyRate: 0.10, minInvest: 21_000,maxInvest: 100_000, color: '#EF4444' },
};

// ── Crypto registry ────────────────────────────────────────────────────────────
const CRYPTOS: Record<string, {
  name: string; price: number; change: number; color: string; logo: string;
  desc: string; mktCap: string; vol: string;
}> = {
  BTC:  { name: 'Bitcoin',      price: 67420.50, change:  1240.30, color: '#F7931A', logo: '/crypto-logos/BTC.png',  desc: 'The original and largest cryptocurrency by market cap. Bitcoin is a decentralised digital currency with a fixed supply of 21 million coins.', mktCap: '$1.32T', vol: '$28.4B' },
  ETH:  { name: 'Ethereum',     price:  3521.80, change:    88.40, color: '#627EEA', logo: '/crypto-logos/ETH.png',  desc: 'The leading smart-contract platform powering DeFi, NFTs, and Web3 applications worldwide.', mktCap: '$423B', vol: '$14.2B' },
  BNB:  { name: 'BNB',          price:   598.20, change:    12.60, color: '#F3BA2F', logo: '/crypto-logos/BNB.png',  desc: 'BNB is the native token of the BNB Chain ecosystem and is used for transaction fees, staking, and governance.', mktCap: '$88B', vol: '$1.8B' },
  SOL:  { name: 'Solana',       price:   182.45, change:     9.35, color: '#9945FF', logo: '/crypto-logos/SOL.png',  desc: 'High-performance Layer-1 blockchain known for ultra-fast transactions and low fees, popular for NFTs and DeFi.', mktCap: '$83B', vol: '$3.1B' },
  XRP:  { name: 'XRP',          price:     0.624,change:    -0.012,color: '#346AA9', logo: '/crypto-logos/XRP.png',  desc: 'XRP is designed for fast, low-cost cross-border payments and is used by financial institutions globally.', mktCap: '$35B', vol: '$920M' },
  DOGE: { name: 'Dogecoin',     price:     0.174,change:     0.009,color: '#C2A633', logo: '/crypto-logos/DOGE.png', desc: 'Originally a meme coin, Dogecoin has grown into a widely used digital currency with a passionate community.', mktCap: '$25B', vol: '$680M' },
  ADA:  { name: 'Cardano',      price:     0.482,change:    -0.009,color: '#0033AD', logo: '/crypto-logos/ADA.png',  desc: 'A proof-of-stake blockchain focused on security, scalability, and sustainability for smart contracts.', mktCap: '$17B', vol: '$340M' },
  AVAX: { name: 'Avalanche',    price:    38.72,  change:     2.14, color: '#E84142', logo: '/crypto-logos/AVAX.png', desc: 'Avalanche offers sub-second finality and hosts thousands of DeFi applications through its subnet architecture.', mktCap: '$16B', vol: '$520M' },
  LINK: { name: 'Chainlink',    price:    14.88,  change:     0.52, color: '#2A5ADA', logo: '/crypto-logos/LINK.png', desc: 'Chainlink is the leading decentralised oracle network, connecting blockchains to real-world data.', mktCap: '$9B', vol: '$310M' },
  MATIC:{ name: 'Polygon',      price:     0.894, change:     0.034,color: '#8247E5', logo: '/crypto-logos/MATIC.png',desc: 'Polygon is an Ethereum scaling solution providing fast and cheap transactions via Layer-2 technology.', mktCap: '$8.7B', vol: '$280M' },
  DOT:  { name: 'Polkadot',     price:     7.62,  change:    -0.18, color: '#E6007A', logo: '/crypto-logos/DOT.png',  desc: 'Polkadot enables different blockchains to interoperate and share security through its relay chain model.', mktCap: '$11B', vol: '$220M' },
  UNI:  { name: 'Uniswap',      price:    10.44,  change:     0.38, color: '#FF007A', logo: '/crypto-logos/UNI.png',  desc: 'Uniswap is the largest decentralised exchange (DEX) on Ethereum, powering billions in daily trading volume.', mktCap: '$6.2B', vol: '$190M' },
  LTC:  { name: 'Litecoin',     price:    88.30,  change:     1.60, color: '#BFBBBB', logo: '/crypto-logos/LTC.png',  desc: 'One of the oldest cryptocurrencies, Litecoin offers faster block times and lower fees than Bitcoin.', mktCap: '$6.6B', vol: '$350M' },
  SHIB: { name: 'Shiba Inu',    price:  0.0000246,change: 0.0000012,color: '#E01A28', logo: '/crypto-logos/SHIB.png', desc: 'Shiba Inu is a meme-inspired ERC-20 token that has evolved into a broader DeFi and NFT ecosystem.', mktCap: '$14B', vol: '$410M' },
  TRX:  { name: 'TRON',         price:     0.128, change:     0.003,color: '#EF0027', logo: '/crypto-logos/TRX.png',  desc: 'TRON is a high-throughput blockchain focused on entertainment, content sharing, and DeFi applications.', mktCap: '$11B', vol: '$490M' },
  NEAR: { name: 'NEAR Protocol',price:     6.82,  change:     0.44, color: '#00C08B', logo: '/crypto-logos/NEAR.png', desc: 'NEAR is a developer-friendly Layer-1 blockchain using sharding for high scalability and low-cost transactions.', mktCap: '$7.5B', vol: '$260M' },
  APT:  { name: 'Aptos',        price:     9.14,  change:     0.72, color: '#00C2FF', logo: '/crypto-logos/APT.png',  desc: 'Aptos is a Layer-1 blockchain built by former Meta engineers, focused on safety and scalability.', mktCap: '$4.1B', vol: '$180M' },
  OP:   { name: 'Optimism',     price:     2.38,  change:    -0.06, color: '#FF0420', logo: '/crypto-logos/OP.png',   desc: 'Optimism is an Ethereum Layer-2 optimistic rollup that reduces gas fees while maintaining Ethereum security.', mktCap: '$3.2B', vol: '$140M' },
  ARB:  { name: 'Arbitrum',     price:     1.12,  change:     0.08, color: '#2D374B', logo: '/crypto-logos/ARB.png',  desc: 'Arbitrum is the largest Ethereum Layer-2 by TVL, offering fast and cheap transactions via optimistic rollups.', mktCap: '$4.4B', vol: '$210M' },
  TON:  { name: 'Toncoin',      price:     5.64,  change:     0.22, color: '#0098EA', logo: '/crypto-logos/TON.png',  desc: 'TON is the native coin of The Open Network, originally developed by Telegram and now widely used in Mini Apps.', mktCap: '$19B', vol: '$380M' },
};

const RANGES = ['1D', '1W', '1M', '1Y', 'All'] as const;
type Range = typeof RANGES[number];

// ── Deterministic chart data per coin + range ──────────────────────────────────
function seedRng(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function makeChartData(ticker: string, range: Range, price: number, up: boolean) {
  const pts = { '1D': 48, '1W': 56, '1M': 60, '1Y': 52, 'All': 60 }[range];
  const volatility = { '1D': 0.008, '1W': 0.015, '1M': 0.025, '1Y': 0.04, 'All': 0.055 }[range];
  const seed = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + RANGES.indexOf(range) * 997;
  const rng = seedRng(seed);
  const data: { i: number; v: number }[] = [];
  let v = price * (0.85 + rng() * 0.12);
  for (let i = 0; i < pts; i++) {
    v += (rng() - (up ? 0.47 : 0.53)) * price * volatility;
    v = Math.max(v, price * 0.5);
    data.push({ i, v: parseFloat(v.toFixed(4)) });
  }
  // nudge last point toward actual price
  data[data.length - 1].v = price;
  return data;
}

// ── Logo with fallback ─────────────────────────────────────────────────────────
function CryptoLogo({ logo, ticker, color, size = 44 }: { logo: string; ticker: string; color: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) return (
    <div className="rounded-full flex items-center justify-center font-extrabold text-white shrink-0"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.3 }}>
      {ticker.slice(0, 3)}
    </div>
  );
  return <img src={logo} alt={ticker} onError={() => setFailed(true)}
    className="rounded-full object-contain bg-white border border-gray-100 shrink-0"
    style={{ width: size, height: size }} />;
}

// ── Format helpers ─────────────────────────────────────────────────────────────
function fmt(n: number) {
  if (n < 0.001) return n.toFixed(7);
  if (n < 1) return n.toFixed(4);
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtUsd(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function CryptoInvest() {
  const { planId = 'basic', ticker = 'BTC' } = useParams<{ planId: string; ticker: string }>();
  const [, setLocation] = useLocation();
  const { investments, cashBalance, placeInvestment, stopInvestment, transferToCash } = useInvestments();

  const plan        = PLANS[planId]             ?? PLANS.basic;
  const crypto      = CRYPTOS[ticker.toUpperCase()] ?? CRYPTOS.BTC;
  const tickerUp    = ticker.toUpperCase();
  const up          = crypto.change >= 0;
  const pct         = ((crypto.change / (crypto.price - crypto.change)) * 100).toFixed(2);
  const activeInvEntry = Object.entries(investments).find(
    ([, inv]) => inv.ticker === tickerUp && inv.planId === planId
  );
  const invKey    = activeInvEntry?.[0] ?? '';
  const activeInv = activeInvEntry?.[1];
  const hasActive   = !!activeInv && activeInv.status === 'active';
  const hasStopped  = !!activeInv && activeInv.status === 'stopped';

  const [range, setRange]   = useState<Range>('1D');
  const [amount, setAmount] = useState('');
  const [done, setDone]     = useState(false);

  // Live ticking balance (updates every 100ms)
  const liveBalance = useLiveBalance(activeInv);

  const chartData = useMemo(() => makeChartData(tickerUp, range, crypto.price, up), [ticker, range]);
  const lineColor = up ? '#22c55e' : '#ef4444';

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
          <span className="font-semibold text-gray-800">${fmtUsd(numAmt)}</span> invested in{' '}
          <span className="font-semibold text-gray-800">{tickerUp}</span> via{' '}
          <span className="font-semibold" style={{ color: plan.color }}>{plan.name}</span>.
        </p>
        <p className="text-[12px] text-gray-400 mb-8">
          Expected payout in 3 days:{' '}
          <span className="font-bold text-green-600">${fmtUsd(payout)}</span>
        </p>
        <button onClick={() => setLocation(`/plan/${planId}/crypto`)}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-[14px] font-bold shadow hover:opacity-90 transition-opacity">
          Back to Crypto List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setLocation(`/plan/${planId}/crypto`)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors">
          <ArrowLeft size={17} /> Back
        </button>
        <div className="text-center">
          <div className="text-[13px] font-extrabold text-gray-900">{ticker.toUpperCase()}</div>
          <div className="text-[10px] text-gray-400">{crypto.name}</div>
        </div>
        {/* Plan badge */}
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full text-white"
          style={{ backgroundColor: plan.color }}>
          {Math.round(plan.dailyRate * 100)}% daily
        </span>
      </div>

      {/* ── Price ── */}
      <div className="px-5 pt-4 flex items-center gap-3">
        <CryptoLogo logo={crypto.logo} ticker={ticker.toUpperCase()} color={crypto.color} size={44} />
        <div>
          <div className="text-2xl font-extrabold text-gray-900">${fmt(crypto.price)}</div>
          <div className={`text-[12px] font-bold flex items-center gap-1 ${up ? 'text-green-500' : 'text-red-500'}`}>
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {up ? '+' : ''}{fmt(crypto.change)} ({up ? '+' : ''}{pct}%)
          </div>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="h-44 w-full mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 0, bottom: 4, left: 0 }}>
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip
              formatter={(v: number) => [`$${fmt(v)}`, ticker.toUpperCase()]}
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

            {/* Live balance row */}
            <div className="flex items-start gap-3">
              {/* Red glowing dot — only when active */}
              {hasActive && (
                <div className="mt-1.5 shrink-0">
                  <span
                    className="block w-3 h-3 rounded-full bg-red-500"
                    style={{
                      boxShadow: '0 0 0 3px rgba(239,68,68,0.2), 0 0 10px 3px rgba(239,68,68,0.55)',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-gray-500 font-medium mb-0.5">
                  {hasActive ? 'Live Balance' : 'Final Balance'}
                </div>

                {/* Dollar + ticking cents */}
                {liveBalance !== null ? (() => {
                  const whole   = Math.floor(liveBalance);
                  const decimal = (liveBalance - whole).toFixed(8).slice(1); // ".00004629"
                  const cents   = decimal.slice(0, 3);   // ".00"
                  const subcents = decimal.slice(3);     // "04629"
                  return (
                    <div className="flex items-baseline gap-0">
                      <span className="text-[28px] font-extrabold text-gray-900 leading-none tracking-tight">
                        ${whole.toLocaleString('en-US')}
                      </span>
                      <span className="text-[22px] font-extrabold text-gray-900 leading-none">
                        {cents}
                      </span>
                      <span className="text-[13px] font-bold text-gray-400 leading-none mb-0.5">
                        {subcents}
                      </span>
                    </div>
                  );
                })() : (
                  <div className="text-[28px] font-extrabold text-gray-900">—</div>
                )}

                <div className="text-[10px] text-gray-400 mt-1">
                  {hasActive && activeInv.profitPerSec > 0 && (
                    <span className="text-emerald-600 font-semibold">
                      +${(activeInv.profitPerSec).toFixed(8)}/sec
                    </span>
                  )}
                  {hasActive && ' · '}
                  via {PLANS[activeInv.planId]?.name ?? activeInv.planId} · started {activeInv.startDate}
                </div>

                {/* Progress bar: elapsed vs 3 days */}
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
                        <div
                          className="h-full bg-red-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Stop button */}
            {hasActive && (
              <button
                onClick={() => stopInvestment(invKey)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-extrabold text-red-600 bg-white border border-red-200 hover:bg-red-50 active:scale-[0.98] transition-all"
                style={{ boxShadow: '0 0 14px rgba(239,68,68,0.18)' }}
              >
                <span
                  className="w-2 h-2 rounded-full bg-red-500 shrink-0"
                  style={{ boxShadow: '0 0 6px 2px rgba(239,68,68,0.65)' }}
                />
                <Square size={12} className="fill-red-500 text-red-500" />
                Stop Investment
              </button>
            )}

            {/* Transfer to cash — only when stopped */}
            {hasStopped && (
              <button
                onClick={() => transferToCash(invKey)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-extrabold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all"
                style={{ boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }}
              >
                <ArrowRightLeft size={14} />
                Transfer ${fmtUsd(activeInv.stoppedBalance ?? activeInv.amount)} to Cash Balance
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

        {/* ── Amount input — hidden while there's any active/stopped investment ── */}
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
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-[20px] font-extrabold text-gray-900 focus:outline-none"
              />
              <span className="text-[11px] text-gray-400 font-semibold">USD</span>
            </div>

            {/* Cash balance */}
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-blue-500 shrink-0" />
                <span className="text-[12px] text-blue-700 font-semibold">Available Cash Balance</span>
              </div>
              <span className="text-[13px] font-extrabold text-blue-700">${fmtUsd(cashBalance)}</span>
            </div>

            {/* Validation warnings */}
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
            { label: 'Investment',            val: numAmt > 0 ? `$${fmtUsd(numAmt)}` : '—',           sub: null },
            { label: `Daily Return (${Math.round(plan.dailyRate*100)}%)`, val: numAmt > 0 ? `+$${fmtUsd(daily)}/day` : '—', sub: null },
            { label: 'Total Earned (3 days)', val: numAmt > 0 ? `+$${fmtUsd(total3d)}` : '—',         sub: `${(plan.dailyRate*3*100).toFixed(0)}% total return` },
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
                {numAmt > 0 ? `$${fmtUsd(payout)}` : '—'}
              </span>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Returned to Cash Balance after 3 days</div>
          </div>
        </div>

        {/* ── About coin ── */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">About {tickerUp}</div>
          <p className="text-[12px] text-gray-600 leading-relaxed">{crypto.desc}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Market Cap', val: crypto.mktCap },
              { label: '24h Volume', val: crypto.vol },
              { label: 'Min Invest',  val: `$${plan.minInvest.toLocaleString()}` },
              { label: 'Duration',    val: '3 days' },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white rounded-xl px-3 py-2.5 border border-gray-100">
                <div className="text-[10px] text-gray-400 font-semibold">{label}</div>
                <div className="text-[13px] font-extrabold text-gray-900 mt-0.5">{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Invest button ── */}
        {hasActive ? (
          /* already investing — show blocker */
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-4">
            <AlertCircle size={15} className="text-orange-500 shrink-0" />
            <span className="text-[12px] text-orange-700 font-semibold leading-snug">
              You have an active investment in {tickerUp}. Stop it first before placing a new one.
            </span>
          </div>
        ) : hasStopped ? (
          /* stopped but not transferred — must transfer first */
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
                category: 'Crypto',
                logo: crypto.logo,
                name: crypto.name,
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
              ? `Invest $${fmtUsd(numAmt)} in ${tickerUp}`
              : overMax
                ? `Maximum $${plan.maxInvest.toLocaleString()} for this plan`
                : overBalance
                  ? 'Insufficient cash balance'
                  : `Minimum $${plan.minInvest.toLocaleString()} to invest`}
          </button>
        )}

        {/* disclaimer */}
        <div className="flex items-start gap-2 text-[10px] text-gray-400 leading-relaxed">
          <Info size={11} className="shrink-0 mt-0.5" />
          Investment returns are based on the selected plan rate. Past performance does not guarantee future results.
        </div>

      </div>
    </div>
  );
}
