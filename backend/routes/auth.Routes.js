import express from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
} from "../controller/auth.controller.js";

import {
  registerValidator,
  loginValidator,
} from "../validator/auth.validator.js";

import validationMiddleware from "../middleware/validaton.middleware.js";

const router = express.Router();

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },
});

router.post(
  "/register",
  registerRateLimit,
  registerValidator,
  validationMiddleware,
  register
);

router.post(
  "/login",
  loginRateLimit,
  loginValidator,
  validationMiddleware,
  login
);

export default router;