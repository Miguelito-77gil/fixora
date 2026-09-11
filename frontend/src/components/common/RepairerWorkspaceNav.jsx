import { NavLink } from "react-router-dom";

const items = [
  {
    label: "Dashboard",
    path: "/repairer/dashboard",
  },
  {
    label: "Requests",
    path: "/repairer/dashboard",
  },
  {
    label: "Messages",
    path: "/messages",
  },
  {
    label: "My Services",
    path: "/repairer/services",
  },
  {
    label: "Portfolio",
    path: "/repairer/portfolio",
  },
  {
    label: "Earnings",
    path: "/repairer/earnings",
  },
  {
    label: "My Profile",
    path: "/profile",
  },
];

function RepairerWorkspaceNav() {
  return (
    <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <NavLink
          key={`${item.label}-${item.path}`}
          to={item.path}
          className={({ isActive }) =>
            [
              "rounded-xl border px-4 py-3 text-sm font-semibold transition",
              isActive
                ? "border-[#b9825f] bg-[#b9825f] text-white"
                : "border-[#e4d9d0] bg-white text-[#75675f] hover:bg-[#faf6f2]",
            ].join(" ")
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default RepairerWorkspaceNav;
