# 🔧 Network Connectivity Troubleshooting Guide

## 🚨 **Current Issue**
```
API Error: Network Error
Error fetching journal entries: AxiosError
Failed to fetch journal or AI insights. Service integrations not connected
```

## 🔍 **Diagnosis**

The frontend (port 5173) cannot connect to the backend API (port 8000). This is a common development environment issue.

---

## ✅ **Quick Fix Steps**

### **1. Start Backend Server**
```bash
# Terminal 1: Backend
cd backend
npm run dev
```

**Expected Output:**
```
✅ Database connection established (or skipped in development)
✅ Redis connected (or skipped in development)  
🚀 Server running on port 8000
📚 API Documentation: http://localhost:8000/health
🌍 Environment: development
```

### **2. Start Frontend Server**
```bash
# Terminal 2: Frontend  
cd frontend
npm run dev
```

**Expected Output:**
```
Local:   http://localhost:5173/
Network: use --host to expose
```

### **3. Verify Connection**
Test the backend health endpoint:
```bash
curl http://localhost:8000/health
# OR visit in browser: http://localhost:8000/health
```

---

## 🔧 **Advanced Troubleshooting**

### **Check Port Availability**
```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# If ports are occupied, kill processes:
taskkill /PID <PID_NUMBER> /F
```

### **Check Backend Environment**
```bash
cd backend
node check_env.js
```

### **Test API Endpoints**
```bash
# Health check
curl http://localhost:8000/health

# Auth test
curl http://localhost:8000/api/auth/check

# CORS test from frontend origin
curl -H "Origin: http://localhost:5173" http://localhost:8000/health
```

---

## 🛠️ **Configuration Verification**

### **Frontend API Configuration**
File: `frontend/src/services/api.ts`
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

### **Backend CORS Configuration**
File: `backend/src/server.ts`
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',  // ✅ Vite dev server
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));
```

### **Vite Proxy Configuration**
File: `frontend/vite.config.ts`
```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true
    }
  }
}
```

---

## 🚀 **Development Workflow**

### **Recommended Startup Sequence**
1. **Terminal 1**: `cd backend && npm run dev`
2. **Wait for**: "🚀 Server running on port 8000"
3. **Terminal 2**: `cd frontend && npm run dev`
4. **Verify**: Both servers are running without errors

### **Environment Variables Check**
```bash
# Backend
cd backend
echo $NODE_ENV  # Should be 'development'

# Frontend  
cd frontend
echo $VITE_API_URL  # Should be undefined (uses default)
```

---

## 🔄 **Error Recovery Steps**

### **If Backend Won't Start**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **If Frontend Won't Connect**
```bash
cd frontend
rm -rf node_modules package-lock.json  
npm install
npm run dev
```

### **If Ports Are Conflicted**
```bash
# Change backend port
cd backend
set PORT=8001 && npm run dev

# Update frontend API URL
cd frontend
set VITE_API_URL=http://localhost:8001 && npm run dev
```

---

## 📊 **Health Check Endpoints**

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `GET /health` | Server status | `{"status": "ok"}` |
| `GET /api/auth/check` | Auth service | `401` or user data |
| `GET /api/integrations/status` | AI services | Service status object |

---

## 🐛 **Common Issues & Solutions**

### **Issue**: "Network Error" in browser console
**Cause**: Backend server not running
**Solution**: Start backend with `npm run dev`

### **Issue**: "CORS policy" error
**Cause**: Frontend origin not allowed
**Solution**: Check CORS configuration in `backend/src/server.ts`

### **Issue**: "Connection refused"
**Cause**: Wrong port or server not listening
**Solution**: Verify ports and server startup logs

### **Issue**: "Service integrations not connected"
**Cause**: Missing environment variables (non-critical)
**Solution**: App works without AI features in development

---

## 💡 **Pro Tips**

1. **Always start backend first** - Frontend depends on backend API
2. **Check terminal logs** - Both servers show helpful startup information  
3. **Use browser DevTools** - Network tab shows exact API call failures
4. **Test API directly** - Use curl or Postman to isolate frontend issues
5. **Development mode works offline** - Mock data is used when APIs unavailable

---

## 🎯 **Quick Recovery Commands**

```bash
# Full restart sequence
pkill -f "node.*backend"
pkill -f "node.*frontend"  
cd backend && npm run dev &
sleep 3
cd frontend && npm run dev
```

**Status**: The application should now be accessible at `http://localhost:5173` with full API connectivity! 