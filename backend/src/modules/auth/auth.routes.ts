import { Router } from 'express';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/env';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', asyncHandler(async (req: any, res: any) => {
  const { name, email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Assign role based on email, default to CUSTOMER if that existed, or WAITER for now.
  // Wait, what roles are available? WAITER, MANAGER, CHEF, ADMIN, admin. Let's make swetbalke2005@gmail.com ADMIN
  const role = (email === 'swetbalke2005@gmail.com') ? 'ADMIN' : 'EMPLOYEE';

  const user = await prisma.user.create({
    data: { name, email, role: role as any, passwordHash }
  });
  
  const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.status(201).json({ accessToken, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
}));

router.post('/login', asyncHandler(async (req: any, res: any) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials or inactive' });
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ accessToken, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
}));

router.post('/firebase', asyncHandler(async (req: any, res: any) => {
  const { email, name, uid } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    const role = (email === 'swetbalke2005@gmail.com') ? 'ADMIN' : 'EMPLOYEE';
    const passwordHash = await bcrypt.hash(uid, 10); // Dummy hash using uid
    user = await prisma.user.create({
      data: { name: name || 'User', email, role, passwordHash }
    });
  }

  const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ accessToken, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
}));

export const authRouter = router;
