import jwt from "jsonwebtoken";
import prisma from "../db.js";

const onlineUsers = new Map();

export const setupNotifiactionSocket = (io) => {
    io.use(async (socket, next) => {
        const header = socket.handshake.headers.authorization;
        const authorizationToken =
            typeof header === "string" && header.match(/^Bearer\s+(.+)$/i)?.[1];
        const token = socket.handshake.auth?.token || authorizationToken;

        if (typeof token !== "string" || !token) {
            return next(new Error("Authentication required"));
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            return next(new Error("Invalid or expired token"));
        }

        if (
            !decoded ||
            typeof decoded !== "object" ||
            !Number.isInteger(decoded.id)
        ) {
            return next(new Error("Invalid or expired token"));
        }

        try {
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, isActive: true },
            });

            if (!user || !user.isActive) {
                return next(new Error("Account is unavailable"));
            }

            socket.data.userId = user.id;
            return next();
        } catch (error) {
            console.error("Socket authentication failed:", error);
            return next(new Error("Unable to authenticate"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.data.userId;
        const userSockets = onlineUsers.get(userId) || new Set();
        userSockets.add(socket.id);
        onlineUsers.set(userId, userSockets);

        socket.join(`user:${userId}`);

        socket.on("disconnect", () => {
            const sockets = onlineUsers.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    onlineUsers.delete(userId);
                }
            }
        });
    });
};


export const sendNotificationToUser = (
    io,
    userId,
    notification
) => {
    const sockets = onlineUsers.get(Number(userId));

    if (!sockets?.size) {
        return false;
    }

    io.to(`user:${Number(userId)}`).emit(
        "new-notification",
        notification
    );

    return true;
};


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


export const sendNotificationToAll = (
    io,
    notification
) => {
    io.emit(
        "new-notification",
        notification
    );
};


export const getOnlineUserCount = () => {
    return onlineUsers.size;
};

export const isUserOnline = (userId) => {
    return onlineUsers.has(Number(userId));
}