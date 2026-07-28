import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import {
  User,
  Check,
  Building2,
  Coins,
  BarChart3,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CircleDot,
  ShoppingCart,
  Monitor,
  Plus,
  SendHorizonal,
  ArrowDownToLine,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import {
  SiApple,
  SiGoogle,
  SiTesla,
  SiMeta,
  SiNvidia,
  SiNetflix,
  SiBitcoin,
} from 'react-icons/si';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useInvestments } from '@/context/InvestmentContext';
import { fmt } from '@/data/portfolioData';
const realEstateImg = '/crypto-hero.jpeg';

const PLANS = [
  { id: 'basic',    name: 'Basic Plan',    percent: '5%',  days: 3, min: 50,    max: 1000   },
  { id: 'standard', name: 'Standard Plan', percent: '6%',  days: 3, min: 1100,  max: 10000  },
  { id: 'premium',  name: 'Premium Plan',  percent: '7%',  days: 3, min: 11000, max: 20000  },
  { id: 'excel',    name: 'Excel Plus',    percent: '10%', days: 3, min: 21000, max: 100000 },
];

// Static fallback prices — replaced by live data from /api/prices
const STATIC_TICKER: TickerItem[] = [
  { symbol: 'BTC',  price: 67000,  change:  2.1, Icon: SiBitcoin  },
  { symbol: 'ETH',  price: 3500,   change:  1.4, Icon: SiBitcoin  },
  { symbol: 'SOL',  price: 180,    change:  3.2, Icon: SiBitcoin  },
  { symbol: 'AAPL', price: 189.30, change:  1.2, Icon: SiApple    },
  { symbol: 'GOOGL',price: 175.40, change: -0.4, Icon: SiGoogle   },
  { symbol: 'TSLA', price: 248.80, change:  2.1, Icon: SiTesla    },
  { symbol: 'META', price: 498.10, change:  3.4, Icon: SiMeta     },
  { symbol: 'NVDA', price: 924.30, change:  4.2, Icon: SiNvidia   },
];

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface LivePrices {
  [symbol: string]: { price: number; change24h: number };
}

/** Merge live prices from /api/prices into the ticker list. */
function mergeLivePrices(base: TickerItem[], live: LivePrices): TickerItem[] {
  return base.map(item => {
    const lp = live[item.symbol];
    if (!lp) return item;
    return { ...item, price: lp.price, change: lp.change24h };
  });
}

/** Hook: fetch live crypto prices from the backend, refresh every 60s. */
function useLivePrices(): LivePrices {
  const [prices, setPrices] = useState<LivePrices>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/prices');
        if (!res.ok) return;
        const data = await res.json() as { prices?: LivePrices };
        if (!cancelled && data.prices) setPrices(data.prices);
      } catch { /* silently ignore — static fallback remains */ }
    }
    load();
    const id = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return prices;
}

const ASSETS_LIST = [
  { name: 'Apple Inc.',        category: 'Stocks',      min: '$50',   roi: '12% p.a.',  trend: 'up'   },
  { name: 'EUR/USD',           category: 'Forex',       min: '$100',  roi: '8% p.a.',   trend: 'up'   },
  { name: 'Gold (XAU)',        category: 'Commodities', min: '$200',  roi: '5% p.a.',   trend: 'down' },
  { name: 'Bitcoin',           category: 'Crypto',      min: '$50',   roi: '25% p.a.',  trend: 'up'   },
  { name: 'Vanguard S&P 500',  category: 'ETFs',        min: '$100',  roi: '10% p.a.',  trend: 'up'   },
  { name: 'Ethereum',          category: 'Crypto',      min: '$50',   roi: '22% p.a.',  trend: 'up'   },
  { name: 'Real Estate Trust', category: 'REITs',       min: '$500',  roi: '7% p.a.',   trend: 'up'   },
  { name: 'Tesla Inc.',        category: 'Stocks',      min: '$50',   roi: '18% p.a.',  trend: 'up'   },
  { name: 'Silver (XAG)',      category: 'Commodities', min: '$100',  roi: '6% p.a.',   trend: 'down' },
  { name: 'Solana',            category: 'Crypto',      min: '$50',   roi: '35% p.a.',  trend: 'up'   },
  { name: 'Microsoft',         category: 'Stocks',      min: '$100',  roi: '14% p.a.',  trend: 'up'   },
  { name: 'GBP/USD',           category: 'Forex',       min: '$100',  roi: '6% p.a.',   trend: 'down' },
];

