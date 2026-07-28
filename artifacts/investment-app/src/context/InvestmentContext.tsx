import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  subscribeToPortfolio,
  subscribeToTransactions,
  saveInvestments,
  addTransaction,
  updateCashBalance,
  updateUserProfile,
  type StoredTransaction,
} from '@/lib/firestoreDb';

export interface ActiveInvestment {
  ticker: string;
  planId: string;
  amount: number;
  totalProfit: number;
  profitPerSec: number;
  startTimestamp: number;
  startDate: string;
  status: 'active' | 'stopped';
  stoppedBalance?: number;
  category?: string;
  logo?: string;
  name?: string;
  /** ID of the invest transaction that created this position */
  txId?: string;
}

export interface TxRecord {
  id: string;
  type: 'invest' | 'cashout' | 'withdraw' | 'transfer' | 'deposit' | 'credit' | 'debit';
  status?: 'pending' | 'completed' | 'failed';
  ticker?: string;
  planId?: string;
  category?: string;
  logo?: string;
  amount: number;
  profit?: number;
  fee?: number;
  receivable?: number;
  method?: string;
  destination?: string;
  note?: string;
  name?: string;
  date: string;
  timestamp: number;
}

interface InvestmentContextValue {
  investments: Record<string, ActiveInvestment>;
  cashBalance: number;
  transactions: TxRecord[];
  placeInvestment: (params: {
    ticker: string; planId: string; amount: number; dailyRate: number;
    startDate: string; category?: string; logo?: string; name?: string;
  }) => void;
  stopInvestment: (key: string) => void;
  transferToCash: (key: string) => void;
  recordTransaction: (
    tx: Omit<TxRecord, 'id' | 'timestamp'> & { id?: string },
    balanceDelta?: number,
  ) => void;
  refreshFromServer: () => Promise<void>;
}

const TOTAL_SECS = 3 * 24 * 3600;

const InvestmentContext = createContext<InvestmentContextValue | null>(null);

function storedTxToRecord(t: StoredTransaction): TxRecord | null {
  const knownTypes = ['invest', 'cashout', 'withdraw', 'transfer', 'deposit', 'credit', 'debit'];
  if (!knownTypes.includes(t.type)) return null;
  return {
    id:          t.id,
    type:        t.type as TxRecord['type'],
    status:      t.status,
    amount:      t.amount,
    date:        t.date,
    timestamp:   t.timestamp,
    method:      t.method,
    destination: t.destination,
    ticker:      t.ticker,
    planId:      t.planId,
    category:    t.category,
    logo:        t.logo,
    name:        t.name,
    fee:         t.fee,
    receivable:  t.receivable,
    profit:      t.profit,
    note:        t.note,
  };
}

