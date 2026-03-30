/**
 * Manual test for API endpoints
 * Run with: node api/test-api.js
 */

const BASE_URL = process.env.VERCEL_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET;

async function testScrapeEndpoint() {
  console.log('🌐 Testing /api/scrape-gazette endpoint...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/scrape-gazette`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Scrape successful!');
      console.log(`   New tenders found: ${result.newTendersFound}`);
      console.log(`   Total tenders: ${result.totalTenders}`);
      console.log(`   Timestamp: ${result.timestamp}`);
    } else {
      console.error('❌ Scrape failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Tips:');
    console.log('   - If running locally, start the dev server first: npm run dev');
    console.log('   - If testing production, make sure VERCEL_URL is set');
    console.log('   - Check that CRON_SECRET matches your .env file');
  }
}

async function testDeadlineEndpoint() {
  console.log('\n🌐 Testing /api/check-deadlines endpoint...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/check-deadlines`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Deadline check successful!');
      console.log(`   Tenders checked: ${result.tendersChecked}`);
      console.log(`   Timestamp: ${result.timestamp}`);
    } else {
      console.error('❌ Deadline check failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run tests
console.log('🔑 Using CRON_SECRET:', CRON_SECRET ? '✓ Set' : '✗ Not set');
console.log('🌍 Base URL:', BASE_URL);

if (!CRON_SECRET) {
  console.error('\n❌ CRON_SECRET not found in environment variables');
  console.log('   Please run: node --env-file=.env api/test-api.js');
  process.exit(1);
}

await testScrapeEndpoint();
await testDeadlineEndpoint();
