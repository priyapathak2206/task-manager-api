// Validation middleware for Task operations

const validateCreateTask = (req, res, next) => {
  const { title, description } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      message: "Task title is required and cannot be empty.",
    });
  }

  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({
      message: "Description must be a valid text string.",
    });
  }

  next();
};

const validateUpdateTask = (req, res, next) => {
  const { title, description, completed } = req.body;

  // Check if at least one updatable field is provided
  if (
    title === undefined &&
    description === undefined &&
    completed === undefined
  ) {
    return res.status(400).json({
      message: "At least one field (title, description, or completed) must be provided for update.",
    });
  }

  // Validate title if provided
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        message: "Title cannot be empty.",
      });
    }
  }

  // Validate description if provided
  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({
      message: "Description must be a valid text string.",
    });
  }

  // Validate completed if provided
  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({
      message: "Completed status must be a boolean value (true or false).",
    });
  }

  next();
};

module.exports = {
  validateCreateTask,
  validateUpdateTask,
};
