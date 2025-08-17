import React from 'react';
import { 
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import MetricCard from '../components/MetricCard';
import InteractiveMap from '../components/InteractiveMap';
import ActivityFeed from '../components/ActivityFeed';
import { User, Base, Activity, DashboardMetrics } from '../types';

interface DashboardProps {
  user: User;
  bases: Base[];
  activities: Activity[];
  metrics: DashboardMetrics;
}

const Dashboard: React.FC<DashboardProps> = ({ user, bases, activities, metrics }) => {
  const getRoleBasedView = () => {
    switch (user.role) {
      case 'Admin':
        return 'National Overview';
      case 'Commander':
        return `${user.base || 'Base'} Operations`;
      case 'Logistics Officer':
        return 'Pending Tasks';
      default:
        return 'Dashboard';
    }
  };

  const getFilteredBases = () => {
    if (user.role === 'Commander' && user.base) {
      return bases.filter(base => base.name === user.base);
    }
    return bases;
  };

  const getFilteredActivities = () => {
    if (user.role === 'Commander' && user.base) {
      const userBase = bases.find(base => base.name === user.base);
      return activities.filter(activity => activity.baseId === userBase?.id);
    }
    if (user.role === 'Logistics Officer') {
      return activities.filter(activity => 
        activity.type === 'purchase' || activity.type === 'transfer'
      );
    }
    return activities;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getRoleBasedView()}
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user.name}. Here's what's happening with your assets.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>System Operational</span>
          </div>
          <button className="btn-secondary text-sm">
            Export Report
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-3" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              3 assets require immediate attention
            </p>
            <p className="text-sm text-yellow-700">
              Low stock alerts and maintenance overdue items need review.
            </p>
          </div>
          <button className="text-sm text-yellow-800 hover:text-yellow-900 font-medium">
            Review →
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        <MetricCard
          title="Opening Balance"
          value={metrics.openingBalance}
          icon={<ScaleIcon className="w-6 h-6" />}
          color="gray"
          format="number"
        />
        <MetricCard
          title="Purchases"
          value={metrics.purchases}
          change={1250}
          changeType="increase"
          icon={<ShoppingCartIcon className="w-6 h-6" />}
          color="blue"
          format="number"
        />
        <MetricCard
          title="Transfers In"
          value={metrics.transfersIn}
          change={300}
          changeType="increase"
          icon={<ArrowRightIcon className="w-6 h-6" />}
          color="green"
          format="number"
        />
        <MetricCard
          title="Transfers Out"
          value={metrics.transfersOut}
          change={150}
          changeType="decrease"
          icon={<ArrowLeftIcon className="w-6 h-6" />}
          color="yellow"
          format="number"
        />
        <MetricCard
          title="Assigned"
          value={metrics.assigned}
          change={2100}
          changeType="increase"
          icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
          color="blue"
          format="number"
        />
        <MetricCard
          title="Expended"
          value={metrics.expended}
          change={500}
          changeType="increase"
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          color="red"
          format="number"
        />
        <MetricCard
          title="Closing Balance"
          value={metrics.closingBalance}
          change={-2250}
          changeType="decrease"
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          color="green"
          format="number"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map - Takes 2 columns on XL screens */}
        <div className="xl:col-span-2">
          <InteractiveMap 
            bases={getFilteredBases()}
            onBaseSelect={(base) => console.log('Selected base:', base)}
          />
        </div>

        {/* Activity Feed - Takes 1 column on XL screens, full width on smaller */}
        <div className="xl:col-span-1">
          <ActivityFeed activities={getFilteredActivities()} />
        </div>
      </div>

      {/* Quick Actions - Mobile moves this to top, desktop keeps at bottom */}
      <div className="lg:order-last order-first">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-military-300 hover:bg-military-50 transition-all duration-200">
              <ShoppingCartIcon className="w-8 h-8 text-military-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">New Purchase</span>
            </button>
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-military-300 hover:bg-military-50 transition-all duration-200">
              <ArrowRightIcon className="w-8 h-8 text-military-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Transfer Assets</span>
            </button>
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-military-300 hover:bg-military-50 transition-all duration-200">
              <ClipboardDocumentListIcon className="w-8 h-8 text-military-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Assign Equipment</span>
            </button>
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-military-300 hover:bg-military-50 transition-all duration-200">
              <ExclamationTriangleIcon className="w-8 h-8 text-military-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Report Issue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;