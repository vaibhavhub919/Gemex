import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  upiId: user.upiId,
  role: user.role,
  walletBalance: user.walletBalance,
  createdAt: user.createdAt
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email." });
    }

    const user = await User.create({ name, email, password, phone });
    const token = createToken(user._id, user.role);

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Registration failed." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = createToken(user._id, user.role);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Login failed." });
  }
};

export const getProfile = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const { name, email, phone, upiId, password } = req.body;

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.phone = phone ?? user.phone;
    user.upiId = upiId ?? user.upiId;

    if (password) {
      user.password = password;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Profile update failed." });
  }
};
