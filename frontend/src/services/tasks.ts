import api from './api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  project_id?: string;
  user_id: string;
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  user_id: string;
  task_count: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  user_id: string;
  is_archived: boolean;
  task_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  project_id?: string;
  tag_ids?: string[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: 'todo' | 'in_progress' | 'completed';
}

export const taskService = {
  // Get all tasks
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data.tasks || response.data;
  },

  // Get task by ID
  getTask: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.task || response.data;
  },

  // Create new task
  createTask: async (data: CreateTaskData): Promise<Task> => {
    const response = await api.post('/tasks', data);
    return response.data.task || response.data;
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskData): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data.task || response.data;
  },

  // Delete task
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // Get projects
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data.projects || response.data;
  },

  // Create new project
  createProject: async (data: { name: string; description?: string; color: string }): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data.project || response.data;
  },

  // Update project
  updateProject: async (id: string, data: { name?: string; description?: string; color?: string; is_archived?: boolean }): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data.project || response.data;
  },

  // Delete project
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  // Get tags
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get('/tags');
    return response.data.tags || response.data;
  },

  // Create new tag
  createTag: async (data: { name: string; color: string }): Promise<Tag> => {
    const response = await api.post('/tags', data);
    return response.data.tag || response.data;
  },

  // Update tag
  updateTag: async (id: string, data: { name?: string; color?: string }): Promise<Tag> => {
    const response = await api.put(`/tags/${id}`, data);
    return response.data.tag || response.data;
  },

  // Delete tag
  deleteTag: async (id: string): Promise<void> => {
    await api.delete(`/tags/${id}`);
  },
}; 