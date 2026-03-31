const fs = require('fs');

// Read the lost bids file
const data = JSON.parse(fs.readFileSync('./data/lost_bids.json', 'utf8'));

// Transform tenders to Firestore bid format
const firestoreBids = data.tenders.map(tender => ({
  // Core bid fields
  title: tender.title || `Tender ${tender.tender_no}`,
  description: tender.title_dhivehi || '',
  clientName: tender.authority || '',
  
  // Dates
  submissionDate: tender.submission_deadline || '',
  submissionTime: tender.submission_time || '',
  bidOpeningDate: tender.bid_opening_date || '',
  bidOpeningTime: tender.bid_opening_time || '',
  clarificationDeadline: tender.clarification_deadline || '',
  clarificationTime: tender.clarification_time || '',
  preBidMeeting: tender.pre_bid_meeting || '',
  preBidMeetingTime: tender.pre_bid_meeting_time || '',
  
  // Links
  gazetteUrl: tender.gazette_url || '',
  infoSheetUrl: tender.info_sheet_url || '',
  
  // Contact
  contactEmail: tender.contact_email || '',
  contactPhones: tender.contact_phones || [],
  contactName: tender.contact_name || '',
  
  // Financials (empty/null for now)
  bidAmount: tender.bid_amount || 0,
  costEstimate: tender.cost_estimate || 0,
  profitMargin: tender.profit_margin || 0,
  
  // Status - marked as LOST
  status: 'Submitted', // Can be used for filtering
  result: 'Lost', // Key field - marked as lost
  category: tender.category || 'Other',
  
  // Additional info
  bidSecurity: tender.bid_security || '',
  performanceGuarantee: tender.performance_guarantee || '',
  eligibility: tender.eligibility || '',
  funding: tender.funding || '',
  project: tender.project || '',
  
  // Source tracking
  source: 'gazette.gov.mv',
  scrapedAt: tender.scraped_at || new Date().toISOString(),
  gazetteId: tender.gazette_id || tender.id,
  tenderNo: tender.tender_no || '',
  
  // Empty arrays for optional fields
  items: [],
  documents: tender.documents || [],
  notes: tender.notes || `Lost bid scraped from ${tender.gazette_url || ''}`,
  
  // Timestamps
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));

// Write to output file
fs.writeFileSync('./data/lost_bids_for_firestore.json', JSON.stringify({
  metadata: {
    total_bids: firestoreBids.length,
    generated_at: new Date().toISOString(),
    source: 'lost_bids.json converted for Firestore import',
    type: 'Lost Bids - Firestore Format'
  },
  bids: firestoreBids
}, null, 2));

console.log(`✅ Converted ${firestoreBids.length} lost tenders to Firestore bid format`);
console.log('Output: ./data/lost_bids_for_firestore.json');
