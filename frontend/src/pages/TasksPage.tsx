import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { TaskList } from '../components/tasks/TaskList';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskForm } from '../components/tasks/TaskForm';
import { Task } from '../services/tasks';
import { Plus, RefreshCw } from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { fetchTasks, fetchProjects, fetchTags, loading, error, clearError } = useTaskStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    // Fetch all data when page loads
    fetchTasks();
    fetchProjects();
    fetchTags();
  }, [fetchTasks, fetchProjects, fetchTags]);

  useEffect(() => {
    // Clear any errors when component mounts
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleRefresh = () => {
    fetchTasks();
    fetchProjects();
    fetchTags();
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tasks
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your tasks and to-do items
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            
            <button
              onClick={handleCreateTask}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <TaskFilters />

      {/* Task List */}
      <TaskList onEditTask={handleEditTask} />

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  );
}; 