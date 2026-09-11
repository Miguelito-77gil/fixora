import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  fetchPendingRepairers,
  verifyRepairer,
} from "@/services/adminService";

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "RP"
  );
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

  return null;
}

function RepairerVerification() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [repairers, setRepairers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState("");
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
      setRepairers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load repairers:", err);
      setError(err.message || "Failed to load repairer applications.");
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
    const action = status === "verified" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this repairer application?`
    );

    if (!confirmed) return;

    setActioningId(id);
    setError("");

    try {
      await verifyRepairer(id, status);

      setRepairers((current) =>
        current.filter((repairer) => repairer.id !== id)
      );
    } catch (err) {
      console.error("Failed to update repairer:", err);
      setError(err.message || "Failed to update repairer status.");
    } finally {
      setActioningId(null);
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const filteredRepairers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return repairers;

    return repairers.filter((repairer) => {
      const name = String(repairer.name || "").toLowerCase();
      const email = String(repairer.email || "").toLowerCase();
      const category = String(repairer.category || "").toLowerCase();
      const location = String(repairer.location || "").toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        category.includes(query) ||
        location.includes(query)
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
        <div className="flex min-h-screen items-center justify-center px-6">
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
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-[#e4ded7] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3e9e1] text-[#9a6541]">
              <Icon name="verification" />
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Access denied
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#777f86]">
              This page is only available to administrators.
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
          <p className="text-lg font-bold tracking-tight">
            Fixora
          </p>
          <p className="text-xs text-[#8a7a70]">
            Admin Panel
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          className="rounded-xl border border-[#d8c8bc] bg-white px-4 py-2 text-sm font-semibold text-[#5f5148] transition hover:bg-[#f3eee9]"
        >
          Dashboard
        </button>
      </header>

      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#e8dfd8] bg-white lg:flex">

        {/* LOGO */}
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

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6">
          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a8779]">
            MANAGEMENT
          </div>

          <NavLink
            to="/admin/dashboard"
            className={navClass}
          >
            <Icon name="dashboard" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={navClass}
          >
            <Icon name="users" />
            <span>User Management</span>
          </NavLink>

          <NavLink
            to="/admin/repairers"
            className={navClass}
          >
            <Icon name="verification" />
            <span>Repairer Verification</span>
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

          {/* HEADER */}
          <header className="flex flex-col gap-5 border-b border-[#e5ddd6] pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6541]">
                Administration
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Repairer Verification
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75675f]">
                Review repairer applications before they become
                visible as verified repairers on Fixora.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadRepairers(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d8c8bc] bg-white px-4 py-2.5 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#f3eee9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className={refreshing ? "animate-spin" : ""}>
                <Icon name="refresh" />
              </span>

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </header>

          {/* SUMMARY */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-[#e4ded7] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9a6541]">
                Pending Applications
              </p>

              <p className="mt-3 text-3xl font-bold">
                {repairers.length}
              </p>

              <p className="mt-2 text-xs text-[#777f86]">
                Applications waiting for admin review.
              </p>
            </article>

            <article className="rounded-2xl border border-[#e4ded7] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9a6541]">
                Review Results
              </p>

              <p className="mt-3 text-3xl font-bold">
                {filteredRepairers.length}
              </p>

              <p className="mt-2 text-xs text-[#777f86]">
                Applications matching your search.
              </p>
            </article>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
              <p className="text-sm leading-6 text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* SEARCH */}
          <section className="mt-8">
            <div className="flex flex-col gap-4 border-b border-[#e5ddd6] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6541]">
                  Verification Queue
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Repairer Applications
                </h2>

                <p className="mt-2 text-sm text-[#777f86]">
                  Approve qualified applicants or reject applications
                  that need to be declined.
                </p>
              </div>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, category..."
                className="w-full rounded-xl border border-[#d8c8bc] bg-white px-4 py-2.5 text-sm text-[#2f241e] outline-none placeholder:text-[#a28f83] focus:border-[#b9825f] focus:ring-2 focus:ring-[#b9825f]/10 sm:w-80"
              />
            </div>

            {/* CONTENT */}
            {loading ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-[#e4ded7] bg-white p-5"
                  >
                    <div className="flex gap-3">
                      <div className="h-12 w-12 rounded-xl bg-[#eee9e3]" />

                      <div className="flex-1">
                        <div className="h-4 w-32 rounded bg-[#eee9e3]" />
                        <div className="mt-2 h-3 w-40 rounded bg-[#eee9e3]" />
                      </div>
                    </div>

                    <div className="mt-5 h-10 rounded-xl bg-[#f5f1ed]" />
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

                <h3 className="mt-5 text-lg font-bold">
                  {search
                    ? "No matching applications"
                    : "No pending applications"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#777f86]">
                  {search
                    ? "Try a different name, email, category, or clear your search."
                    : "All current repairer applications have been reviewed."}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (search) {
                      setSearch("");
                    } else {
                      loadRepairers(true);
                    }
                  }}
                  className="mt-5 rounded-xl bg-[#b9825f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a9704e]"
                >
                  {search ? "Clear Search" : "Check Again"}
                </button>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {filteredRepairers.map((repairer) => {
                  const isActioning = actioningId === repairer.id;

                  return (
                    <article
                      key={repairer.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-[#e4ded7] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >

                      {/* CARD */}
                      <div className="p-5">

                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1e8e0] text-sm font-bold text-[#9b806a]">
                            {getInitials(repairer.name)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="truncate text-sm font-bold">
                                {repairer.name || "Unnamed Repairer"}
                              </h3>

                              <span className="shrink-0 rounded-full bg-[#fdf3e7] px-2 py-1 text-[10px] font-bold text-[#b9700f]">
                                Pending
                              </span>
                            </div>

                            <p className="mt-1 truncate text-xs text-[#8a9298]">
                              {repairer.email || "No email provided"}
                            </p>
                          </div>
                        </div>

                        {/* CATEGORY */}
                        <div className="mt-5 rounded-xl bg-[#faf8f5] px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a6541]">
                            Service Category
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {repairer.category || "Not provided"}
                          </p>
                        </div>

                        {/* DETAILS */}
                        <div className="mt-5 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a6541]">
                              Experience
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#4f443d]">
                              {repairer.years_experience !== null &&
                              repairer.years_experience !== undefined &&
                              repairer.years_experience !== ""
                                ? `${repairer.years_experience} years`
                                : "Not provided"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a6541]">
                              Location
                            </p>

                            <p className="mt-1 truncate text-sm font-medium text-[#4f443d]">
                              {repairer.location || "Not provided"}
                            </p>
                          </div>
                        </div>

                        {/* PHONE */}
                        <div className="mt-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a6541]">
                            Phone
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#4f443d]">
                            {repairer.phone || "Not provided"}
                          </p>
                        </div>

                        {/* BIO */}
                        <div className="mt-5 border-t border-[#eee9e3] pt-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a6541]">
                            About Applicant
                          </p>

                          <p className="mt-2 line-clamp-4 text-xs leading-5 text-[#68727c]">
                            {repairer.bio || "No description provided."}
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="mt-auto border-t border-[#eee9e3] bg-[#fcfaf8] p-4">
                        <div className="grid grid-cols-2 gap-2">

                          <button
                            type="button"
                            disabled={isActioning}
                            onClick={() =>
                              handleVerify(repairer.id, "verified")
                            }
                            className="rounded-xl bg-[#b9825f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a9704e] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isActioning ? "Updating..." : "Approve"}
                          </button>

                          <button
                            type="button"
                            disabled={isActioning}
                            onClick={() =>
                              handleVerify(repairer.id, "rejected")
                            }
                            className="rounded-xl border border-[#d8c8bc] bg-white px-4 py-2.5 text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#f3eee9] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isActioning ? "Updating..." : "Reject"}
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

export default RepairerVerification;