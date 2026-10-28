// API client for TaskFlow

// In production, when served by Express from the same origin, API_BASE defaults to empty string for relative paths
const API_BASE =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : import.meta.env.PROD
    ? ""
    : "http://localhost:5000";

export function getToken() {
  return localStorage.getItem("taskflow_token") || localStorage.getItem("token") || null;
}

export function setToken(token) {
  if (token) {
    localStorage.setItem("taskflow_token", token);
    localStorage.setItem("token", token);
  }
}

export function removeToken() {
  localStorage.removeItem("taskflow_token");
  localStorage.removeItem("token");
  localStorage.removeItem("taskflow_user");
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("taskflow_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem("taskflow_user", JSON.stringify(user));
  }
}

function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const startTime = performance.now();
  const url = `${API_BASE}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const durationMs = Math.round(performance.now() - startTime);
  const cacheHeader = response.headers.get("X-Cache") || null;

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("taskflow_auth_logout"));
      }
    }

    const errorMsg =
      data?.message ||
      data?.error ||
      (Array.isArray(data?.details) ? data.details.join(", ") : null) ||
      (response.status === 401
        ? "Please sign in to continue."
        : `Request failed with status ${response.status}`);

    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return {
    data,
    durationMs,
    cacheStatus: cacheHeader,
    status: response.status,
  };
}

// --------------------------------------------------------------------------
// Authentication Endpoints (Practical 7)
// --------------------------------------------------------------------------
export async function login(email, password) {
  const { data } = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!data?.token) {
    throw new Error("Authentication response did not contain a valid token.");
  }

  setToken(data.token);
  setStoredUser(data.user);
  return data;
}

export async function register(email, password) {
  const { data } = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data;
}

export async function getMe() {
  const token = getToken();
  if (!token) return null;
  const { data } = await request("/auth/me");
  setStoredUser(data);
  return data;
}

export function logout() {
  removeToken();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("taskflow_auth_logout"));
  }
}

// --------------------------------------------------------------------------
// Task Endpoints & Caching (Practical 4, 5, 6, 9)
// --------------------------------------------------------------------------
export async function getTasks({ noCache = false } = {}) {
  const token = getToken();
  if (!token) {
    return { tasks: [], durationMs: 0, cacheStatus: null, unauthenticated: true };
  }
  const query = noCache ? "?noCache=true" : "";
  const result = await request(`/tasks${query}`);
  return {
    tasks: result.data || [],
    durationMs: result.durationMs,
    cacheStatus: result.cacheStatus,
    unauthenticated: false,
  };
}

export async function createTask(task) {
  const { data } = await request("/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });
  return data;
}

export async function updateTask(id, task) {
  const { data } = await request(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });
  return data;
}

export async function deleteTask(id) {
  const { data } = await request(`/tasks/${id}`, {
    method: "DELETE",
  });
  return data;
}

// --------------------------------------------------------------------------
// Cache Statistics & Diagnostics (Practical 9)
// --------------------------------------------------------------------------
export async function getCacheStats() {
  const token = getToken();
  if (!token) return null;
  const { data } = await request("/tasks/cache-stats");
  return data;
}

export async function clearCache() {
  const { data } = await request("/tasks/cache-clear", {
    method: "POST",
  });
  return data;
}

// --------------------------------------------------------------------------
// Asynchronous Events (Practical 10)
// --------------------------------------------------------------------------
export async function getEvents() {
  const token = getToken();
  if (!token) return [];
  const result = await request("/api/events");
  return Array.isArray(result?.data?.events) ? result.data.events : [];
}

// --------------------------------------------------------------------------
// AI Task Description Generation (Practical 13)
// --------------------------------------------------------------------------
export async function generateAiDescription(title) {
  const { data } = await request("/api/ai/generate-description", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  return data;
}

// --------------------------------------------------------------------------
// System Health Endpoint
// --------------------------------------------------------------------------
export async function getHealth() {
  const { data } = await request("/health");
  return data;
}

// --------------------------------------------------------------------------
// GitHub API Integration (Practical 3)
// --------------------------------------------------------------------------
export async function getGithubRepos(username = "priyapathak2206") {
  const cleanUser = encodeURIComponent(username.trim());
  const res = await fetch(`https://api.github.com/users/${cleanUser}/repos?sort=updated&per_page=30`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`GitHub user "${username}" was not found.`);
    }
    if (res.status === 403) {
      throw new Error("GitHub API rate limit reached. Please try again shortly.");
    }
    throw new Error(`Failed to load GitHub repositories (HTTP ${res.status}).`);
  }

  return await res.json();
}

export async function getGithubProfile(username = "priyapathak2206") {
  const cleanUser = encodeURIComponent(username.trim());
  const res = await fetch(`https://api.github.com/users/${cleanUser}`);
  if (!res.ok) return null;
  return await res.json();
}
