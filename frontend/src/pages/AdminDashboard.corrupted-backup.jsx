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
      <section className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f8f5f2] text-[#2f241e] lg:flex-row">
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
      <section className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f8f5f2] text-[#2f241e] lg:flex-row">
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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f8f5f2] text-[#2f241e] lg:flex-row">
<div className="border-b border-[#e7e2dc] bg-[#f7f7f5] lg:hidden">
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
  onClick={() => setSidebarOpen((current) => !current)}
  aria-label="Open admin menu"
  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8c8bc] bg-white text-[#5f5148] transition hover:bg-[#f3eee9]"
>
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
</button>

    
  </div>

  {sidebarOpen && (
    <div className="border-t border-[#e7e2dc] bg-white px-4 py-4 shadow-sm">
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

        
      </header>

      {/* MOBILE OVERLAY */}
      

              </div>


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












