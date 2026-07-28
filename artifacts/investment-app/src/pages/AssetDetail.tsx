import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import {
  ArrowLeft, TrendingUp, TrendingDown, Clock,
  ArrowDownLeft, ArrowUpRight, X, ChevronDown,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  HELD_ASSETS, TRANSACTIONS, fmt, pnl, pnlPct,
  generatePriceHistory, type Asset, type Transaction,
} from '@/data/portfolioData';

// ── Sell Modal ────────────────────────────────────────────────────────────────
function SellModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const [units, setUnits] = useState('');
  const qty = parseFloat(units) || 0;
  const proceeds = qty * asset.currentPrice;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-[#1C2B5E] text-white p-5 flex justify-between items-start">
          <div>
            <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mb-1">Sell Order</div>
            <div className="text-lg font-bold">{asset.name}</div>
            <div className="text-xs text-white/60 mt-0.5">{asset.ticker} · {asset.category}</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Current Price</div>
              <div className="text-base font-bold text-[#1C2B5E]">${fmt(asset.currentPrice)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">You Hold</div>
              <div className="text-base font-bold text-[#1C2B5E]">{asset.units} units</div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Units to Sell</label>
            <input
              type="number"
              min="0"
              max={asset.units}
              step="any"
              placeholder="0"
              value={units}
              onChange={e => setUnits(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-[#1C2B5E] rounded-xl px-4 py-3 text-lg font-bold text-[#1C2B5E] outline-none transition-colors"
            />
            <button onClick={() => setUnits(String(asset.units))} className="text-[10px] text-[#F5A623] font-bold mt-1.5 hover:underline">
              Sell all {asset.units} units
            </button>
          </div>

          <div className="bg-[#1C2B5E]/5 rounded-xl p-4 flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estimated Proceeds</span>
            <span className="text-lg font-extrabold text-[#1C2B5E]">${fmt(proceeds)}</span>
          </div>

          <p className="text-[10px] text-gray-400 leading-relaxed">
            Proceeds will be credited to your <span className="font-bold text-[#1C2B5E]">Cash Balance</span> instantly.
          </p>

          <button
            disabled={qty <= 0 || qty > asset.units}
            className="w-full bg-[#1C2B5E] disabled:opacity-40 hover:bg-[#1C2B5E]/90 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
            onClick={onClose}
          >
            Confirm Sell · ${fmt(proceeds)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Chart tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1C2B5E] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg">
      <div className="text-white/50 mb-0.5">{label}</div>
      <div>${fmt(payload[0].value)}</div>
    </div>
  );
}

// ── TX meta ───────────────────────────────────────────────────────────────────
const TX_META: Record<Transaction['type'], { Icon: typeof ArrowDownLeft; bg: string; label: string }> = {
  deposit:    { Icon: ArrowDownLeft, bg: 'bg-green-100 text-green-600', label: 'Deposit'    },
  sell:       { Icon: ArrowUpRight,  bg: 'bg-amber-100 text-amber-600', label: 'Sell'       },
  buy:        { Icon: ArrowDownLeft, bg: 'bg-blue-100 text-blue-600',   label: 'Buy'        },
  withdrawal: { Icon: ArrowUpRight,  bg: 'bg-red-100 text-red-500',     label: 'Withdrawal' },
};

const RANGES = ['1W', '1M', '3M', '1Y'] as const;
type Range = typeof RANGES[number];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AssetDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/portfolio/:id');
  const [range, setRange] = useState<Range>('1M');
  const [showSell, setShowSell] = useState(false);

  const asset = HELD_ASSETS.find(a => a.id === params?.id);
  if (!asset) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 font-semibold">
      Asset not found. <button onClick={() => setLocation('/portfolio')} className="ml-2 text-[#1C2B5E] underline">Go back</button>
    </div>
  );

  // Chart data sliced by range
  const allPoints = generatePriceHistory(asset, 365);
  const sliceMap: Record<Range, number> = { '1W': 7, '1M': 30, '3M': 90, '1Y': 365 };
  const chartPoints = allPoints.slice(-sliceMap[range]);

  const isUp = pnl(asset) >= 0;
  const gain = pnl(asset);
  const gainPct = pnlPct(asset);
  const holdingValue = asset.currentPrice * asset.units;

  // Transactions for this asset, newest first
  const assetTxs = TRANSACTIONS.filter(tx => tx.assetId === asset.id);

  // Running balance calculation (oldest first → compute running, then reverse)
  const oldest = [...assetTxs].reverse();
  let running = 0;
  const withBalance = oldest.map(tx => {
    const spent = tx.units ? tx.units * (tx.type === 'buy' ? asset.buyPrice : asset.currentPrice) : tx.amount;
    if (tx.type === 'buy') running += tx.units ?? 0;
    if (tx.type === 'sell') running -= tx.units ?? 0;
    return { ...tx, runningUnits: running, runningValue: running * asset.currentPrice };
  }).reverse(); // back to newest first

  const minPrice = Math.min(...chartPoints.map(p => p.price));
  const maxPrice = Math.max(...chartPoints.map(p => p.price));

  return (
    <div className="min-h-screen bg-[#F4F6FB] font-sans">

      {/* ── Header ── */}
      <div className="bg-[#1C2B5E] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-0">

          {/* Nav */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setLocation('/portfolio')} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-semibold transition-colors">
              <ArrowLeft size={17} /> Portfolio
            </button>
            <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isUp ? '+' : ''}{gainPct.toFixed(2)}%
            </div>
          </div>

          {/* Asset identity */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-full ${asset.iconBg} ${asset.iconColor} flex items-center justify-center shadow-lg`}>
              {asset.Icon && <asset.Icon size={22} />}
            </div>
            <div>
              <div className="text-lg font-extrabold leading-tight">{asset.name}</div>
              <div className="text-xs text-white/50 font-semibold">{asset.ticker} · {asset.category}</div>
            </div>
          </div>

          {/* Price hero */}
          <div className="mb-2">
            <div className="text-3xl font-extrabold tracking-tight">${fmt(asset.currentPrice)}</div>
            <div className={`flex items-center gap-1 text-sm font-bold mt-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isUp ? '+' : '-'}${fmt(Math.abs(gain))} all time
            </div>
          </div>

          {/* Chart */}
          <div className="h-44 w-full -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartPoints} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? '#22C55E' : '#EF4444'} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={isUp ? '#22C55E' : '#EF4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis domain={[minPrice * 0.98, maxPrice * 1.02]} hide />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={asset.buyPrice} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isUp ? '#22C55E' : '#EF4444'}
                  strokeWidth={2}
                  fill={`url(#grad-${asset.id})`}
                  dot={false}
                  activeDot={{ r: 4, fill: isUp ? '#22C55E' : '#EF4444', stroke: 'white', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Range selector */}
          <div className="flex gap-1 pb-4 justify-end">
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${range === r ? 'bg-white text-[#1C2B5E]' : 'text-white/40 hover:text-white/70'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 space-y-4 pt-4 pb-12">

        {/* ── Stats card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Holding Value</div>
            <div className="text-lg font-extrabold text-[#1C2B5E]">${fmt(holdingValue)}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Units Held</div>
            <div className="text-lg font-extrabold text-[#1C2B5E]">{asset.units}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Avg. Buy Price</div>
            <div className="text-sm font-bold text-gray-700">${fmt(asset.buyPrice)}</div>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Total P&amp;L</div>
            <div className={`text-sm font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
              {isUp ? '+' : '-'}${fmt(Math.abs(gain))}
            </div>
          </div>
        </div>

        {/* ── Sell button ── */}
        <button
          onClick={() => setShowSell(true)}
          className="w-full bg-[#1C2B5E] hover:bg-[#1C2B5E]/90 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl transition-all text-sm shadow"
        >
          Sell {asset.ticker}
        </button>

        {/* ── Transactions ── */}
        <div>
          <div className="text-sm font-bold text-[#1C2B5E] mb-2">Transaction History</div>

          {assetTxs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-xs font-semibold">
              No transactions yet
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {withBalance.map((tx, i) => {
                const meta = TX_META[tx.type];
                const isCredit = tx.type === 'sell';
                return (
                  <div key={tx.id} className={`px-4 py-3.5 ${i < withBalance.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${meta.bg}`}>
                        <meta.Icon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#1C2B5E]">
                          {meta.label} {tx.units ? `· ${tx.units} units` : ''}
                        </div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-0.5 flex items-center gap-1">
                          <Clock size={9} /> {tx.date}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-sm font-extrabold ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                          {isCredit ? '+' : '-'}${fmt(tx.amount)}
                        </div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-0.5 capitalize">{tx.status}</div>
                      </div>
                    </div>
                    {/* Running balance bar */}
                    <div className="mt-2 ml-12 flex items-center justify-between">
                      <div className="text-[10px] text-gray-400 font-semibold">
                        Holdings after: <span className="font-bold text-[#1C2B5E]">{tx.runningUnits} units</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-bold">
                        ≈ ${fmt(tx.runningValue)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showSell && <SellModal asset={asset} onClose={() => setShowSell(false)} />}
    </div>
  );
}
