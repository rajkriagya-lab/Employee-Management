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