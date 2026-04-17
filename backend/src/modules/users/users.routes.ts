import { Router } from 'express';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (req: any, res: any) => {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true }});
  res.json(users);
}));

router.post('/', asyncHandler(async (req: any, res: any) => {
  const { email, name, role } = req.body;
  const user = await prisma.user.create({ data: { email, name, role, passwordHash: 'test' }}); // using 'test' as placeholder for direct signup
  res.status(201).json(user);
}));

router.delete('/:id', asyncHandler(async (req: any, res: any) => {
  await prisma.user.delete({ where: { id: req.params.id }});
  res.status(204).send();
}));

export const usersRouter = router;
