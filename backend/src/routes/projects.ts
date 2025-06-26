import express from 'express';
import { authenticateToken } from './auth';
import ProjectModel from '../models/Project';

const router = express.Router();

// Apply authentication to all project routes
router.use(authenticateToken);

// GET /api/projects - Get all projects for authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { include_archived } = req.query;

    const projects = await ProjectModel.findByUser(userId, include_archived === 'true');

    res.json({
      projects,
      count: projects.length
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      error: 'Failed to fetch projects',
      message: 'An error occurred while fetching projects'
    });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { name, description, color } = req.body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Project name is required and cannot be empty'
      });
    }

    // Check if project name is unique
    const isUnique = await ProjectModel.isNameUnique(userId, name.trim());
    if (!isUnique) {
      return res.status(409).json({
        error: 'Project name already exists',
        message: 'A project with this name already exists'
      });
    }

    const projectData = {
      name: name.trim(),
      description,
      color,
      user_id: userId,
    };

    const newProject = await ProjectModel.create(projectData);

    res.status(201).json({
      message: 'Project created successfully',
      project: newProject
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      error: 'Failed to create project',
      message: 'An error occurred while creating the project'
    });
  }
});

// GET /api/projects/:id - Get specific project
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const projectId = req.params.id;

    const project = await ProjectModel.findWithStats(projectId, userId);
    
    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project does not exist or you do not have permission to access it'
      });
    }

    res.json({ project });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      error: 'Failed to fetch project',
      message: 'An error occurred while fetching the project'
    });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const projectId = req.params.id;
    const updates = req.body;

    // Check if name is being updated and if it's unique
    if (updates.name) {
      const isUnique = await ProjectModel.isNameUnique(userId, updates.name.trim(), projectId);
      if (!isUnique) {
        return res.status(409).json({
          error: 'Project name already exists',
          message: 'A project with this name already exists'
        });
      }
      updates.name = updates.name.trim();
    }

    const updatedProject = await ProjectModel.update(projectId, userId, updates);
    
    if (!updatedProject) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project does not exist or you do not have permission to update it'
      });
    }

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      error: 'Failed to update project',
      message: 'An error occurred while updating the project'
    });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const projectId = req.params.id;

    const deleted = await ProjectModel.delete(projectId, userId);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project does not exist or you do not have permission to delete it'
      });
    }

    res.json({
      message: 'Project deleted or archived successfully',
      projectId
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      error: 'Failed to delete project',
      message: 'An error occurred while deleting the project'
    });
  }
});

// PUT /api/projects/reorder - Reorder projects
router.put('/reorder', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { projects } = req.body;

    if (!Array.isArray(projects)) {
      return res.status(400).json({
        error: 'Invalid data format',
        message: 'Projects must be an array'
      });
    }

    const success = await ProjectModel.reorder(userId, projects);
    
    if (!success) {
      return res.status(500).json({
        error: 'Failed to reorder projects',
        message: 'An error occurred while reordering projects'
      });
    }

    res.json({
      message: 'Projects reordered successfully'
    });

  } catch (error) {
    console.error('Reorder projects error:', error);
    res.status(500).json({
      error: 'Failed to reorder projects',
      message: 'An error occurred while reordering projects'
    });
  }
});

export default router; 