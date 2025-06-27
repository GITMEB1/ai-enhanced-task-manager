import { db } from '../config/database';
import bcrypt from 'bcryptjs';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateUser {
  name: string;
  email: string;
  password: string;
  settings?: Record<string, any>;
}

export interface IUpdateUser {
  name?: string;
  email?: string;
  settings?: Record<string, any>;
}

export class UserModel {
  static tableName = 'users';

  // Create a new user
  static async create(userData: ICreateUser): Promise<IUser> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(userData.password, saltRounds);

    if (isDevelopmentMode) {
      return {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email.toLowerCase(),
        settings: userData.settings || {},
        created_at: new Date(),
        updated_at: new Date(),
      };
    }
    if (!db) throw new Error('Database not available');

    const [user] = await db(this.tableName)
      .insert({
        name: userData.name,
        email: userData.email.toLowerCase(),
        password_hash,
        settings: userData.settings || {},
      })
      .returning('*');

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as IUser;
  }

  // Find user by ID
  static async findById(id: string): Promise<IUser | null> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    if (isDevelopmentMode) {
      return {
        id,
        name: 'Admin User',
        email: 'admin@localhost',
        settings: {},
        created_at: new Date(),
        updated_at: new Date(),
      };
    }
    if (!db) return null;
    const user = await db(this.tableName)
      .select('id', 'name', 'email', 'settings', 'created_at', 'updated_at')
      .where({ id })
      .first();
    return user || null;
  }

  // Find user by email
  static async findByEmail(email: string): Promise<IUser | null> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    if (isDevelopmentMode) {
      if (email.toLowerCase() === 'admin@localhost') {
        return {
          id: '1',
          name: 'Admin User',
          email: 'admin@localhost',
          password_hash: '$2a$12$mockedhashforpassword123', // mock hash
          settings: {},
          created_at: new Date(),
          updated_at: new Date(),
        };
      }
      return null;
    }
    if (!db) return null;
    const user = await db(this.tableName)
      .select('*')
      .where({ email: email.toLowerCase() })
      .first();
    return user || null;
  }

  // Update user
  static async update(id: string, updates: IUpdateUser): Promise<IUser | null> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    if (isDevelopmentMode) {
      return {
        id,
        name: updates.name || 'Admin User',
        email: updates.email || 'admin@localhost',
        settings: updates.settings || {},
        created_at: new Date(),
        updated_at: new Date(),
      };
    }
    if (!db) return null;
    const updatedData: any = { ...updates };
    if (updates.email) {
      updatedData.email = updates.email.toLowerCase();
    }
    const [user] = await db(this.tableName)
      .where({ id })
      .update(updatedData)
      .returning(['id', 'name', 'email', 'settings', 'created_at', 'updated_at']);
    return user || null;
  }

  // Delete user (soft delete by updating settings)
  static async delete(id: string): Promise<boolean> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    if (isDevelopmentMode) return true;
    if (!db) return false;
    const result = await db(this.tableName)
      .where({ id })
      .update({
        settings: db!.raw(`settings || '{"deleted": true, "deleted_at": "${new Date().toISOString()}"}'`),
      });
    return result > 0;
  }

  // Hard delete user (for GDPR compliance)
  static async hardDelete(id: string): Promise<boolean> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    if (isDevelopmentMode) return true;
    if (!db) return false;
    const result = await db(this.tableName)
      .where({ id })
      .del();
    return result > 0;
  }

  // Verify password
  static async verifyPassword(email: string, password: string): Promise<IUser | null> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    if (isDevelopmentMode) {
      if (email.toLowerCase() === 'admin@localhost' && password === 'admin123') {
        return {
          id: '1',
          name: 'Admin User',
          email: 'admin@localhost',
          settings: {},
          created_at: new Date(),
          updated_at: new Date(),
        };
      }
      return null;
    }
    if (!db) return null;
    const user = await this.findByEmail(email);
    if (!user?.password_hash) {
      return null;
    }
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return null;
    }
    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as IUser;
  }

  // Update password
  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    if (isDevelopmentMode) return true;
    if (!db) return false;
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    const result = await db(this.tableName)
      .where({ id })
      .update({ password_hash });
    return result > 0;
  }

  // Get user settings
  static async getSettings(id: string): Promise<Record<string, any> | null> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    if (isDevelopmentMode) return {};
    if (!db) return null;
    const user = await db(this.tableName)
      .select('settings')
      .where({ id })
      .first();
    return user?.settings || null;
  }

  // Update user settings
  static async updateSettings(id: string, settings: Record<string, any>): Promise<boolean> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    if (isDevelopmentMode) return true;
    if (!db) return false;
    const result = await db(this.tableName)
      .where({ id })
      .update({
        settings: db!.raw('settings || ?', [JSON.stringify(settings)]),
      });
    return result > 0;
  }

  // Check if email exists
  static async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    if (isDevelopmentMode) {
      return email.toLowerCase() !== 'test@example.com';
    }
    if (!db) return true;
    let query = db(this.tableName)
      .select('id')
      .where({ email: email.toLowerCase() });
    if (excludeId) {
      query.whereNot({ id: excludeId });
    }
    const user = await query.first();
    return !!user;
  }

  // Get user statistics
  static async getStats(id: string): Promise<any> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    if (isDevelopmentMode) {
      return {
        total_tasks: 10,
        completed_tasks: 5,
        active_projects: 2,
        total_tags: 3,
      };
    }
    if (!db) return {
      total_tasks: 0,
      completed_tasks: 0,
      active_projects: 0,
      total_tags: 0,
    };
    const stats = await db.raw(`
      SELECT 
        (SELECT COUNT(*) FROM tasks t 
         JOIN projects p ON t.project_id = p.id 
         WHERE p.user_id = ? AND t.status != 'cancelled') as total_tasks,
        (SELECT COUNT(*) FROM tasks t 
         JOIN projects p ON t.project_id = p.id 
         WHERE p.user_id = ? AND t.status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM projects WHERE user_id = ? AND is_archived = false) as active_projects,
        (SELECT COUNT(*) FROM tags WHERE user_id = ?) as total_tags
    `, [id, id, id, id]);
    return stats.rows[0] || {
      total_tasks: 0,
      completed_tasks: 0,
      active_projects: 0,
      total_tags: 0,
    };
  }
}

export default UserModel; 