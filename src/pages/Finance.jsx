import { useMemo, useState } from 'react';
import { Wallet, CreditCard, TrendingUp, TrendingDown, DollarSign, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useData } from '../hooks/useData';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('accounts');

  const { bids, loading } = useData();

  const accounts = useMemo(() => {
    const totalBidValue = bids.reduce((sum, b) => sum + (b.bid_amount || 0), 0);
    const wonValue = bids.filter(b => b.result === 'Won').reduce((sum, b) => sum + (b.bid_amount || 0), 0);
    const pendingValue = bids.filter(b => !b.result || b.result === 'Pending').reduce((sum, b) => sum + (b.bid_amount || 0), 0);
    const lostValue = bids.filter(b => b.result === 'Lost').reduce((sum, b) => sum + (b.bid_amount || 0), 0);

    return [
      {
        id: 'ACC-PIPELINE',
        account_name: 'Bid Pipeline (All)',
        account_type: 'Asset',
        balance: totalBidValue,
        last_updated: new Date().toLocaleDateString()
      },
      {
        id: 'ACC-WON',
        account_name: 'Won Bids Value',
        account_type: 'Asset',
        balance: wonValue,
        last_updated: new Date().toLocaleDateString()
      },
      {
        id: 'ACC-PENDING',
        account_name: 'Pending Bids Value',
        account_type: 'Asset',
        balance: pendingValue,
        last_updated: new Date().toLocaleDateString()
      },
      {
        id: 'ACC-LOST',
        account_name: 'Lost Bids Value',
        account_type: 'Liability',
        balance: lostValue,
        last_updated: new Date().toLocaleDateString()
      }
    ];
  }, [bids]);

  const transactions = useMemo(() => {
    return bids
      .map((b) => ({
        id: `TXN-${b.id}`,
        date: b.submission_deadline || b.bid_opening_date || '',
        description: b.tender_title || b.title || 'Bid',
        category: b.category || 'Bid',
        amount: b.bid_amount || 0,
        reference: b.result || b.status || ''
      }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [bids]);

  const budgetSummary = useMemo(() => {
    const wonValue = bids.filter(b => b.result === 'Won').reduce((sum, b) => sum + (b.bid_amount || 0), 0);
    const estimatedCost = wonValue * 0.75;
    const netProfit = wonValue - estimatedCost;
    const profitMargin = wonValue > 0 ? ((netProfit / wonValue) * 100).toFixed(1) : 0;
    return {
      total_revenue: wonValue,
      total_expenses: estimatedCost,
      net_profit: netProfit,
      profit_margin: profitMargin
    };
  }, [bids]);

  const totalAssets = accounts
    .filter(a => a.account_type === 'Asset')
    .reduce((sum, a) => sum + (a.balance || 0), 0);
 
  const totalLiabilities = accounts
    .filter(a => a.account_type === 'Liability')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <img 
            src="/illustrations/Finance-amico.svg" 
            alt="Finance" 
            className="w-16 h-16 object-contain"
            onError={(e) => { e.target.style.display='none'; }}
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finance</h1>
            <p className="text-gray-500 mt-1">Bid-based finance summary</p>
          </div>
        </div>
        {budgetSummary && (
          <div className="card px-6 py-3 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-success-600" />
            <div>
              <p className="text-sm text-gray-500">Net Profit</p>
              <p className="text-xl font-bold text-success-600">MVR {budgetSummary.net_profit?.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {budgetSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-success-50 border-success-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-success-700">MVR {budgetSummary.total_revenue?.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-danger-50 border-danger-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-danger-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-danger-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-xl font-bold text-danger-700">MVR {budgetSummary.total_expenses?.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-primary-50 border-primary-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Wallet className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Assets</p>
                <p className="text-xl font-bold text-primary-700">MVR {totalAssets.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-warning-50 border-warning-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-xl font-bold text-warning-700">{budgetSummary.profit_margin}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'accounts', label: 'Accounts', icon: Wallet },
          { id: 'transactions', label: 'Transactions', icon: CreditCard },
          { id: 'summary', label: 'Budget Summary', icon: PieChart }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Accounts</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Account Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Balance (MVR)</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {accounts.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{account.account_name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            account.account_type === 'Asset' 
                              ? 'bg-success-100 text-success-700' 
                              : 'bg-danger-100 text-danger-700'
                          }`}>
                            {account.account_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {account.balance?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{account.last_updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {accounts.length === 0 && (
                <p className="text-center text-gray-500 py-8">No accounts found</p>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Category</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Amount (MVR)</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">{txn.date}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{txn.description}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            {txn.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {txn.amount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{txn.reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {transactions.length === 0 && (
                <p className="text-center text-gray-500 py-8">No transactions found</p>
              )}
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && budgetSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-success-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ArrowUpRight className="w-5 h-5 text-success-600" />
                      <span className="font-medium text-gray-700">Total Revenue</span>
                    </div>
                    <span className="text-lg font-bold text-success-700">MVR {budgetSummary.total_revenue?.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-danger-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <ArrowDownRight className="w-5 h-5 text-danger-600" />
                      <span className="font-medium text-gray-700">Total Expenses</span>
                    </div>
                    <span className="text-lg font-bold text-danger-700">MVR {budgetSummary.total_expenses?.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-gray-700">Net Profit</span>
                    </div>
                    <span className="text-lg font-bold text-primary-700">MVR {budgetSummary.net_profit?.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-warning-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PieChart className="w-5 h-5 text-warning-600" />
                      <span className="font-medium text-gray-700">Profit Margin</span>
                    </div>
                    <span className="text-lg font-bold text-warning-700">{budgetSummary.profit_margin}%</span>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Accounts</span>
                    <span className="font-bold text-gray-900">{accounts.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Asset Accounts</span>
                    <span className="font-bold text-success-600">
                      {accounts.filter(a => a.account_type === 'Asset').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Liability Accounts</span>
                    <span className="font-bold text-danger-600">
                      {accounts.filter(a => a.account_type === 'Liability').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Transactions</span>
                    <span className="font-bold text-gray-900">{transactions.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Finance;
