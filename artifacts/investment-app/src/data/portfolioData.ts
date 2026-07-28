import type React from 'react';

export interface Asset {
  id: string;
  name: string;
  ticker: string;
  category: string;
  units: number;
  buyPrice: number;
  currentPrice: number;
  iconBg: string;
  iconColor: string;
  Icon?: React.ComponentType<{ size?: number }>;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'sell' | 'buy' | 'withdrawal';
  asset: string;
  assetId?: string;
  amount: number;
  units?: number;
  date: string;
  status: 'completed' | 'pending';
}

export const HELD_ASSETS: Asset[] = [];

export const TRANSACTIONS: Transaction[] = [];

export function generatePriceHistory(asset: Asset, days = 30) {
  const points: { date: string; price: number }[] = [];
  const start = asset.buyPrice;
  const end = asset.currentPrice;
  const seed = asset.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  let price = start;
  const now = new Date(); // use real current date
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const t = (days - i) / days;
    const target = start + (end - start) * t;
    const noise = ((((seed * (i + 7) * 13) % 97) / 97) - 0.5) * asset.buyPrice * 0.04;
    price = target + noise;
    points.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Math.max(price, asset.buyPrice * 0.7),
    });
  }
  return points;
}

export function pnl(asset: Asset) {
  return (asset.currentPrice - asset.buyPrice) * asset.units;
}

export function pnlPct(asset: Asset) {
  return ((asset.currentPrice - asset.buyPrice) / asset.buyPrice) * 100;
}

export function fmt(n: number | undefined | null) {
  if (n == null || isNaN(n as number)) return '0.00';
  return (n as number).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const CATEGORY_COLORS: Record<string, string> = {
  'Cash Balance': '#3B82F6',
  'Stocks':       '#A855F7',
  'Crypto':       '#F59E0B',
  'Real Estate':  '#22C55E',
  'Commodities':  '#EF4444',
};
