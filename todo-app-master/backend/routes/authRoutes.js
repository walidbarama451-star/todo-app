import express from 'express';
import rateLimit from "express-rate-limit";
import { register, login, resetPassword, forgetPassword } from '../controllers/authContol.js';

const router = express.Router();

const makeLimiter = (windowMs, limit, extra = {}) =>
  rateLimit({
    windowMs,
    limit,
    message: { message: "Too many attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    ...extra,
  });

const loginLimiter = makeLimiter(15 * 60 * 1000, 10, { skipSuccessfulRequests: true });
const registerLimiter = makeLimiter(60 * 60 * 1000, 20);
const forgotLimiter = makeLimiter(60 * 60 * 1000, 5);
const resetLimiter = makeLimiter(60 * 60 * 1000, 10);

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post("/forgot-password", forgotLimiter, forgetPassword);
router.post("/reset-password", resetLimiter, resetPassword);

export default router;
