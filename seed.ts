import mongoose from 'mongoose';
import { MenuItem } from './server/models.ts';
import { connectDB } from './server/db.ts';
import dotenv from 'dotenv';

dotenv.config();

const seedData = [
  { name: 'Truffle Mushroom Risotto', description: 'Creamy Arborio rice with black truffle oil and wild mushrooms.', price: 850, category: 'main', image: 'https://picsum.photos/seed/risotto/800/600', available: true, stock: 50 },
  { name: 'Avocado Toast Deluxe', description: 'Sourdough bread with smashed avocado, poached eggs, and chili flakes.', price: 450, category: 'starter', image: 'https://picsum.photos/seed/avocado/800/600', available: true, stock: 100 },
  { name: 'Saffron Infused Salmon', description: 'Pan-seared salmon with saffron butter sauce and asparagus.', price: 1200, category: 'main', image: 'https://picsum.photos/seed/salmon/800/600', available: true, stock: 30 },
  { name: 'Belgian Chocolate Lava Cake', description: 'Warm chocolate cake with a molten center and vanilla bean gelato.', price: 350, category: 'dessert', image: 'https://picsum.photos/seed/cake/800/600', available: true, stock: 40 },
  { name: 'Artisanal Cold Brew', description: '12-hour slow-steeped coffee served over clear ice.', price: 280, category: 'beverage', image: 'https://picsum.photos/seed/coffee/800/600', available: true, stock: 200 },
];

async function seed() {
  await connectDB();
  await MenuItem.deleteMany({});
  await MenuItem.insertMany(seedData);
  console.log('Database Seeded Successfully');
  process.exit();
}

seed();
