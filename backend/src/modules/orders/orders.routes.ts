import { Router } from 'express';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.post('/', asyncHandler(async (req: any, res: any) => {
  const { tableId, items, total, paymentMethod } = req.body;
  
  // Note: Here we could add stock checking logic if needed
  
  // Logic: if paymentMethod is UPI or CARD (simulated), we can immediately mark it UNPAID but then we should call the pay endpoint, or mark it PAID if the dummy flow specifies it. Let's start with UNPAID.
  
  let tableConnect;
  if (tableId) {
    const tableExists = await prisma.restaurantTable.findUnique({ where: { id: tableId }});
    if (tableExists) tableConnect = { connect: { id: tableId } };
  }

  const validItems = items.filter((item: any) => item.menuItemId || item.id);
  if (validItems.length === 0) {
    return res.status(400).json({ error: 'No valid items provided' });
  }

  const order = await prisma.order.create({
    data: {
      totalAmount: Number(total) || 0,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      table: tableConnect,
      OrderItems: {
        create: validItems.map((item: any) => ({
          menuItemId: String(item.menuItemId || item.id),
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.price || item.unitPrice || 0)
        }))
      }
    },
    include: { OrderItems: true, table: true }
  });
  
  res.status(201).json(order);
}));

router.get('/', asyncHandler(async (req: any, res: any) => {
  const orders = await prisma.order.findMany({
    include: { OrderItems: { include: { menuItem: true } } },
    orderBy: { createdAt: 'desc' }
  });
  // Remap OrderItems to `items` for frontend compatibility, and format status
  const formattedOrders = orders.map(o => ({
    ...o,
    status: o.status.toLowerCase(),
    paymentStatus: o.paymentStatus.toLowerCase(),
    items: o.OrderItems.map(oi => ({
      ...oi,
      name: oi.menuItem.name,
      price: oi.unitPrice
    }))
  }));
  res.json(formattedOrders);
}));

router.get('/:id', asyncHandler(async (req: any, res: any) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { OrderItems: { include: { menuItem: true } } }
  });
  if (!order) return res.status(404).json({ error: 'Not found' });
  
  res.json({
    ...order,
    status: order.status.toLowerCase(),
    paymentStatus: order.paymentStatus.toLowerCase(),
    items: order.OrderItems.map(oi => ({
      ...oi,
      name: oi.menuItem.name,
      price: oi.unitPrice
    }))
  });
}));

router.patch('/:id', asyncHandler(async (req: any, res: any) => {
  const { status, paymentStatus } = req.body;
  const updateData: any = {};
  if (status) updateData.status = String(status).toUpperCase();
  if (paymentStatus) updateData.paymentStatus = String(paymentStatus).toUpperCase();
  
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: updateData,
    include: { OrderItems: { include: { menuItem: true } } }
  });

  res.json({
    ...order,
    status: order.status.toLowerCase(),
    paymentStatus: order.paymentStatus.toLowerCase(),
    items: order.OrderItems.map(oi => ({
      ...oi,
      name: oi.menuItem.name,
      price: oi.unitPrice
    }))
  });
}));

export const ordersRouter = router;
