import bcrypt from "bcryptjs";
import prisma from "../db.js";

// =====================================================
// GET ALL USERS
// =====================================================

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,

        employee: {
          select: {
            id: true,
            phone: true,
            address: true,
            position: true,

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
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};


// =====================================================
// GET USER BY ID
// =====================================================

export const getUserById = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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
          select: {
            id: true,
            phone: true,
            address: true,
            position: true,
            joiningDate: true,
            salary: true,

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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};


// =====================================================
// UPDATE USER
// =====================================================

export const updateUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const { name, email, password } = req.body;

    // Find user
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check email
    if (email && email.toLowerCase() !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: {
          email: email.trim().toLowerCase(),
        },
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use",
        });
      }
    }

    // Prepare update data
    const updateData = {};

    if (name) {
      updateData.name = name.trim();
    }

    if (email) {
      updateData.email = email.trim().toLowerCase();
    }

    // Update password only if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },

      data: updateData,

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};


// =====================================================
// CHANGE USER ROLE
// =====================================================

export const changeUserRole = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const allowedRoles = [
      "OWNER",
      "ADMIN",
      "MANAGER",
      "EMPLOYEE",
    ];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Find target user
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent an owner from accidentally changing their own role
    if (req.user.id === userId && user.role === "OWNER") {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own owner role",
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        role,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("CHANGE ROLE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to change user role",
    });
  }
};


// =====================================================
// ACTIVATE / DEACTIVATE USER
// =====================================================

export const toggleUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't allow owner to deactivate themselves
    if (req.user.id === userId && user.role === "OWNER") {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate yourself",
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        isActive: !user.isActive,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: updatedUser.isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("TOGGLE USER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};


// =====================================================
// DELETE USER
// =====================================================

export const deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting yourself
    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Prevent deleting another owner
    if (user.role === "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Owner account cannot be deleted",
      });
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};


// =====================================================
// GET USER COUNT
// =====================================================

export const getUserCount = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();

    const employees = await prisma.user.count({
      where: {
        role: "EMPLOYEE",
      },
    });

    const managers = await prisma.user.count({
      where: {
        role: "MANAGER",
      },
    });

    const admins = await prisma.user.count({
      where: {
        role: "ADMIN",
      },
    });

    const owners = await prisma.user.count({
      where: {
        role: "OWNER",
      },
    });

    const activeUsers = await prisma.user.count({
      where: {
        isActive: true,
      },
    });

    const inactiveUsers = await prisma.user.count({
      where: {
        isActive: false,
      },
    });

    return res.status(200).json({
      success: true,
      counts: {
        totalUsers,
        employees,
        managers,
        admins,
        owners,
        activeUsers,
        inactiveUsers,
      },
    });
  } catch (error) {
    console.error("GET USER COUNT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get user count",
    });
  }
};