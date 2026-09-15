import { useEffect, useState } from "react";

import RepairRequestCard from "@/components/features/RepairRequestCard";
import {
  fetchMyRepairRequests,
  cancelRepairRequest,
} from "@/services/repairService";

function CustomerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

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
            ? {
                ...request,
                status: "cancelled",
              }
            : request
        )
      );
    } catch (err) {
      console.error("Failed to cancel repair request:", err);
      setError(err.message || "Failed to cancel repair request.");
    } finally {
      setCancellingId(null);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="min-h-full bg-[#f6f5f2] text-[#17202a]">
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
                <div key={request.id}>
                  <RepairRequestCard
                    request={request}
                  />

                  {request.status === "pending" && (
                    <div className="flex justify-end rounded-b-2xl border-x border-b border-[#e1d5ca] bg-[#faf9f7] px-5 py-4 sm:px-6">
                      <button
                        type="button"
                        disabled={cancellingId === request.id}
                        onClick={() => handleCancelRequest(request.id)}
                        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
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
    </div>
  );
}

export default CustomerDashboard;