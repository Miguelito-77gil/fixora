import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import RepairRequestForm from "@/components/features/RepairRequestForm";
import { fetchRepairerById } from "@/services/repairerService";
import { createRepairRequest } from "@/services/repairService";

function RepairRequestSection() {
  const { repairerId } = useParams();
  const navigate = useNavigate();

  const [repairer, setRepairer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRepairer() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchRepairerById(repairerId);

        if (!data) {
          throw new Error("Repairer not found");
        }

        setRepairer(data);
      } catch (err) {
        console.error("Failed to load repairer:", err);
        setError(err.message || "Failed to load repairer");
      } finally {
        setLoading(false);
      }
    }

    if (repairerId) {
      loadRepairer();
    } else {
      setLoading(false);
      setError("No repairer was selected");
    }
  }, [repairerId]);

  async function handleSubmit(requestData) {
    if (!repairer) {
      setError("Repairer information is not available");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const description = [
        `Item: ${requestData.itemName}`,
        `Category: ${requestData.category}`,
        `Problem: ${requestData.problem}`,
        `Location: ${requestData.location}`,
        `Preferred schedule: ${requestData.schedule}`,
        requestData.notes
          ? `Additional notes: ${requestData.notes}`
          : null,
        requestData.photoName
          ? `Photo: ${requestData.photoName}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      await createRepairRequest({
        repairerId: repairer.id,
        service:
          requestData.category ||
          repairer.category ||
          repairer.specialty ||
          "Repair Service",
        description,
      });

      navigate("/customer/dashboard");
    } catch (err) {
      console.error("Failed to create repair request:", err);
      setError(
        err.message ||
          "We couldn't submit your repair request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-gray-700 dark:text-gray-300">
            Loading repairer...
          </p>
        </div>
      </section>
    );
  }

  if (error && !repairer) {
    return (
      <section className="min-h-screen px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
            {error}
          </div>

          <button
            type="button"
            onClick={() => navigate("/customer/dashboard")}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Back to Dashboard
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-6 py-12 sm:py-20">
      {error && (
        <div className="mx-auto mb-6 max-w-3xl rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      <RepairRequestForm
        repairer={repairer}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/repairer/${repairer.id}`)}
        submitting={submitting}
      />
    </section>
  );
}

export default RepairRequestSection;
