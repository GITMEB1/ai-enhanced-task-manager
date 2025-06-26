import { db } from '../config/database';

// Check if we're in development mode without database connection
const isDev = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;

export interface IProject {
  id: string;
  name: string;
  description?: string;
  color: string;
  user_id: string;
  order_index: number;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateProject {
  name: string;
  description?: string;
  color?: string;
  user_id: string;
}

export interface IUpdateProject {
  name?: string;
  description?: string;
  color?: string;
  is_archived?: boolean;
}

export class ProjectModel {
  static tableName = 'projects';

  // Create a new project
  static async create(projectData: ICreateProject): Promise<IProject> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // Return mock project for development mode
      return {
        id: Date.now().toString(),
        name: projectData.name,
        description: projectData.description || '',
        color: projectData.color || '#6b7280',
        user_id: projectData.user_id,
        order_index: 0,
        is_archived: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    if (!db) {
      throw new Error('Database not available');
    }

    // Get the next order index for this user
    const { max_order } = await db(this.tableName)
      .max('order_index as max_order')
      .where({ user_id: projectData.user_id })
      .first() || { max_order: -1 };

    const [project] = await db(this.tableName)
      .insert({
        name: projectData.name,
        description: projectData.description || '',
        color: projectData.color || '#6b7280',
        user_id: projectData.user_id,
        order_index: (max_order || -1) + 1,
        is_archived: false,
      })
      .returning('*');

    return project;
  }

  // Find project by ID with user verification
  static async findById(id: string, userId: string): Promise<IProject | null> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // Return mock project for development mode
      return {
        id,
        name: 'Sample Project',
        description: 'This is a sample project for development',
        color: '#3b82f6',
        user_id: userId,
        order_index: 0,
        is_archived: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    if (!db) return null;

    const project = await db(this.tableName)
      .select('*')
      .where({ id, user_id: userId })
      .first();

    return project || null;
  }

  // Get all projects for a user
  static async findByUser(userId: string, includeArchived: boolean = false): Promise<any[]> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // Return mock projects for development mode
      return [
        {
          id: '1',
          name: 'Personal Tasks',
          description: 'My personal task management',
          color: '#3b82f6',
          user_id: userId,
          order_index: 0,
          is_archived: false,
          task_count: '5',
          completed_tasks: '2',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          name: 'Work Projects',
          description: 'Professional work tasks',
          color: '#10b981',
          user_id: userId,
          order_index: 1,
          is_archived: false,
          task_count: '12',
          completed_tasks: '8',
          created_at: new Date(),
          updated_at: new Date(),
        }
      ];
    }

    if (!db) return [];

    let query = db(this.tableName)
      .select('p.*', 
              db.raw('COUNT(t.id) as task_count'),
              db.raw('COUNT(CASE WHEN t.status = \'completed\' THEN 1 END) as completed_tasks'))
      .from(`${this.tableName} as p`)
      .leftJoin('tasks as t', 'p.id', 't.project_id')
      .where('p.user_id', userId);

    if (!includeArchived) {
      query = query.andWhere('p.is_archived', false);
    }

