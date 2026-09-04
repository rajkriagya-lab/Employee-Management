import prisma from "../db.js";

// =====================================================
// CREATE NOTIFICATION
// =====================================================

export const createNotification = async (req, res) => {
    try {
        const {
            userId,
            title,
            message,
            type,
            link,
        } = req.body;

        // Validate required fields
        if (!userId || !title || !message) {
            return res.status(400).json({
                success: false,
                message: "User, title and message are required",
            });
        }

        const userIdNumber = Number(userId);

        if (Number.isNaN(userIdNumber)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        // Check user
        const user = await prisma.user.findUnique({
            where: {
                id: userIdNumber,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Allowed notification types
        const allowedTypes = [
            "GENERAL",
            "TASK",
            "LEAVE",
            "ATTENDANCE",
            "NOTICE",
            "SYSTEM",
        ];

        const notificationType = type || "GENERAL";

        if (!allowedTypes.includes(notificationType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification type",
            });
        }

        // Create notification
        const notification =
            await prisma.notification.create({
                data: {
                    userId: userIdNumber,
                    title: title.trim(),
                    message: message.trim(),
                    type: notificationType,
                    link: link?.trim() || null,
                },
            });

        return res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification,
        });
    } catch (error) {
        console.error("CREATE NOTIFICATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create notification",
        });
    }
};


// =====================================================
// GET MY NOTIFICATIONS
// =====================================================

export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const notifications =
            await prisma.notification.findMany({
                where: {
                    userId,
                },

                orderBy: {
                    createdAt: "desc",
                },
            });

        return res.status(200).json({
            success: true,
            count: notifications.length,
            notifications,
        });
    } catch (error) {
        console.error(
            "GET MY NOTIFICATIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
};


// =====================================================
// GET UNREAD NOTIFICATIONS
// =====================================================

export const getUnreadNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const notifications =
            await prisma.notification.findMany({
                where: {
                    userId,
                    isRead: false,
                },

                orderBy: {
                    createdAt: "desc",
                },
            });

        return res.status(200).json({
            success: true,
            count: notifications.length,
            notifications,
        });
    } catch (error) {
        console.error(
            "GET UNREAD NOTIFICATIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch unread notifications",
        });
    }
};


// =====================================================
// GET UNREAD COUNT
// =====================================================

export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const count = await prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });

        return res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        console.error(
            "GET UNREAD COUNT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get unread notification count",
        });
    }
};


// =====================================================
// GET NOTIFICATION BY ID
// =====================================================

export const getNotificationById = async (req, res) => {
    try {
        const notificationId = Number(req.params.id);

        if (Number.isNaN(notificationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID",
            });
        }

        const notification =
            await prisma.notification.findUnique({
                where: {
                    id: notificationId,
                },
            });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        // User can only access their own notification
        if (notification.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to view this notification",
            });
        }

        return res.status(200).json({
            success: true,
            notification,
        });
    } catch (error) {
        console.error(
            "GET NOTIFICATION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notification",
        });
    }
};


// =====================================================
// MARK NOTIFICATION AS READ
// =====================================================

export const markAsRead = async (req, res) => {
    try {
        const notificationId = Number(req.params.id);

        if (Number.isNaN(notificationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID",
            });
        }

        const notification =
            await prisma.notification.findUnique({
                where: {
                    id: notificationId,
                },
            });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        // Make sure notification belongs to logged-in user
        if (notification.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to modify this notification",
            });
        }

        const updatedNotification =
            await prisma.notification.update({
                where: {
                    id: notificationId,
                },

                data: {
                    isRead: true,
                    readAt: new Date(),
                },
            });

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification: updatedNotification,
        });
    } catch (error) {
        console.error(
            "MARK NOTIFICATION READ ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
        });
    }
};


// =====================================================
// MARK ALL AS READ
// =====================================================

export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },

            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
            updatedCount: result.count,
        });
    } catch (error) {
        console.error(
            "MARK ALL NOTIFICATIONS READ ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to mark notifications as read",
        });
    }
};


// =====================================================
// DELETE NOTIFICATION
// =====================================================

export const deleteNotification = async (req, res) => {
    try {
        const notificationId = Number(req.params.id);

        if (Number.isNaN(notificationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID",
            });
        }

        const notification =
            await prisma.notification.findUnique({
                where: {
                    id: notificationId,
                },
            });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        // User can delete only their own notification
        if (notification.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to delete this notification",
            });
        }

        await prisma.notification.delete({
            where: {
                id: notificationId,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });
    } catch (error) {
        console.error(
            "DELETE NOTIFICATION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete notification",
        });
    }
};


// =====================================================
// DELETE ALL MY NOTIFICATIONS
// =====================================================

export const deleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await prisma.notification.deleteMany({
            where: {
                userId,
            },
        });

        return res.status(200).json({
            success: true,
            message: "All notifications deleted successfully",
            deletedCount: result.count,
        });
    } catch (error) {
        console.error(
            "DELETE ALL NOTIFICATIONS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete notifications",
        });
    }
};