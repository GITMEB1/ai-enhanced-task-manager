import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { log } from '../../utils/logger';

export interface GmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface EmailToTask {
  id: string;
  subject: string;
  body: string;
  sender: string;
  date: Date;
  labels: string[];
  attachments?: string[];
}

export interface EmailThread {
  id: string;
  threadId: string;
  subject: string;
  participants: string[];
  messageCount: number;
  lastMessage: Date;
  snippet: string;
  labels: string[];
  messages: EmailMessage[];
}

export interface EmailMessage {
  id: string;
  subject: string;
  body: string;
  sender: string;
  recipient: string;
  date: Date;
  attachments?: string[];
}

export interface ProjectContext {
  emailThreads: EmailThread[];
  summary: string;
  keyInsights: string[];
  participants: string[];
  timespan: {
    start: Date;
    end: Date;
  };
  actionItems: string[];
  decisions: string[];
  nextSteps: string[];
}

export class GmailService {
  private oauth2Client: OAuth2Client;
  private gmail: any;
  private calendar: any;

  constructor(config: GmailConfig) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Generate OAuth URL for user authorization
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<any> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      log.externalApiCall('Gmail', 'exchangeCodeForTokens', false, undefined, error as Error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Set user tokens for authenticated requests
   */
  setTokens(tokens: any): void {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Get recent emails that could be converted to tasks
   */
  async getActionableEmails(maxResults: number = 10): Promise<EmailToTask[]> {
    try {
      // Search for emails with action-oriented keywords
      const query = 'is:unread (TODO OR "follow up" OR "action required" OR "please review" OR "deadline" OR "urgent")';
      
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults
      });

      const emails: EmailToTask[] = [];

      if (response.data.messages) {
        for (const message of response.data.messages.slice(0, maxResults)) {
          try {
            const emailData = await this.gmail.users.messages.get({
              userId: 'me',
              id: message.id,
              format: 'full'
            });

            const email = this.parseEmailToTask(emailData.data);
            if (email) {
              emails.push(email);
            }
          } catch (emailError) {
            log.externalApiCall('Gmail', 'getIndividualEmail', false, undefined, emailError as Error);
            // Continue with other emails
          }
        }
      }

      return emails;
    } catch (error) {
      log.externalApiCall('Gmail', 'getActionableEmails', false, undefined, error as Error);
      // Return mock data for development
      return this.getMockEmails();
    }
  }

