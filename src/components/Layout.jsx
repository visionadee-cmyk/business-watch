import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';

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
        <div className={`flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 ${isMobile ? 'pt-20' : ''}`}>
          {children}
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default Layout;
