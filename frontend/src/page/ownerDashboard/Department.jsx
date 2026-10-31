import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Users,
  Pencil,
  Trash2,
  X,
  Loader2,
  MoreVertical,
  UserRound,
  BriefcaseBusiness,
  AlertCircle,
} from "lucide-react";
import api from "../../api/axios";
import Layout from "../../components/layout/owner/layout";
import { getStoredUser } from "../../utils/auth";
import { canManagePeople } from "../../utils/navigation";

const API_URL = "/departments";

const Department = () => {
  const canEdit = canManagePeople(getStoredUser()?.role);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // --------------------------------------------------
  // FETCH DEPARTMENTS
  // --------------------------------------------------

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(API_URL);

      if (!data?.success) {
        throw new Error("Failed to fetch departments");
      }

      // Supports different backend response structures
      const departmentData =
        data.departments ||
        data.data ||
        data.results ||
        data;

      setDepartments(
        Array.isArray(departmentData)
          ? departmentData
          : []
      );
    } catch (err) {
      console.error("Department fetch error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load departments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDepartments();
  }, []);

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const searchText = search.toLowerCase();

      return (
        department.name
          ?.toLowerCase()
          .includes(searchText) ||
        department.description
          ?.toLowerCase()
          .includes(searchText)
      );
    });
  }, [departments, search]);

  // --------------------------------------------------
  // FORM INPUT
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // OPEN ADD MODAL
  // --------------------------------------------------

  const openAddModal = () => {
    setSelectedDepartment(null);

    setFormData({
      name: "",
      description: "",
    });

    setError("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // OPEN EDIT MODAL
  // --------------------------------------------------

  const openEditModal = (department) => {
    setSelectedDepartment(department);

    setFormData({
      name: department.name || "",
      description: department.description || "",
    });

    setError("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // CREATE / UPDATE
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Department name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const isEditing = Boolean(selectedDepartment);

      const url = isEditing
        ? `${API_URL}/${selectedDepartment.id}`
        : API_URL;

      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };
      const { data } = isEditing
        ? await api.put(url, requestData)
        : await api.post(url, requestData);

      if (!data?.success) {
        throw new Error(
          data.message ||
            `Failed to ${
              isEditing ? "update" : "create"
            } department`
        );
      }

      setShowModal(false);

      setFormData({
        name: "",
        description: "",
      });

      setSelectedDepartment(null);

      await fetchDepartments();
    } catch (err) {
      console.error("Department save error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong while saving the department."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const openDeleteModal = (department) => {
    setSelectedDepartment(department);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;

    try {
      setSaving(true);
      setError("");

      const { data } = await api.delete(
        `${API_URL}/${selectedDepartment.id}`
      );

      if (!data?.success) {
        throw new Error(
          data.message ||
            "Failed to delete department"
        );
      }

      setShowDeleteModal(false);
      setSelectedDepartment(null);

      await fetchDepartments();
    } catch (err) {
      console.error("Department delete error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete department."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  const totalEmployees = departments.reduce(
    (total, department) =>
      total +
      Number(
        department.employeeCount ??
          department._count?.employees ??
          department.employees?.length ??
          0
      ),
    0
  );

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
              <Loader2 size={22} className="animate-spin text-indigo-600" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900">Loading departments</p>
              <p className="mt-1 text-sm text-muted">Please wait a moment…</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <Layout>
      <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-btn/10 flex items-center justify-center">
              <Building2
                size={22}
                className="text-btn"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-text">
                Departments
              </h1>

              <p className="text-sm text-muted mt-1">
                Manage your organization's departments
              </p>
            </div>
          </div>
        </div>

        {canEdit && <button
          onClick={openAddModal}
          className="
            inline-flex items-center justify-center gap-2
            px-4 py-2.5
            rounded-xl
            bg-btn text-white
            text-sm font-semibold
            shadow-lg shadow-btn/20
            hover:opacity-90
            active:scale-[0.98]
            transition
          "
        >
          <Plus size={18} />
          Add Department
        </button>}
      </div>

      {/* ERROR */}
      {error && !showModal && !showDeleteModal && (
        <div className="
          flex items-center gap-3
          p-4
          rounded-xl
          border border-red-200
          bg-red-50
          text-red-600
        ">
          <AlertCircle size={19} />

          <p className="text-sm font-medium">
            {error}
          </p>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="
          bg-surface
          border border-border
          rounded-2xl
          p-5
          shadow-sm
        ">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-muted">
                Total Departments
              </p>

              <h2 className="text-3xl font-bold text-text mt-2">
                {departments.length}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-btn/10 flex items-center justify-center">
              <Building2
                size={21}
                className="text-btn"
              />
            </div>
          </div>
        </div>

        <div className="
          bg-surface
          border border-border
          rounded-2xl
          p-5
          shadow-sm
        ">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-muted">
                Employees Across Departments
              </p>

              <h2 className="text-3xl font-bold text-text mt-2">
                {totalEmployees}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-xl bg-btn/10 flex items-center justify-center">
              <Users
                size={21}
                className="text-btn"
              />
            </div>
          </div>
        </div>

      </div>

      {/* SEARCH */}
      <div className="
        bg-surface
        border border-border
        rounded-2xl
        p-4
      ">
        <div className="relative max-w-md">

          <Search
            size={18}
            className="
              absolute
              left-3.5
              top-1/2
              -translate-y-1/2
              text-muted
            "
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search departments..."
            className="
              w-full
              h-11
              pl-10
              pr-4
              rounded-xl
              border border-border
              bg-background
              text-text
              text-sm
              outline-none
              focus:border-btn
              focus:ring-2
              focus:ring-btn/10
              transition
            "
          />

        </div>
      </div>

      {/* DEPARTMENT GRID */}
      {filteredDepartments.length === 0 ? (

        <div className="
          bg-surface
          border border-border
          rounded-2xl
          py-16
          px-6
          text-center
        ">
          <div className="
            mx-auto
            w-14 h-14
            rounded-2xl
            bg-btn/10
            flex items-center justify-center
          ">
            <Building2
              size={25}
              className="text-btn"
            />
          </div>

          <h3 className="
            text-lg
            font-semibold
            text-text
            mt-4
          ">
            No departments found
          </h3>

          <p className="
            text-sm
            text-muted
            mt-1
            max-w-sm
            mx-auto
          ">
            {search
              ? "Try changing your search."
              : "Create your first department to get started."}
          </p>

          {!search && canEdit && (
            <button
              onClick={openAddModal}
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                bg-btn
                text-white
                text-sm
                font-semibold
                hover:opacity-90
                transition
              "
            >
              <Plus size={17} />
              Create Department
            </button>
          )}
        </div>

      ) : (

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-5
        ">

          {filteredDepartments.map((department) => {

            const employeeCount =
              Number(
                department.employeeCount ??
                  department._count?.employees ??
                  department.employees?.length ??
                  0
              );

            const departmentHead =
              department.head?.name ||
              department.manager?.name ||
              department.departmentHead?.name ||
              "Not assigned";

            return (
              <div
                key={department.id}
                className="
                  group
                  bg-surface
                  border border-border
                  rounded-2xl
                  p-5
                  shadow-sm
                  hover:shadow-lg
                  hover:-translate-y-0.5
                  transition-all
                "
              >

                {/* TOP */}
                <div className="flex items-start justify-between">

                  <div className="
                    w-12 h-12
                    rounded-xl
                    bg-btn/10
                    flex items-center justify-center
                  ">
                    <Building2
                      size={22}
                      className="text-btn"
                    />
                  </div>

                  {canEdit && <div className="relative">

                    <button
                      type="button"
                      aria-label={`Department actions for ${department.name}`}
                      className="
                        w-9 h-9
                        rounded-lg
                        flex items-center justify-center
                        text-muted
                        hover:text-text
                        hover:bg-background
                        transition
                      "
                    >
                      <MoreVertical size={18} />
                    </button>

                    <div className="
                      hidden
                      group-hover:flex
                      group-focus-within:flex
                      absolute
                      right-0
                      top-10
                      z-10
                      w-36
                      bg-surface
                      border border-border
                      rounded-xl
                      shadow-xl
                      p-1
                    ">

                      <button
                        onClick={() =>
                          openEditModal(department)
                        }
                        className="
                          w-full
                          flex items-center gap-2
                          px-3 py-2
                          rounded-lg
                          text-sm
                          text-text
                          hover:bg-background
                        "
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          openDeleteModal(department)
                        }
                        className="
                          w-full
                          flex items-center gap-2
                          px-3 py-2
                          rounded-lg
                          text-sm
                          text-red-500
                          hover:bg-red-50
                        "
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>

                    </div>

                  </div>}
                </div>

                {/* NAME */}
                <div className="mt-5">

                  <h3 className="
                    text-lg
                    font-bold
                    text-text
                  ">
                    {department.name}
                  </h3>

                  <p className="
                    text-sm
                    text-muted
                    mt-1
                    line-clamp-2
                    min-h-[40px]
                  ">
                    {department.description ||
                      "No department description provided."}
                  </p>

                </div>

                {/* DETAILS */}
                <div className="
                  mt-5
                  pt-4
                  border-t border-border
                  space-y-3
                ">

                  <div className="
                    flex
                    items-center
                    justify-between
                    text-sm
                  ">
                    <div className="
                      flex items-center gap-2
                      text-muted
                    ">
                      <Users size={16} />
                      Employees
                    </div>

                    <span className="
                      font-semibold
                      text-text
                    ">
                      {employeeCount}
                    </span>
                  </div>

                  <div className="
                    flex
                    items-center
                    justify-between
                    text-sm
                  ">
                    <div className="
                      flex items-center gap-2
                      text-muted
                    ">
                      <UserRound size={16} />
                      Department Head
                    </div>

                    <span className="
                      max-w-[130px]
                      truncate
                      font-medium
                      text-text
                    ">
                      {departmentHead}
                    </span>
                  </div>

                </div>

                {/* FOOTER */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>

                  {canEdit && <button
                    onClick={() => openEditModal(department)}
                    className="text-xs font-semibold text-btn hover:underline"
                  >
                    Manage
                  </button>}
                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}

      {canEdit && showModal && (
        <div className="
          fixed
          inset-0
          z-[100]
          bg-black/50
          backdrop-blur-sm
          flex
          items-center
          justify-center
          p-4
        ">

          <div className="
            w-full
            max-w-lg
            bg-surface
            rounded-2xl
            border border-border
            shadow-2xl
            overflow-hidden
          ">

            {/* MODAL HEADER */}
            <div className="
              px-6
              py-5
              border-b border-border
              flex
              items-center
              justify-between
            ">

              <div>
                <h2 className="
                  text-lg
                  font-bold
                  text-text
                ">
                  {selectedDepartment
                    ? "Edit Department"
                    : "Add Department"}
                </h2>

                <p className="
                  text-sm
                  text-muted
                  mt-1
                ">
                  {selectedDepartment
                    ? "Update department information."
                    : "Create a new department."}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="
                  w-9 h-9
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-muted
                  hover:text-text
                  hover:bg-background
                  transition
                "
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {error && (
                <div className="
                  flex
                  items-center
                  gap-2
                  p-3
                  rounded-xl
                  bg-red-50
                  border border-red-100
                  text-red-600
                  text-sm
                ">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}

              {/* NAME */}
              <div>

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-text
                  mb-2
                ">
                  Department Name
                </label>

                <div className="relative">

                  <BriefcaseBusiness
                    size={17}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-muted
                    "
                  />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Human Resources"
                    className="
                      w-full
                      h-11
                      pl-10
                      pr-4
                      rounded-xl
                      border border-border
                      bg-background
                      text-text
                      text-sm
                      outline-none
                      focus:border-btn
                      focus:ring-2
                      focus:ring-btn/10
                    "
                  />

                </div>

              </div>

              {/* DESCRIPTION */}
              <div>

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-text
                  mb-2
                ">
                  Description
                  <span className="
                    text-muted
                    font-normal
                    ml-1
                  ">
                    (optional)
                  </span>
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Write a short description..."
                  rows={4}
                  className="
                    w-full
                    resize-none
                    px-4
                    py-3
                    rounded-xl
                    border border-border
                    bg-background
                    text-text
                    text-sm
                    outline-none
                    focus:border-btn
                    focus:ring-2
                    focus:ring-btn/10
                  "
                />

              </div>

              {/* BUTTONS */}
              <div className="
                flex
                gap-3
                pt-2
              ">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="
                    flex-1
                    h-11
                    rounded-xl
                    border border-border
                    text-text
                    text-sm
                    font-semibold
                    hover:bg-background
                    transition
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    flex-1
                    h-11
                    rounded-xl
                    bg-btn
                    text-white
                    text-sm
                    font-semibold
                    flex
                    items-center
                    justify-center
                    gap-2
                    hover:opacity-90
                    disabled:opacity-60
                    transition
                  "
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      {selectedDepartment
                        ? "Update Department"
                        : "Create Department"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* ==================================================
          DELETE MODAL
      ================================================== */}

      {canEdit && showDeleteModal &&
        selectedDepartment && (
          <div className="
            fixed
            inset-0
            z-[100]
            bg-black/50
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
          ">

            <div className="
              w-full
              max-w-md
              bg-surface
              rounded-2xl
              border border-border
              shadow-2xl
              p-6
            ">

              <div className="
                w-12 h-12
                rounded-xl
                bg-red-50
                text-red-500
                flex
                items-center
                justify-center
              ">
                <Trash2 size={21} />
              </div>

              <h2 className="
                text-lg
                font-bold
                text-text
                mt-5
              ">
                Delete Department?
              </h2>

              <p className="
                text-sm
                text-muted
                mt-2
                leading-6
              ">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-text">
                  {selectedDepartment.name}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="
                flex
                gap-3
                mt-6
              ">

                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedDepartment(null);
                  }}
                  className="
                    flex-1
                    h-11
                    rounded-xl
                    border border-border
                    text-text
                    text-sm
                    font-semibold
                    hover:bg-background
                    transition
                  "
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="
                    flex-1
                    h-11
                    rounded-xl
                    bg-red-500
                    text-white
                    text-sm
                    font-semibold
                    flex
                    items-center
                    justify-center
                    gap-2
                    hover:bg-red-600
                    disabled:opacity-60
                    transition
                  "
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={17} />
                      Delete
                    </>
                  )}

                </button>

              </div>

            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Department;
