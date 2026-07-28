import { Router, type IRouter, type Request, type Response, type NextFunction } from 'express';
import { createSubmission, getAllSubmissions, getSubmission, updateSubmission } from '../lib/giftCardStore.js';
import { getUserByUid, creditUser } from '../lib/userStore.js';
import { requireAuth } from '../lib/jwtAuth.js';
import { ADMIN_SECRET } from '../lib/adminSecret.js';

const router: IRouter = Router();

function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-admin-key'] as string | undefined;
  if (!key || key !== ADMIN_SECRET) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }
  next();
}

/* ── User: submit a gift card (authenticated) ─────────────────────────────── */
router.post('/gift-cards', requireAuth, (req, res) => {
  const { uid, cardType, cardLabel, amount, code, images } = req.body as {
    uid?: string;
    cardType?: string;
    cardLabel?: string;
    amount?: number;
    code?: string;
    images?: string[];
  };

  // uid in body must match the authenticated user
  if (!uid || uid !== req.jwtUser?.uid) {
    res.status(403).json({ message: 'Forbidden.' });
    return;
  }
  if (!cardType || !cardLabel || !amount || !images?.length) {
    res.status(400).json({ message: 'cardType, cardLabel, amount and at least one image are required.' });
    return;
  }
  if (isNaN(Number(amount)) || Number(amount) <= 0 || Number(amount) > 10_000) {
    res.status(400).json({ message: 'amount must be a positive number up to $10,000.' });
    return;
  }
  if (images.length > 2) {
    res.status(400).json({ message: 'Maximum 2 images allowed.' });
    return;
  }

  const user = getUserByUid(uid);
  if (!user) {
    res.status(404).json({ message: 'User not found.' });
    return;
  }

  const sub = createSubmission({
    uid,
    userName:  user.name,
    userTag:   user.investxtag,
    cardType,
    cardLabel: String(cardLabel).slice(0, 100),
    amount:    Number(amount),
    code:      code ? String(code).slice(0, 100) : undefined,
    images,
  });

  res.status(201).json({ submission: sub });
});

/* ── Admin: list all submissions ─────────────────────────────────────────── */
router.get('/admin/gift-cards', adminAuth, (_req, res) => {
  res.json({ submissions: getAllSubmissions() });
});

/* ── Admin: approve or reject ────────────────────────────────────────────── */
router.patch('/admin/gift-cards/:id', adminAuth, (req, res) => {
  const { id } = req.params as { id: string };
  const { status, reviewNote } = req.body as { status?: string; reviewNote?: string };

  if (!status || !['approved', 'rejected'].includes(status)) {
    res.status(400).json({ message: 'status must be "approved" or "rejected".' });
    return;
  }

  const sub = getSubmission(id);
  if (!sub) { res.status(404).json({ message: 'Submission not found.' }); return; }
  if (sub.status !== 'pending') {
    res.status(409).json({ message: 'This submission has already been reviewed.' });
    return;
  }

  const updated = updateSubmission(id, {
    status: status as 'approved' | 'rejected',
    reviewedAt: new Date().toISOString(),
    reviewNote: reviewNote ? String(reviewNote).slice(0, 500) : undefined,
  });

  if (status === 'approved') {
    creditUser(sub.uid, sub.amount, `Gift card approved: ${sub.cardLabel} ($${sub.amount})`);
  }

  res.json({ submission: updated });
});

export default router;
