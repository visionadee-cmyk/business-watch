const https = require('https');

// Test the exact extraction logic from scrape-lost-bids.cjs
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

function extractRequirementsFromText(text) {
  const requirements = {};
  if (!text) return requirements;

  console.log('Searching in:', text.substring(0, 150));

  // For each Dhivehi term
  for (const [dhivehiWord, englishKey] of Object.entries(dhivehiTerms)) {
    // Pattern: number, optional space, optional (anything), then the Dhivehi word
    const pattern = new RegExp('(\\d+)\\s*(?:\\([^)]*\\))?[^' + dhivehiWord.charAt(0) + ']{0,50}' + dhivehiWord);
    const match = text.match(pattern);
    if (match) {
      console.log(`  ✓ Found ${englishKey}: ${match[1]} (matched: "${match[0].substring(0, 40)}...")`);
      requirements[englishKey] = parseInt(match[1]);
    }
  }

  return requirements;
}

const url = 'https://gazette.gov.mv/iulaan/383803';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    // Extract title using the NEW logic
    let title = '';
    const classTitleMatch = html.match(/class=['"][^'"]*title[^'"]*['"][^>]*>([^<]+)/i);
    if (classTitleMatch) {
      title = classTitleMatch[1].trim();
    }
    
    console.log('Full title text:', title);
    console.log('');
    
    const req = extractRequirementsFromText(title);
    console.log('\nFinal requirements:', JSON.stringify(req));
  });
});
