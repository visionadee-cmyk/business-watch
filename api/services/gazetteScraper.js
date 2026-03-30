/**
 * Gazette Scraper
 * Fetches new tenders from gazette.gov.mv (Maldives Government Gazette)
 * 
 * Website structure:
 * - URL: https://gazette.gov.mv/iulaan
 * - Tender items are listed with links like /iulaan/[ID]
 * - Categories: masakkaiy (work), vazeefaa (jobs), thamreenu (training)
 * - Titles in Dhivehi with English translations sometimes
 */

import * as cheerio from 'cheerio';

class GazetteScraper {
  constructor() {
    this.baseUrl = 'https://gazette.gov.mv';
    this.iulaanUrl = 'https://gazette.gov.mv/iulaan';
    // Tender-related categories we care about
    this.tenderTypes = ['masakkaiy', 'work']; // masakkaiy = work/tenders
    this.categories = {
      'IT': ['IT', 'computer', 'laptop', 'server', 'software', 'technology', 'digital'],
      'Medical': ['medical', 'hospital', 'equipment', 'medicine', 'health'],
      'Construction': ['construction', 'building', 'renovation', 'infrastructure'],
      'Services': ['service', 'consultancy', 'maintenance', 'professional'],
      'Supply': ['supply', 'goods', 'purchase', 'materials', 'procurement'],
      'Agriculture': ['agriculture', 'farming', 'crop', 'livestock'],
      'Education': ['school', 'education', 'training', 'scholarship']
    };
  }

  // Fetch latest tenders from gazette
  async fetchLatestTenders() {
    try {
      console.log('🔍 Fetching tenders from gazette.gov.mv...');
      
      const response = await fetch(this.iulaanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const tenders = [];
      
      // Parse tender listings from gazette.gov.mv structure
      // Each tender is typically in a section/article or list item
      $('article, .iulaan-item, .news-item, section').each((i, elem) => {
        const tender = this.parseTenderElement($, elem);
        if (tender) tenders.push(tender);
      });
      
      // Also look for links directly (gazette uses direct links)
      $('a[href^="/iulaan/"]').each((i, elem) => {
        const href = $(elem).attr('href');
        const gazetteId = href.split('/').pop();
        const title = $(elem).text().trim();
        
        if (gazetteId && title && gazetteId.match(/^\d+$/)) {
          // Check if already added
          if (!tenders.find(t => t.gazette_id === gazetteId)) {
            tenders.push({
              id: `TND-${new Date().getFullYear()}-${gazetteId}`,
              gazette_id: gazetteId,
              title,
              title_dhivehi: title,
              authority: this.extractAuthorityFromContext($, elem),
              category: this.detectCategory(title),
              gazette_url: `${this.baseUrl}${href}`,
              status: 'Open',
              scraped_at: new Date().toISOString(),
              type: 'masakkaiy' // Default to work/tender
            });
          }
        }
      });
      
      console.log(`✅ Found ${tenders.length} tenders from gazette.gov.mv`);
      
      // Limit to first 10 to avoid overwhelming
      return tenders.slice(0, 10);
      
    } catch (error) {
      console.error('❌ Failed to fetch tenders from gazette:', error);
      return [];
    }
  }

  // Parse individual tender element
  parseTenderElement($, elem) {
    try {
      const $el = $(elem);
      
      // Look for gazette ID in link
      const link = $el.find('a[href^="/iulaan/"]').first();
      const href = link.attr('href') || $el.attr('href');
      
      if (!href || !href.includes('/iulaan/')) return null;
      
      const gazetteId = href.split('/').pop();
      if (!gazetteId || !gazetteId.match(/^\d+$/)) return null;
      
      // Extract title (could be in Dhivehi or English)
      let title = link.text().trim() || $el.find('h1, h2, h3, .title').text().trim();
      
      // If title is empty, try other selectors
      if (!title) {
        title = $el.text().trim().substring(0, 200); // First 200 chars
      }
      
      // Skip if no meaningful title
      if (!title || title.length < 10) return null;
      
      // Extract authority/office
      const authority = this.extractAuthority($, $el);
      
      // Detect type/category
      const type = this.detectType($, $el);
      const category = this.detectCategory(title);
      
      // Only return if it's a tender/work type
      if (!this.tenderTypes.includes(type) && !title.toLowerCase().includes('tender')) {
        return null;
      }
      
      return {
        id: `TND-${new Date().getFullYear()}-${gazetteId}`,
        gazette_id: gazetteId,
        title,
        title_dhivehi: title,
        authority,
        category,
        gazette_url: `${this.baseUrl}${href}`,
        status: 'Open',
        scraped_at: new Date().toISOString(),
        type,
        requirements: this.extractRequirements(title)
      };
      
    } catch (error) {
      console.error('Error parsing tender element:', error);
      return null;
    }
  }

  // Extract authority from nearby elements
  extractAuthority($, $el) {
    // Look for office/authority links
    const authorityLink = $el.find('a[href*="office="]').first();
    if (authorityLink.length) {
      return authorityLink.text().trim();
    }
    
    // Look for text patterns
    const text = $el.text();
    const authorityPatterns = [
      /(?:ministry|office|council|authority|company|corporation|agency)/i
    ];
    
    for (const pattern of authorityPatterns) {
      const match = text.match(pattern);
      if (match) {
        // Extract surrounding context
        const index = text.indexOf(match[0]);
        return text.substring(Math.max(0, index - 20), index + 50).trim();
      }
    }
    
    return 'Government Authority';
  }

  // Extract authority from context (when parsing links)
  extractAuthorityFromContext($, elem) {
    // Look at parent elements for authority info
    const $parent = $(elem).parent();
    const authorityLink = $parent.find('a[href*="office="]').first();
    
    if (authorityLink.length) {
      return authorityLink.text().trim();
    }
    
    return 'Government Authority';
  }

  // Detect tender type from category links
  detectType($, $el) {
    const typeLink = $el.find('a[href*="type="]').first();
    if (typeLink.length) {
      const href = typeLink.attr('href');
      const match = href.match(/type=([^&]+)/);
      if (match) return match[1];
    }
    
    // Check text content
    const text = $el.text().toLowerCase();
    if (text.includes('masakkaiy') || text.includes('work')) return 'masakkaiy';
    if (text.includes('vazeefaa') || text.includes('job')) return 'vazeefaa';
    if (text.includes('thamreenu') || text.includes('training')) return 'thamreenu';
    
    return 'other';
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
    const quantityMatch = title.match(/(\d+)\s*(laptops?|monitors?|computers?|systems?|chairs?|units?)/i);
    if (quantityMatch) {
      requirements[quantityMatch[2].toLowerCase()] = parseInt(quantityMatch[1]);
    }
    
    // Detect items
    if (lowerTitle.includes('laptop')) requirements.laptops = requirements.laptops || 'Various';
    if (lowerTitle.includes('monitor')) requirements.monitors = requirements.monitors || 'Various';
    if (lowerTitle.includes('computer')) requirements.computers = requirements.computers || 'Various';
    if (lowerTitle.includes('server')) requirements.servers = requirements.servers || 'Various';
    if (lowerTitle.includes('equipment')) requirements.equipment = 'Various';
    
    return requirements;
  }

  // Fetch detailed tender info from individual page
  async fetchTenderDetails(gazetteId) {
    try {
      const tenderUrl = `${this.baseUrl}/iulaan/${gazetteId}`;
      const response = await fetch(tenderUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) return {};
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Extract details from the tender page
      return {
        submission_deadline: this.extractDate($, ['deadline', 'submission', 'closing']),
        submission_time: this.extractTime($),
        bid_opening_date: this.extractDate($, ['opening', 'bid opening']),
        bid_opening_time: this.extractTime($, 'opening'),
        contact_email: this.extractEmail($),
        contact_phone: this.extractPhone($),
        info_sheet_url: this.extractDocumentLink($, ['info', 'specification', 'document']),
        estimated_budget: this.extractBudget($),
        requirements: this.extractDetailedRequirements($),
        description: $('article, .content, .description').text().trim().substring(0, 500)
      };
      
    } catch (error) {
      console.error(`Failed to fetch details for ${gazetteId}:`, error);
      return {};
    }
  }

  // Helper: Extract date from text
  extractDate($, keywords) {
    const text = $('body').text();
    // Match YYYY-MM-DD or DD-MM-YYYY patterns
    const datePatterns = [
      /(\d{4})-(\d{2})-(\d{2})/,
      /(\d{2})-(\d{2})-(\d{4})/,
      /(\d{2})\/(\d{2})\/(\d{4})/
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[0].includes('-') && match[1].length === 4) {
          return `${match[1]}-${match[2]}-${match[3]}`; // YYYY-MM-DD
        } else if (match[0].includes('-')) {
          return `${match[3]}-${match[2]}-${match[1]}`; // Convert DD-MM-YYYY to YYYY-MM-DD
        }
      }
    }
    return null;
  }

  // Helper: Extract time
  extractTime($, context = '') {
    const text = $('body').text();
    const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/;
    const match = text.match(timePattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const period = match[3]?.toLowerCase();
      
      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
      
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    return null;
  }

  // Helper: Extract email
  extractEmail($) {
    const text = $('body').text();
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(emailPattern);
    return match ? match[0] : null;
  }

  // Helper: Extract phone
  extractPhone($) {
    const text = $('body').text();
    const phonePattern = /(\+?\d{1,4}[-.\s]?)?(\d{3,4}[-.\s]?\d{4})/;
    const match = text.match(phonePattern);
    return match ? match[0] : null;
  }

  // Helper: Extract document link
  extractDocumentLink($, keywords) {
    let link = null;
    $('a').each((i, elem) => {
      const text = $(elem).text().toLowerCase();
      const href = $(elem).attr('href') || '';
      if (keywords.some(kw => text.includes(kw.toLowerCase()) || href.includes(kw.toLowerCase()))) {
        link = $(elem).attr('href');
      }
    });
    return link ? (link.startsWith('http') ? link : `${this.baseUrl}${link}`) : null;
  }

  // Helper: Extract budget
  extractBudget($) {
    const text = $('body').text();
    // Look for budget patterns
    const budgetPatterns = [
      /(?:budget|value|amount|cost)[^.\d]*([\d,\.]+)\s*(MVR|USD|\$)?/i,
      /([\d,\.]+)\s*(MVR|USD|\$)/i
    ];
    
    for (const pattern of budgetPatterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1].replace(/,/g, ''));
        if (value > 1000) return value; // Likely a valid budget
      }
    }
    return null;
  }

  // Helper: Extract detailed requirements
  extractDetailedRequirements($) {
    const requirements = {};
    const text = $('body').text();
    
    // Look for quantity tables or lists
    $('table tr, ul li').each((i, elem) => {
      const rowText = $(elem).text();
      const qtyMatch = rowText.match(/(\d+)\s*(?:x|×)?\s*(\w+)/i);
      if (qtyMatch) {
        requirements[qtyMatch[2].toLowerCase()] = parseInt(qtyMatch[1]);
      }
    });
    
    return requirements;
  }

  // Main method: Fetch and process new tenders
  async scrapeAndNotify(existingTenders = []) {
    console.log('🌐 Starting gazette.gov.mv scrape...');
    
    const newTenders = await this.fetchLatestTenders();
    const existingIds = new Set(existingTenders.map(t => t.gazette_id || t.id));
    
    // Filter only truly new tenders
    const actuallyNew = [];
    for (const tender of newTenders) {
      if (!existingIds.has(tender.gazette_id) && !existingIds.has(tender.id)) {
        // Fetch detailed info
        const details = await this.fetchTenderDetails(tender.gazette_id);
        actuallyNew.push({ ...tender, ...details });
      }
    }
    
    console.log(`📢 Found ${actuallyNew.length} new tenders`);
    return actuallyNew;
  }
}

export const gazetteScraper = new GazetteScraper();
export default GazetteScraper;
