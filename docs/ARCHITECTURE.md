# 🏗️ TravelConnect Architecture

## Overview

TravelConnect follows a microservices-inspired architecture with clear separation of concerns, designed for scalability and maintainability.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Client Layer                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js Frontend (SSR/CSR)                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │   │
│  │  │   Pages  │ │Components│ │  Hooks   │ │ Service Layer    │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              API Layer                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    FastAPI Backend                                │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │   │
│  │  │  Routes  │ │ Services │ │  Models  │ │   Middleware     │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             Data Layer                                   │
│  ┌─────────────────────┐           ┌─────────────────────────────┐     │
│  │    PostgreSQL       │           │         Redis               │     │
│  │  (Primary Storage)  │           │    (Cache & Sessions)       │     │
│  └─────────────────────┘           └─────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Principles

### 1. SOLID Principles

- **S**ingle Responsibility: Each module has one clear purpose
- **O**pen/Closed: Extensible via feature flags without modifying core
- **L**iskov Substitution: Consistent interfaces across services
- **I**nterface Segregation: Focused, minimal interfaces
- **D**ependency Inversion: Services depend on abstractions

### 2. KISS (Keep It Simple, Stupid)

- Minimal configuration required
- Clear, readable code over clever solutions
- Straightforward data flow

### 3. DRY (Don't Repeat Yourself)

- Shared types between frontend and backend
- Reusable UI components
- Centralized configuration

### 4. Modular Feature Flags

- Features enabled/disabled via environment variables
- Graceful degradation when features are disabled
- Easy A/B testing capability

## Data Models

### Core Entities

```
User
├── id: UUID
├── email: String
├── name: String
├── avatar_url: String
├── profession: String
├── company: String
├── bio: String
└── created_at: DateTime

TravelPlan
├── id: UUID
├── user_id: UUID (FK)
├── origin: String
├── destination: String
├── travel_date: DateTime
├── travel_type: Enum (flight, train, bus, car)
├── flight_number: String (optional)
├── status: Enum (planned, active, completed)
└── created_at: DateTime

Connection
├── id: UUID
├── requester_id: UUID (FK)
├── addressee_id: UUID (FK)
├── status: Enum (pending, accepted, rejected)
└── created_at: DateTime

CabShare
├── id: UUID
├── travel_plan_id: UUID (FK)
├── pickup_location: String
├── dropoff_location: String
├── available_seats: Integer
├── price_per_seat: Decimal
└── created_at: DateTime
```

## API Structure

```
/api/v1
├── /auth
│   ├── POST /register
│   ├── POST /login
│   └── POST /refresh
├── /users
│   ├── GET /me
│   ├── PUT /me
│   ├── GET /{id}
│   └── GET /search
├── /travels
│   ├── GET /
│   ├── POST /
│   ├── GET /{id}
│   ├── PUT /{id}
│   └── DELETE /{id}
├── /connections
│   ├── GET /
│   ├── POST /request
│   ├── PUT /{id}/accept
│   └── PUT /{id}/reject
├── /cab-shares
│   ├── GET /
│   ├── POST /
│   ├── GET /{id}
│   └── POST /{id}/join
└── /feed
    ├── GET /
    └── GET /nearby
```

## Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configured for frontend origin
- Rate limiting on sensitive endpoints
- Input validation via Pydantic schemas

## Scalability Considerations

- Stateless backend for horizontal scaling
- Database connection pooling
- Redis for session storage and caching
- CDN-ready static assets






