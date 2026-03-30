import { useEffect, useState } from 'react';
import { 
  FileText, 
  DollarSign, 
  Trophy, 
  Truck, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy,
  limit,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeTenders: 0,
    submittedBids: 0,
    wonTenders: 0,
    pendingDeliveries: 0,
    completedProjects: 0,
    totalAccounts: 0,
    totalBalance: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [tenderStatusData, setTenderStatusData] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all collections from Firebase
      const tendersSnapshot = await getDocs(collection(db, 'tenders'));
      const bidsSnapshot = await getDocs(collection(db, 'bids'));
      const deliveriesSnapshot = await getDocs(collection(db, 'deliveries'));
      const purchasesSnapshot = await getDocs(collection(db, 'purchases'));
      const accountsSnapshot = await getDocs(collection(db, 'accounts'));
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
      const budgetsSnapshot = await getDocs(collection(db, 'budgets'));
      
      const tenders = tendersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const bids = bidsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const deliveries = deliveriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const purchases = purchasesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const accounts = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const budgets = budgetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setAccounts(accounts);
      setTransactions(transactions);
      
      // Calculate stats
      const activeTenders = tenders.filter(t => t.status === 'Open' || t.status === 'Bidding').length;
      const submittedBids = bids.filter(b => b.status === 'Submitted').length;
      const wonTenders = tenders.filter(t => t.status === 'Won').length;
      const pendingDeliveries = deliveries.filter(d => d.status === 'Pending').length;
      const completedProjects = deliveries.filter(d => d.completed).length;
      
      const budget = budgets[0] || {};
      const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
      
      setStats({
        activeTenders,
        submittedBids,
        wonTenders,
        pendingDeliveries,
        completedProjects,
        totalAccounts: accounts.length,
        totalBalance,
        totalRevenue: budget.total_revenue || 0,
        totalExpenses: budget.total_expenses || 0,
        netProfit: budget.net_profit || 0
      });

      // Tender status data for pie chart
      const statusCounts = {
        'Open': tenders.filter(t => t.status === 'Open').length,
        'Bidding': tenders.filter(t => t.status === 'Bidding').length,
        'Submitted': tenders.filter(t => t.status === 'Submitted').length,
        'Won': tenders.filter(t => t.status === 'Won').length,
        'Lost': tenders.filter(t => t.status === 'Lost').length
      };

      setTenderStatusData([
        { name: 'Open', value: statusCounts['Open'], color: '#3b82f6' },
        { name: 'Bidding', value: statusCounts['Bidding'], color: '#f59e0b' },
        { name: 'Submitted', value: statusCounts['Submitted'], color: '#8b5cf6' },
        { name: 'Won', value: statusCounts['Won'], color: '#22c55e' },
        { name: 'Lost', value: statusCounts['Lost'], color: '#ef4444' }
      ].filter(item => item.value > 0));

      // Profit data - last 6 months
      const monthlyData = {};
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = format(date, 'MMM yyyy');
        monthlyData[monthKey] = { month: monthKey, profit: 0, revenue: 0 };
      }

      bids.forEach(bid => {
        if (bid.createdAt) {
          const date = new Date(bid.createdAt);
          const monthKey = format(date, 'MMM yyyy');
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].revenue += bid.bidAmount || 0;
            monthlyData[monthKey].profit += bid.profitMargin || 0;
          }
        }
      });

      setProfitData(Object.values(monthlyData));

      // Generate alerts for approaching deadlines
      const alertsList = [];
      tenders.forEach(tender => {
        if (tender.submissionDeadline) {
          const deadline = new Date(tender.submissionDeadline);
          const daysUntil = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
          if (daysUntil <= 7 && daysUntil > 0 && tender.status !== 'Submitted') {
            alertsList.push({
              type: 'deadline',
              message: `Tender "${tender.title}" deadline in ${daysUntil} days`,
              tenderId: tender.id,
              severity: daysUntil <= 3 ? 'high' : 'medium'
            });
          }
        }
      });
      setAlerts(alertsList);

      // Recent activity
      const activity = [
        ...tenders.map(t => ({ type: 'tender', data: t, date: t.createdAt || t.updatedAt })),
        ...bids.map(b => ({ type: 'bid', data: b, date: b.createdAt || b.updatedAt })),
        ...deliveries.map(d => ({ type: 'delivery', data: d, date: d.createdAt || d.updatedAt }))
      ]
        .filter(a => a.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      setRecentActivity(activity);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const statCards = [
    { title: 'Active Tenders', value: stats.activeTenders, icon: FileText, color: 'blue' },
    { title: 'Won Tenders', value: stats.wonTenders, icon: Trophy, color: 'green' },
    { title: 'Total Accounts', value: stats.totalAccounts, icon: DollarSign, color: 'purple' },
    { title: 'Total Balance', value: `MVR ${stats.totalBalance.toLocaleString()}`, icon: CheckCircle, color: 'teal' },
    { title: 'Net Profit', value: `MVR ${stats.netProfit.toLocaleString()}`, icon: DollarSign, color: 'green' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'tender': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'bid': return <DollarSign className="w-5 h-5 text-purple-500" />;
      case 'delivery': return <Truck className="w-5 h-5 text-orange-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityText = (item) => {
    switch (item.type) {
      case 'tender':
        return `New tender "${item.data.title}" created`;
      case 'bid':
        return `Bid submitted for tender`;
      case 'delivery':
        return `Delivery status updated to ${item.data.status}`;
      default:
        return 'Activity recorded';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your tender and procurement activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning-500" />
            Alerts & Reminders
          </h2>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg flex items-center gap-3 ${
                  alert.severity === 'high' ? 'bg-danger-50 text-danger-700' : 'bg-warning-50 text-warning-700'
                }`}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue & Profit</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Bar dataKey="profit" fill="#22c55e" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tender Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tenderStatusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {tenderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            recentActivity.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                {getActivityIcon(item.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{getActivityText(item)}</p>
                  <p className="text-xs text-gray-500">
                    {item.date ? format(new Date(item.date?.toDate ? item.date.toDate() : item.date), 'MMM d, yyyy h:mm a') : 'Unknown date'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
