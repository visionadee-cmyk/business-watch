import { useState } from 'react';
import { Printer, Download, X, FileText, Building2, Phone, Mail, MapPin, Hash, Calendar, User } from 'lucide-react';

const BidQuotation = ({ bid, onClose }) => {
  const [printMode, setPrintMode] = useState('all'); // 'all' or 'individual'
  const [showTax, setShowTax] = useState(true);
  const [gstRate, setGstRate] = useState(8);
  const [selectedSignatory, setSelectedSignatory] = useState(0);

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

  // Format number to words (simplified version)
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
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
    };
    
    const wholePart = Math.floor(num);
    const decimalPart = Math.round((num - wholePart) * 100);
    
    let result = convert(wholePart);
    result = result.charAt(0).toUpperCase() + result.slice(1);
    
    if (decimalPart > 0) {
      result += ' and ' + convert(decimalPart) + ' laari';
    }
    
    return result + ' only';
  };

  // Calculate totals
  const calculateTotals = () => {
    const items = bid?.items || [];
    let subTotal = 0;
    
    items.forEach(item => {
      const qty = parseFloat(item.quantity) || 0;
      const bidPrice = parseFloat(item.bidPrice) || 0;
      subTotal += qty * bidPrice;
    });
    
    const taxAmount = showTax ? (subTotal * gstRate / 100) : 0;
    const total = subTotal + taxAmount;
    
    return { subTotal, taxAmount, total };
  };

  const { subTotal, taxAmount, total } = calculateTotals();
  const items = bid?.items || [];

  const handlePrint = () => {
    window.print();
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
          {/* Header with Company Stamp */}
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
            <div className="flex items-start gap-4">
              <img 
                src="/Company Stamp.jpeg" 
                alt="Company Stamp" 
                className="w-24 h-24 object-contain"
              />
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
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="flex items-center gap-2">
                <span className="font-semibold">Quotation No.:</span> 
                {generateQuotationNo()}-ITEM{idx + 1}
              </p>
              <p className="flex items-center gap-2">
                <span className="font-semibold">Date:</span> 
                {new Date().toLocaleDateString('en-GB')}
              </p>
              <p className="flex items-center gap-2">
                <span className="font-semibold">Client:</span> 
                {bid?.authority || bid?.title || 'N/A'}
              </p>
              {bid?.tenderNo && (
                <p className="flex items-center gap-2">
                  <span className="font-semibold">iulaan no:</span> 
                  {bid.tenderNo}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="inline-block border-2 border-gray-800 px-3 py-1">
                <span className="font-bold text-lg">ITEM-{idx + 1} of {items.length}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{item.name || 'N/A'}</div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse border border-gray-800 mb-6 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-800 px-2 py-2 w-12">#</th>
                <th className="border border-gray-800 px-2 py-2">Item</th>
                <th className="border border-gray-800 px-2 py-2 w-16">Qty</th>
                <th className="border border-gray-800 px-2 py-2 w-24">Rate</th>
                <th className="border border-gray-800 px-2 py-2 w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-800 px-2 py-3 text-center">1</td>
                <td className="border border-gray-800 px-2 py-3">
                  <div className="font-medium">{item.name || `ITEM-${idx + 1}`}</div>
                  {item.specification && (
                    <div className="text-xs text-gray-600 mt-1">{item.specification}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">as per the requirements of tender document</div>
                </td>
                <td className="border border-gray-800 px-2 py-3 text-center">{qty}</td>
                <td className="border border-gray-800 px-2 py-3 text-right">{bidPrice.toFixed(2)}</td>
                <td className="border border-gray-800 px-2 py-3 text-right">{itemTotal.toLocaleString()}.00</td>
              </tr>
              {/* Empty rows for spacing */}
              {[...Array(8)].map((_, i) => (
                <tr key={`empty-${idx}-${i}`}>
                  <td className="border border-gray-800 px-2 py-2">&nbsp;</td>
                  <td className="border border-gray-800 px-2 py-2"></td>
                  <td className="border border-gray-800 px-2 py-2"></td>
                  <td className="border border-gray-800 px-2 py-2"></td>
                  <td className="border border-gray-800 px-2 py-2"></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="border border-gray-800 px-2 py-2 text-right font-semibold">Sub total</td>
                <td className="border border-gray-800 px-2 py-2 text-right">{itemTotal.toLocaleString()}.00</td>
              </tr>
              {showTax && (
                <tr>
                  <td colSpan="4" className="border border-gray-800 px-2 py-2 text-right font-semibold">GST {gstRate}%</td>
                  <td className="border border-gray-800 px-2 py-2 text-right">{itemTax.toLocaleString()}.00</td>
                </tr>
              )}
              <tr>
                <td colSpan="4" className="border border-gray-800 px-2 py-2 text-left">
                  <span className="font-semibold">Total:</span> {numberToWords(itemGrandTotal)}
                </td>
                <td className="border border-gray-800 px-2 py-2 text-right font-bold">{itemGrandTotal.toLocaleString()}.00</td>
              </tr>
            </tfoot>
          </table>

          {/* Footer */}
          <div className="text-xs text-gray-700 space-y-1 mb-8">
            <p>All rates and amounts are in MVR..</p>
            <p>Delivery period: {bid?.deliveryDays || 35} Days</p>
            <p>Quotation / bid Validity: {bid?.quotationValidity || 60} days from bid opening.</p>
          </div>

          {/* Signature with E-signature */}
          <div className="flex justify-end mt-12">
            <div className="text-center">
              <div className="w-48 mb-2">
                <img 
                  src={signatories[selectedSignatory].signature} 
                  alt="E-signature" 
                  className="w-full h-16 object-contain"
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
      <div className="quotation-page bg-white p-8 print:p-6">
        {/* Header with Company Stamp */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex items-start gap-4">
            <img 
              src="/Company Stamp.jpeg" 
              alt="Company Stamp" 
              className="w-24 h-24 object-contain"
            />
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
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Quotation No.:</span> 
              {generateQuotationNo()}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Date:</span> 
              {new Date().toLocaleDateString('en-GB')}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold">Client:</span> 
              {bid?.authority || bid?.title || 'N/A'}
            </p>
            {bid?.tenderNo && (
              <p className="flex items-center gap-2">
                <span className="font-semibold">iulaan no:</span> 
                {bid.tenderNo}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="inline-block border-2 border-gray-800 px-3 py-1">
              <span className="font-bold text-lg">ALL ITEMS</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse border border-gray-800 mb-6 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 px-2 py-2 w-12">#</th>
              <th className="border border-gray-800 px-2 py-2">Item</th>
              <th className="border border-gray-800 px-2 py-2 w-16">Qty</th>
              <th className="border border-gray-800 px-2 py-2 w-24">Rate</th>
              <th className="border border-gray-800 px-2 py-2 w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const qty = parseFloat(item.quantity) || 0;
              const bidPrice = parseFloat(item.bidPrice) || 0;
              const itemTotal = qty * bidPrice;

              return (
                <tr key={item.id}>
                  <td className="border border-gray-800 px-2 py-3 text-center">{index + 1}</td>
                  <td className="border border-gray-800 px-2 py-3">
                    <div className="font-medium">{item.name || 'ITEM-' + (index + 1)}</div>
                    {item.specification && (
                      <div className="text-xs text-gray-600 mt-1">{item.specification}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">as per the requirements of tender document</div>
                  </td>
                  <td className="border border-gray-800 px-2 py-3 text-center">{qty}</td>
                  <td className="border border-gray-800 px-2 py-3 text-right">{bidPrice.toFixed(2)}</td>
                  <td className="border border-gray-800 px-2 py-3 text-right">{itemTotal.toLocaleString()}.00</td>
                </tr>
              );
            })}
            {/* Add empty rows if less than 5 items for spacing */}
            {items.length < 5 && [...Array(5 - items.length)].map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-gray-800 px-2 py-3">&nbsp;</td>
                <td className="border border-gray-800 px-2 py-3"></td>
                <td className="border border-gray-800 px-2 py-3"></td>
                <td className="border border-gray-800 px-2 py-3"></td>
                <td className="border border-gray-800 px-2 py-3"></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" className="border border-gray-800 px-2 py-2 text-right font-semibold">Sub total</td>
              <td className="border border-gray-800 px-2 py-2 text-right">{subTotal.toLocaleString()}.00</td>
            </tr>
            {showTax && (
              <tr>
                <td colSpan="4" className="border border-gray-800 px-2 py-2 text-right font-semibold">GST {gstRate}%</td>
                <td className="border border-gray-800 px-2 py-2 text-right">{taxAmount.toLocaleString()}.00</td>
              </tr>
            )}
            <tr>
              <td colSpan="4" className="border border-gray-800 px-2 py-2 text-left">
                <span className="font-semibold">Total:</span> {numberToWords(total)}
              </td>
              <td className="border border-gray-800 px-2 py-2 text-right font-bold">{total.toLocaleString()}.00</td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div className="text-xs text-gray-700 space-y-1 mb-8">
          <p>All rates and amounts are in MVR..</p>
          <p>Delivery period: {bid?.deliveryDays || 35} Days</p>
          <p>Quotation / bid Validity: {bid?.quotationValidity || 60} days from bid opening.</p>
          <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="font-semibold">Bank Account Information:</p>
            <p>Bank: MIB (Maldives Islamic Bank)</p>
            <p>Account Name: Business Watch Pvt Ltd</p>
            <p>MVR Account: 90101480036671000</p>
            <p>USD Account: 90101480036672000</p>
          </div>
        </div>

        {/* Signature with E-signature */}
        <div className="flex justify-end mt-12">
          <div className="text-center">
            <div className="w-48 mb-2">
              <img 
                src={signatories[selectedSignatory].signature} 
                alt="E-signature" 
                className="w-full h-16 object-contain"
              />
            </div>
            <p className="font-semibold text-sm">{signatories[selectedSignatory].name}</p>
            <p className="text-xs text-gray-600">{signatories[selectedSignatory].position}</p>
            <p className="text-xs text-gray-500">Business Watch Pvt Ltd, Gulfamge, Lh.Hinnavaru</p>
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
              onClick={onClose}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>

        {/* Quotation Content */}
        <div className="max-w-4xl mx-auto bg-white shadow-lg print:shadow-none">
          <style>{`
            @media print {
              @page {
                size: A4;
                margin: 15mm;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                background: white !important;
              }
              .quotation-page {
                page-break-after: always;
                min-height: 100vh;
                background: white !important;
                box-shadow: none !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .quotation-page:last-child {
                page-break-after: avoid;
              }
              /* Hide all controls and background in print */
              .print\\:hidden {
                display: none !important;
              }
              /* Hide the outer container background */
              .bg-gray-100 {
                background: white !important;
              }
              .bg-black {
                display: none !important;
              }
              .bg-opacity-50 {
                background: transparent !important;
              }
              /* Remove max-width constraint in print */
              .max-w-4xl {
                max-width: none !important;
              }
              /* Hide shadow in print */
              .shadow-lg {
                box-shadow: none !important;
              }
            }
            .page-break-after {
              page-break-after: always;
            }
          `}</style>

          {printMode === 'all' ? renderAllItems() : renderIndividualItems()}
        </div>
      </div>
    </div>
  );
};

export default BidQuotation;
