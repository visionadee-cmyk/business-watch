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

// Default bid sections based on typical PSM bid format
const defaultBidSections = {
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
  const [activeSection, setActiveSection] = useState('cover');
  const [showPreview, setShowPreview] = useState(false);
  const [savedBids, setSavedBids] = useState([]);
  const [currentBidName, setCurrentBidName] = useState('');
  const [expandedSections, setExpandedSections] = useState(Object.keys(defaultBidSections));
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

  const renderField = (sectionKey, field) => {
    const baseClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            className={`${baseClass} min-h-[100px]`}
            value={field.value}
            onChange={(e) => updateField(sectionKey, field.name, e.target.value)}
            placeholder={field.label}
          />
        );
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.value}
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
            value={field.value}
            onChange={(e) => updateField(sectionKey, field.name, e.target.value)}
            placeholder={field.label}
          />
        );
      default:
        return (
          <input
            type={field.type}
            className={baseClass}
            value={field.value}
            onChange={(e) => updateField(sectionKey, field.name, e.target.value)}
            placeholder={field.label}
          />
        );
    }
  };

  const renderPreview = () => {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto print:p-0" ref={printRef}>
        {/* Cover Page */}
        <div className="page-break-after">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">{sections.cover.fields.find(f => f.name === 'companyName')?.value}</h1>
            <p className="text-sm text-gray-600">{sections.cover.fields.find(f => f.name === 'address')?.value}</p>
            <p className="text-sm text-gray-600">Phone: {sections.cover.fields.find(f => f.name === 'phone')?.value}</p>
            <p className="text-sm text-gray-600">Email: {sections.cover.fields.find(f => f.name === 'email')?.value}</p>
            <p className="text-sm text-gray-600">TIN: {sections.cover.fields.find(f => f.name === 'tin')?.value}</p>
          </div>
          
          <div className="border-2 border-black p-6 mb-8">
            <h2 className="text-2xl font-bold text-center mb-4">TENDER SUBMISSION</h2>
            <div className="text-center">
              <p className="text-lg font-semibold">Tender No: {sections.cover.fields.find(f => f.name === 'tenderNo')?.value}</p>
              <p className="text-lg">{sections.cover.fields.find(f => f.name === 'tenderTitle')?.value}</p>
            </div>
          </div>
          
          <div className="mt-12">
            <p className="text-sm">Submitted by: <strong>{sections.cover.fields.find(f => f.name === 'contactPerson')?.value}</strong></p>
            <p className="text-sm">Date: {sections.cover.fields.find(f => f.name === 'submissionDate')?.value}</p>
          </div>
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
        @media print {
          .page-break-after {
            page-break-after: always;
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
