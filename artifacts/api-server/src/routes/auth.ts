import { Router, type IRouter } from 'express';
import {
  getUserByEmail,
  createUser,
  hashPassword,
  updateUser,
  touchLogin,
  getUserByUid,
} from '../lib/userStore.js';
import { signToken } from '../lib/jwtAuth.js';

const router: IRouter = Router();

/* POST /api/auth/register */
router.post('/auth/register', (req, res) => {
  const { uid, name, email, password, phone, dob } = req.body as Record<string, string>;

  // Input validation
  if (!uid || !name || !email || !password) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ message: 'Invalid email address.' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ message: 'Password must be at least 6 characters.' });
    return;
  }
  if (name.trim().length < 2) {
    res.status(400).json({ message: 'Name must be at least 2 characters.' });
    return;
  }

  const existing = getUserByEmail(email);
  if (existing) {
    // Idempotent — return ok + new token if same uid (re-register after refresh)
    if (existing.uid === uid) {
      const token = signToken({ uid: existing.uid, name: existing.name, email: existing.email });
      res.json({ ok: true, token, uid: existing.uid, name: existing.name, email: existing.email });
      return;
    }
    res.status(409).json({ message: 'Email already registered.' });
    return;
  }

  const user = createUser({ uid, name: name.trim(), email: email.trim().toLowerCase(), password, phone: phone ?? '', dob: dob ?? '' });
  const token = signToken({ uid: user.uid, name: user.name, email: user.email });
  res.status(201).json({ ok: true, token, uid: user.uid, name: user.name, email: user.email });
});

/* POST /api/auth/login */
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body as Record<string, string>;
  if (!email || !password) {
    res.status(400).json({ message: 'Missing email or password.' });
    return;
  }

  const user = getUserByEmail(email);
  if (!user) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }
  if (user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ message: 'Invalid email or password.' });
    return;
  }
  if (user.status === 'suspended') {
    res.status(403).json({ message: 'Account suspended. Contact support.' });
    return;
  }

  touchLogin(user.uid);
  const token = signToken({ uid: user.uid, name: user.name, email: user.email });
  res.json({ ok: true, token, uid: user.uid, name: user.name, email: user.email });
});

/* POST /api/auth/change-password */
router.post('/auth/change-password', (req, res) => {
  const { uid, currentPassword, newPassword } = req.body as Record<string, string>;
  if (!uid || !currentPassword || !newPassword) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }
  const user = getUserByUid(uid);
  if (!user) { res.status(404).json({ message: 'User not found.' }); return; }
  if (user.passwordHash !== hashPassword(currentPassword)) {
    res.status(401).json({ message: 'Current password is incorrect.' });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ message: 'New password must be at least 6 characters.' });
    return;
  }
  updateUser(uid, { passwordHash: hashPassword(newPassword) });
  res.json({ ok: true });
});

export default router;
