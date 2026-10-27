# Task Manager API

[![CI Pipeline](https://github.com/priyapathak2206/task-manager-api/actions/workflows/ci.yml/badge.svg)](https://github.com/priyapathak2206/task-manager-api/actions/workflows/ci.yml)

A Node.js & Express RESTful API for task management featuring JWT authentication, MongoDB Atlas integration, event listeners via `EventEmitter`, AI-powered task description generation powered by Groq API (`openai/gpt-oss-20b`), unit/integration testing with Jest & Supertest, and a CI pipeline with GitHub Actions.

## Features
- **Authentication**: JWT token authentication with bcrypt password hashing.
- **Task Management**: CRUD endpoints protected by authentication middleware.
- **AI Task Description Generator**: AI-powered task description generation via `POST /api/ai/generate-description` using the Groq API (`openai/gpt-oss-20b`).
- **Responsible AI & Security**: Server-side rate limiting (1 request per user per minute), system prompt safety instructions, frontend editable suggestion fill, and user disclaimer.
- **Event-Driven Architecture**: Internal `EventEmitter` for background task logging and processing.
- **Automated Testing**: Jest and Supertest suite for testing route protection, validation, and mocked AI endpoints without requiring paid API calls or live databases.
- **Continuous Integration**: GitHub Actions workflow that executes tests on every push and pull request to `main`.

## Prerequisites
- Node.js (v18 or higher)
- npm

## Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/priyapathak2206/task-manager-api.git
   cd task-manager-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1h
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. Start the application:
   ```bash
   npm start
   ```

## AI Feature & Responsible AI Guidelines

### 1. Overview
The `POST /api/ai/generate-description` endpoint accepts a task title from authenticated users and returns an AI-generated 1–2 sentence task description along with an explicit disclaimer.

### 2. Privacy Considerations
- **Data Minimization**: Only the task title input is sent to the LLM. User profile data, credentials, and MongoDB identifiers are never transmitted to external APIs.
- **API Key Confidentiality**: `GROQ_API_KEY` is loaded exclusively on the backend from environment variables (`process.env`) and is never exposed to client-side code or committed to Git (`.env` is `.gitignore` protected).

### 3. System Limitations
- **Rate Limiting**: Requests are rate-limited per user ID to 1 request per 60 seconds to prevent abuse and manage API usage quotas.
- **Timeout Protection**: Requests to the Groq API have a strict 10-second timeout. If the request times out or fails, a friendly error response is returned so normal task creation is never blocked.

### 4. Responsible AI Usage
- **Human-in-the-Loop**: Generated descriptions auto-fill into the editable description field accompanied by the disclaimer: *"AI-generated suggestion — review and edit before saving."* Users are encouraged to review, modify, or overwrite suggestions.
- **Safety Prompting**: System instructions explicitly enforce professional, safe, non-toxic, and neutral language without markdown formatting.

## Local Testing
To run the automated Jest test suite locally (includes mocked AI API tests):
```bash
npm test
```

## CI/CD Workflow
The GitHub Actions workflow configuration is located at `.github/workflows/ci.yml`. On every `push` or `pull_request` to the `main` branch, GitHub Actions automatically:
1. Checks out the repository code.
2. Sets up Node.js.
3. Installs dependencies using `npm ci`.
4. Executes unit and integration tests using `npm test`.
