import React from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { SiBitcoin } from 'react-icons/si';

// ── Coin list ──────────────────────────────────────────────────────────────────
const COINS = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: '$64,103.38',
    change: '-1.48%',
    up: false,
    icon: <SiBitcoin size={28} className="text-amber-500" />,
    iconBg: 'bg-amber-50',
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether (BEP-20)',
    price: '$1.00',
    change: '+0.01%',
    up: true,
    icon: <span className="text-[13px] font-black text-emerald-600">₮</span>,
    iconBg: 'bg-emerald-50',
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin (BEP-20)',
    price: '$1.00',
    change: '0.00%',
    up: true,
    icon: <span className="text-[12px] font-black text-blue-600">$</span>,
    iconBg: 'bg-blue-50',
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function CryptoSelect() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 shadow-md">
        <button
          onClick={() => setLocation('/add-money')}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold leading-tight">Select Crypto</h1>
          <p className="text-[11px] text-primary-foreground/60">Choose a coin to deposit</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-2">
        {COINS.map((coin) => (
          <button
            key={coin.id}
            onClick={() => setLocation(`/add-money/crypto/${coin.id}`)}
            className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.99] transition-all text-left"
          >
            {/* Icon */}
            <div className={`w-11 h-11 rounded-full ${coin.iconBg} flex items-center justify-center shrink-0`}>
              {coin.icon}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-primary">{coin.symbol}</div>
              <div className="text-[11px] text-muted-foreground">{coin.name}</div>
            </div>

            {/* Price + change */}
            <div className="text-right shrink-0">
              <div className="text-[13px] font-bold text-primary">{coin.price}</div>
              <div className={`text-[11px] font-semibold ${coin.up ? 'text-green-500' : 'text-red-500'}`}>
                {coin.change}
              </div>
            </div>

            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </button>
        ))}
      </main>
    </div>
  );
}
