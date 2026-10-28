if (!global.crypto) {
  try {
    global.crypto = require("crypto").webcrypto;
  } catch (_) {}
}
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const aiRoutes = require("./routes/aiRoutes");
const eventRoutes = require("./routes/eventRoutes");
const errorHandler = require("./middleware/errorHandler");
const { getStats } = require("./cache");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static assets from frontend/dist (if built) or public folder
app.use(express.static(path.join(__dirname, "frontend", "dist")));
app.use(express.static(path.join(__dirname, "public")));

// Practical 4: Request Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Practical 4 & Practical 7: Route Mounts
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/events", eventRoutes);

// Page 7: API & Backend Health Check endpoint
app.get("/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const mem = process.memoryUsage();

  return res.status(200).json({
    status: "healthy",
    application: "TaskFlow — AWDF Integrated Application",
    version: "1.0.0",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: {
      status: isDbConnected ? "connected" : "disconnected",
      name: mongoose.connection.name || "taskmanager",
      readyState: mongoose.connection.readyState,
    },
    memory: {
      rssMB: Math.round(mem.rss / 1024 / 1024),
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
    },
    cache: getStats(),
    practicals: {
      P1: "Reusable React components and props",
      P2: "useState, controlled inputs, useEffect and React Router",
      P3: "GitHub API integration with loading/error/data states",
      P4: "Express REST CRUD endpoints, logging and centralized error handling",
      P5: "MongoDB/Mongoose schemas, validation and persistent storage",
      P6: "Complete React-to-Express-to-MongoDB task workflow",
      P7: "Secure authentication, bcrypt password hashing, JWT and protected routes",
      P8: "React.lazy, Suspense and route-level code splitting",
      P9: "Caching with 60s TTL, write invalidation and measurable performance comparisons",
      P10: "Node.js EventEmitter asynchronous task notifications and timestamps",
      P11: "Appropriate Dockerfiles, .dockerignore and Docker Compose configuration",
      P12: "GitHub Actions CI pipeline for tests, linting, and build verification",
      P13: "Responsible AI task-description generator with Groq API, rate limiting, and fallback",
    },
  });
});

// Load Event Listeners (Practical 10)
require("./listeners");

// SPA Client-Side Routing Fallback (Practical 8 / React Router)
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/tasks") ||
    req.path.startsWith("/auth") ||
    req.path.startsWith("/health")
  ) {
    return next();
  }
  const fs = require("fs");
  const distIndex = path.join(__dirname, "frontend", "dist", "index.html");
  const publicIndex = path.join(__dirname, "public", "index.html");
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  if (fs.existsSync(publicIndex)) {
    return res.sendFile(publicIndex);
  }
  next();
});

// Centralized Error Handler (MUST be the last middleware - Practical 4)
app.use(errorHandler);

module.exports = app;
