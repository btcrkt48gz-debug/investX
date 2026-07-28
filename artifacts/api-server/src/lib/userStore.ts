import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR   = join(process.cwd(), 'data');
const STORE_PATH = join(DATA_DIR, 'investx-users.json');
try { mkdirSync(DATA_DIR, { recursive: true }); } catch { /* already exists */ }

export interface StoredTransaction {
  id: string;
  type: 'credit' | 'debit' | 'deposit' | 'withdrawal' | 'investment' | 'invest' | 'cashout' | 'withdraw' | 'transfer';
  amount: number;
  note: string;
  date: string;
  balanceAfter: number;
  /** Approval status — withdrawals start as 'pending' until admin acts */
  status?: 'pending' | 'completed' | 'failed';
  method?: string;
  destination?: string;
  ticker?: string;
  planId?: string;
  category?: string;
  logo?: string;
  name?: string;
  fee?: number;
  receivable?: number;
  profit?: number;
  timestamp?: number;
}

export interface StoredUser {
  uid: string;
  name: string;
  email: string;
  passwordHash: string;
  cashBalance: number;
  investedAmount?: number;
  activeInvestmentTxIds?: string[];
  investxtag: string;
  phone: string;
  dob: string;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  transactions: StoredTransaction[];
}

export type PublicUser = Omit<StoredUser, 'passwordHash'>;

// ── In-memory cache — avoids re-reading the file on every operation ──────────
let _cache: Record<string, StoredUser> | null = null;

function readStore(): Record<string, StoredUser> {
  if (_cache !== null) return _cache;
  if (!existsSync(STORE_PATH)) { _cache = {}; return _cache; }
  try {
    _cache = JSON.parse(readFileSync(STORE_PATH, 'utf-8')) as Record<string, StoredUser>;
    return _cache;
  } catch {
    _cache = {};
    return _cache;
  }
}

