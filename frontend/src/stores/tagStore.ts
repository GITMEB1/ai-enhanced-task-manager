import { create } from 'zustand';
import { taskService, Tag } from '../services/tasks';

interface CreateTagData {
  name: string;
  color: string;
}

interface UpdateTagData {
  name?: string;
  color?: string;
}

interface TagStore {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  selectedTag: Tag | null;

  // Actions
  fetchTags: () => Promise<void>;
  createTag: (tag: CreateTagData) => Promise<void>;
  updateTag: (id: string, updates: UpdateTagData) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  
  // UI State
  setSelectedTag: (tag: Tag | null) => void;
  clearError: () => void;
  
  // Utils
  getTagById: (id: string) => Tag | undefined;
  getTagsByIds: (ids: string[]) => Tag[];
  searchTags: (query: string) => Tag[];
}

// Predefined color palette for tags
export const TAG_COLORS = [
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

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],
  loading: false,
  error: null,
  selectedTag: null,

  fetchTags: async () => {
    set({ loading: true, error: null });
    try {
      const tags = await taskService.getTags();
      set({ tags, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tags', 
        loading: false 
      });
    }
  },

  createTag: async (tagData: CreateTagData) => {
    set({ loading: true, error: null });
    try {
      const newTag = await taskService.createTag(tagData);
      set(state => ({ 
        tags: [...state.tags, newTag], 
        loading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create tag', 
        loading: false 
      });
      throw error;
    }
  },

  updateTag: async (id: string, updates: UpdateTagData) => {
    set({ loading: true, error: null });
    try {
      const updatedTag = await taskService.updateTag(id, updates);
      set(state => ({
        tags: state.tags.map(tag => 
          tag.id === id ? updatedTag : tag
        ),
        selectedTag: state.selectedTag?.id === id ? updatedTag : state.selectedTag,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update tag', 
        loading: false 
      });
      throw error;
    }
  },

  deleteTag: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await taskService.deleteTag(id);
      set(state => ({
        tags: state.tags.filter(tag => tag.id !== id),
        selectedTag: state.selectedTag?.id === id ? null : state.selectedTag,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete tag', 
        loading: false 
      });
      throw error;
    }
  },

  setSelectedTag: (tag: Tag | null) => {
    set({ selectedTag: tag });
  },

  clearError: () => {
    set({ error: null });
  },

  getTagById: (id: string) => {
    return get().tags.find(tag => tag.id === id);
  },

  getTagsByIds: (ids: string[]) => {
    const { tags } = get();
    return tags.filter(tag => ids.includes(tag.id));
  },

  searchTags: (query: string) => {
    const { tags } = get();
    if (!query.trim()) return tags;
    
    const searchLower = query.toLowerCase();
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchLower)
    );
  },
})); 