import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const BG    = '#060C1A';
const GOLD  = '#D4A017';
const GOLDA = (a: number) => `rgba(212,160,23,${a})`;

/* Seeded RNG – same dots every render */
function mkRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967295; };
}

/* Gold circuit-board background matching landing-page palette */
function CircuitBg() {
  const rng = mkRng(5317);
  const dots = Array.from({ length: 55 }, (_, i) => {
    const x = rng() * 100, y = rng() * 100;
    return { id: i, x, y, r: rng() * 1.1 + 0.4, op: rng() * 0.4 + 0.12, pulse: rng() > 0.72, dur: 1.5 + rng() * 1.3 };
  });
  const lines: { id: string; x1: number; y1: number; x2: number; y2: number; op: number }[] = [];
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 14) lines.push({ id: `${i}-${j}`, x1: dots[i].x, y1: dots[i].y, x2: dots[j].x, y2: dots[j].y, op: (1 - d / 14) * 0.20 });
    }
  }
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke={GOLD} strokeWidth="0.06" strokeOpacity="0.16" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#grid)" />
      {lines.map(l => <line key={l.id} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={GOLD} strokeWidth="0.11" opacity={l.op} />)}
      {dots.map(d => (
        <circle key={d.id} cx={d.x} cy={d.y} r={d.r * 0.30} fill={GOLD} opacity={d.op}>
          {d.pulse && <animate attributeName="opacity" values={`${d.op};${Math.min(d.op * 2.6, 0.8)};${d.op}`} dur={`${d.dur}s`} repeatCount="indefinite" />}
        </circle>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   CENTERING TRICK
   Each panel is 50dvh. The logo's CENTER sits on the panel edge
   (= screen centre). overflow:hidden clips the other half away.

   Top panel  → logo centred at bottom edge → top:100%, translate(-50%,-50%)
   Bot panel  → logo centred at top  edge  → top:0,    translate(-50%,-50%)

   CRITICAL: the positioning wrapper is a plain div (no framer-motion)
   so framer-motion never overwrites translate(-50%,-50%) when it
   applies its own scale / opacity transforms to the inner <img>.
   ──────────────────────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

interface PanelProps { isTop: boolean; splitting: boolean }

function CurtainPanel({ isTop, splitting }: PanelProps) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: 0, right: 0,
        ...(isTop ? { top: 0 } : { bottom: 0 }),
        height: '50dvh',
        overflow: 'hidden',
        background: BG,
        zIndex: 2,
      }}
      animate={splitting ? { y: isTop ? '-100%' : '100%' } : { y: 0 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <CircuitBg />

      {/* Warm glow at split edge */}
      <div style={{
        position: 'absolute',
        [isTop ? 'bottom' : 'top']: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '70vw', maxWidth: 320,
        height: '70vw', maxHeight: 320,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${GOLDA(0.15)} 0%, ${GOLDA(0.05)} 45%, transparent 70%)`,
        filter: 'blur(22px)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/*
        OUTER div  → static positioning, places logo center on the panel edge.
        INNER img  → framer-motion handles only opacity + scale.
        Keeping them separate prevents framer-motion from overwriting
        the translate(-50%, -50%) when it injects its own transform.
      */}
      <div
        style={{
          position: 'absolute',
          top: isTop ? '100%' : '0%',
          left: '50%',
          /* logo center is now exactly on the panel edge = screen centre */
          transform: 'translate(-50%, -50%)',
          zIndex: 3,
        }}
      >
        <motion.img
          src="/investx-logo-new.jpeg"
          alt="InvestX"
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            width: 'min(152px, 40vw)',
            height: 'auto',
            display: 'block',
            borderRadius: 14,
            boxShadow: `0 0 0 1.5px ${GOLDA(0.45)}, 0 0 28px ${GOLDA(0.22)}`,
          }}
        />
      </div>
    </motion.div>
  );
}

/* ── Main splash ── */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [splitting, setSplitting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSplitting(true), 2200);
    const t2 = setTimeout(() => onComplete(),         3100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden' }}>
      <CurtainPanel isTop={true}  splitting={splitting} />
      <CurtainPanel isTop={false} splitting={splitting} />

      {/* Glowing gold dividing line pinned at screen midpoint */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50dvh',
          left: 0, right: 0,
          height: 2,
          marginTop: -1,          /* perfect 1px centering */
          zIndex: 5,
          pointerEvents: 'none',
          background: `linear-gradient(90deg,
            transparent 0%,
            ${GOLDA(0.4)} 5%,
            ${GOLD}       26%,
            #fffbe8       50%,
            ${GOLD}       74%,
            ${GOLDA(0.4)} 95%,
            transparent 100%)`,
          boxShadow: `0 0 6px 1px ${GOLDA(0.7)}, 0 0 22px 5px ${GOLDA(0.28)}`,
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={splitting
          ? { scaleX: 1, opacity: 0 }
          : { scaleX: 1, opacity: 1 }}
        transition={splitting
          ? { duration: 0.14, ease: 'easeIn' }
          : { duration: 0.65, delay: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}
