import { useEffect, useState } from "react";
import { X } from "lucide-react";
import api from "../../api/axios";

const initialForm = (employee) => ({
  name: employee?.name || "",
  email: employee?.email || "",
  password: "",
  phone: employee?.phone || "",
  position: employee?.position || "",
  departmentId: employee?.departmentId ? String(employee.departmentId) : "",
  joiningDate: employee?.joiningDate
    ? new Date(employee.joiningDate).toISOString().slice(0, 10)
    : "",
  salary: employee?.salary ?? "",
  isActive: employee?.isActive !== false,
});

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text outline-none focus:border-btn focus:ring-2 focus:ring-btn/10";

const EmployeeFormModal = ({ employee, onClose, onSaved }) => {
  const [formData, setFormData] = useState(() => initialForm(employee));
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentError, setDepartmentError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchDepartments = async () => {
      try {
        const { data } = await api.get("/departments");
        if (!data?.success) {
          throw new Error(data?.message || "Unable to load departments.");
        }
        if (active) {
          setDepartments(
            Array.isArray(data.departments) ? data.departments : []
          );
        }
      } catch (requestError) {
        if (active) {
          setDepartmentError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load departments."
          );
        }
      } finally {
        if (active) {
          setDepartmentsLoading(false);
        }
      }
    };

    fetchDepartments();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = ({ target: { name, value, type, checked } }) => {
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    if (!employee && formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (employee && formData.password && formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    const salary = formData.salary === "" ? null : Number(formData.salary);
    if (salary !== null && (!Number.isFinite(salary) || salary < 0)) {
      setError("Salary must be a non-negative number.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      position: formData.position.trim() || null,
      departmentId: formData.departmentId
        ? Number(formData.departmentId)
        : null,
      joiningDate: formData.joiningDate || null,
      salary,
      ...(employee && { isActive: formData.isActive }),
      ...(formData.password && { password: formData.password }),
    };

    try {
      setSaving(true);
      const { data } = employee
        ? await api.put(`/employees/${employee.id}`, payload)
        : await api.post("/employees", payload);

      if (!data?.success) {
        throw new Error(
          data?.message ||
            `Unable to ${employee ? "update" : "create"} employee.`
        );
      }

      await onSaved();
      onClose();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to save employee."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-form-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-2xl sm:p-7"
      >
        <header className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 id="employee-form-title" className="text-xl font-semibold text-text">
              {employee ? "Edit employee" : "Add employee"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Enter the employee account and profile details.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close employee form"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-muted hover:bg-background hover:text-text disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm text-muted">
              Full name
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
                required
                className={fieldClass}
              />
            </label>
            <label className="space-y-1.5 text-sm text-muted">
              Email
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={fieldClass}
              />
            </label>
            <label className="space-y-1.5 text-sm text-muted">
              {employee ? "New password (optional)" : "Password"}
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                minLength={employee && !formData.password ? undefined : 6}
                required={!employee}
                autoComplete="new-password"
                className={fieldClass}
              />
            </label>
            <label className="space-y-1.5 text-sm text-muted">
              Phone
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={32}
                className={fieldClass}
              />
            </label>
            <label className="space-y-1.5 text-sm text-muted">
              Position
              <input
                name="position"
                value={formData.position}
                onChange={handleChange}
                maxLength={100}
                className={fieldClass}
              />
            </label>
            <label className="space-y-1.5 text-sm text-muted">
              Department
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                disabled={departmentsLoading}
                className={fieldClass}
              >
                <option value="">No department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-sm text-muted">
              Joining date
              <input
                name="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={handleChange}
                className={fieldClass}
              />
            </label>
            <label className="space-y-1.5 text-sm text-muted">
              Salary
              <input
                name="salary"
                type="number"
                min="0"
                step="0.01"
                value={formData.salary}
                onChange={handleChange}
                className={fieldClass}
              />
            </label>
          </div>

          {employee && (
            <label className="flex items-center gap-2 text-sm text-text">
              <input
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 accent-indigo-600"
              />
              Account is active
            </label>
          )}

          {departmentError && (
            <p className="text-sm text-amber-700" role="status">
              {departmentError} You can still save without assigning a department.
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <footer className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-background disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-btn px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : employee ? "Save changes" : "Create employee"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

export default EmployeeFormModal;
