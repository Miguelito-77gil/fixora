import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "@/assets/luh.png";
import { useAuth } from "@/context/AuthContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive
        ? "text-[#b9825f]"
        : "text-[#505961] hover:text-[#b9825f]"
    }`;

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e2dc] bg-[#f7f7f5]/95 backdrop-blur">
      <div className="fixora-container">
        <div className="flex h-18 items-center justify-between">

          {/* Logo + Website Name */}
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3"
          >
            <img
              src={logo}
              alt="Fixora logo"
              className="h-10 w-auto object-contain"
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

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>

            <NavLink to="/repairers" className={linkClass}>
              Find Repairers
            </NavLink>

            {user ? (
              <>
                <span className="text-sm font-medium text-[#505961]">
                  Hi, {user.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-[#b9825f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a9704e]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>

                <Link
                  to="/register"
                  className="rounded-lg bg-[#b9825f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a9704e]"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            className="rounded-lg border border-[#ddd7d0] bg-white px-3 py-2 text-sm font-semibold text-[#26313b] transition hover:bg-[#f3eee9] md:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        {/* Mobile Navigation - Overlay */}
        {open && (
          <nav className="absolute left-0 right-0 top-full border-b border-[#e7e2dc] bg-[#f7f7f5] px-6 py-4 shadow-lg md:hidden">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col gap-1">

                <NavLink
                  onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
                  to="/repairers"
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-[#b9825f]"
                        : "text-[#505961] hover:bg-white hover:text-[#b9825f]"
                    }`
                  }
                >
                  Find Repairers
                </NavLink>

                {user ? (
                  <>
                    <span className="rounded-lg px-4 py-3 text-sm font-medium text-[#505961]">
                      Hi, {user.name}
                    </span>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-2 rounded-lg bg-[#b9825f] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#a9704e]"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      onClick={() => setOpen(false)}
                      to="/login"
                      className={({ isActive }) =>
                        `rounded-lg px-4 py-3 text-sm font-medium transition ${
                          isActive
                            ? "bg-white text-[#b9825f]"
                            : "text-[#505961] hover:bg-white hover:text-[#b9825f]"
                        }`
                      }
                    >
                      Login
                    </NavLink>

                    <Link
                      onClick={() => setOpen(false)}
                      to="/register"
                      className="mt-2 rounded-lg bg-[#b9825f] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#a9704e]"
                    >
                      Get Started
                    </Link>
                  </>
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