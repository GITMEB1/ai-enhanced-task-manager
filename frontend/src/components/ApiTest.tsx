import React, { useState } from 'react';
import { taskService } from '../services/tasks';
import { useAuthStore } from '../stores/authStore';

export const ApiTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuthStore();

  const testTasks = async () => {
    setLoading(true);
    try {
      const tasks = await taskService.getTasks();
      setResult(`Success! Found ${tasks.length} tasks: ${JSON.stringify(tasks, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  const testProjects = async () => {
    setLoading(true);
    try {
      const projects = await taskService.getProjects();
      setResult(`Success! Found ${projects.length} projects: ${JSON.stringify(projects, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  const testTags = async () => {
    setLoading(true);
    try {
      const tags = await taskService.getTags();
      setResult(`Success! Found ${tags.length} tags: ${JSON.stringify(tags, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">API Connection Test</h3>
      
      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
        <p><strong>User:</strong> {user?.email || 'Not logged in'}</p>
        <p><strong>Token:</strong> {token ? 'Present' : 'Missing'}</p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={testTasks}
          disabled={loading}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Tasks API
        </button>
        <button
          onClick={testProjects}
          disabled={loading}
          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Projects API
        </button>
        <button
          onClick={testTags}
          disabled={loading}
          className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test Tags API
        </button>
      </div>

      {loading && <p>Loading...</p>}
      
      {result && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
          <pre className="text-sm overflow-x-auto">{result}</pre>
        </div>
      )}
    </div>
  );
}; 