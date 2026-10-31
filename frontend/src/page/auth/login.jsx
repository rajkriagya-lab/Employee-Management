import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/authLayout";
import api from "../../api/axios";
import { clearStoredAuth } from "../../utils/auth";

const fieldClass =
  "block h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = ({ target: { name, value } }) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = formData.email.trim();
    if (!email || !formData.password) {
      setError("Enter your email address and password to continue.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/auth/login", {
        email,
        password: formData.password,
      });
      if (!data?.success || !data.token || !data.user?.role) {
        throw new Error(data?.message || "The sign-in response was incomplete.");
      }

      const allowedRoles = ["OWNER", "ADMIN", "MANAGER", "EMPLOYEE"];
      if (!allowedRoles.includes(data.user.role)) {
        throw new Error("Your account does not have an application role.");
      }

      clearStoredAuth();
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", data.token);
      storage.setItem("user", JSON.stringify(data.user));
      navigate(
        data.user.role === "EMPLOYEE" ? "/employee/dashboard" : "/owner/dashboard",
        { replace: true }
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to sign in. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to BizFlow"
      description="Use your work email and password to access your organization workspace."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-xs font-medium text-slate-700" htmlFor="email">
          Work email
          <span className="relative mt-1.5 block">
            <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
              className={fieldClass}
              placeholder="name@company.com"
            />
          </span>
        </label>

        <label className="block text-xs font-medium text-slate-700" htmlFor="password">
          Password
          <span className="relative mt-1.5 block">
            <LockKeyhole size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              className={fieldClass}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>

        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Keep me signed in on this device
        </label>

        {error && (
          <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="pt-1 text-center text-xs text-muted">
          New to BizFlow?{" "}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Create an employee account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
