import { useState, useEffect } from 'react';
import { 
  Upload, FileText, Search, Trash2, 
  Building2, FileCheck, Briefcase, Landmark, File, X,
  ChevronDown, Eye, FolderOpen, Download, Pencil
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  doc,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';

const documentTypes = [
  { id: 'registration', label: 'Company Registration', icon: Building2, color: 'blue' },
  { id: 'gst', label: 'GST Certificate', icon: FileCheck, color: 'green' },
  { id: 'experience', label: 'Experience Letters', icon: Briefcase, color: 'purple' },
  { id: 'bank', label: 'Bank Statement', icon: Landmark, color: 'orange' },
  { id: 'profile', label: 'Company Profile', icon: FileText, color: 'indigo' },
  { id: 'other', label: 'Others', icon: File, color: 'gray' }
];

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'registration',
    description: ''
  });
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    type: 'registration',
    description: ''
  });

  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setDocuments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadForm(prev => ({ ...prev, name: file.name }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'business_watch');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dr9nhz1hs/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        await addDoc(collection(db, 'documents'), {
          name: uploadForm.name || selectedFile.name,
          type: uploadForm.type,
          description: uploadForm.description,
          url: data.secure_url,
          publicId: data.public_id,
          format: data.format,
          size: data.bytes,
          createdAt: serverTimestamp()
        });

        await fetchDocuments();
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadForm({ name: '', type: 'registration', description: '' });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (document) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDoc(doc(db, 'documents', document.id));
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const openEditModal = (document) => {
    setEditForm({
      id: document.id,
      name: document.name,
      type: document.type,
      description: document.description || ''
    });
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'documents', editForm.id), {
        name: editForm.name,
        type: editForm.type,
        description: editForm.description,
        updatedAt: serverTimestamp()
      });
      await fetchDocuments();
      setShowEditModal(false);
      setEditForm({ id: '', name: '', type: 'registration', description: '' });
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Failed to update document. Please try again.');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getDocumentType = (typeId) => documentTypes.find(t => t.id === typeId) || documentTypes[5];

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCloudinaryViewUrl = (url, format) => {
    if (!url) return '';
    if (format === 'pdf') {
      // Use Google Docs viewer for reliable PDF embedding
      return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // Helper to safely format Firestore timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    try {
      // If it's a Firestore Timestamp with toDate method
      if (timestamp.toDate) {
        return timestamp.toDate();
      }
      // If it's already a Date or can be parsed
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      console.error('Error parsing timestamp:', e);
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Documents & Certificates
          </h1>
          <p className="text-gray-500 mt-1">
            Manage company registration, GST certificates, and other important documents
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          <Upload className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {documentTypes.map(type => {
          const count = documents.filter(d => d.type === type.id).length;
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              onClick={() => setSelectedType(selectedType === type.id ? 'all' : type.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedType === type.id 
                  ? `border-${type.color}-500 bg-${type.color}-50` 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg bg-${type.color}-100 flex items-center justify-center mb-2`}>
                <Icon className={`w-5 h-5 text-${type.color}-600`} />
              </div>
              <p className="font-semibold text-gray-900 text-sm">{count}</p>
              <p className="text-xs text-gray-600">{type.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input appearance-none pr-10"
            >
              <option value="all">All Types</option>
              {documentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="card">
        {filteredDocuments.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No documents found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm || selectedType !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Upload your first document to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map(doc => {
              const type = getDocumentType(doc.type);
              const Icon = type.icon;
              
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setPreviewDoc(doc)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-${type.color}-100 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${type.color}-600`} />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${type.color}-100 text-${type.color}-700`}>
                      {type.label}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1 truncate" title={doc.name}>
                    {doc.name}
                  </h3>
                  {doc.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{formatFileSize(doc.size)}</span>
                    <span>{doc.format?.toUpperCase()}</span>
                  </div>

                  {doc.createdAt && (
                    <p className="text-xs text-gray-400 mb-3">
                      {formatTimestamp(doc.createdAt) && format(formatTimestamp(doc.createdAt), 'MMM d, yyyy')}
                    </p>
                  )}

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewDoc(doc);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(doc);
                      }}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 text-sm font-medium transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <a
                      href={doc.url}
                      download={doc.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    {isAdmin() && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc);
                        }}
                        className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                  className="input w-full"
                  required
                >
                  {documentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Name</label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  placeholder="e.g., Company Registration 2025"
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Add any notes about this document..."
                  rows={3}
                  className="input w-full resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to select a file'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, Word, Images up to 10MB
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Document</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="input w-full"
                  required
                >
                  {documentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g., Company Registration 2025"
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Add any notes about this document..."
                  rows={3}
                  className="input w-full resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{previewDoc.name}</h2>
                <p className="text-sm text-gray-500">{getDocumentType(previewDoc.type).label}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 h-[70vh]">
              {previewDoc.format === 'pdf' ? (
                <iframe
                  src={getCloudinaryViewUrl(previewDoc.url, previewDoc.format)}
                  className="w-full h-full rounded-lg"
                  title={previewDoc.name}
                />
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="max-w-full max-h-full object-contain mx-auto"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;