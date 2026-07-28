import React, { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { X, Info, Copy, Share2, Hash, ArrowDownCircle, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { SiBitcoin } from 'react-icons/si';
// ── Wallet addresses ───────────────────────────────────────────────────────────
const WALLETS: Record<string, { symbol: string; name: string; address: string; network: string; icon: React.ReactNode; iconBg: string; warning: string }> = {
  btc: {
    symbol: 'BTC', name: 'Bitcoin',
    address: 'bc1qst956gglg2y49uukv200nm0009wg3an80fracg',
    network: 'Bitcoin Network',
    icon: <SiBitcoin size={20} className="text-amber-500" />, iconBg: 'bg-amber-50',
    warning: 'Only send Bitcoin (BTC) to this address. Sending any other asset will result in permanent loss.',
  },
  usdt: {
    symbol: 'USDT', name: 'Tether (BEP-20)',
    address: '0x192d9Bf04b075D19Ef86458137e298f52674C628',
    network: 'BEP-20 (BSC)',
    icon: <span className="text-[13px] font-black text-emerald-600">₮</span>, iconBg: 'bg-emerald-50',
    warning: 'Only send USDT BEP-20 to this address. Sending any other network or asset will result in permanent loss.',
  },
  usdc: {
    symbol: 'USDC', name: 'USD Coin (BEP-20)',
    address: '0x192d9Bf04b075D19Ef86458137e298f52674C628',
    network: 'BEP-20 (BSC)',
    icon: <span className="text-[12px] font-black text-blue-600">$</span>, iconBg: 'bg-blue-50',
    warning: 'Only send USDC BEP-20 to this address. Sending any other network or asset will result in permanent loss.',
  },
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function CoinReceive() {
  const { coin: coinId = 'btc' } = useParams<{ coin: string }>();
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  const wallet = WALLETS[coinId] ?? WALLETS.btc;

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${wallet.symbol} Address`, text: wallet.address });
    } else {
      handleCopy();
    }
  };

  const hasAddress = wallet.address !== 'Address coming soon';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-5 pb-3">
        <button
          onClick={() => setLocation(`/add-money/crypto/${coinId}`)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-700" />
        </button>
        <div className="text-base font-bold text-gray-900">Receive</div>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <Info size={18} className="text-gray-500" />
        </button>
      </header>

      {/* Warning banner */}
      <div className="mx-4 mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <span className="text-amber-500 text-base mt-0.5 shrink-0">⚠</span>
        <p className="text-[12px] text-amber-800 leading-snug">{wallet.warning}</p>
      </div>

      {/* Coin label */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className={`w-7 h-7 rounded-full ${wallet.iconBg} flex items-center justify-center`}>
          {wallet.icon}
        </div>
        <span className="text-[15px] font-bold text-gray-900">{wallet.symbol}</span>
        <span className="text-[13px] text-gray-400">{wallet.name}</span>
      </div>

      {/* QR Code */}
      <div className="mx-auto border border-gray-200 rounded-2xl p-5 shadow-sm bg-white">
        {hasAddress ? (
          <>
            <QRCodeSVG
              value={wallet.address}
              size={200}
              bgColor="#ffffff"
              fgColor="#111111"
              level="H"
            />
            {/* Wallet address below QR */}
            <p className="text-center text-[12px] text-gray-500 mt-3 max-w-[200px] break-all leading-snug">
              {wallet.address}
            </p>
          </>
        ) : (
          <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-50 rounded-xl">
            <p className="text-[12px] text-gray-400 text-center px-4">Address coming soon</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-10 mt-6">
        {[
          { icon: copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-gray-600" />, label: copied ? 'Copied!' : 'Copy', onClick: handleCopy },
          { icon: <Hash size={20} className="text-gray-600" />, label: 'Set Amount', onClick: () => {} },
          { icon: <Share2 size={20} className="text-gray-600" />, label: 'Share', onClick: handleShare },
        ].map(({ icon, label, onClick }) => (
          <button key={label} onClick={onClick} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              {icon}
            </div>
            <span className={`text-[11px] font-semibold ${copied && label === 'Copied!' ? 'text-green-500' : 'text-gray-500'}`}>{label}</span>
          </button>
        ))}
      </div>

      {/* Deposit from exchange */}
      <div className="mx-4 mt-6 flex items-center gap-3 bg-indigo-50 rounded-2xl px-4 py-4">
        <div className="w-9 h-9 rounded-full bg-indigo-200 flex items-center justify-center shrink-0">
          <ArrowDownCircle size={18} className="text-indigo-600" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-gray-800">Deposit from exchange</div>
          <div className="text-[11px] text-gray-500">By direct transfer from your account</div>
        </div>
      </div>
    </div>
  );
}
