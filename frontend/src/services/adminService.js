import { getToken } from "@/services/authService";

const API_URL = "http://localhost:5000";

export async function fetchPendingRepairers() {
  const token = getToken();

  const response = await fetch(`${API_URL}/api/admin/repairers?status=pending`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch repairers");
  }

  return data;
}

export async function verifyRepairer(id, status) {
  const token = getToken();

  const response = await fetch(`${API_URL}/api/admin/repairers/${id}/verify`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update status");
  }

  return data;
}