import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      ),
    },
    {
      label: "Home",
      path: "/",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 10.5 7.5-6 7.5 6v8.25A1.75 1.75 0 0 1 17.75 20h-11.5A1.75 1.75 0 0 1 4.5 18.75V10.5Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 20v-5.5h6V20"
          />
        </svg>
      ),
    },
    {
      label: "Messages",
      path: "/repairer/messages",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 shrink-0">
          <circle cx="12" cy="8" r="3.25" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.5 19.25a6.5 6.5 0 0 1 13 0"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[#f7f7f5] text-[#17202a]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[218px] flex-col border-r border-[#e4ddd7] bg-white transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:z-auto lg:translate-x-0`}
      >
        <nav className="flex min-h-0 flex-1 flex-col px-4 py-5 lg:py-6">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "group flex items-center gap-3 rounded-lg bg-[#f5e9e0] px-4 py-3 text-sm font-medium text-[#8b5e3c] transition"
                    : "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#17202a] transition hover:bg-[#f3eee9] hover:text-[#8b5e3c]"
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-auto border-t border-[#eee5df] pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-[#17202a] transition hover:bg-[#f3eee9] hover:text-[#8b5e3c]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5 shrink-0"
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-12 shrink-0 items-center border-b border-[#e8dfd8] bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#17202a] transition hover:bg-[#f3eee9] hover:text-[#8b5e3c]"
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
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default RepairerDashboardLayout;
