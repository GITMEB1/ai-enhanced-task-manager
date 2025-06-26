import React, { useState } from 'react';
import { useTagStore } from '../../stores/tagStore';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Tag } from '../../services/tasks';
import { Search, Edit, Trash2, Tag as TagIcon } from 'lucide-react';

interface TagListProps {
  onEditTag?: (tag: Tag) => void;
}

export const TagList: React.FC<TagListProps> = ({ onEditTag }) => {
  const { tags, loading, error, deleteTag, searchTags } = useTagStore();
  const [searchQuery, setSearchQuery] = useState('');

  const displayTags = searchQuery ? searchTags(searchQuery) : tags;

  const handleDeleteTag = async (tag: Tag) => {
    if (confirm(`Are you sure you want to delete the tag "${tag.name}"? This will remove it from all tasks.`)) {
      try {
        await deleteTag(tag.id);
      } catch (error) {
        console.error('Failed to delete tag:', error);
      }
    }
  };

  if (loading && tags.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Bar */}
      {tags.length > 0 && (
        <div className="relative mb-6">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Tags Grid */}
      {displayTags.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <TagIcon size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No Tags Found' : 'No Tags Created'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery 
              ? `No tags match "${searchQuery}". Try a different search term.`
              : 'Create your first tag to organize your tasks.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayTags.map((tag) => (
            <div
              key={tag.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              {/* Tag Header */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: tag.color + '20',
                    color: tag.color,
                    border: `1px solid ${tag.color}40`
                  }}
                >
                  {tag.name}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditTag?.(tag)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="Edit tag"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag)}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete tag"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Tag Stats */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>{tag.task_count} tasks</p>
                <p className="text-xs mt-1">
                  Created {new Date(tag.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 