import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";

import Home from "@/pages/Home";
import FindRepairer from "@/pages/FindRepairer";
import RepairerProfile from "@/pages/RepairerProfile";
import RepairRequest from "@/pages/RepairRequest";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import BecomeRepairer from "@/pages/BecomeRepairer";
import AdminDashboard from "@/pages/AdminDashboard";
import CustomerDashboard from "@/pages/CustomerDashboard";
import RepairerDashboard from "@/pages/RepairerDashboard";
import EditProfile from "@/pages/EditProfile";
import Profile from "@/pages/Profile";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        <Route path="/" element={<Home />} />

        <Route path="/repairers" element={<FindRepairer />} />

        <Route
          path="/repairer/:slug"
          element={<RepairerProfile />}
        />

        <Route
          path="/repairer/:repairerId/request"
          element={<RepairRequest />}
        />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/become-repairer"
          element={<BecomeRepairer />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/customer/dashboard"
          element={<CustomerDashboard />}
        />

        <Route
          path="/repairer/dashboard"
          element={<RepairerDashboard />}
        />

        <Route
          path="/edit-profile"
          element={<EditProfile />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

      </Route>
    </Routes>
  );
}

export default App;
