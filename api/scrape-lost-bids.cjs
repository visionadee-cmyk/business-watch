const { writeFileSync } = require('fs');
const { join } = require('path');
const https = require('https');
const http = require('http');

// All lost bid Gazette URLs (removed duplicates)
const lostBidUrls = [
  "https://gazette.gov.mv/iulaan/383803",
  "https://gazette.gov.mv/iulaan/383540",
  "https://gazette.gov.mv/iulaan/385034",
  "https://gazette.gov.mv/iulaan/385028",
  "https://gazette.gov.mv/iulaan/383938",
  "https://gazette.gov.mv/iulaan/383100",
  "https://gazette.gov.mv/iulaan/383425",
  "https://gazette.gov.mv/iulaan/383491",
  "https://gazette.gov.mv/iulaan/382353",
  "https://gazette.gov.mv/iulaan/383371",
  "https://gazette.gov.mv/iulaan/383363",
  "https://gazette.gov.mv/iulaan/383546",
  "https://gazette.gov.mv/iulaan/383755",
  "https://gazette.gov.mv/iulaan/383744",
  "https://gazette.gov.mv/iulaan/384252",
  "https://gazette.gov.mv/iulaan/384253",
  "https://gazette.gov.mv/iulaan/384254",
  "https://gazette.gov.mv/iulaan/384255",
  "https://gazette.gov.mv/iulaan/383628",
  "https://gazette.gov.mv/iulaan/383800",
  "https://gazette.gov.mv/iulaan/383827",
  "https://gazette.gov.mv/iulaan/383310",
  "https://gazette.gov.mv/iulaan/383000",
  "https://gazette.gov.mv/iulaan/383042",
  "https://gazette.gov.mv/iulaan/383372",
  "https://gazette.gov.mv/iulaan/384673",
  "https://gazette.gov.mv/iulaan/384736",
  "https://gazette.gov.mv/iulaan/384553",
  "https://gazette.gov.mv/iulaan/384190",
  "https://gazette.gov.mv/iulaan/384573",
  "https://gazette.gov.mv/iulaan/383582",
  "https://gazette.gov.mv/iulaan/383053",
  "https://gazette.gov.mv/iulaan/383435",
  "https://gazette.gov.mv/iulaan/384047",
  "https://gazette.gov.mv/iulaan/384048",
  "https://gazette.gov.mv/iulaan/383370",
  "https://gazette.gov.mv/iulaan/384043",
  "https://gazette.gov.mv/iulaan/384241",
  "https://gazette.gov.mv/iulaan/384248",
  "https://gazette.gov.mv/iulaan/382823",
  "https://gazette.gov.mv/iulaan/382890",
  "https://gazette.gov.mv/iulaan/382962",
  "https://gazette.gov.mv/iulaan/382635",
  "https://gazette.gov.mv/iulaan/383112",
  "https://gazette.gov.mv/iulaan/383648",
  "https://gazette.gov.mv/iulaan/382750",
  "https://gazette.gov.mv/iulaan/383047",
  "https://gazette.gov.mv/iulaan/382154",
  "https://gazette.gov.mv/iulaan/382752",
  "https://gazette.gov.mv/iulaan/382429",
  "https://gazette.gov.mv/iulaan/382341",
  "https://gazette.gov.mv/iulaan/382730",
  "https://gazette.gov.mv/iulaan/382379",
  "https://gazette.gov.mv/iulaan/382297",
  "https://gazette.gov.mv/iulaan/382958",
  "https://gazette.gov.mv/iulaan/380188",
  "https://gazette.gov.mv/iulaan/382717",
  "https://gazette.gov.mv/iulaan/382686",
  "https://gazette.gov.mv/iulaan/381032",
  "https://gazette.gov.mv/iulaan/381073",
  "https://gazette.gov.mv/iulaan/382250",
  "https://gazette.gov.mv/iulaan/381063",
  "https://storage.googleapis.com/gazette.gov.mv/docs/iulaan/269387.pdf",
  "https://gazette.gov.mv/iulaan/380147",
  "https://gazette.gov.mv/iulaan/379887",
  "https://gazette.gov.mv/iulaan/380923",
  "https://gazette.gov.mv/iulaan/380919",
  "https://gazette.gov.mv/iulaan/380019",
  "https://gazette.gov.mv/iulaan/379759",
  "https://gazette.gov.mv/iulaan/380241",
  "https://gazette.gov.mv/iulaan/380202",
  "https://gazette.gov.mv/iulaan/379742",
  "https://gazette.gov.mv/iulaan/379432",
  "https://gazette.gov.mv/iulaan/377980",
  "https://gazette.gov.mv/iulaan/379740",
  "https://gazette.gov.mv/iulaan/379253",
  "https://gazette.gov.mv/iulaan/379323",
  "https://gazette.gov.mv/iulaan/379577",
  "https://gazette.gov.mv/iulaan/379772",
  "https://gazette.gov.mv/iulaan/379976",
  "https://gazette.gov.mv/iulaan/379942",
  "https://gazette.gov.mv/iulaan/373289",
  "https://gazette.gov.mv/iulaan/378980",
  "https://gazette.gov.mv/iulaan/379520",
  "https://gazette.gov.mv/iulaan/378938",
  "https://gazette.gov.mv/iulaan/378999",
  "https://gazette.gov.mv/iulaan/379009",
  "https://gazette.gov.mv/iulaan/379107",
  "https://gazette.gov.mv/iulaan/379600",
  "https://gazette.gov.mv/iulaan/378865",
  "https://gazette.gov.mv/iulaan/378902",
  "https://gazette.gov.mv/iulaan/379739",
  "https://gazette.gov.mv/iulaan/379428",
  "https://gazette.gov.mv/iulaan/378937",
  "https://gazette.gov.mv/iulaan/379071",
  "https://gazette.gov.mv/iulaan/379547",
  "https://gazette.gov.mv/iulaan/378677",
  "https://gazette.gov.mv/iulaan/378344",
  "https://gazette.gov.mv/iulaan/378506",
  "https://gazette.gov.mv/iulaan/378787",
  "https://gazette.gov.mv/iulaan/377047",
  "https://gazette.gov.mv/iulaan/376771",
  "https://gazette.gov.mv/iulaan/377601",
  "https://gazette.gov.mv/iulaan/377725",
  "https://gazette.gov.mv/iulaan/377682",
  "https://gazette.gov.mv/iulaan/377914",
  "https://gazette.gov.mv/iulaan/376992",
  "https://gazette.gov.mv/iulaan/377709",
  "https://gazette.gov.mv/iulaan/378155",
  "https://gazette.gov.mv/iulaan/378158",
  "https://gazette.gov.mv/iulaan/377599",
  "https://gazette.gov.mv/iulaan/377253",
  "https://gazette.gov.mv/iulaan/377603",
  "https://gazette.gov.mv/iulaan/378172",
  "https://gazette.gov.mv/iulaan/377947",
  "https://gazette.gov.mv/iulaan/377655",
  "https://gazette.gov.mv/iulaan/377626",
  "https://gazette.gov.mv/iulaan/377823",
  "https://gazette.gov.mv/iulaan/376991",
  "https://gazette.gov.mv/iulaan/377429",
  "https://gazette.gov.mv/iulaan/377908",
  "https://gazette.gov.mv/iulaan/377083",
  "https://gazette.gov.mv/iulaan/377427",
  "https://gazette.gov.mv/iulaan/377307",
  "https://gazette.gov.mv/iulaan/377910",
  "https://gazette.gov.mv/iulaan/377620",
  "https://gazette.gov.mv/iulaan/376138",
  "https://gazette.gov.mv/iulaan/376863",
  "https://gazette.gov.mv/iulaan/376731",
  "https://gazette.gov.mv/iulaan/377045",
  "https://gazette.gov.mv/iulaan/377408",
  "https://gazette.gov.mv/iulaan/376291",
  "https://gazette.gov.mv/iulaan/376224",
  "https://gazette.gov.mv/iulaan/376632",
  "https://gazette.gov.mv/iulaan/376233",
  "https://gazette.gov.mv/iulaan/376950",
  "https://gazette.gov.mv/iulaan/377259",
  "https://gazette.gov.mv/iulaan/376417",
  "https://gazette.gov.mv/iulaan/375437",
  "https://gazette.gov.mv/iulaan/376576",
  "https://gazette.gov.mv/iulaan/375021",
  "https://gazette.gov.mv/iulaan/375735",
  "https://gazette.gov.mv/iulaan/376763",
  "https://gazette.gov.mv/iulaan/375757",
  "https://gazette.gov.mv/iulaan/375798",
  "https://gazette.gov.mv/iulaan/374597",
  "https://gazette.gov.mv/iulaan/375612",
  "https://gazette.gov.mv/iulaan/375189",
  "https://gazette.gov.mv/iulaan/373772",
  "https://gazette.gov.mv/iulaan/375721",
  "https://gazette.gov.mv/iulaan/375733",
  "https://gazette.gov.mv/iulaan/375018",
  "https://gazette.gov.mv/iulaan/375020",
  "https://gazette.gov.mv/iulaan/375787",
  "https://gazette.gov.mv/iulaan/375788",
  "https://gazette.gov.mv/iulaan/375822",
  "https://gazette.gov.mv/iulaan/374896",
  "https://gazette.gov.mv/iulaan/375201",
  "https://gazette.gov.mv/iulaan/373628",
  "https://gazette.gov.mv/iulaan/374772",
  "https://gazette.gov.mv/iulaan/375464",
  "https://gazette.gov.mv/iulaan/378786",
  "https://gazette.gov.mv/iulaan/379815",
  "https://gazette.gov.mv/iulaan/380113",
  "https://gazette.gov.mv/iulaan/382197",
  "https://gazette.gov.mv/iulaan/382307"
];

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

