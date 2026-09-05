import { useEffect, useState } from "react";
import {
  fetchMyRepairRequests,
  createReview,
} from "../../services/repairService";

function getStatusClasses(status) {
  switch (status) {
    case "completed":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "accepted":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "in_progress":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-white/5 text-slate-300 border-white/10";
  }
}

function formatStatus(status) {
  if (!status) return "Pending";

  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function RepairHistorySection() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [ratingRequest, setRatingRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [ratingSuccess, setRatingSuccess] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchMyRepairRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load repair history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  function openRating(request) {
    setRatingRequest(request);
    setRating(0);
    setComment("");
    setRatingError("");
    setRatingSuccess("");
  }

  function closeRating() {
    if (submitting) return;

    setRatingRequest(null);
    setRating(0);
    setComment("");
    setRatingError("");
    setRatingSuccess("");
  }

  async function handleSubmitRating(event) {
    event.preventDefault();

    if (!ratingRequest) return;

    if (rating < 1 || rating > 5) {
      setRatingError("Please select a rating from 1 to 5.");
      return;
    }

    try {
      setSubmitting(true);
      setRatingError("");
      setRatingSuccess("");

      await createReview({
        repairRequestId: ratingRequest.id,
        rating,
        comment: comment.trim(),
      });

      setRatingSuccess("Your rating has been submitted.");

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === ratingRequest.id
            ? { ...request, has_review: true }
            : request
        )
      );

      setTimeout(() => {
        setRatingRequest(null);
        setRating(0);
        setComment("");
        setRatingSuccess("");
      }, 1000);
    } catch (err) {
      setRatingError(err.message || "Failed to submit your rating.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b9825f]">
          Customer
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          Repair History
        </h2>

        <p className="mt-2 max-w-2xl text-slate-400">
          View your repair requests and rate repairers after a completed job.
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-slate-400">
          Loading repair history...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          <p className="text-sm text-red-300">{error}</p>

          <button
            type="button"
            onClick={loadRequests}
            className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && requests.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <h3 className="text-lg font-semibold text-white">
            No repair history yet
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Your repair requests will appear here.
          </p>
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.05]"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-white">
                      {request.service || "Repair Service"}
                    </h3>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        request.status
                      )}`}
                    >
                      {formatStatus(request.status)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    Repairer:{" "}
                    <span className="font-semibold text-slate-200">
                      {request.repairer_name || "Repairer"}
                    </span>
                  </p>

                  {request.description && (
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {request.description}
                    </p>
                  )}

                  <p className="mt-4 text-xs text-slate-500">
                    Requested {formatDate(request.created_at)}
                  </p>
                </div>

                {request.status === "completed" && !request.has_review && (
                  <button
                    type="button"
                    onClick={() => openRating(request)}
                    className="shrink-0 rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a97150]"
                  >
                    Rate Repairer
                  </button>
                )}

                {request.status === "completed" && request.has_review && (
                  <div className="shrink-0 rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-3 text-sm font-semibold text-green-400">
                    Rated
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {ratingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15191f] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#b9825f]">
                  Completed Repair
                </p>

                <h3 className="mt-1 text-2xl font-bold text-white">
                  Rate {ratingRequest.repairer_name || "Repairer"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeRating}
                disabled={submitting}
                className="text-2xl leading-none text-slate-500 transition hover:text-white disabled:opacity-50"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="mt-6">
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Your rating
                </p>

                <div className="mt-3 flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      disabled={submitting}
                      className={`flex h-11 w-11 items-center justify-center rounded-lg border text-lg font-bold transition ${
                        rating >= value
                          ? "border-[#b9825f] bg-[#b9825f] text-white"
                          : "border-white/10 bg-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300"
                      }`}
                      aria-label={`${value} star rating`}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Select a rating from 1 to 5.
                </p>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="review-comment"
                  className="text-sm font-semibold text-slate-200"
                >
                  Comment
                </label>

                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  disabled={submitting}
                  rows={4}
                  maxLength={500}
                  placeholder="Share your experience with this repairer..."
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#b9825f]"
                />
              </div>

              {ratingError && (
                <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {ratingError}
                </p>
              )}

              {ratingSuccess && (
                <p className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                  {ratingSuccess}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeRating}
                  disabled={submitting}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-[#b9825f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#a97150] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Rating"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default RepairHistorySection;