import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  collection, 
  query, 
  getDocs, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { BidQuotationPage } from '../components/BidQuotation';
import { 
  FileText, 
  Printer, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Download,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  X,
  Search
} from 'lucide-react';

// Default bid sections - 12 pages as per Maldives tender requirements
const defaultBidSections = {
  page1_cover: {
    title: 'Page 1 - Cover Page',
    fields: [
      { name: 'tenderNo', label: 'Tender No', value: '', type: 'text' },
      { name: 'tenderTitle', label: 'Tender Title', value: '', type: 'text' },
      { name: 'companyName', label: 'Company Name', value: 'Business Watch Pvt Ltd', type: 'text' },
      { name: 'address', label: 'Address', value: 'Gulhifalhu, Lh.Himavaru', type: 'textarea' },
      { name: 'contactPerson', label: 'Contact Person', value: '', type: 'text' },
      { name: 'phone', label: 'Phone', value: '(960) 7786629', type: 'text' },
      { name: 'email', label: 'Email', value: 'businesswatchmv@gmail.com', type: 'text' },
      { name: 'tin', label: 'TIN', value: '1169863/GST/T/501', type: 'text' },
      { name: 'bidDate', label: 'Bid Date', value: '', type: 'date' },
      { name: 'submissionDate', label: 'Submission Date', value: '', type: 'date' },
    ]
  },
  page2_checklist: {
    title: 'Page 2 - Documents Checklist',
    fields: [
      { name: 'tenderFee', label: 'Tender Fee Receipt', value: true, type: 'checkbox' },
      { name: 'bidSecurity', label: 'Bid Security', value: true, type: 'checkbox' },
      { name: 'companyProfile', label: 'Company Profile/Certificate', value: true, type: 'checkbox' },
      { name: 'tinCert', label: 'TIN Certificate', value: true, type: 'checkbox' },
      { name: 'gstCert', label: 'GST Certificate', value: true, type: 'checkbox' },
      { name: 'bankRef', label: 'Bank Reference', value: true, type: 'checkbox' },
      { name: 'pastPerformance', label: 'Past Performance Certificates', value: true, type: 'checkbox' },
      { name: 'technicalSpecs', label: 'Technical Specifications', value: true, type: 'checkbox' },
      { name: 'priceSchedule', label: 'Price Schedule', value: true, type: 'checkbox' },
    ]
  },
  page3_submission: {
    title: 'Page 3 - Bid Submission Form',
    fields: [
      { name: 'authorizedSignature', label: 'Authorized Signature', value: '', type: 'text' },
      { name: 'signatoryName', label: 'Name and Title of Signatory', value: 'Aboobakuru Qasim', type: 'text' },
      { name: 'bidderName', label: 'Name of Bidder', value: 'Business Watch Pvt. Ltd (C00062025)', type: 'text' },
      { name: 'bidderAddress', label: 'Address', value: 'Gulfaamge, Lh.hinnavaru, Maldives', type: 'textarea' },
      { name: 'phoneNumber', label: 'Phone Number', value: '7786629, 9829050', type: 'text' },
      { name: 'emailAddress', label: 'Fax Number/Email', value: 'businesswatchmv@gmail.com', type: 'text' },
    ]
  },
  page4_companyReg: {
    title: 'Page 4 - Company Registration',
    fields: [
      { name: 'companyRegCert', label: 'Company Registration Certificate', value: null, type: 'file' },
      { name: 'regNo', label: 'Registration No', value: 'C0006/2025', type: 'text' },
      { name: 'regDate', label: 'Registration Date', value: '8th day of January 2025', type: 'text' },
    ]
  },
  page5_quotation: {
    title: 'Page 5 - Quotation',
    fields: [
      { name: 'quotationNo', label: 'Quotation No', value: 'BW/2026/026', type: 'text' },
      { name: 'quotationDate', label: 'Date', value: '', type: 'date' },
      { name: 'client', label: 'Client', value: '', type: 'text' },
      { name: 'procurementRef', label: 'Procurement Ref', value: '(PROC-05-26) BIT/2026/20', type: 'text' },
      { name: 'subTotal', label: 'Sub Total (MVR)', value: '68500.00', type: 'text' },
      { name: 'gst', label: 'GST 8%', value: '5480.00', type: 'text' },
      { name: 'grandTotal', label: 'Grand Total', value: '73980.00', type: 'text' },
      { name: 'validity', label: 'Validity (days)', value: '90', type: 'number' },
      { name: 'deliveryTime', label: 'Delivery Time', value: '30-45 days', type: 'text' },
      { name: 'paymentTerms', label: 'Payment Terms', value: 'As per tender terms', type: 'text' },
    ],
    items: [
      { id: 1, description: 'Office table (Executive)', qty: 1, rate: 8500, amount: 8500 },
      { id: 2, description: 'Sofa (couch) chair (3pcs/set)', qty: 2, rate: 14500, amount: 29000 },
      { id: 3, description: 'Office Table (executive)', qty: 3, rate: 18500, amount: 55500 },
      { id: 4, description: 'High Back Chair (executive Chair)', qty: 7, rate: 3800, amount: 26600 },
      { id: 5, description: 'Conference Table Color:White', qty: 1, rate: 12500, amount: 12500 },
    ]
  },
  page6_specification: {
    title: 'Page 6 - Specification',
    fields: [
      { name: 'itemName', label: 'Item Name', value: 'Transmitter and Related Equipment', type: 'text' },
      { name: 'brand', label: 'Brand', value: 'FMUSER or ZHC', type: 'text' },
      { name: 'model', label: 'Model', value: 'FU618F-300W / ZHC618F-300W', type: 'text' },
      { name: 'powerOutput', label: 'Power Output', value: '300W', type: 'text' },
      { name: 'frequencyRange', label: 'Frequency Range', value: '87.5-108 MHz', type: 'text' },
      { name: 'rfOutputPower', label: 'RF Output Power', value: '300W (adjustable 0-300W)', type: 'text' },
      { name: 'frequencyStability', label: 'Frequency Stability', value: '±10Hz', type: 'text' },
      { name: 'harmonicSuppression', label: 'Harmonic Suppression', value: '≥60dB', type: 'text' },
      { name: 'warranty', label: 'Warranty Period', value: '1-3 years as per manufacturer', type: 'text' },
      { name: 'deliverySpecs', label: 'Delivery Timeframe', value: 'Within 30-45 days from PO', type: 'text' },
    ]
  },
  page7_gst: {
    title: 'Page 7 - GST Registration',
    fields: [
      { name: 'gstCert', label: 'GST Registration Certificate', value: null, type: 'file' },
      { name: 'gstTin', label: 'TIN', value: '1169863GST501', type: 'text' },
      { name: 'gstDate', label: 'Registration Date', value: '25 August 2025', type: 'text' },
      { name: 'taxableActivity', label: 'Taxable Activity Number', value: '001', type: 'text' },
    ]
  },
  page8_garaaru: {
    title: 'Page 8 - Garaaru (Past Projects)',
    fields: [
      { name: 'pastProject1', label: 'Project 1', value: 'Ministry of Education - Office Furniture Supply (2025)', type: 'text' },
      { name: 'pastProject2', label: 'Project 2', value: 'State Electric Company - IT Equipment (2024)', type: 'text' },
      { name: 'pastProject3', label: 'Project 3', value: 'Male City Council - Office Supplies (2024)', type: 'text' },
      { name: 'pastProject4', label: 'Project 4', value: 'IGMH - Medical Equipment (2024)', type: 'text' },
      { name: 'pastProject5', label: 'Project 5', value: 'Customs Department - Security Systems (2023)', type: 'text' },
      { name: 'totalValue', label: 'Total Value of Completed Projects', value: '1,099,510.00', type: 'text' },
    ]
  },
  page9_taxClearance: {
    title: 'Page 9 - Tax Clearance Report',
    fields: [
      { name: 'taxClearanceCert', label: 'Tax Clearance Certificate', value: null, type: 'file' },
      { name: 'taxClearanceNo', label: 'Certificate No', value: '', type: 'text' },
      { name: 'taxClearanceDate', label: 'Issue Date', value: '', type: 'text' },
      { name: 'taxPeriod', label: 'Tax Period Covered', value: '2024-2025', type: 'text' },
    ]
  },
  page10_sme: {
    title: 'Page 10 - SME Registration',
    fields: [
      { name: 'smeCert', label: 'SME Registration Certificate', value: null, type: 'file' },
      { name: 'smeNo', label: 'SME Number', value: 'SME00543025', type: 'text' },
      { name: 'smeAddress', label: 'Registered Address', value: 'Gulfaamge, 07010, Lh. Himavaru, Maldives', type: 'textarea' },
      { name: 'businessCategory', label: 'Business Category', value: 'Trading', type: 'text' },
      { name: 'businessRanking', label: 'Business Ranking', value: 'Micro', type: 'text' },
      { name: 'smeRegDate', label: 'Registration Date', value: '19th January 2025', type: 'text' },
    ]
  },
  page11_experienceDetails: {
    title: 'Page 11 - Experience Details',
    fields: [
      { name: 'experienceYears', label: 'Years in Business', value: '10', type: 'number' },
      { name: 'totalProjects', label: 'Total Projects Completed', value: '50+', type: 'text' },
      { name: 'majorClients', label: 'Major Clients (List 3-5)', value: '1. Ministry of Education\n2. State Electric Company\n3. Male City Council\n4. Indhira Gandhi Memorial Hospital\n5. Customs Department', type: 'textarea' },
      { name: 'similarProjects', label: 'Similar Projects Completed', value: 'Supply of office furniture and IT equipment to various government ministries and state-owned enterprises.', type: 'textarea' },
      { name: 'averageProjectValue', label: 'Average Project Value', value: 'MVR 500,000', type: 'text' },
    ]
  },
  page12_experienceLetters: {
    title: 'Page 12 - Experience Letters',
    fields: [
      { name: 'expLetter1', label: 'Experience Letter 1', value: null, type: 'file' },
      { name: 'expLetter2', label: 'Experience Letter 2', value: null, type: 'file' },
      { name: 'expLetter3', label: 'Experience Letter 3', value: null, type: 'file' },
      { name: 'expLetter4', label: 'Experience Letter 4', value: null, type: 'file' },
      { name: 'expLetter5', label: 'Experience Letter 5', value: null, type: 'file' },
    ]
  },
};

