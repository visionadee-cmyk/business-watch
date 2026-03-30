/**
 * Gazette Scraper
 * Fetches new tenders from gazette.gov.mv
 */

import * as cheerio from 'cheerio';

class GazetteScraper {
  constructor() {
    this.baseUrl = 'https://gazette.gov.mv/iulaan';
    this.categories = {
      'IT': ['IT', 'computer', 'laptop', 'server', 'software'],
      'Medical': ['medical', 'hospital', 'equipment', 'medicine'],
      'Construction': ['construction', 'building', 'renovation'],
      'Services': ['service', 'consultancy', 'maintenance'],
      'Supply': ['supply', 'goods', 'purchase', 'materials']
    };
  }

  // Fetch latest tenders
  async fetchLatestTenders() {
    try {
      console.log('🔍 Fetching tenders from gazette.gov.mv...');
      
      // Note: In production, you'd use a proper HTTP client
      // This is a template - actual implementation depends on site structure
      const response = await fetch(this.baseUrl);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const tenders = [];
      
      // Parse tender listings (adjust selectors based on actual site structure)
      $('.tender-item, .iulaan-item, article').each((i, elem) => {
        const tender = this.parseTenderElement($, elem);
        if (tender) tenders.push(tender);
      });
      
      console.log(`✅ Found ${tenders.length} tenders`);
      return tenders;
      
    } catch (error) {
      console.error('❌ Failed to fetch tenders:', error);
      return [];
    }
  }

  // Parse individual tender element
  parseTenderElement($, elem) {
    try {
      const $el = $(elem);
      
      // Extract data (adjust selectors)
      const title = $el.find('.title, h3, h2').text().trim();
      const gazetteId = $el.find('.gazette-id, .reference').text().trim();
      const authority = $el.find('.authority, .ministry').text().trim();
      const link = $el.find('a').attr('href');
      
      // Skip if missing essential data
      if (!title || !gazetteId) return null;
      
      // Detect category
      const category = this.detectCategory(title);
      
      return {
        id: `TND-${new Date().getFullYear()}-${gazetteId}`,
        gazette_id: gazetteId,
        title,
        authority: authority || 'Government Authority',
        category,
        gazette_url: link ? (link.startsWith('http') ? link : `https://gazette.gov.mv${link}`) : this.baseUrl,
        status: 'Open',
        scraped_at: new Date().toISOString(),
        requirements: this.extractRequirements(title)
      };
      
    } catch (error) {
      console.error('Error parsing tender element:', error);
      return null;
    }
  }

  // Detect category from title
  detectCategory(title) {
    const lowerTitle = title.toLowerCase();
    
    for (const [category, keywords] of Object.entries(this.categories)) {
      if (keywords.some(kw => lowerTitle.includes(kw.toLowerCase()))) {
        return category;
      }
    }
    
    return 'Other';
  }

  // Extract requirements from title
  extractRequirements(title) {
    const requirements = {};
    const lowerTitle = title.toLowerCase();
    
    // Extract quantities
    const quantityMatch = title.match(/(\d+)\s*(laptops?|monitors?|computers?|systems?|chairs?)/i);
    if (quantityMatch) {
      requirements[quantityMatch[2].toLowerCase()] = parseInt(quantityMatch[1]);
    }
    
    // Detect items
    if (lowerTitle.includes('laptop')) requirements.laptops = requirements.laptops || 'Various';
    if (lowerTitle.includes('monitor')) requirements.monitors = requirements.monitors || 'Various';
    if (lowerTitle.includes('computer')) requirements.computers = requirements.computers || 'Various';
    if (lowerTitle.includes('server')) requirements.servers = requirements.servers || 'Various';
    
    return requirements;
  }

  // Fetch detailed tender info (follow link)
  async fetchTenderDetails(tenderUrl) {
    try {
      const response = await fetch(tenderUrl);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Extract detailed info
      return {
        submission_deadline: this.extractDate($, ['deadline', 'submission', 'closing']),
        submission_time: this.extractTime($),
        bid_opening_date: this.extractDate($, ['opening', 'bid opening']),
        bid_opening_time: this.extractTime($, 'opening'),
        contact_email: this.extractEmail($),
        info_sheet_url: this.extractDocumentLink($, ['info', 'specification']),
        estimated_budget: this.extractBudget($),
        requirements: this.extractDetailedRequirements($)
      };
      
    } catch (error) {
      console.error('Failed to fetch tender details:', error);
      return {};
    }
  }

  // Helper: Extract date from text
  extractDate($, keywords) {
    const text = $('body').text();
    const datePattern = /(\d{4})-(\d{2})-(\d{2})/;
    const match = text.match(datePattern);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
  }

  // Helper: Extract time
  extractTime($, context = '') {
    const text = $('body').text();
    const timePattern = /(\d{1,2}):(\d{2})/;
    const match = text.match(timePattern);
    return match ? `${match[1].padStart(2, '0')}:${match[2]}` : null;
  }

  // Helper: Extract email
  extractEmail($) {
    const text = $('body').text();
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(emailPattern);
    return match ? match[0] : null;
  }

  // Helper: Extract document link
  extractDocumentLink($, keywords) {
    let link = null;
    $('a').each((i, elem) => {
      const text = $(elem).text().toLowerCase();
      if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
        link = $(elem).attr('href');
      }
    });
    return link;
  }

  // Helper: Extract budget
  extractBudget($) {
    const text = $('body').text();
    const budgetPattern = /(?:budget|value|amount)[^\d]*(\d[\d,\.]+)/i;
    const match = text.match(budgetPattern);
    return match ? parseFloat(match[1].replace(/,/g, '')) : null;
  }

  // Helper: Extract detailed requirements
  extractDetailedRequirements($) {
    const requirements = {};
    // Parse tables or lists for requirements
    return requirements;
  }
}

export const gazetteScraper = new GazetteScraper();
export default GazetteScraper;
