require('dotenv').config();

console.log('=== ENVIRONMENT VARIABLES TEST ===');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'CONFIGURED ✅' : 'NOT SET ❌');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'CONFIGURED ✅' : 'NOT SET ❌');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'CONFIGURED ✅' : 'NOT SET ❌');

if (process.env.OPENAI_API_KEY) {
  console.log('OpenAI API Key starts with:', process.env.OPENAI_API_KEY.substring(0, 15) + '...');
}

if (process.env.GOOGLE_CLIENT_ID) {
  console.log('Google Client ID starts with:', process.env.GOOGLE_CLIENT_ID.substring(0, 15) + '...');
} 