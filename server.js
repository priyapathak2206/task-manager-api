const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Task = require("./models/Task");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Home Route
app.get("/", (req, res) => {
  res.send("Task Manager API Running");
});

// GET all tasks
app.get("/tasks", async (req, res, next) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET task by ID
app.get("/tasks/:id", async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// POST new task
app.post("/tasks", async (req, res, next) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// PUT update task
app.put("/tasks/:id", async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        completed: req.body.completed,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// DELETE task
app.delete("/tasks/:id", async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: err.message,
    });
  }

  res.status(500).json({
    error: "Something went wrong",
  });
});

// Start Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});