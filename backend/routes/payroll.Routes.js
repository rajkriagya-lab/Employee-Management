import express from "express";

import {
  createPayroll,
  getAllPayrolls,
  getMyPayrolls,
  getPayrollById,
  updatePayroll,
  deletePayroll,
} from "../controller/payroll.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();


// Employee
router.get(
  "/my",
  protect,
  getMyPayrolls
);


// Management
router.get(
  "/",
  protect,
  authorize("OWNER", "ADMIN", "MANAGER"),
  getAllPayrolls
);

router.post(
  "/",
  protect,
  authorize("OWNER", "ADMIN", "MANAGER"),
  createPayroll
);

router.get(
  "/:id",
  protect,
  getPayrollById
);

router.put(
  "/:id",
  protect,
  authorize("OWNER", "ADMIN", "MANAGER"),
  updatePayroll
);

router.delete(
  "/:id",
  protect,
  authorize("OWNER", "ADMIN"),
  deletePayroll
);

export default router;