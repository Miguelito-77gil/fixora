import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

function MainLayout() {
  const location = useLocation();

  const isAdminArea = location.pathname.startsWith("/admin");
  const isCustomerArea = location.pathname.startsWith("/customer");
  const isRepairerArea = location.pathname.startsWith("/repairer");

  const hideGlobalLayout = isCustomerArea || isRepairerArea;

  return (
    <div
      className={
        isAdminArea
          ? "flex h-screen flex-col overflow-hidden bg-[#f7f7f5] text-[#17202a]"
          : "flex min-h-screen flex-col bg-[#f7f7f5] text-[#17202a]"
      }
    >
      {!hideGlobalLayout && <Navbar />}

      <main
        className={
          isAdminArea || hideGlobalLayout
            ? "min-h-0 flex-1"
            : "flex-1"
        }
      >
        <Outlet />
      </main>

      {!hideGlobalLayout && <Footer />}
    </div>
  );
}

export default MainLayout;
