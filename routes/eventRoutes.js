const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getEvents } = require("../listeners");

// @desc    Get asynchronous task notification events
// @route   GET /api/events
// @access  Private
router.get("/", auth, (req, res) => {
  try {
    const events = getEvents(req.user.id);
    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to retrieve events",
      message: err.message,
    });
  }
});

module.exports = router;

