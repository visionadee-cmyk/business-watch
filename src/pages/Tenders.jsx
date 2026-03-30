import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Edit2, 
  Trash2, 
  Eye,
  X
} from 'lucide-react';
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

const Tenders = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingTender, setEditingTender] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tenderId: '',
    title: '',
    authority: '',
    description: '',
    category: 'IT',
    publishedDate: '',
    submissionDeadline: '',
    estimatedBudget: '',
    status: 'Open',
    documents: []
  });

  const categories = ['IT', 'Construction', 'Supply', 'Services', 'Consultancy', 'Other'];
  const statuses = ['Open', 'Bidding', 'Submitted', 'Won', 'Lost'];

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const q = query(collection(db, 'tenders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setTenders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tenderData = {
        ...formData,
        estimatedBudget: parseFloat(formData.estimatedBudget) || 0,
        updatedAt: serverTimestamp()
      };

      if (editingTender) {
        await updateDoc(doc(db, 'tenders', editingTender.id), tenderData);
      } else {
        tenderData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'tenders'), tenderData);
      }

      setShowModal(false);
      setEditingTender(null);
      resetForm();
      fetchTenders();
    } catch (error) {
      console.error('Error saving tender:', error);
      alert('Error saving tender. Please try again.');
    }
  };

  const handleDelete = async (tenderId) => {
    if (!window.confirm('Are you sure you want to delete this tender?')) return;
    
    try {
      await deleteDoc(doc(db, 'tenders', tenderId));
      fetchTenders();
    } catch (error) {
      console.error('Error deleting tender:', error);
      alert('Error deleting tender. Please try again.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Store file metadata only (no storage upload)
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, { 
        name: file.name, 
        type: file.type,
        size: file.size
      }]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      tenderId: '',
      title: '',
      authority: '',
      description: '',
      category: 'IT',
      publishedDate: '',
      submissionDeadline: '',
      estimatedBudget: '',
      status: 'Open',
      documents: []
    });
  };

  const openEditModal = (tender) => {
    setEditingTender(tender);
    setFormData({
      tenderId: tender.tenderId || '',
      title: tender.title || '',
      authority: tender.authority || '',
      description: tender.description || '',
      category: tender.category || 'IT',
      publishedDate: tender.publishedDate || '',
      submissionDeadline: tender.submissionDeadline || '',
      estimatedBudget: tender.estimatedBudget || '',
      status: tender.status || 'Open',
      documents: tender.documents || []
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingTender(null);
    resetForm();
    setShowModal(true);
  };

  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = 
      tender.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.tenderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.authority?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || tender.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || tender.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-blue-100 text-blue-800',
      'Bidding': 'bg-yellow-100 text-yellow-800',
      'Submitted': 'bg-purple-100 text-purple-800',
      'Won': 'bg-green-100 text-green-800',
      'Lost': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tender Management</h1>
          <p className="text-gray-500 mt-1">Track and manage Maldives government tenders</p>
        </div>
        {isAdmin() && (
          <button onClick={openAddModal} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Add Tender
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, ID, or authority..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="All">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input"
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tenders Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : filteredTenders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No tenders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tender ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Authority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTenders.map((tender) => (
                  <tr key={tender.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{tender.tenderId}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{tender.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{tender.authority}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{tender.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {tender.submissionDeadline ? format(new Date(tender.submissionDeadline), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      MVR {tender.estimatedBudget?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tender.status)}`}>
                        {tender.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/tenders/${tender.id}`)}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin() && (
                          <>
                            <button 
                              onClick={() => openEditModal(tender)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(tender.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
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
                {editingTender ? 'Edit Tender' : 'Add New Tender'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tender ID</label>
                  <input
                    type="text"
                    value={formData.tenderId}
                    onChange={(e) => setFormData({...formData, tenderId: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Government Authority</label>
                <input
                  type="text"
                  value={formData.authority}
                  onChange={(e) => setFormData({...formData, authority: e.target.value})}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input h-24"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Published Date</label>
                  <input
                    type="date"
                    value={formData.publishedDate}
                    onChange={(e) => setFormData({...formData, publishedDate: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Submission Deadline</label>
                  <input
                    type="date"
                    value={formData.submissionDeadline}
                    onChange={(e) => setFormData({...formData, submissionDeadline: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Estimated Budget (MVR)</label>
                  <input
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({...formData, estimatedBudget: e.target.value})}
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

              <div>
                <label className="label">Documents</label>
                <div className="space-y-2">
                  {formData.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{doc.name}</span>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx"
                    />
                    <label
                      htmlFor="file-upload"
                      className="btn-secondary cursor-pointer inline-flex"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingFile ? 'Uploading...' : 'Upload Document'}
                    </label>
                  </div>
                </div>
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
                  {editingTender ? 'Update' : 'Create'} Tender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenders;
