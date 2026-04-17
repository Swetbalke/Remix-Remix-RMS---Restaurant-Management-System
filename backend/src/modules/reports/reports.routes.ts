import { Router } from 'express';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (req: any, res: any) => {
  const totalRevenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { paymentStatus: 'PAID' }
  });
  
  const totalOrders = await prisma.order.count();
  const activeOrders = await prisma.order.count({ where: { status: { not: 'COMPLETED' } } });
  
  // Very simplistic salesByDay logic given sqlite restrictions, or empty for now if complex.
  const salesByDay: any[] = [];
  
  res.json({
    revenue: totalRevenue._sum.totalAmount || 0,
    totalOrders,
    activeOrders,
    salesByDay
  });
}));

export const reportsRouter = router;
