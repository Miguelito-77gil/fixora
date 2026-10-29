import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import {
  fetchAdminUsers,
  fetchPendingRepairers,
  verifyRepairer,
} from "@/services/adminService";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

const API_URL =
  import.meta.env.VITE_API_URL || "https://fixora-backend-kw9p.onrender.com";

function getRepairerPhotoUrl(repairer) {
  const photo =
    repairer?.repairer_profile?.photo_url ||
    repairer?.repairer_profile?.photo ||
    repairer?.photo_url ||
    repairer?.profile_photo ||
    repairer?.photo;

  if (!photo) return null;

  const value = String(photo).trim();

  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (value.startsWith("/storage/")) {
    return `${API_URL}${value}`;
  }

  if (value.startsWith("storage/")) {
    return `${API_URL}/${value}`;
  }

  if (value.startsWith("/")) {
    return `${API_URL}${value}`;
  }

  return `${API_URL}/storage/${value}`;
}

function PendingBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-[#fdf3e7] px-2.5 py-1 text-[10px] font-semibold text-[#b9700f]">
      Pending
    </span>
  );
}

function AdminDashboard() {
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [repairers, setRepairers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [usersData, repairersData] = await Promise.all([
        fetchAdminUsers(),
        fetchPendingRepairers(),
      ]);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setRepairers(Array.isArray(repairersData) ? repairersData : []);
    } catch (err) {
      setError(
        err.message || "Failed to load admin dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role !== "admin") return;
    loadDashboard();
  }, [user]);

  async function handleVerify(id, status) {
    setActioningId(id);
    setError("");

    try {
      await verifyRepairer(id, status);

      setRepairers((prev) =>
        prev.filter((repairer) => repairer.id !== id)
      );
    } catch (err) {
      setError(
        err.message || "Failed to update repairer status."
      );
    } finally {
      setActioningId(null);
    }
  }

  function handleLogout() {
    try {
      logout();
    } catch (error) {
      console.error("Auth logout failed:", error);
    }

    localStorage.removeItem("fixora_token");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("auth");

    sessionStorage.removeItem("fixora_token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("auth");

    setSidebarOpen(false);

    window.location.replace("/login");
  }

  const counts = useMemo(() => {
    return {
      total: users.length,

      customers: users.filter(
        (item) => item.role === "customer"
      ).length,

      repairers: users.filter(
        (item) => item.role === "repairer"
      ).length,

      admins: users.filter(
        (item) => item.role === "admin"
      ).length,

      pending: repairers.length,
    };
  }, [users, repairers]);

  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => {
        return (
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
        );
      })
      .slice(0, 5);
  }, [users]);

  const navClass = ({ isActive }) =>
    `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "border border-[#d8c8bc] bg-[#f3eee9] text-[#2f241e]"
        : "text-[#5f5148] hover:bg-[#f8f5f2]"
    }`;

  if (!user) {
    return (
      <section className="min-h-full bg-[#f8f5f2] text-[#2f241e]">
        <div className="flex min-h-[500px] items-center justify-center px-6 py-16">
          <p className="text-sm text-[#777f86]">
            You must be logged in to view this page.
          </p>
        </div>
      </section>
    );
  }

  if (user.role !== "admin") {
    return (
      <section className="min-h-full bg-[#f8f5f2] text-[#2f241e]">
        <div className="flex min-h-[500px] items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-3xl border border-[#d8c8bc] bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-[#2f241e]">
              Access denied
            </h1>

            <p className="mt-3 text-sm text-[#777f86]">
              This page is only available to admins.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f8f5f2] text-[#2f241e] lg:flex-row">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden h-full w-[250px] shrink-0 flex-col border-r border-[#e8dfd8] bg-white lg:flex">
        <nav className="flex-1 px-4 py-6">
          {/* Admin Navigation */}
          <div className="space-y-1">
            <NavLink to="/admin/dashboard" className={navClass}>
              Dashboard
            </NavLink>

            <NavLink to="/admin/users" className={navClass}>
              User Management
            </NavLink>

            <NavLink to="/admin/repairers" className={navClass}>
              Repairer Verification
            </NavLink>
          </div>

          {/* Website Navigation */}
          <div className="my-5 border-t border-[#eee7e2]" />

          <div className="space-y-1">
            <NavLink to="/" className={navClass}>
              Home
            </NavLink>

            <NavLink to="/repairers" className={navClass}>
              Find a Repairer
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-[#5f5148] transition hover:bg-[#f8f5f2]"
            >
              Log Out
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* MOBILE HEADER */}
        <div className="shrink-0 border-b border-[#e8dfd8] bg-white lg:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b9825f]">
                Administration
              </p>

              <h2 className="mt-1 text-lg font-bold tracking-tight text-[#2f241e]">
                Dashboard
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                setSidebarOpen((value) => !value)
              }
              aria-label={
                sidebarOpen
                  ? "Close admin menu"
                  : "Open admin menu"
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8c8bc] bg-white text-[#5f5148] transition hover:bg-[#f3eee9]"
            >
              {sidebarOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="h-5 w-5"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="h-5 w-5"
                >
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {sidebarOpen && (
            <div className="border-t border-[#e8dfd8] bg-white px-4 py-4 shadow-sm">
              <nav className="space-y-1">
                <NavLink
                  to="/admin/dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className={navClass}
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/admin/users"
                  onClick={() => setSidebarOpen(false)}
                  className={navClass}
                >
                  User Management
                </NavLink>

                <NavLink
                  to="/admin/repairers"
                  onClick={() => setSidebarOpen(false)}
                  className={navClass}
                >
                  Repairer Verification
                </NavLink>

                <NavLink
                  to="/"
                  onClick={() => setSidebarOpen(false)}
                  className={navClass}
                >
                  Home
                </NavLink>

                <NavLink
                  to="/repairers"
                  onClick={() => setSidebarOpen(false)}
                  className={navClass}
                >
                  Find a Repairer
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-[#5f5148] transition hover:bg-[#f3eee9]"
                >
                  Log Out
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* SCROLLABLE DASHBOARD */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
            {/* HEADING */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9a6541]">
                  Admin Dashboard
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#2f241e] sm:text-4xl">
                  Fixora Overview
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#75675f]">
                  Monitor users, repairers, and verification activity
                  across the Fixora marketplace.
                </p>
              </div>

              <button
                type="button"
                onClick={loadDashboard}
                disabled={loading}
                className="rounded-xl border border-[#cdb5a2] bg-white px-4 py-2.5 text-sm font-medium text-[#8b5e3c] transition hover:bg-[#f3e5da] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Loading..." : "Refresh Dashboard"}
              </button>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* KPI CARDS */}
            <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* TOTAL USERS */}
              <Card className="rounded-2xl border border-[#e4ded7] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a6541]">
                      Total Users
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#2f241e]">
                      {counts.total}
                    </p>

                    <p className="mt-1 text-xs text-[#81736a]">
                      All registered accounts
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3eee9] text-[#a97955]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                      />
                      <circle cx="9" cy="7" r="4" />
                      <path
                        strokeLinecap="round"
                        d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                      />
                    </svg>
                  </div>
                </div>
              </Card>

              {/* CUSTOMERS */}
              <Card className="rounded-2xl border border-[#e4ded7] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a6541]">
                      Customers
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#2f241e]">
                      {counts.customers}
                    </p>

                    <p className="mt-1 text-xs text-[#81736a]">
                      Customer accounts
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4ee] text-[#39734a]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path
                        strokeLinecap="round"
                        d="M4 21a8 8 0 0 1 16 0"
                      />
                    </svg>
                  </div>
                </div>
              </Card>

              {/* REPAIRERS */}
              <Card className="rounded-2xl border border-[#e4ded7] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a6541]">
                      Repairers
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#2f241e]">
                      {counts.repairers}
                    </p>

                    <p className="mt-1 text-xs text-[#81736a]">
                      Registered repairers
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3eee9] text-[#8b5e3c]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.7 6.3 3-3a4 4 0 0 1 0 5.7l-1.4 1.4"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m10.3 17.7-3 3a4 4 0 0 1-5.7-5.7l3-3"
                      />
                      <path
                        strokeLinecap="round"
                        d="m8 16 8-8"
                      />
                    </svg>
                  </div>
                </div>
              </Card>

              {/* PENDING */}
              <Card className="rounded-2xl border border-[#e4ded7] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a6541]">
                      Pending Verification
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#2f241e]">
                      {counts.pending}
                    </p>

                    <p className="mt-1 text-xs text-[#81736a]">
                      Applications to review
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf3e7] text-[#b9700f]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path
                        strokeLinecap="round"
                        d="M12 7v5l3 2"
                      />
                    </svg>
                  </div>
                </div>
              </Card>
            </section>

            {/* MIDDLE ROW */}
            <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              {/* VERIFICATION */}
              <Card className="rounded-3xl border border-[#e4ded7] bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a6541]">
                      Verification
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-[#2f241e]">
                      Repairer Applications
                    </h2>

                    <p className="mt-1 text-sm text-[#81736a]">
                      Review repairers waiting for approval.
                    </p>
                  </div>

                  <PendingBadge />
                </div>

                {loading ? (
                  <div className="mt-8 rounded-2xl bg-[#fcfaf8] p-8 text-center text-sm text-[#81736a]">
                    Loading applications...
                  </div>
                ) : repairers.length === 0 ? (
                  <div className="mt-8 rounded-2xl border border-dashed border-[#d8c8bc] bg-[#fcfaf8] p-8 text-center">
                    <p className="text-sm font-semibold text-[#2f241e]">
                      All caught up
                    </p>

                    <p className="mt-1 text-xs text-[#81736a]">
                      There are no pending repairer applications.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {repairers.slice(0, 4).map((repairer) => (
                      <div
                        key={repairer.id}
                        className="flex flex-col gap-4 rounded-2xl border border-[#eee7e1] bg-[#fcfaf8] p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#f0e6de]">
                            {getRepairerPhotoUrl(repairer) ? (
                              <img
                                src={getRepairerPhotoUrl(repairer)}
                                alt={repairer.name || "Repairer"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#8b5e3c]">
                                {getInitials(repairer.name)}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-[#2f241e]">
                                {repairer.name || "Unnamed Repairer"}
                              </p>

                              <PendingBadge />
                            </div>

                            <p className="mt-1 truncate text-xs text-[#81736a]">
                              {repairer.email || "No email"}
                            </p>

                            <p className="mt-1 text-xs text-[#a97955]">
                              {repairer.category || "Repair Professional"}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <Button
                            onClick={() =>
                              handleVerify(repairer.id, "verified")
                            }
                            disabled={actioningId === repairer.id}
                            className="!px-3 !py-2 !text-xs"
                          >
                            {actioningId === repairer.id
                              ? "..."
                              : "Approve"}
                          </Button>

                          <Button
                            onClick={() =>
                              handleVerify(repairer.id, "rejected")
                            }
                            variant="outline"
                            disabled={actioningId === repairer.id}
                            className="!px-3 !py-2 !text-xs"
                          >
                            {actioningId === repairer.id
                              ? "..."
                              : "Reject"}
                          </Button>
                        </div>
                      </div>
                    ))}

                    {repairers.length > 4 && (
                      <Link
                        to="/admin/repairers"
                        className="block rounded-xl border border-[#dccfc5] px-4 py-3 text-center text-sm font-medium text-[#8b5e3c] transition hover:bg-[#f8f5f2]"
                      >
                        View all {repairers.length} pending applications
                      </Link>
                    )}
                  </div>
                )}
              </Card>

              {/* USER OVERVIEW */}
              <Card className="rounded-3xl border border-[#e4ded7] bg-white p-6 shadow-sm">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a6541]">
                    User Overview
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-[#2f241e]">
                    Marketplace Accounts
                  </h2>

                  <p className="mt-1 text-sm text-[#81736a]">
                    Current registered account distribution.
                  </p>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#5f5148]">
                        Customers
                      </span>

                      <span className="font-semibold text-[#2f241e]">
                        {counts.customers}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eee7e1]">
                      <div
                        className="h-full rounded-full bg-[#7b9b7a]"
                        style={{
                          width: `${
                            counts.total
                              ? (counts.customers / counts.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#5f5148]">
                        Repairers
                      </span>

                      <span className="font-semibold text-[#2f241e]">
                        {counts.repairers}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eee7e1]">
                      <div
                        className="h-full rounded-full bg-[#b9855c]"
                        style={{
                          width: `${
                            counts.total
                              ? (counts.repairers / counts.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#5f5148]">
                        Administrators
                      </span>

                      <span className="font-semibold text-[#2f241e]">
                        {counts.admins}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eee7e1]">
                      <div
                        className="h-full rounded-full bg-[#765d8f]"
                        style={{
                          width: `${
                            counts.total
                              ? (counts.admins / counts.total) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <Link
                  to="/admin/users"
                  className="mt-7 block rounded-xl border border-[#dccfc5] px-4 py-3 text-center text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#f8f5f2]"
                >
                  Manage Users
                </Link>
              </Card>
            </section>

            {/* RECENT USERS */}
            <section className="mt-8">
              <Card className="overflow-hidden rounded-3xl border border-[#e4ded7] bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-[#eee7e1] p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a6541]">
                      Recent Activity
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-[#2f241e]">
                      Recently Registered Users
                    </h2>

                    <p className="mt-1 text-sm text-[#81736a]">
                      Latest accounts added to the Fixora marketplace.
                    </p>
                  </div>

                  <Link
                    to="/admin/users"
                    className="text-sm font-semibold text-[#9a6541] hover:underline"
                  >
                    View all users
                  </Link>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-sm text-[#81736a]">
                    Loading users...
                  </div>
                ) : recentUsers.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#81736a]">
                    No users available.
                  </div>
                ) : (
                  <div className="divide-y divide-[#eee7e1]">
                    {recentUsers.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f0e6de] text-sm font-bold text-[#8b5e3c]">
                            {getRepairerPhotoUrl(item) ? (
                              <img
                                src={getRepairerPhotoUrl(item)}
                                alt={item.name || "User"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getInitials(item.name)
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-[#2f241e]">
                                {item.name || "Unnamed User"}
                              </p>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                  item.role === "repairer"
                                    ? "bg-[#f3eee9] text-[#8b5e3c]"
                                    : item.role === "admin"
                                    ? "bg-[#eee9f5] text-[#654b82]"
                                    : "bg-[#edf4ee] text-[#39734a]"
                                }`}
                              >
                                {item.role === "repairer"
                                  ? "Repairer"
                                  : item.role === "admin"
                                  ? "Admin"
                                  : "Customer"}
                              </span>
                            </div>

                            <p className="mt-1 truncate text-xs text-[#81736a]">
                              {item.email || "No email"}
                            </p>
                          </div>
                        </div>

                        <div className="text-left text-xs text-[#95877e] sm:text-right">
                          <p>
                            {item.created_at
                              ? new Date(
                                  item.created_at
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </p>

                          <p className="mt-1">
                            User ID: {item.id}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </section>

           {/* ADMIN SHORTCUTS */}
<section className="mt-8">
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a6541]">
      Admin Shortcuts
    </p>

    <h2 className="mt-2 text-xl font-bold text-[#2f241e]">
      Manage Fixora
    </h2>

    <p className="mt-1 text-sm text-[#81736a]">
      Quickly access the main administration tools.
    </p>
  </div>

  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Link
      to="/admin/users"
      className="group rounded-2xl border border-[#e4ded7] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3eee9] text-[#a97955]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
          />
          <circle cx="9" cy="7" r="4" />
          <path
            strokeLinecap="round"
            d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          />
        </svg>
      </div>

      <h3 className="mt-4 text-sm font-bold text-[#2f241e]">
        User Management
      </h3>

      <p className="mt-1 text-xs leading-5 text-[#81736a]">
        View and manage customer, repairer, and admin accounts.
      </p>

      <p className="mt-4 text-xs font-semibold text-[#9a6541] transition group-hover:text-[#7f5034]">
        Open User Management →
      </p>
    </Link>

    <Link
      to="/admin/repairers"
      className="group rounded-2xl border border-[#e4ded7] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf3e7] text-[#b9700f]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3 4 6v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-3Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m9 12 2 2 4-4"
          />
        </svg>
      </div>

      <h3 className="mt-4 text-sm font-bold text-[#2f241e]">
        Repairer Verification
      </h3>

      <p className="mt-1 text-xs leading-5 text-[#81736a]">
        Review applications and approve trusted repairers.
      </p>

      <p className="mt-4 text-xs font-semibold text-[#9a6541] transition group-hover:text-[#7f5034]">
        Review Applications →
      </p>
    </Link>

    <Link
      to="/repairers"
      className="group rounded-2xl border border-[#e4ded7] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4ee] text-[#39734a]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <circle cx="11" cy="11" r="7" />
          <path
            strokeLinecap="round"
                  d="m20 20-4-4"
                        />
                    </svg>
                    </div>

                     <h3 className="mt-4 text-sm font-bold text-[#2f241e]">
                       Browse Repairers
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-[#81736a]">
                       View verified repairers available on the Fixora marketplace.
                    </p>

                 <p className="mt-4 text-xs font-semibold text-[#9a6541] transition group-hover:text-[#7f5034]">
                    Browse Repairers →
               </p>
             </Link>
             </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
