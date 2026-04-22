#!/usr/bin/env node
/**
 * Import Firestore data to NEW Firebase project (business-watch-52e10)
 * Run this AFTER exporting from old project
 */

const fs = require('fs');
const path = require('path');

// Use NEW service account (business-watch-52e10)
const NEW_SERVICE_ACCOUNT = require('../service-account.json');

const admin = require('firebase-admin');

// Initialize with NEW project credentials
const newApp = admin.initializeApp({
  credential: admin.credential.cert(NEW_SERVICE_ACCOUNT),
  databaseURL: `https://${NEW_SERVICE_ACCOUNT.project_id}.firebaseio.com`
}, 'newApp');

const db = newApp.firestore();

async function importCollection(collectionName, documents) {
  console.log(`Importing ${collectionName}...`);
  
  const batch = db.batch();
  let count = 0;
  
  for (const [docId, docData] of Object.entries(documents)) {
    const docRef = db.collection(collectionName).doc(docId);
    
    // Convert timestamps if needed
    const cleanedData = { ...docData };
    delete cleanedData.id; // Remove duplicate id field
    
    batch.set(docRef, cleanedData);
    count++;
    
    // Firestore batch limit is 500
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`  Committed ${count} documents...`);
    }
  }
  
  // Commit remaining
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  return count;
}

async function importAllData() {
  console.log('===========================================');
  console.log('Importing data to NEW Firebase project');
  console.log(`Project: ${NEW_SERVICE_ACCOUNT.project_id}`);
  console.log('===========================================\n');
  
  // Read export file
  const exportFile = path.join(__dirname, '../data/firebase-backup-export.json');
  
  if (!fs.existsSync(exportFile)) {
    console.error('Export file not found! Run export-old-firebase-data.cjs first.');
    console.error(`Expected: ${exportFile}`);
    process.exit(1);
  }
  
  const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
  
  console.log(`Source: ${exportData.sourceProject}`);
  console.log(`Exported: ${exportData.exportedAt}\n`);
  
  let totalImported = 0;
  
  for (const [collectionName, result] of Object.entries(exportData.collections)) {
    if (result.error || result.count === 0) {
      console.log(`⊘ ${collectionName}: skipped (${result.error || 'empty'})`);
      continue;
    }
    
    try {
      const count = await importCollection(collectionName, result.data);
      totalImported += count;
      console.log(`✓ ${collectionName}: ${count} documents imported`);
    } catch (error) {
      console.error(`✗ ${collectionName}: ${error.message}`);
    }
  }
  
  console.log('\n===========================================');
  console.log('Import Complete!');
  console.log(`Total documents imported: ${totalImported}`);
  console.log('===========================================');
  
  await newApp.delete();
  process.exit(0);
}

// Run import
importAllData().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});
