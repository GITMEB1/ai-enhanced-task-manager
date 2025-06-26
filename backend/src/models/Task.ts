import { db } from '../config/database';

// Check if we're in development mode without database connection
const isDev = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;

export interface ITask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project_id?: string;
  parent_task_id?: string;
  user_id: string;
  due_date?: Date;
  completed_at?: Date;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateTask {
  title: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  project_id?: string;
  parent_task_id?: string;
  user_id: string;
  due_date?: Date;
  metadata?: Record<string, any>;
}

export interface IUpdateTask {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  project_id?: string;
  parent_task_id?: string;
  due_date?: Date;
  completed_at?: Date;
  metadata?: Record<string, any>;
}

export interface ITaskFilters {
  project_id?: string;
  status?: string;
  priority?: string;
  tag?: string;
  search?: string;
  due_before?: Date;
  due_after?: Date;
}

export class TaskModel {
  static tableName = 'tasks';

  // Create a new task
  static async create(taskData: ICreateTask): Promise<ITask> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // Return mock task for development mode
      return {
        id: Date.now().toString(),
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        project_id: taskData.project_id,
        parent_task_id: taskData.parent_task_id,
        user_id: taskData.user_id,
        due_date: taskData.due_date,
        completed_at: undefined,
        metadata: taskData.metadata || {},
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    if (!db) {
      throw new Error('Database not available');
    }

    const [task] = await db(this.tableName)
      .insert({
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        project_id: taskData.project_id || null,
        parent_task_id: taskData.parent_task_id || null,
        user_id: taskData.user_id,
        due_date: taskData.due_date || null,
        metadata: taskData.metadata || {},
      })
      .returning('*');

    return task;
  }

  // Find task by ID with user verification
  static async findById(id: string, userId: string): Promise<ITask | null> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // Return mock task for development mode
      return {
        id,
        title: 'Sample Task',
        description: 'This is a sample task for development',
        status: 'pending',
        priority: 'medium',
        project_id: undefined,
        parent_task_id: undefined,
        user_id: userId,
        due_date: new Date(Date.now() + 86400000),
        completed_at: undefined,
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    if (!db) return null;

    const task = await db(this.tableName)
      .select('t.*')
      .from(`${this.tableName} as t`)
      .leftJoin('projects as p', 't.project_id', 'p.id')
      .where('t.id', id)
      .andWhere(function() {
        this.where('t.user_id', userId)
            .orWhere('p.user_id', userId);
      })
      .first();

    return task || null;
  }

