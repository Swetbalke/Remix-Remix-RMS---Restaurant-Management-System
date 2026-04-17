import { Router } from 'express';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (req: any, res: any) => {
  const categories = await prisma.category.findMany({ include: { MenuItems: true } });
  res.json(categories);
}));

router.post('/', asyncHandler(async (req: any, res: any) => {
  const { name, description } = req.body;
  const category = await prisma.category.create({ data: { name, description } });
  res.status(201).json(category);
}));

router.patch('/:id', asyncHandler(async (req: any, res: any) => {
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(category);
}));

router.delete('/:id', asyncHandler(async (req: any, res: any) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

export const categoriesRouter = router;
