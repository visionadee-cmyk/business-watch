#!/usr/bin/env node
/**
 * Import upcoming bids (Apr 22-30) to Firestore
 * Run: node scripts/import-upcoming-bids.cjs
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize with current service account
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

async function importBids() {
  console.log('===========================================');
  console.log('Importing Upcoming Bids (Apr 22-30, 2026)');
  console.log('Project:', serviceAccount.project_id);
  console.log('===========================================\n');

  const data = JSON.parse(fs.readFileSync(
    path.join(__dirname, '../data/upcoming-bids-apr-22-30.json'),
    'utf8'
  ));

  const bids = data.bids;
  let successCount = 0;
  let errorCount = 0;

  for (const bid of bids) {
    try {
      // Convert dates to Firestore timestamps where applicable
      const bidData = {
        ...bid,
        // Convert submission date to proper format if needed
        submissionDeadline: bid.submissionDate || '',
        submissionTime: bid.submissionTime || '',
        // Add timestamps
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Ensure these fields exist
        tenderNo: bid.id || '',
        title: bid.title || '',
        authority: bid.authority || '',
        category: bid.category || 'General',
        status: bid.status || 'Open',
        result: bid.result || 'Pending',
        gazetteUrl: bid.gazetteUrl || '',
        notes: bid.notes || '',
        // Financial fields (empty for now)
        bidAmount: 0,
        costEstimate: 0,
        profitMargin: 0,
        // Items array (empty for now)
        items: [],
        documents: []
      };

      // Remove the id field since we'll use it as the doc ID
      const { id, ...bidDataWithoutId } = bidData;

      await db.collection('bids').doc(id).set(bidDataWithoutId);
      console.log(`✓ Imported: ${bid.title} (${bid.submissionDate})`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to import ${bid.title}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n===========================================');
  console.log('Import Complete!');
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${errorCount}`);
  console.log('===========================================');

  await admin.app().delete();
  process.exit(errorCount > 0 ? 1 : 0);
}

importBids().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});
