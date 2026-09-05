import { useEffect, useRef, useState } from "react";
import {
  fetchMyRepairRequests,
  updateRepairRequestStatus,
} from "@/services/repairService";

function RepairerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [newRequest, setNewRequest] = useState(null);

  const knownRequestIds = useRef(new Set());
  const initialized = useRef(false);

  async function loadRequests({ checkForNew = false } = {}) {
    try {
      setError("");

      const data = await fetchMyRepairRequests();
      const nextRequests = Array.isArray(data) ? data : [];

      if (checkForNew && initialized.current) {
        const pendingNewRequest = nextRequests.find(
          (request) =>
            request.status === "pending" &&
            !knownRequestIds.current.has(request.id)
        );

        if (pendingNewRequest) {
          setNewRequest(pendingNewRequest);
        }
      }

      nextRequests.forEach((request) => {
        knownRequestIds.current.add(request.id);
      });

      initialized.current = true;
      setRequests(nextRequests);
    } catch (err) {
      console.error("Failed to load repair requests:", err);
      setError(err.message || "Failed to load repair requests.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      setUpdatingId(id);
      setError("");

      await updateRepairRequestStatus(id, status);

      setNewRequest((current) =>
        current?.id === id ? null : current
      );

      await loadRequests();
    } catch (err) {
      console.error("Failed to update request:", err);
      setError(err.message || "Failed to update request.");
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    loadRequests();

    const interval = setInterval(() => {
      loadRequests({ checkForNew: true });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  function getStatusStyle(status) {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";

      case "on_the_way":
        return "bg-amber-100 text-amber-700 border-amber-200";

      case "arrived":
        return "bg-purple-100 text-purple-700 border-purple-200";

      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200";

      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";

      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";

      default:
        return "bg-[#f3e5da] text-[#8b5e3c] border-[#dfcabb]";
    }
  }

  function formatStatus(status) {
    return String(status || "pending")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

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

  function getDetail(description, label) {
    const line = String(description || "")
      .split("\n")
      .find((item) => item.startsWith(`${label}:`));

    return line
      ? line.replace(`${label}:`, "").trim()
      : "";
  }

  function getRequestDetails(request) {
    const description = String(request.description || "");

    return {
      item:
        getDetail(description, "Item") ||
        request.service ||
        "Repair Request",

      category:
        getDetail(description, "Category") ||
        "Repair Service",

      location:
        getDetail(description, "Location") ||
        "Not specified",

      problem:
        getDetail(description, "Problem") ||
        "No problem description provided.",

      notes: getDetail(description, "Additional notes"),

      schedule: getDetail(description, "Preferred schedule"),
    };
  }

  function viewNewRequest() {
    if (!newRequest) return;

    setNewRequest(null);

    setTimeout(() => {
      const element = document.getElementById(
        `repair-request-${newRequest.id}`
      );

      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }

  function canContactCustomer(status) {
    return [
      "accepted",
      "on_the_way",
      "arrived",
      "in_progress",
      "completed",
    ].includes(status);
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:py-20">

      {/* NEW REQUEST POPUP */}
      {newRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-3xl border border-[#e4d9d0] bg-white p-6 shadow-2xl">

            <div className="border-b border-[#eee5df] pb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9825f]">
                New Request
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#2f241e]">
                You have a new repair request
              </h2>

              <p className="mt-2 text-sm text-[#75675f]">
                A customer has requested your repair service.
              </p>
            </div>

            {(() => {
              const details = getRequestDetails(newRequest);

              return (
                <div className="mt-5 space-y-4">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#9a6541]">
                      Customer
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#2f241e]">
                      {newRequest.customer_name || "Customer"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#9a6541]">
                      Item
                    </p>

                    <p className="mt-1 text-sm text-[#2f241e]">
                      {details.item}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#9a6541]">
                        Service
                      </p>

                      <p className="mt-1 text-sm text-[#2f241e]">
                        {newRequest.service || details.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#9a6541]">
                        Location
                      </p>

                      <p className="mt-1 text-sm text-[#2f241e]">
                        {details.location}
                      </p>
                    </div>

                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#9a6541]">
                      Preferred Schedule
                    </p>

                    <p className="mt-1 text-sm text-[#2f241e]">
                      {formatSchedule(details.schedule)}
                    </p>
                  </div>

                </div>
              );
            })()}

            <div className="mt-6 flex flex-col gap-3 border-t border-[#eee5df] pt-5 sm:flex-row">

              <button
                type="button"
                onClick={viewNewRequest}
                className="flex-1 rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a9704e]"
              >
                View Request
              </button>

              <button
                type="button"
                onClick={() => setNewRequest(null)}
                className="flex-1 rounded-xl border border-[#d8c8bc] px-5 py-3 text-sm font-bold text-[#8b5e3c] transition hover:bg-[#f7eee8]"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
          Repairer Dashboard
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#2f241e]">
          Repair Requests
        </h1>

        <p className="mt-3 max-w-2xl text-[#75675f]">
          Manage customer repair requests and update their progress.
        </p>
      </div>

      {/* PENDING REQUEST COUNT */}
      {!loading &&
        !error &&
        requests.filter(
          (request) => request.status === "pending"
        ).length > 0 && (
          <div className="mt-8 rounded-2xl border border-[#e4d9d0] bg-[#fdf8f4] px-5 py-4">

            <p className="text-sm font-bold text-[#8b5e3c]">
              {
                requests.filter(
                  (request) => request.status === "pending"
                ).length
              }{" "}
              pending request
              {
                requests.filter(
                  (request) => request.status === "pending"
                ).length === 1
                  ? ""
                  : "s"
              }
            </p>

            <p className="mt-1 text-sm text-[#75675f]">
              Review your pending customer requests below.
            </p>

          </div>
        )}

      {/* LOADING */}
      {loading && (
        <div className="mt-10 rounded-3xl border border-[#e4d9d0] px-6 py-20 text-center">

          <p className="text-sm text-[#75675f]">
            Loading repair requests...
          </p>

        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="mt-10 rounded-2xl border border-red-300 bg-red-50 px-5 py-4">

          <p className="text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadRequests()}
            className="mt-4 rounded-xl bg-[#b9825f] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#a9704e]"
          >
            Try Again
          </button>

        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        !error &&
        requests.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-[#d8c8bc] px-6 py-24 text-center">

            <h2 className="text-xl font-bold text-[#2f241e]">
              No repair requests yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#75675f]">
              Customer requests assigned to you will appear here.
            </p>

          </div>
        )}

      {/* REQUEST LIST */}
      {!loading &&
        !error &&
        requests.length > 0 && (
          <div className="mt-10 space-y-6">

            {requests.map((request) => {
              const details = getRequestDetails(request);
              const isUpdating = updatingId === request.id;
              const showCustomerContact = canContactCustomer(
                request.status
              );

              return (
                <article
                  id={`repair-request-${request.id}`}
                  key={request.id}
                  className="rounded-3xl border border-[#e4d9d0] bg-white/80 p-6 shadow-sm"
                >

                  {/* REQUEST HEADER */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9825f]">
                        Request #{request.id}
                      </p>

                      <h2 className="mt-2 text-2xl font-black text-[#2f241e]">
                        {details.item}
                      </h2>

                      <p className="mt-1 text-sm text-[#75675f]">
                        Customer: {request.customer_name || "Customer"}
                      </p>

                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold ${getStatusStyle(
                        request.status
                      )}`}
                    >
                      {formatStatus(request.status)}
                    </span>

                  </div>

                  {/* CUSTOMER CONTACT */}
                  {showCustomerContact && (
                    <div className="mt-6 rounded-2xl border border-[#dfcabb] bg-[#fdf8f4] p-5">

                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a6541]">
                        Customer Contact
                      </p>

                      <p className="mt-2 text-base font-bold text-[#2f241e]">
                        {request.customer_name || "Customer"}
                      </p>

                      {request.customerPhone ? (
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <p className="text-sm text-[#4f443d]">
                            {request.customerPhone}
                          </p>

                          <a
                            href={`tel:${request.customerPhone}`}
                            className="inline-flex w-fit rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a9704e]"
                          >
                            Call Customer
                          </a>

                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-[#75675f]">
                          The customer has not added a mobile number yet.
                        </p>
                      )}

                    </div>
                  )}

                  {/* DETAILS */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#9a6541]">
                        Category
                      </p>

                      <p className="mt-1 text-sm text-[#2f241e]">
                        {details.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#9a6541]">
                        Location
                      </p>

                      <p className="mt-1 text-sm text-[#2f241e]">
                        {details.location}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#9a6541]">
                        Preferred Schedule
                      </p>

                      <p className="mt-1 text-sm text-[#2f241e]">
                        {formatSchedule(details.schedule)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#9a6541]">
                        Service
                      </p>

                      <p className="mt-1 text-sm text-[#2f241e]">
                        {request.service || details.category}
                      </p>
                    </div>

                  </div>

                  {/* PROBLEM */}
                  <div className="mt-6 border-t border-[#eee5df] pt-5">

                    <p className="text-xs font-bold uppercase tracking-wider text-[#9a6541]">
                      Problem
                    </p>

                    <p className="mt-2 text-sm leading-7 text-[#4f443d]">
                      {details.problem}
                    </p>

                    {details.notes && (
                      <div className="mt-4">

                        <p className="text-xs font-bold uppercase tracking-wider text-[#9a6541]">
                          Additional Notes
                        </p>

                        <p className="mt-2 text-sm leading-7 text-[#4f443d]">
                          {details.notes}
                        </p>

                      </div>
                    )}

                  </div>

                  {/* PENDING ACTIONS */}
                  {request.status === "pending" && (
                    <div className="mt-6 flex flex-col gap-3 border-t border-[#eee5df] pt-5 sm:flex-row">

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleStatusChange(
                            request.id,
                            "accepted"
                          )
                        }
                        className="rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a9704e] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Accept Request"}
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleStatusChange(
                            request.id,
                            "cancelled"
                          )
                        }
                        className="rounded-xl border border-[#d8c8bc] px-5 py-3 text-sm font-bold text-[#8b5e3c] transition hover:bg-[#f7eee8] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Decline Request"}
                      </button>

                    </div>
                  )}

                  {/* ACCEPTED */}
                  {request.status === "accepted" && (
                    <div className="mt-6 border-t border-[#eee5df] pt-5">

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleStatusChange(
                            request.id,
                            "on_the_way"
                          )
                        }
                        className="rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a9704e] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating
                          ? "Updating..."
                          : "I'm On the Way"}
                      </button>

                    </div>
                  )}

                  {/* ON THE WAY */}
                  {request.status === "on_the_way" && (
                    <div className="mt-6 border-t border-[#eee5df] pt-5">

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleStatusChange(
                            request.id,
                            "arrived"
                          )
                        }
                        className="rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a9704e] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating
                          ? "Updating..."
                          : "I've Arrived"}
                      </button>

                    </div>
                  )}

                  {/* ARRIVED */}
                  {request.status === "arrived" && (
                    <div className="mt-6 border-t border-[#eee5df] pt-5">

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleStatusChange(
                            request.id,
                            "in_progress"
                          )
                        }
                        className="rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a9704e] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Start Repair"}
                      </button>

                    </div>
                  )}

                  {/* IN PROGRESS */}
                  {request.status === "in_progress" && (
                    <div className="mt-6 border-t border-[#eee5df] pt-5">

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          handleStatusChange(
                            request.id,
                            "completed"
                          )
                        }
                        className="rounded-xl bg-[#b9825f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a9704e] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Mark Completed"}
                      </button>

                    </div>
                  )}

                </article>
              );
            })}

          </div>
        )}

    </section>
  );
}

export default RepairerDashboard;
