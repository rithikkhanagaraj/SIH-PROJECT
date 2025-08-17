import React from 'react';
import { CogIcon } from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure system preferences and user settings
        </p>
      </div>

      <div className="card p-6">
        <div className="text-center py-12">
          <CogIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Panel</h3>
          <p className="text-gray-500">System configuration options will be available here.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;