# 🤖 LLM Context - TravelConnect

> This document provides context for AI/LLM systems to understand and work with the TravelConnect codebase effectively.

## Project Summary

**TravelConnect** is a travel-focused micro social networking platform that enables travelers to:
1. Share travel plans and find co-travelers
2. Organize cab/ride sharing to airports
3. Network with professionals while traveling
4. Connect in real-time with travel matches

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 (App Router) | React SSR/CSR with TypeScript |
| Backend | FastAPI | Python REST API |
| Database | PostgreSQL 15 | Primary data storage |
| Cache | Redis | Sessions, caching (future) |
| Container | Docker Compose | Development orchestration |

## Key File Locations

### Backend (FastAPI)

```
backend/
├── app/
│   ├── main.py              # Application entry point
│   ├── core/
│   │   ├── config.py        # Settings & feature flags
│   │   ├── database.py      # DB connection
│   │   └── security.py      # Auth utilities
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py      # Authentication endpoints
│   │       ├── users.py     # User management
│   │       ├── travels.py   # Travel plans
│   │       ├── connections.py # Networking
│   │       └── cab_shares.py  # Cab sharing
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic validation schemas
│   └── services/            # Business logic layer
```

### Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/                 # App router pages
│   │   ├── page.tsx         # Home/Feed
│   │   ├── login/           # Authentication
│   │   ├── travels/         # Travel plans
│   │   ├── network/         # Connections
│   │   └── cab-share/       # Cab sharing
│   ├── components/          # Reusable UI
│   │   ├── ui/              # Base components
│   │   └── features/        # Feature components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API client
│   └── types/               # TypeScript definitions
```

## Feature Flags

Feature flags control functionality via environment variables:

```python
# Backend usage (Python)
from app.core.config import settings
if settings.FEATURE_CAB_SHARING:
    # Enable cab sharing routes

# Frontend usage (TypeScript)
const cabSharingEnabled = process.env.NEXT_PUBLIC_FEATURE_CAB_SHARING === 'true'
```

## Common Patterns

### API Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "errors": []
}
```

### Authentication Flow

1. User registers/logs in → receives JWT token
2. Token stored in httpOnly cookie or localStorage
3. All authenticated requests include `Authorization: Bearer <token>`
4. Token refreshed before expiry

### Data Flow

```
User Action → Component → Hook → Service → API → Backend
                                                    ↓
                                              Service Layer
                                                    ↓
                                              Database
```

## Key Commands

```bash
# Start all services
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Run backend tests
docker-compose exec backend pytest

# Database migrations
docker-compose exec backend alembic upgrade head
```

## Common Modifications

### Adding a New API Endpoint

1. Create schema in `backend/app/schemas/`
2. Add service logic in `backend/app/services/`
3. Create route in `backend/app/api/v1/`
4. Register route in `backend/app/api/v1/__init__.py`

### Adding a New Feature Flag

1. Add to `env.example` with default value
2. Add to `backend/app/core/config.py` Settings class
3. Use in code with conditional checks
4. Document in `docs/FEATURES.md`

### Adding a New Frontend Page

1. Create page in `frontend/src/app/[route]/page.tsx`
2. Add types in `frontend/src/types/`
3. Add API service in `frontend/src/services/`
4. Create components in `frontend/src/components/`

## Error Handling

- Backend: HTTPException with status codes
- Frontend: Try/catch with error state management
- Logging: Structured JSON logs for easy parsing

## Performance Considerations

- Database queries use select_related for joins
- Frontend uses React Query for caching
- Images lazy-loaded and optimized
- API responses paginated (default: 20 items)






