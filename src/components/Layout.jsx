import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import NotificationBell from './NotificationBell';

const Layout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className={`flex-1 flex flex-col h-screen ${isMobile ? 'ml-0' : ''}`}>
        {/* Header with Notification Bell */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Business Watch</h1>
            <p className="text-sm text-gray-500">Tender Management System</p>
          </div>
          <NotificationBell />
        </div>
        <div className={`flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 ${isMobile ? 'pt-4' : ''}`}>
          {children}
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default Layout;
