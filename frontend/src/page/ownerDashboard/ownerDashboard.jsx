import { useEffect, useState } from "react";
import {
  Users,
  Wallet,
  Clock3,
  CreditCard,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

import api from "../../api/axios";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const user = (() => {
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  })();

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      /*
        Change this endpoint if your backend uses
        a different dashboard route.

        Expected:
        GET /api/dashboard/owner
      */
      const response = await api.get("/dashboard/owner");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to load dashboard"
        );
      }

      const overview = response.data.dashboard?.overview || {};

      setDashboard({
        stats: {
          totalMembers: overview.totalEmployees ?? overview.totalUsers ?? 0,
          totalSavings: 0,
          pendingAmount: overview.pendingLeaves ?? 0,
          monthlyPayments: 0,
        },
        recentMembers: response.data.dashboard?.recentEmployees || [],
        recentTransactions: response.data.dashboard?.recentPayrolls || [],
        monthlySavings: [],
        monthlyPayments: [],
      });
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // The dashboard must fetch its initial data after the component mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, []);

  const formatCurrency = (amount = 0) => {
    return `रू ${Number(amount).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="flex flex-col items-center gap-3">
              <Loader2
                size={32}
                className="animate-spin text-btn"
              />

              <p className="text-sm text-muted">
                Loading dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error && !dashboard) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="max-w-md w-full bg-surface border border-border rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-lg bg-danger/10 flex items-center justify-center">
                <AlertCircle
                  size={24}
                  className="text-danger"
                />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-text">
                Unable to load dashboard
              </h2>

              <p className="mt-2 text-sm text-muted">
                {error}
              </p>

              <button
                onClick={() => fetchDashboard()}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-btn text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Safe dashboard data
  |--------------------------------------------------------------------------
  */

  const stats = dashboard?.stats || {};

  const members = dashboard?.recentMembers || [];

  const transactions =
    dashboard?.recentTransactions || [];

  const monthlySavings =
    dashboard?.monthlySavings || [];

  const monthlyPayments =
    dashboard?.monthlyPayments || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* =========================================================
            HEADER
        ========================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <p className="text-sm text-muted">
              Owner Dashboard
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold text-text mt-1">
              Welcome back, {user?.name || "Owner"}
            </h1>

            <p className="text-sm text-muted mt-2">
              Here's what's happening with your organization.
            </p>
          </div>

          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-text rounded-lg text-sm font-medium hover:bg-background transition disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* =========================================================
            ERROR MESSAGE
        ========================================================= */}

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-danger/10 border border-danger/20 rounded-lg">
            <AlertCircle
              size={18}
              className="text-danger shrink-0"
            />

            <p className="text-sm text-danger">
              {error}
            </p>
          </div>
        )}

        {/* =========================================================
            STATS
        ========================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

          {/* Members */}

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-muted">
                  Total Members
                </p>

                <h2 className="text-2xl font-bold text-text mt-2">
                  {stats.totalMembers ?? 0}
                </h2>
              </div>

              <div className="w-10 h-10 rounded-lg bg-btn/10 flex items-center justify-center">
                <Users
                  size={20}
                  className="text-btn"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-muted">
              <UserPlus size={14} />
              <span>
                Active members in organization
              </span>
            </div>
          </div>

          {/* Savings */}

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-muted">
                  Total Savings
                </p>

                <h2 className="text-2xl font-bold text-text mt-2">
                  {formatCurrency(
                    stats.totalSavings
                  )}
                </h2>
              </div>

              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Wallet
                  size={20}
                  className="text-success"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-success">
              <TrendingUp size={14} />
              <span>
                Current organization savings
              </span>
            </div>
          </div>

          {/* Pending */}

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-muted">
                  Pending Amount
                </p>

                <h2 className="text-2xl font-bold text-text mt-2">
                  {formatCurrency(
                    stats.pendingAmount
                  )}
                </h2>
              </div>

              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock3
                  size={20}
                  className="text-warning"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-warning">
              <Clock3 size={14} />
              <span>
                Awaiting payment
              </span>
            </div>
          </div>

          {/* Payments */}

          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-muted">
                  Monthly Payments
                </p>

                <h2 className="text-2xl font-bold text-text mt-2">
                  {formatCurrency(
                    stats.monthlyPayments
                  )}
                </h2>
              </div>

              <div className="w-10 h-10 rounded-lg bg-btn/10 flex items-center justify-center">
                <CreditCard
                  size={20}
                  className="text-btn"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-btn">
              <TrendingUp size={14} />
              <span>
                Payments this month
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            CHART SECTION
        ========================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

          {/* Savings */}

          <div className="bg-surface border border-border rounded-xl p-5">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="font-semibold text-text">
                  Savings Overview
                </h2>

                <p className="text-xs text-muted mt-1">
                  Monthly savings collection
                </p>
              </div>

              <Wallet
                size={19}
                className="text-muted"
              />
            </div>

            {monthlySavings.length === 0 ? (
              <div className="h-56 flex items-center justify-center">
                <p className="text-sm text-muted">
                  No savings data available.
                </p>
              </div>
            ) : (
              <div className="h-56 flex items-end gap-3 overflow-x-auto pb-6">

                {monthlySavings.map(
                  (item, index) => {

                    const values =
                      monthlySavings.map(
                        (entry) =>
                          Number(entry.amount) || 0
                      );

                    const maxValue =
                      Math.max(...values, 1);

                    const height =
                      ((Number(item.amount) ||
                        0) /
                        maxValue) *
                      100;

                    return (
                      <div
                        key={
                          item.month ||
                          index
                        }
                        className="min-w-[48px] flex-1 h-full flex flex-col justify-end items-center gap-2"
                      >

                        <div className="text-[10px] text-muted">
                          {formatCurrency(
                            item.amount
                          )}
                        </div>

                        <div
                          className="w-full max-w-[42px] bg-btn rounded-t-md transition-all"
                          style={{
                            height: `${Math.max(
                              height,
                              4
                            )}%`,
                          }}
                        />

                        <span className="text-[10px] text-muted whitespace-nowrap">
                          {item.month}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* Payments */}

          <div className="bg-surface border border-border rounded-xl p-5">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="font-semibold text-text">
                  Payment Overview
                </h2>

                <p className="text-xs text-muted mt-1">
                  Monthly payment activity
                </p>
              </div>

              <CreditCard
                size={19}
                className="text-muted"
              />
            </div>

            {monthlyPayments.length === 0 ? (
              <div className="h-56 flex items-center justify-center">
                <p className="text-sm text-muted">
                  No payment data available.
                </p>
              </div>
            ) : (
              <div className="h-56 flex items-end gap-3 overflow-x-auto pb-6">

                {monthlyPayments.map(
                  (item, index) => {

                    const values =
                      monthlyPayments.map(
                        (entry) =>
                          Number(entry.amount) || 0
                      );

                    const maxValue =
                      Math.max(...values, 1);

                    const height =
                      ((Number(item.amount) ||
                        0) /
                        maxValue) *
                      100;

                    return (
                      <div
                        key={
                          item.month ||
                          index
                        }
                        className="min-w-[48px] flex-1 h-full flex flex-col justify-end items-center gap-2"
                      >

                        <div className="text-[10px] text-muted">
                          {formatCurrency(
                            item.amount
                          )}
                        </div>

                        <div
                          className="w-full max-w-[42px] bg-success rounded-t-md transition-all"
                          style={{
                            height: `${Math.max(
                              height,
                              4
                            )}%`,
                          }}
                        />

                        <span className="text-[10px] text-muted whitespace-nowrap">
                          {item.month}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            RECENT MEMBERS + TRANSACTIONS
        ========================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Recent Members */}

          <div className="bg-surface border border-border rounded-xl">

            <div className="p-5 border-b border-border flex items-center justify-between">

              <div>
                <h2 className="font-semibold text-text">
                  Recent Members
                </h2>

                <p className="text-xs text-muted mt-1">
                  Recently added members
                </p>
              </div>

              <button
                onClick={() =>
                  window.location.href =
                    "/owner/members"
                }
                className="text-xs font-medium text-btn hover:underline"
              >
                View all
              </button>
            </div>

            <div className="divide-y divide-border">

              {members.length === 0 ? (
                <div className="p-8 text-center">
                  <Users
                    size={28}
                    className="mx-auto text-muted"
                  />

                  <p className="text-sm text-muted mt-3">
                    No members found.
                  </p>
                </div>
              ) : (
                members
                  .slice(0, 5)
                  .map((member) => (
                    <div
                      key={member.id}
                      className="p-4 flex items-center justify-between gap-4"
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-text">
                            {getInitials(
                              member.name
                            )}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text truncate">
                            {member.name}
                          </p>

                          <p className="text-xs text-muted truncate">
                            {member.email ||
                              member.phone ||
                              "No contact information"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-text">
                          {formatCurrency(
                            member.totalSaving
                          )}
                        </p>

                        <p className="text-[11px] text-muted mt-1">
                          {formatDate(
                            member.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Recent Transactions */}

          <div className="bg-surface border border-border rounded-xl">

            <div className="p-5 border-b border-border flex items-center justify-between">

              <div>
                <h2 className="font-semibold text-text">
                  Recent Transactions
                </h2>

                <p className="text-xs text-muted mt-1">
                  Latest financial activity
                </p>
              </div>

              <button
                onClick={() =>
                  window.location.href =
                    "/owner/payments"
                }
                className="text-xs font-medium text-btn hover:underline"
              >
                View all
              </button>
            </div>

            <div className="divide-y divide-border">

              {transactions.length === 0 ? (
                <div className="p-8 text-center">
                  <CreditCard
                    size={28}
                    className="mx-auto text-muted"
                  />

                  <p className="text-sm text-muted mt-3">
                    No transactions found.
                  </p>
                </div>
              ) : (
                transactions
                  .slice(0, 5)
                  .map((transaction) => {

                    const isIncome =
                      transaction.type ===
                        "DEPOSIT" ||
                      transaction.type ===
                        "PAYMENT" ||
                      transaction.type ===
                        "CREDIT";

                    return (
                      <div
                        key={transaction.id}
                        className="p-4 flex items-center justify-between gap-4"
                      >

                        <div className="flex items-center gap-3 min-w-0">

                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              isIncome
                                ? "bg-success/10"
                                : "bg-danger/10"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft
                                size={17}
                                className="text-success"
                              />
                            ) : (
                              <ArrowUpRight
                                size={17}
                                className="text-danger"
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text truncate">
                              {transaction.description ||
                                transaction.type ||
                                "Transaction"}
                            </p>

                            <p className="text-xs text-muted mt-1">
                              {transaction.memberName ||
                                "Member"}{" "}
                              ·{" "}
                              {formatDate(
                                transaction.createdAt
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">

                          <p
                            className={`text-sm font-semibold ${
                              isIncome
                                ? "text-success"
                                : "text-danger"
                            }`}
                          >
                            {isIncome
                              ? "+"
                              : "-"}
                            {formatCurrency(
                              transaction.amount
                            )}
                          </p>

                          <span className="text-[10px] text-muted">
                            {transaction.status ||
                              "Completed"}
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        {/* =========================================================
            QUICK ACTIONS
        ========================================================= */}

        <div className="mt-6 bg-surface border border-border rounded-xl p-5">

          <div className="mb-4">
            <h2 className="font-semibold text-text">
              Quick Actions
            </h2>

            <p className="text-xs text-muted mt-1">
              Frequently used management actions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            <button
              onClick={() =>
                window.location.href =
                  "/register"
              }
              className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-btn hover:bg-btn/5 transition text-left"
            >
              <UserPlus
                size={19}
                className="text-btn"
              />

              <div>
                <p className="text-sm font-medium text-text">
                  Add Member
                </p>

                <p className="text-xs text-muted mt-1">
                  Create a new account
                </p>
              </div>
            </button>

            <button
              onClick={() =>
                window.location.href =
                  "/owner/members"
              }
              className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-btn hover:bg-btn/5 transition text-left"
            >
              <Users
                size={19}
                className="text-btn"
              />

              <div>
                <p className="text-sm font-medium text-text">
                  Manage Members
                </p>

                <p className="text-xs text-muted mt-1">
                  View all members
                </p>
              </div>
            </button>

            <button
              onClick={() =>
                window.location.href =
                  "/owner/payments"
              }
              className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-btn hover:bg-btn/5 transition text-left"
            >
              <CreditCard
                size={19}
                className="text-btn"
              />

              <div>
                <p className="text-sm font-medium text-text">
                  Payments
                </p>

                <p className="text-xs text-muted mt-1">
                  Manage transactions
                </p>
              </div>
            </button>

            <button
              onClick={() =>
                window.location.href =
                  "/owner/notices"
              }
              className="flex items-center gap-3 p-4 border border-border rounded-lg hover:border-btn hover:bg-btn/5 transition text-left"
            >
              <MoreHorizontal
                size={19}
                className="text-btn"
              />

              <div>
                <p className="text-sm font-medium text-text">
                  Notices
                </p>

                <p className="text-xs text-muted mt-1">
                  Send organization notices
                </p>
              </div>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;