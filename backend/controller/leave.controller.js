import prisma from "../db.js";

// =====================================================
// APPLY FOR LEAVE
// =====================================================

export const applyLeave = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            leaveType,
            reason,
        } = req.body;

        // Get logged-in employee
        const employeeId = req.user.employee?.id;

        if (!employeeId) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found",
            });
        }

        // Validate required fields
        if (!startDate || !endDate || !leaveType) {
            return res.status(400).json({
                success: false,
                message:
                    "Start date, end date and leave type are required",
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date",
            });
        }

        // Make sure end date isn't before start date
        if (end < start) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date",
            });
        }

        // Allowed leave types
        const allowedLeaveTypes = [
            "CASUAL",
            "SICK",
            "ANNUAL",
            "MATERNITY",
            "PATERNITY",
            "UNPAID",
            "OTHER",
        ];

        if (!allowedLeaveTypes.includes(leaveType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave type",
            });
        }

        // Check overlapping leave requests
        const overlappingLeave =
            await prisma.leave.findFirst({
                where: {
                    employeeId,

                    startDate: {
                        lte: end,
                    },

                    endDate: {
                        gte: start,
                    },

                    status: {
                        in: ["PENDING", "APPROVED"],
                    },
                },
            });

        if (overlappingLeave) {
            return res.status(409).json({
                success: false,
                message:
                    "You already have a leave request for these dates",
            });
        }

        // Create leave
        const leave = await prisma.leave.create({
            data: {
                employeeId,
                startDate: start,
                endDate: end,
                leaveType,
                reason: reason?.trim() || null,
                status: "PENDING",
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
            message: "Leave application submitted successfully",
            leave,
        });
    } catch (error) {
        console.error("APPLY LEAVE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to apply for leave",
        });
    }
};


// =====================================================
// GET MY LEAVES
// =====================================================

export const getMyLeaves = async (req, res) => {
    try {
        const employeeId = req.user.employee?.id;

        if (!employeeId) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found",
            });
        }

        const leaves = await prisma.leave.findMany({
            where: {
                employeeId,
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            count: leaves.length,
            leaves,
        });
    } catch (error) {
        console.error("GET MY LEAVES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch your leaves",
        });
    }
};


// =====================================================
// GET ALL LEAVES
// =====================================================

export const getAllLeaves = async (req, res) => {
    try {
        const {
            status,
            leaveType,
            employeeId,
        } = req.query;

        const where = {};

        // Filter by status
        if (status) {
            const allowedStatuses = [
                "PENDING",
                "APPROVED",
                "REJECTED",
                "CANCELLED",
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid leave status",
                });
            }

            where.status = status;
        }

        // Filter by leave type
        if (leaveType) {
            where.leaveType = leaveType;
        }

        // Filter by employee
        if (employeeId) {
            const id = Number(employeeId);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid employee ID",
                });
            }

            where.employeeId = id;
        }

        const leaves = await prisma.leave.findMany({
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
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            count: leaves.length,
            leaves,
        });
    } catch (error) {
        console.error("GET ALL LEAVES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch leaves",
        });
    }
};


// =====================================================
// GET LEAVE BY ID
// =====================================================

export const getLeaveById = async (req, res) => {
    try {
        const leaveId = Number(req.params.id);

        if (Number.isNaN(leaveId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave ID",
            });
        }

        const leave = await prisma.leave.findUnique({
            where: {
                id: leaveId,
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

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found",
            });
        }

        return res.status(200).json({
            success: true,
            leave,
        });
    } catch (error) {
        console.error("GET LEAVE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch leave",
        });
    }
};


// =====================================================
// APPROVE LEAVE
// =====================================================

export const approveLeave = async (req, res) => {
    try {
        const leaveId = Number(req.params.id);

        if (Number.isNaN(leaveId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave ID",
            });
        }

        const leave = await prisma.leave.findUnique({
            where: {
                id: leaveId,
            },
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found",
            });
        }

        // Only pending leave can be approved
        if (leave.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message:
                    "Only pending leave requests can be approved",
            });
        }

        const updatedLeave = await prisma.leave.update({
            where: {
                id: leaveId,
            },

            data: {
                status: "APPROVED",
                reviewedBy: req.user.id,
                reviewedAt: new Date(),
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
            message: "Leave approved successfully",
            leave: updatedLeave,
        });
    } catch (error) {
        console.error("APPROVE LEAVE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to approve leave",
        });
    }
};


