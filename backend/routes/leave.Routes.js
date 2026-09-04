import express from "express";

import {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    getLeaveById,
    approveLeave,
    rejectLeave,
    cancelLeave,
    updateLeave,
    deleteLeave,
} from "../controller/leave.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();


// =====================================================
// EMPLOYEE
// =====================================================

// Apply for leave
router.post(
    "/",
    protect,
    authorize("EMPLOYEE"),
    applyLeave
);

// View own leaves
router.get(
    "/my",
    protect,
    authorize("EMPLOYEE"),
    getMyLeaves
);

// Update own pending leave
router.put(
    "/:id",
    protect,
    authorize("EMPLOYEE"),
    updateLeave
);

// Cancel own leave
router.patch(
    "/:id/cancel",
    protect,
    authorize("EMPLOYEE"),
    cancelLeave
);


// =====================================================
// MANAGEMENT
// =====================================================

// Get all leave requests
router.get(
    "/",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    getAllLeaves
);

// Get leave by ID
router.get(
    "/:id",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    getLeaveById
);

// Approve leave
router.patch(
    "/:id/approve",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    approveLeave
);

// Reject leave
router.patch(
    "/:id/reject",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    rejectLeave
);

// Delete leave
router.delete(
    "/:id",
    protect,
    authorize("OWNER", "ADMIN"),
    deleteLeave
);

export default router;