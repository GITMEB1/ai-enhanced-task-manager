# Database Schema

## Overview
The AI-Enhanced Task Manager uses a PostgreSQL database with the following core entities:
- **Users**: Authentication and user settings
- **Projects**: Organizational containers for tasks
- **Tasks**: Individual work items with metadata
- **Tags**: Flexible labeling system
- **Journal Entries**: Personal logging and analytics
- **Journal Templates**: Reusable entry formats

---

## Core Tables

### users
Primary user accounts and authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `name` | VARCHAR(255) | NOT NULL | User's display name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User's email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `settings` | JSONB | DEFAULT '{}' | User preferences and configuration |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last account update |

### projects
Organizational containers for grouping related tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique project identifier |
| `user_id` | UUID | NOT NULL, FK(users.id) | Project owner |
| `name` | VARCHAR(255) | NOT NULL | Project name |
| `description` | TEXT | | Project description |
| `color` | VARCHAR(7) | NOT NULL | Hex color code for UI |
| `archived` | BOOLEAN | DEFAULT FALSE | Archive status |
| `order_index` | INTEGER | DEFAULT 0 | Display order |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### tasks
Individual work items with rich metadata and relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique task identifier |
| `user_id` | UUID | NOT NULL, FK(users.id) | Task owner |
| `project_id` | UUID | FK(projects.id) | Associated project (optional) |
| `parent_task_id` | UUID | FK(tasks.id) | Parent task for subtasks |
| `title` | VARCHAR(255) | NOT NULL | Task title |
| `description` | TEXT | | Detailed task description |
| `status` | VARCHAR(20) | DEFAULT 'pending' | pending, in-progress, completed |
| `priority` | VARCHAR(10) | DEFAULT 'medium' | low, medium, high |
| `due_date` | TIMESTAMP | | Task deadline |
| `completed_at` | TIMESTAMP | | Completion timestamp |
| `metadata` | JSONB | DEFAULT '{}' | Additional task data |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### tags
Flexible labeling system for tasks and journal entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique tag identifier |
| `user_id` | UUID | NOT NULL, FK(users.id) | Tag owner |
| `name` | VARCHAR(100) | NOT NULL | Tag name |
| `color` | VARCHAR(7) | NOT NULL | Hex color code for UI |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### task_tags
Many-to-many relationship between tasks and tags.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `task_id` | UUID | NOT NULL, FK(tasks.id) | Associated task |
| `tag_id` | UUID | NOT NULL, FK(tags.id) | Applied tag |

**Composite Primary Key**: (`task_id`, `tag_id`)

---

## Journal System Tables 📓

### journal_entries
Personal journal entries with mood tracking and analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique entry identifier |
| `user_id` | UUID | NOT NULL, FK(users.id) | Entry author |
| `title` | VARCHAR(255) | | Entry title (optional) |
| `content` | TEXT | NOT NULL | Entry content |
| `type` | VARCHAR(20) | DEFAULT 'general' | Entry type (see types below) |
| `mood` | INTEGER | CHECK (1-10) | Mood rating (1=poor, 10=excellent) |
| `energy` | INTEGER | CHECK (1-10) | Energy rating (1=low, 10=high) |
| `tags` | TEXT[] | DEFAULT '{}' | Array of tag strings |
| `task_id` | UUID | FK(tasks.id) | Associated task (optional) |
| `project_id` | UUID | FK(projects.id) | Associated project (optional) |
| `metadata` | JSONB | DEFAULT '{}' | Additional entry data |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Entry creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Journal Entry Types**:
- `general`: Daily thoughts and observations
- `reflection`: Deep thinking and self-analysis
- `achievement`: Accomplishments and milestones
- `idea`: Creative thoughts and brainstorming
- `mood`: Emotional state tracking
- `goal_progress`: Progress on personal/professional goals
- `learning`: New knowledge and insights
- `decision`: Important decisions and reasoning
- `gratitude`: Gratitude practice and appreciation

