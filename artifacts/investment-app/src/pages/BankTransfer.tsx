import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Copy, Check, MessageCircle } from 'lucide-react';
import { BsBank2 } from 'react-icons/bs';

const BANK_DETAILS = [
  { label: 'Account Number',  value: '218517204395' },
  { label: 'Wire Routing',    value: '101019644' },
  { label: 'ACH Routing',     value: '101019644' },
  { label: 'Account Type',    value: 'Checking' },
  { label: 'Bank Name',       value: 'Lead' },
  { label: 'Bank Address',    value: '1801 Main St., Kansas City, MO 64108' },
];

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3.5 shadow-sm">
      <div className="min-w-0 flex-1 pr-3">
        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </div>
        <div className="text-[14px] font-semibold text-primary break-all leading-snug">
          {value}
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
      >
        {copied
          ? <Check size={15} className="text-green-500" />
          : <Copy size={15} className="text-muted-foreground" />}
      </button>
    </div>
  );
}

export default function BankTransfer() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 shadow-md">
        <button
          onClick={() => setLocation('/add-money')}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold leading-tight">Bank Transfer</h1>
          <p className="text-[11px] text-primary-foreground/60">Wire or ACH deposit</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 pb-12 space-y-4">

        {/* Support notice */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3.5">
          <MessageCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[12px] text-blue-800 leading-snug">
            <span className="font-bold">Message customer support</span> for more details before making a transfer.
          </p>
        </div>

        {/* Section heading */}
        <div className="flex items-center gap-2.5 pt-1">
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <BsBank2 size={18} className="text-blue-700" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-primary">Your US Bank Account Details</div>
            <div className="text-[11px] text-muted-foreground">Use the details below to initiate your transfer</div>
          </div>
        </div>

        {/* Bank detail rows */}
        <div className="space-y-2.5">
          {BANK_DETAILS.map((row) => (
            <CopyRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
          <p className="text-[12px] text-amber-800 leading-snug">
            Transfers typically arrive in <strong>2 – 5 business days</strong>. Always confirm with support before sending to avoid delays.
          </p>
        </div>

      </main>
    </div>
  );
}
