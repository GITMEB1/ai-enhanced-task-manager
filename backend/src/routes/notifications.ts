import express from 'express';
import { authenticateToken } from './auth';

const router = express.Router();

// Apply authentication to all notification routes
router.use(authenticateToken);

// GET /api/notifications - Get all notifications for authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { unread_only } = req.query;

    // TODO: Implement Notification model and database queries
    // For now, return placeholder data
    const notifications = [
      {
        id: 1,
        user_id: userId,
        type: 'task_due',
        title: 'Task Due Soon',
        message: 'Your task "Complete project proposal" is due in 2 hours',
        data: { task_id: 1, due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
        read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        user_id: userId,
        type: 'task_completed',
        title: 'Task Completed',
        message: 'You completed "Review weekly reports"',
        data: { task_id: 2 },
        read: true,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];

    const filteredNotifications = unread_only === 'true' 
      ? notifications.filter(n => !n.read)
      : notifications;

    res.json({
      notifications: filteredNotifications,
      count: filteredNotifications.length,
      unread_count: notifications.filter(n => !n.read).length
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to fetch notifications',
      message: 'An error occurred while fetching notifications'
    });
  }
});

// POST /api/notifications - Create new notification (internal use)
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { type, title, message, data } = req.body;

    // Validate required fields
    if (!type || !title || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Type, title, and message are required'
      });
    }

    // TODO: Implement Notification model creation
    // For now, return placeholder response
    const newNotification = {
      id: Date.now(), // Temporary ID
      user_id: userId,
      type,
      title,
      message,
      data: data || {},
      read: false,
      created_at: new Date().toISOString()
    };

    res.status(201).json({
      message: 'Notification created successfully',
      notification: newNotification
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      error: 'Failed to create notification',
      message: 'An error occurred while creating the notification'
    });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const notificationId = parseInt(req.params.id);

    if (isNaN(notificationId)) {
      return res.status(400).json({
        error: 'Invalid notification ID',
        message: 'Notification ID must be a number'
      });
    }

    // TODO: Implement Notification model update with user verification
    // For now, return placeholder response
    res.json({
      message: 'Notification marked as read',
      notificationId
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      message: 'An error occurred while updating the notification'
    });
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    // TODO: Implement bulk update for all user notifications
    // For now, return placeholder response
    res.json({
      message: 'All notifications marked as read',
      updated_count: 5 // Placeholder count
    });

  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      error: 'Failed to mark notifications as read',
      message: 'An error occurred while updating notifications'
    });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const notificationId = parseInt(req.params.id);

    if (isNaN(notificationId)) {
      return res.status(400).json({
        error: 'Invalid notification ID',
        message: 'Notification ID must be a number'
      });
    }

    // TODO: Implement Notification model delete with user verification
    // For now, return success response
    res.json({
      message: 'Notification deleted successfully',
      notificationId
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Failed to delete notification',
      message: 'An error occurred while deleting the notification'
    });
  }
});

// DELETE /api/notifications/clear-all - Delete all read notifications
router.delete('/clear-all', async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    // TODO: Implement bulk delete for read notifications
    // For now, return placeholder response
    res.json({
      message: 'All read notifications cleared',
      deleted_count: 3 // Placeholder count
    });

  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({
      error: 'Failed to clear notifications',
      message: 'An error occurred while clearing notifications'
    });
  }
});

// GET /api/notifications/preferences - Get notification preferences
router.get('/preferences', async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    // TODO: Get user's notification preferences from User model
    // For now, return default preferences
    const preferences = {
      email_notifications: true,
      push_notifications: true,
      task_reminders: true,
      task_due_alerts: true,
      weekly_summary: true,
      reminder_time_before: 60, // minutes
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00'
    };

    res.json({ preferences });

  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      error: 'Failed to fetch preferences',
      message: 'An error occurred while fetching notification preferences'
    });
  }
});

// PUT /api/notifications/preferences - Update notification preferences
router.put('/preferences', async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const preferences = req.body;

    // TODO: Update user's notification preferences in User model
    // For now, return the received preferences
    res.json({
      message: 'Notification preferences updated successfully',
      preferences
    });

  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      message: 'An error occurred while updating notification preferences'
    });
  }
});

export default router; 