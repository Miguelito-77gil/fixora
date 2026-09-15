import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRepairerEarnings } from "@/services/marketplaceService";

function RepairerEarnings() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEarnings() {
    try {
      setLoading(true);
      setError("");

      const result = await fetchRepairerEarnings();
      setData(result);
    } catch (err) {
      console.error("Failed to load earnings:", err);
      setError(err.message || "Failed to load earnings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEarnings();
  }, []);

  const source = data?.data || data || {};

  const records = useMemo(() => {
    const list =
      Array.isArray(source)
        ? source
        : Array.isArray(source?.earnings)
          ? source.earnings
          : Array.isArray(source?.records)
            ? source.records
            : Array.isArray(source?.history)
              ? source.history
              : [];

    return list;
  }, [source]);

  const totalEarnings = Number(
    source?.total_earnings ??
      source?.totalEarnings ??
      source?.total ??
      records.reduce(
        (sum, item) =>
          sum +
          Number(
            item?.amount ??
              item?.earning ??
              item?.total ??
              0
          ),
        0
      )
  );

  const completedJobs = Number(
    source?.completed_jobs ??
      source?.completedJobs ??
      source?.completed_repairs ??
      records.filter(
        (item) =>
          String(item?.status || "").toLowerCase() === "completed"
      ).length
  );

  const pendingJobs = Number(
    source?.pending_jobs ??
      source?.pendingJobs ??
      0
  );

  function formatMoney(value) {
    return `PHP ${Number(value || 0).toLocaleString()}`;
  }

  function formatDate(value) {
    if (!value) return "Date not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getAmount(item) {
    return Number(
      item?.amount ??
        item?.earning ??
        item?.total ??
        0
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ef] text-[#2f241e]">
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
              Repairer Workspace
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#2f241e]">
              Earnings
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#75675f]">
              Keep track of your completed repair work and earnings.
            </p>
          </div>

          <button
            type="button"
            onClick={loadEarnings}
            className="rounded-xl border border-[#ded0c6] bg-white px-4 py-2.5 text-sm font-semibold text-[#75675f] transition hover:bg-[#faf6f2]"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm leading-6 text-red-700">{error}</p>

            <button
              type="button"
              onClick={loadEarnings}
              className="mt-3 text-sm font-semibold text-red-700 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl border border-[#e4d9d0] bg-white px-6 py-24 text-center shadow-sm">
            <p className="text-sm text-[#75675f]">
              Loading earnings...
            </p>
          </div>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-[#e4d9d0] bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a6541]">
                  Total Earnings
                </p>

                <p className="mt-4 text-3xl font-black text-[#2f241e]">
                  {formatMoney(totalEarnings)}
                </p>

                <p className="mt-2 text-sm text-[#75675f]">
                  Recorded earnings from your repair work
                </p>
              </div>

              <div className="rounded-2xl border border-[#e4d9d0] bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a6541]">
                  Completed Jobs
                </p>

                <p className="mt-4 text-3xl font-black text-[#2f241e]">
                  {completedJobs}
                </p>

                <p className="mt-2 text-sm text-[#75675f]">
                  Successfully completed repair requests
                </p>
              </div>

              <div className="rounded-2xl border border-[#e4d9d0] bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a6541]">
                  Pending Jobs
                </p>

                <p className="mt-4 text-3xl font-black text-[#2f241e]">
                  {pendingJobs}
                </p>

                <p className="mt-2 text-sm text-[#75675f]">
                  Jobs still waiting for completion
                </p>
              </div>
            </section>

            <section className="mt-10">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b9825f]">
                    History
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-[#2f241e]">
                    Earnings History
                  </h2>
                </div>
              </div>

              {records.length === 0 ? (
                <div className="mt-5 rounded-3xl border border-dashed border-[#d8c8bc] bg-white px-6 py-24 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5e9e0] text-[#9a6541]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-7 w-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3.75v16.5M16.25 7.25c0-1.66-1.9-3-4.25-3s-4.25 1.34-4.25 3 1.55 2.55 4.25 3c2.7.45 4.25 1.5 4.25 3s-1.9 3-4.25 3-4.25-1.34-4.25-3"
                      />
                    </svg>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-[#2f241e]">
                    No earnings recorded yet
                  </h3>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#75675f]">
                    Earnings will appear here as completed repair work is
                    recorded.
                  </p>
                </div>
              ) : (
                <div className="mt-5 overflow-hidden rounded-3xl border border-[#e4d9d0] bg-white shadow-sm">
                  <div className="divide-y divide-[#eee5df]">
                    {records.map((item, index) => (
                      <div
                        key={item?.id ?? index}
                        className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[#2f241e]">
                            {item?.service_name ||
                              item?.service ||
                              item?.repair_type ||
                              item?.description ||
                              `Repair Job #${item?.repair_request_id || item?.id || index + 1}`}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#8b7a70]">
                            <span>
                              {formatDate(
                                item?.created_at ||
                                  item?.completed_at ||
                                  item?.date
                              )}
                            </span>

                            {item?.status && (
                              <span>
                                {String(item.status)
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (letter) =>
                                    letter.toUpperCase()
                                  )}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="shrink-0 text-lg font-bold text-[#8b5e3c]">
                          {formatMoney(getAmount(item))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <button
              type="button"
              onClick={() => navigate("/repairer/dashboard")}
              className="mt-8 text-sm font-medium text-[#8b5e3c] transition hover:text-[#6f452e]"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default RepairerEarnings;