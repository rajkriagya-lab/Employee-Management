import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  Check,
  CheckCheck,
  ClipboardList,
  Clock3,
  CreditCard,
  Megaphone,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Layout from "../../components/layout/owner/layout";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" });
};

const formatCurrency = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `रू ${amount.toLocaleString("en-NP", { maximumFractionDigits: 2 })}`
    : "—";
};

const badgeClass = (status) => {
  if (["APPROVED", "COMPLETED"].includes(status)) return "bg-emerald-50 text-emerald-700";
  if (["PENDING", "IN_PROGRESS"].includes(status)) return "bg-amber-50 text-amber-700";
  if (["REJECTED", "CANCELLED"].includes(status)) return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-600";
};

const EmployeeDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      const { data } = await api.get("/dashboard/employee");
      if (!data?.success || !data.dashboard) {
        throw new Error(data?.message || "Unable to load your dashboard.");
      }
      setDashboard(data.dashboard);
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to load your dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchDashboard);
  }, [fetchDashboard]);

  const refreshDashboard = () => {
    setLoading(true);
    void fetchDashboard();
  };

  const updateAttendance = async (action) => {
    try {
      setSavingAttendance(true);
      setError("");
      const { data } = await api.post(`/attendance/${action}`);
      if (!data?.success) {
        throw new Error(data?.message || "Unable to update attendance.");
      }
      await fetchDashboard();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to update attendance."
      );
    } finally {
      setSavingAttendance(false);
    }
  };

  const attendance = dashboard?.attendance?.today;
  const tasks = dashboard?.tasks || {};
  const leaves = dashboard?.leaves || {};
  const name = dashboard?.employee?.user?.name || "there";

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
              Good to see you, {name.split(/\s+/)[0]}
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Here’s your workday at a glance.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {error && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
            <button type="button" onClick={refreshDashboard} className="font-semibold underline underline-offset-2">Try again</button>
          </div>
        )}

        {loading && !dashboard ? (
          <div className="grid gap-3 sm:grid-cols-2" aria-label="Loading dashboard">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl border border-border bg-white" />)}
          </div>
        ) : dashboard ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="My tasks" value={tasks.total ?? 0} detail={`${tasks.todo ?? 0} to do · ${tasks.inProgress ?? 0} in progress`} icon={ClipboardList} tone="bg-indigo-50 text-indigo-600" />
              <SummaryCard label="Leave requests" value={leaves.total ?? 0} detail={`${leaves.pending ?? 0} awaiting a decision`} icon={CalendarCheck} tone="bg-amber-50 text-amber-600" />
              <SummaryCard label="Unread updates" value={dashboard.notifications?.unread ?? 0} detail="Notifications that need your attention" icon={Bell} tone="bg-violet-50 text-violet-600" />
              <SummaryCard label="Attendance today" value={attendance?.checkOut ? "Complete" : attendance?.checkIn ? "Checked in" : "Not checked in"} detail={attendance?.checkIn ? `Started ${new Date(attendance.checkIn).toLocaleTimeString("en-NP", { hour: "numeric", minute: "2-digit" })}` : "Record your start time"} icon={CalendarCheck} tone="bg-emerald-50 text-emerald-600" />
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <article className="rounded-xl border border-border bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Today’s attendance</h3>
                    <p className="mt-1 text-xs text-muted">Check in when you start and check out at the end of your day.</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><CalendarCheck size={17} /></span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-slate-50/70 p-4">
                    <p className="text-[11px] font-medium text-muted">Check in</p>
                    <p className="mt-1.5 text-lg font-semibold text-slate-900">
                      {attendance?.checkIn ? new Date(attendance.checkIn).toLocaleTimeString("en-NP", { hour: "numeric", minute: "2-digit" }) : "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-slate-50/70 p-4">
                    <p className="text-[11px] font-medium text-muted">Check out</p>
                    <p className="mt-1.5 text-lg font-semibold text-slate-900">
                      {attendance?.checkOut ? new Date(attendance.checkOut).toLocaleTimeString("en-NP", { hour: "numeric", minute: "2-digit" }) : "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateAttendance("check-in")}
                    disabled={savingAttendance || Boolean(attendance?.checkIn)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check size={15} /> Check in
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAttendance("check-out")}
                    disabled={savingAttendance || !attendance?.checkIn || Boolean(attendance?.checkOut)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Clock3 size={15} /> Check out
                  </button>
                  <Link to="/workspace/attendance" className="inline-flex items-center gap-1.5 px-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                    Attendance history <ArrowRight size={14} />
                  </Link>
                </div>
              </article>

              <article className="rounded-xl border border-border bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Quick access</h3>
                    <p className="mt-1 text-xs text-muted">Personal workspaces</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><ArrowRight size={17} /></span>
                </div>
                <div className="mt-4 grid gap-2">
                  <QuickLink to="/workspace/tasks" icon={ClipboardList} label="My tasks" />
                  <QuickLink to="/workspace/leaves" icon={CalendarCheck} label="My leave requests" />
                  <QuickLink to="/workspace/payroll" icon={CreditCard} label="My payroll" />
                  <QuickLink to="/workspace/notifications" icon={Bell} label="Notifications" />
                </div>
              </article>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <article className="overflow-hidden rounded-xl border border-border bg-white shadow-sm shadow-slate-900/[0.02]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Upcoming tasks</h3>
                    <p className="mt-1 text-xs text-muted">Your next assignments</p>
                  </div>
                  <Link to="/workspace/tasks" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">All tasks <ArrowRight size={13} /></Link>
                </div>
                {dashboard.myTasks?.length ? (
                  <ul className="divide-y divide-slate-100">
                    {dashboard.myTasks.slice(0, 5).map((task) => (
                      <li key={task.id} className="flex items-center gap-3 px-5 py-3.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><ClipboardList size={16} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-slate-800">{task.title}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-muted">{task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date"}</span>
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${badgeClass(task.status)}`}>{String(task.status).replaceAll("_", " ")}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyPanel icon={ClipboardList} message="No tasks have been assigned to you." />
                )}
              </article>

              <article className="overflow-hidden rounded-xl border border-border bg-white shadow-sm shadow-slate-900/[0.02]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Recent leave</h3>
                    <p className="mt-1 text-xs text-muted">Your latest time-off requests</p>
                  </div>
                  <Link to="/workspace/leaves" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">View all <ArrowRight size={13} /></Link>
                </div>
                {dashboard.myLeaves?.length ? (
                  <ul className="divide-y divide-slate-100">
                    {dashboard.myLeaves.slice(0, 4).map((leave) => (
                      <li key={leave.id} className="flex items-center gap-3 px-5 py-3.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><CalendarCheck size={16} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-slate-800">{String(leave.leaveType).toLowerCase()} leave</span>
                          <span className="mt-0.5 block truncate text-[11px] text-muted">{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</span>
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${badgeClass(leave.status)}`}>{String(leave.status).toLowerCase()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyPanel icon={CheckCheck} message="You have no leave requests yet." />
                )}
              </article>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <article className="overflow-hidden rounded-xl border border-border bg-white shadow-sm shadow-slate-900/[0.02]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Organization notices</h3>
                    <p className="mt-1 text-xs text-muted">Current announcements</p>
                  </div>
                  <Link to="/workspace/notices" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">All notices <ArrowRight size={13} /></Link>
                </div>
                {dashboard.notices?.length ? (
                  <ul className="divide-y divide-slate-100">
                    {dashboard.notices.slice(0, 4).map((notice) => (
                      <li key={notice.id} className="flex items-start gap-3 px-5 py-4">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><Megaphone size={15} /></span>
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-semibold text-slate-800">{notice.title}</span>
                          <span className="mt-1 line-clamp-2 block text-[11px] leading-5 text-muted">{notice.message}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyPanel icon={Megaphone} message="No current notices." />
                )}
              </article>

              <article className="overflow-hidden rounded-xl border border-border bg-white shadow-sm shadow-slate-900/[0.02]">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Recent payroll</h3>
                    <p className="mt-1 text-xs text-muted">Your latest salary records</p>
                  </div>
                  <Link to="/workspace/payroll" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">View all <ArrowRight size={13} /></Link>
                </div>
                {dashboard.payrolls?.length ? (
                  <ul className="divide-y divide-slate-100">
                    {dashboard.payrolls.slice(0, 4).map((payroll) => (
                      <li key={payroll.id} className="flex items-center gap-3 px-5 py-3.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><CreditCard size={16} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold text-slate-800">{new Date(2000, Number(payroll.month) - 1).toLocaleString("en", { month: "long" })} {payroll.year}</span>
                          <span className="mt-0.5 block text-[11px] text-muted">Net salary</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-800">{formatCurrency(payroll.netSalary)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyPanel icon={CreditCard} message="Payroll details are not available yet." />
                )}
              </article>
            </section>
          </>
        ) : (
          <div className="rounded-xl border border-border bg-white px-5 py-16 text-center">
            <p className="text-sm font-semibold text-slate-800">Dashboard unavailable</p>
            <p className="mt-1 text-xs text-muted">Try again to retrieve your current information.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

const SummaryCard = ({ label, value, detail, icon: Icon, tone }) => (
  <article className="rounded-xl border border-border bg-white p-4 shadow-sm shadow-slate-900/[0.02]">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      </div>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon size={17} /></span>
    </div>
    <p className="mt-3 text-[11px] leading-5 text-slate-500">{detail}</p>
  </article>
);

const QuickLink = ({ to, icon: Icon, label }) => (
  <Link to={to} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700">
    <Icon size={15} className="text-indigo-600" />
    <span className="flex-1">{label}</span>
    <ArrowRight size={13} className="text-slate-400" />
  </Link>
);

const EmptyPanel = ({ icon: Icon, message }) => (
  <div className="flex items-center gap-3 px-5 py-8 text-xs text-muted">
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-400"><Icon size={16} /></span>
    {message}
  </div>
);

export default EmployeeDashboard;