### journal_templates
Reusable templates for journal entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique template identifier |
| `user_id` | UUID | NOT NULL, FK(users.id) | Template owner |
| `name` | VARCHAR(255) | NOT NULL | Template name |
| `description` | TEXT | | Template description |
| `type` | VARCHAR(20) | NOT NULL | Default entry type |
| `content_template` | TEXT | | Template content with placeholders |
| `prompts` | JSONB | DEFAULT '{}' | Guided prompts for entry |
| `metadata` | JSONB | DEFAULT '{}' | Additional template data |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

---

## Indexes and Performance

### Primary Indexes
- All tables have UUID primary keys with automatic indexing
- Foreign key constraints create automatic indexes

### Performance Indexes
```sql
-- User-specific data queries
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);

-- Task filtering and sorting
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);

-- Journal analytics
CREATE INDEX idx_journal_entries_type ON journal_entries(type);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX idx_journal_entries_mood ON journal_entries(mood);
CREATE INDEX idx_journal_entries_energy ON journal_entries(energy);

-- Full-text search
CREATE INDEX idx_tasks_search ON tasks USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_journal_entries_search ON journal_entries USING gin(to_tsvector('english', title || ' ' || content));

-- Composite indexes for common queries
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date);
CREATE INDEX idx_journal_entries_user_type ON journal_entries(user_id, type);
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, created_at);
```

---

## Relationships

### Entity Relationship Diagram
```
users (1) ──── (M) projects
users (1) ──── (M) tasks
users (1) ──── (M) tags
users (1) ──── (M) journal_entries
users (1) ──── (M) journal_templates

projects (1) ──── (M) tasks
projects (1) ──── (M) journal_entries

tasks (1) ──── (M) tasks (parent-child)
tasks (M) ──── (M) tags (via task_tags)
tasks (1) ──── (M) journal_entries

tags (M) ──── (M) tasks (via task_tags)
```

### Referential Integrity
- **Cascade Deletes**: User deletion cascades to all owned records
- **Soft Deletes**: Projects and tasks support archiving instead of deletion
- **Orphan Handling**: Tasks can exist without projects, journal entries can exist without task/project links

---

## Data Types and Constraints

### UUID Generation
All primary keys use UUID v4 for better distribution and security:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Default: uuid_generate_v4()
```

### JSONB Usage
- **User Settings**: Flexible user preferences and configuration
- **Task Metadata**: Custom fields, attachments, external IDs
- **Journal Metadata**: Location data, weather, custom fields
- **Template Prompts**: Structured guidance for journal entries

### Validation Constraints
```sql
-- Mood and energy ratings
CHECK (mood >= 1 AND mood <= 10)
CHECK (energy >= 1 AND energy <= 10)

-- Status values
CHECK (status IN ('pending', 'in-progress', 'completed'))

-- Priority values
CHECK (priority IN ('low', 'medium', 'high'))

-- Journal entry types
CHECK (type IN ('general', 'reflection', 'achievement', 'idea', 'mood', 'goal_progress', 'learning', 'decision', 'gratitude'))

-- Color hex codes
CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
```

---

## Migration History

1. **001_create_users.js**: Initial user authentication table
2. **002_create_projects.js**: Project organization system
3. **003_create_tasks.js**: Core task management with subtasks
4. **004_create_tags.js**: Flexible tagging system
5. **005_create_full_text_index.js**: Search optimization
6. **006_create_journal_entries.js**: Personal journaling system
7. **007_create_journal_templates.js**: Reusable journal templates

---

## Development Mode
The application supports development mode without database connection:
- All models include fallback mock data
- CRUD operations simulate database behavior
- Perfect for development and testing without PostgreSQL setup

---

# Database Schema

## Tables

### users
- `id` (PK)
- `name`
- `email`
- `settings` (JSONB)

### projects
- `id` (PK)
- `user_id` (FK)
- `title`
- `color`
- `order`

### tasks
- `id` (PK)
- `project_id` (FK)
- `parent_task_id` (FK, nullable)
- `title`
- `description`
- `due_at`
- `priority`
- `status`
- `metadata` (JSONB)
- `created_at`
- `updated_at`

### tags
- `id` (PK)
- `name`

### task_tags
- `task_id` (FK)
- `tag_id` (FK)

## Indexes
- `(user_id, due_at)`
- Full-text on `title`, `description`
