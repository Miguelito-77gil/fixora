import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import logo from "@/assets/luh.png";
import { useAuth } from "@/context/AuthContext";

function RepairerDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    setSidebarOpen(false);
    window.location.href = "/";
  }

  const menuItems = [
    {
      label: "Dashboard",
      path: "/repairer/dashboard",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      ),
    },
    {
      label: "Messages",
      path: "/repairer/messages",
      icon: (
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
            d="M5 5.75h14A1.75 1.75 0 0 1 20.75 7.5v8A1.75 1.75 0 0 1 19 17.25H10l-4.75 3v-3.15A1.75 1.75 0 0 1 3.25 15.5v-8A1.75 1.75 0 0 1 5 5.75Z"
          />
          <path strokeLinecap="round" d="M7.5 10h9M7.5 13.25h6" />
        </svg>
      ),
    },
    {
      label: "My Profile",
      path: "/repairer/profile",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <circle cx="12" cy="8" r="3.25" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.5 19.25a6.5 6.5 0 0 1 13 0"
          />
        </svg>
      ),
    },
    {
      label: "Services",
      path: "/repairer/services",
      icon: (
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
            d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4.5 16.5a2.12 2.12 0 0 0 3 3l4.8-4.8a4 4 0 0 0 5.4-5.4l-2.1 2.1-3-3 2.1-2.1Z"
          />
        </svg>
      ),
    },
    {
      label: "Portfolio",
      path: "/repairer/portfolio",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m5.5 17 4.5-4.5 3 3 2-2 3.5 3.5"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f7f7f5] text-[#17202a]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#17202a]/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-[#e7e0da] bg-[#fbfaf8] shadow-2xl transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center border-b border-[#e7e0da] px-5">
          <NavLink
            to="/repairer/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3"
          >
            <img
              src={logo}
              alt="Fixora"
              className="h-10 w-auto object-contain"
            />

            <div className="leading-tight">
              <p className="text-base font-bold text-[#17202a]">Fixora</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a817b]">
                Services
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-[#75675f] transition hover:bg-[#f5e9e0] hover:text-[#17202a] lg:hidden"
            aria-label="Close menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col px-4 py-4">
          {/* Repairer Navigation */}
          <div className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/repairer/dashboard"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition ${isActive
                    ? "bg-[#f5e9e0] text-[#17202a] shadow-sm ring-1 ring-[#e7e0da]"
                    : "text-[#5f5751] hover:bg-[#f7f2ee] hover:text-[#17202a]"
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Website Navigation */}
          <div className="my-5 border-t border-[#eee7e2]" />

          <div className="space-y-2">
            <NavLink
              to="/"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition ${isActive
                  ? "bg-[#f5e9e0] text-[#17202a] shadow-sm ring-1 ring-[#e7e0da]"
                  : "text-[#5f5751] hover:bg-[#f7f2ee] hover:text-[#17202a]"
                }`
              }
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
                  strokeLinejoin="round"
                  d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9Z"
                />
              </svg>

              <span>Home</span>
            </NavLink>

            <NavLink
              to="/repairers"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition ${isActive
                  ? "bg-[#f5e9e0] text-[#17202a] shadow-sm ring-1 ring-[#e7e0da]"
                  : "text-[#5f5751] hover:bg-[#f7f2ee] hover:text-[#17202a]"
                }`
              }
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <circle cx="9" cy="8" r="3" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 19.5a5.25 5.25 0 0 1 10.5 0"
                />
                <circle cx="17" cy="9" r="2.25" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 15.25a4.25 4.25 0 0 1 4.5 4.25"
                />
              </svg>

              <span>Find a Repairer</span>
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-[#5f5751] transition hover:bg-[#f7f2ee] hover:text-[#17202a]"
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
                  strokeLinejoin="round"
                  d="M15 6.75 20.25 12 15 17.25M20 12H9"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4.5v15"
                />
              </svg>

              <span>Log Out</span>
            </button>
          </div>
        </nav>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center justify-between border-b border-[#e7e0da] bg-[#fbfaf8]/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#dccfc5] bg-white px-3 text-sm font-semibold text-[#5f5751] transition hover:bg-[#f5e9e0] hover:text-[#5f5751] lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            Menu
          </button>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px]">
            <Outlet />
          </div>
        </main>

        <nav className="sticky bottom-0 z-30 flex h-[72px] items-center justify-around border-t border-[#e7e0da] bg-[#fbfaf8] px-2 shadow-[0_-4px_20px_rgba(23,32,42,0.04)] lg:hidden">
          {menuItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/" || item.path === "/repairer/dashboard"}
              className={({ isActive }) =>
                `flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition ${
                  isActive
                    ? "bg-[#f5e9e0] text-[#8b5e3c]"
                    : "text-[#75675f] hover:text-[#8b5e3c]"
                }`
              }
            >
              {item.icon}
              <span>
                {item.label === "My Profile" ? "Profile" : item.label}
              </span>
            </NavLink>
          ))}

          <NavLink
            to="/repairer/portfolio"
            className={({ isActive }) =>
              `flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition ${isActive
                ? "bg-[#f5e9e0] text-[#8b5e3c]"
                : "text-[#75675f] hover:text-[#8b5e3c]"
              }`
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <rect x="4" y="5" width="16" height="14" rx="2" />
              <circle cx="9" cy="10" r="1.5" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m5.5 17 4.5-4.5 3 3 2-2 3.5 3.5"
              />
            </svg>

            <span>Portfolio</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}

export default RepairerDashboardLayout;