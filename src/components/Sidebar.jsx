import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  DollarSign, 
  ShoppingCart, 
  Truck, 
  Building2, 
  LogOut,
  Users,
  Receipt,
  Menu,
  X,
  CheckCircle,
  Clock,
  BarChart3,
  Calculator,
  FolderOpen,
  Calendar,
  FileText as TemplateIcon,
  FileBarChart,
  Briefcase,
  CreditCard,
  CheckSquare,
  MessageSquare,
  Flag,
  Scale,
  AlertTriangle,
  Target,
  Bell,
  History,
  Search,
  MessageCircle,
  Wallet,
  FileStack,
  Brain
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

const Sidebar = () => {
  const { logout, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileMenuOpen && !e.target.closest('.sidebar-container')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/bids', icon: DollarSign, label: 'Projects' },
    { path: '/bids/won', icon: CheckCircle, label: 'Won Projects' },
    { path: '/bids/pending', icon: Clock, label: 'Pending Projects' },
    { path: '/smart-bids', icon: Brain, label: 'Smart Projects AI' },
    { path: '/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders' },
    { path: '/quotations', icon: Receipt, label: 'Quotations' },
    { path: '/procurement', icon: ShoppingCart, label: 'Procurement' },
    { path: '/suppliers', icon: Building2, label: 'Suppliers' },
    { path: '/deliveries', icon: Truck, label: 'Deliveries' },
    { path: '/staff-expense', icon: Wallet, label: 'Staff Expense' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/cost-calculator', icon: Calculator, label: 'Cost Calculator' },
    { path: '/documents', icon: FolderOpen, label: 'Documents' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/templates', icon: TemplateIcon, label: 'Templates' },
    { path: '/reports', icon: FileBarChart, label: 'Reports' },
    { path: '/contracts', icon: Briefcase, label: 'Contracts' },
    { path: '/invoices', icon: CreditCard, label: 'Invoices' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/collaboration', icon: MessageSquare, label: 'Collaboration' },
    { path: '/milestones', icon: Flag, label: 'Milestones' },
    { path: '/bid-comparison', icon: Scale, label: 'Bid Comparison' },
    { path: '/bid-compiler', icon: FileStack, label: 'Bid Compiler' },
    { path: '/risk-assessment', icon: AlertTriangle, label: 'Risk Assessment' },
    { path: '/kpi', icon: Target, label: 'KPI Dashboard' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/chat', icon: MessageCircle, label: 'Team Chat' },
    { path: '/search', icon: Search, label: 'Advanced Search' },
  ];

  // Only show Users and Audit Log links to admins
  if (isAdmin()) {
    navItems.push({ path: '/users', icon: Users, label: 'Users' });
    navItems.push({ path: '/audit-log', icon: History, label: 'Audit Log' });
  }

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`sidebar-container fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img 
              src="/logo/logo.jpeg" 
              alt="Business Watch" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-primary-700">Business Watch</h1>
              <p className="text-xs text-gray-500 hidden lg:block">Tender & Procurement</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-2 lg:p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={18} />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 lg:p-4 border-t border-gray-200">
          <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg">
            <p className="text-xs lg:text-sm font-medium text-gray-700 truncate">Role: {userRole}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
