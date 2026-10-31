import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./page/auth/login";
import Register from "./page/auth/register";
import OwnerDashboard from "./page/ownerDashboard/ownerDashboard";
import ViewEmployee from "./page/ownerDashboard/employee";
import EmployeeDetails from "./page/ownerDashboard/EmployeeDetails";
import Department from "./page/ownerDashboard/Department";
import EmployeeDashboard from "./page/employeeDashboard/employeeDashboard";
import WorkspacePage from "./page/workspace/WorkspacePage";
import { getHomePath, getStoredUser } from "./utils/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");
  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  const user = getStoredUser();
  if (!user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getHomePath(user?.role)} replace />;
  }

  return children;
};

const AuthenticatedHome = () => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");
  const user = getStoredUser();

  return token && user
    ? <Navigate to={getHomePath(user.role)} replace />
    : <Navigate to="/login" replace />;
};

const ManagementRoles = ["OWNER", "ADMIN", "MANAGER"];
const AllRoles = [...ManagementRoles, "EMPLOYEE"];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthenticatedHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={ManagementRoles}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/employees"
          element={
            <ProtectedRoute allowedRoles={ManagementRoles}>
              <ViewEmployee />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/employees/:id"
          element={
            <ProtectedRoute allowedRoles={ManagementRoles}>
              <EmployeeDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/departments"
          element={
            <ProtectedRoute allowedRoles={ManagementRoles}>
              <Department />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspace/:module"
          element={
            <ProtectedRoute allowedRoles={AllRoles}>
              <WorkspacePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<AuthenticatedHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
