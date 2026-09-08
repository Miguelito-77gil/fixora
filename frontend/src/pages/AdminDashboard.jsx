import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import { fetchPendingRepairers, verifyRepairer } from "@/services/adminService";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PendingBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-[#fdf3e7] px-2 py-0.5 text-[10px] font-semibold text-[#b9700f]">
      Pending
    </span>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [repairers, setRepairers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user?.role !== "admin") return;

    loadRepairers();
  }, [user]);

  async function loadRepairers() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchPendingRepairers();
      setRepairers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load pending repairers.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(id, status) {
    setActioningId(id);
    setError("");

    try {
      await verifyRepairer(id, status);
      setRepairers((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message || "Failed to update repairer status.");
    } finally {
      setActioningId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth");
    window.location.href = "/";
  }

  const navClass = ({ isActive }) =>
    `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "border border-[#d8c8bc] bg-[#f3eee9] text-[#2f241e]"
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
    <div className="min-h-screen bg-[#f8f5f2] text-[#2f241e]">

      {/* MOBILE HEADER */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e8dfd8] bg-white/95 px-5 py-4 backdrop-blur lg:hidden">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#2f241e]">
            Fixora
          </h2>

          <p className="text-xs text-[#8a7a70]">
            Admin
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl border border-[#d8c8bc] bg-white px-4 py-2 text-sm font-medium text-[#5f5148] transition hover:bg-[#f3eee9]"
          aria-label="Open menu"
        >
          Menu
        </button>
      </div>

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
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* BRAND */}
        <div className="flex items-center justify-between border-b border-[#eee7e2] px-6 py-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#2f241e]">
              Fixora
            </h2>

            <p className="mt-1 text-xs text-[#8a7a70]">
              Admin
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg px-2 py-1 text-sm text-[#8a7a70] hover:bg-[#f3eee9] lg:hidden"
          >
            Close
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 space-y-2 px-4 py-6">

          <NavLink
            to="/admin/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={navClass}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "text-[#5f5148] hover:bg-[#f8f5f2]"
                  : "text-[#5f5148] hover:bg-[#f8f5f2]"
              }`
            }
          >
            Repairer Verification
          </NavLink>

          <NavLink
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className={navClass}
          >
            My Profile
          </NavLink>

        </nav>

        {/* LOGOUT */}
        <div className="border-t border-[#eee7e2] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-[#5f5148] transition hover:bg-[#f3eee9]"
          >
            Log Out
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:pl-64">
        <section className="mx-auto max-w-7xl px-6 py-10 sm:py-14">

          {/* HEADER */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9a6541]">
              Admin Dashboard
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2f241e] sm:text-4xl">
              Repairer Verification
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75675f]">
              {repairers.length > 0
                ? `${repairers.length} pending application${repairers.length === 1 ? "" : "s"}`
                : "Review and approve pending repairer applications."}
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="mt-10 rounded-3xl border border-[#d8c8bc] bg-white/40 px-6 py-20 text-center">
              <p className="text-sm text-[#75675f]">
                Loading pending applications...
              </p>
            </div>
          ) : repairers.length === 0 ? (
            /* EMPTY STATE */
            <div className="mt-10 rounded-3xl border border-dashed border-[#d8c8bc] bg-white/30 px-6 py-24 text-center">
              <h2 className="text-lg font-semibold text-[#2f241e]">
                No pending applications
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#75675f]">
                There are no repairer applications waiting for verification right now.
              </p>

              <button
                type="button"
                onClick={loadRepairers}
                className="mt-6 rounded-xl border border-[#cdb5a2] bg-white px-5 py-3 text-sm font-medium text-[#8b5e3c] transition hover:bg-[#f3e5da]"
              >
                Refresh
              </button>
            </div>
          ) : (
            /* REPAIRER APPLICATIONS */
            <div className="mt-10">

              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#9a6541]">
                    Applications
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-[#2f241e]">
                    Pending Repairers
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={loadRepairers}
                  className="rounded-xl border border-[#cdb5a2] bg-transparent px-4 py-2 text-sm font-medium text-[#8b5e3c] transition hover:bg-[#f3e5da]"
                >
                  Refresh
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {repairers.map((r) => (
                  <Card
                    key={r.id}
                    className="flex flex-col rounded-2xl border border-[#e4ded7] p-5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5"
                  >

                    {/* REPAIRER INFO */}
                    <div className="flex items-start gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#efe7df] to-[#dcd5cd] text-sm font-semibold text-[#9b806a]">
                        {getInitials(r.name)}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-[#2f241e]">
                            {r.name}
                          </h3>

                          <PendingBadge />
                        </div>

                        <p className="mt-1 truncate text-xs text-[#8a9298]">
                          {r.email}
                        </p>

                      </div>
                    </div>

                    {/* CATEGORY */}
                    <p className="mt-4 text-xs font-medium text-[#b9825f]">
                      {r.category}

                      {r.years_experience != null && (
                        <span className="ml-1.5 font-normal text-[#777f86]">
                          / {r.years_experience} yrs experience
                        </span>
                      )}
                    </p>

                    {/* BIO */}
                    {r.bio && (
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#68727c]">
                        {r.bio}
                      </p>
                    )}

                    {/* ACTIONS */}
                    <div className="mt-auto flex gap-2 border-t border-[#eee9e3] pt-4">

                      <Button
                        onClick={() => handleVerify(r.id, "verified")}
                        disabled={actioningId === r.id}
                        className="flex-1 !px-3 !py-2 !text-xs"
                      >
                        {actioningId === r.id ? "..." : "Approve"}
                      </Button>

                      <Button
                        onClick={() => handleVerify(r.id, "rejected")}
                        variant="outline"
                        disabled={actioningId === r.id}
                        className="flex-1 !px-3 !py-2 !text-xs"
                      >
                        {actioningId === r.id ? "..." : "Reject"}
                      </Button>

                    </div>

                  </Card>
                ))}

              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;