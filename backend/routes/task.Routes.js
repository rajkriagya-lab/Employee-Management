import express from "express";

import {
    createTask,
    getAllTasks,
    getMyTasks,
    getTaskById,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTaskSummary,
} from "../controller/task.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();


// =====================================================
// EMPLOYEE
// =====================================================

// Employee's own tasks
router.get(
    "/my",
    protect,
    authorize("EMPLOYEE"),
    getMyTasks
);

// Employee can update task status
router.patch(
    "/:id/status",
    protect,
    authorize("EMPLOYEE", "MANAGER", "ADMIN", "OWNER"),
    updateTaskStatus
);


// =====================================================
// MANAGEMENT
// =====================================================

// Get all tasks
router.get(
    "/",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    getAllTasks
);

// Task summary
router.get(
    "/summary",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    getTaskSummary
);

// Get task by ID
router.get(
    "/:id",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER", "EMPLOYEE"),
    getTaskById
);

// Create task
router.post(
    "/",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    createTask
);

// Update task
router.put(
    "/:id",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    updateTask
);

// Delete task
router.delete(
    "/:id",
    protect,
    authorize("OWNER", "ADMIN"),
    deleteTask
);

export default router;