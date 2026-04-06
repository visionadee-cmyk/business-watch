/**
 * Test script for gazette scraper
 * Run with: node api/test-scraper.js
 */

import { gazetteScraper } from './services/gazetteScraper.js';
import GazetteScraper from './services/gazetteScraper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testScraper() {
  console.log('🧪 Testing Gazette Scraper...\n');
  
  try {
    // Test with higher timeout for slow connections
    const scraper = new GazetteScraper({ timeout: 60000, retries: 3 });
    
    // Test 1: Fetch tenders (with mock fallback for testing)
    console.log('1️⃣ Testing fetchLatestTendersSafe()...');
    const tenders = await scraper.fetchLatestTendersSafe(true); // true = use mock if fails
    console.log(`   ✅ Found ${tenders.length} tenders`);
    
    if (tenders.length > 0) {
      console.log('\n   📋 Sample tender:');
      console.log(`   - ID: ${tenders[0].gazette_id}`);
      console.log(`   - Title: ${tenders[0].title?.substring(0, 60)}...`);
      console.log(`   - Category: ${tenders[0].category}`);
      console.log(`   - Authority: ${tenders[0].authority}`);
      console.log(`   - URL: ${tenders[0].gazette_url}`);
      if (tenders[0].is_mock) {
        console.log('   - ⚠️  Note: This is mock data (real site unreachable)');
      }
    }
    
    // Test 2: Fetch details for first tender
    if (tenders.length > 0) {
      console.log('\n2️⃣ Testing fetchTenderDetails()...');
      const details = await scraper.fetchTenderDetails(tenders[0].gazette_id);
      console.log(`   ✅ Retrieved details for tender ${tenders[0].gazette_id}`);
      
      if (details.submission_deadline) {
        console.log(`   - Deadline: ${details.submission_deadline}`);
      }
      if (details.contact_email) {
        console.log(`   - Email: ${details.contact_email}`);
      }
      if (details.estimated_budget) {
        console.log(`   - Budget: ${details.estimated_budget.toLocaleString()}`);
      }
    }
    
    // Test 3: Save results
    console.log('\n3️⃣ Saving results...');
    const outputPath = path.join(__dirname, '..', 'data', 'scraper-test-results.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      test_date: new Date().toISOString(),
      tender_count: tenders.length,
      tenders: tenders
    }, null, 2));
    console.log(`   ✅ Results saved to: ${outputPath}`);
    
    console.log('\n✨ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testScraper();
