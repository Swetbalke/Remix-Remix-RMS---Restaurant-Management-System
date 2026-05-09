import { Router } from 'express';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/env';

const router = Router();

const VALIDATE_EMAIL = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const VALIDATE_PASSWORD = (password: string): { valid: boolean; message: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  return { valid: true, message: '' };
};

router.post('/register', asyncHandler(async (req: any, res: any) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (!VALIDATE_EMAIL(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  const passwordValidation = VALIDATE_PASSWORD(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ error: passwordValidation.message });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters long' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const role = (normalizedEmail === 'swetbalke2005@gmail.com') ? 'ADMIN' : 'CUSTOMER';

  const user = await prisma.user.create({
    data: { name: name.trim(), email: normalizedEmail, role, passwordHash }
  });

  const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    accessToken,
    user: { id: user.id, name: user.name, role: user.role, email: user.email }
  });
}));

router.post('/login', asyncHandler(async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!VALIDATE_EMAIL(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(401).json({ error: 'Your account has been deactivated. Please contact support.' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    accessToken,
    user: { id: user.id, name: user.name, role: user.role, email: user.email }
  });
}));

router.post('/firebase', asyncHandler(async (req: any, res: any) => {
  const { email, name, uid } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required for Firebase authentication' });
  }

  if (!VALIDATE_EMAIL(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    const role = (normalizedEmail === 'swetbalke2005@gmail.com') ? 'ADMIN' : 'CUSTOMER';
    const passwordHash = await bcrypt.hash(uid || `firebase_${Date.now()}`, 10);
    user = await prisma.user.create({
      data: {
        name: name?.trim() || 'User',
        email: normalizedEmail,
        role,
        passwordHash
      }
    });
  }

  if (!user.isActive) {
    return res.status(401).json({ error: 'Your account has been deactivated. Please contact support.' });
  }

  const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    accessToken,
    user: { id: user.id, name: user.name, role: user.role, email: user.email }
  });
}));

export const authRouter = router;