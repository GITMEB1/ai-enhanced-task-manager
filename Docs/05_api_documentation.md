# API Documentation

## Base URL
- **Development**: `http://localhost:8000/api`
- **Production**: `https://your-domain.com/api`

## Authentication
All API endpoints (except auth endpoints) require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints
- **POST** `/auth/register` - Create new user account
  - Body: `{ "name": "string", "email": "string", "password": "string" }`
  - Response: `{ "message": "string", "user": {}, "token": "string" }`

- **POST** `/auth/login` - Authenticate user and obtain JWT
  - Body: `{ "email": "string", "password": "string" }`
  - Response: `{ "message": "string", "user": {}, "token": "string" }`

- **GET** `/auth/me` - Get current user profile
  - Response: `{ "user": {} }`

## Tasks
- **GET** `/tasks` - List all tasks for authenticated user
  - Query params: `status`, `priority`, `project_id`, `tag_id`, `search`, `due_before`, `due_after`
  - Response: `{ "tasks": [], "total": number }`

- **POST** `/tasks` - Create new task
  - Body: `{ "title": "string", "description": "string", "priority": "low|medium|high", "status": "pending|in-progress|completed", "due_date": "ISO8601", "project_id": "string", "tag_ids": ["string"] }`
  - Response: `{ "task": {} }`

- **GET** `/tasks/{id}` - Get specific task
  - Response: `{ "task": {} }`

- **PUT** `/tasks/{id}` - Update task
  - Body: Same as POST (partial updates allowed)
  - Response: `{ "task": {} }`

- **DELETE** `/tasks/{id}` - Delete task
  - Response: `{ "message": "string" }`

## Projects
- **GET** `/projects` - List all projects for authenticated user
  - Query params: `archived`, `search`
  - Response: `{ "projects": [], "total": number }`

- **POST** `/projects` - Create new project
  - Body: `{ "name": "string", "description": "string", "color": "string" }`
  - Response: `{ "project": {} }`

- **GET** `/projects/{id}` - Get specific project with statistics
  - Response: `{ "project": {}, "stats": {} }`

- **PUT** `/projects/{id}` - Update project
  - Body: Same as POST (partial updates allowed)
  - Response: `{ "project": {} }`

- **DELETE** `/projects/{id}` - Delete project
  - Response: `{ "message": "string" }`

- **PUT** `/projects/{id}/archive` - Archive/unarchive project
  - Body: `{ "archived": boolean }`
  - Response: `{ "project": {} }`

## Tags
- **GET** `/tags` - List all tags for authenticated user
  - Query params: `search`
  - Response: `{ "tags": [], "total": number }`

- **POST** `/tags` - Create new tag
  - Body: `{ "name": "string", "color": "string" }`
  - Response: `{ "tag": {} }`

- **GET** `/tags/{id}` - Get specific tag with usage statistics
  - Response: `{ "tag": {}, "stats": {} }`

- **PUT** `/tags/{id}` - Update tag
  - Body: Same as POST (partial updates allowed)
  - Response: `{ "tag": {} }`

- **DELETE** `/tags/{id}` - Delete tag
  - Response: `{ "message": "string" }`

## Journal Entries 📓

### Journal Management
- **GET** `/journal` - List all journal entries for authenticated user
  - Query params: 
    - `type`: Filter by entry type (general, reflection, achievement, idea, mood, goal_progress, learning, decision, gratitude)
    - `mood_min`, `mood_max`: Filter by mood range (1-10)
    - `energy_min`, `energy_max`: Filter by energy range (1-10)
    - `date_from`, `date_to`: Filter by date range (ISO8601)
    - `tags`: Filter by tag names (comma-separated)
    - `search`: Full-text search in title and content
    - `limit`, `offset`: Pagination
  - Response: `{ "entries": [], "total": number, "pagination": {} }`

- **POST** `/journal` - Create new journal entry
  - Body: 
    ```json
    {
      "title": "string",
      "content": "string",
      "type": "general|reflection|achievement|idea|mood|goal_progress|learning|decision|gratitude",
      "mood": 1-10,
      "energy": 1-10,
      "tags": ["string"],
      "task_id": "string (optional)",
      "project_id": "string (optional)",
      "metadata": {}
    }
    ```
  - Response: `{ "entry": {} }`

- **GET** `/journal/{id}` - Get specific journal entry
  - Response: `{ "entry": {} }`

- **PUT** `/journal/{id}` - Update journal entry
  - Body: Same as POST (partial updates allowed)
  - Response: `{ "entry": {} }`

- **DELETE** `/journal/{id}` - Delete journal entry
  - Response: `{ "message": "string" }`

### Quick Entry
- **POST** `/journal/quick` - Create quick journal entry
  - Body: `{ "content": "string", "type": "string (optional)" }`
  - Response: `{ "entry": {} }`

### Analytics
- **GET** `/journal/analytics` - Get journal analytics and insights
  - Query params: `period` (week, month, quarter, year)
  - Response: 
    ```json
    {
      "stats": {
        "total_entries": number,
        "entries_by_type": {},
        "avg_mood": number,
        "avg_energy": number,
        "writing_streak": number
      },
      "trends": {
        "mood_trend": [],
        "energy_trend": [],
        "entries_over_time": []
      },
      "insights": {
        "most_common_tags": [],
        "best_mood_days": [],
        "productivity_patterns": {}
      }
    }
    ```

## Notifications
- **GET** `/notifications` - Get user notifications
  - Response: `{ "notifications": [] }`

- **POST** `/notifications/schedule` - Schedule notification
  - Body: `{ "message": "string", "scheduled_for": "ISO8601" }`
  - Response: `{ "notification": {} }`

- **GET** `/notifications/upcoming` - Get upcoming notifications
  - Response: `{ "notifications": [] }`

## Health Check
- **GET** `/health` - System health check (no authentication required)
  - Response: `{ "status": "healthy|unhealthy", "timestamp": "ISO8601", "services": {} }`

## Error Responses
All endpoints return standard HTTP status codes with JSON error payloads:

### Success Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content returned

### Error Codes
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Response Format
```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {
    "field": "Specific error details"
  }
}
```

## Rate Limiting
- **Window**: 15 minutes
- **Limit**: 100 requests per IP address
- **Headers**: Rate limit information included in response headers

## Data Models

### User
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "settings": {},
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### Task
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "status": "pending|in-progress|completed",
  "priority": "low|medium|high",
  "due_date": "ISO8601",
  "project_id": "string",
  "tag_ids": ["string"],
  "user_id": "string",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### Project
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "color": "string",
  "archived": boolean,
  "user_id": "string",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### Tag
```json
{
  "id": "string",
  "name": "string",
  "color": "string",
  "user_id": "string",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### Journal Entry
```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "type": "general|reflection|achievement|idea|mood|goal_progress|learning|decision|gratitude",
  "mood": 1-10,
  "energy": 1-10,
  "tags": ["string"],
  "task_id": "string",
  "project_id": "string",
  "metadata": {},
  "user_id": "string",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

---

*Last Updated: December 2024 - Journal API endpoints added*
