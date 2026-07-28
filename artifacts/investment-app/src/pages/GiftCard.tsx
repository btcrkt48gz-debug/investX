import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, X, ImagePlus, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { submitGiftCard, getUserData } from '@/lib/firestoreDb';

const CARD_TYPES = [
  { id: 'amazon',    label: 'Amazon Gift Card',    logo: '🛒' },
  { id: 'apple',     label: 'Apple Gift Card',     logo: '🍎' },
  { id: 'google',    label: 'Google Play Card',    logo: '▶️' },
  { id: 'steam',     label: 'Steam Gift Card',     logo: '🎮' },
  { id: 'walmart',   label: 'Walmart Gift Card',   logo: '🛍️' },
  { id: 'target',    label: 'Target Gift Card',    logo: '🎯' },
  { id: 'bestbuy',   label: 'Best Buy Gift Card',  logo: '🔷' },
  { id: 'visa',      label: 'Visa Gift Card',      logo: '💳' },
  { id: 'mastercard',label: 'Mastercard Gift Card',logo: '💳' },
  { id: 'other',     label: 'Other',               logo: '🎁' },
];

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width  = Math.round(width  * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

export default function GiftCard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [cardType, setCardType] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [amount, setAmount]     = useState('');
  const [code, setCode]         = useState('');
  const [images, setImages]     = useState<{ file: File; url: string; label: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selected  = CARD_TYPES.find(c => c.id === cardType);
  const canSubmit = !!cardType && !!amount && images.length > 0;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files).slice(0, 2 - images.length);
    const mapped   = incoming.map((file, i) => {
      const label = images.length + i === 0 ? 'Gift Card' : 'Receipt';
      return { file, url: URL.createObjectURL(file), label };
    });
    setImages(prev => [...prev, ...mapped].slice(0, 2));
  };

  function removeImage(idx: number) {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx]!.url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function handleSubmit() {
    if (!user || !canSubmit) return;
    setError('');
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || amt > 10_000) {
      setError('Amount must be between $0.01 and $10,000.');
      return;
    }
    setLoading(true);
    try {
      // Compress images to base64
      const compressed = await Promise.all(images.map(i => compressImage(i.file)));

      // Get user's name and tag
      const userData = await getUserData(user.uid);

      await submitGiftCard({
        uid:       user.uid,
        userName:  userData?.name  ?? user.displayName ?? 'Unknown',
        userTag:   userData?.investxtag ?? '',
        cardType,
        cardLabel: selected?.label ?? cardType,
        amount:    amt,
        code:      code.trim() || undefined,
        images:    compressed,
        status:    'pending',
        submittedAt: new Date().toISOString(),
      });

      setSubmitted(true);
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-5">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="text-xl font-bold text-center">Gift Card Submitted!</h2>
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          Your gift card has been submitted for review. We'll credit your account once it's verified (usually within 24 hours).
        </p>
        <button
          onClick={() => setLocation('/add-money')}
          className="w-full max-w-xs py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm"
        >
          Back to Add Money
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation('/add-money')} className="p-1.5 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-base font-bold">Redeem Gift Card</h1>
      </div>

      <main className="flex-1 px-4 pt-5 pb-10 flex flex-col gap-5 max-w-lg mx-auto w-full">
        {/* Card type */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Card Type</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-border bg-card text-left"
            >
              <span className={selected ? 'text-sm font-semibold text-foreground' : 'text-sm text-muted-foreground'}>
                {selected ? `${selected.logo} ${selected.label}` : 'Select card type…'}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-muted-foreground transition-transform ${dropOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            {dropOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-2xl bg-card border border-border shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                {CARD_TYPES.map(ct => (
                  <button key={ct.id} type="button"
                    onClick={() => { setCardType(ct.id); setDropOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted transition-colors ${cardType === ct.id ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground'}`}>
                    <span>{ct.logo}</span>
                    {ct.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Card Value (USD)</label>
          <div className="flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-border bg-card">
            <span className="text-xl font-bold text-muted-foreground">$</span>
            <input
              type="number" min="1" max="10000" step="0.01"
              value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 text-xl font-bold text-foreground bg-transparent outline-none placeholder-muted-foreground"
            />
          </div>
        </div>

        {/* Code (optional) */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Card Code <span className="text-muted-foreground font-normal normal-case">(optional)</span></label>
          <input
            type="text" value={code} onChange={e => setCode(e.target.value)}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="w-full px-4 py-3.5 rounded-2xl border border-border bg-card text-sm text-foreground placeholder-muted-foreground outline-none"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Card Photos <span className="font-normal normal-case text-muted-foreground">(front + back, up to 2)</span>
          </label>

          {images.length > 0 && (
            <div className="flex gap-3 mb-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative flex-1">
                  <img src={img.url} alt={img.label} className="w-full h-32 object-cover rounded-xl border border-border shadow-sm" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/50 rounded-full px-2 py-0.5">{img.label}</span>
                  <button type="button" onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors">
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
              {images.length === 1 && (
                <button type="button" onClick={() => inputRef.current?.click()}
                  className="flex-1 h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground">
                  <ImagePlus size={20} />
                  <span className="text-[11px] font-semibold">Add receipt</span>
                </button>
              )}
            </div>
          )}

          {images.length === 0 && (
            <button type="button" onClick={() => inputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              className="w-full border-2 border-dashed border-border rounded-2xl py-10 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload size={24} className="text-primary" />
              </div>
              <div className="text-center">
                <div className="text-[13px] font-bold text-primary">Tap to upload</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">or drag & drop your image here</div>
              </div>
              <div className="text-[10px] text-muted-foreground/70 bg-muted rounded-full px-3 py-1">JPG · PNG · HEIC · up to 10 MB</div>
            </button>
          )}

          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[12px] text-red-600 font-medium">{error}</div>
        )}

        <button
          type="button" disabled={!canSubmit} onClick={handleSubmit}
          className={`w-full py-4 rounded-2xl text-[15px] font-bold shadow transition-all flex items-center justify-center gap-2 ${canSubmit ? 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          {loading ? (<><Loader2 size={18} className="animate-spin" />Submitting…</>) : 'Submit Gift Card'}
        </button>

        {!canSubmit && !loading && (
          <p className="text-center text-[11px] text-muted-foreground">
            {!cardType ? 'Select a card type' : !amount ? 'Enter the card amount' : 'Upload at least one image to continue'}
          </p>
        )}
      </main>
    </div>
  );
}
