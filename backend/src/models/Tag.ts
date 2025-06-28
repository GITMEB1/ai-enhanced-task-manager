import { db } from '../config/database';
import { log } from '../utils/logger';

// Check if we're in development mode without database connection
const isDev = process.env.NODE_ENV === 'development' || !process.env.DB_HOST;

export interface ITag {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateTag {
  name: string;
  color?: string;
  user_id: string;
}

export interface IUpdateTag {
  name?: string;
  color?: string;
}

export class TagModel {
  static tableName = 'tags';

  // Create a new tag
  static async create(tagData: ICreateTag): Promise<ITag> {
    // Check if we're in development mode or if database is not available
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // Return mock tag for development mode
      const mockTag: ITag = {
        id: Date.now().toString(),
        name: tagData.name.toLowerCase().trim().replace(/\s+/g, '-'),
        color: tagData.color || '#6b7280',
        user_id: tagData.user_id,
        created_at: new Date(),
        updated_at: new Date(),
      };
      return mockTag;
    }

    // Normalize tag name
    const normalizedName = tagData.name.toLowerCase().trim().replace(/\s+/g, '-');

    if (!db) {
      throw new Error('Database not available');
    }

    const [tag] = await db(this.tableName)
      .insert({
        name: normalizedName,
        color: tagData.color || '#6b7280',
        user_id: tagData.user_id,
      })
      .returning('*');

    return tag;
  }

  // Find tag by ID with user verification
  static async findById(id: string, userId: string): Promise<ITag | null> {
    // Check if we're in development mode or if database is not available
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // Return mock tag for development mode
      const mockTags = [
        {
          id: '1',
          name: 'urgent',
          color: '#ef4444',
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          name: 'work',
          color: '#3b82f6',
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '3',
          name: 'personal',
          color: '#10b981',
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
        }
      ];
      return mockTags.find(tag => tag.id === id) || null;
    }

    if (!db) {
      return null;
    }

    const tag = await db(this.tableName)
      .select('*')
      .where({ id, user_id: userId })
      .first();

