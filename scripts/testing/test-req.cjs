const https = require('https');

// Test URLs with known requirements
const testUrls = [
  'https://gazette.gov.mv/iulaan/383803',  // Should have 50 fenders
  'https://gazette.gov.mv/iulaan/383540',  // Should have monitors, laptops
  'https://gazette.gov.mv/iulaan/384673'   // Another test
];

// Dhivehi terms
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

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractRequirements(text) {
  const requirements = {};
  if (!text) return requirements;

  console.log('Searching text:', text.substring(0, 200));

  // Try multiple patterns
  for (const [dhivehiWord, englishKey] of Object.entries(dhivehiTerms)) {
    // Simple pattern: number followed by word (with optional stuff in between)
    const patterns = [
      new RegExp('(\d+)\\s*(?:\\([^)]*\\))?[^' + dhivehiWord[0] + ']{0,30}' + dhivehiWord),
      new RegExp('(\d+)\\s+[^0-9]{0,50}' + dhivehiWord),
      new RegExp('(\d+)\\s*\\(\\w+\\)\\s*[^' + dhivehiWord[0] + ']*' + dhivehiWord)
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        console.log(`  Pattern matched for ${englishKey}: ${match[0]} (number: ${match[1]})`);
        requirements[englishKey] = parseInt(match[1]);
        break;
      }
    }
  }

  return requirements;
}

async function main() {
  for (const url of testUrls) {
    const id = url.match(/(\d+)/)[1];
    console.log(`\n=== Tender ${id} ===`);

    const html = await fetch(url);

    // Get title
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = h1 ? h1[1].replace(/<[^>]+>/g, ' ').trim() : '';
    console.log('Title:', title.substring(0, 100));

    // Test extraction
    const req = extractRequirements(title);
    console.log('Requirements found:', JSON.stringify(req));
  }
}

main().catch(console.error);
