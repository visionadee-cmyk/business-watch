#!/usr/bin/env node
/**
 * Export all Firestore data from OLD Firebase project (bussiness-watch)
 * Run this BEFORE switching to new project
 */

const fs = require('fs');
const path = require('path');

// Use OLD service account (bussiness-watch)
const OLD_SERVICE_ACCOUNT = require('../service-account-OLD-backup.json');

const admin = require('firebase-admin');

// Initialize with OLD project credentials
const oldApp = admin.initializeApp({
  credential: admin.credential.cert(OLD_SERVICE_ACCOUNT),
  databaseURL: `https://${OLD_SERVICE_ACCOUNT.project_id}.firebaseio.com`
}, 'oldApp');

const db = oldApp.firestore();

// Collections to export
const COLLECTIONS = [
  'bids',
  'tenders',
  'users',
  'documents',
  'suppliers',
  'purchases',
  'deliveries',
  'projects',
  'staffExpenses',
  'capital',
  'notifications',
  'subscribers',
  'quotations'
];

async function exportCollection(collectionName) {
  console.log(`Exporting ${collectionName}...`);
  const snapshot = await db.collection(collectionName).get();
  
  const data = {};
  snapshot.forEach(doc => {
    data[doc.id] = {
      id: doc.id,
      ...doc.data()
    };
  });
  
  return {
    collection: collectionName,
    count: snapshot.size,
    data: data
  };
}

async function exportAllData() {
  console.log('===========================================');
  console.log('Exporting data from OLD Firebase project');
  console.log(`Project: ${OLD_SERVICE_ACCOUNT.project_id}`);
  console.log('===========================================\n');
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    sourceProject: OLD_SERVICE_ACCOUNT.project_id,
    collections: {}
  };
  
  for (const collectionName of COLLECTIONS) {
    try {
      const result = await exportCollection(collectionName);
      exportData.collections[collectionName] = result;
      console.log(`✓ ${collectionName}: ${result.count} documents`);
    } catch (error) {
      console.error(`✗ ${collectionName}: ${error.message}`);
      exportData.collections[collectionName] = {
        collection: collectionName,
        count: 0,
        error: error.message,
        data: {}
      };
    }
  }
  
  // Save to file
  const outputFile = path.join(__dirname, '../data/firebase-backup-export.json');
  fs.writeFileSync(outputFile, JSON.stringify(exportData, null, 2));
  
  console.log('\n===========================================');
  console.log('Export Complete!');
  console.log(`Saved to: ${outputFile}`);
  console.log('===========================================');
  
  // Print summary
  let totalDocs = 0;
  for (const [name, result] of Object.entries(exportData.collections)) {
    totalDocs += result.count;
  }
  console.log(`\nTotal documents exported: ${totalDocs}`);
  
  await oldApp.delete();
  process.exit(0);
}

// Run export
exportAllData().catch(error => {
  console.error('Export failed:', error);
  process.exit(1);
});
