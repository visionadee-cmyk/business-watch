import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  DollarSign, 
  ShoppingCart, 
  Truck, 
  Building2, 
  FolderOpen, 
  LogOut,
  Users,
  Briefcase,
  ClipboardList,
  Zap,
  PieChart,
  Receipt
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { logout, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tenders', icon: FileText, label: 'Tenders' },
    { path: '/bids', icon: DollarSign, label: 'Bids' },
    { path: '/quotations', icon: Receipt, label: 'Quotations' },
    { path: '/procurement', icon: ShoppingCart, label: 'Procurement' },
    { path: '/suppliers', icon: Building2, label: 'Suppliers' },
    { path: '/deliveries', icon: Truck, label: 'Deliveries' },
    { path: '/documents', icon: FolderOpen, label: 'Documents' },
  ];

  // Excel Data Navigation
  const excelNavItems = [
    { path: '/projects', icon: Briefcase, label: 'Projects (Hisaabu)' },
    { path: '/tender-sheets', icon: ClipboardList, label: 'Tender Sheets' },
    { path: '/quotes', icon: Zap, label: 'Quotes' },
    { path: '/finance', icon: PieChart, label: 'Finance' },
  ];

  // Only show Users link to admins
  if (isAdmin()) {
    navItems.push({ path: '/users', icon: Users, label: 'Users' });
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-700">Business Watch</h1>
        <p className="text-xs text-gray-500 mt-1">Tender & Procurement</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        
        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Data Views
        </div>
        {excelNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 px-4 py-2 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">Role: {userRole}</p>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-danger-600 hover:bg-danger-50"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
