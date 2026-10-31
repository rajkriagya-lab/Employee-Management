import { useState } from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";

const DashboardLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text">
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-md bg-surface px-4 py-2 text-sm text-text focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
        />
      )}
      <div
        className={`min-h-screen transition-[margin] duration-200 ${
          isCollapsed ? "lg:ml-[5.25rem]" : "lg:ml-64"
        }`}
      >
        <Navbar
          setIsOpen={setIsOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <main
          id="main-content"
          tabIndex="-1"
          className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
