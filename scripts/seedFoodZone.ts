import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FOODZONE_CATEGORIES = [
  { name: 'breakfast', description: 'Morning meals' },
  { name: 'burger', description: 'Delicious burgers' },
  { name: 'pizza', description: 'Italian pizzas' },
  { name: 'salad', description: 'Fresh salads' },
  { name: 'dessert', description: 'Sweet treats' },
  { name: 'drinks', description: 'Refreshing beverages' }
];

const FOODZONE_ITEMS = [
  {
    name: 'Big Zone Burger',
    category: 'burger',
    emoji: '🍔',
    description: 'Dive into the ultimate burger experience. A premium, hand-crafted beef patty that is flame-grilled to perfection, sealing in all its natural juices and flavours. Topped with fresh lettuce, tomato, and our secret sauce.',
    price: 135,
    rating: 4.5,
    reviewCount: 233,
    prepTime: '20 mins',
    tag: 'Burger',
    isAvailable: true,
    isVeg: false,
    nutrition: [
      { value: '100g', label: 'Grams' },
      { value: '740', label: 'Kcal' },
      { value: '35g', label: 'Protein' },
      { value: '45g', label: 'Fats' },
      { value: '40g', label: 'Carbs' }
    ],
    sideOptions: [
      { sideId: 1, emoji: '🧅', name: 'Onion', price: 0 },
      { sideId: 2, emoji: '🍅', name: 'Ketchup', price: 0 },
      { sideId: 3, emoji: '🥗', name: 'Coleslaw', price: 15 },
      { sideId: 4, emoji: '🍟', name: 'Fries', price: 25 },
      { sideId: 5, emoji: '🥬', name: 'Salad', price: 10 }
    ]
  },
  {
    name: 'Margherita Delight',
    category: 'pizza',
    emoji: '🍕',
    description: 'A classic Italian pizza featuring fresh mozzarella, vine-ripened tomatoes, and fragrant basil on our hand-tossed crust.',
    price: 150,
    rating: 4.1,
    reviewCount: 178,
    prepTime: '25 mins',
    tag: 'Pizza',
    isAvailable: true,
    isVeg: true,
    nutrition: [
      { value: '120g', label: 'Grams' },
      { value: '680', label: 'Kcal' },
      { value: '28g', label: 'Protein' },
      { value: '22g', label: 'Fats' },
      { value: '88g', label: 'Carbs' }
    ],
    sideOptions: [
      { sideId: 1, emoji: '🫒', name: 'Olives', price: 10 },
      { sideId: 2, emoji: '🌶', name: 'Chili', price: 0 },
      { sideId: 3, emoji: '🧄', name: 'Garlic', price: 0 },
      { sideId: 4, emoji: '🧅', name: 'Onion', price: 0 }
    ]
  },
  {
    name: 'Smoky BBQ Bacon',
    category: 'burger',
    emoji: '🥩',
    description: 'Succulent beef patty smothered in smoky BBQ sauce, layered with crispy bacon and caramelized onions.',
    price: 110,
    rating: 4.4,
    reviewCount: 201,
    prepTime: '18 mins',
    tag: 'Burger',
    isAvailable: true,
    isVeg: false,
    nutrition: [
      { value: '95g', label: 'Grams' },
      { value: '720', label: 'Kcal' },
      { value: '38g', label: 'Protein' },
      { value: '48g', label: 'Fats' },
      { value: '35g', label: 'Carbs' }
    ],
    sideOptions: [
      { sideId: 1, emoji: '🍟', name: 'Fries', price: 25 },
      { sideId: 2, emoji: '🥬', name: 'Lettuce', price: 0 },
      { sideId: 3, emoji: '🍅', name: 'Tomato', price: 0 },
      { sideId: 4, emoji: '🧅', name: 'Onion', price: 0 }
    ]
  },
  {
    name: 'Buffalo Cheese',
    category: 'burger',
    emoji: '🧀',
    description: 'A zesty beef patty smothered in tangy buffalo sauce, topped with crumbled blue cheese and crunchy celery slaw.',
    price: 140,
    rating: 4.2,
    reviewCount: 156,
    prepTime: '20 mins',
    tag: 'Burger',
    isAvailable: true,
    isVeg: false,
    nutrition: [
      { value: '100g', label: 'Grams' },
      { value: '760', label: 'Kcal' },
      { value: '36g', label: 'Protein' },
      { value: '52g', label: 'Fats' },
      { value: '38g', label: 'Carbs' }
    ],
    sideOptions: [
      { sideId: 1, emoji: '🥬', name: 'Lettuce', price: 0 },
      { sideId: 2, emoji: '🧅', name: 'Onion', price: 0 },
      { sideId: 3, emoji: '🍅', name: 'Tomato', price: 0 },
      { sideId: 4, emoji: '🥗', name: 'Coleslaw', price: 15 }
    ]
  },
  {
    name: 'Mushroom Swiss Melt',
    category: 'burger',
    emoji: '🍄',
    description: 'A tender beef patty crowned with sautéed mushrooms, melted Swiss cheese, and a garlic aioli drizzle.',
    price: 115,
    rating: 4.0,
    reviewCount: 134,
    prepTime: '22 mins',
    tag: 'Burger',
    isAvailable: true,
    isVeg: false,
    nutrition: [
      { value: '90g', label: 'Grams' },
      { value: '700', label: 'Kcal' },
      { value: '32g', label: 'Protein' },
      { value: '44g', label: 'Fats' },
      { value: '36g', label: 'Carbs' }
    ],
    sideOptions: [
      { sideId: 1, emoji: '🍟', name: 'Fries', price: 25 },
      { sideId: 2, emoji: '🥬', name: 'Lettuce', price: 0 },
      { sideId: 3, emoji: '🧄', name: 'Garlic', price: 0 },
      { sideId: 4, emoji: '🧅', name: 'Onion', price: 0 }
    ]
  },
  {
    name: 'Classic Cheeseburger',
    category: 'burger',
    emoji: '🍔',
    description: 'A robust and hearty beef patty, flame grilled to perfection, topped with melted cheddar, pickles and classic condiments.',
    price: 125,
    rating: 4.1,
    reviewCount: 289,
    prepTime: '15 mins',
    tag: 'Burger',
    isAvailable: true,
    isVeg: false,
    nutrition: [
      { value: '95g', label: 'Grams' },
      { value: '710', label: 'Kcal' },
      { value: '34g', label: 'Protein' },
      { value: '46g', label: 'Fats' },
      { value: '40g', label: 'Carbs' }
    ],
    sideOptions: [
      { sideId: 1, emoji: '🍟', name: 'Fries', price: 25 },
      { sideId: 2, emoji: '🥬', name: 'Lettuce', price: 0 },
      { sideId: 3, emoji: '🍅', name: 'Tomato', price: 0 },
      { sideId: 4, emoji: '🥒', name: 'Pickles', price: 0 }
    ]
  },
  {
    name: 'Farm Omelette',
    category: 'breakfast',
    emoji: '🍳',
    description: 'Fluffy eggs with fresh vegetables, herbs, and melted cheese. A hearty start to your day.',
    price: 85,
    rating: 4.3,
    reviewCount: 112,
    prepTime: '12 mins',
    tag: 'Breakfast',
    isAvailable: true,
    isVeg: true,
    nutrition: [
      { value: '200g', label: 'Grams' },
      { value: '380', label: 'Kcal' },
      { value: '22g', label: 'Protein' },
      { value: '28g', label: 'Fats' },
      { value: '8g', label: 'Carbs' }
    ],
    sideOptions: [
      { sideId: 1, emoji: '🧀', name: 'Cheese', price: 10 },
      { sideId: 2, emoji: '🌿', name: 'Herbs', price: 0 },
      { sideId: 3, emoji: '🧅', name: 'Onion', price: 0 },
      { sideId: 4, emoji: '🍅', name: 'Tomato', price: 0 }
    ]
  },
  {
    name: 'Italian Salad',
    category: 'salad',
    emoji: '🥗',
    description: 'Fresh mixed greens with cherry tomatoes, olives, feta cheese, and Italian dressing.',
    price: 75,
    rating: 4.4,
    reviewCount: 98,
    prepTime: '8 mins',
    tag: 'Salad',
    isAvailable: true,
    isVeg: true,
    nutrition: [
      { value: '180g', label: 'Grams' },
      { value: '220', label: 'Kcal' },
      { value: '8g', label: 'Protein' },
      { value: '14g', label: 'Fats' },
      { value: '18g', label: 'Carbs' }
    ],
    sideOptions: [
      { sideId: 1, emoji: '🫒', name: 'Olives', price: 10 },
      { sideId: 2, emoji: '🧀', name: 'Feta', price: 15 },
      { sideId: 3, emoji: '🌿', name: 'Herbs', price: 0 },
      { sideId: 4, emoji: '🍋', name: 'Lemon', price: 0 }
    ]
  },
  {
    name: 'Chocolate Lava',
    category: 'dessert',
    emoji: '🍫',
    description: 'Warm chocolate cake with a gooey molten center, served with vanilla ice cream.',
    price: 95,
    rating: 4.6,
    reviewCount: 167,
    prepTime: '15 mins',
    tag: 'Dessert',
    isAvailable: true,
    isVeg: true,
    nutrition: [
      { value: '150g', label: 'Grams' },
      { value: '520', label: 'Kcal' },
      { value: '6g', label: 'Protein' },
      { value: '24g', label: 'Fats' },
      { value: '72g', label: 'Carbs' }
    ],
    sideOptions: [
      { sideId: 1, emoji: '🍦', name: 'Ice Cream', price: 20 },
      { sideId: 2, emoji: '🍓', name: 'Strawberry', price: 15 },
      { sideId: 3, emoji: '🫐', name: 'Blueberry', price: 15 },
      { sideId: 4, emoji: '🍯', name: 'Honey', price: 10 }
    ]
  },
  {
    name: 'Mango Smoothie',
    category: 'drinks',
    emoji: '🥭',
    description: 'Fresh mango blended with yogurt and honey for a refreshing tropical drink.',
    price: 65,
    rating: 4.3,
    reviewCount: 88,
    prepTime: '5 mins',
    tag: 'Drink',
    isAvailable: true,
    isVeg: true,
    nutrition: [
      { value: '350ml', label: 'Volume' },
      { value: '220', label: 'Kcal' },
      { value: '4g', label: 'Protein' },
      { value: '2g', label: 'Fats' },
      { value: '52g', label: 'Carbs' }
    ],
    sideOptions: [
      { sideId: 1, emoji: '🧊', name: 'Ice', price: 0 },
      { sideId: 2, emoji: '🧋', name: 'Tapioca', price: 10 }
    ]
  }
];

