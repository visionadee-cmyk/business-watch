import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Truck, CheckCircle, Clock, Package, X, Calendar } from 'lucide-react';
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
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    tenderId: '',
    itemName: '',
    quantity: '',
    status: 'Pending',
    deliveryDate: '',
    expectedDate: '',
    notes: '',
    completed: false
  });

  const statuses = ['Pending', 'In Progress', 'Delivered'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch deliveries
      const deliveriesQuery = query(collection(db, 'deliveries'), orderBy('createdAt', 'desc'));
      const deliveriesSnapshot = await getDocs(deliveriesQuery);
      setDeliveries(deliveriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch tenders (only won ones)
      const tendersQuery = query(collection(db, 'tenders'), where('status', '==', 'Won'));
      const tendersSnapshot = await getDocs(tendersQuery);
      setTenders(tendersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const deliveryData = {
        ...formData,
        quantity: parseFloat(formData.quantity) || 0,
        updatedAt: serverTimestamp()
      };

      if (editingDelivery) {
        await updateDoc(doc(db, 'deliveries', editingDelivery.id), deliveryData);
      } else {
        deliveryData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'deliveries'), deliveryData);
      }

      setShowModal(false);
      setEditingDelivery(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving delivery:', error);
      alert('Error saving delivery. Please try again.');
    }
  };

  const handleDelete = async (deliveryId) => {
    if (!window.confirm('Are you sure you want to delete this delivery record?')) return;
    
    try {
      await deleteDoc(doc(db, 'deliveries', deliveryId));
      fetchData();
    } catch (error) {
      console.error('Error deleting delivery:', error);
      alert('Error deleting delivery. Please try again.');
    }
  };

  const toggleCompleted = async (delivery) => {
    try {
      await updateDoc(doc(db, 'deliveries', delivery.id), {
        completed: !delivery.completed,
        updatedAt: serverTimestamp()
      });
      fetchData();
    } catch (error) {
      console.error('Error updating delivery:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      tenderId: '',
      itemName: '',
      quantity: '',
      status: 'Pending',
      deliveryDate: '',
      expectedDate: '',
      notes: '',
      completed: false
    });
  };

  const openEditModal = (delivery) => {
    setEditingDelivery(delivery);
    setFormData({
      tenderId: delivery.tenderId || '',
      itemName: delivery.itemName || '',
      quantity: delivery.quantity || '',
      status: delivery.status || 'Pending',
      deliveryDate: delivery.deliveryDate || '',
      expectedDate: delivery.expectedDate || '',
      notes: delivery.notes || '',
      completed: delivery.completed || false
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingDelivery(null);
    resetForm();
    setShowModal(true);
  };

  const getTenderTitle = (tenderId) => {
    const tender = tenders.find(t => t.id === tenderId);
    return tender ? tender.title : 'Unknown Tender';
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTenderTitle(delivery.tenderId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || delivery.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Delivered': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const pendingDeliveries = deliveries.filter(d => d.status === 'Pending').length;
  const inProgressDeliveries = deliveries.filter(d => d.status === 'In Progress').length;
  const deliveredDeliveries = deliveries.filter(d => d.status === 'Delivered').length;
  const completedProjects = deliveries.filter(d => d.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivery & Project Tracking</h1>
          <p className="text-gray-500 mt-1">Track deliveries and project completion status</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Delivery
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-warning-600">{pendingDeliveries}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-primary-600">{inProgressDeliveries}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="text-2xl font-bold text-success-600">{deliveredDeliveries}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Completed Projects</p>
          <p className="text-2xl font-bold text-gray-900">{completedProjects}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by item or tender..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input"
          >
            <option value="All">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No deliveries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {getTenderTitle(delivery.tenderId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{delivery.itemName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{delivery.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {delivery.expectedDate ? format(new Date(delivery.expectedDate), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {delivery.deliveryDate ? format(new Date(delivery.deliveryDate), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleCompleted(delivery)}
                        className={`p-1 rounded ${delivery.completed ? 'text-success-600' : 'text-gray-400 hover:text-gray-600'}`}
                        title={delivery.completed ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(delivery)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {isAdmin() && (
                          <button 
                            onClick={() => handleDelete(delivery.id)}
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
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDelivery ? 'Edit Delivery' : 'Add New Delivery'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Select Tender</label>
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

              <div>
                <label className="label">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={formData.expectedDate}
                    onChange={(e) => setFormData({...formData, expectedDate: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Actual Delivery Date</label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                    className="input"
                  />
                </div>
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

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="completed"
                  checked={formData.completed}
                  onChange={(e) => setFormData({...formData, completed: e.target.checked})}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="completed" className="text-sm text-gray-700">
                  Mark project as completed
                </label>
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input h-24"
                  placeholder="Delivery notes, tracking info, etc..."
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
                  {editingDelivery ? 'Update' : 'Create'} Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;
