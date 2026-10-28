# TaskFlow — AWDF Integrated Application

[![CI Pipeline](https://github.com/priyapathak2206/task-manager-api/actions/workflows/ci.yml/badge.svg)](https://github.com/priyapathak2206/task-manager-api/actions/workflows/ci.yml)

**TaskFlow** is an integrated full-stack web application developed for the **Advanced Web Development Frameworks (AWDF)** course. It unifies all 13 practical implementations (P1 through P13) into a single production-ready system featuring a responsive React 19 single-page application (SPA), an Express 5 RESTful API, MongoDB Atlas cloud persistence, in-memory caching with measurable response-time benchmarking, asynchronous background event notifications, Docker containerization, a GitHub Actions CI pipeline, and responsible AI-powered task description generation.

---

## Practical-to-Feature Mapping (P1–P13)

| Practical | Academic Specification | Implementation in TaskFlow | Code Location |
| :--- | :--- | :--- | :--- |
| **P1** | Reusable React components & props | Modular React components: `TaskStatistics`, `Spinner`, `ErrorMessage`, `MetricCard`, `TaskCard`, and `TaskForm` with prop contracts. | `frontend/src/components/` |
| **P2** | `useState`, controlled inputs, `useEffect`, React Router | Client-side routing with React Router v7, 7 functional pages, controlled form state, and lifecycle data fetching. | `frontend/src/App.jsx`, `frontend/src/pages/` |
| **P3** | GitHub API integration with 4 states | Live integration querying `api.github.com/users/{username}/repos` handling loading, error, empty, and success repository cards. | `frontend/src/pages/Projects.jsx`, `frontend/src/api.js` |
| **P4** | Express REST CRUD endpoints & logging | RESTful API routes (`GET`, `POST`, `PUT`, `DELETE`), ISO request logging middleware, and centralized error handling. | `app.js`, `controllers/taskController.js`, `middleware/errorHandler.js` |
| **P5** | MongoDB & Mongoose schemas & validation | Strict Mongoose models with validation (`Task`, `User`), unique constraints, and persistent MongoDB Atlas cloud storage. | `models/task.js`, `models/User.js` |
| **P6** | End-to-end task workflow | React frontend connected to Express API and MongoDB Atlas for full task lifecycle (create, read, update, delete, search, filter). | `frontend/src/pages/Tasks.jsx`, `frontend/src/api.js` |
| **P7** | Secure authentication & JWT protected routes | Bcrypt password hashing (10 salt rounds), signed JWT tokens (1-hour expiration), Bearer authorization middleware, and user data isolation. | `controllers/authController.js`, `middleware/auth.js`, `frontend/src/pages/Account.jsx` |
| **P8** | `React.lazy`, `Suspense` & code splitting | Route-level dynamic imports for all secondary pages (`Dashboard`, `Tasks`, `Projects`, `PerformanceLab`, `ActivityEvents`, `Account`, `Health`) with fallback loaders. | `frontend/src/App.jsx` |
| **P9** | In-memory cache (60s TTL) & benchmarking | `NodeCache` with 60s TTL, automatic write-invalidation (`cache.del`), `X-Cache: HIT/MISS` headers, hit/miss metrics, and interactive Performance Lab. | `cache.js`, `controllers/taskController.js`, `frontend/src/pages/PerformanceLab.jsx` |
| **P10** | Node.js `EventEmitter` async notifications | Decoupled background event engine logging asynchronous task-created/deleted notifications with exact ISO timestamps and processing duration. | `events.js`, `listeners.js`, `frontend/src/pages/ActivityEvents.jsx` |
| **P11** | Dockerfiles, `.dockerignore` & Docker Compose | Multi-stage Dockerfile for React/Nginx frontend, Node.js backend Dockerfile, and multi-container `docker-compose.yml` with bridge network. | `Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml` |
| **P12** | GitHub Actions CI/CD pipeline | Automated CI workflow verifying backend tests (Jest/Supertest), frontend linting (ESLint), and production build (Vite). | `.github/workflows/ci.yml` |
| **P13** | AI task description generation (Groq API) | Backend AI generation endpoint with `qwen/qwen3.8-27b`, 10s timeout, 60s per-user rate limit, safety prompt, and editable frontend disclaimer. | `controllers/aiController.js`, `frontend/src/components/TaskForm.jsx`, `tests/ai.test.js` |

---

## Pages in the Integrated Application

1. **Dashboard (`/`):** Real-time analytics, task completion progress bar, active cache hit ratio, AI assistant status, recent tasks, recent asynchronous notification preview, and practical roadmap.
2. **Tasks (`/tasks`):** Create, view, edit, delete, toggle completion, search by keyword, and filter by status (All, Pending, Completed). Includes AI-assisted description generation.
3. **Projects (`/projects`):** Connects to GitHub API for `@priyapathak2206` (or any entered username) demonstrating 4 distinct UI states: loading spinner, error alert with retry, empty state, and responsive repository grid.
4. **Performance Lab (`/performance-lab`):** Interactive cache benchmark suite demonstrating Cold DB queries (cache miss) vs Warm RAM queries (cache hit), side-by-side latency comparison, cache hit ratio, and manual write-invalidation.
5. **Activity & Events (`/activity`):** Real-time stream of Node.js EventEmitter notifications displaying API response timestamp, notification start timestamp, completion timestamp (2000ms delay), and processing duration.
6. **Account (`/account`):** User registration, login, profile inspection, decoded JWT token inspector (HS256 payload and expiry), security details, and sign out.
7. **API/Health (`/health`):** Real-time backend diagnostics including server uptime, Node.js environment, MongoDB Atlas connection state, memory consumption (RSS, Heap), cache keys, and practical verification checklist.

---

## Technology Stack

- **Frontend:** React 19, React Router v7, Vite 8, Modern CSS Variables design system.
- **Backend:** Node.js 20, Express 5, CORS, Dotenv.
- **Database:** MongoDB Atlas (Mongoose ODM).
- **Authentication:** JSON Web Tokens (`jsonwebtoken`), Passwords hashed with `bcryptjs`.
- **Caching:** `node-cache` (60-second TTL).
- **Event Engine:** Node.js built-in `EventEmitter`.
- **AI Integration:** Groq SDK (`qwen/qwen3.8-27b`).
- **Testing:** Jest 29, Supertest 7.
- **DevOps:** Docker, Docker Compose, Nginx Alpine, GitHub Actions.

---

## Prerequisites

- **Node.js:** v18.0.0 or higher (v20+ recommended).
- **npm:** v9.0.0 or higher.
- **Docker & Docker Compose:** (Optional, for containerized execution).

---

## Environment Configuration

Create a `.env` file in the root directory (refer to `.env.example`):

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_jwt_secret
JWT_EXPIRES_IN=1h
GROQ_API_KEY=your_groq_api_key_here
```

> **Security Note:** Secrets such as `GROQ_API_KEY` and `JWT_SECRET` are strictly read from backend environment variables and are never bundled into client-side code or committed to Git (`.env` is ignored by `.gitignore`).

---

## Setup & Running Locally

### 1. Install Backend & Frontend Dependencies

```bash
# In the root directory:
npm install

# In the frontend directory:
cd frontend
npm install
cd ..
```

### 2. Start the Backend Server (Express + MongoDB)

```bash
npm start
```
*The Express API will start on `http://localhost:5000`.*

### 3. Start the Frontend Development Server (Vite)

In a separate terminal:

```bash
cd frontend
npm run dev
```
*The React SPA will launch on `http://localhost:5173` with automatic API proxying to `http://localhost:5000`.*

Alternatively, the production-built React frontend is also served directly by Express at `http://localhost:5000`.

---

## Running with Docker & Docker Compose (Practical 11)

To run the complete stack (Frontend, Backend, and MongoDB) in isolated containers:

```bash
docker-compose up --build
```

- **Frontend (Nginx + React SPA):** `http://localhost:5173`
- **Backend API (Express):** `http://localhost:5000`
- **MongoDB:** `mongodb://localhost:27017`

To shut down the containers:

```bash
docker-compose down
```

---

## Automated Testing & Verification

TaskFlow includes comprehensive automated unit, integration, and build verification suites:

```bash
# 1. Run Backend Unit & Integration Tests (16 tests across 3 suites)
npm test

# 2. Run Frontend ESLint Verification
npm run lint:frontend

# 3. Run Frontend Vite Production Build Verification
npm run build:frontend
```

---

## RESTful API Endpoints

### Authentication (Practical 7)
- `POST /auth/register` — Register a new user (body: `{ email, password }`).
- `POST /auth/login` — Sign in and receive JWT token (body: `{ email, password }`).
- `GET /auth/me` — Get profile of currently authenticated user.

### Tasks (Practicals 4, 5, 6, 9, 10)
- `GET /tasks` — Retrieve user tasks (cached with 60s TTL; returns `X-Cache: HIT|MISS`).
- `GET /tasks?noCache=true` — Bypasses cache for benchmark testing.
- `POST /tasks` — Create new task (invalidates cache, emits `task-created` event).
- `PUT /tasks/:id` — Update task by ID (verifies ownership, invalidates cache).
- `DELETE /tasks/:id` — Delete task by ID (verifies ownership, invalidates cache, emits `task-deleted` event).
- `GET /tasks/cache-stats` — Returns live cache hits, misses, and hit ratio.
- `POST /tasks/cache-clear` — Manually invalidates the user's task cache.

### Asynchronous Events (Practical 10)
- `GET /api/events` — Returns recorded EventEmitter notification logs with ISO timestamps.

### AI Description Generator (Practical 13)
- `POST /api/ai/generate-description` — Generates actionable description from task title using Groq (`qwen/qwen3.8-27b`) with per-user rate limiting (1 req/min) and safety disclaimer.

### System Health (Page 7)
- `GET /health` — Returns system status, uptime, MongoDB Atlas connection state, memory usage, and practicals mapping.

---

## Production Deployment (Render / Cloud Platforms)

TaskFlow is architected for zero-configuration, single-service deployment where Express serves both the backend API and the compiled React production frontend from the same origin.

### Deployment Specifications

- **Hosting Platform:** Render (Web Service) or any Node.js 18+ container/PaaS host.
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/health`
- **Node Runtime Version:** `20` (or `18+`)

### Required Environment Variables

Configure these environment variables in your hosting provider's dashboard (never commit real values to Git):

| Variable Name | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | Node execution environment | `production` |
| `PORT` | Auto | Server listening port (injected by host) | `10000` (Render default) |
| `MONGO_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/taskmanager?retryWrites=true&w=majority` |
| `JWT_SECRET` | Yes | Strong random secret string for JWT signing | `generated_high_entropy_secret_key` |
| `JWT_EXPIRES_IN`| No | JWT validity duration | `1h` (default) |
| `GROQ_API_KEY` | Optional | Groq API key for AI description generation | `gsk_...` (AI gracefully falls back if omitted) |

> **Security Note:** In production, `API_BASE` in the frontend defaults to relative paths (`""`), ensuring API calls seamlessly route to the same origin without CORS complications or leaking internal hostnames.

### Step-by-Step Render Deployment

1. **Push Repository to GitHub:**
   Ensure the `main` branch contains all code and configurations (`render.yaml`, `package.json`, etc.).
2. **Create New Web Service on Render:**
   - Log in to [Render Dashboard](https://dashboard.render.com).
   - Click **New +** → **Web Service**.
   - Connect your GitHub repository `priyapathak2206/task-manager-api`.
3. **Configure Service Settings:**
   - **Name:** `taskflow-app` (or chosen name).
   - **Region:** Choose the region closest to your MongoDB Atlas cluster (e.g., Oregon or Frankfurt).
   - **Branch:** `main`
   - **Root Directory:** Leave empty (root of repository).
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. **Set Environment Variables:**
   Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = *(Your MongoDB Atlas connection URI)*
   - `JWT_SECRET` = *(A secure random string)*
   - `JWT_EXPIRES_IN` = `1h`
   - `GROQ_API_KEY` = *(Your Groq API key)*
5. **Set Health Check:**
   Under **Advanced Settings** → **Health Check Path**, enter `/health`.
6. **Deploy:**
   Click **Create Web Service**. Render will execute the build, verify the `/health` endpoint, and assign a live URL (e.g., `https://taskflow-app.onrender.com`).

### How to Verify the Live Deployment

1. **Verify Health Endpoint:**
   Navigate to `https://<your-service>.onrender.com/health`.
   Confirm response HTTP 200 with JSON:
   `{ "status": "healthy", "database": { "status": "connected" }, ... }`
2. **Verify Frontend UI:**
   Navigate to `https://<your-service>.onrender.com/`. Confirm the TaskFlow Dashboard loads with dark slate theme, task overview, quick actions, and feature cards.
3. **Verify SPA Routing:**
   Refresh while on `https://<your-service>.onrender.com/projects` or `/activity`. Confirm it resolves correctly without 404 errors.
4. **Verify Authentication & Task Workflow:**
   Register an account at `/account`, log in, create a task at `/tasks`, update its completion, and delete it.
5. **Verify AI & Performance Endpoints:**
   Test AI suggestion on the task creation form and open `/performance-lab` to observe cache hit/miss latency.

---

## Responsible AI Guidelines (Practical 13)

1. **Human-in-the-Loop:** Suggestions populate an editable form field, accompanied by an explicit disclaimer: *"AI-generated suggestion — review and edit before saving."*
2. **Data Minimization:** Only the task title string is sent to the LLM. User credentials, database IDs, and emails are never shared.
3. **Abuse Mitigation:** Server-side per-user rate limiting strictly restricts generation to 1 request every 60 seconds per account (HTTP 429).
4. **Resilience & Graceful Fallback:** A strict 10-second timeout prevents server hangs. If the AI service times out or fails, clear error messages are surfaced and users can write descriptions manually.
