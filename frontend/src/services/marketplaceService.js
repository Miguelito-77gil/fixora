const API_URL = import.meta.env.VITE_API_URL || "https://fixora-backend-kw9p.onrender.com";

function getToken() {
  return (
    localStorage.getItem("fixora_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (typeof data === "object" && data) {
      if (data.message) {
        message = data.message;
      } else if (data.error) {
        message = data.error;
      } else if (data.errors) {
        message = Object.values(data.errors)
          .flat()
          .join(" ");
      }
    }

    throw new Error(message);
  }

  return data;
}

export async function toggleFavorite(repairerId) {
  return request(`/api/marketplace/favorites/${repairerId}`, {
    method: "POST",
  });
}

export async function fetchFavorites() {
  return request("/api/marketplace/favorites");
}

export async function trackRecentlyViewed(repairerId) {
  return request(`/api/marketplace/recent/${repairerId}`, {
    method: "POST",
  });
}

export async function fetchRecentlyViewed() {
  return request("/api/marketplace/recent");
}

export async function fetchRepairerServices(repairerId) {
  try {
    return await request(`/api/marketplace/repairers/${repairerId}/services`);
  } catch (error) {
    console.error(
      `Failed to load services for repairer ${repairerId}:`,
      error
    );

    return [];
  }
}

export async function fetchChatUsers() {
  return request("/api/marketplace/chat/users");
}

export async function fetchUnreadMessages() {
  return request("/api/marketplace/chat/unread");
}

export async function fetchMessages(userId) {
  return request(`/api/marketplace/chat/${userId}`);
}

export async function sendMessage(
  userId,
  message,
  repairRequestId = null
) {
  return request(`/api/marketplace/chat/${userId}`, {
    method: "POST",
    body: JSON.stringify({
      message,
      repair_request_id: repairRequestId,
    }),
  });
}

export async function fetchNotifications() {
  return request("/api/marketplace/notifications");
}

export async function markNotificationRead(id) {
  return request(`/api/marketplace/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function fetchRepairerDashboardStats() {
  return request("/api/marketplace/repairer-dashboard");
}

export async function fetchRepairerEarnings() {
  return request("/api/marketplace/earnings");
}

export async function fetchRecommendedRepairers() {
  return request("/api/marketplace/recommended");
}

export async function fetchAdminMarketplaceStats() {
  return request("/api/marketplace/admin-dashboard");
}

export async function addRepairerService({
  name,
  description,
  starting_price,
}) {
  return request("/api/marketplace/repairer-services", {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      starting_price,
    }),
  });
}

export async function updateRepairerService(
  id,
  {
    name,
    description,
    starting_price,
  }
) {
  return request(
    `/api/marketplace/repairer-services/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name,
        description,
        starting_price,
      }),
    }
  );
}

export async function deleteRepairerService(id) {
  return request(
    `/api/marketplace/repairer-services/${id}`,
    {
      method: "DELETE",
    }
  );
}