// =====================================================
// REJECT LEAVE
// =====================================================

export const rejectLeave = async (req, res) => {
    try {
        const leaveId = Number(req.params.id);

        const { rejectionReason } = req.body;

        if (Number.isNaN(leaveId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave ID",
            });
        }

        const leave = await prisma.leave.findUnique({
            where: {
                id: leaveId,
            },
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found",
            });
        }

        if (leave.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message:
                    "Only pending leave requests can be rejected",
            });
        }

        const updatedLeave = await prisma.leave.update({
            where: {
                id: leaveId,
            },

            data: {
                status: "REJECTED",
                reviewedBy: req.user.id,
                reviewedAt: new Date(),
                rejectionReason:
                    rejectionReason?.trim() || null,
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
            message: "Leave rejected successfully",
            leave: updatedLeave,
        });
    } catch (error) {
        console.error("REJECT LEAVE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reject leave",
        });
    }
};


// =====================================================
// CANCEL LEAVE
// =====================================================

export const cancelLeave = async (req, res) => {
    try {
        const leaveId = Number(req.params.id);

        if (Number.isNaN(leaveId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave ID",
            });
        }

        const employeeId = req.user.employee?.id;

        const leave = await prisma.leave.findUnique({
            where: {
                id: leaveId,
            },
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found",
            });
        }

        // Employee can cancel only their own leave
        if (leave.employeeId !== employeeId) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only cancel your own leave request",
            });
        }

        // Don't cancel rejected/cancelled leave
        if (
            leave.status === "REJECTED" ||
            leave.status === "CANCELLED"
        ) {
            return res.status(400).json({
                success: false,
                message: "This leave cannot be cancelled",
            });
        }

        const updatedLeave = await prisma.leave.update({
            where: {
                id: leaveId,
            },

            data: {
                status: "CANCELLED",
            },
        });

        return res.status(200).json({
            success: true,
            message: "Leave cancelled successfully",
            leave: updatedLeave,
        });
    } catch (error) {
        console.error("CANCEL LEAVE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to cancel leave",
        });
    }
};


// =====================================================
// UPDATE LEAVE
// =====================================================

export const updateLeave = async (req, res) => {
    try {
        const leaveId = Number(req.params.id);

        const {
            startDate,
            endDate,
            leaveType,
            reason,
        } = req.body;

        if (Number.isNaN(leaveId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave ID",
            });
        }

        const leave = await prisma.leave.findUnique({
            where: {
                id: leaveId,
            },
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found",
            });
        }

        // Only pending leave can be edited
        if (leave.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message:
                    "Only pending leave requests can be updated",
            });
        }

        let start = leave.startDate;
        let end = leave.endDate;

        if (startDate) {
            start = new Date(startDate);
        }

        if (endDate) {
            end = new Date(endDate);
        }

        if (end < start) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date",
            });
        }

        const allowedLeaveTypes = [
            "CASUAL",
            "SICK",
            "ANNUAL",
            "MATERNITY",
            "PATERNITY",
            "UNPAID",
            "OTHER",
        ];

        if (
            leaveType &&
            !allowedLeaveTypes.includes(leaveType)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave type",
            });
        }

        const updatedLeave = await prisma.leave.update({
            where: {
                id: leaveId,
            },

            data: {
                ...(startDate && {
                    startDate: start,
                }),

                ...(endDate && {
                    endDate: end,
                }),

                ...(leaveType && {
                    leaveType,
                }),

                ...(reason !== undefined && {
                    reason: reason?.trim() || null,
                }),
            },
        });

        return res.status(200).json({
            success: true,
            message: "Leave updated successfully",
            leave: updatedLeave,
        });
    } catch (error) {
        console.error("UPDATE LEAVE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update leave",
        });
    }
};


// =====================================================
// DELETE LEAVE
// =====================================================

export const deleteLeave = async (req, res) => {
    try {
        const leaveId = Number(req.params.id);

        if (Number.isNaN(leaveId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid leave ID",
            });
        }

        const leave = await prisma.leave.findUnique({
            where: {
                id: leaveId,
            },
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found",
            });
        }

        await prisma.leave.delete({
            where: {
                id: leaveId,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Leave deleted successfully",
        });
    } catch (error) {
        console.error("DELETE LEAVE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete leave",
        });
    }
};