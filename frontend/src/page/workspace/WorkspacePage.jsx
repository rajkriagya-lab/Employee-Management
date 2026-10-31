import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  CalendarCheck,
  Check,
  CheckCheck,
  ClipboardList,
  Clock3,
  CreditCard,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import Layout from "../../components/layout/owner/layout";
import { getStoredUser } from "../../utils/auth";
import { canManagePeople, canManageRecords } from "../../utils/navigation";

const moduleDetails = {
  attendance: {
    title: "Attendance",
    description: "Daily attendance and time records for your organization.",
    endpoint: "attendance",
    personalEndpoint: "attendance/my",
    responseKey: "attendance",
    icon: CalendarCheck,
    emptyTitle: "No attendance records",
    emptyDescription: "Attendance records will appear here when they are recorded.",
  },
  leaves: {
    title: "Leave management",
    description: "Review leave requests and keep time-off records up to date.",
    endpoint: "leaves",
    personalEndpoint: "leaves/my",
    responseKey: "leaves",
    icon: CalendarCheck,
    emptyTitle: "No leave requests",
    emptyDescription: "There are no leave requests to show yet.",
  },
  tasks: {
    title: "Tasks",
    description: "Track assignments, priorities, and due dates across the team.",
    endpoint: "tasks",
    personalEndpoint: "tasks/my",
    responseKey: "tasks",
    icon: ClipboardList,
    emptyTitle: "No tasks yet",
    emptyDescription: "Tasks assigned to your team will appear here.",
  },
  notices: {
    title: "Notices",
    description: "Organization announcements and important updates.",
    endpoint: "notices",
    personalEndpoint: "notices/active",
    responseKey: "notices",
    icon: Megaphone,
    emptyTitle: "No notices published",
    emptyDescription: "Published announcements will appear here.",
  },
  payroll: {
    title: "Payroll",
    description: "Salary records and payroll history.",
    endpoint: "payroll",
    personalEndpoint: "payroll/my",
    responseKey: "payrolls",
    icon: CreditCard,
    emptyTitle: "No payroll records",
    emptyDescription: "Payroll records will appear here when they are created.",
  },
  notifications: {
    title: "Notifications",
    description: "Updates and activity related to your account.",
    endpoint: "notifications",
    personalEndpoint: "notifications",
    responseKey: "notifications",
    icon: Bell,
    emptyTitle: "You're all caught up",
    emptyDescription: "New updates will appear here.",
  },
};

const fieldClass =
  "mt-1.5 block w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50";

const todayISO = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const pretty = (value) =>
  String(value || "—")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) return "—";
  const datePart = String(value).slice(0, 10);
  const parts = datePart.split("-").map(Number);
  const date =
    parts.length === 3 && parts.every(Number.isFinite)
      ? new Date(parts[0], parts[1] - 1, parts[2])
      : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-NP", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString("en-NP", { hour: "numeric", minute: "2-digit" });
};

const formatCurrency = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `रू ${amount.toLocaleString("en-NP", { maximumFractionDigits: 2 })}`
    : "—";
};

const employeeName = (record) =>
  record?.employee?.user?.name ||
  record?.user?.name ||
  record?.employeeName ||
  "Employee";

