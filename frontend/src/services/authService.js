const API_URL = import.meta.env.VITE_API_URL || "https://fixora-backend-kw9p.onrender.com";

async function parseJsonResponse(response, fallbackMessage) {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(fallbackMessage);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(fallbackMessage);
  }
}

export async function registerUser({ name, email, password }) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await parseJsonResponse(
    response,
    "Registration service unavailable."
  );

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      "Registration failed"
    );
  }

  localStorage.setItem(
    "fixora_token",
    data.token || ""
  );

  localStorage.setItem(
    "fixora_user",
    JSON.stringify(data.user)
  );

  return data;
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseJsonResponse(
    response,
    "Login service unavailable."
  );

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      "Invalid email or password."
    );
  }

  localStorage.setItem(
    "fixora_token",
    data.token || ""
  );

  localStorage.setItem(
    "fixora_user",
    JSON.stringify(data.user)
  );

  return data.user;
}

export function getCurrentUser() {
  const storedUser = localStorage.getItem("fixora_user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    logoutUser();
    return null;
  }
}

export function getToken() {
  return localStorage.getItem("fixora_token");
}

export function logoutUser() {
  localStorage.removeItem("fixora_user");
  localStorage.removeItem("fixora_token");
}

export async function fetchCurrentUserFromServer() {
  const token = getToken();

  if (!token) {
    return null;
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseJsonResponse(
    response,
    "Authentication service unavailable."
  );

  if (!response.ok) {
    logoutUser();
    return null;
  }

  return data.user || null;
}

export async function applyAsRepairer({
  category,
  bio,
  years_experience,
  location,
  price,
  phone,
}) {
  const token = getToken();

  if (!token) {
    throw new Error("You must be logged in to apply.");
  }

  const response = await fetch(`${API_URL}/api/repairers/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      category,
      bio,
      years_experience,
      location,
      price,
      phone,
    }),
  });

  const data = await parseJsonResponse(
    response,
    "Repairer application service unavailable."
  );

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      "Application failed."
    );
  }

  return data;
}

export async function fetchMyProfile() {
  const token = getToken();

  if (!token) {
    throw new Error("Not logged in.");
  }

  const response = await fetch(`${API_URL}/api/users/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseJsonResponse(
    response,
    "Profile service unavailable."
  );

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      "Failed to fetch profile."
    );
  }

  return data.user || data;
}

export async function updateMyPhone(phone) {
  const token = getToken();

  if (!token) {
    throw new Error("Not logged in.");
  }

  const response = await fetch(`${API_URL}/api/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phone }),
  });

  const data = await parseJsonResponse(
    response,
    "Profile service unavailable."
  );

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      "Failed to update mobile number."
    );
  }

  return data.user || data;
}