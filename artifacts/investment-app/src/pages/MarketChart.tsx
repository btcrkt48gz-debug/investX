import { useLocation, useParams } from 'wouter';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';

const RANGES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const;
type Range = typeof RANGES[number];

function generateData(seed: number, points: number, base: number, volatility: number) {
  let price = base;
  const data = [];
  for (let i = 0; i < points; i++) {
    const change = (Math.sin(i * seed * 0.7) + Math.cos(i * 0.3 + seed)) * volatility;
    price = Math.max(price + change, base * 0.4);
    data.push({ price: parseFloat(price.toFixed(2)) });
  }
  return data;
}

const ASSET_META: Record<string, {
  base: number; volatility: number; seed: number;
  color: string; category: string; roi: string; trend: 'up' | 'down';
  symbol: string;
}> = {
  'Apple Inc.':        { base: 192,   volatility: 3,    seed: 1.2, color: '#1a4fd6', category: 'Stocks',      roi: '12% p.a.', trend: 'up',   symbol: 'AAPL'   },
  'EUR/USD':           { base: 1.08,  volatility: 0.01, seed: 2.1, color: '#0e7a5c', category: 'Forex',       roi: '8% p.a.',  trend: 'up',   symbol: 'EUR/USD' },
  'Gold (XAU)':        { base: 2320,  volatility: 18,   seed: 0.9, color: '#b45309', category: 'Commodities', roi: '5% p.a.',  trend: 'down', symbol: 'XAU'    },
  'Bitcoin':           { base: 62000, volatility: 1200, seed: 1.7, color: '#f59e0b', category: 'Crypto',      roi: '25% p.a.', trend: 'up',   symbol: 'BTC'    },
  'Vanguard S&P 500':  { base: 510,   volatility: 6,    seed: 0.5, color: '#7c3aed', category: 'ETFs',        roi: '10% p.a.', trend: 'up',   symbol: 'VOO'    },
  'Ethereum':          { base: 3400,  volatility: 95,   seed: 1.4, color: '#6366f1', category: 'Crypto',      roi: '22% p.a.', trend: 'up',   symbol: 'ETH'    },
  'Real Estate Trust': { base: 88,    volatility: 1.5,  seed: 0.7, color: '#10b981', category: 'REITs',       roi: '7% p.a.',  trend: 'up',   symbol: 'VNQ'    },
  'Tesla Inc.':        { base: 175,   volatility: 8,    seed: 2.5, color: '#ef4444', category: 'Stocks',      roi: '18% p.a.', trend: 'up',   symbol: 'TSLA'   },
  'Silver (XAG)':      { base: 29,    volatility: 0.9,  seed: 1.1, color: '#94a3b8', category: 'Commodities', roi: '6% p.a.',  trend: 'down', symbol: 'XAG'    },
  'Solana':            { base: 145,   volatility: 7,    seed: 1.9, color: '#9333ea', category: 'Crypto',      roi: '35% p.a.', trend: 'up',   symbol: 'SOL'    },
  'Microsoft':         { base: 415,   volatility: 5,    seed: 0.8, color: '#0ea5e9', category: 'Stocks',      roi: '14% p.a.', trend: 'up',   symbol: 'MSFT'   },
  'GBP/USD':           { base: 1.27,  volatility: 0.01, seed: 1.6, color: '#be123c', category: 'Forex',       roi: '6% p.a.',  trend: 'down', symbol: 'GBP/USD' },
};

const POINT_COUNTS: Record<Range, number> = {
  '1D': 24, '1W': 28, '1M': 30, '3M': 45, '1Y': 52, 'ALL': 60,
};

const LABELS: Record<Range, (i: number, total: number) => string> = {
  '1D': (i, t) => `${Math.round((i / t) * 24)}h`,
  '1W': (i, t) => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][Math.floor(i / (t / 7)) % 7],
  '1M': (i, t) => `${Math.round((i / t) * 30)}d`,
  '3M': (i, t) => `W${Math.ceil(((i + 1) / t) * 12)}`,
  '1Y': (i, t) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Math.floor((i / t) * 12)],
  'ALL': (i, t) => `${2020 + Math.floor((i / t) * 4)}`,
};

export default function MarketChart() {
  const [, setLocation] = useLocation();
  const params = useParams<{ name: string }>();
  const name = decodeURIComponent(params.name ?? '');
  const meta = ASSET_META[name];
  const [range, setRange] = useState<Range>('1M');

  if (!meta) {
    return (
      <div className="min-h-screen bg-[#f0f2f7] flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500 text-sm">Asset not found.</p>
        <button onClick={() => setLocation('/app')} className="text-[#1a4fd6] text-sm font-semibold">Go Home</button>
      </div>
    );
  }

  const points = POINT_COUNTS[range];
  const raw = generateData(meta.seed, points, meta.base, meta.volatility);
  const chartData = raw.map((d, i) => ({ ...d, label: LABELS[range](i, points) }));
  const current = chartData[chartData.length - 1].price;
  const first = chartData[0].price;
  const change = current - first;
  const changePct = ((change / first) * 100).toFixed(2);
  const isUp = change >= 0;

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col">
      {/* Header */}
      <div className="px-4 pt-5 pb-2 flex items-center gap-3">
        <button
          onClick={() => setLocation('/app')}
          className="p-1.5 -ml-1.5 hover:bg-black/10 rounded-full transition-colors"
        >
          <ArrowLeft size={22} className="text-gray-800" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">{name}</h1>
          <p className="text-xs text-gray-400">{meta.symbol} · {meta.category}</p>
        </div>
      </div>

      <div className="px-5 pt-3 flex flex-col gap-5">
        {/* Price + change */}
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-gray-900">
            {meta.base >= 1000
              ? `$${current.toLocaleString()}`
              : meta.base < 10
              ? current.toFixed(4)
              : `$${current.toFixed(2)}`}
          </span>
          <span className={`flex items-center gap-1 text-sm font-semibold mb-1 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
            {isUp ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            {isUp ? '+' : ''}{changePct}%
          </span>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={meta.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={meta.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}
                formatter={(v: number) => [
                  meta.base >= 1000 ? `$${v.toLocaleString()}` : meta.base < 10 ? v.toFixed(4) : `$${v.toFixed(2)}`,
                  'Price'
                ]}
                labelFormatter={() => ''}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={meta.color}
                strokeWidth={2.5}
                fill="url(#chartGrad)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Range selector */}
          <div className="flex justify-between mt-3 px-1">
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  range === r
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                style={range === r ? { backgroundColor: meta.color } : {}}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'ROI', value: meta.roi },
            { label: 'Min. Invest', value: name === 'Bitcoin' || name === 'Ethereum' || name === 'Solana' ? '$50' : name === 'Real Estate Trust' ? '$500' : '$100' },
            { label: 'Category', value: meta.category },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm px-3 py-3 flex flex-col gap-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
              <p className="text-sm font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
