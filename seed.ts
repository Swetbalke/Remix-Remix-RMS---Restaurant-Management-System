import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  const adminEmail = 'swetbalke2005@gmail.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: { name: 'Super Admin', email: adminEmail, role: 'ADMIN', passwordHash }
    });
    console.log('Admin user created.');
  } else {
    console.log('Admin user already exists.');
  }

  // Clear existing menu items and categories to prevent duplicates
  console.log('Clearing existing menu items...');
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});

  // Create Categories
  const categories = ['Starter', 'Main', 'Dessert', 'Beverage'];
  const catMap: Record<string, string> = {};

  for (const catName of categories) {
    const cat = await prisma.category.create({ data: { name: catName } });
    catMap[catName] = cat.id;
    console.log(`Category created: ${catName}`);
  }

  // Create Menu Items - Use only valid Unsplash URLs
  const menuItems = [
    // Starters
    { name: 'Avocado Toast Deluxe', description: 'Sourdough bread with smashed avocado, cherry tomatoes, microgreens, and poached egg.', price: 450, categoryName: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80' },
    { name: 'Crispy Calamari Rings', description: 'Golden fried calamari with spicy aioli and lemon wedge.', price: 380, categoryName: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80' },
    { name: 'Bruschetta Trio', description: 'Toasted ciabatta with tomato basil, mushroom, and olive tapenade.', price: 320, categoryName: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&q=80' },
    { name: 'Soup of the Day', description: 'Chef special soup served with artisan bread. Ask your server for today\'s choice.', price: 280, categoryName: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80' },

    // Main Course
    { name: 'Truffle Mushroom Risotto', description: 'Creamy Arborio rice with black truffle oil, wild mushrooms, and aged parmesan.', price: 850, categoryName: 'Main', imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db378?w=800&q=80' },
    { name: 'Saffron Infused Salmon', description: 'Pan-seared Atlantic salmon with saffron butter sauce, asparagus, and roasted potatoes.', price: 1200, categoryName: 'Main', imageUrl: 'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=800&q=80' },
    { name: 'Wagyu Beef Steak', description: 'Premium A5 Wagyu beef with red wine reduction, grilled vegetables, and truffle mash.', price: 2500, categoryName: 'Main', imageUrl: 'https://images.unsplash.com/photo-1546833998-877b37c1e5e6?w=800&q=80' },
    { name: 'Chicken Parmesan', description: 'Breaded chicken breast with marinara, mozzarella, served with spaghetti.', price: 650, categoryName: 'Main', imageUrl: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca16e?w=800&q=80' },
    { name: 'Paneer Tikka Masala', description: 'Grilled paneer cubes in rich tomato gravy with bell peppers and onions.', price: 550, categoryName: 'Main', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80' },
    { name: 'Classic Butter Chicken', description: 'Tandoori chicken in creamy tomato makhani sauce with basmati rice.', price: 580, categoryName: 'Main', imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82a2b5f07?w=800&q=80' },
    { name: 'Vegetable Biryani', description: 'Fragrant basmati rice layered with seasonal vegetables, saffron, and raita.', price: 420, categoryName: 'Main', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80' },
    { name: 'Lamb Rogan Josh', description: 'Slow-cooked lamb in aromatic Kashmiri spices with naan bread.', price: 750, categoryName: 'Main', imageUrl: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=800&q=80' },

    // Desserts
    { name: 'Tiramisu', description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream.', price: 380, categoryName: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80' },
    { name: 'Chocolate Lava Cake', description: 'Warm chocolate fondant with molten center, served with vanilla ice cream.', price: 420, categoryName: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80' },
    { name: 'Crème Brûlée', description: 'Silky vanilla custard with caramelized sugar crust.', price: 350, categoryName: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&q=80' },
    { name: 'Gulab Jamun', description: 'Golden fried milk dumplings in rose-cardamom syrup with pistachios.', price: 280, categoryName: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1666190077568-1f4bb1e8e9f0?w=800&q=80' },

    // Beverages
    { name: 'Fresh Lime Soda', description: 'Refreshing lime with soda water, mint leaves.', price: 120, categoryName: 'Beverage', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c19728bc?w=800&q=80' },
    { name: 'Mango Lassi', description: 'Thick creamy mango yogurt smoothie with cardamom.', price: 180, categoryName: 'Beverage', imageUrl: 'https://images.unsplash.com/photo-1626200419199-391d4c7a7d1e?w=800&q=80' },
    { name: 'Masala Chai', description: 'Traditional spiced Indian tea with milk and ginger.', price: 80, categoryName: 'Beverage', imageUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80' },
    { name: 'Cold Brew Coffee', description: '24-hour steeped cold brew with ice.', price: 220, categoryName: 'Beverage', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80' },
    { name: 'Rose Sharbat', description: 'Chilled rose syrup with sabja seeds, lemon, and ice.', price: 150, categoryName: 'Beverage', imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80' },
    { name: 'Virgin Mojito', description: 'Fresh mint, lime, sugar, and soda with crushed ice.', price: 200, categoryName: 'Beverage', imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80' }
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: {
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        categoryId: catMap[item.categoryName],
        isAvailable: true,
        isVeg: true
      }
    });
    console.log(`Menu item created: ${item.name}`);
  }

  // Create Tables
  const tableCount = await prisma.restaurantTable.count();
  if (tableCount === 0) {
    for (let i = 1; i <= 6; i++) {
      await prisma.restaurantTable.create({ data: { name: `Table ${i}`, capacity: 4 } });
    }
    console.log('Tables created.');
  }

  console.log('=== SEEDING COMPLETED SUCCESSFULLY ===');
  console.log(`Total Categories: ${categories.length}`);
  console.log(`Total Menu Items: ${menuItems.length}`);
  console.log(`Total Tables: 6`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });