/**
 * API Route: /api/fetch-gazette
 * Fetches and parses tender data from gazette.gov.mv URL
 * Translates Dhivehi content to English
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dhivehi to English translation dictionary (common tender terms)
const dhivehiToEnglish = {
  // Common words
  'އިދާރާ': 'Authority',
  'މިނިވަރު': 'Ministry',
  'ކޮމްޕަނީ': 'Company',
  'ލިމިޓަޑ': 'Limited',
  'ޕްރައިވޭޓް': 'Private',
  'ޕަބްލިކް': 'Public',
  'ކޮންޓްރޭކްޓް': 'Contract',
  'ޓެންޑަރ': 'Tender',
  'ބީޑު': 'Bid',
  'ސަޕްލައި': 'Supply',
  'ސާވިސް': 'Service',
  'މުދައްރާތު': 'Goods',
  'މަސައްކަތް': 'Work',
  'ޕްރޮޖެކްޓް': 'Project',
  'ޑިވެލޮޕްމެންޓް': 'Development',
  'މެނިޓެނަންސް': 'Maintenance',
  'ރިޕެއާ': 'Repair',
  'އިންސްޓަލޭޝަން': 'Installation',
  'ސަޕްލައި އެންޑް އިންސްޓަލޭޝަން': 'Supply and Installation',
  'ޕަރޗޭސް': 'Purchase',
  'ޕްރޮކިއުރްމެންޓް': 'Procurement',
  'އިތުރުކިއުރުމަށް': 'For Addition/Extension',
  
  // IT/Tech terms
  'ކޮމްޕިއުޓަރ': 'Computer',
  'ލެޕްޓޮޕް': 'Laptop',
  'ޑެސްކްޓޮޕް': 'Desktop',
  'މޮނިޓަރ': 'Monitor',
  'ޕްރިންޓަރ': 'Printer',
  'ސްކޭނަރ': 'Scanner',
  'ސާވަރ': 'Server',
  'ނެޓްވޯރކް': 'Network',
  'ސޮފްޓްވެއާ': 'Software',
  'ހާޑްވެއާ': 'Hardware',
  'އައިޓީ': 'IT',
  'ޓެކްނޮލޮޖީ': 'Technology',
  'ސޮލަރ': 'Solar',
  'ސިސްޓަމް': 'System',
  
  // Office equipment
  'އޮފިސް': 'Office',
  'ފަނީޗަރ': 'Furniture',
  'ޓޭބަލް': 'Table',
  'ޗެއާ': 'Chair',
  'ކަބިނެޓް': 'Cabinet',
  'އައިރަން': 'Iron',
  'ބޯޑު': 'Board',
  'ވައިޓްބޯޑު': 'Whiteboard',
  'ޕްރޮޖެކްޓަރ': 'Projector',
  'އެއަރކަންޑިޝަނަ': 'Air Conditioner',
  'އޭސީ': 'AC',
  'ފޭނު': 'Fan',
  'ލައިޓު': 'Light',
  
  // Medical terms
  'މެޑިކަލް': 'Medical',
  'ހޮސްޕިޓަލް': 'Hospital',
  'ކްލިނިކް': 'Clinic',
  'މެޝިން': 'Machine',
  'ޑޮކްޓަރ': 'Doctor',
  'ނަރުސް': 'Nurse',
  'މެޑިސިން': 'Medicine',
  'ޑްރަގް': 'Drug',
  'ކެނީއުލާ': 'Stretcher',
  'ބެޑް': 'Bed',
  'އެމްބިއުލަންސް': 'Ambulance',
  
  // Construction terms
  'ކޮންސްޓްރަކްޝަން': 'Construction',
  'ބިލްޑިން': 'Building',
  'ރީނޯވޭޝަން': 'Renovation',
  'ރިޕެއާރޭޝަން': 'Repair/Restoration',
  'ޕަޚަބީލާ': 'Repairs',
  'އެކްސްޓެންޝަން': 'Extension',
  'މަސްކަރަތު': 'Construction/Building',
  'ސިޓީ': 'City',
  'މާލެ': 'Male',
  'އަތޮޅު': 'Atoll',
  'ޖަޒީރާ': 'Island',
  
  // Vehicles
  'ވެހިކަލް': 'Vehicle',
  'ކާވޭސް': 'Bus',
  'ކާސް': 'Car',
  'ޓްރަކް': 'Truck',
  'ބޮޓު': 'Boat',
  'ސްޕީޑް ބޯޓު': 'Speed Boat',
  'ފެރީ': 'Ferry',
  'ވެސަލް': 'Vessel',
  
  // Deadlines and dates
  'ކަލަންޑަރ': 'Calendar',
  'ޑޭޓް': 'Date',
  'ޓައިމް': 'Time',
  'ޑީޑްލައިން': 'Deadline',
  'ކްލޮސިން': 'Closing',
  'އިންސްޓޭންޓް': 'Instant/Immediate',
  'ދުވަސް': 'Day',
  'މަސް': 'Month',
  'އަހަރު': 'Year',
  'ސެޕްޓެމްބަރ': 'September',
  'އޮކްޓޯބަރ': 'October',
  'ނޮވެމްބަރ': 'November',
  'ޑިސެމްބަރ': 'December',
  'ޖެނުއަރީ': 'January',
  'ފެބްރުއަރީ': 'February',
  'މާރޗް': 'March',
  'އެޕްރިލް': 'April',
  'މޭ': 'May',
  'ޖޫން': 'June',
  'ޖުލައި': 'July',
  'އޮގަސްޓް': 'August',
  
  // Submission terms
  'ސަބްމިޝަން': 'Submission',
  'ރިޖެކްޝަން': 'Registration',
  'ބިޑް': 'Bid',
  'އޮޕަނިންގ': 'Opening',
  'ކްލޮސް': 'Close/Closed',
  'އެންޑް': 'End',
  'ބިފޯރް': 'Before',
  'އަފްޓަރ': 'After',
  'ބައި': 'Part/Portion',
  'ޓައިމް': 'Time',
  'ކުރިން': 'Before',
  
  // Contact terms
  'ކޮންޓެކްޓް': 'Contact',
  'ފޯނު': 'Phone',
  'ނަންބަރު': 'Number',
  'އިމެއިލް': 'Email',
  'އެޑްރެސް': 'Address',
  'ޕާސަން': 'Person',
  'ނަން': 'Name',
  
  // Money terms
  'ރުފިޔާ': 'Rufiyaa',
  'އެމްވީއާ': 'MVR',
  'ޕްރައިސް': 'Price',
  'ކޮސްޓް': 'Cost',
  'ބިޑް ސިއްސަރިޓީ': 'Bid Security',
  'ޕަރފޯމެންސް ގާރަންޓީ': 'Performance Guarantee',
  'ޓޭކްސް': 'Tax',
  'ވެޓް': 'VAT',
  
  // Other common terms
  'އިންގރީދި': 'English',
  'ދިވެހި': 'Dhivehi',
  'މޯލްޑިވްސް': 'Maldives',
  'ރިޕަބްލިކް': 'Republic',
  'ޔުނިއަޓް': 'Union',
  'ސްކޫލް': 'School',
  'ކޮލެޖް': 'College',
  'ޔުނިވަރސިޓީ': 'University',
  'ހޮސްޕިޓަލް': 'Hospital',
  'ސެންޓަރ': 'Center',
  'އޮފީސް': 'Office',
  'ސްޓޭޝަން': 'Station',
  'ޕޯޓް': 'Port',
  ' އައިލެންޑް': 'Island',
};

// Function to translate Dhivehi text to English
function translateDhivehi(text) {
  if (!text) return '';
  
  let translated = text;
  
  // Replace Dhivehi words with English
  for (const [dhivehi, english] of Object.entries(dhivehiToEnglish)) {
    const regex = new RegExp(dhivehi, 'g');
    translated = translated.replace(regex, english);
  }
  
  return translated;
}

// Function to extract tender data from gazette HTML
function extractTenderData(html, url) {
  const data = {
    title: '',
    titleDhivehi: '',
    authority: '',
    category: '',
    tenderNo: '',
    gazetteId: '',
    submissionDeadline: '',
    submissionTime: '',
    bidOpeningDate: '',
    bidOpeningTime: '',
    registrationDeadline: '',
    registrationTime: '',
    clarificationDeadline: '',
    clarificationTime: '',
    preBidMeeting: '',
    preBidMeetingTime: '',
    contactEmail: '',
    contactPhones: [],
    contactName: '',
    bidSecurity: '',
    performanceGuarantee: '',
    funding: '',
    project: '',
    eligibility: '',
    requirements: {}
  };

  // Extract gazette ID from URL
  const gazetteIdMatch = url.match(/\/iulaan\/(\d+)/);
  if (gazetteIdMatch) {
    data.gazetteId = gazetteIdMatch[1];
  }

  // Try to extract title - look for common patterns
  const titleMatch = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i) || 
                     html.match(/<div[^>]*class=["'][^"']*title[^"']*["'][^>]*>([^<]+)<\/div>/i) ||
                     html.match(/<span[^>]*class=["'][^"']*title[^"']*["'][^>]*>([^<]+)<\/span>/i);
  
  if (titleMatch) {
    data.titleDhivehi = titleMatch[1].trim();
    data.title = translateDhivehi(data.titleDhivehi);
  }

  // Try to extract authority - look for ministry/authority patterns
  const authorityPatterns = [
    /މިނިވަރު[^<]+/,
    /އިދާރާ[^<]+/,
    /Ministry[^<]+/i,
    /Authority[^<]+/i,
    /ކޮމްޕަނީ[^<]+/,
    /Company[^<]+/i
  ];
  
  for (const pattern of authorityPatterns) {
    const match = html.match(pattern);
    if (match) {
      data.authority = translateDhivehi(match[0].trim());
      break;
    }
  }

  // Extract dates - look for date patterns
  const datePatterns = [
    { regex: /(\d{1,2})\s*(?:st|nd|rd|th)?\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s*(\d{4})/i, type: 'general' },
    { regex: /(\d{4})-(\d{2})-(\d{2})/, type: 'iso' },
    { regex: /(\d{2})\/(\d{2})\/(\d{4})/, type: 'us' },
    { regex: /(\d{1,2})\.(\d{1,2})\.(\d{4})/, type: 'european' },
    { regex: /ސަބްމިޝަން[^\d]*(\d{1,2})[^\d]*(\d{1,2}):?(\d{2})?/i, type: 'submission' },
    { regex: /ރިޖެކްޝަން[^\d]*(\d{1,2})[^\d]*(\d{1,2}):?(\d{2})?/i, type: 'registration' },
    { regex: /އޮޕަނިންގ[^\d]*(\d{1,2})[^\d]*(\d{1,2}):?(\d{2})?/i, type: 'opening' },
    { regex: /ކްލޮސިންގ[^\d]*(\d{1,2})[^\d]*(\d{1,2}):?(\d{2})?/i, type: 'closing' }
  ];

  for (const { regex, type } of datePatterns) {
    const match = html.match(regex);
    if (match) {
      // Parse the date and format it
      // This is simplified - real implementation would need proper date parsing
      const dateStr = match[0];
      // Store raw for now, would need proper parsing
      if (type === 'submission') {
        data.submissionDeadline = dateStr;
      } else if (type === 'registration') {
        data.registrationDeadline = dateStr;
      } else if (type === 'opening') {
        data.bidOpeningDate = dateStr;
      }
    }
  }

  // Extract contact information
  const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    data.contactEmail = emailMatch[0];
  }

  const phoneMatch = html.match(/(\+?960\s?)?\d{3}\s?\d{4}/);
  if (phoneMatch) {
    data.contactPhones.push(phoneMatch[0]);
  }

  // Extract bid security amount
  const bidSecurityMatch = html.match(/ބިޑް ސިއްސަރިޓީ[^\d]*(\d[\d,\.]+)|Bid Security[^\d]*(\d[\d,\.]+)/i);
  if (bidSecurityMatch) {
    data.bidSecurity = bidSecurityMatch[1] || bidSecurityMatch[2];
  }

  // Try to detect category from keywords
  const categoryKeywords = {
    'IT': ['ކޮމްޕިއުޓަރ', 'ލެޕްޓޮޕ', 'އައިޓީ', 'ސޮފްޓްވެއާ', 'ހާޑްވެއާ', 'Computer', 'Laptop', 'IT', 'Software', 'Hardware'],
    'Medical Equipment': ['މެޑިކަލް', 'ހޮސްޕިޓަލް', 'މެޝިން', 'Medical', 'Hospital', 'Clinic'],
    'Construction': ['ކޮންސްޓްރަކްޝަން', 'ބިލްޑިން', 'މަސްކަރަތު', 'Construction', 'Building'],
    'Office Supplies': ['އޮފިސް', 'ފަނީޗަރ', 'Office', 'Furniture'],
    'Transport': ['ވެހިކަލް', 'ކާވޭސް', 'ކާސް', 'Vehicle', 'Bus', 'Car']
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (html.includes(keyword)) {
        data.category = category;
        break;
      }
    }
    if (data.category) break;
  }

  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes('gazette.gov.mv')) {
    return res.status(400).json({ error: 'Invalid Gazette URL' });
  }

  try {
    // Fetch the gazette page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();

    // Extract tender data
    const tenderData = extractTenderData(html, url);

    res.status(200).json(tenderData);

  } catch (error) {
    console.error('Error fetching gazette:', error);
    res.status(500).json({ error: 'Failed to fetch gazette data', message: error.message });
  }
}
