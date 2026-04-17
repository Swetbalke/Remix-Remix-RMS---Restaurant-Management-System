import { Router } from 'express';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (req: any, res: any) => {
  // Returns menu items for inventory management matching old logic
  const items = await prisma.menuItem.findMany({
    select: { id: true, name: true, category: true, isAvailable: true }
  });
  // Transform to match old struct slightly
  const formatted = items.map((i: any) => ({
    id: i.id,
    name: i.name,
    category: i.category?.name || 'Category',
    available: i.isAvailable,
    stock: 999 // placeholder since ingredient tracking replaces direct stock
  }));
  res.json(formatted);
}));

export const inventoryRouter = router;
