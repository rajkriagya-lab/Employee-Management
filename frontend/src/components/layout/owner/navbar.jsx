import React, { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Settings,
  CircleUserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setIsOpen }) => {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const profileRef = useRef(null);

  // Get logged-in user
  const storedUser =
    localStorage.getItem("user") ||
    sessionStorage.getItem("user");

  const user = storedUser ? JSON.parse(storedUser) : null;

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  // User initials
  const getInitials = () => {
    if (!user?.name) return "U";

    const names = user.name.trim().split(" ");

    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (
      names[0].charAt(0) +
      names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <header
      className="
        sticky top-0 z-40
        h-[72px]
        bg-surface/95
        backdrop-blur-xl
        border-b border-border
        flex items-center justify-between
        px-4 sm:px-6 lg:px-8
      "
    >
      {/* ================= LEFT ================= */}
      <div className="flex items-center gap-3 sm:gap-5">

        {/* Mobile Menu */}
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          className="
            lg:hidden
            w-10 h-10
            flex items-center justify-center
            rounded-xl
            text-muted
            border border-transparent
            hover:border-border
            hover:bg-background
            hover:text-text
            transition-all duration-200
          "
        >
          <Menu size={21} />
        </button>

        {/* Desktop Search */}
        <div
          className="
            hidden sm:flex
            items-center
            w-[260px] md:w-[320px] lg:w-[380px]
            h-11
            px-3.5
            gap-3
            rounded-xl
            bg-background
            border border-border
            focus-within:border-btn
            focus-within:ring-4
            focus-within:ring-btn/10
            transition-all duration-200
          "
        >
          <Search
            size={18}
            className="text-muted shrink-0"
          />

          <input
            type="text"
            placeholder="Search anything..."
            className="
              w-full
              bg-transparent
              outline-none
              text-sm
              text-text
              placeholder:text-muted
            "
          />

          <div
            className="
              hidden lg:flex
              items-center justify-center
              min-w-[28px] h-7
              px-1.5
              rounded-md
              border border-border
              bg-surface
              text-[11px]
              font-medium
              text-muted
            "
          >
            /
          </div>
        </div>

        {/* Mobile Search */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="
            sm:hidden
            w-10 h-10
            flex items-center justify-center
            rounded-xl
            text-muted
            hover:bg-background
            hover:text-text
            transition-all
          "
          aria-label="Search"
        >
          {searchOpen ? (
            <X size={20} />
          ) : (
            <Search size={20} />
          )}
        </button>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Notification */}
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => navigate("/notifications")}
          className="
            relative
            w-10 h-10
            flex items-center justify-center
            rounded-xl
            text-muted
            hover:text-text
            hover:bg-background
            border border-transparent
            hover:border-border
            transition-all duration-200
            group
          "
        >
          <Bell
            size={19}
            className="
              group-hover:rotate-[-8deg]
              transition-transform
            "
          />

          {/* Notification badge */}
          <span
            className="
              absolute
              top-[7px]
              right-[7px]
              w-[7px]
              h-[7px]
              rounded-full
              bg-red-500
              ring-2 ring-surface
            "
          />
        </button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-border mx-1" />

        {/* ================= PROFILE ================= */}
        <div
          ref={profileRef}
          className="relative"
        >
          <button
            onClick={() =>
              setProfileOpen((prev) => !prev)
            }
            className="
              flex items-center
              gap-2.5
              pl-1.5 pr-2
              py-1.5
              rounded-xl
              hover:bg-background
              border border-transparent
              hover:border-border
              transition-all duration-200
            "
          >
            {/* Avatar */}
            <div
              className="
                relative
                w-9 h-9
                rounded-xl
                bg-btn
                text-white
                flex items-center justify-center
                text-sm
                font-bold
                shadow-sm
              "
            >
              {getInitials()}

              {/* Online indicator */}
              <span
                className="
                  absolute
                  right-[-2px]
                  bottom-[-2px]
                  w-3
                  h-3
                  rounded-full
                  bg-emerald-500
                  ring-2 ring-surface
                "
              />
            </div>

            {/* User Info */}
            <div className="hidden md:block text-left max-w-[130px]">
              <p
                className="
                  text-sm
                  font-semibold
                  text-text
                  truncate
                  leading-tight
                "
              >
                {user?.name || "User"}
              </p>

              <p
                className="
                  text-[11px]
                  text-muted
                  mt-0.5
                  capitalize
                  truncate
                "
              >
                {user?.role?.toLowerCase() || "Employee"}
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`
                hidden md:block
                text-muted
                transition-transform duration-200
                ${profileOpen ? "rotate-180" : ""}
              `}
            />
          </button>

          {/* ================= DROPDOWN ================= */}
          {profileOpen && (
            <div
              className="
                absolute
                right-0
                top-[calc(100%+10px)]
                w-64
                bg-surface
                border border-border
                rounded-2xl
                shadow-[0_15px_45px_rgba(0,0,0,0.12)]
                overflow-hidden
                animate-in
                fade-in
                slide-in-from-top-2
                duration-200
              "
            >
              {/* Profile Header */}
              <div className="p-4 bg-background/70">
                <div className="flex items-center gap-3">

                  <div
                    className="
                      w-11 h-11
                      rounded-xl
                      bg-btn
                      text-white
                      flex items-center justify-center
                      font-bold
                    "
                  >
                    {getInitials()}
                  </div>

                  <div className="min-w-0">
                    <p
                      className="
                        font-semibold
                        text-sm
                        text-text
                        truncate
                      "
                    >
                      {user?.name || "User"}
                    </p>

                    <p
                      className="
                        text-xs
                        text-muted
                        truncate
                        mt-0.5
                      "
                    >
                      {user?.email || "No email"}
                    </p>
                  </div>
                </div>

                {/* Role badge */}
                <div className="mt-3">
                  <span
                    className="
                      inline-flex
                      items-center
                      px-2.5
                      py-1
                      rounded-lg
                      bg-btn/10
                      text-btn
                      text-[11px]
                      font-semibold
                      capitalize
                    "
                  >
                    {user?.role?.toLowerCase() ||
                      "Employee"}
                  </span>
                </div>
              </div>

              {/* Menu */}
              <div className="p-2">

                {/* Profile */}
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                  className="
                    w-full
                    flex items-center
                    gap-3
                    px-3
                    py-2.5
                    rounded-xl
                    text-sm
                    text-text
                    hover:bg-background
                    transition-colors
                  "
                >
                  <span
                    className="
                      w-8 h-8
                      rounded-lg
                      bg-background
                      border border-border
                      flex items-center justify-center
                    "
                  >
                    <CircleUserRound size={16} />
                  </span>

                  <span className="flex-1 text-left">
                    My Profile
                  </span>
                </button>

                {/* Settings */}
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="
                    w-full
                    flex items-center
                    gap-3
                    px-3
                    py-2.5
                    rounded-xl
                    text-sm
                    text-text
                    hover:bg-background
                    transition-colors
                  "
                >
                  <span
                    className="
                      w-8 h-8
                      rounded-lg
                      bg-background
                      border border-border
                      flex items-center justify-center
                    "
                  >
                    <Settings size={16} />
                  </span>

                  <span className="flex-1 text-left">
                    Settings
                  </span>
                </button>

                <div className="h-px bg-border my-2" />

                {/* Logout */}
                <button
                  onClick={logout}
                  className="
                    w-full
                    flex items-center
                    gap-3
                    px-3
                    py-2.5
                    rounded-xl
                    text-sm
                    text-red-600
                    hover:bg-red-50
                    transition-colors
                  "
                >
                  <span
                    className="
                      w-8 h-8
                      rounded-lg
                      bg-red-50
                      flex items-center justify-center
                    "
                  >
                    <LogOut size={16} />
                  </span>

                  <span className="flex-1 text-left">
                    Logout
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MOBILE SEARCH ================= */}
      {searchOpen && (
        <div
          className="
            absolute
            top-[72px]
            left-0
            right-0
            sm:hidden
            p-3
            bg-surface
            border-b border-border
            shadow-sm
          "
        >
          <div
            className="
              flex items-center
              gap-3
              h-11
              px-3.5
              rounded-xl
              bg-background
              border border-border
              focus-within:border-btn
              focus-within:ring-4
              focus-within:ring-btn/10
            "
          >
            <Search
              size={18}
              className="text-muted"
            />

            <input
              autoFocus
              type="text"
              placeholder="Search anything..."
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
      )}
    </header>
  );
};

export default Navbar;