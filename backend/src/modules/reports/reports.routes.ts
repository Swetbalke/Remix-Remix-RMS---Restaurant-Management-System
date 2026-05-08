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
  const activeOrders = await prisma.order.count({ 
    where: { 
      status: { notIn: ['COMPLETED', 'CANCELLED'] } 
    } 
  });
  
  // Calculate Sales by Day (last 7 days)
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: lastWeek },
      paymentStatus: 'PAID'
    },
    select: {
      totalAmount: true,
      createdAt: true
    }
  });

  const salesMap: Record<string, number> = {};
  orders.forEach(order => {
    const day = order.createdAt.toISOString().split('T')[0];
    salesMap[day] = (salesMap[day] || 0) + order.totalAmount;
  });

  const salesByDay = Object.entries(salesMap).map(([day, revenue]) => ({
    _id: day,
    revenue
  })).sort((a, b) => a._id.localeCompare(b._id));

  // Top Selling Items
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: { paymentStatus: 'PAID' }
    },
    include: {
      menuItem: true
    }
  });

  const itemCounts: Record<string, { name: string, count: number }> = {};
  orderItems.forEach(oi => {
    const name = oi.menuItem.name;
    if (!itemCounts[name]) {
      itemCounts[name] = { name, count: 0 };
    }
    itemCounts[name].count += oi.quantity;
  });

  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  res.json({
    revenue: totalRevenue._sum.totalAmount || 0,
    totalOrders,
    activeOrders,
    salesByDay,
    topItems
  });
}));

export const reportsRouter = router;