export function InvestmentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [investments, setInvestments] = useState<Record<string, ActiveInvestment>>({});
  const [cashBalance, setCashBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<TxRecord[]>([]);

  const cashBalanceRef   = useRef<number>(0);
  const investmentsRef   = useRef<Record<string, ActiveInvestment>>({});
  const isFirstLoad      = useRef(true);

  // Subscribe to Firestore real-time data for this user
  useEffect(() => {
    if (!user?.uid) {
      setInvestments({});
      setCashBalance(0);
      setTransactions([]);
      isFirstLoad.current = true;
      return;
    }

    isFirstLoad.current = true;

    const unsubPortfolio = subscribeToPortfolio(
      user.uid,
      (invs) => {
        setInvestments(invs);
        investmentsRef.current = invs;
      },
      (cash) => {
        setCashBalance(cash);
        cashBalanceRef.current = cash;
        isFirstLoad.current = false;
      },
    );

    const unsubTx = subscribeToTransactions(user.uid, (txs) => {
      const converted = txs
        .map(storedTxToRecord)
        .filter((t): t is TxRecord => t !== null);
      setTransactions(converted);
    });

    return () => { unsubPortfolio(); unsubTx(); };
  }, [user?.uid]);

  useEffect(() => { cashBalanceRef.current = cashBalance; }, [cashBalance]);
  useEffect(() => { investmentsRef.current = investments; }, [investments]);

  // Sync active investment metadata to Firestore when investments change
  useEffect(() => {
    if (!user?.uid || isFirstLoad.current) return;
    const active = Object.values(investments).filter(inv => inv.status === 'active');
    const investedAmount       = active.reduce((s, inv) => s + inv.amount, 0);
    const activeInvestmentTxIds = active.map(inv => inv.txId).filter(Boolean) as string[];
    saveInvestments(user.uid, investments).catch(() => {});
    updateUserProfile(user.uid, { investedAmount, activeInvestmentTxIds }).catch(() => {});
  }, [investments, user?.uid]);

  const recordTransaction = useCallback((
    tx: Omit<TxRecord, 'id' | 'timestamp'> & { id?: string },
    balanceDelta?: number,
  ) => {
    const full: TxRecord = {
      ...tx,
      id:        tx.id ?? `tx_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      status:    tx.type === 'withdraw' ? 'pending' : (tx.status ?? 'completed'),
    };

    // Optimistic local update
    setTransactions(prev => [full, ...prev]);

    if (balanceDelta !== undefined && balanceDelta !== 0) {
      setCashBalance(b => {
        const next = Math.max(0, b + balanceDelta);
        cashBalanceRef.current = next;
        if (user?.uid) {
          updateCashBalance(user.uid, next).catch(() => {});
          addTransaction(user.uid, {
            ...full,
            balanceAfter: next,
            note: full.note ?? '',
          } as StoredTransaction).catch(() => {});
        }
        return next;
      });
    } else if (user?.uid) {
      addTransaction(user.uid, {
        ...full,
        balanceAfter: cashBalanceRef.current,
        note: full.note ?? '',
      } as StoredTransaction).catch(() => {});
    }
  }, [user]);

  const placeInvestment = useCallback((params: {
    ticker: string; planId: string; amount: number; dailyRate: number;
    startDate: string; category?: string; logo?: string; name?: string;
  }) => {
    const { ticker, planId, amount, dailyRate, startDate, category, logo, name } = params;
    const totalProfit  = amount * dailyRate * 3;
    const profitPerSec = totalProfit / TOTAL_SECS;
    const now   = Date.now();
    const key   = `${ticker}_${planId}_${now}`;
    const txId  = `tx_${now}_${Math.random().toString(36).slice(2)}`;
    setInvestments(prev => ({
      ...prev,
      [key]: { ticker, planId, amount, totalProfit, profitPerSec, startTimestamp: now, startDate, status: 'active', category, logo, name, txId },
    }));
    recordTransaction({ id: txId, type: 'invest', ticker, planId, amount, date: startDate, category, logo, name }, -amount);
  }, [recordTransaction]);

  const stopInvestment = useCallback((key: string) => {
    setInvestments(prev => {
      const inv = prev[key];
      if (!inv || inv.status !== 'active') return prev;
      const elapsedSecs = (Date.now() - inv.startTimestamp) / 1000;
      const earned      = Math.min(elapsedSecs * inv.profitPerSec, inv.totalProfit);
      return { ...prev, [key]: { ...inv, status: 'stopped', stoppedBalance: inv.amount + earned } };
    });
  }, []);

  const transferToCash = useCallback((key: string) => {
    setInvestments(prev => {
      const inv = prev[key];
      if (!inv || inv.status !== 'stopped') return prev;
      const bal    = inv.stoppedBalance ?? inv.amount;
      const profit = bal - inv.amount;
      const date   = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      recordTransaction(
        { type: 'cashout', ticker: inv.ticker, planId: inv.planId, amount: bal, profit, date, category: inv.category, logo: inv.logo, name: inv.name },
        bal,
      );
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, [recordTransaction]);

  // No-op — Firestore subscriptions keep data live
  const refreshFromServer = useCallback(async () => {}, []);

  return (
    <InvestmentContext.Provider value={{ investments, cashBalance, transactions, placeInvestment, stopInvestment, transferToCash, recordTransaction, refreshFromServer }}>
      {children}
    </InvestmentContext.Provider>
  );
}

export function useInvestments() {
  const ctx = useContext(InvestmentContext);
  if (!ctx) throw new Error('useInvestments must be used inside InvestmentProvider');
  return ctx;
}

export function useLiveBalance(inv: ActiveInvestment | undefined): number | null {
  const [balance, setBalance] = useState<number | null>(null);
  useEffect(() => {
    if (!inv) { setBalance(null); return; }
    if (inv.status === 'stopped') { setBalance(inv.stoppedBalance ?? inv.amount); return; }
    const tick = () => {
      const elapsedSecs = (Date.now() - inv.startTimestamp) / 1000;
      setBalance(inv.amount + Math.min(elapsedSecs * inv.profitPerSec, inv.totalProfit));
    };
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [inv]);
  return balance;
}
