import React, { useState, useEffect } from 'react';
import { useTagStore, TAG_COLORS } from '../../stores/tagStore';
import { Tag } from '../../services/tasks';
import { X, Tag as TagIcon } from 'lucide-react';

interface TagFormProps {
  tag?: Tag;
  isOpen: boolean;
  onClose: () => void;
}

export const TagForm: React.FC<TagFormProps> = ({ tag, isOpen, onClose }) => {
  const { createTag, updateTag, loading } = useTagStore();
  
  const [formData, setFormData] = useState({
    name: '',
    color: TAG_COLORS[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name,
        color: tag.color,
      });
    } else {
      setFormData({
        name: '',
        color: TAG_COLORS[0],
      });
    }
    setErrors({});
  }, [tag, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tag name is required';
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
      const tagData = {
        name: formData.name.trim(),
        color: formData.color,
      };

      if (tag) {
        await updateTag(tag.id, tagData);
      } else {
        await createTag(tagData);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save tag:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {tag ? 'Edit Tag' : 'Create New Tag'}
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
          <div className="space-y-4">
            {/* Tag Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tag Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                }`}
                placeholder="Enter tag name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <TagIcon size={16} className="inline mr-1" />
                Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {TAG_COLORS.map((color) => (
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

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview
              </label>
              <div
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: formData.color + '20',
                  color: formData.color,
                  border: `1px solid ${formData.color}40`
                }}
              >
                {formData.name || 'Tag Name'}
              </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : tag ? 'Update Tag' : 'Create Tag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 