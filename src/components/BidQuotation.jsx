import { useState, useRef } from 'react';
import { Printer, Download, X, FileText, Building2, Phone, Mail, MapPin, Hash, Calendar, User, FileSpreadsheet } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export const BidQuotationPage = ({ bid, showTax = true, gstRate = 8, selectedSignatory = 0 }) => {
  const signatories = [
    {
      name: 'Abobakuru Qasim',
      position: 'Managing Director',
      signature: '/Abobakuru e signature.jpeg'
    },
    {
      name: 'Abdul Rasheed Ali',
      position: 'Director',
      signature: '/Abdulla rasheed e sigantuure.jpeg'
    },
    {
      name: 'Ziyad Rashadh',
      position: 'Director',
      signature: '/Ziyad E signature.jpeg'
    }
  ];

  const generateQuotationNo = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `BW/${year}/${month}/001`;
  };

  const numberToWords = (num) => {
    if (!num || num === 0) return 'Zero only';

    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
      'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
      'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const convert = (n) => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
      if (n < 1000000) return convert(Math.floor(n / 1000)) + ' thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
      if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' million' + (n % 1000000 !== 0 ? ' ' + convert(n % 1000000) : '');
      return convert(Math.floor(n / 1000000000)) + ' billion' + (n % 1000000000 !== 0 ? ' ' + convert(n % 1000000000) : '');
    };

    const wholePart = Math.round(num);
    let result = convert(wholePart);
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result + ' only';
  };

  const items = bid?.items || [];

  const calculateTotals = () => {
    let subTotal = 0;

    items.forEach((item) => {
      const qty = parseFloat(item.quantity) || 0;
      const bidPrice = parseFloat(item.bidPrice) || 0;
      subTotal += qty * bidPrice;
    });

    const taxAmount = showTax ? (subTotal * gstRate / 100) : 0;
    const total = Math.round(subTotal + taxAmount);

    return { subTotal, taxAmount, total };
  };

  const { subTotal, taxAmount, total } = calculateTotals();

  const formatAmount = (num) => {
    if (!num && num !== 0) return '';
    const rounded = Math.round(num * 100) / 100;
    const hasDecimals = (rounded % 1) !== 0;
    return rounded.toLocaleString(undefined, {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="quotation-page bg-white p-4 print:p-2">
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-2 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-gray-900">Business Watch</span>
            <span className="text-sm text-gray-600">Private Limited</span>
          </div>
          <div className="text-xs text-gray-600 space-y-0.5">
            <p>Reg No: C0006/2025</p>
            <p>TIN: 1169863/GST/T/501</p>
            <p>Address: Gulfamge, Lh.Hinnavaru</p>
            <p className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> (960) 7786629, (960) 9829050
            </p>
            <p className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> businesswatchmv@gmail.com
            </p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">
            QUOTATION
          </h1>
          <div className="mt-2 text-xs text-gray-600">
            <p>Vendor No: {bid?.vendorNumber || '514110'}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-start mb-3 text-sm">
        <div className="space-y-1">
          <p><span className="font-semibold">Quotation No.:</span> {bid?.quotationNo || generateQuotationNo()}</p>
          <p><span className="font-semibold">Date:</span> {bid?.quotationDate || new Date().toLocaleDateString('en-GB')}</p>
          <p><span className="font-semibold">Client:</span> {bid?.authority || bid?.title || 'N/A'}</p>
          {bid?.tenderNo && <p><span className="font-semibold">Iulaan No:</span> {bid.tenderNo}</p>}
        </div>
        <div className="text-center">
          <span className="font-bold text-lg">ALL ITEMS</span>
        </div>
      </div>

      <table className="w-full border-collapse border border-gray-800 mb-3 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-800 px-2 py-1.5 text-center w-8">#</th>
            <th className="border border-gray-800 px-2 py-1.5 text-center">Item Description</th>
            <th className="border border-gray-800 px-2 py-1.5 text-center w-12">Qty</th>
            <th className="border border-gray-800 px-2 py-1.5 text-center w-20">Rate (MVR)</th>
            <th className="border border-gray-800 px-2 py-1.5 text-center w-24">Amount (MVR)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const qty = parseFloat(item.quantity) || 0;
            const bidPrice = parseFloat(item.bidPrice) || 0;
            const itemTotal = qty * bidPrice;

            return (
              <tr key={item.id || index} style={{ verticalAlign: 'middle' }}>
                <td className="border border-gray-800 px-2 py-1 text-center" style={{ verticalAlign: 'middle' }}>{index + 1}</td>
                <td className="border border-gray-800 px-2 py-1 text-left" style={{ verticalAlign: 'middle' }}>{item.name || 'ITEM-' + (index + 1)}</td>
                <td className="border border-gray-800 px-2 py-1 text-center" style={{ verticalAlign: 'middle' }}>{qty}</td>
                <td className="border border-gray-800 px-2 py-1 text-center" style={{ verticalAlign: 'middle' }}>{formatAmount(bidPrice)}</td>
                <td className="border border-gray-800 px-2 py-1 text-center" style={{ verticalAlign: 'middle' }}>{formatAmount(itemTotal)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ verticalAlign: 'middle' }}>
            <td colSpan="4" className="border border-gray-800 px-2 py-1 text-center font-semibold" style={{ verticalAlign: 'middle' }}>Sub Total</td>
            <td className="border border-gray-800 px-2 py-1 text-center" style={{ verticalAlign: 'middle' }}>{formatAmount(subTotal)}</td>
          </tr>
          {showTax && (
            <tr style={{ verticalAlign: 'middle' }}>
              <td colSpan="4" className="border border-gray-800 px-2 py-1 text-center font-semibold" style={{ verticalAlign: 'middle' }}>GST ({gstRate}%)</td>
              <td className="border border-gray-800 px-2 py-1 text-center" style={{ verticalAlign: 'middle' }}>{formatAmount(taxAmount)}</td>
            </tr>
          )}
          <tr className="bg-gray-50" style={{ verticalAlign: 'middle' }}>
            <td colSpan="4" className="border border-gray-800 px-2 py-1.5 text-center" style={{ verticalAlign: 'middle' }}>
              <span className="font-semibold">Total in Words:</span> {numberToWords(total)}
            </td>
            <td className="border border-gray-800 px-2 py-1.5 text-center font-bold text-base" style={{ verticalAlign: 'middle' }}>{formatAmount(total)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="text-xs text-gray-700 mb-2 border-t border-gray-300 pt-2">
        <p className="font-semibold mb-1">Bank Account Information:</p>
        <div className="space-y-0.5 mb-1">
          <p className="font-medium text-gray-800">Bank of Maldives (BML)</p>
          <p>Account Name: Business Watch Pvt Ltd</p>
          <p>MVR: 7770000188096 | USD: 7770000188098</p>
        </div>
        <div className="space-y-0.5">
          <p className="font-medium text-gray-800">Maldives Islamic Bank (MIB)</p>
          <p>Account Name: Business Watch Pvt Ltd</p>
          <p>MVR: 90101480036671000 | USD: 90101480036672000</p>
        </div>
      </div>

      <div className="text-xs text-gray-700 mb-2">
        <p>All rates in MVR. Delivery: {bid?.deliveryDays || 35} Days. Validity: {bid?.quotationValidity || 60} days.</p>
      </div>

      <div className="flex justify-between items-end mt-2">
        <div className="flex-1 flex justify-center">
          <img
            src="/Company Stamp.jpeg"
            alt="Company Stamp"
            className="w-20 h-20 object-contain opacity-80"
          />
        </div>

        <div className="text-center">
          <div className="w-48 mb-1">
            <img
              src={signatories[selectedSignatory]?.signature}
              alt="E-signature"
              className="w-full h-20 object-contain"
            />
          </div>
          <p className="font-semibold text-xs">{signatories[selectedSignatory]?.name}</p>
          <p className="text-xs text-gray-600">{signatories[selectedSignatory]?.position}</p>
        </div>
      </div>
    </div>
  );
};

const BidQuotation = ({ bid, onClose }) => {
  const [printMode, setPrintMode] = useState('all'); // 'all' or 'individual'
  const [showTax, setShowTax] = useState(true);
  const [gstRate, setGstRate] = useState(8);
  const [selectedSignatory, setSelectedSignatory] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const quotationRef = useRef(null);

  // Signatory options with e-signatures
  const signatories = [
    { 
      name: 'Abobakuru Qasim', 
      position: 'Managing Director',
      signature: '/Abobakuru e signature.jpeg'
    },
    { 
      name: 'Abdul Rasheed Ali', 
      position: 'Director',
      signature: '/Abdulla rasheed e sigantuure.jpeg'
    },
    { 
      name: 'Ziyad Rashadh', 
      position: 'Director',
      signature: '/Ziyad E signature.jpeg'
    }
  ];

  // Generate quotation number
  const generateQuotationNo = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `BW/${year}/${month}/001`;
  };

  // Format number to words (simple format: hundreds, thousands)
  // Note: We intentionally ignore decimals (no laari/point in words).
  const numberToWords = (num) => {
    if (!num || num === 0) return 'Zero';

    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
                  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
                  'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const convert = (n) => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
      if (n < 1000000) return convert(Math.floor(n / 1000)) + ' thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
      if (n < 1000000000) return convert(Math.floor(n / 1000000)) + ' million' + (n % 1000000 !== 0 ? ' ' + convert(n % 1000000) : '');
      return convert(Math.floor(n / 1000000000)) + ' billion' + (n % 1000000000 !== 0 ? ' ' + convert(n % 1000000000) : '');
    };
    const wholePart = Math.round(num);
    
    let result = convert(wholePart);
    result = result.charAt(0).toUpperCase() + result.slice(1);
    
    return result + ' only';
  };

  // Calculate totals (rounded to whole numbers)
  const calculateTotals = () => {
    const items = bid?.items || [];
    let subTotal = 0;
    
    items.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const bidPrice = parseFloat(item.bidPrice) || 0;
      subTotal += qty * bidPrice;
    });
    
    const taxAmount = showTax ? (subTotal * gstRate / 100) : 0;
    const total = Math.round(subTotal + taxAmount);
    
    return { subTotal, taxAmount, total };
  };

  const { subTotal, taxAmount, total } = calculateTotals();
  const items = bid?.items || [];

  // Format number: show decimals only if they exist (e.g., 8,500 not 8,500.00)
  const formatAmount = (num) => {
    if (!num && num !== 0) return '';
    const rounded = Math.round(num * 100) / 100;
    const hasDecimals = (rounded % 1) !== 0;
    return rounded.toLocaleString(undefined, {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2
    });
  };

  const handlePrint = () => {
    document.body.classList.add('printing-quotation');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-quotation');
      }, 100);
    }, 100);
  };

  const handleDownloadPDF = async () => {
    if (!quotationRef.current) return;

    setIsGeneratingPDF(true);
    try {
      const element = quotationRef.current;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Quotation_${bid?.title?.replace(/\s+/g, '_') || 'Bid'}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: 'img, table, tr, td, th'
        }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try using the Print button instead.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadExcel = () => {
    if (!bid?.items || bid.items.length === 0) {
      alert('No items to export');
      return;
    }

    const { subTotal, taxAmount, total } = calculateTotals();

    // Create CSV content
    const headers = ['#', 'Item Description', 'Qty', 'Rate (MVR)', 'Amount (MVR)'];
    const rows = bid.items.map((item, index) => {
      const qty = parseFloat(item.quantity) || 0;
      const bidPrice = parseFloat(item.bidPrice) || 0;
      const itemTotal = qty * bidPrice;
      return [
        index + 1,
        `"${(item.name || `ITEM-${index + 1}`).replace(/"/g, '""')}"`,
        qty,
        bidPrice.toFixed(2),
        itemTotal.toFixed(2)
      ];
    });

    // Add totals
    rows.push(['', '', '', 'Sub Total:', subTotal.toFixed(2)]);
    if (showTax) {
      rows.push(['', '', '', `GST (${gstRate}%):`, taxAmount.toFixed(2)]);
    }
    rows.push(['', '', '', 'Total:', total.toFixed(2)]);

    // Add quotation details at top
    const quotationNo = bid?.quotationNo || generateQuotationNo();
    const quotationDate = bid?.quotationDate || new Date().toLocaleDateString('en-GB');
    const client = bid?.authority || bid?.title || 'N/A';
    const vendorNo = bid?.vendorNumber || '514110';

    const csvContent = [
      ['Business Watch Private Limited'],
      ['Quotation'],
      [''],
      ['Quotation No:', quotationNo],
      ['Date:', quotationDate],
      ['Client:', client],
      ['Vendor No:', vendorNo],
      [''],
      headers,
      ...rows,
      [''],
      ['Bank Account Information:'],
      ['Bank of Maldives (BML) - MVR: 7770000188096 | USD: 7770000188098'],
      ['Maldives Islamic Bank (MIB) - MVR: 90101480036671000 | USD: 90101480036672000'],
      [''],
      [`Delivery: ${bid?.deliveryDays || 35} Days`],
      [`Validity: ${bid?.quotationValidity || 60} days`]
    ].map(row => row.join(',')).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Quotation_${bid?.title?.replace(/\s+/g, '_') || 'Bid'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render individual item quotations
  const renderIndividualItems = () => {
    if (!items || items.length === 0) {
      return (
        <div className="quotation-page bg-white p-8 text-center">
          <p className="text-gray-500">No items to display</p>
        </div>
      );
    }

    const pages = [];
    
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const qty = parseFloat(item.quantity) || 0;
      const bidPrice = parseFloat(item.bidPrice) || 0;
      const itemTotal = qty * bidPrice;
      const itemTax = showTax ? (itemTotal * gstRate / 100) : 0;
      const itemGrandTotal = itemTotal + itemTax;

      pages.push(
        <div key={`page-${idx}`} className="quotation-page mb-8 bg-white p-8 print:p-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-gray-900">Business Watch</span>
                <span className="text-sm text-gray-600">Private Limited</span>
              </div>
              <div className="text-xs text-gray-600 space-y-0.5">
                <p>Reg No: C0006/2025</p>
                <p>TIN: 1169863/GST/T/501</p>
                <p>Address: Gulfamge, Lh.Hinnavaru</p>
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> (960) 7786629, (960) 9829050
                </p>
                <p className="flex items-center gap-1">
                  <Mail className="w-3 h-3" /> businesswatchmv@gmail.com
                </p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-900 border-2 border-gray-800 px-4 py-1 inline-block">
                QUOTATION
              </h1>
              <div className="mt-2 text-xs text-gray-600">
                <p>Vendor No: {bid?.vendorNumber || '514110'}</p>
              </div>
            </div>
          </div>

          {/* Quotation Details */}
          <div className="flex justify-between items-start mb-3 text-sm">
            <div className="space-y-1">
              <p><span className="font-semibold">Quotation No.:</span> {generateQuotationNo()}-ITEM{idx + 1}</p>
              <p><span className="font-semibold">Date:</span> {new Date().toLocaleDateString('en-GB')}</p>
              <p><span className="font-semibold">Client:</span> {bid?.authority || bid?.title || 'N/A'}</p>
              {bid?.tenderNo && <p><span className="font-semibold">Iulaan No:</span> {bid.tenderNo}</p>}
            </div>
            <div className="text-right">
              <div className="border-2 border-gray-800 px-3 py-1 text-center">
                <span className="font-bold">ITEM {idx + 1} of {items.length}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{item.name || 'N/A'}</div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse border border-gray-800 mb-4 text-sm quotation-table">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-800 px-2 py-1 w-12 text-center align-middle">#</th>
                <th className="border border-gray-800 px-2 py-1 text-center align-middle">Item</th>
                <th className="border border-gray-800 px-2 py-1 w-16 text-center align-middle">Qty</th>
                <th className="border border-gray-800 px-2 py-1 w-24 text-center align-middle">Rate</th>
                <th className="border border-gray-800 px-2 py-1 w-28 text-center align-middle">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-800 px-2 py-1 text-xs" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>1</div>
                </td>
                <td className="border border-gray-800 px-2 py-1 text-xs" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{item.name || `ITEM-${idx + 1}`}</div>
                </td>
                <td className="border border-gray-800 px-2 py-1 text-xs" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{qty}</div>
                </td>
                <td className="border border-gray-800 px-2 py-1 text-xs" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{bidPrice.toFixed(2)}</div>
                </td>
                <td className="border border-gray-800 px-2 py-1 text-xs" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{itemTotal.toLocaleString()}.00</div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="border border-gray-800 px-2 py-2 font-semibold" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Sub total</div>
                </td>
                <td className="border border-gray-800 px-2 py-2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{itemTotal.toLocaleString()}.00</div>
                </td>
              </tr>
              {showTax && (
                <tr>
                  <td colSpan="4" className="border border-gray-800 px-2 py-2 font-semibold" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>GST {gstRate}%</div>
                  </td>
                  <td className="border border-gray-800 px-2 py-2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{itemTax.toLocaleString()}.00</div>
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan="4" className="border border-gray-800 px-2 py-2" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <span className="font-semibold">Total:</span> {numberToWords(itemGrandTotal)}
                </td>
                <td className="border border-gray-800 px-2 py-2 font-bold" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{itemGrandTotal.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}</div>
                </td>
              </tr>
            </tfoot>
          </table>

        {/* Bank Information */}
        <div className="text-xs text-gray-700 space-y-1 mb-2 border-t border-gray-300 pt-2">
          <p className="font-semibold">Bank Account Information:</p>
          <div className="space-y-1">
            <p className="font-medium text-gray-800">Bank of Maldives (BML)</p>
            <p>Account Name: Business Watch Pvt Ltd</p>
            <p>MVR: 7770000188096 | USD: 7770000188098</p>
          </div>
          <div className="space-y-1 mt-1">
            <p className="font-medium text-gray-800">Maldives Islamic Bank (MIB)</p>
            <p>Account Name: Business Watch Pvt Ltd</p>
            <p>MVR: 90101480036671000 | USD: 90101480036672000</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-700 space-y-0.5 mb-4">
          <p>All rates and amounts are in MVR.</p>
          <p>Delivery period: {bid?.deliveryDays || 35} Days</p>
          <p>Quotation / bid Validity: {bid?.quotationValidity || 60} days from bid opening.</p>
        </div>

          {/* Stamp and Signature - Side by Side to save space */}
          <div className="flex justify-between items-end">
            {/* Company Stamp */}
            <div className="flex-1 flex justify-center">
              <img 
                src="/Company Stamp.jpeg" 
                alt="Company Stamp" 
                className="w-24 h-24 object-contain opacity-80"
              />
            </div>

            {/* Signature with E-signature */}
            <div className="text-center">
              <div className="w-56 mb-2">
                <img 
                  src={signatories[selectedSignatory].signature} 
                  alt="E-signature" 
                  className="w-full h-24 object-contain"
                />
              </div>
              <p className="font-semibold text-sm">{signatories[selectedSignatory].name}</p>
              <p className="text-xs text-gray-600">{signatories[selectedSignatory].position}</p>
              <p className="text-xs text-gray-500">Business Watch Pvt Ltd, Gulfamge, Lh.Hinnavaru</p>
            </div>
          </div>

          {/* Page break for print */}
          <div className="page-break-after"></div>
        </div>
      );
    }
    
    return pages;
  };

  // Render all items in one quotation
  const renderAllItems = () => {
    return (
      <div className="quotation-page bg-white p-4 print:p-2">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold text-gray-900">Business Watch</span>
              <span className="text-sm text-gray-600">Private Limited</span>
            </div>
            <div className="text-xs text-gray-600 space-y-0.5">
              <p>Reg No: C0006/2025</p>
              <p>TIN: 1169863/GST/T/501</p>
              <p>Address: Gulfamge, Lh.Hinnavaru</p>
              <p className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> (960) 7786629, (960) 9829050
              </p>
              <p className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> businesswatchmv@gmail.com
              </p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">QUOTATION</h1>
            <div className="text-xs text-gray-600">
              <p>Vendor No: {bid?.vendorNumber || '514110'}</p>
            </div>
          </div>
        </div>

        {/* Quotation Details */}
        <div className="flex justify-between items-start mb-3 text-sm">
          <div className="space-y-1">
            <p><span className="font-semibold">Quotation No.:</span> {generateQuotationNo()}</p>
            <p><span className="font-semibold">Date:</span> {new Date().toLocaleDateString('en-GB')}</p>
            <p><span className="font-semibold">Client:</span> {bid?.authority || bid?.title || 'N/A'}</p>
            {bid?.tenderNo && <p><span className="font-semibold">Iulaan No:</span> {bid.tenderNo}</p>}
          </div>
          <div className="text-center">
            <span className="font-bold text-lg">ALL ITEMS</span>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse border border-gray-800 mb-3 text-xs quotation-table">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 px-2 py-1.5" style={{ textAlign: 'center', verticalAlign: 'middle' }}>#</th>
              <th className="border border-gray-800 px-2 py-1.5" style={{ textAlign: 'center', verticalAlign: 'middle' }}>Item Description</th>
              <th className="border border-gray-800 px-2 py-1.5" style={{ textAlign: 'center', verticalAlign: 'middle' }}>Qty</th>
              <th className="border border-gray-800 px-2 py-1.5" style={{ textAlign: 'center', verticalAlign: 'middle' }}>Rate (MVR)</th>
              <th className="border border-gray-800 px-2 py-1.5" style={{ textAlign: 'center', verticalAlign: 'middle' }}>Amount (MVR)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const qty = parseFloat(item.quantity) || 0;
              const bidPrice = parseFloat(item.bidPrice) || 0;
              const itemTotal = qty * bidPrice;

              return (
                <tr key={item.id} style={{ verticalAlign: 'middle' }}>
                  <td className="border border-gray-800 px-2 py-1" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{index + 1}</div>
                  </td>
                  <td className="border border-gray-800 px-2" style={{ textAlign: 'left', verticalAlign: 'middle', paddingTop: '16px', paddingBottom: '16px' }}>
                    <span style={{ textAlign: 'left', display: 'block', lineHeight: '1.4' }}>{item.name || 'ITEM-' + (index + 1)}</span>
                  </td>
                  <td className="border border-gray-800 px-2 py-1" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{qty}</div>
                  </td>
                  <td className="border border-gray-800 px-2 py-1" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{formatAmount(bidPrice)}</div>
                  </td>
                  <td className="border border-gray-800 px-2 py-1" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{formatAmount(itemTotal)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ verticalAlign: 'middle' }}>
              <td colSpan="4" className="border border-gray-800 px-2 py-1 font-semibold" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Sub Total</div>
              </td>
              <td className="border border-gray-800 px-2 py-1" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{formatAmount(subTotal)}</div>
              </td>
            </tr>
            {showTax && (
              <tr style={{ verticalAlign: 'middle' }}>
                <td colSpan="4" className="border border-gray-800 px-2 py-1 font-semibold" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>GST ({gstRate}%)</div>
                </td>
                <td className="border border-gray-800 px-2 py-1" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{formatAmount(taxAmount)}</div>
                </td>
              </tr>
            )}
            <tr className="bg-gray-50" style={{ verticalAlign: 'middle' }}>
              <td colSpan="4" className="border border-gray-800 px-2 py-1.5" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                <span className="font-semibold">Total in Words:</span> {numberToWords(total)}
              </td>
              <td className="border border-gray-800 px-2 py-1.5 font-bold text-base" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{formatAmount(total)}</div>
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Bank Information */}
        <div className="text-xs text-gray-700 mb-2 border-t border-gray-300 pt-2">
          <p className="font-semibold mb-1">Bank Account Information:</p>
          <div className="space-y-0.5 mb-1">
            <p className="font-medium text-gray-800">Bank of Maldives (BML)</p>
            <p>Account Name: Business Watch Pvt Ltd</p>
            <p>MVR: 7770000188096 | USD: 7770000188098</p>
          </div>
          <div className="space-y-0.5">
            <p className="font-medium text-gray-800">Maldives Islamic Bank (MIB)</p>
            <p>Account Name: Business Watch Pvt Ltd</p>
            <p>MVR: 90101480036671000 | USD: 90101480036672000</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-700 mb-2">
          <p>All rates in MVR. Delivery: {bid?.deliveryDays || 35} Days. Validity: {bid?.quotationValidity || 60} days.</p>
        </div>

        {/* Stamp and Signature - Side by Side */}
        <div className="flex justify-between items-end mt-2">
          {/* Company Stamp */}
          <div className="flex-1 flex justify-center">
            <img 
              src="/Company Stamp.jpeg" 
              alt="Company Stamp" 
              className="w-20 h-20 object-contain opacity-80"
            />
          </div>

          {/* Signature with E-signature */}
          <div className="text-center">
            <div className="w-48 mb-1">
              <img 
                src={signatories[selectedSignatory].signature} 
                alt="E-signature" 
                className="w-full h-20 object-contain"
              />
            </div>
            <p className="font-semibold text-xs">{signatories[selectedSignatory].name}</p>
            <p className="text-xs text-gray-600">{signatories[selectedSignatory].position}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-auto">
      <div className="min-h-screen bg-gray-100 py-8">
        {/* Controls */}
        <div className="max-w-4xl mx-auto mb-4 flex flex-wrap gap-3 items-center justify-between print:hidden px-4">
          <div className="flex gap-3 items-center">
            <h2 className="text-xl font-bold text-gray-900">Bid Quotation</h2>
            <span className="text-sm text-gray-600">({items.length} items)</span>
          </div>
          
          <div className="flex gap-3 items-center">
            {/* Print Mode Toggle */}
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setPrintMode('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  printMode === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setPrintMode('individual')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  printMode === 'individual'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Individual Items
              </button>
            </div>

            {/* Signatory Selector */}
            <select
              value={selectedSignatory}
              onChange={(e) => setSelectedSignatory(parseInt(e.target.value))}
              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
            >
              {signatories.map((sig, idx) => (
                <option key={idx} value={idx}>{sig.name} - {sig.position}</option>
              ))}
            </select>

            {/* Tax Toggle */}
            <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showTax}
                onChange={(e) => setShowTax(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium">Include GST ({gstRate}%)</span>
            </label>

            {/* GST Rate Input */}
            {showTax && (
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1.5 text-sm border rounded"
                placeholder="GST %"
              />
            )}

            <button
              onClick={handlePrint}
              className="btn-primary flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="btn-secondary flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </button>

            <button
              onClick={handleDownloadExcel}
              className="btn-secondary flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Excel
            </button>

            <button
              onClick={onClose}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>

        {/* Quotation Content */}
        <div ref={quotationRef} className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
          <style>{`
            /* Hide everything except quotation when printing */
            body.printing-quotation > div:not(.fixed),
            body.printing-quotation nav,
            body.printing-quotation header,
            body.printing-quotation .sidebar,
            body.printing-quotation #root > div:first-child {
              display: none !important;
            }
            body.printing-quotation .fixed.inset-0 {
              position: static !important;
              overflow: visible !important;
            }
            body.printing-quotation {
              background: white !important;
            }
            @media print {
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .quotation-page {
                page-break-after: always;
                min-height: 0 !important;
                height: auto !important;
                box-shadow: none !important;
                margin: 0 !important;
                padding: 10mm !important;
              }
              .quotation-page:last-child {
                page-break-after: avoid;
              }
              /* Force table cell text centering for PDF */
              table.quotation-table th,
              table.quotation-table td {
                text-align: center !important;
                vertical-align: middle !important;
              }
              table.quotation-table td > div {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                height: 100% !important;
                text-align: center !important;
              }
              .print\\:hidden {
                display: none !important;
              }
            }
          `}</style>

          {printMode === 'all' ? renderAllItems() : renderIndividualItems()}
        </div>
      </div>
    </div>
  );
};

export default BidQuotation;
