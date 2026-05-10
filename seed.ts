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

  // Create Categories - FoodZone compatible
  const categories = [
    { name: 'Breakfast', emoji: '🍳' },
    { name: 'Burger', emoji: '🍔' },
    { name: 'Pizza', emoji: '🍕' },
    { name: 'Salad', emoji: '🥗' },
    { name: 'Dessert', emoji: '🧁' },
    { name: 'Drinks', emoji: '🥤' }
  ];
  const catMap: Record<string, string> = {};

  for (const cat of categories) {
    const created = await prisma.category.create({ data: { name: cat.name, emoji: cat.emoji } });
    catMap[cat.name] = created.id;
    console.log(`Category created: ${cat.name}`);
  }

  // Also add legacy categories for admin use
  const legacyCategories = ['Starter', 'Main', 'Beverage'];
  for (const catName of legacyCategories) {
    const existing = await prisma.category.findFirst({ where: { name: catName } });
    if (!existing) {
      await prisma.category.create({ data: { name: catName } });
    }
  }

  // Create Menu Items - FoodZone compatible with emojis
  const menuItems = [
    // Breakfast
    { name: 'Avocado Toast', description: 'Sourdough bread with smashed avocado, cherry tomatoes, microgreens, and poached egg.', price: 450, categoryName: 'Breakfast', emoji: '🥑', rating: 4.5, prepTime: '15 mins', tag: 'Healthy' },
    { name: 'Pancake Stack', description: 'Fluffy buttermilk pancakes with maple syrup and fresh berries.', price: 380, categoryName: 'Breakfast', emoji: '🥞', rating: 4.7, prepTime: '20 mins', tag: 'Popular' },
    { name: 'Omelette Supreme', description: 'Three-egg omelette with cheese, mushrooms, and herbs.', price: 320, categoryName: 'Breakfast', emoji: '🍳', rating: 4.3, prepTime: '12 mins', tag: 'Protein' },
    { name: 'French Toast', description: 'Golden brioche French toast with cinnamon and vanilla.', price: 350, categoryName: 'Breakfast', emoji: '🍞', rating: 4.4, prepTime: '15 mins', tag: 'Sweet' },

    // Burger
    { name: 'Classic Cheeseburger', description: 'Juicy beef patty with cheddar, lettuce, tomato, and special sauce.', price: 450, categoryName: 'Burger', emoji: '🍔', rating: 4.6, prepTime: '18 mins', tag: 'Bestseller' },
    { name: 'Double Decker', description: 'Two beef patties, double cheese, bacon, and crispy onions.', price: 650, categoryName: 'Burger', emoji: '🍔', rating: 4.8, prepTime: '22 mins', tag: 'Popular' },
    { name: 'Chicken Burger', description: 'Crispy chicken fillet with mayo, lettuce, and tomato.', price: 380, categoryName: 'Burger', emoji: '🍔', rating: 4.4, prepTime: '15 mins', tag: 'Chicken' },
    { name: 'Veggie Burger', description: 'Plant-based patty with avocado and fresh vegetables.', price: 420, categoryName: 'Burger', emoji: '🍔', rating: 4.2, prepTime: '18 mins', tag: 'Veg' },

    // Pizza
    { name: 'Margherita Pizza', description: 'Classic tomato sauce, mozzarella, and fresh basil.', price: 550, categoryName: 'Pizza', emoji: '🍕', rating: 4.7, prepTime: '25 mins', tag: 'Classic' },
    { name: 'Pepperoni Supreme', description: 'Loaded with pepperoni, extra cheese, and herbs.', price: 650, categoryName: 'Pizza', emoji: '🍕', rating: 4.8, prepTime: '25 mins', tag: 'Popular' },
    { name: 'Chicken Tikka Pizza', description: 'Indian-inspired pizza with tandoori chicken and paneer.', price: 600, categoryName: 'Pizza', emoji: '🍕', rating: 4.6, prepTime: '28 mins', tag: 'Fusion' },
    { name: 'Veggie Delight', description: 'Bell peppers, olives, corn, and mushrooms.', price: 500, categoryName: 'Pizza', emoji: '🍕', rating: 4.3, prepTime: '22 mins', tag: 'Veg' },

    // Salad
    { name: 'Caesar Salad', description: 'Crisp romaine, croutons, parmesan, and Caesar dressing.', price: 350, categoryName: 'Salad', emoji: '🥗', rating: 4.5, prepTime: '10 mins', tag: 'Healthy' },
    { name: 'Greek Salad', description: 'Cucumber, tomatoes, feta, olives, and olive oil.', price: 320, categoryName: 'Salad', emoji: '🥗', rating: 4.4, prepTime: '10 mins', tag: 'Fresh' },
    { name: 'Chicken Salad', description: 'Grilled chicken, mixed greens, and honey mustard dressing.', price: 450, categoryName: 'Salad', emoji: '🥗', rating: 4.6, prepTime: '15 mins', tag: 'Protein' },
    { name: 'Fruit Bowl', description: 'Seasonal fresh fruits with honey and yogurt.', price: 280, categoryName: 'Salad', emoji: '🍓', rating: 4.2, prepTime: '8 mins', tag: 'Light' },

    // Dessert
    { name: 'Tiramisu', description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream.', price: 380, categoryName: 'Dessert', emoji: '🍰', rating: 4.8, prepTime: '5 mins', tag: 'Popular' },
    { name: 'Chocolate Lava Cake', description: 'Warm chocolate fondant with molten center, served with vanilla ice cream.', price: 420, categoryName: 'Dessert', emoji: '🍫', rating: 4.9, prepTime: '15 mins', tag: 'Bestseller' },
    { name: 'Ice Cream Sundae', description: 'Three scoops with chocolate sauce, nuts, and cherry.', price: 280, categoryName: 'Dessert', emoji: '🍨', rating: 4.5, prepTime: '5 mins', tag: 'Sweet' },
    { name: 'Gulab Jamun', description: 'Golden fried milk dumplings in rose-cardamom syrup.', price: 180, categoryName: 'Dessert', emoji: '🧁', rating: 4.7, prepTime: '5 mins', tag: 'Indian' },

    // Drinks
    { name: 'Fresh Lime Soda', description: 'Refreshing lime with soda water and mint leaves.', price: 120, categoryName: 'Drinks', emoji: '🍋', rating: 4.3, prepTime: '3 mins', tag: 'Refreshing' },
    { name: 'Mango Lassi', description: 'Thick creamy mango yogurt smoothie with cardamom.', price: 180, categoryName: 'Drinks', emoji: '🥭', rating: 4.6, prepTime: '5 mins', tag: 'Popular' },
    { name: 'Masala Chai', description: 'Traditional spiced Indian tea with milk and ginger.', price: 80, categoryName: 'Drinks', emoji: '☕', rating: 4.5, prepTime: '5 mins', tag: 'Hot' },
    { name: 'Cold Brew Coffee', description: '24-hour steeped cold brew with ice.', price: 220, categoryName: 'Drinks', emoji: '☕', rating: 4.4, prepTime: '3 mins', tag: 'Coffee' },
    { name: 'Virgin Mojito', description: 'Fresh mint, lime, sugar, and soda with crushed ice.', price: 200, categoryName: 'Drinks', emoji: '🍹', rating: 4.5, prepTime: '5 mins', tag: 'Mocktail' },
    { name: 'Chocolate Shake', description: 'Rich chocolate milkshake with whipped cream.', price: 250, categoryName: 'Drinks', emoji: '🥤', rating: 4.7, prepTime: '5 mins', tag: 'Sweet' }
  ];

  for (const item of menuItems) {
    const categoryId = catMap[item.categoryName];
    if (!categoryId) {
      console.log(`Skipping ${item.name} - category not found: ${item.categoryName}`);
      continue;
    }
    await prisma.menuItem.create({
      data: {
        name: item.name,
        description: item.description,
        price: item.price,
        emoji: item.emoji,
        rating: item.rating || 4.0,
        prepTime: item.prepTime || '20 mins',
        tag: item.tag || item.categoryName,
        categoryId,
        isAvailable: true,
        isVeg: true
      }
    });
    console.log(`Menu item created: ${item.name} (${item.emoji})`);
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