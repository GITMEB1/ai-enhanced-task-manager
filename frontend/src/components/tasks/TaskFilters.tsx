import React from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { Search, Filter, X } from 'lucide-react';

export const TaskFilters: React.FC = () => {
  const {
    projects,
    tags,
    selectedProject,
    selectedTags,
    selectedStatus,
    searchQuery,
    setSelectedProject,
    setSelectedTags,
    setSelectedStatus,
    setSearchQuery,
  } = useTaskStore();

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const clearFilters = () => {
    setSelectedProject(null);
    setSelectedTags([]);
    setSelectedStatus(null);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedProject || selectedTags.length > 0 || selectedStatus || searchQuery;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus || ''}
          onChange={(e) => setSelectedStatus(e.target.value || null)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {/* Project Filter */}
        <select
          value={selectedProject || ''}
          onChange={(e) => setSelectedProject(e.target.value || null)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        {/* Priority Filter - using selectedStatus temporarily */}
        <select
          className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Tag Filters */}
      {tags.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Tags:
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTags.includes(tag.id)
                    ? 'text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:text-white'
                }`}
                style={{
                  backgroundColor: selectedTags.includes(tag.id) 
                    ? tag.color 
                    : tag.color + '20',
                  borderColor: tag.color,
                  border: `1px solid ${tag.color}`,
                }}
              >
                {tag.name}
                {selectedTags.includes(tag.id) && (
                  <X size={12} className="ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 