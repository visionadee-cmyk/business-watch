import React, { useState } from 'react';
import { History, User, FileText, Plus, Edit2, Trash2, CheckCircle, XCircle, Filter, Download } from 'lucide-react';

const mockLogs = [
  { id: 1, user: 'Ahmed', action: 'created', target: 'Bid', targetName: 'IT Equipment Supply Bid', timestamp: '2026-03-29 14:30:22', ip: '192.168.1.100' },
  { id: 2, user: 'Fathimath', action: 'updated', target: 'Tender', targetName: 'Office Renovation Tender', timestamp: '2026-03-29 13:15:45', ip: '192.168.1.101' },
  { id: 3, user: 'Ahmed', action: 'deleted', target: 'Document', targetName: 'old_proposal_v1.pdf', timestamp: '2026-03-28 16:20:10', ip: '192.168.1.100' },
  { id: 4, user: 'System', action: 'sent', target: 'Notification', targetName: 'Deadline Reminder', timestamp: '2026-03-28 09:00:00', ip: 'system' },
  { id: 5, user: 'Fathimath', action: 'submitted', target: 'Bid', targetName: 'Medical Supplies Bid', timestamp: '2026-03-27 11:45:33', ip: '192.168.1.101' },
  { id: 6, user: 'Ahmed', action: 'updated', target: 'Supplier', targetName: 'Tech Solutions Ltd', timestamp: '2026-03-27 10:30:15', ip: '192.168.1.100' },
  { id: 7, user: 'Fathimath', action: 'created', target: 'Invoice', targetName: 'INV-2026-005', timestamp: '2026-03-26 15:20:00', ip: '192.168.1.101' },
  { id: 8, user: 'Ahmed', action: 'approved', target: 'Contract', targetName: 'Maintenance Agreement', timestamp: '2026-03-26 14:10:22', ip: '192.168.1.100' },
];

export default function AuditLog() {
  const [logs, setLogs] = useState(mockLogs);
  const [filter, setFilter] = useState('all');

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.action === filter);

  const getActionIcon = (action) => {
    switch(action) {
      case 'created': return <Plus className="w-4 h-4 text-emerald-500" />;
      case 'updated': return <Edit2 className="w-4 h-4 text-blue-500" />;
      case 'deleted': return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'submitted': return <CheckCircle className="w-4 h-4 text-purple-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'created': return 'text-emerald-600 bg-emerald-50';
      case 'updated': return 'text-blue-600 bg-blue-50';
      case 'deleted': return 'text-red-600 bg-red-50';
      case 'submitted': return 'text-purple-600 bg-purple-50';
      case 'approved': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-500 mt-1">Track all system activities</p>
        </div>
        <button className="btn btn-secondary flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Log
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-gray-50 to-gray-100 text-center">
          <History className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-700">{logs.length}</p>
          <p className="text-sm text-gray-600">Total Entries</p>
        </div>
        <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 text-center">
          <Plus className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-emerald-700">{logs.filter(l => l.action === 'created').length}</p>
          <p className="text-sm text-gray-600">Created</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 text-center">
          <Edit2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-blue-700">{logs.filter(l => l.action === 'updated').length}</p>
          <p className="text-sm text-gray-600">Updated</p>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 text-center">
          <Trash2 className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-red-700">{logs.filter(l => l.action === 'deleted').length}</p>
          <p className="text-sm text-gray-600">Deleted</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <div className="flex gap-2 flex-wrap">
          {['all', 'created', 'updated', 'deleted', 'submitted', 'approved'].map((f) => (
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

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Target</th>
                <th className="px-4 py-3 text-left">Details</th>
                <th className="px-4 py-3 text-left">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{log.timestamp}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm">
                        {log.user[0]}
                      </div>
                      <span>{log.user}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{log.target}</td>
                  <td className="px-4 py-3 font-medium">{log.targetName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
