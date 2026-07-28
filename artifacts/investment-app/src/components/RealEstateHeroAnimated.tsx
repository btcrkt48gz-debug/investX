import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ── Floating property value ticker ─────────────────────────────────────────────
function FloatingValue() {
  const values = [
    { label: 'EQIX', val: 762.50, delta: +12.80 },
    { label: 'PLD',  val: 118.44, delta: +2.60  },
    { label: 'WELL', val: 112.60, delta: +2.20  },
  ];
  const [idx, setIdx] = useState(0);
  const item = values[idx];

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % values.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="absolute top-5 left-4"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      style={{
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        padding: '8px 14px',
        border: '1px solid rgba(255,255,255,0.12)',
        minWidth: 120,
      }}
    >
      <motion.div key={idx} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
          {item.label} / REIT
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>
          ${item.val.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 10, color: '#34d399', fontWeight: 700 }}>▲ +{item.delta.toFixed(2)}</div>
      </motion.div>
    </motion.div>
  );
}

// ── Floating stat badges ───────────────────────────────────────────────────────
function StatBadge({ label, value, delay, right }: { label: string; value: string; delay: number; right?: boolean }) {
  return (
    <motion.div
      className="absolute"
      style={right ? { right: 16, top: '38%' } : { left: 16, bottom: 48 }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: 'backOut' }}
    >
      <div style={{
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        borderRadius: 10,
        padding: '6px 12px',
        border: '1px solid rgba(52,211,153,0.3)',
      }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 900, color: '#34d399' }}>{value}</div>
      </div>
    </motion.div>
  );
}

// ── Animated bar chart (REIT yield bars) ──────────────────────────────────────
function YieldBars() {
  const bars = [
    { h: 55, color: '#34d399' },
    { h: 38, color: '#34d399' },
    { h: 70, color: '#34d399' },
    { h: 48, color: '#6ee7b7' },
    { h: 82, color: '#34d399' },
    { h: 60, color: '#6ee7b7' },
    { h: 44, color: '#34d399' },
    { h: 90, color: '#10b981' },
    { h: 66, color: '#34d399' },
  ];

  return (
    <svg
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 w-full"
      style={{ height: 100 }}
    >
      <defs>
        <linearGradient id="reBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {bars.map((b, i) => {
        const x = 10 + i * 42;
        return (
          <motion.rect
            key={i}
            x={x} y={100 - b.h}
            width={28} height={b.h}
            rx={4}
            fill="url(#reBarGrad)"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 0.85, 1] }}
            style={{ originY: 1 }}
            transition={{ delay: i * 0.1 + 0.3, duration: 0.6, ease: 'backOut', repeat: Infinity, repeatDelay: 3.5 }}
          />
        );
      })}
    </svg>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function RealEstateHeroAnimated() {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 280 }}>
      {/* Background image */}
      <img
        src="/real-estate-hero.jpg"
        alt="Real Estate"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.60) 100%)' }}
      />

      {/* Animated yield bars */}
      <YieldBars />

      {/* Floating live REIT value */}
      <FloatingValue />

      {/* Stat badges */}
      <StatBadge label="Avg Yield" value="4.2%" delay={0.7} right />
      <StatBadge label="Properties" value="23 REITs" delay={1.0} />
    </div>
  );
}
