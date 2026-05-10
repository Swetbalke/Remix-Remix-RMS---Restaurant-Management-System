import { Router } from 'express';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Category name mapping for FoodZone frontend compatibility
const CATEGORY_MAP: Record<string, string[]> = {
  'all': ['Breakfast', 'Burger', 'Pizza', 'Salad', 'Dessert', 'Drinks', 'Starter', 'Main', 'Beverage'],
  'breakfast': ['Breakfast'],
  'burger': ['Burger'],
  'pizza': ['Pizza'],
  'salad': ['Salad'],
  'dessert': ['Dessert'],
  'drinks': ['Drinks']
};

/**
 * GET /customer/menu
 * Query params: ?category=burger (optional, default = all)
 * Returns: JSON array of available menu items with FoodZone fields
 */
router.get('/customer/menu', asyncHandler(async (req: any, res: any) => {
  const { category } = req.query;
  
  const where: any = { isAvailable: true };
  
  if (category && category !== 'all') {
    const matchedCategories = CATEGORY_MAP[category.toLowerCase()];
    if (matchedCategories) {
      where.category = { name: { in: matchedCategories } };
    } else {
      // Try direct match as fallback
      where.category = { name: { equals: category.toLowerCase(), mode: 'insensitive' } };
    }
  }

  const items = await prisma.menuItem.findMany({
    where,
    include: { category: true },
    orderBy: { rating: 'desc' }
  });

  const formattedItems = items.map(item => ({
    _id: item.id,
    name: item.name,
    category: item.category.name.toLowerCase(),
    emoji: item.emoji || '🍽',
    description: item.description,
    price: item.price,
    rating: item.rating || 4.0,
    reviewCount: item.reviewCount || 0,
    prepTime: item.prepTime || '20 mins',
    tag: item.tag || item.category.name,
    nutrition: item.nutrition || [],
    sideOptions: item.sideOptions || [],
    isAvailable: item.isAvailable,
    isVeg: item.isVeg
  }));

  res.json({ success: true, count: formattedItems.length, items: formattedItems });
}));

/**
 * GET /api/customer/menu/search
 * Query params: ?q=burger
 */
router.get('/customer/menu/search', asyncHandler(async (req: any, res: any) => {
  const { q } = req.query;
  
  if (!q || q.trim() === '') {
    return res.json({ success: true, count: 0, items: [] });
  }

  const items = await prisma.menuItem.findMany({
    where: {
      isAvailable: true,
      name: { contains: q.trim(), mode: 'insensitive' }
    },
    include: { category: true }
  });

  const formattedItems = items.map(item => ({
    _id: item.id,
    name: item.name,
    category: item.category.name.toLowerCase(),
    emoji: item.emoji || '🍽',
    description: item.description,
    price: item.price,
    rating: item.rating || 4.0,
    reviewCount: item.reviewCount || 0,
    prepTime: item.prepTime || '20 mins',
    tag: item.tag || item.category.name,
    nutrition: item.nutrition || [],
    sideOptions: item.sideOptions || [],
    isAvailable: item.isAvailable
  }));

  res.json({ success: true, count: formattedItems.length, items: formattedItems });
}));

/**
 * GET /api/customer/menu/:id
 * Single item detail
 */
router.get('/customer/menu/:id', asyncHandler(async (req: any, res: any) => {
  const item = await prisma.menuItem.findUnique({
    where: { id: req.params.id },
    include: { category: true }
  });

  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  res.json({
    success: true,
    item: {
      _id: item.id,
      name: item.name,
      category: item.category.name,
      emoji: item.emoji || '🍽',
      description: item.description,
      price: item.price,
      rating: item.rating || 4.0,
      reviewCount: item.reviewCount || 0,
      prepTime: item.prepTime || '20 mins',
      tag: item.tag || item.category.name,
      nutrition: item.nutrition || [],
      sideOptions: item.sideOptions || [],
      isAvailable: item.isAvailable,
      isVeg: item.isVeg
    }
  });
}));

/**
 * POST /api/customer/orders
 * Place a customer order
 * Body: { tableNumber, items: [{menuItemId, quantity, selectedSides}], totalAmount }
 */
router.post('/customer/orders', asyncHandler(async (req: any, res: any) => {
  const { tableNumber, items, totalAmount } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Items required' });
  }

  if (!tableNumber) {
    return res.status(400).json({ success: false, message: 'Table number required' });
  }

  // Create order with items
  const order = await prisma.order.create({
    data: {
      tableId: null, // Will be set if table exists
      status: 'PENDING',
      orderType: 'DINEIN',
      totalAmount: totalAmount || 0,
      paymentStatus: 'UNPAID',
      OrderItems: {
        create: items.map((item: any) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity || 1,
          unitPrice: item.price || 0,
          modifiers: item.selectedSides ? JSON.stringify(item.selectedSides) : null
        }))
      }
    },
    include: {
      OrderItems: {
        include: { menuItem: true }
      }
    }
  });

  res.status(201).json({ 
    success: true, 
    orderId: order.id, 
    message: 'Order placed successfully!',
    order 
  });
}));

export const customerRouter = router;