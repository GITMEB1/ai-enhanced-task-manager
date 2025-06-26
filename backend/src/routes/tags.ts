import express from 'express';
import { authenticateToken } from './auth';
import TagModel from '../models/Tag';

const router = express.Router();

// Apply authentication to all tag routes
router.use(authenticateToken);

// GET /api/tags - Get all tags for authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const tags = await TagModel.findByUser(userId);

    res.json({
      tags,
      count: tags.length
    });

  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      error: 'Failed to fetch tags',
      message: 'An error occurred while fetching tags'
    });
  }
});

// POST /api/tags - Create new tag
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { name, color } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Tag name is required'
      });
    }

    // Validate tag name format
    const validation = TagModel.validateName(name);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid tag name',
        message: validation.error
      });
    }

    // Check if tag already exists for this user
    const isUnique = await TagModel.isNameUnique(userId, name);
    if (!isUnique) {
      return res.status(409).json({
        error: 'Tag already exists',
        message: 'A tag with this name already exists'
      });
    }

    const tagData = {
      name,
      color,
      user_id: userId,
    };

    const newTag = await TagModel.create(tagData);

    res.status(201).json({
      message: 'Tag created successfully',
      tag: newTag
    });

  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({
      error: 'Failed to create tag',
      message: 'An error occurred while creating the tag'
    });
  }
});

// GET /api/tags/:id - Get specific tag
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const tagId = req.params.id;

    const tag = await TagModel.findById(tagId, userId);
    
    if (!tag) {
      return res.status(404).json({
        error: 'Tag not found',
        message: 'Tag does not exist or you do not have permission to access it'
      });
    }

    res.json({ tag });

  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({
      error: 'Failed to fetch tag',
      message: 'An error occurred while fetching the tag'
    });
  }
});

// PUT /api/tags/:id - Update tag
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const tagId = req.params.id;
    const { name, color } = req.body;

    // Validate name if provided
    if (name) {
      const validation = TagModel.validateName(name);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Invalid tag name',
          message: validation.error
        });
      }

      // Check if name is unique
      const isUnique = await TagModel.isNameUnique(userId, name, tagId);
      if (!isUnique) {
        return res.status(409).json({
          error: 'Tag name already exists',
          message: 'A tag with this name already exists'
        });
      }
    }

    const updates = { name, color };
    const updatedTag = await TagModel.update(tagId, userId, updates);
    
    if (!updatedTag) {
      return res.status(404).json({
        error: 'Tag not found',
        message: 'Tag does not exist or you do not have permission to update it'
      });
    }

    res.json({
      message: 'Tag updated successfully',
      tag: updatedTag
    });

  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({
      error: 'Failed to update tag',
      message: 'An error occurred while updating the tag'
    });
  }
});

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const tagId = req.params.id;

    const deleted = await TagModel.delete(tagId, userId);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Tag not found',
        message: 'Tag does not exist or you do not have permission to delete it'
      });
    }

    res.json({
      message: 'Tag deleted successfully',
      tagId
    });

  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      error: 'Failed to delete tag',
      message: 'An error occurred while deleting the tag'
    });
  }
});

// GET /api/tags/:id/tasks - Get all tasks with specific tag
router.get('/:id/tasks', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const tagId = parseInt(req.params.id);

    if (isNaN(tagId)) {
      return res.status(400).json({
        error: 'Invalid tag ID',
        message: 'Tag ID must be a number'
      });
    }

    // TODO: Implement query to get tasks by tag with user verification
    // For now, return placeholder data
    const tasks = [
      {
        id: 1,
        title: 'Sample Task with Tag',
        status: 'pending',
        priority: 'high',
        created_at: new Date().toISOString()
      }
    ];

    res.json({
      tagId,
      tasks,
      count: tasks.length
    });

  } catch (error) {
    console.error('Get tasks by tag error:', error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      message: 'An error occurred while fetching tasks for this tag'
    });
  }
});

export default router; 