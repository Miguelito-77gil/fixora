import { useState } from "react";
import { createReview } from "@/services/repairService";

function formatSchedule(schedule) {
  if (!schedule) return "Not specified";

  const date = new Date(schedule);

  if (Number.isNaN(date.getTime())) {
    return schedule;
  }

  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function RepairRequestCard({ request }) {
  const status = String(request.status || "pending").toLowerCase();

  const statusStyles = {
    pending: "bg-[#f3e4d5] text-[#7a4a27] border-[#d8b99b]",
    accepted: "bg-[#e3edf4] text-[#31556f] border-[#b8cedd]",
    on_the_way: "bg-[#f4ead8] text-[#80602d] border-[#dfc89f]",
    arrived: "bg-[#eee5f3] text-[#664b78] border-[#d4c0df]",
    in_progress: "bg-[#e9e2d7] text-[#68533d] border-[#d2c0a8]",
    completed: "bg-[#e3eee5] text-[#376044] border-[#bdd3c1]",
    cancelled: "bg-[#f3e1df] text-[#8a4039] border-[#dfbbb6]",
  };

  const badgeStyle =
    statusStyles[status] ||
    "bg-[#f3e4d5] text-[#7a4a27] border-[#d8b99b]";

  const formattedStatus = status.replace(/_/g, " ");

  const itemName = request.itemName || "Repair Request";
  const category = request.category || "";
  const repairerName = request.repairerName || "Not assigned yet";

  const showCategory =
    category &&
    category.toLowerCase() !== itemName.toLowerCase();

  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState("");

  async function handleSubmitReview(event) {
    event.preventDefault();

    if (!selectedRating) {
      setReviewError("Please select a rating.");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");

      await createReview({
        repairRequestId: request.id,
        rating: selectedRating,
        comment: comment.trim(),
      });

      setReviewSubmitted(true);
      setShowRatingForm(false);
    } catch (error) {
      console.error("Failed to submit review:", error);
      setReviewError(
        error.message || "Failed to submit review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-[#d8c4b3] bg-[#fffaf5] shadow-[0_4px_18px_rgba(90,60,40,0.08)]">

      {/* Header */}
      <div className="border-b border-[#eaded4] bg-[#f8eee5] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div className="min-w-0">
            {showCategory && (
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9a6541]">
                {category}
              </p>
            )}

            <h3
              className={`text-xl font-semibold text-[#2f241e] ${
                showCategory ? "mt-2" : ""
              }`}
            >
              {itemName}
            </h3>

            <p className="mt-2 text-sm text-[#685b53]">
              Repairer{" "}
              <span className="font-medium text-[#3a2c24]">
                {repairerName}
              </span>
            </p>
          </div>

          <span
            className={`w-fit shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize ${badgeStyle}`}
          >
            {formattedStatus}
          </span>

        </div>
      </div>

      {/* Details */}
      <div className="grid gap-0 sm:grid-cols-2">

        <div className="border-b border-[#eaded4] px-5 py-5 sm:border-r sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9a8a7e]">
            Location
          </p>

          <p className="mt-2 text-sm font-medium leading-6 text-[#40332b]">
            {request.location || "Not specified"}
          </p>
        </div>

        <div className="border-b border-[#eaded4] px-5 py-5 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9a8a7e]">
            Preferred Schedule
          </p>

          <p className="mt-2 text-sm font-medium leading-6 text-[#40332b]">
            {formatSchedule(request.schedule)}
          </p>
        </div>

      </div>

      {/* Problem */}
      <div className="px-5 py-5 sm:px-6">

        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9a8a7e]">
          Problem
        </p>

        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#40332b]">
          {request.problem || "No problem description provided."}
        </p>

        {request.notes && (
          <div className="mt-5 rounded-xl border border-[#e5d8ce] bg-[#fdf8f3] px-4 py-3">

            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9a8a7e]">
              Additional Notes
            </p>

            <p className="mt-1.5 text-sm leading-6 text-[#40332b]">
              {request.notes}
            </p>

          </div>
        )}

      </div>

      {/* Rating */}
      {status === "completed" && (
        <div className="border-t border-[#eaded4] bg-[#fdf8f3] px-5 py-5 sm:px-6">

          {reviewSubmitted ? (
            <div className="rounded-xl border border-[#bdd3c1] bg-[#eaf3eb] px-4 py-4">

              <p className="text-sm font-medium text-[#376044]">
                Thank you for your review.
              </p>

              <p className="mt-1 text-sm text-[#54705a]">
                You rated {repairerName} {selectedRating} out of 5.
              </p>

            </div>
          ) : !showRatingForm ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9a8a7e]">
                  Repair Completed
                </p>

                <p className="mt-1.5 text-sm font-medium text-[#40332b]">
                  How was your experience with {repairerName}?
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowRatingForm(true);
                  setReviewError("");
                }}
                className="rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#a9704e]"
              >
                Rate Repairer
              </button>

            </div>
          ) : (
            <form onSubmit={handleSubmitReview}>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9a8a7e]">
                  Rate Repairer
                </p>

                <p className="mt-1.5 text-sm font-medium text-[#40332b]">
                  How was your experience?
                </p>
              </div>

              {/* Stars */}
              <div className="mt-4 flex items-center gap-2">

                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    aria-label={`Rate ${rating} out of 5`}
                    onClick={() => {
                      setSelectedRating(rating);
                      setReviewError("");
                    }}
                    className={`text-3xl leading-none transition ${
                      rating <= selectedRating
                        ? "text-[#b9825f]"
                        : "text-[#d8c8bc]"
                    } hover:scale-105`}
                  >
                    ★
                  </button>
                ))}

                {selectedRating > 0 && (
                  <span className="ml-2 text-sm font-medium text-[#685b53]">
                    {selectedRating}/5
                  </span>
                )}

              </div>

              {/* Comment */}
              <div className="mt-5">

                <label
                  htmlFor={`review-${request.id}`}
                  className="text-xs font-medium uppercase tracking-[0.12em] text-[#9a8a7e]"
                >
                  Review
                </label>

                <textarea
                  id={`review-${request.id}`}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Tell us about your experience (optional)"
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-[#d8c4b3] bg-white px-4 py-3 text-sm text-[#40332b] outline-none transition placeholder:text-[#aa9a8e] focus:border-[#b9825f] focus:ring-2 focus:ring-[#b9825f]/20"
                />

              </div>

              {reviewError && (
                <p className="mt-3 text-sm font-medium text-[#8a4039]">
                  {reviewError}
                </p>
              )}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#a9704e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>

                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={() => {
                    setShowRatingForm(false);
                    setReviewError("");
                  }}
                  className="rounded-xl border border-[#d8c8bc] px-5 py-3 text-sm font-medium text-[#8b5e3c] transition hover:bg-[#f7eee8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

              </div>

            </form>
          )}

        </div>
      )}

      {/* Footer */}
      <div className="border-t border-[#eaded4] bg-[#f8eee5] px-5 py-3.5 sm:px-6">

        <p className="text-xs font-medium text-[#8b786b]">
          Request ID{" "}
          <span className="font-medium text-[#604a39]">
            #{request.id}
          </span>
        </p>

      </div>

    </article>
  );
}

export default RepairRequestCard;