import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR   = join(process.cwd(), 'data');
const STORE_PATH = join(DATA_DIR, 'investx-giftcards.json');
try { mkdirSync(DATA_DIR, { recursive: true }); } catch { /* exists */ }

export interface GiftCardSubmission {
  id: string;
  uid: string;
  userName: string;
  userTag: string;
  cardType: string;
  cardLabel: string;
  amount: number;
  code?: string;
  /** base64 data-URLs, max 2 */
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

// In-memory cache — avoids repeated file reads
let _cache: Record<string, GiftCardSubmission> | null = null;

function readStore(): Record<string, GiftCardSubmission> {
  if (_cache !== null) return _cache;
  if (!existsSync(STORE_PATH)) { _cache = {}; return _cache; }
  try {
    _cache = JSON.parse(readFileSync(STORE_PATH, 'utf-8')) as Record<string, GiftCardSubmission>;
    return _cache;
  } catch {
    _cache = {};
    return _cache;
  }
}

function writeStore(store: Record<string, GiftCardSubmission>): void {
  _cache = store;
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

export function getAllSubmissions(): GiftCardSubmission[] {
  return Object.values(readStore()).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export function getSubmission(id: string): GiftCardSubmission | null {
  return readStore()[id] ?? null;
}

export function createSubmission(
  data: Omit<GiftCardSubmission, 'id' | 'submittedAt' | 'status'>,
): GiftCardSubmission {
  const store = readStore();
  const sub: GiftCardSubmission = {
    ...data,
    id: `gc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  store[sub.id] = sub;
  writeStore(store);
  return sub;
}

export function updateSubmission(
  id: string,
  fields: Partial<Pick<GiftCardSubmission, 'status' | 'reviewedAt' | 'reviewNote'>>,
): GiftCardSubmission | null {
  const store = readStore();
  if (!store[id]) return null;
  store[id] = { ...store[id], ...fields };
  writeStore(store);
  return store[id];
}
