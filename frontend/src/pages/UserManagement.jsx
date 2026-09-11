import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { fetchAdminUsers } from "@/services/adminService";

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

function roleLabel(role) {
  if (role === "repairer") return "Repairer";
  if (role === "admin") return "Admin";
  return "Customer";
}

function roleClass(role) {
  if (role === "repairer") {
    return "bg-[#f3eee9] text-[#8b5e3c]";
  }

  if (role === "admin") {
    return "bg-[#eee9f5] text-[#654b82]";
  }

  return "bg-[#edf4ee] text-[#39734a]";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadUsers(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await fetchAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const counts = useMemo(() => {
    return {
      all: users.length,
      customer: users.filter((user) => user.role === "customer").length,
      repairer: users.filter((user) => user.role === "repairer").length,
      admin: users.filter((user) => user.role === "admin").length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      const matchesSearch =
        !keyword ||
        String(user.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(user.email || "")
          .toLowerCase()
          .includes(keyword) ||
        String(user.phone || "")
          .toLowerCase()
          .includes(keyword);

      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="min-h-screen bg-[#f8f5f2] text-[#2f241e]">
      <header className="border-b border-[#e3d9d1] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a97955]">
              Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              User Management
            </h1>

            <p className="mt-1 text-sm text-[#75665d]">
              View and manage Fixora customer and repairer accounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="rounded-xl border border-[#dccfc5] bg-white px-4 py-2.5 text-sm font-medium text-[#5f5148] transition hover:bg-[#f8f5f2]"
            >
              Dashboard
            </Link>

            <button
              type="button"
              onClick={() => loadUsers(true)}
              disabled={refreshing}
              className="rounded-xl border border-[#dccfc5] bg-white px-4 py-2.5 text-sm font-medium text-[#5f5148] transition hover:bg-[#f8f5f2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#e2d8d0] bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a97955]">
              Total Users
            </p>
            <p className="mt-3 text-3xl font-bold">{counts.all}</p>
            <p className="mt-1 text-xs text-[#81736a]">
              All registered accounts
            </p>
          </div>

          <div className="rounded-2xl border border-[#e2d8d0] bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a97955]">
              Customers
            </p>
            <p className="mt-3 text-3xl font-bold">{counts.customer}</p>
            <p className="mt-1 text-xs text-[#81736a]">
              Customer accounts
            </p>
          </div>

          <div className="rounded-2xl border border-[#e2d8d0] bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a97955]">
              Repairers
            </p>
            <p className="mt-3 text-3xl font-bold">{counts.repairer}</p>
            <p className="mt-1 text-xs text-[#81736a]">
              Repairer accounts
            </p>
          </div>

          <div className="rounded-2xl border border-[#e2d8d0] bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a97955]">
              Administrators
            </p>
            <p className="mt-3 text-3xl font-bold">{counts.admin}</p>
            <p className="mt-1 text-xs text-[#81736a]">
              Admin accounts
            </p>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#e2d8d0] bg-white shadow-sm">
          <div className="border-b border-[#e8dfd8] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Registered Users
                </h2>

                <p className="mt-1 text-sm text-[#81736a]">
                  Search and filter registered Fixora accounts.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email, phone..."
                  className="w-full rounded-xl border border-[#dccfc5] bg-white px-4 py-2.5 text-sm text-[#2f241e] outline-none placeholder:text-[#a99b92] focus:border-[#b9855c] sm:w-72"
                />

                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  className="rounded-xl border border-[#dccfc5] bg-white px-4 py-2.5 text-sm text-[#5f5148] outline-none focus:border-[#b9855c]"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customers</option>
                  <option value="repairer">Repairers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center">
              <p className="text-sm font-medium text-[#5f5148]">
                Loading users...
              </p>

              <p className="mt-1 text-xs text-[#95877e]">
                Connecting to the Fixora server.
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3eee9] text-sm font-bold text-[#a97955]">
                U
              </div>

              <h3 className="mt-4 text-base font-bold">
                {users.length === 0
                  ? "No users found"
                  : "No matching users"}
              </h3>

              <p className="mt-1 text-sm text-[#81736a]">
                {users.length === 0
                  ? "There are currently no registered users in the database."
                  : "Try changing your search or role filter."}
              </p>

              <button
                type="button"
                onClick={() => loadUsers(true)}
                className="mt-5 rounded-xl bg-[#b9855c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a9744e]"
              >
                Check Again
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#eee7e1]">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 p-5 transition hover:bg-[#fcfaf8] md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0e6de] text-sm font-bold text-[#8b5e3c]">
                      {getInitials(user.name)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold">
                          {user.name || "Unnamed User"}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${roleClass(
                            user.role
                          )}`}
                        >
                          {roleLabel(user.role)}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm text-[#75665d]">
                        {user.email || "No email"}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#95877e]">
                        <span>
                          Phone: {user.phone || "Not provided"}
                        </span>

                        <span>
                          Joined: {formatDate(user.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left text-xs text-[#95877e] md:text-right">
                    <p className="font-medium text-[#75665d]">
                      User ID
                    </p>

                    <p className="mt-1">{user.id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default UserManagement;

