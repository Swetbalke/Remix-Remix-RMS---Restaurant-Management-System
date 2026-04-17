import { Router } from 'express';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (req: any, res: any) => {
  const menu = await prisma.menuItem.findMany({
    include: { category: true }
  });
  res.json(menu);
}));

router.post('/', asyncHandler(async (req: any, res: any) => {
  const item = await prisma.menuItem.create({ data: req.body });
  res.status(201).json(item);
}));

router.patch('/:id', asyncHandler(async (req: any, res: any) => {
  const item = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(item);
}));

router.delete('/:id', asyncHandler(async (req: any, res: any) => {
  await prisma.menuItem.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

export const menuRouter = router;
