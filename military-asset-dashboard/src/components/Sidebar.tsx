import React from 'react';
import {
  HomeIcon,
  ShoppingCartIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CogIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    icon: HomeIcon,
    key: 'dashboard',
    description: 'Overview & metrics'
  },
  {
    name: 'Purchases',
    icon: ShoppingCartIcon,
    key: 'purchases',
    description: 'Asset procurement'
  },
  {
    name: 'Transfers',
    icon: ArrowsRightLeftIcon,
    key: 'transfers',
    description: 'Inter-base movements'
  },
  {
    name: 'Assignments & Expenditures',
    icon: ClipboardDocumentListIcon,
    key: 'assignments',
    description: 'Asset allocation'
  },
  {
    name: 'Reports',
    icon: ChartBarIcon,
    key: 'reports',
    description: 'Analytics & insights'
  },
  {
    name: 'Settings',
    icon: CogIcon,
    key: 'settings',
    description: 'System configuration'
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPage, onPageChange }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.key;
              
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onPageChange(item.key);
                    onClose(); // Close mobile menu after selection
                  }}
                  className={clsx(
                    'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    isActive
                      ? 'bg-military-50 text-military-700 border-r-2 border-military-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className={clsx(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-military-600' : 'text-gray-500'
                  )} />
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 hidden lg:block">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 bg-military-50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-military-600 rounded-full">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-military-900">System Status</p>
                <p className="text-xs text-military-600">All systems operational</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;