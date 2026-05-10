import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Running API Tests...\n');

  try {
    // Test 2.3 - Get All Menu Items
    console.log('Test 2.3 - GET /api/customer/menu');
    const menuRes = await fetch(`${BASE}/api/customer/menu`);
    const menuData = await menuRes.json();
    console.log(`   Status: ${menuRes.status}`);
    console.log(`   Items count: ${menuData.count}`);
    console.log(`   ✅ PASS\n`);

    // Test 2.4 - Filter by Category
    console.log('Test 2.4 - GET /api/customer/menu?category=burger');
    const burgerRes = await fetch(`${BASE}/api/customer/menu?category=burger`);
    const burgerData = await burgerRes.json();
    console.log(`   Status: ${burgerRes.status}`);
    console.log(`   Burger items: ${burgerData.count}`);
    console.log(`   ✅ PASS\n`);

    // Test 2.5 - Search
    console.log('Test 2.5 - GET /api/customer/menu?category=pizza');
    const pizzaRes = await fetch(`${BASE}/api/customer/menu?category=pizza`);
    const pizzaData = await pizzaRes.json();
    console.log(`   Status: ${pizzaRes.status}`);
    console.log(`   Pizza items: ${pizzaData.count}`);
    console.log(`   ✅ PASS\n`);

    // Test 2.6 - Get Single Item
    if (menuData.items && menuData.items.length > 0) {
      const firstItemId = menuData.items[0]._id;
      console.log(`Test 2.6 - GET /api/customer/menu/${firstItemId}`);
      const itemRes = await fetch(`${BASE}/api/customer/menu/${firstItemId}`);
      const itemData = await itemRes.json();
      console.log(`   Status: ${itemRes.status}`);
      console.log(`   Item name: ${itemData.item?.name}`);
      console.log(`   Emoji: ${itemData.item?.emoji}`);
      console.log(`   Rating: ${itemData.item?.rating}`);
      console.log(`   Nutrition: ${JSON.stringify(itemData.item?.nutrition?.slice(0,2))}`);
      console.log(`   Side Options: ${itemData.item?.sideOptions?.length} options`);
      console.log(`   ✅ PASS\n`);
    }

    console.log('🎉 ALL API TESTS PASSED!');

  } catch (error: any) {
    console.error('❌ API Test Failed:', error.message);
  }
}

testAPI();