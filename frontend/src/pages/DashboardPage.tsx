import React from 'react';
import { ApiTest } from '../components/ApiTest';
import { StyleTest } from '../components/StyleTest';

export const DashboardPage: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome to your task management dashboard
        </p>
      </div>

      <StyleTest />

      <ApiTest />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Quick Stats
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your task overview will appear here
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Recent Tasks
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your recent tasks will appear here
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Projects
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your active projects will appear here
          </p>
        </div>
      </div>
    </div>
  );
}; 