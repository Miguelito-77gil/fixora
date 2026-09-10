import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "@/assets/luh.png";

import RepairRequestCard from "@/components/features/RepairRequestCard";
import { fetchMyRepairRequests } from "@/services/repairService";
import { fetchMyProfile, updateMyPhone } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

function CustomerDashboard() {
  const { logout } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingPhone, setSavingPhone] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchMyRepairRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load repair requests:", err);
      setError(err.message || "Failed to load repair requests.");
    } finally {
      setLoading(false);
    }
  }

  async function loadProfile() {
    try {
      setProfileLoading(true);
      setProfileError("");

      const data = await fetchMyProfile();

      setProfile(data);
      setPhone(data?.phone || "");
    } catch (err) {
      console.error("Failed to load profile:", err);
      setProfileError(err.message || "Failed to load profile.");
    } finally {
      setProfileLoading(false);
    }
  }

  function handleEditProfile() {
    setProfileMessage("");
    setProfileError("");
    setEditingProfile(true);
  }

  function handleCancelEdit() {
    setPhone(profile?.phone || "");
    setProfileMessage("");
    setProfileError("");
    setEditingProfile(false);
  }

  async function handleSavePhone(event) {
    event.preventDefault();

    try {
      setSavingPhone(true);
      setProfileMessage("");
      setProfileError("");

      const data = await updateMyPhone(phone.trim());

      setProfile(data);
      setPhone(data?.phone || "");
      setProfileMessage("Profile updated successfully.");
      setEditingProfile(false);
    } catch (err) {
      console.error("Failed to update mobile number:", err);
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setSavingPhone(false);
    }
  }

  function handleLogout() {
    logout();
    window.location.href = "/";
  }

  useEffect(() => {
    loadRequests();
    loadProfile();
  }, []);

  const navClass = ({ isActive }) =>
    `group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-[#f3eee9] text-[#8b5e3c]"
        : "text-[#505961] hover:bg-[#f3eee9] hover:text-[#8b5e3c]"
    }`;

  return (
    <div className="min-h-0 bg-[#f6f5f2] text-[#17202a]">

      {/* MOBILE HEADER */}
      <div className="flex h-16 items-center justify-end border-b border-[#e7e2dc] bg-[#f7f7f5] px-5 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg border border-[#ddd7d0] bg-white px-4 py-2 text-sm font-semibold text-[#26313b] transition hover:bg-[#f3eee9]"
          aria-label="Open menu"
        >
          Menu
        </button>
      </div>
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* DASHBOARD AREA */}
      <div className="grid min-h-0 lg:h-[calc(100vh-121px)] lg:grid-cols-[250px_minmax(0,1fr)]">

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-[#e7e2dc] bg-[#f7f7f5] transition-transform duration-200 lg:static lg:h-full lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >

          {/* SIDEBAR NAVIGATION */}
          <nav className="flex-1 px-4 py-6">

            <p className="px-4 pb-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#a08f83]">
              Menu
            </p>

            <div className="space-y-1">

              <NavLink
                to="/customer/dashboard"
                onClick={() => setSidebarOpen(false)}
                className={navClass}
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/"
                onClick={() => setSidebarOpen(false)}
                className={navClass}
              >
                Home
              </NavLink>

              <NavLink
                to="/repairers"
                onClick={() => setSidebarOpen(false)}
                className={navClass}
              >
                Find a Repairer
              </NavLink>              
             <NavLink
                to="/messages"
                state={{ from: "customer-dashboard" }}
               onClick={() => setSidebarOpen(false)}
              className={navClass}
              >
               Messages
              </NavLink>

              <NavLink 
                to="/customer/account" 
                onClick={() => setSidebarOpen(false)} 
                className={navClass} 
              > 
                My Account 
              </NavLink>

              <button
                type="button"
              onClick={handleLogout}
              className="group flex w-full items-center rounded-lg px-4 py-3 text-left text-sm font-medium text-[#505961] transition hover:bg-[#f3eee9] hover:text-[#8b5e3c]"
              >
                   Log Out
          </button>

            </div>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-h-0 min-w-0 overflow-y-auto bg-[#f6f5f2]">

          <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8 sm:py-12 lg:px-12">

            {/* PAGE HEADER */}
            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a6541]">
                Customer Dashboard
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#17202a] sm:text-4xl">
                My Repair Requests
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75675f]">
                Track your repair requests and stay updated on their progress.
              </p>

            </div>

            {/* LOADING */}
            {loading && (
              <div className="mt-10 rounded-2xl border border-[#e1d5ca] bg-[#faf9f7] px-6 py-20 text-center">
                <p className="text-sm text-[#75675f]">
                  Loading your repair requests...
                </p>
              </div>
            )}

            {/* ERROR */}
            {!loading && error && (
              <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-5 py-5">

                <p className="text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadRequests}
                  className="mt-4 rounded-lg bg-[#8b5e3c] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#754b2f]"
                >
                  Try Again
                </button>

              </div>
            )}

            {/* REQUESTS */}
            {!loading && !error && requests.length > 0 && (
              <div className="mt-10">

                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a6541]">
                      Repair Activity
                    </p>

                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#17202a]">
                      Your Requests
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={loadRequests}
                    className="self-start rounded-lg border border-[#d6c5b7] bg-transparent px-4 py-2 text-sm font-medium text-[#8b5e3c] transition hover:bg-[#f1e8e1] sm:self-auto"
                  >
                    Refresh
                  </button>

                </div>

                <div className="space-y-5">
                  {requests.map((request) => (
                    <RepairRequestCard
                      key={request.id}
                      request={request}
                    />
                  ))}
                </div>

              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && requests.length === 0 && (
              <div className="mt-10 rounded-2xl border border-dashed border-[#d8c8bc] bg-[#faf9f7] px-6 py-24 text-center">

                <h2 className="text-lg font-semibold text-[#17202a]">
                  No repair requests yet
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#75675f]">
                  When you request a repairer, your repair request and its current
                  status will appear here.
                </p>

              </div>
            )}

          </section>

        </main>

      </div>
    </div>
  );
}

export default CustomerDashboard;








