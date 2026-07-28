import { Router, type IRouter } from 'express';
import {
  getUserByUid,
  getUserByTag,
  updateUser,
  stripHash,
  addUserTransaction,
  transferBetweenUsers,
  type StoredTransaction,
} from '../lib/userStore.js';
import { requireAuth } from '../lib/jwtAuth.js';

const router: IRouter = Router();

/* GET /api/users/lookup?tag=xxx — public: find a user by InvestX tag (safe fields only) */
router.get('/users/lookup', (req, res) => {
  const tag = (req.query['tag'] as string | undefined)?.trim();
  if (!tag) { res.status(400).json({ message: 'tag query param required.' }); return; }
  const user = getUserByTag(tag);
  if (!user || !user.investxtag) { res.status(404).json({ message: 'User not found.' }); return; }
  // Only safe public fields — never expose balance or transactions
  res.json({ user: { uid: user.uid, name: user.name, investxtag: user.investxtag } });
});

/* GET /api/users/:uid — authenticated: user fetches their own data */
router.get('/users/:uid', requireAuth, (req, res) => {
  const user = getUserByUid(req.params['uid']!);
  if (!user) { res.status(404).json({ message: 'User not found.' }); return; }
  res.json({ user: stripHash(user) });
});

/* PATCH /api/users/:uid — authenticated: user updates their own profile or syncs cash balance */
router.patch('/users/:uid', requireAuth, (req, res) => {
  const uid  = req.params['uid']!;
  const user = getUserByUid(uid);
  if (!user) { res.status(404).json({ message: 'User not found.' }); return; }

  const body = req.body as Record<string, unknown>;
  const { phone, dob, investxtag, cashBalance, investedAmount, activeInvestmentTxIds } = body as {
    phone?: string; dob?: string; investxtag?: string;
    cashBalance?: unknown; investedAmount?: unknown; activeInvestmentTxIds?: unknown;
  };

  const fields: Parameters<typeof updateUser>[1] = {};
  if (phone      !== undefined)                    fields.phone      = String(phone).slice(0, 30);
  if (dob        !== undefined)                    fields.dob        = String(dob).slice(0, 20);
  if (investxtag !== undefined)                    fields.investxtag = String(investxtag).slice(0, 30);
  if (cashBalance !== undefined && !isNaN(Number(cashBalance))) {
    fields.cashBalance = Math.max(0, Number(cashBalance));
  }
  if (investedAmount !== undefined && !isNaN(Number(investedAmount))) {
    fields.investedAmount = Math.max(0, Number(investedAmount));
  }
  if (Array.isArray(activeInvestmentTxIds)) {
    fields.activeInvestmentTxIds = activeInvestmentTxIds
      .filter((id): id is string => typeof id === 'string')
      .slice(0, 500); // reasonable cap
  }

  const updated = updateUser(uid, fields);
  res.json({ user: updated });
});

/* POST /api/users/:uid/transfer — authenticated: transfer funds to another user by InvestX tag */
router.post('/users/:uid/transfer', requireAuth, (req, res) => {
  const senderUid = req.params['uid']!;
  const { recipientTag, amount, note } = req.body as {
    recipientTag?: string; amount?: number; note?: string;
  };

  if (!recipientTag || !amount || amount <= 0) {
    res.status(400).json({ message: 'recipientTag and a positive amount are required.' });
    return;
  }
  // Cap transfer amount to prevent overflow
  if (Number(amount) > 10_000_000) {
    res.status(400).json({ message: 'Transfer amount exceeds maximum allowed.' });
    return;
  }

  const result = transferBetweenUsers(
    senderUid,
    recipientTag.replace(/^@/, ''),
    Number(amount),
    (note ?? '').slice(0, 200),
  );
  if ('error' in result) {
    res.status(400).json({ message: result.error });
    return;
  }

  res.json({ sender: result.sender, recipient: result.recipient });
});

/* POST /api/users/:uid/transactions — authenticated: save a user-initiated transaction */
router.post('/users/:uid/transactions', requireAuth, (req, res) => {
  const uid  = req.params['uid']!;
  const user = getUserByUid(uid);
  if (!user) { res.status(404).json({ message: 'User not found.' }); return; }

  const body = req.body as Partial<StoredTransaction>;
  if (!body.id || !body.type || body.amount == null) {
    res.status(400).json({ message: 'id, type, and amount are required.' });
    return;
  }
  if (Number(body.amount) < 0 || Number(body.amount) > 10_000_000) {
    res.status(400).json({ message: 'amount out of valid range.' });
    return;
  }

  const tx: StoredTransaction = {
    id:           body.id,
    type:         body.type,
    amount:       Number(body.amount),
    note:         (body.note ?? '').slice(0, 200),
    date:         body.date ?? new Date().toISOString(),
    balanceAfter: body.balanceAfter ?? user.cashBalance,
    status:
      body.type === 'withdraw' || body.type === 'withdrawal'
        ? 'pending'
        : (body.status ?? 'completed'),
    method:      body.method,
    destination: body.destination,
    ticker:      body.ticker,
    planId:      body.planId,
    category:    body.category,
    logo:        body.logo,
    name:        body.name,
    fee:         body.fee,
    receivable:  body.receivable,
    profit:      body.profit,
    timestamp:   body.timestamp,
  };

  const updated = addUserTransaction(uid, tx);
  res.json({ user: updated, transaction: tx });
});

export default router;
