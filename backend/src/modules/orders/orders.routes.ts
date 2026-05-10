import { Router } from 'express';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.post('/', asyncHandler(async (req: any, res: any) => {
  const { tableId, userId, items, total, paymentMethod } = req.body;
  
  let tableConnect;
  if (tableId && tableId.length === 24) {
    try {
      const tableExists = await prisma.restaurantTable.findUnique({ where: { id: tableId }});
      if (tableExists) tableConnect = { connect: { id: tableId } };
    } catch (e) {
      console.warn("Invalid tableId format ignored:", tableId);
    }
  }

  let userConnect;
  if (userId && userId.length === 24) {
    try {
      const userExists = await prisma.user.findUnique({ where: { id: userId }});
      if (userExists) userConnect = { connect: { id: userId } };
    } catch (e) {
      console.warn("Invalid userId format ignored:", userId);
    }
  }

  const validItems = Array.isArray(items) ? items.filter((item: any) => (item.menuItemId || item.id)) : [];
  if (validItems.length === 0) {
    return res.status(400).json({ error: 'No valid items provided' });
  }

  try {
    const order = await prisma.order.create({
      data: {
        totalAmount: Number(total) || 0,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        table: tableConnect,
        user: userConnect,
        OrderItems: {
          create: validItems.map((item: any) => ({
            menuItem: { connect: { id: String(item.menuItemId || item.id) } },
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.price || item.unitPrice || 0)
          }))
        }
      },
      include: { 
        OrderItems: { include: { menuItem: true } }, 
        table: true 
      }
    });

    const formattedOrder = {
      ...order,
      status: order.status.toLowerCase(),
      paymentStatus: order.paymentStatus.toLowerCase(),
      tableNumber: order.table?.name || 'Takeaway',
      items: order.OrderItems.map(oi => ({
        ...oi,
        name: oi.menuItem.name,
        price: oi.unitPrice
      }))
    };
    
    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit('new-order', formattedOrder);
    }

    res.status(201).json(formattedOrder);
  } catch (err: any) {
    console.error("Order Creation Error:", err);
    res.status(500).json({ error: 'Failed to create order in database. Ensure all items exist.' });
  }
}));

router.get('/', asyncHandler(async (req: any, res: any) => {
  const { userId } = req.query;
  const where: any = {};
  if (userId) where.userId = userId;

  const orders = await prisma.order.findMany({
    where,
    include: { 
      OrderItems: { include: { menuItem: true } },
      table: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const formattedOrders = orders.map(o => ({
    ...o,
    status: o.status.toLowerCase(),
    paymentStatus: o.paymentStatus.toLowerCase(),
    tableNumber: o.table?.name || 'Takeaway',
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
    include: { 
      OrderItems: { include: { menuItem: true } },
      table: true
    }
  });
  if (!order) return res.status(404).json({ error: 'Not found' });
  
  res.json({
    ...order,
    status: order.status.toLowerCase(),
    paymentStatus: order.paymentStatus.toLowerCase(),
    tableNumber: order.table?.name || 'Takeaway',
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
    include: { 
      OrderItems: { include: { menuItem: true } },
      table: true
    }
  });

  const formattedOrder = {
    ...order,
    status: order.status.toLowerCase(),
    paymentStatus: order.paymentStatus.toLowerCase(),
    tableNumber: order.table?.name || 'Takeaway',
    items: order.OrderItems.map(oi => ({
      ...oi,
      name: oi.menuItem.name,
      price: oi.unitPrice
    }))
  };

  if (req.io) {
    req.io.emit('order-updated', formattedOrder);
  }

  res.json(formattedOrder);
}));

export const ordersRouter = router;
