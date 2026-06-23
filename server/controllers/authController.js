const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const sendAuthResponse = (res, user) => {
  res.json({
    token: generateToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
    });

    return sendAuthResponse(res, user);
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)[0]?.message || "Invalid user data";
      return res.status(400).json({ message });
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return sendAuthResponse(res, user);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
