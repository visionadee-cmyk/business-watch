import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, ShoppingCart, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';

const Procurement = () => {
  const [purchases, setPurchases] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    tenderId: '',
    itemName: '',
    quantity: '',
    supplierId: '',
    costPerUnit: '',
    totalCost: '',
    purchaseDate: '',
    status: 'Pending',
    notes: ''
  });

  const statuses = ['Pending', 'Ordered', 'Received', 'Cancelled'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const purchasesQuery = query(collection(db, 'purchases'), orderBy('createdAt', 'desc'));
      const purchasesSnapshot = await getDocs(purchasesQuery);
      setPurchases(purchasesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const tendersSnapshot = await getDocs(collection(db, 'tenders'));
      setTenders(tendersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const suppliersSnapshot = await getDocs(collection(db, 'suppliers'));
      setSuppliers(suppliersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const qty = parseInt(formData.quantity) || 0;
    const cost = parseFloat(formData.unitPrice) || 0;
    const total = qty * cost;
    setFormData(prev => ({ ...prev, totalPrice: total }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const purchaseData = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        unitPrice: parseFloat(formData.unitPrice) || 0,
        totalPrice: parseInt(formData.quantity) * parseFloat(formData.unitPrice),
        updatedAt: serverTimestamp()
      };

      if (editingPurchase) {
        await updateDoc(doc(db, 'purchases', editingPurchase.id), purchaseData);
      } else {
        purchaseData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'purchases'), purchaseData);
      }

      setShowModal(false);
      setEditingPurchase(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving purchase:', error);
      alert('Error saving purchase. Please try again.');
    }
  };

  const handleDelete = async (purchaseId) => {
    if (!window.confirm('Are you sure you want to delete this purchase?')) return;
    
    try {
      await deleteDoc(doc(db, 'purchases', purchaseId));
      fetchData();
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert('Error deleting purchase. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      tenderId: '',
      itemName: '',
      quantity: '',
      supplierId: '',
      costPerUnit: '',
      totalCost: '',
      purchaseDate: '',
      status: 'Pending',
      notes: ''
    });
  };

  const openEditModal = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      tenderId: purchase.tenderId || '',
      itemName: purchase.itemName || '',
      quantity: purchase.quantity || '',
      supplierId: purchase.supplierId || '',
      costPerUnit: purchase.costPerUnit || '',
      totalCost: purchase.totalCost || '',
      purchaseDate: purchase.purchaseDate || '',
      status: purchase.status || 'Pending',
      notes: purchase.notes || ''
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingPurchase(null);
    resetForm();
    setShowModal(true);
  };

  const getTenderTitle = (tenderId) => {
    const tender = tenders.find(t => t.id === tenderId);
    return tender ? tender.title : 'Unknown Tender';
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTenderTitle(purchase.tenderId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSupplierName(purchase.supplierId).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Ordered': 'bg-blue-100 text-blue-800',
      'Received': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const totalPurchaseCost = purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
  const pendingPurchases = purchases.filter(p => p.status === 'Pending').length;
  const receivedPurchases = purchases.filter(p => p.status === 'Received').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procurement</h1>
          <p className="text-gray-500 mt-1">Manage purchases for won tenders</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Purchase
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Purchases</p>
          <p className="text-2xl font-bold text-gray-900">{purchases.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Purchase Cost</p>
          <p className="text-2xl font-bold text-danger-600">MVR {totalPurchaseCost.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Pending Orders</p>
          <p className="text-2xl font-bold text-warning-600">{pendingPurchases}</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by item, tender, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No purchases found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {getTenderTitle(purchase.tenderId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{purchase.itemName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{purchase.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {getSupplierName(purchase.supplierId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      MVR {purchase.costPerUnit?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      MVR {purchase.totalCost?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(purchase.status)}`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(purchase)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {isAdmin() && (
                          <button 
                            onClick={() => handleDelete(purchase.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Select Tender (Won)</label>
                <select
                  value={formData.tenderId}
                  onChange={(e) => setFormData({...formData, tenderId: e.target.value})}
                  className="input"
                  required
                >
                  <option value="">Select a tender</option>
                  {tenders.map(tender => (
                    <option key={tender.id} value={tender.id}>{tender.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Item Name</label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => {
                      setFormData({...formData, quantity: e.target.value});
                      setTimeout(calculateTotal, 0);
                    }}
                    onBlur={calculateTotal}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Cost per Unit (MVR)</label>
                  <input
                    type="number"
                    value={formData.costPerUnit}
                    onChange={(e) => {
                      setFormData({...formData, costPerUnit: e.target.value});
                      setTimeout(calculateTotal, 0);
                    }}
                    onBlur={calculateTotal}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Total Cost (Auto)</label>
                  <input
                    type="number"
                    value={formData.totalCost}
                    readOnly
                    className="input bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="label">Supplier</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                  className="input"
                  required
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="input"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input h-24"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingPurchase ? 'Update' : 'Create'} Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Procurement;
