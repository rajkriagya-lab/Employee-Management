import React, {
  useState,
} from "react";

import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import NotificationBell from "../components/NotificationBell";

const Navbar = ({
  setIsOpen,
}) => {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header
      className="
        h-16
        bg-surface
        border-b
        border-border
        flex
        items-center
        justify-between
        px-4
        lg:px-6
        sticky
        top-0
        z-30
      "
    >
      {/* Left */}
      <div className="flex items-center gap-4">

        {/* Mobile menu */}
        <button
          onClick={() => setIsOpen(true)}
          className="
            lg:hidden
            p-2
            rounded-md
            text-muted
            hover:bg-background
            hover:text-text
          "
        >
          <Menu size={21} />
        </button>

        {/* Search */}
        <div className="hidden sm:flex items-center">
          <div
            className="
              w-64
              lg:w-80
              h-9
              flex
              items-center
              gap-2
              px-3
              bg-background
              border
              border-border
              rounded-md
            "
          >
            <Search
              size={17}
              className="text-muted"
            />

            <input
              type="text"
              placeholder="Search..."
              className="
                w-full
                bg-transparent
                outline-none
                text-sm
                text-text
                placeholder:text-muted
              "
            />
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Notification */}
        <NotificationBell />

        {/* Divider */}
        <div className="hidden sm:block h-7 w-px bg-border mx-2" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() =>
              setProfileOpen(
                (prev) => !prev
              )
            }
            className="
              flex
              items-center
              gap-2
              px-2
              py-1.5
              rounded-md
              hover:bg-background
              transition-colors
            "
          >
            <div
              className="
                w-8
                h-8
                rounded-full
                bg-btn
                text-white
                flex
                items-center
                justify-center
                text-sm
                font-semibold
              "
            >
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-text leading-none">
                {user?.name || "User"}
              </p>

              <p className="text-xs text-muted mt-1">
                {user?.role || "Employee"}
              </p>
            </div>

            <ChevronDown
              size={16}
              className="hidden md:block text-muted"
            />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div
              className="
                absolute
                right-0
                mt-2
                w-52
                bg-surface
                border
                border-border
                rounded-lg
                shadow-lg
                py-1
              "
            >
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/profile");
                }}
                className="
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-2.5
                  text-sm
                  text-text
                  hover:bg-background
                "
              >
                <User size={17} />

                Profile
              </button>

              <div className="h-px bg-border my-1" />

              <button
                onClick={logout}
                className="
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-2.5
                  text-sm
                  text-red-600
                  hover:bg-red-50
                "
              >
                <LogOut size={17} />

                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;