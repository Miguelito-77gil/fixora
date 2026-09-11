import { useEffect, useState } from "react";
import {
  fetchNotifications,
  markNotificationRead,
} from "@/services/marketplaceService";

function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  async function load() {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch {
      setNotifications([]);
    }
  }

  useEffect(() => {
    load();

    const interval = setInterval(load, 15000);

    return () => clearInterval(interval);
  }, []);

  const unread = notifications.filter((item) => !item.is_read).length;

  async function readNotification(id) {
    try {
      await markNotificationRead(id);
      setNotifications((items) =>
        items.map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        )
      );
    } catch {}
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd7d0] bg-white text-[#26313b] transition hover:border-[#b9825f]"
      >
        <span className="text-lg">N</span>

        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b9825f] px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-[#ddd7d0] bg-white shadow-xl">
          <div className="border-b border-[#eee9e4] px-4 py-3">
            <p className="font-bold text-[#17202a]">Notifications</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-5 text-sm text-[#777f86]">
                No notifications yet.
              </p>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => readNotification(item.id)}
                  className={`block w-full border-b border-[#eee9e4] px-4 py-3 text-left transition hover:bg-[#f7f3ef] ${
                    !item.is_read ? "bg-[#fbf7f3]" : ""
                  }`}
                >
                  <p className="text-sm font-bold text-[#26313b]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#777f86]">
                    {item.message}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;

