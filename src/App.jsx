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
import Users from './pages/Users';
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
      
      <Route path="/users" element={
        <ProtectedRoute requireAdmin={true}>
          <Layout>
            <Users />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
