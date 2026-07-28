import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { X, Info, Copy, Share2, ArrowDownCircle, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { SiPaypal } from 'react-icons/si';

const WALLET = {
  symbol: 'PYUSD',
  name: 'PayPal USD',
  address: '0xB6cE878462605420910A1d8cF827537e9e134367',
  network: 'BEP-20 (BSC)',
  warning: 'Only send PYUSD BEP-20 to this address. Sending any other network or asset will result in permanent loss.',
};

export default function PyusdReceive() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET.address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${WALLET.symbol} Address`, text: WALLET.address });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-5 pb-3">
        <button
          onClick={() => setLocation('/add-money')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-700" />
        </button>
        <div className="text-base font-bold text-gray-900">Receive PYUSD</div>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <Info size={18} className="text-gray-500" />
        </button>
      </header>

      {/* Warning banner */}
      <div className="mx-4 mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <span className="text-amber-500 text-base mt-0.5 shrink-0">⚠</span>
        <p className="text-[12px] text-amber-800 leading-snug">{WALLET.warning}</p>
      </div>

      {/* Coin label */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-full bg-[#e8f0fb] flex items-center justify-center">
          <SiPaypal size={14} className="text-[#003087]" />
        </div>
        <span className="text-[15px] font-bold text-gray-900">{WALLET.symbol}</span>
        <span className="text-[13px] text-gray-400">{WALLET.name}</span>
        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">{WALLET.network}</span>
      </div>

      {/* QR Code */}
      <div className="mx-auto border border-gray-200 rounded-2xl p-5 shadow-sm bg-white">
        <QRCodeSVG
          value={WALLET.address}
          size={200}
          bgColor="#ffffff"
          fgColor="#111111"
          level="H"
        />
        <p className="text-center text-[12px] text-gray-500 mt-3 max-w-[200px] break-all leading-snug">
          {WALLET.address}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-10 mt-6">
        {[
          { icon: copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-gray-600" />, label: copied ? 'Copied!' : 'Copy', onClick: handleCopy },
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

      {/* Info card */}
      <div className="mx-4 mt-6 flex items-center gap-3 bg-indigo-50 rounded-2xl px-4 py-4">
        <div className="w-9 h-9 rounded-full bg-indigo-200 flex items-center justify-center shrink-0">
          <ArrowDownCircle size={18} className="text-indigo-600" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-gray-800">Send from PayPal</div>
          <div className="text-[11px] text-gray-500">Transfer PYUSD from your PayPal wallet on BEP-20</div>
        </div>
      </div>
    </div>
  );
}
