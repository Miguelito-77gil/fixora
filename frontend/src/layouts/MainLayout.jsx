import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";

function MainLayout() {
  const location = useLocation();

  // Hide the top Navbar ONLY on Repairer Dashboard
  const hideNavbar = location.pathname === "/repairer/dashboard";

  return (
    <div className="min-h-screen">
      {!hideNavbar && <Navbar />}

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;