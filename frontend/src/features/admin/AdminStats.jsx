import { useEffect, useState } from "react";
import { fetchAdminDashboard } from "@/services/marketplaceService";

function AdminStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAdminDashboard()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  if (!stats) {
    return (
      <div className="rounded-2xl border border-[#e4ded7] bg-[#f7f7f5] p-6">
        Unable to load admin statistics.
      </div>
    );
  }

  const cards = [
    ["Users", stats.users],
    ["Customers", stats.customers],
    ["Repairers", stats.repairers],
    ["Verified Repairers", stats.verified_repairers],
    ["Pending Verification", stats.pending_verification],
    ["Requests", stats.requests],
    ["Completed Repairs", stats.completed_requests],
    ["Pending Reports", stats.reports],
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(([label, value]) => (
        <div
          key={label}
          className="rounded-2xl border border-[#e4ded7] bg-white p-5"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-[#90979d]">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black text-[#17202a]">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default AdminStats;

