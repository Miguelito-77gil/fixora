import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "@/assets/luh.png";
import { useAuth } from "@/context/AuthContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isCustomerDashboard = location.pathname === "/customer/dashboard";

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive
        ? "text-[#b9825f]"
        : "text-[#505961] hover:text-[#b9825f]"
    }`;

  function getAccountPath() {
    if (user?.role === "admin") {
      return "/admin/dashboard";
    }

    if (user?.role === "repairer") {
      return "/repairer/dashboard";
    }

    return "/customer/dashboard";
  }

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e2dc] bg-[#f7f7f5]/95 backdrop-blur">
      <div className="fixora-container">
        <div className="flex items-center justify-between" style={{ height: "64px" }}>
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <img
              src={logo}
              alt="Fixora logo"
              className="h-10 w-auto shrink-0 object-contain"
            />

            <div className="border-l border-[#ddd7d0] pl-3">
              <span className="block text-xl font-extrabold leading-none tracking-tight text-[#17202a]">
                Fixora
              </span>

              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#b9825f]">
                Repair Services
              </span>
            </div>
          </Link>

          {!isCustomerDashboard && (
            <nav className="hidden items-center gap-8 pr-3 md:flex">
              <NavLink to="/" className={linkClass}>
                Home
              </NavLink>

              <NavLink to="/repairers" className={linkClass}>
                Find a Repairer
              </NavLink>

              {user ? (
                <NavLink to={getAccountPath()} className={linkClass}>
                  Account
                </NavLink>
              ) : (
                <NavLink to="/login" className={linkClass}>
                  Log In
                </NavLink>
              )}
            </nav>
          )}

          {!isCustomerDashboard && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-label="Toggle navigation menu"
              aria-expanded={open}
              className="rounded-lg border border-[#ddd7d0] bg-white px-3 py-2 text-sm font-semibold text-[#26313b] transition hover:bg-[#f3eee9] md:hidden"
            >
              {open ? "Close" : "Menu"}
            </button>
          )}
        </div>

        {open && !isCustomerDashboard && (
          <nav className="absolute left-0 right-0 top-full border-b border-[#e7e2dc] bg-[#f7f7f5] px-6 py-4 shadow-lg md:hidden">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col gap-1">
                <NavLink
                  onClick={closeMenu}
                  to="/"
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-[#b9825f]"
                        : "text-[#505961] hover:bg-white hover:text-[#b9825f]"
                    }`
                  }
                >
                  Home
                </NavLink>

                <NavLink
                  onClick={closeMenu}
                  to="/repairers"
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-[#b9825f]"
                        : "text-[#505961] hover:bg-white hover:text-[#b9825f]"
                    }`
                  }
                >
                  Find a Repairer
                </NavLink>

                {user ? (
                  <NavLink
                    onClick={closeMenu}
                    to={getAccountPath()}
                    className={({ isActive }) =>
                      `rounded-lg px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-white text-[#b9825f]"
                          : "text-[#505961] hover:bg-white hover:text-[#b9825f]"
                      }`
                    }
                  >
                    Account
                  </NavLink>
                ) : (
                  <NavLink
                    onClick={closeMenu}
                    to="/login"
                    className={({ isActive }) =>
                      `rounded-lg px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-white text-[#b9825f]"
                          : "text-[#505961] hover:bg-white hover:text-[#b9825f]"
                      }`
                    }
                  >
                    Log In
                  </NavLink>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Navbar;