const ANNOUNCEMENTS = [
  {
    title: '🎉 Welcome Bonus Active',
    body: 'New users get a 10% bonus on their first deposit. Fund your account today to claim it.',
    bg: 'from-primary to-primary/80',
  },
  {
    title: '📈 Excel Plus Plan Now Open',
    body: 'Our highest-yield plan (10% daily) is now accepting deposits up to $100,000. Limited slots.',
    bg: 'from-secondary/90 to-secondary/70',
    dark: true,
  },
  {
    title: '🔒 Withdrawals Processed Daily',
    body: 'All withdrawal requests are reviewed and completed within 24 hours, every day.',
    bg: 'from-primary to-primary/80',
  },
  {
    title: '💎 Refer & Earn',
    body: 'Invite friends and earn 5% of every investment they make — paid instantly to your balance.',
    bg: 'from-secondary/90 to-secondary/70',
    dark: true,
  },
];

function AnnouncementSlider() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    timerRef.current = setInterval(() => {
      setIndex(i => (i + 1) % ANNOUNCEMENTS.length);
    }, 4000);
  };

  useEffect(() => {
    start();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const a = ANNOUNCEMENTS[index];

  return (
    <section className="relative overflow-hidden">
      <div
        className={`bg-gradient-to-r ${a.bg} rounded-xl px-4 py-3.5 transition-all duration-500`}
      >
        <p className={`text-xs font-bold mb-0.5 ${a.dark ? 'text-primary' : 'text-primary-foreground'}`}>
          {a.title}
        </p>
        <p className={`text-[11px] leading-relaxed ${a.dark ? 'text-primary/80' : 'text-primary-foreground/80'}`}>
          {a.body}
        </p>
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {ANNOUNCEMENTS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="p-0 border-none bg-transparent cursor-pointer"
          >
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: i === index ? 18 : 6,
                height: 6,
                background: i === index ? 'hsl(var(--primary))' : 'hsl(var(--border))',
              }}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

const ASSET_COLORS: Record<string, string> = {
  'Cash Balance': '#6366F1',
  'Stocks':       '#3B82F6',
  'Crypto':       '#F59E0B',
  'Real Estate':  '#10B981',
  'Commodities':  '#EF4444',
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { cashBalance, investments } = useInvestments();
  const [showAllMarket, setShowAllMarket] = useState(false);
  const livePrices = useLivePrices();
  const tickerItems = useMemo(() => mergeLivePrices(STATIC_TICKER, livePrices), [livePrices]);

  const [now, setNow] = useState(() => Date.now());
  const [spinning, setSpinning] = useState(false);

  // Tick every second so live balances update automatically
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = () => {
    setNow(Date.now());
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
  };

  const activeEntries = useMemo(() => Object.entries(investments).map(([key, inv]) => {
    const elapsedSecs = (now - inv.startTimestamp) / 1000;
    const earned = inv.status === 'stopped'
      ? (inv.stoppedBalance ?? inv.amount) - inv.amount
      : Math.min(elapsedSecs * inv.profitPerSec, inv.totalProfit);
    return { key, inv, currentValue: inv.amount + earned };
  }), [investments, now]);

  const planCurrent = activeEntries.reduce((s, { currentValue }) => s + currentValue, 0);
  const totalValue  = cashBalance + planCurrent;

  const portfolioChart = useMemo(() => {
    // Group investments by asset category
    const totals: Record<string, number> = {};
    for (const { inv, currentValue } of activeEntries) {
      const cat = inv.category ?? 'Other';
      totals[cat] = (totals[cat] ?? 0) + currentValue;
    }
    totals['Cash Balance'] = cashBalance;

    const grand = Object.values(totals).reduce((s, v) => s + v, 0);
    if (grand === 0) return [{ name: 'Cash Balance', value: 100, raw: 0, color: ASSET_COLORS['Cash Balance'] }];
    return Object.entries(totals)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name,
        value: Math.round((value / grand) * 100),
        raw: value,
        color: ASSET_COLORS[name] ?? '#94A3B8',
      }));
  }, [cashBalance, activeEntries]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans pb-10">

      {/* ── Nav ── */}
      <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 h-14 flex items-center justify-between px-4 sticky top-0 z-50" style={{ boxShadow: '0 2px 24px 0 rgba(10,20,60,0.10)' }}>
        <div className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="InvestX" className="h-9 w-9 rounded-xl object-cover" />
        </div>
        <div className="flex items-center gap-3">
          <button data-testid="nav-profile" onClick={() => setLocation('/profile')} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors border border-black/10">
            <User size={16} className="text-gray-800" />
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-3 sm:px-5 pt-5 space-y-6">

        {/* ── Portfolio Donut (top) ── */}
        <section
          onClick={() => setLocation('/portfolio')}
          className="bg-card rounded-xl shadow border border-border p-4 flex flex-col cursor-pointer hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.99]"
        >
            <div className="flex items-center justify-between mb-0.5">
              <h2 className="text-sm font-bold text-primary">Your Portfolio</h2>
              <button
                onClick={e => { e.stopPropagation(); handleRefresh(); }}
                className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                title="Refresh balances"
              >
                <RefreshCw
                  size={14}
                  className="text-muted-foreground"
                  style={{ transition: 'transform 0.6s', transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)' }}
                />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">Asset allocation overview</p>

            <div className="mb-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Value</div>
              <div className="text-2xl font-extrabold text-primary mt-0.5">
                ${fmt(totalValue)}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="text-[10px] font-semibold text-muted-foreground">
                  Cash: <span className="font-extrabold text-primary">${fmt(cashBalance)}</span>
                </div>
                {planCurrent > 0 && (
                  <div className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                    <TrendingUp size={11} /> +${fmt(planCurrent - activeEntries.reduce((s, { inv }) => s + inv.amount, 0))} earnings
                  </div>
                )}
              </div>
            </div>

            <div className="relative h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {portfolioChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {activeEntries.length === 0 ? 'Cash only' : 'Active'}
                </span>
                <span className="text-sm font-bold text-primary">
                  {activeEntries.length === 0 ? '0 Assets' : `${activeEntries.length} ${activeEntries.length === 1 ? 'Asset' : 'Assets'}`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-2">
              {portfolioChart.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <div className="text-[10px] font-bold text-card-foreground leading-tight">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground">${fmt(item.raw)} · {item.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        {/* ── Quick Actions ── */}
        <div className="flex justify-center gap-10">
          {[
            { icon: <Plus size={22} />,            label: 'Add Money', color: 'bg-primary text-primary-foreground', to: '/add-money' },
            { icon: <SendHorizonal size={20} />,   label: 'Send',      color: 'bg-primary text-primary-foreground', to: '/send' },
            { icon: <ArrowDownToLine size={20} />, label: 'Withdraw',  color: 'bg-primary text-primary-foreground', to: '/withdraw' },
          ].map(({ icon, label, color, to }) => (
            <button key={label} onClick={() => to && setLocation(to)} className="flex flex-col items-center gap-2 group">
              <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center shadow-md group-hover:scale-105 group-active:scale-95 transition-transform`}>
                {icon}
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Announcement Slideshow ── */}
        <AnnouncementSlider />

        {/* ── Investment Plans ── */}
        <section>
          <h2 className="text-base font-bold text-primary mb-3">Investment Plans</h2>
          {/* 2 columns on mobile → 4 on sm+. All 4 always visible. */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {PLANS.map((plan, i) => (
              <div
                key={i}
                className="flex flex-col rounded-xl overflow-hidden shadow border border-border bg-card hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                {/* Top — navy */}
                <div className="bg-primary text-primary-foreground px-2 py-3 text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold leading-none">{plan.percent}</div>
                  <div className="text-[10px] font-semibold tracking-wide text-primary-foreground/75 mt-0.5 leading-tight">
                    DAILY FOR {plan.days} DAYS
                  </div>
                </div>

                {/* Middle — gold */}
                <div className="bg-secondary h-10 flex items-center justify-center">
                  <div className="bg-primary text-secondary p-1.5 rounded-full border border-secondary/50">
                    <CircleDot size={14} strokeWidth={3} />
                  </div>
                </div>

                {/* Plan name — navy */}
                <div className="bg-primary text-primary-foreground py-2 text-center">
                  <h3 className="font-bold text-xs sm:text-sm leading-tight px-1">{plan.name}</h3>
                </div>

                {/* Details — white */}
                <div className="bg-card text-card-foreground px-2 pt-2 pb-3 flex flex-col gap-2">
                  <ul className="space-y-1 text-[10px] sm:text-xs font-medium">
                    <li className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-secondary shrink-0" />
                      <span>Min — ${plan.min.toLocaleString()}</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-secondary shrink-0" />
                      <span>Max — ${plan.max.toLocaleString()}</span>
                    </li>
                  </ul>
                  <button
                    data-testid={`plan-btn-${i}`}
                    onClick={() => setLocation(`/plan/${plan.id}`)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-1.5 rounded text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    START NOW <Check size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Ticker ── */}
        <section className="bg-primary text-primary-foreground rounded-lg py-2 overflow-hidden flex whitespace-nowrap relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-primary to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-primary to-transparent z-10" />
          <div className="animate-marquee flex gap-5 items-center shrink-0 min-w-full">
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3">
                <item.Icon size={14} />
                <span className="font-bold text-xs">{item.symbol}</span>
                <span className="text-xs text-primary-foreground/80">
                  {item.price >= 1 ? `$${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${item.price.toFixed(4)}`}
                </span>
                <span className={`text-[10px] font-bold flex items-center ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.change >= 0
                    ? <TrendingUp size={10} className="mr-0.5" />
                    : <TrendingDown size={10} className="mr-0.5" />}
                  {Math.abs(item.change).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured Assets — 2 cols mobile, 3 cols sm+ ── */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-primary">Featured Assets</h2>
            <button data-testid="view-all-assets" className="text-xs font-semibold text-secondary flex items-center gap-1">
              View All <ArrowRight size={13} />
            </button>
          </div>

          {/* Row 1: 3 featured cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3">
            {/* Tesla */}
            <div className="bg-primary text-primary-foreground rounded-xl p-3 flex flex-col justify-between h-24 sm:h-28 shadow relative overflow-hidden group">
              <div className="absolute top-1 right-1 opacity-10 group-hover:scale-110 transition-transform">
                <SiTesla size={60} />
              </div>
              <div className="flex justify-between items-start z-10">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <SiTesla size={16} />
                </div>
                <span className="text-[10px] font-bold text-green-400 flex items-center">
                  <TrendingUp size={10} className="mr-0.5" />+2.1%
                </span>
              </div>
              <div className="z-10">
                <div className="text-[10px] text-primary-foreground/70 font-semibold">Tesla (TSLA)</div>
                <div className="text-sm sm:text-base font-bold">$248.80</div>
              </div>
            </div>

            {/* Real Estate */}
            <div className="rounded-xl h-24 sm:h-28 shadow relative overflow-hidden group border border-border">
              <img src={realEstateImg} alt="Real Estate" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
              <div className="absolute inset-0 p-3 flex flex-col justify-between z-10">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                  <Building2 size={16} />
                </div>
                <div className="text-white">
                  <div className="text-[10px] font-semibold opacity-90">Real Estate</div>
                  <div className="text-sm font-bold">Index Fund</div>
                </div>
              </div>
            </div>

            {/* Crypto */}
            <div className="bg-primary text-primary-foreground rounded-xl p-3 flex flex-col justify-between h-24 sm:h-28 shadow relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 opacity-10 group-hover:scale-110 transition-transform">
                <SiBitcoin size={70} />
              </div>
              <div className="flex justify-between items-start z-10">
                <div className="w-8 h-8 rounded-full bg-secondary text-primary flex items-center justify-center">
                  <SiBitcoin size={16} />
                </div>
                <span className="text-[10px] font-bold text-green-400 flex items-center">
                  <TrendingUp size={10} className="mr-0.5" />+5.4%
                </span>
              </div>
              <div className="z-10">
                <div className="text-[10px] text-primary-foreground/70 font-semibold">Cryptocurrency</div>
                <div className="text-sm sm:text-base font-bold">$64,230</div>
              </div>
            </div>
          </div>

          {/* Row 2: 3 smaller asset cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-card text-card-foreground rounded-xl p-3 flex items-center gap-2 shadow border border-border hover:border-primary/30 transition-colors">
              <div className="w-9 h-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <Coins size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground font-semibold">Commodities</div>
                <div className="font-bold text-xs text-primary truncate">Gold / Silver</div>
              </div>
            </div>

            <div className="bg-card text-card-foreground rounded-xl p-3 flex items-center gap-2 shadow border border-border hover:border-primary/30 transition-colors">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Building2 size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground font-semibold">Real Estate</div>
                <div className="font-bold text-xs text-primary truncate">REITs & Funds</div>
              </div>
            </div>

            <div className="bg-card text-card-foreground rounded-xl p-3 flex items-center gap-2 shadow border border-border hover:border-primary/30 transition-colors">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <BarChart3 size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground font-semibold">ETFs</div>
                <div className="font-bold text-xs text-primary truncate">Index Trackers</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Market Chart ── */}
        <div className="grid grid-cols-1 gap-4">
          <section className="bg-card rounded-xl shadow border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
              <h2 className="text-sm font-bold text-primary">Market Chart</h2>
              <button
                onClick={() => setShowAllMarket(v => !v)}
                className="text-xs font-semibold text-secondary flex items-center gap-1 hover:opacity-70 transition-opacity"
              >
                {showAllMarket ? 'Show Less' : 'View All'} <ArrowRight size={13} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-muted-foreground uppercase bg-muted/30">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Asset</th>
                    <th className="px-3 py-2 font-semibold hidden sm:table-cell">Category</th>
                    <th className="px-3 py-2 font-semibold hidden sm:table-cell">Min.</th>
                    <th className="px-3 py-2 font-semibold">ROI</th>
                    <th className="px-3 py-2 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(showAllMarket ? ASSETS_LIST : ASSETS_LIST.slice(0, 4)).map((asset, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-3 py-2.5 font-bold text-primary">{asset.name}</td>
                      <td className="px-3 py-2.5 hidden sm:table-cell">
                        <span className="bg-primary/8 text-primary text-[10px] font-bold px-2 py-0.5 rounded">
                          {asset.category}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-medium hidden sm:table-cell text-muted-foreground">{asset.min}</td>
                      <td className="px-3 py-2.5 font-bold">
                        <span className={`flex items-center gap-0.5 ${asset.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                          {asset.trend === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {asset.roi}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => setLocation(`/market-chart/${encodeURIComponent(asset.name)}`)}
                          className="text-[10px] font-bold text-primary border border-primary/20 px-2 py-1 rounded hover:bg-primary/5 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