// Scrape a single tender
async function scrapeTender(url, index) {
  const tenderId = extractId(url);
  console.log(`[${index + 1}/${lostBidUrls.length}] Scraping ${tenderId}...`);
  
  try {
    const html = await fetchUrl(url);
    
    // Extract title
    let title = '';
    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
    }
    
    // Try to find Dhivehi title (often in a different element)
    let titleDhivehi = '';
    const dhivehiMatch = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (dhivehiMatch && /[ހ-ޱ]/.test(dhivehiMatch[1])) {
      titleDhivehi = dhivehiMatch[1].replace(/<[^>]+>/g, '').trim();
    }
    
    // Extract authority
    let authority = '';
    const authorityPatterns = [
      /(?:Ministry|އިސްލާހު|Department|Agency|Office|Authority|Corporation|Company|ކުންފުނި)[^<]*/i,
      /<td[^>]*>\s*(?:Ministry|Department|Agency|Office)[^<]*/i
    ];
    for (const pattern of authorityPatterns) {
      const match = html.match(pattern);
      if (match) {
        authority = match[0].replace(/<[^>]+>/g, '').trim().substring(0, 100);
        break;
      }
    }
    
    // Extract dates from Dhivehi text in the HTML
    let submissionDeadline = '';
    let bidOpeningDate = '';
    let clarificationDeadline = '';
    let preBidMeeting = '';
    
    // Look for Dhivehi dates like "08 މާރިޗު 2026" or "30 މާރިޗް 2026"
    const dhivehiDatePattern = /(\d{1,2})\s*މާރިޗ[ުން]*\s*(\d{4})/g;
    let dhivehiDates = [];
    let match;
    while ((match = dhivehiDatePattern.exec(html)) !== null) {
      const day = match[1].padStart(2, '0');
      const year = match[2];
      const isoDate = `${year}-03-${day}`;
      if (!dhivehiDates.includes(isoDate)) {
        dhivehiDates.push(isoDate);
      }
    }
    
    // Sort dates
    dhivehiDates.sort();
    
    // Map dates: earliest = bid opening, latest = submission/pre-bid
    if (dhivehiDates.length >= 1) {
      bidOpeningDate = dhivehiDates[0];
      const lastDate = dhivehiDates[dhivehiDates.length - 1];
      submissionDeadline = lastDate;
      preBidMeeting = lastDate;
      if (dhivehiDates.length >= 2) {
        clarificationDeadline = dhivehiDates[dhivehiDates.length - 2];
      } else {
        clarificationDeadline = lastDate;
      }
    }
    
    // Fallback to basic date extraction
    if (!submissionDeadline) {
      const dateMatches = html.match(/\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}/g) || [];
      submissionDeadline = dateMatches[0] || '';
      bidOpeningDate = dateMatches[1] || dateMatches[0] || '';
      clarificationDeadline = dateMatches[2] || dateMatches[0] || '';
      preBidMeeting = dateMatches[3] || dateMatches[1] || dateMatches[0] || '';
    }
    
    // Extract email
    const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const contactEmail = emailMatch ? emailMatch[0] : '';
    
    // Extract phone numbers
    const phoneMatches = html.match(/\+?\d[\d\s-]{6,}/g) || [];
    const contactPhones = [...new Set(phoneMatches)].slice(0, 3);
    
    // Determine category from content
    let category = 'Other';
    const categoryMap = {
      'IT': ['computer', 'software', 'hardware', 'network', 'IT', 'system', 'server'],
      'Construction': ['construction', 'building', 'civil', 'infrastructure', 'road', 'bridge'],
      'Medical': ['medical', 'hospital', 'health', 'pharmaceutical', 'medicine'],
      'Office Supplies': ['office', 'stationery', 'furniture', 'chair', 'desk'],
      'Vehicle': ['vehicle', 'car', 'bus', 'truck', 'transport', 'motorcycle'],
      'Consultancy': ['consultancy', 'consultant', 'service', 'advisory'],
      'Electrical': ['electrical', 'generator', 'wiring', 'power'],
      'Printing': ['printing', 'press', 'banner', 'brochure'],
      'Catering': ['catering', 'food', 'meal', 'restaurant'],
      'Security': ['security', 'CCTV', 'camera', 'alarm'],
      'Maintenance': ['maintenance', 'repair', 'service']
    };
    
    const lowerHtml = html.toLowerCase();
    const lowerTitle = title.toLowerCase();
    for (const [cat, keywords] of Object.entries(categoryMap)) {
      if (keywords.some(k => lowerHtml.includes(k) || lowerTitle.includes(k))) {
        category = cat;
        break;
      }
    }
    
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
      submission_time: '',
      bid_opening_date: bidOpeningDate,
      bid_opening_time: '',
      registration_deadline: '',
      registration_time: '',
      bid_submission: '',
      bid_time: '',
      clarification_deadline: clarificationDeadline,
      clarification_time: '',
      pre_bid_meeting: preBidMeeting,
      contact_email: contactEmail,
      contact_phones: contactPhones,
      contact_name: '',
      gazette_url: url,
      info_sheet_url: '',
      portal: 'gazette.gov.mv',
      eligibility: '',
      bid_security: '',
      performance_guarantee: '',
      funding: '',
      project: '',
      lots: null,
      status: 'Closed',
      result: 'Lost',
      bid_amount: null,
      cost_estimate: '',
      profit_margin: '',
      documents: [],
      notes: `Lost bid scraped from ${url}`,
      scraped_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.log(`  ⚠️ Error: ${error.message}`);
    
    // Return basic data on error
    return {
      id: tenderId,
      gazette_id: tenderId,
      title: `Tender ${tenderId} (Fetch Failed)`,
      title_dhivehi: '',
      authority: '',
      category: 'Other',
      tender_no: tenderId,
      requirements: {},
      submission_deadline: '',
      submission_time: '',
      bid_opening_date: '',
      bid_opening_time: '',
      registration_deadline: '',
      registration_time: '',
      bid_submission: '',
      bid_time: '',
      clarification_deadline: '',
      clarification_time: '',
      pre_bid_meeting: '',
      contact_email: '',
      contact_phones: [],
      contact_name: '',
      gazette_url: url,
      info_sheet_url: '',
      portal: 'gazette.gov.mv',
      eligibility: '',
      bid_security: '',
      performance_guarantee: '',
      funding: '',
      project: '',
      lots: null,
      status: 'Closed',
      result: 'Lost',
      bid_amount: null,
      cost_estimate: '',
      profit_margin: '',
      documents: [],
      notes: `Failed to fetch: ${error.message}`,
      scraped_at: new Date().toISOString(),
      error: error.message
    };
  }
}

