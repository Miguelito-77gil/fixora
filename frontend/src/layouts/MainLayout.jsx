import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

function MainLayout() {
  const location = useLocation();

  const isAdminArea = location.pathname.startsWith("/admin");

  return (
    <div
      className={
        isAdminArea
          ? "flex h-screen flex-col overflow-hidden bg-[#f7f7f5] text-[#17202a]"
          : "flex min-h-screen flex-col bg-[#f7f7f5] text-[#17202a]"
      }
    >
      <Navbar />

      <main
        className={
          isAdminArea
            ? "min-h-0 flex-1 overflow-hidden"
            : "flex-1"
        }
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
