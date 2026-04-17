import { Router } from 'express';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/orders', asyncHandler(async (req: any, res: any) => {
  const orders = await prisma.order.findMany({
    where: { status: { in: ['PENDING', 'CONFIRMED'] } },
    include: { OrderItems: { include: { menuItem: true } }, table: true },
    orderBy: { createdAt: 'asc' }
  });
  res.json(orders);
}));

router.patch('/orders/:id/status', asyncHandler(async (req: any, res: any) => {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: req.body.status }
  });
  res.json(order);
}));

export const kitchenRouter = router;
