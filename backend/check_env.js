require('dotenv').config();

console.log('=== ENVIRONMENT VARIABLES CHECK ===');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET ✅' : 'MISSING ❌');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET ✅' : 'MISSING ❌');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET ✅' : 'MISSING ❌');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET ✅' : 'MISSING ❌');

if (process.env.OPENAI_API_KEY) {
  console.log('OpenAI Key length:', process.env.OPENAI_API_KEY.length);
}

if (process.env.GOOGLE_CLIENT_ID) {
  console.log('Google Client ID length:', process.env.GOOGLE_CLIENT_ID.length);
} 