import { db } from '../config/database';

// Check if we're in development mode without database connection
const isDev = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;

export interface IJournalEntry {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  entry_type: JournalEntryType;
  entry_date: Date;
  time_of_day?: TimeOfDay;
  tags: string[];
  mood_rating?: number;
  energy_level?: number;
  related_task_ids: string[];
  related_project_ids: string[];
  attachments: AttachmentData[];
  metadata: Record<string, any>;
  word_count: number;
  reading_time_minutes: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateJournalEntry {
  title?: string;
  content: string;
  entry_type?: JournalEntryType;
  user_id: string;
  entry_date: Date;
  time_of_day?: TimeOfDay;
  tags?: string[];
  mood_rating?: number;
  energy_level?: number;
  related_task_ids?: string[];
  related_project_ids?: string[];
  attachments?: AttachmentData[];
  metadata?: Record<string, any>;
}

export interface IUpdateJournalEntry {
  title?: string;
  content?: string;
  entry_type?: JournalEntryType;
  entry_date?: Date;
  time_of_day?: TimeOfDay;
  tags?: string[];
  mood_rating?: number;
  energy_level?: number;
  related_task_ids?: string[];
  related_project_ids?: string[];
  attachments?: AttachmentData[];
  metadata?: Record<string, any>;
}

export interface IJournalFilters {
  entry_type?: JournalEntryType;
  date_from?: Date;
  date_to?: Date;
  time_of_day?: TimeOfDay;
  tags?: string[];
  mood_min?: number;
  mood_max?: number;
  energy_min?: number;
  energy_max?: number;
  search?: string;
  related_to_task?: string;
  related_to_project?: string;
  limit?: number;
  offset?: number;
}

export type JournalEntryType = 
  | 'general' 
  | 'reflection' 
  | 'achievement' 
  | 'idea' 
  | 'mood' 
  | 'goal_progress' 
  | 'learning' 
  | 'decision' 
  | 'gratitude';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface AttachmentData {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
}

export class JournalEntryModel {
  static tableName = 'journal_entries';

  // Helper function to calculate reading time
  private static calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Helper function to count words
  private static countWords(content: string): number {
    return content.trim().split(/\s+/).length;
  }

  // Create a new journal entry
  static async create(entryData: ICreateJournalEntry): Promise<IJournalEntry> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    const wordCount = this.countWords(entryData.content);
    const readingTime = this.calculateReadingTime(entryData.content);
    
