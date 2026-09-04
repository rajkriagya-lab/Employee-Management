import express from "express";

import {
    getAllUsers,
    getUserById,
    updateUser,
    changeUserRole,
    toggleUserStatus,
    deleteUser,
    getUserCount,
} from "../controller/users.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();


// Get all users
router.get(
    "/",
    protect,
    authorize("OWNER", "ADMIN"),
    getAllUsers
);


// Get user count
router.get(
    "/count",
    protect,
    authorize("OWNER", "ADMIN"),
    getUserCount
);


// Get single user
router.get(
    "/:id",
    protect,
    authorize("OWNER", "ADMIN"),
    getUserById
);


// Update user
router.put(
    "/:id",
    protect,
    authorize("OWNER", "ADMIN"),
    updateUser
);


// Change role
router.patch(
    "/:id/role",
    protect,
    authorize("OWNER"),
    changeUserRole
);


// Activate / deactivate
router.patch(
    "/:id/status",
    protect,
    authorize("OWNER", "ADMIN"),
    toggleUserStatus
);


// Delete user
router.delete(
    "/:id",
    protect,
    authorize("OWNER", "ADMIN"),
    deleteUser
);

export default router;