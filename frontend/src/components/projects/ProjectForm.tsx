import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { Project } from '../../services/tasks';
import { X, Palette, Mail, Sparkles, Eye } from 'lucide-react';
import { EmailContextSelector } from './EmailContextSelector';
import { integrationAPI } from '../../services/api';

interface ProjectFormProps {
  project?: Project;
  isOpen: boolean;
  onClose: () => void;
}

// Predefined color palette for projects
const PROJECT_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6B7280', // Gray
  '#14B8A6', // Teal
  '#A855F7', // Violet
];

export const ProjectForm: React.FC<ProjectFormProps> = ({ project, isOpen, onClose }) => {
  const { createProject, updateProject, loading } = useProjectStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PROJECT_COLORS[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showEmailSelector, setShowEmailSelector] = useState(false);
  const [selectedEmailThreads, setSelectedEmailThreads] = useState<any[]>([]);
  const [emailContext, setEmailContext] = useState<any>(null);
  const [aiEnhanced, setAiEnhanced] = useState(true);
  const [showContextPreview, setShowContextPreview] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        color: project.color,
      });
      // Reset email context for existing projects
      setSelectedEmailThreads([]);
      setEmailContext(null);
    } else {
      setFormData({
        name: '',
        description: '',
        color: PROJECT_COLORS[0],
      });
      setSelectedEmailThreads([]);
      setEmailContext(null);
    }
    setErrors({});
  }, [project, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.color) {
      newErrors.color = 'Please select a color';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
      };

      if (project) {
        // For existing projects, use regular update
        await updateProject(project.id, projectData);
      } else {
        // For new projects, check if we have email context
        if (selectedEmailThreads.length > 0 && emailContext) {
          // Use enhanced creation with email context
          const enhancedProjectData = {
            ...projectData,
            email_thread_ids: selectedEmailThreads.map(t => t.threadId),
            ai_enhanced: aiEnhanced
          };
          
          await integrationAPI.createProjectWithContext(enhancedProjectData);
          // Refresh projects list
          // Note: In a real app, you'd want to update the store directly
          window.location.reload();
        } else {
          // Use regular creation
          await createProject(projectData);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const handleEmailContextSelect = (threads: any[], context: any) => {
    setSelectedEmailThreads(threads);
    setEmailContext(context);
    setShowEmailSelector(false);
    
    // Auto-enhance description with basic context if no description provided
    if (!formData.description.trim() && context.summary) {
      setFormData(prev => ({
        ...prev,
        description: context.summary
      }));
    }
  };

  const removeEmailContext = () => {
    setSelectedEmailThreads([]);
    setEmailContext(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {project ? 'Edit Project' : 'Create New Project'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Project Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder="Enter project name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Context Section */}
              {!project && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Context (Optional)
                    </h3>
                    {selectedEmailThreads.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => setShowEmailSelector(true)}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Mail size={14} />
                        Add Email Context
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowContextPreview(true)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        >
                          <Eye size={12} />
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={removeEmailContext}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <X size={12} />
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {selectedEmailThreads.length > 0 ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          ✓ {selectedEmailThreads.length} email thread(s) selected
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {emailContext?.summary?.substring(0, 100)}...
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="ai-enhanced"
                          checked={aiEnhanced}
                          onChange={(e) => setAiEnhanced(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="ai-enhanced" className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                          <Sparkles size={14} className="text-blue-500" />
                          AI-Enhanced Description
                        </label>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Select relevant email threads to automatically extract project context, stakeholders, and action items.
                    </p>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={selectedEmailThreads.length > 0 ? 6 : 3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={selectedEmailThreads.length > 0 
                    ? "Description will be enhanced with email context..." 
                    : "Optional description"
                  }
                />
                {selectedEmailThreads.length > 0 && (
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    💡 This description will be enhanced with insights from your selected email threads
                  </p>
                )}
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Palette size={16} className="inline mr-1" />
                  Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color 
                          ? 'border-gray-800 dark:border-white' 
                          : 'border-gray-300 dark:border-gray-600'
                      } hover:scale-110 transition-transform`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                {errors.color && (
                  <p className="mt-1 text-sm text-red-600">{errors.color}</p>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedEmailThreads.length > 0 && aiEnhanced && (
                  <Sparkles size={14} />
                )}
                {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Email Context Selector Modal */}
      <EmailContextSelector
        isOpen={showEmailSelector}
        onClose={() => setShowEmailSelector(false)}
        onSelect={handleEmailContextSelect}
        initialQuery={formData.name}
      />

      {/* Context Preview Modal */}
      {showContextPreview && emailContext && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Email Context Preview
              </h3>
              <button
                onClick={() => setShowContextPreview(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Summary:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{emailContext.summary}</p>
              </div>
              
              {emailContext.keyInsights && emailContext.keyInsights.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Insights:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {emailContext.keyInsights.map((insight: string, index: number) => (
                      <li key={index}>• {insight}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {emailContext.participants && emailContext.participants.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Participants:</h4>
                  <div className="flex flex-wrap gap-2">
                    {emailContext.participants.map((participant: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300"
                      >
                        {participant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {emailContext.actionItems && emailContext.actionItems.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action Items:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {emailContext.actionItems.map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 