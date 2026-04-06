const https = require('https');

const url = 'https://gazette.gov.mv/iulaan/383803';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('=== Looking for title patterns ===\n');
    
    // Try h1
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    console.log('h1:', h1 ? h1[1].replace(/<[^>]+>/g, '').substring(0, 100) : 'NOT FOUND');
    
    // Try h2
    const h2 = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    console.log('h2:', h2 ? h2[1].replace(/<[^>]+>/g, '').substring(0, 100) : 'NOT FOUND');
    
    // Try title tag
    const title = html.match(/<title>(.*?)<\/title>/i);
    console.log('title:', title ? title[1].substring(0, 100) : 'NOT FOUND');
    
    // Try og:title meta
    const og = html.match(/<meta[^>]*property=['"]og:title['"][^>]*content=['"]([^'"]*)/i);
    console.log('og:title:', og ? og[1].substring(0, 100) : 'NOT FOUND');
    
    // Try any element with class containing 'title'
    const classTitle = html.match(/class=['"][^'"]*title[^'"]*['"][^>]*>([^<]+)/i);
    console.log('class=title:', classTitle ? classTitle[1].substring(0, 100) : 'NOT FOUND');
    
    // Look for div with specific classes
    const divMatch = html.match(/<div[^>]*class=['"][^'"]*(?:entry|content|main)[^'"]*['"][^>]*>([\s\S]*?)(?:<\/div>)/i);
    if (divMatch) {
      console.log('\n=== First 500 chars of content div ===');
      console.log(divMatch[1].replace(/<[^>]+>/g, ' ').substring(0, 500));
    }
    
    // Search for specific Dhivehi word to see context
    const fenderIdx = html.indexOf('ފެންޑަރ');
    if (fenderIdx > 0) {
      console.log('\n=== Context around "ފެންޑަރ" (fender) ===');
      const context = html.substring(Math.max(0, fenderIdx - 100), fenderIdx + 100);
      console.log(context.replace(/<[^>]+>/g, ' '));
    }
  });
});