    return await query
      .groupBy('p.id')
      .orderBy('p.order_index', 'asc')
      .orderBy('p.created_at', 'desc');
  }

  // Update project
  static async update(id: string, userId: string, updates: IUpdateProject): Promise<IProject | null> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // Return mock updated project for development mode
      return {
        id,
        name: updates.name || 'Updated Project',
        description: updates.description || '',
        color: updates.color || '#6b7280',
        user_id: userId,
        order_index: 0,
        is_archived: updates.is_archived || false,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    if (!db) return null;

    const [updatedProject] = await db(this.tableName)
      .where({ id, user_id: userId })
      .update(updates)
      .returning('*');

    return updatedProject || null;
  }

  // Delete project
  static async delete(id: string, userId: string): Promise<boolean> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) return true;
    if (!db) return false;

    // Check if project has tasks
    const taskCount = await db('tasks')
      .count('id as count')
      .where({ project_id: id })
      .first();

    if (taskCount && parseInt(taskCount.count as string) > 0) {
      // Archive instead of delete if it has tasks
      const archived = await this.update(id, userId, { is_archived: true });
      return !!archived;
    }

    const result = await db(this.tableName)
      .where({ id, user_id: userId })
      .del();

    return result > 0;
  }

  // Reorder projects
  static async reorder(userId: string, projectOrders: Array<{ id: string; order_index: number }>): Promise<boolean> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) return true;
    if (!db) return false;

    const trx = await db.transaction();
    
    try {
      for (const { id, order_index } of projectOrders) {
        await trx(this.tableName)
          .where({ id, user_id: userId })
          .update({ order_index });
      }

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      console.error('Reorder projects error:', error);
      return false;
    }
  }

  // Archive/unarchive project
  static async archive(id: string, userId: string, archived: boolean = true): Promise<IProject | null> {
    return await this.update(id, userId, { is_archived: archived });
  }

  // Get project with task statistics
  static async findWithStats(id: string, userId: string): Promise<any | null> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      return {
        id,
        name: 'Sample Project',
        description: 'This is a sample project for development',
        color: '#3b82f6',
        user_id: userId,
        order_index: 0,
        is_archived: false,
        total_tasks: 10,
        completed_tasks: 5,
        pending_tasks: 3,
        in_progress_tasks: 2,
        overdue_tasks: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    if (!db) return null;

    const project = await db(this.tableName)
      .select('p.*',
              db.raw('COUNT(t.id) as total_tasks'),
              db.raw('COUNT(CASE WHEN t.status = \'completed\' THEN 1 END) as completed_tasks'),
              db.raw('COUNT(CASE WHEN t.status = \'pending\' THEN 1 END) as pending_tasks'),
              db.raw('COUNT(CASE WHEN t.status = \'in_progress\' THEN 1 END) as in_progress_tasks'),
              db.raw('COUNT(CASE WHEN t.due_date < NOW() AND t.status != \'completed\' THEN 1 END) as overdue_tasks'))
      .from(`${this.tableName} as p`)
      .leftJoin('tasks as t', 'p.id', 't.project_id')
      .where('p.id', id)
      .andWhere('p.user_id', userId)
      .groupBy('p.id')
      .first();

    return project || null;
  }

  // Get recently updated projects
  static async getRecentlyUpdated(userId: string, limit: number = 5): Promise<IProject[]> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      return [
        {
          id: '1',
          name: 'Recently Updated Project',
          description: 'This project was recently updated',
          color: '#3b82f6',
          user_id: userId,
          order_index: 0,
          is_archived: false,
          created_at: new Date(),
          updated_at: new Date(),
        }
      ];
    }

    if (!db) return [];

    return await db(this.tableName)
      .select('*')
      .where({ user_id: userId, is_archived: false })
      .orderBy('updated_at', 'desc')
      .limit(limit);
  }

  // Search projects
  static async search(userId: string, searchTerm: string): Promise<IProject[]> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      return [
        {
          id: '1',
          name: `Search result for: ${searchTerm}`,
          description: 'This is a search result',
          color: '#3b82f6',
          user_id: userId,
          order_index: 0,
          is_archived: false,
          created_at: new Date(),
          updated_at: new Date(),
        }
      ];
    }

    if (!db) return [];

    return await db(this.tableName)
      .select('*')
      .where({ user_id: userId, is_archived: false })
      .andWhere(function() {
        this.whereILike('name', `%${searchTerm}%`)
            .orWhereILike('description', `%${searchTerm}%`);
      })
      .orderBy('updated_at', 'desc');
  }

  // Get project statistics for user
  static async getStats(userId: string): Promise<any> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      return {
        total_projects: 5,
        active_projects: 3,
        archived_projects: 2,
        total_tasks: 25,
        completed_tasks: 15,
        completion_rate: 60,
        most_active_project: 'Work Projects',
      };
    }

    if (!db) {
      return {
        total_projects: 0,
        active_projects: 0,
        archived_projects: 0,
        total_tasks: 0,
        completed_tasks: 0,
        completion_rate: 0,
        most_active_project: null,
      };
    }

    const stats = await db.raw(`
      SELECT 
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT CASE WHEN p.is_archived = false THEN p.id END) as active_projects,
        COUNT(DISTINCT CASE WHEN p.is_archived = true THEN p.id END) as archived_projects,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END) * 100.0 / COUNT(t.id)), 2) as completion_rate,
        (SELECT name FROM projects WHERE user_id = ? AND is_archived = false ORDER BY updated_at DESC LIMIT 1) as most_active_project
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.user_id = ?
    `, [userId, userId]);

    return stats.rows[0] || {
      total_projects: 0,
      active_projects: 0,
      archived_projects: 0,
      total_tasks: 0,
      completed_tasks: 0,
      completion_rate: 0,
      most_active_project: null,
    };
  }

  // Duplicate project
  static async duplicate(id: string, userId: string, newName?: string): Promise<IProject | null> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      return {
        id: Date.now().toString(),
        name: newName || 'Duplicated Project',
        description: 'This is a duplicated project',
        color: '#3b82f6',
        user_id: userId,
        order_index: 0,
        is_archived: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    if (!db) return null;

    const originalProject = await this.findById(id, userId);
    if (!originalProject) return null;

    const duplicatedProject = await this.create({
      name: newName || `${originalProject.name} (Copy)`,
      description: originalProject.description,
      color: originalProject.color,
      user_id: userId,
    });

    return duplicatedProject;
  }

  // Get used colors
  static async getUsedColors(userId: string): Promise<string[]> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      return ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    }

    if (!db) return [];

    const result = await db(this.tableName)
      .distinct('color')
      .where({ user_id: userId })
      .orderBy('color');

    return result.map(row => row.color);
  }

  // Check if project name is unique
  static async isNameUnique(userId: string, name: string, excludeId?: string): Promise<boolean> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      const mockProjects = ['Personal Tasks', 'Work Projects'];
      return !mockProjects.includes(name);
    }

    if (!db) return true;

    let query = db(this.tableName)
      .select('id')
      .where({ user_id: userId, name });

    if (excludeId) {
      query = query.whereNot('id', excludeId);
    }

    const existing = await query.first();
    return !existing;
  }
}

export default ProjectModel; 