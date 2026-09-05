import { useEffect, useState } from "react";

import RepairRequestCard from "@/components/features/RepairRequestCard";
import { fetchMyRepairRequests } from "@/services/repairService";
import { fetchMyProfile, updateMyPhone } from "@/services/authService";

function CustomerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingPhone, setSavingPhone] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

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

  async function handleSavePhone(event) {
    event.preventDefault();

    try {
      setSavingPhone(true);
      setProfileMessage("");
      setProfileError("");

      const data = await updateMyPhone(phone.trim());

      setProfile(data);
      setPhone(data?.phone || "");

      setProfileMessage("Mobile number saved successfully.");
    } catch (err) {
      console.error("Failed to update mobile number:", err);
      setProfileError(err.message || "Failed to update mobile number.");
    } finally {
      setSavingPhone(false);
    }
  }

  useEffect(() => {
    loadRequests();
    loadProfile();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:py-20">

      {/* HEADER */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a6541]">
          Customer Dashboard
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#2f241e]">
          My Repair Requests
        </h1>

        <p className="mt-3 max-w-2xl text-[#75675f]">
          Track your repair requests and stay updated on their progress.
        </p>
      </div>

      {/* CUSTOMER PROFILE */}
      <div className="mt-10 rounded-3xl border border-[#d8c8bc] bg-white/60 p-6 shadow-sm backdrop-blur-sm sm:p-8">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a6541]">
            Customer Profile
          </p>

          <h2 className="mt-2 text-2xl font-black text-[#2f241e]">
            Contact Information
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#75675f]">
            Add your mobile number so your assigned repairer can contact you
            when they are on the way or have arrived.
          </p>
        </div>

        {profileLoading ? (
          <div className="mt-6 rounded-2xl border border-[#e2d5cc] px-5 py-6">
            <p className="text-sm text-[#75675f]">
              Loading your profile...
            </p>
          </div>
        ) : profileError && !profile ? (
          <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 px-5 py-4">
            <p className="text-sm text-red-700">
              {profileError}
            </p>

            <button
              type="button"
              onClick={loadProfile}
              className="mt-4 rounded-xl bg-[#8b5e3c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#754b2f]"
            >
              Try Again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSavePhone} className="mt-6 max-w-xl">

            <div className="space-y-2">
              <label
                htmlFor="customer-phone"
                className="text-sm font-bold text-[#2f241e]"
              >
                Mobile Number
              </label>

              <input
                id="customer-phone"
                type="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setProfileMessage("");
                  setProfileError("");
                }}
                placeholder="09XXXXXXXXX"
                className="w-full rounded-2xl border border-[#cdb5a2] bg-white px-4 py-3 text-sm text-[#2f241e] outline-none transition placeholder:text-[#a89486] focus:border-[#9a6541] focus:ring-2 focus:ring-[#9a6541]/20"
                maxLength={20}
                required
              />
            </div>

            {profileMessage && (
              <p className="mt-3 text-sm font-semibold text-green-700">
                {profileMessage}
              </p>
            )}

            {profileError && (
              <p className="mt-3 text-sm font-semibold text-red-700">
                {profileError}
              </p>
            )}

            <button
              type="submit"
              disabled={savingPhone}
              className="mt-5 rounded-xl bg-[#8b5e3c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#754b2f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingPhone ? "Saving..." : "Save Mobile Number"}
            </button>
          </form>
        )}
      </div>

      {/* LOADING REQUESTS */}
      {loading && (
        <div className="mt-10 rounded-3xl border border-white/10 px-6 py-20 text-center">
          <p className="text-sm text-[#75675f]">
            Loading your repair requests...
          </p>
        </div>
      )}

      {/* ERROR REQUESTS */}
      {!loading && error && (
        <div className="mt-10 rounded-2xl border border-red-300 bg-red-50 px-5 py-4">
          <p className="text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={loadRequests}
            className="mt-4 rounded-xl bg-[#8b5e3c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#754b2f]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* REQUESTS */}
      {!loading && !error && requests.length > 0 && (
        <div className="mt-10 space-y-6">

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a6541]">
                Other
              </p>

              <h2 className="mt-2 text-xl font-black text-[#2f241e]">
                Your Requests
              </h2>
            </div>

            <button
              type="button"
              onClick={loadRequests}
              className="rounded-xl border border-[#cdb5a2] bg-transparent px-4 py-2 text-sm font-bold text-[#8b5e3c] transition hover:bg-[#f3e5da]"
            >
              Refresh
            </button>
          </div>

          {requests.map((request) => (
            <RepairRequestCard
              key={request.id}
              request={request}
            />
          ))}

        </div>
      )}

      import { useEffect, useState } from "react";

import RepairRequestCard from "@/components/features/RepairRequestCard";
import { fetchMyRepairRequests } from "@/services/repairService";
import { fetchMyProfile, updateMyPhone } from "@/services/authService";

function CustomerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingPhone, setSavingPhone] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);

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

  async function handleSavePhone(event) {
    event.preventDefault();

    try {
      setSavingPhone(true);
      setProfileMessage("");
      setProfileError("");

      const data = await updateMyPhone(phone.trim());

      setProfile(data);
      setPhone(data?.phone || "");

      setProfileMessage("Mobile number saved successfully.");
      setEditingProfile(false);
    } catch (err) {
      console.error("Failed to update mobile number:", err);
      setProfileError(err.message || "Failed to update mobile number.");
    } finally {
      setSavingPhone(false);
    }
  }

  function handleCancelEdit() {
    setPhone(profile?.phone || "");
    setProfileMessage("");
    setProfileError("");
    setEditingProfile(false);
  }

  useEffect(() => {
    loadRequests();
    loadProfile();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:py-20">

      {/* HEADER */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a6541]">
          Customer Dashboard
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#2f241e]">
          My Repair Requests
        </h1>

        <p className="mt-3 max-w-2xl text-[#75675f]">
          Track your repair requests and stay updated on their progress.
        </p>
      </div>

      {/* CUSTOMER PROFILE */}
      <div className="mt-10 rounded-3xl border border-[#d8c8bc] bg-white/60 p-6 shadow-sm backdrop-blur-sm sm:p-8">

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a6541]">
              Customer Profile
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#2f241e]">
              {profile?.name || "Customer"}
            </h2>

            <p className="mt-1 text-sm text-[#75675f]">
              {profile?.email || "No email available"}
            </p>
          </div>

          {!profileLoading && profile && !editingProfile && (
            <button
              type="button"
              onClick={() => {
                setProfileMessage("");
                setProfileError("");
                setEditingProfile(true);
              }}
              className="rounded-xl border border-[#cdb5a2] bg-white/70 px-5 py-3 text-sm font-bold text-[#8b5e3c] transition hover:bg-[#f3e5da]"
            >
              Edit Profile
            </button>
          )}
        </div>

        {profileLoading ? (
          <div className="mt-6 rounded-2xl border border-[#e2d5cc] px-5 py-6">
            <p className="text-sm text-[#75675f]">
              Loading your profile...
            </p>
          </div>
        ) : profileError && !profile ? (
          <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 px-5 py-4">
            <p className="text-sm text-red-700">
              {profileError}
            </p>

            <button
              type="button"
              onClick={loadProfile}
              className="mt-4 rounded-xl bg-[#8b5e3c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#754b2f]"
            >
              Try Again
            </button>
          </div>
        ) : !editingProfile ? (
          <>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-[#e2d5cc] bg-white/50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a6541]">
                  Mobile Number
                </p>

                <p className="mt-2 text-base font-bold text-[#2f241e]">
                  {profile?.phone || "Not added yet"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e2d5cc] bg-white/50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a6541]">
                  Account Type
                </p>

                <p className="mt-2 text-base font-bold capitalize text-[#2f241e]">
                  {profile?.role || "Customer"}
                </p>
              </div>

            </div>

            {profileMessage && (
              <p className="mt-4 text-sm font-semibold text-green-700">
                {profileMessage}
              </p>
            )}
          </>
        ) : (
          <form onSubmit={handleSavePhone} className="mt-7 max-w-xl">

            <div className="space-y-2">
              <label
                htmlFor="customer-phone"
                className="text-sm font-bold text-[#2f241e]"
              >
                Mobile Number
              </label>

              <input
                id="customer-phone"
                type="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setProfileMessage("");
                  setProfileError("");
                }}
                placeholder="09XXXXXXXXX"
                className="w-full rounded-2xl border border-[#cdb5a2] bg-white px-4 py-3 text-sm text-[#2f241e] outline-none transition placeholder:text-[#a89486] focus:border-[#9a6541] focus:ring-2 focus:ring-[#9a6541]/20"
                maxLength={20}
                required
              />
            </div>

            {profileMessage && (
              <p className="mt-3 text-sm font-semibold text-green-700">
                {profileMessage}
              </p>
            )}

            {profileError && (
              <p className="mt-3 text-sm font-semibold text-red-700">
                {profileError}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={savingPhone}
                className="rounded-xl bg-[#8b5e3c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#754b2f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPhone ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={savingPhone}
                className="rounded-xl border border-[#cdb5a2] bg-white/70 px-5 py-3 text-sm font-bold text-[#8b5e3c] transition hover:bg-[#f3e5da]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* LOADING REQUESTS */}
      {loading && (
        <div className="mt-10 rounded-3xl border border-white/10 px-6 py-20 text-center">
          <p className="text-sm text-[#75675f]">
            Loading your repair requests...
          </p>
        </div>
      )}

      {/* ERROR REQUESTS */}
      {!loading && error && (
        <div className="mt-10 rounded-2xl border border-red-300 bg-red-50 px-5 py-4">
          <p className="text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={loadRequests}
            className="mt-4 rounded-xl bg-[#8b5e3c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#754b2f]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* REQUESTS */}
      {!loading && !error && requests.length > 0 && (
        <div className="mt-10 space-y-6">

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a6541]">
                Other
              </p>

              <h2 className="mt-2 text-xl font-black text-[#2f241e]">
                Your Requests
              </h2>
            </div>

            <button
              type="button"
              onClick={loadRequests}
              className="rounded-xl border border-[#cdb5a2] bg-transparent px-4 py-2 text-sm font-bold text-[#8b5e3c] transition hover:bg-[#f3e5da]"
            >
              Refresh
            </button>
          </div>

          {requests.map((request) => (
            <RepairRequestCard
              key={request.id}
              request={request}
            />
          ))}

        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && requests.length === 0 && (
        <div className="mt-10 rounded-3xl border border-dashed border-[#d8c8bc] px-6 py-24 text-center">

          <h2 className="text-xl font-bold text-[#2f241e]">
            No repair requests yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#75675f]">
            When you request a repairer, your repair request and its current
            status will appear here.
          </p>

        </div>
      )}
    </section>
  );
}

export default CustomerDashboard;
export default CustomerDashboard;
