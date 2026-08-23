const Task = require("../models/Task");

// @desc    Get all tasks for logged-in user (sorted newest first)
// @route   GET /tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
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

    return res.status(201).json(task);
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

    return res.status(200).json({
      message: "Task deleted successfully",
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
};
