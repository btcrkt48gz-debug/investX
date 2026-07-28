import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  onSnapshot, collection, getDocs, addDoc,
  query, where, runTransaction, orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ActiveInvestment } from '@/context/InvestmentContext';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  cashBalance: number;
  investxtag: string;
  investedAmount?: number;
  activeInvestmentTxIds?: string[];
  status: 'active' | 'suspended';
  createdAt: number;
  lastLogin?: number;
}

export interface StoredTransaction {
  id: string;
  type: string;
  amount: number;
  note: string;
  date: string;
  balanceAfter: number;
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
  timestamp: number;
}

export interface GiftCardSubmission {
  id?: string;
  uid: string;
  userName: string;
  userTag: string;
  cardType: string;
  cardLabel: string;
  amount: number;
  code?: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

// ── User profile ──────────────────────────────────────────────────────────────

export async function initUserDoc(
  uid: string,
  data: { name: string; email: string; phone?: string; dob?: string },
) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name: data.name,
      email: data.email,
      cashBalance: 0,
      investxtag: '',
      phone: data.phone ?? '',
      dob: data.dob ?? '',
      status: 'active',
      createdAt: Date.now(),
    });
  }
}

export async function getUserData(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as UserProfile;
}

export async function updateUserProfile(uid: string, fields: Partial<Omit<UserProfile, 'uid'>>) {
  await updateDoc(doc(db, 'users', uid), fields as Record<string, unknown>);
}

export async function updateCashBalance(uid: string, cashBalance: number) {
  await updateDoc(doc(db, 'users', uid), { cashBalance });
}

export function subscribeToUser(
  uid: string,
  callback: (profile: UserProfile | null) => void,
): () => void {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    callback(snap.exists() ? ({ uid, ...snap.data() } as UserProfile) : null);
  });
}

// ── Transactions ──────────────────────────────────────────────────────────────

export async function addTransaction(uid: string, tx: StoredTransaction) {
  await setDoc(doc(db, 'users', uid, 'transactions', tx.id), tx);
}

export async function getTransactions(uid: string): Promise<StoredTransaction[]> {
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'transactions'), orderBy('timestamp', 'desc')),
  );
  return snap.docs.map(d => d.data() as StoredTransaction);
}

export function subscribeToTransactions(
  uid: string,
  callback: (txs: StoredTransaction[]) => void,
): () => void {
  const q = query(
    collection(db, 'users', uid, 'transactions'),
    orderBy('timestamp', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => d.data() as StoredTransaction));
  });
}

export async function updateTransaction(
  uid: string,
  txId: string,
  fields: Partial<StoredTransaction>,
) {
  await updateDoc(doc(db, 'users', uid, 'transactions', txId), fields as Record<string, unknown>);
}

// ── Investments ───────────────────────────────────────────────────────────────

export async function saveInvestments(
  uid: string,
  investments: Record<string, ActiveInvestment>,
) {
  await setDoc(doc(db, 'investments', uid), investments);
}

export function subscribeToPortfolio(
  uid: string,
  onInvestments: (investments: Record<string, ActiveInvestment>) => void,
  onCash: (cash: number) => void,
): () => void {
  const unsubInv = onSnapshot(doc(db, 'investments', uid), (snap) => {
    onInvestments(snap.exists() ? (snap.data() as Record<string, ActiveInvestment>) : {});
  });
  const unsubUser = onSnapshot(doc(db, 'users', uid), (snap) => {
    const data = snap.data() as { cashBalance?: number } | undefined;
    onCash(data?.cashBalance ?? 0);
  });
  return () => { unsubInv(); unsubUser(); };
}

// ── User lookup by InvestX tag ────────────────────────────────────────────────

export async function getUserByTag(tag: string): Promise<UserProfile | null> {
  const normalized = tag.toLowerCase().replace(/^@/, '');
  // Try both with and without @
  const q1 = query(collection(db, 'users'), where('investxtag', '==', `@${normalized}`));
  const snap1 = await getDocs(q1);
  if (!snap1.empty) {
    const d = snap1.docs[0]!;
    return { uid: d.id, ...d.data() } as UserProfile;
  }
  const q2 = query(collection(db, 'users'), where('investxtag', '==', normalized));
  const snap2 = await getDocs(q2);
  if (!snap2.empty) {
    const d = snap2.docs[0]!;
    return { uid: d.id, ...d.data() } as UserProfile;
  }
  return null;
}

// ── Transfer between users ────────────────────────────────────────────────────

