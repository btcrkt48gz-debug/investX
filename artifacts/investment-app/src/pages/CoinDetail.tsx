import React, { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { SiBitcoin } from 'react-icons/si';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  YAxis,
} from 'recharts';

// ── Coin registry ──────────────────────────────────────────────────────────────
const COINS: Record<string, {
  symbol: string; name: string; price: string; change: string;
  changeAmt: string; up: boolean; balance: string; balanceFiat: string;
  icon: React.ReactNode; iconBg: string;
}> = {
  btc: {
    symbol: 'BTC', name: 'Bitcoin',
    price: '$64,103.38', change: '-1.48%', changeAmt: '-$964.93', up: false,
    balance: '0.00 BTC', balanceFiat: '$0.00',
    icon: <SiBitcoin size={26} className="text-amber-500" />, iconBg: 'bg-amber-50',
  },
  usdt: {
    symbol: 'USDT', name: 'Tether (BEP-20)',
    price: '$1.00', change: '+0.01%', changeAmt: '+$0.00', up: true,
    balance: '0.00 USDT', balanceFiat: '$0.00',
    icon: <span className="text-[14px] font-black text-emerald-600">₮</span>, iconBg: 'bg-emerald-50',
  },
  usdc: {
    symbol: 'USDC', name: 'USD Coin (BEP-20)',
    price: '$1.00', change: '0.00%', changeAmt: '$0.00', up: true,
    balance: '0.00 USDC', balanceFiat: '$0.00',
    icon: <span className="text-[13px] font-black text-blue-600">$</span>, iconBg: 'bg-blue-50',
  },
};

// ── Fake chart data ────────────────────────────────────────────────────────────
function makeChart(up: boolean) {
  const pts: number[] = [];
  let v = 100 + Math.random() * 20;
  for (let i = 0; i < 40; i++) {
    v += (Math.random() - (up ? 0.45 : 0.55)) * 4;
    pts.push(parseFloat(v.toFixed(2)));
  }
  return pts.map((p, i) => ({ i, v: p }));
}

const CHART_CACHE: Record<string, { i: number; v: number }[]> = {};
function getChart(id: string, up: boolean) {
  if (!CHART_CACHE[id]) CHART_CACHE[id] = makeChart(up);
  return CHART_CACHE[id];
}

const RANGES = ['1H', '1D', '1W', '1M', '1Y', 'All'];
const TABS = ['Holdings', 'History', 'About'];

// ── Component ──────────────────────────────────────────────────────────────────
export default function CoinDetail() {
  const { coin: coinId = 'btc' } = useParams<{ coin: string }>();
  const [, setLocation] = useLocation();
  const [range, setRange] = useState('1D');
  const [tab, setTab] = useState('Holdings');

  const coin = COINS[coinId] ?? COINS.btc;
  const chart = getChart(coinId, coin.up);
  const lineColor = coin.up ? '#22c55e' : '#ef4444';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-5 pb-2">
        <button
          onClick={() => setLocation('/add-money/crypto')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div className="text-center">
          <div className="text-base font-bold text-gray-900">{coin.symbol}</div>
          <div className="text-[11px] text-gray-400">COIN &nbsp;|&nbsp; {coin.name}</div>
        </div>
        <div className="w-9" />
      </header>

      {/* Price */}
      <div className="px-5 pt-3 pb-1">
        <div className="text-3xl font-extrabold text-gray-900">{coin.price}</div>
        <div className={`text-[13px] font-semibold mt-0.5 ${coin.up ? 'text-green-500' : 'text-red-500'}`}>
          {coin.up ? '▲' : '▼'} {coin.changeAmt} ({coin.change})
        </div>
      </div>

      {/* Chart */}
      <div className="h-44 w-full px-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart} margin={{ top: 4, right: 0, bottom: 4, left: 0 }}>
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip
              formatter={(v: number) => [v.toFixed(2), '']}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
              itemStyle={{ color: lineColor }}
            />
            <Line
              type="monotone"
              dataKey="v"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: lineColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Range tabs */}
      <div className="flex justify-around px-4 mt-1">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
              range === r
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mt-4 px-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`mr-6 pb-2 text-[13px] font-semibold transition-colors border-b-2 ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Holdings */}
      <div className="flex-1 px-4 pt-4">
        <div className="text-[12px] text-gray-400 font-semibold mb-3">My Balance</div>
        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5">
          <div className={`w-10 h-10 rounded-full ${coin.iconBg} flex items-center justify-center shrink-0`}>
            {coin.icon}
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold text-gray-900">{coin.name}</div>
            <div className="text-[12px] text-gray-400">{coin.balance}</div>
          </div>
          <div className="text-right">
            <div className="text-[14px] font-bold text-gray-900">{coin.balanceFiat}</div>
            <div className="text-[12px] text-gray-400">-</div>
          </div>
        </div>
      </div>

      {/* Bottom action — Receive only */}
      <div className="px-6 py-5 border-t border-gray-100 flex justify-center">
        <button
          onClick={() => setLocation(`/add-money/crypto/${coinId}/receive`)}
          className="flex flex-col items-center gap-1.5 group"
        >
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            {/* Receive icon — two stacked squares (copy/receive) */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </div>
          <span className="text-[12px] font-semibold text-gray-600">Receive</span>
        </button>
      </div>
    </div>
  );
}