function writeStore(store: Record<string, StoredUser>): void {
  _cache = store;
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function hashPassword(password: string): string {
  return createHash('sha256').update(`investx_salt::${password}`).digest('hex');
}

export function stripHash(u: StoredUser): PublicUser {
  const { passwordHash: _ph, ...pub } = u;
  return pub;
}

/** Validate that a string is a non-empty, reasonable length after trimming. */
function sanitizeStr(val: string | undefined, maxLen = 255): string {
  return (val ?? '').trim().slice(0, maxLen);
}

export function getUsers(): PublicUser[] {
  return Object.values(readStore()).map(stripHash);
}

export function getUserByUid(uid: string): StoredUser | null {
  return readStore()[uid] ?? null;
}

export function getUserByEmail(email: string): StoredUser | null {
  const store = readStore();
  const normalised = email.toLowerCase().trim();
  return Object.values(store).find(u => u.email.toLowerCase() === normalised) ?? null;
}

export function getUserByTag(tag: string): StoredUser | null {
  const store = readStore();
  const normalised = tag.toLowerCase().replace(/^@/, '');
  return Object.values(store).find(u => u.investxtag.toLowerCase().replace(/^@/, '') === normalised) ?? null;
}

export function createUser(data: {
  uid: string; name: string; email: string; password: string; investxtag?: string; phone?: string; dob?: string;
}): StoredUser {
  const store = readStore();
  const user: StoredUser = {
    uid:          data.uid,
    name:         sanitizeStr(data.name, 100),
    email:        data.email.toLowerCase().trim().slice(0, 254),
    passwordHash: hashPassword(data.password),
    cashBalance:  0,
    investxtag:   sanitizeStr(data.investxtag ?? '', 30),
    phone:        sanitizeStr(data.phone ?? '', 30),
    dob:          sanitizeStr(data.dob ?? '', 20),
    status:       'active',
    createdAt:    new Date().toISOString(),
    transactions: [],
  };
  store[data.uid] = user;
  writeStore(store);
  return user;
}

export function updateUser(
  uid: string,
  fields: Partial<Omit<StoredUser, 'uid' | 'transactions'>>,
): PublicUser | null {
  const store = readStore();
  if (!store[uid]) return null;
  // Sanitize string fields that come from user input
  if (typeof fields.name       === 'string') fields.name       = sanitizeStr(fields.name,       100);
  if (typeof fields.phone      === 'string') fields.phone      = sanitizeStr(fields.phone,      30);
  if (typeof fields.investxtag === 'string') fields.investxtag = sanitizeStr(fields.investxtag, 30);
  if (typeof fields.dob        === 'string') fields.dob        = sanitizeStr(fields.dob,        20);
  store[uid] = { ...store[uid], ...fields };
  writeStore(store);
  return stripHash(store[uid]);
}

/** Admin credit/debit — adjusts balance and records an admin transaction. */
export function creditUser(uid: string, amount: number, note: string): PublicUser | null {
  const store = readStore();
  if (!store[uid]) return null;
  store[uid].cashBalance = Math.max(0, store[uid].cashBalance + amount);
  store[uid].transactions.unshift({
    id:           `txn_${Date.now()}`,
    type:         amount >= 0 ? 'credit' : 'debit',
    amount:       Math.abs(amount),
    note:         sanitizeStr(note, 200),
    date:         new Date().toISOString(),
    balanceAfter: store[uid].cashBalance,
    status:       'completed',
  });
  writeStore(store);
  return stripHash(store[uid]);
}

/** Save a user-initiated transaction (invest, cashout, withdraw, transfer, deposit). Does NOT change cashBalance. */
export function addUserTransaction(uid: string, tx: StoredTransaction): PublicUser | null {
  const store = readStore();
  if (!store[uid]) return null;
  // Deduplicate by ID so client retries are safe
  if (store[uid].transactions.some(t => t.id === tx.id)) return stripHash(store[uid]);
  store[uid].transactions.unshift(tx);
  writeStore(store);
  return stripHash(store[uid]);
}

/** Update fields on an existing transaction (e.g. status change by admin). */
export function updateUserTransaction(
  uid: string,
  txId: string,
  fields: Partial<StoredTransaction>,
): { user: PublicUser; transaction: StoredTransaction } | null {
  const store = readStore();
  if (!store[uid]) return null;
  const tx = store[uid].transactions.find(t => t.id === txId);
  if (!tx) return null;
  Object.assign(tx, fields);
  writeStore(store);
  return { user: stripHash(store[uid]), transaction: tx };
}

/**
 * Atomically transfer funds from one user to another.
 * Deducts from sender, credits recipient, records transactions on both sides.
 */
export function transferBetweenUsers(
  senderUid: string,
  recipientTag: string,
  amount: number,
  note: string,
): { sender: PublicUser; recipient: PublicUser } | { error: string } {
  const store = readStore();
  const sender = store[senderUid];
  if (!sender) return { error: 'Sender not found.' };
  if (sender.cashBalance < amount) return { error: 'Insufficient balance.' };

  const recipient = Object.values(store).find(
    u => u.investxtag.toLowerCase().replace(/^@/, '') === recipientTag.toLowerCase().replace(/^@/, ''),
  );
  if (!recipient) return { error: 'Recipient not found.' };
  if (recipient.uid === senderUid) return { error: 'Cannot transfer to yourself.' };

  const now  = new Date();
  const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const ts   = now.getTime();

  store[senderUid].cashBalance = Math.max(0, sender.cashBalance - amount);
  store[senderUid].transactions.unshift({
    id: `tx_${ts}_s_${Math.random().toString(36).slice(2)}`,
    type: 'transfer',
    amount,
    note: sanitizeStr(note || `Transfer to @${recipient.investxtag}`, 200),
    date,
    balanceAfter: store[senderUid].cashBalance,
    status: 'completed',
    destination: `@${recipient.investxtag}`,
    name: recipient.name,
    timestamp: ts,
  });

  store[recipient.uid].cashBalance = recipient.cashBalance + amount;
  store[recipient.uid].transactions.unshift({
    id: `tx_${ts}_r_${Math.random().toString(36).slice(2)}`,
    type: 'deposit',
    amount,
    note: sanitizeStr(note || `Transfer from @${sender.investxtag}`, 200),
    date,
    balanceAfter: store[recipient.uid].cashBalance,
    status: 'completed',
    destination: `@${sender.investxtag}`,
    name: sender.name,
    timestamp: ts,
  });

  writeStore(store);
  return { sender: stripHash(store[senderUid]), recipient: stripHash(store[recipient.uid]) };
}

export function deleteUser(uid: string): boolean {
  const store = readStore();
  if (!store[uid]) return false;
  delete store[uid];
  writeStore(store);
  return true;
}

export function touchLogin(uid: string): void {
  const store = readStore();
  if (store[uid]) {
    store[uid].lastLogin = new Date().toISOString();
    writeStore(store);
  }
}
