import { create } from 'zustand';
import { taskService, Project } from '../services/tasks';

interface CreateProjectData {
  name: string;
  description?: string;
  color: string;
}

interface UpdateProjectData {
  name?: string;
  description?: string;
  color?: string;
  is_archived?: boolean;
}

interface ProjectStore {
  projects: Project[];
  loading: boolean;
  error: string | null;
  selectedProject: Project | null;

  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (project: CreateProjectData) => Promise<void>;
  updateProject: (id: string, updates: UpdateProjectData) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  unarchiveProject: (id: string) => Promise<void>;
  
  // UI State
  setSelectedProject: (project: Project | null) => void;
  clearError: () => void;
  
  // Utils
  getProjectById: (id: string) => Project | undefined;
  getActiveProjects: () => Project[];
  getArchivedProjects: () => Project[];
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  loading: false,
  error: null,
  selectedProject: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await taskService.getProjects();
      set({ projects, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch projects', 
        loading: false 
      });
    }
  },

  createProject: async (projectData: CreateProjectData) => {
    set({ loading: true, error: null });
    try {
      const newProject = await taskService.createProject(projectData);
      set(state => ({ 
        projects: [...state.projects, newProject], 
        loading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create project', 
        loading: false 
      });
      throw error;
    }
  },

  updateProject: async (id: string, updates: UpdateProjectData) => {
    set({ loading: true, error: null });
    try {
      const updatedProject = await taskService.updateProject(id, updates);
      set(state => ({
        projects: state.projects.map(project => 
          project.id === id ? updatedProject : project
        ),
        selectedProject: state.selectedProject?.id === id ? updatedProject : state.selectedProject,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update project', 
        loading: false 
      });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await taskService.deleteProject(id);
      set(state => ({
        projects: state.projects.filter(project => project.id !== id),
        selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete project', 
        loading: false 
      });
      throw error;
    }
  },

  archiveProject: async (id: string) => {
    await get().updateProject(id, { is_archived: true });
  },

  unarchiveProject: async (id: string) => {
    await get().updateProject(id, { is_archived: false });
  },

  setSelectedProject: (project: Project | null) => {
    set({ selectedProject: project });
  },

  clearError: () => {
    set({ error: null });
  },

  getProjectById: (id: string) => {
    return get().projects.find(project => project.id === id);
  },

  getActiveProjects: () => {
    return get().projects.filter(project => !project.is_archived);
  },

  getArchivedProjects: () => {
    return get().projects.filter(project => project.is_archived);
  },
})); 