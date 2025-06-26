# API Documentation

## Authentication
- `POST /auth/login` - Obtain JWT.
- `POST /auth/register` - Create account.

## Tasks
- `GET /tasks` - List tasks.
  - Query params: `status`, `due_before`, `project_id`
- `POST /tasks` - Create task.
  - Body: `title`, `description`, `due_at`, `project_id`, `metadata`
- `GET /tasks/{id}` - Retrieve single task.
- `PUT /tasks/{id}` - Update task.
- `DELETE /tasks/{id}` - Delete task.

## Projects
- `GET /projects`
- `POST /projects`
- `PUT /projects/{id}`
- `DELETE /projects/{id}`

## Notifications
- `POST /notifications/schedule`
- `GET /notifications/upcoming`

## Errors
- Standard HTTP status codes with JSON error payloads:
```json
{ "error": "string", "details": {} }
```
