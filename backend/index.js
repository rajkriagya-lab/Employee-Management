import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

// Load environment variables
dotenv.config();


// =====================================================
// IMPORT ROUTES
// =====================================================

import authRoutes from "./routes/auth.Routes.js";
import userRoutes from "./routes/user.Routes.js";
import employeeRoutes from "./routes/employee.Routes.js";
import departmentRoutes from "./routes/department.Routes.js";
import attendanceRoutes from "./routes/attendance.Routes.js";
import leaveRoutes from "./routes/leave.Routes.js";
import taskRoutes from "./routes/task.Routes.js";
import noticeRoutes from "./routes/notice.Routes.js";
import notificationRoutes from "./routes/notification.Routes.js";
import payrollRoutes from "./routes/payroll.Routes.js";
import dashboardRoutes from "./routes/dashboard.Routes.js";
import notfoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";
import { setupNotifiactionSocket } from "./sockets/notificatio.socket.js";


// =====================================================
// APP
// =====================================================

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BizFlow API is running 🚀",
  });
});


// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/employees", employeeRoutes);

app.use("/api/departments", departmentRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/leaves", leaveRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/notices", noticeRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/payroll", payrollRoutes);

app.use("/api/dashboard", dashboardRoutes);

// =====================================================
// Socket.IO
// =====================================================

setupNotifiactionSocket(io);

// =====================================================
// 404 ROUTE
// =====================================================

app.use(notfoundMiddleware);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(errorMiddleware)


// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log("=================================");
  console.log("BizFlow Backend Started");
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log("=================================");
});