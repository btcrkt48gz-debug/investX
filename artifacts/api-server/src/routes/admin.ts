import { Router, type IRouter, type Request, type Response, type NextFunction } from 'express';
import {
  getUsers,
  getUserByUid,
  getUserByTag,
  updateUser,
  creditUser,
  deleteUser,
  hashPassword,
  stripHash,
  updateUserTransaction,
} from '../lib/userStore.js';
import { ADMIN_SECRET } from '../lib/adminSecret.js';

const router: IRouter = Router();

/* ── Admin auth middleware ────────────────────────────────────────────────── */
function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-admin-key'] as string | undefined;
  if (!key || key !== ADMIN_SECRET) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }
  next();
}

/* POST /api/admin/login — public, no auth needed (rate-limited in app.ts) */
router.post('/admin/login', (req, res) => {
  const { secret } = req.body as { secret?: string };
  if (secret === ADMIN_SECRET) {
    res.json({ ok: true, key: ADMIN_SECRET });
  } else {
    res.status(401).json({ message: 'Wrong admin password.' });
  }
});

/* All routes below require the admin key header */
router.use('/admin', adminAuth);

/* GET /api/admin/users — list all users */
router.get('/admin/users', (_req, res) => {
  const users = getUsers().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  res.json({ users });
});

/* GET /api/admin/users/search?tag=xxx */
router.get('/admin/users/search', (req, res) => {
  const tag = (req.query['tag'] as string ?? '').trim();
  if (!tag) { res.status(400).json({ message: 'tag query param required.' }); return; }
  const user = getUserByTag(tag);
  if (!user) { res.status(404).json({ message: `No user found with tag "${tag}".` }); return; }
  res.json({ user: stripHash(user) });
});

/* GET /api/admin/users/:uid */
router.get('/admin/users/:uid', (req, res) => {
  const user = getUserByUid(req.params['uid']!);
  if (!user) { res.status(404).json({ message: 'User not found.' }); return; }
  res.json({ user: stripHash(user) });
});

/* PATCH /api/admin/users/:uid — edit profile fields */
router.patch('/admin/users/:uid', (req, res) => {
  const { name, email, phone, dob, investxtag, status } = req.body as Record<string, string>;
  const user = getUserByUid(req.params['uid']!);
  if (!user) { res.status(404).json({ message: 'User not found.' }); return; }
  const updated = updateUser(req.params['uid']!, {
    name, email, phone, dob, investxtag,
    status: status as 'active' | 'suspended',
  });
  res.json({ user: updated });
});

/* POST /api/admin/users/:uid/credit — add or subtract balance */
router.post('/admin/users/:uid/credit', (req, res) => {
  const { amount, note } = req.body as { amount?: number; note?: string };
  if (amount == null || isNaN(Number(amount))) {
    res.status(400).json({ message: 'amount is required and must be a number.' });
    return;
  }
  if (Math.abs(Number(amount)) > 10_000_000) {
    res.status(400).json({ message: 'amount exceeds maximum allowed.' });
    return;
  }
  const user = getUserByUid(req.params['uid']!);
  if (!user) { res.status(404).json({ message: 'User not found.' }); return; }
  const updated = creditUser(req.params['uid']!, Number(amount), note ?? 'Admin adjustment');
  res.json({ user: updated });
});

/* POST /api/admin/users/:uid/reset-password */
router.post('/admin/users/:uid/reset-password', (req, res) => {
  const { newPassword } = req.body as { newPassword?: string };
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ message: 'newPassword must be at least 6 characters.' });
    return;
  }
  const user = getUserByUid(req.params['uid']!);
  if (!user) { res.status(404).json({ message: 'User not found.' }); return; }
  updateUser(req.params['uid']!, { passwordHash: hashPassword(newPassword) });
  res.json({ ok: true });
});

/* DELETE /api/admin/users/:uid */
router.delete('/admin/users/:uid', (req, res) => {
  const ok = deleteUser(req.params['uid']!);
  if (!ok) { res.status(404).json({ message: 'User not found.' }); return; }
  res.json({ ok: true });
});

/* PATCH /api/admin/users/:uid/transactions/:txId — update transaction status */
router.patch('/admin/users/:uid/transactions/:txId', (req, res) => {
  const uid  = req.params['uid']!;
  const txId = req.params['txId']!;
  const { status } = req.body as { status?: string };

  if (!status || !['pending', 'completed', 'failed'].includes(status)) {
    res.status(400).json({ message: 'status must be pending, completed, or failed.' });
    return;
  }

  const user = getUserByUid(uid);
  if (!user) { res.status(404).json({ message: 'User not found.' }); return; }

  const tx = user.transactions.find(t => t.id === txId);
  if (!tx) { res.status(404).json({ message: 'Transaction not found.' }); return; }

  // Refund balance if a pending withdrawal is marked failed
  if (
    status === 'failed' &&
    (tx.type === 'withdraw' || tx.type === 'withdrawal') &&
    tx.status === 'pending'
  ) {
    creditUser(uid, tx.amount, `Withdrawal refunded (failed): ${tx.destination ?? tx.method ?? ''}`);
  }

  const result = updateUserTransaction(uid, txId, { status: status as 'pending' | 'completed' | 'failed' });
  if (!result) { res.status(404).json({ message: 'Transaction not found.' }); return; }

  res.json({ user: result.user, transaction: result.transaction });
});

export default router;
