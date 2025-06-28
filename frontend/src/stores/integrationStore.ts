import { create } from 'zustand';
import { integrationAPI } from '../services/api';

interface AIInsight {
  type: string;
  title?: string;
  message?: string;
  description?: string;
  confidence: number;
  actionable?: boolean;
  suggested_actions?: string[];
  recommendation?: string;
}

interface TaskSuggestion {
  title: string;
  description?: string;
  content?: string;
  priority: 'low' | 'medium' | 'high';
  reasoning: string;
  estimated_duration?: number;
  metadata?: any;
}

interface JournalPrompt {
  prompt: string;
  type: 'gratitude' | 'reflection' | 'achievement' | 'general';
  context: string;
}

interface ServiceStatus {
  gmail_service: {
    available: boolean;
    configured: boolean;
    authenticated: boolean;
  };
  rag_service: {
    available: boolean;
    configured: boolean;
    ready: boolean;
  };
  features: {
    ai_insights: boolean;
    gmail_integration: boolean;
    basic_patterns: boolean;
  };
}

interface ActionableEmail {
  id: string;
  subject: string;
  sender: string;
  snippet: string;
  date: string;
  labels: string[];
  actionItems: string[];
  priority: 'low' | 'medium' | 'high';
  hasDeadline: boolean;
  estimatedDuration?: number;
}

interface EmailThread {
  id: string;
  threadId: string;
  subject: string;
  participants: string[];
  messageCount: number;
  lastMessage: string;
  snippet: string;
  labels: string[];
}

interface EmailContext {
  summary: string;
  keyInsights: string[];
  participants: string[];
  timespan: {
    start: string;
    end: string;
  };
  actionItems: string[];
  decisions: string[];
  nextSteps: string[];
}

interface IntegrationState {
  // Service Status
  serviceStatus: ServiceStatus | null;
  serviceStatusLoading: boolean;

  // AI Insights
  insights: AIInsight[];
  taskSuggestions: TaskSuggestion[];
  journalPrompts: JournalPrompt[];
  insightsLoading: boolean;
  insightsError: string | null;
  poweredBy: 'AI' | 'pattern_analysis';
  serviceMode: 'enhanced' | 'basic';

  // Gmail Integration
  emails: ActionableEmail[];
  gmailAuthUrl: string | null;
  emailsLoading: boolean;
  gmailConnected: boolean;
  selectedEmailIds: string[];

  // Email Threads for Project Context
  emailThreads: EmailThread[];
  searchingThreads: boolean;
  analyzingContext: boolean;
  emailContext: EmailContext | null;

  // Loading states
  acceptingSuggestion: boolean;
  convertingEmails: boolean;

  // Actions
  fetchServiceStatus: () => Promise<void>;
  fetchInsights: () => Promise<void>;
  acceptTaskSuggestion: (suggestion: TaskSuggestion) => Promise<void>;
  acceptJournalPrompt: (prompt: JournalPrompt) => Promise<void>;
  getGmailAuthUrl: () => Promise<void>;
  fetchEmails: () => Promise<void>;
  convertEmailsToTasks: (emailIds: string[]) => Promise<void>;
  toggleEmailSelection: (emailId: string) => void;
  selectAllEmails: () => void;
  clearEmailSelection: () => void;
  
  // Email Thread Actions
  searchEmailThreads: (query: string, maxResults?: number) => Promise<EmailThread[]>;
  analyzeEmailContext: (threadIds: string[]) => Promise<EmailContext>;
  createProjectWithContext: (projectData: any) => Promise<void>;
  
  clearError: () => void;
}

