# 🚀 Live Data Setup Guide

## Overview
Transform your AI-Enhanced Task Manager from mock data to live, real-time data sources.

## 🧠 **OPTION 1: AI Integration (OpenAI) - RECOMMENDED**

### Step 1: Get OpenAI API Key
1. **Visit**: https://platform.openai.com/api-keys
2. **Sign up/Login** to OpenAI
3. **Create API Key** (starts with `sk-`)
4. **Copy the key** (you'll only see it once!)

### Step 2: Configure Backend
```bash
# In backend/ directory, create .env file
cd backend
cp env.example .env
```

### Step 3: Add Your API Key
```env
# Edit backend/.env
OPENAI_API_KEY=sk-your_actual_api_key_here
OPENAI_MODEL=gpt-4
```

### Step 4: Restart Backend
```bash
cd backend
npm run dev
```

### ✅ **What You Get:**
- **Real AI insights** based on your actual tasks
- **Intelligent task suggestions** 
- **Personalized journal prompts**
- **Advanced pattern analysis**
- **Mood-productivity correlation**

---

## 📧 **OPTION 2: Gmail Integration**

### Step 1: Google Cloud Console Setup
1. **Visit**: https://console.cloud.google.com/
2. **Create new project** or select existing
3. **Enable Gmail API**:
   - APIs & Services → Library
   - Search "Gmail API" → Enable

### Step 2: Create OAuth Credentials
1. **Credentials** → Create Credentials → OAuth 2.0 Client ID
2. **Application type**: Web application
3. **Authorized redirect URIs**: 
   ```
   http://localhost:8000/api/integrations/gmail/callback
   ```
4. **Copy Client ID and Secret**

### Step 3: Configure Backend
```env
# Add to backend/.env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/integrations/gmail/callback
```

### ✅ **What You Get:**
- **Real email processing** from your Gmail
- **Automatic task creation** from emails
- **Smart priority assignment**
- **Action item extraction**

---

## 🗄️ **OPTION 3: Database Integration (PostgreSQL)**

### Step 1: Install PostgreSQL
```bash
# Windows (with Chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/
```

### Step 2: Create Database
```sql
CREATE DATABASE task_manager;
CREATE USER task_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE task_manager TO task_user;
```

### Step 3: Configure Backend
```env
# Add to backend/.env
DATABASE_URL=postgresql://task_user:your_password@localhost:5432/task_manager
```

### Step 4: Run Migrations
```bash
cd backend
npm run db:migrate
```

### ✅ **What You Get:**
- **Persistent data storage**
- **No data loss on restart**
- **Advanced queries and analytics**
- **Production-ready data layer**

---

## 🔧 **OPTION 4: Additional Live Data Sources**

### GitHub Integration (Task Sync)
```env
GITHUB_TOKEN=your_github_personal_access_token
```

### Slack Integration (Notifications)
```env
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
```

### Notion Integration (Data Sync)
```env
NOTION_API_KEY=your_notion_integration_token
```

---

## 🚀 **QUICK START: AI Only (5 minutes)**

**Fastest way to get live data:**

1. **Get OpenAI API Key**: https://platform.openai.com/api-keys
2. **Create backend/.env**:
   ```env
   OPENAI_API_KEY=sk-your_key_here
   ```
3. **Restart backend**:
   ```bash
   cd backend && npm run dev
   ```
4. **Visit AI Insights page** - now shows real AI analysis!

---

## 🧪 **Testing Live Data**

### Verify AI Integration:
1. **Go to Integrations page**
2. **Check status**: Should show "Active" for AI service
3. **Visit AI Insights**: Should show enhanced analysis

### Verify Gmail Integration:
1. **Go to Integrations page** 
2. **Click "Connect Gmail"**
3. **Complete OAuth flow**
4. **See real emails** in the integration panel

---

## 💰 **Cost Considerations**

### OpenAI API:
- **GPT-4**: ~$0.03 per 1K tokens
- **Typical usage**: $5-15/month for personal use
- **Free tier**: $5 credit for new accounts

### Gmail API:
- **Free**: Up to 1 billion quota units/day
- **More than enough** for personal use

### PostgreSQL:
- **Free**: Self-hosted
- **Cloud options**: AWS RDS, Google Cloud SQL (~$20-50/month)

---

## 🔧 **Troubleshooting**

### Common Issues:

**"Service not configured"**:
- Check `.env` file exists in `backend/` directory
- Verify API key format (OpenAI keys start with `sk-`)
- Restart backend server

**Gmail OAuth errors**:
- Check redirect URI matches exactly
- Enable Gmail API in Google Cloud Console
- Verify client ID/secret are correct

**Database connection errors**:
- Check PostgreSQL is running
- Verify connection string format
- Check user permissions

---

## 🎯 **Next Steps**

1. **Start with AI integration** (easiest, immediate value)
2. **Add Gmail if you want email automation**
3. **Add database for persistence**
4. **Scale with additional integrations**

**Ready to make it live?** Pick an option above and start with the API keys! 🚀 