    return tag || null;
  }

  // Find tag by name with user verification
  static async findByName(name: string, userId: string): Promise<ITag | null> {
    // Check if we're in development mode or if database is not available
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // Return mock tag for development mode
      const mockTags = [
        {
          id: '1',
          name: 'urgent',
          color: '#ef4444',
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          name: 'work',
          color: '#3b82f6',
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '3',
          name: 'personal',
          color: '#10b981',
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date(),
        }
      ];
      const normalizedName = name.toLowerCase().trim().replace(/\s+/g, '-');
      return mockTags.find(tag => tag.name === normalizedName) || null;
    }

    if (!db) {
      return null;
    }

    const normalizedName = name.toLowerCase().trim().replace(/\s+/g, '-');
    
    const tag = await db(this.tableName)
      .select('*')
      .where({ name: normalizedName, user_id: userId })
      .first();

    return tag || null;
  }

  // Get all tags for a user with task counts
  static async findByUser(userId: string): Promise<any[]> {
    log.debug('TagModel.findByUser called', { userId });
    
    // Check if we're in development mode or if database is not available
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    log.debug('Development mode check', { isDevelopmentMode, nodeEnv: process.env.NODE_ENV, hasDbHost: !!process.env.DB_HOST, hasDb: !!db });
    
    if (isDevelopmentMode) {
      log.info('Returning mock tags for development mode', { userId });
      // Return mock tags for development mode
      return [
        {
          id: '1',
          name: 'urgent',
          color: '#ef4444',
          user_id: userId,
          task_count: '3',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          name: 'work',
          color: '#3b82f6',
          user_id: userId,
          task_count: '8',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '3',
          name: 'personal',
          color: '#10b981',
          user_id: userId,
          task_count: '5',
          created_at: new Date(),
          updated_at: new Date(),
        }
      ];
    }

    // This code should not be reached in development mode
    log.debug('Attempting database query for tags', { userId });
    try {
      if (!db) {
        throw new Error('Database not available');
      }
      
      const result = await db(this.tableName)
        .select('*')
        .where('user_id', userId)
        .orderBy('name', 'asc');
      
      log.info('Database query successful for tags', { userId, count: result.length });
      return result;
    } catch (error) {
      log.error('Database error in findByUser, falling back to mock data', { 
        userId, 
        error: (error as Error).message 
      });
      // Return mock tags as fallback
      return [
        {
          id: '1',
          name: 'urgent',
          color: '#ef4444',
          user_id: userId,
          task_count: '3',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          name: 'work',
          color: '#3b82f6',
          user_id: userId,
          task_count: '8',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '3',
          name: 'personal',
          color: '#10b981',
          user_id: userId,
          task_count: '5',
          created_at: new Date(),
          updated_at: new Date(),
        }
      ];
    }
  }

  // Update tag
  static async update(id: string, userId: string, updates: IUpdateTag): Promise<ITag | null> {
    if (!db) return null;
    const updateData: any = { ...updates };
    if (updates.name) {
      updateData.name = updates.name.toLowerCase().trim().replace(/\s+/g, '-');
    }
    const [updatedTag] = await db(this.tableName)
      .where({ id, user_id: userId })
      .update(updateData)
      .returning('*');
    return updatedTag || null;
  }

  // Delete tag
  static async delete(id: string, userId: string): Promise<boolean> {
    if (!db) return false;
    const trx = await db.transaction();
    try {
      await trx('task_tags').whereIn('tag_id', [id]).del();
      const result = await trx(this.tableName).where({ id, user_id: userId }).del();
      await trx.commit();
      return result > 0;
    } catch (error) {
      await trx.rollback();
      return false;
    }
  }

  // Get tags with specific color
  static async findByColor(userId: string, color: string): Promise<ITag[]> {
    if (!db) return [];
    return await db(this.tableName)
      .select('*')
      .where({ user_id: userId, color })
      .orderBy('name', 'asc');
  }

  // Get most used tags
  static async getMostUsed(userId: string, limit: number = 10): Promise<any[]> {
    if (!db) return [];
    return await db(this.tableName)
      .select('t.*', db.raw('COUNT(tt.task_id) as usage_count'))
      .from(`${this.tableName} as t`)
      .leftJoin('task_tags as tt', 't.id', 'tt.tag_id')
      .leftJoin('tasks as task', 'tt.task_id', 'task.id')
      .leftJoin('projects as p', 'task.project_id', 'p.id')
      .where('t.user_id', userId)
      .andWhere(function() {
        this.whereNull('task.id')
            .orWhere('task.user_id', userId)
            .orWhere('p.user_id', userId);
      })
      .groupBy('t.id')
      .havingRaw('COUNT(tt.task_id) > 0')
      .orderBy('usage_count', 'desc')
      .limit(limit);
  }

  // Get unused tags
  static async getUnused(userId: string): Promise<ITag[]> {
    if (!db) return [];
    return await db(this.tableName)
      .select('t.*')
      .from(`${this.tableName} as t`)
      .leftJoin('task_tags as tt', 't.id', 'tt.tag_id')
      .where('t.user_id', userId)
      .whereNull('tt.tag_id')
      .orderBy('t.created_at', 'desc');
  }

  // Get tasks by tag
  static async getTasksByTag(tagId: string, userId: string): Promise<any[]> {
    if (!db) return [];
    const tagCheck = await this.findById(tagId, userId);
    if (!tagCheck) return [];
    return await db('tasks as t')
      .select('t.*', 'p.name as project_name', 'p.color as project_color')
      .leftJoin('projects as p', 't.project_id', 'p.id')
      .join('task_tags as tt', 't.id', 'tt.task_id')
      .where('tt.tag_id', tagId)
      .andWhere(function() {
        this.where('t.user_id', userId)
            .orWhere('p.user_id', userId);
      })
      .orderBy('t.updated_at', 'desc');
  }

  // Search tags
  static async search(userId: string, searchTerm: string): Promise<ITag[]> {
    if (!db) return [];
    return await db(this.tableName)
      .select('*')
      .where({ user_id: userId })
      .andWhereILike('name', `%${searchTerm}%`)
      .orderBy('name', 'asc');
  }

  // Get tag statistics for user
  static async getStats(userId: string): Promise<any> {
    if (!db) return { total_tags: 0, tagged_tasks: 0, avg_usage_per_tag: 0, unique_colors: 0 };
    const stats = await db!.raw(`
      SELECT 
        COUNT(DISTINCT t.id) as total_tags,
        COUNT(DISTINCT tt.task_id) as tagged_tasks,
        AVG(tag_usage.usage_count) as avg_usage_per_tag,
        COUNT(DISTINCT t.color) as unique_colors
      FROM tags t
      LEFT JOIN task_tags tt ON t.id = tt.tag_id
      LEFT JOIN (
        SELECT tag_id, COUNT(task_id) as usage_count
        FROM task_tags
        GROUP BY tag_id
      ) tag_usage ON t.id = tag_usage.tag_id
      WHERE t.user_id = ?
    `, [userId]);
    return stats.rows[0] || { total_tags: 0, tagged_tasks: 0, avg_usage_per_tag: 0, unique_colors: 0 };
  }

  // Get suggested tags based on task content
  static async getSuggestions(userId: string, taskTitle: string, taskDescription?: string): Promise<ITag[]> {
    if (!db) return [];
    const content = `${taskTitle} ${taskDescription || ''}`.toLowerCase();
    const keywords = content.split(/\s+/).filter(word => word.length > 2);
    if (keywords.length === 0) return [];
    return await db!(TagModel.tableName)
      .select('*')
      .where({ user_id: userId })
      .andWhere(function() {
        keywords.forEach(keyword => {
          this.orWhereILike('name', `%${keyword}%`);
        });
      })
      .limit(5)
      .orderBy('name', 'asc');
  }

  // Validate tag name format
  static validateName(name: string): { valid: boolean; error?: string } {
    const normalizedName = name.toLowerCase().trim().replace(/\s+/g, '-');
    
    if (!normalizedName) {
      return { valid: false, error: 'Tag name cannot be empty' };
    }
    
    if (normalizedName.length > 50) {
      return { valid: false, error: 'Tag name cannot exceed 50 characters' };
    }
    
    if (!/^[a-z0-9-]+$/.test(normalizedName)) {
      return { valid: false, error: 'Tag name can only contain lowercase letters, numbers, and hyphens' };
    }
    
    return { valid: true };
  }

  // Check if tag name is unique for user
  static async isNameUnique(userId: string, name: string, excludeId?: string): Promise<boolean> {
    // Check if we're in development mode or if database is not available
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // In development mode, simulate uniqueness check
      const mockTags = ['urgent', 'work', 'personal'];
      const normalizedName = name.toLowerCase().trim().replace(/\s+/g, '-');
      return !mockTags.includes(normalizedName);
    }

    if (!db) {
      return true; // Assume unique if no database
    }

    const normalizedName = name.toLowerCase().trim().replace(/\s+/g, '-');
    
    let query = db(this.tableName)
      .select('id')
      .where({ user_id: userId, name: normalizedName });

    if (excludeId) {
      query = query.whereNot('id', excludeId);
    }

    const existing = await query.first();
    return !existing;
  }

  // Get tag colors used by user (for UI color picker)
  static async getUsedColors(userId: string): Promise<string[]> {
    if (!db) return [];
    const result = await db(this.tableName)
      .distinct('color')
      .where({ user_id: userId })
      .orderBy('color');
    return result.map(row => row.color);
  }

  // Bulk create tags from array of names
  static async bulkCreate(userId: string, tagNames: string[], defaultColor: string = '#6b7280'): Promise<ITag[]> {
    if (!db) return [];
    const tags = tagNames.map(name => ({
      name: name.toLowerCase().trim().replace(/\s+/g, '-'),
      color: defaultColor,
      user_id: userId,
    }));
    const createdTags = await db(this.tableName)
      .insert(tags)
      .returning('*')
      .onConflict(['name', 'user_id'])
      .ignore();
    return createdTags;
  }
}

export default TagModel; 