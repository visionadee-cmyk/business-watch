const https = require('https');
const { writeFileSync } = require('fs');
const { join } = require('path');

// Free translation using LibreTranslate (no API key required for public instance)
async function translateDhivehiToEnglish(text) {
  if (!text || !/[ހ-ޱ]/.test(text)) return text; // Return as-is if no Dhivehi
  
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      q: text,
      source: 'dv', // Dhivehi
      target: 'en',
      format: 'text'
    });
    
    const options = {
      hostname: 'libretranslate.de',
      port: 443,
      path: '/translate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.translatedText || text);
        } catch {
          resolve(text);
        }
      });
    });
    
    req.on('error', () => resolve(text));
    req.on('timeout', () => { req.destroy(); resolve(text); });
    req.write(postData);
    req.end();
  });
}

// Extract requirements from English text
function extractRequirementsEnglish(text) {
  const requirements = {};
  if (!text) return requirements;
  
  const patterns = [
    { regex: /(\d+)\s*(?:fender|fenders)/i, key: 'fenders' },
    { regex: /(\d+)\s*(?:monitor|monitors|display|displays)/i, key: 'monitors' },
    { regex: /(\d+)\s*(?:laptop|laptops|notebook|notebooks)/i, key: 'laptops' },
    { regex: /(\d+)\s*(?:desktop|desktops|pc|pcs)/i, key: 'desktops' },
    { regex: /(\d+)\s*(?:server|servers)/i, key: 'servers' },
    { regex: /(\d+)\s*(?:printer|printers)/i, key: 'printers' },
    { regex: /(\d+)\s*(?:computer|computers)/i, key: 'computers' },
    { regex: /(\d+)\s*(?:hard\s*disk|harddisks?|hdd)/i, key: 'harddisks' },
    { regex: /(\d+)\s*(?:mouse|mouses?)/i, key: 'mouses' },
    { regex: /(\d+)\s*(?:keyboard|keyboards)/i, key: 'keyboards' },
    { regex: /(\d+)\s*(?:camera|cameras|cctv)/i, key: 'cameras' },
    { regex: /(\d+)\s*(?:tv|television|tvs)/i, key: 'tvs' },
    { regex: /(\d+)\s*(?:chair|chairs)/i, key: 'chairs' },
    { regex: /(\d+)\s*(?:desk|desks|table|tables)/i, key: 'desks' },
    { regex: /(\d+)\s*(?:vehicle|vehicles|car|cars|truck|trucks)/i, key: 'vehicles' },
    { regex: /(\d+)\s*(?:phone|phones|telephone)/i, key: 'phones' },
    { regex: /(\d+)\s*(?:ac|a\/c|air\s*conditioner)/i, key: 'ac_units' },
    { regex: /(\d+)\s*(?:generator|generators)/i, key: 'generators' }
  ];
  
  for (const { regex, key } of patterns) {
    const match = text.match(regex);
    if (match) {
      requirements[key] = parseInt(match[1]);
    }
  }
  
  return requirements;
}

// Test URLs
const testUrls = [
  'https://gazette.gov.mv/iulaan/383803',  // 50 fenders
  'https://gazette.gov.mv/iulaan/383540',  // monitors, laptops
  'https://gazette.gov.mv/iulaan/384673'   // computers
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 15000 
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrapeWithTranslation(url) {
  const id = url.match(/(\d+)/)[1];
  console.log(`\n=== Scraping ${id} ===`);
  
  try {
    const html = await fetchUrl(url);
    
    // Get title
    const classTitleMatch = html.match(/class=['"][^'"]*title[^'"]*['"][^>]*>([^<]+)/i);
    const title = classTitleMatch ? classTitleMatch[1].trim() : '';
    
    console.log('Original (Dhivehi):', title.substring(0, 100));
    
    // Translate
    const translated = await translateDhivehiToEnglish(title);
    console.log('Translated (English):', translated.substring(0, 100));
    
    // Extract requirements
    const requirements = extractRequirementsEnglish(translated);
    console.log('Requirements:', JSON.stringify(requirements));
    
    return { id, title, translated, requirements };
    
  } catch (err) {
    console.log('Error:', err.message);
    return { id, title: '', translated: '', requirements: {}, error: err.message };
  }
}

async function main() {
  console.log('========================================');
  console.log('AI-Powered Tender Scraping with Translation');
  console.log('Using: LibreTranslate (Free, No API Key)');
  console.log('========================================\n');
  
  const results = [];
  for (const url of testUrls) {
    const result = await scrapeWithTranslation(url);
    results.push(result);
    await new Promise(r => setTimeout(r, 1000)); // Be nice to the API
  }
  
  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  results.forEach(r => {
    console.log(`${r.id}: ${JSON.stringify(r.requirements)}`);
  });
  
  // Save results
  const outputPath = join(__dirname, '../data/lost_bids_ai.json');
  writeFileSync(outputPath, JSON.stringify({ 
    metadata: { scraped_at: new Date().toISOString(), method: 'AI translation' },
    tenders: results 
  }, null, 2));
  console.log(`\n✅ Saved to ${outputPath}`);
}

main().catch(console.error);