export const useIntegrationStore = create<IntegrationState>((set, get) => ({
  // Initial state
  serviceStatus: null,
  serviceStatusLoading: false,
  insights: [],
  taskSuggestions: [],
  journalPrompts: [],
  insightsLoading: false,
  insightsError: null,
  poweredBy: 'pattern_analysis',
  serviceMode: 'basic',
  emails: [],
  gmailAuthUrl: null,
  emailsLoading: false,
  gmailConnected: false,
  selectedEmailIds: [],
  emailThreads: [],
  searchingThreads: false,
  analyzingContext: false,
  emailContext: null,
  acceptingSuggestion: false,
  convertingEmails: false,

  // Actions
  fetchServiceStatus: async () => {
    set({ serviceStatusLoading: true });
    try {
      const response = await integrationAPI.getStatus();
      set({ 
        serviceStatus: response.data,
        serviceStatusLoading: false,
        serviceMode: response.data.features.ai_insights ? 'enhanced' : 'basic'
      });
    } catch (error) {
      console.error('Failed to fetch service status:', error);
      set({ serviceStatusLoading: false });
    }
  },

  fetchInsights: async () => {
    set({ insightsLoading: true, insightsError: null });
    try {
      const response = await integrationAPI.getInsights();
      const data = response.data;
      
      set({
        insights: data.insights || [],
        taskSuggestions: data.task_suggestions || [],
        journalPrompts: data.journal_prompts || [],
        poweredBy: data.powered_by,
        serviceMode: data.service_status,
        insightsLoading: false
      });
    } catch (error: any) {
      console.error('Failed to fetch insights:', error);
      set({
        insightsError: error.response?.data?.error || 'Failed to fetch insights',
        insightsLoading: false
      });
    }
  },

  acceptTaskSuggestion: async (suggestion: TaskSuggestion) => {
    set({ acceptingSuggestion: true });
    try {
      await integrationAPI.acceptSuggestion({
        suggestion_type: 'task',
        suggestion_data: suggestion
      });
      
      // Remove the accepted suggestion from the list
      const { taskSuggestions } = get();
      set({ 
        taskSuggestions: taskSuggestions.filter(s => s.title !== suggestion.title),
        acceptingSuggestion: false
      });
    } catch (error) {
      console.error('Failed to accept task suggestion:', error);
      set({ acceptingSuggestion: false });
    }
  },

  acceptJournalPrompt: async (prompt: JournalPrompt) => {
    set({ acceptingSuggestion: true });
    try {
      await integrationAPI.acceptSuggestion({
        suggestion_type: 'journal_prompt',
        suggestion_data: prompt
      });
      
      // Remove the accepted prompt from the list
      const { journalPrompts } = get();
      set({ 
        journalPrompts: journalPrompts.filter(p => p.prompt !== prompt.prompt),
        acceptingSuggestion: false
      });
    } catch (error) {
      console.error('Failed to accept journal prompt:', error);
      set({ acceptingSuggestion: false });
    }
  },

  getGmailAuthUrl: async () => {
    try {
      const response = await integrationAPI.getGmailAuth();
      if (response.data.auth_url) {
        set({ 
          gmailAuthUrl: response.data.auth_url,
          gmailConnected: false
        });
      }
    } catch (error) {
      console.error('Failed to get Gmail auth URL:', error);
    }
  },

  fetchEmails: async () => {
    set({ emailsLoading: true });
    try {
      const response = await integrationAPI.getEmails();
      set({ 
        emails: response.data.emails || [],
        emailsLoading: false,
        gmailConnected: response.data.authenticated || false
      });
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      set({ emailsLoading: false, gmailConnected: false });
    }
  },

  convertEmailsToTasks: async (emailIds: string[]) => {
    set({ convertingEmails: true });
    try {
      await integrationAPI.convertEmailsToTasks(emailIds);
      
      // Remove converted emails from the list
      const { emails } = get();
      set({ 
        emails: emails.filter(email => !emailIds.includes(email.id)),
        selectedEmailIds: [],
        convertingEmails: false
      });
    } catch (error) {
      console.error('Failed to convert emails to tasks:', error);
      set({ convertingEmails: false });
    }
  },

  toggleEmailSelection: (emailId: string) => {
    const { selectedEmailIds } = get();
    if (selectedEmailIds.includes(emailId)) {
      set({ selectedEmailIds: selectedEmailIds.filter(id => id !== emailId) });
    } else {
      set({ selectedEmailIds: [...selectedEmailIds, emailId] });
    }
  },

  selectAllEmails: () => {
    const { emails } = get();
    set({ selectedEmailIds: emails.map(email => email.id) });
  },

  clearEmailSelection: () => {
    set({ selectedEmailIds: [] });
  },

  searchEmailThreads: async (query: string, maxResults?: number) => {
    set({ searchingThreads: true });
    try {
      const response = await integrationAPI.searchEmailThreads(query, maxResults);
      const threads = response.data.threads || [];
      set({ 
        emailThreads: threads,
        searchingThreads: false
      });
      return threads;
    } catch (error) {
      console.error('Failed to search email threads:', error);
      set({ searchingThreads: false });
      return [];
    }
  },

  analyzeEmailContext: async (threadIds: string[]) => {
    set({ analyzingContext: true });
    try {
      const response = await integrationAPI.analyzeEmailContext(threadIds);
      const context = response.data.context;
      set({ 
        emailContext: context,
        analyzingContext: false
      });
      return context;
    } catch (error) {
      console.error('Failed to analyze email context:', error);
      set({ analyzingContext: false });
      throw error;
    }
  },

  createProjectWithContext: async (projectData: any) => {
    set({ convertingEmails: true });
    try {
      await integrationAPI.createProjectWithContext(projectData);
      set({ convertingEmails: false });
    } catch (error) {
      console.error('Failed to create project with context:', error);
      set({ convertingEmails: false });
      throw error;
    }
  },

  clearError: () => {
    set({ insightsError: null });
  }
})); 