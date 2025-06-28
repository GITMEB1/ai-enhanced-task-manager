// Test script to check environment variables loading
require('dotenv').config({ path: './backend/.env' });

console.log('=== ENVIRONMENT VARIABLES TEST ===');
console.log('Working directory:', process.cwd());
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'CONFIGURED ✅' : 'NOT SET ❌');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'CONFIGURED ✅' : 'NOT SET ❌');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'CONFIGURED ✅' : 'NOT SET ❌');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'CONFIGURED ✅' : 'NOT SET ❌');

// Try to check if the .env file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'backend', '.env');
console.log('\n=== FILE CHECK ===');
console.log('Looking for .env at:', envPath);
console.log('.env file exists:', fs.existsSync(envPath) ? 'YES ✅' : 'NO ❌');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  console.log('Total lines in .env:', lines.length);
  console.log('Contains OPENAI_API_KEY:', envContent.includes('OPENAI_API_KEY') ? 'YES ✅' : 'NO ❌');
  console.log('Contains GOOGLE_CLIENT_ID:', envContent.includes('GOOGLE_CLIENT_ID') ? 'YES ✅' : 'NO ❌');
} 