import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ===============================
// AUTH PAGES
// ===============================
// import Login from "./pages/auth/Login";
import Register from "./page/auth/register";

// ===============================
// DASHBOARD PAGES
// Change these imports if your
// actual folder names are different
// ===============================
// import OwnerDashboard from "./pages/owner/Dashboard";
// import MemberDashboard from "./pages/member/Dashboard";

// ===============================
// PROTECTED ROUTE
// ===============================
const ProtectedRoute = ({
  children,
  allowedRoles = [],
}) => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error("Invalid stored user:", error);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  // No authentication
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Role restriction
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    // Send user to their correct dashboard
    if (
      user.role === "OWNER" ||
      user.role === "ADMIN"
    ) {
      return (
        <Navigate
          to="/owner/dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/member/dashboard"
        replace
      />
    );
  }

  return children;
};

// ===============================
// PUBLIC ROUTE
// Prevent logged-in users from
// going back to Login
// ===============================
const PublicRoute = ({ children }) => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    user = null;
  }

  if (token && user) {
    if (
      user.role === "OWNER" ||
      user.role === "ADMIN"
    ) {
      return (
        <Navigate
          to="/owner/dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/member/dashboard"
        replace
      />
    );
  }

  return children;
};

// ===============================
// APP
// ===============================
const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================
            PUBLIC AUTH ROUTES
        ================================= */}

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* 
          IMPORTANT:
          Register is NOT public registration.

          It is protected and can only be
          opened by OWNER or MANAGER.
        */}
        <Route
          path="/register"
          element={
            <ProtectedRoute
              allowedRoles={[
                "OWNER",
                "MANAGER",
              ]}
            >
              <Register />
            </ProtectedRoute>
          }
        />

        {/* =================================
            OWNER / ADMIN DASHBOARD
        ================================= */}

        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "OWNER",
                "ADMIN",
              ]}
            >
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* =================================
            MEMBER / EMPLOYEE DASHBOARD
        ================================= */}

        <Route
          path="/member/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "MANAGER",
                "EMPLOYEE",
              ]}
            >
              <MemberDashboard />
            </ProtectedRoute>
          }
        />

        {/* =================================
            DEFAULT ROUTE
        ================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* =================================
            404 ROUTE
        ================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;