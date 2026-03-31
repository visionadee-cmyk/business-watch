import React, { useState } from 'react';
import { AlertTriangle, Shield, AlertCircle, CheckCircle, TrendingUp, FileText, DollarSign, Clock, Filter } from 'lucide-react';

const mockRisks = [
  { id: 1, tender: 'Construction Project - Resort', category: 'Financial', level: 'High', probability: 'Medium', impact: 'High', description: 'Client payment history shows delays', mitigation: 'Request advance payment', status: 'Open', assignee: 'Ahmed' },
  { id: 2, tender: 'Medical Equipment Supply', category: 'Compliance', level: 'Medium', probability: 'High', impact: 'Medium', description: 'New regulations may affect import', mitigation: 'Consult legal team early', status: 'Monitoring', assignee: 'Fathimath' },
  { id: 3, tender: 'IT Infrastructure Upgrade', category: 'Technical', level: 'Low', probability: 'Low', impact: 'Medium', description: 'Legacy system compatibility issues', mitigation: 'Conduct thorough assessment', status: 'Mitigated', assignee: 'Ahmed' },
  { id: 4, tender: 'Office Supplies Annual Contract', category: 'Operational', level: 'Medium', probability: 'Medium', impact: 'Low', description: 'Supplier capacity constraints', mitigation: 'Identify backup suppliers', status: 'Open', assignee: 'Fathimath' },
];

export default function RiskAssessment() {
  const [risks, setRisks] = useState(mockRisks);
  const [filter, setFilter] = useState('all');

  const stats = {
    total: risks.length,
    high: risks.filter(r => r.level === 'High').length,
    medium: risks.filter(r => r.level === 'Medium').length,
    low: risks.filter(r => r.level === 'Low').length,
    open: risks.filter(r => r.status === 'Open').length,
    mitigated: risks.filter(r => r.status === 'Mitigated').length,
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Mitigated': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'Monitoring': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  const filteredRisks = filter === 'all' ? risks : risks.filter(r => 
    filter === 'high' ? r.level === 'High' :
    filter === 'open' ? r.status === 'Open' :
    r.category.toLowerCase() === filter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Assessment</h1>
          <p className="text-gray-500 mt-1">Identify and mitigate tender risks</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Add Risk
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="card bg-gradient-to-br from-gray-50 to-gray-100 text-center">
          <p className="text-3xl font-bold text-gray-700">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Risks</p>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 text-center">
          <p className="text-3xl font-bold text-red-700">{stats.high}</p>
          <p className="text-sm text-gray-600">High Risk</p>
        </div>
        <div className="card bg-gradient-to-br from-amber-50 to-amber-100 text-center">
          <p className="text-3xl font-bold text-amber-700">{stats.medium}</p>
          <p className="text-sm text-gray-600">Medium Risk</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 text-center">
          <p className="text-3xl font-bold text-blue-700">{stats.low}</p>
          <p className="text-sm text-gray-600">Low Risk</p>
        </div>
        <div className="card bg-gradient-to-br from-amber-50 to-amber-100 text-center">
          <p className="text-3xl font-bold text-amber-700">{stats.open}</p>
          <p className="text-sm text-gray-600">Open</p>
        </div>
        <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 text-center">
          <p className="text-3xl font-bold text-emerald-700">{stats.mitigated}</p>
          <p className="text-sm text-gray-600">Mitigated</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <div className="flex gap-2 flex-wrap">
          {['all', 'high', 'open', 'financial', 'technical', 'operational'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRisks.map((risk) => (
          <div key={risk.id} className={`card border-l-4 ${getLevelColor(risk.level)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{risk.tender}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getLevelColor(risk.level)}`}>
                    {risk.level} Risk
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {risk.category}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">{risk.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Probability:</span>
                    <span className="ml-2 font-medium">{risk.probability}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Impact:</span>
                    <span className="ml-2 font-medium">{risk.impact}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Mitigation:</span>
                    <span className="ml-2 font-medium text-emerald-600">{risk.mitigation}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {getStatusIcon(risk.status)}
                <span className="text-sm text-gray-500">{risk.status}</span>
                <span className="text-xs text-gray-400">Assignee: {risk.assignee}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRisks.length === 0 && (
        <div className="card text-center py-12">
          <Shield className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
          <p className="text-gray-500">No risks found matching your filters</p>
        </div>
      )}
    </div>
  );
}
