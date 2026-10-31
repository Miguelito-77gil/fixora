import { Routes, Route } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import CustomerDashboardLayout from "@/layouts/CustomerDashboardLayout";
import RepairerDashboardLayout from "@/layouts/RepairerDashboardLayout";

import Home from "@/pages/Home";
import FindRepairer from "@/pages/FindRepairer";
import RepairerProfile from "@/pages/RepairerProfile";
import RepairRequest from "@/pages/RepairRequest";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import BecomeRepairer from "@/pages/BecomeRepairer";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

import CustomerDashboard from "@/pages/CustomerDashboard";
import RepairerDashboard from "@/pages/RepairerDashboard";
import CustomerRequests from "@/pages/CustomerRequests";
import CustomerFavorites from "@/pages/CustomerFavorites";
import CustomerNotifications from "@/pages/CustomerNotifications";

import Account from "@/pages/Account";
import EditProfile from "@/pages/EditProfile";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";

import AdminDashboard from "@/pages/AdminDashboard";
import UserManagement from "@/pages/UserManagement";
import RepairerVerification from "@/pages/RepairerVerification";

import PortfolioManagement from "@/pages/PortfolioManagement";
import RepairerServices from "@/pages/RepairerServices";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        {/* PUBLIC / MAIN SITE */}
        <Route path="/" element={<Home />} />
        <Route path="/repairers" element={<FindRepairer />} />
        <Route path="/repairers/:id" element={<RepairerProfile />} />
        <Route path="/repairer/:id" element={<RepairerProfile />} />


        {/* REPAIR REQUEST */}
        <Route
          path="/repairer/:id/request"
          element={<RepairRequest />}
        />

        <Route
          path="/repair-request/:id"
          element={<RepairRequest />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/become-repairer" element={<BecomeRepairer />} />

        {/* CUSTOMER AREA */}
        <Route path="/customer" element={<CustomerDashboardLayout />}>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="requests" element={<CustomerRequests />} />
          <Route path="favorites" element={<CustomerFavorites />} />
          <Route path="notifications" element={<CustomerNotifications />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<Messages />} />
          <Route path="account" element={<Account />} />
        </Route>
       
        {/* OTHER USER PAGES */}
        <Route path="/account" element={<Account />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:userId" element={<Messages />} />

        {/* REPAIRER AREA */}
        <Route path="/repairer" element={<RepairerDashboardLayout />}>
          <Route path="dashboard" element={<RepairerDashboard />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<EditProfile />} />
          <Route path="services" element={<RepairerServices />} />
          <Route path="portfolio" element={<PortfolioManagement />} />
        </Route>

        {/* ADMIN AREA */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />

        <Route
          path="/admin/repairers"
          element={<RepairerVerification />}
        />

      </Route>
    </Routes>
  );
}

export default App;
