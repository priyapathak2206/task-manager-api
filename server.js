require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas BEFORE starting server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB Atlas successfully! Database name: ${mongoose.connection.name}`);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT} (0.0.0.0)`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Atlas connection FAILED:", err.message);
    process.exit(1);
  });