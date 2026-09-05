import { useEffect, useMemo, useState } from "react";

import RepairRequestCard from "@/components/features/RepairRequestCard";
import { fetchMyRepairRequests } from "@/services/repairService";

function CustomerDashboardSection() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    loadRequests();
  }, []);

  const stats = useMemo(() => {
    const pending = requests.filter(
      (request) => String(request.status).toLowerCase() === "pending"
    ).length;

    const completed = requests.filter(
      (request) => String(request.status).toLowerCase() === "completed"
    ).length;

    return {
      total: requests.length,
      pending,
      completed,
    };
  }, [requests]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-12">

      {/* Dashboard Header */}
      <div className="overflow-hidden rounded-3xl border border-[#caa98e] bg-[#8b5e3c] px-6 py-8 shadow-md sm:px-8 sm:py-9">

        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f2ddcb]">
          Customer Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
          My Repair Requests
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#f5e8dd] sm:text-base">
          Track your repair requests and stay updated on their progress.
        </p>

      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-[#dcc8b8] bg-[#fffaf5] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9a6541]">
            Total Requests
          </p>

          <p className="mt-2 text-3xl font-black text-[#2f241e]">
            {stats.total}
          </p>

          <p className="mt-1 text-sm text-[#75675f]">
            All your repair requests
          </p>
        </div>

        <div className="rounded-2xl border border-[#dcc8b8] bg-[#fffaf5] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9a6541]">
            Pending
          </p>

          <p className="mt-2 text-3xl font-black text-[#2f241e]">
            {stats.pending}
          </p>

          <p className="mt-1 text-sm text-[#75675f]">
            Waiting for repairer
          </p>
        </div>

        <div className="rounded-2xl border border-[#dcc8b8] bg-[#fffaf5] p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#9a6541]">
            Completed
          </p>

          <p className="mt-2 text-3xl font-black text-[#2f241e]">
            {stats.completed}
          </p>

          <p className="mt-1 text-sm text-[#75675f]">
            Finished repairs
          </p>
        </div>

      </div>

      {/* Recent Requests */}
      <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <h2 className="text-2xl font-black text-[#2f241e]">
            Recent Requests
          </h2>

          <p className="mt-1 text-sm text-[#75675f]">
            Your latest repair activity appears here.
          </p>
        </div>

        {!loading && requests.length > 0 && (
          <button
            type="button"
            onClick={loadRequests}
            className="w-fit rounded-xl border border-[#cdb39f] bg-[#fffaf5] px-4 py-2 text-sm font-bold text-[#7a4f31] transition hover:bg-[#f4e6da]"
          >
            Refresh
          </button>
        )}

      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-5 rounded-2xl border border-[#dcc8b8] bg-[#fffaf5] px-5 py-10 text-center">
          <p className="text-sm font-medium text-[#75675f]">
            Loading your repair requests...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Requests */}
      {!loading && !error && requests.length > 0 && (
        <div className="mt-5 space-y-5">
          {requests.map((request) => (
            <RepairRequestCard
              key={request.id}
              request={request}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && requests.length === 0 && (
        <div className="mt-5 rounded-2xl border border-[#dcc8b8] bg-[#fffaf5] px-6 py-12 text-center shadow-sm">

          <h3 className="text-lg font-extrabold text-[#2f241e]">
            No repair requests yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75675f]">
            Once you request a repairer, your repair request and its status
            will appear here.
          </p>

        </div>
      )}

    </section>
  );
}

export default CustomerDashboardSection;
