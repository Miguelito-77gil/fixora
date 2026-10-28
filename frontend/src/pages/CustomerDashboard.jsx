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

    if (!confirmed) return;

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
    <div className="min-h-full bg-[#f7f7f5]">
      <section className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="rounded-3xl border border-[#e7e0da] bg-white px-6 py-7 shadow-sm sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#75675f]">
                Customer Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#17202a] sm:text-4xl">
                Welcome back
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75675f] sm:text-base">
                Manage your repair requests and find trusted repairers for your
                next service.
              </p>
            </div>

            <Link
              to="/repairers"
              className="inline-flex w-fit items-center justify-center rounded-xl border border-[#e7e0da] bg-[#f5e9e0] px-5 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f0e2d7]"
            >
              Find a Repairer
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#e7e0da] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#75675f]">
                Total Requests
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f2ee] text-[#5f5751]">
                <span className="text-sm font-bold">01</span>
              </div>
            </div>

            <p className="mt-5 text-3xl font-bold text-[#17202a]">
              {requests.length}
            </p>

            <p className="mt-1 text-xs text-[#8a817b]">
              All repair requests
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e0da] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#75675f]">
                Pending
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5e9e0] text-[#5f5751]">
                <span className="text-sm font-bold">02</span>
              </div>
            </div>

            <p className="mt-5 text-3xl font-bold text-[#17202a]">
              {pendingCount}
            </p>

            <p className="mt-1 text-xs text-[#8a817b]">
              Waiting for response
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e0da] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#75675f]">
                Active
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f2ee] text-[#5f5751]">
                <span className="text-sm font-bold">03</span>
              </div>
            </div>

            <p className="mt-5 text-3xl font-bold text-[#17202a]">
              {activeCount}
            </p>

            <p className="mt-1 text-xs text-[#8a817b]">
              Ongoing services
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7e0da] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#75675f]">
                Completed
              </p>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f2ee] text-[#5f5751]">
                <span className="text-sm font-bold">04</span>
              </div>
            </div>

            <p className="mt-5 text-3xl font-bold text-[#17202a]">
              {completedCount}
            </p>

            <p className="mt-1 text-xs text-[#8a817b]">
              Finished services
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-[#e7e0da] bg-white px-5 py-4">
            <p className="text-sm text-[#5f5751]">{error}</p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-3 rounded-xl border border-[#e7e0da] bg-[#f5e9e0] px-4 py-2 text-sm font-semibold text-[#17202a] transition hover:bg-[#f0e2d7]"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#75675f]">
                  Repair Activity
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#17202a]">
                  Recent Requests
                </h2>
              </div>

              <Link
                to="/customer/requests"
                className="hidden rounded-xl border border-[#e7e0da] bg-white px-4 py-2.5 text-sm font-semibold text-[#5f5751] transition hover:bg-[#f7f2ee] sm:inline-flex"
              >
                View All
              </Link>
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
                      <div className="flex justify-end rounded-b-2xl border-x border-b border-[#e7e0da] bg-white px-5 py-4">
                        <button
                          type="button"
                          disabled={cancellingId === request.id}
                          onClick={() => handleCancelRequest(request.id)}
                          className="rounded-xl border border-[#e7e0da] bg-white px-4 py-2 text-sm font-semibold text-[#5f5751] transition hover:bg-[#f7f2ee] disabled:opacity-60"
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
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7f2ee] text-[#5f5751]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-6 w-6"
                  >
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <path strokeLinecap="round" d="M8 9h8M8 13h8M8 17h5" />
                  </svg>
                </div>

                <h3 className="mt-4 font-semibold text-[#17202a]">
                  No repair requests yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75675f]">
                  Find a repairer and send your first repair request.
                </p>

                <Link
                  to="/repairers"
                  className="mt-5 inline-flex rounded-xl border border-[#e7e0da] bg-[#f5e9e0] px-5 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f0e2d7]"
                >
                  Browse Repairers
                </Link>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#75675f]">
                  Recommended
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#17202a]">
                  Repairers
                </h2>
              </div>
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
                    className="block rounded-2xl border border-[#e7e0da] bg-white p-5 shadow-sm transition hover:border-[#d8c8bc] hover:bg-[#fdfcfb]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f5e9e0] text-sm font-bold text-[#17202a]">
                        {repairer.name?.charAt(0)?.toUpperCase() || "R"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-[#17202a]">
                          {repairer.name}
                        </h3>

                        <p className="mt-1 text-xs text-[#8a817b]">
                          {repairer.category || "General Repair"}
                        </p>
                      </div>

                      <span className="text-[#75675f]">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m9 18 6-6-6-6"
                          />
                        </svg>
                      </span>
                    </div>

                    <div className="mt-4 border-t border-[#eee7e1] pt-4">
                      <p className="text-xs text-[#75675f]">
                        {repairer.location || "Cebu"}
                      </p>
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
              className="mt-4 flex w-full items-center justify-center rounded-xl border border-[#e7e0da] bg-white px-4 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f5e9e0]"
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