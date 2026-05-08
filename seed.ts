import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');
  
  // Clear existing data (optional, be careful with production)
  // await prisma.user.deleteMany({});
  // await prisma.menuItem.deleteMany({});
  // await prisma.category.deleteMany({});
  // await prisma.restaurantTable.deleteMany({});

  const adminEmail = 'swetbalke2005@gmail.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: { name: 'Super Admin', email: adminEmail, role: 'ADMIN', passwordHash }
    });
    console.log('Admin user created.');
  }

  // Create Categories if they don't exist
  const categories = ['Starter', 'Main', 'Dessert', 'Beverage'];
  const catMap: Record<string, string> = {};

  for (const catName of categories) {
    let cat = await prisma.category.findFirst({ where: { name: catName } });
    if (!cat) {
      cat = await prisma.category.create({ data: { name: catName } });
    }
    catMap[catName] = cat.id;
  }
  console.log('Categories synced.');

  // Create Menu Items
  const menuItems = [
    { name: 'Truffle Mushroom Risotto', description: 'Creamy Arborio rice with black truffle oil and wild mushrooms.', price: 850, categoryName: 'Main', imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db378?w=800&q=80' },
    { name: 'Avocado Toast Deluxe', description: 'Sourdough bread with smashed avocado.', price: 450, categoryName: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80' },
    { name: 'Saffron Infused Salmon', description: 'Pan-seared salmon with saffron butter sauce.', price: 1200, categoryName: 'Main', imageUrl: 'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=800&q=80' }
  ];

  for (const item of menuItems) {
    const exists = await prisma.menuItem.findFirst({ where: { name: item.name } });
    if (!exists) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          categoryId: catMap[item.categoryName]
        }
      });
    }
  }
  console.log('Menu items synced.');

  // Create Tables
  const tableCount = await prisma.restaurantTable.count();
  if (tableCount === 0) {
    for (let i = 1; i <= 6; i++) {
      await prisma.restaurantTable.create({ data: { name: `Table ${i}`, capacity: 4 } });
    }
    console.log('Tables created.');
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
