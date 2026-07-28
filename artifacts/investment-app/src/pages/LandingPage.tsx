import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, User, ChevronRight, Linkedin, Twitter, Facebook, Menu, X } from 'lucide-react';
import { useLocation } from 'wouter';

/* ── Shared tokens ───────────────────────────────────────────── */
const G = '#D4A017';
const DARK = '#070E1C';
const WHITE = '#FFFFFF';

/* ── Mobile hook ─────────────────────────────────────────────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

/* ── Counter ─────────────────────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const display = useTransform(mv, v => Math.round(v) + suffix);
  useEffect(() => { if (inView) animate(mv, to, { duration: 1.6, ease: 'easeOut' }); }, [inView]);
  return <motion.span ref={ref}>{display}</motion.span>;
}

/* ── Phone Mockup ────────────────────────────────────────────── */
function PhoneUpright({ className = '', scale = 1 }: { dark?: boolean; className?: string; scale?: number }) {
  const w = Math.round(220 * scale);
  const h = Math.round(440 * scale);
  return (
    <div className={`relative ${className}`}
      style={{ width: w, height: h, borderRadius: 36 * scale, border: '2px solid rgba(255,255,255,0.18)', boxShadow: '0 40px 80px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.06)', overflow: 'hidden', flexShrink: 0, background: '#f0f2f7' }}>
      {/* Notch */}
      <div style={{ position: 'absolute', top: 8 * scale, left: '50%', transform: 'translateX(-50%)', width: 70 * scale, height: 14 * scale, background: '#1a1a2e', borderRadius: 8 * scale, zIndex: 10 }} />
      {/* Actual screenshot */}
      <img
        src="/app-screenshot.jpeg"
        alt="InvestX App"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
      />
    </div>
  );
}

