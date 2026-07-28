import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft, TrendingUp, TrendingDown, Wallet,
  RefreshCw, Eye, EyeOff, Clock,
  ArrowDownLeft, ArrowUpRight,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  CATEGORY_COLORS, fmt, type Transaction,
} from '@/data/portfolioData';
import { useInvestments } from '@/context/InvestmentContext';
import type { TxRecord } from '@/context/InvestmentContext';

const PLAN_NAMES: Record<string, string> = {
  basic:    'Basic Plan',
  standard: 'Standard Plan',
  premium:  'Premium Plan',
  excel:    'Excel Plus',
};

const PLAN_COLORS: Record<string, string> = {
  basic:    '#3B82F6',
  standard: '#8B5CF6',
  premium:  '#F59E0B',
  excel:    '#EF4444',
};

const TX_ICON: Record<Transaction['type'], { Icon: typeof ArrowDownLeft; bg: string; label: string }> = {
  deposit:    { Icon: ArrowDownLeft, bg: 'bg-green-100 text-green-600',  label: 'Deposit'    },
  sell:       { Icon: ArrowUpRight,  bg: 'bg-amber-100 text-amber-600',  label: 'Sell'       },
  buy:        { Icon: ArrowDownLeft, bg: 'bg-blue-100 text-blue-600',    label: 'Buy'        },
  withdrawal: { Icon: ArrowUpRight,  bg: 'bg-red-100 text-red-500',      label: 'Withdrawal' },
};

