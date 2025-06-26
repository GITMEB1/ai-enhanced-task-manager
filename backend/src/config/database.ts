import knex from 'knex';

// Use require for CommonJS module
const config = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment as keyof typeof config];

// Only initialize db if config is valid
export const db = dbConfig && dbConfig.client ? knex(dbConfig) : null;

// Health check function
export const checkDatabaseConnection = async (): Promise<boolean> => {
  if (!db) return false;
  try {
    await db.raw('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
export const closeDatabaseConnection = async (): Promise<void> => {
  if (!db) return;
  try {
    await db.destroy();
    console.log('Database connection closed gracefully');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

export default db; 