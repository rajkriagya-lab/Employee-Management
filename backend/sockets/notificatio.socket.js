const onlineUsers = new Map();

export const setupNotifiactionSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on("user-online", (userId) => {
            if (!userId) return;

            const id = Number(userId);

            onlineUsers.set(id, socket.id);

            socket.userId = id;

            console.log(`user${id} is online`);
        });

        socket.on(
            "notification-read",
            (notificationId) => {
                console.log(
                    `Notification ${notificationId} read by user ${socket.userId}`
                );
            }
        );

        socket.on("disconnect", () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId);

                console.log(
                    `User ${socket.userId} disconnected`
                );
            }

            console.log(
                `Socket disconnected: ${socket.id}`
            );
        });
    });
};

/**
 * SEND NOTIFICATION TO ONE USER
 */

export const sendNotificationToUser = (
    io,
    userId,
    notification
) => {
    const socketId = onlineUsers.get(Number(userId));

    if (!socketId) {
        return false;
    }

    io.to(socketId).emit(
        "new-notification",
        notification
    );

    return true;
};

/**
 * SEND NOTIFICATION TO MULTIPLE USER
 */

export const sendNotificationToUsers = (
    io,
    userIds,
    notification    
) => {
    let sentCount = 0;

    userIds.forEach((userId) => {
        const send = sendNotificationToUser(
            io,
            userId,
            notification
        );

        if(send) {
            sentCount++;
        };
    });

    return sentCount;
};

/**
 * SEND NOTIFICATION TO ALL ONLINE USERS
 */

export const sendNotificationToAll = (
    io,
    notification
) => {
    io.emit(
        "new-notification",
        notification
    );
};

/**
 * GET ONLINE USER COUNT
 */

export const getOnlineUserCount = () => {
    return onlineUsers.size;
};

export const isUserOnline = (userId) => {
    return onlineUsers.has(Number(userId));
}