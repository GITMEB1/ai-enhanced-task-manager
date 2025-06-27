import OpenAI from 'openai';
import { TaskModel } from '../../models/Task';
import { JournalEntryModel } from '../../models/JournalEntry';
import { ProjectModel } from '../../models/Project';

export interface AIInsight {
  type: 'productivity' | 'mood' | 'pattern' | 'suggestion' | 'warning';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  suggested_actions?: string[];
  data_points?: any[];
}

export interface TaskSuggestion {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimated_duration?: number;
  suggested_tags?: string[];
  reasoning: string;
}

export interface JournalPrompt {
  prompt: string;
  type: string;
  context?: string;
  follow_up_questions?: string[];
}

export class RAGService {
  private openai: OpenAI | null = null;
  private isConfigured: boolean = false;

  constructor(apiKey?: string) {
    if (apiKey) {
      try {
        this.openai = new OpenAI({ apiKey });
        this.isConfigured = true;
      } catch (error) {
        console.error('Error initializing OpenAI:', error);
        this.isConfigured = false;
      }
    }
  }

  /**
   * Check if the service is properly configured
   */
  isReady(): boolean {
    return this.isConfigured && this.openai !== null;
  }

  /**
   * Generate productivity insights based on user data
   */
  async generateProductivityInsights(userId: number): Promise<AIInsight[]> {
    try {
      if (!this.isReady()) {
        return this.getMockInsights();
      }

      // Gather user data
      const tasks = await TaskModel.findByUser(String(userId), {});
      const journalEntries = await JournalEntryModel.findByUser(String(userId), {});
      const projects = await ProjectModel.findByUser(String(userId));

      // Analyze patterns
      const insights: AIInsight[] = [];

      // Task completion patterns
      const completionInsight = this.analyzeTaskCompletionPatterns(tasks);
      if (completionInsight) insights.push(completionInsight);

      // Mood-productivity correlation
      if (journalEntries.length > 0) {
        const moodInsight = this.analyzeMoodProductivityCorrelation(tasks, journalEntries);
        if (moodInsight) insights.push(moodInsight);
      }

      // Project progress analysis
      if (projects.length > 0) {
        const projectInsight = this.analyzeProjectProgress(projects, tasks);
        if (projectInsight) insights.push(projectInsight);
      }

      // Time-based patterns
      const timeInsight = this.analyzeTimePatterns(tasks, journalEntries);
      if (timeInsight) insights.push(timeInsight);

      // If we have OpenAI configured, enhance insights with AI
      if (this.openai && insights.length > 0) {
        return await this.enhanceInsightsWithAI(insights, { tasks, journalEntries, projects });
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return this.getMockInsights();
    }
  }

  /**
   * Generate contextual task suggestions
   */
  async generateTaskSuggestions(userId: number, context?: string): Promise<TaskSuggestion[]> {
    try {
      if (!this.isReady()) {
        return this.getMockTaskSuggestions();
      }

      const recentTasks = await TaskModel.findByUser(String(userId), {});
      const recentEntries = await JournalEntryModel.findByUser(String(userId), {});

      // Analyze patterns to suggest new tasks
      const suggestions: TaskSuggestion[] = [];

      // Suggest based on incomplete tasks
      const incompleteTaskSuggestion = this.suggestBasedOnIncompleteTasks(recentTasks);
      if (incompleteTaskSuggestion) suggestions.push(incompleteTaskSuggestion);

      // Suggest based on journal patterns
      if (recentEntries.length > 0) {
        const journalSuggestion = this.suggestBasedOnJournalPatterns(recentEntries);
        if (journalSuggestion) suggestions.push(journalSuggestion);
      }

      // Suggest routine maintenance tasks
      const maintenanceSuggestion = this.suggestMaintenanceTasks(recentTasks);
      if (maintenanceSuggestion) suggestions.push(maintenanceSuggestion);

      return suggestions.slice(0, 5); // Limit to 5 suggestions
    } catch (error) {
      console.error('Error generating task suggestions:', error);
      return this.getMockTaskSuggestions();
    }
  }

  /**
   * Generate personalized journal prompts
   */
  async generateJournalPrompts(userId: number): Promise<JournalPrompt[]> {
    try {
      const recentEntries = await JournalEntryModel.findByUser(String(userId), {});
      const recentTasks = await TaskModel.findByUser(String(userId), {});

      const prompts: JournalPrompt[] = [];

      // Reflection prompts based on recent activity
      if (recentTasks.some((task: any) => task.status === 'completed')) {
        prompts.push({
          prompt: "What accomplishment from today are you most proud of, and what made it meaningful?",
          type: "achievement",
          follow_up_questions: [
            "What skills did you use to achieve this?",
            "How can you build on this success?"
          ]
        });
      }

      // Mood-based prompts
      const lastMoodEntry = recentEntries
        .filter((entry: any) => entry.mood_rating !== null)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      if (lastMoodEntry && lastMoodEntry.mood_rating) {
        if (lastMoodEntry.mood_rating < 5) {
          prompts.push({
            prompt: "What's one small thing that could make tomorrow better than today?",
            type: "reflection",
            context: "Based on your recent mood patterns"
          });
        } else {
          prompts.push({
            prompt: "What positive energy are you feeling right now, and how can you share it?",
            type: "gratitude",
            context: "You seem to be in a good mood lately"
          });
        }
      }

      // Goal-oriented prompts
      if (recentTasks.length > 0) {
        prompts.push({
          prompt: "Looking at your current tasks, what's the biggest obstacle you're facing and how might you overcome it?",
          type: "goal_progress",
          follow_up_questions: [
            "What resources do you need?",
            "Who could help you with this?"
          ]
        });
      }

      // Learning and growth prompts
      prompts.push({
        prompt: "What's something new you learned recently, and how will you apply it?",
        type: "learning",
        follow_up_questions: [
          "What sparked your interest in this topic?",
          "What would you like to learn next?"
        ]
      });

      return prompts.slice(0, 3); // Return top 3 prompts
    } catch (error) {
      console.error('Error generating journal prompts:', error);
      return this.getMockJournalPrompts();
    }
  }

  /**
   * Analyze task completion patterns
   */
  private analyzeTaskCompletionPatterns(tasks: any[]): AIInsight | null {
    if (tasks.length < 5) return null;

    const completed = tasks.filter(task => task.status === 'completed');
    const completionRate = completed.length / tasks.length;

    if (completionRate > 0.8) {
      return {
        type: 'productivity',
        title: 'High Task Completion Rate',
        description: `You're completing ${Math.round(completionRate * 100)}% of your tasks. Great job staying on track!`,
        confidence: 0.9,
        actionable: true,
        suggested_actions: [
          'Consider taking on more challenging tasks',
          'Share your productivity strategies with others'
        ]
      };
    } else if (completionRate < 0.5) {
      return {
        type: 'warning',
        title: 'Low Task Completion Rate',
        description: `Your task completion rate is ${Math.round(completionRate * 100)}%. This might indicate overcommitment or unclear priorities.`,
        confidence: 0.8,
        actionable: true,
        suggested_actions: [
          'Review and prioritize your task list',
          'Break large tasks into smaller, manageable pieces',
          'Consider if you\'re taking on too much'
        ]
      };
    }

    return null;
  }

  /**
   * Analyze mood-productivity correlation
   */
  private analyzeMoodProductivityCorrelation(tasks: any[], journalEntries: any[]): AIInsight | null {
    const moodEntries = journalEntries.filter(entry => entry.mood_rating !== null);
    if (moodEntries.length < 3) return null;

    const avgMood = moodEntries.reduce((sum, entry) => sum + entry.mood_rating, 0) / moodEntries.length;
    const completedTasks = tasks.filter(task => task.status === 'completed');

    if (avgMood > 7 && completedTasks.length > 0) {
      return {
        type: 'mood',
        title: 'Positive Mood Boost',
        description: `Your average mood rating is ${avgMood.toFixed(1)}/10, and you're staying productive. Keep up the great work!`,
        confidence: 0.7,
        actionable: true,
        suggested_actions: [
          'Note what activities contribute to your positive mood',
          'Schedule more of these mood-boosting activities'
        ]
      };
    } else if (avgMood < 5) {
      return {
        type: 'mood',
        title: 'Mood Impact on Productivity',
        description: `Your recent mood ratings average ${avgMood.toFixed(1)}/10. Consider focusing on self-care and manageable goals.`,
        confidence: 0.8,
        actionable: true,
        suggested_actions: [
          'Schedule some self-care activities',
          'Focus on completing smaller, achievable tasks',
          'Consider talking to someone about how you\'re feeling'
        ]
      };
    }

    return null;
  }

  /**
   * Analyze project progress
   */
  private analyzeProjectProgress(projects: any[], tasks: any[]): AIInsight | null {
    const activeProjects = projects.filter(p => p.status === 'active');
    if (activeProjects.length === 0) return null;

    const projectTasks = tasks.filter(task => task.project_id !== null);
    const stuckProjects = activeProjects.filter(project => {
      const projectTaskList = projectTasks.filter(task => task.project_id === project.id);
      const recentActivity = projectTaskList.some(task => {
        const taskDate = new Date(task.updated_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return taskDate > weekAgo;
      });
      return !recentActivity && projectTaskList.length > 0;
    });

    if (stuckProjects.length > 0) {
      return {
        type: 'warning',
        title: 'Stalled Projects Detected',
        description: `${stuckProjects.length} project(s) haven't had activity in the past week. They might need attention.`,
        confidence: 0.8,
        actionable: true,
        suggested_actions: [
          'Review stalled projects and identify blockers',
          'Break down next steps into specific tasks',
          'Consider if project scope needs adjustment'
        ],
        data_points: stuckProjects.map(p => ({ name: p.name, id: p.id }))
      };
    }

    return null;
  }

  /**
   * Analyze time-based patterns
   */
  private analyzeTimePatterns(tasks: any[], journalEntries: any[]): AIInsight | null {
    const recentEntries = journalEntries
      .filter(entry => {
        const entryDate = new Date(entry.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate > weekAgo;
      });

    if (recentEntries.length < 3) return null;

    const entryTimes = recentEntries.map(entry => new Date(entry.created_at).getHours());
    const avgTime = entryTimes.reduce((sum, time) => sum + time, 0) / entryTimes.length;

    let timeInsight = '';
    if (avgTime < 8) {
      timeInsight = 'You tend to be most reflective in the early morning hours.';
    } else if (avgTime > 20) {
      timeInsight = 'You often do your journaling in the evening hours.';
    } else {
      timeInsight = 'You journal throughout the day at various times.';
    }

    return {
      type: 'pattern',
      title: 'Journaling Time Pattern',
      description: `${timeInsight} This consistency can help build a strong reflection habit.`,
      confidence: 0.6,
      actionable: true,
      suggested_actions: [
        'Consider setting a regular time for journaling',
        'Use this natural timing to your advantage'
      ]
    };
  }

  /**
   * Suggest tasks based on incomplete items
   */
  private suggestBasedOnIncompleteTasks(tasks: any[]): TaskSuggestion | null {
    const overdueTasks = tasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      return new Date(task.due_date) < new Date();
    });

    if (overdueTasks.length > 0) {
      return {
        title: 'Review Overdue Tasks',
        description: 'You have overdue tasks that might need attention, rescheduling, or breaking down into smaller steps.',
        priority: 'high',
        estimated_duration: 30,
        suggested_tags: ['review', 'planning'],
        reasoning: `You have ${overdueTasks.length} overdue task(s) that need attention.`
      };
    }

    return null;
  }

  /**
   * Suggest tasks based on journal patterns
   */
  private suggestBasedOnJournalPatterns(entries: any[]): TaskSuggestion | null {
    const goalEntries = entries.filter(entry => entry.entry_type === 'goal_progress');
    const learningEntries = entries.filter(entry => entry.entry_type === 'learning');

    if (goalEntries.length > learningEntries.length) {
      return {
        title: 'Schedule Learning Time',
        description: 'Based on your journal patterns, you focus a lot on goals. Consider scheduling dedicated time for learning new skills.',
        priority: 'medium',
        estimated_duration: 60,
        suggested_tags: ['learning', 'development'],
        reasoning: 'Your journal shows strong goal focus but limited learning entries.'
      };
    }

    return null;
  }

  /**
   * Suggest routine maintenance tasks
   */
  private suggestMaintenanceTasks(tasks: any[]): TaskSuggestion | null {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentTasks = tasks.filter(task => new Date(task.created_at) > lastWeek);

    if (recentTasks.length > 10) {
      return {
        title: 'Organize Task List',
        description: 'You\'ve been creating many tasks lately. Take time to organize, prioritize, and clean up your task list.',
        priority: 'medium',
        estimated_duration: 20,
        suggested_tags: ['organization', 'maintenance'],
        reasoning: `You've created ${recentTasks.length} tasks in the past week.`
      };
    }

    return null;
  }

  /**
   * Enhance insights with AI (when OpenAI is available)
   */
  private async enhanceInsightsWithAI(insights: AIInsight[], userData: any): Promise<AIInsight[]> {
    // This would use OpenAI to provide more sophisticated analysis
    // For now, return the basic insights
    return insights;
  }

  /**
   * Mock insights for development
   */
  private getMockInsights(): AIInsight[] {
    return [
      {
        type: 'productivity',
        title: 'Strong Morning Productivity',
        description: 'You complete most of your tasks between 9-11 AM. Consider scheduling important work during this time.',
        confidence: 0.8,
        actionable: true,
        suggested_actions: [
          'Block calendar time from 9-11 AM for focused work',
          'Schedule meetings outside your peak productivity hours'
        ]
      },
      {
        type: 'mood',
        title: 'Mood-Task Correlation',
        description: 'Your task completion rate is 25% higher on days when you journal about achievements.',
        confidence: 0.7,
        actionable: true,
        suggested_actions: [
          'Start each day by noting one small win from yesterday',
          'Keep an achievement log to boost motivation'
        ]
      },
      {
        type: 'pattern',
        title: 'Weekly Planning Gap',
        description: 'You tend to create many tasks on Mondays but fewer throughout the week. Consider better weekly planning.',
        confidence: 0.6,
        actionable: true,
        suggested_actions: [
          'Schedule 15 minutes each Friday for next week planning',
          'Review and adjust tasks mid-week'
        ]
      }
    ];
  }

  /**
   * Mock task suggestions for development
   */
  private getMockTaskSuggestions(): TaskSuggestion[] {
    return [
      {
        title: 'Weekly Review Session',
        description: 'Schedule time to review completed tasks, assess progress, and plan for the upcoming week.',
        priority: 'medium',
        estimated_duration: 30,
        suggested_tags: ['review', 'planning'],
        reasoning: 'Regular reviews help maintain momentum and adjust priorities.'
      },
      {
        title: 'Skill Development Research',
        description: 'Based on your recent tasks, research new tools or techniques that could improve your workflow.',
        priority: 'low',
        estimated_duration: 45,
        suggested_tags: ['learning', 'research'],
        reasoning: 'Continuous learning can improve long-term productivity.'
      },
      {
        title: 'Energy Management Experiment',
        description: 'Track your energy levels throughout the day for a week to optimize your schedule.',
        priority: 'low',
        estimated_duration: 10,
        suggested_tags: ['self-care', 'tracking'],
        reasoning: 'Understanding your energy patterns can improve task scheduling.'
      }
    ];
  }

  /**
   * Mock journal prompts for development
   */
  private getMockJournalPrompts(): JournalPrompt[] {
    return [
      {
        prompt: "What's one thing you accomplished today that you didn't expect to complete?",
        type: "achievement",
        follow_up_questions: [
          "What made this possible?",
          "How can you replicate this success?"
        ]
      },
      {
        prompt: "If you could give your past self from last week one piece of advice, what would it be?",
        type: "reflection",
        context: "Based on your recent experiences"
      },
      {
        prompt: "What's something you're looking forward to, and what steps can you take to make it happen?",
        type: "goal_progress",
        follow_up_questions: [
          "What obstacles might you face?",
          "Who could support you in this?"
        ]
      }
    ];
  }
}

export default RAGService; 