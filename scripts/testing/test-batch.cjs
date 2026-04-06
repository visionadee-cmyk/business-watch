const { writeFileSync } = require('fs');
const path = require('path');
const https = require('https');

// Test with just first 5 URLs
const testUrls = [
  "https://gazette.gov.mv/iulaan/383803",
  "https://gazette.gov.mv/iulaan/383540",
  "https://gazette.gov.mv/iulaan/385034"
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
  console.log(`Scraping ${id}...`);
  
  try {
    const html = await fetchUrl(url);
    
    // Extract title - try multiple patterns
    let title = '';
    
    // Try h1 tag
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      title = h1Match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    
    // Try meta title
    if (!title || title.length < 10) {
      const metaMatch = html.match(/<title>(.*?)<\/title>/i);
      if (metaMatch) {
        title = metaMatch[1].replace(/\s+/g, ' ').trim();
      }
    }
    
    // Try og:title
    if (!title || title.length < 10) {
      const ogMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)/i);
      if (ogMatch) {
        title = ogMatch[1].trim();
      }
    }
    
    // Fallback to first large text block
    if (!title || title.length < 10) {
      const textMatch = html.match(/>([^<]{50,200})</);
      if (textMatch) {
        title = textMatch[1].replace(/\s+/g, ' ').trim();
      }
    }
    
    if (title) {
      console.log(`  ✓ Title: ${title.substring(0, 80)}...`);
    }
    
    // Extract authority/company name
    let authority = '';
    const authorityPatterns = [
      /Islamic University[^<]*/i,
      /University of Maldives[^<]*/i,
      /އިސްލާމީ[^<]*ޔުނިވަރސިޓީ/i,
      /Ministry[^<]*/i,
      /Corporation[^<]*/i,
      /Agency[^<]*/i,
      /އިދާރާ[^<]*/,
      /މިނިސްޓްރީ[^<]*/
    ];
    for (const pattern of authorityPatterns) {
      const match = html.match(pattern);
      if (match) {
        authority = match[0].replace(/<[^>]+>/g, '').trim();
        break;
      }
    }
    
    // Extract requirements from title (English and Dhivehi)
    // Extract requirements from title (translate Dhivehi to English first)
    const requirements = {};
    
    // Dhivehi to English term mapping for common procurement items
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
    
    // Extract quantity + Dhivehi term pairs from title
    const qtyPattern = /(\d+)\s*([\u0780-\u07BF]+)/g;
    let match;
    while ((match = qtyPattern.exec(title)) !== null) {
      const qty = parseInt(match[1]);
      const dhivehiWord = match[2];
      
      // Translate to English if known
      const englishTerm = dhivehiTerms[dhivehiWord];
      if (englishTerm) {
        requirements[englishTerm] = qty;
      }
    }
    
    // Also check for English terms in title
    const monitorMatch = title.match(/(\d+)\s*(?:Monitor|Monitors)/i);
    const laptopMatch = title.match(/(\d+)\s*(?:Laptop|Laptops)/i);
    const desktopMatch = title.match(/(\d+)\s*(?:Desktop|Desktops)/i);
    const serverMatch = title.match(/(\d+)\s*(?:Server|Servers)/i);
    const printerMatch = title.match(/(\d+)\s*(?:Printer|Printers)/i);
    const fenderMatch = title.match(/(\d+)\s*(?:C-type|C type|rubber fender|fenders)/i);
    
    if (monitorMatch) requirements.monitors = parseInt(monitorMatch[1]);
    if (laptopMatch) requirements.laptops = parseInt(laptopMatch[1]);
    if (desktopMatch) requirements.desktops = parseInt(desktopMatch[1]);
    if (serverMatch) requirements.servers = parseInt(serverMatch[1]);
    if (printerMatch) requirements.printers = parseInt(printerMatch[1]);
    if (fenderMatch) requirements.fenders = parseInt(fenderMatch[1]);
    
    if (Object.keys(requirements).length > 0) {
      console.log(`  ✓ Requirements:`, requirements);
    }
    
    if (authority) {
      console.log(`  ✓ Authority:`, authority.substring(0, 50));
    }
    
    // Extract Dhivehi dates
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
    
    console.log(`  ✓ Found ${dates.length} dates:`, dates);
    
    return {
      id,
      gazette_id: id,
      title: title || `Tender ${id}`,
      authority: authority || '',
      requirements: requirements,
      bid_opening_date: dates[0] || '',
      submission_deadline: dates[dates.length - 1] || dates[0] || '',
      clarification_deadline: dates.length >= 2 ? dates[dates.length - 2] : dates[0] || '',
      pre_bid_meeting: dates[dates.length - 1] || dates[0] || '',
      gazette_url: url,
      scraped_at: new Date().toISOString()
    };
  } catch (err) {
    console.log(`  ⚠️ Error: ${err.message}`);
    return { id, gazette_id: id, title: `Tender ${id} (Error)`, gazette_url: url, error: err.message };
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('Testing batch scraper');
  console.log('='.repeat(50));
  
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
      source: 'gazette.gov.mv'
    },
    tenders: results
  };
  
  writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n✅ Saved ${results.length} tenders to ${outputPath}`);
}

main().catch(console.error);
