import express from 'express';
import rateLimit from "express-rate-limit";
import { register, login, resetPassword, forgetPassword } from '../controllers/authContol.js';

const router = express.Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per window
  message: { message: "Too many attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post("/forgot-password", authRateLimiter, forgetPassword);
router.post("/reset-password", resetPassword);

export default router;
