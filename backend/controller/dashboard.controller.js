import {
  getAdminDashboardData,
  getEmployeeDashboardData,
} from "../services/dashboard.Service.js";


// =====================================================
// ADMIN DASHBOARD
// =====================================================

export const getAdminDashboard = async (
  req,
  res
) => {
  try {
    const dashboard =
      await getAdminDashboardData();

    return res.status(200).json({
      success: true,
      dashboard,
    });

  } catch (error) {
    console.error(
      "ADMIN DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load dashboard",
    });
  }
};


// =====================================================
// EMPLOYEE DASHBOARD
// =====================================================

export const getEmployeeDashboard = async (
  req,
  res
) => {
  try {
    const dashboard =
      await getEmployeeDashboardData(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      dashboard,
    });

  } catch (error) {
    console.error(
      "EMPLOYEE DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load employee dashboard",
    });
  }
};