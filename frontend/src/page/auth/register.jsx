import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  UserPlus,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/authLayout";
import api from "../../api/axios";

const fieldClass =
  "block h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = ({ target: { name, value } }) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = formData.name.trim();
    const email = formData.email.trim();
    if (!name || !email || !formData.password) {
      setError("Complete each required field to create your account.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Use a password with at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password: formData.password,
      });
      if (!data?.success) {
        throw new Error(data?.message || "Unable to create your account.");
      }
      setSuccess(data.message || "Your account has been created. You can now sign in.");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordInput = (name, label, shown, toggle) => (
    <label className="block text-xs font-medium text-slate-700" htmlFor={name}>
      {label}
      <span className="relative mt-1.5 block">
        <LockKeyhole size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id={name}
          name={name}
          type={shown ? "text" : "password"}
          autoComplete="new-password"
          value={formData[name]}
          onChange={handleChange}
          disabled={loading}
          minLength={6}
          required
          className={fieldClass}
          placeholder="At least 6 characters"
        />
        <button
          type="button"
          onClick={toggle}
          disabled={loading}
          aria-label={shown ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {shown ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </label>
  );

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      description="Register as an employee to access your organization workspace."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-xs font-medium text-slate-700" htmlFor="name">
          Full name
          <span className="relative mt-1.5 block">
            <UserRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="name"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              maxLength={100}
              required
              className={fieldClass}
              placeholder="Your name"
            />
          </span>
        </label>
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
        {passwordInput("password", "Password", showPassword, () => setShowPassword((value) => !value))}
        {passwordInput("confirmPassword", "Confirm password", showConfirmPassword, () => setShowConfirmPassword((value) => !value))}

        {error && (
          <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {success && (
          <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          {loading ? "Creating account…" : "Create account"}
        </button>
        <p className="pt-1 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
