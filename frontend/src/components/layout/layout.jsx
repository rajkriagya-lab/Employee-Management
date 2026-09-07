import React, {
  useState,
} from "react";

import Sidebar from "./sidbar";
import Navbar from "./navbaravbar";

const DashboardLayout = ({
  children,
}) => {
  const [isOpen, setIsOpen] =
    useState(false);

  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  return (
    <div className="min-h-screen bg-background">

      {/* Sidebar */}
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        role={user?.role}
      />

      {/* Main */}
      <div className="lg:ml-64 min-h-screen">

        {/* Navbar */}
        <Navbar
          setIsOpen={setIsOpen}
        />

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-7">
          {children}
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;