    if (isDevelopmentMode) {
      // Return mock journal entry for development mode
      return {
        id: Date.now().toString(),
        user_id: entryData.user_id,
        title: entryData.title,
        content: entryData.content,
        entry_type: entryData.entry_type || 'general',
        entry_date: entryData.entry_date,
        time_of_day: entryData.time_of_day,
        tags: entryData.tags || [],
        mood_rating: entryData.mood_rating,
        energy_level: entryData.energy_level,
        related_task_ids: entryData.related_task_ids || [],
        related_project_ids: entryData.related_project_ids || [],
        attachments: entryData.attachments || [],
        metadata: entryData.metadata || {},
        word_count: wordCount,
        reading_time_minutes: readingTime,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    if (!db) {
      throw new Error('Database not available');
    }

    const [entry] = await db(this.tableName)
      .insert({
        user_id: entryData.user_id,
        title: entryData.title || null,
        content: entryData.content,
        entry_type: entryData.entry_type || 'general',
        entry_date: entryData.entry_date,
        time_of_day: entryData.time_of_day || null,
        tags: entryData.tags || [],
        mood_rating: entryData.mood_rating || null,
        energy_level: entryData.energy_level || null,
        related_task_ids: entryData.related_task_ids || [],
        related_project_ids: entryData.related_project_ids || [],
        attachments: entryData.attachments || [],
        metadata: entryData.metadata || {},
        word_count: wordCount,
        reading_time_minutes: readingTime,
      })
      .returning('*');

    return entry;
  }

  // Find journal entry by ID with user verification
  static async findById(id: string, userId: string): Promise<IJournalEntry | null> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // Return mock journal entry for development mode
      return {
        id,
        user_id: userId,
        title: 'Sample Journal Entry',
        content: 'This is a sample journal entry for development. Today was a productive day and I managed to complete several important tasks.',
        entry_type: 'reflection',
        entry_date: new Date(),
        time_of_day: 'evening',
        tags: ['productivity', 'reflection'],
        mood_rating: 8,
        energy_level: 7,
        related_task_ids: [],
        related_project_ids: [],
        attachments: [],
        metadata: {},
        word_count: 25,
        reading_time_minutes: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    if (!db) return null;

    const entry = await db(this.tableName)
      .select('*')
      .where('id', id)
      .andWhere('user_id', userId)
      .first();

    return entry || null;
  }

  // Get all journal entries for a user with filtering
  static async findByUser(userId: string, filters: IJournalFilters = {}): Promise<IJournalEntry[]> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // Return mock journal entries for development mode
      return [
        {
          id: '1',
          user_id: userId,
          title: 'Morning Reflection',
          content: 'Started the day with meditation and planning. Feeling focused and ready to tackle the day ahead.',
          entry_type: 'reflection',
          entry_date: new Date(),
          time_of_day: 'morning',
          tags: ['meditation', 'planning'],
          mood_rating: 8,
          energy_level: 9,
          related_task_ids: [],
          related_project_ids: [],
          attachments: [],
          metadata: {},
          word_count: 20,
          reading_time_minutes: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          user_id: userId,
          title: 'Project Completion',
          content: 'Successfully completed the quarterly project! The team worked really well together and we delivered on time.',
          entry_type: 'achievement',
          entry_date: new Date(Date.now() - 86400000), // Yesterday
          time_of_day: 'evening',
          tags: ['achievement', 'teamwork'],
          mood_rating: 9,
          energy_level: 8,
          related_task_ids: ['1'],
          related_project_ids: ['1'],
          attachments: [],
          metadata: {},
          word_count: 22,
          reading_time_minutes: 1,
          created_at: new Date(Date.now() - 86400000),
          updated_at: new Date(Date.now() - 86400000),
        }
      ];
    }

    if (!db) return [];

    let query = db(this.tableName)
      .select('*')
      .where('user_id', userId)
      .orderBy('entry_date', 'desc')
      .orderBy('created_at', 'desc');

    // Apply filters
    if (filters.entry_type) {
      query = query.andWhere('entry_type', filters.entry_type);
    }

    if (filters.date_from) {
      query = query.andWhere('entry_date', '>=', filters.date_from);
    }

    if (filters.date_to) {
      query = query.andWhere('entry_date', '<=', filters.date_to);
    }

    if (filters.time_of_day) {
      query = query.andWhere('time_of_day', filters.time_of_day);
    }

    if (filters.mood_min !== undefined) {
      query = query.andWhere('mood_rating', '>=', filters.mood_min);
    }

    if (filters.mood_max !== undefined) {
      query = query.andWhere('mood_rating', '<=', filters.mood_max);
    }

    if (filters.energy_min !== undefined) {
      query = query.andWhere('energy_level', '>=', filters.energy_min);
    }

    if (filters.energy_max !== undefined) {
      query = query.andWhere('energy_level', '<=', filters.energy_max);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.andWhere(function() {
        filters.tags!.forEach(tag => {
          this.orWhereRaw('tags @> ?', [JSON.stringify([tag])]);
        });
      });
    }

    if (filters.search) {
      query = query.andWhere(function() {
        this.whereRaw('title ILIKE ?', [`%${filters.search}%`])
            .orWhereRaw('content ILIKE ?', [`%${filters.search}%`]);
      });
    }

    if (filters.related_to_task) {
      query = query.andWhereRaw('related_task_ids @> ?', [JSON.stringify([filters.related_to_task])]);
    }

    if (filters.related_to_project) {
      query = query.andWhereRaw('related_project_ids @> ?', [JSON.stringify([filters.related_to_project])]);
    }

    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const entries = await query;
    return entries;
  }

