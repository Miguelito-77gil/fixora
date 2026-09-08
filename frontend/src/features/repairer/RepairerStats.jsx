import { useEffect, useState } from "react";
import { fetchRepairerDashboard } from "@/services/marketplaceService";

function RepairerStats() {
  const [stats, setStats] = useState({
    total_requests: 0,
    completed_requests: 0,
    pending_requests: 0,
    earnings: 0,
  });

  useEffect(() => {
    fetchRepairerDashboard()
      .then(setStats)
      .catch(() => {});
  }, []);

  const cards = [
    ["Total Requests", stats.total_requests],
    ["Completed", stats.completed_requests],
    ["Active Requests", stats.pending_requests],
    ["Earnings", `₱${Number(stats.earnings || 0).toLocaleString()}`],
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

export default RepairerStats;
