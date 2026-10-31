import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Menu,
  Search,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { clearStoredAuth, getHomePath, getStoredUser } from "../../../utils/auth";
import { getNavigationGroups } from "../../../utils/navigation";

const Navbar = ({ setIsOpen, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const role = user?.role || "EMPLOYEE";
  const navigation = getNavigationGroups(role).flatMap((group) => group.items);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const headerRef = useRef(null);
  const searchRef = useRef(null);

  const currentPage =
    navigation.find((item) => item.path === location.pathname) ||
    navigation.find((item) => location.pathname.startsWith(`${item.path}/`));
  const pageTitle = currentPage?.label || "Workspace";
  const suggestions = search.trim()
    ? navigation.filter((item) =>
        item.label.toLowerCase().includes(search.trim().toLowerCase())
      )
    : [];

  useEffect(() => {
    let active = true;
    api
      .get("/notifications/unread/count")
      .then(({ data }) => {
        if (active && data?.success) setUnreadCount(Number(data.count) || 0);
      })
      .catch((error) => {
        if (active) {
          setNotificationError(
            error.response?.data?.message || "Notifications are unavailable."
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
      ) {
        event.preventDefault();
        searchRef.current?.querySelector("input")?.focus();
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const logout = () => {
    clearStoredAuth();
    navigate("/login", { replace: true });
  };

  const openNotifications = async () => {
    const opening = !notificationsOpen;
    setNotificationsOpen(opening);
    setProfileOpen(false);
    if (!opening) return;

    setNotificationLoading(true);
    setNotificationError("");
    try {
      const { data } = await api.get("/notifications/unread");
      if (!data?.success) {
        throw new Error(data?.message || "Unable to load notifications.");
      }
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (error) {
      setNotificationError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load notifications."
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const { data } = await api.patch(`/notifications/${id}/read`);
      if (!data?.success) {
        throw new Error(data?.message || "Unable to update notification.");
      }
      setNotifications((items) => items.filter((item) => item.id !== id));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      setNotificationError(
        error.response?.data?.message ||
          error.message ||
          "Unable to update notification."
      );
    }
  };

  const markAllRead = async () => {
    try {
      const { data } = await api.patch("/notifications/read-all");
      if (!data?.success) {
        throw new Error(data?.message || "Unable to update notifications.");
      }
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      setNotificationError(
        error.response?.data?.message ||
          error.message ||
          "Unable to update notifications."
      );
    }
  };

  const navigateToSearchResult = (path) => {
    navigate(path);
    setSearch("");
    setSearchOpen(false);
  };

  const initials = (user?.name || "User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex min-h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <Menu size={19} />
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:inline-flex"
          >
            {isCollapsed ? <ChevronsRight size={19} /> : <ChevronsLeft size={19} />}
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Workspace</span>
              <span aria-hidden="true">/</span>
              <span className="truncate text-slate-600">{pageTitle}</span>
            </div>
            <h1 className="mt-0.5 truncate text-base font-semibold tracking-tight text-slate-900">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2" ref={headerRef}>
          <div className="relative hidden w-[min(28vw,320px)] sm:block" ref={searchRef}>
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && suggestions[0]) {
                  navigateToSearchResult(suggestions[0].path);
                }
              }}
              aria-label="Search navigation"
              placeholder="Jump to a page..."
              className="h-10 w-full rounded-lg border border-border bg-slate-50 pl-9 pr-10 text-sm text-text placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
            <kbd className="absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-white px-1.5 py-0.5 text-[10px] text-slate-400 md:block">
              /
            </kbd>
            {searchOpen && search.trim() && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-full min-w-60 overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-xl">
                {suggestions.length ? (
                  suggestions.map(({ label, path, icon: Icon }) => (
                    <button
                      type="button"
                      key={path}
                      onClick={() => navigateToSearchResult(path)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Icon size={16} className="text-slate-400" />
                      {label}
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-3 text-xs text-muted">
                    No matching pages. Search covers navigation.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="relative sm:hidden">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((open) => !open);
                setNotificationsOpen(false);
              }}
              aria-label="Search pages"
              className="rounded-lg p-2.5 text-slate-500 hover:bg-slate-100"
            >
              <Search size={18} />
            </button>
            {searchOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(88vw,340px)] rounded-xl border border-border bg-white p-3 shadow-xl">
                <input
                  type="search"
                  autoFocus
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && suggestions[0]) {
                      navigateToSearchResult(suggestions[0].path);
                    }
                  }}
                  placeholder="Search pages..."
                  aria-label="Search navigation"
                  className="h-10 w-full rounded-lg border border-border px-3 text-sm focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
                <div className="mt-2 max-h-60 overflow-auto">
                  {suggestions.map(({ label, path, icon: Icon }) => (
                    <button
                      type="button"
                      key={path}
                      onClick={() => navigateToSearchResult(path)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                    >
                      <Icon size={16} className="text-slate-400" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={openNotifications}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
              aria-expanded={notificationsOpen}
              className="relative rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-semibold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <section className="absolute right-[-48px] top-[calc(100%+12px)] z-50 w-[min(92vw,380px)] overflow-hidden rounded-xl border border-border bg-white shadow-xl sm:right-0">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Notifications
                    </h2>
                    <p className="text-[11px] text-muted">
                      {unreadCount} unread
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                {notificationError && (
                  <p role="alert" className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-700">
                    {notificationError}
                  </p>
                )}
                <div className="max-h-[min(60vh,420px)] overflow-y-auto">
                  {notificationLoading ? (
                    <p className="px-4 py-8 text-center text-sm text-muted">
                      Loading notifications…
                    </p>
                  ) : notifications.length ? (
                    notifications.slice(0, 8).map((notification) => (
                      <article
                        key={notification.id}
                        className="flex gap-3 border-b border-slate-100 px-4 py-3 last:border-0"
                      >
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800">
                            {notification.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                            {notification.message}
                          </p>
                          <button
                            type="button"
                            onClick={() => markNotificationRead(notification.id)}
                            className="mt-2 text-[11px] font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            Mark as read
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="px-5 py-9 text-center">
                      <Bell size={20} className="mx-auto text-slate-300" />
                      <p className="mt-2 text-sm font-medium text-slate-700">
                        You’re all caught up
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        New updates will appear here.
                      </p>
                    </div>
                  )}
                </div>
                <Link
                  to="/workspace/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="block border-t border-border bg-slate-50 px-4 py-3 text-center text-xs font-medium text-indigo-600 hover:bg-slate-100"
                >
                  View all notifications
                </Link>
              </section>
            )}
          </div>

          <div className="h-7 w-px bg-border" />
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((open) => !open);
                setNotificationsOpen(false);
              }}
              aria-expanded={profileOpen}
              aria-label="Open account menu"
              className="flex items-center gap-2 rounded-lg p-1.5 text-left transition hover:bg-slate-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-700">
                {initials || "U"}
              </span>
              <span className="hidden max-w-28 sm:block">
                <span className="block truncate text-xs font-semibold text-slate-800">
                  {user?.name || "Account"}
                </span>
                <span className="mt-0.5 block text-[10px] capitalize text-muted">
                  {role.toLowerCase()}
                </span>
              </span>
              <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-xl border border-border bg-white shadow-xl">
                <div className="border-b border-border px-4 py-3">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user?.name || "Signed-in user"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {user?.email || "No email address"}
                  </p>
                  <span className="mt-2 inline-flex rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                    {role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(getHomePath(role));
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Go to dashboard
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 border-t border-border px-4 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {notificationError && !notificationsOpen && (
        <span className="sr-only" role="status">
          {notificationError}
        </span>
      )}
    </header>
  );
};

export default Navbar;