export default function BidCompiler() {
  const location = useLocation();
  const selectedBid = location.state?.selectedBid;

  const mergeWithDefaultSections = (incomingSections) => {
    const merged = JSON.parse(JSON.stringify(defaultBidSections));

    if (!incomingSections || typeof incomingSections !== 'object') {
      return merged;
    }

    Object.entries(incomingSections).forEach(([key, incomingSection]) => {
      if (!merged[key] || !incomingSection || typeof incomingSection !== 'object') return;

      if (typeof incomingSection.title === 'string') {
        merged[key].title = incomingSection.title;
      }

      const incomingFields = Array.isArray(incomingSection.fields) ? incomingSection.fields : [];
      if (merged[key].fields && Array.isArray(merged[key].fields)) {
        merged[key].fields = merged[key].fields.map((defaultField) => {
          const match = incomingFields.find((f) => f?.name === defaultField.name);
          return match ? { ...defaultField, value: match.value } : defaultField;
        });

        incomingFields.forEach((f) => {
          if (!f?.name) return;
          const exists = merged[key].fields.some((df) => df.name === f.name);
          if (!exists) merged[key].fields.push(f);
        });
      } else {
        merged[key].fields = incomingFields;
      }

      if (incomingSection.items) {
        merged[key].items = incomingSection.items;
      }
    });

    return merged;
  };

  const [sections, setSections] = useState(() => {
    // If a bid was selected from Bids page, pre-populate with its data
    if (selectedBid) {
      return mergeWithDefaultSections(populateSectionsWithBidData(defaultBidSections, selectedBid));
    }
    return defaultBidSections;
  });
  
  const [activeSection, setActiveSection] = useState('page1_cover');
  const [showPreview, setShowPreview] = useState(false);
  const [savedBids, setSavedBids] = useState([]);
  const [currentBidName, setCurrentBidName] = useState(() => selectedBid?.title || '');
  const [expandedSections, setExpandedSections] = useState(Object.keys(defaultBidSections));
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [openBids, setOpenBids] = useState([]);
  const [loadingOpenBids, setLoadingOpenBids] = useState(false);
  const [selectedOpenBid, setSelectedOpenBid] = useState(selectedBid || null);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState({});
  const [previewDocument, setPreviewDocument] = useState(null);
  const printRef = useRef();

  const normalizedSections = mergeWithDefaultSections(sections);

  // Helper function to convert Firebase timestamp to yyyy-MM-dd string
  function formatDate(dateValue) {
    if (!dateValue) return '';
    
    // Handle Firebase timestamp object {seconds, nanoseconds}
    if (typeof dateValue === 'object' && dateValue.seconds !== undefined) {
      const date = new Date(dateValue.seconds * 1000);
      return date.toISOString().split('T')[0];
    }
    
    // Handle string dates
    if (typeof dateValue === 'string') {
      // If already in yyyy-MM-dd format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
      
      // Try to parse and format
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    return '';
  }

  // Helper function to populate sections with bid data
  function populateSectionsWithBidData(defaultSections, bid) {
    const populated = JSON.parse(JSON.stringify(defaultSections)); // Deep copy
    
    // Update Cover Page
    if (populated.cover) {
      populated.cover.fields = populated.cover.fields.map(field => {
        switch(field.name) {
          case 'tenderNo': return { ...field, value: bid.tenderRef || bid.procurementRef || bid.tenderNumber || bid.reference || '' };
          case 'tenderTitle': return { ...field, value: bid.title || bid.tenderTitle || '' };
          case 'bidDate': return { ...field, value: formatDate(bid.bidDate) || formatDate(bid.createdAt) || new Date().toISOString().split('T')[0] };
          case 'submissionDate': return { ...field, value: formatDate(bid.submissionDeadline) || formatDate(bid.deadline) || formatDate(bid.closingDate) || '' };
          case 'contactPerson': return { ...field, value: bid.contactPerson || bid.representative || '' };
          case 'phone': return { ...field, value: bid.contactPhone || bid.phone || '(960) 7786629' };
          case 'email': return { ...field, value: bid.contactEmail || bid.email || 'businesswatchmv@gmail.com' };
          default: return field;
        }
      });
    }
    
    // Update Page 5 - Quotation
    if (populated.page5_quotation) {
      // Check if bid has a saved quotation with detailed items
      const savedQuotation = bid.quotation || bid.savedQuotation || null;
      
      let subtotal, gst, grandTotal, items, clientName, validityDays, deliveryTime, paymentTerms;
      
      if (savedQuotation && (savedQuotation.items || savedQuotation.lineItems)) {
        // Use saved quotation data
        subtotal = savedQuotation.subTotal || savedQuotation.subtotal || 0;
        gst = savedQuotation.gst || savedQuotation.tax || 0;
        grandTotal = savedQuotation.grandTotal || savedQuotation.total || savedQuotation.totalAmount || 0;
        validityDays = savedQuotation.validityDays || savedQuotation.validity || '90';
        deliveryTime = savedQuotation.deliveryTime || savedQuotation.delivery || 'As per tender specifications';
        paymentTerms = savedQuotation.paymentTerms || 'As per tender terms';
        clientName = savedQuotation.client || savedQuotation.clientName || bid.client || bid.agencyName || bid.organization || '';
        
        // Extract items from saved quotation
        const quotationItems = savedQuotation.items || savedQuotation.lineItems || [];
        items = quotationItems.map((item, index) => ({
          id: index + 1,
          description: item.description || item.name || item.item || item.product || 'Item',
          qty: item.qty || item.quantity || item.orderedQty || 1,
          rate: item.rate || item.price || item.unitPrice || item.unitCost || 0,
          amount: item.amount || item.total || item.lineTotal || (item.qty * item.rate) || 0
        }));
      } else {
        // Fall back to bid data
        subtotal = bid.bidAmount ? (bid.bidAmount / 1.08) : (bid.amount / 1.08) || 0;
        gst = bid.bidAmount ? (bid.bidAmount * 0.08 / 1.08) : (bid.amount * 0.08 / 1.08) || 0;
        grandTotal = bid.bidAmount || bid.amount || 0;
        validityDays = bid.validityDays || bid.validity || '90';
        deliveryTime = bid.deliveryTime || bid.deliveryPeriod || bid.timeline || 'As per tender specifications';
        paymentTerms = bid.paymentTerms || 'As per tender terms';
        clientName = bid.client || bid.agencyName || bid.organization || bid.tenderTitle || bid.title || '';
        
        // Extract items from bid data
        items = [];
        if (bid.items && Array.isArray(bid.items)) {
          items = bid.items.map((item, index) => {
            const qty = Number(item.quantity || item.qty || item.orderedQty || 1);
            const rate = Number(item.bidPrice || item.rate || item.price || item.unitPrice || 0);
            const amount = Number(item.totalWithTax || item.amount || item.total || (qty * rate) || 0);
            return {
              id: index + 1,
              description: item.name || item.itemName || item.description || item.item || 'Item',
              qty: qty,
              rate: rate,
              amount: amount
            };
          });
        }
        
        // If no items found but we have bidAmount, create a single summary item
        if (items.length === 0 && bid.bidAmount) {
          items = [{
            id: 1,
            description: bid.description || bid.scopeOfWork || bid.deliverables || 'As per tender requirements',
            qty: 1,
            rate: Number(bid.bidAmount),
            amount: Number(bid.bidAmount)
          }];
        }
      }
      
      populated.page5_quotation.fields = populated.page5_quotation.fields.map(field => {
        switch(field.name) {
          case 'quotationNo': return { ...field, value: bid.quotationNo || bid.quoteNumber || savedQuotation?.quotationNo || `BW/${new Date().getFullYear()}/${String(bid.id || Date.now()).slice(-4)}` };
          case 'quotationDate': return { ...field, value: formatDate(savedQuotation?.date) || formatDate(savedQuotation?.quotationDate) || formatDate(bid.bidDate) || formatDate(bid.createdAt) || new Date().toISOString().split('T')[0] };
          case 'client': return { ...field, value: clientName };
          case 'procurementRef': return { ...field, value: bid.tenderRef || bid.procurementRef || bid.tenderNumber || bid.reference || savedQuotation?.procurementRef || '' };
          case 'subTotal': return { ...field, value: subtotal ? Number(subtotal).toFixed(2) : '' };
          case 'gst': return { ...field, value: gst ? Number(gst).toFixed(2) : '' };
          case 'grandTotal': return { ...field, value: grandTotal ? Number(grandTotal).toFixed(2) : '' };
          case 'validity': return { ...field, value: validityDays };
          case 'deliveryTime': return { ...field, value: deliveryTime };
          case 'paymentTerms': return { ...field, value: paymentTerms };
          case 'warranty': return { ...field, value: bid.warranty || bid.warrantyPeriod || savedQuotation?.warranty || 'As per manufacturer' };
          default: return field;
        }
      });
      
      // Update the items array
      if (items.length > 0) {
        populated.page5_quotation.items = items;
      }
    }
    
    // Update Letter of Transmittal
    if (populated.letter) {
      populated.letter.fields = populated.letter.fields.map(field => {
        if (field.name === 'subject') {
          return { ...field, value: `Submission of Tender for ${bid.title || bid.tenderTitle || ''}` };
        }
        if (field.name === 'recipient') {
          return { ...field, value: bid.agencyName || bid.organization || bid.department || 'The Tender Board\nPublic Service Media (PSM)' };
        }
        return field;
      });
    }
    
    // Update Company Info if available
    if (populated.company && bid.companyInfo) {
      populated.company.fields = populated.company.fields.map(field => {
        switch(field.name) {
          case 'regNo': return { ...field, value: bid.companyInfo.regNo || field.value };
          case 'bankName': return { ...field, value: bid.companyInfo.bankName || field.value };
          case 'accountNo': return { ...field, value: bid.companyInfo.accountNo || field.value };
          default: return field;
        }
      });
    }
    
    return populated;
  }

  // Fetch open bids from Firebase
  const fetchOpenBids = async () => {
    setLoadingOpenBids(true);
    try {
      const bidsQuery = query(
        collection(db, 'bids'),
        where('status', 'in', ['Open', 'Submitted', 'Draft']),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(bidsQuery);
      const bids = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOpenBids(bids);
    } catch (error) {
      console.error('Error fetching open bids:', error);
    } finally {
      setLoadingOpenBids(false);
    }
  };

  // Fetch documents from Firebase
  const fetchDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Load open bids and documents on mount
  useEffect(() => {
    fetchOpenBids();
    fetchDocuments();
  }, []);

  // Get documents by type for dropdown
  const getDocumentsByType = (type) => {
    return documents.filter(doc => doc.type === type);
  };

  // Handle document selection
  const handleSelectDocument = (sectionKey, fieldName, document) => {
    setSelectedDocuments(prev => ({
      ...prev,
      [`${sectionKey}_${fieldName}`]: document
    }));
    updateField(sectionKey, fieldName, document.name);
  };

  // Get document type mapping for pages
  const getDocumentTypeForPage = (sectionKey) => {
    const mapping = {
      page3_companyReg: 'registration',
      page5_gst: 'gst',
      page6_sme: 'registration',
      page7_taxClearance: 'bank',
      page8_others: 'other'
    };
    return mapping[sectionKey] || 'other';
  };

  // Helper to get Cloudinary view URL for PDFs
  const getCloudinaryViewUrl = (url) => {
    if (!url) return '';
    return url.replace('/image/upload/', '/raw/upload/fl_inline/');
  };

  // Helper to get PDF thumbnail URL
  const getPdfThumbnailUrl = (url) => {
    if (!url) return '';
    return url.replace('/image/upload/', '/image/upload/pg_1/w_800,h_1000,c_fit/').replace('.pdf', '.jpg');
  };

  // Handle selecting an open bid
  const handleSelectOpenBid = (bid) => {
    setSelectedOpenBid(bid);
    setCurrentBidName(bid.title || bid.tenderTitle || '');
    const populated = populateSectionsWithBidData(defaultBidSections, bid);
    setSections(mergeWithDefaultSections(populated));
  };

  const updateField = (sectionKey, fieldName, value) => {
    setSections(prev => {
      const prevSection = prev?.[sectionKey] || defaultBidSections?.[sectionKey];
      const prevFields = Array.isArray(prevSection?.fields) ? prevSection.fields : [];

      return {
        ...prev,
        [sectionKey]: {
          ...(prevSection || { title: sectionKey, fields: [] }),
          fields: prevFields.map(f =>
            f.name === fieldName ? { ...f, value } : f
          )
        }
      };
    });
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => 
      prev.includes(sectionKey) 
        ? prev.filter(s => s !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const saveBid = () => {
    if (!currentBidName) {
      alert('Please enter a bid name');
      return;
    }
    
    const bid = {
      id: Date.now(),
      name: currentBidName,
      sections: sections,
      createdAt: new Date().toISOString(),
      status: 'Draft'
    };
    
    setSavedBids([...savedBids, bid]);
    alert('Bid saved successfully!');
  };

  const loadBid = (bid) => {
    setSections(mergeWithDefaultSections(bid.sections));
    setCurrentBidName(bid.name);
  };

  const deleteBid = (id) => {
    if (confirm('Are you sure you want to delete this bid?')) {
      setSavedBids(savedBids.filter(b => b.id !== id));
    }
  };

  const handlePrint = () => {
    // First ensure preview is shown so content exists to print
    if (!showPreview) {
      setShowPreview(true);
      // Wait for preview to render then print
      setTimeout(() => {
        window.print();
      }, 100);
    } else {
      window.print();
    }
  };

  const handleFileUpload = (sectionKey, fieldName, file) => {
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setUploadedFiles(prev => ({
        ...prev,
        [`${sectionKey}_${fieldName}`]: { file, url: fileUrl, name: file.name }
      }));
      updateField(sectionKey, fieldName, file.name);
    }
  };

  const renderField = (sectionKey, field) => {
    const baseClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
    const fileKey = `${sectionKey}_${field.name}`;
    const uploadedFile = uploadedFiles[fileKey];
    
    switch (field.type) {
      case 'file':
        const docType = getDocumentTypeForPage(sectionKey);
        const availableDocs = getDocumentsByType(docType);
        const selectedDoc = selectedDocuments[fileKey];
        
        return (
          <div className="space-y-3">
            {/* Document Selection Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Select from Documents</label>
              <select
                value={selectedDoc?.id || ''}
                onChange={(e) => {
                  const doc = availableDocs.find(d => d.id === e.target.value);
                  if (doc) handleSelectDocument(sectionKey, field.name, doc);
                }}
                disabled={loadingDocuments}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">
                  {loadingDocuments ? 'Loading documents...' : `Select ${docType} document...`}
                </option>
                {availableDocs.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Selected Document Preview */}
            {selectedDoc && (
              <div className="flex items-center gap-2 text-sm bg-green-50 px-3 py-2 rounded border border-green-200">
                <CheckCircle size={16} className="text-green-600" />
                <span className="flex-1 truncate text-green-800">{selectedDoc.name}</span>
                <button
                  onClick={() => setPreviewDocument(selectedDoc)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  title="View Document"
                >
                  <Eye size={16} />
                </button>
              </div>
            )}
            
            {/* Or Upload New */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-xs text-gray-500">OR</span>
              </div>
            </div>
            
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(sectionKey, field.name, e.target.files[0])}
              className="hidden"
              id={`file-${fileKey}`}
            />
            <label
              htmlFor={`file-${fileKey}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 border border-blue-200 w-fit"
            >
              <FolderOpen size={18} />
              <span>{uploadedFile ? 'Change File' : 'Upload New'}</span>
            </label>
            {uploadedFile && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
                <CheckCircle size={16} />
                <span className="truncate">{uploadedFile.name}</span>
              </div>
            )}
          </div>
        );
      case 'textarea':
        return (
          <textarea
            className={`${baseClass} min-h-[100px]`}
            value={field.value || ''}
            onChange={(e) => updateField(sectionKey, field.name, e.target.value)}
            placeholder={field.label}
          />
        );
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.value || false}
              onChange={(e) => updateField(sectionKey, field.name, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Included</span>
          </label>
        );
      case 'number':
        return (
          <input
            type="number"
            className={baseClass}
            value={field.value || ''}
            onChange={(e) => updateField(sectionKey, field.name, e.target.value)}
            placeholder={field.label}
          />
        );
      default:
        return (
          <input
            type={field.type || 'text'}
            className={baseClass}
            value={field.value || ''}
            onChange={(e) => updateField(sectionKey, field.name, e.target.value)}
            placeholder={field.label}
          />
        );
    }
  };

  const renderPreview = () => {
    const sections = normalizedSections;
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto print:p-0" ref={printRef}>
        {/* Page 1 - Cover Page */}
        <div className="page-break-after">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Business Watch Private Limited</h1>
            <p className="text-sm text-gray-600 mb-2">Reg No: C0006/2025 | TIN: 1169863/GST/T/501</p>
            <p className="text-sm text-gray-600 mb-2">Address: Gulhifalhu, Lh.Himavaru, Maldives</p>
            <p className="text-sm text-gray-600 mb-2">Phone: (960) 7786629, (960) 9829050</p>
            <p className="text-sm text-gray-600">Email: businesswatchmv@gmail.com</p>
          </div>
          
          <div className="border-2 border-gray-800 p-8 mb-8">
            <h2 className="text-2xl font-bold text-center mb-4">TENDER SUBMISSION</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="py-2 font-semibold w-1/3">Tender No:</td>
                  <td className="py-2">{sections.page1_cover?.fields?.find(f => f.name === 'tenderNo')?.value || '_________________'}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 font-semibold">Tender Title:</td>
                  <td className="py-2">{sections.page1_cover?.fields?.find(f => f.name === 'tenderTitle')?.value || '_________________'}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 font-semibold">Company:</td>
                  <td className="py-2">{sections.page1_cover?.fields?.find(f => f.name === 'companyName')?.value}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 font-semibold">Contact Person:</td>
                  <td className="py-2">{sections.page1_cover?.fields?.find(f => f.name === 'contactPerson')?.value || '_________________'}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 font-semibold">TIN:</td>
                  <td className="py-2">{sections.page1_cover?.fields?.find(f => f.name === 'tin')?.value}</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">Submission Date:</td>
                  <td className="py-2">{sections.page1_cover?.fields?.find(f => f.name === 'submissionDate')?.value || '_________________'}</td>
                </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm font-semibold mt-8 text-right">Page 1 of 12</p>
      </div>

      {/* Page 2 - Documents Checklist */}
      <div className="page-break-after">
        <h2 className="text-xl font-bold text-center mb-6">DOCUMENTS CHECKLIST</h2>
        <p className="text-sm mb-4">Please verify all required documents are attached:</p>
        <table className="w-full border-collapse border border-gray-800 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 px-3 py-2 text-left">#</th>
              <th className="border border-gray-800 px-3 py-2 text-left">Document Required</th>
              <th className="border border-gray-800 px-3 py-2 text-center">Attached</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-800 px-3 py-2">1</td>
              <td className="border border-gray-800 px-3 py-2">Tender Fee Receipt</td>
              <td className="border border-gray-800 px-3 py-2 text-center">{sections.page2_checklist?.fields?.find(f => f.name === 'tenderFee')?.value ? '✓' : '☐'}</td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-3 py-2">2</td>
              <td className="border border-gray-800 px-3 py-2">Bid Security</td>
              <td className="border border-gray-800 px-3 py-2 text-center">{sections.page2_checklist?.fields?.find(f => f.name === 'bidSecurity')?.value ? '✓' : '☐'}</td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-3 py-2">3</td>
              <td className="border border-gray-800 px-3 py-2">Company Profile/Certificate</td>
              <td className="border border-gray-800 px-3 py-2 text-center">{sections.page2_checklist?.fields?.find(f => f.name === 'companyProfile')?.value ? '✓' : '☐'}</td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-3 py-2">4</td>
              <td className="border border-gray-800 px-3 py-2">TIN Certificate</td>
              <td className="border border-gray-800 px-3 py-2 text-center">{sections.page2_checklist?.fields?.find(f => f.name === 'tinCert')?.value ? '✓' : '☐'}</td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-3 py-2">5</td>
              <td className="border border-gray-800 px-3 py-2">GST Certificate</td>
              <td className="border border-gray-800 px-3 py-2 text-center">{sections.page2_checklist?.fields?.find(f => f.name === 'gstCert')?.value ? '✓' : '☐'}</td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-3 py-2">6</td>
              <td className="border border-gray-800 px-3 py-2">Bank Reference</td>
              <td className="border border-gray-800 px-3 py-2 text-center">{sections.page2_checklist?.fields?.find(f => f.name === 'bankRef')?.value ? '✓' : '☐'}</td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-3 py-2">7</td>
              <td className="border border-gray-800 px-3 py-2">Past Performance Certificates</td>
              <td className="border border-gray-800 px-3 py-2 text-center">{sections.page2_checklist?.fields?.find(f => f.name === 'pastPerformance')?.value ? '✓' : '☐'}</td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-3 py-2">8</td>
              <td className="border border-gray-800 px-3 py-2">Technical Specifications</td>
              <td className="border border-gray-800 px-3 py-2 text-center">{sections.page2_checklist?.fields?.find(f => f.name === 'technicalSpecs')?.value ? '✓' : '☐'}</td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-3 py-2">9</td>
              <td className="border border-gray-800 px-3 py-2">Price Schedule</td>
              <td className="border border-gray-800 px-3 py-2 text-center">{sections.page2_checklist?.fields?.find(f => f.name === 'priceSchedule')?.value ? '✓' : '☐'}</td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm font-semibold mt-8 text-right">Page 2 of 12</p>
      </div>

      {/* Page 3 - Bid Submission Form */}
      <div className="page-break-after">
        <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">BID SUBMISSION FORM</h2>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Authorized Signature:</p>
              <p className="border-b border-gray-400 py-1">{sections.page3_submission?.fields?.find(f => f.name === 'authorizedSignature')?.value || '_________________'}</p>
            </div>
            <div>
              <p className="font-semibold">Signatory Name & Title:</p>
              <p className="border-b border-gray-400 py-1">{sections.page3_submission?.fields?.find(f => f.name === 'signatoryName')?.value || '_________________'}</p>
            </div>
          </div>
          <div>
            <p className="font-semibold">Name of Bidder:</p>
            <p className="border-b border-gray-400 py-1">{sections.page3_submission?.fields?.find(f => f.name === 'bidderName')?.value || '_________________'}</p>
          </div>
          <div>
            <p className="font-semibold">Address:</p>
            <p className="border-b border-gray-400 py-1">{sections.page3_submission?.fields?.find(f => f.name === 'bidderAddress')?.value || '_________________'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Phone Number:</p>
              <p className="border-b border-gray-400 py-1">{sections.page3_submission?.fields?.find(f => f.name === 'phoneNumber')?.value || '_________________'}</p>
            </div>
            <div>
              <p className="font-semibold">Fax/Email:</p>
              <p className="border-b border-gray-400 py-1">{sections.page3_submission?.fields?.find(f => f.name === 'emailAddress')?.value || '_________________'}</p>
            </div>
          </div>
        </div>
        <p className="text-sm font-semibold mt-8 text-right">Page 3 of 12</p>
      </div>

      {/* Page 4 - Company Registration Certificate */}
      <div className="page-break-after">
        <div className="text-center mb-8">
          <div className="border-4 border-gray-800 p-8 inline-block">
            <h1 className="text-2xl font-bold mb-4">Certificate of Registration</h1>
            <p className="text-lg">Ministry of Economic Development & Trade</p>
            <p className="text-sm">Male' Republic Of Maldives</p>
          </div>
        </div>
        <div className="text-center space-y-4 text-sm">
          <p>I HEREBY certify that <strong>BUSINESS WATCH PRIVATE LIMITED</strong> is on this day registered</p>
          <p>under the Act no. 7/2023 and given under my hand and seal, at Male', Republic of Maldives</p>
          <p>this <strong>{sections.page4_companyReg?.fields?.find(f => f.name === 'regDate')?.value}</strong></p>
          <p className="mt-8 text-lg font-bold">No: {sections.page4_companyReg?.fields?.find(f => f.name === 'regNo')?.value}</p>
        </div>
        <p className="text-sm font-semibold mt-8 text-right">Page 4 of 12</p>
      </div>

      {/* Page 5 - Quotation */}
      <div className="page-break-after">
        <BidQuotationPage
          bid={{
            vendorNumber: '514110',
            quotationNo: sections.page5_quotation?.fields?.find(f => f.name === 'quotationNo')?.value,
            quotationDate: sections.page5_quotation?.fields?.find(f => f.name === 'quotationDate')?.value,
            authority: sections.page5_quotation?.fields?.find(f => f.name === 'client')?.value,
            title: sections.page5_quotation?.fields?.find(f => f.name === 'client')?.value,
            tenderNo: sections.page5_quotation?.fields?.find(f => f.name === 'procurementRef')?.value,
            deliveryDays: parseInt(String(sections.page5_quotation?.fields?.find(f => f.name === 'deliveryTime')?.value || '').match(/\d+/)?.[0] || '', 10) || undefined,
            quotationValidity: parseInt(String(sections.page5_quotation?.fields?.find(f => f.name === 'validity')?.value || ''), 10) || undefined,
            items: (sections.page5_quotation?.items || []).map((it, idx) => ({
              id: it.id || idx,
              name: it.description,
              quantity: it.qty,
              bidPrice: it.rate
            }))
          }}
          showTax={true}
          gstRate={8}
          selectedSignatory={0}
        />
        <p className="text-sm font-semibold mt-4 text-right">Page 5 of 12</p>
      </div>

      {/* Page 6 - Specification */}
      <div className="page-break-after">
        <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">TECHNICAL SPECIFICATIONS</h2>
        <div className="space-y-4 text-sm">
          <p><strong>Item Name:</strong> {sections.page6_specification?.fields?.find(f => f.name === 'itemName')?.value}</p>
          <p><strong>Brand:</strong> {sections.page6_specification?.fields?.find(f => f.name === 'brand')?.value}</p>
          <p><strong>Model:</strong> {sections.page6_specification?.fields?.find(f => f.name === 'model')?.value}</p>
          <p><strong>Power Output:</strong> {sections.page6_specification?.fields?.find(f => f.name === 'powerOutput')?.value}</p>
          <p><strong>Frequency Range:</strong> {sections.page6_specification?.fields?.find(f => f.name === 'frequencyRange')?.value}</p>
          <p><strong>Warranty:</strong> {sections.page6_specification?.fields?.find(f => f.name === 'warranty')?.value}</p>
          <p><strong>Delivery:</strong> {sections.page6_specification?.fields?.find(f => f.name === 'deliverySpecs')?.value}</p>
        </div>
        <p className="text-sm font-semibold mt-8 text-right">Page 6 of 12</p>
      </div>

      {/* Page 7 - GST Registration */}
      <div className="page-break-after">
        <div className="text-center mb-8">
          <p className="text-xs text-gray-500 mb-2">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-500">MALDIVES INLAND REVENUE AUTHORITY</span>
          </div>
          <h1 className="text-xl font-bold mb-2">GST Registration Certificate</h1>
          <p className="text-sm text-gray-600">ގުޅިފައިވާ ސަރުކާރުގެ ވެރިކަން ކުރާ ރާއްޖެ</p>
        </div>
        <div className="text-center space-y-4 text-sm">
          <p>This is to certify that the undermentioned business activity is registered under the<br/>Goods and Services Tax Act (Law Number 10/2011).</p>
          <div className="border-2 border-gray-800 p-4 my-6 inline-block">
            <p className="font-bold">Business Watch Private Limited</p>
            <p>TIN: {sections.page7_gst?.fields?.find(f => f.name === 'gstTin')?.value}</p>
            <p>{sections.page7_gst?.fields?.find(f => f.name === 'gstDate')?.value}</p>
            <p>Taxable Activity Number: {sections.page7_gst?.fields?.find(f => f.name === 'taxableActivity')?.value}</p>
          </div>
          <p>Commissioner General of Taxation</p>
          <p>Maldives Inland Revenue Authority</p>
        </div>
        <p className="text-sm font-semibold mt-8 text-right">Page 7 of 12</p>
      </div>

      {/* Page 8 - Garaaru (Past Projects) */}
      <div className="page-break-after">
        <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">PAST PROJECTS (GARAARU)</h2>
        <div className="space-y-4 text-sm">
          <p><strong>Project 1:</strong> {sections.page8_garaaru?.fields?.find(f => f.name === 'pastProject1')?.value}</p>
          <p><strong>Project 2:</strong> {sections.page8_garaaru?.fields?.find(f => f.name === 'pastProject2')?.value}</p>
          <p><strong>Project 3:</strong> {sections.page8_garaaru?.fields?.find(f => f.name === 'pastProject3')?.value}</p>
          <p><strong>Project 4:</strong> {sections.page8_garaaru?.fields?.find(f => f.name === 'pastProject4')?.value}</p>
          <p><strong>Project 5:</strong> {sections.page8_garaaru?.fields?.find(f => f.name === 'pastProject5')?.value}</p>
          <p className="mt-6"><strong>Total Value of Completed Projects:</strong> {sections.page8_garaaru?.fields?.find(f => f.name === 'totalValue')?.value}</p>
        </div>
        <p className="text-sm font-semibold mt-8 text-right">Page 8 of 12</p>
      </div>

      {/* Page 9 - Tax Clearance */}
      <div className="page-break-after">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs text-center">MIRA</span>
          </div>
          <h1 className="text-xl font-bold">TAX CLEARANCE REPORT</h1>
          <p className="text-sm">MALDIVES INLAND REVENUE AUTHORITY</p>
        </div>
        <div className="space-y-4 text-sm">
          <p><strong>Certificate No:</strong> {sections.page9_taxClearance?.fields?.find(f => f.name === 'taxClearanceNo')?.value}</p>
          <p><strong>Issue Date:</strong> {sections.page9_taxClearance?.fields?.find(f => f.name === 'taxClearanceDate')?.value}</p>
          <p><strong>Tax Period Covered:</strong> {sections.page9_taxClearance?.fields?.find(f => f.name === 'taxPeriod')?.value}</p>
        </div>
        <p className="text-sm font-semibold mt-8 text-right">Page 9 of 12</p>
      </div>

      {/* Page 10 - SME Registration */}
      <div className="page-break-after">
        <div className="text-center mb-6">
          <div className="text-xs text-gray-500 mb-2">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
          <p className="text-sm">MINISTRY OF ECONOMIC DEVELOPMENT & TRADE</p>
          <p className="text-xs">MALÉ REPUBLIC OF MALDIVES</p>
          <p className="text-sm mt-2">{sections.page10_sme?.fields?.find(f => f.name === 'smeNo')?.value}</p>
        </div>
        <h1 className="text-2xl font-bold text-center mb-8 underline">SME Registration</h1>
        <table className="w-full max-w-md mx-auto text-sm mb-8">
          <tbody>
            <tr>
              <td className="py-2 font-semibold">Registered To:</td>
              <td className="py-2">BUSINESS WATCH PVT LTD ({sections.page4_companyReg?.fields?.find(f => f.name === 'regNo')?.value})</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold">Registered Address:</td>
              <td className="py-2">{sections.page10_sme?.fields?.find(f => f.name === 'smeAddress')?.value}</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold">Business Category:</td>
              <td className="py-2">{sections.page10_sme?.fields?.find(f => f.name === 'businessCategory')?.value}</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold">Business Ranking:</td>
              <td className="py-2">{sections.page10_sme?.fields?.find(f => f.name === 'businessRanking')?.value}</td>
            </tr>
            <tr>
              <td className="py-2 font-semibold">Registration Date:</td>
              <td className="py-2">{sections.page10_sme?.fields?.find(f => f.name === 'smeRegDate')?.value}</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-center text-gray-500 mt-8">
          This is an electronic document generated by the office of the Registrar of Companies, Ministry of Economic Development & Trade.
        </p>
        <p className="text-sm font-semibold mt-4 text-right">Page 10 of 12</p>
      </div>

      {/* Page 11 - Experience Details */}
      <div className="page-break-after">
        <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">EXPERIENCE DETAILS</h2>
        <div className="space-y-4 text-sm">
          <p><strong>Years in Business:</strong> {sections.page11_experienceDetails?.fields?.find(f => f.name === 'experienceYears')?.value}</p>
          <p><strong>Total Projects Completed:</strong> {sections.page11_experienceDetails?.fields?.find(f => f.name === 'totalProjects')?.value}</p>
          <p><strong>Major Clients:</strong></p>
          <pre className="whitespace-pre-wrap ml-4">{sections.page11_experienceDetails?.fields?.find(f => f.name === 'majorClients')?.value}</pre>
          <p><strong>Similar Projects Completed:</strong></p>
          <pre className="whitespace-pre-wrap ml-4">{sections.page11_experienceDetails?.fields?.find(f => f.name === 'similarProjects')?.value}</pre>
          <p><strong>Average Project Value:</strong> {sections.page11_experienceDetails?.fields?.find(f => f.name === 'averageProjectValue')?.value}</p>
        </div>
        <p className="text-sm font-semibold mt-8 text-right">Page 11 of 12</p>
      </div>

      {/* Page 12 - Experience Letters & Final */}
      <div className="page-break-after">
        <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">EXPERIENCE LETTERS</h2>
        <div className="space-y-6 text-sm">
          <div className="border border-gray-300 p-4">
            <p className="font-semibold">Experience Letter 1</p>
            <p className="text-gray-600">{sections.page12_experienceLetters?.fields?.find(f => f.name === 'expLetter1')?.value ? 'Attached' : 'Not Attached'}</p>
          </div>
          <div className="border border-gray-300 p-4">
            <p className="font-semibold">Experience Letter 2</p>
            <p className="text-gray-600">{sections.page12_experienceLetters?.fields?.find(f => f.name === 'expLetter2')?.value ? 'Attached' : 'Not Attached'}</p>
          </div>
          <div className="border border-gray-300 p-4">
            <p className="font-semibold">Experience Letter 3</p>
            <p className="text-gray-600">{sections.page12_experienceLetters?.fields?.find(f => f.name === 'expLetter3')?.value ? 'Attached' : 'Not Attached'}</p>
          </div>
          <div className="border border-gray-300 p-4">
            <p className="font-semibold">Experience Letter 4</p>
            <p className="text-gray-600">{sections.page12_experienceLetters?.fields?.find(f => f.name === 'expLetter4')?.value ? 'Attached' : 'Not Attached'}</p>
          </div>
          <div className="border border-gray-300 p-4">
            <p className="font-semibold">Experience Letter 5</p>
            <p className="text-gray-600">{sections.page12_experienceLetters?.fields?.find(f => f.name === 'expLetter5')?.value ? 'Attached' : 'Not Attached'}</p>
          </div>
        </div>

        {/* Declaration */}
        <div className="mt-12 pt-8 border-t-2 border-gray-800">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Declaration</h2>
          <div className="whitespace-pre-line text-sm mb-6">
            {sections.page3_submission?.fields?.find(f => f.name === 'declaration')?.value || 'We hereby declare that all information provided in this bid is true and accurate to the best of our knowledge.'}
          </div>
          <div className="mt-8">
            <p><strong>Name:</strong> {sections.page3_submission?.fields?.find(f => f.name === 'declarantName')?.value || '_________________'}</p>
            <p><strong>Designation:</strong> {sections.page3_submission?.fields?.find(f => f.name === 'declarantDesignation')?.value || '_________________'}</p>
            <p><strong>Date:</strong> {sections.page3_submission?.fields?.find(f => f.name === 'declarationDate')?.value || '_________________'}</p>
            <p className="mt-8">_______________________</p>
            <p className="text-sm">Signature</p>
          </div>
        </div>
        <p className="text-sm font-semibold mt-8 text-right">Page 12 of 12</p>
        <p className="text-sm text-center mt-4 text-gray-500">- End of Bid Document -</p>
      </div>
    </div>
  );
};

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bid Document Compiler</h1>
          <p className="text-sm text-gray-500">Compile all bid documents ready for submission</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            {showPreview ? <Edit3 size={18} /> : <Eye size={18} />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Sections List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-700 mb-2">Bid Sections</h2>
            <p className="text-xs text-gray-500 mb-3">Click to expand/collapse</p>
            
            {/* Open Bids Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <Search size={12} />
                Select from Open Bids
              </label>
              <select
                value={selectedOpenBid?.id || ''}
                onChange={(e) => {
                  const bid = openBids.find(b => b.id === e.target.value);
                  if (bid) handleSelectOpenBid(bid);
                }}
                disabled={loadingOpenBids}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">
                  {loadingOpenBids ? 'Loading open bids...' : 'Select an open bid...'}
                </option>
                {openBids.map(bid => (
                  <option key={bid.id} value={bid.id}>
                    {bid.title || bid.tenderTitle || bid.tenderRef || 'Untitled Bid'}
                    {bid.bidAmount ? ` (MVR ${bid.bidAmount.toLocaleString()})` : ''}
                  </option>
                ))}
              </select>
              {selectedOpenBid && (
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  Selected: {selectedOpenBid.title || selectedOpenBid.tenderTitle || 'Selected Bid'}
                </div>
              )}
            </div>
          </div>
          
          {Object.entries(normalizedSections).map(([key, section]) => (
            <div key={key} className="border-b border-gray-100">
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-sm">{section.title}</span>
                {expandedSections.includes(key) ? (
                  <ChevronDown size={16} className="text-gray-400" />
                ) : (
                  <ChevronRight size={16} className="text-gray-400" />
                )}
              </button>
              {expandedSections.includes(key) && Array.isArray(section?.fields) && (
                <div className="px-4 pb-3">
                  {section.fields.map((field) => (
                    <div key={field.name} className="mb-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {field.label}
                      </label>
                      <div className="text-xs text-gray-800 bg-gray-50 px-2 py-1 rounded truncate">
                        {field.value ? '✓' : '○'}
                      </div>
                    </div>
                  ))}
                  {section.fields.length > 3 && (
                    <p className="text-xs text-gray-400">+ {section.fields.length - 3} more fields</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Saved Bids */}
          <div className="p-4 border-t border-gray-200 mt-4">
            <h2 className="font-semibold text-gray-700 mb-2">Saved Bids</h2>
            {savedBids.length === 0 ? (
              <p className="text-xs text-gray-400">No saved bids</p>
            ) : (
              <div className="space-y-2">
                {savedBids.map(bid => (
                  <div key={bid.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <span className="truncate">{bid.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => loadBid(bid)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <FolderOpen size={14} />
                      </button>
                      <button
                        onClick={() => deleteBid(bid.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {showPreview ? (
            <div className="p-8 print-content" ref={printRef}>
              {renderPreview()}
            </div>
          ) : (
            <div className="p-6">
              {/* Save Section */}
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Enter bid name (e.g., PSM Office Furniture Tender 2026)"
                  value={currentBidName}
                  onChange={(e) => setCurrentBidName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={saveBid}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save size={18} />
                  Save Bid
                </button>
              </div>

              {/* Forms */}
              <div className="space-y-6">
                {Object.entries(normalizedSections).map(([key, section]) => (
                  <div key={key} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div 
                      className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                      onClick={() => setActiveSection(activeSection === key ? null : key)}
                    >
                      <h2 className="font-semibold text-gray-800">{section.title}</h2>
                      {activeSection === key ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    
                    {activeSection === key && Array.isArray(section?.fields) && (
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.fields.map(field => (
                          <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {field.label}
                            </label>
                            {renderField(key, field)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg truncate pr-4">{previewDocument.name}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewDocument.url}
                  download={previewDocument.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Download"
                >
                  <Download size={20} />
                </a>
                <button
                  onClick={() => setPreviewDocument(null)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center">
              {previewDocument.format === 'pdf' ? (
                <div className="flex flex-col items-center max-w-full">
                  <img
                    src={getPdfThumbnailUrl(previewDocument.url)}
                    alt={previewDocument.name}
                    className="max-w-full max-h-[70vh] object-contain shadow-lg rounded-lg bg-white"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden flex-col items-center">
                    <FileText className="w-24 h-24 text-red-500 mb-4" />
                    <p className="text-gray-600 mb-4">PDF preview not available</p>
                    <a
                      href={previewDocument.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Open PDF
                    </a>
                  </div>
                </div>
              ) : (
                <img
                  src={previewDocument.url}
                  alt={previewDocument.name}
                  className="max-w-full max-h-full object-contain mx-auto p-4 bg-white rounded-lg shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        /* Preview mode - show pages with visual separation */
        .page-break-after {
          page-break-after: always;
          break-after: page;
          border-bottom: 2px dashed #ccc;
          padding-bottom: 2rem;
          margin-bottom: 2rem;
        }
        
        @media print {
          .page-break-after {
            page-break-after: always;
            break-after: page;
            border-bottom: none;
            padding-bottom: 0;
            margin-bottom: 0;
          }
          /* Hide UI elements */
          nav, header, aside, .no-print, button, .sidebar, .accordion {
            display: none !important;
          }
          /* Show print content */
          .print-content, .print-content * {
            visibility: visible !important;
            display: block !important;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
