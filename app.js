global.crypto = require("crypto").webcrypto;
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Route Mounts
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

// Load Event Listeners
require("./listeners");

// Centralized Error Handler (MUST be the last middleware)
app.use(errorHandler);

module.exports = app;
