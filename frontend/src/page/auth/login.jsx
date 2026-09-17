import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, LogIn, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const inputClass = "w-full rounded-xl border border-border/80 bg-background/50 py-3 pl-11 pr-4 text-text outline-none transition-all placeholder:text-muted/70 focus:border-indigo-500 focus:bg-background focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
    const { email, password } = formData;
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      return setError("Email and password are required.");
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", { email: email.trim(), password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      const dashboardPath = ["OWNER", "ADMIN", "MANAGER"].includes(data.user?.role)
        ? "/owner/dashboard"
        : "/login";
      navigate(dashboardPath, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-border/60 bg-surface/80 p-8 shadow-xl shadow-black/[0.03] backdrop-blur-xl sm:p-10">
        <header className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/20 text-white">
            <LogIn size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Welcome back</h1>
            <p className="text-sm text-muted">Please enter your details to sign in.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted">Email address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/80" />
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={loading} required className={inputClass} placeholder="you@example.com" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-muted">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/80 transition-colors" />
              <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} disabled={loading} required className={`${inputClass} pr-12`} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} disabled={loading} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-xl border-l-4 border-red-500 bg-red-500/10 p-3.5 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div role="status" className="rounded-xl border-l-4 border-emerald-500 bg-emerald-500/10 p-3.5 text-sm text-emerald-600 dark:text-emerald-400">
              {success}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 font-medium text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] transition-all disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>

          <p className="text-center text-sm text-muted mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-500 font-medium hover:underline">
              Create account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default Login;