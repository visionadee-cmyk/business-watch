const admin = require('firebase-admin');
const fs = require('fs');

// Initialize with service account
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'business-watch-52e10'
});

const db = admin.firestore();

async function importLostBids() {
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
      console.error(`❌ Error: ${error.message}`);
    }
  }
  
  console.log(`✅ Done! Imported ${imported} lost bids`);
  process.exit(0);
}

importLostBids().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
