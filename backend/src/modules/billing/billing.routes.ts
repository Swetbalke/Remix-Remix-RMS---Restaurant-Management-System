import { Router } from 'express';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Future Razorpay Implementation - Feature Flagged & Disabled
const isRazorpayEnabled = process.env.RAZORPAY_ENABLED === 'true';

router.post('/:id/create-razorpay-order', asyncHandler(async (req: any, res: any) => {
  if (!isRazorpayEnabled) {
    return res.status(501).json({ error: 'Razorpay integration is currently disabled' });
  }

  // Placeholder for future implementation:
  // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  // const order = await razorpay.orders.create({ amount: req.body.amount * 100, currency: 'INR' });
  res.status(501).json({ error: 'Not implemented' });
}));

router.get('/:id/bill', asyncHandler(async (req: any, res: any) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { OrderItems: { include: { menuItem: true } } }
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  
  res.json({
    orderId: order.id,
    subTotal: order.totalAmount,
    tax: order.totalAmount * 0.05, 
    grandTotal: order.totalAmount * 1.05
  });
}));

router.post('/:id/pay', asyncHandler(async (req: any, res: any) => {
  const { amount, method, transactionRef } = req.body;
  const payment = await prisma.payment.create({
    data: {
      orderId: req.params.id,
      amount,
      method,
      transactionRef
    }
  });

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { paymentStatus: 'PAID' }
  });

  res.json({ payment, order });
}));

export const billingRouter = router;
