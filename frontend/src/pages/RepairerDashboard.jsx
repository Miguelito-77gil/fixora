import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchMyRepairRequests,
  updateRepairRequestStatus,
} from "@/services/repairService";

import {
  fetchUnreadMessages,
  fetchNotifications,
  markNotificationRead,
  fetchRepairerDashboardStats,
} from "@/services/marketplaceService";

function RepairerDashboard() {
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const [messageCount, setMessageCount] = useState(0);

  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    completed: 0,
  });

  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  async function loadRequests() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchMyRepairRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load repair requests:", err);
      setError(err.message || "Failed to load repair requests.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMessageCount() {
    try {
      const data = await fetchUnreadMessages();
      setMessageCount(Number(data?.count || 0));
    } catch (err) {
      console.error("Failed to load unread messages:", err);
      setMessageCount(0);
    }
  }

  async function loadStats() {
    try {
      const data = await fetchRepairerDashboardStats();
      const source = data?.data || data || {};

      setStats({
        pending: Number(
          source.pending ??
          source.pending_requests ??
          source.pendingRequests ??
          0
        ),
        active: Number(
          source.active ??
          source.active_repairs ??
          source.activeRepairs ??
          source.in_progress ??
          0
        ),
        completed: Number(
          source.completed ??
          source.completed_repairs ??
          source.completedRepairs ??
          0
        ),
      });
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    }
  }

  async function loadNotifications() {
    try {
      setNotificationLoading(true);

      const data = await fetchNotifications();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.notifications)
            ? data.notifications
            : [];

      setNotifications(list);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  }

  async function handleNotificationClick(notification) {
    if (!notification?.is_read && notification?.id) {
      try {
        await markNotificationRead(notification.id);

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true }
              : item
          )
        );
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
  }

  async function handleStatusChange(id, status) {
    try {
      setUpdatingId(id);

      await updateRepairRequestStatus(id, status);

      await loadRequests();
      await loadStats();
    } catch (err) {
      console.error("Failed to update request:", err);
      setError(err.message || "Failed to update request.");
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    loadRequests();
    loadMessageCount();
    loadStats();
    loadNotifications();

    const interval = setInterval(() => {
      loadMessageCount();
      loadStats();
      loadNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  function getStatusStyle(status) {
    switch (status) {
      case "accepted":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "in_progress":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "completed":
        return "border-green-200 bg-green-50 text-green-700";

      case "cancelled":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-[#dfcabb] bg-[#f8eee7] text-[#8b5e3c]";
    }
  }

  function formatStatus(status) {
    return String(status || "pending")
      .replace("_", " ")
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

    return line ? line.replace(`${label}:`, "").trim() : "";
  }

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification?.is_read
  ).length;

  const statCards = [
    {
      label: "Pending",
      value: stats.pending,
      description: "Requests waiting for action",
    },
    {
      label: "Active Repairs",
      value: stats.active,
      description: "Repairs currently in progress",
    },
    {
      label: "Completed",
      value: stats.completed,
      description: "Successfully completed repairs",
    },
  ];

  return (
    <>
      <div className="min-h-full bg-[#f7f3ef] text-[#2f241e]">

        {/* MAIN CONTENT */}
        

          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14 md:px-8">

            {/* PAGE HEADER */}
            <header>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
                Repairer Dashboard
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-[#2f241e] sm:text-4xl md:text-4xl">
                {notificationOpen ? "Notifications" : "Dashboard"}
              </h1>

              <p className="mt-3 max-w-2xl text-[#75675f]">
                {notificationOpen
                  ? "Stay updated with your latest repair activity."
                  : "Manage customer repair requests and keep track of your work."}
              </p>
            </header>

            {/* NOTIFICATIONS */}
            {notificationOpen ? (
              <section className="mt-10">

                <div className="flex items-center justify-between gap-4 md:gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9825f]">
                      Updates
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-[#2f241e]">
                      Your Notifications
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={loadNotifications}
                    className="rounded-xl border border-[#ded0c6] bg-white px-4 py-2 text-xs font-medium text-[#75675f] transition hover:bg-[#faf6f2]"
                  >
                    Refresh
                  </button>
                </div>

                {notificationLoading ? (
                  <div className="mt-6 rounded-3xl border border-[#e4d9d0] bg-white px-6 py-20 text-center">
                    <p className="text-sm text-[#75675f]">
                      Loading notifications...
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="mt-6 rounded-3xl border border-dashed border-[#d8c8bc] bg-white px-6 py-24 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5e9e0] text-[#9a6541]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 18.75a3 3 0 0 1-6 0m9-4.5H6a1.5 1.5 0 0 1-1.5-1.5v-.75a7.5 7.5 0 0 1 15 0v.75a1.5 1.5 0 0 1-1.5 1.5Z"
                        />
                      </svg>
                    </div>

                    <h3 className="mt-4 text-xl font-bold text-[#2f241e]">
                      No notifications yet
                    </h3>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#75675f]">
                      You don't have any new notifications at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                        className={`block w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
                          !notification.is_read
                            ? "border-[#d9b69f] bg-[#fdf8f4]"
                            : "border-[#e4d9d0]"
                        }`}
                      >
                        <div className="flex gap-4">

                          <div
                            className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              !notification.is_read
                                ? "bg-[#f5e9e0] text-[#9a6541]"
                                : "bg-[#f4f1ee] text-[#8b8179]"
                            }`}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              className="h-5 w-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 18.75a3 3 0 0 1-6 0m9-4.5H6a1.5 1.5 0 0 1-1.5-1.5v-.75a7.5 7.5 0 0 1 15 0v.75a1.5 1.5 0 0 1-1.5 1.5Z"
                              />
                            </svg>
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <h3 className="text-sm font-bold text-[#2f241e]">
                                {notification.title ||
                                  notification.type ||
                                  "Notification"}
                              </h3>

                              {!notification.is_read && (
                                <span className="w-fit rounded-full bg-[#b9825f] px-2.5 py-1 text-[10px] font-semibold text-white">
                                  New
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-sm leading-6 text-[#75675f]">
                              {notification.message ||
                                notification.body ||
                                "You have a new notification."}
                            </p>

                            {notification.created_at && (
                              <p className="mt-3 text-[11px] text-[#a28f83]">
                                {new Date(
                                  notification.created_at
                                ).toLocaleString()}
                              </p>
                            )}

                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <>
                {/* STATS */}
                <section className="mt-10 grid gap-4 sm:grid-cols-3 md:gap-5">
                  {statCards.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-[#e4d9d0] bg-white p-5 shadow-sm md:p-6"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9a6541]">
                          {stat.label}
                        </p>

                        <span className="h-2 w-2 rounded-full bg-[#c79778]" />
                      </div>

                      <p className="mt-4 text-3xl font-semibold text-[#2f241e]">
                        {stat.value}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#75675f]">
                        {stat.description}
                      </p>
                    </div>
                  ))}
                </section>

                {/* REPAIR REQUESTS */}
                <section className="mt-12">

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#b9825f]">
                        Work Queue
                      </p>

                      <h2 className="mt-1 text-2xl font-semibold text-[#2f241e]">
                        Repair Requests
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={loadRequests}
                      className="hidden rounded-xl border border-[#ded0c6] bg-white px-4 py-2 text-xs font-medium text-[#75675f] transition hover:bg-[#faf6f2] sm:block"
                    >
                      Refresh
                    </button>
                  </div>

                  {/* LOADING */}
                  {loading && (
                    <div className="mt-6 rounded-3xl border border-[#e4d9d0] bg-white px-6 py-20 text-center">
                      <p className="text-sm text-[#75675f]">
                        Loading repair requests...
                      </p>
                    </div>
                  )}

                  {/* ERROR */}
                  {!loading && error && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-5">
                      <p className="text-sm text-red-700">
                        {error}
                      </p>

                      <button
                        type="button"
                        onClick={loadRequests}
                        className="mt-4 rounded-xl bg-[#b9825f] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#a9704e]"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* EMPTY */}
                  {!loading &&
                    !error &&
                    requests.length === 0 && (
                      <div className="mt-6 rounded-3xl border border-dashed border-[#d8c8bc] bg-white px-6 py-24 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5e9e0] text-[#9a6541]">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            className="h-6 w-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 4.5h10.5A2.25 2.25 0 0 1 19.5 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 17.25V6.75A2.25 2.25 0 0 1 6.75 4.5Z"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 9h8M8 13h5"
                            />
                          </svg>
                        </div>

                        <h3 className="mt-4 text-xl font-bold text-[#2f241e]">
                          No repair requests yet
                        </h3>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#75675f]">
                          Customer requests assigned to you will appear here.
                        </p>
                      </div>
                    )}

                  {/* REQUESTS */}
                  {!loading &&
                    !error &&
                    requests.length > 0 && (
                      <div className="mt-6 space-y-4">
                        {requests.map((request, index) => {
                          const description = String(
                            request.description || ""
                          );

                          const item =
                            getDetail(description, "Item") ||
                            request.service ||
                            "Repair Request";

                          const category =
                            getDetail(description, "Category") ||
                            "Repair Service";

                          const location =
                            getDetail(description, "Location") ||
                            "Not specified";

                          const problem =
                            getDetail(description, "Problem") ||
                            "No problem description provided.";

                          const notes = getDetail(
                            description,
                            "Additional notes"
                          );

                          const schedule = getDetail(
                            description,
                            "Preferred schedule"
                          );

                          const isUpdating =
                            updatingId === request.id;

                          return (
                            <article
                              key={request.id}
                              className="overflow-hidden rounded-2xl border border-[#e4d9d0] bg-white shadow-sm transition hover:shadow-md"
                            >

                              {/* REQUEST HEADER */}
                              <div className="border-b border-[#eee5df] px-5 py-5 sm:px-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between md:gap-6">

                                  <div>
                                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#b9825f]">
                                      Request #{request.id}
                                    </p>

                                    <h3 className="mt-1.5 text-xl font-semibold text-[#2f241e]">
                                      {item}
                                    </h3>

                                    <p className="mt-1 text-sm text-[#75675f]">
                                      Customer:{" "}
                                      <span className="font-medium text-[#4f443d]">
                                        {request.customer_name ||
                                          "Customer"}
                                      </span>
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2">

                                    {index === 0 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          navigate("/messages", {
                                            state: {
                                              from: "repairer-dashboard",
                                            },
                                          })
                                        }
                                        aria-label="Messages"
                                        title="Messages"
                                        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#ded0c6] text-[#8b5e3c] transition hover:bg-[#f7eee8]"
                                      >
                                        {messageCount > 0 && (
                                          <span className="absolute -right-1.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-[#b9825f] px-1 text-[8px] font-medium text-white">
                                            {messageCount > 99
                                              ? "99+"
                                              : messageCount}
                                          </span>
                                        )}

                                        <svg
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.8"
                                          className="h-4 w-4"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 6.75A2.25 2.25 0 0 1 6.25 4.5h11.5A2.25 2.25 0 0 1 20 6.75v7.5a2.25 2.25 0 0 1-2.25 2.25H10l-5 3.5v-5.75A2.25 2.25 0 0 1 4 14.25v-7.5Z"
                                          />
                                        </svg>
                                      </button>
                                    )}

                                    <span
                                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                                        request.status
                                      )}`}
                                    >
                                      {formatStatus(request.status)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* DETAILS */}
                              <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6 md:grid-cols-4 md:gap-5 lg:grid-cols-4">

                                <div>
                                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a6541]">
                                    Category
                                  </p>

                                  <p className="mt-1.5 text-sm text-[#2f241e]">
                                    {category}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a6541]">
                                    Location
                                  </p>

                                  <p className="mt-1.5 text-sm text-[#2f241e]">
                                    {location}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a6541]">
                                    Schedule
                                  </p>

                                  <p className="mt-1.5 text-sm text-[#2f241e]">
                                    {formatSchedule(schedule)}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a6541]">
                                    Service
                                  </p>

                                  <p className="mt-1.5 text-sm text-[#2f241e]">
                                    {request.service || category}
                                  </p>
                                </div>

                              </div>

                              {/* PROBLEM */}
                              <div className="border-t border-[#eee5df] px-5 py-5 sm:px-6">

                                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a6541]">
                                  Problem
                                </p>

                                <p className="mt-2 text-sm leading-6 text-[#4f443d]">
                                  {problem}
                                </p>

                                {notes && (
                                  <div className="mt-4">
                                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9a6541]">
                                      Additional Notes
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-[#4f443d]">
                                      {notes}
                                    </p>
                                  </div>
                                )}

                              </div>

                              {/* ACTIONS */}
                              {request.status === "pending" && (
                                <div className="flex flex-col gap-3 border-t border-[#eee5df] bg-[#fcfaf8] px-5 py-4 sm:flex-row sm:px-6 md:gap-4">

                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleStatusChange(
                                        request.id,
                                        "accepted"
                                      )
                                    }
                                    className="rounded-xl bg-[#b9825f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#a9704e] disabled:cursor-not-allowed disabled:opacity-60"
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
                                    className="rounded-xl border border-[#d8c8bc] bg-white px-5 py-2.5 text-sm font-medium text-[#8b5e3c] transition hover:bg-[#f7eee8] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Decline Request
                                  </button>

                                </div>
                              )}

                              {request.status === "accepted" && (
                                <div className="border-t border-[#eee5df] bg-[#fcfaf8] px-5 py-4 sm:px-6">
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleStatusChange(
                                        request.id,
                                        "in_progress"
                                      )
                                    }
                                    className="rounded-xl bg-[#b9825f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#a9704e] disabled:opacity-60"
                                  >
                                    {isUpdating
                                      ? "Updating..."
                                      : "Start Repair"}
                                  </button>
                                </div>
                              )}

                              {request.status === "in_progress" && (
                                <div className="border-t border-[#eee5df] bg-[#fcfaf8] px-5 py-4 sm:px-6">
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleStatusChange(
                                        request.id,
                                        "completed"
                                      )
                                    }
                                    className="rounded-xl bg-[#b9825f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#a9704e] disabled:opacity-60"
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
              </>
            )}

          </div>
        
      </div>
    </>
  );
}

export default RepairerDashboard;




