import Account from "@/pages/Account";
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
import UserManagement from "@/pages/UserManagement";
import RepairerVerification from "@/pages/RepairerVerification";
import CustomerDashboard from "@/pages/CustomerDashboard";
import RepairerDashboard from "@/pages/RepairerDashboard";
import RepairerServices from "@/pages/RepairerServices";
import EditProfile from "@/pages/EditProfile";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import PortfolioManagement from "@/pages/PortfolioManagement";

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
        <Route path="/repairer/services" element={<RepairerServices />} />

        <Route
          path="/edit-profile"
          element={<EditProfile />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />
        <Route
          path="/messages"
          element={<Messages />}
        />

        <Route
          path="/messages/:userId"
          element={<Messages />}
        />

      </Route>
          <Route path="/account" element={<Account />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route
          path="/admin/repairers"
          element={<RepairerVerification />}
        />
      

        <Route
          path="/customer/account"
          element={<Account />}
        />
    </Routes>
  );
}

export default App;






