# Task Manager API

[![CI Pipeline](https://github.com/priyapathak2206/task-manager-api/actions/workflows/ci.yml/badge.svg)](https://github.com/priyapathak2206/task-manager-api/actions/workflows/ci.yml)

A Node.js & Express RESTful API for task management featuring JWT authentication, MongoDB Atlas integration, event listeners via `EventEmitter`, unit/integration testing with Jest & Supertest, and a CI pipeline with GitHub Actions.

## Features
- **Authentication**: JWT token authentication with bcrypt password hashing.
- **Task Management**: CRUD endpoints protected by authentication middleware.
- **Event-Driven Architecture**: Internal `EventEmitter` for background task logging and processing.
- **Automated Testing**: Jest and Supertest suite for testing route protection and validation without requiring a live database.
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
   ```

4. Start the application:
   ```bash
   npm start
   ```

## Local Testing
To run the automated Jest test suite locally:
```bash
npm test
```

## CI/CD Workflow
The GitHub Actions workflow configuration is located at `.github/workflows/ci.yml`. On every `push` or `pull_request` to the `main` branch, GitHub Actions automatically:
1. Checks out the repository code.
2. Sets up Node.js.
3. Installs dependencies using `npm ci`.
4. Executes unit and integration tests using `npm test`.
