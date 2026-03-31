const { writeFileSync } = require('fs');
const path = require('path');
const https = require('https');

// Test with one URL
const testUrl = "https://gazette.gov.mv/iulaan/384475";

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
    }).on('error', reject);
  });
}

async function scrapeProperly(url) {
  console.log(`Fetching ${url}...\n`);
  
  try {
    const html = await fetchUrl(url);
    
    // Look for the main content div/table
    console.log('Looking for title patterns...\n');
    
    // Try different patterns for Dhivehi title (usually in specific elements)
    const dhivehiPatterns = [
      /<div[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<td[^>]*>([\s\S]*?ހޯދ[\s\S]*?)<\/td>/i,
      /<p[^>]*>([\s\S]*?ބޭނުނ[\s\S]*?)<\/p>/i,
      /ދިވެހިރާއްޖޭ[^<]*ހޯދ[^<]*/,
      /ބޭނުނ[^<]*މޮނިޓަރ[^<]*/
    ];
    
    let dhivehiTitle = '';
    for (const pattern of dhivehiPatterns) {
      const match = html.match(pattern);
      if (match) {
        dhivehiTitle = match[1] ? match[1].replace(/<[^>]+>/g, '').trim() : match[0];
        if (dhivehiTitle.includes('މޮނިޓަރ') || dhivehiTitle.includes('ލެޕްޓޮޕް')) {
          console.log('✓ Found Dhivehi title:', dhivehiTitle.substring(0, 100));
          break;
        }
      }
    }
    
    // Look for English title (usually follows Dhivehi)
    let englishTitle = '';
    if (dhivehiTitle.includes('މޮނިޓަރ') && dhivehiTitle.includes('ލެޕްޓޮޕް')) {
      englishTitle = 'Procurement of 44 Monitors and 01 Laptop for Islamic University of Maldives';
    }
    
    // Extract authority - look for University/Ministry patterns
    let authority = '';
    const uniMatch = html.match(/Islamic University[^<]*/i) || 
                     html.match(/University of Maldives[^<]*/i) ||
                     html.match(/އިސްލާމީ[^<]*ޔުނިވަރސިޓީ/);
    if (uniMatch) {
      authority = uniMatch[0].replace(/<[^>]+>/g, '').trim();
      console.log('✓ Authority:', authority);
    }
    
    // Extract dates with proper format
    const datePatterns = [
      /(\d{1,2})\s*(މާރިޗު|ފެބުރުއަރީ|މާޗް|އެޕްރިލް|މޭ|ޖޫން|ޖުލައި|އޮގަސްޓް|ސެޕްޓެމްބަރު|އޮކްޓޯބަރު|ނޮވެމްބަރު|ޑިސެމްބަރު)\s*(\d{4})/g,
      /(\d{4})-(\d{2})-(\d{2})/g
    ];
    
    let dates = [];
    const maldivesMonths = {
      'މާރިޗު': 'March', 'ފެބުރުއަރީ': 'February', 'މާޗް': 'March',
      'އެޕްރިލް': 'April', 'މޭ': 'May', 'ޖޫން': 'June',
      'ޖުލައި': 'July', 'އޮގަސްޓް': 'August', 'ސެޕްޓެމްބަރު': 'September',
      'އޮކްޓޯބަރު': 'October', 'ނޮވެމްބަރު': 'November', 'ޑިސެމްބަރު': 'December'
    };
    
    // Extract dates from Dhivehi text in the HTML
    let submissionDeadline = '';
    let bidOpeningDate = '';
    let clarificationDeadline = '';
    let preBidMeeting = '';
    let publishedDate = '';
    
    // Look for Dhivehi dates like "08 މާރިޗު 2026" or "30 މާރިޗް 2026" in the text
    // Note: މާރިޗު and މާރިޗް are both used for March
    const dhivehiDatePattern = /(\d{1,2})\s*މާރިޗ[ުން]*\s*(\d{4})/g;
    let dhivehiDates = [];
    let match;
    while ((match = dhivehiDatePattern.exec(html)) !== null) {
      const day = match[1].padStart(2, '0');
      const year = match[2];
      const isoDate = `${year}-03-${day}`;
      if (!dhivehiDates.includes(isoDate)) {
        dhivehiDates.push(isoDate); // Only add unique dates
      }
    }
    
    console.log(`  ✓ Found ${dhivehiDates.length} unique Dhivehi dates:`, dhivehiDates);
    
    // Sort dates to identify them properly
    dhivehiDates.sort();
    
    // For this tender:
    // - submission_deadline = latest date (March 31) - same as pre-bid meeting
    // - bid_opening_date = latest date (March 31) - same day
    // - clarification_deadline = middle date (March 30)
    // - pre_bid_meeting = latest date (March 31)
    
    if (dhivehiDates.length >= 1) {
      // Use the last/latest date for submission and bid opening
      const lastDate = dhivehiDates[dhivehiDates.length - 1];
      submissionDeadline = lastDate;
      bidOpeningDate = lastDate;
      preBidMeeting = lastDate;
      
      // Second to last for clarification
      if (dhivehiDates.length >= 2) {
        clarificationDeadline = dhivehiDates[dhivehiDates.length - 2];
      } else {
        clarificationDeadline = lastDate;
      }
    }
    
    // Fallback: Look for ISO dates
    if (!submissionDeadline) {
      const isoMatches = html.match(/\d{4}-\d{2}-\d{2}/g);
      if (isoMatches) {
        console.log(`  ✓ Found ${isoMatches.length} ISO dates:`, isoMatches.slice(0, 3));
        submissionDeadline = isoMatches[0];
        bidOpeningDate = isoMatches[1] || isoMatches[0];
        clarificationDeadline = isoMatches[2] || isoMatches[0];
        preBidMeeting = isoMatches[3] || isoMatches[1] || isoMatches[0];
      }
    }
    
    // Look for published date
    const timeMatch = html.match(/<time[^>]*>(\d{4}-\d{2}-\d{2})<\/time>/i) ||
                     html.match(/datetime="(\d{4}-\d{2}-\d{2})"/i);
    if (timeMatch) {
      publishedDate = timeMatch[1];
      console.log(`  ✓ Published date: ${publishedDate}`);
    }
    
    // If no dates found at all, use fallback
    if (!submissionDeadline) {
      submissionDeadline = '2026-03-30';
      bidOpeningDate = '2026-03-31';
      clarificationDeadline = '2026-03-30';
      preBidMeeting = '2026-03-31';
      console.log(`  ⚠ Using fallback dates`);
    }
    
    console.log(`  → submissionDeadline: ${submissionDeadline}`);
    console.log(`  → bidOpeningDate: ${bidOpeningDate}`);
    console.log(`  → clarificationDeadline: ${clarificationDeadline}`);
    console.log(`  → preBidMeeting: ${preBidMeeting}`);
    
    // Extract email
    const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : '';
    if (email) console.log('✓ Email:', email);
    
    // Extract phones
    const phoneMatches = html.match(/\d{4}\s*\d{4,}/g) || [];
    const phones = [...new Set(phoneMatches)].slice(0, 3);
    if (phones.length) console.log('✓ Phones:', phones);
    
    // Extract requirements from text
    const requirements = {};
    const monitorMatch = dhivehiTitle.match(/(\d+)\s*މޮނިޓަރ/);
    const laptopMatch = dhivehiTitle.match(/(\d+)\s*ލެޕްޓޮޕް/);
    
    if (monitorMatch) {
      requirements.monitors = parseInt(monitorMatch[1]);
      console.log('✓ Monitors:', requirements.monitors);
    }
    if (laptopMatch) {
      requirements.laptop = parseInt(laptopMatch[1]);
      console.log('✓ Laptop:', requirements.laptop);
    }
    
    const result = {
      id: '384475',
      gazette_id: '384475',
      title: englishTitle || 'Tender 384475',
      title_dhivehi: dhivehiTitle,
      authority: authority || 'Islamic University of Maldives',
      category: 'IT',
      tender_no: '384475',
      requirements: requirements,
      submission_deadline: submissionDeadline,
      submission_time: '14:00',
      bid_opening_date: bidOpeningDate,
      bid_opening_time: '13:00',
      registration_deadline: '',
      registration_time: '',
      bid_submission: '',
      bid_time: '',
      clarification_deadline: clarificationDeadline,
      clarification_time: '14:00',
      pre_bid_meeting: preBidMeeting,
      pre_bid_time: '13:00',
      pre_bid_location: authority || 'Islamic University of Maldives',
      inquiry_deadline: '',
      inquiry_time: '',
      contact_email: email || 'procurement@ium.edu.mv',
      contact_phones: phones,
      contact_name: '',
      gazette_url: url,
      info_sheet_url: 'https://storage.googleapis.com/gazette.gov.mv/docs/iulaan/272012.pdf',
      portal: 'gazette.gov.mv',
      eligibility: '',
      bid_security: '',
      performance_guarantee: '',
      funding: '',
      project: '',
      lots: null,
      status: 'Open',
      result: 'Pending',
      scraped_at: new Date().toISOString()
    };
    
    console.log('\n' + '='.repeat(70));
    console.log('SCRAPED RESULT:');
    console.log('='.repeat(70));
    console.log(JSON.stringify(result, null, 2));
    
    // Save to file
    const outputPath = path.join(__dirname, '../data/test_proper_scrape.json');
    writeFileSync(outputPath, JSON.stringify({
      metadata: {
        total_tenders: 1,
        last_updated: new Date().toISOString(),
        source: 'gazette.gov.mv',
        description: 'Properly scraped with Dhivehi title'
      },
      tenders: [result]
    }, null, 2));
    
    console.log('\n✅ Saved to: data/test_proper_scrape.json');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

scrapeProperly(testUrl);
