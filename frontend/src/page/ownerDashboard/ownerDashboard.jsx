import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CheckCheck,
  ClipboardList,
  Clock3,
  CreditCard,
  Megaphone,
  RefreshCw,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Layout from "../../components/layout/owner/layout";
import { getStoredUser } from "../../utils/auth";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-NP", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const formatCurrency = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `रू ${amount.toLocaleString("en-NP", { maximumFractionDigits: 2 })}`
    : "—";
};

const displayStatus = (value) =>
  String(value || "Unknown")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const badgeClass = (value) => {
  if (["APPROVED", "PRESENT", "COMPLETED"].includes(value)) {
    return "bg-emerald-50 text-emerald-700";
  }
  if (["PENDING", "IN_PROGRESS", "LATE"].includes(value)) {
    return "bg-amber-50 text-amber-700";
  }
  if (["REJECTED", "ABSENT", "CANCELLED"].includes(value)) {
    return "bg-rose-50 text-rose-700";
  }
  return "bg-slate-100 text-slate-600";
};

const StatCard = ({ label, value, detail, icon: Icon, tone }) => (
  <article className="rounded-xl border border-border bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
          {value}
        </p>
      </div>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={19} />
      </span>
    </div>
    <p className="mt-3 text-[11px] leading-5 text-slate-500">{detail}</p>
  </article>
);

