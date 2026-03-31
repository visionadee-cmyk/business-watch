import React, { useState } from 'react';
import { Scale, CheckCircle, XCircle, DollarSign, Clock, FileText, ArrowRight, Plus, Trash2 } from 'lucide-react';

const mockComparison = {
  tender: 'IT Equipment Supply - Ministry of Education',
  bids: [
    { id: 1, supplier: 'Tech Solutions Ltd', amount: 2450000, delivery: '30 days', warranty: '3 years', support: '24/7', rating: 4.5, status: 'recommended' },
    { id: 2, supplier: 'Digital Systems Inc', amount: 2380000, delivery: '45 days', warranty: '2 years', support: 'Business hours', rating: 4.2, status: '' },
    { id: 3, supplier: 'Computer World', amount: 2650000, delivery: '21 days', warranty: '5 years', support: '24/7', rating: 4.8, status: '' },
    { id: 4, supplier: 'IT Supplies Co', amount: 2290000, delivery: '60 days', warranty: '1 year', support: 'Email only', rating: 3.8, status: 'lowest' },
  ]
};

export default function BidComparison() {
  const [comparison, setComparison] = useState(mockComparison);
  const [selectedBids, setSelectedBids] = useState([1, 2]);

  const toggleBidSelection = (id) => {
    setSelectedBids(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const selectedBidData = comparison.bids.filter(b => selectedBids.includes(b.id));
  const lowestPrice = Math.min(...comparison.bids.map(b => b.amount));
  const bestRating = Math.max(...comparison.bids.map(b => b.rating));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bid Comparison Tool</h1>
          <p className="text-gray-500 mt-1">Compare bids side-by-side</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Comparison
        </button>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-4">{comparison.tender}</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2">
                <th className="px-4 py-3 text-left">Compare</th>
                <th className="px-4 py-3 text-left">Supplier</th>
                <th className="px-4 py-3 text-right">Bid Amount</th>
                <th className="px-4 py-3 text-center">Rating</th>
                <th className="px-4 py-3 text-center">Delivery</th>
                <th className="px-4 py-3 text-center">Warranty</th>
                <th className="px-4 py-3 text-center">Support</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comparison.bids.map((bid) => (
                <tr key={bid.id} className={`border-b hover:bg-gray-50 ${bid.status === 'recommended' ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      checked={selectedBids.includes(bid.id)}
                      onChange={() => toggleBidSelection(bid.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bid.supplier}</span>
                      {bid.status === 'recommended' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Recommended</span>
                      )}
                      {bid.status === 'lowest' && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">Lowest Price</span>
                      )}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${bid.amount === lowestPrice ? 'text-emerald-600' : ''}`}>
                    MVR {bid.amount.toLocaleString()}
                    {bid.amount === lowestPrice && <span className="ml-2 text-xs">★ Lowest</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${bid.rating === bestRating ? 'bg-amber-100' : 'bg-gray-100'}`}>
                      <span className={bid.rating === bestRating ? 'text-amber-700' : ''}>{bid.rating}</span>
                      <span className="text-xs">/5</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{bid.delivery}</td>
                  <td className="px-4 py-3 text-center">{bid.warranty}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${bid.support === '24/7' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100'}`}>
                      {bid.support}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-blue-600 hover:underline text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBidData.length >= 2 && (
        <div className="card">
          <h3 className="font-semibold text-lg mb-4">Side-by-Side Comparison ({selectedBidData.length} selected)</h3>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedBidData.length}, minmax(200px, 1fr))` }}>
            {selectedBidData.map((bid) => (
              <div key={bid.id} className="border rounded-lg p-4">
                <h4 className="font-semibold text-center mb-4 pb-4 border-b">{bid.supplier}</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className={`font-medium ${bid.amount === lowestPrice ? 'text-emerald-600' : ''}`}>
                      MVR {bid.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-medium">{bid.rating}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery:</span>
                    <span>{bid.delivery}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Warranty:</span>
                    <span>{bid.warranty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Support:</span>
                    <span>{bid.support}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t space-y-2">
                  <button className="w-full btn btn-primary text-sm py-2">Select Winner</button>
                  <button className="w-full btn btn-secondary text-sm py-2">Request Clarification</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Scale className="w-5 h-5" />
          AI Recommendation
        </h3>
        <p className="text-gray-700 mb-4">
          Based on price, delivery time, warranty, and supplier rating, <strong>Tech Solutions Ltd</strong> offers the best overall value. 
          While not the lowest price, their 3-year warranty and 24/7 support justify the premium.
        </p>
        <div className="flex gap-3">
          <button className="btn btn-primary">Accept Recommendation</button>
          <button className="btn btn-secondary">View Analysis</button>
        </div>
      </div>
    </div>
  );
}
