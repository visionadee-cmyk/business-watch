import React, { useState, useMemo } from 'react';
import { Search, Filter, X, FileText, DollarSign, Building2, Calendar, CheckCircle, Clock, User } from 'lucide-react';
import { useData } from '../hooks/useData';

export default function AdvancedSearch() {
  const { bids, tenders } = useData();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    minAmount: '',
    maxAmount: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Combine all searchable data
  const allData = useMemo(() => {
    const bidItems = bids.map(b => ({
      ...b,
      itemType: 'Bid',
      title: b.tender_title || b.title,
      amount: b.bid_amount,
    }));
    const tenderItems = tenders.map(t => ({
      ...t,
      itemType: 'Tender',
      title: t.title,
      amount: t.amount,
    }));
    return [...bidItems, ...tenderItems];
  }, [bids, tenders]);

  // Filter and search
  const results = useMemo(() => {
    let filtered = allData;

    // Text search
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(item => 
        (item.title?.toLowerCase().includes(q)) ||
        (item.authority?.toLowerCase().includes(q)) ||
        (item.description?.toLowerCase().includes(q)) ||
        (item.category?.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.itemType.toLowerCase() === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => 
        (item.status?.toLowerCase() === filters.status) ||
        (item.result?.toLowerCase() === filters.status)
      );
    }

    // Amount range
    if (filters.minAmount) {
      filtered = filtered.filter(item => (item.amount || 0) >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(item => (item.amount || 0) <= parseFloat(filters.maxAmount));
    }

    // Date range
    if (filters.dateFrom) {
      filtered = filtered.filter(item => 
        item.submission_deadline >= filters.dateFrom || 
        item.bid_opening_date >= filters.dateFrom
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(item => 
        item.submission_deadline <= filters.dateTo || 
        item.bid_opening_date <= filters.dateTo
      );
    }

    return filtered;
  }, [allData, query, filters]);

  const clearFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      minAmount: '',
      maxAmount: '',
      dateFrom: '',
      dateTo: '',
    });
    setQuery('');
  };

  const getStatusIcon = (status, result) => {
    if (result === 'Won') return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (result === 'Lost') return <X className="w-5 h-5 text-red-500" />;
    if (status === 'Submitted') return <CheckCircle className="w-5 h-5 text-blue-500" />;
    return <Clock className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Advanced Search</h1>
        <p className="text-gray-500 mt-1">Search across all tenders, bids, and documents</p>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, authority, category, or description..."
              className="input w-full pl-12 pr-4 py-3"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`btn btn-secondary flex items-center gap-2 ${showFilters ? 'bg-gray-200' : ''}`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Type</label>
              <select 
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="input w-full"
              >
                <option value="all">All Types</option>
                <option value="tender">Tenders</option>
                <option value="bid">Bids</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="input w-full"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="draft">Draft</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Amount Range (MVR)</label>
              <div className="flex gap-2">
                <input 
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                  placeholder="Min"
                  className="input w-full"
                />
                <input 
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                  placeholder="Max"
                  className="input w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date From</label>
              <input 
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date To</label>
              <input 
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="input w-full"
              />
            </div>
            <div className="flex items-end">
              <button onClick={clearFilters} className="btn btn-secondary w-full">
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Search Results ({results.length})</h3>
        </div>

        <div className="space-y-3">
          {results.map((item) => (
            <div key={`${item.itemType}-${item.id}`} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-gray-50">
              <div className="flex-shrink-0">
                {item.itemType === 'Bid' ? (
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{item.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.itemType === 'Bid' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.itemType}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {item.authority}
                  </span>
                  {item.amount > 0 && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      MVR {item.amount.toLocaleString()}
                    </span>
                  )}
                  {(item.submission_deadline || item.bid_opening_date) && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {item.submission_deadline || item.bid_opening_date}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {getStatusIcon(item.status, item.result)}
                  <span className="text-sm">
                    {item.result || item.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No results found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
