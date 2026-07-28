import React, { useState } from 'react';
import CryptoHeroAnimated from '@/components/CryptoHeroAnimated';
import CommoditiesHeroVideo from '@/components/CommoditiesHeroVideo';
import RealEstateHeroAnimated from '@/components/RealEstateHeroAnimated';
import { useParams, useLocation } from 'wouter';
import {
  ArrowLeft, BadgeCheck, Lock, TrendingUp,
  Globe, Star, Zap, BarChart3, Coins, Building2,
} from 'lucide-react';
import { SiBitcoin } from 'react-icons/si';

// ── Plan data ─────────────────────────────────────────────────────────────────
const PLANS: Record<string, {
  name: string; rate: string; days: number; min: number; max: number; badge: string;
}> = {
  basic:    { name: 'Basic Plan',    rate: '5%',  days: 3, min: 50,    max: 1000,   badge: 'STARTER' },
  standard: { name: 'Standard Plan', rate: '6%',  days: 3, min: 1100,  max: 10000,  badge: 'POPULAR' },
  premium:  { name: 'Premium Plan',  rate: '7%',  days: 3, min: 11000, max: 20000,  badge: 'ADVANCED' },
  excel:    { name: 'Excel Plus',    rate: '10%', days: 3, min: 21000, max: 100000, badge: 'ELITE' },
};

// ── Category data ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'stocks',
    label: 'Stocks',
    Icon: BarChart3,
    gradient: 'from-[#1a0533] via-[#3b0764] to-[#6d28d9]',
    accent: '#a855f7',
    accentLight: '#f3e8ff',
    accentText: 'text-purple-300',
    tagline: 'Own a piece of the world\'s most powerful companies.',
    description: (planName: string, rate: string) =>
      `Equities represent fractional ownership in global corporations — from Fortune 500 giants to emerging growth leaders. Our algorithm-driven stock selection targets consistent yield assets, giving your capital a reliable ${rate} daily return within the InvestX ${planName}.`,
    highlights: ['NYSE & NASDAQ listed', 'Blue-chip & growth mix', 'Dividend-weighted selection'],
  },
  {
    id: 'crypto',
    label: 'Crypto',
    Icon: SiBitcoin,
    gradient: 'from-[#1c0a00] via-[#7c2d12] to-[#c2410c]',
    accent: '#fb923c',
    accentLight: '#fff7ed',
    accentText: 'text-orange-300',
    tagline: 'Digital assets. Real returns.',
    description: (planName: string, rate: string) =>
      `Cryptocurrency markets run 24/7, generating yield opportunities that traditional markets simply cannot. The InvestX ${planName} channels your capital into a curated basket of top-tier digital assets — BTC, ETH, and vetted altcoins — managed by our automated risk engine, delivering ${rate} daily.`,
    highlights: ['BTC, ETH & top altcoins', '24/7 market exposure', 'Automated rebalancing'],
  },
  {
    id: 'commodities',
    label: 'Commodities',
    Icon: Coins,
    gradient: 'from-[#1c1500] via-[#713f12] to-[#a16207]',
    accent: '#eab308',
    accentLight: '#fefce8',
    accentText: 'text-yellow-300',
    tagline: 'Tangible value. Timeless assets.',
    description: (planName: string, rate: string) =>
      `Gold, silver, oil, and agricultural futures have been stores of wealth for centuries. Under the ${planName}, your investment gains exposure to commodity price movements — historically uncorrelated with stock markets — offering a natural hedge and ${rate} daily income stream.`,
    highlights: ['Gold, silver & crude oil', 'Inflation-resistant assets', 'Low correlation to equities'],
  },
  {
    id: 'realestate',
    label: 'Real Estate',
    Icon: Building2,
    gradient: 'from-[#001a0f] via-[#064e3b] to-[#065f46]',
    accent: '#34d399',
    accentLight: '#ecfdf5',
    accentText: 'text-emerald-300',
    tagline: 'Prime property. Premium returns.',
    description: (planName: string, rate: string) =>
      `Real estate is the world's largest asset class — and InvestX makes it accessible from $${planName === 'Basic Plan' ? '50' : 'your plan minimum'}. Through tokenized REITs and property funds, the ${planName} routes your capital into commercial and residential property income streams, generating ${rate} daily yields backed by physical assets.`,
    highlights: ['REITs & property funds', 'Commercial & residential', 'Asset-backed security'],
  },
];

