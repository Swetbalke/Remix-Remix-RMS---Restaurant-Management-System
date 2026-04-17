import { Router } from 'express';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (req: any, res: any) => {
  const tables = await prisma.restaurantTable.findMany();
  res.json(tables);
}));

router.post('/', asyncHandler(async (req: any, res: any) => {
  const table = await prisma.restaurantTable.create({ data: req.body });
  res.status(201).json(table);
}));

router.patch('/:id', asyncHandler(async (req: any, res: any) => {
  const table = await prisma.restaurantTable.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(table);
}));

router.patch('/:id/status', asyncHandler(async (req: any, res: any) => {
  const table = await prisma.restaurantTable.update({
    where: { id: req.params.id },
    data: { status: req.body.status }
  });
  res.json(table);
}));

export const tablesRouter = router;
