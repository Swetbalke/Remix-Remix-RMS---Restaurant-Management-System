import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.restaurantTable.deleteMany({});

  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: { name: 'Super Admin', email: 'swetbalke2005@gmail.com', role: 'ADMIN', passwordHash }
  });

  const catStarter = await prisma.category.create({ data: { name: 'Starter' } });
  const catMain = await prisma.category.create({ data: { name: 'Main' } });
  const catDessert = await prisma.category.create({ data: { name: 'Dessert' } });
  const catBeverage = await prisma.category.create({ data: { name: 'Beverage' } });

  await prisma.menuItem.create({ data: { name: 'Truffle Mushroom Risotto', description: 'Creamy Arborio rice with black truffle oil and wild mushrooms.', price: 850, categoryId: catMain.id, imageUrl: 'https://picsum.photos/seed/risotto/800/600' }});
  await prisma.menuItem.create({ data: { name: 'Avocado Toast Deluxe', description: 'Sourdough bread with smashed avocado.', price: 450, categoryId: catStarter.id, imageUrl: 'https://picsum.photos/seed/avocado/800/600' }});
  await prisma.menuItem.create({ data: { name: 'Saffron Infused Salmon', description: 'Pan-seared salmon with saffron butter sauce.', price: 1200, categoryId: catMain.id, imageUrl: 'https://picsum.photos/seed/salmon/800/600' }});

  for (let i = 1; i <= 6; i++) {
    await prisma.restaurantTable.create({ data: { id: String(i), name: `Table ${i}`, capacity: 4 } });
  }

  console.log('Seeded successfully with Prisma!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
