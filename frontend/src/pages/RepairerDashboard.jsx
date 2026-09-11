import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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
  const { logout } = useAuth();

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
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
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
            d="M4 5.75A2.75 2.75 0 0 1 6.75 3h10.5A2.75 2.75 0 0 1 20 5.75v8.5A2.75 2.75 0 0 1 17.25 17H10l-4.5 4v-4.15A2.75 2.75 0 0 1 4 14.25v-8.5Z"
          />
        </svg>
      ),
    },
    {
      label: "My Profile",
      path: "/profile",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <circle cx="12" cy="8" r="3.5" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 20a7 7 0 0 1 14 0"
          />
        </svg>
      ),
    },    {
      label: "My Services",
      path: "/repairer/services",
      icon: (
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
            d="M4.5 7.5h15M6.75 4.5h10.5A2.25 2.25 0 0 1 19.5 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 17.25V6.75A2.25 2.25 0 0 1 6.75 4.5Z"
          />
          <path
            strokeLinecap="round"
            d="M8 11.5h8M8 15h5"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
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
              <path
                strokeLinecap="round"
                d="M4 7h16M4 12h16M4 17h16"
              />
            </svg>
          </button>

          <span className="text-lg font-semibold tracking-tight text-[#2f241e]">
            Repairer Dashboard
          </span>

          <div className="h-10 w-10" aria-hidden="true" />
        </div>

        {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-[60] flex w-64 flex-col border-r border-[#e4d8cf] bg-white transition-transform duration-200 lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >

          {/* MOBILE CLOSE */}
          <div className="flex h-16 items-center justify-end px-5 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#8b776b] transition hover:bg-[#f7eee8]"
              aria-label="Close menu"
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
                  d="M6 6l12 12M18 6 6 18"
                />
              </svg>
            </button>
          </div>

          {/* MENU */}
          <nav className="flex flex-1 flex-col px-4 py-7">

            <p className="px-3 pb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-[#a28f83]">
              Menu
            </p>

            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#f5e9e0] text-[#8b5e3c]"
                        : "text-[#505961] hover:bg-[#f3eee9] hover:text-[#8b5e3c]"
                    }`
                  }
                >
                  {item.icon}

                  <span>{item.label}</span>

                  {item.label === "Messages" && messageCount > 0 && (
                    <span className="ml-auto rounded-full bg-[#b9825f] px-2 py-0.5 text-[10px] font-semibold text-white">
                      {messageCount > 99 ? "99+" : messageCount}
                    </span>
                  )}
                </NavLink>
              ))}

              {/* NOTIFICATIONS */}
              <button
                type="button"
                onClick={() => {
                  setNotificationOpen(true);
                  setSidebarOpen(false);
                  loadNotifications();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                  notificationOpen
                    ? "bg-[#f5e9e0] text-[#8b5e3c]"
                    : "text-[#505961] hover:bg-[#f3eee9] hover:text-[#8b5e3c]"
                }`}
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

                <span>Notifications</span>

                {unreadNotificationCount > 0 && (
                  <span className="ml-auto rounded-full bg-[#b9825f] px-2 py-0.5 text-[10px] font-semibold text-white">
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </button>
            </div>

            {/* LOG OUT */}
            <div className="mt-auto border-t border-[#eee5df] pt-4">
              <button
                type="button"
                onClick={() => {
                  logout();
                  setSidebarOpen(false);
                  window.location.href = "/";
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-[#505961] transition hover:bg-[#f3eee9] hover:text-[#8b5e3c]"
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

                <span>Log Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-h-screen lg:pl-64">

          <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">

            {/* PAGE HEADER */}
            <header>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9825f]">
                Repairer Dashboard
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-[#2f241e]">
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

                <div className="flex items-center justify-between gap-4">
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
                <section className="mt-10 grid gap-4 sm:grid-cols-3">
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
              </>
            )}

          </div>
        </main>
      </div>
    </>
  );
}

export default RepairerDashboard;

