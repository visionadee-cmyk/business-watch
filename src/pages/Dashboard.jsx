import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  DollarSign, 
  Trophy, 
  Truck, 
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  ShoppingCart,
  Package,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
  Users as UsersIcon
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
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../services/firebase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeProjects: 0,
    submittedBids: 0,
    wonProjects: 0,
    pendingDeliveries: 0,
    completedProjects: 0,
    totalAccounts: 0,
    totalBalance: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    // Capital stats (standalone - not affecting profit)
    totalBorrowed: 0,
    totalPaid: 0,
    outstandingCapital: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [projectStatusData, setProjectStatusData] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expiringSubmissions, setExpiringSubmissions] = useState([]);
  const [expiringRegistrations, setExpiringRegistrations] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time listeners for Recent Activity
    const unsubscribers = setupRealtimeListeners();
    
    // Refresh full dashboard data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    // Refresh when window regains focus
    const handleFocus = () => fetchDashboardData();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      // Clean up real-time listeners
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  const setupRealtimeListeners = () => {
    const unsubscribers = [];
    
    // Real-time listener for bids (most recent 10)
    const bidsQuery = query(collection(db, 'bids'), orderBy('createdAt', 'desc'), limit(10));
    const unsubBids = onSnapshot(bidsQuery, (snapshot) => {
      const bids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateRecentActivity('bid', bids);
    });
    unsubscribers.push(unsubBids);
    
    // Note: Tenders collection removed - using bids collection only
    
    // Real-time listener for deliveries (most recent 10)
    const deliveriesQuery = query(collection(db, 'deliveries'), orderBy('createdAt', 'desc'), limit(10));
    const unsubDeliveries = onSnapshot(deliveriesQuery, (snapshot) => {
      const deliveries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateRecentActivity('delivery', deliveries);
    });
    unsubscribers.push(unsubDeliveries);
    
    // Real-time listener for purchase orders (most recent 10)
    const poQuery = query(collection(db, 'purchaseOrders'), orderBy('createdAt', 'desc'), limit(10));
    const unsubPO = onSnapshot(poQuery, (snapshot) => {
      const pos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateRecentActivity('purchaseOrder', pos);
    });
    unsubscribers.push(unsubPO);
    
    return unsubscribers;
  };

  const updateRecentActivity = (type, items) => {
    setRecentActivity(prev => {
      // Create a map of existing items to avoid duplicates
      const existingMap = new Map(prev.map(item => [`${item.type}-${item.data.id}`, item]));
      
      // Add new items
      items.forEach(item => {
        const key = `${type}-${item.id}`;
        existingMap.set(key, { type, data: item, date: item.createdAt || item.updatedAt || new Date() });
      });
      
      // Convert back to array, sort by date, and take top 20
      return Array.from(existingMap.values())
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20);
    });
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch all collections from Firebase
      // Note: tenders collection removed - using bids only
      const bidsSnapshot = await getDocs(collection(db, 'bids'));
      const deliveriesSnapshot = await getDocs(collection(db, 'deliveries'));
      const purchasesSnapshot = await getDocs(collection(db, 'purchases'));
      const staffExpensesSnapshot = await getDocs(collection(db, 'staffExpenses'));
      const accountsSnapshot = await getDocs(collection(db, 'accounts'));
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
      const budgetsSnapshot = await getDocs(collection(db, 'budgets'));
      const poSnapshot = await getDocs(collection(db, 'purchaseOrders'));
      const capitalSnapshot = await getDocs(collection(db, 'capital'));
      
      // tenders removed - using bids only
      const bids = bidsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const deliveries = deliveriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const purchases = purchasesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const staffExpenses = staffExpensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const accounts = accountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const budgets = budgetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const purchaseOrders = poSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const capitalEntries = capitalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setAccounts(accounts);
      setTransactions(transactions);
      
      // Calculate stats from bids
      const activeProjects = bids.filter(b => b.status === 'Open' || b.status === 'Bidding' || b.status === 'Draft').length;
      const submittedBids = bids.filter(b => b.status === 'Submitted').length;
      const wonProjects = bids.filter(b => b.result === 'Won' || b.status === 'Won').length;
      const pendingDeliveries = deliveries.filter(d => d.status === 'Pending').length;
      const completedProjects = deliveries.filter(d => d.completed).length;
      
      // Calculate financials from bids
      const getAdditionalCostsTotal = (bid) => {
        const list = bid?.additionalCosts || [];
        if (!Array.isArray(list)) return 0;
        return list.reduce((sum, c) => sum + (parseFloat(c?.amount) || 0), 0);
      };

      const totalBidValue = bids.reduce((sum, b) => sum + (b.bidAmount || 0) + getAdditionalCostsTotal(b), 0);
      const totalBidCost = bids.reduce((sum, b) => sum + (b.costEstimate || 0) + getAdditionalCostsTotal(b), 0);
      const totalBidProfit = bids.reduce((sum, b) => sum + (b.profitMargin || 0), 0);
      
      // Won bids financials
      const wonBids = bids.filter(b => b.result === 'Won' || b.status === 'Won');
      const activeWonProjects = bids.filter(b => b.result === 'Won' && (b.status === 'Open' || b.status === 'In Progress')).length;
      const wonBidRevenue = wonBids.reduce((sum, b) => sum + (b.bidAmount || 0) + getAdditionalCostsTotal(b), 0);
      const wonBidCost = wonBids.reduce((sum, b) => sum + (b.costEstimate || 0) + getAdditionalCostsTotal(b), 0);
      const wonBidProfit = wonBids.reduce((sum, b) => sum + (b.profitMargin || 0), 0);

      const totalStaffExpenses = staffExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      const netProfitAfterStaffExpenses = wonBidProfit - totalStaffExpenses;
      
      // Capital calculations (standalone - not affecting profit)
      const totalBorrowed = capitalEntries.reduce((sum, e) => sum + (parseFloat(e.borrowedAmount) || 0), 0);
      const totalPaid = capitalEntries.reduce((sum, e) => sum + (parseFloat(e.paidAmount) || 0), 0);
      const outstandingCapital = totalBorrowed - totalPaid;
      
      // Separate Staff vs Other Party capital
      const staffCapital = capitalEntries.filter(e => e.sourceType === 'Company Staff');
      const otherPartyCapital = capitalEntries.filter(e => e.sourceType !== 'Company Staff');
      
      // Calculate totals by source type
      const staffBorrowed = staffCapital.reduce((sum, e) => sum + (parseFloat(e.borrowedAmount) || 0), 0);
      const staffPaid = staffCapital.reduce((sum, e) => sum + (parseFloat(e.paidAmount) || 0), 0);
      const otherPartyBorrowed = otherPartyCapital.reduce((sum, e) => sum + (parseFloat(e.borrowedAmount) || 0), 0);
      const otherPartyPaid = otherPartyCapital.reduce((sum, e) => sum + (parseFloat(e.paidAmount) || 0), 0);
      
      // Individual staff calculations
      const staffBreakdown = {};
      staffCapital.forEach(entry => {
        const source = entry.source || 'Unknown';
        if (!staffBreakdown[source]) {
          staffBreakdown[source] = { borrowed: 0, paid: 0, balance: 0 };
        }
        staffBreakdown[source].borrowed += parseFloat(entry.borrowedAmount) || 0;
        staffBreakdown[source].paid += parseFloat(entry.paidAmount) || 0;
        staffBreakdown[source].balance = staffBreakdown[source].borrowed - staffBreakdown[source].paid;
      });
      
      const budget = budgets[0] || {};
      const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
      const totalPOValue = purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);
      const poInTransit = purchaseOrders.filter(po => po.deliveryStatus === 'In Transit').length;
      const poReceived = purchaseOrders.filter(po => po.receivingStatus === 'Fully Received').length;
      
      setStats({
        activeProjects,
        submittedBids,
        wonProjects,
        activeWonProjects,
        pendingDeliveries,
        completedProjects,
        totalAccounts: accounts.length,
        totalBalance,
        totalRevenue: wonBidRevenue || budget.total_revenue || 0,
        totalExpenses: (wonBidCost + totalStaffExpenses) || budget.total_expenses || 0,
        netProfit: netProfitAfterStaffExpenses || budget.net_profit || 0,
        totalBidValue,
        totalBidCost,
        totalBidProfit,
        wonBidCount: wonBids.length,
        totalPOValue,
        poCount: purchaseOrders.length,
        poInTransit,
        poReceived,
        // Capital stats (standalone)
        totalBorrowed,
        totalPaid,
        outstandingCapital,
        staffBorrowed,
        staffPaid,
        otherPartyBorrowed,
        otherPartyPaid,
        staffBreakdown
      });

      // Project status data for pie chart (from bids)
      const statusCounts = {
        'Open': bids.filter(b => b.status === 'Open').length,
        'Bidding': bids.filter(b => b.status === 'Bidding').length,
        'Submitted': bids.filter(b => b.status === 'Submitted').length,
        'Won': bids.filter(b => b.result === 'Won' || b.status === 'Won').length,
        'Lost': bids.filter(b => b.result === 'Lost' || b.status === 'Lost').length
      };

      setProjectStatusData([
        { name: 'Open', value: statusCounts['Open'], color: '#3b82f6' },
        { name: 'Bidding', value: statusCounts['Bidding'], color: '#f59e0b' },
        { name: 'Submitted', value: statusCounts['Submitted'], color: '#8b5cf6' },
        { name: 'Won', value: statusCounts['Won'], color: '#22c55e' },
        { name: 'Lost', value: statusCounts['Lost'], color: '#ef4444' }
      ].filter(item => item.value > 0));

      // Profit data - last 6 months (from actual bid data)
      const monthlyData = {};
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = format(date, 'MMM yyyy');
        monthlyData[monthKey] = { month: monthKey, revenue: 0, expenses: 0, profit: 0 };
      }

      bids.forEach(bid => {
        // Use submissionDeadline (due date) for chart grouping, not logged/submitted date
        const dateSource = bid.submissionDeadline || bid.submissionDate || bid.submittedAt || bid.createdAt;
        if (dateSource) {
          try {
            const dateValue = dateSource?.toDate ? dateSource.toDate() : new Date(dateSource);
            if (isNaN(dateValue.getTime())) return; // Skip invalid dates
            const monthKey = format(dateValue, 'MMM yyyy');
            if (monthlyData[monthKey]) {
              monthlyData[monthKey].revenue += (bid.bidAmount || 0) + getAdditionalCostsTotal(bid);
              monthlyData[monthKey].expenses += (bid.costEstimate || 0) + getAdditionalCostsTotal(bid);
              monthlyData[monthKey].profit += bid.profitMargin || 0;
            }
          } catch (e) {
            console.warn('Invalid bid date:', dateSource);
          }
        }
      });

      setProfitData(Object.values(monthlyData));

      // Generate alerts for approaching deadlines (from bids)
      const alertsList = [];
      bids.forEach(bid => {
        if (bid.submissionDeadline) {
          const deadline = new Date(bid.submissionDeadline);
          const daysUntil = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
          if (daysUntil <= 7 && daysUntil > 0 && bid.status !== 'Submitted') {
            alertsList.push({
              type: 'deadline',
              message: `Project "${bid.title}" deadline in ${daysUntil} days`,
              bidId: bid.id,
              severity: daysUntil <= 3 ? 'high' : 'medium'
            });
          }
        }
      });
      setAlerts(alertsList);

      // Recent activity
      const activity = [
        ...bids.map(b => ({ type: 'bid', data: b, date: b.createdAt || b.updatedAt })),
        ...deliveries.map(d => ({ type: 'delivery', data: d, date: d.createdAt || d.updatedAt }))
      ]
        .filter(a => a.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      setRecentActivity(activity);

      // Calculate expiring bids (next 5-6 days)
      const todayDate = new Date();
      const sixDaysFromNow = new Date();
      sixDaysFromNow.setDate(todayDate.getDate() + 6);

      // Expiring submission deadlines
      const expiringSub = bids.filter(bid => {
        if (!bid.submissionDeadline || bid.status === 'Submitted') return false;
        const deadline = new Date(bid.submissionDeadline);
        return deadline >= todayDate && deadline <= sixDaysFromNow;
      }).sort((a, b) => new Date(a.submissionDeadline) - new Date(b.submissionDeadline));
      setExpiringSubmissions(expiringSub);

      // Expiring registration deadlines
      const expiringReg = bids.filter(bid => {
        if (!bid.registrationDeadline || bid.status === 'Registered') return false;
        const deadline = new Date(bid.registrationDeadline);
        return deadline >= todayDate && deadline <= sixDaysFromNow;
      }).sort((a, b) => new Date(a.registrationDeadline) - new Date(b.registrationDeadline));
      setExpiringRegistrations(expiringReg);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const statCards = [
    { title: 'Active Projects', value: stats.activeProjects, icon: FileText, color: 'blue', path: '/bids' },
    { title: 'Won Projects', value: stats.wonProjects, icon: CheckCircle, color: 'green', path: '/bids?filter=won' },
    { title: 'Total Bid Value', value: `MVR ${(stats.totalBidValue || 0).toLocaleString()}`, icon: DollarSign, color: 'purple', path: '/bids' },
    { title: 'Total Revenue', value: `MVR ${(stats.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'green', path: '/accounts' },
    { title: 'Total Cost', value: `MVR ${(stats.totalExpenses || 0).toLocaleString()}`, icon: TrendingDown, color: 'red', path: '/expenses' },
    { title: 'Net Profit', value: `MVR ${(stats.netProfit || 0).toLocaleString()}`, icon: Wallet, color: 'teal', path: '/budget' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'bid': return <DollarSign className="w-5 h-5 text-purple-500" />;
      case 'delivery': return <Truck className="w-5 h-5 text-orange-500" />;
      case 'purchaseOrder': return <ShoppingCart className="w-5 h-5 text-green-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityText = (item) => {
    switch (item.type) {
      case 'bid':
        return `New project "${item.data.title || 'Untitled'}" created`;
      case 'delivery':
        return `Delivery status updated to ${item.data.status}`;
      case 'purchaseOrder':
        return `Purchase Order ${item.data.poNumber} created`;
      default:
        return 'Activity recorded';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img 
            src="/illustrations/At%20the%20office-amico.svg" 
            alt="Dashboard" 
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">Overview of your projects and procurement activities</p>
          </div>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn-secondary flex items-center gap-2 w-full sm:w-auto"
          title="Refresh data"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="card p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => stat.path && navigate(stat.path)}
          >
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

      {/* Capital Summary Section (Standalone - not affecting profit) */}
      <div className="card border-l-4 border-l-purple-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-purple-600" />
            Capital Summary
          </h2>
          <span className="text-xs text-gray-500 bg-purple-50 px-3 py-1 rounded-full">
            Standalone - Does not affect profit calculations
          </span>
        </div>
        
        {/* Overall Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ArrowDownLeft className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Borrowed</p>
                <p className="text-xl font-bold text-blue-700">
                  MVR {(stats.totalBorrowed || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Paid Back</p>
                <p className="text-xl font-bold text-green-700">
                  MVR {(stats.totalPaid || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Wallet className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Outstanding Balance</p>
                <p className="text-xl font-bold text-orange-700">
                  MVR {(stats.outstandingCapital || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown: Other Party (consolidated) */}
        <div className="border-t border-gray-200 pt-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <UsersIcon className="w-4 h-4" />
            Other Party Capital (Consolidated)
          </h3>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Borrowed</p>
                <p className="text-lg font-semibold text-blue-600">
                  MVR {(stats.otherPartyBorrowed || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Paid</p>
                <p className="text-lg font-semibold text-green-600">
                  MVR {(stats.otherPartyPaid || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Outstanding</p>
                <p className="text-lg font-semibold text-orange-600">
                  MVR {((stats.otherPartyBorrowed || 0) - (stats.otherPartyPaid || 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown: Staff (by individual) */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <UsersIcon className="w-4 h-4" />
            Company Staff Capital (By Person)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.staffBreakdown || {}).length > 0 ? (
              Object.entries(stats.staffBreakdown).map(([name, data]) => (
                <div key={name} className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">{name}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Borrowed:</span>
                      <span className="font-medium text-blue-600">
                        MVR {data.borrowed.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Paid:</span>
                      <span className="font-medium text-green-600">
                        MVR {data.paid.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
                      <span className="text-gray-500">Balance:</span>
                      <span className="font-medium text-orange-600">
                        MVR {data.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 col-span-3">No staff capital entries yet</p>
            )}
          </div>
          {/* Staff Totals */}
          <div className="mt-3 bg-indigo-50 p-3 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Total Borrowed (Staff)</p>
                <p className="text-lg font-semibold text-indigo-600">
                  MVR {(stats.staffBorrowed || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Paid (Staff)</p>
                <p className="text-lg font-semibold text-green-600">
                  MVR {(stats.staffPaid || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Outstanding (Staff)</p>
                <p className="text-lg font-semibold text-orange-600">
                  MVR {((stats.staffBorrowed || 0) - (stats.staffPaid || 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
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

      {/* Expiring Bids Section */}
      {(expiringSubmissions.length > 0 || expiringRegistrations.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expiring Submission Deadlines */}
          {expiringSubmissions.length > 0 && (
            <div className="card border-l-4 border-l-red-500">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                Submission Expiring (Next 5-6 Days)
                <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                  {expiringSubmissions.length}
                </span>
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {expiringSubmissions.map((bid, index) => (
                  <div key={bid.id || index} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{bid.title}</p>
                        <p className="text-xs text-gray-500">{bid.authority}</p>
                      </div>
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                        {Math.ceil((new Date(bid.submissionDeadline) - new Date()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Deadline: {bid.submissionDeadline} {bid.submissionTime && `at ${bid.submissionTime}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expiring Registration Deadlines */}
          {expiringRegistrations.length > 0 && (
            <div className="card border-l-4 border-l-orange-500">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Registration Expiring (Next 5-6 Days)
                <span className="ml-auto bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                  {expiringRegistrations.length}
                </span>
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {expiringRegistrations.map((bid, index) => (
                  <div key={bid.id || index} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{bid.title}</p>
                        <p className="text-xs text-gray-500">{bid.authority}</p>
                      </div>
                      <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        {Math.ceil((new Date(bid.registrationDeadline) - new Date()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Registration: {bid.registrationDeadline} {bid.registrationTime && `at ${bid.registrationTime}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Monthly Revenue & Profit</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{fontSize: 10}} />
              <YAxis tick={{fontSize: 10}} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Bar dataKey="profit" fill="#22c55e" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={projectStatusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
                label={{fontSize: 10}}
              >
                {projectStatusData.map((entry, index) => (
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
                    {item.date ? (() => {
                      try {
                        const dateValue = item.date?.toDate ? item.date.toDate() : new Date(item.date);
                        if (isNaN(dateValue.getTime())) return 'Unknown date';
                        return format(dateValue, 'MMM d, yyyy h:mm a');
                      } catch (e) {
                        return 'Unknown date';
                      }
                    })() : 'Unknown date'}
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
