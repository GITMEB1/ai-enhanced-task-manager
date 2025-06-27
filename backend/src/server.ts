import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import database and Redis configurations
import { checkDatabaseConnection, closeDatabaseConnection } from './config/database';
import redisClient from './config/redis';

// Import routes
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import projectRoutes from './routes/projects';
import tagRoutes from './routes/tags';
import notificationRoutes from './routes/notifications';

const app = express();
const PORT = process.env.PORT || 8000;

// Declare server variable at module scope for graceful shutdown
let server: any;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  let dbHealth = true; // Default to healthy in development
  
  if (process.env.NODE_ENV === 'production') {
    dbHealth = await checkDatabaseConnection();
  }
  
  const redisHealth = redisClient.isClientConnected();
  
  // For development, always consider healthy (database and Redis are optional)
  const status = process.env.NODE_ENV === 'development' ? 'healthy' : (dbHealth ? 'healthy' : 'unhealthy');
  const httpStatus = status === 'healthy' ? 200 : 503;
  
  res.status(httpStatus).json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      database: process.env.NODE_ENV === 'development' ? 'skipped (dev mode)' : (dbHealth ? 'connected' : 'disconnected'),
      redis: process.env.NODE_ENV === 'development' ? 'skipped (dev mode)' : (redisHealth ? 'connected' : 'disconnected'),
    },
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  // Close server
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      
      // Close database connection
      await closeDatabaseConnection();
      
      // Close Redis connection if it was connected
      if (process.env.NODE_ENV === 'production') {
        await redisClient.disconnect();
      }
      
      console.log('Graceful shutdown completed');
      process.exit(0);
    });
  } else {
    // If server is not running, just close connections
    await closeDatabaseConnection();
    if (process.env.NODE_ENV === 'production') {
      await redisClient.disconnect();
    }
    process.exit(0);
  }
  
  // Force close after 30 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Start server
const startServer = async () => {
  try {
    // Check database connection (optional in development)
    if (process.env.NODE_ENV === 'production') {
      const dbConnected = await checkDatabaseConnection();
      if (!dbConnected) {
        throw new Error('Database connection failed');
      }
      console.log('✅ Database connection established');
    } else {
      console.log('⚠️ Skipping database connection in development mode');
    }
    
    // Skip Redis in development mode
    if (process.env.NODE_ENV === 'production') {
      try {
        await redisClient.connect();
        console.log('✅ Redis connected');
      } catch (redisError) {
        console.warn('⚠️ Redis connection failed:', (redisError as Error).message);
        throw redisError; // Fail in production if Redis is unavailable
      }
    } else {
      console.log('⚠️ Skipping Redis connection in development mode');
    }
    
    // Start HTTP server
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Setup graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    return server;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if this file is executed directly
if (require.main === module) {
  startServer();
}

export default app; 