/* ── Bitcoin Coin ─────────────────────────────────────────────── */
function BitcoinCoin({ size = 90 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #F0C040 0%, #D4A017 50%, #996E00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(212,160,23,0.4), inset 0 2px 4px rgba(255,255,255,0.3)', position: 'relative', flexShrink: 0 }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 32 32" fill="none">
        <path d="M22 13.5c.5-3-1.8-4.6-4.8-5.7L18 4.3l-2.2.5.7 2.8-1.7.4-.7-2.8-2.2.5.7 2.8-4.3 1 .5 2.1 1.5-.4c.8-.2 1.1.2 1.2.6l2 8.1c.1.4-.1.9-.9 1.1l-1.5.4.5 2.2 4.3-1 .8 3 2.2-.5-.8-3 1.7-.4.8 3 2.2-.5-.8-3c3.2-.9 5.2-3 4.7-6zm-7 6.2-1.6-6.4 3-.7c1.8-.4 3.2.5 3.6 2.2.4 1.8-.5 3.7-2.8 4.3l-2.2.6zm-1.8-7.4-1.3-5.3 2.5-.6c1.5-.4 2.7.3 3.1 1.8.4 1.5-.5 3-2.3 3.5l-2 .6z" fill="white"/>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION 1 — HERO
══════════════════════════════════════════════════════════════ */
function Hero({ isMobile }: { isMobile: boolean }) {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section style={{ background: 'linear-gradient(135deg, #060C1A 0%, #081428 40%, #060F1C 100%)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Grid overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(212,160,23,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,23,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
      {/* Glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-10%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(212,160,23,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '16px 20px' : '20px 48px', position: 'relative', zIndex: 20 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/investx-logo.jpeg" alt="InvestX" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
        </div>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
            {['Invest', 'Resource', 'Company', 'Premium'].map(l => (
              <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>{l}</a>
            ))}
          </div>
        )}

        {/* Desktop auth buttons */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setLocation('/login')} style={{ padding: '8px 22px', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 24, color: WHITE, background: 'transparent', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Login</button>
            <button onClick={() => setLocation('/signup')} style={{ padding: '8px 22px', borderRadius: 24, color: DARK, background: G, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Sign Up</button>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setMenuOpen(v => !v)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: WHITE, display: 'flex', alignItems: 'center', padding: 4 }}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </nav>

      {/* Mobile menu dropdown */}
      {isMobile && menuOpen && (
        <div style={{ position: 'absolute', top: 64, left: 0, right: 0, background: '#0A1525', zIndex: 30, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['Invest', 'Resource', 'Company', 'Premium'].map(l => (
            <a key={l} href="#" onClick={() => setMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, textDecoration: 'none', fontWeight: 500 }}>{l}</a>
          ))}
          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            <button onClick={() => { setMenuOpen(false); setLocation('/login'); }} style={{ flex: 1, padding: '10px 0', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 24, color: WHITE, background: 'transparent', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Login</button>
            <button onClick={() => { setMenuOpen(false); setLocation('/signup'); }} style={{ flex: 1, padding: '10px 0', borderRadius: 24, color: DARK, background: G, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Sign Up</button>
          </div>
        </div>
      )}

      {/* HERO BODY */}
      {isMobile ? (
        /* ── Mobile: single-column stack ── */
        <div style={{ padding: '32px 20px 48px', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.1, color: WHITE, letterSpacing: '-1.5px', margin: 0, textAlign: 'center' }}
          >
            Investing for<br />
            <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>those</span> who<br />
            take it seriously
          </motion.h1>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <div style={{ flex: 1, border: '1.5px dashed rgba(212,160,23,0.5)', borderRadius: 12, padding: '12px 14px', background: 'rgba(212,160,23,0.05)', textAlign: 'center' }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: G }}><Counter to={228} suffix="M" /></span>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Users</div>
            </div>
            <div style={{ flex: 1, border: '1.5px dashed rgba(212,160,23,0.5)', borderRadius: 12, padding: '12px 14px', background: 'rgba(212,160,23,0.05)', textAlign: 'center' }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: G }}><Counter to={51} suffix="%" /></span>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Active</div>
            </div>
          </div>

          {/* Phone — centered, smaller */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              style={{ transform: 'perspective(800px) rotateY(-8deg) rotateX(4deg)' }}
            >
              <PhoneUpright scale={0.82} />
            </motion.div>
          </motion.div>

          {/* Description + CTA */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 20 }}>
              From your first investment to your next big move, InvestX makes trading effortless.
            </p>
            <button onClick={() => setLocation('/signup')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 28, color: WHITE, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Get Started <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* ── Desktop: 3-column grid ── */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 0.9fr', gap: 0, padding: '40px 48px 60px', alignItems: 'center', minHeight: 'calc(100vh - 80px)', position: 'relative', zIndex: 10 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', paddingTop: 20 }}>
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, color: WHITE, letterSpacing: '-2px', margin: 0 }}
            >
              Investing for<br />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>those</span> who<br />
              take it<br />
              seriously
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{ width: 140, height: 140, border: '1.5px dashed rgba(212,160,23,0.4)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 48 }}
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}>
                <BitcoinCoin size={100} />
              </motion.div>
            </motion.div>
          </div>

          {/* CENTER */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                style={{ transform: 'perspective(800px) rotateY(-18deg) rotateX(6deg)', transformOrigin: 'center center' }}
              >
                <PhoneUpright />
              </motion.div>
            </motion.div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end' }}>
            <div style={{ border: '1.5px dashed rgba(212,160,23,0.5)', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(212,160,23,0.05)' }}>
              <div>
                <span style={{ fontSize: 40, fontWeight: 800, color: G, letterSpacing: '-1px' }}>
                  <Counter to={228} suffix="M" />
                </span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginLeft: 6 }}>Users</span>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color="rgba(255,255,255,0.6)" />
              </div>
            </div>
            <div style={{ border: '1.5px dashed rgba(212,160,23,0.5)', borderRadius: 12, padding: '12px 20px', background: 'rgba(212,160,23,0.05)', alignSelf: 'flex-end' }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginRight: 8 }}>Active</span>
              <span style={{ fontSize: 36, fontWeight: 800, color: G, letterSpacing: '-1px' }}>
                <Counter to={51} suffix="%" />
              </span>
            </div>
            <div style={{ marginTop: 40, textAlign: 'right' }}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 20, maxWidth: 220, marginLeft: 'auto' }}>
                From your first investment to your next big move, InvestX makes trading effortless.
              </p>
              <button onClick={() => setLocation('/signup')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 28, color: WHITE, fontSize: 14, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                Get Started <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION 2 — SOCIAL PROOF
══════════════════════════════════════════════════════════════ */
function SocialProof({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ background: WHITE, padding: isMobile ? '48px 20px 0' : '72px 48px 0' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => (
            <svg key={i} width="22" height="22" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fill={G} /></svg>
          ))}
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>
          {!isMobile && (
            <button style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #e5e7eb', background: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <ArrowLeft size={16} color="#666" />
            </button>
          )}
          <blockquote style={{ fontSize: isMobile ? 16 : 22, lineHeight: 1.5, color: '#111', fontWeight: 500, margin: 0 }}>
            "It's earns high marks for ease-of-use and its investment selection—options traders will likely get excited about their PFOF rebate program."
          </blockquote>
          {!isMobile && (
            <button style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #e5e7eb', background: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <ArrowRight size={16} color="#666" />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 20 : 32, marginTop: 28, flexWrap: 'wrap' }}>
          {[
            { brand: 'Forbes', label: 'BEST BUDGETING\nAPP 2024' },
            { brand: 'Fast Company', label: 'MOST INNOVATIVE\nCOMPANIES 2024' },
          ].map(a => (
            <div key={a.brand} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="24" height="30" viewBox="0 0 24 30" fill="none">
                <path d="M12 2C8 8 2 10 2 18c0 5 4 8 10 10 6-2 10-5 10-10 0-8-6-10-10-16z" stroke="#111" strokeWidth="1.2" fill="none"/>
                <path d="M7 14l5 5 5-8" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>{a.brand}</div>
                <div style={{ fontSize: 9, color: '#555', whiteSpace: 'pre', lineHeight: 1.4 }}>{a.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION 2B — USER REVIEWS CAROUSEL
══════════════════════════════════════════════════════════════ */
const REVIEWS = [
  {
    name: 'Marcus T.',
    avatar: 'MT',
    stars: 5,
    amount: '$18,400',
    days: 3,
    text: 'I put in $15,000 on a Thursday and by Sunday I had $18,400 in my account. I honestly didn\'t believe it at first — had to refresh the page three times. InvestX is the real deal.',
  },
  {
    name: 'Aisha B.',
    avatar: 'AB',
    stars: 5,
    amount: '$640',
    days: 3,
    text: 'Started with just $500, didn\'t want to risk too much. Three days later I\'m at $640. That\'s $140 profit in a weekend — more than I make in a shift at work. Already putting in more.',
  },
  {
    name: 'Daniel F.',
    avatar: 'DF',
    stars: 5,
    amount: '$52,300',
    days: 3,
    text: 'Moved $40k over from another platform and activated the Premium Plan. Within 72 hours my portfolio hit $52,300. The profit tracking in real time is addictive. 10/10.',
  },
  {
    name: 'Priya S.',
    avatar: 'PS',
    stars: 5,
    amount: '$1,870',
    days: 3,
    text: 'I was skeptical so I tested with $1,500. Three days later: $1,870. Showed my husband the screenshot and we both decided to invest more. The returns are consistently impressive.',
  },
  {
    name: 'Reginald O.',
    avatar: 'RO',
    stars: 5,
    amount: '$94,800',
    days: 3,
    text: 'I\'ve been in finance for 12 years. InvestX\'s returns genuinely surprised me. Invested $75,000 across two plans — sitting at $94,800 after just three days. Nothing else comes close.',
  },
  {
    name: 'Chloe M.',
    avatar: 'CM',
    stars: 5,
    amount: '$320',
    days: 3,
    text: 'I\'m a student so I only had $250 to spare. Made $320 in 3 days — that\'s $70 profit! Might seem small but for me it\'s huge. Already telling my classmates about this.',
  },
];

function StarIcon({ fill }: { fill: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fill={fill} />
    </svg>
  );
}

function ReviewsCarousel({ isMobile }: { isMobile: boolean }) {
  const [active, setActive] = useState(0);
  const startX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  function prev() { setActive(i => (i === 0 ? REVIEWS.length - 1 : i - 1)); }
  function next() { setActive(i => (i === REVIEWS.length - 1 ? 0 : i + 1)); }

  function onTouchStart(e: React.TouchEvent) { startX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx < -40) next();
    else if (dx > 40) prev();
    startX.current = null;
  }
  function onMouseDown(e: React.MouseEvent) { startX.current = e.clientX; }
  function onMouseUp(e: React.MouseEvent) {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (dx < -40) next();
    else if (dx > 40) prev();
    startX.current = null;
  }

  const r = REVIEWS[active];
  const avatarColors = ['#6366f1','#D4A017','#10b981','#f59e0b','#3b82f6','#ec4899'];

  return (
    <section style={{ background: WHITE, padding: isMobile ? '32px 20px 48px' : '48px 48px 64px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: G, textTransform: 'uppercase', margin: '0 0 8px' }}>What our users say</p>
          <h3 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: '#111', margin: 0 }}>Real profits. Real people.</h3>
        </div>

        {/* Card */}
        <div
          ref={trackRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          style={{ userSelect: 'none', cursor: 'grab' }}
        >
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              background: '#fafafa',
              border: '1.5px solid #f0f0f0',
              borderRadius: 20,
              padding: isMobile ? '24px 20px' : '32px 36px',
              position: 'relative',
            }}
          >
            {/* Quote mark */}
            <div style={{ position: 'absolute', top: 20, right: 24, fontSize: 64, color: '#f0f0f0', lineHeight: 1, fontFamily: 'Georgia, serif', pointerEvents: 'none' }}>"</div>

            {/* Stars */}
            <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
              {Array.from({ length: r.stars }).map((_, i) => <StarIcon key={i} fill={G} />)}
            </div>

            {/* Body */}
            <p style={{ fontSize: isMobile ? 15 : 17, color: '#333', lineHeight: 1.65, margin: '0 0 24px', fontStyle: 'italic' }}>
              "{r.text}"
            </p>

            {/* Footer row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatarColors[active % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: WHITE, fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                  {r.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>Verified user · {r.days} days</div>
                </div>
              </div>

              {/* Profit badge */}
              <div style={{ background: 'linear-gradient(135deg, #d4a017 0%, #f0c040 100%)', borderRadius: 12, padding: '8px 18px', textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(7,14,28,0.7)', marginBottom: 2 }}>EARNED IN 3 DAYS</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: DARK, letterSpacing: '-0.5px' }}>{r.amount}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 }}>
          <button
            onClick={prev}
            style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <ArrowLeft size={15} color="#555" />
          </button>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: i === active ? 20 : 7,
                  height: 7,
                  borderRadius: 4,
                  background: i === active ? G : '#d1d5db',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <ArrowRight size={15} color="#555" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION 3 — FEATURE GRID
══════════════════════════════════════════════════════════════ */
function FeatureGrid({ isMobile }: { isMobile: boolean }) {
  const pad = isMobile ? '48px 20px' : '72px 48px';
  return (
    <section style={{ background: WHITE, padding: pad }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 12 : 0 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 700, color: '#111', margin: 0, lineHeight: 1.1 }}>
            <span style={{ color: '#aaa' }}>The new standard</span>{' '}
            <span style={{ color: '#111' }}>for</span><br />
            <span style={{ color: '#111' }}>active trading</span>
          </h2>
        </motion.div>
        <p style={{ fontSize: 14, color: '#888', maxWidth: isMobile ? '100%' : 240, textAlign: isMobile ? 'left' : 'right', lineHeight: 1.6, marginTop: 8 }}>
          Our customer support team of financial representatives is here ready to help you.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 16 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ borderRadius: 20, overflow: 'hidden', background: '#111c15', height: isMobile ? 280 : 360, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 28, position: 'relative' }}
        >
          <div style={{ position: 'absolute', top: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: isMobile ? 160 : 220, height: isMobile ? 160 : 220, borderRadius: '50%', background: 'radial-gradient(circle at 35% 40%, #1a3a25 0%, #0a1a0f 60%, #040e07 100%)', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="0 0 220 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }}>
                <path d="M60 70 Q80 55 100 65 Q120 75 115 95 Q110 115 90 110 Q70 105 55 90 Z" fill="rgba(212,160,23,0.25)" />
                <path d="M130 60 Q145 50 160 65 Q170 80 155 95 Q140 105 125 90 Z" fill="rgba(212,160,23,0.2)" />
                <path d="M75 125 Q95 115 120 125 Q135 135 125 155 Q110 165 90 158 Q70 150 68 135 Z" fill="rgba(212,160,23,0.22)" />
              </svg>
            </div>
          </div>
          <h3 style={{ color: WHITE, fontSize: 20, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
            Give people opportunity to grow their wealth.
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
          style={{ borderRadius: 20, background: G, height: isMobile ? 260 : 360, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 28, position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Send', icon: '↗' }, { label: 'Receive', icon: '↓' },
              { label: 'Swap', icon: '⇌' }, { label: 'More', icon: '···' },
            ].map(btn => (
              <div key={btn.label} style={{ background: WHITE, borderRadius: 14, padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, border: '1.5px dashed rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: 18, color: '#444' }}>{btn.icon}</span>
                <span style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>{btn.label}</span>
              </div>
            ))}
          </div>
          <h3 style={{ color: DARK, fontSize: 20, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
            Multi-factor analysis across of assets
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}
          style={{ borderRadius: 20, background: '#f0faf4', height: isMobile ? 260 : 360, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 28, position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'relative', height: isMobile ? 160 : 200 }}>
            <div style={{ position: 'absolute', top: 8, right: 8, textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#888' }}>Lowest rate</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#111' }}>40%</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: '100%', paddingTop: 60 }}>
              {[60, 80, 100, 75, 90].map((h, i) => (
                <div key={i} style={{ flex: 1, position: 'relative' }}>
                  <div style={{ height: h * 1.2, background: i === 4 ? G : 'rgba(212,160,23,0.2)', borderRadius: '6px 6px 0 0', border: `1px solid ${i === 4 ? G : 'rgba(212,160,23,0.4)'}` }} />
                </div>
              ))}
            </div>
          </div>
          <h3 style={{ color: '#111', fontSize: 20, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
            The lowest margin rates among others.
          </h3>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION 4 — WE'RE HERE TO HELP
══════════════════════════════════════════════════════════════ */
function HelpSection({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ background: WHITE, padding: isMobile ? '48px 20px' : '80px 48px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontSize: isMobile ? 36 : 52, fontWeight: 700, color: '#111', margin: 0 }}>We're here to help.</h2>
        <h2 style={{ fontSize: isMobile ? 36 : 52, fontWeight: 700, color: '#aaa', margin: 0 }}>Not upsell.</h2>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 40, maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, x: isMobile ? 0 : -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', background: WHITE, border: '1px solid #eee', borderRadius: 14, padding: '10px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <span style={{ fontSize: 18 }}>↗</span>
            <span style={{ fontSize: 11, color: '#666' }}>Send</span>
          </div>
          <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: WHITE, border: '1px solid #eee', borderRadius: 14, padding: '10px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <span style={{ fontSize: 18 }}>↓</span>
            <span style={{ fontSize: 11, color: '#666' }}>Receive</span>
          </div>
          <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: WHITE, border: '1px solid #eee', borderRadius: 14, padding: '10px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <span style={{ fontSize: 18 }}>⇌</span>
            <span style={{ fontSize: 11, color: '#666' }}>Swap</span>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', background: WHITE, border: '1px solid #eee', borderRadius: 14, padding: '10px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <span style={{ fontSize: 18 }}>···</span>
            <span style={{ fontSize: 11, color: '#666' }}>More</span>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #0A1838, #081428)', borderRadius: 18, padding: '20px 28px', textAlign: 'center', zIndex: 2, boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Balance</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: WHITE, letterSpacing: '-1px' }}>$8,013,20</div>
            <div style={{ fontSize: 12, color: G, marginTop: 4 }}>▲ $253.6 (4.2%)</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: isMobile ? 0 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ paddingTop: isMobile ? 16 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18 }}>👍</span>
            </div>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: 0 }}>Key Moments</h3>
          </div>
          <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 24 }}>
            Discover the reasons behind every major stock price movement with detailed analysis.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION 5 — INCOME HUB
══════════════════════════════════════════════════════════════ */
function IncomeHub({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{
      background: '#101920',
      padding: isMobile ? '48px 20px' : '80px 48px',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? 36 : 48,
      alignItems: 'center'
    }}>
      <motion.div initial={{ opacity: 0, x: isMobile ? 0 : -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: G, borderRadius: 24, padding: '8px 16px', marginBottom: 20 }}>
          <span style={{ color: DARK, fontSize: 18 }}>✦</span>
          <span style={{ color: DARK, fontWeight: 700, fontSize: 14 }}>Income Hub</span>
        </div>
        <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 700, color: WHITE, margin: '0 0 16px', lineHeight: 1.2 }}>
          View a monthly breakdown of your earnings from every income-generating asset you own.
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: isMobile ? 0 : 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
        style={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end' }}
      >
        <div style={{ transform: 'perspective(800px) rotateY(-12deg) rotateX(4deg)', transformOrigin: 'center bottom' }}>
          <PhoneUpright scale={isMobile ? 0.85 : 1} />
        </div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION 6 — SECURITY
══════════════════════════════════════════════════════════════ */
function SecuritySection({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ background: WHITE, padding: isMobile ? '48px 20px' : '80px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr 1fr', gap: 32, alignItems: 'center', maxWidth: 1100, margin: '0 auto' }}>

        {/* Left cards */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 16 }}>
          <motion.div initial={{ opacity: 0, x: isMobile ? 0 : -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            style={{ flex: 1, background: G, borderRadius: 20, padding: '20px', height: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: DARK }}>Insurance<br />coverage</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: isMobile ? 0 : -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
            style={{ flex: 1, background: WHITE, border: '1px solid #e5e7eb', borderRadius: 20, padding: '20px', height: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Grade security</span>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="40" height="46" viewBox="0 0 48 56" fill="none">
                <path d="M24 2L4 10v18c0 14 9 22 20 26 11-4 20-12 20-26V10L24 2z" fill="#e8faf0" stroke={G} strokeWidth="2"/>
                <rect x="16" y="24" width="16" height="14" rx="3" stroke="#444" strokeWidth="1.5" fill="none"/>
                <circle cx="24" cy="31" r="2" fill="#444"/>
                <path d="M19 24v-4a5 5 0 0110 0v4" stroke="#444" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Center: Phone */}
        {!isMobile && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ display: 'flex', justifyContent: 'center' }}>
            <PhoneUpright />
          </motion.div>
        )}

        {/* Right cards */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 16 }}>
          <motion.div initial={{ opacity: 0, x: isMobile ? 0 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            style={{ flex: 1, background: WHITE, border: '1px solid #e5e7eb', borderRadius: 20, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { c: '#F7931A', l: 'B' }, { c: '#26A17B', l: 'T' }, { c: '#E84142', l: 'A' }, { c: '#FF6B35', l: 'X' },
            ].map((ico, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: ico.c, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', marginLeft: i > 0 ? -8 : 0 }}>
                <span style={{ color: WHITE, fontSize: 12, fontWeight: 800 }}>{ico.l}</span>
              </div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: isMobile ? 0 : 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
            style={{ flex: 1, background: '#0d1a30', borderRadius: 20, padding: '20px', height: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
              <BitcoinCoin size={56} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>Fee transparency</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION 7 — PRICING
══════════════════════════════════════════════════════════════ */
const PLANS_LANDING = [
  { id: 'basic',    name: 'Basic Plan',    percent: '5%',  days: 3, min: 50,    max: 1_000,   badge: 'STARTER',  badgeBg: 'rgba(212,160,23,0.18)', badgeColor: G,       accent: G       },
  { id: 'standard', name: 'Standard Plan', percent: '6%',  days: 3, min: 1_100,  max: 10_000,  badge: 'POPULAR',  badgeBg: 'rgba(139,92,246,0.2)',  badgeColor: '#a78bfa', accent: '#8B5CF6' },
  { id: 'premium',  name: 'Premium Plan',  percent: '7%',  days: 3, min: 11_000, max: 20_000,  badge: 'ADVANCED', badgeBg: 'rgba(16,185,129,0.2)',  badgeColor: '#34d399', accent: '#10b981' },
  { id: 'excel',    name: 'Excel Plus',    percent: '10%', days: 3, min: 21_000, max: 100_000, badge: 'ELITE',    badgeBg: 'rgba(239,68,68,0.2)',   badgeColor: '#f87171', accent: '#ef4444' },
];

function Pricing({ isMobile }: { isMobile: boolean }) {
  const [, setLocation] = useLocation();
  return (
    <section style={{ background: 'linear-gradient(180deg, #fafafa 0%, #f0f2f7 100%)', padding: isMobile ? '48px 20px' : '80px 48px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.025) 0px, rgba(0,0,0,0.025) 1px, transparent 1px, transparent 40px)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontSize: 13, color: G, fontWeight: 700, marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Investment Plans</div>
          <h2 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 800, color: '#0A1525', lineHeight: 1.15, margin: '0 0 12px', letterSpacing: '-1px' }}>Grow your money<br />every 3 days</h2>
          <p style={{ fontSize: 15, color: '#666', margin: 0 }}>Choose a plan that fits your budget. Earn daily returns, collected after 3 days.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14 }}>
          {PLANS_LANDING.map((plan, i) => (
            <motion.div key={plan.id}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }} viewport={{ once: true }}
              style={{ background: 'linear-gradient(160deg, #0A1838 0%, #081428 100%)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
              {/* Top — rate */}
              <div style={{ padding: '20px 16px 16px', textAlign: 'center', borderBottom: `2px solid ${G}` }}>
                <div style={{ fontSize: isMobile ? 36 : 42, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: '-1px' }}>{plan.percent}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 1, marginTop: 4 }}>DAILY FOR {plan.days} DAYS</div>
              </div>
              {/* Gold strip + badge */}
              <div style={{ background: G, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(0,0,0,0.4)' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#0A1525', letterSpacing: 0.5 }}>{plan.name}</span>
              </div>
              {/* Min/Max */}
              <div style={{ padding: '14px 16px', flexGrow: 1 }}>
                <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, background: plan.badgeBg, color: plan.badgeColor, borderRadius: 4, padding: '2px 7px', marginBottom: 12, letterSpacing: 0.5 }}>{plan.badge}</span>
                {[
                  { label: 'Min', val: `$${plan.min.toLocaleString()}` },
                  { label: 'Max', val: `$${plan.max.toLocaleString()}` },
                  { label: 'Total return', val: `${parseInt(plan.percent) * plan.days}%` },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>• {row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: WHITE }}>{row.val}</span>
                  </div>
                ))}
              </div>
              {/* CTA */}
              <div style={{ padding: '0 16px 16px' }}>
                <button onClick={() => setLocation('/signup')}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 0', fontSize: 12, fontWeight: 700, color: WHITE, cursor: 'pointer', letterSpacing: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  START NOW
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke={G} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: '#999' }}>
          Returns credited to your cash balance after the 3-day period. <span style={{ color: G, fontWeight: 600, cursor: 'pointer' }} onClick={() => setLocation('/signup')}>Create a free account to invest →</span>
        </p>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION 8 — AI CTA
══════════════════════════════════════════════════════════════ */
function AiSection({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ background: 'linear-gradient(170deg, #06091A 0%, #0A1525 40%, #081428 70%, #060C1A 100%)', padding: isMobile ? '64px 20px' : '100px 48px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: -100, left: '20%', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(212,160,23,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 13, color: G, fontWeight: 600, marginBottom: 16, letterSpacing: 1 }}>AI Generated Assets</div>
        <h2 style={{ fontSize: isMobile ? 36 : 56, fontWeight: 800, color: WHITE, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-1.5px' }}>
          Make AI-powered<br />investment decisions
        </h2>
        <p style={{ fontSize: isMobile ? 14 : 16, color: 'rgba(255,255,255,0.55)', marginBottom: 48, lineHeight: 1.6 }}>
          Access real-time alerts and investing insights you can actually use.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.3fr 1fr', gap: 16 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', borderRadius: 20, padding: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', position: 'relative' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: WHITE, marginBottom: 8 }}>Energy</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>Analysis across thousands of assets.</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>100+ Assets</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ c: '#26A17B', l: 'T' }, { c: '#E84142', l: 'A' }, { c: '#5546FF', l: 'S' }].map((ico, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: ico.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: WHITE, fontSize: 11, fontWeight: 700 }}>{ico.l}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
            style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', borderRadius: 20, padding: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', position: 'relative' }}>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Historical Returns</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: WHITE }}>+128%</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Max Drawdown</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: WHITE }}>-24.5%</div>
              </div>
            </div>
            <svg width="100%" height="60" viewBox="0 0 200 60" preserveAspectRatio="none">
              <path d="M0 50 Q20 48 40 44 Q60 40 80 32 Q100 24 120 18 Q140 12 160 10 Q180 8 200 4" stroke={G} strokeWidth="2" fill="none"/>
              <path d="M0 50 Q20 48 40 44 Q60 40 80 32 Q100 24 120 18 Q140 12 160 10 Q180 8 200 4 L200 60 L0 60 Z" fill="url(#chartFill2)"/>
              <defs>
                <linearGradient id="chartFill2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={G} stopOpacity="0.25"/>
                  <stop offset="100%" stopColor={G} stopOpacity="0.02"/>
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}
            style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', borderRadius: 20, padding: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Asset Score</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: G }}>1.20x</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 20 }}>
              <div style={{ width: '72%', height: '100%', background: G, borderRadius: 2 }} />
            </div>
            {[
              { label: 'Return', val: '2,450.78' },
              { label: 'CAGR', val: '75.4%' },
              { label: 'Average annual return', val: '120.8%' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{r.label}</span>
                <span style={{ fontSize: 11, color: WHITE, fontWeight: 600 }}>{r.val}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION — INVESTMENTS SHOWCASE
══════════════════════════════════════════════════════════════ */
const investments = [
  { name: 'Real Estate', ticker: 'PROPERTY', price: '$12,400', change: '+4.2%', up: true, color: '#10b981', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M16 4L3 15h4v13h8v-8h2v8h8V15h4L16 4z" fill="#10b981"/></svg> },
  { name: 'Tesla', ticker: 'TSLA', price: '$248.42', change: '+5.2%', up: true, color: '#CC0000', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M7 11l9 15 9-15" fill="none" stroke="#CC0000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { name: 'Apple', ticker: 'AAPL', price: '$189.84', change: '+1.8%', up: true, color: '#555', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M22.5 17c0-3.8 3.1-5.7 3.2-5.8-1.8-2.6-4.5-2.9-5.5-3-2.3-.2-4.5 1.4-5.7 1.4-1.2 0-3-1.3-5-1.3C6.4 8.4 3 11 3 16.5c0 3.4 1.3 7 2.9 9.3 1.4 2 3 4.2 5.1 4.1 2.1-.1 2.9-1.3 5.4-1.3s3.2 1.3 5.4 1.3c2.2 0 3.6-2 5-4 1.6-2.3 2.2-4.6 2.2-4.7-.1-.1-4.5-1.7-4.5-6.2z" fill="#333"/></svg> },
  { name: 'Amazon', ticker: 'AMZN', price: '$178.25', change: '+2.4%', up: true, color: '#FF9900', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><text x="4" y="22" fontSize="18" fontWeight="800" fill="#FF9900" fontFamily="serif">a</text><path d="M6 26c4-2 10-3 16-1" stroke="#FF9900" strokeWidth="2" strokeLinecap="round"/></svg> },
  { name: 'Google', ticker: 'GOOGL', price: '$165.43', change: '+0.9%', up: true, color: '#4285F4', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M29 16.3c0-.9-.1-1.8-.2-2.6H16v5h7.3c-.3 1.7-1.3 3.1-2.8 4v3.3h4.5C27.5 23.6 29 20.2 29 16.3z" fill="#4285F4"/><path d="M16 29c3.6 0 6.7-1.2 8.9-3.2l-4.5-3.3c-1.2.8-2.7 1.3-4.4 1.3-3.4 0-6.3-2.3-7.3-5.3H4v3.4C6.2 26.5 10.8 29 16 29z" fill="#34A853"/><path d="M8.7 18.5c-.3-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5V10H4c-.9 1.7-1.4 3.7-1.4 5.7 0 2 .5 3.9 1.4 5.5l4.7-2.7z" fill="#FBBC05"/><path d="M16 8.3c1.9 0 3.6.6 5 1.9l3.7-3.7C22.7 4.4 19.6 3 16 3 10.8 3 6.2 5.5 4 9.4l4.7 3.4c1-3.1 3.9-4.5 7.3-4.5z" fill="#EA4335"/></svg> },
  { name: 'Microsoft', ticker: 'MSFT', price: '$415.26', change: '+3.1%', up: true, color: '#00A4EF', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect x="3" y="3" width="12" height="12" fill="#F25022"/><rect x="17" y="3" width="12" height="12" fill="#7FBA00"/><rect x="3" y="17" width="12" height="12" fill="#00A4EF"/><rect x="17" y="17" width="12" height="12" fill="#FFB900"/></svg> },
  { name: 'Bitcoin', ticker: 'BTC', price: '$67,840', change: '+4.7%', up: true, color: '#F7931A', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" fill="#F7931A"/><path d="M21 13.5c.5-3-1.8-4.6-4.8-5.7L17 4.3l-2.2.5.7 2.8-1.7.4-.7-2.8-2.2.5.7 2.8-4.3 1 .5 2.1 1.5-.4c.8-.2 1.1.2 1.2.6l2 8.1c.1.4-.1.9-.9 1.1l-1.5.4.5 2.2 4.3-1 .8 3 2.2-.5-.8-3 1.7-.4.8 3 2.2-.5-.8-3c3.2-.9 5.2-3 4.7-6z" fill="white"/></svg> },
  { name: 'Ethereum', ticker: 'ETH', price: '$3,520', change: '+6.2%', up: true, color: '#627EEA', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M16 3L7 16.5l9 5.4 9-5.4L16 3z" fill="#627EEA" opacity="0.8"/><path d="M7 16.5L16 22l9-5.5-9-3.5-9 3.5z" fill="#627EEA"/><path d="M16 24l-9-5.5 9 10.5 9-10.5L16 24z" fill="#627EEA" opacity="0.6"/></svg> },
  { name: 'Nvidia', ticker: 'NVDA', price: '$875.39', change: '+8.3%', up: true, color: '#76B900', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M12 6v8.5c1.3-1.6 3.2-2.5 5.5-2.5 4.7 0 8 3.6 8 8.5S22.2 29 17.5 29c-2.3 0-4.2-.9-5.5-2.5V29H7V6h5zm5 10.5c-2.5 0-4.5 1.8-4.5 4s2 4 4.5 4 4.5-1.8 4.5-4-2-4-4.5-4z" fill="#76B900"/></svg> },
  { name: 'Netflix', ticker: 'NFLX', price: '$628.14', change: '+2.1%', up: true, color: '#E50914', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M8 4h5l3 14 3-14h5L20 28c-1.3.2-2.7.3-4 .3L14 18l-2 10.3c-1.3 0-2.7-.1-4-.3L8 4z" fill="#E50914"/></svg> },
  { name: 'Gold', ticker: 'XAU', price: '$2,385', change: '+0.6%', up: true, color: '#D4A017', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect x="4" y="11" width="24" height="14" rx="3" fill="#D4A017"/><text x="16" y="20" textAnchor="middle" fontSize="7" fontWeight="700" fill="white" fontFamily="sans-serif">GOLD</text></svg> },
  { name: 'S&P 500', ticker: 'SPY', price: '$524.68', change: '+1.2%', up: true, color: '#2563eb', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M5 18 L12 12 L18 6 L26 3" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" fill="none"/></svg> },
  { name: 'Meta', ticker: 'META', price: '$516.71', change: '-1.3%', up: false, color: '#0866FF', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M4 16c0-4 2-8 5-9.5 1.5-.8 3 .5 4.5 3L16 13l2.5-3.5c1.5-2.5 3-3.8 4.5-3C26 8 28 12 28 16s-2 8-5 9.5c-1.5.8-3-.5-4.5-3L16 19l-2.5 3.5c-1.5 2.5-3 3.8-4.5 3C6 24 4 20 4 16z" fill="#0866FF"/></svg> },
  { name: 'Solana', ticker: 'SOL', price: '$142.80', change: '+9.4%', up: true, color: '#9945FF', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M6 22h18l2-2H8l-2 2z" fill="#9945FF"/><path d="M6 16h18l2-2H8l-2 2z" fill="#14F195"/><path d="M8 10h18l-2-2H6l2 2z" fill="#9945FF"/></svg> },
  { name: 'Silver', ticker: 'XAG', price: '$29.54', change: '+1.1%', up: true, color: '#9ca3af', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect x="4" y="11" width="24" height="14" rx="3" fill="#9ca3af"/><text x="16" y="20" textAnchor="middle" fontSize="6" fontWeight="700" fill="white" fontFamily="sans-serif">SILVER</text></svg> },
  { name: 'Oil (WTI)', ticker: 'USO', price: '$78.42', change: '-0.8%', up: false, color: '#78350f', logo: <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M16 3C16 3 8 12 8 19a8 8 0 0016 0C24 12 16 3 16 3z" fill="#78350f"/></svg> },
];

function InvestCard({ inv }: { inv: typeof investments[0] }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', width: 210, flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f4f8', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: inv.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {inv.logo}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: inv.up ? '#16a34a' : '#dc2626', background: inv.up ? '#dcfce7' : '#fee2e2', padding: '3px 10px', borderRadius: 20 }}>
          {inv.change}
        </span>
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0a1628' }}>{inv.name}</div>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{inv.ticker}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#0a1628' }}>{inv.price}</span>
        <svg width="56" height="24" viewBox="0 0 56 24" fill="none">
          {inv.up
            ? <path d="M2 20 Q10 16 18 12 Q30 6 40 4 Q48 2 54 2" stroke={inv.color} strokeWidth="2" fill="none" strokeLinecap="round"/>
            : <path d="M2 4 Q10 8 18 10 Q30 14 40 18 Q48 20 54 22" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round"/>
          }
        </svg>
      </div>
    </div>
  );
}

function InvestmentShowcase({ isMobile }: { isMobile: boolean }) {
  const [, setLocation] = useLocation();
  const row1 = investments.slice(0, 8);
  const row2 = investments.slice(8);
  return (
    <section style={{ background: '#f8fafb', padding: isMobile ? '48px 0' : '80px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 48, padding: isMobile ? '0 20px' : '0 48px' }}>
        <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ display: 'inline-block', background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 700, letterSpacing: 1, padding: '5px 14px', borderRadius: 20, marginBottom: 16, textTransform: 'uppercase' }}>
          Invest in anything
        </motion.span>
        <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
          style={{ fontSize: isMobile ? 28 : 42, fontWeight: 800, color: '#0a1628', margin: '0 0 14px', letterSpacing: '-1px' }}>
          Stocks, Crypto, Real Estate &amp; More
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}
          style={{ fontSize: isMobile ? 14 : 16, color: '#64748b', maxWidth: 520, margin: '0 auto' }}>
          Everything you can invest in, all in one pocket. Trade the world's biggest assets with zero commission.
        </motion.p>
      </div>

      <div style={{ overflow: 'hidden', marginBottom: 16 }}>
        <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', gap: 16, width: 'max-content', padding: '0 8px' }}>
          {[...row1, ...row1].map((inv, i) => <InvestCard key={i} inv={inv} />)}
        </motion.div>
      </div>

      <div style={{ overflow: 'hidden', marginBottom: 48 }}>
        <motion.div animate={{ x: ['-50%', '0%'] }} transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', gap: 16, width: 'max-content', padding: '0 8px' }}>
          {[...row2, ...row2].map((inv, i) => <InvestCard key={i} inv={inv} />)}
        </motion.div>
      </div>

      <div style={{ textAlign: 'center', padding: isMobile ? '0 20px' : '0 48px' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ display: 'inline-flex', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? 16 : 32, background: 'white', borderRadius: 20, padding: isMobile ? '20px' : '24px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0a1628', marginBottom: 4 }}>Start with any amount</div>
            <div style={{ fontSize: 14, color: '#64748b' }}>Fractional shares from $1. No minimums.</div>
          </div>
          <button onClick={() => setLocation('/signup')} style={{ padding: '12px 28px', background: '#4ADE80', borderRadius: 28, border: 'none', color: '#0B1814', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Explore Markets →
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════════════════ */
function Footer({ isMobile }: { isMobile: boolean }) {
  return (
    <footer style={{ background: WHITE, borderTop: '1px solid #f0f0f0', padding: isMobile ? '48px 20px' : '60px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1.5fr 1fr 1fr 1fr', gap: isMobile ? 32 : 48, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 20px', lineHeight: 1.3 }}>
            Investing for <span style={{ color: '#aaa' }}>those</span> who take it seriously
          </h3>
          <div style={{ display: 'flex', gap: 12 }}>
            {[Linkedin, Twitter, Facebook].map((Icon, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon size={15} color="#555" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 16px' }}>Products</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Stocks', 'ETFs', 'Crypto', 'Options', 'Margin'].map(l => (
              <a key={l} href="#" style={{ fontSize: 14, color: '#888', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 16px' }}>Resources</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Blog', 'Case studies', 'Library'].map(l => (
              <a key={l} href="#" style={{ fontSize: 14, color: '#888', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
        {!isMobile && (
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 16px' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['About Us', 'Contact', 'Sustainability', 'Career'].map(l => (
                <a key={l} href="#" style={{ fontSize: 14, color: '#888', textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT EXPORT
══════════════════════════════════════════════════════════════ */
export const InvestXLanding = () => {
  const isMobile = useIsMobile();

  // Trigger Smartsupp welcome message when landing page is first visited
  useEffect(() => {
    const sendWelcome = () => {
      if (typeof (window as any).smartsupp === 'function') {
        (window as any).smartsupp('chat:message', '👋 Welcome to InvestX! I\'m here to help you get started with investing. Feel free to ask me anything!');
      }
    };

    // Wait for Smartsupp to fully load before triggering the message
    if (typeof (window as any).smartsupp === 'function') {
      // Small delay so the widget renders before popping a message
      const t = setTimeout(sendWelcome, 2500);
      return () => clearTimeout(t);
    } else {
      // Poll until the script is ready (it loads async)
      const interval = setInterval(() => {
        if (typeof (window as any).smartsupp === 'function') {
          clearInterval(interval);
          setTimeout(sendWelcome, 1500);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', overflowX: 'hidden' }}>
      <Hero isMobile={isMobile} />
      <SocialProof isMobile={isMobile} />
      <ReviewsCarousel isMobile={isMobile} />
      <InvestmentShowcase isMobile={isMobile} />
      <FeatureGrid isMobile={isMobile} />
      <HelpSection isMobile={isMobile} />
      <IncomeHub isMobile={isMobile} />
      <SecuritySection isMobile={isMobile} />
      <Pricing isMobile={isMobile} />
      <AiSection isMobile={isMobile} />
      <Footer isMobile={isMobile} />
    </div>
  );
};
