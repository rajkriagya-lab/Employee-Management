import express from "express";

import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controller/employee.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import validationMiddleware from "../middleware/validaton.middleware.js";
import {
  createEmployeeValidator,
  updateEmployeeValidator,
} from "../validator/employee.validayor.js";

const router = express.Router();

// Get all employees
router.get(
  "/",
  protect,
  authorize("OWNER", "ADMIN", "MANAGER"),
  getEmployees
);

// Get employee by ID
router.get(
  "/:id",
  protect,
  authorize("OWNER", "ADMIN", "MANAGER"),
  getEmployeeById
);

// Create employee
router.post(
  "/",
  protect,
  authorize("OWNER", "ADMIN"),
  createEmployeeValidator,
  validationMiddleware,
  createEmployee
);

// Update employee
router.put(
  "/:id",
  protect,
  authorize("OWNER", "ADMIN"),
  updateEmployeeValidator,
  validationMiddleware,
  updateEmployee
);

// Delete employee
router.delete(
  "/:id",
  protect,
  authorize("OWNER", "ADMIN"),
  deleteEmployee
);

export default router;