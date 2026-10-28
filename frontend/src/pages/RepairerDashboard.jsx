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
    } catch {
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
      setError("");

      await updateRepairRequestStatus(id, status);

      await Promise.all([
        loadRequests(),
        loadStats(),
        loadNotifications(),
      ]);
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

  function formatStatus(status) {
    return String(status || "pending")
      .replaceAll("_", " ")
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
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-5 w-5"
        >
          <circle cx="12" cy="12" r="8.5" />
          <path strokeLinecap="round" d="M12 7.5v4.8l3 1.8" />
        </svg>
      ),
    },
    {
      label: "Active Repairs",
      value: stats.active,
      description: "Repairs currently in progress",
      icon: (
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
            d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4.5 16.5a2.12 2.12 0 0 0 3 3l4.8-4.8a4 4 0 0 0 5.4-5.4l-2.1 2.1-3-3 2.1-2.1Z"
          />
        </svg>
      ),
    },
    {
      label: "Completed",
      value: stats.completed,
      description: "Successfully completed repairs",
      icon: (
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
            d="m7 12.5 3.2 3.2L17.5 8.5"
          />
          <circle cx="12" cy="12" r="8.5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-full bg-[#f7f7f5] text-[#17202a]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-[#e7e0da] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#75675f]">
              Repairer Workspace
            </p>

            <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#17202a] sm:text-4xl">
              {notificationOpen ? "Notifications" : "Dashboard"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#75675f]">
              {notificationOpen
                ? "Stay updated with your latest repair activity."
                : "Manage your repair requests and keep track of your work."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setNotificationOpen(false);
                loadRequests();
                loadStats();
              }}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                !notificationOpen
                  ? "bg-[#f5e9e0] text-[#17202a]"
                  : "text-[#75675f] hover:bg-white"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-5 w-5"
              >
                <rect x="4" y="4" width="6" height="6" rx="1" />
                <rect x="14" y="4" width="6" height="6" rx="1" />
                <rect x="4" y="14" width="6" height="6" rx="1" />
                <rect x="14" y="14" width="6" height="6" rx="1" />
              </svg>
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => {
                setNotificationOpen(true);
                loadNotifications();
              }}
              className={`relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                notificationOpen
                  ? "bg-[#f5e9e0] text-[#17202a]"
                  : "text-[#75675f] hover:bg-white"
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

              Notifications

              {unreadNotificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#17202a] px-1 text-[9px] text-white">
                  {unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/repairer/messages", {
                  state: { from: "repairer-dashboard" },
                })
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#5f5751] shadow-sm ring-1 ring-[#e7e0da] transition hover:bg-[#f7f2ee]"
              aria-label="Messages"
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
                  d="M5 5.75h14A1.75 1.75 0 0 1 20.75 7.5v8A1.75 1.75 0 0 1 19 17.25H10l-4.75 3v-3.15A1.75 1.75 0 0 1 3.25 15.5v-8A1.75 1.75 0 0 1 5 5.75Z"
                />
              </svg>

              {messageCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#17202a] px-1 text-[9px] text-white">
                  {messageCount > 99 ? "99+" : messageCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {notificationOpen ? (
          <section className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#75675f]">
                  Updates
                </p>

                <h2 className="mt-1.5 text-2xl font-medium text-[#17202a]">
                  Your Notifications
                </h2>
              </div>

              <button
                type="button"
                onClick={loadNotifications}
                className="rounded-xl bg-white px-4 py-2.5 text-xs text-[#5f5751] shadow-sm ring-1 ring-[#e7e0da] transition hover:bg-[#f7f2ee]"
              >
                Refresh
              </button>
            </div>

            {notificationLoading ? (
              <div className="mt-6 rounded-3xl bg-white px-6 py-20 text-center shadow-sm ring-1 ring-[#e7e0da]">
                <p className="text-sm text-[#75675f]">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-[#d9d1cb] bg-white px-6 py-24 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5e9e0] text-[#5f5751]">
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

                <h3 className="mt-4 text-xl font-medium text-[#17202a]">
                  No notifications yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75675f]">
                  You don't have any new notifications at the moment.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`block w-full rounded-2xl bg-white p-5 text-left shadow-sm ring-1 transition hover:shadow-md ${
                      notification.is_read
                        ? "ring-[#e7e0da]"
                        : "bg-[#fcfaf8] ring-[#d9d1cb]"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5e9e0] text-[#5f5751]">
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
                          <h3 className="text-sm font-medium text-[#17202a]">
                            {notification.title ||
                              notification.type ||
                              "Notification"}
                          </h3>

                          {!notification.is_read && (
                            <span className="w-fit rounded-full bg-[#f5e9e0] px-2.5 py-1 text-[10px] text-[#5f5751]">
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
                          <p className="mt-3 text-[11px] text-[#958a82]">
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
            <section className="mt-8 grid gap-4 sm:grid-cols-3">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e7e0da] sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5e9e0] text-[#5f5751]">
                      {stat.icon}
                    </div>

                    <span className="text-3xl font-medium tracking-tight text-[#17202a]">
                      {stat.value}
                    </span>
                  </div>

                  <p className="mt-5 text-sm font-medium text-[#17202a]">
                    {stat.label}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#75675f]">
                    {stat.description}
                  </p>
                </div>
              ))}
            </section>

            <section className="mt-10">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#75675f]">
                    Work Queue
                  </p>

                  <h2 className="mt-1.5 text-2xl font-medium text-[#17202a]">
                    Repair Requests
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={loadRequests}
                  className="hidden rounded-xl bg-white px-4 py-2.5 text-xs text-[#5f5751] shadow-sm ring-1 ring-[#e7e0da] transition hover:bg-[#f7f2ee] sm:block"
                >
                  Refresh
                </button>
              </div>

              {loading && (
                <div className="mt-6 rounded-3xl bg-white px-6 py-20 text-center shadow-sm ring-1 ring-[#e7e0da]">
                  <p className="text-sm text-[#75675f]">
                    Loading repair requests...
                  </p>
                </div>
              )}

              {!loading && error && (
                <div className="mt-6 rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-[#e7e0da]">
                  <p className="text-sm text-[#5f5751]">{error}</p>

                  <button
                    type="button"
                    onClick={loadRequests}
                    className="mt-4 rounded-xl bg-[#17202a] px-4 py-2.5 text-sm text-white transition hover:bg-[#28323b]"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && requests.length === 0 && (
                <div className="mt-6 rounded-3xl border border-dashed border-[#d9d1cb] bg-white px-6 py-24 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5e9e0] text-[#5f5751]">
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

                  <h3 className="mt-4 text-xl font-medium text-[#17202a]">
                    No repair requests yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75675f]">
                    Customer requests assigned to you will appear here.
                  </p>
                </div>
              )}

              {!loading && !error && requests.length > 0 && (
                <div className="mt-6 space-y-4">
                  {requests.map((request) => {
                    const description = String(request.description || "");

                    const item =
                      getDetail(description, "Item") ||
                      request.service ||
                      "Repair Request";

                    const category =
                      getDetail(description, "Category") ||
                      request.repairer_category ||
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

                    const customerName =
                      request.customerName ||
                      request.customer_name ||
                      request.customer?.name ||
                      "Customer";

                    const isUpdating = updatingId === request.id;

                    return (
                      <article
                        key={request.id}
                        className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#e7e0da]"
                      >
                        <div className="flex flex-col gap-4 border-b border-[#eee8e3] px-5 py-5 sm:px-6 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] uppercase tracking-[0.16em] text-[#75675f]">
                                Request #{request.id}
                              </span>

                              <span className="rounded-full bg-[#f5e9e0] px-2.5 py-1 text-[10px] text-[#5f5751]">
                                {formatStatus(request.status)}
                              </span>
                            </div>

                            <h3 className="mt-2 text-xl font-medium text-[#17202a]">
                              {item}
                            </h3>

                            <p className="mt-1 text-sm text-[#75675f]">
                              Customer:{" "}
                              <span className="text-[#4d4742]">
                                {customerName}
                              </span>
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              navigate("/repairer/messages", {
                                state: {
                                  from: "repairer-dashboard",
                                  customerId:
                                    request.customer_id ||
                                    request.customer?.id,
                                },
                              })
                            }
                            className="relative flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-xl bg-[#f7f2ee] text-[#5f5751] transition hover:bg-[#f5e9e0]"
                            aria-label="Messages"
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
                                d="M5 5.75h14A1.75 1.75 0 0 1 20.75 7.5v8A1.75 1.75 0 0 1 19 17.25H10l-4.75 3v-3.15A1.75 1.75 0 0 1 3.25 15.5v-8A1.75 1.75 0 0 1 5 5.75Z"
                              />
                            </svg>

                            {messageCount > 0 && (
                              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#17202a] px-1 text-[9px] text-white">
                                {messageCount > 99 ? "99+" : messageCount}
                              </span>
                            )}
                          </button>
                        </div>

                        <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a817b]">
                              Category
                            </p>
                            <p className="mt-1.5 text-sm text-[#17202a]">
                              {category}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a817b]">
                              Location
                            </p>
                            <p className="mt-1.5 text-sm text-[#17202a]">
                              {location}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a817b]">
                              Schedule
                            </p>
                            <p className="mt-1.5 text-sm text-[#17202a]">
                              {formatSchedule(schedule)}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a817b]">
                              Service
                            </p>
                            <p className="mt-1.5 text-sm text-[#17202a]">
                              {request.service || category}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-[#eee8e3] px-5 py-5 sm:px-6">
                          <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a817b]">
                            Problem
                          </p>

                          <p className="mt-2 text-sm leading-6 text-[#4d4742]">
                            {problem}
                          </p>

                          {notes && (
                            <div className="mt-4">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-[#8a817b]">
                                Additional Notes
                              </p>

                              <p className="mt-2 text-sm leading-6 text-[#4d4742]">
                                {notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {request.status === "pending" && (
                          <div className="flex flex-col gap-3 border-t border-[#eee8e3] bg-[#fcfaf8] px-5 py-4 sm:flex-row sm:px-6">
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleStatusChange(
                                  request.id,
                                  "accepted"
                                )
                              }
                              className="rounded-xl bg-[#17202a] px-5 py-2.5 text-sm text-white transition hover:bg-[#28323b] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUpdating ? "Updating..." : "Accept Request"}
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
                              className="rounded-xl bg-white px-5 py-2.5 text-sm text-[#5f5751] ring-1 ring-[#d9d1cb] transition hover:bg-[#f7f2ee] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Decline Request
                            </button>
                          </div>
                        )}

                        {request.status === "accepted" && (
                          <div className="border-t border-[#eee8e3] bg-[#fcfaf8] px-5 py-4 sm:px-6">
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleStatusChange(
                                  request.id,
                                  "in_progress"
                                )
                              }
                              className="rounded-xl bg-[#17202a] px-5 py-2.5 text-sm text-white transition hover:bg-[#28323b] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUpdating ? "Updating..." : "Start Repair"}
                            </button>
                          </div>
                        )}

                        {request.status === "in_progress" && (
                          <div className="border-t border-[#eee8e3] bg-[#fcfaf8] px-5 py-4 sm:px-6">
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleStatusChange(request.id, "completed")
                              }
                              className="rounded-xl bg-[#17202a] px-5 py-2.5 text-sm text-white transition hover:bg-[#28323b] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUpdating ? "Updating..." : "Mark Completed"}
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
  );
}

export default RepairerDashboard;