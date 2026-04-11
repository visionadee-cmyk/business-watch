import React, { useState, useRef } from 'react';
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
  X
} from 'lucide-react';

// Default bid sections based on typical PSM bid format - 23 pages
const defaultBidSections = {
  page1_declaration: {
    title: 'Page 1 - Declaration of Ethical Conduct',
    fields: [
      { name: 'authorizedSignature', label: 'Authorized Signature', value: '', type: 'text' },
      { name: 'signatoryName', label: 'Name and Title of Signatory', value: 'Aboobakuru Qasim', type: 'text' },
      { name: 'bidderName', label: 'Name of Bidder', value: 'Business Watch Pvt. Ltd (C00062025)', type: 'text' },
      { name: 'bidderAddress', label: 'Address', value: 'Gulfaamge, Lh.hinnavaru, Maldives', type: 'textarea' },
      { name: 'phoneNumber', label: 'Phone Number', value: '7786629, 9829050', type: 'text' },
      { name: 'emailAddress', label: 'Fax Number/Email', value: 'businesswatchmv@gmail.com', type: 'text' },
    ]
  },
  page2_quotation: {
    title: 'Page 2 - Bid Quotation',
    fields: [
      { name: 'quotationNo', label: 'Quotation No', value: 'BW/2026/026', type: 'text' },
      { name: 'quotationDate', label: 'Date', value: '', type: 'date' },
      { name: 'client', label: 'Client', value: 'Public Service Media (PSM)', type: 'text' },
      { name: 'procurementRef', label: 'Procurement Ref', value: '(PROC-05-26) BIT/2026/20', type: 'text' },
      { name: 'items', label: 'Items Description', value: 'Transmitter and related equipment', type: 'textarea' },
      { name: 'subTotal', label: 'Sub Total (MVR)', value: '68500.00', type: 'text' },
      { name: 'gst', label: 'GST 8%', value: '5480.00', type: 'text' },
      { name: 'grandTotal', label: 'Grand Total', value: '73980.00', type: 'text' },
      { name: 'validity', label: 'Validity (days)', value: '90', type: 'number' },
    ]
  },
  page3_companyReg: {
    title: 'Page 3 - Company Registration Certificate',
    fields: [
      { name: 'companyRegCert', label: 'Company Registration Certificate', value: null, type: 'file' },
      { name: 'regNo', label: 'Registration No', value: 'C0006/2025', type: 'text' },
      { name: 'regDate', label: 'Registration Date', value: '8th day of January 2025', type: 'text' },
    ]
  },
  page4_pastBids: {
    title: 'Page 4 - Past Completed Bids',
    fields: [
      { name: 'pastProject1', label: 'Project 1', value: 'Ministry of Education - Office Furniture Supply (2025)', type: 'text' },
      { name: 'pastProject2', label: 'Project 2', value: 'State Electric Company - IT Equipment (2024)', type: 'text' },
      { name: 'pastProject3', label: 'Project 3', value: 'Male City Council - Office Supplies (2024)', type: 'text' },
      { name: 'pastProject4', label: 'Project 4', value: 'IGMH - Medical Equipment (2024)', type: 'text' },
      { name: 'pastProject5', label: 'Project 5', value: 'Customs Department - Security Systems (2023)', type: 'text' },
      { name: 'totalValue', label: 'Total Value of Completed Projects', value: '1,099,510.00', type: 'text' },
    ]
  },
  page5_gst: {
    title: 'Page 5 - GST Registration Certificate',
    fields: [
      { name: 'gstCert', label: 'GST Registration Certificate', value: null, type: 'file' },
      { name: 'gstTin', label: 'TIN', value: '1169863GST501', type: 'text' },
      { name: 'gstDate', label: 'Registration Date', value: '25 August 2025', type: 'text' },
      { name: 'taxableActivity', label: 'Taxable Activity Number', value: '001', type: 'text' },
    ]
  },
  page6_sme: {
    title: 'Page 6 - SME Registration',
    fields: [
      { name: 'smeCert', label: 'SME Registration Certificate', value: null, type: 'file' },
      { name: 'smeNo', label: 'SME Number', value: 'SME00543025', type: 'text' },
      { name: 'smeAddress', label: 'Registered Address', value: 'Gulfaamge, 07010, Lh. Himavaru, Maldives', type: 'textarea' },
      { name: 'businessCategory', label: 'Business Category', value: 'Trading', type: 'text' },
      { name: 'businessRanking', label: 'Business Ranking', value: 'Micro', type: 'text' },
      { name: 'smeRegDate', label: 'Registration Date', value: '19th January 2025', type: 'text' },
    ]
  },
  page7_taxClearance: {
    title: 'Page 7 - Tax Clearance Report',
    fields: [
      { name: 'taxClearanceCert', label: 'Tax Clearance Certificate', value: null, type: 'file' },
      { name: 'refNumber', label: 'Reference Number', value: '1169863/TC/DCS/2026/02', type: 'text' },
      { name: 'dateOfIssue', label: 'Date of Issue', value: '04/01/2026', type: 'text' },
      { name: 'taxpayerId', label: 'Taxpayer Identification No', value: '1169863', type: 'text' },
      { name: 'taxStatus', label: 'Status of Dues', value: 'The Taxpayer has no tax related dues', type: 'text' },
    ]
  },
  page8_others: {
    title: 'Page 8 - Other Documents',
    fields: [
      { name: 'otherDoc1', label: 'Document 1 (Council Certificate)', value: null, type: 'file' },
      { name: 'otherDoc2', label: 'Document 2 (Nafthaa Certificate)', value: null, type: 'file' },
      { name: 'otherDoc3', label: 'Document 3', value: null, type: 'file' },
    ]
  },
  cover: {
    title: 'Cover Page',
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
  letter: {
    title: 'Letter of Transmittal',
    fields: [
      { name: 'recipient', label: 'To', value: 'The Tender Board\nPublic Service Media (PSM)', type: 'textarea' },
      { name: 'subject', label: 'Subject', value: 'Submission of Tender for ', type: 'text' },
      { name: 'letterContent', label: 'Letter Content', value: 'Dear Sir/Madam,\n\nWe hereby submit our tender for the above-mentioned tender document. We confirm that we have read and understood all terms and conditions mentioned in the tender document and agree to abide by them.\n\nWe confirm that the prices quoted in the tender are valid for the period specified in the tender document.\n\nWe attach herewith all required documents as specified in the tender document.', type: 'textarea' },
      { name: 'signature', label: 'Authorized Signature', value: '', type: 'text' },
      { name: 'name', label: 'Name', value: 'Abobakuru Qasim', type: 'text' },
      { name: 'designation', label: 'Designation', value: 'Managing Director', type: 'text' },
      { name: 'date', label: 'Date', value: '', type: 'date' },
    ]
  },
  checklist: {
    title: 'Document Checklist',
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
  company: {
    title: 'Company Information',
    fields: [
      { name: 'regNo', label: 'Company Registration No', value: 'C0006/2025', type: 'text' },
      { name: 'dateIncorporated', label: 'Date Incorporated', value: '', type: 'date' },
      { name: 'businessType', label: 'Business Type', value: 'Private Limited Company', type: 'text' },
      { name: 'employees', label: 'No. of Employees', value: '15', type: 'number' },
      { name: 'businessDesc', label: 'Description of Business', value: 'Supply of Office Equipment, Furniture, IT Products and General Trading', type: 'textarea' },
      { name: 'bankName', label: 'Bank Name', value: 'Bank of Maldives (BML)', type: 'text' },
      { name: 'accountNo', label: 'Account Number', value: '7770000180096', type: 'text' },
    ]
  },
  experience: {
    title: 'Experience & Past Performance',
    fields: [
      { name: 'experienceYears', label: 'Years in Business', value: '10', type: 'number' },
      { name: 'majorClients', label: 'Major Clients (List 3-5)', value: '1. Ministry of Education\n2. State Electric Company\n3. Male City Council\n4. Indhira Gandhi Memorial Hospital\n5. Customs Department', type: 'textarea' },
      { name: 'similarProjects', label: 'Similar Projects Completed', value: 'Supply of office furniture and IT equipment to various government ministries and state-owned enterprises.', type: 'textarea' },
    ]
  },
  technical: {
    title: 'Technical Compliance',
    fields: [
      { name: 'productOrigin', label: 'Country of Origin', value: 'Various (Malaysia, China, UAE, Singapore)', type: 'text' },
      { name: 'warranty', label: 'Warranty Period', value: '1-3 years as per manufacturer', type: 'text' },
      { name: 'deliveryTime', label: 'Delivery Timeframe', value: 'Within 30-45 days from PO', type: 'text' },
      { name: 'afterSales', label: 'After Sales Service', value: 'Technical support and maintenance available', type: 'textarea' },
      { name: 'certifications', label: 'Product Certifications', value: 'ISO certified products where applicable', type: 'textarea' },
    ]
  },
  declaration: {
    title: 'Declaration',
    fields: [
      { name: 'declaration', label: 'Declaration Text', value: 'I/We hereby declare that:\n\n1. All information provided is true and correct\n2. We have not been blacklisted by any government agency\n3. We are not involved in any bankruptcy proceedings\n4. We agree to abide by all terms and conditions of the tender\n5. We have not offered any inducement to secure this tender', type: 'textarea' },
      { name: 'declarantName', label: 'Name', value: 'Abobakuru Qasim', type: 'text' },
      { name: 'declarantDesignation', label: 'Designation', value: 'Managing Director', type: 'text' },
      { name: 'declarationDate', label: 'Date', value: '', type: 'date' },
    ]
  }
};

export default function BidCompiler() {
  const [sections, setSections] = useState(defaultBidSections);
  const [activeSection, setActiveSection] = useState('page1_declaration');
  const [showPreview, setShowPreview] = useState(false);
  const [savedBids, setSavedBids] = useState([]);
  const [currentBidName, setCurrentBidName] = useState('');
  const [expandedSections, setExpandedSections] = useState(Object.keys(defaultBidSections));
  const [uploadedFiles, setUploadedFiles] = useState({});
  const printRef = useRef();

  const updateField = (sectionKey, fieldName, value) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        fields: prev[sectionKey].fields.map(f => 
          f.name === fieldName ? { ...f, value } : f
        )
      }
    }));
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
    setSections(bid.sections);
    setCurrentBidName(bid.name);
  };

  const deleteBid = (id) => {
    if (confirm('Are you sure you want to delete this bid?')) {
      setSavedBids(savedBids.filter(b => b.id !== id));
    }
  };

  const handlePrint = () => {
    window.print();
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
        return (
          <div className="space-y-2">
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
              <span>{uploadedFile ? 'Change File' : 'Upload Certificate'}</span>
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
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto print:p-0" ref={printRef}>
        {/* Page 1 - Declaration of Ethical Conduct */}
        <div className="page-break-after">
          <h1 className="text-xl font-bold text-center mb-6 underline">Declaration of Ethical Conduct and Fraud and Corruption</h1>
          <p className="text-sm mb-4">We the undersigned confirm in the preparation of our Bid that:</p>
          <ol className="text-sm list-decimal list-inside space-y-2 mb-6">
            <li>Neither we, nor any of our employees, associates, agents, shareholders, consultants, partners or their relatives or associates have any relationship that could be regarded as a conflict of interest as set out in the Bidding Documents.</li>
            <li>Should we become aware of the potential for such a conflict, will report it immediately to the Procuring Entity.</li>
            <li>That neither we, nor any of our employees, associates, agents, shareholders, partners, consultants or their relatives or associates have entered into corrupt, fraudulent, coercive or collusive practices in respect of our bid or proposal.</li>
            <li>We understand our obligation to allow the Procuring Entity to inspect all records relating to the preparation of our bid and any contract that may result from such, irrespective of if we are awarded a contract or not.</li>
            <li>That no payments in connection with this procurement exercise have been made by us or our associates, agents, shareholders, partners or their relatives or associates to any of the staff, associates, consultants, employees or relatives of such who are involved with the procurement process on behalf of the Procuring Entity, Client or Employer.</li>
          </ol>
          
          <table className="w-full border-collapse border border-gray-800 text-sm mb-8">
            <tbody>
              <tr>
                <td className="border border-gray-800 px-3 py-2 w-12 text-center">1</td>
                <td className="border border-gray-800 px-3 py-2">Authorized Signature:</td>
                <td className="border border-gray-800 px-3 py-2">{sections.page1_declaration.fields.find(f => f.name === 'authorizedSignature')?.value || '_________________'}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 px-3 py-2 text-center">2</td>
                <td className="border border-gray-800 px-3 py-2">Name and Title of Signatory:</td>
                <td className="border border-gray-800 px-3 py-2">{sections.page1_declaration.fields.find(f => f.name === 'signatoryName')?.value}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 px-3 py-2 text-center">3</td>
                <td className="border border-gray-800 px-3 py-2">Name of Bidder:</td>
                <td className="border border-gray-800 px-3 py-2">{sections.page1_declaration.fields.find(f => f.name === 'bidderName')?.value}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 px-3 py-2 text-center">4</td>
                <td className="border border-gray-800 px-3 py-2">Address:</td>
                <td className="border border-gray-800 px-3 py-2">{sections.page1_declaration.fields.find(f => f.name === 'bidderAddress')?.value}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 px-3 py-2 text-center">5</td>
                <td className="border border-gray-800 px-3 py-2">Phone Number:</td>
                <td className="border border-gray-800 px-3 py-2">{sections.page1_declaration.fields.find(f => f.name === 'phoneNumber')?.value}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 px-3 py-2 text-center">6</td>
                <td className="border border-gray-800 px-3 py-2">Fax Number/Email:</td>
                <td className="border border-gray-800 px-3 py-2">{sections.page1_declaration.fields.find(f => f.name === 'emailAddress')?.value}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm font-semibold mt-8">Page 1 of 23</p>
        </div>

        {/* Page 2 - Bid Quotation */}
        <div className="page-break-after">
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 mb-1">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
            <h1 className="text-2xl font-bold">Business Watch <span className="text-lg font-normal">Private Limited</span></h1>
            <p className="text-sm">Reg No: C00062025 | TIN: 1169863GST501</p>
            <p className="text-sm">Address: Gulfaamge, Lh.Hinnavaru</p>
            <p className="text-sm">Contact: (960)7786629, (960) 9829050, email: businesswatchmv@gmail.com</p>
          </div>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm"><strong>Quotation No:</strong> {sections.page2_quotation.fields.find(f => f.name === 'quotationNo')?.value}</p>
              <p className="text-sm"><strong>Date:</strong> {sections.page2_quotation.fields.find(f => f.name === 'quotationDate')?.value}</p>
              <p className="text-sm"><strong>Client:</strong> {sections.page2_quotation.fields.find(f => f.name === 'client')?.value}</p>
              <p className="text-sm"><strong>Procurement Ref:</strong> {sections.page2_quotation.fields.find(f => f.name === 'procurementRef')?.value}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">QUOTATION</h2>
              <p className="text-sm">Vendor No: 514110</p>
            </div>
          </div>

          <table className="w-full border-collapse border border-gray-800 text-sm mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-800 px-2 py-1">#</th>
                <th className="border border-gray-800 px-2 py-1">Item, model no</th>
                <th className="border border-gray-800 px-2 py-1">Qty</th>
                <th className="border border-gray-800 px-2 py-1">Rate</th>
                <th className="border border-gray-800 px-2 py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-800 px-2 py-1 text-center">1</td>
                <td className="border border-gray-800 px-2 py-1">
                  <strong>TRANSMITTER</strong><br/>
                  OFFERED BRAND AND MODEL:<br/>
                  Brand: FMUSER, Model: FU618F-300W<br/>
                  OR<br/>
                  Brand: ZHC, Model: ZHC618F-300W<br/><br/>
                  Specs are attached<br/>
                  Warranty: 01 year
                </td>
                <td className="border border-gray-800 px-2 py-1 text-center">1</td>
                <td className="border border-gray-800 px-2 py-1 text-right">68500.00</td>
                <td className="border border-gray-800 px-2 py-1 text-right">68,500.00</td>
              </tr>
              <tr>
                <td className="border border-gray-800 px-2 py-1 text-right" colSpan="4"><strong>Sub total</strong></td>
                <td className="border border-gray-800 px-2 py-1 text-right">{sections.page2_quotation.fields.find(f => f.name === 'subTotal')?.value}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 px-2 py-1 text-right" colSpan="4"><strong>GST 8%</strong></td>
                <td className="border border-gray-800 px-2 py-1 text-right">{sections.page2_quotation.fields.find(f => f.name === 'gst')?.value}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 px-2 py-1 text-right" colSpan="4"><strong>Total:</strong> Seventy-three thousand nine hundred eighty only</td>
                <td className="border border-gray-800 px-2 py-1 text-right font-bold">{sections.page2_quotation.fields.find(f => f.name === 'grandTotal')?.value}</td>
              </tr>
            </tbody>
          </table>

          <p className="text-sm mb-1">All rates and amounts are in MVR.</p>
          <p className="text-sm mb-1"><strong>Delivery:</strong> 01 days</p>
          <p className="text-sm mb-4">Quotation / bid Validity: {sections.page2_quotation.fields.find(f => f.name === 'validity')?.value} days from bid opening.</p>

          <div className="mt-8">
            <p className="text-sm font-semibold mb-4">Authorised Signatory</p>
            <p className="text-sm">Aboobakuru Qasim<br/>Managing Director</p>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 2 of 23</p>
        </div>

        {/* Page 3 - Company Registration Certificate */}
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
            <p>this <strong>{sections.page3_companyReg.fields.find(f => f.name === 'regDate')?.value}</strong></p>
            <p className="mt-8 text-lg font-bold">No: {sections.page3_companyReg.fields.find(f => f.name === 'regNo')?.value}</p>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 3 of 23</p>
        </div>

        {/* Page 4 - Past Completed Bids */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Past Completed Projects / Performance History</h2>
          <table className="w-full border-collapse border border-gray-800 text-sm mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-800 px-3 py-2">#</th>
                <th className="border border-gray-800 px-3 py-2">Client</th>
                <th className="border border-gray-800 px-3 py-2">Project Description</th>
                <th className="border border-gray-800 px-3 py-2">Year</th>
                <th className="border border-gray-800 px-3 py-2">Value (MVR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-800 px-3 py-2 text-center">1</td>
                <td className="border border-gray-800 px-3 py-2">Ministry of Education</td>
                <td className="border border-gray-800 px-3 py-2">Office Furniture Supply</td>
                <td className="border border-gray-800 px-3 py-2 text-center">2025</td>
                <td className="border border-gray-800 px-3 py-2 text-right">387,810.00</td>
              </tr>
              <tr>
                <td className="border border-gray-800 px-3 py-2 text-center">2</td>
                <td className="border border-gray-800 px-3 py-2">State Electric Company</td>
                <td className="border border-gray-800 px-3 py-2">IT Equipment</td>
                <td className="border border-gray-800 px-3 py-2 text-center">2024</td>
                <td className="border border-gray-800 px-3 py-2 text-right">76,500.00</td>
              </tr>
              <tr>
                <td className="border border-gray-800 px-3 py-2 text-center">3</td>
                <td className="border border-gray-800 px-3 py-2">Male City Council</td>
                <td className="border border-gray-800 px-3 py-2">Office Supplies</td>
                <td className="border border-gray-800 px-3 py-2 text-center">2024</td>
                <td className="border border-gray-800 px-3 py-2 text-right">68,500.00</td>
              </tr>
              <tr>
                <td className="border border-gray-800 px-3 py-2 text-center">4</td>
                <td className="border border-gray-800 px-3 py-2">IGMH</td>
                <td className="border border-gray-800 px-3 py-2">Medical Equipment</td>
                <td className="border border-gray-800 px-3 py-2 text-center">2024</td>
                <td className="border border-gray-800 px-3 py-2 text-right">149,900.00</td>
              </tr>
              <tr>
                <td className="border border-gray-800 px-3 py-2 text-center">5</td>
                <td className="border border-gray-800 px-3 py-2">Customs Department</td>
                <td className="border border-gray-800 px-3 py-2">Security Systems</td>
                <td className="border border-gray-800 px-3 py-2 text-center">2023</td>
                <td className="border border-gray-800 px-3 py-2 text-right">87,200.00</td>
              </tr>
              <tr>
                <td className="border border-gray-800 px-3 py-2 text-center">6</td>
                <td className="border border-gray-800 px-3 py-2">Others</td>
                <td className="border border-gray-800 px-3 py-2">Various Supplies</td>
                <td className="border border-gray-800 px-3 py-2 text-center">2025</td>
                <td className="border border-gray-800 px-3 py-2 text-right">330,100.00</td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-800 px-3 py-2 text-right" colSpan="4">TOTAL VALUE OF COMPLETED PROJECTS</td>
                <td className="border border-gray-800 px-3 py-2 text-right">{sections.page4_pastBids.fields.find(f => f.name === 'totalValue')?.value}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm font-semibold mt-8 text-right">Page 4 of 23</p>
        </div>

        {/* Page 5 - GST Registration Certificate */}
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
              <p>TIN: {sections.page5_gst.fields.find(f => f.name === 'gstTin')?.value}</p>
              <p>{sections.page5_gst.fields.find(f => f.name === 'gstDate')?.value}</p>
              <p>Taxable Activity Number: {sections.page5_gst.fields.find(f => f.name === 'taxableActivity')?.value}</p>
            </div>
            <p>Commissioner General of Taxation</p>
            <p>Maldives Inland Revenue Authority</p>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 5 of 23</p>
        </div>

        {/* Page 6 - SME Registration */}
        <div className="page-break-after">
          <div className="text-center mb-6">
            <div className="text-xs text-gray-500 mb-2">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
            <p className="text-sm">MINISTRY OF ECONOMIC DEVELOPMENT & TRADE</p>
            <p className="text-xs">MALÉ REPUBLIC OF MALDIVES</p>
            <p className="text-sm mt-2">{sections.page6_sme.fields.find(f => f.name === 'smeNo')?.value}</p>
          </div>
          <h1 className="text-2xl font-bold text-center mb-8 underline">SME Registration</h1>
          <table className="w-full max-w-md mx-auto text-sm mb-8">
            <tbody>
              <tr>
                <td className="py-2 font-semibold">Registered To:</td>
                <td className="py-2">BUSINESS WATCH PVT LTD ({sections.page3_companyReg.fields.find(f => f.name === 'regNo')?.value})</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Registered Address:</td>
                <td className="py-2">{sections.page6_sme.fields.find(f => f.name === 'smeAddress')?.value}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Business Category:</td>
                <td className="py-2">{sections.page6_sme.fields.find(f => f.name === 'businessCategory')?.value}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Business Ranking:</td>
                <td className="py-2">{sections.page6_sme.fields.find(f => f.name === 'businessRanking')?.value}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Registration Date:</td>
                <td className="py-2">{sections.page6_sme.fields.find(f => f.name === 'smeRegDate')?.value}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-center text-gray-500 mt-8">
            This is an electronic document generated by the office of the Registrar of Companies, Ministry of Economic Development & Trade.
          </p>
          <p className="text-sm font-semibold mt-4 text-right">Page 6 of 23</p>
        </div>

        {/* Page 7 - Tax Clearance Report */}
        <div className="page-break-after">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs text-center">MIRA</span>
            </div>
            <h1 className="text-xl font-bold">TAX CLEARANCE REPORT</h1>
            <p className="text-sm">MALDIVES INLAND REVENUE AUTHORITY</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p><strong>Reference Number:</strong> {sections.page7_taxClearance.fields.find(f => f.name === 'refNumber')?.value}</p>
              <p><strong>Date of Issue:</strong> {sections.page7_taxClearance.fields.find(f => f.name === 'dateOfIssue')?.value}</p>
            </div>
            <div>
              <p><strong>Taxpayer Identification No:</strong> {sections.page7_taxClearance.fields.find(f => f.name === 'taxpayerId')?.value}</p>
            </div>
          </div>
          <div className="border-2 border-gray-800 p-4 mb-4">
            <p className="text-sm font-semibold mb-2">Status of dues:</p>
            <p className="text-sm">☑ {sections.page7_taxClearance.fields.find(f => f.name === 'taxStatus')?.value}</p>
          </div>
          <p className="text-sm mt-4">
            Below are the details of the taxes and fees that has been checked for the purpose of this clearance:
          </p>
          <table className="w-full border-collapse border border-gray-400 text-xs mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-2 py-1">#</th>
                <th className="border border-gray-400 px-2 py-1">Description</th>
                <th className="border border-gray-400 px-2 py-1">#</th>
                <th className="border border-gray-400 px-2 py-1">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border px-2 py-1">1</td><td className="border px-2 py-1">Income Tax</td><td className="border px-2 py-1">13</td><td className="border px-2 py-1">Guest House Registration Fee</td></tr>
              <tr><td className="border px-2 py-1">2</td><td className="border px-2 py-1">Goods & Services Tax</td><td className="border px-2 py-1">14</td><td className="border px-2 py-1">Dive School Registration Fee</td></tr>
              <tr><td className="border px-2 py-1">3</td><td className="border px-2 py-1">Green Tax</td><td className="border px-2 py-1">15</td><td className="border px-2 py-1">Tourism related Bank Mortgage Registration Fee</td></tr>
              <tr><td className="border px-2 py-1">4</td><td className="border px-2 py-1">Airport Tax & Fee</td><td className="border px-2 py-1">16</td><td className="border px-2 py-1">Tourism related other Registration and License Fee</td></tr>
            </tbody>
          </table>
          <p className="text-sm font-semibold mt-8 text-right">Page 7 of 23</p>
        </div>

        {/* Page 8 - Other Documents */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Supporting Documents</h2>
          <div className="space-y-4">
            <div className="border border-gray-300 p-4">
              <h3 className="font-semibold mb-2">1. Council Certificate</h3>
              <p className="text-sm text-gray-600">Faadhippolhu Hinnavaru Council Certificate of Good Standing</p>
              <p className="text-sm mt-2">Certificate No: (OTH/P)325/PRN/V2025/16</p>
            </div>
            <div className="border border-gray-300 p-4">
              <h3 className="font-semibold mb-2">2. Nafthaa Certificate</h3>
              <p className="text-sm text-gray-600">National Certification for business compliance</p>
            </div>
            <div className="border border-gray-300 p-4">
              <h3 className="font-semibold mb-2">3. Additional Supporting Documents</h3>
              <p className="text-sm text-gray-600">As per tender requirements</p>
            </div>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 8 of 23</p>
        </div>

        {/* Letter of Transmittal */}
        <div className="page-break-after mt-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Letter of Transmittal</h2>
          <div className="whitespace-pre-line text-sm">
            {sections.letter.fields.find(f => f.name === 'recipient')?.value}
          </div>
          <p className="mt-4 font-semibold">{sections.letter.fields.find(f => f.name === 'subject')?.value}</p>
          <div className="whitespace-pre-line mt-4 text-sm">
            {sections.letter.fields.find(f => f.name === 'letterContent')?.value}
          </div>
          <div className="mt-8">
            <p>Yours faithfully,</p>
            <p className="mt-4 font-semibold">{sections.letter.fields.find(f => f.name === 'signature')?.value}</p>
            <p>{sections.letter.fields.find(f => f.name === 'name')?.value}</p>
            <p>{sections.letter.fields.find(f => f.name === 'designation')?.value}</p>
            <p>{sections.letter.fields.find(f => f.name === 'date')?.value}</p>
          </div>
        </div>

        {/* Document Checklist */}
        <div className="page-break-after mt-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Document Checklist</h2>
          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 px-3 py-2 text-left">Document</th>
                <th className="border border-gray-400 px-3 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {sections.checklist.fields.map(field => (
                <tr key={field.name}>
                  <td className="border border-gray-400 px-3 py-2">{field.label}</td>
                  <td className="border border-gray-400 px-3 py-2 text-center">
                    {field.value ? 
                      <span className="text-green-600 font-semibold">✓ Included</span> : 
                      <span className="text-red-500">Not Included</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Company Information */}
        <div className="page-break-after mt-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Company Information</h2>
          <table className="w-full text-sm">
            <tbody>
              {sections.company.fields.map(field => (
                <tr key={field.name} className="border-b">
                  <td className="py-2 font-semibold w-1/3">{field.label}:</td>
                  <td className="py-2 whitespace-pre-line">{field.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Experience */}
        <div className="page-break-after mt-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Experience & Past Performance</h2>
          {sections.experience.fields.map(field => (
            <div key={field.name} className="mb-4">
              <h3 className="font-semibold text-sm">{field.label}</h3>
              <p className="text-sm whitespace-pre-line mt-1">{field.value}</p>
            </div>
          ))}
        </div>

        {/* Technical */}
        <div className="page-break-after mt-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Technical Compliance</h2>
          {sections.technical.fields.map(field => (
            <div key={field.name} className="mb-4">
              <h3 className="font-semibold text-sm">{field.label}</h3>
              <p className="text-sm whitespace-pre-line mt-1">{field.value}</p>
            </div>
          ))}
        </div>

        {/* Pages 9-23 - Common Specifications */}
        
        {/* Page 9 - Technical Specifications Overview */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Technical Specifications - Overview</h2>
          <div className="space-y-4 text-sm">
            <p><strong>Item Name:</strong> {sections.page2_quotation.fields.find(f => f.name === 'items')?.value || 'Transmitter and Related Equipment'}</p>
            <p><strong>Brand:</strong> FMUSER or ZHC (Equivalent brands accepted)</p>
            <p><strong>Model:</strong> FU618F-300W / ZHC618F-300W or equivalent</p>
            <p><strong>Power Output:</strong> 300W</p>
            <p><strong>Frequency Range:</strong> 87.5-108 MHz</p>
            <p><strong>Operating Temperature:</strong> -10°C to +50°C</p>
            <p><strong>Power Supply:</strong> AC 220V ±10%, 50/60Hz</p>
            <p><strong>Cooling:</strong> Forced air cooling</p>
            <p><strong>Audio Input:</strong> XLR balanced, RCA unbalanced</p>
            <p><strong>Harmonic Suppression:</strong> ≥60dB</p>
            <p><strong>Spurious Suppression:</strong> ≥70dB</p>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 9 of 23</p>
        </div>

        {/* Page 10 - Detailed Specifications */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Detailed Technical Specifications</h2>
          <h3 className="font-bold mb-3">RF Specifications:</h3>
          <table className="w-full border-collapse border border-gray-800 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-800 px-2 py-1 w-1/3">RF Output Power</td><td className="border border-gray-800 px-2 py-1">300W (adjustable 0-300W)</td></tr>
              <tr><td className="border border-gray-800 px-2 py-1">Frequency Range</td><td className="border border-gray-800 px-2 py-1">87.5-108 MHz</td></tr>
              <tr><td className="border border-gray-800 px-2 py-1">Frequency Stability</td><td className="border border-gray-800 px-2 py-1">±10Hz</td></tr>
              <tr><td className="border border-gray-800 px-2 py-1">Harmonic Suppression</td><td className="border border-gray-800 px-2 py-1">≥60dB</td></tr>
              <tr><td className="border border-gray-800 px-2 py-1">Spurious Suppression</td><td className="border border-gray-800 px-2 py-1">≥70dB</td></tr>
              <tr><td className="border border-gray-800 px-2 py-1">VSWR</td><td className="border border-gray-800 px-2 py-1"><1.5:1</td></tr>
            </tbody>
          </table>
          <h3 className="font-bold mb-3">Audio Specifications:</h3>
          <table className="w-full border-collapse border border-gray-800 text-sm">
            <tbody>
              <tr><td className="border border-gray-800 px-2 py-1 w-1/3">Audio Input Level</td><td className="border border-gray-800 px-2 py-1">-15dBm to +15dBm</td></tr>
              <tr><td className="border border-gray-800 px-2 py-1">Frequency Response</td><td className="border border-gray-800 px-2 py-1">30Hz-15KHz (±1dB)</td></tr>
              <tr><td className="border border-gray-800 px-2 py-1">Left/Right Channel Separation</td><td className="border border-gray-800 px-2 py-1">≥50dB</td></tr>
              <tr><td className="border border-gray-800 px-2 py-1">Stereo S/N Ratio</td><td className="border border-gray-800 px-2 py-1">≥70dB</td></tr>
              <tr><td className="border border-gray-800 px-2 py-1">Audio Distortion</td><td className="border border-gray-800 px-2 py-1"><0.3%</td></tr>
            </tbody>
          </table>
          <p className="text-sm font-semibold mt-8 text-right">Page 10 of 23</p>
        </div>

        {/* Page 11 - Warranty & Support */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Warranty & Technical Support</h2>
          <div className="space-y-4 text-sm">
            <h3 className="font-bold">Warranty Terms:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Manufacturer warranty: 12 months from date of installation</li>
              <li>On-site service available within 48 hours of complaint</li>
              <li>Replacement parts provided free of charge during warranty period</li>
              <li>Extended warranty available at additional cost</li>
            </ul>
            <h3 className="font-bold mt-4">Technical Support:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>24/7 phone support available</li>
              <li>Remote diagnostic capability</li>
              <li>On-site technician deployment within 24 hours</li>
              <li>Training provided to operators</li>
              <li>Maintenance manual and documentation provided</li>
            </ul>
            <h3 className="font-bold mt-4">Service Centers:</h3>
            <p>Authorized service centers available in Maldives and neighboring countries.</p>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 11 of 23</p>
        </div>

        {/* Page 12 - Delivery & Installation */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Delivery & Installation</h2>
          <div className="space-y-4 text-sm">
            <h3 className="font-bold">Delivery Terms:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Delivery timeframe: Within 30-45 days from Purchase Order</li>
              <li>Delivery location: As specified by client</li>
              <li>Packaging: Export standard wooden crate packaging</li>
              <li>Transportation: Air freight or sea freight as required</li>
              <li>Insurance: All risks insurance during transit</li>
            </ul>
            <h3 className="font-bold mt-4">Installation Services:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Installation and commissioning included in price</li>
              <li>Technical engineer will supervise installation</li>
              <li>System testing and alignment included</li>
              <li>Integration with existing infrastructure</li>
              <li>Full system documentation provided</li>
            </ul>
            <h3 className="font-bold mt-4">Acceptance Testing:</h3>
            <p>Joint acceptance testing will be conducted with client representative. System must meet all specified parameters before final acceptance.</p>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 12 of 23</p>
        </div>

        {/* Page 13 - Terms & Conditions */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Terms & Conditions</h2>
          <div className="space-y-4 text-sm">
            <h3 className="font-bold">1. Payment Terms:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Payment due within 30 days of delivery and acceptance</li>
              <li>Payment to be made to Bank of Maldives account</li>
              <li>Late payment subject to 1.5% monthly service charge</li>
            </ul>
            <h3 className="font-bold mt-4">2. Validity:</h3>
            <p>This quotation is valid for 90 days from the date of bid opening.</p>
            <h3 className="font-bold mt-4">3. Taxes & Duties:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Prices quoted are exclusive of GST</li>
              <li>GST will be charged at prevailing rate (currently 8%)</li>
              <li>Import duties, if any, to be borne by client</li>
            </ul>
            <h3 className="font-bold mt-4">4. Cancellation:</h3>
            <p>Orders once placed cannot be cancelled without written agreement. Cancellation charges may apply.</p>
            <h3 className="font-bold mt-4">5. Force Majeure:</h3>
            <p>Neither party shall be liable for delays due to circumstances beyond reasonable control.</p>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 13 of 23</p>
        </div>

        {/* Pages 14-22 - User Defined Specification Sections (Placeholder) */}
        
        {/* Page 14 - User Spec 1 */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Additional Specifications - Section 1</h2>
          <div className="space-y-4 text-sm">
            <p className="text-gray-600 italic">[Editable section - Add client-specific requirements here]</p>
            <div className="border border-gray-300 p-4 min-h-[300px]">
              <p className="text-gray-400 text-center mt-20">Click Edit to add custom specifications</p>
            </div>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 14 of 23</p>
        </div>

        {/* Page 15 - User Spec 2 */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Additional Specifications - Section 2</h2>
          <div className="space-y-4 text-sm">
            <p className="text-gray-600 italic">[Editable section - Add compliance details here]</p>
            <div className="border border-gray-300 p-4 min-h-[300px]">
              <p className="text-gray-400 text-center mt-20">Click Edit to add compliance information</p>
            </div>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 15 of 23</p>
        </div>

        {/* Page 16 - User Spec 3 */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Additional Specifications - Section 3</h2>
          <div className="space-y-4 text-sm">
            <p className="text-gray-600 italic">[Editable section - Add product brochures/catalogs]</p>
            <div className="border border-gray-300 p-4 min-h-[300px]">
              <p className="text-gray-400 text-center mt-20">Upload product documentation</p>
            </div>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 16 of 23</p>
        </div>

        {/* Page 17 - User Spec 4 */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Additional Specifications - Section 4</h2>
          <div className="space-y-4 text-sm">
            <p className="text-gray-600 italic">[Editable section - Add manufacturer authorization]</p>
            <div className="border border-gray-300 p-4 min-h-[300px]">
              <p className="text-gray-400 text-center mt-20">Add manufacturer details</p>
            </div>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 17 of 23</p>
        </div>

        {/* Page 18 - User Spec 5 */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Additional Specifications - Section 5</h2>
          <div className="space-y-4 text-sm">
            <p className="text-gray-600 italic">[Editable section - Add test reports/certificates]</p>
            <div className="border border-gray-300 p-4 min-h-[300px]">
              <p className="text-gray-400 text-center mt-20">Upload test reports</p>
            </div>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 18 of 23</p>
        </div>

        {/* Page 19 - User Spec 6 */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Additional Specifications - Section 6</h2>
          <div className="space-y-4 text-sm">
            <p className="text-gray-600 italic">[Editable section - Add drawings/diagrams]</p>
            <div className="border border-gray-300 p-4 min-h-[300px]">
              <p className="text-gray-400 text-center mt-20">Upload technical drawings</p>
            </div>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 19 of 23</p>
        </div>

        {/* Page 20 - User Spec 7 */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Additional Specifications - Section 7</h2>
          <div className="space-y-4 text-sm">
            <p className="text-gray-600 italic">[Editable section - Add maintenance schedule]</p>
            <div className="border border-gray-300 p-4 min-h-[300px]">
              <p className="text-gray-400 text-center mt-20">Add maintenance information</p>
            </div>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 20 of 23</p>
        </div>

        {/* Page 21 - User Spec 8 */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Additional Specifications - Section 8</h2>
          <div className="space-y-4 text-sm">
            <p className="text-gray-600 italic">[Editable section - Add spare parts list]</p>
            <div className="border border-gray-300 p-4 min-h-[300px]">
              <p className="text-gray-400 text-center mt-20">Add spare parts information</p>
            </div>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 21 of 23</p>
        </div>

        {/* Page 22 - User Spec 9 */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Additional Specifications - Section 9</h2>
          <div className="space-y-4 text-sm">
            <p className="text-gray-600 italic">[Editable section - Add references/testimonials]</p>
            <div className="border border-gray-300 p-4 min-h-[300px]">
              <p className="text-gray-400 text-center mt-20">Add client references</p>
            </div>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 22 of 23</p>
        </div>

        {/* Page 23 - Final Submission Page */}
        <div className="page-break-after">
          <h2 className="text-xl font-bold text-center mb-6 border-b-2 border-gray-800 pb-2">Final Submission & Authorization</h2>
          <div className="space-y-4 text-sm">
            <p>We hereby confirm that all information provided in this bid document is true and accurate to the best of our knowledge.</p>
            <p>We understand that any false information may result in disqualification and/or blacklisting from future tenders.</p>
            
            <div className="mt-8 border-t border-gray-300 pt-4">
              <p className="font-bold">Authorized Signatory:</p>
              <p className="mt-4">Signature: _________________________</p>
              <p className="mt-2">Name: {sections.page1_declaration.fields.find(f => f.name === 'signatoryName')?.value}</p>
              <p>Date: _________________________</p>
              <p className="mt-2">Company Stamp:</p>
              <div className="w-32 h-32 border border-gray-400 mt-2 flex items-center justify-center">
                <span className="text-xs text-gray-400">[Company Seal]</span>
              </div>
            </div>
          </div>
          <p className="text-sm font-semibold mt-8 text-right">Page 23 of 23</p>
          <p className="text-sm text-center mt-4 text-gray-500">- End of Bid Document -</p>
        </div>

        {/* Declaration */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Declaration</h2>
          <div className="whitespace-pre-line text-sm mb-6">
            {sections.declaration.fields.find(f => f.name === 'declaration')?.value}
          </div>
          <div className="mt-8">
            <p><strong>Name:</strong> {sections.declaration.fields.find(f => f.name === 'declarantName')?.value}</p>
            <p><strong>Designation:</strong> {sections.declaration.fields.find(f => f.name === 'declarantDesignation')?.value}</p>
            <p><strong>Date:</strong> {sections.declaration.fields.find(f => f.name === 'declarationDate')?.value}</p>
            <p className="mt-8">_______________________</p>
            <p className="text-sm">Signature</p>
          </div>
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
            <p className="text-xs text-gray-500">Click to expand/collapse</p>
          </div>
          
          {Object.entries(sections).map(([key, section]) => (
            <div key={key} className="border-b border-gray-100">
              <button
                onClick={() => toggleSection(key)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
              >
                <span className="font-medium text-sm">{section.title}</span>
                {expandedSections.includes(key) ? 
                  <ChevronDown size={16} className="text-gray-400" /> : 
                  <ChevronRight size={16} className="text-gray-400" />
                }
              </button>
              
              {expandedSections.includes(key) && (
                <div className="px-4 pb-4 space-y-2">
                  {section.fields.slice(0, 3).map(field => (
                    <div key={field.name} className="text-xs text-gray-500 flex justify-between">
                      <span>{field.label}</span>
                      <span className={field.value ? 'text-green-600' : 'text-red-400'}>
                        {field.value ? '✓' : '○'}
                      </span>
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
                    <div className="flex gap-1">
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
            <div className="p-8">
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
                {Object.entries(sections).map(([key, section]) => (
                  <div key={key} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div 
                      className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                      onClick={() => setActiveSection(activeSection === key ? null : key)}
                    >
                      <h2 className="font-semibold text-gray-800">{section.title}</h2>
                      {activeSection === key ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    
                    {activeSection === key && (
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
          body * {
            visibility: hidden;
          }
          .print\:p-0, .print\:p-0 * {
            visibility: visible;
          }
          .print\:p-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
