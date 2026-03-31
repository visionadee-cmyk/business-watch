import React, { useState } from 'react';
import { FileText, Plus, Calendar, DollarSign, CheckCircle, Clock, AlertCircle, Edit2, Trash2, Download, Eye } from 'lucide-react';

const mockContracts = [
  { id: 1, title: 'IT Equipment Supply Contract', client: 'Ministry of Education', value: 2500000, startDate: '2026-01-15', endDate: '2026-12-31', status: 'Active', type: 'Supply', renewalDate: '2026-11-01' },
  { id: 2, title: 'Office Renovation Project', client: 'State Trading Organization', value: 1800000, startDate: '2026-02-01', endDate: '2026-06-30', status: 'Active', type: 'Construction', renewalDate: null },
  { id: 3, title: 'Annual Maintenance Agreement', client: 'Maldives Ports Limited', value: 450000, startDate: '2025-07-01', endDate: '2026-06-30', status: 'Expiring', type: 'Service', renewalDate: '2026-05-15' },
  { id: 4, title: 'Software License Agreement', client: 'Maldivian Airlines', value: 320000, startDate: '2025-03-01', endDate: '2026-02-28', status: 'Expired', type: 'License', renewalDate: null },
];

export default function ContractManagement() {
  const [contracts, setContracts] = useState(mockContracts);
  const [showModal, setShowModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'Active').length,
    expiring: contracts.filter(c => c.status === 'Expiring').length,
    expired: contracts.filter(c => c.status === 'Expired').length,
    totalValue: contracts.reduce((sum, c) => sum + c.value, 0)
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800';
      case 'Expiring': return 'bg-amber-100 text-amber-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contract Management</h1>
          <p className="text-gray-500 mt-1">Track and manage all contracts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Contract
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 text-center">
          <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Contracts</p>
        </div>
        <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 text-center">
          <p className="text-3xl font-bold text-emerald-700">{stats.active}</p>
          <p className="text-sm text-gray-600">Active</p>
        </div>
        <div className="card bg-gradient-to-br from-amber-50 to-amber-100 text-center">
          <p className="text-3xl font-bold text-amber-700">{stats.expiring}</p>
          <p className="text-sm text-gray-600">Expiring Soon</p>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 text-center">
          <p className="text-3xl font-bold text-red-700">{stats.expired}</p>
          <p className="text-sm text-gray-600">Expired</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 text-center">
          <p className="text-3xl font-bold text-purple-700">MVR {(stats.totalValue / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-gray-600">Total Value</p>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Contract</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-left">Duration</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{contract.title}</td>
                  <td className="px-4 py-3">{contract.client}</td>
                  <td className="px-4 py-3">{contract.type}</td>
                  <td className="px-4 py-3 text-right">MVR {contract.value.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {contract.startDate} - {contract.endDate}
                    </div>
                    {contract.renewalDate && (
                      <div className="text-amber-600 text-xs mt-1">
                        Renewal: {contract.renewalDate}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSelectedContract(contract)} className="p-2 hover:bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add New Contract</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Contract Title" className="input w-full" />
              <input type="text" placeholder="Client Name" className="input w-full" />
              <div className="grid grid-cols-2 gap-4">
                <select className="input w-full">
                  <option>Supply</option>
                  <option>Service</option>
                  <option>Construction</option>
                  <option>License</option>
                </select>
                <input type="number" placeholder="Contract Value" className="input w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" placeholder="Start Date" className="input w-full" />
                <input type="date" placeholder="End Date" className="input w-full" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="btn btn-primary flex-1">Save Contract</button>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
