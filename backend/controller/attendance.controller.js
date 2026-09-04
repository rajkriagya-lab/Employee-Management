import prisma from "../db.js";

// =====================================================
// MARK ATTENDANCE
// =====================================================

export const markAttendance = async (req, res) => {
    try {
        const {
            employeeId,
            date,
            status,
            checkIn,
            checkOut,
            remarks,
        } = req.body;

        // Validate required fields
        if (!employeeId || !date || !status) {
            return res.status(400).json({
                success: false,
                message: "Employee, date and status are required",
            });
        }

        const employeeIdNumber = Number(employeeId);

        if (Number.isNaN(employeeIdNumber)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID",
            });
        }

        // Allowed attendance statuses
        const allowedStatuses = [
            "PRESENT",
            "ABSENT",
            "LATE",
            "HALF_DAY",
            "LEAVE",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance status",
            });
        }

        // Check employee
        const employee = await prisma.employee.findUnique({
            where: {
                id: employeeIdNumber,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isActive: true,
                    },
                },
            },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        if (!employee.user.isActive) {
            return res.status(400).json({
                success: false,
                message: "Employee account is inactive",
            });
        }

        // Check duplicate attendance
        const existingAttendance =
            await prisma.attendance.findFirst({
                where: {
                    employeeId: employeeIdNumber,
                    date: new Date(date),
                },
            });

        if (existingAttendance) {
            return res.status(409).json({
                success: false,
                message: "Attendance already marked for this date",
            });
        }

        // Create attendance
        const attendance = await prisma.attendance.create({
            data: {
                employeeId: employeeIdNumber,
                date: new Date(date),
                status,
                checkIn: checkIn ? new Date(checkIn) : null,
                checkOut: checkOut ? new Date(checkOut) : null,
                remarks: remarks?.trim() || null,
            },

            include: {
                employee: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        return res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            attendance,
        });
    } catch (error) {
        console.error("MARK ATTENDANCE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to mark attendance",
        });
    }
};


// =====================================================
// EMPLOYEE CHECK IN
// =====================================================

export const checkIn = async (req, res) => {
    try {
        const employeeId = req.user.employee?.id;

        if (!employeeId) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found",
            });
        }

        // Get today's date
        const now = new Date();

        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        // Check existing attendance
        const existingAttendance =
            await prisma.attendance.findFirst({
                where: {
                    employeeId,
                    date: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            });

        if (existingAttendance?.checkIn) {
            return res.status(400).json({
                success: false,
                message: "You have already checked in today",
            });
        }

        let attendance;

        if (existingAttendance) {
            attendance = await prisma.attendance.update({
                where: {
                    id: existingAttendance.id,
                },

                data: {
                    checkIn: now,
                    status: "PRESENT",
                },
            });
        } else {
            attendance = await prisma.attendance.create({
                data: {
                    employeeId,
                    date: startOfDay,
                    checkIn: now,
                    status: "PRESENT",
                },
            });
        }

        return res.status(200).json({
            success: true,
            message: "Check-in successful",
            attendance,
        });
    } catch (error) {
        console.error("CHECK IN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to check in",
        });
    }
};


// =====================================================
// EMPLOYEE CHECK OUT
// =====================================================

export const checkOut = async (req, res) => {
    try {
        const employeeId = req.user.employee?.id;

        if (!employeeId) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found",
            });
        }

        const now = new Date();

        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        // Find today's attendance
        const attendance =
            await prisma.attendance.findFirst({
                where: {
                    employeeId,
                    date: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            });

        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: "You have not checked in today",
            });
        }

        if (!attendance.checkIn) {
            return res.status(400).json({
                success: false,
                message: "Please check in first",
            });
        }

        if (attendance.checkOut) {
            return res.status(400).json({
                success: false,
                message: "You have already checked out",
            });
        }

        // Update checkout
        const updatedAttendance =
            await prisma.attendance.update({
                where: {
                    id: attendance.id,
                },

                data: {
                    checkOut: now,
                },
            });

        return res.status(200).json({
            success: true,
            message: "Check-out successful",
            attendance: updatedAttendance,
        });
    } catch (error) {
        console.error("CHECK OUT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to check out",
        });
    }
};


// =====================================================
// GET ALL ATTENDANCE
// =====================================================

export const getAllAttendance = async (req, res) => {
    try {
        const {
            date,
            status,
            employeeId,
        } = req.query;

        const where = {};

        // Filter by employee
        if (employeeId) {
            where.employeeId = Number(employeeId);
        }

        // Filter by status
        if (status) {
            where.status = status;
        }

        // Filter by date
        if (date) {
            const selectedDate = new Date(date);

            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            where.date = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }

        const attendance = await prisma.attendance.findMany({
            where,

            include: {
                employee: {
                    select: {
                        id: true,
                        position: true,

                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },

                        department: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },

            orderBy: {
                date: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            count: attendance.length,
            attendance,
        });
    } catch (error) {
        console.error("GET ALL ATTENDANCE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch attendance",
        });
    }
};


// =====================================================
// GET ATTENDANCE BY ID
// =====================================================

export const getAttendanceById = async (req, res) => {
    try {
        const attendanceId = Number(req.params.id);

        if (Number.isNaN(attendanceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance ID",
            });
        }

        const attendance =
            await prisma.attendance.findUnique({
                where: {
                    id: attendanceId,
                },

                include: {
                    employee: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },

                            department: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found",
            });
        }

        return res.status(200).json({
            success: true,
            attendance,
        });
    } catch (error) {
        console.error("GET ATTENDANCE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch attendance",
        });
    }
};