const statusClass = (status) => {
  const normalized = String(status || "").toUpperCase();
  if (["APPROVED", "PRESENT", "COMPLETED", "ACTIVE", "READ"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
  }
  if (["PENDING", "LATE", "IN_PROGRESS", "HIGH"].includes(normalized)) {
    return "bg-amber-50 text-amber-700 ring-amber-600/10";
  }
  if (["REJECTED", "ABSENT", "CANCELLED", "URGENT", "INACTIVE"].includes(normalized)) {
    return "bg-rose-50 text-rose-700 ring-rose-600/10";
  }
  return "bg-slate-100 text-slate-600 ring-slate-500/10";
};

const StatusBadge = ({ value }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusClass(value)}`}
  >
    {pretty(value)}
  </span>
);

const initialForm = (module) => {
  if (module === "attendance") {
    return { employeeId: "", date: todayISO(), status: "PRESENT", remarks: "" };
  }
  if (module === "tasks") {
    return {
      title: "",
      description: "",
      employeeId: "",
      priority: "MEDIUM",
      dueDate: "",
    };
  }
  if (module === "notices") {
    return { title: "", message: "", priority: "NORMAL", expiresAt: "" };
  }
  if (module === "payroll") {
    return {
      employeeId: "",
      month: String(new Date().getMonth() + 1),
      year: String(new Date().getFullYear()),
      basicSalary: "",
      allowances: "0",
      deductions: "0",
      overtime: "0",
      bonus: "0",
      tax: "0",
      remarks: "",
    };
  }
  if (module === "leaves") {
    return { startDate: "", endDate: "", leaveType: "CASUAL", reason: "" };
  }
  return {};
};

const ResourceForm = ({
  module,
  initialValues,
  employees,
  saving,
  error,
  onClose,
  onSubmit,
}) => {
  const [values, setValues] = useState(
    () => initialValues || initialForm(module)
  );
  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };
  const field = (name, label, props = {}) => (
    <label key={name} className="block text-xs font-medium text-slate-600">
      {label}
      <input
        name={name}
        value={values[name] ?? ""}
        onChange={update}
        className={fieldClass}
        {...props}
      />
    </label>
  );
  const select = (name, label, options) => (
    <label key={name} className="block text-xs font-medium text-slate-600">
      {label}
      <select
        name={name}
        value={values[name] ?? ""}
        onChange={update}
        className={fieldClass}
        required
      >
        {options.map(([value, optionLabel]) => (
          <option value={value} key={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
  const employeeSelect = (
    <label className="block text-xs font-medium text-slate-600">
      Employee
      <select
        name="employeeId"
        value={values.employeeId ?? ""}
        onChange={update}
        className={fieldClass}
        required
      >
        <option value="">Select an employee</option>
        {employees.map((employee) => (
          <option value={employee.employee?.id} key={employee.employee?.id}>
            {employee.name}
          </option>
        ))}
      </select>
    </label>
  );

  const title =
    module === "attendance"
      ? "Record attendance"
      : module === "tasks"
        ? "Create a task"
        : module === "notices"
          ? initialValues ? "Edit notice" : "Publish a notice"
          : module === "payroll"
            ? "Create payroll record"
            : "Request time off";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-form-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="workspace-form-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-1 text-xs text-muted">
              Required fields are marked by the browser.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close form"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(values);
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {module === "attendance" && (
              <>
                {employeeSelect}
                {field("date", "Date", { type: "date", required: true })}
                {select("status", "Attendance status", [
                  ["PRESENT", "Present"],
                  ["ABSENT", "Absent"],
                  ["LATE", "Late"],
                  ["HALF_DAY", "Half day"],
                  ["LEAVE", "On leave"],
                ])}
              </>
            )}
            {module === "tasks" && (
              <>
                {field("title", "Task title", { required: true, maxLength: 150 })}
                {employeeSelect}
                {select("priority", "Priority", [
                  ["LOW", "Low"],
                  ["MEDIUM", "Medium"],
                  ["HIGH", "High"],
                  ["URGENT", "Urgent"],
                ])}
                {field("dueDate", "Due date", { type: "date" })}
                <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
                  Description
                  <textarea
                    name="description"
                    value={values.description || ""}
                    onChange={update}
                    rows={3}
                    maxLength={2000}
                    className={fieldClass}
                  />
                </label>
              </>
            )}
            {module === "notices" && (
              <>
                {field("title", "Title", { required: true, maxLength: 150 })}
                {select("priority", "Priority", [
                  ["LOW", "Low"],
                  ["NORMAL", "Normal"],
                  ["HIGH", "High"],
                  ["URGENT", "Urgent"],
                ])}
                <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
                  Announcement
                  <textarea
                    name="message"
                    value={values.message || ""}
                    onChange={update}
                    rows={5}
                    required
                    maxLength={5000}
                    className={fieldClass}
                  />
                </label>
                {field("expiresAt", "Expires on (optional)", { type: "date" })}
              </>
            )}
            {module === "payroll" && (
              <>
                {employeeSelect}
                {select(
                  "month",
                  "Pay period month",
                  Array.from({ length: 12 }, (_, index) => {
                    const month = String(index + 1);
                    return [
                      month,
                      new Date(2000, index).toLocaleString("en", { month: "long" }),
                    ];
                  })
                )}
                {field("year", "Year", {
                  type: "number",
                  min: 2000,
                  max: 9999,
                  required: true,
                })}
                {field("basicSalary", "Basic salary", {
                  type: "number",
                  min: 0,
                  step: "0.01",
                  required: true,
                })}
                {field("allowances", "Allowances", { type: "number", min: 0, step: "0.01" })}
                {field("overtime", "Overtime", { type: "number", min: 0, step: "0.01" })}
                {field("bonus", "Bonus", { type: "number", min: 0, step: "0.01" })}
                {field("deductions", "Deductions", { type: "number", min: 0, step: "0.01" })}
                {field("tax", "Tax", { type: "number", min: 0, step: "0.01" })}
                <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
                  Remarks
                  <textarea
                    name="remarks"
                    value={values.remarks || ""}
                    onChange={update}
                    rows={2}
                    maxLength={500}
                    className={fieldClass}
                  />
                </label>
              </>
            )}
            {module === "leaves" && (
              <>
                {field("startDate", "Start date", { type: "date", required: true })}
                {field("endDate", "End date", { type: "date", required: true })}
                {select("leaveType", "Leave type", [
                  ["CASUAL", "Casual"],
                  ["SICK", "Sick"],
                  ["ANNUAL", "Annual"],
                  ["MATERNITY", "Maternity"],
                  ["PATERNITY", "Paternity"],
                  ["UNPAID", "Unpaid"],
                  ["OTHER", "Other"],
                ])}
                <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
                  Reason
                  <textarea
                    name="reason"
                    value={values.reason || ""}
                    onChange={update}
                    rows={3}
                    maxLength={1000}
                    className={fieldClass}
                  />
                </label>
              </>
            )}
            {module === "attendance" && (
              <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
                Remarks
                <input
                  name="remarks"
                  value={values.remarks || ""}
                  onChange={update}
                  maxLength={500}
                  className={fieldClass}
                />
              </label>
            )}
          </div>
          {error && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              {error}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (["attendance", "tasks", "payroll"].includes(module) && !employees.length)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <RefreshCw size={15} className="animate-spin" /> : <Check size={15} />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

const WorkspacePage = () => {
  const { module = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "ALL";
  const details = moduleDetails[module];
  const user = getStoredUser();
  const role = user?.role || "EMPLOYEE";
  const isManager = canManageRecords(role);
  const isAdmin = canManagePeople(role);
  const personal = role === "EMPLOYEE";
  const endpoint = details
    ? personal
      ? details.personalEndpoint
      : details.endpoint
    : "";
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [recordDate, setRecordDate] = useState(todayISO());
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [rejectingLeave, setRejectingLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState("");

  const loadRecords = useCallback(async () => {
    if (!details) {
      setLoading(false);
      setRecords([]);
      return;
    }

    try {
      setLoading(true);
      setActionError("");
      const params =
        module === "attendance" && !personal && recordDate
          ? { date: recordDate }
          : undefined;
      const { data } = await api.get(`/${endpoint}`, { params });
      if (!data?.success) {
        throw new Error(data?.message || `Unable to load ${details.title.toLowerCase()}.`);
      }
      const result = data[details.responseKey];
      if (!Array.isArray(result)) {
        throw new Error(`The ${details.title.toLowerCase()} response was invalid.`);
      }
      setRecords(result);
    } catch (error) {
      setRecords([]);
      setActionError(
        error.response?.data?.message ||
          error.message ||
          `Unable to load ${details.title.toLowerCase()}.`
      );
    } finally {
      setLoading(false);
    }
  }, [details, endpoint, module, personal, recordDate]);

  useEffect(() => {
    void Promise.resolve().then(loadRecords);
  }, [loadRecords]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openForm = async (notice = null) => {
    setFormError("");
    setEditingNotice(notice);
    if (["attendance", "tasks", "payroll"].includes(module)) {
      try {
        const { data } = await api.get("/employees");
        if (!data?.success || !Array.isArray(data.employees)) {
          throw new Error(data?.message || "Unable to load employees.");
        }
        setEmployees(data.employees.filter((employee) => employee.isActive !== false));
      } catch (error) {
        setFormError(
          error.response?.data?.message ||
            error.message ||
            "Unable to load employees."
        );
        setEmployees([]);
      }
    }
    setShowForm(true);
  };

  const submitForm = async (values) => {
    setSaving(true);
    setFormError("");
    try {
      let payload = values;
      if (module === "attendance") {
        payload = {
          ...values,
          employeeId: Number(values.employeeId),
          date: new Date(`${values.date}T12:00:00`).toISOString(),
        };
      } else if (module === "tasks") {
        payload = {
          ...values,
          employeeId: Number(values.employeeId),
          dueDate: values.dueDate || null,
        };
      } else if (module === "notices") {
        payload = { ...values, expiresAt: values.expiresAt || null };
      } else if (module === "payroll") {
        payload = {
          ...values,
          employeeId: Number(values.employeeId),
          month: Number(values.month),
          year: Number(values.year),
          basicSalary: Number(values.basicSalary),
          allowances: Number(values.allowances || 0),
          deductions: Number(values.deductions || 0),
          overtime: Number(values.overtime || 0),
          bonus: Number(values.bonus || 0),
          tax: Number(values.tax || 0),
        };
      }

      const { data } = await api.post(`/${endpoint}`, payload);
      if (!data?.success) {
        throw new Error(data?.message || "Unable to save this record.");
      }
      setShowForm(false);
      setEditingNotice(null);
      setToast(data.message || "Saved successfully.");
      await loadRecords();
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          error.message ||
          "Unable to save this record."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (record, status) => {
    try {
      setActionError("");
      const url =
        module === "leaves"
          ? `/${endpoint}/${record.id}/${status === "APPROVED" ? "approve" : "reject"}`
          : module === "tasks"
            ? `/${endpoint}/${record.id}/status`
            : `/${endpoint}/${record.id}/read`;
      const body =
        module === "tasks"
          ? { status }
          : module === "leaves" && status === "REJECTED"
            ? { rejectionReason }
            : undefined;
      const { data } = await api.patch(url, body);
      if (!data?.success) {
        throw new Error(data?.message || "Unable to update this record.");
      }
      setRejectingLeave(null);
      setRejectionReason("");
      setToast(data.message || "Updated successfully.");
      await loadRecords();
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          error.message ||
          "Unable to update this record."
      );
    }
  };

  const updateAttendance = async (action) => {
    setSaving(true);
    setActionError("");
    try {
      const { data } = await api.post(`/attendance/${action}`);
      if (!data?.success) {
        throw new Error(data?.message || "Unable to update attendance.");
      }
      setToast(data.message || "Attendance recorded.");
      await loadRecords();
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          error.message ||
          "Unable to update attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async () => {
    if (!pendingDelete) return;
    try {
      setSaving(true);
      const { data } = await api.delete(`/${endpoint}/${pendingDelete.id}`);
      if (!data?.success) {
        throw new Error(data?.message || "Unable to delete this record.");
      }
      setPendingDelete(null);
      setToast(data.message || "Deleted successfully.");
      await loadRecords();
    } catch (error) {
      setActionError(
        error.response?.data?.message ||
          error.message ||
          "Unable to delete this record."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredRecords = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return records.filter((record) => {
      const searchable = [
        employeeName(record),
        record.title,
        record.message,
        record.description,
        record.reason,
        record.leaveType,
        record.status,
        record.priority,
        record.department?.name,
        record.employee?.department?.name,
        record.employee?.position,
        record.type,
        record.remarks,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!needle || searchable.includes(needle)) &&
        (statusFilter === "ALL" ||
          (module === "notifications"
            ? String(record.isRead) === statusFilter
            : record.status === statusFilter))
      );
    });
  }, [module, records, search, statusFilter]);

  const attendanceCounts = useMemo(
    () =>
      records.reduce(
        (counts, record) => ({
          ...counts,
          [record.status]: (counts[record.status] || 0) + 1,
        }),
        {}
      ),
    [records]
  );
  const summaryCards = (() => {
    if (module === "attendance") {
      return [
        ["Records", records.length, CalendarCheck, "text-indigo-600", "bg-indigo-50"],
        ["Present", attendanceCounts.PRESENT || 0, CheckCheck, "text-emerald-600", "bg-emerald-50"],
        ["Late", attendanceCounts.LATE || 0, Clock3, "text-amber-600", "bg-amber-50"],
        ["Absent / leave", (attendanceCounts.ABSENT || 0) + (attendanceCounts.LEAVE || 0), Users, "text-rose-600", "bg-rose-50"],
      ];
    }
    if (module === "leaves") {
      return ["PENDING", "APPROVED", "REJECTED"].map((status) => [
        pretty(status),
        records.filter((record) => record.status === status).length,
        CalendarCheck,
        statusClass(status).split(" ")[1],
        statusClass(status).split(" ")[0],
      ]);
    }
    if (module === "tasks") {
      return ["TODO", "IN_PROGRESS", "COMPLETED"].map((status) => [
        pretty(status),
        records.filter((record) => record.status === status).length,
        ClipboardList,
        "text-indigo-600",
        "bg-indigo-50",
      ]);
    }
    if (module === "payroll") {
      return [
        ["Records", records.length, CreditCard, "text-indigo-600", "bg-indigo-50"],
        ["Net total", formatCurrency(records.reduce((sum, item) => sum + Number(item.netSalary || 0), 0)), WalletIcon, "text-emerald-600", "bg-emerald-50"],
      ];
    }
    if (module === "notifications") {
      return [
        ["Total", records.length, Bell, "text-indigo-600", "bg-indigo-50"],
        ["Unread", records.filter((record) => !record.isRead).length, Bell, "text-amber-600", "bg-amber-50"],
      ];
    }
    return [
      ["Published", records.length, Megaphone, "text-indigo-600", "bg-indigo-50"],
      ["High priority", records.filter((record) => ["HIGH", "URGENT"].includes(record.priority)).length, AlertCircle, "text-amber-600", "bg-amber-50"],
    ];
  })();

  if (!details) {
    return (
      <Layout>
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Page not found</h2>
          <p className="mt-2 text-sm text-muted">This workspace page is not available.</p>
        </div>
      </Layout>
    );
  }

  const Icon = details.icon;
  const canCreate =
    (module === "leaves" && personal) ||
    (module === "attendance" && isManager) ||
    (["tasks", "notices", "payroll"].includes(module) && isManager);
  const canEditNotices = module === "notices" && isManager;
  const canDelete =
    (module === "notices" || module === "payroll") && isAdmin;

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon size={20} />
              </span>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  {details.title}
                </h2>
                <p className="mt-1 text-sm text-muted">{details.description}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {module === "attendance" && personal && (
              <>
                <button
                  type="button"
                  onClick={() => updateAttendance("check-in")}
                  disabled={saving || records.some((item) => item.date?.slice(0, 10) === todayISO() && item.checkIn)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={16} /> Check in
                </button>
                <button
                  type="button"
                  onClick={() => updateAttendance("check-out")}
                  disabled={saving || !records.some((item) => item.date?.slice(0, 10) === todayISO() && item.checkIn && !item.checkOut)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Clock3 size={16} /> Check out
                </button>
              </>
            )}
            {canCreate && (
              <button
                type="button"
                onClick={() => openForm()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-indigo-600"
              >
                <Plus size={16} />
                {module === "leaves"
                  ? "Request leave"
                  : module === "attendance"
                    ? "Record attendance"
                    : module === "tasks"
                      ? "New task"
                      : module === "payroll"
                        ? "Create payroll"
                        : "Publish notice"}
              </button>
            )}
            <button
              type="button"
              onClick={loadRecords}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {toast && (
          <div role="status" className="fixed right-4 top-20 z-[120] flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg">
            <CheckCheck size={16} />
            {toast}
          </div>
        )}
        {actionError && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p className="min-w-0 flex-1">{actionError}</p>
            <button type="button" onClick={() => setActionError("")} aria-label="Dismiss error" className="rounded p-1 hover:bg-rose-100">
              <X size={15} />
            </button>
          </div>
        )}

        <section className={`grid gap-3 sm:grid-cols-2 ${summaryCards.length > 2 ? "xl:grid-cols-4" : ""}`}>
          {summaryCards.map(([label, value, CardIcon, iconColor, iconBackground]) => (
            <article key={label} className="rounded-xl border border-border bg-white p-4 shadow-sm shadow-slate-900/[0.02]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-muted">{label}</p>
                  <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
                </div>
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBackground} ${iconColor}`}>
                  <CardIcon size={17} />
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-white shadow-sm shadow-slate-900/[0.02]">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">All {details.title.toLowerCase()}</h3>
              <p className="mt-1 text-xs text-muted">
                {loading ? "Loading records…" : `${filteredRecords.length} record${filteredRecords.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {module === "attendance" && !personal && (
                <label className="sr-only" htmlFor="attendance-date">Filter by date</label>
              )}
              {module === "attendance" && !personal && (
                <input
                  id="attendance-date"
                  type="date"
                  value={recordDate}
                  onChange={(event) => setRecordDate(event.target.value)}
                  className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              )}
              {module !== "notices" && module !== "payroll" && (
                <label className="sr-only" htmlFor="record-status">Filter by status</label>
              )}
              {["attendance", "leaves", "tasks", "notifications"].includes(module) && (
                <select
                  id="record-status"
                  value={statusFilter}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSearchParams((current) => {
                      const next = new URLSearchParams(current);
                      if (value === "ALL") next.delete("status");
                      else next.set("status", value);
                      return next;
                    });
                  }}
                  className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="ALL">All statuses</option>
                  {(module === "attendance"
                    ? ["PRESENT", "ABSENT", "LATE", "HALF_DAY", "LEAVE"]
                    : module === "leaves"
                      ? ["PENDING", "APPROVED", "REJECTED", "CANCELLED"]
                      : module === "tasks"
                        ? ["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
                        : ["false", "true"]
                  ).map((status) => (
                    <option key={status} value={status}>
                      {module === "notifications"
                        ? status === "false" ? "Unread" : "Read"
                        : pretty(status)}
                    </option>
                  ))}
                </select>
              )}
              <label className="relative block min-w-0 sm:w-64">
                <span className="sr-only">Search records</span>
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${details.title.toLowerCase()}…`}
                  className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-5" aria-label="Loading records">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-12 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : actionError && records.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <AlertCircle size={25} className="mx-auto text-rose-500" />
              <p className="mt-3 text-sm font-semibold text-slate-800">Couldn’t load these records</p>
              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted">{actionError}</p>
              <button type="button" onClick={loadRecords} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Icon size={20} />
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-800">
                {records.length ? "No matching records" : details.emptyTitle}
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted">
                {records.length ? "Try changing the search or status filter." : details.emptyDescription}
              </p>
              {canCreate && records.length === 0 && (
                <button type="button" onClick={() => openForm()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
                  <Plus size={14} /> Add the first record
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-slate-50/80">
                  <tr>
                    {tableHeaders(module).map((header) => (
                      <th key={header} scope="col" className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                        {header}
                      </th>
                    ))}
                    <th scope="col" className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="transition hover:bg-slate-50/70">
                      {tableCells(module, record, { isManager, personal }).map((cell, index) => (
                        <td key={`${record.id}-${index}`} className="max-w-64 px-5 py-3.5 text-xs text-slate-600">
                          {cell}
                        </td>
                      ))}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {module === "leaves" && !personal && record.status === "PENDING" && (
                            <>
                              <button type="button" onClick={() => updateStatus(record, "APPROVED")} className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50">
                                Approve
                              </button>
                              <button type="button" onClick={() => setRejectingLeave(record)} className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50">
                                Reject
                              </button>
                            </>
                          )}
                          {module === "tasks" && (
                            <select
                              aria-label={`Update status for ${record.title}`}
                              value={record.status}
                              onChange={(event) => updateStatus(record, event.target.value)}
                              className="max-w-36 rounded-md border border-border bg-white px-2 py-1.5 text-[11px] text-slate-600"
                            >
                              {["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
                                <option key={status} value={status}>{pretty(status)}</option>
                              ))}
                            </select>
                          )}
                          {module === "notices" && canEditNotices && (
                            <button type="button" onClick={() => openForm(record)} className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-50">
                              Edit
                            </button>
                          )}
                          {module === "notifications" && !record.isRead && (
                            <button type="button" onClick={() => updateStatus(record, "READ")} className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-50">
                              Mark read
                            </button>
                          )}
                          {module === "notifications" && (
                            <button
                              type="button"
                              onClick={() => setPendingDelete(record)}
                              aria-label="Delete notification"
                              className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button type="button" onClick={() => setPendingDelete(record)} aria-label={`Delete ${details.title.toLowerCase()} record`} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {module === "notifications" && records.some((record) => !record.isRead) && (
            <div className="flex justify-end border-t border-border px-5 py-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const { data } = await api.patch("/notifications/read-all");
                    if (!data?.success) throw new Error(data?.message || "Could not mark notifications read.");
                    setToast(data.message || "All notifications marked read.");
                    await loadRecords();
                  } catch (error) {
                    setActionError(error.response?.data?.message || error.message || "Could not update notifications.");
                  }
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <CheckCheck size={15} /> Mark all as read
              </button>
            </div>
          )}
        </section>

        {showForm && (
          <ResourceForm
            key={`${module}-${editingNotice?.id || "new"}`}
            module={module}
            initialValues={editingNotice || undefined}
            employees={employees}
            saving={saving}
            error={formError}
            onClose={() => {
              setShowForm(false);
              setEditingNotice(null);
            }}
            onSubmit={async (values) => {
              if (module !== "notices" || !editingNotice) {
                await submitForm(values);
                return;
              }
              setSaving(true);
              setFormError("");
              try {
                const { data } = await api.put(`/notices/${editingNotice.id}`, {
                  ...values,
                  expiresAt: values.expiresAt || null,
                });
                if (!data?.success) throw new Error(data?.message || "Unable to update notice.");
                setShowForm(false);
                setEditingNotice(null);
                setToast(data.message || "Notice updated.");
                await loadRecords();
              } catch (error) {
                setFormError(error.response?.data?.message || error.message || "Unable to update notice.");
              } finally {
                setSaving(false);
              }
            }}
          />
        )}

        {rejectingLeave && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <section role="dialog" aria-modal="true" aria-labelledby="reject-leave-title" className="w-full max-w-md rounded-xl border border-border bg-white p-5 shadow-2xl">
              <h2 id="reject-leave-title" className="text-base font-semibold text-slate-900">Reject leave request</h2>
              <p className="mt-1 text-xs text-muted">Add an optional reason for {employeeName(rejectingLeave)}.</p>
              <label className="mt-4 block text-xs font-medium text-slate-600">
                Rejection reason
                <textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} rows={3} maxLength={500} className={fieldClass} />
              </label>
              {actionError && <p role="alert" className="mt-3 text-xs text-rose-600">{actionError}</p>}
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setRejectingLeave(null)} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="button" onClick={() => updateStatus(rejectingLeave, "REJECTED")} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700">Reject request</button>
              </div>
            </section>
          </div>
        )}

        {pendingDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <section role="alertdialog" aria-modal="true" aria-labelledby="delete-record-title" className="w-full max-w-sm rounded-xl border border-border bg-white p-5 shadow-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600"><Trash2 size={18} /></div>
              <h2 id="delete-record-title" className="mt-4 text-base font-semibold text-slate-900">Delete this record?</h2>
              <p className="mt-1 text-sm leading-5 text-muted">This action cannot be undone.</p>
              {actionError && <p role="alert" className="mt-3 text-xs text-rose-600">{actionError}</p>}
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setPendingDelete(null)} disabled={saving} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="button" onClick={module === "notifications" ? async () => {
                  try {
                    setSaving(true);
                    const { data } = await api.delete(`/notifications/${pendingDelete.id}`);
                    if (!data?.success) throw new Error(data?.message || "Unable to delete notification.");
                    setPendingDelete(null);
                    setToast(data.message || "Notification deleted.");
                    await loadRecords();
                  } catch (error) {
                    setActionError(error.response?.data?.message || error.message || "Unable to delete notification.");
                  } finally {
                    setSaving(false);
                  }
                } : deleteRecord} disabled={saving} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
                  {saving ? "Deleting…" : "Delete"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
};

