import prisma from "../db.js";

// =====================================================
// CREATE DEPARTMENT
// =====================================================

export const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validate
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Department name is required",
            });
        }

        const departmentName = name.trim();

        // Check duplicate department
        const existingDepartment = await prisma.department.findUnique({
            where: {
                name: departmentName,
            },
        });

        if (existingDepartment) {
            return res.status(409).json({
                success: false,
                message: "Department already exists",
            });
        }

        // Create department
        const department = await prisma.department.create({
            data: {
                name: departmentName,
                description: description?.trim() || null,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            department,
        });
    } catch (error) {
        console.error("CREATE DEPARTMENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create department",
        });
    }
};


// =====================================================
// GET ALL DEPARTMENTS
// =====================================================

export const getDepartments = async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            include: {
                _count: {
                    select: {
                        employees: true,
                    },
                },
            },

            orderBy: {
                name: "asc",
            },
        });

        return res.status(200).json({
            success: true,
            count: departments.length,
            departments,
        });
    } catch (error) {
        console.error("GET DEPARTMENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch departments",
        });
    }
};


// =====================================================
// GET DEPARTMENT BY ID
// =====================================================

export const getDepartmentById = async (req, res) => {
    try {
        const departmentId = Number(req.params.id);

        if (Number.isNaN(departmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID",
            });
        }

        const department = await prisma.department.findUnique({
            where: {
                id: departmentId,
            },

            include: {
                employees: {
                    select: {
                        id: true,
                        phone: true,
                        position: true,
                        joiningDate: true,
                        salary: true,

                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                isActive: true,
                            },
                        },
                    },

                    orderBy: {
                        joiningDate: "asc",
                    },
                },

                _count: {
                    select: {
                        employees: true,
                    },
                },
            },
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        return res.status(200).json({
            success: true,
            department,
        });
    } catch (error) {
        console.error("GET DEPARTMENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch department",
        });
    }
};


// =====================================================
// UPDATE DEPARTMENT
// =====================================================

export const updateDepartment = async (req, res) => {
    try {
        const departmentId = Number(req.params.id);

        const { name, description } = req.body;

        if (Number.isNaN(departmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID",
            });
        }

        // Find department
        const existingDepartment = await prisma.department.findUnique({
            where: {
                id: departmentId,
            },
        });

        if (!existingDepartment) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        // Check duplicate name
        if (name) {
            const departmentName = name.trim();

            const duplicateDepartment =
                await prisma.department.findFirst({
                    where: {
                        name: departmentName,
                        NOT: {
                            id: departmentId,
                        },
                    },
                });

            if (duplicateDepartment) {
                return res.status(409).json({
                    success: false,
                    message: "Another department already has this name",
                });
            }
        }

        const updatedDepartment =
            await prisma.department.update({
                where: {
                    id: departmentId,
                },

                data: {
                    ...(name !== undefined && {
                        name: name.trim(),
                    }),

                    ...(description !== undefined && {
                        description: description?.trim() || null,
                    }),
                },
            });

        return res.status(200).json({
            success: true,
            message: "Department updated successfully",
            department: updatedDepartment,
        });
    } catch (error) {
        console.error("UPDATE DEPARTMENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update department",
        });
    }
};


// =====================================================
// DELETE DEPARTMENT
// =====================================================

export const deleteDepartment = async (req, res) => {
    try {
        const departmentId = Number(req.params.id);

        if (Number.isNaN(departmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID",
            });
        }

        // Find department
        const department = await prisma.department.findUnique({
            where: {
                id: departmentId,
            },

            include: {
                _count: {
                    select: {
                        employees: true,
                    },
                },
            },
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        // Don't delete department with employees
        if (department._count.employees > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot delete department because employees are assigned to it",
            });
        }

        await prisma.department.delete({
            where: {
                id: departmentId,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Department deleted successfully",
        });
    } catch (error) {
        console.error("DELETE DEPARTMENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete department",
        });
    }
};


// =====================================================
// GET DEPARTMENT EMPLOYEES
// =====================================================

export const getDepartmentEmployees = async (req, res) => {
    try {
        const departmentId = Number(req.params.id);

        if (Number.isNaN(departmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID",
            });
        }

        // Check department
        const department = await prisma.department.findUnique({
            where: {
                id: departmentId,
            },
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        const employees = await prisma.employee.findMany({
            where: {
                departmentId,
            },

            select: {
                id: true,
                phone: true,
                address: true,
                position: true,
                joiningDate: true,
                salary: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },
                },
            },

            orderBy: {
                joiningDate: "asc",
            },
        });

        return res.status(200).json({
            success: true,
            department: {
                id: department.id,
                name: department.name,
            },
            count: employees.length,
            employees,
        });
    } catch (error) {
        console.error(
            "GET DEPARTMENT EMPLOYEES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch department employees",
        });
    }
};