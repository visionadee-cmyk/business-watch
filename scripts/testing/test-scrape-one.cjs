const { writeFileSync } = require('fs');
const { join } = require('path');
const https = require('https');
const http = require('http');

// Test with first URL from working_file
const testUrl = "https://gazette.gov.mv/iulaan/384475";

console.log('Testing scraper on one URL:', testUrl);
console.log('This uses the same logic as lost_bids scraper');
console.log('');

// Extract ID from URL
function extractId(url) {
  const match = url.match(/(\d+)/);
  return match ? match[1] : 'unknown';
}

// Fetch URL content
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 15000
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Status: ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// FULL scraper like lost_bids
async function scrapeFullTender(url) {
  const tenderId = extractId(url);
  console.log(`Scraping tender ${tenderId}...`);
  
  try {
    const html = await fetchUrl(url);
    console.log(`  ✓ Fetched ${html.length} bytes`);
    
    // Extract title from h1
    let title = '';
    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
      console.log(`  ✓ Title: ${title.substring(0, 80)}...`);
    }
    
    // Try to find Dhivehi title
    let titleDhivehi = '';
    const dhivehiMatch = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (dhivehiMatch && /[ހ-ޱ]/.test(dhivehiMatch[1])) {
      titleDhivehi = dhivehiMatch[1].replace(/<[^>]+>/g, '').trim();
      console.log(`  ✓ Dhivehi title found`);
    }
    
    // Extract authority
    let authority = '';
    const authorityPatterns = [
      /Ministry[^<]*/i,
      /Department[^<]*/i,
      /Agency[^<]*/i,
      /Authority[^<]*/i,
      /Corporation[^<]*/i,
      /Service[^<]*/i,
      /Hospital[^<]*/i,
      /School[^<]*/i,
      /Council[^<]*/i,
      /Commission[^<]*/i,
      /Office[^<]*/i,
      /University[^<]*/i
    ];
    for (const pattern of authorityPatterns) {
      const match = html.match(pattern);
      if (match) {
        authority = match[0].replace(/<[^>]+>/g, '').trim().substring(0, 150);
        if (authority.length > 5) break;
      }
    }
    console.log(`  ✓ Authority: ${authority || 'Not found'}`);
    
    // Extract all dates
    const dateMatches = html.match(/\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}/g) || [];
    const isoDateMatches = html.match(/\d{4}-\d{2}-\d{2}/g) || [];
    console.log(`  ✓ Found ${dateMatches.length + isoDateMatches.length} dates`);
    
    // Extract times
    const timeMatches = html.match(/\d{1,2}:\d{2}/g) || [];
    
    // Extract email
    const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const contactEmail = emailMatch ? emailMatch[0] : '';
    if (contactEmail) console.log(`  ✓ Email: ${contactEmail}`);
    
    // Extract phone numbers
    const phoneMatches = html.match(/\+?\d[\d\s-]{6,}/g) || [];
    const contactPhones = [...new Set(phoneMatches)].slice(0, 3);
    if (contactPhones.length) console.log(`  ✓ Phones: ${contactPhones.join(', ')}`);
    
    // Extract info sheet URL
    let infoSheetUrl = '';
    const infoSheetMatch = html.match(/https:\/\/storage\.googleapis\.com\/gazette\.gov\.mv[^\s"'<>]+/);
    if (infoSheetMatch) {
      infoSheetUrl = infoSheetMatch[0];
      console.log(`  ✓ Info sheet: ${infoSheetUrl}`);
    }
    
    // Extract bid security
    let bidSecurity = '';
    const bidSecurityMatch = html.match(/(?:bid security|bank guarantee)[^<]*/i);
    if (bidSecurityMatch) {
      bidSecurity = bidSecurityMatch[0].replace(/<[^>]+>/g, '').trim().substring(0, 100);
    }
    
    // Extract performance guarantee
    let performanceGuarantee = '';
    const perfMatch = html.match(/(?:performance guarantee|performance bond)[^<]*/i);
    if (perfMatch) {
      performanceGuarantee = perfMatch[0].replace(/<[^>]+>/g, '').trim().substring(0, 100);
    }
    
    // Extract funding
    let funding = '';
    const fundingMatch = html.match(/(?:funded by|financed by|budget|grant)[^<]*/i);
    if (fundingMatch) {
      funding = fundingMatch[0].replace(/<[^>]+>/g, '').trim().substring(0, 100);
    }
    
    // Extract project
    let project = '';
    const projectMatch = html.match(/(?:project name|project title|development project)[^<]*/i);
    if (projectMatch) {
      project = projectMatch[0].replace(/<[^>]+>/g, '').trim().substring(0, 100);
    }
    
    // Extract eligibility
    let eligibility = '';
    const eligibilityMatch = html.match(/(?:eligible|eligibility criteria|who can apply)[^<]*/i);
    if (eligibilityMatch) {
      eligibility = eligibilityMatch[0].replace(/<[^>]+>/g, '').trim().substring(0, 200);
    }
    
    // Determine category
    let category = 'Other';
    const categoryMap = {
      'IT': ['computer', 'software', 'hardware', 'network', 'IT', 'system', 'server', 'laptop', 'desktop', 'monitor', 'tablet', 'switch', 'ram', 'pc', 'ups'],
      'Construction': ['construction', 'building', 'civil', 'infrastructure', 'road', 'bridge', 'flood', 'coastal', 'harbor', 'jetty'],
      'Medical': ['medical', 'hospital', 'health', 'pharmaceutical', 'medicine', 'scan', 'doppler', 'echocardiography', 'equipment'],
      'Office Supplies': ['office', 'stationery', 'furniture', 'chair', 'desk', 'cabinet', 'cupboard'],
      'Vehicle': ['vehicle', 'car', 'bus', 'truck', 'transport', 'motorcycle', 'ambulance', 'boat'],
      'Consultancy': ['consultancy', 'consultant', 'service', 'advisory', 'study', 'survey'],
      'Electrical': ['electrical', 'generator', 'wiring', 'power', 'cable', 'stelco', 'electric'],
      'Printing': ['printing', 'press', 'banner', 'brochure', 'publication', 'book'],
      'Catering': ['catering', 'food', 'meal', 'restaurant', 'canteen'],
      'Security': ['security', 'cctv', 'camera', 'alarm', 'surveillance'],
      'Safety': ['safety', 'gloves', 'helmet', 'ppe', 'protective'],
      'Machinery': ['machinery', 'equipment', 'machines', 'tools'],
      'Agriculture': ['agriculture', 'farm', 'crop', 'fertilizer', 'seeds'],
      'Education': ['school', 'education', 'training', 'student', 'learning'],
      'Sports': ['sports', 'gym', 'fitness', 'playground'],
      'Awards': ['award', 'trophy', 'medal', 'certificate'],
      'Apparel': ['uniform', 'clothing', 'apparel', 'fabric', 'textile']
    };
    
    const lowerHtml = html.toLowerCase();
    const lowerTitle = title.toLowerCase();
    for (const [cat, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(k => lowerHtml.includes(k) || lowerTitle.includes(k))) {
        category = cat;
        break;
      }
    }
    console.log(`  ✓ Category: ${category}`);
    
    // Parse dates
    const submissionDeadline = isoDateMatches[0] || dateMatches[0] || '';
    const bidOpeningDate = isoDateMatches[1] || dateMatches[1] || '';
    const registrationDeadline = isoDateMatches[2] || dateMatches[2] || '';
    
    // Parse times
    const submissionTime = timeMatches[0] || '';
    const bidOpeningTime = timeMatches[1] || '';
    
    return {
      id: tenderId,
      gazette_id: tenderId,
      title: title || `Tender ${tenderId}`,
      title_dhivehi: titleDhivehi,
      authority: authority,
      category: category,
      tender_no: tenderId,
      requirements: {},
      submission_deadline: submissionDeadline,
      submission_time: submissionTime,
      bid_opening_date: bidOpeningDate,
      bid_opening_time: bidOpeningTime,
      registration_deadline: registrationDeadline,
      registration_time: '',
      bid_submission: '',
      bid_time: '',
      clarification_deadline: '',
      clarification_time: '',
      pre_bid_meeting: '',
      inquiry_deadline: '',
      inquiry_time: '',
      contact_email: contactEmail,
      contact_phones: contactPhones,
      contact_name: '',
      gazette_url: url,
      info_sheet_url: infoSheetUrl,
      portal: 'gazette.gov.mv',
      eligibility: eligibility,
      bid_security: bidSecurity,
      performance_guarantee: performanceGuarantee,
      funding: funding,
      project: project,
      lots: null,
      status: 'Open',
      result: 'Pending',
      bid_amount: null,
      cost_estimate: '',
      profit_margin: '',
      documents: [],
      notes: `Working tender - fully scraped from ${url}`,
      scraped_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
    
    return {
      id: tenderId,
      gazette_id: tenderId,
      title: `Tender ${tenderId} (Fetch Failed)`,
      gazette_url: url,
      status: 'Open',
      result: 'Pending',
      notes: `Failed: ${error.message}`,
      scraped_at: new Date().toISOString(),
      error: error.message
    };
  }
}

// Main test
async function main() {
  console.log('='.repeat(70));
  console.log('TEST: Single Tender Scrape (like lost_bids scraper)');
  console.log('='.repeat(70));
  console.log('');
  
  const tender = await scrapeFullTender(testUrl);
  
  console.log('\n' + '='.repeat(70));
  console.log('Result:');
  console.log('='.repeat(70));
  console.log(JSON.stringify(tender, null, 2));
  console.log('='.repeat(70));
  
  // Save to test file
  const outputPath = join(__dirname, '../data/test_working_full.json');
  const data = {
    metadata: {
      total_tenders: 1,
      last_updated: new Date().toISOString(),
      source: 'gazette.gov.mv',
      type: 'Test - Working Tender Full',
      description: 'Test scrape with full details like lost_bids'
    },
    tenders: [tender]
  };
  
  writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Saved to: data/test_working_full.json`);
  console.log('');
  console.log('If this looks good, run the full scraper for all 43 URLs');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
