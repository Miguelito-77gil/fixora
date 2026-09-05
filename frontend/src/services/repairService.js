const API_URL = "http://localhost:5000";

function getToken() {
  return localStorage.getItem("fixora_token");
}

async function handleResponse(response, fallbackMessage) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || fallbackMessage);
  }

  return data;
}

// CUSTOMER

export async function createRepairRequest({
  repairerId,
  service,
  description,
}) {
  const token = getToken();

  const response = await fetch(`${API_URL}/api/repair-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      repairer_id: repairerId,
      service,
      description,
    }),
  });

  return handleResponse(response, "Failed to create repair request");
}

export async function fetchMyRepairRequests() {
  const token = getToken();

  const response = await fetch(`${API_URL}/api/repair-requests/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await handleResponse(
    response,
    "Failed to fetch repair requests"
  );

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((request) => {
    const description = String(request.description || "");

    const getDetail = (label) => {
      const line = description
        .split("\n")
        .find((item) => item.startsWith(`${label}:`));

      return line ? line.replace(`${label}:`, "").trim() : "";
    };

    return {
      ...request,

      // Backend fields -> fields used by the dashboard/card
      repairerName: request.repairer_name || "Not specified",
      category:
        getDetail("Category") ||
        request.repairer_category ||
        request.service ||
        "Repair Service",

      itemName: getDetail("Item") || request.service || "Repair Request",

      location: getDetail("Location") || "Not specified",

      schedule: getDetail("Preferred schedule") || null,

      problem: getDetail("Problem") || description || "No problem description provided.",

      notes: getDetail("Additional notes") || "",

      photoName: getDetail("Photo") || "",

      repairerPhoto: request.repairer_photo || null,
      repairerPhone: request.repairer_phone || null,
      customerPhone: request.customer_phone || null,
      customerName: request.customer_name || null,
    };
  });
}

export async function cancelRepairRequest(id) {
  const token = getToken();

  const response = await fetch(`${API_URL}/api/repair-requests/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: "cancelled",
    }),
  });

  return handleResponse(response, "Failed to cancel repair request");
}

// REPAIRER

export async function updateRepairRequestStatus(id, status) {
  const token = getToken();

  const response = await fetch(`${API_URL}/api/repair-requests/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status,
    }),
  });

  return handleResponse(response, "Failed to update repair request");
}

// REVIEWS

export async function createReview({
  repairRequestId,
  rating,
  comment,
}) {
  const token = getToken();

  const response = await fetch(`${API_URL}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      repair_request_id: repairRequestId,
      rating,
      comment,
    }),
  });

  return handleResponse(response, "Failed to submit review");
}

export async function fetchRepairerReviews(repairerId) {
  const response = await fetch(
    `${API_URL}/api/repairers/${repairerId}/reviews`
  );

  return handleResponse(response, "Failed to fetch repairer reviews");
}




