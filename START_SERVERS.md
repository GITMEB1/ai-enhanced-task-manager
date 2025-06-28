# 🚀 Quick Server Startup Guide

## 🚨 **Fix Network Error: Start Both Servers**

The "Network Error" you're seeing is because the backend API server isn't running. Here's how to fix it:

---

## ✅ **Step 1: Start Backend Server**

Open **Terminal 1** and run:
```bash
cd backend
npm run dev
```

**Wait for this message:**
```
🚀 Server running on port 8000
📚 API Documentation: http://localhost:8000/health
🌍 Environment: development
```

---

## ✅ **Step 2: Start Frontend Server**

Open **Terminal 2** and run:
```bash
cd frontend
npm run dev
```

**Wait for this message:**
```
Local:   http://localhost:5173/
Network: use --host to expose
```

---

## ✅ **Step 3: Test Connection**

1. **Backend Health Check**: Visit http://localhost:8000/health
   - Should show: `{"status":"ok"}`

2. **Frontend App**: Visit http://localhost:5173/
   - Should load the task manager interface

---

## 🔧 **If Servers Won't Start**

### **Backend Issues:**
```bash
cd backend
npm install
npm run dev
```

### **Frontend Issues:**
```bash
cd frontend
npm install
npm run dev
```

### **Port Conflicts:**
If you get "port already in use" errors:
```bash
# Kill processes using the ports
taskkill /F /IM node.exe
# Then restart servers
```

---

## 🎯 **Expected Result**

Once both servers are running:
- ✅ Backend API: http://localhost:8000
- ✅ Frontend App: http://localhost:5173
- ✅ No more "Network Error" messages
- ✅ Journal entries and AI insights will load properly

The enhanced error handling system we just implemented will now show user-friendly messages instead of raw network errors! 