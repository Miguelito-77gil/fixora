import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://fixora-backend-kw9p.onrender.com";

function getToken() {
  return localStorage.getItem("fixora_token");
}

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CustomerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [readingId, setReadingId] = useState(null);

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/marketplace/notifications`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Failed to load notifications");
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Server returned ${response.status}`
        );
      }

      setNotifications(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.notifications)
            ? data.notifications
            : []
      );
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id) {
    try {
      setReadingId(id);

      const response = await fetch(
        `${API_URL}/api/marketplace/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read_at: notification.read_at || new Date().toISOString(),
                is_read: true,
                read: true,
              }
            : notification
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update notification");
    } finally {
      setReadingId(null);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.read_at &&
      !notification.is_read &&
      !notification.read
  ).length;

  return (
    <div className="min-h-screen bg-[#f7f7f5] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#8a817b]">
              Customer Center
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[#17202a]">
              Notifications
            </h1>
          </div>

          {unreadCount > 0 && (
            <div className="rounded-full border border-[#e7e0da] bg-white px-4 py-2 text-sm font-medium text-[#75675f]">
              {unreadCount} unread
            </div>
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-[#e7e0da] bg-white p-4 text-sm text-[#75675f]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-[#e7e0da] bg-white p-10 text-center text-[#8a817b]">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-[#e7e0da] bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5e9e0] text-2xl">
              🔔
            </div>

            <h2 className="text-lg font-semibold text-[#17202a]">
              No notifications yet
            </h2>

            <p className="mt-2 text-sm text-[#8a817b]">
              You’ll see updates about your repair requests here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const unread =
                !notification.read_at &&
                !notification.is_read &&
                !notification.read;

              return (
                <div
                  key={notification.id}
                  className={`rounded-2xl border border-[#e7e0da] bg-white p-5 transition ${
                    unread ? "border-l-4 border-l-[#75675f]" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f5e9e0] text-lg">
                      🔔
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="font-semibold text-[#17202a]">
                            {notification.title ||
                              notification.data?.title ||
                              "Fixora Notification"}
                          </h2>

                          <p className="mt-1 text-sm leading-6 text-[#75675f]">
                            {notification.message ||
                              notification.data?.message ||
                              notification.body ||
                              "You have a new notification."}
                          </p>
                        </div>

                        {unread && (
                          <span className="w-fit rounded-full bg-[#f5e9e0] px-3 py-1 text-xs font-medium text-[#75675f]">
                            New
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-col gap-3 border-t border-[#eee9e5] pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs text-[#8a817b]">
                          {formatDate(
                            notification.created_at ||
                              notification.createdAt
                          )}
                        </span>

                        {unread && (
                          <button
                            type="button"
                            onClick={() => markAsRead(notification.id)}
                            disabled={readingId === notification.id}
                            className="w-fit rounded-xl border border-[#e7e0da] bg-[#f7f2ee] px-4 py-2 text-sm font-medium text-[#17202a] transition hover:bg-[#f5e9e0] disabled:opacity-50"
                          >
                            {readingId === notification.id
                              ? "Updating..."
                              : "Mark as read"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}