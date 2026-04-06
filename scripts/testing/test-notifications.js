/**
 * Test notification service
 * Run with: node api/test-notifications.js
 */

import { notificationService } from './services/notificationService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testNotifications() {
  console.log('📧 Testing Notification Service...\n');
  
  try {
    // Load test subscriber
    const subscribersPath = path.join(__dirname, '..', 'data', 'subscribers.json');
    const subscribers = JSON.parse(fs.readFileSync(subscribersPath, 'utf8'));
    
    console.log(`1️⃣ Found ${subscribers.length} subscriber(s)`);
    
    if (subscribers.length === 0) {
      console.error('❌ No subscribers found. Add one to data/subscribers.json first.');
      process.exit(1);
    }
    
    const testSubscriber = subscribers[0];
    console.log(`   Testing with: ${testSubscriber.email}\n`);
    
    // Add subscriber to notification service
    notificationService.addSubscriber('test-user-1', {
      email: testSubscriber.email,
      phone: testSubscriber.phone,
      preferences: testSubscriber.preferences
    });
    
    // Test 1: New Tender Alert
    console.log('2️⃣ Testing new tender alert...');
    const mockTender = {
      id: 'TND-2026-12345',
      title: 'Supply of IT Equipment - Test Notification',
      authority: 'Ministry of Education',
      category: 'IT',
      submission_deadline: '2026-04-15',
      bid_opening_date: '2026-04-20',
      gazette_url: 'https://gazette.gov.mv/iulaan/12345',
      estimated_budget: 150000,
      requirements: { laptops: 10, monitors: 10 }
    };
    
    try {
      await notificationService.sendNewTenderAlert(mockTender);
      console.log('   ✅ New tender notification sent\n');
    } catch (err) {
      console.error('   ❌ Failed:', err.message, '\n');
    }
    
    // Test 2: Deadline Reminder
    console.log('3️⃣ Testing deadline reminder...');
    const mockDeadlineTender = {
      id: 'TND-2026-67890',
      title: 'Office Supplies Procurement - Deadline Test',
      authority: 'Male City Council',
      submission_deadline: '2026-04-05',
      daysRemaining: 2
    };
    
    try {
      await notificationService.sendDeadlineNotification(mockDeadlineTender, 2);
      console.log('   ✅ Deadline reminder sent\n');
    } catch (err) {
      console.error('   ❌ Failed:', err.message, '\n');
    }
    
    // Test 3: Bid Opening Reminder
    console.log('4️⃣ Testing bid opening reminder...');
    const mockOpeningTender = {
      id: 'TND-2026-11111',
      title: 'Construction Project - Opening Test',
      authority: 'Ministry of Health',
      bid_opening_date: '2026-04-01T10:00:00'
    };
    
    try {
      await notificationService.sendBidOpeningReminder(mockOpeningTender);
      console.log('   ✅ Bid opening notification sent\n');
    } catch (err) {
      console.error('   ❌ Failed:', err.message, '\n');
    }
    
    // Test 4: Result Update
    console.log('5️⃣ Testing result update...');
    const mockResultTender = {
      id: 'TND-2026-22222',
      title: 'Medical Equipment Supply - Result Test',
      authority: 'Ministry of Health',
      bid_amount: 250000,
      result: 'Won'
    };
    
    try {
      await notificationService.sendResultUpdate(mockResultTender, 'Won');
      console.log('   ✅ Result notification sent\n');
    } catch (err) {
      console.error('   ❌ Failed:', err.message, '\n');
    }
    
    console.log('✨ All notification tests completed!');
    console.log('   Check your inbox at:', testSubscriber.email);
    console.log('   (Emails may take a few minutes to arrive)');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testNotifications();
