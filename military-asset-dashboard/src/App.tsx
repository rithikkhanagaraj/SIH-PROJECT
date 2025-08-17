import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Import mock data
import {
  currentUser,
  bases,
  purchases as initialPurchases,
  transfers as initialTransfers,
  assignments,
  activities,
  dashboardMetrics,
  alerts
} from './data/mockData';

import { Purchase, Transfer } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [purchases, setPurchases] = useState(initialPurchases);
  const [transfers, setTransfers] = useState(initialTransfers);

  const handleAddPurchase = (newPurchase: Omit<Purchase, 'id'>) => {
    const purchase: Purchase = {
      ...newPurchase,
      id: `purchase-${Date.now()}`
    };
    setPurchases(prev => [purchase, ...prev]);
  };

  const handleAddTransfer = (newTransfer: Omit<Transfer, 'id'>) => {
    const transfer: Transfer = {
      ...newTransfer,
      id: `transfer-${Date.now()}`
    };
    setTransfers(prev => [transfer, ...prev]);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            user={currentUser}
            bases={bases}
            activities={activities}
            metrics={dashboardMetrics}
          />
        );
      case 'purchases':
        return (
          <Purchases
            purchases={purchases}
            bases={bases}
            onAddPurchase={handleAddPurchase}
          />
        );
      case 'transfers':
        return (
          <Transfers
            transfers={transfers}
            bases={bases}
            onAddTransfer={handleAddTransfer}
          />
        );
      case 'assignments':
        return (
          <Assignments
            assignments={assignments}
            bases={bases}
          />
        );
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard
            user={currentUser}
            bases={bases}
            activities={activities}
            metrics={dashboardMetrics}
          />
        );
    }
  };

  return (
    <Layout
      user={currentUser}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      alertCount={alerts.length}
    >
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;
