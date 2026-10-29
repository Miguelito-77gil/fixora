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
  if (!value) return "â€”";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "â€”";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPhone(user) {
  return (
    user?.phone ||
    user?.phone_number ||
    user?.contact_number ||
    "Not provided"
  );
}

const API_URL =
  import.meta.env.VITE_API_URL || "https://fixora-backend-kw9p.onrender.com";

function getProfilePhotoUrl(user) {
  const photo =
    user?.repairer_profile?.photo_url ||
    user?.photo_url ||
    user?.photo ||
    user?.profile_photo;

  if (!photo) {
    return null;
  }

  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }

  if (photo.startsWith("/storage/")) {
    return `${API_URL}${photo}`;
  }

  if (photo.startsWith("storage/")) {
    return `${API_URL}/${photo}`;
  }

  if (photo.startsWith("/")) {
    return `${API_URL}${photo}`;
  }

  return `${API_URL}/storage/${photo}`;
}
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);

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

  function isBlocked(user) {
    return (
      blockedUsers.includes(user.id) ||
      user.status === "blocked" ||
      user.blocked === true ||
      user.is_blocked === true
    );
  }

  function handleToggleBlock(user) {
    if (user.role === "admin") return;

    const blocked = isBlocked(user);

    const confirmed = window.confirm(
      blocked
        ? `Unblock ${user.name || "this account"}?`
        : `Block ${user.name || "this account"}?`
    );

    if (!confirmed) return;

    setBlockedUsers((current) =>
      blocked
        ? current.filter((id) => id !== user.id)
        : [...current, user.id]
    );
  }

  function handleDeleteUser(user) {
    if (user.role === "admin") return;

    const confirmed = window.confirm(
      `Delete ${user.name || "this account"} permanently?`
    );

    if (!confirmed) return;

    setDeletingId(user.id);

    setUsers((current) =>
      current.filter((item) => item.id !== user.id)
    );

    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
    }

    setDeletingId(null);
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
        String(getPhone(user))
          .toLowerCase()
          .includes(keyword);

      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-[#f8f5f2] text-[#2f241e]">
      <header className="shrink-0 border-b border-[#e3d9d1] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
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

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
          {/* SUMMARY CARDS */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[#e2d8d0] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a97955]">
                    Total Users
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#2f241e]">
                    {counts.all}
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
            </div>

            <div className="rounded-2xl border border-[#e2d8d0] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a97955]">
                    Customers
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#2f241e]">
                    {counts.customer}
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
            </div>

            <div className="rounded-2xl border border-[#e2d8d0] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a97955]">
                    Repairers
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#2f241e]">
                    {counts.repairer}
                  </p>

                  <p className="mt-1 text-xs text-[#81736a]">
                    Repairer accounts
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
            </div>

            <div className="rounded-2xl border border-[#e2d8d0] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a97955]">
                    Administrators
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#2f241e]">
                    {counts.admin}
                  </p>

                  <p className="mt-1 text-xs text-[#81736a]">
                    Admin accounts
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eee9f5] text-[#654b82]">
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
                      d="m9 12 2 2 4-4"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* USERS */}
          <section className="overflow-hidden rounded-2xl border border-[#e2d8d0] bg-white shadow-sm">
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
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#dfd3c9] bg-[#f0e6de]">
                          {getProfilePhotoUrl(user) ? (
                      <img
                    src={getProfilePhotoUrl(user)}
                   alt={user.name || "User profile"}
                 className="h-full w-full object-cover"
                    />
                    ) : (
                   <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#8b5e3c]">
                    {getInitials(user.name)}
                  </div>
                  )}
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
                            Phone: {getPhone(user)}
                          </span>

                          <span>
                            Joined: {formatDate(user.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 md:justify-end">
                      <div className="text-left text-xs text-[#95877e] md:text-right">
                        <p className="font-medium text-[#75665d]">
                          User ID
                        </p>

                        <p className="mt-1">{user.id}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="rounded-lg border border-[#dccfc5] bg-white px-3 py-2 text-xs font-semibold text-[#5f5148] transition hover:bg-[#f8f5f2]"
                      >
                        View Profile
                      </button>

                      {user.role !== "admin" && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleBlock(user)}
                            title={
                              isBlocked(user)
                                ? "Unblock account"
                                : "Block account"
                            }
                            aria-label={
                              isBlocked(user)
                                ? "Unblock account"
                                : "Block account"
                            }
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                              isBlocked(user)
                                ? "border-[#d8c8bc] bg-[#f3eee9] text-[#8b5e3c] hover:bg-[#eee5de]"
                                : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-4 w-4"
                            >
                              <circle cx="12" cy="12" r="9" />
                              <path
                                strokeLinecap="round"
                                d="m6 6 12 12"
                              />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            disabled={deletingId === user.id}
                            title="Delete account"
                            aria-label="Delete account"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === user.id ? (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-4 w-4 animate-spin"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="9"
                                  strokeOpacity="0.25"
                                />
                                <path
                                  strokeLinecap="round"
                                  d="M21 12a9 9 0 0 1-9 9"
                                />
                              </svg>
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* REAL PROFILE MODAL */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/45 px-4 py-6"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="my-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-[#e2d8d0] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-[#e8dfd8] bg-[#fcfaf8] px-6 py-6 sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-5">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#dfd3c9] bg-[#f0e6de]">
                    {getProfilePhotoUrl(selectedUser) ? (
                      <img
                        src={getProfilePhotoUrl(selectedUser)}
                        alt={selectedUser.name || "Repairer profile"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-[#8b5e3c]">
                        {getInitials(selectedUser.name)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-xl font-bold text-[#2f241e] sm:text-2xl">
                        {selectedUser.name || "Unnamed User"}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${roleClass(
                          selectedUser.role
                        )}`}
                      >
                        {roleLabel(selectedUser.role)}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-[#81736a]">
                      {selectedUser.repairer_profile?.category ||
                        "Repair Professional"}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#95877e]">
                      <span>
                        Joined {formatDate(selectedUser.created_at)}
                      </span>

                      {selectedUser.repairer_profile?.location && (
                        <span>
                          {selectedUser.repairer_profile.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  aria-label="Close profile"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dccfc5] bg-white text-[#75665d] transition hover:bg-[#f3eee9]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      d="M6 6l12 12M18 6L6 18"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <section>
                <h3 className="text-sm font-bold text-[#2f241e]">
                  Contact Information
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#e8dfd8] bg-[#fcfaf8] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a99b92]">
                      Email
                    </p>

                    <p className="mt-2 break-all text-sm font-medium text-[#2f241e]">
                      {selectedUser.email || "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e8dfd8] bg-[#fcfaf8] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a99b92]">
                      Phone
                    </p>

                    <p className="mt-2 text-sm font-medium text-[#2f241e]">
                      {getPhone(selectedUser)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e8dfd8] bg-[#fcfaf8] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a99b92]">
                      User ID
                    </p>

                    <p className="mt-2 text-sm font-medium text-[#2f241e]">
                      {selectedUser.id}
                    </p>
                  </div>
                </div>
              </section>

              {selectedUser.role === "repairer" &&
                selectedUser.repairer_profile && (
                  <section>
                    <h3 className="text-sm font-bold text-[#2f241e]">
                      Professional Information
                    </h3>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-2xl border border-[#e8dfd8] bg-white p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a99b92]">
                          Category
                        </p>

                        <p className="mt-2 text-sm font-semibold text-[#2f241e]">
                          {selectedUser.repairer_profile.category ||
                            "Not provided"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#e8dfd8] bg-white p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a99b92]">
                          Experience
                        </p>

                        <p className="mt-2 text-sm font-semibold text-[#2f241e]">
                          {selectedUser.repairer_profile.years_experience !=
                          null
                            ? `${selectedUser.repairer_profile.years_experience} years`
                            : "Not provided"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#e8dfd8] bg-white p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a99b92]">
                          Service Price
                        </p>

                        <p className="mt-2 text-sm font-semibold text-[#2f241e]">
                          {selectedUser.repairer_profile.price != null
                            ? `â‚±${selectedUser.repairer_profile.price}`
                            : "Not provided"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#e8dfd8] bg-white p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a99b92]">
                          Availability
                        </p>

                        <p
                          className={`mt-2 text-sm font-semibold ${
                            selectedUser.repairer_profile.available
                              ? "text-[#39734a]"
                              : "text-[#a55d4e]"
                          }`}
                        >
                          {selectedUser.repairer_profile.available
                            ? "Available"
                            : "Unavailable"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl border border-[#e8dfd8] bg-white p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a99b92]">
                        Location
                      </p>

                      <p className="mt-2 text-sm text-[#2f241e]">
                        {selectedUser.repairer_profile.location ||
                          "Not provided"}
                      </p>
                    </div>
                  </section>
                )}

              {selectedUser.role === "repairer" &&
                selectedUser.repairer_profile?.bio && (
                  <section>
                    <h3 className="text-sm font-bold text-[#2f241e]">
                      About
                    </h3>

                    <div className="mt-3 rounded-2xl border border-[#e8dfd8] bg-[#fcfaf8] p-5">
                      <p className="whitespace-pre-line text-sm leading-6 text-[#75665d]">
                        {selectedUser.repairer_profile.bio}
                      </p>
                    </div>
                  </section>
                )}

              <section>
                <h3 className="text-sm font-bold text-[#2f241e]">
                  Account Status
                </h3>

                <div className="mt-3 flex flex-wrap gap-3">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      selectedUser.role === "repairer" &&
                      selectedUser.repairer_profile?.verification_status ===
                        "verified"
                        ? "bg-[#edf4ee] text-[#39734a]"
                        : "bg-[#f3eee9] text-[#8b5e3c]"
                    }`}
                  >
                    {selectedUser.role === "repairer"
                      ? selectedUser.repairer_profile
                          ?.verification_status || "Pending"
                      : "Active Account"}
                  </span>
                </div>
              </section>
            </div>

            <div className="flex justify-end border-t border-[#e8dfd8] bg-[#fcfaf8] px-6 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-xl bg-[#b9855c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a9744e]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}    </div>
  );
}

export default UserManagement;
