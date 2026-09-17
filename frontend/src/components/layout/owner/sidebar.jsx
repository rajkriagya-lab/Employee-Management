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
  ChevronRight,
  Settings,
} from "lucide-react";

const Sidebar = ({
  isOpen,
  setIsOpen,
  role = "EMPLOYEE",
}) => {
  const navigate = useNavigate();

  /*
   * =====================================================
   * GET CURRENT USER
   * =====================================================
   */

  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const currentRole =
    user?.role || role || "EMPLOYEE";

  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  /*
   * =====================================================
   * USER INITIALS
   * =====================================================
   */

  const getInitials = () => {
    if (!user?.name) return "U";

    const parts = user.name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  /*
   * =====================================================
   * OWNER / ADMIN LINKS
   * =====================================================
   */

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

  /*
   * =====================================================
   * EMPLOYEE LINKS
   * =====================================================
   */

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

  /*
   * OWNER + ADMIN GET MANAGEMENT SIDEBAR
   */

  const links =
    currentRole === "OWNER" ||
    currentRole === "ADMIN"
      ? ownerLinks
      : employeeLinks;

  return (
    <>
      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {isOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            bg-black/50
            backdrop-blur-[2px]
            lg:hidden
          "
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

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
          flex
          flex-col
          border-r
          border-white/10
          shadow-2xl

          transform
          transition-transform
          duration-300
          ease-out

          lg:translate-x-0

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* =================================================
            LOGO
        ================================================= */}

        <div
          className="
            h-[72px]
            px-5
            flex
            items-center
            justify-between
            border-b
            border-white/10
            shrink-0
          "
        >
          <button
            onClick={() =>
              navigate(
                currentRole === "OWNER" ||
                  currentRole === "ADMIN"
                  ? "/owner/dashboard"
                  : "/member/dashboard"
              )
            }
            className="
              flex
              items-center
              gap-3
              text-left
            "
          >
            {/* Logo Icon */}

            <div
              className="
                w-9
                h-9
                rounded-xl
                bg-btn
                flex
                items-center
                justify-center
                shadow-lg
                shadow-btn/20
              "
            >
              <Building2 size={19} />
            </div>

            <div>
              <h1
                className="
                  text-[17px]
                  font-bold
                  tracking-tight
                "
              >
                BizFlow
              </h1>

              <p
                className="
                  text-[10px]
                  text-white/40
                  mt-0.5
                "
              >
                Employee Management
              </p>
            </div>
          </button>

          {/* Mobile close */}

          <button
            onClick={() => setIsOpen(false)}
            className="
              lg:hidden
              w-8
              h-8
              rounded-lg
              flex
              items-center
              justify-center
              text-white/50
              hover:text-white
              hover:bg-white/10
              transition
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav
          className="
            flex-1
            px-3
            py-5
            overflow-y-auto
            scrollbar-thin
            scrollbar-thumb-white/10
          "
        >

          {/* Section title */}

          <p
            className="
              px-3
              mb-3
              text-[10px]
              font-bold
              uppercase
              tracking-[0.15em]
              text-white/30
            "
          >
            Main Menu
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
                      group
                      relative
                      flex
                      items-center
                      gap-3
                      px-3
                      py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      transition-all
                      duration-200

                      ${
                        isActive
                          ? `
                            bg-btn
                            text-white
                            shadow-lg
                            shadow-btn/20
                          `
                          : `
                            text-white/60
                            hover:text-white
                            hover:bg-white/[0.07]
                          `
                      }
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator */}

                      {isActive && (
                        <span
                          className="
                            absolute
                            left-0
                            top-1/2
                            -translate-y-1/2
                            w-1
                            h-6
                            rounded-r-full
                            bg-white
                          "
                        />
                      )}

                      {/* Icon */}

                      <span
                        className={`
                          w-9
                          h-9
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          transition-all

                          ${
                            isActive
                              ? "bg-white/10"
                              : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                          }
                        `}
                      >
                        <Icon
                          size={18}
                          strokeWidth={
                            isActive ? 2 : 1.8
                          }
                        />
                      </span>

                      {/* Name */}

                      <span className="flex-1">
                        {link.name}
                      </span>

                      {/* Arrow */}

                      <ChevronRight
                        size={15}
                        className={`
                          transition-all
                          duration-200

                          ${
                            isActive
                              ? "opacity-100 translate-x-0"
                              : "opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0"
                          }
                        `}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* =================================================
            BOTTOM AREA
        ================================================= */}

        <div
          className="
            p-3
            border-t
            border-white/10
            shrink-0
          "
        >

          {/* User Card */}

          <div
            className="
              mb-2
              p-2
              rounded-xl
              bg-white/[0.05]
              border
              border-white/[0.06]
            "
          >
            <div className="flex items-center gap-2.5">

              {/* Avatar */}

              <div
                className="
                  relative
                  w-9
                  h-9
                  rounded-lg
                  bg-btn
                  flex
                  items-center
                  justify-center
                  text-xs
                  font-bold
                  shrink-0
                "
              >
                {getInitials()}

                {/* Online */}

                <span
                  className="
                    absolute
                    right-[-2px]
                    bottom-[-2px]
                    w-2.5
                    h-2.5
                    rounded-full
                    bg-emerald-400
                    ring-2
                    ring-text
                  "
                />
              </div>

              {/* User */}

              <div className="min-w-0 flex-1">

                <p
                  className="
                    text-xs
                    font-semibold
                    text-white
                    truncate
                  "
                >
                  {user?.name || "User"}
                </p>

                <p
                  className="
                    text-[10px]
                    text-white/40
                    capitalize
                    truncate
                    mt-0.5
                  "
                >
                  {currentRole.toLowerCase()}
                </p>

              </div>

              {/* Settings */}

              <button
                onClick={() =>
                  navigate("/settings")
                }
                className="
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-white/40
                  hover:text-white
                  hover:bg-white/10
                  transition
                "
              >
                <Settings size={16} />
              </button>

            </div>
          </div>

          {/* Logout */}

          <button
            onClick={logout}
            className="
              w-full
              flex
              items-center
              gap-3
              px-3
              py-2.5
              rounded-xl
              text-sm
              font-medium
              text-white/55
              hover:bg-red-500/10
              hover:text-red-400
              transition-all
              duration-200
            "
          >
            <span
              className="
                w-9
                h-9
                rounded-lg
                bg-white/[0.04]
                flex
                items-center
                justify-center
              "
            >
              <LogOut size={17} />
            </span>

            <span>
              Logout
            </span>
          </button>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;