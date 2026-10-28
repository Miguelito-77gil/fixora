import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RepairRequestCard from "@/components/features/RepairRequestCard";
import {
  fetchMyRepairRequests,
  cancelRepairRequest,
} from "@/services/repairService";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://fixora-backend-kw9p.onrender.com";

function CustomerDashboard() {
  const [requests, setRequests] = useState([]);
  const [repairers, setRepairers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRepairers, setLoadingRepairers] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchMyRepairRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load repair requests.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRepairers() {
    try {
      setLoadingRepairers(true);

      const response = await fetch(`${API_URL}/api/repairers`);

      if (!response.ok) {
        throw new Error("Failed to load repairers.");
      }

      const data = await response.json();
      setRepairers(Array.isArray(data) ? data.slice(0, 3) : []);
    } catch {
      setRepairers([]);
    } finally {
      setLoadingRepairers(false);
    }
  }

  async function handleCancelRequest(requestId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this repair request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(requestId);
      setError("");

      await cancelRepairRequest(requestId);

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? { ...request, status: "cancelled" }
            : request
        )
      );
    } catch (err) {
      setError(err.message || "Failed to cancel repair request.");
    } finally {
      setCancellingId(null);
    }
  }

  useEffect(() => {
    loadDashboard();
    loadRepairers();
  }, []);

  const pendingCount = requests.filter(
    (request) => request.status === "pending"
  ).length;

  const activeCount = requests.filter((request) =>
    ["accepted", "in_progress", "ongoing"].includes(request.status)
  ).length;

  const completedCount = requests.filter(
    (request) => request.status === "completed"
  ).length;

  const recentRequests = requests.slice(0, 3);

  return (
    <div className="min-h-full bg-[#f7f7f5] text-[#17202a]">
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="rounded-3xl bg-[#8B5E3C] px-6 py-8 text-white shadow-sm sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d7b39b]">
            Customer Dashboard
          </p>

          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
                Find trusted repairers, manage your repair requests, and keep
                track of your service activity.
              </p>
            </div>

            <Link
              to="/repairers"
              className="inline-flex w-fit items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#8B5E3C] transition hover:bg-[#f5eee8]"
            >
              Find a Repairer
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#e7e0da] bg-white p-5">
            <p className="text-xs font-medium text-[#8a817b]">Total Requests</p>
            <p className="mt-2 text-3xl font-bold text-[#8B5E3C]">
              {requests.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e0da] bg-white p-5">
            <p className="text-xs font-medium text-[#8a817b]">Pending</p>
            <p className="mt-2 text-3xl font-bold text-[#b9825f]">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e0da] bg-white p-5">
            <p className="text-xs font-medium text-[#8a817b]">Active</p>
            <p className="mt-2 text-3xl font-bold text-[#8B5E3C]">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e0da] bg-white p-5">
            <p className="text-xs font-medium text-[#8a817b]">Completed</p>
            <p className="mt-2 text-3xl font-bold text-[#2f7d5c]">
              {completedCount}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadDashboard}
              className="mt-3 rounded-lg bg-[#8b5e3c] px-4 py-2 text-sm font-medium text-white"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_360px]">
          <div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a6541]">
                  Repair Activity
                </p>

                <h2 className="mt-2 text-xl font-bold tracking-tight text-[#17202a]">
                  Recent Requests
                </h2>
              </div>

              <button
                type="button"
                onClick={loadDashboard}
                className="rounded-lg border border-[#d6c5b7] px-4 py-2 text-sm font-medium text-[#8b5e3c] hover:bg-[#f5eee8]"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-5 rounded-2xl border border-[#e7e0da] bg-white px-6 py-16 text-center">
                <p className="text-sm text-[#75675f]">
                  Loading your requests...
                </p>
              </div>
            ) : recentRequests.length > 0 ? (
              <div className="mt-5 space-y-5">
                {recentRequests.map((request) => (
                  <div key={request.id}>
                    <RepairRequestCard request={request} />

                    {request.status === "pending" && (
                      <div className="flex justify-end rounded-b-2xl border-x border-b border-[#e1d5ca] bg-white px-5 py-4">
                        <button
                          type="button"
                          disabled={cancellingId === request.id}
                          onClick={() => handleCancelRequest(request.id)}
                          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          {cancellingId === request.id
                            ? "Cancelling..."
                            : "Cancel Request"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-[#d8c8bc] bg-white px-6 py-16 text-center">
                <h3 className="font-semibold text-[#17202a]">
                  No repair requests yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75675f]">
                  Find a repairer and send your first repair request.
                </p>

                <Link
                  to="/repairers"
                  className="mt-5 inline-flex rounded-xl bg-[#8B5E3C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#754B2F]"
                >
                  Browse Repairers
                </Link>
              </div>
            )}
          </div>

          <div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a6541]">
                Recommended
              </p>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-[#17202a]">
                Repairers
              </h2>
            </div>

            {loadingRepairers ? (
              <div className="mt-5 rounded-2xl border border-[#e7e0da] bg-white px-5 py-10 text-center">
                <p className="text-sm text-[#75675f]">
                  Loading repairers...
                </p>
              </div>
            ) : repairers.length > 0 ? (
              <div className="mt-5 space-y-4">
                {repairers.map((repairer) => (
                  <Link
                    key={repairer.id}
                    to={`/repairer/${repairer.id}`}
                    className="block rounded-2xl border border-[#e7e0da] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#d6c5b7] hover:shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#8B5E3C] text-lg font-bold text-white">
                        {repairer.name?.charAt(0)?.toUpperCase() || "R"}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-[#17202a]">
                          {repairer.name}
                        </h3>

                        <p className="mt-1 text-xs text-[#8a817b]">
                          {repairer.category || "General Repair"}
                        </p>

                        <p className="mt-2 text-xs text-[#75675f]">
                          {repairer.location || "Cebu"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#eee7e1] pt-4">
                      <span className="text-sm font-semibold text-[#8b5e3c]">
                        ₱{repairer.price || 0}
                      </span>

                      <span className="text-xs font-medium text-[#8B5E3C]">
                        View Profile
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-[#e7e0da] bg-white px-5 py-10 text-center">
                <p className="text-sm text-[#75675f]">
                  No repairers available right now.
                </p>
              </div>
            )}

            <Link
              to="/repairers"
              className="mt-4 flex w-full items-center justify-center rounded-xl border border-[#d6c5b7] bg-white px-4 py-3 text-sm font-semibold text-[#8b5e3c] hover:bg-[#f5eee8]"
            >
              View All Repairers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CustomerDashboard;