  /**
   * Parse Gmail message to EmailToTask format
   */
  private parseEmailToTask(message: any): EmailToTask | null {
    try {
      const headers = message.payload.headers;
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
      const sender = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
      const date = new Date(parseInt(message.internalDate));

      // Extract body text
      let body = '';
      if (message.payload.body?.data) {
        body = Buffer.from(message.payload.body.data, 'base64').toString();
      } else if (message.payload.parts) {
        for (const part of message.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            body = Buffer.from(part.body.data, 'base64').toString();
            break;
          }
        }
      }

      // Clean up body text
      body = body.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

      // Extract labels
      const labels = message.labelIds || [];

      return {
        id: message.id,
        subject,
        body: body.substring(0, 1000), // Limit body length
        sender,
        date,
        labels
      };
    } catch (error) {
      log.error('Error parsing email to task format', { error: (error as Error).message, messageId: message?.id });
      return null;
    }
  }

  /**
   * Get upcoming calendar events that could become tasks
   */
  async getUpcomingEvents(maxResults: number = 10): Promise<any[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items || [];
    } catch (error) {
      log.externalApiCall('Gmail', 'getUpcomingEvents', false, undefined, error as Error);
      return [];
    }
  }

  /**
   * Extract action items from email content using pattern matching
   */
  extractActionItems(emailBody: string): string[] {
    const actionPatterns = [
      /(?:please|could you|can you|need to|should|must)\s+([^.!?]+)/gi,
      /(?:todo|to do|action item|task):\s*([^.!?\n]+)/gi,
      /(?:deadline|due|by)\s+([^.!?\n]+)/gi
    ];

    const actionItems: string[] = [];

    for (const pattern of actionPatterns) {
      const matches = emailBody.match(pattern);
      if (matches) {
        actionItems.push(...matches.map(match => match.trim()));
      }
    }

    return actionItems.slice(0, 5); // Limit to 5 action items per email
  }

  /**
   * Suggest task priority based on email content and sender
   */
  suggestPriority(email: EmailToTask): 'low' | 'medium' | 'high' {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'deadline'];
    const importantSenders = ['boss', 'manager', 'client', 'customer'];

    const content = (email.subject + ' ' + email.body).toLowerCase();
    
    // Check for urgent keywords
    if (urgentKeywords.some(keyword => content.includes(keyword))) {
      return 'high';
    }

    // Check for important senders
    if (importantSenders.some(sender => email.sender.toLowerCase().includes(sender))) {
      return 'high';
    }

    // Check for labels indicating importance
    if (email.labels.includes('IMPORTANT')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Convert email to task suggestion
   */
  convertEmailToTaskSuggestion(email: EmailToTask): any {
    const actionItems = this.extractActionItems(email.body);
    const priority = this.suggestPriority(email);

    return {
      title: email.subject.startsWith('Re:') ? email.subject.substring(3).trim() : email.subject,
      description: `Email from: ${email.sender}\n\nContent: ${email.body.substring(0, 300)}${email.body.length > 300 ? '...' : ''}\n\nAction items:\n${actionItems.map(item => `- ${item}`).join('\n')}`,
      priority,
      due_date: this.extractDueDate(email.body),
      metadata: {
        source: 'gmail',
        email_id: email.id,
        sender: email.sender,
        original_date: email.date
      }
    };
  }

  /**
   * Extract due date from email content
   */
  private extractDueDate(content: string): Date | undefined {
    const datePatterns = [
      /(?:due|deadline|by)\s+([A-Za-z]+\s+\d{1,2})/gi,
      /(?:due|deadline|by)\s+(\d{1,2}\/\d{1,2}\/\d{4})/gi,
      /(?:due|deadline|by)\s+(\d{1,2}\/\d{1,2})/gi
    ];

    for (const pattern of datePatterns) {
      const match = content.match(pattern);
      if (match) {
        try {
          const dateStr = match[1];
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date;
          }
        } catch (error) {
          // Continue to next pattern
        }
      }
    }

    return undefined;
  }

  /**
   * Mock emails for development/testing
   */
  private getMockEmails(): EmailToTask[] {
    return [
      {
        id: 'mock-1',
        subject: 'Please review the quarterly report',
        body: 'Hi, could you please review the Q4 report and provide feedback by Friday? Thanks!',
        sender: 'manager@company.com',
        date: new Date(),
        labels: ['IMPORTANT']
      },
      {
        id: 'mock-2',
        subject: 'Action required: Update project timeline',
        body: 'The project timeline needs to be updated with the new deadline. Please complete this ASAP.',
        sender: 'team@company.com',
        date: new Date(),
        labels: ['INBOX']
      },
      {
        id: 'mock-3',
        subject: 'Follow up on client meeting',
        body: 'TODO: Send the proposal to the client and schedule a follow-up meeting for next week.',
        sender: 'sales@company.com',
        date: new Date(),
        labels: ['INBOX']
      }
    ];
  }

  /**
   * Search for email threads related to a project or topic
   */
  async searchEmailThreads(query: string, maxResults: number = 20): Promise<EmailThread[]> {
    try {
      const response = await this.gmail.users.threads.list({
        userId: 'me',
        q: query,
        maxResults
      });

      const threads: EmailThread[] = [];

      if (response.data.threads) {
        for (const thread of response.data.threads.slice(0, maxResults)) {
          try {
            const threadData = await this.gmail.users.threads.get({
              userId: 'me',
              id: thread.id,
              format: 'full'
            });

            const emailThread = this.parseEmailThread(threadData.data);
            if (emailThread) {
              threads.push(emailThread);
            }
          } catch (threadError) {
            log.externalApiCall('Gmail', 'getIndividualThread', false, undefined, threadError as Error);
            // Continue with other threads
          }
        }
      }

      return threads;
    } catch (error) {
      log.externalApiCall('Gmail', 'searchEmailThreads', false, undefined, error as Error);
      // Return mock data for development
      return this.getMockEmailThreads(query);
    }
  }

  /**
   * Get specific email thread by ID
   */
  async getEmailThread(threadId: string): Promise<EmailThread | null> {
    try {
      const threadData = await this.gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        format: 'full'
      });

      return this.parseEmailThread(threadData.data);
    } catch (error) {
      log.externalApiCall('Gmail', 'getEmailThread', false, undefined, error as Error);
      return null;
    }
  }

  /**
   * Analyze email threads to extract project context
   */
  async analyzeProjectContext(threadIds: string[]): Promise<ProjectContext> {
    try {
      const threads: EmailThread[] = [];
      
      for (const threadId of threadIds) {
        const thread = await this.getEmailThread(threadId);
        if (thread) {
          threads.push(thread);
        }
      }

      return this.extractProjectContext(threads);
    } catch (error) {
      log.error('Error analyzing project context', { error: (error as Error).message });
      return this.getMockProjectContext();
    }
  }

  /**
   * Parse Gmail thread to EmailThread format
   */
  private parseEmailThread(threadData: any): EmailThread | null {
    try {
      const messages = threadData.messages || [];
      if (messages.length === 0) return null;

      const firstMessage = messages[0];
      const lastMessage = messages[messages.length - 1];
      
      const headers = firstMessage.payload.headers;
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
      
      // Extract participants
      const participants = new Set<string>();
      messages.forEach((msg: any) => {
        const msgHeaders = msg.payload.headers;
        const from = msgHeaders.find((h: any) => h.name === 'From')?.value;
        const to = msgHeaders.find((h: any) => h.name === 'To')?.value;
        const cc = msgHeaders.find((h: any) => h.name === 'Cc')?.value;
        
        if (from) participants.add(from);
        if (to) to.split(',').forEach((email: string) => participants.add(email.trim()));
        if (cc) cc.split(',').forEach((email: string) => participants.add(email.trim()));
      });

      // Parse messages
      const emailMessages: EmailMessage[] = messages.map((msg: any) => {
        const msgHeaders = msg.payload.headers;
        const msgSubject = msgHeaders.find((h: any) => h.name === 'Subject')?.value || subject;
        const sender = msgHeaders.find((h: any) => h.name === 'From')?.value || 'Unknown';
        const recipient = msgHeaders.find((h: any) => h.name === 'To')?.value || 'Unknown';
        const date = new Date(parseInt(msg.internalDate));

        // Extract body
        let body = '';
        if (msg.payload.body?.data) {
          body = Buffer.from(msg.payload.body.data, 'base64').toString();
        } else if (msg.payload.parts) {
          for (const part of msg.payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              body = Buffer.from(part.body.data, 'base64').toString();
              break;
            }
          }
        }

        return {
          id: msg.id,
          subject: msgSubject,
          body: body.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim(),
          sender,
          recipient,
          date
        };
      });

      // Create snippet from first message
      const firstBody = emailMessages[0]?.body || '';
      const snippet = firstBody.substring(0, 200) + (firstBody.length > 200 ? '...' : '');

      return {
        id: threadData.id,
        threadId: threadData.id,
        subject,
        participants: Array.from(participants),
        messageCount: messages.length,
        lastMessage: new Date(parseInt(lastMessage.internalDate)),
        snippet,
        labels: firstMessage.labelIds || [],
        messages: emailMessages
      };
    } catch (error) {
      log.error('Error parsing email thread', { error: (error as Error).message, threadId: threadData?.id });
      return null;
    }
  }

  /**
   * Extract project context from email threads
   */
  private extractProjectContext(threads: EmailThread[]): ProjectContext {
    if (threads.length === 0) {
      return this.getMockProjectContext();
    }

    // Collect all participants
    const allParticipants = new Set<string>();
    threads.forEach(thread => {
      thread.participants.forEach(p => allParticipants.add(p));
    });

    // Find time span
    const allDates = threads.flatMap(thread => 
      thread.messages.map(msg => msg.date)
    );
    const startDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const endDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // Extract action items and decisions from all messages
    const allContent = threads.flatMap(thread => 
      thread.messages.map(msg => msg.body)
    ).join('\n\n');

    const actionItems = this.extractActionItemsFromContent(allContent);
    const decisions = this.extractDecisions(allContent);
    const keyInsights = this.extractKeyInsights(allContent);

    // Generate summary
    const summary = this.generateContextSummary(threads, actionItems, decisions);

    return {
      emailThreads: threads,
      summary,
      keyInsights,
      participants: Array.from(allParticipants),
      timespan: {
        start: startDate,
        end: endDate
      },
      actionItems,
      decisions,
      nextSteps: actionItems.slice(0, 5) // Use first 5 action items as next steps
    };
  }

  /**
   * Extract action items from content using enhanced pattern matching
   */
  private extractActionItemsFromContent(content: string): string[] {
    const actionPatterns = [
      /(?:action item|todo|to do|task|need to|should|must|will|plan to)\s*:?\s*([^.!?\n]+)/gi,
      /(?:please|could you|can you|would you)\s+([^.!?\n]+)/gi,
      /(?:deadline|due|by|before)\s+([^.!?\n]+)/gi,
      /(?:next steps?|follow up|follow-up)\s*:?\s*([^.!?\n]+)/gi,
      /(?:deliverable|milestone)\s*:?\s*([^.!?\n]+)/gi
    ];

    const actionItems: string[] = [];

    for (const pattern of actionPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        actionItems.push(...matches.map(match => match.trim()));
      }
    }

    // Remove duplicates and clean up
    return [...new Set(actionItems)]
      .filter(item => item.length > 10 && item.length < 200)
      .slice(0, 10);
  }

  /**
   * Extract decisions from content
   */
  private extractDecisions(content: string): string[] {
    const decisionPatterns = [
      /(?:decided|decision|agree|agreed|conclusion|resolved|determined)\s*:?\s*([^.!?\n]+)/gi,
      /(?:we will|we'll|it was decided|final decision)\s+([^.!?\n]+)/gi,
      /(?:approved|confirmed|signed off)\s+([^.!?\n]+)/gi
    ];

    const decisions: string[] = [];

    for (const pattern of decisionPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        decisions.push(...matches.map(match => match.trim()));
      }
    }

    return [...new Set(decisions)]
      .filter(item => item.length > 10 && item.length < 200)
      .slice(0, 5);
  }

  /**
   * Extract key insights from content
   */
  private extractKeyInsights(content: string): string[] {
    const insightPatterns = [
      /(?:important|key|critical|significant|main|primary)\s+([^.!?\n]+)/gi,
      /(?:issue|problem|challenge|concern|risk)\s*:?\s*([^.!?\n]+)/gi,
      /(?:opportunity|benefit|advantage)\s*:?\s*([^.!?\n]+)/gi,
      /(?:requirement|specification|criteria)\s*:?\s*([^.!?\n]+)/gi
    ];

    const insights: string[] = [];

    for (const pattern of insightPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        insights.push(...matches.map(match => match.trim()));
      }
    }

    return [...new Set(insights)]
      .filter(item => item.length > 15 && item.length < 300)
      .slice(0, 8);
  }

  /**
   * Generate context summary
   */
  private generateContextSummary(threads: EmailThread[], actionItems: string[], decisions: string[]): string {
    const threadCount = threads.length;
    const messageCount = threads.reduce((sum, thread) => sum + thread.messageCount, 0);
    const participantCount = new Set(threads.flatMap(t => t.participants)).size;
    
    const timeSpan = threads.length > 0 ? 
      `${threads[0].messages[0]?.date.toLocaleDateString()} to ${threads[threads.length - 1].lastMessage.toLocaleDateString()}` : 
      'Unknown timeframe';

    return `Project context extracted from ${threadCount} email thread(s) containing ${messageCount} message(s) with ${participantCount} participant(s) spanning ${timeSpan}. Key discussion points include ${actionItems.length} action items and ${decisions.length} decisions. Primary subjects: ${threads.map(t => t.subject).slice(0, 3).join(', ')}${threads.length > 3 ? '...' : ''}.`;
  }

  /**
   * Mock email threads for development
   */
  private getMockEmailThreads(query: string): EmailThread[] {
    return [
      {
        id: 'thread-1',
        threadId: 'thread-1',
        subject: `Project kickoff: ${query}`,
        participants: ['manager@company.com', 'team@company.com', 'client@external.com'],
        messageCount: 4,
        lastMessage: new Date(),
        snippet: 'Initial discussion about project requirements and timeline...',
        labels: ['INBOX', 'IMPORTANT'],
        messages: [
          {
            id: 'msg-1',
            subject: `Project kickoff: ${query}`,
            body: `Hi team, we need to start the ${query} project. Key requirements include implementing the new feature set and ensuring quality standards.`,
            sender: 'manager@company.com',
            recipient: 'team@company.com',
            date: new Date(Date.now() - 86400000 * 3)
          },
          {
            id: 'msg-2',
            subject: `Re: Project kickoff: ${query}`,
            body: 'Thanks for the kickoff. I suggest we break this into phases. First phase should focus on core functionality.',
            sender: 'team@company.com',
            recipient: 'manager@company.com',
            date: new Date(Date.now() - 86400000 * 2)
          }
        ]
      },
      {
        id: 'thread-2',
        threadId: 'thread-2',
        subject: `Budget discussion for ${query}`,
        participants: ['finance@company.com', 'manager@company.com'],
        messageCount: 2,
        lastMessage: new Date(Date.now() - 86400000),
        snippet: 'Budget allocation and resource planning discussion...',
        labels: ['INBOX'],
        messages: [
          {
            id: 'msg-3',
            subject: `Budget discussion for ${query}`,
            body: 'We need to finalize the budget for this project. Estimated cost is $50k including resources.',
            sender: 'finance@company.com',
            recipient: 'manager@company.com',
            date: new Date(Date.now() - 86400000)
          }
        ]
      }
    ];
  }

  /**
   * Mock project context for development
   */
  private getMockProjectContext(): ProjectContext {
    return {
      emailThreads: [],
      summary: 'Mock project context for development and testing purposes.',
      keyInsights: [
        'Budget approval required for next phase',
        'Technical architecture needs review',
        'Client feedback indicates priority on user experience'
      ],
      participants: ['manager@company.com', 'team@company.com', 'client@external.com'],
      timespan: {
        start: new Date(Date.now() - 86400000 * 7),
        end: new Date()
      },
      actionItems: [
        'Finalize technical specifications',
        'Schedule client review meeting',
        'Prepare budget proposal'
      ],
      decisions: [
        'Decided to use React for frontend',
        'Approved additional development resources'
      ],
      nextSteps: [
        'Set up development environment',
        'Create project timeline',
        'Assign team responsibilities'
      ]
    };
  }
}

export default GmailService; 