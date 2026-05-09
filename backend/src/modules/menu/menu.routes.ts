import { Router } from 'express';
import { prisma } from '../../config/db';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(async (req: any, res: any) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const category = req.query.category || '';

  const where: any = {};

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  if (category && category !== 'all') {
    where.categoryId = category;
  }

  const [menu, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      include: { category: true },
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    }),
    prisma.menuItem.count({ where })
  ]);

  res.json({
    items: menu,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + menu.length < total
    }
  });
}));

router.post('/', asyncHandler(async (req: any, res: any) => {
  const { name, description, price, categoryId, imageUrl } = req.body;

  if (!name || !price || !categoryId) {
    return res.status(400).json({ error: 'Name, price, and categoryId are required' });
  }

  if (price < 0) {
    return res.status(400).json({ error: 'Price must be positive' });
  }

  const item = await prisma.menuItem.create({
    data: { name, description, price, categoryId, imageUrl }
  });
  res.status(201).json(item);
}));

router.patch('/:id', asyncHandler(async (req: any, res: any) => {
  const { name, description, price, isAvailable, isVeg, imageUrl } = req.body;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) {
    if (price < 0) return res.status(400).json({ error: 'Price must be positive' });
    updateData.price = price;
  }
  if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
  if (isVeg !== undefined) updateData.isVeg = isVeg;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

  const item = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: updateData
  });
  res.json(item);
}));

router.delete('/:id', asyncHandler(async (req: any, res: any) => {
  await prisma.menuItem.delete({ where: { id: req.params.id } });
  res.status(204).send();
}));

export const menuRouter = router;