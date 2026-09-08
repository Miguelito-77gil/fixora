import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

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

  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const menuItems = [
    {
      label: "Dashboard",
      path: "/repairer/dashboard",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      ),
    },
    {
      label: "Messages",
      path: "/messages",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 5.75A2.75 2.75 0 0 1 6.75 3h10.5A2.75 2.75 0 0 1 20 5.75v8.5A2.75 2.75 0 0 1 17.25 17H10l-4.5 4v-4.15A2.75 2.75 0 0 1 4 14.25v-8.5Z"
          />
        </svg>
      ),
    },
    {
      label: "My Profile",
      path: "/profile",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <circle cx="12" cy="8" r="3.5" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 20a7 7 0 0 1 14 0"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f3ef] text-[#2f241e]">

      {/* MOBILE TOP BAR */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#e5d9d0] bg-white px-5 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e1d4ca] bg-white text-[#6f4b36]"
          aria-label="Open menu"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <span className="text-lg font-semibold tracking-tight text-[#2f241e]">
          Fixora
        </span>

        <button
          type="button"
          onClick={() => setNotificationOpen((current) => !current)}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e1d4ca] bg-white text-[#8b5e3c]"
          aria-label="Notifications"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 18.75a3 3 0 0 1-6 0m9-4.5H6a1.5 1.5 0 0 1-1.5-1.5v-.75a7.5 7.5 0 0 1 15 0v.75a1.5 1.5 0 0 1-1.5 1.5Z"
            />
          </svg>

          {unreadNotificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b9825f] px-1 text-[9px] font-medium text-white">
              {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
            </span>
          )}
        </button>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-[60] flex w-64 flex-col border-r border-[#e4d8cf] bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center border-b border-[#eee5df] px-7">
          <div>
            <p className="text-xl font-semibold tracking-tight text-[#2f241e]">
              Fixora
            </p>
            <p className="mt-0.5 text-xs text-[#a28f83]">
              Repairer workspace
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-[#8b776b] hover:bg-[#f7eee8] lg:hidden"
            aria-label="Close menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6">
          <p className="px-3 pb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-[#a28f83]">
            Workspace
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                    isActive
                      ? "bg-[#f5e9e0] font-medium text-[#8b5e3c]"
                      : "text-[#75675f] hover:bg-[#faf6f2] hover:text-[#2f241e]"
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>

                {item.label === "Messages" && messageCount > 0 && (
                  <span className="ml-auto rounded-full bg-[#b9825f] px-2 py-0.5 text-[10px] font-medium text-white">
                    {messageCount > 99 ? "99+" : messageCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="border-t border-[#eee5df] p-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#75675f] transition hover:bg-[#faf6f2] hover:text-[#2f241e]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 6.75 20.25 12 15 17.25M20 12H9"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4.5v15"
              />
            </svg>
            <span>Back to Home</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="min-h-screen lg:pl-64">

        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-10">

          {/* HEADER */}
          <header className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-[#b9825f]">
                Repairer Dashboard
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#2f241e] sm:text-4xl">
                Dashboard
              </h1>

              <p className="mt-2 text-sm text-[#75675f]">
                Manage your repair requests and keep track of your work.
              </p>
            </div>

            {/* DESKTOP NOTIFICATION */}
            <div className="relative hidden shrink-0 lg:block">
              <button
                type="button"
                onClick={() => {
                  setNotificationOpen((current) => !current);

                  if (!notificationOpen) {
                    loadNotifications();
                  }
                }}
                aria-label="Notifications"
                title="Notifications"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#e1d4ca] bg-white text-[#8b5e3c] shadow-sm transition hover:bg-[#f7eee8]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 18.75a3 3 0 0 1-6 0m9-4.5H6a1.5 1.5 0 0 1-1.5-1.5v-.75a7.5 7.5 0 0 1 15 0v.75a1.5 1.5 0 0 1-1.5 1.5Z"
                  />
                </svg>

                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#b9825f] px-1 text-[9px] font-medium leading-none text-white">
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATIONS */}
              {notificationOpen && (
                <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-[#e4d9d0] bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#eee5df] px-4 py-3">
                    <h2 className="text-sm font-semibold text-[#2f241e]">
                      Notifications
                    </h2>

                    {unreadNotificationCount > 0 && (
                      <span className="text-xs font-medium text-[#b9825f]">
                        {unreadNotificationCount} new
                      </span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notificationLoading ? (
                      <div className="px-4 py-8 text-center text-sm text-[#75675f]">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-[#75675f]">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() =>
                            handleNotificationClick(notification)
                          }
                          className={`block w-full border-b border-[#f1e9e3] px-4 py-3 text-left transition hover:bg-[#faf6f2] ${
                            !notification.is_read ? "bg-[#fdf8f4]" : ""
                          }`}
                        >
                          <div className="flex gap-3">
                            <span
                              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                                !notification.is_read
                                  ? "bg-[#b9825f]"
                                  : "bg-[#d8c8bc]"
                              }`}
                            />

                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#2f241e]">
                                {notification.title ||
                                  notification.type ||
                                  "Notification"}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-[#75675f]">
                                {notification.message ||
                                  notification.body ||
                                  "You have a new notification."}
                              </p>

                              {notification.created_at && (
                                <p className="mt-1 text-[10px] text-[#a28f83]">
                                  {new Date(
                                    notification.created_at
                                  ).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* STATS */}
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#e4d9d0] bg-white p-5 shadow-sm"
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

          {/* REQUEST AREA */}
          <section className="mt-10">

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
              <div className="mt-5 rounded-2xl border border-[#e4d9d0] bg-white px-6 py-16 text-center shadow-sm">
                <p className="text-sm text-[#75675f]">
                  Loading repair requests...
                </p>
              </div>
            )}

            {/* ERROR */}
            {!loading && error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-5">
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
            {!loading && !error && requests.length === 0 && (
              <div className="mt-5 rounded-2xl border border-dashed border-[#d8c8bc] bg-white px-6 py-20 text-center">
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

                <h3 className="mt-4 text-lg font-semibold text-[#2f241e]">
                  No repair requests yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#75675f]">
                  Customer requests assigned to you will appear here.
                </p>
              </div>
            )}

            {/* REQUESTS */}
            {!loading && !error && requests.length > 0 && (
              <div className="mt-5 space-y-4">
                {requests.map((request, index) => {
                  const description = String(request.description || "");

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

                  const notes =
                    getDetail(description, "Additional notes");

                  const schedule =
                    getDetail(description, "Preferred schedule");

                  const isUpdating = updatingId === request.id;

                  return (
                    <article
                      key={request.id}
                      className="overflow-hidden rounded-2xl border border-[#e4d9d0] bg-white shadow-sm transition hover:shadow-md"
                    >
                      {/* REQUEST HEADER */}
                      <div className="border-b border-[#eee5df] px-5 py-5 sm:px-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                                {request.customer_name || "Customer"}
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

                      {/* REQUEST DETAILS */}
                      <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
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
                        <div className="flex flex-col gap-3 border-t border-[#eee5df] bg-[#fcfaf8] px-5 py-4 sm:flex-row sm:px-6">
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
        </div>
      </main>
    </div>
  );
}

export default RepairerDashboard;