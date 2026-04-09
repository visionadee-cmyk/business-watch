import { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs, where, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FileText, Plus, Search, Edit2, Trash2, DollarSign, CheckCircle, X, Link as LinkIcon, Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [linkedBidId, setLinkedBidId] = useState(null);
  const [showQuotationPreview, setShowQuotationPreview] = useState(false);

  const [formData, setFormData] = useState({
    quoteNumber: '',
    clientName: '',
    description: '',
    items: [{ item: '', description: '', qty: 1, unitPrice: 0, total: 0 }],
    subTotal: 0,
    tax: 0,
    total: 0,
    validUntil: '',
    terms: '',
    status: 'Draft',
    linkedBidId: null
  });

  const statuses = ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch quotations
      const quotesSnapshot = await getDocs(collection(db, 'quotations'));
      const quotesData = quotesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setQuotations(quotesData);

      // Fetch won bids only
      const bidsQuery = query(collection(db, 'bids'), where('result', '==', 'Won'));
      const bidsSnapshot = await getDocs(bidsQuery);
      const bidsData = bidsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setBids(bidsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (items) => {
    const subTotal = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    const tax = subTotal * 0.06; // 6% tax
    const total = subTotal + tax;
    return { subTotal, tax, total };
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    newItems[index].total = newItems[index].qty * newItems[index].unitPrice;
    const totals = calculateTotals(newItems);
    setFormData({ ...formData, items: newItems, ...totals });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item: '', description: '', unit: 'nos', qty: 1, unitPrice: 0, total: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const totals = calculateTotals(newItems);
    setFormData({ ...formData, items: newItems, ...totals });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totals = calculateTotals(formData.items);
      const quoteData = {
        ...formData,
        ...totals,
        linkedBidId: linkedBidId,
        updatedAt: serverTimestamp()
      };

      if (editingQuote) {
        await updateDoc(doc(db, 'quotations', editingQuote.id), quoteData);
      } else {
        quoteData.quoteNumber = `QT-${Date.now()}`;
        quoteData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'quotations'), quoteData);
      }

      setShowModal(false);
      setEditingQuote(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving quotation:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quotation?')) return;
    try {
      await deleteDoc(doc(db, 'quotations', id));
      fetchData();
    } catch (error) {
      console.error('Error deleting quotation:', error);
    }
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote);
    setLinkedBidId(quote.linkedBidId);
    setFormData({
      quoteNumber: quote.quoteNumber || '',
      clientName: quote.clientName || '',
      description: quote.description || '',
      items: quote.items || [{ item: '', description: '', qty: 1, unitPrice: 0, total: 0 }],
      subTotal: quote.subTotal || 0,
      tax: quote.tax || 0,
      total: quote.total || 0,
      validUntil: quote.validUntil || '',
      terms: quote.terms || '',
      status: quote.status || 'Draft',
      linkedBidId: quote.linkedBidId || null
    });
    setShowModal(true);
  };

  const linkToBid = (bidId) => {
    setLinkedBidId(bidId);
    const bid = bids.find(b => b.id === bidId);
    if (bid) {
      setFormData({
        ...formData,
        clientName: bid.clientName || '',
        description: bid.tenderTitle || ''
      });
    }
  };

  const resetForm = () => {
    setFormData({
      quoteNumber: '',
      clientName: '',
      description: '',
      items: [{ item: '', description: '', qty: 1, unitPrice: 0, total: 0 }],
      subTotal: 0,
      tax: 0,
      total: 0,
      validUntil: '',
      terms: '',
      status: 'Draft',
      linkedBidId: null
    });
    setLinkedBidId(null);
  };

  const filteredQuotations = quotations.filter(quote =>
    quote.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-800';
      case 'Sent': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img 
            src="/illustrations/Receipt-amico.svg" 
            alt="Quotations" 
            className="w-16 h-16 object-contain"
            onError={(e) => { e.target.style.display='none'; }}
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
            <p className="text-gray-500 mt-1">Create and manage quotations for won bids</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Quotation
        </button>
      </div>

      {/* Won Bids Section */}
      {bids.length > 0 && (
        <div className="card bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Won Bids - Ready for Quotation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {bids.map(bid => (
              <div 
                key={bid.id} 
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  linkedBidId === bid.id 
                    ? 'bg-green-100 border-green-500' 
                    : 'bg-white border-green-200 hover:border-green-400'
                }`}
                onClick={() => linkToBid(bid.id)}
              >
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{bid.tenderTitle}</p>
                    <p className="text-xs text-gray-500">{bid.clientName}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-green-700 mt-1">
                  MVR {bid.bidAmount?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Quotes</p>
              <p className="text-2xl font-bold text-blue-700">{quotations.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-700">
                {quotations.filter(q => q.status === 'Accepted').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-yellow-700">
                MVR {quotations.reduce((sum, q) => sum + (q.total || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Linked to Bids</p>
              <p className="text-2xl font-bold text-purple-700">
                {quotations.filter(q => q.linkedBidId).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search quotations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Quotations Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quote #</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredQuotations.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{quote.quoteNumber}</td>
                  <td className="px-4 py-3">{quote.clientName}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{quote.description}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    MVR {quote.total?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {quote.linkedBidId && (
                        <LinkIcon className="w-4 h-4 text-green-600" title="Linked to bid" />
                      )}
                      <button
                        onClick={() => handleEdit(quote)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(quote.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredQuotations.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No quotations found. Create one from a won bid!</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingQuote ? 'Edit Quotation' : 'Create Quotation'}
                {linkedBidId && (
                  <span className="ml-2 text-sm font-normal text-green-600">
                    (Linked to Bid)
                  </span>
                )}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Client Name</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input"
                  placeholder="Quote description"
                />
              </div>

              {/* Items */}
              <div>
                <label className="block text-sm font-medium mb-2">Items</label>
                {/* Table Headers */}
                <div className="grid grid-cols-12 gap-2 mb-1 px-1">
                  <div className="col-span-3 text-xs font-semibold text-gray-600">Name</div>
                  <div className="col-span-4 text-xs font-semibold text-gray-600">Specification</div>
                  <div className="col-span-1 text-xs font-semibold text-gray-600">Unit</div>
                  <div className="col-span-2 text-xs font-semibold text-gray-600 text-center">Qty</div>
                  <div className="col-span-1 text-xs font-semibold text-gray-600 text-right">Price</div>
                  <div className="col-span-1"></div>
                </div>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Item name"
                          value={item.item}
                          onChange={(e) => updateItem(index, 'item', e.target.value)}
                          className="input text-sm"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Specification/description"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="input text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          placeholder="Unit"
                          value={item.unit || 'nos'}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          className="input text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.qty}
                          onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                          className="input text-sm text-center"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          placeholder="Price"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="input text-sm text-right"
                        />
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">MVR {formData.subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (6%):</span>
                  <span className="font-medium">MVR {formData.tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-700">MVR {formData.total.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({...formData, terms: e.target.value})}
                  className="input min-h-[80px]"
                  rows={3}
                  placeholder="Payment terms, delivery details, etc."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingQuote ? 'Update Quotation' : 'Create Quotation'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowQuotationPreview(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-secondary px-6"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quotation Preview Modal */}
      {showQuotationPreview && (
        <QuotationPreview 
          quotation={formData}
          editingQuote={editingQuote}
          onClose={() => setShowQuotationPreview(false)}
        />
      )}
    </div>
  );
};

// Quotation Preview Component
const QuotationPreview = ({ quotation, editingQuote, onClose }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const quotationRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!quotationRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(quotationRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      let imgY = 10;
      const scaledHeight = imgHeight * ratio;
      
      if (scaledHeight > pdfHeight - 20) {
        let heightLeft = scaledHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= (pdfHeight - 20);
        while (heightLeft > 0) {
          position = heightLeft - scaledHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
          heightLeft -= (pdfHeight - 20);
        }
      } else {
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      }
      
      const date = new Date().toISOString().split('T')[0];
      pdf.save(`Quotation_${quotation.quoteNumber || 'Draft'}_${date}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try using the Print button instead.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold">Quotation Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quotation Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
          <div ref={quotationRef} className="bg-white p-8 shadow-lg max-w-3xl mx-auto print-container">
            {/* Company Letterhead */}
            <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">RETTEY GENERAL TRADING</h1>
              <p className="text-sm text-gray-600">M. Thoddoo, Kaafu Atoll, Maldives</p>
              <p className="text-sm text-gray-600">Phone: +960 123-4567 | Email: info@rettey.com</p>
            </div>

            {/* Quotation Header */}
            <div className="flex justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">QUOTATION</h2>
                <p className="text-sm text-gray-600">Quote #: {quotation.quoteNumber || 'Draft'}</p>
                <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                {quotation.validUntil && (
                  <p className="text-sm text-gray-600">Valid Until: {quotation.validUntil}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold">To:</p>
                <p className="text-gray-800">{quotation.clientName || 'Client'}</p>
              </div>
            </div>

            {/* Description */}
            {quotation.description && (
              <div className="mb-4">
                <p className="text-gray-700 font-medium">{quotation.description}</p>
              </div>
            )}

            {/* Items Table */}
            <table className="w-full mb-6 border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="text-left py-2 px-2 text-sm font-semibold">No.</th>
                  <th className="text-left py-2 px-2 text-sm font-semibold">Item</th>
                  <th className="text-left py-2 px-2 text-sm font-semibold">Specification</th>
                  <th className="text-center py-2 px-2 text-sm font-semibold">Unit</th>
                  <th className="text-center py-2 px-2 text-sm font-semibold">Qty</th>
                  <th className="text-right py-2 px-2 text-sm font-semibold">Unit Price</th>
                  <th className="text-right py-2 px-2 text-sm font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2 px-2 text-sm">{index + 1}</td>
                    <td className="py-2 px-2 text-sm">{item.item}</td>
                    <td className="py-2 px-2 text-sm">{item.description}</td>
                    <td className="py-2 px-2 text-sm text-center">{item.unit || 'nos'}</td>
                    <td className="py-2 px-2 text-sm text-center">{item.qty}</td>
                    <td className="py-2 px-2 text-sm text-right">MVR {item.unitPrice?.toLocaleString()}</td>
                    <td className="py-2 px-2 text-sm text-right font-medium">MVR {(item.qty * item.unitPrice)?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>MVR {quotation.subTotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (6%):</span>
                    <span>MVR {quotation.tax?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                    <span>Total:</span>
                    <span className="text-green-700">MVR {quotation.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            {quotation.terms && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <h3 className="font-semibold mb-2">Terms & Conditions:</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{quotation.terms}</p>
              </div>
            )}

            {/* Signature Area */}
            <div className="mt-12 pt-8">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">Prepared by:</p>
                  <div className="mt-8 border-t border-gray-400 w-48"></div>
                  <p className="text-sm font-medium mt-1">Authorized Signature</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Accepted by:</p>
                  <div className="mt-8 border-t border-gray-400 w-48"></div>
                  <p className="text-sm font-medium mt-1">Client Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .print-container {
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Quotations;
