import { useLocation } from 'wouter';
import { ArrowLeft, TrendingUp, BarChart2, Coins, Layers, Zap, Shield, Globe, ChevronRight } from 'lucide-react';

const DARK = '#070E1C';
const GOLD = '#D4A017';
const WHITE = '#FFFFFF';

function InfoNav() {
  const [, setLocation] = useLocation();
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: DARK, borderBottom: '1px solid rgba(212,160,23,0.15)', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <button onClick={() => setLocation('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.15)' }} />
      <img src="/investx-logo.jpeg" alt="InvestX" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
      <span style={{ color: WHITE, fontWeight: 700, fontSize: 15 }}>InvestX</span>
    </nav>
  );
}

function Hero({ title, subtitle, tag }: { title: string; subtitle: string; tag: string }) {
  return (
    <section style={{ background: `linear-gradient(135deg, #060C1A 0%, #081428 60%, #060F1C 100%)`, padding: '80px 32px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(212,160,23,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(212,160,23,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
        <span style={{ display: 'inline-block', background: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.3)', borderRadius: 20, padding: '5px 16px', fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>{tag}</span>
        <h1 style={{ fontSize: 'clamp(36px,6vw,56px)', fontWeight: 800, color: WHITE, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-1.5px' }}>{title}</h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>{subtitle}</p>
      </div>
    </section>
  );
}

function StatRow({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <section style={{ background: '#f9fafb', borderBottom: '1px solid #f0f0f0', padding: '32px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: DARK, letterSpacing: '-1px' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── STOCKS ─────────────────────────────────────────────────── */
export function StocksPage() {
  const [, setLocation] = useLocation();
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: WHITE, minHeight: '100vh' }}>
      <InfoNav />
      <Hero tag="Products · Stocks" title="Invest in the world's best companies" subtitle="Buy fractional shares of thousands of US and international stocks — starting from as little as $1, with zero commission on every trade." />
      <StatRow stats={[{ value: '10,000+', label: 'Stocks available' }, { value: '$0', label: 'Commission per trade' }, { value: '$1', label: 'Minimum buy-in' }, { value: '24/5', label: 'Market hours' }]} />

      <section style={{ padding: '72px 32px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: DARK, marginBottom: 48, letterSpacing: '-1px' }}>Why trade stocks on InvestX?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
          {[
            { icon: <TrendingUp size={22} color={GOLD} />, title: 'Real-time market data', desc: 'Live quotes, depth charts, and pre/after-market data powered by institutional-grade feeds.' },
            { icon: <Layers size={22} color={GOLD} />, title: 'Fractional shares', desc: 'Own a slice of Amazon, Tesla, or Apple for as little as $1 — no need to buy a full share.' },
            { icon: <Shield size={22} color={GOLD} />, title: 'SIPC insured', desc: 'Your securities are protected up to $500,000 through SIPC membership.' },
            { icon: <BarChart2 size={22} color={GOLD} />, title: 'Advanced charting', desc: 'Candlestick, line, and area charts with 30+ technical indicators built right in.' },
            { icon: <Zap size={22} color={GOLD} />, title: 'Instant execution', desc: 'Market and limit orders execute in milliseconds — never miss your entry price.' },
            { icon: <Globe size={22} color={GOLD} />, title: 'Global markets', desc: 'Trade stocks listed on NYSE, NASDAQ, LSE, TSX, ASX, and more.' },
          ].map(f => (
            <div key={f.title} style={{ border: '1.5px solid #f0f0f0', borderRadius: 16, padding: '28px 24px' }}>
              <div style={{ marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: DARK, padding: '64px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: WHITE, margin: '0 0 16px' }}>Ready to start trading?</h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 28, fontSize: 15 }}>Open your account in under 2 minutes.</p>
        <button onClick={() => setLocation('/signup')} style={{ padding: '14px 36px', background: GOLD, border: 'none', borderRadius: 28, color: DARK, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Get Started</button>
      </section>
    </div>
  );
}

/* ── ETFs ────────────────────────────────────────────────────── */
export function ETFsPage() {
  const [, setLocation] = useLocation();
  const etfs = [
    { ticker: 'SPY', name: 'SPDR S&P 500 ETF', category: 'US Equities', expense: '0.09%', return1y: '+24.2%' },
    { ticker: 'QQQ', name: 'Invesco QQQ Trust', category: 'Technology', expense: '0.20%', return1y: '+31.8%' },
    { ticker: 'VTI', name: 'Vanguard Total Stock Market', category: 'Diversified', expense: '0.03%', return1y: '+22.7%' },
    { ticker: 'GLD', name: 'SPDR Gold Shares', category: 'Commodities', expense: '0.40%', return1y: '+13.4%' },
    { ticker: 'AGG', name: 'iShares Core US Aggregate Bond', category: 'Fixed Income', expense: '0.03%', return1y: '+4.1%' },
    { ticker: 'ARKK', name: 'ARK Innovation ETF', category: 'Disruptive Tech', expense: '0.75%', return1y: '+18.9%' },
  ];
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: WHITE, minHeight: '100vh' }}>
      <InfoNav />
      <Hero tag="Products · ETFs" title="Diversify with a single trade" subtitle="Exchange-Traded Funds give you instant exposure to hundreds of assets — sectors, geographies, and themes — with the simplicity of buying a single stock." />
      <StatRow stats={[{ value: '500+', label: 'ETFs available' }, { value: '$0', label: 'Commission' }, { value: '0.03%', label: 'Lowest expense ratio' }, { value: '40+', label: 'Asset categories' }]} />

      <section style={{ padding: '72px 32px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: DARK, margin: '0 0 32px', letterSpacing: '-0.5px' }}>Popular ETFs on InvestX</h2>
        <div style={{ border: '1.5px solid #f0f0f0', borderRadius: 16, overflow: 'hidden' }}>
          {etfs.map((e, i) => (
            <div key={e.ticker} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 90px 80px', gap: 16, alignItems: 'center', padding: '18px 24px', background: i % 2 === 0 ? WHITE : '#fafafa', borderBottom: i < etfs.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <span style={{ fontWeight: 800, color: DARK, fontSize: 14 }}>{e.ticker}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{e.name}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{e.category}</div>
              </div>
              <span style={{ fontSize: 13, color: '#666', textAlign: 'center' }}>{e.expense} expense</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981', textAlign: 'right' }}>{e.return1y}</span>
              <button onClick={() => setLocation('/signup')} style={{ padding: '6px 14px', background: GOLD, border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 700, color: DARK, cursor: 'pointer' }}>Invest</button>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#bbb', marginTop: 12 }}>Past performance is not indicative of future results. 1-year returns are illustrative.</p>
      </section>

      <section style={{ background: DARK, padding: '64px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: WHITE, margin: '0 0 16px' }}>Start building your diversified portfolio</h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>No minimum required. Add ETFs to your portfolio in seconds.</p>
        <button onClick={() => setLocation('/signup')} style={{ padding: '14px 36px', background: GOLD, border: 'none', borderRadius: 28, color: DARK, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Open Account</button>
      </section>
    </div>
  );
}

/* ── CRYPTO ─────────────────────────────────────────────────── */
export function CryptoInfoPage() {
  const [, setLocation] = useLocation();
  const coins = [
    { symbol: 'BTC', name: 'Bitcoin', price: '$67,420', change: '+3.2%', logo: '/crypto-logos/bitcoin.png' },
    { symbol: 'ETH', name: 'Ethereum', price: '$3,548', change: '+5.1%', logo: '/crypto-logos/ethereum.png' },
    { symbol: 'SOL', name: 'Solana', price: '$182', change: '+8.4%', logo: '/crypto-logos/solana.png' },
    { symbol: 'BNB', name: 'BNB', price: '$612', change: '+1.9%', logo: '/crypto-logos/bnb.png' },
    { symbol: 'ADA', name: 'Cardano', price: '$0.68', change: '-1.2%', logo: '/crypto-logos/cardano.png' },
    { symbol: 'XRP', name: 'XRP', price: '$0.74', change: '+2.7%', logo: '/crypto-logos/xrp.png' },
  ];
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: WHITE, minHeight: '100vh' }}>
      <InfoNav />
      <Hero tag="Products · Crypto" title="Trade crypto around the clock" subtitle="Access 100+ cryptocurrencies with tight spreads, deep liquidity, and the security of a regulated exchange. Trade 24/7, 365 days a year." />
      <StatRow stats={[{ value: '100+', label: 'Cryptocurrencies' }, { value: '24/7', label: 'Trading availability' }, { value: '0.1%', label: 'Spot trade fee' }, { value: '$5', label: 'Minimum trade' }]} />

      <section style={{ padding: '72px 32px', maxWidth: 860, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: DARK, margin: '0 0 32px' }}>Top cryptocurrencies</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 16 }}>
          {coins.map(c => (
            <div key={c.symbol} style={{ border: '1.5px solid #f0f0f0', borderRadius: 16, padding: '20px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: DARK, flexShrink: 0 }}>{c.symbol.slice(0,1)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{c.name}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{c.symbol}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{c.price}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: c.change.startsWith('+') ? '#10b981' : '#ef4444' }}>{c.change}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: DARK, padding: '64px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: WHITE, margin: '0 0 16px' }}>Trade crypto with confidence</h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>Cold storage, 2FA, and insurance-backed custody on every account.</p>
        <button onClick={() => setLocation('/signup')} style={{ padding: '14px 36px', background: GOLD, border: 'none', borderRadius: 28, color: DARK, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Start Trading</button>
      </section>
    </div>
  );
}

/* ── OPTIONS ────────────────────────────────────────────────── */
export function OptionsPage() {
  const [, setLocation] = useLocation();
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: WHITE, minHeight: '100vh' }}>
      <InfoNav />
      <Hero tag="Products · Options" title="Amplify your strategy with options" subtitle="Trade calls and puts on thousands of US equities with no per-contract commission. Built for both beginners and seasoned derivatives traders." />
      <StatRow stats={[{ value: '$0', label: 'Per-contract fee' }, { value: '5,000+', label: 'Optionable stocks' }, { value: 'Weekly', label: 'Expiry cycles' }, { value: 'Level 3', label: 'Max approval tier' }]} />

      <section style={{ padding: '72px 32px', maxWidth: 860, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: DARK, margin: '0 0 36px' }}>Options trading levels</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { level: 'Level 1', title: 'Covered Calls & Cash-Secured Puts', desc: 'Ideal for investors who already hold stock and want to generate extra income by selling calls or puts against existing positions.', eligible: 'Most accounts' },
            { level: 'Level 2', title: 'Long Calls & Puts', desc: 'Buy calls and puts outright to speculate on price direction or hedge existing positions without owning the underlying shares.', eligible: 'Active traders' },
            { level: 'Level 3', title: 'Spreads & Multi-Leg Strategies', desc: 'Execute credit spreads, debit spreads, iron condors, and other defined-risk multi-leg strategies for advanced portfolio management.', eligible: 'Approved accounts' },
          ].map(l => (
            <div key={l.level} style={{ border: '1.5px solid #f0f0f0', borderRadius: 16, padding: '24px 28px', display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 20, alignItems: 'center' }}>
              <div style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.3)', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: 1 }}>{l.level}</div>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 6 }}>{l.title}</div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.55 }}>{l.desc}</div>
              </div>
              <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>{l.eligible}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: DARK, padding: '64px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: WHITE, margin: '0 0 16px' }}>Apply for options trading</h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>Complete a quick eligibility questionnaire to unlock your options level.</p>
        <button onClick={() => setLocation('/signup')} style={{ padding: '14px 36px', background: GOLD, border: 'none', borderRadius: 28, color: DARK, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Apply Now</button>
      </section>
    </div>
  );
}

/* ── MARGIN ─────────────────────────────────────────────────── */
export function MarginPage() {
  const [, setLocation] = useLocation();
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: WHITE, minHeight: '100vh' }}>
      <InfoNav />
      <Hero tag="Products · Margin" title="Unlock the power of margin trading" subtitle="Borrow against your portfolio to increase your buying power. InvestX Gold members get access to instant margin with rates starting at 5% APR." />
      <StatRow stats={[{ value: '5%', label: 'Starting APR' }, { value: '2×', label: 'Max leverage' }, { value: '$2,000', label: 'Minimum equity' }, { value: 'Instant', label: 'Access speed' }]} />

      <section style={{ padding: '72px 32px', maxWidth: 860, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: DARK, margin: '0 0 36px' }}>How margin works on InvestX</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24, marginBottom: 48 }}>
          {[
            { step: '01', title: 'Upgrade to Gold', desc: 'Enable margin trading by subscribing to InvestX Gold. Your account is instantly eligible.' },
            { step: '02', title: 'Fund your account', desc: 'Maintain a minimum equity of $2,000. Your purchasing power is displayed in real time.' },
            { step: '03', title: 'Trade on margin', desc: 'Place trades using your extended buying power. Interest accrues daily on the borrowed balance.' },
            { step: '04', title: 'Repay at any time', desc: 'Sell positions or deposit cash to reduce your margin balance and stop interest accrual.' },
          ].map(s => (
            <div key={s.step} style={{ border: '1.5px solid #f0f0f0', borderRadius: 16, padding: '24px 22px' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'rgba(212,160,23,0.25)', marginBottom: 12 }}>{s.step}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: '0 0 8px' }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ background: '#fff8e7', border: '1.5px solid rgba(212,160,23,0.3)', borderRadius: 14, padding: '20px 24px' }}>
          <p style={{ fontSize: 13, color: '#7a5c00', lineHeight: 1.6, margin: 0 }}>
            <strong>Risk disclosure:</strong> Margin trading involves significant risk and is not suitable for all investors. Losses can exceed deposited funds. Please read our margin risk disclosure before enabling margin trading.
          </p>
        </div>
      </section>

      <section style={{ background: DARK, padding: '64px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: WHITE, margin: '0 0 16px' }}>Unlock margin with InvestX Gold</h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>Starting at $5/month with unlimited commission-free trades included.</p>
        <button onClick={() => setLocation('/signup')} style={{ padding: '14px 36px', background: GOLD, border: 'none', borderRadius: 28, color: DARK, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Upgrade to Gold</button>
      </section>
    </div>
  );
}
