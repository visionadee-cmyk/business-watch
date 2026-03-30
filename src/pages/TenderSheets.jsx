import { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FileText, Filter, FileSpreadsheet, CheckCircle, XCircle, Clock } from 'lucide-react';

const TenderSheets = () => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      // Simple query without composite index requirements
      const q = query(
        collection(db, 'excelSheets'), 
        where('type', '==', 'tenders')
      );
      const snapshot = await getDocs(q);
      // Sort and filter client-side
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(sheet => sheet.source === 'Projects 2026.xlsx')
        .sort((a, b) => a.sheetName?.localeCompare(b.sheetName));
      setSheets(data);
    } catch (error) {
      console.error('Error fetching sheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (sheetName) => {
    switch (sheetName) {
      case 'Bidds': return <FileText className="w-6 h-6 text-blue-600" />;
      case 'Missed': return <XCircle className="w-6 h-6 text-danger-600" />;
      case 'Submitted': return <CheckCircle className="w-6 h-6 text-success-600" />;
      default: return <FileSpreadsheet className="w-6 h-6 text-gray-600" />;
    }
  };

  const filteredSheets = activeTab === 'all' 
    ? sheets 
    : sheets.filter(s => s.sheetName.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tender Sheets</h1>
          <p className="text-gray-500 mt-1">Projects 2026.xlsx - Tender tracking sheets</p>
        </div>
        <div className="card px-6 py-3 flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-primary-600" />
          <div>
            <p className="text-sm text-gray-500">Total Sheets</p>
            <p className="text-xl font-bold text-gray-900">{sheets.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['all', 'Bidds', 'Missed', 'Submitted'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'all' ? 'All Sheets' : tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSheets.map((sheet) => (
            <div key={sheet.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getIcon(sheet.sheetName)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{sheet.displayName}</h3>
                    <p className="text-sm text-gray-500">{sheet.sheetName}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  sheet.type === 'tenders' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {sheet.type}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Source</span>
                  <span className="font-medium">{sheet.source}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-success-600">{sheet.status}</span>
                </div>
              </div>

              <button className="mt-4 w-full btn-secondary text-sm">
                View Sheet Data
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredSheets.length === 0 && (
        <div className="text-center py-12">
          <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tender sheets found. Upload Excel data first.</p>
        </div>
      )}
    </div>
  );
};

export default TenderSheets;
