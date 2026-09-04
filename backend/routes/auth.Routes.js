import express from "express";

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

router.post(
  "/register",
  registerValidator,
  validationMiddleware,
  register
);

router.post(
  "/login",
  loginValidator,
  validationMiddleware,
  login
);

export default router;