function fmt(n: number) {
  return n.toLocaleString('en-US');
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PlanDetail() {
  const [, setLocation] = useLocation();
  const params = useParams<{ planId: string }>();
  const [activeId, setActiveId] = useState('stocks');

  const planId = params?.planId ?? 'basic';
  const plan = PLANS[planId] ?? PLANS.basic;
  const cat = CATEGORIES.find(c => c.id === activeId)!;

  const exampleInvest = plan.min;
  const dailyReturn = exampleInvest * (parseFloat(plan.rate) / 100);
  const totalReturn = dailyReturn * plan.days;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setLocation('/app')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={17} /> Back
        </button>
        <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">{plan.badge} · {plan.name}</span>
        <div className="w-14" />
      </div>

      {/* ── Hero: stocks, crypto, commodities & realestate = full-bleed media, others = gradient card ── */}
      {(cat.id === 'stocks' || cat.id === 'crypto' || cat.id === 'commodities' || cat.id === 'realestate') ? (
        <>
          {/* Full-bleed hero */}
          {cat.id === 'crypto' ? (
            <CryptoHeroAnimated />
          ) : cat.id === 'commodities' ? (
            <CommoditiesHeroVideo />
          ) : cat.id === 'realestate' ? (
            <RealEstateHeroAnimated />
          ) : (
            <img
              src="/IMG_3842_1784839246710.jpeg"
              alt="Stock Market"
              className="w-full object-cover"
              style={{ height: 280, display: 'block' }}
            />
          )}

          {/* Text content below the image */}
          <div className="px-4 pt-5 flex flex-col gap-4">
            {/* Category label */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: cat.accent + '20', border: `1px solid ${cat.accent}40` }}>
                <cat.Icon size={16} style={{ color: cat.accent }} />
              </div>
              <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: cat.accent }}>
                {cat.label}
              </span>
            </div>

            {/* Tagline + description */}
            <div>
              <h1 className="text-2xl font-extrabold leading-tight text-gray-900 mb-2">{cat.tagline}</h1>
              <p className="text-sm text-gray-500 leading-relaxed">{cat.description(plan.name, plan.rate)}</p>
            </div>

            {/* Highlights */}
            <div className="flex flex-wrap gap-2">
              {cat.highlights.map(h => (
                <span key={h} className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                  style={{ color: cat.accent, borderColor: cat.accent + '40', backgroundColor: cat.accent + '12' }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Plan rate strip */}
            <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
              <div>
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Daily Return</div>
                <div className="text-2xl font-extrabold" style={{ color: cat.accent }}>{plan.rate}</div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Duration</div>
                <div className="text-2xl font-extrabold text-gray-900">{plan.days} Days</div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Min. Entry</div>
                <div className="text-2xl font-extrabold text-gray-900">${fmt(plan.min)}</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ── Other categories: gradient card ── */
        <div className="px-4 pt-5 pb-0">
          <div className={`relative w-full rounded-3xl overflow-hidden bg-gradient-to-br ${cat.gradient} shadow-2xl`}
            style={{ minHeight: 320 }}>

            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
            />
            <div className="absolute -bottom-6 -right-6 opacity-10">
              <cat.Icon size={200} />
            </div>

            <div className="relative z-10 p-6 flex flex-col gap-5" style={{ minHeight: 320 }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: cat.accent + '30', border: `1px solid ${cat.accent}40` }}>
                  <cat.Icon size={16} style={{ color: cat.accent }} />
                </div>
                <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: cat.accent }}>
                  {cat.label}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold leading-tight text-white mb-2">{cat.tagline}</h1>
                <p className="text-sm text-white/60 leading-relaxed">{cat.description(plan.name, plan.rate)}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto">
                {cat.highlights.map(h => (
                  <span key={h} className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                    style={{ color: cat.accent, borderColor: cat.accent + '40', backgroundColor: cat.accent + '15' }}>
                    {h}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between bg-black/30 rounded-2xl px-4 py-3 mt-1 backdrop-blur-sm border border-white/10">
                <div>
                  <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Daily Return</div>
                  <div className="text-2xl font-extrabold" style={{ color: cat.accent }}>{plan.rate}</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Duration</div>
                  <div className="text-2xl font-extrabold text-white">{plan.days} Days</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Min. Entry</div>
                  <div className="text-2xl font-extrabold text-white">${fmt(plan.min)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Category selector ── */}
      <div className="px-4 mt-5">
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Select Asset Class</div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(c => {
            const active = c.id === activeId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shrink-0"
                style={active
                  ? { backgroundColor: c.accent + '20', color: c.accent, border: `1px solid ${c.accent}50` }
                  : { backgroundColor: 'transparent', color: '#00000050', border: '1px solid #00000015' }
                }
              >
                <c.Icon size={13} />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Returns calculator example ── */}
      <div className="px-4 mt-6">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
            Example — ${fmt(exampleInvest)} investment
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: plan.days }).map((_, d) => (
              <div key={d} className="bg-white rounded-xl p-3 text-center border border-gray-200">
                <div className="text-[10px] text-gray-400 font-semibold mb-1">Day {d + 1}</div>
                <div className="text-sm font-extrabold" style={{ color: cat.accent }}>
                  +${(dailyReturn).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-gray-200">
            <span className="text-xs text-gray-500 font-semibold">Total returned after {plan.days} days</span>
            <span className="text-sm font-extrabold text-gray-900">${(exampleInvest + totalReturn).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── Trust & authenticity section ── */}
      <div className="px-4 mt-6">
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Why InvestX</div>

        <div className="space-y-3">
          {[
            {
              Icon: Lock,
              title: 'Bank-grade Security',
              body: 'Your funds are protected by 256-bit AES encryption, cold wallet custody, and real-time fraud monitoring — the same standard used by global tier-1 banks.',
            },
            {
              Icon: BadgeCheck,
              title: 'Regulated & Compliant',
              body: 'InvestX operates under full regulatory oversight. All investment plans are structured through licensed financial instruments audited quarterly by independent third parties.',
            },
            {
              Icon: Globe,
              title: 'Global Liquidity Network',
              body: 'Connected to over 40 international liquidity providers, InvestX executes trades at institutional speed — ensuring your returns are captured at the best possible rates.',
            },
            {
              Icon: Star,
              title: 'Proven Track Record',
              body: 'Trusted by over 120,000 investors across 85 countries. InvestX has maintained a 100% return delivery record since inception, with zero late payments.',
            },
            {
              Icon: Zap,
              title: 'Instant Execution',
              body: 'Plans activate the moment your investment is confirmed. No manual processing, no waiting periods — your capital starts working for you immediately.',
            },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="flex gap-3 rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: cat.accent + '15', border: `1px solid ${cat.accent}30` }}>
                <Icon size={17} style={{ color: cat.accent }} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 mb-0.5">{title}</div>
                <div className="text-[11px] text-gray-500 leading-relaxed">{body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="px-4 pt-6 pb-10">
        <div className="text-center text-[10px] text-gray-400 font-semibold mb-4 leading-relaxed">
          By continuing you confirm you have read and agree to InvestX's<br />
          Terms of Service and Risk Disclosure.
        </div>
        <button
          onClick={() => {
            if (cat.id === 'stocks') setLocation(`/plan/${planId}/stocks`);
            else if (cat.id === 'crypto') setLocation(`/plan/${planId}/crypto`);
            else if (cat.id === 'commodities') setLocation(`/plan/${planId}/commodities`);
            else if (cat.id === 'realestate') setLocation(`/plan/${planId}/realestate`);
          }}
          className="w-full py-4 rounded-2xl text-sm font-extrabold tracking-wide transition-all active:scale-[0.98] shadow-lg text-white"
          style={{ backgroundColor: cat.accent }}
        >
          Invest in {cat.label} — {plan.rate} Daily
        </button>
      </div>
    </div>
  );
}
