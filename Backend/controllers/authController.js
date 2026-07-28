import jwt from "jsonwebtoken";
import User from "../models/User.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || "citizen",
});

const generateToken = (user) => jwt.sign(
  { userId: user._id, email: user.email, role: user.role || "citizen" },
  process.env.JWT_SECRET,
  { algorithm: "HS256", expiresIn: "2h", issuer: "vidhya-vedha-api", audience: "vidhya-vedha-web" },
);

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.exists({ email })) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const user = await User.create({ name, email, password, role: "citizen" });
    return res.status(201).json({
      message: "Registration successful",
      token: generateToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    return res.json({
      message: "Login successful",
      token: generateToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  return res.json({ user: publicUser(user) });
};