import prisma from "../db.js";

// =====================================================
// CREATE TASK
// =====================================================

export const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            employeeId,
            priority,
            dueDate,
        } = req.body;

        // Validate required fields
        if (!title || !employeeId) {
            return res.status(400).json({
                success: false,
                message: "Title and employee are required",
            });
        }

        const employeeIdNumber = Number(employeeId);

        if (Number.isNaN(employeeIdNumber)) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID",
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
                message: "Cannot assign task to an inactive employee",
            });
        }

        // Allowed priorities
        const allowedPriorities = [
            "LOW",
            "MEDIUM",
            "HIGH",
            "URGENT",
        ];

        const taskPriority = priority || "MEDIUM";

        if (!allowedPriorities.includes(taskPriority)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task priority",
            });
        }

        // Validate due date
        let parsedDueDate = null;

        if (dueDate) {
            parsedDueDate = new Date(dueDate);

            if (Number.isNaN(parsedDueDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid due date",
                });
            }
        }

        // Create task
        const task = await prisma.task.create({
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                employeeId: employeeIdNumber,
                assignedBy: req.user.id,
                priority: taskPriority,
                dueDate: parsedDueDate,
                status: "TODO",
            },

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
                    },
                },
            },
        });

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            task,
        });
    } catch (error) {
        console.error("CREATE TASK ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create task",
        });
    }
};


// =====================================================
// GET ALL TASKS
// =====================================================

export const getAllTasks = async (req, res) => {
    try {
        const {
            status,
            priority,
            employeeId,
        } = req.query;

        const where = {};

        // Filter status
        if (status) {
            const allowedStatuses = [
                "TODO",
                "IN_PROGRESS",
                "COMPLETED",
                "CANCELLED",
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid task status",
                });
            }

            where.status = status;
        }

        // Filter priority
        if (priority) {
            const allowedPriorities = [
                "LOW",
                "MEDIUM",
                "HIGH",
                "URGENT",
            ];

            if (!allowedPriorities.includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid task priority",
                });
            }

            where.priority = priority;
        }

        // Filter employee
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

        const tasks = await prisma.task.findMany({
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

                assignedByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },

            orderBy: [
                {
                    priority: "desc",
                },
                {
                    createdAt: "desc",
                },
            ],
        });

        return res.status(200).json({
            success: true,
            count: tasks.length,
            tasks,
        });
    } catch (error) {
        console.error("GET ALL TASKS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch tasks",
        });
    }
};


// =====================================================
// GET MY TASKS
// =====================================================

export const getMyTasks = async (req, res) => {
    try {
        const employeeId = req.user.employee?.id;

        if (!employeeId) {
            return res.status(404).json({
                success: false,
                message: "Employee profile not found",
            });
        }

        const {
            status,
            priority,
        } = req.query;

        const where = {
            employeeId,
        };

        if (status) {
            where.status = status;
        }

        if (priority) {
            where.priority = priority;
        }

        const tasks = await prisma.task.findMany({
            where,

            include: {
                assignedByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },

            orderBy: [
                {
                    dueDate: "asc",
                },
                {
                    createdAt: "desc",
                },
            ],
        });

        return res.status(200).json({
            success: true,
            count: tasks.length,
            tasks,
        });
    } catch (error) {
        console.error("GET MY TASKS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch your tasks",
        });
    }
};


// =====================================================
// GET TASK BY ID
// =====================================================

export const getTaskById = async (req, res) => {
    try {
        const taskId = Number(req.params.id);

        if (Number.isNaN(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID",
            });
        }

        const task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },

            include: {
                employee: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
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

                assignedByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        return res.status(200).json({
            success: true,
            task,
        });
    } catch (error) {
        console.error("GET TASK ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch task",
        });
    }
};


// =====================================================
// UPDATE TASK
// =====================================================