// =====================================================
// GET MY ATTENDANCE
// =====================================================

export const getMyAttendance = async (req, res) => {
    try {
        const employeeId = req.user.employee?.id;

        if (!employeeId) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found",
            });
        }

        const attendance =
            await prisma.attendance.findMany({
                where: {
                    employeeId,
                },

                orderBy: {
                    date: "desc",
                },
            });

        return res.status(200).json({
            success: true,
            count: attendance.length,
            attendance,
        });
    } catch (error) {
        console.error("GET MY ATTENDANCE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch your attendance",
        });
    }
};


// =====================================================
// GET EMPLOYEE ATTENDANCE
// =====================================================

export const getEmployeeAttendance = async (req, res) => {
    try {
        const employeeId = Number(req.params.employeeId);

        if (Number.isNaN(employeeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID",
            });
        }

        const employee = await prisma.employee.findUnique({
            where: {
                id: employeeId,
            },

            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        const attendance =
            await prisma.attendance.findMany({
                where: {
                    employeeId,
                },

                orderBy: {
                    date: "desc",
                },
            });

        return res.status(200).json({
            success: true,
            employee: employee.user,
            count: attendance.length,
            attendance,
        });
    } catch (error) {
        console.error(
            "GET EMPLOYEE ATTENDANCE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch employee attendance",
        });
    }
};


// =====================================================
// UPDATE ATTENDANCE
// =====================================================

export const updateAttendance = async (req, res) => {
    try {
        const attendanceId = Number(req.params.id);

        const {
            status,
            checkIn,
            checkOut,
            remarks,
            date,
        } = req.body;

        if (Number.isNaN(attendanceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance ID",
            });
        }

        const attendance =
            await prisma.attendance.findUnique({
                where: {
                    id: attendanceId,
                },
            });

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found",
            });
        }

        const allowedStatuses = [
            "PRESENT",
            "ABSENT",
            "LATE",
            "HALF_DAY",
            "LEAVE",
        ];

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance status",
            });
        }

        const updatedAttendance =
            await prisma.attendance.update({
                where: {
                    id: attendanceId,
                },

                data: {
                    ...(status && { status }),

                    ...(date && {
                        date: new Date(date),
                    }),

                    ...(checkIn !== undefined && {
                        checkIn: checkIn
                            ? new Date(checkIn)
                            : null,
                    }),

                    ...(checkOut !== undefined && {
                        checkOut: checkOut
                            ? new Date(checkOut)
                            : null,
                    }),

                    ...(remarks !== undefined && {
                        remarks: remarks?.trim() || null,
                    }),
                },

                include: {
                    employee: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });

        return res.status(200).json({
            success: true,
            message: "Attendance updated successfully",
            attendance: updatedAttendance,
        });
    } catch (error) {
        console.error("UPDATE ATTENDANCE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update attendance",
        });
    }
};


// =====================================================
// DELETE ATTENDANCE
// =====================================================

export const deleteAttendance = async (req, res) => {
    try {
        const attendanceId = Number(req.params.id);

        if (Number.isNaN(attendanceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance ID",
            });
        }

        const attendance =
            await prisma.attendance.findUnique({
                where: {
                    id: attendanceId,
                },
            });

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found",
            });
        }

        await prisma.attendance.delete({
            where: {
                id: attendanceId,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Attendance deleted successfully",
        });
    } catch (error) {
        console.error("DELETE ATTENDANCE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete attendance",
        });
    }
};


// =====================================================
// ATTENDANCE SUMMARY
// =====================================================

export const getAttendanceSummary = async (req, res) => {
    try {
        const { employeeId, month, year } = req.query;

        const where = {};

        if (employeeId) {
            where.employeeId = Number(employeeId);
        }

        // Filter by month/year
        if (month && year) {
            const startDate = new Date(
                Number(year),
                Number(month) - 1,
                1
            );

            const endDate = new Date(
                Number(year),
                Number(month),
                0,
                23,
                59,
                59,
                999
            );

            where.date = {
                gte: startDate,
                lte: endDate,
            };
        }

        const attendance =
            await prisma.attendance.findMany({
                where,
            });

        const summary = {
            total: attendance.length,
            present: 0,
            absent: 0,
            late: 0,
            halfDay: 0,
            leave: 0,
        };

        attendance.forEach((record) => {
            switch (record.status) {
                case "PRESENT":
                    summary.present++;
                    break;

                case "ABSENT":
                    summary.absent++;
                    break;

                case "LATE":
                    summary.late++;
                    break;

                case "HALF_DAY":
                    summary.halfDay++;
                    break;

                case "LEAVE":
                    summary.leave++;
                    break;
            }
        });

        return res.status(200).json({
            success: true,
            summary,
        });
    } catch (error) {
        console.error("ATTENDANCE SUMMARY ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate attendance summary",
        });
    }
};