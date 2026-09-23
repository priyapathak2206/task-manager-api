const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const auth = require("../middleware/auth");
const validateTaskInput = require("../middleware/validateTaskInput");

// Apply the auth middleware to ALL routes in this router
router.use(auth);

// Task Routes
router.get("/", taskController.getTasks);
router.get("/cache-stats", taskController.getCacheStats);

router.post("/", validateTaskInput, taskController.createTask);
router.put("/:id", validateTaskInput, taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;