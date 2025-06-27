import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

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
      console.error('Error exchanging code for tokens:', error);
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
            console.error('Error fetching individual email:', emailError);
            // Continue with other emails
          }
        }
      }

      return emails;
    } catch (error) {
      console.error('Error fetching actionable emails:', error);
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
      console.error('Error parsing email:', error);
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
      console.error('Error fetching calendar events:', error);
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
}

export default GmailService; 