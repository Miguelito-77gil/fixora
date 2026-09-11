import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import logoImage from "@/assets/luh.png";

import {
  fetchPendingRepairers,
  verifyRepairer,
} from "@/services/adminService";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Icon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    className: "h-5 w-5",
  };

  if (name === "dashboard") {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg {...common}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 21v-1.5A3.5 3.5 0 0 0 12.5 16h-5A3.5 3.5 0 0 0 4 19.5V21"
        />
        <circle cx="10" cy="9" r="3" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11a3 3 0 1 0 0-6"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 16.5a3.5 3.5 0 0 1 3 3.5V21"
        />
      </svg>
    );
  }

  if (name === "verification") {
    return (
      <svg {...common}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3.5 19 6v5.5c0 4.5-2.8 7.4-7 9-4.2-1.6-7-4.5-7-9V6l7-2.5Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m9 12 2 2 4-4"
        />
      </svg>
    );
  }

  if (name === "requests") {
    return (
      <svg {...common}>
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="2.5"
        />
        <path
          strokeLinecap="round"
          d="M8 9h8M8 13h5M8 17h4"
        />
      </svg>
    );
  }

  if (name === "profile") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.5 20a6.5 6.5 0 0 1 13 0"
        />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg {...common}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 6.75 20.25 12 15 17.25M20 12H9"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4.5v15"
        />
      </svg>
    );
  }

  if (name === "refresh") {
    return (
      <svg {...common}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 11a8 8 0 0 0-14.9-3.9L4 9"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5v4h4"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 13a8 8 0 0 0 14.9 3.9L20 15"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 19v-4h-4"
        />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="6.5" />
        <path
          strokeLinecap="round"
          d="m16 16 4 4"
        />
      </svg>
    );
  }

  return null;
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [repairers, setRepairers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  async function loadRepairers(showRefreshState = false) {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await fetchPendingRepairers();

      setRepairers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error("Failed to load pending repairers:", err);

      setError(
        err.message ||
          "Failed to load pending repairers."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (user?.role !== "admin") return;

    loadRepairers();
  }, [user]);

  async function handleVerify(id, status) {
    setActioningId(id);
    setError("");

    try {
      await verifyRepairer(id, status);

      setRepairers((current) =>
        current.filter(
          (repairer) =>
            repairer.id !== id
        )
      );
    } catch (err) {
      console.error(
        "Failed to update repairer:",
        err
      );

      setError(
        err.message ||
          "Failed to update repairer status."
      );
    } finally {
      setActioningId(null);
    }
  }

  function handleLogout() {
    logout();
    setSidebarOpen(false);
    navigate("/");
  }

  const filteredRepairers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return repairers;
    }

    return repairers.filter((repairer) => {
      const name =
        String(repairer.name || "")
          .toLowerCase();

      const email =
        String(repairer.email || "")
          .toLowerCase();

      const category =
        String(repairer.category || "")
          .toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        category.includes(query)
      );
    });
  }, [repairers, search]);

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-[#f3e9e1] text-[#8b5e3c]"
        : "text-[#5f5148] hover:bg-[#f8f5f2]"
    }`;

  if (!user) {
    return (
      <section className="min-h-screen bg-[#f8f5f2] text-[#2f241e]">
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
      <section className="min-h-screen bg-[#f8f5f2] text-[#2f241e]">
        <div className="flex min-h-screen items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-3xl border border-[#e4ded7] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3e9e1] text-[#9a6541]">
              <Icon name="verification" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-[#2f241e]">
              Access denied
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#777f86]">
              This page is only available to
              administrators.
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a9704e]"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2] text-[#2f241e]">

      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e8dfd8] bg-white/95 px-5 py-4 backdrop-blur lg:hidden">
        <div>
          <p className="text-lg font-bold tracking-tight text-[#2f241e]">
            Fixora
          </p>

          <p className="text-xs text-[#8a7a70]">
            Admin Dashboard
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl border border-[#d8c8bc] bg-white px-4 py-2 text-sm font-semibold text-[#5f5148] transition hover:bg-[#f3eee9]"
        >
          Menu
        </button>
      </header>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#e8dfd8] bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* SIDEBAR NAVBAR */}
        <div className="flex h-20 items-center border-b border-[#eee7e2] px-5">
          <NavLink
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="inline-flex items-center rounded-xl p-1 transition hover:bg-[#f8f5f2]"
            aria-label="Go to Fixora Home"
          >
            <img
              src={logoImage}
              alt="Fixora"
              className="h-10 w-auto object-contain"
            />
          </NavLink>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6">
  <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8779]">
    MANAGEMENT
  </div>

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
</nav>

        {/* LOGOUT */}
        <div className="border-t border-[#eee7e2] p-4">

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#5f5148] transition hover:bg-[#f3eee9] hover:text-[#8b5e3c]"
          >
            <Icon name="logout" />
            <span>Log Out</span>
          </button>

        </div>

      </aside>

      {/* MAIN */}
      <main className="lg:pl-64">

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">

          {/* PAGE HEADER */}
          <header className="flex flex-col gap-5 border-b border-[#e5ddd6] pb-8 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6541]">
                Administration
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#2f241e] sm:text-4xl">
                Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75675f]">
                Monitor Fixora and review repairer
                applications that require your attention.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadRepairers(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d8c8bc] bg-white px-4 py-2.5 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#f3eee9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              >
                <Icon name="refresh" />
              </span>

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </header>

          {/* OVERVIEW */}
          <section className="mt-8">

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <article className="rounded-2xl border border-[#e4ded7] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9a6541]">
                      Pending Verification
                    </p>

                    <p className="mt-3 text-3xl font-bold text-[#2f241e]">
                      {repairers.length}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3e9e1] text-[#9a6541]">
                    <Icon name="verification" />
                  </div>

                </div>

                <p className="mt-3 text-xs leading-5 text-[#777f86]">
                  Repairer applications currently
                  waiting for review.
                </p>
              </article>

              <article className="rounded-2xl border border-[#e4ded7] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9a6541]">
                      Review Queue
                    </p>

                    <p className="mt-3 text-3xl font-bold text-[#2f241e]">
                      {filteredRepairers.length}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5f1ed] text-[#75675f]">
                    <Icon name="requests" />
                  </div>

                </div>

                <p className="mt-3 text-xs leading-5 text-[#777f86]">
                  Applications matching your current
                  search.
                </p>
              </article>

              <article className="rounded-2xl border border-[#e4ded7] bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9a6541]">
                      Admin Status
                    </p>

                    <p className="mt-3 text-lg font-bold text-[#28734a]">
                      Operational
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf7f0] text-[#28734a]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#4b9b6b]" />
                  </div>

                </div>

                <p className="mt-3 text-xs leading-5 text-[#777f86]">
                  Verification tools are available.
                </p>
              </article>

            </div>

          </section>

          {/* ERROR */}
          {error && (
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm leading-6 text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => loadRepairers(true)}
                className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
              >
                Try Again
              </button>

            </div>
          )}

          {/* VERIFICATION */}
          <section
            id="verification"
            className="mt-10 scroll-mt-24"
          >

            <div className="flex flex-col gap-4 border-b border-[#e5ddd6] pb-5 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6541]">
                  Verification
                </p>

                <h2 className="mt-2 text-xl font-bold text-[#2f241e]">
                  Repairer Applications
                </h2>

                <p className="mt-2 text-sm text-[#777f86]">
                  Review applications before they
                  become visible as verified repairers.
                </p>
              </div>

              <div className="relative w-full sm:w-72">

                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#a28f83]">
                  <Icon name="search" />
                </div>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search applications..."
                  className="w-full rounded-xl border border-[#d8c8bc] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2f241e] outline-none transition placeholder:text-[#a28f83] focus:border-[#b9825f] focus:ring-2 focus:ring-[#b9825f]/10"
                />

              </div>

            </div>

            {/* LOADING */}
            {loading ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-[#e4ded7] bg-white p-5"
                  >
                    <div className="flex gap-3">
                      <div className="h-11 w-11 rounded-xl bg-[#eee9e3]" />

                      <div className="flex-1">
                        <div className="h-4 w-32 rounded bg-[#eee9e3]" />
                        <div className="mt-2 h-3 w-40 rounded bg-[#eee9e3]" />
                      </div>
                    </div>

                    <div className="mt-5 h-3 w-28 rounded bg-[#eee9e3]" />
                    <div className="mt-3 h-10 rounded-xl bg-[#f5f1ed]" />
                    <div className="mt-5 h-9 rounded-xl bg-[#eee9e3]" />
                  </div>
                ))}

              </div>
            ) : filteredRepairers.length === 0 ? (

              <div className="mt-6 rounded-2xl border border-dashed border-[#d8c8bc] bg-white px-6 py-20 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3e9e1] text-[#9a6541]">
                  <Icon name="verification" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#2f241e]">
                  {search
                    ? "No matching applications"
                    : "No pending applications"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777f86]">
                  {search
                    ? "Try a different name, email, or category."
                    : "All repairer applications have been reviewed. New applications will appear here automatically."}
                </p>

                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-5 rounded-xl border border-[#d8c8bc] bg-white px-5 py-2.5 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#f3eee9]"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => loadRepairers(true)}
                    className="mt-5 rounded-xl bg-[#b9825f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a9704e]"
                  >
                    Check Again
                  </button>
                )}

              </div>

            ) : (

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {filteredRepairers.map((repairer) => {

                  const isActioning =
                    actioningId === repairer.id;

                  const initials =
                    getInitials(
                      repairer.name
                    ) || "RP";

                  return (
                    <article
                      key={repairer.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-[#e4ded7] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >

                      {/* CARD HEADER */}
                      <div className="p-5">

                        <div className="flex items-start gap-3">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1e8e0] text-sm font-bold text-[#9b806a]">
                            {initials}
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-2">

                              <h3 className="truncate text-sm font-bold text-[#2f241e]">
                                {repairer.name ||
                                  "Unnamed Repairer"}
                              </h3>

                              <span className="shrink-0 rounded-full bg-[#fdf3e7] px-2 py-1 text-[10px] font-bold text-[#b9700f]">
                                Pending
                              </span>

                            </div>

                            <p className="mt-1 truncate text-xs text-[#8a9298]">
                              {repairer.email ||
                                "No email provided"}
                            </p>

                          </div>

                        </div>

                        {/* INFO */}
                        <div className="mt-5 space-y-3">

                          <div className="rounded-xl bg-[#faf8f5] px-4 py-3">

                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a6541]">
                              Category
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#2f241e]">
                              {repairer.category ||
                                "Not provided"}
                            </p>

                          </div>

                          <div className="grid grid-cols-2 gap-3">

                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a6541]">
                                Experience
                              </p>

                              <p className="mt-1 text-sm font-medium text-[#4f443d]">
                                {repairer.years_experience != null &&
                                repairer.years_experience !== ""
                                  ? `${repairer.years_experience} years`
                                  : "Not provided"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a6541]">
                                Status
                              </p>

                              <p className="mt-1 text-sm font-medium text-[#b9700f]">
                                Pending
                              </p>
                            </div>

                          </div>

                        </div>

                        {/* BIO */}
                        {repairer.bio && (
                          <div className="mt-5 border-t border-[#eee9e3] pt-4">

                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a6541]">
                              About
                            </p>

                            <p className="mt-2 line-clamp-4 text-xs leading-5 text-[#68727c]">
                              {repairer.bio}
                            </p>

                          </div>
                        )}

                      </div>

                      {/* ACTIONS */}
                      <div className="mt-auto border-t border-[#eee9e3] bg-[#fcfaf8] p-4">

                        <div className="grid grid-cols-2 gap-2">

                          <button
                            type="button"
                            disabled={isActioning}
                            onClick={() =>
                              handleVerify(
                                repairer.id,
                                "verified"
                              )
                            }
                            className="rounded-xl bg-[#b9825f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a9704e] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isActioning
                              ? "Updating..."
                              : "Approve"}
                          </button>

                          <button
                            type="button"
                            disabled={isActioning}
                            onClick={() =>
                              handleVerify(
                                repairer.id,
                                "rejected"
                              )
                            }
                            className="rounded-xl border border-[#d8c8bc] bg-white px-4 py-2.5 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#f3eee9] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isActioning
                              ? "Updating..."
                              : "Reject"}
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

          </section>



        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;





