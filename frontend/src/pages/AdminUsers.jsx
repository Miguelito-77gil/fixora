import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { fetchAdminUsers } from "@/services/adminService";

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
    return "bg-[#ece7e2] text-[#5f5148]";
  }

  return "bg-[#f5f5f5] text-[#555]";
}

export default function AdminUsers() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchAdminUsers();

        if (mounted) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load users.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((item) => {
      const matchesRole =
        roleFilter === "all" ||
        String(item.role || "customer").toLowerCase() === roleFilter;

      const matchesSearch =
        !query ||
        String(item.name || "").toLowerCase().includes(query) ||
        String(item.email || "").toLowerCase().includes(query) ||
        String(item.phone || "").toLowerCase().includes(query);

      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const customerCount = users.filter(
    (item) => String(item.role || "customer").toLowerCase() === "customer"
  ).length;

  const repairerCount = users.filter(
    (item) => String(item.role || "").toLowerCase() === "repairer"
  ).length;

  const adminCount = users.filter(
    (item) => String(item.role || "").toLowerCase() === "admin"
  ).length;

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#2f2925]">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-[#eee7e2] bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b border-[#eee7e2] px-5">
            <NavLink
              to="/"
              className="inline-flex items-center rounded-xl p-1 transition hover:bg-[#f8f5f2]"
              aria-label="Go to Fixora Home"
            >
              <img
                src="/src/assets/luh.png"
                alt="Fixora"
                className="h-10 w-auto object-contain"
              />
            </NavLink>
          </div>

          <nav className="flex-1 px-4 py-6">
            <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8779]">
              MANAGEMENT
            </div>

            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `mb-1 flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#f3eee9] text-[#8b5e3c]"
                    : "text-[#5f5148] hover:bg-[#f8f5f2]"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `mb-1 flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#f3eee9] text-[#8b5e3c]"
                    : "text-[#5f5148] hover:bg-[#f8f5f2]"
                }`
              }
            >
              User Management
            </NavLink>
          </nav>

          <div className="border-t border-[#eee7e2] p-4">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("fixora_user");
                localStorage.removeItem("fixora_token");
                window.location.href = "/login";
              }}
              className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-[#5f5148] transition hover:bg-[#f3eee9] hover:text-[#8b5e3c]"
            >
              Log Out
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">
          <header className="border-b border-[#eee7e2] bg-white px-5 py-5 sm:px-8">
            <div className="mx-auto max-w-7xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a8779]">
                Administration
              </p>

              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#2f2925] sm:text-3xl">
                    User Management
                  </h1>

                  <p className="mt-1 text-sm text-[#81736a]">
                    Manage and review registered Fixora users.
                  </p>
                </div>

                <div className="text-sm text-[#81736a]">
                  Signed in as{" "}
                  <span className="font-semibold text-[#5f5148]">
                    {user?.name || "Administrator"}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <section className="px-5 py-7 sm:px-8 sm:py-9">
            <div className="mx-auto max-w-7xl">
              {/* STAT CARDS */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-[#eee7e2] bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9a8779]">
                    Total Users
                  </p>
                  <p className="mt-3 text-3xl font-bold text-[#2f2925]">
                    {users.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#eee7e2] bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9a8779]">
                    Customers
                  </p>
                  <p className="mt-3 text-3xl font-bold text-[#2f2925]">
                    {customerCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#eee7e2] bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9a8779]">
                    Repairers
                  </p>
                  <p className="mt-3 text-3xl font-bold text-[#2f2925]">
                    {repairerCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#eee7e2] bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9a8779]">
                    Admins
                  </p>
                  <p className="mt-3 text-3xl font-bold text-[#2f2925]">
                    {adminCount}
                  </p>
                </div>
              </div>

              {/* FILTER BAR */}
              <div className="mt-7 rounded-2xl border border-[#eee7e2] bg-white p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="w-full lg:max-w-md">
                    <label className="sr-only" htmlFor="user-search">
                      Search users
                    </label>

                    <input
                      id="user-search"
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by name, email, or phone..."
                      className="w-full rounded-xl border border-[#e6ded8] bg-[#faf9f7] px-4 py-3 text-sm text-[#2f2925] outline-none transition placeholder:text-[#a99b91] focus:border-[#b89070] focus:ring-2 focus:ring-[#b89070]/10"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      ["all", "All"],
                      ["customer", "Customers"],
                      ["repairer", "Repairers"],
                      ["admin", "Admins"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRoleFilter(value)}
                        className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                          roleFilter === value
                            ? "bg-[#8b5e3c] text-white"
                            : "bg-[#f8f5f2] text-[#5f5148] hover:bg-[#f3eee9]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* USER TABLE */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-[#eee7e2] bg-white">
                <div className="border-b border-[#eee7e2] px-5 py-4">
                  <p className="text-sm font-semibold text-[#5f5148]">
                    {filteredUsers.length}{" "}
                    {filteredUsers.length === 1 ? "user" : "users"} found
                  </p>
                </div>

                {loading ? (
                  <div className="px-5 py-14 text-center text-sm text-[#81736a]">
                    Loading users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="px-5 py-14 text-center">
                    <p className="font-semibold text-[#5f5148]">
                      No users found
                    </p>
                    <p className="mt-1 text-sm text-[#9a8779]">
                      Try changing your search or role filter.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* DESKTOP TABLE */}
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[760px] text-left">
                        <thead className="bg-[#faf9f7]">
                          <tr className="border-b border-[#eee7e2]">
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#9a8779]">
                              User
                            </th>
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#9a8779]">
                              Email
                            </th>
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#9a8779]">
                              Phone
                            </th>
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#9a8779]">
                              Role
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredUsers.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-[#f0ebe7] last:border-b-0"
                            >
                              <td className="px-5 py-4">
                                <div className="font-semibold text-[#3b332e]">
                                  {item.name || "Unnamed User"}
                                </div>
                                <div className="mt-0.5 text-xs text-[#a09289]">
                                  ID #{item.id}
                                </div>
                              </td>

                              <td className="px-5 py-4 text-sm text-[#6f6259]">
                                {item.email || "—"}
                              </td>

                              <td className="px-5 py-4 text-sm text-[#6f6259]">
                                {item.phone || "—"}
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleClass(
                                    item.role
                                  )}`}
                                >
                                  {roleLabel(item.role)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* MOBILE CARDS */}
                    <div className="divide-y divide-[#f0ebe7] md:hidden">
                      {filteredUsers.map((item) => (
                        <div key={item.id} className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#3b332e]">
                                {item.name || "Unnamed User"}
                              </p>

                              <p className="mt-1 truncate text-sm text-[#6f6259]">
                                {item.email || "—"}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${roleClass(
                                item.role
                              )}`}
                            >
                              {roleLabel(item.role)}
                            </span>
                          </div>

                          <div className="mt-4 grid gap-2 text-xs text-[#81736a]">
                            <p>
                              <span className="font-semibold text-[#6f6259]">
                                ID:
                              </span>{" "}
                              #{item.id}
                            </p>

                            <p>
                              <span className="font-semibold text-[#6f6259]">
                                Phone:
                              </span>{" "}
                              {item.phone || "—"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
