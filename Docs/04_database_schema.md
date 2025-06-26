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
