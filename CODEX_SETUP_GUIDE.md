# Codex Setup Guide - AI-Enhanced Task Manager

## 🚀 Quick Setup for Codex

### **Option 1: Bash Script (Linux/Mac)**
```bash
chmod +x setup_codex_environment.sh
./setup_codex_environment.sh
```

### **Option 2: PowerShell Script (Windows)**
```powershell
.\setup_codex_environment.ps1
```

### **Option 3: Manual Setup**
```bash
# Backend
cd backend
npm install
npm run build

# Frontend  
cd ../frontend
npm install
```

---

## 📁 Project Architecture

### **Backend Structure** (`/backend`)
```
backend/
├── src/
│   ├── config/          # Database and Redis configuration
│   ├── models/          # Data models (User, Task, Project, Tag)
│   ├── routes/          # API route handlers
│   └── server.ts        # Express server setup
├── database/migrations/ # Database migration files
└── package.json         # Dependencies and scripts
```

### **Frontend Structure** (`/frontend`)
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── projects/    # Project management components
│   │   ├── tags/        # Tag management components
│   │   ├── tasks/       # Task management components
│   │   └── ui/          # Generic UI components
│   ├── pages/           # Page components
│   ├── services/        # API service layer
│   ├── stores/          # Zustand state stores
│   └── App.tsx          # Main application component
└── package.json         # Dependencies and scripts
```

---

## 🔧 Key Technologies

### **Backend Stack**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (optional in dev mode)
- **Authentication**: JWT with bcrypt
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate limiting

### **Frontend Stack**
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Build Tool**: Vite
- **HTTP Client**: Fetch API

---

## 🎯 Core Features Implemented

### **✅ Authentication System**
- User registration and login
- JWT token management
- Protected routes
- Password hashing with bcrypt

### **✅ Task Management**
- CRUD operations for tasks
- Status tracking (pending, in-progress, completed)
- Priority levels (low, medium, high)
- Due date management
- Task filtering and search

### **✅ Project Organization**
- Create and manage projects
- Color-coded projects (12 colors)
- Archive/unarchive functionality
- Project statistics and task counts

### **✅ Tag System**
- Create and manage tags
- Color-coded tags (12 colors)
- Tag search functionality
- Tag-based task filtering

### **✅ User Interface**
- Responsive design (mobile, tablet, desktop)
- Modal-based forms
- Loading states and error handling
- Empty state illustrations

---

## 🔌 API Endpoints

### **Authentication**
```
POST /api/auth/register  # Register new user
POST /api/auth/login     # Login user
GET  /api/auth/me        # Get current user
```

### **Tasks**
```
GET    /api/tasks        # Get user's tasks
POST   /api/tasks        # Create new task
GET    /api/tasks/:id    # Get specific task
PUT    /api/tasks/:id    # Update task
DELETE /api/tasks/:id    # Delete task
```

### **Projects**
```
GET    /api/projects     # Get user's projects
POST   /api/projects     # Create new project
GET    /api/projects/:id # Get specific project
PUT    /api/projects/:id # Update project
DELETE /api/projects/:id # Archive project
PUT    /api/projects/reorder # Reorder projects
```

### **Tags**
```
GET    /api/tags         # Get user's tags
POST   /api/tags         # Create new tag
GET    /api/tags/:id     # Get specific tag
PUT    /api/tags/:id     # Update tag
DELETE /api/tags/:id     # Delete tag
```

---

## 🗄️ Data Models

### **User Model**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  settings?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
```

### **Task Model**
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  user_id: string;
  project_id?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}
```

### **Project Model**
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  user_id: string;
  is_archived: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}
```

### **Tag Model**
```typescript
interface Tag {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
```

---

## 🎨 State Management (Zustand)

### **Auth Store**
```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}
```

### **Task Store**
```typescript
interface TaskStore {
  tasks: Task[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}
```

### **Project Store**
```typescript
interface ProjectStore {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (project: Partial<Project>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
}
```

### **Tag Store**
```typescript
interface TagStore {
  tags: Tag[];
  loading: boolean;
  searchTerm: string;
  fetchTags: () => Promise<void>;
  createTag: (tag: Partial<Tag>) => Promise<void>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
}
```

---

## 🚀 Development Commands

### **Backend**
```bash
cd backend
npm run dev      # Start development server
npm run build    # Build TypeScript
npm run start    # Start production server
```

### **Frontend**
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🔑 Test Credentials

```
Email: test@example.com
Password: password123
```

---

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **GitHub Repository**: https://github.com/GITMEB1/ai-enhanced-task-manager

---

## 📚 Key Files for Codex Development

### **Backend API Development**
- `backend/src/routes/auth.ts` - Authentication endpoints
- `backend/src/routes/tasks.ts` - Task management endpoints
- `backend/src/routes/projects.ts` - Project management endpoints
- `backend/src/routes/tags.ts` - Tag management endpoints

### **Frontend Component Development**
- `frontend/src/components/tasks/` - Task-related components
- `frontend/src/components/projects/` - Project-related components
- `frontend/src/components/tags/` - Tag-related components
- `frontend/src/components/ui/` - Reusable UI components

### **State Management**
- `frontend/src/stores/authStore.ts` - Authentication state
- `frontend/src/stores/taskStore.ts` - Task state management
- `frontend/src/stores/projectStore.ts` - Project state management
- `frontend/src/stores/tagStore.ts` - Tag state management

### **API Services**
- `frontend/src/services/api.ts` - Base API configuration
- `frontend/src/services/tasks.ts` - Task API methods

---

## 🎯 Common Development Tasks

### **Adding New API Endpoints**
1. Add route handler in `backend/src/routes/`
2. Update corresponding model in `backend/src/models/`
3. Add API method in `frontend/src/services/`
4. Update store in `frontend/src/stores/`
5. Create/update components in `frontend/src/components/`

### **Adding New UI Components**
1. Create component in appropriate directory
2. Add TypeScript interfaces
3. Integrate with relevant store
4. Add to page component
5. Update routing if needed

### **Database Changes**
1. Create migration in `backend/database/migrations/`
2. Update model in `backend/src/models/`
3. Update API routes
4. Update frontend interfaces and components

---

## ✅ Environment Status

- **Backend**: ✅ Fully operational with 20/20 API endpoints
- **Frontend**: ✅ Complete UI with all features implemented
- **Authentication**: ✅ JWT-based system working
- **Database**: ✅ Development mode (no setup required)
- **Git Repository**: ✅ Successfully deployed to GitHub

**Ready for Codex development and enhancement!** 🚀 