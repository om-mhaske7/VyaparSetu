const User = require("../models/user");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/jwt");

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, kycDocs, fssaiNumber } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      kycDocs: role === "supplier" ? kycDocs || [] : [],
      fssaiNumber: role === "supplier" ? fssaiNumber : undefined,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Generate JWT
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

exports.getCurrentUser = (req, res) => {
  res.json({ user: req.user });
};

exports.logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};
