import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Wallet,
  Megaphone,
  LogOut,
  X,
} from "lucide-react";

const Sidebar = ({
  isOpen,
  setIsOpen,
  role = "EMPLOYEE",
}) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  const ownerLinks = [
    {
      name: "Dashboard",
      path: "/owner/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Employees",
      path: "/owner/employees",
      icon: Users,
    },
    {
      name: "Departments",
      path: "/owner/departments",
      icon: Building2,
    },
    {
      name: "Attendance",
      path: "/owner/attendance",
      icon: CalendarCheck,
    },
    {
      name: "Leaves",
      path: "/owner/leaves",
      icon: CalendarDays,
    },
    {
      name: "Tasks",
      path: "/owner/tasks",
      icon: ClipboardList,
    },
    {
      name: "Payroll",
      path: "/owner/payroll",
      icon: Wallet,
    },
    {
      name: "Notices",
      path: "/owner/notices",
      icon: Megaphone,
    },
  ];

  const employeeLinks = [
    {
      name: "Dashboard",
      path: "/member/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Attendance",
      path: "/member/attendance",
      icon: CalendarCheck,
    },
    {
      name: "Leaves",
      path: "/member/leaves",
      icon: CalendarDays,
    },
    {
      name: "Tasks",
      path: "/member/tasks",
      icon: ClipboardList,
    },
    {
      name: "Payroll",
      path: "/member/payroll",
      icon: Wallet,
    },
    {
      name: "Notices",
      path: "/member/notices",
      icon: Megaphone,
    },
  ];

  const links =
    role === "OWNER" ||
    role === "ADMIN"
      ? ownerLinks
      : employeeLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed
          top-0
          left-0
          z-50
          h-screen
          w-64
          bg-text
          text-white
          border-r
          border-text
          flex
          flex-col
          transition-transform
          duration-200
          lg:translate-x-0

          ${isOpen
            ? "translate-x-0"
            : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              BizFlow
            </h1>

            <p className="text-[11px] text-white/50 mt-0.5">
              Employee Management
            </p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto">
          <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Menu
          </p>

          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2.5
                    rounded-md
                    text-sm
                    font-medium
                    transition-colors

                    ${
                      isActive
                        ? "bg-btn text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }
                    `
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />

                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={logout}
            className="
              w-full
              flex
              items-center
              gap-3
              px-3
              py-2.5
              rounded-md
              text-sm
              font-medium
              text-white/70
              hover:bg-red-500/10
              hover:text-red-400
              transition-colors
            "
          >
            <LogOut size={18} />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;