import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User, UserPlus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom"; // Assuming you are using react-router-dom for Links
import api from "../../api/axios";

const inputClass = "w-full rounded-xl border border-border/80 bg-background/50 py-3 pl-11 pr-4 text-text outline-none transition-all placeholder:text-muted/70 focus:border-indigo-500 focus:bg-background focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
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
    const { name, email, password, confirmPassword } = formData;
    setError("");
    setSuccess("");
    if (!name.trim() || !email.trim() || !password) return setError("Name, email, and password are required.");
    if (password.length < 6) return setError("Password must contain at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    try {
      setLoading(true);
      const { data } = await api.post("/auth/register", { name: name.trim(), email: email.trim(), password });
      setSuccess(data.message || "Registration successful.");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordField = (id, label, visible, toggle) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-muted">{label}</label>
      <div className="relative">
        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/80 transition-colors" />
        <input id={id} name={id} type={visible ? "text" : "password"} value={formData[id]} onChange={handleChange} disabled={loading} required className={`${inputClass} pr-12`} placeholder={`••••••••`} />
        <button type="button" onClick={toggle} disabled={loading} aria-label={visible ? "Hide password" : "Show password"} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
      </div>
    </div>
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-border/60 bg-surface/80 p-8 shadow-xl shadow-black/[0.03] backdrop-blur-xl sm:p-10">
        <header className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/20 text-white">
            <UserPlus size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Create account</h1>
            <p className="text-sm text-muted">Join us and start your journey today.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-muted">Full name</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/80" />
              <input id="name" name="name" value={formData.name} onChange={handleChange} disabled={loading} required className={inputClass} placeholder="John Doe" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted">Email address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/80" />
              <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={loading} required className={inputClass} placeholder="you@example.com" />
            </div>
          </div>

          {passwordField("password", "Password", showPassword, () => setShowPassword((value) => !value))}
          {passwordField("confirmPassword", "Confirm password", showConfirmPassword, () => setShowConfirmPassword((value) => !value))}

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
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create account</span>
            )}
          </button>

          {/* Example of proper className usage if you have a link below */}
          <p className="text-center text-sm text-muted mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-500 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default Register;