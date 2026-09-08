import express from "express";

import {
    markAttendance,
    checkIn,
    checkOut,
    getAllAttendance,
    getAttendanceById,
    getMyAttendance,
    getEmployeeAttendance,
    updateAttendance,
    deleteAttendance,
    getAttendanceSummary,
} from "../controller/attendance.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();


// =====================================================
// EMPLOYEE
// =====================================================

// Employee check-in
router.post(
    "/check-in",
    protect,
    authorize("EMPLOYEE"),
    checkIn
);

// Employee check-out
router.post(
    "/check-out",
    protect,
    authorize("EMPLOYEE"),
    checkOut
);

// Employee's own attendance
router.get(
    "/my",
    protect,
    authorize("EMPLOYEE"),
    getMyAttendance
);


// =====================================================
// ADMIN / OWNER / MANAGER
// =====================================================

// Get all attendance
router.get(
    "/",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    getAllAttendance
);

// Attendance summary
router.get(
    "/summary",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    getAttendanceSummary
);

// Get attendance of employee
router.get(
    "/employee/:employeeId",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    getEmployeeAttendance
);

// Get attendance by ID
router.get(
    "/:id",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    getAttendanceById
);

// Mark attendance manually
router.post(
    "/",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    markAttendance
);

// Update attendance
router.put(
    "/:id",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    updateAttendance
);

// Delete attendance
router.delete(
    "/:id",
    protect,
    authorize("OWNER", "ADMIN"),
    deleteAttendance
);

export default router;