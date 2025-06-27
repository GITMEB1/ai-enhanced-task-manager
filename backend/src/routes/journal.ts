import express from 'express';
import { JournalEntryModel, IJournalFilters } from '../models/JournalEntry';
import { authenticateToken } from './auth';

// Extend the Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

const router = express.Router();

// Get all journal entries for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const filters: IJournalFilters = {
      entry_type: req.query.entry_type as any,
      date_from: req.query.date_from ? new Date(req.query.date_from as string) : undefined,
      date_to: req.query.date_to ? new Date(req.query.date_to as string) : undefined,
      time_of_day: req.query.time_of_day as any,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      mood_min: req.query.mood_min ? parseInt(req.query.mood_min as string) : undefined,
      mood_max: req.query.mood_max ? parseInt(req.query.mood_max as string) : undefined,
      energy_min: req.query.energy_min ? parseInt(req.query.energy_min as string) : undefined,
      energy_max: req.query.energy_max ? parseInt(req.query.energy_max as string) : undefined,
      search: req.query.search as string,
      related_to_task: req.query.related_to_task as string,
      related_to_project: req.query.related_to_project as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    };

    const entries = await JournalEntryModel.findByUser(userId, filters);
    res.json(entries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Get specific journal entry by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const entry = await JournalEntryModel.findById(id, userId);
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

// Create new journal entry
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const {
      title,
      content,
      entry_type,
      entry_date,
      time_of_day,
      tags,
      mood_rating,
      energy_level,
      related_task_ids,
      related_project_ids,
      attachments,
      metadata
    } = req.body;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!entry_date) {
      return res.status(400).json({ error: 'Entry date is required' });
    }

    // Validate mood and energy ratings
    if (mood_rating !== undefined && (mood_rating < 1 || mood_rating > 10)) {
      return res.status(400).json({ error: 'Mood rating must be between 1 and 10' });
    }

    if (energy_level !== undefined && (energy_level < 1 || energy_level > 10)) {
      return res.status(400).json({ error: 'Energy level must be between 1 and 10' });
    }

    const entryData = {
      title: title?.trim() || undefined,
      content: content.trim(),
      entry_type,
      user_id: userId,
      entry_date: new Date(entry_date),
      time_of_day,
      tags: tags || [],
      mood_rating,
      energy_level,
      related_task_ids: related_task_ids || [],
      related_project_ids: related_project_ids || [],
      attachments: attachments || [],
      metadata: metadata || {}
    };

    const entry = await JournalEntryModel.create(entryData);
    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

// Update journal entry
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const {
      title,
      content,
      entry_type,
      entry_date,
      time_of_day,
      tags,
      mood_rating,
      energy_level,
      related_task_ids,
      related_project_ids,
      attachments,
      metadata
    } = req.body;

    // Validate mood and energy ratings if provided
    if (mood_rating !== undefined && (mood_rating < 1 || mood_rating > 10)) {
      return res.status(400).json({ error: 'Mood rating must be between 1 and 10' });
    }

    if (energy_level !== undefined && (energy_level < 1 || energy_level > 10)) {
      return res.status(400).json({ error: 'Energy level must be between 1 and 10' });
    }

    const updates: any = {};
    
    if (title !== undefined) updates.title = title?.trim() || null;
    if (content !== undefined) {
      if (content.trim().length === 0) {
        return res.status(400).json({ error: 'Content cannot be empty' });
      }
      updates.content = content.trim();
    }
    if (entry_type !== undefined) updates.entry_type = entry_type;
    if (entry_date !== undefined) updates.entry_date = new Date(entry_date);
    if (time_of_day !== undefined) updates.time_of_day = time_of_day;
    if (tags !== undefined) updates.tags = tags;
    if (mood_rating !== undefined) updates.mood_rating = mood_rating;
    if (energy_level !== undefined) updates.energy_level = energy_level;
    if (related_task_ids !== undefined) updates.related_task_ids = related_task_ids;
    if (related_project_ids !== undefined) updates.related_project_ids = related_project_ids;
    if (attachments !== undefined) updates.attachments = attachments;
    if (metadata !== undefined) updates.metadata = metadata;

    const entry = await JournalEntryModel.update(id, userId, updates);
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

// Delete journal entry
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const success = await JournalEntryModel.delete(id, userId);
    
    if (!success) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

// Get journal statistics
router.get('/analytics/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const stats = await JournalEntryModel.getStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching journal statistics:', error);
    res.status(500).json({ error: 'Failed to fetch journal statistics' });
  }
});

// Search journal entries
router.get('/search/:searchTerm', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { searchTerm } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const entries = await JournalEntryModel.search(userId, searchTerm, limit);
    res.json(entries);
  } catch (error) {
    console.error('Error searching journal entries:', error);
    res.status(500).json({ error: 'Failed to search journal entries' });
  }
});

// Quick entry endpoint for minimal data
router.post('/quick-entry', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { content, entry_type, mood_rating, energy_level } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const entryData = {
      content: content.trim(),
      entry_type: entry_type || 'general',
      user_id: userId,
      entry_date: new Date(),
      mood_rating,
      energy_level,
      tags: [],
      related_task_ids: [],
      related_project_ids: [],
      attachments: [],
      metadata: {}
    };

    const entry = await JournalEntryModel.create(entryData);
    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating quick journal entry:', error);
    res.status(500).json({ error: 'Failed to create quick journal entry' });
  }
});

export default router;