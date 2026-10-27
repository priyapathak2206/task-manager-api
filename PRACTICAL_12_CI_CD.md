# Practical 12: CI/CD Pipeline with GitHub Actions

## Overview
This document explains the Continuous Integration (CI) pipeline implemented for the **Task Manager API** using **GitHub Actions**, Jest, and Supertest.

---

## 1. CI Pipeline Architecture

The workflow is defined in `.github/workflows/ci.yml`.

### Triggers
- `push` to the `main` branch.
- `pull_request` targeting the `main` branch.

### Workflow Steps
1. **Checkout Code**: Uses `actions/checkout@v4` to pull down the repository code.
2. **Setup Node.js**: Uses `actions/setup-node@v4` with Node.js version 20 and enables npm dependency caching.
3. **Install Dependencies**: Executes `npm ci` for clean, deterministic installations matching `package-lock.json`.
4. **Execute Tests**: Runs `npm test` (`jest --detectOpenHandles`) to execute all automated test suites.

---

## 2. Local Testing Instructions

Before pushing changes to GitHub, developer tests can be run locally:

```bash
# Navigate to project root
cd C:\Users\User\task-manager-api

# Install dependencies (if not already done)
npm install

# Run the Jest test suite
npm test
```

### Test Strategy Without Database Dependency
The Express application logic in `app.js` is decoupled from the database connection logic in `server.js`. Supertest sends requests directly to the in-memory Express application instance. This allows authentication middleware and request validation tests to run quickly in CI/CD without requiring a live MongoDB Atlas connection or secret environment variables.

---

## 3. Finding Workflow Runs on GitHub

To view workflow execution results:
1. Navigate to the GitHub repository: `https://github.com/priyapathak2206/task-manager-api`
2. Click on the **Actions** tab in the top navigation bar.
3. On the left sidebar, click **CI Pipeline**.

### Identifying Workflow Statuses
- **Successful Runs (Passed)**: Displayed with a green checkmark (`✔`). All tests passed, exit code was 0.
- **Failed Runs (Failed)**: Displayed with a red cross (`✖`). Click on the failed run and select the **Run tests** step to view the Jest failure traceback.

---

## 4. Practical Submission Demonstration Steps

To demonstrate both a failed workflow run and a successful workflow run for college evaluation:

### Step 1: Intentionally Cause a Test Failure
1. Edit `tests/api.test.js` and change an assertion (e.g. change `expect(response.status).toBe(401)` to `expect(response.status).toBe(200)`).
2. Commit and push the breaking change:
   ```bash
   git add tests/api.test.js
   git commit -m "test: simulate failing CI test"
   git push origin main
   ```
3. Go to GitHub **Actions** tab to observe the failed workflow run marked with red `✖`.

### Step 2: Fix the Test & Verify Success
1. Revert `tests/api.test.js` back to the correct assertion (`toBe(401)`).
2. Verify locally that tests pass:
   ```bash
   npm test
   ```
3. Commit and push the fix:
   ```bash
   git add tests/api.test.js
   git commit -m "fix: resolve authentication test assertion"
   git push origin main
   ```
4. Go to GitHub **Actions** tab to verify the workflow succeeds with green `✔` status badge.