export async function transferBetweenUsers(params: {
  senderUid: string;
  recipientTag: string;
  amount: number;
  note: string;
  date: string;
}): Promise<{ success: boolean; error?: string; recipientName?: string }> {
  const { senderUid, recipientTag, amount, note, date } = params;

  const recipient = await getUserByTag(recipientTag);
  if (!recipient) return { success: false, error: 'No user found with that InvestX tag.' };
  if (recipient.uid === senderUid) return { success: false, error: "You can't send money to yourself." };

  try {
    await runTransaction(db, async (txn) => {
      const senderRef    = doc(db, 'users', senderUid);
      const recipientRef = doc(db, 'users', recipient.uid);

      const senderSnap    = await txn.get(senderRef);
      const recipientSnap = await txn.get(recipientRef);

      if (!senderSnap.exists()) throw new Error('Your account was not found.');
      const senderData = senderSnap.data() as { cashBalance: number };
      if (senderData.cashBalance < amount) throw new Error('Insufficient balance.');

      const senderNewBal    = senderData.cashBalance - amount;
      const recipientData   = recipientSnap.exists() ? (recipientSnap.data() as { cashBalance: number }) : { cashBalance: 0 };
      const recipientNewBal = recipientData.cashBalance + amount;

      const now     = Date.now();
      const sendId  = `tx_${now}_${Math.random().toString(36).slice(2)}`;
      const recvId  = `tx_${now + 1}_${Math.random().toString(36).slice(2)}`;

      txn.update(senderRef,    { cashBalance: senderNewBal });
      txn.update(recipientRef, { cashBalance: recipientNewBal });

      txn.set(doc(db, 'users', senderUid, 'transactions', sendId), {
        id: sendId, type: 'transfer', amount, note: note || '',
        date, balanceAfter: senderNewBal,
        destination: recipient.name, status: 'completed', timestamp: now,
      });

      txn.set(doc(db, 'users', recipient.uid, 'transactions', recvId), {
        id: recvId, type: 'deposit', amount,
        note: `Received from ${senderUid}`,
        date, balanceAfter: recipientNewBal,
        destination: 'Received', status: 'completed', timestamp: now + 1,
      });
    });

    return { success: true, recipientName: recipient.name };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Transfer failed.' };
  }
}

// ── Gift cards ────────────────────────────────────────────────────────────────

export async function submitGiftCard(
  submission: Omit<GiftCardSubmission, 'id'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'giftCards'), submission);
  return ref.id;
}

export async function getAllGiftCards(): Promise<GiftCardSubmission[]> {
  const snap = await getDocs(collection(db, 'giftCards'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as GiftCardSubmission);
}

export async function updateGiftCard(id: string, fields: Partial<GiftCardSubmission>) {
  await updateDoc(doc(db, 'giftCards', id), fields as Record<string, unknown>);
}

// ── All users (admin) ─────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }) as UserProfile);
}

export async function adminDeleteUser(uid: string) {
  await deleteDoc(doc(db, 'users', uid));
}

export async function creditUser(uid: string, amount: number, note: string) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (txn) => {
    const snap = await txn.get(userRef);
    if (!snap.exists()) throw new Error('User not found.');
    const data       = snap.data() as { cashBalance: number };
    const newBalance = data.cashBalance + amount;
    const now        = Date.now();
    const txId       = `tx_${now}_${Math.random().toString(36).slice(2)}`;
    txn.update(userRef, { cashBalance: newBalance });
    txn.set(doc(db, 'users', uid, 'transactions', txId), {
      id: txId, type: 'credit', amount, note,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      balanceAfter: newBalance, status: 'completed', timestamp: now,
    });
  });
}

export async function debitUser(uid: string, amount: number, note: string) {
  const userRef = doc(db, 'users', uid);
  await runTransaction(db, async (txn) => {
    const snap = await txn.get(userRef);
    if (!snap.exists()) throw new Error('User not found.');
    const data       = snap.data() as { cashBalance: number };
    const newBalance = Math.max(0, data.cashBalance - amount);
    const now        = Date.now();
    const txId       = `tx_${now}_${Math.random().toString(36).slice(2)}`;
    txn.update(userRef, { cashBalance: newBalance });
    txn.set(doc(db, 'users', uid, 'transactions', txId), {
      id: txId, type: 'debit', amount, note,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      balanceAfter: newBalance, status: 'completed', timestamp: now,
    });
  });
}

// ── Admin auth check ──────────────────────────────────────────────────────────

export async function isAdmin(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'admins', uid));
  return snap.exists();
}
