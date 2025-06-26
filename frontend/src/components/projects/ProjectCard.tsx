import React from 'react';
import { Project } from '../../services/tasks';
import { useProjectStore } from '../../stores/projectStore';
import { Archive, ArchiveRestore, Edit, Trash2, FolderOpen, Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit }) => {
  const { archiveProject, unarchiveProject, deleteProject } = useProjectStore();

  const handleArchive = async () => {
    try {
      if (project.is_archived) {
        await unarchiveProject(project.id);
      } else {
        await archiveProject(project.id);
      }
    } catch (error) {
      console.error('Failed to toggle project archive status:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this project? This will remove it from all tasks.')) {
      try {
        await deleteProject(project.id);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow ${
      project.is_archived ? 'opacity-60' : ''
    }`}>
      {/* Project Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {project.name}
              {project.is_archived && (
                <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                  Archived
                </span>
              )}
            </h3>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(project)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Edit project"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={handleArchive}
            className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
            title={project.is_archived ? "Unarchive project" : "Archive project"}
          >
            {project.is_archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete project"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <FolderOpen size={14} />
            <span>{project.task_count} tasks</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>Created {formatDate(project.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 