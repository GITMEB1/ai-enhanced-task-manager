import express from 'express';
import { authenticateToken } from './auth';
import { TaskModel } from '../models/Task';
import { ProjectModel } from '../models/Project';
import { JournalEntryModel } from '../models/JournalEntry';
import GmailService from '../services/integrations/GmailService';
import RAGService from '../services/integrations/RAGService';

const router = express.Router();

// Initialize services
let gmailService: GmailService | null = null;
let ragService: RAGService | null = null;

// Initialize Gmail service if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  gmailService = new GmailService({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8000/api/integrations/gmail/callback'
  });
}

// Initialize RAG service if OpenAI key is available
if (process.env.OPENAI_API_KEY) {
  ragService = new RAGService(process.env.OPENAI_API_KEY);
}

// AI-powered insights endpoint
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    
    if (ragService && ragService.isReady()) {
      // Use advanced RAG service
      const insights = await ragService.generateProductivityInsights(userId);
      const taskSuggestions = await ragService.generateTaskSuggestions(userId);
      const journalPrompts = await ragService.generateJournalPrompts(userId);
      
      res.json({
        insights,
        task_suggestions: taskSuggestions,
        journal_prompts: journalPrompts,
        powered_by: 'AI',
        service_status: 'enhanced'
      });
    } else {
      // Fallback to basic pattern analysis
      const basicInsights = await generateBasicInsights(userId);
      res.json({
        ...basicInsights,
        powered_by: 'pattern_analysis',
        service_status: 'basic',
        note: 'Enhanced AI features available with OpenAI API key'
      });
    }
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Gmail OAuth initialization
router.get('/gmail/auth', authenticateToken, (req, res) => {
  try {
    if (!gmailService) {
      return res.json({
        error: 'Gmail integration not configured',
        setup_required: true,
        message: 'Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file'
      });
    }

    const authUrl = gmailService.getAuthUrl();
    res.json({
      auth_url: authUrl,
      message: 'Visit the auth URL to authorize Gmail access',
      setup_required: false
    });
  } catch (error) {
    console.error('Error generating Gmail auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Gmail OAuth callback
router.get('/gmail/callback', authenticateToken, async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!gmailService) {
      return res.status(400).json({ error: 'Gmail service not initialized' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    const tokens = await gmailService.exchangeCodeForTokens(code as string);
    
    // In a real app, you'd store these tokens securely for the user
    // For now, we'll just confirm the auth worked
    res.json({
      message: 'Gmail authorization successful',
      tokens_received: true,
      next_steps: 'You can now use Gmail integration features'
    });
  } catch (error) {
    console.error('Error handling Gmail callback:', error);
    res.status(500).json({ error: 'Failed to complete Gmail authorization' });
  }
});

// Get actionable emails from Gmail
router.get('/gmail/emails', authenticateToken, async (req, res) => {
  try {
    if (!gmailService) {
      return res.status(400).json({ error: 'Gmail service not initialized' });
    }

    const maxResults = parseInt(req.query.max_results as string) || 10;
    const emails = await gmailService.getActionableEmails(maxResults);
    
    res.json({
      emails,
      count: emails.length,
      service_status: emails.length > 0 ? 'connected' : 'mock_data'
    });
  } catch (error) {
    console.error('Error fetching Gmail emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Convert Gmail emails to tasks
router.post('/gmail/convert-to-tasks', authenticateToken, async (req, res) => {
  try {
    const { email_ids } = req.body;
    const userId = (req as any).user.userId;
    
    if (!gmailService) {
      return res.status(400).json({ error: 'Gmail service not initialized' });
    }

    if (!Array.isArray(email_ids)) {
      return res.status(400).json({ error: 'email_ids must be an array' });
    }

    // Get actionable emails
    const emails = await gmailService.getActionableEmails(50);
    const selectedEmails = emails.filter(email => email_ids.includes(email.id));
    
    const createdTasks = [];
    
    for (const email of selectedEmails) {
      const taskSuggestion = gmailService.convertEmailToTaskSuggestion(email);
      
      const task = await TaskModel.create({
        title: taskSuggestion.title,
        description: taskSuggestion.description,
        priority: taskSuggestion.priority,
        due_date: taskSuggestion.due_date,
        user_id: userId,
        status: 'pending',
        metadata: taskSuggestion.metadata
      });
      
      createdTasks.push(task);
    }
    
    res.json({
      message: `Successfully converted ${createdTasks.length} emails to tasks`,
      tasks: createdTasks
    });
  } catch (error) {
    console.error('Error converting emails to tasks:', error);
    res.status(500).json({ error: 'Failed to convert emails to tasks' });
  }
});

// Search email threads for project context
router.get('/gmail/search-threads', authenticateToken, async (req, res) => {
  try {
    if (!gmailService) {
      return res.status(400).json({ error: 'Gmail service not initialized' });
    }

    const { query, max_results } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const maxResults = parseInt(max_results as string) || 20;
    const threads = await gmailService.searchEmailThreads(query, maxResults);
    
    res.json({
      threads,
      count: threads.length,
      query: query,
      service_status: threads.length > 0 ? 'connected' : 'mock_data'
    });
  } catch (error) {
    console.error('Error searching email threads:', error);
    res.status(500).json({ error: 'Failed to search email threads' });
  }
});

// Get specific email thread details
router.get('/gmail/thread/:threadId', authenticateToken, async (req, res) => {
  try {
    if (!gmailService) {
      return res.status(400).json({ error: 'Gmail service not initialized' });
    }

    const { threadId } = req.params;
    const thread = await gmailService.getEmailThread(threadId);
    
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    res.json({
      thread,
      service_status: 'connected'
    });
  } catch (error) {
    console.error('Error fetching email thread:', error);
    res.status(500).json({ error: 'Failed to fetch email thread' });
  }
});

// Analyze project context from selected email threads
router.post('/gmail/analyze-context', authenticateToken, async (req, res) => {
  try {
    if (!gmailService) {
      return res.status(400).json({ error: 'Gmail service not initialized' });
    }

    const { thread_ids } = req.body;
    
    if (!Array.isArray(thread_ids)) {
      return res.status(400).json({ error: 'thread_ids must be an array' });
    }

    const context = await gmailService.analyzeProjectContext(thread_ids);
    
    res.json({
      context,
      analyzed_threads: thread_ids.length,
      service_status: 'connected'
    });
  } catch (error) {
    console.error('Error analyzing project context:', error);
    res.status(500).json({ error: 'Failed to analyze project context' });
  }
});

// Enhanced project creation with email context
router.post('/projects/create-with-context', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { name, description, color, email_thread_ids, ai_enhanced } = req.body;

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

    let enhancedDescription = description || '';
    let projectMetadata: any = {};

    // If email threads are provided, analyze them for context
    if (email_thread_ids && Array.isArray(email_thread_ids) && email_thread_ids.length > 0 && gmailService) {
      try {
        const context = await gmailService.analyzeProjectContext(email_thread_ids);
        
        // Enhance description with AI-generated context
        if (ai_enhanced && ragService) {
          const aiEnhancedDescription = await ragService.enhanceProjectDescription(
            name,
            description || '',
            context
          );
          enhancedDescription = aiEnhancedDescription;
        } else {
          // Basic enhancement without AI
          enhancedDescription = description ? 
            `${description}\n\n--- Email Context ---\n${context.summary}` : 
            context.summary;
        }

        // Store email context in metadata
        projectMetadata = {
          email_context: {
            thread_ids: email_thread_ids,
            summary: context.summary,
            participants: context.participants,
            key_insights: context.keyInsights,
            action_items: context.actionItems,
            decisions: context.decisions,
            next_steps: context.nextSteps,
            timespan: context.timespan,
            analyzed_at: new Date().toISOString()
          }
        };
      } catch (contextError) {
        console.error('Error analyzing email context:', contextError);
        // Continue with project creation without context
      }
    }

    const projectData = {
      name: name.trim(),
      description: enhancedDescription,
      color,
      user_id: userId,
      metadata: projectMetadata
    };

    const newProject = await ProjectModel.create(projectData);

    res.status(201).json({
      message: 'Project created successfully with email context',
      project: newProject,
      context_analyzed: email_thread_ids && email_thread_ids.length > 0,
      ai_enhanced: ai_enhanced && ragService !== null
    });

  } catch (error) {
    console.error('Create project with context error:', error);
    res.status(500).json({
      error: 'Failed to create project',
      message: 'An error occurred while creating the project with email context'
    });
  }
});

// Accept AI suggestions
router.post('/suggestions/accept', authenticateToken, async (req, res) => {
  try {
    const { suggestion_type, suggestion_data } = req.body;
    const userId = (req as any).user.userId;
    
    if (suggestion_type === 'task') {
      const task = await TaskModel.create({
        title: suggestion_data.title,
        description: suggestion_data.description || suggestion_data.content,
        priority: suggestion_data.priority || 'medium',
        user_id: userId,
        status: 'pending',
        // estimated_duration: suggestion_data.estimated_duration, // Not supported in current model
        metadata: {
          source: 'ai_suggestion',
          reasoning: suggestion_data.reasoning,
          ...suggestion_data.metadata
        }
      });
      
      res.json({
        message: 'Task suggestion accepted and created',
        task
      });
    } else if (suggestion_type === 'journal_prompt') {
      // Create a journal entry with the prompt as a template
      const entry = await JournalEntryModel.create({
        user_id: userId,
        entry_type: 'general',
        entry_date: new Date(),
        content: `Prompt: ${suggestion_data.prompt}\n\n[Write your response here]`,
        metadata: {
          source: 'ai_prompt',
          original_prompt: suggestion_data.prompt,
          prompt_type: suggestion_data.type
        }
      });
      
      res.json({
        message: 'Journal prompt accepted and entry created',
        entry
      });
    } else {
      res.status(400).json({ error: 'Unsupported suggestion type' });
    }
  } catch (error) {
    console.error('Error accepting suggestion:', error);
    res.status(500).json({ error: 'Failed to accept suggestion' });
  }
});

// Get service status
router.get('/status', authenticateToken, (req, res) => {
  res.json({
    gmail_service: {
      available: gmailService !== null,
      configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    },
    rag_service: {
      available: ragService !== null,
      configured: !!process.env.OPENAI_API_KEY,
      ready: ragService?.isReady() || false
    },
    features: {
      ai_insights: ragService?.isReady() || false,
      gmail_integration: gmailService !== null,
      basic_patterns: true
    }
  });
});

// Basic insights fallback function
async function generateBasicInsights(userId: number) {
  const [tasks, projects, journalEntries] = await Promise.all([
    TaskModel.findByUser(String(userId), {}),
    ProjectModel.findByUser(String(userId)),
    JournalEntryModel.findByUser(String(userId), {})
  ]);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

  // Extract mood patterns
  const moodEntries = journalEntries.filter(entry => (entry as any).mood_rating);
  const avgMood = moodEntries.length > 0 
    ? moodEntries.reduce((sum, entry) => sum + (entry as any).mood_rating, 0) / moodEntries.length
    : null;

  return {
    insights: [
      ...(completionRate > 0.8 ? [{
        type: 'productivity',
        title: 'High Task Completion Rate',
        description: `You're completing ${Math.round(completionRate * 100)}% of your tasks. Excellent work!`,
        confidence: 0.9,
        actionable: true,
        suggested_actions: ['Consider taking on more challenging tasks', 'Share your productivity strategies']
      }] : []),
      ...(completionRate < 0.5 && totalTasks > 3 ? [{
        type: 'warning',
        title: 'Low Task Completion Rate',
        description: `Your completion rate is ${Math.round(completionRate * 100)}%. Consider reviewing your task load.`,
        confidence: 0.8,
        actionable: true,
        suggested_actions: ['Break large tasks into smaller pieces', 'Review and prioritize your task list']
      }] : []),
      ...(avgMood && avgMood < 5 ? [{
        type: 'mood',
        title: 'Mood Support Needed',
        description: `Your recent mood average is ${avgMood.toFixed(1)}/10. Consider self-care activities.`,
        confidence: 0.7,
        actionable: true,
        suggested_actions: ['Schedule self-care time', 'Focus on smaller, achievable goals']
      }] : [])
    ],
    task_suggestions: generateBasicTaskSuggestions(tasks, projects, completionRate),
    journal_prompts: generateBasicJournalPrompts(journalEntries, avgMood),
    context_summary: {
      tasks_analyzed: tasks.length,
      projects_active: projects.filter(p => p.status === 'active').length,
      journal_entries: journalEntries.length,
      avg_mood: avgMood ? avgMood.toFixed(1) : null,
      productivity_rate: (completionRate * 100).toFixed(1) + '%'
    }
  };
}

function generateBasicTaskSuggestions(tasks: any[], projects: any[], completionRate: number) {
  const suggestions = [];
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  
  if (pendingTasks > 5) {
    suggestions.push({
      title: 'Focus Session',
      description: `You have ${pendingTasks} pending tasks. Consider scheduling a focused work session.`,
      priority: 'medium',
      reasoning: 'High number of pending tasks detected'
    });
  }
  
  if (completionRate < 0.5 && tasks.length > 3) {
    suggestions.push({
      title: 'Task Review Session',
      description: 'Review your task list and break down large items into smaller, manageable pieces.',
      priority: 'high',
      reasoning: 'Low completion rate suggests tasks may be too large or unclear'
    });
  }
  
  return suggestions;
}

function generateBasicJournalPrompts(journalEntries: any[], avgMood: number | null) {
  const prompts = [];
  
  if (journalEntries.length === 0) {
    prompts.push({
      prompt: 'What are three things you accomplished this week that you\'re proud of?',
      type: 'achievement',
      context: 'Starting your journaling practice'
    });
  }
  
  if (avgMood && avgMood < 6) {
    prompts.push({
      prompt: 'What are three things you\'re grateful for today, no matter how small?',
      type: 'gratitude',
      context: 'Mood support'
    });
  } else {
    prompts.push({
      prompt: 'What\'s one challenge you\'re facing right now, and what small step could you take toward solving it?',
      type: 'reflection',
      context: 'Growth and problem-solving'
    });
  }
  
  return prompts;
}

export default router; 