export const updateTask = async (req, res) => {
    try {
        const taskId = Number(req.params.id);

        const {
            title,
            description,
            employeeId,
            priority,
            dueDate,
        } = req.body;

        if (Number.isNaN(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID",
            });
        }

        const existingTask = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
        });

        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        // Validate priority
        const allowedPriorities = [
            "LOW",
            "MEDIUM",
            "HIGH",
            "URGENT",
        ];

        if (
            priority &&
            !allowedPriorities.includes(priority)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid task priority",
            });
        }

        // Validate employee
        let employeeIdNumber;

        if (employeeId !== undefined) {
            employeeIdNumber = Number(employeeId);

            if (Number.isNaN(employeeIdNumber)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid employee ID",
                });
            }

            const employee = await prisma.employee.findUnique({
                where: {
                    id: employeeIdNumber,
                },
            });

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found",
                });
            }
        }

        // Validate due date
        let parsedDueDate;

        if (dueDate !== undefined && dueDate !== null) {
            parsedDueDate = new Date(dueDate);

            if (Number.isNaN(parsedDueDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid due date",
                });
            }
        }

        const updatedTask = await prisma.task.update({
            where: {
                id: taskId,
            },

            data: {
                ...(title !== undefined && {
                    title: title.trim(),
                }),

                ...(description !== undefined && {
                    description: description?.trim() || null,
                }),

                ...(employeeId !== undefined && {
                    employeeId: employeeIdNumber,
                }),

                ...(priority !== undefined && {
                    priority,
                }),

                ...(dueDate !== undefined && {
                    dueDate: parsedDueDate || null,
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
            message: "Task updated successfully",
            task: updatedTask,
        });
    } catch (error) {
        console.error("UPDATE TASK ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update task",
        });
    }
};


// =====================================================
// UPDATE TASK STATUS
// =====================================================

export const updateTaskStatus = async (req, res) => {
    try {
        const taskId = Number(req.params.id);
        const { status } = req.body;

        if (Number.isNaN(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID",
            });
        }

        const allowedStatuses = [
            "TODO",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED",
        ];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task status",
            });
        }

        const task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        const updatedTask = await prisma.task.update({
            where: {
                id: taskId,
            },

            data: {
                status,

                ...(status === "COMPLETED" && {
                    completedAt: new Date(),
                }),

                ...(status !== "COMPLETED" && {
                    completedAt: null,
                }),
            },
        });

        return res.status(200).json({
            success: true,
            message: "Task status updated successfully",
            task: updatedTask,
        });
    } catch (error) {
        console.error("UPDATE TASK STATUS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update task status",
        });
    }
};


// =====================================================
// DELETE TASK
// =====================================================

export const deleteTask = async (req, res) => {
    try {
        const taskId = Number(req.params.id);

        if (Number.isNaN(taskId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid task ID",
            });
        }

        const task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        await prisma.task.delete({
            where: {
                id: taskId,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });
    } catch (error) {
        console.error("DELETE TASK ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete task",
        });
    }
};


// =====================================================
// TASK SUMMARY
// =====================================================

export const getTaskSummary = async (req, res) => {
    try {
        const { employeeId } = req.query;

        const where = {};

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

        const total = await prisma.task.count({
            where,
        });

        const todo = await prisma.task.count({
            where: {
                ...where,
                status: "TODO",
            },
        });

        const inProgress = await prisma.task.count({
            where: {
                ...where,
                status: "IN_PROGRESS",
            },
        });

        const completed = await prisma.task.count({
            where: {
                ...where,
                status: "COMPLETED",
            },
        });

        const cancelled = await prisma.task.count({
            where: {
                ...where,
                status: "CANCELLED",
            },
        });

        const overdue = await prisma.task.count({
            where: {
                ...where,

                dueDate: {
                    lt: new Date(),
                },

                status: {
                    notIn: ["COMPLETED", "CANCELLED"],
                },
            },
        });

        return res.status(200).json({
            success: true,

            summary: {
                total,
                todo,
                inProgress,
                completed,
                cancelled,
                overdue,
            },
        });
    } catch (error) {
        console.error("TASK SUMMARY ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate task summary",
        });
    }
};