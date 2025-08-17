import React from 'react';
import { 
  ShoppingCartIcon, 
  ArrowsRightLeftIcon, 
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Activity } from '../types';
import { clsx } from 'clsx';

interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, className }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'purchase':
        return <ShoppingCartIcon className="w-5 h-5 text-blue-600" />;
      case 'transfer':
        return <ArrowsRightLeftIcon className="w-5 h-5 text-green-600" />;
      case 'assignment':
        return <ClipboardDocumentListIcon className="w-5 h-5 text-yellow-600" />;
      case 'expenditure':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ClipboardDocumentListIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'purchase':
        return 'bg-blue-50 border-blue-200';
      case 'transfer':
        return 'bg-green-50 border-green-200';
      case 'assignment':
        return 'bg-yellow-50 border-yellow-200';
      case 'expenditure':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className={clsx('card', className)}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-600">Latest asset management activities</p>
          </div>
          <button className="text-sm text-military-600 hover:text-military-700 font-medium">
            View All
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {/* Timeline line */}
                  {index !== activities.length - 1 && (
                    <span 
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" 
                      aria-hidden="true" 
                    />
                  )}
                  
                  <div className="relative flex items-start space-x-3">
                    {/* Activity icon */}
                    <div className={clsx(
                      'relative flex h-10 w-10 items-center justify-center rounded-full border-2',
                      getActivityColor(activity.type)
                    )}>
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    {/* Activity content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <time className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatTimestamp(activity.timestamp)}
                        </time>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {activity.user}
                        </span>
                        {activity.baseId && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-military-100 text-military-800">
                            Base ID: {activity.baseId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {activities.length === 0 && (
          <div className="text-center py-8">
            <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent activities</p>
          </div>
        )}
      </div>

      {/* Mobile: Show more button */}
      <div className="lg:hidden border-t border-gray-200 p-4">
        <button className="w-full text-center text-sm text-military-600 hover:text-military-700 font-medium py-2">
          Load More Activities
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;