  // Get all tasks for a user with filtering
  static async findByUser(userId: string, filters: ITaskFilters = {}): Promise<ITask[]> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // Return mock tasks for development mode
      return [
        {
          id: '1',
          title: 'Sample Task 1',
          description: 'This is a sample task for development',
          status: 'pending',
          priority: 'high',
          project_id: undefined,
          parent_task_id: undefined,
          user_id: userId,
          due_date: new Date(Date.now() + 86400000), // Tomorrow
          completed_at: undefined,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          title: 'Complete Project Setup',
          description: 'Set up the initial project structure',
          status: 'in_progress',
          priority: 'medium',
          project_id: '1',
          parent_task_id: undefined,
          user_id: userId,
          due_date: undefined,
          completed_at: undefined,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        }
      ];
    }

    if (!db) return [];

    let query = db(this.tableName)
      .select('t.*', 'p.name as project_name', 'p.color as project_color')
      .from(`${this.tableName} as t`)
      .leftJoin('projects as p', 't.project_id', 'p.id')
      .where(function() {
        this.where('t.user_id', userId)
            .orWhere('p.user_id', userId);
      });

    // Apply filters
    if (filters.project_id) {
      query = query.andWhere('t.project_id', filters.project_id);
    }

    if (filters.status) {
      query = query.andWhere('t.status', filters.status);
    }

    if (filters.priority) {
      query = query.andWhere('t.priority', filters.priority);
    }

    if (filters.search) {
      query = query.andWhere(function() {
        this.whereILike('t.title', `%${filters.search}%`)
            .orWhereILike('t.description', `%${filters.search}%`);
      });
    }

    if (filters.due_before) {
      query = query.andWhere('t.due_date', '<=', filters.due_before);
    }

    if (filters.due_after) {
      query = query.andWhere('t.due_date', '>=', filters.due_after);
    }

    // Handle tag filtering
    if (filters.tag) {
      query = query
        .join('task_tags as tt', 't.id', 'tt.task_id')
        .join('tags as tag', 'tt.tag_id', 'tag.id')
        .andWhere('tag.name', filters.tag)
        .andWhere('tag.user_id', userId);
    }

    // Order by priority and due date
    query = query.orderByRaw(`
      CASE 
        WHEN t.priority = 'urgent' THEN 1
        WHEN t.priority = 'high' THEN 2
        WHEN t.priority = 'medium' THEN 3
        WHEN t.priority = 'low' THEN 4
      END
    `).orderBy('t.due_date', 'asc');

    return await query;
  }

  // Update task
  static async update(id: string, userId: string, updates: IUpdateTask): Promise<ITask | null> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // Return mock updated task for development mode
      return {
        id,
        title: updates.title || 'Updated Task',
        description: updates.description || '',
        status: updates.status || 'pending',
        priority: updates.priority || 'medium',
        project_id: updates.project_id,
        parent_task_id: updates.parent_task_id,
        user_id: userId,
        due_date: updates.due_date,
        completed_at: updates.completed_at,
        metadata: updates.metadata || {},
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    if (!db) return null;

    const [updatedTask] = await db(this.tableName)
      .where({ id, user_id: userId })
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .returning('*');

    return updatedTask || null;
  }

  // Delete task
  static async delete(id: string, userId: string): Promise<boolean> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) return true;
    if (!db) return false;

    const result = await db(this.tableName)
      .where({ id, user_id: userId })
      .del();

    return result > 0;
  }

  // Find tasks by project
  static async findByProject(projectId: string, userId: string): Promise<ITask[]> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      return [
        {
          id: '1',
          title: 'Project Task 1',
          description: 'Task for the project',
          status: 'pending',
          priority: 'medium',
          project_id: projectId,
          parent_task_id: undefined,
          user_id: userId,
          due_date: new Date(Date.now() + 86400000),
          completed_at: undefined,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        }
      ];
    }

    if (!db) return [];

    return await db(this.tableName)
      .select('*')
      .where({ project_id: projectId, user_id: userId })
      .orderBy('created_at', 'desc');
  }

  // Find subtasks
  static async findSubtasks(parentTaskId: string, userId: string): Promise<ITask[]> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) return [];
    if (!db) return [];

    return await db(this.tableName)
      .select('*')
      .where({ parent_task_id: parentTaskId, user_id: userId })
      .orderBy('created_at', 'asc');
  }

  // Mark task as complete
  static async markComplete(id: string, userId: string): Promise<ITask | null> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      return {
        id,
        title: 'Completed Task',
        description: 'This task has been completed',
        status: 'completed',
        priority: 'medium',
        project_id: undefined,
        parent_task_id: undefined,
        user_id: userId,
        due_date: new Date(),
        completed_at: new Date(),
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    if (!db) return null;

    const [task] = await db(this.tableName)
      .where({ id, user_id: userId })
      .update({
        status: 'completed',
        completed_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return task || null;
  }

  // Get task statistics
  static async getStats(userId: string): Promise<any> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      return {
        total_tasks: 10,
        pending_tasks: 5,
        in_progress_tasks: 3,
        completed_tasks: 2,
        cancelled_tasks: 0,
        overdue_tasks: 1,
        completion_rate: 20,
      };
    }

    if (!db) {
      return {
        total_tasks: 0,
        pending_tasks: 0,
        in_progress_tasks: 0,
        completed_tasks: 0,
        cancelled_tasks: 0,
        overdue_tasks: 0,
        completion_rate: 0,
      };
    }

    const stats = await db.raw(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_tasks,
        COUNT(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 END) as overdue_tasks,
        ROUND((COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2) as completion_rate
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = ? OR p.user_id = ?
    `, [userId, userId]);

    return stats.rows[0] || {
      total_tasks: 0,
      pending_tasks: 0,
      in_progress_tasks: 0,
      completed_tasks: 0,
      cancelled_tasks: 0,
      overdue_tasks: 0,
      completion_rate: 0,
    };
  }

  // Search tasks
  static async search(userId: string, searchTerm: string): Promise<ITask[]> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      return [
        {
          id: '1',
          title: `Search result for: ${searchTerm}`,
          description: 'This is a search result',
          status: 'pending',
          priority: 'medium',
          project_id: undefined,
          parent_task_id: undefined,
          user_id: userId,
          due_date: new Date(),
          completed_at: undefined,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
        }
      ];
    }

    if (!db) return [];

    return await db(this.tableName)
      .select('t.*', 'p.name as project_name')
      .from(`${this.tableName} as t`)
      .leftJoin('projects as p', 't.project_id', 'p.id')
      .where(function() {
        this.where('t.user_id', userId)
            .orWhere('p.user_id', userId);
      })
      .andWhere(function() {
        this.whereILike('t.title', `%${searchTerm}%`)
            .orWhereILike('t.description', `%${searchTerm}%`);
      })
      .orderBy('t.updated_at', 'desc');
  }

  // Add tag to task
  static async addTag(taskId: string, tagId: string, userId: string): Promise<boolean> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) return true;
    if (!db) return false;

    // Verify user owns the task
    const task = await this.findById(taskId, userId);
    if (!task) return false;

    // Check if association already exists
    const existing = await db('task_tags')
      .where({ task_id: taskId, tag_id: tagId })
      .first();

    if (existing) return true;

    await db('task_tags').insert({
      task_id: taskId,
      tag_id: tagId,
    });

    return true;
  }

  // Remove tag from task
  static async removeTag(taskId: string, tagId: string, userId: string): Promise<boolean> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) return true;
    if (!db) return false;

    // Verify user owns the task
    const task = await this.findById(taskId, userId);
    if (!task) return false;

    const result = await db('task_tags')
      .where({ task_id: taskId, tag_id: tagId })
      .del();

    return result > 0;
  }

  // Find tasks with tags
  static async findWithTags(userId: string): Promise<any[]> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      return [
        {
          id: '1',
          title: 'Task with tags',
          description: 'This task has tags',
          status: 'pending',
          priority: 'medium',
          project_id: undefined,
          parent_task_id: undefined,
          user_id: userId,
          due_date: new Date(),
          completed_at: undefined,
          metadata: {},
          created_at: new Date(),
          updated_at: new Date(),
          tags: [
            { id: '1', name: 'urgent', color: '#ef4444' },
            { id: '2', name: 'work', color: '#3b82f6' }
          ]
        }
      ];
    }

    if (!db) return [];

    return await db(this.tableName)
      .select('t.*', 'p.name as project_name', 'p.color as project_color')
      .from(`${this.tableName} as t`)
      .leftJoin('projects as p', 't.project_id', 'p.id')
      .leftJoin('task_tags as tt', 't.id', 'tt.task_id')
      .leftJoin('tags as tag', 'tt.tag_id', 'tag.id')
      .where(function() {
        this.where('t.user_id', userId)
            .orWhere('p.user_id', userId);
      })
      .orderBy('t.updated_at', 'desc');
  }
}

export default TaskModel; 