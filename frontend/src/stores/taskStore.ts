import { create } from 'zustand';
import { taskService, Task, Project, Tag, CreateTaskData, UpdateTaskData } from '../services/tasks';

interface TaskStore {
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
  selectedProject: string | null;
  selectedTags: string[];
  selectedStatus: string | null;
  searchQuery: string;

  // Actions
  fetchTasks: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchTags: () => Promise<void>;
  createTask: (task: CreateTaskData) => Promise<void>;
  updateTask: (id: string, updates: UpdateTaskData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Filters
  setSelectedProject: (projectId: string | null) => void;
  setSelectedTags: (tagIds: string[]) => void;
  setSelectedStatus: (status: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  // Utils
  clearError: () => void;
  getFilteredTasks: () => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  projects: [],
  tags: [],
  loading: false,
  error: null,
  selectedProject: null,
  selectedTags: [],
  selectedStatus: null,
  searchQuery: '',

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskService.getTasks();
      set({ tasks, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tasks', 
        loading: false 
      });
    }
  },

  fetchProjects: async () => {
    try {
      const projects = await taskService.getProjects();
      set({ projects });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  },

  fetchTags: async () => {
    try {
      const tags = await taskService.getTags();
      set({ tags });
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  },

  createTask: async (taskData: CreateTaskData) => {
    set({ loading: true, error: null });
    try {
      const newTask = await taskService.createTask(taskData);
      set(state => ({ 
        tasks: [...state.tasks, newTask], 
        loading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create task', 
        loading: false 
      });
      throw error;
    }
  },

  updateTask: async (id: string, updates: UpdateTaskData) => {
    set({ loading: true, error: null });
    try {
      const updatedTask = await taskService.updateTask(id, updates);
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? updatedTask : task
        ),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update task', 
        loading: false 
      });
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await taskService.deleteTask(id);
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete task', 
        loading: false 
      });
      throw error;
    }
  },

  setSelectedProject: (projectId: string | null) => {
    set({ selectedProject: projectId });
  },

  setSelectedTags: (tagIds: string[]) => {
    set({ selectedTags: tagIds });
  },

  setSelectedStatus: (status: string | null) => {
    set({ selectedStatus: status });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  clearError: () => {
    set({ error: null });
  },

  getFilteredTasks: () => {
    const { tasks, selectedProject, selectedTags, selectedStatus, searchQuery } = get();
    
    return tasks.filter(task => {
      // Project filter
      if (selectedProject && task.project_id !== selectedProject) {
        return false;
      }
      
      // Status filter
      if (selectedStatus && task.status !== selectedStatus) {
        return false;
      }
      
      // Tags filter
      if (selectedTags.length > 0) {
        const taskTagIds = task.tags.map(tag => tag.id);
        const hasSelectedTag = selectedTags.some(tagId => taskTagIds.includes(tagId));
        if (!hasSelectedTag) {
          return false;
        }
      }
      
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const descriptionMatch = task.description?.toLowerCase().includes(searchLower);
        if (!titleMatch && !descriptionMatch) {
          return false;
        }
      }
      
      return true;
    });
  },
})); 