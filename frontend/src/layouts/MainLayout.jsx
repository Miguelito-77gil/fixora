import { Outlet } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f5f2] text-[#17202a]">
      <Navbar />

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;