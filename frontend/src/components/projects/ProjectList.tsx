import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { ProjectCard } from './ProjectCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Project } from '../../services/tasks';
import { Archive, FolderOpen } from 'lucide-react';

interface ProjectListProps {
  onEditProject?: (project: Project) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onEditProject }) => {
  const { projects, loading, error, getActiveProjects, getArchivedProjects } = useProjectStore();
  const [showArchived, setShowArchived] = useState(false);

  const activeProjects = getActiveProjects();
  const archivedProjects = getArchivedProjects();
  const displayProjects = showArchived ? archivedProjects : activeProjects;

  if (loading && projects.length === 0) {
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
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-6">
        <button
          onClick={() => setShowArchived(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !showArchived
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <FolderOpen size={16} />
          Active Projects ({activeProjects.length})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showArchived
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Archive size={16} />
          Archived Projects ({archivedProjects.length})
        </button>
      </div>

      {/* Projects Grid */}
      {displayProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            {showArchived ? <Archive size={24} className="text-gray-400" /> : <FolderOpen size={24} className="text-gray-400" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {showArchived ? 'No Archived Projects' : 'No Active Projects'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {showArchived 
              ? 'You haven\'t archived any projects yet.' 
              : 'Create your first project to organize your tasks.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={onEditProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 