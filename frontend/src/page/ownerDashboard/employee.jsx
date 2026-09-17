import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Users,
  UserCheck,
  UserX,
  BriefcaseBusiness,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/owner/layout";

const ViewEmployee = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [activeMenu, setActiveMenu] = useState(null);
  const [deleteEmployee, setDeleteEmployee] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const employeesPerPage = 8;

  /*
   * =====================================================
   * GET TOKEN
   * =====================================================
   */

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token")
    );
  };

  /*
   * =====================================================
   * FETCH EMPLOYEES
   * =====================================================
   */

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const response = await fetch(
        "http://localhost:8000/api/users",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();

      const employeeData =
        data.users ||
        data.employees ||
        data.data ||
        data;

      setEmployees(
        Array.isArray(employeeData)
          ? employeeData
          : []
      );
    } catch (error) {
      console.error(
        "Employee fetch error:",
        error
      );

      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /*
   * =====================================================
   * GET INITIALS
   * =====================================================
   */

  const getInitials = (name) => {
    if (!name) return "U";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  /*
   * =====================================================
   * FORMAT DATE
   * =====================================================
   */

  const formatDate = (date) => {
    if (!date) return "—";

    try {
      return new Date(date).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );
    } catch {
      return "—";
    }
  };

  /*
   * =====================================================
   * FILTER EMPLOYEES
   * =====================================================
   */

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        employee.name
          ?.toLowerCase()
          .includes(searchValue) ||
        employee.email
          ?.toLowerCase()
          .includes(searchValue) ||
        employee.employeeId
          ?.toLowerCase()
          .includes(searchValue) ||
        employee.id
          ?.toString()
          .toLowerCase()
          .includes(searchValue);

      const employeeRole =
        employee.role?.toUpperCase() || "";

      const matchesRole =
        roleFilter === "ALL" ||
        employeeRole === roleFilter;

      const employeeStatus =
        employee.status?.toUpperCase() ||
        "ACTIVE";

      const matchesStatus =
        statusFilter === "ALL" ||
        employeeStatus === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    employees,
    search,
    roleFilter,
    statusFilter,
  ]);

  /*
   * =====================================================
   * PAGINATION
   * =====================================================
   */

  const totalPages = Math.ceil(
    filteredEmployees.length /
    employeesPerPage
  );

  const startIndex =
    (currentPage - 1) * employeesPerPage;

  const currentEmployees =
    filteredEmployees.slice(
      startIndex,
      startIndex + employeesPerPage
    );

  /*
   * =====================================================
   * DELETE EMPLOYEE
   * =====================================================
   */

  const handleDelete = async () => {
    if (!deleteEmployee) return;

    try {
      const token = getToken();

      const response = await fetch(
        `http://localhost:5000/api/users/${deleteEmployee.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete employee"
        );
      }

      setEmployees((prev) =>
        prev.filter(
          (employee) =>
            employee.id !==
            deleteEmployee.id
        )
      );

      setDeleteEmployee(null);
      setActiveMenu(null);
    } catch (error) {
      console.error(
        "Delete employee error:",
        error
      );

      alert(
        "Unable to delete employee."
      );
    }
  };

  /*
   * =====================================================
   * STATISTICS
   * =====================================================
   */

  const totalEmployees =
    employees.length;

  const activeEmployees =
    employees.filter(
      (employee) =>
        !employee.status ||
        employee.status.toUpperCase() ===
        "ACTIVE"
    ).length;

  const inactiveEmployees =
    employees.filter(
      (employee) =>
        employee.status?.toUpperCase() ===
        "INACTIVE"
    ).length;

  const managers =
    employees.filter(
      (employee) =>
        employee.role?.toUpperCase() ===
        "MANAGER"
    ).length;

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="
              w-11
              h-11
              rounded-full
              border-4
              border-border
              border-t-btn
              animate-spin
            "
          />

          <p className="text-sm text-muted">
            Loading employees...
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* =================================================
          HEADER
      ================================================= */}

        <div
          className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-4
        "
        >
          <div>
            <div className="flex items-center gap-2">
              <Users
                size={22}
                className="text-btn"
              />

              <h1
                className="
                text-2xl
                sm:text-3xl
                font-bold
                text-text
              "
              >
                Employees
              </h1>
            </div>

            <p className="mt-1 text-sm text-muted">
              Manage your organization's
              employees and workforce.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/owner/employees/add")
            }
            className="
            inline-flex
            items-center
            justify-center
            gap-2
            px-4
            py-2.5
            rounded-xl
            bg-btn
            text-white
            text-sm
            font-semibold
            shadow-sm
            hover:opacity-90
            active:scale-[0.98]
            transition-all
          "
          >
            <Plus size={18} />

            Add Employee
          </button>
        </div>

        {/* =================================================
          STAT CARDS
      ================================================= */}

        <div
          className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        "
        >

          {/* Total */}
          <div
            className="
            bg-surface
            border
            border-border
            rounded-2xl
            p-5
          "
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-muted">
                  Total Employees
                </p>

                <h2
                  className="
                  text-2xl
                  font-bold
                  text-text
                  mt-1
                "
                >
                  {totalEmployees}
                </h2>
              </div>

              <div
                className="
                w-11
                h-11
                rounded-xl
                bg-btn/10
                text-btn
                flex
                items-center
                justify-center
              "
              >
                <Users size={20} />
              </div>
            </div>
          </div>

          {/* Active */}
          <div
            className="
            bg-surface
            border
            border-border
            rounded-2xl
            p-5
          "
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-muted">
                  Active
                </p>

                <h2
                  className="
                  text-2xl
                  font-bold
                  text-text
                  mt-1
                "
                >
                  {activeEmployees}
                </h2>
              </div>

              <div
                className="
                w-11
                h-11
                rounded-xl
                bg-emerald-500/10
                text-emerald-600
                flex
                items-center
                justify-center
              "
              >
                <UserCheck size={20} />
              </div>
            </div>
          </div>

          {/* Inactive */}
          <div
            className="
            bg-surface
            border
            border-border
            rounded-2xl
            p-5
          "
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-muted">
                  Inactive
                </p>

                <h2
                  className="
                  text-2xl
                  font-bold
                  text-text
                  mt-1
                "
                >
                  {inactiveEmployees}
                </h2>
              </div>

              <div
                className="
                w-11
                h-11
                rounded-xl
                bg-red-500/10
                text-red-600
                flex
                items-center
                justify-center
              "
              >
                <UserX size={20} />
              </div>
            </div>
          </div>

          {/* Managers */}
          <div
            className="
            bg-surface
            border
            border-border
            rounded-2xl
            p-5
          "
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-muted">
                  Managers
                </p>

                <h2
                  className="
                  text-2xl
                  font-bold
                  text-text
                  mt-1
                "
                >
                  {managers}
                </h2>
              </div>

              <div
                className="
                w-11
                h-11
                rounded-xl
                bg-purple-500/10
                text-purple-600
                flex
                items-center
                justify-center
              "
              >
                <BriefcaseBusiness size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
          TABLE CARD
      ================================================= */}

        <div
          className="
          bg-surface
          border
          border-border
          rounded-2xl
          overflow-hidden
        "
        >

          {/* Filters */}
          <div
            className="
            p-4
            sm:p-5
            border-b
            border-border
            flex
            flex-col
            xl:flex-row
            gap-3
            xl:items-center
            xl:justify-between
          "
          >

            {/* Search */}
            <div
              className="
              flex
              items-center
              gap-2.5
              h-11
              px-3.5
              rounded-xl
              bg-background
              border
              border-border
              focus-within:border-btn
              focus-within:ring-4
              focus-within:ring-btn/10
              w-full
              xl:max-w-md
            "
            >
              <Search
                size={18}
                className="text-muted shrink-0"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search employees..."
                className="
                w-full
                bg-transparent
                outline-none
                text-sm
                text-text
                placeholder:text-muted
              "
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="
                  text-muted
                  hover:text-text
                "
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">

              {/* Role */}
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="
                  appearance-none
                  h-11
                  min-w-[140px]
                  pl-9
                  pr-8
                  rounded-xl
                  bg-background
                  border
                  border-border
                  text-sm
                  text-text
                  outline-none
                  cursor-pointer
                  focus:border-btn
                "
                >
                  <option value="ALL">
                    All Roles
                  </option>

                  <option value="OWNER">
                    Owner
                  </option>

                  <option value="ADMIN">
                    Admin
                  </option>

                  <option value="MANAGER">
                    Manager
                  </option>

                  <option value="EMPLOYEE">
                    Employee
                  </option>
                </select>

                <Filter
                  size={15}
                  className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-muted
                  pointer-events-none
                "
                />
              </div>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="
                h-11
                min-w-[130px]
                px-3
                rounded-xl
                bg-background
                border
                border-border
                text-sm
                text-text
                outline-none
                cursor-pointer
                focus:border-btn
              "
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>
            </div>
          </div>

          {/* =================================================
            DESKTOP TABLE
        ================================================= */}

          <div className="hidden lg:block overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr
                  className="
                  bg-background/60
                  border-b
                  border-border
                "
                >
                  <th
                    className="
                    text-left
                    px-5
                    py-3.5
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-muted
                  "
                  >
                    Employee
                  </th>

                  <th
                    className="
                    text-left
                    px-5
                    py-3.5
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-muted
                  "
                  >
                    Contact
                  </th>

                  <th
                    className="
                    text-left
                    px-5
                    py-3.5
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-muted
                  "
                  >
                    Role
                  </th>

                  <th
                    className="
                    text-left
                    px-5
                    py-3.5
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-muted
                  "
                  >
                    Department
                  </th>

                  <th
                    className="
                    text-left
                    px-5
                    py-3.5
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-muted
                  "
                  >
                    Status
                  </th>

                  <th
                    className="
                    text-left
                    px-5
                    py-3.5
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-muted
                  "
                  >
                    Joined
                  </th>

                  <th className="w-12" />
                </tr>
              </thead>

              <tbody>
                {currentEmployees.map(
                  (employee) => {

                    const isActive =
                      !employee.status ||
                      employee.status.toUpperCase() ===
                      "ACTIVE";

                    return (
                      <tr
                        key={employee.id}
                        className="
                        border-b
                        border-border
                        last:border-0
                        hover:bg-background/60
                        transition-colors
                      "
                      >

                        {/* Employee */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            <div
                              className="
                              w-10
                              h-10
                              rounded-xl
                              bg-btn/10
                              text-btn
                              flex
                              items-center
                              justify-center
                              text-sm
                              font-bold
                              shrink-0
                            "
                            >
                              {getInitials(
                                employee.name
                              )}
                            </div>

                            <div className="min-w-0">
                              <p
                                className="
                                text-sm
                                font-semibold
                                text-text
                                truncate
                              "
                              >
                                {employee.name ||
                                  "Unknown"}
                              </p>

                              <p
                                className="
                                text-xs
                                text-muted
                                mt-0.5
                              "
                              >
                                ID:{" "}
                                {employee.employeeId ||
                                  employee.id ||
                                  "—"}
                              </p>
                            </div>

                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4">

                          <div className="space-y-1">

                            {employee.email && (
                              <div
                                className="
                                flex
                                items-center
                                gap-1.5
                                text-xs
                                text-muted
                              "
                              >
                                <Mail size={13} />

                                <span>
                                  {employee.email}
                                </span>
                              </div>
                            )}

                            {employee.phone && (
                              <div
                                className="
                                flex
                                items-center
                                gap-1.5
                                text-xs
                                text-muted
                              "
                              >
                                <Phone size={13} />

                                <span>
                                  {employee.phone}
                                </span>
                              </div>
                            )}

                          </div>

                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">

                          <span
                            className="
                            inline-flex
                            px-2.5
                            py-1
                            rounded-lg
                            bg-background
                            border
                            border-border
                            text-xs
                            font-medium
                            text-text
                            capitalize
                          "
                          >
                            {employee.role?.toLowerCase() ||
                              "Employee"}
                          </span>

                        </td>

                        {/* Department */}
                        <td className="px-5 py-4">

                          <span className="text-sm text-text">
                            {employee.department?.name ||
                              employee.department ||
                              "—"}
                          </span>

                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">

                          <span
                            className={`
                            inline-flex
                            items-center
                            gap-1.5
                            px-2.5
                            py-1
                            rounded-full
                            text-xs
                            font-semibold
                            ${isActive
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-red-500/10 text-red-600"
                              }
                          `}
                          >
                            <span
                              className={`
                              w-1.5
                              h-1.5
                              rounded-full
                              ${isActive
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                                }
                            `}
                            />

                            {isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                        {/* Joined */}
                        <td className="px-5 py-4">

                          <span className="text-sm text-muted">
                            {formatDate(
                              employee.createdAt ||
                              employee.joinDate
                            )}
                          </span>

                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">

                          <div className="relative">

                            <button
                              onClick={() =>
                                setActiveMenu(
                                  activeMenu ===
                                    employee.id
                                    ? null
                                    : employee.id
                                )
                              }
                              className="
                              w-9
                              h-9
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              text-muted
                              hover:bg-background
                              hover:text-text
                            "
                            >
                              <MoreVertical
                                size={18}
                              />
                            </button>

                            {activeMenu ===
                              employee.id && (
                                <div
                                  className="
                                absolute
                                right-0
                                top-10
                                z-20
                                w-44
                                bg-surface
                                border
                                border-border
                                rounded-xl
                                shadow-xl
                                p-1.5
                              "
                                >

                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/employees/${employee.id}`
                                      )
                                    }
                                    className="
                                  w-full
                                  flex
                                  items-center
                                  gap-2.5
                                  px-3
                                  py-2.5
                                  rounded-lg
                                  text-sm
                                  text-text
                                  hover:bg-background
                                "
                                  >
                                    <Eye size={16} />

                                    View
                                  </button>

                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/employees/${employee.id}/edit`
                                      )
                                    }
                                    className="
                                  w-full
                                  flex
                                  items-center
                                  gap-2.5
                                  px-3
                                  py-2.5
                                  rounded-lg
                                  text-sm
                                  text-text
                                  hover:bg-background
                                "
                                  >
                                    <Pencil size={16} />

                                    Edit
                                  </button>

                                  <div className="h-px bg-border my-1" />

                                  <button
                                    onClick={() =>
                                      setDeleteEmployee(
                                        employee
                                      )
                                    }
                                    className="
                                  w-full
                                  flex
                                  items-center
                                  gap-2.5
                                  px-3
                                  py-2.5
                                  rounded-lg
                                  text-sm
                                  text-red-600
                                  hover:bg-red-50
                                "
                                  >
                                    <Trash2 size={16} />

                                    Delete
                                  </button>

                                </div>
                              )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================
            MOBILE / TABLET CARDS
        ================================================= */}

          <div className="lg:hidden">

            {currentEmployees.length > 0 ? (
              <div className="divide-y divide-border">

                {currentEmployees.map(
                  (employee) => {

                    const isActive =
                      !employee.status ||
                      employee.status.toUpperCase() ===
                      "ACTIVE";

                    return (
                      <div
                        key={employee.id}
                        className="p-4"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex items-center gap-3 min-w-0">

                            <div
                              className="
                              w-11
                              h-11
                              rounded-xl
                              bg-btn/10
                              text-btn
                              flex
                              items-center
                              justify-center
                              font-bold
                              shrink-0
                            "
                            >
                              {getInitials(
                                employee.name
                              )}
                            </div>

                            <div className="min-w-0">

                              <p
                                className="
                                text-sm
                                font-semibold
                                text-text
                                truncate
                              "
                              >
                                {employee.name ||
                                  "Unknown"}
                              </p>

                              <p className="text-xs text-muted mt-0.5">
                                {employee.role?.toLowerCase() ||
                                  "Employee"}
                              </p>

                            </div>

                          </div>

                          <button
                            onClick={() =>
                              setActiveMenu(
                                activeMenu ===
                                  employee.id
                                  ? null
                                  : employee.id
                              )
                            }
                            className="
                            w-9
                            h-9
                            flex
                            items-center
                            justify-center
                            rounded-lg
                            text-muted
                            hover:bg-background
                          "
                          >
                            <MoreVertical
                              size={18}
                            />
                          </button>

                        </div>

                        <div
                          className="
                          grid
                          grid-cols-1
                          sm:grid-cols-2
                          gap-3
                          mt-4
                        "
                        >

                          <div className="flex items-center gap-2 text-xs text-muted">
                            <Mail size={14} />

                            <span className="truncate">
                              {employee.email ||
                                "No email"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted">
                            <Phone size={14} />

                            <span>
                              {employee.phone ||
                                "No phone"}
                            </span>
                          </div>

                        </div>

                        <div className="flex items-center justify-between mt-4">

                          <span
                            className={`
                            inline-flex
                            items-center
                            gap-1.5
                            px-2.5
                            py-1
                            rounded-full
                            text-xs
                            font-semibold
                            ${isActive
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-red-500/10 text-red-600"
                              }
                          `}
                          >
                            <span
                              className={`
                              w-1.5
                              h-1.5
                              rounded-full
                              ${isActive
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                                }
                            `}
                            />

                            {isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                          <span className="text-xs text-muted">
                            Joined{" "}
                            {formatDate(
                              employee.createdAt ||
                              employee.joinDate
                            )}
                          </span>

                        </div>

                        {/* Mobile Actions */}
                        {activeMenu === employee.id && (
                          <div
                            className="
                            mt-3
                            pt-3
                            border-t
                            border-border
                            flex
                            gap-2
                          "
                          >
                            <button
                              onClick={() =>
                                navigate(
                                  `/employees/${employee.id}`
                                )
                              }
                              className="
                              flex-1
                              flex
                              items-center
                              justify-center
                              gap-2
                              py-2
                              rounded-lg
                              bg-background
                              border
                              border-border
                              text-sm
                              text-text
                            "
                            >
                              <Eye size={15} />

                              View
                            </button>

                            <button
                              onClick={() =>
                                navigate(
                                  `/employees/${employee.id}/edit`
                                )
                              }
                              className="
                              flex-1
                              flex
                              items-center
                              justify-center
                              gap-2
                              py-2
                              rounded-lg
                              bg-background
                              border
                              border-border
                              text-sm
                              text-text
                            "
                            >
                              <Pencil size={15} />

                              Edit
                            </button>

                            <button
                              onClick={() =>
                                setDeleteEmployee(
                                  employee
                                )
                              }
                              className="
                              w-10
                              flex
                              items-center
                              justify-center
                              rounded-lg
                              bg-red-50
                              text-red-600
                            "
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>
            ) : null}

          </div>

          {/* =================================================
            EMPTY STATE
        ================================================= */}

          {filteredEmployees.length === 0 && (
            <div
              className="
              py-16
              px-6
              text-center
            "
            >
              <div
                className="
                w-14
                h-14
                mx-auto
                rounded-2xl
                bg-background
                border
                border-border
                flex
                items-center
                justify-center
              "
              >
                <Users
                  size={24}
                  className="text-muted"
                />
              </div>

              <h3
                className="
                mt-4
                text-base
                font-semibold
                text-text
              "
              >
                No employees found
              </h3>

              <p className="mt-1 text-sm text-muted">
                Try changing your search or
                filters.
              </p>
            </div>
          )}

          {/* =================================================
            PAGINATION
        ================================================= */}

          {filteredEmployees.length > 0 && (
            <div
              className="
              px-4
              sm:px-5
              py-4
              border-t
              border-border
              flex
              items-center
              justify-between
              gap-4
            "
            >
              <p className="text-xs sm:text-sm text-muted">
                Showing{" "}
                <span className="font-medium text-text">
                  {startIndex + 1}
                </span>{" "}
                -
                <span className="font-medium text-text">
                  {" "}
                  {Math.min(
                    startIndex +
                    employeesPerPage,
                    filteredEmployees.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-text">
                  {filteredEmployees.length}
                </span>
              </p>

              <div className="flex items-center gap-1.5">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      (page) => page - 1
                    )
                  }
                  className="
                  w-9
                  h-9
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-border
                  text-muted
                  hover:bg-background
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
                >
                  <ChevronLeft size={17} />
                </button>

                <span
                  className="
                  min-w-9
                  h-9
                  px-2
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  bg-btn
                  text-white
                  text-sm
                  font-medium
                "
                >
                  {currentPage}
                </span>

                <button
                  disabled={
                    currentPage >= totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) => page + 1
                    )
                  }
                  className="
                  w-9
                  h-9
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-border
                  text-muted
                  hover:bg-background
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
                >
                  <ChevronRight size={17} />
                </button>

              </div>
            </div>
          )}
        </div>

        {/* =================================================
          DELETE MODAL
      ================================================= */}

        {deleteEmployee && (
          <div
            className="
            fixed
            inset-0
            z-[100]
            bg-black/40
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
          "
          >
            <div
              className="
              w-full
              max-w-md
              bg-surface
              border
              border-border
              rounded-2xl
              shadow-2xl
              p-6
            "
            >

              <div className="flex items-start gap-4">

                <div
                  className="
                  w-11
                  h-11
                  rounded-xl
                  bg-red-500/10
                  text-red-600
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
                >
                  <Trash2 size={20} />
                </div>

                <div>
                  <h3
                    className="
                    text-lg
                    font-semibold
                    text-text
                  "
                  >
                    Delete employee?
                  </h3>

                  <p
                    className="
                    text-sm
                    text-muted
                    mt-1
                    leading-relaxed
                  "
                  >
                    Are you sure you want to
                    delete{" "}
                    <span className="font-semibold text-text">
                      {deleteEmployee.name}
                    </span>
                    ? This action cannot be
                    undone.
                  </p>
                </div>

              </div>

              <div
                className="
                flex
                justify-end
                gap-2
                mt-6
              "
              >
                <button
                  onClick={() =>
                    setDeleteEmployee(null)
                  }
                  className="
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-border
                  text-sm
                  font-medium
                  text-text
                  hover:bg-background
                "
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="
                  px-4
                  py-2.5
                  rounded-xl
                  bg-red-600
                  text-white
                  text-sm
                  font-semibold
                  hover:bg-red-700
                "
                >
                  Delete Employee
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ViewEmployee;