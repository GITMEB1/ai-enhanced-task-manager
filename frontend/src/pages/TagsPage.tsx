import React, { useEffect, useState } from 'react';
import { useTagStore } from '../stores/tagStore';
import { TagList } from '../components/tags/TagList';
import { TagForm } from '../components/tags/TagForm';
import { Tag } from '../services/tasks';
import { Plus, RefreshCw, Tag as TagIcon } from 'lucide-react';

export const TagsPage: React.FC = () => {
  const { fetchTags, loading, error, clearError } = useTagStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | undefined>(undefined);

  useEffect(() => {
    // Fetch tags when page loads
    fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    // Clear any errors when component mounts
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleCreateTag = () => {
    setEditingTag(undefined);
    setIsFormOpen(true);
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTag(undefined);
  };

  const handleRefresh = () => {
    fetchTags();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TagIcon size={28} />
            Tags
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create and manage tags to categorize your tasks
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          
          <button
            onClick={handleCreateTag}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={16} />
            New Tag
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Tag List */}
      <TagList onEditTag={handleEditTag} />

      {/* Tag Form Modal */}
      <TagForm
        tag={editingTag}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  );
}; 