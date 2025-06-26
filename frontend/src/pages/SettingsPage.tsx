import React from 'react';

export const SettingsPage: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account and application preferences
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <p className="text-gray-600 dark:text-gray-400">
          Settings interface will be implemented here
        </p>
      </div>
    </div>
  );
}; 