const admin = require('firebase-admin');
const fs = require('fs');

// Initialize with service account
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'business-watch-52e10'
});

const db = admin.firestore();

async function clearAndReimportLostBids() {
  console.log('Step 1: Finding existing lost bids to delete...');
  
  // Find all lost bids
  const lostBidsSnapshot = await db.collection('bids').where('result', '==', 'Lost').get();
  console.log(`Found ${lostBidsSnapshot.size} existing lost bids to delete`);
  
  // Delete in batches
  const batch = db.batch();
  let deleted = 0;
  
  lostBidsSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
    deleted++;
    if (deleted % 500 === 0) {
      batch.commit();
    }
  });
  
  await batch.commit();
  console.log(`✅ Deleted ${deleted} existing lost bids`);
  
  console.log('\nStep 2: Importing new lost bids...');
  
  const data = JSON.parse(fs.readFileSync('./data/lost_bids_for_firestore.json', 'utf8'));
  const bids = data.bids;
  
  console.log(`Importing ${bids.length} lost bids...`);
  
  let imported = 0;
  
  for (const bid of bids) {
    try {
      await db.collection('bids').add(bid);
      imported++;
      if (imported % 10 === 0) {
        console.log(`✅ Imported ${imported}/${bids.length}`);
      }
    } catch (error) {
      console.error(`❌ Error importing ${bid.title}: ${error.message}`);
    }
  }
  
  console.log(`\n✅ Complete! Deleted: ${deleted}, Imported: ${imported}`);
  process.exit(0);
}

clearAndReimportLostBids().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
