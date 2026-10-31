import { NavLink, useNavigate } from "react-router-dom";
import {
  Building2,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  X,
} from "lucide-react";
import { clearStoredAuth, getHomePath, getStoredUser } from "../../../utils/auth";
import { getNavigationGroups } from "../../../utils/navigation";

const Sidebar = ({
  isOpen,
  setIsOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const role = user?.role || "EMPLOYEE";
  const groups = getNavigationGroups(role);

  const logout = () => {
    clearStoredAuth();
    navigate("/login", { replace: true });
  };

  const initials = (user?.name || "User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-all duration-200 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "lg:w-[5.25rem]" : "lg:w-64"}`}
      aria-label="Main navigation"
    >
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-border px-4">
        <button
          type="button"
          onClick={() => navigate(getHomePath(role))}
          className="flex min-w-0 items-center gap-3 rounded-lg text-left focus-visible:outline-offset-4"
          aria-label="Go to dashboard"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
            <Building2 size={20} />
          </span>
          <span className={`min-w-0 ${isCollapsed ? "lg:hidden" : ""}`}>
            <span className="block truncate text-[15px] font-bold tracking-tight text-slate-900">
              BizFlow
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-muted">
              People operations
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation"
          className="rounded-lg p-2 text-muted hover:bg-background hover:text-text lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <section key={group.label}>
            <h2
              className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 ${
                isCollapsed ? "lg:sr-only" : ""
              }`}
            >
              {group.label}
            </h2>
            <div className="space-y-1">
              {group.items.map(({ label, path, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path.endsWith("dashboard")}
                  title={isCollapsed ? label : undefined}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    } ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-indigo-600" />
                      )}
                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2.2 : 1.8}
                        className="shrink-0"
                      />
                      <span className={isCollapsed ? "lg:hidden" : ""}>
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <div
          className={`flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 ${
            isCollapsed ? "lg:justify-center lg:px-1" : ""
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
            {initials || "U"}
          </span>
          <span className={`min-w-0 flex-1 ${isCollapsed ? "lg:hidden" : ""}`}>
            <span className="block truncate text-xs font-semibold text-slate-800">
              {user?.name || "Signed-in user"}
            </span>
            <span className="mt-0.5 block truncate text-[10px] capitalize text-muted">
              {role.toLowerCase()}
            </span>
          </span>
          <button
            type="button"
            title="Sign out"
            onClick={logout}
            className={`rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-danger ${
              isCollapsed ? "lg:hidden" : ""
            }`}
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((current) => !current)}
          className="mt-2 hidden w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 lg:flex"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
          {!isCollapsed && "Collapse sidebar"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
