import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./navbar";

const DashboardLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">

      {/* Sidebar */}
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {/* Main Area */}
      <div
        className="
          lg:ml-64
          min-h-screen
          flex
          flex-col
        "
      >
        {/* Navbar */}
        <Navbar setIsOpen={setIsOpen} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;