import { useState } from "react";

import RepairRequestCard from "@/components/features/RepairRequestCard";

function CustomerDashboardSection() {
  const [request, setRequest] = useState(() => {
    const saved = localStorage.getItem(
      "fixora_pending_request"
    );

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  function handleCancel() {
    localStorage.removeItem(
      "fixora_pending_request"
    );

    setRequest(null);
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:py-20">

      {/* HEADER */}
      <div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
          Customer Dashboard
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight">
          My Repair Requests
        </h1>

        <p className="mt-3 max-w-2xl text-slate-500">
          Track your repair requests and stay updated on
          their progress.
        </p>

      </div>

      {/* REQUEST */}
      {request ? (

        <div className="mt-10">

          <RepairRequestCard request={request} />

          <button
            type="button"
            onClick={handleCancel}
            className="mt-4 rounded-xl border border-red-400/10 bg-red-400/5 px-5 py-3 text-sm font-bold text-red-300 transition hover:bg-red-400/10"
          >
            Cancel Request
          </button>

        </div>

      ) : (

        <div className="mt-10 rounded-3xl border border-dashed border-white/10 px-6 py-24 text-center">

          <h2 className="text-xl font-bold">
            No repair requests yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
            When you request a repairer, your repair request
            and its current status will appear here.
          </p>

        </div>

      )}

    </section>
  );
}

export default CustomerDashboardSection;