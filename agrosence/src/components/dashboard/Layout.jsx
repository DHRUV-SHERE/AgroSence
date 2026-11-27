import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./DashHeader";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="layout d-flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />

      {/* Main Content */}
      <div
        className={`main-content d-flex flex-column ${isMobile ? 'w-100' : ''}`}
        style={{
          marginLeft: isMobile ? 0 : (isSidebarOpen ? '250px' : '0'),
          width: isMobile ? '100%' : (isSidebarOpen ? 'calc(100% - 250px)' : '100%'),
          transition: "margin 0.3s ease-in-out, width 0.3s ease-in-out",
        }}
      >
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} isMobile={isMobile} />

        {/* Page Content */}
        <main className="content flex-grow-1 p-3" style={{ overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