  // Update journal entry
  static async update(id: string, userId: string, updates: IUpdateJournalEntry): Promise<IJournalEntry | null> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      // Return mock updated entry for development mode
      return {
        id,
        user_id: userId,
        title: updates.title || 'Updated Entry',
        content: updates.content || 'Updated content',
        entry_type: updates.entry_type || 'general',
        entry_date: updates.entry_date || new Date(),
        time_of_day: updates.time_of_day,
        tags: updates.tags || [],
        mood_rating: updates.mood_rating,
        energy_level: updates.energy_level,
        related_task_ids: updates.related_task_ids || [],
        related_project_ids: updates.related_project_ids || [],
        attachments: updates.attachments || [],
        metadata: updates.metadata || {},
        word_count: updates.content ? this.countWords(updates.content) : 0,
        reading_time_minutes: updates.content ? this.calculateReadingTime(updates.content) : 0,
        created_at: new Date(),
        updated_at: new Date(),
      };
    }

    if (!db) return null;

    const updateData: any = { ...updates };
    
    // Recalculate word count and reading time if content is updated
    if (updates.content) {
      updateData.word_count = this.countWords(updates.content);
      updateData.reading_time_minutes = this.calculateReadingTime(updates.content);
    }

    updateData.updated_at = new Date();

    const [entry] = await db(this.tableName)
      .where('id', id)
      .andWhere('user_id', userId)
      .update(updateData)
      .returning('*');

    return entry || null;
  }

  // Delete journal entry
  static async delete(id: string, userId: string): Promise<boolean> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      return true;
    }

    if (!db) return false;

    const result = await db(this.tableName)
      .where('id', id)
      .andWhere('user_id', userId)
      .del();

    return result > 0;
  }

  // Get journal statistics for a user
  static async getStats(userId: string): Promise<any> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      return {
        total_entries: 15,
        total_words: 3450,
        total_reading_time: 18,
        entries_this_month: 8,
        current_streak: 5,
        most_used_tags: ['productivity', 'reflection', 'achievement'],
        average_mood: 7.8,
        average_energy: 7.2,
        entry_types: {
          general: 5,
          reflection: 4,
          achievement: 3,
          idea: 2,
          mood: 1
        }
      };
    }

    if (!db) return {};

    const stats = await db(this.tableName)
      .select(
        db.raw('COUNT(*) as total_entries'),
        db.raw('SUM(word_count) as total_words'),
        db.raw('SUM(reading_time_minutes) as total_reading_time'),
        db.raw('AVG(mood_rating) as average_mood'),
        db.raw('AVG(energy_level) as average_energy')
      )
      .where('user_id', userId)
      .first();

    const thisMonth = await db(this.tableName)
      .count('* as entries_this_month')
      .where('user_id', userId)
      .andWhere('entry_date', '>=', new Date(new Date().getFullYear(), new Date().getMonth(), 1))
      .first();

    const entryTypes = await db(this.tableName)
      .select('entry_type')
      .count('* as count')
      .where('user_id', userId)
      .groupBy('entry_type');

    return {
      ...stats,
      ...thisMonth,
      entry_types: entryTypes.reduce((acc, type) => {
        acc[type.entry_type] = parseInt(String(type.count));
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Search journal entries
  static async search(userId: string, searchTerm: string, limit: number = 10): Promise<IJournalEntry[]> {
    const isDevelopmentMode = process.env.NODE_ENV === 'development' || !process.env.DB_HOST || !db;
    
    if (isDevelopmentMode) {
      return [
        {
          id: '1',
          user_id: userId,
          title: 'Search Result',
          content: `This entry contains the search term: ${searchTerm}`,
          entry_type: 'general',
          entry_date: new Date(),
          time_of_day: 'morning',
          tags: [],
          mood_rating: 7,
          energy_level: 8,
          related_task_ids: [],
          related_project_ids: [],
          attachments: [],
          metadata: {},
          word_count: 10,
          reading_time_minutes: 1,
          created_at: new Date(),
          updated_at: new Date(),
        }
      ];
    }

    if (!db) return [];

    const entries = await db(this.tableName)
      .select('*')
      .where('user_id', userId)
      .andWhere(function() {
        this.whereRaw('title ILIKE ?', [`%${searchTerm}%`])
            .orWhereRaw('content ILIKE ?', [`%${searchTerm}%`]);
      })
      .orderBy('entry_date', 'desc')
      .limit(limit);

    return entries;
  }
}