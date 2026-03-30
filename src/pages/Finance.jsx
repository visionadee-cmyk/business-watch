import { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FileSpreadsheet, Calculator, TrendingUp, DollarSign, PieChart, ChevronDown, ChevronUp } from 'lucide-react';

const Finance = () => {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedSheet, setExpandedSheet] = useState(null);

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      // Simple query without composite index requirements
      const q = query(
        collection(db, 'excelSheets'), 
        where('type', '==', 'finance')
      );
      const snapshot = await getDocs(q);
      // Sort client-side
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
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
      case 'Masakkaiy': return <DollarSign className="w-6 h-6 text-green-600" />;
      case 'Working': return <Calculator className="w-6 h-6 text-blue-600" />;
      default: return <FileSpreadsheet className="w-6 h-6 text-gray-600" />;
    }
  };

  const filteredSheets = activeTab === 'all' 
    ? sheets 
    : sheets.filter(s => s.sheetName === activeTab);

  const toggleExpand = (sheetId) => {
    setExpandedSheet(expandedSheet === sheetId ? null : sheetId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-500 mt-1">Masakkaiy & Working calculations</p>
        </div>
        <div className="card px-6 py-3 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary-600" />
          <div>
            <p className="text-sm text-gray-500">Finance Sheets</p>
            <p className="text-xl font-bold text-gray-900">{sheets.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['all', 'Masakkaiy', 'Working'].map((tab) => (
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
        <div className="space-y-4">
          {filteredSheets.map((sheet) => (
            <div key={sheet.id} className="card">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(sheet.id)}
              >
                <div className="flex items-center gap-3">
                  {getIcon(sheet.sheetName)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{sheet.displayName}</h3>
                    <p className="text-sm text-gray-500">{sheet.sheetName} • {sheet.data?.length || 0} items</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                    {sheet.type}
                  </span>
                  {expandedSheet === sheet.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Expanded Data Table */}
              {expandedSheet === sheet.id && sheet.data && sheet.data.length > 0 && (
                <div className="mt-4 border-t pt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(sheet.data[0]).filter(k => k !== 'id').map(key => (
                          <th key={key} className="px-3 py-2 text-left font-medium text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sheet.data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          {Object.entries(row).filter(([k]) => k !== 'id').map(([key, value]) => (
                            <td key={key} className="px-3 py-2 text-gray-600">
                              {key === 'amount' || key === 'price' || key === 'total'
                                ? `MVR ${Number(value).toLocaleString()}` 
                                : value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {expandedSheet === sheet.id && (!sheet.data || sheet.data.length === 0) && (
                <div className="mt-4 border-t pt-4 text-center text-gray-500">
                  No data in this sheet
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && filteredSheets.length === 0 && (
        <div className="text-center py-12">
          <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No finance sheets found. Upload Excel data first.</p>
        </div>
      )}
    </div>
  );
};

export default Finance;
