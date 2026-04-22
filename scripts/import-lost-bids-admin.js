const admin = require('firebase-admin');
const fs = require('fs');

// Initialize with service account
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'bussiness-watch'
});

const db = admin.firestore();

async function importLostBids() {
  const data = JSON.parse(fs.readFileSync('./data/lost_bids_for_firestore.json', 'utf8'));
  const bids = data.bids;
  
  console.log(`Importing ${bids.length} lost bids...`);
  
  const batch = db.batch();
  let imported = 0;
  
  for (const bid of bids) {
    const docRef = db.collection('bids').doc();
    batch.set(docRef, bid);
    imported++;
    
    // Firestore batches limited to 500 operations
    if (imported % 500 === 0) {
      await batch.commit();
      console.log(`✅ Imported ${imported}/${bids.length}`);
    }
  }
  
  await batch.commit();
  console.log(`✅ Done! Imported ${imported} lost bids`);
  process.exit(0);
}

importLostBids().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
