import { ref, push, query, orderByChild, limitToLast, onValue, off } from 'firebase/database';
import { rtdb } from './firebase';

export type ActivityType =
  | 'login' | 'signup' | 'logout'
  | 'investment_placed' | 'investment_stopped' | 'investment_transferred'
  | 'deposit' | 'withdrawal' | 'send' | 'profile_updated' | 'gift_card_redeemed';

export interface ActivityEvent {
  type: ActivityType;
  timestamp: number;
  details?: Record<string, unknown>;
}

export async function logActivity(
  uid: string,
  type: ActivityType,
  details?: Record<string, unknown>,
): Promise<void> {
  const activityRef = ref(rtdb, `activity/${uid}`);
  await push(activityRef, { type, timestamp: Date.now(), details: details ?? {} });
}

export function subscribeToActivity(
  uid: string,
  limit: number,
  callback: (events: Array<ActivityEvent & { id: string }>) => void,
): () => void {
  const activityRef = query(
    ref(rtdb, `activity/${uid}`),
    orderByChild('timestamp'),
    limitToLast(limit),
  );
  const handler = onValue(activityRef, (snap) => {
    const events: Array<ActivityEvent & { id: string }> = [];
    snap.forEach((child) => {
      events.push({ id: child.key as string, ...(child.val() as ActivityEvent) });
    });
    callback(events.reverse());
  });
  return () => off(activityRef, 'value', handler);
}
