import prisma from "../config/prisma.js";

// =====================================================
// CREATE PAYROLL
// =====================================================

export const createPayroll = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      year,
      basicSalary,
      allowances = 0,
      deductions = 0,
      overtime = 0,
      bonus = 0,
      tax = 0,
      remarks,
    } = req.body;

    // Validate required fields
    if (
      !employeeId ||
      !month ||
      !year ||
      basicSalary === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Employee, month, year and basic salary are required",
      });
    }

    const employeeIdNumber = Number(employeeId);
    const monthNumber = Number(month);
    const yearNumber = Number(year);

    if (Number.isNaN(employeeIdNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    if (
      Number.isNaN(monthNumber) ||
      monthNumber < 1 ||
      monthNumber > 12
    ) {
      return res.status(400).json({
        success: false,
        message: "Month must be between 1 and 12",
      });
    }

    if (
      Number.isNaN(yearNumber) ||
      yearNumber < 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid year",
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
          },
        },
        department: true,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Check duplicate payroll
    const existingPayroll =
      await prisma.payroll.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: employeeIdNumber,
            month: monthNumber,
            year: yearNumber,
          },
        },
      });

    if (existingPayroll) {
      return res.status(409).json({
        success: false,
        message:
          "Payroll already exists for this employee and month",
      });
    }

    // Convert numbers
    const salary = Number(basicSalary);
    const allowanceAmount = Number(allowances) || 0;
    const deductionAmount = Number(deductions) || 0;
    const overtimeAmount = Number(overtime) || 0;
    const bonusAmount = Number(bonus) || 0;
    const taxAmount = Number(tax) || 0;

    if (salary < 0) {
      return res.status(400).json({
        success: false,
        message: "Basic salary cannot be negative",
      });
    }

    // Calculate gross salary
    const grossSalary =
      salary +
      allowanceAmount +
      overtimeAmount +
      bonusAmount;

    // Calculate total deductions
    const totalDeductions =
      deductionAmount + taxAmount;

    // Calculate net salary
    const netSalary =
      grossSalary - totalDeductions;

    // Create payroll
    const payroll = await prisma.payroll.create({
      data: {
        employeeId: employeeIdNumber,
        month: monthNumber,
        year: yearNumber,
        basicSalary: salary,
        allowances: allowanceAmount,
        deductions: deductionAmount,
        overtime: overtimeAmount,
        bonus: bonusAmount,
        tax: taxAmount,
        grossSalary,
        netSalary,
        remarks: remarks?.trim() || null,
        createdBy: req.user.id,
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
            department: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Payroll created successfully",
      payroll,
    });
  } catch (error) {
    console.error("CREATE PAYROLL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payroll",
    });
  }
};


// =====================================================
// GET ALL PAYROLLS
// =====================================================

export const getAllPayrolls = async (req, res) => {
  try {
    const { month, year, employeeId } = req.query;

    const where = {};

    if (month) {
      const monthNumber = Number(month);

      if (
        Number.isNaN(monthNumber) ||
        monthNumber < 1 ||
        monthNumber > 12
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid month",
        });
      }

      where.month = monthNumber;
    }

    if (year) {
      const yearNumber = Number(year);

      if (Number.isNaN(yearNumber)) {
        return res.status(400).json({
          success: false,
          message: "Invalid year",
        });
      }

      where.year = yearNumber;
    }

    if (employeeId) {
      const employeeIdNumber = Number(employeeId);

      if (Number.isNaN(employeeIdNumber)) {
        return res.status(400).json({
          success: false,
          message: "Invalid employee ID",
        });
      }

      where.employeeId = employeeIdNumber;
    }

    const payrolls = await prisma.payroll.findMany({
      where,

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
            department: true,
          },
        },
      },

      orderBy: [
        {
          year: "desc",
        },
        {
          month: "desc",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: payrolls.length,
      payrolls,
    });
  } catch (error) {
    console.error("GET ALL PAYROLLS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payrolls",
    });
  }
};


