import express from 'express';
import { authenticateToken } from './auth';
import TaskModel from '../models/Task';

const router = express.Router();

// Apply authentication to all task routes
router.use(authenticateToken);

// GET /api/tasks - Get all tasks for authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { project_id, status, priority, tag, search, due_before, due_after } = req.query;

    const filters = {
      project_id: project_id as string,
      status: status as string,
      priority: priority as string,
      tag: tag as string,
      search: search as string,
      due_before: due_before ? new Date(due_before as string) : undefined,
      due_after: due_after ? new Date(due_after as string) : undefined,
    };

    const tasks = await TaskModel.findByUser(userId, filters);

    res.json({
      tasks,
      count: tasks.length,
      filters: { project_id, status, priority, tag, search, due_before, due_after }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      message: 'An error occurred while fetching tasks'
    });
  }
});

// POST /api/tasks - Create new task
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { title, description, status, priority, project_id, due_date, parent_task_id, metadata } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Task title is required and cannot be empty'
      });
    }

    const taskData = {
      title: title.trim(),
      description,
      status,
      priority,
      project_id,
      parent_task_id,
      user_id: userId,
      due_date: due_date ? new Date(due_date) : undefined,
      metadata,
    };

    const newTask = await TaskModel.create(taskData);

    res.status(201).json({
      message: 'Task created successfully',
      task: newTask
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      error: 'Failed to create task',
      message: 'An error occurred while creating the task'
    });
  }
});

// GET /api/tasks/:id - Get specific task
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const taskId = req.params.id;

    const task = await TaskModel.findById(taskId, userId);
    
    if (!task) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Task does not exist or you do not have permission to access it'
      });
    }

    res.json({ task });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      error: 'Failed to fetch task',
      message: 'An error occurred while fetching the task'
    });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const taskId = req.params.id;
    const updates = req.body;

    // Process due_date if provided
    if (updates.due_date) {
      updates.due_date = new Date(updates.due_date);
    }

    const updatedTask = await TaskModel.update(taskId, userId, updates);
    
    if (!updatedTask) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Task does not exist or you do not have permission to update it'
      });
    }

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      error: 'Failed to update task',
      message: 'An error occurred while updating the task'
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const taskId = req.params.id;

    const deleted = await TaskModel.delete(taskId, userId);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Task does not exist or you do not have permission to delete it'
      });
    }

    res.json({
      message: 'Task deleted successfully',
      taskId
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      error: 'Failed to delete task',
      message: 'An error occurred while deleting the task'
    });
  }
});

// POST /api/tasks/:id/complete - Mark task as complete
router.post('/:id/complete', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const taskId = req.params.id;

    const completedTask = await TaskModel.markComplete(taskId, userId);
    
    if (!completedTask) {
      return res.status(404).json({
        error: 'Task not found',
        message: 'Task does not exist or you do not have permission to complete it'
      });
    }

    res.json({
      message: 'Task marked as complete',
      task: completedTask
    });

  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      error: 'Failed to complete task',
      message: 'An error occurred while completing the task'
    });
  }
});

export default router; 