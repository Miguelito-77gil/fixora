import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

function AdminLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "border border-[#d8c8bc] bg-[#f3eee9] text-[#2f241e]"
        : "text-[#5f5148] hover:bg-[#f8f5f2]"
    }`;

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth");
    window.location.href = "/";
  }

  const currentPage =
    location.pathname.includes("/admin/users")
      ? "User Management"
      : "Repairer Verification";

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[#f8f5f2] text-[#2f241e] lg:flex-row">

      {/* =====================================================
          DESKTOP SIDEBAR
          ===================================================== */}
      <aside className="hidden h-full w-[250px] shrink-0 flex-col border-r border-[#e8dfd8] bg-white lg:flex">
        <nav className="flex-1 space-y-1 px-4 py-6">
          <NavLink
            to="/admin/dashboard"
            className={navClass}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            className={navClass}
          >
            User Management
          </NavLink>

          <NavLink
            to="/admin/repairers"
            className={navClass}
          >
            Repairer Verification
          </NavLink>

          <NavLink
            to="/"
            className={navClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/repairers"
            className={navClass}
          >
            Find a Repairer
          </NavLink>
        </nav>

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

      {/* =====================================================
          MAIN ADMIN AREA
          ===================================================== */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">

        {/* ===================================================
            MOBILE ADMIN BAR
            =================================================== */}
        <div className="shrink-0 border-b border-[#e8dfd8] bg-white lg:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b9825f]">
                Administration
              </p>

              <h2 className="mt-1 text-lg font-bold tracking-tight text-[#2f241e]">
                {currentPage}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? "Close admin menu" : "Open admin menu"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8c8bc] bg-white text-[#5f5148] transition hover:bg-[#f3eee9]"
            >
              {menuOpen ? (
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

          {/* FULL WIDTH DROPDOWN */}
          {menuOpen && (
            <div className="border-t border-[#e8dfd8] bg-white px-4 py-4 shadow-sm">
              <nav className="space-y-1">
                <NavLink
                  to="/admin/dashboard"
                  onClick={closeMenu}
                  className={navClass}
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/admin/users"
                  onClick={closeMenu}
                  className={navClass}
                >
                  User Management
                </NavLink>

                <NavLink
                  to="/admin/repairers"
                  onClick={closeMenu}
                  className={navClass}
                >
                  Repairer Verification
                </NavLink>

                <NavLink
                  to="/"
                  onClick={closeMenu}
                  className={navClass}
                >
                  Home
                </NavLink>

                <NavLink
                  to="/repairers"
                  onClick={closeMenu}
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

        {/* ===================================================
            PAGE CONTENT
            =================================================== */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
