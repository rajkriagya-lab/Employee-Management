import express from "express";

import {
  createNotice,
  getAllNotices,
  getActiveNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
} from "../controller/notice.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();


// =====================================================
// ALL AUTHENTICATED USERS
// =====================================================

// Get active notices
router.get(
  "/active",
  protect,
  getActiveNotices
);

// Get all notices
router.get(
  "/",
  protect,
  getAllNotices
);

// Get notice by ID
router.get(
  "/:id",
  protect,
  getNoticeById
);


// =====================================================
// MANAGEMENT
// =====================================================

// Create notice
router.post(
  "/",
  protect,
  authorize("OWNER", "ADMIN", "MANAGER"),
  createNotice
);

// Update notice
router.put(
  "/:id",
  protect,
  authorize("OWNER", "ADMIN", "MANAGER"),
  updateNotice
);

// Delete notice
router.delete(
  "/:id",
  protect,
  authorize("OWNER", "ADMIN"),
  deleteNotice
);

export default router;