import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tenders from './pages/Tenders';
import Bids from './pages/Bids';
import PurchaseOrders from './pages/PurchaseOrders';
import Procurement from './pages/Procurement';
import Suppliers from './pages/Suppliers';
import Deliveries from './pages/Deliveries';
import Documents from './pages/Documents';
import Projects from './pages/Projects';
import TenderSheets from './pages/TenderSheets';
import Quotes from './pages/Quotes';
import Finance from './pages/Finance';
import Quotations from './pages/Quotations';
import UsersPage from './pages/Users';
import Analytics from './pages/Analytics';
import EnhancedSuppliers from './pages/EnhancedSuppliers';
import CostCalculator from './pages/CostCalculator';
import DocumentManager from './pages/DocumentManager';
import CalendarView from './pages/CalendarView';
import BidTemplates from './pages/BidTemplates';
import Reports from './pages/Reports';
import ContractManagement from './pages/ContractManagement';
import InvoiceTracking from './pages/InvoiceTracking';
import TaskManagement from './pages/TaskManagement';
import TeamCollaboration from './pages/TeamCollaboration';
import MilestoneTracker from './pages/MilestoneTracker';
import BidComparison from './pages/BidComparison';
import RiskAssessment from './pages/RiskAssessment';
import KPIDashboard from './pages/KPIDashboard';
import NotificationCenter from './pages/NotificationCenter';
import AuditLog from './pages/AuditLog';
import AdvancedSearch from './pages/AdvancedSearch';
import Chat from './pages/Chat';
import StaffExpense from './pages/StaffExpense';
import BidCompiler from './pages/BidCompiler';

import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/tenders" element={
        <ProtectedRoute>
          <Layout>
            <Tenders />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/bids" element={
        <ProtectedRoute>
          <Layout>
            <Bids />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/bids/won" element={
        <ProtectedRoute>
          <Layout>
            <Bids initialFilter="Won" />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/bids/pending" element={
        <ProtectedRoute>
          <Layout>
            <Bids initialFilter="Pending" />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/quotations" element={
        <ProtectedRoute>
          <Layout>
            <Quotations />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/purchase-orders" element={
        <ProtectedRoute>
          <Layout>
            <PurchaseOrders />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/procurement" element={
        <ProtectedRoute>
          <Layout>
            <Procurement />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/suppliers" element={
        <ProtectedRoute>
          <Layout>
            <Suppliers />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/deliveries" element={
        <ProtectedRoute>
          <Layout>
            <Deliveries />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/staff-expense" element={
        <ProtectedRoute>
          <Layout>
            <StaffExpense />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/documents" element={
        <ProtectedRoute>
          <Layout>
            <Documents />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/projects" element={
        <ProtectedRoute>
          <Layout>
            <Projects />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/tender-sheets" element={
        <ProtectedRoute>
          <Layout>
            <TenderSheets />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/quotes" element={
        <ProtectedRoute>
          <Layout>
            <Quotes />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/finance" element={
        <ProtectedRoute>
          <Layout>
            <Finance />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/suppliers" element={
        <ProtectedRoute>
          <Layout>
            <EnhancedSuppliers />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Layout>
            <Analytics />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/cost-calculator" element={
        <ProtectedRoute>
          <Layout>
            <CostCalculator />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/documents" element={
        <ProtectedRoute>
          <Layout>
            <DocumentManager />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/calendar" element={
        <ProtectedRoute>
          <Layout>
            <CalendarView />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/templates" element={
        <ProtectedRoute>
          <Layout>
            <BidTemplates />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout>
            <Reports />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/contracts" element={
        <ProtectedRoute>
          <Layout>
            <ContractManagement />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/invoices" element={
        <ProtectedRoute>
          <Layout>
            <InvoiceTracking />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/tasks" element={
        <ProtectedRoute>
          <Layout>
            <TaskManagement />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/collaboration" element={
        <ProtectedRoute>
          <Layout>
            <TeamCollaboration />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/milestones" element={
        <ProtectedRoute>
          <Layout>
            <MilestoneTracker />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/bid-comparison" element={
        <ProtectedRoute>
          <Layout>
            <BidComparison />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/bid-compiler" element={
        <ProtectedRoute>
          <Layout>
            <BidCompiler />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/risk-assessment" element={
        <ProtectedRoute>
          <Layout>
            <RiskAssessment />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/kpi" element={
        <ProtectedRoute>
          <Layout>
            <KPIDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Layout>
            <NotificationCenter />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/chat" element={
        <ProtectedRoute>
          <Layout>
            <Chat />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/audit-log" element={
        <ProtectedRoute requireAdmin={true}>
          <Layout>
            <AuditLog />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/search" element={
        <ProtectedRoute>
          <Layout>
            <AdvancedSearch />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute requireAdmin={true}>
          <Layout>
            <UsersPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
