import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchPendingRepairers, verifyRepairer } from "@/services/adminService";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PendingBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-[#fdf3e7] px-2 py-0.5 text-[10px] font-semibold text-[#b9700f]">
      Pending
    </span>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const [repairers, setRepairers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    if (user?.role !== "admin") return;

    loadRepairers();
  }, [user]);

  async function loadRepairers() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchPendingRepairers();
      setRepairers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(id, status) {
    setActioningId(id);
    setError("");

    try {
      await verifyRepairer(id, status);
      setRepairers((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  }

  if (!user) {
    return (
      <section className="fixora-container flex min-h-[500px] items-center justify-center py-16">
        <p className="text-sm text-[#777f86]">
          You must be logged in to view this page.
        </p>
      </section>
    );
  }

  if (user.role !== "admin") {
    return (
      <section className="fixora-container flex min-h-[500px] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-[#e4ded7] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#17202a]">
            Access denied
          </h1>

          <p className="mt-3 text-sm text-[#777f86]">
            This page is only available to admins.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="fixora-container py-14">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
          Admin
        </p>

        <h1 className="mt-2 text-3xl font-extrabold text-[#17202a]">
          Repairer Verification
        </h1>

        <p className="mt-2 text-sm text-[#777f86]">
          {repairers.length > 0
            ? `${repairers.length} pending application${repairers.length === 1 ? "" : "s"}`
            : "Review and approve pending repairer applications."}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[#777f86]">Loading...</p>
      ) : repairers.length === 0 ? (
        <div className="rounded-2xl border border-[#e4ded7] bg-white p-10 text-center">
          <p className="text-sm text-[#777f86]">
            No pending applications right now.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {repairers.map((r) => (
            <Card
              key={r.id}
              className="flex flex-col p-3.5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#efe7df] to-[#dcd5cd] text-xs font-bold text-[#9b806a]">
                  {getInitials(r.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h2 className="truncate text-sm font-bold text-[#17202a]">
                      {r.name}
                    </h2>

                    <PendingBadge />
                  </div>

                  <p className="mt-0.5 truncate text-xs text-[#8a9298]">
                    {r.email}
                  </p>
                </div>
              </div>

              <p className="mt-2 text-xs font-semibold text-[#b9825f]">
                {r.category}
                {r.years_experience != null && (
                  <span className="ml-1.5 font-normal text-[#777f86]">
                    · {r.years_experience} yrs
                  </span>
                )}
              </p>

              {r.bio && (
                <p className="mt-1 line-clamp-1 text-xs leading-5 text-[#68727c]">
                  {r.bio}
                </p>
              )}

              <div className="mt-3 flex gap-1.5 border-t border-[#eee9e3] pt-3">
                <Button
                  onClick={() => handleVerify(r.id, "verified")}
                  disabled={actioningId === r.id}
                  className="flex-1 !px-2 !py-1.5 !text-xs"
                >
                  {actioningId === r.id ? "..." : "Approve"}
                </Button>

                <Button
                  onClick={() => handleVerify(r.id, "rejected")}
                  variant="outline"
                  disabled={actioningId === r.id}
                  className="flex-1 !px-2 !py-1.5 !text-xs"
                >
                  {actioningId === r.id ? "..." : "Reject"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminDashboard;