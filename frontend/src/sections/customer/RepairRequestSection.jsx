import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import RepairRequestForm from "@/components/features/RepairRequestForm";
import { repairers } from "@/services/repairerData";
import { apiPost } from "@/lib/api";

function RepairRequestSection() {
  const { repairerId } = useParams();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const repairer =
    repairers.find((item) => item.id === repairerId) ||
    repairers[0];

  async function handleSubmit(requestData) {
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
        `Repairer: ${repairer.name}`,
      ]
        .filter(Boolean)
        .join("\n");

      const report = await apiPost("/api/reports", {
        user_id: 1,
        title: requestData.itemName,
        description,
      });

      console.log("Repair request created:", report);

      navigate("/customer/dashboard");
    } catch (err) {
      console.error("Failed to create repair request:", err);

      setError(
        "We couldn't submit your repair request. Please make sure the backend is running and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen px-6 py-12 sm:py-20">
      {error && (
        <div className="mx-auto mb-6 max-w-3xl rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
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