// =====================================================
// GET MY PAYROLLS
// =====================================================

export const getMyPayrolls = async (req, res) => {
  try {
    // Find employee profile connected to logged-in user
    const employee = await prisma.employee.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    const payrolls = await prisma.payroll.findMany({
      where: {
        employeeId: employee.id,
      },

      orderBy: [
        {
          year: "desc",
        },
        {
          month: "desc",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: payrolls.length,
      payrolls,
    });
  } catch (error) {
    console.error("GET MY PAYROLLS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your payrolls",
    });
  }
};


// =====================================================
// GET PAYROLL BY ID
// =====================================================

export const getPayrollById = async (req, res) => {
  try {
    const payrollId = Number(req.params.id);

    if (Number.isNaN(payrollId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payroll ID",
      });
    }

    const payroll = await prisma.payroll.findUnique({
      where: {
        id: payrollId,
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
            department: true,
          },
        },
      },
    });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    // Employee can only view their own payroll
    if (
      req.user.role === "EMPLOYEE" &&
      payroll.employee.userId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view this payroll",
      });
    }

    return res.status(200).json({
      success: true,
      payroll,
    });
  } catch (error) {
    console.error("GET PAYROLL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payroll",
    });
  }
};


// =====================================================
// UPDATE PAYROLL
// =====================================================

export const updatePayroll = async (req, res) => {
  try {
    const payrollId = Number(req.params.id);

    if (Number.isNaN(payrollId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payroll ID",
      });
    }

    const existingPayroll =
      await prisma.payroll.findUnique({
        where: {
          id: payrollId,
        },
      });

    if (!existingPayroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    const {
      basicSalary,
      allowances,
      deductions,
      overtime,
      bonus,
      tax,
      remarks,
    } = req.body;

    // Keep existing values if not provided
    const salary =
      basicSalary !== undefined
        ? Number(basicSalary)
        : existingPayroll.basicSalary;

    const allowanceAmount =
      allowances !== undefined
        ? Number(allowances)
        : existingPayroll.allowances;

    const deductionAmount =
      deductions !== undefined
        ? Number(deductions)
        : existingPayroll.deductions;

    const overtimeAmount =
      overtime !== undefined
        ? Number(overtime)
        : existingPayroll.overtime;

    const bonusAmount =
      bonus !== undefined
        ? Number(bonus)
        : existingPayroll.bonus;

    const taxAmount =
      tax !== undefined
        ? Number(tax)
        : existingPayroll.tax;

    // Recalculate salary
    const grossSalary =
      salary +
      allowanceAmount +
      overtimeAmount +
      bonusAmount;

    const totalDeductions =
      deductionAmount + taxAmount;

    const netSalary =
      grossSalary - totalDeductions;

    const updatedPayroll =
      await prisma.payroll.update({
        where: {
          id: payrollId,
        },

        data: {
          basicSalary: salary,
          allowances: allowanceAmount,
          deductions: deductionAmount,
          overtime: overtimeAmount,
          bonus: bonusAmount,
          tax: taxAmount,
          grossSalary,
          netSalary,

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
              department: true,
            },
          },
        },
      });

    return res.status(200).json({
      success: true,
      message: "Payroll updated successfully",
      payroll: updatedPayroll,
    });
  } catch (error) {
    console.error("UPDATE PAYROLL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update payroll",
    });
  }
};


// =====================================================
// DELETE PAYROLL
// =====================================================

export const deletePayroll = async (req, res) => {
  try {
    const payrollId = Number(req.params.id);

    if (Number.isNaN(payrollId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payroll ID",
      });
    }

    const payroll = await prisma.payroll.findUnique({
      where: {
        id: payrollId,
      },
    });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found",
      });
    }

    await prisma.payroll.delete({
      where: {
        id: payrollId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Payroll deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PAYROLL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete payroll",
    });
  }
};