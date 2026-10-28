const API_URL = import.meta.env.VITE_API_URL || "https://fixora-backend-kw9p.onrender.com";

function getToken() {
  return localStorage.getItem("fixora_token");
}

async function handleResponse(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  let data = null;

  if (contentType.includes("application/json")) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(fallbackMessage);
    }
  } else {
    throw new Error(
      response.ok
        ? fallbackMessage
        : `Server returned ${response.status}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      fallbackMessage
    );
  }

  return data;
}


// ============================================
// CUSTOMER
// ============================================

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
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      repairer_id: repairerId,
      service,
      description,
    }),
  });

  return handleResponse(
    response,
    "Failed to create repair request"
  );
}


export async function fetchMyRepairRequests() {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/api/repair-requests/mine`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await handleResponse(
    response,
    "Failed to fetch repair requests"
  );

  const requests = Array.isArray(data)
    ? data
    : Array.isArray(data?.requests)
      ? data.requests
      : [];

  return requests.map((request) => {
    const description = String(
      request.description || ""
    );

    const getDetail = (label) => {
      const line = description
        .split("\n")
        .find((item) =>
          item.startsWith(`${label}:`)
        );

      return line
        ? line.replace(`${label}:`, "").trim()
        : "";
    };

    const repairer = request.repairer || {};
    const customer = request.customer || {};
    const repairerProfile =
      repairer.repairer_profile || {};

    return {
      ...request,

      // --------------------------------------
      // REPAIRER
      // --------------------------------------

      repairerId:
        repairer.id ||
        request.repairer_id ||
        null,

      repairerName:
        repairer.name ||
        request.repairer_name ||
        "Not specified",

      repairerPhone:
        repairer.phone ||
        request.repairer_phone ||
        null,

      repairerPhoto:
        repairer.photo_url ||
        request.repairer_photo ||
        null,

      repairerCategory:
        repairerProfile.category ||
        request.repairer_category ||
        request.service ||
        "Repair Service",

      // --------------------------------------
      // CUSTOMER
      // --------------------------------------

      customerName:
        customer.name ||
        request.customer_name ||
        null,

      customerPhone:
        customer.phone ||
        request.customer_phone ||
        null,

      // --------------------------------------
      // REQUEST
      // --------------------------------------

      category:
        getDetail("Category") ||
        repairerProfile.category ||
        request.repairer_category ||
        request.service ||
        "Repair Service",

      itemName:
        getDetail("Item") ||
        request.service ||
        "Repair Request",

      location:
        getDetail("Location") ||
        "Not specified",

      schedule:
        getDetail("Preferred schedule") ||
        null,

      problem:
        getDetail("Problem") ||
        description ||
        "No problem description provided.",

      notes:
        getDetail("Additional notes") ||
        "",

      photoName:
        getDetail("Photo") ||
        "",

      // --------------------------------------
      // REVIEW
      // --------------------------------------

      has_review:
          Boolean(request.has_review) ||
          Boolean(request.review),

        review:
          request.review || null,
    };
  });
}


export async function cancelRepairRequest(id) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/api/repair-requests/${id}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: "cancelled",
      }),
    }
  );

  return handleResponse(
    response,
    "Failed to cancel repair request"
  );
}


// ============================================
// REPAIRER
// ============================================

export async function updateRepairRequestStatus(
  id,
  status
) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/api/repair-requests/${id}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  return handleResponse(
    response,
    "Failed to update repair request"
  );
}


// ============================================
// REVIEWS
// ============================================

export async function createReview({
  repairRequestId,
  rating,
  comment,
}) {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/api/reviews`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        repair_request_id: repairRequestId,
        rating,
        comment,
      }),
    }
  );

  return handleResponse(
    response,
    "Failed to submit review"
  );
}


export async function fetchRepairerReviews(
  repairerId
) {
  const response = await fetch(
    `${API_URL}/api/repairers/${repairerId}/reviews`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  return handleResponse(
    response,
    "Failed to fetch repairer reviews"
  );
}

