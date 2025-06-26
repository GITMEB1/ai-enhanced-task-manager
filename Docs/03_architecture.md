# Technical Architecture

```mermaid
flowchart LR
  User --> Frontend
  Frontend <--> API_Gateway
  API_Gateway --> Auth_Service
  API_Gateway --> Task_Service
  API_Gateway --> Notification_Service
  API_Gateway --> Context_Vault
  Task_Service --> PostgreSQL[(Tasks DB)]
  Auth_Service --> PostgreSQL[(Users DB)]
  Notification_Service <--> Redis[(Schedules & Queues)]
  Context_Vault --> ElasticSearch[(Context Index)]
  Integration_Adapters --> External_APIs[(Calendar, Voice)]
```

- **Frontend**: React/Vue SPA + PWA, TailwindCSS.
- **API Gateway**: Routing, rate limits, orchestration.
- **Services**: Auth (OAuth2/JWT), Task (CRUD, business logic), Notification (scheduling), Context Vault (RAG indexing).
- **Integrations**: Calendar sync, voice API, widget feeds.
