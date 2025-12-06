# 🌍 TravelConnect

> A modern travel networking micro social media platform for travelers

TravelConnect enables meaningful connections between travelers. Whether you're looking to share a cab to the airport, find travel buddies with similar professional backgrounds, or simply network with like-minded individuals during your journey.

Sample login: priya.sharma@gmail.com / password123

## ✨ Features

- **🚕 Cab Sharing** - Find and share rides to/from airports and stations
- **✈️ Travel Updates** - Share your travel plans and connect with co-travelers
- **👥 Professional Networking** - Connect with professionals in your industry while traveling
- **💬 Real-time Chat** - Message and coordinate with your travel connections
- **🔔 Smart Notifications** - Get notified when travelers match your route

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Network                          │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   Frontend  │   Backend   │  Database   │     Redis        │
│   (Next.js) │  (FastAPI)  │ (PostgreSQL)│   (Cache)        │
│   :3000     │   :8000     │   :5432     │   :6379          │
└─────────────┴─────────────┴─────────────┴──────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Setup

1. **Clone and navigate**
   ```bash
   cd travel
   ```

2. **Copy environment file**
   ```bash
   cp env.example .env
   ```

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
travel/
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   └── types/         # TypeScript types
│   └── Dockerfile
├── backend/               # FastAPI Python application
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── core/         # Core utilities
│   └── Dockerfile
├── docs/                  # Documentation
├── docker-compose.yml     # Docker orchestration
└── env.example           # Environment template
```

## 🔧 Development

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

```bash
# Backend tests
cd backend && pytest

# Frontend tests
cd frontend && npm test
```

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [LLM Context](docs/LLM_CONTEXT.md)
- [Feature Flags](docs/FEATURES.md)

## 🔐 Feature Flags

Feature flags are managed via environment variables:

| Flag | Description | Default |
|------|-------------|---------|
| `FEATURE_CAB_SHARING` | Enable cab sharing feature | `true` |
| `FEATURE_FLIGHT_TRACKING` | Enable flight tracking | `true` |
| `FEATURE_NETWORKING` | Enable professional networking | `true` |
| `FEATURE_CHAT` | Enable real-time chat | `true` |
| `FEATURE_AI_MATCHING` | Enable AI-powered matching | `false` |

## 📄 License

MIT License - feel free to use this project for your own travel networking needs!