export default function Portfolio() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<'assets' | 'transactions'>('assets');
  const [balanceVisible, setBalanceVisible] = useState(true);

  const { cashBalance, investments, transactions, refreshFromServer } = useInvestments();

  const [now, setNow] = useState(() => Date.now());
  const [spinning, setSpinning] = useState(false);

  // Tick every second so live balances update automatically
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = useCallback(async () => {
    setNow(Date.now());
    setSpinning(true);
    await refreshFromServer();
    setTimeout(() => setSpinning(false), 600);
  }, [refreshFromServer]);

  const activeEntries = useMemo(() => {
    return Object.entries(investments).map(([key, inv]) => {
      const elapsedSecs = (now - inv.startTimestamp) / 1000;
      const earned = inv.status === 'stopped'
        ? (inv.stoppedBalance ?? inv.amount) - inv.amount
        : Math.min(elapsedSecs * inv.profitPerSec, inv.totalProfit);
      return { key, inv, currentValue: inv.amount + earned, profit: earned };
    });
  }, [investments, now]);

  const planInvested = activeEntries.reduce((s, { inv }) => s + inv.amount, 0);
  const planCurrent  = activeEntries.reduce((s, { currentValue }) => s + currentValue, 0);

  const totalInvested = planInvested;
  const totalCurrent  = planCurrent;
  const totalPnl      = totalCurrent - totalInvested;
  const totalPnlPct   = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const totalValue    = totalCurrent + cashBalance;

  // Dynamic donut chart — cash + investments broken down by asset category
  const ASSET_COLORS: Record<string, string> = {
    'Stocks':      '#3B82F6',
    'Crypto':      '#F59E0B',
    'Real Estate': '#10B981',
    'Commodities': '#EF4444',
    'Cash Balance':'#6366F1',
  };

  const portfolioChart = useMemo(() => {
    // Sum current values per category
    const totals: Record<string, number> = {};
    for (const { inv, currentValue } of activeEntries) {
      const cat = inv.category ?? 'Other';
      totals[cat] = (totals[cat] ?? 0) + currentValue;
    }
    // Cash always included
    totals['Cash Balance'] = cashBalance;

    const grand = Object.values(totals).reduce((s, v) => s + v, 0);
    if (grand === 0) return [];

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
    <div className="min-h-screen bg-[#F4F6FB] font-sans">

      {/* ── Header ── */}
      <div className="bg-[#1C2B5E] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-6">

          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setLocation('/app')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-semibold">
              <ArrowLeft size={18} /> Back
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Refresh balances"
            >
              <RefreshCw
                size={16}
                className="text-white/60"
                style={{ transition: 'transform 0.6s', transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)' }}
              />
            </button>
          </div>

          {/* Balance hero */}
          <div className="text-center mb-6">
            <div className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mb-2">Total Portfolio Value</div>
            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl font-extrabold tracking-tight">
                {balanceVisible ? `$${fmt(totalValue)}` : '••••••'}
              </div>
              <button onClick={() => setBalanceVisible(v => !v)} className="text-white/30 hover:text-white/60 transition-colors mt-1">
                {balanceVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {totalInvested > 0 && (
              <div className={`flex items-center justify-center gap-1 text-sm font-bold mt-2 ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPnl >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                {totalPnl >= 0 ? '+' : '-'}${fmt(Math.abs(totalPnl))} ({totalPnlPct.toFixed(2)}%)
                <span className="text-white/30 font-normal text-xs ml-1">all time</span>
              </div>
            )}
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { label: 'Cash Balance', value: `$${fmt(cashBalance)}`,        accent: 'text-blue-300' },
              { label: 'Invested',     value: `$${fmt(totalInvested)}`,       accent: 'text-white'    },
              { label: 'Holdings',     value: `${activeEntries.length} Assets`, accent: 'text-amber-300' },
            ].map(s => (
              <div key={s.label} className="bg-white/8 rounded-xl p-3 text-center backdrop-blur-sm">
                <div className={`text-sm font-extrabold ${s.accent}`}>{s.value}</div>
                <div className="text-[10px] text-white/40 font-semibold mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Donut — always visible */}
          {portfolioChart.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={portfolioChart} cx="50%" cy="50%" innerRadius={28} outerRadius={44} paddingAngle={2} dataKey="value" stroke="none">
                      {portfolioChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1C2B5E', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11 }}
                      formatter={(v: number) => [`${v}%`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 flex-1">
                {portfolioChart.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] text-white/50 font-semibold truncate">{item.name}</span>
                    <span className="text-[10px] text-white/80 font-bold ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Cash Balance Banner ── */}
      <div className="max-w-2xl mx-auto px-4 -mt-3">
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Wallet size={20} className="text-blue-500" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Cash Balance</div>
              <div className="text-lg font-extrabold text-[#1C2B5E]">
                {balanceVisible ? `$${fmt(cashBalance)}` : '••••••'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 font-semibold">Available to invest</div>
            <div className="text-xs text-green-500 font-bold mt-0.5 flex items-center justify-end gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Funds ready
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="max-w-2xl mx-auto px-4 mt-5">
        <div className="bg-white rounded-xl p-1 flex gap-1 shadow-sm border border-gray-100">
          {(['assets', 'transactions'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                tab === t ? 'bg-[#1C2B5E] text-white shadow' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'assets' ? `Holdings (${activeEntries.length})` : 'Transactions'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 mt-4 pb-12 space-y-3">

        {/* Holdings list */}
        {tab === 'assets' && (
          <>
            {activeEntries.length > 0 ? (
              activeEntries.map(({ key, inv, currentValue, profit }) => {
                const planColor = PLAN_COLORS[inv.planId] ?? '#6366f1';
                const planName  = PLAN_NAMES[inv.planId] ?? inv.planId;
                const isUp = profit >= 0;

                return (
                  <div
                    key={key}
                    className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                  >
                    <div className="flex items-center gap-3">
                      {/* Logo: real image if available, else coloured badge */}
                      <div className="w-11 h-11 rounded-full shrink-0 overflow-hidden shadow-sm border border-gray-100 bg-gray-50 flex items-center justify-center">
                        {inv.logo ? (
                          <img
                            src={inv.logo}
                            alt={inv.ticker}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const t = e.currentTarget;
                              t.style.display = 'none';
                              t.parentElement!.style.backgroundColor = planColor;
                              t.parentElement!.innerHTML = `<span style="color:white;font-size:10px;font-weight:800">${inv.ticker.slice(0,4)}</span>`;
                            }}
                          />
                        ) : (
                          <span
                            className="text-white font-extrabold"
                            style={{ fontSize: 10, backgroundColor: planColor, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            {inv.ticker.slice(0, 4)}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-[#1C2B5E] text-sm leading-tight">{inv.name ?? inv.ticker}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {inv.category && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                  {inv.category}
                                </span>
                              )}
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: planColor }}
                              >
                                {planName}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                inv.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'bg-amber-100 text-amber-600'
                              }`}>
                                {inv.status === 'active' ? '● Active' : '■ Stopped'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <div className="font-extrabold text-[#1C2B5E] text-sm">${fmt(currentValue)}</div>
                            <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 mt-0.5 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                              {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                              {isUp ? '+' : ''}{fmt(profit)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-400"
                            style={{ width: `${Math.min((profit / inv.totalProfit) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Wallet size={28} className="text-gray-300" />
                </div>
                <div className="text-sm font-bold text-gray-400">No investments yet</div>
                <div className="text-xs text-gray-300 mt-1">Go to the home screen to start investing</div>
              </div>
            )}
          </>
        )}

        {/* Transactions list */}
        {tab === 'transactions' && (
          <>
            {transactions.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {transactions.map((tx: TxRecord, i: number) => {
                  const isInvest   = tx.type === 'invest';
                  const isCashout  = tx.type === 'cashout';
                  const isWithdraw = tx.type === 'withdraw';
                  const isDeposit  = tx.type === 'deposit';
                  const isTransfer = tx.type === 'transfer';

                  const planColor = PLAN_COLORS[tx.planId ?? ''] ?? '#6366f1';
                  const planName  = tx.planId ? (PLAN_NAMES[tx.planId] ?? tx.planId) : null;

                  // Safe fallback label for icon when there's no ticker
                  const iconLabel = tx.ticker
                    ? tx.ticker.slice(0, 4).toUpperCase()
                    : isWithdraw ? 'OUT'
                    : isDeposit  ? 'IN'
                    : isTransfer ? 'SEND'
                    : tx.type.slice(0, 4).toUpperCase();

                  // Badge colour per type
                  const badgeBg = isInvest   ? 'bg-blue-500'
                    : isCashout  ? 'bg-green-500'
                    : isWithdraw ? 'bg-red-500'
                    : isDeposit  ? 'bg-emerald-500'
                    : 'bg-purple-500';

                  // Human-readable row label
                  const txLabel = isInvest   ? `Invested${tx.ticker ? ` · ${tx.ticker}` : ''}`
                    : isCashout  ? `Cashed Out${tx.ticker ? ` · ${tx.ticker}` : ''}`
                    : isWithdraw ? `Withdrawal${tx.method ? ` · ${tx.method}` : ''}`
                    : isDeposit  ? 'Deposit'
                    : isTransfer ? `Transfer${tx.destination ? ` · ${tx.destination}` : ''}`
                    : tx.type;

                  // Amount direction & colour
                  const amountOut = isInvest || isWithdraw || isTransfer;
                  const amountColor = amountOut ? 'text-red-500' : 'text-green-600';

                  return (
                    <div
                      key={tx.id}
                      className={`flex items-center gap-3 px-4 py-3.5 ${i < transactions.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors`}
                    >
                      {/* Icon / Logo */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                          {tx.logo ? (
                            <img
                              src={tx.logo}
                              alt={tx.ticker ?? tx.type}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const el = e.currentTarget;
                                el.style.display = 'none';
                                el.parentElement!.style.backgroundColor = planColor;
                                el.parentElement!.innerHTML = `<span style="color:white;font-size:9px;font-weight:800">${iconLabel}</span>`;
                              }}
                            />
                          ) : (
                            <span
                              className="text-white font-extrabold"
                              style={{ fontSize: 9, backgroundColor: planColor, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              {iconLabel}
                            </span>
                          )}
                        </div>
                        {/* type badge */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${badgeBg}`}>
                          {amountOut
                            ? <ArrowUpRight size={9} className="text-white" />
                            : <ArrowDownLeft size={9} className="text-white" />}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-[#1C2B5E] leading-tight">
                            {txLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {tx.category && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              {tx.category}
                            </span>
                          )}
                          {planName && (
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: planColor }}
                            >
                              {planName}
                            </span>
                          )}
                          {(isWithdraw || isTransfer) && tx.destination && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 max-w-[120px] truncate">
                              {tx.destination}
                            </span>
                          )}
                          {/* Withdrawal status badge */}
                          {isWithdraw && tx.status === 'pending' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse inline-block" />
                              Pending
                            </span>
                          )}
                          {isWithdraw && tx.status === 'failed' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                              Failed
                            </span>
                          )}
                          {isWithdraw && tx.status === 'completed' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                              Completed
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-semibold mt-1 flex items-center gap-1">
                          <Clock size={9} /> {tx.date}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <div className={`text-sm font-extrabold ${amountColor}`}>
                          {amountOut ? '-' : '+'}${fmt(tx.amount)}
                        </div>
                        {isCashout && tx.profit !== undefined && tx.profit > 0 && (
                          <div className="text-[9px] text-green-500 font-semibold mt-0.5">+${fmt(tx.profit)} profit</div>
                        )}
                        {isWithdraw && tx.fee !== undefined && tx.fee > 0 && (
                          <div className="text-[9px] text-gray-400 font-semibold mt-0.5">fee ${fmt(tx.fee)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Clock size={28} className="text-gray-300" />
                </div>
                <div className="text-sm font-bold text-gray-400">No transactions yet</div>
                <div className="text-xs text-gray-300 mt-1">When you invest or cash out, it will appear here</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
