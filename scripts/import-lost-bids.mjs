import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCATTRgC4-AXsIaWHHpVwde_mqFz5tLTgU",
  authDomain: "bussiness-watch.firebaseapp.com",
  projectId: "bussiness-watch",
  storageBucket: "bussiness-watch.firebasestorage.app",
  messagingSenderId: "48830913744",
  appId: "1:48830913744:web:7a9289daba9aea050392d5",
  measurementId: "G-SSL7HXR5MH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importLostBids() {
  const data = JSON.parse(readFileSync('./data/lost_bids_for_firestore.json', 'utf8'));
  const bids = data.bids;
  
  console.log(`Importing ${bids.length} lost bids to Firestore...`);
  
  let imported = 0;
  let errors = 0;
  
  for (const bid of bids) {
    try {
      await addDoc(collection(db, 'bids'), bid);
      imported++;
      if (imported % 10 === 0) {
        console.log(`✅ Imported ${imported}/${bids.length}`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      errors++;
    }
  }
  
  console.log(`\n✅ Done! Imported: ${imported}, Errors: ${errors}`);
  process.exit(0);
}

importLostBids();
