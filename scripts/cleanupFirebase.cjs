/**
 * Firebase Data Cleanup Script
 * Shows what will be deleted and requires confirmation
 * Run with: node scripts/cleanupFirebase.js
 * Run with: node scripts/cleanupFirebase.js --confirm  (to actually delete)
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  writeBatch
} = require('firebase/firestore');

// Check for --confirm flag
const dryRun = !process.argv.includes('--confirm');

// Firebase configuration - same as in your app
const firebaseConfig = {
  apiKey: "AIzaSyB5ZP4LrFd11aKmVduFwr9qTtmRy2W0G_E",
  authDomain: "business-watch-c0f63.firebaseapp.com",
  projectId: "business-watch-c0f63",
  storageBucket: "business-watch-c0f63.appspot.com",
  messagingSenderId: "935328301833",
  appId: "1:935328301833:web:b0ef482f49a0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupBids() {
  try {
    console.log('🔍 Fetching all bids...');
    
    // Get all bids ordered by createdAt descending
    const bidsQuery = query(collection(db, 'bids'), orderBy('createdAt', 'desc'));
    const bidsSnapshot = await getDocs(bidsQuery);
    
    if (bidsSnapshot.empty) {
      console.log('✅ No bids found in database');
      return;
    }
    
    const allBids = bidsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${allBids.length} bids\n`);
    
    if (allBids.length <= 1) {
      console.log('✅ Only 1 bid exists, nothing to cleanup');
      return;
    }
    
    // Keep the first (most recent) bid, delete the rest
    const mostRecentBid = allBids[0];
    const bidsToDelete = allBids.slice(1);
    
    console.log('='.repeat(60));
    console.log('📋 BIDS THAT WILL BE KEPT (Most Recent):');
    console.log('='.repeat(60));
    console.log(`   ID:       ${mostRecentBid.id}`);
    console.log(`   Title:    ${mostRecentBid.title || 'Untitled'}`);
    console.log(`   Authority: ${mostRecentBid.authority || 'N/A'}`);
    console.log(`   Created:  ${mostRecentBid.createdAt?.toDate?.() || mostRecentBid.createdAt || 'Unknown'}`);
    console.log(`   Items:    ${mostRecentBid.items?.length || 0} requirement items`);
    
    console.log('\n' + '='.repeat(60));
    console.log(`🗑️  BIDS THAT WILL BE DELETED (${bidsToDelete.length} bids):`);
    console.log('='.repeat(60));
    bidsToDelete.forEach((bid, index) => {
      console.log(`   ${index + 1}. ${bid.title || 'Untitled'} (${bid.authority || 'Unknown'})`);
      console.log(`      ID: ${bid.id}`);
      console.log('');
    });
    
    if (dryRun) {
      console.log('\n' + '='.repeat(60));
      console.log('⚠️  DRY RUN MODE - No data was deleted!');
      console.log('='.repeat(60));
      console.log('To actually delete these bids, run:');
      console.log('  node scripts/cleanupFirebase.js --confirm');
      return;
    }
    
    // Actually delete
    console.log('\n🗑️  Deleting bids...');
    
    // Delete in batches of 500 (Firestore batch limit)
    const batchSize = 500;
    for (let i = 0; i < bidsToDelete.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = bidsToDelete.slice(i, i + batchSize);
      
      chunk.forEach(bid => {
        const bidRef = doc(db, 'bids', bid.id);
        batch.delete(bidRef);
      });
      
      await batch.commit();
      console.log(`   ✓ Deleted batch ${Math.floor(i / batchSize) + 1} (${chunk.length} bids)`);
    }
    
    console.log('\n✅ Cleanup complete!');
    console.log(`   Total deleted: ${bidsToDelete.length} bids`);
    console.log(`   Remaining: 1 bid (most recent)`);
    
  } catch (error) {
    console.error('❌ Error cleaning up bids:', error);
    process.exit(1);
  }
}

// Also cleanup suppliers if needed
async function cleanupSuppliers() {
  try {
    console.log('\n🔍 Checking suppliers...');
    const suppliersSnapshot = await getDocs(collection(db, 'suppliers'));
    
    if (suppliersSnapshot.empty) {
      console.log('✅ No suppliers found');
      return;
    }
    
    console.log(`📊 Found ${suppliersSnapshot.size} suppliers`);
    console.log('   (Suppliers are kept as they are linked to bid items)');
    
  } catch (error) {
    console.error('❌ Error checking suppliers:', error);
  }
}

// Run cleanup
async function main() {
  console.log('🧹 Firebase Data Cleanup Tool\n');
  console.log('='.repeat(60));
  
  if (dryRun) {
    console.log('Mode: DRY RUN (preview only, no deletions)\n');
  } else {
    console.log('Mode: LIVE (will actually delete data)\n');
  }
  
  await cleanupBids();
  
  console.log('\n' + '='.repeat(60));
  if (dryRun) {
    console.log('🏁 Preview complete. Review the list above carefully!');
    console.log('\nTo actually delete, run:');
    console.log('  npm run cleanup -- --confirm');
  } else {
    console.log('✨ Cleanup complete!');
  }
  process.exit(0);
}

main();
