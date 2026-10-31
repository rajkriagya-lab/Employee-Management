import { Building2, CalendarCheck, Check, ClipboardList, Users } from "lucide-react";

const AuthLayout = ({ children, eyebrow, title, description }) => (
  <main className="min-h-screen bg-white">
    <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="pointer-events-none absolute -right-36 -top-32 h-[440px] w-[440px] rounded-full border border-white/[0.08]" />
        <div className="pointer-events-none absolute -right-16 -top-12 h-[280px] w-[280px] rounded-full border border-white/[0.08]" />
        <div className="pointer-events-none absolute -bottom-48 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">
            <Building2 size={20} />
          </span>
          <span>
            <span className="block text-base font-semibold tracking-tight">BizFlow</span>
            <span className="mt-0.5 block text-[11px] text-slate-400">People operations</span>
          </span>
        </div>

        <div className="relative max-w-xl py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Employee management, made clear
          </span>
          <h1 className="mt-6 max-w-lg text-4xl font-semibold leading-[1.14] tracking-tight xl:text-5xl">
            Better people operations start with a clearer picture.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
            Bring employee records, attendance, time off, tasks, and team updates into one thoughtful workspace.
          </p>

          <div className="mt-9 grid max-w-md gap-3 sm:grid-cols-2">
            <Feature icon={Users} label="Employee directory" />
            <Feature icon={CalendarCheck} label="Attendance & leave" />
            <Feature icon={ClipboardList} label="Tasks & progress" />
            <Feature icon={Check} label="Role-aware access" />
          </div>
        </div>

        <p className="relative text-[11px] text-slate-500">
          Secure access for your organization
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-slate-50/70 px-4 py-10 sm:px-8 lg:bg-white">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Building2 size={20} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-900">BizFlow</span>
              <span className="mt-0.5 block text-[11px] text-muted">People operations</span>
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.06)] sm:p-9 lg:border-0 lg:p-0 lg:shadow-none">
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">{eyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </div>
            {children}
          </div>
          <p className="mt-7 text-center text-[11px] text-slate-400">
            By continuing, you agree to follow your organization’s access policies.
          </p>
        </div>
      </section>
    </div>
  </main>
);

const Feature = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-3">
    <Icon size={16} className="text-indigo-300" />
    <span className="text-xs text-slate-200">{label}</span>
  </div>
);

export default AuthLayout;
