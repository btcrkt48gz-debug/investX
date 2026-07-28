import React, { useEffect, useRef, useState } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';

// ── Animated rising chart line ────────────────────────────────────────────────
function AnimatedChart() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;

    const ctrl = animate(len, 0, {
      duration: 2.2,
      ease: 'easeOut',
      onUpdate(v) {
        path.style.strokeDashoffset = String(v);
      },
      repeat: Infinity,
      repeatType: 'loop',
      repeatDelay: 1.5,
    });
    return () => ctrl.stop();
  }, []);

  return (
    <svg
      viewBox="0 0 400 120"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 w-full"
      style={{ height: 120, opacity: 0.85 }}
    >
      {/* Glow gradient */}
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fb923c" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Fill under line */}
      <motion.path
        d="M0,105 L40,95 L80,88 L120,78 L160,65 L200,52 L240,42 L280,30 L320,20 L360,12 L400,5 L400,120 L0,120 Z"
        fill="url(#fillGrad)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      />

      {/* Main rising line */}
      <path
        ref={pathRef}
        d="M0,105 L40,95 L80,88 L120,78 L160,65 L200,52 L240,42 L280,30 L320,20 L360,12 L400,5"
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      {/* Moving dot at the tip */}
      <motion.circle
        cx={400} cy={5} r={5}
        fill="#fb923c"
        filter="url(#glow)"
        animate={{ opacity: [1, 0.3, 1], scale: [1, 1.6, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Candlestick bars (static, subtle) */}
      {[
        { x: 30,  h: 22, y: 82, w: 6, up: true  },
        { x: 70,  h: 16, y: 78, w: 6, up: false },
        { x: 110, h: 20, y: 65, w: 6, up: true  },
        { x: 150, h: 14, y: 56, w: 6, up: true  },
        { x: 190, h: 18, y: 46, w: 6, up: false },
        { x: 230, h: 20, y: 32, w: 6, up: true  },
        { x: 270, h: 16, y: 22, w: 6, up: true  },
        { x: 310, h: 18, y: 12, w: 6, up: true  },
        { x: 350, h: 14, y: 5,  w: 6, up: true  },
      ].map((b, i) => (
        <motion.rect
          key={i}
          x={b.x - b.w / 2} y={b.y}
          width={b.w} height={b.h}
          rx={1.5}
          fill={b.up ? '#22c55e' : '#ef4444'}
          opacity={0.5}
          initial={{ scaleY: 0, originY: 1 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.08 + 0.3, duration: 0.4, ease: 'backOut' }}
        />
      ))}
    </svg>
  );
}

// ── Spinning 3-D coin ─────────────────────────────────────────────────────────
function SpinningCoin() {
  return (
    <motion.div
      className="absolute"
      style={{ right: 24, top: '50%', translateY: '-50%' }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Coin face — uses perspective + rotateY for 3D spin */}
      <motion.div
        style={{
          width: 90,
          height: 90,
          perspective: 600,
        }}
        animate={{ rotateY: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #FFD700, #B8860B 60%, #8B6914)',
            boxShadow: '0 0 30px rgba(251,163,26,0.6), 0 8px 24px rgba(0,0,0,0.5), inset -6px -6px 12px rgba(0,0,0,0.3), inset 4px 4px 8px rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #DAA520',
          }}
        >
          <span
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: '#1a0a00',
              textShadow: '1px 1px 2px rgba(255,255,255,0.3)',
              fontFamily: 'serif',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            ₿
          </span>
        </div>
      </motion.div>

      {/* Coin shadow */}
      <motion.div
        style={{
          width: 70,
          height: 10,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)',
          borderRadius: '50%',
          margin: '6px auto 0',
        }}
        animate={{ scaleX: [1, 0.7, 1], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

// ── Floating price ticker ─────────────────────────────────────────────────────
function FloatingPrice() {
  const [price, setPrice] = useState(63758.42);

  useEffect(() => {
    const id = setInterval(() => {
      setPrice(p => parseFloat((p + (Math.random() - 0.45) * 120).toFixed(2)));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="absolute top-5 left-4"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      style={{
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        padding: '8px 14px',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
        BTC / USDT
      </div>
      <motion.div
        key={price}
        initial={{ opacity: 0.4, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ fontSize: 18, fontWeight: 900, color: '#22c55e', fontVariantNumeric: 'tabular-nums' }}
      >
        ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </motion.div>
      <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 700 }}>▲ +4.35%</div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CryptoHeroAnimated() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 280 }}
    >
      {/* Background image */}
      <img
        src="/crypto-hero.jpeg"
        alt="Cryptocurrency"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay so animations pop */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)' }}
      />

      {/* Animated chart at the bottom */}
      <AnimatedChart />

      {/* Spinning coin */}
      <SpinningCoin />

      {/* Live price ticker */}
      <FloatingPrice />
    </div>
  );
}
