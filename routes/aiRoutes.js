const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const auth = require("../middleware/auth");

// Protect endpoint with JWT authentication middleware
router.post("/generate-description", auth, aiController.generateDescription);

module.exports = router;
