import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

function CustomerDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setSidebarOpen(false);
    window.location.href = "/";
  }

  const menuItems = [
    {
      label: "Dashboard",
      path: "/customer/dashboard",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5 shrink-0"
        >
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
      label: "Find a Repairer",
      path: "/repairers",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5 shrink-0"
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
      ),
    },
    {
      label: "Messages",
      path: "/customer/messages",
      icon: (
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
            d="M5 5.75h14A1.75 1.75 0 0 1 20.75 7.5v8A1.75 1.75 0 0 1 19 17.25H10l-4.75 3v-3.15A1.75 1.75 0 0 1 3.25 15.5v-8A1.75 1.75 0 0 1 5 5.75Z"
          />
          <path
            strokeLinecap="round"
            d="M7.5 10h9M7.5 13.25h6"
          />
        </svg>
      ),
    },
    {
      label: "My Account",
      path: "/customer/account",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5 shrink-0"
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
  ];

  return (
    <div className="flex h-full min-h-0 bg-[#f7f7f5] text-[#17202a]">

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
        className={`fixed inset-y-0 left-0 z-50 flex w-[218px] flex-col border-r border-[#e4ddd7] bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* MOBILE CLOSE */}
        <div className="flex justify-end px-4 pt-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#505961] transition hover:bg-[#f3eee9] hover:text-[#8b5e3c]"
            aria-label="Close menu"
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
                d="M6 6l12 12M18 6 6 18"
              />
            </svg>
          </button>
        </div>

        {/* CUSTOMER SIDEBAR */}
        <nav className="flex flex-1 flex-col px-4 py-5 lg:py-6">

          <div className="space-y-1">

            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#f5e9e0] text-[#8b5e3c]"
                      : "text-[#17202a] hover:bg-[#f3eee9] hover:text-[#8b5e3c]"
                  }`
                }
              >
                {item.icon}

                <span>{item.label}</span>
              </NavLink>
            ))}

          </div>

          {/* LOG OUT */}
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

      {/* CONTENT */}
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">

        {/* MOBILE MENU BUTTON */}
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
              <path
                strokeLinecap="round"
                d="M4 7h16M4 12h16M4 17h16"
              />
            </svg>

            Menu
          </button>
        </div>

        <main className="h-full min-h-0 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default CustomerDashboardLayout;