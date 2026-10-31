import prisma from "../db.js"

export const createNotification = async ({
    userId,
    title,
    message,
    type = "GENERAL",
    link = null,
}) => {
    if (!userId || !title || !message) {
        throw new Error("userId, title, and message are required");
    }
    return await prisma.notification.create({
        data: {
            userId: Number(userId),
            title: title.trim(),
            message: message.trim(),
            type,
            link,
        },
    });
};

/**
 * notify User
 */

export const notifySingleUser = async ({
    userId,
    title,
    message,
    type = "GENERAL",
    link = null,
}) => {
    return await createNotification({
        userId,
        title,
        message,
        type,
        link,
    });
};

export const noitfyUser = notifySingleUser;

/**
 * NOTIFY MULTIPLE USER
 */


export const notifyUsers = async ({
    userIds,
    title,
    message,
    type = "GENERAL",
    link = null,
}) => {
    if (!Array.isArray(userIds)) {
        throw new Error("userIds must be an array");
    }

    if (userIds.length === 0) {
        return [];
    }

    if (!title || !message) {
        throw new Error("title and message are required");
    }

    const data = userIds.map((userId) => ({
        userId: Number(userId),
        title: title.trim(),
        message: message.trim(),
        type,
        link,
    }));

    await prisma.notification.createMany({
        data,
    });

    return data;
};

export const notifyUser = notifyUsers;

/**
 * NOTIFY ALL EMPLOYEE
 */

export const notifyAllEmployees = async ({
    title,
    message,
    type = "GENERAL",
    link = null,
}) => {
    const employees = await prisma.user.findMany({
        where: {
            role: "EMPLOYEE",
            isActive: true,
        },

        select: {
            id: true,
        },
    });

    if (employees.length === 0) {
        return {
            count: 0,
        };
    }

    await prisma.notification.createMany({
        data: employees.map((employee)=>({
            userId: employee.id,
            title,
            message,
            type,
            link,
        })),
    });

    return {
        count: employees.length,
    };
};

export const notifyAllEmpployee = notifyAllEmployees;

/**
 * GET UNREAD COUNT
 */

export const getUnreadNotification = async (userId) => {
      return await prisma.notification.count({
    where: {
      userId: Number(userId),
      isRead: false,
    },
  });
};


/**
 * MARK ONE AS READ
 */

export const markNotificationAsRead = async ({
  notificationId,
  userId,
}) => {
  const notification =
    await prisma.notification.findFirst({
      where: {
        id: Number(notificationId),
        userId: Number(userId),
      },
    });

  if (!notification) {
    throw new Error("Notification not found");
  }

  return await prisma.notification.update({
    where: {
      id: notification.id,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

/**
 * MARK ALL AS READ
 */

export const markAllNotificationsAsRead = async (
  userId
) => {
  return await prisma.notification.updateMany({
    where: {
      userId: Number(userId),
      isRead: false,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};