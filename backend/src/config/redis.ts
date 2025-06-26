import { createClient, RedisClientType } from 'redis';

class RedisConfig {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    // Redis v4+ uses URL format
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = process.env.REDIS_PORT || '6379';
    const redisPassword = process.env.REDIS_PASSWORD;
    
    let redisUrl = `redis://${redisHost}:${redisPort}`;
    if (redisPassword) {
      redisUrl = `redis://:${redisPassword}@${redisHost}:${redisPort}`;
    }

    this.client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: false // Disable reconnection for development
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      console.error('Redis client error:', err);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      console.log('Redis client disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      console.error('Error disconnecting from Redis:', error);
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  isClientConnected(): boolean {
    return this.isConnected;
  }

  // Common Redis operations for task management
  async setTaskReminder(taskId: string, reminderData: any, ttl: number): Promise<void> {
    const key = `reminder:${taskId}`;
    await this.client.setEx(key, ttl, JSON.stringify(reminderData));
  }

  async getTaskReminder(taskId: string): Promise<any | null> {
    const key = `reminder:${taskId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteTaskReminder(taskId: string): Promise<void> {
    const key = `reminder:${taskId}`;
    await this.client.del(key);
  }

  // Session management
  async setUserSession(userId: string, sessionData: any, ttl: number = 86400): Promise<void> {
    const key = `session:${userId}`;
    await this.client.setEx(key, ttl, JSON.stringify(sessionData));
  }

  async getUserSession(userId: string): Promise<any | null> {
    const key = `session:${userId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteUserSession(userId: string): Promise<void> {
    const key = `session:${userId}`;
    await this.client.del(key);
  }
}

export const redisClient = new RedisConfig();
export default redisClient; 