// Save progress
function saveProgress(tenders) {
  const lostBidsPath = join(__dirname, '../data/lost_bids.json');
  const data = {
    metadata: {
      total_tenders: tenders.length,
      last_updated: new Date().toISOString(),
      source: 'gazette.gov.mv',
      type: 'Lost Bids',
      description: 'Batch scraped lost bid tender data'
    },
    tenders: tenders
  };
  
  writeFileSync(lostBidsPath, JSON.stringify(data, null, 2));
  console.log(`💾 Saved ${tenders.length} tenders to lost_bids.json`);
}

// Main scraping function
async function main() {
  console.log('='.repeat(70));
  console.log('Batch Scraping Lost Bids from Gazette.gov.mv');
  console.log('='.repeat(70));
  console.log(`Total URLs: ${lostBidUrls.length}`);
  console.log('');
  
  const results = [];
  const startTime = Date.now();
  
  for (let i = 0; i < lostBidUrls.length; i++) {
    const url = lostBidUrls[i];
    const tender = await scrapeTender(url, i);
    results.push(tender);
    
    // Save progress every 10 items
    if ((i + 1) % 10 === 0) {
      saveProgress(results);
    }
    
    // Small delay to be respectful
    if (i < lostBidUrls.length - 1) {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  
  // Final save
  saveProgress(results);
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const successful = results.filter(r => !r.error).length;
  const failed = results.filter(r => r.error).length;
  
  console.log('\n' + '='.repeat(70));
  console.log('Scraping Complete!');
  console.log('='.repeat(70));
  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Duration: ${duration}s`);
  console.log(`Output: data/lost_bids.json`);
  console.log('='.repeat(70));
}

// Run
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
