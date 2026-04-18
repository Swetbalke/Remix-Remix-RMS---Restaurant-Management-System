import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create categories
  const catBiryani = await prisma.category.create({ data: { name: 'Biryani' } });
  const catCanai = await prisma.category.create({ data: { name: 'Canai' } });
  const catRice = await prisma.category.create({ data: { name: 'Rice' } });

  // Biryani
  await prisma.menuItem.create({ data: { name: 'Chicken Biryani', price: 390, categoryId: catBiryani.id, imageUrl: 'https://picsum.photos/seed/chickenbiryani/800/600', description: 'Classic chicken biryani' }});
  await prisma.menuItem.create({ data: { name: 'Mutton Biryani', price: 420, categoryId: catBiryani.id, imageUrl: 'https://picsum.photos/seed/muttonbiryani/800/600', description: 'Authentic mutton biryani' }});
  await prisma.menuItem.create({ data: { name: 'Vegan Biryani', price: 420, categoryId: catBiryani.id, imageUrl: 'https://picsum.photos/seed/veganbiryani/800/600', description: 'Plant-based delicious biryani' }});
  await prisma.menuItem.create({ data: { name: 'Paneer Biryani', price: 490, categoryId: catBiryani.id, imageUrl: 'https://picsum.photos/seed/paneerbiryani/800/600', description: 'Rich paneer biryani' }});
  await prisma.menuItem.create({ data: { name: 'Egg Biryani', price: 490, categoryId: catBiryani.id, imageUrl: 'https://picsum.photos/seed/eggbiryani/800/600', description: 'Spiced egg biryani' }});
  await prisma.menuItem.create({ data: { name: 'Hyderabadi Chicken', price: 520, categoryId: catBiryani.id, imageUrl: 'https://picsum.photos/seed/hydchicken/800/600', description: 'Traditional hyderabadi chicken' }});

  // Canai
  await prisma.menuItem.create({ data: { name: 'Canai with Veg Curry', price: 390, categoryId: catCanai.id, imageUrl: 'https://picsum.photos/seed/canaiveg/800/600', description: 'Canai with vegetables' }});
  await prisma.menuItem.create({ data: { name: 'Canai with Chicken Curry', price: 420, categoryId: catCanai.id, imageUrl: 'https://picsum.photos/seed/canaichicken/800/600', description: 'Canai with chicken curry' }});
  await prisma.menuItem.create({ data: { name: 'Canai with Fish Curry', price: 420, categoryId: catCanai.id, imageUrl: 'https://picsum.photos/seed/canaifish/800/600', description: 'Canai with fish curry' }});
  await prisma.menuItem.create({ data: { name: 'Canai with Choco/Cheese', price: 490, categoryId: catCanai.id, imageUrl: 'https://picsum.photos/seed/canaichoco/800/600', description: 'Sweet canai' }});
  await prisma.menuItem.create({ data: { name: 'Canai with Banana', price: 490, categoryId: catCanai.id, imageUrl: 'https://picsum.photos/seed/canaibanana/800/600', description: 'Canai with banana slices' }});

  // Rice
  await prisma.menuItem.create({ data: { name: 'Basmati Rice', price: 390, categoryId: catRice.id, imageUrl: 'https://picsum.photos/seed/basmati/800/600', description: 'Premium basmati' }});
  await prisma.menuItem.create({ data: { name: 'Green Peas Pulao', price: 420, categoryId: catRice.id, imageUrl: 'https://picsum.photos/seed/peaspulao/800/600', description: 'Peas pulao' }});
  await prisma.menuItem.create({ data: { name: 'Jeera Rice', price: 420, categoryId: catRice.id, imageUrl: 'https://picsum.photos/seed/jeerarice/800/600', description: 'Cumin rice' }});
  await prisma.menuItem.create({ data: { name: 'Saffron Rice', price: 490, categoryId: catRice.id, imageUrl: 'https://picsum.photos/seed/saffronrice/800/600', description: 'Saffron infused rice' }});

  console.log('Added image menu items successfully');
}
main().finally(() => prisma.$disconnect());
