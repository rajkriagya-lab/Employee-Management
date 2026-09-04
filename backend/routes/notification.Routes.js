import express from "express";

import {
    createNotification,
    getMyNotifications,
    getUnreadNotifications,
    getUnreadCount,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
} from "../controller/notification.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();


// =====================================================
// USER NOTIFICATIONS
// =====================================================

// Get my notifications
router.get(
    "/",
    protect,
    getMyNotifications
);

// Get unread notifications
router.get(
    "/unread",
    protect,
    getUnreadNotifications
);

// Get unread count
router.get(
    "/unread/count",
    protect,
    getUnreadCount
);

// Get notification by ID
router.get(
    "/:id",
    protect,
    getNotificationById
);

// Mark one as read
router.patch(
    "/:id/read",
    protect,
    markAsRead
);

// Mark all as read
router.patch(
    "/read-all",
    protect,
    markAllAsRead
);

// Delete one
router.delete(
    "/:id",
    protect,
    deleteNotification
);

// Delete all
router.delete(
    "/",
    protect,
    deleteAllNotifications
);


// =====================================================
// MANAGEMENT
// =====================================================

// Create notification manually
router.post(
    "/",
    protect,
    authorize("OWNER", "ADMIN", "MANAGER"),
    createNotification
);

export default router;