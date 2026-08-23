// Middleware to validate task input for POST and PUT requests
const validateTaskInput = (req, res, next) => {
  const { title, description, completed } = req.body;

  // On POST: title is required and must be a non-empty string
  if (req.method === "POST") {
    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        error: "Validation failed",
        message: "Title is required and must be a non-empty string",
      });
    }
  }

  // On PUT/PATCH: title is optional, but if provided it must be a non-empty string
  if (req.method === "PUT" || req.method === "PATCH") {
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
          error: "Validation failed",
          message: "Title must be a non-empty string if provided",
        });
      }
    }
  }

  // Validate description type if provided
  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({
      error: "Validation failed",
      message: "Description must be a valid string if provided",
    });
  }

  // Validate completed status type if provided
  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({
      error: "Validation failed",
      message: "Completed status must be a boolean (true or false)",
    });
  }

  next();
};

module.exports = validateTaskInput;
