const { writeFileSync } = require('fs');
const path = require('path');
const https = require('https');

// Test URLs with known items
const testUrls = [
  "https://gazette.gov.mv/iulaan/383803", // 50 fenders
  "https://gazette.gov.mv/iulaan/383540", // Monitors/laptops
  "https://gazette.gov.mv/iulaan/384673"  // Another tender
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Status: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrapeOne(url) {
  const id = url.match(/(\d+)/)?.[1] || 'unknown';
  console.log(`\n[${id}] Scraping...`);
  
  try {
    const html = await fetchUrl(url);
    
    // Extract title from h1
    let title = '';
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      title = h1Match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    console.log(`  Title: ${title.substring(0, 80)}...`);
    
    // Extract authority
    let authority = '';
    const authMatch = html.match(/Islamic University[^<]*/i) || 
                      html.match(/Maldives Ports[^<]*/i) ||
                      html.match(/Ministry[^<]*/i) ||
                      html.match(/އިސްލާމީ[^<]*ޔުނިވަރސިޓީ/);
    if (authMatch) {
      authority = authMatch[0].replace(/<[^>]+>/g, '').trim();
      console.log(`  Authority: ${authority.substring(0, 50)}`);
    }
    
    // Extract dates
    const dhivehiMonths = {
      'ޖެނުއަރީ': '01', 'ފެބުރުއަރީ': '02', 'މާރިޗު': '03', 'މާރިޗް': '03',
      'އޭޕްރީލް': '04', 'މޭ': '05', 'ޖޫން': '06', 'ޖުލައި': '07',
      'އޮގަސްޓް': '08', 'ސެޕްޓެމްބަރު': '09', 'އޮކްޓޯބަރު': '10',
      'ނޮވެމްބަރު': '11', 'ޑިސެމްބަރު': '12'
    };
    
    const dhivehiDatePattern = /(\d{1,2})\s*(ޖެނުއަރީ|ފެބުރުއަރީ|މާރިޗ[ުން]*|އޭޕްރީލް|މޭ|ޖޫން|ޖުލައި|އޮގަސްޓް|ސެޕްޓެމްބަރު|އޮކްޓޯބަރު|ނޮވެމްބަރު|ޑިސެމްބަރު)\s*(\d{4})/g;
    let dates = [];
    let match;
    while ((match = dhivehiDatePattern.exec(html)) !== null) {
      const day = match[1].padStart(2, '0');
      const month = dhivehiMonths[match[2]] || '03';
      const year = match[3];
      const isoDate = `${year}-${month}-${day}`;
      if (!dates.includes(isoDate)) dates.push(isoDate);
    }
    dates.sort();
    console.log(`  Dates: ${dates.join(', ')}`);
    
    // Extract requirements - Dhivehi to English translation
    const requirements = {};
    const dhivehiTerms = {
      'މޮނިޓަރ': 'monitors',
      'ލެޕްޓޮޕް': 'laptops', 
      'ޑެސްކްޓޮޕް': 'desktops',
      'ސަރވަރ': 'servers',
      'ޕްރިންޓަރ': 'printers',
      'ފެންޑަރ': 'fenders',
      'ކޮމްޕިއުޓަރ': 'computers',
      'ހާޑްޑިސްކް': 'harddisks',
      'މައުސް': 'mouses',
      'ކީބޯޑް': 'keyboards'
    };
    
    // Find quantity + Dhivehi word pairs (handle formats like "50 (ފަންސާސް) ... ފެންޑަރ")
    // First, extract all numbers that appear before Dhivehi words
    const dhivehiWords = Object.keys(dhivehiTerms);
    for (const word of dhivehiWords) {
      // Pattern: number (optional text in parens) ... dhivehi word
      const pattern = new RegExp('(\\d+)\\s*(?:\\([^)]+\\))?[^' + word[0] + ']*' + word);
      const match = title.match(pattern);
      if (match) {
        requirements[dhivehiTerms[word]] = parseInt(match[1]);
        console.log(`  Found: ${match[1]} ${dhivehiTerms[word]} (from ${word})`);
      }
    }
    
    // Also check for English terms
    const monitorMatch = title.match(/(\d+)\s*(?:Monitor|Monitors)/i);
    const laptopMatch = title.match(/(\d+)\s*(?:Laptop|Laptops)/i);
    if (monitorMatch) requirements.monitors = parseInt(monitorMatch[1]);
    if (laptopMatch) requirements.laptops = parseInt(laptopMatch[1]);
    
    return {
      id,
      gazette_id: id,
      title: title || `Tender ${id}`,
      authority: authority || '',
      requirements,
      bid_opening_date: dates[0] || '',
      submission_deadline: dates[dates.length - 1] || dates[0] || '',
      clarification_deadline: dates.length >= 2 ? dates[dates.length - 2] : dates[0] || '',
      pre_bid_meeting: dates[dates.length - 1] || dates[0] || '',
      gazette_url: url,
      scraped_at: new Date().toISOString()
    };
  } catch (err) {
    console.log(`  ⚠️ Error: ${err.message}`);
    return { id, gazette_id: id, title: `Tender ${id} (Error)`, authority: '', requirements: {}, gazette_url: url, error: err.message };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Testing Requirements Extraction with Dhivehi Translation');
  console.log('='.repeat(60));
  
  const results = [];
  for (const url of testUrls) {
    const tender = await scrapeOne(url);
    results.push(tender);
  }
  
  const outputPath = path.join(__dirname, '../data/lost_bids.json');
  const data = {
    metadata: {
      total_tenders: results.length,
      last_updated: new Date().toISOString(),
      source: 'gazette.gov.mv',
      type: 'Lost Bids with Requirements'
    },
    tenders: results
  };
  
  writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Saved ${results.length} tenders to ${outputPath}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
