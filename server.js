const express = require("express");

const app = express();

app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// In-memory tasks
let tasks = [
  {
    id: 1,
    title: "Learn Express",
    completed: false,
  },
  {
    id: 2,
    title: "Complete Practical 4",
    completed: false,
  },
];

// Home Route
app.get("/", (req, res) => {
  res.send("Task Manager API Running");
});

// GET all tasks
app.get("/tasks", (req, res) => {
  res.status(200).json(tasks);
});

// POST new task
app.post("/tasks", (req, res) => {
  const newTask = {
    id: tasks.length + 1,
    title: req.body.title,
    completed: false,
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

// PUT update task
app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  task.title = req.body.title || task.title;

  if (req.body.completed !== undefined) {
    task.completed = req.body.completed;
  }

  res.status(200).json(task);
});

// DELETE task
app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  tasks.splice(index, 1);

  res.status(200).json({
    message: "Task deleted successfully",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    error: "Something went wrong",
  });
});

app.listen(5000, () => {
  console.log("✅ MY SERVER STARTED ON PORT 5000");
});