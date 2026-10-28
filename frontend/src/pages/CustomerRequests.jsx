import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchMyRepairRequests,
  cancelRepairRequest,
  createReview,
} from "@/services/repairService";

function CustomerRequests() {
  const [requests, setRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchMyRepairRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load repair requests.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this repair request?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(id);
      setError("");

      await cancelRepairRequest(id);

      setRequests((current) =>
        current.map((request) =>
          request.id === id
            ? { ...request, status: "cancelled" }
            : request
        )
      );
    } catch (err) {
      setError(err.message || "Failed to cancel request.");
    } finally {
      setCancellingId(null);
    }
  }

  function openReview(requestId) {
    setReviewingId(requestId);
    setReviewRating(0);
    setReviewComment("");
    setReviewMessage("");
  }

  function closeReview() {
    if (reviewLoading) return;

    setReviewingId(null);
    setReviewRating(0);
    setReviewComment("");
    setReviewMessage("");
  }

  async function handleReviewSubmit(requestId) {
    if (reviewRating < 1) {
      setReviewMessage("Please select a rating.");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewMessage("Please write a short comment.");
      return;
    }

    try {
      setReviewLoading(true);
      setReviewMessage("");

      const result = await createReview({
        repairRequestId: requestId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? {
                ...request,
                has_review: true,
                review:
                  result?.review || {
                    rating: reviewRating,
                    comment: reviewComment.trim(),
                  },
              }
            : request
        )
      );

      setReviewMessage("Review submitted successfully.");

      setTimeout(() => {
        setReviewingId(null);
        setReviewRating(0);
        setReviewComment("");
        setReviewMessage("");
      }, 1000);
    } catch (err) {
      setReviewMessage(
        err.message || "Failed to submit review."
      );
    } finally {
      setReviewLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    if (activeFilter === "all") return requests;

    return requests.filter(
      (request) => request.status === activeFilter
    );
  }, [requests, activeFilter]);

  const filters = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  function getStatusStyle(status) {
    if (status === "pending") {
      return "bg-[#f5e9e0] text-[#5f5751]";
    }

    if (status === "accepted") {
      return "bg-[#f7f2ee] text-[#5f5751]";
    }

    if (status === "in_progress" || status === "ongoing") {
      return "bg-[#eee7e2] text-[#5f5751]";
    }

    if (status === "completed") {
      return "bg-[#e7e0da] text-[#17202a]";
    }

    if (status === "cancelled") {
      return "bg-[#f7f7f5] text-[#8a817b]";
    }

    return "bg-[#f7f2ee] text-[#75675f]";
  }

  function formatStatus(status) {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return (
    <div className="min-h-full bg-[#f7f7f5] px-4 py-8 text-[#17202a] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#75675f]">
              Repair Activity
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              My Requests
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75675f]">
              Track your repair requests and review completed services.
            </p>
          </div>

          <Link
            to="/repairers"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-[#e7e0da] bg-white px-5 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f5e9e0]"
          >
            Find a Repairer
          </Link>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => {
            const count =
              filter.value === "all"
                ? requests.length
                : requests.filter(
                    (request) => request.status === filter.value
                  ).length;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  activeFilter === filter.value
                    ? "border-[#e7e0da] bg-[#f5e9e0] text-[#17202a]"
                    : "border-[#e7e0da] bg-white text-[#75675f] hover:bg-[#f7f2ee]"
                }`}
              >
                {filter.label}
                <span className="text-xs">{count}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-[#e7e0da] bg-white px-5 py-4">
            <p className="text-sm text-[#75675f]">{error}</p>

            <button
              type="button"
              onClick={loadRequests}
              className="mt-3 rounded-xl border border-[#e7e0da] bg-white px-4 py-2 text-sm font-semibold text-[#17202a] transition hover:bg-[#f5e9e0]"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-3xl border border-[#e7e0da] bg-white px-6 py-16 text-center">
            <p className="text-sm text-[#75675f]">
              Loading your requests...
            </p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-[#d8c8bc] bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold">
              No requests found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75675f]">
              {activeFilter === "all"
                ? "You have not submitted any repair requests yet."
                : `You do not have any ${activeFilter.replaceAll(
                    "_",
                    " "
                  )} requests.`}
            </p>

            <Link
              to="/repairers"
              className="mt-5 inline-flex rounded-xl border border-[#e7e0da] bg-[#f5e9e0] px-5 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f7f2ee]"
            >
              Browse Repairers
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-3xl border border-[#e7e0da] bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-[#17202a]">
                        {request.itemName || "Repair Request"}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          request.status
                        )}`}
                      >
                        {formatStatus(request.status)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-[#75675f]">
                      {request.category || "Repair Service"}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-xs text-[#8a817b]">
                      Request ID
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#17202a]">
                      #{request.id}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 border-t border-[#eee7e2] pt-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium text-[#8a817b]">
                      Repairer
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#17202a]">
                      {request.repairerName || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#8a817b]">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#17202a]">
                      {request.location || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#8a817b]">
                      Schedule
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#17202a]">
                      {request.schedule || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#8a817b]">
                      Service
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#17202a]">
                      {request.service ||
                        request.category ||
                        "Repair Service"}
                    </p>
                  </div>
                </div>

                {request.problem && (
                  <div className="mt-5 rounded-2xl bg-[#f7f7f5] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a817b]">
                      Problem
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[#5f5751]">
                      {request.problem}
                    </p>
                  </div>
                )}

                {request.status === "completed" && (
                  <div className="mt-5 rounded-2xl bg-[#f7f7f5] p-4">
                    {request.has_review ? (
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-[#17202a]">
                            Your Review
                          </p>

                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={
                                  star <=
                                  (request.review?.rating || 0)
                                    ? "text-[#75675f]"
                                    : "text-[#d8c8bc]"
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>

                        {request.review?.comment && (
                          <p className="mt-2 text-sm leading-6 text-[#5f5751]">
                            {request.review.comment}
                          </p>
                        )}
                      </div>
                    ) : reviewingId === request.id ? (
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#17202a]">
                              Rate your experience
                            </p>

                            <p className="mt-1 text-xs text-[#8a817b]">
                              Share your experience with this repairer.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={closeReview}
                            disabled={reviewLoading}
                            className="text-sm font-semibold text-[#75675f] hover:text-[#17202a] disabled:opacity-50"
                          >
                            Close
                          </button>
                        </div>

                        <div className="mt-5 flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className={`text-3xl transition ${
                                star <= reviewRating
                                  ? "text-[#75675f]"
                                  : "text-[#d8c8bc]"
                              }`}
                              aria-label={`${star} star rating`}
                            >
                              ★
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={reviewComment}
                          onChange={(event) =>
                            setReviewComment(event.target.value)
                          }
                          placeholder="Write your review..."
                          rows={4}
                          className="mt-4 w-full rounded-xl border border-[#e7e0da] bg-white px-4 py-3 text-sm text-[#17202a] outline-none transition focus:border-[#d8c8bc] focus:ring-2 focus:ring-[#f5e9e0]"
                        />

                        {reviewMessage && (
                          <p className="mt-3 text-sm text-[#75675f]">
                            {reviewMessage}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleReviewSubmit(request.id)
                          }
                          disabled={reviewLoading}
                          className="mt-4 rounded-xl border border-[#e7e0da] bg-white px-5 py-3 text-sm font-semibold text-[#17202a] transition hover:bg-[#f5e9e0] disabled:opacity-60"
                        >
                          {reviewLoading
                            ? "Submitting..."
                            : "Submit Review"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#17202a]">
                            Service completed
                          </p>

                          <p className="mt-1 text-xs text-[#8a817b]">
                            How was your experience?
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => openReview(request.id)}
                          className="rounded-xl border border-[#e7e0da] bg-white px-4 py-2.5 text-sm font-semibold text-[#17202a] transition hover:bg-[#f5e9e0]"
                        >
                          Leave a Review
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee7e2] pt-5">
                  <Link
                    to={`/repairer/${request.repairerId}`}
                    className="text-sm font-semibold text-[#5f5751] transition hover:text-[#17202a]"
                  >
                    View Repairer
                  </Link>

                  {request.status === "pending" && (
                    <button
                      type="button"
                      disabled={cancellingId === request.id}
                      onClick={() => handleCancel(request.id)}
                      className="rounded-xl border border-[#e7e0da] bg-white px-4 py-2.5 text-sm font-semibold text-[#75675f] transition hover:bg-[#f7f2ee] disabled:opacity-60"
                    >
                      {cancellingId === request.id
                        ? "Cancelling..."
                        : "Cancel Request"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerRequests;