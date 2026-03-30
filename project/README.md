# TaskFlow API

> Scalable REST API with JWT Authentication, Role-Based Access Control, and a React frontend.

[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/Docker-ready-blue)](https://docker.com)

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB + Mongoose ODM              |
| Auth       | JWT (access + refresh tokens)       |
| Hashing    | bcryptjs (salt rounds: 12)          |
| Validation | express-validator                   |
| Docs       | Swagger UI (`/api-docs`)            |
| Frontend   | React 18, React Router v6           |
| DevOps     | Docker, Docker Compose, Nginx       |
| Logging    | Winston + Morgan                    |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── controllers/         # Route handlers (auth, tasks, users, admin)
│   ├── routes/v1/           # Versioned API routes
│   ├── middleware/          # Auth, error handling, validation
│   ├── models/              # Mongoose schemas (User, Task)
│   ├── config/              # DB connection, Swagger config
│   ├── utils/               # AppError, asyncHandler, logger, apiResponse
│   ├── app.js               # Express app entry point
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Layout, reusable UI components
│   │   ├── pages/           # Login, Register, Dashboard, Tasks, Profile, Admin
│   │   ├── services/        # Axios API layer (auth, tasks, users, admin)
│   │   ├── context/         # AuthContext (global auth state)
│   │   └── hooks/           # useToast
│   ├── public/
│   ├── nginx.conf           # SPA routing + API proxy
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow

# Backend
cd backend
cp .env.example .env   # Edit with your values
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRE=1h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### 3. Run Locally

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm start
```

- API: http://localhost:5000
- Frontend: http://localhost:3000
- Swagger Docs: http://localhost:5000/api-docs

### 4. Docker (one command)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:5000
- Swagger: http://localhost:5000/api-docs

---

## API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint        | Auth | Description          |
|--------|----------------|------|----------------------|
| POST   | /register       | ✗    | Register new user    |
| POST   | /login          | ✗    | Login, get JWT       |
| POST   | /refresh        | ✗    | Refresh access token |
| GET    | /me             | ✓    | Get current user     |

### Tasks (`/api/v1/tasks`)

| Method | Endpoint        | Auth | Role  | Description       |
|--------|----------------|------|-------|-------------------|
| GET    | /               | ✓    | user+ | List tasks (paginated, filtered) |
| POST   | /               | ✓    | user+ | Create task       |
| GET    | /stats          | ✓    | user+ | Task statistics   |
| GET    | /:id            | ✓    | user+ | Get single task   |
| PUT    | /:id            | ✓    | user+ | Update task       |
| DELETE | /:id            | ✓    | user+ | Delete task       |

### Users (`/api/v1/users`)

| Method | Endpoint           | Auth | Description       |
|--------|--------------------|------|-------------------|
| GET    | /profile           | ✓    | Get profile       |
| PUT    | /profile           | ✓    | Update name       |
| PUT    | /change-password   | ✓    | Change password   |

### Admin (`/api/v1/admin`) — Admin role required

| Method | Endpoint        | Auth | Description       |
|--------|----------------|------|-------------------|
| GET    | /stats          | ✓    | Platform stats    |
| GET    | /users          | ✓    | All users         |
| PATCH  | /users/:id      | ✓    | Update role/status |
| DELETE | /users/:id      | ✓    | Delete user       |

---

## Authentication Flow

```
1. POST /api/v1/auth/register  →  { name, email, password }
2. Server hashes password (bcrypt, 12 rounds)
3. Returns JWT (1h) + Refresh Token (7d)

4. POST /api/v1/auth/login     →  { email, password }
5. Server verifies credentials
6. Returns new JWT + Refresh Token

7. Protected requests:
   Authorization: Bearer <token>

8. Token expiry:
   POST /api/v1/auth/refresh  →  { refreshToken }
   Returns new JWT pair
```

---

## Database Schema

### User
```
_id         ObjectId (PK)
name        String  (2-50 chars)
email       String  (unique, indexed)
password    String  (hashed, not returned by default)
role        Enum    [user, admin]  default: user
isActive    Boolean default: true
lastLogin   Date
createdAt   Date
updatedAt   Date
```

### Task
```
_id          ObjectId (PK)
title        String   (3-100 chars)
description  String   (max 1000)
status       Enum     [todo, in-progress, done]
priority     Enum     [low, medium, high]
dueDate      Date
tags         [String]
owner        ObjectId → User (indexed)
isArchived   Boolean
createdAt    Date
updatedAt    Date
```

**Indexes:**
- `users`: `{ email: 1 }`, `{ role: 1 }`
- `tasks`: `{ owner: 1, status: 1 }`, `{ owner: 1, createdAt: -1 }`, text index on title+description

---

## Frontend Setup

```bash
cd frontend
npm install
npm start   # http://localhost:3000
```

**Pages:**
- `/login` — Sign in
- `/register` — Create account
- `/dashboard` — Stats overview (protected)
- `/tasks` — Full CRUD task manager (protected)
- `/profile` — Update name, change password (protected)
- `/admin` — User management, platform stats (admin only)

---

## Security Practices

- **Passwords** hashed with bcrypt (12 salt rounds)
- **JWT** with 1h expiry + 7d refresh token rotation
- **Helmet.js** sets secure HTTP headers
- **express-mongo-sanitize** prevents NoSQL injection
- **express-rate-limit** — 100 req/15min globally, 20/15min on auth routes
- **Input validation** via express-validator on all endpoints
- **Role-based middleware** — admin routes fully separated
- **Password not returned** in any response (Mongoose `select: false`)

---

## Scalability Notes

### Horizontal Scaling
Multiple backend instances can run behind a load balancer (e.g., Nginx, AWS ALB). Since JWT is stateless, no session sharing is needed.

### Load Balancing
Nginx or a cloud load balancer distributes traffic. Docker Swarm or Kubernetes handles container orchestration.

### Microservices Path
The modular structure (auth, tasks, admin) is designed for easy extraction into independent microservices. Each controller/route group can become its own service with its own DB.

### Caching (Redis)
Frequently read data (user stats, admin dashboards) can be cached in Redis with a 60s TTL, reducing DB load significantly.

### Database Indexing
Compound indexes on `{ owner, status }` and `{ owner, createdAt }` ensure task queries stay fast even at millions of records. Text indexes support full-text search.

### Database Sharding
MongoDB supports horizontal sharding. Shard key recommendation: `owner` field on tasks collection for even distribution.

---

## Bonus Features Implemented

- ✅ Docker + Docker Compose
- ✅ Nginx reverse proxy + SPA routing
- ✅ Winston logging (console + file in production)
- ✅ Morgan HTTP request logging
- ✅ Rate limiting (global + auth-specific)
- ✅ JWT refresh token rotation
- ✅ Pagination on all list endpoints
- ✅ Full-text search on tasks
- ✅ Task stats aggregation endpoint
- ✅ Admin: promote/demote users, deactivate accounts
- ✅ API versioning (`/api/v1/`)

---

## API Documentation

Swagger UI is available at:
```
http://localhost:5000/api-docs
```

All endpoints are documented with request/response schemas and auth requirements.
