import React from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Zap } from 'lucide-react';
import { SiPaypal, SiBitcoin } from 'react-icons/si';
import {
  BsBank2,
  BsGift,
} from 'react-icons/bs';

// ── Payment methods ────────────────────────────────────────────────────────────
const METHODS = [
  {
    id: 'paypal',
    label: 'PayPal',
    description: 'Send PYUSD via your PayPal balance or linked account',
    time: '10 – 20 minutes',
    fast: true,
    icon: <SiPaypal size={26} className="text-[#003087]" />,
    bg: 'bg-[#e8f0fb]',
    to: '/add-money/pyusd',
  },
  {
    id: 'bank',
    label: 'Bank Transfer',
    description: 'Wire or ACH transfer to your US bank account',
    time: '2 – 5 business days',
    fast: false,
    icon: <BsBank2 size={26} className="text-blue-700" />,
    bg: 'bg-blue-50',
    to: '/add-money/bank',
  },
  {
    id: 'giftcard',
    label: 'Gift Card',
    description: 'Redeem a prepaid gift card code instantly',
    time: '5 – 10 minutes',
    fast: true,
    icon: <BsGift size={26} className="text-rose-500" />,
    bg: 'bg-rose-50',
    to: '/add-money/gift-card',
  },
  {
    id: 'crypto',
    label: 'Crypto',
    description: 'Fund with BTC, LTC, USDT and more',
    time: '5 – 10 minutes',
    fast: true,
    icon: <SiBitcoin size={26} className="text-amber-500" />,
    bg: 'bg-amber-50',
    to: '/add-money/crypto',
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function AddMoney() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 shadow-md">
        <button
          onClick={() => setLocation('/app')}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold leading-tight">Add Money</h1>
          <p className="text-[11px] text-primary-foreground/60">Choose a deposit method</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 pb-10 space-y-3">

        {/* Fast badge callout */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Zap size={15} className="text-amber-500 shrink-0" />
          <p className="text-[12px] text-amber-700 font-medium">
            <span className="font-bold">Gift Card</span> and <span className="font-bold">Crypto</span> deposits arrive in <span className="font-bold">5 – 10 minutes</span>.
          </p>
        </div>

        {/* Method cards */}
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => (m as any).to && setLocation((m as any).to)}
            className="w-full flex items-center gap-4 bg-card border border-border rounded-2xl px-4 py-4 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.99] transition-all text-left"
          >
            {/* Icon circle */}
            <div className={`w-13 h-13 rounded-full ${m.bg} flex items-center justify-center shrink-0 p-3`}>
              {m.icon}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-bold text-primary">{m.label}</span>
                {m.fast && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 rounded-full px-2 py-0.5">
                    <Zap size={9} /> Fast
                  </span>
                )}
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{m.description}</p>
            </div>

            {/* Delivery time */}
            <div className="shrink-0 text-right">
              <div className={`text-[10px] font-bold ${m.fast ? 'text-amber-500' : 'text-muted-foreground'}`}>
                {m.time}
              </div>
              <div className="text-[9px] text-muted-foreground/60 mt-0.5">delivery</div>
            </div>
          </button>
        ))}
      </main>
    </div>
  );
}
