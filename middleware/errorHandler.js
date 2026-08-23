// Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  // Log the stack trace for debugging
  console.error(err.stack);

  // Mongoose Schema Validation Error
  if (err.name === "ValidationError") {
    const details = err.errors
      ? Object.values(err.errors).map((e) => e.message)
      : [err.message];
    return res.status(400).json({
      error: "Validation failed",
      details,
    });
  }

  // Body parser bad JSON syntax error
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Validation failed",
      message: "Invalid JSON payload provided",
    });
  }

  // MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "unknown";
    return res.status(400).json({
      error: "Duplicate value",
      field,
    });
  }

  // CastError (e.g. invalid MongoDB ObjectId format)
  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Validation failed",
      details: [`Invalid ${err.path}: ${err.value}`],
    });
  }

  // Default Internal Server Error
  return res.status(500).json({
    error: "Internal server error",
  });
};

module.exports = errorHandler;
