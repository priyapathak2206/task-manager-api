const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// @desc    Register a new user
// @route   POST /auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password presence
    if (!email || !password) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Email and password are required",
      });
    }

    // Validate password length (min 6 characters)
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing user (case-insensitive)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        error: "Validation failed",
        message: "User already exists",
      });
    }

    // Hash password with 10 salt rounds
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (store lowercased email and hashed password)
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Return 201 with id and email — NEVER return password
    return res.status(201).json({
      id: user._id,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user & return JWT token
// @route   POST /auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input presence
    if (!email || !password) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by lowercased email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Sign JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // Return 200 with token and user object (id, email)
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently logged-in user profile
// @route   GET /auth/me
// @access  Private (Protected by auth middleware)
const me = async (req, res, next) => {
  try {
    // req.user.id is attached by auth middleware
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  me,
};
