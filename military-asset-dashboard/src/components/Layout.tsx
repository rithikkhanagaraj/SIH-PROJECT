import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { User } from '../types';

interface LayoutProps {
  user: User;
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  alertCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ 
  user, 
  children, 
  currentPage, 
  onPageChange, 
  alertCount = 0 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <Navbar 
        user={user} 
        onMenuToggle={toggleSidebar}
        alertCount={alertCount}
      />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;