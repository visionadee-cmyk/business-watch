import { useState, useEffect } from 'react';
import { FileText, Trash2, X, FolderOpen, File, Image } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: 'Tender',
    description: ''
  });
  
  const { isAdmin } = useAuth();

  const categories = ['Tender', 'Bid', 'Invoice', 'Delivery', 'Contract', 'Other'];

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
      // Store document metadata only (no file storage)
      const docData = {
        name: uploadForm.name || selectedFile.name,
        originalName: selectedFile.name,
        category: uploadForm.category,
        description: uploadForm.description,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'documents'), docData);

      // Reset form
      setSelectedFile(null);
      setUploadForm({ name: '', category: 'Tender', description: '' });
      fetchDocuments();
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Error saving document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (document) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      // Delete from Firestore only (no storage to delete)
      await deleteDoc(doc(db, 'documents', document.id));
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document. Please try again.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) {
      return <Image className="w-10 h-10 text-purple-500" />;
    } else if (fileType?.includes('pdf')) {
      return <FileText className="w-10 h-10 text-red-500" />;
    } else if (fileType?.includes('word') || fileType?.includes('document')) {
      return <FileText className="w-10 h-10 text-blue-500" />;
    } else if (fileType?.includes('excel') || fileType?.includes('sheet')) {
      return <FileText className="w-10 h-10 text-green-500" />;
    } else {
      return <File className="w-10 h-10 text-gray-500" />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
        <p className="text-gray-500 mt-1">Upload, store, and manage all your documents</p>
      </div>

      {/* Upload Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Add Document Reference
        </h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="label">Document Name</label>
              <input
                type="text"
                value={uploadForm.name}
                onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
                className="input"
                placeholder="Enter document name"
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                className="input"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <input
              type="text"
              value={uploadForm.description}
              onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
              className="input"
              placeholder="Brief description of the document"
            />
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="document-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="document-upload"
                className="btn-secondary cursor-pointer inline-flex w-full justify-center"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                {selectedFile ? selectedFile.name : 'Choose File'}
              </label>
            </div>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="btn-primary disabled:opacity-50"
            >
              {uploading ? 'Saving...' : 'Save Document'}
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
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

      {/* Documents List */}
      <div className="card">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No documents found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  {getFileIcon(document.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {document.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {document.category} • {formatFileSize(document.fileSize || 0)}
                    {document.createdAt?.toDate ? ` • ${format(new Date(document.createdAt.toDate()), 'MMM d, yyyy')}` : document.createdAt ? ` • ${format(new Date(document.createdAt), 'MMM d, yyyy')}` : ''}
                  </p>
                  {document.description && (
                    <p className="text-xs text-gray-600 mt-1 truncate">{document.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {isAdmin() && (
                    <button
                      onClick={() => handleDelete(document)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
