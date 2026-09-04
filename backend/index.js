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

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notfoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";
import { setupNotifiactionSocket } from "./sockets/notificatio.socket.js";


// =====================================================
// APP
// =====================================================

const app = express();


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

app.listen(PORT, () => {
  console.log("=================================");
  console.log("BizFlow Backend Started");
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log("=================================");
});