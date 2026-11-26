import { User, registerValidation, loginValidation, emailValidation } from '../models/userModel.js';
import { sendEmail } from '../utils/sendEmail.js';
import crypto from "crypto";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const publicUser = (u) => ({ id: u._id, username: u.username, email: u.email });

export const register = async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ email });
  if (user) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(req.body.password, 12);

  let newUser;
  try {
    newUser = await User.create({
      username: req.body.username.trim(),
      email,
      password: hashedPassword
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    throw err;
  }

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
  return res.status(201).json({
    message: "User created successfully",
    user: publicUser(newUser),
    token
  });
};

export const login = async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "invalid email or password" });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).json({ message: "invalid email or password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
  return res.status(200).json({
    message: "User logged in successfully",
    user: publicUser(user),
    token
  });
};

export const forgetPassword = async (req, res) => {
  try {
    const { error } = emailValidation(req.body || {});
    if (error) return res.status(400).json({ message: error.details[0].message });

    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
      user.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
      const resetUrl = new URL("/reset-password", frontendUrl);
      resetUrl.searchParams.set("token", resetToken);

      sendEmail(
        user.email,
        "Reset your password",
        `Use this link to reset your password within 30 minutes:\n\n${resetUrl.toString()}`
      ).catch((emailError) => {
        console.error("Email send failed:", emailError.message);
      });
    }

    return res.status(200).json({ message: "If an account exists for that email, we sent a password reset link." });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(200).json({ message: "If an account exists for that email, we sent a password reset link." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (typeof token !== "string" || !token) {
      return res.status(400).json({ message: "A reset token is required" });
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpires: { $gt: new Date() }
    }).select("+resetTokenHash +resetTokenExpires");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
