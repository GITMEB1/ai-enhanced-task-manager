import React from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { TaskCard } from './TaskCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Task } from '../../services/tasks';

interface TaskListProps {
  onEditTask?: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ onEditTask }) => {
  const { getFilteredTasks, loading, error } = useTaskStore();
  
  const filteredTasks = getFilteredTasks();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No tasks found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Get started by creating your first task or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredTasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onEdit={onEditTask}
        />
      ))}
    </div>
  );
}; 