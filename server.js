require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
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

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas BEFORE starting server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB Atlas successfully! Database name: ${mongoose.connection.name}`);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Atlas connection FAILED:", err.message);
    process.exit(1);
  });