async function seedFoodZone() {
  console.log('🌱 Starting FoodZone seed...');

  try {
    // Create categories
    const categoryMap: Record<string, string> = {};
    
    for (const cat of FOODZONE_CATEGORIES) {
      const existing = await prisma.category.findFirst({ where: { name: cat.name } });
      if (existing) {
        categoryMap[cat.name] = existing.id;
        console.log(`✅ Category exists: ${cat.name}`);
      } else {
        const created = await prisma.category.create({
          data: { name: cat.name, description: cat.description }
        });
        categoryMap[cat.name] = created.id;
        console.log(`✅ Category created: ${cat.name}`);
      }
    }

    // Create/upsert menu items
    let inserted = 0;
    let updated = 0;

    for (const item of FOODZONE_ITEMS) {
      const categoryId = categoryMap[item.category];
      if (!categoryId) {
        console.log(`⚠️ Skipping ${item.name} - category not found`);
        continue;
      }

      const existingItem = await prisma.menuItem.findFirst({ 
        where: { name: item.name }
      });

      if (existingItem) {
        await prisma.menuItem.update({
          where: { id: existingItem.id },
          data: {
            categoryId,
            description: item.description,
            price: item.price,
            isAvailable: item.isAvailable,
            isVeg: item.isVeg,
            emoji: item.emoji,
            tag: item.tag,
            rating: item.rating,
            reviewCount: item.reviewCount,
            prepTime: item.prepTime,
            nutrition: item.nutrition as any,
            sideOptions: item.sideOptions as any
          }
        });
        updated++;
        console.log(`🔄 Updated: ${item.name}`);
      } else {
        await prisma.menuItem.create({
          data: {
            name: item.name,
            categoryId,
            description: item.description,
            price: item.price,
            isAvailable: item.isAvailable,
            isVeg: item.isVeg,
            emoji: item.emoji,
            tag: item.tag,
            rating: item.rating,
            reviewCount: item.reviewCount,
            prepTime: item.prepTime,
            nutrition: item.nutrition as any,
            sideOptions: item.sideOptions as any
          }
        });
        inserted++;
        console.log(`✅ Created: ${item.name}`);
      }
    }

    console.log(`\n🎉 FoodZone seed complete!`);
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Total FoodZone items: ${await prisma.menuItem.count()}`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedFoodZone();