import fetch from 'node-fetch';

const BASE = 'http://localhost:3000';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const YELLOW = '\x1b[33m';

let passed = 0;
let failed = 0;

function log(msg: string, status: 'pass' | 'fail' | 'info') {
  const color = status === 'pass' ? GREEN : status === 'fail' ? RED : YELLOW;
  console.log(`${color}${msg}${RESET}`);
}

async function runTests() {
  console.log('\n🧪 FOODZONE BACKEND TEST SUITE\n');
  console.log('=' .repeat(50));

  // Test 1: Health Check
  try {
    const res = await fetch(`${BASE}/api/customer/menu`);
    const data = await res.json();
    if (data.success) {
      log('✅ TEST 1.1: Menu API accessible', 'pass');
      log(`   Response: ${data.count} items loaded`, 'info');
      passed++;
    } else {
      log('❌ TEST 1.1: Menu API failed', 'fail');
      failed++;
    }
  } catch (e: any) {
    log(`❌ TEST 1.1: ${e.message}`, 'fail');
    failed++;
  }

  // Test 2: Categories
  try {
    const res = await fetch(`${BASE}/api/categories`);
    const data = await res.json();
    const hasCategories = Array.isArray(data) && data.length > 0;
    if (hasCategories) {
      log(`✅ TEST 2.2: Categories API - ${data.length} categories`, 'pass');
      passed++;
    } else {
      log('❌ TEST 2.2: Categories API failed', 'fail');
      failed++;
    }
  } catch (e: any) {
    log(`❌ TEST 2.2: ${e.message}`, 'fail');
    failed++;
  }

  // Test 3: Get All Menu Items
  try {
    const res = await fetch(`${BASE}/api/customer/menu`);
    const data = await res.json();
    if (data.success && data.count >= 10) {
      log(`✅ TEST 2.3: Get All Menu - ${data.count} items`, 'pass');
      
      // Check if items have required fields
      const firstItem = data.items[0];
      const hasEmoji = !!firstItem.emoji;
      const hasRating = firstItem.rating !== undefined;
      const hasNutrition = Array.isArray(firstItem.nutrition);
      const hasSideOptions = Array.isArray(firstItem.sideOptions);
      
      log(`   Item fields: emoji=${hasEmoji}, rating=${hasRating}, nutrition=${hasNutrition}, sides=${hasSideOptions}`, 'info');
      
      if (hasEmoji && hasRating && hasNutrition && hasSideOptions) {
        log('✅ TEST 2.3.1: All FoodZone fields present', 'pass');
        passed++;
      } else {
        log('❌ TEST 2.3.1: Missing FoodZone fields', 'fail');
        failed++;
      }
      passed++;
    } else {
      log('❌ TEST 2.3: Not enough menu items', 'fail');
      failed++;
    }
  } catch (e: any) {
    log(`❌ TEST 2.3: ${e.message}`, 'fail');
    failed++;
  }

  // Test 4: Filter by Category (Burger)
  try {
    const res = await fetch(`${BASE}/api/customer/menu?category=burger`);
    const data = await res.json();
    if (data.success && data.count > 0) {
      log(`✅ TEST 2.4: Filter by Category (burger) - ${data.count} items`, 'pass');
      passed++;
    } else {
      log('❌ TEST 2.4: No burger items found', 'fail');
      failed++;
    }
  } catch (e: any) {
    log(`❌ TEST 2.4: ${e.message}`, 'fail');
    failed++;
  }

  // Test 5: Search
  try {
    const res = await fetch(`${BASE}/api/customer/menu?category=pizza`);
    const data = await res.json();
    if (data.success && data.count > 0) {
      log(`✅ TEST 2.5: Category filter (pizza) - ${data.count} items`, 'pass');
      passed++;
    } else {
      log('❌ TEST 2.5: No pizza items found', 'fail');
      failed++;
    }
  } catch (e: any) {
    log(`❌ TEST 2.5: ${e.message}`, 'fail');
    failed++;
  }

  // Test 6: Get Single Item
  try {
    const menuRes = await fetch(`${BASE}/api/customer/menu`);
    const menuData = await menuRes.json();
    if (menuData.items && menuData.items.length > 0) {
      const firstItemId = menuData.items[0]._id;
      const itemRes = await fetch(`${BASE}/api/customer/menu/${firstItemId}`);
      const itemData = await itemRes.json();
      
      if (itemData.success && itemData.item) {
        log(`✅ TEST 2.6: Get Single Item - ${itemData.item.name}`, 'pass');
        log(`   Rating: ${itemData.item.rating}, Price: ₹${itemData.item.price}`, 'info');
        passed++;
      } else {
        log('❌ TEST 2.6: Failed to get single item', 'fail');
        failed++;
      }
    }
  } catch (e: any) {
    log(`❌ TEST 2.6: ${e.message}`, 'fail');
    failed++;
  }

  // Test 7: Place Order
  try {
    const menuRes = await fetch(`${BASE}/api/customer/menu`);
    const menuData = await menuRes.json();
    if (menuData.items && menuData.items.length > 0) {
      const item = menuData.items[0];
      
      const orderRes = await fetch(`${BASE}/api/customer/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: '1',
          items: [
            {
              menuItemId: item._id,
              quantity: 2,
              selectedSides: [{ name: 'Fries', price: 25 }],
              price: item.price
            }
          ],
          totalAmount: (item.price * 2) + 25 - 15
        })
      });
      
      const orderData = await orderRes.json();
      
      if (orderData.success) {
        log(`✅ TEST 2.10: Order placed successfully!`, 'pass');
        log(`   Order ID: ${orderData.orderId}`, 'info');
        passed++;
      } else {
        log(`❌ TEST 2.10: Order failed - ${orderData.message}`, 'fail');
        failed++;
      }
    }
  } catch (e: any) {
    log(`❌ TEST 2.10: ${e.message}`, 'fail');
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log(`\n🎉 ALL TESTS PASSED! Backend is ready.\n`);
  } else {
    console.log(`\n⚠️  Some tests failed. Please check the errors above.\n`);
  }
}

runTests();