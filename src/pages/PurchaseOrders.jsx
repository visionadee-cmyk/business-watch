import { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Eye, X, CheckCircle, 
  Clock, Truck, Package, Building2, ArrowRight, 
  FileText, DollarSign, Calendar, User, Phone, Mail,
  Send, HandshakeIcon, Download, Printer, ChevronDown, ChevronUp,
  RefreshCw, Filter, MoreHorizontal, AlertCircle, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc,
  orderBy, serverTimestamp, where, writeBatch
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [bids, setBids] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [showCreateFromBid, setShowCreateFromBid] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [expandedPO, setExpandedPO] = useState(null);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const poStatuses = ['Draft', 'Sent', 'Acknowledged', 'Partially Received', 'Fully Received', 'Completed', 'Cancelled'];
  const deliveryStatuses = ['Not Shipped', 'In Transit', 'At Port', 'Customs Clearance', 'Delivered'];
  const receivingStatuses = ['Pending', 'Partially Received', 'Fully Received', 'Inspected', 'Accepted'];
  const handoverStatuses = ['Not Ready', 'Ready for Handover', 'Handed Over', 'Accepted by Company'];

  const [formData, setFormData] = useState({
    poNumber: '',
    bidId: '',
    bidRef: '',
    supplierId: '',
    supplierName: '',
    items: [],
    totalAmount: 0,
    currency: 'MVR',
    orderDate: '',
    expectedDeliveryDate: '',
    actualDeliveryDate: '',
    shippingMethod: '',
    trackingNumber: '',
    shippingAddress: '',
    billingAddress: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    status: 'Draft',
    deliveryStatus: 'Not Shipped',
    receivingStatus: 'Pending',
    handoverStatus: 'Not Ready',
    notes: '',
    documents: [],
    // Approval workflow
    preparedBy: '',
    approvedBy: '',
    approvalDate: '',
    // Receiving details
    receivedBy: '',
    receivedDate: '',
    inspectionNotes: '',
    // Handover details
    handedOverBy: '',
    handedOverTo: '',
    handoverDate: '',
    companyRepresentative: '',
    companySignature: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch purchase orders
      const poSnapshot = await getDocs(collection(db, 'purchaseOrders'));
      const poData = poSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setPurchaseOrders(poData);

      // Fetch won bids for creating POs
      const bidsQuery = query(collection(db, 'bids'), where('result', '==', 'Won'));
      const bidsSnapshot = await getDocs(bidsQuery);
      const bidsData = bidsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setBids(bidsData);

      // Fetch suppliers
      const suppliersSnapshot = await getDocs(collection(db, 'suppliers'));
      const suppliersData = suppliersSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setSuppliers(suppliersData);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePONumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `PO-${year}${month}-${random}`;
  };

  const handleCreateFromBid = (bid) => {
    setSelectedBid(bid);
    setFormData({
      poNumber: generatePONumber(),
      bidId: bid.id,
      bidRef: bid.title || bid.tenderTitle || 'Unknown',
      supplierId: '',
      supplierName: '',
      items: bid.items?.map(item => ({
        ...item,
        orderedQty: item.quantity || 0,
        receivedQty: 0,
        unitPrice: item.costPrice || 0,
        totalPrice: (item.costPrice || 0) * (item.quantity || 0)
      })) || [],
      totalAmount: bid.costEstimate || 0,
      currency: 'MVR',
      orderDate: format(new Date(), 'yyyy-MM-dd'),
      expectedDeliveryDate: '',
      actualDeliveryDate: '',
      shippingMethod: 'Sea Freight',
      trackingNumber: '',
      shippingAddress: '',
      billingAddress: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      status: 'Draft',
      deliveryStatus: 'Not Shipped',
      receivingStatus: 'Pending',
      handoverStatus: 'Not Ready',
      notes: `Purchase Order created from Won Bid: ${bid.title || bid.tenderTitle}`,
      documents: [],
      preparedBy: '',
      approvedBy: '',
      approvalDate: '',
      receivedBy: '',
      receivedDate: '',
      inspectionNotes: '',
      handedOverBy: '',
      handedOverTo: '',
      handoverDate: '',
      companyRepresentative: '',
      companySignature: '',
    });
    setShowCreateFromBid(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const poData = {
        ...formData,
        totalAmount: calculateTotal(),
        updatedAt: serverTimestamp()
      };

      if (editingPO) {
        await updateDoc(doc(db, 'purchaseOrders', editingPO.id), poData);
      } else {
        poData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'purchaseOrders'), poData);
      }

      setShowModal(false);
      setEditingPO(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving purchase order:', error);
      alert('Error saving purchase order. Please try again.');
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      
      // Recalculate total price
      if (field === 'orderedQty' || field === 'unitPrice') {
        updatedItems[index].totalPrice = 
          (updatedItems[index].unitPrice || 0) * (updatedItems[index].orderedQty || 0);
      }
      
      return { ...prev, items: updatedItems };
    });
  };

  const handleDelete = async (poId) => {
    if (!window.confirm('Are you sure you want to delete this purchase order?')) return;
    
    try {
      await deleteDoc(doc(db, 'purchaseOrders', poId));
      fetchData();
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      alert('Error deleting purchase order. Please try again.');
    }
  };

  const handleStatusUpdate = async (poId, newStatus, field = 'status') => {
    try {
      const updateData = { 
        [field]: newStatus,
        updatedAt: serverTimestamp()
      };
      
      // Add timestamp for specific status changes
      if (field === 'status' && newStatus === 'Sent') {
        updateData.sentDate = format(new Date(), 'yyyy-MM-dd');
      }
      if (field === 'deliveryStatus' && newStatus === 'Delivered') {
        updateData.actualDeliveryDate = format(new Date(), 'yyyy-MM-dd');
      }
      if (field === 'receivingStatus' && newStatus === 'Fully Received') {
        updateData.receivedDate = format(new Date(), 'yyyy-MM-dd');
      }
      if (field === 'handoverStatus' && newStatus === 'Handed Over') {
        updateData.handoverDate = format(new Date(), 'yyyy-MM-dd');
      }
      
      await updateDoc(doc(db, 'purchaseOrders', poId), updateData);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      poNumber: '',
      bidId: '',
      bidRef: '',
      supplierId: '',
      supplierName: '',
      items: [],
      totalAmount: 0,
      currency: 'MVR',
      orderDate: '',
      expectedDeliveryDate: '',
      actualDeliveryDate: '',
      shippingMethod: '',
      trackingNumber: '',
      shippingAddress: '',
      billingAddress: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      status: 'Draft',
      deliveryStatus: 'Not Shipped',
      receivingStatus: 'Pending',
      handoverStatus: 'Not Ready',
      notes: '',
      documents: [],
      preparedBy: '',
      approvedBy: '',
      approvalDate: '',
      receivedBy: '',
      receivedDate: '',
      inspectionNotes: '',
      handedOverBy: '',
      handedOverTo: '',
      handoverDate: '',
      companyRepresentative: '',
      companySignature: '',
    });
    setSelectedBid(null);
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.bidRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || po.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Sent': 'bg-blue-100 text-blue-800',
      'Acknowledged': 'bg-indigo-100 text-indigo-800',
      'Partially Received': 'bg-yellow-100 text-yellow-800',
      'Fully Received': 'bg-green-100 text-green-800',
      'Completed': 'bg-teal-100 text-teal-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDeliveryStatusColor = (status) => {
    const colors = {
      'Not Shipped': 'bg-gray-100 text-gray-800',
      'In Transit': 'bg-blue-100 text-blue-800',
      'At Port': 'bg-orange-100 text-orange-800',
      'Customs Clearance': 'bg-yellow-100 text-yellow-800',
      'Delivered': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getReceivingStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-gray-100 text-gray-800',
      'Partially Received': 'bg-yellow-100 text-yellow-800',
      'Fully Received': 'bg-blue-100 text-blue-800',
      'Inspected': 'bg-indigo-100 text-indigo-800',
      'Accepted': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getHandoverStatusColor = (status) => {
    const colors = {
      'Not Ready': 'bg-gray-100 text-gray-800',
      'Ready for Handover': 'bg-blue-100 text-blue-800',
      'Handed Over': 'bg-yellow-100 text-yellow-800',
      'Accepted by Company': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const totalPOValue = purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);
  const poByStatus = poStatuses.reduce((acc, status) => {
    acc[status] = purchaseOrders.filter(po => po.status === status).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 mt-1">Manage purchase orders from won bids - Order Send, Receiving & Handover</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCreateFromBid(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Create from Won Bid
          </button>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New PO
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total POs</p>
              <p className="text-2xl font-bold text-blue-700">{purchaseOrders.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Draft/Sent</p>
              <p className="text-2xl font-bold text-yellow-700">
                {(poByStatus['Draft'] || 0) + (poByStatus['Sent'] || 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-orange-700">
                {purchaseOrders.filter(po => po.deliveryStatus === 'In Transit').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Received</p>
              <p className="text-2xl font-bold text-green-700">
                {(poByStatus['Fully Received'] || 0) + (poByStatus['Partially Received'] || 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-700">
                MVR {totalPOValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by PO number, bid reference, supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-48"
        >
          <option value="All">All Statuses</option>
          {poStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button 
          onClick={fetchData}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Purchase Orders List */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : filteredPOs.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No purchase orders found</p>
          <p className="text-sm mt-2">Create a PO from a won bid or add manually</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPOs.map((po) => (
            <div key={po.id} className="card overflow-hidden">
              {/* PO Header */}
              <div 
                className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                onClick={() => setExpandedPO(expandedPO === po.id ? null : po.id)}
              >
                <div className="flex items-center gap-4">
                  {expandedPO === po.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  <div>
                    <h3 className="font-semibold text-gray-900">{po.poNumber}</h3>
                    <p className="text-sm text-gray-500">{po.bidRef}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(po.status)}`}>
                    {po.status}
                  </span>
                  <span className="font-semibold text-gray-900">
                    MVR {(po.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* PO Details */}
              {expandedPO === po.id && (
                <div className="p-4 space-y-6">
                  {/* Status Workflow */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* PO Status */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">PO Status</p>
                      <select
                        value={po.status}
                        onChange={(e) => handleStatusUpdate(po.id, e.target.value, 'status')}
                        className="input w-full text-sm"
                      >
                        {poStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Delivery Status */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        Delivery Status
                      </p>
                      <select
                        value={po.deliveryStatus}
                        onChange={(e) => handleStatusUpdate(po.id, e.target.value, 'deliveryStatus')}
                        className="input w-full text-sm"
                      >
                        {deliveryStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Receiving Status */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Receiving Status
                      </p>
                      <select
                        value={po.receivingStatus}
                        onChange={(e) => handleStatusUpdate(po.id, e.target.value, 'receivingStatus')}
                        className="input w-full text-sm"
                      >
                        {receivingStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {/* Handover Status */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <HandshakeIcon className="w-3 h-3" />
                        Handover Status
                      </p>
                      <select
                        value={po.handoverStatus}
                        onChange={(e) => handleStatusUpdate(po.id, e.target.value, 'handoverStatus')}
                        className="input w-full text-sm"
                      >
                        {handoverStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Supplier & Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Supplier</p>
                      <p className="font-medium">{po.supplierName || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Contact Person</p>
                      <p className="font-medium">{po.contactPerson || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Contact</p>
                      <p className="text-sm">{po.contactPhone || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{po.contactEmail || ''}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Order Date</p>
                      <p className="font-medium">{po.orderDate || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Expected Delivery</p>
                      <p className="font-medium">{po.expectedDeliveryDate || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Actual Delivery</p>
                      <p className="font-medium">{po.actualDeliveryDate || 'Pending'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Handover Date</p>
                      <p className="font-medium">{po.handoverDate || 'Pending'}</p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Items</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">Item</th>
                            <th className="px-3 py-2 text-center">Ordered</th>
                            <th className="px-3 py-2 text-center">Received</th>
                            <th className="px-3 py-2 text-right">Unit Price</th>
                            <th className="px-3 py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {po.items?.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2">{item.name}</td>
                              <td className="px-3 py-2 text-center">{item.orderedQty}</td>
                              <td className="px-3 py-2 text-center">{item.receivedQty || 0}</td>
                              <td className="px-3 py-2 text-right">MVR {item.unitPrice?.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right font-medium">MVR {item.totalPrice?.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tracking Info */}
                  {po.trackingNumber && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1">Tracking Information</p>
                      <p className="font-medium">{po.shippingMethod} - {po.trackingNumber}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {po.notes && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Notes</p>
                      <p className="text-sm">{po.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleDelete(po.id)}
                      className="btn-danger text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                    <button
                      onClick={() => alert('Print functionality coming soon')}
                      className="btn-secondary text-sm"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create from Won Bid Modal */}
      {showCreateFromBid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Create Purchase Order from Won Bid</h2>
                <button onClick={() => setShowCreateFromBid(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {bids.length === 0 ? (
                <p className="text-center text-gray-500">No won bids available</p>
              ) : (
                <div className="space-y-3">
                  {bids.map((bid) => (
                    <div 
                      key={bid.id} 
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer"
                      onClick={() => handleCreateFromBid(bid)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{bid.title || bid.tenderTitle}</h3>
                          <p className="text-sm text-gray-500">{bid.authority}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {bid.items?.length || 0} items • MVR {bid.costEstimate?.toLocaleString() || 0}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit PO Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl my-8">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editingPO ? 'Edit Purchase Order' : 'Create Purchase Order'}
                </h2>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* PO Number & Reference */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">PO Number *</label>
                  <input
                    type="text"
                    value={formData.poNumber}
                    onChange={(e) => setFormData({...formData, poNumber: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Bid Reference</label>
                  <input
                    type="text"
                    value={formData.bidRef}
                    onChange={(e) => setFormData({...formData, bidRef: e.target.value})}
                    className="input"
                    readOnly={!!selectedBid}
                  />
                </div>
                <div>
                  <label className="label">Order Date *</label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData({...formData, orderDate: e.target.value})}
                    className="input"
                    required
                  />
                </div>
              </div>

              {/* Supplier Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Supplier *</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => {
                      const supplier = suppliers.find(s => s.id === e.target.value);
                      setFormData({
                        ...formData, 
                        supplierId: e.target.value,
                        supplierName: supplier?.name || '',
                        contactPerson: supplier?.contactPerson || '',
                        contactEmail: supplier?.email || '',
                        contactPhone: supplier?.phone || ''
                      });
                    }}
                    className="input"
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Or Enter Supplier Name</label>
                  <input
                    type="text"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                    className="input"
                    placeholder="If not in list"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    className="input"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Items</h3>
                  <p className="text-lg font-bold">Total: MVR {calculateTotal().toLocaleString()}</p>
                </div>
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg">
                      <div className="col-span-4">
                        <label className="text-xs text-gray-500">Item Name</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          className="input text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-500">Qty</label>
                        <input
                          type="number"
                          value={item.orderedQty}
                          onChange={(e) => updateItem(index, 'orderedQty', parseInt(e.target.value) || 0)}
                          className="input text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-gray-500">Unit Price (MVR)</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="input text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-medium">MVR {item.totalPrice?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Information */}
              <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Shipping Method</label>
                  <select
                    value={formData.shippingMethod}
                    onChange={(e) => setFormData({...formData, shippingMethod: e.target.value})}
                    className="input"
                  >
                    <option value="">Select Method</option>
                    <option value="Sea Freight">Sea Freight</option>
                    <option value="Air Freight">Air Freight</option>
                    <option value="Courier">Courier</option>
                    <option value="Local Delivery">Local Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="label">Tracking Number</label>
                  <input
                    type="text"
                    value={formData.trackingNumber}
                    onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})}
                    className="input"
                    placeholder="Enter tracking number"
                  />
                </div>
                <div>
                  <label className="label">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData({...formData, expectedDeliveryDate: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="input"
                  >
                    <option value="MVR">MVR (Maldives Rufiyaa)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                    <option value="INR">INR (Indian Rupee)</option>
                  </select>
                </div>
              </div>

              {/* Statuses */}
              <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="label">PO Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="input"
                  >
                    {poStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Delivery Status</label>
                  <select
                    value={formData.deliveryStatus}
                    onChange={(e) => setFormData({...formData, deliveryStatus: e.target.value})}
                    className="input"
                  >
                    {deliveryStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Receiving Status</label>
                  <select
                    value={formData.receivingStatus}
                    onChange={(e) => setFormData({...formData, receivingStatus: e.target.value})}
                    className="input"
                  >
                    {receivingStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Handover Status</label>
                  <select
                    value={formData.handoverStatus}
                    onChange={(e) => setFormData({...formData, handoverStatus: e.target.value})}
                    className="input"
                  >
                    {handoverStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="border-t border-gray-200 pt-4">
                <label className="label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input min-h-[100px]"
                  placeholder="Enter any additional notes..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingPO ? 'Update Purchase Order' : 'Create Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
