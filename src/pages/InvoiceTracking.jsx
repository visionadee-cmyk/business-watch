import React, { useState } from 'react';
import { Receipt, Plus, CheckCircle, Clock, AlertCircle, DollarSign, Calendar, Download, FileText } from 'lucide-react';

const mockInvoices = [
  { id: 'INV-2026-001', contract: 'IT Equipment Supply', client: 'Ministry of Education', amount: 1250000, issued: '2026-03-01', due: '2026-03-31', status: 'Paid', paidDate: '2026-03-15' },
  { id: 'INV-2026-002', contract: 'Office Renovation', client: 'State Trading Organization', amount: 900000, issued: '2026-03-10', due: '2026-04-10', status: 'Pending', paidDate: null },
  { id: 'INV-2026-003', contract: 'Quarterly Maintenance', client: 'Maldives Ports Limited', amount: 112500, issued: '2026-03-15', due: '2026-04-15', status: 'Overdue', paidDate: null },
  { id: 'INV-2026-004', contract: 'Software Licenses', client: 'Maldivian Airlines', amount: 80000, issued: '2026-03-20', due: '2026-04-20', status: 'Pending', paidDate: null },
];

const mockPayments = [
  { id: 1, invoice: 'INV-2026-001', amount: 1250000, date: '2026-03-15', method: 'Bank Transfer', reference: 'TRX-987654' },
  { id: 2, invoice: 'INV-2025-089', amount: 450000, date: '2026-02-20', method: 'Cheque', reference: 'CHQ-1234' },
];

export default function InvoiceTracking() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState(mockInvoices);

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'Paid').length,
    pending: invoices.filter(i => i.status === 'Pending').length,
    overdue: invoices.filter(i => i.status === 'Overdue').length,
    totalValue: invoices.reduce((sum, i) => sum + i.amount, 0),
    paidAmount: invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0),
    pendingAmount: invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.amount, 0),
    overdueAmount: invoices.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.amount, 0),
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice & Payment Tracking</h1>
          <p className="text-gray-500 mt-1">Monitor invoices and payments</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 text-center">
          <p className="text-3xl font-bold text-emerald-700">MVR {(stats.paidAmount / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-gray-600">Paid</p>
        </div>
        <div className="card bg-gradient-to-br from-amber-50 to-amber-100 text-center">
          <p className="text-3xl font-bold text-amber-700">MVR {(stats.pendingAmount / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div className="card bg-gradient-to-br from-red-50 to-red-100 text-center">
          <p className="text-3xl font-bold text-red-700">MVR {(stats.overdueAmount / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-gray-600">Overdue</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 text-center">
          <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Invoices</p>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        <button 
          onClick={() => setActiveTab('invoices')}
          className={`pb-2 px-4 font-medium ${activeTab === 'invoices' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Invoices
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`pb-2 px-4 font-medium ${activeTab === 'payments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Payments Received
        </button>
      </div>

      {activeTab === 'invoices' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Invoice #</th>
                  <th className="px-4 py-3 text-left">Contract</th>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-left">Due Date</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{inv.id}</td>
                    <td className="px-4 py-3">{inv.contract}</td>
                    <td className="px-4 py-3">{inv.client}</td>
                    <td className="px-4 py-3 text-right font-medium">MVR {inv.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1 ${inv.status === 'Overdue' ? 'text-red-600' : ''}`}>
                        <Calendar className="w-4 h-4" />
                        {inv.due}
                        {inv.status === 'Overdue' && <AlertCircle className="w-4 h-4" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg" title="Download">
                          <Download className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-2 hover:bg-emerald-50 rounded-lg" title="Mark as Paid">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Payment ID</th>
                  <th className="px-4 py-3 text-left">Invoice</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Reference</th>
                </tr>
              </thead>
              <tbody>
                {mockPayments.map((pay) => (
                  <tr key={pay.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">PAY-{pay.id.toString().padStart(4, '0')}</td>
                    <td className="px-4 py-3">{pay.invoice}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">MVR {pay.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{pay.date}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{pay.method}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">{pay.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
