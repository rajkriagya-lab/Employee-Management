import express from "express";

import {
  getAdminDashboard,
  getEmployeeDashboard,
} from "../controller/dashboard.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();


// =====================================================
// ADMIN / OWNER / MANAGER DASHBOARD
// =====================================================

router.get(
  "/admin",
  protect,
  authorize("OWNER", "ADMIN", "MANAGER"),
  getAdminDashboard
);


// =====================================================
// EMPLOYEE DASHBOARD
// =====================================================

router.get(
  "/employee",
  protect,
  authorize("EMPLOYEE"),
  getEmployeeDashboard
);


export default router;