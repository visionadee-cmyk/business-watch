import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

// Your Firebase config
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
  const data = JSON.parse(fs.readFileSync('./data/lost_bids_for_firestore.json', 'utf8'));
  const bids = data.bids;
  
  console.log(`Importing ${bids.length} lost bids to Firestore...`);
  
  let imported = 0;
  let errors = 0;
  
  for (const bid of bids) {
    try {
      // Option 1: Auto-generate ID
      await addDoc(collection(db, 'bids'), bid);
      
      // Option 2: Use specific ID (uncomment if needed)
      // const bidId = `lost-${bid.gazetteId}`;
      // await setDoc(doc(db, 'bids', bidId), bid);
      
      imported++;
      if (imported % 10 === 0) {
        console.log(`✅ Imported ${imported}/${bids.length}`);
      }
    } catch (error) {
      console.error(`❌ Error importing bid ${bid.title}:`, error.message);
      errors++;
    }
  }
  
  console.log(`\n✅ Done! Imported: ${imported}, Errors: ${errors}`);
  process.exit(0);
}

importLostBids();
