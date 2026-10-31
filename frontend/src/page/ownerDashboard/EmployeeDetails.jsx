import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import Layout from "../../components/layout/owner/layout";

const formatDate = (value) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not provided"
    : date.toLocaleDateString("en-NP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

const formatSalary = (value) => {
  if (value === null || value === undefined || value === "") return "Not provided";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `रू ${amount.toLocaleString("en-NP", { maximumFractionDigits: 2 })}`
    : "Not provided";
};

const EmployeeDetails = () => {
  const { id } = useParams();
  const [requestState, setRequestState] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchEmployee = async () => {
      try {
        const { data } = await api.get(`/employees/${id}`);
        if (!data?.success || !data.employee) {
          throw new Error(data?.message || "Unable to load employee details.");
        }
        if (active) {
          setRequestState({ id, employee: data.employee, error: "" });
        }
      } catch (requestError) {
        if (active) {
          setRequestState({
            id,
            employee: null,
            error:
              requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load employee details.",
          });
        }
      }
    };

    void fetchEmployee();
    return () => {
      active = false;
    };
  }, [id, retryCount]);

  const loadEmployee = useCallback(() => {
    setRequestState(null);
    setRetryCount((current) => current + 1);
  }, []);

  const currentRequest = requestState?.id === id ? requestState : null;
  const loading = !currentRequest;
  const error = currentRequest?.error || "";
  const employee = currentRequest?.employee;
  const profile = employee?.employee;
  const initials = (employee?.name || "Employee")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <Layout>
      <div className="space-y-5">
        <Link
          to="/owner/employees"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-indigo-700"
        >
          <ArrowLeft size={15} /> Back to employees
        </Link>

        {loading ? (
          <div className="space-y-4" aria-label="Loading employee profile">
            <div className="h-36 animate-pulse rounded-xl border border-border bg-white" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-48 animate-pulse rounded-xl border border-border bg-white" />
              <div className="h-48 animate-pulse rounded-xl border border-border bg-white" />
            </div>
          </div>
        ) : error ? (
          <div role="alert" className="rounded-xl border border-rose-200 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-slate-900">Unable to load employee</p>
            <p className="mt-1 text-sm text-muted">{error}</p>
            <button type="button" onClick={loadEmployee} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        ) : employee ? (
          <>
            <section className="flex flex-col gap-5 rounded-xl border border-border bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:flex-row sm:items-center sm:p-7">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-lg font-semibold text-indigo-700">
                {initials || "U"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                    {employee.name || "Employee"}
                  </h1>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${employee.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {employee.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {profile?.position || "Position not provided"}
                  {profile?.department?.name ? ` · ${profile.department.name}` : ""}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Employee ID {profile?.id ?? employee.id}
                </p>
              </div>
              <Link
                to="/owner/employees"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <UserRound size={15} /> Employee directory
              </Link>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <ProfileCard title="Contact information">
                <ProfileField icon={Mail} label="Work email" value={employee.email} />
                <ProfileField icon={Phone} label="Phone" value={profile?.phone} />
                <ProfileField icon={MapPin} label="Address" value={profile?.address} />
              </ProfileCard>
              <ProfileCard title="Employment details">
                <ProfileField icon={BriefcaseBusiness} label="Position" value={profile?.position} />
                <ProfileField icon={UserRound} label="Department" value={profile?.department?.name} />
                <ProfileField icon={CalendarDays} label="Joined" value={formatDate(profile?.joiningDate)} />
                <ProfileField icon={CalendarDays} label="Account created" value={formatDate(employee.createdAt)} />
                <ProfileField icon={BriefcaseBusiness} label="Salary" value={formatSalary(profile?.salary)} />
              </ProfileCard>
            </section>
          </>
        ) : null}
      </div>
    </Layout>
  );
};

const ProfileCard = ({ title, children }) => (
  <section className="rounded-xl border border-border bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
    <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
    <div className="mt-4 divide-y divide-slate-100">{children}</div>
  </section>
);

const ProfileField = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
    <span className="mt-0.5 text-slate-400"><Icon size={15} /></span>
    <span className="min-w-0 flex-1">
      <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <span className="mt-1 block break-words text-xs font-medium text-slate-700">{value || "Not provided"}</span>
    </span>
  </div>
);

export default EmployeeDetails;
