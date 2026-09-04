import express from "express";

import {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    getDepartmentEmployees,
} from "../controller/department.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();


// =====================================================
// DEPARTMENTS
// =====================================================

// Get all departments
router.get(
    "/",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    getDepartments
);


// Get department by ID
router.get(
    "/:id",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    getDepartmentById
);


// Get employees of department
router.get(
    "/:id/employees",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    getDepartmentEmployees
);


// Create department
router.post(
    "/",
    protect,
    authorize("OWNER", "ADMIN"),
    createDepartment
);


// Update department
router.put(
    "/:id",
    protect,
    authorize("OWNER", "ADMIN"),
    updateDepartment
);


// Delete department
router.delete(
    "/:id",
    protect,
    authorize("OWNER", "ADMIN"),
    deleteDepartment
);

export default router;