const tableHeaders = (module) => {
  const headers = {
    attendance: ["Employee", "Department", "Date", "Check in", "Check out", "Status"],
    leaves: ["Employee", "Leave type", "Dates", "Reason", "Status"],
    tasks: ["Task", "Assignee", "Due date", "Priority", "Status"],
    notices: ["Announcement", "Priority", "Published by", "Expires"],
    payroll: ["Employee", "Period", "Basic salary", "Gross", "Net salary"],
    notifications: ["Update", "Type", "Received", "Status"],
  };
  return headers[module] || ["Record"];
};

const tableCells = (module, record, { personal }) => {
  if (module === "attendance") {
    return [
      <span className="font-medium text-slate-800">{employeeName(record)}</span>,
      record.employee?.department?.name || "Unassigned",
      formatDate(record.date),
      formatTime(record.checkIn),
      formatTime(record.checkOut),
      <StatusBadge value={record.status} />,
    ];
  }
  if (module === "leaves") {
    return [
      <span>
        <span className="block font-medium text-slate-800">{employeeName(record)}</span>
        <span className="mt-0.5 block text-[10px] text-muted">{record.employee?.user?.email}</span>
      </span>,
      pretty(record.leaveType),
      <span>{formatDate(record.startDate)} – {formatDate(record.endDate)}</span>,
      <span className="block max-w-52 truncate" title={record.reason || ""}>{record.reason || "—"}</span>,
      <StatusBadge value={record.status} />,
    ];
  }
  if (module === "tasks") {
    return [
      <span>
        <span className="block font-medium text-slate-800">{record.title}</span>
        <span className="mt-0.5 block max-w-64 truncate text-[10px] text-muted">{record.description || "No description"}</span>
      </span>,
      personal ? "Assigned to you" : employeeName(record),
      formatDate(record.dueDate),
      <StatusBadge value={record.priority} />,
      <StatusBadge value={record.status} />,
    ];
  }
  if (module === "notices") {
    return [
      <span>
        <span className="block font-medium text-slate-800">{record.title}</span>
        <span className="mt-0.5 block max-w-72 truncate text-[10px] text-muted">{record.message}</span>
      </span>,
      <StatusBadge value={record.priority} />,
      record.createdByUser?.name || "Management",
      formatDate(record.expiresAt),
    ];
  }
  if (module === "payroll") {
    return [
      personal ? "My payroll" : employeeName(record),
      `${new Date(2000, Number(record.month) - 1).toLocaleString("en", { month: "short" })} ${record.year}`,
      formatCurrency(record.basicSalary),
      formatCurrency(record.grossSalary),
      <span className="font-semibold text-slate-800">{formatCurrency(record.netSalary)}</span>,
    ];
  }
  if (module === "notifications") {
    return [
      <span>
        <span className="block font-medium text-slate-800">{record.title}</span>
        <span className="mt-0.5 block max-w-80 truncate text-[10px] text-muted">{record.message}</span>
      </span>,
      pretty(record.type),
      formatDate(record.createdAt),
      <StatusBadge value={record.isRead ? "READ" : "UNREAD"} />,
    ];
  }
  return [];
};

const WalletIcon = CreditCard;

export default WorkspacePage;
