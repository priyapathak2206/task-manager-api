const Task = require("../models/task");
const taskEvents = require("../events");
const { cache, getCache, getStats, resetStats } = require("../cache");

const getTasksCacheKey = (userId) => `tasks:${userId}`;

// @desc    Get all tasks for logged-in user (sorted newest first) with Practical 9 caching
// @route   GET /tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const cacheKey = getTasksCacheKey(req.user.id);
    const bypassCache = req.query.noCache === "true";

    if (!bypassCache) {
      // Practical 9: Check cache first
      const cachedTasks = getCache(cacheKey);

      if (cachedTasks !== undefined) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(cachedTasks);
      }
    }

    // Cache miss or explicitly bypassed: fetch from MongoDB Atlas
    res.setHeader("X-Cache", "MISS");
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });

    // Store in cache for 60 seconds (stdTTL is configured in cache.js)
    cache.set(cacheKey, tasks);

    return res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new task scoped to req.user.id
// @route   POST /tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, completed } = req.body;

    const task = await Task.create({
      title,
      description,
      completed: completed !== undefined ? completed : false,
      user: req.user.id,
    });

    // Practical 9: Invalidate cache on write operation
    cache.del(getTasksCacheKey(req.user.id));

    const apiTimestamp = new Date().toISOString();
    console.log(`[API Response] Task created at ${apiTimestamp}`);
    res.status(201).json(task);

    // Practical 10: Emit asynchronous task-created event
    taskEvents.emit("task-created", { task, apiTimestamp });
    return;
  } catch (err) {
    next(err);
  }
};

// @desc    Update task (checks ownership by _id and user)
// @route   PUT /tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Practical 9: Invalidate cache on write operation
    cache.del(getTasksCacheKey(req.user.id));

    return res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete task (checks ownership by _id and user)
// @route   DELETE /tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Practical 9: Invalidate cache on write operation
    cache.del(getTasksCacheKey(req.user.id));

    const apiTimestamp = new Date().toISOString();
    console.log(`[API Response] Task deleted at ${apiTimestamp}`);
    res.status(200).json({
      message: "Task deleted successfully",
    });

    // Practical 10: Emit asynchronous task-deleted event
    taskEvents.emit("task-deleted", { task, apiTimestamp });
    return;
  } catch (err) {
    next(err);
  }
};

// @desc    Get cache statistics (hits, misses, ratio)
// @route   GET /tasks/cache-stats
// @access  Private
const getCacheStats = async (req, res, next) => {
  try {
    const stats = getStats();
    return res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};

// @desc    Clear user's task cache manually for testing
// @route   POST /tasks/cache-clear
// @access  Private
const clearCache = async (req, res, next) => {
  try {
    const cacheKey = getTasksCacheKey(req.user.id);
    const deleted = cache.del(cacheKey);
    return res.status(200).json({
      message: "Cache invalidated successfully",
      cacheKey,
      cleared: deleted > 0,
      stats: getStats(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getCacheStats,
  clearCache,
};
