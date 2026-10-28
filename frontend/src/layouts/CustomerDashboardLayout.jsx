import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function CustomerDashboardLayout() {
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
      path: "/customer/dashboard",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 10.5 7.5-6 7.5 6v8.25A1.75 1.75 0 0 1 17.75 20h-11.5A1.75 1.75 0 0 1 4.5 18.75V10.5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20v-5.5h6V20" />
        </svg>
      ),
    },
    {
      label: "Find a Repairer",
      path: "/repairers",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <circle cx="9" cy="8" r="3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 19.5a5.25 5.25 0 0 1 10.5 0" />
          <circle cx="17" cy="9" r="2.25" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.25a4.25 4.25 0 0 1 4.5 4.25" />
        </svg>
      ),
    },
    {
      label: "Messages",
      path: "/customer/messages",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5.75h14A1.75 1.75 0 0 1 20.75 7.5v8A1.75 1.75 0 0 1 19 17.25H10l-4.75 3v-3.15A1.75 1.75 0 0 1 3.25 15.5v-8A1.75 1.75 0 0 1 5 5.75Z" />
          <path strokeLinecap="round" d="M7.5 10h9M7.5 13.25h6" />
        </svg>
      ),
    },
    {
      label: "My Account",
      path: "/customer/account",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <circle cx="12" cy="8" r="3.25" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 19.25a6.5 6.5 0 0 1 13 0" />
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
          className="fixed inset-0 z-40 bg-[#17202a]/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-[#e7e0da] bg-white shadow-xl transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center border-b border-[#eee7e1] px-6">
          <NavLink
            to="/customer/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5E3C] text-lg font-bold text-white">
              F
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight text-[#8B5E3C]">
                Fixora
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b9825f]">
                Repair Services
              </div>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-[#687078] hover:bg-[#f5eee8] hover:text-[#8b5e3c] lg:hidden"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="px-5 pt-7">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a918a]">
            Menu
          </p>
        </div>

        <nav className="flex flex-1 flex-col px-5 py-3">
          <div className="space-y-1.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#f5e9e0] text-[#8b5e3c]"
                      : "text-[#505961] hover:bg-[#f7f2ee] hover:text-[#8b5e3c]"
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="mt-auto border-t border-[#eee7e1] pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[#505961] transition hover:bg-[#f7f2ee] hover:text-[#8b5e3c]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 6.75 20.25 12 15 17.25M20 12H9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4.5v15" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </nav>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">

        <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center justify-between border-b border-[#e7e0da] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#e7e0da] px-3 text-sm font-medium text-[#17202a] hover:bg-[#f7f2ee] lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            Menu
          </button>

          <div className="hidden lg:block">
            <p className="text-sm text-[#8a817b]">Customer Dashboard</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#505961] hover:bg-[#f7f2ee] hover:text-[#8b5e3c]"
              aria-label="Notifications"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
              </svg>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#b9825f]" />
            </button>

            <NavLink
              to="/customer/account"
              className="hidden items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-[#f7f2ee] sm:flex"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8B5E3C] text-sm font-bold text-white">
                C
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-[#17202a]">Customer</p>
                <p className="text-xs text-[#8a817b]">My Account</p>
              </div>
            </NavLink>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px]">
            <Outlet />
          </div>
        </main>

        <nav className="sticky bottom-0 z-30 flex h-[68px] items-center justify-around border-t border-[#e7e0da] bg-white px-2 lg:hidden">
          {menuItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium ${
                  isActive
                    ? "text-[#8b5e3c]"
                    : "text-[#737b82]"
                }`
              }
            >
              {item.icon}
              <span>{item.label === "Find a Repairer" ? "Repairers" : item.label}</span>
            </NavLink>
          ))}

          <NavLink
            to="/customer/account"
            className={({ isActive }) =>
              `flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium ${
                isActive
                  ? "text-[#8b5e3c]"
                  : "text-[#737b82]"
              }`
            }
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <circle cx="12" cy="8" r="3.25" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 19.25a6.5 6.5 0 0 1 13 0" />
            </svg>
            <span>Account</span>
          </NavLink>
        </nav>

      </div>
    </div>
  );
}

export default CustomerDashboardLayout;
