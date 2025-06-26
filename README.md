# AI-Enhanced Task Manager

A customizable, AI-enhanced task management system designed for flexibility, usability, and evolving feature sets.

## 📋 Project Overview

**Target Audience**: Individuals and teams needing adaptable task workflows, including neurodivergent users, developers, and managers.

**Key Problems Solved**:
- Simplifies complex task organization with natural language entry
- Provides intelligent reminder and scheduling adjustments
- Offers deep customization for personal productivity styles
- Integrates contextual data for smarter task suggestions

## 🏗️ Architecture

```
User --> Frontend (React/Vue SPA + PWA)
         ↓
API Gateway --> Auth Service
            --> Task Service  
            --> Notification Service
            --> Context Vault
                ↓
Database Layer (PostgreSQL, Redis, ElasticSearch)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (for notifications/caching)

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd ai-task-manager
npm run install:all
```

2. **Set up environment variables**:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials
```

3. **Set up the database**:
```bash
cd backend
npm run db:migrate
npm run db:seed
```

4. **Start the development servers**:
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 📁 Project Structure

```
/
├── Docs/                   # Project documentation
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API communication
│   │   └── utils/         # Utility functions
├── backend/               # Node.js backend services
│   ├── src/
│   │   ├── controllers/   # API route handlers
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
└── database/              # Database migrations and seeds
```

## 🎯 Core Features

### ✅ Phase 1: Core Foundation (Current)
- [x] Project structure setup
- [x] Database schema implementation
- [x] Basic API endpoints
- [x] Authentication system
- [ ] Frontend foundation

### 🚧 Phase 2: Essential Features (Next)
- [ ] Task CRUD operations
- [ ] Project organization
- [ ] Basic notifications
- [ ] User management

### 🔮 Phase 3: Enhanced UX
- [ ] Multiple view modes (list/calendar/kanban)
- [ ] Natural language task entry
- [ ] Customization options
- [ ] Accessibility features

### ⭐ Phase 4: Advanced Features
- [ ] Gamification elements
- [ ] Voice integration
- [ ] AI-powered scheduling
- [ ] Collaboration tools

### 🔗 Phase 5: Integrations
- [ ] Calendar sync
- [ ] External APIs
- [ ] PWA capabilities
- [ ] Performance optimization

## 🛠️ Development

### Available Scripts

```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend
npm run build           # Build both applications
npm run start           # Start production server
npm run install:all     # Install all dependencies
```

### API Documentation

The API follows RESTful conventions. See `/Docs/05_api_documentation.md` for detailed endpoint documentation.

Base URL: `http://localhost:8000/api`

### Database Schema

See `/Docs/04_database_schema.md` for the complete database structure.

## 🎨 UI/UX Guidelines

- **Accessibility**: Keyboard navigation, ARIA labels, colorblind-safe palettes
- **Themes**: Adjustable light/dark themes with high-contrast alternatives
- **Responsive**: Mobile-first design with 8px grid system
- **Components**: Consistent spacing, sans-serif typography

## 🤝 Contributing

1. Read the documentation in `/Docs/`
2. Follow the established architecture patterns
3. Ensure accessibility compliance
4. Test thoroughly before submitting

## 📄 License

MIT License - see LICENSE file for details.

---

**Context for Development**:
This project implements the specifications outlined in the `/Docs/` folder. Each phase builds upon the previous one, maintaining clean architecture and extensibility for future AI enhancements and integrations. 