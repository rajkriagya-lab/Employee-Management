import bcrypt from "bcryptjs";
import prisma from "../db.js";

// =====================================================
// CREATE EMPLOYEE
// =====================================================

export const createEmployee = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            position,
            departmentId,
            joiningDate,
            salary,
        } = req.body;

        // Required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required",
            });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email.toLowerCase(),
            },
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        // Check department if provided
        if (departmentId) {
            const department = await prisma.department.findUnique({
                where: {
                    id: Number(departmentId),
                },
            });

            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found",
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user + employee together
        const employee = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: "EMPLOYEE",

                employee: {
                    create: {
                        phone: phone || null,
                        address: address || null,
                        position: position || null,
                        departmentId: departmentId
                            ? Number(departmentId)
                            : null,
                        joiningDate: joiningDate
                            ? new Date(joiningDate)
                            : null,
                        salary: salary ? Number(salary) : null,
                    },
                },
            },

            include: {
                employee: {
                    include: {
                        department: true,
                    },
                },
            },
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = employee;

        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            employee: userWithoutPassword,
        });

    } catch (error) {
        console.error("Create employee error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create employee",
        });
    }
};


// =====================================================
// GET ALL EMPLOYEES
// =====================================================

export const getEmployees = async (req, res) => {
    try {
        const employees = await prisma.user.findMany({
            where: {
                role: "EMPLOYEE",
            },

            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,

                employee: {
                    include: {
                        department: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            count: employees.length,
            employees,
        });

    } catch (error) {
        console.error("Get employees error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get employees",
        });
    }
};


// =====================================================
// GET EMPLOYEE BY ID
// =====================================================

export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await prisma.user.findFirst({
            where: {
                id: Number(id),
                role: "EMPLOYEE",
            },

            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,

                employee: {
                    include: {
                        department: true,
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

        return res.status(200).json({
            success: true,
            employee,
        });

    } catch (error) {
        console.error("Get employee error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get employee",
        });
    }
};


// =====================================================
// UPDATE EMPLOYEE
// =====================================================

export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            password,
            phone,
            address,
            position,
            departmentId,
            joiningDate,
            salary,
            isActive,
        } = req.body;

        // Find employee
        const existingEmployee = await prisma.user.findFirst({
            where: {
                id: Number(id),
                role: "EMPLOYEE",
            },

            include: {
                employee: true,
            },
        });

        if (!existingEmployee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        // Check email conflict
        if (email && email.toLowerCase() !== existingEmployee.email) {
            const emailExists = await prisma.user.findUnique({
                where: {
                    email: email.toLowerCase(),
                },
            });

            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message: "Email already in use",
                });
            }
        }

        // Check department
        if (departmentId) {
            const department = await prisma.department.findUnique({
                where: {
                    id: Number(departmentId),
                },
            });

            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found",
                });
            }
        }

        // Hash new password if provided
        let hashedPassword;

        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Update User
        const updatedEmployee = await prisma.user.update({
            where: {
                id: Number(id),
            },

            data: {
                ...(name && { name }),
                ...(email && {
                    email: email.toLowerCase(),
                }),
                ...(hashedPassword && {
                    password: hashedPassword,
                }),
                ...(typeof isActive === "boolean" && {
                    isActive,
                }),

                employee: {
                    update: {
                        ...(phone !== undefined && { phone }),
                        ...(address !== undefined && { address }),
                        ...(position !== undefined && { position }),

                        ...(departmentId !== undefined && {
                            departmentId: departmentId
                                ? Number(departmentId)
                                : null,
                        }),

                        ...(joiningDate !== undefined && {
                            joiningDate: joiningDate
                                ? new Date(joiningDate)
                                : null,
                        }),

                        ...(salary !== undefined && {
                            salary: salary ? Number(salary) : null,
                        }),
                    },
                },
            },

            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,

                employee: {
                    include: {
                        department: true,
                    },
                },
            },
        });

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            employee: updatedEmployee,
        });

    } catch (error) {
        console.error("Update employee error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update employee",
        });
    }
};


// =====================================================
// DELETE EMPLOYEE
// =====================================================

export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await prisma.user.findFirst({
            where: {
                id: Number(id),
                role: "EMPLOYEE",
            },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        await prisma.user.delete({
            where: {
                id: Number(id),
            },
        });

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
        });

    } catch (error) {
        console.error("Delete employee error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete employee",
        });
    }
};