const OwnerDashboard = () => {
  const user = getStoredUser();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/dashboard/admin");
      if (!data?.success || !data.dashboard) {
        throw new Error(data?.message || "Unable to load your dashboard.");
      }
      setDashboard(data.dashboard);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to load your dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => loadDashboard());
  }, [loadDashboard]);

  const overview = dashboard?.overview || {};
  const tasks = dashboard?.tasks || {};
  const attendance = dashboard?.attendance || {};
  const recentEmployees = dashboard?.recentEmployees || [];
  const recentPayrolls = dashboard?.recentPayrolls || [];
  const recentLeaves = dashboard?.recentLeaves || [];
  const recentNotices = dashboard?.recentNotices || [];

  const taskBreakdown = [
    ["To do", tasks.todo ?? 0, "TODO", "bg-slate-400"],
    ["In progress", tasks.inProgress ?? 0, "IN_PROGRESS", "bg-indigo-500"],
    ["Completed", tasks.completed ?? 0, "COMPLETED", "bg-emerald-500"],
    ["Cancelled", tasks.cancelled ?? 0, "CANCELLED", "bg-rose-400"],
  ];
  const taskTotal = Number(tasks.total) || 0;
  const attendanceBreakdown = [
    ["Present", attendance.present ?? 0, "PRESENT", "bg-emerald-500"],
    ["Late", attendance.late ?? 0, "LATE", "bg-amber-500"],
    ["Absent", attendance.absent ?? 0, "ABSENT", "bg-rose-500"],
    ["Half day", attendance.halfDay ?? 0, "HALF_DAY", "bg-indigo-500"],
    ["On leave", attendance.leave ?? 0, "LEAVE", "bg-slate-400"],
  ];
  const attendanceTotal = attendanceBreakdown.reduce(
    (sum, [, count]) => sum + Number(count || 0),
    0
  );

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-indigo-600">
              {new Date().toLocaleDateString("en-NP", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, {user?.name?.split(/\s+/)[0] || "there"}
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Here’s a live overview of your people and daily operations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </header>

        {error && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
            <button type="button" onClick={() => loadDashboard()} className="font-semibold underline underline-offset-2">
              Try again
            </button>
          </div>
        )}

        {loading && !dashboard ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading dashboard">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-xl border border-border bg-white" />
            ))}
          </div>
        ) : dashboard ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total employees"
                value={overview.totalEmployees ?? 0}
                detail={`${overview.activeEmployees ?? 0} currently active`}
                icon={Users}
                tone="bg-indigo-50 text-indigo-600"
              />
              <StatCard
                label="Departments"
                value={overview.totalDepartments ?? 0}
                detail="Across your organization"
                icon={Building2}
                tone="bg-violet-50 text-violet-600"
              />
              <StatCard
                label="Pending leave"
                value={overview.pendingLeaves ?? 0}
                detail="Requests awaiting review"
                icon={CalendarCheck}
                tone="bg-amber-50 text-amber-600"
              />
              <StatCard
                label="Tasks in progress"
                value={tasks.inProgress ?? 0}
                detail={`${tasks.total ?? 0} tasks in the system`}
                icon={ClipboardList}
                tone="bg-sky-50 text-sky-600"
              />
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <article className="rounded-xl border border-border bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Attendance today</h3>
                    <p className="mt-1 text-xs text-muted">
                      {attendanceTotal} attendance records for today
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <CalendarCheck size={17} />
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {attendanceBreakdown.map(([label, count, status, color]) => {
                    const percent = attendanceTotal
                      ? Math.min((Number(count) / attendanceTotal) * 100, 100)
                      : 0;
                    return (
                      <Link
                        key={label}
                        to={`/workspace/attendance?status=${status}`}
                        className="group grid grid-cols-[84px_1fr_32px] items-center gap-3 rounded-md py-1 text-xs hover:bg-slate-50"
                        aria-label={`${label}: ${count}. View attendance records`}
                      >
                        <span className="text-slate-600">{label}</span>
                        <span className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <span className={`block h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
                        </span>
                        <span className="text-right font-semibold text-slate-700">{count}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-5 border-t border-border pt-4">
                  <Link to="/workspace/attendance" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                    View attendance <ArrowRight size={14} />
                  </Link>
                </div>
              </article>

              <article className="rounded-xl border border-border bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Task progress</h3>
                    <p className="mt-1 text-xs text-muted">{taskTotal} tracked tasks</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <ClipboardList size={17} />
                  </span>
                </div>
                <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-slate-100" aria-label="Task status distribution">
                  {taskBreakdown.map(([label, count, status, color]) => (
                    taskTotal > 0 && Number(count) > 0 ? (
                      <Link
                        key={status}
                        to={`/workspace/tasks?status=${status}`}
                        className={`${color} transition-opacity hover:opacity-75`}
                        style={{ width: `${(Number(count) / taskTotal) * 100}%` }}
                        title={`${label}: ${count}`}
                        aria-label={`${label}: ${count} tasks`}
                      />
                    ) : null
                  ))}
                </div>
                <div className="mt-5 space-y-3">
                  {taskBreakdown.map(([label, count, status, color]) => (
                    <Link key={status} to={`/workspace/tasks?status=${status}`} className="flex items-center justify-between gap-3 rounded-md py-1 text-xs hover:bg-slate-50">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className={`h-2 w-2 rounded-full ${color}`} />
                        {label}
                      </span>
                      <span className="font-semibold text-slate-800">{count}</span>
                    </Link>
                  ))}
                </div>
                <Link to="/workspace/tasks" className="mt-4 inline-flex items-center gap-1.5 border-t border-border pt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                  Manage tasks <ArrowRight size={14} />
                </Link>
              </article>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <article className="overflow-hidden rounded-xl border border-border bg-white shadow-sm shadow-slate-900/[0.02]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Recent employees</h3>
                    <p className="mt-1 text-xs text-muted">Recently added to the team</p>
                  </div>
                  <Link to="/owner/employees" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                    View all <ArrowRight size={13} />
                  </Link>
                </div>
                {recentEmployees.length ? (
                  <ul className="divide-y divide-slate-100">
                    {recentEmployees.slice(0, 5).map((employee) => {
                      const name = employee.user?.name || "Employee";
                      const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
                      return (
                        <li key={employee.id} className="flex items-center gap-3 px-5 py-3.5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-700">{initials}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-slate-800">{name}</span>
                            <span className="mt-0.5 block truncate text-[11px] text-muted">{employee.user?.email || employee.position || "Team member"}</span>
                          </span>
                          <span className="hidden text-right sm:block">
                            <span className="block max-w-32 truncate text-[11px] font-medium text-slate-700">{employee.department?.name || "No department"}</span>
                            <span className="mt-0.5 block text-[10px] text-muted">{employee.user?.isActive ? "Active" : "Inactive"}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <EmptyPanel icon={Users} message="No employee profiles found." />
                )}
              </article>

              <article className="overflow-hidden rounded-xl border border-border bg-white shadow-sm shadow-slate-900/[0.02]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Leave requests</h3>
                    <p className="mt-1 text-xs text-muted">Latest requests requiring attention</p>
                  </div>
                  <Link to="/workspace/leaves" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                    Review <ArrowRight size={13} />
                  </Link>
                </div>
                {recentLeaves.length ? (
                  <ul className="divide-y divide-slate-100">
                    {recentLeaves.slice(0, 5).map((leave) => (
                      <li key={leave.id} className="flex items-center gap-3 px-5 py-3.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                          <Clock3 size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-slate-800">{leave.employee?.user?.name || "Employee"} · {displayStatus(leave.leaveType)}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-muted">{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</span>
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${badgeClass(leave.status)}`}>{displayStatus(leave.status)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyPanel icon={CheckCheck} message="No recent leave requests." />
                )}
              </article>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <article className="overflow-hidden rounded-xl border border-border bg-white shadow-sm shadow-slate-900/[0.02]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Latest notices</h3>
                    <p className="mt-1 text-xs text-muted">Recent organization announcements</p>
                  </div>
                  <Link to="/workspace/notices" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                    All notices <ArrowRight size={13} />
                  </Link>
                </div>
                {recentNotices.length ? (
                  <ul className="divide-y divide-slate-100">
                    {recentNotices.slice(0, 4).map((notice) => (
                      <li key={notice.id} className="flex items-start gap-3 px-5 py-4">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Megaphone size={15} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-slate-800">{notice.title}</span>
                          <span className="mt-1 line-clamp-2 block text-[11px] leading-5 text-muted">{notice.message}</span>
                          <span className="mt-1.5 block text-[10px] text-slate-400">{formatDate(notice.createdAt)} · {notice.createdByUser?.name || "Management"}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyPanel icon={Megaphone} message="No notices have been published." />
                )}
              </article>

              <article className="overflow-hidden rounded-xl border border-border bg-white shadow-sm shadow-slate-900/[0.02]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Recent payroll</h3>
                    <p className="mt-1 text-xs text-muted">Latest salary records</p>
                  </div>
                  <Link to="/workspace/payroll" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                    View payroll <ArrowRight size={13} />
                  </Link>
                </div>
                {recentPayrolls.length ? (
                  <ul className="divide-y divide-slate-100">
                    {recentPayrolls.slice(0, 5).map((payroll) => (
                      <li key={payroll.id} className="flex items-center gap-3 px-5 py-3.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><CreditCard size={16} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-slate-800">{payroll.employee?.user?.name || "Employee"}</span>
                          <span className="mt-0.5 block text-[11px] text-muted">{new Date(2000, Number(payroll.month) - 1).toLocaleString("en", { month: "long" })} {payroll.year}</span>
                        </span>
                        <span className="text-right">
                          <span className="block text-xs font-semibold text-slate-800">{formatCurrency(payroll.netSalary)}</span>
                          <span className="mt-0.5 block text-[10px] text-muted">Net salary</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyPanel icon={CreditCard} message="No payroll records have been created." />
                )}
              </article>
            </section>

            <section className="rounded-xl border border-border bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Quick access</h3>
                <p className="mt-1 text-xs text-muted">Go directly to common people operations.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <QuickLink to="/owner/employees" icon={Users} label="Manage employees" />
                <QuickLink to="/owner/departments" icon={Building2} label="Manage departments" />
                <QuickLink to="/workspace/leaves" icon={CalendarCheck} label="Review leave" />
                <QuickLink to="/workspace/notices" icon={Megaphone} label="Create a notice" />
              </div>
            </section>
          </>
        ) : (
          <div className="rounded-xl border border-border bg-white px-5 py-16 text-center">
            <p className="text-sm font-semibold text-slate-800">Dashboard unavailable</p>
            <p className="mt-1 text-xs text-muted">Try again to retrieve current organization data.</p>
            <button type="button" onClick={() => loadDashboard()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

const EmptyPanel = ({ icon: Icon, message }) => (
  <div className="flex items-center gap-3 px-5 py-8 text-xs text-muted">
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
      <Icon size={16} />
    </span>
    {message}
  </div>
);

const QuickLink = ({ to, icon: Icon, label }) => (
  <Link to={to} className="flex items-center gap-3 rounded-lg border border-border px-3.5 py-3 text-xs font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700">
    <Icon size={16} className="text-indigo-600" />
    <span className="flex-1">{label}</span>
    <ArrowRight size={14} className="text-slate-400" />
  </Link>
);

export default OwnerDashboard;
