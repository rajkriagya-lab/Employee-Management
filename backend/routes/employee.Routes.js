import express from "express";

import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

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
  createEmployee
);

// Update employee
router.put(
  "/:id",
  protect,
  authorize("OWNER", "ADMIN"),
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